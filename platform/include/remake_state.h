// The battle as the remake layer draws it (docs/ARCHITECTURE.md, "Remake
// layer"): platform/game/remake_state.c fills it from the game's own state
// when the browser asks (at each VBlank); src/remake reads it. Plain fixed
// fields, the same on both sides (src/remake/state.ts mirrors them).
#ifndef GUARD_REMAKE_STATE_H
#define GUARD_REMAKE_STATE_H

#include <stdint.h>

#define REMAKE_BATTLERS 4

struct RemakeBattler {
    uint16_t species;       // as it looks now (Transform's species when transformed)
    uint8_t present;        // in this battle
    uint8_t side;           // 0 the player's, 1 the opponent's
    uint8_t position;       // B_POSITION_*
    uint8_t spriteId;       // its sprite (gBattlerSpriteIds)
    uint8_t shown;          // the sprite is in use and visible this frame
    uint8_t behindSubstitute;
    int16_t x, y;           // the sprite's position
    int16_t x2, y2;         // and its offsets (moves, the faint): its centre is (x + x2, y + y2)
    int16_t matrix[4];      // pa, pb, pc, pd (8.8) when affine
    uint8_t affineMode;     // 0 off, 1 affine, 3 double size
    uint8_t hFlip;
    uint16_t tileNum;       // its OAM tile: the key the PPU's stand-in picture uses
    uint8_t paletteNum;     // its OBJ palette (fades and tints)
    uint8_t priority;
    uint8_t objMode;
    uint8_t invisible;
    uint32_t callback;      // its sprite callback (function table index): what it is doing
    uint32_t personality;
    uint16_t hp, maxHp;
};

// Which table a battle animation comes from.
enum {
    REMAKE_ANIM_NONE,
    REMAKE_ANIM_MOVE,       // gBattleAnims_Moves: the id is the move
    REMAKE_ANIM_STATUS,     // gBattleAnims_StatusConditions (B_ANIM_STATUS_*)
    REMAKE_ANIM_GENERAL,    // gBattleAnims_General (B_ANIM_* : stat changes, substitute, weather...)
    REMAKE_ANIM_SPECIAL,    // gBattleAnims_Special (B_ANIM_* : balls, switches...)
};

struct RemakeState {
    uint32_t inBattle;
    uint32_t typeFlags;     // gBattleTypeFlags
    uint32_t environment;   // gBattleEnvironment (BATTLE_ENVIRONMENT_*)
    uint32_t battlerCount;
    uint32_t animActive;    // an animation script is running (gAnimScriptActive)
    uint32_t animSerial;    // counts the animations launched (a new one when it changes)
    uint16_t animTable;     // REMAKE_ANIM_* of the last one launched
    uint16_t animId;        // its index in that table
    uint8_t animAttacker, animTarget;
    uint8_t pad[2];
    uint32_t plttUnfaded;   // gPlttBufferUnfaded and gPlttBufferFaded (addresses): fades and tints
    uint32_t plttFaded;
    struct RemakeBattler battlers[REMAKE_BATTLERS];
};

// The game's hook (platform/patches/battle_anim.patch): an animation starts.
void RemakeBattleAnimation(const uint8_t *const animsTable[], uint16_t tableId, uint8_t isMoveAnim);

#endif // GUARD_REMAKE_STATE_H
