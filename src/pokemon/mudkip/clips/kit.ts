// Mudkip's clip kit: the key helpers, the reusable deltas every clip is
// built from, and its travel: a crouch back onto its haunches, a bounding
// pounce with all four feet off the ground (the front paws reaching, the
// hind legs kicking out behind), the front paws landing first, and a bouncy
// hop home. Clips are STANCE + deltas (see compose()).
//
// Channels:
//   advance  0..1   how far toward the foe a contact move has travelled
//                   (1: in front of it, at striking distance: the blow itself
//                   closes the gap, the head or body lunging in with root.z)
//   root     model-unit offset/rotation of the whole body, in heights (bounds,
//            lunges, rolls; root.pitch + tips it nose down)
//   pelvis   the whole body over its four feet (a crouch, a lean in or back)
//   plantFeet / plantFront   foot IK: all four feet, or the front paws alone
//            (plantFront 0 frees the front paws: rearing, pawing, pouncing)
//   expression   eye atlas cell (open, angry, half, happy, closed, focus, hurt)
// Events: impact, release, releaseEnd, charge, cry, aura, emit, shrink, dig.
//
// How Mudkip moves (the brief in index.ts): a 7.6 kg pup that is mostly
// head, light and bouncy on four short legs. It fights with its big head
// (rams, butts, a crown smash), its wide mouth (water, mud, cries), its
// front paws (stamps, mud) and its tail fin (slaps), low to the ground. The
// field is five or six of its own heights across, so it gets to the foe in
// bounding pounces, each a couple of heights long, and bounces home in two
// hops. The head fin (a radar) and the tail fin wobble on springs after
// everything. The head, jaw and fin trail the body by 0.045 s (index.ts
// overlap), so head-led events sit ~0.04 s after their key.

import type { Clip, ClipEvent, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose, Vec3 } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, drops). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });
/** A clip from its keys (the last at its duration) and events. */
export const clip = (name: string, keys: Keyframe[], events: [number, string][] = [], loop = false): Clip => ({
  name,
  duration: keys[keys.length - 1].t,
  ...(loop ? { loop: true } : {}),
  keys,
  events: events.map(([t, n]): ClipEvent => ({ t, name: n })),
});

// Expressions -----------------------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const FOCUS: Pose = { expression: 'focus' };
export const HAPPY: Pose = { expression: 'happy' };
export const SHUT: Pose = { expression: 'closed' };
export const DROWSY: Pose = { expression: 'half' };
export const HURT: Pose = { expression: 'hurt' };
export const OPEN_EYES: Pose = { expression: 'open' };

// The body ----------------------------------------------------------------------

/** Jaw relative to the stance's shut smile: jaw(34) opens it wide. */
export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The front half's pitch: spine (from the hips: the chest dips or rises and
 * the front legs bend or straighten to stay planted), neck and head, with
 * the head's turn (y) and tilt (z).
 */
export const bend = (spine: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The hips tip forward (+): the hind legs swing back and push; the tail rises. */
export const hips = (deg: number): Pose => ({ bones: { hips: { x: deg } } });
/** Tail fin: raised (+x) and swung toward its left (+y). */
export const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });
/** Head fin: tipped forward (+x) at the foe, turned (y). */
export const fin = (x: number, y = 0): Pose => ({ bones: { fin: { x, y } } });
/**
 * Keeps the head fin upright while the head tips back: from our side a fin
 * thrown back with the head points at the camera and the head reads as a
 * round stub. A post rotation about the model's X axis at the fin's base,
 * about 90% of the spine + neck + head back-pitch.
 */
export const finUp = (deg: number): Pose => ({ post: { fin: { x: deg } } });
/** The whole body moved (heights) and turned (degrees). */
export const body = (x: number, y: number, z: number, pitch = 0, roll = 0, yaw = 0): Pose => ({ root: { x, y, z, pitch, roll, yaw } });
/** Upper-body twist (+ turns the chest and head toward its left). */
export const twist = (deg: number): Pose => ({ bones: { spine: { y: deg } } });

/** The ram: the hind legs drive, the spine and head go down so the crown and fin lead. */
export const RAM = (push: number): Pose => compose(
  pelvis(0, 0.002 * push, 0.026 * push),
  hips(12 * push),
  bend(14 * push, 10 * push, 24 * push),
  tail(-18 * push),
);
/** Rocked back onto its haunches (a recoil, a rear), head up; the fin kept upright. */
export const REAR = (k: number): Pose => compose(
  pelvis(0, 0.004 * k, -0.016 * k),
  hips(-4 * k),
  bend(-14 * k, -3 * k, -8 * k),
  finUp(22 * k),
  tail(16 * k),
);

