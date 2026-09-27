// Blaziken in every battle situation (src/battle3d/situations.ts): the
// moments every battle plays, getting out of the way of a miss, shrugging off
// what doesn't affect it, coming home after a run of hits, each status
// condition, sleeping and flagging (loops), the stat and message situations,
// and the weather. Each ends on the stance (the loops on their first pose,
// the faint curled). They play at home: arms wide rather than overhead, so
// from our side it stays clear of the healthboxes.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_SPREAD_UP, AT_FOE_GUARD, BRACED, CHAMBER, CROSSED, DROWSY, ELBOWS_BACK, FISTS, FOLDED, GUARD, GUARD_L, HAPPY, HOP, HURT, LAND, LIMP,
  OPEN_EYES, SHUT, SPLAY, SQUEEZE, X_GUARD,
  armL, armR, arms, at, bend, fall, flames, jaw, key, legR, pelvis, root, snap,
} from './kit';

// The moments every battle plays ------------------------------------------------

export const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(2.4),
  ],
};

/** A crane stance's guard: the left claw up in front, the right fist cocked by the chin. */
const CRANE_GUARD: Pose = arms([[-0.5, -0.45, 0.74], [0.25, 0.85, 0.46]], [[0.3, -0.15, 0.94], [-0.1, 0.7, 0.71]]);

/**
 * Sent out: it bursts out of a crouch into its fighting pose, a crane stance
 * on its left leg with the right knee drawn up high, the claws up in a guard
 * and its wrist flames flaring, with a cry; then it stamps down into its
 * stance (cf. BACK_ANIM_SHAKE_GLOW_RED).
 */
