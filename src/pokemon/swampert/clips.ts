// Swampert's battle animation set: one clip per attack category (+ idle,
// intro, hit, faint) and motif clips for the actions its moves need (quake,
// wave, shield, punch, strike, glare, kick_sand, heal, toss, burrow, fling,
// afterimage). Keys are STANCE + deltas (see compose()); the structure
// follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   pelvis   model-unit offset of the hips and spine (crouches, weight
//            shifts: shift() moves it with the feet kept planted)
//   root     a small offset or tilt of the whole body (a recoil, a faint
//            settling back); never travel or leaps
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (open, angry, half, closed, squint, narrow, hurt)
// Events: impact (contact lands), release (projectile/stream/wave starts),
// releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a toss carries
// the foe from its grab to its throw), dig (a burrow goes under).
//
// How Swampert moves (the brief in index.ts):
//   - every clip acts in place: the compiled game moves the sprite (its
//     lunges, hops and slides) and the body follows it; a blow is its mass
//     surging from where it stands, the hips driving at the foe with the feet
//     planted and the arms or shoulder reaching it;
//   - it is heavy (82 kg) and low: wind-ups are long, weight shifts are slow
//     and sink deep into the knees; it never springs like a fighter;
//   - its power is its mass and its arms: tackles lead with the shoulder and
//     the whole body, Earthquake hammers both fists into the ground, Surf and
//     Muddy Water are heaved up with both arms and pushed at the foe, Seismic
//     Toss is a sumo's bear hug, Mud-Slap a two-handed scoop of mud;
//   - digging and diving are its element: Dig and Dive throw it forward into
//     a deep crouch, paddling the mud like water, and it breaches up out of it;
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
const DROWSY: Pose = { expression: 'half' };
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
/** Arms swinging round from behind at shoulder height, wide (launching a body slam; low in front, a wild Swampert's hands went under our healthbox). */
const ARMS_SWING = arms([0.92, -0.1, 0.38], [0.62, -0.05, 0.78], [0.2, -0.2, 0.96]);
/** Arms flung forward round the foe at chest height (the body slam's crash: down in front, a wild Swampert's hands went under our healthbox). */
const SLAM_ARMS = arms([0.72, 0.08, 0.69], [0.38, 0.02, 0.92], [0.02, -0.12, 0.99]);
/** Arms flung up high in a narrow V (battle cry, calling the sky). */
const ARMS_ROAR = arms([0.55, 0.8, 0.25], [0.3, 0.93, 0.2], [0.1, 0.97, 0.2]);
/** Fists pulled up by the shoulders, elbows out (bursting up out of a crouch). */
const FISTS_UP = arms([0.7, 0.45, 0.55], [-0.1, -0.4, 0.91], [-0.2, -0.6, 0.77]);
/** Both arms heaved up high in front (raising a wave). */
const ARMS_HEAVE_HIGH = arms([0.42, 0.72, 0.55], [0.15, 0.9, 0.4], [-0.1, 0.93, 0.35]);
/** Arms thrown wide at shoulder height (roaring at the foe). */
const ARMS_WIDE = arms([0.95, 0.05, 0.3], [0.75, -0.35, 0.55], [0.3, -0.7, 0.65]);
/** Both fists hammered down in front, to knee height (onto a foe it holds; down to the ground, a wild Swampert's fists went under our healthbox). */
const HAMMER_DOWN = arms([0.32, -0.42, 0.85], [0.1, -0.7, 0.71], [-0.08, -0.85, 0.52]);
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
/** Flinch: the hands jerk up in front of the face. */
const FLINCH = arms([0.62, 0.05, 0.78], [-0.05, 0.8, 0.6], [-0.3, 0.85, 0.43]);
/** Arms hanging limp at its sides, a little behind the hips (resting). */
const LIMP_ARMS = arms([0.55, -0.82, -0.12], [0.2, -0.97, 0.1], [-0.2, -0.95, 0.2]);
/** The crab arms easing out at the elbows, hands hanging (a breakdown into and out of a squat: the hands pass at its sides, not low in front). */
const ELBOWS_OUT = arms([0.93, -0.22, 0.28], [0.5, -0.85, 0.18], [-0.3, -0.88, 0.37]);
/** Right fist driven straight at the foe, left fist pulled back to the hip. */
const PUNCH_R = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, 0.02, 0.99], [-0.05, 0.02, 1], [-0.02, 0.05, 1]]);
/** The punch carries through past the foe. */
const PUNCH_R_THROUGH = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[0.12, -0.08, 0.99], [0.2, -0.1, 0.97], [0.25, -0.1, 0.96]]);
/** Right hand raised high behind the head, edge ready to chop (Brick Break): up by the head, not out at its side (from our side, the hand went under our healthbox). */
const CHOP_RAISED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.33, 0.78, -0.53], [0.05, 0.97, 0.25], [0.1, 0.95, 0.3]]);
/** CHOP_RAISED cocked further back as the weight settles, so the chop starts from a turnaround, not a dead stop. */
const CHOP_COCKED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.28, 0.8, -0.53], [0.08, 0.97, -0.22], [0.12, 0.88, -0.46]]);
/**
 * The chop drives down and across in front to chest height, the left fist
 * pulled back to the hip (lower, a wild Swampert's hands went under our healthbox).
 */
