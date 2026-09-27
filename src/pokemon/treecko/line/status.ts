// Status moves, done at home: glares and cries at the foe, darting and
// weaving (Agility, Double Team), guards and barriers (Detect, Protect,
// Safeguard, Substitute, Endure), powders and seeds (Toxic, Leech Seed),
// charms and taunts (Attract, Swagger), a blade dance (Swords Dance), talking
// in its sleep, calling the sun, lying down to Rest, a Flash of light and
// scuffing up mud (Mud Sport). Written in Sceptile's time. Clips that stay at
// home keep clear of the healthboxes (tools/gauntlet/uiclear.mjs): darts stay
// narrow and low, nothing reaches far down in front.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/** Leer: it leans in, head low and thrust forward, and stares the foe down with narrowed eyes; a glint (emit); it holds the stare, then straightens. */
export function leer(L: Line): Clip {
  const k = L.k;
  return L.clip('leer', 1.3, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.03), k.bend(8, 2, 2, 4), k.FOCUS, k.tail(2), L.both('guardLow')),
    // Leaning in, the head low and forward: the stare.
    L.key(0.34, L.pelvis(0, -0.05), k.bend(16, 4, 10, 4, 0, -4), k.ANGRY, k.tail(-4, 6), L.both('guardLow')),
    L.key(0.62, L.pelvis(0, -0.052), k.bend(17, 4, 11, 4, 0, -6), k.ANGRY, k.tail(-4, -4), L.both('guardLow')),
    L.key(0.86, L.pelvis(0, -0.05), k.bend(16, 4, 10, 3, 0, -3), k.ANGRY, k.tail(-2, 4), L.both('guardLow')),
    L.key(1.06, L.pelvis(0, -0.02), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(2)),
    L.key(1.3, k.OPEN),
  ], [{ t: 0.4, name: 'emit' }]);
}

/**
 * Mimic: it studies the foe, head tilting one way, then the other, eyes
 * wide; then it copies it: drawn up tall, arms raised in the foe's own pose,
 * a knowing glint (emit), and it settles.
 */
export function mimic(L: Line): Clip {
  const k = L.k;
  return L.clip('mimic', 1.6, [
    L.key(0),
    // Studying the foe: the head tilts one way...
    L.key(0.18, L.pelvis(0, -0.02), k.bend(6, 2, 4, 0, 6, 16), k.WIDE, k.tail(4, 8), L.both('guardLow')),
    // ... then the other.
    L.key(0.42, L.pelvis(0, -0.025), k.bend(8, 2, 5, 0, -6, -16), k.WIDE, k.tail(4, -8), L.both('guardLow')),
    // It copies: drawn up tall, the arms raised in the foe's pose.
    L.snap(0.56, L.pelvis(0, 0.01), k.bend(-8, -4, 0, -10), k.HAPPY, k.tail(14), L.both('clawsUp'), k.SPLAYED),
    L.key(0.8, L.pelvis(0, 0.012), k.bend(-9, -4, 0, -11, 0, 4), k.HAPPY, k.tail(16, 6), L.both('clawsUp'), k.SPLAYED),
    L.key(1.0, L.pelvis(0, 0.008), k.bend(-7, -4, 0, -10, 0, -3), k.FOCUS, k.tail(14, -4), L.both('clawsUp'), k.SPLAYED),
    L.key(1.26, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.62, name: 'emit' }]);
}

/**
 * Screech: it rears back, claws up by its head, then thrusts its head at the
 * foe with the jaws wide and screeches, shrill and shaking (emit), the whole
 * body trembling with it; then it closes its jaws.
 */
export function screech(L: Line): Clip {
  const k = L.k;
  return L.clip('screech', 1.5, [
    L.key(0),
    // Rear back, claws drawn up by the head.
    L.key(0.2, L.pelvis(0, 0.005), k.bend(-10, -4, -4, -14), k.SHUT, k.jaw(8), k.tail(12), L.both('clawsUp'), k.SPLAYED),
    L.key(0.34, L.pelvis(0, 0.008), k.bend(-12, -5, -4, -16, 0, 2), k.SHUT, k.jaw(10), k.tail(14), L.both('clawsUp'), k.SPLAYED),
    // The screech: the head thrust at the foe, jaws wide, trembling.
    L.snap(0.44, L.pelvis(0, -0.04), k.bend(14, 4, 10, 6), k.ANGRY, k.jaw(38), k.tail(4), L.both('clawsOut'), k.SPLAYED),
    L.key(0.54, L.pelvis(0, -0.042), k.bend(15, 4, 10, 6, 3, 3), k.ANGRY, k.jaw(40), k.tail(4, 6), L.both('clawsOut'), k.SPLAYED),
    L.key(0.64, L.pelvis(0, -0.04), k.bend(14, 4, 10, 7, -3, -3), k.ANGRY, k.jaw(38), k.tail(4, -6), L.both('clawsOut'), k.SPLAYED),
    L.key(0.74, L.pelvis(0, -0.043), k.bend(15, 4, 10, 6, 3, 2), k.ANGRY, k.jaw(40), k.tail(4, 6), L.both('clawsOut'), k.SPLAYED),
    L.key(0.86, L.pelvis(0, -0.04), k.bend(14, 4, 10, 6, -2, -2), k.ANGRY, k.jaw(36), k.tail(4, -4), L.both('clawsOut'), k.SPLAYED),
    L.key(1.06, L.pelvis(0, -0.02), k.bend(4, 0, 2, -2), k.ANGRY, k.jaw(4), k.tail(4), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.5, name: 'emit' }]);
}

