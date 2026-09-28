// Grovyle poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back;
//      + raises a bone that points backward, like the tail)
//   y: yaw (+ turns toward the creature's left; - curls a backward bone
//      toward its left), z: roll (+ raises a left arm, tilts a neck to its right)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Grovyle's bind pose is a T-pose facing +Z, upright, the tail straight back.
// The pelvis (Pelvis_02) carries the legs, the tail and the one torso bone
// (Spine_09), so the stance's forward lean is the pelvis's: the torso's own
// bends and twists then work on it as on an upright torso (Sceptile's first
// clips, ./set.ts), and a twist turns it about its own axis.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance in the spirit of the stock Emerald sprites, grounded and
 * facing the foe (battlers always face their opponent). The front sprite is
 * Grovyle caught mid-leap, side-on, its legs tucked under it; standing, it
 * is a forest ninja's crouch, ready to spring: both long feet planted, the
 * knees deep and forward over them; the body leaning well forward from the
 * hips and the long neck rising so the head looks level at the foe; the
 * right forearm held forward and low toward the foe with its leaf fan
 * hanging, the left arm cocked up and back with its leaf fan spread like a
 * wing (the sprite's raised arm); the tail stretched back and swept to its
 * left, the leaf brush trailing.
 *
 * Fit (tools/calibrate/candidates.mjs): enemy IoU 0.44 / box 0.90, player
 * 0.48 / 0.73. The front sprite's side-on leap, head in profile far out to
 * the left and almost half its silhouette long leaf fans, can't be covered
 * by a body facing the foe (check.mjs FIT_EXCEPTIONS); a right forearm
 * raised to a level guard measured under that exception (0.43 / 0.60 box on
 * our side, whose back sprite the hanging leaf fan fills).
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.07, z: -0.02 },
  expression: 'open',
  bones: {
    hips: { x: 45 },
    neck: { x: -38 },
    head: { x: -12 },
    // Under the tipped pelvis: the tail back and swept to its left (as it
    // lies on an upright pelvis at x 16, y -35), the brush trailing.
    tail: { x: -21.22, y: -36.26, z: 25.79 },
    tail2: { x: -8, y: -15 },
  },
  aim: {
    armR: { dir: [-0.45, -0.45, 0.77] },
    forearmR: { dir: [-0.2, -0.35, 0.92], twist: 90 },
    handR: { dir: [-0.1, -0.2, 0.97] },
    armL: { dir: [0.6, 0.25, -0.76] },
    forearmL: { dir: [0.35, 0.75, 0.56], twist: -90 },
    handL: { dir: [0.2, 0.9, 0.39] },
    thighL: { dir: [0.3, -0.35, 0.89] },
    shinL: { dir: [0.05, -0.8, -0.6] },
    thighR: { dir: [-0.3, -0.35, 0.89] },
    shinR: { dir: [-0.05, -0.8, -0.6] },
  },
};