const CHOP_DOWN = arms([0.62, -0.5, -0.6], [0.3, -0.05, 0.95], [0.1, 0.1, 0.99], [[-0.2, -0.05, 0.98], [0.5, -0.2, 0.84], [0.62, -0.2, 0.76]]);
/** The chop carries on across. */
const CHOP_THROUGH = arms([0.62, -0.5, -0.6], [0.3, -0.05, 0.95], [0.1, 0.1, 0.99], [[-0.05, -0.12, 0.99], [0.6, -0.28, 0.75], [0.72, -0.28, 0.64]]);
/** The crab arms held up at the elbows, hands off the ground: recovering from a crouch (in the stance's arms, a wild Swampert's hands went under our healthbox). */
const ARMS_SET = arms([0.9, -0.2, 0.39], [0.62, -0.58, 0.53], [-0.45, -0.65, 0.61]);
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

/** Landing: the knees take the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.05 }, bones: { spine: { x: 8 }, head: { x: -6 } } };

// Planted feet ----------------------------------------------------------------
//
// The foot IK pins a planted foot's height but keeps its posed x/z, so moving
// the pelvis would slide the feet with it. shift() re-aims the legs instead
// (two bones, the knee bending in the stance's plane), so each foot stays
// where the stance puts it while the hips sink back or surge at the foe. The
// stance's legs, in heights from the body's origin along the model's axes
// (measured in the clip review, window.__clip.joints()): each leg's hip, knee
// and ankle. The stance itself doesn't aim the legs, so a clip that shifts its
// weight aims them in every key (PLANTED at its ends).

const LEGS: Record<'L' | 'R', { hip: Vec3; knee: Vec3; foot: Vec3 }> = {
  L: { hip: [0.1728, 0.3073, -0.153], knee: [0.2577, 0.1877, -0.0669], foot: [0.2919, 0.1726, -0.2263] },
  R: { hip: [-0.1728, 0.3073, -0.153], knee: [-0.2577, 0.1877, -0.0669], foot: [-0.2919, 0.1726, -0.2263] },
};
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const along = (a: Vec3, d: Vec3, s: number): Vec3 => [a[0] + d[0] * s, a[1] + d[1] * s, a[2] + d[2] * s];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec3): Vec3 => along([0, 0, 0], a, 1 / (Math.hypot(...a) || 1));

/** Thigh and shin directions from `hip` to the leg's planted foot. */
function legTo(leg: 'L' | 'R', hip: Vec3): { thigh: Vec3; shin: Vec3 } {
  const { hip: h0, knee: k0, foot } = LEGS[leg];
  const a = Math.hypot(...sub(k0, h0));
  const b = Math.hypot(...sub(foot, k0));
  const u0 = unit(sub(foot, h0));
  const u = unit(sub(foot, hip));
  // The side of the hip-to-foot line the knee bends to, as at the stance.
  const out0 = along(sub(k0, h0), u0, -dot(sub(k0, h0), u0));
  const out = unit(along(out0, u, -dot(out0, u)));
  const d = Math.min(Math.hypot(...sub(foot, hip)), a + b - 1e-4);
  const cos = (a * a + d * d - b * b) / (2 * a * d);
  const knee = along(along(hip, u, a * cos), out, a * Math.sqrt(Math.max(0, 1 - cos * cos)));
  return { thigh: unit(sub(knee, hip)), shin: unit(sub(foot, knee)) };
}

