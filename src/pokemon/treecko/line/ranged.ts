// Ranged moves, fired from home: drains (one hand, both hands, the whole
// body), seeds spat from the mouth (Bullet Seed and its run of hits), beams
// from the mouth (Solar Beam, Hyper Beam), an orb between the hands (Hidden
// Power), rocks called down (Rock Tomb), stars flung (Swift), a stomp that
// shakes the field (Earthquake), a snore, mud slung (Mud-Slap) and a stream
// of dragon breath. Written in Sceptile's time. A mouth release sits ~0.065 s
// after its key (the head's overlap), a hand's ~0.08 s.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/**
 * Absorb: a light draw. One hand rises toward the foe, fingers spread, the
 * body leaning in; the energy flows back (release) and the hand closes and
 * draws it in to its chest, the eyes shutting as it soaks it up.
 */
export function absorb(L: Line): Clip {
  const k = L.k;
  return L.clip('absorb', 1.34, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.02), k.twist(-8), k.bend(4, 0, 0, -2, 6), k.FOCUS, k.tail(4, -4), L.arms('reach', 'guardLow'), k.SPLAYED),
    // The hand held out at the foe, leaning in: the draw begins.
    L.key(0.3, L.pelvis(0, -0.03), k.twist(10), k.bend(12, 4, 0, -6, -4), k.FOCUS, k.tail(2, 6), L.arms('reachFar', 'guardLow'), k.SPLAYED),
    L.key(0.46, L.pelvis(0, -0.032), k.twist(12), k.bend(13, 4, 0, -6, -4, 2), k.FOCUS, k.tail(2, 8), L.arms('reachFar', 'guardLow'), k.SPLAYED),
    // Drawn in: the hand closes and comes back to the chest, the eyes shutting.
    L.key(0.7, L.pelvis(0, -0.02), k.twist(-4), k.bend(-2, -2, 0, -6), k.SHUT, k.tail(6, -2), L.arms('hug', 'guardLow'), k.FISTS),
    L.key(0.92, L.pelvis(0, -0.015), k.twist(-2), k.bend(-4, -2, 0, -8, 0, 3), k.SHUT, k.tail(8, 2), L.arms('hug', 'guardLow'), k.FISTS),
    L.key(1.12, L.pelvis(0, -0.01), k.bend(2, 0, 0, -2), k.FOCUS, k.tail(3)),
    L.key(1.34, k.OPEN),
  ], [{ t: 0.38, name: 'release' }]);
}

/**
 * Mega Drain: more of it. Both hands thrust out at the foe, fingers spread,
 * the body leaning into the pull; it hauls the energy in with both arms,
 * rocking back, chin up, eyes shut, the tail lifting.
 */
export function megaDrain(L: Line): Clip {
  const k = L.k;
  return L.clip('mega_drain', 1.6, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.04), k.bend(8, 2, 0, -4), k.FOCUS, k.tail(4), L.both('elbowsBack'), k.SPLAYED),
    // Both hands out at the foe, leaning into the pull.
    L.key(0.34, L.pelvis(0, -0.05), k.bend(18, 6, 0, -8), k.ANGRY, k.tail(0), L.both('reachFar'), k.SPLAYED),
    L.key(0.52, L.pelvis(0, -0.052), k.bend(19, 6, 0, -8, 0, 3), k.ANGRY, k.tail(-2, 4), L.both('reachFar'), k.SPLAYED),
    // Hauled in: both arms pull back to the chest, the body rocking back, chin up.
    L.key(0.78, L.pelvis(0, -0.03), k.bend(-8, -4, 0, -12), k.SHUT, k.tail(10), L.both('hug'), k.FISTS),
    L.key(1.0, L.pelvis(0, -0.025), k.bend(-10, -4, 0, -14, 0, -3), k.SHUT, k.tail(12, -4), L.both('hug'), k.FISTS),
    L.key(1.26, L.pelvis(0, -0.01), k.bend(2, 0, 0, -2), k.FOCUS, k.tail(4, 2), L.both('guard')),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.42, name: 'release' }]);
}

