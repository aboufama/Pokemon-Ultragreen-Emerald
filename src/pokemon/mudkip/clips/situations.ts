// Mudkip's battle situations (src/battle3d/situations.ts): the moments every
// battle plays (idle, intro, hit, faint) and every other situation the game
// puts it in, each its own clip. A pup's reactions: it rocks back onto its
// haunches when startled, flattens itself when hurt, shakes itself like a
// wet dog to get over things, and its tail fin tells how it feels.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, COIL, DROWSY, FOCUS, FRONT_DOWN, FRONT_UP, HAPPY, HURT, LAND, OPEN_EYES, REAR, SHUT, TUCKED, bend, clip, fin, finUp, hips, hopHome,
  jaw, key, pawUp, pelvis, snap, tail, twist,
} from './kit';

/** Lying down on its belly, the legs folded under it. */
const LIE: Pose = { plantFeet: 1, plantFront: 1, pelvis: { x: 0, y: -0.09, z: 0 } };
/** A shiver of the whole body (k: +1 / -1 the two sides). */
const shiver = (k: number): Pose => ({ ...bend(1, 0, 2, 0, 7 * k), root: { roll: 2 * k } });
/** Stiff legs splayed out, locked (seized up). */
const STIFF: Pose = {
  bones: { thighL: { x: 16, z: 14 }, thighR: { x: 16, z: -14 }, shinL: { x: -16 }, shinR: { x: -16 } },
  aim: { armL: { dir: [0.35, -0.9, 0.25] }, forearmL: { dir: [0.3, -0.95, 0.1] }, armR: { dir: [-0.35, -0.9, 0.25] }, forearmR: { dir: [-0.3, -0.95, 0.1] } },
};

// The moments ---------------------------------------------------------------------

/**
 * Idle: the life layer breathes, shifts its weight and drifts its gaze; on
 * top, a slow head tilt and an easy wag of the tail fin (twice per head
 * tilt). The fin and tail fin sway on their springs.
 */
export const idle = clip('idle', [
  key(0),
  key(0.3, pelvis(0, -0.002), bend(0.5, 0, 1, 0, 1.5), tail(1, 7)),
  key(0.6, pelvis(0, -0.004), bend(1, 0, 1.5, 0, 3), tail(2, 0)),
  key(0.9, pelvis(0, -0.002), bend(0.5, 0, 1, 0, 1.5), tail(1, -7)),
  key(1.2, bend(0, 0, 0)),
  key(1.5, pelvis(0, -0.002), bend(0.5, 0, 1, 0, -1.5), tail(1, 7)),
  key(1.8, pelvis(0, -0.004), bend(1, 0, 1.5, 0, -3), tail(2, 0)),
  key(2.1, pelvis(0, -0.002), bend(0.5, 0, 1, 0, -1.5), tail(1, -7)),
  key(2.4),
], [], true);

/**
 * Sent out (or the wild one's cry): curled up small with its eyes shut, it
 * pops up onto its haunches with its head thrown up and its mouth wide in a
 * cheerful cry (a moving hold, the head swaying), comes back down onto its
 * front paws and settles with a wag of its tail fin. The rear is modest:
 * from our side the foe's healthbox sits just above the head fin.
 */
export const intro = clip('intro', [
  key(0, pelvis(0, -0.055), bend(12, 6, 20), tail(-20), SHUT),
  key(0.22, pelvis(0, -0.066), bend(14, 8, 23), tail(-24), SHUT),
  // Sent out, the game grows it out of the ball tinted for ~0.4 s: the cry
  // comes as the tint fades.
  snap(0.44, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-21, -2, -5), tail(22), finUp(25), jaw(34), HAPPY),
  key(0.62, { plantFront: 0.3 }, pelvis(0, 0.005, -0.017), bend(-22, -2, -6, 6, 5), tail(24, 8), finUp(27), jaw(32), HAPPY),
  key(0.8, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-21, -2, -5, -6, -5), tail(23, -8), finUp(25), jaw(35), HAPPY),
  key(0.96, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-20, -2, -4, 3, 2), tail(22, 2), finUp(23), jaw(28), HAPPY),
  key(1.14, { plantFront: 1 }, pelvis(0, -0.014, 0.004), bend(3, 1, 6), tail(4), jaw(4), HAPPY),
  key(1.3, pelvis(0, -0.008), bend(1, 0, 2, 0, 3), tail(2, 12), OPEN_EYES),
  key(1.46, pelvis(0, -0.004), bend(0.5, 0, 1, 0, -2), tail(1, -10), OPEN_EYES),
  key(1.8, OPEN_EYES),
], [[0.48, 'cry']]);

/** Taking a hit: the head snaps back and up with a wince, the tail fin flicks up; it shakes it off. */
export const hit = clip('hit', [
  key(0),
  snap(0.05, pelvis(0, 0.004, -0.02), bend(-10, -4, -16), finUp(27), tail(16), jaw(10), HURT),
  key(0.2, pelvis(0, 0, -0.01), bend(-4, -2, -7), finUp(12), tail(8), jaw(4), HURT),
  key(0.36, pelvis(0, -0.006, 0.004), bend(3, 1, 4), tail(-3), HURT),
  key(0.62, OPEN_EYES),
]);

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * its eyes half shut, then its legs fold and it lies down on its belly like a
 * sleeping pup, head resting tilted on its front paws, eyes shut and the tail
 * fin curled round its side; from the 'shrink' the curled body shrinks away
 * (Battler3D). It settles back as it lies down: as the foe, a head laid
 * forward in front of its feet went under our healthbox.
 */
