// Swampert's battle animation set: one clip per attack category (+ idle,
// intro, hit, faint) and motif clips for the actions its moves need (quake,
// wave, shield, punch, strike, glare, kick_sand, heal, toss, burrow, fling,
// afterimage). Keys are STANCE + deltas (see compose()); the structure
// follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (hops, slams, sink,
//                   dives; root.pitch tips it over about its feet)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (open, angry, half, closed, squint, narrow, hurt)
// Events: impact (contact lands), release (projectile/stream/wave starts),
// releaseEnd, charge, cry, aura, emit, thud; grab and throw (a toss carries
// the foe from its grab to its throw), dig (a burrow goes under).
//
// How Swampert moves (the brief in index.ts):
//   - it is heavy (82 kg) and low: wind-ups are long, hops are short and
//     low, landings sink deep into the knees; it never springs like a fighter;
//   - its power is its mass and its arms: tackles lead with the shoulder and
//     the whole body, Earthquake hammers both fists into the ground, Surf and
//     Muddy Water are heaved up with both arms and pushed at the foe, Seismic
//     Toss is a sumo's bear hug, Mud-Slap a two-handed scoop of mud;
//   - digging and diving are its element: Dig and Dive plunge head first into
//     the ground as into water and breach under the foe;
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
/**
 * Sinking into the knees, the left elbow riding up a little: as the foe, that
 * hand hangs lowest on screen, right on the top of our healthbox, and in a
 * crouch its claws went under it (tools/gauntlet/uiclear.mjs).
 */
const sink = (y: number, z = 0): Pose => ({ pelvis: { x: 0, y, z }, post: { armL: { z: -70 * y } } });

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

// Staying clear of the healthboxes (tools/gauntlet/uiclear.mjs). From our side
// the foe's box sits just above our Swampert's head fins and ours is right
// beside its right hand, so a raise goes up the front of the body, never out
// round the side, and arms go up and forward rather than wide. As the foe,
// its feet and hands touch the top of our box, so a crouch keeps the hands
// off the ground in front of its feet.

