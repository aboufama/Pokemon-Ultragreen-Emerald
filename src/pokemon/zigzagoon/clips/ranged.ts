// Zigzagoon's ranged moves: fired from home. What it fires leaves its small
// mouth (spits, beams, breaths), its bristling fur (Pin Missile, the
// electric moves), its tail (Swift) or its forepaw (Mud-Slap); the body
// braces, gathers and recoils around it.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ASLEEP, DROWSY, FIERCE, FRONT_DOWN, HAPPY, HURT, OPEN_EYES, PAWS_FORWARD, PAWS_UP, PAWS_WIDE, SHUT,
  bend, ears, frontLegs, jaw, key, pelvis, rump, scale, snap, tail, turn,
} from './kit';

// Pin Missile --------------------------------------------------------------------------

/** Bristling, ready to fire: hunched, rump and tail up, fur puffed out. */
const READY: Pose[] = [pelvis(-0.03, -0.02), bend(4, 4, 8), rump(8), tail(18, 0, 8), ears(-26), FIERCE, scale(1.03)];
/** A volley: the whole body jolts forward and up as the pins fly off its back. */
const volley = (side = 0, big = 1): Pose[] => [
  pelvis(-0.016, 0.035 * big), bend(0, 5, 2, 5 * side), turn(-5 * side), rump(10, 6 * side), tail(22, 6 * side, 10, 3 * side), ears(-30), jaw(16), FIERCE, scale(1 + 0.05 * big),
];

/** Pin Missile, a lone volley: it bristles up, fires with a jolt of its whole body, and settles. */
const pinMissile: Clip = {
  name: 'pin_missile',
  duration: 1.1,
  keys: [
    key(0),
    key(0.17, ...READY),
    snap(0.26, ...volley(0, 1.2)),
    key(0.4, ...READY, pelvis(0.004, -0.01)),
    key(0.62, pelvis(-0.01), bend(1, 1, 2), rump(2), tail(6, 0, 2), ears(-8), ANGRY, scale(1.01)),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.28, name: 'release' }],
};

/** The first of a run of volleys: bristles, fires, stays bristling for the next. */
const pinMissileFirst: Clip = {
  name: 'pin_missile_first',
  duration: 0.5,
  keys: [
    key(0),
    key(0.17, ...READY),
    snap(0.26, ...volley()),
    key(0.38, ...READY, pelvis(0.003, -0.008), tail(1)),
    key(0.5, ...READY),
  ],
  events: [{ t: 0.28, name: 'release' }],
};

/** A volley between: a quick re-cock and another jolt, the body angled a little aside, still bristling. */
const pinMissileNext: Clip = {
  name: 'pin_missile_next',
  duration: 0.42,
  keys: [
    key(0, ...READY),
    key(0.1, ...READY, pelvis(-0.012, -0.012), bend(2, 2, 3, -4), turn(4)),
    snap(0.18, ...volley(1)),
    key(0.3, ...READY, pelvis(0.002, -0.006), bend(0, 0, 0, 2)),
    key(0.42, ...READY),
  ],
  events: [{ t: 0.2, name: 'release' }],
};

/** The last volley, the biggest: then the fur settles and it relaxes. */
const pinMissileLast: Clip = {
  name: 'pin_missile_last',
  duration: 0.95,
  keys: [
    key(0, ...READY),
    key(0.1, ...READY, pelvis(-0.015, -0.015), bend(3, 3, 4, 4), turn(-4)),
    snap(0.18, ...volley(-1, 1.3)),
    key(0.34, ...READY, pelvis(0.006, -0.01)),
    key(0.58, pelvis(-0.008), bend(1, 1, 2), rump(2), tail(6, 0, 2), ears(-8), ANGRY, scale(1.01)),
    key(0.95, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'release' }],
};

// From the mouth -----------------------------------------------------------------------

/** Water Pulse: chin up, it gathers a pulsing ball of water at its mouth, then whips its head down and flings it. */
const waterPulse: Clip = {
  name: 'water_pulse',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0.005, -0.03), bend(-6, -8, -14), rump(-2), tail(10, 0, 4), ears(8), jaw(6), ANGRY),
    key(0.3, pelvis(0.006, -0.035), bend(-5, -7, -12, 0, 3), rump(-2), tail(12, 0, 4), ears(8), jaw(18), FIERCE, scale(1.01)),
    key(0.45, pelvis(0.007, -0.038), bend(-7, -9, -15, 0, -3), rump(-3), tail(13, 0, 5), ears(9), jaw(20), FIERCE, scale(1.015)),
    snap(0.55, pelvis(-0.02, 0.03), bend(4, 10, 8), rump(4), tail(-6), ears(-18), jaw(26), FIERCE, scale(1)),
    key(0.72, pelvis(-0.016, 0.022), bend(3, 7, 5, -4), rump(3), tail(-2), ears(-14), jaw(10), FIERCE),
    key(0.95, pelvis(-0.005), bend(1, 1, 1), jaw(2), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.6, name: 'release' }],
};

