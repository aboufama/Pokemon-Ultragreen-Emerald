// Linoone's battle animation set, made to the first clips of Blaziken,
// Sceptile and Swampert (src/pokemon/<slug>/first.ts, more.ts): a clip per
// action its moves take, each written by hand as a short list of key poses
// over the stance (STANCE + deltas, see compose()), extremes first:
// anticipation, the action, follow-through, recovery. This file holds the
// helpers and the deltas the keys are built from, the moments (idle, intro,
// hit, faint) and the contact clips; ./set_home.ts has the clips played at
// home (ranged and status).
//
// Channels used here:
//   advance  0..1   how far toward the foe a contact move has travelled
//   root     the whole body (the dash's low flight, lunges, spins, rolls)
//   pelvis   both body roots together (Hips: the hind legs, rump and tail;
//            Spine1: the chest, front legs, neck and head): the long body
//            crouching, stretching and rocking over its planted paws
//   plantFeet / plantFront   foot IK: every paw is pinned where the stance
//            puts it (rig.ts plantAt); 0 frees the hind legs / the front
//            legs, which are then posed (the front legs aimed, the hind legs
//            swung with bone rotations)
//   expression      eye atlas cell (open, angry, half, wink, closed, fierce, hurt)
// Events: impact (contact lands), release (a projectile or stream leaves the
// mouth), releaseEnd, charge, cry, aura, emit, shrink; dig (a burrow goes under).
//
// How Linoone moves (the brief in index.ts): the rushing Pokémon, 32.5 kg on
// short legs, fast only in a straight line. It goes still and coils (low,
// the rump up, the head level and the eyes locked on the foe, ears back),
// then everything at once: a flat, very fast dash dead straight at the foe,
// belly skimming the ground, the long body stretched out and the tail
// streaming behind; it rams the foe head first or stops hard in front of it
// and rears up to rake it with the big claws of its forepaws; then one long
// flat bound home, still facing the foe, landing with its weight. What it
// fires leaves its mouth: the head drives forward and the forepaws brace.
// The animator adds overlapping action (head, forelegs and paws trail the
// body, so events that depend on them sit a little after their key),
// breathing, blinks and springs on the tail, ears and cheek fur.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FIERCE: Pose = { expression: 'fierce' };
const WINK: Pose = { expression: 'wink' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };

const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The long body's pitch from the hips forward (+ down, - rearing up): the
 * front half at the hips (spine), again at the shoulders (chest), the neck
 * and the head, with the head's turn (+ to its left) and tilt.
 */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The front half turned over its paws (+ toward its left) and rolled (+ its left shoulder up). */
const twist = (y: number, roll = 0): Pose => ({ bones: { spine: { y, z: roll } } });
/** The rear half at the hips: + raises the rump, sway + swings it to its right. */
const rump = (x: number, sway = 0): Pose => ({ bones: { hips: { x, y: sway } } });
/**
 * The long tail: lift (+ raises it at the rump), sweep (+ swings it to its
 * right) and curl (+ straightens its far half back, - curls it up over).
 */
const tail = (lift: number, sweep = 0, curl = 0): Pose => ({
  bones: {
    tail: { x: lift, y: sweep },
    tail2: { x: curl * 0.2, y: sweep * 0.2 },
    tail3: { x: curl * 0.4 },
    tail4: { x: curl * 0.4 },
  },
});
/** Ears: + pricked forward, - laid back. */
const ears = (x: number): Pose => ({ bones: { earL: { x }, earR: { x } } });

// Legs ------------------------------------------------------------------------
// The paws are planted by the foot IK where the stance puts them (rig.ts); a
// key that lifts the front legs aims them (upper leg, lower leg), one that
// lifts the hind legs swings them at the hip and the hock.

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both front legs lifted and aimed: the left's upper and lower directions; the right mirrors them unless given. */
const fore = (arm: Vec3, forearm: Vec3, armR: Vec3 = mirror(arm), forearmR: Vec3 = mirror(forearm)): Pose => ({
  plantFront: 0,
  aim: { armL: { dir: arm }, forearmL: { dir: forearm }, armR: { dir: armR }, forearmR: { dir: forearmR } },
});
/** Front paws planted (the stance's aims only seed the elbows' bend). */
const FORE_DOWN: Pose = { plantFront: 1, aim: structuredClone(STANCE.aim) };
/**
 * Hind legs lifted: swung at the hip (+ back, - forward under the belly) and
 * bent at the hock (+ the paw swung down and back, - folded up under it).
 */
