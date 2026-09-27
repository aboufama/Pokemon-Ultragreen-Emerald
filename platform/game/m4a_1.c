// Replaces src/m4a_1.s: the sound engine's assembly half (MusicPlayer2000,
// "m4a"): the sequencer (MPlayMain and the song commands, ply_*) and the
// mixer (SoundMain, SoundMainRAM).
//
// Ported instruction by instruction: the same integer arithmetic (32-bit
// registers, unsigned or signed compares as the branches make them, byte
// stores that truncate), the same order of reads and writes, and the same
// quirks, because the game depends on them: when a song ends, when a fanfare
// is over, how a cry sounds. The C half (src/m4a.c) is the decomp's own.
//
// Where the GBA runs code from RAM or leans on its memory map, the port does
// what the code means:
//   - SoundMainRAM is copied to IWRAM by m4aSoundInit and jumped to from
//     SoundMain; here SoundMain calls the mixer (Mix below). SoundMainRAM
//     stays a data symbol of the same size for that copy.
//   - chk_adr_r2 keeps song data from being read out of the BIOS (below
//     0x02000000 on the GBA; the game's data is never there). Linear memory
//     has no BIOS, and the game's data does lie below 0x02000000 here, so every
//     address is accepted.
//   - ply_note compares tracks' addresses to settle equal priorities (a
//     channel goes to the track at the lower address); they are compared at
//     their GBA addresses (PlatformGbaAddress), as the layout of RAM differs.
//
// The code takes the GBA's time (platform/tools/timing.py measures it on the
// ROM): the mixer's loops per sample and channel, the sequencer's per track
// and command (SoundTime below). The C functions it calls (FadeOutBody,
// TrkVolPitSet, CgbSound...) are game code, timed as such.

#include "global.h"
// m4a_internal.h declares SoundMainBTM(void), but it clears the 64 bytes its
// argument points to (Clear64byte passes it in r0).
#define SoundMainBTM SoundMainBTM_declared
#include "gba/m4a_internal.h"
#undef SoundMainBTM
#include "platform.h"

// constants/m4a_constants.inc names these; m4a_internal.h doesn't.
#define TONEDATA_TYPE_REV 0x10
#define TONEDATA_TYPE_CMP 0x20
#define SOUND_CHANNEL_SF_SPECIAL 0x20
#define WAVE_DATA_FLAG_LOOP 0xC0

#define VCOUNT_VBLANK 160
#define TOTAL_SCANLINES 228

// The ARM code's fixed point: 23 bits of fraction in a channel's position.
#define FW_ONE_SHIFT 23
#define FW_WHOLE_MASK 0x3F800000u

extern void *const gMPlayJumpTableTemplate[];
extern const u8 gClockTable[];
extern const s8 gDeltaEncodingTable[];
u32 MidiKeyToFreq(struct WaveData *wav, u8 key, u8 fineAdjust);

// m4aSoundInit copies this to SoundMainRAM_Buffer (on the GBA, the mixer's
// code, to run it from IWRAM); here the mixer is a function.
char SoundMainRAM[0x800];

// A compressed sample's block of 64 samples, decoded (SoundMainRAM_Unk2): one
// buffer for every channel; each channel remembers which block it holds in
// xpi.
static s8 sDecodingBuffer[0x40];

// ---------------------------------------------------------------- time

// CPU cycles the assembly takes on the GBA, measured on the ROM in mGBA:
// whole calls with platform/tools/timing.py, and the mixer's and the
// sequencer's paths and loops traced instruction by instruction (the time
// from label to label, fitted per iteration over the intro and the title
// screen). The mixer runs from IWRAM in ARM code; the rest is Thumb code in
// ROM, slower per instruction.

// SoundMain's own code, where it runs: the lock up to the music players'
// call (and the call), from their return to CgbSound's call, from its
// return to the jump to the mixer (where in the buffer).
#define SOUNDMAIN_PLAYERS 94
#define SOUNDMAIN_CGB 22
#define SOUNDMAIN_MIX 59
// The mixer: entry, the channels' setup and exit; the buffer cleared (16
// samples at a time) or the reverb (a sample at a time).
#define MIX_BASE 57
#define MIX_CLEAR_16 20
#define MIX_REVERB_SAMPLE 28
// Each channel's turn (its status: all a channel that isn't playing takes);
// a playing channel's envelope, volumes and loop, then its samples by path:
// a fixed-rate wave, a resampled one (moving on to the wave's next sample
// costs more, two or more samples on or back to the loop start more
// again), a compressed or reversed one (each sample fetched from the
// decoded block, a new block decoded).
#define MIX_CHANNEL 30
#define MIX_ENVELOPE 128
#define MIX_FIXED_SETUP 16
#define MIX_FIXED_SAMPLE 21
#define MIX_INTERP_SETUP 31
#define MIX_INTERP_SAMPLE 23
#define MIX_INTERP_ADVANCE 11
#define MIX_INTERP_JUMP 5
#define MIX_SPECIAL_SETUP 92
#define MIX_SPECIAL_SAMPLE 23
#define MIX_SPECIAL_ADVANCE 12
#define MIX_DECODE_CALL 34
#define MIX_DECODE_BLOCK 945
// MPlayMain: every player, every frame; a playing player (its fade and
// tempo); each tick; each track in a tick, and more if it plays; each of a
// track's notes (its gate time); a track's first tick; each command read,
// by kind (the song commands' own costs are theirs); the LFO; then the
// volume and pitch pass, per track and per channel of a track that changed.
#define MPLAY_CALL 55              // up to the next player's call (and the call)
#define MPLAY_BACK 62              // the rest of it, once the players after have run
#define MPLAY_ACTIVE 42
#define MPLAY_TICK 30
#define MPLAY_TRACK 34
#define MPLAY_TRACK_ON 62
#define MPLAY_GATE 27
#define MPLAY_CLEAR_CHAIN 4
#define MPLAY_START 40
#define MPLAY_NOTE 83
#define MPLAY_COMMAND 106
#define MPLAY_WAIT 95
#define MPLAY_LFO 63
#define MPLAY_VOLPIT_TRACK 37
#define MPLAY_VOLPIT_SET 37
#define MPLAY_VOLPIT_CHANNEL 40
#define MPLAY_VOLPIT_VOLUME 13
#define MPLAY_VOLPIT_PITCH 44
#define MPLAY_VOLPIT_PITCH_CGB 72
// The song commands: a byte of their arguments read (ld_r3_tp_adr_i and
// chk_adr_r2), then their own work.
#define PLY_READ 43
#define PLY_SET 30                // vol, pan, bend, bendr, keysh, tune, tempo: a byte stored, a flag set
#define PLY_STORE 17              // prio, lfodl: a byte stored
#define PLY_MODT 24
#define PLY_VOICE 164
#define PLY_LFO 56                // lfos, mod
#define PLY_GOTO 77
#define PLY_PATT 30
#define PLY_PEND 22
#define PLY_REPT 25
#define PLY_FINE 45
#define PLY_PORT 65
#define PLY_ENDTIE 40
#define PLY_CHANNEL 20            // fine, endtie: each of the track's channels
#define PLY_NOTE 318
#define PLY_NOTE_DS 35            // a DirectSound note: the search for a channel...
#define PLY_NOTE_DS_CHANNEL 69    // ...each channel looked at
#define PLY_NOTE_CGB 124
#define CHN_VOL_SET 62
#define CLEAR_MODM 36
#define TRACK_STOP 30
#define TRACK_STOP_CHANNEL 30
#define REAL_CLEAR_CHAIN 20
#define REAL_CLEAR_CHAIN_LINKED 20
#define SOUND_MAIN_BTM 28
#define MPLAY_JUMP_TABLE_COPY 2067
#define UMUL3232H32 32
#define SOUND_VSYNC 54
#define SOUND_VSYNC_DMA 63

