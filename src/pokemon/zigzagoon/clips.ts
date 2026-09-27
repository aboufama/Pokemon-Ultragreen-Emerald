// Zigzagoon's battle animation set: a tiny raccoon on four short legs with a
// big bushy zigzag tail. Keys are STANCE + deltas (see compose()).
//
// Channels used here:
//   pelvis    both body roots together (Hips: the hind legs, rump and tail;
//             Spine1: the chest, front legs, neck and head): the body
//             crouching, leaning and rocking over its planted paws
//   spine     the front half's pitch (+ down, - rearing up), hips the rear
//             half's (+ rump up) and yaw (+ swings the rump to its right)
//   plantFeet / plantFront   foot IK: every paw is pinned where the stance
//             puts it (rig.ts plantAt); 0 frees a leg (the front paws lift
//             to shove, swipe, scoop and drum; then they are aimed)
//   expression               eye atlas cell (EXPRESSIONS below)
// Events: impact, release, releaseEnd, charge, emit, aura, cry, shrink.
//
// Acting in place: no clip travels or leaps (advance 0, the root on its
// spot). In the compiled game the game moves the sprite (Tackle's lunge,
// Headbutt's bow, Tail Whip's sway, Sand-Attack's slide) and the body
// follows it; each clip is the acting on top, timed to the game's own motion
// for the moves Zigzagoon uses most (data/battle_anim_scripts.s): the shove
// lands with Tackle's lunge, the wag swings with Tail Whip's sway, the scoop
// flings as Sand-Attack's slide returns.
//
// How it moves: light and quick, it strikes in 3-5 frames, rebounds off what
// it hits and shakes its head; the rump and the tail answer every move (the
// tail ripples out on its overlap and bounces on springs); its ears lay back
// when it attacks and prick up when it cries.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (sinking, dropping). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -------------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FIERCE: Pose = { expression: 'fierce' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };

