// Blaziken's ranged moves, fired from home: fire from the beak (the head
// leads, the arms stay braced), a burst from the whole body, stars flung
// from a hand, rocks raised with a fist driven into the ground and heaved with
// both arms, mud scooped and slapped with a claw, a snore, a stomp that shakes the ground. The head trails the hips by
// 0.065 s: a release comes that much after the snap that causes it.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, ARMS_SPREAD_UP, BRACED, CHAMBER, CROSSED, DROWSY, ELBOWS_BACK, FISTS, GUARD, GUARD_L, HEAVE, LIMP, OPEN_EYES, SHUT, SLAM_DOWN, SQUEEZE, SPLAY,
  armR, arms, bend, flames, jaw, key, legR, pelvis, root, snap, twist, armL,
} from './kit';

/** Ember: a quick breath (chest up, head back), then the head snaps forward and spits embers from the beak. */
export const ember: Clip = {
  name: 'ember',
  duration: 1.2,
  keys: [
    key(0),
    key(0.24, pelvis(0, 0.012), bend(-8, -8, -8, -14), ELBOWS_BACK, FISTS, ANGRY, flames(0.5)),
    snap(0.34, pelvis(0, -0.016, 0.03), bend(15, 9, -4, -8), CHAMBER, FISTS, jaw(34), ANGRY, flames(0.9)),
    // Recoil: the head bobs back up as the beak closes.
    key(0.5, pelvis(0, -0.01, 0.015), bend(9, 4, -3, -11), CHAMBER, FISTS, jaw(18), ANGRY, flames(0.7)),
    key(0.7, pelvis(0, -0.004), bend(3, 1, 0, -2), CHAMBER, FISTS, jaw(3), ANGRY, flames(0.3)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/** Flamethrower: a deep breath with embers gathering at the beak, then a sustained stream as the head drives forward, the body braced low. */
export const flamethrower: Clip = {
  name: 'flamethrower',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6), FISTS),
    // Deep breath: rise, chest out, beak to the sky, elbows back.
    key(0.52, pelvis(0, 0.018), bend(-12, -10, -10, -16), ELBOWS_BACK, FISTS, SHUT, flames(0.6)),
    key(0.66, pelvis(0, 0.022), bend(-13, -11, -11, -18, 0, 2), ELBOWS_BACK, FISTS, SHUT, flames(0.8)),
    // The stream: the head drives forward and down at the foe, the body braces low.
    snap(0.78, pelvis(0, -0.038, 0.032), bend(14, 9, -4, -8), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    // Sustained: pushing into the stream, the head sweeping a little.
    key(1.0, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 5), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.22, pelvis(0, -0.037, 0.03), bend(13, 9, -4, -8, -4, -2), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    key(1.44, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 3, 1), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.62, pelvis(0, -0.035, 0.027), bend(12, 8, -4, -7), BRACED, FISTS, jaw(33), ANGRY, flames(0.9)),
    // The beak shuts, the head comes up and shakes off the heat.
    key(1.8, pelvis(0, -0.015), bend(4, 2, 0, -6, 7), CHAMBER, FISTS, jaw(4), ANGRY, flames(0.5)),
    key(1.94, pelvis(0, -0.008), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY, flames(0.3)),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Fire Spin: a breath drawn in, then a stream that spirals round the foe: the
 * head sweeps in a circle as it breathes, the body swaying with it.
 */
export const fire_spin: Clip = {
  name: 'fire_spin',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(6, 0, 0, 6), FISTS),
    key(0.44, pelvis(0, 0.016), bend(-10, -8, -8, -14), ELBOWS_BACK, FISTS, SHUT, flames(0.6)),
    snap(0.58, pelvis(0, -0.03, 0.026), bend(12, 8, -4, -6, 10), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    // The circle: right, up, left, down, right again.
    key(0.76, pelvis(0.008, -0.028, 0.024), twist(6), bend(10, 6, -8, -10, 12, 6), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(0.94, pelvis(0, -0.022, 0.02), bend(6, 4, -10, -16, 0, 2), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    key(1.12, pelvis(-0.008, -0.028, 0.024), twist(-6), bend(10, 6, -8, -10, -12, -6), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.3, pelvis(0, -0.036, 0.028), bend(16, 10, 0, -2, 0, -2), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    key(1.48, pelvis(0.008, -0.028, 0.024), twist(6), bend(10, 6, -6, -8, 12, 6), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.64, pelvis(0, -0.026, 0.02), bend(8, 5, -8, -12, 2, 2), BRACED, FISTS, jaw(30), ANGRY, flames(0.9)),
    // The beak shuts; a shake of the head.
    key(1.82, pelvis(0, -0.012), bend(4, 2, 0, -6, -7), CHAMBER, FISTS, jaw(4), ANGRY, flames(0.5)),
    key(1.96, pelvis(0, -0.006), bend(2, 1, 0, -3, 6), CHAMBER, ANGRY, flames(0.3)),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.64, name: 'release' }, { t: 1.68, name: 'releaseEnd' }],
};

/**
 * Fire Blast: a huge breath (rising tall, chest thrown out, the arms swept
 * back, the flames building), then the whole upper body lunges and one huge
 * blast leaves the beak; the recoil rocks it back and it shakes it off.
 */
export const fire_blast: Clip = {
  name: 'fire_blast',
  duration: 2.0,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.035), bend(12, 4, 0, 8), FISTS, flames(0.3)),
    // The huge breath.
    key(0.48, pelvis(0, 0.024), bend(-16, -12, -10, -18), ELBOWS_BACK, FISTS, SQUEEZE, flames(0.8)),
    key(0.62, pelvis(0, 0.028), bend(-17, -13, -11, -20, 0, 2), ELBOWS_BACK, FISTS, SQUEEZE, flames(0.9)),
    // The lunge and the blast.
    snap(0.72, pelvis(0, -0.045, 0.045), bend(22, 12, -2, -10), arms([[-0.35, -0.5, -0.8], [-0.25, -0.3, -0.92]], [[0.35, -0.5, -0.8], [0.25, -0.3, -0.92]]), FISTS, jaw(44), ANGRY, flames(1)),
    key(0.84, pelvis(0, -0.046, 0.046), bend(23, 12, -2, -10), arms([[-0.35, -0.52, -0.78], [-0.25, -0.32, -0.91]], [[0.35, -0.52, -0.78], [0.25, -0.32, -0.91]]), FISTS, jaw(42), ANGRY, flames(1)),
    // Rocked back by it.
    key(1.0, pelvis(0, -0.03, 0.01), root({ z: -0.03 }), bend(6, 2, -4, -14), BRACED, FISTS, jaw(24), ANGRY, flames(0.8)),
    key(1.2, pelvis(0, -0.028, 0.008), root({ z: -0.03 }), bend(8, 3, -2, -10), BRACED, FISTS, jaw(8), ANGRY, flames(0.6)),
    // Shakes it off.
    key(1.4, pelvis(0, -0.012), bend(4, 2, 0, -6, 7), CHAMBER, FISTS, ANGRY, flames(0.4)),
    key(1.56, pelvis(0, -0.006), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY, flames(0.2)),
    key(2.0, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.79, name: 'release' }],
};

