// Mudkip's head-and-body moves: the charges (Tackle, Take Down, Double-Edge,
// Return, Frustration, Facade, Secret Power, Endeavor, Struggle, Bide), the
// crushes and heaves (Body Slam, Strength, Rock Smash, Stomp), Waterfall's
// surge from below, Iron Tail's spinning slap of the tail fin and Rollout's
// roll. It crouches back onto its haunches, bounds at the foe in pounces
// (all four feet off the ground, the front paws reaching), strikes it with
// its big head, its paws, its tail fin or its whole small body as it
// lands, bounces off and hops home. Head-led blows land ~0.04 s after their
// key (the head trails the body).

import type { Pose } from '../../../anim/rig';
import {
  AIRBORNE, ANGRY, COIL, DROWSY, FOCUS, FRONT_DOWN, FRONT_REACH, FRONT_STAMP, FRONT_UP, HAPPY, HURT, LAND, OPEN_EYES, RAM, REAR, SHUT,
  TUCKED, atFoe, bend, body, clip, fall, finUp, flying, front, hips, hopHome, jaw, key, landed, pawBack, pawUp, pelvis, snap, tail, twist,
} from './kit';

/** A daze: the head wobbling round after a hard knock (k: +1 / -1 the two sides). */
const daze = (k: number): Pose => bend(1, 0, 3, 7 * k, 12 * k);
/** A tremor on a held pose (moving holds). */
const tremor = (k: number): Pose => bend(0, 0, 0.8 * k, 0.8 * k, 1.2 * k);
/** Legs splayed flat out to the sides (a belly flop). */
const SPLAYED: Pose = {
  plantFeet: 0,
  plantFront: 0,
  bones: { thighL: { x: 20, z: 40 }, thighR: { x: 20, z: -40 }, shinL: { x: -10 }, shinR: { x: -10 } },
  aim: { armL: { dir: [0.62, -0.35, 0.7] }, forearmL: { dir: [0.5, -0.3, 0.81] }, armR: { dir: [-0.62, -0.35, 0.7] }, forearmR: { dir: [-0.5, -0.3, 0.81] } },
};
/** Curled into a ball: head tucked, all four legs drawn in, the tail fin wrapped round. */
const BALL: Pose = {
  plantFeet: 0,
  plantFront: 0,
  pelvis: { x: 0, y: 0.01, z: 0 },
  bones: {
    spine: { x: 28 }, neck: { x: 14 }, head: { x: 30 },
    hips: { x: -26 }, thighL: { x: -60 }, thighR: { x: -60 }, shinL: { x: 80 }, shinR: { x: 80 },
    tail: { x: -50 },
  },
  aim: { armL: { dir: [0.1, -0.2, 0.97] }, forearmL: { dir: [-0.2, -0.9, -0.38] }, armR: { dir: [-0.1, -0.2, 0.97] }, forearmR: { dir: [0.2, -0.9, -0.38] } },
};

/** How high the curled ball's middle sits above its feet (heights). */
const BALL_MID = 0.28;
/** The ball at advance a, rolled to `deg`, lunging `z` and lifted `lift` (heights): its middle at the root. */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_MID + lift, z, pitch: deg } }, BALL, { pelvis: { y: -BALL_MID } }, SHUT,
];
/** A key of the rolling ball. */
const rolling = (t: number, a: number, deg: number, z = 0, lift = 0) => key(t, ...ball(a, deg, z, lift));

/**
 * Tackle: it crouches back onto its haunches, wiggles once, then pounces in
 * one long bound and bowls into the foe crown first as it lands, bounces off
 * rocking back onto its haunches, shakes its head and hops home.
 */
export const tackle = clip('tackle', [
  key(0),
  key(0.14, COIL, ANGRY),
  key(0.24, COIL, pelvis(0.006, -0.008, -0.006), bend(1, 1, 3, 0, 4), tail(4, 10), ANGRY),
  snap(0.32, flying(0.35, 0.34, -12), bend(-6, -2, -4), finUp(10), tail(-6), ANGRY),
  key(0.44, flying(0.78, 0.3, 6), bend(6, 4, 12), tail(-12), ANGRY),
  snap(0.52, atFoe(0.14, 8), LAND, RAM(1.1), ANGRY),
  key(0.6, atFoe(0.14, 7), LAND, RAM(1.12), SHUT),
  snap(0.72, atFoe(0.02, -3), LAND, REAR(0.8), jaw(6), ANGRY),
  key(0.84, atFoe(0), LAND, daze(1), SHUT),
  key(0.96, atFoe(0), LAND, daze(-1), SHUT),
  ...hopHome(1.1, ANGRY),
  key(1.62, pelvis(0, -0.012), bend(1, 0, 2, 0, 3), tail(2, 8), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.56, 'impact']]);