/** Both fists raised high overhead (rearing up for a slam or a wave). */
const ARMS_UP = arms([0.5, 0.82, 0.28], [0.18, 0.95, 0.25], [-0.1, 0.97, 0.2]);
/** Forearms swinging up in front of the chest, elbows low: a raise goes up the front through here. */
const ARMS_RISING = arms([0.5, -0.2, 0.84], [-0.1, 0.9, 0.42], [-0.2, 0.95, 0.25]);
/** Arms flung up and out in a V (the leap of a body slam). */
const ARMS_SPREAD_UP = arms([0.85, 0.45, 0.25], [0.55, 0.8, 0.2], [0.2, 0.95, 0.2]);
/** Arms flung up high in a narrow V (battle cry, calling the sky). */
const ARMS_ROAR = arms([0.55, 0.8, 0.25], [0.3, 0.93, 0.2], [0.1, 0.97, 0.2]);
/** Fists pulled up by the shoulders, elbows out (bursting up in a hop). */
const FISTS_UP = arms([0.7, 0.45, 0.55], [-0.1, -0.4, 0.91], [-0.2, -0.6, 0.77]);
/** Both arms heaved up high in front (raising a wave). */
const ARMS_HEAVE_HIGH = arms([0.42, 0.72, 0.55], [0.15, 0.9, 0.4], [-0.1, 0.93, 0.35]);
/** Arms thrown wide at shoulder height (roaring at the foe). */
const ARMS_WIDE = arms([0.95, 0.05, 0.3], [0.75, -0.35, 0.55], [0.3, -0.7, 0.65]);
/** Both fists hammered down onto the ground in front (onto a foe it holds). */
const HAMMER_DOWN = arms([0.3, -0.5, 0.81], [0.08, -0.82, 0.57], [-0.1, -0.97, 0.2]);
/** Both fists hammered down into the ground at its sides. */
const QUAKE_HAMMER = arms([0.72, -0.67, 0.12], [0.3, -0.94, 0.12], [0.05, -0.99, 0.05]);
/** Hands coming down in front of the chest, elbows in: raised arms come down the front through here, not round the sides. */
const ARMS_DOWN_FRONT = arms([0.45, 0.1, 0.89], [-0.15, -0.5, 0.85], [-0.2, -0.7, 0.68]);
/** Both arms thrust forward, palms toward the foe (pushing a wave). */
const PUSH = arms([0.38, -0.1, 0.92], [0.18, -0.02, 0.98], [0.02, 0.35, 0.94]);
/** The push follows through, low and long. */
const PUSH_LOW = arms([0.32, -0.35, 0.88], [0.15, -0.3, 0.94], [0.02, -0.1, 0.99]);
/** Arms swept down and back (scooping up water). */
const ARMS_SCOOP = arms([0.55, -0.75, -0.35], [0.3, -0.7, -0.65], [0.1, -0.5, -0.86]);
/** Forearms crossed in front of the face (Protect). */
const CROSSED_GUARD = arms([0.55, -0.45, 0.7], [-0.72, 0.62, 0.3], [-0.55, 0.8, 0.2]);
/** Forearms rising in front of the chest (on the way into CROSSED_GUARD). */
const GUARD_RISING = arms([0.6, -0.55, 0.58], [-0.35, 0.55, 0.76], [-0.3, 0.8, 0.52]);
/** Arms crossed in front of the belly (gathering, curled up). */
const CROSSED_LOW = arms([0.5, -0.6, 0.62], [-0.75, 0.0, 0.66], [-0.6, -0.3, 0.74]);
/** Fists crossed high in front of the chest (gathering; low in front, the foe's fists went under our healthbox). */
const CROSSED_CHEST = arms([0.6, -0.2, 0.77], [-0.7, 0.2, 0.69], [-0.55, 0.1, 0.83]);
/** Sumo brace: elbows out, forearms reaching forward low, hands open over the ground (bracing a blast). */
const BRACED = arms([0.9, -0.3, 0.3], [0.35, -0.55, 0.76], [-0.05, -0.55, 0.83]);
/** Elbows out, forearms angled forward and down: bracing a quick spit. */
const SPIT_BRACE = arms([0.88, -0.4, 0.25], [0.35, -0.5, 0.79], [-0.05, -0.6, 0.8]);
/** Elbows drawn back and up, chest open (drawing breath). */
const ELBOWS_BACK = arms([0.7, -0.2, -0.68], [0.35, -0.35, 0.87], [0.0, -0.6, 0.8]);
/** Arms tucked in, forearms up before the chest (a shoulder charge). */
const ARMS_TUCKED = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.35, 0.4, 0.85]);
/** Arms drawn back behind the body (coiling to launch). */
const ARMS_BACK = arms([0.6, -0.35, -0.72], [0.45, -0.6, -0.66], [0.2, -0.8, -0.56]);
/** Arms spread forward and wide (about to crash onto the foe). */
const ARMS_FWD_SPREAD = arms([0.75, -0.15, 0.65], [0.45, -0.35, 0.82], [0.1, -0.55, 0.83]);
/** Flinch: the hands jerk up in front of the face. */
const FLINCH = arms([0.62, 0.05, 0.78], [-0.05, 0.8, 0.6], [-0.3, 0.85, 0.43]);
/** Arms hanging limp at its sides, a little behind the hips (fainting, resting). */
const LIMP_ARMS = arms([0.55, -0.82, -0.12], [0.2, -0.97, 0.1], [-0.2, -0.95, 0.2]);
/** The crab arms easing out at the elbows, hands hanging (a breakdown into and out of a squat: the hands pass at its sides, not low in front). */
const ELBOWS_OUT = arms([0.93, -0.22, 0.28], [0.5, -0.85, 0.18], [-0.3, -0.88, 0.37]);
/** Right fist cocked far back, left arm out front as a guard. */
const CHAMBER_R = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.55, 0.25, -0.8], [-0.25, 0.1, 0.96], [0.0, -0.1, 0.99]]);
/** Right fist driven straight at the foe, left fist pulled back to the hip. */
const PUNCH_R = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, 0.02, 0.99], [-0.05, 0.02, 1], [-0.02, 0.05, 1]]);
/** The punch carries through past the foe. */
const PUNCH_R_THROUGH = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[0.12, -0.08, 0.99], [0.2, -0.1, 0.97], [0.25, -0.1, 0.96]]);
/** Right hand raised high behind the head, edge ready to chop (Brick Break). */
const CHOP_RAISED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.55, 0.6, -0.58], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]]);
/** CHOP_RAISED cocked further back as it lands, so the chop starts from a turnaround, not a dead stop. */
const CHOP_COCKED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.5, 0.64, -0.58], [-0.06, 0.97, -0.2], [0.02, 0.9, -0.42]]);
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
/** Fingers half curled (relaxed hands; cupping mud): the long fingertips hang less low. */
const CURL: Pose = {
  bones: {
    fingerA1L: { z: -22 }, fingerB1L: { z: -22 }, fingerC1L: { z: -22 },
    fingerA2L: { z: -18 }, fingerB2L: { z: -18 }, fingerC2L: { z: -18 },
    fingerA1R: { z: 22 }, fingerB1R: { z: 22 }, fingerC1R: { z: 22 },
    fingerA2R: { z: 18 }, fingerB2R: { z: 18 }, fingerC2R: { z: 18 },
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
 * Sent out: rises from a curled crouch in a heavy hop (the stock front anim
 * is ANIM_V_JUMPS_BIG) with its fists pulled up, lands deep, then roars with
 * its arms flung up high. The hop is low and leans in, and the arms go up and
 * come down the front of the body: from our side a high jump took the head
 * fins under the foe's healthbox, and arms flung wide or swung round the
 * sides took the right hand under ours.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.95,
  keys: [
    key(0, pelvis(0, -0.07), bend(18, 6, 0, 16), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Coil deeper.
    key(0.22, pelvis(0, -0.1), bend(24, 8, 2, 20), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Burst up, leaning into the hop, fists pulled up.
    snap(0.42, { root: { y: 0.06, pitch: 5 } }, TUCK, bend(-6, -4, -2, -10), FISTS_UP, FISTS, jaw(6), ANGRY),
    key(0.55, { root: { y: 0.07, pitch: 5 } }, TUCK, bend(-7, -4, -2, -12), FISTS_UP, FISTS, jaw(8), ANGRY),
    // Heavy landing, deep in the knees, the fists coming down in front.
    fall(0.72, LAND, pelvis(0, -0.03), bend(8, 2, 0, 4), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    key(0.8, LAND, pelvis(0, -0.035), bend(9, 2, 0, 5), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    // Roar: rears up, arms flung up high, jaw wide (moving hold).
    snap(0.96, pelvis(0, 0.012), bend(-12, -8, -6, -20), ARMS_ROAR, jaw(26), ANGRY),
    key(1.14, pelvis(0, 0.014), bend(-13, -8, -6, -22, 5, 3), ARMS_ROAR, jaw(28), ANGRY),
    key(1.32, pelvis(0, 0.012), bend(-12, -8, -6, -21, -5, -3), ARMS_ROAR, jaw(26), ANGRY),
    // The arms come down in front, and it settles into its crab-armed stance.
    key(1.5, pelvis(0, -0.01), bend(4, 2, 0, -4), ARMS_DOWN_FRONT, jaw(8), ANGRY),
    key(1.66, pelvis(0, -0.012), bend(4, 2, 0, -2), jaw(4), ANGRY),
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

/**
 * Fainting: reels, sways forward, the knees give and it sits back heavily
 * onto its heels, slumped, then sinks. Slumped forward onto its belly, the
 * foe's head fell onto our healthbox (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 2.0,
  keys: [
    key(0),
    snap(0.14, { root: { z: -0.03 } }, bend(-14, -6, -4, -22), FLINCH, jaw(14), HURT),
    // The hands fall in front of it as it sways forward.
    key(0.3, pelvis(0, -0.02), { root: { z: -0.04 } }, bend(-2, -1, 0, -4), ARMS_DOWN_FRONT, jaw(8), HURT),
    key(0.45, pelvis(0, -0.035), { root: { z: -0.08 } }, bend(3, 1, 1, 5), LIMP_ARMS, CURL, jaw(4), SHUT),
    // The knees give and it sits back heavily onto its heels, slumped.
    key(0.78, pelvis(0, -0.15), { root: { z: -0.14 } }, bend(16, 6, 4, 14), LIMP_ARMS, CURL, jaw(2), SHUT),
    fall(0.98, pelvis(0, -0.22), { root: { z: -0.3, pitch: -6 } }, bend(22, 8, 4, 18), LIMP_ARMS, CURL, SHUT),
    key(1.1, pelvis(0, -0.2), { root: { z: -0.3, pitch: -5 } }, bend(20, 8, 4, 16), LIMP_ARMS, CURL, SHUT),
    key(1.24, pelvis(0, -0.22), { root: { z: -0.3, pitch: -6 } }, bend(22, 8, 4, 18), LIMP_ARMS, CURL, SHUT),
    fall(2.0, pelvis(0, -0.22), { root: { y: -1.1, z: -0.3, pitch: -6 } }, bend(22, 8, 4, 18), LIMP_ARMS, CURL, SHUT),
  ],
  events: [{ t: 0.98, name: 'thud' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Weak contact (Tackle, Facade, Secret Power...): a shoulder charge. It sinks
 * and turns its right shoulder forward, hops in low with the head down,
 * crashes into the foe, bounces off and hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.4,
  keys: [
    key(0),
    // Wind-up: sinks, the right shoulder draws back (the spine twists; the feet stay put), head lowering.
    key(0.2, pelvis(0, -0.055, -0.02), twist(-12), bend(12, 4, 2, 12), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Launch: the right shoulder drives forward as it hops in low, head down.
    key(0.36, { advance: 0.6, root: { y: 0.05 } }, TUCK, twist(14), bend(22, 6, 2, 16), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Body blow: lands shoulder-first on the foe and compresses into it.
    snap(0.46, { advance: 1, root: { pitch: 6 } }, LAND, pelvis(0, -0.035, 0.02), twist(18), bend(26, 8, 2, 16), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    key(0.54, { advance: 1, root: { pitch: 5 } }, LAND, pelvis(0, -0.045, 0.02), twist(16), bend(24, 8, 2, 14), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // Rebounds off the foe in a low hop, shaking its head, and carries on home in one flow.
    key(0.7, { advance: 0.72, root: { y: 0.05 } }, HOP, twist(4), bend(8, 2, 0, 0, 7), ANGRY),
    key(0.84, { advance: 0.38, root: { y: 0.055 } }, HOP, bend(6, 0, 0, 0, -5), ANGRY),
    key(0.98, { advance: 0 }, LAND, ANGRY),
    key(1.14, pelvis(0, -0.02), bend(3, 1, 0, 1), ANGRY),
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
    key(0.95, { advance: 1, root: { y: 0, pitch: 40 } }, TUCK, pelvis(0, -0.04), bend(18, 7, 2, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    key(1.06, { advance: 1, root: { y: 0.01, pitch: 33 } }, TUCK, pelvis(0, -0.03), bend(15, 6, 2, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
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
 * Weak ranged (Water Gun, Mud Shot, Water Pulse): a gulp of air,
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
    snap(0.36, pelvis(0, -0.02, 0.025), bend(12, 6, 0, 6), SPIT_BRACE, jaw(22), ANGRY),
    // Recoil: the head bobs back up as the mouth closes a little.
    key(0.52, pelvis(0, -0.012, 0.012), bend(6, 3, 0, -4), SPIT_BRACE, jaw(10), ANGRY),
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
    key(0.18, sink(-0.02), bend(4, 0, 0, 6)),
    // Gather: rises, chest out, head back, elbows drawn back, eyes shut.
    key(0.58, pelvis(0, 0.02), bend(-12, -8, -6, -18), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    key(0.74, pelvis(0, 0.024), bend(-13, -9, -6, -20, 0, 2), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    // Fire: drops into the brace, the head drives forward, jaw wide.
    snap(0.86, sink(-0.055, 0.012), bend(14, 6, 0, 4), BRACED, jaw(24), ANGRY),
    // Sustain: the recoil pushes it back; a tremor, the head sweeping a little.
    key(1.06, sink(-0.051, 0.006), { root: { z: -0.015 } }, bend(12, 6, 0, 2, 4), BRACED, jaw(22), ANGRY),
    key(1.3, sink(-0.058, 0.004), { root: { z: -0.025 } }, bend(14, 6, 0, 3, -4, -2), BRACED, jaw(25), ANGRY),
    key(1.54, sink(-0.051, 0.003), { root: { z: -0.03 } }, bend(12, 6, 0, 2, 3, 2), BRACED, jaw(21), ANGRY),
    key(1.74, sink(-0.056, 0.002), { root: { z: -0.033 } }, bend(13, 6, 0, 3, -1), BRACED, jaw(23), ANGRY),
    // The mouth closes; it straightens and shakes it off.
    key(1.94, sink(-0.03), { root: { z: -0.02 } }, bend(4, 2, 0, -4, 6), jaw(0), ANGRY),
    key(2.1, pelvis(0, -0.015), { root: { z: -0.01 } }, bend(2, 1, 0, -2, -5), ANGRY),
    key(2.5, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.93, name: 'release' }, { t: 1.8, name: 'releaseEnd' }],
};

/**
 * Self-targeting status (Rain Dance, Hail, Sleep Talk): curls
 * in, then rears up with its arms flung to the sky and roars (it senses and
 * calls storms), a moving hold with a tremor. The arms rise up the front and
 * open forward, not out round the sides (from our side the right hand went
 * under our healthbox), and come back down in front.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.9,
  keys: [
    key(0),
    key(0.32, sink(-0.04), bend(14, 5, 2, 12), CROSSED_CHEST, FISTS, MOUTH_SHUT, SHUT),
    key(0.44, sink(-0.045), bend(16, 6, 2, 14, 0, 1), CROSSED_CHEST, FISTS, MOUTH_SHUT, SHUT),
    key(0.54, sink(-0.02), bend(8, 2, 0, 4), ARMS_RISING, jaw(8), ANGRY),
    snap(0.62, pelvis(0, 0.02), bend(-12, -8, -6, -22), ARMS_ROAR, jaw(20), ANGRY),
    key(0.8, pelvis(0, 0.022), bend(-13, -8, -6, -23, 4, 2), ARMS_UP, jaw(24), ANGRY),
    key(1.02, pelvis(0, 0.022), bend(-13, -8, -6, -23, -4, -2), ARMS_ROAR, jaw(26), ANGRY),
    key(1.16, pelvis(0, 0.022), bend(-12, -8, -6, -22, 0, 1), ARMS_ROAR, jaw(18), ANGRY),
    key(1.32, pelvis(0, -0.005), bend(2, 1, 0, -6), ARMS_DOWN_FRONT, jaw(6), ANGRY),
    key(1.48, sink(-0.02), bend(6, 2, 0, -2), jaw(2), ANGRY),
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
 * a deep crouch and hammers them into the ground at its sides; holds the
 * crouch while the ground heaves. The fists rise up the front of the body
 * (out round the sides, our Swampert's right hand went under our healthbox)
 * and come down at its sides (in front of its feet, the foe's fists went
 * under our box).
 */
const quake: Clip = {
  name: 'quake',
  duration: 1.95,
  keys: [
    key(0),
    // A small dip before rearing up (anticipation).
    key(0.14, sink(-0.02), bend(8, 2, 0, 6), CURL, MOUTH_SHUT, ANGRY),
    // Rearing up: the fists rise up the front...
    key(0.34, pelvis(0, 0.01, -0.01), bend(-6, -3, -2, -6), ARMS_RISING, FISTS, jaw(6), ANGRY),
    // ...to both fists high overhead, reared tall (a moving hold, still rising).
    key(0.5, pelvis(0, 0.024, -0.02), bend(-13, -6, -4, -13), ARMS_UP, FISTS, jaw(14), ANGRY),
    key(0.6, pelvis(0, 0.03, -0.025), bend(-15, -7, -4, -15), ARMS_UP, FISTS, jaw(16), ANGRY),
    // The hammer: the fists come down in front of the chest as it drops...
    key(0.67, pelvis(0, 0.0, -0.01), bend(-4, -2, -1, -6), ARMS_DOWN_FRONT, FISTS, jaw(12), ANGRY),
    // ...into a deep crouch, driving both fists into the ground.
    snap(0.73, sink(-0.045), bend(12, 5, 0, 4), QUAKE_HAMMER, FISTS, jaw(10), ANGRY),
    // Squash on impact, then a small rebound.
    key(0.8, sink(-0.055), bend(14, 6, 0, 5), QUAKE_HAMMER, FISTS, jaw(8), ANGRY),
    key(0.96, sink(-0.048), bend(10, 4, 0, 3, 3), QUAKE_HAMMER, FISTS, jaw(8), ANGRY),
    // Holds the crouch while the ground heaves, pressing down (moving hold).
    key(1.16, sink(-0.054), bend(12, 5, 0, 4, -3), QUAKE_HAMMER, FISTS, jaw(6), ANGRY),
    key(1.42, sink(-0.022), bend(6, 2, 0, 0), CURL, ANGRY),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.77, name: 'impact' }],
};

/**
 * Muddy Water, Surf (wave): scoops down low with both arms, heaves them up
 * high in front as it rears up (raising the wave), then drives them forward
 * and down: the wave rolls out from its feet. The heave goes up in front of
 * the head fins, not straight overhead: from our side the hands went under
 * the foe's healthbox.
 */
const wave: Clip = {
  name: 'wave',
  duration: 2.1,
  keys: [
    key(0),
    key(0.34, pelvis(0, -0.05), bend(20, 6, 2, 10), ARMS_SCOOP, MOUTH_SHUT, ANGRY),
    // The heave comes up the front of the body.
    key(0.56, pelvis(0, -0.01), bend(4, 1, 0, -4), ARMS_RISING, jaw(8), ANGRY),
    key(0.72, pelvis(0, 0.02), bend(-12, -7, -4, -15), ARMS_HEAVE_HIGH, jaw(16), ANGRY),
    key(0.86, pelvis(0, 0.022), bend(-13, -7, -4, -16, 0, 2), ARMS_HEAVE_HIGH, jaw(18), ANGRY),
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
    // Digs in, the forearms rising in front of the chest.
    key(0.16, pelvis(0, -0.03), bend(6, 2, 0, 4), GUARD_RISING, ANGRY),
    snap(0.32, pelvis(0, -0.06), bend(12, 4, 2, 14), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    // Braces behind the guard: settles deeper and leans into it (moving hold, never frozen).
    key(0.46, pelvis(0, -0.066), bend(13, 4, 2, 15, 0, 1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(0.84, pelvis(0, -0.075, 0.012), bend(15, 5, 2, 16, 0, -1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    // Lowers the guard, the arms opening back to the stance.
    key(1.04, pelvis(0, -0.05), bend(9, 3, 1, 9), GUARD_RISING, ANGRY),
    key(1.24, pelvis(0, -0.02), bend(3, 1, 0, 2), ANGRY),
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
    key(0.22, pelvis(0, -0.05), bend(10, 2, 0, 4), twist(-18), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.4, { advance: 0.6, root: { y: 0.05 } }, TUCK, bend(8, 2, 0, 2), twist(-20), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.52, { advance: 1 }, LAND, bend(12, 2, 0, 4), twist(-20), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    // The punch: hips and shoulders unwind, the fist drives straight at the foe.
    snap(0.6, { advance: 1 }, pelvis(0, -0.035, 0.02), bend(14, 4, 0, 4), twist(18), PUNCH_R, FISTS, jaw(6), ANGRY),
    // Follow-through: the fist carries on, the body leans into it.
    key(0.78, { advance: 1 }, pelvis(0, -0.035, 0.025), bend(16, 4, 0, 4), twist(23), PUNCH_R_THROUGH, FISTS, jaw(4), ANGRY),
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
    key(0.2, pelvis(0, -0.04), bend(10, 2, 0, 2), twist(-15), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.36, { advance: 0.55, root: { y: 0.05 } }, TUCK, bend(8, 2, 0, 0), twist(-16), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.47, { advance: 1 }, LAND, bend(12, 2, 0, 2), twist(-20), CHOP_COCKED, MOUTH_SHUT, ANGRY),
    snap(0.57, { advance: 1 }, pelvis(0.01, -0.045, 0.01), bend(22, 6, 0, 6), twist(16), CHOP_DOWN, jaw(6), ANGRY),
    key(0.74, { advance: 1 }, pelvis(0.012, -0.045, 0.012), bend(23, 6, 0, 6), twist(20), CHOP_DOWN, jaw(4), ANGRY),
    key(0.9, { advance: 1 }, pelvis(0, -0.035), bend(10, 2, 0, 0), ANGRY),
    key(1.04, { advance: 0.45, root: { y: 0.05 } }, HOP, ANGRY),
    key(1.18, { advance: 0 }, LAND, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.63, name: 'impact' }],
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
    key(0.26, pelvis(0, -0.03, 0.02), bend(12, 4, 0, -6, 0, 6), BRACED, MOUTH_SHUT, NARROW),
    key(0.44, pelvis(0, -0.035, 0.025), bend(14, 5, 0, -6, -6, 8), BRACED, MOUTH_SHUT, NARROW),
    key(0.74, pelvis(0, -0.04, 0.03), bend(16, 6, 0, -6, 6, 5), BRACED, MOUTH_SHUT, NARROW),
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
    // The weight goes onto the left leg; that arm lifts a little for balance (hanging, its claws went under our healthbox).
    key(0.26, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.012, -0.035, -0.01), bend(16, 4, 0, 8), twist(-5), MOUTH_SHUT, ANGRY,
      { bones: { thighR: { x: 18 }, shinR: { x: 10 } }, post: { armL: { z: 9 }, armR: { z: -4 } } }),
    snap(0.4, { plantLeft: 1, plantRight: 0 }, pelvis(0.01, -0.03, 0.01), bend(6, 2, 0, 0), twist(6), jaw(6), ANGRY,
      { bones: { thighR: { x: -38 }, shinR: { x: -20 } }, post: { armL: { z: 7 }, armR: { z: -4 } } }),
    key(0.56, { plantLeft: 1, plantRight: 0 }, pelvis(0.008, -0.03, 0.008), bend(8, 2, 0, 2), twist(4), jaw(4), ANGRY,
      { bones: { thighR: { x: -26 }, shinR: { x: -8 } }, post: { armL: { z: 6 }, armR: { z: -3 } } }),
    key(0.78, sink(-0.03), bend(10, 2, 0, 2), ANGRY),
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
    // The arms ease out and drop to its sides as it settles.
    key(0.16, sink(-0.012), bend(4, 2, 1, 2), ELBOWS_OUT, CURL, MOUTH_SHUT, { expression: 'half' }),
    key(0.36, sink(-0.05), bend(10, 4, 2, 6), LIMP_ARMS, CURL, MOUTH_SHUT, { expression: 'half' }),
    key(0.62, sink(-0.066), bend(14, 6, 2, 10), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    // Slow breaths: the chest rises and falls.
    key(0.95, sink(-0.058), bend(10, 2, 2, 7), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    key(1.28, sink(-0.066), bend(14, 6, 2, 10, 0, 2), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    key(1.58, sink(-0.058), bend(10, 2, 2, 7, 0, -1), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    // Rises again, the arms lifting back into the crab.
    key(1.74, sink(-0.03), bend(4, 1, 0, 0), ELBOWS_OUT, CURL, jaw(2), { expression: 'half' }),
    key(1.9, sink(-0.02), bend(2, 0, 0, -2), jaw(2), { expression: 'half' }),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.9, name: 'aura' }],
};

/** Arms flung wide at chest height, reaching round the foe (a bear hug about to close). */
const HUG_OPEN = arms([0.85, 0.05, 0.52], [0.5, 0.05, 0.86], [0.05, 0.0, 1.0]);
/** The hug closing (a breakdown between HUG_OPEN and HUG). */
const HUG_MID = arms([0.7, -0.03, 0.72], [0.0, 0.05, 1.0], [-0.45, 0.05, 0.89]);
/** Arms locked round the foe's waist, the hands meeting in front of the chest. */
const HUG = arms([0.45, -0.1, 0.89], [-0.55, 0.05, 0.83], [-0.8, 0.1, 0.6]);
/** Landing from a hop home: the knees take the weight and the torso carries on back a little. */
const LAND_HOME: Pose = { plantFeet: 1, pelvis: { y: -0.05 }, bones: { spine: { x: -3 }, head: { x: 1 } } };
/** Hoisting it up against the chest (overhead would carry the foe off the screen). */
const HOIST = arms([0.42, 0.14, 0.9], [-0.4, 0.3, 0.87], [-0.62, 0.3, 0.72]);

/**
 * Seismic Toss (toss): a sumo's bear hug. Squares up with the arms flung
 * wide, a low heavy hop in, and the arms close round the foe as it lands
 * (grab: from here it rides in the grip, src/battle3d/director.ts). Sinks
 * deep with it, straining, then heaves it up against its chest (not overhead:
 * the foe would leave the screen) and springs back toward mid-field in a low
 * leap, spinning round with it; from the top of the leap it hurls it back down
 * into its own place with both arms (throw) and drops like a stone. The foe
 * crashes there (impact), where both camera views see it, while Swampert
 * crouches deep at advance 0.4, then hops home. Hands trail the hips by
 * ~0.07 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.76,
  keys: [
    key(0),
    // Squares up: sinks, the crab arms swinging open wide.
    key(0.22, pelvis(0, -0.075, -0.01), bend(6, 2, 0, 2), HUG_OPEN, MOUTH_SHUT, ANGRY),
    // A low, heavy hop in, arms spread for the hug.
    key(0.4, { advance: 0.6, root: { y: 0.06 } }, TUCK, bend(6, 2, 0, 0), HUG_OPEN, MOUTH_SHUT, ANGRY),
    // Lands chest to chest with the foe, the arms already closing...
    key(0.52, { advance: 1, root: { z: 0.12 } }, LAND, bend(0, 1, 0, 2), HUG_MID, MOUTH_SHUT, ANGRY),
    // ...and locking round it (grab as the hands meet).
    key(0.64, { advance: 1, root: { z: 0.15 } }, pelvis(0, -0.09), bend(2, 2, 0, -2), HUG, MOUTH_SHUT, ANGRY),
    // Load: sinks deep into an upright sumo squat with it, straining.
    key(0.8, { advance: 1, root: { z: 0.14 } }, pelvis(0, -0.12), bend(4, 2, 0, 0), HUG, MOUTH_SHUT, SQUINT),
    key(0.94, { advance: 1, root: { z: 0.12 } }, pelvis(0, -0.135), bend(1, 1, 0, 2), HUG, MOUTH_SHUT, SQUINT),
    // Heaves it up against its chest and springs up and back toward mid-field, the back arching.
    key(1.1, { advance: 0.86, root: { y: 0.1, yaw: 35 } }, HOP, pelvis(0, 0.01), bend(-10, -6, -2, -10), HOIST, jaw(10), ANGRY),
    // Spinning round with it in the air.
    key(1.26, { advance: 0.66, root: { y: 0.15, yaw: 200 } }, HOP, pelvis(0, 0.01), bend(-12, -6, -2, -12), HOIST, jaw(12), ANGRY),
    // At the top, facing its place again, leaning back to hurl.
    key(1.38, { advance: 0.48, root: { y: 0.16, yaw: 360 } }, HOP, pelvis(0, 0.01), bend(-16, -8, -3, -14), HOIST, jaw(14), ANGRY),
    // The hurl, still at the top: the whole body folds forward, both arms driving it down at its place.
    snap(1.47, { advance: 0.4, root: { y: 0.15, yaw: 360 } }, HOP, pelvis(0, -0.02), bend(26, 8, 2, 6), HAMMER_DOWN, jaw(20), ANGRY),
    // Drops like a stone and lands heavily, deep in the knees, arms still down: watches it crash.
    fall(1.64, { advance: 0.4, root: { yaw: 360 } }, LAND, pelvis(0, -0.11), bend(28, 9, 2, 6), HAMMER_DOWN, jaw(16), ANGRY),
    key(1.74, { advance: 0.4, root: { yaw: 360 } }, LAND, pelvis(0, -0.125), bend(29, 9, 2, 7), HAMMER_DOWN, jaw(18), ANGRY),
    key(1.98, { advance: 0.4, root: { yaw: 360 } }, pelvis(0, -0.08), bend(18, 6, 0, 2), HAMMER_DOWN, jaw(22), ANGRY),
    // Straightens, then a heavy hop home.
    key(2.16, { advance: 0.4, root: { yaw: 360 } }, pelvis(0, -0.04), bend(8, 2, 0, 0), jaw(6), ANGRY),
    key(2.32, { advance: 0.2, root: { y: 0.05, yaw: 360 } }, HOP, ANGRY),
    key(2.46, { advance: 0, root: { yaw: 360 } }, LAND_HOME, ANGRY),
    key(2.76, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'grab' }, { t: 1.5, name: 'throw' }, { t: 1.76, name: 'impact' }],
};

/** Arms swung back behind the body (a diver about to spring). */
const DIVE_BACK = arms([0.55, -0.45, -0.7], [0.4, -0.6, -0.7], [0.2, -0.75, -0.62]);
/** Arms swept forward together past the head (a diver's reach). */
const DIVE_REACH = arms([0.25, 0.6, 0.76], [0.05, 0.7, 0.71], [-0.05, 0.7, 0.71]);
/** Fists drawn in low before the belly (underground, coiled to burst up). */
const FISTS_LOW = arms([0.6, -0.7, 0.38], [-0.2, -0.3, 0.93], [-0.35, -0.2, 0.92]);

/**
 * Dig, Dive (burrow): digging and diving are its element. It rears back with
 * the arms swung back, hops and plunges head first into the ground as into
 * water (dig: dirt, or a splash for Dive, bursts up as it goes in), the tail
 * fan going under last; swims over to the foe underground (the director heaves
 * mounds, or bubbles, along the way), then breaches up in front of it with
 * both fists driving up (impact as it clears the surface), comes down heavily
 * with the arms braced wide, holds the crouch glaring up at it and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.58,
  keys: [
    key(0),
    // Rears back and sinks, arms swung back (the wind-up before throwing itself forward).
    key(0.24, pelvis(0, -0.04, -0.05), bend(-9, -4, 0, -4), DIVE_BACK, MOUTH_SHUT, ANGRY),
    // The dive: a low hop, tipping forward, the arms sweeping forward past the head.
    key(0.42, { advance: 0.06, root: { y: 0.12, pitch: 40 } }, TUCK, pelvis(0, -0.02), bend(-4, -3, 0, -4), DIVE_REACH, MOUTH_SHUT, ANGRY),
    // Plunges in head first (dig: the ground splashes up round it)...
    key(0.56, { advance: 0.1, plantFeet: 0, root: { y: 0.08, pitch: 98 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
    // ...and slides under, the tail fan last, gathering speed.
    key(0.74, { advance: 0.16, plantFeet: 0, root: { y: -0.95, pitch: 108 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
    // Underground (nothing to stand on): swims over to the foe, turning upright to come up.
    key(0.88, { advance: 0.45, plantFeet: 0, root: { y: -1.3, pitch: 60 } }, pelvis(0, -0.05), bend(6, 2, 0, 0), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
    key(1.06, { advance: 1, plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.08), bend(16, 4, 0, 6), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
    // Breaches up in front of the foe, both fists driving up.
    snap(1.22, { advance: 1, plantFeet: 0, root: { y: 0.2 } }, pelvis(0, 0.02), bend(-10, -6, -2, -14), ARMS_UP, FISTS, jaw(20), ANGRY),
    key(1.32, { advance: 0.97, plantFeet: 0, root: { y: 0.23 } }, TUCK, pelvis(0, 0.02), bend(-12, -6, -2, -16), ARMS_UP, FISTS, jaw(22), ANGRY),
    // Comes down heavily in front of it, deep in the knees, arms braced wide, and holds the
    // crouch glaring up at the foe.
    fall(1.5, { advance: 0.9 }, LAND, pelvis(0, -0.085), bend(-2, -1, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.6, { advance: 0.9 }, LAND, pelvis(0, -0.1), bend(0, 0, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.88, { advance: 0.9 }, pelvis(0, -0.05), bend(2, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    // Hops home.
    key(2.04, { advance: 0.45, root: { y: 0.06 } }, HOP, ANGRY),
    key(2.2, { advance: 0 }, LAND_HOME, ANGRY),
    key(2.58, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'dig' }, { t: 1.16, name: 'impact' }],
};

/** Both hands dug into the mud beside the feet, a little behind them (scooping). */
const SCOOP_DOWN = arms([0.72, -0.68, 0.12], [0.35, -0.92, 0.15], [-0.2, -0.85, 0.48]);
/** Both arms swinging through low in front of the thighs, the hands together (the scoop comes forward here). */
const SWING_LOW = arms([0.3, -0.9, 0.3], [0.0, -0.95, 0.3], [-0.2, -0.9, 0.38]);
/** The heave: both arms swung forward and up at the foe, the hands together (an underhand hurl). */
const HEAVE_FWD = arms([0.3, 0.2, 0.93], [-0.05, 0.5, 0.86], [-0.15, 0.55, 0.82]);
/** The heave carries on up past the face. */
const HEAVE_UP = arms([0.35, 0.65, 0.67], [0.1, 0.85, 0.52], [0.0, 0.9, 0.44]);

/**
 * Mud-Slap (fling): a big two-handed scoop. Drops into a sumo squat and digs
 * both hands into the mud beside its feet, draws the load back by its hips,
 * then heaves it underhand at the foe with both arms, rising out of the squat
 * (release from the hands: + their overlap), and the arms come back down in
 * front. As the foe, a deeper squat put its hands under our healthbox; the
 * arms coming back round the sides took our Swampert's right hand under ours.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.4,
  keys: [
    key(0),
    // Drops into a squat and digs both hands into the mud at its sides, face up at the foe.
    key(0.1, sink(-0.015, -0.01), bend(6, 2, 0, 0), ELBOWS_OUT, CURL, MOUTH_SHUT, ANGRY),
    key(0.22, sink(-0.06, -0.025), bend(12, 4, 0, -2), SCOOP_DOWN, CURL, MOUTH_SHUT, ANGRY),
    // Scoops: the load drawn back by the hips, weight back, deeper in the squat.
    key(0.42, sink(-0.08, -0.035), bend(12, 4, 0, -5), ARMS_SCOOP, FISTS, MOUTH_SHUT, ANGRY),
    // Heaves it at the foe: rises out of the squat, both arms swinging through low and up together.
    key(0.48, sink(-0.06, -0.01), bend(6, 2, 0, -5), SWING_LOW, FISTS, MOUTH_SHUT, ANGRY),
    snap(0.55, sink(-0.03, 0.02), bend(-4, -2, 0, -6), HEAVE_FWD, jaw(14), ANGRY),
    // Follow-through: the arms carry on up past the face...
    key(0.7, sink(-0.025, 0.015), bend(-8, -4, 0, -8), HEAVE_UP, jaw(16), ANGRY),
    // ...and come back down in front.
    key(0.88, sink(-0.035, 0.01), bend(4, 2, 0, -2), ARMS_DOWN_FRONT, jaw(8), ANGRY),
    key(1.04, sink(-0.022), bend(5, 2, 0, 0), jaw(4), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'release' }],
};

/** A grappler's guard: arms spread wide and forward at chest height, hands open, ready to grab. */
const SUMO_GUARD = arms([0.88, -0.3, 0.38], [0.45, 0.0, 0.89], [0.0, 0.1, 1.0]);
/** The guard coming down into the crab arms. */
const GUARD_LOWERING = arms([0.88, -0.35, 0.33], [0.5, -0.4, 0.77], [-0.3, -0.35, 0.89]);
/** A heavy side-hop's landing: deep in the knees (the body leans with it: root.roll). */
const SQUASH: Pose = { plantFeet: 1, pelvis: { y: -0.07 }, bones: { spine: { x: 10 }, head: { x: -6 } } };
/** The head held level against the body's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * Double Team (afterimage): short, heavy side-hops, a sumo's shuffle, not a
 * sprinter's dart: each a low hop to one side and a landing deep in the
 * knees, the body leaning with it and the head held level, the arms spread in
 * a grappler's guard. The hops are narrow (0.15 heights) and lean a little:
 * wider, or leaning further, our Swampert's right head fin went under our
 * healthbox. The afterimages start at the aura and run 1.4 s
 * (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 2.1,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.065), bend(10, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.26, { root: { x: 0.075, y: 0.04, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.38, { root: { x: 0.15, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.52, { root: { x: 0.0, y: 0.045, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.64, { root: { x: -0.1, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.78, { root: { x: 0.0, y: 0.045, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.9, { root: { x: 0.15, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.04, { root: { x: 0.0, y: 0.045, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.16, { root: { x: -0.1, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.3, { root: { x: -0.05, y: 0.035, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    // Lands home, the guard already lowering.
    key(1.42, { root: { x: 0 } }, SQUASH, pelvis(0, -0.01), GUARD_LOWERING, MOUTH_SHUT, ANGRY),
    key(1.66, pelvis(0, -0.04), bend(6, 2, 0, 0), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'aura' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget, quake, wave, shield, punch, strike, glare, kickSand, heal, toss, burrow, fling, afterimage].map((c) => [c.name, c]),
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
