// Combusken in every battle situation (src/battle3d/situations.ts): the
// moments every battle plays, getting out of the way of a miss, shrugging
// off what doesn't affect it, coming home after a run of hits, each status
// condition, sleeping and flagging (loops), the stat and message situations,
// and the weather. Each ends on its crane stance (the loops on their first
// pose, the faint curled). They play at home: arms wide rather than
// overhead, so from our side it stays clear of the healthboxes.

import type { Clip } from '../../../anim/clip';
import type { Arm } from './kit';
import {
  ANGRY, AT_FOE_GUARD, BRACED, KICK, CHAMBER, CROSSED, DROWSY, ELBOWS_BACK, FEET, FOLDED, GUARD, HAPPY, HOP, HURT, LIMP,
  OPEN_EYES, SHUT, SKIP, SQUEEZE, WINGS_OUT, WORRIED, X_GUARD,
  armL, armR, arms, at, atFoe, bend, both, crest, fall, jaw, key, legR, mirrorArm, pelvis, root, snap, tail,
} from './kit';

const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];
/** Arms thrown up and out in surprise or pain. */
const FLUNG = both(A([-0.85, -0.25, 0.46], [-0.45, 0.35, 0.82], [-0.3, 0.55, 0.78]));
/** Hands on its knees. */
const ON_KNEES = both(A([-0.22, -0.82, 0.53], [0, -0.96, 0.28], [0.05, -0.99, 0.1]));
/** Crouched on its heels, both feet down (asleep, resting). */
const SQUAT = { ...FEET, pelvis: { y: -0.16, z: -0.03 } };

// The moments every battle plays ------------------------------------------------