/**
 * Take Down: a bull's charge. It lowers its head, scrapes the ground twice
 * with a front paw, then charges in two bounding strides and rams the foe
 * with everything, pressing through it; the recoil hurts: it rocks back
 * wincing, shakes its head and hops home.
 */
export const takeDown = clip('take_down', [
  key(0),
  key(0.14, COIL, bend(10, 6, 16), ANGRY),
  key(0.26, { plantFront: 0 }, COIL, bend(10, 6, 17), pawUp('R'), ANGRY),
  key(0.34, { plantFront: 0 }, COIL, bend(11, 6, 18), pawBack('R'), tail(22), ANGRY),
  key(0.44, { plantFront: 0 }, COIL, bend(10, 6, 17), pawUp('R'), ANGRY),
  key(0.52, { plantFront: 0 }, COIL, bend(11, 6, 18), pawBack('R'), tail(24), ANGRY),
  key(0.6, { plantFront: 1 }, COIL, pelvis(0, -0.012, -0.006), bend(12, 6, 19), FRONT_DOWN, tail(26), ANGRY),
  snap(0.68, flying(0.28, 0.28, -6), bend(8, 5, 16), tail(-4), ANGRY),
  key(0.8, landed(0.52), RAM(0.6), ANGRY),
  key(0.9, flying(0.78, 0.26, 8), bend(10, 6, 18), tail(-12), ANGRY),
  snap(0.98, atFoe(0.16, 8), LAND, RAM(1.2), ANGRY),
  key(1.08, atFoe(0.18, 8), LAND, RAM(1.22), tremor(1), SHUT),
  key(1.18, atFoe(0.16, 7), LAND, RAM(1.15), tremor(-1), SHUT),
  snap(1.3, atFoe(0.0, -4), LAND, REAR(1), jaw(8), HURT),
  key(1.42, atFoe(0), LAND, REAR(0.3), daze(1), HURT),
  key(1.54, atFoe(0), LAND, daze(-1), HURT),
  ...hopHome(1.68, ANGRY),
  key(2.2, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.5, OPEN_EYES),
], [[1.02, 'impact']]);

/**
 * Double-Edge: reckless. It wiggles its haunches like a cat about to spring,
 * tail fin lashing, then three bounding strides, faster and flatter each
 * time, and a flying dive with its whole body stretched out that crashes
 * into the foe head and chest first. The recoil throws it back onto its
 * haunches, dazed, its head swimming; it shakes it off and hops home.
 */
export const doubleEdge = clip('double_edge', [
  key(0),
  key(0.14, COIL, ANGRY),
  key(0.24, COIL, pelvis(0.012, -0.004), hips(-6), tail(22, 18), ANGRY),
  key(0.34, COIL, pelvis(-0.012, -0.004), hips(-6), tail(22, -18), ANGRY),
  key(0.44, COIL, pelvis(0.01, -0.006), hips(-7), tail(24, 14), ANGRY),
  key(0.52, flying(0.2, 0.24, -8), bend(2, 2, 8), tail(-4), ANGRY),
  key(0.62, landed(0.36), RAM(0.4), ANGRY),
  key(0.7, flying(0.5, 0.22, 2), bend(4, 3, 10), tail(-8), ANGRY),
  key(0.78, landed(0.64), RAM(0.5), ANGRY),
  key(0.9, flying(0.86, 0.2, 10), { root: { z: 0.06 } }, bend(-2, 0, 4), FRONT_REACH, tail(-16), jaw(10), ANGRY),
  snap(0.98, atFoe(0.2, 14), LAND, RAM(1.2), jaw(10), SHUT),
  key(1.08, atFoe(0.2, 12), LAND, RAM(1.2), tremor(1), jaw(8), SHUT),
  snap(1.22, atFoe(-0.04, -8), LAND, REAR(1.2), jaw(16), HURT),
  key(1.36, atFoe(-0.04, -6), LAND, REAR(1), daze(1), jaw(8), HURT),
  key(1.5, atFoe(-0.02, -2), LAND, REAR(0.5), daze(-1), jaw(4), HURT),
  key(1.64, atFoe(0), LAND, daze(1), DROWSY),
  ...hopHome(1.78, HURT),
  key(2.3, pelvis(0, -0.014), bend(1, 0, 2, 0, -4), ANGRY),
  key(2.6, OPEN_EYES),
], [[1.02, 'impact']]);

