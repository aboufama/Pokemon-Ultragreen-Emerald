// Zigzagoon's ranged moves, in the style of the first clips (./set.ts has
// the helpers and the notes on how it moves). Everything leaves its small
// mouth with the head driven at the foe (Blaziken's special_weak and
// special_strong beats: a breath in or a gather, a snap, the release with a
// moving hold, a recoil, a settle), except Swift, flicked off its big zigzag
// tail, and Mud-Slap, scooped with a forepaw. Fired from home.
//
// Staying clear of the healthboxes (tools/gauntlet/uiclear.mjs): as the foe
// its paws stand on the top edge of our healthbox, so its head drives out
// level at us rather than down in front of its paws.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, FIERCE, OPEN_EYES, SHUT, PAWS_DOWN, REAR, bend, ears, jaw, key, legs, pelvis, root, rump, snap, tail, turn,
} from './set';

/** Fur on end: the whole body puffed up a little. */
const bristle = (s: number): Pose => ({ scale: s });
/** Reared up, the forepaws held up in front of its chest. */
const PAWS_UP = legs([0.15, -0.3, 0.94], [0.05, 0.4, 0.92]);
/** Reared up, the forepaws raised as high as its short legs go. */
const PAWS_HIGH = legs([0.3, 0.1, 0.95], [0.2, 0.7, 0.69]);

/**
 * Water Pulse, Pin Missile (and Toxic, spat): after Blaziken's special_weak.
 * A quick breath with its chest up and its head back, then the head snaps
 * out at the foe, mouth wide, the body braced; the shot leaves its mouth,
 * the head bobs back as the mouth closes, and it settles.
 */
