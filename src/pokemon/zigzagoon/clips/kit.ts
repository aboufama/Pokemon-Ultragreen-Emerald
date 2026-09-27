// Zigzagoon's clip kit: the key helpers, the deltas every clip is built
// from, and its travel (the zigzag scamper to the foe and back). Keys are
// STANCE + deltas (see compose()).
//
// Channels used here:
//   pelvis    both body roots together (Hips: the hind legs, rump and tail;
//             Spine1: the chest, front legs, neck and head): the body
//             crouching, leaning and rocking over its planted paws
//   spine     the front half's pitch (+ down, - rearing up), hips the rear
//             half's (+ rump up) and yaw (+ swings the rump to its right)
//   plantFeet / plantFront   foot IK: every paw is pinned where the stance
//             puts it (rig.ts plantAt); 0 frees the hind legs / the front
//             legs (they are then posed: the front legs aimed, the hind legs
//             swung with bone rotations, since their joints' axes don't run
//             along the bones)
//   root      the whole body: hops (y), the zigzag (x), lunges (z), spins
//   advance   0 at home .. 1 in front of the foe
//   expression               eye atlas cell (EXPRESSIONS below)
//
// How it moves: light and quick, restless and curious. It strikes in 3-5
// frames, rebounds off what it hits and shakes its head; the rump and the
// tail answer every move (the tail ripples out on its overlap and bounces
// on springs); its ears lay back when it attacks and prick up when it
// cries. It never runs straight: it goes to the foe and back in zigzag
// bounds, darting one way then the other with its body angled into each
// dart (its name, and the Pokédex's zigzag footprints).

import type { Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose, Vec3 } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (sinking, dropping). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Expressions (eye atlas cells) --------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const FIERCE: Pose = { expression: 'fierce' };
export const HAPPY: Pose = { expression: 'happy' };
export const SHUT: Pose = { expression: 'closed' };
export const DROWSY: Pose = { expression: 'half' };
export const HURT: Pose = { expression: 'hurt' };
export const OPEN_EYES: Pose = { expression: 'open' };

