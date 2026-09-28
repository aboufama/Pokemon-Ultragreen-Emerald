// Dustox's ranged moves, in the first clips' style (./set.ts has the helpers
// and the notes on how it moves): a gather or a breath in, a snap, the
// release with a moving hold, a recoil, a settle, all from its hover. Its
// mind reaches out through its antennae (Confusion, Psychic, Psybeam) and
// drinks through them (Giga Drain); beams and sludge leave its mouth, its
// barb the tip of its abdomen, wind and stars its wings.

import type { Clip } from '../../anim/clip';
import { FROWN, GAPE, MOUTH, SHUT, SMILE, antennae, bend, curl, fly, key, snap, swell, twist, wingL, wingR, wings } from './set';

/**
 * Confusion (mind; special_weak): it goes still in the air and gathers its
 * power, the antennae drawn back and apart, the head up; then it thrusts the
 * antennae at the foe with a push of its head (release: the foe is gripped),
 * holds its grip, straining, and lets go.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Gathering: the antennae drawn back and apart, the head up, a slow stroke.
    key(0.16, antennae(-16, 10), fly(0.015, -0.02, -6), bend(-4, -8), wings(22, 8), SHUT),
    key(0.3, antennae(-19, 12), fly(0.025, -0.025, -7), bend(-5, -9), wings(-6, -2), swell(1.02), SHUT),
    // The push: the antennae thrust at the foe, the head after them.
    snap(0.4, antennae(28, 4), fly(0.01, 0.03, 9), bend(9, 11), wings(-18, -4), SHUT),
    // Holding its grip, straining.
    key(0.56, antennae(30, 6), fly(0.012, 0.035, 10), bend(9, 11), wings(14, 4), SHUT),
    key(0.72, antennae(28, 5), fly(0.016, 0.03, 9, 1), bend(8, 10, 2), wings(-12, -2), SHUT),
    // Letting go.
    key(0.88, antennae(6), fly(0.015, 0, -1), wings(18, 6)),
    key(1.06, wings(-12, -4), fly(0.012, 0, 1)),
    key(1.3),
  ],
  events: [{ t: 0.45, name: 'release' }],
};

/**
 * Psychic (mind_strong): it rises and spreads its wings in a glide, swelling
 * as the power gathers in its drawn-back antennae; then it thrusts them and
 * its whole body at the foe (release), wings driven forward, and holds the
 * foe in its grip with a slow sway before it eases back down.
 */
const mindStrong: Clip = {
  name: 'mind_strong',
  duration: 1.8,
  keys: [
    key(0),
    key(0.2, antennae(-12, 14), fly(0.03, -0.02, -6), bend(-4, -8), wings(30, 10), SHUT),
    // At the top, gliding on spread wings, swelling with the power.
    key(0.4, antennae(-18, 16), fly(0.05, -0.03, -9), bend(-6, -10), wings(6, -2), swell(1.03), SHUT),
    key(0.52, antennae(-20, 18), fly(0.055, -0.035, -10), bend(-6, -11, 0, 2), wings(12, 0), swell(1.04), SHUT),
    // The thrust: antennae and head at the foe, the wings driven down.
    snap(0.62, antennae(34, 6), fly(0.045, 0, 5), bend(8, 14), wings(-14, -4), SHUT),
    // The grip, swaying.
    key(0.8, antennae(36, 8), fly(0.045, 0, 5, 2), bend(8, 15, 3), wings(4, 0), SHUT),
    key(1.0, antennae(34, 6), fly(0.05, 0, 4, -2), bend(8, 14, -3), wings(-10, -2), SHUT),
    // Easing back down.
    key(1.18, antennae(10, 2), fly(0.035, 0.01, 3), bend(3, 3), wings(20, 6)),
    key(1.36, fly(0.02, 0, -2), wings(-14, -4)),
    key(1.56, fly(0.012, 0, 1), wings(12, 4)),
    key(1.8),
  ],
  events: [{ t: 0.66, name: 'release' }],
};

/**
 * Psybeam (beam): it draws its antennae back together as the power glows in
 * them (charge), then points them at the foe and fires a wavering beam from
 * them (release), swaying with it; the beam stops (releaseEnd), it recoils
 * and settles.
 */