const hind = (swingL: number, foldL: number, swingR = swingL, foldR = foldL): Pose => ({
  plantFeet: 0,
  bones: { thighL: { x: swingL }, shinL: { x: foldL }, thighR: { x: swingR }, shinR: { x: foldR } },
});

/** Forepaws reaching out ahead (the dash's stretched stride, a pounce). */
const PAWS_REACH = fore([0.12, -0.45, 0.88], [0.06, -0.5, 0.86]);
/** Forepaws folded back under the chest (the gathered stride, a bound). */
const PAWS_TUCK = fore([0.1, -0.62, -0.78], [0.05, -0.25, 0.97]);
/** Reared up, both forepaws held up in front of the chest. */
const PAWS_UP = fore([0.14, -0.4, 0.9], [0.04, -0.8, 0.6]);
/** Forepaws flung out wide and up (the cry, a flourish). */
const PAWS_WIDE = fore([0.75, -0.3, 0.59], [0.5, 0.35, 0.79]);
/** Hind legs driven out behind, near level (the push-off, the stretched stride). */
const HIND_BACK = hind(65, 95);
/** Hind legs gathered up under the belly, paws forward (the gathered stride). */
const HIND_UNDER = hind(-35, -10);

/** In the air, stretched out flat: forepaws reaching, hind legs driven back. */
const STRETCH: Pose[] = [HIND_BACK, PAWS_REACH];
/** In the air, gathered: every paw drawn in under the body. */
const GATHER: Pose[] = [HIND_UNDER, PAWS_TUCK];
/** Landing: every paw down, the long body sinking into it. */
const LAND: Pose[] = [{ plantFeet: 1 }, FORE_DOWN, pelvis(0, -0.035), rump(4), bend(4, 0, 4, -4)];
/**
 * Coiled to bolt: low on its paws, the rump up, the head lowered level with
 * the eyes locked on the foe, ears laid back, the tail drawn down behind.
 */
const COIL: Pose[] = [pelvis(0, -0.065, -0.035), rump(13), bend(8, 0, 12, -10), ears(-32), tail(-20, 0, 10)];

/**
 * The right claws cocked high above its head and out to its right (reared
 * up): clear of the body from both sides, as Blaziken's slash holds its claw
 * up. The left forepaw held low toward the foe.
 */
const CLAW_COCKED = fore([0.2, -0.45, 0.87], [0.05, -0.55, 0.83], [-0.88, 0.4, 0.26], [-0.6, 0.8, -0.05]);
/** The rake: the right claws driven forward and down across the foe, the left reaching for the ground. */
const CLAW_RAKE = fore([0.2, -0.7, 0.68], [0.1, -0.85, 0.5], [-0.2, -0.05, 0.98], [0.35, -0.6, 0.72]);
/** Carried through: the right claws low past its left side. */
const CLAW_PAST = fore([0.2, -0.7, 0.68], [0.1, -0.85, 0.5], [0.35, -0.55, 0.76], [0.85, -0.4, 0.34]);

// The moments ------------------------------------------------------------------

/** Idle: breathing low on its paws, the tail swaying (its springs carry the tip). */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), bend(1.5, 0, -1, 1), rump(-1), tail(2, 3)),
    key(2.4),
  ],
};

