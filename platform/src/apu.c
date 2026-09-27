// The sound chip.
//
// DirectSound A and B: two FIFOs of 32 bytes (8 words), each played a byte (a
// signed sample) at a time as its timer overflows (timer 0 or 1,
// SOUNDCNT_H). The sound engine mixes into gSoundInfo.pcmBuffer; on the GBA
// the sound DMA (DMA1, DMA2 in FIFO mode) copies it into the FIFOs 16 bytes
// at a time when they run low, and m4aSoundVSync starts the DMA over at the
// buffer's start every few frames. Here the DMA's copies happen as they
// would: when a FIFO runs low, the next 16 bytes from where the DMA reads
// (dma.c tells where it starts), so each frame's samples come from where the
// DMA would read them.
//
// The four GB channels: square 1 (with a frequency sweep), square 2, the wave
// channel (4-bit samples from the wave RAM at 0x04000090, two banks) and
// noise, as the register writes set them: a write to NRx4 with bit 7 starts
// (triggers) the channel, the length counters count at 256 Hz, the volume
// envelopes step at 64 Hz and the sweep at 128 Hz (the frame sequencer).
//
// The output: the GB channels through NR51 (which side), NR50 (the volume of
// each side) and SOUNDCNT_H (25/50/100%), DirectSound at 50 or 100% to
// either side, plus SOUNDBIAS, clamped to 10 bits: the DAC's value, sampled
// every 256 cycles (65536 Hz, the rate of the 8-bit resolution the game sets)
// and through the output's coupling capacitor (no DC) into a ring of stereo
// 16-bit samples the browser reads (the exports below).
//
// The chip runs on the hardware's clock (clock.c): at each line start and
// HBlank it plays up to there (PlatformSoundCatchUp), and when the CPU writes
// a sound register or a FIFO, or changes the sound DMA or a timer, up to the
// CPU's cycle (PlatformSoundSync). The model follows mGBA 0.10.2's
// (the emulator the ROM is compared with: platform/tools/sound_check.py): the
// channels' timing (a square's duty steps counted from power on, and only
// while it plays), the envelope, sweep and length rules, the wave RAM
// rotating as it plays, the FIFOs' words and DMA requests, the order of what
// happens at the same moment. Where mGBA 0.10.2 and the GBA differ, the
// GBA's: a GB channel that stops outputs 0 (mGBA holds its last level), the
// noise channel's shift register (as later mGBA has it), and a sweep step
// never restarts a channel that stopped.

#include "gba.h"

#define CPU_HZ 16777216u
#define OUTPUT_RATE 65536u
#define SAMPLE_CYCLES (CPU_HZ / OUTPUT_RATE)
#define FRAME_SEQUENCER_CYCLES 32768u  // 512 Hz
#define NEVER (~(u64)0)

// ---------------------------------------------------------------- the GB channels

struct Envelope {
    u8 stepTime;        // NRx2 bits 0-2: steps of 1/64 s (0: no stepping)
    u8 direction;       // bit 3: up
    u8 initialVolume;   // bits 4-7
    s8 currentVolume;
    u8 nextStep;
    u8 dead;            // 1: stays at 15, 2: stays at 0 (no stepping)
    u8 duty;            // NRx1 bits 6-7 (squares)
    u8 lengthLoad;      // NRx1 bits 0-5
};

struct Square {
    struct Envelope env;
    u16 frequency;      // 11 bits
    u16 length;         // counts down while `stop`
    u8 stop;            // NRx4 bit 6: the length counter stops the channel
    u8 index;           // the duty cycle's step (0-7)
    u8 sample;
    u64 lastUpdate;
};

struct Sweep {
    u8 shift, direction, time, step, enable, occurred;
    u16 realFrequency;
};

struct Wave {
    u8 enable;          // NR30 bit 7: the DAC is on
    u8 size;            // bit 5: 64 samples (both banks)
    u8 bank;            // bit 6: the bank played
    u8 volume;          // NR32 bits 5-7
    u16 length;
    u8 stop;
    u16 rate;
    u8 sample;
    u64 nextUpdate;
    u32 data[8];        // the wave RAM, both banks, as it rotates
};

struct Noise {
    struct Envelope env;
    u8 ratio, shift, power;  // NR43: divisor, shift, 7-bit LFSR
    u16 length;
    u8 stop;
    u16 lfsr;
    u8 sample;
    u64 lastEvent;
};