/**
 * The weight shifted with the feet planted: the pelvis moved (x, y, z)
 * heights from the stance's (+x its left, +z at the foe), both legs re-aimed
 * so the feet stay where they stand. Sinking lifts the left elbow a little,
 * as sink() does (as the foe, that hand hangs lowest, over our healthbox).
 */
function shift(x: number, y: number, z: number): Pose {
  const pose: Pose = { pelvis: { x, y, z }, aim: {} };
  if (y < 0) pose.post = { armL: { z: -70 * y } };
  for (const leg of ['L', 'R'] as const) {
    const { thigh, shin } = legTo(leg, along(LEGS[leg].hip, [x, y, z], 1));
    pose.aim![`thigh${leg}`] = { dir: thigh };
    pose.aim![`shin${leg}`] = { dir: shin };
  }
  return pose;
}
/** The stance's legs, aimed (the first and last keys of a clip that shifts its weight). */
const PLANTED: Pose = shift(0, 0, 0);

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
 * Sent out: bursts up out of a curled crouch onto straight legs with its
 * fists pulled up by its shoulders, leaning in, then drops heavily back into
 * the knees with the fists coming down in front, and roars with its arms
 * flung up high. It stays on its feet: the game hops the sprite (the stock
 * front anim is ANIM_V_JUMPS_BIG) and the body follows. The arms go up and
 * come down the front of the body: from our side arms flung wide or swung
 * round the sides took the right hand under our healthbox.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.9,
  keys: [
    key(0, pelvis(0, -0.07), bend(18, 6, 0, 16), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Coil deeper.
    key(0.22, pelvis(0, -0.1), bend(24, 8, 2, 20), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Burst up onto straight legs, leaning in, fists pulled up.
    snap(0.42, pelvis(0, 0.022), bend(-2, -4, -2, -10), FISTS_UP, FISTS, jaw(6), ANGRY),
    key(0.54, pelvis(0, 0.026), bend(-3, -4, -2, -12), FISTS_UP, FISTS, jaw(8), ANGRY),
    // A heavy drop back into the knees, the fists coming down in front.
    fall(0.7, LAND, pelvis(0, -0.03), bend(8, 2, 0, 4), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    key(0.78, LAND, pelvis(0, -0.035), bend(9, 2, 0, 5), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    // Roar: rears up, arms flung up high, jaw wide (moving hold).
    snap(0.94, pelvis(0, 0.012), bend(-12, -8, -6, -20), ARMS_ROAR, jaw(26), ANGRY),
    key(1.12, pelvis(0, 0.014), bend(-13, -8, -6, -22, 5, 3), ARMS_ROAR, jaw(28), ANGRY),
    key(1.3, pelvis(0, 0.012), bend(-12, -8, -6, -21, -5, -3), ARMS_ROAR, jaw(26), ANGRY),
    // The arms come down in front, and it settles into its crab-armed stance.
    key(1.48, pelvis(0, -0.01), bend(4, 2, 0, -4), ARMS_DOWN_FRONT, jaw(8), ANGRY),
    key(1.64, pelvis(0, -0.012), bend(4, 2, 0, -2), jaw(4), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 1.0, name: 'cry' }],
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
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it settles back heavily onto its heels and curls over its belly,
 * arms folded in and head bowed between its shoulders, eyes shut; from the
 * 'shrink' the curled body shrinks away (Battler3D). It sits back as it
 * curls: slumped forward onto its belly, the foe's head fell onto our
 * healthbox (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.7,
  keys: [
    key(0),
    key(0.2, { root: { z: -0.02 } }, bend(-8, -4, -2, -12), jaw(-8), DROWSY),
    key(0.52, sink(-0.05), { root: { z: -0.03 } }, bend(6, 2, 1, 12), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(0.88, sink(-0.08), { root: { z: -0.06, pitch: -2 } }, bend(10, 4, 2, 19), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(1.02, sink(-0.085), { root: { z: -0.06, pitch: -2 } }, bend(11, 5, 2, 20), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(1.7, sink(-0.083), { root: { z: -0.06, pitch: -2 } }, bend(10, 4, 2, 19), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
  ],
  events: [{ t: 1.12, name: 'shrink' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Weak contact (Tackle, Facade, Secret Power...): a shoulder charge from
 * where it stands. It sinks with the weight back and the right shoulder
 * drawing back, the head lowering, then its hips surge at the foe and the
 * right shoulder drives into it, head down, the body compressing into the
 * blow; it rocks back off the hit, shaking its head, the arms coming back
 * out at its sides.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.25,
  keys: [
    key(0, PLANTED),
    // Wind-up: it sinks, the weight back, the forearms coming up before the chest, the right shoulder drawing back, head lowering.
    key(0.14, shift(0, -0.02, -0.01), twist(-3), bend(5, 2, 1, 5), GUARD_RISING, MOUTH_SHUT, ANGRY),
    key(0.26, shift(0, -0.056, -0.03), twist(-7), bend(13, 4, 2, 13), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Body blow: the hips surge at the foe, the right shoulder leading, head down; it compresses into the hit.
    // (Bowed further, the head fins dropped out of sight from our side.)
    key(0.34, shift(0, -0.05, 0.005), twist(0), bend(16, 4, 0, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    snap(0.42, shift(0, -0.04, 0.055), twist(18), bend(22, 6, 0, 4), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    key(0.52, shift(0, -0.046, 0.058), twist(16), bend(21, 6, 0, 4), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // It rocks back off the foe, shaking its head, the arms coming back out at its sides.
    key(0.7, shift(0, -0.038, 0.005), twist(4), bend(8, 2, 0, 0, 7), ARMS_SET, ANGRY),
    key(0.84, shift(0, -0.03, 0), bend(6, 0, 0, 0, -5), ARMS_SET, ANGRY),
    key(0.98, shift(0, -0.02, 0), bend(3, 1, 0, 1), ANGRY),
    key(1.25, PLANTED, OPEN_EYES),
  ],
  events: [{ t: 0.43, name: 'impact' }],
};

/**
 * Strong contact (Take Down, Double-Edge, Body Slam, Strength...): the whole
 * mass as a weapon, from where it stands. A long coil, sinking deep and
 * rearing back with the arms drawn back, then its legs drive the whole body
 * at the foe, the arms swinging round wide, and it throws its weight onto it
 * chest-first with the arms flung round it at chest height; it shoves off
 * and stands its ground again, the arms coming back out at its sides (low in
 * front, a wild Swampert's hands went under our healthbox).
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.9,
  keys: [
    key(0, PLANTED),
    // Coil: sinks deep, rears back, arms drawn back.
    key(0.34, shift(0, -0.1, -0.03), bend(-8, -6, -2, -8), ARMS_BACK, MOUTH_SHUT, ANGRY),
    key(0.48, shift(0, -0.11, -0.035), bend(-9, -6, -2, -10), ARMS_BACK, MOUTH_SHUT, ANGRY),
    // Launch: the legs drive the whole mass at the foe, the arms swinging round wide...
    key(0.6, shift(0, -0.07, 0.03), bend(6, 2, 0, -6), ARMS_SWING, jaw(10), ANGRY),
    // ...and it throws its weight onto the foe chest-first, the arms flung round it at chest height,
    // the face kept up at it (bowed and sunk deeper, from our side the head fins went down
    // behind the text box on the hit).
    snap(0.72, shift(0, -0.035, 0.075), bend(14, 6, 0, -8), SLAM_ARMS, MOUTH_SHUT, SQUINT),
    key(0.84, shift(0, -0.045, 0.078), bend(15, 6, 0, -7), SLAM_ARMS, MOUTH_SHUT, SQUINT),
    key(0.98, shift(0, -0.042, 0.068), bend(13, 5, 0, -7), SLAM_ARMS, MOUTH_SHUT, SQUINT),
    // Shoves off and stands its ground again, the arms coming back out at its sides.
    key(1.18, shift(0, -0.04, 0.01), bend(8, 2, 0, 0), ARMS_SET, ANGRY),
    key(1.38, shift(0, -0.025, 0), bend(5, 1, 0, 0), ARMS_SET, ANGRY),
    key(1.9, PLANTED, OPEN_EYES),
  ],
  events: [{ t: 0.73, name: 'impact' }],
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
 * The right fist drawn back and up by the ear as the weight sinks, the elbow
 * high, the left arm out front as a guard (cocked straight back and out, from
 * our side the fist and elbow went under our healthbox).
 */
const CHAMBER_R = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.3, 0.7, -0.65], [-0.05, 0.8, 0.6], [0.0, 0.7, 0.71]]);
/** ... cocked a little further up and back as the weight settles, so the punch starts from a turnaround. */
const CHAMBER_R_UP = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.3, 0.1, 0.95], [[-0.26, 0.8, -0.54], [-0.02, 0.95, 0.3], [0.02, 0.85, 0.52]]);

/**
 * Mega Punch, Focus Punch, DynamicPunch, Ice Punch, Counter (punch): a heavy
 * haymaker from where it stands. It cocks the right fist up and back by its
 * ear with the torso turned away and the weight sinking back, then its hips
 * surge at the foe, hips and shoulders unwind and the fist drives through
 * it; the fist carries on, the body leaning into it, and it squares up
 * again, the arms coming back out at its sides.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.4,
  keys: [
    key(0, PLANTED),
    key(0.24, shift(0, -0.05, -0.025), bend(10, 2, 0, 4), twist(-9), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.34, shift(0, -0.058, -0.03), bend(10, 2, 0, 4), twist(-12), CHAMBER_R_UP, FISTS, MOUTH_SHUT, ANGRY),
    // The punch: the hips surge at the foe, hips and shoulders unwind, the fist drives straight at it.
    snap(0.44, shift(0, -0.04, 0.05), bend(14, 4, 0, 4), twist(18), PUNCH_R, FISTS, jaw(6), ANGRY),
    // Follow-through: the fist carries on, the body leaning into it.
    key(0.6, shift(0, -0.042, 0.055), bend(16, 4, 0, 4), twist(23), PUNCH_R_THROUGH, FISTS, jaw(4), ANGRY),
    key(0.74, shift(0, -0.04, 0.048), bend(15, 4, 0, 4), twist(21), PUNCH_R_THROUGH, FISTS, jaw(4), ANGRY),
    key(0.92, shift(0, -0.03, 0.005), bend(8, 2, 0, 0), ARMS_SET, ANGRY),
    key(1.4, PLANTED, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
};

/**
 * Brick Break, Rock Smash (strike): after Blaziken's slash, heavier. It
 * raises the right hand high behind its head as the weight sinks back, then
 * its hips surge at the foe and the hand chops down and across to the foe's
 * chest, the left fist pulled back to the hip; it follows through across and
 * squares up again.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.35,
  keys: [
    key(0, PLANTED),
    key(0.22, shift(0, -0.045, -0.025), bend(10, 2, 0, 2), twist(-12), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.34, shift(0, -0.05, -0.03), bend(11, 2, 0, 2), twist(-16), CHOP_COCKED, MOUTH_SHUT, ANGRY),
    // The chop: the hips surge at the foe, the hand chops down and across.
    snap(0.44, shift(0.01, -0.05, 0.05), bend(17, 5, 0, 4), twist(16), CHOP_DOWN, jaw(6), ANGRY),
    key(0.6, shift(0.012, -0.052, 0.052), bend(18, 5, 0, 4), twist(20), CHOP_THROUGH, jaw(4), ANGRY),
    // Squares up again, the arms coming back out at its sides.
    key(0.8, shift(0, -0.03, 0.01), bend(8, 2, 0, 0), ARMS_SET, ANGRY),
    key(1.35, PLANTED, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
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
/** Hoisting it up against the chest (overhead would carry the foe off the screen). */
const HOIST = arms([0.42, 0.14, 0.9], [-0.4, 0.3, 0.87], [-0.62, 0.3, 0.72]);

/** The hug tightened round the foe as it loads, the forearms pulled in against the belly. */
const HUG_LOW = arms([0.48, -0.25, 0.84], [-0.6, -0.05, 0.8], [-0.82, 0.05, 0.57]);

/**
 * Seismic Toss (toss): a sumo's bear hug, where it stands. It squares up
 * with the crab arms flung wide, surges at the foe and the arms close round
 * it (grab: in the playtest the foe rides in the grip from here,
 * src/battle3d/director.ts); it sinks deep with it, straining, then heaves
 * it up against its chest (not overhead: the foe would leave the screen), the
 * head thrown back, and from there the whole body folds forward and both arms
 * drive it down at its place (throw); the foe crashes there (impact) while
 * Swampert watches from deep in the knees. The chest keeps its tilt from the
 * hug to the throw (the foe rides in the grip turned with the chest: from
 * where it stands a tilt swung the foe round it). Hands trail the hips by
 * ~0.07 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.3,
  keys: [
    key(0, PLANTED),
    // Squares up: sinks, the crab arms swinging open wide.
    key(0.24, shift(0, -0.07, -0.01), bend(6, 2, 0, 2), HUG_OPEN, MOUTH_SHUT, ANGRY),
    // Surges at the foe, the arms closing round it...
    key(0.42, shift(0, -0.06, 0.05), bend(3, 1, 0, 2), HUG_MID, MOUTH_SHUT, ANGRY),
    // ...and locking round it (grab as the hands meet), the weight sinking back with it.
    key(0.58, shift(0, -0.09, 0.02), bend(2, 1, 0, 0), HUG, MOUTH_SHUT, ANGRY),
    key(0.76, shift(0, -0.125, 0), bend(2, 1, 0, 2), HUG_LOW, MOUTH_SHUT, SQUINT),
    key(0.9, shift(0, -0.135, -0.004), bend(2, 1, 0, 3), HUG_LOW, MOUTH_SHUT, SQUINT),
    // Heaves it up against its chest, rising out of the squat, the head thrown back.
    key(1.1, shift(0, -0.06, -0.02), bend(2, 1, -4, -12), HOIST, jaw(10), ANGRY),
    key(1.24, shift(0, -0.056, -0.024), bend(2, 1, -5, -14), HOIST, jaw(12), ANGRY),
    // The hurl: the whole body folds forward, both arms driving it down at its place.
    snap(1.36, shift(0, -0.09, 0.05), bend(26, 8, 2, 6), HAMMER_DOWN, jaw(20), ANGRY),
    // Deep in the knees, arms still down: it watches it crash.
    key(1.5, shift(0, -0.11, 0.05), bend(28, 9, 2, 6), HAMMER_DOWN, jaw(16), ANGRY),
    key(1.72, shift(0, -0.08, 0.03), bend(18, 6, 0, 2), HAMMER_DOWN, jaw(22), ANGRY),
    // Straightens.
    key(1.92, shift(0, -0.04, 0.005), bend(8, 2, 0, 0), jaw(6), ANGRY),
    key(2.3, PLANTED, OPEN_EYES),
  ],
  // The throw lets go as the fold starts (the hands trail the hips); it lands on the impact.
  events: [{ t: 0.64, name: 'grab' }, { t: 1.31, name: 'throw' }, { t: 1.58, name: 'impact' }],
};

/** Arms swung back behind the body (a diver about to spring). */
const DIVE_BACK = arms([0.55, -0.45, -0.7], [0.4, -0.6, -0.7], [0.2, -0.75, -0.62]);
/** Fists drawn in low before the belly (underground, coiled to burst up). */
const FISTS_LOW = arms([0.6, -0.7, 0.38], [-0.2, -0.3, 0.93], [-0.35, -0.2, 0.92]);

/** Both hands dug into the mud beside the feet, a little behind them (scooping). */
const SCOOP_DOWN = arms([0.72, -0.68, 0.12], [0.35, -0.92, 0.15], [-0.2, -0.85, 0.48]);
/**
 * Dig, Dive (burrow): digging and diving are its element; here it digs where
 * it stands. It rears back with the arms swung back, throws itself forward
 * into a deep crouch with both hands plunging into the mud at its sides
 * (dig: the ground bursts up, or a water column for Dive), paddles the mud
 * back past its hips in one great stroke as if swimming, gathers low and
 * breaches up out of the crouch with both fists heaving up in front and the
 * jaw wide (impact), then comes down heavily with the arms braced wide,
 * glaring up at the foe. (The game sinks the sprite into the ground and
 * raises it under the foe; the body follows.)
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.0,
  keys: [
    key(0, PLANTED),
    // Rears back and sinks, arms swung back (the wind-up before throwing itself forward).
    key(0.24, shift(0, -0.04, -0.04), bend(-9, -4, 0, -4), DIVE_BACK, MOUTH_SHUT, ANGRY),
    // It throws itself forward into a deep crouch, both hands plunging into the mud at its sides.
    key(0.42, shift(0, -0.09, 0.02), bend(16, 6, 2, 8), SCOOP_DOWN, CURL, MOUTH_SHUT, ANGRY),
    // One great stroke: it paddles the mud back past its hips as if swimming.
    key(0.64, shift(0, -0.1, 0.01), bend(18, 6, 2, 9), ARMS_SCOOP, CURL, MOUTH_SHUT, SHUT),
    // Gathered low, fists at its belly...
    key(0.86, shift(0, -0.1, 0), bend(14, 4, 0, 6), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
    // ...it breaches up out of the crouch, both fists heaving up in front, jaw wide.
    snap(1.0, shift(0, 0.012, 0.03), bend(-10, -6, -2, -14), ARMS_HEAVE_HIGH, FISTS, jaw(20), ANGRY),
    key(1.12, shift(0, 0.015, 0.03), bend(-12, -6, -2, -16), ARMS_HEAVE_HIGH, FISTS, jaw(22), ANGRY),
    // Comes down heavily, deep in the knees, arms braced wide, glaring up at the foe.
    fall(1.3, shift(0, -0.085, 0.01), bend(-2, -1, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.42, shift(0, -0.1, 0.005), bend(0, 0, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.66, shift(0, -0.05, 0), bend(2, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(2.0, PLANTED, OPEN_EYES),
  ],
  // The hands trail the hips (overlap): they plunge in just after their key.
  events: [{ t: 0.48, name: 'dig' }, { t: 1.05, name: 'impact' }],
};

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
/** The head held level against the body's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * Double Team (afterimage): heavy feints from the waist, a sumo's sway, not
 * a sprinter's dart: the weight rolls onto one leg with the upper body
 * swaying out over it and the head held level, dipping as it passes through
 * the middle and swaying out over the other, the arms spread in a grappler's
 * guard that lowers as it settles; the feet stay planted. The sways toward
 * its right are narrower: leaning further that way, our Swampert's right head
 * fin went under our healthbox. The game moves the sprite (Double Team's
 * copies); the afterimages start at the aura and run 1.4 s
 * (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.9,
  keys: [
    key(0, PLANTED),
    // Sways out over its left leg...
    key(0.2, shift(0.04, -0.06, 0), { bones: { spine: { y: 8, z: -12 } } }, level(8), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    // ...dips through the middle...
    key(0.36, shift(0, -0.075, 0.004), bend(12, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    // ...and out over its right; and back, and again.
    key(0.52, shift(-0.03, -0.06, 0), { bones: { spine: { y: -6, z: 9 } } }, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.68, shift(0, -0.075, 0.004), bend(12, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.84, shift(0.04, -0.06, 0), { bones: { spine: { y: 8, z: -12 } } }, level(8), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.0, shift(0, -0.075, 0.004), bend(12, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.16, shift(-0.026, -0.06, 0), { bones: { spine: { y: -5, z: 8 } } }, level(-5), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    // Settles centred, the guard lowering.
    key(1.34, shift(0, -0.05, 0), bend(6, 2, 0, 0), GUARD_LOWERING, MOUTH_SHUT, ANGRY),
    key(1.52, shift(0, -0.04, 0), bend(6, 2, 0, 0), ARMS_SET, ANGRY),
    key(1.9, PLANTED, OPEN_EYES),
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
