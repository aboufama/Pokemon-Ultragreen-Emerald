// Combusken's beak and whole-body moves: jabs, dashes, charges, heaves, a
// belly-flop, a toss and a burrow. It lands at the foe (kit: atFoe) and
// throws the body in with a skip or a leap (BEAK, BODY), so the beak, the
// shoulder or the chest lands on the foe; once a foot is down it stays down
// until it hops home.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import type { Arm } from './kit';
import {
  ANGRY, ARMS_BACK, ARRIVE, ARRIVE_FEET, BEAK, BODY, CHAMBER, CLAW, DIG_ARMS, DROWSY, ELBOWS_BACK, FEET, FOLDED, GRIP, GUARD, HAPPY,
  HEAVE, HOP, HURT, KICK, LAND, LAND_DEEP, LIMP, OPEN_EYES, PUSH, REACH, RISING_KNEE, SHUT, SKIP, SLAM_DOWN, STRIDE, TUCK, TUCK_HIGH, WINGS_OUT,
  arms, armR, at, atFoe, bend, both, crest, fall, hopHome, jaw, key, leap, legR, lunge, mirror, mirrorArm, pelvis, root, skipIn, skipTo, snap,
  tail, twist,
} from './kit';

const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];

/** Peck: the head cocked back, a skip in, then the neck and head drive the beak into the foe with the arms swept back; the head rebounds. */
export const peck: Clip = {
  name: 'peck',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), bend(-4, -6, -14, -18), GUARD, crest(-10), ANGRY),
    ...skipIn(0.2, bend(4, -4, -14, -18), GUARD, ANGRY),
    // Lands and coils: the head further back, the arms swept back.
    key(0.48, ARRIVE, bend(0, -8, -18, -22), ARMS_BACK, ANGRY),
    key(0.53, skipTo(BEAK * 0.5), bend(-2, -8, -18, -22), ARMS_BACK, ANGRY),
    // The jab: spine, neck and head pitch forward, the body springs in, the beak leads.
    snap(0.59, atFoe(BEAK), pelvis(0, -0.045, 0.02), bend(22, 12, 22, 14), ARMS_BACK, tail(-10), ANGRY),
    key(0.69, atFoe(BEAK), pelvis(0, -0.046, 0.021), bend(23, 12, 23, 14), ARMS_BACK, tail(-10), ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.84, atFoe(BEAK), pelvis(0, -0.04), bend(12, 6, 2, -2), ARMS_BACK, ANGRY),
    key(0.96, atFoe(BEAK), pelvis(0, -0.035), bend(8, 2, 0, 0), GUARD, ANGRY),
    ...hopHome(1.08, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/** Quick Attack: a blur. A flick of a crouch, a streaking dash low across the field with the arms swept back (no skipping), a glancing shoulder hit, a bounce off and home. */
export const quick_attack: Clip = {
  name: 'quick_attack',
  duration: 1.05,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), twist(-12), bend(22, 0, 0, -10, 8), ARMS_BACK, crest(-12), ANGRY),
    key(0.17, leap(0.76, 0.03), lunge(0.3), STRIDE, twist(-22), bend(34, 0, 0, -16, 14), ARMS_BACK, crest(-18), ANGRY),
    // The body slams in shoulder first.
    snap(0.22, atFoe(BODY + 0.04), root({ y: 0.02 }), STRIDE, twist(-26), bend(30, 0, 0, -14, 14), ARMS_BACK, ANGRY),
    key(0.3, atFoe(BODY + 0.05), root({ y: 0.02 }), STRIDE, twist(-26), bend(29, 0, 0, -14, 14), ARMS_BACK, ANGRY),
    // Bounces off.
    key(0.42, at(0.8), lunge(0.3), root({ y: 0.08 }), HOP, twist(-6), bend(6, 0, 0, -6), GUARD, ANGRY),
    key(0.56, at(0.4), root({ y: 0.05 }), HOP, GUARD, ANGRY),
    fall(0.7, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.28, name: 'impact' }],
};

