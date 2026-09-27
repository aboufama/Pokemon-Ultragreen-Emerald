// Mightyena poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward, lowers a bone that points
//      forward, raises one that points back: the tail, the mane)
//   y: yaw (+ turns toward the creature's left), z: roll
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Mightyena's bind pose stands square on all fours facing +Z, the jaws wide
// open and the tail straight out behind.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites' posture: a hunter
 * squared up to the foe on straight, stiff legs, head held high on a raised
 * neck and looking straight at it, jaws shut over the bared fangs, and the
 * brush of a tail carried high and curling up behind. Its chest and head
 * face the foe; its hindquarters stand swung off to its left, the way a
 * wolf squares up with its body turned: the sprites' three-quarter view
 * (tail to the right from the front, the mane and tail to the left from
 * behind), without turning away.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.01 },
  expression: 'open',
  bones: {
    // Hindquarters swung to its left; the chest and head stay square.
    hips: { y: -40 },
    spine: { x: 2 },
    neck: { x: -14 },
    neck2: { x: -8 },
    head: { x: 16 },
    // Jaws shut over the fangs.
    jaw: { x: -22 },
    // The tail carried high, the brush curling up.
    tail: { x: 16 },
    tail2: { x: 6 },
    tail3: { x: 8 },
    tail4: { x: 10 },
    tail5: { x: 8 },
    earL: { x: 6 },
    earR: { x: 6 },
  },
};