/**
 * Giga Drain: with the whole body. It crouches and gathers (a glow), flings
 * its arms wide open to the foe, and the energy floods back into it: the
 * body arches back, arms spread, face up, eyes shut, the tail rising; then it
 * folds the arms in over its chest, glowing, and settles.
 */
export function gigaDrain(L: Line): Clip {
  const k = L.k;
  return L.clip('giga_drain', 1.96, [
    L.key(0),
    // Gather: a crouch, arms crossed low, a glow.
    L.key(0.2, L.pelvis(0, -0.06), k.bend(16, 6, 0, 4), k.SHUT, k.tail(2), L.both('crossedLow'), k.FISTS),
    L.key(0.34, L.pelvis(0, -0.07), k.bend(18, 6, 0, 6, 0, 2), k.SHUT, k.tail(0, 4), L.both('crossedLow'), k.FISTS),
    // Flung wide open to the foe.
    L.snap(0.46, L.pelvis(0, -0.03), k.bend(8, 2, 0, -10), k.ANGRY, k.tail(8), L.both('spread'), k.SPLAYED),
    // The energy floods in: the body arches back, face up, eyes shut.
    L.key(0.76, L.pelvis(0, -0.01), k.bend(-12, -6, -4, -20), k.SHUT, k.jaw(10), k.tail(18), L.both('flare'), k.SPLAYED),
    L.key(1.04, L.pelvis(0, -0.005), k.bend(-14, -7, -4, -22, 0, 4), k.SHUT, k.jaw(14), k.tail(20, 4), L.both('flare'), k.SPLAYED),
    // Folded in over its chest, full.
    L.key(1.3, L.pelvis(0, -0.03), k.bend(8, 2, 0, 2), k.SHUT, k.tail(8, -2), L.both('hug'), k.FISTS),
    L.key(1.56, L.pelvis(0, -0.015), k.bend(4, 0, 0, -2), k.HAPPY, k.tail(4), L.both('guard')),
    L.key(1.96, k.OPEN),
  ], [{ t: 0.24, name: 'charge' }, { t: 0.54, name: 'release' }]);
}

// Bullet Seed: seeds spat from the mouth in bursts. Between the hits of a run
// it holds a ready pose (head drawn back, chest full); the lone clip is one
// burst.
const readyPose = (L: Line) => {
  const k = L.k;
  return [L.pelvis(0, -0.03), k.bend(-6, -3, -2, -16), k.ANGRY, k.jaw(6), k.tail(10), L.both('guardLow')];
};

/** Bullet Seed (one burst): a quick breath in, head back, then the head snaps forward and a burst of seeds flies from the mouth; it bobs back and settles. */
export function bulletSeed(L: Line): Clip {
  const k = L.k;
  return L.clip('bullet_seed', 1.1, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.02), k.bend(-4, -2, 0, -14), k.FOCUS, k.jaw(4), k.tail(8), L.both('guardLow')),
    L.key(0.26, ...readyPose(L)),
    L.snap(0.34, L.pelvis(0, -0.05), k.bend(16, 6, 8, 10), k.ANGRY, k.jaw(28), k.tail(0), L.both('guardLow')),
    L.key(0.48, L.pelvis(0, -0.03), k.bend(2, 0, 0, -4), k.ANGRY, k.jaw(10), k.tail(4, 4), L.both('guardLow')),
    L.key(0.7, L.pelvis(0, -0.015), k.bend(4, 0, 0, -2, 0, 2), k.FOCUS, k.jaw(2), k.tail(3, -2)),
    L.key(1.1, k.OPEN),
  ], [{ t: 0.4, name: 'release' }]);
}

/** Bullet Seed, first hit: the breath in, a burst, and it draws back into the ready pose for the next. */
export function bulletSeedFirst(L: Line): Clip {
  const k = L.k;
  return L.clip('bullet_seed_first', 0.74, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.02), k.bend(-4, -2, 0, -14), k.FOCUS, k.jaw(4), k.tail(8), L.both('guardLow')),
    L.key(0.26, ...readyPose(L)),
    L.snap(0.34, L.pelvis(0, -0.05), k.bend(16, 6, 8, 10), k.ANGRY, k.jaw(28), k.tail(0), L.both('guardLow')),
    L.key(0.5, L.pelvis(0, -0.032), k.bend(2, 0, 0, -6), k.ANGRY, k.jaw(10), k.tail(6, 4), L.both('guardLow')),
    L.key(0.74, ...readyPose(L)),
  ], [{ t: 0.4, name: 'release' }]);
}

