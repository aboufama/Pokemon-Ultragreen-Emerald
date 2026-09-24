// Blaziken rig map: semantic biped names -> nodes of the Pokemon-3D-api model
// (3DS-era skeleton, 51 joints). Semantic names ending in L/R mirror.
import type { RigProfile } from '../../anim/rig';

const sides = (semantic: string, node: string) => ({ [`${semantic}L`]: `L${node}`, [`${semantic}R`]: `R${node}` });

export const BLAZIKEN_RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck',
    head: 'Head',
    jaw: 'Jaw',
    tail: 'Tail',
    ...sides('hair', 'Hair1'),
    ...sides('hairTip', 'Hair2'),
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('wristFx', 'FeelerA'),
    ...sides('fingerA1', 'FingerA1'),
    ...sides('fingerA2', 'FingerA2'),
    ...sides('fingerA3', 'FingerA3'),
    ...sides('fingerB1', 'FingerB1'),
    ...sides('fingerB2', 'FingerB2'),
    ...sides('fingerB3', 'FingerB3'),
    ...sides('fingerC1', 'FingerC1'),
    ...sides('fingerC2', 'FingerC2'),
    ...sides('fingerC3', 'FingerC3'),
    ...sides('thigh', 'Thigh'),
    ...sides('shin', 'Leg'),
    ...sides('foot', 'Foot'),
    ...sides('ankleFx', 'FeelerB'),
    ...sides('toeA', 'ToeA'),
    ...sides('toeB', 'ToeB'),
    ...sides('toeC', 'ToeC'),
  },
  pelvisNodes: ['Hips', 'Spine1'],
  legs: {
    left: { thigh: 'thighL', shin: 'shinL', foot: 'footL' },
    right: { thigh: 'thighR', shin: 'shinR', foot: 'footR' },
  },
};