/**
 * Sent out (the stock front anim grows and vibrates): curled low with its
 * head tucked and the tail wrapped round, it bursts up onto its haunches with
 * the forepaws flung wide and cries, head up and shaking; then it drops onto
 * all fours and settles.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.07, -0.02), rump(-4), bend(10, 4, 20, 20), tail(-35, -20, -20), ears(-30), SHUT),
    key(0.2, pelvis(0, -0.085, -0.03), rump(-5), bend(12, 4, 22, 22), tail(-38, -22, -22), ears(-34), SHUT),
    // Up onto its haunches: head thrown up, forepaws wide, the cry.
    snap(0.42, pelvis(0, 0.01, -0.035), rump(-8), bend(-26, -6, -8, -14), PAWS_WIDE, jaw(30), ears(10), tail(22, 0, -10), ANGRY),
    key(0.62, pelvis(0, 0.012, -0.035), rump(-8), bend(-25, -6, -8, -12, 0, 5), PAWS_WIDE, jaw(26), ears(12), tail(24, 6, -10), ANGRY),
    key(0.8, pelvis(0, 0.012, -0.035), rump(-8), bend(-26, -6, -8, -13, 0, -5), PAWS_WIDE, jaw(28), ears(12), tail(24, -6, -10), ANGRY),
    // Down onto all fours.
    key(0.98, pelvis(0, -0.004, -0.02), rump(-4), bend(-10, -2, -2, -4), PAWS_UP, jaw(6), ears(4), tail(14), ANGRY),
    key(1.16, ...LAND, pelvis(0, -0.03), tail(4), ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Taking a hit: the head snaps back and up, ears flat, then it shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0.01, -0.03), rump(-4), bend(-10, -4, -14, -16), ears(-30), tail(10), jaw(10), HURT),
    key(0.2, pelvis(0, 0, -0.015), rump(-2), bend(-4, -1, -6, -6), ears(-15), tail(4), jaw(4), HURT),
    key(0.36, pelvis(0, -0.008, 0.004), bend(3, 0, 3, 3), ears(-4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): its head droops
 * in a tired sway, then it sinks down and curls up like a sleeping weasel,
 * the front half and the head turned in to its side and the tail wrapped
 * round, eyes shut; from the 'shrink' the curled body shrinks away. It
 * curls in to its side, not forward: laid out in front of its paws, a wild
 * one's head went under our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.01, -0.01), bend(-4, -2, 6, 10, 0, 6), ears(-12), tail(-6), DROWSY),
    key(0.48, pelvis(0, -0.06, -0.03), rump(-4, -8), bend(0, 2, 10, 16, 16, 8), { bones: { spine: { y: 12 }, neck: { y: 10 } } }, ears(-24), tail(-24, -20, -10), SHUT),
    key(0.82, pelvis(0, -0.1, -0.04), rump(-8, -16), bend(-2, 2, 14, 22, 26, 10), { bones: { spine: { y: 24 }, chest: { y: 8 }, neck: { y: 16 } } }, ears(-30), tail(-40, -36, -20), SHUT),
    key(0.96, pelvis(0, -0.105, -0.04), rump(-8, -17), bend(-2, 2, 15, 23, 27, 10), { bones: { spine: { y: 25 }, chest: { y: 8 }, neck: { y: 17 } } }, ears(-31), tail(-41, -37, -21), SHUT),
    key(1.6, pelvis(0, -0.103, -0.04), rump(-8, -16.5), bend(-2, 2, 14.5, 22.5, 26.5, 10), { bones: { spine: { y: 24.5 }, chest: { y: 8 }, neck: { y: 16.5 } } }, ears(-30), tail(-40.5, -36.5, -20.5), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// Contact ------------------------------------------------------------------------

/**
 * Tackle, Headbutt, Facade, Secret Power, Pursuit, Struggle (tackle), after
 * Blaziken's tackle: it goes still and coils, bolts at the foe in one flat
 * bound, low and stretched out, gathers, and rams it head first with the
 * whole long body behind the blow; it bounces off and bounds home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.2,
  keys: [
    key(0),
    key(0.14, ...COIL, FIERCE),
    // The dash: one long flat bound, stretched out, belly skimming the ground.
    key(0.22, { advance: 0.5, root: { y: 0.05, pitch: 3 } }, ...STRETCH, bend(-2, 0, 12, -10), rump(-6), ears(-40), tail(-36, 0, 24), FIERCE),
    // Gathered for the ram.
    key(0.28, { advance: 0.84, root: { y: 0.04 } }, ...GATHER, bend(8, 2, 14, -4), rump(6), ears(-40), tail(-30, 0, 18), FIERCE),
    // The ram: forehead first, the whole long body behind it, the hind legs driving.
    snap(0.33, { advance: 1, root: { y: 0.02, z: 0.2 } }, HIND_BACK, PAWS_REACH, bend(6, 2, 16, 16), rump(-4), ears(-44), tail(-36, 0, 24), SHUT),
    key(0.38, { advance: 1, root: { y: 0.015, z: 0.19 } }, HIND_BACK, PAWS_REACH, bend(7, 2, 17, 18), rump(-4), ears(-44), tail(-37, 0, 24), SHUT),
    // Bounces off it and carries on home in one long flat bound, shaking its head.
    key(0.5, { advance: 0.78, root: { y: 0.08 } }, ...GATHER, bend(-2, 0, 6, 4, 6), rump(-2), ears(-14), tail(-6), ANGRY),
    key(0.64, { advance: 0.4, root: { y: 0.075 } }, ...GATHER, bend(-3, 0, 0, -3, -6), ears(-12), tail(-4), ANGRY),
    key(0.78, { advance: 0 }, ...LAND, ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'impact' }],
};

/**
 * The big ram (Double-Edge, Strength, Return, Frustration, Flail: the strong
 * tackles), after Blaziken's physical_strong for its scale: a long coil with
 * the haunches wiggling, two flat strides, then it launches its whole long
 * body at the foe like a spear and crashes into it head and shoulders first;
 * the recoil throws it back, it lands hard and shakes it off, and bounds home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.0,
  keys: [
    key(0),
    // Coil: very low, the rump high and wiggling, the head level on the foe.
    key(0.2, ...COIL, pelvis(0, -0.015, -0.01), rump(4, 12), tail(-4, -20), FIERCE),
    key(0.34, ...COIL, pelvis(0, -0.025, -0.02), rump(6, -12), tail(-6, 20), FIERCE),
    // Two flat strides: stretched...
    key(0.44, { advance: 0.34, root: { y: 0.05, pitch: 3 } }, ...STRETCH, bend(-2, 0, 12, -10), rump(-6), ears(-40), tail(-36, 0, 24), FIERCE),
    // ...gathered...
    key(0.52, { advance: 0.6, root: { y: 0.035 } }, ...GATHER, bend(8, 2, 14, -4), rump(8), ears(-40), tail(-30, 0, 18), FIERCE),
    // ...and it launches itself, stretched out like a spear, head first.
    key(0.6, { advance: 0.88, root: { y: 0.1, pitch: -3 } }, ...STRETCH, bend(-4, 0, 14, 4), rump(-8), ears(-44), tail(-40, 0, 28), FIERCE),
    // The crash: head and shoulders into the foe, everything behind it.
    snap(0.68, { advance: 1, root: { y: 0.05, z: 0.24, pitch: 6 } }, HIND_BACK, PAWS_REACH, bend(6, 2, 18, 18), rump(-6), ears(-46), tail(-38, 0, 26), SHUT),
    key(0.74, { advance: 1, root: { y: 0.04, z: 0.22, pitch: 7 } }, HIND_BACK, PAWS_REACH, bend(7, 2, 19, 20, 0, 4), rump(-6), ears(-46), tail(-39, 0, 26), SHUT),
    // The recoil throws it back, hurt.
    key(0.88, { advance: 0.82, root: { y: 0.1 } }, ...GATHER, bend(-4, -2, 4, 2, 0, 8), rump(-4), ears(-20), tail(6), HURT),
    // Lands hard and shakes it off.
    fall(1.0, { advance: 0.72 }, ...LAND, pelvis(0, -0.06), HURT),
    key(1.12, { advance: 0.72 }, ...LAND, pelvis(0, -0.045), bend(4, 0, 4, -2, 12, 8), ears(-16), ANGRY),
    key(1.24, { advance: 0.72 }, ...LAND, pelvis(0, -0.035), bend(3, 0, 3, -2, -10, -6), ears(-14), ANGRY),
    // Bounds home.
    key(1.4, { advance: 0.36, root: { y: 0.08 } }, ...GATHER, bend(-3, 0, 0, -3), ears(-12), tail(-4), ANGRY),
    key(1.56, { advance: 0 }, ...LAND, ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/**
 * Slash, Fury Swipes, Cut, Fury Cutter, Rock Smash, Covet, Thief (strike),
 * after Blaziken's physical_weak: it bolts in and stops hard in front of the
 * foe, rears up with its right claws cocked high beside its head, then
 * pounces into the rake: the claws come down and across the foe's face with
 * the shoulders and the whole body behind them, carry through low past its
 * side and hang there; it drops back onto all fours and bounds home. A run
 * of Fury Swipes repeats the rake from the stop (src/battle3d/variants.ts).
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.35,
  keys: [
    key(0),
    key(0.13, ...COIL, twist(-6), FIERCE),
    // The dash.
    key(0.21, { advance: 0.5, root: { y: 0.05, pitch: 3 } }, ...STRETCH, bend(-2, 0, 12, -10), rump(-6), ears(-40), tail(-36, 0, 24), FIERCE),
    key(0.28, { advance: 0.86, root: { y: 0.04 } }, ...GATHER, bend(6, 2, 12, -4), rump(6), ears(-38), tail(-28, 0, 18), FIERCE),
    // The hard stop: the forepaws plant, the rump carries up over them, the head dips.
    key(0.34, { advance: 1 }, ...LAND, pelvis(0, -0.05, 0.02), rump(14), bend(8, 0, 10, -4), ears(-24), tail(-6, 0, 10), FIERCE),
    // Pops up onto its haunches, turned away, the head level on the foe and the right claws cocked high and wide.
    snap(0.44, { advance: 1 }, pelvis(0, 0.005, -0.045), rump(-8), bend(-28, -6, 26, 8, 6), twist(-16, -8), CLAW_COCKED, ears(-10), tail(-10, 12), FIERCE),
    key(0.48, { advance: 1 }, pelvis(0, 0.008, -0.05), rump(-8), bend(-30, -6, 27, 8, 7), twist(-18, -9), CLAW_COCKED, ears(-10), tail(-11, 13), FIERCE),
    // The rake: it pounces up and in, the front half unwinding, the claws coming down across the foe.
    snap(0.54, { advance: 1, root: { y: 0.06, z: 0.2 } }, HIND_BACK, bend(-8, 2, 16, 12, -8), twist(18, 8), CLAW_RAKE, ears(-34), tail(-18, -12), FIERCE),
    // Follow-through: the claws carry on low past its left side and hang there.
    key(0.68, { advance: 1, root: { y: 0.03, z: 0.18 } }, HIND_BACK, bend(-2, 4, 12, 14, -10), twist(22, 10), CLAW_PAST, ears(-32), tail(-20, -14), FIERCE),
    // Down on all fours in front of the foe.
    key(0.8, { advance: 1 }, ...LAND, pelvis(0, -0.04, 0.01), rump(8), bend(6, 0, 6, -2), ears(-20), tail(-4), ANGRY),
    // Bounds home.
    key(0.95, { advance: 0.45, root: { y: 0.08 } }, ...GATHER, bend(-3, 0, 0, -3), ears(-12), tail(-4), ANGRY),
    key(1.08, { advance: 0 }, ...LAND, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  // The paw trails the leg by its overlap: the claws rake through the foe just after the key.
  events: [{ t: 0.6, name: 'impact' }],
};

/**
 * Iron Tail (tail), after Swampert's tail and Sceptile's tail slam: the long
 * tail drawn up stiff as a club, it bolts in, springs up and whirls round in
 * the air, its back to the foe and the tail reared high over it, then whips
 * the tail down onto the foe like a steel club; it lands, swings back round
 * and bounds home.
 */