static struct Square sCh1, sCh2;
static struct Sweep sSweep;
static struct Wave sCh3;
static struct Noise sCh4;
static u8 sPlaying[4];
static u8 sEnable;           // SOUNDCNT_X bit 7
static u8 sFrame;            // the frame sequencer's step (0-7)
static u8 sNR50, sNR51;
static u16 sCntH;            // SOUNDCNT_H
static u16 sBias;            // SOUNDBIAS

static const u8 sDuty[4][8] = {
    { 0, 0, 0, 0, 0, 0, 0, 1 },
    { 1, 0, 0, 0, 0, 0, 0, 1 },
    { 1, 0, 0, 0, 0, 1, 1, 1 },
    { 0, 1, 1, 1, 1, 1, 1, 0 },
};

static void UpdateSquareSample(struct Square *ch)
{
    ch->sample = sDuty[ch->env.duty][ch->index] * ch->env.currentVolume;
}

static void UpdateEnvelopeDead(struct Envelope *env)
{
    if (!env->stepTime) {
        env->dead = env->currentVolume ? 1 : 2;
    } else if (!env->direction && !env->currentVolume) {
        env->dead = 2;
    } else if (env->direction && env->currentVolume == 15) {
        env->dead = 1;
    } else {
        env->dead = 0;
    }
}

// NRx2. The DAC is off (the channel stops) with no volume and down.
static int WriteEnvelope(struct Envelope *env, u8 value)
{
    env->stepTime = value & 7;
    env->direction = (value >> 3) & 1;
    env->initialVolume = value >> 4;
    UpdateEnvelopeDead(env);
    return env->initialVolume || env->direction;
}

static int ResetEnvelope(struct Envelope *env)
{
    env->currentVolume = env->initialVolume;
    UpdateEnvelopeDead(env);
    if (!env->dead)
        env->nextStep = env->stepTime;
    return env->initialVolume || env->direction;
}

static void StepEnvelope(struct Envelope *env)
{
    if (env->direction)
        env->currentVolume++;
    else
        env->currentVolume--;
    if (env->currentVolume >= 15) {
        env->currentVolume = 15;
        env->dead = 1;
    } else if (env->currentVolume <= 0) {
        env->currentVolume = 0;
        env->dead = 2;
    } else {
        env->nextStep = env->stepTime;
    }
}

static int WriteSweep(u8 value)
{
    int on = 1;
    u8 oldDirection = sSweep.direction;
    sSweep.shift = value & 7;
    sSweep.direction = (value >> 3) & 1;
    if (sSweep.occurred && oldDirection && !sSweep.direction)
        on = 0;
    sSweep.occurred = 0;
    sSweep.time = (value >> 4) & 7;
    if (!sSweep.time)
        sSweep.time = 8;
    return on;
}

static int UpdateSweep(int initial)
{
    if (initial || sSweep.time != 8) {
        s32 frequency = sSweep.realFrequency;
        if (sSweep.direction) {
            frequency -= frequency >> sSweep.shift;
            if (!initial && frequency >= 0) {
                sCh1.frequency = frequency;
                sSweep.realFrequency = frequency;
            }
        } else {
            frequency += frequency >> sSweep.shift;
            if (frequency >= 2048)
                return 0;
            if (!initial && sSweep.shift) {
                sCh1.frequency = frequency;
                sSweep.realFrequency = frequency;
                if (!UpdateSweep(1))
                    return 0;
            }
        }
        sSweep.occurred = 1;
    }
    sSweep.step = sSweep.time;
    return 1;
}

// The wave channel's volume code: 0 mutes, 1 full, 2 half, 3 a quarter
// (bit 7 forces 75%).
static u8 WaveVolume(u8 sample)
{
    static const u8 shift[4] = { 4, 0, 1, 2 };
    u8 code = (sCh3.volume >> 5) & 3;
    if (sCh3.volume & 0x80)
        sample += sample << 1;
    return sample >> (sCh3.volume & 0x80 ? 2 : shift[code]);
}

static const u8 sNoiseMask[0x40] = {
    0x3f, 0x3e, 0x3c, 0x3d, 0x39, 0x38, 0x3a, 0x3b, 0x33, 0x32, 0x30, 0x31, 0x35, 0x34, 0x36, 0x37,
    0x27, 0x26, 0x24, 0x25, 0x21, 0x20, 0x22, 0x23, 0x2b, 0x2a, 0x28, 0x29, 0x2d, 0x2c, 0x2e, 0x2f,
    0x0f, 0x0e, 0x0c, 0x0d, 0x09, 0x08, 0x0a, 0x0b, 0x03, 0x02, 0x00, 0x01, 0x05, 0x04, 0x06, 0x07,
    0x17, 0x16, 0x14, 0x15, 0x11, 0x10, 0x12, 0x13, 0x1b, 0x1a, 0x18, 0x19, 0x1d, 0x1c, 0x1e, 0x1f,
};

