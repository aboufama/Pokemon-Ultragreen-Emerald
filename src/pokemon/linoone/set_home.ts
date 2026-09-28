// Linoone's clips played at home (ranged and status), with the helpers of
// ./set.ts, each made from the first clip that does its action: breaths,
// spits and beams after Blaziken's special_weak and special_strong (what it
// fires leaves its mouth: the head drives forward), roars after the
// status_target clips, the rest after the more.ts clips of the same motif.
//
// Staying clear of the healthboxes (tools/gauntlet/uiclear.mjs): as the foe,
// its forepaws and chest rest on the top edge of our box, so nothing here
// brings the body forward over its paws (the head drives forward on the neck;
// the pelvis only sinks or draws back); from our side our box is just right of
// its head, so the head never swings to its right, and the tail swings to its
// left, not over toward the box.

import type { Clip } from '../../anim/clip';
import type { Pose, Vec3 } from '../../anim/rig';
import {
  ANGRY, DROWSY, FIERCE, FORE_DOWN, GATHER, LAND, OPEN_EYES, PAWS_UP, SHUT, WINK,
  bend, ears, fore, jaw, key, pelvis, rump, snap, tail, twist,
} from './set';

/** Sitting up on its haunches, the long front half raised. */
const SIT_UP: Pose[] = [pelvis(0, 0.004, -0.045), rump(-8)];

// Ranged ------------------------------------------------------------------------

/**
 * Water Pulse, Pin Missile; Toxic (spit), after Blaziken's special_weak: a
 * quick breath with the head drawn back and up, then the head snaps forward
 * at the foe with the jaws wide and it spits; the head bobs back as the jaws
 * close.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Breath in: the chest rises, the head draws back and up.
    key(0.24, pelvis(0, 0.012, -0.012), rump(-3), bend(-5, -3, -12, -10), ears(-8), tail(6), ANGRY),
    // Spit: the head drives forward at the foe, jaws wide; the body leans in behind it.
    snap(0.34, pelvis(0, -0.01, 0.004), rump(4), bend(5, 2, 14, 6), jaw(30), ears(-26), tail(-4), ANGRY),
    // Recoil: the head bobs back as the jaws close.
    key(0.5, pelvis(0, -0.006, 0.002), rump(2), bend(3, 1, 5, -4), jaw(14), ears(-18), tail(-2), ANGRY),
    key(0.7, pelvis(0, -0.002), bend(1, 0, 1, -1), jaw(3), ears(-6), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  // The head trails the body a little: the shot leaves the jaws just after the key.
  events: [{ t: 0.4, name: 'release' }],
};

/**
 * Ice Beam, Hyper Beam (beam), after Blaziken's special_strong: it rises tall
 * on its forelegs with its face to the sky and gathers the power at its mouth,
 * eyes shut; then it drops into a low brace, sitting back on its haunches,
 * drives the head forward level at the foe and fires the beam from its jaws,
 * holding against the recoil with a tremor; it shuts its jaws and shakes it off.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(3, 0, 4, 4)),
    // Gathers: up tall, the face to the sky, the tail raised.
    key(0.52, pelvis(0, 0.02, -0.01), rump(-5), bend(-8, -4, -14, -18), ears(-6), tail(16, 0, -6), SHUT),
    key(0.66, pelvis(0, 0.024, -0.012), rump(-5), bend(-9, -4, -15, -19, 0, 2), ears(-6), tail(18, 0, -6), SHUT),
    // Fires: down into a low brace, the head driven forward level at the foe, jaws wide.
    snap(0.78, pelvis(0, -0.03, -0.035), rump(-8), bend(2, 2, 14, 8), jaw(32), ears(-34), tail(-10, 0, 14), ANGRY),
    // Holds it against the recoil, trembling, the head steady.
    key(1.0, pelvis(0, -0.027, -0.04), rump(-8), bend(2, 2, 13, 7, 2), jaw(30), ears(-34), tail(-10, -3, 14), ANGRY),
    key(1.22, pelvis(0, -0.03, -0.044), rump(-9), bend(3, 2, 14, 8, -2, -1), jaw(32), ears(-35), tail(-11, -5, 14), ANGRY),
    key(1.44, pelvis(0, -0.028, -0.046), rump(-8), bend(2, 2, 13, 7, 1, 1), jaw(30), ears(-34), tail(-10, -2, 14), ANGRY),
    key(1.62, pelvis(0, -0.029, -0.047), rump(-8), bend(2, 2, 14, 8), jaw(31), ears(-34), tail(-10, 0, 14), ANGRY),
    // The jaws shut; it straightens and shakes its head.
    key(1.8, pelvis(0, -0.016, -0.015), rump(-3), bend(1, 0, 4, -2, 8), jaw(4), ears(-14), tail(-2), ANGRY),
    key(1.94, pelvis(0, -0.008, -0.006), bend(0, 0, 2, -1, -6), ears(-8), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Thunderbolt, Shock Wave, Thunder Wave (bolt): it tenses low, its fur
 * bristling and the tail puffed up stiff, crackling (charge); then the head
 * drives forward with the jaws wide and the bolt leaps from its mouth to the
 * foe; it holds rigid with a tremor, then shakes the static off.
 */
