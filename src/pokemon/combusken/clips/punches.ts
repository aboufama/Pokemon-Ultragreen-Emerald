// Combusken's "fists": it has none (one big clawed hand each), so it punches
// with the hand drawn into a spear, claws together and leading, the forearm
// behind it. Each skips in, comes down on its left foot beside the foe's
// front turned to it, and springs in again with the blow (kit: skipTo,
// CLAW), driving the hand into the foe with the hips and shoulders turning
// behind it; the hand trails the hips by 0.08 s.

import type { Clip } from '../../../anim/clip';
import type { Arm } from './kit';
import {
  ANGRY, ARRIVE, CHAMBER_ARM, CLAW, GUARD, GUARD_L, GUARD_R, HURT, LAND, OPEN_EYES, RISING, SHUT, X_GUARD,
  armL, armR, atFoe, bend, crest, fall, hopHome, jaw, key, leap, mirrorArm, pelvis, root, skipIn, skipTo, snap, twist,
} from './kit';

const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];
/** The right hand driven straight into the foe's middle, claws first. */
const STRAIGHT_R = armR(A([-0.05, -0.12, 0.99], [0, -0.06, 1]));
/** The left hand pulled back to the hip. */
const HIP_L = armL(mirrorArm(CHAMBER_ARM));
/** How much further in a thrust reaches than a rake. */
const THRUST = CLAW + 0.04;

/** Mega Punch: a haymaker. The hand wound far back by the ear, a skip in, and a huge straight thrust into the foe as the hips and shoulders rotate. */
export const mega_punch: Clip = {
  name: 'mega_punch',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.04), twist(-30, 4), bend(12, 2, 0, -10, 12), GUARD_L, armR(A([-0.62, 0.12, -0.78], [-0.12, 0.62, 0.78], [0, 0.6, 0.8])), crest(-6), ANGRY),
    ...skipIn(0.24, twist(-32, 4), bend(8, 2, 0, -10, 12), GUARD_L, armR(A([-0.6, 0.16, -0.78], [-0.1, 0.66, 0.74], [0, 0.64, 0.77])), ANGRY),
    key(0.52, ARRIVE, twist(-34, 4), bend(14, 2, 0, -10, 14), GUARD_L, armR(A([-0.62, 0.12, -0.78], [-0.12, 0.62, 0.78], [0, 0.6, 0.8])), ANGRY),
    key(0.58, skipTo(THRUST * 0.5), twist(-35, 4), bend(12, 2, 0, -10, 14), GUARD_L, armR(A([-0.63, 0.12, -0.77], [-0.12, 0.62, 0.78], [0, 0.6, 0.8])), ANGRY),
    // The punch: hips and shoulders rotate, the hand drives straight in.
    snap(0.64, atFoe(THRUST), pelvis(0.01, -0.055, 0.02), twist(24, -4), bend(16, 6, 0, -6, -8), HIP_L, STRAIGHT_R, jaw(14), ANGRY),
    key(0.74, atFoe(THRUST), pelvis(0.011, -0.057, 0.022), twist(26, -4), bend(17, 6, 0, -6, -9), HIP_L, armR(A([-0.05, -0.16, 0.99], [0, -0.1, 0.99])), jaw(10), ANGRY),
    // Follow-through: leaning over the standing foot.
    key(0.88, atFoe(THRUST), pelvis(0.008, -0.055, 0.015), twist(22, -3), bend(20, 8, 0, -4, -8), HIP_L, armR(A([-0.06, -0.3, 0.95], [0.02, -0.28, 0.96])), ANGRY),
    key(1.02, atFoe(THRUST), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.14, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/** Fire Punch: a hook. The hand chambered wide at the shoulder swings in from the side into the foe's jaw, fire bursting on it. */
export const fire_punch: Clip = {
  name: 'fire_punch',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.035), twist(-22, 3), bend(10, 2, 0, -8, 10), GUARD_L, armR(A([-0.9, -0.08, -0.43], [-0.25, 0.12, 0.96], [0, 0.15, 0.99])), ANGRY),
    ...skipIn(0.22, twist(-24, 3), bend(6, 2, 0, -8, 10), GUARD_L, armR(A([-0.9, -0.06, -0.43], [-0.25, 0.14, 0.96], [0, 0.17, 0.99])), ANGRY),
    key(0.5, ARRIVE, twist(-26, 3), bend(12, 2, 0, -8, 12), GUARD_L, armR(A([-0.92, -0.08, -0.38], [-0.28, 0.12, 0.95], [-0.02, 0.15, 0.99])), ANGRY),
    key(0.56, skipTo(THRUST * 0.5), twist(-27, 3), bend(10, 2, 0, -8, 12), GUARD_L, armR(A([-0.92, -0.06, -0.38], [-0.28, 0.14, 0.95], [-0.02, 0.17, 0.99])), ANGRY),
    // The hook: the hand arcs in from the side, the forearm across.
    snap(0.62, atFoe(THRUST), pelvis(0.01, -0.05, 0.015), twist(28, -5), bend(14, 4, 0, -6, -10), GUARD_L, armR(A([-0.34, 0.06, 0.94], [0.76, 0.12, 0.64], [0.9, 0.12, 0.42])), jaw(10), ANGRY),
    key(0.72, atFoe(THRUST), pelvis(0.011, -0.051, 0.016), twist(31, -5), bend(15, 4, 0, -6, -11), GUARD_L, armR(A([-0.22, 0.04, 0.97], [0.82, 0.08, 0.57], [0.93, 0.08, 0.36])), jaw(8), ANGRY),
    // Carried through across its body.
    key(0.85, atFoe(THRUST), pelvis(0.01, -0.047), twist(36, -5), bend(16, 4, 0, -6, -12), GUARD_L, armR(A([0.12, -0.05, 0.99], [0.9, -0.05, 0.43], [0.96, -0.05, 0.2])), ANGRY),
    key(0.99, atFoe(THRUST), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.11, GUARD, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.73, name: 'impact' }],
};

