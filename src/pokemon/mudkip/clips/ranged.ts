// Mudkip's ranged moves, fired from home: water, ice and cries from its wide
// mouth (the head drives forward, the jaw drops, all four feet brace against
// the push), mud scooped up with its chin, rocks and waves called up with a
// stamp of its front paws or a rear onto its haunches, and orbs and light
// gathered in stillness. The head (and the mouth on it) trails the body by
// 0.045 s, so a release sits ~0.04 s after its key.

import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, COIL, DROWSY, FOCUS, FRONT_DOWN, FRONT_STAMP, FRONT_UP, HAPPY, OPEN_EYES, SHUT, bend, clip, fall, fin, finUp, front, hips, jaw, key,
  pelvis, snap, tail, frontOne, pawBack, pawUp,
} from './kit';

/** Braced on all four feet against the push, the hips set and the tail fin down (firing; give the crouch with pelvis()). */
const BRACE: Pose = compose(hips(-2), tail(-8));
/** A shiver: the head and body quivering side to side (k: +1 / -1 the two sides). */
const shiver = (k: number): Pose => ({ ...bend(1, 0, 2, 0, 7 * k), root: { roll: 2 * k } });

/**
 * Water Gun: a dip, a quick gulp with the head pulled up and the mouth shut
 * tight, then the head snaps forward and down at the foe and the jaw drops
 * as the jet shoots out, braced on all four feet; the mouth stays open a
 * beat while the water flies, then shuts with a bob of the head.
 */
export const waterGun = clip('water_gun', [
  key(0),
  key(0.12, pelvis(0, -0.014, -0.004), bend(3, 1, 5), tail(4), FOCUS),
  key(0.26, pelvis(0, 0.004, -0.012), bend(-7, -3, -12), finUp(20), tail(10), jaw(-3), FOCUS),
  snap(0.34, pelvis(0, -0.02, 0.012), bend(11, 4, -2), tail(-8), jaw(38), ANGRY),
  key(0.46, pelvis(0, -0.019, 0.01), bend(10, 4, -3, 3), tail(-8, 4), jaw(36), ANGRY),
  key(0.58, pelvis(0, -0.016, 0.006), bend(8, 3, -2, -3), tail(-6, -4), jaw(30), ANGRY),
  key(0.72, pelvis(0, -0.01), bend(2, 0, 3), tail(-2), jaw(2), ANGRY),
  key(0.84, pelvis(0, -0.008), bend(1, 0, 1, 0, 3), ANGRY),
  key(1.15, OPEN_EYES),
], [[0.38, 'release']]);

/**
 * Hydro Pump: it plants all four feet wide and low and draws a deep breath
 * with its head thrown up (charge), then fires from its wide jaws; the jet
 * pushes it back onto its haunches a little further with every beat while
 * its head sweeps the stream across the foe. The mouth shuts and it shakes
 * the water off its face.
 */
export const hydroPump = clip('hydro_pump', [
  key(0),
  key(0.16, pelvis(0, -0.03), hips(-3), bend(2, 1, 4), tail(8), FOCUS),
  key(0.4, pelvis(0, -0.02, -0.014), hips(-4), bend(-8, -4, -12), finUp(22), tail(16), jaw(-2), SHUT),
  key(0.54, pelvis(0, -0.021, -0.015), hips(-4), bend(-9, -4, -13, 0, 2), finUp(23), tail(17), jaw(-2), SHUT),
  snap(0.64, BRACE, pelvis(0, -0.045, -0.012), bend(6, 2, 6), jaw(38), ANGRY),
  key(0.82, BRACE, pelvis(0, -0.044, -0.022), { root: { z: -0.02 } }, bend(5, 2, 5, 6, 2), tail(-11, 6), jaw(40), ANGRY),
  key(1.0, BRACE, pelvis(0, -0.048, -0.028), { root: { z: -0.035 } }, bend(6.5, 2, 6.5, -6, -2), tail(-9, -6), jaw(36), ANGRY),
  key(1.18, BRACE, pelvis(0, -0.044, -0.034), { root: { z: -0.05 } }, bend(5, 2, 5, 6, 3), tail(-12, 7), jaw(40), ANGRY),
  key(1.36, BRACE, pelvis(0, -0.048, -0.04), { root: { z: -0.06 } }, bend(7, 2, 7, -5, -3), tail(-9, -7), jaw(36), ANGRY),
  key(1.54, BRACE, pelvis(0, -0.044, -0.042), { root: { z: -0.066 } }, bend(5, 2, 5, 3, 1), tail(-12, 4), jaw(38), ANGRY),
  key(1.72, pelvis(0, -0.02, -0.01), { root: { z: -0.04 } }, bend(-4, -2, -8), finUp(13), tail(4), jaw(4), ANGRY),
  key(1.84, pelvis(0, -0.012, -0.004), { root: { z: -0.02 } }, shiver(1), tail(2, 8), SHUT),
  key(1.94, pelvis(0, -0.01, -0.002), { root: { z: -0.01 } }, shiver(-1), tail(2, -8), SHUT),
  key(2.06, pelvis(0, -0.008), bend(0.5, 0, 1, 0, 3), ANGRY),
  key(2.4, OPEN_EYES),
], [[0.2, 'charge'], [0.68, 'release'], [1.6, 'releaseEnd']]);