const bolt: Clip = {
  name: 'bolt',
  duration: 1.6,
  keys: [
    key(0),
    // Tenses: low, the tail up stiff, ears flat, eyes shut; the charge crackles over it.
    key(0.2, pelvis(0, -0.04, -0.015), rump(8), bend(4, 0, 6, 6), tail(24, 0, 30), ears(-36), SHUT),
    key(0.36, pelvis(0, -0.045, -0.018), rump(9), bend(4, 0, 6, 6, 0, 3), tail(26, -4, 32), ears(-38), SHUT),
    key(0.5, pelvis(0, -0.042, -0.02), rump(8), bend(5, 0, 7, 7, 0, -3), tail(26, -8, 32), ears(-38), SHUT),
    // The bolt: the head drives forward, jaws wide.
    snap(0.6, pelvis(0, -0.02, 0.004), rump(4), bend(4, 2, 16, 6), jaw(30), tail(20, 0, 24), ears(-30), FIERCE),
    // Holds rigid, trembling, as it crackles on.
    key(0.76, pelvis(0, -0.022, 0.002), rump(4), bend(4, 2, 15, 6, 0, 2), jaw(28), tail(22, -3, 24), ears(-30), FIERCE),
    key(0.92, pelvis(0, -0.02, 0.002), rump(4), bend(4, 2, 16, 7, 0, -2), jaw(30), tail(21, -6, 24), ears(-30), FIERCE),
    // Shakes the static off.
    key(1.08, pelvis(0, -0.008), rump(1, -4), bend(1, 0, 4, -2, 8, 6), jaw(6), tail(8, -10, 8), ears(-12), ANGRY),
    key(1.22, pelvis(0, -0.004), rump(0, 3), bend(0, 0, 2, -1, -4, -5), jaw(2), tail(4, -4, 4), ears(-8), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'charge' }, { t: 0.66, name: 'release' }],
};

/**
 * Thunder (erupt): it rears up on its haunches and throws its head back to
 * the sky with a cry, calling down the storm (charge), holds it trembling,
 * then snaps its head down at the foe as the lightning strikes it (release),
 * and drops back onto all fours.
 */
const erupt: Clip = {
  name: 'erupt',
  duration: 1.9,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.03), rump(4), bend(6, 0, 6, 6), ears(-20), tail(-6), ANGRY),
    // Up on its haunches, the head to the sky, jaws open: it calls the storm.
    snap(0.42, ...SIT_UP, bend(-24, -4, -16, -22), PAWS_UP, jaw(26), ears(4), tail(20, 0, -8), ANGRY),
    key(0.62, ...SIT_UP, bend(-25, -4, -17, -23, 0, 3), PAWS_UP, jaw(28), ears(5), tail(22, -4, -8), ANGRY),
    key(0.82, ...SIT_UP, bend(-24, -4, -16, -24, 0, -3), PAWS_UP, jaw(26), ears(5), tail(22, 2, -8), ANGRY),
    // The head snaps down at the foe: the lightning strikes.
    snap(0.96, pelvis(0, 0, -0.045), rump(-6), bend(-22, -4, 10, 16), PAWS_UP, jaw(20), ears(-28), tail(8, 0, 8), FIERCE),
    key(1.12, pelvis(0, -0.002, -0.044), rump(-6), bend(-21, -4, 10, 17, 0, 2), PAWS_UP, jaw(14), ears(-26), tail(6, 0, 8), FIERCE),
    // Down onto all fours.
    key(1.32, ...LAND, pelvis(0, -0.025), ears(-14), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'charge' }, { t: 1.02, name: 'release' }],
};

/**
 * Shadow Ball, Hidden Power (orb): it lowers its head and gathers a ball
 * between its open jaws (charge), trembling as it grows, then flings it at
 * the foe with a toss of the head; the head follows through up high and it
 * settles.
 */
