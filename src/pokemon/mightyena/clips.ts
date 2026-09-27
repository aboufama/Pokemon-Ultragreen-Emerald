// Mightyena's battle clips: every move in its movepool and every battle
// situation, built from the Poochyena line's choreography
// (src/pokemon/poochyena/line) on its own kit (./kit.ts: its stance, its
// beat, its body). A pack hunter: it stalks, then explodes into a long
// pounce and lands its weight and its heavy jaws on the foe.
import type { Clip } from '../../anim/clip';
import { LINE_MOVES, LINE_SITUATIONS, lineClips } from '../poochyena/line';
import { KIT } from './kit';

// Its own besides the line's: Strength, Hyper Beam, and its ability's Intimidate.
export const CLIPS: Record<string, Clip> = lineClips(KIT, [...LINE_SITUATIONS, 'intimidate', ...LINE_MOVES, 'strength', 'hyper_beam', 'sound']);

/** Eye atlas (pm0262_00_Eye1): 2 columns x 4 rows of 128x64 cells; the eyes' UVs sit in the top row. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  look: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  angry: [1, 2],
  hurt: [0, 3],
};
