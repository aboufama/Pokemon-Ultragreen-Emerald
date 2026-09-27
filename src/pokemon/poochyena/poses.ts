// Poochyena poses.
//
// `bones`: rotations in degrees about model axes at bind pose
//   x: pitch (+ tips the top of a bone forward, lowers a bone that points
//      forward, raises one that points back: the tail, the back's fur)
//   y: yaw (+ turns toward the creature's left), z: roll (+ swings a
//      hanging leg's foot toward the creature's left)
// `aim`: model-space directions for limbs ([x, y, z], +X = its left, +Z = forward)
// Poochyena's bind pose stands on all fours facing +Z, mouth open, tail
// hanging down behind.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites' posture: a hyena pup
 * squared up to the foe on stiff legs, a little crouched, head up and
 * looking straight at it, lips drawn back over the fangs, hackles bristling
 * along its back and the brush of a tail out stiff behind it. Its chest and
 * head face the foe; its hindquarters stand swung off to its left, as a dog
 * squares up with its body turned: the sprites' three-quarter view (tail to
 * the right from the front, to the left from behind), without turning away.
 */
export const STANCE: Pose = {
  plantFeet: 1,
  pelvis: { y: -0.05 },
  expression: 'open',
  bones: {
    // Hindquarters swung to its left; the chest and head stay square.
    hips: { y: -50 },
    spine: { x: 2 },
    neck: { x: -30 },
    head: { x: 14 },
    // Lips drawn back: the jaw half shut, fangs bared.
    jaw: { x: -12 },
    // Hackles up: the crest behind the shoulders and the rump tuft.
    mane: { x: 26 },
    maneB: { x: 22 },
    // The tail out stiff behind, its brush curling up.
    tail: { x: 25 },
    tail2: { x: 18 },
    tail3: { x: 25 },
    tail4: { x: 20 },
    // Hind feet planted out under the swung hindquarters.
    thighL: { z: 10 },
    thighR: { z: 10 },
  },
};
