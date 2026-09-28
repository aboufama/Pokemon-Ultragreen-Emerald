// Mudkip's clips for the actions its moves take beyond the category clips
// (./set.ts), named after their motifs and made with the same helpers, each
// from the first clip of Swampert's that does that action
// (src/pokemon/swampert/first.ts, more.ts): its guard, glare, burrow, rest,
// scoop and fling, sand kick, afterimage hops, wave, chop, stomp, tail club,
// roll and swagger, in a small, springy body. Contact clips pounce to the foe
// in one arc, strike its body, and hop home.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, COIL, DROP, DROWSY, FOCUS, FRONT_UP, HAPPY, HOP, LAND, LAND_HOME, LEAP, OPEN_EYES, SHUT, SQUEEZE, TUCK,
  bend, fall, fin, front, hind, hips, jaw, key, paw, pelvis, snap, tail,
} from './set';

/**
 * Protect, Endure, Substitute, Defense Curl, Mirror Coat (shield): after
 * Swampert's guard. It hunkers down low behind its crown with its head
 * tucked and its eyes squeezed shut, the tail fin swung up over its back,
 * and braces there (a moving hold, sinking a little), then lets go.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.03, -0.012), bend(4, 2, 6), tail(8), ANGRY),
    snap(0.3, pelvis(0, -0.07, -0.03), hips(-4), bend(8, 6, 14), fin(6), tail(30, 10), SQUEEZE),
    key(0.46, pelvis(0, -0.074, -0.033), hips(-4), bend(9, 6, 15, 0, 1), fin(6), tail(32, 10), SQUEEZE),
    key(0.8, pelvis(0, -0.08, -0.036), hips(-5), bend(9, 6, 16, 0, -1), fin(7), tail(33, 12), SQUEEZE),
    key(1.0, pelvis(0, -0.045, -0.016), bend(5, 3, 8), fin(3), tail(14, 4), ANGRY),
    key(1.2, pelvis(0, -0.02), bend(2, 1, 2), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'aura' }],
};

/**
 * Foresight, Mimic (glare): after Swampert's glare. The fin on its head is
 * its radar: it leans in low with narrowed eyes, face up at the foe, and
 * tips the fin forward at it, peering one way and the other.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.4,
  keys: [
    key(0),
    key(0.24, pelvis(0, -0.035, 0.03), bend(6, 2, -6, 0, 5), fin(22), tail(6), FOCUS),
    key(0.42, pelvis(0, -0.04, 0.035), bend(7, 2, -6, -6, 7), fin(26), tail(8), FOCUS),
    key(0.72, pelvis(0, -0.045, 0.04), bend(8, 3, -6, 6, 4), fin(24), tail(6), FOCUS),
    key(0.96, pelvis(0, -0.02, 0.01), bend(3, 1, -2), fin(6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'emit' }],
};

/**
 * Dig, Dive (burrow): after Swampert's dive into the ground as into water. It
 * rocks back, springs up and plunges in head first with its front paws
 * together ahead of it (dig: dirt, or a splash for Dive), the tail fin going
 * under last; swims over to the foe underground (the director heaves mounds,
 * or bubbles, along the way), then bursts up in front of it crown first
 * (impact as it clears the surface), comes down on its front paws, shakes
 * itself off and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.4,
  keys: [
    key(0),
    // Rocks back, the head drawn up (the wind-up before throwing itself forward).
    key(0.2, pelvis(0, -0.045, -0.04), hips(-4), bend(-6, -4, -8), tail(16), ANGRY),
    // The dive: a spring up, tipping forward, front paws reaching ahead.
    key(0.36, { advance: 0.06, root: { y: 0.16, pitch: 40 } }, LEAP, bend(6, 4, 10), tail(-6), ANGRY),
    // Plunges in head first (dig: the ground splashes up round it)...
    key(0.5, { advance: 0.1, root: { y: 0.1, pitch: 95 } }, LEAP, bend(6, 4, 10), tail(-10), SHUT),
    // ...and slides under, the tail fin last.
    key(0.66, { advance: 0.16, root: { y: -0.95, pitch: 105 } }, LEAP, bend(6, 4, 10), tail(-10), SHUT),
    // Underground (nothing to stand on): swims over to the foe, turning upright to come up.
    key(0.8, { advance: 0.45, root: { y: -1.3, pitch: 60 } }, TUCK, bend(6, 2, 4), ANGRY),
    key(0.98, { advance: 1, root: { y: -1.3 } }, TUCK, bend(10, 4, 8), ANGRY),
    // Bursts up in front of the foe crown first, front paws up.
    snap(1.14, { advance: 1, root: { y: 0.24, pitch: -8 } }, TUCK, FRONT_UP, bend(-8, -4, -12), jaw(20), tail(12), ANGRY),
    key(1.24, { advance: 0.97, root: { y: 0.27, pitch: -6 } }, TUCK, FRONT_UP, bend(-10, -4, -14), jaw(22), tail(14), ANGRY),
    // Comes down on its front paws in front of it, low, and shakes the dirt off.
    fall(1.4, { advance: 0.92 }, LAND, pelvis(0, -0.01, 0), bend(-2, 0, -4), jaw(4), ANGRY),
    key(1.5, { advance: 0.92 }, LAND, pelvis(0, -0.02, 0), bend(-1, 0, -3), ANGRY),
    key(1.64, { advance: 0.92 }, pelvis(0, -0.03), bend(2, 1, -2, 8, 5), tail(4, 10), ANGRY),
    key(1.76, { advance: 0.92 }, pelvis(0, -0.03), bend(2, 1, -2, -8, -5), tail(4, -10), ANGRY),
    // Hops home.
    key(1.9, { advance: 0.45, root: { y: 0.12 } }, HOP, ANGRY),
    key(2.04, { advance: 0 }, LAND_HOME, ANGRY),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'dig' }, { t: 1.1, name: 'impact' }],
};

/**
 * Rest, Refresh (heal): after Swampert's rest. It settles down onto its belly
 * like a sleeping pup, head bowed, eyes shut, the tail fin drooping round,
 * breathes slowly (a moving hold) while it recovers, then gets up and gives
 * itself a little shake.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.2,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.02, -0.01), bend(2, 1, 4), tail(-4), DROWSY),
    key(0.4, pelvis(0, -0.055, -0.02), hips(-2), bend(5, 3, 8, 0, -3), tail(-10, 6), DROWSY),
    key(0.64, pelvis(0, -0.078, -0.028), hips(-3), bend(8, 4, 11, 0, -6), tail(-16, 10), SHUT),
    // Slow breaths: the body rises and falls.
    key(0.96, pelvis(0, -0.07, -0.027), hips(-3), bend(6, 3, 9, 0, -5), tail(-15, 10), SHUT),
    key(1.28, pelvis(0, -0.08, -0.029), hips(-3), bend(8, 4, 11, 0, -7), tail(-16, 11), SHUT),
    key(1.58, pelvis(0, -0.071, -0.027), hips(-3), bend(6, 3, 9, 0, -5), tail(-15, 10), SHUT),
    // Gets up and shakes itself.
    key(1.76, pelvis(0, -0.03, -0.01), bend(2, 1, 2), tail(-4), DROWSY),
    key(1.88, pelvis(0.01, -0.02), bend(1, 0, -2, 8, 6), tail(4, 12), HAPPY),
    key(2.0, pelvis(-0.008, -0.015), bend(1, 0, -2, -7, -5), tail(4, -10), HAPPY),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.9, name: 'aura' }],
};

/**
 * Attract, Swagger (charm): after Swampert's swagger. It puffs its chest out
 * with its head up and tilted, happy-eyed, and wags its tail fin at the foe
 * twice, pleased with itself.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, pelvis(0, 0.008, -0.02), bend(-8, -2, -8, 0, 10), tail(8, 20), jaw(8), HAPPY),
    snap(0.36, pelvis(0, 0.01, -0.02), bend(-9, -2, -6, 0, 12), tail(10, -22), jaw(10), HAPPY),
    key(0.5, pelvis(0, 0.008, -0.02), bend(-8, -2, -8, 0, 10), tail(8, 20), jaw(8), HAPPY),
    snap(0.62, pelvis(0, 0.01, -0.02), bend(-9, -2, -6, 0, 12), tail(10, -22), jaw(10), HAPPY),
    key(0.86, pelvis(0, 0.008, -0.018), bend(-8, -2, -7, 4, 11), tail(6, 8), jaw(12), HAPPY),
    key(1.12, pelvis(0, -0.015), bend(3, 1, 0), tail(2), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

/**
 * Curled into a ball: legs tucked in tight, the head tucked down, the head fin
 * laid back and the tail fin arched over its back. Mudkip is mostly head, its
 * body behind it, so the ball is an egg about 0.63 of its height tall and
 * 0.86 long.
 */