// The time is added up as the code runs and passes (PlatformWaitCycles:
// the hardware catches up) before a call to C code, which takes its own
// time, and before returning to it.
static u32 sPendingCycles;

static inline void SoundTime(u32 cycles)
{
    sPendingCycles += cycles;
}

static void SoundTimeFlush(void)
{
    u32 cycles = sPendingCycles;
    sPendingCycles = 0;
    if (cycles)
        PlatformWaitCycles(cycles);
}

// The high word of a 32x32-bit product (MidiKeyToFreq's).
u32 umul3232H32(u32 multiplier, u32 multiplicand)
{
    SoundTime(UMUL3232H32);
    SoundTimeFlush();
    return (u32)(((u64)multiplier * multiplicand) >> 32);
}

// ---------------------------------------------------------------- the mixer

// One output sample into the PCM buffer at `out`: DirectSound A (the right
// volume) at out[0], B (left) PCM_DMA_BUF_SIZE on. The ARM code adds the
// sample times the volume, shifted right 8, to each byte, wrapping (it adds
// in the top byte of a rotated word).
static inline void Put(s8 *out, u32 volR, u32 volL, s32 sample)
{
    out[0] = (s8)(out[0] + ((s32)(volR * (u32)sample) >> 8));
    out[PCM_DMA_BUF_SIZE] = (s8)(out[PCM_DMA_BUF_SIZE] + ((s32)(volL * (u32)sample) >> 8));
}

// A channel's state while it is mixed: the ARM code's registers.
struct Mix
{
    s8 *out;        // r5: this frame's part of the PCM buffer
    s32 samples;    // r8: samples in a frame
    u32 volR;       // r10
    u32 volL;       // r11
    s32 count;      // r2: samples left in the wave (to its end)
    u32 pos;        // r3: the current sample's address (compressed: its index)
    u32 fw;         // r9: the position's fraction, 23 bits
    u32 loopStart;  // [sp, 0xC]: where a looping wave starts over
    s32 loopLen;    // [sp, 0x10]: its length (0: the wave doesn't loop)
    u32 step;       // r4 or r8: the position's step per output sample
    s32 cur;        // r0: the current sample
    s32 delta;      // r1: the next sample minus the current one
};

// The interpolated sample (mul lr, r9, r1; add lr, r0, lr, asr 23).
static inline s32 Interpolate(const struct Mix *m)
{
    return m->cur + ((s32)(m->fw * (u32)m->delta) >> FW_ONE_SHIFT);
}

// A wave ends: the channel stops, and the ARM code keeps its position
// (count, pointer and fraction are not stored).
static void Stop(struct SoundChannel *chan)
{
    chan->statusFlags = 0;
}

// Linear memory ends here.
#define MEMORY_END 0x08000000u

// Byte k of a compressed block at `addr`. A block past the wave's start (a
// reversed cry played to its first sample reads index -1: block 0x3FFFFFF)
// is at an address on the GBA where nothing answers, and a load there reads
// the opcode the CPU prefetched, 8 bytes past the load, the byte at the
// address's offset in the word: in SoundMainRAM_Unk2 the first two loads
// prefetch `ldrb r1, [r2], #1`, the loop's `ldrsb r0, [r6, r0]`.
static u8 BlockByte(u32 addr, u32 k)
{
    if (addr >= MEMORY_END || addr > MEMORY_END - 0x21) {
        u32 opcode = k < 2 ? 0xE4D21001u : 0xE19600D0u;
        return (u8)(opcode >> (((addr + k) & 3) * 8));
    }
    return ((const u8 *)(uintptr_t)addr)[k];
}

// SoundMainRAM_Unk2: sample `index` of a compressed wave. The wave is blocks
// of 0x21 bytes, each 64 samples: the first sample, then 4-bit steps through
// gDeltaEncodingTable (the second byte's high half is unused).
static s32 DecodeSample(struct SoundChannel *chan, u32 index)
{
    u32 block = index >> 6;
    u32 *cached = (u32 *)&chan->xpi;
    SoundTime(MIX_DECODE_CALL);
    if (block != *cached) {
        SoundTime(MIX_DECODE_BLOCK);
        *cached = block;
        u32 addr = (u32)chan->wav + 0x10 + block * 0x21;
        s8 *dst = sDecodingBuffer;
        u8 acc, byte;
        s32 n = 0x40;
        u32 k = 0;
        acc = BlockByte(addr, k++);
        *dst++ = acc;
        byte = BlockByte(addr, k++);
        goto low;
        do {
            byte = BlockByte(addr, k++);
            acc += gDeltaEncodingTable[byte >> 4];
            *dst++ = acc;
        low:
            acc += gDeltaEncodingTable[byte & 0xF];
            *dst++ = acc;
            n -= 2;
        } while (n > 0);
    }
    return sDecodingBuffer[index & 0x3F];
}

// A wave played at a fixed rate (TONEDATA_TYPE_FIX): one of its samples per
// output sample. The ARM code runs four at a time while the wave lasts and
// one at a time near its end; either way, each sample is this.
static bool32 MixFixed(struct SoundChannel *chan, struct Mix *m)
{
    const s8 *p = (const s8 *)m->pos;
    s8 *out = m->out;
    s32 count = m->count;
    s32 n = m->samples;
    for (;;) {
        for (s32 k = 0; k < 4; k++) {
            Put(out++, m->volR, m->volL, *p++);
            if (--count == 0) {
                if (m->loopLen == 0) {
                    Stop(chan);
                    SoundTime(MIX_FIXED_SETUP + MIX_FIXED_SAMPLE * (m->samples - n + k + 1));
                    return FALSE;
                }
                p = (const s8 *)m->loopStart;
                count = m->loopLen;
            }
        }
        n -= 4;
        if (n <= 0)
            break;
    }
    SoundTime(MIX_FIXED_SETUP + MIX_FIXED_SAMPLE * m->samples);
    chan->count = count;
    chan->currentPointer = (s8 *)p;
    return TRUE;
}