/** Standing ready on one leg: the life layer breathes and bounces it; on top, the raised foot flexes its talons and the arms sway a little. */
export const idle: Clip = {
  name: 'idle',
  duration: 2.6,
  loop: true,
  keys: [
    key(0),
    key(0.9, pelvis(0, -0.006), legR([-0.25, 0.26, 0.93], [-0.15, -0.2, 0.97]), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(1.7, pelvis(0, -0.003), legR([-0.25, 0.32, 0.92], [-0.15, -0.12, 0.98]), { bones: { spine: { x: 0.5 } }, post: { armR: { x: -1 }, armL: { x: 1 } } }),
    key(2.6),
  ],
};

/** Out of its ball: crouched small on both feet, it springs up onto its kicking leg with its arms flung wide and cries, the crest standing; then settles into its crane stance. */
export const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, FEET, pelvis(0, -0.06), bend(16, 4, 4, 18), CROSSED, crest(-14), SHUT),
    key(0.2, FEET, pelvis(0, -0.08), bend(20, 6, 4, 22), CROSSED, crest(-16), SHUT),
    snap(0.42, legR([-0.2, 0.55, 0.81], [-0.1, -0.55, 0.83]), pelvis(0, 0.014), bend(-14, -8, -6, -22), WINGS_OUT, jaw(34), crest(10), tail(-18), ANGRY),
    key(0.62, legR([-0.2, 0.52, 0.83], [-0.1, -0.58, 0.81]), pelvis(0, 0.01), bend(-13, -8, -6, -20, 0, 4), WINGS_OUT, jaw(30), crest(10), ANGRY),
    key(0.8, legR([-0.2, 0.55, 0.81], [-0.1, -0.55, 0.83]), pelvis(0, 0.012), bend(-14, -8, -6, -21, 0, -4), WINGS_OUT, jaw(32), crest(9), ANGRY),
    key(0.98, pelvis(0, 0.008), bend(-11, -6, -4, -16), WINGS_OUT, jaw(8), crest(6), ANGRY),
    key(1.2, pelvis(0, -0.015), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Taking a hit: it snaps back with its arms flung and the hurt eyes (the battler adds a sprung recoil), hops on its standing leg, and shakes it off. */
export const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, bend(-14, -6, -4, -18), FLUNG, crest(-12), HURT),
    key(0.2, bend(-6, -2, -2, -8), crest(-4), HURT),
    key(0.36, bend(4, 1, 0, 4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/** A critical or super-effective blow: knocked further back with a squawk, it staggers back on both feet, catches itself and hops back into its stance. */
export const hit_strong: Clip = {
  name: 'hit_strong',
  duration: 1.0,
  keys: [
    key(0),
    snap(0.05, root({ z: -0.04 }), bend(-22, -10, -6, -24), FLUNG, jaw(20), crest(-16), HURT),
    key(0.2, FEET, root({ z: -0.07 }), pelvis(0, 0.004), bend(-12, -6, -4, -14), FLUNG, jaw(10), HURT),
    key(0.36, FEET, root({ z: -0.09 }), pelvis(0, -0.055), bend(12, 6, 4, 8), LIMP, HURT),
    key(0.56, root({ z: -0.04 }), pelvis(0, -0.04), bend(8, 2, 0, -2, 0, 4), GUARD, ANGRY),
    key(1.0, OPEN_EYES),
  ],
};

/**
 * Fainting, worn out (not dying): a woozy sway on its one leg, then it sets
 * both feet down and sinks back onto its heels, hugging itself, head bowed
 * and eyes shut, and from the 'shrink' it shrinks away. It sits back as it
 * curls, so its head stays clear of our healthbox.
 */
export const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02, roll: 4 }), bend(-8, -4, -2, -12, 0, 6), DROWSY),
    key(0.48, FEET, pelvis(0, -0.08), root({ z: -0.04 }), bend(12, 5, 6, 20), CROSSED, crest(-10), SHUT),
    key(0.82, FEET, pelvis(0, -0.18), root({ z: -0.08 }), bend(26, 12, 10, 28), CROSSED, crest(-16), SHUT),
    key(0.96, FEET, pelvis(0, -0.19), root({ z: -0.08 }), bend(28, 13, 10, 30), CROSSED, crest(-17), SHUT),
    key(1.6, FEET, pelvis(0, -0.185), root({ z: -0.08 }), bend(27, 12, 10, 29), CROSSED, crest(-16), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// Engaging the foe ---------------------------------------------------------------

/** The foe's move misses: it skips aside out of the way on its standing leg, leaning away, then skips back into its guard. */
export const dodge: Clip = {
  name: 'dodge',
  duration: 0.9,
  keys: [
    key(0),
    key(0.06, pelvis(0, -0.045), bend(8, 2, 0, -6), GUARD, OPEN_EYES),
    key(0.16, root({ x: 0.16, y: 0.07, roll: -10 }), HOP, bend(2, 0, 0, -8, -10), GUARD, ANGRY),
    key(0.28, root({ x: 0.2, roll: -6 }), SKIP, bend(10, 0, 0, -6, -8), GUARD, ANGRY),
    key(0.44, root({ x: 0.08, y: 0.05 }), HOP, bend(4, 0, 0, -4), GUARD, ANGRY),
    key(0.56, root({ x: 0 }), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(0.9, OPEN_EYES),
  ],
};

/** A move doesn't affect it: it stands firm on both feet, arms folded, chin up, and shakes its head, unimpressed. */
export const unaffected: Clip = {
  name: 'unaffected',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, 0.006), bend(-6, -4, -2, -10), FOLDED, SHUT),
    key(0.4, FEET, pelvis(0, 0.006), bend(-6, -4, -2, -10, 10), FOLDED, SHUT),
    key(0.58, FEET, pelvis(0, 0.006), bend(-6, -4, -2, -10, -10), FOLDED, SHUT),
    key(0.78, FEET, pelvis(0, 0.008), bend(-8, -5, -2, -13, 2), FOLDED, crest(6), ANGRY),
    key(0.94, pelvis(0, 0.004), bend(-6, -4, -2, -11, 3), FOLDED, ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

/** Home from the foe after a run of hits: from its guard at the foe it pushes off, hops home and lands on its standing leg. */
export const return_home: Clip = {
  name: 'return_home',
  duration: 0.8,
  keys: [
    key(0, ...AT_FOE_GUARD),
    // A crouch to push off...
    key(0.08, atFoe(KICK), FEET, pelvis(0, -0.06), bend(14, 2, 0, -2), GUARD, ANGRY),
    // ...and one springing hop home.
    snap(0.24, at(0.5), root({ y: 0.08 }), HOP, bend(6, 0, 0, 0), GUARD, ANGRY),
    fall(0.38, at(0), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(0.8, OPEN_EYES),
  ],
};

// Status conditions ------------------------------------------------------------

/** Falling asleep: a drowsy sway, the raised foot sinking to the ground, the eyes drooping shut, the head nodding forward. */
export const status_sleep: Clip = {
  name: 'status_sleep',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, root({ roll: 3 }), bend(4, 2, 2, 6, 0, 4), DROWSY),
    key(0.5, FEET, pelvis(0, -0.035), root({ roll: -2 }), bend(10, 5, 6, 14, 0, -6), LIMP, crest(-8), SHUT),
    key(0.8, FEET, pelvis(0, -0.027), root({ roll: -1 }), bend(6, 2, 4, 10, 0, -5), LIMP, crest(-6), SHUT),
    key(1.1, FEET, pelvis(0, -0.05), root({ roll: 2 }), bend(14, 6, 8, 18, 0, 7), LIMP, crest(-10), SHUT),
    key(1.6, SHUT),
  ],
};

/** Poisoned: a sickly shudder, hunched over on both feet with its arms wrapped round its middle, wincing and swaying queasily. */
export const status_poison: Clip = {
  name: 'status_poison',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, FEET, pelvis(0, -0.055), bend(18, 8, 4, 12, 0, 4), CROSSED, HURT),
    key(0.22, FEET, pelvis(0.006, -0.057), root({ roll: 3 }), bend(19, 8, 4, 13, 0, 7), CROSSED, HURT),
    key(0.32, FEET, pelvis(-0.006, -0.055), root({ roll: -3 }), bend(18, 8, 4, 12, 0, 1), CROSSED, HURT),
    key(0.42, FEET, pelvis(0.006, -0.058), root({ roll: 3 }), bend(19, 8, 4, 13, 0, 7), CROSSED, HURT),
    key(0.54, FEET, pelvis(-0.004, -0.055), root({ roll: -2 }), bend(17, 8, 4, 12, 0, 2), CROSSED, WORRIED),
    key(0.8, pelvis(0, -0.035), bend(8, 4, 2, 6, 0, 3), CROSSED, WORRIED),
    key(1.35, OPEN_EYES),
  ],
};