/** Bullet Seed, a hit between: from the ready pose another burst, a little to the side, back to the ready pose. */
export function bulletSeedNext(L: Line): Clip {
  const k = L.k;
  return L.clip('bullet_seed_next', 0.58, [
    L.key(0, ...readyPose(L)),
    L.key(0.1, L.pelvis(0, -0.03), k.bend(-4, -2, 0, -14, 4), k.ANGRY, k.jaw(4), k.tail(8, -4), L.both('guardLow')),
    L.snap(0.18, L.pelvis(0, -0.052), k.bend(16, 6, 8, 10, -6, 3), k.ANGRY, k.jaw(28), k.tail(0, 6), L.both('guardLow')),
    L.key(0.34, L.pelvis(0, -0.034), k.bend(2, 0, 0, -6, -2), k.ANGRY, k.jaw(10), k.tail(6, 2), L.both('guardLow')),
    L.key(0.58, ...readyPose(L)),
  ], [{ t: 0.24, name: 'release' }]);
}

/** Bullet Seed, the last hit: from the ready pose the biggest burst, the whole body behind it, then it settles to its stance. */
export function bulletSeedLast(L: Line): Clip {
  const k = L.k;
  return L.clip('bullet_seed_last', 0.96, [
    L.key(0, ...readyPose(L)),
    L.key(0.1, L.pelvis(0, -0.03), k.bend(-6, -3, 0, -16), k.ANGRY, k.jaw(4), k.tail(10), L.both('guardLow')),
    L.snap(0.18, L.pelvis(0, -0.06), k.bend(20, 7, 9, 12), k.ANGRY, k.jaw(32), k.tail(-2), L.both('guardLow')),
    L.key(0.36, L.pelvis(0, -0.035), k.bend(4, 0, 0, -4), k.ANGRY, k.jaw(10), k.tail(4, 4), L.both('guardLow')),
    L.key(0.6, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2, 0, 2), k.FOCUS, k.jaw(2), k.tail(3, -2)),
    L.key(0.96, k.OPEN),
  ], [{ t: 0.24, name: 'release' }]);
}

/**
 * Solar Beam, the first turn: it turns its face up to the sun, arms spread
 * and palms up, and soaks the light in (charge), the body slowly rising and
 * filling; then it lowers its gaze to the foe, glowing, ready.
 */
export function solarBeamCharge(L: Line): Clip {
  const k = L.k;
  return L.clip('solar_beam_charge', 1.8, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.03), k.bend(-6, -4, -2, -16), k.FOCUS, k.tail(6), L.both('palmsUp'), k.SPLAYED),
    // Face up to the sun, soaking it in.
    L.key(0.5, L.pelvis(0, 0.005), k.bend(-12, -6, -6, -26), k.SHUT, k.tail(14), L.both('spread'), k.SPLAYED),
    L.key(0.86, L.pelvis(0, 0.01), k.bend(-14, -7, -6, -28, 0, 4), k.SHUT, k.tail(16, 4), L.both('spread'), k.SPLAYED),
    L.key(1.16, L.pelvis(0, 0.008), k.bend(-13, -6, -6, -27, 0, -3), k.SHUT, k.tail(16, -4), L.both('spread'), k.SPLAYED),
    // Gaze back down to the foe, full of light.
    L.key(1.44, L.pelvis(0, -0.02), k.bend(4, 0, 0, -4), k.ANGRY, k.tail(6), L.both('guardLow')),
    L.key(1.8, k.FOCUS),
  ], [{ t: 0.36, name: 'charge' }]);
}

/**
 * Solar Beam: it braces wide and low, the light gathering at its mouth
 * (charge), then fires the beam from its open jaws at the foe (release),
 * rigid, trembling with the force of it; the beam ends (releaseEnd), it
 * rocks back from the recoil and settles.
 */
