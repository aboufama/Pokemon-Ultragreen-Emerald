// Wurmple poses.
//
// `bones`: rotations in degrees about model axes at bind pose (Euler YXZ in
// the parent's frame; every joint of the baked skeleton is unrotated at bind)
//   x: pitch (+ tips the top of a bone forward; + raises a bone that points
//      back, like the tail; - raises one that points forward, like the spine)
//   y: yaw (+ turns toward the creature's left; + swings a tail to its right)
//   z: roll (for the body chain: a twist about its length)
// The bind pose lies flat on its belly along +Z, head first.
//
// The stance bends the body at the hips: the hips turn 90 degrees, so the
// back half lies along the ground to its right and the front half, turned
// back by the spine's -90, rears up square to the foe. Pitches of the front
// chain (spine, chest, neck, head) then read directly as rearing (-) and
// bowing (+); pitches of the tail chain lift (+) or lower (-) the tail end,
// and yaws curl it further round (+) or straighten it out (-).
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites: the front half reared
 * up, belly square to the foe, the head bowed forward over it so the face
 * looks at the foe; the back half lies on the ground and curls round to its
 * right with the tail end lifted, spikes up. From the front the tail curls
 * on the sprite's left, from behind it runs off to the right, as the front
 * and back sprites draw it.
 */
export const STANCE: Pose = {
  expression: 'open',
  bones: {
    hips: { y: 90 },
    spine: { x: -20, y: -90 },
    chest: { x: -50 },
    neck: { x: 15 },
    head: { x: 45 },
    tail: { y: 30 },
    tail2: { x: 12, y: 30 },
    tail3: { x: 30, y: 30 },
  },
};