/** Burned: it jolts as if scorched and hops on its standing leg, shaking its right hand out hard, then brushes the heat off. */
export const status_burn: Clip = {
  name: 'status_burn',
  duration: 1.25,
  keys: [
    key(0),
    snap(0.06, root({ y: 0.03 }), HOP, pelvis(0, 0.01), bend(-10, -4, -2, -14), FLUNG, jaw(16), crest(-10), HURT),
    key(0.18, SKIP, pelvis(0, -0.025), bend(4, 2, 0, -4, -8), armR(A([-0.8, -0.3, 0.52], [-0.6, -0.6, 0.53], [-0.5, -0.75, 0.43])), armL(mirrorArm(A([-0.45, -0.4, 0.8], [0.22, 0.78, 0.59], [0.28, 0.9, 0.33]))), HURT),
    key(0.28, pelvis(0, -0.027), bend(4, 2, 0, -4, -8), armR(A([-0.8, -0.1, 0.59], [-0.5, 0.3, 0.81], [-0.4, 0.5, 0.77])), armL(mirrorArm(A([-0.45, -0.4, 0.8], [0.22, 0.78, 0.59], [0.28, 0.9, 0.33]))), HURT),
    key(0.38, pelvis(0, -0.025), bend(4, 2, 0, -4, -8), armR(A([-0.8, -0.3, 0.52], [-0.6, -0.6, 0.53], [-0.5, -0.75, 0.43])), armL(mirrorArm(A([-0.45, -0.4, 0.8], [0.22, 0.78, 0.59], [0.28, 0.9, 0.33]))), HURT),
    key(0.56, pelvis(0, -0.025), root({ roll: 3 }), bend(2, 2, 0, -4, 6), GUARD, ANGRY),
    key(0.72, pelvis(0, -0.023), root({ roll: -2 }), bend(2, 2, 0, -4, -4), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Paralysed: it seizes up on both feet, limbs locked stiff and splayed, twitching in jerks; then the stiffness ebbs. */
export const status_paralysis: Clip = {
  name: 'status_paralysis',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.05, FEET, pelvis(0, 0.004), bend(-6, -4, -2, -8), SQUEEZE, jaw(8), both(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53]))),
    key(0.12, FEET, root({ x: 0.01 }), pelvis(0, 0.004), bend(-6, -4, -2, -8, 0, 4), SQUEEZE, jaw(8), arms(A([-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44], [-0.75, -0.3, 0.59]), mirrorArm(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53])))),
    key(0.18, FEET, root({ x: -0.01 }), pelvis(0, 0.004), bend(-7, -4, -2, -8, 0, -4), SQUEEZE, jaw(6), arms(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53]), mirrorArm(A([-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44], [-0.75, -0.3, 0.59])))),
    key(0.24, FEET, root({ x: 0.008 }), pelvis(0, 0.005), bend(-6, -4, -2, -8, 0, 3), SQUEEZE, jaw(8), arms(A([-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44], [-0.75, -0.3, 0.59]), mirrorArm(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53])))),
    key(0.3, FEET, root({ x: -0.008 }), pelvis(0, 0.004), bend(-7, -4, -2, -8, 0, -3), SQUEEZE, jaw(6), arms(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53]), mirrorArm(A([-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44], [-0.75, -0.3, 0.59])))),
    key(0.5, FEET, root({ x: 0.004 }), pelvis(0, 0.003), bend(-6, -4, -2, -8, 0, 2), SQUEEZE, jaw(4), both(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53]))),
    key(0.58, FEET, root({ x: -0.006 }), pelvis(0, 0.004), bend(-7, -4, -2, -8, 0, -3), SQUEEZE, jaw(6), arms(A([-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44], [-0.75, -0.3, 0.59]), mirrorArm(A([-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4], [-0.75, -0.4, 0.53])))),
    key(0.86, FEET, pelvis(0, -0.035), bend(8, 4, 2, 6), LIMP, DROWSY),
    key(1.3, OPEN_EYES),
  ],
};

