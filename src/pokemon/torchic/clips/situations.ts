// Torchic's battle situations: standing ready, sent out, hit, fainting,
// dodging, shrugging a move off, coming home after a run of hits, each
// status condition, asleep and tired, stats rising and falling, levelling
// up, drained and healed, focusing, hanging on, flinching, recharging,
// waking, shaking a condition off, breaking free, and each weather. A plucky
// chick: it bobs, puffs up, flutters its wing tufts and tells it all with
// its big head, its crest and its eyes.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, LIFT_L, LIFT_R, AT_FOE_GUARD, BEAK, DROWSY, HAPPY, HOP, HURT, LAND, LAND_DEEP, LEG_REST_L, LEG_REST_R, OPEN_EYES, SHUT, STRAIN, WORRIED,
  atFoe, crest, fall, hopHome, jaw, key, lean, legR, pelvis, root, snap, tail, twist, wings,
} from './kit';

/**
 * Standing ready: the life layer breathes and bounces it; on top, a chick's
 * idle: a curious head tilt, a little puff of the chest and, once a loop, a
 * quick flutter of the wing tufts.
 */
export const idle: Clip = {
  name: 'idle',
  duration: 4,
  loop: true,
  keys: [
    key(0),
    key(0.9, pelvis(0.003, -0.004), lean(1.5, 1, 5, 7), wings(-2)),
    key(1.8, pelvis(0.002, -0.002), lean(0.5, 0.5, 2, 3)),
    // A little puff and a flutter.
    key(2.35, pelvis(0, 0.003), lean(-3, -5), wings(8)),
    key(2.5, pelvis(0, 0.002), lean(-3.5, -6), wings(20, -2)),
    key(2.62, pelvis(0, 0.002), lean(-3.5, -6), wings(4)),
    key(2.74, pelvis(0, 0.002), lean(-3, -5), wings(16, -2)),
    key(2.9, pelvis(0, 0), lean(-1.5, -3), wings(2)),
    key(3.3, pelvis(-0.003, -0.003), lean(1, 1, -3, -4)),
    key(4),
  ],
};

/**
 * Out of its ball: curled up small, then it bursts up tall with its wing
 * tufts flung open and its crest standing, cheeps its cry with two flaps,
 * and bobs down into its stance, ready (its stock front animation stretches).
 */
export const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, pelvis(0, -0.034), lean(4, 12), wings(-12, 10), crest(-24), tail(10), SHUT),
    key(0.16, pelvis(0, -0.04), lean(6, 14), wings(-14, 12), crest(-27), tail(12), SHUT),
    snap(0.34, pelvis(0, 0.012), lean(-6, -14), wings(36, -6), crest(24, 12), tail(-22), jaw(34), ANGRY),
    key(0.46, pelvis(0, -0.004, 0.006), lean(-1, -11, 6, 3), wings(12, -2), crest(22, 12), tail(-20), jaw(36), ANGRY),
    key(0.58, pelvis(0, 0.012), lean(-6, -14), wings(32, -6), crest(23, 12), tail(-22), jaw(38), ANGRY),
    key(0.7, pelvis(0, -0.004, 0.006), lean(-1, -11, -6, -3), wings(10, -2), crest(22, 12), tail(-20), jaw(36), ANGRY),
    key(0.82, pelvis(0, 0.011), lean(-5, -12, -2, -1), wings(28, -4), crest(20, 11), tail(-20), jaw(30), ANGRY),
    key(0.98, pelvis(0, 0.006), lean(-3, -7), wings(6), crest(10, 6), tail(-12), jaw(8), ANGRY),
    key(1.16, pelvis(0, -0.018), lean(5, 8), wings(-2), crest(0), tail(-4), ANGRY),
    key(1.36, pelvis(0, 0.002), lean(0, -1), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'cry' }],
};

/** Taking a hit: snaps back with a squawk and its wing tufts flared, then shakes it off. */
export const hit: Clip = {
  name: 'hit',
  duration: 0.55,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.008, -0.012), lean(-10, -20, 0, 8), wings(30, -8), tail(-14), jaw(14), HURT),
    key(0.17, pelvis(0, -0.005, -0.006), lean(-4, -8, 0, 3), wings(12, -3), tail(-6), jaw(6), HURT),
    key(0.31, pelvis(0, -0.002), lean(0, -2, -3), wings(-2), HURT),
    key(0.42, lean(0, 0, 3), ANGRY),
    key(0.55, OPEN_EYES),
  ],
};

/**
 * A heavy blow: knocked clean off its feet with a squawk, it tumbles back a
 * hop, lands on its bottom, and bounces back up onto its feet, shaking its
 * head.
 */