/**
 * Body Slam: a coil deep onto its haunches, a huge leap high over the foe
 * with its legs spread, and it belly-flops down on top of it, flattening it
 * with its whole body; it pushes off it, drops down in front of it and hops
 * home.
 */
export const bodySlam = clip('body_slam', [
  key(0),
  key(0.18, COIL, pelvis(0, -0.012, -0.006), ANGRY),
  key(0.32, COIL, pelvis(0, -0.022, -0.012), hips(-4), bend(4, 2, 6), tail(26), ANGRY),
  snap(0.42, flying(0.4, 0.62, -16), bend(-10, -3, -8), finUp(14), tail(10), jaw(12), ANGRY),
  key(0.56, { advance: 0.8, root: { y: 0.76, pitch: -4 } }, SPLAYED, bend(-4, -1, -2), tail(14), jaw(12), ANGRY),
  fall(0.64, { advance: 1, root: { y: 0.28, z: 0.42, pitch: 10 } }, SPLAYED, bend(2, 1, 4), tail(4), SHUT),
  key(0.76, { advance: 1, root: { y: 0.25, z: 0.45, pitch: 12 } }, SPLAYED, pelvis(0, -0.02), bend(4, 1, 6), tail(0), SHUT),
  key(0.9, { advance: 1, root: { y: 0.32, z: 0.42, pitch: 8 } }, SPLAYED, pelvis(0, -0.01), bend(2, 1, 4, 4, 4), tail(4), ANGRY),
  key(1.02, { advance: 1, root: { y: 0.26, z: 0.16, pitch: -8 } }, TUCKED, bend(-4, -1, -4), ANGRY),
  key(1.14, atFoe(0.06), LAND, ANGRY),
  ...hopHome(1.28, ANGRY),
  key(1.8, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.1, OPEN_EYES),
], [[0.75, 'impact']]);

/**
 * Return: a loyal, joyful charge. Grinning, it bounces on the spot twice,
 * then bounds in with two happy hops and bumps its forehead into the foe,
 * head tilted, and bounces home wagging its tail fin, pleased.
 */
export const returnMove = clip('return', [
  key(0),
  key(0.12, pelvis(0, -0.03, -0.01), bend(3, 1, 4), tail(8, 10), HAPPY),
  key(0.22, body(0, 0.14, 0), TUCKED, bend(-4, -1, -4), finUp(6), tail(14, -14), jaw(20), HAPPY),
  key(0.32, LAND, pelvis(0, -0.012), tail(10, 14), jaw(10), HAPPY),
  key(0.42, body(0, 0.14, 0), TUCKED, bend(-4, -1, -4), finUp(6), tail(14, -14), jaw(20), HAPPY),
  key(0.52, LAND, COIL, tail(12, 12), jaw(8), HAPPY),
  snap(0.6, flying(0.42, 0.3, -8), bend(-4, -1, -2), tail(4, -10), jaw(22), HAPPY),
  key(0.72, landed(0.62), bend(8, 3, 6), tail(6, 10), jaw(10), HAPPY),
  key(0.82, flying(0.84, 0.26, 6), bend(0, 1, 4), tail(-4, -8), jaw(16), HAPPY),
  snap(0.9, atFoe(0.14, 6), LAND, RAM(0.9), bend(0, 0, 0, 10, 16), jaw(4), HAPPY),
  key(1.0, atFoe(0.14, 5), LAND, RAM(0.92), bend(0, 0, 0, 12, 18), jaw(4), HAPPY),
  key(1.16, atFoe(0.02), LAND, REAR(0.5), tail(12, 20), jaw(20), HAPPY),
  key(1.28, atFoe(0), LAND, REAR(0.2), tail(10, -20), jaw(16), HAPPY),
  ...hopHome(1.42, HAPPY),
  key(1.94, pelvis(0, -0.01), bend(1, 0, 2, 4, 6), tail(6, 14), HAPPY),
  key(2.24, OPEN_EYES),
], [[0.94, 'impact']]);

/**
 * Frustration: a sulk. It stamps its front paws in a huff (left, right),
 * glaring, then pounces and bashes the foe with a spiteful sideways swing of
 * its head, and huffs, turning its head away.
 */