/** Frozen: locked still in the ice mid-guard on its one leg, straining against it in tiny tremors, then a shiver as it comes free. */
export const status_freeze: Clip = {
  name: 'status_freeze',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.1, pelvis(0, -0.03), bend(6, 2, 0, 2), X_GUARD, SQUEEZE),
    key(0.34, pelvis(0.002, -0.031), bend(6, 2, 0, 2, 0, 0.8), X_GUARD, SQUEEZE),
    key(0.58, pelvis(-0.002, -0.03), bend(6.6, 2, 0, 2, 0, -0.8), X_GUARD, SQUEEZE),
    key(0.82, pelvis(0.002, -0.031), bend(6, 2, 0, 2.6, 0, 0.8), X_GUARD, SQUEEZE),
    key(0.98, root({ roll: 4 }), pelvis(0, -0.02), bend(4, 2, 0, 0, 8), GUARD, crest(-6), ANGRY),
    key(1.08, root({ roll: -4 }), pelvis(0, -0.02), bend(4, 2, 0, 0, -8), GUARD, crest(-2), ANGRY),
    key(1.18, root({ roll: 2 }), pelvis(0, -0.015), bend(2, 2, 0, 0, 4), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Confused: it wobbles off balance, hopping on its one leg, the head swimming in circles, then shakes its head to clear it. */
export const status_confusion: Clip = {
  name: 'status_confusion',
  duration: 1.65,
  keys: [
    key(0),
    key(0.2, root({ roll: 6 }), bend(4, 2, 2, 4, 10, 8), LIMP, DROWSY),
    key(0.36, root({ x: -0.04, y: 0.04, roll: -6 }), HOP, bend(6, 2, 2, 2, 0, -10), LIMP, DROWSY),
    key(0.5, root({ x: -0.04, roll: -4 }), SKIP, bend(4, 2, 2, 6, -10, -6), LIMP, DROWSY),
    key(0.68, root({ x: 0.01, y: 0.04, roll: 6 }), HOP, bend(6, 2, 2, 2, 0, 10), LIMP, DROWSY),
    key(0.82, root({ x: 0, roll: 3 }), SKIP, bend(4, 2, 2, 4, 8, 6), LIMP, DROWSY),
    key(1.0, bend(4, 2, 0, -2, 14), GUARD, SHUT),
    key(1.12, bend(4, 2, 0, -2, -14), GUARD, SHUT),
    key(1.26, bend(4, 2, 0, -2, 4), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
};

/** Infatuated: lovestruck, it sways dreamily with its clawed hands clasped before its chest, the head tilted, happy eyes; then snaps out of it. */
export const status_infatuation: Clip = {
  name: 'status_infatuation',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, pelvis(0, 0.004), root({ roll: 3 }), bend(-2, -2, 0, -6, 0, 14), both(A([-0.3, -0.6, 0.74], [0.7, 0.3, 0.65], [0.6, 0.6, 0.53])), HAPPY),
    key(0.46, pelvis(0, 0.002), root({ roll: -3 }), bend(-2, -2, 0, -6, 0, -14), both(A([-0.3, -0.6, 0.74], [0.7, 0.3, 0.65], [0.6, 0.6, 0.53])), HAPPY),
    key(0.7, pelvis(0, 0.004), root({ roll: 3 }), bend(-2, -2, 0, -6, 0, 14), both(A([-0.3, -0.6, 0.74], [0.7, 0.3, 0.65], [0.6, 0.6, 0.53])), HAPPY),
    key(0.94, pelvis(0, 0.002), root({ roll: -2 }), bend(-2, -2, 0, -6, 0, -10), both(A([-0.3, -0.6, 0.74], [0.7, 0.3, 0.65], [0.6, 0.6, 0.53])), HAPPY),
    key(1.12, pelvis(0, -0.02), bend(4, 2, 0, -2, 10), GUARD, SHUT),
    key(1.26, pelvis(0, -0.015), bend(4, 2, 0, -2, -6), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
};

/** Cursed: a jolt of pain throws its head back, then it hunches deep on both feet, arms crossed before its face, trembling under the curse. */
export const status_curse: Clip = {
  name: 'status_curse',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.08, pelvis(0, 0.008), bend(-12, -6, -4, -16), SQUEEZE, jaw(24), FLUNG),
    key(0.34, FEET, pelvis(0, -0.075), bend(22, 10, 6, 14), X_GUARD, crest(-14), SQUEEZE),
    key(0.5, FEET, pelvis(0.004, -0.077), bend(23, 10, 6, 15, 0, 1.5), X_GUARD, crest(-14), HURT),
    key(0.66, FEET, pelvis(-0.004, -0.075), bend(22, 10, 6, 14, 0, -1.5), X_GUARD, crest(-15), HURT),
    key(0.82, FEET, pelvis(0.003, -0.077), bend(23, 10, 6, 15, 0, 1), X_GUARD, crest(-14), HURT),
    key(1.0, pelvis(0, -0.035), bend(10, 4, 2, 6), GUARD, DROWSY),
    key(1.45, OPEN_EYES),
  ],
};

/** A nightmare: asleep on both feet, it writhes, the head tossing and a clawed hand twitching up in fright, eyes squeezed shut. */
export const status_nightmare: Clip = {
  name: 'status_nightmare',
  duration: 1.65,
  keys: [
    key(0),
    key(0.16, FEET, pelvis(0, -0.04), bend(12, 6, 6, 16, 0, 6), LIMP, SHUT),
    key(0.3, FEET, pelvis(0, -0.035), root({ roll: 4 }), bend(6, 2, 2, 8, 14, 8), LIMP, armR(A([-0.7, -0.2, 0.69], [-0.3, 0.5, 0.81], [-0.2, 0.7, 0.69])), SQUEEZE, jaw(12)),
    key(0.46, FEET, pelvis(0, -0.039), root({ roll: -4 }), bend(8, 4, 4, 10, -14, -8), LIMP, armL(A([0.7, -0.2, 0.69], [0.3, 0.5, 0.81], [0.2, 0.7, 0.69])), SQUEEZE, jaw(6)),
    key(0.62, FEET, pelvis(0, -0.035), root({ roll: 3 }), bend(4, 2, 2, 6, 12, 6), X_GUARD, SQUEEZE, jaw(14)),
    key(0.8, FEET, pelvis(0, -0.041), root({ roll: -3 }), bend(10, 4, 4, 12, -10, -6), LIMP, SQUEEZE, jaw(4)),
    key(1.0, FEET, pelvis(0, -0.043), root({ roll: 1 }), bend(13, 6, 6, 16, 0, 4), LIMP, SHUT),
    key(1.65, SHUT),
  ],
};

/** Wrapped: squeezed by a bind, its arms pinned to its sides, it strains against it on both feet, twisting one way and the other, and slumps. */
export const status_wrapped: Clip = {
  name: 'status_wrapped',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.1, FEET, pelvis(0, 0.004), bend(-4, -2, 0, -8), SQUEEZE, both(A([-0.18, -0.98, 0.05], [-0.05, -0.96, 0.28], [0, -0.97, 0.25]))),
    key(0.28, FEET, pelvis(0, 0.006), bend(-6, -2, 0, -10, 8, 4), SQUEEZE, jaw(14), both(A([-0.4, -0.9, 0.17], [-0.2, -0.94, 0.28], [-0.15, -0.95, 0.27]))),
    key(0.46, FEET, pelvis(0, 0.004), bend(-6, -2, 0, -10, -8, -4), SQUEEZE, jaw(16), both(A([-0.2, -0.97, 0.13], [-0.05, -0.96, 0.28], [0, -0.97, 0.25]))),
    key(0.64, FEET, pelvis(0, 0.006), bend(-6, -2, 0, -10, 6, 3), SQUEEZE, jaw(14), both(A([-0.42, -0.89, 0.17], [-0.2, -0.94, 0.28], [-0.15, -0.95, 0.27]))),
    key(0.9, FEET, pelvis(0, -0.035), bend(10, 4, 2, 8), LIMP, HURT),
    key(1.45, OPEN_EYES),
  ],
};

