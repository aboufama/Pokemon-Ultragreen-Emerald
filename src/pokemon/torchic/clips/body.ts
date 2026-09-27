// Torchic's whole-body blows: it has no fists, so its punches and charges
// are its round body thrown head first (the crown leads), its shoves are its
// chest, its slam a belly-flop; it seizes with its beak and burrows with its
// talons. Each travels in (bounding hops, a dash, a leap) and the blow's
// last spring carries it into the foe with its feet off the ground; it hops
// home.

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, LIFT_R, ARRIVE, BEAK, BODY, CROWN, DROWSY, HAPPY, HOP, HURT, LAND, LAND_DEEP, LEG_REST_L, LEG_REST_R, OPEN_EYES, SCRAPE_L, SCRAPE_R, SHUT,
  STRAIN, at, atFoe, crest, fall, hop, hopHome, hopIn, jaw, key, lean, lunge, pelvis, root, snap, springTo, tail, twist, wings,
} from './kit';

/** Crown first: the body pitched at the foe, the face down, wing tufts swept back, the crest streaming. */
const CROWN_FIRST: Pose[] = [lean(30, 38), wings(-4, -28), crest(-42), tail(-20)];
/** A dash in the air: the legs thrown back, the body low. */
const DASH: Pose = compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, { aim: { thighL: { dir: [0.04, -0.5, -0.87] }, shinL: { dir: [0.02, -0.2, -0.98] }, thighR: { dir: [-0.04, -0.5, -0.87] }, shinR: { dir: [-0.02, -0.2, -0.98] } } });

/**
 * Quick Attack: a blur. A quick dip, and it streaks across the field low and
 * crown first, wing tufts swept back and crest streaming, glances off the
 * foe and bounces home.
 */
export const quick_attack: Clip = {
  name: 'quick_attack',
  duration: 1.0,
  keys: [
    key(0),
    key(0.07, pelvis(0, -0.026, -0.012), lean(-5, -6), wings(8, -18), crest(-12), tail(-10), ANGRY),
    // The streak.
    snap(0.14, at(0.55), root({ y: 0.03 }), DASH, ...CROWN_FIRST, ANGRY),
    key(0.2, at(0.92), lunge(0.1), root({ y: 0.03 }), DASH, ...CROWN_FIRST, ANGRY),
    // Glances off the foe, crown first.
    snap(0.25, atFoe(BODY), root({ y: 0.02 }), DASH, lean(31, 34), wings(-4, -26), crest(-42), tail(-20), jaw(18), ANGRY),
    // Bounces off.
    key(0.36, at(0.84), lunge(0.1), root({ y: 0.07 }), HOP, lean(-6, -8), wings(14, -4), crest(3), tail(-8), jaw(6), ANGRY),
    fall(0.46, at(0.6), LAND, lean(2, 2), wings(2), ANGRY),
    snap(0.54, hop(0.3, 0.06), ANGRY),
    fall(0.64, at(0), LAND, ANGRY),
    key(1.0, OPEN_EYES),
  ],
  events: [{ t: 0.28, name: 'impact' }],
};

/**
 * Frustration: a sulky, angry chick. It stamps its foot, bounces in stiffly,
 * rams the foe with the top of its head in a spiteful butt, then turns its
 * head away with its beak in the air and hops home in a huff.
 */
