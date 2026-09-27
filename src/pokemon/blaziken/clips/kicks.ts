// Blaziken's kicks: its signature. The standing foot stays planted
// (plantLeft/plantRight), the kicking thigh chambers, then the shin snaps out
// into the foe with the body leaning away; legs have no overlap delay, so a
// kick lands on its key (the impact comes a few frames later, the leg held
// out, so the blow shows before the sparks).

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_BACK, ARRIVE, AT_FOE_GUARD, GUARD, HOP, LAND, LAND_DEEP, OPEN_EYES, STRIDE, TUCK,
  arms, at, bend, flames, hopHome, key, leap, lunge, legL, legR, mirror, pelvis, root, snap,
} from './kit';

/** Right knee chambered, the left foot planted. */
const CHAMBER_R: Pose = { plantLeft: 1, plantRight: 0, ...legR([-0.22, -0.5, 0.84], [-0.12, -0.95, 0.1]) };
/** Right shin snapped out straight at the foe's middle. */
const SNAP_R: Pose = { plantLeft: 1, plantRight: 0, ...legR([-0.15, 0.12, 0.98], [-0.1, 0.18, 0.98]) };
/** Left knee chambered, the right foot planted (the hips turning). */
const CHAMBER_L: Pose = { plantLeft: 0, plantRight: 1, ...legL([0.25, -0.5, 0.83], [0.12, -0.95, 0.1]) };
/** Left shin snapped out into the foe. */
const SNAP_L: Pose = { plantLeft: 0, plantRight: 1, ...legL([0.15, 0.15, 0.98], [0.1, 0.22, 0.97]) };

/**
 * Double Kick as one clip (the battle playtest plays it whole): leap in, a
 * right snap kick into the foe, then a left kick with the hips turning into
 * it, and hop home. Two impacts.
 */
export const double_kick: Clip = {
  name: 'double_kick',
  duration: 1.7,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.04), bend(22, 0, 0, 0), GUARD, ANGRY),
    key(0.28, leap(0.55, 0.07), bend(12, 0, 0, 0), GUARD, ANGRY),
    key(0.4, ARRIVE, GUARD, ANGRY),
    // Right snap kick: the standing leg stays planted, the body leans back.
    key(0.46, at(1), CHAMBER_R, pelvis(0.012, -0.03), bend(2, 0, 0, 0), GUARD, ANGRY),
    snap(0.53, at(1), SNAP_R, lunge(0.07), pelvis(0.015, -0.02), bend(-12, 0, 0, 0), GUARD, ANGRY),
    key(0.61, at(1), SNAP_R, lunge(0.07), pelvis(0.015, -0.021), bend(-11, 0, 0, 0), GUARD, ANGRY),
    key(0.68, at(1), CHAMBER_R, pelvis(0.012, -0.025), bend(0, 0, 0, 0), GUARD, ANGRY),
    key(0.76, at(1), pelvis(0, -0.04), bend(12, 0, 0, 0), GUARD, ANGRY),
    // Left kick: the hips turn into it.
    snap(0.86, at(1), SNAP_L, root({ yaw: -22 }), lunge(0.07), pelvis(-0.015, -0.02), bend(-12, 0, 0, 0), GUARD, ANGRY),
    key(0.94, at(1), SNAP_L, root({ yaw: -20 }), lunge(0.07), pelvis(-0.015, -0.021), bend(-11, 0, 0, 0), GUARD, ANGRY),
    key(1.02, at(1), CHAMBER_L, root({ yaw: -12 }), pelvis(-0.012, -0.025), bend(0, 0, 0, 0), GUARD, ANGRY),
    key(1.12, at(1), LAND, GUARD, ANGRY),
    ...hopHome(1.28, GUARD, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.57, name: 'impact' }, { t: 0.9, name: 'impact' }],
};

