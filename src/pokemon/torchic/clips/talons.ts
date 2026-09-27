// Torchic's talons: a barnyard rake, a rooster's two-footed spur rake, a
// swooping dive, a flying drop-kick, a quick snap kick. Each bounces in to
// the foe (kit: hopIn) and springs the last bit in with the blow, its feet
// off the ground (the kicking foot and the standing one), then hops home.
// Legs have no overlap delay: a talon blow lands on its key.

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARRIVE, LAND, LAND_DEEP, LEG_REST_L, LEG_REST_R, OPEN_EYES, TALON,
  at, atFoe, crest, fall, hop, hopHome, hopIn, jaw, key, lean, legL, legR, lunge, pelvis, root, snap, springTo, tail, twist, wings,
} from './kit';

/** Both feet off the ground, both legs thrust forward and down, talons spread (a rooster's spur rake). */
const SPURS: Pose = compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, legL([0.12, -0.35, 0.93], [0.1, -0.55, 0.83]), legR([-0.12, -0.35, 0.93], [-0.1, -0.55, 0.83]));
/** Both legs drawn up high under the body before the rake. */
const SPURS_COCKED: Pose = compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, legL([0.1, 0.1, 0.99], [0.06, -0.8, -0.6]), legR([-0.1, 0.1, 0.99], [-0.06, -0.8, -0.6]));

/**
 * Scratch: a barnyard talon rake. It bounces in, rocks back onto its right
 * foot with the body turned away and the near foot cocked up and out by its
 * belly, talons out; then it springs and the foot rakes down and across
 * through the foe as the body unwinds into it with a squawk (the crest whips
 * toward the foe: what our side sees); it lands, stamps and straightens with
 * a flick of the crest, and hops home.
 */
export const scratch: Clip = {
  name: 'scratch',
  duration: 1.35,
  keys: [
    key(0, LEG_REST_L),
    key(0.1, pelvis(-0.004, -0.01), lean(-4, -3, -6, -2), twist(8, 4), wings(20, -8), tail(-8), ANGRY, LEG_REST_L),
    ...hopIn(0.16, lean(-2, -3), wings(16, -8), ANGRY),
    key(0.55, ARRIVE, lean(-4, -3, -6, -2), twist(8, 4), wings(20, -8), tail(-8), ANGRY),
    // Cocked: knee up and out by the belly, talons out at the foe, the body
    // rocked back onto the right foot and turned away.
    key(0.62, atFoe(0), { plantFeet: 1, plantLeft: 0, plantRight: 1 }, pelvis(-0.012, 0.006, -0.01), lean(-12, -8, -14, -8), twist(20, 12), wings(30, -14), crest(2, 4), tail(-12), jaw(6), ANGRY,
      legL([0.62, 0.45, 0.64], [0.6, -0.15, 0.79]), LEG_REST_R),
    // The rake: it springs, and the foot rakes down and across through the foe.
    snap(0.68, springTo(TALON, 0.025), pelvis(-0.004, -0.012, 0.014), lean(14, -6, 12, 6), twist(-18, -12), wings(8, 14), crest(-2), tail(-6), jaw(30), ANGRY,
      legL([-0.2, -0.3, 0.93], [-0.3, -0.7, 0.65]), LEG_REST_R),
    // Down on the right foot, the raking foot carrying on down across its body.
    key(0.77, atFoe(TALON), { plantFeet: 1, plantLeft: 0, plantRight: 1 }, pelvis(-0.003, -0.018, 0.012), lean(16, -4, 14, 7), twist(-20, -13), wings(4, 12), crest(-5), tail(-4), jaw(12), ANGRY,
      legL([-0.3, -0.75, 0.58], [-0.25, -0.95, 0.2]), LEG_REST_R),
    // Stamps down, the knees taking it, and straightens with a flick of the crest.
    key(0.88, atFoe(TALON), LAND, pelvis(0, -0.004, 0.005), lean(8, 2, 4, 2), twist(-6, -3), wings(0, 4), jaw(4), ANGRY),
    key(0.98, atFoe(TALON), LAND, pelvis(0, 0.018), lean(-2, -4, -2, 4), crest(4, 4), ANGRY),
    ...hopHome(1.03, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'impact' }],
};

