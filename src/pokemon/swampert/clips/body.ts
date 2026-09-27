// Swampert's whole-body moves: the charges (Tackle, Take Down, Double-Edge,
// Return, Frustration, Facade, Secret Power, Endeavor, Struggle, Bide), the
// crushes (Body Slam), Waterfall's surge from below, Iron Tail's spinning
// club of a tail and Rollout's roll. Its mass is the weapon: it leads with
// the shoulder, the head or the belly, crashes into the foe with the body
// lunging in (root.z), bounces off and hops home.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_BACK, ARMS_FWD_SPREAD, ARMS_SPREAD_UP, ARMS_TUCKED, ARMS_UP, CROSSED_LOW, DROWSY, ELBOWS_OUT, FISTS, FLINCH, HAPPY,
  HOP, HURT, LAND, LAND_DEEP, LAND_HOME, LIMP_ARMS, MOUTH_SHUT, OPEN_EYES, PUSH, SPLAY, SQUINT, SUMO_GUARD, TUCK, arms, atFoe, bend, body,
  clip, fall, flying, hopHome, jaw, key, landed, pelvis, sink, snap, stepL, stepR, tail, twist,
} from './kit';

/** Arms wrapped round the foe's legs, low (a diving tackle). */
const WRAP_LOW = arms([0.55, -0.55, 0.63], [-0.3, -0.35, 0.89], [-0.55, -0.3, 0.78]);
/** Arms flung forward and wide, reaching (a wild all-out crash). */
const REACHING = arms([0.6, 0.05, 0.8], [0.35, -0.05, 0.94], [0.15, -0.1, 0.98]);
/** Arms flung up and forward (surging upward). */
const SURGE_UP = arms([0.35, 0.78, 0.52], [0.12, 0.93, 0.34], [0.02, 0.95, 0.3]);
/** Both hands clutching its head (recoil pain). */
const CLUTCH_HEAD = arms([0.62, 0.3, 0.72], [-0.35, 0.8, 0.49], [-0.55, 0.7, 0.45]);
/** Arms whirling: the right high, the left low (flailing, one phase). */
const FLAIL_A = arms([0.8, 0.5, 0.33], [0.45, 0.85, 0.27], [0.2, 0.95, 0.24], [[-0.7, -0.6, 0.39], [-0.3, -0.9, 0.3], [-0.1, -0.95, 0.3]]);
/** ... the other phase. */
const FLAIL_B = arms([0.7, -0.6, 0.39], [0.3, -0.9, 0.3], [0.1, -0.95, 0.3], [[-0.8, 0.5, 0.33], [-0.45, 0.85, 0.27], [-0.2, 0.95, 0.24]]);
/** Curled into a ball: arms wrapped round the tucked knees. */
const BALL_ARMS = arms([0.45, -0.7, 0.55], [-0.45, -0.35, 0.82], [-0.65, -0.1, 0.75]);
/** Curled up: the head tucked, the back rounded, the knees drawn in. */
const BALL: Pose = compose2(
  { plantFeet: 0, bones: { thighL: { x: -70 }, thighR: { x: -70 }, shinL: { x: 90 }, shinR: { x: 90 } } },
  bend(30, 14, 6, 26),
);
/** The right forearm thrown across, elbow leading (a spiteful shove). */
const ELBOW_R = arms([0.8, -0.35, 0.48], [0.35, -0.6, 0.72], [0.1, -0.75, 0.65], [[-0.3, -0.1, 0.95], [0.75, 0.1, 0.65], [0.85, 0.1, 0.52]]);
/** Palms thrust forward together (Bide's blast). */
const PALMS = arms([0.3, -0.05, 0.95], [0.1, 0.1, 0.99], [0.0, 0.45, 0.89]);

/** How high the curled ball's middle sits above its feet (heights). */
const BALL_MID = 0.28;
/** The ball at advance a, rolled to `deg`, lunging `z` and lifted `lift` (heights): its middle at the root. */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_MID + lift, z, pitch: deg } }, BALL, BALL_ARMS, { pelvis: { y: -BALL_MID } }, MOUTH_SHUT, SHUT_EYES(),
];
/** A key of the rolling ball. */
const rolling = (t: number, a: number, deg: number, z = 0, lift = 0) => key(t, ...ball(a, deg, z, lift));

function compose2(a: Pose, b: Pose): Pose {
  return { ...a, bones: { ...(a.bones ?? {}), ...(b.bones ?? {}) } };
}