/**
 * Roar: it draws itself up to its full height, chest out and arms flung
 * wide, then throws its head forward and roars at the foe with everything,
 * jaws wide, tail high (emit); the roar rolls on, then it drops back into its
 * stance.
 */
export function roar(L: Line): Clip {
  const k = L.k;
  return L.clip('roar', 1.8, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.05), k.bend(12, 4, 0, 6), k.FOCUS, k.tail(4), L.both('low'), k.FISTS),
    // Drawn up to its full height, chest out, a breath.
    L.key(0.44, L.pelvis(0, 0.012), k.bend(-14, -6, -6, -22), k.SHUT, k.jaw(10), k.tail(18), L.both('spread'), k.FISTS),
    L.key(0.56, L.pelvis(0, 0.014), k.bend(-15, -6, -6, -24, 0, 2), k.SHUT, k.jaw(12), k.tail(20), L.both('spread'), k.FISTS),
    // The roar: the head thrown forward, jaws wide, arms flung wide.
    L.snap(0.66, L.pelvis(0, -0.03), k.bend(10, 4, 8, 2), k.ANGRY, k.jaw(44), k.tail(30), L.both('flare'), k.SPLAYED),
    L.key(0.9, L.pelvis(0, -0.032), k.bend(11, 4, 8, 2, 3, 2), k.ANGRY, k.jaw(44), k.tail(32, 6), L.both('flare'), k.SPLAYED),
    L.key(1.12, L.pelvis(0, -0.03), k.bend(10, 4, 8, 3, -3, -2), k.ANGRY, k.jaw(40), k.tail(30, -6), L.both('flare'), k.SPLAYED),
    L.key(1.36, L.pelvis(0, -0.02), k.bend(4, 0, 2, -2), k.ANGRY, k.jaw(6), k.tail(8), L.both('guard')),
    L.key(1.8, k.OPEN),
  ], [{ t: 0.72, name: 'emit' }]);
}

/**
 * Agility: fast, springy darts from side to side, leaning into each with the
 * tail swinging out as a counterweight, zig-zagging back a little; the trail
 * of afterimages (from the aura) follows the darts. The darts stay narrow and
 * low (the healthboxes).
 */
export function agility(L: Line): Clip {
  const k = L.k;
  const dart = (x: number, z: number, lift: number) => [L.root({ x, z, y: lift * k.spring }), L.pelvis(0, -0.4 * lift * k.spring)];
  return L.clip('agility', 1.6, [
    L.key(0),
    // Load onto its left foot to push off to the right.
    L.key(0.1, L.pelvis(0.02, -0.055), k.twist(0, -5), k.bend(10, 3, 0, -4), k.FOCUS, k.tail(6, 8)),
    L.key(0.2, ...dart(-0.075, -0.015, 0.065), k.twist(0, 12), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(12, -22)),
    L.key(0.3, L.root({ x: -0.15, z: -0.03 }), k.LAND, k.twist(0, 5), k.ANGRY, k.tail(6, -16)),
    L.key(0.41, ...dart(0, -0.04, 0.07), k.twist(0, -12), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(12, 22)),
    L.key(0.52, L.root({ x: 0.15, z: -0.05 }), k.LAND, k.twist(0, -5), k.ANGRY, k.tail(6, 16)),
    L.key(0.63, ...dart(0, -0.04, 0.07), k.twist(0, 12), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(12, -22)),
    L.key(0.74, L.root({ x: -0.15, z: -0.03 }), k.LAND, k.twist(0, 5), k.ANGRY, k.tail(6, -16)),
    L.key(0.85, ...dart(-0.005, -0.04, 0.065), k.twist(0, -12), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(12, 22)),
    L.key(0.96, L.root({ x: 0.14, z: -0.05 }), k.LAND, k.twist(0, -5), k.ANGRY, k.tail(6, 16)),
    L.key(1.06, ...dart(0.07, -0.025, 0.055), k.twist(0, 8), k.bend(3, 1, 0, -2), k.ANGRY, k.tail(10, -14)),
    L.key(1.16, k.LAND, k.ANGRY, k.tail(4, -6)),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.18, name: 'aura' }]);
}

