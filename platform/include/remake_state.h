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
    int16_t homeX, homeY;   // where its centre rests (the position the game creates the sprite at)
    int16_t matrix[4];      // pa, pb, pc, pd (8.8) when affine
    uint8_t affineMode;     // 0 off, 1 affine, 3 double size
    uint8_t hFlip;
    uint16_t tileNum;       // its OAM tile: the key the PPU's stand-in picture uses
    uint8_t paletteNum;     // its OBJ palette (fades and tints)
    uint8_t priority;
    uint8_t objMode;
    uint8_t invisible;
    uint8_t showsPokemon;   // the sprite shows its Pokémon (in the intro the trainer's picture takes its place)
    uint8_t command;        // the last command the battle engine gave its controller (CONTROLLER_*: a hit, a faint...)
    uint16_t commandSerial; // counts them (a new one when it changes)
    uint32_t callback;      // its sprite callback (function table index): what it is doing
    uint32_t personality;
    uint16_t hp, maxHp;
    uint8_t healthboxShown; // its healthbox is on the screen (a wild Pokémon's shows as it cries)
};

// Which table a battle animation comes from.
enum {
    REMAKE_ANIM_NONE,
    REMAKE_ANIM_MOVE,       // gBattleAnims_Moves: the id is the move
    REMAKE_ANIM_STATUS,     // gBattleAnims_StatusConditions (B_ANIM_STATUS_*)
    REMAKE_ANIM_GENERAL,    // gBattleAnims_General (B_ANIM_* : stat changes, substitute, weather...)
    REMAKE_ANIM_SPECIAL,    // gBattleAnims_Special (B_ANIM_* : balls, switches...)
};

// What the battle background (BG3) shows: the main one (the place's, as
// DrawMainBattleBackground draws it) or a move's (BG_* of a move animation's
// fadetobg or changebg).
#define REMAKE_BG_MAIN 0xFFFF
#define REMAKE_NO_BATTLER 0xFF

struct RemakeState {
    uint32_t inBattle;
    uint32_t battleScreen;  // the battle's screen is up (its VBlank callback runs), not a menu over it
    uint32_t typeFlags;     // gBattleTypeFlags
    uint32_t environment;   // gBattleEnvironment (BATTLE_ENVIRONMENT_*)
    uint32_t battlerCount;
    uint32_t animActive;    // an animation script is running (gAnimScriptActive)
    uint32_t animSerial;    // counts the animations launched (a new one when it changes)
    uint16_t animTable;     // REMAKE_ANIM_* of the last one launched
    uint16_t animId;        // its index in that table
    uint8_t animAttacker, animTarget;
    uint8_t animHits;       // gMultiHitCounter as it launched: the hits left, this one included (0: one hit)
    uint8_t animTurn;       // gAnimMoveTurn: a two-turn move's charging turn is 0, its strike 1
    uint8_t animHeld;       // the game holds the move's animation at its start until the remake lets it go
    uint8_t animStatArg;    // a stat change's animation: gBattleSpritesDataPtr->animationData->animArg (its
                            // STAT_ANIM_* kind: rises and falls, by how much)
    uint8_t moveResult;     // gMoveResultFlags (MOVE_RESULT_*: super effective, missed...) and a critical hit
    uint8_t critical;       // (gCritMultiplier over 1), for how the foe takes the hit
    uint16_t failSerial;    // counts the moves that failed at the foe (missed, protected against, no effect: they
                            // show no animation); the last one's attacker, foe, move and gMoveResultFlags
    uint16_t failMove;
    uint8_t failAttacker, failTarget, failResult, pad1;
    uint16_t background;    // REMAKE_BG_MAIN, or the move background shown
    uint8_t copyBattler[2]; // the battler whose sprite a move animation drew into BG1, BG2 (MoveBattlerSpriteToBG:
                            // the copy moves as the background scrolls), or REMAKE_NO_BATTLER
    uint8_t copyPalette[2]; // the background palette the copy is drawn in
    uint32_t plttUnfaded;   // gPlttBufferUnfaded and gPlttBufferFaded (addresses): fades and tints
    uint32_t plttFaded;
    struct RemakeBattler battlers[REMAKE_BATTLERS];
};