/**
 * Slash: a rooster's spur attack. It bounces in, crouches, then springs up
 * off both feet with both legs drawn high under it and rakes both sets of
 * talons down the foe, wings flapping for lift; it drops back onto its feet
 * and hops home.
 */
export const slash: Clip = {
  name: 'slash',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(4, 6), wings(12, -10), crest(-8), ANGRY),
    ...hopIn(0.18, lean(2, 2), wings(14, -8), ANGRY),
    key(0.57, ARRIVE, pelvis(0, -0.03), lean(6, 8), wings(8, -14), crest(-10), tail(-6), ANGRY),
    // Up off both feet, the legs drawn high, the wings beating.
    snap(0.66, atFoe(TALON * 0.5), root({ y: 0.14 }), SPURS_COCKED, lean(-12, -14), wings(40, -12), crest(10, 8), tail(-20), jaw(10), ANGRY),
    // The rake: both sets of talons thrust down the foe.
    snap(0.74, atFoe(TALON), root({ y: 0.1 }), SPURS, lean(-18, -12), wings(20, 14), crest(14, 8), tail(-24), jaw(30), ANGRY),
    key(0.82, atFoe(TALON), root({ y: 0.06 }), SPURS, lean(-16, -10), wings(34, -6), crest(12, 8), tail(-22), jaw(20), ANGRY),
    // Drops back onto its feet.
    fall(0.92, atFoe(TALON), LAND_DEEP, wings(10), crest(2), jaw(4), ANGRY),
    key(1.06, atFoe(TALON), LAND, pelvis(0, 0.02), lean(0, -2, 4, 2), crest(4, 4), ANGRY),
    ...hopHome(1.14, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.79, name: 'impact' }],
};

/**
 * Aerial Ace: a chick's swoop. One big springing hop high at the foe (no
 * bouncing), wing tufts beating, then it swoops down onto it talons first,
 * raking as it drops, and lands past it on its far side; it hops home.
 */
export const aerial_ace: Clip = {
  name: 'aerial_ace',
  duration: 1.3,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03), lean(6, 10), wings(-4, -12), crest(-12), ANGRY),
    // The big hop high at the foe.
    snap(0.24, hop(0.6, 0.28), lean(-10, -12), wings(40, -10), crest(8, 6), tail(-18), ANGRY),
    key(0.34, at(0.96), lunge(0.1), root({ y: 0.26 }), SPURS_COCKED, lean(-6, -6), wings(26, 8), crest(10, 6), tail(-20), ANGRY),
    // The swoop: down onto the foe talons first.
    snap(0.42, atFoe(TALON), root({ y: 0.12, pitch: 10 }), SPURS, lean(-14, -8), wings(44, -16), crest(12, 8), tail(-24), jaw(26), ANGRY),
    key(0.5, atFoe(TALON + 0.04), root({ y: 0.06, pitch: 6 }), SPURS, lean(-10, -6), wings(30, 6), crest(8, 6), tail(-20), jaw(14), ANGRY),
    // Lands past it on its far side.
    fall(0.6, atFoe(TALON + 0.06), root({ x: -0.3 }), LAND_DEEP, wings(12), ANGRY),
    key(0.74, atFoe(TALON + 0.06), root({ x: -0.3 }), LAND, pelvis(0, 0.02), lean(-2, -4, -6), crest(4, 4), ANGRY),
    snap(0.84, hop(0.66, 0.08), root({ x: -0.2 }), ANGRY),
    fall(0.94, at(0.4), root({ x: -0.1 }), LAND, ANGRY),
    snap(1.02, hop(0.18, 0.07), ANGRY),
    fall(1.13, at(0), LAND, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.47, name: 'impact' }],
};

/**
 * Mega Kick: a flying drop-kick. It runs in on quick bounds, jumps, and flies
 * at the foe feet first, its round body tipped back and both legs locked out
 * straight at it; it lands on its bottom with a bump, bounces up and hops
 * home.
 */