/** Pelvis offset from the stance (heights): y up, z toward the foe, x its left. */
const pelvis = (y: number, z = 0, x = 0): Pose => ({ pelvis: { x, y, z } });
/** Front half, neck and head pitch (+ down, - up), with the head's turn and tilt. */
const bend = (spine: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The front half turning (+ toward its left) over its paws. */
const turn = (spine: number): Pose => ({ bones: { spine: { y: spine } } });
/** Rear half: x raises the rump, y swings it (+ to its right, - further to its left). */
const rump = (x: number, y = 0): Pose => ({ bones: { hips: { x, y } } });
/** Tail: x raises it, y swings it (+ to its right); x2/y2 bend its middle. */
const tail = (x: number, y = 0, x2 = 0, y2 = 0): Pose => ({ bones: { tail: { x, y }, tail2: { x: x2, y: y2 } } });
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
/** Ears: + pricked forward, - laid back; spread tips them out to the sides. */
const ears = (x: number, spread = 0): Pose => ({ bones: { earL: { x, z: -spread }, earR: { x, z: spread } } });
const scale = (s: number): Pose => ({ scale: s });

// Front legs. Keys that lift the front paws aim both legs; on all fours they
// keep the stance's aims (elbows bent back, which only seed the foot IK) and
// the IK plants the paws on their spots.

/** On all fours: the paws planted (the stance's aims only seed the elbows' bend). */
const FRONT_DOWN: Pose = { plantFront: 1, aim: structuredClone(STANCE.aim) };

/** Front paws off the ground, reaching out ahead: a shove, a pounce. */
const PAWS_FORWARD: Pose = {
  plantFront: 0,
  aim: {
    armL: { dir: [0.12, -0.42, 0.9] }, forearmL: { dir: [0.06, -0.3, 0.95] },
    armR: { dir: [-0.12, -0.42, 0.9] }, forearmR: { dir: [-0.06, -0.3, 0.95] },
  },
};

/** Reared up on its haunches, the front paws held up in front of the chest. */
const PAWS_UP: Pose = {
  plantFront: 0,
  aim: {
    armL: { dir: [0.14, -0.4, 0.9] }, forearmL: { dir: [0.04, -0.8, 0.6] },
    armR: { dir: [-0.14, -0.4, 0.9] }, forearmR: { dir: [-0.04, -0.8, 0.6] },
  },
};

/** Both front paws dug in and drawn back under the chest (scooping). */
const PAWS_DIG: Pose = {
  plantFront: 0,
  aim: {
    armL: { dir: [0.1, -0.9, -0.42] }, forearmL: { dir: [0.05, -0.85, 0.52] },
    armR: { dir: [-0.1, -0.9, -0.42] }, forearmR: { dir: [-0.05, -0.85, 0.52] },
  },
};

/** Both front paws flung forward and up (the sand leaves them). */
const PAWS_FLING: Pose = {
  plantFront: 0,
  aim: {
    armL: { dir: [0.12, -0.05, 0.99] }, forearmL: { dir: [0.06, 0.45, 0.89] },
    armR: { dir: [-0.12, -0.05, 0.99] }, forearmR: { dir: [-0.06, 0.45, 0.89] },
  },
};

/**
 * Curled round to its left like a sleeping raccoon: the front half and the
 * neck turned in toward its tail (it lies on paws tucked where it stands:
 * from the foe's side, anything laid out in front of its paws goes under our
 * healthbox).
 */
const CURL: Pose = { bones: { spine: { y: 24 }, neck: { y: 14 } } };

// Its legs are short and set low under a big fluffy body: a paw raised
// straight up disappears into the fur. Paws that act reach out to the side
// and forward, where both views see them beside the head.

/** Reared up, the right paw cocked out beside its head, the left held low. */
const SWIPE_COCKED: Pose = {
  plantFront: 0,
  aim: {
    armR: { dir: [-0.85, 0.12, 0.5] }, forearmR: { dir: [-0.62, 0.62, 0.48] },
    armL: { dir: [0.2, -0.45, 0.87] }, forearmL: { dir: [-0.1, -0.3, 0.95] },
  },
};

/** The swipe carried through: the right paw across and low, claws past the foe. */
const SWIPE_DOWN: Pose = {
  plantFront: 0,
  aim: {
    armR: { dir: [0.3, -0.3, 0.9] }, forearmR: { dir: [0.85, -0.3, 0.43] },
    armL: { dir: [0.22, -0.5, 0.84] }, forearmL: { dir: [0, -0.45, 0.89] },
  },
};

/**
 * Drumming: one paw swung out beside its head, the other beating its belly
 * (`right`: the right paw beats).
 */
const drum = (right: boolean): Pose => {
  const out: [Vec3, Vec3] = [[0.85, 0.08, 0.52], [0.55, 0.6, 0.58]];
  const beat: [Vec3, Vec3] = [[0.12, -0.45, 0.88], [-0.45, -0.55, 0.7]];
  const [r, l] = right ? [beat, out] : [out, beat];
  const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
  return {
    plantFront: 0,
    aim: { armR: { dir: mirror(r[0]) }, forearmR: { dir: mirror(r[1]) }, armL: { dir: l[0] }, forearmL: { dir: l[1] } },
  };
};

// Clips -----------------------------------------------------------------------

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
 * Tackle (and the weak tackles: Facade, Secret Power): a quick coil onto the
 * haunches, then it shoves at the foe forehead first, its whole body behind
 * it and the front paws off the ground, as the game lunges the sprite; it
 * rebounds and shakes its head.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.95,
  keys: [
    key(0, FRONT_DOWN),
    // Coil: weight back onto the haunches (the rump sits down), head tucked, ears back.
    key(0.04, pelvis(-0.035, -0.04), rump(-6), bend(2, 5, 8), tail(8), ears(-20), FRONT_DOWN, ANGRY),
    // The shove: the hind legs drive the rump up and the body and forehead at
    // the foe, the front paws off the ground, the tail streaming back.
    snap(0.1, pelvis(-0.005, 0.085), rump(10), bend(-12, 10, 22), tail(-14), ears(-40), PAWS_FORWARD, FIERCE),
    key(0.19, pelvis(-0.007, 0.08), rump(9), bend(-11, 11, 24, 0, 3), tail(-16), ears(-38), PAWS_FORWARD, FIERCE),
    // Rebound off the foe: the paws land, the head comes up.
    key(0.35, pelvis(-0.02, -0.02), rump(-2), bend(-4, -5, -10), tail(14), ears(-10), FRONT_DOWN, ANGRY),
    // Shakes it off.
    key(0.5, pelvis(-0.012), bend(0, 0, 1, 0, 8), ears(-4), FRONT_DOWN, ANGRY),
    key(0.62, bend(0, 0, 0, 0, -6), FRONT_DOWN, ANGRY),
    key(0.74, bend(0, 0, 0, 0, 3), FRONT_DOWN, ANGRY),
    key(0.95, FRONT_DOWN, OPEN_EYES),
  ],
  // The head trails the body by its overlap: the forehead lands just after the shove.
  events: [{ t: 0.15, name: 'impact' }],
};