/** Thunder Punch: an overhand. The hand cocked up high behind the head, brought down over the top into the foe. */
export const thunder_punch: Clip = {
  name: 'thunder_punch',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), twist(-18, 6), bend(-6, -4, 0, -12, 10), GUARD_L, armR(A([-0.5, 0.82, -0.28], [0, 0.42, -0.91], [0.1, 0.1, -0.99])), crest(-6), ANGRY),
    ...skipIn(0.22, twist(-18, 6), bend(-4, -4, 0, -12, 10), GUARD_L, armR(A([-0.48, 0.84, -0.26], [0, 0.38, -0.92], [0.1, 0.06, -0.99])), ANGRY),
    key(0.5, ARRIVE, twist(-20, 6), bend(0, -2, 0, -12, 12), GUARD_L, armR(A([-0.5, 0.82, -0.28], [0, 0.42, -0.91], [0.1, 0.1, -0.99])), ANGRY),
    key(0.56, skipTo(THRUST * 0.5), twist(-21, 6), bend(-2, -2, 0, -12, 12), GUARD_L, armR(A([-0.5, 0.83, -0.26], [0, 0.44, -0.9], [0.1, 0.12, -0.99])), ANGRY),
    // Over the top and down into it.
    snap(0.62, atFoe(THRUST), pelvis(0.006, -0.065, 0.015), twist(14, -8), bend(24, 8, 2, -2, -6), HIP_L, armR(A([-0.14, -0.06, 0.99], [0.05, -0.52, 0.85], [0.08, -0.62, 0.78])), jaw(12), ANGRY),
    key(0.72, atFoe(THRUST), pelvis(0.006, -0.068, 0.016), twist(15, -8), bend(26, 8, 2, -2, -6), HIP_L, armR(A([-0.12, -0.2, 0.97], [0.05, -0.66, 0.75], [0.08, -0.75, 0.66])), jaw(8), ANGRY),
    key(0.86, atFoe(THRUST), pelvis(0.004, -0.065), twist(12, -6), bend(28, 8, 2, 0, -5), HIP_L, armR(A([-0.1, -0.52, 0.85], [0.05, -0.86, 0.5], [0.06, -0.92, 0.38])), ANGRY),
    key(1.0, atFoe(THRUST), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.12, GUARD, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.73, name: 'impact' }],
};

