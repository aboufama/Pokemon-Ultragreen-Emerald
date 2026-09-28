// Torchic's clips for the actions Blaziken's more.ts adds to its first clips
// (Protect, Rest, Sunny Day, Attract and Swagger, Overheat, Swift and the
// rock throws, Body Slam, Earthquake), and Fire Blast's one big blast, made
// the same way with the set's own helpers (./set.ts), each named after its
// motif.

import type { Clip } from '../../anim/clip';
import {
  ANGRY, BRACED, DROWSY, FOLDED, GUARD, HAPPY, HOP, LAND, LAND_DEEP, OPEN_EYES, SHUT, SPREAD, TUCK,
  bend, crest, fall, jaw, key, legs, pelvis, root, snap, stay, tail, twist, wings,
} from './set';

/**
 * Protect, Detect, Endure, Substitute (shield): a flinch back, then it
 * hunkers down behind its wing tufts swept forward over its chest, crest
 * laid back, and holds there trembling while the barrier forms; then pops
 * back up into its guard.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    // A flinch back, the wing tufts drawing in.
    key(0.14, pelvis(0, 0.006), bend(-6, -3, -4), wings(-6, -6), ANGRY),
    // The guard: hunkered low behind its wing tufts swept forward.
    snap(0.28, pelvis(0, -0.036), bend(12, 5, -12), wings(14, 34), crest(-6), tail(4), ANGRY),
    key(0.46, pelvis(0, -0.038), bend(13, 5, -12, 0, 1.5), wings(15, 35), crest(-7), tail(4), ANGRY),
    key(0.66, pelvis(0, -0.037), bend(12, 5, -12, 0, -1.5), wings(14, 36), crest(-6), tail(4), ANGRY),
    key(0.86, pelvis(0, -0.039), bend(13, 5, -12, 0, 1), wings(15, 35), crest(-7), tail(4), ANGRY),
    // Guard down.
    key(1.1, pelvis(0, -0.014), bend(4, 1, -6), GUARD, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/** Sat down on its heels (Rest): the legs folded under it, the feet where they stand. */
const SIT = legs([[0.03, -0.35, -0.94], [0.02, -0.5, 0.87]], [[-0.03, -0.35, -0.94], [-0.02, -0.5, 0.87]]);

/**
 * Rest (heal): it lets go with a yawn, sits down onto its heels with its
 * wing tufts folded and eyes shut, breathes slowly in and out as it dozes,
 * and gets back up.
 */
const heal: Clip = {
  name: 'heal',
  duration: 1.9,
  keys: [
    key(0),
    // Letting go: a yawn, the head tipping back, the eyes drooping.
    key(0.3, pelvis(0, -0.01), bend(-4, -3, -8), wings(-6, 4), jaw(26), DROWSY),
    // Down onto its heels, eyes shut.
    key(0.64, pelvis(0, -0.06), SIT, bend(8, 3, 8, 0, 6), FOLDED, crest(-10), jaw(2), SHUT),
    // A slow breath in (the chest rises) and out.
    key(0.98, pelvis(0, -0.054), SIT, bend(4, 1, 6, 0, 5), wings(-16, 10), crest(-8), SHUT),
    key(1.34, pelvis(0, -0.062), SIT, bend(9, 3, 9, 0, 7), FOLDED, crest(-11), SHUT),
    // Back up.
    key(1.62, pelvis(0, -0.018), bend(4, 1, -4), GUARD, DROWSY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'aura' }],
};

/**
 * Sunny Day (weather): it gathers itself, then throws its chest open and
 * turns its face up to the sky, wing tufts flung wide and crest standing,
 * and chirps, swaying slowly while the sun comes out.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    key(0.26, pelvis(0, -0.03), bend(10, 3, 4), FOLDED, crest(-8), SHUT),
    // Open to the sky.
    snap(0.5, pelvis(0, 0.014), bend(-12, -8, -14), SPREAD, crest(20, 10), tail(-12), jaw(22), HAPPY),
    key(0.72, pelvis(0, 0.016), bend(-13, -8, -15, 5, 4), wings(32, -4), crest(21, 10), tail(-12), jaw(16), HAPPY),
    key(0.94, pelvis(0, 0.012), bend(-12, -9, -14, -5, -4), SPREAD, crest(20, 11), tail(-13), jaw(20), HAPPY),
    key(1.14, pelvis(0, 0.014), bend(-11, -8, -12, 2, 1), wings(26, -4), crest(18, 10), tail(-10), jaw(8), HAPPY),
    // Back down to its guard.
    key(1.4, pelvis(0, -0.014), bend(4, 1, -5), GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/**
 * Attract, Swagger (charm): chest puffed out and head cocked, it bobs at the
 * foe twice with a flutter of its wing tufts and a wink, pleased with
 * itself, then drops back into its guard.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.55,
  keys: [
    key(0),
    // Chest out, head cocked.
    key(0.22, pelvis(0, 0.01), bend(-8, -5, -2, 0, 12), wings(12, -10), tail(-10, 8), HAPPY),
    // A bob and a flutter.
    snap(0.36, pelvis(0, -0.012), bend(-4, -3, 0, 0, 16), wings(30, 4), tail(-12, -8), HAPPY),
    key(0.5, pelvis(0, 0.01), bend(-8, -5, -2, 0, 12), wings(10, -8), tail(-10, 8), HAPPY),
    snap(0.64, pelvis(0, -0.012), bend(-4, -3, 0, 0, 16), wings(30, 4), tail(-12, -8), HAPPY),
    // Holds it, smug.
    key(0.86, pelvis(0, 0.008), bend(-8, -5, -3, 5, 13), wings(12, -6), tail(-10, 6), HAPPY),
    key(1.14, pelvis(0, -0.01), bend(4, 1, -4), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

/**
 * Overheat (burst): it curls in tight around the fire in its belly,
 * trembling as the heat builds, then bursts open with everything: wing
 * tufts flung wide, head thrown back, beak wide; it holds the blast, then
 * slumps, spent.
 */
