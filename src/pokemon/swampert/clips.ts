// Swampert's battle animation set: one clip per attack category (+ idle,
// intro, hit, faint) and motif clips for the actions its moves need (quake,
// wave, shield, punch, strike, glare, kick_sand). Keys are STANCE + deltas
// (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (hops, slams, sink)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (open, angry, half, closed, squint, narrow, hurt)
// Events: impact (contact lands), release (projectile/stream/wave starts),
// releaseEnd, charge, cry, aura, emit, thud.
//
// How Swampert moves (the brief in index.ts):
//   - it is heavy (82 kg) and low: wind-ups are long, hops are short and
//     low, landings sink deep into the knees; it never springs like a fighter;
//   - its power is its mass and its arms: tackles lead with the shoulder and
//     the whole body, Earthquake hammers both fists into the ground, Surf and
//     Muddy Water are heaved up with both arms and pushed at the foe;
//   - water and mud come from its huge mouth: the head drives forward, the
//     jaw drops wide, and the body braces in a sumo crouch against the recoil;
//   - arms that don't act stay braced out at its sides (the stance's crab
//     arms) so the silhouette reads.
// The animator adds overlapping action (head, arms and hands trail the body,
// so events that depend on them sit a little after their key), breathing,
// blinks and springs on the head fins, gills and tail fan.

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
const SHUT: Pose = { expression: 'closed' };
const SQUINT: Pose = { expression: 'squint' };
const NARROW: Pose = { expression: 'narrow' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
/** Jaw relative to the stance's open mouth (22°): jaw(-20) shuts it, jaw(24) gapes. */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const MOUTH_SHUT = jaw(-20);
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** Upper-body twist (+ turns the chest toward its left: the right shoulder comes forward). */
const twist = (deg: number): Pose => ({ bones: { spine: { y: deg } } });

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both arms (left given, right mirrored unless given): upper arm, forearm, hand. */
const arms = (armL: Vec3, forearmL: Vec3, handL: Vec3, right?: [Vec3, Vec3, Vec3]): Pose => ({
  aim: {
    armL: { dir: armL },
    forearmL: { dir: forearmL },
    handL: { dir: handL },
    armR: { dir: right?.[0] ?? mirror(armL) },
    forearmR: { dir: right?.[1] ?? mirror(forearmL) },
    handR: { dir: right?.[2] ?? mirror(handL) },
  },
});

/** Both fists raised high overhead (rearing up for a slam or a wave). */
const ARMS_UP = arms([0.5, 0.82, 0.28], [0.18, 0.95, 0.25], [-0.1, 0.97, 0.2]);
/** Arms flung up and out in a V (battle cry, calling the sky). */
const ARMS_SPREAD_UP = arms([0.85, 0.45, 0.25], [0.55, 0.8, 0.2], [0.2, 0.95, 0.2]);
/** Arms thrown wide at shoulder height (roaring at the foe). */
const ARMS_WIDE = arms([0.95, 0.05, 0.3], [0.75, -0.35, 0.55], [0.3, -0.7, 0.65]);
/** Both fists hammered down onto the ground in front. */
const HAMMER_DOWN = arms([0.3, -0.5, 0.81], [0.08, -0.82, 0.57], [-0.1, -0.97, 0.2]);
/** Both arms thrust forward, palms toward the foe (pushing a wave). */
const PUSH = arms([0.38, -0.1, 0.92], [0.18, -0.02, 0.98], [0.02, 0.35, 0.94]);
/** The push follows through, low and long. */
const PUSH_LOW = arms([0.32, -0.35, 0.88], [0.15, -0.3, 0.94], [0.02, -0.1, 0.99]);
/** Arms swept down and back (scooping up water). */
const ARMS_SCOOP = arms([0.55, -0.75, -0.35], [0.3, -0.7, -0.65], [0.1, -0.5, -0.86]);
/** Forearms crossed in front of the face (Protect). */
const CROSSED_GUARD = arms([0.55, -0.45, 0.7], [-0.72, 0.62, 0.3], [-0.55, 0.8, 0.2]);
/** Arms crossed low in front of the belly (gathering, curled up). */
const CROSSED_LOW = arms([0.45, -0.7, 0.55], [-0.75, -0.2, 0.62], [-0.6, -0.55, 0.55]);
/** Sumo brace: arms planted low at the sides, hands by the knees (bracing a blast). */
const BRACED = arms([0.75, -0.6, 0.25], [0.25, -0.85, 0.45], [-0.1, -0.95, 0.3]);
/** Elbows drawn back and up, chest open (drawing breath). */
const ELBOWS_BACK = arms([0.7, -0.2, -0.68], [0.35, -0.35, 0.87], [0.0, -0.6, 0.8]);
/** Arms tucked in, forearms up before the chest (a shoulder charge). */
const ARMS_TUCKED = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.35, 0.4, 0.85]);
/** Arms drawn back behind the body (coiling to launch). */
const ARMS_BACK = arms([0.6, -0.35, -0.72], [0.45, -0.6, -0.66], [0.2, -0.8, -0.56]);
/** Arms spread forward and wide (about to crash onto the foe). */
const ARMS_FWD_SPREAD = arms([0.75, -0.15, 0.65], [0.45, -0.35, 0.82], [0.1, -0.55, 0.83]);
/** Flinch: the hands jerk up by the face. */
const FLINCH = arms([0.85, 0.2, 0.45], [0.2, 0.6, 0.75], [-0.3, 0.7, 0.6]);
/** Arms hanging limp (fainting). */
const LIMP_ARMS = arms([0.55, -0.83, 0.1], [0.2, -0.95, 0.2], [0.05, -0.99, 0.1]);
/** Right fist cocked far back, left arm out front as a guard. */
const CHAMBER_R = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.55, 0.25, -0.8], [-0.25, 0.1, 0.96], [0.0, -0.1, 0.99]]);
/** Right fist driven straight at the foe, left fist pulled back to the hip. */
const PUNCH_R = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, 0.02, 0.99], [-0.05, 0.02, 1], [-0.02, 0.05, 1]]);
/** The punch carries through past the foe. */
const PUNCH_R_THROUGH = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[0.12, -0.08, 0.99], [0.2, -0.1, 0.97], [0.25, -0.1, 0.96]]);
/** Right hand raised high behind the head, edge ready to chop (Brick Break). */
const CHOP_RAISED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.55, 0.6, -0.58], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]]);
/** The chop drives down and across in front. */
const CHOP_DOWN = arms([0.7, -0.5, -0.5], [0.3, -0.4, 0.87], [0.1, -0.5, 0.86], [[-0.25, -0.35, 0.9], [0.35, -0.75, 0.56], [0.45, -0.8, 0.4]]);
/** Fingers curled into fists. */
const FISTS: Pose = {
  bones: {
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
    fingerA1R: { z: 40 }, fingerB1R: { z: 40 }, fingerC1R: { z: 40 },
    fingerA2R: { z: 34 }, fingerB2R: { z: 34 }, fingerC2R: { z: 34 },
  },
};

