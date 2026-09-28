// Sceptile's clips for the actions its first clips (./first.ts) had none for,
// made in their style with their helpers: Mega Kick, Crunch, Mud Sport and
// DragonBreath play these, named after their motifs.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, BRACED, ELBOWS_BACK, FOCUS, GUARD, HOP, LAND, OPEN_EYES, SHUT, TUCK,
  advance, bend, jaw, key, pelvis, root, snap, tail, twist,
} from './first';

/** Standing on the left leg, the right knee chambered high at the foe (the kick loading). */
const CHAMBER_R: Pose = {
  plantLeft: 1,
  plantRight: 0,
  aim: { thighR: { dir: [-0.2, 0.3, 0.93] }, shinR: { dir: [-0.12, -0.72, -0.68] } },
};

/** The right leg snapped out straight into the foe. */
const KICK_R: Pose = {
  plantLeft: 1,
  plantRight: 0,
  aim: { thighR: { dir: [-0.14, 0.12, 0.98] }, shinR: { dir: [-0.1, 0.16, 0.98] } },
};

/**
 * Mega Kick: a coil, a leap in along an arc, and a landing in front of the
 * foe; it chambers its right knee high, leans back and snaps the leg out
 * straight into the foe, holds it there a beat, draws it back and hops home.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.5,
  keys: [
    key(0),
    // Coil.
    key(0.16, pelvis(0, -0.045), bend(10, 2, 0, -6), GUARD, FOCUS, tail(10)),
    // Leap along an arc, legs tucked.
    key(0.3, advance(0.55), root({ y: 0.09 }), TUCK, bend(6, 0, 0, -8), GUARD, ANGRY, tail(16)),
    // Land in front of the foe.
    key(0.42, advance(1), LAND, bend(10, 2, 0, -6), GUARD, ANGRY, tail(6)),
    // Chamber: the knee up high, the body leaning back to load it.
    key(0.52, advance(1), CHAMBER_R, pelvis(0, -0.01), bend(-6, -4, 0, -10), GUARD, ANGRY, tail(14)),
    // The kick: the leg snaps out straight into the foe.
    snap(0.59, advance(1), KICK_R, pelvis(0, -0.005, 0.02), bend(-16, -8, 0, -6), GUARD, ANGRY, tail(24)),
    key(0.72, advance(1), KICK_R, pelvis(0, -0.006, 0.022), bend(-17, -8, 0, -7, 0, 2), GUARD, ANGRY, tail(22)),
    // Drawn back and down.
    key(0.84, advance(1), CHAMBER_R, pelvis(0, -0.01), bend(-4, -2, 0, -6), GUARD, ANGRY, tail(12)),
    key(0.96, advance(1), LAND, bend(10, 2, 0, -2), GUARD, ANGRY, tail(6)),
    // Hop home.
    key(1.1, advance(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.22, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

/**
 * Crunch: the head drawn back with the jaws parting, a leap in, and on the
 * landing the neck drives the open jaws into the foe and snaps them shut; it
 * shakes its head with its grip, lets go and hops home.
 */
