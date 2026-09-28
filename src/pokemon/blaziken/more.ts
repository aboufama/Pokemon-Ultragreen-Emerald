// Blaziken's clips for the actions its first clips (./first.ts) had none for,
// made in their style with their helpers: a move whose action no first clip
// shows (Earthquake, Protect, Rest, Sunny Day, Swagger, Overheat, Rock Slide,
// Body Slam) plays one of these, named after its motif.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, ARMS_SPREAD_UP, BRACED, CHAMBER, CROSSED, DROWSY, FISTS, GUARD, HOP, LAND, OPEN_EYES, SHUT, TUCK,
  bend, fall, flames, jaw, key, pelvis, snap,
} from './first';

const HAPPY: Pose = { expression: 'happy' };

/** Forearms crossed in an X in front of the face, elbows forward: the block. */
const X_BLOCK: Pose = {
  aim: {
    armR: { dir: [-0.28, -0.1, 0.95] },
    forearmR: { dir: [0.62, 0.62, 0.48] },
    armL: { dir: [0.28, -0.1, 0.95] },
    forearmL: { dir: [-0.62, 0.64, 0.45] },
  },
};

/**
 * A throw with the left claw (the side away from our healthbox, and from a
 * wild one's): cocked back behind the shoulder, the right arm forward.
 */
const THROW_COCK: Pose = {
  aim: {
    armL: { dir: [0.45, 0.05, -0.89] },
    forearmL: { dir: [0.15, 0.45, -0.88] },
    armR: { dir: [-0.3, -0.4, 0.87] },
    forearmR: { dir: [-0.1, 0.35, 0.93] },
  },
};

/** The throwing arm whipped through, level, at the foe; the right drawn back. */
const THROW_OUT: Pose = {
  aim: {
    armL: { dir: [0.1, -0.02, 0.99] },
    forearmL: { dir: [-0.25, 0.0, 0.97] },
    armR: { dir: [-0.55, -0.5, -0.67] },
    forearmR: { dir: [-0.2, -0.3, 0.93] },
  },
};

/** Carried through low across the body. */
const THROW_THROUGH: Pose = {
  aim: {
    armL: { dir: [-0.4, -0.55, 0.73] },
    forearmL: { dir: [-0.62, -0.62, 0.48] },
    armR: { dir: [-0.55, -0.5, -0.67] },
    forearmR: { dir: [-0.2, -0.3, 0.93] },
  },
};

/** The right hand held out to the foe, palm up, the left fist on the hip. */
const BECKON: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.25, 0.92] },
    forearmR: { dir: [-0.05, 0.3, 0.95] },
    armL: { dir: [0.62, -0.55, -0.56] },
    forearmL: { dir: [-0.35, -0.2, 0.92] },
  },
};

/** The beckoning fingers curled in ("come on"). */
const CURL_R: Pose = {
  bones: {
    fingerA1R: { z: 30 }, fingerB1R: { z: 30 }, fingerC1R: { z: 30 },
    fingerA2R: { z: 26 }, fingerB2R: { z: 26 }, fingerC2R: { z: 26 },
  },
};

/** Airborne and flying at the foe chest first, arms spread, legs trailing: the body press. */
const PRESS: Pose = {
  plantFeet: 0,
  aim: {
    armR: { dir: [-0.85, 0.2, 0.48] }, forearmR: { dir: [-0.4, 0.3, 0.87] },
    armL: { dir: [0.85, 0.2, 0.48] }, forearmL: { dir: [0.4, 0.3, 0.87] },
    thighR: { dir: [-0.2, -0.5, -0.84] }, shinR: { dir: [-0.1, -0.2, -0.97] },
    thighL: { dir: [0.2, -0.5, -0.84] }, shinL: { dir: [0.1, -0.2, -0.97] },
  },
};

/** The right knee raised high in front, the left leg standing (the stamp's wind-up). */
const KNEE_HIGH_R: Pose = {
  plantRight: 0,
  plantLeft: 1,
  aim: {
    thighR: { dir: [-0.18, 0.3, 0.94] }, shinR: { dir: [-0.08, -0.93, 0.36] },
  },
};

