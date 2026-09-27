// Zigzagoon's situation clips: every battle situation (src/battle3d/situations.ts),
// each its own acting. Restless and curious even when things go wrong: it
// shakes things off like a wet dog, cowers with its ears flat, curls round
// to sleep like a raccoon, and puffs its fur and tail up when it rallies.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ASLEEP, AIR, CURL, DROWSY, FIERCE, FRONT_DOWN, HAPPY, HURT, LANDED, OPEN_EYES, PAWS_FACE, PAWS_HUG, PAWS_UP, SHUT,
  at, bend, body, ears, fall, frontLegs, jaw, key, pelvis, rump, scale, snap, tail, turn, zigzagHome,
} from './kit';

/**
 * Idle: restless even at rest. The rump and the tail sway one way and the
 * other, and halfway it dips its nose for a sniff (the life layer adds the
 * breathing, the weight shifts and the gaze).
 */
const idle: Clip = {
  name: 'idle',
  duration: 3.2,
  loop: true,
  keys: [
    key(0),
    key(0.8, rump(0, 5), tail(2, 9, 0, 5), turn(-1.5)),
    key(1.5, rump(0, 1), tail(-1, 2), bend(1.5, 3, 7), ears(6)),
    key(1.68, rump(0, 0), tail(-1, 0), bend(1.5, 3, 4), ears(5)),
    key(2.4, rump(0, -5), tail(2, -9, 0, -5), turn(1.5)),
    key(3.2),
  ],
};

/**
 * Sent out, or noticed in the grass: low and nosing the ground, it snaps its
 * head up, bristles (tail up, fur on end) and cries with its mouth wide, the
 * head shaking; then it settles into its stance with a wag.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.7,
  keys: [
    key(0, pelvis(-0.035, -0.01), bend(8, 8, 16), rump(6), tail(-12), ears(-14), DROWSY),
    key(0.2, pelvis(-0.045, -0.015), bend(9, 9, 19, 4), rump(7), tail(-14), ears(-16), DROWSY),
    // The cry: head up and forward, jaws wide, ears pricked, tail shooting up.
    snap(0.4, pelvis(0.012, 0.02), bend(-8, -12, -18), rump(-3), tail(20, 0, 8), ears(20), jaw(32), ANGRY, scale(1.03)),
    key(0.58, pelvis(0.01, 0.018), bend(-7, -11, -16, 6, 4), rump(-3, 5), tail(18, 6, 8, 4), ears(18), jaw(27), ANGRY, scale(1.025)),
    key(0.76, pelvis(0.012, 0.02), bend(-8, -12, -17, -6, -4), rump(-3, -5), tail(20, -6, 8, -4), ears(20), jaw(30), ANGRY, scale(1.03)),
    key(0.94, pelvis(0.004, 0.01), bend(-4, -6, -9), tail(10, 0, 4), ears(10), jaw(6), ANGRY, scale(1.01)),
    // Settling in with a wag.
    key(1.14, pelvis(-0.008), rump(0, 7), tail(2, 12, 0, 6), OPEN_EYES),
    key(1.36, rump(0, -4), tail(1, -7, 0, -4)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Taking a hit: it flinches away with its eyes squeezed shut and its ears
 * flat, the head knocked up and aside (the battler adds a sprung recoil; the
 * tail and fur bounce on their springs), then shakes it off.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0.005, -0.03), bend(-8, -10, -16, 0, 6), rump(4), tail(10), ears(-24), HURT),
    key(0.2, pelvis(-0.005, -0.02), bend(-3, -4, -6, 0, 2), rump(2), tail(4), ears(-14), HURT),
    // Back up a little: the recoil spring swings the body forward past its stance.
    key(0.36, pelvis(-0.01, -0.005), bend(0, -1, -4), ears(-4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * A critical or super-effective blow: knocked further back, the head flung
 * up and round, it staggers a step on a hind leg (the right one comes off the
 * ground and down again behind) before it catches itself and shakes its head.
 */