/**
 * Double Team: it weaves, smooth and low, swaying its body from side to side
 * without moving its feet (the copies swing out from it, from the aura), its
 * guard up and eyes on the foe; then snaps back to still.
 */
export function doubleTeam(L: Line): Clip {
  const k = L.k;
  const sway = (x: number, lean: number) => [L.pelvis(x, -0.05), k.twist(lean * 0.4, lean), k.bend(10, 3, 0, -4, -lean * 0.3, -lean * 0.6)];
  return L.clip('double_team', 1.6, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.05), k.bend(10, 3, 0, -4), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(0.3, ...sway(0.035, 14), k.ANGRY, k.tail(6, -16), L.both('guard')),
    L.key(0.48, ...sway(-0.035, -14), k.ANGRY, k.tail(6, 16), L.both('guard')),
    L.key(0.66, ...sway(0.035, 14), k.ANGRY, k.tail(6, -16), L.both('guard')),
    L.key(0.84, ...sway(-0.035, -14), k.ANGRY, k.tail(6, 16), L.both('guard')),
    L.key(1.0, ...sway(0.02, 8), k.ANGRY, k.tail(6, -8), L.both('guard')),
    // Still again, the guard up.
    L.snap(1.12, L.pelvis(0, -0.045), k.bend(8, 2, 0, -4), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.32, L.pelvis(0, -0.02), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3)),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.2, name: 'aura' }]);
}

/**
 * Detect: sudden stillness; its eyes flash wide as it reads the foe's move,
 * and it snaps into a low, side-on guard, forearms crossed before it, weight
 * back and ready to spring aside (aura); it holds, watching, then eases up.
 */
export function detect(L: Line): Clip {
  const k = L.k;
  return L.clip('detect', 1.44, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.02), k.bend(2, 0, 0, -4), k.FOCUS, k.tail(2), L.both('guardLow')),
    // The eyes flash: it reads the move.
    L.key(0.26, L.pelvis(0, -0.015), k.bend(-2, -2, 0, -8), k.WIDE, k.tail(4), L.both('guardLow')),
    // Into the guard: low, turned side-on, forearms crossed, weight back.
    L.snap(0.36, L.pelvis(0, -0.07, -0.01), k.twist(-26), k.bend(12, 4, 0, -6, 18), k.FOCUS, k.tail(4, -14), L.both('crossed')),
    L.key(0.62, L.pelvis(0, -0.072, -0.01), k.twist(-27), k.bend(13, 4, 0, -6, 19, 2), k.FOCUS, k.tail(4, -12), L.both('crossed')),
    L.key(0.86, L.pelvis(0, -0.07, -0.01), k.twist(-25), k.bend(12, 4, 0, -6, 17, -2), k.FOCUS, k.tail(4, -14), L.both('crossed')),
    L.key(1.1, L.pelvis(0, -0.02), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3), L.both('guard')),
    L.key(1.44, k.OPEN),
  ], [{ t: 0.4, name: 'aura' }]);
}

/**
 * Protect: it plants its feet wide and throws both forearms up crossed in
 * front of its face, head down behind them, as the barrier forms (aura); it
 * holds firm, then lowers its guard.
 */
export function protect(L: Line): Clip {
  const k = L.k;
  return L.clip('protect', 1.44, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.04), k.bend(6, 2, 0, -2), k.FOCUS, k.tail(2), L.both('guardLow')),
    // Feet wide, forearms up crossed before the face, head tucked behind them.
    L.snap(0.26, L.legs('squat'), L.pelvis(0, -0.08), k.bend(10, 4, 2, 12), k.SHUT, k.tail(-4), L.both('cover'), k.FISTS),
    L.key(0.56, L.legs('squat'), L.pelvis(0, -0.082), k.bend(11, 4, 2, 13, 0, 2), k.SHUT, k.tail(-4, 4), L.both('cover'), k.FISTS),
    L.key(0.86, L.legs('squat'), L.pelvis(0, -0.08), k.bend(10, 4, 2, 12, 0, -2), k.FOCUS, k.tail(-4, -4), L.both('cover'), k.FISTS),
    L.key(1.08, L.pelvis(0, -0.025), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(3), L.both('guard')),
    L.key(1.44, k.OPEN),
  ], [{ t: 0.3, name: 'aura' }]);
}

/**
 * Safeguard: calm; it draws itself up and opens its arms wide, palms turned
 * out, eyes closed, and a veil settles over it (aura); it breathes out and
 * lowers its arms.
 */