/**
 * The big pounce (Double-Edge, Flail, Return, Frustration, Body Slam): it
 * crouches with the rump up and the haunches wiggling, launches forward with
 * the front paws out, and comes down on the foe head first; it bounces back
 * and shakes it off.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.5,
  keys: [
    key(0, FRONT_DOWN),
    // Crouch low, rump up, eyes on the foe.
    key(0.16, pelvis(-0.05, -0.05), rump(10, 6), bend(5, 2, 0), tail(14, 8), ears(-24), FRONT_DOWN, FIERCE),
    // The haunches wiggle.
    key(0.26, pelvis(-0.055, -0.055), rump(11, -8), bend(5, 2, 0), tail(16, -10), ears(-26), FRONT_DOWN, FIERCE),
    key(0.36, pelvis(-0.06, -0.06), rump(12, 6), bend(6, 3, 1), tail(16, 10), ears(-28), FRONT_DOWN, FIERCE),
    // Launch: everything drives forward and up, the front paws reach out.
    snap(0.46, pelvis(0.005, 0.08), rump(-8), bend(-12, 4, 6), tail(-10), ears(-40), PAWS_FORWARD, FIERCE),
    // Slam: the front paws land on their spots and the front half comes
    // down onto the foe, forehead first.
    snap(0.56, pelvis(-0.03, 0.07), rump(-4), bend(2, 10, 16), tail(-14), ears(-40), FRONT_DOWN, SHUT),
    key(0.66, pelvis(-0.032, 0.066), rump(-4), bend(3, 11, 18, 0, 3), tail(-14), ears(-40), FRONT_DOWN, SHUT),
    // Bounces back off the foe.
    key(0.84, pelvis(-0.03, 0.0), rump(4), bend(-4, -2, -6), tail(10), ears(-12), FRONT_DOWN, ANGRY),
    // Shakes it off.
    key(1.0, pelvis(-0.02), bend(1, 0, 2, 0, 7), ears(-6), FRONT_DOWN, ANGRY),
    key(1.14, bend(0, 0, 1, 0, -5), FRONT_DOWN, ANGRY),
    key(1.5, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 0.61, name: 'impact' }],
};

/**
 * Headbutt: the game bows the sprite back and then drives it forward. It
 * rears back onto its haunches with its chin up, then swings its forehead
 * down and forward into the foe, eyes shut, rebounds and shakes its head.
 */
const headbutt: Clip = {
  name: 'headbutt',
  duration: 1.05,
  keys: [
    key(0),
    // Rear back: weight onto the haunches, the head raised, chin up.
    key(0.1, pelvis(-0.02, -0.045), bend(-12, -10, -18), rump(-4), tail(12), ears(8), ANGRY),
    key(0.16, pelvis(-0.025, -0.05), bend(-14, -12, -20), rump(-5), tail(14), ears(10), ANGRY),
    // The butt: the head swings down and forward, forehead first.
    snap(0.23, pelvis(-0.015, 0.05), bend(-8, 12, 26), rump(4), tail(-4), ears(-36), SHUT),
    key(0.31, pelvis(-0.017, 0.046), bend(-7, 13, 28, 0, 3), rump(4), tail(-5), ears(-36), SHUT),
    // Rebound, and a shake of the head.
    key(0.5, pelvis(-0.015), bend(-2, -2, -6, 4), tail(6), ears(-8), ANGRY),
    key(0.64, pelvis(-0.01), bend(0, 0, 2, -5, 5), ANGRY),
    key(0.78, bend(0, 0, 1, 3, -3), ANGRY),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.28, name: 'impact' }],
};

