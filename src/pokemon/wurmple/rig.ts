// Wurmple rig map: semantic names -> the joints baked into its model.
//
// The upstream export is a static mesh; a caterpillar's skeleton was baked
// into it (public/assets/pokemon/wurmple/SOURCE.json, "rigged"). The bind
// pose lies flat along +Z, head first, and no joint is rotated at bind, so
// model-axis rotations read directly:
//
//   Tail3 < Tail2 < Tail1 < Hips > Spine1 > Spine2 > Neck > Head
//   (tail end, on the ground)        (the front half it rears up)
//
// Hips sits mid-body, where the body leaves the ground when it rears: the
// back half lies on the ground behind it, the front half stands up. The
// life layer breathes through spine/chest/neck/head, which are the upright
// front segments here. The head carries the red crest (a spring) and a mouth
// marker (the slit between its mandibles, where its thread leaves); the tail
// end carries the two yellow spikes (a spring, and where Poison Sting
// leaves). No legs: it stands on its belly, so there is nothing to plant,
// and the pelvis channel moves the whole body (Hips is the root joint).
import type { RigProfile } from '../../anim/rig';

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine1',
    chest: 'Spine2',
    neck: 'Neck',
    head: 'Head',
    crest: 'Crest',
    mouth: 'Mouth',
    tail: 'Tail1',
    tail2: 'Tail2',
    tail3: 'Tail3',
    tailSpikes: 'TailSpikes',
  },
  pelvisNodes: ['Hips'],
};
