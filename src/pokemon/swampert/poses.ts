// Swampert poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Swampert's bind pose is a T-pose facing +Z with the legs splayed.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald front sprite: a squat wrestler's
 * stance, feet planted wide, elbows out at belly height with the forearms
 * angled down and the big hands hooked back toward the thighs (the sprite's
 * "crab arms"), mouth open, the head fins spread in a V with their broad
 * faces forward, the tail fan leaning out to its right behind the body.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.03 },
  expression: 'open',
  bones: {
    // Upright, chin up, mouth open like the sprite's.
    spine: { x: -4 },
    head: { x: -8 },
    jaw: { x: 22 },
    // Head fins: stood up, splayed into a V and turned so their broad faces
    // show (the sprites draw them as two tall lobes).
    hairL: { x: 30, y: -20, z: -20 },
    hairR: { x: 30, y: 20, z: 20 },
    // Tail fan: the top lobe leans back and out to its right, so it peeks out
    // at the side in the front view and stays low behind the back (the back
    // sprite shows no tail).
    tail: { x: -35, z: 30 },
    // Knees in a little: the feet sit under the body like the sprite's.
    thighL: { z: -22 },
    thighR: { z: 22 },
  },
  aim: {
    armL: { dir: [0.88, -0.3, 0.35] },
    forearmL: { dir: [0.55, -0.75, 0.35] },
    handL: { dir: [-0.65, -0.72, 0.25] },
    armR: { dir: [-0.88, -0.3, 0.35] },
    forearmR: { dir: [-0.55, -0.75, 0.35] },
    handR: { dir: [0.65, -0.72, 0.25] },
  },
};