export const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.05), bend(16, 4, 0, 18), CROSSED, FISTS, SHUT),
    key(0.2, pelvis(0, -0.08), bend(22, 6, 2, 22), CROSSED, FISTS, SHUT),
    // The burst: up onto the left leg, the right knee driven high, the guard up.
    snap(0.4, { plantLeft: 1, plantRight: 0 }, legR([-0.2, 0.3, 0.93], [-0.1, -0.72, 0.69]), pelvis(0.012, 0.02), bend(-6, -4, -4, -16), CRANE_GUARD, FISTS, jaw(30), ANGRY, flames(1)),
    key(0.6, { plantLeft: 1, plantRight: 0 }, legR([-0.2, 0.34, 0.92], [-0.1, -0.7, 0.71]), pelvis(0.012, 0.024), bend(-7, -4, -4, -17, 0, 4), CRANE_GUARD, FISTS, jaw(24), ANGRY, flames(1)),
    key(0.82, { plantLeft: 1, plantRight: 0 }, legR([-0.2, 0.3, 0.93], [-0.1, -0.74, 0.66]), pelvis(0.012, 0.02), bend(-6, -4, -4, -15, 0, -3), CRANE_GUARD, FISTS, jaw(6), ANGRY, flames(0.9)),
    // It stamps down into its stance.
    fall(1.0, pelvis(0, -0.06), bend(10, 2, 0, 0), GUARD, ANGRY, flames(0.6)),
    key(1.2, pelvis(0, -0.03), bend(6, 2, 0, 0), GUARD, ANGRY, flames(0.4)),
    key(1.65, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/** Taking a hit: snaps back and winces (the battler adds a sprung recoil), then shakes it off. */
export const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, bend(-14, -6, -4, -18), HURT, arms([[-0.75, -0.3, 0.58], [-0.3, 0.2, 0.93]], [[0.75, -0.45, -0.48], [0.4, 0.1, 0.9]])),
    key(0.2, bend(-6, -2, -2, -8), HURT),
    key(0.36, bend(4, 1, 0, 4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/** A critical or super-effective blow: knocked further back with a cry, it staggers a step back, catches itself and recovers. */
export const hit_strong: Clip = {
  name: 'hit_strong',
  duration: 1.0,
  keys: [
    key(0),
    snap(0.05, root({ z: -0.04 }), bend(-22, -10, -6, -24), HURT, jaw(20), arms([[-0.85, -0.2, 0.49], [-0.4, 0.4, 0.82]], [[0.85, -0.3, -0.43], [0.5, 0.3, 0.81]])),
    // Staggers a step back.
    key(0.2, { plantRight: 0 }, legR([-0.3, -0.72, -0.62], [-0.15, -0.97, -0.2]), root({ z: -0.07 }), pelvis(0, 0.005), bend(-12, -6, -4, -14), HURT, jaw(10), arms([[-0.8, -0.35, 0.49], [-0.35, 0.3, 0.89]], [[0.8, -0.4, -0.45], [0.45, 0.2, 0.87]])),
    key(0.36, root({ z: -0.09 }), pelvis(0, -0.05), bend(14, 6, 4, 8), HURT, LIMP),
    // Catches itself and comes back to guard.
    key(0.56, root({ z: -0.04 }), pelvis(0, -0.04), bend(10, 2, 0, -2, 0, 4), GUARD, ANGRY),
    key(1.0, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway, then
 * it curls over onto its heels hugging itself, head tucked and eyes shut, and
 * from the 'shrink' the curled body shrinks away (Battler3D). It sits back as
 * it curls: bowed forward over its feet, the foe's head came down onto our
 * healthbox (tools/gauntlet/uiclear.mjs).
 */
export const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-8, -4, -2, -12), DROWSY),
    key(0.48, pelvis(0, -0.08), root({ z: -0.04 }), bend(14, 5, 4, 20), CROSSED, SHUT),
    key(0.82, pelvis(0, -0.22), root({ z: -0.1 }), bend(28, 12, 8, 30), CROSSED, SHUT),
    key(0.96, pelvis(0, -0.235), root({ z: -0.1 }), bend(30, 13, 8, 32), CROSSED, SHUT),
    key(1.6, pelvis(0, -0.228), root({ z: -0.1 }), bend(29, 12, 8, 31), CROSSED, SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// Engaging the foe ---------------------------------------------------------------

/** The foe's move misses: a quick dip and a hop aside out of its way, leaning away, then a hop back into its guard. */
export const dodge: Clip = {
  name: 'dodge',
  duration: 0.9,
  keys: [
    key(0),
    key(0.06, pelvis(0, -0.045), bend(10, 2, 0, -6), GUARD, OPEN_EYES),
    key(0.16, root({ x: 0.16, y: 0.06, roll: -10 }), HOP, bend(4, 0, 0, -8, -10), GUARD, ANGRY),
    key(0.28, root({ x: 0.2, roll: -6 }), LAND, bend(12, 0, 0, -6, -8), GUARD, ANGRY),
    key(0.44, root({ x: 0.08, y: 0.05 }), HOP, bend(6, 0, 0, -4), GUARD, ANGRY),
    key(0.56, root({ x: 0 }), LAND, GUARD, ANGRY),
    key(0.9, OPEN_EYES),
  ],
};

/** A move doesn't affect it (or it protected itself): it stands firm, arms folded, chin up, and shakes its head, unimpressed. */
export const unaffected: Clip = {
  name: 'unaffected',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.008), bend(-6, -4, -2, -10), FOLDED, SHUT),
    key(0.4, pelvis(0, 0.008), bend(-6, -4, -2, -10, 10), FOLDED, SHUT),
    key(0.58, pelvis(0, 0.008), bend(-6, -4, -2, -10, -10), FOLDED, SHUT),
    // A "hmph": chin up, one eye on the foe.
    key(0.78, pelvis(0, 0.01), bend(-8, -5, -2, -13, 2), FOLDED, ANGRY),
    key(0.94, pelvis(0, 0.006), bend(-6, -4, -2, -11, 3), FOLDED, ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

/** Home from the foe after a run of hits: from its guard at the foe it pushes off, leaps home and lands. */
export const return_home: Clip = {
  name: 'return_home',
  duration: 0.8,
  keys: [
    key(0, ...AT_FOE_GUARD),
    key(0.08, at(1), pelvis(0, -0.055), bend(16, 2, 0, -2), GUARD, ANGRY),
    key(0.24, at(0.5), root({ y: 0.08 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(0.38, at(0), LAND, GUARD, ANGRY),
    key(0.8, OPEN_EYES),
  ],
};

// Status conditions ------------------------------------------------------------

/** Falling asleep: a drowsy sway, the eyes drooping shut, the head sinking; a slow breath, and it sags. */
export const status_sleep: Clip = {
  name: 'status_sleep',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, root({ roll: 3 }), bend(4, 2, 2, 6, 0, 4), DROWSY),
    key(0.5, pelvis(0, -0.03), root({ roll: -2 }), bend(12, 5, 5, 14, 0, -6), LIMP, SHUT),
    key(0.8, pelvis(0, -0.022), root({ roll: -1 }), bend(8, 2, 3, 10, 0, -5), LIMP, SHUT),
    key(1.1, pelvis(0, -0.045), root({ roll: 2 }), bend(16, 6, 6, 18, 0, 7), LIMP, SHUT),
    key(1.6, SHUT),
  ],
};

/** Poisoned: a sickly shudder, hunched over with its arms wrapped round its middle, wincing and swaying queasily. */
export const status_poison: Clip = {
  name: 'status_poison',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.05), bend(20, 8, 4, 12, 0, 4), CROSSED, HURT),
    key(0.22, pelvis(0.006, -0.052), root({ roll: 3 }), bend(21, 8, 4, 13, 0, 7), CROSSED, HURT),
    key(0.32, pelvis(-0.006, -0.05), root({ roll: -3 }), bend(20, 8, 4, 12, 0, 1), CROSSED, HURT),
    key(0.42, pelvis(0.006, -0.053), root({ roll: 3 }), bend(21, 8, 4, 13, 0, 7), CROSSED, HURT),
    key(0.54, pelvis(-0.004, -0.05), root({ roll: -2 }), bend(19, 8, 4, 12, 0, 2), CROSSED, DROWSY),
    key(0.8, pelvis(0, -0.03), bend(10, 4, 2, 6, 0, 3), CROSSED, DROWSY),
    key(1.35, OPEN_EYES),
  ],
};

/** Burned: it jolts as if scorched, shakes its right arm out hard, and brushes the heat off. */
export const status_burn: Clip = {
  name: 'status_burn',
  duration: 1.25,
  keys: [
    key(0),
    snap(0.06, pelvis(0, 0.01), bend(-10, -4, -2, -14), HURT, jaw(16), arms([[-0.8, -0.1, 0.59], [-0.5, 0.4, 0.77]], [[0.8, -0.2, -0.56], [0.5, 0.2, 0.84]])),
    // Shakes the arm out.
    key(0.18, pelvis(0, -0.02), bend(6, 2, 0, -4, -8), HURT, armR([-0.8, -0.3, 0.52], [-0.6, -0.6, 0.53]), GUARD_L),
    key(0.28, pelvis(0, -0.022), bend(6, 2, 0, -4, -8), HURT, armR([-0.8, -0.1, 0.59], [-0.5, 0.3, 0.81]), GUARD_L),
    key(0.38, pelvis(0, -0.02), bend(6, 2, 0, -4, -8), HURT, armR([-0.8, -0.3, 0.52], [-0.6, -0.6, 0.53]), GUARD_L),
    // Brushes it off.
    key(0.56, pelvis(0, -0.02), root({ roll: 3 }), bend(4, 2, 0, -4, 6), GUARD, ANGRY),
    key(0.72, pelvis(0, -0.018), root({ roll: -2 }), bend(4, 2, 0, -4, -4), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Paralysed: it seizes up, limbs locked stiff and splayed, and twitches in jerks; then the stiffness ebbs. */
export const status_paralysis: Clip = {
  name: 'status_paralysis',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0.006), bend(-6, -4, -2, -8), SPLAY, SQUEEZE, jaw(8), arms([[-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4]], [[0.8, -0.5, 0.33], [0.8, -0.45, 0.4]])),
    key(0.12, root({ x: 0.01 }), pelvis(0, 0.006), bend(-6, -4, -2, -8, 0, 4), SPLAY, SQUEEZE, jaw(8), arms([[-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44]], [[0.8, -0.5, 0.33], [0.8, -0.45, 0.4]])),
    key(0.18, root({ x: -0.01 }), pelvis(0, 0.006), bend(-7, -4, -2, -8, 0, -4), SPLAY, SQUEEZE, jaw(6), arms([[-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4]], [[0.82, -0.45, 0.35], [0.8, -0.4, 0.44]])),
    key(0.24, root({ x: 0.008 }), pelvis(0, 0.007), bend(-6, -4, -2, -8, 0, 3), SPLAY, SQUEEZE, jaw(8), arms([[-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44]], [[0.8, -0.5, 0.33], [0.8, -0.45, 0.4]])),
    key(0.3, root({ x: -0.008 }), pelvis(0, 0.006), bend(-7, -4, -2, -8, 0, -3), SPLAY, SQUEEZE, jaw(6), arms([[-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4]], [[0.82, -0.45, 0.35], [0.8, -0.4, 0.44]])),
    key(0.5, root({ x: 0.004 }), pelvis(0, 0.005), bend(-6, -4, -2, -8, 0, 2), SPLAY, SQUEEZE, jaw(4), arms([[-0.8, -0.5, 0.33], [-0.8, -0.45, 0.4]], [[0.8, -0.5, 0.33], [0.8, -0.45, 0.4]])),
    key(0.58, root({ x: -0.006 }), pelvis(0, 0.006), bend(-7, -4, -2, -8, 0, -3), SPLAY, SQUEEZE, jaw(6), arms([[-0.82, -0.45, 0.35], [-0.8, -0.4, 0.44]], [[0.8, -0.5, 0.33], [0.8, -0.45, 0.4]])),
    // The stiffness ebbs.
    key(0.86, pelvis(0, -0.03), bend(10, 4, 2, 6), LIMP, DROWSY),
    key(1.3, OPEN_EYES),
  ],
};

/** Frozen: locked still in the ice in a half-guard, straining against it in tiny tremors, then a shiver as it comes free. */
export const status_freeze: Clip = {
  name: 'status_freeze',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.1, pelvis(0, -0.03), bend(8, 2, 0, 2), X_GUARD, FISTS, SQUEEZE),
    key(0.34, pelvis(0.002, -0.031), bend(8, 2, 0, 2, 0, 0.8), X_GUARD, FISTS, SQUEEZE),
    key(0.58, pelvis(-0.002, -0.03), bend(8.6, 2, 0, 2, 0, -0.8), X_GUARD, FISTS, SQUEEZE),
    key(0.82, pelvis(0.002, -0.031), bend(8, 2, 0, 2.6, 0, 0.8), X_GUARD, FISTS, SQUEEZE),
    // A shiver as it comes free.
    key(0.98, root({ roll: 4 }), pelvis(0, -0.02), bend(6, 2, 0, 0, 8), GUARD, ANGRY),
    key(1.08, root({ roll: -4 }), pelvis(0, -0.02), bend(6, 2, 0, 0, -8), GUARD, ANGRY),
    key(1.18, root({ roll: 2 }), pelvis(0, -0.015), bend(4, 2, 0, 0, 4), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Confused: it wobbles off balance, the head swimming in circles, stumbling a step each way, then shakes its head to clear it. */
export const status_confusion: Clip = {
  name: 'status_confusion',
  duration: 1.65,
  keys: [
    key(0),
    key(0.2, root({ roll: 5 }), bend(4, 2, 2, 4, 10, 8), LIMP, DROWSY),
    key(0.4, { plantLeft: 0 }, root({ x: -0.04, roll: -6 }), bend(6, 2, 2, 2, 0, -10), LIMP, DROWSY),
    key(0.58, root({ x: -0.04, roll: -4 }), bend(4, 2, 2, 6, -10, -6), LIMP, DROWSY),
    key(0.76, { plantRight: 0 }, root({ x: 0, roll: 6 }), bend(6, 2, 2, 2, 0, 10), LIMP, DROWSY),
    key(0.94, root({ roll: 3 }), bend(4, 2, 2, 4, 8, 6), LIMP, DROWSY),
    // Shakes its head clear.
    key(1.08, bend(6, 2, 0, -2, 14), GUARD, SHUT),
    key(1.2, bend(6, 2, 0, -2, -14), GUARD, SHUT),
    key(1.34, bend(6, 2, 0, -2, 4), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
};

/** Infatuated: lovestruck, it sways dreamily with its hands clasped before its chest, the head tilted, happy eyes; then snaps out of it. */
export const status_infatuation: Clip = {
  name: 'status_infatuation',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, pelvis(0, 0.004), root({ roll: 3 }), bend(-2, -2, 0, -6, 0, 14), arms([[-0.3, -0.6, 0.74], [0.7, 0.3, 0.65]], [[0.3, -0.6, 0.74], [-0.7, 0.32, 0.64]]), HAPPY),
    key(0.46, pelvis(0, 0.002), root({ roll: -3 }), bend(-2, -2, 0, -6, 0, -14), arms([[-0.3, -0.6, 0.74], [0.7, 0.3, 0.65]], [[0.3, -0.6, 0.74], [-0.7, 0.32, 0.64]]), HAPPY),
    key(0.7, pelvis(0, 0.004), root({ roll: 3 }), bend(-2, -2, 0, -6, 0, 14), arms([[-0.3, -0.6, 0.74], [0.7, 0.3, 0.65]], [[0.3, -0.6, 0.74], [-0.7, 0.32, 0.64]]), HAPPY),
    key(0.94, pelvis(0, 0.002), root({ roll: -2 }), bend(-2, -2, 0, -6, 0, -10), arms([[-0.3, -0.6, 0.74], [0.7, 0.3, 0.65]], [[0.3, -0.6, 0.74], [-0.7, 0.32, 0.64]]), HAPPY),
    // Snaps out of it.
    key(1.12, pelvis(0, -0.02), bend(6, 2, 0, -2, 10), GUARD, SHUT),
    key(1.26, pelvis(0, -0.015), bend(6, 2, 0, -2, -6), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
};

/** Cursed: a jolt of pain throws its head back, then it hunches deep, clutching its chest, trembling under the curse. */
export const status_curse: Clip = {
  name: 'status_curse',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.08, pelvis(0, 0.01), bend(-12, -6, -4, -16), SQUEEZE, jaw(24), arms([[-0.7, -0.4, 0.59], [0.2, 0.5, 0.84]], [[0.7, -0.4, 0.59], [-0.2, 0.5, 0.84]])),
    key(0.34, pelvis(0, -0.07), bend(24, 10, 6, 14), X_GUARD, FISTS, SQUEEZE),
    key(0.5, pelvis(0.004, -0.072), bend(25, 10, 6, 15, 0, 1.5), X_GUARD, FISTS, HURT),
    key(0.66, pelvis(-0.004, -0.07), bend(24, 10, 6, 14, 0, -1.5), X_GUARD, FISTS, HURT),
    key(0.82, pelvis(0.003, -0.072), bend(25, 10, 6, 15, 0, 1), X_GUARD, FISTS, HURT),
    key(1.0, pelvis(0, -0.03), bend(12, 4, 2, 6), GUARD, DROWSY),
    key(1.45, OPEN_EYES),
  ],
};

/** A nightmare: asleep on its feet it writhes, the head tossing and the arms twitching up in fright, eyes squeezed shut. */
export const status_nightmare: Clip = {
  name: 'status_nightmare',
  duration: 1.65,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.035), bend(14, 6, 6, 16, 0, 6), LIMP, SHUT),
    key(0.3, pelvis(0, -0.03), root({ roll: 4 }), bend(8, 2, 2, 8, 14, 8), LIMP, armR([-0.7, -0.2, 0.69], [-0.3, 0.5, 0.81]), SQUEEZE, jaw(12)),
    key(0.46, pelvis(0, -0.034), root({ roll: -4 }), bend(10, 4, 4, 10, -14, -8), LIMP, armL([0.7, -0.2, 0.69], [0.3, 0.5, 0.81]), SQUEEZE, jaw(6)),
    key(0.62, pelvis(0, -0.03), root({ roll: 3 }), bend(6, 2, 2, 6, 12, 6), X_GUARD, SQUEEZE, jaw(14)),
    key(0.8, pelvis(0, -0.036), root({ roll: -3 }), bend(12, 4, 4, 12, -10, -6), LIMP, SQUEEZE, jaw(4)),
    key(1.0, pelvis(0, -0.038), root({ roll: 1 }), bend(15, 6, 6, 16, 0, 4), LIMP, SHUT),
    key(1.65, SHUT),
  ],
};

