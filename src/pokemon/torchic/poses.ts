// Torchic poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging part back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left wing)
// `aim`: model-space directions ([x, y, z], +X = its left, +Z = forward)
// Torchic's bind pose stands upright facing +Z, crest straight up.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance in the stock Emerald sprites' spirit, ready: a plump chick
 * square to the foe on both feet, a little low in its short legs and
 * leaning in with its head up, the tiny wing tufts held up and out from the
 * collar like little fists and the tail cocked up. The crest's three plumes
 * stand up fanned with their tips swept back: tall from our side, as the
 * back sprite draws them (swept back from the base, their backs faced down,
 * away from the light, and read as a flat taupe tuft), and sweeping up and
 * back from the foe's side as the front sprite's.
 *
 * The legs are written out where they rest (their bind directions, planted
 * by the feet's IK), so every clip's keys aim them: a leap folds them from
 * here and lands back on them smoothly instead of switching halfway.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.024, z: 0.006 },
  expression: 'open',
  bones: {
    spine: { x: 14 },
    chest: { x: 6 },
    head: { x: -17 },
    crest: { x: -10 },
    crestTip: { x: -18 },
    crestL: { x: -6, z: 18 },
    crestR: { x: -6, z: -18 },
    crestTipL: { x: -16 },
    crestTipR: { x: -16 },
    wingAL: { z: 18, y: -4 }, wingBL: { z: 18, y: -4 }, wingCL: { z: 15, y: -3 },
    wingAR: { z: -18, y: 4 }, wingBR: { z: -18, y: 4 }, wingCR: { z: -15, y: 3 },
    tail: { x: -18 },
  },
  aim: {
    thighL: { dir: [0, -0.935, -0.355] }, shinL: { dir: [0, -0.98, 0.2] },
    thighR: { dir: [0, -0.935, -0.355] }, shinR: { dir: [0, -0.98, 0.2] },
  },
};