export const hit_strong: Clip = {
  name: 'hit_strong',
  duration: 1.05,
  keys: [
    key(0),
    snap(0.05, root({ y: 0.06, z: -0.06, pitch: -12 }), HOP, lean(-14, -26, 0, 10), wings(40, -10), crest(8, 8), tail(-18), jaw(24), HURT),
    key(0.16, root({ y: 0.04, z: -0.1, pitch: -18 }), HOP, lean(-12, -22, 0, 8), wings(34, -6), crest(6, 8), tail(-16), jaw(16), HURT),
    fall(0.28, root({ z: -0.1, pitch: -10 }), LAND_DEEP, pelvis(0, -0.03, -0.012), lean(-8, -12, 0, -6), wings(16, 8), crest(-4), jaw(6), HURT),
    key(0.46, root({ z: -0.1, pitch: -6 }), LAND_DEEP, pelvis(0, -0.024, -0.01), lean(-4, -6, 8, 6), wings(8), HURT),
    snap(0.58, root({ z: -0.05, y: 0.04 }), HOP, lean(-2, -4), wings(20), ANGRY),
    fall(0.68, LAND, lean(2, 2, -8, -5), wings(6), ANGRY),
    key(0.82, pelvis(0, -0.004), lean(0, -2, 5, 3), ANGRY),
    key(1.05, OPEN_EYES),
  ],
};

/**
 * Fainting, worn out: a woozy sway with drooping eyes, then it plops down
 * onto its bottom with its head drooping to one side, eyes shut and wing
 * tufts folded, and from the 'shrink' it shrinks away. It sits back as it
 * drops, so the big head stays over its feet.
 */
export const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.004, -0.004), lean(-3, -6, 0, 9), wings(-4), DROWSY),
    key(0.4, pelvis(0, -0.02, -0.01), lean(2, 4, 0, -8), wings(-10), crest(-6), DROWSY),
    fall(0.7, pelvis(0, -0.07, -0.024), lean(6, 14, 0, 17), wings(-18, 10), crest(-18), tail(8), SHUT),
    key(0.84, pelvis(0, -0.076, -0.026), lean(7, 16, 0, 19), wings(-19, 11), crest(-20), tail(9), SHUT),
    key(1.6, pelvis(0, -0.073, -0.026), lean(6, 15, 0, 20), wings(-18, 11), crest(-18), tail(9), SHUT),
  ],
  events: [{ t: 1.02, name: 'shrink' }],
};

/** The foe's move misses: a quick duck and a hop aside, wing tufts up, then a hop back, cheeky. */
export const dodge: Clip = {
  name: 'dodge',
  duration: 0.9,
  keys: [
    key(0),
    key(0.05, pelvis(0, -0.03), lean(6, 10), wings(-8, 8), crest(-14), WORRIED),
    snap(0.14, root({ x: 0.2, y: 0.07 }), HOP, lean(-4, -6, -10, -12), wings(34, -6), crest(6, 6), tail(-14, 10), WORRIED),
    fall(0.24, root({ x: 0.26 }), LAND, lean(2, 0, -6, -8), wings(10), ANGRY),
    key(0.36, root({ x: 0.26 }), LAND, pelvis(0, 0.012), lean(-2, -4, -8), wings(8), HAPPY),
    snap(0.48, root({ x: 0.1, y: 0.06 }), HOP, lean(-2, -4), wings(18), HAPPY),
    fall(0.58, LAND, lean(2, 2), wings(4), ANGRY),
    key(0.9, OPEN_EYES),
  ],
};

/** A move doesn't affect it: it puffs out its chest, beak in the air, and gives a little shake of its head, unbothered. */
export const unaffected: Clip = {
  name: 'unaffected',
  duration: 1.2,
  keys: [
    key(0),
    key(0.16, pelvis(0, 0.012), lean(-10, -20), wings(16, -16), crest(8, 6), tail(-16), HAPPY),
    key(0.36, pelvis(0, 0.014), lean(-11, -21, 10, 4), wings(18, -16), crest(8, 6), tail(-16, 8), HAPPY),
    key(0.52, pelvis(0, 0.014), lean(-11, -21, -10, -4), wings(18, -16), crest(8, 6), tail(-16, -8), HAPPY),
    key(0.68, pelvis(0, 0.012), lean(-10, -20, 4, 2), wings(16, -16), crest(8, 6), tail(-16), jaw(14), HAPPY),
    key(0.86, pelvis(0, -0.002), lean(0, -2), wings(4), crest(2), ANGRY),
    key(1.2, OPEN_EYES),
  ],
};

/** Home from the foe after a run of hits: from its guard at the foe, a crouch and two hops home. */
export const return_home: Clip = {
  name: 'return_home',
  duration: 0.8,
  keys: [
    key(0, ...AT_FOE_GUARD),
    key(0.07, atFoe(BEAK), LAND, pelvis(0, -0.012), lean(6, 10), wings(6, -6), ANGRY),
    ...hopHome(0.12, ANGRY),
    key(0.8, OPEN_EYES),
  ],
};

// Status conditions ------------------------------------------------------------

/**
 * Falling asleep: a big yawn, the eyes drooping, the head nodding down onto
 * its chest, the wing tufts sagging; a drowsy jerk back up, a second nod, and
 * it sinks back onto its feet fast asleep.
 */
