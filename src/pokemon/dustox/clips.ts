// Dustox's battle animation set: a clip of its own for every move in its
// movepool and every battle situation. The moth stage of the Wurmple line
// shares its choreography (src/pokemon/beautifly/moth/: the hover and the
// wing beat, flying to the foe to strike it, the storms and beams and
// powders), built here on Dustox's own stance and character: heavier and
// steadier than Beautifly, it beats its broad wings slower and narrower,
// bobs deeper with each stroke and acts a little slower; its own moves
// (./own.ts) reach out with its mind through its antennae (Confusion,
// Psybeam), hurl sludge from its mouth, dust toxic powder from its wings,
// drink with its antennae, soak in the moonlight and raise a wall of light.

import type { Clip } from '../../anim/clip';
import type { MothCharacter } from '../beautifly/moth/moth';
import { mothContact } from '../beautifly/moth/contact';
import { mothRanged } from '../beautifly/moth/ranged';
import { mothStatus } from '../beautifly/moth/status';
import { mothSituations } from '../beautifly/moth/situations';
import { dustoxOwn } from './own';
import { STANCE } from './poses';

export const DUSTOX: MothCharacter = { stance: STANCE, beat: 0.4, sweep: 44, lift: 30, bob: 0.025, bobPitch: 3, tempo: 1.12, hindCounter: 0.3 };

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [...mothSituations(DUSTOX), ...mothContact(DUSTOX), ...mothRanged(DUSTOX), ...mothStatus(DUSTOX), ...dustoxOwn(DUSTOX)].map((c) => [c.name, c]),
);

/**
 * Mouth atlas (mouth_mat: 4 x 2 cells; the mouth shows column 0 of row 1,
 * its usual thick downturned mouth): row 1 also holds a thin, slightly
 * rising line, a thin downturned line and a thin straight line; row 0 a
 * thick straight line, the mouth open wide, and two open curves. Offsets
 * from its usual mouth.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  gape: [1, 1],
  shut: [3, 0],
  frown: [2, 0],
  smile: [1, 0],
};
