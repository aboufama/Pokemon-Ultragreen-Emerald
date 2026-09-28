// Poochyena's clips from home: the ranged moves (its power comes out of its
// jaws: the dark orb, the beam, the snore; Mud-Slap is flicked off a forepaw)
// and the status moves, each in the shape of the first clip that does its
// action (Blaziken's special_weak, special_strong, fling, status_target,
// status_target_kick, status_self and more.ts's shield, heal, weather and
// charm; afterimage): a gather or a breath in, a snap, the release with a
// moving hold, a recoil and a settle. Nothing travels (advance stays 0), and
// everything stays clear of the healthboxes: from our side the foe's box is
// above its ears and ours is off to its right.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, DROWSY, HAPPY, HOP, LAND, OPEN_EYES, REAR, SHUT,
  bend, ears, foreL, foreR, hackles, jaw, key, pelvis, root, snap, tail, twist,
} from './set-base';

// Ranged -------------------------------------------------------------------------

/**
 * Shadow Ball, Hidden Power (after Blaziken's special_weak, with a gather
 * from its special_strong): it settles low, head drawn in and jaws parted,
 * hackles rising while the dark orb gathers at its mouth (a trembling
 * hold); then the head drives forward and up and hurls it at the foe, the
 * body lunging after it; the head rides up on the follow-through and it
 * settles.
 */
