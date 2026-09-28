// Swampert's clips for the actions its first clips (./first.ts) had none
// for, made in their style with their helpers: Iron Tail, Mega Kick and
// Stomp, Rollout and Ice Ball, Swagger and Attract play these, named after
// their motifs. Heavy as the first clips have it: low hops, deep landings.

import type { Clip } from '../../anim/clip';
import type { Pose, Vec3 } from '../../anim/rig';
import {
  ANGRY, ARMS_FWD_SPREAD, ARMS_TUCKED, ARMS_WIDE, CURL, HOP, LAND, MOUTH_SHUT, NARROW, OPEN_EYES, SHUT, SQUINT, TUCK,
  arms, bend, jaw, key, sink, snap, twist,
} from './first';

/** The tail club: + raises it, - swings it down and through. */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });

/** Standing on its left leg, the right knee hauled up high (the stomp loading). */
const KNEE_UP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -62 }, shinR: { x: 50 } } };
/** The right foot driven down and forward onto the foe. */
const STOMP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -20 }, shinR: { x: 12 } } };

/** How high the curled ball's middle sits above its feet (heights). */
const BALL_MID = 0.28;
/** Curled into a ball: knees drawn in, the head tucked, the back rounded, arms wrapped round the knees. */
const BALL: Pose[] = [
  { plantFeet: 0, bones: { thighL: { x: -70 }, thighR: { x: -70 }, shinL: { x: 90 }, shinR: { x: 90 } } },
  bend(30, 14, 6, 26),
  arms([0.45, -0.7, 0.55], [-0.45, -0.35, 0.82], [-0.65, -0.1, 0.75]),
];
/**
 * The ball at advance `a`, rolled to `deg`: the root rides at the ball's
 * middle and the body hangs BALL_MID below it, so root.pitch rolls it about
 * its middle, not its feet.
 */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_MID + lift, z, pitch: deg } }, ...BALL, { pelvis: { y: -BALL_MID } }, MOUTH_SHUT, SHUT,
];

/** The right hand held out to the foe, palm up; the left fist at its side. */
const RIGHT_OUT: [Vec3, Vec3, Vec3] = [[-0.3, -0.2, 0.93], [-0.05, 0.35, 0.94], [0, 0.6, 0.8]];
const BECKON = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.35, 0.4, 0.85], RIGHT_OUT);

/**
 * Iron Tail: a coil, then a heavy hop in that turns its back to the foe; the
 * tail club whips down and through it as the turn carries on round; it lands
 * deep, swings back round and hops home.
 */
