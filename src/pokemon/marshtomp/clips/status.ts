// Marshtomp's status moves: what it does to the foe (roars, stares, charms,
// spews) and to itself (guards, rests, calls the weather, shuffles to throw
// afterimages). Played at home.

import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_DOWN_FRONT, BRACED, CROSSED_CHEST, CROSSED_GUARD, CROSSED_LOW, CURL, DROWSY, ELBOWS_BACK, ELBOWS_OUT, FISTS,
  FISTS_AT_SIDES, GUARD_RISING, HAPPY, HOP, LAND, LIMP_ARMS, MOUTH_SHUT, NARROW, OPEN_EYES, SHUT, SPIT_BRACE, SPLAY, SQUINT, SUMO_GUARD, arms, bend, body,
  clip, jaw, key, pelvis, sink, snap, stepL, stepR, twist,
} from './kit';

/** Protect: digs in behind crossed forearms, eyes squeezed shut, and braces there. */
export const protect = clip('protect', [
  key(0),
  key(0.14, pelvis(0, -0.03), bend(6, 2, 0, 4), GUARD_RISING, ANGRY),
  snap(0.28, pelvis(0, -0.06), bend(12, 4, 2, 14), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.4, pelvis(0, -0.066), bend(13, 4, 2, 15, 0, 1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.74, pelvis(0, -0.075, 0.012), bend(15, 5, 2, 16, 0, -1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
  key(0.92, pelvis(0, -0.05), bend(9, 3, 1, 9), GUARD_RISING, ANGRY),
  key(1.09, pelvis(0, -0.02), bend(3, 1, 0, 2), ANGRY),
  key(1.41, OPEN_EYES),
], [[0.35, 'aura']]);

/**
 * Foresight: braces low and leans its chest in, face kept up at the foe,
 * mouth shut, and peers at it with narrowed eyes (a slow head sway), its
 * head fin sensing it.
 */
export const foresight = clip('foresight', [
  key(0),
  key(0.23, pelvis(0, -0.03, 0.02), bend(12, 4, 0, -6, 0, 6), BRACED, MOUTH_SHUT, NARROW),
  key(0.39, pelvis(0, -0.035, 0.025), bend(14, 5, 0, -6, -6, 8), BRACED, MOUTH_SHUT, NARROW),
  key(0.65, pelvis(0, -0.04, 0.03), bend(16, 6, 0, -6, 6, 5), BRACED, MOUTH_SHUT, NARROW),
  key(0.84, pelvis(0, -0.02, 0.01), bend(5, 2, 0, -2), ANGRY),
  key(1.19, OPEN_EYES),
], [[0.32, 'emit']]);


/**
 * Rest: settles down heavily, arms dropping to its sides, eyes closed and
 * the head sinking forward, then a slow, deep breath (a moving hold) while
 * it recovers, and it rises again.
 */
export const rest = clip('rest', [
  key(0),
  key(0.14, sink(-0.012), bend(4, 2, 1, 2), ELBOWS_OUT, CURL, MOUTH_SHUT, { expression: 'half' }),
  key(0.32, sink(-0.05), bend(10, 4, 2, 6), LIMP_ARMS, CURL, MOUTH_SHUT, { expression: 'half' }),
  key(0.55, sink(-0.066), bend(14, 6, 2, 10), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
  key(0.84, sink(-0.058), bend(10, 2, 2, 7), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
  key(1.13, sink(-0.066), bend(14, 6, 2, 10, 0, 2), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
  key(1.39, sink(-0.058), bend(10, 2, 2, 7, 0, -1), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
  key(1.53, sink(-0.03), bend(4, 1, 0, 0), ELBOWS_OUT, CURL, jaw(2), { expression: 'half' }),
  key(1.67, sink(-0.02), bend(2, 0, 0, -2), jaw(2), { expression: 'half' }),
  key(1.94, OPEN_EYES),
], [[0.79, 'aura']]);

/** The guard coming down (a breakdown back into its stance). */
const GUARD_LOWERING = arms([0.88, -0.35, 0.33], [0.5, -0.4, 0.77], [-0.3, -0.35, 0.89]);
/** A heavy side-hop's landing: deep in the knees (the body leans with it: root.roll). */
const SQUASH: Pose = { plantFeet: 1, pelvis: { y: -0.07 }, bones: { spine: { x: 10 }, head: { x: -6 } } };
/** The head held level against the body's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * Double Team: short, heavy side-hops, a sumo's shuffle, not a sprinter's
 * dart: each a low hop to one side and a landing deep in the knees, the body
 * leaning with it and the head held level, the arms spread in a grappler's
 * guard. The hops are narrow (0.15 heights) and lean a little: wider, or
 * leaning further, the head fin went under our healthbox from our side.
 * The afterimages start at the aura and run 1.4 s (src/battle3d/director.ts).
 */
export const doubleTeam = clip('double_team', [
  key(0),
  key(0.12, pelvis(0, -0.065), bend(10, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.23, { root: { x: 0.075, y: 0.04, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.33, { root: { x: 0.15, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.46, { root: { x: 0.0, y: 0.045, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.56, { root: { x: -0.1, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.69, { root: { x: 0.0, y: 0.045, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.79, { root: { x: 0.15, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.92, { root: { x: 0.0, y: 0.045, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(1.02, { root: { x: -0.1, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(1.14, { root: { x: -0.05, y: 0.035, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(1.25, { root: { x: 0 } }, SQUASH, pelvis(0, -0.01), GUARD_LOWERING, MOUTH_SHUT, ANGRY),
  key(1.46, pelvis(0, -0.04), bend(6, 2, 0, 0), ANGRY),
  key(1.85, OPEN_EYES),
], [[0.18, 'aura']]);

/** Right hand raised to its cheek, the left arm easy (a coy pose). */
const HAND_TO_CHEEK = arms([0.88, -0.3, 0.35], [0.55, -0.75, 0.35], [-0.65, -0.72, 0.25], [[-0.55, -0.35, 0.76], [0.3, 0.85, 0.43], [0.4, 0.7, 0.59]]);
/** Chest out, arms held wide and loose, elbows back (a cocky strut). */
const STRUT = arms([0.76, -0.56, -0.33], [0.45, -0.85, 0.27], [0.15, -0.92, 0.36]);
/** Arms flung up and out, hands open (a mirrored flourish). */
const FLOURISH = arms([0.6, 0.6, 0.53], [0.4, 0.8, 0.45], [0.25, 0.9, 0.36]);
/** A burst of effort: arms thrown down and out, fingers splayed. */
const BURST_DOWN = arms([0.66, -0.66, 0.36], [0.5, -0.8, 0.33], [0.38, -0.88, 0.3]);
/** Hugging its knees, curled up tight. */
const HUG_KNEES = arms([0.45, -0.75, 0.48], [-0.4, -0.55, 0.73], [-0.6, -0.4, 0.69]);
/** Scooping mud from beside the feet, one hand (left) low. */
const SCOOP_L = arms([0.66, -0.74, 0.12], [0.25, -0.95, 0.2], [0.0, -0.95, 0.3], [[-0.88, -0.3, 0.35], [-0.55, -0.75, 0.35], [0.65, -0.72, 0.25]]);
/** Smearing the mud across its belly with both hands. */
const SMEAR = arms([0.6, -0.55, 0.58], [-0.55, -0.25, 0.8], [-0.7, -0.3, 0.65]);
/** Arms raised up in front, palms to the sky (calling the weather). */
const PALMS_SKY = arms([0.55, 0.62, 0.56], [0.3, 0.9, 0.32], [0.15, 0.95, 0.27]);
/** Arms raised, rocking to its left in the dance. */
const DANCE_L = arms([0.7, 0.6, 0.39], [0.5, 0.85, 0.16], [0.35, 0.93, 0.1], [[-0.45, 0.55, 0.7], [-0.1, 0.9, 0.42], [0.05, 0.95, 0.3]]);
/** ... to its right. */
const DANCE_R = arms([0.45, 0.55, 0.7], [0.1, 0.9, 0.42], [-0.05, 0.95, 0.3], [[-0.5, 0.66, 0.56], [-0.3, 0.88, 0.37], [-0.18, 0.95, 0.25]]);

/**
 * Growl: it leans in low and growls at the foe, head down and jaw half open,
 * a deep rumble with small shakes of the head; the arms stay braced.
 */
export const growl = clip('growl', [
  key(0),
  key(0.16, sink(-0.03), bend(8, 3, 0, 6), BRACED, MOUTH_SHUT, NARROW),
  snap(0.26, sink(-0.05, 0.03), bend(16, 6, 2, 10), BRACED, jaw(8), ANGRY),
  key(0.39, sink(-0.05, 0.03), bend(16, 6, 2, 10, 4, 3), BRACED, jaw(10), ANGRY),
  key(0.49, sink(-0.05, 0.03), bend(16, 6, 2, 10, -4, -3), BRACED, jaw(8), ANGRY),
  key(0.6, sink(-0.05, 0.03), bend(16, 6, 2, 10, 4, 2), BRACED, jaw(10), ANGRY),
  key(0.76, sink(-0.03, 0.01), bend(6, 2, 0, 3), jaw(2), ANGRY),
  key(1.14, OPEN_EYES),
], [[0.3, 'emit']]);

/**
 * Toxic: it gulps, cheeks bulging, rears back, then lunges its head forward
 * and spews the poison at the foe in two heaves, the jaw wide.
 */
export const toxic = clip('toxic', [
  key(0),
  key(0.18, pelvis(0, 0.012), bend(-6, -4, -2, -12), ELBOWS_BACK, MOUTH_SHUT, SQUINT),
  key(0.32, pelvis(0, 0.016), bend(-8, -5, -3, -14, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SQUINT),
  snap(0.4, sink(-0.04, 0.03), bend(14, 6, 2, 6), SPIT_BRACE, jaw(28), ANGRY),
  key(0.53, sink(-0.035, 0.02), bend(10, 4, 0, 2), SPIT_BRACE, jaw(16), ANGRY),
  snap(0.63, sink(-0.045, 0.03), bend(15, 6, 2, 7), SPIT_BRACE, jaw(28), ANGRY),
  key(0.77, sink(-0.035, 0.02), bend(10, 4, 0, 2), SPIT_BRACE, jaw(14), ANGRY),
  key(0.95, sink(-0.015), bend(4, 2, 0, 0, 8), jaw(2), ANGRY),
  key(1.32, OPEN_EYES),
], [[0.44, 'emit']]);

/**
 * Attract: a coy, flirty pose. It tilts its big head, raises a hand to its
 * cheek and gives the foe a happy squint of a wink, swaying its hips, then
 * looks back at it.
 */
export const attract = clip('attract', [
  key(0),
  key(0.18, sink(-0.02), bend(2, 1, 0, 0, 8, 10), HAND_TO_CHEEK, MOUTH_SHUT, OPEN_EYES),
  snap(0.32, pelvis(0.02, -0.02), body(0, 0, 0, 0, -3), bend(-2, -1, 0, -4, 12, 16), HAND_TO_CHEEK, jaw(8), HAPPY),
  key(0.49, pelvis(-0.015, -0.02), body(0, 0, 0, 0, 2), bend(-2, -1, 0, -4, 10, 14), HAND_TO_CHEEK, jaw(10), HAPPY),
  key(0.67, pelvis(0.02, -0.02), body(0, 0, 0, 0, -3), bend(-2, -1, 0, -4, 12, 16), HAND_TO_CHEEK, jaw(8), HAPPY),
  key(0.84, pelvis(0, -0.015), bend(0, 0, 0, -2, 6, 8), HAND_TO_CHEEK, jaw(4), HAPPY),
  key(1.06, sink(-0.01), bend(1, 0, 0, 0, 2, 2), ELBOWS_OUT, OPEN_EYES),
  key(1.41, OPEN_EYES),
], [[0.35, 'emit']]);

/**
 * Swagger: a cocky strut. Chest out and shoulders back, it swaggers a heavy
 * step with each foot, rolling its shoulders, and tosses its head at the foe
 * with a smug grin.
 */
export const swagger = clip('swagger', [
  key(0),
  key(0.16, pelvis(0, 0.01), bend(-8, -5, -2, -10), STRUT, MOUTH_SHUT, NARROW),
  key(0.3, stepL(26), pelvis(0.02, 0.005), twist(-10), bend(-9, -5, -2, -10), STRUT, MOUTH_SHUT, NARROW),
  key(0.42, pelvis(0.015, 0), twist(-6), bend(-9, -5, -2, -11), STRUT, MOUTH_SHUT, NARROW),
  key(0.55, stepR(26), pelvis(-0.02, 0.005), twist(10), bend(-9, -5, -2, -10), STRUT, MOUTH_SHUT, NARROW),
  key(0.67, pelvis(-0.015, 0), twist(6), bend(-9, -5, -2, -11), STRUT, MOUTH_SHUT, NARROW),
  snap(0.77, pelvis(0, 0.012), bend(-10, -6, -3, -16, -14, -8), STRUT, jaw(14), HAPPY),
  key(0.93, pelvis(0, 0.01), bend(-10, -6, -3, -15, -12, -6), STRUT, jaw(12), HAPPY),
  key(1.11, sink(-0.01), bend(-2, -1, 0, -4), ELBOWS_OUT, jaw(4), NARROW),
  key(1.5, OPEN_EYES),
], [[0.79, 'emit']]);

/**
 * Mimic: it watches the foe closely, head cocked one way then the other,
 * then copies it with a flourish, arms flung up and out as if mirroring its
 * pose.
 */
export const mimic = clip('mimic', [
  key(0),
  key(0.18, sink(-0.02, 0.01), bend(6, 2, 0, -2, 8, 10), BRACED, MOUTH_SHUT, NARROW),
  key(0.37, sink(-0.025, 0.012), bend(7, 2, 0, -2, -8, -10), BRACED, MOUTH_SHUT, NARROW),
  key(0.53, sink(-0.03), bend(8, 3, 0, 0), CROSSED_CHEST, MOUTH_SHUT, NARROW),
  snap(0.63, pelvis(0, 0.018), bend(-10, -6, -3, -12), FLOURISH, SPLAY, jaw(16), HAPPY),
  key(0.79, pelvis(0, 0.02), bend(-11, -6, -3, -13, 4, 3), FLOURISH, SPLAY, jaw(14), HAPPY),
  key(0.97, pelvis(0, 0.01), bend(-4, -2, 0, -4), ARMS_DOWN_FRONT, jaw(6), ANGRY),
  key(1.11, sink(-0.015), bend(2, 1, 0, 0), jaw(2), ANGRY),
  key(1.5, OPEN_EYES),
], [[0.67, 'emit']]);

/**
 * Endure: it digs in to take whatever comes, sinking into a deep squat with
 * its fists clenched hard at its sides, teeth gritted and eyes squeezed shut,
 * trembling with the strain.
 */
export const endure = clip('endure', [
  key(0),
  key(0.16, sink(-0.04), bend(6, 2, 0, 6), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.3, sink(-0.1), bend(12, 4, 0, 10), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(0.44, sink(-0.104), bend(12.5, 4, 0, 10.5, 2, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(0.58, sink(-0.106), bend(12, 4, 0, 10, -2, -2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(0.72, sink(-0.108), bend(12.5, 4, 0, 10.5, 2, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(0.86, sink(-0.106), bend(12, 4, 0, 10, -2, -1), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(1.04, sink(-0.05), bend(6, 2, 0, 4), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  key(1.41, OPEN_EYES),
], [[0.35, 'aura']]);

/**
 * Substitute: a burst of effort (it crouches, clenches and throws its arms
 * down and out with a grunt), then hops back a step and settles, leaving the
 * doll the game shows in its place.
 */
export const substitute = clip('substitute', [
  key(0),
  key(0.18, sink(-0.06), bend(12, 4, 0, 8), CROSSED_LOW, FISTS, MOUTH_SHUT, SQUINT),
  key(0.3, sink(-0.065), bend(13, 4, 0, 9, 0, 2), CROSSED_LOW, FISTS, MOUTH_SHUT, SQUINT),
  snap(0.39, pelvis(0, 0.012), bend(-8, -4, -2, -10), BURST_DOWN, SPLAY, jaw(20), ANGRY),
  key(0.51, pelvis(0, 0.01), bend(-8, -4, -2, -11), BURST_DOWN, SPLAY, jaw(16), ANGRY),
  key(0.63, body(0, 0.05, -0.06), HOP, bend(2, 1, 0, 0), ELBOWS_OUT, jaw(6), ANGRY),
  key(0.76, body(0, 0, -0.1), LAND, bend(6, 2, 0, 2), ELBOWS_OUT, ANGRY),
  key(0.93, body(0, 0, -0.08), pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(1.14, body(0, 0, -0.03), pelvis(0, -0.01), bend(2, 0, 0, 0), ANGRY),
  key(1.41, OPEN_EYES),
], [[0.42, 'aura']]);

/**
 * Defense Curl: it curls up tight where it stands, sinking onto its heels
 * with its arms hugging its knees and its head tucked down, holds there,
 * then unrolls.
 */
export const defenseCurl = clip('defense_curl', [
  key(0),
  key(0.16, sink(-0.04), bend(10, 4, 2, 10), CROSSED_LOW, MOUTH_SHUT, ANGRY),
  snap(0.32, sink(-0.1, -0.02), { root: { z: -0.05, pitch: -3 } }, bend(16, 7, 2, 20), HUG_KNEES, MOUTH_SHUT, SHUT),
  key(0.48, sink(-0.104, -0.02), { root: { z: -0.05, pitch: -3 } }, bend(17, 7, 2, 21, 0, 2), HUG_KNEES, MOUTH_SHUT, SHUT),
  key(0.7, sink(-0.106, -0.02), { root: { z: -0.05, pitch: -3 } }, bend(17, 7, 2, 21, 0, -2), HUG_KNEES, MOUTH_SHUT, SHUT),
  key(0.88, sink(-0.06), bend(12, 4, 2, 8), CROSSED_LOW, MOUTH_SHUT, ANGRY),
  key(1.02, sink(-0.02), bend(4, 1, 0, 2), ANGRY),
  key(1.32, OPEN_EYES),
], [[0.35, 'aura']]);

/**
 * Refresh: it shakes itself off like a wet dog, the whole body wobbling side
 * to side and the head swinging against it, then stands tall, eyes happily
 * squinted, refreshed.
 */
export const refresh = clip('refresh', [
  key(0),
  key(0.14, sink(-0.04), bend(6, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.25, sink(-0.04), body(0, 0, 0, 0, 6), bend(4, 2, 0, 2, -10, -7), twist(7), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.35, sink(-0.04), body(0, 0, 0, 0, -6), bend(4, 2, 0, 2, 10, 7), twist(-7), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.46, sink(-0.04), body(0, 0, 0, 0, 5), bend(4, 2, 0, 2, -9, -6), twist(6), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.56, sink(-0.035), body(0, 0, 0, 0, -4), bend(3, 1, 0, 2, 8, 6), twist(-6), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  snap(0.7, pelvis(0, 0.015), bend(-8, -5, -2, -12), SUMO_GUARD, SPLAY, jaw(12), HAPPY),
  key(0.88, pelvis(0, 0.016), bend(-8, -5, -2, -13, 3, 2), SUMO_GUARD, SPLAY, jaw(10), HAPPY),
  key(1.06, sink(-0.01), bend(1, 0, 0, -2), jaw(4), HAPPY),
  key(1.41, OPEN_EYES),
], [[0.74, 'aura']]);

/**
 * Curse: it slows and hunches, heavily, sinking low with its fists braced on
 * its knees and its head bowed, then tenses as the curse takes (its speed
 * falls, its power rises) and straightens up slowly, heavier than before.
 */
export const curse = clip('curse', [
  key(0),
  key(0.3, sink(-0.06), bend(16, 6, 2, 14), ELBOWS_OUT, MOUTH_SHUT, DROWSY),
  key(0.55, sink(-0.09), { root: { z: -0.03 } }, bend(16, 7, 2, 18), HUG_KNEES, FISTS, MOUTH_SHUT, SHUT),
  key(0.7, sink(-0.094), { root: { z: -0.03 } }, bend(17, 7, 2, 19, 0, 2), HUG_KNEES, FISTS, MOUTH_SHUT, SHUT),
  snap(0.83, sink(-0.09), bend(18, 7, 2, 10), FISTS_AT_SIDES, FISTS, jaw(8), ANGRY),
  key(1, sink(-0.088), bend(17, 7, 2, 9, 2, 2), FISTS_AT_SIDES, FISTS, jaw(6), ANGRY),
  key(1.27, sink(-0.05), bend(8, 3, 0, 4), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, ANGRY),
  key(1.67, OPEN_EYES),
], [[0.86, 'aura']]);

/**
 * Sleep Talk: fast asleep where it stands, head drooping and eyes shut, it
 * mumbles (the jaw working), its body twitching, an arm jerking as if it
 * dreams of fighting.
 */
export const sleepTalk = clip('sleep_talk', [
  key(0),
  key(0.26, sink(-0.05), bend(12, 5, 2, 16), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(0.4, sink(-0.052), bend(12, 5, 2, 16, 3, 3), LIMP_ARMS, jaw(8), SHUT),
  key(0.51, sink(-0.052), bend(12, 5, 2, 16, -2, -2), LIMP_ARMS, jaw(-6), SHUT),
  key(0.62, sink(-0.052), bend(12, 5, 2, 16, 2, 2), LIMP_ARMS, jaw(10), SHUT),
  snap(0.7, sink(-0.045), bend(10, 4, 2, 12), ELBOWS_OUT, FISTS, jaw(4), SHUT),
  key(0.83, sink(-0.05), bend(12, 5, 2, 15, -3, -2), LIMP_ARMS, jaw(8), SHUT),
  key(0.97, sink(-0.052), bend(12, 5, 2, 16, 2, 1), LIMP_ARMS, jaw(-4), SHUT),
  key(1.18, sink(-0.03), bend(6, 2, 0, 8), LIMP_ARMS, MOUTH_SHUT, DROWSY),
  key(1.58, OPEN_EYES),
], [[0.74, 'aura']]);

/**
 * Hail: it turns its face up to a cold sky and raises its arms, palms up,
 * calling the hail, and shivers as it comes (a moving hold), then hunches
 * back down.
 */
export const hail = clip('hail', [
  key(0),
  key(0.18, sink(-0.04), bend(8, 3, 0, 6), CROSSED_CHEST, MOUTH_SHUT, SHUT),
  key(0.4, pelvis(0, 0.018), bend(-12, -7, -5, -22), PALMS_SKY, SPLAY, jaw(12), NARROW),
  key(0.55, pelvis(0, 0.02), bend(-13, -7, -5, -23, 0, 2), PALMS_SKY, SPLAY, jaw(14), NARROW),
  key(0.65, pelvis(0, 0.018), bend(-12, -7, -5, -22, 0, -3), PALMS_SKY, SPLAY, jaw(12), SQUINT),
  key(0.74, pelvis(0, 0.018), bend(-12, -7, -5, -22, 0, 3), PALMS_SKY, SPLAY, jaw(12), SQUINT),
  key(0.88, sink(-0.03), bend(8, 3, 0, 6), CROSSED_CHEST, MOUTH_SHUT, SQUINT),
  key(1.06, sink(-0.015), bend(3, 1, 0, 2), ANGRY),
  key(1.41, OPEN_EYES),
], [[0.44, 'aura']]);

/**
 * Rain Dance: a heavy, stamping dance to call the rain: arms raised to the
 * sky, it rocks to its left and stamps, then to its right and stamps, face
 * turned up, and raises its arms once more as the rain comes.
 */
export const rainDance = clip('rain_dance', [
  key(0),
  key(0.18, sink(-0.04), bend(6, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.32, stepR(28), pelvis(0.025, 0), body(0, 0, 0, 0, -5), bend(-6, -3, -2, -12), DANCE_L, jaw(8), HAPPY),
  snap(0.44, sink(-0.05), body(0, 0, 0, 0, -3), bend(-4, -2, -2, -10), DANCE_L, jaw(10), HAPPY),
  key(0.58, stepL(28), pelvis(-0.025, 0), body(0, 0, 0, 0, 5), bend(-6, -3, -2, -12), DANCE_R, jaw(8), HAPPY),
  snap(0.7, sink(-0.05), body(0, 0, 0, 0, 3), bend(-4, -2, -2, -10), DANCE_R, jaw(10), HAPPY),
  key(0.84, pelvis(0, 0.02), bend(-12, -7, -5, -22), PALMS_SKY, SPLAY, jaw(16), HAPPY),
  key(1, pelvis(0, 0.022), bend(-13, -7, -5, -23, 3, 2), PALMS_SKY, SPLAY, jaw(18), HAPPY),
  key(1.18, sink(-0.02), bend(2, 1, 0, -4), ARMS_DOWN_FRONT, jaw(6), HAPPY),
  key(1.58, OPEN_EYES),
], [[0.88, 'aura']]);

/**
 * Mud Sport: it stamps about in the mud, splashing it up with its feet
 * (left, right), then scoops a handful and smears it over its belly, coating
 * itself, and pats it down happily.
 */
export const mudSport = clip('mud_sport', [
  key(0),
  key(0.12, stepL(34), sink(-0.02), bend(6, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, HAPPY),
  snap(0.21, sink(-0.05), bend(8, 2, 0, 6), ELBOWS_OUT, jaw(8), HAPPY),
  key(0.32, stepR(34), sink(-0.02), bend(6, 2, 0, 4), ELBOWS_OUT, jaw(6), HAPPY),
  snap(0.4, sink(-0.05), bend(8, 2, 0, 6), ELBOWS_OUT, jaw(8), HAPPY),
  key(0.55, sink(-0.08), bend(20, 6, 2, 10), SCOOP_L, CURL, MOUTH_SHUT, HAPPY),
  key(0.69, sink(-0.04), bend(8, 3, 0, 8), SMEAR, CURL, MOUTH_SHUT, HAPPY),
  key(0.81, sink(-0.04), bend(8, 3, 0, 8, 4), SMEAR, CURL, jaw(6), HAPPY),
  key(0.93, sink(-0.04), bend(8, 3, 0, 8, -4), SMEAR, CURL, jaw(8), HAPPY),
  key(1.09, sink(-0.02), bend(2, 1, 0, 2), ELBOWS_OUT, jaw(4), HAPPY),
  key(1.41, OPEN_EYES),
], [[0.23, 'emit']]);

export const STATUS_CLIPS = [
  growl, toxic, attract, swagger, foresight, mimic, mudSport, protect, endure, substitute, defenseCurl, rest, refresh, curse, sleepTalk,
  rainDance, hail, doubleTeam,
];