export const mega_kick: Clip = {
  name: 'mega_kick',
  duration: 1.65,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.03), lean(8, 12), wings(-6, -14), crest(-14), tail(-10), ANGRY),
    // Quick bounds.
    key(0.24, hop(0.3, 0.05), lean(10, 8), wings(20, -12), ANGRY),
    key(0.32, at(0.5), LAND, lean(10, 8), wings(8, -12), ANGRY),
    key(0.4, hop(0.72, 0.06), lean(10, 8), wings(20, -12), ANGRY),
    key(0.48, at(0.86), LAND, lean(12, 10), wings(6, -16), crest(-12), ANGRY),
    // The jump, the legs tucked.
    snap(0.56, at(0.96), lunge(0.1), root({ y: 0.16, pitch: -14 }), SPURS_COCKED, lean(-8, -12), wings(34, -10), crest(8, 6), tail(-20), ANGRY),
    // The drop-kick: body tipped back, both legs locked out at the foe.
    snap(0.64, atFoe(TALON + 0.14), root({ y: 0.09, pitch: -34 }), compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, legL([0.1, 0.1, 0.99], [0.08, 0.12, 0.99]), legR([-0.1, 0.1, 0.99], [-0.08, 0.12, 0.99])), lean(-10, -14), wings(40, -20), crest(16, 10), tail(-26), jaw(28), ANGRY),
    key(0.72, atFoe(TALON + 0.16), root({ y: 0.07, pitch: -36 }), compose({ plantFeet: 0, plantLeft: 0, plantRight: 0 }, legL([0.1, 0.08, 0.99], [0.08, 0.1, 0.99]), legR([-0.1, 0.08, 0.99], [-0.08, 0.1, 0.99])), lean(-10, -14), wings(36, -16), crest(16, 10), tail(-26), jaw(20), ANGRY),
    // Lands on its bottom with a bump...
    fall(0.84, atFoe(TALON + 0.08), root({ pitch: -12 }), LAND_DEEP, pelvis(0, -0.02, -0.01), lean(-6, -8), wings(20, 4), crest(6), jaw(6), ANGRY),
    // ...and bounces up.
    key(0.98, atFoe(TALON + 0.08), LAND, pelvis(0, 0.018), lean(0, -2, 5, 3), wings(6), crest(4, 4), ANGRY),
    ...hopHome(1.06, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/**
 * Secret Power: a quick, scrappy snap kick. It bounces in low, and springing
 * off its left foot kicks the right one straight out into the foe's middle,
 * talons spread; it lands and hops home.
 */
export const secret_power: Clip = {
  name: 'secret_power',
  duration: 1.25,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.026), lean(8, 12), wings(8, -12), crest(-8), ANGRY),
    ...hopIn(0.16, lean(6, 8), wings(12, -10), ANGRY),
    key(0.55, ARRIVE, pelvis(0, -0.02), lean(6, 10), wings(10, -12), ANGRY),
    // The kick: off its left foot, the right foot snapped straight out.
    snap(0.61, springTo(TALON, 0.02), lean(-10, -10, 0, -4), twist(-6), wings(28, 6), crest(6, 6), tail(-16), jaw(20), ANGRY,
      legR([-0.08, -0.05, 0.99], [-0.06, 0.05, 0.99]), LEG_REST_L),
    key(0.69, atFoe(TALON), { plantFeet: 1, plantLeft: 1, plantRight: 0 }, lean(-9, -9, 0, -4), twist(-6), wings(24, 4), crest(6, 6), tail(-16), jaw(12), ANGRY,
      legR([-0.08, -0.1, 0.99], [-0.06, -0.02, 0.99]), LEG_REST_L),
    // Down on both feet.
    key(0.8, atFoe(TALON), LAND, lean(2, 2), wings(6), ANGRY),
    key(0.9, atFoe(TALON), LAND, pelvis(0, 0.018), lean(0, -2), ANGRY),
    ...hopHome(0.94, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

export const TALON_CLIPS: Clip[] = [scratch, slash, aerial_ace, mega_kick, secret_power];