/**
 * Overheat: it gathers all its fire in, curled over with its arms crossed and
 * shaking, then erupts: chest thrown out, arms and head flung back and wide,
 * the flames at their fullest, the fire bursting out at the foe; then it
 * sags, spent, panting.
 */
export const overheat: Clip = {
  name: 'overheat',
  duration: 2.3,
  keys: [
    key(0),
    // Gathering in, curled and trembling.
    key(0.3, pelvis(0, -0.06), bend(22, 8, 4, 16), CROSSED, FISTS, SQUEEZE, flames(0.5)),
    key(0.46, pelvis(0.004, -0.066), bend(24, 8, 4, 17, 0, 1.5), CROSSED, FISTS, SQUEEZE, flames(0.7)),
    key(0.62, pelvis(-0.004, -0.07), bend(25, 9, 4, 18, 0, -1.5), CROSSED, FISTS, SQUEEZE, flames(0.9)),
    // The eruption.
    snap(0.76, pelvis(0, 0.02), bend(-16, -10, -6, -22), ARMS_SPREAD_UP, jaw(40), ANGRY, flames(1)),
    key(0.9, pelvis(0.003, 0.022), bend(-17, -10, -6, -23, 0, 2), ARMS_SPREAD_UP, jaw(42), ANGRY, flames(1)),
    key(1.06, pelvis(-0.003, 0.02), bend(-16, -10, -6, -22, 0, -2), ARMS_SPREAD_UP, jaw(38), ANGRY, flames(1)),
    // Spent: it sags and pants.
    key(1.32, pelvis(0, -0.05), bend(20, 8, 4, 14), LIMP, jaw(18), DROWSY, flames(0.3)),
    key(1.5, pelvis(0, -0.044), bend(18, 7, 4, 12), LIMP, jaw(8), DROWSY, flames(0.15)),
    key(1.68, pelvis(0, -0.05), bend(20, 8, 4, 14), LIMP, jaw(16), DROWSY, flames(0.1)),
    key(1.9, pelvis(0, -0.02), bend(8, 2, 0, 4), GUARD, jaw(2), ANGRY),
    key(2.3, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.8, name: 'release' }],
};

