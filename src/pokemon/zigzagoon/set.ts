// Zigzagoon's battle animation set, written by hand in the style of the first
// clips of Blaziken, Sceptile and Swampert (src/pokemon/<slug>/first.ts): a
// clip per action, each a short list of key poses over the stance built from
// small named deltas, extremes first (anticipation, the action,
// follow-through, recovery). This file holds the helpers, the battle moments
// and the contact moves; ./set_ranged.ts and ./set_status.ts hold the rest.
//
// Channels used here:
//   advance  0..1   how far toward the foe a contact move has travelled
//   root     the whole body: bounds (y), the zigzag (x: + its left), lunges
//                   (z: + toward the foe), turns (yaw), tipping (pitch: + nose
//                   down; roll: + its left side up)
//   pelvis   both body roots (Hips: the hind legs, rump and tail; Spine1: the
//                   chest, front legs, neck and head): the body sinking,
//                   leaning and rocking over its paws
//   plantFeet / plantFront   foot IK: every paw is pinned where the stance puts
//                   it (rig.ts plantAt), so the body coils and leans over paws
//                   that stay put; 0 frees the hind legs / the front legs
//   expression      eye atlas cell (open, angry, half, happy, closed, fierce, hurt)
// Events: impact (contact lands), release, releaseEnd, charge, emit, aura,
// cry, shrink, dig.
//
// How Zigzagoon moves (the brief in index.ts): a tiny raccoon, light (17.5 kg)
// and restless, it never runs straight. Contact moves zigzag in: a coil, a
// springing bound off to one side and a second one angled back in at the
// foe, each a real arc with its paws stretched out at the push-off and
// gathered under it at the top; it lands in front of the foe, strikes with
// its whole little body behind it, hangs a moment and hops home. Its legs
// are short and hidden in its fur, so its spine, rump, head and big zigzag
// tail carry every pose: the tail streams out behind a bound, flicks up as
// a counterweight and bristles when it is angry. The animator adds the
// overlap (the head, the front legs and the tail trail the body: events that
// depend on them sit a little after their key), breathing, blinks and the
// springs on the tail, ears and fur (index.ts).

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, drops). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FIERCE: Pose = { expression: 'fierce' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };

const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** The front half (spine), chest, neck and head pitch (+ down, - up), with the head's turn and tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The front half turning (+ toward its left) and rolling (+ its left shoulder up). */
const turn = (y: number, z = 0): Pose => ({ bones: { spine: { y, z } } });
/** The rear half: + raises the rump; the swing + toward its right (the stance holds it swung 34° to its left). */
const rump = (x: number, y = 0): Pose => ({ bones: { hips: { x, y } } });
/** The tail: lift (+ up), sweep (+ toward its right), and its middle's bend. */
const tail = (x: number, y = 0, x2 = 0, y2 = 0): Pose => ({ bones: { tail: { x, y }, tail2: { x: x2, y: y2 } } });
/** Ears: + pricked forward, - laid back; spread tips them out to the sides. */
const ears = (x: number, spread = 0): Pose => ({ bones: { earL: { x, z: -spread }, earR: { x, z: spread } } });
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
const at = (advance: number): Pose => ({ advance });
/** The whole body angled into a bound toward `side` (+1 its left, -1 its right): the front half leads, the rump and the tail swing out the other way. */
const veer = (side: number, deg = 14): Pose => ({
  bones: { spine: { y: deg * side }, hips: { y: deg * side }, tail: { y: 1.2 * deg * side } },
});

// Legs --------------------------------------------------------------------------
// The paws are pinned where the stance puts them unless a key frees them:
// the front legs are then aimed (their elbows bend back), the hind legs
// swung with bone rotations.

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both front legs off the ground, aimed (the left given; the right mirrored unless given). */
const legs = (arm: Vec3, forearm: Vec3, armR: Vec3 = mirror(arm), forearmR: Vec3 = mirror(forearm)): Pose => ({
  plantFront: 0,
  aim: { armL: { dir: arm }, forearmL: { dir: forearm }, armR: { dir: armR }, forearmR: { dir: forearmR } },
});
/** Front paws back on the ground where the stance puts them. */
const PAWS_DOWN: Pose = { plantFront: 1, aim: structuredClone(STANCE.aim) };
/** Hind legs off the ground: swung (+ back, - forward under the belly) and folded at the hock (+ tucked up). */
const hind = (swing: number, fold: number, swingR = swing, foldR = fold): Pose => ({
  plantFeet: 0,
  bones: { thighL: { x: swing }, shinL: { x: fold }, thighR: { x: swingR }, shinR: { x: foldR } },
});