/** Double Kick, the first hit: leap in, the right snap kick into the foe, and stay at it in a guard. */
export const double_kick_first: Clip = {
  name: 'double_kick_first',
  duration: 0.95,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.04), bend(22, 0, 0, 0), GUARD, ANGRY),
    key(0.28, leap(0.55, 0.07), bend(12, 0, 0, 0), GUARD, ANGRY),
    key(0.4, ARRIVE, GUARD, ANGRY),
    key(0.46, at(1), CHAMBER_R, pelvis(0.012, -0.03), bend(2, 0, 0, 0), GUARD, ANGRY),
    snap(0.53, at(1), SNAP_R, lunge(0.07), pelvis(0.015, -0.02), bend(-12, 0, 0, 0), GUARD, ANGRY),
    key(0.61, at(1), SNAP_R, lunge(0.07), pelvis(0.015, -0.021), bend(-11, 0, 0, 0), GUARD, ANGRY),
    key(0.7, at(1), CHAMBER_R, pelvis(0.012, -0.026), bend(2, 0, 0, 0), GUARD, ANGRY),
    // Settles into a guard at the foe, ready for the next.
    key(0.8, at(1), LAND, pelvis(0, 0.01), GUARD, ANGRY),
    key(0.95, ...AT_FOE_GUARD),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/** Double Kick, the last hit: from the guard at the foe, the left kick with the hips turning into it, then home. */
export const double_kick_last: Clip = {
  name: 'double_kick_last',
  duration: 1.05,
  keys: [
    key(0, ...AT_FOE_GUARD),
    // The left knee chambers as the hips turn.
    key(0.08, at(1), CHAMBER_L, root({ yaw: -8 }), pelvis(-0.012, -0.03), bend(4, 0, 0, 0), GUARD, ANGRY),
    snap(0.16, at(1), SNAP_L, root({ yaw: -22 }), lunge(0.07), pelvis(-0.015, -0.02), bend(-12, 0, 0, 0), GUARD, ANGRY),
    key(0.24, at(1), SNAP_L, root({ yaw: -20 }), lunge(0.07), pelvis(-0.015, -0.021), bend(-11, 0, 0, 0), GUARD, ANGRY),
    key(0.33, at(1), CHAMBER_L, root({ yaw: -12 }), pelvis(-0.012, -0.025), bend(0, 0, 0, 0), GUARD, ANGRY),
    key(0.44, at(1), LAND, GUARD, ANGRY),
    ...hopHome(0.58, GUARD, ANGRY),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'impact' }],
};

/**
 * Blaze Kick: coils turned away, springs up and in, chambers at the top of
 * the arc already turning, and lands a spinning heel kick side-on into the
 * foe with its heel ablaze, the spin carrying on round; it lands deep facing
 * the foe again and hops home, the flames dying.
 */