/**
 * Hyper Beam: a long gathering glow at the beak, crouched and bracing with
 * its eyes squeezed shut; then a massive beam, the head thrust forward and
 * the body braced wide, trembling as the recoil pushes it back; then it sags,
 * spent.
 */
export const hyper_beam: Clip = {
  name: 'hyper_beam',
  duration: 2.7,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.035), bend(8, 2, 0, 4), CHAMBER, FISTS),
    // Gathering: head drawn back, power building.
    key(0.6, pelvis(0, -0.05, -0.01), bend(14, 4, -6, -10), CHAMBER, FISTS, SQUEEZE, flames(0.4)),
    key(0.8, pelvis(0.003, -0.054, -0.012), bend(15, 4, -7, -12, 0, 1.5), CHAMBER, FISTS, SQUEEZE, flames(0.6)),
    key(0.96, pelvis(-0.003, -0.056, -0.012), bend(15, 4, -8, -12, 0, -1.5), CHAMBER, FISTS, SQUEEZE, flames(0.7)),
    // Fire: braced wide and low, the head thrust at the foe.
    snap(1.06, pelvis(0, -0.07, 0.02), bend(14, 8, 2, -8), BRACED, FISTS, jaw(40), ANGRY, flames(1)),
    // Holding it, trembling, pushed back.
    key(1.24, pelvis(0.003, -0.07, 0.01), root({ z: -0.02 }), bend(13, 8, 2, -8, 1), BRACED, FISTS, jaw(40), ANGRY, flames(1)),
    key(1.42, pelvis(-0.003, -0.071, 0.006), root({ z: -0.035 }), bend(14, 8, 2, -9, -1), BRACED, FISTS, jaw(41), ANGRY, flames(1)),
    key(1.6, pelvis(0.003, -0.07, 0.004), root({ z: -0.045 }), bend(13, 8, 2, -8, 1), BRACED, FISTS, jaw(40), ANGRY, flames(1)),
    key(1.8, pelvis(-0.002, -0.07, 0.003), root({ z: -0.05 }), bend(14, 8, 2, -8, -1), BRACED, FISTS, jaw(39), ANGRY, flames(0.9)),
    // Spent.
    key(2.02, pelvis(0, -0.06), root({ z: -0.04 }), bend(22, 8, 4, 12), LIMP, jaw(14), DROWSY, flames(0.3)),
    key(2.24, pelvis(0, -0.05), root({ z: -0.02 }), bend(18, 6, 4, 10), LIMP, jaw(6), DROWSY, flames(0.1)),
    key(2.7, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'charge' }, { t: 1.12, name: 'release' }, { t: 1.86, name: 'releaseEnd' }],
};

/**
 * Hidden Power: its hands cupped before its chest, orbs of light gathering
 * round it as they turn (charge), then drawn back to the hip and thrust out
 * at the foe with both palms: the orbs fly.
 */
