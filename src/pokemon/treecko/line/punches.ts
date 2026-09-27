// Punches: every one goes to the foe and drives a fist into it (the hips and
// shoulders turning into the blow), then hops home. Each has its own shape: a
// looping haymaker (Mega Punch), a leaping overhand from the air
// (ThunderPunch), a slow coil and an explosive lunge (DynamicPunch), a still,
// dead-straight punch from the hip (Focus Punch) and an uppercut driven up out
// of a brace (Counter). Written in Sceptile's time; a hand lands ~0.07 s after
// its key, so impacts sit that far after the strike key.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/**
 * Mega Punch: a haymaker. The fist wound far back and the chest turned away,
 * the other hand held out to sight the foe; a leap in, then the hips and
 * shoulders whip round and the fist loops in with everything behind it; the
 * follow-through carries it across, the body over the front foot.
 */
export function megaPunch(L: Line): Clip {
  const k = L.k;
  const loop = L.raw(L.mix(L.arm('hook'), L.arm('punch'), 0.55), L.armL('fistHip'));
  return L.clip('mega_punch', 1.62, [
    L.key(0),
    // Wind up: sink, the chest turning far away, the right fist wound back, the left hand out front.
    L.key(0.2, L.pelvis(0, -0.05), k.twist(-34), k.bend(10, 2, 0, -6, 14), k.FOCUS, k.tail(8, -14), L.arms('fistBack', 'reach'), k.FISTS),
    L.key(0.34, L.at(0.55), L.air(0.08), L.legs('tuck'), k.twist(-36), k.bend(8, 2, 0, -8, 16), k.ANGRY, k.tail(16, -16), L.arms('fistBack', 'reach'), k.FISTS),
    // Plant at the foe on the front foot, still wound.
    L.key(0.46, L.at(1), k.LAND, L.legs('lungeR'), k.twist(-38), k.bend(12, 2, 0, -8, 16), k.ANGRY, k.tail(8, -14), L.arms('fistBack', 'reach'), k.FISTS),
    // The haymaker: hips and shoulders whip round, the fist loops in.
    L.snap(0.54, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.05), k.twist(30, -4), k.bend(18, 6, 0, -6, -10), k.ANGRY, k.tail(2, 22), loop, k.FISTS),
    // Follow-through: the fist carries on across, the body over the front foot.
    L.key(0.7, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.055), k.twist(40, -6), k.bend(24, 8, 0, -6, -14), k.ANGRY, k.tail(0, 28), L.arms('hook', 'fistHip'), k.FISTS),
    L.key(0.9, L.at(1), L.pelvis(0, -0.035), k.twist(8), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, 8), L.both('guard')),
    L.key(1.04, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.16, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.62, k.OPEN),
  ], [{ t: 0.61, name: 'impact' }]);
}

/**
 * ThunderPunch: the fist cocked back, crackling, a crouch and a high leap;
 * from the top of it the fist comes over the top and down into the foe's face
 * as it drops, and it lands on it with the fist carried through.
 */
export function thunderPunch(L: Line): Clip {
  const k = L.k;
  return L.clip('thunder_punch', 1.5, [
    L.key(0),
    // The fist cocked back and up, a shiver through the shoulders as it charges.
    L.key(0.14, L.pelvis(0, -0.04), k.twist(-20), k.bend(8, 2, 0, -6, 10, -3), k.ANGRY, k.tail(8, -10), L.arms('fistBack', 'guardLow'), k.FISTS),
    L.key(0.24, L.pelvis(0, -0.07), k.twist(-26), k.bend(14, 3, 0, -8, 12, 4), k.ANGRY, k.tail(4, -12), L.arms('fistBack', 'guardLow'), k.FISTS),
    // Spring up at the foe, the fist over the shoulder.
    L.key(0.36, L.at(0.6), L.air(0.15), L.legs('tuck'), k.twist(-28), k.bend(-2, -2, 0, -12, 12), k.ANGRY, k.tail(24, -12), L.arms('fistBack', 'reach'), k.FISTS),
    L.key(0.45, L.at(0.94), L.air(0.17), L.legs('hop'), k.twist(-30), k.bend(4, 0, 0, -12, 12), k.ANGRY, k.tail(26, -10), L.arms('fistBack', 'reach'), k.FISTS),
    // From the air: over the top and down into its face.
    L.snap(0.53, L.at(1), L.air(0.09), L.legs('drop'), k.twist(24, -4), k.bend(26, 10, 2, 0, -8), k.ANGRY, k.tail(12, 16), L.arms('overhand', 'fistHip'), k.FISTS),
    // Lands on it, the fist driven on down through.
    L.key(0.65, L.at(1), k.LAND, L.pelvis(0, -0.065), k.twist(28, -5), k.bend(30, 11, 2, 2, -10), k.ANGRY, k.tail(0, 20), L.arms('hammerDown', 'fistHip'), k.FISTS),
    L.key(0.84, L.at(1), L.pelvis(0, -0.035), k.twist(4), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, 4), L.both('guard')),
    L.key(0.98, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.1, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.6, name: 'impact' }]);
}