/** Front paws reaching out ahead (the push-off, a pounce). */
const PAWS_AHEAD = legs([0.1, -0.35, 0.93], [0.05, -0.45, 0.89]);
/** Front paws tucked up under the chest (the top of a bound). */
const PAWS_TUCK = legs([0.1, -0.6, -0.8], [0.04, -0.05, 0.99]);
/** Front paws reaching down for the ground (about to land). */
const PAWS_REACH = legs([0.1, -0.85, 0.5], [0.05, -0.95, 0.3]);

/** In the air, stretched out: the push-off (hind legs kicked out behind, front paws reaching ahead). */
const STRETCH: Pose[] = [hind(45, -10), PAWS_AHEAD, bend(-4, 0, 0, -4), rump(-6)];
/** In the air, gathered: every paw tucked up under the body, the back rounded (the top of a bound). */
const GATHER: Pose[] = [hind(-30, 40), PAWS_TUCK, bend(6, 0, 0, -8), rump(6)];
/** Coming down: front paws reaching for the ground, hind legs swinging under. */
const DROP: Pose[] = [hind(-12, 14), PAWS_REACH, bend(8, 0, 0, -10), rump(4)];
/** Landing: every paw down, the body sinking into it, the head up on the foe. */
const LAND: Pose = { plantFeet: 1, ...PAWS_DOWN, pelvis: { y: -0.045 }, bones: { spine: { x: 7 }, head: { x: -8 } } };
/** Landing home from a hop: every paw down, sinking a little less deep. */
const LAND_HOME: Pose = { plantFeet: 1, ...PAWS_DOWN, pelvis: { y: -0.03 }, bones: { spine: { x: 4 }, head: { x: -4 } } };

// Battle moments -----------------------------------------------------------------

/**
 * Idle: restless even at rest. It breathes, shifts its weight from side to
 * side over its paws with the rump and the tail answering, and halfway
 * dips its nose for a quick sniff of the ground.
 */
const idle: Clip = {
  name: 'idle',
  duration: 3.2,
  loop: true,
  keys: [
    key(0),
    key(0.8, pelvis(0.006, -0.004), turn(2), rump(0, 3), tail(2, 4)),
    key(1.5, pelvis(0, -0.008), bend(2, 0, 3, 5), rump(1), tail(1)),
    key(1.75, pelvis(0, -0.006), bend(2, 0, 3, 3), rump(1), tail(1)),
    key(2.4, pelvis(-0.006, -0.003), turn(-2), rump(0, -3), tail(3, -4)),
    key(3.2),
  ],
};