export const hidden_power: Clip = {
  name: 'hidden_power',
  duration: 1.8,
  keys: [
    key(0),
    // Hands cupped before the chest, eyes shut.
    key(0.22, pelvis(0, -0.03), bend(6, 2, 0, 6), arms([[-0.3, -0.62, 0.72], [0.62, 0.12, 0.77]], [[0.3, -0.62, 0.72], [-0.62, 0.32, 0.72]]), SHUT, flames(0.3)),
    key(0.42, pelvis(0.004, -0.034), bend(7, 2, 0, 7), arms([[-0.3, -0.58, 0.76], [0.6, 0.32, 0.73]], [[0.3, -0.64, 0.71], [-0.62, 0.1, 0.78]]), SHUT, flames(0.5)),
    // Drawn back to its right hip, turning.
    key(0.64, pelvis(0, -0.045), twist(-22), bend(10, 2, 0, -4, 10), arms([[-0.5, -0.6, -0.62], [0.3, 0.1, 0.95]], [[-0.1, -0.7, 0.7], [-0.7, -0.05, 0.71]]), ANGRY, flames(0.7)),
    // Thrust out at the foe.
    snap(0.74, pelvis(0, -0.03, 0.025), twist(12), bend(12, 4, 0, -6, -4), arms([[-0.25, 0.02, 0.97], [-0.02, 0.1, 0.99]], [[0.25, 0.02, 0.97], [0.02, 0.1, 0.99]]), ANGRY, flames(1)),
    key(0.9, pelvis(0, -0.031, 0.026), twist(13), bend(12, 4, 0, -6, -4), arms([[-0.25, 0, 0.97], [-0.02, 0.06, 1]], [[0.25, 0, 0.97], [0.02, 0.06, 1]]), ANGRY, flames(0.9)),
    key(1.1, pelvis(0, -0.02), bend(6, 2, 0, -2), GUARD, ANGRY, flames(0.5)),
    key(1.8, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.82, name: 'release' }],
};