// Run the channels in `mask` (bits 0-3) up to `now`: the squares' duty
// steps, the wave channel's samples, the noise's shift register.
static void RunChannels(u64 now, int mask)
{
    if (!sEnable)
        return;
    struct Square *squares[2] = { &sCh1, &sCh2 };
    for (int i = 0; i < 2; i++) {
        struct Square *ch = squares[i];
        if (!(mask & (1 << i)))
            continue;
        if (!sPlaying[i] || ch->env.dead == 2)
            continue;
        u32 period = 16 * (2048 - ch->frequency);
        if (now > ch->lastUpdate && now - ch->lastUpdate >= period) {
            u64 steps = (now - ch->lastUpdate) / period;
            ch->index = (ch->index + steps) & 7;
            ch->lastUpdate += steps * period;
            UpdateSquareSample(ch);
        }
    }
    if (sPlaying[2] && (mask & 4) && now >= sCh3.nextUpdate) {
        u32 cycles = 8 * (2048 - sCh3.rate);
        u64 steps = (now - sCh3.nextUpdate) / cycles + 1;
        int start = 7, end = 0, count = 0x1F;
        if (sCh3.size)
            count = 0x3F;
        else if (sCh3.bank)
            end = 4;
        else
            start = 3;
        // The bank played rotates by one sample a step; the sample is the
        // one rotated out of its first byte's high half.
        u32 bitsCarry = 0;
        for (u32 s = 0; s < (steps & count); s++) {
            bitsCarry = sCh3.data[end] & 0xF0;
            for (int i = start; i >= end; i--) {
                u32 bits = sCh3.data[i] & 0xF0;
                sCh3.data[i] = ((sCh3.data[i] & 0x0F0F0F0F) << 4) | ((sCh3.data[i] & 0xF0F0F000) >> 12);
                sCh3.data[i] |= bitsCarry << 20;
                bitsCarry = bits;
            }
            sCh3.sample = bitsCarry >> 4;
        }
        sCh3.nextUpdate += steps * cycles;
    }
    if (sPlaying[3] && (mask & 8)) {
        u32 cycles = sCh4.ratio ? 2 * sCh4.ratio : 1;
        cycles <<= sCh4.shift;
        cycles *= 32;
        if (now > sCh4.lastEvent && now - sCh4.lastEvent >= cycles) {
            u64 diff = now - sCh4.lastEvent, last = 0;
            u32 lsb = 0, coeff;
            if (sCh4.power) {
                coeff = 0x4040;
            } else {
                u32 bits = 0;
                for (; last + cycles * 5 <= diff; last += cycles * 5) {
                    bits = sCh4.lfsr & 0x3F;
                    sCh4.lfsr >>= 5;
                    sCh4.lfsr |= 0x4000 * sNoiseMask[bits] >> 4;
                    sCh4.lfsr &= 0x7FFF;
                }
                lsb = sNoiseMask[bits] & 1;
                coeff = 0x4000;
            }
            for (; last + cycles <= diff; last += cycles) {
                lsb = (sCh4.lfsr ^ (sCh4.lfsr >> 1) ^ 1) & 1;
                sCh4.lfsr >>= 1;
                if (lsb)
                    sCh4.lfsr |= coeff;
                else
                    sCh4.lfsr &= ~coeff;
            }
            sCh4.sample = lsb * sCh4.env.currentVolume;
            sCh4.lastEvent += last;
        }
    }
}