const hitStrong: Clip = {
  name: 'hit_strong',
  duration: 0.95,
  keys: [
    key(0),
    snap(0.04, pelvis(0.012, -0.07), bend(-12, -14, -22, -6, 12), rump(10, 6), tail(18, 8, 8), ears(-34), HURT, scale(0.98)),
    // The stagger: the right hind paw lifts and steps back, the body rolling over it.
    key(0.17, { plantRight: 0.1, bones: { thighR: { x: 20 }, shinR: { x: 20 } } }, pelvis(-0.005, -0.07, -0.02), turn(-6, -8), bend(-6, -8, -12, 6, 8), rump(6, 14), tail(10, 16, 4), ears(-28), HURT),
    key(0.32, { plantRight: 1 }, pelvis(-0.035, -0.045, -0.01), turn(-2, -3), bend(3, 3, 6, -4, -5), rump(-2, 4), tail(2, 6), ears(-20), HURT),
    // Shakes it off.
    key(0.47, pelvis(-0.02, -0.02), bend(1, 0, 3, 8, 9), ears(-12, 8), ANGRY),
    key(0.6, pelvis(-0.012, -0.01), bend(0, 0, 2, -7, -8), ears(-8, 6), ANGRY),
    key(0.74, pelvis(-0.005), bend(0, 0, 1, 3, 3), ears(-3), ANGRY),
    key(0.95, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * its eyes half shut, then its legs fold and it lies down curled round to
 * its left like a sleeping raccoon, the head turned in toward its tail and
 * the tail around it, eyes shut; from the 'shrink' the curled body shrinks
 * away (Battler3D).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0, FRONT_DOWN),
    key(0.2, pelvis(-0.01, -0.01), bend(-4, -2, -8, 0, 6), tail(-4), ears(-8), FRONT_DOWN, DROWSY),
    key(0.46, pelvis(-0.05, -0.035), bend(0, 0, 0, 8, -6), turn(10), rump(-4, -8), tail(-12, -14), ears(-16), FRONT_DOWN, DROWSY),
    key(0.82, pelvis(-0.105, -0.05), bend(-5, -2, -5, 28, -14), CURL, rump(-10, -24), tail(-16, -50, -6, -18), ears(-24, 6), FRONT_DOWN, SHUT),
    key(0.96, pelvis(-0.11, -0.05), bend(-4, -2, -4, 29, -14), CURL, rump(-10, -25), tail(-16, -52, -6, -19), ears(-24, 6), FRONT_DOWN, SHUT),
    key(1.6, pelvis(-0.108, -0.05), bend(-5, -2, -5, 28, -14), CURL, rump(-10, -24), tail(-16, -51, -6, -18), ears(-24, 6), FRONT_DOWN, SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

/**
 * Dodging a move that misses it: a quick crouch, then it springs aside to
 * its left with its body curved into the hop, lands, cocks its head at the
 * foe (missed me!) and hops back into its place.
 */
const dodge: Clip = {
  name: 'dodge',
  duration: 0.88,
  keys: [
    key(0),
    key(0.08, pelvis(-0.035), bend(4, 2, 3), rump(-4), tail(6), ears(-20), ANGRY),
    key(0.2, body(0.3, 0.09), turn(10), rump(0, 16), tail(-6, 20, 0, 8), bend(-2, -2, -4), ears(-24), ANGRY, ...AIR),
    key(0.3, body(0.36), turn(4, 3), rump(0, 6), tail(4, 10), ears(-12), ANGRY, ...LANDED),
    key(0.44, body(0.36), pelvis(-0.012), bend(-2, -3, -6, 0, 12), rump(0, 4), tail(8, 6, 4), ears(8, 4), HAPPY),
    key(0.57, body(0.14, 0.06), turn(-8), rump(0, -10), tail(0, -12), ears(-10), ANGRY, ...AIR),
    key(0.67, body(0), turn(-2), rump(0, -4), tail(2, -4), ANGRY, ...LANDED),
    key(0.88, OPEN_EYES),
  ],
};

/**
 * A move that does nothing to it (or it protected itself): it doesn't even
 * flinch. Chin up and eyes half shut, it shakes its head (no), flicks its
 * tail and goes back to what it was doing: unimpressed.
 */
const unaffected: Clip = {
  name: 'unaffected',
  duration: 1.05,
  keys: [
    key(0),
    key(0.14, pelvis(0.008), bend(-4, -6, -10), ears(8), DROWSY, scale(1.015)),
    key(0.3, pelvis(0.008), bend(-4, -6, -10, 9), ears(8, 4), DROWSY, scale(1.015)),
    key(0.44, pelvis(0.006), bend(-4, -6, -9, -8), ears(8, -4), DROWSY, scale(1.01)),
    key(0.58, pelvis(0.004), bend(-3, -4, -8, 3), rump(2, 6), tail(14, 12, 6, 6), ears(6), DROWSY),
    key(0.76, bend(-1, -2, -3), rump(1, -3), tail(4, -6, 2, -4), ears(3), DROWSY),
    key(1.05, OPEN_EYES),
  ],
};

/**
 * Home after a run of hits at the foe: from its guard in front of the foe
 * (crouched, ears back) it pushes off and scampers back in two zigzag
 * bounds, lands and settles into its stance.
 */
const GUARD_AT_FOE: Pose[] = [at(1), pelvis(-0.03, 0.01), bend(2, 2, 4), rump(4), tail(6), ears(-18), ANGRY, FRONT_DOWN];
const returnHome: Clip = {
  name: 'return_home',
  duration: 0.78,
  keys: [
    key(0, ...GUARD_AT_FOE),
    key(0.08, ...GUARD_AT_FOE, pelvis(-0.02, -0.02), rump(6)),
    ...zigzagHome(0.08, 0.5, [ANGRY]),
    key(0.5, at(0), ...LANDED, bend(2, 1, 2), ANGRY),
    key(0.78, OPEN_EYES),
  ],
};

/**
 * Falling asleep: it grows drowsy, its head nods down, jerks up as it
 * catches itself, then sinks again with a slow breath.
 */
const statusSleep: Clip = {
  name: 'status_sleep',
  duration: 1.6,
  keys: [
    key(0),
    key(0.25, pelvis(-0.01), bend(2, 4, 8), ears(-6), DROWSY),
    key(0.55, pelvis(-0.03), bend(4, 8, 18, 0, 6), rump(-2), tail(-6), ears(-14), SHUT),
    snap(0.72, pelvis(-0.01), bend(0, 0, 2, 0, -2), rump(0), tail(2), ears(-2), DROWSY),
    key(1.02, pelvis(-0.035), bend(5, 9, 20, 0, -6), rump(-3), tail(-8), ears(-16), SHUT, scale(1.015)),
    key(1.3, pelvis(-0.03), bend(5, 9, 19, 0, -5), rump(-3), tail(-7), ears(-15), SHUT, scale(1)),
    key(1.6, SHUT),
  ],
};

/** A shudder alternating from side to side: spine roll, pelvis sway. */
const shudder = (k: number): Pose[] => [turn(0, 4 * k), pelvis(0, 0, 0.012 * k), tail(0, 6 * k)];

/** Poisoned: it hunches up sick, shudders all over, droops queasily and recovers. */
const statusPoison: Clip = {
  name: 'status_poison',
  duration: 1.25,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03, -0.02), bend(8, 6, 14), rump(6), tail(-10), ears(-24), HURT, scale(0.98)),
    key(0.22, pelvis(-0.032, -0.02), bend(8, 6, 15), rump(6), tail(-10), ears(-24), HURT, scale(0.98), ...shudder(1)),
    key(0.29, pelvis(-0.032, -0.02), bend(8, 6, 14), rump(6), tail(-10), ears(-25), HURT, scale(0.98), ...shudder(-1)),
    key(0.36, pelvis(-0.033, -0.02), bend(8, 6, 15), rump(6), tail(-10), ears(-24), HURT, scale(0.98), ...shudder(1)),
    key(0.43, pelvis(-0.032, -0.02), bend(8, 6, 14), rump(6), tail(-10), ears(-25), HURT, scale(0.98), ...shudder(-1)),
    key(0.5, pelvis(-0.031, -0.02), bend(8, 6, 15), rump(6), tail(-10), ears(-24), HURT, scale(0.98), ...shudder(0.6)),
    key(0.72, pelvis(-0.035, -0.02), bend(7, 7, 18, 0, 7), rump(3), tail(-12), ears(-20), DROWSY, scale(0.985)),
    key(0.95, pelvis(-0.015), bend(2, 2, 5), rump(1), tail(-4), ears(-8), DROWSY),
    key(1.25, OPEN_EYES),
  ],
};