const COIL_L = armL(A([0.2, -0.1, 0.97], [0.1, 0.06, 0.99]));
const COIL_R = armR(A([-0.45, -0.45, -0.77], [-0.25, -0.3, 0.92], [-0.1, -0.2, 0.97]));

/** Dynamic Punch: a slow, huge wind-up, the whole body coiled with the hand back at the hip, a skip in and an explosive full-body thrust; a beat of stillness after. */
export const dynamic_punch: Clip = {
  name: 'dynamic_punch',
  duration: 2.15,
  keys: [
    key(0),
    // Coiling, slowly: deep crouch on the standing leg, twisted away, the hand far back, the other aiming.
    key(0.34, pelvis(0, -0.075), twist(-40, 6), bend(18, 4, 0, -12, 16), COIL_L, COIL_R, crest(-10), ANGRY),
    key(0.52, pelvis(0, -0.085), twist(-44, 7), bend(20, 4, 0, -12, 17), armL(A([0.2, -0.12, 0.97], [0.1, 0.04, 0.99])), armR(A([-0.46, -0.44, -0.77], [-0.26, -0.3, 0.92], [-0.1, -0.2, 0.97])), crest(-12), ANGRY),
    ...skipIn(0.6, twist(-44, 7), bend(12, 4, 0, -12, 16), COIL_L, COIL_R, ANGRY),
    key(0.88, ARRIVE, twist(-46, 7), bend(18, 4, 0, -12, 17), armL(A([0.2, -0.12, 0.97], [0.1, 0.04, 0.99])), armR(A([-0.46, -0.44, -0.77], [-0.26, -0.3, 0.92], [-0.1, -0.2, 0.97])), ANGRY),
    key(0.94, skipTo(THRUST * 0.5, 0.06), twist(-46, 7), bend(14, 4, 0, -12, 17), COIL_L, COIL_R, ANGRY),
    // The explosion: everything behind the hand.
    snap(1.0, atFoe(THRUST + 0.04), pelvis(0.012, -0.055, 0.03), twist(30, -6), bend(16, 8, 0, -6, -10), HIP_L, armR(A([-0.02, -0.06, 1], [0, 0, 1])), jaw(24), ANGRY),
    key(1.1, atFoe(THRUST + 0.04), pelvis(0.013, -0.057, 0.031), twist(31, -6), bend(17, 8, 0, -6, -10), HIP_L, armR(A([-0.02, -0.1, 0.99], [0, -0.04, 1])), jaw(20), ANGRY),
    // The beat of stillness: locked in the follow-through, barely drifting.
    key(1.28, atFoe(THRUST + 0.04), pelvis(0.013, -0.059, 0.03), twist(32, -6), bend(18, 8, 0, -5, -10), HIP_L, armR(A([-0.03, -0.12, 0.99], [0, -0.07, 1])), jaw(6), ANGRY),
    key(1.48, atFoe(THRUST + 0.04), pelvis(0.012, -0.06, 0.028), twist(31, -5), bend(19, 8, 0, -5, -9), HIP_L, armR(A([-0.04, -0.16, 0.99], [0, -0.12, 0.99])), ANGRY),
    key(1.64, atFoe(THRUST + 0.04), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.76, GUARD, ANGRY),
    key(2.15, OPEN_EYES),
  ],
  events: [{ t: 1.12, name: 'impact' }],
};