// A wave resampled to the output rate with linear interpolation (the usual
// case): the position moves by the channel's frequency times divFreq, 23
// bits of fraction.
static bool32 MixInterpolated(struct SoundChannel *chan, struct Mix *m, u32 divFreq)
{
    const s8 *p = (const s8 *)m->pos;
    s8 *out = m->out;
    s32 n = m->samples;
    u32 advances = 0, jumps = 0;
    m->step = divFreq * chan->frequency;
    m->cur = p[0];
    m->delta = *++p - m->cur;
    for (;;) {
        for (s32 k = 0; k < 4; k++) {
            Put(out++, m->volR, m->volL, Interpolate(m));
            m->fw += m->step;
            u32 adv = m->fw >> FW_ONE_SHIFT;
            if (adv == 0)
                continue;
            advances++;
            m->fw &= ~FW_WHOLE_MASK;
            m->count -= adv;
            if (m->count <= 0) {
                // The wave's end: a looping wave goes on from its loop start,
                // as far past it as the step went past the end.
                if (m->loopLen == 0) {
                    Stop(chan);
                    SoundTime(MIX_INTERP_SETUP + MIX_INTERP_SAMPLE * (m->samples - n + k + 1)
                              + MIX_INTERP_ADVANCE * advances + MIX_INTERP_JUMP * jumps);
                    return FALSE;
                }
                p = (const s8 *)m->loopStart;
                s32 off = -m->count;
                for (;;) {
                    m->count += m->loopLen;
                    if (m->count > 0)
                        break;
                    off -= m->loopLen;
                }
                p += off;
                m->cur = *p;
                jumps++;
            } else if (--adv == 0) {
                m->cur += m->delta;
            } else {
                p += adv;
                m->cur = *p;
                jumps++;
            }
            m->delta = *++p - m->cur;
        }
        n -= 4;
        if (n <= 0)
            break;
    }
    SoundTime(MIX_INTERP_SETUP + MIX_INTERP_SAMPLE * m->samples + MIX_INTERP_ADVANCE * advances + MIX_INTERP_JUMP * jumps);
    chan->fw = m->fw;
    chan->count = m->count;
    chan->currentPointer = (s8 *)(p - 1);
    return TRUE;
}

// SoundMainRAM_Unk1: compressed waves (the cries) and reversed ones. The
// first time, the position turns into the reversed wave's (counted from its
// end) and, compressed, into a sample index. Unlike the other paths, the
// position is stored when the wave ends.
static void MixSpecial(struct SoundChannel *chan, struct Mix *m, u32 divFreq)
{
    struct WaveData *wav = chan->wav;
    s8 *out = m->out;
    s32 n = m->samples;
    u32 advances = 0;
    s32 k = 0;

    if (!(chan->statusFlags & SOUND_CHANNEL_SF_SPECIAL)) {
        chan->statusFlags |= SOUND_CHANNEL_SF_SPECIAL;
        if (chan->type & TONEDATA_TYPE_REV) {
            m->pos = wav->size + (u32)wav * 2 + 0x20 - m->pos;
            chan->currentPointer = (s8 *)m->pos;
        }
        if (wav->type != 0) {
            m->pos = m->pos - (u32)wav - 0x10;
            chan->currentPointer = (s8 *)m->pos;
        }
    }
    if (chan->type & TONEDATA_TYPE_FIX)
        m->step = 0x800000;
    else
        m->step = divFreq * chan->frequency;

    if (wav->type != 0) {
        *(u32 *)&chan->xpi = 0xFF000000;
        if (!(chan->type & TONEDATA_TYPE_REV)) {
            // Compressed, forward.
            m->cur = DecodeSample(chan, m->pos);
            m->pos++;
            m->delta = DecodeSample(chan, m->pos) - m->cur;
            for (;;) {
                for (k = 0; k < 4; k++) {
                    Put(out++, m->volR, m->volL, Interpolate(m));
                    m->fw += m->step;
                    u32 adv = m->fw >> FW_ONE_SHIFT;
                    if (adv == 0)
                        continue;
                    advances++;
                    m->fw &= ~FW_WHOLE_MASK;
                    m->count -= adv;
                    if (m->count <= 0) {
                        if (m->loopLen == 0)
                            goto stop;
                        m->pos = chan->wav->loopStart;
                        s32 off = -m->count;
                        for (;;) {
                            m->count += m->loopLen;
                            if (m->count > 0)
                                break;
                            off -= m->loopLen;
                        }
                        m->pos += off;
                        m->cur = DecodeSample(chan, m->pos);
                    } else if (--adv == 0) {
                        m->cur += m->delta;
                    } else {
                        m->pos += adv;
                        m->cur = DecodeSample(chan, m->pos);
                    }
                    m->pos++;
                    m->delta = DecodeSample(chan, m->pos) - m->cur;
                }
                n -= 4;
                if (n <= 0)
                    break;
            }
            m->pos -= 1;
        } else {
            // Compressed, reversed (no loop: the wave ends at its start).
            m->pos -= 1;
            m->cur = DecodeSample(chan, m->pos);
            m->pos -= 1;
            m->delta = DecodeSample(chan, m->pos) - m->cur;
            for (;;) {
                for (k = 0; k < 4; k++) {
                    Put(out++, m->volR, m->volL, Interpolate(m));
                    m->fw += m->step;
                    u32 adv = m->fw >> FW_ONE_SHIFT;
                    if (adv == 0)
                        continue;
                    advances++;
                    m->fw &= ~FW_WHOLE_MASK;
                    m->count -= adv;
                    if (m->count <= 0)
                        goto stop;
                    if (--adv == 0) {
                        m->cur += m->delta;
                    } else {
                        m->pos -= adv;
                        m->cur = DecodeSample(chan, m->pos);
                    }
                    m->pos -= 1;
                    m->delta = DecodeSample(chan, m->pos) - m->cur;
                }
                n -= 4;
                if (n <= 0)
                    break;
            }
            m->pos += 2;
        }
        SoundTime(MIX_SPECIAL_SETUP + MIX_SPECIAL_SAMPLE * m->samples + MIX_SPECIAL_ADVANCE * advances);
        return;
    }

    // Not compressed: only a reversed wave plays (a compressed voice with an
    // uncompressed wave is silent).
    if (!(chan->type & TONEDATA_TYPE_REV)) {
        SoundTime(MIX_SPECIAL_SETUP);
        return;
    }
    {
        const s8 *p = (const s8 *)m->pos;
        m->cur = *--p;
        m->delta = p[-1] - m->cur;
        for (;;) {
            for (k = 0; k < 4; k++) {
                Put(out++, m->volR, m->volL, Interpolate(m));
                m->fw += m->step;
                u32 adv = m->fw >> FW_ONE_SHIFT;
                if (adv == 0)
                    continue;
                advances++;
                m->fw &= ~FW_WHOLE_MASK;
                m->count -= adv;
                if (m->count <= 0) {
                    m->pos = (u32)p;
                    goto stop;
                }
                p -= adv;
                m->cur = *p;
                m->delta = p[-1] - m->cur;
            }
            n -= 4;
            if (n <= 0)
                break;
        }
        m->pos = (u32)(p + 1);
        SoundTime(MIX_SPECIAL_SETUP + MIX_SPECIAL_SAMPLE * m->samples + MIX_SPECIAL_ADVANCE * advances);
        return;
    }

stop:
    SoundTime(MIX_SPECIAL_SETUP + MIX_SPECIAL_SAMPLE * (m->samples - n + k + 1) + MIX_SPECIAL_ADVANCE * advances);
    m->count = 0;
    Stop(chan);
}