/**
 * Water Pulse: it blows a ball of water at its open mouth, bobbing its head
 * as the ball swells and pulses (twice), draws its head back, then flings
 * the ball at the foe with a toss of its head, the whole front of its body
 * following the throw.
 */
export const waterPulse = clip('water_pulse', [
  key(0),
  key(0.14, pelvis(0, -0.016), bend(3, 1, 4), jaw(12), FOCUS),
  key(0.28, pelvis(0, -0.02, 0.004), bend(5, 2, 6), jaw(20), FOCUS),
  key(0.42, pelvis(0, -0.014, -0.002), bend(2, 1, 2), jaw(16), FOCUS),
  key(0.56, pelvis(0, -0.022, 0.006), bend(6, 2, 7), jaw(22), FOCUS),
  key(0.72, pelvis(0, -0.004, -0.02), hips(-4), bend(-8, -3, -12), finUp(20), tail(14), jaw(20), ANGRY),
  snap(0.8, pelvis(0, -0.02, 0.018), hips(4), bend(12, 5, 6), tail(-10), jaw(30), ANGRY),
  key(0.94, pelvis(0, -0.022, 0.02), hips(4), bend(13, 5, 8), tail(-12), jaw(22), ANGRY),
  key(1.1, pelvis(0, -0.012, 0.006), bend(4, 1, 3), tail(-4), jaw(4), ANGRY),
  key(1.24, pelvis(0, -0.008), bend(1, 0, 1, 0, -3), ANGRY),
  key(1.6, OPEN_EYES),
], [[0.16, 'charge'], [0.84, 'release']]);

/**
 * Whirlpool: it spins round on the spot in two quick hops, its tail fin
 * sweeping the water round with it (charge), lands facing the foe and
 * thrusts its head at it: the whirlpool closes round the foe.
 */
export const whirlpool = clip('whirlpool', [
  key(0),
  key(0.14, pelvis(0, -0.03), hips(-4), bend(4, 2, 6), tail(20, 30), ANGRY),
  key(0.3, { root: { y: 0.1, yaw: 120 } }, { plantFeet: 0, plantFront: 0 }, pelvis(0, -0.01), bend(2, 1, 4), tail(26, 50), ANGRY),
  key(0.42, { root: { yaw: 190 } }, pelvis(0, -0.03), bend(4, 2, 6), tail(20, 50), ANGRY),
  key(0.56, { root: { y: 0.1, yaw: 300 } }, { plantFeet: 0, plantFront: 0 }, pelvis(0, -0.01), bend(2, 1, 4), tail(26, 50), ANGRY),
  key(0.7, { root: { yaw: 360 } }, pelvis(0, -0.035, -0.006), bend(5, 2, 7), tail(18, 30), ANGRY),
  snap(0.8, { root: { yaw: 360 } }, pelvis(0, -0.02, 0.016), hips(4), bend(12, 5, 4), tail(-10), jaw(30), ANGRY),
  key(0.96, { root: { yaw: 360 } }, pelvis(0, -0.022, 0.018), hips(4), bend(12, 5, 5, 4, 2), tail(-12, 6), jaw(26), ANGRY),
  key(1.14, { root: { yaw: 360 } }, pelvis(0, -0.01, 0.004), bend(3, 1, 3), tail(-3), jaw(4), ANGRY),
  key(1.3, { root: { yaw: 360 } }, pelvis(0, -0.008), bend(1, 0, 1, 0, 3), ANGRY),
  key(1.7, { root: { yaw: 360 } }, OPEN_EYES),
], [[0.16, 'charge'], [0.84, 'release']]);

