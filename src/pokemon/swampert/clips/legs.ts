// Swampert's legs: Mega Kick (a run-up and a massive push-kick), Stomp (a
// jump and a stamp down onto the foe) and Earthquake (a sumo's shiko: one
// leg raised high to the side and stamped down with everything). Legs have
// no overlap delay: a kick lands on its key.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_BACK, ARMS_DOWN_FRONT, ELBOWS_OUT, FISTS, HOP, LAND_DEEP, MOUTH_SHUT, OPEN_EYES, SQUINT,
  arms, atFoe, bend, body, clip, fall, flying, hopHome, jaw, key, landed, lean, pelvis, sink, snap, twist,
} from './kit';

/** Arms flung back and out for balance (kicking). */
const BALANCE = arms([0.85, -0.2, -0.48], [0.6, -0.5, -0.62], [0.35, -0.7, -0.62]);
/** Arms spread out to the sides at shoulder height, hands open (balancing on one leg, in the air). */
const WINGS = arms([0.97, 0.12, 0.2], [0.85, -0.25, 0.46], [0.5, -0.6, 0.62]);
/**
 * Shiko balance: the left arm out wide over the raised left leg, the right
 * held in front of the chest (from our side an arm out to its right went
 * under our healthbox).
 */
const SHIKO_ARMS = arms([0.97, 0.12, 0.2], [0.85, -0.25, 0.46], [0.5, -0.6, 0.62], [[-0.5, -0.3, 0.81], [0.25, -0.1, 0.96], [0.4, -0.25, 0.88]]);
/** Sumo: both hands pressed down on the knees (after the stamp). */
const HANDS_ON_KNEES = arms([0.62, -0.72, 0.3], [0.1, -0.9, 0.42], [-0.15, -0.9, 0.4]);

/**
 * Leg poses as bone rotations on top of the stance (its legs carry no aims,
 * so a key at the stance stays the stance): thigh x < 0 swings the leg
 * forward, shin x > 0 bends the knee back; thigh z > 0 swings the left leg
 * out to its left side.
 */
/** The right knee chambered high in front (the kick cocked), the left leg planted. */
const KNEE_UP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -95 }, shinR: { x: 100 } } };
/** The right leg driven straight out at the foe, the sole leading. */
const KICK_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -88 }, shinR: { x: 6 } } };
/** ... drawing back after it. */
const KICK_R_BACK: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -60 }, shinR: { x: 60 } } };
/** The kicking leg turned back toward the foe while the body stands side-on (root yaw). */
const KICK_AIM: Pose = { bones: { thighR: { y: -35 } } };
/** Stomp: the right foot driven down and forward onto the foe. */
const STAMP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -62 }, shinR: { x: 24 } } };

/** Shiko: the left leg raised high out to its left side, the knee bent. */
const SHIKO_UP: Pose = { plantLeft: 0, plantRight: 1, bones: { thighL: { x: -30, z: 92 }, shinL: { z: -74 } } };
/** ... on the way up (and down). */
const SHIKO_MID: Pose = { plantLeft: 0, plantRight: 1, bones: { thighL: { x: -14, z: 40 }, shinL: { z: -30 } } };

/**
 * Mega Kick: a long run-up. It coils low, bounds in with a first heavy hop,
 * then a second leaping stride with the right knee chambered high, lands on
 * its left foot braced in front of the foe, and drives the right leg straight
 * out into it, the sole leading and the whole body behind it, leaning back
 * with its arms flung back for balance; the kick follows through, the body
 * turning with it, and it hops home.
 */
export const megaKick = clip('mega_kick', [
  key(0),
  key(0.26, sink(-0.07), bend(8, 2, 0, 6), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.42, flying(0.35, 0.09), bend(10, 2, 0, 4), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.54, landed(0.55), bend(12, 3, 0, 4), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.7, { advance: 0.82, root: { y: 0.12 } }, HOP, bend(-4, -2, 0, -2), BALANCE, KNEE_UP_R, jaw(6), ANGRY),
  key(0.82, atFoe(0.04), body(0, 0, 0, 0, 0, 20), LAND_DEEP, KNEE_UP_R, bend(-8, -3, 0, -4), BALANCE, jaw(8), ANGRY),
  snap(0.9, atFoe(0.3), body(0, 0, 0, 0, 0, 35), pelvis(0, -0.02, 0.04), bend(-16, -6, -2, -8), BALANCE, KICK_R, KICK_AIM, jaw(20), ANGRY),
  key(1.04, atFoe(0.32), body(0, 0, 0, 0, 0, 38), pelvis(0, -0.02, 0.045), bend(-17, -6, -2, -9), twist(-10), BALANCE, KICK_R, KICK_AIM, jaw(16), ANGRY),
  key(1.2, atFoe(0.12), body(0, 0, 0, 0, 0, 20), pelvis(0, -0.04, 0.01), bend(-4, -2, 0, -2), twist(-16), ELBOWS_OUT, KICK_R_BACK, ANGRY),
  key(1.34, atFoe(0.04), LAND_DEEP, bend(6, 2, 0, 1), twist(-6), ELBOWS_OUT, ANGRY),
  ...hopHome(1.5, ELBOWS_OUT, ANGRY),
  key(1.84, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.2, OPEN_EYES),
], [[0.92, 'impact']]);

