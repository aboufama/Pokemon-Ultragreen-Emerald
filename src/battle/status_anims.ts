// The stock game's status animations, frame for frame, not remade:
//
//   stats change  General_StatsChange -> AnimTask_StatsChange ->
//                 StatsChangeAnimation_Step1-3 (battle_anim_utility_funcs.c):
//                 the stat_change BG1 layer (rising chevrons, or falling ones
//                 for a drop) in the stat's colors (gray when several change
//                 at once), seen only inside the battler (the OBJ window of an
//                 invisible copy of its sprite; here its pixel id) and blended
//                 over it up to 10/16 (13/16 sharply), scrolling 3 px a frame;
//                 SE_M_STAT_INCREASE / SE_M_STAT_DECREASE on the battler.
//   burn          Status_Burn (battle_anim_scripts.s): three small flames
//                 (gBurnFlameSpriteTemplate: AnimBurnFlame ->
//                 AnimTravelDiagonally) cross the battler's feet 4 frames
//                 apart, 20 frames each; SE_M_FLAME_WHEEL on it.
//
// The timelines here are the game's code transcribed; the scene plays them on
// its frame clock (src/battle/scene.ts), the pixel pipeline draws the stat
// layer (setStatLayer) and the scene's sprite layer the flames.

import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { GFX_META } from '../data';
import type { Side, StatKey } from './engine';

/** AnimTask_StatsChange's palette per stat (STAT_ANIM_PAL_*); several stats at once are gray. */
const STAT_PALETTES: Record<StatKey, string> = {
  attack: 'attack', defense: 'defense', speed: 'speed', spAttack: 'sp_attack',
  spDefense: 'sp_defense', accuracy: 'accuracy', evasion: 'evasion',
};

export function statPalette(stats: StatKey[]): RGB[] {
  const name = stats.length > 1 ? 'multiple' : STAT_PALETTES[stats[0]];
  return (GFX_META.statChangePalettes[name] ?? []) as RGB[];
}

export interface StatsChangeFrame {
  /** BLDALPHA's EVA (the layer's weight /16). */
  eva: number;
  /** gBattle_BG1_X / gBattle_BG1_Y. */
  scroll: [number, number];
}

/** StatsChangeAnimation_Step2-3, one entry per frame until the layer is gone. */
export function statsChangeFrames(decrease: boolean, sharply: boolean): StatsChangeFrame[] {
  const targetBlend = sharply ? 13 : 10;
  const waitTime = sharply ? 30 : 20;
  const velocity = decrease ? -3 : 3;
  const x = decrease ? 64 : 0;
  let y = 0, state = 0, fadeTimer = 0, waitTimer = 0, blend = 0;
  const frames: StatsChangeFrame[] = [];
  for (;;) {
    y += velocity;
    if (state === 0) {
      // Fade in: one step every other frame.
      if (fadeTimer++ > 0) {
        fadeTimer = 0;
        if (++blend === targetBlend) state++;
      }
    } else if (state === 1) {
      if (++waitTimer === waitTime) state++;
    } else if (state === 2) {
      if (fadeTimer++ > 0) {
        fadeTimer = 0;
        if (--blend === 0) state++;
      }
    } else break;
    frames.push({ eva: blend, scroll: [x, ((y % 256) + 256) % 256] });
  }
  return frames;
}

const layers = new Map<string, Promise<THREE.Texture>>();

/** The stat change layer (color indices x 17), increase or decrease. */
export function statLayer(decrease: boolean): Promise<THREE.Texture> {
  const name = decrease ? 'decrease' : 'increase';
  let p = layers.get(name);
  if (!p) {
    p = new THREE.TextureLoader().loadAsync(asset(`gba/battle_anims/stat_change_${name}.png`)).then((t) => {
      t.flipY = false;
      t.magFilter = t.minFilter = THREE.NearestFilter;
      t.generateMipmaps = false;
      t.colorSpace = THREE.NoColorSpace;
      t.needsUpdate = true;
      return t;
    });
    layers.set(name, p);
  }
  return p;
}

/** sBattlerCoords in a single battle: where each battler's sprite sits. */
const BATTLER_COORDS: Record<Side, [number, number]> = { player: [72, 80], opponent: [176, 40] };

export interface FlameSprite {
  /** Center of the 32x32 sprite, in GBA pixels. */
  x: number;
  y: number;
  /** Frame of gAnims_BasicFire (SmallEmber: 5 frames of 32x32, 4 ticks each). */
  frame: number;
}

/**
 * Status_Burn: per frame, the flames on screen. Each BurnFlame starts 24 px
 * to one side of the battler and 24 px below its coordinate and moves 48 px
 * across it in 20 frames (AnimTravelDiagonally with AnimBurnFlame's negated
 * x offsets; left to right on the foe, right to left on our Pokémon), then is
 * gone; the script creates one every 4 frames.
 */
export function burnFlameFrames(side: Side): FlameSprite[][] {
  const [bx, by] = BATTLER_COORDS[side];
  // SetAnimSpriteInitialXOffset with the battler as both attacker and target: by side.
  const startX = side === 'opponent' ? bx - 24 : bx + 24;
  const endX = side === 'opponent' ? bx + 24 : bx - 24;
  const y = by + 24;
  // InitAnimLinearTranslation: 8.8 fixed-point steps, the low bit the direction.
  const left = endX < startX;
  const step = ((Math.abs(endX - startX) << 8) / 20) & 0xfffe | (left ? 1 : 0);
  const DURATION = 20, APART = 4, COUNT = 3;
  const frames: FlameSprite[][] = [];
  for (let f = 0; f < APART * (COUNT - 1) + DURATION; f++) {
    const shown: FlameSprite[] = [];
    for (let k = 0; k < COUNT; k++) {
      const age = f - k * APART;
      if (age < 0 || age >= DURATION) continue;
      // StartAnimLinearTranslation steps at once, so frame 0 shows the first step.
      const moved = ((step * (age + 1)) & 0xffff) >> 8;
      shown.push({ x: startX + (left ? -moved : moved), y, frame: Math.floor(age / 4) % 5 });
    }
    frames.push(shown);
  }
  return frames;
}
