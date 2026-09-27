// Test battles for the remake layer: a wild battle started from anywhere in
// the game, so its battles can be looked at and checked without playing up
// to one, and the game page's demo battles. The host calls RemakeTestBattle
// between frames (platform/host/test_battle.mjs); the battle starts as
// DoStandardWildBattle starts one: the battle music starts, and the battle
// once the transition is done. The transition is the host's, if any (the
// remake draws its own over its arena, RemakeTestBattleTransition); the
// field's is not played. The battle starts over when it ends, or, asked for
// once, leaves the screen as it is and tells the host how it ended
// (RemakeTestBattleOutcome).

#include "global.h"
#include "battle.h"
#include "battle_bg.h"
#include "battle_main.h"
#include "load_save.h"
#include "main.h"
#include "pokemon.h"
#include "string_util.h"
#include "constants/battle.h"
#include "constants/characters.h"
#include "constants/moves.h"

#define ENVIRONMENT_OF_MAP 0xFF

static u16 sSpecies[2];
static u8 sLevel[2];
static u16 sMoves[2][MAX_MON_MOVES];
static u8 sEnvironment = ENVIRONMENT_OF_MAP;
static bool8 sOnce;
static u8 sOutcome;
static bool8 sTransition;

// A test battle can start before a new game has named the player (the save
// blocks are blank). The battle's texts print the name ("PLAYER is out of
// usable POKéMON!"), and a name without its EOS runs on over everything
// after it, so the player gets one, as the naming screen would give.
static const u8 sTestPlayerName[] = _("PLAYER");

static bool32 HasName(const u8 *name)
{
    s32 i;
    for (i = 0; i <= PLAYER_NAME_LENGTH; i++)
        if (name[i] == EOS)
            return i > 0;
    return FALSE;
}

static void CB2_TestBattleStart(void);
static void CB2_TestBattle(void);
static void CB2_TestBattleOver(void);

// A side's Pokémon: the moves asked for, else the ones it knows at its level
// (CreateMon gives them).
static void CreateTestMon(struct Pokemon *mon, u8 side)
{
    s32 i;
    CreateMon(mon, sSpecies[side], sLevel[side], USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
    if (sMoves[side][0] == MOVE_NONE)
        return;
    for (i = 0; i < MAX_MON_MOVES; i++)
        SetMonMoveSlot(mon, sMoves[side][i], i);
}

static void StartTestBattle(void)
{
    ZeroPlayerPartyMons();
    ZeroEnemyPartyMons();
    CreateTestMon(&gPlayerParty[0], 0);
    CreateTestMon(&gEnemyParty[0], 1);
    CalculatePlayerPartyCount();
    CalculateEnemyPartyCount();
    gBattleTypeFlags = 0;
    sOutcome = 0;
    gMain.savedCallback = sOnce ? CB2_TestBattleOver : StartTestBattle;
    // CreateBattleStartTask: the battle music starts with the transition.
    PlayMapChosenOrBattleBGM(0);
    SetMainCallback2(sTransition ? CB2_TestBattleStart : CB2_TestBattle);
}

// Task_BattleStart: the battle starts once the transition is done.
static void CB2_TestBattleStart(void)
{
    if (!sTransition)
        SetMainCallback2(CB2_TestBattle);
}

// CB2_InitBattle, then the place the test asked for: the battle takes its
// place from the map the player stands on.
static void CB2_TestBattle(void)
{
    CB2_InitBattle();
    if (sEnvironment != ENVIRONMENT_OF_MAP)
    {
        gBattleEnvironment = sEnvironment;
        LoadBattleTextboxAndBackground();
        DrawBattleEntryBackground();
    }
}

// A battle asked for once is over: the screen stays as the battle left it
// (faded out) until the host starts another, and nothing of the battle runs
// meanwhile (its interrupt callbacks would read its freed data).
static void CB2_TestBattleOver(void)
{
    if (sOutcome == 0)
    {
        SetVBlankCallback(NULL);
        SetHBlankCallback(NULL);
        sOutcome = gBattleOutcome != 0 ? gBattleOutcome : B_OUTCOME_DREW;
    }
}

// The moves the next test battle gives a side (0 the player's Pokémon, 1 the
// wild one); MOVE_NONE first: the ones it knows at its level.
__attribute__((export_name("RemakeTestBattleMoves"))) void RemakeTestBattleMoves(u8 side, u16 move1, u16 move2, u16 move3, u16 move4)
{
    if (side > 1)
        return;
    sMoves[side][0] = move1;
    sMoves[side][1] = move2;
    sMoves[side][2] = move3;
    sMoves[side][3] = move4;
}

// The player's Pokémon against a wild one, in a battle environment
// (BATTLE_ENVIRONMENT_*, 0xFF: the map's), over and over or `once`. FALSE
// until the game has its save blocks (the copyright screen sets them up):
// call it again next frame.
__attribute__((export_name("RemakeTestBattle"))) bool32 RemakeTestBattle(u16 playerSpecies, u8 playerLevel, u16 wildSpecies, u8 wildLevel, u8 environment, u8 once)
{
    if (gSaveBlock1Ptr == NULL || gSaveBlock2Ptr == NULL)
        return FALSE;
    sSpecies[0] = playerSpecies;
    sLevel[0] = playerLevel;
    sSpecies[1] = wildSpecies;
    sLevel[1] = wildLevel;
    sEnvironment = environment;
    sOnce = once;
    if (!HasName(gSaveBlock2Ptr->playerName))
        StringCopy(gSaveBlock2Ptr->playerName, sTestPlayerName);
    StartTestBattle();
    return TRUE;
}

// While the host draws the battle's transition: the next test battle waits
// for it (its music playing), as Task_BattleStart waits for the field's.
__attribute__((export_name("RemakeTestBattleTransition"))) void RemakeTestBattleTransition(u8 running)
{
    sTransition = running;
}

// How the last battle asked for once ended (B_OUTCOME_*), or 0 while it runs.
__attribute__((export_name("RemakeTestBattleOutcome"))) u32 RemakeTestBattleOutcome(void)
{
    return sOutcome;
}
