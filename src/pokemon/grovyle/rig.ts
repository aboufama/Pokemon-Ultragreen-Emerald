// Grovyle rig map: semantic names -> joints of the Pokemon-3D-api model (a
// Battle Revolution-style skeleton, 26 joints). Semantic names ending in L/R
// mirror.
//
// The skeleton, read with tools/gauntlet/skeleton.mjs (bind pose facing +Z,
// every bone's local +X pointing at its child, lengths in model heights):
//   - Pelvis_02 carries the legs, the tail and the torso: Spine_09 is its
//     child (on the 3DS rigs the hips and the spine are siblings), a single
//     torso bone with no chest and no shoulders; the arms and the neck hang
//     off it directly;
//   - a neck (PG_Neck_014) under the head; the head (Head_00) carries the
//     long leaf that sweeps back from its crown (no bone of its own: it is
//     skinned to the head) and the lower jaw (Mouth_015);
//   - arms of three bones: the upper arm, the forearm, which carries the big
//     arm leaf that fans back from it (skinned to the forearm), and the hand
//     (no finger bones);
//   - legs of three bones (thigh, calf, the long foot);
//   - a two-bone tail (Tail1_023 at the hips, Tail2_024 the leafy brush);
//   - effect points that move nothing: PT_mouth_017 (in front of the mouth),
//     PT_L_hand_013 / PT_R_hand_021 (past the hands), PT_head_016, PT_center_018.
import type { RigProfile } from '../../anim/rig';

export const RIG: RigProfile = {
  bones: {
    hips: 'Pelvis_02',
    spine: 'Spine_09',
    neck: 'PG_Neck_014',
    head: 'Head_00',
    jaw: 'Mouth_015',
    tail: 'Tail1_023',
    tail2: 'Tail2_024',
    armL: 'L_UpperArm_010',
    forearmL: 'L_Forearm_011',
    handL: 'L_Hand_012',
    handTipL: 'PT_L_hand_013',
    armR: 'R_UpperArm_019',
    forearmR: 'R_Forearm_020',
    handR: 'R_Hand_022',
    handTipR: 'PT_R_hand_021',
    thighL: 'L_Thigh_03',
    shinL: 'L_Calf_04',
    footL: 'L_Foot_05',
    thighR: 'R_Thigh_06',
    shinR: 'R_Calf_07',
    footR: 'R_Foot_08',
    mouthTip: 'PT_mouth_017',
    crown: 'PT_head_016',
  },
  // The spine is the pelvis's child here, so moving the pelvis moves the torso too.
  pelvisNodes: ['Pelvis_02'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
