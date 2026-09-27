// Mudkip's status moves, played at home: what it does to the foe (a growl,
// a stare down its radar fin, a coy wag of the tail fin, a cocky prance, a
// spew of poison) and to itself (hunkering down, curling up, lying down to
// rest, calling the weather, darting about to throw afterimages). A pup's
// body language: the head, the tail fin and the front paws carry it.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, DROWSY, FOCUS, FRONT_DOWN, FRONT_TUCK, FRONT_UP, HAPPY, HIND_TUCK, LAND, OPEN_EYES, SHUT, TUCKED, bend, clip, fin, finUp, hips, jaw,
  fall, key, pawBack, pawUp, pelvis, snap, tail, twist,
} from './kit';

/** Lying down on its belly, legs folded under it (resting, curled). */
const LIE: Pose = {
  plantFeet: 1,
  plantFront: 1,
  pelvis: { x: 0, y: -0.09, z: 0 },
};
/** A shiver of the whole body (k: +1 / -1 the two sides). */
const shiver = (k: number): Pose => ({ ...bend(1, 0, 2, 0, 7 * k), root: { roll: 2 * k } });
/** A quick side hop's landing: low on all four feet, leaning into it. */
const SQUAT: Pose = { plantFeet: 1, plantFront: 1, pelvis: { x: 0, y: -0.045, z: 0 } };

/**
 * Growl: it leans in low with its head down and its jaw half open in a
 * cute little snarl, the head fin tipped forward and the tail fin stiff,
 * and growls at the foe with small shakes of the head; then it straightens.
 */
export const growl = clip('growl', [
  key(0),
  key(0.14, pelvis(0, -0.012, -0.008), bend(-3, -1, -4), tail(8), FOCUS),
  snap(0.26, pelvis(0, -0.032, 0.016), hips(4), bend(10, 5, 6), fin(14), tail(16), jaw(14), ANGRY),
  key(0.38, pelvis(0, -0.034, 0.017), hips(4), bend(10.5, 5, 6.5, 5, 4), fin(16), tail(17, 6), jaw(16), ANGRY),
  key(0.5, pelvis(0, -0.034, 0.017), hips(4), bend(10.5, 5, 6.5, -5, -4), fin(16), tail(17, -6), jaw(12), ANGRY),
  key(0.62, pelvis(0, -0.034, 0.017), hips(4), bend(10.5, 5, 6.5, 4, 3), fin(15), tail(17, 5), jaw(16), ANGRY),
  key(0.8, pelvis(0, -0.014, 0.004), bend(2, 1, 2), fin(4), tail(4), jaw(2), ANGRY),
  key(1.2, OPEN_EYES),
], [[0.3, 'emit']]);

/**
 * Foresight: the fin on its head is its radar. It leans in low, eyes
 * narrowed, and tips the fin forward until it points at the foe; the fin
 * quivers and the head peers from side to side as it senses, then it
 * straightens up.
 */
export const foresight = clip('foresight', [
  key(0),
  key(0.2, pelvis(0, -0.018, 0.006), bend(3, 1, 5), fin(18, 10), FOCUS),
  snap(0.36, pelvis(0, -0.03, 0.012), bend(5, 2, 7), fin(46, 26), tail(-8), FOCUS),
  key(0.55, pelvis(0.006, -0.031, 0.013), bend(5, 2, 7, 10, 4), fin(50, 34), tail(-8, -8), FOCUS),
  key(0.75, pelvis(-0.006, -0.03, 0.012), bend(5.5, 2, 7, -10, -4), fin(42, 18), tail(-9, 8), FOCUS),
  key(0.95, pelvis(0.004, -0.033, 0.015), bend(5, 2, 9, 6, 2), fin(50, 30), tail(-8, -5), FOCUS),
  key(1.15, pelvis(0, -0.016, 0.006), bend(2, 1, 3), fin(20, 10), tail(-3), ANGRY),
  key(1.6, OPEN_EYES),
], [[0.4, 'emit']]);

/**
 * Mud Sport: it paws the mud up, right then left, then flops down on its
 * belly and wallows in it, wriggling side to side with its tail fin
 * slapping the mud, coating itself, and gets up with a happy shake.
 */
