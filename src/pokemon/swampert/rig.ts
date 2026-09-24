// Swampert rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 43 joints; the same naming as Blaziken's). Semantic names
// ending in L/R mirror.
//
// Anatomy notes (tools/gauntlet/skeleton.mjs --weights):
//   - Hips and Spine1 are sibling roots: `hips` carries the legs and the tail,
//     `spine` the whole upper body (chest, arms, neck, head).
//   - `head` moves most of the upper body's skin (the head and body merge);
//     `jaw` is the big lower jaw and chin.
//   - `hair` (LHair1) is the pivot of each head fin, `hairTip` (LHair2) the fin
//     itself: the two dark lobes of the crest.
//   - `gill` (LFeeler) is the orange three-spiked gill on each cheek.
//   - `tail` (TailA1) is the tail root, `tail2` (TailA2) the big fan fin that
//     rises behind the body. TailB carries no skin.
//   - Three fingers per hand (A, B, C), two joints each.
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
    tail: 'TailA1',
    tail2: 'TailA2',
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
    ...sides('hair', 'Hair1'),
    ...sides('hairTip', 'Hair2'),
    ...sides('gill', 'Feeler'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