export const frustration = clip('frustration', [
  key(0),
  key(0.12, { plantFront: 0 }, pelvis(0, -0.008, -0.008), bend(-6, -1, -2), pawUp('L'), ANGRY),
  snap(0.2, { plantFront: 0 }, pelvis(0, -0.03, 0.006), bend(6, 2, 8), FRONT_DOWN, jaw(-2), ANGRY),
  key(0.32, { plantFront: 0 }, pelvis(0, -0.008, -0.008), bend(-6, -1, -2), pawUp('R'), ANGRY),
  snap(0.4, { plantFront: 0 }, pelvis(0, -0.03, 0.006), bend(6, 2, 8), FRONT_DOWN, jaw(-2), ANGRY),
  key(0.5, { plantFront: 1 }, COIL, twist(-10), bend(8, 4, 10, -14, -6), ANGRY),
  snap(0.58, flying(0.4, 0.3, -8), twist(-12), bend(0, 1, 4, -16, -8), tail(-4), ANGRY),
  key(0.7, flying(0.82, 0.28, 6), twist(-14), bend(4, 2, 8, -20, -10), tail(-8, -12), ANGRY),
  snap(0.78, atFoe(0.12, 6), LAND, twist(12), bend(8, 4, 12, 22, 14), tail(-4, 20), jaw(6), ANGRY),
  key(0.88, atFoe(0.12, 5), LAND, twist(14), bend(8, 4, 12, 24, 16), tail(-4, 22), jaw(4), ANGRY),
  key(1.04, atFoe(0.02), LAND, bend(-4, -1, -6, -18, -8), finUp(8), tail(8, -10), ANGRY),
  key(1.16, atFoe(0), LAND, bend(-3, -1, -5, -17, -8), finUp(6), tail(8, 6), SHUT),
  ...hopHome(1.3, ANGRY),
  key(1.82, pelvis(0, -0.01), bend(0, 0, 0, -8, -4), ANGRY),
  key(2.14, OPEN_EYES),
], [[0.82, 'impact']]);

/**
 * Facade: gritty, fighting on though it hurts. It hunches wincing, shakes
 * it off with a set jaw, then pounces and rams the foe with its crown,
 * holding its ground pressing into it before it hops home.
 */
export const facade = clip('facade', [
  key(0),
  key(0.16, pelvis(0, -0.03), bend(8, 4, 10, 0, 6), tail(-12), jaw(-2), HURT),
  key(0.3, pelvis(0, -0.034), bend(9, 4, 11, 0, -6), tail(-14), jaw(-2), HURT),
  key(0.42, COIL, bend(10, 5, 14), tail(20), jaw(-2), ANGRY),
  snap(0.5, flying(0.4, 0.3, -8), bend(2, 2, 8), tail(-4), ANGRY),
  key(0.62, flying(0.82, 0.28, 6), bend(8, 5, 14), tail(-10), ANGRY),
  snap(0.7, atFoe(0.14, 8), LAND, RAM(1.1), ANGRY),
  key(0.82, atFoe(0.18, 8), LAND, RAM(1.15), tremor(1), jaw(-3), ANGRY),
  key(0.94, atFoe(0.16, 7), LAND, RAM(1.12), tremor(-1), jaw(-3), ANGRY),
  key(1.08, atFoe(0.02), LAND, REAR(0.4), ANGRY),
  ...hopHome(1.2, ANGRY),
  key(1.72, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.0, OPEN_EYES),
], [[0.74, 'impact']]);

/**
 * Secret Power: a quick, scrappy butt. A short dip, one low, quick pounce,
 * a butt with the crown as it lands, and it springs straight back home in
 * one hop.
 */
export const secretPower = clip('secret_power', [
  key(0),
  key(0.1, pelvis(0, -0.03, -0.012), bend(5, 2, 8), tail(12), ANGRY),
  key(0.18, COIL, bend(7, 3, 10), ANGRY),
  key(0.26, flying(0.5, 0.2, -4), bend(4, 2, 10), ANGRY),
  snap(0.36, atFoe(0.14, 6), LAND, RAM(1), ANGRY),
  key(0.44, atFoe(0.15, 6), LAND, RAM(1.03), SHUT),
  key(0.52, atFoe(0.06, 2), LAND, RAM(0.5), SHUT),
  key(0.66, { advance: 0.5, root: { y: 0.38, pitch: -8 } }, TUCKED, bend(-4, -1, -4), ANGRY),
  key(0.8, { advance: 0 }, LAND, ANGRY),
  key(0.96, pelvis(0, -0.012), bend(1, 0, 2, 0, -4), ANGRY),
  key(1.26, OPEN_EYES),
], [[0.43, 'impact']]);

