// Test battles for the remake layer: a wild battle started from anywhere in
// the game, so its battles can be looked at and checked without playing up
// to one. The host calls RemakeTestBattle between frames (the game page's
// ?battle=, tools); the battle starts as DoStandardWildBattle starts one,
// without the field's transition, and starts over when it ends.

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

#define ENVIRONMENT_OF_MAP 0xFF

static u16 sSpecies[2];
static u8 sLevel[2];
static u8 sEnvironment = ENVIRONMENT_OF_MAP;

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

static void CB2_TestBattle(void);

static void StartTestBattle(void)
{
    ZeroPlayerPartyMons();
    ZeroEnemyPartyMons();
    CreateMon(&gPlayerParty[0], sSpecies[0], sLevel[0], USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
    CreateMon(&gEnemyParty[0], sSpecies[1], sLevel[1], USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);
    CalculatePlayerPartyCount();
    CalculateEnemyPartyCount();
    gBattleTypeFlags = 0;
    gMain.savedCallback = StartTestBattle;
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

// The player's Pokémon against a wild one, in a battle environment
// (BATTLE_ENVIRONMENT_*, 0xFF: the map's). FALSE until the game has its save
// blocks (the copyright screen sets them up): call it again next frame.
__attribute__((export_name("RemakeTestBattle"))) bool32 RemakeTestBattle(u16 playerSpecies, u8 playerLevel, u16 wildSpecies, u8 wildLevel, u8 environment)
{
    if (gSaveBlock1Ptr == NULL || gSaveBlock2Ptr == NULL)
        return FALSE;
    sSpecies[0] = playerSpecies;
    sLevel[0] = playerLevel;
    sSpecies[1] = wildSpecies;
    sLevel[1] = wildLevel;
    sEnvironment = environment;
    if (!HasName(gSaveBlock2Ptr->playerName))
        StringCopy(gSaveBlock2Ptr->playerName, sTestPlayerName);
    StartTestBattle();
    return TRUE;
}