export function safeguard(L: Line): Clip {
  const k = L.k;
  return L.clip('safeguard', 1.7, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.02), k.bend(4, 0, 0, 4), k.SHUT, k.tail(2), L.both('crossedLow')),
    // Drawn up, arms opening wide, palms out.
    L.key(0.5, L.pelvis(0, 0.008), k.bend(-6, -3, 0, -8), k.SHUT, k.tail(10), L.both('palmsUp'), k.SPLAYED),
    L.key(0.8, L.pelvis(0, 0.01), k.bend(-7, -3, 0, -9, 0, 3), k.SHUT, k.tail(12, 4), L.both('spread'), k.SPLAYED),
    L.key(1.08, L.pelvis(0, 0.008), k.bend(-6, -3, 0, -8, 0, -3), k.HAPPY, k.tail(12, -4), L.both('palmsUp'), k.SPLAYED),
    L.key(1.36, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(4), L.both('guardLow')),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.56, name: 'aura' }]);
}

/**
 * Substitute: it crouches and puts a piece of itself into a double, hands
 * pressed together low before it, shaking with the effort (aura), then
 * springs back a step behind its stand-in and takes its guard.
 */
export function substitute(L: Line): Clip {
  const k = L.k;
  return L.clip('substitute', 1.6, [
    L.key(0),
    L.key(0.18, L.pelvis(0, -0.07), k.bend(18, 6, 0, 8), k.FOCUS, k.tail(-2), L.both('crossedLow'), k.FLAT),
    // Pressing the power into the double, shaking.
    L.key(0.36, L.pelvis(0, -0.08), k.bend(22, 7, 2, 10, 0, 3), k.SHUT, k.tail(-4, 6), L.both('reach'), k.FLAT),
    L.key(0.48, L.pelvis(0, -0.082), k.bend(22, 7, 2, 10, 0, -3), k.SHUT, k.tail(-4, -6), L.both('reach'), k.FLAT),
    L.key(0.6, L.pelvis(0, -0.08), k.bend(21, 7, 2, 9, 0, 3), k.SHUT, k.tail(-4, 6), L.both('reach'), k.FLAT),
    // It springs back a step behind its stand-in.
    L.key(0.74, L.root({ z: -0.04, y: 0.05 * k.spring }), L.pelvis(0, -0.02 * k.spring), k.bend(4, 0, 0, -6), k.FOCUS, k.tail(10), L.both('guard')),
    L.key(0.86, L.root({ z: -0.05 }), k.LAND, k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.04, L.root({ z: -0.05 }), L.pelvis(0, -0.03), k.bend(6, 1, 0, -2, 0, 2), k.FOCUS, k.tail(4, 4), L.both('guard')),
    // And back to its place.
    L.key(1.2, L.root({ z: -0.025, y: 0.04 * k.spring }), L.pelvis(0, -0.016 * k.spring), k.bend(4, 0, 0, -2), k.FOCUS, k.tail(8), L.both('guard')),
    L.key(1.32, k.LAND, k.FOCUS, k.tail(3), L.both('guard')),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.42, name: 'aura' }]);
}

/**
 * Endure: it braces for whatever comes: feet planted wide, fists clenched
 * down at its sides, head lowered, eyes screwed shut, jaw set; it trembles
 * with the strain (aura), then lets it out.
 */
export function endure(L: Line): Clip {
  const k = L.k;
  return L.clip('endure', 1.5, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.04), k.bend(8, 2, 0, 4), k.FOCUS, k.tail(2), L.both('low'), k.FISTS),
    // Braced: wide, fists down at the sides, head lowered, trembling.
    L.snap(0.28, L.legs('squat'), L.pelvis(0, -0.085), k.bend(16, 5, 2, 14), k.SHUT, k.jaw(4), k.tail(-6), L.both('braced'), k.FISTS),
    L.key(0.4, L.legs('squat'), L.pelvis(0, -0.088), k.bend(17, 5, 2, 15, 2, 2), k.SHUT, k.jaw(6), k.tail(-6, 4), L.both('braced'), k.FISTS),
    L.key(0.52, L.legs('squat'), L.pelvis(0, -0.085), k.bend(16, 5, 2, 14, -2, -2), k.SHUT, k.jaw(4), k.tail(-6, -4), L.both('braced'), k.FISTS),
    L.key(0.66, L.legs('squat'), L.pelvis(0, -0.088), k.bend(17, 5, 2, 15, 2, 1), k.ANGRY, k.jaw(6), k.tail(-6, 4), L.both('braced'), k.FISTS),
    L.key(0.8, L.legs('squat'), L.pelvis(0, -0.086), k.bend(16, 5, 2, 14, -1, -1), k.ANGRY, k.jaw(4), k.tail(-6, -2), L.both('braced'), k.FISTS),
    // Lets it out.
    L.key(1.04, L.pelvis(0, -0.03), k.bend(-2, -2, 0, -6), k.FOCUS, k.jaw(10), k.tail(6), L.both('guardLow')),
    L.key(1.24, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3), L.both('guard')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.34, name: 'aura' }]);
}

