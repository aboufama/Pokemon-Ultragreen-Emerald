// Silcoon poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward; y: + turns toward its left; z: + tips an upright
// bone to its right). The bind pose stands upright on three silk strands,
// its two eyes in the opening at its front, facing +Z.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites: the cocoon resting on
 * its strands, its top settled a little forward and tilted so the eyes in
 * its silk opening watch the foe; the strands radiate low and short round
 * its dome, as the sprites draw them (the top one tipped forward over its
 * brow, the upper pair lowered out to the sides, the side pair lifted).
 */
export const STANCE: Pose = {
  expression: 'open',
  bones: {
    spine: { x: 2 },
    head: { x: 4, z: -2 },
    strandTop: { x: 26 },
    strandUpL: { x: 10, z: -14 },
    strandUpR: { x: 10, z: 14 },
    strandL: { z: 10 },
    strandR: { z: -10 },
  },
};