/** Focus Punch: from a still, focused stance (eyes shut, the hand drawn to the hip), the eyes snap open, a low fast bound and an exploding thrust with a shout. */
export const focus_punch: Clip = {
  name: 'focus_punch',
  duration: 1.8,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.035, -0.01), twist(-18), bend(6, 0, 0, -4, 8), armL(A([0.3, -0.2, 0.93], [0.12, 0.08, 0.99], [0.1, 0.3, 0.95])), armR(CHAMBER_ARM), SHUT),
    key(0.4, pelvis(0, -0.04, -0.012), twist(-20), bend(7, 0, 0, -4, 8), armL(A([0.3, -0.22, 0.93], [0.12, 0.06, 0.99], [0.1, 0.28, 0.95])), armR(A([-0.45, -0.71, -0.54], [-0.12, -0.26, 0.96], [-0.02, -0.13, 0.99])), SHUT),
    // The eyes snap open: one low, fast bound (no skip).
    key(0.52, leap(0.62, 0.05), twist(-22), bend(12, 0, 0, -6, 8), armL(A([0.3, -0.2, 0.93], [0.12, 0.08, 0.99], [0.1, 0.3, 0.95])), armR(CHAMBER_ARM), ANGRY),
    key(0.62, ARRIVE, twist(-24), bend(14, 0, 0, -6, 10), armL(A([0.3, -0.22, 0.93], [0.12, 0.06, 0.99], [0.1, 0.28, 0.95])), armR(CHAMBER_ARM), ANGRY),
    key(0.68, skipTo(THRUST * 0.5, 0.04), twist(-25), bend(12, 0, 0, -6, 10), armL(A([0.3, -0.22, 0.93], [0.12, 0.06, 0.99], [0.1, 0.28, 0.95])), armR(CHAMBER_ARM), ANGRY),
    // The thrust explodes out.
    snap(0.74, atFoe(THRUST + 0.02), pelvis(0.012, -0.055, 0.03), twist(26, -4), bend(14, 6, 0, -6, -8), HIP_L, STRAIGHT_R, jaw(28), ANGRY),
    key(0.84, atFoe(THRUST + 0.02), pelvis(0.013, -0.057, 0.031), twist(27, -4), bend(15, 6, 0, -6, -8), HIP_L, armR(A([-0.04, -0.16, 0.99], [0, -0.1, 0.99])), jaw(22), ANGRY),
    key(1.0, atFoe(THRUST + 0.02), pelvis(0.01, -0.055, 0.025), twist(25, -3), bend(16, 6, 0, -5, -8), HIP_L, armR(A([-0.05, -0.2, 0.98], [0, -0.16, 0.99])), jaw(6), ANGRY),
    key(1.14, atFoe(THRUST + 0.02), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.26, GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.86, name: 'impact' }],
};

/**
 * Sky Uppercut: a dash in low, crouched under the foe with the hand at the
 * hip, then an uppercut rising up through it, the whole body extending and
 * the feet leaving the ground, the claws high at the top; it drops back into
 * a crouch and hops home.
 */
