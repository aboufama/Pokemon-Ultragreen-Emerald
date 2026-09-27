// Grovyle poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back;
//      + raises a bone that points backward, like the tail)
//   y: yaw (+ turns toward the creature's left; - curls a backward bone
//      toward its left), z: roll (+ raises a left arm, tilts a neck to its right)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Grovyle's bind pose is a T-pose facing +Z, upright, the tail straight back.
// The torso is one bone (Spine_09), a child of the pelvis: the chest's share
// of a bend goes to the spine.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance with the posture of the stock Emerald sprites, facing the foe
 * (battlers always face their opponent): a forest ninja's crouch, ready to
 * spring, the knees deep and forward over the long feet; the torso leaning
 * well forward and the long neck rising so the head looks level at the foe;
 * the right forearm held forward and low with its leaf fan hanging, the left
 * arm cocked up and back with its leaf fan spread like a wing (the sprite's
 * raised arm); the tail stretched back and swept to its left, the leaf brush
 * trailing.
 *
 * Fit (tools/calibrate/candidates.mjs, about seventy stances compared): the
 * front sprite is a side-on leap, head in profile far out to the left and
 * almost half its silhouette long leaf fans, which a body facing the foe
 * cannot cover; this stance is the best balance of both sides (REVIEW.md).
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.07, z: -0.02 },
  expression: 'open',
  bones: {
    spine: { x: 45 },
    neck: { x: -38 },
    head: { x: -12 },
    tail: { x: 16, y: -35 },
    tail2: { x: -8, y: -15 },
  },
  aim: {
    armR: { dir: [-0.45, -0.45, 0.77] },
    forearmR: { dir: [-0.2, -0.35, 0.92], twist: 90 },
    handR: { dir: [-0.1, -0.2, 0.97] },
    armL: { dir: [0.6, 0.25, -0.76] },
    forearmL: { dir: [0.35, 0.75, 0.56], twist: -90 },
    handL: { dir: [0.2, 0.9, 0.39] },
    thighL: { dir: [0.3, -0.35, 0.89] },
    shinL: { dir: [0.05, -0.8, -0.6] },
    thighR: { dir: [-0.3, -0.35, 0.89] },
    shinR: { dir: [-0.05, -0.8, -0.6] },
  },
};
