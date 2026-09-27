// Torchic's battle animation set: a small, plucky fire chick with tiny wing
// tufts and no arms. A clip of its own for every move it can know (named
// after the move) and for every battle situation. The clips live in
// ./clips/ by action family; ./clips/kit.ts has the helpers, the reusable
// deltas and the bouncing travel every contact clip shares.

import type { Clip } from '../../anim/clip';
import { BEAK_CLIPS } from './clips/beak';
import { BODY_CLIPS } from './clips/body';
import { RANGED } from './clips/ranged';
import { SITUATIONS } from './clips/situations';
import { STATUS } from './clips/status';
import { TALON_CLIPS } from './clips/talons';

export const TORCHIC_CLIPS: Record<string, Clip> = Object.fromEntries(
  [...SITUATIONS, ...BEAK_CLIPS, ...TALON_CLIPS, ...BODY_CLIPS, ...RANGED, ...STATUS].map((c) => [c.name, c]),
);

/** Eye atlas (pm0255_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const TORCHIC_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  worried: [1, 2],
  hurt: [0, 3],
};
