// Wurmple's situation clips: every battle situation (src/battle3d/situations.ts)
// acted by a caterpillar with no limbs: the front half rears, bows, leans
// and turns its head; the tail end lifts, curls and flicks; the whole body
// hops, squashes and puffs up. See kit.ts for the channels.

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import {
  AIR, COIL, CURL, DROWSY, GLARE, OPEN, REAR_UP, RECOIL, SCRUNCH, SHUT, SLUMP, TOUCH,
  at, clip, crest, curlRight, fall, flightHome, front, key, lean, pelvis, snap, tail,
} from './kit';

/**
 * Idle: an inchworm's restlessness. The front half sways slowly from side to
 * side and bobs up a little as it goes, the head levelled on the foe, while
 * the spiked tail end lifts and settles out of step (breathing, blinks and
 * gaze drift come from the life layer).
 */
const idle = clip('idle', 2.4, [
  key(0),
  key(0.6, front(-3, -3, 1, 3, 0, -3), lean(-3.5), tail(0, 1, 7)),
  key(1.2, front(1.5, 1.5, 0, -1.5), tail(0, 0, 1)),
  key(1.8, front(-3, -3, 1, 3, 0, 3), lean(3.5), tail(0, -1, -4)),
  key(2.4),
], [], true);

/**
 * Sent out (and a wild one's cry): ducked low with its eyes shut, it bursts
 * up to its full height with its head raised and its tail spikes raised,
 * cries with a shake of the head and crest, then drops into its stance with
 * a glare. Upright rather than overhead-reaching: from our side the crest
 * stays under the foe's healthbox.
 */
const intro = clip('intro', 1.6, [
  key(0, front(22, 20, 15, 6), tail(0, -4, -10), SHUT),
  key(0.2, front(26, 24, 18, 9), tail(0, -6, -14), SHUT),
  snap(0.4, REAR_UP, OPEN),
  key(0.56, REAR_UP, front(-1, -1, 0, -2, 8, 7), OPEN),
  key(0.72, REAR_UP, front(0, 0, 0, -1, -8, -7), OPEN),
  key(0.88, REAR_UP, front(4, 4, 3, 10, 3, 2), OPEN),
  key(1.08, front(4, 4, 2, 4), tail(0, 2, 4), GLARE),
  key(1.6, OPEN),
], [{ t: 0.46, name: 'cry' }]);

/**
 * Taking a hit: the front half snaps back and up with its eyes squeezed shut
 * and the tail end flicking up (the battler adds a sprung knock-back), then
 * it bobs forward past the stance and settles.
 */
const hit = clip('hit', 0.62, [
  key(0),
  snap(0.05, RECOIL, SHUT),
  key(0.2, front(-4, -5, -4, -8), tail(0, 3, 8), SHUT),
  key(0.36, front(3, 3, 2, 5), tail(0, -1, -2), GLARE),
  key(0.62, OPEN),
]);

/**
 * A critical or super-effective blow: thrown further, the front half flung
 * back, the body skidding back and tipping, the tail end whipping up; it
 * staggers from side to side and pulls itself back up.
 */
const hitStrong = clip('hit_strong', 0.95, [
  key(0),
  snap(0.04, front(-14, -20, -12, -22), tail(0, 10, 26), { root: { z: -0.06, pitch: -9 } }, SHUT),
  key(0.18, front(-8, -10, -6, -12), tail(0, 6, 14), lean(6), { root: { z: -0.08, pitch: -4 } }, SHUT),
  key(0.34, front(5, 5, 3, 9), lean(-6), tail(0, -2, -4), { root: { z: -0.05, pitch: 3 } }, DROWSY),
  key(0.5, front(-2, -2, -1, -2), lean(3), { root: { z: -0.02 } }, GLARE),
  key(0.7, front(1, 1, 0, 1), lean(-1), GLARE),
  key(0.95, OPEN),
]);

/**
 * Fainting, worn out rather than dying: its head droops and its eyes fall
 * shut as it sways, the front half sags, then it comes down to the ground
 * and curls round to its right to meet its tail, the head turned back into
 * the curl so the crest lies along it, and from the 'shrink' the curled body
 * shrinks away into its middle. It curls round on the ground rather than
 * forward over its feet: a wild Wurmple's feet rest on our healthbox.
 */