export const status_sleep: Clip = {
  name: 'status_sleep',
  duration: 1.7,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.006), lean(-4, -16), wings(10, -4), jaw(28), DROWSY),
    key(0.4, pelvis(0, 0.004), lean(-3, -14, 0, 4), wings(8, -2), jaw(22), DROWSY),
    key(0.62, pelvis(0, -0.02), lean(3, 12, 0, 6), wings(-8, 6), crest(-8), jaw(2), DROWSY),
    fall(0.86, pelvis(0, -0.03, -0.006), lean(5, 18, 0, 9), wings(-12, 8), crest(-12), tail(6), SHUT),
    // A drowsy jerk back up...
    snap(1.0, pelvis(0, -0.01), lean(1, 2, 0, 3), wings(-4, 4), crest(-3), tail(3), DROWSY),
    // ...and it nods off again.
    fall(1.26, pelvis(0, -0.028, -0.006), lean(5, 17, 0, 8), wings(-11, 8), crest(-11), tail(6), SHUT),
    key(1.7, SHUT),
  ],
};

/** Poisoned: a sickly shudder, hunched over with its wing tufts pressed to its belly, swaying queasily, eyes squeezed. */
export const status_poison: Clip = {
  name: 'status_poison',
  duration: 1.4,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.02), lean(8, 20, 0, 4), wings(-14, 14), crest(-12), tail(6), jaw(8), STRAIN),
    key(0.24, pelvis(0.006, -0.028), lean(10, 24, 6, 8), wings(-16, 16), crest(-14), tail(7), jaw(4), STRAIN),
    key(0.44, pelvis(-0.006, -0.028), lean(10, 24, -6, -8), wings(-16, 16), crest(-14), tail(7), jaw(10), STRAIN),
    key(0.64, pelvis(0.006, -0.026), lean(9, 22, 4, 6), wings(-15, 15), crest(-13), tail(6), jaw(4), STRAIN),
    key(0.84, pelvis(0, -0.012), lean(4, 8), wings(-6, 6), crest(-6), HURT),
    key(1.4, OPEN_EYES),
  ],
};

/** Burned: it jumps as if scorched, hops from foot to foot flapping its wing tufts at the sting, then pats it down. */
export const status_burn: Clip = {
  name: 'status_burn',
  duration: 1.3,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    snap(0.06, root({ y: 0.06 }), HOP, lean(-8, -16), wings(40, -8), crest(12, 8), tail(-18), jaw(22), HURT),
    fall(0.16, LAND, lean(2, 0), wings(20), HURT, LEG_REST_L, LEG_REST_R),
    // Foot to foot, flapping.
    key(0.26, { plantFeet: 1, plantLeft: 0 }, pelvis(-0.006, 0.006), lean(-4, -6, 6), wings(34, 10), jaw(14), HURT, LIFT_L, LEG_REST_R),
    key(0.38, { plantFeet: 1, plantRight: 0 }, pelvis(0.006, 0.006), lean(-4, -6, -6), wings(10, -6), jaw(8), HURT, LIFT_R, LEG_REST_L),
    key(0.5, { plantFeet: 1, plantLeft: 0 }, pelvis(-0.006, 0.006), lean(-4, -6, 6), wings(34, 10), jaw(14), HURT, LIFT_L, LEG_REST_R),
    key(0.62, pelvis(0, -0.012), lean(6, 12, 0, 4), wings(-4, 12), HURT, LEG_REST_L, LEG_REST_R),
    key(0.8, pelvis(0, -0.004), lean(2, 2), wings(2), ANGRY, LEG_REST_L, LEG_REST_R),
    key(1.3, OPEN_EYES),
  ],
};

/** Paralysed: it seizes up, stiff with its wing tufts locked out and its crest on end, and twitches in jerks; then the stiffness ebbs. */
export const status_paralysis: Clip = {
  name: 'status_paralysis',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.06, pelvis(0, 0.01), lean(-6, -10), wings(36, -2), crest(24, 14), tail(-24), jaw(18), STRAIN),
    key(0.16, pelvis(0.006, 0.008), lean(-5, -8, 4, 4), wings(32, -2), crest(22, 14), tail(-22), jaw(14), STRAIN),
    snap(0.22, pelvis(-0.004, 0.01), lean(-7, -11, -3, -3), wings(38, -2), crest(24, 14), tail(-24), jaw(20), STRAIN),
    key(0.38, pelvis(0.004, 0.008), lean(-5, -9, 2, 2), wings(33, -2), crest(22, 14), tail(-22), jaw(14), STRAIN),
    snap(0.46, pelvis(-0.006, 0.01), lean(-7, -11, -4, -4), wings(38, -2), crest(24, 14), tail(-24), jaw(18), STRAIN),
    key(0.68, pelvis(0, -0.01), lean(4, 8), wings(0, 4), crest(-4), jaw(6), HURT),
    key(0.9, pelvis(0, -0.004), lean(1, 2), ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

/** Frozen: locked still in the ice, hunched with its wing tufts clamped to its sides, shivering in tiny tremors, then a shake as it comes free. */
export const status_freeze: Clip = {
  name: 'status_freeze',
  duration: 1.4,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.02), lean(4, 8), wings(-14, 6), crest(-14), tail(8), STRAIN),
    key(0.2, pelvis(0.003, -0.022), lean(4, 8, 0, 1.5), wings(-15, 6), crest(-14), tail(8), STRAIN),
    key(0.3, pelvis(-0.003, -0.022), lean(4, 8, 0, -1.5), wings(-15, 6), crest(-14), tail(8), STRAIN),
    key(0.4, pelvis(0.003, -0.022), lean(4, 8, 0, 1.5), wings(-15, 6), crest(-14), tail(8), STRAIN),
    key(0.5, pelvis(-0.003, -0.022), lean(4, 8, 0, -1.5), wings(-15, 6), crest(-14), tail(8), STRAIN),
    key(0.62, pelvis(0.003, -0.022), lean(4, 8, 0, 1), wings(-15, 6), crest(-14), tail(8), STRAIN),
    // Shakes itself free.
    key(0.76, pelvis(0.008, -0.004), lean(0, -2, 10, 8), twist(0, 8), wings(24), crest(6, 6), WORRIED),
    key(0.88, pelvis(-0.008, -0.004), lean(0, -2, -10, -8), twist(0, -8), wings(8), crest(6, 6), WORRIED),
    key(1.02, pelvis(0, -0.004), lean(0, -2), wings(4), ANGRY),
    key(1.4, OPEN_EYES),
  ],
};