// States that last (loops) -----------------------------------------------------

/** Asleep: squatting low on its heels, arms folded, the head bowed and nodding, breathing slow and deep. */
export const idle_asleep: Clip = {
  name: 'idle_asleep',
  duration: 3.4,
  loop: true,
  keys: [
    key(0, SQUAT, bend(16, 8, 8, 16, 0, 6), FOLDED, crest(-12), SHUT),
    key(1.4, SQUAT, pelvis(0, 0.01), bend(12, 4, 6, 12, 0, 8), FOLDED, crest(-10), SHUT),
    key(3.4, SQUAT, bend(16, 8, 8, 16, 0, 6), FOLDED, crest(-12), SHUT),
  ],
};

/** Worn down: panting heavily with its beak open, on both feet now, the guard sagging low, still facing the foe. */
export const idle_tired: Clip = {
  name: 'idle_tired',
  duration: 1.8,
  loop: true,
  keys: [
    key(0, FEET, pelvis(0, -0.05), bend(16, 7, 4, 8), both(A([-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96], [0, -0.3, 0.95])), jaw(16), crest(-10), DROWSY),
    key(0.45, FEET, pelvis(0, -0.043), bend(10, 2, 2, 2), both(A([-0.4, -0.78, 0.48], [-0.1, -0.2, 0.97], [0, -0.25, 0.97])), jaw(6), crest(-8), DROWSY),
    key(0.9, FEET, pelvis(0, -0.051), bend(16, 7, 4, 9), both(A([-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96], [0, -0.3, 0.95])), jaw(17), crest(-10), DROWSY),
    key(1.35, FEET, pelvis(0, -0.044), bend(10, 2, 2, 3), both(A([-0.4, -0.78, 0.48], [-0.1, -0.2, 0.97], [0, -0.25, 0.97])), jaw(7), crest(-8), DROWSY),
    key(1.8, FEET, pelvis(0, -0.05), bend(16, 7, 4, 8), both(A([-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96], [0, -0.3, 0.95])), jaw(16), crest(-10), DROWSY),
  ],
};

// The game's other animations on it ---------------------------------------------

/** Powered up: a quick gather, then it draws itself up tall on its kicking leg, chest out, the clawed hands pumped at its hips, the crest standing. */
export const stat_up: Clip = {
  name: 'stat_up',
  duration: 1.25,
  keys: [
    key(0),
    key(0.14, FEET, pelvis(0, -0.05), bend(12, 4, 0, 8), CROSSED, SHUT),
    snap(0.3, legR([-0.2, 0.55, 0.81], [-0.1, -0.55, 0.83]), pelvis(0, 0.014), bend(-12, -10, -4, -14), CHAMBER, jaw(12), crest(12), tail(-16), ANGRY),
    key(0.48, legR([-0.2, 0.55, 0.81], [-0.1, -0.55, 0.83]), pelvis(0, 0.016), bend(-13, -10, -4, -15, 0, 1.5), CHAMBER, jaw(6), crest(12), ANGRY),
    key(0.66, legR([-0.2, 0.52, 0.83], [-0.1, -0.58, 0.81]), pelvis(0, 0.014), bend(-12, -10, -4, -14, 0, -1.5), CHAMBER, crest(10), ANGRY),
    key(0.9, pelvis(0, -0.012), bend(2, 0, 0, -2), CHAMBER, ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Weakened: it flinches back and shrinks in on itself on both feet, arms drawn in, wobbling unsteadily before it steadies. */
export const stat_down: Clip = {
  name: 'stat_down',
  duration: 1.25,
  keys: [
    key(0),
    key(0.14, root({ z: -0.03 }), bend(-8, -4, -2, -10), CROSSED, HURT),
    key(0.38, FEET, root({ z: -0.03, roll: 3 }), pelvis(0, -0.06), bend(16, 8, 4, 12, 0, 6), CROSSED, crest(-12), WORRIED),
    key(0.58, FEET, root({ z: -0.02, roll: -3 }), pelvis(0, -0.065), bend(17, 8, 4, 13, 0, -6), CROSSED, crest(-12), WORRIED),
    key(0.82, root({ z: -0.01 }), pelvis(0, -0.035), bend(8, 4, 2, 6), GUARD, DROWSY),
    key(1.25, OPEN_EYES),
  ],
};

/** Grown stronger: a crouch, then a hop up with its arms flung wide, landing on its standing leg in a proud pose, a clawed fist raised. */
export const level_up: Clip = {
  name: 'level_up',
  duration: 1.55,
  keys: [
    key(0),
    key(0.18, FEET, pelvis(0, -0.065), bend(14, 4, 0, 6), CROSSED, SHUT),
    snap(0.34, root({ y: 0.09 }), HOP, pelvis(0, 0.01), bend(-10, -8, -4, -16), WINGS_OUT, jaw(24), crest(10), HAPPY),
    fall(0.5, SKIP, bend(0, -4, -2, -10), armR(A([-0.85, -0.2, 0.49], [-0.1, 0.95, 0.3], [0, 0.95, -0.3])), armL(mirrorArm(A([-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99]))), HAPPY),
    key(0.7, pelvis(0, -0.02), bend(-6, -6, -2, -12), armR(A([-0.85, -0.18, 0.49], [-0.12, 0.96, 0.25], [0, 0.96, -0.28])), armL(mirrorArm(A([-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99]))), jaw(10), crest(8), HAPPY),
    key(0.92, pelvis(0, -0.018), bend(-6, -6, -2, -12, 4), armR(A([-0.85, -0.2, 0.49], [-0.1, 0.95, 0.3], [0, 0.95, -0.3])), armL(mirrorArm(A([-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99]))), crest(6), HAPPY),
    key(1.14, pelvis(0, -0.01), bend(2, 0, 0, -2), GUARD, HAPPY),
    key(1.55, OPEN_EYES),
  ],
};

/** Leech Seed saps it: a shudder, then it sags onto both feet as the energy drains out, the knees buckling and the arms hanging, then steadies. */
export const drained: Clip = {
  name: 'drained',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, 0.004), bend(-4, -2, 0, -6, 0, 4), HURT),
    key(0.42, FEET, pelvis(0, -0.065), bend(18, 8, 4, 14), LIMP, crest(-12), DROWSY),
    key(0.7, FEET, pelvis(0, -0.08), root({ roll: 2 }), bend(22, 10, 6, 18), LIMP, crest(-14), DROWSY),
    key(0.94, pelvis(0, -0.05), bend(12, 6, 2, 8), GUARD, DROWSY),
    key(1.35, OPEN_EYES),
  ],
};