const beam: Clip = {
  name: 'beam',
  duration: 2.0,
  keys: [
    key(0),
    // Antennae drawn back together, glowing.
    key(0.18, antennae(-18, -8), fly(0.02, -0.03, -8), bend(-4, -8), wings(20, 6), SHUT),
    key(0.4, antennae(-22, -10), fly(0.03, -0.035, -9), bend(-5, -9), wings(-10, -4), swell(1.03), SHUT),
    // Aimed at the foe: the beam.
    snap(0.52, antennae(32, 0), fly(0.01, 0.02, 8), bend(8, 12), wings(-14, -4)),
    // Swaying with it, the beam wavering.
    key(0.74, antennae(32, 4), fly(0.012, 0.02, 8, 3), bend(8, 12, 5), wings(12, 2)),
    key(0.96, antennae(32, -4), fly(0.012, 0.022, 8, -3), bend(8, 12, -5), wings(-12, -2)),
    key(1.18, antennae(32, 3), fly(0.014, 0.02, 8, 2), bend(8, 12, 4), wings(12, 2)),
    key(1.36, antennae(30), fly(0.012, 0.02, 7), bend(7, 11), wings(-10, -2)),
    // The recoil.
    key(1.52, antennae(-6), fly(0.02, -0.02, -6), bend(-4, -6), wings(22, 6)),
    key(1.72, wings(-12, -4), fly(0.012, 0, 1)),
    key(2.0),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.56, name: 'release' }, { t: 1.38, name: 'releaseEnd' }],
};

/**
 * Hyper Beam, Solar Beam (beam_strong; special_strong): a dip, then it rises
 * with its face turned up and its wings spread wide and forward, swelling as
 * it gathers (charge; Solar Beam soaks in the sunlight here); it snaps down
 * into a brace with its wings swept back and fires a great beam from its
 * mouth (release), the recoil pushing it back while it holds; it stops
 * (releaseEnd) and sags, spent, before it steadies.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.5,
  keys: [
    key(0),
    key(0.14, fly(-0.02, 0, 4), wings(-12, -4), bend(4, 6)),
    // Gathering: rising, face up, wings spread wide and forward, swelling.
    key(0.5, fly(0.07, -0.02, -14), wings(20, -12), bend(-8, -18), antennae(-10, 12), swell(1.03), SHUT),
    key(0.66, fly(0.08, -0.025, -15), wings(24, -10), bend(-9, -20, 0, 2), antennae(-11, 13), swell(1.04), SHUT),
    key(0.82, fly(0.085, -0.03, -15), wings(18, -12), bend(-9, -20, 0, -2), antennae(-12, 14), swell(1.05), SHUT),
    // The brace and the beam from its mouth.
    snap(0.92, fly(0.03, 0.02, 10), wings(10, 40), bend(10, 8), antennae(8), swell(0.99), GAPE),
    // Holding it, pushed back by the recoil.
    key(1.12, fly(0.03, 0, 9), wings(14, 38), bend(10, 8, 3), antennae(8), GAPE),
    key(1.34, fly(0.035, -0.02, 8, 1), wings(8, 40), bend(10, 8, -3), antennae(8), GAPE),
    key(1.56, fly(0.035, -0.035, 8, -1), wings(14, 38), bend(10, 8, 2), antennae(8), GAPE),
    key(1.74, fly(0.03, -0.045, 7), wings(10, 40), bend(10, 8), antennae(6), GAPE),
    // Spent: it sags, then steadies.
    key(1.96, fly(-0.01, -0.03, 6), wings(-20, 4), bend(12, 14), FROWN),
    key(2.16, fly(0.005, -0.01, 2), wings(12, 4), bend(4, 5), FROWN),
    key(2.5),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.8, name: 'releaseEnd' }],
};

/**
 * Poison Sting (spit): it tips back and swings its abdomen back, then snaps
 * it forward under itself like a wasp with a hard downstroke, the tip jabbing
 * at the foe as the barb flies (release, from the tip of its abdomen), and
 * settles.
 */
const spit: Clip = {
  name: 'spit',
  duration: 1.25,
  keys: [
    key(0),
    // The abdomen swung back, the body tipping back.
    key(0.18, curl(-16), fly(0.02, -0.02, -10), wings(24, 8), bend(-4, -6), SHUT),
    // The jab: the abdomen snapped forward under it, aimed at the foe.
    snap(0.3, curl(40), fly(0, 0.02, -16), wings(-24, -10), bend(4, 6), SHUT),
    key(0.44, curl(26), fly(0.01, 0, -9), wings(16, 5), bend(0, 2)),
    key(0.62, curl(6), fly(0.012, 0, -2), wings(-12, -4)),
    key(0.86, wings(10, 3), fly(0.008)),
    key(1.25),
  ],
  events: [{ t: 0.31, name: 'release' }],
};