/**
 * Covet, Thief, Cut, Rock Smash, Fury Cutter (strike): it rears onto its
 * haunches, the front half twisted back and the right paw cocked out beside
 * its head, then unwinds and swipes the paw across at the foe, dropping back
 * onto all fours behind it.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.0,
  keys: [
    key(0, FRONT_DOWN),
    // Rear up and turn the right shoulder back, the paw cocked out beside the head.
    key(0.14, pelvis(-0.02, -0.04), bend(-22, 10, 12, 10), turn(-12), rump(-8), tail(8), ears(-10), SWIPE_COCKED, ANGRY),
    key(0.22, pelvis(-0.022, -0.045), bend(-25, 11, 13, 13), turn(-15), rump(-9), tail(10), ears(-12), SWIPE_COCKED, ANGRY),
    // The swipe: the front half unwinds and the paw sweeps across at the foe.
    snap(0.3, pelvis(-0.03, 0.04), bend(-8, 6, 8, -10), turn(14), rump(-2), tail(-4), ears(-26), SWIPE_DOWN, FIERCE),
    key(0.42, pelvis(-0.032, 0.036), bend(-6, 6, 8, -12), turn(17), rump(-2), tail(-5), ears(-24), SWIPE_DOWN, FIERCE),
    // Down on all fours again.
    key(0.6, pelvis(-0.02, 0.01), bend(2, 2, 2, -3), turn(3), tail(4), ears(-8), FRONT_DOWN, ANGRY),
    key(1.0, FRONT_DOWN, OPEN_EYES),
  ],
  // The paw trails the arm by its overlap.
  events: [{ t: 0.37, name: 'impact' }],
};

/**
 * Water Pulse and other spat shots (spit): a quick breath with the chin up,
 * then the head snaps forward and the shot leaves its open mouth; the head
 * bobs back up.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.1,
  keys: [
    key(0),
    key(0.2, pelvis(0.006, -0.025), bend(-6, -8, -14), rump(-3), tail(14, 0, 4), ears(10), jaw(4), ANGRY),
    snap(0.3, pelvis(-0.025, 0.04), bend(3, 8, 0), rump(6), tail(-6), ears(-16), jaw(26), FIERCE),
    key(0.44, pelvis(-0.015, 0.02), bend(2, 4, -5), rump(3), tail(4), ears(-10), jaw(14), FIERCE),
    key(0.62, pelvis(-0.005, 0.005), bend(0, 1, 1), jaw(2), ANGRY),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'release' }],
};

/**
 * Pin Missile: it bristles (hunched, tail and fur up) and fires three
 * volleys, a jolt of the whole body and a snap of the head at each, as the
 * game sends its three needles.
 */
const pinMissile: Clip = {
  name: 'pin_missile',
  duration: 1.2,
  keys: [
    key(0),
    key(0.07, pelvis(-0.03, -0.02), bend(4, 4, 8), rump(6), tail(16, 0, 8), ears(-24), FIERCE, scale(1.02)),
    snap(0.13, pelvis(-0.018, 0.035), bend(0, 5, 2), rump(8), tail(20, 0, 10), ears(-30), jaw(16), FIERCE, scale(1.03)),
    key(0.24, pelvis(-0.03, -0.015), bend(4, 4, 8), rump(6), tail(16, 0, 8), ears(-26), jaw(2), FIERCE, scale(1.02)),
    snap(0.35, pelvis(-0.018, 0.035), bend(0, 5, 2, 4), rump(8, 3), tail(20, 4, 10), ears(-30), jaw(16), FIERCE, scale(1.03)),
    key(0.46, pelvis(-0.03, -0.015), bend(4, 4, 8), rump(6), tail(16, 0, 8), ears(-26), jaw(2), FIERCE, scale(1.02)),
    snap(0.57, pelvis(-0.016, 0.04), bend(0, 6, 1, -4), rump(8, -3), tail(21, -4, 10), ears(-32), jaw(18), FIERCE, scale(1.03)),
    key(0.7, pelvis(-0.02, 0.02), bend(1, 4, 3), rump(6), tail(14, 0, 6), ears(-22), jaw(4), FIERCE, scale(1.01)),
    key(0.9, pelvis(-0.01), bend(0, 1, 1), tail(6), ears(-8), ANGRY, scale(1)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.15, name: 'release' }, { t: 0.37, name: 'release' }, { t: 0.59, name: 'release' }],
};