/**
 * Sent out (the stock sprite's ANIM_H_SLIDE is a wary little slide): nose
 * down in the grass, sniffing, it notices the foe and its head snaps up; it
 * springs up in a startled hop, its fur and tail bristling, lands square on
 * the foe and yaps at it with its mouth wide (the stock sprite's
 * open-mouthed frame), then settles into its stance with a flick of the
 * tail.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.7,
  keys: [
    key(0, pelvis(0, -0.03, 0.01), bend(8, 2, 6, 12), rump(4), tail(-8), ears(8), DROWSY),
    // Sniffing along the grass.
    key(0.18, pelvis(0, -0.035, 0.012), bend(9, 2, 7, 15, 6), rump(5), tail(-6, 4), ears(8), DROWSY),
    // Its head snaps up: it has seen the foe.
    snap(0.3, pelvis(0, -0.05, -0.01), bend(0, -2, -4, -10), rump(6), tail(6), ears(16), OPEN_EYES),
    // A startled hop straight up, every paw off the ground, fur and tail bristling.
    key(0.44, root({ y: 0.16 }), ...GATHER, bend(-4, -2, -4, -12), tail(24, 0, 10), ears(12), { scale: 1.04 }, FIERCE),
    // Lands square on the foe.
    fall(0.58, LAND, pelvis(0, -0.05), bend(8, 2, 0, -6), tail(16, 0, 6), ears(-6), { scale: 1.03 }, FIERCE),
    // The yap: head thrust at the foe, mouth wide, ears back (a moving hold, the head shaking).
    snap(0.7, pelvis(0, -0.03, 0.02), bend(10, 4, -6, -14), jaw(30), tail(26, 0, 10), ears(-20), { scale: 1.04 }, ANGRY),
    key(0.86, pelvis(0, -0.032, 0.022), bend(10, 4, -6, -14, 7, 4), jaw(34), tail(28, 6, 10), ears(-22), { scale: 1.04 }, ANGRY),
    key(1.02, pelvis(0, -0.03, 0.02), bend(10, 4, -6, -13, -7, -4), jaw(30), tail(27, -6, 10), ears(-22), { scale: 1.035 }, ANGRY),
    // Mouth shut, settling into its stance with a flick of the tail.
    key(1.2, pelvis(0, -0.015, 0.008), bend(4, 1, -2, -4), jaw(2), tail(14, 8, 4), ears(-8), { scale: 1.01 }, ANGRY),
    key(1.38, pelvis(0, -0.006), bend(1, 0, 0, -1), tail(6, -4), ears(-2)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'cry' }],
};

/**
 * Taking a hit: the head is knocked up and back, eyes squeezed shut, ears
 * flat, the front half thrown back over its haunches and the tail
 * bristling (the battler adds a sprung knock-back); it drops back onto its
 * paws and shakes it off.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0.01, -0.02), bend(-10, -4, -8, -16, 8, 6), rump(-4), tail(16, 0, 8), ears(-30), HURT),
    key(0.2, pelvis(0, 0.004, -0.012), bend(-4, -2, -3, -6, 3, 2), rump(-2), tail(8, 0, 4), ears(-18), HURT),
    key(0.36, pelvis(0, -0.006, 0.004), bend(3, 1, 1, 3, -2), tail(2), ears(-6), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * its eyes half shut, then its legs fold and it lies down curled round to
 * its left like a sleeping raccoon, head turned in toward its tail, eyes
 * shut; from the 'shrink' the curled body shrinks away. It lies on its
 * tucked paws with its head turned in to its side: bowed forward over its
 * paws, a wild one's head went down onto our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.62,
  keys: [
    key(0),
    // A tired sway, eyes half shut.
    key(0.2, pelvis(0.01, 0.004), bend(-4, -2, -2, -8, 0, 8), rump(0, 4), tail(-4), ears(-14), DROWSY),
    // The legs fold under it...
    key(0.5, pelvis(0, -0.06, -0.02), bend(2, 0, 4, 8, 12, 4), turn(10), rump(-6, -6), tail(-10, -14), ears(-20), SHUT),
    // ...and it lies curled round, head turned in toward its tail.
    key(0.84, pelvis(0, -0.1, -0.03), bend(0, 0, 6, 16, 26, 10), turn(24), rump(-10, -18), tail(-14, -40, -6, -14), ears(-24), SHUT),
    key(0.98, pelvis(0, -0.104, -0.03), bend(0, 0, 6, 17, 27, 10), turn(25), rump(-10, -19), tail(-15, -42, -6, -14), ears(-24), SHUT),
    key(1.62, pelvis(0, -0.102, -0.03), bend(0, 0, 6, 16, 26, 10), turn(24), rump(-10, -18), tail(-14, -41, -6, -14), ears(-24), SHUT),
  ],
  events: [{ t: 1.06, name: 'shrink' }],
};

// Contact moves --------------------------------------------------------------------

/**
 * Tackle (Headbutt, Facade, Secret Power, Pursuit, Struggle): after
 * Blaziken's tackle (a low springing dash, head first into the foe, a
 * bounce back), zigzagged. A quick coil onto its haunches, a bound off to
 * its left and a second one angled back in; it lands in front of the foe
 * and the hind legs drive it forehead first into its body, eyes shut; it
 * bounces off shaking its head and hops home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.4,
  keys: [
    key(0),
    // Coil: weight back and down on its haunches, head low on the foe, rump and tail up.
    key(0.12, pelvis(0, -0.07, -0.04), bend(8, 2, 0, -10), rump(12), tail(18), ears(-28), FIERCE),
    // The zig: a bound off to its left, stretched out.
    key(0.21, at(0.28), root({ x: 0.5, y: 0.24, pitch: -8 }), ...STRETCH, veer(1, 18), tail(6), ears(-32), FIERCE),
    // Touchdown, already turning back for the zag.
    key(0.29, at(0.5), root({ x: 0.7 }), LAND, pelvis(0, -0.02), veer(-1), tail(18), ears(-32), FIERCE),
    // The zag: angled back in at the foe, gathered, head coming down.
    key(0.37, at(0.78), root({ x: 0.36, y: 0.24, pitch: 6 }), ...GATHER, veer(-1, 12), tail(10), ears(-36), FIERCE),
    // Lands in front of the foe, sinking into it.
    key(0.45, at(1), LAND, pelvis(0, -0.025, -0.01), bend(4, 2, 4, 2), rump(8), tail(14), ears(-36), FIERCE),
    // The ram: the hind legs drive it off the ground, forehead first into the foe.
    snap(0.52, at(1), root({ y: 0.04, z: 0.34 }), hind(55, -10), PAWS_TUCK, bend(8, 4, 12, 22), rump(-8), tail(-12), ears(-42), SHUT),
    key(0.6, at(1), root({ y: 0.03, z: 0.31 }), hind(50, -8), PAWS_TUCK, bend(9, 4, 13, 24, 0, 3), rump(-8), tail(-14), ears(-42), SHUT),
    // Bounces off, shaking its head.
    key(0.73, at(0.95), root({ y: 0.1, z: -0.02 }), ...GATHER, bend(-2, 0, -2, 0, 10, 6), tail(10), ears(-16), ANGRY),
    key(0.84, at(0.92), LAND, bend(4, 0, 0, -4, -9, -5), tail(8), ears(-12), ANGRY),
    // Hop home.
    key(0.98, at(0.45), root({ x: -0.14, y: 0.17 }), ...GATHER, tail(10), ears(-10), ANGRY),
    key(1.12, at(0), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'impact' }],
};

/**
 * Double-Edge (Return, Frustration, Flail): Blaziken's physical_strong for
 * its scale, Swampert's belly-first crash for its weight. A long coil with
 * the haunches wiggling like a cat about to pounce, a wild bound off to its
 * right, then it launches itself at the foe stretched out like a missile and
 * crashes into it with its whole body; the recoil throws it back hurt (it
 * hurts itself too), it lands, winces, shakes it off and hops home.
 */
