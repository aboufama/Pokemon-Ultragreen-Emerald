// Blades, claws and chops (the strike motif): every one goes to the foe, cuts
// or smacks it there with the forearm (Treecko's flat hand, Grovyle's arm
// leaves, Sceptile's leaf blades) and hops home. Written in Sceptile's time
// (Line.clip scales it to the species' tempo). A hand lands ~0.08 s after its
// key (overlapping action), a forearm ~0.06 s: impacts sit that far after the
// strike key.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/** Pound: a flat-handed smack down on the foe's head: the hand rises, the wrist leads, a heavy slap; the hand stays on it a beat. */
export function pound(L: Line): Clip {
  const k = L.k;
  return L.clip('pound', 1.24, [
    L.key(0),
    // Wind up: a dip, the right hand rising up beside the head, the chest turning away.
    L.key(0.13, L.pelvis(0, -0.035), k.twist(-14), k.bend(10, 2, 0, -4, 6), k.FOCUS, k.tail(6, -8), L.arms('slapHigh', 'guardLow'), k.FLAT),
    // Leap in, the hand held high.
    L.key(0.27, L.at(0.55), L.air(0.07), L.legs('tuck'), k.twist(-16), k.bend(6, 0, 0, -6, 8), k.ANGRY, k.tail(12, -10), L.arms('slapHigh', 'guardLow'), k.FLAT),
    // Land in front of the foe, the hand cocked over it.
    L.key(0.37, L.at(1), k.LAND, k.twist(-16), k.bend(12, 2, 0, -6, 8), k.ANGRY, k.tail(6, -8), L.arms('slapHigh', 'guardLow'), k.FLAT),
    // Smack: the torso unwinds and bows, the arm swings down, wrist first, the flat hand down on its head.
    L.snap(0.45, L.at(1), L.pelvis(0, -0.03), k.twist(12), k.bend(24, 8, 0, -4, -4), k.ANGRY, k.tail(2, 12), L.arms('slapDown', 'guardLow'), k.FLAT),
    // The hand stays on it a beat, pressing down.
    L.key(0.6, L.at(1), L.pelvis(0, -0.034), k.twist(14), k.bend(26, 8, 0, -4, -5), k.ANGRY, k.tail(0, 14), L.arms('slapDown', 'guardLow'), k.FLAT),
    // Lift off into a guard.
    L.key(0.74, L.at(1), L.pelvis(0, -0.03), k.twist(4), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, 4), L.both('guard')),
    // Hop home.
    L.key(0.88, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.0, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.24, k.OPEN),
  ], [{ t: 0.53, name: 'impact' }]);
}

/** Cut: a single vertical chop, the forearm edge first, from overhead straight down through the foe; crisp. */
export function cut(L: Line): Clip {
  const k = L.k;
  return L.clip('cut', 1.3, [
    L.key(0),
    // Wind up: the blade raised straight up overhead, the body drawing up tall.
    L.key(0.16, L.pelvis(0, -0.02), k.bend(-4, -2, 0, -8), k.FOCUS, k.tail(10), L.arms('chopHigh', 'guardLow')),
    // Leap in with the blade up.
    L.key(0.3, L.at(0.55), L.air(0.08), L.legs('tuck'), k.bend(-6, -2, 0, -10), k.ANGRY, k.tail(18), L.arms('chopHigh', 'guardLow')),
    // Land at the foe, blade still high, a beat of stillness.
    L.key(0.4, L.at(1), k.LAND, k.bend(0, 0, 0, -8), k.ANGRY, k.tail(10), L.arms('chopHigh', 'guardLow')),
    // Chop: the blade comes straight down through the foe, the body folding over it.
    L.snap(0.47, L.at(1), L.pelvis(0, -0.04), k.bend(28, 10, 2, 4), k.ANGRY, k.tail(-4), L.arms('chopDown', 'guardLow')),
    // Follow-through: the blade carries on down to the ground and stops there, crisp.
    L.key(0.6, L.at(1), L.pelvis(0, -0.046), k.bend(30, 11, 2, 6), k.ANGRY, k.tail(-6, 4), L.arms('chopLow', 'guardLow')),
    L.key(0.8, L.at(1), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    // Hop home.
    L.key(0.94, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.06, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.3, k.OPEN),
  ], [{ t: 0.53, name: 'impact' }]);
}

/** Fury Cutter: a quick crossing X of two slashes, right then left, fierce (it grows fiercer every turn). */
export function furyCutter(L: Line): Clip {
  const k = L.k;
  return L.clip('fury_cutter', 1.36, [
    L.key(0),
    // Wind up: both blades raised high, crossed behind the head, a crouch.
    L.key(0.12, L.pelvis(0, -0.045), k.bend(12, 4, 0, -6), k.FOCUS, k.tail(8), L.both('bladesHigh')),
    L.key(0.26, L.at(0.55), L.air(0.075), L.legs('tuck'), k.bend(6, 2, 0, -8), k.ANGRY, k.tail(16), L.both('bladesHigh')),
    L.key(0.36, L.at(1), k.LAND, k.bend(10, 2, 0, -8), k.ANGRY, k.tail(8), L.both('bladesHigh')),
    // First slash: the right blade cuts down and across, the torso unwinding to its left.
    L.snap(0.42, L.at(1), L.pelvis(0, -0.035), k.twist(24, -5), k.bend(18, 4, 0, -6, -6), k.ANGRY, k.tail(2, 18), L.arms('slashEnd', 'bladesHigh')),
    // Second slash back the other way: the left blade cuts across the first (the X).
    L.snap(0.55, L.at(1), L.pelvis(0, -0.04), k.twist(-30, 5), k.bend(24, 7, 0, -6, 6), k.ANGRY, k.tail(2, -18), L.arms('slashFollow', 'chopDown')),
    // Both blades carry through low, crossed.
    L.key(0.7, L.at(1), L.pelvis(0, -0.045), k.twist(-6), k.bend(24, 7, 0, -4), k.ANGRY, k.tail(0, -6), L.both('bladesCrossed')),
    L.key(0.84, L.at(1), L.pelvis(0, -0.035), k.twist(2), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4, 4), L.both('guard')),
    L.key(0.98, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.1, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.36, k.OPEN),
  ], [{ t: 0.48, name: 'impact' }, { t: 0.61, name: 'impact' }]);
}