/** Swift: the right arm wound across its body, then whipped out in a backhand that sprays stars from the claw. */
export const swift: Clip = {
  name: 'swift',
  duration: 1.35,
  keys: [
    key(0),
    // Wound across the chest, turning away.
    key(0.18, pelvis(0, -0.035), twist(22, 4), bend(10, 2, 0, -8, -12), armR([0.55, -0.1, 0.83], [0.82, 0.18, -0.54]), GUARD_L, ANGRY),
    // The backhand whip.
    snap(0.3, pelvis(0, -0.02, 0.012), twist(-20, -4), bend(8, 2, 0, -6, 10), armR([-0.62, 0.12, 0.78], [-0.74, 0.18, 0.65]), GUARD_L, ANGRY),
    key(0.42, pelvis(0, -0.022, 0.012), twist(-24, -4), bend(8, 2, 0, -6, 12), armR([-0.76, 0.08, 0.64], [-0.82, 0.1, 0.56]), GUARD_L, ANGRY),
    // Follow-through out wide, then back.
    key(0.58, pelvis(0, -0.02), twist(-18, -2), bend(8, 2, 0, -4, 8), armR([-0.86, -0.1, 0.5], [-0.8, -0.2, 0.56]), GUARD_L, ANGRY),
    key(0.8, pelvis(0, -0.01), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

/**
 * Rock Tomb: it rises tall with the right fist drawn high behind its
 * shoulder, then drops low and drives the fist down into the ground before
 * it: the rocks burst up around the foe (release on the blow; the fist
 * trails the hips by 0.08 s).
 */
export const rock_tomb: Clip = {
  name: 'rock_tomb',
  duration: 1.6,
  keys: [
    key(0),
    // Rises tall, the fist drawn high behind, the left claw out as a guide.
    key(0.2, pelvis(0, 0.012), twist(-18), bend(-8, -4, 0, -10, 8), FISTS, armR([-0.55, 0.45, -0.7], [-0.2, 0.9, 0.38]), armL([0.35, -0.3, 0.89], [0.15, -0.1, 0.98]), ANGRY, flames(0.5)),
    key(0.34, pelvis(0, 0.016), twist(-20), bend(-9, -4, 0, -11, 8), FISTS, armR([-0.55, 0.5, -0.67], [-0.2, 0.92, 0.34]), armL([0.35, -0.28, 0.89], [0.15, -0.08, 0.98]), ANGRY, flames(0.7)),
    // The blow: it drops low and smashes the fist down into the ground in front.
    snap(0.44, pelvis(0, -0.13), twist(10), bend(34, 12, 2, 0, -4), FISTS, armR([-0.18, -0.8, 0.57], [-0.05, -0.97, 0.24]), armL([0.5, -0.6, -0.62], [0.2, -0.3, 0.93]), jaw(20), ANGRY, flames(1)),
    key(0.58, pelvis(0, -0.135), twist(10), bend(35, 12, 2, 0, -4), FISTS, armR([-0.18, -0.84, 0.51], [-0.05, -0.98, 0.18]), armL([0.5, -0.6, -0.62], [0.2, -0.3, 0.93]), jaw(12), ANGRY, flames(0.9)),
    // Up again.
    key(0.84, pelvis(0, -0.06), bend(14, 4, 0, 0), GUARD, ANGRY, flames(0.6)),
    key(1.1, pelvis(0, -0.02), bend(6, 2, 0, -2), GUARD, ANGRY, flames(0.3)),
    key(1.6, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'release' }],
};

/** Rock Slide: both arms scoop low, heave up in front, then slam down at the foe: the rocks come crashing down on it. */
export const rock_slide: Clip = {
  name: 'rock_slide',
  duration: 1.6,
  keys: [
    key(0),
    // Scooping low.
    key(0.2, pelvis(0, -0.07), bend(30, 8, 2, 8), arms([[-0.22, -0.84, 0.5], [0.05, -0.95, 0.3]], [[0.22, -0.84, 0.5], [-0.05, -0.95, 0.3]]), FISTS, ANGRY),
    // The heave: up in front, leaning back.
    key(0.44, pelvis(0, 0.01, -0.01), bend(-10, -6, -4, -14), HEAVE, FISTS, ANGRY, flames(0.6)),
    key(0.54, pelvis(0, 0.012, -0.012), bend(-11, -6, -4, -15), HEAVE, FISTS, ANGRY, flames(0.8)),
    // The slam down at the foe.
    snap(0.62, pelvis(0, -0.06, 0.02), bend(30, 12, 2, 2), SLAM_DOWN, FISTS, jaw(14), ANGRY, flames(1)),
    key(0.76, pelvis(0, -0.062, 0.02), bend(31, 12, 2, 2), SLAM_DOWN, FISTS, jaw(8), ANGRY, flames(0.9)),
    key(0.96, pelvis(0, -0.04), bend(16, 4, 0, 0), BRACED, FISTS, ANGRY, flames(0.6)),
    key(1.16, pelvis(0, -0.02), bend(6, 2, 0, -2), GUARD, ANGRY, flames(0.3)),
    key(1.6, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'release' }],
};

/**
 * Mud-Slap: it drops low and scoops a clod of mud off the ground with its
 * right claw, winds it back by the hip, then slaps it at the foe with a
 * sidearm sweep, the body turning into the throw (the mud leaves the claw:
 * the hand trails the hips by 0.08 s).
 */
export const mud_slap: Clip = {
  name: 'mud_slap',
  duration: 1.25,
  keys: [
    key(0),
    // Down low: the right claw scoops the ground beside the front foot.
    key(0.2, pelvis(0.01, -0.12), twist(-12), bend(36, 12, 0, -4, -6), SPLAY, GUARD_L, armR([-0.3, -0.92, 0.25], [-0.05, -0.97, 0.25]), ANGRY),
    // The clod held, the claw drawn back low behind the hip.
    key(0.36, pelvis(0.01, -0.08), twist(-24), bend(22, 6, 0, -8, -8), FISTS, GUARD_L, armR([-0.55, -0.62, -0.56], [-0.4, -0.25, -0.88]), ANGRY),
    // The slap: a sidearm sweep across at the foe, the body turning into it.
    snap(0.46, pelvis(-0.005, -0.045, 0.02), twist(18), bend(8, 2, 0, -8, 6), SPLAY, GUARD_L, armR([-0.2, -0.1, 0.97], [0.4, 0.05, 0.92]), jaw(14), ANGRY),
    key(0.58, pelvis(-0.008, -0.045, 0.02), twist(22), bend(10, 2, 0, -8, 8), SPLAY, GUARD_L, armR([0.2, -0.2, 0.96], [0.62, -0.15, 0.77]), jaw(8), ANGRY),
    key(0.8, pelvis(0, -0.03), twist(6), bend(8, 0, 0, -2), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'release' }],
};

/** Snore: asleep on its feet, slumped with its eyes shut; it draws a big breath and lets out a huge snore that blasts at the foe, then droops again. */
export const snore: Clip = {
  name: 'snore',
  duration: 1.85,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.035), root({ roll: 3 }), bend(16, 6, 6, 18, 0, 8), LIMP, SHUT),
    // A big breath in.
    key(0.5, pelvis(0, -0.02), root({ roll: 2 }), bend(4, -4, -2, -6, 0, 6), LIMP, jaw(10), SHUT),
    // The snore blasts out, the head thrown back.
    snap(0.62, pelvis(0, -0.012), root({ roll: 1 }), bend(-6, -8, -8, -20, 0, 4), LIMP, jaw(40), SHUT),
    key(0.8, pelvis(0, -0.015), root({ roll: 1 }), bend(-5, -8, -8, -19, 0, 5), LIMP, jaw(36), SHUT),
    // Droops back into sleep.
    key(1.04, pelvis(0, -0.036), root({ roll: 3 }), bend(16, 6, 6, 18, 0, 8), LIMP, jaw(6), SHUT),
    key(1.3, pelvis(0, -0.03), root({ roll: 2 }), bend(14, 6, 5, 16, 0, 9), LIMP, jaw(2), SHUT),
    key(1.85, SHUT),
  ],
  events: [{ t: 0.68, name: 'release' }],
};