/** Confused: its head swims in circles, it totters a step each way on its little legs, then shakes its head hard to clear it. */
export const status_confusion: Clip = {
  name: 'status_confusion',
  duration: 1.6,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    key(0.16, pelvis(0.01, -0.008), lean(2, 6, 12, 12), twist(0, -10), wings(12, 6), DROWSY, LEG_REST_L, LEG_REST_R),
    key(0.34, { plantFeet: 1, plantRight: 0 }, pelvis(-0.004, -0.004), lean(-2, -4, 0, -12), twist(0, 10), wings(20, -6), DROWSY, LIFT_R, LEG_REST_L),
    key(0.52, pelvis(-0.01, -0.008), lean(2, 6, -12, -12), twist(0, 10), wings(12, 6), DROWSY, LEG_REST_L, LEG_REST_R),
    key(0.7, { plantFeet: 1, plantLeft: 0 }, pelvis(0.004, -0.004), lean(-2, -4, 0, 12), twist(0, -10), wings(20, -6), DROWSY, LIFT_L, LEG_REST_R),
    key(0.88, pelvis(0.008, -0.006), lean(2, 4, 10, 10), twist(0, -8), wings(10), DROWSY, LEG_REST_L, LEG_REST_R),
    // A hard shake of the head.
    key(1.02, pelvis(0, -0.004), lean(0, -2, 14, 6), wings(16), STRAIN, LEG_REST_L, LEG_REST_R),
    key(1.12, pelvis(0, -0.004), lean(0, -2, -14, -6), wings(6), STRAIN, LEG_REST_L, LEG_REST_R),
    key(1.24, pelvis(0, -0.002), lean(0, -1, 4, 2), ANGRY, LEG_REST_L, LEG_REST_R),
    key(1.6, OPEN_EYES),
  ],
};

/** Infatuated: dreamy: its head tilts coyly, the eyes happy and soft, the tail wagging, swaying where it stands. */
export const status_infatuation: Clip = {
  name: 'status_infatuation',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0.006, 0.004), lean(-4, -10, 8, 14), wings(-8, 14), tail(-10, 12), HAPPY),
    key(0.5, pelvis(-0.006, 0.004), lean(-4, -10, -8, -14), wings(-8, 14), tail(-10, -12), HAPPY),
    key(0.8, pelvis(0.006, 0.004), lean(-4, -10, 8, 14), wings(-8, 14), tail(-10, 12), HAPPY),
    key(1.06, pelvis(0, 0.002), lean(-2, -6, 0, 6), wings(-4, 8), tail(-8), HAPPY),
    key(1.6, OPEN_EYES),
  ],
};

/** Cursed: a chill runs through it: it shudders, curls in with its wing tufts clutched to its chest and looks about fearfully. */
export const status_curse: Clip = {
  name: 'status_curse',
  duration: 1.5,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.028), lean(6, 14, 0, 6), wings(-16, 18), crest(-24), tail(10), STRAIN),
    key(0.24, pelvis(0.003, -0.032), lean(7, 16, 0, 7), wings(-17, 19), crest(-26), tail(10), STRAIN),
    key(0.46, pelvis(0, -0.03), lean(5, 10, 16, 4), wings(-16, 18), crest(-24), tail(10), WORRIED),
    key(0.68, pelvis(0, -0.03), lean(5, 10, -16, -4), wings(-16, 18), crest(-24), tail(10), WORRIED),
    key(0.9, pelvis(0, -0.02), lean(4, 8), wings(-10, 12), crest(-16), HURT),
    key(1.1, pelvis(0, -0.006), lean(1, 2), wings(-2), crest(-4), ANGRY),
    key(1.5, OPEN_EYES),
  ],
};

