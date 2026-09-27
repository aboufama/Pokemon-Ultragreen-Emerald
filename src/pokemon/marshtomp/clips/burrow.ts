// Marshtomp's two-turn burrows: Dig and Dive. Digging and diving are its
// element. The first turn (`_charge`) takes it out of sight (dig: the ground,
// or a splash of water, bursts up round it as it goes under) and ends
// underground at home; the second starts there, travels under the field to
// the foe (the director heaves mounds or bubbles along the way) and bursts
// up in front of it into the foe (impact as it breaks the surface), comes
// down heavily, holds the crouch and hops home.

import {
  ANGRY, ARMS_UP, ARMS_WIDE, CROSSED_LOW, FISTS, HOP, LAND, LAND_DEEP, LAND_HOME, MOUTH_SHUT, OPEN_EYES, SHUT, TUCK, arms,
  bend, clip, fall, hopHome, jaw, key, pelvis, sink, snap,
} from './kit';

/** Arms swung back behind the body (a diver about to spring). */
const DIVE_BACK = arms([0.55, -0.45, -0.7], [0.4, -0.6, -0.7], [0.2, -0.75, -0.62]);
/** Arms swept forward together past the head (a diver's reach). */
const DIVE_REACH = arms([0.25, 0.6, 0.76], [0.05, 0.7, 0.71], [-0.05, 0.7, 0.71]);
/** Fists drawn in low before the belly (underground, coiled to burst up). */
const FISTS_LOW = arms([0.6, -0.7, 0.38], [-0.2, -0.3, 0.93], [-0.35, -0.2, 0.92]);
/** Claws driven down into the ground in front, both at once (digging). */
const DIG_ARMS = arms([0.42, -0.84, 0.35], [0.05, -0.95, 0.3], [-0.05, -0.95, 0.3]);
/** ... one claw scooping back past the hip while the other digs in (alternating). */
const DIG_L = arms([0.42, -0.84, 0.35], [0.05, -0.95, 0.3], [-0.05, -0.95, 0.3], [[-0.55, -0.7, -0.45], [-0.3, -0.8, -0.52], [-0.2, -0.6, -0.77]]);
const DIG_R = arms([0.55, -0.7, -0.45], [0.3, -0.8, -0.52], [0.2, -0.6, -0.77], [[-0.42, -0.84, 0.35], [-0.05, -0.95, 0.3], [0.05, -0.95, 0.3]]);

/** Out of sight under its own place, crouched to spring (where both burrows' first turns end). */
const UNDER = { advance: 0.1, plantFeet: 0, root: { y: -1.3 } };

/**
 * Dig, the first turn: it crouches and tears at the ground with both claws in
 * turn, the dirt flying (dig), and sinks into the hole it makes, gathering
 * speed, the head fin going under last.
 */