const faint = clip('faint', 1.6, [
  key(0),
  key(0.14, front(6, 6, 4, 14, 0, 5), lean(-4), tail(0, -2, -5), DROWSY),
  key(0.3, front(10, 10, 6, 18, 0, -4), lean(3), tail(0, -3, -8), SHUT),
  key(0.5, front(14, 18, 8, 16, 0, -2), lean(1), tail(0, -4, -10), SHUT),
  fall(0.84, front(19, 47, -10, 23), curlRight(-26, -40, -40, -44), tail(0, -8, -16, 11, 11, 11), SHUT),
  key(0.98, front(20, 48, -10, 25), curlRight(-30, -45, -45, -50), tail(0, -8, -17, 12, 12, 12), SHUT),
  key(1.6, front(20, 48, -10, 24), curlRight(-29, -44, -44, -49), tail(0, -8, -17, 12, 12, 12), SHUT),
], [{ t: 1.04, name: 'shrink' }]);

/**
 * Dodge: a move misses it: it springs aside to its left in a quick hop, the
 * body tilting away from the blow, lands squashed, and hops back onto its
 * spot on guard.
 */
const dodge = clip('dodge', 0.85, [
  key(0),
  key(0.08, front(6, 8, 4, -4), pelvis(0, -0.022), lean(-4), { scale: 0.95 }, GLARE),
  snap(0.18, AIR, { root: { x: 0.22, y: 0.1, roll: -10 } }, front(-6, -8, -4, -6), lean(-10), tail(0, 6, 12, -6, -6, -6), OPEN),
  fall(0.3, { root: { x: 0.3, roll: -4 } }, TOUCH, lean(-4), OPEN),
  key(0.44, AIR, { root: { x: 0.13, y: 0.07, roll: 3 } }, front(-3, -4, -2, -4), lean(3), GLARE),
  fall(0.56, TOUCH, GLARE),
  key(0.68, front(-2, -2, -1, -2), GLARE),
  key(0.85, OPEN),
]);

/**
 * Unaffected: the move does nothing to it. It rears up and puffs itself
 * out, turns its face away with a dismissive toss of its head (the crest
 * flicking), gives a smug bob and glares back at the foe.
 */
const unaffected = clip('unaffected', 1.3, [
  key(0),
  key(0.16, REAR_UP, front(-2, -2, 0, -2), { scale: 1.05 }, GLARE),
  key(0.34, REAR_UP, front(-2, -2, 0, -4, 28, 14), lean(-5), crest(-10), { scale: 1.05 }, GLARE),
  key(0.52, REAR_UP, front(-1, -1, 0, -3, 24, 12), lean(-4), crest(6), { scale: 1.045 }, SHUT),
  key(0.7, front(4, 4, 2, 6, 6, 2), tail(0, 4, 10), { scale: 1.02 }, GLARE),
  key(0.86, front(-3, -3, -1, -4), tail(0, 2, 5), GLARE),
  key(1.02, front(1, 1, 0, 1), GLARE),
  key(1.3, OPEN),
]);

/**
 * Home from the foe after a run of hits: it bunches up where it is, springs
 * back home and lands squashed, then settles.
 */
const returnHome = clip('return_home', 0.92, [
  key(0, at(1)),
  key(0.12, at(1), SCRUNCH, GLARE),
  key(0.27, flightHome(0.5, 0.17), GLARE),
  fall(0.4, at(0), TOUCH, GLARE),
  key(0.58, front(-2, -3, -1, -2), OPEN),
  key(0.92, OPEN),
]);

// Status conditions ----------------------------------------------------------------

/** Falling asleep: its eyes grow heavy, the head nods and sinks, a slow breath, and it sinks again. */
const statusSleep = clip('status_sleep', 1.7, [
  key(0),
  key(0.2, front(2, 3, 4, 10, 0, 4), lean(-3), DROWSY),
  key(0.5, front(6, 8, 8, 20, 0, -3), lean(3), SHUT),
  key(0.8, front(4, 5, 6, 14, 0, 2), lean(-1), { scale: 1.01 }, SHUT),
  key(1.1, front(10, 12, 12, 26, 0, -4), lean(2), pelvis(0, -0.01), SHUT),
  key(1.4, front(4, 4, 4, 10), SHUT),
  key(1.7, SHUT),
]);

