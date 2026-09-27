// Silcoon's battle animation set: a clip of its own for every move in its
// movepool and every battle situation. The cocoon stage of the Wurmple line
// shares its choreography (./cocoon/: the hop and throw at the foe, the
// tips, wobbles and swells), built here on Silcoon's own stance and
// character: light for a cocoon and watchful, it hops and tips further and
// quicker than Cascoon, glances round with a squint as it sways from its
// thread in its idle, and shakes itself off with a rocking shake.

import type { Clip } from '../../anim/clip';
import type { CocoonCharacter } from './cocoon/cocoon';
import { cocoonMoves } from './cocoon/moves';
import { cocoonSituations } from './cocoon/situations';
import { STANCE } from './poses';

const SILCOON: CocoonCharacter = { stance: STANCE, tempo: 1, bounce: 1, watchful: true };

export const CLIPS: Record<string, Clip> = Object.fromEntries([...cocoonSituations(SILCOON), ...cocoonMoves(SILCOON)].map((c) => [c.name, c]));

/**
 * Eye atlas (eye_mat: 4 x 2 cells; the eyes show column 0 of row 1): row 1
 * holds the open eye, the closed eye, a half-lidded watchful squint and a
 * happy closed curve; row 0 a squeezed-shut line. Offsets from the open cell.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  closed: [1, 0],
  half: [2, 0],
  happy: [3, 0],
  squeeze: [0, 1],
};