// Length counters (256 Hz), the sweep (128 Hz), envelopes (64 Hz).
static void FrameSequencerStep(u64 now)
{
    if (!sEnable)
        return;
    RunChannels(now, 7);
    sFrame = (sFrame + 1) & 7;
    switch (sFrame) {
    case 2:
    case 6:
        if (sSweep.enable && --sSweep.step == 0) {
            if (!UpdateSweep(0))
                sPlaying[0] = 0;
        }
        // fall through
    case 0:
    case 4:
        if (sCh1.length && sCh1.stop && --sCh1.length == 0)
            sPlaying[0] = 0;
        if (sCh2.length && sCh2.stop && --sCh2.length == 0)
            sPlaying[1] = 0;
        if (sCh3.length && sCh3.stop && --sCh3.length == 0)
            sPlaying[2] = 0;
        if (sCh4.length && sCh4.stop && --sCh4.length == 0)
            sPlaying[3] = 0;
        break;
    case 7:
        if (sPlaying[0] && !sCh1.env.dead && --sCh1.env.nextStep == 0) {
            StepEnvelope(&sCh1.env);
            UpdateSquareSample(&sCh1);
        }
        if (sPlaying[1] && !sCh2.env.dead && --sCh2.env.nextStep == 0) {
            StepEnvelope(&sCh2.env);
            UpdateSquareSample(&sCh2);
        }
        if (sPlaying[3] && !sCh4.env.dead && --sCh4.env.nextStep == 0) {
            s8 sample = sCh4.sample;
            StepEnvelope(&sCh4.env);
            sCh4.sample = (sample > 0) * sCh4.env.currentVolume;
        }
        break;
    }
}

// NRx4 (squares): the frequency's high bits, the length enable, the trigger.
static void WriteSquareControl(int i, u8 value, u64 now)
{
    struct Square *ch = i ? &sCh2 : &sCh1;
    ch->frequency = (ch->frequency & 0xFF) | ((value & 7) << 8);
    u8 wasStop = ch->stop;
    ch->stop = (value >> 6) & 1;
    if (!wasStop && ch->stop && ch->length && !(sFrame & 1) && --ch->length == 0)
        sPlaying[i] = 0;
    if (value & 0x80) {
        sPlaying[i] = ResetEnvelope(&ch->env);
        if (i == 0) {
            sSweep.realFrequency = ch->frequency;
            sSweep.step = sSweep.time;
            sSweep.enable = sSweep.step != 8 || sSweep.shift;
            sSweep.occurred = 0;
            if (sPlaying[0] && sSweep.shift)
                sPlaying[0] = UpdateSweep(1);
        }
        if (!ch->length) {
            ch->length = 64;
            if (ch->stop && !(sFrame & 1))
                ch->length--;
        }
        UpdateSquareSample(ch);
    }
    (void)now;
}

static void WriteNoiseControl(u8 value, u64 now)
{
    u8 wasStop = sCh4.stop;
    sCh4.stop = (value >> 6) & 1;
    if (!wasStop && sCh4.stop && sCh4.length && !(sFrame & 1) && --sCh4.length == 0)
        sPlaying[3] = 0;
    if (value & 0x80) {
        sPlaying[3] = ResetEnvelope(&sCh4.env);
        sCh4.lfsr = 0;
        if (!sCh4.length) {
            sCh4.length = 64;
            if (sCh4.stop && !(sFrame & 1))
                sCh4.length--;
        }
        if (sPlaying[3])
            sCh4.lastEvent = now;
    }
}

static void WriteWaveControl(u8 value, u64 now)
{
    sCh3.rate = (sCh3.rate & 0xFF) | ((value & 7) << 8);
    u8 wasStop = sCh3.stop;
    sCh3.stop = (value >> 6) & 1;
    if (!wasStop && sCh3.stop && sCh3.length && !(sFrame & 1) && --sCh3.length == 0)
        sPlaying[2] = 0;
    if (value & 0x80) {
        sPlaying[2] = sCh3.enable;
        if (!sCh3.length) {
            sCh3.length = 256;
            if (sCh3.stop && !(sFrame & 1))
                sCh3.length--;
        }
    }
    if (sPlaying[2])
        sCh3.nextUpdate = now + (6 + 2 * (2048 - sCh3.rate)) * 4;
}

static void Reset(void);

