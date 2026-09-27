// Kicks, the tail, slams and the jaws: every one goes to the foe and strikes it
// there with that part of the body, then hops home. Written in Sceptile's
// time. Legs have no overlap delay (a kick lands on its key); the head trails
// ~0.065 s; the tail's tip trails its root by up to ~0.1 s.
//
// Root yaw: + turns the body to its left. The tail points back, so with the
// body turned 180 the tail points at the foe; a tail sweep (+ toward its
// right) adds to the body's turn.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/**
 * Mega Kick: a long bound at the foe, turning side-on in the air to its
 * right; it lands on its right foot with its left side to the foe, the left
 * knee chambered up across its chest, eyes on the foe over its shoulder; then
 * the leg shoots straight out sideways into the foe, the body tilting away
 * behind it (a side kick). Turned this way, from both sides of the field its
 * face points toward the foe and the tail trails away, so the kick reads in
 * profile. It holds the leg out a beat, draws it in, hops round to face the
 * foe and goes home.
 */
export function megaKick(L: Line): Clip {
  const k = L.k;
  return L.clip('mega_kick', 1.86, [
    L.key(0),
    // Gather: a deep crouch, arms back for the bound.
    L.key(0.2, L.pelvis(0, -0.07), k.bend(16, 4, 0, -8), k.FOCUS, k.tail(10), L.both('back')),
    // A long bound, turning side-on in the air.
    L.key(0.36, L.at(0.5), L.air(0.12), L.legs('tuck'), L.root({ yaw: -30 }), k.twist(10), k.bend(10, 2, 0, -8, 16), k.ANGRY, k.tail(24), L.both('back')),
    L.key(0.5, L.at(0.9), L.air(0.07), L.legs('tuck'), L.root({ yaw: -78 }), k.twist(22), k.bend(4, 0, 0, -8, 36), k.ANGRY, k.tail(20, -8), L.arms('wide', 'guard')),
    // Down on the right foot, side-on, the left knee chambered, eyes on the foe over its shoulder.
    L.key(0.6, L.at(1), L.legs('sideChamberL'), L.root({ yaw: -90 }), L.pelvis(0, -0.04), k.twist(26, 4), k.bend(2, 0, 0, -8, 42), k.ANGRY, k.tail(14, -10), L.arms('wide', 'guard')),
    L.key(0.68, L.at(1), L.legs('sideChamberL'), L.root({ yaw: -92 }), L.pelvis(0, -0.046), k.twist(28, 6), k.bend(0, 0, 0, -8, 44), k.ANGRY, k.tail(16, -12), L.arms('wide', 'guard')),
    // The kick: the leg shoots straight out into the foe, the body tilting away.
    L.snap(0.74, L.at(1), L.legs('sideKickL'), L.root({ yaw: -90 }), L.pelvis(0, -0.03), k.twist(22, 20), k.bend(-4, -2, 0, -6, 40), k.ANGRY, k.tail(8, -20), L.arms('wide', 'guard')),
    // Held out a beat, then drawn back in.
    L.key(0.9, L.at(1), L.legs('sideKickL'), L.root({ yaw: -88 }), L.pelvis(0, -0.034), k.twist(22, 22), k.bend(-4, -2, 0, -6, 38, -2), k.ANGRY, k.tail(8, -22), L.arms('wide', 'guard')),
    L.key(1.02, L.at(1), L.legs('sideChamberL'), L.root({ yaw: -82 }), L.pelvis(0, -0.042), k.twist(18, 8), k.bend(2, 0, 0, -6, 32), k.ANGRY, k.tail(10, -12), L.both('guard')),
    // A little hop round to face the foe.
    L.key(1.12, L.at(1), L.air(0.05), L.legs('hop'), L.root({ yaw: -30 }), k.bend(6, 0, 0, -2, 10), k.ANGRY, k.tail(10, -4), L.both('guard')),
    L.key(1.22, L.at(1), k.LAND, k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.36, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.48, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.86, k.OPEN),
  ], [{ t: 0.74, name: 'impact' }]);
}

/**
 * Slam: it springs in and whips round, turning its back to the foe; at the top
 * of the arc the tail rears up over its head, then whips down across the foe;
 * it lands deep and spins back round on the hop home.
 */
