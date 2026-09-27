// Combusken's clawed hands: rakes, slashes, chops and slaps. Each skips in
// to the foe (a hop, a skip on the left foot, a hop in), comes down on its
// left foot beside the foe's front turned to it, springs in once more with
// the blow (kit: skipTo, CLAW) so the claws reach the foe's body, strikes
// (the hand trails the hips by 0.08 s: the impact comes that much after the
// snap, while the arm holds at full reach) and hops home. Its big hand is
// one bone with three claws: the claws lead every rake.

import type { Clip } from '../../../anim/clip';
import type { Arm } from './kit';
import {
  ANGRY, ARRIVE, CHAMBER_ARM, CLAW, GUARD, GUARD_L, HAPPY, HOP, LAND_DEEP, OPEN_EYES, SKIP, TUCK_HIGH,
  armR, arms, at, atFoe, bend, crest, fall, hopHome, jaw, key, leap, lunge, mirrorArm, pelvis, root, skipIn, skipTo, snap, twist,
} from './kit';

/** An arm whose hand carries straight on from the forearm. */
const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];

/** Scratch: the claw cocked beside the head, a quick raking swipe down and across the foe's face, carried through. */
export const scratch: Clip = {
  name: 'scratch',
  duration: 1.3,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), twist(-12), bend(10, 0, 0, -8, 10), GUARD_L, armR(A([-0.85, 0.25, -0.05], [-0.35, 0.6, 0.72], [-0.2, 0.55, 0.81])), crest(-4), ANGRY),
    ...skipIn(0.2, twist(-14), bend(6, 0, 0, -8, 12), GUARD_L, armR(A([-0.84, 0.28, -0.06], [-0.34, 0.62, 0.71], [-0.2, 0.58, 0.79])), ANGRY),
    key(0.48, ARRIVE, twist(-16), bend(12, 0, 0, -8, 12), GUARD_L, armR(A([-0.85, 0.25, -0.05], [-0.35, 0.6, 0.72], [-0.2, 0.55, 0.81])), ANGRY),
    // A skip in, the claw still cocked...
    key(0.53, skipTo(CLAW * 0.5), twist(-17), bend(10, 0, 0, -8, 12), GUARD_L, armR(A([-0.86, 0.26, -0.04], [-0.36, 0.62, 0.7], [-0.2, 0.56, 0.8])), ANGRY),
    // ...and the rake: down and across its face, the body turning into it.
    snap(0.58, atFoe(CLAW), pelvis(0.01, -0.04), twist(16, -4), bend(16, 4, 0, -6, -6), GUARD_L, armR(A([0.15, -0.2, 0.97], [0.55, -0.42, 0.72], [0.62, -0.5, 0.6])), ANGRY),
    key(0.68, atFoe(CLAW), pelvis(0.012, -0.041), twist(20, -5), bend(17, 4, 0, -6, -7), GUARD_L, armR(A([0.28, -0.34, 0.9], [0.6, -0.55, 0.58], [0.62, -0.66, 0.42])), ANGRY),
    // Carried through, low on the far side.
    key(0.8, atFoe(CLAW), pelvis(0.01, -0.036), twist(24, -6), bend(18, 4, 0, -6, -8), GUARD_L, armR(A([0.45, -0.58, 0.68], [0.6, -0.74, 0.3], [0.55, -0.83, 0.05])), ANGRY),
    key(0.93, atFoe(CLAW), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.05, GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'impact' }],
};

/**
 * Slash: the claw drawn far back behind the shoulder, the body twisted away,
 * then a big diagonal slash down through the foe as the whole torso unwinds;
 * the claws trail low on the far side.
 */