// A GB channel register (0x60-0x81) or SOUNDCNT_X.
static void WritePsg(u32 off, u8 value, u64 now)
{
    switch (off) {
    case 0x60:  // NR10
        RunChannels(now, 1);
        if (!WriteSweep(value))
            sPlaying[0] = 0;
        break;
    case 0x62:  // NR11
    case 0x68:  // NR21
    case 0x78:  // NR41
    {
        int i = off == 0x62 ? 0 : off == 0x68 ? 1 : 3;
        struct Envelope *env = i == 0 ? &sCh1.env : i == 1 ? &sCh2.env : &sCh4.env;
        RunChannels(now, 1 << i);
        env->lengthLoad = value & 0x3F;
        env->duty = value >> 6;
        u16 length = 64 - env->lengthLoad;
        if (i == 0) sCh1.length = length;
        else if (i == 1) sCh2.length = length;
        else sCh4.length = length;
        break;
    }
    case 0x63:  // NR12
    case 0x69:  // NR22
    case 0x79:  // NR42
    {
        int i = off == 0x63 ? 0 : off == 0x69 ? 1 : 3;
        struct Envelope *env = i == 0 ? &sCh1.env : i == 1 ? &sCh2.env : &sCh4.env;
        RunChannels(now, 1 << i);
        if (!WriteEnvelope(env, value))
            sPlaying[i] = 0;
        break;
    }
    case 0x64:  // NR13
        RunChannels(now, 1);
        sCh1.frequency = (sCh1.frequency & 0x700) | value;
        break;
    case 0x65:  // NR14
        RunChannels(now, 1);
        WriteSquareControl(0, value, now);
        break;
    case 0x6C:  // NR23
        RunChannels(now, 2);
        sCh2.frequency = (sCh2.frequency & 0x700) | value;
        break;
    case 0x6D:  // NR24
        RunChannels(now, 2);
        WriteSquareControl(1, value, now);
        break;
    case 0x70:  // NR30
        RunChannels(now, 4);
        sCh3.size = (value >> 5) & 1;
        sCh3.bank = (value >> 6) & 1;
        sCh3.enable = (value >> 7) & 1;
        if (!sCh3.enable)
            sPlaying[2] = 0;
        break;
    case 0x72:  // NR31
        RunChannels(now, 4);
        sCh3.length = 256 - value;
        break;
    case 0x73:  // NR32
        RunChannels(now, 4);
        sCh3.volume = value & 0xE0;
        break;
    case 0x74:  // NR33
        RunChannels(now, 4);
        sCh3.rate = (sCh3.rate & 0x700) | value;
        break;
    case 0x75:  // NR34
        RunChannels(now, 4);
        WriteWaveControl(value, now);
        break;
    case 0x7C:  // NR43
        RunChannels(now, 8);
        sCh4.ratio = value & 7;
        sCh4.power = (value >> 3) & 1;
        sCh4.shift = value >> 4;
        break;
    case 0x7D:  // NR44
        RunChannels(now, 8);
        WriteNoiseControl(value, now);
        break;
    case 0x80:  // NR50
        RunChannels(now, 0xF);
        sNR50 = value;
        break;
    case 0x81:  // NR51
        RunChannels(now, 0xF);
        sNR51 = value;
        break;
    case 0x84:  // NR52 (SOUNDCNT_X)
    {
        u8 wasEnable = sEnable;
        sEnable = (value >> 7) & 1;
        if (!sEnable) {
            // Off: the GB channels' registers clear, and they stop (and the
            // volumes in SOUNDCNT_H).
            Reset();
            sCntH &= 0xFF00;
        } else if (!wasEnable) {
            sFrame = 7;
        }
        break;
    }
    }
}

// ---------------------------------------------------------------- DirectSound

#define FIFO_WORDS 8

struct Fifo {
    u32 data[FIFO_WORDS];
    u32 write, read;    // (full and empty look alike, as on the GBA)
    u32 playing;        // the word being played, a byte a tick (low first)
    u32 remaining;      // its bytes left
    s8 sample;          // the byte playing now
    u32 dmaSource;      // where the sound DMA reads next
    u8 dma;             // the DMA channel feeding this FIFO (0: none)
};

static struct Fifo sFifo[2];

static void FifoPush(struct Fifo *f, u32 word)
{
    f->data[f->write] = word;
    f->write = (f->write + 1) % FIFO_WORDS;
}

static u32 FifoSize(const struct Fifo *f)
{
    return f->write >= f->read ? f->write - f->read : FIFO_WORDS - f->read + f->write;
}

// Linear memory: the DMA reads nothing past it.
#define MEMORY_END 0x08000000u

// A sound DMA request: 4 words from where it reads, the CPU waiting for
// them (as mGBA counts: 2 cycles a word and 2 more).
#define FIFO_DMA_CYCLES 10

// A timer overflow: with fewer than 4 words left the FIFO asks the DMA for
// 4 more (they arrive after this tick); the next byte of the word playing
// plays, the next word starts when it's done (an empty FIFO plays 0).
static void FifoTick(struct Fifo *f)
{
    u32 size = FifoSize(f);
    int request = FIFO_WORDS - size > 4 && f->dma;
    if (!f->remaining && size) {
        f->playing = f->data[f->read];
        f->remaining = 4;
        f->read = (f->read + 1) % FIFO_WORDS;
    }
    f->sample = (s8)f->playing;
    if (f->remaining) {
        f->playing >>= 8;
        f->remaining--;
    }
    if (request) {
        for (u32 i = 0; i < 4; i++) {
            u32 a = f->dmaSource;
            FifoPush(f, a <= MEMORY_END - 4 ? *(volatile u32 *)(uintptr_t)(a & ~3u) : 0);
            f->dmaSource += 4;
        }
        PlatformSpend(FIFO_DMA_CYCLES);
    }
}