/** Leaf Blade: the forearm blade drawn back, a fencer's lunge and a clean horizontal cut through the foe; the blade held out afterwards. */
export function leafBlade(L: Line): Clip {
  const k = L.k;
  return L.clip('leaf_blade', 1.46, [
    L.key(0),
    // Draw: the blade drawn back at shoulder height, the chest turned away, weight low (en garde).
    L.key(0.16, L.pelvis(0, -0.045), k.twist(-30), k.bend(10, 2, 0, -6, 14), k.FOCUS, k.tail(8, -14), L.arms('bladeBack', 'guardLow')),
    // Spring in low and long, the blade still drawn.
    L.key(0.3, L.at(0.6), L.air(0.06), L.legs('tuck'), k.twist(-32), k.bend(14, 4, 0, -8, 16), k.ANGRY, k.tail(16, -16), L.arms('bladeBack', 'guardLow')),
    // Land into a lunge at the foe, right foot forward.
    L.key(0.4, L.at(1), k.LAND, L.legs('lungeR'), k.twist(-32), k.bend(16, 4, 0, -8, 16), k.ANGRY, k.tail(8, -14), L.arms('bladeBack', 'guardLow')),
    // The cut: the torso whips round and the blade sweeps flat across through the foe.
    L.snap(0.47, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.05), k.twist(30, -4), k.bend(18, 4, 0, -6, -10), k.ANGRY, k.tail(2, 24), L.arms('cutAcross', 'guardLow')),
    // Carry through round to its left, then hold the blade out, poised (a moving hold).
    L.key(0.6, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.052), k.twist(38, -5), k.bend(18, 4, 0, -6, -12), k.ANGRY, k.tail(0, 28), L.arms('cutFollow', 'guardLow')),
    L.key(0.8, L.at(1), L.legs('lungeR'), L.pelvis(0, -0.05), k.twist(34, -4), k.bend(16, 4, 0, -6, -10, 2), k.FOCUS, k.tail(2, 24), L.arms('cutFollow', 'guardLow')),
    L.key(0.94, L.at(1), L.pelvis(0, -0.035), k.twist(8), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4, 8), L.both('guard')),
    L.key(1.08, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.2, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.46, k.OPEN),
  ], [{ t: 0.52, name: 'impact' }]);
}

/**
 * False Swipe: a feint first (a half-swing it pulls back), then a
 * restrained, precise backhand swipe that stops short of full power, and a
 * controlled finish: the blade held still a moment, then lowered.
 */