const tailClip: Clip = {
  name: 'tail',
  duration: 1.8,
  keys: [
    key(0),
    // Coil, the tail drawn up stiff and straight behind.
    key(0.16, ...COIL, tail(40, -4, 44), FIERCE),
    // The dash, the tail held up.
    key(0.26, { advance: 0.55, root: { y: 0.05, pitch: 3 } }, ...STRETCH, bend(-2, 0, 12, -10), rump(-6), ears(-40), tail(16, 0, 40), FIERCE),
    // At the foe it springs up, whirling round, the tail swinging out...
    key(0.38, { advance: 0.92, root: { y: 0.16, yaw: 100 } }, ...GATHER, bend(0, 0, 6, -4), ears(-36), tail(10, -20, 40), FIERCE),
    // ...its back to the foe at the top, the tail reared high over it.
    key(0.48, { advance: 1, root: { y: 0.21, yaw: 172 } }, ...GATHER, bend(-4, 0, 4, -6), ears(-36), tail(36, 0, 44), FIERCE),
    key(0.53, { advance: 1, root: { y: 0.2, yaw: 180 } }, ...GATHER, bend(-5, 0, 4, -6), ears(-36), tail(40, 0, 46), FIERCE),
    // The whip: the tail comes down over and onto the foe like a steel club.
    snap(0.6, { advance: 1, root: { y: 0.09, yaw: 190, z: 0.16 } }, ...GATHER, bend(6, 0, 8, 0), ears(-40), tail(-78, 0, 40), SHUT),
    key(0.65, { advance: 1, root: { y: 0.06, yaw: 194, z: 0.16 } }, ...GATHER, bend(6, 0, 8, 1), ears(-40), tail(-80, 0, 40), SHUT),
    key(0.74, { advance: 1, root: { yaw: 198, z: 0.14 } }, ...LAND, pelvis(0, -0.03), ears(-38), tail(-82, 0, 40), SHUT),
    // Swinging back round to face the foe.
    key(0.86, { advance: 0.86, root: { y: 0.07, yaw: 290 } }, ...GATHER, bend(-2, 0, 0, -2), ears(-16), tail(-10, 10, 20), ANGRY),
    key(1.0, { advance: 0.8, root: { yaw: 360 } }, ...LAND, ears(-12), tail(-4), ANGRY),
    // Bounds home.
    key(1.16, { advance: 0.4, root: { y: 0.08, yaw: 360 } }, ...GATHER, bend(-3, 0, 0, -3), ears(-12), ANGRY),
    key(1.3, { advance: 0, root: { yaw: 360 } }, ...LAND, ANGRY),
    key(1.8, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  // The tail trails the rump by its overlap: its far half comes down on the foe after the key.
  events: [{ t: 0.66, name: 'impact' }],
};

/** Spread flat in the air, every leg flung out (the belly flop). */
const SPREAD: Pose[] = [
  fore([0.7, -0.25, 0.67], [0.55, -0.2, 0.81]),
  { plantFeet: 0, bones: { thighL: { x: 55, z: 30 }, shinL: { x: 70 }, thighR: { x: 55, z: -30 }, shinR: { x: 70 } } },
];

/**
 * Body Slam (slam), after Blaziken's slam: it bolts in, springs high off the
 * run, spreads every leg at the top and comes down belly first on the foe
 * with its whole long weight; it bounces off, lands deep and bounds home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 1.95,
  keys: [
    key(0),
    // Coil.
    key(0.2, ...COIL, pelvis(0, -0.02), FIERCE),
    // A flat stride...
    key(0.3, { advance: 0.42, root: { y: 0.05, pitch: 3 } }, ...STRETCH, bend(-2, 0, 12, -10), rump(-6), ears(-40), tail(-36, 0, 24), FIERCE),
    // ...and it springs high off it.
    key(0.4, { advance: 0.66, root: { y: 0.18, pitch: -8 } }, ...GATHER, bend(-6, 0, 6, -8), rump(4), ears(-30), tail(-20, 0, 20), FIERCE),
    // The top: spread flat over the foe, tipping forward.
    key(0.52, { advance: 0.9, root: { y: 0.3, z: 0.1, pitch: 14 } }, ...SPREAD, bend(-4, 0, 8, -6), ears(-24), tail(-30, 0, 30), jaw(10), FIERCE),
    // Down on it, belly first, with its whole weight.
    snap(0.64, { advance: 1, root: { y: 0.12, z: 0.36, pitch: 26 } }, ...SPREAD, bend(4, 0, 12, 4), ears(-40), tail(-36, 0, 30), SHUT),
    key(0.72, { advance: 1, root: { y: 0.1, z: 0.35, pitch: 28 } }, ...SPREAD, bend(5, 0, 13, 5, 0, 3), ears(-40), tail(-38, 0, 30), SHUT),
    // Bounces off it.
    key(0.86, { advance: 0.92, root: { y: 0.16, z: 0.1, pitch: 6 } }, ...GATHER, bend(-4, 0, 2, -6), ears(-16), tail(-10), ANGRY),
    // Lands in front of it, deep, and holds.
    fall(1.0, { advance: 0.86 }, ...LAND, pelvis(0, -0.07), ears(-18), ANGRY),
    key(1.2, { advance: 0.86 }, ...LAND, pelvis(0, -0.045), bend(4, 0, 4, -2, 0, 2), ears(-14), ANGRY),
    // Bounds home.
    key(1.36, { advance: 0.42, root: { y: 0.08 } }, ...GATHER, bend(-3, 0, 0, -3), ears(-12), tail(-4), ANGRY),
    key(1.5, { advance: 0 }, ...LAND, ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

/** Scrabbling at the ground: one forepaw raking back under the chest, the other reaching to dig (`right`: the right rakes). */
const scrabble = (right: boolean): Pose =>
  right
    ? fore([0.1, -0.7, 0.7], [0.05, -0.9, 0.42], [-0.1, -0.9, -0.42], [-0.05, -0.85, 0.52])
    : fore([0.1, -0.9, -0.42], [0.05, -0.85, 0.52], [-0.1, -0.7, 0.7], [-0.05, -0.9, 0.42]);
/** Nose down and rump up over the hole it digs. */
const DIGGING: Pose[] = [pelvis(0, -0.04), rump(14), bend(16, 6, 20, 14), ears(-26), tail(-10)];
/** How deep it goes: out of sight. */
const UNDER = -1.3;

/**
 * Dig (burrow), after the burrow clips of Blaziken and Swampert: nose down
 * and rump up, it scrabbles frantically at the earth with both forepaws
 * (dig: the dirt flies) and dives in head first, the long body and tail
 * following it under; it tunnels straight to the foe and bursts up out of the
 * ground right in front of it, head and claws first, driving up into it (the
 * impact as it breaks the surface); it drops back down, crouches a moment
 * and bounds home. The battles cut it at its deepest for Dig's first turn.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.2,
  keys: [
    key(0),
    key(0.12, ...DIGGING, FIERCE),
    key(0.2, ...DIGGING, scrabble(true), FIERCE),
    key(0.28, ...DIGGING, pelvis(0, -0.005), scrabble(false), FIERCE),
    // Dives in head first, the rump and the tail going in last, gathering speed.
    key(0.38, { root: { y: -0.12, pitch: 32 } }, { plantFeet: 0 }, ...DIGGING, scrabble(true), SHUT),
    fall(0.6, { root: { y: UNDER, pitch: 44 } }, { plantFeet: 0 }, ...DIGGING, PAWS_REACH, tail(10, 0, 30), SHUT),
    // Underground (nothing to stand on): it tunnels over to the foe.
    key(0.74, { advance: 0.3, plantFeet: 0, root: { y: UNDER, pitch: 20 } }, pelvis(0, -0.04), bend(6, 0, 10, 0), PAWS_REACH, tail(-10, 0, 20), SHUT),
    key(0.9, { advance: 1, plantFeet: 0, root: { y: UNDER + 0.05, pitch: -16 } }, pelvis(0, -0.06), bend(8, 2, 12, 4), PAWS_TUCK, tail(-20, 0, 20), FIERCE),
    // Bursts up out of the ground in front of the foe, head and claws first.
    snap(1.04, { advance: 1, root: { y: 0.24, z: 0.12, pitch: -32 } }, PAWS_UP, HIND_BACK, bend(-8, -4, 2, -8), ears(-36), jaw(22), tail(-26, 0, 24), FIERCE),
    key(1.16, { advance: 0.96, root: { y: 0.3, z: 0.1, pitch: -26 } }, PAWS_UP, HIND_BACK, bend(-10, -4, 0, -10), ears(-32), jaw(18), tail(-20, 0, 20), FIERCE),
    // Drops back down in front of it and crouches.
    fall(1.32, { advance: 0.88 }, ...LAND, pelvis(0, -0.06), ears(-20), jaw(0), ANGRY),
    key(1.6, { advance: 0.88 }, ...LAND, pelvis(0, -0.04), bend(4, 0, 4, -2, 0, 2), ears(-16), ANGRY),
    // Bounds home.
    key(1.76, { advance: 0.42, root: { y: 0.08 } }, ...GATHER, bend(-3, 0, 0, -3), ears(-12), tail(-4), ANGRY),
    key(1.9, { advance: 0 }, ...LAND, ANGRY),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.24, name: 'dig' }, { t: 1.0, name: 'impact' }],
};

/** Forepaws hugged in under its chin. */
const PAWS_HUG = fore([0.1, -0.3, 0.95], [-0.45, 0.35, 0.82], [-0.1, -0.3, 0.95], [0.45, 0.35, 0.82]);
/**
 * Curled up tight for a roll: the front half and the head tucked down under,
 * the rump curled under, the tail wrapped over, every paw drawn in. Its middle
 * (model space: 0.04 up, 0.14 behind the root) is moved onto the root's pivot,
 * so root.pitch rolls it about its middle.
 */
const CURLED: Pose[] = [bend(60, 30, 40, 50), rump(-60), tail(10, 0, -100), ears(-30), hind(-80, 70), PAWS_HUG, pelvis(0, -0.04, 0.14), SHUT];
/** The curled body's radius, scaled (units of its height). */
const BALL_R = 0.62;
/** The ball at advance `a`, rolled `deg` forward; `z` rams it on into the foe, `lift` bounces it. */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_R + lift, z, pitch: deg }, scale: 0.86 }, ...CURLED,
];

