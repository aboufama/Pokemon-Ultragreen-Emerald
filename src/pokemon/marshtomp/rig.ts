// Marshtomp rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 40 joints; the same naming as Mudkip's and Swampert's).
// Semantic names ending in L/R mirror.
//
// Anatomy notes (tools/gauntlet/skeleton.mjs --weights):
//   - Hips and Spine1 are sibling roots at the same point: `hips` carries the
//     legs and the tail, `spine` the whole upper body.
//   - There is no neck: `head` (Head) moves most of the skin (829 of the
//     vertices: the big head and the upper body merge), `chest` (Spine2) the
//     belly below it. `jaw` is the wide lower jaw and chin.
//   - `fin` (Hair) is the black fin on top of its head.
//   - The tail is two fan lobes, left and right, each a root and a blade
//     (`tailL` LTail1 and `tailTipL` LTail2...): in the sprites they splay
//     out on the ground behind its feet.
//   - LHips/RHips are the hip joints between the pelvis and the thighs; the
//     orange cheek gills have no bones (they ride the head).
//   - Three fingers per hand (A, B, C), two joints each; a toe per foot.
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    head: 'Head',
    jaw: 'Jaw',
    fin: 'Hair',
    ...sides('tail', 'Tail1'),
    ...sides('tailTip', 'Tail2'),
    ...sides('hip', 'Hips'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('fingerA1', 'FingerA1'),
    ...sides('fingerA2', 'FingerA2'),
    ...sides('fingerB1', 'FingerB1'),
    ...sides('fingerB2', 'FingerB2'),
    ...sides('fingerC1', 'FingerC1'),
    ...sides('fingerC2', 'FingerC2'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('toe', 'Toe'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