/**
 * Toxic: it draws its head back, cheeks full, then spits a hissing spray of
 * poison at the foe in two puffs (emit), and wipes its mouth with the back
 * of a hand.
 */
export function toxic(L: Line): Clip {
  const k = L.k;
  return L.clip('toxic', 1.5, [
    L.key(0),
    // Head back, cheeks full.
    L.key(0.2, L.pelvis(0, -0.02), k.bend(-6, -3, -2, -14), k.SHUT, k.jaw(2), k.tail(8), L.both('guardLow')),
    L.key(0.34, L.pelvis(0, -0.018), k.bend(-7, -3, -2, -15, 0, 2), k.SHUT, k.jaw(2), k.tail(9), L.both('guardLow')),
    // The spray, in two puffs.
    L.snap(0.44, L.pelvis(0, -0.04), k.bend(12, 4, 6, 6), k.ANGRY, k.jaw(22), k.tail(2), L.both('guardLow')),
    L.key(0.56, L.pelvis(0, -0.032), k.bend(6, 2, 2, 0), k.ANGRY, k.jaw(10), k.tail(4), L.both('guardLow')),
    L.snap(0.64, L.pelvis(0, -0.042), k.bend(13, 4, 6, 6, 4), k.ANGRY, k.jaw(24), k.tail(2, 4), L.both('guardLow')),
    // Wipes its mouth with the back of its hand.
    L.key(0.86, L.pelvis(0, -0.025), k.bend(4, 0, 0, 2, -8), k.FOCUS, k.jaw(0), k.tail(4, -4), L.arms('shade', 'guardLow')),
    L.key(1.08, L.pelvis(0, -0.02), k.bend(3, 0, 0, -2, 6), k.FOCUS, k.tail(4, 2), L.arms('guard', 'guardLow')),
    L.key(1.5, k.OPEN),
  ], [{ t: 0.5, name: 'emit' }]);
}

/**
 * Leech Seed: it tips its head back and flicks it forward, lobbing a seed in
 * a high arc at the foe (emit), then watches it land, head tilted, and
 * settles.
 */
export function leechSeed(L: Line): Clip {
  const k = L.k;
  return L.clip('leech_seed', 1.4, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.04), k.bend(10, 2, 2, 8), k.FOCUS, k.tail(4), L.both('guardLow')),
    // Head tipped back, the seed on its tongue.
    L.key(0.32, L.pelvis(0, -0.01), k.bend(-8, -4, -4, -20), k.FOCUS, k.jaw(10), k.tail(10), L.both('guardLow')),
    // The lob: a flick up and forward.
    L.snap(0.4, L.pelvis(0, -0.02), k.bend(0, 0, 0, -10), k.ANGRY, k.jaw(20), k.tail(8), L.both('guardLow')),
    // Watching it arc over and land.
    L.key(0.6, L.pelvis(0, -0.02), k.bend(2, 0, 0, -6, 0, 8), k.HAPPY, k.jaw(4), k.tail(6, 6), L.both('guardLow')),
    L.key(0.86, L.pelvis(0, -0.025), k.bend(6, 1, 2, 2, 0, 10), k.HAPPY, k.jaw(0), k.tail(4, -6), L.both('guardLow')),
    L.key(1.08, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3)),
    L.key(1.4, k.OPEN),
  ], [{ t: 0.46, name: 'emit' }]);
}

/**
 * Attract: a coy look: it tilts its head, half-lidded, gives the foe a wink,
 * a hand raised by its cheek and the tail swaying (emit: the hearts), then
 * turns away bashful.
 */
export function attract(L: Line): Clip {
  const k = L.k;
  return L.clip('attract', 1.7, [
    L.key(0),
    L.key(0.18, L.pelvis(0.01, -0.02), k.twist(8), k.bend(2, 0, 0, 0, 6, 12), k.DROWSY, k.tail(6, 14), L.arms('cover', 'guardLow')),
    // The wink, the hand by its cheek, the tail swaying.
    L.snap(0.36, L.pelvis(0.015, -0.025), k.twist(12, 4), k.bend(4, 0, 2, 2, 10, 16), k.HAPPY, k.tail(8, -16), L.arms('cover', 'guardLow')),
    L.key(0.6, L.pelvis(0.012, -0.024), k.twist(10, 4), k.bend(4, 0, 2, 2, 8, 18), k.HAPPY, k.tail(8, 16), L.arms('cover', 'guardLow')),
    L.key(0.84, L.pelvis(0.012, -0.024), k.twist(10, 3), k.bend(4, 0, 2, 2, 8, 14), k.HAPPY, k.tail(8, -14), L.arms('cover', 'guardLow')),
    // Turns away, bashful.
    L.key(1.08, L.pelvis(-0.01, -0.02), k.twist(-14), k.bend(6, 2, 0, 6, -14, -8), k.SHUT, k.tail(6, 10), L.both('hug')),
    L.key(1.36, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3)),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.42, name: 'emit' }]);
}