export function solarBeam(L: Line): Clip {
  const k = L.k;
  return L.clip('solar_beam', 2.2, [
    L.key(0),
    // Brace wide and low, head drawn back.
    L.key(0.2, L.legs('squat'), L.pelvis(0, -0.06), k.bend(0, -2, 0, -14), k.FOCUS, k.jaw(6), k.tail(10), L.both('braced'), k.FISTS),
    L.key(0.42, L.legs('squat'), L.pelvis(0, -0.07), k.bend(-4, -3, 0, -18), k.SHUT, k.jaw(8), k.tail(12), L.both('braced'), k.FISTS),
    // Fire: the head drives forward, jaws wide.
    L.snap(0.56, L.legs('squat'), L.pelvis(0, -0.08), k.bend(14, 4, 6, 4), k.ANGRY, k.jaw(34), k.tail(0), L.both('braced'), k.FISTS),
    // Holding it, rigid, trembling.
    L.key(0.8, L.legs('squat'), L.pelvis(0, -0.082), k.bend(15, 4, 6, 4, 2, 2), k.ANGRY, k.jaw(36), k.tail(-2, 4), L.both('braced'), k.FISTS),
    L.key(1.04, L.legs('squat'), L.pelvis(0, -0.08), k.bend(14, 4, 6, 5, -2, -2), k.ANGRY, k.jaw(34), k.tail(-2, -4), L.both('braced'), k.FISTS),
    L.key(1.28, L.legs('squat'), L.pelvis(0, -0.083), k.bend(15, 4, 6, 4, 2, 1), k.ANGRY, k.jaw(36), k.tail(-2, 3), L.both('braced'), k.FISTS),
    // The beam ends: the recoil rocks it back.
    L.key(1.5, L.pelvis(0, -0.04, -0.01), k.bend(-6, -2, 0, -10), k.FOCUS, k.jaw(8), k.tail(10), L.both('guardLow')),
    L.key(1.76, L.pelvis(0, -0.02), k.bend(4, 0, 0, -2), k.FOCUS, k.jaw(2), k.tail(4, 2), L.both('guard')),
    L.key(2.2, k.OPEN),
  ], [{ t: 0.24, name: 'charge' }, { t: 0.62, name: 'release' }, { t: 1.36, name: 'releaseEnd' }]);
}

/**
 * Hyper Beam: a long gather, hunched over the power building at its mouth
 * (charge), then braced wide it fires (release) and holds the enormous beam,
 * shaking; when it ends (releaseEnd) the recoil throws it back and it sags,
 * spent (it must recharge), then drags itself back up.
 */
export function hyperBeam(L: Line): Clip {
  const k = L.k;
  return L.clip('hyper_beam', 2.6, [
    L.key(0),
    // Hunched over the power building at its mouth.
    L.key(0.24, L.pelvis(0, -0.06), k.bend(22, 8, 4, 10), k.SHUT, k.jaw(12), k.tail(-4), L.both('crossedLow'), k.FISTS),
    L.key(0.5, L.pelvis(0, -0.07), k.bend(24, 9, 4, 12, 0, 3), k.SHUT, k.jaw(16), k.tail(-6, 4), L.both('crossedLow'), k.FISTS),
    // Brace wide, the head coming up and back.
    L.key(0.7, L.legs('squat'), L.pelvis(0, -0.08), k.bend(-4, -3, 0, -18), k.ANGRY, k.jaw(10), k.tail(12), L.both('braced'), k.FISTS),
    // Fire.
    L.snap(0.82, L.legs('squat'), L.pelvis(0, -0.09), k.bend(16, 5, 6, 4), k.ANGRY, k.jaw(40), k.tail(-2), L.both('braced'), k.FISTS),
    L.key(1.06, L.legs('squat'), L.pelvis(0, -0.092), k.bend(17, 5, 6, 4, 3, 2), k.ANGRY, k.jaw(42), k.tail(-4, 6), L.both('braced'), k.FISTS),
    L.key(1.3, L.legs('squat'), L.pelvis(0, -0.09), k.bend(16, 5, 6, 5, -3, -2), k.ANGRY, k.jaw(40), k.tail(-4, -6), L.both('braced'), k.FISTS),
    L.key(1.54, L.legs('squat'), L.pelvis(0, -0.093), k.bend(17, 5, 6, 4, 2, 2), k.ANGRY, k.jaw(42), k.tail(-4, 4), L.both('braced'), k.FISTS),
    // The recoil throws it back...
    L.key(1.72, L.pelvis(0, -0.05, -0.015), k.bend(-12, -4, 0, -14), k.HURT, k.jaw(16), k.tail(16), L.both('flinch')),
    // ... and it sags, spent.
    L.key(1.98, L.pelvis(0, -0.08), k.bend(24, 6, 0, 12, 0, 6), k.DROWSY, k.jaw(12), k.tail(-6), L.both('droop')),
    L.key(2.24, L.pelvis(0, -0.05), k.bend(12, 2, 0, 4, 0, 2), k.DROWSY, k.jaw(4), k.tail(-2), L.both('guardLow')),
    L.key(2.6, k.OPEN),
  ], [{ t: 0.22, name: 'charge' }, { t: 0.88, name: 'release' }, { t: 1.62, name: 'releaseEnd' }]);
}