/** Wrapped: squeezed by a bind, its arms pinned to its sides, it strains against it, twisting one way and the other, and slumps. */
export const status_wrapped: Clip = {
  name: 'status_wrapped',
  duration: 1.45,
  keys: [
    key(0),
    snap(0.1, pelvis(0, 0.006), bend(-4, -2, 0, -8), FISTS, SQUEEZE, arms([[-0.18, -0.98, 0.05], [-0.05, -0.96, 0.28]], [[0.18, -0.98, 0.05], [0.05, -0.96, 0.28]])),
    // Straining: the shoulders push out, twisting.
    key(0.28, pelvis(0, 0.008), bend(-6, -2, 0, -10, 8, 4), FISTS, SQUEEZE, jaw(14), arms([[-0.4, -0.9, 0.17], [-0.2, -0.94, 0.28]], [[0.4, -0.9, 0.17], [0.2, -0.94, 0.28]])),
    key(0.46, pelvis(0, 0.006), bend(-6, -2, 0, -10, -8, -4), FISTS, SQUEEZE, jaw(16), arms([[-0.2, -0.97, 0.13], [-0.05, -0.96, 0.28]], [[0.2, -0.97, 0.13], [0.05, -0.96, 0.28]])),
    key(0.64, pelvis(0, 0.008), bend(-6, -2, 0, -10, 6, 3), FISTS, SQUEEZE, jaw(14), arms([[-0.42, -0.89, 0.17], [-0.2, -0.94, 0.28]], [[0.42, -0.89, 0.17], [0.2, -0.94, 0.28]])),
    // Slumps back.
    key(0.9, pelvis(0, -0.03), bend(12, 4, 2, 8), LIMP, HURT),
    key(1.45, OPEN_EYES),
  ],
};

