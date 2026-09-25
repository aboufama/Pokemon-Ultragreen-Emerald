// Sceptile poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back;
//      + raises a bone that points backward, like the tail)
//   y: yaw (+ turns toward the creature's left; - curls a backward bone
//      toward its left), z: roll (+ raises a left arm, tilts a neck to its right)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Sceptile's bind pose is a T-pose facing +Z, the tail straight back. Hips
// (legs, tail) and Spine1 (torso, arms, neck) are sibling roots, so the upper
// body can turn against the legs.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance with the posture of the stock Emerald sprites, facing the foe
 * (battlers always face their opponent): a low, wide, bow-legged crouch with
 * the left foot drawn back; the upper body square to the foe; the long neck
 * leaning a little to its right, the head facing the foe and looking down its
 * snout; the right claw raised to head height and open, its blades out
 * (the spikes of the back sprite); the left forearm held forward and low as a
 * guard, its blade turned in so it hides behind the torso from our side, as
 * in the back sprite; the leafy tail swept round to its left and low, fanned
 * beside it, the tip curling up.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.04 },
  expression: 'open',
  bones: {
    hips: { y: 6 },
    spine: { x: 2 },
    neck: { x: -4, z: 2 },
    head: { x: 2, y: -3 },
    jaw: { x: -10 },
    // Tail: swept to its left and lifted a little so the lower leaflets clear
    // the ground; the last segments curl up.
    tail: { x: 10, y: -13 },
    tail2: { y: -9.75 },
    tail3: { x: -3, y: -9.75 },
    tail4: { y: -7.8 },
    tail5: { x: 8, y: -6.5 },
    tail6: { x: 24, y: -5.2 },
    tail7: { x: 28, y: -3.25 },
    // The drawn-back foot's toes turn back with it.
    toeL: { y: 60 },
    toeTipL: { y: 15 },
  },
  aim: {
    armR: { dir: [-0.6, -0.25, 0.76] },
    forearmR: { dir: [-0.45, 0.45, 0.77] },
    handR: { dir: [-0.3, 0.85, 0.43] },
    armL: { dir: [0.45, -0.35, 0.82] },
    forearmL: { dir: [0.25, 0.05, 0.97], twist: 120 },
    handL: { dir: [0.2, -0.35, 0.91] },
    thighL: { dir: [0.55, -0.82, -0.1] },
    shinL: { dir: [-0.2, -0.7, -0.68] },
    thighR: { dir: [-0.55, -0.76, 0.35] },
    shinR: { dir: [0.25, -0.75, -0.6] },
  },
};