export const slash: Clip = {
  name: 'slash',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.035), twist(-26, 4), bend(12, 0, 0, -8, 14), GUARD_L, armR(A([-0.6, 0.4, -0.69], [-0.35, 0.52, -0.78], [-0.3, 0.62, -0.73])), crest(-6), ANGRY),
    ...skipIn(0.22, twist(-28, 4), bend(8, 0, 0, -8, 14), GUARD_L, armR(A([-0.6, 0.42, -0.68], [-0.33, 0.55, -0.77], [-0.28, 0.64, -0.72])), ANGRY),
    key(0.5, ARRIVE, twist(-30, 5), bend(14, 0, 0, -8, 15), GUARD_L, armR(A([-0.62, 0.38, -0.69], [-0.35, 0.5, -0.79], [-0.3, 0.6, -0.74])), ANGRY),
    key(0.56, skipTo(CLAW * 0.5), twist(-32, 5), bend(12, 0, 0, -8, 15), GUARD_L, armR(A([-0.62, 0.4, -0.68], [-0.35, 0.52, -0.78], [-0.3, 0.62, -0.73])), ANGRY),
    // The slash: the torso unwinds, the claws sweep down and across through the foe.
    snap(0.62, atFoe(CLAW), pelvis(0.012, -0.05), twist(26, -8), bend(20, 6, 0, -6, -10), arms(A([0.3, -0.34, 0.89], [0.62, -0.52, 0.59], [0.66, -0.62, 0.42]), mirrorArm(CHAMBER_ARM)), ANGRY),
    key(0.74, atFoe(CLAW), pelvis(0.013, -0.051), twist(30, -9), bend(21, 6, 0, -6, -11), arms(A([0.44, -0.5, 0.75], [0.62, -0.68, 0.39], [0.58, -0.78, 0.23]), mirrorArm(CHAMBER_ARM)), ANGRY),
    // The claws trail low on the far side and hang there.
    key(0.88, atFoe(CLAW), pelvis(0.012, -0.045), twist(34, -8), bend(22, 6, 0, -6, -12), arms(A([0.56, -0.72, 0.41], [0.5, -0.86, 0.1], [0.4, -0.91, -0.1]), mirrorArm(CHAMBER_ARM)), ANGRY),
    key(1.02, atFoe(CLAW), pelvis(0, -0.04), twist(10), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.14, GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/** Cut: the claws raised straight overhead edge-first, a single crisp vertical chop down through the foe. */
export const cut: Clip = {
  name: 'cut',
  duration: 1.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, 0.006), twist(-8), bend(-4, -4, 0, -10, 6), GUARD_L, armR(A([-0.2, 0.95, 0.22], [-0.05, 0.86, -0.5], [0, 0.7, -0.71])), ANGRY),
    ...skipIn(0.22, twist(-8), bend(-2, -4, 0, -10, 6), GUARD_L, armR(A([-0.18, 0.96, 0.2], [-0.04, 0.82, -0.57], [0, 0.66, -0.75])), ANGRY),
    key(0.5, ARRIVE, twist(-8), bend(4, -2, 0, -10, 6), GUARD_L, armR(A([-0.2, 0.95, 0.22], [-0.05, 0.84, -0.54], [0, 0.68, -0.73])), ANGRY),
    key(0.56, skipTo(CLAW * 0.5), twist(-8), bend(0, -2, 0, -10, 6), GUARD_L, armR(A([-0.2, 0.96, 0.2], [-0.05, 0.86, -0.51], [0, 0.7, -0.71])), ANGRY),
    // The chop: straight down through the foe, the body dipping behind it.
    snap(0.62, atFoe(CLAW), pelvis(0, -0.06), twist(4), bend(20, 6, 2, 0), GUARD_L, armR(A([-0.1, -0.26, 0.96], [-0.04, -0.7, 0.71], [0, -0.85, 0.52])), ANGRY),
    key(0.72, atFoe(CLAW), pelvis(0, -0.063), twist(4), bend(21, 6, 2, 0), GUARD_L, armR(A([-0.08, -0.43, 0.9], [-0.02, -0.85, 0.52], [0, -0.95, 0.3])), ANGRY),
    key(0.84, atFoe(CLAW), pelvis(0, -0.055), bend(18, 4, 2, -2), GUARD_L, armR(A([-0.1, -0.7, 0.71], [0, -0.97, 0.25], [0, -0.99, 0.1])), ANGRY),
    key(0.98, atFoe(CLAW), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.1, GUARD, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.73, name: 'impact' }],
};

const WIDE: Arm = A([-0.88, 0.25, 0.1], [-0.35, 0.75, 0.56], [-0.2, 0.7, 0.68]);

