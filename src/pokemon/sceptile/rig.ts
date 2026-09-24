// Sceptile rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 100 joints). Semantic names ending in L/R mirror.
//
// The skeleton, read with tools/gauntlet/skeleton.mjs (bind pose is a T-pose
// facing +Z, lengths in model heights):
//   - a two-bone neck (Neck1, Neck2) and a head whose crest sweeps up and
//     back; the jaw points forward and is slightly open at bind;
//   - forearms carrying two leaf blades each (FeelerA: the front blade,
//     FeelerB: the back one), two bones per blade, standing up from the
//     forearm near the wrist in the T-pose;
//   - three claws per hand (FingerA/B/C, two bones each);
//   - a seven-bone tail (Tail1 at the hips .. Tail7, 0.7 heights long) with
//     fern leaflets on Tail3-Tail5: upper ones (C, D, E, F, G, H) and lower
//     ones (N, O, L|R, M, J, K), two bones each;
//   - the six seed pods on its back are skinned to Spine2 (no bones).
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

/**
 * The tail's fern leaflets, by letter: upper row C (Tail3) .. H (Tail5), lower
 * row N, O (Tail3), L (Tail4: LFeelerL on the left, RFeelerR on the right),
 * M (Tail4), J, K (Tail5). Semantic names: frond<X>L/R (base), frond<X>TipL/R.
 */
export const TAIL_FRONDS = ['C', 'D', 'E', 'F', 'G', 'H', 'N', 'O', 'L', 'M', 'J', 'K'];
const frondBones = Object.fromEntries(
  TAIL_FRONDS.flatMap((f) => {
    const right = f === 'L' ? 'R' : f;
    return [
      [`frond${f}L`, `LFeeler${f}1`], [`frond${f}TipL`, `LFeeler${f}2`],
      [`frond${f}R`, `RFeeler${right}1`], [`frond${f}TipR`, `RFeeler${right}2`],
    ];
  }),
);

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck1',
    neck2: 'Neck2',
    head: 'Head',
    jaw: 'Jaw',
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'Tail3',
    tail4: 'Tail4',
    tail5: 'Tail5',
    tail6: 'Tail6',
    tail7: 'Tail7',
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    // Forearm leaf blades: front (A) and back (B), base and tip.
    ...sides('bladeA', 'FeelerA1'),
    ...sides('bladeATip', 'FeelerA2'),
    ...sides('bladeB', 'FeelerB1'),
    ...sides('bladeBTip', 'FeelerB2'),
    ...sides('fingerA1', 'FingerA1'),
    ...sides('fingerA2', 'FingerA2'),
    ...sides('fingerB1', 'FingerB1'),
    ...sides('fingerB2', 'FingerB2'),
    ...sides('fingerC1', 'FingerC1'),
    ...sides('fingerC2', 'FingerC2'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('toe', 'Toe1'),
    ...sides('toeTip', 'Toe2'),
    // Tail leaflets (see TAIL_FRONDS).
    ...frondBones,
  },
  pelvisNodes: ['Hips', 'Spine1'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