/**
 * Stomp: it hops in, then jumps up off both feet with the right knee drawn
 * high, and comes down on the foe with that big foot driving down onto it;
 * it grinds its heel in, steps back off it and hops home.
 */
export const stomp = clip('stomp', [
  key(0),
  key(0.22, sink(-0.06), bend(10, 3, 0, 8), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.55, 0.08), bend(6, 2, 0, 2), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.52, landed(1, true), bend(12, 3, 0, 6), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.7, atFoe(0.06), body(0, 0.16, 0), { plantFeet: 0 }, bend(-8, -3, 0, -6), WINGS, KNEE_UP_R, jaw(10), ANGRY),
  key(0.8, atFoe(0.12), body(0, 0.18, 0), { plantFeet: 0 }, bend(-5, -2, 0, -4), WINGS, KNEE_UP_R, jaw(12), ANGRY),
  fall(0.9, atFoe(0.24), pelvis(0, -0.03, 0.03), bend(14, 5, 0, 8), ARMS_DOWN_FRONT, STAMP_R, jaw(20), ANGRY),
  key(1.0, atFoe(0.24), pelvis(0, -0.045, 0.03), bend(16, 6, 0, 9), twist(7), ARMS_DOWN_FRONT, STAMP_R, jaw(14), SQUINT),
  key(1.1, atFoe(0.23), pelvis(0, -0.045, 0.03), bend(16, 6, 0, 9), twist(-6), ARMS_DOWN_FRONT, STAMP_R, jaw(12), ANGRY),
  key(1.26, atFoe(0.06), LAND_DEEP, bend(8, 2, 0, 2), ELBOWS_OUT, ANGRY),
  ...hopHome(1.42, ELBOWS_OUT, ANGRY),
  key(1.76, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.1, OPEN_EYES),
], [[0.98, 'impact']]);

/**
 * Earthquake: a sumo's shiko, rearing and stamping with everything. It
 * shifts its weight onto the right leg and raises the left high out to its
 * side (to its left: from our side a leg raised to its right went under our
 * healthbox), the left arm out wide for balance and the torso kept upright
 * over the standing leg (leaning over it put the body under our box), holds
 * it a beat at the top, then stamps it down with its whole mass, dropping
 * into a deep squat with its hands slammed onto its knees as the ground
 * heaves (impact on the stamp), and holds the squat pressing down.
 */
export const earthquake = clip('earthquake', [
  key(0),
  key(0.16, sink(-0.03), bend(6, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.4, pelvis(-0.025, -0.01), body(0, 0, 0, 0, 1), lean(2), bend(-2, -1, 0, -2), SHIKO_ARMS, SHIKO_MID, jaw(6), ANGRY),
  key(0.62, pelvis(-0.035, 0.012), body(0, 0, 0, 0, 2), lean(2), bend(-6, -3, 0, -8, 0, -3), SHIKO_ARMS, SHIKO_UP, jaw(12), ANGRY),
  key(0.74, pelvis(-0.037, 0.016), body(0, 0, 0, 0, 2), lean(3), bend(-7, -3, 0, -9, 0, -2), SHIKO_ARMS, SHIKO_UP, jaw(14), ANGRY),
  key(0.82, pelvis(-0.015, -0.01), body(0, 0, 0, 0, 1), lean(1), bend(6, 2, 0, 2), ELBOWS_OUT, SHIKO_MID, jaw(18), ANGRY),
  snap(0.87, sink(-0.1), bend(16, 6, 0, 7), HANDS_ON_KNEES, FISTS, jaw(24), ANGRY),
  key(0.98, sink(-0.11), bend(18, 7, 0, 8), HANDS_ON_KNEES, FISTS, jaw(18), SQUINT),
  key(1.18, sink(-0.1), bend(15, 5, 0, 6, 3), HANDS_ON_KNEES, FISTS, jaw(14), ANGRY),
  key(1.38, sink(-0.106), bend(16, 5, 0, 6, -3), HANDS_ON_KNEES, FISTS, jaw(12), ANGRY),
  key(1.6, sink(-0.04), bend(6, 2, 0, 1), ELBOWS_OUT, ANGRY),
  key(2.05, OPEN_EYES),
], [[0.88, 'impact']]);

export const LEG_CLIPS = [megaKick, stomp, earthquake];