// ---------------------------------------------------------------- output

#define RING_FRAMES 65536u  // a second

static s16 sRing[RING_FRAMES * 2];
static u32 sWritten;  // stereo frames written since power-on (wraps)

static u64 sTime;               // the chip has run to here
static u64 sOrigin;             // its reset: the output samples count from here
static u64 sNextSample;         // the end of the output sample being made
static u64 sNextFrameStep;      // the frame sequencer's next step
static u64 sLastOverflow[2];    // timers 0 and 1's last overflow the FIFOs took
static s16 sDac[2];             // the DAC's value, left and right

static s32 Bias(s32 sample)
{
    s32 bias = sBias & 0x3FF;
    sample += bias;
    if (sample >= 0x400)
        sample = 0x3FF;
    else if (sample < 0)
        sample = 0;
    return sample - bias;
}

// The DAC's value for the sample from `start` to now: the GB channels
// (their waves run to its start) and the FIFOs' bytes as they are now.
// Sources a tool silences to hear the others alone (PlatformSoundMute):
// bits 0-3 the GB channels, 4 and 5 DirectSound A and B.
static u32 sMute;

static void Sample(u64 start)
{
    RunChannels(start, 0xF);
    s32 left = 0, right = 0;
    if (sEnable) {
        s32 s[4] = {
            sPlaying[0] ? sCh1.sample : 0,
            sPlaying[1] ? sCh2.sample : 0,
            sPlaying[2] ? WaveVolume(sCh3.sample) : 0,
            sPlaying[3] ? sCh4.sample : 0,
        };
        for (int i = 0; i < 4; i++)
            if (sMute & (1 << i))
                s[i] = 0;
        for (int i = 0; i < 4; i++) {
            if (sNR51 & (0x10 << i))
                left += s[i];
            if (sNR51 & (1 << i))
                right += s[i];
        }
        left <<= 3;
        right <<= 3;
        left *= 1 + ((sNR50 >> 4) & 7);
        right *= 1 + (sNR50 & 7);
        int psgShift = 4 - (sCntH & 3);
        left >>= psgShift;
        right >>= psgShift;
    }
    for (int i = 0; i < 2; i++) {
        if (sMute & (0x10 << i))
            continue;
        s32 ds = (sFifo[i].sample << 2) >> !(sCntH & (4 << i));
        if (sCntH & (0x200 << (i * 4)))
            left += ds;
        if (sCntH & (0x100 << (i * 4)))
            right += ds;
    }
    sDac[0] = (s16)(Bias(left) * 64);
    sDac[1] = (s16)(Bias(right) * 64);
}

// The output's coupling capacitor: the amplifier behind the speaker and the
// headphone socket gets the DAC's value through a capacitor, which lets no
// DC through (the GB channels' levels are all above 0), a high-pass at about
// 20 Hz. As mGBA's (blip_buf's integrator): each sample, 1/512 of the level
// leaks away. The level has 15 bits of fraction.
static s64 sCoupled[2];
static s16 sDacLast[2];

static s16 Coupled(int side)
{
    sCoupled[side] += (s64)(sDac[side] - sDacLast[side]) * 32768;
    sDacLast[side] = sDac[side];
    s64 level = sCoupled[side] >> 15;
    sCoupled[side] -= level * 64;
    return (s16)(level > 32767 ? 32767 : level < -32768 ? -32768 : level);
}

// The output sample ending now. The DAC samples as often as SOUNDBIAS's
// resolution says (every 512 cycles at 9 bits, 256 at 8 (the game's), 128 at
// 7, 64 at 6); the ring takes one every 256 cycles.
static void OutputSample(u64 end)
{
    u32 interval = 0x200u >> (sBias >> 14);
    if ((end - sOrigin) % interval == 0 || interval < SAMPLE_CYCLES)
        Sample(end - (interval < SAMPLE_CYCLES ? SAMPLE_CYCLES : interval));
    u32 at = (sWritten % RING_FRAMES) * 2;
    sRing[at] = Coupled(0);
    sRing[at + 1] = Coupled(1);
    sWritten++;
}