/**
 * DynamicPunch: a slow, deep coil, the whole body wound round and the fist
 * far back; then it launches, the fist leading, and lands in a long lunge that
 * drives the punch dead straight through the foe; a beat of stillness at full
 * extension while the blow echoes.
 */
export function dynamicPunch(L: Line): Clip {
  const k = L.k;
  return L.clip('dynamic_punch', 2.0, [
    L.key(0),
    // The coil: slow and deep, the whole body wound round, the fist far back.
    L.key(0.26, L.pelvis(0, -0.06), k.twist(-30), k.bend(14, 4, 0, -6, 12), k.FOCUS, k.tail(8, -16), L.arms('fistBack', 'guard'), k.FISTS),
    L.key(0.46, L.pelvis(0, -0.09), k.twist(-46), k.bend(22, 6, 0, -8, 18, 2), k.FOCUS, k.tail(4, -24), L.arms('fistHip', 'reach'), k.FISTS),
    // Launch at the foe, the fist starting forward.
    L.key(0.6, L.at(0.6), L.air(0.07), L.legs('tuck'), k.twist(-30), k.bend(14, 4, 0, -8, 12), k.ANGRY, k.tail(16, -20), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.7, L.at(1), k.LAND, L.legs('lungeR'), k.twist(-34), k.bend(18, 4, 0, -8, 14), k.ANGRY, k.tail(8, -20), L.arms('fistHip', 'reach'), k.FISTS),
    // The explosion: everything drives through the fist, dead straight.
    L.snap(0.77, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.06), k.twist(34, -6), k.bend(24, 8, 0, -6, -12), k.ANGRY, k.jaw(18), k.tail(-4, 28), L.arms('punch', 'fistHip'), k.FISTS),
    // A beat of stillness at full extension (a moving hold), the blow still echoing.
    L.key(0.94, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.064), k.twist(36, -6), k.bend(25, 8, 0, -6, -12, 2), k.ANGRY, k.jaw(10), k.tail(-6, 30), L.arms('punch', 'fistHip'), k.FISTS),
    L.key(1.14, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.06), k.twist(33, -6), k.bend(23, 8, 0, -6, -12, -1), k.ANGRY, k.jaw(4), k.tail(-4, 26), L.arms('punch', 'fistHip'), k.FISTS),
    L.key(1.32, L.at(1), L.pelvis(0, -0.035), k.twist(8), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, 8), L.both('guard')),
    L.key(1.46, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.58, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(2.0, k.OPEN),
  ], [{ t: 0.84, name: 'impact' }]);
}

/**
 * Focus Punch: from a still, focused stance (the focus itself is the `focus`
 * situation) it springs in and fires the straightest punch of its set, the
 * fist driven from the hip as the other snaps back to its hip; it holds the
 * extension, then home.
 */
