// Treecko's clips for the actions Sceptile's first clips had none for,
// ported from the ones made since in their style (src/pokemon/sceptile/more.ts)
// with this set's helpers (./set.ts): Mega Kick, Crunch, Mud Sport and
// DragonBreath play these, named after their motifs.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, BRACED, ELBOWS_BACK, FOCUS, GUARD, HOP, LAND, LIGHT, OPEN_EYES, SHUT, TUCK,
  advance, bend, both, jaw, key, pelvis, root, snap, tail, twist,
} from './set';

/**
 * Sprung off the ground, the right knee chambered high at the foe (the kick
 * loading), the left leg trailing under it.
 */
const CHAMBER_R: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, 0.3, 0.93] }, shinR: { dir: [-0.12, -0.72, -0.68] },
    thighL: { dir: [0.3, -0.8, -0.5] }, shinL: { dir: [0.15, -0.5, -0.85] },
  },
};

/** The right leg snapped out straight into the foe, heel first (its long flat foot turns up with the shin). */
const KICK_R: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.14, 0.14, 0.98] }, shinR: { dir: [-0.1, 0.18, 0.98] },
    thighL: { dir: [0.3, -0.85, -0.42] }, shinL: { dir: [0.15, -0.55, -0.82] },
  },
};

/** Arms flung back and out for balance behind the kick. */
const ARMS_BACK_WIDE = both([[-0.8, -0.1, -0.6], [-0.6, 0.3, -0.75], [-0.45, 0.5, -0.74]]);

/**
 * Mega Kick: a coil, a leap in along an arc and a landing in front of the
 * foe; then, its legs being short, it springs up off the ground to chamber
 * its right knee high and snaps the leg out straight into the foe in the
 * air, leaning far back with the arms flung back, the whole body behind the
 * heel; it holds it a beat as it drops, lands, and hops home.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.4,
  keys: [
    key(0),
    // Coil.
    key(0.15, pelvis(0, -0.028), bend(10, 2, 0, -5), GUARD, FOCUS, tail(12)),
    // Leap along an arc, legs tucked.
    key(0.28, advance(0.55), root({ y: 0.11, z: 0.13 }), TUCK, bend(6, 0, 0, -7), GUARD, ANGRY, tail(16)),
    // Land in front of the foe, knees bent to spring again.
    key(0.38, advance(1), root({ z: 0.24 }), LAND, pelvis(0, -0.012), bend(12, 2, 0, -5), GUARD, ANGRY, tail(8)),
    // Spring up, the knee chambered high, leaning back to load it.
    key(0.47, advance(1), root({ y: 0.08, z: 0.24 }), CHAMBER_R, bend(-8, -4, 0, -8), ARMS_BACK_WIDE, ANGRY, tail(18)),
    // The kick: the leg snaps out straight into the foe, the body laid back behind it.
    snap(0.53, advance(1), root({ y: 0.1, z: 0.24 }), KICK_R, pelvis(0, 0, 0.02), bend(-22, -10, 0, -4), ARMS_BACK_WIDE, ANGRY, tail(28)),
    key(0.64, advance(1), root({ y: 0.07, z: 0.24 }), KICK_R, pelvis(0, 0, 0.022), bend(-23, -10, 0, -5, 0, 2), ARMS_BACK_WIDE, ANGRY, tail(26)),
    // Drawn back as it drops, and down onto its feet.
    key(0.73, advance(1), root({ y: 0.03, z: 0.24 }), CHAMBER_R, bend(-6, -3, 0, -5), GUARD, ANGRY, tail(14)),
    key(0.82, advance(1), root({ z: 0.24 }), LAND, bend(10, 2, 0, -2), GUARD, ANGRY, tail(8)),
    // Hop home.
    key(0.97, advance(0.45), root({ y: 0.075, z: 0.108 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.08, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

/**
 * Crunch: the big head drawn back with the jaws parting, a leap in to land
 * close, and the neck drives the open jaws into the foe and snaps them shut;
 * it shakes its head with its grip, lets go and hops home.
 */
