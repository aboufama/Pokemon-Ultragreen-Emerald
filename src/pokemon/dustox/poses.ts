// Dustox poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward, swings a hanging one back; y: + turns toward its
// left, and sweeps its left wing back; z: + raises its left wing, tips an
// upright bone to its right). The bind pose holds it upright with its two
// wings spread behind it in a fan, facing +Z.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance: a moth hovering squared up to the foe. As the foe it floats
 * off the ground (calibration lift) as its stock front sprite does
 * (elevation 10); on our side the text box hides where it hovers, and a lift
 * there took its head above the back sprite's. Its broad wings are spread
 * wide to its sides and raised a touch: the middle of the wing beat every
 * clip plays around (the sprites draw them wide open; raised higher, the
 * model grew taller than the sprites are wide and the front fit fell apart).
 * The thorax leans in a little at the foe with the abdomen tucked under it,
 * the head up with its feathery antennae standing, and the two pairs of
 * little red legs drawn up in front of its chest, clawed and ready. It never
 * stands: nothing is planted.
 */
export const STANCE: Pose = {
  plantFeet: 0,
  expression: 'open',
  bones: {
    hips: { x: -6 },
    spine: { x: 9 },
    head: { x: -4 },
    armL: { y: -30, z: -8 },
    armR: { y: 30, z: 8 },
    legL: { y: -24, z: -14 },
    legR: { y: 24, z: 14 },
    wingL: { y: -15, z: 6 },
    wingR: { y: 15, z: -6 },
  },
};