const orb: Clip = {
  name: 'orb',
  duration: 1.6,
  keys: [
    key(0),
    // The head drawn down and in, the jaws parting: the orb gathers at its mouth.
    key(0.24, pelvis(0, -0.03, -0.015), rump(6), bend(2, 0, 10, 16), jaw(18), ears(-20), tail(10), SHUT),
    key(0.44, pelvis(0, -0.036, -0.02), rump(7), bend(2, 0, 11, 18, 0, 3), jaw(22), ears(-22), tail(12), SHUT),
    key(0.6, pelvis(0, -0.04, -0.022), rump(8), bend(3, 0, 12, 19, 0, -3), jaw(24), ears(-24), tail(12), ANGRY),
    // The fling: the head tosses up and forward, hurling it.
    snap(0.7, pelvis(0, 0.004, 0), rump(-2), bend(-6, -2, 6, -16), jaw(30), ears(-8), tail(20, 0, -6), FIERCE),
    // Follow-through: the head up high.
    key(0.86, pelvis(0, 0.006, -0.004), rump(-3), bend(-7, -2, 4, -18), jaw(16), ears(-6), tail(18, 0, -6), FIERCE),
    key(1.04, pelvis(0, -0.006), bend(1, 0, 2, -2), jaw(4), ears(-6), tail(4), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.74, name: 'release' }],
};

/**
 * Icy Wind; Blizzard (breath), after Sceptile's breath: a long breath in,
 * chest up and head back; then the head drives forward, jaws wide, and it
 * blows a cold wind across the foe, the head sweeping from side to side; it
 * closes its jaws and settles.
 */
const breath: Clip = {
  name: 'breath',
  duration: 1.8,
  keys: [
    key(0),
    // Breath in: chest up, head back, eyes shut.
    key(0.22, pelvis(0, 0.014, -0.012), rump(-4), bend(-6, -4, -12, -12), ears(-6), tail(8), SHUT),
    key(0.42, pelvis(0, 0.018, -0.014), rump(-4), bend(-7, -4, -14, -14), ears(-6), tail(10), SHUT),
    // The head drives forward, jaws wide: the cold wind.
    snap(0.52, pelvis(0, -0.02, 0), rump(4), bend(3, 2, 14, 6), jaw(30), ears(-30), tail(-6, 0, 10), ANGRY),
    // It sweeps its head across the foe as it blows.
    key(0.72, pelvis(0, -0.022, 0), rump(4), bend(3, 2, 14, 6, 10), jaw(28), ears(-30), tail(-6, -6, 10), ANGRY),
    key(0.94, pelvis(0, -0.02, 0), rump(4), bend(3, 2, 14, 6, -6), jaw(30), ears(-30), tail(-6, 0, 10), ANGRY),
    key(1.12, pelvis(0, -0.02, 0), rump(4), bend(3, 2, 13, 5, 6), jaw(26), ears(-28), tail(-6, -4, 10), ANGRY),
    // Jaws close, the head recoils.
    key(1.28, pelvis(0, -0.006), rump(1), bend(0, 0, 2, -8), jaw(4), ears(-12), tail(0), ANGRY),
    key(1.46, pelvis(0, -0.003), bend(0, 0, 1, -1), ears(-6), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.58, name: 'release' }, { t: 1.16, name: 'releaseEnd' }],
};

/**
 * Surf (wave), after Swampert's wave: it rears up tall on its haunches with
 * its forepaws raised as the wave rises behind it, then drops forward onto its
 * forepaws, driving its head and shoulders down at the foe (release: the wave
 * rolls out from under it across the field), holds the push and rises.
 */
const wave: Clip = {
  name: 'wave',
  duration: 2.0,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.04, -0.01), rump(6), bend(8, 2, 8, 6), ears(-16), tail(-6), ANGRY),
    // Rears up, forepaws raised: the wave rises.
    key(0.5, ...SIT_UP, bend(-26, -4, -4, -8), PAWS_UP, jaw(14), ears(0), tail(24, 0, -10), ANGRY),
    key(0.66, ...SIT_UP, pelvis(0, 0.004, -0.002), bend(-27, -4, -4, -9, 0, 2), PAWS_UP, jaw(16), ears(0), tail(26, -4, -10), ANGRY),
    // The push: down onto its forepaws, driving forward.
    snap(0.8, FORE_DOWN, pelvis(0, -0.03, -0.04), rump(10), bend(4, 2, 10, 8), jaw(22), ears(-28), tail(-12, 0, 16), FIERCE),
    key(1.0, FORE_DOWN, pelvis(0, -0.034, -0.042), rump(11), bend(5, 2, 11, 9, 0, 2), jaw(18), ears(-28), tail(-14, 0, 16), FIERCE),
    key(1.22, FORE_DOWN, pelvis(0, -0.031, -0.042), rump(10), bend(4, 2, 10, 8, 0, -2), jaw(12), ears(-24), tail(-12, 0, 14), FIERCE),
    // Rises.
    key(1.46, pelvis(0, -0.015), rump(2), bend(2, 0, 2, 0), jaw(2), ears(-8), tail(-2), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'release' }],
};