const bite: Clip = {
  name: 'bite',
  duration: 1.3,
  keys: [
    key(0),
    // Head back, jaws parting.
    key(0.15, pelvis(0, -0.024), bend(-4, -4, -4, -9), jaw(10), GUARD, ANGRY, tail(10)),
    // Leap in.
    key(0.27, advance(0.6), root({ y: 0.1, z: 0.096 }), TUCK, bend(4, 0, -4, -9), jaw(14), GUARD, ANGRY, tail(14)),
    // Land, the jaws wide, the head drawn right back.
    key(0.36, advance(1), root({ z: 0.16 }), LAND, bend(0, -4, -5, -12), jaw(32), GUARD, ANGRY, tail(10)),
    // The lunge: the neck drives the open jaws into the foe...
    snap(0.42, advance(1), root({ z: 0.16 }), pelvis(0, -0.018, 0.016), bend(22, 10, 10, 8), jaw(36), BRACED, ANGRY, tail(6)),
    // ...and they snap shut on it.
    key(0.47, advance(1), root({ z: 0.16 }), pelvis(0, -0.019, 0.018), bend(24, 10, 10, 10), jaw(1), BRACED, ANGRY, tail(6)),
    // Shaking its grip.
    key(0.58, advance(1), root({ z: 0.16 }), pelvis(0, -0.018, 0.016), bend(22, 10, 10, 8, 10), jaw(2), BRACED, ANGRY, tail(8, 10)),
    key(0.67, advance(1), root({ z: 0.16 }), pelvis(0, -0.018, 0.016), bend(23, 10, 10, 9, -10), jaw(2), BRACED, ANGRY, tail(8, -10)),
    // Lets go.
    key(0.78, advance(1), root({ z: 0.16 }), pelvis(0, -0.021), bend(10, 4, 0, 0), jaw(10), GUARD, ANGRY, tail(8)),
    // Hop home.
    key(0.91, advance(0.45), root({ y: 0.075, z: 0.072 }), HOP, bend(8, 0, 0, 0), jaw(0), GUARD, ANGRY, tail(10)),
    key(1.02, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Mud Sport (kick_sand): it turns its shoulder, sweeps its fat leaf tail low
 * along the ground, then whips it up and over to fling the mud at the foe
 * (the mud leaves the tail's tip), and settles.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.2,
  keys: [
    key(0),
    // The tail sweeps low along the ground, the head turned back to the foe.
    key(0.17, pelvis(0, -0.018), twist(-18), bend(10, 2, 0, -3, 14), GUARD, FOCUS, tail(-4, -30)),
    key(0.28, pelvis(0, -0.021), twist(-22), bend(12, 2, 0, -3, 17), GUARD, FOCUS, tail(-6, -40)),
    // The whip: up and over, flinging the mud at the foe.
    snap(0.37, pelvis(0, -0.012), twist(14, -2), bend(2, 0, 0, -6, -6), GUARD, ANGRY, tail(70, 20)),
    key(0.5, pelvis(0, -0.011), twist(18, -3), bend(0, 0, 0, -6, -8), GUARD, ANGRY, tail(80, 26)),
    // Settling.
    key(0.74, pelvis(0, -0.012), twist(4), bend(6, 2, 0, -2), GUARD, ANGRY, tail(16, 6)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.41, name: 'emit' }],
};

/**
 * DragonBreath: a long breath in, chest up and head back a little; then the
 * big head drives forward, jaws wide, and it breathes a sustained stream at
 * the foe, braced, the head swaying with it; it closes its jaws and settles.
 */
const breath: Clip = {
  name: 'breath',
  duration: 1.6,
  keys: [
    key(0),
    // Breath in.
    key(0.2, pelvis(0, 0.008), bend(-8, -8, -6, -8), ELBOWS_BACK, SHUT, tail(10)),
    key(0.39, pelvis(0, 0.01), bend(-10, -9, -7, -10), ELBOWS_BACK, SHUT, tail(12)),
    // The head drives forward: the stream.
    snap(0.48, pelvis(0, -0.012, 0.006), bend(14, 8, 2, -3), BRACED, jaw(34), ANGRY, tail(6)),
    key(0.67, pelvis(0, -0.013, 0.007), bend(15, 8, 2, -4, 5), BRACED, jaw(32), ANGRY, tail(5, 6)),
    key(0.86, pelvis(0, -0.012, 0.006), bend(14, 8, 2, -3, -5), BRACED, jaw(34), ANGRY, tail(5, -6)),
    // Jaws close, the head recoils.
    key(1.0, pelvis(0, -0.004), bend(3, 1, -1, -8), BRACED, jaw(6), ANGRY, tail(8)),
    key(1.21, pelvis(0, -0.002), bend(2, 1, 0, -2), GUARD, jaw(0), ANGRY, tail(3)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.51, name: 'release' }, { t: 0.98, name: 'releaseEnd' }],
};

/** The clips for the actions Sceptile's first clips had none for, by the motif they show. */
export const MORE_CLIPS: Record<string, Clip> = Object.fromEntries([kick, bite, kickSand, breath].map((c) => [c.name, c]));