const spit: Clip = {
  name: 'spit',
  duration: 1.2,
  keys: [
    key(0),
    // Breath in: the front half rises, chest up, head back, the tail lifting.
    key(0.24, pelvis(0, 0.012, -0.025), bend(-13, -4, -6, -16), rump(-6), tail(18, 0, 6), ears(-8), bristle(1.02), ANGRY),
    // Spit: the head snaps out at the foe, mouth wide, the body lunging in behind it, the tail flicking up.
    snap(0.34, pelvis(0, -0.03, 0.045), bend(4, 2, 0, -2), jaw(30), rump(8), tail(26, 0, 10), ears(-28), ANGRY),
    // Recoil: the head bobs back up as the mouth closes.
    key(0.5, pelvis(0, -0.018, 0.02), bend(1, 1, 0, -8), jaw(14), rump(4), tail(14, 0, 4), ears(-18), ANGRY),
    key(0.7, pelvis(0, -0.006, 0.005), bend(1, 0, 0, -3), jaw(3), tail(6), ears(-8), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/**
 * Ice Beam (Hyper Beam): after Blaziken's special_strong. It settles, then
 * rises with its chest out and its face to the sky, eyes shut, tail up and
 * fur on end while the cold gathers at its mouth; it snaps its head out
 * level at the foe, braced low on all four paws, and holds the beam against
 * the recoil with a tremor; then it shuts its mouth and shakes the cold off.
 */
const beam: Clip = {
  name: 'beam',
  duration: 2.3,
  keys: [
    key(0),
    // Settle before drawing breath.
    key(0.14, pelvis(0, -0.02), bend(3, 0, 0, 6), rump(2), tail(4)),
    // The gather: it rises, face to the sky, eyes shut, the tail up and the fur on end.
    key(0.52, pelvis(0, 0.012, -0.02), bend(-12, -4, -8, -20), rump(-6), tail(26, 0, 10), ears(-10), bristle(1.03), SHUT),
    // Holding at the top, still swelling.
    key(0.66, pelvis(0, 0.016, -0.022), bend(-13, -4, -9, -22, 0, 2), rump(-6), tail(28, 0, 12), ears(-12), bristle(1.04), SHUT),
    // Fire: the head drives out level at the foe, mouth wide, braced low on all fours.
    snap(0.78, pelvis(0, -0.04, 0.03), bend(6, 3, -2, -4), jaw(34), rump(8), tail(12), ears(-34), bristle(1.02), FIERCE),
    // Sustain: the recoil shoves it back; a tremor, the head held steady.
    key(1.0, pelvis(0, -0.036, 0.022), root({ z: -0.015 }), bend(5, 3, -2, -4, 3), jaw(32), rump(8), tail(12, 4), ears(-34), FIERCE),
    key(1.22, pelvis(0, -0.04, 0.026), root({ z: -0.025 }), bend(6, 3, -2, -5, -3, -2), jaw(34), rump(9), tail(13, -4), ears(-34), FIERCE),
    key(1.44, pelvis(0, -0.036, 0.022), root({ z: -0.03 }), bend(5, 3, -2, -4, 2, 1), jaw(32), rump(8), tail(12, 3), ears(-34), FIERCE),
    key(1.62, pelvis(0, -0.038, 0.024), root({ z: -0.032 }), bend(6, 3, -2, -5), jaw(33), rump(8), tail(12), ears(-32), FIERCE),
    // Mouth shut; the head comes up and shakes the cold off.
    key(1.8, pelvis(0, -0.015), root({ z: -0.02 }), bend(2, 0, 0, -6, 8, 4), jaw(4), rump(3), tail(10, 8), ears(-16), ANGRY),
    key(1.96, pelvis(0, -0.008), root({ z: -0.01 }), bend(1, 0, 0, -3, -7, -3), rump(1), tail(8, -6), ears(-10), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Icy Wind (and Blizzard): after Sceptile's breath. A big breath, its chest
 * puffing up and its head back, then it blows: the head snaps out, mouth
 * wide, and sweeps the cold wind across the field from its right to its
 * left; it shuts its mouth and shivers.
 */
const breath: Clip = {
  name: 'breath',
  duration: 1.9,
  keys: [
    key(0),
    // A big breath: the chest puffs up, the head goes back, the tail rises.
    key(0.24, pelvis(0, 0.012, -0.02), bend(-10, -4, -6, -16), rump(-4), tail(18, 0, 6), ears(-6), bristle(1.02), SHUT),
    key(0.42, pelvis(0, 0.016, -0.024), bend(-12, -4, -7, -18, 0, 2), rump(-5), tail(22, 0, 8), ears(-8), bristle(1.035), SHUT),
    // The blow: the head snaps out, mouth wide, the front half turned to its right...
    snap(0.52, pelvis(-0.008, -0.03, 0.025), bend(5, 2, 0, -4, -14, -6), turn(-12, -4), jaw(30), rump(6, -8), tail(10, 14), ears(-30), bristle(1.01), FIERCE),
    // ...and sweeps the wind across the field to its left.
    key(0.76, pelvis(0, -0.032, 0.026), bend(5, 2, 0, -4, 2, 1), turn(-1), jaw(32), rump(6), tail(10, 0), ears(-30), FIERCE),
    key(1.0, pelvis(0.008, -0.03, 0.024), bend(5, 2, 0, -4, 16, 6), turn(12, 4), jaw(30), rump(6, 8), tail(10, -16), ears(-30), FIERCE),
    key(1.16, pelvis(0.004, -0.03, 0.022), bend(5, 2, 0, -5, 8, 3), turn(6, 2), jaw(24), rump(6, 4), tail(10, -8), ears(-28), FIERCE),
    // Mouth shut; a shiver shakes the cold off.
    key(1.32, pelvis(0, -0.012), bend(2, 0, 0, -6, -8, -5), jaw(3), rump(2), tail(10, 8), ears(-14), SHUT),
    key(1.46, pelvis(0, -0.008), bend(1, 0, 0, -4, 7, 4), rump(1), tail(8, -6), ears(-10), SHUT),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.58, name: 'release' }, { t: 1.22, name: 'releaseEnd' }],
};

/**
 * Shadow Ball, Hidden Power: the orb gathers between its open jaws, head
 * low, the body tense and the fur rising; it swings its head back and up
 * with it, then whips it forward and flings the orb at the foe, the head
 * carrying on down after it.
 */
const orb: Clip = {
  name: 'orb',
  duration: 1.7,
  keys: [
    key(0),
    // Head low, mouth opening: the orb gathers between its jaws.
    key(0.2, pelvis(0, -0.03, -0.01), bend(5, 2, 4, 6), jaw(16), rump(6), tail(14), ears(-16), FIERCE),
    key(0.4, pelvis(0, -0.04, -0.012), bend(6, 2, 4, 8, 0, 2), jaw(26), rump(8), tail(18, 0, 6), ears(-22), bristle(1.02), FIERCE),
    key(0.58, pelvis(0, -0.044, -0.014), bend(6, 2, 4, 9, 0, -2), jaw(28), rump(9), tail(20, 0, 8), ears(-24), bristle(1.03), FIERCE),
    // The wind-up: the head swings back and up with the orb, the body rearing a little.
    key(0.72, pelvis(0, -0.01, -0.03), bend(-10, -4, -8, -20), jaw(28), rump(-2), tail(26, 0, 10), ears(-14), bristle(1.03), FIERCE),
    // The fling: the head whips forward, flinging the orb at the foe.
    snap(0.82, pelvis(0, -0.035, 0.03), bend(6, 3, 2, 2), jaw(34), rump(10), tail(6), ears(-34), ANGRY),
    // Follow-through: the head carries on down, then recovers.
    key(0.98, pelvis(0, -0.036, 0.026), bend(7, 3, 3, 5), jaw(20), rump(10), tail(4), ears(-30), ANGRY),
    key(1.18, pelvis(0, -0.015, 0.008), bend(2, 1, 1, 0), jaw(4), rump(3), tail(8), ears(-14), ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'charge' }, { t: 0.88, name: 'release' }],
};

/**
 * Thunderbolt, Shock Wave, Thunder Wave: it hunkers down with its eyes shut
 * and its tail snapping up stiff, trembling as the charge builds and its fur
 * stands on end; then it springs up tall and thrusts its head at the foe,
 * mouth open, and the bolt leaps from it; a last shudder, and the fur
 * settles.
 */
const bolt: Clip = {
  name: 'bolt',
  duration: 1.6,
  keys: [
    key(0),
    // Hunkers down, eyes shut, the tail up stiff: the charge crackles through its fur.
    key(0.16, pelvis(0, -0.05, -0.015), bend(6, 2, 4, 10), rump(8), tail(34, 0, 12), ears(-30), bristle(1.02), SHUT),
    // Trembling as it builds, the fur standing on end.
    key(0.26, pelvis(0.006, -0.055, -0.015), bend(6, 2, 4, 10, 0, 3), turn(2, 3), rump(9, 3), tail(36, 4, 12), ears(-32), bristle(1.035), SHUT),
    key(0.36, pelvis(-0.006, -0.058, -0.016), bend(7, 2, 4, 11, 0, -3), turn(-2, -3), rump(9, -3), tail(37, -4, 12), ears(-32), bristle(1.045), SHUT),
    key(0.46, pelvis(0.005, -0.06, -0.018), bend(7, 2, 4, 11, 0, 3), turn(2, 3), rump(10, 3), tail(38, 4, 12), ears(-34), bristle(1.05), SHUT),
    // The release: up tall, the head thrust at the foe, mouth open; the bolt leaps from it.
    snap(0.56, pelvis(0, -0.01, 0.03), bend(-6, -2, -4, -6), jaw(28), rump(2), tail(40, 0, 14), ears(-36), bristle(1.05), FIERCE),
    key(0.72, pelvis(0.004, -0.014, 0.03), bend(-6, -2, -4, -6, 3, 2), jaw(30), rump(2), tail(40, 3, 14), ears(-36), bristle(1.045), FIERCE),
    key(0.88, pelvis(-0.004, -0.016, 0.028), bend(-5, -2, -4, -5, -3, -2), jaw(26), rump(2), tail(38, -3, 14), ears(-34), bristle(1.04), FIERCE),
    // The fur settles, the tail comes down.
    key(1.08, pelvis(0, -0.012, 0.01), bend(1, 0, 0, -2), jaw(4), rump(2), tail(16, 0, 6), ears(-14), bristle(1.01), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.62, name: 'release' }],
};

/**
 * Thunder: summoned from the sky. It hunkers down gathering the charge,
 * then rears its front half up and howls at the sky, forepaws up and the
 * tail stiff as a lightning rod; as the bolt comes down on the foe it
 * slams its forepaws down and its head snaps down to glare at it.
 */
const erupt: Clip = {
  name: 'erupt',
  duration: 1.9,
  keys: [
    key(0),
    // Gathering the charge, hunched, eyes shut, fur on end.
    key(0.2, pelvis(0, -0.05, -0.02), bend(8, 2, 4, 10), rump(8), tail(30, 0, 10), ears(-30), bristle(1.02), SHUT),
    key(0.36, pelvis(0, -0.055, -0.024), bend(9, 2, 4, 11, 0, 2), rump(9), tail(32, 0, 12), ears(-32), bristle(1.035), SHUT),
    // Rears up and howls at the sky, the tail stiff as a lightning rod.
    key(0.56, ...REAR, PAWS_UP, bend(8, 0, -14, -40), jaw(26), tail(44, 0, 16), ears(-10), bristle(1.04), FIERCE),
    key(0.7, ...REAR, PAWS_UP, bend(9, 0, -14, -42, 0, 3), jaw(30), tail(46, 0, 16), ears(-12), bristle(1.045), FIERCE),
    // The strike: the forepaws slam down and the head snaps down to glare at the foe.
    snap(0.82, PAWS_DOWN, pelvis(0, -0.045, 0.02), bend(8, 2, 0, -4), jaw(10), rump(8), tail(30, 0, 10), ears(-34), bristle(1.03), FIERCE),
    key(1.0, PAWS_DOWN, pelvis(0, -0.042, 0.018), bend(7, 2, 0, -4, 3, 2), jaw(6), rump(8), tail(30, 3, 10), ears(-34), bristle(1.03), FIERCE),
    key(1.2, PAWS_DOWN, pelvis(0, -0.04, 0.016), bend(7, 2, 0, -4, -3, -2), jaw(4), rump(7), tail(28, -3, 10), ears(-30), bristle(1.02), FIERCE),
    key(1.45, pelvis(0, -0.012, 0.006), bend(2, 0, 0, -1), rump(2), tail(12), ears(-10), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.86, name: 'release' }],
};

/**
 * Surf: it rears up tall on its haunches with its forepaws raised high as
 * the water rises behind it, then drops forward onto its forepaws with a
 * shove of its whole body: the wave rolls out from its feet at the foe.
 */
const wave: Clip = {
  name: 'wave',
  duration: 1.8,
  keys: [
    key(0),
    // Weight back, gathering.
    key(0.22, pelvis(0, -0.05, -0.03), bend(8, 2, 0, -6), rump(8), tail(16), ears(-20), FIERCE),
    // Rears up tall on its haunches, forepaws raised high (the wave rising).
    key(0.48, ...REAR, PAWS_HIGH, bend(-10, -2, 0, -6), tail(30, 0, 12), jaw(14), ears(-8), FIERCE),
    key(0.62, ...REAR, PAWS_HIGH, bend(-11, -2, 0, -7, 0, 2), tail(32, 0, 12), jaw(16), ears(-10), FIERCE),
    // The shove: down onto its forepaws, its whole body driving at the foe.
    snap(0.74, PAWS_DOWN, pelvis(0, -0.05, 0.045), bend(10, 4, 0, -4), rump(12), tail(8), jaw(22), ears(-34), ANGRY),
    key(0.94, PAWS_DOWN, pelvis(0, -0.052, 0.042), bend(11, 4, 0, -5, 0, 2), rump(12), tail(6), jaw(16), ears(-32), ANGRY),
    key(1.2, pelvis(0, -0.018, 0.012), bend(3, 1, 0, -2), rump(4), tail(10), jaw(3), ears(-12), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'release' }],
};

/** The right forepaw reaching out ahead to the ground (to scoop the mud), the left braced under it. */
const SCOOP_REACH = legs([0.1, -0.9, 0.3], [0.05, -0.95, 0.2], [-0.12, -0.7, 0.7], [-0.05, -0.95, 0.3]);
/** ... dragged back under its chest with the mud. */
const SCOOP_BACK = legs([0.1, -0.9, 0.3], [0.05, -0.95, 0.2], [-0.12, -0.92, -0.37], [-0.05, -0.6, -0.8]);
/** ... flicked forward and up at the foe, the mud flying. */
const SCOOP_FLICK = legs([0.1, -0.9, 0.3], [0.05, -0.95, 0.2], [-0.15, -0.2, 0.97], [-0.1, 0.45, 0.89]);
/** ... the flick carried on up. */
const SCOOP_UP = legs([0.1, -0.9, 0.3], [0.05, -0.95, 0.2], [-0.15, 0.05, 0.99], [-0.1, 0.62, 0.78]);

/**
 * Mud-Slap: after Blaziken's fling, with a forepaw. Its weight goes back
 * and the right forepaw reaches out to the mud, drags a clod of it back
 * under its chest, then flicks it forward and up at the foe's face; the paw
 * hangs up there a moment and comes down.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.2,
  keys: [
    key(0),
    // The right forepaw reaches out to the mud, weight shifting back.
    key(0.16, pelvis(0.01, -0.04, -0.02), bend(8, 2, 2, 6), turn(-6), SCOOP_REACH, rump(6), tail(12), ears(-18), FIERCE),
    // It scoops the mud back under its chest.
    key(0.28, pelvis(0.012, -0.05, -0.03), bend(10, 2, 2, 8), turn(-10), SCOOP_BACK, rump(8), tail(14), ears(-22), FIERCE),
    // Flicks it forward and up at the foe.
    snap(0.38, pelvis(0.006, -0.03, 0.02), bend(0, 0, 0, -4), turn(8), SCOOP_FLICK, rump(4), tail(8), ears(-30), ANGRY),
    key(0.52, pelvis(0.006, -0.03, 0.018), bend(0, 0, 0, -5), turn(9), SCOOP_UP, rump(4), tail(8), ears(-28), ANGRY),
    // The paw comes down again.
    key(0.72, pelvis(0, -0.015, 0.006), bend(2, 0, 0, -2), PAWS_DOWN, tail(6), ears(-14), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'release' }],
};

/**
 * Swift: a flick of its big zigzag tail. The rump swings away with the tail
 * drawn low and back, then the rump whips round and the tail snaps up and
 * over, spraying the stars at the foe; the tail carries on over and springs
 * back.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.25,
  keys: [
    key(0),
    // Wind-up: the rump swings away, the tail drawn low and back.
    key(0.2, pelvis(0, -0.04, -0.01), bend(4, 0, 0, -6), turn(-8), rump(-6, -14), tail(-14, -24, -6), ears(-16), FIERCE),
    key(0.28, pelvis(0, -0.045, -0.012), bend(5, 0, 0, -6), turn(-9), rump(-7, -16), tail(-16, -28, -8), ears(-18), FIERCE),
    // The flick: the rump whips round and the tail snaps up and over, spraying the stars.
    snap(0.36, pelvis(0, -0.02, 0.01), bend(0, 0, 0, -8), turn(8), rump(8, 14), tail(48, 22, 20), ears(-26), ANGRY),
    // Follow-through: the tail carries on over, then springs back.
    key(0.5, pelvis(0, -0.02, 0.01), bend(0, 0, 0, -8), turn(9), rump(9, 16), tail(56, 26, 24), ears(-24), ANGRY),
    key(0.74, pelvis(0, -0.01), bend(1, 0, 0, -3), turn(2), rump(2, 4), tail(18, 6, 6), ears(-12), ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'release' }],
};

/** The ranged clips, by the motif they show. */
export const RANGED_CLIPS: Record<string, Clip> = Object.fromEntries(
  [spit, beam, breath, orb, bolt, erupt, wave, fling, throwing].map((c) => [c.name, c]),
);

export { bristle, PAWS_UP, PAWS_HIGH };