/**
 * Snore (its own clip: the sound motif's other moves, which a called move
 * could bring, roar): asleep where it stands, slumped low with its eyes shut
 * and its head nodding, it draws a long breath and lets out a huge snore at
 * the foe (release), the head jerking up with the jaws wide; then it nods off
 * again and stirs back up.
 */
const snore: Clip = {
  name: 'snore',
  duration: 1.8,
  keys: [
    key(0),
    // Slumps, asleep: low, the head drooping, eyes shut.
    key(0.24, pelvis(0, -0.05, -0.02), rump(-4), bend(2, 0, 10, 18, 0, 6), ears(-20), tail(-10), SHUT),
    // A long breath in: the chest swells, the head lifts a little.
    key(0.54, pelvis(0, -0.035, -0.024), rump(-5), bend(-2, -2, 4, 8, 0, 4), jaw(6), ears(-18), tail(-8), SHUT),
    key(0.66, pelvis(0, -0.03, -0.026), rump(-5), bend(-3, -2, 2, 6, 0, 3), jaw(8), ears(-18), tail(-7), SHUT),
    // The snore: the head jerks up and forward, jaws wide.
    snap(0.76, pelvis(0, -0.03, -0.01), rump(-2), bend(2, 0, 10, -6), jaw(30), ears(-8), tail(4), SHUT),
    key(0.94, pelvis(0, -0.034, -0.012), rump(-2), bend(2, 0, 10, -4, 0, 3), jaw(26), ears(-8), tail(3), SHUT),
    // Nods off again, then stirs back to its stance.
    key(1.14, pelvis(0, -0.05, -0.02), rump(-4), bend(2, 0, 10, 16, 0, 6), jaw(2), ears(-20), tail(-8), SHUT),
    key(1.4, pelvis(0, -0.02, -0.008), bend(1, 0, 4, 6, 0, 2), ears(-10), tail(-2), DROWSY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.82, name: 'release' }],
};

/** Both forepaws dug in and drawn back under the chest (scooping). */
const PAWS_DIG = fore([0.1, -0.9, -0.42], [0.05, -0.85, 0.52]);
/** Both forepaws dug in ahead of it (reaching to scoop). */
const PAWS_DIG_IN = fore([0.12, -0.92, 0.37], [0.06, -0.96, 0.27]);
/** Both forepaws flung forward and up (what they scooped leaves them). */
const PAWS_FLING = fore([0.12, -0.05, 0.99], [0.06, 0.45, 0.89]);
/** ... and on up, the follow-through. */
const PAWS_FLUNG = fore([0.14, 0.2, 0.97], [0.08, 0.7, 0.71]);