const bite: Clip = {
  name: 'bite',
  duration: 1.4,
  keys: [
    key(0),
    // Head back, jaws parting.
    key(0.14, pelvis(0, -0.04), bend(-4, -4, -6, -16), jaw(10), GUARD, ANGRY, tail(8)),
    // Leap in.
    key(0.28, advance(0.6), root({ y: 0.08 }), TUCK, bend(4, 0, -6, -16), jaw(14), GUARD, ANGRY, tail(14)),
    // Land, the jaws wide, the head drawn right back.
    key(0.38, advance(1), LAND, bend(0, -4, -8, -20), jaw(32), GUARD, ANGRY, tail(8)),
    // The lunge: the neck drives the open jaws into the foe...
    snap(0.45, advance(1), pelvis(0, -0.03, 0.016), bend(22, 10, 12, 10), jaw(36), BRACED, ANGRY, tail(2)),
    // ...and they snap shut on it.
    key(0.5, advance(1), pelvis(0, -0.032, 0.018), bend(24, 10, 12, 12), jaw(1), BRACED, ANGRY, tail(2)),
    // Shaking its grip.
    key(0.62, advance(1), pelvis(0, -0.03, 0.016), bend(22, 10, 12, 10, 10), jaw(2), BRACED, ANGRY, tail(4, 10)),
    key(0.72, advance(1), pelvis(0, -0.03, 0.016), bend(23, 10, 12, 11, -10), jaw(2), BRACED, ANGRY, tail(4, -10)),
    // Lets go.
    key(0.84, advance(1), pelvis(0, -0.035), bend(10, 4, 0, 0), jaw(10), GUARD, ANGRY, tail(6)),
    // Hop home.
    key(0.98, advance(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), jaw(0), GUARD, ANGRY, tail(10)),
    key(1.1, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'impact' }],
};

/**
 * Mud Sport (kick_sand): it turns its shoulder, sweeps its great fern tail
 * low along the ground, then whips it up and over to fling the mud at the
 * foe (the mud leaves the tail's tip), and settles. (A foot scooping in front
 * would reach under our healthbox from a wild Sceptile.)
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.3,
  keys: [
    key(0),
    // The tail sweeps low along the ground, the head turned back to the foe.
    key(0.18, pelvis(0, -0.03), twist(-18), bend(10, 2, 0, -4, 16), GUARD, FOCUS, tail(-24, -30)),
    key(0.3, pelvis(0, -0.035), twist(-22), bend(12, 2, 0, -4, 18), GUARD, FOCUS, tail(-28, -40)),
    // The whip: up and over, flinging the mud at the foe.
    snap(0.4, pelvis(0, -0.02), twist(14, -2), bend(2, 0, 0, -8, -6), GUARD, ANGRY, tail(70, 20)),
    key(0.54, pelvis(0, -0.018), twist(18, -3), bend(0, 0, 0, -8, -8), GUARD, ANGRY, tail(80, 26)),
    // Settling.
    key(0.8, pelvis(0, -0.02), twist(4), bend(6, 2, 0, -2), GUARD, ANGRY, tail(14, 6)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/**
 * DragonBreath: a long breath in, chest up and head back; then the head
 * drives forward, jaws wide, and it breathes a sustained stream at the foe,
 * braced, the head swaying with it; it closes its jaws and settles.
 */
const breath: Clip = {
  name: 'breath',
  duration: 1.7,
  keys: [
    key(0),
    // Breath in.
    key(0.22, pelvis(0, 0.012), bend(-8, -8, -8, -18), ELBOWS_BACK, SHUT, tail(10)),
    key(0.42, pelvis(0, 0.016), bend(-10, -9, -9, -20), ELBOWS_BACK, SHUT, tail(12)),
    // The head drives forward: the stream.
    snap(0.52, pelvis(0, -0.02, 0.01), bend(14, 8, 2, -4), BRACED, jaw(34), ANGRY, tail(4)),
    key(0.72, pelvis(0, -0.022, 0.012), bend(15, 8, 2, -5, 5), BRACED, jaw(32), ANGRY, tail(3, 6)),
    key(0.92, pelvis(0, -0.02, 0.01), bend(14, 8, 2, -4, -5), BRACED, jaw(34), ANGRY, tail(3, -6)),
    // Jaws close, the head recoils.
    key(1.08, pelvis(0, -0.006), bend(3, 1, -2, -12), BRACED, jaw(6), ANGRY, tail(8)),
    key(1.3, pelvis(0, -0.003), bend(2, 1, 0, -2), GUARD, jaw(0), ANGRY, tail(2)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'release' }, { t: 1.06, name: 'releaseEnd' }],
};

/** The clips for the actions the first clips had none for, by the motif they show. */
export const MORE_CLIPS: Record<string, Clip> = Object.fromEntries([kick, bite, kickSand, breath].map((c) => [c.name, c]));