/** Airborne: knees drawn up, feet trailing (legs rotate, so blends stay smooth). */
const TUCK: Pose = { plantFeet: 0, bones: { thighL: { x: -30 }, thighR: { x: -30 }, shinL: { x: 40 }, shinR: { x: 40 } } };
/** Airborne, hopping back: knees drawn up a little. */
const HOP: Pose = { plantFeet: 0, bones: { thighL: { x: -18 }, thighR: { x: -18 }, shinL: { x: 22 }, shinR: { x: 22 } } };
/** Landing: the knees take the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.05 }, bones: { spine: { x: 8 }, head: { x: -6 } } };

// Battle moments --------------------------------------------------------------

/** Idle: slow, heavy breathing through the open mouth; the life layer adds the rest. */
const idle: Clip = {
  name: 'idle',
  duration: 2.8,
  loop: true,
  keys: [
    key(0),
    key(1.4, pelvis(0, -0.008), { bones: { spine: { x: 2 } } }, jaw(4), { post: { armL: { z: 3 }, armR: { z: -3 } } }),
    key(2.8),
  ],
};

/**
 * Sent out: rises from a curled crouch in a big heavy jump (the stock front
 * anim is ANIM_V_JUMPS_BIG), lands deep, then roars with its arms flung up.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.95,
  keys: [
    key(0, pelvis(0, -0.07), bend(18, 6, 0, 16), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Coil deeper.
    key(0.22, pelvis(0, -0.1), bend(24, 8, 2, 20), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Burst up, arms flung open.
    snap(0.42, { root: { y: 0.13 } }, TUCK, bend(-8, -4, -2, -12), ARMS_SPREAD_UP, jaw(6), ANGRY),
    key(0.55, { root: { y: 0.15 } }, TUCK, bend(-9, -5, -2, -14), ARMS_SPREAD_UP, jaw(8), ANGRY),
    // Heavy landing, deep in the knees.
    fall(0.72, LAND, pelvis(0, -0.03), bend(8, 2, 0, 4), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(0.8, LAND, pelvis(0, -0.035), bend(9, 2, 0, 5), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    // Roar: rears up, arms up, jaw wide (moving hold).
    snap(0.96, pelvis(0, 0.012), bend(-12, -8, -6, -20), ARMS_SPREAD_UP, jaw(26), ANGRY),
    key(1.14, pelvis(0, 0.014), bend(-13, -8, -6, -22, 5, 3), ARMS_SPREAD_UP, jaw(28), ANGRY),
    key(1.32, pelvis(0, 0.012), bend(-12, -8, -6, -21, -5, -3), ARMS_SPREAD_UP, jaw(26), ANGRY),
    // Settles into its crab-armed stance.
    key(1.52, pelvis(0, -0.012), bend(5, 2, 0, -2), jaw(4), ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 1.02, name: 'cry' }],
};

/** Taking a hit: the head snaps back, arms fly out, then it digs back in. */
const hit: Clip = {
  name: 'hit',
  duration: 0.66,
  keys: [
    key(0),
    snap(0.05, bend(-12, -6, -4, -16), FLINCH, jaw(10), HURT),
    key(0.2, bend(-5, -2, -2, -7), jaw(4), HURT),
    key(0.38, bend(3, 1, 0, 3), HURT),
    key(0.66, OPEN_EYES),
  ],
};