export const mudSport = clip('mud_sport', [
  key(0),
  key(0.12, { plantFront: 0 }, pelvis(0, -0.012, -0.006), bend(-4, 0, 4), FRONT_DOWN, pawUp('R'), ANGRY),
  key(0.22, { plantFront: 0 }, pelvis(0, -0.018, 0.004), bend(4, 2, 12, 0, -4), FRONT_DOWN, pawBack('R'), tail(6), HAPPY),
  key(0.34, { plantFront: 0 }, pelvis(0, -0.012, -0.006), bend(-4, 0, 4), FRONT_DOWN, pawUp('L'), HAPPY),
  key(0.44, { plantFront: 0 }, pelvis(0, -0.018, 0.004), bend(4, 2, 12, 0, 4), FRONT_DOWN, pawBack('L'), tail(6), HAPPY),
  fall(0.6, LIE, pelvis(0, -0.004), FRONT_DOWN, bend(6, 3, 6), tail(20, 0), jaw(10), HAPPY),
  key(0.74, LIE, pelvis(0.01, -0.004), { root: { roll: 12 } }, twist(10), FRONT_DOWN, bend(5, 2, 4, -12, -10), tail(34, -24), jaw(20), HAPPY),
  key(0.88, LIE, pelvis(-0.01, -0.004), { root: { roll: -12 } }, twist(-10), FRONT_DOWN, bend(5, 2, 4, 12, 10), tail(4, 24), jaw(20), HAPPY),
  key(1.02, LIE, pelvis(0.01, -0.004), { root: { roll: 10 } }, twist(8), FRONT_DOWN, bend(5, 2, 4, -10, -8), tail(34, -20), jaw(18), HAPPY),
  key(1.16, LIE, pelvis(-0.006, -0.004), { root: { roll: -6 } }, twist(-5), FRONT_DOWN, bend(5, 2, 4, 6, 6), tail(10, 14), jaw(12), HAPPY),
  key(1.32, pelvis(0, -0.02), FRONT_DOWN, bend(2, 1, 3), tail(4), HAPPY),
  key(1.44, pelvis(0.008, -0.014), { root: { roll: 6 } }, FRONT_DOWN, bend(1, 0, 2, 0, 10), tail(4, 16), SHUT),
  key(1.56, pelvis(-0.008, -0.012), { root: { roll: -6 } }, FRONT_DOWN, bend(1, 0, 2, 0, -10), tail(4, -16), SHUT),
  key(1.9, FRONT_DOWN, OPEN_EYES),
], [[0.26, 'emit']]);

/**
 * Protect: it hunkers down low on four planted feet, head tucked and eyes
 * squeezed shut, tail fin wrapped down, and holds there bracing (squeezing
 * down tighter in shaky breaths) while the barrier stands; then it rises.
 */
export const protect = clip('protect', [
  key(0),
  key(0.14, pelvis(0, -0.02), bend(4, 2, 6), tail(-8), FOCUS),
  snap(0.3, pelvis(0, -0.06), bend(8, 6, 12), tail(-28), SHUT),
  key(0.55, pelvis(0.004, -0.058), bend(7.5, 6, 11, 3, 3), tail(-26, 8), SHUT),
  key(0.8, pelvis(-0.004, -0.066), bend(9.5, 6, 14.5, -3, -3), tail(-31, -8), SHUT),
  key(1.05, pelvis(0.004, -0.06), bend(8, 6, 12, 3, 3), tail(-27, 8), SHUT),
  key(1.3, pelvis(-0.004, -0.068), bend(10, 6, 15, -3, -3), tail(-32, -8), SHUT),
  key(1.5, pelvis(0, -0.062), bend(8.5, 6, 13, 1, 1), tail(-28, 2), SHUT),
  key(1.68, pelvis(0, -0.026), bend(3, 2, 4), tail(-10), ANGRY),
  key(2.0, OPEN_EYES),
], [[0.32, 'aura']]);

/**
 * Toxic: it gulps, the head pulled back and the mouth shut tight, rocks back
 * onto its haunches, then lunges its head forward and spews the poison at
 * the foe in two heaves, the jaw wide; it spits the taste out with a shake.
 */
