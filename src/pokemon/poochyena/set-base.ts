// Poochyena's clips: the helpers and reusable deltas every clip is built
// from, in the style of the first clips (src/pokemon/blaziken/first.ts):
// a key is the stance plus a few named deltas, so each clip reads like a
// shot list.
//
// Channels used here:
//   advance  0..1   how far toward the foe a contact move has travelled
//   root     the whole body (a leap's arc in root.y, spins in root.yaw,
//                   a dive or a belly-flop in root.pitch), in its heights
//   plantFeet       the paws pinned with IK (1: all four stand where the
//                   stance puts them; 0: the legs are free, it is airborne);
//                   plantFront overrides it for the forepaws (rearing up),
//                   plantLeft / plantRight for each hind paw (a scratch)
//   expression      the eye atlas cell (open, angry, half, closed, happy, hurt)
//
// How a hyena pup moves (the brief in index.ts): it is light (13.6 kg) and
// quick, all nerve. It pounces to the foe in one springing arc with its body
// stretched out straight (the stance's hindquarters, swung off to its left,
// come into line in the air and swing out again as it lands), lands on all
// fours in front of the foe and strikes with its jaws, its head and
// shoulders, a forepaw or its whole weight, then bounds home backwards,
// still facing the foe. Its hackles bristle and its brush of a tail flicks up
// when it attacks; it cringes (ears flat, tail tucked) when struck.
//
// The rig: the front legs are the arm chain (arm, forearm, hand = the
// forepaw) hanging from the chest; the hind legs (thigh, shin, the long hind
// foot) and the tail hang from the hips; the hackles are the fur tufts along
// its back. Its bones point along their own +Y, and `bones` rotations are in
// model axes (+X its left, +Y up, +Z forward): x + swings a hanging leg's
// paw back, tips the neck and head forward, lowers the chest (spine) and
// raises what points back (the tail, the hackles).

import type { Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: the stance plus deltas (bone rotations and offsets add up, the rest replaces). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Expressions (the eye atlas, set.ts) ----------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const SHUT: Pose = { expression: 'closed' };
export const DROWSY: Pose = { expression: 'half' };
export const HAPPY: Pose = { expression: 'happy' };
export const HURT: Pose = { expression: 'hurt' };
export const OPEN_EYES: Pose = { expression: 'open' };

// Body parts -------------------------------------------------------------------

/** The jaw from the stance's bared fangs: + gapes (36 is wide), - shuts it. */
export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
/** Pelvis offset (heights): y crouches (-) or rises, z leans forward (+) or sits back (-) over the planted paws. */
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
export const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
export const advance = (a: number): Pose => ({ advance: a });
/**
 * The spine chain's pitch from the waist to the head: spine + lowers the
 * chest (the forepaws take it), chest and neck + carry the head forward and
 * down, head + tips the nose down; headY turns the head to its left, headZ
 * tilts it.
 */
export const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The shoulders twisted (+ turns the chest to its left, bringing the right shoulder forward). */
export const twist = (y: number): Pose => ({ bones: { spine: { y: y * 0.6 }, chest: { y: y * 0.4 } } });
/** Ears: + pricked forward at the foe, - laid flat back. */
export const ears = (deg: number): Pose => ({ bones: { earL: { x: deg }, earR: { x: deg } } });
/** The hackles along its back and flanks: + bristling up, - smoothed flat. */
export const hackles = (deg: number): Pose => ({
  bones: { mane: { x: deg }, maneB: { x: deg * 0.8 }, furL: { x: deg * 0.5 }, furR: { x: deg * 0.5 }, hipFurL: { x: deg * 0.4 }, hipFurR: { x: deg * 0.4 } },
});
/** The brush of a tail: lift + raises it (- tucks it), sweep + swings it to its right; the springs carry the rest. */
export const tail = (lift: number, sweep = 0): Pose => ({
  bones: { tail: { x: lift * 0.55, y: sweep * 0.5 }, tail2: { x: lift * 0.25, y: sweep * 0.3 }, tail3: { x: lift * 0.2, y: sweep * 0.2 } },
});

/** Both forelegs from the shoulder: arm + swings the paw back, forearm and hand + fold them back. */
export const fore = (arm: number, forearm = 0, hand = 0): Pose => ({
  bones: { armL: { x: arm }, armR: { x: arm }, forearmL: { x: forearm }, forearmR: { x: forearm }, handL: { x: hand }, handR: { x: hand } },
});
/** The right foreleg alone (the near one from our side). */
export const foreR = (arm: number, forearm = 0, hand = 0, out = 0): Pose => ({
  bones: { armR: { x: arm, z: -out }, forearmR: { x: forearm }, handR: { x: hand } },
});
/** The left foreleg alone. */
export const foreL = (arm: number, forearm = 0, hand = 0, out = 0): Pose => ({
  bones: { armL: { x: arm, z: out }, forearmL: { x: forearm }, handL: { x: hand } },
});
/** Both hind legs: thigh + swings the paw back, shin and foot + fold them. */
export const hind = (thigh: number, shin = 0, foot = 0): Pose => ({
  bones: { thighL: { x: thigh }, thighR: { x: thigh }, shinL: { x: shin }, shinR: { x: shin }, footL: { x: foot }, footR: { x: foot } },
});

// Travel -------------------------------------------------------------------------

/** The hindquarters brought into line behind it (the stance swings them off to its left): leaping straight. */
export const STRAIGHT: Pose = { bones: { hips: { y: 50 } } };
/** Airborne and stretched out long: forelegs reaching for the foe, hind legs trailing from the push. */
export const FLY: Pose = compose({ plantFeet: 0 }, STRAIGHT, fore(-50, -12, -8), hind(48, 18, 28));
/** Airborne and gathered: all four legs folded up under it. */
export const TUCK: Pose = compose({ plantFeet: 0 }, STRAIGHT, fore(22, 68, 26), hind(-36, 46, -8));
/** Coming down: forelegs reaching down ahead for the ground, hind legs swinging under. */
export const REACH: Pose = compose({ plantFeet: 0 }, STRAIGHT, fore(-30, -6, 4), hind(-12, 12, 6));
/** A small bound (home): the legs drawn up a little, the hindquarters as they stand. */
export const HOP: Pose = compose({ plantFeet: 0 }, fore(14, 34, 12), hind(-18, 22, 0));
/** Landing on all fours: the legs take the weight, the chest dips. */
export const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 6 }, head: { x: -4 } } };
/** Rearing up on the hind legs: the chest and forepaws lift off the ground over planted hind paws. */
export const REAR = (deg: number): Pose => compose({ plantFront: 0 }, pelvis(0, 0.01, -0.03), { bones: { spine: { x: -deg }, hips: { x: -deg * 0.3 } } });
