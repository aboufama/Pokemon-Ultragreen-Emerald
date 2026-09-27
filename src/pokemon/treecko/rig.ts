// Treecko rig map: semantic names -> joints of the skeleton added by
// tools/models/rig_static.mjs (the upstream export has none; the joints and
// their places are in skeleton.json). The layout follows the 3DS rigs of the
// finished species, so the clip vocabulary carries over:
//   - Hips (legs, tail) and Spine1 (torso, arms, neck, head) are sibling roots
//     at the pelvis, so the upper body can turn against the legs;
//   - a short neck under a big head, and a jaw hinged at the back of the
//     mouth: it opens the closed mouth (the floor of the mouth and the lower
//     lip go with it, the palate stays);
//   - thin arms held out in a T at bind, big hands with three fingers each
//     (A: the front one, B: the middle one, C: the back one), one bone each;
//   - straight legs with long flat feet (one toe bone for the three toes);
//   - a five-bone leaf tail from the lower back to its two-lobed tip, lying
//     on the ground behind at bind.
// Every bone's local +X points at its child (the rig's default boneAxis).
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
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'Tail3',
    tail4: 'Tail4',
    tail5: 'Tail5',
    ...sides('shoulder', 'Shoulder'),
    ...sides('arm', 'Arm'),
    ...sides('forearm', 'ForeArm'),
    ...sides('hand', 'Hand'),
    ...sides('fingerA', 'FingerA'),
    ...sides('fingerB', 'FingerB'),
    ...sides('fingerC', 'FingerC'),
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
