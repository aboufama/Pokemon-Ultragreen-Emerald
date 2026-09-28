// Poochyena's contact clips: every one pounces to the foe in one springing
// arc (FLY or TUCK in the air, root.y up and down, the hindquarters in line),
// lands on all fours in front of it (LAND), strikes into its body with the
// whole pup behind the blow, follows through, and bounds home backwards
// (HOP) to land in its stance. Each starts from the first clip that does its
// action (src/pokemon/blaziken/first.ts and more.ts, sceptile/more.ts,
// swampert/more.ts), re-posed on four legs and re-timed for a light, quick
// pup. The travel lands the pose at each impact on the foe's body
// (Battler3D.blowTravel), so that pose is the real point of contact: the
// jaws shut on it, the head and shoulders in it, a forepaw raking it.

import type { Clip } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import {
  ANGRY, FLY, HOP, HURT, LAND, OPEN_EYES, REAR, SHUT, STRAIGHT, TUCK,
  advance, bend, ears, fall, fore, foreL, foreR, hackles, jaw, key, pelvis, root, snap, tail, twist,
} from './set-base';

/** The hackles and tail of a pup on the attack. */
const BRISTLE = (h = 16, t = 16): Pose => compose(hackles(h), tail(t));

// Bite -----------------------------------------------------------------------

/**
 * Bite, Crunch, Poison Fang, Astonish (after Sceptile's bite and Blaziken's
 * peck): the head drawn back with the jaws parting, weight back on its
 * haunches; a pounce along an arc, landing in front of the foe with the
 * jaws wide and the head drawn right back; the neck drives the open jaws
 * into it and snaps them shut; it shakes its grip (the head wrenching one
 * way and the other, the body and tail swinging after it), lets go and
 * bounds home.
 */
