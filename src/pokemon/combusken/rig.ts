// Combusken rig map: semantic names -> joints of the Pokemon-3D-api model
// (3DS-era skeleton, 57 joints). Semantic names ending in L/R mirror.
//
// A young fowl standing on long bird's legs: what it acts with besides the
// body, the head and the arms (upper arm, forearm and one big feathered hand
// with three claws, no finger bones):
//   crest       the three orange plumes on its head (Hair1 in the middle with
//               its tip Hair2, LHair and RHair at the sides)
//   beakUpper   the upper beak (the jaw is the lower one)
//   feather*    the yellow feathers round its waist, three a side (A at the
//               front, B at the side, C at the back)
//   tail        two orange tail feathers (Tail1, Tail2)
//   talon*      the toes of its big feet: A inside, B middle, C outside, D
//               the hind toe (the first bone of each)
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck',
    head: 'Head',
    jaw: 'LowerBeak',
    beakUpper: 'UpperBeak',
    crest: 'Hair1',
    crestTip: 'Hair2',
    crestL: 'LHair',
    crestR: 'RHair',
    tail: 'Tail1',
    tail2: 'Tail2',
    ...sides('featherA', 'FeelerA'),
    ...sides('featherB', 'FeelerB'),
    ...sides('featherC', 'FeelerC'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('toe', 'ToeA1'),
    ...sides('talonB', 'ToeB1'),
    ...sides('talonC', 'ToeC1'),
    ...sides('talonD', 'ToeD1'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
