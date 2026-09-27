// Blaziken's claws and hands: rakes, slashes, chops and slaps. Every one
// leaps to the foe, strikes into its body (the hand trails the hips by
// 0.08 s, so the impact comes that much after the snap, while the limb holds
// at full reach) and hops home.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, ARRIVE, BLADE_HAND, CHAMBER, FISTS, GUARD, GUARD_L, HAPPY, HOP, LAND, LAND_DEEP, OPEN_EYES, SPLAY, TUCK_HIGH,
  arms, armR, at, bend, fall, hopHome, jaw, key, leap, lunge, pelvis, root, snap, twist, stepIn,
} from './kit';

/** Scratch: claws cocked beside the head, a quick raking swipe down and across the foe's face, carried through. */
export const scratch: Clip = {
  name: 'scratch',
  duration: 1.2,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.035), twist(-14), bend(12, 0, 0, -8, 10), SPLAY, GUARD_L, armR([-0.82, 0.22, -0.1], [-0.3, 0.6, 0.74]), ANGRY),
    key(0.25, leap(0.55, 0.07), twist(-16), bend(8, 0, 0, -8, 12), SPLAY, GUARD_L, armR([-0.8, 0.26, -0.12], [-0.28, 0.64, 0.72]), ANGRY),
    key(0.36, ARRIVE, twist(-18), bend(14, 0, 0, -8, 12), SPLAY, GUARD_L, armR([-0.82, 0.22, -0.1], [-0.3, 0.6, 0.74]), ANGRY),
    // The rake: down and across its face, the body turning into it.
    snap(0.43, at(1), stepIn(0.06), pelvis(0.01, -0.035), twist(16, -4), bend(18, 4, 0, -6, -6), SPLAY, GUARD_L, armR([0.18, -0.18, 0.97], [0.55, -0.42, 0.72]), ANGRY),
    key(0.54, at(1), stepIn(0.07), pelvis(0.012, -0.034), twist(20, -5), bend(19, 4, 0, -6, -7), SPLAY, GUARD_L, armR([0.3, -0.34, 0.89], [0.6, -0.55, 0.58]), ANGRY),
    // Carried through, low on the far side.
    key(0.66, at(1), stepIn(0.04), pelvis(0.01, -0.03), twist(24, -6), bend(20, 4, 0, -6, -8), SPLAY, GUARD_L, armR([0.45, -0.58, 0.68], [0.6, -0.74, 0.3]), ANGRY),
    key(0.8, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.94, GUARD, ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Slash: a big diagonal slash from high behind the shoulder down through the
 * foe, the whole torso unwinding into it, the claws trailing a long
 * follow-through low on the far side.
 */
export const slash: Clip = {
  name: 'slash',
  duration: 1.4,
  keys: [
    key(0),
    // Wind up: crouch, the right shoulder far back, the claw high behind the head.
    key(0.14, pelvis(0, -0.04), twist(-26, 4), bend(14, 0, 0, -8, 14), SPLAY, GUARD_L, armR([-0.62, 0.35, -0.7], [-0.35, 0.5, -0.79]), ANGRY),
    key(0.28, leap(0.55, 0.08), twist(-28, 4), bend(10, 0, 0, -8, 14), SPLAY, GUARD_L, armR([-0.6, 0.38, -0.7], [-0.33, 0.52, -0.79]), ANGRY),
    key(0.4, ARRIVE, twist(-30, 5), bend(16, 0, 0, -8, 15), SPLAY, GUARD_L, armR([-0.62, 0.35, -0.7], [-0.35, 0.48, -0.8]), ANGRY),
    // The slash: the torso unwinds, the claw sweeps down and across through the foe.
    snap(0.48, at(1), stepIn(0.08), pelvis(0.012, -0.045), twist(26, -8), bend(22, 6, 0, -6, -10), SPLAY, CHAMBER, armR([0.3, -0.34, 0.89], [0.62, -0.52, 0.59]), ANGRY),
    key(0.6, at(1), stepIn(0.09), pelvis(0.013, -0.046), twist(30, -9), bend(23, 6, 0, -6, -11), SPLAY, CHAMBER, armR([0.44, -0.5, 0.75], [0.62, -0.68, 0.39]), ANGRY),
    // Follow-through: the claws trail low on the far side and hang there.
    key(0.74, at(1), stepIn(0.05), pelvis(0.012, -0.04), twist(34, -8), bend(24, 6, 0, -6, -12), SPLAY, CHAMBER, armR([0.56, -0.72, 0.41], [0.5, -0.86, 0.1]), ANGRY),
    key(0.9, at(1), pelvis(0, -0.035), twist(10), bend(14, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.04, GUARD, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'impact' }],
};

/** Cut: a single vertical chop, the claws edge-first, from overhead straight down through the foe, crisp. */
export const cut: Clip = {
  name: 'cut',
  duration: 1.3,
  keys: [
    key(0),
    // The claw raised overhead, edge forward, the body rising onto its toes.
    key(0.14, pelvis(0, 0.006), twist(-8), bend(-4, -4, 0, -10, 6), BLADE_HAND, GUARD_L, armR([-0.18, 0.95, 0.25], [-0.05, 0.85, -0.52]), ANGRY),
    key(0.27, leap(0.55, 0.08), twist(-8), bend(-2, -4, 0, -10, 6), BLADE_HAND, GUARD_L, armR([-0.16, 0.96, 0.22], [-0.04, 0.8, -0.6]), ANGRY),
    key(0.38, ARRIVE, twist(-8), bend(6, -2, 0, -10, 6), BLADE_HAND, GUARD_L, armR([-0.18, 0.95, 0.25], [-0.05, 0.82, -0.57]), ANGRY),
    // The chop: straight down through the foe, the body dipping behind it.
    snap(0.45, at(1), stepIn(0.08), pelvis(0, -0.055), twist(4), bend(22, 6, 2, 0), BLADE_HAND, GUARD_L, armR([-0.1, -0.28, 0.95], [-0.04, -0.72, 0.69]), ANGRY),
    key(0.56, at(1), stepIn(0.08), pelvis(0, -0.058), twist(4), bend(23, 6, 2, 0), BLADE_HAND, GUARD_L, armR([-0.08, -0.45, 0.89], [-0.02, -0.86, 0.5]), ANGRY),
    // Carried down low in front.
    key(0.68, at(1), stepIn(0.04), pelvis(0, -0.05), bend(20, 4, 2, -2), BLADE_HAND, GUARD_L, armR([-0.1, -0.72, 0.69], [0, -0.97, 0.25]), ANGRY),
    key(0.82, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.96, GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.53, name: 'impact' }],
};

/**
 * Fury Cutter: a quick crossing X of two slashes, the right claw then the
 * left, each from high and wide down across the foe; they end crossed low.
 */
export const fury_cutter: Clip = {
  name: 'fury_cutter',
  duration: 1.4,
  keys: [
    key(0),
    // Both claws cocked high and wide.
    key(0.13, pelvis(0, -0.035), bend(12, 0, 0, -8), SPLAY, arms([[-0.88, 0.25, 0.1], [-0.35, 0.75, 0.56]], [[0.88, 0.25, 0.1], [0.35, 0.75, 0.56]]), ANGRY),
    key(0.26, leap(0.55, 0.07), bend(8, 0, 0, -8), SPLAY, arms([[-0.86, 0.28, 0.08], [-0.33, 0.78, 0.53]], [[0.86, 0.28, 0.08], [0.33, 0.78, 0.53]]), ANGRY),
    key(0.36, ARRIVE, bend(14, 0, 0, -8), SPLAY, arms([[-0.88, 0.25, 0.1], [-0.35, 0.75, 0.56]], [[0.88, 0.25, 0.1], [0.35, 0.75, 0.56]]), ANGRY),
    // The right claw slashes down across to its left...
    snap(0.42, at(1), stepIn(0.12), pelvis(0.008, -0.04), twist(14, -3), bend(18, 4, 0, -6, -5), SPLAY, arms([[0.28, -0.34, 0.9], [0.56, -0.56, 0.61]], [[0.88, 0.25, 0.1], [0.35, 0.75, 0.56]]), ANGRY),
    // ...and the left claw back across it: an X.
    snap(0.52, at(1), stepIn(0.24), pelvis(-0.008, -0.045), twist(-14, 3), bend(20, 4, 0, -6, 5), SPLAY, arms([[0.3, -0.44, 0.85], [0.56, -0.62, 0.55]], [[-0.28, -0.36, 0.89], [-0.56, -0.58, 0.59]]), ANGRY),
    key(0.64, at(1), stepIn(0.25), pelvis(-0.008, -0.046), twist(-16, 3), bend(21, 4, 0, -6, 6), SPLAY, arms([[0.3, -0.48, 0.82], [0.54, -0.66, 0.52]], [[-0.3, -0.46, 0.83], [-0.56, -0.64, 0.52]]), ANGRY),
    // Held crossed low, then back up into a guard.
    key(0.78, at(1), stepIn(0.12), pelvis(0, -0.04), bend(18, 4, 0, -4), SPLAY, arms([[0.2, -0.66, 0.72], [0.5, -0.8, 0.33]], [[-0.2, -0.66, 0.72], [-0.5, -0.8, 0.33]]), ANGRY),
    key(0.9, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.04, GUARD, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'impact' }],
};

/**
 * Brick Break: the flat hand raised high beside the head, a karate chop
 * straight down through the foe (a wall shattering), the whole body dropping
 * into it with a shout; held low a beat.
 */
export const brick_break: Clip = {
  name: 'brick_break',
  duration: 1.45,
  keys: [
    key(0),
    // Rise tall, the chopping hand high beside the head, the left hand out as a guide.
    key(0.16, pelvis(0, 0.01), twist(-12), bend(-6, -4, 0, -10, 8), BLADE_HAND, arms([[-0.72, 0.55, 0.15], [0.35, 0.72, -0.6]], [[0.28, -0.22, 0.93], [0.1, 0.08, 0.99]]), ANGRY),
    key(0.3, leap(0.55, 0.09), twist(-12), bend(-4, -4, 0, -10, 8), BLADE_HAND, arms([[-0.7, 0.57, 0.15], [0.33, 0.74, -0.58]], [[0.28, -0.2, 0.94], [0.1, 0.1, 0.99]]), ANGRY),
    key(0.42, ARRIVE, twist(-14), bend(2, -2, 0, -10, 8), BLADE_HAND, arms([[-0.72, 0.55, 0.15], [0.35, 0.72, -0.6]], [[0.28, -0.22, 0.93], [0.1, 0.08, 0.99]]), ANGRY),
    // The chop: the body drops into it, the guide hand pulls back to the hip.
    snap(0.49, at(1), stepIn(0.22), pelvis(0, -0.1), twist(8), bend(26, 8, 2, 2), BLADE_HAND, CHAMBER, armR([-0.14, -0.3, 0.94], [0.05, -0.66, 0.75]), jaw(22), ANGRY),
    key(0.6, at(1), stepIn(0.23), pelvis(0, -0.104), twist(8), bend(27, 8, 2, 2), BLADE_HAND, CHAMBER, armR([-0.12, -0.4, 0.91], [0.05, -0.76, 0.65]), jaw(20), ANGRY),
    // Held low a beat, then up.
    key(0.76, at(1), stepIn(0.13), pelvis(0, -0.09), twist(6), bend(24, 6, 2, 0), BLADE_HAND, CHAMBER, armR([-0.12, -0.6, 0.79], [0.05, -0.9, 0.43]), jaw(4), ANGRY),
    key(0.92, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.06, GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.61, name: 'impact' }],
};

/** Rock Smash: both fists clasped high, a hammer blow smashed down onto the foe as onto a boulder; a rebound. */
export const rock_smash: Clip = {
  name: 'rock_smash',
  duration: 1.45,
  keys: [
    key(0),
    // Fists clasped high, leaning back.
    key(0.16, pelvis(0, -0.01), bend(-10, -6, 0, -12), FISTS, arms([[-0.15, 0.93, 0.33], [0.2, 0.96, 0.2]], [[0.15, 0.93, 0.33], [-0.2, 0.96, 0.2]]), ANGRY),
    key(0.3, leap(0.55, 0.09), bend(-8, -6, 0, -12), FISTS, arms([[-0.14, 0.94, 0.31], [0.2, 0.97, 0.16]], [[0.14, 0.94, 0.31], [-0.2, 0.97, 0.16]]), ANGRY),
    key(0.42, ARRIVE, bend(-4, -6, 0, -12), FISTS, arms([[-0.15, 0.93, 0.33], [0.2, 0.95, 0.24]], [[0.15, 0.93, 0.33], [-0.2, 0.95, 0.24]]), ANGRY),
    // The hammer blow: both fists smash down into the foe, the back bending into it.
    snap(0.5, at(1), stepIn(0.1), pelvis(0, -0.065), bend(30, 10, 4, 4), FISTS, arms([[-0.1, -0.3, 0.95], [0.25, -0.56, 0.79]], [[0.1, -0.3, 0.95], [-0.25, -0.56, 0.79]]), jaw(12), ANGRY),
    key(0.6, at(1), stepIn(0.1), pelvis(0, -0.07), bend(31, 10, 4, 4), FISTS, arms([[-0.1, -0.36, 0.93], [0.25, -0.62, 0.74]], [[0.1, -0.36, 0.93], [-0.25, -0.62, 0.74]]), jaw(8), ANGRY),
    // A rebound off the rock-hard blow.
    key(0.74, at(1), stepIn(0.05), pelvis(0, -0.05), bend(20, 6, 2, 0), FISTS, arms([[-0.14, -0.1, 0.98], [0.2, -0.2, 0.96]], [[0.14, -0.1, 0.98], [-0.2, -0.2, 0.96]]), ANGRY),
    key(0.9, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(1.04, GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/**
 * Aerial Ace: a blur of speed. A quick crouch, then a springing leap high at
 * the foe, the claw slashing down onto it as it drops out of the air, a deep
 * landing past the strike point (beside it), and a hop home.
 */
export const aerial_ace: Clip = {
  name: 'aerial_ace',
  duration: 1.35,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.06), twist(-12), bend(16, 2, 0, -10, 8), SPLAY, GUARD_L, armR([-0.5, -0.45, -0.74], [-0.2, -0.3, 0.93]), ANGRY),
    // Springing high at the foe, the claw drawn up and back.
    key(0.21, leap(0.62, 0.2), TUCK_HIGH, twist(-18), bend(6, 0, 0, -12, 12), SPLAY, GUARD_L, armR([-0.6, 0.45, -0.66], [-0.3, 0.7, -0.65]), ANGRY),
    key(0.3, at(0.94), root({ y: 0.17, pitch: 10 }), lunge(0.06), TUCK_HIGH, twist(-20), bend(10, 0, 0, -12, 12), SPLAY, GUARD_L, armR([-0.58, 0.5, -0.64], [-0.28, 0.74, -0.61]), ANGRY),
    // Dropping onto it, the claw slashing down through it.
    snap(0.36, at(1), root({ y: 0.12, pitch: 16 }), lunge(0.1), TUCK_HIGH, twist(20, -6), bend(22, 6, 0, -6, -8), SPLAY, GUARD_L, armR([0.26, -0.36, 0.9], [0.6, -0.56, 0.57]), ANGRY),
    key(0.46, at(1), root({ y: 0.06, pitch: 12 }), lunge(0.1), TUCK_HIGH, twist(24, -7), bend(23, 6, 0, -6, -9), SPLAY, GUARD_L, armR([0.4, -0.5, 0.77], [0.6, -0.72, 0.35]), ANGRY),
    // Lands deep past the strike point, beside the foe.
    fall(0.56, at(1), root({ x: -0.16 }), stepIn(0.12), LAND_DEEP, twist(26, -6), SPLAY, GUARD_L, armR([0.5, -0.7, 0.51], [0.5, -0.85, 0.16]), ANGRY),
    key(0.74, at(1), root({ x: -0.16 }), stepIn(0.1), pelvis(0, -0.06), bend(14, 2, 0, -2), GUARD, ANGRY),
    key(0.88, at(0.45), root({ x: -0.08, y: 0.07 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.01, at(0), LAND, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.43, name: 'impact' }],
};

/** Smelling Salt: a brisk open-handed slap across the foe's face (to wake it), and a quick shake of the stinging hand. */
export const smelling_salt: Clip = {
  name: 'smelling_salt',
  duration: 1.15,
  keys: [
    key(0),
    // The hand swung out wide at face height.
    key(0.12, pelvis(0, -0.03), twist(-16), bend(8, 0, 0, -6, 12), BLADE_HAND, GUARD_L, armR([-0.88, 0.1, 0.46], [-0.5, 0.3, 0.81]), ANGRY),
    key(0.24, leap(0.55, 0.06), twist(-16), bend(6, 0, 0, -6, 12), BLADE_HAND, GUARD_L, armR([-0.88, 0.12, 0.45], [-0.5, 0.32, 0.8]), ANGRY),
    key(0.34, ARRIVE, twist(-18), bend(10, 0, 0, -6, 12), BLADE_HAND, GUARD_L, armR([-0.9, 0.12, 0.42], [-0.52, 0.3, 0.8]), ANGRY),
    // The slap: the hand sweeps flat across the foe's face.
    snap(0.4, at(1), stepIn(0.07), pelvis(0.008, -0.035), twist(18, -3), bend(12, 2, 0, -6, -8), BLADE_HAND, GUARD_L, armR([0.1, 0.02, 0.99], [0.66, 0.08, 0.75]), ANGRY),
    key(0.5, at(1), stepIn(0.07), pelvis(0.009, -0.035), twist(20, -3), bend(12, 2, 0, -6, -9), BLADE_HAND, GUARD_L, armR([0.16, 0, 0.99], [0.7, 0.06, 0.71]), ANGRY),
    // A quick shake of the stinging hand.
    key(0.6, at(1), stepIn(0.03), pelvis(0, -0.035), twist(4), bend(10, 2, 0, -4), BLADE_HAND, GUARD_L, armR([-0.4, -0.2, 0.89], [-0.3, 0.55, 0.78]), HAPPY),
    key(0.68, at(1), pelvis(0, -0.035), twist(2), bend(10, 2, 0, -4), BLADE_HAND, GUARD_L, armR([-0.36, -0.26, 0.9], [-0.2, 0.3, 0.93]), HAPPY),
    key(0.78, at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY),
    ...hopHome(0.9, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'impact' }],
};

export const STRIKES: Clip[] = [scratch, slash, cut, fury_cutter, brick_break, rock_smash, aerial_ace, smelling_salt];