// States that last (loops) -----------------------------------------------------

/** Asleep: crouched low on its heels, arms folded on its knees, the head bowed and nodding, breathing slow and deep. */
export const idle_asleep: Clip = {
  name: 'idle_asleep',
  duration: 3.4,
  loop: true,
  keys: [
    key(0, pelvis(0, -0.2, -0.03), bend(18, 8, 6, 16, 0, 6), FOLDED, SHUT),
    key(1.4, pelvis(0, -0.19, -0.03), bend(14, 4, 4, 12, 0, 8), FOLDED, SHUT),
    key(3.4, pelvis(0, -0.2, -0.03), bend(18, 8, 6, 16, 0, 6), FOLDED, SHUT),
  ],
};

/** Worn down: panting heavily with its beak open, the guard sagging low, still facing the foe. */
export const idle_tired: Clip = {
  name: 'idle_tired',
  duration: 1.8,
  loop: true,
  keys: [
    key(0, pelvis(0, -0.045), bend(18, 7, 4, 8), arms([[-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96]], [[0.45, -0.8, 0.4], [0.1, -0.3, 0.95]]), jaw(16), DROWSY),
    key(0.45, pelvis(0, -0.038), bend(12, 2, 2, 2), arms([[-0.4, -0.78, 0.48], [-0.1, -0.2, 0.97]], [[0.45, -0.78, 0.43], [0.1, -0.25, 0.96]]), jaw(6), DROWSY),
    key(0.9, pelvis(0, -0.046), bend(18, 7, 4, 9), arms([[-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96]], [[0.45, -0.8, 0.4], [0.1, -0.3, 0.95]]), jaw(17), DROWSY),
    key(1.35, pelvis(0, -0.039), bend(12, 2, 2, 3), arms([[-0.4, -0.78, 0.48], [-0.1, -0.2, 0.97]], [[0.45, -0.78, 0.43], [0.1, -0.25, 0.96]]), jaw(7), DROWSY),
    key(1.8, pelvis(0, -0.045), bend(18, 7, 4, 8), arms([[-0.4, -0.8, 0.45], [-0.1, -0.25, 0.96]], [[0.45, -0.8, 0.4], [0.1, -0.3, 0.95]]), jaw(16), DROWSY),
  ],
};

