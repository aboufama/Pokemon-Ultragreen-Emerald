// Blaziken poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Blaziken's bind pose is a T-pose facing +Z.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: wide split stance,
 * torso leaning forward, right claw reaching low and forward, left arm cocked
 * back at the hip, mane swept back and down behind the head.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.05, z: -0.01 },
  expression: 'open',
  bones: {
    hips: { y: 6 },
    tail: { x: 14 },
    spine: { x: 18, y: -10 },
    chest: { x: 10, y: -6 },
    neck: { x: -8, y: 4 },
    head: { x: -14, y: 10, z: -4 },
    handL: { z: -20 },
    handR: { z: 16, y: 10 },
    fingerA1L: { z: -18 }, fingerB1L: { z: -18 }, fingerC1L: { z: -18 },
    fingerA1R: { z: 24 }, fingerB1R: { z: 24 }, fingerC1R: { z: 24 },
    fingerA2R: { z: 12 }, fingerB2R: { z: 12 }, fingerC2R: { z: 12 },
  },
  aim: {
    // Mane swept to its left-back: reads on screen-right in the front view and
    // screen-left in the back view, like the stock sprites.
    hairTipL: { dir: [0.62, -0.28, -0.73] },
    hairTipR: { dir: [0.3, -0.3, -0.9] },
    thighL: { dir: [0.34, -0.9, -0.26] },
    thighR: { dir: [-0.32, -0.86, 0.4] },
    shinL: { dir: [0.24, -0.96, 0.12] },
    shinR: { dir: [-0.2, -0.97, -0.08] },
    // Right arm reaching forward and low, claws open.
    armR: { dir: [-0.42, -0.42, 0.8], twist: -20 },
    forearmR: { dir: [-0.2, -0.3, 0.93] },
    // Left arm cocked back, claw chambered at the hip.
    armL: { dir: [0.5, -0.66, -0.56] },
    forearmL: { dir: [0.18, -0.2, 0.96] },
  },
};