/** A nightmare: asleep, it twitches and kicks, the wing tufts flapping in fright, the head tossing, eyes squeezed shut. */
export const status_nightmare: Clip = {
  name: 'status_nightmare',
  duration: 1.5,
  keys: [
    key(0, LEG_REST_R),
    key(0.14, pelvis(0, -0.028, -0.006), lean(4, 16, 0, 8), wings(-10, 6), crest(-12), SHUT, LEG_REST_R),
    snap(0.26, { plantFeet: 1, plantRight: 0 }, pelvis(0, -0.02), lean(-2, 4, 12, -6), wings(26, -6), crest(-6), jaw(14), STRAIN, legR([-0.05, -0.5, 0.86], [-0.02, -0.7, 0.71])),
    key(0.38, pelvis(0, -0.028), lean(4, 16, -10, 8), wings(-10, 6), crest(-12), jaw(4), STRAIN, LEG_REST_R),
    snap(0.5, pelvis(0, -0.018), lean(-3, 2, -14, -8), wings(30, -6), crest(-4), jaw(18), STRAIN, LEG_REST_R),
    key(0.66, pelvis(0, -0.028), lean(4, 16, 8, 8), wings(-8, 6), crest(-12), jaw(4), STRAIN, LEG_REST_R),
    key(0.9, pelvis(0, -0.03, -0.006), lean(5, 18, 0, 9), wings(-12, 8), crest(-12), SHUT, LEG_REST_R),
    key(1.5, SHUT),
  ],
};

/** Bound (Wrap, Fire Spin): squeezed tight, its wing tufts pinned to its sides, it strains and wriggles against the bind. */
export const status_wrapped: Clip = {
  name: 'status_wrapped',
  duration: 1.4,
  keys: [
    key(0),
    snap(0.06, pelvis(0, -0.012), lean(-2, -6), wings(-20, 4), crest(-10), tail(6), STRAIN),
    key(0.2, pelvis(0.008, -0.01), lean(-2, -8, 8, 10), twist(10, 6), wings(-20, 4), crest(-8), jaw(16), STRAIN),
    key(0.36, pelvis(-0.008, -0.01), lean(-2, -8, -8, -10), twist(-10, -6), wings(-20, 4), crest(-8), jaw(8), STRAIN),
    key(0.52, pelvis(0.008, -0.01), lean(-2, -8, 8, 10), twist(10, 6), wings(-20, 4), crest(-8), jaw(16), STRAIN),
    key(0.7, pelvis(0, -0.014), lean(4, 8), wings(-12, 6), crest(-10), jaw(4), HURT),
    key(0.92, pelvis(0, -0.006), lean(1, 2), wings(-2), ANGRY),
    key(1.4, OPEN_EYES),
  ],
};

// Idles --------------------------------------------------------------------------

/** Asleep (a loop): plopped down on its bottom, head drooped onto its chest, breathing slowly; a little bob of the crest. */
export const idle_asleep: Clip = {
  name: 'idle_asleep',
  duration: 3.2,
  loop: true,
  keys: [
    key(0, pelvis(0, -0.062, -0.016), lean(5, 20, 0, 10), wings(-14, 8), crest(-15), tail(6), SHUT),
    key(1.4, pelvis(0, -0.052, -0.014), lean(3, 17, 0, 12), wings(-12, 8), crest(-13), tail(5), jaw(4), SHUT),
    key(3.2, pelvis(0, -0.062, -0.016), lean(5, 20, 0, 10), wings(-14, 8), crest(-15), tail(6), SHUT),
  ],
};

/** Worn down (a loop): panting with its beak open, the head low and the wing tufts hanging, still facing the foe. */
export const idle_tired: Clip = {
  name: 'idle_tired',
  duration: 1.6,
  loop: true,
  keys: [
    key(0, pelvis(0, -0.024), lean(6, 14, 0, 4), wings(-12, 6), crest(-12), tail(6), jaw(16), DROWSY),
    key(0.4, pelvis(0, -0.018), lean(4, 10, 0, 3), wings(-10, 6), crest(-10), tail(5), jaw(6), DROWSY),
    key(0.8, pelvis(0, -0.026), lean(6, 15, 0, 4), wings(-12, 6), crest(-12), tail(6), jaw(18), DROWSY),
    key(1.2, pelvis(0, -0.018), lean(4, 10, 0, 3), wings(-10, 6), crest(-10), tail(5), jaw(6), DROWSY),
    key(1.6, pelvis(0, -0.024), lean(6, 14, 0, 4), wings(-12, 6), crest(-12), tail(6), jaw(16), DROWSY),
  ],
};

// Moments ------------------------------------------------------------------------

/** A stat rises: it puffs up, chest out and crest standing, with a flutter and a proud cheep. */
export const stat_up: Clip = {
  name: 'stat_up',
  duration: 1.2,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.02), lean(4, 8), wings(-6, 6), crest(-8), ANGRY),
    snap(0.24, pelvis(0, 0.014), lean(-10, -18), wings(34, -8), crest(24, 12), tail(-22), jaw(20), ANGRY),
    key(0.36, pelvis(0, 0.015), lean(-10, -18), wings(16, -4), crest(24, 12), tail(-22), jaw(14), ANGRY),
    key(0.48, pelvis(0, 0.014), lean(-10, -18), wings(32, -8), crest(24, 12), tail(-22), jaw(8), ANGRY),
    key(0.7, pelvis(0, -0.004), lean(2, 0), wings(4), crest(4, 4), tail(-6), HAPPY),
    key(1.2, OPEN_EYES),
  ],
};