// SoundMainRAM: the reverb (or a cleared buffer), then each DirectSound
// channel's envelope and its samples mixed into this frame's part of the PCM
// buffer.
static void Mix(struct SoundInfo *soundInfo, s8 *buffer, u32 dmaCounter, u32 lineLimit)
{
    s32 samples = soundInfo->pcmSamplesPerVBlank;
    u32 reverb = soundInfo->reverb;
    struct SoundChannel *chan;
    s32 chansLeft;
    u32 divFreq;

    SoundTime(MIX_BASE);
    if (reverb != 0) {
        // Echo: the samples played a buffer ago (A and B) and the next part's,
        // a buffer ago less a frame, times the reverb.
        s8 *cur = buffer;
        s8 *next = dmaCounter == 2 ? soundInfo->pcmBuffer : buffer + samples;
        s32 n = samples;
        do {
            s32 sum = cur[PCM_DMA_BUF_SIZE] + cur[0] + next[PCM_DMA_BUF_SIZE] + next[0];
            next++;
            s32 v = (s32)((u32)sum * reverb) >> 9;
            if (v & 0x80)
                v++;
            cur[PCM_DMA_BUF_SIZE] = (s8)v;
            *cur++ = (s8)v;
        } while (--n > 0);
        SoundTime(MIX_REVERB_SAMPLE * samples);
    } else {
        // Silence, a word at a time: 4 bytes if the count has bit 2, 8 if
        // bit 3, then 16 at a time (at least once).
        u32 *a = (u32 *)buffer;
        u32 *b = (u32 *)(buffer + PCM_DMA_BUF_SIZE);
        s32 n = (u32)samples >> 4;
        if (samples & 4) {
            *a++ = 0;
            *b++ = 0;
        }
        if (samples & 8) {
            *a++ = 0;
            *b++ = 0;
            *a++ = 0;
            *b++ = 0;
        }
        do {
            a[0] = a[1] = a[2] = a[3] = 0;
            b[0] = b[1] = b[2] = b[3] = 0;
            a += 4;
            b += 4;
        } while (--n > 0);
        SoundTime(MIX_CLEAR_16 * (((u32)samples + 15) >> 4));
    }

    divFreq = soundInfo->divFreq;
    chansLeft = soundInfo->maxChans;
    chan = &soundInfo->chans[0];
    do {
        struct WaveData *wav = chan->wav;
        struct Mix m;
        u32 flags, env;

        SoundTime(MIX_CHANNEL);
        if (lineLimit != 0) {
            // Out of time: the remaining channels aren't mixed this frame.
            SoundTimeFlush();
            u32 line = *(vu8 *)REG_ADDR_VCOUNT;
            if (line < VCOUNT_VBLANK)
                line += TOTAL_SCANLINES;
            if (line >= lineLimit)
                break;
        }

        flags = chan->statusFlags;
        if (!(flags & SOUND_CHANNEL_SF_ON))
            goto next;

        // The envelope: attack up to 255, decay down to the sustain level,
        // release (after the note stops) down to the pseudo-echo's level,
        // which then lasts pseudoEchoLength frames.
        if (flags & SOUND_CHANNEL_SF_START) {
            if (flags & SOUND_CHANNEL_SF_STOP) {
                chan->statusFlags = 0;
                goto next;
            }
            flags = SOUND_CHANNEL_SF_ENV_ATTACK;
            chan->statusFlags = flags;
            u32 start = chan->count;
            chan->currentPointer = wav->data + start;
            chan->count = wav->size - start;
            env = 0;
            chan->envelopeVolume = 0;
            chan->fw = 0;
            if (((u8 *)wav)[3] & WAVE_DATA_FLAG_LOOP) {
                flags |= SOUND_CHANNEL_SF_LOOP;
                chan->statusFlags = flags;
            }
            goto attack;
        }
        env = chan->envelopeVolume;
        if (flags & SOUND_CHANNEL_SF_IEC) {
            u32 length = chan->pseudoEchoLength;
            chan->pseudoEchoLength = length - 1;
            if (length > 1)
                goto store;
            chan->statusFlags = 0;
            goto next;
        }
        if (flags & SOUND_CHANNEL_SF_STOP) {
            env = (env * chan->release) >> 8;
            if (env > chan->pseudoEchoVolume)
                goto store;
        echo:
            env = chan->pseudoEchoVolume;
            if (env == 0) {
                chan->statusFlags = 0;
                goto next;
            }
            flags |= SOUND_CHANNEL_SF_IEC;
            chan->statusFlags = flags;
            goto store;
        }
        if ((flags & SOUND_CHANNEL_SF_ENV) == SOUND_CHANNEL_SF_ENV_DECAY) {
            env = (env * chan->decay) >> 8;
            if (env > chan->sustain)
                goto store;
            env = chan->sustain;
            if (env == 0)
                goto echo;
            flags--;
            chan->statusFlags = flags;
            goto store;
        }
        if ((flags & SOUND_CHANNEL_SF_ENV) != SOUND_CHANNEL_SF_ENV_ATTACK)
            goto store;
    attack:
        env += chan->attack;
        if (env >= 0xFF) {
            env = 0xFF;
            flags--;
            chan->statusFlags = flags;
        }
    store:
        SoundTime(MIX_ENVELOPE);
        chan->envelopeVolume = env;
        // (the ARM code reads the master volume at o_SoundChannel_release,
        // which in SoundInfo is masterVolume)
        env = ((soundInfo->masterVolume + 1) * env) >> 4;
        chan->envelopeVolumeRight = (chan->rightVolume * env) >> 8;
        chan->envelopeVolumeLeft = (chan->leftVolume * env) >> 8;

        m.loopLen = flags & SOUND_CHANNEL_SF_LOOP;
        m.loopStart = 0;
        if (m.loopLen) {
            m.loopStart = (u32)wav->data + wav->loopStart;
            m.loopLen = wav->size - wav->loopStart;
        }
        m.out = buffer;
        m.samples = samples;
        m.count = chan->count;
        m.pos = (u32)chan->currentPointer;
        m.fw = chan->fw;
        m.volR = chan->envelopeVolumeRight;
        m.volL = chan->envelopeVolumeLeft;

        if (chan->type & (TONEDATA_TYPE_CMP | TONEDATA_TYPE_REV)) {
            MixSpecial(chan, &m, divFreq);
            chan->fw = m.fw;
            chan->count = m.count;
            chan->currentPointer = (s8 *)m.pos;
        } else if (chan->type & TONEDATA_TYPE_FIX) {
            MixFixed(chan, &m);
        } else {
            MixInterpolated(chan, &m, divFreq);
        }
    next:
        chan++;
    } while (--chansLeft > 0);

    soundInfo->ident = ID_NUMBER;
}