const burst: Clip = {
  name: 'burst',
  duration: 2.3,
  keys: [
    key(0),
    // Curling in around the heat.
    key(0.3, pelvis(0, -0.04), bend(16, 6, 6), FOLDED, crest(-14), tail(8), SHUT),
    key(0.52, pelvis(0, -0.046), bend(18, 6, 7, 0, 1.5), wings(-22, 14), crest(-16), tail(9), SHUT),
    key(0.7, pelvis(0, -0.05), bend(19, 7, 7, 0, -1.5), wings(-23, 14), crest(-17), tail(9), SHUT),
    // The burst.
    snap(0.84, pelvis(0, 0.016), bend(-12, -7, -10), wings(38, -6), crest(20, 12), tail(-16), jaw(36), ANGRY),
    key(1.06, pelvis(0, 0.018), bend(-13, -7, -10, 0, 2), wings(36, -4), crest(20, 12), tail(-16), jaw(34), ANGRY),
    key(1.28, pelvis(0, 0.014), bend(-12, -8, -10, 0, -2), wings(38, -6), crest(19, 11), tail(-15), jaw(36), ANGRY),
    key(1.46, pelvis(0, 0.008), bend(-7, -4, -6), wings(20, -4), crest(10, 6), jaw(22), ANGRY),
    // Spent: it slumps forward, panting.
    key(1.72, pelvis(0, -0.03), bend(12, 4, 4), wings(-10, 6), crest(-6), tail(6), jaw(14), DROWSY),
    key(1.96, pelvis(0, -0.024), bend(9, 3, 2), wings(-6, 4), crest(-4), tail(4), jaw(6), DROWSY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.88, name: 'release' }, { t: 1.5, name: 'releaseEnd' }],
};

/**
 * Swift, Rock Tomb, Rock Slide (throw): a flick of the head. It winds away,
 * the head drawn back to one side, then unwinds and whips its head round at
 * the foe, the beak opening as the stars fly from it (emitterFor throw: the
 * rocks fall on the foe from above), and carries through.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: turned away, the head drawn back to its right.
    key(0.2, pelvis(-0.006, -0.026), bend(4, 1, -12, -22, -8), twist(-18, -6), wings(16, -18), ANGRY),
    key(0.3, pelvis(-0.008, -0.03), bend(5, 1, -13, -24, -9), twist(-20, -6), wings(14, -20), ANGRY),
    // The flick: the body unwinds, the head whips round at the foe, beak opening.
    snap(0.38, pelvis(0.006, -0.02), bend(10, 4, -14, 12, 6), twist(16, 0), wings(22, 6), jaw(26), ANGRY),
    // Carried through.
    key(0.56, pelvis(0.008, -0.024), bend(12, 4, -14, 22, 8), twist(20, 0), wings(12, 8), jaw(10), ANGRY),
    key(0.8, pelvis(0, -0.014), bend(4, 1, -6), GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'release' }],
};

/** In the air belly first, tipped over the foe: wing tufts spread, feet trailing. */
const FLOP = legs([[0.04, -0.45, -0.89], [0.02, -0.2, -0.98]], [[-0.04, -0.45, -0.89], [-0.02, -0.2, -0.98]]);