/** Poisoned: a sickly shudder, hunched and wincing, then a queasy sway. */
const statusPoison = clip('status_poison', 1.4, [
  key(0),
  key(0.14, front(10, 13, 10, 18), pelvis(0, -0.014), tail(0, -2, -4), SHUT),
  key(0.22, front(11, 14, 10, 19, 6), lean(5), { root: { roll: -2 } }, SHUT),
  key(0.3, front(10, 13, 10, 18, -6), lean(-5), { root: { roll: 2 } }, SHUT),
  key(0.38, front(11, 14, 10, 19, 5), lean(5), { root: { roll: -2 } }, SHUT),
  key(0.46, front(10, 13, 10, 18, -3), lean(-3), { root: { roll: 1 } }, SHUT),
  key(0.66, front(7, 9, 7, 14, 0, 10), lean(7), DROWSY),
  key(0.9, front(5, 6, 5, 9, 0, -6), lean(-4), DROWSY),
  key(1.1, front(1, 1, 1, 2), GLARE),
  key(1.4, OPEN),
]);

/** Burned: it jolts up as the burn bites, the tail end flicking high as if singed, then shakes it off hard. */
const statusBurn = clip('status_burn', 1.2, [
  key(0),
  snap(0.05, front(-12, -14, -7, -14), tail(10, 12, 28), pelvis(0, 0.014), { root: { y: 0.04 } }, SHUT),
  key(0.16, front(-7, -9, -4, -9), tail(5, 7, 18), SHUT),
  key(0.3, front(0, 0, 0, 0, 18, 10), lean(10), GLARE),
  key(0.42, front(0, 0, 0, 0, -18, -10), lean(-10), GLARE),
  key(0.54, front(0, 0, 0, 0, 12, 6), lean(6), GLARE),
  key(0.66, front(0, 0, 0, 0, -7, -3), lean(-3), GLARE),
  key(0.85, front(1, 1, 0, 1), GLARE),
  key(1.2, OPEN),
]);

/** Paralysed: it seizes up rigid, then twitches in jerks, the head and tail end jumping. */
const statusParalysis = clip('status_paralysis', 1.4, [
  key(0),
  snap(0.06, front(-8, -10, -5, -8), tail(0, 6, 14), { scale: 1.03 }, DROWSY),
  key(0.2, front(-8, -10, -5, -9, 1.5), lean(1.5), { scale: 1.03 }, DROWSY),
  snap(0.26, front(-3, -14, -2, -14, -12, 12), lean(-8), tail(0, 12, 26), SHUT),
  key(0.36, front(-8, -10, -5, -8, 1), tail(0, 5, 12), DROWSY),
  snap(0.5, front(-12, -6, -8, -2, 12, -12), lean(8), tail(0, 0, 0), SHUT),
  key(0.6, front(-8, -10, -5, -8), tail(0, 4, 10), DROWSY),
  snap(0.76, front(-6, -12, -4, -10, 0, 10), lean(-5), tail(0, 10, 22), SHUT),
  key(0.9, front(-4, -5, -2, -4), GLARE),
  key(1.1, front(0, 0, 0, 1), GLARE),
  key(1.4, OPEN),
]);

/** Frozen: locked stiff in the ice, straining against it in hard little quivers, then easing. */
const statusFreeze = clip('status_freeze', 1.5, [
  key(0),
  key(0.1, front(-5, -7, -3, -5), tail(0, 2, 4), SHUT),
  key(0.3, front(-6, -9, -3, -8), lean(3.5), pelvis(0.004, 0), SHUT),
  key(0.4, front(-6, -9, -3, -8), lean(-3), pelvis(-0.004, 0), SHUT),
  key(0.5, front(-8, -11, -4, -10), lean(4), pelvis(0.005, 0.003), SHUT),
  key(0.6, front(-8, -11, -4, -10), lean(-3.5), pelvis(-0.005, 0), SHUT),
  key(0.72, front(-9, -12, -5, -11), lean(4.5), pelvis(0.005, 0.004), SHUT),
  key(0.84, front(-7, -9, -4, -8), lean(-2), SHUT),
  key(1.0, front(-3, -4, -2, -3), GLARE),
  key(1.2, front(-1, -1, 0, -1), GLARE),
  key(1.5, OPEN),
]);