/**
 * Hidden Power: it settles back on its haunches, eyes shut, perfectly still
 * but for its head fin quivering as the orbs gather about it (charge), then
 * snaps its eyes open and its head forward and sends them at the foe.
 */
export const hiddenPower = clip('hidden_power', [
  key(0),
  key(0.2, COIL, pelvis(0, -0.006, 0.006), bend(-2, -1, 0), SHUT),
  key(0.42, COIL, pelvis(0, -0.008, 0.006), bend(-2, -1, 0), fin(10, 6), SHUT),
  key(0.6, COIL, pelvis(0, -0.009, 0.006), bend(-2.5, -1, 0.5), fin(-6, -4), SHUT),
  key(0.78, COIL, pelvis(0, -0.01, 0.006), bend(-3, -1, 1), fin(12, 8), SHUT),
  key(0.9, COIL, pelvis(0, -0.004, 0.0), bend(-6, -2, -6), finUp(8), fin(4), jaw(6), FOCUS),
  snap(0.98, pelvis(0, -0.02, 0.016), hips(4), bend(10, 4, 6), fin(16), tail(-8), jaw(20), ANGRY),
  key(1.12, pelvis(0, -0.02, 0.018), hips(4), bend(11, 4, 7), fin(14), tail(-10), jaw(14), ANGRY),
  key(1.3, pelvis(0, -0.01, 0.004), bend(3, 1, 3), tail(-3), jaw(2), ANGRY),
  key(1.7, OPEN_EYES),
], [[0.22, 'charge'], [1.02, 'release']]);

/**
 * Ice Beam: it draws in a cold breath, head raised and jaw half open, frost
 * gathering at the mouth (charge), then lowers its head at the foe, braced,
 * and fires a straight freezing beam, holding rigid while it streams (a
 * tremor, not a push); it shuts its mouth and shivers the chill off.
 */
export const iceBeam = clip('ice_beam', [
  key(0),
  key(0.16, pelvis(0, -0.012), bend(2, 1, 3), jaw(4), FOCUS),
  key(0.4, pelvis(0, 0.002, -0.01), bend(-6, -3, -10), finUp(16), tail(8), jaw(14), FOCUS),
  key(0.56, pelvis(0, 0.003, -0.011), bend(-7, -3, -11, 0, 2), finUp(17), tail(9), jaw(16), FOCUS),
  snap(0.66, BRACE, pelvis(0, -0.035, 0.004), bend(8, 3, 2), jaw(34), ANGRY),
  key(0.86, BRACE, pelvis(0, -0.036, 0.004), bend(8.5, 3, 2.5, 1.5, 1), jaw(34), ANGRY),
  key(1.08, BRACE, pelvis(0, -0.035, 0.004), bend(8, 3, 2, -1.5, -1), jaw(35), ANGRY),
  key(1.3, BRACE, pelvis(0, -0.036, 0.004), bend(8.5, 3, 2.5, 1, 1), jaw(34), ANGRY),
  key(1.5, pelvis(0, -0.016), bend(2, 1, 2), jaw(2), ANGRY),
  key(1.6, pelvis(0, -0.014), shiver(1), tail(2, 10), SHUT),
  key(1.7, pelvis(0, -0.012), shiver(-1), tail(2, -10), SHUT),
  key(1.84, pelvis(0, -0.008), bend(0.5, 0, 1), ANGRY),
  key(2.2, OPEN_EYES),
], [[0.14, 'charge'], [0.7, 'release'], [1.44, 'releaseEnd']]);

/**
 * Blizzard: it rears up onto its haunches with its face to the sky and cries
 * the storm up, front paws raised, then drops back down onto its front paws
 * and roars the blizzard out at the foe, the head sweeping the howling snow
 * across it.
 */
export const blizzard = clip('blizzard', [
  key(0),
  key(0.16, COIL, bend(10, 5, 12), SHUT),
  key(0.42, { plantFront: 0 }, pelvis(0, 0.014, -0.02), hips(-8), bend(-26, -4, -10), finUp(34), FRONT_UP, tail(22), jaw(26), ANGRY),
  key(0.56, { plantFront: 0 }, pelvis(0, 0.016, -0.021), hips(-8), bend(-27, -4, -11, 0, 3), finUp(35), FRONT_UP, tail(23, 6), jaw(28), ANGRY),
  snap(0.68, { plantFront: 1 }, BRACE, pelvis(0, -0.04, 0.01), bend(10, 4, 0), FRONT_DOWN, jaw(40), ANGRY),
  key(0.88, BRACE, pelvis(0, -0.04, 0.01), bend(10, 4, 0, 14, 4), tail(-10, 10), jaw(40), ANGRY),
  key(1.1, BRACE, pelvis(0, -0.04, 0.01), bend(10, 4, 0, -14, -4), tail(-10, -10), jaw(38), ANGRY),
  key(1.3, BRACE, pelvis(0, -0.036, 0.008), bend(9, 4, 0, 6, 2), tail(-8, 4), jaw(32), ANGRY),
  key(1.5, pelvis(0, -0.014), bend(2, 1, 2), jaw(4), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.74, 'release']]);