/**
 * Swagger: it struts: chest out, chin up, looking down its nose at the foe,
 * then beckons it on with a flick of the hand (emit) and a taunting flick of
 * the tail, cocky.
 */
export function swagger(L: Line): Clip {
  const k = L.k;
  return L.clip('swagger', 1.7, [
    L.key(0),
    // Chest out, chin up, looking down its nose.
    L.key(0.22, L.pelvis(0, 0.01), k.twist(-10), k.bend(-12, -6, -4, -10, 10), k.HAPPY, k.tail(16, 10), L.arms('fistHip', 'fistHip'), k.FISTS),
    L.key(0.42, L.pelvis(0, 0.012), k.twist(-12), k.bend(-13, -6, -4, -12, 12, 3), k.HAPPY, k.tail(18, -8), L.arms('fistHip', 'fistHip'), k.FISTS),
    // "Come on": a beckoning flick of the hand.
    L.key(0.58, L.pelvis(0, 0.008), k.twist(4), k.bend(-8, -4, -2, -8, 4), k.ANGRY, k.tail(16, 10), L.arms('reach', 'fistHip'), k.FLAT),
    L.snap(0.68, L.pelvis(0, 0.008), k.twist(6), k.bend(-8, -4, -2, -8, 4, 3), k.HAPPY, k.tail(18, -12), L.arms('clawsOut', 'fistHip'), k.SPLAYED),
    L.key(0.8, L.pelvis(0, 0.008), k.twist(4), k.bend(-8, -4, -2, -8, 4), k.HAPPY, k.tail(16, 12), L.arms('reach', 'fistHip'), k.FLAT),
    L.key(0.92, L.pelvis(0, 0.008), k.twist(6), k.bend(-8, -4, -2, -8, 4, 3), k.HAPPY, k.tail(18, -12), L.arms('clawsOut', 'fistHip'), k.SPLAYED),
    L.key(1.18, L.pelvis(0, -0.01), k.bend(2, 0, 0, -4), k.HAPPY, k.tail(8, 4), L.both('guard')),
    L.key(1.7, k.OPEN),
  ], [{ t: 0.72, name: 'emit' }]);
}

/**
 * Swords Dance: it gathers in, eyes shut, then spins round once, arms tucked,
 * and strikes a fierce pose low and side-on, the forearms (Sceptile's
 * blades, Grovyle's leaves) crossed in an X before it (aura), trembling with
 * the power.
 */
export function swordsDance(L: Line): Clip {
  const k = L.k;
  return L.clip('swords_dance', 1.9, [
    L.key(0),
    // Gather in, eyes shut.
    L.key(0.2, L.pelvis(0, -0.06), k.bend(14, 4, 0, 10), k.SHUT, k.tail(-2), L.both('crossedLow'), k.FISTS),
    // Spin round once, the blades raised and crossed high.
    L.key(0.42, L.root({ yaw: 120 }), L.pelvis(0, 0.005), k.bend(-6, -2, 0, -8), k.FOCUS, k.tail(16, -20), L.both('crossedLow')),
    L.key(0.62, L.root({ yaw: 250 }), L.pelvis(0, 0.01), k.bend(-8, -3, 0, -10), k.FOCUS, k.tail(18, -24), L.both('crossedLow')),
    L.key(0.8, L.root({ yaw: 360 }), L.pelvis(0, 0.005), k.bend(-6, -2, 0, -8), k.ANGRY, k.tail(16, -10), L.both('crossedLow')),
    // The pose: blades up and ready, low and fierce.
    L.snap(0.9, L.root({ yaw: 360 }), L.pelvis(0, -0.06), k.twist(-16), k.bend(8, 2, 0, -8, 12), k.ANGRY, k.tail(10, 10), L.both('crossed')),
    L.key(1.1, L.root({ yaw: 360 }), L.pelvis(0, -0.062), k.twist(-17), k.bend(9, 2, 0, -8, 13, 2), k.ANGRY, k.tail(10, 12), L.both('crossed')),
    L.key(1.3, L.root({ yaw: 360 }), L.pelvis(0, -0.06), k.twist(-16), k.bend(8, 2, 0, -8, 12, -2), k.ANGRY, k.tail(10, 8), L.both('crossed')),
    L.key(1.56, L.root({ yaw: 360 }), L.pelvis(0, -0.02), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(4), L.both('guard')),
    L.key(1.9, L.root({ yaw: 360 }), k.OPEN),
  ], [{ t: 0.96, name: 'aura' }]);
}

/**
 * Sleep Talk (while it sleeps): slumped asleep, it mumbles (the jaw working),
 * stirs and flails an arm at nothing, eyes still shut (aura), then settles
 * back to sleep.
 */