const BALL: Pose[] = [
  { plantFeet: 0, plantFront: 0 },
  front([0, -0.1, 0.99], [0, -0.8, -0.6]),
  hind(-70, 100),
  bend(24, 12, 30),
  fin(-80),
  tail(62),
];
/** Where the curled ball's middle is over its feet (heights: up, forward; measured from its posed mesh). */
const BALL_MID = { y: 0.262, z: 0.243 };
/** How high its middle rides as it rolls: between its half height and half length, so it neither sinks nor floats much. */
const BALL_RIDE = 0.37;
/**
 * The ball at advance `a`, rolled to `deg`: the root rides at the ball's
 * middle and the body is set back and down by BALL_MID from it, so root.pitch
 * rolls it about its middle, not its feet (Swampert's Rollout).
 */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_RIDE + lift, z, pitch: deg } }, ...BALL, { pelvis: { y: -BALL_MID.y, z: -BALL_MID.z } }, SHUT,
];

/**
 * Rollout, Ice Ball (spin): after Swampert's roll. It curls up into a ball
 * and rolls at the foe over and over along the ground, bowls into it and
 * grinds against it, rolls back home and uncurls with a shake.
 */
const spin: Clip = {
  name: 'spin',
  duration: 1.9,
  keys: [
    key(0),
    // Curling down.
    key(0.16, pelvis(0, -0.06, -0.01), bend(10, 6, 14), tail(16), SQUEEZE),
    // Rolling at the foe (about 680° over the way there: it rolls, never skids).
    key(0.3, ...ball(0, 40)),
    key(0.44, ...ball(0.3, 243)),
    key(0.56, ...ball(0.64, 473)),
    key(0.66, ...ball(0.9, 648)),
    // Bowls into it and grinds.
    snap(0.72, ...ball(1, 716, 0.2)),
    key(0.82, ...ball(1, 730, 0.2)),
    // Rolls back home, unrolling as far.
    key(0.94, ...ball(0.84, 620, 0.05, 0.05)),
    key(1.08, ...ball(0.46, 363)),
    key(1.22, ...ball(0.1, 120)),
    key(1.32, ...ball(0, 52)),
    // Uncurls, and shakes itself.
    key(1.46, { advance: 0, root: { pitch: 0 } }, LAND, pelvis(0, -0.02, 0), bend(6, 2, 6), ANGRY),
    key(1.6, pelvis(0, -0.02), bend(2, 1, -2, 8, 5), tail(4, 10), ANGRY),
    key(1.72, pelvis(0, -0.015), bend(1, 0, -1, -6, -4), tail(4, -8), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/** Front paws dug into the mud ahead of it (scooping). */
const PAWS_DIG = front([0, -0.8, 0.6], [0, -0.95, 0.3]);
/** Front paws raked back under the chest with the load. */
const PAWS_RAKE = front([0, -0.95, -0.3], [0, -0.8, -0.6]);
/** Front paws flung forward and up at the foe. */
const PAWS_FLING = front([0, 0.5, 0.87], [0, 0.6, 0.8]);
/** The fling carries on up. */
const PAWS_HIGH = front([0, 0.72, 0.69], [0, 0.85, 0.53]);

/**
 * Mud-Slap (fling): after Swampert's two-handed scoop. It digs both front
 * paws into the mud ahead of it, rakes the load back under its chest, then
 * rears up and flings it forward and up into the foe's face with both paws
 * (release from the paws), and comes back down on them, shaking its head.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.4,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.02, 0.008), bend(4, 2, 2), ANGRY),
    // Digs both front paws into the mud ahead of it.
    key(0.24, { plantFront: 0 }, pelvis(0, -0.03, 0.02), bend(8, 4, 2), PAWS_DIG, tail(8), ANGRY),
    // Rakes the load back under its chest, the weight rocking back.
    key(0.42, { plantFront: 0 }, pelvis(0, -0.035, -0.02), hips(-3), bend(6, 3, 0), PAWS_RAKE, tail(14), ANGRY),
    // Rears up, the paws swinging forward...
    key(0.5, { plantFront: 0 }, pelvis(0, -0.02, -0.03), hips(-6), bend(-8, -2, -4), FRONT_UP, tail(12), ANGRY),
    // ...and flings it forward and up.
    snap(0.56, { plantFront: 0 }, pelvis(0, -0.01, -0.04), hips(-8), bend(-20, -4, -6), PAWS_FLING, jaw(10), tail(16), ANGRY),
    key(0.72, { plantFront: 0 }, pelvis(0, -0.008, -0.044), hips(-9), bend(-24, -4, -8), PAWS_HIGH, jaw(12), tail(18), ANGRY),
    // Comes down on its front paws and shakes its head.
    key(0.9, LAND, pelvis(0, 0.01, -0.01), bend(-2, 0, 2), jaw(4), ANGRY),
    key(1.04, pelvis(0, -0.02), bend(2, 1, 0, 6, 3), ANGRY),
    key(1.16, pelvis(0, -0.012), bend(1, 0, 0, -4, -2), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'release' }],
};

/** The right front paw lifted high, the knee up (about to paw the ground). */
const PAW_UP_R = paw('R', [0, -0.3, 0.95], [0, -0.75, 0.66]);
/** The right front paw raked far back along the ground. */
const PAW_BACK_R = paw('R', [0, -0.85, -0.53], [0, -0.7, -0.71]);
/** The right front paw flicked forward and up (the mud flying). */
const PAW_FLICK_R = paw('R', [0, 0.25, 0.97], [0, 0.45, 0.89]);
/** The left front leg straight down, standing on its spot while the right paws (free of the IK). */
const PAW_STAND_L = paw('L', [0, -0.982, -0.188], [0, -1, 0]);

/**
 * Mud Sport (kick_sand): after Swampert's sand kick. With its weight on its
 * other three feet it paws the ground twice with its right front paw like a
 * little bull, its head nodding down with each rake (its short legs hide
 * under its head: the nod carries the pawing from both sides), then flicks a
 * pawful forward at the foe with a toss of its head. (plantFront frees both
 * front paws: the left one stands straight on its aim, PAW_STAND_L, the body
 * where the stance holds it.)
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.012, -0.006), bend(6, 2, 4), tail(8), ANGRY),
    // Paws the ground twice: the paw up high with the head up, then raked back as the head nods down.
    key(0.24, { plantFront: 0 }, bend(2, 0, -6), PAW_STAND_L, PAW_UP_R, tail(14), ANGRY),
    key(0.34, { plantFront: 0 }, bend(6, 4, 10), PAW_STAND_L, PAW_BACK_R, tail(4), ANGRY),
    key(0.44, { plantFront: 0 }, bend(2, 0, -6), PAW_STAND_L, PAW_UP_R, tail(14), ANGRY),
    key(0.54, { plantFront: 0 }, bend(6, 4, 10), PAW_STAND_L, PAW_BACK_R, tail(4), ANGRY),
    // The flick: the paw swings forward and up, the head tossing up after it.
    snap(0.66, { plantFront: 0 }, bend(-4, -2, -10), PAW_STAND_L, PAW_FLICK_R, jaw(10), tail(16), ANGRY),
    key(0.8, { plantFront: 0 }, bend(-5, -2, -11), PAW_STAND_L, PAW_FLICK_R, jaw(10), tail(17), ANGRY),
    key(0.96, pelvis(0, -0.02), bend(2, 1, 0), jaw(2), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'emit' }],
};

/**
 * A quick darting hop (heights): up and across, leaning into it. Toward its
 * left it also goes back a little: as the foe, its left runs down the screen
 * toward the camera, and its feet went under the top of our healthbox.
 */
const dart = (x: number, y: number, roll: number): Pose => ({ root: { x, y, roll, z: -0.25 * Math.max(0, x) } });

/**
 * Double Team (afterimage): after Swampert's side-hops, light and quick:
 * darting hops from side to side on guard, low to the ground, the tail fin
 * flicking with each, then back home. Toward our healthbox (its right, from
 * our side) the hops are narrow. The afterimages start at the aura and run
 * 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.7,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.05, -0.01), bend(4, 0, -4), tail(10), FOCUS),
    key(0.22, dart(0.12, 0.08, -4), HOP, bend(2, 0, -4, 0, 3), tail(14, -18), FOCUS),
    key(0.32, dart(0.24, 0, -5), LAND, tail(8, -10), FOCUS),
    key(0.44, dart(0.06, 0.08, 4), HOP, bend(2, 0, -4, 0, -3), tail(14, 18), FOCUS),
    key(0.54, dart(-0.12, 0, 4), LAND, tail(8, 10), FOCUS),
    key(0.66, dart(0.05, 0.08, -4), HOP, bend(2, 0, -4, 0, 3), tail(14, -18), FOCUS),
    key(0.76, dart(0.2, 0, -5), LAND, tail(8, -10), FOCUS),
    key(0.88, dart(0.04, 0.07, 3), HOP, bend(2, 0, -4, 0, -3), tail(14, 16), FOCUS),
    key(0.98, dart(-0.1, 0, 3), LAND, tail(8, 8), FOCUS),
    key(1.1, dart(-0.05, 0.05, 0), HOP, tail(10), FOCUS),
    key(1.2, dart(0, 0, 0), LAND_HOME, ANGRY),
    key(1.4, pelvis(0, -0.02), bend(2, 1, 0), ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'aura' }],
};

/** Front paws raised high as it rears (raising a wave). */
const PAWS_RAISED = front([0, 0.4, 0.92], [0, 0.5, 0.87]);

/**
 * Surf (wave), and Whirlpool (erupt) and Rock Tomb (throw), which raise the
 * water or the rocks the same way: after Swampert's wave. It crouches low,
 * gathering, then rears up tall onto its haunches with its whole body, front
 * paws high, raising the wave, and comes down on it: the front paws slam
 * down and it pushes forward low (the wave rolls out from its feet).
 */
const wave: Clip = {
  name: 'wave',
  duration: 2.0,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.06, 0.01), bend(10, 4, 8), tail(-8), ANGRY),
    // Rearing up with its whole body...
    key(0.5, { plantFront: 0.4 }, pelvis(0, -0.03, -0.03), hips(-6), bend(-12, -2, -8), FRONT_UP, tail(10), jaw(8), ANGRY),
    // ...tall, the front paws high.
    key(0.68, { plantFront: 0 }, pelvis(0, -0.01, -0.05), hips(-12), bend(-30, -4, -10), PAWS_RAISED, tail(20), jaw(16), ANGRY),
    key(0.84, { plantFront: 0 }, pelvis(0, -0.008, -0.052), hips(-12), bend(-32, -4, -10, 0, 2), PAWS_RAISED, tail(22), jaw(18), ANGRY),
    // Comes down on it: the front paws slam down, pushing forward low.
    snap(0.98, LAND, pelvis(0, -0.01, 0.03), hips(6), bend(6, 2, 6), jaw(10), tail(-10), ANGRY),
    key(1.2, LAND, pelvis(0, -0.012, 0.035), hips(6), bend(7, 2, 7), jaw(8), tail(-12), ANGRY),
    key(1.46, pelvis(0, -0.025, 0.01), bend(3, 1, 1), jaw(2), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 1.0, name: 'release' }],
};

