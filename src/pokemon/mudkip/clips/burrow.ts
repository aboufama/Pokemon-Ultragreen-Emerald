// Mudkip's two-turn burrows: Dig and Dive. The first turn (`_charge`) takes
// it out of sight and ends underground at home: for Dig it scrabbles at the
// ground with its front paws, the dirt flying (dig), and noses into the hole
// it makes; for Dive it hops and plunges in head first like a diver (dig: the
// splash). The second starts there, travels under the field to the foe (the
// director heaves mounds or bubbles along the way) and bursts up in front of
// it crown first (impact as it breaks the surface), lands and hops home.

import type { Pose } from '../../../anim/rig';
import {
  AIRBORNE, ANGRY, COIL, FOCUS, FRONT_REACH, FRONT_TUCK, HIND_KICK, HIND_TUCK, LAND, OPEN_EYES, SHUT, TUCKED, bend, clip, fall, finUp, front,
  hips, hopHome, jaw, key, pawBack, pawUp, pelvis, snap, tail,
} from './kit';

/** Out of sight under its own place (where both first turns end). */
const UNDER: Pose = { advance: 0.1, plantFeet: 0, plantFront: 0, root: { y: -1.3 } };

/**
 * Dig, the first turn: it scrabbles at the ground with its front paws, left
 * and right, faster and faster, the dirt flying out behind (dig), then noses
 * into the hole and dives in head first, the tail fin going under last.
 */
export const digCharge = clip('dig_charge', [
  key(0),
  key(0.12, pelvis(0, -0.02, 0.006), bend(8, 4, 12), tail(10), ANGRY),
  key(0.22, { plantFront: 0 }, pelvis(0, -0.024, 0.008), bend(10, 5, 14), pawUp('L'), pawBack('R'), tail(16, 10), ANGRY),
  key(0.32, { plantFront: 0 }, pelvis(0, -0.026, 0.008), bend(10, 5, 14), pawBack('L'), pawUp('R'), tail(16, -10), ANGRY),
  key(0.42, { plantFront: 0 }, pelvis(0, -0.03, 0.01), bend(11, 5, 16), pawUp('L'), pawBack('R'), tail(18, 10), ANGRY),
  key(0.5, { plantFeet: 0, plantFront: 0 }, { root: { y: -0.08, pitch: 10 } }, pelvis(0, -0.03, 0.01), bend(12, 5, 18), pawBack('L'), pawUp('R'), tail(20, -10), SHUT),
  key(0.64, { plantFeet: 0, plantFront: 0 }, { root: { y: -0.32, pitch: 40 } }, pelvis(0, -0.02), hips(10), bend(10, 4, 14), FRONT_TUCK, HIND_KICK, tail(24), SHUT),
  fall(0.84, { advance: 0.05, plantFeet: 0, plantFront: 0, root: { y: -1.3, pitch: 60 } }, hips(12), bend(8, 4, 12), FRONT_TUCK, HIND_KICK, tail(30), SHUT),
  key(1.04, UNDER, { root: { pitch: 10 } }, pelvis(0, -0.02), bend(6, 2, 8), FRONT_TUCK, HIND_TUCK, tail(8), ANGRY),
], [[0.24, 'dig']]);

/**
 * Dig, the strike: from under its place it tunnels over to the foe, then
 * bursts up out of the ground right in front of it, crown and fin first,
 * butting up into it (impact as it breaks the surface); it flips down onto
 * its feet, shakes the dirt off and hops home.
 */
export const dig = clip('dig', [
  key(0, UNDER, { root: { pitch: 10 } }, pelvis(0, -0.02), bend(6, 2, 8), FRONT_TUCK, HIND_TUCK, tail(8), ANGRY),
  key(0.16, { advance: 0.5, plantFeet: 0, plantFront: 0, root: { y: -1.3, pitch: 0 } }, pelvis(0, -0.02), bend(6, 2, 8), FRONT_TUCK, HIND_TUCK, tail(8), ANGRY),
  key(0.32, { advance: 1, plantFeet: 0, plantFront: 0, root: { y: -1.25, z: 0.4, pitch: -30 } }, pelvis(0, -0.02), bend(8, 4, 16), FRONT_TUCK, HIND_KICK, tail(-10), ANGRY),
  snap(0.44, { advance: 1, plantFeet: 0, plantFront: 0, root: { y: 0.34, z: 0.52, pitch: -36 } }, AIRBORNE, hips(8), bend(10, 6, 20), tail(-24), jaw(-2), ANGRY),
  key(0.56, { advance: 0.98, plantFeet: 0, plantFront: 0, root: { y: 0.42, z: 0.36, pitch: -24 } }, TUCKED, bend(2, 1, 4), tail(-10), ANGRY),
  fall(0.7, { advance: 0.96, root: { z: 0.2 } }, LAND, pelvis(0, -0.02), tail(6), ANGRY),
  key(0.8, { advance: 0.96, root: { z: 0.19 } }, LAND, pelvis(0, -0.012), bend(1, 0, 3, 0, 10), tail(2, 10), SHUT),
  key(0.9, { advance: 0.96, root: { z: 0.18 } }, LAND, pelvis(0, -0.01), bend(1, 0, 3, 0, -10), tail(2, -10), SHUT),
  key(1.02, { advance: 0.96, root: { y: 0.3, pitch: -6 } }, TUCKED, ANGRY),
  key(1.14, { advance: 0.62 }, LAND, ANGRY),
  key(1.26, { advance: 0.3, root: { y: 0.24, pitch: -4 } }, TUCKED, ANGRY),
  key(1.38, { advance: 0 }, LAND, ANGRY),
  key(1.6, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.48, 'impact']]);