// The game's other animations on it ---------------------------------------------

/** Powered up: a quick gather, then it draws itself up tall, chest out, fists pumped at its hips, the flames flaring. */
export const stat_up: Clip = {
  name: 'stat_up',
  duration: 1.25,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.045), bend(14, 4, 0, 8), CROSSED, FISTS, SHUT),
    snap(0.3, pelvis(0, 0.016), bend(-12, -10, -4, -14), CHAMBER, FISTS, jaw(12), ANGRY, flames(0.9)),
    key(0.48, pelvis(0, 0.018), bend(-13, -10, -4, -15, 0, 1.5), CHAMBER, FISTS, jaw(6), ANGRY, flames(1)),
    key(0.66, pelvis(0, 0.016), bend(-12, -10, -4, -14, 0, -1.5), CHAMBER, FISTS, ANGRY, flames(0.9)),
    key(0.9, pelvis(0, -0.01), bend(2, 0, 0, -2), CHAMBER, ANGRY, flames(0.4)),
    key(1.25, flames(0), OPEN_EYES),
  ],
};

/** Weakened: it flinches back and shrinks in on itself, arms drawn in, wobbling unsteadily before it steadies. */
export const stat_down: Clip = {
  name: 'stat_down',
  duration: 1.25,
  keys: [
    key(0),
    key(0.14, root({ z: -0.03 }), bend(-8, -4, -2, -10), CROSSED, HURT),
    key(0.38, root({ z: -0.03, roll: 3 }), pelvis(0, -0.055), bend(18, 8, 4, 12, 0, 6), CROSSED, DROWSY),
    key(0.58, root({ z: -0.02, roll: -3 }), pelvis(0, -0.06), bend(19, 8, 4, 13, 0, -6), CROSSED, DROWSY),
    key(0.82, root({ z: -0.01 }), pelvis(0, -0.03), bend(10, 4, 2, 6), GUARD, DROWSY),
    key(1.25, OPEN_EYES),
  ],
};