/**
 * Rock Smash (strike): after Swampert's chop, with its crown for the hand: it
 * pounces up high at the foe with its head drawn back, and as it comes down
 * on it smashes its crown down onto it like a hammer onto a boulder, sinking
 * into the blow; then it hops home.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, COIL, bend(-2, -2, -6), ANGRY),
    // The pounce, high, the head drawn back.
    key(0.3, { advance: 0.55, root: { y: 0.24, pitch: -4 } }, LEAP, bend(-4, -4, -12), tail(10), ANGRY),
    // Over the foe: the head cocked far back.
    key(0.42, { advance: 0.92, root: { y: 0.22 } }, TUCK, bend(-10, -6, -18), tail(16), ANGRY),
    // The smash: the crown driven down onto the foe as it drops.
    snap(0.5, { advance: 1, root: { y: 0.06, pitch: 14 } }, DROP, bend(14, 8, 22), fin(10), tail(-10), SQUEEZE),
    key(0.58, { advance: 1 }, LAND, pelvis(0, -0.01, 0.015), hips(6), bend(14, 6, 18), fin(8), tail(-14), SQUEEZE),
    key(0.72, { advance: 1 }, LAND, pelvis(0, -0.012, 0.016), hips(5), bend(13, 6, 17, 3), fin(8), tail(-12), SQUEEZE),
    // Rises and hops home.
    key(0.86, { advance: 1 }, pelvis(0, -0.035), bend(4, 2, -2, -5), ANGRY),
    key(1.0, { advance: 0.45, root: { y: 0.12 } }, HOP, ANGRY),
    key(1.14, { advance: 0 }, LAND_HOME, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

/** Front paws stamped forward and down onto the foe. */
const PAWS_STAMP = front([0, -0.6, 0.8], [0, -0.8, 0.6]);
/** Front paws raised high, reared up tall (loading the stamp). */
const PAWS_HIGH_REAR = front([0, 0.35, 0.94], [0, 0.2, 0.98]);

