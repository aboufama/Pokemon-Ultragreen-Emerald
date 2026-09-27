// Blaziken's beak and whole-body moves: jabs, dashes, charges, heaves, a
// belly-flop, a toss and a burrow. At advance 1 its front stops 0.15 of its
// height short of the foe's; these throw the body into the foe (a step in,
// or a leap) so the beak, the shoulder or the chest lands on it.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_BACK, ARMS_SPREAD_UP, ARRIVE, BLADE_HAND, CHAMBER, DIG_ARMS, DROWSY, ELBOWS_BACK, FISTS, FOLDED, GRIP, GUARD, HAPPY, HEAVE, HOP,
  HURT, LAND, LAND_DEEP, LIMP, OPEN_EYES, PUSH, REACH, RISING_KNEE, SHUT, SLAM_DOWN, SPLAY, STRIDE, TUCK, TUCK_HIGH,
  arms, armR, at, bend, fall, flames, hopHome, jaw, key, leap, lunge, legR, mirror, pelvis, root, snap, twist, stepIn,
} from './kit';

/**
 * Peck: the beak is the weapon. The head cocks back, a leap in, then the
 * neck and head drive the beak down into the foe with the arms swept back
 * and the body lunging behind it; the head rebounds and it hops home.
 */
export const peck: Clip = {
  name: 'peck',
  duration: 1.3,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), bend(-4, -6, -14, -20), GUARD, ANGRY),
    key(0.26, leap(0.6, 0.07), bend(4, -4, -14, -20), GUARD, ANGRY),
    // Land in front of the foe and coil: the head further back, the arms swept back.
    key(0.36, ARRIVE, bend(0, -8, -18, -24), ARMS_BACK, ANGRY),
    // The jab: spine, neck and head pitch forward, the body lunges, the beak leads.
    snap(0.43, at(1), stepIn(0.2), pelvis(0, -0.04, 0.02), bend(26, 16, 24, 18), ARMS_BACK, ANGRY),
    key(0.53, at(1), stepIn(0.21), pelvis(0, -0.041, 0.021), bend(27, 16, 25, 18), ARMS_BACK, ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.68, at(1), stepIn(0.08), pelvis(0, -0.035), bend(14, 6, 2, -2), ARMS_BACK, ANGRY),
    key(0.82, at(1), pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY),
    ...hopHome(0.96, GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  // The head trails the spine (overlap): the beak lands a little after the key.
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Quick Attack: a blur. Barely a flick of a crouch, a streaking dash low
 * across the field with the right shoulder leading and the arms swept back,
 * a glancing hit, a bounce off and back home.
 */
export const quick_attack: Clip = {
  name: 'quick_attack',
  duration: 1.05,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), twist(-12), bend(22, 0, 0, -10, 8), ARMS_BACK, ANGRY),
    // The dash: low and fast.
    key(0.17, at(0.72), root({ y: 0.03 }), STRIDE, twist(-22), bend(34, 0, 0, -16, 14), ARMS_BACK, ANGRY),
    // The body slams in shoulder first.
    snap(0.22, at(1), root({ y: 0.02 }), lunge(0.44), STRIDE, twist(-26), bend(30, 0, 0, -14, 14), ARMS_BACK, ANGRY),
    key(0.3, at(1), root({ y: 0.02 }), lunge(0.45), STRIDE, twist(-26), bend(29, 0, 0, -14, 14), ARMS_BACK, ANGRY),
    // Bounces off.
    key(0.42, at(0.78), root({ y: 0.07 }), lunge(0.1), HOP, twist(-6), bend(6, 0, 0, -6), GUARD, ANGRY),
    key(0.56, at(0.4), root({ y: 0.05 }), HOP, GUARD, ANGRY),
    key(0.7, at(0), LAND, GUARD, ANGRY),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.28, name: 'impact' }],
};