/** Eye atlas (pm0263_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  fierce: [1, 2],
  hurt: [0, 3],
};

// Body deltas ---------------------------------------------------------------------

/** Pelvis offset from the stance (heights): y up, z toward the foe, x its left. */
export const pelvis = (y: number, z = 0, x = 0): Pose => ({ pelvis: { x, y, z } });
/** Front half, neck and head pitch (+ down, - up), with the head's turn and tilt. */
export const bend = (spine: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The front half turning (+ toward its left) over its paws, and rolling (+ its left shoulder up). */
export const turn = (spine: number, roll = 0): Pose => ({ bones: { spine: { y: spine, z: roll } } });
/** Rear half: x raises the rump, y swings it (+ to its right, - further to its left). */
export const rump = (x: number, y = 0): Pose => ({ bones: { hips: { x, y } } });
/** Tail: x raises it, y swings it (+ to its right); x2/y2 bend its middle. */
export const tail = (x: number, y = 0, x2 = 0, y2 = 0): Pose => ({ bones: { tail: { x, y }, tail2: { x: x2, y: y2 } } });
export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
/** Ears: + pricked forward, - laid back; spread tips them out to the sides. */
export const ears = (x: number, spread = 0): Pose => ({ bones: { earL: { x, z: -spread }, earR: { x, z: spread } } });
export const scale = (s: number): Pose => ({ scale: s });
/** The whole body: x its left, y up, z toward the foe (heights); yaw, pitch (+ nose down), roll (+ its left side up). */
export const body = (x: number, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0): Pose => ({ root: { x, y, z, yaw, pitch, roll } });
export const at = (advance: number): Pose => ({ advance });

// Legs ------------------------------------------------------------------------------
// The front legs are aimed; keys that don't lift them keep the stance's aims
// (elbows bent back, which only seed the foot IK) and the IK plants the paws.

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both front legs aimed: the left's upper and lower directions, mirrored for the right. */
export const frontLegs = (arm: Vec3, forearm: Vec3, armR: Vec3 = mirror(arm), forearmR: Vec3 = mirror(forearm)): Pose => ({
  plantFront: 0,
  aim: { armL: { dir: arm }, forearmL: { dir: forearm }, armR: { dir: armR }, forearmR: { dir: forearmR } },
});

/** On all fours: the paws planted (the stance's aims only seed the elbows' bend). */
export const FRONT_DOWN: Pose = { plantFront: 1, aim: structuredClone(STANCE.aim) };
/** Front paws off the ground, reaching out ahead: a shove, a pounce. */
export const PAWS_FORWARD = frontLegs([0.12, -0.42, 0.9], [0.06, -0.3, 0.95]);
/** Reared up on its haunches, the front paws held up in front of the chest. */
export const PAWS_UP = frontLegs([0.14, -0.4, 0.9], [0.04, -0.8, 0.6]);
/** Both front paws dug in and drawn back under the chest (scooping). */
export const PAWS_DIG = frontLegs([0.1, -0.9, -0.42], [0.05, -0.85, 0.52]);
/** Both front paws flung forward and up (what they scooped leaves them). */
export const PAWS_FLING = frontLegs([0.12, -0.05, 0.99], [0.06, 0.45, 0.89]);
/** Front paws tucked up under the chest (in the air). */
export const PAWS_TUCK = frontLegs([0.1, -0.55, -0.83], [0.04, -0.1, 0.99]);
/** Front paws stretched out ahead, reaching for the ground (landing from a bound). */
export const PAWS_REACH = frontLegs([0.1, -0.6, 0.8], [0.05, -0.75, 0.66]);
/** Front paws spread wide to the sides (a cry, a stretch, a flourish). */
export const PAWS_WIDE = frontLegs([0.75, -0.35, 0.56], [0.55, 0.2, 0.81]);
/** Front paws raised over its head as high as its short legs go (a cheer, a guard). */
export const PAWS_HIGH = frontLegs([0.3, 0.1, 0.95], [0.2, 0.7, 0.69]);
/** Front paws crossed over its face (shielding its eyes). */
export const PAWS_FACE = frontLegs([0.05, -0.1, 0.99], [-0.6, 0.55, 0.58], [-0.05, -0.1, 0.99], [0.6, 0.62, 0.5]);
/** Front paws hugged in under the chest (curled up). */
export const PAWS_HUG = frontLegs([0.05, -0.6, 0.8], [-0.55, -0.1, 0.83], [-0.05, -0.6, 0.8], [0.55, -0.1, 0.83]);

/** Reared up, the right paw cocked out beside its head, the left held low. */
export const SWIPE_COCKED: Pose = frontLegs([0.2, -0.45, 0.87], [-0.1, -0.3, 0.95], [-0.85, 0.12, 0.5], [-0.62, 0.62, 0.48]);
/** The swipe carried through: the right paw across and low, claws past the foe. */
export const SWIPE_DOWN: Pose = frontLegs([0.22, -0.5, 0.84], [0, -0.45, 0.89], [0.3, -0.3, 0.9], [0.85, -0.3, 0.43]);
/** ... the left paw cocked out beside its head, the right low (the mirror). */
export const SWIPE_COCKED_L: Pose = frontLegs([0.85, 0.12, 0.5], [0.62, 0.62, 0.48], [-0.2, -0.45, 0.87], [0.1, -0.3, 0.95]);
/** ... the left paw carried across and low. */
export const SWIPE_DOWN_L: Pose = frontLegs([-0.3, -0.3, 0.9], [-0.85, -0.3, 0.43], [-0.22, -0.5, 0.84], [0, -0.45, 0.89]);

/**
 * Drumming: one paw swung out beside its head, the other beating its belly
 * (`right`: the right paw beats).
 */
export const drum = (right: boolean): Pose => {
  const out: [Vec3, Vec3] = [[0.85, 0.08, 0.52], [0.55, 0.6, 0.58]];
  const beat: [Vec3, Vec3] = [[0.12, -0.45, 0.88], [-0.45, -0.55, 0.7]];
  const [r, l] = right ? [beat, out] : [out, beat];
  return frontLegs(l[0], l[1], mirror(r[0]), mirror(r[1]));
};

/**
 * Hind legs, off the ground (plantFeet 0): swung (+ back, - forward under the
 * belly) and folded at the hock (+ the paw tucked up behind).
 */
export const hind = (swingL: number, foldL: number, swingR = swingL, foldR = foldL): Pose => ({
  plantFeet: 0,
  bones: { thighL: { x: swingL }, shinL: { x: foldL }, thighR: { x: swingR }, shinR: { x: foldR } },
});
/** Hind legs gathered up under the belly (the top of a bound). */
export const HIND_TUCK = hind(-30, 40);
/** Hind legs stretched out behind (pushing off, the stretch of a bound). */
export const HIND_KICK = hind(45, -10);

/** In the air, gathered: every paw tucked up. */
export const AIR: Pose[] = [HIND_TUCK, PAWS_TUCK];
/** In the air, stretched: front paws reaching ahead, hind legs kicked out behind. */
export const STRETCH: Pose[] = [HIND_KICK, PAWS_REACH];
/** Landing: every paw down, the body sinking into it. */
export const LANDED: Pose[] = [{ plantFeet: 1 }, FRONT_DOWN, pelvis(-0.03)];

/**
 * Curled round to its left like a sleeping raccoon: the front half and the
 * neck turned in toward its tail (it lies on paws tucked where it stands:
 * from the foe's side, anything laid out in front of its paws goes under our
 * healthbox).
 */
export const CURL: Pose = { bones: { spine: { y: 24 }, neck: { y: 14 } } };
/** Lying curled up asleep (Rest, sleep): front half turned in, rump round, tail round it, eyes shut. */
export const ASLEEP: Pose[] = [pelvis(-0.105, -0.05), bend(-5, -2, -6, 26, -12), CURL, rump(-10, -24), tail(-14, -50, -6, -18), ears(-22), FRONT_DOWN, SHUT];

// Travel -----------------------------------------------------------------------------

/** How far each dart of the zigzag swings to the side (heights). */
export const ZIG = 0.34;

/**
 * Mid-dart, in the air: the body angled into the dart (`side` +1 darts to its
 * left, -1 to its right): the front half turned toward it, the rump swinging
 * out the other way, the tail streaming behind, ears back, paws tucked.
 */
export const dart = (side: number, lift = 0.07): Pose[] => [
  { root: { y: lift } },
  turn(12 * side),
  rump(-4, 16 * side),
  tail(-8, 18 * side, 0, 8 * side),
  ears(-26),
  ...AIR,
];

/** A touch-down between darts, at `x` sideways: paws down, the body sinking. */
export const touch = (x: number, side: number): Pose[] => [
  { root: { x } },
  turn(6 * side),
  rump(0, 8 * side),
  tail(4, 10 * side),
  ears(-20),
  ...LANDED,
];

/**
 * The zigzag scamper to the foe, from `t0` (its last key at home) to `t1`
 * (landing in front of the foe, the key the clip writes itself): bounds that
 * dart left, then right, then in. `extra` deltas ride on every key (the
 * expression, a head held low...). Returns the keys strictly between.
 */
export function zigzagIn(t0: number, t1: number, extra: Pose[] = [], lift = 0.07): Keyframe[] {
  const d = (t1 - t0) / 6;
  return [
    key(t0 + d, at(0.17), body(ZIG * 0.45), ...dart(1, lift), ...extra),
    key(t0 + 2 * d, at(0.36), ...touch(ZIG, 1), ...extra),
    key(t0 + 3 * d, at(0.52), body(0), ...dart(-1, lift * 1.1), ...extra),
    key(t0 + 4 * d, at(0.7), ...touch(-ZIG, -1), ...extra),
    key(t0 + 5 * d, at(0.86), body(-ZIG * 0.4), ...dart(1, lift * 0.8), ...extra),
  ];
}

/**
 * Scampering home from the foe, from `t0` (its last key at the foe) to `t1`
 * (landing at home, the key the clip writes): two bounds back, darting out to
 * one side and back in, still facing the foe.
 */
export function zigzagHome(t0: number, t1: number, extra: Pose[] = [], lift = 0.06): Keyframe[] {
  const d = (t1 - t0) / 4;
  return [
    key(t0 + d, at(0.74), body(ZIG * 0.5), ...dart(1, lift), ...extra),
    key(t0 + 2 * d, at(0.46), ...touch(ZIG * 0.8, 1), ...extra),
    key(t0 + 3 * d, at(0.2), body(ZIG * 0.3), ...dart(-1, lift * 0.9), ...extra),
  ];
}