const ironTail: Clip = {
  name: 'tail',
  duration: 1.95,
  keys: [
    key(0),
    // Coil, the shoulders turning away.
    key(0.24, sink(-0.07), twist(16), bend(8, 2, 0, 6), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(10)),
    // A heavy hop in, turning its back to the foe, the tail rising.
    key(0.42, { advance: 0.6, root: { y: 0.07, yaw: 100 } }, TUCK, bend(6, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(22)),
    key(0.56, { advance: 1, root: { y: 0.04, yaw: 168 } }, TUCK, bend(4, 2, 0, 0), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(28)),
    // The whip: down and through the foe, the turn carrying on.
    snap(0.66, { advance: 1, root: { y: 0.02, yaw: 198 } }, LAND, bend(-4, -2, 0, 0), ARMS_TUCKED, MOUTH_SHUT, SQUINT, tail(-55)),
    key(0.78, { advance: 1, root: { yaw: 212 } }, LAND, sink(-0.06), bend(-4, -2, 0, 0), ARMS_TUCKED, MOUTH_SHUT, SQUINT, tail(-60)),
    // Swinging back round to face the foe.
    key(0.94, { advance: 0.86, root: { y: 0.05, yaw: 300 } }, HOP, bend(2, 0, 0, 0), ARMS_TUCKED, ANGRY, tail(-12)),
    key(1.08, { advance: 0.8, root: { yaw: 360 } }, LAND, bend(8, 2, 0, 2), ANGRY, tail(0)),
    // Hop home.
    key(1.3, { advance: 0.4, root: { y: 0.06, yaw: 360 } }, HOP, ANGRY),
    key(1.46, { advance: 0, root: { yaw: 360 } }, LAND, ANGRY),
    key(1.95, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'impact' }],
};

/**
 * Mega Kick, Stomp: a coil and a heavy hop in; at the foe it rears up onto
 * its left leg, hauls its right knee up high, arms out for balance, and
 * stamps the foot down onto the foe with its whole weight; it holds it there,
 * steps back down and hops home.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.85,
  keys: [
    key(0),
    // Coil.
    key(0.22, sink(-0.07), bend(10, 4, 2, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // A heavy hop in.
    key(0.4, { advance: 0.7, root: { y: 0.07 } }, TUCK, bend(6, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    key(0.52, { advance: 1 }, LAND, bend(8, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Rears up on the left leg, the right knee hauled high.
    key(0.66, { advance: 1 }, KNEE_UP_R, bend(-10, -4, 0, -6), ARMS_WIDE, jaw(10), ANGRY),
    key(0.74, { advance: 1 }, KNEE_UP_R, bend(-12, -5, 0, -8, 0, 2), ARMS_WIDE, jaw(12), ANGRY),
    // The stomp: down onto the foe with its whole weight.
    snap(0.84, { advance: 1, root: { pitch: 6 } }, STOMP_R, sink(-0.04, 0.02), bend(14, 4, 0, 8), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    key(0.96, { advance: 1, root: { pitch: 6 } }, STOMP_R, sink(-0.05, 0.02), bend(15, 4, 0, 9, 0, -2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    // Steps back down.
    key(1.12, { advance: 1 }, LAND, bend(8, 2, 0, 2), ANGRY),
    // Hop home.
    key(1.3, { advance: 0.45, root: { y: 0.06 } }, HOP, ANGRY),
    key(1.46, { advance: 0 }, LAND, ANGRY),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.86, name: 'impact' }],
};

/**
 * Rollout, Ice Ball: it curls up into a ball and rolls at the foe over and
 * over along the ground, bowls into it and grinds against it, rolls back
 * home and uncurls.
 */
const spin: Clip = {
  name: 'spin',
  duration: 2.1,
  keys: [
    key(0),
    // Curling down.
    key(0.2, sink(-0.08), bend(16, 6, 2, 14), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // Rolling at the foe.
    key(0.34, ...ball(0, 30)),
    key(0.5, ...ball(0.3, 220)),
    key(0.64, ...ball(0.66, 420)),
    key(0.74, ...ball(0.9, 560)),
    // Bowls into it and grinds.
    snap(0.8, ...ball(1, 640, 0.3)),
    key(0.9, ...ball(1, 656, 0.3)),
    // Rolls back home.
    key(1.02, ...ball(0.84, 600, 0.1, 0.05)),
    key(1.18, ...ball(0.46, 420)),
    key(1.34, ...ball(0.1, 190)),
    key(1.44, ...ball(0, 90)),
    // Uncurls.
    key(1.58, { advance: 0, root: { pitch: 0 } }, LAND, sink(-0.06), bend(10, 4, 2, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    key(1.78, sink(-0.03), bend(4, 1, 0, 0, 6, 4), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.82, name: 'impact' }],
};

/**
 * Swagger, Attract: chest puffed out and head up, it holds a hand out to the
 * foe and beckons twice, smug, then drops back into its stance.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    key(0.24, sink(0.01), bend(-8, -6, -2, -10, 0, 8), BECKON, jaw(6), ANGRY),
    snap(0.4, sink(0.012), bend(-9, -6, -2, -6, 0, 10), BECKON, CURL, NARROW),
    key(0.54, sink(0.01), bend(-8, -6, -2, -10, 0, 8), BECKON, NARROW),
    snap(0.66, sink(0.012), bend(-9, -6, -2, -6, 0, 10), BECKON, CURL, NARROW),
    key(0.9, sink(0.01), bend(-8, -6, -2, -9, 4, 9), BECKON, jaw(10), NARROW),
    key(1.16, sink(-0.02), bend(4, 1, 0, 0), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/** The clips for the actions the first clips had none for, by the motif they show. */
export const MORE_CLIPS: Record<string, Clip> = Object.fromEntries([ironTail, kick, spin, charm].map((c) => [c.name, c]));
