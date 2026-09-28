// Beautifly rig map: semantic names -> the joints of its model (the official
// 3DS rig, pm0267_00 "agehunt", 63 joints).
//
//   Waist > Hips (the abdomen; the lower pair of little legs: Foot) >
//   Spine (the thorax; the upper pair: Hand) > Head, with the antennae
//   (FeelerC1..C3) and the proboscis, a chain of twelve (Jaw1..Jaw12) that
//   hangs straight in the bind pose and coils up in the stance;
//   each wing is rooted at Feeler (L/R) on the thorax: the forewing
//   (FeelerA1 > A2) and the hindwing with its long tail streamer
//   (FeelerB1 > B2 > B3 > B4 > B5).
//
// The wing beat turns wingL/wingR (the roots: both wings of a side
// together); the forewing tips and the hindwing chains trail on springs.
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: (s: 'L' | 'R') => string) => ({ [`${semantic}L`]: node('L'), [`${semantic}R`]: node('R') });
const id = (l: string, r: string) => (s: 'L' | 'R') => (s === 'L' ? l : r);

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips_06',
    spine: 'Spine_055',
    head: 'Head_028',
    ...sides('hand', id('LHand_041', 'RHand_054')),
    ...sides('foot', id('LFoot_02', 'RFoot_05')),
    ...sides('antenna1', id('LFeelerC1_023', 'RFeelerC1_027')),
    ...sides('antenna2', id('LFeelerC2_022', 'RFeelerC2_026')),
    ...sides('antenna3', id('LFeelerC3_021', 'RFeelerC3_025')),
    ...sides('wing', id('LFeeler_039', 'RFeeler_052')),
    ...sides('fore', id('LFeelerA1_032', 'RFeelerA1_045')),
    ...sides('foreTip', id('LFeelerA2_031', 'RFeelerA2_044')),
    ...sides('hind', id('LFeelerB1_038', 'RFeelerB1_051')),
    ...sides('hind2', id('LFeelerB2_037', 'RFeelerB2_050')),
    ...sides('hind3', id('LFeelerB3_036', 'RFeelerB3_049')),
    ...sides('hind4', id('LFeelerB4_035', 'RFeelerB4_048')),
    ...sides('hind5', id('LFeelerB5_034', 'RFeelerB5_047')),
    proboscis1: 'Jaw1_019',
    proboscis2: 'Jaw2_018',
    proboscis3: 'Jaw3_017',
    proboscis4: 'Jaw4_016',
    proboscis5: 'Jaw5_015',
    proboscis6: 'Jaw6_014',
    proboscis7: 'Jaw7_013',
    proboscis8: 'Jaw8_012',
    proboscis9: 'Jaw9_011',
    proboscis10: 'Jaw10_010',
    proboscis11: 'Jaw11_09',
    proboscis12: 'Jaw12_08',
  },
  // The pelvis channel moves the whole body: the abdomen (Hips) and the
  // thorax with the head and wings (Spine) are both children of Waist, so
  // both move together (Hips alone tore the abdomen off the thorax when the
  // life layer's hover or a reach moved it).
  pelvisNodes: ['Hips_06', 'Spine_055'],
};