/** Grown stronger: a crouch, then a hop up with its arms flung wide and the flames bursting, landing in a proud fist-pump. */
export const level_up: Clip = {
  name: 'level_up',
  duration: 1.55,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.06), bend(16, 4, 0, 6), CROSSED, FISTS, SHUT),
    snap(0.34, root({ y: 0.08 }), HOP, pelvis(0, 0.01), bend(-10, -8, -4, -16), ARMS_SPREAD_UP, jaw(24), HAPPY, flames(1)),
    fall(0.5, LAND, bend(0, -4, -2, -10), FISTS, armR([-0.85, -0.2, 0.49], [-0.1, 0.95, 0.3]), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), HAPPY, flames(1)),
    key(0.7, pelvis(0, -0.02), bend(-6, -6, -2, -12), FISTS, armR([-0.85, -0.18, 0.49], [-0.12, 0.96, 0.25]), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), jaw(10), HAPPY, flames(0.9)),
    key(0.92, pelvis(0, -0.018), bend(-6, -6, -2, -12, 4), FISTS, armR([-0.85, -0.2, 0.49], [-0.1, 0.95, 0.3]), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), HAPPY, flames(0.7)),
    key(1.14, pelvis(0, -0.01), bend(2, 0, 0, -2), GUARD, HAPPY, flames(0.3)),
    key(1.55, flames(0), OPEN_EYES),
  ],
};

/** Leech Seed saps it: a shudder, then it sags as the energy drains out, knees buckling and the arms hanging, then steadies. */
export const drained: Clip = {
  name: 'drained',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, 0.004), bend(-4, -2, 0, -6, 0, 4), HURT),
    key(0.42, pelvis(0, -0.06), bend(20, 8, 4, 14), LIMP, DROWSY),
    key(0.7, pelvis(0, -0.075), root({ roll: 2 }), bend(24, 10, 6, 18), LIMP, DROWSY),
    key(0.94, pelvis(0, -0.05), bend(14, 6, 2, 8), GUARD, DROWSY),
    key(1.35, OPEN_EYES),
  ],
};

/** Healed: a deep breath in with the eyes closed, then it relaxes, shoulders dropping, refreshed, and bobs happily. */
export const healed: Clip = {
  name: 'healed',
  duration: 1.35,
  keys: [
    key(0),
    key(0.28, pelvis(0, 0.012), bend(-8, -8, -4, -14), ELBOWS_BACK, SHUT),
    key(0.56, pelvis(0, -0.02), bend(6, 2, 0, 4), LIMP, HAPPY),
    key(0.76, pelvis(0, -0.03), bend(8, 2, 0, 2, 0, 5), LIMP, HAPPY),
    key(0.94, pelvis(0, -0.012), bend(4, 0, 0, -2, 0, -3), GUARD, HAPPY),
    key(1.35, OPEN_EYES),
  ],
};

/** Focus Punch's setup: it sinks into a still stance, the right fist drawn back to the hip, the left hand out, eyes shut; the flames gather and the eyes open. */
export const focus: Clip = {
  name: 'focus',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.05, -0.01), bend(8, 0, 0, -4, 8), FISTS, armR([-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]), armL([0.3, -0.2, 0.93], [0.12, 0.08, 0.99]), SHUT, flames(0.2)),
    key(0.5, pelvis(0.002, -0.056, -0.012), bend(9, 0, 0, -4, 8, 1), FISTS, armR([-0.5, -0.67, -0.55], [-0.18, -0.21, 0.96]), armL([0.3, -0.22, 0.93], [0.12, 0.06, 0.99]), SHUT, flames(0.5)),
    key(0.78, pelvis(-0.002, -0.06, -0.012), bend(10, 0, 0, -5, 8, -1), FISTS, armR([-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]), armL([0.3, -0.2, 0.93], [0.12, 0.08, 0.99]), ANGRY, flames(0.8)),
    key(1.02, pelvis(0.002, -0.058, -0.012), bend(9, 0, 0, -5, 8, 1), FISTS, armR([-0.5, -0.67, -0.55], [-0.18, -0.21, 0.96]), armL([0.3, -0.22, 0.93], [0.12, 0.06, 0.99]), ANGRY, flames(0.7)),
    key(1.45, flames(0), OPEN_EYES),
  ],
};

/** Hanging on at 1 HP: its knees buckle and it lurches, nearly going down, then grits its beak and pulls itself back up, defiant. */
export const hang_on: Clip = {
  name: 'hang_on',
  duration: 1.35,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.1), root({ roll: 6 }), bend(22, 10, 6, 16, 0, 8), LIMP, HURT),
    key(0.3, pelvis(0, -0.13), root({ roll: 8 }), bend(28, 12, 6, 20, 0, 10), LIMP, HURT),
    key(0.5, pelvis(0, -0.1), root({ roll: 4 }), bend(22, 8, 4, 10, 0, 6), BRACED, FISTS, SQUEEZE, jaw(4)),
    key(0.8, pelvis(0, -0.03), bend(4, 0, 0, -6), BRACED, FISTS, ANGRY, flames(0.5)),
    key(1.0, pelvis(0, -0.028), bend(4, 0, 0, -6, 3), GUARD, ANGRY, flames(0.3)),
    key(1.35, flames(0), OPEN_EYES),
  ],
};

// What the game only says -------------------------------------------------------