/** A wet-dog shake: the front half and the rump twisting opposite ways, the tail whipping. */
const wetShake = (k: number, head = 8): Pose[] => [turn(9 * k, 4 * k), rump(0, -14 * k), tail(4, 26 * k, 0, 10 * k), bend(0, 0, 2, head * k, 6 * k), ears(-14, 10)];

/** Burned: the rump jumps up off the sting with a yelp, then it shakes the burn off like a wet dog. */
const statusBurn: Clip = {
  name: 'status_burn',
  duration: 1.2,
  keys: [
    key(0),
    snap(0.06, body(0, 0.04), { plantFeet: 0, bones: { thighL: { x: 14 }, thighR: { x: 14 } } }, pelvis(0.02, 0.02), rump(14), bend(-6, -8, -12), tail(20, 0, 10), ears(-30), jaw(24), HURT),
    key(0.2, pelvis(-0.03), rump(-2), bend(2, 2, 4), tail(8), ears(-22), jaw(4), HURT),
    key(0.32, pelvis(-0.025), ...wetShake(1), SHUT),
    key(0.42, pelvis(-0.025), ...wetShake(-1), SHUT),
    key(0.52, pelvis(-0.025), ...wetShake(1), SHUT),
    key(0.62, pelvis(-0.02), ...wetShake(-0.7), SHUT),
    key(0.74, pelvis(-0.015), ...wetShake(0.3), ANGRY),
    key(0.92, pelvis(-0.008), bend(0, 0, 1), ears(-4), ANGRY, scale(1.015)),
    key(1.2, OPEN_EYES),
  ],
};

/** Legs locked straight under it (paralysis): the front paws braced stiff. */
const STIFF: Pose[] = [frontLegs([0.08, -0.98, 0.18], [0.04, -0.99, 0.12])];

/** Paralysed: it seizes up stiff (legs locked, tail rigid, fur on end) and twitches, then slumps. */
const statusParalysis: Clip = {
  name: 'status_paralysis',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.05, pelvis(0.015), bend(-6, -8, -12), rump(6), tail(22, 0, 10), ears(16, 10), FIERCE, scale(1.02), ...STIFF),
    key(0.2, pelvis(0.014), bend(-6, -8, -13), rump(6), tail(22, 0, 10), ears(16, 10), FIERCE, scale(1.02), ...STIFF),
    snap(0.28, pelvis(0.012, 0, 0.01), bend(-4, -6, -8, 7, 4), rump(4, 8), tail(18, 8, 10), ears(12, 12), HURT, scale(1.02), ...STIFF),
    snap(0.36, pelvis(0.015), bend(-6, -8, -12, -3), rump(6, -2), tail(22, -2, 10), ears(16, 10), FIERCE, scale(1.02), ...STIFF),
    snap(0.52, pelvis(0.012, 0, -0.01), bend(-5, -7, -9, -7, -5), rump(5, -9), tail(19, -9, 10), ears(13, 12), HURT, scale(1.02), ...STIFF),
    snap(0.6, pelvis(0.014), bend(-6, -8, -12, 2), rump(6, 1), tail(21, 1, 10), ears(15, 10), FIERCE, scale(1.02), ...STIFF),
    key(0.84, pelvis(-0.03), bend(4, 4, 8), rump(-2), tail(-4), ears(-10), DROWSY, FRONT_DOWN),
    key(1.04, pelvis(-0.012), bend(1, 1, 2), ears(-4), DROWSY, FRONT_DOWN),
    key(1.3, OPEN_EYES),
  ],
};