/**
 * Body Slam (slam): a deep coil, then a big leap up over the foe; at the top
 * it tips forward with its wing tufts spread and comes down on it belly
 * first with its whole round weight, bounces off, lands deep and hops home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.0,
  keys: [
    key(0),
    // Coil.
    key(0.28, pelvis(0, -0.042), bend(14, 5, -19), wings(10, -22), ANGRY),
    // Spring up and in.
    key(0.48, { advance: 0.5 }, root({ y: 0.34 }), TUCK, bend(-6, -2, -2), wings(30, -6), ANGRY),
    // The top: tipping forward over the foe, wing tufts spread.
    key(0.64, { advance: 0.88 }, root({ y: 0.42, pitch: 26 }), FLOP, { plantFeet: 0 }, bend(-12, -4, -14), wings(36, -2), crest(6), ANGRY),
    // Down on it with its whole weight.
    snap(0.76, { advance: 1 }, root({ y: 0.26, pitch: 44 }), FLOP, { plantFeet: 0 }, bend(-16, -6, -18), wings(30, 6), jaw(16), ANGRY),
    key(0.84, { advance: 1 }, root({ y: 0.22, pitch: 46 }), FLOP, { plantFeet: 0 }, bend(-17, -6, -18), wings(28, 8), jaw(12), ANGRY),
    // Bounces off it.
    key(0.98, { advance: 0.9 }, root({ y: 0.2, pitch: 14 }), HOP, bend(-4, -2, -6), wings(22, -4), ANGRY),
    // Lands in front of it, deep in the knees.
    fall(1.14, { advance: 0.86 }, LAND_DEEP, bend(6, 2, -8), GUARD, ANGRY),
    key(1.34, { advance: 0.86 }, pelvis(0, -0.02), bend(4, 1, -5), GUARD, ANGRY),
    // Hop home.
    key(1.5, { advance: 0.42 }, root({ y: 0.1 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.64, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/**
 * Earthquake, Magnitude (quake, for a move Mimic or Mirror Move calls): it
 * draws its right foot up high under its belly, leaning back, then stamps it
 * down with all its weight and sinks deep while the ground shakes; it holds
 * there, then rises.
 */
const quake: Clip = {
  name: 'quake',
  duration: 1.8,
  keys: [
    key(0),
    // Weight onto the left leg, the right foot coming up.
    key(0.2, { plantLeft: 1, plantRight: 0 }, pelvis(0.01, -0.016), legs([[0, -0.935, -0.355], [0, -0.98, 0.2]], [[-0.04, -0.3, 0.95], [-0.02, -0.85, 0.53]]), bend(4, 1, -2), wings(12, -8), ANGRY),
    // The foot at its highest, leaning back to load the stamp.
    key(0.42, { plantLeft: 1, plantRight: 0 }, pelvis(0.014, 0.002), legs([[0, -0.935, -0.355], [0, -0.98, 0.2]], [[-0.04, 0.1, 0.99], [-0.02, -0.7, 0.71]]), bend(-6, -2, 6), wings(24, -10), crest(6), ANGRY),
    // The stamp: the foot driven into the ground, the whole weight after it.
    snap(0.54, pelvis(0, -0.05), bend(16, 6, -8), BRACED, crest(-6), jaw(24), ANGRY),
    key(0.68, pelvis(0, -0.054), bend(17, 6, -8, 0, 2), BRACED, crest(-7), jaw(28), ANGRY),
    // Holding it while the ground shakes.
    key(0.9, pelvis(0, -0.05), bend(16, 5, -8, 0, -2), BRACED, crest(-6), jaw(16), ANGRY),
    key(1.1, pelvis(0, -0.046), bend(15, 5, -8, 0, 1), BRACED, crest(-5), jaw(8), ANGRY),
    // Rising out of it.
    key(1.38, pelvis(0, -0.018), bend(5, 1, -6), GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'impact' }],
};

/**
 * Fire Blast (spit_strong): one huge blast, where Ember is a quick spit. It
 * heaves the fire up from its belly with a big breath, swelling up tall
 * with its eyes shut and its wing tufts drawn back, then throws its whole
 * body forward and blasts it from the beak open wide; the recoil rocks it
 * back on its heels and it shakes off the heat.
 */
const spitStrong: Clip = {
  name: 'spit_strong',
  duration: 1.7,
  keys: [
    key(0),
    // Settle, then the big breath: the belly heaving, rising tall, head back, eyes shut.
    key(0.12, pelvis(0, -0.02), bend(6, 2, 0), wings(-4, 6)),
    key(0.42, pelvis(0, 0.018), bend(-12, -8, -10), wings(24, -24), crest(12), tail(-8), SHUT),
    key(0.54, pelvis(0, 0.02), bend(-13, -9, -11, 0, 2), wings(26, -26), crest(13), tail(-9), SHUT),
    // The blast: the whole body thrown forward, the beak wide.
    snap(0.64, pelvis(0, -0.034, 0.03), stay(0.03), bend(16, 8, -16), BRACED, crest(-4), jaw(38), ANGRY),
    // The recoil rocks it back on its heels.
    key(0.8, pelvis(0, -0.02, -0.02), stay(-0.02), bend(-4, -2, -10), wings(14, -8), jaw(26), ANGRY),
    key(0.96, pelvis(0, -0.026, -0.006), bend(4, 1, -8), wings(6, -4), jaw(10), ANGRY),
    // Shakes off the heat.
    key(1.14, pelvis(0, -0.012), bend(2, 1, -6, 7), GUARD, jaw(3), ANGRY),
    key(1.28, pelvis(0, -0.008), bend(1, 0, -4, -6), GUARD, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.69, name: 'release' }],
};

/** The clips for the actions Blaziken's more.ts adds, by the motif they show. */
export const TORCHIC_MORE: Record<string, Clip> = Object.fromEntries(
  [shield, heal, weather, charm, burst, throwing, slam, quake, spitStrong].map((c) => [c.name, c]),
);