/** "Flinched!": startled, it recoils with its arms up, falters and shakes its head, unable to act. */
export const flinch: Clip = {
  name: 'flinch',
  duration: 0.95,
  keys: [
    key(0),
    snap(0.06, root({ z: -0.02 }), bend(-12, -6, -4, -14), X_GUARD, HURT),
    key(0.24, root({ z: -0.03 }), pelvis(0, -0.035), bend(8, 2, 2, 6), X_GUARD, DROWSY),
    key(0.44, root({ z: -0.02 }), pelvis(0, -0.03), bend(8, 2, 0, 2, 10), GUARD, DROWSY),
    key(0.58, pelvis(0, -0.02), bend(6, 2, 0, 0, -8), GUARD, ANGRY),
    key(0.95, OPEN_EYES),
  ],
};

/** "Must recharge!": spent, it slumps with its hands on its knees, panting hard, then straightens. */
export const recharge: Clip = {
  name: 'recharge',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.07), bend(28, 10, 4, 10), arms([[-0.2, -0.82, 0.54], [0, -0.96, 0.28]], [[0.2, -0.82, 0.54], [0, -0.96, 0.28]]), jaw(18), DROWSY),
    key(0.48, pelvis(0, -0.064), bend(24, 8, 4, 6), arms([[-0.2, -0.8, 0.56], [0, -0.95, 0.3]], [[0.2, -0.8, 0.56], [0, -0.95, 0.3]]), jaw(8), DROWSY),
    key(0.74, pelvis(0, -0.07), bend(28, 10, 4, 10), arms([[-0.2, -0.82, 0.54], [0, -0.96, 0.28]], [[0.2, -0.82, 0.54], [0, -0.96, 0.28]]), jaw(18), DROWSY),
    key(1.0, pelvis(0, -0.064), bend(24, 8, 4, 6), arms([[-0.2, -0.8, 0.56], [0, -0.95, 0.3]], [[0.2, -0.8, 0.56], [0, -0.95, 0.3]]), jaw(8), DROWSY),
    key(1.28, pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, jaw(4), DROWSY),
    key(1.65, OPEN_EYES),
  ],
};