export const faint = clip('faint', [
  key(0),
  key(0.2, pelvis(0, -0.004), bend(-4, 0, -6, 0, 5), finUp(9), DROWSY),
  key(0.48, pelvis(0, -0.045), { root: { z: -0.02 } }, bend(4, 2, 5, 5, -6), tail(-10, 12), DROWSY),
  key(0.82, pelvis(0, -0.1), { root: { z: -0.04 } }, bend(9, 3, 7, 10, -14), tail(-30, 40), jaw(-2), SHUT),
  key(0.96, pelvis(0, -0.104), { root: { z: -0.04 } }, bend(10, 3, 8, 10, -15), tail(-31, 42), jaw(-2), SHUT),
  key(1.6, pelvis(0, -0.1), { root: { z: -0.04 } }, bend(9, 3, 7.5, 10, -14), tail(-30, 41), jaw(-2), SHUT),
], [[1.02, 'shrink']]);

// Every other situation --------------------------------------------------------------

/** A critical or super-effective blow: knocked back onto its haunches and skidded back, it shakes its head hard and plants itself again. */
export const hitStrong = clip('hit_strong', [
  key(0),
  snap(0.05, { plantFront: 0.4 }, { root: { z: -0.06 } }, pelvis(0, 0.006, -0.03), hips(-6), bend(-16, -5, -20), finUp(36), tail(24), jaw(14), HURT),
  key(0.2, { plantFront: 0.6 }, { root: { z: -0.09 } }, pelvis(0, -0.004, -0.024), hips(-4), bend(-10, -3, -12), finUp(22), tail(16), jaw(8), HURT),
  key(0.34, { plantFront: 1 }, { root: { z: -0.08 } }, pelvis(0, -0.03), bend(6, 3, 10), tail(-6), HURT),
  key(0.46, { root: { z: -0.06 } }, pelvis(0, -0.02), bend(2, 1, 4, 10, 14), tail(-2, 12), SHUT),
  key(0.58, { root: { z: -0.04 } }, pelvis(0, -0.018), bend(2, 1, 4, -10, -14), tail(-2, -12), SHUT),
  key(0.7, { root: { z: -0.02 } }, pelvis(0, -0.012), bend(1, 0, 2, 4, 6), ANGRY),
  key(0.95, OPEN_EYES),
]);

/** The foe's move misses it: a quick hop to its left, ducking low, and a bounce back on guard. */
export const dodge = clip('dodge', [
  key(0),
  key(0.08, pelvis(0, -0.03), bend(3, 2, 6, 0, -6), tail(8, 16), FOCUS),
  snap(0.2, { root: { x: 0.22, y: 0.12, roll: -8 } }, TUCKED, bend(6, 3, 10, -10), tail(10, 30), FOCUS),
  key(0.32, { root: { x: 0.28, roll: -4 } }, LAND, pelvis(0, -0.02), bend(4, 2, 8, -8), tail(6, 20), FOCUS),
  key(0.44, { root: { x: 0.14, y: 0.1, roll: 3 } }, TUCKED, bend(2, 1, 2, 4), tail(8, -10), ANGRY),
  key(0.56, { root: { x: 0 } }, LAND, pelvis(0, -0.012), bend(2, 1, 3), tail(4), ANGRY),
  key(0.9, OPEN_EYES),
]);

/** A move has no effect on it: it stands firm, blinks at the foe unimpressed, tilts its head and gives a dismissive flick of its tail fin. */
export const unaffected = clip('unaffected', [
  key(0),
  key(0.18, pelvis(0, 0.004, -0.008), bend(-4, -1, -4), finUp(6), tail(10), DROWSY),
  key(0.38, pelvis(0, 0.004, -0.008), bend(-4, -1, -4, 12, 14), finUp(6), tail(12, 6), DROWSY),
  key(0.58, pelvis(0, 0.003, -0.007), bend(-3, -1, -3, 10, 12), finUp(5), tail(30, -30), HAPPY),
  key(0.74, pelvis(0, 0.002, -0.006), bend(-3, -1, -3, 6, 8), finUp(4), tail(24, 20), HAPPY),
  key(0.9, pelvis(0, -0.004), bend(1, 0, 1, 2, 2), tail(4), OPEN_EYES),
  key(1.2, OPEN_EYES),
]);

/** Back home from the foe after a run of hits: it pushes off with its hind legs and bounds home in two hops. */
export const returnHome = clip('return_home', [
  key(0, { advance: 1 }, LAND, pelvis(0, -0.01), ANGRY),
  key(0.12, { advance: 1 }, COIL, ANGRY),
  ...hopHome(0.24, ANGRY),
  key(0.8, pelvis(0, -0.012), bend(1, 0, 2, 0, 3), ANGRY),
  key(1.05, OPEN_EYES),
]);