const bite: Clip = {
  name: 'bite',
  duration: 1.4,
  keys: [
    key(0),
    // Head back, jaws parting, weight on the haunches.
    key(0.14, pelvis(0, -0.04, -0.03), bend(4, 0, -10, -10), jaw(12), ears(-14), BRISTLE(14, 14), ANGRY),
    // The pounce: stretched out long, the jaws opening.
    key(0.28, advance(0.55), root({ y: 0.15 }), FLY, bend(-4, 0, -8, -10), jaw(24), ears(-18), BRISTLE(16, 20), ANGRY),
    // Landing in front of the foe, jaws wide, the head drawn right back.
    key(0.38, advance(1), LAND, pelvis(0, 0, -0.02), bend(2, -2, -22, -18), jaw(36), ears(-22), BRISTLE(18, 16), ANGRY),
    // The lunge: the body thrusts forward and the neck drives the open jaws into its face...
    snap(0.45, advance(1), pelvis(0, 0.01, 0.09), bend(-2, 0, 16, -4), jaw(42), ears(-26), BRISTLE(20, 10), ANGRY),
    // ...and they snap shut on it.
    key(0.5, advance(1), pelvis(0, 0.008, 0.096), bend(-1, 0, 18, -3), jaw(-22), ears(-26), BRISTLE(20, 10), ANGRY),
    // Shaking its grip, the body and tail swinging after the head.
    key(0.62, advance(1), pelvis(0.012, 0.004, 0.094), bend(0, 0, 17, -2, 14, 8), twist(7), jaw(-22), ears(-24), BRISTLE(20, 8), tail(0, -22), ANGRY),
    key(0.72, advance(1), pelvis(-0.012, 0.004, 0.094), bend(0, 0, 18, -2, -14, -8), twist(-7), jaw(-22), ears(-24), BRISTLE(20, 8), tail(0, 22), ANGRY),
    key(0.8, advance(1), pelvis(0, 0.006, 0.09), bend(-1, 0, 17, -3, 5, 2), jaw(-20), ears(-22), BRISTLE(20, 8), ANGRY),
    // Lets go: the jaws open, the head pulls back.
    key(0.9, advance(1), pelvis(0, -0.035), bend(4, 0, -6, -6), jaw(14), ears(-10), BRISTLE(14, 12), ANGRY),
    // Bound home.
    key(1.04, advance(0.45), root({ y: 0.08 }), HOP, jaw(0), BRISTLE(10, 14), ANGRY),
    key(1.16, advance(0), LAND, BRISTLE(4, 6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  // The jaw trails the neck a little (overlap): the teeth are shut on it just after the key.
  events: [{ t: 0.53, name: 'impact' }],
};

// Tackles ----------------------------------------------------------------------

/**
 * Tackle, Facade, Secret Power, Struggle (after Blaziken's tackle): a coil
 * with the head down, a low springing dash, head and shoulders first into
 * the foe with the body driving in behind them, a bounce back off it and a
 * bound home, shaking it off.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.2,
  keys: [
    key(0),
    // Coil: crouched low, head down, shoulders forward, tail stiff.
    key(0.12, pelvis(0, -0.05, -0.03), bend(8, 4, 18, 14), ears(-18), BRISTLE(16, 16), ANGRY),
    // The dash: a low springing bound, head down leading.
    key(0.24, advance(0.72), root({ y: 0.07 }), FLY, bend(6, 4, 20, 16), ears(-22), BRISTLE(18, 22), ANGRY),
    // Head and shoulders first into the foe, the body driving in behind them...
    snap(0.3, advance(1), LAND, pelvis(0, -0.04, 0.06), bend(10, 6, 22, 16), ears(-26), BRISTLE(20, 12), SHUT),
    // ...and squashing into it.
    key(0.38, advance(1), LAND, pelvis(0, -0.055, 0.07), bend(12, 6, 24, 18, 0, 3), ears(-26), BRISTLE(20, 10), SHUT),
    // Bounces off it...
    key(0.5, advance(0.8), root({ y: 0.08 }), HOP, bend(4, 2, 10, 6, 6), ears(-10), BRISTLE(14, 16), ANGRY),
    // ...and bounds home, shaking it off.
    key(0.64, advance(0.42), root({ y: 0.07 }), HOP, bend(2, 0, -2, -4, -6), BRISTLE(10, 12), ANGRY),
    key(0.78, advance(0), LAND, BRISTLE(6, 6), ANGRY),
    key(0.96, pelvis(0, -0.02), bend(2, 0, 0, 0, 4), BRISTLE(2, 3), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'impact' }],
};

/**
 * Take Down, Double-Edge, Return, Frustration (Blaziken's tackle at the
 * scale of its physical_strong): a long coil, rocking back on its haunches
 * with the head down; a big springing leap; it crashes into the foe head
 * and shoulders first with its whole weight and squashes into it; the recoil
 * throws it back wincing (these moves hurt the user too), it shakes the pain
 * out of its head and bounds home.
 */
const tackleStrong: Clip = {
  name: 'tackle_strong',
  duration: 1.95,
  keys: [
    key(0),
    // Coil: rocking back onto its haunches, head down, everything bristling.
    key(0.16, pelvis(0, -0.06, -0.05), bend(12, 4, 16, 12), ears(-20), BRISTLE(22, 20), ANGRY),
    key(0.3, pelvis(0, -0.078, -0.06), bend(14, 5, 18, 14, 0, 2), ears(-24), BRISTLE(24, 24), ANGRY),
    // The spring: up and in, stretched out.
    key(0.46, advance(0.45), root({ y: 0.2 }), FLY, bend(2, 2, 12, 12), ears(-26), BRISTLE(26, 30), ANGRY),
    // Coming down on the foe, gathered, head tucked to ram.
    key(0.58, advance(0.85), root({ y: 0.14 }), TUCK, bend(8, 4, 22, 18), ears(-28), BRISTLE(26, 26), ANGRY),
    // The crash: head and shoulders into it with its whole weight...
    snap(0.66, advance(1), LAND, pelvis(0, -0.06, 0.07), bend(12, 6, 24, 18), ears(-30), BRISTLE(28, 14), SHUT),
    // ...squashing into it.
    key(0.76, advance(1), LAND, pelvis(0, -0.08, 0.075), bend(14, 6, 26, 20, 0, -3), ears(-30), BRISTLE(28, 12), SHUT),
    // The recoil throws it back, wincing.
    key(0.94, advance(0.74), root({ y: 0.1 }), HOP, bend(-2, 0, -6, -4), jaw(14), ears(-24), BRISTLE(10, -10), HURT),
    fall(1.06, advance(0.62), LAND, pelvis(0, -0.06, -0.02), bend(4, 0, 0, 4), jaw(8), ears(-20), BRISTLE(8, -14), HURT),
    // It shakes the pain out of its head...
    key(1.2, advance(0.62), pelvis(0, -0.04, -0.01), bend(4, 0, 2, 2, 16, 10), jaw(4), ears(-12), BRISTLE(10, -4), HURT),
    key(1.34, advance(0.62), pelvis(0, -0.035, -0.01), bend(4, 0, 2, 2, -14, -8), jaw(2), ears(-8), BRISTLE(12, 4), ANGRY),
    // ...and bounds home.
    key(1.5, advance(0.28), root({ y: 0.08 }), HOP, bend(2, 0, 0, 0), BRISTLE(8, 10), ANGRY),
    key(1.64, advance(0), LAND, BRISTLE(4, 4), ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'impact' }],
};

// Forepaws -----------------------------------------------------------------------

/** The left foreleg folded up out of the way while it rears. */
const FOLD_L = foreL(12, 72, 22);

/**
 * Thief, Rock Smash, Covet (after Blaziken's physical_weak): a crouch with
 * the right shoulder drawn back, a pounce in, a landing in front of the foe;
 * it rears onto its hind legs with the right forepaw cocked high over the
 * foe's head, then rakes it down through the foe's face with the shoulders
 * and head behind it (the torso unwinding), the claws dragging on down and
 * hanging low across its chest; it drops back onto its forepaws and bounds
 * home.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.4,
  keys: [
    key(0),
    // Wind up: crouched, the right shoulder drawn back, eyes on the foe.
    key(0.13, pelvis(0, -0.045, -0.02), bend(6, 2, -4, -6, -6), twist(-12), ears(-12), BRISTLE(14, 14), ANGRY),
    // The pounce.
    key(0.27, advance(0.55), root({ y: 0.14 }), TUCK, bend(0, 0, -6, -8, -6), twist(-12), ears(-16), BRISTLE(16, 20), ANGRY),
    // Landing in front of the foe.
    key(0.38, advance(1), LAND, bend(2, 2, -4, -4, -6), twist(-10), ears(-16), BRISTLE(16, 16), ANGRY),
    // Rearing: the right forepaw cocked high over the foe's head, the head turned to aim it.
    key(0.49, advance(1), REAR(22), pelvis(0, 0, 0.02), foreR(-130, 60, 20, 8), FOLD_L, bend(0, -4, -6, 2, -8, 6), twist(-18), jaw(10), ears(-18), BRISTLE(20, 22), ANGRY),
    // The rake: down through the foe's face, the body lunging in behind the shoulder.
    snap(0.56, advance(1), REAR(16), pelvis(0, 0, 0.08), foreR(-92, -6, 4, -8), FOLD_L, bend(2, 2, 8, 2, 8, -2), twist(14), jaw(14), ears(-22), BRISTLE(22, 12), ANGRY),
    // Follow-through: the claws drag on down it and across...
    key(0.66, advance(1), REAR(10), pelvis(0, -0.005, 0.09), foreR(-62, 4, 10, -18), FOLD_L, bend(4, 2, 10, 4, 12, -4), twist(18), jaw(8), ears(-22), BRISTLE(22, 10), ANGRY),
    // ...and hang there, low across its chest.
    key(0.78, advance(1), REAR(6), pelvis(0, -0.01, 0.07), foreR(-36, 12, 14, -22), FOLD_L, bend(5, 2, 10, 5, 13, -5), twist(19), jaw(4), ears(-20), BRISTLE(20, 10), ANGRY),
    // Down onto its forepaws.
    key(0.9, advance(1), LAND, bend(4, 0, 0, -2, 4), ears(-14), BRISTLE(16, 12), ANGRY),
    // Bound home.
    key(1.04, advance(0.45), root({ y: 0.08 }), HOP, BRISTLE(10, 14), ANGRY),
    key(1.16, advance(0), LAND, BRISTLE(4, 6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  // The paw trails the shoulder a little (overlap).
  events: [{ t: 0.59, name: 'impact' }],
};

/**
 * Counter (punch): it takes the blow braced, eyes screwed shut, then flies at
 * the foe in a flat, furious leap, lands rearing up on its hind legs with
 * both forepaws cocked, and drives them straight into the foe with the whole
 * body behind them; it holds the shove a beat, drops onto all fours and
 * bounds home.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.55,
  keys: [
    key(0),
    // Braced for the blow, eyes screwed shut.
    key(0.12, pelvis(0, -0.05, -0.04), bend(10, 4, 14, 14), ears(-28), BRISTLE(20, -6), SHUT),
    key(0.26, pelvis(0, -0.056, -0.045), bend(11, 4, 15, 15, 0, 2), ears(-30), BRISTLE(24, 4), ANGRY),
    // The retaliation: a flat, furious leap, the chest already rising.
    key(0.4, advance(0.55), root({ y: 0.12 }), FLY, bend(-12, -2, -4, -2), jaw(20), ears(-24), BRISTLE(26, 24), ANGRY),
    // Up on its hind legs at the foe, both forepaws cocked.
    key(0.5, advance(1), REAR(32), fore(12, 80, 30), bend(0, -4, 0, 6), jaw(16), ears(-24), BRISTLE(26, 24), ANGRY),
    // The blow: both forepaws driven straight into it, the body lunging behind them.
    snap(0.58, advance(1), REAR(20), pelvis(0, 0.01, 0.08), fore(-82, -8, -10), bend(0, -2, 12, 0), jaw(26), ears(-26), BRISTLE(28, 14), ANGRY),
    // Holding the shove.
    key(0.72, advance(1), REAR(18), pelvis(0, 0.005, 0.085), fore(-78, -4, -6), bend(1, -2, 13, 1, 0, 3), jaw(22), ears(-26), BRISTLE(28, 12), ANGRY),
    // Down onto all fours.
    key(0.86, advance(1), LAND, bend(4, 0, 0, -2), jaw(4), ears(-14), BRISTLE(18, 12), ANGRY),
    // Bound home.
    key(1.02, advance(0.45), root({ y: 0.08 }), HOP, BRISTLE(10, 14), ANGRY),
    key(1.16, advance(0), LAND, BRISTLE(4, 6), ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

// The tail, the whole body --------------------------------------------------------

/** Looking back over its shoulder at the foe while its back is turned (the head and neck turned to its right). */
const LOOK_BACK: Pose = { bones: { neck: { y: -26 }, head: { y: -30, z: -8 } } };
/** The rump bucked up off the hind legs (they swing free), the tail's root driving the whip. */
const BUCK: Pose = { plantLeft: 0, plantRight: 0, bones: { hips: { x: 16 }, thighL: { x: 28 }, thighR: { x: 28 }, shinL: { x: 20 }, shinR: { x: 20 } } };

/**
 * Iron Tail (after Swampert's tail): a coil with the tail raised stiff like a
 * club; a spring in that turns its back to the foe, landing in front of it
 * with the tail reared straight up over its back and the head looking back
 * over its shoulder at it (a loading hold); then the rump bucks up and the
 * tail slams down onto the foe and on through it; it swings back round to
 * face it on a bound and bounds home.
 */
const tailWhip: Clip = {
  name: 'tail',
  duration: 1.8,
  keys: [
    key(0),
    // Coil, the tail raised stiff like a club.
    key(0.2, pelvis(0, -0.05, -0.02), bend(6, 2, -2, -4), twist(-10), ears(-14), hackles(18), tail(34), ANGRY),
    // A spring in, turning its back to the foe.
    key(0.36, advance(0.55), root({ y: 0.16, yaw: 100 }), TUCK, bend(0, 0, -4, -6), ears(-18), hackles(20), tail(50), ANGRY),
    // Landing with its back to the foe, the tail reared straight up, eyes back on the foe.
    key(0.5, advance(1), root({ yaw: 176 }), LAND, bend(4, 0, 0, 0), LOOK_BACK, ears(-20), hackles(24), tail(80, -8), ANGRY),
    // Loading the whip (a moving hold): crouching, the tail still rising.
    key(0.6, advance(1), root({ yaw: 176 }), pelvis(0, -0.06, 0.02), bend(8, 2, 2, 0), LOOK_BACK, ears(-22), hackles(26), tail(86, -10), ANGRY),
    // The whip: the rump bucks up and the tail slams down onto the foe.
    snap(0.67, advance(1), root({ yaw: 176 }), BUCK, pelvis(0, -0.02, -0.03), bend(14, 4, 6, 4), LOOK_BACK, ears(-26), hackles(28), tail(-30, 14), ANGRY),
    // Follow-through: the tail swept on down through it, the hind paws coming down.
    key(0.78, advance(1), root({ yaw: 176 }), LAND, pelvis(0, -0.06, -0.02), bend(10, 2, 4, 2), LOOK_BACK, ears(-24), hackles(26), tail(-38, 26), ANGRY),
    // Swinging back round to face it on a bound.
    key(0.92, advance(0.86), root({ y: 0.08, yaw: 280 }), HOP, bend(2, 0, 0, 0), ears(-12), hackles(16), tail(0, 20), ANGRY),
    key(1.04, advance(0.8), root({ yaw: 360 }), LAND, bend(4, 0, 0, -2), hackles(14), tail(10), ANGRY),
    // Bound home.
    key(1.22, advance(0.4), root({ y: 0.08, yaw: 360 }), HOP, hackles(10), tail(12), ANGRY),
    key(1.36, advance(0), root({ yaw: 360 }), LAND, hackles(4), tail(6), ANGRY),
    key(1.8, root({ yaw: 360 }), OPEN_EYES),
  ],
  // The tail trails the hips down its length (overlap): the brush lands a few frames after the whip's key.
  events: [{ t: 0.72, name: 'impact' }],
};

/** Airborne belly-flop: all four legs flung out wide, the body in line. */
const SPLAY: Pose = compose({ plantFeet: 0 }, STRAIGHT, {
  bones: { armL: { x: -40, z: 40 }, armR: { x: -40, z: -40 }, thighL: { x: 30, z: -35 }, thighR: { x: 30, z: 35 } },
});

/**
 * Body Slam (after Blaziken's slam): a deep coil on its haunches, a big
 * leap high over the foe, and at the top it tips forward with all four legs
 * flung wide and comes down on it with its whole body, bounces off, lands
 * in front of it and bounds home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.0,
  keys: [
    key(0),
    // Coil: haunches loaded, chest low, eyes up at the foe.
    key(0.26, pelvis(0, -0.08, -0.05), bend(10, 2, -10, -12), ears(-12), hackles(18), tail(20), ANGRY),
    // Spring up and in.
    key(0.46, advance(0.5), root({ y: 0.3 }), FLY, bend(-6, -2, -10, -12), jaw(12), ears(-10), hackles(22), tail(30), ANGRY),
    // The top: tipping forward over the foe, legs flung wide.
    key(0.62, advance(0.9), root({ y: 0.34, pitch: 18 }), SPLAY, bend(2, 0, 4, 0), jaw(24), ears(-16), hackles(26), tail(36), ANGRY),
    // Down on it with its whole weight.
    snap(0.74, advance(1), root({ y: 0.1, pitch: 34 }), SPLAY, bend(6, 2, 8, 4), jaw(10), ears(-24), hackles(28), tail(20), SHUT),
    key(0.84, advance(1), root({ y: 0.08, pitch: 36 }), SPLAY, bend(7, 2, 9, 5), jaw(8), ears(-24), hackles(28), tail(16), SHUT),
    // Bounces off it.
    key(0.98, advance(0.92), root({ y: 0.18, pitch: 10 }), TUCK, bend(0, 0, -4, -6), ears(-12), hackles(20), tail(22), ANGRY),
    // Lands in front of it, deep in the legs, and holds.
    fall(1.14, advance(0.88), LAND, pelvis(0, -0.07), bend(10, 2, 0, -4), ears(-10), hackles(18), tail(14), ANGRY),
    key(1.34, advance(0.88), pelvis(0, -0.035), bend(5, 0, 0, -2), hackles(16), tail(12), ANGRY),
    // Bound home.
    key(1.5, advance(0.42), root({ y: 0.08 }), HOP, hackles(10), tail(12), ANGRY),
    key(1.64, advance(0), LAND, hackles(4), tail(6), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

// Dig ----------------------------------------------------------------------------------

/** Forepaws raking the ground in turn: the right drawn back through the dirt, the left reaching ahead. */
const RAKE_R: Pose = compose({ plantFront: 0 }, foreR(24, 40, 30), foreL(-30, -4, 4));
const RAKE_L: Pose = compose({ plantFront: 0 }, foreL(24, 40, 30), foreR(-30, -4, 4));
/** Nose down at the ground, rump up. */
const NOSE_DOWN: Pose = compose(pelvis(0, 0.01, 0), bend(16, 6, 24, 20), { bones: { hips: { x: 6 } } });

/**
 * Dig (after Blaziken's and Swampert's burrow): nose to the ground, the
 * forepaws tear at the earth right, left, right (dig: the dirt flies), it
 * dives in nose first and sinks out of sight; it tunnels over to the foe,
 * then bursts up out of the ground under its chin, jaws wide and forelegs
 * reaching (impact as it breaks the surface), comes down in front of it,
 * holds its crouch and bounds home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.25,
  keys: [
    key(0),
    // Nose to the ground.
    key(0.14, NOSE_DOWN, pelvis(0, -0.02), ears(-10), hackles(14), tail(20), ANGRY),
    // Tearing at the earth, right, left, right.
    key(0.24, NOSE_DOWN, RAKE_R, ears(-12), hackles(16), tail(26, -10), ANGRY),
    key(0.34, NOSE_DOWN, RAKE_L, ears(-12), hackles(16), tail(26, 10), ANGRY),
    key(0.44, NOSE_DOWN, RAKE_R, ears(-14), hackles(16), tail(28, -8), ANGRY),
    // Diving in nose first...
    key(0.54, advance(0.04), root({ y: -0.1, pitch: 45 }), FLY, bend(8, 4, 20, 16), ears(-26), hackles(10), tail(30), SHUT),
    // ...and down out of sight, gathering speed.
    fall(0.7, advance(0.08), root({ y: -1.3, pitch: 70 }), FLY, bend(8, 4, 20, 16), ears(-26), hackles(10), tail(20), SHUT),
    // Underground (nothing to stand on): tunnelling over to the foe, turning up to come out.
    key(0.84, advance(0.55), root({ y: -1.3, pitch: 20 }), TUCK, bend(4, 2, 0, 0), ears(-20), hackles(12), tail(10), ANGRY),
    key(1.0, advance(1), root({ y: -1.25, pitch: -10 }), TUCK, pelvis(0, -0.05), bend(8, 2, -6, -8), ears(-20), hackles(14), tail(6), ANGRY),
    // Bursting up under the foe's chin, jaws wide, forelegs reaching.
    snap(1.14, advance(1), root({ y: 0.3, pitch: -34 }), { plantFeet: 0 }, fore(-70, -10, -6), bend(-6, -4, -10, -14), jaw(38), ears(-24), hackles(24), tail(-10), ANGRY),
    key(1.26, advance(0.92), root({ y: 0.36, pitch: -26 }), { plantFeet: 0 }, fore(-60, -4, -2), bend(-6, -4, -10, -14), jaw(30), ears(-20), hackles(24), tail(-4), ANGRY),
    // Coming down in front of it and holding the crouch.
    fall(1.42, advance(0.82), LAND, pelvis(0, -0.06), bend(8, 2, -4, -6), jaw(8), ears(-12), hackles(20), tail(12), ANGRY),
    key(1.7, advance(0.82), pelvis(0, -0.03), bend(4, 0, -2, -4, 4), jaw(2), hackles(16), tail(12), ANGRY),
    // Bound home.
    key(1.86, advance(0.4), root({ y: 0.08 }), HOP, hackles(10), tail(12), ANGRY),
    key(2.0, advance(0), LAND, hackles(4), tail(6), ANGRY),
    key(2.25, OPEN_EYES),
  ],
  events: [{ t: 0.26, name: 'dig' }, { t: 1.08, name: 'impact' }],
};

export const CONTACT: Clip[] = [bite, tackle, tackleStrong, strike, punch, tailWhip, slam, burrow];