/** Fury Cutter: both claws cocked wide at the shoulders, then a quick crossing X, right then left, down across the foe. */
export const fury_cutter: Clip = {
  name: 'fury_cutter',
  duration: 1.5,
  keys: [
    key(0),
    key(0.13, pelvis(0, -0.03), bend(10, 0, 0, -8), arms(WIDE, mirrorArm(WIDE)), crest(-6), ANGRY),
    ...skipIn(0.2, bend(6, 0, 0, -8), arms(A([-0.86, 0.28, 0.08], [-0.33, 0.78, 0.53], [-0.2, 0.72, 0.66]), mirrorArm(A([-0.86, 0.28, 0.08], [-0.33, 0.78, 0.53], [-0.2, 0.72, 0.66]))), ANGRY),
    key(0.48, ARRIVE, bend(12, 0, 0, -8), arms(WIDE, mirrorArm(WIDE)), ANGRY),
    key(0.53, skipTo(CLAW * 0.5), bend(10, 0, 0, -8), arms(WIDE, mirrorArm(WIDE)), ANGRY),
    // The right claw slashes down across to its left...
    snap(0.58, atFoe(CLAW + 0.03), pelvis(0.008, -0.045), twist(14, -3), bend(16, 4, 0, -6, -5), arms(A([0.28, -0.34, 0.9], [0.56, -0.56, 0.61], [0.6, -0.66, 0.45]), mirrorArm(WIDE)), ANGRY),
    // ...and the left claw back across it: an X.
    snap(0.68, atFoe(CLAW + 0.03), pelvis(-0.008, -0.05), twist(-14, 3), bend(18, 4, 0, -6, 5), arms(A([0.3, -0.44, 0.85], [0.56, -0.62, 0.55], [0.58, -0.72, 0.38]), mirrorArm(A([0.28, -0.36, 0.89], [0.56, -0.58, 0.59], [0.6, -0.68, 0.42]))), ANGRY),
    key(0.78, atFoe(CLAW + 0.03), pelvis(-0.008, -0.051), twist(-16, 3), bend(19, 4, 0, -6, 6), arms(A([0.3, -0.48, 0.82], [0.54, -0.66, 0.52], [0.55, -0.75, 0.37]), mirrorArm(A([0.3, -0.46, 0.83], [0.56, -0.64, 0.52], [0.58, -0.73, 0.36]))), ANGRY),
    key(0.92, atFoe(CLAW + 0.03), pelvis(0, -0.045), bend(16, 4, 0, -4), arms(A([0.2, -0.66, 0.72], [0.5, -0.8, 0.33], [0.45, -0.88, 0.15]), mirrorArm(A([0.2, -0.66, 0.72], [0.5, -0.8, 0.33], [0.45, -0.88, 0.15]))), ANGRY),
    key(1.04, atFoe(CLAW + 0.03), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.16, GUARD, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/** Brick Break: the hand chambered by the ear, then a karate chop straight down through the foe, the whole body dropping into it with a shout. */
export const brick_break: Clip = {
  name: 'brick_break',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(0, 0.008), twist(-12), bend(-6, -4, 0, -10, 8), arms(A([-0.72, 0.55, 0.15], [0.35, 0.72, -0.6], [0.4, 0.55, -0.73]), A([0.3, -0.22, 0.93], [0.1, 0.08, 0.99], [0.1, 0.2, 0.97])), ANGRY),
    ...skipIn(0.24, twist(-12), bend(-4, -4, 0, -10, 8), arms(A([-0.7, 0.57, 0.15], [0.33, 0.74, -0.58], [0.38, 0.58, -0.72]), A([0.3, -0.2, 0.94], [0.1, 0.1, 0.99], [0.1, 0.22, 0.97])), ANGRY),
    key(0.52, ARRIVE, twist(-14), bend(0, -2, 0, -10, 8), arms(A([-0.72, 0.55, 0.15], [0.35, 0.72, -0.6], [0.4, 0.55, -0.73]), A([0.3, -0.22, 0.93], [0.1, 0.08, 0.99], [0.1, 0.2, 0.97])), ANGRY),
    key(0.58, skipTo(CLAW * 0.5, 0.06), twist(-15), bend(-2, -2, 0, -10, 8), arms(A([-0.72, 0.57, 0.14], [0.35, 0.74, -0.58], [0.4, 0.57, -0.72]), A([0.3, -0.22, 0.93], [0.1, 0.08, 0.99], [0.1, 0.2, 0.97])), ANGRY),
    // The chop: the body drops into it, the guide hand pulls back to the hip.
    snap(0.64, atFoe(CLAW), pelvis(0, -0.11), twist(8), bend(24, 8, 2, 2), arms(A([-0.14, -0.4, 0.9], [0.05, -0.76, 0.65], [0.08, -0.85, 0.52]), mirrorArm(CHAMBER_ARM)), jaw(24), ANGRY),
    key(0.75, atFoe(CLAW), pelvis(0, -0.114), twist(8), bend(25, 8, 2, 2), arms(A([-0.12, -0.48, 0.87], [0.05, -0.82, 0.57], [0.08, -0.9, 0.43]), mirrorArm(CHAMBER_ARM)), jaw(20), ANGRY),
    key(0.9, atFoe(CLAW), pelvis(0, -0.1), twist(6), bend(22, 6, 2, 0), arms(A([-0.12, -0.6, 0.79], [0.05, -0.9, 0.43], [0.06, -0.95, 0.3]), mirrorArm(CHAMBER_ARM)), jaw(4), ANGRY),
    key(1.04, atFoe(CLAW), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.16, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

const OVERHEAD: Arm = A([-0.15, 0.93, 0.33], [0.22, 0.95, 0.2], [0.35, 0.9, 0.25]);
const HAMMER: Arm = A([-0.1, -0.3, 0.95], [0.25, -0.56, 0.79], [0.3, -0.65, 0.7]);

/** Rock Smash: both clawed hands clasped high overhead, a hammer blow smashed down onto the foe as onto a boulder; a rebound. */
export const rock_smash: Clip = {
  name: 'rock_smash',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.01), bend(-10, -6, 0, -12), arms(OVERHEAD, mirrorArm(OVERHEAD)), crest(-8), ANGRY),
    ...skipIn(0.24, bend(-8, -6, 0, -12), arms(A([-0.14, 0.94, 0.31], [0.22, 0.96, 0.16], [0.35, 0.92, 0.2]), mirrorArm(A([-0.14, 0.94, 0.31], [0.22, 0.96, 0.16], [0.35, 0.92, 0.2]))), ANGRY),
    key(0.52, ARRIVE, bend(-4, -6, 0, -12), arms(OVERHEAD, mirrorArm(OVERHEAD)), ANGRY),
    key(0.58, skipTo(CLAW * 0.5, 0.06), bend(-8, -6, 0, -13), arms(OVERHEAD, mirrorArm(OVERHEAD)), ANGRY),
    // The hammer blow: both hands smash down into the foe, the back bending into it.
    snap(0.64, atFoe(CLAW), pelvis(0, -0.07), bend(28, 10, 4, 4), arms(HAMMER, mirrorArm(HAMMER)), jaw(12), ANGRY),
    key(0.74, atFoe(CLAW), pelvis(0, -0.075), bend(29, 10, 4, 4), arms(A([-0.1, -0.36, 0.93], [0.25, -0.62, 0.74], [0.3, -0.7, 0.65]), mirrorArm(A([-0.1, -0.36, 0.93], [0.25, -0.62, 0.74], [0.3, -0.7, 0.65]))), jaw(8), ANGRY),
    // A rebound off the rock-hard blow.
    key(0.88, atFoe(CLAW), pelvis(0, -0.055), bend(18, 6, 2, 0), arms(A([-0.14, -0.1, 0.98], [0.2, -0.2, 0.96], [0.25, -0.1, 0.96]), mirrorArm(A([-0.14, -0.1, 0.98], [0.2, -0.2, 0.96], [0.25, -0.1, 0.96]))), ANGRY),
    key(1.02, atFoe(CLAW), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.14, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/**
 * Aerial Ace: a blur of speed. A quick crouch, one springing leap high at the
 * foe (no skipping), the claw slashing down onto it as it drops out of the
 * air, a deep landing past it on its far side, and a hop home.
 */
export const aerial_ace: Clip = {
  name: 'aerial_ace',
  duration: 1.3,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.06), twist(-12), bend(16, 2, 0, -10, 8), GUARD_L, armR(A([-0.5, -0.45, -0.74], [-0.2, -0.3, 0.93], [-0.1, -0.2, 0.97])), ANGRY),
    // Springing high at the foe, the claw drawn back.
    key(0.21, leap(0.62, 0.2), TUCK_HIGH, twist(-18), bend(6, 0, 0, -12, 12), GUARD_L, armR(A([-0.6, 0.45, -0.66], [-0.3, 0.7, -0.65], [-0.25, 0.75, -0.61])), crest(-10), ANGRY),
    key(0.3, at(0.96), lunge(0.4), root({ y: 0.17, pitch: 10 }), TUCK_HIGH, twist(-20), bend(10, 0, 0, -12, 12), GUARD_L, armR(A([-0.58, 0.5, -0.64], [-0.28, 0.74, -0.61], [-0.22, 0.8, -0.56])), ANGRY),
    // Dropping onto it, the claw slashing down through it.
    snap(0.36, atFoe(CLAW), root({ y: 0.12, pitch: 16 }), TUCK_HIGH, twist(20, -6), bend(20, 6, 0, -6, -8), GUARD_L, armR(A([0.26, -0.36, 0.9], [0.6, -0.56, 0.57], [0.62, -0.66, 0.42])), ANGRY),
    key(0.46, atFoe(CLAW + 0.04), root({ y: 0.06, pitch: 12 }), TUCK_HIGH, twist(24, -7), bend(21, 6, 0, -6, -9), GUARD_L, armR(A([0.4, -0.5, 0.77], [0.6, -0.72, 0.35], [0.55, -0.8, 0.22])), ANGRY),
    // Lands deep on its far side.
    fall(0.56, atFoe(CLAW + 0.06), root({ x: -0.58 }), LAND_DEEP, twist(26, -6), GUARD_L, armR(A([0.5, -0.7, 0.51], [0.5, -0.85, 0.16], [0.4, -0.92, 0])), ANGRY),
    key(0.74, atFoe(CLAW + 0.06), root({ x: -0.58 }), LAND_DEEP, pelvis(0, 0.03), bend(-4, 2, 0, 8), GUARD, ANGRY),
    snap(0.88, at(0.45), root({ x: -0.28, y: 0.08 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(1.02, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'impact' }],
};

/** Smelling Salt: the hand swung out wide at face height, a brisk open-handed slap across the foe's face, and a shake of the stinging hand. */
export const smelling_salt: Clip = {
  name: 'smelling_salt',
  duration: 1.25,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), twist(-16), bend(6, 0, 0, -6, 12), GUARD_L, armR(A([-0.88, 0.1, 0.46], [-0.5, 0.3, 0.81], [-0.3, 0.3, 0.9])), ANGRY),
    ...skipIn(0.2, twist(-16), bend(4, 0, 0, -6, 12), GUARD_L, armR(A([-0.88, 0.12, 0.45], [-0.5, 0.32, 0.8], [-0.3, 0.32, 0.9])), ANGRY),
    key(0.48, ARRIVE, twist(-18), bend(8, 0, 0, -6, 12), GUARD_L, armR(A([-0.9, 0.12, 0.42], [-0.52, 0.3, 0.8], [-0.32, 0.3, 0.9])), ANGRY),
    key(0.53, skipTo(CLAW * 0.5), twist(-19), bend(6, 0, 0, -6, 12), GUARD_L, armR(A([-0.9, 0.14, 0.41], [-0.52, 0.32, 0.79], [-0.32, 0.32, 0.89])), ANGRY),
    // The slap: the flat hand sweeps across the foe's face.
    snap(0.58, atFoe(CLAW), pelvis(0.008, -0.04), twist(18, -3), bend(10, 2, 0, -6, -8), GUARD_L, armR(A([0.1, 0.02, 0.99], [0.66, 0.08, 0.75], [0.85, 0.1, 0.52])), ANGRY),
    key(0.68, atFoe(CLAW), pelvis(0.009, -0.04), twist(20, -3), bend(10, 2, 0, -6, -9), GUARD_L, armR(A([0.16, 0, 0.99], [0.7, 0.06, 0.71], [0.88, 0.08, 0.47])), ANGRY),
    // A quick shake of the stinging hand.
    key(0.78, atFoe(CLAW), pelvis(0, -0.04), twist(4), bend(8, 2, 0, -4), GUARD_L, armR(A([-0.4, -0.2, 0.89], [-0.3, 0.55, 0.78], [-0.5, 0.6, 0.62])), HAPPY),
    key(0.86, atFoe(CLAW), pelvis(0, -0.04), twist(2), bend(8, 2, 0, -4), GUARD_L, armR(A([-0.36, -0.26, 0.9], [-0.2, 0.3, 0.93], [0, 0.45, 0.89])), HAPPY),
    key(0.96, atFoe(CLAW), pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.04, GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'impact' }],
};

export const STRIKES: Clip[] = [scratch, slash, cut, fury_cutter, brick_break, rock_smash, aerial_ace, smelling_salt];