/**
 * Double-Edge: a reckless all-out charge. A deep coil, two pounding strides
 * and a headlong dive that crashes shoulder first into the foe; it recoils
 * hurt, staggering back with a wince, shakes it off and hops home.
 */
export const double_edge: Clip = {
  name: 'double_edge',
  duration: 1.95,
  keys: [
    key(0),
    // Coils deep, head down, flames catching.
    key(0.2, pelvis(0, -0.08), twist(-10), bend(28, 4, 0, -12, 8), ARMS_BACK, flames(0.4), ANGRY),
    // Two pounding strides.
    key(0.36, at(0.3), root({ y: 0.05 }), STRIDE, twist(-14), bend(30, 4, 0, -14, 10), ARMS_BACK, flames(0.6), ANGRY),
    key(0.5, at(0.64), root({ y: 0.06 }), mirror(STRIDE), twist(-16), bend(32, 4, 0, -14, 10), ARMS_BACK, flames(0.8), ANGRY),
    // The dive.
    key(0.6, at(0.9), root({ y: 0.05 }), lunge(0.1), TUCK, twist(-22), bend(40, 8, 0, -16, 12), ARMS_BACK, flames(1), ANGRY),
    // The crash: the whole body into the foe.
    snap(0.66, at(1), root({ y: 0.02 }), lunge(0.5), TUCK, twist(-26), bend(38, 8, 0, -14, 12), ARMS_BACK, flames(1), ANGRY),
    key(0.74, at(1), root({ y: 0.02 }), lunge(0.5), TUCK, twist(-26), bend(37, 8, 0, -14, 12), ARMS_BACK, flames(1), ANGRY),
    // Recoil: knocked back hurt.
    key(0.92, at(0.86), root({ y: 0.06 }), lunge(0.06), HOP, bend(-10, -6, -4, -16), arms([[-0.75, -0.3, 0.58], [-0.3, 0.2, 0.93]], [[0.75, -0.45, -0.48], [0.4, 0.1, 0.9]]), flames(0.6), HURT),
    // Stagger: lands off balance, wincing.
    key(1.1, at(0.8), LAND, root({ roll: -5 }), pelvis(0, -0.06), bend(14, 6, 4, 8, 0, 6), LIMP, flames(0.4), HURT),
    key(1.28, at(0.8), root({ roll: 3 }), pelvis(0, -0.045), bend(10, 4, 2, 4, 8, -4), LIMP, flames(0.3), HURT),
    // Shakes it off.
    key(1.42, at(0.8), pelvis(0, -0.035), bend(10, 2, 0, -2, -6), GUARD, flames(0.2), ANGRY),
    key(1.56, at(0.4), root({ y: 0.06 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.69, at(0), LAND, GUARD, ANGRY),
    key(1.95, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.71, name: 'impact' }],
};

/**
 * Strength: it plants itself and heaves. A leap in, both hands set on the
 * foe low and wide, then the legs drive and both arms shove it with
 * enormous power, a shout; it pushes through and straightens.
 */
export const strength: Clip = {
  name: 'strength',
  duration: 1.75,
  keys: [
    key(0),
    // Draws both open hands back at the chest.
    key(0.18, pelvis(0, -0.05), bend(14, 4, 0, -8), ELBOWS_BACK, BLADE_HAND, ANGRY),
    key(0.32, leap(0.55, 0.07), bend(10, 4, 0, -8), ELBOWS_BACK, BLADE_HAND, ANGRY),
    key(0.44, ARRIVE, pelvis(0, -0.02), bend(16, 4, 0, -8), ELBOWS_BACK, BLADE_HAND, ANGRY),
    // Sets the hands on it, sinking low and wide.
    key(0.54, at(1), stepIn(0.18), pelvis(0, -0.08), bend(22, 6, 0, -8), REACH, BLADE_HAND, ANGRY),
    // The heave: the legs drive, both arms shove.
    snap(0.64, at(1), stepIn(0.3), pelvis(0, -0.06, 0.03), bend(26, 8, 0, -8), PUSH, BLADE_HAND, jaw(24), flames(0.8), ANGRY),
    key(0.76, at(1), stepIn(0.32), pelvis(0, -0.058, 0.032), bend(27, 8, 0, -8), PUSH, BLADE_HAND, jaw(20), flames(0.9), ANGRY),
    // Pushes on through.
    key(0.92, at(1), stepIn(0.3), pelvis(0, -0.055, 0.03), bend(24, 8, 0, -6), PUSH, BLADE_HAND, jaw(8), flames(0.7), ANGRY),
    key(1.1, at(1), stepIn(0.06), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, flames(0.4), ANGRY),
    ...hopHome(1.24, GUARD, flames(0.2), ANGRY),
    key(1.75, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'impact' }],
};

/**
 * Body Slam: a deep coil, a leap high over the foe and a belly-flop that
 * crushes down on it with the whole weight, arms spread; it rolls off, gets
 * up and hops home.
 */
export const body_slam: Clip = {
  name: 'body_slam',
  duration: 1.85,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.085), bend(22, 4, 0, -12), ELBOWS_BACK, ANGRY),
    // Up, high.
    key(0.42, leap(0.6, 0.3), TUCK_HIGH, bend(0, 0, 0, -12), ARMS_SPREAD_UP, ANGRY),
    // Over the foe, tipping forward.
    key(0.6, at(0.95), root({ y: 0.34, pitch: 30 }), lunge(0.1), TUCK_HIGH, bend(-4, -2, 0, -14), ARMS_SPREAD_UP, ANGRY),
    // The belly-flop: down on it with everything.
    fall(0.7, at(1), root({ y: 0.1, pitch: 58 }), lunge(0.22), TUCK, bend(-8, -4, 0, -24), arms([[-0.95, -0.2, 0.2], [-0.8, -0.3, 0.5]], [[0.95, -0.2, 0.2], [0.8, -0.3, 0.5]]), ANGRY),
    key(0.8, at(1), root({ y: 0.09, pitch: 56 }), lunge(0.23), TUCK, bend(-8, -4, 0, -24), arms([[-0.95, -0.25, 0.2], [-0.8, -0.35, 0.48]], [[0.95, -0.25, 0.2], [0.8, -0.35, 0.48]]), ANGRY),
    // Crushing it a moment.
    key(0.94, at(1), root({ y: 0.08, pitch: 52 }), lunge(0.22), TUCK, bend(-6, -4, 0, -22), arms([[-0.95, -0.28, 0.16], [-0.8, -0.38, 0.46]], [[0.95, -0.28, 0.16], [0.8, -0.38, 0.46]]), ANGRY),
    // Rolls off and lands in a crouch beside it.
    key(1.1, at(0.92), root({ x: -0.1, y: 0.04, pitch: 10 }), HOP, bend(16, 4, 0, -6), GUARD, ANGRY),
    key(1.24, at(0.9), root({ x: -0.1 }), LAND_DEEP, GUARD, ANGRY),
    key(1.38, at(0.9), root({ x: -0.08 }), pelvis(0, -0.04), bend(12, 2, 0, -2), GUARD, ANGRY),
    key(1.52, at(0.45), root({ x: -0.04, y: 0.065 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.65, at(0), LAND, GUARD, ANGRY),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/**
 * Return: a joyful, loyal charge. A happy bounce, a bounding leap and a
 * strong full-body hit with the shoulder, then a pleased bounce back and a
 * happy hop home.
 */
export const return_: Clip = {
  name: 'return',
  duration: 1.6,
  keys: [
    key(0),
    // A happy bounce, arms swinging back.
    key(0.14, pelvis(0, -0.055), bend(12, 2, 0, -6), ARMS_BACK, HAPPY),
    // A big bounding leap.
    key(0.3, leap(0.5, 0.16), TUCK_HIGH, bend(4, 0, 0, -8), ARMS_SPREAD_UP, HAPPY),
    key(0.44, at(0.88), root({ y: 0.1 }), TUCK, twist(-14), bend(20, 2, 0, -10, 8), ARMS_BACK, ANGRY),
    // The hit: the whole body behind the shoulder.
    snap(0.5, at(1), root({ y: 0.02 }), lunge(0.49), TUCK, twist(-24), bend(26, 2, 0, -12, 12), ARMS_BACK, ANGRY),
    key(0.58, at(1), root({ y: 0.02 }), lunge(0.5), TUCK, twist(-24), bend(25, 2, 0, -12, 12), ARMS_BACK, ANGRY),
    // Bounces back, pleased.
    key(0.7, at(0.84), root({ y: 0.07 }), lunge(0.08), HOP, bend(0, -2, 0, -8), ARMS_SPREAD_UP, HAPPY),
    key(0.84, at(0.8), LAND, bend(6, 0, 0, -8, 0, 8), GUARD, HAPPY),
    key(0.98, at(0.8), pelvis(0, -0.02), bend(4, 0, 0, -6, 0, -6), GUARD, HAPPY),
    key(1.12, at(0.4), root({ y: 0.07 }), HOP, bend(6, 0, 0, -4), GUARD, HAPPY),
    key(1.25, at(0), LAND, GUARD, HAPPY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'impact' }],
};

/**
 * Frustration: an angry, sulky stamp, a charge and a spiteful forearm bash
 * into the foe; then a huff, its head turned away and its arms folded, on
 * the way home.
 */
export const frustration: Clip = {
  name: 'frustration',
  duration: 1.7,
  keys: [
    key(0),
    // A sulky stamp: the right foot up...
    key(0.12, { plantRight: 0 }, legR([-0.25, -0.3, 0.92], [-0.12, -0.95, 0.28]), pelvis(-0.01, -0.02), bend(10, 2, 0, 4), FISTS, CHAMBER, ANGRY),
    // ...and down, hard.
    snap(0.2, pelvis(0, -0.055), bend(18, 4, 0, 8, 8), FISTS, CHAMBER, ANGRY),
    // The charge.
    key(0.34, leap(0.6, 0.05), STRIDE, twist(16), bend(24, 2, 0, -8, -8), FISTS, CHAMBER, ANGRY),
    key(0.44, at(0.95), root({ y: 0.02 }), STRIDE, twist(20), bend(26, 2, 0, -8, -8), FISTS, armR([-0.7, 0.2, -0.68], [0.3, 0.1, 0.95]), CHAMBER, ANGRY),
    // The spiteful bash: the right forearm swung across into it.
    snap(0.5, at(1), stepIn(0.34), LAND, twist(-22, 4), bend(22, 4, 0, -6, 10), FISTS, armR([-0.3, -0.02, 0.95], [0.88, -0.05, 0.47]), jaw(12), ANGRY),
    key(0.6, at(1), stepIn(0.35), LAND, twist(-26, 4), bend(22, 4, 0, -6, 11), FISTS, armR([-0.12, -0.05, 0.99], [0.9, -0.1, 0.42]), jaw(8), ANGRY),
    // A huff: head turned away, arms folded.
    key(0.76, at(1), stepIn(0.12), pelvis(0, -0.03), bend(4, 0, 0, -10, 24, 6), FOLDED, jaw(10), SHUT),
    key(0.94, at(1), stepIn(0.06), pelvis(0, -0.028), bend(3, 0, 0, -10, 26, 6), FOLDED, jaw(2), SHUT),
    key(1.1, at(0.45), root({ y: 0.06 }), HOP, bend(4, 0, 0, -8, 14, 3), FOLDED, ANGRY),
    key(1.23, at(0), LAND, bend(0, 0, 0, -4, 8), FOLDED, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/**
 * Facade: a gritty, determined charge. It winces (it's hurting), grits its
 * teeth, then dashes in with its forearms up like a battering ram and drives
 * through the foe.
 */
export const facade: Clip = {
  name: 'facade',
  duration: 1.55,
  keys: [
    key(0),
    // A wince: it hurts.
    key(0.14, pelvis(0, -0.03), bend(14, 6, 4, 10, 0, 6), LIMP, HURT),
    // Grits its teeth and sets itself.
    key(0.28, pelvis(0, -0.06), twist(10), bend(22, 4, 0, -10, -6), FISTS, GUARD, ANGRY),
    // The dash.
    key(0.4, leap(0.62, 0.04), STRIDE, twist(12), bend(28, 4, 0, -12, -8), FISTS, GUARD, ANGRY),
    // Drives through with the forearms up.
    snap(0.47, at(1), root({ y: 0.02 }), lunge(0.4), STRIDE, twist(14), bend(26, 4, 0, -12, -8), FISTS, arms([[-0.3, -0.35, 0.89], [0.4, 0.5, 0.77]], [[0.3, -0.38, 0.88], [-0.4, 0.5, 0.77]]), ANGRY),
    key(0.56, at(1), root({ y: 0.02 }), lunge(0.42), STRIDE, twist(14), bend(25, 4, 0, -12, -8), FISTS, arms([[-0.3, -0.3, 0.9], [0.4, 0.52, 0.75]], [[0.3, -0.33, 0.9], [-0.4, 0.52, 0.75]]), ANGRY),
    key(0.68, at(1), stepIn(0.18), LAND, twist(6), bend(18, 4, 0, -8, -4), FISTS, GUARD, ANGRY),
    key(0.84, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.98, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

/**
 * Secret Power: a quick, scrappy strike from the grass. A low dart in, then
 * it grabs at the foe and drives a knee up into its middle.
 */
export const secret_power: Clip = {
  name: 'secret_power',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.055), bend(22, 2, 0, -10), GUARD, ANGRY),
    key(0.24, leap(0.6, 0.05), bend(20, 2, 0, -10), GUARD, ANGRY),
    key(0.34, ARRIVE, stepIn(0.1), bend(16, 2, 0, -8), REACH, ANGRY),
    // The knee: the hands pull the foe down onto it.
    snap(0.4, at(1), lunge(0.24), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.42, 0.9], [-0.05, -0.9, 0.42]), pelvis(0.01, -0.02, 0.02), bend(10, 4, 0, -6), GRIP, ANGRY),
    key(0.49, at(1), lunge(0.25), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.44, 0.89], [-0.05, -0.88, 0.47]), pelvis(0.01, -0.021, 0.021), bend(11, 4, 0, -6), GRIP, ANGRY),
    key(0.6, at(1), stepIn(0.1), LAND, bend(12, 2, 0, -4), GUARD, ANGRY),
    key(0.74, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.88, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'impact' }],
};

/** Arms flailing: the right one down and across, the left up (and the mirror). */
const FLAIL_A: Pose = arms([[-0.6, 0.3, 0.74], [0.3, 0.7, 0.65]], [[0.7, -0.4, 0.59], [0.2, -0.6, 0.77]]);
const FLAIL_B: Pose = mirror(FLAIL_A);

/**
 * Reversal: desperate and wild. A leap in, then it flails at the foe, arms
 * whirling in turn and a knee kicking up, a flurry that lands as one blow;
 * it backs off panting and hops home.
 */
export const reversal: Clip = {
  name: 'reversal',
  duration: 1.55,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.05), bend(18, 6, 2, 4), LIMP, HURT),
    key(0.26, leap(0.6, 0.07), bend(12, 2, 0, -6), FLAIL_A, SPLAY, ANGRY),
    key(0.36, ARRIVE, bend(14, 2, 0, -8), FLAIL_B, SPLAY, ANGRY),
    // The flurry.
    key(0.43, at(1), stepIn(0.12), twist(10), bend(16, 4, 0, -6, -5), FLAIL_A, SPLAY, ANGRY),
    key(0.51, at(1), stepIn(0.16), twist(-10), bend(18, 4, 0, -6, 5), FLAIL_B, SPLAY, ANGRY),
    key(0.59, at(1), lunge(0.24), twist(9), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.3, 0.95], [-0.05, -0.8, 0.6]), bend(18, 6, 0, -6, -5), FLAIL_A, SPLAY, jaw(18), ANGRY),
    key(0.68, at(1), lunge(0.24), twist(-9), { plantLeft: 1, plantRight: 0 }, legR([-0.1, 0.24, 0.97], [-0.05, -0.82, 0.57]), bend(18, 6, 0, -6, 5), FLAIL_B, SPLAY, jaw(14), ANGRY),
    key(0.77, at(1), stepIn(0.18), twist(8), bend(16, 4, 0, -6, -4), FLAIL_A, SPLAY, jaw(10), ANGRY),
    // Backs off, panting.
    key(0.9, at(1), stepIn(0.04), pelvis(0, -0.05), bend(18, 6, 2, 4), LIMP, jaw(12), HURT),
    key(1.02, at(1), pelvis(0, -0.045), bend(15, 5, 2, 2), GUARD, jaw(4), ANGRY),
    ...hopHome(1.14, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.65, name: 'impact' }],
};