export const toxic = clip('toxic', [
  key(0),
  key(0.14, pelvis(0, -0.014), bend(3, 1, 6), jaw(-3), FOCUS),
  key(0.3, { plantFront: 0.5 }, pelvis(0, 0.002, -0.018), hips(-4), bend(-12, -3, -10), finUp(20), tail(16), jaw(-3), SHUT),
  snap(0.4, { plantFront: 1 }, pelvis(0, -0.024, 0.016), hips(4), bend(14, 5, 2), tail(-12), jaw(36), ANGRY),
  key(0.52, pelvis(0, -0.018, 0.008), bend(8, 3, -2), tail(-8), jaw(18), ANGRY),
  snap(0.62, pelvis(0, -0.026, 0.018), hips(4), bend(15, 5, 3), tail(-12), jaw(38), ANGRY),
  key(0.78, pelvis(0, -0.02, 0.01), bend(10, 4, 0), tail(-8), jaw(24), ANGRY),
  key(0.92, pelvis(0, -0.01), bend(2, 0, 3, 0, 10), jaw(2), SHUT),
  key(1.02, pelvis(0, -0.008), bend(2, 0, 3, 0, -10), SHUT),
  key(1.14, pelvis(0, -0.006), bend(1, 0, 1, 0, 3), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.44, 'emit']]);

/**
 * Hail: it turns its face up to a cold sky and cries for the hail, rocking
 * back onto its haunches (aura), then hunches down as the first stones come,
 * shivering.
 */
export const hail = clip('hail', [
  key(0),
  key(0.18, pelvis(0, -0.024), bend(4, 2, 8), tail(-6), SHUT),
  key(0.42, { plantFront: 0.4 }, pelvis(0, 0.002, -0.014), bend(-12, -6, -18), finUp(33), tail(12), jaw(22), FOCUS),
  key(0.6, { plantFront: 0.4 }, pelvis(0, 0.003, -0.015), bend(-13, -6, -19, 4, 3), finUp(34), tail(13, 6), jaw(24), FOCUS),
  key(0.78, { plantFront: 1 }, pelvis(0, -0.04), bend(6, 4, 10), tail(-16), jaw(-2), SHUT),
  key(0.88, pelvis(0, -0.042), shiver(1), bend(6, 4, 10), tail(-17, 8), SHUT),
  key(0.98, pelvis(0, -0.04), shiver(-1), bend(6, 4, 10), tail(-16, -8), SHUT),
  key(1.14, pelvis(0, -0.016), bend(2, 1, 3), tail(-4), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.5, 'aura']]);

/**
 * Rain Dance: a pup's happy dance to call the rain: it bounces on its front
 * paws, left, right, left, its tail fin wagging, then rocks back onto its
 * haunches and turns its face up to the sky with a joyful cry (aura), and
 * comes back down.
 */