/** Double-Edge: a reckless all-out charge. A deep coil, pounding strides and a headlong dive that crashes shoulder first into the foe; it recoils hurt, staggers, shakes it off and hops home. */
export const double_edge: Clip = {
  name: 'double_edge',
  duration: 1.95,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.07), twist(-10), bend(26, 4, 0, -12, 8), ARMS_BACK, crest(-10), ANGRY),
    key(0.34, at(0.26), root({ y: 0.05 }), STRIDE, twist(-14), bend(28, 4, 0, -14, 10), ARMS_BACK, ANGRY),
    key(0.46, at(0.5), root({ y: 0.05 }), mirror(STRIDE), twist(-14), bend(30, 4, 0, -14, 10), ARMS_BACK, ANGRY),
    key(0.56, at(0.74), root({ y: 0.06 }), STRIDE, twist(-16), bend(32, 4, 0, -14, 10), ARMS_BACK, ANGRY),
    // The dive.
    key(0.64, at(0.94), root({ y: 0.05 }), lunge(0.4), TUCK, twist(-22), bend(38, 8, 0, -16, 12), ARMS_BACK, crest(-18), ANGRY),
    // The crash: the whole body into the foe.
    snap(0.7, atFoe(BODY), root({ y: 0.02 }), TUCK, twist(-26), bend(36, 8, 0, -14, 12), ARMS_BACK, ANGRY),
    key(0.78, atFoe(BODY), root({ y: 0.02 }), TUCK, twist(-26), bend(35, 8, 0, -14, 12), ARMS_BACK, ANGRY),
    // Recoil: knocked back hurt.
    key(0.96, at(0.86), lunge(0.2), root({ y: 0.06 }), HOP, bend(-10, -6, -4, -16), both(A([-0.8, -0.25, 0.55], [-0.4, 0.3, 0.87], [-0.3, 0.5, 0.81])), HURT),
    // Staggers, wincing.
    fall(1.12, at(0.8), lunge(0.2), LAND, root({ roll: -5 }), pelvis(0, -0.015), bend(14, 6, 4, 8, 0, 6), LIMP, HURT),
    key(1.3, at(0.8), lunge(0.2), FEET, root({ roll: 3 }), pelvis(0, -0.05), bend(10, 4, 2, 4, 8, -4), LIMP, HURT),
    // Shakes it off.
    key(1.44, at(0.8), lunge(0.2), FEET, pelvis(0, -0.04), bend(8, 2, 0, -2, -6), GUARD, ANGRY),
    snap(1.58, at(0.4), root({ y: 0.07 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(1.71, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.75, name: 'impact' }],
};

/** Strength: it plants itself and heaves: both clawed hands set on the foe low and wide, then the legs drive and both arms shove it with enormous power. */
export const strength: Clip = {
  name: 'strength',
  duration: 1.8,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.045), bend(12, 4, 0, -8), ELBOWS_BACK, ANGRY),
    ...skipIn(0.24, bend(8, 4, 0, -8), ELBOWS_BACK, ANGRY),
    key(0.52, ARRIVE_FEET, pelvis(0, 0.03), bend(14, 4, 0, -8), ELBOWS_BACK, ANGRY),
    // A hop in, and the hands set on it, sinking low and wide.
    key(0.58, atFoe(CLAW), root({ y: 0.05 }), TUCK, bend(16, 4, 0, -8), REACH, ANGRY),
    fall(0.66, atFoe(CLAW + 0.08), LAND_DEEP, bend(20, 6, 0, -8), REACH, ANGRY),
    // The heave: the legs drive, both arms shove.
    snap(0.76, atFoe(CLAW + 0.08), FEET, pelvis(0, -0.065, 0.03), bend(24, 8, 0, -8), PUSH, jaw(24), crest(-14), ANGRY),
    key(0.88, atFoe(CLAW + 0.08), FEET, pelvis(0, -0.063, 0.032), bend(25, 8, 0, -8), PUSH, jaw(20), ANGRY),
    key(1.04, atFoe(CLAW + 0.08), FEET, pelvis(0, -0.06, 0.03), bend(22, 8, 0, -6), PUSH, jaw(8), ANGRY),
    key(1.2, atFoe(CLAW + 0.08), FEET, pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.32, GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.86, name: 'impact' }],
};

