// Linoone poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward; + raises a tail that points back)
//   y: yaw (+ turns toward the creature's left), z: roll
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Linoone's bind pose stands on its front legs facing +Z with the hind legs
// folded flat under the rump and the long tail straight back.
import type { Pose } from '../../anim/rig';

const FRONT_AIM: Pose['aim'] = {
  armL: { dir: [0, -0.866, -0.5] }, forearmL: { dir: [0, -0.866, 0.5] },
  armR: { dir: [0, -0.866, -0.5] }, forearmR: { dir: [0, -0.866, 0.5] },
};

/**
 * Battle stance matched to the stock Emerald sprites: low on its short legs
 * with the long body close to the ground, the neck raised and the head level,
 * eyes on the foe, the long striped tail swept up behind it in an S (the
 * front sprite's tall curling tail). The chest, the front legs and the head
 * are square to the foe; the rump swings out a little to its left and the
 * tail curls back across it, so from our side the curl of the tail shows at
 * the left and the head at the right, as the back sprite's arched back and
 * head do. The tail is rolled so its striped top shows from the front.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.294 },
  expression: 'open',
  bones: {
    hips: { x: 13, y: -25 },
    spine: { x: 6 },
    neck: { x: -56, y: 11 },
    head: { x: 30, y: -11 },
    tail: { x: 63, y: 34, z: -45 },
    tail2: { x: 0, y: -4 },
    tail3: { x: -19, y: -7 },
    tail4: { x: -36, y: -5 },
  },
  aim: FRONT_AIM,
};