void SoundMain(void)
{
    struct SoundInfo *soundInfo = SOUND_INFO_PTR;
    u32 lineLimit;
    u32 dmaCounter;
    s8 *buffer;

    if (soundInfo->ident != ID_NUMBER)
        return;
    soundInfo->ident++;
    SoundTime(SOUNDMAIN_PLAYERS);

    // maxLines: the mixer stops when the scanline is that many lines past
    // this one (lines after the VBlank count on from 228). 0: no limit.
    lineLimit = soundInfo->maxLines;
    if (lineLimit != 0) {
        SoundTimeFlush();
        u32 line = *(vu8 *)REG_ADDR_VCOUNT;
        if (line < VCOUNT_VBLANK)
            line += TOTAL_SCANLINES;
        lineLimit += line;
    }

    // The music players (MPlayMain, chained through each player), then the
    // GB channels (CgbSound, m4a.c).
    if (soundInfo->MPlayMainHead != NULL) {
        SoundTimeFlush();
        soundInfo->MPlayMainHead(soundInfo->musicPlayerHead);
    }
    SoundTime(SOUNDMAIN_CGB);
    SoundTimeFlush();
    soundInfo->CgbSound();
    SoundTime(SOUNDMAIN_MIX);

    // The part of the PCM buffer the DMA plays next: pcmDmaCounter counts
    // the frames down to the DMA's restart at the buffer's start
    // (m4aSoundVSync).
    buffer = soundInfo->pcmBuffer;
    dmaCounter = soundInfo->pcmDmaCounter;
    if (dmaCounter > 1)
        buffer += soundInfo->pcmSamplesPerVBlank * (u32)(soundInfo->pcmDmaPeriod - (dmaCounter - 1));
    Mix(soundInfo, buffer, dmaCounter, lineLimit);
    SoundTimeFlush();
}

void SoundMainBTM(void *x)
{
    u32 *p = x;
    for (s32 i = 0; i < 16; i++)
        p[i] = 0;
    SoundTime(SOUND_MAIN_BTM);
    SoundTimeFlush();
}

// Take a channel out of its track's list of channels.
void RealClearChain(void *x)
{
    struct SoundChannel *chan = x;
    struct MusicPlayerTrack *track = chan->track;
    SoundTime(REAL_CLEAR_CHAIN);
    if (track != NULL) {
        struct SoundChannel *next = chan->nextChannelPointer;
        struct SoundChannel *prev = chan->prevChannelPointer;
        SoundTime(REAL_CLEAR_CHAIN_LINKED);
        if (prev != NULL)
            prev->nextChannelPointer = next;
        else
            track->chan = next;
        if (next != NULL)
            next->prevChannelPointer = prev;
        chan->track = NULL;
    }
    SoundTimeFlush();
}

void MPlayJumpTableCopy(MPlayFunc *mplayJumpTable)
{
    for (s32 i = 0; i < 0x24; i++)
        mplayJumpTable[i] = gMPlayJumpTableTemplate[i];
    SoundTime(MPLAY_JUMP_TABLE_COPY);
    SoundTimeFlush();
}

// ---------------------------------------------------------------- song commands

// ld_r3_tp_adr_i: the next byte of the track's commands.
static u32 ReadByte(struct MusicPlayerTrack *track)
{
    return *track->cmdPtr++;
}

// ply_goto's pointer: the four bytes at cmdPtr, little-endian.
static u8 *ReadPointer(const u8 *p)
{
    return (u8 *)(p[0] | (p[1] << 8) | (p[2] << 16) | ((u32)p[3] << 24));
}

// End of the track: its notes stop (released) and leave it.
void ply_fine(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    struct SoundChannel *chan = track->chan;
    (void)mplayInfo;
    SoundTime(PLY_FINE);
    while (chan != NULL) {
        SoundTime(PLY_CHANNEL);
        if (chan->statusFlags & SOUND_CHANNEL_SF_ON)
            chan->statusFlags |= SOUND_CHANNEL_SF_STOP;
        RealClearChain(chan);
        chan = chan->nextChannelPointer;
    }
    track->flags = 0;
}

void ply_goto(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_GOTO);
    track->cmdPtr = ReadPointer(track->cmdPtr);
}

// A call to a pattern (three levels at most; deeper, the track ends).
void ply_patt(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    u32 level = track->patternLevel;
    SoundTime(PLY_PATT);
    if (level >= 3) {
        ply_fine(mplayInfo, track);
        return;
    }
    track->patternStack[level] = track->cmdPtr + 4;
    track->patternLevel = level + 1;
    ply_goto(mplayInfo, track);
}

void ply_pend(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    u32 level = track->patternLevel;
    (void)mplayInfo;
    SoundTime(PLY_PEND);
    if (level == 0)
        return;
    level--;
    track->patternLevel = level;
    track->cmdPtr = track->patternStack[level];
}

// Repeat: a count (0: forever) and where to go back to.
void ply_rept(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    u8 *p = track->cmdPtr;
    (void)mplayInfo;
    SoundTime(PLY_REPT);
    if (*p == 0) {
        SoundTime(PLY_GOTO);
        track->cmdPtr = p + 1;
        track->cmdPtr = ReadPointer(track->cmdPtr);
        return;
    }
    // (the count compared is the one before the byte store truncates it)
    u32 repeats = track->repN + 1;
    track->repN = repeats;
    u32 times = ReadByte(track);
    SoundTime(PLY_READ);
    if (repeats < times) {
        SoundTime(PLY_GOTO);
        track->cmdPtr = ReadPointer(track->cmdPtr);
        return;
    }
    track->repN = 0;
    track->cmdPtr = p + 5;
}

void ply_prio(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_STORE);
    track->priority = ReadByte(track);
}

void ply_tempo(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    SoundTime(PLY_READ + PLY_SET);
    u32 tempo = ReadByte(track) << 1;
    mplayInfo->tempoD = tempo;
    mplayInfo->tempoI = (tempo * mplayInfo->tempoU) >> 8;
}

void ply_keysh(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->keyShift = ReadByte(track);
    track->flags |= MPT_FLG_PITCHG;
}