/** Confused: it wobbles off balance, the front half circling, the head swimming the other way. */
const statusConfusion = clip('status_confusion', 1.6, [
  key(0),
  key(0.2, front(-2, -2, 0, 0, 10, 10), lean(8), DROWSY),
  key(0.4, front(6, 6, 2, 4, 0, -12), lean(1), DROWSY),
  key(0.6, front(-2, -2, 0, 0, -10, -10), lean(-8), DROWSY),
  key(0.8, front(-6, -6, -2, -6, 0, 12), lean(-1), DROWSY),
  key(1.0, front(0, 0, 0, 2, 8, 8), lean(6), DROWSY),
  key(1.2, front(2, 2, 1, 2, -4, -4), lean(-3), DROWSY),
  key(1.4, front(0, 0, 0, 1), GLARE),
  key(1.6, OPEN),
]);

/** Infatuated: lovestruck, it sways dreamily with its head tilted right over, the tail end wagging. */
const statusInfatuation = clip('status_infatuation', 1.6, [
  key(0),
  key(0.2, front(-5, -5, -2, -6, 10, 22), lean(-8), tail(0, 3, 8, 0, 0, 14), DROWSY),
  key(0.5, front(-5, -5, -2, -6, 10, 24), lean(8), tail(0, 3, 8, 0, 0, -14), DROWSY),
  key(0.8, front(-5, -5, -2, -6, 8, 20), lean(-7), tail(0, 3, 8, 0, 0, 12), DROWSY),
  key(1.1, front(-3, -3, -1, -3, 5, 14), lean(4), tail(0, 2, 4, 0, 0, -8), DROWSY),
  key(1.35, front(0, 0, 0, 0, 0, 4), OPEN),
  key(1.6, OPEN),
]);

/** Cursed: it sinks slowly under the curse, hunched low and pressed down, shuddering in pain. */
const statusCurse = clip('status_curse', 1.5, [
  key(0),
  key(0.3, front(16, 20, 12, 20), pelvis(0, -0.028), tail(0, -4, -8), SHUT),
  key(0.52, front(22, 26, 16, 26), pelvis(0, -0.036), lean(2), tail(0, -6, -10), SHUT),
  key(0.62, front(22, 26, 16, 26), pelvis(0, -0.036), lean(-2), tail(0, -6, -10), SHUT),
  key(0.72, front(22, 26, 16, 27), pelvis(0, -0.036), lean(2), tail(0, -6, -10), SHUT),
  key(0.92, front(14, 18, 10, 18), pelvis(0, -0.022), DROWSY),
  key(1.18, front(4, 5, 4, 6), DROWSY),
  key(1.5, OPEN),
]);

/** Nightmare: asleep, it writhes, twisting one way and the other with the tail end thrashing. */
const statusNightmare = clip('status_nightmare', 1.6, [
  key(0, SHUT),
  key(0.15, curlRight(-10, -10, -8, -10), lean(6), tail(0, 4, 8, 8, 8, 8), SHUT),
  key(0.35, curlRight(8, 8, 6, 10), front(4, 4, 2, 6), lean(-6), tail(0, -2, -4, -8, -8, -8), SHUT),
  key(0.55, curlRight(-12, -12, -8, -12), front(-4, -6, -2, -8), lean(8), tail(0, 8, 16, 6, 6, 6), SHUT),
  key(0.75, curlRight(6, 6, 4, 8), front(6, 6, 4, 10), lean(-5), tail(0, 0, 0, -6, -6, -6), SHUT),
  key(0.95, curlRight(-6, -6, -4, -6), lean(3), SHUT),
  key(1.2, front(2, 2, 1, 4), SHUT),
  key(1.6, SHUT),
]);

