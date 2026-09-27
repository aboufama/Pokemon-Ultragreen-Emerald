// Combusken's battle animation set: a clip of its own for every move it can
// know (named after the move) and for every battle situation. The clips live
// in ./clips/ by action family; ./clips/kit.ts has the helpers, the reusable
// deltas and the skipping travel every contact clip shares.

import type { Clip } from '../../anim/clip';
import { BODY_CLIPS } from './clips/body';
import { KICKS } from './clips/kicks';
import { PUNCHES } from './clips/punches';
import { RANGED } from './clips/ranged';
import { SITUATIONS } from './clips/situations';
import { STATUS } from './clips/status';
import { STRIKES } from './clips/strikes';

export const COMBUSKEN_CLIPS: Record<string, Clip> = Object.fromEntries(
  [...SITUATIONS, ...STRIKES, ...PUNCHES, ...KICKS, ...BODY_CLIPS, ...RANGED, ...STATUS].map((c) => [c.name, c]),
);

/** Eye atlas (pm0256_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const COMBUSKEN_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  worried: [1, 2],
  hurt: [0, 3],
};