export const frustration: Clip = {
  name: 'frustration',
  duration: 1.55,
  keys: [
    key(0, LEG_REST_R),
    // A stamp of the right foot.
    key(0.1, { plantFeet: 1, plantRight: 0 }, pelvis(0.006, 0.004), lean(-4, -6), wings(-4, 8), crest(-10), ANGRY, LIFT_R),
    snap(0.18, LAND, pelvis(0, -0.03), lean(8, 14, 0, 4), wings(-8, 8), crest(-14), jaw(8), ANGRY),
    ...hopIn(0.24, lean(10, 14), wings(-6, 6), crest(-12), ANGRY),
    key(0.63, ARRIVE, lean(-6, -4, 0, 4), wings(-4, 6), crest(-8), ANGRY),
    // The spiteful butt.
    snap(0.7, springTo(CROWN), pelvis(0, -0.012, 0.02), lean(26, 34, 0, 6), wings(-6, -20), crest(-36), tail(-18), jaw(10), ANGRY),
    key(0.78, atFoe(CROWN), LAND, pelvis(0, -0.02, 0.02), lean(27, 34, 0, 6), wings(-6, -18), crest(-38), tail(-18), ANGRY),
    // The huff: the head turned away, the beak in the air.
    key(0.92, atFoe(CROWN), LAND, pelvis(0, 0.01), lean(-4, -18, 30, -8), wings(-10, 8), crest(-4), tail(-10, 12), jaw(6), SHUT),
    key(1.08, atFoe(CROWN), LAND, pelvis(0, 0.012), lean(-5, -19, 34, -9), wings(-10, 8), crest(-4), tail(-10, -12), jaw(2), SHUT),
    ...hopHome(1.14, lean(-2, -10, 20, -4), SHUT),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/**
 * Return: a joyful, loyal charge. Happy bouncing hops, a big bound, and a
 * full-body chest bump into the foe; it bounces back pleased, a flutter of
 * its wing tufts, and hops home.
 */
export const return_: Clip = {
  name: 'return',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(-2, -6), wings(20, -6), tail(-12, 8), HAPPY),
    ...hopIn(0.18, lean(-4, -8), wings(24, -4), tail(-12), HAPPY),
    key(0.57, ARRIVE, pelvis(0, -0.02), lean(4, 4), wings(10, -10), ANGRY),
    // The bump: the round chest thrown into the foe.
    snap(0.63, springTo(BODY, 0.04), pelvis(0, 0.01, 0.02), lean(-10, -14), wings(34, -18), crest(8, 6), tail(-20), jaw(20), HAPPY),
    key(0.71, atFoe(BODY), LAND, pelvis(0, -0.004, 0.02), lean(-9, -12), wings(30, -14), crest(8, 6), tail(-18), jaw(12), HAPPY),
    // Bounces back, pleased, fluttering.
    key(0.84, at(0.96), lunge(0.12), root({ y: 0.06 }), HOP, lean(-4, -10), wings(34, -4), tail(-14, 10), HAPPY),
    fall(0.94, at(0.92), LAND, lean(0, -4), wings(10), tail(-10, -10), HAPPY),
    key(1.02, at(0.92), LAND, pelvis(0, 0.018), lean(-2, -6, 6, 6), wings(28), HAPPY),
    ...hopHome(1.08, HAPPY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/**
 * Facade: gritty and determined. A wince (it hurts), then it lowers its head
 * and charges on bounding hops, driving crown first through the foe; it
 * shakes itself and hops home.
 */
export const facade: Clip = {
  name: 'facade',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(6, 14, 0, 6), wings(-8, 8), crest(-12), HURT),
    key(0.26, pelvis(0, -0.03), lean(12, 20), wings(-6, -14), crest(-20), tail(-10), ANGRY),
    ...hopIn(0.32, lean(14, 22), wings(-4, -18), crest(-24), ANGRY),
    // The drive: crown first through the foe.
    snap(0.72, springTo(CROWN, 0.02), ...CROWN_FIRST, jaw(10), ANGRY),
    key(0.8, atFoe(CROWN), LAND, lean(31, 36), wings(-4, -24), crest(-42), tail(-20), jaw(8), ANGRY),
    key(0.94, atFoe(CROWN), LAND, pelvis(0, 0.01), lean(-4, -6, 8, 5), wings(12, -4), crest(4, 4), ANGRY),
    key(1.04, atFoe(CROWN), LAND, pelvis(0, 0.014), lean(-2, -4, -8, -4), wings(6), ANGRY),
    ...hopHome(1.1, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/**
 * Strength: it plants itself against the foe and shoves: the round chest set
 * against it, head down and legs driving, it heaves once, twice and the
 * third time it pushes the foe off; it hops home.
 */
export const strength: Clip = {
  name: 'strength',
  duration: 1.7,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.026), lean(8, 12), wings(-6, -14), crest(-12), ANGRY),
    ...hopIn(0.18, lean(6, 10), wings(-4, -12), ANGRY),
    key(0.57, ARRIVE, lean(10, 14), wings(-8, -16), crest(-14), ANGRY),
    // A hop in: the chest set against the foe.
    snap(0.64, springTo(BODY), pelvis(0, -0.02, 0.02), lean(20, 24), wings(-10, -24), crest(-26), tail(-14), ANGRY),
    key(0.72, atFoe(BODY), LAND_DEEP, pelvis(0, -0.01, 0.02), lean(22, 26), wings(-10, -24), crest(-28), tail(-14), STRAIN),
    // Heave, heave...
    key(0.84, atFoe(BODY), LAND_DEEP, pelvis(0, -0.01, 0.03), lean(26, 30), SCRAPE_L, LEG_REST_R, wings(-10, -26), crest(-30), jaw(10), STRAIN),
    key(0.94, atFoe(BODY), LAND_DEEP, pelvis(0, -0.012, 0.02), lean(22, 26), LEG_REST_L, SCRAPE_R, wings(-10, -24), crest(-28), jaw(4), STRAIN),
    // ...and the big shove.
    snap(1.02, atFoe(BODY), LAND, pelvis(0, 0.012, 0.03), lean(-8, -12), wings(34, -6), crest(12, 8), tail(-20), jaw(28), ANGRY),
    key(1.14, atFoe(BODY), LAND, pelvis(0, 0.014, 0.026), lean(-9, -12), wings(28, -4), crest(12, 8), tail(-18), jaw(16), ANGRY),
    key(1.26, atFoe(BODY), LAND, pelvis(0, 0.016), lean(0, -4), wings(6), ANGRY),
    ...hopHome(1.3, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 1.06, name: 'impact' }],
};

/**
 * Double-Edge: a reckless all-out charge. It paws the ground, runs at the
 * foe on pounding bounds and throws its whole round body in crown first; the
 * crash knocks it back hurt, it staggers, shakes it off and hops home.
 */
export const double_edge: Clip = {
  name: 'double_edge',
  duration: 1.9,
  keys: [
    key(0, LEG_REST_R),
    key(0.12, pelvis(0.008, -0.024, -0.012), lean(2, 8), wings(4, -18), crest(-15), tail(-14), ANGRY, SCRAPE_R),
    key(0.24, pelvis(0, -0.04, -0.014), lean(4, 14), wings(0, -24), crest(-24), tail(-16), ANGRY, LEG_REST_R),
    // Pounding bounds.
    key(0.34, hop(0.3, 0.06), lean(20, 24), wings(-4, -24), crest(-30), ANGRY),
    key(0.42, at(0.5), LAND, lean(20, 24), wings(-4, -24), crest(-30), ANGRY),
    key(0.5, hop(0.76, 0.07), lean(22, 26), wings(-4, -26), crest(-34), ANGRY),
    key(0.58, at(0.92), LAND, lean(24, 28), wings(-4, -26), crest(-36), ANGRY),
    // The crash: the whole round body thrown in crown first.
    snap(0.65, springTo(BODY, 0.04), ...CROWN_FIRST, ANGRY),
    key(0.73, atFoe(BODY), LAND, pelvis(0, -0.028, 0.019), lean(31, 38), wings(-6, -26), crest(-42), tail(-20), jaw(20), ANGRY),
    // Knocked back, hurt.
    key(0.88, at(0.92), lunge(0.1), root({ y: 0.06 }), HOP, lean(-10, -16, 0, 8), wings(30, -8), tail(-14), jaw(14), HURT),
    fall(0.98, at(0.86), LAND, lean(4, 10, 0, -8), wings(-6, 8), crest(-8), HURT),
    // Staggers, then shakes it off.
    key(1.12, at(0.86), LAND, pelvis(0.006, -0.004), lean(2, 8, 8, 8), wings(-6, 6), crest(-6), HURT),
    key(1.26, at(0.86), LAND, pelvis(-0.006, 0.004), lean(-1, -4, -8, -4), wings(10), crest(2), ANGRY),
    key(1.36, at(0.86), LAND, pelvis(0, 0.014), lean(0, -2, 5, 3), ANGRY),
    snap(1.44, hop(0.46, 0.07), ANGRY),
    fall(1.58, at(0), LAND, ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.71, name: 'impact' }],
};

/**
 * Struggle: worn out, it sways, bumbles in on weak little hops and flops
 * against the foe beak first; the recoil makes it wince and it wobbles
 * home.
 */
export const struggle: Clip = {
  name: 'struggle',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), lean(4, 12, 0, 10), wings(-12, 8), crest(-14), DROWSY),
    key(0.24, hop(0.3, 0.04), lean(4, 10, 0, -6), wings(-10, 8), crest(-12), DROWSY),
    key(0.33, at(0.5), LAND, lean(6, 12, 0, 8), wings(-12, 8), DROWSY),
    key(0.42, hop(0.76, 0.04), lean(4, 10, 0, -6), wings(-10, 8), DROWSY),
    key(0.52, ARRIVE, pelvis(0, -0.02), lean(6, 14, 0, 8), wings(-12, 8), crest(-14), DROWSY),
    // The flop: a weak spring and it falls against the foe beak first.
    fall(0.62, springTo(BODY, 0.02), lean(26, 30, 0, 10), wings(-4, -10), crest(-24), jaw(10), STRAIN),
    key(0.7, atFoe(BODY), LAND, pelvis(0, -0.03, 0.02), lean(28, 32, 0, 12), wings(-6, -8), crest(-26), jaw(6), STRAIN),
    // The recoil: a wince, rocking back.
    key(0.84, atFoe(BODY), LAND, pelvis(0, 0.01, -0.01), lean(-8, -14, 0, -8), wings(20, -4), crest(2), jaw(14), HURT),
    key(0.98, atFoe(BODY), LAND, pelvis(0, -0.01), lean(4, 10, 0, 10), wings(-10, 6), crest(-10), DROWSY),
    // Wobbles home.
    snap(1.06, hop(0.7, 0.05), lean(4, 10, 0, -8), wings(-8, 6), DROWSY),
    fall(1.16, at(0.46), LAND, lean(6, 12, 0, 8), wings(-10, 6), DROWSY),
    snap(1.24, hop(0.22, 0.05), lean(4, 10, 0, -6), wings(-8, 6), DROWSY),
    fall(1.35, at(0), LAND, lean(4, 8), DROWSY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'impact' }],
};

