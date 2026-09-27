// Zigzagoon rig map: semantic names -> skeleton joints (Pokemon-3D-api model,
// 29 joints). Semantic names ending in L/R mirror.
//
// Two roots at the same point: Hips carries the hind legs, the tail and the
// rump fur; Spine1 carries the chest, the front legs, the neck and the head.
// Both move with the pelvis.
//
// The hind leg is LThigh (hip, a helper) -> LFoot (knee) -> LToe (ankle and
// paw). In the bind pose the hind paws hang 0.13 heights off the ground (the
// front paws stand on it), so the hind feet are planted at the height that
// puts the paw's sole on the ground. The front legs hang from the chest and
// the hind legs from the hips, so every paw is pinned where the stance puts
// it (plantAt, model heights: the rump swung to its left carries the hind
// paws with it): the body leans, coils and wags over paws that stay put.
// The tail ends in two lobes on one joint: TailA points back, TailB up.
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck',
    head: 'Head',
    jaw: 'Jaw',
    nose: 'Nose',
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'TailA',
    tailTop: 'TailB',
    // Fur: the cheek ruff (head), shoulder mane (chest), back (spine) and rump (hips).
    ruff: 'HairA',
    mane: 'HairB',
    furBack: 'HairC',
    furRump: 'HairD',
    ...sides('ear', 'Ear1'),
    ...sides('earTip', 'Ear2'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Foot'),
    ...sides('foot', 'Toe'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  // Hind legs: the hock bends back.
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL', bend: -1, plantAt: [0.177, 0.09, 0.043] },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR', bend: -1, plantAt: [-0.014, 0.09, -0.086] },
  },
  // Walks on all fours: the front legs are planted too (elbows bend back).
  frontLegs: {
    left: { thigh: 'armL', shin: 'forearmL', foot: 'handL', bend: -1, plantAt: [0.151, 0.091, 0.193] },
    right: { thigh: 'armR', shin: 'forearmR', foot: 'handR', bend: -1, plantAt: [-0.145, 0.091, 0.193] },
  },
};