export const digCharge = clip('dig_charge', [
  key(0),
  key(0.14, sink(-0.06), bend(20, 6, 0, 12), CROSSED_LOW, MOUTH_SHUT, ANGRY),
  key(0.26, sink(-0.09), bend(30, 8, 2, 16), DIG_L, FISTS, MOUTH_SHUT, ANGRY),
  key(0.37, sink(-0.09), bend(30, 8, 2, 16), DIG_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.48, { root: { y: -0.12 } }, sink(-0.09), bend(32, 8, 2, 18), DIG_L, FISTS, MOUTH_SHUT, ANGRY),
  key(0.58, { root: { y: -0.35 } }, sink(-0.09), bend(34, 8, 2, 18), DIG_ARMS, FISTS, MOUTH_SHUT, SHUT),
  fall(0.79, { advance: 0.05, plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.08), bend(30, 8, 2, 16), DIG_ARMS, FISTS, MOUTH_SHUT, SHUT),
  key(0.97, UNDER, pelvis(0, -0.08), bend(16, 4, 0, 6), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
], [[0.3, 'dig']]);

/**
 * Dig, the strike: from under its place it tunnels over to the foe, then
 * bursts up out of the ground in front of it, both fists driving up into it
 * (impact as it breaks the surface), comes down heavily with its arms braced
 * wide, holds the crouch glaring at it and hops home.
 */
export const dig = clip('dig', [
  key(0, UNDER, pelvis(0, -0.08), bend(16, 4, 0, 6), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
  key(0.16, { advance: 0.5, plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.09), bend(18, 4, 0, 8), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
  key(0.32, { advance: 1, plantFeet: 0, root: { y: -1.28, z: 0.18 } }, pelvis(0, -0.1), bend(20, 5, 0, 8), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.44, { advance: 1, plantFeet: 0, root: { y: 0.16, z: 0.3 } }, TUCK, pelvis(0, 0.02), bend(-10, -6, -2, -14), ARMS_UP, FISTS, jaw(20), ANGRY),
  key(0.55, { advance: 0.98, plantFeet: 0, root: { y: 0.2, z: 0.28 } }, TUCK, pelvis(0, 0.02), bend(-12, -6, -2, -16), ARMS_UP, FISTS, jaw(22), ANGRY),
  fall(0.7, { advance: 0.95, root: { z: 0.1 } }, LAND_DEEP, bend(-2, -1, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  key(0.81, { advance: 0.95, root: { z: 0.08 } }, LAND_DEEP, pelvis(0, -0.02), bend(0, 0, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  key(1.02, { advance: 0.95 }, pelvis(0, -0.05), bend(2, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  ...hopHome(1.16, ANGRY),
  key(1.46, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.76, OPEN_EYES),
], [[0.48, 'impact']]);

/**
 * Dive, the first turn: it rears back with the arms swung back, hops and
 * plunges head first into the water (dig: a splash), the tail lobes going
 * under last, and swims down out of sight.
 */
export const diveCharge = clip('dive_charge', [
  key(0),
  key(0.21, pelvis(0, -0.04, -0.05), bend(-9, -4, 0, -4), DIVE_BACK, MOUTH_SHUT, ANGRY),
  key(0.37, { root: { y: 0.12, pitch: 40 } }, TUCK, pelvis(0, -0.02), bend(-4, -3, 0, -4), DIVE_REACH, MOUTH_SHUT, ANGRY),
  key(0.49, { advance: 0.04, plantFeet: 0, root: { y: 0.08, pitch: 98 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
  key(0.65, { advance: 0.08, plantFeet: 0, root: { y: -0.95, pitch: 108 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
  key(0.84, UNDER, { root: { pitch: 40 } }, pelvis(0, -0.06), bend(6, 2, 0, 2), DIVE_REACH, MOUTH_SHUT, SHUT),
  key(0.97, UNDER, pelvis(0, -0.08), bend(12, 3, 0, 4), DIVE_REACH, MOUTH_SHUT, ANGRY),
], [[0.44, 'dig']]);

/**
 * Dive, the strike: it swims over under the field and breaches up in front
 * of the foe head and arms first, like a diver surfacing, the whole body
 * surging up through it (impact as it clears the surface); it comes down
 * with a heavy splash, braced wide, and hops home.
 */
export const dive = clip('dive', [
  key(0, UNDER, pelvis(0, -0.08), bend(12, 3, 0, 4), DIVE_REACH, MOUTH_SHUT, ANGRY),
  key(0.18, { advance: 0.55, plantFeet: 0, root: { y: -1.3, pitch: -20 } }, pelvis(0, -0.06), bend(6, 2, 0, 0), DIVE_REACH, MOUTH_SHUT, ANGRY),
  key(0.33, { advance: 1, plantFeet: 0, root: { y: -1.25, z: 0.16, pitch: -10 } }, pelvis(0, -0.08), bend(10, 3, 0, 2), DIVE_REACH, MOUTH_SHUT, ANGRY),
  snap(0.46, { advance: 1, plantFeet: 0, root: { y: 0.18, z: 0.22, pitch: 12 } }, HOP, pelvis(0, 0.02), bend(-8, -5, -2, -12), DIVE_REACH, jaw(18), ANGRY),
  key(0.56, { advance: 0.98, plantFeet: 0, root: { y: 0.22, z: 0.2, pitch: 6 } }, TUCK, pelvis(0, 0.02), bend(-10, -6, -2, -14), ARMS_UP, jaw(22), ANGRY),
  fall(0.7, { advance: 0.95, root: { z: 0.1 } }, LAND, pelvis(0, -0.07), bend(4, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  key(0.81, { advance: 0.95, root: { z: 0.08 } }, LAND, pelvis(0, -0.09), bend(6, 2, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  key(1.02, { advance: 0.95 }, pelvis(0, -0.05), bend(2, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
  key(1.16, { advance: 0.5, root: { y: 0.06 } }, HOP, ANGRY),
  key(1.3, { advance: 0 }, LAND_HOME, ANGRY),
  key(1.58, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.49, 'impact']]);

export const BURROW_CLIPS = [digCharge, dig, diveCharge, dive];