export const blaze_kick: Clip = {
  name: 'blaze_kick',
  duration: 2.1,
  keys: [
    key(0),
    // Coil: deep crouch, turned away from the foe.
    key(0.3, pelvis(0, -0.1), root({ yaw: -25 }), bend(26, 0, 0, -14, 18), GUARD, ANGRY, flames(0.6)),
    // Spring up and in.
    key(0.5, leap(0.5, 0.2), root({ yaw: -8 }), bend(6, 0, 0, -8, 10), GUARD, ANGRY, flames(1)),
    // Chamber the kick at the top of the arc, already turning.
    key(0.64, at(0.85), { plantFeet: 0 }, root({ y: 0.23, yaw: 55 }), { bones: { spine: { x: -6, z: -8 }, head: { y: -40 } } }, ANGRY, flames(1),
      legR([-0.8, 0.1, 0.6], [0.1, -0.6, 0.8]), legL([0.3, -0.85, -0.42], [0.1, -0.5, -0.86]),
      arms([[-0.2, -0.3, 0.93], [0.4, 0.5, 0.77]], [[0.9, 0.1, 0.4], [0.6, 0.6, 0.5]])),
    // The kick lands side-on, the flaming heel fully extended into the foe.
    snap(0.76, at(1), { plantFeet: 0 }, root({ y: 0.17, yaw: 90 }), lunge(0.1), { bones: { spine: { x: -8, z: -18 }, head: { x: 4, y: -70 } } }, ANGRY, flames(1),
      legR([-0.97, 0.22, 0.1], [-0.97, 0.24, 0.05]), legL([0.35, -0.85, -0.38], [0.15, -0.6, -0.78]),
      arms([[-0.3, -0.5, -0.8], [0.3, -0.2, -0.93]], [[0.95, 0.2, 0.2], [0.75, 0.6, 0.25]])),
    // Follow-through: the spin carries on round.
    key(0.94, at(1), root({ y: 0.1, yaw: 230 }), lunge(0.05), TUCK, { bones: { spine: { x: 6, z: -6 }, head: { y: -30 } } }, GUARD, ANGRY, flames(1)),
    // Land facing the foe again, deep in the knees.
    key(1.12, at(1), root({ yaw: 360 }), LAND_DEEP, bend(8, 0, 0, 4), GUARD, ANGRY, flames(0.8)),
    key(1.34, at(1), root({ yaw: 360 }), pelvis(0, -0.03), bend(10, 0, 0, 0), GUARD, ANGRY, flames(0.6)),
    // Hop back.
    key(1.52, at(0.45), root({ y: 0.07, yaw: 360 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, flames(0.4)),
    key(1.68, at(0), root({ yaw: 360 }), LAND, GUARD, ANGRY, flames(0.2)),
    key(2.1, root({ yaw: 360 }), flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
};

/**
 * Mega Kick: a long run-up (two bounding strides), the kicking knee
 * chambered high at the foe, then a massive straight kick with the whole
 * body behind it, the standing leg braced and the arms flung back; the
 * follow-through turns the body, and it lands and hops home.
 */
export const mega_kick: Clip = {
  name: 'mega_kick',
  duration: 1.95,
  keys: [
    key(0),
    // Gathers: a crouch leaning back.
    key(0.2, pelvis(0, -0.05, -0.01), bend(-4, -2, 0, -10), GUARD, ANGRY),
    // The run-up: two bounding strides.
    key(0.36, at(0.3), root({ y: 0.05 }), STRIDE, bend(14, 2, 0, -8), arms([[-0.35, -0.6, 0.72], [0.1, 0.6, 0.8]], [[0.4, -0.7, -0.6], [0.2, -0.2, 0.96]]), ANGRY),
    key(0.5, at(0.66), root({ y: 0.06 }), mirror(STRIDE), bend(14, 2, 0, -8), arms([[-0.4, -0.7, -0.6], [-0.2, -0.2, 0.96]], [[0.35, -0.6, 0.72], [-0.1, 0.6, 0.8]]), ANGRY),
    // Plants at the foe on the left foot, the right knee chambered high, leaning back.
    key(0.62, at(1), { plantLeft: 1, plantRight: 0 }, legR([-0.2, 0.32, 0.93], [-0.1, -0.72, -0.69]), pelvis(0.01, -0.04, -0.01), bend(-8, -4, 0, -10), GUARD, ANGRY),
    // The kick: the whole body behind it, arms flung back.
    snap(0.7, at(1), { plantLeft: 1, plantRight: 0 }, legR([-0.12, 0.14, 0.98], [-0.08, 0.18, 0.98]), lunge(0.14), pelvis(0.016, -0.03, 0.02), bend(-18, -6, 0, -8), ARMS_BACK, ANGRY),
    key(0.8, at(1), { plantLeft: 1, plantRight: 0 }, legR([-0.12, 0.12, 0.99], [-0.08, 0.15, 0.99]), lunge(0.15), pelvis(0.016, -0.031, 0.021), bend(-17, -6, 0, -8), ARMS_BACK, ANGRY),
    // Follow-through: the leg drops as the body turns with it.
    key(0.96, at(1), { plantLeft: 1, plantRight: 0 }, legR([-0.3, -0.4, 0.87], [-0.15, -0.9, 0.4]), root({ yaw: -28 }), lunge(0.08), pelvis(0.012, -0.035), bend(4, 0, 0, -6), ARMS_BACK, ANGRY),
    key(1.12, at(1), root({ yaw: -10 }), LAND, GUARD, ANGRY),
    key(1.28, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.42, GUARD, ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.75, name: 'impact' }],
};

export const KICKS: Clip[] = [double_kick, double_kick_first, double_kick_last, blaze_kick, mega_kick];