export function falseSwipe(L: Line): Clip {
  const k = L.k;
  return L.clip('false_swipe', 1.5, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.035), k.twist(-10), k.bend(8, 2, 0, -4, 8), k.FOCUS, k.tail(6, -6), L.arms('guard', 'guardLow')),
    L.key(0.28, L.at(0.55), L.air(0.065), L.legs('tuck'), k.bend(6, 2, 0, -6), k.FOCUS, k.tail(12), L.arms('guard', 'guardLow')),
    L.key(0.38, L.at(1), k.LAND, k.bend(10, 2, 0, -6), k.FOCUS, k.tail(6), L.arms('guard', 'guardLow')),
    // The feint: a half-swing forward that it checks...
    L.key(0.48, L.at(1), L.pelvis(0, -0.035), k.twist(12), k.bend(14, 4, 0, -4, -4), k.FOCUS, k.tail(4, 8), L.arms('reach', 'guardLow')),
    // ... and draws the arm back across its chest for the real one.
    L.key(0.6, L.at(1), L.pelvis(0, -0.04), k.twist(22), k.bend(12, 4, 0, -6, -8), k.FOCUS, k.tail(4, 12), L.arms('backhandCock', 'guardLow')),
    // The backhand: out across the foe, precise, not full power.
    L.snap(0.67, L.at(1), L.pelvis(0, -0.035), k.twist(-12), k.bend(14, 4, 0, -4, 6), k.ANGRY, k.tail(2, -10), L.arms('backhandEnd', 'guardLow')),
    // It stops the blade there, still (a moving hold), then lowers it.
    L.key(0.82, L.at(1), L.pelvis(0, -0.034), k.twist(-14), k.bend(13, 4, 0, -4, 7, 2), k.FOCUS, k.tail(2, -12), L.arms('backhandEnd', 'guardLow')),
    L.key(0.98, L.at(1), L.pelvis(0, -0.03), k.twist(-2), k.bend(8, 2, 0, -2), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.12, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.FOCUS, k.tail(10), L.both('guard')),
    L.key(1.24, L.at(0), k.LAND, k.LIGHT, k.FOCUS, k.tail(2), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.73, name: 'impact' }]);
}

/** Dragon Claw: a savage two-stage rake, bent low and predatory: a wide sweep across, then a second rip back the other way. */
export function dragonClaw(L: Line): Clip {
  const k = L.k;
  return L.clip('dragon_claw', 1.56, [
    L.key(0),
    // Hunch low and predatory, the claw drawn wide, jaws parted.
    L.key(0.18, L.pelvis(0, -0.06), k.twist(-24), k.bend(24, 8, 4, -12, 10), k.ANGRY, k.jaw(14), k.tail(4, -14), L.arms('rakeWide', 'guardLow'), k.SPLAYED),
    L.key(0.32, L.at(0.6), L.air(0.07), L.legs('tuck'), k.twist(-28), k.bend(20, 6, 4, -14, 12), k.ANGRY, k.jaw(18), k.tail(12, -16), L.arms('rakeWide', 'guardLow'), k.SPLAYED),
    L.key(0.42, L.at(1), k.LAND, L.pelvis(0, -0.02), k.twist(-28), k.bend(26, 8, 4, -12, 12), k.ANGRY, k.jaw(18), k.tail(6, -14), L.arms('rakeWide', 'guardLow'), k.SPLAYED),
    // The first rake: a wide sweep across and down.
    L.snap(0.49, L.at(1), L.pelvis(0, -0.06), k.twist(26, -6), k.bend(30, 10, 4, -8, -10), k.ANGRY, k.jaw(24), k.tail(2, 20), L.arms('slashEnd', 'guardLow'), k.SPLAYED),
    L.key(0.58, L.at(1), L.pelvis(0, -0.062), k.twist(30, -6), k.bend(31, 10, 4, -8, -11), k.ANGRY, k.jaw(22), k.tail(0, 24), L.arms('slashFollow', 'guardLow'), k.SPLAYED),
    // The rip back: the claw tears back up the other way.
    L.snap(0.66, L.at(1), L.pelvis(0, -0.055), k.twist(-26, 6), k.bend(26, 8, 4, -10, 10), k.ANGRY, k.jaw(26), k.tail(2, -22), L.arms('rakeBack', 'guardLow'), k.SPLAYED),
    L.key(0.8, L.at(1), L.pelvis(0, -0.055), k.twist(-30, 6), k.bend(27, 8, 4, -10, 11, 2), k.ANGRY, k.jaw(14), k.tail(0, -24), L.arms('rakeBack', 'guardLow'), k.SPLAYED),
    L.key(0.96, L.at(1), L.pelvis(0, -0.04), k.twist(-6), k.bend(14, 3, 0, -4), k.ANGRY, k.tail(4, -4), L.both('guard')),
    L.key(1.1, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.22, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.56, k.OPEN),
  ], [{ t: 0.55, name: 'impact' }, { t: 0.72, name: 'impact' }]);
}