/** Wrapped: squeezed tight in a bind, it strains and wriggles one way and the other against it. */
const statusWrapped = clip('status_wrapped', 1.5, [
  key(0),
  key(0.1, front(-6, -8, -4, -4), tail(0, 12, 24, 12, 12, 12), { scale: 0.95 }, SHUT),
  key(0.3, front(-9, -11, -5, -9, 10), lean(13), tail(0, 12, 24, 12, 12, 12), { scale: 0.95, root: { roll: -4 } }, SHUT),
  key(0.5, front(-9, -11, -5, -9, -10), lean(-13), tail(0, 12, 24, 12, 12, 12), { scale: 0.95, root: { roll: 4 } }, SHUT),
  key(0.7, front(-8, -10, -4, -8, 8), lean(10), tail(0, 14, 28, 14, 14, 14), { scale: 0.95, root: { roll: -3 } }, SHUT),
  key(0.9, front(-6, -8, -4, -6, -5), lean(-6), tail(0, 10, 20, 10, 10, 10), { scale: 0.97 }, SHUT),
  key(1.1, front(-2, -3, -1, -2), GLARE),
  key(1.5, OPEN),
]);

// States that last (loops) --------------------------------------------------------

/**
 * Asleep: lying low, curled round to its right toward its tail, the head
 * turned into the curl, eyes shut; slow, deep breaths lift and settle the
 * curl.
 */
const SLEEP: Pose = compose({}, front(10, 30, 0, 18), curlRight(-14, -22, -20, -24), tail(0, -6, -12, 8, 8, 8), pelvis(0, -0.02), SHUT);
const idleAsleep = clip('idle_asleep', 3.2, [
  key(0, SLEEP),
  key(1.3, SLEEP, front(-3, -4, 0, -3), pelvis(0, 0.006), { scale: 1.015 }),
  key(2.0, SLEEP, front(-1, -2, 0, -1), pelvis(0, 0.002), { scale: 1.005 }),
  key(3.2, SLEEP),
], [], true);

/** Worn down: it pants heavily, its guard sagging and the head low, still facing the foe. */
const TIRED: Pose = compose({}, front(8, 10, 6, 12), pelvis(0, -0.012), tail(0, -2, -6), DROWSY);
const idleTired = clip('idle_tired', 2.2, [
  key(0, TIRED),
  key(0.35, TIRED, front(-4, -4, -2, -4), pelvis(0, 0.005)),
  key(0.7, TIRED, front(1, 1, 1, 1)),
  key(1.05, TIRED, front(-3, -3, -2, -3), pelvis(0, 0.004)),
  key(1.45, TIRED, front(1, 1, 1, 2), lean(2)),
  key(1.8, TIRED, front(-3, -3, -1, -3), lean(-1), pelvis(0, 0.004)),
  key(2.2, TIRED),
], [], true);

// The game's other animations on a battler --------------------------------------------

/** Stat up: it dips, then draws itself up to its full height, puffed up with its spikes high, and holds it with a tremor. */
const statUp = clip('stat_up', 1.4, [
  key(0),
  key(0.2, front(6, 8, 4, 6), pelvis(0, -0.02), tail(0, -2, -4), GLARE),
  snap(0.38, REAR_UP, front(-4, -4, 0, -2), tail(0, 4, 8), { scale: 1.06 }, GLARE),
  key(0.55, REAR_UP, front(-4, -5, 0, -3, 2), tail(0, 4, 8), { scale: 1.07 }, GLARE),
  key(0.7, REAR_UP, front(-5, -4, 0, -2, -2), tail(0, 4, 8), { scale: 1.065 }, GLARE),
  key(0.85, REAR_UP, tail(0, 3, 6), { scale: 1.06 }, GLARE),
  key(1.05, front(-2, -2, 0, -2), { scale: 1.02 }, GLARE),
  key(1.4, OPEN),
]);

/** Stat down: it shrinks back and down, small and unsteady, wobbling, then pulls itself together. */
const statDown = clip('stat_down', 1.4, [
  key(0),
  key(0.18, front(10, 12, 10, 18), pelvis(0, -0.025), tail(0, -4, -10, 6, 6, 6), { scale: 0.95 }, DROWSY),
  key(0.36, front(8, 10, 8, 16), lean(5), tail(0, -4, -10, 6, 6, 6), { scale: 0.95 }, DROWSY),
  key(0.52, front(8, 10, 8, 16), lean(-5), tail(0, -4, -10, 6, 6, 6), { scale: 0.95 }, DROWSY),
  key(0.68, front(7, 9, 7, 14), lean(3), { scale: 0.96 }, DROWSY),
  key(0.9, front(4, 5, 4, 6), { scale: 0.98 }, DROWSY),
  key(1.1, front(1, 1, 1, 2), GLARE),
  key(1.4, OPEN),
]);