/** Healed: a deep breath in with the eyes closed, then it relaxes, shoulders dropping, refreshed, and bobs happily. */
export const healed: Clip = {
  name: 'healed',
  duration: 1.35,
  keys: [
    key(0),
    key(0.28, pelvis(0, 0.01), bend(-8, -8, -4, -14), ELBOWS_BACK, crest(6), SHUT),
    key(0.56, FEET, pelvis(0, -0.025), bend(4, 2, 0, 4), LIMP, HAPPY),
    key(0.76, FEET, pelvis(0, -0.035), bend(6, 2, 0, 2, 0, 5), LIMP, HAPPY),
    key(0.94, pelvis(0, -0.015), bend(2, 0, 0, -2, 0, -3), GUARD, HAPPY),
    key(1.35, OPEN_EYES),
  ],
};

/** Focus Punch's setup: it sets both feet, the right hand drawn back to the hip, the left out, eyes shut; the crest rises as its focus tightens and the eyes open. */
export const focus: Clip = {
  name: 'focus',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.05, -0.01), bend(6, 0, 0, -4, 8), armR(A([-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99])), armL(A([0.3, -0.2, 0.93], [0.12, 0.08, 0.99], [0.1, 0.3, 0.95])), SHUT),
    key(0.5, FEET, pelvis(0.002, -0.056, -0.012), bend(7, 0, 0, -4, 8, 1), armR(A([-0.45, -0.71, -0.54], [-0.12, -0.26, 0.96], [-0.02, -0.13, 0.99])), armL(A([0.3, -0.22, 0.93], [0.12, 0.06, 0.99], [0.1, 0.28, 0.95])), crest(4), SHUT),
    key(0.78, FEET, pelvis(-0.002, -0.06, -0.012), bend(8, 0, 0, -5, 8, -1), armR(A([-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99])), armL(A([0.3, -0.2, 0.93], [0.12, 0.08, 0.99], [0.1, 0.3, 0.95])), crest(10), ANGRY),
    key(1.02, FEET, pelvis(0.002, -0.058, -0.012), bend(7, 0, 0, -5, 8, 1), armR(A([-0.45, -0.71, -0.54], [-0.12, -0.26, 0.96], [-0.02, -0.13, 0.99])), armL(A([0.3, -0.22, 0.93], [0.12, 0.06, 0.99], [0.1, 0.28, 0.95])), crest(9), ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Hanging on at 1 HP: its standing leg buckles and it lurches, nearly going down, catches itself on both feet, grits its beak and pulls back up, defiant. */
export const hang_on: Clip = {
  name: 'hang_on',
  duration: 1.35,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.09), root({ roll: 6 }), bend(20, 10, 6, 16, 0, 8), LIMP, HURT),
    key(0.3, FEET, pelvis(0, -0.12), root({ roll: 8 }), bend(26, 12, 6, 20, 0, 10), LIMP, crest(-14), HURT),
    key(0.5, FEET, pelvis(0, -0.1), root({ roll: 4 }), bend(20, 8, 4, 10, 0, 6), BRACED, SQUEEZE, jaw(4)),
    key(0.8, FEET, pelvis(0, -0.035), bend(4, 0, 0, -6), BRACED, crest(6), ANGRY),
    key(1.0, pelvis(0, -0.03), bend(4, 0, 0, -6, 3), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
};

// What the game only says -------------------------------------------------------

