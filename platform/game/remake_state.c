// The battle as the remake layer draws it: the snapshot of
// platform/include/remake_state.h, filled from the game's own variables
// (compiled like the game, so it reads them by name). It only reads.

#include "global.h"
#include "battle.h"
#include "battle_anim.h"
#include "battle_main.h"
#include "data.h"
#include "main.h"
#include "palette.h"
#include "pokemon.h"
#include "sprite.h"
#include "remake_state.h"

static struct RemakeState sState = { .background = REMAKE_BG_MAIN };
static u8 sCommand[REMAKE_BATTLERS];
static u16 sCommandSerial[REMAKE_BATTLERS];

extern const u8 *const gBattleAnims_Moves[];
extern const u8 *const gBattleAnims_StatusConditions[];
extern const u8 *const gBattleAnims_General[];
extern const u8 *const gBattleAnims_Special[];

void RemakeBattleAnimation(const u8 *const animsTable[], u16 tableId, u8 isMoveAnim)
{
    u16 table = REMAKE_ANIM_NONE;
    if (animsTable == gBattleAnims_Moves)
        table = REMAKE_ANIM_MOVE;
    else if (animsTable == gBattleAnims_StatusConditions)
        table = REMAKE_ANIM_STATUS;
    else if (animsTable == gBattleAnims_General)
        table = REMAKE_ANIM_GENERAL;
    else if (animsTable == gBattleAnims_Special)
        table = REMAKE_ANIM_SPECIAL;
    (void)isMoveAnim;
    sState.animSerial++;
    sState.animTable = table;
    sState.animId = tableId;
}

void RemakeBattleBackground(u16 background)
{
    sState.background = background;
}

void RemakeBattlerCommand(u8 battler, u8 command)
{
    if (battler >= REMAKE_BATTLERS)
        return;
    sCommand[battler] = command;
    sCommandSerial[battler]++;
}

__attribute__((export_name("RemakeState"))) struct RemakeState *RemakeState(void)
{
    s32 i;

    sState.inBattle = gMain.inBattle;
    sState.battleScreen = gMain.inBattle && gMain.vblankCallback == VBlankCB_Battle;
    sState.typeFlags = gBattleTypeFlags;
    sState.environment = gBattleEnvironment;
    sState.battlerCount = gMain.inBattle ? gBattlersCount : 0;
    sState.animActive = gAnimScriptActive;
    sState.animAttacker = gBattleAnimAttacker;
    sState.animTarget = gBattleAnimTarget;
    sState.plttUnfaded = (u32)gPlttBufferUnfaded;
    sState.plttFaded = (u32)gPlttBufferFaded;
    for (i = 0; i < REMAKE_BATTLERS; i++)
    {
        struct RemakeBattler *b = &sState.battlers[i];
        struct Sprite *sprite;
        memset(b, 0, sizeof(*b));
        b->command = sCommand[i];
        b->commandSerial = sCommandSerial[i];
        if (!gMain.inBattle || i >= gBattlersCount)
            continue;
        b->present = TRUE;
        b->side = GetBattlerSide(i);
        b->position = gBattlerPositions[i];
        b->species = gBattleMons[i].species;
        if (gBattleSpritesDataPtr != NULL && gBattleSpritesDataPtr->battlerData != NULL)
        {
            if (gBattleSpritesDataPtr->battlerData[i].transformSpecies != SPECIES_NONE)
                b->species = gBattleSpritesDataPtr->battlerData[i].transformSpecies;
            b->behindSubstitute = gBattleSpritesDataPtr->battlerData[i].behindSubstitute;
        }
        b->personality = gBattleMons[i].personality;
        b->hp = gBattleMons[i].hp;
        b->maxHp = gBattleMons[i].maxHP;
        if (gHealthboxSpriteIds[i] < MAX_SPRITES)
            b->healthboxShown = gSprites[gHealthboxSpriteIds[i]].inUse && !gSprites[gHealthboxSpriteIds[i]].invisible;
        b->spriteId = gBattlerSpriteIds[i];
        if (b->spriteId >= MAX_SPRITES)
            continue;
        sprite = &gSprites[b->spriteId];
        b->homeX = GetBattlerSpriteCoord(i, BATTLER_COORD_X_2);
        b->homeY = GetBattlerSpriteDefault_Y(i);
        b->shown = sprite->inUse && !sprite->invisible;
        b->invisible = sprite->invisible;
        // A Pokémon picture animates as one: the back pictures all alike, the
        // front ones by species (a Transform changes them); a trainer's
        // picture, which holds the battler's sprite during the intro, as the
        // trainer's.
        b->showsPokemon = sprite->inUse && sprite->anims == (b->side == B_SIDE_PLAYER ? gAnims_MonPic : gMonFrontAnimsPtrTable[b->species]);
        b->x = sprite->x;
        b->y = sprite->y;
        b->x2 = sprite->x2;
        b->y2 = sprite->y2;
        b->affineMode = sprite->oam.affineMode;
        b->hFlip = sprite->hFlip;
        b->tileNum = sprite->oam.tileNum;
        b->paletteNum = sprite->oam.paletteNum;
        b->priority = sprite->oam.priority;
        b->objMode = sprite->oam.objMode;
        b->callback = (u32)sprite->callback;
        if (sprite->oam.affineMode & 1)  // ST_OAM_AFFINE_NORMAL or ST_OAM_AFFINE_DOUBLE
        {
            struct OamMatrix *m = &gOamMatrices[sprite->oam.matrixNum];
            b->matrix[0] = m->a;
            b->matrix[1] = m->b;
            b->matrix[2] = m->c;
            b->matrix[3] = m->d;
        }
        else
        {
            b->matrix[0] = b->matrix[3] = 0x100;
        }
    }
    return &sState;
}
