// Swampert's battle situations (src/battle3d/situations.ts): the moments
// every battle plays (idle, intro, hit, faint) and every other situation the
// game puts it in, each its own clip.

import {
  ANGRY, ARMS_DOWN_FRONT, ARMS_RISING, ARMS_ROAR, CROSSED_CHEST, CROSSED_LOW, CURL, DROWSY, ELBOWS_BACK, ELBOWS_OUT, FISTS, FISTS_AT_SIDES,
  FISTS_UP, FLINCH, FOCUS_GUARD, HAPPY, HOP, HURT, LAND, LAND_HOME, LIMP_ARMS, MOUTH_SHUT, NARROW, OPEN_EYES, SHUT, SPLAY, SQUINT, SUMO_GUARD,
  TUCK, arms, bend, body, clip, fall, jaw, key, pelvis, sink, snap, stepL, stepR, twist,
} from './kit';

/** Idle: slow, heavy breathing through the open mouth; the life layer adds the rest. */
export const idle = clip('idle', [
  key(0),
  key(1.4, pelvis(0, -0.008), { bones: { spine: { x: 2 } } }, jaw(4), { post: { armL: { z: 3 }, armR: { z: -3 } } }),
  key(2.8),
], [], true);

/**
 * Sent out: rises from a curled crouch in a heavy hop (the stock front anim
 * is ANIM_V_JUMPS_BIG) with its fists pulled up, lands deep, then roars with
 * its arms flung up high. The hop is low and leans in, and the arms go up and
 * come down the front of the body: from our side a high jump took the head
 * fins under the foe's healthbox, and arms flung wide or swung round the
 * sides took the right hand under ours.
 */
