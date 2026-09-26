// Emerald's wild battle transitions (battle_transition.c), played over the
// screen as a battle starts: the screen flashes gray three times (Task_Intro,
// CreateIntroTask(0, 0, 3, 2, 2)), then the place's transition takes it to
// black. GetWildBattleTransition picks by the kind of place (surfable water
// or underwater: WATER; a cave: CAVE; else NORMAL) and by whether the wild
// Pokémon's level is below the player's (first column) or not (second):
//
//   NORMAL  SLICE           WHITE_BARS_FADE
//   CAVE    CLOCKWISE_WIPE  GRID_SQUARES
//   WATER   WAVE            RIPPLE
//
// The playtest's Pokémon are the same level, so the second column plays.
// The effects are the pixel pipeline's (PixelPipeline.setTransition), set a
// frame at a time with the decomp's timings; each transition ends black.

import type { RGB } from '../gba/bitmap';
import { GFX_META } from '../data';
import type { PixelPipeline } from '../render3d/pipeline';
import type { FrameClock } from './clock';

export type TransitionKind = 'normal' | 'cave' | 'water';

/** GetBattleTransitionTypeByMap for the playtest's places (by arena). */
export function transitionKind(arena: string): TransitionKind {
  if (arena === 'water' || arena === 'underwater') return 'water';
  if (arena === 'cave') return 'cave';
  return 'normal';
}

/** RGB(11, 11, 11), the intro's flash color, as the pipeline's RGB555 expands it. */
const GRAY: RGB = [90, 90, 90];
const BLACK: RGB = [0, 0, 0];

/** The wild battle transition for a kind of place; resolves on a black screen. */
export async function wildTransition(pipe: PixelPipeline, clock: FrameClock, kind: TransitionKind): Promise<void> {
  // Task_Intro: to gray and back, 2/16 a frame each way, three times.
  for (let n = 0; n < 3; n++) {
    for (const k of [2, 4, 6, 8, 10, 12, 14, 16, 14, 12, 10, 8, 6, 4, 2, 0]) {
      pipe.setTransition({ blend: { color: GRAY, amount: k / 16 } });
      await clock.frames(1);
    }
  }
  if (kind === 'normal') await whiteBarsFade(pipe, clock);
  else if (kind === 'cave') await gridSquares(pipe, clock);
  else await ripple(pipe, clock);
  // FadeScreenBlack.
  pipe.setTransition({ blend: { color: BLACK, amount: 1 } });
}

/**
 * WhiteBarsFade: eight bars of 20 rows, each starting after its delay, turn
 * white from the right edge in (the window's edge moves 16 px a frame, the
 * lightening rises 1/2 a frame to 16); once every bar is white the whole
 * screen is, then it darkens to black, one step a frame.
 */
async function whiteBarsFade(pipe: PixelPipeline, clock: FrameClock): Promise<void> {
  const bars = [0, 20, 15, 40, 10, 25, 35, 5].map((delay) => ({ delay, x: 240, fade: 0, shown: { x: 240, y: 0 }, done: false }));
  while (!bars.every((b) => b.done)) {
    for (const b of bars) {
      if (b.delay) {
        b.delay--;
        continue;
      }
      b.shown = { x: b.x, y: Math.floor(b.fade) / 16 };
      if (b.x === 0 && b.fade === 16) b.done = true;
      b.x = Math.max(0, b.x - 16);
      b.fade = Math.min(16, b.fade + 0.5);
    }
    pipe.setTransition({ bars: bars.map((b) => b.shown) });
    await clock.frames(1);
  }
  // BlendPalettes to white, then BLDY darken 0 -> 16.
  for (let k = 0; k <= 16; k++) {
    const v = Math.round(255 * (1 - k / 16));
    pipe.setTransition({ blend: { color: [v, v, v], amount: 1 } });
    await clock.frames(1);
  }
}

/**
 * GridSquares: every 8x8 cell of the screen fills with black in a spiral from
 * its edge to its middle (the shrinking-box tiles, one every 3 frames), then
 * the screen holds black for 15 frames.
 */
async function gridSquares(pipe: PixelPipeline, clock: FrameClock): Promise<void> {
  const fill = GFX_META.gridSquaresFill;
  for (let stage = 1; stage <= 14; stage++) {
    pipe.setTransition({ grid: { stage, fill } });
    await clock.frames(3);
  }
  await clock.frames(15);
}

/**
 * Ripple: the rows sway up and down on a sine that runs down the screen
 * (0x180 per row, 0x400 a frame) with an amplitude growing 1.5 px a frame to
 * about 33; on the 81st frame the palettes fade to black, 4/16 a frame.
 */
async function ripple(pipe: PixelPipeline, clock: FrameClock): Promise<void> {
  let amp = 0, sin = 0, timer = 0, fade = -1;
  while (fade < 16) {
    const shown = { amp: amp >> 8, sin };
    sin = (sin + 0x400) & 0xffff;
    if (amp <= 0x1fff) amp += 0x180;
    if (++timer === 81) fade = 0;
    if (fade >= 0) fade = Math.min(16, fade + 4);
    pipe.setTransition({ ripple: shown, blend: fade > 0 ? { color: BLACK, amount: fade / 16 } : undefined });
    await clock.frames(1);
  }
}