export const sky_uppercut: Clip = {
  name: 'sky_uppercut',
  duration: 1.65,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.07), bend(22, 6, -6, -14), GUARD_L, armR(A([-0.45, -0.75, -0.48], [-0.15, -0.35, 0.92], [-0.1, -0.2, 0.97])), crest(-8), ANGRY),
    // A low dash (its legs flat out).
    key(0.3, leap(0.72, 0.04), bend(24, 6, -6, -14), GUARD_L, armR(A([-0.45, -0.75, -0.48], [-0.15, -0.35, 0.92], [-0.1, -0.2, 0.97])), ANGRY),
    key(0.42, ARRIVE, pelvis(0, -0.035), bend(24, 8, -6, -16), GUARD_L, armR(A([-0.5, -0.8, -0.33], [-0.15, -0.2, 0.97], [-0.08, -0.1, 0.99])), ANGRY),
    // The uppercut: everything drives up and in through the foe's chin, the feet leave the ground.
    snap(0.5, atFoe(THRUST + 0.1), root({ y: 0.06 }), RISING, pelvis(0, 0.01), bend(0, -2, -6, -16), HIP_L, armR(A([-0.12, 0.5, 0.86], [-0.06, 0.78, 0.62], [-0.04, 0.85, 0.52])), crest(-14), ANGRY),
    key(0.58, atFoe(THRUST + 0.1), root({ y: 0.12 }), RISING, pelvis(0, 0.02), bend(-8, -5, -6, -18), HIP_L, armR(A([-0.12, 0.72, 0.68], [-0.06, 0.9, 0.43], [-0.04, 0.95, 0.3])), crest(-14), ANGRY),
    // Apex: stretched tall, the claws high over the foe.
    key(0.72, atFoe(THRUST + 0.04), root({ y: 0.2 }), RISING, pelvis(0, 0.02), bend(-16, -9, -6, -22), HIP_L, armR(A([-0.1, 0.97, 0.2], [-0.05, 0.99, 0.05], [-0.03, 0.99, -0.12])), crest(-12), ANGRY),
    // Drops back into a crouch.
    fall(0.9, atFoe(THRUST), LAND, pelvis(0, -0.03), bend(18, 4, 0, -8), GUARD, ANGRY),
    key(1.05, atFoe(THRUST), LAND, pelvis(0, 0.02), bend(10, 2, 0, -4), GUARD, ANGRY),
    ...hopHome(1.18, GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

/** Counter: braced behind crossed arms as the blow lands, a wince, then it springs at the foe and strikes back hard with a thrust of the left hand. */
export const counter: Clip = {
  name: 'counter',
  duration: 1.55,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03, -0.015), root({ z: -0.03 }), bend(-8, -4, 0, -10), X_GUARD, HURT),
    key(0.24, pelvis(0, -0.055, -0.01), root({ z: -0.03 }), twist(18), bend(12, 2, 0, -8, -8), GUARD_R, armL(A([0.45, -0.62, -0.64], [0.18, -0.2, 0.96], [0.05, -0.1, 0.99])), ANGRY),
    // Springs back at it (one bound).
    key(0.36, leap(0.64, 0.07), twist(20), bend(8, 2, 0, -8, -8), GUARD_R, armL(A([0.45, -0.62, -0.64], [0.18, -0.2, 0.96], [0.05, -0.1, 0.99])), ANGRY),
    key(0.46, ARRIVE, twist(22), bend(14, 2, 0, -8, -10), GUARD_R, armL(A([0.46, -0.64, -0.62], [0.18, -0.22, 0.96], [0.05, -0.12, 0.99])), ANGRY),
    key(0.52, skipTo(THRUST * 0.5), twist(23), bend(12, 2, 0, -8, -10), GUARD_R, armL(A([0.46, -0.64, -0.62], [0.18, -0.22, 0.96], [0.05, -0.12, 0.99])), ANGRY),
    // The retaliation: the left hand driven in, the left shoulder leading.
    snap(0.58, atFoe(THRUST), pelvis(-0.01, -0.055, 0.02), twist(-24, 4), bend(16, 6, 0, -6, 8), GUARD_R, armL(A([0.05, -0.14, 0.99], [0, -0.08, 1])), jaw(18), ANGRY),
    key(0.68, atFoe(THRUST), pelvis(-0.011, -0.056, 0.021), twist(-26, 4), bend(17, 6, 0, -6, 9), GUARD_R, armL(A([0.05, -0.18, 0.98], [0, -0.12, 0.99])), jaw(12), ANGRY),
    key(0.82, atFoe(THRUST), pelvis(-0.008, -0.052), twist(-20, 3), bend(18, 6, 0, -5, 8), GUARD_R, armL(A([0.06, -0.3, 0.95], [0.02, -0.26, 0.96])), ANGRY),
    key(0.96, atFoe(THRUST), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.08, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'impact' }],
};

export const PUNCHES: Clip[] = [mega_punch, fire_punch, thunder_punch, dynamic_punch, focus_punch, sky_uppercut, counter];