/** "Flinched!": startled, it recoils with its arms crossed up, falters on its one leg and shakes its head. */
export const flinch: Clip = {
  name: 'flinch',
  duration: 0.95,
  keys: [
    key(0),
    snap(0.06, root({ z: -0.02 }), bend(-12, -6, -4, -14), X_GUARD, crest(-10), HURT),
    key(0.24, root({ z: -0.03 }), pelvis(0, -0.035), bend(6, 2, 2, 6), X_GUARD, WORRIED),
    key(0.44, root({ z: -0.02 }), pelvis(0, -0.03), bend(6, 2, 0, 2, 10), GUARD, DROWSY),
    key(0.58, pelvis(0, -0.02), bend(4, 2, 0, 0, -8), GUARD, ANGRY),
    key(0.95, OPEN_EYES),
  ],
};

/** "Must recharge!": spent, it slumps on both feet with its clawed hands on its knees, panting hard, then straightens onto its kicking leg. */
export const recharge: Clip = {
  name: 'recharge',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.075), bend(26, 10, 6, 10), ON_KNEES, jaw(18), crest(-12), DROWSY),
    key(0.48, FEET, pelvis(0, -0.068), bend(22, 8, 6, 6), ON_KNEES, jaw(8), crest(-11), DROWSY),
    key(0.74, FEET, pelvis(0, -0.075), bend(26, 10, 6, 10), ON_KNEES, jaw(18), crest(-12), DROWSY),
    key(1.0, FEET, pelvis(0, -0.068), bend(22, 8, 6, 6), ON_KNEES, jaw(8), crest(-11), DROWSY),
    key(1.28, pelvis(0, -0.035), bend(8, 2, 0, 0), GUARD, jaw(4), DROWSY),
    key(1.65, OPEN_EYES),
  ],
};

