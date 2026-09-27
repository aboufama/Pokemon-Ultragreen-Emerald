// Torchic rig map: semantic names -> joints of the Pokemon-3D-api model
// (3DS-era skeleton, 43 joints). Semantic names ending in L/R mirror.
//
// A chick: no arms and no neck (the big head sits right on Spine2). What it
// acts with besides the body and the head:
//   crest     the three plumes on its head (Hair1 in the middle, L/RHair1 at
//             the sides), each with a tip bone
//   collar    the ring of yellow down round its chest (Feeler), with the
//             tufts that are its tiny wings: three feathers a side
//             (L/RFeelerA at the front, B in the middle, C at the back) and
//             one at the back (FeelerA)
//   tail      two short tail feathers (Tail1, Tail2)
//   toes      three front talons (A in the middle, B inside, C outside) and
//             a hind toe (D), two bones each
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    head: 'Head',
    jaw: 'Jaw',
    tail: 'Tail1',
    tail2: 'Tail2',
    crest: 'Hair1',
    crestTip: 'Hair2',
    ...sides('crest', 'Hair1'),
    ...sides('crestTip', 'Hair2'),
    collar: 'Feeler',
    collarBack: 'FeelerA',
    ...sides('wingA', 'FeelerA'),
    ...sides('wingB', 'FeelerB'),
    ...sides('wingC', 'FeelerC'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('toe', 'ToeA1'),
    ...sides('toeTip', 'ToeA2'),
    ...sides('toeB', 'ToeB1'),
    ...sides('toeBTip', 'ToeB2'),
    ...sides('toeC', 'ToeC1'),
    ...sides('toeCTip', 'ToeC2'),
    ...sides('toeD', 'ToeD1'),
    ...sides('toeDTip', 'ToeD2'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  // A bird's leg: the joint between "thigh" and "shin" bends backward (it
  // sits only a little behind the line from the hip to the foot, so the
  // planting IK's default forward bias flipped it forward in every crouch and
  // lifted the planted feet off the ground).
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL', bend: -1 },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR', bend: -1 },
  },
};