/**
 * Mud-Slap (fling), after Swampert's two-handed scoop: it dips its front and
 * digs both forepaws into the mud, scoops it back under its chest, then flings
 * it at the foe as the front half comes up, both paws snapping forward and up
 * (release from the paws: + their overlap), and drops back onto all fours.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.25,
  keys: [
    key(0),
    // Dips its front and digs both forepaws in.
    key(0.16, pelvis(0, -0.022, -0.03), rump(8), bend(6, 2, 8, 6), PAWS_DIG_IN, ears(-20), tail(-6), ANGRY),
    // Scoops the mud back under its chest.
    key(0.3, pelvis(0, -0.02, -0.032), rump(8), bend(5, 2, 8, 4), PAWS_DIG, ears(-22), tail(-4), ANGRY),
    // Flings it: the front half comes up, both paws snap forward and up.
    snap(0.38, pelvis(0, 0.004, -0.024), rump(-2), bend(-12, -2, 0, -6), PAWS_FLING, jaw(12), ears(-10), tail(12), FIERCE),
    key(0.54, pelvis(0, 0.006, -0.026), rump(-3), bend(-13, -2, 0, -7), PAWS_FLUNG, jaw(8), ears(-8), tail(14), FIERCE),
    // Back down onto all fours.
    key(0.74, ...LAND, pelvis(0, 0.01, -0.01), ears(-12), ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'release' }],
};

/**
 * Swift (throw): a flick of its long tail. The tail sweeps down low to its
 * left, the rump swinging with it and the head turned back on the foe, then
 * it whips the tail up and over toward the foe, spraying the stars off its tip
 * (release: the tip trails the rump), and settles.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.3,
  keys: [
    key(0),
    // The tail swept down low to its left, the rump swinging with it.
    key(0.2, pelvis(0, -0.02), rump(4, -14), twist(4), bend(2, 0, 4, 0, -6), tail(-44, -30, 30), ears(-16), ANGRY),
    key(0.32, pelvis(0, -0.025), rump(5, -18), twist(5), bend(2, 0, 4, 0, -7), tail(-48, -36, 32), ears(-18), ANGRY),
    // The flick: whipped up and over toward the foe.
    snap(0.42, pelvis(0, -0.01), rump(2, 8), twist(-3), bend(0, 0, 2, -4, 3), tail(44, 6, -34), ears(-10), FIERCE),
    key(0.58, pelvis(0, -0.012), rump(1, 10), twist(-4), bend(0, 0, 2, -5, 4), tail(50, 8, -38), ears(-10), FIERCE),
    // Settles.
    key(0.84, pelvis(0, -0.006), rump(0, 2), bend(0, 0, 1, -1), tail(8, 0, -4), ears(-6), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'release' }],
};

// Status ------------------------------------------------------------------------

/**
 * Growl, Roar (roar), after Blaziken's status_target: it draws itself up
 * with the head back, then thrusts the head at the foe, jaws wide, the fur
 * bristling, and roars, the head shaking; then it settles.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    // Draws itself up, the head back.
    key(0.2, pelvis(0, 0.012, -0.015), rump(-4), bend(-6, -3, -12, -12), ears(-8), tail(12, 0, -6), ANGRY),
    // The roar: the head thrust forward, jaws wide, the tail bristling up.
    snap(0.3, pelvis(0, -0.02, 0), rump(6), bend(4, 2, 16, 6), jaw(34), ears(-36), tail(20, 0, 20), FIERCE),
    key(0.5, pelvis(0, -0.022, 0), rump(6), bend(4, 2, 16, 6, 6, 4), jaw(36), ears(-36), tail(22, -4, 20), FIERCE),
    key(0.7, pelvis(0, -0.02, 0), rump(6), bend(4, 2, 15, 6, -4, -4), jaw(34), ears(-36), tail(21, 2, 20), FIERCE),
    key(0.88, pelvis(0, -0.008), rump(2), bend(1, 0, 4, -2), jaw(6), ears(-12), tail(6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Drumming its belly, sat up: one forepaw beats it, the other drawn out low beside it (`right`: the right paw beats). */
const drum = (right: boolean): Pose => {
  const beat: [Vec3, Vec3] = [[0.12, -0.45, 0.88], [-0.45, -0.55, 0.7]];
  const out: [Vec3, Vec3] = [[0.6, -0.1, 0.8], [0.4, 0.4, 0.82]];
  const m = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
  const [l, r] = right ? [out, beat] : [beat, out];
  return fore(l[0], l[1], m(r[0]), m(r[1]));
};

