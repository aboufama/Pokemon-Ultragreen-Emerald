// Reference-capture harness for the pokeemerald decompilation.
//
// Dropped into a *copy* of pret/pokeemerald by tools/reference/build_rom.sh.
// The ROM boots straight into a wild single battle whose participants are
// described by gBattleHarnessConfig. The config lives in ROM so the capture
// tool (tools/reference/capture) can patch it in the image before booting,
// which lets one ROM build produce reference screenshots for any species pair.
//
// With SOUND_MAGIC patched in instead, the ROM plays songs rather than a
// battle: tools/reference/capture/sound.c records the game's own sound engine
// for tools/sound/reference/run.py.

#include "global.h"
#include "battle.h"
#include "battle_main.h"
#include "load_save.h"
#include "main.h"
#include "m4a.h"
#include "malloc.h"
#include "new_game.h"
#include "pokemon.h"
#include "save.h"
#include "constants/battle.h"
#include "constants/moves.h"
#include "constants/species.h"

#define HARNESS_MAGIC 0x534E5248 // "HRNS"
#define SOUND_MAGIC   0x444E5353 // "SSND"

#define HARNESS_FLAG_PLAYER_SHINY  (1 << 0)
#define HARNESS_FLAG_ENEMY_SHINY   (1 << 1)
#define HARNESS_FLAG_PLAYER_FEMALE (1 << 2)
#define HARNESS_FLAG_ENEMY_FEMALE  (1 << 3)

struct BattleHarnessConfig
{
    u32 magic;
    u16 playerSpecies;
    u16 enemySpecies;
    u8 playerLevel;
    u8 enemyLevel;
    u8 environment;
    u8 flags;
    u16 playerMoves[MAX_MON_MOVES]; // MOVE_NONE keeps the level-up default
    u16 enemyMoves[MAX_MON_MOVES];
};

// Keep the layout in sync with tools/reference/capture/capture.c.
const volatile struct BattleHarnessConfig gBattleHarnessConfig =
{
    .magic = HARNESS_MAGIC,
    .playerSpecies = SPECIES_BLAZIKEN,
    .enemySpecies = SPECIES_ZIGZAGOON,
    .playerLevel = 50,
    .enemyLevel = 50,
    .environment = BATTLE_ENVIRONMENT_GRASS,
    .flags = 0,
    .playerMoves = {MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE},
    .enemyMoves = {MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE},
};

#define HARNESS_OT_ID 0x12345678

// Personality whose low byte picks the gender and whose halves XOR with the
// fixed OT id to decide shininess (see GetMonData(MON_DATA_IS_SHINY)).
static u32 HarnessPersonality(bool32 shiny, bool32 female)
{
    u16 lo = female ? 0x0000 : 0x00FF;
    u16 hi;

    if (shiny)
        hi = (HARNESS_OT_ID >> 16) ^ (HARNESS_OT_ID & 0xFFFF) ^ lo;
    else
        hi = 0x0000;
    return ((u32)hi << 16) | lo;
}

static void HarnessCreateMon(struct Pokemon *mon, u16 species, u8 level, bool32 shiny, bool32 female, const volatile u16 *moves)
{
    s32 i;

    CreateMon(mon, species, level, 31, TRUE, HarnessPersonality(shiny, female), OT_ID_PRESET, HARNESS_OT_ID);
    for (i = 0; i < MAX_MON_MOVES; i++)
    {
        if (moves[i] != MOVE_NONE)
            SetMonMoveSlot(mon, moves[i], i);
    }
}

static void CB2_BattleHarnessIdle(void)
{
}

// The sound mode's mailbox: the recorder writes a song number, then a command.
struct SoundHarness
{
    u16 song;
    u16 cmd; // 1 start the song, 2 stop the BGM, 3 continue it, 4 fade it out
};

struct SoundHarness gSoundHarness;

static void CB2_SoundHarness(void)
{
    u16 cmd = *(vu16 *)&gSoundHarness.cmd;

    if (cmd == 0)
        return;
    *(vu16 *)&gSoundHarness.cmd = 0;
    switch (cmd)
    {
    case 1:
        m4aSongNumStart(*(vu16 *)&gSoundHarness.song);
        break;
    case 2:
        m4aMPlayStop(&gMPlayInfo_BGM);
        break;
    case 3:
        m4aMPlayContinue(&gMPlayInfo_BGM);
        break;
    case 4:
        m4aMPlayFadeOut(&gMPlayInfo_BGM, 4);
        break;
    }
}

void CB2_BattleHarness(void)
{
    u8 flags = gBattleHarnessConfig.flags;

    if (gBattleHarnessConfig.magic == SOUND_MAGIC)
    {
        SetMainCallback2(CB2_SoundHarness);
        return;
    }

    SetSaveBlocksPointers(GetSaveBlocksPointersBaseOffset());
    ResetMenuAndMonGlobals();
    Save_ResetSaveCounters();
    Sav2_ClearSetDefault();
    InitHeap(gHeap, HEAP_SIZE);

    ZeroPlayerPartyMons();
    ZeroEnemyPartyMons();
    HarnessCreateMon(&gPlayerParty[0], gBattleHarnessConfig.playerSpecies, gBattleHarnessConfig.playerLevel,
                     flags & HARNESS_FLAG_PLAYER_SHINY, flags & HARNESS_FLAG_PLAYER_FEMALE, gBattleHarnessConfig.playerMoves);
    HarnessCreateMon(&gEnemyParty[0], gBattleHarnessConfig.enemySpecies, gBattleHarnessConfig.enemyLevel,
                     flags & HARNESS_FLAG_ENEMY_SHINY, flags & HARNESS_FLAG_ENEMY_FEMALE, gBattleHarnessConfig.enemyMoves);
    CalculatePlayerPartyCount();

    gBattleTypeFlags = 0;
    gBattleEnvironment = gBattleHarnessConfig.environment;
    gMain.savedCallback = CB2_BattleHarnessIdle;
    SetMainCallback2(CB2_InitBattle);
}

// Battle init normally derives the environment from the player's map tile
// (BattleSetup_GetEnvironmentId). build_rom.sh redirects that call here so the
// harness decides which battle background is shown.
u8 BattleHarness_GetEnvironment(void)
{
    return gBattleHarnessConfig.environment;
}