/**
 * Hidden Power: it cups its hands together in front of its chest and an orb
 * of power forms between them (charge), grows as it draws the hands back to
 * its side, then it thrusts both hands at the foe and the orb flies (release).
 */
export function hiddenPower(L: Line): Clip {
  const k = L.k;
  return L.clip('hidden_power', 1.56, [
    L.key(0),
    // Hands cupped together in front of the chest, eyes shut, the orb forming.
    L.key(0.2, L.pelvis(0, -0.03), k.bend(8, 2, 0, 6), k.SHUT, k.tail(4), L.both('crossed'), k.SPLAYED),
    L.key(0.4, L.pelvis(0, -0.035), k.bend(9, 2, 0, 7, 0, 3), k.SHUT, k.tail(4, 4), L.both('crossed'), k.SPLAYED),
    // Drawn back to its right side, the orb held there, the body coiling.
    L.key(0.62, L.pelvis(0, -0.05), k.twist(-26), k.bend(6, 2, 0, -6, 12), k.FOCUS, k.tail(8, -10), L.both('fistHip'), k.SPLAYED),
    L.key(0.74, L.pelvis(0, -0.052), k.twist(-28), k.bend(7, 2, 0, -6, 12, 2), k.FOCUS, k.tail(8, -12), L.both('fistHip'), k.SPLAYED),
    // Both palms thrust at the foe: the orb flies.
    L.snap(0.84, L.pelvis(0, -0.05), k.twist(10), k.bend(16, 6, 0, -8, -4), k.ANGRY, k.tail(0, 10), L.both('palm'), k.FLAT),
    L.key(1.02, L.pelvis(0, -0.05), k.twist(12), k.bend(17, 6, 0, -8, -4, 2), k.ANGRY, k.tail(-2, 12), L.both('palm'), k.FLAT),
    L.key(1.24, L.pelvis(0, -0.02), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(4, 2), L.both('guard')),
    L.key(1.56, k.OPEN),
  ], [{ t: 0.24, name: 'charge' }, { t: 0.92, name: 'release' }]);
}

/**
 * Rock Tomb: it raises its right arm high, calling the rocks up out of the
 * sky above the foe, then swings the arm down at the foe and the rocks come
 * crashing down around it (release); it holds the arm out, pointing.
 */
export function rockTomb(L: Line): Clip {
  const k = L.k;
  return L.clip('rock_tomb', 1.5, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.04), k.twist(-10), k.bend(6, 2, 0, -4), k.FOCUS, k.tail(6, -4), L.arms('guard', 'guardLow'), k.FISTS),
    // The arm raised high, calling, the head tipped up.
    L.key(0.38, L.pelvis(0, 0.005), k.twist(-6), k.bend(-10, -4, 0, -18), k.ANGRY, k.tail(14), L.arms('spread', 'guardLow'), k.SPLAYED),
    L.key(0.56, L.pelvis(0, 0.008), k.twist(-6), k.bend(-11, -4, 0, -19, 0, 3), k.ANGRY, k.tail(16, 4), L.arms('spread', 'guardLow'), k.SPLAYED),
    // Swung down at the foe: the rocks fall.
    L.snap(0.66, L.pelvis(0, -0.05), k.twist(14), k.bend(16, 6, 0, -8, -6), k.ANGRY, k.tail(2, 10), L.arms('chopDown', 'guardLow'), k.SPLAYED),
    // Pointing at the tomb.
    L.key(0.86, L.pelvis(0, -0.05), k.twist(12), k.bend(14, 5, 0, -8, -6, 2), k.ANGRY, k.tail(0, 12), L.arms('reach', 'guardLow'), k.SPLAYED),
    L.key(1.1, L.pelvis(0, -0.02), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(4, 2), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.74, name: 'release' }]);
}

