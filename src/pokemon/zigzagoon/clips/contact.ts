// Zigzagoon's contact moves: every one goes to the foe in its zigzag bounds,
// lands its blow on the foe's body and scampers home. At advance 1 its nose
// stops 0.15 of its height short of the foe's; each blow closes that with the
// body: a pounce (root.z, the hind legs kicking off the ground), a head
// driven in, a paw raked across the foe's face from a rear-up.
//
// Families: the rams and tackles (Tackle, Headbutt, Secret Power, Facade,
// Frustration, Return, Double-Edge, Pursuit, Struggle, Flail, Body Slam),
// the paws (Cut, Rock Smash, Fury Cutter, Covet, Thief), the tail (Iron
// Tail), rolling (Rollout) and burrowing (Dig).

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  AIR, ANGRY, DROWSY, FIERCE, FRONT_DOWN, HAPPY, HIND_KICK, HIND_TUCK, HURT, LANDED, OPEN_EYES, PAWS_DIG, PAWS_FORWARD, PAWS_HUG,
  PAWS_TUCK, PAWS_UP, SHUT, STRETCH, SWIPE_COCKED, SWIPE_COCKED_L, SWIPE_DOWN, SWIPE_DOWN_L,
  at, bend, body, ears, fall, frontLegs, jaw, key, pelvis, rump, scale, snap, tail, turn, zigzagHome, zigzagIn,
} from './kit';

/** Launched at the foe: hind legs kicked out behind, off the ground. */
const LAUNCH: Pose[] = [HIND_KICK];

// Rams and tackles --------------------------------------------------------------

/**
 * Tackle: a quick coil, the zigzag in, and at the foe a shoulder-first body
 * charge: the front half turned so the left shoulder leads, head tucked,
 * the hind legs driving it off the ground into the foe; it bounces back off,
 * shakes its head and scampers home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.45,
  keys: [
    key(0),
    key(0.12, pelvis(-0.04, -0.03), bend(4, 4, 8), rump(8), tail(10), ears(-20), ANGRY),
    ...zigzagIn(0.12, 0.5, [ANGRY]),
    key(0.5, at(1), ...LANDED, pelvis(-0.045, -0.03), turn(10, 6), bend(4, 6, 12), rump(6), ears(-28), FIERCE),
    snap(0.57, at(1), body(0, 0.03, 0.26), ...LAUNCH, PAWS_FORWARD, turn(-16, -10), bend(2, 8, 18), rump(-4), tail(-12), ears(-36), SHUT),
    key(0.64, at(1), body(0, 0.025, 0.24), ...LAUNCH, PAWS_FORWARD, turn(-15, -9), bend(2, 9, 19), rump(-4), tail(-13), ears(-36), SHUT),
    key(0.77, at(1), body(0, 0.05, 0), ...AIR, turn(-2), bend(-4, -2, -6), rump(2), tail(10), ears(-14), ANGRY),
    key(0.86, at(1), ...LANDED, bend(0, 0, 2, 9, 8), ears(-10, 8), ANGRY),
    key(0.96, at(1), ...LANDED, pelvis(-0.02), bend(0, 0, 2, -8, -7), ears(-8, 6), ANGRY),
    ...zigzagHome(0.96, 1.26, [ANGRY]),
    key(1.26, at(0), ...LANDED, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/**
 * Headbutt: it rears back with its chin up, zigzags in, rears back once more
 * at the foe and then rams its forehead into it in a short leap, eyes shut;
 * the jar bounces it back and it shakes its head clear.
 */
const headbutt: Clip = {
  name: 'headbutt',
  duration: 1.55,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03, -0.05), bend(-12, -10, -18), rump(-6), tail(12), ears(8), ANGRY),
    ...zigzagIn(0.14, 0.52, [ANGRY, ears(-6), bend(-7, -6, -11)]),
    key(0.52, at(1), ...LANDED, pelvis(-0.02, -0.05), bend(-12, -10, -18), rump(-4), tail(10), ears(6), ANGRY),
    snap(0.6, at(1), body(0, 0.06, 0.31), ...LAUNCH, PAWS_TUCK, bend(-6, 12, 22), rump(4), tail(-8), ears(-40), SHUT),
    key(0.7, at(1), body(0, 0.05, 0.29), ...LAUNCH, PAWS_TUCK, bend(-6, 13, 24, 0, 4), rump(4), tail(-9), ears(-40), SHUT),
    key(0.82, at(1), body(0, 0.04, 0.02), ...AIR, bend(-2, 2, 4), rump(2), tail(8), ears(-12), HURT),
    key(0.92, at(1), ...LANDED, bend(0, 0, 2, 10, 10), ears(-10, 8), SHUT),
    key(1.02, at(1), ...LANDED, pelvis(-0.02), bend(0, 0, 2, -9, -9), ears(-10, 8), SHUT),
    key(1.1, at(1), ...LANDED, pelvis(-0.02), bend(0, 0, 1, 4, 4), ears(-8), ANGRY),
    ...zigzagHome(1.1, 1.38, [ANGRY]),
    key(1.38, at(0), ...LANDED, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.665, name: 'impact' }],
};

/**
 * Secret Power: in the grass, a quick scrappy ram. Nose down and rump up, it
 * zigzags in fast and low through the grass and butts the foe with the top
 * of its head, then bounces off and darts home.
 */
