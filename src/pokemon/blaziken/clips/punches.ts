// Blaziken's fists. Each leaps in, plants, and drives the fist into the foe
// with the hips and shoulders turning behind it and the body lunging in
// (root.z: at advance 1 the bodies are at striking distance, the lunge
// closes it); the fist trails the hips by 0.08 s, so the impact comes that
// much after the snap, while the arm holds at full reach.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, ARRIVE, FISTS, GUARD, GUARD_L, GUARD_R, HURT, LAND, OPEN_EYES, RISING, SHUT, X_GUARD,
  armL, armR, at, bend, fall, flames, hopHome, jaw, key, leap, lunge, pelvis, root, snap, twist, stepIn,
} from './kit';

/** The right fist driven straight at the foe's middle. */
const STRAIGHT_R = armR([-0.04, -0.14, 0.99], [0, -0.08, 1]);
/** The left fist pulled back to the hip. */
const HIP_L = armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]);

/**
 * Mega Punch: a haymaker. The fist wound far back by the ear, a leap in, and
 * a huge straight right into the foe's middle as the hips and shoulders
 * rotate behind it; follow-through leaning over the front foot.
 */
export const mega_punch: Clip = {
  name: 'mega_punch',
  duration: 1.45,
  keys: [
    key(0),
    // Wound far back: the elbow high behind, the fist by the ear.
    key(0.16, pelvis(0, -0.045), twist(-30, 4), bend(14, 2, 0, -10, 12), FISTS, GUARD_L, armR([-0.62, 0.12, -0.78], [-0.12, 0.62, 0.78]), ANGRY),
    key(0.3, leap(0.55, 0.08), twist(-32, 4), bend(10, 2, 0, -10, 12), FISTS, GUARD_L, armR([-0.6, 0.16, -0.78], [-0.1, 0.66, 0.74]), ANGRY),
    key(0.42, ARRIVE, twist(-34, 4), bend(16, 2, 0, -10, 14), FISTS, GUARD_L, armR([-0.62, 0.12, -0.78], [-0.12, 0.62, 0.78]), ANGRY),
    // The punch: hips and shoulders rotate, the body lunges, the fist drives straight in.
    snap(0.5, at(1), stepIn(0.24), pelvis(0.01, -0.05, 0.02), twist(24, -4), bend(18, 6, 0, -6, -8), FISTS, HIP_L, STRAIGHT_R, jaw(14), ANGRY),
    key(0.6, at(1), stepIn(0.26), pelvis(0.011, -0.052, 0.022), twist(26, -4), bend(19, 6, 0, -6, -9), FISTS, HIP_L, armR([-0.04, -0.18, 0.98], [0, -0.12, 0.99]), jaw(10), ANGRY),
    // Follow-through: leaning over the front foot.
    key(0.74, at(1), stepIn(0.2), pelvis(0.008, -0.05, 0.015), twist(22, -3), bend(22, 8, 0, -4, -8), FISTS, HIP_L, armR([-0.06, -0.3, 0.95], [0.02, -0.28, 0.96]), ANGRY),
    key(0.9, at(1), stepIn(0.04), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.04, GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/** Fire Punch: a hook. The fist ablaze swings in from the side into the foe's jaw, flames flaring. */
export const fire_punch: Clip = {
  name: 'fire_punch',
  duration: 1.45,
  keys: [
    key(0),
    // The hook chambered wide at shoulder height, the flames catching.
    key(0.14, pelvis(0, -0.04), twist(-22, 3), bend(12, 2, 0, -8, 10), FISTS, GUARD_L, armR([-0.9, -0.08, -0.43], [-0.25, 0.12, 0.96]), flames(0.6), ANGRY),
    key(0.27, leap(0.55, 0.07), twist(-24, 3), bend(8, 2, 0, -8, 10), FISTS, GUARD_L, armR([-0.9, -0.06, -0.43], [-0.25, 0.14, 0.96]), flames(0.8), ANGRY),
    key(0.38, ARRIVE, twist(-26, 3), bend(14, 2, 0, -8, 12), FISTS, GUARD_L, armR([-0.92, -0.08, -0.38], [-0.28, 0.12, 0.95]), flames(0.9), ANGRY),
    // The hook: the flaming fist arcs in from the side, the forearm across.
    snap(0.45, at(1), stepIn(0.18), pelvis(0.01, -0.045, 0.015), twist(28, -5), bend(16, 4, 0, -6, -10), FISTS, GUARD_L, armR([-0.34, 0.06, 0.94], [0.76, 0.12, 0.64]), flames(1), jaw(10), ANGRY),
    key(0.55, at(1), stepIn(0.19), pelvis(0.011, -0.046, 0.016), twist(31, -5), bend(17, 4, 0, -6, -11), FISTS, GUARD_L, armR([-0.22, 0.04, 0.97], [0.82, 0.08, 0.57]), flames(1), jaw(8), ANGRY),
    // Carried through across its body.
    key(0.68, at(1), stepIn(0.12), pelvis(0.01, -0.042), twist(36, -5), bend(18, 4, 0, -6, -12), FISTS, GUARD_L, armR([0.12, -0.05, 0.99], [0.9, -0.05, 0.43]), flames(0.8), ANGRY),
    key(0.84, at(1), stepIn(0.03), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, flames(0.5), ANGRY),
    ...hopHome(0.98, GUARD, flames(0.3), ANGRY),
    key(1.45, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

/** Thunder Punch: an overhand. The fist cocked up high behind the head, brought down over the top into the foe. */
export const thunder_punch: Clip = {
  name: 'thunder_punch',
  duration: 1.45,
  keys: [
    key(0),
    // The fist cocked high behind the head, leaning back.
    key(0.14, pelvis(0, -0.02), twist(-18, 6), bend(-6, -4, 0, -12, 10), FISTS, GUARD_L, armR([-0.5, 0.82, -0.28], [0, 0.42, -0.91]), ANGRY),
    key(0.27, leap(0.55, 0.09), twist(-18, 6), bend(-4, -4, 0, -12, 10), FISTS, GUARD_L, armR([-0.48, 0.84, -0.26], [0, 0.38, -0.92]), ANGRY),
    key(0.38, ARRIVE, twist(-20, 6), bend(2, -2, 0, -12, 12), FISTS, GUARD_L, armR([-0.5, 0.82, -0.28], [0, 0.42, -0.91]), ANGRY),
    // Over the top and down into it, the body bending behind the fist.
    snap(0.46, at(1), stepIn(0.2), pelvis(0.006, -0.06, 0.015), twist(14, -8), bend(26, 8, 2, -2, -6), FISTS, HIP_L, armR([-0.14, -0.06, 0.99], [0.05, -0.52, 0.85]), jaw(12), ANGRY),
    key(0.56, at(1), stepIn(0.21), pelvis(0.006, -0.064, 0.016), twist(15, -8), bend(28, 8, 2, -2, -6), FISTS, HIP_L, armR([-0.12, -0.2, 0.97], [0.05, -0.66, 0.75]), jaw(8), ANGRY),
    // Driven on down.
    key(0.7, at(1), stepIn(0.12), pelvis(0.004, -0.06), twist(12, -6), bend(30, 8, 2, 0, -5), FISTS, HIP_L, armR([-0.1, -0.52, 0.85], [0.05, -0.86, 0.5]), ANGRY),
    key(0.84, at(1), stepIn(0.03), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.98, GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

/**
 * Dynamic Punch: a slow, huge wind-up, the whole body coiled with the fist
 * back at the hip and the flames building, a springing leap and an explosive
 * full-body punch; the impact rocks both, a beat of stillness after.
 */
export const dynamic_punch: Clip = {
  name: 'dynamic_punch',
  duration: 2.05,
  keys: [
    key(0),
    // Coiling, slowly: deep crouch, twisted away, the fist far back at the hip, the left fist aiming.
    key(0.34, pelvis(0, -0.08), twist(-40, 6), bend(20, 4, 0, -12, 16), FISTS, armL([0.2, -0.1, 0.97], [0.1, 0.06, 0.99]), armR([-0.45, -0.45, -0.77], [-0.25, -0.3, 0.92]), flames(0.5), ANGRY),
    key(0.52, pelvis(0, -0.09), twist(-44, 7), bend(22, 4, 0, -12, 17), FISTS, armL([0.2, -0.12, 0.97], [0.1, 0.04, 0.99]), armR([-0.46, -0.44, -0.77], [-0.26, -0.3, 0.92]), flames(0.8), ANGRY),
    key(0.66, leap(0.6, 0.1), twist(-44, 7), bend(14, 4, 0, -12, 16), FISTS, armL([0.2, -0.1, 0.97], [0.1, 0.06, 0.99]), armR([-0.45, -0.45, -0.77], [-0.25, -0.3, 0.92]), flames(1), ANGRY),
    key(0.78, ARRIVE, twist(-46, 7), bend(20, 4, 0, -12, 17), FISTS, armL([0.2, -0.12, 0.97], [0.1, 0.04, 0.99]), armR([-0.46, -0.44, -0.77], [-0.26, -0.3, 0.92]), flames(1), ANGRY),
    // The explosion: everything behind the fist.
    snap(0.86, at(1), stepIn(0.3), pelvis(0.012, -0.05, 0.03), twist(30, -6), bend(18, 8, 0, -6, -10), FISTS, HIP_L, armR([-0.02, -0.06, 1], [0, 0, 1]), jaw(24), flames(1), ANGRY),
    key(0.96, at(1), stepIn(0.31), pelvis(0.013, -0.052, 0.031), twist(31, -6), bend(19, 8, 0, -6, -10), FISTS, HIP_L, armR([-0.02, -0.1, 0.99], [0, -0.04, 1]), jaw(20), flames(1), ANGRY),
    // The beat of stillness after: the whole body locked in the follow-through, barely drifting.
    key(1.14, at(1), stepIn(0.3), pelvis(0.013, -0.054, 0.03), twist(32, -6), bend(20, 8, 0, -5, -10), FISTS, HIP_L, armR([-0.03, -0.12, 0.99], [0, -0.07, 1]), jaw(6), flames(0.9), ANGRY),
    key(1.34, at(1), stepIn(0.27), pelvis(0.012, -0.055, 0.028), twist(31, -5), bend(21, 8, 0, -5, -9), FISTS, HIP_L, armR([-0.04, -0.16, 0.99], [0, -0.12, 0.99]), flames(0.8), ANGRY),
    key(1.5, at(1), stepIn(0.05), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, flames(0.6), ANGRY),
    ...hopHome(1.64, GUARD, flames(0.4), ANGRY),
    key(2.05, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.94, name: 'impact' }],
};

/**
 * Focus Punch: from a still, focused stance (eyes shut, the fist drawn to the
 * hip, the open left hand out), the eyes snap open, a low fast leap and an
 * exploding straight with a shout: the most powerful punch it has.
 */
export const focus_punch: Clip = {
  name: 'focus_punch',
  duration: 1.8,
  keys: [
    key(0),
    // Stillness: the breath held, the fist at the hip.
    key(0.2, pelvis(0, -0.04, -0.01), twist(-18), bend(8, 0, 0, -4, 8), FISTS, armL([0.3, -0.2, 0.93], [0.12, 0.08, 0.99]), armR([-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]), flames(0.3), SHUT),
    key(0.38, pelvis(0, -0.045, -0.012), twist(-20), bend(9, 0, 0, -4, 8), FISTS, armL([0.3, -0.22, 0.93], [0.12, 0.06, 0.99]), armR([-0.5, -0.67, -0.55], [-0.18, -0.21, 0.96]), flames(0.6), SHUT),
    // The eyes snap open; a low, fast leap.
    key(0.5, leap(0.6, 0.05), twist(-22), bend(14, 0, 0, -6, 8), FISTS, armL([0.3, -0.2, 0.93], [0.12, 0.08, 0.99]), armR([-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]), flames(0.9), ANGRY),
    key(0.6, ARRIVE, twist(-24), bend(16, 0, 0, -6, 10), FISTS, armL([0.3, -0.22, 0.93], [0.12, 0.06, 0.99]), armR([-0.5, -0.67, -0.55], [-0.18, -0.21, 0.96]), flames(1), ANGRY),
    // The straight explodes out.
    snap(0.66, at(1), stepIn(0.28), pelvis(0.012, -0.05, 0.03), twist(26, -4), bend(16, 6, 0, -6, -8), FISTS, HIP_L, STRAIGHT_R, jaw(28), flames(1), ANGRY),
    key(0.76, at(1), stepIn(0.29), pelvis(0.013, -0.052, 0.031), twist(27, -4), bend(17, 6, 0, -6, -8), FISTS, HIP_L, armR([-0.04, -0.16, 0.99], [0, -0.1, 0.99]), jaw(22), flames(1), ANGRY),
    key(0.92, at(1), stepIn(0.24), pelvis(0.01, -0.05, 0.025), twist(25, -3), bend(18, 6, 0, -5, -8), FISTS, HIP_L, armR([-0.05, -0.2, 0.98], [0, -0.16, 0.99]), jaw(6), flames(0.9), ANGRY),
    key(1.1, at(1), stepIn(0.04), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, flames(0.6), ANGRY),
    ...hopHome(1.24, GUARD, flames(0.4), ANGRY),
    key(1.8, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/**
 * Sky Uppercut: a dash in low, crouched under the foe with the fist at the
 * hip, then an uppercut rising up through it, the whole body extending and
 * the feet leaving the ground, the fist high at the top; it drops back into
 * a crouch and hops home.
 */
export const sky_uppercut: Clip = {
  name: 'sky_uppercut',
  duration: 1.6,
  keys: [
    key(0),
    // Wind down: deep crouch, the right fist chambered low.
    key(0.14, pelvis(0, -0.07), bend(24, 6, -6, -14), FISTS, GUARD_L, armR([-0.45, -0.75, -0.48], [-0.15, -0.35, 0.92]), flames(0.5), ANGRY),
    // Dash in low along a shallow arc.
    key(0.3, leap(0.7, 0.04), bend(26, 6, -6, -14), FISTS, GUARD_L, armR([-0.45, -0.75, -0.48], [-0.15, -0.35, 0.92]), flames(0.7), ANGRY),
    // Plant under the foe, coiled.
    key(0.42, ARRIVE, stepIn(0.1), pelvis(0, -0.03), bend(26, 8, -6, -16), FISTS, GUARD_L, armR([-0.5, -0.8, -0.33], [-0.15, -0.2, 0.97]), flames(0.8), ANGRY),
    // The uppercut: everything drives up and in, the fist rising through the
    // foe's chin, the feet leaving the ground.
    snap(0.5, at(1), root({ y: 0.05 }), lunge(0.42), RISING, pelvis(0, 0.01), bend(0, -2, -6, -16), FISTS, HIP_L, armR([-0.12, 0.5, 0.86], [-0.06, 0.78, 0.62]), flames(1), ANGRY),
    key(0.58, at(1), root({ y: 0.1 }), lunge(0.42), RISING, pelvis(0, 0.02), bend(-8, -5, -6, -18), FISTS, HIP_L, armR([-0.12, 0.72, 0.68], [-0.06, 0.9, 0.43]), flames(1), ANGRY),
    // Apex: stretched tall, the fist high over the foe.
    key(0.72, at(1), root({ y: 0.17 }), lunge(0.3), RISING, pelvis(0, 0.02), bend(-16, -9, -6, -22), FISTS, HIP_L, armR([-0.1, 0.97, 0.2], [-0.05, 0.99, 0.05]), flames(1), ANGRY),
    // Drop back into a crouch.
    fall(0.9, at(1), stepIn(0.06), LAND, pelvis(0, -0.03), bend(20, 4, 0, -8), GUARD, flames(0.6), ANGRY),
    key(1.05, at(1), pelvis(0, -0.02), bend(12, 2, 0, -4), GUARD, flames(0.4), ANGRY),
    ...hopHome(1.2, GUARD, flames(0.3), ANGRY),
    key(1.6, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

/**
 * Counter: braced as the blow lands (arms up, a wince), it soaks it up, then
 * springs at the foe and strikes back hard with a straight left: a fast,
 * angry retaliation.
 */
export const counter: Clip = {
  name: 'counter',
  duration: 1.5,
  keys: [
    key(0),
    // Taking the blow behind its guard: a wince, rocked back.
    key(0.1, pelvis(0, -0.03, -0.015), root({ z: -0.03 }), bend(-8, -4, 0, -10), X_GUARD, HURT),
    key(0.24, pelvis(0, -0.06, -0.01), root({ z: -0.03 }), twist(18), bend(14, 2, 0, -8, -8), FISTS, GUARD_R, armL([0.45, -0.62, -0.64], [0.18, -0.2, 0.96]), flames(0.6), ANGRY),
    // Springs back at it.
    key(0.36, leap(0.62, 0.07), twist(20), bend(10, 2, 0, -8, -8), FISTS, GUARD_R, armL([0.45, -0.62, -0.64], [0.18, -0.2, 0.96]), flames(0.9), ANGRY),
    key(0.46, ARRIVE, twist(22), bend(16, 2, 0, -8, -10), FISTS, GUARD_R, armL([0.46, -0.64, -0.62], [0.18, -0.22, 0.96]), flames(1), ANGRY),
    // The retaliation: a straight left driven in, the left shoulder leading.
    snap(0.52, at(1), stepIn(0.24), pelvis(-0.01, -0.05, 0.02), twist(-24, 4), bend(18, 6, 0, -6, 8), FISTS, GUARD_R, armL([0.04, -0.14, 0.99], [0, -0.08, 1]), jaw(18), flames(1), ANGRY),
    key(0.62, at(1), stepIn(0.25), pelvis(-0.011, -0.051, 0.021), twist(-26, 4), bend(19, 6, 0, -6, 9), FISTS, GUARD_R, armL([0.04, -0.18, 0.98], [0, -0.12, 0.99]), jaw(12), flames(1), ANGRY),
    key(0.76, at(1), stepIn(0.16), pelvis(-0.008, -0.048), twist(-20, 3), bend(20, 6, 0, -5, 8), FISTS, GUARD_R, armL([0.06, -0.3, 0.95], [0.02, -0.26, 0.96]), flames(0.8), ANGRY),
    key(0.9, at(1), stepIn(0.03), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, flames(0.5), ANGRY),
    ...hopHome(1.04, GUARD, flames(0.3), ANGRY),
    key(1.5, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

export const PUNCHES: Clip[] = [mega_punch, fire_punch, thunder_punch, dynamic_punch, focus_punch, sky_uppercut, counter];