/**
 * Struggle: worn out, it sways, stumbles in with a weak hop and flops into
 * the foe in a clumsy, flailing lunge; the recoil makes it wince, and it
 * hobbles home.
 */
export const struggle: Clip = {
  name: 'struggle',
  duration: 1.6,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.04), root({ roll: 4 }), bend(16, 6, 4, 10, 0, 6), LIMP, DROWSY),
    // A weak hop in.
    key(0.34, leap(0.55, 0.04), bend(18, 6, 2, 6), LIMP, DROWSY),
    key(0.46, ARRIVE, root({ roll: -5 }), bend(20, 6, 2, 6, 0, -5), LIMP, DROWSY),
    // A stumbling hop forward...
    key(0.52, at(1), root({ y: 0.04, pitch: 5, roll: 2 }), lunge(0.24), HOP, bend(22, 6, 2, 0), arms([[-0.3, -0.35, 0.89], [-0.1, -0.4, 0.91]], [[0.4, -0.5, 0.77], [0.2, -0.6, 0.77]]), DROWSY),
    // ...and it flops into the foe, arms flung forward.
    snap(0.58, at(1), root({ pitch: 10, roll: 4 }), stepIn(0.42), pelvis(0, -0.06, 0.02), bend(26, 8, 4, -4), arms([[-0.3, -0.2, 0.93], [-0.1, -0.3, 0.95]], [[0.4, -0.45, 0.8], [0.2, -0.55, 0.81]]), ANGRY),
    key(0.68, at(1), root({ pitch: 11, roll: 4 }), stepIn(0.43), pelvis(0, -0.062, 0.021), bend(27, 8, 4, -4), arms([[-0.3, -0.26, 0.92], [-0.1, -0.36, 0.93]], [[0.4, -0.5, 0.77], [0.2, -0.6, 0.77]]), ANGRY),
    // The recoil: a wince, staggering back.
    key(0.84, at(0.9), root({ y: 0.04 }), lunge(0.06), HOP, bend(-6, -4, -2, -10, 0, 6), arms([[-0.75, -0.3, 0.58], [-0.3, 0.2, 0.93]], [[0.75, -0.45, -0.48], [0.4, 0.1, 0.9]]), HURT),
    key(0.98, at(0.86), LAND, root({ roll: -4 }), pelvis(0, -0.06), bend(18, 6, 4, 8, 0, -6), LIMP, HURT),
    key(1.12, at(0.86), root({ roll: 2 }), pelvis(0, -0.05), bend(18, 6, 4, 8, 0, 4), LIMP, DROWSY),
    key(1.26, at(0.42), root({ y: 0.05 }), HOP, bend(12, 4, 2, 4), LIMP, DROWSY),
    key(1.39, at(0), LAND, bend(8, 2, 0, 2), LIMP, DROWSY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'impact' }],
};