/**
 * Stomp (kick): after Swampert's stomp. A pounce in; at the foe it rears up
 * tall on its hind legs with its front paws raised high, and stamps them
 * down onto the foe with its whole weight, grinding, then drops back and
 * hops home.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.75,
  keys: [
    key(0),
    key(0.16, COIL, bend(-2, -2, -4), ANGRY),
    key(0.32, { advance: 0.6, root: { y: 0.18, pitch: 4 } }, LEAP, bend(0, -4, -8), tail(8), ANGRY),
    key(0.44, { advance: 1 }, LAND, ANGRY),
    // Rears up on its hind legs, the front paws rising...
    key(0.52, { advance: 1, plantFront: 0.5 }, pelvis(0, -0.02, -0.02), hips(-5), bend(-10, 2, 6), FRONT_UP, tail(-2), jaw(4), ANGRY),
    // ...raised high.
    key(0.62, { advance: 1, plantFront: 0 }, pelvis(0, 0, -0.04), hips(-12), bend(-30, 4, 16), FRONT_UP, tail(-6), jaw(8), ANGRY),
    key(0.7, { advance: 1, plantFront: 0 }, pelvis(0, 0.004, -0.045), hips(-14), bend(-34, 4, 18), PAWS_HIGH_REAR, tail(-8), jaw(10), ANGRY),
    // The stamp: down onto the foe with its whole weight.
    snap(0.8, { advance: 1, plantFront: 0, root: { pitch: 6 } }, pelvis(0, -0.03, 0.05), hips(6), bend(10, 4, 4), PAWS_STAMP, tail(-12), SQUEEZE),
    key(0.9, { advance: 1, plantFront: 0, root: { pitch: 6 } }, pelvis(0, -0.035, 0.055), hips(6), bend(11, 4, 5, 3), PAWS_STAMP, tail(-12), SQUEEZE),
    // Drops back onto its feet and hops home.
    key(1.06, { advance: 1 }, LAND, ANGRY),
    key(1.22, { advance: 0.45, root: { y: 0.12 } }, HOP, ANGRY),
    key(1.36, { advance: 0 }, LAND_HOME, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.82, name: 'impact' }],
};

/**
 * Iron Tail (tail): after Swampert's tail club. A coil, then a springing leap
 * in that turns its back to the foe, the tail fin raised high; the fin whips
 * down onto the foe like a club as the turn carries on round; it lands,
 * swings back round to face it and hops home.
 */