/** Shadow Ball: jaws open, it swells a dark ball at its mouth, draws its head back and hurls it with a whip of its neck. */
const shadowBall: Clip = {
  name: 'shadow_ball',
  duration: 1.7,
  keys: [
    key(0),
    key(0.16, pelvis(-0.02), bend(3, 2, 5), ears(-10), ANGRY),
    key(0.46, pelvis(-0.03, -0.02), bend(4, 6, 4), rump(4), tail(10, 0, 4), jaw(24), ears(-24), FIERCE, scale(1.02)),
    key(0.68, pelvis(-0.02, -0.05), bend(-8, -8, -12), rump(-4), tail(14, 0, 6), jaw(26), ears(-20), FIERCE, scale(1.03)),
    snap(0.8, pelvis(-0.03, 0.04), bend(6, 12, 10), rump(4), tail(-6), jaw(30), ears(-30), FIERCE, scale(1)),
    key(1.0, pelvis(-0.025, 0.03), bend(4, 8, 6, -4), rump(3), tail(-2), jaw(12), ears(-22), FIERCE),
    key(1.26, pelvis(-0.008), bend(1, 1, 2), jaw(2), ears(-8), ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.86, name: 'release' }],
};

/**
 * Ice Beam: it draws the cold in with its chest up and its eyes shut, then
 * braces low and fires a straight beam from its open mouth, the head held
 * rigid (only a tremor), and afterwards shivers.
 */
const iceBeam: Clip = {
  name: 'ice_beam',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(-0.02), bend(3, 2, 6), tail(4), ears(-6)),
    key(0.5, pelvis(0.008, -0.035), bend(-8, -10, -16), rump(4), tail(16, 0, 6), ears(10), SHUT, scale(1.02)),
    key(0.66, pelvis(0.01, -0.04), bend(-9, -11, -17, 0, 2), rump(4), tail(18, 0, 7), ears(12), SHUT, scale(1.03)),
    snap(0.78, pelvis(-0.05, 0.035), bend(3, 8, -6), rump(-2), tail(-4), ears(-24), jaw(30), FIERCE, scale(1)),
    key(0.98, pelvis(-0.049, 0.034), bend(3, 8, -6, 1), rump(-2), tail(-4), ears(-24), jaw(30), FIERCE),
    key(1.2, pelvis(-0.051, 0.035), bend(3, 8, -5, -1, 1), rump(-2), tail(-5), ears(-24), jaw(29), FIERCE),
    key(1.42, pelvis(-0.049, 0.034), bend(3, 8, -6, 1, -1), rump(-2), tail(-4), ears(-24), jaw(30), FIERCE),
    key(1.62, pelvis(-0.048, 0.033), bend(3, 7, -6), rump(-2), tail(-4), ears(-22), jaw(28), FIERCE),
    key(1.78, pelvis(-0.02), bend(0, -2, -6), tail(4), ears(-8), jaw(4), ANGRY),
    key(1.9, pelvis(-0.022), bend(0, -1, -4, 0, 5), turn(0, 3), tail(4, 4), ears(-12, 6), SHUT),
    key(2.02, pelvis(-0.02), bend(0, -1, -4, 0, -5), turn(0, -3), tail(4, -4), ears(-12, 6), SHUT),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Blizzard: it rears up onto its haunches, drinks in a huge breath, and
 * howls a storm of snow at the foe, sweeping its head across, before
 * dropping back onto all fours with a shiver.
 */