export function focusPunch(L: Line): Clip {
  const k = L.k;
  return L.clip('focus_punch', 1.7, [
    L.key(0),
    // Still and focused: the fist chambered at the hip, the other hand forward, a slow breath out.
    L.key(0.16, L.pelvis(0, -0.045), k.twist(-20), k.bend(8, 2, 0, -2, 8), k.FOCUS, k.tail(4, -8), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.32, L.pelvis(0, -0.055), k.twist(-22), k.bend(10, 2, 0, -2, 8, 1), k.SHUT, k.tail(3, -8), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.44, L.at(0.6), L.air(0.07), L.legs('tuck'), k.twist(-24), k.bend(8, 2, 0, -4, 10), k.FOCUS, k.tail(12, -10), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.54, L.at(1), k.LAND, L.legs('lungeR'), k.twist(-24), k.bend(10, 2, 0, -4, 10), k.FOCUS, k.tail(6, -8), L.arms('fistHip', 'reach'), k.FISTS),
    // The punch: dead straight, the other fist snapping back to the hip.
    L.snap(0.6, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.05), k.twist(24, -2), k.bend(16, 6, 0, -6, -8), k.ANGRY, k.tail(0, 18), L.arms('punch', 'fistHip'), k.FISTS),
    L.key(0.78, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.052), k.twist(26, -2), k.bend(17, 6, 0, -6, -9, 1), k.ANGRY, k.tail(-2, 20), L.arms('punch', 'fistHip'), k.FISTS),
    L.key(0.98, L.at(1), L.pelvis(0, -0.035), k.twist(6), k.bend(10, 2, 0, -2), k.FOCUS, k.tail(4, 6), L.both('guard')),
    L.key(1.12, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.FOCUS, k.tail(10), L.both('guard')),
    L.key(1.24, L.at(0), k.LAND, k.LIGHT, k.FOCUS, k.tail(2), L.both('guard')),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.66, name: 'impact' }]);
}

/**
 * Counter: played after it was hit, so it starts by taking the blow (pushed
 * back behind crossed arms, eyes screwed shut); then anger: it drops into a
 * crouch, springs at the foe and drives an uppercut up through it.
 */
export function counter(L: Line): Clip {
  const k = L.k;
  // The uppercut drives up and forward, into the foe's jaw.
  const rising = L.raw(L.mix(L.arm('uppercut'), L.arm('punchHigh'), 0.5), L.armL('fistHip'));
  return L.clip('counter', 1.46, [
    L.key(0),
    // Absorb: pushed back into a brace behind crossed arms.
    L.key(0.1, L.pelvis(0, -0.03, -0.012), k.bend(-6, -4, 0, 6), k.HURT, k.tail(10), L.both('crossed')),
    // Drop into a crouch, the fist low and back for the uppercut.
    L.key(0.26, L.pelvis(0, -0.075, -0.01), k.twist(-16), k.bend(20, 6, 0, -6, 8), k.ANGRY, k.jaw(10), k.tail(4, -10), L.arms('uppercutLow', 'guard'), k.FISTS),
    // Spring straight back at the foe, low and fast.
    L.key(0.36, L.at(0.6), L.air(0.05), L.legs('tuck'), k.twist(-18), k.bend(22, 6, 0, -8, 8), k.ANGRY, k.tail(14, -10), L.arms('uppercutLow', 'guard'), k.FISTS),
    L.key(0.44, L.at(1), k.LAND, L.pelvis(0, -0.02), k.twist(-18), k.bend(24, 6, 0, -8, 8), k.ANGRY, k.tail(8, -8), L.arms('uppercutLow', 'guard'), k.FISTS),
    // The uppercut: it rises out of the crouch, the fist driving up through the foe.
    L.snap(0.5, L.at(1), L.pelvis(0, 0.01), k.twist(20, -3), k.bend(6, 2, 0, -12, -6), k.ANGRY, k.jaw(20), k.tail(-4, 14), rising, k.FISTS),
    // Carried on up, the body rising tall behind it.
    L.key(0.64, L.at(1), L.pelvis(0, 0.015), k.twist(24, -4), k.bend(-8, -4, 0, -14, -8), k.ANGRY, k.jaw(12), k.tail(-6, 18), L.arms('uppercut', 'fistHip'), k.FISTS),
    L.key(0.82, L.at(1), L.pelvis(0, -0.035), k.twist(6), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4, 6), L.both('guard')),
    L.key(0.96, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.08, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.46, k.OPEN),
  ], [{ t: 0.56, name: 'impact' }]);
}

export const PUNCHES = { mega_punch: megaPunch, thunder_punch: thunderPunch, dynamic_punch: dynamicPunch, focus_punch: focusPunch, counter };