/** Body Slam: a deep coil, a leap high over the foe with the arms flung wide and a belly-flop that crushes down on it; it rolls off and hops home. */
export const body_slam: Clip = {
  name: 'body_slam',
  duration: 1.85,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.08), bend(20, 4, 0, -12), ELBOWS_BACK, ANGRY),
    key(0.42, leap(0.6, 0.3), TUCK_HIGH, bend(0, 0, 0, -12), WINGS_OUT, crest(-14), ANGRY),
    key(0.6, at(0.96), root({ y: 0.34, pitch: 30 }), lunge(0.4), TUCK_HIGH, bend(-4, -2, 0, -14), WINGS_OUT, ANGRY),
    // The belly-flop.
    fall(0.7, atFoe(BODY - 0.2), root({ y: 0.1, pitch: 58 }), TUCK, bend(-8, -4, 0, -24), both(A([-0.95, -0.2, 0.2], [-0.8, -0.3, 0.5], [-0.7, -0.35, 0.62])), ANGRY),
    key(0.8, atFoe(BODY - 0.19), root({ y: 0.09, pitch: 56 }), TUCK, bend(-8, -4, 0, -24), both(A([-0.95, -0.25, 0.2], [-0.8, -0.35, 0.48], [-0.7, -0.4, 0.6])), ANGRY),
    key(0.94, atFoe(BODY - 0.2), root({ y: 0.08, pitch: 52 }), TUCK, bend(-6, -4, 0, -22), both(A([-0.95, -0.28, 0.16], [-0.8, -0.38, 0.46], [-0.7, -0.42, 0.58])), ANGRY),
    // Rolls off and lands in a crouch beside it.
    key(1.1, at(0.94), lunge(0.3), root({ x: 0.1, y: 0.04, pitch: 10 }), HOP, bend(14, 4, 0, -6), GUARD, ANGRY),
    fall(1.24, at(0.92), lunge(0.3), root({ x: 0.1 }), LAND_DEEP, GUARD, ANGRY),
    key(1.38, at(0.92), lunge(0.3), root({ x: 0.1 }), LAND, pelvis(0, 0.005), bend(4, 2, 0, 4), GUARD, ANGRY),
    snap(1.52, at(0.45), root({ x: 0.04, y: 0.07 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(1.65, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/** Return: a joyful, loyal charge: happy skips, a bounding leap, a strong full-body hit with the shoulder, then a pleased bounce back and a happy hop home. */
export const return_: Clip = {
  name: 'return',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.05), bend(10, 2, 0, -6), ARMS_BACK, HAPPY),
    key(0.28, leap(0.5, 0.16), TUCK_HIGH, bend(4, 0, 0, -8), WINGS_OUT, crest(-10), HAPPY),
    key(0.42, at(0.9), lunge(0.3), root({ y: 0.1 }), TUCK, twist(-14), bend(18, 2, 0, -10, 8), ARMS_BACK, ANGRY),
    snap(0.48, atFoe(BODY), root({ y: 0.02 }), TUCK, twist(-24), bend(24, 2, 0, -12, 12), ARMS_BACK, ANGRY),
    key(0.56, atFoe(BODY + 0.01), root({ y: 0.02 }), TUCK, twist(-24), bend(23, 2, 0, -12, 12), ARMS_BACK, ANGRY),
    // Bounces back, pleased.
    key(0.7, at(0.86), lunge(0.2), root({ y: 0.08 }), HOP, bend(0, -2, 0, -8), WINGS_OUT, HAPPY),
    fall(0.84, at(0.8), lunge(0.1), SKIP, bend(4, 0, 0, -8, 0, 8), GUARD, HAPPY),
    key(0.98, at(0.8), lunge(0.1), SKIP, pelvis(0, -0.03), bend(2, 0, 0, -6, 0, -6), GUARD, HAPPY),
    snap(1.12, at(0.4), root({ y: 0.07 }), HOP, bend(4, 0, 0, -4), GUARD, HAPPY),
    fall(1.25, at(0), SKIP, pelvis(0, -0.02), GUARD, HAPPY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

/** Frustration: an angry, sulky stamp of its raised foot, a charge and a spiteful forearm bash; then a huff, head turned away and arms folded, on the way home. */
export const frustration: Clip = {
  name: 'frustration',
  duration: 1.7,
  keys: [
    key(0),
    // The raised foot lifts higher...
    key(0.12, legR([-0.2, 0.5, 0.84], [-0.1, -0.6, 0.79]), pelvis(0.005, -0.015), bend(8, 2, 0, 4), CHAMBER, ANGRY),
    // ...and stamps down, hard.
    snap(0.2, FEET, pelvis(0, -0.06), bend(16, 4, 0, 8, 8), CHAMBER, ANGRY),
    key(0.34, leap(0.6, 0.05), STRIDE, twist(16), bend(22, 2, 0, -8, -8), CHAMBER, ANGRY),
    key(0.44, at(0.96), lunge(0.4), root({ y: 0.03 }), STRIDE, twist(20), bend(24, 2, 0, -8, -8), armR(A([-0.7, 0.2, -0.68], [0.3, 0.1, 0.95])), ANGRY),
    // The spiteful bash: the right forearm swung across into it.
    snap(0.5, atFoe(BODY - 0.1), LAND, twist(-22, 4), bend(20, 4, 0, -6, 10), armR(A([-0.3, -0.02, 0.95], [0.88, -0.05, 0.47], [0.95, -0.05, 0.3])), jaw(12), ANGRY),
    key(0.6, atFoe(BODY - 0.1), LAND, twist(-26, 4), bend(20, 4, 0, -6, 11), armR(A([-0.12, -0.05, 0.99], [0.9, -0.1, 0.42], [0.96, -0.1, 0.25])), jaw(8), ANGRY),
    // A huff: head turned away, arms folded.
    key(0.76, atFoe(BODY - 0.1), FEET, pelvis(0, -0.035), bend(2, 0, 0, -10, 24, 6), FOLDED, jaw(10), SHUT),
    key(0.94, atFoe(BODY - 0.1), FEET, pelvis(0, -0.033), bend(1, 0, 0, -10, 26, 6), FOLDED, jaw(2), SHUT),
    snap(1.1, at(0.45), root({ y: 0.06 }), HOP, bend(2, 0, 0, -8, 14, 3), FOLDED, ANGRY),
    fall(1.23, at(0), SKIP, pelvis(0, -0.02), bend(0, 0, 0, -4, 8), FOLDED, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/** Facade: a gritty, determined charge: a wince (it hurts), gritted teeth, then a dash with the forearms up like a battering ram, driving through the foe. */
export const facade: Clip = {
  name: 'facade',
  duration: 1.55,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.03), bend(12, 6, 4, 10, 0, 6), LIMP, HURT),
    key(0.28, pelvis(0, -0.055), twist(10), bend(20, 4, 0, -10, -6), GUARD, crest(-10), ANGRY),
    key(0.4, leap(0.64, 0.04), lunge(0.1), STRIDE, twist(12), bend(26, 4, 0, -12, -8), GUARD, ANGRY),
    snap(0.47, atFoe(BODY), root({ y: 0.02 }), STRIDE, twist(14), bend(24, 4, 0, -12, -8), both(A([-0.3, -0.35, 0.89], [0.4, 0.5, 0.77], [0.5, 0.55, 0.67])), ANGRY),
    key(0.56, atFoe(BODY + 0.02), root({ y: 0.02 }), STRIDE, twist(14), bend(23, 4, 0, -12, -8), both(A([-0.3, -0.3, 0.9], [0.4, 0.52, 0.75], [0.5, 0.57, 0.65])), ANGRY),
    fall(0.68, atFoe(BODY + 0.02), LAND, twist(6), bend(16, 4, 0, -8, -4), GUARD, ANGRY),
    key(0.84, atFoe(BODY + 0.02), FEET, pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.98, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

/** Secret Power: a quick, scrappy strike: skips in low, grabs at the foe and drives its raised knee up into it (its crane knee, the kicker's weapon). */
export const secret_power: Clip = {
  name: 'secret_power',
  duration: 1.4,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.05), bend(20, 2, 0, -10), GUARD, ANGRY),
    ...skipIn(0.18, bend(18, 2, 0, -10), GUARD, ANGRY),
    key(0.46, ARRIVE, bend(14, 2, 0, -8), REACH, ANGRY),
    key(0.51, skipTo(KICK * 0.5), bend(12, 2, 0, -8), REACH, ANGRY),
    // The knee: the hands pull the foe down onto it.
    snap(0.57, atFoe(KICK), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.55, 0.83], [-0.05, -0.85, 0.52]), pelvis(0.01, -0.02, 0.02), bend(8, 4, 0, -6), GRIP, ANGRY),
    key(0.66, atFoe(KICK), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.57, 0.82], [-0.05, -0.83, 0.55]), pelvis(0.01, -0.021, 0.021), bend(9, 4, 0, -6), GRIP, ANGRY),
    key(0.77, atFoe(KICK), LAND, bend(10, 2, 0, -4), GUARD, ANGRY),
    key(0.89, atFoe(KICK), FEET, pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.01, GUARD, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.63, name: 'impact' }],
};