// Run the chip up to `now`. Things at the same moment happen in mGBA's
// order: the output sample ending then, the frame sequencer's step, the
// timers' overflows.
static void Run(u64 now)
{
    for (;;) {
        u64 t = sNextSample;
        int what = 1;
        if (sNextFrameStep < t) {
            t = sNextFrameStep;
            what = 0;
        }
        u64 overflow[2] = { NEVER, NEVER };
        if (sEnable) {
            for (int i = 0; i < 2; i++) {
                int timer = (sCntH >> (10 + i * 4)) & 1;
                if (sCntH & (0x300 << (i * 4)))
                    overflow[timer] = PlatformTimerNextOverflow(timer, sLastOverflow[timer]);
            }
        }
        for (int i = 0; i < 2; i++) {
            if (overflow[i] < t) {
                t = overflow[i];
                what = 2 + i;
            }
        }
        if (t > now)
            break;
        sTime = t;
        if (what == 0) {
            FrameSequencerStep(t);
            sNextFrameStep += FRAME_SEQUENCER_CYCLES;
        } else if (what == 1) {
            OutputSample(t);
            sNextSample += SAMPLE_CYCLES;
        } else {
            int timer = what - 2;
            sLastOverflow[timer] = t;
            for (int i = 0; i < 2; i++) {
                if (((sCntH >> (10 + i * 4)) & 1) == timer && (sCntH & (0x300 << (i * 4))))
                    FifoTick(&sFifo[i]);
            }
        }
    }
    sTime = now;
    // (a timer started later overflows after it starts)
    for (int i = 0; i < 2; i++) {
        if (sLastOverflow[i] < now)
            sLastOverflow[i] = now;
    }
}

// The chip runs on the hardware's time (clock.c): at each scanline start and
// HBlank it plays up to there, so what the interrupts at a line do
// (m4aSoundVSync starting the sound DMA over at line 150, the mixer at line
// 160) comes in order with what it plays.
void PlatformSoundCatchUp(void)
{
    u64 now = PlatformClockNow();
    if (now > sTime)
        Run(now);
}

// The CPU writes a sound register or a FIFO, sets up the sound DMA or
// changes a timer: the hardware first catches up with the CPU (interrupts
// due by then are taken, as the GBA takes them before the write), then the
// chip plays up to the CPU's cycle, so the write takes effect when the CPU
// makes it, inside an interrupt handler too (CgbSound's writes land where
// the VBlank handler makes them, not at the VBlank's start).
void PlatformSoundSync(void)
{
    PlatformCatchUp();
    if (gPlatformCycles > sTime)
        Run(gPlatformCycles);
}

// ---------------------------------------------------------------- registers

// Tools can log the writes to the sound registers (platform/tools/sound_check.py).
#define LOG_ENTRIES 16384
struct SoundWrite {
    u32 vblank;
    u16 offset;
    u8 value;
    u8 unused;
};
static struct SoundWrite sLog[LOG_ENTRIES];
static u32 sLogCount;
static u8 sLogOn;

// A byte written to a sound register or the wave RAM (0x60-0x9F), in address
// order for wider writes.
void PlatformSoundRegWrite(u32 off, u8 value)
{
    PlatformSoundSync();
    u64 now = sTime;
    if (sLogOn && sLogCount < LOG_ENTRIES)
        sLog[sLogCount++] = (struct SoundWrite){ PlatformVBlanks(), (u16)off, value, 0 };
    if (off >= 0x90) {
        // Wave RAM: the bank not played (bank 1 while the chip is off).
        int bank = sEnable ? !sCh3.bank : 1;
        RunChannels(now, 4);
        u32 i = (off - 0x90) >> 2, shift = ((off - 0x90) & 3) * 8;
        u32 *word = &sCh3.data[i | (bank * 4)];
        *word = (*word & ~(0xFFu << shift)) | ((u32)value << shift);
        return;
    }
    if (off == 0x82 || off == 0x83) {
        sCntH = off == 0x82 ? (sCntH & 0xFF00) | value : (sCntH & 0x00FF) | (value << 8);
        if (off == 0x83) {
            // Bits 11 and 15 empty the FIFOs.
            if (value & 0x08)
                sFifo[0].read = sFifo[0].write = 0;
            if (value & 0x80)
                sFifo[1].read = sFifo[1].write = 0;
            sCntH &= ~0x8800;
        }
        return;
    }
    if (off == 0x88 || off == 0x89) {
        sBias = off == 0x88 ? (sBias & 0xFF00) | value : (sBias & 0x00FF) | (value << 8);
        return;
    }
    if (!sEnable && off != 0x84)
        return;  // off, the GB channels' registers can't be written
    WritePsg(off, value, now);
}

