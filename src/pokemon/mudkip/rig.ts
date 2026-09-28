// Mudkip rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 24 joints; the same naming as Swampert's). Semantic
// names ending in L/R mirror.
//
// Anatomy notes (tools/gauntlet/skeleton.mjs --weights):
//   - Hips and Spine1 are sibling roots: `hips` carries the hind legs and the
//     tail, `spine` the chest, the front legs, the neck and the head.
//   - `head` moves most of the skin (974 of the vertices): Mudkip is mostly
//     head. `jaw` hinges high in the head and carries the whole lower face
//     and chin; the bind pose has it wide open.
//   - `fin` (Feeler1) is the base of the fin on its head, `finTip` (Feeler2)
//     the blade that rises to the top of the model.
//   - `tail` (Tail1) and `tail2` (Tail2) carry the big tail fin together.
//   - The front legs are the arm chain (armL, forearmL, handL: shoulder,
//     elbow and paw); LShoulder carries no skin.
//   - The orange cheek gills have no bones: they ride the head.
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
    fin: 'Feeler1',
    finTip: 'Feeler2',
    tail: 'Tail1',
    tail2: 'Tail2',
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  // Planted feet stay where the stance stands them (plantAt: measured from the
  // stance, in model heights), so a coil, a lean or a butt moves the body over
  // its four feet instead of sliding them along with it.
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL', plantAt: [0.107, 0.0215, -0.016] },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR', plantAt: [-0.107, 0.0215, -0.016] },
  },
  // Walks on all fours: the front legs are planted too (elbows bend back).
  frontLegs: {
    left: { thigh: 'armL', shin: 'forearmL', foot: 'handL', bend: -1, plantAt: [0.1073, 0.015, 0.2047] },
    right: { thigh: 'armR', shin: 'forearmR', foot: 'handR', bend: -1, plantAt: [-0.1073, 0.015, 0.2047] },
  },
};