// The instrument: the voice group's entry, copied into the track a word at a
// time.
void ply_voice(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    SoundTime(PLY_VOICE);
    u32 voice = *track->cmdPtr++;
    const u32 *src = (const u32 *)((u8 *)mplayInfo->tone + voice * 12);
    u32 *dst = (u32 *)&track->tone;
    dst[0] = src[0];
    dst[1] = src[1];
    dst[2] = src[2];
}

void ply_vol(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->vol = ReadByte(track);
    track->flags |= MPT_FLG_VOLCHG;
}

void ply_pan(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->pan = ReadByte(track) - C_V;
    track->flags |= MPT_FLG_VOLCHG;
}

void ply_bend(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->bend = ReadByte(track) - C_V;
    track->flags |= MPT_FLG_PITCHG;
}

void ply_bendr(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->bendRange = ReadByte(track);
    track->flags |= MPT_FLG_PITCHG;
}

void ply_lfodl(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_STORE);
    track->lfoDelay = ReadByte(track);
}

void ply_modt(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_MODT);
    u32 modT = ReadByte(track);
    if (track->modT != modT) {
        track->modT = modT;
        track->flags |= MPT_FLG_VOLCHG | MPT_FLG_PITCHG;
    }
}

void ply_tune(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_READ + PLY_SET);
    track->tune = ReadByte(track) - C_V;
    track->flags |= MPT_FLG_PITCHG;
}

// A byte straight to a sound register (its offset from REG_SOUND1CNT_L).
void ply_port(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_PORT);
    u32 reg = ReadByte(track);
    u32 value = ReadByte(track);
    SoundTimeFlush();
    *(vu8 *)(REG_ADDR_SOUND1CNT_L + reg) = value;
}

// The modulation (LFO) starts over; it moves the pitch (modT 0) or the
// volume.
static void clear_modM(struct MusicPlayerTrack *track)
{
    SoundTime(CLEAR_MODM);
    track->modM = 0;
    track->lfoSpeedC = 0;
    track->flags |= track->modT == 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG;
}

void ply_lfos(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_LFO);
    u32 speed = *track->cmdPtr++;
    track->lfoSpeed = speed;
    if (speed == 0)
        clear_modM(track);
}

void ply_mod(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    (void)mplayInfo;
    SoundTime(PLY_LFO);
    u32 depth = *track->cmdPtr++;
    track->mod = depth;
    if (depth == 0)
        clear_modM(track);
}

// End of a tied note: the first of the track's playing notes with this key
// (or the last key) is released.
void ply_endtie(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    struct SoundChannel *chan;
    u32 key = *track->cmdPtr;
    (void)mplayInfo;
    SoundTime(PLY_ENDTIE);
    if (key < 0x80) {
        track->key = key;
        track->cmdPtr++;
    } else {
        key = track->key;
    }
    for (chan = track->chan; chan != NULL; chan = chan->nextChannelPointer) {
        u32 flags = chan->statusFlags;
        SoundTime(PLY_CHANNEL);
        if ((flags & (SOUND_CHANNEL_SF_START | SOUND_CHANNEL_SF_ENV))
         && !(flags & SOUND_CHANNEL_SF_STOP)
         && chan->midiKey == key) {
            chan->statusFlags = flags | SOUND_CHANNEL_SF_STOP;
            return;
        }
    }
}

// ChnVolSetAsm: a channel's volumes from the track's and its velocity and
// rhythm pan.
static void ChnVolSet(struct SoundChannel *chan, struct MusicPlayerTrack *track)
{
    u32 velocity = chan->velocity;
    s32 pan = (s8)chan->rhythmPan;
    SoundTime(CHN_VOL_SET);
    u32 v = (track->volMR * ((0x80 + pan) * velocity)) >> 14;
    if (v > 0xFF)
        v = 0xFF;
    chan->rightVolume = v;
    v = (track->volML * ((0x7F - pan) * velocity)) >> 14;
    if (v > 0xFF)
        v = 0xFF;
    chan->leftVolume = v;
}

// The order of two tracks' addresses on the GBA.
static inline u32 TrackAddress(struct MusicPlayerTrack *track)
{
    return PlatformGbaAddress(track);
}