const orb: Clip = {
  name: 'orb',
  duration: 1.5,
  keys: [
    key(0),
    // Settling low, the head coming down.
    key(0.16, pelvis(0, -0.03), bend(6, 2, 6, 6), jaw(6), hackles(10), tail(8), ANGRY),
    // Gathering: head drawn in, jaws parted, weight back, hackles rising.
    key(0.4, pelvis(0, -0.05, -0.04), bend(10, 4, 12, 10), jaw(20), ears(-14), hackles(22), tail(16), ANGRY),
    key(0.58, pelvis(0, -0.055, -0.045), bend(11, 4, 13, 11, 0, 3), jaw(24), ears(-16), hackles(26), tail(18), ANGRY),
    // The hurl: the head drives forward and up, the body lunging after it.
    snap(0.7, pelvis(0, 0.01, 0.05), bend(-8, -4, -16, -14), jaw(40), ears(-20), hackles(28), tail(24), ANGRY),
    // Follow-through: the head rides up, the jaws still wide.
    key(0.86, pelvis(0, 0.012, 0.045), bend(-9, -4, -18, -17), jaw(30), ears(-16), hackles(26), tail(22), ANGRY),
    // Recoil and settle.
    key(1.04, pelvis(0, -0.012), bend(2, 0, 2, 0), jaw(6), hackles(12), tail(10), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  // The head trails the body (overlap): the orb leaves the jaws just after the snap.
  events: [{ t: 0.12, name: 'charge' }, { t: 0.75, name: 'release' }],
};

/**
 * Hyper Beam (after Blaziken's special_strong; the breath, jet and storm moves
 * Mimic can call): it rears back drawing in power, eyes shut and jaws
 * clamped (a trembling hold); then braces low and wide and fires the beam
 * from its gaping jaws, pushed back by it (a moving hold, the head
 * sweeping), and sags, spent, before it settles.
 */
const beam: Clip = {
  name: 'beam',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 0, 2, 4)),
    // Drawing in power: reared back, head up, jaws clamped, eyes shut.
    key(0.5, pelvis(0, 0.01, -0.04), bend(-8, -2, -10, -16), jaw(-10), ears(-12), hackles(20), tail(20), SHUT),
    key(0.66, pelvis(0, 0.012, -0.045), bend(-9, -2, -11, -18, 0, 2), jaw(-10), ears(-14), hackles(24), tail(22), SHUT),
    // Fire: braced low and wide, the head driven forward, jaws gaping.
    snap(0.78, pelvis(0, -0.05, 0.03), bend(8, 2, 14, -4), jaw(40), ears(-24), hackles(30), tail(12), ANGRY),
    // Sustain: pushed back by the beam, the head sweeping a little.
    key(1.0, pelvis(0, -0.052, 0.018), bend(8, 2, 14, -4, 4), jaw(38), ears(-24), hackles(30), tail(10), ANGRY),
    key(1.22, pelvis(0, -0.055, 0.008), bend(9, 2, 15, -5, -4, -2), jaw(40), ears(-24), hackles(30), tail(10), ANGRY),
    key(1.44, pelvis(0, -0.052, 0), bend(8, 2, 14, -4, 3, 1), jaw(38), ears(-24), hackles(28), tail(9), ANGRY),
    key(1.62, pelvis(0, -0.054, -0.006), bend(8, 2, 14, -4), jaw(36), ears(-22), hackles(28), tail(8), ANGRY),
    // Spent: the jaws close, the head sags, panting.
    key(1.8, pelvis(0, -0.05, -0.01), bend(8, 4, 12, 12), jaw(8), ears(-16), hackles(10), tail(-6), DROWSY),
    key(1.98, pelvis(0, -0.042, -0.008), bend(7, 3, 10, 10, 0, 3), jaw(14), ears(-14), hackles(8), tail(-4), DROWSY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Snore (sound; after Blaziken's special_weak): asleep on its feet, eyes
 * shut, it slumps with its head drooping, draws a big breath (the chest and
 * head rising), then the head jerks forward and a huge snore blasts out of
 * its gaping jaws (a moving hold, the head wobbling); it slumps again and
 * stirs back into its stance.
 */
const sound: Clip = {
  name: 'sound',
  duration: 1.7,
  keys: [
    key(0),
    // Slumped asleep, the head drooping.
    key(0.2, pelvis(0, -0.05, -0.02), bend(8, 2, 14, 14), jaw(-8), ears(-10), hackles(-8), tail(-8), SHUT),
    // A big breath in: the chest and head rise.
    key(0.46, pelvis(0, -0.03, -0.03), bend(-4, -2, -8, -10), jaw(-10), ears(-12), hackles(-4), tail(-4), SHUT),
    key(0.58, pelvis(0, -0.028, -0.034), bend(-5, -2, -9, -11, 0, 2), jaw(-10), ears(-12), hackles(-4), tail(-3), SHUT),
    // The snore: the head jerks forward, the jaws gape.
    snap(0.68, pelvis(0, -0.04, 0.04), bend(6, 2, 10, -6), jaw(38), ears(8), hackles(6), tail(6), SHUT),
    key(0.86, pelvis(0, -0.042, 0.036), bend(6, 2, 10, -6, 0, 6), jaw(32), ears(6), hackles(6), tail(4), SHUT),
    key(1.02, pelvis(0, -0.044, 0.03), bend(6, 2, 11, -5, 0, -5), jaw(34), ears(4), hackles(4), tail(4), SHUT),
    // Slumping back, then stirring.
    key(1.2, pelvis(0, -0.05, -0.01), bend(8, 2, 12, 12), jaw(4), ears(-8), hackles(-4), tail(-4), SHUT),
    key(1.42, pelvis(0, -0.02), bend(3, 0, 4, 4), jaw(0), DROWSY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'release' }],
};

/** The left forepaw lifted and folded while the right one works. */
const LIFT_L = foreL(4, 36, 12);

/**
 * Mud-Slap (fling; after Blaziken's fling): it rocks back onto its hind legs,
 * head ducked to the ground, and digs its right forepaw into the mud ahead,
 * rakes it back under its chest, then flicks it forward and up at the foe
 * (the mud flies off the paw), the paw hanging high on the follow-through;
 * it drops back onto its forepaws with a snort.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.25,
  keys: [
    key(0),
    // Rocking back, head ducked, the right forepaw reaching into the mud ahead.
    key(0.16, REAR(8), foreR(-34, -4, 8), LIFT_L, bend(2, 2, 12, 14), ears(-8), hackles(10), tail(10), ANGRY),
    // The scoop: the paw rakes back under its chest.
    key(0.3, REAR(10), pelvis(0, 0, -0.02), foreR(22, 24, 30), LIFT_L, bend(2, 2, 14, 16), ears(-10), hackles(12), tail(12), ANGRY),
    // The flick: forward and up at the foe, the head coming up after it.
    snap(0.4, REAR(14), pelvis(0, 0, 0.03), foreR(-112, -10, -16), LIFT_L, bend(0, -2, -4, -6), jaw(10), ears(-14), hackles(16), tail(18), ANGRY),
    // Follow-through: the paw hangs high at the foe.
    key(0.54, REAR(14), pelvis(0, 0, 0.032), foreR(-120, -2, -10), LIFT_L, bend(0, -2, -6, -8), jaw(8), ears(-14), hackles(16), tail(18), ANGRY),
    // Down onto its forepaws, a snort.
    key(0.72, pelvis(0, -0.03), bend(4, 0, 2, 0, 5), jaw(4), ears(-6), hackles(10), tail(10), ANGRY),
    key(0.9, pelvis(0, -0.012), bend(2, 0, 0, 0, -3), jaw(0), hackles(6), tail(6), ANGRY),
    key(1.25, OPEN_EYES),
  ],
  // The mud leaves the paw on the flick (legs trail the chest a little).
  events: [{ t: 0.42, name: 'release' }],
};

// At the foe ------------------------------------------------------------------------

/**
 * Howl, Roar (after Blaziken's status_target): a breath in with the head
 * dipped and the jaws clamped, then the head is thrown up and back, jaws
 * wide, hackles and tail up, and it howls (a moving hold, the head
 * swaying), then lets it die away and settles.
 */
const roar: Clip = {
  name: 'roar',
  duration: 1.6,
  keys: [
    key(0),
    // A breath in: dipped, jaws clamped.
    key(0.2, pelvis(0, -0.03), bend(6, 2, 8, 8), jaw(-8), ears(-10), hackles(10), tail(6), ANGRY),
    // The howl: the head thrown up, jaws wide.
    snap(0.36, pelvis(0, 0.01, -0.01), bend(-8, -4, -26, -28), jaw(30), ears(-12), hackles(26), tail(24), SHUT),
    key(0.56, pelvis(0, 0.012, -0.012), bend(-8, -4, -27, -30, 4), jaw(34), ears(-12), hackles(28), tail(26), SHUT),
    key(0.78, pelvis(0, 0.012, -0.012), bend(-8, -4, -27, -30, -4, 2), jaw(32), ears(-12), hackles(28), tail(26), SHUT),
    key(0.98, pelvis(0, 0.008, -0.01), bend(-6, -3, -22, -24, 0, -2), jaw(24), ears(-10), hackles(24), tail(22), SHUT),
    // Dying away.
    key(1.16, pelvis(0, -0.012), bend(2, 0, 0, 0), jaw(6), ears(-4), hackles(14), tail(12), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/**
 * Leer, Scary Face, Taunt, Odor Sleuth, Torment, Snatch, Mimic (glare; after
 * Sceptile's glare): hackles up, the head drops low and pushes toward the
 * foe, ears flat, and it snarls with its fangs bared, a growl shaking its
 * head (a moving hold); then it relaxes into its stance.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.4,
  keys: [
    key(0),
    // Head down, hackles up, lips curling.
    key(0.2, pelvis(0, -0.04, 0.02), bend(8, 2, 14, -6), jaw(-14), ears(-26), hackles(24), tail(20), ANGRY),
    // The snarl: fangs bared, pushing its face at the foe.
    snap(0.32, pelvis(0, -0.045, 0.035), bend(9, 2, 16, -8), jaw(16), ears(-30), hackles(32), tail(24), ANGRY),
    // Growling (a moving hold, the head shaking).
    key(0.5, pelvis(0, -0.046, 0.036), bend(9, 2, 16, -8, 3, 3), jaw(12), ears(-30), hackles(32), tail(24), ANGRY),
    key(0.72, pelvis(0, -0.046, 0.034), bend(9, 2, 16, -8, -3, -3), jaw(18), ears(-30), hackles(32), tail(24), ANGRY),
    // Relaxing.
    key(0.92, pelvis(0, -0.015), bend(3, 0, 4, 0), jaw(2), ears(-8), hackles(12), tail(10), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** A hind leg raked back through the dirt (the scratch), the other standing. */
const SCRATCH_L: Pose = { plantLeft: 0, plantRight: 1, bones: { thighL: { x: 62 }, shinL: { x: 30 }, footL: { x: 44 } } };
const SCRATCH_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: 62 }, shinR: { x: 30 }, footR: { x: 44 } } };
/** Turned side-on with its rump to the foe (a hop round), looking back over its shoulder at it. */
const RUMP = 135;

/**
 * Sand-Attack (kick_sand; after Blaziken's status_target_kick): a hop round
 * to turn its rump on the foe, side-on, looking back at it over its
 * shoulder; the hind legs rake the dirt back at it in a dog's scratch, left,
 * right, left, right (the sand flies off the hind paws), and a hop back
 * round to face it again.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.7,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.04), bend(6, 2, 0, -2), ears(-8), hackles(10), tail(10), ANGRY),
    // A hop round, rump to the foe.
    key(0.28, root({ y: 0.08, yaw: RUMP * 0.5 }), HOP, bend(2, 0, 0, 0, -20), ears(-8), hackles(12), tail(16), ANGRY),
    key(0.4, root({ yaw: RUMP }), LAND, pelvis(0, -0.02, 0.02), bend(8, 2, 0, 0, -44), ears(-12), hackles(14), tail(24), ANGRY),
    // The scratch: the hind legs rake back in turn.
    key(0.5, root({ yaw: RUMP }), SCRATCH_L, pelvis(0, -0.02, 0.03), bend(10, 2, 0, 0, -46), ears(-14), hackles(16), tail(30), ANGRY),
    key(0.6, root({ yaw: RUMP }), SCRATCH_R, pelvis(0, -0.02, 0.03), bend(10, 2, 0, 0, -44), ears(-14), hackles(16), tail(32), ANGRY),
    key(0.7, root({ yaw: RUMP }), SCRATCH_L, pelvis(0, -0.02, 0.03), bend(10, 2, 0, 0, -46, 2), ears(-14), hackles(16), tail(30), ANGRY),
    key(0.8, root({ yaw: RUMP }), SCRATCH_R, pelvis(0, -0.02, 0.03), bend(10, 2, 0, 0, -44, -2), ears(-14), hackles(16), tail(32), ANGRY),
    key(0.92, root({ yaw: RUMP }), LAND, pelvis(0, -0.03, 0.01), bend(6, 2, 0, 0, -40), ears(-10), hackles(14), tail(20), ANGRY),
    // A hop back round to face it.
    key(1.06, root({ y: 0.08, yaw: RUMP * 1.6 }), HOP, bend(2, 0, 0, 0, -10), ears(-6), hackles(12), tail(14), ANGRY),
    key(1.18, root({ yaw: 360 }), LAND, hackles(8), tail(8), ANGRY),
    key(1.7, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'emit' }],
};

/**
 * Swagger, Attract (charm; after Blaziken's charm): a play-bow at the foe,
 * forelegs down and rump up, the tail wagging high and the head cocked,
 * then it bounces up into a cocky, chest-out pose, the tail still wagging;
 * it holds it, smug, then drops back into its stance.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.55,
  keys: [
    key(0),
    // The play-bow, tail wagging.
    key(0.2, pelvis(0, -0.03, -0.02), { bones: { spine: { x: 20 }, hips: { x: 8 } } }, bend(0, 0, -18, -14, 0, 12), jaw(8), ears(10), tail(40, 30), HAPPY),
    key(0.36, pelvis(0, -0.035, -0.022), { bones: { spine: { x: 22 }, hips: { x: 9 } } }, bend(0, 0, -19, -15, 0, 14), jaw(10), ears(10), tail(40, -30), HAPPY),
    key(0.5, pelvis(0, -0.03, -0.02), { bones: { spine: { x: 20 }, hips: { x: 8 } } }, bend(0, 0, -18, -14, 0, 12), jaw(8), ears(10), tail(40, 30), HAPPY),
    // Up into a cocky pose: chest out, head high and cocked.
    snap(0.64, pelvis(0, 0.012), bend(-10, -4, -14, -8, 0, -10), jaw(12), ears(8), hackles(14), tail(44, -24), HAPPY),
    key(0.84, pelvis(0, 0.014), bend(-11, -4, -15, -9, 0, -12), jaw(10), ears(8), hackles(14), tail(44, 24), HAPPY),
    key(1.02, pelvis(0, 0.012), bend(-10, -4, -14, -8, 0, -11), jaw(10), ears(6), hackles(12), tail(40, -20), HAPPY),
    key(1.2, pelvis(0, -0.01), bend(2, 0, 0, 0), jaw(2), hackles(6), tail(12), ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'emit' }],
};

// On itself ----------------------------------------------------------------------------

/**
 * Protect, Substitute, Endure (shield; after Blaziken's shield): a flinch
 * back, then it hunkers down low and braced, head tucked, ears flat, eyes
 * screwed shut and every hair bristling while the barrier forms (a
 * trembling hold); then it rises back into its stance.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    // A flinch back.
    key(0.14, pelvis(0, 0.004, -0.02), bend(-4, -2, -6, -6), ears(-14), hackles(10), ANGRY),
    // Hunkered down, braced, bristling.
    snap(0.28, pelvis(0, -0.08, -0.03), bend(10, 4, 16, 14), jaw(-12), ears(-34), hackles(30), tail(-18), SHUT),
    key(0.46, pelvis(0, -0.084, -0.03), bend(10, 4, 16, 14, 0, 2), jaw(-12), ears(-35), hackles(31), tail(-20), SHUT),
    key(0.66, pelvis(0, -0.082, -0.032), bend(11, 4, 17, 15, 0, -2), jaw(-12), ears(-35), hackles(31), tail(-19), SHUT),
    key(0.86, pelvis(0, -0.085, -0.03), bend(10, 4, 16, 14, 0, 1), jaw(-12), ears(-34), hackles(30), tail(-20), SHUT),
    // Rising.
    key(1.1, pelvis(0, -0.02), bend(3, 0, 4, 2), jaw(0), ears(-8), hackles(14), tail(2), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Rest (heal; after Blaziken's heal): the head drops, and it lies down on
 * the spot, curled with its head down on its forepaws and the tail round it,
 * eyes shut; a slow breath in and out while it sleeps; then it gets up.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.0,
  keys: [
    key(0),
    // Letting go: the head drops.
    key(0.3, pelvis(0, -0.06), bend(4, 2, 10, 14), ears(-10), hackles(-6), tail(-10), DROWSY),
    // Lying down curled up, eyes shut.
    key(0.62, pelvis(0, -0.2, -0.06), bend(8, 4, 20, 24), ears(-20), hackles(-12), tail(-20, 40), SHUT),
    // A slow breath in, and out.
    key(0.98, pelvis(0, -0.19, -0.06), bend(6, 3, 18, 22), ears(-20), hackles(-10), tail(-19, 40), SHUT),
    key(1.34, pelvis(0, -0.205, -0.062), bend(9, 4, 21, 25), ears(-21), hackles(-12), tail(-20, 42), SHUT),
    // Getting up.
    key(1.62, pelvis(0, -0.05), bend(4, 0, 2, 2), ears(-6), hackles(-2), tail(-4), DROWSY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/** Sat back on its haunches, chest up (the hind legs fold under it). */
const SIT = (deg: number): Pose => ({ pelvis: { y: -deg * 0.0035, z: -deg * 0.0028 }, bones: { spine: { x: -deg }, hips: { x: -deg } } });

/**
 * Sunny Day, Rain Dance (weather; after Blaziken's weather): it sits back on
 * its haunches, then throws its head up to the sky and barks at it twice,
 * holding the look up (a slow sway) while the weather comes; then it gets
 * back up into its stance.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    // Sitting back.
    key(0.24, SIT(16), bend(0, 0, 0, 2), ears(6), tail(-4), ANGRY),
    // The head up to the sky, a bark.
    snap(0.46, SIT(24), bend(0, 0, -24, -26), jaw(30), ears(8), hackles(10), tail(4), ANGRY),
    key(0.6, SIT(24), bend(0, 0, -23, -24), jaw(4), ears(8), hackles(10), tail(4), ANGRY),
    // A second bark.
    snap(0.74, SIT(25), bend(0, 0, -25, -28), jaw(30), ears(8), hackles(12), tail(6), ANGRY),
    // Holding the look up at the sky (a slow sway).
    key(0.92, SIT(24), bend(0, 0, -24, -26, 0, 4), jaw(8), ears(6), hackles(10), tail(6), ANGRY),
    key(1.12, SIT(24), bend(0, 0, -24, -25, 0, -4), jaw(6), ears(6), hackles(10), tail(6), ANGRY),
    // Getting back up.
    key(1.34, pelvis(0, -0.02, -0.02), bend(-4, 0, -4, -4), jaw(2), hackles(6), tail(4), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'aura' }],
};

/**
 * Psych Up, Sleep Talk (buff; after Blaziken's status_self): it gathers
 * itself low, eyes shut, then shakes itself from nose to tail like a dog
 * coming out of the water, left, right, left, right, and ends puffed up and
 * bristling, fired up (a trembling hold), then settles.
 */
const buff: Clip = {
  name: 'buff',
  duration: 1.6,
  keys: [
    key(0),
    // Gathering low, eyes shut.
    key(0.24, pelvis(0, -0.06), bend(10, 4, 14, 16), ears(-16), hackles(-6), tail(-6), SHUT),
    key(0.38, pelvis(0, -0.064), bend(11, 4, 15, 17, 0, 2), ears(-18), hackles(-8), tail(-8), SHUT),
    // The shake, nose to tail.
    snap(0.5, pelvis(0.01, -0.01), twist(10), bend(0, 0, 0, 0, 12, 8), ears(10), hackles(24), tail(20, 30), ANGRY),
    key(0.6, pelvis(-0.01, -0.01), twist(-10), bend(0, 0, 0, 0, -12, -8), ears(10), hackles(26), tail(20, -30), ANGRY),
    key(0.7, pelvis(0.008, -0.008), twist(8), bend(0, 0, 0, 0, 10, 7), ears(8), hackles(28), tail(22, 24), ANGRY),
    key(0.8, pelvis(-0.006, -0.006), twist(-6), bend(0, 0, 0, 0, -8, -5), ears(8), hackles(30), tail(24, -18), ANGRY),
    // Fired up: puffed and bristling (a trembling hold).
    key(0.92, pelvis(0, 0.01), bend(-6, -4, -10, -8), jaw(12), ears(6), hackles(34), tail(30), ANGRY),
    key(1.12, pelvis(0, 0.012), bend(-7, -4, -11, -9, 0, 2), jaw(14), ears(6), hackles(34), tail(31), ANGRY),
    key(1.3, pelvis(0, -0.01), bend(2, 0, 0, 0), jaw(2), hackles(14), tail(12), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.94, name: 'aura' }],
};

/**
 * Double Team (afterimage; after Blaziken's afterimage): low and ready, it
 * darts from side to side in quick bouncing hops faster than the eye (the
 * afterimages start at the aura and run 1.4 s), and lands back in its place.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.6,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(8, 2, -4, -6), ears(-10), hackles(14), tail(14), ANGRY),
    key(0.2, root({ x: -0.075, y: 0.06 }), HOP, bend(4, 0, -4, -6), hackles(16), tail(18, 16), ANGRY),
    key(0.3, root({ x: -0.15 }), LAND, hackles(16), tail(14, 12), ANGRY),
    key(0.42, root({ x: 0, y: 0.065 }), HOP, bend(4, 0, -4, -6), hackles(16), tail(18, -16), ANGRY),
    key(0.52, root({ x: 0.15 }), LAND, hackles(16), tail(14, -12), ANGRY),
    key(0.64, root({ x: 0, y: 0.065 }), HOP, bend(4, 0, -4, -6), hackles(16), tail(18, 16), ANGRY),
    key(0.74, root({ x: -0.15 }), LAND, hackles(16), tail(14, 12), ANGRY),
    key(0.86, root({ x: 0, y: 0.06 }), HOP, bend(4, 0, -4, -6), hackles(16), tail(18, -16), ANGRY),
    key(0.96, root({ x: 0.14 }), LAND, hackles(16), tail(14, -12), ANGRY),
    key(1.08, root({ x: 0.07, y: 0.045 }), HOP, bend(3, 0, -2, -4), hackles(14), tail(16, 8), ANGRY),
    key(1.18, root({ x: 0 }), LAND, hackles(12), tail(10), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Toxic, Yawn (powder): the head lifts and the jaws stretch open in a huge
 * yawn, eyes screwed shut; then the head heaves forward and down at the
 * foe and the gaping jaws breathe the stuff out at it (a shuddering hold);
 * the jaws close and it shakes its head clear.
 */
const powder: Clip = {
  name: 'powder',
  duration: 1.5,
  keys: [
    key(0),
    // The head lifting, the jaws beginning to stretch.
    key(0.22, pelvis(0, 0.004, -0.02), bend(-6, -2, -14, -18), jaw(20), ears(-10), hackles(6), tail(6), DROWSY),
    // A huge yawn.
    key(0.42, pelvis(0, 0.006, -0.024), bend(-7, -2, -16, -22), jaw(40), ears(-14), hackles(8), tail(8), SHUT),
    // The heave: forward and down at the foe, jaws gaping.
    snap(0.56, pelvis(0, -0.03, 0.04), bend(6, 2, 16, 4), jaw(38), ears(-16), hackles(14), tail(10), DROWSY),
    key(0.72, pelvis(0, -0.034, 0.042), bend(7, 2, 17, 5, 0, 3), jaw(34), ears(-16), hackles(14), tail(10), DROWSY),
    // The jaws close; it shakes its head clear.
    key(0.9, pelvis(0, -0.02, 0.01), bend(3, 0, 6, 0, 8, 4), jaw(0), ears(-8), hackles(8), tail(6), ANGRY),
    key(1.08, pelvis(0, -0.012), bend(2, 0, 2, 0, -6, -3), jaw(0), ears(-4), hackles(6), tail(4), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'emit' }],
};

export const AFAR: Clip[] = [orb, beam, sound, fling, roar, glare, kickSand, charm, shield, heal, weather, buff, afterimage, powder];