const secretPower: Clip = {
  name: 'secret_power',
  duration: 1.35,
  keys: [
    key(0),
    key(0.11, pelvis(-0.04), bend(8, 8, 14), rump(10), tail(8), ears(-18), ANGRY),
    ...zigzagIn(0.11, 0.42, [ANGRY, bend(6, 6, 10), ears(-26)], 0.04),
    key(0.42, at(1), ...LANDED, pelvis(-0.045), bend(8, 8, 14), rump(10), tail(6), ears(-30), FIERCE),
    snap(0.49, at(1), body(0, 0.02, 0.3), ...LAUNCH, PAWS_TUCK, bend(8, 14, 10), rump(4), tail(-10), ears(-36), SHUT),
    key(0.57, at(1), body(0, 0.02, 0.28), ...LAUNCH, PAWS_TUCK, bend(8, 15, 11, 3), rump(4), tail(-11), ears(-36), SHUT),
    key(0.68, at(1), body(0, 0.05, -0.02), ...AIR, bend(-2, -2, -4), tail(8), ears(-14), ANGRY),
    key(0.77, at(1), ...LANDED, bend(2, 2, 4, 6, 6), ears(-12), ANGRY),
    ...zigzagHome(0.8, 1.1, [ANGRY], 0.04),
    key(1.1, at(0), ...LANDED, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

/**
 * Facade: it winces (it's hurt), then grits its teeth and charges anyway,
 * low and dogged, and drives its right shoulder into the foe with a growl;
 * it winces again as it lands but stays fierce all the way home.
 */
const facade: Clip = {
  name: 'facade',
  duration: 1.55,
  keys: [
    key(0),
    key(0.1, pelvis(-0.02), bend(4, 4, 10, 0, 6), ears(-20), HURT),
    key(0.2, pelvis(-0.045, -0.03), bend(4, 6, 10), rump(6), tail(4), ears(-28), FIERCE, jaw(8)),
    ...zigzagIn(0.2, 0.56, [FIERCE, ears(-30), pelvis(-0.02), bend(3, 4, 7)], 0.05),
    key(0.56, at(1), ...LANDED, pelvis(-0.05, -0.02), turn(-4, -2), bend(6, 8, 14), rump(8), tail(2), ears(-34), FIERCE),
    snap(0.63, at(1), body(0, 0.03, 0.33), ...LAUNCH, PAWS_FORWARD, turn(12, 8), bend(4, 10, 18), rump(-4), tail(-12), ears(-38), FIERCE, jaw(14)),
    key(0.72, at(1), body(0, 0.025, 0.31), ...LAUNCH, PAWS_FORWARD, turn(11, 7), bend(4, 11, 19), rump(-4), tail(-13), ears(-38), FIERCE, jaw(12)),
    key(0.84, at(1), body(0, 0.04, 0), ...AIR, bend(0, 0, 4, 0, 6), rump(2), tail(4), ears(-20), HURT),
    key(0.94, at(1), ...LANDED, pelvis(-0.03), bend(2, 2, 4), ears(-24), FIERCE),
    key(1.04, at(1), ...LANDED, pelvis(-0.028), bend(2, 2, 5, 2), ears(-24), FIERCE),
    ...zigzagHome(1.04, 1.34, [FIERCE]),
    key(1.34, at(0), ...LANDED, FIERCE),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'impact' }],
};

/** One front paw raised to stamp, the other braced straight down. */
const STAMP_UP = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.15, -0.3, 0.94], [-0.05, 0.25, 0.97]);

/**
 * Frustration: a sulky, angry stamp of a forepaw, then it charges with its
 * head low and glaring and shoves its forehead into the foe with a spiteful
 * twist; afterwards a huff, chin turned away.
 */
const frustration: Clip = {
  name: 'frustration',
  duration: 1.55,
  keys: [
    key(0),
    key(0.1, pelvis(-0.01, -0.02), bend(-2, 2, 8), ears(-24), tail(4), ANGRY, STAMP_UP),
    key(0.2, pelvis(-0.035), bend(4, 6, 12), ears(-28), tail(-4), ANGRY, FRONT_DOWN),
    ...zigzagIn(0.2, 0.56, [ANGRY, ears(-30), bend(4, 6, 10)]),
    key(0.56, at(1), ...LANDED, pelvis(-0.045), bend(6, 8, 14), rump(8), tail(-2), ears(-32), FIERCE),
    snap(0.63, at(1), body(0, 0.03, 0.3), ...LAUNCH, PAWS_FORWARD, bend(0, 10, 18, 10, 8), turn(-6, -6), rump(-2), tail(-10), ears(-38), FIERCE),
    key(0.72, at(1), body(0, 0.025, 0.28), ...LAUNCH, PAWS_FORWARD, bend(0, 11, 19, 11, 9), turn(-6, -6), rump(-2), tail(-11), ears(-38), FIERCE),
    key(0.9, at(1), ...LANDED, bend(-4, -6, -10, -14), rump(2), tail(4), jaw(12), ears(-16), ANGRY, scale(1.02)),
    key(1.02, at(1), ...LANDED, bend(-2, -3, -6, -10), rump(1), tail(2), jaw(2), ears(-18), ANGRY, scale(1)),
    ...zigzagHome(1.02, 1.32, [ANGRY]),
    key(1.32, at(0), ...LANDED, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.695, name: 'impact' }],
};

/**
 * Return: a joyful, loyal charge. A happy wiggle, big bouncy bounds, a
 * bounding full-body hit with every paw stretched out, then a pleased look
 * back toward home and a wag before it bounces back.
 */