/**
 * Belly Drum, Sleep Talk (buff), after Blaziken's status_self: it sits up on
 * its haunches and drums its belly with its forepaws, left and right, harder
 * and harder, then throws its head up and roars as the power surges (aura),
 * trembling with it, and drops back onto all fours.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.95,
  keys: [
    key(0),
    // Sits up on its haunches.
    key(0.22, ...SIT_UP, bend(-28, -6, 18, 10), PAWS_UP, ears(-6), tail(10), ANGRY),
    // Drums: left, right, left, right, harder each time (quick beats, each paw bouncing off).
    key(0.32, ...SIT_UP, bend(-27, -6, 20, 12), drum(false), ears(-10), tail(12), ANGRY),
    key(0.38, ...SIT_UP, bend(-28, -6, 18, 10), PAWS_UP, ears(-8), tail(11), ANGRY),
    key(0.46, ...SIT_UP, bend(-27, -6, 20, 12), drum(true), ears(-12), tail(13), ANGRY),
    key(0.52, ...SIT_UP, bend(-28, -6, 18, 9), PAWS_UP, ears(-10), tail(12), ANGRY),
    key(0.59, ...SIT_UP, bend(-26, -6, 22, 14), drum(false), jaw(8), ears(-16), tail(15), FIERCE),
    key(0.64, ...SIT_UP, bend(-28, -6, 18, 9), PAWS_UP, ears(-14), tail(14), FIERCE),
    key(0.7, ...SIT_UP, bend(-25, -6, 23, 15), drum(true), jaw(10), ears(-18), tail(17), FIERCE),
    // The roar: the head thrown up, jaws wide, paws raised, as the power surges.
    snap(0.86, ...SIT_UP, pelvis(0, 0.008), bend(-32, -6, -10, -18), PAWS_UP, jaw(32), ears(8), tail(28, 0, -10), FIERCE),
    key(1.02, ...SIT_UP, pelvis(0, 0.008), bend(-32, -6, -11, -19, 0, 3), PAWS_UP, jaw(34), ears(8), tail(30, -4, -10), FIERCE),
    key(1.18, ...SIT_UP, pelvis(0, 0.006), bend(-31, -6, -10, -18, 0, -3), PAWS_UP, jaw(30), ears(7), tail(29, 2, -10), FIERCE),
    // Drops back onto all fours.
    key(1.42, ...LAND, pelvis(0, -0.025), ears(-12), tail(6), ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.9, name: 'aura' }],
};

/**
 * Tail Whip, Charm, Tickle, Attract, Swagger (charm): it swings its rump
 * round toward the foe and looks back at it over its shoulder with a wink,
 * wagging its long tail at it side to side, the rump wiggling with it, then
 * swings back round. (It wags out to its left and back: from our side its
 * right is our healthbox.)
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.01), rump(6, -22), twist(8), bend(0, 0, -2, -4, 16, 8), tail(24, -24, -10), ears(6), WINK),
    // Wags: out to its left and back, the rump wiggling with it.
    snap(0.32, pelvis(0, -0.012), rump(6, -30), twist(9), bend(0, 0, -2, -4, 17, 9), tail(28, -46, -10), ears(8), WINK),
    snap(0.44, pelvis(0, -0.008), rump(6, -16), twist(7), bend(0, 0, -2, -5, 15, 7), tail(28, -6, -10), ears(6), WINK),
    snap(0.56, pelvis(0, -0.012), rump(6, -30), twist(9), bend(0, 0, -2, -4, 17, 9), tail(28, -46, -10), ears(8), WINK),
    snap(0.68, pelvis(0, -0.008), rump(6, -16), twist(7), bend(0, 0, -2, -5, 15, 7), tail(28, -6, -10), ears(6), WINK),
    key(0.84, pelvis(0, -0.01), rump(6, -26), twist(8), bend(0, 0, -2, -4, 16, 8), tail(26, -34, -10), ears(6), WINK),
    // Swings back round.
    key(1.1, pelvis(0, -0.004), rump(1, -4), bend(0, 0, 0, -1, 4, 2), tail(4, -6), ears(2), OPEN_EYES),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** A hind leg kicked back hard, raking the ground (`right`: the right one), the other planted. */
const rake = (right: boolean): Pose => ({
  plantLeft: right ? 1 : 0,
  plantRight: right ? 0 : 1,
  bones: right ? { thighR: { x: 70 }, shinR: { x: 70 } } : { thighL: { x: 70 }, shinL: { x: 70 } },
});
/** Its back to the foe, looking back at it over its shoulder. */
const LOOK_BACK: Pose[] = [twist(18), bend(0, 0, -6, 0, 40, 8)];