/** Level up: a proud little hop, then it rears up tall with a pleased tilt of the head and a wiggle of the tail. */
const levelUp = clip('level_up', 1.5, [
  key(0),
  key(0.12, front(8, 10, 6, -2), pelvis(0, -0.02), { scale: 0.95 }, OPEN),
  snap(0.28, AIR, { root: { y: 0.12 } }, REAR_UP, { scale: 1.04 }, OPEN),
  key(0.42, AIR, { root: { y: 0.13 } }, REAR_UP, front(0, 0, 0, 0, 0, 8), { scale: 1.04 }, OPEN),
  fall(0.56, TOUCH, OPEN),
  key(0.72, REAR_UP, front(-2, -2, 0, -4, 0, -6), tail(0, 0, 0, 0, 0, 10), OPEN),
  key(0.88, REAR_UP, front(-2, -2, 0, -3, 0, 6), tail(0, 0, 0, 0, 0, -10), OPEN),
  key(1.05, REAR_UP, front(-1, -1, 0, -2), tail(0, 0, 0, 0, 0, 6), OPEN),
  key(1.25, front(-1, -1, 0, -1), OPEN),
  key(1.5, OPEN),
]);

/** Drained by Leech Seed: a shiver, then it sags slowly as the energy leaves it. */
const drained = clip('drained', 1.4, [
  key(0),
  key(0.1, front(-2, -2, 0, -2), lean(2), DROWSY),
  key(0.4, front(10, 12, 8, 16), pelvis(0, -0.02), { scale: 0.97 }, DROWSY),
  key(0.7, front(14, 16, 10, 22), pelvis(0, -0.026), tail(0, -3, -6), { scale: 0.96 }, SHUT),
  key(0.95, front(8, 10, 6, 12), { scale: 0.98 }, DROWSY),
  key(1.15, front(2, 2, 1, 3), DROWSY),
  key(1.4, OPEN),
]);

/** Healed: a deep, contented breath with its eyes closed that lifts it tall, then a refreshed little bob. */
const healed = clip('healed', 1.4, [
  key(0),
  key(0.25, front(-9, -9, -3, -14), pelvis(0, 0.014), tail(0, 3, 8), { scale: 1.045 }, SHUT),
  key(0.5, front(-10, -10, -3, -16, 0, 5), pelvis(0, 0.016), tail(0, 3, 9), { scale: 1.05 }, SHUT),
  key(0.75, front(6, 6, 3, 9), pelvis(0, -0.012), { scale: 0.985 }, SHUT),
  key(1.0, front(-2, -2, 0, -2), tail(0, 3, 8), OPEN),
  key(1.4, OPEN),
]);

/** Focus: it coils back tight with its tail end cocked high behind it, eyes narrowed, still but for a tremor. */
const focus = clip('focus', 1.4, [
  key(0),
  key(0.2, COIL, tail(20, 20, -40), GLARE),
  key(0.4, COIL, front(-2, -2, 0, -2), tail(24, 24, -50), pelvis(0, -0.01), GLARE),
  key(0.55, COIL, front(-2, -2, 0, -2, 1.5), tail(24, 24, -50), pelvis(0, -0.01), GLARE),
  key(0.7, COIL, front(-2, -2, 0, -2, -1.5), tail(24, 25, -51), pelvis(0, -0.01), GLARE),
  key(0.85, COIL, front(-2, -2, 0, -2, 1), tail(24, 24, -50), pelvis(0, -0.01), GLARE),
  key(1.05, front(-4, -4, -2, -4), tail(6, 6, -10), GLARE),
  key(1.4, OPEN),
]);