/**
 * Icy Wind: a long breath in, the chest swelling and the head drawn back
 * (charge), then it blows a wide, cold wind, the open mouth sweeping slowly
 * across the foe from one side to the other and back; it shuts its mouth
 * with a shiver.
 */
export const icyWind = clip('icy_wind', [
  key(0),
  key(0.14, pelvis(0, -0.01), bend(2, 1, 2), FOCUS),
  key(0.44, pelvis(0, 0.006, -0.016), hips(-3), bend(-8, -4, -12), finUp(20), tail(12), jaw(-2), SHUT),
  key(0.58, pelvis(0, 0.007, -0.017), hips(-3), bend(-9, -4, -13, 0, 2), finUp(21), tail(13), jaw(-2), SHUT),
  snap(0.7, pelvis(0, -0.022, 0.01), bend(8, 3, -2, 18, 4), tail(-6, -12), jaw(26), FOCUS),
  key(0.94, pelvis(0, -0.022, 0.01), bend(8, 3, -2, 0, 1), tail(-6), jaw(27), FOCUS),
  key(1.18, pelvis(0, -0.022, 0.01), bend(8, 3, -2, -18, -4), tail(-6, 12), jaw(26), FOCUS),
  key(1.4, pelvis(0, -0.022, 0.01), bend(8, 3, -2, -2, -1), tail(-6, 2), jaw(25), FOCUS),
  key(1.54, pelvis(0, -0.014), shiver(1), tail(2, 10), jaw(2), SHUT),
  key(1.66, pelvis(0, -0.012), shiver(-1), tail(2, -10), SHUT),
  key(1.8, pelvis(0, -0.008), bend(0.5, 0, 1), ANGRY),
  key(2.2, OPEN_EYES),
], [[0.12, 'charge'], [0.74, 'release'], [1.44, 'releaseEnd']]);

/**
 * Mirror Coat: it braces low with its head tucked and its eyes shut, its
 * body shining like a mirror as it takes the blow (charge), trembling with
 * the stored force, then throws its head up and forward with a cry and turns
 * it back on the foe.
 */
export const mirrorCoat = clip('mirror_coat', [
  key(0),
  key(0.14, pelvis(0, -0.03), bend(4, 3, 8), tail(-10), FOCUS),
  snap(0.28, pelvis(0, -0.06, -0.01), bend(8, 6, 14), tail(-26), SHUT),
  key(0.44, pelvis(0.004, -0.062, -0.011), bend(8.5, 6, 14.5, 2, 3), tail(-27, 6), SHUT),
  key(0.6, pelvis(-0.004, -0.064, -0.012), bend(8.5, 6, 15, -2, -3), tail(-28, -6), SHUT),
  key(0.76, pelvis(0.004, -0.066, -0.012), bend(9, 6, 15.5, 2, 3), tail(-28, 6), SHUT),
  snap(0.88, pelvis(0, 0.004, 0.01), hips(-4), bend(-10, -4, -14), finUp(24), tail(18), jaw(30), ANGRY),
  key(1.04, pelvis(0, 0.005, 0.01), hips(-4), bend(-11, -4, -15, 3, 3), finUp(25), tail(20, 8), jaw(26), ANGRY),
  key(1.22, pelvis(0, -0.012), bend(2, 1, 2), tail(4), jaw(4), ANGRY),
  key(1.6, OPEN_EYES),
], [[0.3, 'charge'], [0.94, 'release']]);

/**
 * Rock Tomb: it rears up on its hind legs with its front paws raised high,
 * holds a beat, then stamps them down with all its weight: the rocks come
 * crashing down round the foe. A squash on the stamp, and it watches.
 */
