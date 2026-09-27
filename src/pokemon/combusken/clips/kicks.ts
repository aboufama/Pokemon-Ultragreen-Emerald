// Combusken's kicks: its signature (Pokédex: ten kicks a second). It stands
// with the right knee already drawn up, so a right kick snaps straight out
// of its stance; the left one comes with a hop and a switch of the feet.
// Each kick springs it in on a skip from where it lands at the foe (kit:
// atFoe, KICK), so the kicking foot reaches the foe's body; the standing
// foot comes down with the blow and stays put. Legs have no overlap delay:
// a kick lands on its key (the impact comes a few frames later, the leg
// held out, so the blow shows before the sparks).

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_BACK, ARRIVE, AT_FOE_GUARD, GUARD, GUARD_L, KICK, LAND, OPEN_EYES, STRIDE, TUCK, WINGS_OUT,
  at, atFoe, bend, crest, fall, hopHome, key, leap, legL, legR, lunge, mirror, pelvis, root, skipIn, skipTo, snap, tail,
} from './kit';

/** The right knee chambered high (from its stance), the left foot planted. */
const CHAMBER_R: Pose = { plantLeft: 1, plantRight: 0, ...legR([-0.2, 0.42, 0.89], [-0.1, -0.75, 0.65]) };
/** The right leg snapped out straight into the foe's middle, the talons leading. */
const SNAP_R: Pose = { plantLeft: 1, plantRight: 0, ...legR([-0.12, 0.3, 0.95], [-0.08, 0.28, 0.96]) };
/** The left knee chambered, the right foot down (after a switch of the feet). */
const CHAMBER_L: Pose = { plantLeft: 0, plantRight: 1, ...legR([-0.1, -0.9, 0.42], [-0.06, -0.94, -0.33]) };
const CHAMBER_L_LEG: Pose = legL([0.2, 0.42, 0.89], [0.1, -0.75, 0.65]);
/** The left leg snapped out into the foe. */
const SNAP_L_LEG: Pose = legL([0.1, 0.32, 0.94], [0.06, 0.3, 0.95]);
/** In the air on the skip into a right kick: the knee chambered, the left leg trailing. */
const SKIP_CHAMBER_R: Pose = compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, legR([-0.2, 0.42, 0.89], [-0.1, -0.75, 0.65]), legL([0.1, -0.86, 0.5], [0.06, -0.72, -0.69]));

/** The right kick, from the landing at the foe (`t` is the skip): the skip in, the snap, the hold, the rechamber. */
const rightKick = (t: number, ...hold: Pose[]) => [
  key(t, skipTo(KICK * 0.5, 0.05), SKIP_CHAMBER_R, pelvis(0.01, -0.02), bend(2, 0, 0, -2), ...hold),
  snap(t + 0.06, atFoe(KICK), SNAP_R, pelvis(0.015, -0.025), bend(-10, 0, 0, 0), tail(-10), ...hold),
  key(t + 0.14, atFoe(KICK), SNAP_R, pelvis(0.015, -0.026), bend(-9, 0, 0, 0), tail(-10), ...hold),
  key(t + 0.21, atFoe(KICK), CHAMBER_R, pelvis(0.012, -0.03), bend(0, 0, 0, -2), ...hold),
];

/**
 * Double Kick as one clip (the battle playtest plays it whole): it skips in
 * with the knee up, springs off its left foot and snaps the right foot into
 * the foe, then switches feet with a hop and snaps the left one in; hops
 * home. Two impacts.
 */
export const double_kick: Clip = {
  name: 'double_kick',
  duration: 1.62,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.035), bend(14, 0, 0, -4), GUARD, crest(-6), ANGRY),
    ...skipIn(0.2, bend(8, 0, 0, -4), GUARD, ANGRY),
    // Down at the foe on its left foot, the right knee still chambered.
    key(0.48, ARRIVE, CHAMBER_R, pelvis(0.01, -0.01), bend(4, 0, 0, -2), GUARD, ANGRY),
    ...rightKick(0.52, GUARD, ANGRY),
    // A hop to switch feet, the left knee coming up.
    key(0.81, atFoe(KICK), root({ y: 0.05 }), TUCK, bend(4, 0, 0, -2), GUARD, ANGRY),
    // Left snap kick, the hips turning into it.
    snap(0.89, atFoe(KICK), CHAMBER_L, SNAP_L_LEG, root({ yaw: -18 }), pelvis(-0.015, -0.025), bend(-10, 0, 0, 0), GUARD, tail(-10), ANGRY),
    key(0.97, atFoe(KICK), CHAMBER_L, SNAP_L_LEG, root({ yaw: -16 }), pelvis(-0.015, -0.026), bend(-9, 0, 0, 0), GUARD, tail(-10), ANGRY),
    key(1.05, atFoe(KICK), CHAMBER_L, CHAMBER_L_LEG, root({ yaw: -8 }), pelvis(-0.012, -0.03), bend(0, 0, 0, -2), GUARD, ANGRY),
    key(1.15, atFoe(KICK), LAND, GUARD, ANGRY),
    ...hopHome(1.27, GUARD, ANGRY),
    key(1.62, OPEN_EYES),
  ],
  events: [{ t: 0.63, name: 'impact' }, { t: 0.94, name: 'impact' }],
};