export function slam(L: Line): Clip {
  const k = L.k;
  return L.clip('slam', 1.9, [
    L.key(0),
    // Coil: deep crouch, the tail lifting behind.
    L.key(0.24, L.pelvis(0, -0.08), k.bend(20, 6, 4, 10), L.both('braced'), k.FOCUS, k.tail(30)),
    // Spring up and in, turning its back to the foe.
    L.key(0.4, L.at(0.5), L.air(0.2), L.root({ yaw: -80 }), L.legs('tuck'), k.bend(4, 2, 0, -6), L.both('guard'), k.ANGRY, k.tail(50)),
    // Top of the arc, back to the foe: the tail rears up over its head (a moving hold).
    L.key(0.52, L.at(0.85), L.air(0.27), L.root({ yaw: -172 }), L.legs('tuck'), k.bend(-12, -4, 0, -12), L.both('spread'), k.ANGRY, k.tail(88)),
    L.key(0.62, L.at(0.92), L.air(0.26), L.root({ yaw: -180, pitch: -6 }), L.legs('tuck'), k.bend(-14, -5, 0, -14), L.both('spread'), k.ANGRY, k.tail(96)),
    // Slam: the body tips away and the tail whips down onto the foe.
    L.snap(0.72, L.at(1), L.air(0.1), L.root({ yaw: -182, pitch: 16 }), L.legs('drop'), k.bend(26, 8, 4, 8), L.both('braced'), k.ANGRY, k.tail(-18)),
    // Land deep in the knees, the tail on the foe.
    L.key(0.82, L.at(1), L.root({ yaw: -182 }), k.LAND, L.pelvis(0, -0.03), k.bend(26, 8, 4, 10), L.both('braced'), k.ANGRY, k.tail(-22)),
    L.key(1.0, L.at(1), L.root({ yaw: -180 }), L.pelvis(0, -0.04), k.bend(12, 4, 2, 4), L.both('guard'), k.ANGRY, k.tail(-4)),
    // Hop home, spinning back round to face the foe.
    L.key(1.18, L.at(0.5), L.air(0.08), L.root({ yaw: -290 }), L.legs('hop'), k.bend(6, 2, 0, 0), L.both('guard'), k.ANGRY, k.tail(12)),
    L.key(1.34, L.at(0), L.root({ yaw: -360 }), k.LAND, L.both('guard'), k.ANGRY, k.tail(4)),
    L.key(1.9, L.root({ yaw: -360 }), k.OPEN),
  ], [{ t: 0.8, name: 'impact' }]);
}

/**
 * Iron Tail: a leaping spin to its left, the tail held rigid and straight
 * like a steel club: it lags the turn, then cracks round flat through the foe
 * as the body comes past its back; it lands facing the foe again, the tail
 * swinging on past, and hops home.
 */
export function ironTail(L: Line): Clip {
  const k = L.k;
  return L.clip('iron_tail', 1.76, [
    L.key(0),
    // Wind up: crouch and turn the shoulders away to its right, the tail loaded out to its left.
    L.key(0.22, L.pelvis(0, -0.07), k.twist(-24), k.bend(16, 4, 0, -6, 10), k.FOCUS, k.tail(10, -30), L.both('crossedLow')),
    // Leap in, already turning to its left, the tail lagging.
    L.key(0.38, L.at(0.55), L.air(0.15), L.root({ yaw: 60 }), L.legs('tuck'), k.bend(6, 2, 0, -6), k.ANGRY, k.tail(6, -28), L.both('crossed')),
    L.key(0.5, L.at(0.9), L.air(0.17), L.root({ yaw: 150 }), L.legs('tuck'), k.bend(4, 2, 0, -4), k.ANGRY, k.tail(8, -32), L.both('wide')),
    // Through the foe: the rigid tail cracks round across it.
    L.snap(0.58, L.at(1), L.air(0.12), L.root({ yaw: 215 }), L.legs('tuck'), k.bend(8, 2, 0, -4), k.ANGRY, k.tail(6, -20), L.both('wide')),
    L.key(0.68, L.at(1), L.air(0.05), L.root({ yaw: 295 }), L.legs('drop'), k.bend(10, 2, 0, -4), k.ANGRY, k.tail(6, 22), L.both('guard')),
    // Land facing the foe, deep, the tail swinging on past.
    L.key(0.8, L.at(1), L.root({ yaw: 360 }), k.LAND, L.pelvis(0, -0.05), k.bend(18, 4, 0, 0), k.ANGRY, k.tail(4, 26), L.both('guard')),
    L.key(0.98, L.at(1), L.root({ yaw: 360 }), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, -6), L.both('guard')),
    L.key(1.14, L.at(0.45), L.air(0.065), L.root({ yaw: 360 }), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.26, L.at(0), L.root({ yaw: 360 }), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.76, L.root({ yaw: 360 }), k.OPEN),
  ], [{ t: 0.6, name: 'impact' }]);
}

/**
 * Body Slam: a big leap high over the foe and a belly-flop, crushing down on
 * it with the whole weight; it rolls off onto its feet and hops home.
 */