/** "Woke up!": from its sleeping crouch it startles awake, eyes popping open, springs up and shakes the sleep off, back on guard. */
export const wake: Clip = {
  name: 'wake',
  duration: 1.25,
  keys: [
    key(0, pelvis(0, -0.2, -0.03), bend(18, 8, 6, 16, 0, 6), FOLDED, SHUT),
    snap(0.14, pelvis(0, -0.04), bend(-8, -6, -2, -14), arms([[-0.8, -0.3, 0.52], [-0.4, 0.4, 0.82]], [[0.8, -0.3, 0.52], [0.4, 0.4, 0.82]]), OPEN_EYES),
    key(0.3, pelvis(0, -0.035), bend(4, 2, 0, -4, 16), GUARD, SHUT),
    key(0.44, pelvis(0, -0.035), bend(4, 2, 0, -4, -16), GUARD, SHUT),
    key(0.58, pelvis(0, -0.03), bend(6, 2, 0, -4, 4), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Shaking off a condition (thawed, clear-headed, free of a bind, cured): a gather, then a whole-body shake, and back on guard. */
export const shake_off: Clip = {
  name: 'shake_off',
  duration: 1.15,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.04), bend(12, 4, 2, 8), LIMP, SHUT),
    key(0.24, root({ roll: 5 }), pelvis(0, -0.03), bend(6, 2, 2, 2, 14, 6), LIMP, SHUT),
    key(0.34, root({ roll: -5 }), pelvis(0, -0.03), bend(6, 2, 2, 2, -14, -6), LIMP, SHUT),
    key(0.44, root({ roll: 3 }), pelvis(0, -0.028), bend(5, 2, 2, 2, 8, 4), LIMP, SHUT),
    key(0.62, pelvis(0, -0.03), bend(8, 2, 0, -4), GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
};

/** Out of the Poké Ball again: curled, it bursts up with its arms flung wide and flames flaring, shakes itself angrily and squares up. */
export const break_free: Clip = {
  name: 'break_free',
  duration: 1.35,
  keys: [
    key(0, pelvis(0, -0.06), bend(18, 6, 2, 20), CROSSED, FISTS, SHUT),
    snap(0.18, pelvis(0, 0.014), bend(-12, -8, -4, -18), ARMS_SPREAD_UP, jaw(30), ANGRY, flames(1)),
    key(0.34, root({ roll: 4 }), pelvis(0, 0.004), bend(-4, -2, 0, -8, 10), ARMS_SPREAD_UP, jaw(12), ANGRY, flames(0.9)),
    key(0.48, root({ roll: -4 }), pelvis(0, 0.002), bend(-4, -2, 0, -8, -10), ARMS_SPREAD_UP, jaw(6), ANGRY, flames(0.8)),
    key(0.68, pelvis(0, -0.03), bend(10, 2, 0, -4), GUARD, FISTS, ANGRY, flames(0.5)),
    key(1.35, flames(0), OPEN_EYES),
  ],
};

// The weather, at the end of each turn it lasts ----------------------------------

/** Rain: a fire type hates it: it hunches with its arms crossed and its eyes squeezed, shakes the water off and grumbles. */
export const weather_rain: Clip = {
  name: 'weather_rain',
  duration: 1.45,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.045), bend(16, 6, 6, 12), CROSSED, SQUEEZE),
    key(0.4, root({ roll: 5 }), pelvis(0, -0.04), bend(12, 4, 4, 8, 14, 6), CROSSED, SQUEEZE),
    key(0.5, root({ roll: -5 }), pelvis(0, -0.04), bend(12, 4, 4, 8, -14, -6), CROSSED, SQUEEZE),
    key(0.6, root({ roll: 4 }), pelvis(0, -0.04), bend(12, 4, 4, 8, 12, 4), CROSSED, SQUEEZE),
    key(0.7, root({ roll: -3 }), pelvis(0, -0.04), bend(12, 4, 4, 8, -8, -3), CROSSED, SQUEEZE),
    key(0.92, pelvis(0, -0.025), bend(8, 2, 2, 4, 4), FOLDED, jaw(8), ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Strong sunlight: a fire type basks in it, its face tipped up and its eyes closed, arms opening, the flames flaring contentedly. */
export const weather_sun: Clip = {
  name: 'weather_sun',
  duration: 1.45,
  keys: [
    key(0),
    key(0.28, pelvis(0, 0.008), bend(-8, -6, -6, -18, 0, 4), arms([[-0.7, -0.6, 0.39], [-0.5, -0.3, 0.81]], [[0.7, -0.6, 0.39], [0.5, -0.3, 0.81]]), SHUT, flames(0.6)),
    key(0.6, pelvis(0.006, 0.01), root({ roll: 2 }), bend(-9, -6, -6, -19, 0, -4), arms([[-0.72, -0.58, 0.39], [-0.52, -0.28, 0.81]], [[0.72, -0.58, 0.39], [0.52, -0.28, 0.81]]), HAPPY, flames(0.9)),
    key(0.9, pelvis(-0.006, 0.008), root({ roll: -2 }), bend(-8, -6, -6, -18, 0, 4), arms([[-0.7, -0.6, 0.39], [-0.5, -0.3, 0.81]], [[0.7, -0.6, 0.39], [0.5, -0.3, 0.81]]), HAPPY, flames(0.8)),
    key(1.14, pelvis(0, -0.01), bend(2, 0, 0, -4), GUARD, HAPPY, flames(0.3)),
    key(1.45, flames(0), OPEN_EYES),
  ],
};

/** A sandstorm: it braces low, turning its head aside with its forearm raised before its eyes, flinching at the grit. */
export const weather_sand: Clip = {
  name: 'weather_sand',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.05), bend(12, 4, 2, 6, -16), armR([-0.35, -0.3, 0.89], [0.55, 0.62, 0.56]), armL([0.45, -0.75, -0.48], [0.2, -0.4, 0.9]), SQUEEZE),
    key(0.46, pelvis(0.003, -0.052), bend(13, 4, 2, 7, -18, 2), armR([-0.35, -0.28, 0.89], [0.55, 0.64, 0.54]), armL([0.45, -0.75, -0.48], [0.2, -0.4, 0.9]), SQUEEZE),
    key(0.66, pelvis(0, -0.056), bend(15, 5, 2, 8, -20), armR([-0.35, -0.3, 0.89], [0.55, 0.62, 0.56]), armL([0.45, -0.75, -0.48], [0.2, -0.4, 0.9]), HURT),
    key(0.9, pelvis(-0.003, -0.052), bend(13, 4, 2, 7, -17, -2), armR([-0.35, -0.28, 0.89], [0.55, 0.64, 0.54]), armL([0.45, -0.75, -0.48], [0.2, -0.4, 0.9]), SQUEEZE),
    key(1.12, pelvis(0, -0.02), bend(4, 0, 0, -2, -4), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
};

/** Hail: it flinches as the hailstones hit, hunching with a forearm over its head, flinching again, then shakes it off. */
export const weather_hail: Clip = {
  name: 'weather_hail',
  duration: 1.35,
  keys: [
    key(0),
    snap(0.08, pelvis(0, -0.02), bend(-6, -2, 0, -10), HURT, GUARD),
    key(0.24, pelvis(0, -0.06), bend(20, 8, 6, 14), armL([0.4, -0.1, 0.91], [-0.55, 0.55, 0.63]), armR([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86]), SQUEEZE),
    snap(0.42, pelvis(0, -0.07), bend(23, 9, 6, 16, 0, 4), armL([0.4, -0.08, 0.91], [-0.55, 0.57, 0.61]), armR([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86]), HURT),
    key(0.58, pelvis(0, -0.062), bend(20, 8, 6, 14, 0, -3), armL([0.4, -0.1, 0.91], [-0.55, 0.55, 0.63]), armR([-0.4, -0.75, 0.53], [-0.1, -0.5, 0.86]), SQUEEZE),
    key(0.8, root({ roll: 3 }), pelvis(0, -0.03), bend(8, 2, 0, 0, 8), GUARD, ANGRY),
    key(0.94, root({ roll: -2 }), pelvis(0, -0.02), bend(6, 2, 0, 0, -6), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
};

export const SITUATIONS: Clip[] = [
  idle, intro, hit, hit_strong, faint, dodge, unaffected, return_home,
  status_sleep, status_poison, status_burn, status_paralysis, status_freeze, status_confusion, status_infatuation, status_curse, status_nightmare, status_wrapped,
  idle_asleep, idle_tired, stat_up, stat_down, level_up, drained, healed, focus, hang_on,
  flinch, recharge, wake, shake_off, break_free, weather_rain, weather_sun, weather_sand, weather_hail,
];