/** Hanging on at 1 HP: a big lurch back, a sway forward as if to fall, then it catches itself and digs in. */
const hangOn = clip('hang_on', 1.4, [
  key(0),
  snap(0.08, front(-12, -16, -10, -20), { root: { z: -0.03, pitch: -6 } }, SHUT),
  key(0.32, front(12, 14, 8, 18), lean(8), { root: { pitch: 4 } }, DROWSY),
  key(0.52, front(-4, -4, -2, -6), lean(-6), DROWSY),
  key(0.7, front(4, 4, 2, 4), pelvis(0, -0.02), lean(2), GLARE),
  key(0.9, front(-2, -2, 0, -2), GLARE),
  key(1.4, OPEN),
]);

// What the game only says ------------------------------------------------------------

/** Flinched: startled, it jumps and jerks its head aside, then falters, shaking its head. */
const flinch = clip('flinch', 0.95, [
  key(0),
  snap(0.05, front(-6, -8, -4, -8, 22, 10), { root: { y: 0.035 } }, pelvis(0, 0.01), tail(0, 4, 12), SHUT),
  key(0.18, front(-4, -6, -2, -6, 18, 8), SHUT),
  key(0.36, front(6, 8, 4, 12, -8, -4), lean(3), DROWSY),
  key(0.52, front(4, 5, 3, 8, 6, 2), lean(-2), DROWSY),
  key(0.72, front(1, 1, 0, 2), GLARE),
  key(0.95, OPEN),
]);

/** Must recharge: spent, it slumps and pants, too tired to move. */
const recharge = clip('recharge', 1.5, [
  key(0),
  key(0.2, SLUMP, pelvis(0, -0.02), DROWSY),
  key(0.4, SLUMP, front(-2, -2, -2, -2), pelvis(0, -0.015), DROWSY),
  key(0.6, SLUMP, front(1, 1, 0, 2), pelvis(0, -0.022), SHUT),
  key(0.8, SLUMP, front(-2, -2, -2, -2), pelvis(0, -0.015), DROWSY),
  key(1.0, SLUMP, front(1, 1, 0, 1), pelvis(0, -0.02), SHUT),
  key(1.25, front(5, 6, 4, 8), DROWSY),
  key(1.5, OPEN),
]);

/** Woke up: from its sleep it stirs, then starts up with its eyes wide, shakes its head and is back on guard. */
const wake = clip('wake', 1.3, [
  key(0, SLEEP),
  key(0.2, SLEEP, front(-4, -4, -2, -6), SHUT),
  snap(0.32, front(-10, -12, -4, -12), { root: { y: 0.04 } }, tail(0, 6, 14), OPEN),
  key(0.5, front(-6, -8, -2, -8, 14, 8), OPEN),
  key(0.62, front(-5, -6, -2, -6, -12, -6), OPEN),
  key(0.74, front(-4, -4, -2, -4, 6, 2), OPEN),
  key(0.95, front(-2, -2, 0, -2), GLARE),
  key(1.3, OPEN),
]);

/** Shaking it off (thawed, free, cured): a vigorous whole-body wriggle, head and tail end flying, then back on guard. */
const shakeOff = clip('shake_off', 1.1, [
  key(0),
  key(0.1, front(5, 5, 3, 6), pelvis(0, -0.015), GLARE),
  key(0.18, front(0, 0, 0, 0, 18, 10), lean(16), tail(0, 4, 10, 0, 0, -18), { root: { roll: -5 } }, SHUT),
  key(0.28, front(0, 0, 0, 0, -18, -10), lean(-16), tail(0, 4, 10, 0, 0, 18), { root: { roll: 5 } }, SHUT),
  key(0.38, front(0, 0, 0, 0, 14, 8), lean(12), tail(0, 3, 8, 0, 0, -12), { root: { roll: -3 } }, SHUT),
  key(0.48, front(0, 0, 0, 0, -10, -5), lean(-8), tail(0, 2, 4, 0, 0, 8), { root: { roll: 2 } }, SHUT),
  key(0.58, lean(3), OPEN),
  key(0.75, front(-3, -3, -1, -4), GLARE),
  key(1.1, OPEN),
]);

/**
 * Broke free of a Poké Ball: it bursts out of a tight curl up to its full
 * height, shakes itself and glares, coiled and angry, then settles.
 */