/**
 * Tackle: a shoulder charge. It sinks and turns its right shoulder back,
 * hops in low with the head down, and slams the shoulder into the foe, the
 * whole body lunging through; it rebounds off it shaking its head and hops
 * home in one flow.
 */
export const tackle = clip('tackle', [
  key(0),
  key(0.2, pelvis(0, -0.055, -0.02), twist(-12), bend(10, 3, 1, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.36, flying(0.6, 0.05), twist(14), bend(14, 4, 1, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  snap(0.46, atFoe(0.26, 6), LAND, pelvis(0, -0.035, 0.02), twist(18), bend(16, 5, 1, 8), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
  key(0.56, atFoe(0.26, 5), LAND, pelvis(0, -0.045, 0.02), twist(16), bend(15, 5, 1, 7), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
  key(0.72, { advance: 0.72, root: { y: 0.05 } }, HOP, twist(4), bend(8, 2, 0, 0, 7), ANGRY),
  key(0.86, { advance: 0.38, root: { y: 0.055 } }, HOP, bend(6, 0, 0, 0, -5), ANGRY),
  key(1.0, { advance: 0 }, LAND_HOME, ANGRY),
  key(1.16, pelvis(0, -0.02), bend(3, 1, 0, 1), ANGRY),
  key(1.4, OPEN_EYES),
], [[0.53, 'impact']]);

/**
 * Take Down: a reckless charge. It lowers its head like a bull and scrapes
 * the ground with a foot, then charges in two heavy bounding strides, head
 * down and arms swept back, and crashes into the foe head and shoulders
 * first. The recoil hurts: it rocks back wincing, shakes its head and hops
 * home.
 */
export const takeDown = clip('take_down', [
  key(0),
  key(0.2, sink(-0.05), bend(12, 4, 1, 10), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.34, sink(-0.055), stepR(24), body(0, 0, -0.03), bend(12.5, 4, 1, 10.5), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.46, sink(-0.06), bend(13, 4, 1, 11), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.6, flying(0.42, 0.07), bend(15, 5, 1, 12), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.72, { advance: 0.7 }, stepL(34), pelvis(0, -0.04), bend(16, 5, 1, 12), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.82, flying(0.92, 0.05), bend(17, 5, 1, 12), ARMS_BACK, MOUTH_SHUT, ANGRY),
  snap(0.9, atFoe(0.3, 8), LAND, bend(18, 5, 1, 10), ARMS_BACK, MOUTH_SHUT, SQUINT),
  key(0.98, atFoe(0.3, 7), LAND, pelvis(0, -0.06), bend(18, 5, 1, 10), ARMS_BACK, MOUTH_SHUT, SQUINT),
  snap(1.1, atFoe(0.02, -4), pelvis(0, -0.02, -0.02), bend(-6, -3, -2, -12), FLINCH, jaw(10), HURT),
  key(1.24, atFoe(0), pelvis(0, -0.03), bend(2, 1, 0, 2, 8, 6), ELBOWS_OUT, jaw(4), HURT),
  key(1.36, atFoe(0), pelvis(0, -0.03), bend(2, 1, 0, 2, -8, -6), ELBOWS_OUT, jaw(4), HURT),
  ...hopHome(1.5, ELBOWS_OUT, ANGRY),
  key(1.86, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.2, OPEN_EYES),
], [[0.93, 'impact']]);

/**
 * Double-Edge: wilder than Take Down, with a longer run-up. It backs off a
 * step pawing the ground twice, then three pounding strides and a leap, and
 * throws its whole body into the foe arms-first, reckless; the recoil hurts
 * it badly: it reels back clutching its head, staggers, and hops home.
 */
export const doubleEdge = clip('double_edge', [
  key(0),
  key(0.18, sink(-0.04), body(0, 0, -0.04), bend(11, 3, 1, 9), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.3, sink(-0.05), stepR(26), body(0, 0, -0.08), bend(12, 4, 1, 10), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.42, sink(-0.05), body(0, 0, -0.08), bend(12, 4, 1, 10.5), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.54, sink(-0.055), stepR(26), body(0, 0, -0.08), bend(12.5, 4, 1, 11), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.66, sink(-0.06), body(0, 0, -0.08), bend(13, 4, 1, 11.5), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.78, flying(0.28, 0.06), bend(15, 5, 1, 10), ARMS_BACK, jaw(8), ANGRY),
  key(0.88, { advance: 0.5 }, stepR(36), pelvis(0, -0.05), bend(15.5, 5, 1, 10), ARMS_BACK, jaw(10), ANGRY),
  key(1.04, flying(0.85, 0.13), bend(14, 4, 0, 4), REACHING, SPLAY, jaw(20), ANGRY),
  snap(1.14, atFoe(0.32, 10), LAND, bend(16, 5, 1, 6), REACHING, SPLAY, jaw(24), SQUINT),
  key(1.24, atFoe(0.31, 9), LAND_DEEP, bend(15, 5, 1, 7), REACHING, SPLAY, jaw(18), SQUINT),
  snap(1.38, atFoe(-0.04, -6), pelvis(0, -0.02, -0.03), bend(-8, -4, -2, -14), CLUTCH_HEAD, jaw(14), HURT),
  key(1.52, atFoe(-0.06, -3), stepL(20), bend(-4, -2, 0, -6, 6, 5), CLUTCH_HEAD, jaw(8), HURT),
  key(1.66, atFoe(-0.03), pelvis(0, -0.04), bend(2, 1, 0, 0, -6, -4), CLUTCH_HEAD, jaw(6), HURT),
  ...hopHome(1.8, ELBOWS_OUT, HURT),
  key(2.14, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.5, OPEN_EYES),
], [[1.17, 'impact']]);

/**
 * Body Slam: the whole mass as a weapon. A long coil with the arms drawn
 * back, a heavy leap high with the arms flung up, and it comes down
 * belly-first on the foe, crushing it; it shoves off and hops home.
 */
export const bodySlam = clip('body_slam', [
  key(0),
  key(0.34, pelvis(0, -0.1, -0.02), bend(-8, -6, -2, -8), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.46, pelvis(0, -0.11, -0.025), bend(-9, -6, -2, -10), ARMS_BACK, MOUTH_SHUT, ANGRY),
  snap(0.62, { advance: 0.45, root: { y: 0.18, pitch: 10 } }, TUCK, bend(6, 2, 0, -6), ARMS_SPREAD_UP, jaw(10), ANGRY),
  key(0.76, { advance: 0.8, root: { y: 0.2, pitch: 24 } }, TUCK, bend(12, 4, 0, -4), ARMS_FWD_SPREAD, jaw(12), ANGRY),
  fall(0.88, { advance: 1, root: { y: 0.03, z: 0.12, pitch: 40 } }, TUCK, bend(16, 6, 2, 0), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
  key(0.95, { advance: 1, root: { y: 0.0, z: 0.14, pitch: 42 } }, TUCK, pelvis(0, -0.04), bend(18, 7, 2, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
  key(1.06, { advance: 1, root: { y: 0.01, z: 0.12, pitch: 35 } }, TUCK, pelvis(0, -0.03), bend(15, 6, 2, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
  key(1.24, atFoe(0.04, 6), LAND, pelvis(0, -0.04), bend(10, 2, 0, 0), ANGRY),
  key(1.38, atFoe(0), LAND, pelvis(0, -0.03), bend(8, 2, 0, 0), ANGRY),
  ...hopHome(1.54, ANGRY),
  key(1.9, pelvis(0, -0.02), ANGRY),
  key(2.25, OPEN_EYES),
], [[0.98, 'impact']]);

/**
 * Return: a joyful, loyal charge. Grinning, it bounces on its toes, then
 * bounds in with two happy hops and bumps the foe with its big chest, arms
 * flung wide; it hops home looking pleased with itself.
 */
export const returnMove = clip('return', [
  key(0),
  key(0.16, sink(-0.04), bend(4, 1, 0, -2), ELBOWS_OUT, HAPPY),
  key(0.3, body(0, 0.05, 0), HOP, bend(-4, -2, 0, -6), ARMS_SPREAD_UP, jaw(10), HAPPY),
  key(0.42, sink(-0.06), bend(8, 2, 0, 2), ELBOWS_OUT, jaw(6), HAPPY),
  key(0.56, flying(0.45, 0.1), bend(-2, -1, 0, -4), ARMS_SPREAD_UP, jaw(12), HAPPY),
  key(0.68, landed(0.7), bend(6, 2, 0, 0), ELBOWS_OUT, jaw(8), HAPPY),
  key(0.8, flying(0.9, 0.08), bend(-6, -2, 0, -6), ARMS_SPREAD_UP, jaw(12), HAPPY),
  snap(0.9, atFoe(0.22), LAND, pelvis(0, -0.03, 0.03), bend(-12, -4, 0, -8), SUMO_GUARD, SPLAY, jaw(16), HAPPY),
  key(1.02, atFoe(0.2), LAND, pelvis(0, -0.04, 0.03), bend(-10, -4, 0, -6), SUMO_GUARD, SPLAY, jaw(14), HAPPY),
  key(1.18, atFoe(0.04), pelvis(0, -0.03), bend(2, 1, 0, 0, 10, 6), ELBOWS_OUT, jaw(10), HAPPY),
  ...hopHome(1.32, ELBOWS_OUT, HAPPY),
  key(1.62, pelvis(0, -0.02), bend(2, 1, 0, -2, -6, -4), jaw(6), HAPPY),
  key(2.0, OPEN_EYES),
], [[0.94, 'impact']]);

/**
 * Frustration: a sulky, spiteful charge. It stamps its feet in a huff (left,
 * right), glaring, then stomps in with a heavy hop and rams the foe with its
 * right elbow thrown across, and huffs again with a toss of its head.
 */
export const frustration = clip('frustration', [
  key(0),
  key(0.14, stepL(46), sink(-0.02), bend(6, 2, 0, 6), twist(6), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.24, sink(-0.075), bend(12, 3, 0, 10), twist(-4), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  key(0.36, stepR(46), sink(-0.02), bend(6, 2, 0, 6), twist(-8), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.46, sink(-0.08), bend(12, 3, 0, 10), twist(6), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  key(0.62, flying(0.55, 0.07), bend(10, 3, 0, 6), twist(-16), ELBOW_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.74, landed(), bend(12, 3, 0, 6), twist(-20), ELBOW_R, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.82, atFoe(0.2), pelvis(0, -0.04, 0.02), bend(14, 4, 0, 4), twist(20), ELBOW_R, FISTS, jaw(12), ANGRY),
  key(0.96, atFoe(0.2), pelvis(0, -0.045, 0.02), bend(14, 4, 0, 4), twist(24), ELBOW_R, FISTS, jaw(8), ANGRY),
  key(1.1, atFoe(0.05), pelvis(0, -0.03), bend(-4, -2, 0, -12, 14, 4), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  ...hopHome(1.24, ELBOWS_OUT, ANGRY),
  key(1.56, pelvis(0, -0.02), bend(4, 1, 0, 2, -8), MOUTH_SHUT, ANGRY),
  key(1.9, OPEN_EYES),
], [[0.87, 'impact']]);

/**
 * Facade: gritty, fighting on though it hurts. It hunches wincing a moment,
 * then grits its teeth, sets its jaw and drives in with a head-down ram,
 * shoving through the foe with its crown; it stands its ground and hops home.
 */
export const facade = clip('facade', [
  key(0),
  key(0.18, sink(-0.04), bend(14, 5, 2, 10), CROSSED_LOW, MOUTH_SHUT, HURT),
  key(0.34, sink(-0.05), bend(15, 5, 2, 11, 3, 4), CROSSED_LOW, MOUTH_SHUT, HURT),
  key(0.48, sink(-0.06), bend(12, 4, 1, 12), ARMS_TUCKED, FISTS, MOUTH_SHUT, SQUINT),
  key(0.62, flying(0.55, 0.07), bend(14, 4, 1, 13), ARMS_TUCKED, FISTS, MOUTH_SHUT, ANGRY),
  key(0.74, landed(), bend(12, 4, 1, 12), ARMS_TUCKED, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.82, atFoe(0.3, 6), pelvis(0, -0.04, 0.03), bend(16, 5, 1, 13), ARMS_TUCKED, FISTS, MOUTH_SHUT, SQUINT),
  key(0.96, atFoe(0.33, 7), pelvis(0, -0.05, 0.035), bend(17, 5, 1, 13), ARMS_TUCKED, FISTS, MOUTH_SHUT, SQUINT),
  key(1.12, atFoe(0.05), pelvis(0, -0.035), bend(6, 2, 0, 0), ELBOWS_OUT, FISTS, ANGRY),
  ...hopHome(1.26, ELBOWS_OUT, ANGRY),
  key(1.58, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.86, 'impact']]);

/**
 * Secret Power: a quick, scrappy ram. A short dip, a quick low hop, and it
 * butts the foe with the crown of its head, bounces off and hops home.
 */
export const secretPower = clip('secret_power', [
  key(0),
  key(0.16, sink(-0.05), bend(10, 3, 1, 10), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.3, flying(0.6, 0.06), bend(12, 4, 1, 13), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.38, landed(), bend(12, 4, 1, 13), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  snap(0.44, atFoe(0.28, 5), pelvis(0, -0.03, 0.02), bend(16, 5, 2, 14), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
  key(0.56, atFoe(0.12), pelvis(0, -0.04), bend(10, 4, 0, 4, 8, 6), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
  key(0.7, { advance: 0.6, root: { y: 0.05 } }, HOP, bend(4, 1, 0, 0, -6, -4), ANGRY),
  key(0.86, { advance: 0 }, LAND_HOME, ANGRY),
  key(1.04, pelvis(0, -0.02), bend(3, 1, 0, 1), ANGRY),
  key(1.35, OPEN_EYES),
], [[0.48, 'impact']]);

/**
 * Endeavor: desperate, all-out. It crouches low and scrambles forward in two
 * short, stumbling hops, then dives at the foe and wraps its arms round its
 * legs in a flying tackle, clinging on as it hits; it pushes itself back up
 * and hops home, panting.
 */
export const endeavor = clip('endeavor', [
  key(0),
  key(0.2, sink(-0.08), bend(20, 6, 2, 10), CROSSED_LOW, MOUTH_SHUT, SQUINT),
  key(0.32, sink(-0.085), bend(21, 6, 2, 11, 0, 3), CROSSED_LOW, MOUTH_SHUT, SQUINT),
  key(0.44, flying(0.35, 0.05), bend(22, 6, 2, 8), WRAP_LOW, jaw(10), ANGRY),
  key(0.54, landed(0.55), stepL(20), bend(24, 7, 2, 8), WRAP_LOW, jaw(10), ANGRY),
  key(0.66, flying(0.85, 0.07, ), body(0, 0, 0, 22), bend(20, 6, 2, 0), REACHING, SPLAY, jaw(16), ANGRY),
  snap(0.76, atFoe(0.3, 30), { plantFeet: 0 }, bend(18, 6, 2, -4), WRAP_LOW, jaw(12), SQUINT),
  key(0.9, atFoe(0.3, 28), { plantFeet: 0 }, bend(18, 6, 2, -3, 3, 2), WRAP_LOW, jaw(10), SQUINT),
  key(1.04, atFoe(0.12, 8), LAND_DEEP, bend(12, 4, 0, 0), ELBOWS_OUT, jaw(8), ANGRY),
  key(1.18, atFoe(0.04), LAND, bend(6, 2, 0, 0), ELBOWS_OUT, jaw(12), DROWSY),
  ...hopHome(1.32, ELBOWS_OUT, DROWSY),
  key(1.62, pelvis(0, -0.03), bend(6, 2, 0, 4), jaw(10), DROWSY),
  key(2.0, OPEN_EYES),
], [[0.8, 'impact']]);

/**
 * Struggle: nothing left but to throw itself at the foe. Eyes heavy, it
 * lurches forward in a clumsy low hop, arms whirling, bumps weakly into the
 * foe, winces at the recoil and stumbles back home.
 */
export const struggle = clip('struggle', [
  key(0),
  key(0.2, sink(-0.05), bend(12, 4, 2, 10), LIMP_ARMS, MOUTH_SHUT, DROWSY),
  key(0.34, sink(-0.06), bend(14, 4, 2, 12, 4, 5), LIMP_ARMS, MOUTH_SHUT, DROWSY),
  key(0.5, flying(0.6, 0.05), bend(10, 3, 0, 4), FLAIL_A, SPLAY, jaw(12), ANGRY),
  key(0.6, landed(), stepR(18), bend(12, 3, 0, 4), FLAIL_B, SPLAY, jaw(12), ANGRY),
  key(0.68, atFoe(0.2, 5), bend(16, 4, 0, 6), FLAIL_A, SPLAY, jaw(14), SQUINT),
  key(0.78, atFoe(0.2, 4), bend(16, 4, 0, 6), FLAIL_B, SPLAY, jaw(12), SQUINT),
  snap(0.9, atFoe(-0.02, -3), pelvis(0, -0.02, -0.02), bend(-4, -2, 0, -8), FLINCH, jaw(8), HURT),
  key(1.04, atFoe(0), stepL(18), pelvis(0, -0.04), bend(6, 2, 0, 4, 6, 6), LIMP_ARMS, jaw(6), HURT),
  ...hopHome(1.18, LIMP_ARMS, DROWSY),
  key(1.5, pelvis(0, -0.04), bend(8, 2, 0, 6, -3, -3), LIMP_ARMS, jaw(8), DROWSY),
  key(1.9, OPEN_EYES),
], [[0.74, 'impact']]);

/**
 * Bide, the first turn: it braces and stores up the blows, sunk low with its
 * fists clenched at its sides, teeth gritted and eyes squeezed shut,
 * trembling harder and harder with the energy (charge), then eases.
 */
export const bideCharge = clip('bide_charge', [
  key(0),
  key(0.18, sink(-0.05), bend(8, 3, 0, 6), ELBOWS_OUT, FISTS, MOUTH_SHUT, SQUINT),
  key(0.34, sink(-0.07), bend(10, 4, 0, 8, 2, 2), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(0.46, sink(-0.075), bend(10, 4, 0, 8, -3, -3), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(0.58, sink(-0.078), bend(11, 4, 0, 9, 4, 3), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(0.7, sink(-0.08), bend(11, 4, 0, 9, -4, -4), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(0.82, sink(-0.082), bend(12, 4, 0, 10, 5, 4), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(0.94, sink(-0.084), bend(12, 4, 0, 10, -5, -4), LIMP_ARMS, FISTS, MOUTH_SHUT, SQUINT),
  key(1.14, sink(-0.04), bend(6, 2, 0, 4), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  key(1.5, OPEN_EYES),
], [[0.2, 'charge']]);

/**
 * Bide, unleashed: it roars out the stored energy, hops at the foe and blasts
 * it with both palms thrust into it together, the recoil throwing its head
 * back; then it hops home.
 */
export const bide = clip('bide', [
  key(0),
  key(0.18, sink(-0.07), bend(10, 4, 0, 8), ELBOWS_OUT, FISTS, MOUTH_SHUT, SQUINT),
  key(0.32, pelvis(0, 0.01), bend(-10, -6, -2, -16), ARMS_UP, jaw(24), ANGRY),
  key(0.46, flying(0.6, 0.08), bend(8, 2, 0, 2), PALMS, SPLAY, jaw(16), ANGRY),
  key(0.56, landed(), bend(12, 3, 0, 4), SUMO_GUARD, SPLAY, jaw(14), ANGRY),
  snap(0.64, atFoe(0.22), pelvis(0, -0.03, 0.04), bend(18, 5, 0, 4), PALMS, SPLAY, jaw(26), ANGRY),
  key(0.78, atFoe(0.2), pelvis(0, -0.03, 0.03), bend(8, 2, 0, -8), PUSH, SPLAY, jaw(20), ANGRY),
  key(0.94, atFoe(0.04), pelvis(0, -0.035), bend(6, 2, 0, 0), ELBOWS_OUT, ANGRY),
  ...hopHome(1.1, ELBOWS_OUT, ANGRY),
  key(1.42, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.8, OPEN_EYES),
], [[0.69, 'impact']]);

/**
 * Waterfall: a surging rush upward, as if climbing a waterfall. It hops in
 * low, drops into a deep crouch under the foe, then surges up through it
 * with its arms flung up, the whole body rising off the ground and crashing
 * into it from below; it comes down heavily and hops home.
 */
export const waterfall = clip('waterfall', [
  key(0),
  key(0.22, sink(-0.06), bend(16, 5, 2, 10), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.6, 0.06), bend(18, 6, 2, 10), ARMS_BACK, MOUTH_SHUT, ANGRY),
  key(0.52, landed(1, true), sink(-0.05), bend(24, 8, 2, 12), ARMS_BACK, MOUTH_SHUT, ANGRY),
  snap(0.62, atFoe(0.42), body(0, 0.14, 0), { plantFeet: 0 }, pelvis(0, 0.02), bend(-10, -6, -2, -18), SURGE_UP, jaw(20), ANGRY),
  key(0.76, atFoe(0.44), body(0, 0.2, 0), { plantFeet: 0 }, pelvis(0, 0.02), bend(-14, -7, -2, -20), ARMS_UP, jaw(22), ANGRY),
  fall(0.94, atFoe(0.3), LAND_DEEP, bend(12, 4, 0, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, ANGRY),
  key(1.1, atFoe(0.28), LAND, bend(8, 2, 0, 0), ELBOWS_OUT, ANGRY),
  ...hopHome(1.26, ELBOWS_OUT, ANGRY),
  key(1.58, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.95, OPEN_EYES),
], [[0.67, 'impact']]);

/**
 * Iron Tail: it hops in, then spins round on the spot in a heavy hop, the
 * tail fan swinging round and down onto the foe like a steel club as its
 * back comes round to it, carries the spin on round and lands facing it
 * again; it hops home.
 */
export const ironTail = clip('iron_tail', [
  key(0),
  key(0.22, sink(-0.06), twist(18), bend(8, 2, 0, 6), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.4, flying(0.6, 0.07), twist(16), bend(6, 2, 0, 2), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.52, landed(), twist(22), bend(8, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.66, atFoe(0.04), body(0, 0.1, 0, 0, 0, 100), { plantFeet: 0 }, TUCK, bend(4, 2, 0, 0), ARMS_TUCKED, tail(20), MOUTH_SHUT, ANGRY),
  snap(0.76, atFoe(0.26), body(0, 0.1, 0, 0, 0, 180), { plantFeet: 0 }, TUCK, bend(-6, -2, 0, 0), ARMS_TUCKED, tail(-50), MOUTH_SHUT, ANGRY),
  key(0.86, atFoe(0.25), body(0, 0.09, 0, 0, 0, 196), { plantFeet: 0 }, TUCK, bend(-6, -2, 0, 0), ARMS_TUCKED, tail(-56), MOUTH_SHUT, ANGRY),
  key(0.98, atFoe(0.12), body(0, 0.05, 0, 0, 0, 290), { plantFeet: 0 }, TUCK, bend(0, 0, 0, 0), ARMS_TUCKED, tail(-20), MOUTH_SHUT, ANGRY),
  key(1.1, atFoe(0.04), body(0, 0, 0, 0, 0, 360), LAND_DEEP, bend(10, 2, 0, 2), ELBOWS_OUT, tail(5), ANGRY),
  key(1.24, atFoe(0), body(0, 0, 0, 0, 0, 360), LAND, bend(6, 2, 0, 0), ELBOWS_OUT, ANGRY),
  key(1.4, { advance: 0.5, root: { y: 0.06, yaw: 360 } }, HOP, ELBOWS_OUT, ANGRY),
  key(1.56, { advance: 0, root: { yaw: 360 } }, LAND_HOME, ELBOWS_OUT, ANGRY),
  key(1.88, { root: { yaw: 360 } }, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(2.18, { root: { yaw: 360 } }, OPEN_EYES),
], [[0.84, 'impact']]);

/**
 * Rollout (and Ice Ball, the same action): it curls up into a ball, arms
 * wrapped round its tucked knees and head down, and rolls at the foe over
 * and over along the ground, bowls into it and grinds against it, bounces
 * back rolling and uncurls at home. The ball is lowered so its middle sits
 * at the root (BALL_MID heights up): root.pitch rolls it about its middle.
 */
export const rollout = clip('rollout', [
  key(0),
  key(0.2, sink(-0.08), bend(16, 6, 2, 14), CROSSED_LOW, MOUTH_SHUT, SQUINT),
  rolling(0.34, 0, 30),
  rolling(0.5, 0.3, 220),
  rolling(0.64, 0.66, 420),
  rolling(0.74, 0.9, 560),
  snap(0.8, ...ball(1, 640, 0.45)),
  key(0.9, ...ball(1, 656, 0.46)),
  key(1.02, ...ball(0.84, 600, 0.2, 0.05)),
  rolling(1.18, 0.46, 420),
  rolling(1.34, 0.1, 190),
  rolling(1.44, 0, 90),
  key(1.58, { advance: 0, root: { pitch: 0 } }, LAND_DEEP, bend(10, 4, 2, 8), CROSSED_LOW, MOUTH_SHUT, ANGRY),
  key(1.78, pelvis(0, -0.03), bend(4, 1, 0, 0, 6, 4), ANGRY),
  key(2.1, OPEN_EYES),
], [[0.88, 'impact']]);

function SHUT_EYES(): Pose {
  return { expression: 'closed' };
}

export const BODY_CLIPS = [tackle, takeDown, doubleEdge, bodySlam, returnMove, frustration, facade, secretPower, endeavor, struggle, bideCharge, bide, waterfall, ironTail, rollout];