/** "Woke up!": from its sleeping squat it startles awake, eyes popping open, springs up onto its kicking leg and shakes the sleep off, back on guard. */
export const wake: Clip = {
  name: 'wake',
  duration: 1.25,
  keys: [
    key(0, SQUAT, bend(16, 8, 8, 16, 0, 6), FOLDED, crest(-12), SHUT),
    snap(0.14, pelvis(0, -0.035), bend(-8, -6, -2, -14), FLUNG, crest(8), OPEN_EYES),
    key(0.3, pelvis(0, -0.03), bend(2, 2, 0, -4, 16), GUARD, SHUT),
    key(0.44, pelvis(0, -0.03), bend(2, 2, 0, -4, -16), GUARD, SHUT),
    key(0.58, pelvis(0, -0.025), bend(4, 2, 0, -4, 4), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Shaking off a condition: a gather, then a whole-body shake (crest, arms and waist feathers flying), and back on guard. */
export const shake_off: Clip = {
  name: 'shake_off',
  duration: 1.15,
  keys: [
    key(0),
    key(0.12, FEET, pelvis(0, -0.045), bend(10, 4, 2, 8), LIMP, SHUT),
    key(0.24, FEET, root({ roll: 5 }), pelvis(0, -0.035), bend(4, 2, 2, 2, 14, 6), LIMP, SHUT),
    key(0.34, FEET, root({ roll: -5 }), pelvis(0, -0.035), bend(4, 2, 2, 2, -14, -6), LIMP, SHUT),
    key(0.44, FEET, root({ roll: 3 }), pelvis(0, -0.033), bend(3, 2, 2, 2, 8, 4), LIMP, SHUT),
    key(0.62, pelvis(0, -0.025), bend(6, 2, 0, -4), GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
};

/** Out of the Poké Ball again: curled on both feet, it bursts up onto its kicking leg with its arms flung wide, shakes itself angrily and squares up. */
export const break_free: Clip = {
  name: 'break_free',
  duration: 1.35,
  keys: [
    key(0, FEET, pelvis(0, -0.065), bend(16, 6, 4, 20), CROSSED, crest(-14), SHUT),
    snap(0.18, pelvis(0, 0.012), bend(-12, -8, -4, -18), WINGS_OUT, jaw(30), crest(10), ANGRY),
    key(0.34, root({ roll: 4 }), pelvis(0, 0.004), bend(-4, -2, 0, -8, 10), WINGS_OUT, jaw(12), ANGRY),
    key(0.48, root({ roll: -4 }), pelvis(0, 0.002), bend(-4, -2, 0, -8, -10), WINGS_OUT, jaw(6), ANGRY),
    key(0.68, pelvis(0, -0.03), bend(8, 2, 0, -4), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
};

// The weather, at the end of each turn it lasts ----------------------------------

/** Rain: a fire type hates it: it hunches on both feet with its arms crossed and its eyes squeezed, shakes the water off and grumbles. */
export const weather_rain: Clip = {
  name: 'weather_rain',
  duration: 1.45,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.05), bend(14, 6, 6, 12), CROSSED, crest(-14), SQUEEZE),
    key(0.4, FEET, root({ roll: 5 }), pelvis(0, -0.045), bend(10, 4, 4, 8, 14, 6), CROSSED, crest(-12), SQUEEZE),
    key(0.5, FEET, root({ roll: -5 }), pelvis(0, -0.045), bend(10, 4, 4, 8, -14, -6), CROSSED, crest(-12), SQUEEZE),
    key(0.6, FEET, root({ roll: 4 }), pelvis(0, -0.045), bend(10, 4, 4, 8, 12, 4), CROSSED, crest(-12), SQUEEZE),
    key(0.7, FEET, root({ roll: -3 }), pelvis(0, -0.045), bend(10, 4, 4, 8, -8, -3), CROSSED, crest(-12), SQUEEZE),
    key(0.92, pelvis(0, -0.025), bend(6, 2, 2, 4, 4), FOLDED, jaw(8), ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Strong sunlight: a fire type basks in it, face tipped up and eyes closed, arms opening, the crest standing. */
export const weather_sun: Clip = {
  name: 'weather_sun',
  duration: 1.45,
  keys: [
    key(0),
    key(0.28, pelvis(0, 0.006), bend(-8, -6, -6, -18, 0, 4), both(A([-0.7, -0.6, 0.39], [-0.5, -0.3, 0.81], [-0.4, -0.1, 0.91])), crest(8), SHUT),
    key(0.6, pelvis(0.006, 0.008), root({ roll: 2 }), bend(-9, -6, -6, -19, 0, -4), both(A([-0.72, -0.58, 0.39], [-0.52, -0.28, 0.81], [-0.42, -0.08, 0.9])), crest(10), HAPPY),
    key(0.9, pelvis(-0.006, 0.006), root({ roll: -2 }), bend(-8, -6, -6, -18, 0, 4), both(A([-0.7, -0.6, 0.39], [-0.5, -0.3, 0.81], [-0.4, -0.1, 0.91])), crest(9), HAPPY),
    key(1.14, pelvis(0, -0.01), bend(2, 0, 0, -4), GUARD, HAPPY),
    key(1.45, OPEN_EYES),
  ],
};

/** A sandstorm: it braces low on both feet, turning its head aside with its forearm raised before its eyes, flinching at the grit. */
export const weather_sand: Clip = {
  name: 'weather_sand',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.055), bend(10, 4, 2, 6, -16), armR(A([-0.35, -0.3, 0.89], [0.55, 0.62, 0.56], [0.6, 0.7, 0.39])), armL(A([0.45, -0.75, -0.48], [0.2, -0.4, 0.9], [0.1, -0.3, 0.95])), crest(-10), SQUEEZE),
    key(0.46, FEET, pelvis(0.003, -0.057), bend(11, 4, 2, 7, -18, 2), armR(A([-0.35, -0.28, 0.89], [0.55, 0.64, 0.54], [0.6, 0.72, 0.36])), armL(A([0.45, -0.75, -0.48], [0.2, -0.4, 0.9], [0.1, -0.3, 0.95])), crest(-10), SQUEEZE),
    key(0.66, FEET, pelvis(0, -0.06), bend(13, 5, 2, 8, -20), armR(A([-0.35, -0.3, 0.89], [0.55, 0.62, 0.56], [0.6, 0.7, 0.39])), armL(A([0.45, -0.75, -0.48], [0.2, -0.4, 0.9], [0.1, -0.3, 0.95])), crest(-11), HURT),
    key(0.9, FEET, pelvis(-0.003, -0.057), bend(11, 4, 2, 7, -17, -2), armR(A([-0.35, -0.28, 0.89], [0.55, 0.64, 0.54], [0.6, 0.72, 0.36])), armL(A([0.45, -0.75, -0.48], [0.2, -0.4, 0.9], [0.1, -0.3, 0.95])), crest(-10), SQUEEZE),
    key(1.12, pelvis(0, -0.02), bend(2, 0, 0, -2, -4), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Hail: it flinches as the hailstones hit, hunching on both feet with a forearm over its head, flinching again, then shakes it off. */
export const weather_hail: Clip = {
  name: 'weather_hail',
  duration: 1.35,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.02), bend(-6, -2, 0, -10), GUARD, HURT),
    key(0.24, FEET, pelvis(0, -0.065), bend(18, 8, 6, 14), armL(A([0.4, -0.1, 0.91], [-0.55, 0.55, 0.63], [-0.6, 0.65, 0.47])), armR(A([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86], [0, -0.4, 0.92])), crest(-12), SQUEEZE),
    snap(0.42, FEET, pelvis(0, -0.075), bend(21, 9, 6, 16, 0, 4), armL(A([0.4, -0.08, 0.91], [-0.55, 0.57, 0.61], [-0.6, 0.67, 0.44])), armR(A([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86], [0, -0.4, 0.92])), crest(-14), HURT),
    key(0.58, FEET, pelvis(0, -0.067), bend(18, 8, 6, 14, 0, -3), armL(A([0.4, -0.1, 0.91], [-0.55, 0.55, 0.63], [-0.6, 0.65, 0.47])), armR(A([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86], [0, -0.4, 0.92])), crest(-12), SQUEEZE),
    key(0.8, root({ roll: 3 }), pelvis(0, -0.03), bend(6, 2, 0, 0, 8), GUARD, ANGRY),
    key(0.94, root({ roll: -2 }), pelvis(0, -0.02), bend(4, 2, 0, 0, -6), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
};

export const SITUATIONS: Clip[] = [
  idle, intro, hit, hit_strong, faint, dodge, unaffected, return_home,
  status_sleep, status_poison, status_burn, status_paralysis, status_freeze, status_confusion, status_infatuation, status_curse, status_nightmare, status_wrapped,
  idle_asleep, idle_tired, stat_up, stat_down, level_up, drained, healed, focus, hang_on,
  flinch, recharge, wake, shake_off, break_free, weather_rain, weather_sun, weather_sand, weather_hail,
];