/** Brick Break: the hand raised high, a karate chop straight down through the foe (a wall shattering), the body dropping into it. */
export function brickBreak(L: Line): Clip {
  const k = L.k;
  return L.clip('brick_break', 1.5, [
    L.key(0),
    // Wind up: sink, the chopping hand drawn up past the ear, the other hand forward to sight the target.
    L.key(0.2, L.pelvis(0, -0.06), k.twist(-18), k.bend(8, 2, 0, -6, 8), k.FOCUS, k.tail(8, -8), L.arms('chopHigh', 'reach'), k.FLAT),
    // A high leap in, the hand cocked.
    L.key(0.36, L.at(0.6), L.air(0.15), L.legs('tuck'), k.twist(-20), k.bend(-4, -2, 0, -10, 8), k.ANGRY, k.tail(24, -8), L.arms('chopHigh', 'reach'), k.FLAT),
    // Coming down on the foe from above.
    L.key(0.48, L.at(0.92), L.air(0.1), L.legs('drop'), k.twist(-20), k.bend(-6, -2, 0, -10, 8), k.ANGRY, k.tail(28, -8), L.arms('chopHigh', 'reach'), k.FLAT),
    // The chop: the hand drives straight down through it as the body drops into it.
    L.snap(0.55, L.at(1), L.air(0.02), L.legs('drop'), k.twist(8), k.bend(30, 12, 2, 4, -2), k.ANGRY, k.tail(-6, 4), L.arms('chopDown', 'fistHip'), k.FLAT),
    // Land deep under it, the hand driven low.
    L.key(0.64, L.at(1), k.LAND, L.pelvis(0, -0.05), k.twist(10), k.bend(32, 12, 2, 6), k.ANGRY, k.tail(-8, 4), L.raw(L.mix(L.arm('chopDown'), L.arm('chopLow'), 0.35), L.armL('fistHip')), k.FLAT),
    L.key(0.84, L.at(1), L.pelvis(0, -0.07), k.twist(8), k.bend(28, 10, 2, 4, 0, 2), k.ANGRY, k.tail(-4, 2), L.arms('chopLow', 'fistHip'), k.FLAT),
    L.key(1.0, L.at(1), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.14, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.26, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.61, name: 'impact' }]);
}

/**
 * Aerial Ace: a blur. Barely a crouch, a springing leap high over the foe,
 * a slash as it drops onto it, landing just past the strike point, then a
 * quick hop home.
 */
export function aerialAce(L: Line): Clip {
  const k = L.k;
  return L.clip('aerial_ace', 1.2, [
    L.key(0),
    L.key(0.1, L.pelvis(0, -0.05), k.bend(14, 4, 0, -6), k.FOCUS, k.tail(10), L.arms('bladeHigh', 'back')),
    // Spring high and fast, the body stretched in flight.
    L.key(0.2, L.at(0.6), L.air(0.22), L.legs('tuck'), L.root({ pitch: 10 }), k.bend(4, 0, 0, -10), k.ANGRY, k.tail(30), L.arms('bladeHigh', 'back')),
    // Over the foe: dropping onto it with the blade.
    L.key(0.28, L.at(0.95), L.air(0.16), L.legs('tuck'), L.root({ pitch: 16 }), k.bend(10, 4, 0, -10), k.ANGRY, k.tail(34), L.arms('bladeHigh', 'back')),
    // The slash as it comes down on the foe.
    L.snap(0.33, L.at(1), L.air(0.06), L.legs('drop'), L.root({ pitch: 14 }), k.twist(24, -6), k.bend(24, 8, 0, -4, -8), k.ANGRY, k.tail(10, 20), L.arms('slashEnd', 'back')),
    // Touch down just past the strike point, low, the blade trailing.
    L.key(0.44, L.at(1.08), k.LAND, L.pelvis(0, -0.03), k.twist(30, -6), k.bend(26, 8, 0, -4, -10), k.ANGRY, k.tail(4, 26), L.arms('slashFollow', 'back')),
    L.key(0.6, L.at(1.08), L.pelvis(0, -0.05), k.twist(20, -4), k.bend(22, 6, 0, -4, -8, 2), k.ANGRY, k.tail(2, 20), L.arms('slashFollow', 'guardLow')),
    L.key(0.72, L.at(1.08), L.pelvis(0, -0.03), k.twist(4), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4, 4), L.both('guard')),
    L.key(0.86, L.at(0.45), L.air(0.07), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(0.98, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.2, k.OPEN),
  ], [{ t: 0.39, name: 'impact' }]);
}