export const rockTomb = clip('rock_tomb', [
  key(0),
  key(0.16, COIL, bend(8, 4, 10), ANGRY),
  key(0.4, { plantFront: 0 }, pelvis(0, 0.03, -0.02), hips(-10), bend(-30, -4, 4), finUp(26), FRONT_UP, tail(24), jaw(10), ANGRY),
  key(0.54, { plantFront: 0 }, pelvis(0, 0.034, -0.022), hips(-11), bend(-32, -4, 5), finUp(28), front([0, 0.3, 0.95], [0, -0.1, 0.99]), tail(26), jaw(12), ANGRY),
  fall(0.66, { plantFront: 1 }, pelvis(0, -0.03, 0.02), hips(6), bend(10, 4, 10), FRONT_STAMP, tail(-12), jaw(-2), ANGRY),
  key(0.78, { plantFront: 1 }, pelvis(0, -0.05, 0.024), hips(6), bend(12, 5, 12), FRONT_STAMP, tail(-14), jaw(-2), SHUT),
  key(0.96, pelvis(0, -0.03, 0.01), bend(5, 2, 2), tail(-6), ANGRY),
  key(1.14, pelvis(0, -0.014), bend(1, 0, -2, 0, 4), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.68, 'release']]);

/**
 * Surf: it crouches low, then rears up tall as the wave rises behind it,
 * front paws raised as if riding the crest, and dives forward into the ride,
 * the whole body driving down and forward as the wave crashes over the foe;
 * it holds the lean while the water rolls, then straightens with a shake.
 */
export const surf = clip('surf', [
  key(0),
  key(0.18, COIL, pelvis(0, -0.012, -0.008), bend(8, 4, 10), tail(20), ANGRY),
  key(0.44, { plantFront: 0 }, pelvis(0, 0.024, -0.016), hips(-8), bend(-24, -4, -8), finUp(28), FRONT_UP, tail(26, 10), jaw(18), HAPPY),
  key(0.6, { plantFront: 0 }, pelvis(0, 0.026, -0.017), hips(-8), bend(-25, -4, -9, 3, 3), finUp(29), FRONT_UP, tail(27, -10), jaw(20), HAPPY),
  snap(0.72, { plantFront: 1 }, pelvis(0, -0.035, 0.03), hips(8), bend(14, 6, 6), FRONT_STAMP, tail(-14), jaw(24), ANGRY),
  key(0.92, { plantFront: 1 }, pelvis(0, -0.038, 0.032), hips(8), bend(15, 6, 7, 4, 3), FRONT_STAMP, tail(-15, 8), jaw(20), ANGRY),
  key(1.12, { plantFront: 1 }, pelvis(0, -0.036, 0.03), hips(8), bend(14, 6, 6, -4, -3), FRONT_STAMP, tail(-14, -8), jaw(16), ANGRY),
  key(1.32, pelvis(0, -0.014), bend(3, 1, 3), tail(2, 10), jaw(4), ANGRY),
  key(1.46, pelvis(0, -0.01), bend(1, 0, 2, 0, -6), tail(2, -8), SHUT),
  key(1.9, OPEN_EYES),
], [[0.76, 'release']]);

/**
 * Mud-Slap: it rakes up a pawful of mud with its right front paw, rocks
 * back onto its haunches and flicks it up into the foe's face with a swipe
 * of the paw (release from the paws), plants the paw and shakes its head.
 */