/**
 * Body Slam: it bounces in, crouches and springs high over the foe, wing
 * tufts flapping, and drops onto it in a round belly-flop; it rolls off onto
 * its feet and hops home.
 */
export const body_slam: Clip = {
  name: 'body_slam',
  duration: 1.75,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), lean(6, 10), wings(-6, -10), crest(-12), ANGRY),
    ...hopIn(0.18, lean(4, 6), wings(8, -8), ANGRY),
    key(0.57, ARRIVE, pelvis(0, -0.036), lean(8, 14), wings(-10, -14), crest(-16), ANGRY),
    // Springs high over the foe.
    snap(0.7, atFoe(BODY * 0.5), root({ y: 0.3 }), HOP, lean(-12, -16), wings(40, -12), crest(14, 8), tail(-22), jaw(18), ANGRY),
    key(0.8, atFoe(BODY * 0.8), root({ y: 0.3, pitch: 20 }), HOP, lean(-8, -12), wings(34, 10), crest(12, 8), tail(-22), jaw(12), ANGRY),
    // The belly-flop down onto it.
    fall(0.9, atFoe(BODY), root({ y: 0.1, pitch: 44 }), HOP, lean(-10, -20), wings(40, 20), crest(6, 10), tail(-26), jaw(20), ANGRY),
    key(0.98, atFoe(BODY), root({ y: 0.08, pitch: 42 }), HOP, lean(-10, -20), wings(38, 18), crest(6, 10), tail(-26), jaw(14), ANGRY),
    // Rolls off onto its feet.
    key(1.1, atFoe(BODY * 0.6), root({ x: 0.1, y: 0.05, pitch: 10 }), HOP, lean(0, -6), wings(20), ANGRY),
    fall(1.2, atFoe(BODY * 0.6), root({ x: 0.1 }), LAND_DEEP, wings(6), ANGRY),
    key(1.32, atFoe(BODY * 0.6), root({ x: 0.1 }), LAND, pelvis(0, 0.018), lean(0, -2, 5, 3), ANGRY),
    snap(1.38, hop(0.7, 0.07), root({ x: 0.06 }), ANGRY),
    fall(1.48, at(0.44), root({ x: 0.03 }), LAND, ANGRY),
    snap(1.55, hop(0.2, 0.06), ANGRY),
    fall(1.66, at(0), LAND, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.95, name: 'impact' }],
};