export function sleepTalk(L: Line): Clip {
  const k = L.k;
  return L.clip('sleep_talk', 1.9, [
    L.key(0),
    L.key(0.22, L.pelvis(0, -0.06), k.bend(18, 6, 0, 16, 0, 8), k.SHUT, k.tail(-6), L.both('droop')),
    // Mumbling, the jaw working.
    L.key(0.38, L.pelvis(0, -0.058), k.bend(16, 5, 0, 14, 4, 8), k.SHUT, k.jaw(14), k.tail(-6, 4), L.both('droop')),
    L.key(0.5, L.pelvis(0, -0.06), k.bend(17, 5, 0, 15, -2, 6), k.SHUT, k.jaw(2), k.tail(-6, -2), L.both('droop')),
    L.key(0.62, L.pelvis(0, -0.058), k.bend(16, 5, 0, 13, 4, 8), k.SHUT, k.jaw(16), k.tail(-6, 4), L.both('droop')),
    // It stirs and flails an arm at nothing, still asleep.
    L.snap(0.76, L.pelvis(0, -0.04), k.twist(14), k.bend(8, 2, 0, 4, -8, 4), k.SHUT, k.jaw(10), k.tail(0, 14), L.arms('slashEnd', 'droop')),
    L.key(0.96, L.pelvis(0, -0.045), k.twist(10), k.bend(10, 2, 0, 6, -6, 6), k.SHUT, k.jaw(4), k.tail(-2, 10), L.arms('low', 'droop')),
    // Back to sleep.
    L.key(1.22, L.pelvis(0, -0.06), k.bend(18, 6, 0, 16, 0, 8), k.SHUT, k.jaw(0), k.tail(-6), L.both('droop')),
    L.key(1.56, L.pelvis(0, -0.03), k.bend(6, 1, 0, 6, 0, 3), k.DROWSY, k.tail(-2)),
    L.key(1.9, k.OPEN),
  ], [{ t: 0.8, name: 'aura' }]);
}

/**
 * Sunny Day: it looks up at the sky and raises both arms high, palms open
 * to it, calling the sun out (aura); it basks a moment, face up and eyes
 * closed, then lowers its arms.
 */
export function sunnyDay(L: Line): Clip {
  const k = L.k;
  return L.clip('sunny_day', 1.8, [
    L.key(0),
    L.key(0.18, L.pelvis(0, -0.04), k.bend(8, 2, 0, 4), k.FOCUS, k.tail(2), L.both('low'), k.FLAT),
    // Up to the sky, both arms raised high, calling.
    L.key(0.46, L.pelvis(0, 0.012), k.bend(-12, -6, -6, -26), k.WIDE, k.jaw(10), k.tail(14), L.both('spread'), k.SPLAYED),
    L.key(0.62, L.pelvis(0, 0.014), k.bend(-13, -6, -6, -27, 0, 2), k.WIDE, k.jaw(12), k.tail(16), L.both('spread'), k.SPLAYED),
    // Basking, face up, eyes closed.
    L.key(0.9, L.pelvis(0, 0.01), k.bend(-10, -5, -4, -24, 0, -3), k.SHUT, k.jaw(2), k.tail(14, 6), L.both('spread'), k.SPLAYED),
    L.key(1.16, L.pelvis(0, 0.008), k.bend(-9, -5, -4, -22, 0, 3), k.HAPPY, k.jaw(0), k.tail(14, -6), L.both('spread'), k.SPLAYED),
    L.key(1.44, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(4), L.both('guardLow')),
    L.key(1.8, k.OPEN),
  ], [{ t: 0.5, name: 'aura' }]);
}

/**
 * Rest: a big yawn and a stretch, then it sinks down, curling up with its
 * head bowed and its eyes shut, and the healing glow comes over it (aura);
 * it breathes slow, then straightens (it sleeps on in idle_asleep).
 */
export function rest(L: Line): Clip {
  const k = L.k;
  return L.clip('rest', 2.0, [
    L.key(0),
    // A big yawn and a stretch.
    L.key(0.26, L.pelvis(0, 0.01), k.bend(-10, -5, -4, -22), k.SHUT, k.jaw(34), k.tail(14), L.both('spread'), k.SPLAYED),
    L.key(0.46, L.pelvis(0, 0.012), k.bend(-11, -5, -4, -23, 0, 4), k.SHUT, k.jaw(30), k.tail(16), L.both('spread'), k.SPLAYED),
    // Sinks down, curling up, head bowed.
    L.key(0.8, L.legs('squat'), L.pelvis(0, -0.1), k.bend(24, 8, 4, 18, 0, 6), k.SHUT, k.jaw(0), k.tail(-8, 10), L.both('hug')),
    L.key(1.1, L.legs('squat'), L.pelvis(0, -0.105), k.bend(25, 8, 4, 19, 0, 8), k.SHUT, k.tail(-8, 12), L.both('hug')),
    L.key(1.4, L.legs('squat'), L.pelvis(0, -0.1), k.bend(24, 8, 4, 18, 0, 6), k.SHUT, k.tail(-8, 10), L.both('hug')),
    L.key(1.68, L.pelvis(0, -0.04), k.bend(8, 2, 0, 8, 0, 3), k.DROWSY, k.tail(-2), L.both('droop')),
    L.key(2.0, k.OPEN),
  ], [{ t: 0.9, name: 'aura' }]);
}

