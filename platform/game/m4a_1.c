// Replaces src/m4a_1.s: the sound engine's assembly half (the sequencer,
// the mixer). TEMPORARY: silent stubs so the game boots; the C port of
// m4a_1.s replaces this file.

#include "global.h"
#include "gba/m4a_internal.h"

extern void *const gMPlayJumpTableTemplate[];

char SoundMainRAM[0x800];

u32 umul3232H32(u32 multiplier, u32 multiplicand)
{
    return (u32)(((u64)multiplier * multiplicand) >> 32);
}

void SoundMain(void) {}
void SoundMainBTM(void) {}
void RealClearChain(void *x) { (void)x; }
void MPlayMain(struct MusicPlayerInfo *mplayInfo) { (void)mplayInfo; }
void TrackStop(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track) { (void)mplayInfo; (void)track; }
void m4aSoundVSync(void) {}

void MPlayJumpTableCopy(MPlayFunc *mplayJumpTable)
{
    for (int i = 0; i < 36; i++)
        mplayJumpTable[i] = gMPlayJumpTableTemplate[i];
}

#define PLY(name) void name(struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track) { (void)mplayInfo; (void)track; }
PLY(ply_fine) PLY(ply_goto) PLY(ply_patt) PLY(ply_pend) PLY(ply_rept) PLY(ply_prio) PLY(ply_tempo)
PLY(ply_keysh) PLY(ply_voice) PLY(ply_vol) PLY(ply_pan) PLY(ply_bend) PLY(ply_bendr) PLY(ply_lfos)
PLY(ply_lfodl) PLY(ply_mod) PLY(ply_modt) PLY(ply_tune) PLY(ply_port) PLY(ply_endtie)

void ply_note(u32 note_cmd, struct MusicPlayerInfo *mplayInfo, struct MusicPlayerTrack *track) { (void)note_cmd; (void)mplayInfo; (void)track; }