/** Arms flailing: the right one down and across, the left up (and the mirror). */
const FLAIL_A: Pose = arms(A([-0.6, 0.3, 0.74], [0.3, 0.7, 0.65], [0.4, 0.8, 0.45]), A([0.7, -0.4, 0.59], [0.2, -0.6, 0.77], [0.1, -0.7, 0.71]));
const FLAIL_B: Pose = mirror(FLAIL_A);

/** Reversal: desperate and wild: it skips in, then flails at the foe, arms whirling in turn and the knee kicking up, a flurry landing as one blow; it backs off panting. */
export const reversal: Clip = {
  name: 'reversal',
  duration: 1.6,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.045), bend(16, 6, 2, 4), LIMP, HURT),
    ...skipIn(0.2, bend(10, 2, 0, -6), FLAIL_A, ANGRY),
    key(0.48, ARRIVE, bend(12, 2, 0, -8), FLAIL_B, ANGRY),
    key(0.53, skipTo(KICK * 0.5), twist(10), bend(14, 4, 0, -6, -5), FLAIL_A, ANGRY),
    key(0.6, atFoe(KICK), twist(-10), bend(16, 4, 0, -6, 5), FLAIL_B, ANGRY),
    key(0.68, atFoe(KICK), twist(9), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.4, 0.91], [-0.05, -0.75, 0.66]), bend(16, 6, 0, -6, -5), FLAIL_A, jaw(18), ANGRY),
    key(0.77, atFoe(KICK), twist(-9), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.34, 0.94], [-0.05, -0.78, 0.63]), bend(16, 6, 0, -6, 5), FLAIL_B, jaw(14), ANGRY),
    key(0.86, atFoe(KICK), twist(8), FEET, bend(14, 4, 0, -6, -4), FLAIL_A, jaw(10), ANGRY),
    // Backs off, panting.
    key(1.0, atFoe(KICK), FEET, pelvis(0, -0.055), bend(16, 6, 2, 4), LIMP, jaw(12), HURT),
    key(1.12, atFoe(KICK), FEET, pelvis(0, -0.05), bend(13, 5, 2, 2), GUARD, jaw(4), ANGRY),
    ...hopHome(1.24, GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/** Struggle: worn out, it sways, stumbles in with a weak hop and flops into the foe in a clumsy lunge; the recoil makes it wince, and it hobbles home. */
export const struggle: Clip = {
  name: 'struggle',
  duration: 1.65,
  keys: [
    key(0),
    key(0.16, FEET, pelvis(0, -0.04), root({ roll: 4 }), bend(14, 6, 4, 10, 0, 6), LIMP, DROWSY),
    key(0.34, leap(0.55, 0.04), bend(16, 6, 2, 6), LIMP, DROWSY),
    key(0.46, ARRIVE_FEET, root({ roll: -5 }), bend(18, 6, 2, 6, 0, -5), LIMP, DROWSY),
    // A stumbling hop forward...
    key(0.53, atFoe(BODY * 0.5), root({ y: 0.04, pitch: 5, roll: 2 }), HOP, bend(20, 6, 2, 0), arms(A([-0.3, -0.35, 0.89], [-0.1, -0.4, 0.91]), A([0.4, -0.5, 0.77], [0.2, -0.6, 0.77])), DROWSY),
    // ...and it flops into the foe, arms flung forward.
    snap(0.59, atFoe(BODY - 0.1), root({ pitch: 10, roll: 4 }), FEET, pelvis(0, -0.065, 0.02), bend(24, 8, 4, -4), arms(A([-0.3, -0.2, 0.93], [-0.1, -0.3, 0.95]), A([0.4, -0.45, 0.8], [0.2, -0.55, 0.81])), ANGRY),
    key(0.69, atFoe(BODY - 0.1), root({ pitch: 11, roll: 4 }), FEET, pelvis(0, -0.067, 0.021), bend(25, 8, 4, -4), arms(A([-0.3, -0.26, 0.92], [-0.1, -0.36, 0.93]), A([0.4, -0.5, 0.77], [0.2, -0.6, 0.77])), ANGRY),
    // The recoil: a wince, staggering back.
    key(0.86, at(0.9), lunge(0.2), root({ y: 0.04 }), HOP, bend(-6, -4, -2, -10, 0, 6), both(A([-0.8, -0.25, 0.55], [-0.4, 0.3, 0.87], [-0.3, 0.5, 0.81])), HURT),
    fall(1.02, at(0.86), lunge(0.2), LAND, root({ roll: -4 }), pelvis(0, -0.015), bend(16, 6, 4, 8, 0, -6), LIMP, HURT),
    key(1.16, at(0.86), lunge(0.2), FEET, root({ roll: 2 }), pelvis(0, -0.055), bend(16, 6, 4, 8, 0, 4), LIMP, DROWSY),
    snap(1.3, at(0.42), root({ y: 0.05 }), HOP, bend(10, 4, 2, 4), LIMP, DROWSY),
    fall(1.43, at(0), SKIP, pelvis(0, -0.02), bend(6, 2, 0, 2), LIMP, DROWSY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

/**
 * Seismic Toss: it skips in and seizes the foe (grab), sinks with it, then
 * springs up and back toward mid-field heaving it up in front and spinning
 * round with it in the air, and slams it down (impact: the foe drops there,
 * lies a moment and hops back). It lands deep, watches, and hops home.
 */
export const seismic_toss: Clip = {
  name: 'seismic_toss',
  duration: 2.45,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.045), bend(18, 4, 0, -12), ELBOWS_BACK, ANGRY),
    ...skipIn(0.2, bend(20, 4, 0, -12), REACH, ANGRY),
    key(0.48, ARRIVE_FEET, bend(16, 4, 0, -10), REACH, ANGRY),
    // A hop in and it seizes it: the hands on the foe, then locked on low.
    key(0.54, atFoe(CLAW * 0.6), root({ y: 0.04 }), TUCK, bend(18, 4, 0, -10), REACH, ANGRY),
    fall(0.6, atFoe(CLAW), LAND_DEEP, bend(22, 6, 0, -12), GRIP, ANGRY),
    // Loads: sinks deeper with it.
    key(0.74, atFoe(CLAW), LAND_DEEP, pelvis(0, -0.02), bend(18, 6, 0, -14), GRIP, ANGRY),
    // Springs up and back, heaving it up in front, spinning round.
    snap(0.9, at(0.88), lunge(0.2), root({ y: 0.22, yaw: 60 }), HOP, pelvis(0, 0.02), bend(-10, -8, -4, -16), HEAVE, crest(-14), ANGRY),
    key(1.06, at(0.72), root({ y: 0.3, yaw: 220 }), HOP, pelvis(0, 0.02), bend(-12, -8, -4, -18), HEAVE, ANGRY),
    key(1.18, at(0.62), root({ y: 0.3, yaw: 360 }), HOP, pelvis(0, 0.02), bend(-18, -10, -6, -20), HEAVE, ANGRY),
    // The slam.
    snap(1.28, at(0.6), root({ y: 0.1, yaw: 360 }), HOP, pelvis(0, -0.01), bend(32, 16, 4, 4), SLAM_DOWN, ANGRY),
    fall(1.4, at(0.58), root({ yaw: 360 }), LAND_DEEP, bend(24, 10, 2, 2), SLAM_DOWN, ANGRY),
    key(1.6, at(0.58), root({ yaw: 360 }), FEET, pelvis(0, -0.075), bend(20, 8, 2, -2), SLAM_DOWN, ANGRY),
    key(1.78, at(0.58), root({ yaw: 360 }), FEET, pelvis(0, -0.04), bend(8, 2, 0, 0), GUARD, ANGRY),
    snap(1.94, at(0.28), root({ y: 0.07, yaw: 360 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(2.07, at(0), root({ yaw: 360 }), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(2.45, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'grab' }, { t: 1.34, name: 'impact' }],
};

/** Dig, the first turn: it crouches and drives its claws into the ground (dig), digs frantically, talons churning, and sinks out of sight. */
export const dig_charge: Clip = {
  name: 'dig_charge',
  duration: 1.0,
  keys: [
    key(0),
    key(0.12, FEET, pelvis(0, -0.055), bend(26, 6, 0, 18), CHAMBER, ANGRY),
    key(0.22, FEET, root({ y: -0.1 }), pelvis(0, -0.085), bend(40, 8, 2, 24), DIG_ARMS, ANGRY),
    key(0.34, root({ y: -0.36 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(40, 8, 2, 24), arms(A([-0.22, -0.7, 0.68], [0.05, -0.8, 0.6]), A([0.22, -0.9, 0.38], [-0.05, -0.99, 0.1])), ANGRY),
    key(0.46, root({ y: -0.7 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(40, 8, 2, 24), arms(A([-0.22, -0.9, 0.38], [0.05, -0.99, 0.1]), A([0.22, -0.7, 0.68], [-0.05, -0.8, 0.6])), ANGRY),
    fall(0.62, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(38, 8, 2, 22), DIG_ARMS, ANGRY),
    key(0.82, root({ y: -1.32 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(36, 8, 2, 20), DIG_ARMS, ANGRY),
    key(1.0, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(34, 8, 2, 18), DIG_ARMS, ANGRY),
  ],
  events: [{ t: 0.21, name: 'dig' }],
};

/** Dig, the second turn: from underground it tunnels to the foe and bursts up right beside it with a rising knee and a clawed uppercut into it, comes down, and hops home. */
export const dig: Clip = {
  name: 'dig',
  duration: 1.65,
  keys: [
    key(0, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(34, 8, 2, 18), DIG_ARMS, ANGRY),
    key(0.2, at(0.5), root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.085), bend(32, 8, 2, 12), DIG_ARMS, ANGRY),
    key(0.36, atFoe(KICK - 0.05), root({ y: -1.25 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.095), bend(24, 6, 0, -10), CHAMBER, ANGRY),
    // Bursts up into it: a rising knee and an uppercut.
    snap(0.48, atFoe(KICK), root({ y: 0.26 }), RISING_KNEE, pelvis(0, 0.02), bend(-8, -6, -4, -16), arms(A([-0.15, 0.9, 0.4], [-0.08, 0.98, 0.18], [-0.05, 0.99, 0]), mirrorArm(A([-0.35, -0.5, -0.8], [-0.25, -0.3, -0.92]))), crest(-16), ANGRY),
    key(0.58, atFoe(KICK - 0.02), root({ y: 0.34 }), RISING_KNEE, pelvis(0, 0.02), bend(-10, -6, -4, -18), arms(A([-0.12, 0.94, 0.32], [-0.06, 0.99, 0.1], [-0.04, 0.99, -0.1]), mirrorArm(A([-0.35, -0.5, -0.8], [-0.25, -0.3, -0.92]))), ANGRY),
    fall(0.76, atFoe(0), LAND_DEEP, bend(6, 4, 0, -2), GUARD, ANGRY),
    key(1.04, atFoe(0), FEET, pelvis(0, -0.04), bend(8, 2, 0, 0), GUARD, ANGRY),
    snap(1.2, at(0.4), root({ y: 0.07 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(1.33, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'impact' }],
};

export const BODY_CLIPS: Clip[] = [peck, quick_attack, double_edge, strength, body_slam, return_, frustration, facade, secret_power, reversal, struggle, seismic_toss, dig_charge, dig];