/** Rock Smash: a hammer blow: the fist raised high, then smashed down onto the foe as onto a boulder. */
export function rockSmash(L: Line): Clip {
  const k = L.k;
  return L.clip('rock_smash', 1.44, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.05), k.twist(-12), k.bend(4, 0, 0, -6, 6), k.FOCUS, k.tail(8), L.arms('hammerHigh', 'guardLow'), k.FISTS),
    L.key(0.3, L.at(0.55), L.air(0.08), L.legs('tuck'), k.twist(-14), k.bend(0, 0, 0, -8, 6), k.ANGRY, k.tail(18), L.arms('hammerHigh', 'guardLow'), k.FISTS),
    // Plant in front of the foe, rearing back with the fist high (the load).
    L.key(0.4, L.at(1), k.LAND, k.twist(-16), k.bend(-6, -4, 0, -10, 8), k.ANGRY, k.tail(20), L.arms('hammerHigh', 'guardLow'), k.FISTS),
    L.key(0.48, L.at(1), L.pelvis(0, 0.005), k.twist(-18), k.bend(-10, -6, 0, -12, 8), k.ANGRY, k.tail(24), L.arms('hammerHigh', 'guardLow'), k.FISTS),
    // Smash: the whole body comes down behind the fist.
    L.snap(0.55, L.at(1), L.pelvis(0, -0.06), k.twist(8), k.bend(32, 12, 2, 6), k.ANGRY, k.tail(-8), L.arms('hammerDown', 'guardLow'), k.FISTS),
    L.key(0.68, L.at(1), L.pelvis(0, -0.07), k.twist(10), k.bend(33, 12, 2, 7, 0, 2), k.ANGRY, k.tail(-10), L.arms('hammerDown', 'guardLow'), k.FISTS),
    L.key(0.86, L.at(1), L.pelvis(0, -0.04), k.bend(14, 3, 0, -2), k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.0, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.12, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.44, k.OPEN),
  ], [{ t: 0.62, name: 'impact' }]);
}

/** Crush Claw: rears up with both claws high, drives them down onto the foe gripping and crushing with its weight, then wrenches free. */
export function crushClaw(L: Line): Clip {
  const k = L.k;
  return L.clip('crush_claw', 1.62, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.055), k.bend(18, 6, 2, -4), k.FOCUS, k.tail(6), L.both('crossedLow'), k.SPLAYED),
    L.key(0.3, L.at(0.55), L.air(0.08), L.legs('tuck'), k.bend(4, 0, 0, -8), k.ANGRY, k.jaw(10), k.tail(16), L.both('clawHigh'), k.SPLAYED),
    // Land and rear up tall at the foe, both claws high and open.
    L.key(0.4, L.at(1), k.LAND, k.bend(-8, -4, -2, -12), k.ANGRY, k.jaw(18), k.tail(20), L.both('clawHigh'), k.SPLAYED),
    L.key(0.5, L.at(1), L.pelvis(0, 0.012), k.bend(-12, -6, -2, -14), k.ANGRY, k.jaw(22), k.tail(26), L.both('clawHigh'), k.SPLAYED),
    // Drive down onto it, the claws closing on it, the weight on them.
    L.snap(0.57, L.at(1), L.pelvis(0, -0.05), k.bend(30, 12, 2, 4), k.ANGRY, k.jaw(8), k.tail(-6), L.both('clawDown'), k.FISTS),
    // Crushing: bearing down, straining (a trembling hold).
    L.key(0.7, L.at(1), L.pelvis(0, -0.07), k.bend(33, 13, 2, 6, 0, 2), k.ANGRY, k.jaw(4), k.tail(-8, 4), L.both('clawDown'), k.FISTS),
    L.key(0.84, L.at(1), L.pelvis(0, -0.075), k.bend(34, 13, 2, 6, 0, -2), k.ANGRY, k.jaw(4), k.tail(-8, -4), L.both('clawDown'), k.FISTS),
    // Wrench free: a twist and a yank back.
    L.snap(0.94, L.at(1), L.pelvis(0, -0.03), k.twist(-16), k.bend(8, 2, 0, -6, 8), k.ANGRY, k.tail(6, -12), L.both('elbowsBack'), k.SPLAYED),
    L.key(1.06, L.at(1), L.pelvis(0, -0.035), k.twist(-4), k.bend(10, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.2, L.at(0.45), L.air(0.065), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.32, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.62, k.OPEN),
  ], [{ t: 0.63, name: 'impact' }]);
}

export const STRIKES = { pound, cut, fury_cutter: furyCutter, leaf_blade: leafBlade, false_swipe: falseSwipe, dragon_claw: dragonClaw, brick_break: brickBreak, aerial_ace: aerialAce, rock_smash: rockSmash, crush_claw: crushClaw };