export function bodySlam(L: Line): Clip {
  const k = L.k;
  return L.clip('body_slam', 1.96, [
    L.key(0),
    // Crouch deep for the leap, arms back.
    L.key(0.22, L.pelvis(0, -0.085), k.bend(18, 6, 0, -6), k.FOCUS, k.tail(8), L.both('back')),
    // High up and in, the body stretching out flat over the foe.
    L.key(0.4, L.at(0.5), L.air(0.28), L.root({ pitch: 20 }), L.legs('hop'), k.bend(0, 0, 0, -10), k.ANGRY, k.tail(30), L.both('wide')),
    L.key(0.54, L.at(0.9), L.air(0.3), L.root({ pitch: 50 }), L.legs('hop'), k.bend(4, 2, 0, -14), k.ANGRY, k.tail(34), L.both('spread')),
    // Crash down on it belly first, the whole weight behind it.
    L.fall(0.66, L.at(1), L.air(0.08), L.root({ pitch: 72 }), L.legs('drop'), k.bend(6, 2, 0, -16), k.HURT, k.tail(20), L.both('wide')),
    // Squashed on it a beat (a moving hold).
    L.key(0.76, L.at(1), L.air(0.05), L.root({ pitch: 74 }), L.legs('drop'), k.bend(8, 3, 0, -16), k.ANGRY, k.tail(14), L.both('low')),
    L.key(0.9, L.at(1), L.air(0.07), L.root({ pitch: 64 }), L.legs('drop'), k.bend(6, 2, 0, -14), k.ANGRY, k.tail(16), L.both('low')),
    // Roll off it back onto its feet.
    L.key(1.06, L.at(0.95), L.air(0.12), L.root({ pitch: 20, roll: -20 }), L.legs('hop'), k.bend(4, 0, 0, -6), k.ANGRY, k.tail(20), L.both('guard')),
    L.key(1.2, L.at(0.9), k.LAND, L.pelvis(0, -0.02), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(6), L.both('guard')),
    L.key(1.36, L.at(0.4), L.air(0.07), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.5, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.96, k.OPEN),
  ], [{ t: 0.66, name: 'impact' }]);
}

/**
 * Crunch: it lunges in head first, jaws wide, clamps down hard on the foe and
 * shakes its head side to side, grinding; then lets go with a wrench.
 */
export function crunch(L: Line): Clip {
  const k = L.k;
  return L.clip('crunch', 1.8, [
    L.key(0),
    // Lower the head, jaws parting, a predatory crouch.
    L.key(0.18, L.pelvis(0, -0.05), k.bend(18, 6, 6, -2), k.ANGRY, k.jaw(14), k.tail(6), L.both('back')),
    L.key(0.32, L.at(0.6), L.air(0.07), L.legs('tuck'), k.bend(20, 6, 8, -4), k.ANGRY, k.jaw(30), k.tail(18), L.both('back')),
    // Land and lunge the head in, jaws wide open.
    L.key(0.42, L.at(1), k.LAND, k.bend(24, 8, 12, -2), k.ANGRY, k.jaw(40), k.tail(10), L.both('clawsOut')),
    // Clamp: the jaws slam shut on the foe.
    L.snap(0.48, L.at(1), L.pelvis(0, -0.04), k.bend(30, 10, 16, 6), k.ANGRY, k.jaw(2), k.tail(4), L.both('clawsOut'), k.FISTS),
    // Shake: the head wrenches side to side, grinding.
    L.key(0.58, L.at(1), L.pelvis(0, -0.045), k.twist(10), k.bend(30, 10, 16, 6, 16, 8), k.ANGRY, k.jaw(0), k.tail(4, -14), L.both('clawsOut'), k.FISTS),
    L.key(0.68, L.at(1), L.pelvis(0, -0.045), k.twist(-10), k.bend(30, 10, 16, 6, -16, -8), k.ANGRY, k.jaw(0), k.tail(4, 14), L.both('clawsOut'), k.FISTS),
    L.key(0.78, L.at(1), L.pelvis(0, -0.045), k.twist(8), k.bend(30, 10, 16, 6, 14, 6), k.ANGRY, k.jaw(0), k.tail(4, -12), L.both('clawsOut'), k.FISTS),
    // Let go with a wrench back.
    L.snap(0.88, L.at(1), L.pelvis(0, -0.03), k.bend(4, 0, -6, -12, -6), k.ANGRY, k.jaw(24), k.tail(12), L.both('guard')),
    L.key(1.02, L.at(1), L.pelvis(0, -0.035), k.bend(10, 2, 0, -2), k.ANGRY, k.jaw(4), k.tail(4), L.both('guard')),
    L.key(1.16, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.28, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.8, k.OPEN),
  ], [{ t: 0.55, name: 'impact' }]);
}

export const BODY = { mega_kick: megaKick, slam, iron_tail: ironTail, body_slam: bodySlam, crunch };
