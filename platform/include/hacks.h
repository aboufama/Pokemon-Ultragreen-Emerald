// Hacks for testing the game faster, set from the page's HACKS menu
// (src/game/hacks.ts; platform/game/hacks.c): EXP times a multiplier, wild
// Pokémon never or on every step, every ball catching, the player's hits
// knocking out. The decomp asks for them at a few points (its patches in
// platform/patches/ name them); all off, which is how the game starts, it
// plays as the ROM does.
#ifndef GUARD_PLATFORM_HACKS_H
#define GUARD_PLATFORM_HACKS_H

// The hacks (HackSet's first argument) and what each takes.
#define HACK_EXP 0          // EXP multiplier (0 or 1: the game's own EXP)
#define HACK_ENCOUNTERS 1   // HACK_ENCOUNTERS_*
#define HACK_CATCH 2        // every ball catches
#define HACK_KNOCKOUT 3     // the player's hits knock out
#define HACK_COUNT 4

#define HACK_ENCOUNTERS_NORMAL 0
#define HACK_ENCOUNTERS_NEVER 1   // no wild Pokémon in grass or water
#define HACK_ENCOUNTERS_ALWAYS 2  // one on every step in grass or water

// The EXP a Pokémon gains (after the Lucky Egg and the other bonuses), times
// the multiplier, at most what a battle can hand over (65535).
s32 HackExp(s32 exp);
// HACK_ENCOUNTERS_*.
u8 HackEncounters(void);
// A ball's catch odds: 255, caught, when every ball catches.
u32 HackCatchOdds(u32 odds);
// A hit's damage (gBattlerAttacker on gBattlerTarget): enough to knock the
// target out (or its substitute) when the player's hits knock out.
s32 HackHitDamage(s32 damage);

#endif // GUARD_PLATFORM_HACKS_H