/**
 * Mega Punch: its punch is its whole round body. It bounces in, rears way
 * back, cocked like a fist, the wing tufts drawn back, then springs and
 * drives its head into the foe like a haymaker, the body straight behind it;
 * it holds, bounces off and hops home.
 */
export const mega_punch: Clip = {
  name: 'mega_punch',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.014, -0.012), lean(-8, -12, -10), twist(10), wings(20, -26), crest(-6), ANGRY),
    ...hopIn(0.18, lean(-6, -10, -8), twist(8), wings(18, -24), ANGRY),
    // Rears way back, cocked like a fist.
    key(0.57, ARRIVE, pelvis(0, 0.01, -0.02), lean(-18, -24, -16), twist(18, 4), wings(30, -34), crest(10, 6), tail(-18), ANGRY),
    key(0.66, atFoe(0), LAND, pelvis(0, 0.014, -0.024), lean(-20, -26, -18), twist(20, 5), wings(32, -36), crest(12, 6), tail(-20), ANGRY),
    // The haymaker: head first, the body straight behind it.
    snap(0.73, springTo(CROWN, 0.03), pelvis(0, -0.01, 0.026), lean(32, 30, 8), twist(-12, -4), wings(-6, -30), crest(-40), tail(-22), jaw(24), ANGRY),
    key(0.82, atFoe(CROWN), LAND, pelvis(0, -0.02, 0.026), lean(33, 31, 8), twist(-14, -4), wings(-6, -28), crest(-42), tail(-22), jaw(16), ANGRY),
    // Bounces off, shakes its head.
    key(0.96, atFoe(CROWN), LAND, pelvis(0, 0.01, -0.006), lean(-6, -10, 8, 6), wings(16, -4), crest(4, 4), tail(-8), jaw(6), ANGRY),
    key(1.06, atFoe(CROWN), LAND, pelvis(0, 0.014), lean(-2, -4, -6, -3), wings(6), ANGRY),
    ...hopHome(1.1, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.79, name: 'impact' }],
};

