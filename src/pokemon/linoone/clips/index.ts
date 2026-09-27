// Linoone's battle animation set: a clip of its own for every move it can
// know and for every battle situation. The kit (./kit.ts) holds the key
// helpers, the deltas and its straight-line dash; the clips are grouped by
// action family.
import type { Clip } from '../../../anim/clip';
import { makeGenericClips } from '../../generic/clips';
import { STANCE } from '../poses';

/** Eye atlas (pm0264_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  wink: [1, 1],
  closed: [0, 2],
  fierce: [1, 2],
  hurt: [0, 3],
};

export const CLIPS: Record<string, Clip> = makeGenericClips(STANCE);