/**
 * Sludge Bomb (spit_strong; String Shot spits its thread the same way): it
 * rears up and back, swelling as it heaves the sludge up, then lunges its
 * head at the foe with a hard downstroke and hurls the glob from its mouth
 * (release), recoils with a sour mouth, and settles.
 */
const spitStrong: Clip = {
  name: 'spit_strong',
  duration: 1.5,
  keys: [
    key(0),
    // The heave: rearing up and back, swelling.
    key(0.2, fly(0.04, -0.03, -12), wings(34, 14), bend(-6, -14), curl(10), swell(1.04), SHUT),
    key(0.34, fly(0.05, -0.035, -13), wings(38, 16), bend(-7, -16), curl(12), swell(1.06), SHUT),
    // The hurl.
    snap(0.44, fly(0, 0.03, 12), wings(-30, -10), bend(10, 10), curl(-4), swell(0.98), GAPE),
    key(0.6, fly(0, 0.035, 13), wings(-26, -8), bend(11, 11), curl(-5), GAPE),
    // The recoil.
    key(0.78, fly(0.02, -0.01, -4), wings(20, 6), bend(-2, -4), FROWN),
    key(0.98, fly(0.015, 0, 1), wings(-14, -4), bend(1, 1)),
    key(1.2, fly(0.006), wings(8, 2)),
    key(1.5),
  ],
  events: [{ t: 0.5, name: 'release' }],
};

/**
 * Gust, Whirlwind, Silver Wind (storm): it rears back with its wings raised
 * high, then beats them forward and down at the foe in three huge strokes,
 * each driving the wind (and its scales) at it (release on the first), and
 * settles back into its hover.
 */
const storm: Clip = {
  name: 'storm',
  duration: 1.7,
  keys: [
    key(0),
    // Rearing back, the wings raised high.
    key(0.16, wings(44, 22), fly(0.03, -0.03, -14), bend(-6, -8), curl(6), SHUT),
    // Three huge strokes forward and down at the foe.
    snap(0.3, wings(-30, -34), fly(0.05, 0.01, -4), bend(4, 4), curl(-4), GAPE),
    key(0.46, wings(42, 20), fly(0.04, -0.02, -12), bend(-4, -6), curl(4), GAPE),
    snap(0.6, wings(-32, -36), fly(0.06, 0.01, -3), bend(4, 4), curl(-4), GAPE),
    key(0.76, wings(40, 18), fly(0.05, -0.02, -11), bend(-4, -6), curl(4)),
    snap(0.9, wings(-30, -34), fly(0.06, 0.01, -3), bend(4, 4), curl(-3)),
    // Settling.
    key(1.06, wings(24, 8), fly(0.03, 0, -3)),
    key(1.24, wings(-14, -4), fly(0.015, 0, 1)),
    key(1.44, wings(10, 3), fly(0.006)),
    key(1.7),
  ],
  events: [{ t: 0.32, name: 'release' }],
};

/**
 * Giga Drain (drain): it reaches for the foe, antennae and wings stretched
 * out at it (release: the energy starts to flow), then draws the energy in
 * toward itself, wings and body pulling back and in, swelling with each pull,
 * and relaxes, pleased.
 */
const drain: Clip = {
  name: 'drain',
  duration: 1.8,
  keys: [
    key(0),
    // Reaching for the foe.
    key(0.18, antennae(22, 10), fly(0.01, 0.03, 10), wings(8, -12), bend(7, 9), SHUT),
    key(0.3, antennae(26, 12), fly(0.012, 0.035, 11), wings(-6, -14), bend(8, 10), SHUT),
    // Drawing it in: wings and body pulled back, swelling with each pull.
    snap(0.48, antennae(-8, 4), fly(0.03, -0.04, -12), wings(28, 28), bend(-6, -8), curl(12), swell(1.04), SHUT),
    key(0.68, antennae(-10, 4), fly(0.035, -0.045, -13), wings(22, 30), bend(-6, -9), curl(14), swell(1.05), SHUT),
    key(0.88, antennae(-8, 4), fly(0.03, -0.04, -12), wings(30, 26), bend(-6, -8), curl(12), swell(1.03), SHUT),
    key(1.08, antennae(-10, 4), fly(0.035, -0.045, -13), wings(22, 30), bend(-6, -9), curl(14), swell(1.06), SHUT),
    // Relaxing, pleased.
    key(1.3, fly(0.02, -0.02, -4), wings(10, 6), bend(-2, -4), curl(4), swell(1.02), SMILE),
    key(1.52, fly(0.012, 0, 1), wings(-12, -4), MOUTH),
    key(1.8),
  ],
  events: [{ t: 0.34, name: 'release' }],
};