/**
 * Strong ranged moves (Ice Beam, Shadow Ball, Hidden Power, Blizzard,
 * Surf...): it draws a deep breath with its chest up and its tail raised,
 * then braces low on all fours and fires from its open mouth, the face level
 * toward the foe and the head sweeping; it shakes it off.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    key(0.14, pelvis(-0.02), bend(3, 2, 6), tail(4), ears(-6)),
    // Gathering: chest up, head back, breathing in; the tail rises.
    key(0.5, pelvis(0.008, -0.035), bend(-8, -10, -16), rump(4), tail(16, 0, 6), ears(10), SHUT, scale(1.02)),
    key(0.64, pelvis(0.01, -0.04), bend(-9, -11, -17, 0, 2), rump(4), tail(18, 0, 7), ears(12), SHUT, scale(1.03)),
    // Fire: braced low, the head thrust forward, the mouth wide.
    snap(0.76, pelvis(-0.05, 0.035), bend(3, 8, -6), rump(-2), tail(-4), ears(-24), jaw(30), FIERCE, scale(1)),
    // Sustained, the head sweeping a little.
    key(0.98, pelvis(-0.045, 0.03), bend(3, 7, -5, 5), rump(-2), tail(-4), ears(-24), jaw(28), FIERCE),
    key(1.2, pelvis(-0.05, 0.034), bend(3, 8, -6, -4, -2), rump(-2), tail(-5), ears(-24), jaw(30), FIERCE),
    key(1.42, pelvis(-0.045, 0.03), bend(3, 7, -5, 3, 1), rump(-2), tail(-4), ears(-24), jaw(28), FIERCE),
    key(1.6, pelvis(-0.047, 0.032), bend(3, 7, -6), rump(-2), tail(-4), ears(-22), jaw(27), FIERCE),
    // The mouth shuts and the head shakes it off.
    key(1.78, pelvis(-0.02), bend(0, -2, -6, 6), tail(4), ears(-8), jaw(4), ANGRY),
    key(1.92, pelvis(-0.01), bend(0, -1, -3, -6), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.82, name: 'release' }, { t: 1.64, name: 'releaseEnd' }],
};

/**
 * Belly Drum (and Sleep Talk): it sits up on its haunches and drums its
 * belly with its front paws, right, left, then faster, as the game beats
 * the drum; the aura rises and it drops back onto all fours.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.55,
  keys: [
    key(0, FRONT_DOWN),
    // Sit up (the game's first beat bounces it up).
    key(0.14, pelvis(-0.02, -0.05), bend(-32, 12, 16), turn(0), rump(-10), tail(6), ears(8), PAWS_UP, ANGRY),
    // Drum with the game's beats (frames 16, 31, 38, 45, 52). Each beat
    // bounces the body (the game shakes the sprite on every beat) and brings
    // that shoulder forward, so the beats read from behind too.
    key(0.27, pelvis(-0.036, -0.05), bend(-29, 12, 18, 5), turn(-7), rump(-9), tail(4), ears(4), drum(true), ANGRY),
    key(0.39, pelvis(-0.018, -0.05), bend(-33, 12, 16), turn(0), rump(-10), tail(8), ears(8), PAWS_UP, ANGRY),
    key(0.52, pelvis(-0.036, -0.05), bend(-29, 12, 18, -5), turn(7), rump(-9), tail(4), ears(4), drum(false), FIERCE),
    key(0.575, pelvis(-0.022, -0.05), bend(-32, 12, 16), turn(0), rump(-10), tail(7), ears(6), PAWS_UP, FIERCE),
    key(0.63, pelvis(-0.036, -0.05), bend(-29, 12, 18, 5), turn(-7), rump(-9), tail(4), ears(4), drum(true), FIERCE),
    key(0.69, pelvis(-0.022, -0.05), bend(-32, 12, 16), turn(0), rump(-10), tail(7), ears(6), PAWS_UP, FIERCE),
    key(0.75, pelvis(-0.036, -0.05), bend(-29, 12, 18, -5), turn(7), rump(-9), tail(4), ears(4), drum(false), FIERCE),
    key(0.81, pelvis(-0.022, -0.05), bend(-32, 12, 16), turn(0), rump(-10), tail(7), ears(6), PAWS_UP, FIERCE),
    key(0.87, pelvis(-0.036, -0.05), bend(-29, 12, 18, 5), turn(-7), rump(-9), tail(4), ears(4), drum(true), FIERCE),
    // Pumped up: chest out, the aura rising.
    key(1.0, pelvis(-0.018, -0.05), bend(-36, 8, 10), turn(0), rump(-11), tail(12, 0, 4), ears(12), PAWS_UP, FIERCE, scale(1.03)),
    // Back down on all fours.
    fall(1.24, pelvis(-0.02), bend(2, 2, 4), turn(0), rump(0), tail(4), ears(-4), FRONT_DOWN, ANGRY, scale(1)),
    key(1.55, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 1.02, name: 'aura' }],
};

/**
 * Growl (and the roars): it draws itself up, then juts its head out at the
 * foe with its jaws open (the face level, so the foe sees the snarl), ears
 * flat, rump and tail up, and growls with a shaking head (the game plays its
 * cry twice, low).
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0.008, -0.02), bend(-6, -8, -10), rump(3), tail(8), ears(8), ANGRY),
    snap(0.21, pelvis(-0.03, 0.03), bend(2, 8, -8), rump(8), tail(16, 0, 6), ears(-30), jaw(28), FIERCE),
    key(0.42, pelvis(-0.032, 0.032), bend(2, 8, -7, 6, 3), rump(8, 3), tail(17, 3, 6), ears(-30), jaw(20), FIERCE),
    key(0.58, pelvis(-0.03, 0.03), bend(2, 8, -8, -5, -3), rump(8, -3), tail(16, -3, 6), ears(-32), jaw(30), FIERCE),
    key(0.74, pelvis(-0.032, 0.032), bend(2, 8, -7, 4, 2), rump(8, 2), tail(17, 2, 6), ears(-30), jaw(22), FIERCE),
    key(0.9, pelvis(-0.02, 0.015), bend(1, 3, -3), rump(4), tail(8), ears(-14), jaw(8), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.27, name: 'emit' }],
};

/**
 * Tail Whip (charm; also Attract, Swagger): the rump up and the head held
 * high with a cheeky look, square on the foe, and the rump and tail wag from
 * side to side with the game's sway (two swings each way, 32 frames a
 * swing); the hearts leave the tail. The head stays up: the game's sway
 * dips the sprite 8 px, and the foe's head went under our healthbox.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.4,
  keys: [
    key(0),
    // The rump up, the tail raised, the head held high.
    key(0.12, pelvis(-0.005, -0.02), bend(-6, -6, -10), rump(12), tail(10, 0, 4), ears(10), HAPPY),
    // The wag, with the game's sway.
    key(0.26, pelvis(-0.008, -0.02, 0.01), bend(-6, -6, -10, -6), rump(14, 30), tail(12, 40, 6, 20), ears(10), HAPPY),
    key(0.53, pelvis(-0.008, -0.02, -0.01), bend(-6, -6, -10, 6), rump(14, -24), tail(12, -40, 6, -20), ears(12), HAPPY),
    key(0.8, pelvis(-0.008, -0.02, 0.01), bend(-6, -6, -10, -6), rump(14, 30), tail(12, 40, 6, 20), ears(10), HAPPY),
    key(1.07, pelvis(-0.008, -0.02, -0.01), bend(-6, -6, -10, 6), rump(14, -24), tail(12, -40, 6, -20), ears(12), HAPPY),
    // Back into its stance, pleased with itself.
    key(1.22, pelvis(-0.004), bend(-1, -2, -3), rump(4, 4), tail(4, 8, 0, 4), ears(4), OPEN_EYES),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/**
 * Sand-Attack, Mud Sport (kick_sand): the game slides the sprite back and
 * returns it, then throws the sand. Its weight goes back as both front paws
 * dig in, then they scoop forward and up, flinging the sand at the foe, and
 * hang there a moment before coming down.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.0,
  keys: [
    key(0, FRONT_DOWN),
    // Weight back (the game slides the sprite back), the front paws dig in under the chest.
    key(0.06, pelvis(-0.03, -0.05), bend(-4, 6, 14), rump(-2), tail(6), ears(-10), PAWS_DIG, ANGRY),
    // Scoop: both front paws sweep forward and up (the sprite slides back in), flinging the sand.
    snap(0.13, pelvis(-0.02, 0.02), bend(-12, -4, -6), rump(2), tail(10), ears(-16), PAWS_FLING, FIERCE),
    key(0.24, pelvis(-0.021, 0.018), bend(-13, -5, -7), rump(2), tail(11), ears(-16), PAWS_FLING, FIERCE),
    // The paws hang out there a moment, then come down.
    key(0.42, pelvis(-0.024, 0.01), bend(-9, -3, -3), rump(1), tail(9), ears(-12), PAWS_UP, FIERCE),
    key(0.62, pelvis(-0.015), bend(0, 2, 4), tail(4), ears(-6), FRONT_DOWN, ANGRY),
    key(1.0, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'emit' }],
};

/**
 * Odor Sleuth, Mimic (glare): nose low, weight back, it sniffs along a zigzag,
 * pokes its nose at the foe twice (the game's two little lunges), then its
 * head comes up with the foe's scent and a hard stare.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.5,
  keys: [
    key(0),
    // Nose low, sniffing to one side then the other.
    key(0.14, pelvis(-0.02, -0.06), bend(3, 8, 14, 12), turn(8), rump(3, -8), tail(-4, -6), ears(6), DROWSY),
    key(0.21, pelvis(-0.022, -0.06), bend(3, 8, 17, 11), turn(8), rump(3, -8), tail(-4, -6), ears(6), DROWSY),
    key(0.29, pelvis(-0.02, -0.06), bend(3, 8, 13, -10), turn(-8), rump(3, 8), tail(-4, 6), ears(6), DROWSY),
    key(0.36, pelvis(-0.022, -0.06), bend(3, 8, 16, -11), turn(-8), rump(3, 8), tail(-4, 6), ears(6), DROWSY),
    // Two pokes of the nose at the foe.
    snap(0.43, pelvis(-0.02, 0.03), bend(4, 8, 6), ears(10), ANGRY),
    key(0.48, pelvis(-0.022, 0.01), bend(4, 8, 9), ears(10), ANGRY),
    snap(0.53, pelvis(-0.02, 0.035), bend(4, 8, 5), ears(12), ANGRY),
    // Head up: it has the scent. A hard stare.
    key(0.7, pelvis(-0.03, 0.02), bend(2, -2, -8), rump(4), tail(8), ears(14), FIERCE),
    key(0.9, pelvis(-0.032, 0.022), bend(2, -2, -9, 2), rump(4), tail(9), ears(14), FIERCE),
    key(1.1, pelvis(-0.03, 0.02), bend(2, -2, -8, -1), rump(4), tail(8), ears(13), FIERCE),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'emit' }],
};

/**
 * Protect, Defense Curl, Endure, Substitute (shield): it sits back over its
 * haunches and curls up into a spiky ball, the head tucked into its chest,
 * the rump curled under and the tail over its back; it holds, trembling,
 * then peeks out.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.4,
  keys: [
    key(0),
    key(0.24, pelvis(-0.055, -0.08), bend(-5, 13, 32), rump(-18, -10), tail(24, 10, 12), ears(-30), SHUT),
    key(0.34, pelvis(-0.06, -0.085), bend(-6, 14, 34), rump(-20, -12), tail(26, 12, 14), ears(-32), SHUT),
    key(0.6, pelvis(-0.058, -0.085), bend(-6, 14, 33, 1), rump(-20, -11), tail(25, 11, 13), ears(-32), SHUT),
    key(0.85, pelvis(-0.06, -0.085), bend(-6, 14, 34, -1), rump(-20, -12), tail(26, 12, 14), ears(-32), SHUT),
    // Uncurling, peeking out.
    key(1.08, pelvis(-0.03), bend(2, 2, 4), rump(-4), tail(6), ears(-6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'aura' }],
};

/**
 * Rest (heal): it lies down curled round to its left to sleep, the head
 * turned in toward its tail, eyes shut, breathing slow; then it gets up
 * again, still drowsy.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.4,
  keys: [
    key(0, FRONT_DOWN),
    key(0.3, pelvis(-0.06, -0.035), bend(0, 0, -2, 8), turn(10), rump(-6, -12), tail(-6, -20), ears(-10), FRONT_DOWN, DROWSY),
    key(0.62, pelvis(-0.105, -0.05), bend(-5, -2, -6, 26, -12), CURL, rump(-10, -24), tail(-14, -50, -6, -18), ears(-22), FRONT_DOWN, SHUT),
    key(1.0, pelvis(-0.1, -0.05), bend(-6, -2, -7, 26, -12), CURL, rump(-10, -24), tail(-14, -50, -6, -18), ears(-22), FRONT_DOWN, SHUT, scale(1.015)),
    key(1.4, pelvis(-0.107, -0.05), bend(-5, -2, -6, 26, -12), CURL, rump(-10, -24), tail(-14, -50, -6, -18), ears(-22), FRONT_DOWN, SHUT, scale(1)),
    key(1.75, pelvis(-0.1, -0.05), bend(-6, -2, -7, 26, -12), CURL, rump(-10, -24), tail(-14, -50, -6, -18), ears(-22), FRONT_DOWN, SHUT, scale(1.015)),
    // Up again, still drowsy.
    key(2.05, pelvis(-0.05, -0.02), bend(0, 2, 4), turn(4), rump(-2, -4), tail(-2, -6), ears(-6), FRONT_DOWN, DROWSY, scale(1)),
    key(2.4, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 0.95, name: 'aura' }],
};

/**
 * Thunderbolt, Shock Wave, Thunder Wave (bolt): it hunkers down with its
 * eyes shut and its tail stiff, then its whole body tenses with its fur on
 * end as the charge crackles out of it, trembling.
 */
