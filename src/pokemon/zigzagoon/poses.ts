// Zigzagoon poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward; + raises a tail that points back)
//   y: yaw (+ turns toward the creature's left), z: roll
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Zigzagoon's bind pose stands on all fours facing +Z, the tail straight back.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: low on its short
 * legs, the head held low and forward, the big zigzag tail raised up and
 * back. The chest, the front legs and the head are square to the foe; the
 * body bends like a step of its zigzag, the rump and the tail swung out to
 * its left, so the long body and the tail read from both sides as the
 * sprites draw them (the front sprite's tail on the right, the back
 * sprite's on the left).
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.08 },
  expression: 'open',
  bones: {
    hips: { y: -34 },
    tail: { x: 30, y: -30 },
    tail2: { x: 12 },
    tail3: { x: 6 },
    neck: { y: -4 },
    head: { x: 2, y: -6 },
  },
  // The front legs are straight in the bind pose; aimed with the elbows
  // bent back, the foot IK always bends them back, however far the body
  // leans over the planted paws (straight, a lean forward left the solver
  // no elbow direction and the paws slipped off their spots). The IK sets
  // how far they bend.
  aim: {
    armL: { dir: [0, -0.866, -0.5] }, forearmL: { dir: [0, -0.866, 0.5] },
    armR: { dir: [0, -0.866, -0.5] }, forearmR: { dir: [0, -0.866, 0.5] },
  },
};
