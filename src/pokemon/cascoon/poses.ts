// Cascoon poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward; y: + turns toward its left; z: + tips an upright
// bone to its right). The bind pose stands upright on its silk strands, its
// eyes in the opening at its front, facing +Z.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites: the cocoon hunkered
 * down on its strands, its top settled forward so the eyes in its silk
 * opening glare out at the foe from under it; the upper strands swept back,
 * as the sprite draws them.
 */
export const STANCE: Pose = {
  expression: 'open',
  bones: {
    spine: { x: 3 },
    head: { x: 6, z: 2 },
    strandTop: { x: -8 },
    strandUpL: { z: 5 },
    strandUpR: { z: -5 },
  },
};
