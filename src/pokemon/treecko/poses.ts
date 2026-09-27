// Treecko poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back;
//      + raises a bone that points backward, like the tail)
//   y: yaw (+ turns toward the creature's left; - curls a backward bone
//      toward its left), z: roll (+ raises a left arm, tilts the head to its right)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Treecko's bind pose (skeleton.json) is a T-pose facing +Z: arms straight
// out, legs straight down, the leaf tail lying on the ground behind it.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance with the posture of the stock Emerald sprites, facing the foe
 * (battlers always face their opponent): up on its long flat feet with the
 * knees a little bent (the sprites draw short legs under a big head); the
 * arms held out wide to the sides at shoulder height, elbows soft and the big
 * three-fingered hands turned up and open, the way both sprites spread them;
 * the huge head up and square to the foe, cocked a little (cool and calm, it
 * glares right back); the thick leaf tail swept round to its left behind it,
 * its root lifted off the ground and the tip curling up.
 * Fit (tools/calibrate/candidates.mjs): enemy IoU 0.59 / box 0.79, player
 * 0.53 / 0.81; the straight-legged version missed the enemy box (0.73).
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.035 },
  expression: 'open',
  bones: {
    spine: { x: 6 },
    chest: { x: 2 },
    neck: { x: -2 },
    head: { x: -5, z: 3 },
    tail: { x: 8, y: -26 },
    tail2: { x: 3, y: -8 },
    tail3: { y: -6 },
    tail4: { x: 3, y: -4 },
    tail5: { x: 10 },
  },
  aim: {
    armL: { dir: [0.95, 0.04, 0.3] },
    forearmL: { dir: [0.8, 0.36, 0.48] },
    handL: { dir: [0.55, 0.66, 0.52], twist: 70 },
    armR: { dir: [-0.95, 0.04, 0.3] },
    forearmR: { dir: [-0.8, 0.36, 0.48] },
    handR: { dir: [-0.55, 0.66, 0.52], twist: -70 },
    thighL: { dir: [0.12, -0.99, 0.05] },
    shinL: { dir: [0.05, -0.99, -0.06] },
    thighR: { dir: [-0.12, -0.99, 0.05] },
    shinR: { dir: [-0.05, -0.99, -0.06] },
  },
};