export const intro = clip('intro', [
  key(0, pelvis(0, -0.07), bend(18, 6, 0, 16), CROSSED_LOW, MOUTH_SHUT, SHUT),
  key(0.22, pelvis(0, -0.1), bend(24, 8, 2, 20), CROSSED_LOW, MOUTH_SHUT, SHUT),
  snap(0.42, { root: { y: 0.06, pitch: 5 } }, TUCK, bend(-6, -4, -2, -10), FISTS_UP, FISTS, jaw(6), ANGRY),
  key(0.55, { root: { y: 0.07, pitch: 5 } }, TUCK, bend(-7, -4, -2, -12), FISTS_UP, FISTS, jaw(8), ANGRY),
  fall(0.72, LAND, pelvis(0, -0.03), bend(8, 2, 0, 4), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
  key(0.8, LAND, pelvis(0, -0.035), bend(9, 2, 0, 5), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.96, pelvis(0, 0.012), bend(-12, -8, -6, -20), ARMS_ROAR, jaw(26), ANGRY),
  key(1.14, pelvis(0, 0.014), bend(-13, -8, -6, -22, 5, 3), ARMS_ROAR, jaw(28), ANGRY),
  key(1.32, pelvis(0, 0.012), bend(-12, -8, -6, -21, -5, -3), ARMS_ROAR, jaw(26), ANGRY),
  key(1.5, pelvis(0, -0.01), bend(4, 2, 0, -4), ARMS_DOWN_FRONT, jaw(8), ANGRY),
  key(1.66, pelvis(0, -0.012), bend(4, 2, 0, -2), jaw(4), ANGRY),
  key(1.95, OPEN_EYES),
], [[1.02, 'cry']]);

/** Taking a hit: the head snaps back, arms fly out, then it digs back in. */
export const hit = clip('hit', [
  key(0),
  snap(0.05, bend(-12, -6, -4, -16), FLINCH, jaw(10), HURT),
  key(0.2, bend(-5, -2, -2, -7), jaw(4), HURT),
  key(0.38, bend(3, 1, 0, 3), HURT),
  key(0.66, OPEN_EYES),
]);

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it settles back heavily onto its heels and curls over its belly,
 * arms folded in and head bowed between its shoulders, eyes shut; from the
 * 'shrink' the curled body shrinks away (Battler3D). It sits back as it
 * curls: slumped forward onto its belly, the foe's head fell onto our
 * healthbox (tools/gauntlet/uiclear.mjs).
 */
export const faint = clip('faint', [
  key(0),
  key(0.2, { root: { z: -0.02 } }, bend(-8, -4, -2, -12), jaw(-8), DROWSY),
  key(0.52, sink(-0.05), { root: { z: -0.03 } }, bend(6, 2, 1, 12), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
  key(0.88, sink(-0.08), { root: { z: -0.06, pitch: -2 } }, bend(10, 4, 2, 19), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
  key(1.02, sink(-0.085), { root: { z: -0.06, pitch: -2 } }, bend(11, 5, 2, 20), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
  key(1.7, sink(-0.083), { root: { z: -0.06, pitch: -2 } }, bend(10, 4, 2, 19), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
], [[1.12, 'shrink']]);

/** A shrug: forearms raised out to the sides, palms up. */
const SHRUG = arms([0.68, -0.44, 0.59], [0.42, 0.3, 0.86], [0.3, 0.12, 0.95]);
/** Its scorched left arm raised and flapped (one phase)... */
const FLAP_A = arms([0.6, 0.2, 0.77], [0.3, 0.62, 0.72], [0.1, 0.82, 0.56], [[-0.88, -0.3, 0.35], [-0.55, -0.75, 0.35], [0.65, -0.72, 0.25]]);
/** ... and the other. */
const FLAP_B = arms([0.66, 0.08, 0.75], [0.45, 0.35, 0.82], [0.35, 0.2, 0.92], [[-0.88, -0.3, 0.35], [-0.55, -0.75, 0.35], [0.65, -0.72, 0.25]]);
/** Seized up: arms locked out stiff and splayed. */
const STIFF = arms([0.78, -0.58, 0.24], [0.72, -0.64, 0.27], [0.66, -0.7, 0.27]);
const STIFF_B = arms([0.74, -0.64, 0.2], [0.68, -0.7, 0.2], [0.6, -0.76, 0.25]);
/** Hands clasped at the chest (lovestruck). */
const CLASPED = arms([0.55, -0.4, 0.73], [-0.5, 0.35, 0.79], [-0.6, 0.4, 0.69]);
/** Arms pinned tight to its sides (bound). */
const PINNED = arms([0.36, -0.93, 0.06], [0.2, -0.95, 0.24], [0.05, -0.95, 0.3]);
/** ... straining outward against the bind. */
const STRAIN_OUT = arms([0.62, -0.76, 0.18], [0.48, -0.83, 0.28], [0.32, -0.88, 0.34]);
/** The crab arms sagging lower (worn down). */
const SAGGING = arms([0.8, -0.55, 0.23], [0.4, -0.88, 0.25], [-0.2, -0.95, 0.25]);
/** A front double-biceps flex, upper arms forward-out, forearms up. */
const FLEX = arms([0.75, 0.2, 0.63], [0.1, 0.95, 0.3], [-0.05, 0.95, 0.3]);
/** Arms opened up and forward into the rain. */
const OPEN_UP = arms([0.58, 0.5, 0.64], [0.35, 0.72, 0.6], [0.2, 0.82, 0.54]);
/** The right hand raised to its brow, shading its eyes. */
const SHADE_R = arms([0.88, -0.3, 0.35], [0.55, -0.75, 0.35], [-0.65, -0.72, 0.25], [[-0.45, 0.35, 0.82], [0.28, 0.9, 0.34], [0.55, 0.2, 0.81]]);
/** The right forearm held across its face against the wind. */
const SHIELD_EYES = arms([0.88, -0.3, 0.35], [0.55, -0.75, 0.35], [-0.65, -0.72, 0.25], [[-0.42, 0.2, 0.88], [0.8, 0.42, 0.43], [0.85, 0.3, 0.43]]);
/** Forearms held over its bowed head (hail). */
const ARMS_OVER_HEAD = arms([0.55, 0.5, 0.67], [-0.5, 0.55, 0.67], [-0.6, 0.3, 0.74]);

/** A critical or super-effective blow: knocked further back, a stagger step, a shake of the head, and it digs back in. */
export const hitStrong = clip('hit_strong', [
  key(0),
  snap(0.05, body(0, 0, -0.04), bend(-18, -8, -5, -22), FLINCH, SPLAY, jaw(14), HURT),
  key(0.2, body(0, 0, -0.07), stepR(26), bend(-10, -4, -3, -12), FLINCH, jaw(8), HURT),
  key(0.36, body(0, 0, -0.06), sink(-0.05), bend(6, 2, 0, 6, 6, 5), ELBOWS_OUT, jaw(4), HURT),
  key(0.52, body(0, 0, -0.03), sink(-0.03), bend(4, 1, 0, 3, -5, -4), ELBOWS_OUT, HURT),
  key(0.72, sink(-0.015), bend(2, 0, 0, 1), ANGRY),
  key(0.95, OPEN_EYES),
]);

/** The foe's move misses it: a quick, heavy sidestep hop to its left, ducking low under it, and back on guard. */
export const dodge = clip('dodge', [
  key(0),
  key(0.08, sink(-0.04), bend(6, 2, 0, 4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.2, body(0.14, 0.05, 0, 0, -4), HOP, bend(12, 4, 2, 10), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.32, body(0.18, 0, 0, 0, -3), LAND, sink(-0.07), bend(18, 6, 2, 14), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.5, body(0.1, 0.04, 0, 0, 2), HOP, bend(8, 2, 0, 4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(0.62, LAND, bend(6, 2, 0, 2), ELBOWS_OUT, ANGRY),
  key(0.9, OPEN_EYES),
]);

/** A move has no effect on it: it stands firm, unimpressed, shrugs with its palms up and shakes its head slowly. */
export const unaffected = clip('unaffected', [
  key(0),
  key(0.16, pelvis(0, 0.008), bend(-4, -2, 0, -6), ELBOWS_OUT, MOUTH_SHUT, NARROW),
  snap(0.32, pelvis(0, 0.014), bend(-6, -3, 0, -8), SHRUG, SPLAY, MOUTH_SHUT, NARROW),
  key(0.5, pelvis(0, 0.012), bend(-6, -3, 0, -8, 10), SHRUG, SPLAY, MOUTH_SHUT, NARROW),
  key(0.68, pelvis(0, 0.012), bend(-6, -3, 0, -8, -10), SHRUG, SPLAY, MOUTH_SHUT, NARROW),
  key(0.86, pelvis(0, 0.006), bend(-2, -1, 0, -3, 3), ELBOWS_OUT, MOUTH_SHUT, NARROW),
  key(1.2, OPEN_EYES),
]);

/** Back home from the foe after a run of hits: it pushes off in a heavy hop and lands home deep in the knees. */
export const returnHome = clip('return_home', [
  key(0, { advance: 1 }),
  key(0.1, { advance: 1 }, sink(-0.05), bend(8, 2, 0, 4), ELBOWS_OUT, ANGRY),
  key(0.28, { advance: 0.5, root: { y: 0.07 } }, HOP, bend(2, 0, 0, 0), ELBOWS_OUT, ANGRY),
  key(0.44, { advance: 0 }, LAND_HOME, ELBOWS_OUT, ANGRY),
  key(0.64, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY),
  key(0.9, OPEN_EYES),
]);

/** Falling asleep: a drowsy sway, the eyes drooping shut, the head sinking onto its chest, slow breaths. */
export const statusSleep = clip('status_sleep', [
  key(0),
  key(0.3, body(0, 0, 0, 0, 3), bend(4, 2, 0, 6, 0, 4), jaw(-6), DROWSY),
  key(0.62, body(0, 0, 0, 0, -3), sink(-0.03), bend(8, 3, 1, 12, 0, -4), LIMP_ARMS, jaw(-12), DROWSY),
  key(0.94, sink(-0.05), bend(12, 5, 2, 18, 0, 3), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(1.24, sink(-0.045), bend(10, 4, 2, 16, 0, 2), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(1.5, sink(-0.02), bend(4, 1, 0, 6), jaw(-6), DROWSY),
  key(1.8, OPEN_EYES),
]);

/** Poisoned: a sickly shudder, hunched over its belly with its arms folded on it, wincing. */
export const statusPoison = clip('status_poison', [
  key(0),
  snap(0.1, sink(-0.04), bend(14, 6, 2, 12), CROSSED_LOW, MOUTH_SHUT, HURT),
  key(0.22, sink(-0.045), bend(15, 6, 2, 13, 4, 4), CROSSED_LOW, jaw(-10), HURT),
  key(0.34, sink(-0.045), bend(15, 6, 2, 13, -4, -4), CROSSED_LOW, jaw(-10), HURT),
  key(0.46, sink(-0.045), bend(15, 6, 2, 13, 3, 3), CROSSED_LOW, jaw(-10), HURT),
  key(0.62, sink(-0.035), bend(12, 5, 2, 10, -2, -2), CROSSED_LOW, MOUTH_SHUT, DROWSY),
  key(0.86, sink(-0.015), bend(4, 2, 0, 4), jaw(-6), DROWSY),
  key(1.2, OPEN_EYES),
]);

/** Burned: it jerks from the burn, flaps its scorched left arm to cool it, looking at it, and shakes it off. */
export const statusBurn = clip('status_burn', [
  key(0),
  snap(0.06, pelvis(0, 0.01), bend(-8, -4, -2, -12), FLINCH, SPLAY, jaw(12), HURT),
  key(0.2, sink(-0.02), bend(4, 2, 0, 2, 12), FLAP_A, SPLAY, jaw(8), HURT),
  key(0.3, sink(-0.02), bend(4, 2, 0, 2, 14), FLAP_B, SPLAY, jaw(8), HURT),
  key(0.4, sink(-0.02), bend(4, 2, 0, 2, 12), FLAP_A, SPLAY, jaw(8), HURT),
  key(0.5, sink(-0.02), bend(4, 2, 0, 2, 14), FLAP_B, SPLAY, jaw(8), SQUINT),
  key(0.68, sink(-0.015), bend(2, 1, 0, 0, 6, 4), ELBOWS_OUT, jaw(4), ANGRY),
  key(1.1, OPEN_EYES),
]);

/** Paralyzed: it seizes up rigid, arms locked out stiff and splayed, and twitches with each jolt. */
export const statusParalysis = clip('status_paralysis', [
  key(0),
  snap(0.06, pelvis(0, 0.012), bend(-6, -3, -2, -10), STIFF, SPLAY, jaw(14), SQUINT),
  key(0.16, pelvis(0, 0.012), bend(-6, -3, -2, -10, 0, 3), STIFF, SPLAY, jaw(14), SQUINT),
  snap(0.24, pelvis(0.008, 0.008), bend(-4, -2, -2, -8, 3, -3), STIFF_B, SPLAY, jaw(10), SQUINT),
  key(0.36, pelvis(0.008, 0.008), bend(-4, -2, -2, -8, 2, -2), STIFF_B, SPLAY, jaw(10), SQUINT),
  snap(0.46, pelvis(-0.006, 0.012), bend(-6, -3, -2, -11, -3, 3), STIFF, SPLAY, jaw(12), SQUINT),
  key(0.6, pelvis(-0.004, 0.01), bend(-5, -3, -2, -10, -2, 2), STIFF, SPLAY, jaw(12), SQUINT),
  key(0.82, sink(-0.02), bend(4, 2, 0, 4), ELBOWS_OUT, jaw(2), HURT),
  key(1.2, OPEN_EYES),
]);

/** Frozen: locked in the ice with its fists clenched to its chest, it strains to break free (tiny tremors). */
export const statusFreeze = clip('status_freeze', [
  key(0),
  snap(0.1, sink(-0.03), bend(6, 2, 0, 4), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(0.3, sink(-0.032), bend(6.5, 2, 0, 4.5, 1, 1), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(0.46, sink(-0.03), bend(6, 2, 0, 4, -1.5, -1), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(0.62, sink(-0.034), bend(7, 2, 0, 5, 1.5, 1.5), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(0.78, sink(-0.03), bend(6, 2, 0, 4, -1, -1), CROSSED_CHEST, FISTS, MOUTH_SHUT, SQUINT),
  key(1.0, sink(-0.015), bend(3, 1, 0, 2), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(1.3, OPEN_EYES),
]);

/** Confused: it wobbles off balance in a slow circle, staggering a step each way, the head swimming. */
export const statusConfusion = clip('status_confusion', [
  key(0),
  key(0.2, body(0, 0, 0, 3, 5), bend(-2, -1, 0, -4, 10, 8), ELBOWS_OUT, jaw(6), DROWSY),
  key(0.44, body(0, 0, 0, -3, 4), stepL(18), bend(-4, -1, 0, -2, -6, 10), ELBOWS_OUT, jaw(8), DROWSY),
  key(0.68, body(0, 0, 0, -3, -5), bend(-2, -1, 0, -4, -10, -8), ELBOWS_OUT, jaw(6), DROWSY),
  key(0.92, body(0, 0, 0, 3, -4), stepR(18), bend(-4, -1, 0, -2, 6, -10), ELBOWS_OUT, jaw(8), DROWSY),
  key(1.14, body(0, 0, 0, 2, 3), bend(-2, -1, 0, -3, 6, 6), ELBOWS_OUT, jaw(4), DROWSY),
  key(1.34, bend(0, 0, 0, -1, 0, 3), jaw(2), DROWSY),
  key(1.6, OPEN_EYES),
]);

/** Infatuated: lovestruck, it sways dreamily with its head tilted and its hands clasped at its chest. */
export const statusInfatuation = clip('status_infatuation', [
  key(0),
  key(0.22, body(0, 0, 0, 0, 4), bend(0, 0, 0, -4, 8, 12), CLASPED, jaw(6), HAPPY),
  key(0.5, body(0, 0, 0, 0, -4), bend(0, 0, 0, -4, -8, -12), CLASPED, jaw(8), HAPPY),
  key(0.78, body(0, 0, 0, 0, 4), bend(0, 0, 0, -4, 8, 12), CLASPED, jaw(6), HAPPY),
  key(1.04, body(0, 0, 0, 0, -2), bend(0, 0, 0, -2, -4, -6), CLASPED, jaw(4), HAPPY),
  key(1.24, bend(1, 0, 0, 0), jaw(2), OPEN_EYES),
  key(1.5, OPEN_EYES),
]);

/** Cursed: it doubles over in pain, fists clenched to its belly, groaning and shuddering. */
export const statusCurse = clip('status_curse', [
  key(0),
  snap(0.1, sink(-0.06), bend(20, 8, 2, 16), CROSSED_LOW, FISTS, jaw(12), HURT),
  key(0.28, sink(-0.07), bend(22, 9, 2, 18, 3, 3), CROSSED_LOW, FISTS, jaw(10), HURT),
  key(0.46, sink(-0.068), bend(21, 9, 2, 17, -3, -3), CROSSED_LOW, FISTS, jaw(10), HURT),
  key(0.64, sink(-0.07), bend(22, 9, 2, 18, 2, 2), CROSSED_LOW, FISTS, jaw(8), SHUT),
  key(0.9, sink(-0.03), bend(8, 3, 0, 8), ELBOWS_OUT, jaw(2), DROWSY),
  key(1.3, OPEN_EYES),
]);

/** Nightmare: asleep, it writhes: the head tossing side to side, the arms jerking up, a pained grimace. */
export const statusNightmare = clip('status_nightmare', [
  key(0),
  key(0.2, sink(-0.04), bend(10, 4, 2, 14), LIMP_ARMS, MOUTH_SHUT, SHUT),
  snap(0.32, sink(-0.045), bend(6, 3, 2, 6, 16, 8), FLINCH, jaw(10), HURT),
  key(0.48, sink(-0.045), bend(8, 3, 2, 10, -14, -8), ELBOWS_OUT, jaw(4), SHUT),
  snap(0.6, sink(-0.04), bend(4, 2, 2, 4, 14, 6), FLINCH, jaw(12), HURT),
  key(0.78, sink(-0.045), bend(10, 4, 2, 12, -8, -4), LIMP_ARMS, jaw(2), SHUT),
  key(1.0, sink(-0.04), bend(10, 4, 2, 14, 4, 2), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(1.2, sink(-0.02), bend(5, 2, 0, 6), jaw(-4), DROWSY),
  key(1.5, OPEN_EYES),
]);

/** Wrapped: squeezed by the bind with its arms pinned to its sides, it strains outward against it, twice, grimacing. */
export const statusWrapped = clip('status_wrapped', [
  key(0),
  snap(0.08, pelvis(0, 0.01), bend(-4, -2, 0, -6), PINNED, FISTS, MOUTH_SHUT, SQUINT),
  key(0.26, pelvis(0, 0.012), bend(-5, -2, 0, -8, 4, 3), PINNED, FISTS, jaw(8), SQUINT),
  key(0.42, sink(-0.02), bend(2, 1, 0, 0, -4, -3), STRAIN_OUT, FISTS, jaw(12), HURT),
  key(0.58, pelvis(0, 0.012), bend(-5, -2, 0, -8, 4, 3), PINNED, FISTS, MOUTH_SHUT, SQUINT),
  key(0.74, sink(-0.02), bend(2, 1, 0, 0, -4, -3), STRAIN_OUT, FISTS, jaw(12), HURT),
  key(0.94, sink(-0.015), bend(2, 1, 0, 2), ELBOWS_OUT, jaw(2), ANGRY),
  key(1.3, OPEN_EYES),
]);

/** Asleep (loops while it sleeps): slumped where it stands, head bowed on its chest, arms hanging, slow deep breaths. */
export const idleAsleep = clip('idle_asleep', [
  key(0, sink(-0.06), bend(12, 5, 2, 18), LIMP_ARMS, MOUTH_SHUT, SHUT),
  key(1.5, sink(-0.052), bend(9, 3, 2, 15), LIMP_ARMS, jaw(-14), SHUT),
  key(3.0, sink(-0.06), bend(12, 5, 2, 18), LIMP_ARMS, MOUTH_SHUT, SHUT),
], [], true);

/** Worn down (loops at a quarter of its HP or less): heavy panting through the open mouth, the guard sagging, still facing the foe. */
export const idleTired = clip('idle_tired', [
  key(0, sink(-0.04), bend(10, 4, 0, 4), SAGGING, jaw(10), DROWSY),
  key(0.35, sink(-0.03), bend(6, 2, 0, 0), SAGGING, jaw(16), DROWSY),
  key(0.7, sink(-0.04), bend(10, 4, 0, 4), SAGGING, jaw(10), DROWSY),
  key(1.05, sink(-0.03), bend(6, 2, 0, 0), SAGGING, jaw(16), DROWSY),
  key(1.4, sink(-0.04), bend(10, 4, 0, 4), SAGGING, jaw(10), DROWSY),
], [], true);

/** Powered up: it draws itself up tall, chest out, and flexes both arms with a fierce grin. */
export const statUp = clip('stat_up', [
  key(0),
  key(0.18, sink(-0.04), bend(8, 3, 0, 6), CROSSED_LOW, FISTS, MOUTH_SHUT, SQUINT),
  snap(0.36, pelvis(0, 0.022), bend(-12, -7, -4, -14), FLEX, FISTS, jaw(12), ANGRY),
  key(0.56, pelvis(0, 0.024), bend(-13, -7, -4, -15, 0, 2), FLEX, FISTS, jaw(14), ANGRY),
  key(0.76, pelvis(0, 0.022), bend(-12, -7, -4, -14, 0, -2), FLEX, FISTS, jaw(12), ANGRY),
  key(0.96, pelvis(0, 0.005), bend(-2, -1, 0, -3), ELBOWS_OUT, jaw(4), ANGRY),
  key(1.3, OPEN_EYES),
]);

/** Weakened: it shrinks back, hunched and unsteady, the arms drawn in. */
export const statDown = clip('stat_down', [
  key(0),
  snap(0.12, body(0, 0, -0.03), sink(-0.03), bend(10, 4, 2, 12), CROSSED_LOW, MOUTH_SHUT, HURT),
  key(0.32, body(0, 0, -0.04, 0, 3), sink(-0.05), bend(12, 5, 2, 14, 5, 4), CROSSED_LOW, jaw(-8), DROWSY),
  key(0.52, body(0, 0, -0.04, 0, -3), sink(-0.05), bend(12, 5, 2, 14, -5, -4), CROSSED_LOW, jaw(-8), DROWSY),
  key(0.72, body(0, 0, -0.02), sink(-0.03), bend(8, 3, 1, 8), ELBOWS_OUT, jaw(-4), DROWSY),
  key(1.1, OPEN_EYES),
]);

/** Grown stronger: a proud little hop, then it throws its arms up in front and roars. */
export const levelUp = clip('level_up', [
  key(0),
  key(0.16, sink(-0.06), bend(10, 3, 0, 6), ELBOWS_OUT, MOUTH_SHUT, HAPPY),
  key(0.3, body(0, 0.06, 0), TUCK, bend(-6, -3, -2, -10), FISTS_UP, FISTS, jaw(10), HAPPY),
  fall(0.44, LAND, bend(6, 2, 0, 2), FISTS_UP, FISTS, jaw(6), HAPPY),
  snap(0.58, pelvis(0, 0.018), bend(-12, -8, -6, -20), ARMS_ROAR, jaw(26), ANGRY),
  key(0.78, pelvis(0, 0.02), bend(-13, -8, -6, -21, 4, 2), ARMS_ROAR, jaw(28), ANGRY),
  key(0.98, pelvis(0, 0.018), bend(-12, -8, -6, -20, -4, -2), ARMS_ROAR, jaw(24), ANGRY),
  key(1.16, pelvis(0, -0.005), bend(2, 1, 0, -4), ARMS_DOWN_FRONT, jaw(6), HAPPY),
  key(1.5, OPEN_EYES),
]);

/** Drained by Leech Seed: it sags as the energy is drawn out of it, the head drooping, then steadies. */
export const drained = clip('drained', [
  key(0),
  key(0.2, sink(-0.03), bend(6, 2, 0, 8), ELBOWS_OUT, jaw(-6), HURT),
  key(0.5, sink(-0.07), bend(14, 5, 2, 18), LIMP_ARMS, jaw(-12), DROWSY),
  key(0.74, sink(-0.075), bend(15, 5, 2, 19, 0, 3), LIMP_ARMS, jaw(-12), DROWSY),
  key(0.98, sink(-0.03), bend(6, 2, 0, 6), ELBOWS_OUT, jaw(-4), ANGRY),
  key(1.3, OPEN_EYES),
]);

/** Healed: it lets out a long breath and relaxes, the shoulders dropping, eyes happily closed. */
export const healed = clip('healed', [
  key(0),
  key(0.24, pelvis(0, 0.016), bend(-8, -6, -4, -12), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  key(0.44, pelvis(0, 0.018), bend(-9, -6, -4, -13, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SHUT),
  key(0.7, sink(-0.03), bend(6, 3, 0, 6), LIMP_ARMS, jaw(8), HAPPY),
  key(0.92, sink(-0.025), bend(5, 2, 0, 4, 3), LIMP_ARMS, jaw(6), HAPPY),
  key(1.1, sink(-0.01), bend(2, 1, 0, 1), jaw(2), HAPPY),
  key(1.4, OPEN_EYES),
]);

/**
 * Focus Punch's setup: it tightens its focus, sinking into a low stance with
 * the right fist drawn back to its hip and the left hand held out, utterly
 * still but for a tremor.
 */
export const focus = clip('focus', [
  key(0),
  key(0.2, sink(-0.03), bend(4, 2, 0, 4), twist(-8), ELBOWS_OUT, FISTS, MOUTH_SHUT, NARROW),
  snap(0.38, sink(-0.065), bend(6, 2, 0, 5), twist(-16), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(0.6, sink(-0.068), bend(6.5, 2, 0, 5.5, 1, 1), twist(-17), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(0.82, sink(-0.07), bend(6, 2, 0, 5, -1, -1), twist(-16), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(1.04, sink(-0.068), bend(6.5, 2, 0, 5.5, 1, 1), twist(-17), FOCUS_GUARD, FISTS, MOUTH_SHUT, NARROW),
  key(1.26, sink(-0.03), bend(3, 1, 0, 2), twist(-6), ELBOWS_OUT, FISTS, MOUTH_SHUT, NARROW),
  key(1.6, OPEN_EYES),
]);

/** Hanging on at 1 HP: it staggers back, knees buckling, but catches itself and stays up, gritting its teeth. */
export const hangOn = clip('hang_on', [
  key(0),
  snap(0.08, body(0, 0, -0.03), bend(-10, -4, -2, -12), FLINCH, jaw(10), HURT),
  key(0.28, body(0, 0, -0.05, 0, 4), stepL(20), sink(-0.06), bend(8, 3, 2, 12, 4, 6), LIMP_ARMS, jaw(6), HURT),
  key(0.48, body(0, 0, -0.05, 0, -3), sink(-0.1), bend(14, 5, 2, 16, -3, -4), LIMP_ARMS, jaw(4), DROWSY),
  snap(0.66, body(0, 0, -0.03), sink(-0.07), bend(6, 2, 0, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
  key(0.88, body(0, 0, -0.015), sink(-0.05), bend(5, 2, 0, 2, 2, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, ANGRY),
  key(1.1, sink(-0.02), bend(2, 1, 0, 1), ELBOWS_OUT, ANGRY),
  key(1.4, OPEN_EYES),
]);

/** Flinched: startled, it jerks back with its hands up and falters, unable to act, then shakes its head. */
export const flinch = clip('flinch', [
  key(0),
  snap(0.06, body(0, 0, -0.02), pelvis(0, 0.012), bend(-10, -5, -3, -14), FLINCH, SPLAY, jaw(14), HURT),
  key(0.2, body(0, 0, -0.03), pelvis(0, 0.01), bend(-8, -4, -2, -10), FLINCH, SPLAY, jaw(10), HURT),
  key(0.4, body(0, 0, -0.02), sink(-0.04), bend(6, 2, 0, 8), ELBOWS_OUT, jaw(2), DROWSY),
  key(0.54, sink(-0.03), bend(4, 2, 0, 4, 8, 5), ELBOWS_OUT, DROWSY),
  key(0.66, sink(-0.025), bend(4, 2, 0, 4, -8, -5), ELBOWS_OUT, DROWSY),
  key(0.8, sink(-0.012), bend(2, 1, 0, 1), ANGRY),
  key(1.05, OPEN_EYES),
]);

/** Must recharge: spent after the huge move, it hangs its head with its arms dangling, panting heavily, unable to move. */
export const recharge = clip('recharge', [
  key(0),
  key(0.24, sink(-0.06), bend(16, 6, 2, 16), LIMP_ARMS, jaw(12), DROWSY),
  key(0.46, sink(-0.05), bend(12, 4, 2, 12), LIMP_ARMS, jaw(18), DROWSY),
  key(0.68, sink(-0.065), bend(17, 6, 2, 17), LIMP_ARMS, jaw(12), DROWSY),
  key(0.9, sink(-0.05), bend(12, 4, 2, 12), LIMP_ARMS, jaw(18), DROWSY),
  key(1.12, sink(-0.06), bend(15, 5, 2, 15), LIMP_ARMS, jaw(12), DROWSY),
  key(1.36, sink(-0.03), bend(6, 2, 0, 6), ELBOWS_OUT, jaw(6), DROWSY),
  key(1.7, OPEN_EYES),
]);

/** Woke up: it jolts awake from its slump, blinks, shakes the sleep out of its head and gets back on guard. */
export const wake = clip('wake', [
  key(0, sink(-0.06), bend(12, 5, 2, 18), LIMP_ARMS, MOUTH_SHUT, SHUT),
  snap(0.1, pelvis(0, 0.014), bend(-8, -5, -3, -12), FLINCH, SPLAY, jaw(14), OPEN_EYES),
  key(0.28, pelvis(0, 0.01), bend(-6, -4, -2, -8), ELBOWS_OUT, jaw(8), OPEN_EYES),
  key(0.4, sink(-0.02), bend(2, 1, 0, 2, 12, 6), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.52, sink(-0.02), bend(2, 1, 0, 2, -12, -6), ELBOWS_OUT, MOUTH_SHUT, SHUT),
  key(0.64, sink(-0.02), bend(2, 1, 0, 2, 8, 4), ELBOWS_OUT, MOUTH_SHUT, DROWSY),
  key(0.82, sink(-0.04), bend(8, 2, 0, 4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  key(1.02, sink(-0.02), bend(3, 1, 0, 1), ANGRY),
  key(1.3, OPEN_EYES),
]);

/**
 * Shook it off (thawed, came to its senses, free of a bind, a status healed):
 * a hard shake of its head and shoulders, a stamp, and back on guard with a
 * snort.
 */
export const shakeOff = clip('shake_off', [
  key(0),
  key(0.12, sink(-0.04), bend(8, 3, 0, 8), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.24, sink(-0.04), twist(10), bend(8, 3, 0, 8, -12, -7), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.36, sink(-0.04), twist(-10), bend(8, 3, 0, 8, 12, 7), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.48, sink(-0.04), twist(7), bend(8, 3, 0, 8, -8, -4), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.6, stepR(30), sink(-0.02), bend(4, 2, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
  snap(0.7, sink(-0.06), bend(8, 2, 0, 4), SUMO_GUARD, jaw(10), ANGRY),
  key(0.9, sink(-0.04), bend(6, 2, 0, 2), SUMO_GUARD, jaw(4), ANGRY),
  key(1.06, sink(-0.015), bend(2, 1, 0, 0), ANGRY),
  key(1.36, OPEN_EYES),
]);

/**
 * Broke free of the Poké Ball: it bursts back out with its fists pulled up,
 * shakes itself, stamps angrily, and roars with its arms raised up the front
 * in a narrow V, then brings them down the front and settles in its stance
 * (round the sides, the right arm went under our healthbox from our side).
 */
export const breakFree = clip('break_free', [
  key(0, sink(-0.07), bend(18, 6, 0, 16), CROSSED_LOW, MOUTH_SHUT, SHUT),
  snap(0.14, pelvis(0, 0.018), bend(-10, -6, -3, -14), FISTS_UP, FISTS, jaw(16), ANGRY),
  key(0.28, body(0, 0, 0, 0, -5), bend(-4, -2, 0, -6, -10, -6), ARMS_DOWN_FRONT, jaw(10), ANGRY),
  key(0.4, body(0, 0, 0, 0, 3), bend(-4, -2, 0, -6, 10, 6), ARMS_DOWN_FRONT, jaw(10), ANGRY),
  key(0.52, stepL(30), bend(4, 2, 0, 2), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  snap(0.62, sink(-0.06), bend(8, 2, 0, 4), ELBOWS_OUT, FISTS, MOUTH_SHUT, ANGRY),
  key(0.75, pelvis(0, 0.004), bend(-4, -3, -2, -8), ARMS_RISING, jaw(12), ANGRY),
  key(0.87, pelvis(0, 0.01), bend(-10, -6, -4, -16), ARMS_ROAR, jaw(24), ANGRY),
  key(1.05, pelvis(0, 0.012), bend(-11, -6, -4, -17, 5, 3), ARMS_ROAR, jaw(26), ANGRY),
  key(1.19, pelvis(0, -0.01), bend(2, 1, 0, -4), ARMS_DOWN_FRONT, jaw(8), ANGRY),
  key(1.35, sink(-0.02), bend(2, 1, 0, -2), jaw(6), ANGRY),
  key(1.65, OPEN_EYES),
]);

/** The rain keeps falling: a Water type in its element, it turns its face up into it, arms opened, eyes happily shut, bobbing. */
export const weatherRain = clip('weather_rain', [
  key(0),
  key(0.2, pelvis(0, 0.012), bend(-6, -4, -3, -12), ARMS_RISING, jaw(10), HAPPY),
  key(0.42, pelvis(0, 0.02), bend(-10, -6, -4, -20), OPEN_UP, SPLAY, jaw(16), HAPPY),
  key(0.6, sink(-0.02), bend(-8, -5, -4, -18, 4, 3), OPEN_UP, SPLAY, jaw(18), HAPPY),
  key(0.78, pelvis(0, 0.02), bend(-10, -6, -4, -20, -4, -3), OPEN_UP, SPLAY, jaw(16), HAPPY),
  key(0.96, sink(-0.02), bend(-6, -4, -3, -14, 2, 1), OPEN_UP, SPLAY, jaw(12), HAPPY),
  key(1.16, sink(-0.01), bend(-2, -1, 0, -4), ARMS_DOWN_FRONT, jaw(6), HAPPY),
  key(1.5, OPEN_EYES),
]);

/** The sunlight is strong: it squints and raises a hand to shade its eyes, peering at the foe from under it. */
export const weatherSun = clip('weather_sun', [
  key(0),
  key(0.2, pelvis(0, 0.008), bend(-4, -2, 0, -8), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.42, sink(-0.01), bend(2, 1, 0, 2), SHADE_R, MOUTH_SHUT, SQUINT),
  key(0.64, sink(-0.012), bend(2, 1, 0, 2, 5, 2), SHADE_R, MOUTH_SHUT, NARROW),
  key(0.86, sink(-0.012), bend(2, 1, 0, 2, -5, -2), SHADE_R, MOUTH_SHUT, NARROW),
  key(1.04, sink(-0.008), bend(1, 0, 0, 0), ELBOWS_OUT, NARROW),
  key(1.35, OPEN_EYES),
]);

/** The sandstorm rages: it braces low, a shoulder turned into the wind, shielding its eyes behind its forearm. */
export const weatherSand = clip('weather_sand', [
  key(0),
  key(0.18, sink(-0.04), bend(8, 3, 0, 8), ELBOWS_OUT, MOUTH_SHUT, SQUINT),
  key(0.38, sink(-0.06), twist(-14), bend(10, 4, 2, 12, 10), SHIELD_EYES, MOUTH_SHUT, SQUINT),
  key(0.6, sink(-0.062), twist(-15), bend(11, 4, 2, 13, 12, 2), SHIELD_EYES, MOUTH_SHUT, SQUINT),
  key(0.82, sink(-0.06), twist(-13), bend(10, 4, 2, 12, 8, -2), SHIELD_EYES, MOUTH_SHUT, SQUINT),
  key(1.02, sink(-0.03), bend(4, 2, 0, 4), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(1.35, OPEN_EYES),
]);

/** The hail keeps falling: it flinches as the stones strike, hunching down with its forearms over its bowed head. */
export const weatherHail = clip('weather_hail', [
  key(0),
  snap(0.1, sink(-0.04), bend(10, 4, 2, 14), ARMS_OVER_HEAD, MOUTH_SHUT, SQUINT),
  key(0.26, sink(-0.06), bend(14, 5, 2, 18, 4, 3), ARMS_OVER_HEAD, MOUTH_SHUT, HURT),
  snap(0.36, sink(-0.07), bend(16, 6, 2, 20, -4, -3), ARMS_OVER_HEAD, MOUTH_SHUT, SQUINT),
  key(0.54, sink(-0.065), bend(15, 5, 2, 19, 3, 2), ARMS_OVER_HEAD, MOUTH_SHUT, HURT),
  key(0.74, sink(-0.03), bend(6, 2, 0, 6), ELBOWS_OUT, MOUTH_SHUT, ANGRY),
  key(1.1, OPEN_EYES),
]);

export const SITUATION_CLIPS = [
  idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome, statusSleep, statusPoison, statusBurn, statusParalysis,
  statusFreeze, statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped, idleAsleep, idleTired, statUp,
  statDown, levelUp, drained, healed, focus, hangOn, flinch, recharge, wake, shakeOff, breakFree, weatherRain, weatherSun,
  weatherSand, weatherHail,
];
