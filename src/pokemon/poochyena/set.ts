// Poochyena's battle animation set: a clip for every action its moves take,
// each keyed by hand in the style of the first clips of Blaziken, Sceptile
// and Swampert (src/pokemon/<slug>/first.ts, more.ts), one clip per action
// and played by every move of that action (index.ts maps the motifs):
//   ./set-base.ts     the helpers and reusable deltas (the stance's leap, landing, rear...)
//   ./set-moments.ts  idle, intro, hit, faint
//   ./set-contact.ts  bite, tackle, tackle_strong, strike, punch, tail, slam, burrow
//   ./set-afar.ts     the ranged and status clips, from home
// (The line's old choreography kit, ./line, stays for Mightyena until its own set replaces it.)

import type { Clip } from '../../anim/clip';
import { MOMENTS } from './set-moments';
import { CONTACT } from './set-contact';
import { AFAR } from './set-afar';

export const POOCHYENA_CLIPS: Record<string, Clip> = Object.fromEntries([...MOMENTS, ...CONTACT, ...AFAR].map((c) => [c.name, c]));

/** Eye atlas (pm0261_00_Eye1): 2 columns x 4 rows of 128x64 cells; the eyes' UVs sit in the bottom row. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  look: [1, 0],
  half: [0, -1],
  closed: [1, -1],
  happy: [0, -2],
  angry: [1, -2],
  hurt: [0, -3],
};