/**
 * Earthquake: it rears up, the right knee raised high and the arms flung
 * wide, then stomps down with everything into a deep squat: the ground
 * shakes (impact on the stomp).
 */
export const earthquake: Clip = {
  name: 'earthquake',
  duration: 1.8,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.05), bend(16, 4, 0, 4), BRACED, FISTS, ANGRY),
    // Rears up, the knee high, arms wide.
    key(0.46, { plantRight: 0 }, legR([-0.25, 0.48, 0.84], [-0.12, -0.42, 0.9]), pelvis(-0.012, 0.016), bend(-10, -6, -4, -14), ARMS_SPREAD_UP, FISTS, ANGRY, flames(0.6)),
    key(0.6, { plantRight: 0 }, legR([-0.25, 0.52, 0.82], [-0.12, -0.38, 0.92]), pelvis(-0.012, 0.018), bend(-11, -6, -4, -15), ARMS_SPREAD_UP, FISTS, ANGRY, flames(0.8)),
    // The stomp: down with everything.
    snap(0.7, pelvis(0, -0.1), bend(18, 8, 2, 6), BRACED, FISTS, jaw(20), ANGRY, flames(1)),
    key(0.84, pelvis(0.004, -0.104), bend(19, 8, 2, 6), BRACED, FISTS, jaw(14), ANGRY, flames(1)),
    key(1.02, pelvis(-0.004, -0.1), bend(18, 8, 2, 5), BRACED, FISTS, jaw(6), ANGRY, flames(0.8)),
    key(1.24, pelvis(0, -0.05), bend(10, 4, 0, 0), GUARD, ANGRY, flames(0.5)),
    key(1.8, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'impact' }],
};

export const RANGED: Clip[] = [ember, flamethrower, fire_spin, fire_blast, overheat, hyper_beam, hidden_power, swift, rock_tomb, rock_slide, mud_slap, snore, earthquake];