/** Double Kick, the first hit: skips in with the knee up, springs off its left foot and snaps the right foot into the foe, then comes down into a guard at it. */
export const double_kick_first: Clip = {
  name: 'double_kick_first',
  duration: 1.0,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.035), bend(14, 0, 0, -4), GUARD, crest(-6), ANGRY),
    ...skipIn(0.2, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.48, ARRIVE, CHAMBER_R, pelvis(0.01, -0.01), bend(4, 0, 0, -2), GUARD, ANGRY),
    ...rightKick(0.52, GUARD, ANGRY),
    // Down on both feet in a guard, ready for the next.
    key(0.86, atFoe(KICK), LAND, bend(8, 2, 0, -2), GUARD, ANGRY),
    key(1.0, ...AT_FOE_GUARD),
  ],
  events: [{ t: 0.63, name: 'impact' }],
};

/** Double Kick, the last hit: from its guard at the foe, a hop to switch feet and the left foot snapped in, the hips turning; then home. */
export const double_kick_last: Clip = {
  name: 'double_kick_last',
  duration: 1.02,
  keys: [
    key(0, ...AT_FOE_GUARD),
    // A little hop onto the right foot, the left knee coming up.
    key(0.07, atFoe(KICK), root({ y: 0.04 }), TUCK, bend(4, 0, 0, -2), GUARD, ANGRY),
    key(0.13, atFoe(KICK), CHAMBER_L, CHAMBER_L_LEG, root({ yaw: -6 }), pelvis(-0.012, -0.035), bend(4, 0, 0, -2), GUARD, ANGRY),
    snap(0.2, atFoe(KICK), CHAMBER_L, SNAP_L_LEG, root({ yaw: -18 }), pelvis(-0.015, -0.025), bend(-10, 0, 0, 0), GUARD, tail(-10), ANGRY),
    key(0.28, atFoe(KICK), CHAMBER_L, SNAP_L_LEG, root({ yaw: -16 }), pelvis(-0.015, -0.026), bend(-9, 0, 0, 0), GUARD, tail(-10), ANGRY),
    key(0.37, atFoe(KICK), CHAMBER_L, CHAMBER_L_LEG, root({ yaw: -8 }), pelvis(-0.012, -0.03), bend(0, 0, 0, -2), GUARD, ANGRY),
    key(0.47, atFoe(KICK), LAND, GUARD, ANGRY),
    ...hopHome(0.59, GUARD, ANGRY),
    key(1.02, OPEN_EYES),
  ],
  events: [{ t: 0.25, name: 'impact' }],
};

/**
 * Mega Kick: a run-up of quick bounding strides, then it jumps and drives a
 * flying kick into the foe, the right leg locked straight out with the whole
 * body behind it and the arms flung back; it lands, turns out of it and
 * hops home.
 */
export const mega_kick: Clip = {
  name: 'mega_kick',
  duration: 1.9,
  keys: [
    key(0),
    // Gathers, leaning back on its standing leg.
    key(0.2, pelvis(0, -0.045, -0.01), bend(-4, -2, 0, -10), GUARD, crest(-8), ANGRY),
    // The run-up: quick bounding strides.
    key(0.32, at(0.24), root({ y: 0.05 }), STRIDE, bend(12, 2, 0, -8), WINGS_OUT, ANGRY),
    key(0.42, at(0.46), root({ y: 0.05 }), mirror(STRIDE), bend(12, 2, 0, -8), WINGS_OUT, ANGRY),
    key(0.52, at(0.68), root({ y: 0.06 }), STRIDE, bend(12, 2, 0, -8), WINGS_OUT, ANGRY),
    // The jump, the kicking knee drawn up high.
    key(0.62, leap(0.92, 0.12), lunge(0.3), legR([-0.2, 0.5, 0.84], [-0.1, -0.6, 0.79]), bend(-6, -4, 0, -10), GUARD_L, ARMS_BACK, ANGRY),
    // The flying kick: the leg locked straight into the foe, the body behind it.
    snap(0.7, atFoe(KICK + 0.06), root({ y: 0.1 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, legR([-0.12, 0.2, 0.97], [-0.08, 0.18, 0.98]), legL([0.25, -0.62, -0.74], [0.12, -0.35, -0.93]), bend(-18, -6, 0, -8), ARMS_BACK, tail(-14), ANGRY),
    key(0.8, atFoe(KICK + 0.08), root({ y: 0.08 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, legR([-0.12, 0.18, 0.98], [-0.08, 0.16, 0.98]), legL([0.25, -0.62, -0.74], [0.12, -0.35, -0.93]), bend(-17, -6, 0, -8), ARMS_BACK, tail(-14), ANGRY),
    // Lands, turning out of it.
    fall(0.96, atFoe(KICK), root({ yaw: -24 }), LAND, bend(6, 0, 0, -6), GUARD, ANGRY),
    key(1.14, atFoe(KICK), root({ yaw: -8 }), LAND, pelvis(0, 0.01), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.3, GUARD, ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

export const KICKS: Clip[] = [double_kick, double_kick_first, double_kick_last, mega_kick];