/**
 * Endeavor: desperate, all-out. Low to the ground it scrambles forward in
 * three short, skittering hops, then dives at the foe's legs and clings on,
 * front paws wrapped round it and its head pressed in; it pushes itself
 * off and hops home, panting.
 */
export const endeavor = clip('endeavor', [
  key(0),
  key(0.16, COIL, pelvis(0, -0.018), bend(10, 4, 10), jaw(8), FOCUS),
  key(0.28, flying(0.2, 0.12, 0), bend(10, 4, 10), jaw(10), ANGRY),
  key(0.36, landed(0.3), bend(12, 4, 12), jaw(10), ANGRY),
  key(0.46, flying(0.5, 0.12, 0), bend(10, 4, 10), jaw(12), ANGRY),
  key(0.54, landed(0.6), bend(12, 4, 12), jaw(12), ANGRY),
  key(0.64, flying(0.84, 0.16, 10), bend(6, 2, 6), FRONT_REACH, jaw(14), ANGRY),
  snap(0.72, atFoe(0.2, 16), { plantFeet: 1, plantFront: 0 }, pelvis(0, -0.03, 0.02), hips(8), bend(10, 6, 14), front([0, -0.3, 0.95], [0, 0.1, 0.99]), tail(-10), jaw(-2), SHUT),
  key(0.86, atFoe(0.2, 15), { plantFeet: 1, plantFront: 0 }, pelvis(0, -0.032, 0.02), hips(8), bend(10, 6, 14), tremor(1), front([0, -0.3, 0.95], [0, 0.1, 0.99]), tail(-12), jaw(-2), SHUT),
  key(1.0, atFoe(0.04), LAND, REAR(0.4), jaw(16), DROWSY),
  key(1.12, atFoe(0), LAND, bend(4, 1, 6), jaw(12), DROWSY),
  ...hopHome(1.26, DROWSY),
  key(1.78, pelvis(0, -0.02), bend(4, 1, 6), jaw(14), DROWSY),
  key(1.96, pelvis(0, -0.012), bend(2, 0, 3), jaw(8), DROWSY),
  key(2.2, OPEN_EYES),
], [[0.76, 'impact']]);

/**
 * Struggle: nothing left. Eyes heavy, it lurches at the foe in a clumsy low
 * hop, stumbles in, bumps it weakly with the side of its head, winces at
 * the recoil and wobbles home.
 */
export const struggle = clip('struggle', [
  key(0),
  key(0.18, pelvis(0, -0.03), bend(6, 2, 8, 0, 8), tail(-10), DROWSY),
  key(0.32, COIL, bend(8, 3, 10, 0, -6), DROWSY),
  key(0.46, flying(0.5, 0.18, 4), bend(4, 1, 6, 0, 10), jaw(10), ANGRY),
  key(0.58, landed(0.76), { plantFront: 0.5 }, bend(10, 4, 12, 0, -8), jaw(8), ANGRY),
  key(0.68, flying(0.92, 0.1, 6), bend(6, 2, 8, 8, 10), jaw(8), ANGRY),
  snap(0.76, atFoe(0.1, 4), LAND, bend(8, 3, 10, 18, 20), jaw(4), SHUT),
  snap(0.9, atFoe(0), LAND, REAR(0.6), jaw(10), HURT),
  key(1.04, atFoe(0), LAND, daze(1), HURT),
  ...hopHome(1.18, DROWSY),
  key(1.7, pelvis(0, -0.02), bend(3, 1, 4, 0, -6), DROWSY),
  key(2.0, OPEN_EYES),
], [[0.8, 'impact']]);

/**
 * Strength: it heaves at the foe like at a boulder. A pounce in, and it
 * rears up to plant its front paws on the foe, sinks onto its haunches to
 * load, then its hind legs drive and it shoves with paws, head and
 * shoulders in one mighty heave; it drops back down and hops home.
 */
