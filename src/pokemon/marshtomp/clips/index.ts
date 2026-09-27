// Marshtomp's battle animation set: a clip of its own for every move it can
// know (named after the move: mega_punch, body_slam...) and for every battle
// situation (src/battle3d/situations.ts), built from the kit (./kit.ts: the
// stance plus deltas, its heavy hop in and hop home). By action family:
//   fists.ts       Mega Punch, DynamicPunch, Ice Punch, Counter, Rock Smash,
//                  Strength, Seismic Toss
//   legs.ts        Mega Kick, Stomp, Earthquake
//   body.ts        the charges and crushes: Tackle, Take Down, Double-Edge,
//                  Body Slam, Return, Frustration, Facade, Secret Power,
//                  Endeavor, Struggle, Bide, Waterfall, Iron Tail, Rollout
//   burrow.ts      Dig and Dive, each turn
//   ranged.ts      water, mud, ice, rock and sound from home
//   status.ts      what it does to the foe and to itself
//   situations.ts  idle, intro, hit, faint and every other situation
// Clip names follow src/battle3d/actions.ts (moveClipName); Ice Ball plays
// Rollout's clip (the same action).

import type { Clip } from '../../../anim/clip';
import { BODY_CLIPS } from './body';
import { BURROW_CLIPS } from './burrow';
import { FIST_CLIPS } from './fists';
import { LEG_CLIPS } from './legs';
import { RANGED_CLIPS } from './ranged';
import { SITUATION_CLIPS } from './situations';
import { STATUS_CLIPS } from './status';

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [...SITUATION_CLIPS, ...FIST_CLIPS, ...LEG_CLIPS, ...BODY_CLIPS, ...BURROW_CLIPS, ...RANGED_CLIPS, ...STATUS_CLIPS].map((c) => [c.name, c]),
);

/** Eye atlas (pm0259_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  focus: [1, 2],
  hurt: [0, 3],
};