// A note: a channel for it (a GB channel for its type, or the DirectSound
// channel of lowest priority, preferring those already released), linked to
// the track, with the track's volume and pitch.
void ply_note(u32 note_cmd, struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    struct SoundInfo *soundInfo = SOUND_INFO_PTR;
    struct ToneData *tone;
    struct SoundChannel *chan;
    u32 key, priority, cgbType;
    s32 rhythmPan = 0;
    u8 *p;

    SoundTime(PLY_NOTE);
    track->gateTime = gClockTable[note_cmd];
    p = track->cmdPtr;
    if (*p < 0x80) {
        track->key = *p;
        p++;
        if (*p < 0x80) {
            track->velocity = *p;
            p++;
            if (*p < 0x80) {
                track->gateTime += *p;
                p++;
            }
        }
        track->cmdPtr = p;
    }

    tone = &track->tone;
    if (tone->type & (TONEDATA_TYPE_RHY | TONEDATA_TYPE_SPL)) {
        // A drum kit (a voice per key) or a key split (a voice per range).
        u32 k = track->key;
        u32 index = (tone->type & TONEDATA_TYPE_SPL) ? ((u8 *)*(u32 *)&tone->attack)[k] : k;
        struct ToneData *sub = (struct ToneData *)((u8 *)tone->wav + index * 12);
        if (sub->type & (TONEDATA_TYPE_SPL | TONEDATA_TYPE_RHY))
            return;
        key = k;
        if (tone->type & TONEDATA_TYPE_RHY) {
            if (sub->pan_sweep & 0x80)
                rhythmPan = (sub->pan_sweep - TONEDATA_P_S_PAN) << 1;
            key = sub->key;
        }
        tone = sub;
    } else {
        key = track->key;
    }

    priority = track->priority + mplayInfo->priority;
    if (priority > 0xFF)
        priority = 0xFF;
    cgbType = tone->type & TONEDATA_TYPE_CGB;

    if (cgbType != 0) {
        // Its GB channel, unless a note there has a higher priority (or the
        // same, from a track at a lower address) and isn't released.
        struct CgbChannel *cgb = soundInfo->cgbChans;
        SoundTime(PLY_NOTE_CGB);
        if (cgb == NULL)
            return;
        cgb += cgbType - 1;
        if ((cgb->statusFlags & SOUND_CHANNEL_SF_ON) && !(cgb->statusFlags & SOUND_CHANNEL_SF_STOP)) {
            if (cgb->priority > priority)
                return;
            if (cgb->priority == priority && TrackAddress(cgb->track) < TrackAddress(track))
                return;
        }
        chan = (struct SoundChannel *)cgb;
    } else {
        // A free channel at once; else among the released ones (or, if none
        // is, all of them) the lowest priority, then the highest track
        // address, not above this note's.
        u32 bestPriority = priority;
        struct MusicPlayerTrack *bestTrack = track;
        bool32 released = FALSE;
        s32 n = soundInfo->maxChans;
        struct SoundChannel *c = &soundInfo->chans[0];
        chan = NULL;
        SoundTime(PLY_NOTE_DS);
        for (;;) {
            u32 flags = c->statusFlags;
            SoundTime(PLY_NOTE_DS_CHANNEL);
            if (!(flags & SOUND_CHANNEL_SF_ON)) {
                chan = c;
                break;
            }
            if (flags & SOUND_CHANNEL_SF_STOP) {
                if (!released) {
                    released = TRUE;
                    bestPriority = c->priority;
                    bestTrack = c->track;
                    chan = c;
                    goto nextChannel;
                }
            } else if (released) {
                goto nextChannel;
            }
            if (c->priority < bestPriority) {
                bestPriority = c->priority;
                bestTrack = c->track;
                chan = c;
            } else if (c->priority == bestPriority) {
                if (TrackAddress(c->track) > TrackAddress(bestTrack)) {
                    bestTrack = c->track;
                    chan = c;
                } else if (TrackAddress(c->track) == TrackAddress(bestTrack)) {
                    chan = c;
                }
            }
        nextChannel:
            c++;
            if (--n <= 0)
                break;
        }
        if (chan == NULL)
            return;
    }

    SoundTimeFlush();
    ClearChain(chan);
    chan->prevChannelPointer = NULL;
    chan->nextChannelPointer = track->chan;
    if (track->chan != NULL)
        track->chan->prevChannelPointer = chan;
    track->chan = chan;
    chan->track = track;
    track->lfoDelayC = track->lfoDelay;
    if (track->lfoDelay != 0)
        clear_modM(track);
    SoundTimeFlush();
    TrkVolPitSet(mplayInfo, track);
    // gateTime, key, velocity (and runningStatus, overwritten next) as a word
    *(u32 *)&chan->gateTime = *(u32 *)&track->gateTime;
    chan->priority = priority;
    chan->key = key;
    chan->rhythmPan = rhythmPan;
    chan->type = tone->type;
    chan->wav = tone->wav;
    *(u32 *)&chan->attack = *(u32 *)&tone->attack;
    *(u16 *)&chan->pseudoEchoVolume = *(u16 *)&track->pseudoEchoVolume;
    ChnVolSet(chan, track);

    s32 noteKey = chan->key + (s8)track->keyM;
    if (noteKey < 0)
        noteKey = 0;
    if (cgbType != 0) {
        struct CgbChannel *cgb = (struct CgbChannel *)chan;
        cgb->length = tone->length;
        u32 sweep = tone->pan_sweep;
        if ((sweep & 0x80) || !(sweep & 0x70))
            sweep = 8;
        cgb->sweep = sweep;
        SoundTimeFlush();
        chan->frequency = soundInfo->MidiKeyToCgbFreq(cgbType, noteKey, track->pitM);
    } else {
        chan->count = track->unk_3C;
        SoundTimeFlush();
        chan->frequency = MidiKeyToFreq(chan->wav, noteKey, track->pitM);
    }
    chan->statusFlags = SOUND_CHANNEL_SF_START;
    track->flags &= 0xF0;
}

// ---------------------------------------------------------------- the sequencer

// A track's notes stop at once (and the GB channels' oscillators).
void TrackStop(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track)
{
    struct SoundChannel *chan;
    (void)mplayInfo;
    SoundTime(TRACK_STOP);
    if (!(track->flags & MPT_FLG_EXIST)) {
        SoundTimeFlush();
        return;
    }
    for (chan = track->chan; chan != NULL; chan = chan->nextChannelPointer) {
        SoundTime(TRACK_STOP_CHANNEL);
        if (chan->statusFlags != 0) {
            u32 cgbType = chan->type & TONEDATA_TYPE_CGB;
            if (cgbType != 0) {
                SoundTimeFlush();
                SOUND_INFO_PTR->CgbOscOff(cgbType);
            }
            chan->statusFlags = 0;
        }
        chan->track = NULL;
    }
    track->chan = NULL;
    SoundTimeFlush();
}