export const strength = clip('strength', [
  key(0),
  key(0.16, COIL, bend(8, 4, 12), ANGRY),
  key(0.28, COIL, pelvis(0, -0.012, -0.008), bend(9, 4, 13), tail(22), ANGRY),
  snap(0.36, flying(0.42, 0.3, -8), bend(0, 1, 4), ANGRY),
  key(0.48, flying(0.82, 0.3, 0), bend(-6, -1, -2), FRONT_UP, ANGRY),
  key(0.58, atFoe(0.06), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.02, -0.01), hips(-6), bend(-26, -4, 4), finUp(20), front([0, 0.25, 0.97], [0, 0.3, 0.95]), tail(10), jaw(-2), SHUT),
  key(0.72, atFoe(0.02), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.0, -0.03), hips(-10), bend(-24, -4, 6), finUp(18), front([0, 0.2, 0.98], [0, 0.45, 0.89]), tail(18), jaw(-2), SHUT),
  snap(0.82, atFoe(0.28), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.03, 0.03), hips(12), bend(-18, -2, 10), finUp(12), front([0, 0.3, 0.95], [0, 0.2, 0.98]), tail(-14), jaw(8), ANGRY),
  key(0.96, atFoe(0.31), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.03, 0.034), hips(13), bend(-18, -2, 10), finUp(12), tremor(1), front([0, 0.3, 0.95], [0, 0.2, 0.98]), tail(-16), jaw(8), ANGRY),
  key(1.1, atFoe(0.06), LAND, pelvis(0, -0.02), bend(4, 1, 4), ANGRY),
  ...hopHome(1.24, ANGRY),
  key(1.76, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.05, OPEN_EYES),
], [[0.86, 'impact']]);

/**
 * Rock Smash: a hammer blow with its crown, as onto a boulder. It pounces up
 * high, draws its head back at the top, and brings its crown and fin
 * smashing down onto the foe as it drops, sinking into the blow; it hops
 * home.
 */
export const rockSmash = clip('rock_smash', [
  key(0),
  key(0.16, COIL, ANGRY),
  key(0.28, COIL, pelvis(0, -0.014, -0.01), bend(10, 4, 12), tail(22), ANGRY),
  snap(0.38, flying(0.5, 0.5, -14), bend(-10, -3, -12), finUp(20), tail(14), jaw(10), ANGRY),
  key(0.5, flying(0.86, 0.56, -8), bend(-16, -4, -18), finUp(30), tail(18), jaw(6), ANGRY),
  snap(0.58, { advance: 1, root: { y: 0.22, z: 0.14, pitch: 18 } }, AIRBORNE, bend(16, 12, 32), tail(-24), jaw(-2), ANGRY),
  key(0.68, atFoe(0.12, 10), LAND, pelvis(0, -0.03), bend(14, 10, 26), tail(-20), SHUT),
  key(0.8, atFoe(0.1, 8), LAND, pelvis(0, -0.034), bend(15, 10, 27), tail(-22), SHUT),
  key(0.94, atFoe(0.02), LAND, REAR(0.4), ANGRY),
  ...hopHome(1.06, ANGRY),
  key(1.58, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.62, 'impact']]);

/**
 * Stomp: it bounds in, rears up tall on its hind legs with its front paws
 * raised high, and stamps them down onto the foe with its whole weight,
 * grinds them in, then drops back and hops home.
 */
export const stomp = clip('stomp', [
  key(0),
  key(0.16, COIL, ANGRY),
  snap(0.26, flying(0.4, 0.3, -8), bend(0, 1, 4), ANGRY),
  key(0.38, flying(0.8, 0.28, 4), bend(4, 2, 6), ANGRY),
  key(0.46, landed(1), COIL, ANGRY),
  key(0.6, atFoe(-0.02), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.05, -0.02), hips(-12), bend(-34, -4, 6), finUp(26), FRONT_UP, tail(20), jaw(14), ANGRY),
  key(0.7, atFoe(-0.02), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.056, -0.022), hips(-13), bend(-36, -4, 6), finUp(28), front([0, 0.3, 0.95], [0, -0.2, 0.98]), tail(22), jaw(16), ANGRY),
  fall(0.82, atFoe(0.26, 6), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.01, 0.02), hips(8), bend(4, 4, 12), FRONT_STAMP, tail(-10), jaw(-2), ANGRY),
  key(0.92, atFoe(0.26, 6), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.004, 0.02), hips(8), bend(5, 4, 13, 6, 4), FRONT_STAMP, tail(-12, 8), jaw(-2), SHUT),
  key(1.02, atFoe(0.25, 6), { plantFeet: 1, plantFront: 0 }, pelvis(0, 0.004, 0.02), hips(8), bend(5, 4, 13, -6, -4), FRONT_STAMP, tail(-12, -8), jaw(-2), ANGRY),
  key(1.16, atFoe(0.02), LAND, REAR(0.3), ANGRY),
  ...hopHome(1.28, ANGRY),
  key(1.8, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.1, OPEN_EYES),
], [[0.9, 'impact']]);

