// Marshtomp poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Marshtomp's bind pose is a T-pose facing +Z, mouth open, the tail lobes
// rising behind it.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: squat and square
 * to the foe on its short, toughened hind legs, knees bent and wide; both
 * arms raised up and out in a Y with the hands open at head height; the big
 * mouth open in its grin; the two tail lobes splayed out on the ground
 * behind its feet, as both sprites draw them.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.02 },
  expression: 'open',
  bones: {
    spine: { x: -2 },
    head: { x: -4 },
    // The head fin turned a little toward its right: the enemy camera sees
    // the foe from its front-left and ours from its back-right, so a fin
    // turned that way shows its broad black face from both sides, as the
    // three-quarter sprites draw it (square to the foe it shows only its edge).
    fin: { y: -36 },
    // Tail lobes swung down and out onto the ground behind the feet.
    tailL: { x: -48, y: -28 },
    tailR: { x: -48, y: 28 },
    // Knees out a little: a wide, planted wrestler's squat.
    thighL: { z: -10 },
    thighR: { z: 10 },
  },
  aim: {
    armL: { dir: [0.88, 0.36, 0.3] },
    forearmL: { dir: [0.42, 0.86, 0.28] },
    handL: { dir: [0.3, 0.92, 0.24] },
    armR: { dir: [-0.88, 0.36, 0.3] },
    forearmR: { dir: [-0.42, 0.86, 0.28] },
    handR: { dir: [-0.3, 0.92, 0.24] },
  },
};