const returnClip: Clip = {
  name: 'return',
  duration: 1.65,
  keys: [
    key(0),
    key(0.12, pelvis(-0.03), bend(-2, -4, -6, 0, 8), rump(8, 12), tail(16, 24, 6, 10), ears(10), HAPPY),
    ...zigzagIn(0.12, 0.52, [HAPPY, ears(4)], 0.11),
    key(0.52, at(1), ...LANDED, pelvis(-0.045, -0.03), bend(2, 2, 2), rump(8), tail(14, 0, 6), ears(-8), HAPPY),
    snap(0.6, at(1), body(0, 0.1, 0.3), ...STRETCH, bend(-6, 6, 10), rump(-4), tail(-6), ears(-24), HAPPY),
    key(0.7, at(1), body(0, 0.07, 0.28), ...STRETCH, bend(-5, 7, 12), rump(-4), tail(-7), ears(-24), HAPPY),
    key(0.82, at(1), body(0, 0.06, 0.02), ...AIR, bend(-4, -4, -6), tail(12, 0, 6), ears(8), HAPPY),
    key(0.92, at(1), ...LANDED, bend(-2, -3, -5, 26, 8), rump(4, 10), tail(12, 20, 6, 10), ears(12), HAPPY),
    key(1.06, at(1), ...LANDED, bend(-2, -3, -5, 4, 6), rump(4, -8), tail(12, -16, 6, -8), ears(12), HAPPY),
    ...zigzagHome(1.06, 1.4, [HAPPY], 0.09),
    key(1.4, at(0), ...LANDED, HAPPY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.61, name: 'impact' }],
};

/**
 * Double-Edge: a reckless all-out charge. A long coil with the haunches
 * wiggling, wild wide bounds, a crash into the foe with everything behind
 * it; the recoil knocks it back hurt and it staggers before limping home.
 */
const doubleEdge: Clip = {
  name: 'double_edge',
  duration: 1.85,
  keys: [
    key(0),
    key(0.14, pelvis(-0.05, -0.05), bend(6, 4, 4), rump(12, 8), tail(16, 10), ears(-26), FIERCE),
    key(0.24, pelvis(-0.055, -0.06), bend(6, 4, 4), rump(13, -8), tail(18, -12), ears(-28), FIERCE),
    key(0.33, pelvis(-0.06, -0.06), bend(7, 5, 5), rump(14, 6), tail(18, 12), ears(-30), FIERCE),
    ...zigzagIn(0.33, 0.71, [FIERCE, ears(-34)], 0.1),
    key(0.71, at(1), ...LANDED, pelvis(-0.05, -0.03), bend(6, 6, 10), rump(6), ears(-36), FIERCE),
    snap(0.78, at(1), body(0, 0.06, 0.33), ...LAUNCH, PAWS_FORWARD, bend(4, 12, 20), rump(-6), tail(-16), ears(-40), SHUT),
    key(0.87, at(1), body(0, 0.05, 0.31), ...LAUNCH, PAWS_FORWARD, bend(4, 13, 21, 0, 4), rump(-6), tail(-17), ears(-40), SHUT),
    key(1.02, at(1), body(0, 0.05, -0.06), ...AIR, bend(-10, -10, -16, 0, 12), tail(10), ears(-20), HURT),
    key(1.14, at(1), ...LANDED, pelvis(-0.04, -0.04), turn(-6, -8), bend(4, 4, 10, 6, 8), ears(-24), HURT),
    key(1.24, at(1), ...LANDED, pelvis(-0.03, -0.02), turn(4, 4), bend(2, 2, 6, -8, -6), ears(-22), HURT),
    key(1.34, at(1), ...LANDED, pelvis(-0.025), bend(2, 2, 3), ears(-18), SHUT),
    ...zigzagHome(1.34, 1.64, [HURT], 0.05),
    key(1.64, at(0), ...LANDED, HURT),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.79, name: 'impact' }],
};

/**
 * Pursuit: a sneaky chase. Belly low and ears flat it slinks in on short,
 * creeping hops, then a sudden lunge: jaws open, it nips the foe and snaps
 * back, and slinks home low.
 */
const pursuit: Clip = {
  name: 'pursuit',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(-0.06), bend(6, 8, 10), rump(-6), tail(-10), ears(-34), FIERCE),
    ...zigzagIn(0.12, 0.54, [FIERCE, pelvis(-0.03), bend(4, 6, 8), ears(-34), tail(-8)], 0.03),
    key(0.54, at(1), ...LANDED, pelvis(-0.07, -0.03), bend(8, 8, 8), rump(-4), tail(-8), ears(-36), FIERCE),
    snap(0.6, at(1), body(0, 0.04, 0.36), ...LAUNCH, PAWS_FORWARD, bend(-4, 8, 4), jaw(30), tail(-12), ears(-40), FIERCE),
    snap(0.66, at(1), body(0, 0.035, 0.36), ...LAUNCH, PAWS_FORWARD, bend(-2, 10, 8), jaw(2), tail(-12), ears(-40), SHUT),
    key(0.78, at(1), body(0, 0.05, 0), ...AIR, bend(0, 0, 2), jaw(0), tail(-4), ears(-24), ANGRY),
    key(0.87, at(1), ...LANDED, pelvis(-0.04), bend(4, 6, 8), tail(-8), ears(-30), FIERCE),
    ...zigzagHome(0.87, 1.2, [FIERCE, pelvis(-0.02)], 0.04),
    key(1.2, at(0), ...LANDED, pelvis(-0.03), FIERCE),
    key(1.5, OPEN_EYES),
  ],
  // The jaws close on the key and the head trails the body a little.
  events: [{ t: 0.72, name: 'impact' }],
};