/**
 * Waterfall: a surge upward, like a fish leaping a waterfall. It bounds in
 * low, drops into a deep crouch right under the foe, then launches straight
 * up through it nose first, its whole body rising off the ground and
 * crashing into it from below; it comes down and hops home.
 */
export const waterfall = clip('waterfall', [
  key(0),
  key(0.14, COIL, ANGRY),
  snap(0.24, flying(0.45, 0.24, -6), bend(2, 2, 8), ANGRY),
  key(0.36, flying(0.86, 0.2, 6), bend(6, 3, 10), ANGRY),
  key(0.44, landed(1), COIL, pelvis(0, -0.02, 0.01), bend(4, 2, 6), tail(24), ANGRY),
  key(0.54, atFoe(0.2), COIL, pelvis(0, -0.03, 0.012), bend(6, 3, 8), tail(26), ANGRY),
  snap(0.62, { advance: 1, root: { y: 0.4, z: 0.58, pitch: -34 } }, AIRBORNE, bend(-8, -2, -6), finUp(12), tail(-28), jaw(14), ANGRY),
  key(0.74, { advance: 1, root: { y: 0.54, z: 0.52, pitch: -44 } }, AIRBORNE, bend(-10, -2, -8), finUp(14), tail(-32), jaw(16), ANGRY),
  fall(0.9, { advance: 1, root: { y: 0.14, z: 0.3, pitch: -10 } }, TUCKED, bend(-2, 0, -2), tail(4), ANGRY),
  key(1.02, atFoe(0.26), LAND, ANGRY),
  ...hopHome(1.14, ANGRY),
  key(1.66, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.95, OPEN_EYES),
], [[0.66, 'impact']]);

/**
 * Iron Tail: it bounds in, then springs up spinning round in the air so its
 * big tail fin, hard as steel, swings round and slams down on the foe as its
 * back comes round to it; it carries the spin on round, lands facing it
 * again and hops home.
 */
