// Poochyena's battle clips: every move in its movepool and every battle
// situation, built from the line's choreography (./line) on its own kit
// (./kit.ts: its stance, its beat, its body). A hyena pup: it darts in low
// and flat, snaps and tugs, rams with its head down, yelps when struck and
// bristles up again.
import type { Clip } from '../../anim/clip';
import { KIT } from './kit';
import { LINE_MOVES, LINE_SITUATIONS, lineClips } from './line';

export const CLIPS: Record<string, Clip> = lineClips(KIT, [...LINE_SITUATIONS, ...LINE_MOVES, 'sound']);

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