/**
 * Sand-Attack, Mud Sport (kick_sand): it hops round to put its back to the
 * foe, looks back at it over its shoulder and rakes the dirt back at it with
 * its hind legs, hard, one after the other, then hops back round the way it
 * came. It hops round out to its left and back: from our side, turning where
 * it stands swung its rump across our healthbox, and turning on round swung
 * its head across it.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.65,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.04), rump(6), bend(4, 0, 6, 4), ears(-16), ANGRY),
    // Hops round, its back to the foe.
    key(0.24, { root: { x: 0.3, y: 0.07, yaw: 90 } }, ...GATHER, twist(8), bend(0, 0, -3, 0, 20, 4), ears(-20), tail(-10), ANGRY),
    key(0.36, { root: { x: 0.45, yaw: 176 } }, ...LAND, ...LOOK_BACK, ears(-14), tail(-6), FIERCE),
    // Rakes the dirt back at the foe with its hind legs, one after the other.
    snap(0.46, { root: { x: 0.45, yaw: 178 } }, FORE_DOWN, rake(true), pelvis(0, -0.03, 0.02), rump(-6), ...LOOK_BACK, ears(-18), tail(-14), FIERCE),
    key(0.54, { root: { x: 0.45, yaw: 178 } }, ...LAND, pelvis(0, 0.005), ...LOOK_BACK, ears(-16), tail(-8), FIERCE),
    snap(0.62, { root: { x: 0.45, yaw: 179 } }, FORE_DOWN, rake(false), pelvis(0, -0.03, 0.02), rump(-6), ...LOOK_BACK, ears(-18), tail(-14), FIERCE),
    key(0.7, { root: { x: 0.45, yaw: 179 } }, ...LAND, pelvis(0, 0.005), ...LOOK_BACK, ears(-16), tail(-8), FIERCE),
    snap(0.78, { root: { x: 0.45, yaw: 180 } }, FORE_DOWN, rake(true), pelvis(0, -0.03, 0.02), rump(-6), ...LOOK_BACK, ears(-18), tail(-14), FIERCE),
    key(0.88, { root: { x: 0.45, yaw: 180 } }, ...LAND, ...LOOK_BACK, ears(-14), tail(-6), FIERCE),
    // Hops back round.
    key(1.0, { root: { x: 0.3, y: 0.07, yaw: 90 } }, ...GATHER, twist(8), bend(0, 0, -3, 0, 18, 4), ears(-12), tail(-4), ANGRY),
    key(1.12, ...LAND, ears(-10), ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'emit' }],
};

/**
 * Odor Sleuth, Mimic, Trick (glare): it stretches its head out low toward the
 * foe with its eyes narrowed, sniffing, the snout working in quick little
 * nods; it peers at it with a tilt of the head, then draws back.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.4,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.02, -0.005), rump(6), bend(4, 2, 16, 8), ears(8), tail(6), FIERCE),
    // Sniffing: quick little nods of the snout.
    key(0.32, pelvis(0, -0.022, -0.005), rump(6), bend(4, 2, 17, 12), jaw(4), ears(9), tail(6), FIERCE),
    key(0.42, pelvis(0, -0.02, -0.005), rump(6), bend(4, 2, 16, 6), jaw(0), ears(8), tail(7), FIERCE),
    key(0.52, pelvis(0, -0.022, -0.005), rump(6), bend(4, 2, 17, 12, 4), jaw(4), ears(9), tail(6), FIERCE),
    key(0.62, pelvis(0, -0.02, -0.005), rump(6), bend(4, 2, 16, 6, 4), jaw(0), ears(8), tail(7), FIERCE),
    // Peers at it, the head tilted.
    key(0.82, pelvis(0, -0.024, -0.006), rump(6), bend(4, 2, 17, 8, 6, -8), ears(10), tail(6), FIERCE),
    key(1.0, pelvis(0, -0.008), bend(1, 0, 4, 0), ears(2), tail(2), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/**
 * Protect, Detect, Endure, Substitute, Defense Curl (shield), after Swampert's
 * shield: it flinches, then drops low and curls in on itself, the chin tucked
 * to its chest and the long tail swept round over its back as a shield, eyes
 * squeezed shut, while the barrier forms; it holds, trembling, then rises.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, 0.006, -0.01), rump(-2), bend(-4, -2, -6, -6), ears(-10), tail(10), ANGRY),
    // Drops low and curls in: chin tucked, the tail round over its back.
    snap(0.28, pelvis(0, -0.04, -0.05), rump(6, -8), bend(2, 2, 2, 30, 8), tail(34, -16, -30), ears(-32), SHUT),
    key(0.46, pelvis(0, -0.043, -0.052), rump(6, -9), bend(2, 2, 2, 31, 8, 2), tail(36, -18, -30), ears(-32), SHUT),
    key(0.7, pelvis(0, -0.041, -0.054), rump(7, -8), bend(3, 2, 2, 30, 7, -2), tail(35, -16, -31), ears(-33), SHUT),
    key(0.9, pelvis(0, -0.044, -0.054), rump(6, -9), bend(2, 2, 3, 31, 8, 1), tail(36, -17, -30), ears(-32), SHUT),
    // Rises, the guard lowering.
    key(1.12, pelvis(0, -0.02, -0.01), rump(1, -2), bend(2, 0, 2, 4), tail(6, -4), ears(-10), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/** Curled round to its left: the front half and the head turned in to its side. */
const CURL_IN = (k: number): Pose => ({ bones: { spine: { y: 24 * k }, chest: { y: 8 * k }, neck: { y: 16 * k } } });