/**
 * Earthquake: it shifts onto its left leg and draws its right knee up high,
 * fists chambered, looking down at the ground; then stamps it down with all
 * its weight, flames flaring, and sinks deep into the knees as the ground
 * shakes; it holds there, then rises. (No jump: at home a jump rises under
 * the foe's healthbox from our side.)
 */
const quake: Clip = {
  name: 'quake',
  duration: 1.9,
  keys: [
    key(0),
    // Weight onto the left leg, the right knee coming up.
    key(0.2, pelvis(0.012, -0.02), KNEE_HIGH_R, bend(6, 2, 0, 4), CHAMBER, FISTS, ANGRY, flames(0.4)),
    // The knee at its highest, leaning back a touch to load the stamp.
    key(0.44, pelvis(0.016, 0.004), KNEE_HIGH_R, { aim: { thighR: { dir: [-0.16, 0.45, 0.88] } } }, bend(-4, -2, 0, 12), CHAMBER, FISTS, ANGRY, flames(0.8)),
    // The stamp: the foot driven into the ground, the whole weight after it.
    snap(0.56, LAND, pelvis(0, -0.11), bend(24, 8, 2, 12), BRACED, FISTS, jaw(22), ANGRY, flames(1)),
    key(0.7, LAND, pelvis(0, -0.115), bend(26, 8, 2, 13, 0, 2), BRACED, FISTS, jaw(26), ANGRY, flames(1)),
    // Holding it while the ground shakes.
    key(0.92, pelvis(0, -0.108), bend(25, 7, 2, 11, 0, -2), BRACED, FISTS, jaw(14), ANGRY, flames(0.9)),
    key(1.12, pelvis(0, -0.1), bend(24, 7, 2, 10, 0, 1), BRACED, FISTS, jaw(8), ANGRY, flames(0.8)),
    // Rising out of it.
    key(1.4, pelvis(0, -0.04), bend(10, 2, 0, 0), GUARD, ANGRY, flames(0.5)),
    key(1.9, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/**
 * Protect, Detect, Endure, Substitute: it snaps its forearms up into an X
 * before its face and sinks into its stance behind them while the barrier
 * forms, trembling with the effort; then lowers its guard.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    // A flinch back, the arms drawing in.
    key(0.14, pelvis(0, 0.006), bend(-6, -4, 0, -8), CHAMBER, FISTS, ANGRY),
    // The block: forearms up in an X, weight down behind them.
    snap(0.28, pelvis(0, -0.05), bend(12, 4, 0, 6), X_BLOCK, FISTS, ANGRY, flames(0.6)),
    key(0.46, pelvis(0, -0.054), bend(13, 4, 0, 7, 0, 1.5), X_BLOCK, FISTS, ANGRY, flames(0.8)),
    key(0.66, pelvis(0, -0.052), bend(12, 5, 0, 6, 0, -1.5), X_BLOCK, FISTS, ANGRY, flames(0.8)),
    key(0.86, pelvis(0, -0.055), bend(13, 4, 0, 7, 0, 1), X_BLOCK, FISTS, ANGRY, flames(0.7)),
    // Guard down.
    key(1.1, pelvis(0, -0.02), bend(6, 2, 0, 0), GUARD, ANGRY, flames(0.3)),
    key(1.5, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Rest: it sinks down into a deep, calm crouch, arms folded and eyes closed,
 * breathes slowly in and out, and settles to sleep.
 */
const heal: Clip = {
  name: 'heal',
  duration: 1.9,
  keys: [
    key(0),
    // Letting go: the head drops, the arms fold.
    key(0.3, pelvis(0, -0.06), bend(10, 3, 2, 12), CROSSED, DROWSY),
    // Down into a deep calm crouch, eyes shut.
    key(0.62, pelvis(0, -0.15), bend(16, 6, 4, 18), CROSSED, SHUT),
    // A slow breath in (the chest rises) and out.
    key(0.98, pelvis(0, -0.14), bend(12, 3, 2, 14), CROSSED, SHUT),
    key(1.34, pelvis(0, -0.155), bend(17, 6, 4, 19), CROSSED, SHUT),
    // Back up.
    key(1.62, pelvis(0, -0.04), bend(6, 2, 0, 4), GUARD, DROWSY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/**
 * Sunny Day: it gathers itself, then throws its chest open and its head back
 * to the sky, arms flung wide, wrist flames blazing, and holds it (a slow
 * sway) while the sun comes out.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    key(0.26, pelvis(0, -0.045), bend(12, 3, 0, 10), CROSSED, FISTS, SHUT, flames(0.3)),
    // Open to the sky.
    snap(0.5, pelvis(0, 0.014), bend(-16, -10, -8, -34), ARMS_SPREAD_UP, jaw(22), ANGRY, flames(1)),
    key(0.72, pelvis(0, 0.016), bend(-17, -10, -8, -36, 4, 3), ARMS_SPREAD_UP, jaw(18), ANGRY, flames(1)),
    key(0.94, pelvis(0, 0.012), bend(-16, -11, -8, -34, -4, -3), ARMS_SPREAD_UP, jaw(20), ANGRY, flames(1)),
    key(1.14, pelvis(0, 0.014), bend(-15, -10, -8, -32, 2, 1), ARMS_SPREAD_UP, jaw(10), ANGRY, flames(0.9)),
    // Back down to its guard.
    key(1.4, pelvis(0, -0.02), bend(6, 2, 0, 0), GUARD, ANGRY, flames(0.4)),
    key(1.8, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/**
 * Swagger, Attract: chest out and head cocked, it holds a hand out to the foe
 * and beckons it twice ("come on"), smug, then drops back into its guard.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.55,
  keys: [
    key(0),
    // Chest out, head cocked, the hand going out.
    key(0.22, pelvis(0, 0.01), bend(-8, -5, 0, -6, 0, 10), BECKON, ANGRY),
    // Beckon: the fingers curl in, the head nods with it.
    snap(0.38, pelvis(0, 0.012), bend(-9, -5, 0, -2, 0, 12), BECKON, CURL_R, HAPPY),
    key(0.52, pelvis(0, 0.01), bend(-8, -5, 0, -7, 0, 10), BECKON, HAPPY),
    snap(0.64, pelvis(0, 0.012), bend(-9, -5, 0, -2, 0, 12), BECKON, CURL_R, HAPPY),
    // Holds it, smug.
    key(0.86, pelvis(0, 0.01), bend(-8, -5, 0, -8, 4, 11), BECKON, HAPPY),
    key(1.14, pelvis(0, -0.01), bend(4, 1, 0, 0), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/**
 * Overheat: it curls in tight around its fire, trembling as the heat builds,
 * then bursts open with everything: arms and head flung back, flames blazing;
 * it holds the blast, then slumps, spent.
 */
const burst: Clip = {
  name: 'burst',
  duration: 2.3,
  keys: [
    key(0),
    // Curling in around the heat.
    key(0.3, pelvis(0, -0.08), bend(28, 10, 6, 24), CROSSED, FISTS, SHUT, flames(0.6)),
    key(0.52, pelvis(0, -0.095), bend(30, 11, 6, 26, 0, 1.5), CROSSED, FISTS, SHUT, flames(0.8)),
    key(0.7, pelvis(0, -0.1), bend(31, 11, 6, 27, 0, -1.5), CROSSED, FISTS, SHUT, flames(0.95)),
    // The burst.
    snap(0.84, pelvis(0, 0.022), bend(-18, -10, -8, -28), ARMS_SPREAD_UP, jaw(36), ANGRY, flames(1)),
    key(1.06, pelvis(0, 0.024), bend(-19, -10, -8, -30, 0, 2), ARMS_SPREAD_UP, jaw(34), ANGRY, flames(1)),
    key(1.28, pelvis(0, 0.02), bend(-18, -11, -8, -28, 0, -2), ARMS_SPREAD_UP, jaw(36), ANGRY, flames(1)),
    key(1.46, pelvis(0, 0.012), bend(-10, -6, -4, -16), CROSSED, jaw(24), ANGRY, flames(0.9)),
    // Spent: it slumps forward, breathing hard.
    key(1.72, pelvis(0, -0.04), bend(16, 6, 2, 12), CHAMBER, jaw(14), DROWSY, flames(0.4)),
    key(1.96, pelvis(0, -0.03), bend(12, 4, 2, 8), CHAMBER, jaw(6), DROWSY, flames(0.2)),
    key(2.3, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.86, name: 'release' }, { t: 1.5, name: 'releaseEnd' }],
};

/**
 * Rock Tomb, Rock Slide, Swift: a sidearm throw with the left claw. The body
 * winds away with the claw cocked back behind the shoulder, then unwinds and
 * whips the arm through level at the foe; the volley leaves the claw, the arm
 * carries through low across the body.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: turned away, the claw cocked back.
    key(0.2, pelvis(-0.01, -0.035), bend(8, 2, 0, -6, -18), THROW_COCK, ANGRY),
    key(0.3, pelvis(-0.012, -0.04), bend(9, 2, 0, -6, -20), THROW_COCK, ANGRY),
    // The throw: the torso unwinds, the arm whips through.
    snap(0.38, pelvis(0.006, -0.03), bend(14, 6, 0, -8, 10), THROW_OUT, ANGRY, flames(0.6)),
    // Carried through low across the body.
    key(0.56, pelvis(0.01, -0.035), bend(18, 7, 0, -6, 14), THROW_THROUGH, ANGRY, flames(0.4)),
    key(0.8, pelvis(0, -0.02), bend(8, 2, 0, -2), GUARD, ANGRY, flames(0.2)),
    key(1.3, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'release' }],
};

/**
 * Body Slam: a deep coil, then a big leap high over the foe; at the top it
 * tips forward, arms spread, and comes down on it chest first with its whole
 * weight, bounces off, lands deep and hops home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.05,
  keys: [
    key(0),
    // Coil.
    key(0.28, pelvis(0, -0.1), bend(26, 6, 0, -14), CHAMBER, FISTS, ANGRY),
    // Spring up and in.
    key(0.48, { advance: 0.5, root: { y: 0.24 } }, TUCK, bend(6, 0, 0, -10), CHAMBER, FISTS, ANGRY),
    // The top: tipping forward over the foe, arms spread.
    key(0.64, { advance: 0.88, root: { y: 0.3, pitch: 28 } }, PRESS, bend(8, 4, 0, -12), ANGRY),
    // Down on it with its whole weight.
    snap(0.76, { advance: 1, root: { y: 0.08, pitch: 52 } }, PRESS, bend(12, 6, 0, -16), jaw(16), ANGRY),
    key(0.84, { advance: 1, root: { y: 0.06, pitch: 54 } }, PRESS, bend(13, 6, 0, -17), jaw(12), ANGRY),
    // Bounces off it.
    key(0.98, { advance: 0.92, root: { y: 0.16, pitch: 18 } }, TUCK, bend(6, 2, 0, -8), GUARD, ANGRY),
    // Lands in front of it, deep in the knees.
    fall(1.14, { advance: 0.9 }, LAND, pelvis(0, -0.07), bend(22, 4, 0, -4), GUARD, ANGRY),
    key(1.34, { advance: 0.9 }, pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY),
    // Hop home.
    key(1.5, { advance: 0.42, root: { y: 0.07 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.64, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.05, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/** The clips for the actions the first clips had none for, by the motif they show. */
export const MORE_CLIPS: Record<string, Clip> = Object.fromEntries(
  [quake, shield, heal, weather, charm, burst, throwing, slam].map((c) => [c.name, c]),
);
