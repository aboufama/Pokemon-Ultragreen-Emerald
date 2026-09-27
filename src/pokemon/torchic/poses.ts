// Torchic poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging part back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left wing)
// `aim`: model-space directions ([x, y, z], +X = its left, +Z = forward)
// Torchic's bind pose stands upright facing +Z, crest straight up.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites: a plump chick on
 * short, slightly bent legs, leaning into the foe with its head up, the
 * tiny wing tufts held a little out from the collar and the tail cocked up.
 * The crest's three plumes stand up fanned with their tips swept back: tall
 * from our side, as the back sprite draws them (swept back from the base,
 * their backs faced down, away from the light, and read as a flat taupe
 * tuft), and sweeping up and back from the foe's side as the front sprite's.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.016, z: 0.004 },
  expression: 'open',
  bones: {
    spine: { x: 12 },
    chest: { x: 5 },
    head: { x: -14 },
    crest: { x: -10 },
    crestTip: { x: -18 },
    crestL: { x: -6, z: 18 },
    crestR: { x: -6, z: -18 },
    crestTipL: { x: -16 },
    crestTipR: { x: -16 },
    wingAL: { z: 14 }, wingBL: { z: 14 }, wingCL: { z: 12 },
    wingAR: { z: -14 }, wingBR: { z: -14 }, wingCR: { z: -12 },
    tail: { x: -18 },
  },
};