const bolt: Clip = {
  name: 'bolt',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(-0.04, -0.04), bend(3, 2, 4), rump(8), tail(24, 0, 12), ears(-26), SHUT),
    key(0.4, pelvis(-0.045, -0.045), bend(3, 2, 5, 0, 2), rump(9), tail(26, 0, 13), ears(-28), SHUT),
    // Discharge: tensed, fur on end.
    snap(0.5, pelvis(-0.02, 0.02), bend(-4, -4, -6), rump(12), tail(30, 0, 16), ears(-34), jaw(14), FIERCE, scale(1.04)),
    key(0.62, pelvis(-0.024, 0.02), bend(-3, -4, -5, 2, 2), rump(12), tail(29, 2, 16), ears(-34), jaw(12), FIERCE, scale(1.03)),
    key(0.74, pelvis(-0.02, 0.022), bend(-4, -4, -6, -2, -2), rump(12), tail(30, -2, 16), ears(-34), jaw(14), FIERCE, scale(1.04)),
    key(0.86, pelvis(-0.024, 0.02), bend(-3, -4, -5, 1, 1), rump(11), tail(28, 1, 15), ears(-32), jaw(10), FIERCE, scale(1.03)),
    key(1.02, pelvis(-0.01), bend(0, 0, 0), rump(4), tail(8), ears(-8), ANGRY, scale(1)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.52, name: 'release' }],
};