/** Fainting: reels, sways forward, the knees give and it slumps onto its belly, then sinks. */
const faint: Clip = {
  name: 'faint',
  duration: 2.0,
  keys: [
    key(0),
    snap(0.14, { root: { z: -0.03 } }, bend(-14, -6, -4, -22), FLINCH, jaw(14), HURT),
    key(0.45, pelvis(0, -0.04), { root: { z: -0.02 } }, bend(10, 4, 4, 14), LIMP_ARMS, jaw(4), SHUT),
    key(0.78, pelvis(0, -0.15), { root: { z: -0.01, pitch: 8 } }, bend(24, 8, 6, 20), LIMP_ARMS, jaw(2), SHUT),
    fall(0.98, pelvis(0, -0.22), { root: { pitch: 16 } }, bend(34, 10, 6, 26), LIMP_ARMS, SHUT),
    key(1.1, pelvis(0, -0.2), { root: { pitch: 14 } }, bend(32, 10, 6, 24), LIMP_ARMS, SHUT),
    key(1.24, pelvis(0, -0.22), { root: { pitch: 16 } }, bend(34, 10, 6, 26), LIMP_ARMS, SHUT),
    fall(2.0, pelvis(0, -0.22), { root: { y: -1.1, pitch: 16 } }, bend(34, 10, 6, 26), LIMP_ARMS, SHUT),
  ],
  events: [{ t: 0.98, name: 'thud' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Weak contact (Tackle, Dig, Dive, Facade...): a shoulder charge. It sinks
 * and turns its right shoulder forward, hops in low with the head down,
 * crashes into the foe, bounces off and hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.4,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.05, -0.02), { root: { yaw: 16 } }, bend(12, 4, 2, 12), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    key(0.36, { advance: 0.6, root: { y: 0.05, yaw: 20 } }, TUCK, bend(22, 6, 2, 16), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Body blow: lands shoulder-first on the foe.
    snap(0.46, { advance: 1, root: { yaw: 14, pitch: 6 } }, LAND, pelvis(0, -0.03, 0.02), bend(26, 8, 2, 16), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    key(0.52, { advance: 1, root: { yaw: 13, pitch: 6 } }, LAND, pelvis(0, -0.03, 0.02), bend(26, 8, 2, 15), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // Bounces off, shakes its head.
    key(0.66, { advance: 0.9, root: { yaw: 4 } }, pelvis(0, -0.035), bend(8, 2, 0, 0, 6), ANGRY),
    key(0.8, { advance: 0.9 }, pelvis(0, -0.035), bend(9, 2, 0, 0, -4), ANGRY),
    // Hops home.
    key(0.96, { advance: 0.45, root: { y: 0.05 } }, HOP, bend(6, 0, 0, 0), ANGRY),
    key(1.1, { advance: 0 }, LAND, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.47, name: 'impact' }],
};

/**
 * Strong contact (Take Down, Double-Edge, Body Slam, Strength...): the whole
 * mass as a weapon. A long coil with the arms drawn back, a heavy leap, and it
 * comes down belly-first on the foe, shoves off and hops home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.25,
  keys: [
    key(0),
    // Coil: sinks deep, rears back, arms drawn back.
    key(0.34, pelvis(0, -0.1, -0.02), bend(-8, -6, -2, -8), ARMS_BACK, MOUTH_SHUT, ANGRY),
    key(0.46, pelvis(0, -0.11, -0.025), bend(-9, -6, -2, -10), ARMS_BACK, MOUTH_SHUT, ANGRY),
    // Launch: the arms swing forward and up, the body tips toward the foe.
    snap(0.62, { advance: 0.45, root: { y: 0.16, pitch: 10 } }, TUCK, bend(6, 2, 0, -6), ARMS_SPREAD_UP, jaw(10), ANGRY),
    key(0.76, { advance: 0.8, root: { y: 0.15, pitch: 24 } }, TUCK, bend(12, 4, 0, -4), ARMS_FWD_SPREAD, jaw(12), ANGRY),
    // Crash: belly-first onto the foe.
    fall(0.88, { advance: 1, root: { y: 0.02, pitch: 38 } }, TUCK, bend(16, 6, 2, 0), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    key(1.0, { advance: 1, root: { y: 0, pitch: 34 } }, TUCK, pelvis(0, -0.03), bend(15, 6, 2, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    // Shoves off and plants its feet again.
    key(1.24, { advance: 1, root: { pitch: 6 } }, LAND, pelvis(0, -0.04), bend(10, 2, 0, 0), ANGRY),
    key(1.38, { advance: 1 }, LAND, pelvis(0, -0.03), bend(8, 2, 0, 0), ANGRY),
    // Hops home.
    key(1.56, { advance: 0.45, root: { y: 0.06 } }, HOP, ANGRY),
    key(1.72, { advance: 0 }, LAND, pelvis(0, -0.02), ANGRY),
    key(2.25, OPEN_EYES),
  ],
  events: [{ t: 0.89, name: 'impact' }],
};

/**
 * Weak ranged (Water Gun, Mud Shot, Mud-Slap, Water Pulse): a gulp of air,
 * then the head snaps forward and the huge mouth spits.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.25,
  keys: [
    key(0),
    // Breath in: chest up, head back, mouth shut, elbows back.
    key(0.26, pelvis(0, 0.012), bend(-8, -6, -4, -16), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
    // Spit: the head drives forward and down, jaw wide, arms bracing.
    snap(0.36, pelvis(0, -0.02, 0.025), bend(12, 6, 0, 6), BRACED, jaw(22), ANGRY),
    // Recoil: the head bobs back up as the mouth closes a little.
    key(0.52, pelvis(0, -0.012, 0.012), bend(6, 3, 0, -4), BRACED, jaw(10), ANGRY),
    key(0.74, pelvis(0, -0.004), bend(2, 1, 0, 0), jaw(2), ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'release' }],
};

/**
 * Strong ranged (Ice Beam, Hyper Beam, Hydro Pump-like blasts): rears up and
 * draws in power at the mouth, then drops into a wide sumo brace and fires a
 * sustained blast from its jaws; the recoil pushes it back.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.5,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.02), bend(4, 0, 0, 6)),
    // Gather: rises, chest out, head back, elbows drawn back, eyes shut.
    key(0.58, pelvis(0, 0.02), bend(-12, -8, -6, -18), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    key(0.74, pelvis(0, 0.024), bend(-13, -9, -6, -20, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    // Fire: drops into the brace, the head drives forward, jaw wide.
    snap(0.86, pelvis(0, -0.07, 0.025), bend(14, 6, 0, 4), BRACED, jaw(24), ANGRY),
    // Sustain: the recoil pushes it back; a tremor, the head sweeping a little.
    key(1.06, pelvis(0, -0.068, 0.012), { root: { z: -0.015 } }, bend(12, 6, 0, 2, 3), BRACED, jaw(22), ANGRY),
    key(1.3, pelvis(0, -0.072, 0.008), { root: { z: -0.025 } }, bend(13, 6, 0, 3, -3, -1), BRACED, jaw(24), ANGRY),
    key(1.54, pelvis(0, -0.068, 0.006), { root: { z: -0.03 } }, bend(12, 6, 0, 2, 2, 1), BRACED, jaw(22), ANGRY),
    key(1.74, pelvis(0, -0.07, 0.005), { root: { z: -0.032 } }, bend(12, 6, 0, 3), BRACED, jaw(23), ANGRY),
    // The mouth closes; it straightens and shakes it off.
    key(1.94, pelvis(0, -0.03), { root: { z: -0.02 } }, bend(4, 2, 0, -4, 6), jaw(0), ANGRY),
    key(2.1, pelvis(0, -0.015), { root: { z: -0.01 } }, bend(2, 1, 0, -2, -5), ANGRY),
    key(2.5, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.93, name: 'release' }, { t: 1.8, name: 'releaseEnd' }],
};

/**
 * Self-targeting status (Rain Dance, Hail, Double Team, Sleep Talk): curls
 * in, then rears up with its arms flung to the sky and roars (it senses and
 * calls storms), a moving hold with a tremor.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.9,
  keys: [
    key(0),
    key(0.32, pelvis(0, -0.06), bend(18, 6, 2, 14), CROSSED_LOW, MOUTH_SHUT, SHUT),
    key(0.44, pelvis(0, -0.066), bend(20, 6, 2, 16, 0, 1), CROSSED_LOW, MOUTH_SHUT, SHUT),
    snap(0.6, pelvis(0, 0.02), bend(-12, -8, -6, -26), ARMS_SPREAD_UP, jaw(20), ANGRY),
    key(0.78, pelvis(0, 0.024), bend(-13, -8, -6, -27, 0, 2), ARMS_SPREAD_UP, jaw(22), ANGRY),
    key(0.96, pelvis(0, 0.02), bend(-12, -9, -6, -26, 0, -2), ARMS_SPREAD_UP, jaw(20), ANGRY),
    key(1.14, pelvis(0, 0.022), bend(-13, -8, -6, -27, 0, 1.5), ARMS_SPREAD_UP, jaw(22), ANGRY),
    key(1.4, pelvis(0, -0.02), bend(6, 2, 0, -2), jaw(2), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/** Status aimed at the foe (Growl, Roar): rears back, then lunges the head in and bellows, arms thrown wide. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, pelvis(0, 0.012), bend(-8, -6, -4, -14), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
    snap(0.34, pelvis(0, -0.03, 0.035), bend(8, 4, 0, -6), ARMS_WIDE, jaw(24), ANGRY),
    key(0.56, pelvis(0, -0.03, 0.035), bend(8, 4, 0, -6, 8, 3), ARMS_WIDE, jaw(26), ANGRY),
    key(0.76, pelvis(0, -0.03, 0.03), bend(7, 4, 0, -6, -8, -3), ARMS_WIDE, jaw(24), ANGRY),
    key(0.96, pelvis(0, -0.015, 0.01), bend(4, 2, 0, -2), jaw(4), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

// Motif clips -------------------------------------------------------------------

/**
 * Earthquake (quake): rears up with both fists high overhead, then drops into
 * a deep crouch and hammers them into the ground; holds the crouch while the
 * ground heaves.
 */
const quake: Clip = {
  name: 'quake',
  duration: 1.9,
  keys: [
    key(0),
    key(0.36, pelvis(0, 0.02, -0.02), bend(-12, -6, -4, -12), ARMS_UP, FISTS, MOUTH_SHUT, ANGRY),
    key(0.5, pelvis(0, 0.026, -0.025), bend(-14, -7, -4, -14), ARMS_UP, FISTS, MOUTH_SHUT, ANGRY),
    snap(0.64, pelvis(0, -0.08, 0.02), bend(22, 8, 2, 6), HAMMER_DOWN, FISTS, jaw(10), ANGRY),
    key(0.84, pelvis(0, -0.075, 0.018), bend(20, 7, 2, 4, 3), HAMMER_DOWN, FISTS, jaw(8), ANGRY),
    key(1.04, pelvis(0, -0.078, 0.018), bend(21, 8, 2, 5, -3), HAMMER_DOWN, FISTS, jaw(8), ANGRY),
    key(1.35, pelvis(0, -0.03), bend(6, 2, 0, 0), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'impact' }],
};

/**
 * Muddy Water, Surf (wave): scoops down low with both arms, heaves them up
 * high as it rears up (raising the wave), then drives them forward and down:
 * the wave rolls out from its feet.
 */
const wave: Clip = {
  name: 'wave',
  duration: 2.1,
  keys: [
    key(0),
    key(0.34, pelvis(0, -0.06), bend(20, 6, 2, 10), ARMS_SCOOP, MOUTH_SHUT, ANGRY),
    key(0.72, pelvis(0, 0.024), bend(-14, -8, -4, -16), ARMS_UP, jaw(16), ANGRY),
    key(0.86, pelvis(0, 0.028), bend(-15, -8, -4, -18, 0, 2), ARMS_UP, jaw(18), ANGRY),
    snap(1.0, pelvis(0, -0.04, 0.03), bend(20, 6, 2, 4), PUSH, jaw(12), ANGRY),
    key(1.22, pelvis(0, -0.045, 0.034), bend(22, 7, 2, 6), PUSH_LOW, jaw(10), ANGRY),
    key(1.5, pelvis(0, -0.02), bend(6, 2, 0, 0), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 1.04, name: 'release' }],
};

/** Protect, Endure, Substitute, Defense Curl (shield): digs in behind crossed forearms, eyes squeezed shut. */
const shield: Clip = {
  name: 'shield',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.03), bend(6, 2, 0, 4), ANGRY),
    snap(0.34, pelvis(0, -0.06), bend(12, 4, 2, 14), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(0.54, pelvis(0, -0.062), bend(12, 4, 2, 15, 0, 1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(0.74, pelvis(0, -0.06), bend(13, 4, 2, 14, 0, -1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(0.94, pelvis(0, -0.062), bend(12, 4, 2, 15, 0, 1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(1.16, pelvis(0, -0.03), bend(4, 1, 0, 2), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'aura' }],
};

/**
 * Mega Punch, Focus Punch, DynamicPunch, Ice Punch, Counter (punch): a heavy
 * haymaker. Cocks the right fist far back with the torso turned away, hops in,
 * unwinds hips and shoulders and drives the fist through the foe.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.05), bend(10, 2, 0, 4), twist(-24), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.4, { advance: 0.6, root: { y: 0.05 } }, TUCK, bend(8, 2, 0, 2), twist(-26), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.52, { advance: 1 }, LAND, bend(12, 2, 0, 4), twist(-26), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    // The punch: hips and shoulders unwind, the fist drives straight at the foe.
    snap(0.6, { advance: 1 }, pelvis(0, -0.035, 0.02), bend(14, 4, 0, 4), twist(24), PUNCH_R, FISTS, jaw(6), ANGRY),
    // Follow-through: the fist carries on, the body leans into it.
    key(0.78, { advance: 1 }, pelvis(0, -0.035, 0.025), bend(16, 4, 0, 4), twist(28), PUNCH_R_THROUGH, FISTS, jaw(4), ANGRY),
    key(0.94, { advance: 1 }, pelvis(0, -0.035), bend(8, 2, 0, 0), ANGRY),
    key(1.1, { advance: 0.45, root: { y: 0.05 } }, HOP, ANGRY),
    key(1.24, { advance: 0 }, LAND, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

/**
 * Brick Break, Rock Smash (strike): after Blaziken's slash, heavier. Raises the
 * right hand high behind its head, hops in, and chops down and across.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.04), bend(10, 2, 0, 2), twist(-18), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.34, { advance: 0.55, root: { y: 0.05 } }, TUCK, bend(8, 2, 0, 0), twist(-20), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.46, { advance: 1 }, LAND, bend(12, 2, 0, 2), twist(-20), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    snap(0.54, { advance: 1 }, pelvis(0.01, -0.045, 0.01), bend(22, 6, 0, 6), twist(20), CHOP_DOWN, jaw(6), ANGRY),
    key(0.72, { advance: 1 }, pelvis(0.012, -0.045, 0.012), bend(23, 6, 0, 6), twist(23), CHOP_DOWN, jaw(4), ANGRY),
    key(0.88, { advance: 1 }, pelvis(0, -0.035), bend(10, 2, 0, 0), ANGRY),
    key(1.04, { advance: 0.45, root: { y: 0.05 } }, HOP, ANGRY),
    key(1.18, { advance: 0 }, LAND, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

/**
 * Foresight, Mimic (glare): braces low and leans its chest in, face kept up
 * at the foe, mouth shut, and peers at it with narrowed eyes (a slow head sway).
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.35,
  keys: [
    key(0),
    key(0.26, pelvis(0, -0.04, 0.03), bend(12, 4, 0, -6, 0, 6), BRACED, MOUTH_SHUT, NARROW),
    key(0.44, pelvis(0, -0.05, 0.04), bend(14, 5, 0, -6, -6, 8), BRACED, MOUTH_SHUT, NARROW),
    key(0.72, pelvis(0, -0.05, 0.04), bend(14, 5, 0, -6, 6, 5), BRACED, MOUTH_SHUT, NARROW),
    key(0.96, pelvis(0, -0.02, 0.01), bend(5, 2, 0, -2), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Mud Sport (kick_sand): after Blaziken's sand kick. Shifts its weight onto the
 * left leg, drags the right foot back through the mud and flings it forward.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.45,
  keys: [
    key(0),
    key(0.26, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.05, -0.01), bend(18, 4, 0, 8), twist(-8), MOUTH_SHUT, ANGRY,
      { bones: { thighR: { x: 18 }, shinR: { x: 10 } } }),
    snap(0.4, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.04, 0.01), bend(6, 2, 0, 0), twist(6), jaw(6), ANGRY,
      { bones: { thighR: { x: -38 }, shinR: { x: -20 } } }),
    key(0.56, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.04, 0.008), bend(8, 2, 0, 2), twist(4), jaw(4), ANGRY,
      { bones: { thighR: { x: -26 }, shinR: { x: -8 } } }),
    key(0.78, pelvis(0, -0.045), bend(10, 2, 0, 2), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Rest (heal): settles down heavily, arms dropping to its sides, eyes closed
 * and the head sinking forward, then a slow, deep breath (a moving hold) while
 * it recovers, and it rises again.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.2,
  keys: [
    key(0),
    key(0.36, pelvis(0, -0.07), bend(10, 4, 2, 6), LIMP_ARMS, MOUTH_SHUT, { expression: 'half' }),
    key(0.62, pelvis(0, -0.09), bend(14, 6, 2, 10), LIMP_ARMS, MOUTH_SHUT, SHUT),
    // Slow breaths: the chest rises and falls.
    key(0.95, pelvis(0, -0.082), bend(10, 2, 2, 7), LIMP_ARMS, MOUTH_SHUT, SHUT),
    key(1.28, pelvis(0, -0.09), bend(14, 6, 2, 10, 0, 2), LIMP_ARMS, MOUTH_SHUT, SHUT),
    key(1.58, pelvis(0, -0.082), bend(10, 2, 2, 7, 0, -1), LIMP_ARMS, MOUTH_SHUT, SHUT),
    key(1.86, pelvis(0, -0.03), bend(2, 0, 0, -2), jaw(2), { expression: 'half' }),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.9, name: 'aura' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget, quake, wave, shield, punch, strike, glare, kickSand, heal].map((c) => [c.name, c]),
);

/** Eye atlas (pm0260_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  squint: [1, 1],
  closed: [0, 2],
  narrow: [1, 2],
  hurt: [0, 3],
};