/** Falling asleep: its eyes droop, its head nods and nods again and sinks, and it sways; slow breaths. */
export const statusSleep = clip('status_sleep', [
  key(0),
  key(0.24, pelvis(0, -0.012), bend(2, 1, 6), DROWSY),
  key(0.44, pelvis(0, -0.03), bend(6, 3, 16, 0, 6), tail(-8), DROWSY),
  key(0.6, pelvis(0, -0.014), bend(1, 0, 2), DROWSY),
  key(0.86, pelvis(0, -0.046), bend(9, 4, 20, 0, 10), tail(-14, 8), SHUT),
  key(1.14, pelvis(0.004, -0.05), { root: { roll: 3 } }, bend(9, 4, 21, 0, 12), tail(-15, 10), SHUT),
  key(1.42, pelvis(-0.004, -0.046), { root: { roll: -2 } }, bend(8, 4, 19, 0, 8), tail(-14, 6), SHUT),
  key(1.62, pelvis(0, -0.02), bend(3, 1, 6), DROWSY),
  key(1.9, OPEN_EYES),
]);

/** Poisoned: a sickly shudder, hunched low with its head hanging, wincing, the tail fin drooping. */
export const statusPoison = clip('status_poison', [
  key(0),
  key(0.16, pelvis(0, -0.03), bend(6, 4, 14), tail(-14), HURT),
  key(0.28, pelvis(0.004, -0.04), { root: { roll: 3 } }, bend(8, 5, 16, 0, 5), tail(-18, 6), HURT),
  key(0.38, pelvis(-0.004, -0.04), { root: { roll: -3 } }, bend(8, 5, 16, 0, -5), tail(-18, -6), HURT),
  key(0.48, pelvis(0.003, -0.042), { root: { roll: 2 } }, bend(8.5, 5, 17, 0, 4), tail(-19, 4), HURT),
  key(0.66, pelvis(0, -0.044), bend(9, 5, 18, 0, 2), tail(-20), jaw(6), HURT),
  key(0.86, pelvis(0, -0.02), bend(3, 2, 6), tail(-6), ANGRY),
  key(1.2, OPEN_EYES),
]);