/**
 * Hidden Power, Shadow Ball (orb): it curls its wings forward round the
 * power gathering before its chest (charge), then flings them up and back
 * and hurls the orb at the foe with one hard forward stroke (release),
 * following through, and settles.
 */
const orb: Clip = {
  name: 'orb',
  duration: 1.6,
  keys: [
    key(0),
    // Gathering the orb before its chest, wings curled forward round it.
    key(0.2, wings(10, -40), bend(8, 12), fly(0.02, -0.02, 4), curl(8), SHUT),
    key(0.4, wings(14, -46), bend(9, 13), fly(0.025, -0.025, 5), curl(9), antennae(-8, 6), swell(1.03), SHUT),
    // Wings flung up and back, then the hurl.
    key(0.52, wings(40, 20), bend(-8, -10), fly(0.04, -0.03, -10), curl(4)),
    snap(0.6, wings(-28, -30), bend(10, 10), fly(0.02, 0.03, 10), curl(-4), GAPE),
    key(0.78, wings(-24, -26), bend(9, 9), fly(0.02, 0.03, 9), curl(-4), GAPE),
    // Settling.
    key(0.96, wings(22, 8), fly(0.02, -0.01, -3)),
    key(1.14, wings(-14, -4), fly(0.012, 0, 1)),
    key(1.34, wings(8, 2), fly(0.006)),
    key(1.6),
  ],
  events: [{ t: 0.14, name: 'charge' }, { t: 0.64, name: 'release' }],
};

/**
 * Swift (throw): it cocks its left wing high and back, the thorax turned
 * with it, and flicks it forward and down across itself, spraying the stars
 * from its wing (release); the wing carries through, and it settles.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.3,
  keys: [
    key(0),
    // The wing cocked high and back.
    key(0.2, twist(16), wingL(44, 26), wingR(4, 0), fly(0.02, -0.02, -6, 4), bend(-3, -4, 6), SHUT),
    // The flick.
    snap(0.3, twist(-16), wingL(-24, -44), wingR(10, 6), fly(0.01, 0.02, 6, -6), bend(4, 4, -6)),
    key(0.46, twist(-20), wingL(-34, -48), wingR(12, 6), fly(0.01, 0.02, 6, -8), bend(5, 5, -8)),
    // Settling.
    key(0.64, twist(-4), wings(20, 6), fly(0.015, 0, -1)),
    key(0.84, wings(-12, -4), fly(0.012, 0, 1)),
    key(1.06, wings(8, 2), fly(0.005)),
    key(1.3),
  ],
  events: [{ t: 0.32, name: 'release' }],
};

/**
 * Snore (sound): asleep on the wing, it nods off, its wings drooping and its
 * mouth shut; it draws a big breath, swelling, then the snore blasts out of
 * its wide mouth as its head jerks up (release); it nods off again and
 * steadies.
 */
const sound: Clip = {
  name: 'sound',
  duration: 1.6,
  keys: [
    key(0),
    // Nodding off, the wings drooping.
    key(0.22, bend(10, 16), wings(-14, -2), fly(-0.02, 0, 6), curl(6), SHUT),
    // A big breath in.
    key(0.46, bend(4, 8), wings(10, 4), fly(-0.01, -0.01, 2), curl(4), swell(1.05), SHUT),
    // The snore.
    snap(0.56, bend(-6, -12), wings(-18, -6), fly(0.02, -0.02, -6), curl(-2), swell(0.98), GAPE),
    key(0.74, bend(-5, -10), wings(14, 4), fly(0.02, -0.025, -5), curl(-1), GAPE),
    // Nodding off again, then steadying.
    key(0.92, bend(6, 10), wings(-12, -2), fly(-0.01, 0, 3), curl(4), SHUT),
    key(1.14, bend(2, 3), wings(10, 3), fly(0.004), MOUTH),
    key(1.36, wings(-8, -2), fly(0.01, 0, 0.5)),
    key(1.6),
  ],
  events: [{ t: 0.6, name: 'release' }],
};

export const RANGED: Clip[] = [specialWeak, mindStrong, beam, specialStrong, spit, spitStrong, storm, drain, orb, throwing, sound];