const tackleStrong: Clip = {
  name: 'tackle_strong',
  duration: 2.1,
  keys: [
    key(0),
    // The coil: down and back onto its haunches, the rump wiggling one way...
    key(0.14, pelvis(0, -0.06, -0.035), bend(6, 2, 0, -8), rump(12, 12), tail(18, 14), ears(-26), FIERCE),
    // ...and the other...
    key(0.26, pelvis(0, -0.075, -0.045), bend(8, 2, 0, -10), rump(14, -12), tail(20, -16), ears(-30), FIERCE),
    // ...and loaded, dead still on the foe.
    key(0.36, pelvis(0, -0.085, -0.05), bend(9, 2, 0, -12), rump(15), tail(22), ears(-34), FIERCE),
    // The zig: a wild bound off to its right.
    key(0.47, at(0.3), root({ x: -0.55, y: 0.28, pitch: -8 }), ...STRETCH, veer(-1, 20), tail(8), ears(-36), FIERCE),
    // Touchdown deep, gathering itself to launch.
    key(0.56, at(0.48), root({ x: -0.74 }), LAND, pelvis(0, -0.04), veer(1, 12), tail(20), ears(-36), FIERCE),
    // The launch: stretched out like a missile at the foe.
    key(0.67, at(0.8), root({ x: -0.34, y: 0.3, pitch: -4 }), ...STRETCH, veer(1, 8), bend(0, 0, 4, 8), tail(-6), ears(-44), FIERCE),
    // The crash: its whole body into the foe, head tucked, eyes shut.
    snap(0.75, at(1), root({ y: 0.12, z: 0.3, pitch: 14 }), ...STRETCH, bend(6, 4, 12, 20), tail(-14), ears(-46), SHUT),
    key(0.83, at(1), root({ y: 0.08, z: 0.27, pitch: 18 }), ...STRETCH, bend(8, 4, 12, 22, 0, 4), tail(-10), ears(-46), SHUT),
    // The recoil throws it back, hurt.
    snap(0.96, at(0.9), root({ y: 0.16, z: -0.08, pitch: -14 }), ...STRETCH, bend(-8, -4, -6, -16, 10, 8), tail(20), ears(-30), HURT),
    // It lands hard and winces...
    fall(1.1, at(0.86), LAND, pelvis(0, -0.03), bend(4, 0, 2, 6, -4, -3), tail(8), ears(-26), HURT),
    // ...and shakes it off.
    key(1.24, at(0.86), LAND, pelvis(0, -0.02), bend(4, 0, 2, 2, 12, 6), tail(12, 10), ears(-18), SHUT),
    key(1.36, at(0.86), LAND, pelvis(0, -0.02), bend(4, 0, 2, 0, -10, -6), tail(12, -10), ears(-16), ANGRY),
    // Hop home.
    key(1.52, at(0.42), root({ x: 0.12, y: 0.17 }), ...GATHER, tail(10), ears(-10), ANGRY),
    key(1.67, at(0), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.77, name: 'impact' }],
};