/**
 * Swift: an overhand throw, like a ninja's stars: the hand cocked back by its
 * ear, the chest turned away, then whipped forward at the foe, flinging a
 * spray of stars (release), and on across its body to its left.
 */
export function swift(L: Line): Clip {
  const k = L.k;
  return L.clip('swift', 1.3, [
    L.key(0),
    // Cocked by the ear, the chest turned away, the other hand forward to sight the foe.
    L.key(0.18, L.pelvis(0, -0.04), k.twist(-22), k.bend(6, 2, 0, -6, 10), k.FOCUS, k.tail(4, -10), L.arms('fistBack', 'reach'), k.FLAT),
    L.key(0.3, L.pelvis(0, -0.045), k.twist(-26), k.bend(6, 2, 0, -6, 12), k.ANGRY, k.tail(4, -12), L.arms('fistBack', 'reach'), k.FLAT),
    // The throw: whipped forward, the fingers flinging open.
    L.snap(0.38, L.pelvis(0, -0.04), k.twist(12), k.bend(14, 4, 0, -6, -4), k.ANGRY, k.tail(2, 10), L.arms('reachFar', 'guardLow'), k.SPLAYED),
    // On across its body to its left.
    L.key(0.54, L.pelvis(0, -0.045), k.twist(26, -4), k.bend(16, 5, 0, -6, -8), k.ANGRY, k.tail(2, 16), L.arms('slashEnd', 'guardLow'), k.SPLAYED),
    L.key(0.74, L.pelvis(0, -0.04), k.twist(24, -4), k.bend(15, 5, 0, -6, -7, 2), k.FOCUS, k.tail(2, 14), L.arms('slashEnd', 'guardLow'), k.SPLAYED),
    L.key(0.98, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3, 2), L.both('guard')),
    L.key(1.3, k.OPEN),
  ], [{ t: 0.44, name: 'release' }]);
}

/**
 * Earthquake: a sumo stomp: it leans onto its right foot and raises the left
 * knee high out to its side, arms up and out, then stamps the foot down with
 * its whole weight (impact: the ground shakes), dropping into a deep,
 * wide-kneed crouch, arms braced, and rises.
 */
export function earthquake(L: Line): Clip {
  const k = L.k;
  return L.clip('earthquake', 1.7, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.04), k.bend(8, 2, 0, -4), k.FOCUS, k.tail(4), L.both('low'), k.FISTS),
    // Rear up: the right knee high, the arms up, leaning back.
    L.key(0.42, L.legs('stompL'), L.pelvis(-0.02, 0.005), k.twist(0, 8), k.bend(-6, -2, 0, -10), k.ANGRY, k.jaw(12), k.tail(16, 8), L.both('spread'), k.FISTS),
    L.key(0.56, L.legs('stompL'), L.pelvis(-0.024, 0.008), k.twist(0, 10), k.bend(-8, -3, 0, -12, 0, 3), k.ANGRY, k.jaw(16), k.tail(18, 10), L.both('spread'), k.FISTS),
    // The stamp: the foot comes down with all its weight.
    L.fall(0.66, L.legs('squat'), L.pelvis(0, -0.1), k.bend(26, 8, 0, 4), k.ANGRY, k.jaw(20), k.tail(-6), L.both('braced'), k.FISTS),
    // Deep in the crouch as the ground shakes.
    L.key(0.86, L.legs('squat'), L.pelvis(0, -0.105), k.bend(27, 8, 0, 4, 0, 3), k.ANGRY, k.jaw(10), k.tail(-8, 6), L.both('braced'), k.FISTS),
    L.key(1.06, L.legs('squat'), L.pelvis(0, -0.1), k.bend(25, 8, 0, 3, 0, -3), k.ANGRY, k.jaw(6), k.tail(-6, -6), L.both('braced'), k.FISTS),
    L.key(1.32, L.pelvis(0, -0.03), k.bend(8, 2, 0, -2), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.66, name: 'impact' }]);
}