/**
 * Double Team (afterimage): zigzagging on the spot faster than the eye can
 * follow, the way it wanders: the body swings from side to side over its
 * paws in quick zigzag bends, low and fierce; the game's afterimages of it
 * swing out from the aura on.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.5,
  keys: [
    key(0),
    key(0.1, pelvis(-0.04), bend(4, 2, 2), ears(-16), FIERCE),
    key(0.2, pelvis(-0.035, 0, 0.045), turn(12), rump(2, -22), tail(6, -24, 0, -10), bend(3, 2, 2, -10), ears(-18), FIERCE),
    key(0.32, pelvis(-0.035, 0, -0.045), turn(-12), rump(2, 22), tail(6, 24, 0, 10), bend(3, 2, 2, 10), ears(-18), FIERCE),
    key(0.44, pelvis(-0.035, 0, 0.045), turn(12), rump(2, -22), tail(6, -24, 0, -10), bend(3, 2, 2, -10), ears(-18), FIERCE),
    key(0.56, pelvis(-0.035, 0, -0.045), turn(-12), rump(2, 22), tail(6, 24, 0, 10), bend(3, 2, 2, 10), ears(-18), FIERCE),
    key(0.68, pelvis(-0.035, 0, 0.035), turn(9), rump(2, -16), tail(6, -18, 0, -8), bend(3, 2, 2, -8), ears(-16), FIERCE),
    key(0.8, pelvis(-0.03, 0, -0.025), turn(-6), rump(2, 11), tail(5, 12, 0, 6), bend(3, 2, 2, 6), ears(-14), FIERCE),
    key(0.94, pelvis(-0.02), turn(0), rump(0), tail(3), bend(1, 1, 1), ears(-8), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Iron Tail (tail): crouched with its tail raised stiff, it spins round on
 * the spot with the tail swung out level like a club, through the foe, and
 * comes round to face it again.
 */