/** A stat falls: it deflates, head sinking, crest drooping, the wing tufts falling to its sides. */
export const stat_down: Clip = {
  name: 'stat_down',
  duration: 1.2,
  keys: [
    key(0),
    key(0.12, pelvis(0, 0.004), lean(-2, -6), wings(8), crest(4), WORRIED),
    fall(0.4, pelvis(0, -0.03), lean(6, 18, 0, 6), wings(-16, 8), crest(-22), tail(8), jaw(4), HURT),
    key(0.62, pelvis(0, -0.028), lean(6, 16, 0, 5), wings(-15, 8), crest(-20), tail(8), HURT),
    key(0.84, pelvis(0, -0.01), lean(2, 4), wings(-4), crest(-4), ANGRY),
    key(1.2, OPEN_EYES),
  ],
};

/** Level up: it hops up and down for joy, wing tufts flapping, crest bouncing, cheeping. */
export const level_up: Clip = {
  name: 'level_up',
  duration: 1.4,
  keys: [
    key(0),
    key(0.08, pelvis(0, -0.026), lean(4, 6), wings(-6), HAPPY),
    snap(0.18, root({ y: 0.12 }), HOP, lean(-8, -16), wings(44, -8), crest(18, 10), tail(-20), jaw(26), HAPPY),
    fall(0.3, LAND, lean(4, 4), wings(10), crest(6, 6), jaw(8), HAPPY),
    snap(0.4, root({ y: 0.1 }), HOP, lean(-8, -16), wings(44, -8), crest(18, 10), tail(-20), jaw(26), HAPPY),
    fall(0.52, LAND, lean(4, 4), wings(10), crest(6, 6), jaw(8), HAPPY),
    key(0.66, pelvis(0, 0.01), lean(-6, -14), wings(30, -6), crest(12, 8), tail(-16), jaw(18), HAPPY),
    key(0.86, pelvis(0, -0.004), lean(0, -2), wings(6), crest(2), HAPPY),
    key(1.4, OPEN_EYES),
  ],
};

/**
 * Drained: its strength pulled out of it toward the foe: it is tugged
 * forward, the wing tufts and crest reaching after it, then it sags and
 * wobbles on its little legs from side to side, and steadies.
 */
export const drained: Clip = {
  name: 'drained',
  duration: 1.4,
  keys: [
    key(0),
    key(0.1, pelvis(0, 0.006), lean(-4, -8), wings(10), STRAIN),
    // Tugged toward the foe, everything trailing forward.
    key(0.3, pelvis(0, 0.004, 0.012), lean(12, 4), wings(20, 30), crest(12, 8), tail(-10), jaw(16), STRAIN),
    // It sags, wobbling.
    fall(0.52, pelvis(0.008, -0.034), lean(4, 16, 10, 12), twist(0, 8), wings(-14, 6), crest(-16), tail(6), jaw(6), DROWSY),
    key(0.72, pelvis(-0.008, -0.032), lean(4, 16, -10, -12), twist(0, -8), wings(-14, 6), crest(-16), tail(6), jaw(4), DROWSY),
    key(0.92, pelvis(0, -0.012), lean(2, 4), wings(-4), crest(-4), ANGRY),
    key(1.4, OPEN_EYES),
  ],
};

/** Healed: it perks up, a happy shake of its feathers from crest to tail, a flutter and a chirp. */
export const healed: Clip = {
  name: 'healed',
  duration: 1.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, 0.01), lean(-6, -14), wings(16), crest(10, 6), HAPPY),
    key(0.28, pelvis(0.006, 0.008), lean(-4, -10, 10, 8), twist(0, 8), wings(30, -4), crest(12, 8), tail(-14, 12), HAPPY),
    key(0.4, pelvis(-0.006, 0.008), lean(-4, -10, -10, -8), twist(0, -8), wings(12, 4), crest(12, 8), tail(-14, -12), HAPPY),
    key(0.52, pelvis(0.004, 0.008), lean(-4, -10, 6, 5), twist(0, 5), wings(28, -4), crest(12, 8), tail(-14, 8), jaw(20), HAPPY),
    key(0.72, pelvis(0, -0.004), lean(0, -2), wings(4), crest(2), jaw(2), HAPPY),
    key(1.3, OPEN_EYES),
  ],
};

/** Focusing (Focus Punch's first turn): eyes shut, it stills itself, the crest settling, breathing slowly, gathering. */
export const focus: Clip = {
  name: 'focus',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.02), lean(4, 10), wings(-10, 10), crest(-12), tail(4), SHUT),
    key(0.6, pelvis(0, -0.014), lean(3, 8), wings(-8, 10), crest(-10), tail(4), SHUT),
    key(1.0, pelvis(0, -0.022), lean(4, 10), wings(-10, 10), crest(-12), tail(4), SHUT),
    snap(1.12, pelvis(0, 0.004), lean(-4, -8), wings(20, -6), crest(10, 6), ANGRY),
    key(1.5, OPEN_EYES),
  ],
};