/**
 * Flash: it curls in over its crossed forearms, eyes shut, gathering the
 * light, then flares up tall and throws its arms open at the foe with the
 * tail fanned high (emit: the screen turns white and both Pokémon black, so
 * the flare is a silhouette), holds the flare and relaxes.
 */
export function flash(L: Line): Clip {
  const k = L.k;
  return L.clip('flash', 1.3, [
    L.key(0),
    // Gather: curl in over the crossed forearms, eyes shut, the tail drawn in low.
    L.key(0.18, L.pelvis(0, -0.06), k.bend(22, 7, 2, 16), k.SHUT, k.tail(-8), L.both('crossedLow'), k.FISTS),
    L.key(0.34, L.pelvis(0, -0.07), k.bend(25, 8, 2, 18, 0, 2), k.SHUT, k.tail(-10), L.both('crossedLow'), k.FISTS),
    // Flare: up tall, chest thrown open, arms flung wide at the foe.
    L.snap(0.44, L.pelvis(0, 0.02, 0.012), k.bend(-16, -9, -6, -16), k.ANGRY, k.jaw(18), k.tail(40), L.both('flare'), k.SPLAYED),
    L.key(0.6, L.pelvis(0, 0.018, 0.012), k.bend(-17, -9, -6, -17, 0, 2), k.ANGRY, k.jaw(16), k.tail(38), L.both('flare'), k.SPLAYED),
    L.key(0.78, L.pelvis(0, 0.014, 0.01), k.bend(-15, -9, -6, -15, 0, -2), k.ANGRY, k.jaw(10), k.tail(34), L.both('flare'), k.SPLAYED),
    // Relax back into the crouch.
    L.key(1.0, L.pelvis(0, -0.015), k.bend(4, 1, 0, 0), k.ANGRY, k.tail(6), L.both('guard')),
    L.key(1.3, k.OPEN),
  ], [{ t: 0.46, name: 'emit' }]);
}

/**
 * Mud Sport: it paws the dirt back with one foot and then the other, like a
 * bull, kicking mud up over itself (emit), then shakes the spatters off its
 * head.
 */
export function mudSport(L: Line): Clip {
  const k = L.k;
  return L.clip('mud_sport', 1.6, [
    L.key(0),
    L.key(0.14, L.pelvis(0.01, -0.04), k.bend(10, 2, 0, 6), k.FOCUS, k.tail(4), L.both('low')),
    // The right foot scuffs back, kicking mud up.
    L.key(0.28, L.legs('pawR'), L.pelvis(0.015, -0.03), k.bend(14, 4, 0, 8), k.ANGRY, k.tail(10, -8), L.both('low')),
    L.snap(0.36, L.pelvis(0, -0.05), k.bend(12, 4, 0, 6), k.ANGRY, k.tail(6, 8), L.both('low')),
    // ... then the left.
    L.key(0.5, L.legs('pawL'), L.pelvis(-0.015, -0.03), k.bend(14, 4, 0, 8), k.ANGRY, k.tail(10, 8), L.both('low')),
    L.snap(0.58, L.pelvis(0, -0.05), k.bend(12, 4, 0, 6), k.ANGRY, k.tail(6, -8), L.both('low')),
    // Shakes the spatters off its head.
    L.key(0.8, L.pelvis(0, -0.03), k.bend(4, 0, 0, -4, 14, 8), k.SHUT, k.tail(8, 10), L.both('guardLow')),
    L.key(0.92, L.pelvis(0, -0.03), k.bend(4, 0, 0, -4, -14, -8), k.SHUT, k.tail(8, -10), L.both('guardLow')),
    L.key(1.04, L.pelvis(0, -0.03), k.bend(4, 0, 0, -4, 10, 6), k.SHUT, k.tail(8, 8), L.both('guardLow')),
    L.key(1.26, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.FOCUS, k.tail(3), L.both('guard')),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.34, name: 'emit' }]);
}

export const STATUS = {
  leer, mimic, screech, roar, agility, double_team: doubleTeam, detect, protect, safeguard, substitute, endure,
  toxic, leech_seed: leechSeed, attract, swagger, swords_dance: swordsDance, sleep_talk: sleepTalk,
  sunny_day: sunnyDay, rest, flash, mud_sport: mudSport,
};