/** Reared up on its haunches, the front half lifted over its hind legs. */
const REAR: Pose[] = [{ plantFeet: 1 }, pelvis(0, 0, -0.03), bend(-32, -6, 6, 14), rump(-8)];
/** Reared up, the right forepaw cocked up and out beside its head, the left held in front. */
const PAW_COCKED = legs([0.15, -0.45, 0.88], [0.05, -0.2, 0.98], [-0.8, 0.35, 0.49], [-0.35, 0.88, 0.32]);
/** The right forepaw raked down and across in front of it, the left tucked. */
const PAW_SWIPED = legs([0.2, -0.55, 0.81], [0.05, -0.4, 0.92], [0.35, -0.45, 0.82], [0.75, -0.5, 0.43]);
/** ... carried on down past the foe. */
const PAW_SWIPED_LOW = legs([0.2, -0.6, 0.77], [0.05, -0.5, 0.86], [0.45, -0.62, 0.64], [0.72, -0.64, 0.27]);

/**
 * Covet (Thief, Cut, Rock Smash, Fury Cutter): after Blaziken's
 * physical_weak, a claw swipe with the shoulders behind it. Low with its
 * right shoulder drawn back, it zigzags in (off to its right, then back in),
 * lands in front of the foe and rears up onto its haunches with its right
 * forepaw cocked out beside its head; the front half drops and twists and
 * the paw rakes down and across the foe's face; it hangs there, drops back
 * onto all fours and hops home.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.5,
  keys: [
    key(0),
    // Wind-up: low, the right shoulder drawn back, eyes on the foe.
    key(0.13, pelvis(0, -0.06, -0.03), bend(6, 2, 0, -8), turn(-14), rump(10, -6), tail(14, 8), ears(-24), FIERCE),
    // The zig: off to its right.
    key(0.24, at(0.3), root({ x: -0.46, y: 0.22, pitch: -8 }), ...STRETCH, veer(-1, 16), ears(-30), FIERCE),
    // Touchdown, turning back in.
    key(0.32, at(0.5), root({ x: -0.62 }), LAND, pelvis(0, -0.02), veer(1), tail(16), ears(-30), FIERCE),
    // The zag: back in at the foe.
    key(0.41, at(0.8), root({ x: -0.3, y: 0.22, pitch: 6 }), ...GATHER, veer(1, 10), ears(-32), FIERCE),
    // Lands in front of the foe, its front half already lifting.
    key(0.47, at(1), LAND, pelvis(0, -0.02), bend(-17, 0, 0, 6), rump(4), tail(16), ears(-28), FIERCE),
    // Rears up high onto its haunches, the right paw cocked out beside its head, the shoulders drawn back.
    key(0.62, at(1), ...REAR, bend(-8, -2, 2, 4), PAW_COCKED, turn(-20, -8), tail(30), ears(-20), ANGRY),
    // The swat: the front half drops onto the foe and twists, the paw raking down and across its face.
    snap(0.7, at(1), root({ z: 0.3 }), { plantFeet: 1 }, pelvis(0, -0.03, 0.02), bend(4, 2, 6, 10), rump(-2), turn(24, 10), PAW_SWIPED, tail(4, -18), ears(-34), FIERCE),
    // Follow-through: carried on down and across, hanging there.
    key(0.82, at(1), root({ z: 0.28 }), { plantFeet: 1 }, pelvis(0, -0.035, 0.02), bend(8, 3, 6, 8), turn(28, 12), PAW_SWIPED_LOW, tail(2, -22), ears(-32), FIERCE),
    // Back down on all fours.
    key(0.96, at(1), root({ z: 0.1 }), LAND, pelvis(0, -0.02), turn(6), tail(10), ears(-20), ANGRY),
    // Hop home.
    key(1.12, at(0.45), root({ x: 0.1, y: 0.16 }), ...GATHER, tail(10), ears(-12), ANGRY),
    key(1.26, at(0), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/** Looking back over its shoulder (its body turned away from the foe). */
const LOOK_BACK: Pose = { bones: { neck: { y: 26 }, head: { y: 30, x: -6 } } };
/** Up on its front paws with the rump hoisted high and the hind legs off the ground (the tail slam's handstand). */
const RUMP_UP: Pose[] = [hind(-12, 34), PAWS_DOWN, rump(26), bend(10, 4, 0, -6)];

/**
 * Iron Tail: after Swampert's tail (a hop in that turns its back to the foe,
 * the tail whipped down through it). It zigzags in with its tail raised
 * stiff, the second bound spinning it round in the air so it lands with its
 * back to the foe, looking back over its shoulder; up onto its front paws
 * with the rump hoisted and the tail cocked high over its back, it brings
 * the tail down on the foe like a club; then it spins back round on a hop
 * and hops home.
 */