/**
 * Snore (only while it sleeps): slumped asleep, eyes shut, it draws a huge
 * breath, chest swelling, then snores out loud, head tipped back and jaws
 * wide (release: the sound waves hit the foe); a smaller snore, then it
 * sinks back.
 */
export function snore(L: Line): Clip {
  const k = L.k;
  return L.clip('snore', 1.9, [
    L.key(0),
    // Slumped asleep.
    L.key(0.2, L.pelvis(0, -0.06), k.bend(18, 6, 0, 16, 0, 8), k.SHUT, k.tail(-6), L.both('droop')),
    // A huge breath in, the chest swelling, the head coming up.
    L.key(0.5, L.pelvis(0, -0.03), k.bend(-6, -4, 0, -4, 0, 6), k.SHUT, k.jaw(4), k.tail(0), L.both('droop')),
    L.key(0.66, L.pelvis(0, -0.025), k.bend(-10, -5, 0, -10, 0, 5), k.SHUT, k.jaw(6), k.tail(2), L.both('droop')),
    // The snore: head tipped back, jaws wide, blasted out.
    L.snap(0.76, L.pelvis(0, -0.04), k.bend(-4, -2, -4, -18, 0, 4), k.SHUT, k.jaw(34), k.tail(6), L.both('droop')),
    L.key(0.98, L.pelvis(0, -0.05), k.bend(4, 0, -2, -12, 0, 6), k.SHUT, k.jaw(24), k.tail(2, 4), L.both('droop')),
    // A smaller one, then it sinks back.
    L.key(1.16, L.pelvis(0, -0.045), k.bend(2, 0, -2, -14, 0, 4), k.SHUT, k.jaw(16), k.tail(2, -2), L.both('droop')),
    L.key(1.4, L.pelvis(0, -0.06), k.bend(16, 5, 0, 14, 0, 8), k.SHUT, k.jaw(2), k.tail(-4), L.both('droop')),
    L.key(1.64, L.pelvis(0, -0.02), k.bend(4, 0, 0, 4, 0, 2), k.DROWSY, k.tail(0)),
    L.key(1.9, k.OPEN),
  ], [{ t: 0.82, name: 'release' }]);
}

/**
 * Mud-Slap: it stoops and rakes the ground beside its right foot, drags a
 * handful of mud back past its hip, swings it through low and slings it
 * underhand at the foe (release), the fingers opening in the follow-through;
 * the left arm keeps its guard.
 */
export function mudSlap(L: Line): Clip {
  const k = L.k;
  const drag = L.raw([[-0.45, -0.8, -0.4], [-0.25, -0.85, -0.47], [-0.15, -0.8, -0.58]], L.armL('guardLow'));
  const through = L.raw([[-0.42, -0.85, 0.3], [-0.25, -0.6, 0.76], [-0.15, -0.45, 0.88]], L.armL('guardLow'));
  const hang = L.raw([[-0.42, 0.52, 0.74], [-0.26, 0.78, 0.57], [-0.2, 0.84, 0.5]], L.armL('guardLow'));
  return L.clip('mud_slap', 1.16, [
    L.key(0),
    // Stoop: the hand rakes the ground beside its right foot, the tail lifts.
    L.key(0.14, L.pelvis(0, -0.08, -0.005), k.twist(4), k.bend(24, 6, 0, 14), k.FOCUS, k.tail(20), L.arms('scoop', 'guardLow'), k.SPLAYED),
    // Scoop: dragged back along the ground past the right hip, weight back.
    L.key(0.24, L.pelvis(0.01, -0.07, -0.012), k.twist(-16), k.bend(20, 5, 0, 4, 6), k.ANGRY, k.tail(10), drag, k.FISTS),
    // Swing: the arm comes through low beside the hip as the torso unwinds.
    L.key(0.3, L.pelvis(0, -0.06, 0.002), k.twist(4), k.bend(16, 5, 0, 0, 3), k.ANGRY, k.tail(6, 6), through, k.FISTS),
    // Sling it: whipped forward and up underhand, the fingers opening.
    L.snap(0.36, L.pelvis(-0.005, -0.035, 0.004), k.twist(22), k.bend(10, 5, 0, -8, -4), k.ANGRY, k.tail(4, 14), L.arms('sling', 'guardLow'), k.SPLAYED),
    // Follow-through: the hand open high and out at the foe, hanging a moment.
    L.key(0.5, L.pelvis(-0.006, -0.034, 0.004), k.twist(25), k.bend(11, 5, 0, -8, -5), k.ANGRY, k.tail(4, 18), hang, k.SPLAYED),
    L.key(0.64, L.pelvis(-0.005, -0.033, 0.004), k.twist(24), k.bend(10, 5, 0, -7, -4, 2), k.ANGRY, k.tail(4, 16), hang, k.SPLAYED),
    L.key(0.9, L.pelvis(0, -0.02), k.twist(6), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(4, 4)),
    L.key(1.16, k.OPEN),
  ], [{ t: 0.42, name: 'release' }]);
}

