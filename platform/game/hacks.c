// Hacks for testing the game faster (platform/include/hacks.h): the page's
// HACKS menu sets them between frames (HackSet) and does its one-off helps
// (heal the party, items, money); the decomp's patched code asks for them
// where it gives EXP, throws a ball, deals a hit and rolls for wild Pokémon.

#include "global.h"
#include "battle.h"
#include "battle_anim.h"
#include "item.h"
#include "main.h"
#include "money.h"
#include "script_pokemon_util.h"
#include "constants/items.h"
#include "hacks.h"

// money.c's MAX_MONEY.
#define HACK_MONEY 999999
#define HACK_ITEM_COUNT 99

static u32 sHacks[HACK_COUNT];

__attribute__((export_name("HackSet"))) void HackSet(u32 hack, u32 value)
{
    if (hack < HACK_COUNT)
        sHacks[hack] = value;
}

s32 HackExp(s32 exp)
{
    s32 multiplier = sHacks[HACK_EXP];

    if (multiplier <= 1 || exp <= 0)
        return exp;
    exp *= multiplier;
    return exp > 0xFFFF ? 0xFFFF : exp;
}

u8 HackEncounters(void)
{
    return sHacks[HACK_ENCOUNTERS];
}

u32 HackCatchOdds(u32 odds)
{
    return sHacks[HACK_CATCH] ? 255 : odds;
}

s32 HackHitDamage(s32 damage)
{
    s32 hp;

    if (!sHacks[HACK_KNOCKOUT] || damage <= 0)
        return damage;
    if (GetBattlerSide(gBattlerAttacker) != B_SIDE_PLAYER || GetBattlerSide(gBattlerTarget) != B_SIDE_OPPONENT)
        return damage;
    if (gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE)
        hp = gDisableStructs[gBattlerTarget].substituteHP;
    else
        hp = gBattleMons[gBattlerTarget].hp;
    return damage > hp ? damage : hp;
}

// The menu's helps, done at once between frames; FALSE when the game can't
// yet (no save loaded: before the copyright screen) or, healing, while a
// battle is on (it holds its own copy of the party's HP).

__attribute__((export_name("HackHealParty"))) bool32 HackHealParty(void)
{
    if (gSaveBlock1Ptr == NULL || gMain.inBattle)
        return FALSE;
    HealPlayerParty();
    return TRUE;
}

__attribute__((export_name("HackGiveItems"))) bool32 HackGiveItems(void)
{
    if (gSaveBlock1Ptr == NULL)
        return FALSE;
    AddBagItem(ITEM_RARE_CANDY, HACK_ITEM_COUNT);
    AddBagItem(ITEM_POKE_BALL, HACK_ITEM_COUNT);
    AddBagItem(ITEM_FULL_RESTORE, HACK_ITEM_COUNT);
    return TRUE;
}

__attribute__((export_name("HackGiveMoney"))) bool32 HackGiveMoney(void)
{
    if (gSaveBlock1Ptr == NULL)
        return FALSE;
    SetMoney(&gSaveBlock1Ptr->money, HACK_MONEY);
    return TRUE;
}