const ironTail: Clip = {
  name: 'tail',
  duration: 1.95,
  keys: [
    key(0),
    // Coil, the tail raised stiff behind it.
    key(0.18, pelvis(0, -0.06, -0.03), bend(6, 2, 0, -8), rump(10), tail(26, 0, 12), ears(-26), FIERCE),
    // The zig: a bound off to its left.
    key(0.3, at(0.3), root({ x: 0.46, y: 0.22, pitch: -8 }), ...STRETCH, veer(1, 16), tail(14, 0, 8), ears(-30), FIERCE),
    // Touchdown, turning back in.
    key(0.39, at(0.5), root({ x: 0.62 }), LAND, veer(-1), tail(24, 0, 12), ears(-30), FIERCE),
    // The zag: springing in, turning its back to the foe in the air.
    key(0.5, at(0.82), root({ x: 0.3, y: 0.26, yaw: 100 }), ...GATHER, { bones: { neck: { y: 12 }, head: { y: 14 } } }, tail(30, 0, 14), ears(-32), FIERCE),
    // Lands with its back to the foe, right up against it, looking back over its shoulder.
    key(0.6, at(1), root({ yaw: 180, z: 0.42 }), LAND, rump(10), LOOK_BACK, tail(36, 0, 14), ears(-30), FIERCE),
    // Up onto its front paws, the rump high, the tail cocked up over its back.
    key(0.7, at(1), root({ yaw: 182, z: 0.44 }), ...RUMP_UP, LOOK_BACK, tail(58, 0, 20), ears(-30), FIERCE),
    // The slam: the tail comes down like a club onto the foe, the rump driving back into it.
    snap(0.78, at(1), root({ yaw: 184, z: 0.62 }), hind(-4, 20), PAWS_DOWN, rump(20), bend(12, 4, 0, -4), LOOK_BACK, tail(-40, 0, -14), ears(-40), SHUT),
    key(0.9, at(1), root({ yaw: 184, z: 0.6 }), hind(0, 16), PAWS_DOWN, rump(18), bend(12, 4, 0, -4, 0, 3), LOOK_BACK, tail(-46, 0, -16), ears(-40), SHUT),
    // It spins back round on a hop to face the foe.
    key(1.04, at(0.92), root({ y: 0.14, z: 0.2, yaw: 290 }), ...GATHER, tail(10), ears(-16), ANGRY),
    key(1.16, at(0.88), root({ yaw: 360 }), LAND, tail(12), ears(-12), ANGRY),
    // Hop home.
    key(1.34, at(0.42), root({ x: -0.1, y: 0.16, yaw: 360 }), ...GATHER, tail(10), ears(-10), ANGRY),
    key(1.48, at(0), root({ yaw: 360 }), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(1.95, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'impact' }],
};

/** Hind legs spread out to the sides (+ its left one out to its left). */
const hindSpread = (deg: number): Pose => ({ bones: { thighL: { z: deg }, thighR: { z: -deg } } });
/** Flying spread-eagled: every paw flung out wide (a body slam coming down). */
const SPREAD: Pose[] = [hind(20, -6), hindSpread(24), legs([0.72, -0.25, 0.65], [0.6, -0.3, 0.74])];

/**
 * Body Slam: after Blaziken's slam (a big leap, tipping forward over the
 * foe, down on it with its whole weight). The rump wiggles in the coil, a
 * bound off to its right lands deep, and a big leap takes it high over the
 * foe, where it tips forward with every paw flung out and comes down on it
 * belly first; it bounces off, lands deep in front of it and hops home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.05,
  keys: [
    key(0),
    // The coil, the rump wiggling.
    key(0.16, pelvis(0, -0.06, -0.035), bend(6, 2, 0, -8), rump(12, -10), tail(18, -12), ears(-24), FIERCE),
    key(0.28, pelvis(0, -0.085, -0.05), bend(8, 2, 0, -12), rump(14, 10), tail(22, 12), ears(-30), FIERCE),
    // The zig: a bound off to its right.
    key(0.4, at(0.28), root({ x: -0.42, y: 0.22, pitch: -8 }), ...STRETCH, veer(-1, 16), ears(-32), FIERCE),
    // Touchdown deep, loading the big leap.
    key(0.49, at(0.45), root({ x: -0.56 }), LAND, pelvis(0, -0.05), veer(1, 10), tail(20), ears(-32), FIERCE),
    // The leap: high and in, stretched out.
    key(0.63, at(0.8), root({ x: -0.28, y: 0.5, pitch: -12 }), ...STRETCH, veer(1, 6), ears(-36), FIERCE),
    // The top, over the foe: tipping forward, every paw flung wide.
    key(0.75, at(1), root({ x: -0.08, y: 0.56, z: 0.2, pitch: 16 }), ...SPREAD, bend(-4, 0, -4, -10), tail(24), ears(-40), FIERCE),
    // Down on it belly first with its whole weight.
    snap(0.84, at(1), root({ y: 0.3, z: 0.42, pitch: 22 }), ...SPREAD, bend(4, 2, 0, -6), tail(-6), jaw(14), ears(-44), SHUT),
    key(0.92, at(1), root({ y: 0.27, z: 0.42, pitch: 24 }), ...SPREAD, bend(5, 2, 0, -6, 0, 3), tail(-8), jaw(10), ears(-44), SHUT),
    // Bounces off it.
    key(1.06, at(0.94), root({ y: 0.26, z: 0.05, pitch: 6 }), ...GATHER, tail(16), ears(-20), ANGRY),
    // Lands in front of it, deep.
    fall(1.2, at(0.9), LAND, pelvis(0, -0.05), bend(8, 2, 0, -4), tail(12), ears(-16), ANGRY),
    key(1.38, at(0.9), LAND, pelvis(0, -0.02), bend(4, 0, 0, -2), tail(8), ears(-12), ANGRY),
    // Hop home.
    key(1.54, at(0.42), root({ x: -0.1, y: 0.16 }), ...GATHER, tail(10), ears(-10), ANGRY),
    key(1.68, at(0), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(2.05, OPEN_EYES),
  ],
  events: [{ t: 0.86, name: 'impact' }],
};

/** How high the curled ball's middle rides above the ground (heights). */
const BALL_MID = 0.3;
/** Curled into a ball: the head tucked down, the rump curled under, every paw in, the tail wrapped over its back. */
const BALL: Pose[] = [hind(-50, 70), legs([0.1, -0.5, -0.86], [0.05, 0.2, 0.98]), bend(40, 10, 18, 36), rump(-40), tail(55, 0, 25), ears(-40)];
/**
 * The ball at advance `a`, rolled `deg` forward, `x` to its left: the root
 * rides at the ball's middle and the body hangs BALL_MID below it, so
 * root.pitch rolls it about its middle, not its feet.
 */
const ball = (a: number, deg: number, z = 0, lift = 0, x = 0): Pose[] => [
  { advance: a, root: { x, y: BALL_MID + lift, z, pitch: deg } }, ...BALL, pelvis(0, -BALL_MID - 0.06), SHUT,
];

/**
 * Rollout: after Swampert's spin (curled into a ball, rolled at the foe,
 * bowled into it). It tucks its head and wraps its tail over its back,
 * curls into a spiky ball and rolls at the foe, weaving, bowls into it and
 * grinds against it, rolls back home, uncurls and shakes its head.
 */
const spin: Clip = {
  name: 'spin',
  duration: 2.1,
  keys: [
    key(0),
    // Tucking in: head down, the tail curling over.
    key(0.18, pelvis(0, -0.07), bend(20, 4, 8, 20), rump(-12), tail(30, 0, 14), ears(-30), FIERCE),
    // Curled into a ball, rolling off...
    key(0.32, ...ball(0, 40)),
    // ...weaving at the foe.
    key(0.46, ...ball(0.28, 230, 0, 0, 0.22)),
    key(0.6, ...ball(0.62, 440, 0, 0, -0.18)),
    key(0.72, ...ball(0.9, 600, 0, 0, 0.04)),
    // Bowls into it and grinds against it.
    snap(0.78, ...ball(1, 680, 0.3)),
    key(0.88, ...ball(1, 700, 0.3)),
    // Bounces back and rolls home.
    key(1.0, ...ball(0.84, 640, 0.1, 0.08)),
    key(1.16, ...ball(0.46, 450)),
    key(1.32, ...ball(0.12, 250)),
    key(1.44, ...ball(0, 120)),
    // Uncurls, dizzy, and shakes its head.
    snap(1.58, root({ pitch: 0 }), LAND, pelvis(0, -0.05), bend(12, 2, 4, 10), tail(20, 0, 10), ears(-20), DROWSY),
    key(1.72, LAND_HOME, bend(2, 0, 0, -2, 12, 8), tail(10, 10), ears(-10, 8), SHUT),
    key(1.84, bend(2, 0, 0, -2, -10, -6), tail(8, -8), ears(-6, -6), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
};

/** Digging: one forepaw scrabbling back under the chest, the other reaching out ahead for the next stroke (`side` +1: the left digs). */
const scrabble = (side: number): Pose => {
  const dig: [Vec3, Vec3] = [[0.1, -0.92, 0.36], [0.05, -0.6, -0.8]];
  const reach: [Vec3, Vec3] = [[0.1, -0.55, 0.83], [0.05, -0.85, 0.52]];
  const [l, r] = side > 0 ? [dig, reach] : [reach, dig];
  return legs(l[0], l[1], mirror(r[0]), mirror(r[1]));
};

/**
 * Dig: after the first clips' burrows (claws into the ground, sinking out of
 * sight, tunnelling over, bursting up under the foe). Nose to the ground, it
 * scrabbles at the earth with its forepaws and dives in nose first (dig),
 * tunnels over to the foe and bursts up out of the ground in front of it
 * head first (impact as it breaks the surface); it lands, shakes the dirt
 * out of its fur like a dog and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.3,
  keys: [
    key(0),
    // Nose down at the ground, weight back.
    key(0.12, pelvis(0, -0.05, -0.02), bend(12, 4, 8, 16), rump(10), tail(16), ears(-20), FIERCE),
    // Scrabbling at the earth, one forepaw then the other.
    key(0.2, pelvis(0, -0.06, -0.01), bend(16, 4, 8, 18), rump(14), scrabble(1), tail(20), ears(-26), FIERCE),
    key(0.28, pelvis(0, -0.065, -0.01), bend(17, 4, 8, 18), rump(15), scrabble(-1), tail(22), ears(-28), FIERCE),
    // Diving in nose first (dig), gathering speed as it sinks out of sight.
    key(0.36, root({ y: -0.08, pitch: 30 }), { plantFeet: 0 }, PAWS_AHEAD, bend(12, 4, 8, 16), rump(10), tail(24), ears(-36), SHUT),
    fall(0.56, root({ y: -1.3, pitch: 50 }), { plantFeet: 0 }, PAWS_AHEAD, bend(10, 4, 6, 14), rump(6), tail(10), ears(-40), SHUT),
    // Underground: tunnelling over to the foe, turning nose up to come out.
    key(0.72, at(0.3), root({ y: -1.3, pitch: 20 }), { plantFeet: 0 }, PAWS_AHEAD, bend(6, 2, 4, 8), tail(6), ears(-40), SHUT),
    key(0.9, at(1), root({ y: -1.25, pitch: -24 }), ...GATHER, bend(0, 0, -4, -6), tail(10), ears(-40), FIERCE),
    // Bursts up out of the ground in front of the foe, head first.
    snap(1.04, at(1), root({ y: 0.32, pitch: -30 }), ...STRETCH, bend(-8, -4, -6, -12), tail(-10), jaw(10), ears(-30), FIERCE),
    key(1.16, at(0.94), root({ y: 0.38, pitch: -16 }), ...GATHER, bend(-4, 0, -4, -8), tail(10), ears(-24), FIERCE),
    // Lands in front of it.
    fall(1.32, at(0.86), LAND, pelvis(0, -0.05), bend(8, 2, 0, -4), tail(12), ears(-16), ANGRY),
    // Shakes the dirt out of its fur like a dog.
    key(1.46, at(0.86), LAND, root({ roll: 10 }), turn(8, 6), rump(0, -10), tail(10, 20), ears(-10, 10), SHUT),
    key(1.56, at(0.86), LAND, root({ roll: -10 }), turn(-8, -6), rump(0, 10), tail(10, -20), ears(-10, -10), SHUT),
    key(1.66, at(0.86), LAND, root({ roll: 5 }), turn(4, 3), rump(0, -5), tail(10, 10), ears(-8, 4), SHUT),
    key(1.78, at(0.86), LAND, pelvis(0, -0.02), tail(8), ears(-8), ANGRY),
    // Hop home.
    key(1.94, at(0.42), root({ x: 0.1, y: 0.16 }), ...GATHER, tail(10), ears(-8), ANGRY),
    key(2.08, at(0), LAND_HOME, tail(6), ears(-6), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.33, name: 'dig' }, { t: 0.98, name: 'impact' }],
};

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

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, tackle, tackleStrong, strike, ironTail, slam, spin, burrow].map((c) => [c.name, c]),
);

// The helpers, for ./set_ranged.ts and ./set_status.ts.
export {
  key, snap, fall, ANGRY, FIERCE, HAPPY, SHUT, DROWSY, HURT, OPEN_EYES, jaw, pelvis, bend, turn, rump, tail, ears, root, at, veer,
  mirror, legs, hind, hindSpread, PAWS_DOWN, PAWS_AHEAD, PAWS_TUCK, PAWS_REACH, STRETCH, GATHER, DROP, LAND, LAND_HOME, REAR, LOOK_BACK,
};