// The remake layer's pictures, which the platform's PPU composes as its own
// layers (docs/ARCHITECTURE.md, "How the pictures combine"): the browser
// fills them at the start of each frame (PlatformHostFrameStart), from the
// hardware's state for that frame. A pixel has REMAKE_OPAQUE set where the
// picture has something.
#define REMAKE_OPAQUE 0x8000u
#define REMAKE_LAYER_SPRITES 4
// The backgrounds' pictures: the battle's arena (BG3), and a battler's copy
// in BG1 and in BG2 (RemakeState.copyBattler).
#define REMAKE_LAYER_BACKGROUNDS 3
// A tile no OAM entry draws (tile numbers are 10 bits): a free sprite
// picture whose sprite is gone stands in for no entry.
#define REMAKE_NO_TILE 0xFFFFu
#define REMAKE_PIXELS (240 * 160)
// The background's picture has a margin around the screen, so the game can
// shake the background (a uniform scroll: RemakeBackground.panX/Y) up to it.
#define REMAKE_BG_MARGIN 16  // within the arenas' painted margin (src/render3d/arena/design.ts PAINT_*)
#define REMAKE_BG_WIDTH (240 + 2 * REMAKE_BG_MARGIN)
#define REMAKE_BG_HEIGHT (160 + 2 * REMAKE_BG_MARGIN)
#define REMAKE_BG_PIXELS (REMAKE_BG_WIDTH * REMAKE_BG_HEIGHT)

// What a picture's pixels hold (below REMAKE_OPAQUE).
enum {
    REMAKE_FORMAT_COLOR,    // the GBA's color
    REMAKE_FORMAT_INDEX,    // a color index in the palette of the sprite it stands in for (a free
                            // picture's or a background's: `palette`), as its tiles hold: the palette the
                            // hardware has when the line is drawn (the game's fades and tints) colors it
};

struct RemakeBackground {
    uint32_t active;        // the picture replaces the background's pixels
    uint32_t bg;            // which background (3: the battle's; 1, 2: a battler's copy)
    uint32_t format;        // REMAKE_FORMAT_*
    uint32_t palette;       // an index's 16-color background palette
    int32_t panX, panY;     // the screen shows the picture moved by this (-margin..margin): the background's scroll
    uint16_t pixels[REMAKE_BG_PIXELS];  // the screen at (REMAKE_BG_MARGIN, REMAKE_BG_MARGIN)
};

struct RemakeSprite {
    uint32_t active;        // the picture replaces the sprite's OAM entries
    uint32_t tileNum;       // the entries with this first tile are the sprite's (and its copies': afterimages, a window)
    uint32_t format;        // REMAKE_FORMAT_*
    int32_t centerX;        // the centre of the entry the picture was drawn for: another entry
    int32_t centerY;        // shows it moved by the difference of their centres
    uint32_t free;          // the picture shows where it is, once, whatever the entries do (they show
                            // nothing; the sprite may be gone): a fainting body, while its sprite slides
                            // away. It is drawn at `priority`, behind the entries of that priority
    uint32_t priority;
    uint32_t palette;       // a free picture's 16-color sprite palette
    uint16_t pixels[REMAKE_PIXELS];
};

struct RemakeLayers {
    struct RemakeBackground backgrounds[REMAKE_LAYER_BACKGROUNDS];
    struct RemakeSprite sprites[REMAKE_LAYER_SPRITES];
};

// The game's hooks (platform/patches/battle_anim.patch, battle_bg.patch): an
// animation starts; the battle background is drawn (REMAKE_BG_MAIN or a move's);
void RemakeBattleAnimation(const uint8_t *const animsTable[], uint16_t tableId, uint8_t isMoveAnim);
void RemakeBattleBackground(uint16_t background);
// (platform/patches/battle_controllers.patch) the battle engine gives a battler's controller a command.
void RemakeBattlerCommand(uint8_t battler, uint8_t command);
// (platform/patches/battle_anim.patch, battle_anim_mons.patch) a move animation draws a battler's
// sprite into BG1 or BG2 in `palette`; the background is cleared or given other pictures (REMAKE_NO_BATTLER).
void RemakeBattlerCopy(uint8_t bg, uint8_t battler, uint8_t palette);
// LaunchBattleAnimation, once the script is set to run: a move's animation
// waits at its start while the page holds animations (RemakeHoldAnimations)
// until the remake's 3D attacker is where the game's own effects begin (its
// strike landing, its breath leaving): RemakeReleaseAnimation.
void RemakeHoldAnimation(uint8_t isMoveAnim);
// JumpIfMoveFailed, when a move fails at its foe (it missed, the foe
// protected itself, or it has no effect on it): no animation shows it, so the
// remake acts it out (the attacker strikes, the foe dodges or shrugs it off).
void RemakeMoveFailed(uint8_t attacker, uint8_t target, uint16_t move, uint8_t result);

#endif // GUARD_REMAKE_STATE_H