export const ironTail = clip('iron_tail', [
  key(0),
  key(0.14, COIL, twist(10), tail(20, 20), ANGRY),
  snap(0.24, flying(0.45, 0.26, -6), twist(8), bend(2, 2, 6), tail(10, 10), ANGRY),
  key(0.36, flying(0.84, 0.24, 4), twist(10), bend(4, 2, 8), tail(6, 14), ANGRY),
  key(0.44, landed(0.96), COIL, twist(14), tail(20, 24), ANGRY),
  key(0.54, { advance: 1, root: { y: 0.24, z: 0.14, yaw: 90 } }, TUCKED, bend(-2, 0, 0), tail(40, 30), ANGRY),
  snap(0.62, { advance: 1, root: { y: 0.3, z: 0.34, yaw: 180 } }, TUCKED, hips(-12), bend(-4, 0, -2), tail(-40, 0), ANGRY),
  key(0.7, { advance: 1, root: { y: 0.28, z: 0.33, yaw: 194 } }, TUCKED, hips(-13), bend(-4, 0, -2), tail(-46, -4), ANGRY),
  key(0.8, { advance: 1, root: { y: 0.22, z: 0.2, yaw: 280 } }, TUCKED, hips(-6), bend(0, 0, 0), tail(-20, -20), ANGRY),
  key(0.9, { advance: 1, root: { z: 0.12, yaw: 360 } }, LAND, tail(10), ANGRY),
  key(1.02, { advance: 1, root: { z: 0.11, yaw: 360 } }, LAND, pelvis(0, -0.02), bend(3, 1, 4), tail(4), ANGRY),
  key(1.14, { advance: 0.75, root: { y: 0.34, pitch: -6, yaw: 360 } }, TUCKED, ANGRY),
  key(1.26, { advance: 0.5, root: { yaw: 360 } }, LAND, ANGRY),
  key(1.38, { advance: 0.25, root: { y: 0.24, pitch: -4, yaw: 360 } }, TUCKED, ANGRY),
  key(1.5, { advance: 0, root: { yaw: 360 } }, LAND, ANGRY),
  key(1.72, { root: { yaw: 360 } }, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(2.03, { root: { yaw: 360 } }, OPEN_EYES),
], [[0.69, 'impact']]);

/**
 * Rollout (and Ice Ball, the same action): it curls up into a ball, head
 * tucked and legs drawn in, and rolls at the foe over and over, bowls into
 * it and grinds against it, rolls back home and uncurls with a shake. The
 * ball is lowered so its middle sits at the root (BALL_MID heights up):
 * root.pitch rolls it about its middle.
 */
export const rollout = clip('rollout', [
  key(0),
  key(0.16, COIL, bend(10, 5, 14), tail(-10), SHUT),
  rolling(0.3, 0, 30),
  rolling(0.44, 0.3, 250),
  rolling(0.56, 0.64, 470),
  rolling(0.66, 0.9, 640),
  snap(0.72, ...ball(1, 720, 0.44)),
  key(0.81, ...ball(1, 736, 0.45)),
  key(0.92, ...ball(0.84, 690, 0.2, 0.06)),
  rolling(1.06, 0.5, 480),
  rolling(1.2, 0.16, 250),
  rolling(1.32, 0, 100),
  key(1.46, LAND, bend(6, 2, 8), tail(6), ANGRY),
  key(1.58, LAND, bend(1, 0, 2, 0, 10), tail(0, 12), SHUT),
  key(1.7, pelvis(0, -0.01), bend(1, 0, 2, 0, -10), tail(0, -12), SHUT),
  key(1.96, OPEN_EYES),
], [[0.79, 'impact']]);

/**
 * Bide, the first turn: it hunkers down and stores up the blows, eyes
 * squeezed shut and its tail fin stiff, trembling harder and harder with
 * the energy (charge), then eases.
 */
export const bideCharge = clip('bide_charge', [
  key(0),
  key(0.12, pelvis(0, -0.034, -0.01), bend(6, 4, 12), tail(18), SHUT),
  key(0.22, pelvis(0, -0.041, -0.012), bend(7, 4, 13, 0, 2), tail(20, 5), SHUT),
  key(0.32, pelvis(0, -0.044, -0.012), bend(7, 4, 13, 0, -3), tail(20, -5), SHUT),
  key(0.42, pelvis(0, -0.046, -0.013), bend(7.5, 4, 14, 0, 4), tail(21, 6), SHUT),
  key(0.52, pelvis(0, -0.047, -0.013), bend(7.5, 4, 14, 0, -4), tail(21, -6), SHUT),
  key(0.62, pelvis(0, -0.048, -0.014), bend(8, 4, 15, 0, 5), tail(22, 7), SHUT),
  key(0.72, pelvis(0, -0.048, -0.014), bend(8, 4, 15, 0, -5), tail(22, -7), SHUT),
  key(0.9, pelvis(0, -0.02), bend(3, 1, 5), tail(8), ANGRY),
  key(1.2, OPEN_EYES),
], [[0.16, 'charge']]);

/**
 * Bide, unleashed: the stored energy bursts out. Still quivering with it,
 * it launches itself at the foe in one explosive, flat pounce and rams it
 * with everything it took, pressing through it, bounces off and hops home.
 */
export const bide = clip('bide', [
  key(0),
  key(0.12, COIL, pelvis(0, -0.01, -0.006), bend(8, 4, 12), tail(20), SHUT),
  key(0.22, COIL, pelvis(0.004, -0.016, -0.008), bend(9, 4, 13, 0, 3), tail(22, 8), SHUT),
  key(0.32, COIL, pelvis(-0.004, -0.02, -0.01), bend(9.5, 4, 13.5, 0, -3), tail(23, -8), ANGRY),
  snap(0.4, flying(0.5, 0.22, 4), hips(8), bend(8, 5, 14), tail(-14), jaw(-2), ANGRY),
  key(0.5, flying(0.88, 0.16, 8), hips(10), bend(10, 6, 16), tail(-18), jaw(-2), ANGRY),
  snap(0.56, atFoe(0.2, 8), LAND, RAM(1.25), jaw(6), ANGRY),
  key(0.66, atFoe(0.22, 8), LAND, RAM(1.3), jaw(6), SHUT),
  key(0.78, atFoe(0.2, 7), LAND, RAM(1.25), bend(0, 0, 0.8, 0.8, 1.2), jaw(4), SHUT),
  snap(0.9, atFoe(0.02), LAND, REAR(0.8), jaw(10), ANGRY),
  key(1.02, atFoe(0), LAND, REAR(0.2), ANGRY),
  ...hopHome(1.14, ANGRY),
  key(1.66, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.95, OPEN_EYES),
], [[0.6, 'impact']]);

export const BODY_CLIPS = [
  tackle, takeDown, doubleEdge, bodySlam, returnMove, frustration, facade, secretPower, endeavor, struggle, strength, rockSmash, stomp,
  waterfall, ironTail, rollout, bideCharge, bide,
];