export const rainDance = clip('rain_dance', [
  key(0),
  key(0.14, pelvis(0, -0.02), bend(3, 1, 4), tail(8, 16), HAPPY),
  key(0.26, { plantFront: 0 }, pelvis(0.01, 0.006, -0.008), { root: { roll: 5 } }, bend(-8, -2, -4, 8, 8), frontOne('L'), tail(14, -24), jaw(16), HAPPY),
  key(0.38, { plantFront: 1 }, pelvis(0, -0.024), bend(4, 1, 4), FRONT_DOWN, tail(8, 0), jaw(8), HAPPY),
  key(0.5, { plantFront: 0 }, pelvis(-0.01, 0.006, -0.008), { root: { roll: -5 } }, bend(-8, -2, -4, -8, -8), frontOne('R'), tail(14, 24), jaw(16), HAPPY),
  key(0.62, { plantFront: 1 }, pelvis(0, -0.024), bend(4, 1, 4), FRONT_DOWN, tail(8, 0), jaw(8), HAPPY),
  key(0.86, { plantFront: 0 }, pelvis(0, 0.01, -0.016), hips(-6), bend(-20, -6, -16), finUp(38), FRONT_UP, tail(20, 10), jaw(30), HAPPY),
  key(1.04, { plantFront: 0 }, pelvis(0, 0.011, -0.017), hips(-6), bend(-21, -6, -17, 5, 4), finUp(39), FRONT_UP, tail(21, -10), jaw(32), HAPPY),
  key(1.2, { plantFront: 0 }, pelvis(0, 0.01, -0.016), hips(-6), bend(-20, -6, -16, -5, -4), finUp(38), FRONT_UP, tail(20, 10), jaw(30), HAPPY),
  key(1.38, { plantFront: 1 }, pelvis(0, -0.014, 0.002), bend(2, 0, 4), FRONT_DOWN, tail(2), jaw(3), OPEN_EYES),
  key(1.8, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
], [[0.9, 'aura']]);

/** One front paw raised high and waving (a dance step). */
function frontOne(side: 'L' | 'R'): Pose {
  return { aim: { [`arm${side}`]: { dir: [0, 0.2, 0.98] }, [`forearm${side}`]: { dir: [0, 0.5, 0.87] } } };
}

/**
 * Double Team: it darts from side to side in quick, low hops, too fast to
 * follow (root.x), landing low on all four feet each time with its head
 * held on the foe; the afterimages swing out from the aura on.
 */
export const doubleTeam = clip('double_team', [
  key(0),
  key(0.12, pelvis(0, -0.035), bend(4, 2, 6), tail(10), ANGRY),
  key(0.22, { root: { x: 0.1, y: 0.14, roll: -4 } }, TUCKED, bend(2, 1, 2, -6), tail(10, -20), ANGRY),
  key(0.32, { root: { x: 0.2, roll: -3 } }, SQUAT, bend(4, 2, 6, -8), tail(8, -24), ANGRY),
  key(0.44, { root: { x: 0.02, y: 0.16, roll: 4 } }, TUCKED, bend(2, 1, 2, 6), tail(10, 20), ANGRY),
  key(0.54, { root: { x: -0.18, roll: 3 } }, SQUAT, bend(4, 2, 6, 8), tail(8, 24), ANGRY),
  key(0.66, { root: { x: 0.02, y: 0.16, roll: -4 } }, TUCKED, bend(2, 1, 2, -6), tail(10, -20), ANGRY),
  key(0.76, { root: { x: 0.2, roll: -3 } }, SQUAT, bend(4, 2, 6, -8), tail(8, -24), ANGRY),
  key(0.88, { root: { x: 0.02, y: 0.16, roll: 4 } }, TUCKED, bend(2, 1, 2, 6), tail(10, 20), ANGRY),
  key(0.98, { root: { x: -0.18, roll: 3 } }, SQUAT, bend(4, 2, 6, 8), tail(8, 24), ANGRY),
  key(1.1, { root: { x: -0.08, y: 0.12, roll: -2 } }, TUCKED, bend(2, 1, 2), tail(10, 0), ANGRY),
  key(1.22, { root: { x: 0 } }, SQUAT, bend(3, 1, 4), tail(6), ANGRY),
  key(1.44, pelvis(0, -0.016), bend(1, 0, 2), ANGRY),
  key(1.8, OPEN_EYES),
], [[0.16, 'aura']]);

/**
 * Rest: a big yawn, then it lies down on its belly like a pup at the
 * water's edge (the Pokédex: it sleeps buried in the soil there), head
 * resting on its paws and eyes shut, and breathes slowly while the Z's
 * rise; then it gets back up.
 */
export const rest = clip('rest', [
  key(0),
  key(0.24, pelvis(0, -0.006, -0.006), bend(-6, -3, -12), finUp(19), jaw(24), DROWSY),
  key(0.42, pelvis(0, -0.03), bend(3, 1, 4, 3, -4), tail(-8, 10), jaw(2), SHUT),
  key(0.7, LIE, pelvis(0, -0.004), bend(11, 4, 12, 8, -12), tail(-28, 36), jaw(-2), SHUT),
  key(1.0, LIE, pelvis(0, 0.004), bend(10, 4, 11, 8, -11), tail(-27, 35), jaw(-2), SHUT),
  key(1.3, LIE, pelvis(0, -0.006), bend(11, 4, 12.5, 8, -12), tail(-28, 36), jaw(-2), SHUT),
  key(1.55, LIE, pelvis(0, 0.002), bend(10, 4, 11, 8, -11), tail(-27, 35), jaw(-2), SHUT),
  key(1.8, pelvis(0, -0.028), bend(2, 1, 3), tail(-6, 8), DROWSY),
  key(2.1, OPEN_EYES),
], [[0.74, 'aura']]);

/**
 * Attract: it cocks its head coyly with its eyes shut happily and wags its
 * big tail fin at the foe, bobbing on its front paws with each wag, then
 * looks back at the foe.
 */
export const attract = clip('attract', [
  key(0),
  key(0.14, pelvis(0, -0.012), bend(2, 0, 4, 8, 10), tail(10), HAPPY),
  snap(0.28, pelvis(0, -0.004), bend(-2, 0, -2, 10, 14), tail(20, 30), HAPPY),
  key(0.46, pelvis(0, -0.012), bend(1, 0, 2, 10, 13), tail(20, -30), HAPPY),
  key(0.64, pelvis(0, -0.004), bend(-2, 0, -2, 10, 14), tail(20, 30), HAPPY),
  key(0.82, pelvis(0, -0.012), bend(1, 0, 2, 10, 13), tail(18, -26), HAPPY),
  key(0.98, pelvis(0, -0.005), bend(-1, 0, -1, 7, 10), tail(14, 16), HAPPY),
  key(1.16, pelvis(0, -0.008), bend(0.5, 0, 1, 2, 3), tail(6, -6), OPEN_EYES),
  key(1.5, OPEN_EYES),
], [[0.3, 'emit']]);

/**
 * Swagger: a cocky prance. Head high and chest out, it struts on the spot
 * with high steps of its front paws, left and right, its tail fin swishing,
 * then gives the foe a smug toss of its head (emit).
 */
export const swagger = clip('swagger', [
  key(0),
  key(0.16, pelvis(0, 0.006, -0.01), bend(-8, -3, -6), finUp(12), tail(18), HAPPY),
  key(0.3, { plantFront: 0 }, pelvis(0.006, 0.01, -0.012), { root: { roll: 3 } }, bend(-10, -3, -8, 10), finUp(14), FRONT_DOWN, pawUp('L'), tail(20, -20), HAPPY),
  key(0.44, { plantFront: 1 }, pelvis(0, 0.004, -0.01), bend(-8, -3, -6, 4), finUp(12), FRONT_DOWN, tail(18), HAPPY),
  key(0.58, { plantFront: 0 }, pelvis(-0.006, 0.01, -0.012), { root: { roll: -3 } }, bend(-10, -3, -8, -10), finUp(14), FRONT_DOWN, pawUp('R'), tail(20, 20), HAPPY),
  key(0.72, { plantFront: 1 }, pelvis(0, 0.004, -0.01), bend(-8, -3, -6, -4), finUp(12), FRONT_DOWN, tail(18), HAPPY),
  key(0.84, { plantFront: 1 }, pelvis(0, 0.002, -0.006), bend(-4, -2, 2, -14, -8), FRONT_DOWN, tail(16, -10), HAPPY),
  snap(0.94, { plantFront: 1 }, pelvis(0, 0.008, -0.014), bend(-12, -4, -12, 12, 10), finUp(18), FRONT_DOWN, tail(22, 16), jaw(14), HAPPY),
  key(1.12, { plantFront: 1 }, pelvis(0, 0.007, -0.013), bend(-11, -4, -11, 10, 8), finUp(17), FRONT_DOWN, tail(20, 10), jaw(10), HAPPY),
  key(1.3, { plantFront: 1 }, pelvis(0, -0.004), bend(-1, 0, 0), FRONT_DOWN, tail(4), ANGRY),
  key(1.7, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
], [[0.98, 'emit']]);

/**
 * Mimic: it watches the foe closely, head cocked one way then the other,
 * then copies it: a bob of its head and a flick of its fin, eyes glinting.
 */
export const mimic = clip('mimic', [
  key(0),
  key(0.18, pelvis(0, -0.014, 0.004), bend(3, 1, 4, 0, 14), fin(10, 8), FOCUS),
  key(0.38, pelvis(0, -0.016, 0.006), bend(3, 1, 4, 0, -14), fin(10, -8), FOCUS),
  key(0.56, pelvis(0, -0.018, 0.008), bend(4, 1, 5, 0, 12), fin(14, 10), FOCUS),
  key(0.7, pelvis(0, 0.002, -0.008), bend(-6, -2, -8), finUp(12), fin(20), tail(12), jaw(10), ANGRY),
  snap(0.78, pelvis(0, -0.02, 0.012), bend(8, 3, 10), fin(30), tail(-8), jaw(4), ANGRY),
  key(0.92, pelvis(0, -0.018, 0.01), bend(7, 3, 8, 4), fin(26, 6), tail(-8, 6), jaw(2), ANGRY),
  key(1.1, pelvis(0, -0.008), bend(2, 1, 2), fin(6), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.8, 'emit']]);

/**
 * Substitute: a burst of effort: it scrunches down small with its eyes
 * squeezed shut, trembling, then pops up with a shake (aura: the doll
 * appears) and hops back a little behind it.
 */
export const substitute = clip('substitute', [
  key(0),
  key(0.14, pelvis(0, -0.03), bend(6, 4, 10), tail(-14), FOCUS),
  key(0.3, pelvis(0, -0.06, -0.01), bend(9, 6, 14, 0, 3), tail(-26), SHUT),
  key(0.42, pelvis(0, -0.062, -0.011), bend(9.5, 6, 14.5, 0, -3), tail(-27, 6), SHUT),
  snap(0.52, { root: { y: 0.16, z: -0.04 } }, TUCKED, bend(-8, -2, -8), finUp(12), tail(20), jaw(18), ANGRY),
  key(0.64, { root: { z: -0.08 } }, LAND, bend(3, 1, 4, 0, 8), tail(6, 10), ANGRY),
  key(0.74, { root: { z: -0.08 } }, pelvis(0, -0.014), bend(1, 0, 2, 0, -8), tail(2, -10), ANGRY),
  key(0.9, { root: { y: 0.1, z: -0.04 } }, TUCKED, bend(-2, 0, -2), ANGRY),
  key(1.02, LAND, pelvis(0, 0.01), ANGRY),
  key(1.2, pelvis(0, -0.008), bend(1, 0, 1), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.54, 'aura']]);

/**
 * Endure: it digs all four feet in and lowers its head, bracing to take
 * whatever comes, teeth gritted and trembling harder as the power builds
 * (aura), then eases and shakes itself.
 */
export const endure = clip('endure', [
  key(0),
  key(0.16, pelvis(0, -0.03, 0.008), hips(4), bend(8, 5, 14), tail(-6), ANGRY),
  snap(0.3, pelvis(0, -0.05, 0.014), hips(6), bend(12, 7, 20), tail(-14), jaw(-4), SHUT),
  key(0.46, pelvis(0.003, -0.052, 0.015), hips(6), bend(12.5, 7, 20.5, 2, 2), tail(-15, 5), jaw(-4), SHUT),
  key(0.62, pelvis(-0.004, -0.054, 0.016), hips(6), bend(13, 7, 21, -3, -3), tail(-15, -6), jaw(-4), SHUT),
  key(0.78, pelvis(0.005, -0.056, 0.017), hips(6), bend(13.5, 7, 21.5, 4, 4), tail(-16, 7), jaw(-4), SHUT),
  key(0.94, pelvis(-0.005, -0.056, 0.017), hips(6), bend(13.5, 7, 21.5, -4, -4), tail(-16, -7), jaw(-4), SHUT),
  key(1.1, pelvis(0, -0.026, 0.006), bend(4, 2, 6), tail(-4), ANGRY),
  key(1.22, pelvis(0, -0.014), shiver(1), tail(2, 8), ANGRY),
  key(1.34, pelvis(0, -0.01), shiver(-1), tail(2, -8), ANGRY),
  key(1.7, OPEN_EYES),
], [[0.36, 'aura']]);

/**
 * Defense Curl: it curls up tight where it stands, lying down with its head
 * tucked into its chest, its paws drawn in and its tail fin wrapped round
 * it (aura), holds there, then uncurls.
 */
export const defenseCurl = clip('defense_curl', [
  key(0),
  key(0.16, pelvis(0, -0.03), bend(6, 4, 10), tail(-8, 10), FOCUS),
  snap(0.34, LIE, pelvis(0, -0.01), hips(-10), bend(22, 12, 30, 0, 0), FRONT_TUCK, HIND_TUCK, tail(-34, 44), SHUT),
  key(0.54, LIE, pelvis(0, -0.012), hips(-10), bend(22.5, 12, 30.5, 2, 2), FRONT_TUCK, HIND_TUCK, tail(-35, 45), SHUT),
  key(0.8, LIE, pelvis(0, -0.014), hips(-10), bend(23, 12, 31, -2, -2), FRONT_TUCK, HIND_TUCK, tail(-35, 46), SHUT),
  key(1.0, pelvis(0, -0.04), bend(8, 4, 12), tail(-12, 16), ANGRY),
  key(1.16, pelvis(0, -0.014), bend(2, 1, 2), tail(-2), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.4, 'aura']]);

/**
 * Refresh: it shakes itself off like a wet pup, the whole body wobbling side
 * to side and the head swinging against it, then stands tall and happy,
 * refreshed (aura).
 */
export const refresh = clip('refresh', [
  key(0),
  key(0.16, pelvis(0, -0.03), bend(4, 2, 8), tail(-6), SHUT),
  key(0.3, pelvis(0.01, -0.02), { root: { roll: 8 } }, twist(8), bend(2, 0, 2, -14, -8), tail(6, -28), SHUT),
  key(0.44, pelvis(-0.01, -0.02), { root: { roll: -8 } }, twist(-8), bend(2, 0, 2, 14, 8), tail(6, 28), SHUT),
  key(0.58, pelvis(0.01, -0.02), { root: { roll: 7 } }, twist(7), bend(2, 0, 2, -13, -7), tail(6, -24), SHUT),
  key(0.72, pelvis(-0.006, -0.016), { root: { roll: -5 } }, twist(-6), bend(1, 0, 1, 12, 6), tail(4, 16), SHUT),
  key(0.86, pelvis(0, 0.006, -0.01), hips(-3), bend(-8, -3, -10), finUp(16), tail(16, 10), jaw(18), HAPPY),
  key(1.04, pelvis(0, 0.007, -0.011), hips(-3), bend(-9, -3, -11, 3, 4), finUp(17), tail(17, -10), jaw(16), HAPPY),
  key(1.2, pelvis(0, -0.006), bend(1, 0, 1), tail(4), HAPPY),
  key(1.6, OPEN_EYES),
], [[0.88, 'aura']]);

/**
 * Curse: it slows and sinks, heavily, its head hanging and its eyes glaring
 * up from under its brow, trembling as the power grows (aura); the tail fin
 * lashes once.
 */
export const curse = clip('curse', [
  key(0),
  key(0.3, pelvis(0, -0.03, 0.004), bend(6, 5, 14), tail(-10), DROWSY),
  key(0.6, pelvis(0, -0.06, 0.006), bend(10, 7, 20, 0, 4), tail(-18), ANGRY),
  key(0.82, pelvis(0.003, -0.064, 0.007), bend(10.5, 7, 20.5, 2, 5), tail(-19, 6), ANGRY),
  key(1.0, pelvis(-0.003, -0.066, 0.008), bend(11, 7, 21, -2, 4), tail(-20, -6), ANGRY),
  snap(1.12, pelvis(0, -0.06, 0.006), bend(10, 7, 20, 0, 4), tail(20, 30), ANGRY),
  key(1.3, pelvis(0, -0.03), bend(4, 3, 8), tail(4, -6), ANGRY),
  key(1.5, pelvis(0, -0.012), bend(1, 1, 2), ANGRY),
  key(1.9, OPEN_EYES),
], [[0.98, 'aura']]);

/**
 * Sleep Talk: fast asleep where it stands, eyes shut and head nodding, it
 * mumbles (the jaw working), perks up still asleep with a happy little cry
 * (aura: the move it calls), and nods off again.
 */
export const sleepTalk = clip('sleep_talk', [
  key(0),
  key(0.26, pelvis(0, -0.036), bend(7, 4, 12, 0, 6), tail(-10, 6), jaw(-2), SHUT),
  key(0.44, pelvis(0, -0.04), bend(8, 4, 14, 0, 8), tail(-11, 6), jaw(8), SHUT),
  key(0.58, pelvis(0, -0.04), bend(8, 4, 13, 0, 6), tail(-11, 6), jaw(0), SHUT),
  key(0.72, pelvis(0, -0.04), bend(8, 4, 14, 0, 8), tail(-11, 6), jaw(10), SHUT),
  key(0.86, pelvis(0, -0.004, -0.008), bend(-6, -2, -8, 0, -4), finUp(12), tail(10, -8), jaw(22), HAPPY),
  key(1.02, pelvis(0, -0.004, -0.009), bend(-7, -2, -9, 0, -6), finUp(13), tail(12, 8), jaw(24), HAPPY),
  key(1.22, pelvis(0, -0.036), bend(7, 4, 12, 0, 6), tail(-10, 6), jaw(-2), SHUT),
  key(1.46, pelvis(0, -0.024), bend(4, 2, 7, 0, 4), tail(-6), DROWSY),
  key(1.8, OPEN_EYES),
], [[0.88, 'aura']]);

export const STATUS_CLIPS = [
  growl, foresight, mudSport, protect, toxic, hail, rainDance, doubleTeam, rest, attract, swagger, mimic, substitute, endure, defenseCurl,
  refresh, curse, sleepTalk,
];