export const mudSlap = clip('mud_slap', [
  key(0),
  key(0.12, { plantFront: 0 }, pelvis(0, -0.02, 0.006), bend(6, 3, 10), FRONT_DOWN, pawUp('R'), tail(8), ANGRY),
  key(0.26, { plantFront: 0 }, pelvis(0, -0.028, 0.012), bend(10, 4, 14, -6), FRONT_DOWN, pawBack('R'), tail(12), ANGRY),
  key(0.36, { plantFront: 0 }, pelvis(0, -0.03, 0.012), bend(10.5, 4, 14.5, -6), FRONT_DOWN, frontOne('R', [0, -0.95, -0.3], [0, -0.7, -0.71]), tail(12), ANGRY),
  snap(0.46, { plantFront: 0 }, pelvis(0, 0.004, -0.016), hips(-4), bend(-12, -3, -8, 6), finUp(18), FRONT_DOWN, frontOne('R', [0, 0.25, 0.97], [0, 0.55, 0.83]), tail(18), jaw(14), ANGRY),
  key(0.58, { plantFront: 0 }, pelvis(0, 0.004, -0.017), hips(-4), bend(-13, -3, -9, 6), finUp(19), FRONT_DOWN, frontOne('R', [0, 0.35, 0.94], [0, 0.65, 0.76]), tail(19), jaw(10), ANGRY),
  key(0.72, { plantFront: 1 }, pelvis(0, -0.016, 0.004), bend(3, 1, 4), FRONT_DOWN, tail(4), jaw(2), ANGRY),
  key(0.84, { plantFront: 1 }, pelvis(0, -0.01), bend(1, 0, 2, 0, 8), FRONT_DOWN, SHUT),
  key(0.94, { plantFront: 1 }, pelvis(0, -0.009), bend(1, 0, 2, 0, -8), FRONT_DOWN, SHUT),
  key(1.3, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
], [[0.5, 'release']]);

/**
 * Snore: asleep where it stands, eyes shut and its head drooping to the
 * ground, it draws a huge breath (the chest heaving up, the head lifting,
 * the jaw falling open) and lets out a snore that blasts at the foe, its
 * whole body shuddering, then slumps again, still asleep.
 */
export const snore = clip('snore', [
  key(0),
  key(0.24, pelvis(0, -0.04), bend(8, 4, 14, 0, 6), tail(-12, 8), jaw(-2), SHUT),
  key(0.44, pelvis(0, -0.044), bend(9, 4, 15, 0, 8), tail(-13, 8), jaw(-2), SHUT),
  key(0.74, pelvis(0, -0.01, -0.012), hips(-3), bend(-6, -3, -8), finUp(14), tail(4), jaw(16), SHUT),
  key(0.88, pelvis(0, -0.008, -0.013), hips(-3), bend(-7, -3, -9), finUp(15), tail(5), jaw(20), SHUT),
  snap(0.96, pelvis(0, -0.03, 0.014), bend(8, 3, 2), tail(-8), jaw(40), SHUT),
  key(1.06, pelvis(0, -0.03, 0.014), { root: { roll: 3 } }, bend(8, 3, 2, 0, 5), tail(-8, 6), jaw(38), SHUT),
  key(1.16, pelvis(0, -0.03, 0.014), { root: { roll: -3 } }, bend(8, 3, 2, 0, -5), tail(-8, -6), jaw(36), SHUT),
  key(1.36, pelvis(0, -0.042), bend(8, 4, 14, 0, 6), tail(-12, 8), jaw(2), SHUT),
  key(1.62, pelvis(0, -0.03), bend(5, 2, 8, 0, 4), tail(-6, 4), jaw(-2), DROWSY),
  key(2.0, OPEN_EYES),
], [[1.0, 'release']]);

/**
 * Uproar: it yaps at the foe again and again, three sharp cries, bouncing
 * on its front paws between them, each cry thrown harder with the head.
 */
export const uproar = clip('uproar', [
  key(0),
  key(0.14, pelvis(0, 0.002, -0.012), bend(-6, -2, -8), finUp(12), tail(10), jaw(-2), ANGRY),
  snap(0.22, pelvis(0, -0.02, 0.012), bend(8, 3, -4), tail(-8), jaw(34), ANGRY),
  key(0.34, { plantFront: 0 }, pelvis(0, 0.01, -0.01), bend(-10, -2, -6), finUp(14), FRONT_UP, tail(14, 12), jaw(12), ANGRY),
  snap(0.44, { plantFront: 1 }, pelvis(0, -0.024, 0.014), bend(9, 3, -4, 6), FRONT_DOWN, tail(-9, -8), jaw(36), ANGRY),
  key(0.56, { plantFront: 0 }, pelvis(0, 0.012, -0.012), bend(-11, -2, -6), finUp(15), FRONT_UP, tail(15, -12), jaw(12), ANGRY),
  snap(0.66, { plantFront: 1 }, pelvis(0, -0.028, 0.016), bend(10, 3, -4, -6), FRONT_DOWN, tail(-10, 8), jaw(40), ANGRY),
  key(0.86, pelvis(0, -0.028, 0.016), bend(10, 3, -4, 6, 4), tail(-10, -6), jaw(38), ANGRY),
  key(1.04, pelvis(0, -0.014, 0.004), bend(3, 1, 1), tail(-3), jaw(4), ANGRY),
  key(1.4, OPEN_EYES),
], [[0.26, 'release']]);

export const RANGED_CLIPS = [
  waterGun, hydroPump, waterPulse, whirlpool, hiddenPower, iceBeam, blizzard, icyWind, mirrorCoat, rockTomb, surf, mudSlap, snore, uproar,
];
