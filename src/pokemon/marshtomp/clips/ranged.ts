// Marshtomp's ranged moves: water and mud from its wide mouth (the head
// drives forward, the jaw drops wide, the body braces in a sumo crouch
// against the push), and what it heaves up with its arms (waves). Fired from
// home.

import {
  ANGRY, ARMS_DOWN_FRONT, ARMS_HEAVE_HIGH, ARMS_RISING, ARMS_ROAR, ARMS_SCOOP, BRACED, CROSSED_CHEST, CROSSED_GUARD,
  CURL, DROWSY, ELBOWS_BACK, ELBOWS_OUT, FISTS, GUARD_RISING, HAMMER_DOWN, LIMP_ARMS, MOUTH_SHUT, NARROW, OPEN_EYES, PUSH, PUSH_LOW, SHUT,
  SPIT_BRACE, SPLAY, SQUINT, arms, bend, body, clip, jaw, key, pelvis, sink, snap, stepL, stepR, twist,
} from './kit';

/** Water Gun: a gulp of air, then the head snaps forward and the huge mouth spits a jet. */
export const waterGun = clip('water_gun', [
  key(0),
  key(0.23, pelvis(0, 0.012), bend(-8, -6, -4, -16), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
  snap(0.32, pelvis(0, -0.02, 0.025), bend(12, 6, 0, 6), SPIT_BRACE, jaw(22), ANGRY),
  key(0.46, pelvis(0, -0.012, 0.012), bend(6, 3, 0, -4), SPIT_BRACE, jaw(10), ANGRY),
  key(0.65, pelvis(0, -0.004), bend(2, 1, 0, 0), jaw(2), ANGRY),
  key(1.1, OPEN_EYES),
], [[0.37, 'release']]);

/**
 * Hydro Pump: rears up and draws in the water, then drops into a wide sumo
 * brace and fires a massive, sustained jet from its jaws; the recoil pushes
 * it back further and further while it holds on.
 */
export const hydroPump = clip('hydro_pump', [
  key(0),
  key(0.16, sink(-0.02), bend(4, 0, 0, 6)),
  key(0.51, pelvis(0, 0.02), bend(-12, -8, -6, -18), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  key(0.65, pelvis(0, 0.024), bend(-13, -9, -6, -20, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  snap(0.76, sink(-0.055, 0.012), bend(14, 6, 0, 4), BRACED, jaw(24), ANGRY),
  key(0.93, sink(-0.051, 0.006), { root: { z: -0.015 } }, bend(12, 6, 0, 2, 4), BRACED, jaw(22), ANGRY),
  key(1.14, sink(-0.058, 0.004), { root: { z: -0.025 } }, bend(14, 6, 0, 3, -4, -2), BRACED, jaw(25), ANGRY),
  key(1.36, sink(-0.051, 0.003), { root: { z: -0.03 } }, bend(12, 6, 0, 2, 3, 2), BRACED, jaw(21), ANGRY),
  key(1.53, sink(-0.056, 0.002), { root: { z: -0.033 } }, bend(13, 6, 0, 3, -1), BRACED, jaw(23), ANGRY),
  key(1.71, sink(-0.03), { root: { z: -0.02 } }, bend(4, 2, 0, -4, 6), jaw(0), ANGRY),
  key(1.85, pelvis(0, -0.015), { root: { z: -0.01 } }, bend(2, 1, 0, -2, -5), ANGRY),
  key(2.2, OPEN_EYES),
], [[0.11, 'charge'], [0.82, 'release'], [1.58, 'releaseEnd']]);

/**
 * Muddy Water: scoops down low with both arms, heaves them up high in front
 * as it rears up (raising the wave), then drives them forward and down: the
 * wave rolls out from its feet. The heave goes up in front of the head fin,
 * not straight overhead: from our side the hands went under the foe's
 * healthbox.
 */
export const muddyWater = clip('muddy_water', [
  key(0),
  key(0.3, pelvis(0, -0.05), bend(20, 6, 2, 10), ARMS_SCOOP, MOUTH_SHUT, ANGRY),
  key(0.49, pelvis(0, -0.01), bend(4, 1, 0, -4), ARMS_RISING, jaw(8), ANGRY),
  key(0.63, pelvis(0, 0.02), bend(-12, -7, -4, -15), ARMS_HEAVE_HIGH, jaw(16), ANGRY),
  key(0.76, pelvis(0, 0.022), bend(-13, -7, -4, -16, 0, 2), ARMS_HEAVE_HIGH, jaw(18), ANGRY),
  snap(0.88, pelvis(0, -0.04, 0.03), bend(20, 6, 2, 4), PUSH, jaw(12), ANGRY),
  key(1.07, pelvis(0, -0.045, 0.034), bend(22, 7, 2, 6), PUSH_LOW, jaw(10), ANGRY),
  key(1.32, pelvis(0, -0.02), bend(6, 2, 0, 0), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.92, 'release']]);

/** Both hands dug into the mud beside the feet, a little behind them (scooping). */
const SCOOP_DOWN = arms([0.72, -0.68, 0.12], [0.35, -0.92, 0.15], [-0.2, -0.85, 0.48]);
/** Both arms swinging through low in front of the thighs, the hands together. */
const SWING_LOW = arms([0.3, -0.9, 0.3], [0.0, -0.95, 0.3], [-0.2, -0.9, 0.38]);
/** The heave: both arms swung forward and up at the foe, the hands together (an underhand hurl). */
const HEAVE_FWD = arms([0.3, 0.2, 0.93], [-0.05, 0.5, 0.86], [-0.15, 0.55, 0.82]);
/** The heave carries on up past the face. */
const HEAVE_UP = arms([0.35, 0.65, 0.67], [0.1, 0.85, 0.52], [0.0, 0.9, 0.44]);

/**
 * Mud-Slap: a big two-handed scoop. Drops into a sumo squat and digs both
 * hands into the mud beside its feet, draws the load back by its hips, then
 * heaves it underhand at the foe's face with both arms, rising out of the
 * squat (release from the hands: + their overlap), and the arms come back
 * down in front.
 */
export const mudSlap = clip('mud_slap', [
  key(0),
  key(0.09, sink(-0.015, -0.01), bend(6, 2, 0, 0), ELBOWS_OUT, CURL, MOUTH_SHUT, ANGRY),
  key(0.19, sink(-0.06, -0.025), bend(12, 4, 0, -2), SCOOP_DOWN, CURL, MOUTH_SHUT, ANGRY),
  key(0.37, sink(-0.08, -0.035), bend(12, 4, 0, -5), ARMS_SCOOP, FISTS, MOUTH_SHUT, ANGRY),
  key(0.42, sink(-0.06, -0.01), bend(6, 2, 0, -5), SWING_LOW, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.48, sink(-0.03, 0.02), bend(-4, -2, 0, -6), HEAVE_FWD, jaw(14), ANGRY),
  key(0.62, sink(-0.025, 0.015), bend(-8, -4, 0, -8), HEAVE_UP, jaw(16), ANGRY),
  key(0.77, sink(-0.035, 0.01), bend(4, 2, 0, -2), ARMS_DOWN_FRONT, jaw(8), ANGRY),
  key(0.92, sink(-0.022), bend(5, 2, 0, 0), jaw(4), ANGRY),
  key(1.23, OPEN_EYES),
], [[0.53, 'release']]);

/** Both hands cupped together in front of the chest, facing each other (gathering a ball of water). */
const CUP = arms([0.7, -0.35, 0.62], [-0.45, 0.1, 0.89], [-0.55, 0.3, 0.78]);
/** ... squeezed a little closer (the ball pulsing). */
const CUP_TIGHT = arms([0.62, -0.38, 0.69], [-0.58, 0.1, 0.81], [-0.66, 0.3, 0.69]);
/** Both hands thrust forward at the foe, palms out (flinging it). */
const THRUST = arms([0.3, -0.02, 0.95], [0.08, 0.05, 1.0], [0.0, 0.4, 0.92]);
/** Arms spread wide and low, palms up (gathering orbs about the body). */
const PALMS_UP_LOW = arms([0.88, -0.45, 0.16], [0.6, -0.25, 0.76], [0.3, 0.1, 0.95]);
/** Arms opened wide in front (throwing a guard open). */
const OPEN_WIDE = arms([0.62, 0.1, 0.78], [0.5, 0.3, 0.81], [0.4, 0.4, 0.82]);
/** Right arm swept low across in front, the hand at the ground by the left foot (tearing up the ground). */
const SWEEP_LOW_R = arms([0.8, -0.4, 0.45], [0.4, -0.6, 0.69], [0.2, -0.7, 0.68], [[0.2, -0.75, 0.63], [0.55, -0.8, 0.24], [0.6, -0.8, 0.0]]);
/** ... flung up and out to the right (hurling the rocks up and over). */
const FLING_UP_R = arms([0.8, -0.4, 0.45], [0.4, -0.6, 0.69], [0.2, -0.7, 0.68], [[-0.3, 0.7, 0.65], [-0.1, 0.9, 0.42], [-0.05, 0.95, 0.3]]);
/** Both hands low beside the feet, gripping (lifting a boulder). */
const LIFT_LOW = arms([0.66, -0.74, 0.12], [0.25, -0.95, 0.2], [0.0, -0.95, 0.3]);
/** ... heaved up to the chest. */
const LIFT_CHEST = arms([0.6, -0.1, 0.79], [-0.2, 0.55, 0.81], [-0.35, 0.6, 0.72]);
/** Arms spread up and forward riding the wave. */
const RIDE = arms([0.55, 0.55, 0.63], [0.32, 0.66, 0.68], [0.15, 0.55, 0.82]);
/** Stirring: the right arm forward and across, the left out to the side (a circle, one phase). */
const STIR_A = arms([0.85, -0.2, 0.49], [0.6, -0.25, 0.76], [0.35, -0.2, 0.91], [[-0.2, -0.2, 0.96], [0.45, -0.25, 0.86], [0.7, -0.2, 0.68]]);
/** ... the other phase. */
const STIR_B = arms([0.2, -0.2, 0.96], [-0.45, -0.25, 0.86], [-0.7, -0.2, 0.68], [[-0.68, -0.3, 0.67], [-0.42, -0.25, 0.87], [-0.2, -0.2, 0.96]]);
/** Hands cupped under the open jaw (breathing cold into them). */
const UNDER_JAW = arms([0.62, -0.3, 0.72], [-0.3, 0.65, 0.7], [-0.4, 0.75, 0.53]);

/**
 * Mud Shot: it dips its head to the ground and gulps up a mouthful of mud,
 * rears back swelling with it, then drives its head forward and down with the
 * whole body and spits a burst of mud, the jaw wide; it wipes its mouth with
 * a shake of the head.
 */
export const mudShot = clip('mud_shot', [
  key(0),
  key(0.14, sink(-0.04), bend(18, 6, 2, 14), ELBOWS_OUT, jaw(16), ANGRY),
  key(0.26, sink(-0.05), bend(20, 7, 2, 16), ELBOWS_OUT, jaw(20), ANGRY),
  key(0.44, pelvis(0, 0.014), bend(-8, -5, -3, -14), ELBOWS_BACK, MOUTH_SHUT, SQUINT),
  key(0.53, pelvis(0, 0.018), bend(-10, -6, -3, -16), ELBOWS_BACK, MOUTH_SHUT, SQUINT),
  snap(0.6, sink(-0.05, 0.03), bend(16, 8, 2, 8), SPIT_BRACE, jaw(26), ANGRY),
  key(0.74, sink(-0.045, 0.02), bend(12, 6, 0, 2), SPIT_BRACE, jaw(18), ANGRY),
  key(0.88, sink(-0.02), bend(4, 2, 0, -2, 10, 4), jaw(4), ANGRY),
  key(0.99, sink(-0.015), bend(3, 1, 0, -1, -8, -3), jaw(2), ANGRY),
  key(1.32, OPEN_EYES),
], [[0.65, 'release']]);

/**
 * Water Pulse: it gathers water between its cupped hands in front of its
 * chest into a pulsing ball (squeezing it tighter, twice), draws it back to
 * its belly, then thrusts both hands at the foe and flings it.
 */
export const waterPulse = clip('water_pulse', [
  key(0),
  key(0.18, sink(-0.03), bend(6, 2, 0, 6), CUP, MOUTH_SHUT, NARROW),
  key(0.32, sink(-0.035), bend(7, 2, 0, 7), CUP_TIGHT, MOUTH_SHUT, NARROW),
  key(0.44, sink(-0.03), bend(6, 2, 0, 6), CUP, MOUTH_SHUT, NARROW),
  key(0.56, sink(-0.035), bend(7, 2, 0, 7), CUP_TIGHT, MOUTH_SHUT, NARROW),
  key(0.69, sink(-0.05, -0.02), bend(-2, -1, 0, 0), twist(-6), CUP_TIGHT, MOUTH_SHUT, ANGRY),
  snap(0.77, sink(-0.035, 0.03), bend(14, 4, 0, 2), THRUST, SPLAY, jaw(12), ANGRY),
  key(0.92, sink(-0.035, 0.03), bend(15, 4, 0, 2), THRUST, SPLAY, jaw(8), ANGRY),
  key(1.09, sink(-0.02), bend(5, 2, 0, 0), ELBOWS_OUT, ANGRY),
  key(1.5, OPEN_EYES),
], [[0.84, 'release']]);

/**
 * Surf: it crouches, then rises tall as the wave rises behind it, arms
 * sweeping up in front and spreading as if riding the crest, and leans into
 * the ride, driving its arms forward and down as the wave crashes over the
 * foe; it holds the lean while the water rolls, then straightens.
 */
export const surf = clip('surf', [
  key(0),
  key(0.19, sink(-0.06), bend(12, 4, 0, 6), ARMS_SCOOP, MOUTH_SHUT, ANGRY),
  key(0.4, pelvis(0, 0.01), bend(-4, -2, 0, -6), ARMS_RISING, jaw(8), ANGRY),
  key(0.58, pelvis(0, 0.024), bend(-12, -6, -4, -14), RIDE, SPLAY, jaw(16), ANGRY),
  key(0.7, pelvis(0, 0.026), bend(-13, -6, -4, -15, 3, 2), RIDE, SPLAY, jaw(18), ANGRY),
  snap(0.83, pelvis(0, -0.03, 0.04), bend(22, 8, 2, 6), PUSH_LOW, SPLAY, jaw(14), ANGRY),
  key(1, pelvis(0, -0.035, 0.045), bend(24, 8, 2, 7, 4, 2), PUSH_LOW, SPLAY, jaw(12), ANGRY),
  key(1.18, pelvis(0, -0.035, 0.04), bend(23, 8, 2, 6, -4, -2), PUSH_LOW, SPLAY, jaw(10), ANGRY),
  key(1.37, pelvis(0, -0.02), bend(6, 2, 0, 0), ELBOWS_OUT, ANGRY),
  key(1.85, OPEN_EYES),
], [[0.86, 'release']]);

/**
 * Whirlpool: it stirs the water, both arms sweeping round in front of it in
 * wide circles, its body rolling with them as the power builds (charge), then
 * thrusts both hands at the foe and the whirlpool closes round it.
 */
export const whirlpool = clip('whirlpool', [
  key(0),
  key(0.16, sink(-0.04), bend(8, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.3, sink(-0.05), bend(10, 3, 0, 4), twist(12), body(0, 0, 0, 0, -3), STIR_A, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.46, sink(-0.05), bend(10, 3, 0, 4), twist(-8), body(0, 0, 0, 0, -2), STIR_B, SPLAY, MOUTH_SHUT, ANGRY),
  key(0.62, sink(-0.055), bend(11, 3, 0, 5), twist(14), body(0, 0, 0, 0, -4), STIR_A, SPLAY, jaw(6), ANGRY),
  key(0.77, sink(-0.055), bend(11, 3, 0, 5), twist(-9), body(0, 0, 0, 0, -3), STIR_B, SPLAY, jaw(6), ANGRY),
  key(0.9, sink(-0.06, -0.02), bend(4, 1, 0, 2), twist(0), CUP, SPLAY, MOUTH_SHUT, ANGRY),
  snap(0.99, sink(-0.04, 0.03), bend(14, 4, 0, 2), THRUST, SPLAY, jaw(14), ANGRY),
  key(1.14, sink(-0.04, 0.03), bend(15, 4, 0, 3, 3), THRUST, SPLAY, jaw(10), ANGRY),
  key(1.32, sink(-0.02), bend(5, 2, 0, 0), ELBOWS_OUT, ANGRY),
  key(1.72, OPEN_EYES),
], [[0.26, 'charge'], [1.04, 'release']]);

/**
 * Ice Beam: it breathes cold into its hands cupped under its open jaw, the
 * frost gathering (charge), then lowers its head at the foe, braced, and
 * fires a straight freezing beam from its mouth, holding rigid and steady
 * while it streams (a tremor, not a push); it shuts its mouth and shivers the
 * chill off.
 */
export const iceBeam = clip('ice_beam', [
  key(0),
  key(0.18, sink(-0.02), bend(-4, -2, -2, -10), UNDER_JAW, jaw(10), NARROW),
  key(0.39, pelvis(0, 0.012), bend(-8, -4, -3, -16), UNDER_JAW, jaw(16), NARROW),
  key(0.55, pelvis(0, 0.014), bend(-9, -4, -3, -17, 0, 2), UNDER_JAW, jaw(18), NARROW),
  snap(0.67, sink(-0.045, 0.012), bend(10, 4, 0, 4), BRACED, jaw(24), ANGRY),
  key(0.84, sink(-0.046, 0.012), bend(10.5, 4, 0, 4, 1.5, 1), BRACED, jaw(24), ANGRY),
  key(1.04, sink(-0.045, 0.012), bend(10, 4, 0, 4, -1.5, -1), BRACED, jaw(25), ANGRY),
  key(1.23, sink(-0.046, 0.012), bend(10.5, 4, 0, 4, 1, 1), BRACED, jaw(24), ANGRY),
  key(1.43, sink(-0.03), bend(4, 2, 0, 0), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(1.51, sink(-0.03), bend(4, 2, 0, 0, 0, 5), CROSSED_CHEST, MOUTH_SHUT, SQUINT),
  key(1.6, sink(-0.03), bend(4, 2, 0, 0, 0, -5), CROSSED_CHEST, MOUTH_SHUT, SQUINT),
  key(1.72, sink(-0.015), bend(2, 1, 0, 0), ELBOWS_OUT, ANGRY),
  key(2.02, OPEN_EYES),
], [[0.09, 'charge'], [0.72, 'release'], [1.39, 'releaseEnd']]);

/**
 * Blizzard: it rears up tall with its arms flung up and apart, calling the
 * storm, then throws its head forward and roars the blizzard out at the foe
 * with its arms swinging down after it, the head sweeping the howling snow
 * across it.
 */
export const blizzard = clip('blizzard', [
  key(0),
  key(0.19, sink(-0.04), bend(10, 3, 0, 8), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(0.4, pelvis(0, 0.022), bend(-12, -7, -5, -20), ARMS_ROAR, jaw(14), ANGRY),
  key(0.53, pelvis(0, 0.024), bend(-13, -7, -5, -21, 0, 2), ARMS_ROAR, jaw(16), ANGRY),
  snap(0.63, sink(-0.04, 0.03), bend(14, 6, 0, 2), BRACED, SPLAY, jaw(28), ANGRY),
  key(0.81, sink(-0.042, 0.03), bend(14, 6, 0, 2, 12, 3), BRACED, SPLAY, jaw(28), ANGRY),
  key(1, sink(-0.042, 0.03), bend(14, 6, 0, 2, -12, -3), BRACED, SPLAY, jaw(27), ANGRY),
  key(1.18, sink(-0.04, 0.025), bend(12, 5, 0, 1, 6, 2), SPIT_BRACE, SPLAY, jaw(22), ANGRY),
  key(1.37, sink(-0.02), bend(4, 2, 0, -2), ELBOWS_OUT, jaw(6), ANGRY),
  key(1.76, OPEN_EYES),
], [[0.69, 'release']]);

/**
 * Icy Wind: a long breath in, chest swelling and head back (charge), then it
 * breathes out a wide, cold wind, the open mouth sweeping slowly across the
 * foe from one side to the other and back; it closes its mouth with a shiver.
 */
export const icyWind = clip('icy_wind', [
  key(0),
  key(0.14, sink(-0.02), bend(4, 1, 0, 4), ELBOWS_OUT),
  key(0.44, pelvis(0, 0.018), bend(-10, -7, -5, -16), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  key(0.56, pelvis(0, 0.02), bend(-11, -7, -5, -17, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  snap(0.67, sink(-0.03, 0.015), bend(8, 4, 0, 2, 14), SPIT_BRACE, jaw(20), NARROW),
  key(0.88, sink(-0.03, 0.015), bend(8, 4, 0, 2, 0, 1), SPIT_BRACE, jaw(21), NARROW),
  key(1.09, sink(-0.03, 0.015), bend(8, 4, 0, 2, -14), SPIT_BRACE, jaw(20), NARROW),
  key(1.28, sink(-0.03, 0.015), bend(8, 4, 0, 2, -2, -1), SPIT_BRACE, jaw(19), NARROW),
  key(1.43, sink(-0.02), bend(4, 2, 0, 0, 0, 4), CROSSED_CHEST, MOUTH_SHUT, SQUINT),
  key(1.53, sink(-0.02), bend(4, 2, 0, 0, 0, -4), CROSSED_CHEST, MOUTH_SHUT, SQUINT),
  key(1.67, sink(-0.012), bend(2, 1, 0, 0), ELBOWS_OUT, ANGRY),
  key(2.02, OPEN_EYES),
], [[0.09, 'charge'], [0.72, 'release'], [1.32, 'releaseEnd']]);

/**
 * Hidden Power: it stands with its arms spread low and palms up while orbs
 * of light gather about its body (charge), rising slowly as they swell, then
 * sweeps both hands forward and sends them at the foe.
 */
export const hiddenPower = clip('hidden_power', [
  key(0),
  key(0.21, sink(-0.04), bend(6, 2, 0, 6), PALMS_UP_LOW, SPLAY, MOUTH_SHUT, SHUT),
  key(0.44, sink(-0.03), bend(4, 1, 0, 2, 0, 2), PALMS_UP_LOW, SPLAY, MOUTH_SHUT, SHUT),
  key(0.67, pelvis(0, 0.01), bend(-4, -2, 0, -4, 0, -2), CUP, SPLAY, jaw(6), NARROW),
  key(0.81, pelvis(0, 0.012), bend(-6, -3, 0, -6), CUP_TIGHT, SPLAY, jaw(8), NARROW),
  snap(0.92, sink(-0.03, 0.03), bend(14, 4, 0, 2), THRUST, SPLAY, jaw(14), ANGRY),
  key(1.06, sink(-0.03, 0.03), bend(15, 4, 0, 3), THRUST, SPLAY, jaw(10), ANGRY),
  key(1.25, sink(-0.015), bend(5, 2, 0, 0), ELBOWS_OUT, ANGRY),
  key(1.63, OPEN_EYES),
], [[0.18, 'charge'], [0.97, 'release']]);

/**
 * Mirror Coat: it braces behind its crossed forearms, taking the blow as
 * its body shines like a mirror (charge), trembling with the stored force,
 * then throws its arms open wide and turns it back on the foe.
 */
export const mirrorCoat = clip('mirror_coat', [
  key(0),
  key(0.14, sink(-0.03), bend(6, 2, 0, 4), GUARD_RISING, MOUTH_SHUT, NARROW),
  snap(0.26, sink(-0.06, -0.02), bend(10, 3, 1, 10), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.42, sink(-0.065, -0.025), bend(11, 3, 1, 11, 2, 2), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.58, sink(-0.068, -0.028), bend(11, 3, 1, 11, -2, -2), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.72, sink(-0.07, -0.03), bend(12, 3, 1, 12, 2, 2), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  snap(0.83, pelvis(0, 0.01, 0.02), bend(-10, -6, -3, -12), OPEN_WIDE, SPLAY, jaw(20), ANGRY),
  key(0.99, pelvis(0, 0.012, 0.02), bend(-11, -6, -3, -13), OPEN_WIDE, SPLAY, jaw(18), ANGRY),
  key(1.18, sink(-0.02), bend(4, 2, 0, 0), ELBOWS_OUT, jaw(6), ANGRY),
  key(1.58, OPEN_EYES),
], [[0.26, 'charge'], [0.88, 'release']]);

/**
 * Rock Tomb: it squats and grips the ground beside its feet, heaves a load of
 * earth and rock up to its chest, straining, rears up with it, then slams its
 * arms down in front, and the rocks come crashing down round the foe.
 */
export const rockTomb = clip('rock_tomb', [
  key(0),
  key(0.19, sink(-0.08), bend(18, 6, 2, 8), LIFT_LOW, FISTS, MOUTH_SHUT, ANGRY),
  key(0.35, sink(-0.085), bend(19, 6, 2, 9, 0, 2), LIFT_LOW, FISTS, MOUTH_SHUT, SQUINT),
  key(0.53, sink(-0.03), bend(2, 1, 0, -2), LIFT_CHEST, FISTS, jaw(8), SQUINT),
  key(0.69, pelvis(0, 0.02), bend(-10, -5, -3, -12), ARMS_HEAVE_HIGH, FISTS, jaw(14), ANGRY),
  key(0.79, pelvis(0, 0.022), bend(-11, -5, -3, -13), ARMS_HEAVE_HIGH, FISTS, jaw(16), ANGRY),
  snap(0.88, sink(-0.07, 0.02), bend(24, 8, 2, 6), HAMMER_DOWN, FISTS, jaw(20), ANGRY),
  key(1.02, sink(-0.08, 0.02), bend(26, 9, 2, 7), HAMMER_DOWN, FISTS, jaw(14), ANGRY),
  key(1.23, sink(-0.03), bend(8, 2, 0, 1), ELBOWS_OUT, ANGRY),
  key(1.67, OPEN_EYES),
], [[0.92, 'release']]);

/**
 * Rock Slide: it tears into the ground with a low sweep of its right arm
 * across in front of it, twisting right round into it, then unwinds and flings
 * the arm up and over, hurling a slide of rocks up to fall on the foe.
 */
export const rockSlide = clip('rock_slide', [
  key(0),
  key(0.18, sink(-0.05), bend(10, 3, 0, 4), twist(12), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(0.37, sink(-0.09), bend(24, 8, 2, 8), twist(34), SWEEP_LOW_R, FISTS, MOUTH_SHUT, ANGRY),
  key(0.49, sink(-0.092), bend(25, 8, 2, 9), twist(36), SWEEP_LOW_R, FISTS, MOUTH_SHUT, SQUINT),
  key(0.62, sink(-0.06), bend(10, 3, 0, 2), twist(10), SWEEP_LOW_R, FISTS, jaw(8), ANGRY),
  snap(0.7, pelvis(0, 0.01, 0.01), bend(-8, -4, -2, -12), twist(-16), FLING_UP_R, SPLAY, jaw(20), ANGRY),
  key(0.84, pelvis(0, 0.012, 0.01), bend(-9, -4, -2, -13), twist(-19), FLING_UP_R, SPLAY, jaw(16), ANGRY),
  key(1.04, sink(-0.02), bend(4, 2, 0, 0), twist(-6), ELBOWS_OUT, ANGRY),
  key(1.5, OPEN_EYES),
], [[0.76, 'release']]);

/**
 * Snore: asleep where it stands, eyes shut and head drooping, it draws a
 * huge breath (the chest heaving up, the head tipping back, the jaw falling
 * open) and lets out a snore that blasts at the foe, shuddering its whole
 * body, then slumps again.
 */
export const snore = clip('snore', [
  key(0),
  key(0.23, sink(-0.04), bend(12, 5, 2, 16), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(0.4, sink(-0.045), bend(13, 5, 2, 18, 0, 3), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(0.67, pelvis(0, 0.012), bend(-8, -6, -4, -14), LIMP_ARMS, jaw(14), SHUT),
  key(0.79, pelvis(0, 0.016), bend(-9, -6, -4, -16), LIMP_ARMS, jaw(18), SHUT),
  snap(0.88, sink(-0.03, 0.03), bend(12, 6, 2, 4), ELBOWS_OUT, jaw(30), SHUT),
  key(0.97, sink(-0.03, 0.03), bend(12, 6, 2, 4, 0, 4), ELBOWS_OUT, jaw(28), SHUT),
  key(1.06, sink(-0.03, 0.03), bend(12, 6, 2, 4, 0, -4), ELBOWS_OUT, jaw(26), SHUT),
  key(1.25, sink(-0.045), bend(13, 5, 2, 16), LIMP_ARMS, jaw(2), SHUT),
  key(1.5, sink(-0.03), bend(8, 3, 1, 8), LIMP_ARMS, MOUTH_SHUT, DROWSY),
  key(1.85, OPEN_EYES),
], [[0.92, 'release']]);

/**
 * Uproar: it rears up and roars at the foe, again and again, stamping its
 * feet between the roars: three bellows, each thrown harder, the arms flung
 * about with them.
 */
export const uproar = clip('uproar', [
  key(0),
  key(0.16, pelvis(0, 0.01), bend(-8, -5, -3, -12), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
  snap(0.25, sink(-0.02, 0.03), bend(8, 4, 0, -4), BRACED, FISTS, jaw(26), ANGRY),
  key(0.37, stepL(24), sink(-0.02, 0.02), bend(6, 3, 0, -4, 6), BRACED, FISTS, jaw(22), ANGRY),
  key(0.48, pelvis(0, 0.012), bend(-8, -5, -3, -12), ELBOWS_BACK, jaw(6), ANGRY),
  snap(0.56, sink(-0.025, 0.03), bend(9, 4, 0, -4, -6), ARMS_ROAR, jaw(28), ANGRY),
  key(0.69, stepR(24), sink(-0.02, 0.02), bend(7, 3, 0, -4, -8), ARMS_ROAR, jaw(24), ANGRY),
  key(0.79, pelvis(0, 0.014), bend(-9, -5, -3, -13), ELBOWS_BACK, jaw(8), ANGRY),
  snap(0.88, sink(-0.035, 0.035), bend(12, 5, 0, -2), SPIT_BRACE, SPLAY, jaw(30), ANGRY),
  key(1.06, sink(-0.035, 0.035), bend(12, 5, 0, -2, 8, 3), SPIT_BRACE, SPLAY, jaw(28), ANGRY),
  key(1.23, sink(-0.03, 0.03), bend(11, 5, 0, -2, -8, -3), SPIT_BRACE, SPLAY, jaw(24), ANGRY),
  key(1.41, sink(-0.015), bend(4, 2, 0, -1), jaw(4), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.28, 'release']]);

export const RANGED_CLIPS = [
  waterGun, mudShot, waterPulse, hydroPump, muddyWater, surf, whirlpool, iceBeam, blizzard, icyWind, hiddenPower, mirrorCoat,
  rockTomb, rockSlide, mudSlap, snore, uproar,
];