/**
 * Seismic Toss: it rushes in and seizes the foe (grab), sinks with it, then
 * springs up and back toward mid-field, heaving it up in front and spinning
 * round with it in the air, and slams it down into the ground (impact: the
 * foe drops there, lies a moment and hops back to its place). It lands deep,
 * watches, and hops home. Hands trail the hips by 0.08 s.
 */
export const seismic_toss: Clip = {
  name: 'seismic_toss',
  duration: 2.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.05), bend(20, 4, 0, -10), ELBOWS_BACK, ANGRY),
    // Rushes in, arms reaching.
    key(0.3, leap(0.65, 0.06), bend(22, 4, 0, -12), REACH, ANGRY),
    // Seizes it: the hands on the foe, then locked on low.
    key(0.4, ARRIVE, stepIn(0.18), bend(18, 4, 0, -10), REACH, ANGRY),
    key(0.52, at(1), stepIn(0.18), pelvis(0, -0.07), bend(24, 6, 0, -12), GRIP, FISTS, ANGRY),
    // Loads: sinks deeper with it.
    key(0.64, at(1), stepIn(0.16), pelvis(0, -0.095), bend(20, 6, 0, -14), GRIP, FISTS, flames(0.6), ANGRY),
    // Springs up and back, heaving it up in front, spinning round.
    key(0.8, at(0.88), root({ y: 0.22, yaw: 60 }), lunge(0.1), HOP, pelvis(0, 0.02), bend(-10, -8, -4, -16), HEAVE, FISTS, flames(1), ANGRY),
    key(0.96, at(0.72), root({ y: 0.3, yaw: 220 }), HOP, pelvis(0, 0.02), bend(-12, -8, -4, -18), HEAVE, FISTS, flames(1), ANGRY),
    // Facing the foe's side again at the top, leaning back to slam.
    key(1.08, at(0.62), root({ y: 0.3, yaw: 360 }), HOP, pelvis(0, 0.02), bend(-18, -10, -6, -20), HEAVE, FISTS, flames(1), ANGRY),
    // The slam: the body whips forward and down, driving the foe into the ground.
    snap(1.18, at(0.6), root({ y: 0.1, yaw: 360 }), HOP, pelvis(0, -0.01), bend(34, 16, 4, 4), SLAM_DOWN, FISTS, flames(1), ANGRY),
    // Lands deep over it, arms still down.
    key(1.3, at(0.58), root({ yaw: 360 }), LAND_DEEP, bend(26, 10, 2, 2), SLAM_DOWN, flames(0.9), ANGRY),
    key(1.5, at(0.58), root({ yaw: 360 }), pelvis(0, -0.07), bend(22, 8, 2, -2), SLAM_DOWN, flames(0.7), ANGRY),
    // Straightens, watches it get up, hops home.
    key(1.7, at(0.58), root({ yaw: 360 }), pelvis(0, -0.035), bend(10, 2, 0, 0), GUARD, flames(0.5), ANGRY),
    key(1.86, at(0.28), root({ y: 0.06, yaw: 360 }), HOP, bend(8, 0, 0, 0), GUARD, flames(0.3), ANGRY),
    key(2.0, at(0), root({ yaw: 360 }), LAND, GUARD, flames(0.1), ANGRY),
    key(2.4, root({ yaw: 360 }), flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'grab' }, { t: 1.24, name: 'impact' }],
};