const tailWhack: Clip = {
  name: 'tail',
  duration: 1.35,
  keys: [
    key(0),
    // Wind up: crouched, the rump swung out, the tail raised stiff.
    key(0.18, pelvis(-0.04), rump(6, -14), tail(16, -16, 8), bend(4, 2, 2, 6), ears(-22), FIERCE),
    key(0.3, pelvis(-0.045), rump(7, -18), tail(18, -20, 8), bend(4, 2, 2, 8), ears(-24), FIERCE),
    // The spin: the tail swings round level, through the foe.
    key(0.42, { root: { yaw: -110 } }, pelvis(-0.03), rump(2, 10), tail(-16, 20, -6, 10), bend(2, 0, 0), ears(-26), FIERCE),
    snap(0.52, { root: { yaw: -200 } }, pelvis(-0.03), rump(2, 16), tail(-20, 26, -8, 12), bend(2, 0, 0), ears(-26), SHUT),
    key(0.64, { root: { yaw: -290 } }, pelvis(-0.035), rump(2, 10), tail(-10, 16, -4, 8), bend(2, 0, 0), ears(-22), FIERCE),
    // Round again, facing the foe.
    key(0.78, { root: { yaw: -360 } }, pelvis(-0.04), rump(0, -6), tail(8, -10), bend(4, 2, 4, 0, 5), ears(-12), ANGRY),
    key(0.95, { root: { yaw: -360 } }, pelvis(-0.02), bend(2, 1, 2, 0, -4), ANGRY),
    key(1.35, { root: { yaw: -360 } }, OPEN_EYES),
  ],
  // The tail trails the rump by its overlap: it passes the foe just after the key.
  events: [{ t: 0.58, name: 'impact' }],
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

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, physicalStrong, headbutt, strike, tailWhack, specialWeak, pinMissile, specialStrong, statusSelf, statusTarget, charm, kickSand, glare, shield, heal, bolt, afterimage].map((c) => [c.name, c]),
);

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