// Legs -------------------------------------------------------------------------------

/** The front legs (both), aimed: shoulder to elbow, elbow to paw. */
export const front = (arm: Vec3, forearm: Vec3): Pose => ({
  aim: { armL: { dir: arm }, forearmL: { dir: forearm }, armR: { dir: arm }, forearmR: { dir: forearm } },
});
/** One front leg aimed (the other keeps its given shape). */
export const frontOne = (side: 'L' | 'R', arm: Vec3, forearm: Vec3): Pose => ({
  aim: { [`arm${side}`]: { dir: arm }, [`forearm${side}`]: { dir: forearm } },
});
/** The stance's front legs, straight down (aimed, for keys that aim them). */
export const FRONT_DOWN = front([0, -0.982, -0.188], [0, -1, 0]);
/** Front paws reaching forward (a pounce, a landing). */
export const FRONT_REACH = front([0, -0.55, 0.83], [0, -0.35, 0.94]);
/** Front paws tucked up under the chest (in the air, curled). */
export const FRONT_TUCK = front([0, -0.4, 0.92], [0, -0.95, -0.3]);
/** Front paws raised high in front (rearing up). */
export const FRONT_UP = front([0, 0.1, 0.99], [0, -0.45, 0.89]);
/** Front paws stamped down and forward (onto the foe, or the ground in front). */
export const FRONT_STAMP = front([0, -0.8, 0.6], [0, -0.97, 0.24]);
/** One front paw raised (the other down): pawing, swiping. */
export const pawUp = (side: 'L' | 'R'): Pose => frontOne(side, [0, -0.62, 0.78], [0, -0.85, 0.52]);
/** One front paw raking back through the mud. */
export const pawBack = (side: 'L' | 'R'): Pose => frontOne(side, [0, -0.9, -0.44], [0, -0.8, -0.6]);
/** Hind legs kicked out behind (the push of a pounce). */
export const HIND_KICK: Pose = { bones: { thighL: { x: 50 }, thighR: { x: 50 }, shinL: { x: -10 }, shinR: { x: -10 } } };
/** Hind legs drawn up under the body (in the air). */
export const HIND_TUCK: Pose = { bones: { thighL: { x: -30 }, thighR: { x: -30 }, shinL: { x: 40 }, shinR: { x: 40 } } };

/** Crouched back on its haunches, coiled to spring (the wind-up of a pounce). */
export const COIL: Pose = compose(pelvis(0, -0.045, -0.03), hips(-8), bend(8, 4, 10), tail(18));
/** In the air: all four feet off the ground, front paws reaching, hind legs trailing. */
export const AIRBORNE: Pose = compose({ plantFeet: 0, plantFront: 0 }, FRONT_REACH, HIND_KICK);
/** Curled in the air: all four feet tucked (the top of a hop). */
export const TUCKED: Pose = compose({ plantFeet: 0, plantFront: 0 }, FRONT_TUCK, HIND_TUCK);
/** Landing: the front paws take it first, the body pitched forward, a squash. */
export const LAND: Pose = compose({ plantFeet: 1, plantFront: 1 }, pelvis(0, -0.035, 0.01), bend(6, 2, 4), FRONT_DOWN);

/** In the air on the way (advance a), `y` heights up, pitched `pitch` (+ nose down). */
export const flying = (a: number, y: number, pitch = 0): Pose => compose({ advance: a, root: { y, pitch } }, AIRBORNE);
/** Landed at advance a (1: at the foe). */
export const landed = (a = 1): Pose => compose({ advance: a }, LAND);
/** At the foe, lunging `z` heights further in, pitched `pitch` (+ nose down). */
export const atFoe = (z = 0, pitch = 0): Pose => ({ advance: 1, root: { z, pitch } });

/**
 * Bouncing home from the foe: two light hops (the first high, the second
 * lower), curled at the top of each, landing on its front paws.
 */
export const hopHome = (t: number, ...upper: Pose[]): Keyframe[] => [
  key(t, { advance: 0.75, root: { y: 0.34, pitch: -6 } }, TUCKED, ...upper),
  key(t + 0.12, { advance: 0.5 }, LAND, ...upper),
  key(t + 0.24, { advance: 0.25, root: { y: 0.24, pitch: -4 } }, TUCKED, ...upper),
  key(t + 0.36, { advance: 0 }, LAND, ...upper),
];