/**
 * Struggle: out of moves and exhausted, it stumbles in on clumsy low hops,
 * flops at the foe off balance, and winces from the recoil before trudging
 * home.
 */
const struggle: Clip = {
  name: 'struggle',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, pelvis(-0.04), bend(6, 8, 14), rump(-4), tail(-12), ears(-22), DROWSY, jaw(12)),
    ...zigzagIn(0.14, 0.58, [DROWSY, ears(-24), tail(-10), jaw(10), bend(4, 5, 8)], 0.035),
    key(0.58, at(1), ...LANDED, pelvis(-0.05), bend(8, 10, 16), rump(-4), tail(-12), ears(-26), DROWSY, jaw(8)),
    snap(0.66, at(1), body(0, 0.02, 0.31), ...LAUNCH, PAWS_FORWARD, bend(10, 12, 18, 6, 10), rump(-6), tail(-14), ears(-30), SHUT),
    key(0.76, at(1), body(0, 0.01, 0.29), ...LAUNCH, PAWS_FORWARD, bend(12, 14, 20, 8, 12), rump(-6), tail(-15), ears(-30), SHUT),
    key(0.9, at(1), ...LANDED, pelvis(-0.05, -0.03), bend(4, 4, 10, -6, -8), tail(-10), ears(-28), HURT, jaw(16)),
    key(1.04, at(1), ...LANDED, pelvis(-0.045, -0.02), bend(5, 5, 12, 4, 4), tail(-10), ears(-26), HURT, jaw(10)),
    ...zigzagHome(1.04, 1.38, [DROWSY, jaw(8)], 0.03),
    key(1.38, at(0), ...LANDED, DROWSY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.67, name: 'impact' }],
};

/** Flailing: up off its front paws, one paw cocked high and the other raking down, body twisting. */
const flailPose = (k: number): Pose[] => [
  k > 0 ? SWIPE_COCKED_L : SWIPE_COCKED,
  turn(10 * k, 6 * k), bend(-12, 4, 8, 6 * k), rump(-6, -14 * k), tail(10, 26 * k, 4, 10 * k),
];

/**
 * Flail: desperate at low HP, it panics in on frantic low bounds and then
 * flails at the foe up off its front paws, windmilling its paws, twisting
 * its body and whirling its tail, before it drops back spent and scrambles
 * home.
 */