/**
 * Rollout (spin), after Swampert's spin: it curls up tight and rolls at the
 * foe dead straight, faster and faster, rams into it and grinds against it,
 * bounces back, rolls home and uncurls.
 */
const spin: Clip = {
  name: 'spin',
  duration: 2.0,
  keys: [
    key(0),
    // Curling down, then snapping shut into a ball.
    key(0.18, pelvis(0, -0.06), rump(-10), bend(14, 6, 16, 16), tail(-14, 0, -20), ears(-26), SHUT),
    // Rolling at the foe.
    snap(0.3, ...ball(0, 40)),
    key(0.44, ...ball(0.28, 200)),
    key(0.56, ...ball(0.62, 380)),
    key(0.64, ...ball(0.88, 520)),
    // Rams into it and grinds.
    snap(0.7, ...ball(1, 610, 0.2)),
    key(0.8, ...ball(1, 630, 0.2)),
    // Bounces back and rolls home, backward.
    key(0.92, ...ball(0.84, 596, 0.05, 0.08)),
    key(1.08, ...ball(0.46, 490)),
    key(1.24, ...ball(0.1, 400)),
    key(1.34, ...ball(0, 372)),
    // Pops open, facing the foe.
    snap(1.48, { root: { pitch: 360 } }, ...LAND, pelvis(0, -0.06), bend(8, 2, 8, 6), ears(-16), ANGRY),
    key(1.66, { root: { pitch: 360 } }, pelvis(0, -0.03), bend(3, 0, 2, 0, 6, 4), ears(-8), ANGRY),
    key(2.0, { root: { pitch: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'impact' }],
};

/** The moments and the contact clips. */
export const SET_CONTACT: Clip[] = [idle, intro, hit, faint, tackle, physicalStrong, physicalWeak, tailClip, slam, burrow, spin];

/** Eye atlas (pm0264_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  wink: [1, 1],
  closed: [0, 2],
  fierce: [1, 2],
  hurt: [0, 3],
};

// The set's helpers, for the clips played at home (./set_home.ts).
export {
  key, snap, fall, ANGRY, FIERCE, WINK, SHUT, DROWSY, HURT, OPEN_EYES, jaw, pelvis, bend, twist, rump, tail, ears,
  fore, FORE_DOWN, hind, PAWS_REACH, PAWS_TUCK, PAWS_UP, PAWS_WIDE, PAWS_HUG, HIND_BACK, HIND_UNDER, STRETCH, GATHER, LAND, COIL,
};