/**
 * Dive, the first turn: it crouches back on its haunches, springs up and
 * over in an arc and plunges in head first like a diver (dig: the splash),
 * front paws together ahead of it and the tail fin going under last.
 */
export const diveCharge = clip('dive_charge', [
  key(0),
  key(0.18, COIL, pelvis(0, -0.012, -0.01), bend(4, 2, 4), tail(22), FOCUS),
  snap(0.32, { plantFeet: 0, plantFront: 0, root: { y: 0.34, pitch: -20 } }, AIRBORNE, bend(-6, -2, -4), finUp(8), tail(10), ANGRY),
  key(0.44, { advance: 0.04, plantFeet: 0, plantFront: 0, root: { y: 0.36, pitch: 40 } }, front([0, -0.2, 0.98], [0, -0.1, 0.99]), HIND_KICK, bend(4, 2, 8), tail(-6), SHUT),
  fall(0.6, { advance: 0.08, plantFeet: 0, plantFront: 0, root: { y: -0.4, pitch: 90 } }, front([0, -0.2, 0.98], [0, -0.1, 0.99]), HIND_KICK, bend(4, 2, 8), tail(-14), SHUT),
  key(0.8, UNDER, { root: { pitch: 60 } }, pelvis(0, -0.02), bend(4, 2, 6), FRONT_REACH, HIND_KICK, tail(-6), SHUT),
  key(1.0, UNDER, { root: { pitch: 10 } }, pelvis(0, -0.02), bend(6, 2, 8), FRONT_TUCK, HIND_TUCK, tail(6), ANGRY),
], [[0.5, 'dig']]);

/**
 * Dive, the strike: it swims over under the field and leaps out in front of
 * the foe in a dolphin's arc, nose first, breaching up into it (impact as it
 * clears the surface), and comes down on its paws with a splash; it shakes
 * the water off and hops home.
 */
export const dive = clip('dive', [
  key(0, UNDER, { root: { pitch: 10 } }, pelvis(0, -0.02), bend(6, 2, 8), FRONT_TUCK, HIND_TUCK, tail(6), ANGRY),
  key(0.18, { advance: 0.55, plantFeet: 0, plantFront: 0, root: { y: -1.3, pitch: -10 } }, pelvis(0, -0.02), bend(2, 1, 2), FRONT_REACH, HIND_KICK, tail(-4), ANGRY),
  key(0.34, { advance: 1, plantFeet: 0, plantFront: 0, root: { y: -1.2, z: 0.36, pitch: -40 } }, pelvis(0, -0.02), bend(0, 0, 0), FRONT_REACH, HIND_KICK, tail(-10), ANGRY),
  snap(0.46, { advance: 1, plantFeet: 0, plantFront: 0, root: { y: 0.4, z: 0.5, pitch: -30 } }, AIRBORNE, bend(-4, -1, -2), finUp(6), tail(-20), jaw(20), ANGRY),
  key(0.58, { advance: 0.99, plantFeet: 0, plantFront: 0, root: { y: 0.48, z: 0.36, pitch: 10 } }, AIRBORNE, bend(2, 1, 4), tail(-6), jaw(10), ANGRY),
  fall(0.72, { advance: 0.96, root: { z: 0.2 } }, LAND, pelvis(0, -0.024), tail(8), jaw(-2), ANGRY),
  key(0.84, { advance: 0.96, root: { z: 0.19, roll: 4 } }, LAND, pelvis(0, -0.012), bend(1, 0, 3, -12, 10), tail(4, 14), SHUT),
  key(0.94, { advance: 0.96, root: { z: 0.18, roll: -4 } }, LAND, pelvis(0, -0.01), bend(1, 0, 3, 12, -10), tail(4, -14), SHUT),
  ...hopHome(1.06, ANGRY),
  key(1.62, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.95, OPEN_EYES),
], [[0.5, 'impact']]);

export const BURROW_CLIPS = [digCharge, dig, diveCharge, dive];