/**
 * DragonBreath: a deep breath in (chest up, head back, jaws to the sky, the
 * elbows drawn back; charge), a swelling hold, then the head drives forward
 * and down at the foe, jaws wide, body braced low, and the stream pours out
 * (release) with small sweeps of the head; it closes its jaws (releaseEnd)
 * and shakes it off.
 */
export function dragonBreath(L: Line): Clip {
  const k = L.k;
  return L.clip('dragon_breath', 1.9, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.02), k.bend(2, 0, 0, -2), k.FOCUS, k.tail(4), L.both('guardLow')),
    // The breath in: chest up, head back, jaws to the sky, elbows back.
    L.key(0.46, L.pelvis(0, 0.01), k.bend(-12, -6, -6, -24), k.SHUT, k.jaw(18), k.tail(14), L.both('elbowsBack'), k.FISTS),
    L.key(0.62, L.pelvis(0, 0.012), k.bend(-14, -7, -6, -26, 0, 2), k.SHUT, k.jaw(20), k.tail(16), L.both('elbowsBack'), k.FISTS),
    // The head drives forward and down at the foe, jaws wide.
    L.snap(0.76, L.pelvis(0, -0.06), k.bend(18, 6, 8, 6), k.ANGRY, k.jaw(38), k.tail(0), L.both('braced'), k.FISTS),
    // Sustained, the head sweeping a little.
    L.key(1.0, L.pelvis(0, -0.062), k.bend(18, 6, 8, 6, 5, 2), k.ANGRY, k.jaw(36), k.tail(-2, -6), L.both('braced'), k.FISTS),
    L.key(1.24, L.pelvis(0, -0.062), k.bend(18, 6, 8, 6, -5, -2), k.ANGRY, k.jaw(38), k.tail(-2, 6), L.both('braced'), k.FISTS),
    L.key(1.44, L.pelvis(0, -0.04), k.bend(8, 2, 2, -4), k.ANGRY, k.jaw(6), k.tail(4), L.both('guardLow')),
    // Shakes it off.
    L.key(1.6, L.pelvis(0, -0.025), k.bend(4, 0, 0, -2, 10, 4), k.FOCUS, k.jaw(2), k.tail(4, 6), L.both('guard')),
    L.key(1.9, k.OPEN),
  ], [{ t: 0.1, name: 'charge' }, { t: 0.82, name: 'release' }, { t: 1.4, name: 'releaseEnd' }]);
}

export const RANGED = {
  absorb, mega_drain: megaDrain, giga_drain: gigaDrain,
  bullet_seed: bulletSeed, bullet_seed_first: bulletSeedFirst, bullet_seed_next: bulletSeedNext, bullet_seed_last: bulletSeedLast,
  solar_beam_charge: solarBeamCharge, solar_beam: solarBeam, hyper_beam: hyperBeam, hidden_power: hiddenPower,
  rock_tomb: rockTomb, swift, earthquake, snore, mud_slap: mudSlap, dragon_breath: dragonBreath,
};
