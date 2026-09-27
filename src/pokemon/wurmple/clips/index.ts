// Wurmple's battle animation set: a clip of its own for every move in its
// movepool (moves.ts) and for every battle situation (situations.ts), built
// from the kit in kit.ts.

import type { Clip } from '../../../anim/clip';
import { MOVES } from './moves';
import { SITUATIONS } from './situations';

export const CLIPS: Record<string, Clip> = Object.fromEntries([...SITUATIONS, ...MOVES].map((c) => [c.name, c]));

/** Eye atlas (4 x 4 cells of 64 px): row 0 open, row 1 lidded, row 2 shut. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  half: [0, 1],
  closed: [0, 2],
};