const blizzard: Clip = {
  name: 'blizzard',
  duration: 2.1,
  keys: [
    key(0),
    key(0.2, pelvis(0.01, -0.05), bend(-26, -6, -14), rump(-10), tail(14, 0, 6), ears(6), SHUT, scale(1.02), PAWS_UP),
    key(0.42, pelvis(0.014, -0.055), bend(-28, -8, -18), rump(-11), tail(16, 0, 7), ears(8), SHUT, scale(1.04), PAWS_UP),
    snap(0.56, pelvis(0.004, -0.03), bend(-16, 6, -4, 12), rump(-8), tail(10, 0, 4), jaw(34), ears(-22), FIERCE, scale(1.02), PAWS_UP),
    key(0.8, pelvis(0.004, -0.03), bend(-16, 6, -4, -12), rump(-8, 4), tail(10, -6, 4), jaw(32), ears(-22), FIERCE, PAWS_UP),
    key(1.02, pelvis(0.004, -0.03), bend(-16, 6, -4, 10), rump(-8, -4), tail(10, 6, 4), jaw(34), ears(-22), FIERCE, PAWS_UP),
    key(1.24, pelvis(0.002, -0.03), bend(-15, 5, -3, -5), rump(-8), tail(10, 0, 4), jaw(28), ears(-20), FIERCE, PAWS_UP),
    key(1.46, pelvis(-0.02), bend(-2, 2, 0), rump(-2), tail(4), jaw(6), ears(-10), ANGRY, FRONT_DOWN),
    key(1.62, pelvis(-0.022), bend(0, 0, -2, 0, 5), turn(0, 3), ears(-12, 6), SHUT, FRONT_DOWN),
    key(1.76, pelvis(-0.02), bend(0, 0, -2, 0, -5), turn(0, -3), ears(-12, 6), SHUT, FRONT_DOWN),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'release' }],
};

/** Icy Wind: a quick breath in, then it blows a wide, cold wind across the foe, sweeping its head from one side to the other. */
const icyWind: Clip = {
  name: 'icy_wind',
  duration: 1.75,
  keys: [
    key(0),
    key(0.14, pelvis(-0.01), bend(2, 2, 4), ears(-4)),
    key(0.42, pelvis(0.006, -0.03), bend(-6, -8, -14, 8), ears(8), SHUT, scale(1.02)),
    snap(0.56, pelvis(-0.03, 0.02), bend(2, 6, -4, -14), rump(0, 4), jaw(22), ears(-18), FIERCE, scale(1)),
    key(0.8, pelvis(-0.03, 0.02), bend(2, 6, -4, 14, 2), rump(0, -4), jaw(24), ears(-18), FIERCE),
    key(1.0, pelvis(-0.028, 0.018), bend(2, 5, -3, -6), rump(0, 2), jaw(20), ears(-16), FIERCE),
    key(1.18, pelvis(-0.02), bend(1, 2, -1), jaw(4), ears(-10), ANGRY),
    key(1.36, pelvis(-0.015), bend(0, 0, 0, 0, 4), turn(0, 2), ears(-8, 4), SHUT),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.6, name: 'release' }, { t: 1.06, name: 'releaseEnd' }],
};

/**
 * Snore: asleep, curled up, it draws a huge breath and lets out a snore that
 * blasts from its open mouth, its head jerking up with it; then it stirs,
 * still dozing, up onto its paws.
 */
const snore: Clip = {
  name: 'snore',
  duration: 1.7,
  keys: [
    key(0, ...ASLEEP),
    key(0.34, ...ASLEEP, bend(-2, -2, -4), scale(1.05), pelvis(0.01)),
    snap(0.48, ...ASLEEP, bend(-6, -8, -12), jaw(30), scale(1.02), pelvis(0.006)),
    key(0.68, ...ASLEEP, bend(-4, -6, -8), jaw(20), scale(1.01)),
    key(0.9, ...ASLEEP, bend(-1, -1, -2), jaw(4)),
    key(1.2, pelvis(-0.03), bend(4, 6, 12), rump(-4), tail(-8), ears(-12), DROWSY),
    key(1.7, SHUT),
  ],
  events: [{ t: 0.54, name: 'release' }],
};

// Electric -----------------------------------------------------------------------------

/** Legs locked straight under it: the front paws braced stiff. */
const STIFF: Pose[] = [frontLegs([0.08, -0.98, 0.18], [0.04, -0.99, 0.12])];

/**
 * Thunderbolt: it hunkers down, eyes shut and tail rigid as the charge
 * builds, then its whole body tenses with its fur on end and the bolt leaps
 * from it, crackling and trembling.
 */
