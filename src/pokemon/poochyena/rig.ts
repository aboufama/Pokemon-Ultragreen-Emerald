// Poochyena rig map: semantic names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 71 joints; the left and right nodes carry different
// numbers, so every side is named). Semantic names ending in L/R mirror.
//
// A quadruped: the front legs are the arm chain (shoulder, arm, forearm,
// hand, finger = the front paw) and hang from the chest (Spine2); the hind
// legs (thigh, shin, the long hind foot down to the hock's end, toes) and
// the tail hang from the hips. The fur tufts along the back and flanks
// (Feeler A-D) hang from the hips too: its bristling mane. The cheek tufts
// hang from the jaw, the two upper fangs (FeelerF) from the head.
import type { RigProfile } from '../../anim/rig';

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips_028',
    spine: 'Spine1_04',
    chest: 'Spine2_05',
    neck: 'Neck_06',
    head: 'Head_07',
    nose: 'Nose_08',
    jaw: 'Jaw_09',
    // Tail: four bones from the rump to the brush.
    tail: 'Tail1_039',
    tail2: 'Tail2_040',
    tail3: 'Tail3_041',
    tail4: 'Tail4_042',
    // The bristling fur along the back: the crest behind the shoulders
    // (mane), the tuft over the rump (maneB), the flank and hip tufts.
    mane: 'FeelerA_043',
    maneB: 'FeelerB_044',
    furL: 'LFeelerC_045',
    furR: 'RFeelerC_046',
    hipFurL: 'LFeelerD_047',
    hipFurR: 'RFeelerD_048',
    cheekL: 'LFeelerE_010',
    cheekR: 'RFeelerE_011',
    fangL: 'LFeelerF_014',
    fangR: 'RFeelerF_015',
    earL: 'LEar_016',
    earR: 'REar_017',
    shoulderL: 'LShoulder_018',
    shoulderR: 'RShoulder_023',
    armL: 'LArm_019',
    armR: 'RArm_024',
    forearmL: 'LForeArm_020',
    forearmR: 'RForeArm_025',
    handL: 'LHand_021',
    handR: 'RHand_026',
    fingerL: 'LFinger_022',
    fingerR: 'RFinger_027',
    thighL: 'LThigh_029',
    thighR: 'RThigh_034',
    shinL: 'LLeg_030',
    shinR: 'RLeg_035',
    footL: 'LFoot_031',
    footR: 'RFoot_036',
    toeL: 'LToe1_032',
    toeR: 'RToe1_037',
    toeTipL: 'LToe2_033',
    toeTipR: 'RToe2_038',
  },
  // This skeleton's bones point along their local +Y (toward the child
  // joint), not +X like the biped skeletons: aims need to know.
  boneAxis: [0, 1, 0],
  pelvisNodes: ['Hips_028', 'Spine1_04'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
  // Walks on all fours: the front legs are planted too (elbows bend back).
  frontLegs: {
    left: { thigh: 'armL', shin: 'forearmL', foot: 'handL', bend: -1 },
    right: { thigh: 'armR', shin: 'forearmR', foot: 'handR', bend: -1 },
  },
};