/**
 * Dig, the first turn: it crouches and drives its claws into the ground
 * (dig: the dirt bursts up), digs frantically and sinks out of sight,
 * gathering speed; it ends underground, where the second turn starts.
 */
export const dig_charge: Clip = {
  name: 'dig_charge',
  duration: 1.0,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.06), bend(28, 6, 0, 18), CHAMBER, FISTS, ANGRY),
    key(0.22, root({ y: -0.1 }), pelvis(0, -0.09), bend(42, 8, 2, 24), DIG_ARMS, SPLAY, ANGRY),
    // Digging frantically, the claws churning in turn.
    key(0.34, root({ y: -0.36 }), pelvis(0, -0.09), bend(42, 8, 2, 24), SPLAY, arms([[-0.22, -0.7, 0.68], [0.05, -0.8, 0.6]], [[0.22, -0.9, 0.38], [-0.05, -0.99, 0.1]]), ANGRY),
    key(0.46, root({ y: -0.7 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(42, 8, 2, 24), SPLAY, arms([[-0.22, -0.9, 0.38], [0.05, -0.99, 0.1]], [[0.22, -0.7, 0.68], [-0.05, -0.8, 0.6]]), ANGRY),
    fall(0.62, root({ y: -1.3 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(40, 8, 2, 22), DIG_ARMS, SPLAY, ANGRY),
    // Out of sight.
    key(0.82, root({ y: -1.32 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(38, 8, 2, 20), DIG_ARMS, SPLAY, ANGRY),
    key(1.0, root({ y: -1.3 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(36, 8, 2, 18), DIG_ARMS, SPLAY, ANGRY),
  ],
  events: [{ t: 0.21, name: 'dig' }],
};

/**
 * Dig, the second turn: from underground it tunnels to the foe and bursts
 * up out of the ground right under it with a rising knee and an uppercut
 * into its body (impact as it breaks the surface into it), comes down in
 * front of it, holds the crouch and hops home.
 */
export const dig: Clip = {
  name: 'dig',
  duration: 1.65,
  keys: [
    key(0, root({ y: -1.3 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(36, 8, 2, 18), DIG_ARMS, SPLAY, ANGRY),
    // Tunnelling over to the foe.
    key(0.2, at(0.5), root({ y: -1.3 }), { plantFeet: 0 }, pelvis(0, -0.09), bend(34, 8, 2, 12), DIG_ARMS, SPLAY, ANGRY),
    key(0.36, at(1), root({ y: -1.25 }), lunge(0.14), { plantFeet: 0 }, pelvis(0, -0.1), bend(26, 6, 0, -10), CHAMBER, FISTS, ANGRY),
    // Bursts up into it: a rising knee and an uppercut.
    snap(0.48, at(1), root({ y: 0.26 }), lunge(0.27), RISING_KNEE, pelvis(0, 0.02), bend(-8, -6, -4, -16), FISTS, arms([[-0.15, 0.9, 0.4], [-0.08, 0.98, 0.18]], [[0.35, -0.5, -0.8], [0.25, -0.3, -0.92]]), flames(1), ANGRY),
    key(0.58, at(1), root({ y: 0.34 }), lunge(0.25), RISING_KNEE, pelvis(0, 0.02), bend(-10, -6, -4, -18), FISTS, arms([[-0.12, 0.94, 0.32], [-0.06, 0.99, 0.1]], [[0.35, -0.5, -0.8], [0.25, -0.3, -0.92]]), flames(1), ANGRY),
    // Comes down in front of it and holds the crouch.
    fall(0.76, at(0.85), LAND_DEEP, bend(8, 4, 0, -2), GUARD, flames(0.7), ANGRY),
    key(1.04, at(0.85), pelvis(0, -0.035), bend(10, 2, 0, 0), GUARD, flames(0.5), ANGRY),
    key(1.2, at(0.4), root({ y: 0.07 }), HOP, bend(8, 0, 0, 0), GUARD, flames(0.3), ANGRY),
    key(1.34, at(0), LAND, GUARD, flames(0.1), ANGRY),
    key(1.65, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'impact' }],
};

export const BODY: Clip[] = [peck, quick_attack, double_edge, strength, body_slam, return_, frustration, facade, secret_power, reversal, struggle, seismic_toss, dig_charge, dig];