const thunderbolt: Clip = {
  name: 'thunderbolt',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(-0.04, -0.04), bend(3, 2, 4), rump(8), tail(24, 0, 12), ears(-26), SHUT),
    key(0.42, pelvis(-0.045, -0.045), bend(3, 2, 5, 0, 2), rump(9), tail(26, 0, 13), ears(-28), SHUT, scale(1.02)),
    snap(0.52, pelvis(-0.02, 0.02), bend(-4, -4, -6), rump(12), tail(30, 0, 16), ears(-34), jaw(14), FIERCE, scale(1.05), ...STIFF),
    key(0.64, pelvis(-0.024, 0.02), bend(-3, -4, -5, 2, 2), rump(12), tail(29, 2, 16), ears(-34), jaw(12), FIERCE, scale(1.04), ...STIFF),
    key(0.76, pelvis(-0.02, 0.022), bend(-4, -4, -6, -2, -2), rump(12), tail(30, -2, 16), ears(-34), jaw(14), FIERCE, scale(1.05), ...STIFF),
    key(0.88, pelvis(-0.024, 0.02), bend(-3, -4, -5, 1, 1), rump(11), tail(28, 1, 15), ears(-32), jaw(10), FIERCE, scale(1.04), ...STIFF),
    key(1.06, pelvis(-0.01), bend(0, 0, 0), rump(4), tail(8), ears(-8), ANGRY, scale(1), FRONT_DOWN),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.54, name: 'release' }],
};

/** Shock Wave: a quick jolt. A flinch inward, then a twisting jolt of its whole body flings the shock at the foe. */
const shockWave: Clip = {
  name: 'shock_wave',
  duration: 1.15,
  keys: [
    key(0),
    key(0.1, pelvis(-0.02), bend(2, 2, 4), tail(12, 0, 6), ears(-16), SHUT),
    key(0.2, pelvis(-0.03, -0.02), bend(4, 3, 6, 4), turn(4), rump(6, 6), tail(16, 6, 8), ears(-20), SHUT, scale(1.01)),
    snap(0.28, pelvis(-0.01, 0.03), bend(-6, -4, -8, -4), turn(-8, -4), rump(10, -8), tail(24, -10, 10), ears(-30), jaw(10), FIERCE, scale(1.04)),
    key(0.42, pelvis(-0.02, 0.01), bend(-2, -2, -4, -2), turn(-3), rump(6, -3), tail(12, -4, 4), ears(-20), ANGRY, scale(1.01)),
    key(0.7, pelvis(-0.006), bend(0, 0, 1), rump(2), tail(4), ears(-6), ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'release' }],
};

/**
 * Thunder: it gathers, then rears up onto its haunches and howls at the sky
 * to call the lightning down; as it strikes the foe a jolt runs through its
 * own bristling fur, and it drops back onto all fours.
 */
const thunder: Clip = {
  name: 'thunder',
  duration: 1.9,
  keys: [
    key(0),
    key(0.2, pelvis(-0.04), bend(4, 4, 8), tail(20, 0, 10), ears(-20), SHUT),
    key(0.5, pelvis(0.012, -0.05), bend(-26, -12, -22), rump(-10), tail(24, 0, 12), ears(12), jaw(20), FIERCE, scale(1.03), PAWS_WIDE),
    key(0.64, pelvis(0.014, -0.052), bend(-28, -14, -26), rump(-10), tail(26, 0, 12), ears(14), jaw(32), FIERCE, scale(1.04), PAWS_WIDE),
    snap(0.78, pelvis(0.008, -0.05), bend(-24, -10, -20, 0, 6), rump(-8), tail(30, 0, 16), ears(16), jaw(26), HURT, scale(1.06), PAWS_WIDE),
    key(0.92, pelvis(0.01, -0.05), bend(-25, -11, -21, 0, -4), rump(-8), tail(29, 2, 15), ears(15), jaw(22), FIERCE, scale(1.05), PAWS_WIDE),
    key(1.06, pelvis(0.008, -0.05), bend(-24, -10, -20, 0, 3), rump(-8), tail(28, -2, 14), ears(14), jaw(18), FIERCE, scale(1.04), PAWS_WIDE),
    key(1.32, pelvis(-0.02), bend(2, 2, 4), rump(0), tail(8, 0, 2), ears(-8), ANGRY, scale(1), FRONT_DOWN),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.8, name: 'release' }],
};

// The whole body, the tail, a forepaw ---------------------------------------------------

/** Hidden Power: eyes shut, it concentrates while orbs of light gather around it, then flings its head up and sends them at the foe. */
const hiddenPower: Clip = {
  name: 'hidden_power',
  duration: 1.65,
  keys: [
    key(0),
    key(0.16, pelvis(-0.03), bend(4, 4, 8), ears(-6), SHUT),
    key(0.44, pelvis(-0.035), bend(5, 5, 10, 0, 4), tail(10, 0, 4), SHUT, scale(1.02)),
    key(0.7, pelvis(-0.035), bend(5, 5, 10, 0, -4), tail(12, 0, 6), SHUT, scale(1.03)),
    snap(0.84, pelvis(0.01, 0.02), bend(-8, -6, -12), ears(14), tail(18, 0, 8), jaw(20), FIERCE, scale(1)),
    key(1.02, pelvis(0.006, 0.014), bend(-6, -4, -8, 0, 3), ears(10), tail(14, 0, 6), jaw(8), FIERCE),
    key(1.3, pelvis(-0.005), bend(-1, -1, -2), ears(3), tail(4), ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.9, name: 'release' }],
};

