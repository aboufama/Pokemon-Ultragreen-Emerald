// Beautifly's ranged clips (./set.ts has the helpers and the story): the
// first clips' shape for a move fired from home (Blaziken's special_weak and
// special_strong: a gather or a breath in, a snap, the release with a moving
// hold, a recoil, a settle), acted with its own parts: the wind from big wing
// beats, its needle of a proboscis uncoiled to drink or to shoot, its mouth
// for beams, orbs and its snore.

import type { Clip } from '../../anim/clip';
import {
  W_DOWN, W_HIGH, W_SPREAD,
  body, feelers, key, reach, rise, sip, snap, swell, wings,
} from './set';

/**
 * Gust, Whirlwind, Silver Wind (storm): it rises a little and draws its
 * wings up high and back, leaning back to load them; then it drives them
 * down and forward at the foe in one great stroke that sends the wind
 * (release), and beats twice more at it, big and hard, before it eases back
 * into its hover.
 */
const storm: Clip = {
  name: 'storm',
  duration: 1.55,
  keys: [
    key(0),
    // Gather: rises, wings drawn up and back, leaning back.
    key(0.2, rise(0.03, -0.04, -10), wings(10, 13), body(-7, -2, 6), feelers(-5)),
    key(0.3, rise(0.035, -0.045, -12), wings(11, 14), body(-8, -2, 7), feelers(-6)),
    // The great stroke: wings driven down and forward at the foe.
    snap(0.38, rise(0.025, 0.02, 8, 0, 0.02), wings(-30, -32), body(4, 4, -6), feelers(8)),
    // Two more big beats at it (the wind keeps coming).
    key(0.52, rise(0.03, 0, -2, 0, 0.02), wings(6, 12), body(-2, -1, 2)),
    key(0.64, rise(0.028, 0.015, 6, 0, 0.02), wings(-28, -30), body(3, 3, -4), feelers(6)),
    key(0.78, rise(0.03, -0.005, -2, 0, 0.015), wings(6, 12), body(-2, -1, 2)),
    key(0.9, rise(0.024, 0.01, 5, 0, 0.01), wings(-24, -28), body(2, 2, -3), feelers(4)),
    // Recoil: the wings come up and it eases back.
    key(1.06, rise(0.02, -0.01, -3), wings(2, 6), body(-1, 0)),
    key(1.26, rise(0.008, 0, 0.5), W_DOWN),
    key(1.55),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/**
 * Absorb, Mega Drain, Giga Drain (drain): it draws back with its wings up,
 * then leans in with its wings spread wide and uncoils its long proboscis
 * straight at the foe; it drinks in long pulls (release: the foe's energy
 * flows back up it), swelling a little with each, then coils the proboscis
 * back up, full and glowing, and settles. (Sceptile's special_weak_drain:
 * the reach, the pull, the glow.)
 */
const drain: Clip = {
  name: 'drain',
  duration: 1.8,
  keys: [
    key(0),
    // Draws back, wings up, the coil tightening.
    key(0.2, rise(0.02, -0.03, -8), W_HIGH, body(-5, -4, 5), reach(-0.12), feelers(-8)),
    // Leans in, wings spread, the proboscis uncoiling straight at the foe.
    snap(0.36, rise(0.01, 0.03, 8), W_SPREAD, body(5, 4, -4), reach(1, 2), feelers(10)),
    // Drinking: long pulls, swelling a little with each, wings beating slowly.
    key(0.56, rise(0.012, 0.035, 9), wings(-2, -10, 0.8), body(5, 5, -4), sip(1, 1), swell(1.03)),
    key(0.76, rise(0.016, 0.03, 8), W_SPREAD, body(4, 4, -4), sip(1, 0), swell(1.01)),
    key(0.96, rise(0.012, 0.035, 9), wings(-2, -10, 0.8), body(5, 5, -4), sip(1, 1.5), swell(1.045)),
    key(1.16, rise(0.016, 0.03, 8), W_SPREAD, body(4, 4, -4), sip(1, 0), swell(1.02)),
    // Coils it back up, full, lifting a touch.
    key(1.36, rise(0.03, 0, -4), wings(4, 8), body(-3, -4, 2), reach(0.25), swell(1.03)),
    key(1.56, rise(0.012, 0, 0), W_DOWN, reach(0.02), swell(1.005)),
    key(1.8),
  ],
  events: [{ t: 0.42, name: 'release' }],
};

/**
 * Poison Sting, String Shot, Toxic (special_weak: spit): its needle of a
 * proboscis is its weapon. It cocks its head back with its wings up, then
 * snaps the head forward on a downstroke and whips the proboscis half out at
 * the foe: the barb, the thread or the poison leaves it (release); the
 * proboscis springs back into its coil and the head bobs back. (Blaziken's
 * special_weak: a quick breath, the snap, the recoil.)
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Cocks the head back, wings up, the coil tightening.
    key(0.22, rise(0.02, -0.02, -8), W_HIGH, body(-6, -14, 6), reach(-0.1), feelers(-10)),
    // The snap: the head drives forward on a downstroke, the proboscis whips half out.
    snap(0.32, rise(0.005, 0.02, 8), W_DOWN, body(6, 10, -6), reach(0.65, 6), feelers(8)),
    // Recoil: the proboscis springs back, the head bobs up.
    key(0.46, rise(0.012, 0.01, 2), wings(0, 4), body(2, -2, -2), reach(0.25)),
    key(0.66, rise(0.01, 0, 0), W_DOWN, body(1, 1), reach(0.04)),
    key(1.2),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

/**
 * Hyper Beam, Solar Beam (special_strong: beam): a long gather: it rises
 * and opens its wings wide to the sky, face up, soaking up the power
 * (charge), swelling and trembling; then it drives its head down at the foe
 * and fires the beam from its mouth (release), braced on spread wings
 * against the recoil that pushes it back; the beam ends (releaseEnd), it
 * sags and recovers. (Blaziken's special_strong. Solar Beam's first turn
 * ends on the gathered pose, face to the sky.)
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, rise(-0.01, 0, 2), W_DOWN, body(2, 4)),
    // Gathers: rises, wings open wide to the sky, face up.
    key(0.5, rise(0.045, -0.02, -10), wings(-6, -20, 0.8), body(-8, -20, 6), feelers(-6, 6), swell(1.02)),
    key(0.66, rise(0.05, -0.022, -11), wings(-4, -16, 0.8), body(-9, -22, 7), feelers(-7, 7), swell(1.035)),
    key(0.8, rise(0.052, -0.02, -10, 1), wings(-6, -20, 0.8), body(-9, -21, 7), feelers(-6, 6), swell(1.045)),
    // Fires: the head drives down at the foe, wings braced wide and forward.
    snap(0.92, rise(0.02, 0.01, 8), wings(-22, -30, 0.8), body(6, 10, -6), feelers(10), swell(1.0)),
    // Holding it, pushed back, trembling.
    key(1.12, rise(0.022, -0.012, 7, 1), wings(-20, -28, 0.8), body(5, 9, -6), feelers(9)),
    key(1.32, rise(0.018, -0.022, 8, -1), wings(-22, -31, 0.8), body(6, 10, -6), feelers(10)),
    key(1.52, rise(0.022, -0.028, 7, 1), wings(-20, -28, 0.8), body(5, 9, -6), feelers(9)),
    key(1.68, rise(0.02, -0.03, 7), wings(-21, -30, 0.8), body(5, 9, -6), feelers(9)),
    // The beam ends: it sags back, wings up, and recovers.
    key(1.86, rise(0.01, -0.02, -4), wings(4, 8), body(-3, -4, 2), feelers(-4)),
    key(2.02, rise(0.008, -0.005, 0), W_DOWN, body(1, 2)),
    key(2.3),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.74, name: 'releaseEnd' }],
};

/**
 * Shadow Ball, Hidden Power (orb): it cups its wings forward around the
 * space before its face and the orb gathers there (charge), trembling; it
 * draws the wings up and back, then flings them forward and down at the foe
 * in one great beat that hurls the orb (release), and recovers.
 */
const orb: Clip = {
  name: 'orb',
  duration: 1.65,
  keys: [
    key(0),
    // Cups its wings forward, head bowed to the orb forming before it.
    key(0.24, rise(0.01, -0.01, 4), wings(-44, -6), body(4, 8, -4), feelers(6), swell(1.01)),
    key(0.4, rise(0.012, -0.012, 5, 1), wings(-48, -4), body(5, 9, -4), feelers(7), swell(1.02)),
    key(0.52, rise(0.01, -0.01, 4, -1), wings(-46, -6), body(4, 9, -4), feelers(6), swell(1.02)),
    // Draws back, wings up.
    key(0.64, rise(0.03, -0.035, -10), W_HIGH, body(-6, -3, 6), feelers(-8)),
    // The fling: one great beat forward and down, hurling it.
    snap(0.72, rise(0.015, 0.02, 10, 0, 0.035), wings(-30, -24), body(6, 6, -6), feelers(8)),
    // Follow-through: the wings hang forward.
    key(0.88, rise(0.012, 0.02, 9, 0, 0.035), wings(-32, -26), body(6, 7, -6), feelers(6)),
    key(0.98, rise(0.015, 0.01, 4, 0, 0.02), wings(-10, -12), body(3, 3, -3)),
    key(1.12, rise(0.02, 0, -2), wings(4, 8), body(-1, -1)),
    key(1.36, rise(0.01, 0, 0.5), W_DOWN),
    key(1.65),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.75, name: 'release' }],
};

/**
 * Psychic (mind): still and focused, it rises on wide, slow wings, antennae
 * pointed at the foe; it thrusts its head and antennae at the foe (release:
 * the foe is gripped) and holds it there, trembling with the effort, then
 * lets go and sinks back into its hover.
 */
const mind: Clip = {
  name: 'mind',
  duration: 1.6,
  keys: [
    key(0),
    // Focus: rises on spread wings, head drawn back a touch, antennae forward.
    key(0.24, rise(0.035, -0.015, -4), W_SPREAD, body(-3, -6, 3), feelers(16, -4)),
    key(0.42, rise(0.042, -0.02, -5), wings(-6, -22, 0.8), body(-4, -7, 3), feelers(18, -5)),
    // The push: head and antennae thrust at the foe, wings flared.
    snap(0.52, rise(0.04, 0.01, 6), wings(-16, -34, 0.8), body(5, 10, -4), feelers(24, -8), swell(1.02)),
    // Holding it in its grip, trembling.
    key(0.7, rise(0.042, 0.012, 7, 1.5), wings(-14, -32, 0.8), body(6, 11, -4), feelers(25, -8), swell(1.025)),
    key(0.88, rise(0.038, 0.01, 6, -1.5), wings(-16, -34, 0.8), body(5, 10, -4), feelers(24, -8), swell(1.02)),
    key(1.04, rise(0.04, 0.012, 7, 1), wings(-14, -31, 0.8), body(6, 11, -4), feelers(25, -8), swell(1.02)),
    // Lets go and sinks back.
    key(1.24, rise(0.018, 0, -2), wings(2, 6), body(-1, -2), feelers(4)),
    key(1.42, rise(0.008, 0, 0), W_DOWN),
    key(1.6),
  ],
  events: [{ t: 0.58, name: 'release' }],
};

/**
 * Snore (sound): asleep in the air, it sags, its wings drooping half open
 * and still and its head nodding down (folded shut, from our side they
 * closed up behind each other and it read as turned aside); it draws a long
 * breath (swelling, head lifting) and lets out a huge snore at the foe
 * (release) that jolts its whole body, the wings flicking up; it nods off
 * again, then beats back up into its hover.
 */
const sound: Clip = {
  name: 'sound',
  duration: 1.7,
  keys: [
    key(0),
    // Dozing: sagging, wings drooping half open, the head nodding down.
    key(0.24, rise(-0.03, 0, 5), wings(-6, -26, 0.8), body(4, 16, -6), feelers(-14)),
    // The long breath in: it swells and the head lifts.
    key(0.5, rise(-0.015, -0.01, -3), wings(-4, -20, 0.8), body(-3, -4, 2), feelers(-10), swell(1.05)),
    // The snore: a jolt, head thrust at the foe, the wings flicking up.
    snap(0.6, rise(-0.02, 0.02, 6), wings(4, 8), body(5, 8, -4), feelers(10, 6), swell(0.97)),
    key(0.74, rise(-0.022, 0.018, 5, 2), wings(2, 4), body(5, 9, -4), feelers(8, 4), swell(0.98)),
    // Nods off again.
    key(0.94, rise(-0.032, 0, 5), wings(-6, -26, 0.8), body(4, 16, -6), feelers(-12)),
    key(1.14, rise(-0.028, 0, 4), wings(-5, -24, 0.8), body(4, 15, -6), feelers(-12)),
    // Back up into its hover.
    key(1.36, rise(0.01, 0, -1), wings(2, 6), body(0, 2)),
    key(1.52, rise(0.008, 0, 0), W_DOWN),
    key(1.7),
  ],
  events: [{ t: 0.64, name: 'release' }],
};

/**
 * Swift (throw): it gathers with its wings drawn up, twirls once in the air
 * with them spread, and as it comes round to face the foe it flings them
 * forward: the stars fly off them (release); it carries through and settles.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.6,
  keys: [
    key(0),
    // Gathers: wings drawn up, body dipping.
    key(0.3, rise(-0.015, -0.01, -4), W_HIGH, body(-3, -2, 3), feelers(-6)),
    // The twirl, wings spread.
    key(0.5, { root: { y: 0.015, x: 0.02, yaw: 130 } }, wings(2, 4), body(-2, -2, 2)),
    key(0.68, { root: { y: 0.015, x: 0.02, yaw: 280 } }, wings(3, 5), body(-3, -3, 2)),
    // Round to face the foe: the wings fling forward, the stars flying off them.
    snap(0.78, { root: { y: 0.02, x: 0.02, z: 0.015, pitch: 8, yaw: 360 } }, wings(-44, -26), body(4, 5, -4), feelers(8)),
    key(0.94, { root: { y: 0.018, x: 0.015, z: 0.015, pitch: 7, yaw: 360 } }, wings(-48, -28), body(4, 6, -4), feelers(6)),
    key(1.12, { root: { y: 0.018, yaw: 360 } }, wings(2, 6), body(-1, -1)),
    key(1.34, { root: { y: 0.008, yaw: 360 } }, W_DOWN),
    key(1.6, { root: { yaw: 360 } }),
  ],
  events: [{ t: 0.82, name: 'release' }],
};

/** The ranged clips, by the action they show. */
export const RANGED_CLIPS: Record<string, Clip> = Object.fromEntries(
  [storm, drain, specialWeak, specialStrong, orb, mind, sound, throwing].map((c) => [c.name, c]),
);
