// Mightyena rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 71 joints; bones point along their local +X, the
// default). Semantic names ending in L/R mirror.
//
// A quadruped. Two roots at the waist: Hips carries the hind legs, the tail
// and the shaggy fur of the rump and flanks (FeelerC-F); Spine1 carries the
// flank tufts (FeelerB), and through Spine2 the shoulders' tufts (FeelerA),
// the front legs and the neck. Both move with the pelvis. The neck is two
// bones (Neck1, Neck2); Neck2 carries the head and the mane (Hair: the black
// mane down the back of the neck, with its locks HairA-D on each side). The
// jaw hangs from a helper under the head (RootJaw) with the lower fangs; the
// upper fangs and the cheek tufts (FeelerG) hang from the helper too.
//
// The front leg is Arm (shoulder) -> ForeArm (elbow) -> Hand (wrist and
// paw); the hind leg Thigh (hip) -> Leg (stifle) -> Foot (hock, the long
// hind foot) -> Toe. Every paw is pinned where the stance puts it
// (plantAt, model heights): the body crouches, leans, coils and rears over
// paws that stay put. The tail is five bones (Tail1-5) with the brush's
// crest (TailA) and its two side lobes (TailB).
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck1',
    neck2: 'Neck2',
    head: 'Head',
    jaw: 'Jaw',
    nose: 'Nose',
    // The mane down the back of the neck, and its locks.
    mane: 'Hair',
    ...sides('hair', 'HairA1'),
    ...sides('hairTip', 'HairA2'),
    ...sides('lockB', 'HairB'),
    ...sides('lockC', 'HairC'),
    ...sides('lockD', 'HairD'),
    // Shaggy fur: shoulders (A), flanks (B), rump (C), the hind flanks (D1-D2, E, F), cheeks (G).
    ...sides('furShoulder', 'FeelerA'),
    ...sides('furFlank', 'FeelerB'),
    ...sides('furRump', 'FeelerC'),
    ...sides('furHip', 'FeelerD1'),
    ...sides('furHipTip', 'FeelerD2'),
    ...sides('furThigh', 'FeelerE'),
    ...sides('furHock', 'FeelerF'),
    ...sides('cheek', 'FeelerG'),
    // Tail: five bones from the rump to the brush's tip, the crest and the side lobes.
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'Tail3',
    tail4: 'Tail4',
    tail5: 'Tail5',
    tailCrest: 'TailA',
    ...sides('tailLobe', 'TailB'),
    ...sides('ear', 'Ear1'),
    ...sides('earTip', 'Ear2'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('finger', 'Finger'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('toe', 'Toe1'),
    ...sides('toeTip', 'Toe2'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  // Hind legs: the stifle bends forward, the hock back.
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL', plantAt: [0.229, 0.239, -0.001] },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR', plantAt: [0.053, 0.236, -0.149] },
  },
  // Walks on all fours: the front legs are planted too (elbows bend back).
  frontLegs: {
    left: { thigh: 'armL', shin: 'forearmL', foot: 'handL', bend: -1, plantAt: [0.111, 0.068, 0.349] },
    right: { thigh: 'armR', shin: 'forearmR', foot: 'handR', bend: -1, plantAt: [-0.111, 0.068, 0.349] },
  },
};
