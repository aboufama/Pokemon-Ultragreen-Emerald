// Dustox rig map: semantic names -> the joints rigged into its model.
//
// The upstream export is a static mesh; tools/models/rig_static.mjs gave it a
// skeleton from src/pokemon/dustox/skeleton.json (public/assets/pokemon/
// dustox/SOURCE.json, "rigged"), named like Beautifly's semantic bones so the
// two moths share their choreography:
//
//   Hips (the thorax's base, the abdomen hanging below it; the lower pair of
//   red legs: Leg) > Spine (the thorax; the upper pair: Arm) > Head (its big
//   head, eyes painted on, a mouth mesh in front: Mouth marks it) with
//   two-segment antennae; each wing is one surface (fore and hind wing
//   together) rooted on its back at Wing (L/R), with WingTip beyond mid-span
//   and WingHind for the lower half of the fan.
//
// The wing beat turns wingL/wingR; the wing tips and hind parts trail on
// springs, as do the antennae.
import type { RigProfile } from '../../anim/rig';

export const RIG: RigProfile = {
  bones: {
    hips: 'Hips',
    spine: 'Spine',
    head: 'Head',
    mouth: 'Mouth',
    antenna1L: 'LAntenna1',
    antenna2L: 'LAntenna2',
    antenna1R: 'RAntenna1',
    antenna2R: 'RAntenna2',
    armL: 'LArm',
    armR: 'RArm',
    legL: 'LLeg',
    legR: 'RLeg',
    wingL: 'LWing',
    wingR: 'RWing',
    foreTipL: 'LWingTip',
    foreTipR: 'RWingTip',
    hindL: 'LWingHind',
    hindR: 'RWingHind',
  },
  pelvisNodes: ['Hips'],
};