/** Frozen: locked in a hunch in the ice, it strains twice to break free (barely moving), then thaws toward its stance. */
const statusFreeze: Clip = {
  name: 'status_freeze',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.08, pelvis(-0.02), bend(4, 4, 8), rump(2), tail(4), ears(-12), SHUT, scale(0.99)),
    key(0.28, pelvis(-0.014), bend(2, 2, 5, 2), rump(3), tail(5), ears(-10), FIERCE, scale(0.99)),
    key(0.42, pelvis(-0.021), bend(4, 4, 8, -1), rump(2), tail(4), ears(-12), SHUT, scale(0.99)),
    key(0.6, pelvis(-0.012), bend(1, 1, 3, -3, 2), rump(4), tail(6), ears(-9), FIERCE, scale(0.99)),
    key(0.74, pelvis(-0.02), bend(4, 4, 8, 1), rump(2), tail(4), ears(-12), SHUT, scale(0.99)),
    key(1.0, pelvis(-0.01), bend(2, 2, 4), rump(1), tail(2), ears(-6), DROWSY),
    key(1.3, OPEN_EYES),
  ],
};

/** Confused: its head swims round in circles, the body wobbling off balance; a stumble, then it shakes its head clear. */
const statusConfusion: Clip = {
  name: 'status_confusion',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, 0, 0.02), turn(4, 6), bend(0, 2, 4, 10, 8), rump(0, -6), tail(0, -8), DROWSY),
    key(0.34, pelvis(-0.01, 0, -0.005), turn(0, 0), bend(0, 2, 9, 0, -10), rump(0, 2), tail(0, 2), SHUT),
    key(0.52, pelvis(-0.005, 0, -0.022), turn(-6, -5), bend(0, 2, 4, -10, -6), rump(0, 8), tail(0, 10), DROWSY),
    key(0.72, pelvis(-0.02, 0.012, 0.018), turn(3, 7), bend(4, 4, 7, 6, 10), rump(0, -4), tail(-4, -6), HURT),
    key(0.9, pelvis(-0.01, 0, 0.01), turn(4, 4), bend(0, 2, 2, 8, 6), rump(0, -4), tail(0, -6), DROWSY),
    key(1.06, pelvis(-0.005), bend(0, 0, 0, -7, -6), ANGRY),
    key(1.18, bend(0, 0, 0, 5, 4), ANGRY),
    key(1.5, OPEN_EYES),
  ],
};

/** Infatuated: lovestruck, it sways dreamily with its head tilted and happy eyes, tail wagging slowly, and sighs. */
const statusInfatuation: Clip = {
  name: 'status_infatuation',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, bend(-2, -4, -6, 0, 14), ears(10, 6), tail(8, 10), HAPPY),
    key(0.46, pelvis(0, 0, 0.015), turn(4, 4), bend(-2, -4, -6, 4, 16), rump(0, 8), tail(10, 22, 0, 10), ears(10, 6), HAPPY),
    key(0.74, pelvis(0, 0, -0.015), turn(-4, -4), bend(-2, -4, -6, -4, 12), rump(0, -6), tail(10, -10, 0, -6), ears(10, 6), HAPPY),
    key(1.0, pelvis(0.006), bend(-4, -6, -8, 0, 10), tail(12, 6, 4), ears(8, 4), DROWSY, scale(1.02)),
    key(1.24, pelvis(0.002), bend(-1, -2, -3, 0, 4), tail(4, 2), ears(3), HAPPY, scale(1)),
    key(1.5, OPEN_EYES),
  ],
};

/** A tremor while hunched: small alternating rolls and a bobbing drop. */
const tremble = (k: number): Pose[] => [turn(0, 2.5 * k), pelvis(-0.004 * Math.abs(k), 0, 0.006 * k)];

/** Cursed: it hunches low in pain under the curse, trembling, head bowed, then eases up. */
const statusCurse: Clip = {
  name: 'status_curse',
  duration: 1.4,
  keys: [
    key(0),
    key(0.16, pelvis(-0.045, -0.02), bend(8, 8, 18), rump(-6), tail(-14), ears(-28), HURT, scale(0.97)),
    key(0.3, pelvis(-0.045, -0.02), bend(8, 8, 18), rump(-6), tail(-14), ears(-28), HURT, scale(0.97), ...tremble(1)),
    key(0.42, pelvis(-0.045, -0.02), bend(9, 8, 19), rump(-6), tail(-15), ears(-28), SHUT, scale(0.97), ...tremble(-1)),
    key(0.54, pelvis(-0.045, -0.02), bend(8, 8, 18), rump(-6), tail(-14), ears(-28), HURT, scale(0.97), ...tremble(1)),
    key(0.66, pelvis(-0.045, -0.02), bend(9, 8, 19), rump(-6), tail(-15), ears(-28), SHUT, scale(0.97), ...tremble(-1)),
    key(0.8, pelvis(-0.044, -0.02), bend(8, 8, 18, 0, 3), rump(-6), tail(-14), ears(-28), HURT, scale(0.97), ...tremble(0.5)),
    key(1.08, pelvis(-0.015), bend(3, 3, 6), rump(-2), tail(-5), ears(-10), DROWSY),
    key(1.4, OPEN_EYES),
  ],
};

/** Having a nightmare: asleep, it writhes, twisting one way and the other and tossing its head. */
const statusNightmare: Clip = {
  name: 'status_nightmare',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(-0.04), bend(4, 6, 14), rump(-2), tail(-8), ears(-18), SHUT),
    key(0.36, pelvis(-0.04, 0, 0.01), turn(10, 6), rump(0, -14), bend(2, 4, 10, 12, 8), tail(-4, -18), ears(-24), HURT),
    key(0.56, pelvis(-0.04, 0, -0.01), turn(-10, -6), rump(0, 14), bend(2, 4, 10, -12, -8), tail(-4, 18), ears(-24), HURT),
    key(0.74, pelvis(-0.042), turn(3), bend(0, 2, 5, 14, 4), rump(0, -4), tail(-6, -6), ears(-20), SHUT),
    key(0.9, pelvis(-0.042), turn(-2), bend(0, 2, 7, -12, -4), rump(0, 3), tail(-6, 6), ears(-22), HURT),
    key(1.16, pelvis(-0.02), bend(2, 3, 6), rump(-1), tail(-3), ears(-8), DROWSY),
    key(1.5, SHUT),
  ],
};

