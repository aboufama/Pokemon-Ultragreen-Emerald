// Cascoon's battle animation set: a clip of its own for every move in its
// movepool and every battle situation. The cocoon stage of the Wurmple line
// shares its choreography (src/pokemon/silcoon/cocoon/: the hop and throw at
// the foe, the tips, wobbles and swells), built here on Cascoon's own stance
// and character: heavier than Silcoon and made to hide motionless, it moves
// slower and stiffer, hops and tips less, holds its glare on the foe in its
// idle, and sheds an ailment with a shivering heave (Shed Skin: shake_off).

import type { Clip } from '../../anim/clip';
import type { CocoonCharacter } from '../silcoon/cocoon/cocoon';
import { cocoonMoves } from '../silcoon/cocoon/moves';
import { cocoonSituations } from '../silcoon/cocoon/situations';
import { STANCE } from './poses';

const CASCOON: CocoonCharacter = { stance: STANCE, tempo: 1.12, bounce: 0.85, watchful: false };

export const CLIPS: Record<string, Clip> = Object.fromEntries([...cocoonSituations(CASCOON), ...cocoonMoves(CASCOON)].map((c) => [c.name, c]));

/**
 * Eye atlas (eye_mat: 4 x 2 cells; the eyes show column 0 of row 1, a
 * slanted glaring eye): row 1 holds the open eye, the closed eye, a narrowed
 * glare and a happy closed curve; row 0 a squeezed-shut line. Offsets from
 * the open cell.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  closed: [1, 0],
  half: [2, 0],
  happy: [3, 0],
  squeeze: [0, 1],
};