const flail: Clip = {
  name: 'flail',
  duration: 1.6,
  keys: [
    key(0),
    key(0.1, pelvis(-0.03), bend(2, 2, 4), ears(-24), tail(-6), HURT),
    ...zigzagIn(0.1, 0.44, [HURT, ears(-30)], 0.05),
    key(0.44, at(1), ...LANDED, pelvis(-0.04), bend(4, 4, 8), ears(-30), FIERCE),
    key(0.51, at(1), body(0, 0.05, 0.16), ...LAUNCH, ...flailPose(1), ears(-34), FIERCE),
    key(0.59, at(1), body(0, 0.07, 0.3), ...LAUNCH, ...flailPose(-1), ears(-34), SHUT),
    key(0.67, at(1), body(0, 0.06, 0.28), ...LAUNCH, ...flailPose(1), ears(-34), FIERCE),
    key(0.75, at(1), body(0, 0.05, 0.26), ...LAUNCH, ...flailPose(-1), ears(-34), SHUT),
    key(0.83, at(1), body(0, 0.04, 0.2), ...LAUNCH, ...flailPose(0.6), ears(-30), FIERCE),
    key(0.95, at(1), ...LANDED, pelvis(-0.035), bend(4, 4, 8), ears(-24), HURT),
    key(1.05, at(1), ...LANDED, pelvis(-0.04), bend(5, 5, 10, 0, 4), ears(-24), HURT),
    ...zigzagHome(1.05, 1.38, [HURT], 0.05),
    key(1.38, at(0), ...LANDED, HURT),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

/**
 * Body Slam: at the foe it sinks into a deep crouch, leaps high and comes
 * down belly-first on top of it with every paw spread, crushing it; it rolls
 * off to one side, finds its feet and scampers home.
 */
const bodySlam: Clip = {
  name: 'body_slam',
  duration: 1.8,
  keys: [
    key(0),
    key(0.14, pelvis(-0.05, -0.04), bend(4, 4, 6), rump(10), tail(10), ears(-20), ANGRY),
    ...zigzagIn(0.14, 0.5, [ANGRY]),
    key(0.5, at(1), ...LANDED, pelvis(-0.065, -0.04), bend(6, 4, 6), rump(12), tail(8), ears(-24), FIERCE),
    key(0.63, at(1), body(0, 0.34, 0.12), ...AIR, bend(-10, -6, -10), rump(4), tail(20, 0, 8), ears(-10), FIERCE),
    fall(0.75, at(1), body(0, 0.12, 0.32, 0, 18), ...STRETCH, bend(6, 4, 6), rump(-8), tail(10), ears(-30), SHUT),
    key(0.83, at(1), body(0, 0.1, 0.32, 0, 16), ...STRETCH, bend(6, 4, 7), rump(-8), tail(9), ears(-30), SHUT, scale(0.98)),
    key(0.97, at(1), body(0.12, 0.06, 0.14, 0, 0, -28), ...AIR, bend(0, 0, 2, 0, -6), rump(0, 8), tail(6, 10), ears(-14), ANGRY),
    key(1.09, at(1), body(0.08), ...LANDED, bend(0, 0, 2, 6, 6), ears(-12), ANGRY),
    key(1.19, at(1), body(0.06), ...LANDED, pelvis(-0.02), bend(0, 0, 2, -6, -5), ears(-10), ANGRY),
    ...zigzagHome(1.19, 1.52, [ANGRY]),
    key(1.52, at(0), ...LANDED, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.77, name: 'impact' }],
};

// Paws ------------------------------------------------------------------------------

/** The right paw raised high over its head, claws out, the left braced low (a chop's wind-up). */
const CHOP_HIGH: Pose = frontLegs([0.2, -0.5, 0.84], [0.05, -0.35, 0.94], [-0.35, 0.55, 0.76], [-0.1, 0.9, 0.42]);
/** The chop carried through: the right paw driven straight down in front of it. */
const CHOP_DOWN: Pose = frontLegs([0.2, -0.55, 0.81], [0.05, -0.4, 0.92], [-0.12, -0.2, 0.97], [-0.05, -0.85, 0.52]);

/**
 * Cut: a single vertical chop. At the foe it rears up on its haunches with
 * the right paw raised high, claws out, then springs in and chops straight
 * down through the foe, edge first; the paw hangs low after it.
 */
const cut: Clip = {
  name: 'cut',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(-0.035, -0.02), bend(2, 2, 4), rump(6), ears(-16), ANGRY),
    ...zigzagIn(0.12, 0.48, [ANGRY]),
    key(0.48, at(1), ...LANDED, pelvis(-0.035, -0.02), bend(2, 2, 6), rump(4), ears(-20), FIERCE),
    key(0.6, at(1), pelvis(-0.02, -0.05), bend(-24, 8, 10, 6), turn(-8, -4), rump(-8), tail(10), ears(-10), FIERCE, CHOP_HIGH),
    snap(0.67, at(1), body(0, 0.05, 0.3), ...LAUNCH, pelvis(-0.02, 0.02), bend(-8, 8, 10, -4), turn(4, 2), rump(0), tail(-8), ears(-32), SHUT, CHOP_DOWN),
    key(0.76, at(1), body(0, 0.04, 0.28), ...LAUNCH, pelvis(-0.022, 0.02), bend(-6, 9, 12, -5), turn(5, 2), rump(0), tail(-9), ears(-32), FIERCE, CHOP_DOWN),
    key(0.9, at(1), ...LANDED, pelvis(-0.03), bend(4, 4, 6), rump(2), tail(4), ears(-16), ANGRY),
    key(1.02, at(1), ...LANDED, pelvis(-0.025), bend(2, 2, 3), rump(3), tail(5), ears(-14), ANGRY),
    ...zigzagHome(1.02, 1.3, [ANGRY]),
    key(1.3, at(0), ...LANDED, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  // The paw trails the arm by its overlap: it comes down through the foe just after the key.
  events: [{ t: 0.73, name: 'impact' }],
};

/** Both front paws raised together high over its head (a hammer blow's wind-up). */
const HAMMER_UP: Pose = frontLegs([0.3, 0.45, 0.84], [0.1, 0.9, 0.42], [-0.3, 0.45, 0.84], [-0.1, 0.9, 0.42]);
/** ... driven down together in front of it. */
const HAMMER_DOWN: Pose = frontLegs([0.15, -0.25, 0.96], [0.05, -0.85, 0.52], [-0.15, -0.25, 0.96], [-0.05, -0.85, 0.52]);

/**
 * Rock Smash: a hammer blow. At the foe it rears up tall with both forepaws
 * raised together over its head, then brings them smashing down onto it as
 * onto a boulder, its whole body dropping into the blow; the jolt runs back
 * up through it.
 */
const rockSmash: Clip = {
  name: 'rock_smash',
  duration: 1.6,
  keys: [
    key(0),
    key(0.12, pelvis(-0.035), bend(2, 2, 4), rump(6), ears(-16), ANGRY),
    ...zigzagIn(0.12, 0.48, [ANGRY]),
    key(0.48, at(1), ...LANDED, pelvis(-0.04), bend(2, 2, 4), rump(4), ears(-20), FIERCE),
    key(0.62, at(1), pelvis(-0.015, -0.06), bend(-30, 6, 6), rump(-10), tail(14, 0, 6), ears(-8), FIERCE, HAMMER_UP),
    key(0.68, at(1), pelvis(-0.014, -0.062), bend(-32, 6, 5), rump(-10), tail(15, 0, 6), ears(-8), FIERCE, HAMMER_UP),
    snap(0.75, at(1), body(0, 0.04, 0.3), ...LAUNCH, pelvis(-0.03, 0.02), bend(0, 12, 16), rump(2), tail(-10), ears(-36), SHUT, HAMMER_DOWN),
    key(0.84, at(1), body(0, 0.03, 0.28), ...LAUNCH, pelvis(-0.032, 0.02), bend(1, 12, 17, 0, 5), rump(2), tail(-11), ears(-36), SHUT, HAMMER_DOWN),
    key(0.96, at(1), ...LANDED, pelvis(-0.035), bend(4, 4, 6, 0, -4), rump(2), tail(2), ears(-16), ANGRY),
    key(1.08, at(1), ...LANDED, pelvis(-0.028), bend(2, 2, 3), rump(3), tail(4), ears(-14), ANGRY),
    ...zigzagHome(1.08, 1.38, [ANGRY]),
    key(1.38, at(0), ...LANDED, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.81, name: 'impact' }],
};

/**
 * Fury Cutter: a quick crossing X of two slashes. At the foe it rears up and
 * rakes the right paw down one diagonal, then the left down the other,
 * crossing through the foe (the second cut completes the X and lands).
 */
const furyCutter: Clip = {
  name: 'fury_cutter',
  duration: 1.45,
  keys: [
    key(0),
    key(0.12, pelvis(-0.035), bend(2, 2, 4), rump(6), ears(-18), FIERCE),
    ...zigzagIn(0.12, 0.46, [FIERCE, bend(-5, 3, 4)]),
    key(0.46, at(1), ...LANDED, pelvis(-0.035), bend(-10, 6, 8, 4), turn(2, 0), rump(-4), ears(-20), FIERCE, SWIPE_COCKED),
    snap(0.53, at(1), body(0, 0.04, 0.3), ...LAUNCH, bend(-14, 4, 6, -8), turn(12, 6), rump(-6), tail(4, -10), ears(-30), FIERCE, SWIPE_DOWN),
    key(0.58, at(1), body(0, 0.04, 0.31), ...LAUNCH, bend(-14, 4, 6, -6), turn(10, 5), rump(-6), tail(4, -9), ears(-30), FIERCE, SWIPE_DOWN),
    key(0.65, at(1), body(0, 0.05, 0.32), ...LAUNCH, bend(-16, 4, 6, 5), turn(-7, -4), rump(-6), tail(4, 9), ears(-30), FIERCE, SWIPE_COCKED_L),
    snap(0.7, at(1), body(0, 0.05, 0.37), ...LAUNCH, bend(-12, 5, 8, -6), turn(10, 6), rump(-6), tail(4, -14), ears(-34), SHUT, SWIPE_DOWN_L),
    key(0.79, at(1), body(0, 0.04, 0.35), ...LAUNCH, bend(-11, 5, 9, -7), turn(11, 6), rump(-6), tail(4, -15), ears(-34), FIERCE, SWIPE_DOWN_L),
    key(0.9, at(1), ...LANDED, pelvis(-0.03), bend(2, 2, 4), rump(2), tail(4), ears(-18), FIERCE),
    key(0.98, at(1), ...LANDED, pelvis(-0.026), bend(1, 1, 3, 3), rump(2), tail(5), ears(-16), FIERCE),
    ...zigzagHome(0.98, 1.26, [FIERCE]),
    key(1.26, at(0), ...LANDED, FIERCE),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/** Sitting up begging: front paws held together under its chin. */
const BEG = frontLegs([0.1, -0.2, 0.97], [-0.3, 0.6, 0.74], [-0.1, -0.2, 0.97], [0.3, 0.6, 0.74]);

/**
 * Covet: cute first. It sits up and begs with its paws together and its head
 * tilted, bouncing, then darts in, snatches at the foe with a quick swipe
 * of its right paw and hops home on its hind legs, the prize clutched to its
 * chest.
 */
const covet: Clip = {
  name: 'covet',
  duration: 1.7,
  keys: [
    key(0),
    key(0.14, pelvis(-0.005, -0.04), bend(-20, -4, -6, 0, 14), rump(-8), tail(12, 14, 4, 8), ears(12, 6), HAPPY, BEG),
    key(0.26, pelvis(0.008, -0.04), bend(-22, -4, -6, 0, -12), rump(-8), tail(12, -12, 4, -6), ears(12, 6), HAPPY, BEG),
    key(0.37, pelvis(-0.01, -0.04), bend(-18, -3, -4, 0, 8), rump(-6), tail(10, 8, 4, 4), ears(10, 4), HAPPY, BEG),
    ...zigzagIn(0.37, 0.71, [HAPPY, ears(-8), bend(-9, -2, -3)], 0.09),
    key(0.71, at(1), ...LANDED, pelvis(-0.03), bend(-8, 2, 3, 4), turn(2, 0), rump(-2), ears(-12), ANGRY, SWIPE_COCKED),
    snap(0.77, at(1), body(0, 0.04, 0.3), ...LAUNCH, bend(-10, 4, 6, -8), turn(10, 5), rump(-4), tail(4, -10), ears(-26), FIERCE, SWIPE_DOWN),
    key(0.83, at(1), body(0, 0.04, 0.29), ...LAUNCH, bend(-11, 3, 5, -7), turn(9, 4), rump(-4), tail(5, -9), ears(-24), FIERCE, SWIPE_DOWN),
    key(0.9, at(1), body(0, 0.045, 0.2), ...LAUNCH, bend(-14, 0, 2, -4), turn(4, 2), rump(-6), tail(8, -4), ears(-10), HAPPY, PAWS_HUG),
    key(1.0, at(1), body(0, 0.06, 0.02), ...AIR, bend(-16, -2, -2), rump(-6), tail(10), ears(6), HAPPY, PAWS_HUG),
    ...zigzagHome(1.0, 1.35, [HAPPY, bend(-16, -2, -2), PAWS_HUG], 0.06),
    key(1.35, at(0), ...LANDED, bend(-14, -2, -2), rump(-4), tail(10, 8), ears(8), HAPPY, PAWS_HUG),
    key(1.5, pelvis(-0.01), bend(-4, -1, -1), tail(6, 4), ears(4), HAPPY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'impact' }],
};

/**
 * Thief: sly and quick. It darts in low with its ears flat, snatches at the
 * foe's side with a quick swipe of its left paw, and bolts home on its hind
 * legs with the prize hugged to its chest, still low and wary.
 */
const thief: Clip = {
  name: 'thief',
  duration: 1.45,
  keys: [
    key(0),
    key(0.1, pelvis(-0.05), bend(4, 6, 8), rump(-4), tail(-8), ears(-30), FIERCE),
    ...zigzagIn(0.1, 0.42, [FIERCE, pelvis(-0.025), ears(-32)], 0.035),
    key(0.42, at(1), ...LANDED, pelvis(-0.05, -0.02), bend(-8, 4, 6, -6), turn(8, 4), rump(-4), tail(-6), ears(-32), FIERCE, SWIPE_COCKED_L),
    snap(0.48, at(1), body(0.05, 0.03, 0.3), ...LAUNCH, bend(-10, 4, 6, 8), turn(-12, -6), rump(-4), tail(-6, 10), ears(-34), FIERCE, SWIPE_DOWN_L),
    key(0.54, at(1), body(0.05, 0.03, 0.29), ...LAUNCH, bend(-11, 3, 5, 7), turn(-11, -5), rump(-4), tail(-6, 9), ears(-34), FIERCE, SWIPE_DOWN_L),
    key(0.61, at(1), body(0.06, 0.035, 0.2), ...LAUNCH, bend(-14, 2, 2, 4), turn(-4, -2), rump(-6), tail(-4, 4), ears(-30), FIERCE, PAWS_HUG),
    key(0.7, at(1), body(0.1, 0.05, 0), ...AIR, bend(-14, 0, 2), rump(-6), tail(-4), ears(-28), FIERCE, PAWS_HUG),
    ...zigzagHome(0.7, 1.0, [FIERCE, bend(-12, 0, 2), PAWS_HUG], 0.045),
    key(1.0, at(0), ...LANDED, pelvis(-0.03), bend(-10, 0, 2), rump(-4), tail(-4), ears(-24), FIERCE, PAWS_HUG),
    key(1.18, pelvis(-0.02), bend(-2, 0, 1), ears(-12), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

// The tail -----------------------------------------------------------------------------

/**
 * Iron Tail: its tail raised stiff as a club, it zigzags in, springs up and
 * spins round in the air so the tail swings over and down onto the foe like
 * steel, and lands facing it again before scampering home.
 */
const ironTail: Clip = {
  name: 'iron_tail',
  duration: 1.75,
  keys: [
    key(0),
    key(0.14, pelvis(-0.04), rump(6, -14), tail(16, -16, 8), bend(4, 2, 2, 6), ears(-22), FIERCE),
    ...zigzagIn(0.14, 0.5, [FIERCE, tail(12, 0, 6)]),
    key(0.5, at(1), ...LANDED, pelvis(-0.05), rump(8, -18), tail(20, -20, 8), bend(4, 2, 2, 6), ears(-24), FIERCE),
    key(0.61, at(1), body(0, 0.2, 0.3, -95), ...AIR, rump(4, 10), tail(26, 20, 10, 8), bend(0, 0, 0), ears(-24), FIERCE),
    snap(0.71, at(1), body(0, 0.14, 0.66, -185), ...AIR, rump(-4, 14), tail(-26, 24, -12, 12), ears(-28), SHUT),
    key(0.79, at(1), body(0, 0.1, 0.58, -240), ...AIR, rump(-2, 12), tail(-20, 20, -8, 10), ears(-26), SHUT),
    key(0.92, at(1), ...LANDED, body(0, 0, 0.04, -360), bend(4, 2, 4, 0, 5), rump(2), tail(4), ears(-14), ANGRY),
    key(1.04, at(1), ...LANDED, body(0, 0, 0, -360), pelvis(-0.02), bend(2, 1, 2, 0, -4), tail(2), ears(-12), ANGRY),
    ...zigzagHome(1.04, 1.4, [ANGRY, body(0, 0, 0, -360)]),
    key(1.4, at(0), ...LANDED, body(0, 0, 0, -360), ANGRY),
    key(1.75, body(0, 0, 0, -360), OPEN_EYES),
  ],
  // The tail trails the rump by its overlap: it comes down on the foe just after the key.
  events: [{ t: 0.77, name: 'impact' }],
};

// Rolling --------------------------------------------------------------------------------

/** Curled into a tight ball: head tucked to the chest, paws in, rump curled under, tail wrapped over. */
const BALL: Pose[] = [
  pelvis(-0.06, -0.04), bend(18, 20, 36), rump(-24, 0), tail(40, 0, 24), ears(-34), SHUT, PAWS_HUG, HIND_TUCK, scale(0.96),
];

/**
 * A rolling ball's key: `turns` of forward roll (1 = 360°) about the middle
 * of the curled body (0.28 heights up), advancing `adv` toward the foe with
 * a bounce `hop` and a sideways swerve `x`.
 */
const rolling = (t: number, adv: number, turns: number, x = 0, hop = 0, z = 0): ReturnType<typeof key> => {
  const p = turns * 2 * Math.PI;
  const c = 0.28;
  return key(t, at(adv), ...BALL, body(x, c - c * Math.cos(p) + hop, z - c * Math.sin(p), 0, turns * 360));
};

/**
 * Rollout: it curls up into a tight ball and rolls at the foe, swerving
 * zigzag across the field, rams into it, bounces back off, uncurls in the
 * air and scampers home.
 */
const rollout: Clip = {
  name: 'rollout',
  duration: 1.75,
  keys: [
    key(0),
    key(0.12, pelvis(-0.04), bend(8, 10, 18), rump(-10), tail(20, 0, 10), ears(-24), SHUT, PAWS_HUG),
    rolling(0.2, 0, 0, 0, 0.03),
    rolling(0.28, 0.12, 0.25, 0.1, 0.04),
    rolling(0.36, 0.26, 0.5, 0.2, 0.05),
    rolling(0.44, 0.42, 0.75, 0.1, 0.04),
    rolling(0.52, 0.58, 1.0, -0.08, 0.05),
    rolling(0.6, 0.74, 1.25, -0.18, 0.04),
    rolling(0.68, 0.9, 1.5, -0.08, 0.04),
    rolling(0.74, 1, 1.75, 0, 0.03, 0.8),
    rolling(0.82, 1, 1.9, 0, 0.09, 0.6),
    key(0.94, at(0.8), body(0, 0.12, -0.04), ...AIR, bend(4, 4, 8), rump(-6), tail(10, 0, 4), ears(-16), ANGRY),
    key(1.04, at(0.62), ...LANDED, bend(2, 2, 4, 6, 6), ears(-12), ANGRY),
    ...zigzagHome(1.04, 1.44, [ANGRY]),
    key(1.44, at(0), ...LANDED, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.75, name: 'impact' }],
};

// Burrowing -------------------------------------------------------------------------------

/** Scrabbling at the ground: one paw digging back under the chest, the other reaching to dig. */
const scrabble = (right: boolean): Pose =>
  right
    ? frontLegs([0.1, -0.7, 0.7], [0.05, -0.9, 0.42], [-0.1, -0.9, -0.42], [-0.05, -0.85, 0.52])
    : frontLegs([0.1, -0.9, -0.42], [0.05, -0.85, 0.52], [-0.1, -0.7, 0.7], [-0.05, -0.9, 0.42]);

const UNDER = -1.35;

/**
 * Dig, its first turn: nose to the ground and rump up, it scrabbles
 * frantically at the earth with both forepaws, the dirt flying (dig), and
 * sinks out of sight head first.
 */
const digCharge: Clip = {
  name: 'dig_charge',
  duration: 1.25,
  keys: [
    key(0),
    key(0.1, pelvis(-0.03), bend(10, 8, 16), rump(12), tail(12), ears(-20), FIERCE),
    key(0.18, pelvis(-0.035), bend(12, 9, 18), rump(12), tail(12), ears(-22), FIERCE, scrabble(true)),
    key(0.26, pelvis(-0.035), bend(12, 9, 18), rump(13), tail(14), ears(-22), FIERCE, scrabble(false)),
    key(0.34, pelvis(-0.04), bend(13, 9, 18), rump(13), tail(12), ears(-24), SHUT, scrabble(true)),
    key(0.42, body(0, -0.18), pelvis(-0.04), bend(14, 10, 20), rump(14), tail(14), ears(-26), SHUT, scrabble(false)),
    fall(0.72, body(0, -0.9), { plantFeet: 0 }, pelvis(-0.04), bend(16, 10, 20), rump(16), tail(20, 0, 8), ears(-30), SHUT, PAWS_DIG),
    key(0.92, body(0, UNDER), { plantFeet: 0 }, pelvis(-0.04), bend(16, 10, 20), rump(16), tail(22, 0, 8), ears(-30), SHUT, PAWS_DIG),
    key(1.25, body(0, UNDER), { plantFeet: 0 }, pelvis(-0.042), bend(16, 10, 21), rump(16), tail(22, 0, 9), ears(-30), SHUT, PAWS_DIG),
  ],
  events: [{ t: 0.3, name: 'dig' }],
};

/**
 * Dig, the strike: from under the ground where its first turn left it, it
 * tunnels over to the foe and bursts up out of the earth right under it,
 * head first, driving up into it (impact as it breaks the surface); it drops
 * back down, crouches a moment, and scampers home.
 */
const dig: Clip = {
  name: 'dig',
  duration: 1.65,
  keys: [
    key(0, body(0, UNDER), { plantFeet: 0 }, pelvis(-0.04), bend(16, 10, 20), rump(16), tail(22, 0, 8), ears(-30), SHUT, PAWS_DIG),
    key(0.16, at(0.3), body(0, UNDER), { plantFeet: 0 }, pelvis(-0.04), bend(14, 10, 18), rump(14), tail(20, 0, 8), ears(-30), SHUT, PAWS_DIG),
    key(0.42, at(1), body(0, UNDER + 0.05, 0.4), { plantFeet: 0 }, pelvis(-0.04), bend(6, 4, 4), rump(6), tail(10), ears(-30), FIERCE, PAWS_TUCK),
    snap(0.56, at(1), body(0, 0.36, 0.56), ...STRETCH, bend(-14, -10, -12), rump(-6), tail(16, 0, 8), ears(-36), FIERCE),
    key(0.66, at(1), body(0, 0.42, 0.5), ...STRETCH, bend(-15, -10, -13, 0, 4), rump(-6), tail(18, 0, 8), ears(-34), FIERCE),
    fall(0.84, at(1), ...LANDED, pelvis(-0.055), bend(6, 4, 6), rump(6), tail(4), ears(-18), ANGRY),
    key(1.12, at(1), ...LANDED, pelvis(-0.045), bend(4, 3, 5, 4), rump(5), tail(5), ears(-16), ANGRY),
    ...zigzagHome(1.12, 1.44, [ANGRY]),
    key(1.44, at(0), ...LANDED, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

export const CONTACT_CLIPS: Clip[] = [
  tackle, headbutt, secretPower, facade, frustration, returnClip, doubleEdge, pursuit, struggle, flail, bodySlam,
  cut, rockSmash, furyCutter, covet, thief, ironTail, rollout, digCharge, dig,
];

export { FRONT_DOWN, HIND_TUCK, PAWS_UP, jaw, scale };