/** Wrapped or trapped: squeezed small, it strains up against the coils, wriggles and is squeezed again. */
const statusWrapped: Clip = {
  name: 'status_wrapped',
  duration: 1.4,
  keys: [
    key(0),
    snap(0.1, scale(0.96), pelvis(-0.02), bend(0, -4, -8), rump(-4), tail(6, 0, 4), ears(-24), HURT),
    key(0.3, scale(0.97), pelvis(0.006), bend(-6, -10, -16), rump(2), tail(10, 0, 6), ears(-16), jaw(14), FIERCE),
    key(0.5, scale(0.955), pelvis(-0.02), bend(2, -2, -4), rump(-4), tail(4, 0, 2), ears(-26), jaw(2), HURT),
    key(0.7, scale(0.965), pelvis(-0.012, 0, 0.012), turn(8, 4), rump(0, -12), tail(6, -14), ears(-20), jaw(8), FIERCE),
    key(0.9, scale(0.965), pelvis(-0.012, 0, -0.012), turn(-8, -4), rump(0, 12), tail(6, 14), ears(-20), jaw(8), FIERCE),
    key(1.12, scale(0.99), pelvis(-0.005), bend(1, 1, 2), ears(-6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
};

/**
 * Asleep (a loop while it sleeps): curled round to its left like a sleeping
 * raccoon, eyes shut, breathing slow and deep; an ear twitches in a dream.
 */
const idleAsleep: Clip = {
  name: 'idle_asleep',
  duration: 3.4,
  loop: true,
  keys: [
    key(0, ...ASLEEP),
    key(1.5, ...ASLEEP, scale(1.02), pelvis(0.004), tail(0, 4, 0, 2)),
    key(2.2, ...ASLEEP, scale(1.012), pelvis(0.002), ears(6, 4), tail(0, 2)),
    key(2.4, ...ASLEEP, scale(1.008), ears(-2)),
    key(3.4, ...ASLEEP),
  ],
};

/**
 * Worn down (a loop at a quarter of its HP or less): heavy, quick panting
 * with its mouth open, head and ears drooping, tail low, still facing the foe.
 */
const TIRED: Pose[] = [pelvis(-0.03), bend(4, 6, 10), rump(-4), tail(-10), ears(-18), DROWSY];
const idleTired: Clip = {
  name: 'idle_tired',
  duration: 1.6,
  loop: true,
  keys: [
    key(0, ...TIRED, jaw(14)),
    key(0.2, ...TIRED, pelvis(0.006), bend(-1, -1, -2), jaw(20), scale(1.012)),
    key(0.4, ...TIRED, pelvis(-0.004), bend(1, 1, 2), jaw(12), scale(0.996)),
    key(0.6, ...TIRED, pelvis(0.006), bend(-1, -1, -2, 2), jaw(20), scale(1.012)),
    key(0.8, ...TIRED, pelvis(-0.004), bend(1, 1, 3, 2), jaw(12), scale(0.996)),
    key(1.0, ...TIRED, pelvis(0.006), bend(-1, -1, -1, -2), jaw(20), scale(1.012)),
    key(1.2, ...TIRED, pelvis(-0.004), bend(1, 1, 2, -1), jaw(12), scale(0.996)),
    key(1.4, ...TIRED, pelvis(0.004), bend(0, 0, -1), jaw(18), scale(1.008)),
    key(1.6, ...TIRED, jaw(14)),
  ],
};

/** A stat rises: it gathers, then draws itself up tall with its fur bristling and its tail straight up, fierce. */
const statUp: Clip = {
  name: 'stat_up',
  duration: 1.25,
  keys: [
    key(0),
    key(0.16, pelvis(-0.03), bend(4, 4, 8), rump(-2), tail(-4), ears(-10), ANGRY),
    snap(0.34, pelvis(0.02), bend(-10, -10, -14), rump(6), tail(20, 0, 10), ears(18), FIERCE, scale(1.045)),
    key(0.52, pelvis(0.022), bend(-11, -10, -15, 0, 2), rump(6), tail(21, 2, 10), ears(18), FIERCE, scale(1.04)),
    key(0.74, pelvis(0.02), bend(-10, -9, -13, 0, -2), rump(6), tail(20, -2, 10), ears(17), FIERCE, scale(1.04)),
    key(0.96, pelvis(0.006), bend(-3, -3, -4), rump(2), tail(6, 0, 3), ears(6), ANGRY, scale(1.01)),
    key(1.25, OPEN_EYES),
  ],
};

/** A stat falls: it flinches back and shrinks down onto its haunches, ears flat, looking up worried, wobbling unsteadily. */
const statDown: Clip = {
  name: 'stat_down',
  duration: 1.25,
  keys: [
    key(0),
    key(0.12, pelvis(-0.02, -0.05), bend(-4, -4, -6), rump(-4), ears(-24), tail(-10), HURT, scale(0.98)),
    key(0.36, pelvis(-0.05, -0.07), bend(-6, -6, -8, 6), rump(-12), tail(-18), ears(-30), DROWSY, scale(0.955)),
    key(0.6, pelvis(-0.05, -0.07, 0.018), turn(5, 6), bend(-6, -6, -8, -6, 8), rump(-12, -8), tail(-18, -8), ears(-30), DROWSY, scale(0.955)),
    key(0.8, pelvis(-0.045, -0.065, -0.012), turn(-4, -4), bend(-5, -5, -7, 4, -5), rump(-11, 5), tail(-16, 5), ears(-28), HURT, scale(0.96)),
    key(1.0, pelvis(-0.015, -0.02), bend(-1, -1, -2), rump(-3), tail(-5), ears(-8), DROWSY, scale(0.99)),
    key(1.25, OPEN_EYES),
  ],
};

/** Grown a level: a happy hop straight up, then a proud strut of the rump and a big swish of the tail, chin up. */
const levelUp: Clip = {
  name: 'level_up',
  duration: 1.5,
  keys: [
    key(0),
    key(0.15, pelvis(-0.035), bend(4, 2, 4), rump(-4), ears(-10), HAPPY),
    key(0.32, body(0, 0.1), bend(-8, -8, -12), tail(18, 0, 8), ears(20), jaw(20), HAPPY, ...AIR),
    key(0.46, bend(2, 0, 2), ears(8), jaw(8), HAPPY, ...LANDED),
    key(0.64, pelvis(0.006), bend(-6, -8, -12, 0, 6), rump(8, 16), tail(14, 30, 6, 14), ears(14), jaw(12), HAPPY),
    key(0.86, pelvis(0.006), bend(-6, -8, -12, 0, -5), rump(8, -14), tail(14, -26, 6, -12), ears(14), jaw(12), HAPPY),
    key(1.06, pelvis(0.004), bend(-4, -6, -9), rump(3, 2), tail(8, 4, 4), ears(8), jaw(4), HAPPY),
    key(1.5, OPEN_EYES),
  ],
};

/** Sapped by Leech Seed: a jolt as the seed drinks, then it sags, drained, before it rallies. */
const drained: Clip = {
  name: 'drained',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.08, pelvis(0.005), bend(-4, -6, -8), ears(-20), tail(6), HURT),
    key(0.4, pelvis(-0.05), bend(8, 8, 16), rump(-6), tail(-16), ears(-26), DROWSY, scale(0.97)),
    key(0.7, pelvis(-0.055), bend(9, 9, 18, 0, 4), rump(-7), tail(-17), ears(-27), SHUT, scale(0.965)),
    key(1.0, pelvis(-0.015), bend(2, 2, 4), rump(-1), tail(-4), ears(-8), DROWSY, scale(0.99)),
    key(1.3, OPEN_EYES),
  ],
};

/** Healed: eyes closed, it breathes in deep and stretches contentedly, then wriggles its rump, refreshed. */
const healed: Clip = {
  name: 'healed',
  duration: 1.4,
  keys: [
    key(0),
    key(0.22, pelvis(0.01), bend(-4, -6, -10), ears(6), SHUT, scale(1.02)),
    key(0.5, pelvis(0.004, 0.01), bend(-6, -8, -12, 0, 6), tail(14, 10, 6, 6), ears(10), HAPPY),
    key(0.74, pelvis(0.002), bend(-3, -4, -6), rump(4, 10), tail(10, 18, 4, 8), ears(8), HAPPY),
    key(0.94, pelvis(0.002), bend(-3, -4, -6), rump(4, -8), tail(10, -14, 4, -6), ears(8), HAPPY),
    key(1.12, bend(-1, -1, -2), rump(1), tail(3), ears(3), HAPPY),
    key(1.4, OPEN_EYES),
  ],
};

/** Focusing (Focus Punch's setup): it crouches, narrows its eyes on the foe and goes still, the rump wiggling like a cat's before a pounce. */
const focus: Clip = {
  name: 'focus',
  duration: 1.3,
  keys: [
    key(0),
    key(0.16, pelvis(-0.04), bend(6, 4, 4), rump(8), tail(-6), ears(-20), FIERCE),
    key(0.42, pelvis(-0.046), bend(6, 4, 5), rump(9), tail(-7), ears(-22), FIERCE),
    key(0.62, pelvis(-0.046), bend(6, 4, 5), rump(10, 7), tail(-5, 9), ears(-22), FIERCE),
    key(0.8, pelvis(-0.046), bend(6, 4, 5), rump(10, -7), tail(-5, -9), ears(-22), FIERCE),
    key(1.0, pelvis(-0.03), bend(4, 3, 3), rump(6), tail(-4), ears(-16), FIERCE),
    key(1.3, OPEN_EYES),
  ],
};

/** Hanging on at 1 HP: it buckles, a front leg giving way, then pushes itself back up, planted and determined. */
const hangOn: Clip = {
  name: 'hang_on',
  duration: 1.25,
  keys: [
    key(0),
    snap(0.06, pelvis(-0.06, -0.02), bend(10, 8, 18), rump(-8), tail(-12), ears(-30), HURT),
    key(0.26, pelvis(-0.07, 0, 0.02), turn(4, 8), bend(12, 10, 20, 0, 8), rump(-8), tail(-14), ears(-30), SHUT),
    key(0.5, pelvis(-0.02), bend(0, -2, -4), rump(2), tail(4), ears(-12), FIERCE),
    key(0.72, pelvis(-0.022), bend(-2, -4, -6), rump(3), tail(6), ears(-14), FIERCE, jaw(10)),
    key(0.96, pelvis(-0.01), bend(-1, -1, -2), ears(-6), ANGRY),
    key(1.25, OPEN_EYES),
  ],
};

/** Flinched: startled (ears pricked, fur and tail bristling), it cowers back and falters, unable to act. */
const flinch: Clip = {
  name: 'flinch',
  duration: 0.95,
  keys: [
    key(0),
    snap(0.04, pelvis(0.01, -0.04), bend(-8, -10, -14), ears(20, 8), tail(18, 0, 8), SHUT, scale(1.02)),
    key(0.2, pelvis(-0.03, -0.05), bend(4, 4, 12), rump(-4), ears(-26), tail(-10), HURT, scale(0.98)),
    key(0.44, pelvis(-0.03, -0.045), turn(-4, -4), bend(4, 4, 10, 6), rump(-4, 4), ears(-22), tail(-8, 4), DROWSY),
    key(0.66, pelvis(-0.01, -0.015), bend(1, 1, 3), ears(-8), DROWSY),
    key(0.95, OPEN_EYES),
  ],
};

/** Recharging after a huge move: spent, it sags and pants hard, then lifts its head. */
const recharge: Clip = {
  name: 'recharge',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(-0.05), bend(6, 8, 14), rump(-6), tail(-14), ears(-22), jaw(16), DROWSY),
    key(0.4, pelvis(-0.045), bend(5, 7, 12), rump(-6), tail(-13), ears(-22), jaw(24), DROWSY, scale(1.015)),
    key(0.6, pelvis(-0.052), bend(6, 8, 15), rump(-6), tail(-14), ears(-22), jaw(12), SHUT, scale(0.995)),
    key(0.8, pelvis(-0.045), bend(5, 7, 12), rump(-6), tail(-13), ears(-22), jaw(24), DROWSY, scale(1.015)),
    key(1.0, pelvis(-0.05), bend(6, 8, 14), rump(-6), tail(-14), ears(-22), jaw(12), DROWSY, scale(0.995)),
    key(1.2, pelvis(-0.02), bend(1, 1, 2), rump(-2), tail(-4), ears(-8), jaw(4), DROWSY),
    key(1.4, OPEN_EYES),
  ],
};