// A player's frame: the players opened before it first (MPlayMainNext),
// then its fade, then as many ticks of its tracks as the tempo gives (150 a
// frame at tempo 75 per quarter: tempoI, times 2 per tempo), then the
// volume and pitch of the tracks that changed.
void MPlayMain(struct MusicPlayerInfo *mplayInfo)
{
    struct SoundInfo *soundInfo;
    struct MusicPlayerTrack *track;
    u32 tempo;
    s32 i;

    if (mplayInfo->ident != ID_NUMBER)
        return;
    mplayInfo->ident++;
    SoundTime(MPLAY_CALL);
    if (mplayInfo->MPlayMainNext != NULL) {
        SoundTimeFlush();
        mplayInfo->MPlayMainNext(mplayInfo->musicPlayerNext);
    }
    SoundTime(MPLAY_BACK);

    if ((s32)mplayInfo->status < 0)
        goto done;
    soundInfo = SOUND_INFO_PTR;
    SoundTime(MPLAY_ACTIVE);
    SoundTimeFlush();
    FadeOutBody(mplayInfo);
    if ((s32)mplayInfo->status < 0)
        goto done;

    tempo = mplayInfo->tempoC + mplayInfo->tempoI;
    for (;;) {
        u32 bit = 1, active = 0;
        mplayInfo->tempoC = tempo;
        if (tempo < 150)
            break;

        // A tick.
        SoundTime(MPLAY_TICK);
        track = mplayInfo->tracks;
        for (i = mplayInfo->trackCount; ; ) {
            SoundTime(MPLAY_TRACK);
            if (track->flags & MPT_FLG_EXIST) {
                struct SoundChannel *chan;
                active |= bit;
                SoundTime(MPLAY_TRACK_ON);
                // Notes count their gate time down; at 0 they're released.
                for (chan = track->chan; chan != NULL; chan = chan->nextChannelPointer) {
                    u32 flags = chan->statusFlags;
                    SoundTime(MPLAY_GATE);
                    if (flags & SOUND_CHANNEL_SF_ON) {
                        if (chan->gateTime != 0 && --chan->gateTime == 0)
                            chan->statusFlags = flags | SOUND_CHANNEL_SF_STOP;
                    } else {
                        SoundTime(MPLAY_CLEAR_CHAIN);
                        SoundTimeFlush();
                        ClearChain(chan);
                    }
                }
                if (track->flags & MPT_FLG_START) {
                    SoundTime(MPLAY_START);
                    SoundTimeFlush();
                    Clear64byte(track);
                    track->flags = MPT_FLG_EXIST;
                    track->bendRange = 2;
                    track->volX = 64;
                    track->lfoSpeed = 22;
                    track->tone.type = 1;
                }
                // Commands until a wait.
                while (track->wait == 0) {
                    u32 cmd = *track->cmdPtr;
                    if (cmd < 0x80) {
                        cmd = track->runningStatus;
                    } else {
                        track->cmdPtr++;
                        if (cmd >= 0xBD)
                            track->runningStatus = cmd;
                    }
                    if (cmd >= 0xCF) {
                        SoundTime(MPLAY_NOTE);
                        SoundTimeFlush();
                        soundInfo->plynote(cmd - 0xCF, mplayInfo, track);
                    } else if (cmd > 0xB0) {
                        mplayInfo->cmd = cmd - 0xB1;
                        SoundTime(MPLAY_COMMAND);
                        SoundTimeFlush();
                        ((void (*)(struct MusicPlayerInfo *, struct MusicPlayerTrack *))soundInfo->MPlayJumpTable[cmd - 0xB1])(mplayInfo, track);
                        if (track->flags == 0)
                            goto nextTrack;
                    } else {
                        SoundTime(MPLAY_WAIT);
                        track->wait = gClockTable[cmd - 0x80];
                    }
                }
                track->wait--;
                // The LFO: a triangle wave, lfoSpeed a tick, times the depth.
                if (track->lfoSpeed != 0 && track->mod != 0) {
                    if (track->lfoDelayC != 0) {
                        track->lfoDelayC--;
                    } else {
                        // (the phase is the sum before the byte store
                        // truncates it)
                        u32 phase = track->lfoSpeedC + track->lfoSpeed;
                        s32 wave, modM;
                        SoundTime(MPLAY_LFO);
                        track->lfoSpeedC = phase;
                        if ((phase - 0x40) & 0x80)
                            wave = (s8)phase;
                        else
                            wave = 0x80 - phase;
                        modM = (s32)(track->mod * wave) >> 6;
                        if ((u8)(track->modM ^ modM) != 0) {
                            track->modM = modM;
                            track->flags |= track->modT == 0 ? MPT_FLG_PITCHG : MPT_FLG_VOLCHG;
                        }
                    }
                }
            }
        nextTrack:
            if (--i <= 0)
                break;
            track++;
            bit <<= 1;
        }
        mplayInfo->clock++;
        if (active == 0) {
            mplayInfo->status = MUSICPLAYER_STATUS_PAUSE;
            goto done;
        }
        mplayInfo->status = active;
        tempo = mplayInfo->tempoC - 150;
    }

    // Volume and pitch to the channels of the tracks that changed them.
    track = mplayInfo->tracks;
    for (i = mplayInfo->trackCount; ; ) {
        SoundTime(MPLAY_VOLPIT_TRACK);
        if ((track->flags & MPT_FLG_EXIST) && (track->flags & (MPT_FLG_VOLCHG | MPT_FLG_PITCHG))) {
            struct SoundChannel *chan;
            SoundTime(MPLAY_VOLPIT_SET);
            SoundTimeFlush();
            TrkVolPitSet(mplayInfo, track);
            for (chan = track->chan; chan != NULL; chan = chan->nextChannelPointer) {
                u32 cgbType;
                SoundTime(MPLAY_VOLPIT_CHANNEL);
                if (!(chan->statusFlags & SOUND_CHANNEL_SF_ON)) {
                    SoundTime(MPLAY_CLEAR_CHAIN);
                    SoundTimeFlush();
                    ClearChain(chan);
                    continue;
                }
                cgbType = chan->type & TONEDATA_TYPE_CGB;
                if (track->flags & MPT_FLG_VOLCHG) {
                    SoundTime(MPLAY_VOLPIT_VOLUME);
                    ChnVolSet(chan, track);
                    if (cgbType != 0)
                        ((struct CgbChannel *)chan)->modify |= CGB_CHANNEL_MO_VOL;
                }
                if (track->flags & MPT_FLG_PITCHG) {
                    s32 key = chan->key + (s8)track->keyM;
                    if (key < 0)
                        key = 0;
                    if (cgbType != 0) {
                        SoundTime(MPLAY_VOLPIT_PITCH_CGB);
                        SoundTimeFlush();
                        ((struct CgbChannel *)chan)->frequency = soundInfo->MidiKeyToCgbFreq(cgbType, key, track->pitM);
                        ((struct CgbChannel *)chan)->modify |= CGB_CHANNEL_MO_PIT;
                    } else {
                        SoundTime(MPLAY_VOLPIT_PITCH);
                        SoundTimeFlush();
                        chan->frequency = MidiKeyToFreq(chan->wav, key, track->pitM);
                    }
                }
            }
            track->flags &= 0xF0;
        }
        if (--i <= 0)
            break;
        track++;
    }

done:
    mplayInfo->ident = ID_NUMBER;
}

// ---------------------------------------------------------------- the DMA

// At line 150 (the VCount interrupt): every pcmDmaPeriod frames the sound
// DMA starts the PCM buffer over. An immediate transfer (a repeating DMA's
// stop), off, and on again in FIFO mode from the buffer's start.
void m4aSoundVSync(void)
{
    struct SoundInfo *soundInfo = SOUND_INFO_PTR;
    vu32 *dma1cnt = (vu32 *)REG_ADDR_DMA1CNT;
    vu32 *dma2cnt = (vu32 *)REG_ADDR_DMA2CNT;
    s32 counter;

    SoundTime(SOUND_VSYNC);
    if (soundInfo->ident - ID_NUMBER > 1) {
        SoundTimeFlush();
        return;
    }
    counter = soundInfo->pcmDmaCounter - 1;
    soundInfo->pcmDmaCounter = counter;
    if (counter > 0) {
        SoundTimeFlush();
        return;
    }
    SoundTime(SOUND_VSYNC_DMA);
    SoundTimeFlush();
    soundInfo->pcmDmaCounter = soundInfo->pcmDmaPeriod;
    if (*dma1cnt & (DMA_REPEAT << 16))
        *dma1cnt = ((DMA_ENABLE | DMA_START_NOW | DMA_32BIT | DMA_SRC_INC | DMA_DEST_FIXED) << 16) | 4;
    if (*dma2cnt & (DMA_REPEAT << 16))
        *dma2cnt = ((DMA_ENABLE | DMA_START_NOW | DMA_32BIT | DMA_SRC_INC | DMA_DEST_FIXED) << 16) | 4;
    *(vu16 *)REG_ADDR_DMA1CNT_H = DMA_32BIT;
    *(vu16 *)REG_ADDR_DMA2CNT_H = DMA_32BIT;
    *(vu16 *)REG_ADDR_DMA1CNT_H = DMA_ENABLE | DMA_START_SPECIAL | DMA_32BIT | DMA_REPEAT;
    *(vu16 *)REG_ADDR_DMA2CNT_H = DMA_ENABLE | DMA_START_SPECIAL | DMA_32BIT | DMA_REPEAT;
}