/**
 * Rest (heal), after Blaziken's heal: it lies down and curls up like a
 * sleeping weasel, the front half and the head turned in to its side and the
 * tail wrapped round, eyes shut, and breathes slowly while it recovers (aura);
 * then it gets up, still drowsy.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.2,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.04, -0.02), rump(-2, -6), bend(0, 0, 8, 10, 8), CURL_IN(0.3), tail(-10, -10, -6), ears(-12), DROWSY),
    // Down, curled round to its left, asleep.
    key(0.62, pelvis(0, -0.1, -0.04), rump(-8, -16), bend(-2, 2, 14, 22, 26, 10), CURL_IN(1), tail(-40, -36, -20), ears(-30), SHUT),
    // Slow breaths: the body rises and settles.
    key(0.98, pelvis(0, -0.092, -0.04), rump(-7, -15), bend(-3, 2, 13, 21, 26, 9), CURL_IN(1), tail(-38, -35, -19), ears(-29), SHUT),
    key(1.34, pelvis(0, -0.102, -0.04), rump(-8, -16), bend(-2, 2, 14, 22, 27, 10), CURL_IN(1), tail(-40, -37, -20), ears(-30), SHUT),
    // Gets up, still drowsy.
    key(1.62, pelvis(0, -0.03, -0.012), rump(-1, -3), bend(1, 0, 4, 6, 6), CURL_IN(0.2), tail(-6, -6), ears(-10), DROWSY),
    key(1.84, pelvis(0, -0.012), bend(0, 0, 2, 2, 2), ears(-4), DROWSY),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/**
 * Sunny Day, Rain Dance (weather), after Blaziken's weather: it sits up on
 * its haunches, lifts its face to the sky and calls with a long howl (aura),
 * swaying slowly, eyes shut; then it drops back down.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.85,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.03), rump(4), bend(6, 0, 8, 6), ears(-14), tail(-4), ANGRY),
    // Sits up, the face to the sky: the howl.
    snap(0.46, ...SIT_UP, bend(-26, -6, -18, -28), PAWS_UP, jaw(24), ears(6), tail(20, 0, -10), SHUT),
    key(0.7, ...SIT_UP, pelvis(0, 0.002), bend(-27, -6, -19, -29, 0, 5), PAWS_UP, jaw(26), ears(6), tail(22, -6, -10), SHUT),
    key(0.94, ...SIT_UP, pelvis(0, 0.002), bend(-26, -6, -18, -28, 0, -5), PAWS_UP, jaw(24), ears(6), tail(22, 2, -10), SHUT),
    key(1.14, ...SIT_UP, bend(-24, -6, -14, -22, 0, 2), PAWS_UP, jaw(10), ears(4), tail(18, -2, -8), SHUT),
    // Drops back down.
    key(1.4, ...LAND, pelvis(0, -0.02), ears(-8), tail(2), ANGRY),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

/**
 * Double Team (afterimage), after Blaziken's afterimage: it darts from side to
 * side in low, dead-straight dashes too fast to follow, stopping hard each
 * time; the afterimages start at the aura and run 1.4 s. Its darts to its
 * right are shorter and run back a little: from our side that way is our
 * healthbox.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.8,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), rump(8), bend(6, 0, 8, -4), ears(-24), FIERCE),
    key(0.2, { root: { x: 0.12, y: 0.04 } }, ...GATHER, bend(0, 0, 8, -4), ears(-30), tail(-10, -14), FIERCE),
    key(0.3, { root: { x: 0.22 } }, ...LAND, pelvis(0, -0.02), ears(-26), tail(-4, 8), FIERCE),
    key(0.42, { root: { x: 0.06, y: 0.045, z: -0.04 } }, ...GATHER, bend(0, 0, 8, -4), ears(-30), tail(-10, 14), FIERCE),
    key(0.52, { root: { x: -0.1, z: -0.1 } }, ...LAND, pelvis(0, -0.02), ears(-26), tail(-4, -8), FIERCE),
    key(0.64, { root: { x: 0.06, y: 0.045, z: -0.04 } }, ...GATHER, bend(0, 0, 8, -4), ears(-30), tail(-10, -14), FIERCE),
    key(0.74, { root: { x: 0.22 } }, ...LAND, pelvis(0, -0.02), ears(-26), tail(-4, 8), FIERCE),
    key(0.86, { root: { x: 0.06, y: 0.045, z: -0.04 } }, ...GATHER, bend(0, 0, 8, -4), ears(-30), tail(-10, 14), FIERCE),
    key(0.96, { root: { x: -0.1, z: -0.1 } }, ...LAND, pelvis(0, -0.02), ears(-26), tail(-4, -8), FIERCE),
    key(1.1, { root: { x: -0.03, y: 0.035, z: -0.05 } }, ...GATHER, bend(0, 0, 6, -2), ears(-20), tail(-6), ANGRY),
    key(1.22, { root: { x: 0 } }, ...LAND, pelvis(0, -0.01), ears(-14), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/** The clips played at home. */
export const SET_HOME: Clip[] = [
  specialWeak, specialStrong, bolt, erupt, orb, breath, wave, snore, fling, throwing,
  statusTarget, statusSelf, charm, kickSand, glare, shield, heal, weather, afterimage,
];
