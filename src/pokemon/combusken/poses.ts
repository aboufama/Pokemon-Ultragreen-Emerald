// Combusken poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward / swings a hanging limb back)
//   y: yaw (+ turns toward the creature's left), z: roll (+ raises a left arm)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Combusken's bind pose stands upright facing +Z, arms spread down at its sides.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance in the spirit of the stock Emerald sprites, grounded and
 * square to the foe. The front sprite catches it mid-kick in a crane pose
 * on one leg; the stance keeps that sprite's character on both feet: a
 * kicker crouched in a wide split stance (the right foot forward, knees
 * bent, as the sprite's second frame), the body leaning in, the long neck
 * carrying the head forward at the foe, the crest standing up swept back,
 * and the long feathered arms held wide like the sprite's: the right one
 * out at the side with the forearm raised, claws up at the foe, the left
 * one lowered out at its side. The hands are not aimed: they carry on the
 * line of the forearms, so a clip's arm aims move them too. The claws stay
 * about level with the talons of its front foot, so at a contact move's
 * advance 1 (its front 0.15 of its height from the foe's) it fights close.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.045, z: -0.01 },
  expression: 'open',
  bones: {
    hips: { y: 4 },
    spine: { x: 16, y: -4 },
    chest: { x: 6, y: -2 },
    neck: { x: -10, y: 2 },
    head: { x: -8, y: 4 },
    crest: { x: -14 },
    crestL: { x: -12, z: 14 },
    crestR: { x: -12, z: -14 },
    tail: { x: -12 },
    handR: { z: 10 },
    handL: { z: -8 },
  },
  aim: {
    thighL: { dir: [0.2, -0.87, -0.45] },
    shinL: { dir: [0.06, -0.97, 0.2] },
    thighR: { dir: [-0.2, -0.83, 0.52] },
    shinR: { dir: [-0.06, -0.97, -0.2] },
    armR: { dir: [-0.9, 0.05, 0.3] },
    forearmR: { dir: [-0.45, 0.62, 0.42] },
    armL: { dir: [0.88, -0.35, 0.3] },
    forearmL: { dir: [0.75, -0.3, 0.45] },
  },
};