/** Burned: it yelps and hops up off its feet from the burn, lands licking at it (the head turned back), and shakes it off. */
export const statusBurn = clip('status_burn', [
  key(0),
  snap(0.08, { root: { y: 0.14 } }, TUCKED, bend(-8, -3, -12), finUp(18), tail(22), jaw(24), HURT),
  key(0.2, LAND, pelvis(0, -0.02), bend(4, 2, 6), tail(4), jaw(6), HURT),
  key(0.36, pelvis(0, -0.03), twist(-24), bend(8, 6, 14, -40, -8), tail(-4, -30), jaw(10), SHUT),
  key(0.5, pelvis(0, -0.03), twist(-26), bend(8, 6, 15, -44, -10), tail(-4, -32), jaw(14), SHUT),
  key(0.66, pelvis(0, -0.024), twist(-10), bend(5, 3, 8, -16, -4), tail(0, -14), SHUT),
  key(0.8, pelvis(0.006, -0.016), { root: { roll: 5 } }, bend(1, 0, 2, 0, 10), tail(4, 16), SHUT),
  key(0.92, pelvis(-0.006, -0.014), { root: { roll: -5 } }, bend(1, 0, 2, 0, -10), tail(4, -16), SHUT),
  key(1.06, pelvis(0, -0.008), bend(1, 0, 1), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** Paralyzed: it seizes up rigid, legs locked stiff and splayed, head jerking with each jolt, the tail fin twitching. */
export const statusParalysis = clip('status_paralysis', [
  key(0),
  snap(0.06, STIFF, pelvis(0, 0.01), bend(-6, -2, -8), finUp(10), tail(26), jaw(12), HURT),
  key(0.18, STIFF, pelvis(0, 0.012), bend(-6.5, -2, -8.5, 4, 5), finUp(10), tail(28, 8), jaw(12), HURT),
  snap(0.26, STIFF, pelvis(0, 0.008), bend(-5, -2, -6, -6, -8), finUp(9), tail(24, -10), jaw(8), HURT),
  key(0.4, STIFF, pelvis(0, 0.012), bend(-6.5, -2, -8.5, 3, 4), finUp(10), tail(28, 6), jaw(12), HURT),
  snap(0.5, STIFF, pelvis(0, 0.008), bend(-5, -2, -6, -5, -7), finUp(9), tail(24, -8), jaw(8), HURT),
  key(0.66, STIFF, pelvis(0, 0.01), bend(-6, -2, -8, 2, 2), finUp(10), tail(27, 4), jaw(10), HURT),
  key(0.86, pelvis(0, -0.012), bend(2, 1, 4), tail(4), SHUT),
  key(1.2, OPEN_EYES),
]);

/** Frozen: locked in the ice mid-crouch, it strains to break free (tiny tremors), the eyes squeezed shut. */
export const statusFreeze = clip('status_freeze', [
  key(0),
  key(0.14, pelvis(0, -0.03), bend(5, 3, 10), tail(-10), HURT),
  key(0.28, pelvis(0, -0.034), bend(6, 3, 11, 0, 1), tail(-12), jaw(-3), SHUT),
  key(0.44, pelvis(0.002, -0.034), bend(6.2, 3, 11.2, 1, -1), tail(-12.5, 1), jaw(-3), SHUT),
  key(0.6, pelvis(-0.002, -0.035), bend(6, 3, 11, -1, 1.5), tail(-12, -1), jaw(-3), SHUT),
  key(0.76, pelvis(0.003, -0.034), bend(6.4, 3, 11.4, 1.5, -1), tail(-12.5, 2), jaw(-3), SHUT),
  key(0.92, pelvis(-0.003, -0.035), bend(6, 3, 11, -1.5, 1), tail(-12, -2), jaw(-3), SHUT),
  key(1.08, pelvis(0, -0.016), bend(2, 1, 4), tail(-4), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** Confused: it wobbles off balance, its head swimming round in a slow circle, staggering a step each way. */
export const statusConfusion = clip('status_confusion', [
  key(0),
  key(0.2, pelvis(0.01, -0.01), { root: { roll: 5 } }, bend(2, 1, 4, 14, 14), tail(4, -18), DROWSY),
  key(0.4, pelvis(0.012, -0.016), { root: { roll: 7, x: 0.04 } }, bend(6, 2, 10, 0, 18), tail(0, -24), DROWSY),
  key(0.6, pelvis(-0.01, -0.012), { root: { roll: -5, x: 0.02 } }, bend(2, 1, 4, -14, -14), tail(4, 18), DROWSY),
  key(0.8, pelvis(-0.012, -0.016), { root: { roll: -7, x: -0.03 } }, bend(-2, -1, -2, 0, -18), finUp(4), tail(8, 24), DROWSY),
  key(1.0, pelvis(0.01, -0.012), { root: { roll: 5, x: 0 } }, bend(2, 1, 4, 14, 12), tail(4, -16), DROWSY),
  key(1.2, pelvis(0, -0.01), { root: { roll: 1 } }, bend(1, 0, 2, 4, 2), tail(2, -4), SHUT),
  key(1.36, pelvis(0, -0.008), bend(1, 0, 2, 0, -8), SHUT),
  key(1.7, OPEN_EYES),
]);

/** Infatuated: lovestruck, it sways dreamily with its head tilted, eyes happily shut, the tail fin wagging slowly. */
export const statusInfatuation = clip('status_infatuation', [
  key(0),
  key(0.24, pelvis(0.006, -0.01, -0.004), { root: { roll: 3 } }, bend(-2, 0, -2, 10, 16), finUp(4), tail(14, 26), HAPPY),
  key(0.52, pelvis(-0.006, -0.012, -0.004), { root: { roll: -3 } }, bend(-2, 0, -2, -8, -14), finUp(4), tail(14, -26), HAPPY),
  key(0.8, pelvis(0.006, -0.01, -0.004), { root: { roll: 3 } }, bend(-2, 0, -2, 10, 16), finUp(4), tail(14, 26), HAPPY),
  key(1.06, pelvis(-0.004, -0.01, -0.004), { root: { roll: -2 } }, bend(-1, 0, -1, -6, -10), tail(12, -18), HAPPY),
  key(1.3, pelvis(0, -0.006), bend(0.5, 0, 1, 2, 3), tail(4, 4), OPEN_EYES),
  key(1.6, OPEN_EYES),
]);

/** Cursed: it flattens itself low in pain, head pressed down and the tail fin clamped, shuddering. */
export const statusCurse = clip('status_curse', [
  key(0),
  key(0.18, pelvis(0, -0.05), bend(8, 6, 16), tail(-22), HURT),
  key(0.34, pelvis(0.004, -0.07), { root: { roll: 2 } }, bend(10, 7, 20, 3, 4), tail(-30, 6), jaw(8), HURT),
  key(0.5, pelvis(-0.004, -0.072), { root: { roll: -2 } }, bend(10.5, 7, 20.5, -3, -4), tail(-31, -6), jaw(6), HURT),
  key(0.66, pelvis(0.004, -0.07), { root: { roll: 2 } }, bend(10, 7, 20, 3, 4), tail(-30, 6), jaw(8), HURT),
  key(0.84, pelvis(0, -0.04), bend(5, 3, 10), tail(-12), SHUT),
  key(1.02, pelvis(0, -0.014), bend(2, 1, 3), tail(-3), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** Nightmare: asleep, it writhes: the head tossing side to side, a paw twitching up, a whimper, a pained grimace. */
export const statusNightmare = clip('status_nightmare', [
  key(0),
  key(0.2, pelvis(0, -0.04), bend(8, 4, 16, 0, 8), tail(-12, 8), SHUT),
  key(0.36, { plantFront: 0 }, pelvis(0, -0.04), bend(6, 3, 12, 14, 12), FRONT_DOWN, pawUp('R'), tail(-10, 20), jaw(12), HURT),
  key(0.52, { plantFront: 1 }, pelvis(0, -0.044), bend(8, 4, 16, -14, -12), FRONT_DOWN, tail(-14, -20), jaw(4), SHUT),
  key(0.68, { plantFront: 0 }, pelvis(0, -0.04), bend(6, 3, 12, 12, 10), FRONT_DOWN, pawUp('L'), tail(-10, 18), jaw(14), HURT),
  key(0.84, { plantFront: 1 }, pelvis(0, -0.044), bend(8, 4, 16, -10, -8), FRONT_DOWN, tail(-14, -14), jaw(4), SHUT),
  key(1.02, { plantFront: 1 }, pelvis(0, -0.04), bend(7, 4, 14, 0, 6), FRONT_DOWN, tail(-12, 6), SHUT),
  key(1.24, { plantFront: 1 }, pelvis(0, -0.02), bend(3, 1, 6), FRONT_DOWN, DROWSY),
  key(1.6, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
]);

/** Wrapped: squeezed by the bind, it strains outward against it, twice, the legs braced and the head thrown up, grimacing. */
export const statusWrapped = clip('status_wrapped', [
  key(0),
  key(0.14, pelvis(0, -0.02), bend(4, 2, 8), tail(-12), HURT),
  key(0.32, STIFF, pelvis(0, 0.006, -0.01), hips(-4), bend(-10, -3, -14), finUp(24), tail(20), jaw(12), SHUT),
  key(0.46, pelvis(0, -0.03), bend(6, 3, 10), tail(-10), HURT),
  key(0.62, STIFF, pelvis(0, 0.008, -0.012), hips(-5), bend(-12, -3, -16), finUp(26), tail(22), jaw(14), SHUT),
  key(0.78, pelvis(0, -0.032), bend(6, 3, 10, 0, 4), tail(-10), HURT),
  key(1.0, pelvis(0, -0.014), bend(2, 1, 3), tail(-3), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** Asleep (loops while it sleeps): lying on its belly, head resting on its paws, eyes shut, slow deep breaths. */
export const idleAsleep = clip('idle_asleep', [
  key(0, LIE, bend(9, 3, 8, 10, -14), tail(-30, 40), jaw(-2), SHUT),
  key(1.5, LIE, pelvis(0, 0.008), bend(8, 3, 7, 10, -13), tail(-29, 39), jaw(-2), SHUT),
  key(3.0, LIE, bend(9, 3, 8, 10, -14), tail(-30, 40), jaw(-2), SHUT),
], [], true);

/** Worn down (loops at a quarter of its HP or less): panting with its mouth open and its head low, the tail fin drooping, still facing the foe. */
export const idleTired = clip('idle_tired', [
  key(0, pelvis(0, -0.03), bend(5, 3, 10), tail(-14), jaw(16), DROWSY),
  key(0.35, pelvis(0, -0.036), bend(6, 3, 12), tail(-15), jaw(22), DROWSY),
  key(0.7, pelvis(0, -0.03), bend(5, 3, 10), tail(-14), jaw(16), DROWSY),
  key(1.05, pelvis(0, -0.036), bend(6, 3, 12, 0, 3), tail(-15), jaw(22), DROWSY),
  key(1.4, pelvis(0, -0.03), bend(5, 3, 10), tail(-14), jaw(16), DROWSY),
], [], true);

/** Powered up: it rears up proudly onto its haunches, chest out and head high, the tail fin raised, with a fierce little cry. */
export const statUp = clip('stat_up', [
  key(0),
  key(0.16, COIL, bend(6, 3, 8), ANGRY),
  snap(0.36, { plantFront: 0 }, pelvis(0, 0.016, -0.02), hips(-8), bend(-26, -5, -8), finUp(30), FRONT_UP, tail(30), jaw(24), ANGRY),
  key(0.56, { plantFront: 0 }, pelvis(0, 0.018, -0.021), hips(-8), bend(-27, -5, -9, 4, 3), finUp(31), FRONT_UP, tail(32, 8), jaw(20), ANGRY),
  key(0.74, { plantFront: 1 }, pelvis(0, -0.02, 0.006), bend(4, 2, 4), FRONT_DOWN, tail(6), jaw(4), ANGRY),
  key(0.9, { plantFront: 1 }, pelvis(0, -0.008), bend(1, 0, 1), FRONT_DOWN, tail(2), ANGRY),
  key(1.3, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
]);

/** Weakened: it shrinks back low and small, its head drawn in and its tail fin tucked, unsteady. */
export const statDown = clip('stat_down', [
  key(0),
  key(0.2, pelvis(0, -0.04, -0.02), hips(-4), bend(6, 4, 12), tail(-20, 10), HURT),
  key(0.42, pelvis(0.004, -0.056, -0.03), { root: { roll: 3 } }, hips(-6), bend(8, 5, 16, 6, 6), tail(-26, 14), HURT),
  key(0.64, pelvis(-0.004, -0.054, -0.028), { root: { roll: -3 } }, hips(-6), bend(8, 5, 16, -4, -4), tail(-26, 10), HURT),
  key(0.86, pelvis(0, -0.03, -0.012), bend(4, 2, 8), tail(-10), DROWSY),
  key(1.2, OPEN_EYES),
]);

/** Grown stronger: a happy bounce straight up, all four feet off the ground, then a proud cry and a wag. */
export const levelUp = clip('level_up', [
  key(0),
  key(0.16, COIL, HAPPY),
  snap(0.3, { root: { y: 0.3 } }, TUCKED, bend(-8, -2, -8), finUp(10), tail(24), jaw(20), HAPPY),
  key(0.46, { root: { y: 0.04 } }, LAND, pelvis(0, -0.02), tail(10), jaw(10), HAPPY),
  key(0.62, { plantFront: 0.4 }, pelvis(0, 0.006, -0.016), bend(-18, -4, -8), finUp(24), tail(24, 14), jaw(30), HAPPY),
  key(0.8, { plantFront: 0.4 }, pelvis(0, 0.007, -0.017), bend(-19, -4, -9, 4, 4), finUp(25), tail(24, -14), jaw(32), HAPPY),
  key(0.98, { plantFront: 1 }, pelvis(0, -0.01), bend(2, 0, 2), tail(10, 16), jaw(4), HAPPY),
  key(1.14, pelvis(0, -0.006), bend(1, 0, 1), tail(6, -12), HAPPY),
  key(1.5, OPEN_EYES),
]);

/** Drained by Leech Seed: it sags as the energy is drawn out of it, the head dropping and the legs wobbling, then steadies. */
export const drained = clip('drained', [
  key(0),
  key(0.2, pelvis(0, -0.02), bend(3, 2, 6), tail(-6), HURT),
  key(0.46, pelvis(0, -0.06, -0.01), bend(8, 5, 18, 0, 6), tail(-22, 6), jaw(8), DROWSY),
  key(0.7, pelvis(0.004, -0.066, -0.012), { root: { roll: 2 } }, bend(9, 5, 20, 0, 8), tail(-24, 8), jaw(10), DROWSY),
  key(0.94, pelvis(0, -0.03), bend(4, 2, 8), tail(-10), ANGRY),
  key(1.1, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.4, OPEN_EYES),
]);

/** Healed: it lets out a long, happy breath, eyes shut, and wiggles all over, refreshed. */
export const healed = clip('healed', [
  key(0),
  key(0.22, pelvis(0, 0.004, -0.01), bend(-8, -3, -10), finUp(14), tail(16), jaw(16), HAPPY),
  key(0.44, pelvis(0, 0.006, -0.012), bend(-10, -3, -12, 0, 4), finUp(16), tail(18), jaw(6), SHUT),
  key(0.6, pelvis(0.006, -0.012), { root: { roll: 4 } }, bend(1, 0, 2, -8, -6), tail(10, 26), HAPPY),
  key(0.74, pelvis(-0.006, -0.012), { root: { roll: -4 } }, bend(1, 0, 2, 8, 6), tail(10, -26), HAPPY),
  key(0.88, pelvis(0.004, -0.01), { root: { roll: 2 } }, bend(1, 0, 1, -4, -3), tail(8, 16), HAPPY),
  key(1.04, pelvis(0, -0.006), bend(0.5, 0, 1), tail(4), OPEN_EYES),
  key(1.4, OPEN_EYES),
]);

/** Focus Punch's setup: it tightens its focus, crouched low and coiled, the head fin tipped at the foe, utterly still but for a tremor. */
export const focus = clip('focus', [
  key(0),
  key(0.2, COIL, bend(10, 5, 14), fin(20, 10), FOCUS),
  key(0.44, COIL, pelvis(0, -0.008, -0.004), bend(11, 5, 15), fin(34, 18), tail(24), FOCUS),
  key(0.7, COIL, pelvis(0.002, -0.009, -0.004), bend(11.4, 5, 15.4, 1, 1), fin(36, 20), tail(25, 3), FOCUS),
  key(0.96, COIL, pelvis(-0.002, -0.009, -0.004), bend(11.2, 5, 15.2, -1, -1), fin(35, 19), tail(25, -3), FOCUS),
  key(1.2, pelvis(0, -0.02), bend(4, 2, 6), fin(10, 4), tail(8), ANGRY),
  key(1.5, OPEN_EYES),
]);

/** Hanging on at 1 HP: it staggers, its legs buckling under it, but catches itself and stays up, teeth gritted. */
export const hangOn = clip('hang_on', [
  key(0),
  snap(0.06, pelvis(0, 0.002, -0.02), bend(-8, -3, -14), finUp(20), tail(14), jaw(10), HURT),
  key(0.24, pelvis(0.01, -0.07, -0.01), { root: { roll: 6 } }, bend(10, 5, 20, 0, 12), tail(-20, 10), HURT),
  key(0.4, pelvis(0.012, -0.076, -0.01), { root: { roll: 7 } }, bend(11, 5, 21, 0, 14), tail(-22, 12), jaw(-3), SHUT),
  key(0.6, pelvis(0.004, -0.04), { root: { roll: 2 } }, bend(5, 3, 10, 0, 4), tail(-8, 4), jaw(-3), ANGRY),
  key(0.8, pelvis(0, -0.02), bend(2, 1, 4), tail(-2), ANGRY),
  key(1.1, OPEN_EYES),
]);

/** Flinched: startled, it jerks back onto its haunches with its eyes squeezed shut and falters, unable to act, then shakes its head. */
export const flinch = clip('flinch', [
  key(0),
  snap(0.05, { plantFront: 0.5 }, REAR(1.1), jaw(6), SHUT),
  key(0.2, { plantFront: 0.6 }, REAR(0.9), bend(0, 0, 0, 10, 8), jaw(4), SHUT),
  key(0.38, pelvis(0, -0.03), bend(4, 2, 8, -6, -6), tail(-10), HURT),
  key(0.52, pelvis(0, -0.02), bend(2, 1, 4, 8, 10), tail(-6, 8), SHUT),
  key(0.64, pelvis(0, -0.016), bend(2, 1, 4, -8, -10), tail(-6, -8), SHUT),
  key(0.8, pelvis(0, -0.008), bend(1, 0, 2), ANGRY),
  key(1.1, OPEN_EYES),
]);

/** Must recharge: spent after the huge move, it stands with its head hanging, panting hard, too worn out to move. */
export const recharge = clip('recharge', [
  key(0),
  key(0.24, pelvis(0, -0.04), bend(8, 5, 18), tail(-20), jaw(18), DROWSY),
  key(0.44, pelvis(0, -0.046), bend(9, 5, 20), tail(-21), jaw(26), DROWSY),
  key(0.64, pelvis(0, -0.04), bend(8, 5, 18), tail(-20), jaw(18), DROWSY),
  key(0.84, pelvis(0, -0.046), bend(9, 5, 20, 0, 3), tail(-21), jaw(26), DROWSY),
  key(1.04, pelvis(0, -0.04), bend(8, 5, 18, 0, 3), tail(-20), jaw(18), DROWSY),
  key(1.3, pelvis(0, -0.02), bend(3, 2, 6), tail(-6), jaw(4), ANGRY),
  key(1.7, OPEN_EYES),
]);

/** Woke up: it jolts awake from its slump, blinks, shakes the sleep out of its head and gets back on guard. */
export const wake = clip('wake', [
  key(0, pelvis(0, -0.04), bend(8, 4, 16, 0, 8), tail(-12, 8), SHUT),
  snap(0.12, pelvis(0, 0.006, -0.012), bend(-10, -3, -12), finUp(20), tail(20), jaw(14), OPEN_EYES),
  key(0.28, pelvis(0, 0.004, -0.01), bend(-8, -3, -10), finUp(16), tail(16), jaw(6), DROWSY),
  key(0.42, pelvis(0.006, -0.014), { root: { roll: 5 } }, bend(1, 0, 2, 0, 12), tail(4, 16), SHUT),
  key(0.54, pelvis(-0.006, -0.014), { root: { roll: -5 } }, bend(1, 0, 2, 0, -12), tail(4, -16), SHUT),
  key(0.66, pelvis(0.004, -0.012), { root: { roll: 2 } }, bend(1, 0, 2, 0, 5), tail(2, 8), ANGRY),
  key(0.84, pelvis(0, -0.008), bend(1, 0, 1), ANGRY),
  key(1.2, OPEN_EYES),
]);

/**
 * Shook it off (thawed, came to its senses, free of a bind, a status healed):
 * a hard wet-pup shake from head to tail, a stamp of its front paws, and
 * back on guard with a snort.
 */
export const shakeOff = clip('shake_off', [
  key(0),
  key(0.12, pelvis(0, -0.024), bend(4, 2, 8), SHUT),
  key(0.24, pelvis(0.01, -0.02), { root: { roll: 7 } }, twist(6), bend(2, 0, 2, -12, -8), tail(6, -26), SHUT),
  key(0.36, pelvis(-0.01, -0.02), { root: { roll: -7 } }, twist(-6), bend(2, 0, 2, 12, 8), tail(6, 26), SHUT),
  key(0.48, pelvis(0.006, -0.018), { root: { roll: 5 } }, twist(4), bend(2, 0, 2, -8, -5), tail(6, -16), SHUT),
  key(0.6, { plantFront: 0 }, pelvis(0, 0.006, -0.01), bend(-8, -2, -6), finUp(10), FRONT_UP, tail(14), ANGRY),
  snap(0.7, { plantFront: 1 }, pelvis(0, -0.03, 0.008), bend(6, 2, 8), FRONT_DOWN, tail(-4), jaw(10), ANGRY),
  key(0.86, { plantFront: 1 }, pelvis(0, -0.02), bend(3, 1, 4), FRONT_DOWN, jaw(2), ANGRY),
  key(1.0, { plantFront: 1 }, pelvis(0, -0.008), bend(1, 0, 1), FRONT_DOWN, ANGRY),
  key(1.3, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
]);

/** Broke free of the Poké Ball: it bursts back out with a bounce, shakes itself, stamps crossly and yaps, then settles in its stance. */
export const breakFree = clip('break_free', [
  key(0, pelvis(0, -0.055), bend(12, 6, 20), tail(-20), SHUT),
  snap(0.14, { root: { y: 0.24 } }, TUCKED, bend(-8, -2, -8), finUp(10), tail(24), jaw(14), ANGRY),
  key(0.3, LAND, pelvis(0, -0.02), tail(8), ANGRY),
  key(0.42, pelvis(0.01, -0.02), { root: { roll: 7 } }, bend(2, 0, 2, -16, -10), tail(6, -24), SHUT),
  key(0.54, pelvis(-0.01, -0.02), { root: { roll: -7 } }, bend(2, 0, 2, 16, 10), tail(6, 24), SHUT),
  key(0.68, { plantFront: 0 }, pelvis(0, 0.006, -0.01), bend(-8, -2, -6), finUp(10), FRONT_UP, tail(14), ANGRY),
  snap(0.78, { plantFront: 1 }, pelvis(0, -0.03, 0.01), bend(8, 3, -2), FRONT_DOWN, tail(-8), jaw(34), ANGRY),
  key(0.94, { plantFront: 1 }, pelvis(0, -0.028, 0.01), bend(8, 3, -2, 6, 4), FRONT_DOWN, tail(-8, 6), jaw(30), ANGRY),
  key(1.1, { plantFront: 1 }, pelvis(0, -0.012), bend(2, 1, 2), FRONT_DOWN, jaw(4), ANGRY),
  key(1.5, { plantFront: 1 }, FRONT_DOWN, OPEN_EYES),
]);

/** The rain keeps falling: a Water type in its element, it turns its face up into the rain, eyes happily shut, wagging its tail fin. */
export const weatherRain = clip('weather_rain', [
  key(0),
  key(0.2, pelvis(0, 0.004, -0.01), bend(-8, -4, -12), finUp(20), tail(14, 16), HAPPY),
  key(0.46, pelvis(0, 0.006, -0.012), bend(-10, -4, -14, 6, 6), finUp(22), tail(16, -22), jaw(20), HAPPY),
  key(0.72, pelvis(0, 0.006, -0.012), bend(-10, -4, -14, -6, -6), finUp(22), tail(16, 22), jaw(22), HAPPY),
  key(0.96, pelvis(0, 0.005, -0.011), bend(-9, -4, -13, 3, 3), finUp(21), tail(14, -16), jaw(16), HAPPY),
  key(1.16, pelvis(0, -0.006), bend(1, 0, 1), tail(6, 8), OPEN_EYES),
  key(1.5, OPEN_EYES),
]);

/** The sunlight is strong: it squints and turns its face away from the glare, head ducked, then peers back at the foe. */
export const weatherSun = clip('weather_sun', [
  key(0),
  key(0.22, pelvis(0, -0.02), bend(4, 3, 12, -22, -8), tail(-6), DROWSY),
  key(0.46, pelvis(0, -0.024), bend(5, 3, 14, -26, -10), tail(-8, -6), SHUT),
  key(0.7, pelvis(0, -0.02), bend(4, 3, 12, -18, -6), tail(-6, 4), DROWSY),
  key(0.9, pelvis(0, -0.014), bend(3, 2, 8, 0, 0), tail(-4), DROWSY),
  key(1.05, pelvis(0, -0.008), bend(1, 0, 2), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** The sandstorm rages: it braces low with its head turned from the wind and its eyes shut tight, the tail fin clamped. */
export const weatherSand = clip('weather_sand', [
  key(0),
  key(0.18, pelvis(0, -0.03), bend(6, 4, 12, 14, 6), tail(-14), SHUT),
  key(0.4, pelvis(0.006, -0.05), { root: { roll: -3 } }, bend(8, 6, 18, 24, 10), tail(-24, 10), SHUT),
  key(0.64, pelvis(0.004, -0.052), { root: { roll: -2 } }, bend(8.5, 6, 18.5, 26, 12), tail(-25, 12), SHUT),
  key(0.86, pelvis(0.006, -0.05), { root: { roll: -3 } }, bend(8, 6, 18, 22, 9), tail(-24, 8), SHUT),
  key(1.04, pelvis(0, -0.02), bend(3, 2, 6), tail(-6), ANGRY),
  key(1.35, OPEN_EYES),
]);

/** The hail keeps falling: it flinches as the stones strike, flattening itself with its head ducked, a shiver. */
export const weatherHail = clip('weather_hail', [
  key(0),
  snap(0.08, pelvis(0, -0.04), bend(6, 5, 16, 0, 6), tail(-18), HURT),
  key(0.22, pelvis(0, -0.056), shiver(1), bend(8, 6, 20), tail(-24, 8), SHUT),
  snap(0.34, pelvis(0, -0.064), bend(9, 7, 22, 0, -6), tail(-26, -6), HURT),
  key(0.48, pelvis(0, -0.06), shiver(-1), bend(8, 6, 21), tail(-25, -8), SHUT),
  key(0.66, pelvis(0, -0.03), bend(4, 3, 10), tail(-12), ANGRY),
  key(0.82, pelvis(0, -0.012), bend(1, 0, 2), ANGRY),
  key(1.1, OPEN_EYES),
]);

export const SITUATION_CLIPS = [
  idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome, statusSleep, statusPoison, statusBurn, statusParalysis, statusFreeze,
  statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped, idleAsleep, idleTired, statUp, statDown, levelUp,
  drained, healed, focus, hangOn, flinch, recharge, wake, shakeOff, breakFree, weatherRain, weatherSun, weatherSand, weatherHail,
];