/**
 * Surf: it crouches, then rears up tall calling up the wave, and pushes
 * forward and down with its forepaws as the wave rolls out from under it to
 * crash over the foe; it rides the swell, then settles.
 */
const surf: Clip = {
  name: 'surf',
  duration: 2.0,
  keys: [
    key(0),
    key(0.2, pelvis(-0.04, -0.04), bend(4, 4, 8), rump(10), tail(8), ears(-14), ANGRY),
    key(0.5, pelvis(0.01, -0.05), bend(-26, -6, -10), rump(-10), tail(16, 0, 6), ears(10), jaw(16), FIERCE, PAWS_WIDE),
    key(0.62, pelvis(0.012, -0.052), bend(-28, -8, -12), rump(-10), tail(17, 0, 6), ears(11), jaw(18), FIERCE, PAWS_WIDE),
    snap(0.76, pelvis(-0.03, 0.05), bend(8, 8, 10), rump(6), tail(-4), ears(-20), jaw(8), FIERCE, PAWS_FORWARD),
    key(1.0, pelvis(-0.026, 0.045, 0.01), bend(6, 7, 9, 0, 4), rump(5, 6), tail(-2, 8), ears(-18), FIERCE, PAWS_FORWARD),
    key(1.24, pelvis(-0.028, 0.045, -0.01), bend(6, 7, 9, 0, -4), rump(5, -6), tail(-2, -8), ears(-18), FIERCE, PAWS_FORWARD),
    key(1.5, pelvis(-0.012), bend(2, 2, 3), rump(1), tail(2), ears(-8), ANGRY, FRONT_DOWN),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'release' }],
};

/** Swift: it cocks its big tail aside and whips it across, spraying stars at the foe from its tip. */
const swift: Clip = {
  name: 'swift',
  duration: 1.3,
  keys: [
    key(0),
    key(0.16, pelvis(-0.02), turn(4), rump(4, -16), tail(20, -30, 8, -12), ears(8), HAPPY),
    key(0.24, pelvis(-0.022), turn(5), rump(5, -18), tail(22, -34, 8, -14), ears(8), FIERCE),
    snap(0.32, pelvis(-0.01, 0.01), turn(-6), rump(4, 18), tail(20, 34, 10, 16), ears(-8), FIERCE),
    key(0.46, pelvis(-0.01, 0.01), turn(-5), rump(4, 16), tail(16, 30, 8, 14), ears(-6), FIERCE),
    key(0.72, pelvis(-0.005), turn(-1), rump(1, 4), tail(6, 8, 2, 4), ears(-2), HAPPY),
    key(1.3, OPEN_EYES),
  ],
  // The tail tip trails the rump by its overlap.
  events: [{ t: 0.4, name: 'release' }],
};

/** Mud-Slap: its weight goes back as the right forepaw drags back through the mud, then flicks forward and up, flinging a spray of mud at the foe's face. */
const SCOOP_BACK = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.1, -0.85, -0.52], [-0.05, -0.8, 0.6]);
const FLICK_UP = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.12, -0.1, 0.99], [-0.06, 0.5, 0.86]);
const mudSlap: Clip = {
  name: 'mud_slap',
  duration: 1.2,
  keys: [
    key(0),
    key(0.2, pelvis(-0.03, -0.03), bend(6, 6, 12, 6), turn(-8, -3), rump(2), tail(6), ears(-16), ANGRY, SCOOP_BACK),
    snap(0.32, pelvis(-0.02, 0.02), bend(-4, 0, -2, -4), turn(10, 4), rump(4), tail(10), ears(-20), FIERCE, FLICK_UP),
    key(0.46, pelvis(-0.02, 0.018), bend(-5, 0, -3, -5), turn(11, 4), rump(4), tail(10), ears(-20), FIERCE, FLICK_UP),
    key(0.7, pelvis(-0.01), bend(1, 1, 2), turn(2), tail(4), ears(-8), ANGRY, FRONT_DOWN),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

export const RANGED_CLIPS: Clip[] = [
  pinMissile, pinMissileFirst, pinMissileNext, pinMissileLast, waterPulse, shadowBall, iceBeam, blizzard, icyWind, snore,
  thunderbolt, shockWave, thunder, hiddenPower, surf, swift, mudSlap,
];

export { DROWSY };
