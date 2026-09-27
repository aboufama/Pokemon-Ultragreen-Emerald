// Linoone rig map: semantic names -> skeleton joints (Pokemon-3D-api model,
// 36 joints). Semantic names ending in L/R mirror.
//
// Two roots at the same point, as on Zigzagoon: Hips carries the hind legs
// and the tail; Spine1 carries the chest, the front legs, the neck and the
// head. Both move with the pelvis.
//
// The hind leg is LThigh (hip, a helper) -> LFoot (knee) -> LToe (ankle and
// paw). In the bind pose the hind legs are folded flat under the rump (the
// shin and the paw level, 0.31 heights off the ground) while the front legs
// stand on it; the stance lowers the rear and plants every paw where it puts
// it (plantAt, model heights), so the long body leans, coils and stretches
// over paws that stay put. The front leg is LShoulder (the shoulder blade)
// -> LArm -> LForeArm -> LHand (the paw) with two claws (FingerA, FingerB);
// the planted chain is the arm, the forearm and the paw.
//
// The head carries the ears; the neck carries two tufts of cheek fur a side
// (FeelerA sweeps back and up, FeelerB back and down). The long tail is four
// joints (Tail1 at the rump to Tail4 at its tip).
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
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'Tail3',
    tail4: 'Tail4',
    ...sides('ear', 'Ear'),
    // Cheek fur: the upper tuft sweeps back and up, the lower one back and down.
    ...sides('cheek', 'FeelerA1'),
    ...sides('cheekTip', 'FeelerA2'),
    ...sides('jowl', 'FeelerB1'),
    ...sides('jowlTip', 'FeelerB2'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('clawA', 'FingerA'),
    ...sides('clawB', 'FingerB'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Foot'),
    ...sides('foot', 'Toe'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  // Hind legs: the hock bends back. Planted where the stance puts them.
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL', bend: -1, plantAt: [0.175, 0.055, -0.3] },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR', bend: -1, plantAt: [-0.175, 0.055, -0.3] },
  },
  // Walks on all fours: the front legs are planted too (elbows bend back).
  frontLegs: {
    left: { thigh: 'armL', shin: 'forearmL', foot: 'handL', bend: -1, plantAt: [0.16, 0.161, 0.45] },
    right: { thigh: 'armR', shin: 'forearmR', foot: 'handR', bend: -1, plantAt: [-0.16, 0.161, 0.45] },
  },
};
