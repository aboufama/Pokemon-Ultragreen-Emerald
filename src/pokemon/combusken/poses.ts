// Combusken poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Combusken's bind pose stands upright facing +Z, arms spread down at its sides.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: a kicker's crane
 * stance on its left leg, the right knee drawn up with the talons spread at
 * the foe, the right arm reaching at it with the claws open, the left arm
 * swept back and down, the body leaning in, the head a little down, the
 * crest swept back.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  plantRight: 0,
  pelvis: { y: -0.03, z: 0.005 },
  expression: 'open',
  bones: {
    spine: { x: 4, y: 10 },
    chest: { x: 4, y: 6 },
    neck: { x: -6, y: -6 },
    head: { x: 0, y: -8 },
    crest: { x: -38 },
    crestL: { x: -34 },
    crestR: { x: -34 },
    tail: { x: -12 },
  },
  aim: {
    // The right knee drawn up at the foe, talons forward.
    thighR: { dir: [-0.25, 0.3, 0.92] },
    shinR: { dir: [-0.15, -0.15, 0.98] },
    // Standing on the left leg, the foot a little forward.
    thighL: { dir: [0.1, -0.9, 0.42] },
    shinL: { dir: [0.06, -0.94, -0.33] },
    // Right arm reaching forward and up at the foe, claws open.
    armR: { dir: [-0.4, 0.35, 0.85] },
    forearmR: { dir: [-0.3, 0.38, 0.87] },
    handR: { dir: [-0.22, 0.36, 0.9] },
    // Left arm swept back and down.
    armL: { dir: [0.45, -0.5, -0.74] },
    forearmL: { dir: [0.4, -0.55, -0.73] },
    handL: { dir: [0.35, -0.62, -0.7] },
  },
};