/** Waking up: from its curled sleep an ear twitches, it startles awake, shakes the sleep out of its head and is back on guard. */
const wake: Clip = {
  name: 'wake',
  duration: 1.3,
  keys: [
    key(0, ...ASLEEP),
    key(0.18, ...ASLEEP, ears(8, 6), scale(1.01)),
    snap(0.32, pelvis(0.01), bend(-8, -10, -14), rump(2), tail(16, 0, 8), ears(20), FIERCE, FRONT_DOWN),
    key(0.5, pelvis(-0.005), bend(0, 0, 2, 10, 10), ears(-12, 10), DROWSY),
    key(0.62, pelvis(-0.005), bend(0, 0, 2, -10, -10), ears(-12, 10), SHUT),
    key(0.74, pelvis(-0.003), bend(0, 0, 1, 6, 6), ears(-6, 6), DROWSY),
    key(0.92, pelvis(-0.02), bend(2, 2, 2), ears(-10), ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

/** Shaking a status off (thawed, cleared its head, broke a bind): a quick all-over wet-dog shake, fur fluffed, back on guard. */
const shakeOff: Clip = {
  name: 'shake_off',
  duration: 1.15,
  keys: [
    key(0),
    key(0.1, pelvis(-0.03), bend(4, 4, 8), ears(-10), SHUT),
    key(0.2, pelvis(-0.02), ...wetShake(1, 10), SHUT),
    key(0.3, pelvis(-0.02), ...wetShake(-1, 10), SHUT),
    key(0.4, pelvis(-0.02), ...wetShake(1, 10), SHUT),
    key(0.5, pelvis(-0.02), ...wetShake(-1, 10), SHUT),
    key(0.6, pelvis(-0.015), ...wetShake(0.4, 6), SHUT),
    key(0.78, pelvis(0.004), bend(-2, -2, -4), ears(6), ANGRY, scale(1.025)),
    key(1.15, OPEN_EYES),
  ],
};

/** Breaking out of a Poké Ball: it bursts up out of a tight curl with a snarl, shakes itself off and glares, angry. */
const breakFree: Clip = {
  name: 'break_free',
  duration: 1.35,
  keys: [
    key(0, pelvis(-0.05), bend(8, 8, 16), rump(-8), tail(-12), ears(-24), SHUT, scale(0.92)),
    snap(0.15, pelvis(0.02), bend(-10, -10, -16), rump(6), tail(22, 0, 10), ears(18), ANGRY, scale(1.04), jaw(24)),
    key(0.34, pelvis(0.005), turn(12, 6), rump(0, -16), tail(8, 24), bend(-4, -4, -6, 12), ears(-8, 8), ANGRY, jaw(6)),
    key(0.46, pelvis(0.005), turn(-12, -6), rump(0, 16), tail(8, -24), bend(-4, -4, -6, -12), ears(-8, 8), ANGRY, jaw(6)),
    key(0.58, pelvis(0.002), turn(6, 3), rump(0, -8), tail(6, 12), bend(-2, -2, -3, 6), ANGRY),
    key(0.78, pelvis(-0.025, 0.02), bend(2, 0, -2), rump(4), tail(10), ears(-24), jaw(14), FIERCE),
    key(1.0, pelvis(-0.027, 0.02), bend(2, 0, -3, 2), rump(4), tail(10), ears(-24), jaw(10), FIERCE),
    key(1.35, OPEN_EYES),
  ],
};

/** The rain keeps falling: ears flattened under it, it shakes the water off from its head, down its body, to the tip of its tail. */
const weatherRain: Clip = {
  name: 'weather_rain',
  duration: 1.3,
  keys: [
    key(0),
    key(0.14, pelvis(-0.02), bend(4, 4, 10), ears(-24), SHUT),
    key(0.28, pelvis(-0.02), bend(2, 2, 6, 14, 10), ears(-20, 10), SHUT),
    key(0.38, pelvis(-0.02), bend(2, 2, 6, -14, -10), ears(-20, 10), SHUT),
    key(0.5, pelvis(-0.018), turn(10, 5), rump(0, -12), bend(2, 2, 4, 4), ears(-16), SHUT),
    key(0.6, pelvis(-0.018), turn(-10, -5), rump(0, 12), bend(2, 2, 4, -4), ears(-16), SHUT),
    key(0.7, pelvis(-0.012), turn(2), rump(0, -4), tail(4, 26, 0, 12), ears(-10), DROWSY),
    key(0.8, pelvis(-0.012), turn(-2), rump(0, 4), tail(4, -26, 0, -12), ears(-10), DROWSY),
    key(0.98, pelvis(0.002), bend(-1, -1, -2), tail(4, 4), ears(2), ANGRY, scale(1.02)),
    key(1.3, OPEN_EYES),
  ],
};

/** A paw raised to shade its eyes: the right paw up at its brow, the left braced straight down. */
const SHADE = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.2, 0.05, 0.98], [0.25, 0.72, 0.64]);

/** The sunlight is strong: it squints and ducks its head, raises a paw to shade its eyes, and blinks up at the sky. */
const weatherSun: Clip = {
  name: 'weather_sun',
  duration: 1.35,
  keys: [
    key(0),
    key(0.16, pelvis(-0.005), bend(2, 4, 12, -8), ears(-8), DROWSY),
    key(0.4, pelvis(0.006, -0.02), bend(-8, 0, 8, -6), rump(-6), ears(-4), DROWSY, SHADE),
    key(0.62, pelvis(0.006, -0.02), bend(-9, -2, 4, -4), rump(-6), ears(-2), SHUT, SHADE),
    key(0.82, pelvis(0.006, -0.02), bend(-9, -4, 2, -2), rump(-6), ears(0), DROWSY, SHADE),
    key(1.04, pelvis(-0.004), bend(1, 1, 3), ears(-2), DROWSY, FRONT_DOWN),
    key(1.35, OPEN_EYES),
  ],
};

/** The sandstorm rages: it braces low, tucks its head and turns its face out of the wind, eyes screwed shut as the sand buffets it. */
const weatherSand: Clip = {
  name: 'weather_sand',
  duration: 1.3,
  keys: [
    key(0),
    key(0.12, pelvis(-0.04), bend(6, 6, 16), ears(-28), tail(-10, 0, -4), SHUT),
    key(0.3, pelvis(-0.045), bend(8, 8, 20, 14), rump(-4, 6), ears(-30), tail(-12, 6, -4), SHUT, PAWS_FACE),
    key(0.54, pelvis(-0.048, -0.01, 0.01), bend(8, 8, 21, 12, 4), rump(-4, 8), ears(-30), tail(-12, 10, -4), SHUT, PAWS_FACE),
    key(0.78, pelvis(-0.045, 0, -0.005), bend(8, 8, 20, 15, -3), rump(-4, 4), ears(-30), tail(-12, 2, -4), SHUT, PAWS_FACE),
    key(1.02, pelvis(-0.015), bend(2, 2, 5, 4), rump(-1), ears(-10), tail(-3), DROWSY, FRONT_DOWN),
    key(1.3, OPEN_EYES),
  ],
};

/** The hail keeps falling: it flinches down at each hailstone, hunching lower, then glances up at the sky, annoyed. */
const weatherHail: Clip = {
  name: 'weather_hail',
  duration: 1.3,
  keys: [
    key(0),
    snap(0.1, pelvis(-0.02), bend(6, 6, 14), ears(-26), tail(-8), SHUT),
    key(0.24, pelvis(-0.03), bend(7, 7, 16, 6), ears(-26), tail(-9), DROWSY),
    snap(0.36, pelvis(-0.045), bend(9, 9, 20, -6, 6), rump(-4), ears(-30), tail(-12), HURT),
    key(0.5, pelvis(-0.04), bend(8, 8, 18, -4, 4), rump(-4), ears(-28), tail(-11), DROWSY),
    snap(0.64, pelvis(-0.05), bend(9, 9, 19, 4, -4), rump(-6), ears(-30), tail(-13), SHUT),
    key(0.86, pelvis(-0.02), bend(4, 2, -4), rump(-2), ears(-14), tail(-6), ANGRY),
    key(1.0, pelvis(-0.018), bend(3, 1, -5, 3), rump(-2), ears(-14), tail(-5), ANGRY),
    key(1.3, OPEN_EYES),
  ],
};

export const SITUATION_CLIPS: Clip[] = [
  idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome,
  statusSleep, statusPoison, statusBurn, statusParalysis, statusFreeze, statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped,
  idleAsleep, idleTired, statUp, statDown, levelUp, drained, healed, focus, hangOn,
  flinch, recharge, wake, shakeOff, breakFree, weatherRain, weatherSun, weatherSand, weatherHail,
];

// Kept for the curled poses other files build on.
export { PAWS_HUG, PAWS_UP, fall };