/** Hanging on (Endure's hit): knocked almost off its feet, it wobbles, digs its talons in and rights itself, panting and defiant. */
export const hang_on: Clip = {
  name: 'hang_on',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.06, pelvis(0, -0.02, -0.012), lean(-10, -18, 0, 12), wings(34, -8), crest(6, 6), tail(-16), jaw(20), HURT),
    key(0.2, pelvis(0.01, -0.03, -0.01), lean(-6, -10, 0, 16), wings(30, -4), crest(2), tail(-12), jaw(12), HURT),
    key(0.36, pelvis(-0.004, -0.034), lean(8, 14, 0, -4), wings(-8, 10), crest(-12), jaw(18), STRAIN),
    key(0.56, pelvis(0, -0.028), lean(8, 12, 0, 2), wings(-6, 8), crest(-10), jaw(10), STRAIN),
    key(0.76, pelvis(0, -0.006), lean(-2, -6), wings(16, -4), crest(8, 6), jaw(14), ANGRY),
    key(0.94, pelvis(0, -0.004), lean(0, -2), wings(4), ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

/** Flinching: it cringes, head ducked and wing tufts thrown up before its face, eyes squeezed, then peeks out. */
export const flinch: Clip = {
  name: 'flinch',
  duration: 0.95,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.03, -0.012), lean(6, 16, 0, 6), wings(10, 36), crest(-24), tail(10), STRAIN),
    key(0.28, pelvis(0, -0.032, -0.012), lean(6, 17, 0, 7), wings(10, 36), crest(-25), tail(10), STRAIN),
    key(0.46, pelvis(0, -0.016), lean(2, 6, 8), wings(8, 14), crest(-8), WORRIED),
    key(0.62, pelvis(0, -0.004), lean(0, -2), wings(2), ANGRY),
    key(0.95, OPEN_EYES),
  ],
};

/** Recharging (after Hyper Beam): spent, it slumps on its short legs, panting, the wing tufts hanging, then gathers itself. */
export const recharge: Clip = {
  name: 'recharge',
  duration: 1.5,
  keys: [
    key(0),
    fall(0.2, pelvis(0, -0.036), lean(8, 20, 0, 6), wings(-16, 6), crest(-18), tail(8), jaw(18), DROWSY),
    key(0.46, pelvis(0, -0.03), lean(7, 18, 0, 5), wings(-15, 6), crest(-17), tail(8), jaw(6), DROWSY),
    key(0.7, pelvis(0, -0.036), lean(8, 20, 0, 6), wings(-16, 6), crest(-18), tail(8), jaw(18), DROWSY),
    key(0.94, pelvis(0, -0.03), lean(7, 18, 0, 5), wings(-15, 6), crest(-17), tail(8), jaw(6), DROWSY),
    key(1.16, pelvis(0, -0.008), lean(0, -2), wings(4), crest(0), ANGRY),
    key(1.5, OPEN_EYES),
  ],
};

/** Waking: from its plopped-down sleep it jolts up onto its feet with a start, eyes wide, then shakes its head awake. */
export const wake: Clip = {
  name: 'wake',
  duration: 1.2,
  keys: [
    key(0, pelvis(0, -0.062, -0.016), lean(5, 20, 0, 10), wings(-14, 8), crest(-15), tail(6), SHUT),
    snap(0.12, pelvis(0, 0.01), lean(-8, -16), wings(36, -8), crest(20, 12), tail(-20), jaw(18), WORRIED),
    key(0.28, pelvis(0, 0.004), lean(-4, -8, 10, 6), wings(16), crest(10, 8), jaw(6), WORRIED),
    key(0.4, pelvis(0, 0.002), lean(-2, -4, -10, -6), wings(8), crest(6, 6), ANGRY),
    key(0.54, pelvis(0, -0.004), lean(0, -2, 4, 2), ANGRY),
    key(1.2, OPEN_EYES),
  ],
};

/** Shaking a condition off (thawed, clear-headed, cured): a gather, then a vigorous whole-body shake like a wet chick, and back on guard. */
export const shake_off: Clip = {
  name: 'shake_off',
  duration: 1.2,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.024), lean(4, 12), wings(-8, 8), crest(-12), SHUT),
    key(0.22, pelvis(0.01, -0.012), lean(-2, -4, 14, 10), twist(10, 10), wings(30, -4), crest(8, 10), tail(-14, 14), SHUT),
    key(0.3, pelvis(-0.01, -0.012), lean(-2, -4, -14, -10), twist(-10, -10), wings(12, 6), crest(8, 10), tail(-14, -14), SHUT),
    key(0.38, pelvis(0.008, -0.012), lean(-2, -4, 12, 8), twist(8, 8), wings(30, -4), crest(8, 10), tail(-14, 12), SHUT),
    key(0.46, pelvis(-0.006, -0.012), lean(-2, -4, -10, -6), twist(-6, -6), wings(12, 6), crest(6, 8), tail(-12, -10), SHUT),
    key(0.6, pelvis(0, -0.004), lean(0, -2), wings(6), crest(2), ANGRY),
    key(1.2, OPEN_EYES),
  ],
};