const ironTail: Clip = {
  name: 'tail',
  duration: 1.8,
  keys: [
    key(0),
    key(0.18, COIL, bend(-2, -2, -6), ANGRY),
    // The leap, turning its back to the foe, the tail fin swinging up high over its back.
    key(0.34, { advance: 0.55, root: { y: 0.2, yaw: 90 } }, TUCK, bend(0, -2, -6), tail(34), ANGRY),
    key(0.46, { advance: 1, root: { y: 0.18, yaw: 168, pitch: -8 } }, TUCK, hips(-6), bend(-2, -2, -6), tail(58), ANGRY),
    // The slam: the rump tips up and the fin comes down on the foe like a club, the turn carrying on.
    snap(0.54, { advance: 1, root: { y: 0.1, yaw: 194, pitch: 16 } }, DROP, hips(10), bend(6, 2, -8), tail(-42), SQUEEZE),
    key(0.64, { advance: 1, root: { yaw: 206 } }, LAND, hips(12), bend(2, 0, -6), tail(-48), SQUEEZE),
    // Swinging back round to face the foe.
    key(0.8, { advance: 0.86, root: { y: 0.1, yaw: 300 } }, HOP, tail(-10), ANGRY),
    key(0.92, { advance: 0.8, root: { yaw: 360 } }, LAND, tail(0), ANGRY),
    // Hop home.
    key(1.1, { advance: 0.4, root: { y: 0.12, yaw: 360 } }, HOP, ANGRY),
    key(1.24, { advance: 0, root: { yaw: 360 } }, LAND_HOME, ANGRY),
    key(1.8, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.59, name: 'impact' }],
};

/** The clips for the actions beyond the category clips, by the motif they show. */
export const MOTIF_CLIPS: Record<string, Clip> = Object.fromEntries(
  [shield, glare, burrow, heal, charm, spin, fling, kickSand, afterimage, wave, strike, kick, ironTail].map((c) => [c.name, c]),
);
