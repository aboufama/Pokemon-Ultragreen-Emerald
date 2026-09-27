// Cascoon rig map: semantic names -> the joints rigged into its model.
//
// The upstream export is a static mesh; tools/models/rig_static.mjs gave it a
// skeleton from src/pokemon/cascoon/skeleton.json (public/assets/pokemon/
// cascoon/SOURCE.json, "rigged"), laid out like Silcoon's so the two share
// the cocoon choreography:
//
//   Hips (the base of the cocoon) > Spine (its middle) > Head (its top, with
//   the eyes in the silk opening) > Opening (a marker in the opening's
//   middle, where String Shot and Poison Sting leave); the five silk strands
//   that don't touch the ground hang off the Spine and the Head
//   (StrandTop, StrandUpL, StrandUpR, StrandL, StrandR) and quiver on
//   springs; it stands on the other three.
import type { RigProfile } from '../../anim/rig';

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine',
    head: 'Head',
    opening: 'Opening',
    strandTop: 'StrandTop',
    strandUpL: 'StrandUpL',
    strandUpR: 'StrandUpR',
    strandL: 'StrandL',
    strandR: 'StrandR',
  },
  pelvisNodes: ['Hips'],
};