/**
 * Counter: braced behind its wing tufts as the blow lands, a wince, then it
 * bounces straight back at the foe and pays it back with a hard headbutt;
 * it hops home.
 */
export const counter: Clip = {
  name: 'counter',
  duration: 1.45,
  keys: [
    key(0),
    // Braced as the blow lands.
    key(0.08, pelvis(0, -0.03, -0.01), lean(4, 6), wings(-6, 30), crest(-28), tail(10), STRAIN),
    key(0.2, pelvis(0, -0.034, -0.012), root({ z: -0.03 }), lean(-6, -10, 0, 6), wings(-8, 32), crest(-30), HURT),
    // Back at it: quick bounds.
    key(0.3, hop(0.4, 0.06), lean(14, 20), wings(-4, -20), crest(-24), ANGRY),
    key(0.38, at(0.66), LAND, lean(14, 20), wings(-4, -20), ANGRY),
    key(0.46, hop(0.94, 0.06), lean(16, 22), wings(-4, -22), crest(-28), ANGRY),
    key(0.54, ARRIVE, lean(10, 16), wings(-6, -22), crest(-26), ANGRY),
    // The headbutt.
    snap(0.6, springTo(CROWN, 0.03), ...CROWN_FIRST, jaw(16), ANGRY),
    key(0.69, atFoe(CROWN), LAND, pelvis(0, -0.02, 0.02), lean(31, 36), wings(-6, -26), crest(-42), tail(-20), jaw(10), ANGRY),
    key(0.82, atFoe(CROWN), LAND, pelvis(0, 0.012), lean(-4, -8), wings(14, -4), crest(4, 4), ANGRY),
    key(0.92, atFoe(CROWN), LAND, pelvis(0, 0.016), lean(0, -2, 5, 3), ANGRY),
    ...hopHome(0.98, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

/**
 * Seismic Toss: it has no arms, so it seizes the foe in its beak (grab),
 * braces and heaves, whirls round on the spot with the foe swinging from its
 * beak, and flings it down into its own place (impact: it crashes there and
 * gets up); it hops home dizzy-proud.
 */
export const seismic_toss: Clip = {
  name: 'seismic_toss',
  duration: 2.4,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(4, 8), wings(10, -10), crest(-8), ANGRY),
    ...hopIn(0.18, lean(2, 4), wings(12, -8), ANGRY),
    key(0.57, ARRIVE, lean(-4, -8), wings(14, -8), jaw(20), ANGRY),
    // Seizes it in its beak.
    snap(0.64, springTo(BEAK), pelvis(0, -0.01, 0.02), lean(18, 8), wings(20, -12), crest(-12), jaw(30), ANGRY),
    key(0.72, atFoe(BEAK), LAND_DEEP, pelvis(0, -0.01, 0.016), lean(16, 8), wings(24, -12), crest(-12), jaw(6), STRAIN),
    // Braces and heaves, leaning back.
    key(0.88, atFoe(BEAK), LAND_DEEP, pelvis(0, -0.02, -0.02), lean(-14, -24), wings(34, -10), crest(8, 6), tail(-18), jaw(4), STRAIN),
    // Whirls round on the spot with it, hopping.
    key(1.0, at(0.9), lunge(0.1), root({ y: 0.08, yaw: 120 }), HOP, lean(-12, -20), wings(40, -8), crest(10, 8), jaw(4), ANGRY),
    key(1.12, at(0.8), root({ y: 0.1, yaw: 240 }), HOP, lean(-12, -20), wings(40, -8), crest(10, 8), jaw(4), ANGRY),
    key(1.24, at(0.72), root({ y: 0.08, yaw: 360 }), HOP, lean(-14, -22), wings(40, -8), crest(10, 8), jaw(4), ANGRY),
    // The fling: the head whips forward and down, letting go.
    snap(1.32, at(0.7), root({ y: 0.02, yaw: 360 }), HOP, pelvis(0, -0.01, 0.02), lean(26, 30), wings(10, 20), crest(-26), tail(-20), jaw(34), ANGRY),
    fall(1.42, at(0.7), root({ yaw: 360 }), LAND_DEEP, lean(20, 24), wings(6, 10), crest(-20), jaw(20), ANGRY),
    key(1.62, at(0.7), root({ yaw: 360 }), LAND, pelvis(0, 0.004), lean(-4, -10), wings(24, -4), crest(8, 6), jaw(4), HAPPY),
    key(1.8, at(0.7), root({ yaw: 360 }), LAND, pelvis(0, 0.016), lean(0, -4, 6, 4), wings(8), HAPPY),
    snap(1.88, hop(0.4, 0.07), root({ yaw: 360 }), HAPPY),
    fall(2.0, at(0), root({ yaw: 360 }), LAND, HAPPY),
    key(2.4, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'grab' }, { t: 1.36, name: 'impact' }],
};

/**
 * Dig, the first turn: head down, it scratches at the ground with both feet
 * in turn (dig: the dirt flies), faster and faster, and sinks out of sight.
 */
export const dig_charge: Clip = {
  name: 'dig_charge',
  duration: 1.05,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    key(0.1, pelvis(0, -0.026, -0.004), lean(8, 24), wings(10, -10), crest(-12), tail(-10), ANGRY, LEG_REST_L, LEG_REST_R),
    // Scratches: left, right, left, right.
    key(0.18, pelvis(0.005, -0.03, -0.004), lean(10, 26), wings(14, -12), tail(-12), ANGRY, SCRAPE_L, LEG_REST_R),
    key(0.26, pelvis(-0.005, -0.03, -0.004), lean(10, 26), wings(10, -10), tail(-12), ANGRY, LEG_REST_L, SCRAPE_R),
    key(0.34, root({ y: -0.12 }), pelvis(0.005, -0.03, -0.004), lean(12, 28), wings(14, -12), tail(-12), ANGRY, SCRAPE_L, LEG_REST_R),
    key(0.42, root({ y: -0.32 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(-0.005, -0.03, -0.004), lean(12, 28), wings(10, -10), tail(-12), ANGRY, LEG_REST_L, SCRAPE_R),
    fall(0.6, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(12, 28), wings(-6, -12), crest(-20), ANGRY),
    key(0.84, root({ y: -1.32 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(10, 24), wings(-6, -12), crest(-20), ANGRY),
    key(1.05, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(10, 24), wings(-6, -12), crest(-20), ANGRY),
  ],
  events: [{ t: 0.18, name: 'dig' }],
};

/**
 * Dig, the second turn: from under the ground it tunnels to the foe and
 * bursts up right under it, crown first, stretched tall with its beak open
 * and wing tufts flung up (impact as it breaks the surface into it); it drops
 * back down, shakes the dirt off and hops home.
 */
export const dig: Clip = {
  name: 'dig',
  duration: 1.6,
  keys: [
    key(0, root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(10, 24), wings(-6, -12), crest(-20), ANGRY),
    key(0.2, at(0.5), root({ y: -1.3 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(10, 24), wings(-6, -12), crest(-20), ANGRY),
    key(0.36, atFoe(CROWN * 0.6), root({ y: -1.2 }), { plantFeet: 0, plantLeft: 0, plantRight: 0 }, pelvis(0, -0.03), lean(12, 20), wings(-6, -14), crest(-24), ANGRY),
    // Bursts up under it, crown first, then stretched tall.
    snap(0.48, atFoe(CROWN), root({ y: 0.14 }), HOP, lean(10, 4), wings(34, -8), crest(-10, 10), tail(-22), jaw(26), ANGRY),
    key(0.58, atFoe(CROWN), root({ y: 0.18 }), HOP, lean(-6, -16), wings(36, -6), crest(10, 10), tail(-20), jaw(22), ANGRY),
    // Drops back down and shakes the dirt off.
    fall(0.72, atFoe(CROWN), LAND_DEEP, lean(6, 8), wings(6), crest(-4), jaw(4), ANGRY),
    key(0.86, atFoe(CROWN), LAND, pelvis(0.006, 0.01), lean(0, -2, 10, 6), twist(0, 6), wings(20), crest(4, 4), ANGRY),
    key(0.96, atFoe(CROWN), LAND, pelvis(-0.006, 0.012), lean(0, -2, -10, -6), twist(0, -6), wings(8), crest(4, 4), ANGRY),
    ...hopHome(1.02, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

export const BODY_CLIPS: Clip[] = [
  quick_attack, frustration, return_, facade, strength, double_edge, struggle, body_slam, mega_punch, counter, seismic_toss, dig_charge, dig,
];