const breakFree = clip('break_free', 1.4, [
  key(0, CURL, { scale: 0.9 }, SHUT),
  snap(0.16, REAR_UP, { scale: 1.04 }, OPEN),
  key(0.3, REAR_UP, front(0, 0, 0, 0, 10, 6), lean(10), OPEN),
  key(0.4, REAR_UP, front(0, 0, 0, 0, -10, -6), lean(-10), OPEN),
  key(0.5, REAR_UP, lean(6), OPEN),
  key(0.64, COIL, front(0, 0, 0, 6), GLARE),
  key(0.82, COIL, front(0, 0, 0, 6, 1.5), tail(0, 2, 4), GLARE),
  key(1.05, front(-2, -2, 0, -2), GLARE),
  key(1.4, OPEN),
]);

// The weather ---------------------------------------------------------------------

/** Rain: it hunches under the falling rain, then shakes the water off and looks up. */
const weatherRain = clip('weather_rain', 1.4, [
  key(0),
  key(0.2, front(8, 10, 10, 16), pelvis(0, -0.012), SHUT),
  key(0.45, front(8, 10, 10, 17, 0, 4), pelvis(0, -0.014), SHUT),
  key(0.6, front(4, 5, 5, 8, 10), lean(8), SHUT),
  key(0.68, front(4, 5, 5, 8, -10), lean(-8), SHUT),
  key(0.76, front(3, 4, 4, 6, 8), lean(6), SHUT),
  key(0.84, front(2, 3, 3, 4, -4), lean(-4), SHUT),
  key(1.05, front(-6, -6, -2, -12), OPEN),
  key(1.4, OPEN),
]);

/** Harsh sunlight: it glances up, flinches from the glare and turns its face aside and down, squinting. */
const weatherSun = clip('weather_sun', 1.3, [
  key(0),
  key(0.2, front(-4, -4, -2, -14), DROWSY),
  key(0.4, front(6, 6, 6, 12, -16, -8), lean(-4), SHUT),
  key(0.7, front(6, 7, 6, 13, -18, -8), lean(-4), DROWSY),
  key(0.95, front(2, 2, 1, 4, -6), DROWSY),
  key(1.3, OPEN),
]);

/** Sandstorm: it turns its face out of the wind with its eyes shut and braces low, leaning hard into the gusts. */
const weatherSand = clip('weather_sand', 1.4, [
  key(0),
  key(0.15, front(8, 10, 5, 8, 28, 8), lean(6), pelvis(0, -0.018), SHUT),
  key(0.4, front(12, 14, 7, 12, 30, 10), lean(9), pelvis(0, -0.024), tail(0, -4, -8), SHUT),
  key(0.6, front(12, 14, 7, 12, 30, 10), lean(13), pelvis(0, -0.024), tail(0, -4, -8), { root: { roll: -3 } }, SHUT),
  key(0.8, front(10, 12, 6, 10, 26, 8), lean(7), pelvis(0, -0.02), tail(0, -3, -6), SHUT),
  key(1.0, front(2, 2, 1, 2, 8), DROWSY),
  key(1.4, OPEN),
]);

/** Hail: each hailstone makes it flinch, and it hunches, curling its head down under the pelting. */
const weatherHail = clip('weather_hail', 1.3, [
  key(0),
  snap(0.08, front(10, 12, 10, 18), pelvis(0, -0.02), SHUT),
  key(0.22, front(4, 16, 22, 24), pelvis(0, -0.02), SHUT),
  snap(0.36, front(6, 18, 24, 26, 0, 8), lean(4), pelvis(0, -0.024), SHUT),
  key(0.5, front(4, 16, 22, 24), lean(-2), pelvis(0, -0.02), SHUT),
  snap(0.7, front(5, 17, 23, 25, 6), lean(3), pelvis(0, -0.022), SHUT),
  key(0.9, front(2, 4, 4, 6), DROWSY),
  key(1.3, OPEN),
]);

export const SITUATIONS: Clip[] = [
  idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome,
  statusSleep, statusPoison, statusBurn, statusParalysis, statusFreeze, statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped,
  idleAsleep, idleTired,
  statUp, statDown, levelUp, drained, healed, focus, hangOn,
  flinch, recharge, wake, shakeOff, breakFree,
  weatherRain, weatherSun, weatherSand, weatherHail,
];
