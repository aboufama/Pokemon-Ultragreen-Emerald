// Mudkip poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Mudkip's bind pose stands on all fours facing +Z, jaw wide open, the tail
// fin straight back.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: square on its four
 * short legs with the knees a little bent, mouth shut in its small smile, the
 * tail fin raised behind and fanned out to its left, so it shows at the right
 * of its body from the front and at the left from behind, as both sprites draw
 * it.
 *
 * The head fin is turned a little toward its right: the enemy camera sees the
 * foe from its front-left and ours from its back-right, so a fin turned that
 * way shows its broad face from both sides, the paddle both sprites draw (the
 * sprites are drawn in three-quarter view; square to the foe, an untwisted fin
 * shows only its thin edge).
 *
 * The front legs are held straight down in model space, so a chest that dips
 * or lifts keeps its paws where they stand (the foot IK only pins their height).
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.025 },
  expression: 'open',
  bones: {
    jaw: { x: -25 },
    head: { x: -4 },
    fin: { x: -8, y: -38, z: 4 },
    tail: { x: 30, y: -62, z: -15 },
  },
  aim: {
    armL: { dir: [0, -0.982, -0.188] },
    forearmL: { dir: [0, -1, 0] },
    armR: { dir: [0, -0.982, -0.188] },
    forearmR: { dir: [0, -1, 0] },
  },
};