/** Breaking free of a bind: it strains, then bursts out of it, wing tufts flung open wide, crest up, with a cry. */
export const break_free: Clip = {
  name: 'break_free',
  duration: 1.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), lean(4, 8), wings(-20, 4), crest(-10), tail(6), STRAIN),
    key(0.3, pelvis(0.004, -0.024), lean(5, 10, 0, 2), wings(-20, 4), crest(-12), tail(6), jaw(12), STRAIN),
    snap(0.4, pelvis(0, 0.014), lean(-10, -20), wings(46, -10), crest(26, 14), tail(-24), jaw(36), ANGRY),
    key(0.56, pelvis(0, 0.015), lean(-10, -20, 0, 2), wings(42, -10), crest(26, 14), tail(-24), jaw(28), ANGRY),
    key(0.78, pelvis(0, -0.004), lean(0, -2), wings(6), crest(4, 4), jaw(4), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'cry' }],
};

// Weather ------------------------------------------------------------------------

/** Rain: a fire chick hates it: it hunches, crest flattened, wing tufts over its back, and shakes the drops off its head. */
export const weather_rain: Clip = {
  name: 'weather_rain',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.03), lean(6, 16), wings(-6, -24), crest(-30), tail(10), STRAIN),
    key(0.5, pelvis(0, -0.032), lean(7, 17, 0, 2), wings(-6, -26), crest(-32), tail(10), STRAIN),
    key(0.7, pelvis(0.006, -0.026), lean(4, 12, 12, 8), wings(-4, -22), crest(-26), tail(8), STRAIN),
    key(0.82, pelvis(-0.006, -0.026), lean(4, 12, -12, -8), wings(-4, -22), crest(-26), tail(8), STRAIN),
    key(1.0, pelvis(0, -0.012), lean(2, 4), wings(-2), crest(-8), WORRIED),
    key(1.5, OPEN_EYES),
  ],
};

/** Strong sunlight: it basks: face tipped up to the sun, eyes closed happily, wing tufts spread, the crest standing. */
export const weather_sun: Clip = {
  name: 'weather_sun',
  duration: 1.5,
  keys: [
    key(0),
    key(0.3, pelvis(0, 0.008), lean(-6, -22), wings(24, -2), crest(14, 10), tail(-14), HAPPY),
    key(0.62, pelvis(0.006, 0.01), lean(-7, -24, 6, 6), wings(28, -2), crest(16, 10), tail(-16, 8), HAPPY),
    key(0.94, pelvis(-0.006, 0.008), lean(-6, -22, -6, -6), wings(24, -2), crest(14, 10), tail(-14, -8), HAPPY),
    key(1.16, pelvis(0, -0.004), lean(0, -2), wings(4), crest(2), HAPPY),
    key(1.5, OPEN_EYES),
  ],
};

/** A sandstorm: it screws its eyes shut and turns its head aside, a wing tuft raised before its face, flinching at the grit. */
export const weather_sand: Clip = {
  name: 'weather_sand',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.024), lean(6, 12, -24, -6), wings(4, 20), crest(-16), tail(6), STRAIN),
    key(0.46, pelvis(0.003, -0.026), lean(7, 13, -26, -7), wings(6, 24), crest(-18), tail(6), STRAIN),
    key(0.7, pelvis(-0.003, -0.026), lean(7, 13, -22, -5), wings(4, 22), crest(-18), tail(6), STRAIN),
    key(0.94, pelvis(0, -0.012), lean(2, 4, -6), wings(2, 6), crest(-6), WORRIED),
    key(1.5, OPEN_EYES),
  ],
};

/** Hail: it flinches under the stones, ducking its big head in, the wing tufts over it, hopping from foot to foot. */
export const weather_hail: Clip = {
  name: 'weather_hail',
  duration: 1.4,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    snap(0.08, pelvis(0, -0.03), lean(8, 18), wings(10, 30), crest(-28), tail(10), STRAIN, LEG_REST_L, LEG_REST_R),
    key(0.24, { plantFeet: 1, plantLeft: 0 }, pelvis(-0.006, -0.024), lean(8, 18, 6), wings(10, 30), crest(-28), STRAIN, LIFT_L, LEG_REST_R),
    key(0.4, { plantFeet: 1, plantRight: 0 }, pelvis(0.006, -0.024), lean(8, 18, -6), wings(10, 30), crest(-28), STRAIN, LIFT_R, LEG_REST_L),
    key(0.58, pelvis(0, -0.03), lean(8, 18), wings(10, 30), crest(-28), STRAIN, LEG_REST_L, LEG_REST_R),
    key(0.8, pelvis(0, -0.012), lean(2, 4), wings(4, 8), crest(-8), WORRIED, LEG_REST_L, LEG_REST_R),
    key(1.4, OPEN_EYES),
  ],
};

export const SITUATIONS: Clip[] = [
  idle, intro, hit, hit_strong, faint, dodge, unaffected, return_home,
  status_sleep, status_poison, status_burn, status_paralysis, status_freeze, status_confusion, status_infatuation, status_curse, status_nightmare, status_wrapped,
  idle_asleep, idle_tired, stat_up, stat_down, level_up, drained, healed, focus, hang_on,
  flinch, recharge, wake, shake_off, break_free, weather_rain, weather_sun, weather_sand, weather_hail,
];