// A word written to FIFO A (0) or B (1): by the CPU (a halfword write
// writes the word with the other half as it is, as mGBA does) or a DMA.
void PlatformSoundFifoWrite(int fifo, u32 word)
{
    PlatformSoundSync();
    FifoPush(&sFifo[fifo], word);
}

// DMA channel 1 or 2's control changed: it is in FIFO mode (enabled, the
// sound FIFOs' timing) or not; `started`: it was just enabled, reading from
// `source` (else it goes on from where it was).
void PlatformSoundDma(int ch, u32 source, u32 dest, int fifo, int started)
{
    PlatformSoundSync();
    for (int i = 0; i < 2; i++) {
        struct Fifo *f = &sFifo[i];
        if (fifo && dest == IO_BASE + R_FIFO_A + i * 4u) {
            // (a FIFO follows the DMA channel set up last for it)
            if (started || f->dma != ch)
                f->dmaSource = source;
            f->dma = (u8)ch;
        } else if (f->dma == ch) {
            f->dma = 0;
        }
    }
}

static void Reset(void)
{
    // (the squares' duty positions and their timers' phase go on)
    sCh1 = (struct Square){ .env = { .dead = 2 }, .index = sCh1.index, .lastUpdate = sCh1.lastUpdate };
    sCh2 = (struct Square){ .env = { .dead = 2 }, .index = sCh2.index, .lastUpdate = sCh2.lastUpdate };
    sSweep = (struct Sweep){ .time = 8 };
    u32 wave[8];
    for (int i = 0; i < 8; i++)
        wave[i] = sCh3.data[i];
    sCh3 = (struct Wave){ 0 };
    for (int i = 0; i < 8; i++)
        sCh3.data[i] = wave[i];  // the wave RAM keeps its contents
    sCh4 = (struct Noise){ .env = { .dead = 2 } };
    for (int i = 0; i < 4; i++)
        sPlaying[i] = 0;
    sNR50 = sNR51 = 0;
}

void PlatformSoundReset(void)
{
    Reset();
    for (int i = 0; i < 8; i++)
        sCh3.data[i] = 0;
    sEnable = 0;
    sFrame = 0;
    sCntH = 0;
    sBias = 0x200;
    sFifo[0] = sFifo[1] = (struct Fifo){ 0 };
    // (from now: power on, or RegisterRamReset; the squares' timers count
    // their steps from here, even while they don't play)
    sTime = sOrigin = gPlatformCycles;
    sCh1.index = sCh2.index = 0;
    sCh1.lastUpdate = sCh2.lastUpdate = sOrigin;
    sNextSample = sOrigin + SAMPLE_CYCLES;
    sNextFrameStep = sOrigin;
    sLastOverflow[0] = sLastOverflow[1] = sOrigin;
    sDac[0] = sDac[1] = 0;
    sDacLast[0] = sDacLast[1] = 0;
    sCoupled[0] = sCoupled[1] = 0;
    sWritten = 0;
    sLogCount = 0;
}

// ---------------------------------------------------------------- the browser's side

EXPORT(PlatformAudioRate) u32 PlatformAudioRate(void)
{
    return OUTPUT_RATE;
}

// The ring: RING_FRAMES stereo frames (left, right), written in turn.
EXPORT(PlatformAudioBuffer) s16 *PlatformAudioBuffer(void)
{
    return sRing;
}

EXPORT(PlatformAudioCapacity) u32 PlatformAudioCapacity(void)
{
    return RING_FRAMES;
}

// Frames written since power-on (wrapping at 2^32): the sound up to now.
EXPORT(PlatformAudioWritten) u32 PlatformAudioWritten(void)
{
    PlatformSoundCatchUp();
    return sWritten;
}

// The sound register writes since the last call (tools): count, then entries
// of {vblank, offset, value}.
EXPORT(PlatformSoundLog) struct SoundWrite *PlatformSoundLog(u32 on)
{
    sLogOn = (u8)on;
    return sLog;
}

EXPORT(PlatformSoundLogTake) u32 PlatformSoundLogTake(void)
{
    u32 n = sLogCount;
    sLogCount = 0;
    return n;
}

// Silence some of the sources (tools, to compare the others alone): bits 0-3
// the GB channels, 4 and 5 DirectSound A and B.
EXPORT(PlatformSoundMute) void PlatformSoundMute(u32 mask)
{
    sMute = mask;
}
