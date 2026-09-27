// Blaziken's battle animation set, one clip per attack category (+ idle, intro,
// hit, faint and kick variants). Keys are STANCE + deltas (see compose()).
//
// Channels used here:
//   pelvis   model-unit offset of the hips and spine (crouches, weight shifts:
//            shift() moves it with the feet kept planted)
//   root     rotation of the whole body (spins); never travel or leaps
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   fx.flames 0..1  wrist flames (the stock sprite shows none at rest)
//   expression      eye atlas cell
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a toss), dig
// (a burrow).
//
// How the clips are built (the 12 principles, applied to game clips):
//   - every action has an anticipation (wind-up, crouch, drawn breath) and a
//     follow-through (the limb carries on past the hit, then settles);
//   - keys are extremes and breakdowns; without an explicit ease they are
//     joined by smooth curves, so motion flows and only eases where a
//     channel turns around. 'out' marks snaps (fast start, soft stop);
//   - every clip acts in place: the compiled game moves the sprite (its
//     lunges, hops and slides) and the body follows it. A strike reaches
//     from home: the weight sinks back, then the hips drive at the foe onto
//     the front foot (the feet stay planted), the spine leans in and the
//     claw, fist, foot or beak reaches it at full extension on the impact;
//   - holds keep moving a little (moving holds);
//   - breath attacks come from the mouth: the head leads, the arms stay
//     braced at the sides so the silhouette reads the action.
// The animator adds the rest: overlapping action (head, arms and hands trail
// the body by a few frames, so events that depend on them are placed a
// little after their key), breathing, blinks, and springs on the mane, tail
// and feathers (see src/anim/animator.ts, src/battle3d/battler.ts).

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
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const flames = (v: number): Pose => ({ fx: { flames: v } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});

const GUARD: Pose = {
  aim: {
    armR: { dir: [-0.35, -0.55, 0.75] },
    forearmR: { dir: [0.25, 0.75, 0.6] },
    armL: { dir: [0.35, -0.6, 0.7] },
    forearmL: { dir: [-0.25, 0.75, 0.6] },
  },
};

/**
 * Arms flung wide at the shoulders, forearms raised: the battle cry. Wide
 * rather than overhead, so from the back our Blaziken's claws stay under the
 * foe's healthbox (tools/gauntlet/uiclear.mjs).
 */
const ARMS_SPREAD_UP: Pose = {
  aim: {
    armR: { dir: [-0.93, 0.1, 0.35] },
    forearmR: { dir: [-0.7, 0.62, 0.36] },
    armL: { dir: [0.93, 0.1, 0.35] },
    forearmL: { dir: [0.7, 0.62, 0.36] },
  },
};

/** Both fists chambered at the hips, elbows back (the stance's left arm, mirrored). */
const CHAMBER: Pose = {
  aim: {
    armR: { dir: [-0.5, -0.66, -0.56] },
    forearmR: { dir: [-0.18, -0.2, 0.96] },
    armL: { dir: [0.5, -0.66, -0.56] },
    forearmL: { dir: [0.18, -0.2, 0.96] },
  },
};

/** Drawing breath: elbows pulled back and up, chest open. */
const ELBOWS_BACK: Pose = {
  aim: {
    armR: { dir: [-0.55, -0.42, -0.72] },
    forearmR: { dir: [-0.22, 0.08, 0.97] },
    armL: { dir: [0.55, -0.42, -0.72] },
    forearmL: { dir: [0.22, 0.08, 0.97] },
  },
};

/** Braced for a blast: arms low at the sides, fists by the thighs. */
const BRACED: Pose = {
  aim: {
    armR: { dir: [-0.42, -0.82, -0.38] },
    forearmR: { dir: [-0.22, -0.5, 0.84] },
    armL: { dir: [0.42, -0.82, -0.38] },
    forearmL: { dir: [0.22, -0.5, 0.84] },
  },
};

/** Arms crossed low in front (gathering power). */
const CROSSED: Pose = {
  aim: {
    armR: { dir: [-0.2, -0.75, 0.63] },
    forearmR: { dir: [0.75, -0.1, 0.65] },
    armL: { dir: [0.2, -0.75, 0.63] },
    forearmL: { dir: [-0.75, -0.05, 0.66] },
  },
};

/** Double-biceps flex. */
const FLEX: Pose = {
  aim: {
    armR: { dir: [-0.95, 0.25, 0.1] },
    forearmR: { dir: [-0.15, 0.97, 0.15] },
    armL: { dir: [0.95, 0.25, 0.1] },
    forearmL: { dir: [0.15, 0.97, 0.15] },
  },
};

/** Claws curled into fists. */
const FISTS: Pose = {
  bones: {
    fingerA1R: { z: 34 }, fingerB1R: { z: 34 }, fingerC1R: { z: 34 },
    fingerA2R: { z: 30 }, fingerB2R: { z: 30 }, fingerC2R: { z: 30 },
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
  },
};

// Planted feet ----------------------------------------------------------------
//
// The foot IK pins a planted foot's height but keeps its posed x/z, so
// moving the pelvis would slide the feet with it. shift() re-aims the legs
// instead (two bones, the knee bending in the stance's plane), so each foot
// stays where the stance puts it while the hips sink back, drive at the foe
// or turn. The stance's legs, in heights from the body's origin along the
// model's axes (measured in the clip review, window.__clip.joints()): the
// hips' pivot, and each leg's hip, knee and ankle.

const HIPS_PIVOT: Vec3 = [0, 0.567, 0.039];
const LEGS: Record<'L' | 'R', { hip: Vec3; knee: Vec3; foot: Vec3 }> = {
  L: { hip: [0.053, 0.5, 0.036], knee: [0.148, 0.313, -0.078], foot: [0.182, 0.132, -0.003] },
  R: { hip: [-0.053, 0.5, 0.047], knee: [-0.126, 0.315, 0.179], foot: [-0.17, 0.128, 0.126] },
};
const DEG = Math.PI / 180;
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const along = (a: Vec3, d: Vec3, s: number): Vec3 => [a[0] + d[0] * s, a[1] + d[1] * s, a[2] + d[2] * s];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec3): Vec3 => along([0, 0, 0], a, 1 / (Math.hypot(...a) || 1));
/** A direction turned `yaw`° about the vertical (+ toward its left). */
const yawed = (d: Vec3, yaw: number): Vec3 => {
  const c = Math.cos(yaw * DEG), s = Math.sin(yaw * DEG);
  return [d[0] * c + d[2] * s, d[1], -d[0] * s + d[2] * c];
};

/** Thigh and shin directions from `hip` to the leg's planted foot (at `foot`, if the body has turned over it). */
function legTo(leg: 'L' | 'R', hip: Vec3, foot = LEGS[leg].foot): { thigh: Vec3; shin: Vec3 } {
  const { hip: h0, knee: k0, foot: f0 } = LEGS[leg];
  const a = Math.hypot(...sub(k0, h0));
  const b = Math.hypot(...sub(f0, k0));
  const u0 = unit(sub(f0, h0));
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
 * heights from the stance's (+x its left, +z at the foe) and the hips turned
 * `yaw`° (+ toward its left), each leg in `legs` re-aimed so its foot stays
 * where it stands. A leg left out is free (a kick aims it). `spin` turns the
 * whole body (root.yaw) over the planted feet: a pivot on the ball of the
 * standing foot.
 */
function shift(x: number, y: number, z: number, yaw = 0, legs = 'LR', spin = 0): Pose {
  const pose: Pose = { pelvis: { x, y, z }, aim: {} };
  if (yaw) pose.bones = { hips: { y: yaw } };
  if (spin) pose.root = { yaw: spin };
  for (const leg of ['L', 'R'] as const) {
    if (!legs.includes(leg)) continue;
    const r = yawed(sub(LEGS[leg].hip, HIPS_PIVOT), yaw);
    const hip: Vec3 = [HIPS_PIVOT[0] + r[0] + x, HIPS_PIVOT[1] + r[1] + y, HIPS_PIVOT[2] + r[2] + z];
    const { thigh, shin } = legTo(leg, hip, yawed(LEGS[leg].foot, -spin));
    pose.aim![`thigh${leg}`] = { dir: thigh };
    pose.aim![`shin${leg}`] = { dir: shin };
  }
  return pose;
}

/**
 * A foot lifted `h` heights straight up off its spot (the pelvis at (x, y, z),
 * the hips turned `yaw`° and the body spun `spin`° as in shift()), its plant
 * released: a foot leaves and meets the ground here, so it never drags along it.
 */
function footUp(leg: 'L' | 'R', h: number, x: number, y: number, z: number, yaw = 0, spin = 0): Pose {
  const r = yawed(sub(LEGS[leg].hip, HIPS_PIVOT), yaw);
  const foot = LEGS[leg].foot;
  const { thigh, shin } = legTo(leg, [HIPS_PIVOT[0] + r[0] + x, HIPS_PIVOT[1] + r[1] + y, HIPS_PIVOT[2] + r[2] + z], yawed([foot[0], foot[1] + h, foot[2]], -spin));
  return { [leg === 'L' ? 'plantLeft' : 'plantRight']: 0, aim: { [`thigh${leg}`]: { dir: thigh }, [`shin${leg}`]: { dir: shin } } };
}

/** A pose's aims turned `yaw`° about the vertical: limbs that turn with the body (the hips and torso turned, not the root). */
function turned(pose: Pose, yaw: number): Pose {
  return { ...pose, aim: Object.fromEntries(Object.entries(pose.aim ?? {}).map(([b, a]) => [b, { ...a, dir: yawed(a.dir, yaw) }])) };
}
/** The upper body turned with the hips (+ toward its left), the head turned back to keep its eyes on the foe. */
const torso = (yaw: number, head = -0.8 * yaw): Pose => ({ bones: { spine: { y: yaw }, head: { y: head } } });

// Clips -----------------------------------------------------------------------

const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(2.4),
  ],
};

/** Sent out: bursts out of a crouch into a battle cry, wrist flames flaring (cf. BACK_ANIM_SHAKE_GLOW_RED). */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.05), bend(16, 4, 0, 18), CROSSED, FISTS, SHUT),
    key(0.2, pelvis(0, -0.075), bend(22, 6, 2, 22), CROSSED, FISTS, SHUT),
    snap(0.42, pelvis(0, 0.016), bend(-14, -8, -6, -22), ARMS_SPREAD_UP, jaw(34), ANGRY, flames(1)),
    key(0.62, pelvis(0, 0.012), bend(-13, -8, -6, -20, 0, 4), ARMS_SPREAD_UP, jaw(30), ANGRY, flames(1)),
    key(0.8, pelvis(0, 0.014), bend(-14, -8, -6, -21, 0, -4), ARMS_SPREAD_UP, jaw(32), ANGRY, flames(1)),
    key(0.98, pelvis(0, 0.01), bend(-11, -6, -4, -16), ARMS_SPREAD_UP, jaw(8), ANGRY, flames(0.8)),
    key(1.2, pelvis(0, -0.012), bend(6, 2, 0, 0), GUARD, ANGRY, flames(0.4)),
    key(1.65, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/**
 * The right claw rising up the front of the body on its way behind the head
 * (swung out round the side, it went under our healthbox from our side), the
 * left arm guarding low in front.
 */
const CLAW_RISING: Pose = {
  aim: { armR: { dir: [-0.55, 0.2, 0.81] }, forearmR: { dir: [-0.35, 0.7, 0.62] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } },
};
/** ... cocked high behind the head as the weight sinks (the slash starts from a turnaround). */
const CLAW_DRAWN: Pose = {
  aim: { armR: { dir: [-0.46, 0.62, -0.64] }, forearmR: { dir: [-0.1, 0.97, 0.2] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } },
};
/** The slash at full reach: the claw sweeping down and across in front at the foe, the left fist pulled back to the hip. */
const SLASH: Pose = {
  aim: { armR: { dir: [0.22, -0.3, 0.93] }, forearmR: { dir: [0.5, -0.45, 0.74] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } },
};
/** ... carried on down past the left hip. */
const SLASH_THROUGH: Pose = {
  aim: { armR: { dir: [0.5, -0.62, 0.6] }, forearmR: { dir: [0.62, -0.72, 0.3] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } },
};

/**
 * Weak contact move (Scratch, Slash, Quick Attack...): the weight sinks back
 * with the claw cocked high behind the head, then the hips drive at the foe
 * onto the front foot and the torso unwinds into a slash down and across at
 * full reach; the claw carries through past the hip, and back to the guard.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.05,
  keys: [
    key(0),
    // Wind up: the weight sinks back, right shoulder back, the claw raised up the front and cocked behind the head.
    key(0.14, shift(0.01, -0.04, -0.025), { bones: { spine: { x: 8, y: -16 }, head: { x: -6, y: 10 } } }, CLAW_RISING, ANGRY),
    key(0.24, shift(0.014, -0.05, -0.03), { bones: { spine: { x: 6, y: -20 }, head: { x: -6, y: 13 } } }, CLAW_DRAWN, ANGRY),
    // Slash: the hips drive at the foe onto the front foot, the torso unwinds, the claw leads at full reach.
    snap(0.34, shift(-0.012, -0.045, 0.055), { bones: { spine: { x: 24, y: 22, z: -6 }, chest: { x: 6, y: 8 }, head: { x: -12, y: -8 } } }, SLASH, ANGRY),
    // Follow-through: the claw carries on down past its left hip and hangs there.
    key(0.5, shift(-0.014, -0.05, 0.06), { bones: { spine: { x: 26, y: 26, z: -7 }, chest: { x: 7, y: 9 }, head: { x: -12, y: -9 } } }, SLASH_THROUGH, ANGRY),
    key(0.6, shift(-0.012, -0.048, 0.056), { bones: { spine: { x: 25, y: 25, z: -6 }, chest: { x: 6, y: 9 }, head: { x: -11, y: -8 } } }, SLASH_THROUGH, ANGRY),
    // Back into the guard.
    key(0.8, shift(0, -0.03, 0.01), { bones: { spine: { x: 8, y: 6 } } }, GUARD, ANGRY),
    key(1.05, OPEN_EYES),
  ],
  // The hand trails the hips (overlap): the claw is at full reach just after the snap.
  events: [{ t: 0.4, name: 'impact' }],
};

/** The right knee chambered in front, then rising (the standing left leg is planted by shift()). */
const KNEE_R: Pose = { aim: { thighR: { dir: [-0.22, -0.45, 0.86] }, shinR: { dir: [-0.12, -0.95, 0.12] } } };
const KNEE_R_UP: Pose = { aim: { thighR: { dir: [-0.2, -0.25, 0.95] }, shinR: { dir: [-0.12, -0.9, 0.3] } } };
/** The right leg snapped straight out at the foe, at hip height. */
const KICK_R: Pose = { aim: { thighR: { dir: [-0.15, 0.12, 0.98] }, shinR: { dir: [-0.1, 0.18, 0.98] } } };
const KICK_R_HOLD: Pose = { aim: { thighR: { dir: [-0.16, 0.08, 0.98] }, shinR: { dir: [-0.1, 0.12, 0.99] } } };
/**
 * The left knee chambered high in front, the foot tucked under it (the foot
 * comes up off its spot first: swung forward low, a wild Blaziken's toes went
 * under our healthbox).
 */
const KNEE_L: Pose = { aim: { thighL: { dir: [0.22, -0.2, 0.95] }, shinL: { dir: [0.1, -0.92, -0.12] } } };
/** The left leg snapped out at the foe. */
const KICK_L: Pose = { aim: { thighL: { dir: [0.15, 0.15, 0.98] }, shinL: { dir: [0.1, 0.22, 0.97] } } };
const KICK_L_HOLD: Pose = { aim: { thighL: { dir: [0.16, 0.11, 0.98] }, shinL: { dir: [0.1, 0.16, 0.98] } } };

/**
 * Weak contact kicks (Double Kick, Low Kick): two alternating snap kicks from
 * where it stands. The weight goes onto the back foot and the right knee
 * chambers; the leg snaps out at the foe as the body leans back over the
 * standing foot, re-chambers and comes down; then the hips turn into the
 * left kick over the planted right foot.
 */
const physicalWeakKick: Clip = {
  name: 'physical_weak_kick',
  duration: 1.6,
  keys: [
    key(0),
    // Sink, the weight settling back onto the left foot.
    key(0.14, shift(0.02, -0.045, -0.02), { bones: { spine: { x: 10 } } }, GUARD, ANGRY),
    // Right snap kick: the foot comes up, the knee chambers and the leg snaps out, the body leaning back over the standing foot.
    key(0.2, shift(0.024, -0.04, -0.022, 0, 'L'), footUp('R', 0.07, 0.024, -0.04, -0.022), { bones: { spine: { x: 6 } } }, GUARD, ANGRY),
    key(0.26, { plantRight: 0 }, shift(0.026, -0.032, -0.024, 0, 'L'), { bones: { spine: { x: 0 } } }, GUARD, ANGRY, KNEE_R_UP),
    snap(0.33, { plantRight: 0 }, shift(0.026, -0.02, -0.022, 0, 'L'), { bones: { spine: { x: -12 } } }, GUARD, ANGRY, KICK_R),
    key(0.42, { plantRight: 0 }, shift(0.026, -0.022, -0.022, 0, 'L'), { bones: { spine: { x: -11 } } }, GUARD, ANGRY, KICK_R_HOLD),
    key(0.51, { plantRight: 0 }, shift(0.022, -0.03, -0.02, 0, 'L'), { bones: { spine: { x: 0 } } }, GUARD, ANGRY, KNEE_R),
    // The foot comes back down on its spot; the weight crosses onto it.
    key(0.58, shift(0.01, -0.04, -0.01, 0, 'L'), footUp('R', 0.05, 0.01, -0.04, -0.01), { bones: { spine: { x: 6 } } }, GUARD, ANGRY),
    key(0.65, shift(-0.012, -0.045, 0.01), { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    // Left kick: the back foot comes up, the knee through high, and the hips turn into it over the planted right foot.
    key(0.71, shift(-0.018, -0.04, 0.005, -4, 'R'), footUp('L', 0.07, -0.018, -0.04, 0.005, -4), { bones: { spine: { x: 8, y: -2 } } }, GUARD, ANGRY),
    key(0.78, { plantLeft: 0 }, shift(-0.02, -0.035, 0, -10, 'R'), { bones: { spine: { x: 4, y: -6 }, head: { y: 5 } } }, GUARD, ANGRY, KNEE_L),
    snap(0.85, { plantLeft: 0 }, shift(-0.024, -0.02, 0, -22, 'R'), { bones: { spine: { x: -12, y: -12 }, head: { y: 10 } } }, GUARD, ANGRY, KICK_L),
    key(0.94, { plantLeft: 0 }, shift(-0.024, -0.022, 0, -21, 'R'), { bones: { spine: { x: -11, y: -11 }, head: { y: 9 } } }, GUARD, ANGRY, KICK_L_HOLD),
    key(1.05, { plantLeft: 0 }, shift(-0.016, -0.03, 0, -10, 'R'), { bones: { spine: { x: 0, y: -5 }, head: { y: 4 } } }, GUARD, ANGRY, KNEE_L),
    // The foot comes back down on its spot, knees taking the weight.
    key(1.13, shift(-0.008, -0.04, 0, -3, 'R'), footUp('L', 0.05, -0.008, -0.04, 0, -3), { bones: { spine: { x: 8, y: -2 } } }, GUARD, ANGRY),
    key(1.22, shift(0, -0.045, 0), { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  // Legs have no overlap: the kicks land on their keys.
  events: [{ t: 0.34, name: 'impact' }, { t: 0.86, name: 'impact' }],
};

/** Blaze Kick's arms, in the frame of the turned body: chambered (left arm out for balance), then the kick's (right arm swept back). */
const KICK_ARMS_CHAMBER: Pose = { aim: { armR: { dir: [-0.2, -0.3, 0.93] }, forearmR: { dir: [0.4, 0.5, 0.77] }, armL: { dir: [0.9, 0.1, 0.4] }, forearmL: { dir: [0.6, 0.6, 0.5] } } };
const KICK_ARMS: Pose = { aim: { armR: { dir: [-0.3, -0.5, -0.8] }, forearmR: { dir: [0.3, -0.2, -0.93] }, armL: { dir: [0.95, 0.2, 0.2] }, forearmL: { dir: [0.75, 0.6, 0.25] } } };
/** The right leg, in the frame of the turned body: knee chambered across, then driven out to its right side, then folding back. */
const BLAZE_CHAMBER: Pose = { aim: { thighR: { dir: [-0.8, 0.1, 0.6] }, shinR: { dir: [0.1, -0.6, 0.8] } } };
const BLAZE_KICK: Pose = { aim: { thighR: { dir: [-0.97, 0.22, 0.1] }, shinR: { dir: [-0.97, 0.24, 0.05] } } };
const BLAZE_FOLD: Pose = { aim: { thighR: { dir: [-0.6, -0.12, 0.79] }, shinR: { dir: [0.02, -0.92, -0.38] } } };

/**
 * Strong contact move (Blaze Kick, Sky Uppercut...): a deep crouch wound away
 * from the foe, then it whips round on the ball of its planted left foot, the
 * flaming right leg chambering and driving out side-on at the foe at full
 * extension; the turn carries the leg on across, and it folds back in and
 * comes down deep in the knees as the body turns back to face the foe.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.85,
  keys: [
    key(0),
    // Coil: a deep crouch, the hips and torso wound away to its right.
    key(0.28, shift(0.01, -0.09, -0.02, -20), torso(-20, 14), bend(24, 0, 0, -12), turned(GUARD, -20), ANGRY, flames(0.6)),
    key(0.42, shift(0.012, -0.1, -0.024, -24), torso(-24, 16), bend(26, 1, 0, -13), turned(GUARD, -24), ANGRY, flames(0.8)),
    // The whip starts on the ball of the left foot as the right foot comes straight up off its spot
    // (swung forward low, a wild Blaziken's toes went under our healthbox)...
    key(0.47, { plantFeet: 0.4, plantLeft: 1 }, shift(0.015, -0.085, -0.02, -15, 'L', 22), footUp('R', 0.08, 0.015, -0.085, -0.02, -15, 22), torso(-15, 5), bend(18, 1, 0, -10), { bones: { spine: { z: -2 } } }, turned(GUARD, -15), ANGRY, flames(0.9)),
    // ...and it whips round onto the left foot, the right knee chambering.
    key(0.56, { plantLeft: 1, plantRight: 0 }, shift(0.02, -0.05, -0.01, 0, 'L', 60), bend(4, 0, 0, -4, -14), { bones: { spine: { z: -6 } } }, KICK_ARMS_CHAMBER, BLAZE_CHAMBER, ANGRY, flames(1)),
    // The kick: side-on, the leg fully extended at the foe, the body leaning away from it.
    snap(0.66, { plantLeft: 1, plantRight: 0 }, shift(0.03, -0.035, -0.015, 0, 'L', 100), bend(-8, 0, 0, 4, -50), { bones: { spine: { z: -18 } } }, KICK_ARMS, BLAZE_KICK, ANGRY, flames(1)),
    // Follow-through: the turn carries the leg on across in front...
    key(0.8, { plantLeft: 1, plantRight: 0 }, shift(0.028, -0.04, -0.012, 0, 'L', 118), bend(-5, 0, 0, 2, -60), { bones: { spine: { z: -14 } } }, KICK_ARMS, BLAZE_KICK, ANGRY, flames(1)),
    // ...then it folds back in as the body turns back toward the foe.
    key(0.98, { plantLeft: 1, plantRight: 0 }, shift(0.015, -0.06, -0.005, 0, 'L', 60), bend(10, 2, 0, -4, -20), GUARD, BLAZE_FOLD, ANGRY, flames(0.9)),
    // Down deep in the knees, facing the foe again.
    key(1.14, shift(0, -0.075, 0.01), bend(22, 2, 0, -6), GUARD, ANGRY, flames(0.8)),
    key(1.36, shift(0, -0.035, 0.005), { bones: { spine: { x: 10 } } }, GUARD, ANGRY, flames(0.6)),
    key(1.85, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.67, name: 'impact' }],
};

/** Right fist chambered low at the hip, the left arm guarding in front. */
const FIST_LOW: Pose = {
  aim: { armR: { dir: [-0.45, -0.75, -0.48] }, forearmR: { dir: [-0.15, -0.35, 0.92] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } },
};
/** ... wound further back and down (the coil). */
const FIST_WOUND: Pose = {
  aim: { armR: { dir: [-0.5, -0.8, -0.33] }, forearmR: { dir: [-0.15, -0.2, 0.97] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } },
};
/**
 * The uppercut: the fist driven up at the foe's chin, the left fist pulled
 * back to the hip. The upper arm swings through the front (from the hip
 * straight to overhead it swung out round the side, a hook).
 */
const UPPERCUT: Pose = {
  aim: { armR: { dir: [-0.26, 0.25, 0.93] }, forearmR: { dir: [-0.16, 0.72, 0.68] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] } },
};
/**
 * ... carried through up in front and a little out to its right (overhead,
 * or up past the side of its head, our Blaziken's fist went under the foe's
 * healthbox).
 */
const UPPERCUT_HIGH: Pose = {
  aim: { armR: { dir: [-0.38, 0.5, 0.78] }, forearmR: { dir: [-0.22, 0.82, 0.53] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] } },
};

/**
 * Punches (Sky Uppercut, Fire Punch, Mega Punch): a deep crouch with the fist
 * chambered low at the hip, then the legs drive the whole body up and at the
 * foe, the fist leading up through its chin; stretched tall a moment, it
 * drops back into a crouch.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.35,
  keys: [
    key(0),
    // Wind down: a deep crouch, the weight back, the right fist chambered low, eyes on the foe.
    key(0.16, shift(0.01, -0.075, -0.025), bend(24, 6, -6, -14), FIST_LOW, FISTS, ANGRY, flames(0.5)),
    key(0.27, shift(0.012, -0.088, -0.03), bend(28, 8, -6, -17), FIST_WOUND, FISTS, ANGRY, flames(0.8)),
    // The uppercut: the legs start the drive up and at the foe, then everything extends, the fist leading.
    key(0.31, shift(0.006, -0.07, -0.012), bend(22, 6, -6, -17), FIST_WOUND, FISTS, ANGRY, flames(0.9)),
    snap(0.39, shift(-0.012, 0.012, 0.045), bend(-2, -4, -4, -16), UPPERCUT, FISTS, ANGRY, flames(1)),
    // Stretched tall, the fist high (a moving hold).
    key(0.52, shift(-0.012, 0.018, 0.045), bend(-5, -5, -4, -18), UPPERCUT_HIGH, FISTS, ANGRY, flames(1)),
    key(0.62, shift(-0.01, 0.016, 0.04), bend(-6, -5, -4, -19), UPPERCUT_HIGH, FISTS, ANGRY, flames(1)),
    // Drop back into a crouch.
    fall(0.8, shift(0, -0.06, 0.01), bend(20, 4, 0, -8), GUARD, ANGRY, flames(0.6)),
    key(0.98, shift(0, -0.03, 0.005), bend(10, 2, 0, -4), GUARD, ANGRY, flames(0.4)),
    key(1.35, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'impact' }],
};

/** Arms swept back for balance while the head or shoulder leads (charges, beak jabs). */
const ARMS_BACK: Pose = {
  aim: { armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] } },
};
/** Arms swinging down and back at the sides (loading a charge). */
const ARMS_LOW_BACK: Pose = {
  aim: { armR: { dir: [-0.4, -0.85, -0.35] }, forearmR: { dir: [-0.25, -0.85, 0.45] }, armL: { dir: [0.4, -0.85, -0.35] }, forearmL: { dir: [0.25, -0.85, 0.45] } },
};
/** ... swept back behind it as it charges. */
const ARMS_SWEPT: Pose = {
  aim: { armR: { dir: [-0.35, -0.55, -0.76] }, forearmR: { dir: [-0.25, -0.65, -0.72] }, armL: { dir: [0.35, -0.55, -0.76] }, forearmL: { dir: [0.25, -0.65, -0.72] } },
};

/**
 * Tackles (Quick Attack, Take Down): a crouch with the right shoulder turning
 * forward, then the hips and shoulder drive at the foe, low and fast, the
 * arms swept back; it bounces back off the hit.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.0,
  keys: [
    key(0),
    key(0.14, shift(0.01, -0.05, -0.03), { bones: { spine: { x: 24, y: -14 }, head: { x: -12, y: 10 } } }, ARMS_LOW_BACK, ANGRY),
    // The charge: low and fast, the right shoulder leading, arms swept back.
    snap(0.24, shift(-0.014, -0.06, 0.065), { bones: { spine: { x: 36, y: -24 }, chest: { x: 4 }, head: { x: -18, y: 16 } } }, ARMS_SWEPT, ANGRY),
    key(0.32, shift(-0.016, -0.062, 0.068), { bones: { spine: { x: 37, y: -25 }, chest: { x: 5 }, head: { x: -19, y: 17 } } }, ARMS_SWEPT, ANGRY),
    // Bounce back off the foe, the arms swinging through low into the guard.
    key(0.42, shift(0.002, -0.048, 0.02), { bones: { spine: { x: 20, y: -12 }, head: { x: -8, y: 8 } } }, ARMS_LOW_BACK, ANGRY),
    key(0.52, shift(0.008, -0.04, -0.012), { bones: { spine: { x: 10, y: -6 } } }, GUARD, ANGRY),
    key(0.66, shift(0, -0.03, 0), { bones: { spine: { x: 6 } } }, GUARD, ANGRY),
    key(1.0, OPEN_EYES),
  ],
  events: [{ t: 0.25, name: 'impact' }],
};

/**
 * Peck: the beak is the weapon. The head cocks back as the weight sinks,
 * then the hips drive forward and the spine, neck and head drive the beak
 * down at the foe with the arms swept back; the head rebounds off the hit.
 */
const peck: Clip = {
  name: 'peck',
  duration: 1.0,
  keys: [
    key(0),
    // Cock the head back, beak up, the weight settling back.
    key(0.14, shift(0.006, -0.035, -0.02), bend(-4, -6, -14, -20), GUARD, ANGRY),
    // Coiled: the head goes further back, the arms sweep back for balance.
    key(0.24, shift(0.008, -0.045, -0.028), bend(-2, -8, -18, -24), ARMS_BACK, ANGRY),
    // The jab: spine, neck and head all pitch forward, the beak leads.
    snap(0.32, shift(-0.01, -0.05, 0.055), bend(22, 12, 18, 18), ARMS_BACK, ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.48, shift(-0.006, -0.045, 0.04), bend(14, 6, 2, -2), ARMS_BACK, ANGRY),
    key(0.64, shift(0, -0.03, 0.012), bend(8, 2, 0, 0), GUARD, ANGRY),
    key(1.0, OPEN_EYES),
  ],
  // The head trails the spine a little (overlap), so the beak lands just after the key.
  events: [{ t: 0.38, name: 'impact' }],
};

/** Weak ranged move (Ember): a quick breath, then the head snaps forward and spits fire. */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Draw breath: chest up, head tipped back, elbows back.
    key(0.24, pelvis(0, 0.012), bend(-8, -8, -8, -14), ELBOWS_BACK, FISTS, ANGRY, flames(0.5)),
    // Spit: the head drives forward at the foe, beak wide; the body leans in.
    snap(0.34, pelvis(0, -0.016, 0.03), bend(15, 9, -4, -8), CHAMBER, FISTS, jaw(34), ANGRY, flames(0.9)),
    // Recoil: the head bobs back up as the beak closes.
    key(0.5, pelvis(0, -0.01, 0.015), bend(9, 4, -3, -11), CHAMBER, FISTS, jaw(18), ANGRY, flames(0.7)),
    key(0.7, pelvis(0, -0.004), bend(3, 1, 0, -2), CHAMBER, FISTS, jaw(3), ANGRY, flames(0.3)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/** Strong ranged move (Flamethrower, Overheat): a deep breath, then a sustained stream from the beak. */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    // Settle before drawing breath.
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6), FISTS),
    // Deep breath: rise, chest out, beak to the sky, elbows back; embers gather at the beak.
    key(0.52, pelvis(0, 0.018), bend(-12, -10, -10, -16), ELBOWS_BACK, FISTS, SHUT, flames(0.6)),
    // Hold at the top, still swelling.
    key(0.66, pelvis(0, 0.022), bend(-13, -11, -11, -18, 0, 2), ELBOWS_BACK, FISTS, SHUT, flames(0.8)),
    // Blast: the head drives forward and down at the foe, beak wide; the body braces low.
    snap(0.78, pelvis(0, -0.038, 0.032), bend(14, 9, -4, -8), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    // Sustain: pushing into the stream, the head sweeping a little.
    key(1.0, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 5), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.22, pelvis(0, -0.037, 0.03), bend(13, 9, -4, -8, -4, -2), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    key(1.44, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 3, 1), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.62, pelvis(0, -0.035, 0.027), bend(12, 8, -4, -7), BRACED, FISTS, jaw(33), ANGRY, flames(0.9)),
    // Beak shuts, the head comes up and shakes off the heat.
    key(1.8, pelvis(0, -0.015), bend(4, 2, 0, -6, 7), CHAMBER, FISTS, jaw(4), ANGRY, flames(0.5)),
    key(1.94, pelvis(0, -0.008), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY, flames(0.3)),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/** Self-targeting status move (Bulk Up, Focus Energy): gather, then flex hard with a flame aura. */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.7,
  keys: [
    key(0),
    // Gather: curl in, arms crossed, eyes shut.
    key(0.3, pelvis(0, -0.05), bend(22, 6, 4, 16), CROSSED, FISTS, SHUT),
    key(0.42, pelvis(0, -0.056), bend(24, 7, 4, 18, 0, 1), CROSSED, FISTS, SHUT),
    // Flex: chest out, arms up, straining (moving hold with a tremor).
    snap(0.56, pelvis(0, -0.02), bend(-10, -8, -4, -12), FLEX, FISTS, ANGRY, flames(1)),
    key(0.68, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.8, pelvis(0, -0.02), bend(-10, -9, -4, -12, 0, -1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.92, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(1.04, pelvis(0, -0.021), bend(-10, -9, -4, -12, 0, -1), FLEX, FISTS, ANGRY, flames(1)),
    // Relax: exhale, arms drop.
    key(1.28, pelvis(0, -0.02), bend(6, 2, 0, -2), CHAMBER, ANGRY, flames(0.4)),
    key(1.7, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/** Status move aimed at the foe (Growl, Leer, Screech): rear up, then lunge the head forward and roar. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.01), bend(-8, -6, -6, -12), ELBOWS_BACK, FISTS, ANGRY),
    snap(0.3, pelvis(0, -0.02, 0.025), bend(14, 8, 2, -6), ELBOWS_BACK, FISTS, jaw(32), ANGRY),
    key(0.5, pelvis(0, -0.02, 0.025), bend(14, 8, 2, -6, 7, 3), ELBOWS_BACK, FISTS, jaw(34), ANGRY),
    key(0.7, pelvis(0, -0.02, 0.022), bend(13, 8, 2, -6, -7, -3), ELBOWS_BACK, FISTS, jaw(32), ANGRY),
    key(0.88, pelvis(0, -0.01, 0.01), bend(6, 2, 0, -3), CHAMBER, jaw(8), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Sand-Attack: scoop the ground with the right foot and kick the sand at the foe. */
const statusTargetKick: Clip = {
  name: 'status_target_kick',
  duration: 1.35,
  keys: [
    key(0),
    // Weight onto the back leg, the front foot draws back along the ground.
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.04, -0.01), { bones: { spine: { x: 22, y: -8 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.92, -0.25] }, shinR: { dir: [-0.15, -0.8, -0.58] } } }),
    // Kick: the foot sweeps forward and up, flinging sand.
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.03, 0.01), { bones: { spine: { x: 6, y: 6 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.3, 0.93] }, shinR: { dir: [-0.12, -0.05, 0.99] } } }),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.03, 0.008), { bones: { spine: { x: 8, y: 4 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.25, -0.45, 0.86] }, shinR: { dir: [-0.12, -0.55, 0.83] } } }),
    key(0.7, pelvis(0, -0.04), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/** Both arms reaching out at chest height (grabbing). */
const REACH: Pose = {
  aim: {
    armR: { dir: [-0.18, -0.1, 0.98] },
    forearmR: { dir: [0.12, 0.02, 0.99] },
    armL: { dir: [0.18, -0.1, 0.98] },
    forearmL: { dir: [-0.12, 0.02, 0.99] },
  },
};

/** Arms locked around what it holds, at chest height in front. */
const GRIP: Pose = {
  aim: {
    armR: { dir: [-0.28, -0.25, 0.93] },
    forearmR: { dir: [0.4, 0, 0.92] },
    armL: { dir: [0.28, -0.25, 0.93] },
    forearmL: { dir: [-0.4, 0, 0.92] },
  },
};

/** ... pulled in tight against the chest as it loads. */
const GRIP_TIGHT: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.42, 0.86] },
    forearmR: { dir: [0.5, 0.05, 0.86] },
    armL: { dir: [0.3, -0.42, 0.86] },
    forearmL: { dir: [-0.5, 0.05, 0.86] },
  },
};

/** Holding it up in front, arms raised to the chin (higher would carry the foe off the screen). */
const HEAVE: Pose = {
  aim: {
    armR: { dir: [-0.22, 0.32, 0.92] },
    forearmR: { dir: [0.2, 0.55, 0.81] },
    armL: { dir: [0.22, 0.32, 0.92] },
    forearmL: { dir: [-0.2, 0.55, 0.81] },
  },
};

/** Driving it down into the ground in front. */
const SLAM_DOWN: Pose = {
  aim: {
    armR: { dir: [-0.15, -0.5, 0.85] },
    forearmR: { dir: [0.12, -0.78, 0.62] },
    armL: { dir: [0.15, -0.5, 0.85] },
    forearmL: { dir: [-0.12, -0.78, 0.62] },
  },
};

/**
 * Seismic Toss (toss): an in-place heave. It reaches for the foe with the
 * hips driving forward, the hands close on it (grab: in the playtest the foe
 * rides in the grip from here, src/battle3d/director.ts), sinks with the
 * load, then drives up out of its legs and heaves it up high in front, the
 * head thrown back; from the top the whole body whips forward and down to
 * hurl it into the ground at its place (throw), and it watches it crash
 * (impact) from deep in the follow-through. The chest keeps its tilt from the
 * grip to the throw: the foe rides in the grip turned with the chest, and
 * from where it stands every degree the chest tilted swung the foe round it
 * (it flew off the top of the screen). Hands trail the hips by ~0.07 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.15,
  keys: [
    key(0),
    // Wind up: crouch, elbows back.
    key(0.14, shift(0.006, -0.05, -0.02), bend(18, 4, 0, -10), ELBOWS_BACK, ANGRY),
    // Reach: the hips drive at the foe, both arms reaching out for it.
    key(0.3, shift(-0.004, -0.05, 0.05), bend(14, 2, 0, -12), REACH, ANGRY),
    // Grip: the hands close on it and lock on, the back straightening as the weight sinks back with it.
    key(0.46, shift(0.002, -0.07, 0.03), bend(6, 0, 0, -12), GRIP, FISTS, ANGRY),
    key(0.64, shift(0.004, -0.1, 0), bend(4, 0, 0, -14), GRIP_TIGHT, FISTS, ANGRY, flames(0.6)),
    // Hoist: the legs drive up and the arms heave it up high in front, the head thrown back.
    key(0.82, shift(0, -0.036, -0.02), bend(4, 0, -6, -18), HEAVE, FISTS, ANGRY, flames(1)),
    key(0.96, shift(0, -0.028, -0.026), bend(4, 0, -9, -22), HEAVE, FISTS, ANGRY, flames(1)),
    key(1.06, shift(0, -0.03, -0.028), bend(4, 0, -10, -23), HEAVE, FISTS, ANGRY, flames(1)),
    // The hurl: the whole body whips forward and down, arms driving it down at its place.
    snap(1.16, shift(-0.01, -0.055, 0.055), bend(34, 16, 4, 4), SLAM_DOWN, ANGRY, flames(1)),
    // Deep in the follow-through, arms still down; it watches it crash.
    key(1.3, shift(-0.01, -0.075, 0.055), bend(32, 14, 2, 2), SLAM_DOWN, ANGRY, flames(0.9)),
    key(1.52, shift(0, -0.06, 0.035), bend(22, 8, 2, -2), SLAM_DOWN, ANGRY, flames(0.7)),
    // Straighten into its guard.
    key(1.72, shift(0, -0.03, 0.01), bend(10, 2, 0, 0), GUARD, ANGRY, flames(0.5)),
    key(2.15, flames(0), OPEN_EYES),
  ],
  // The throw lets go as the whip starts (the hands trail the hips); it lands on the impact.
  events: [{ t: 0.52, name: 'grab' }, { t: 1.11, name: 'throw' }, { t: 1.38, name: 'impact' }],
};

/** Claws driven down into the ground in front (digging). */
const DIG_ARMS: Pose = {
  aim: {
    armR: { dir: [-0.22, -0.84, 0.5] },
    forearmR: { dir: [0.05, -0.95, 0.3] },
    armL: { dir: [0.22, -0.84, 0.5] },
    forearmL: { dir: [-0.05, -0.95, 0.3] },
  },
};
/** Digging: the right claw rakes the dirt back under it while the left digs in, and the other way round. */
const SCOOP_R: Pose = {
  aim: { armR: { dir: [-0.32, -0.92, -0.2] }, forearmR: { dir: [-0.1, -0.8, -0.6] }, armL: { dir: [0.22, -0.8, 0.56] }, forearmL: { dir: [-0.05, -0.92, 0.38] } },
};
const SCOOP_L: Pose = {
  aim: { armR: { dir: [-0.22, -0.8, 0.56] }, forearmR: { dir: [0.05, -0.92, 0.38] }, armL: { dir: [0.32, -0.92, -0.2] }, forearmL: { dir: [0.1, -0.8, -0.6] } },
};

/** A rising knee from where it stands: the right knee driven up, both fists driving up with it (the left leg planted by shift()). */
const RISING_KNEE: Pose = {
  plantRight: 0,
  aim: {
    thighR: { dir: [-0.15, 0.35, 0.92] }, shinR: { dir: [-0.1, -0.88, 0.45] },
    armR: { dir: [-0.35, 0.1, 0.93] }, forearmR: { dir: [-0.12, 0.75, 0.65] }, armL: { dir: [0.35, 0.1, 0.93] }, forearmL: { dir: [0.12, 0.75, 0.65] },
  },
};

/**
 * Dig (burrow): a crouch-and-dig where it stands. It crouches with its eyes
 * on the ground and drives its claws in (dig: the dirt bursts up at its
 * feet), rakes the ground back under itself claw over claw, gathers into a
 * low coil and bursts up out of it with a rising knee (impact), coming down
 * into a crouch. (The game sinks the sprite into the ground and raises it
 * under the foe; the body follows.)
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 1.9,
  keys: [
    key(0),
    // Crouch, eyes on the ground.
    key(0.12, shift(0, -0.06, 0), bend(28, 6, 0, 18), CHAMBER, FISTS, ANGRY),
    // Claws into the ground: the dirt flies.
    key(0.22, shift(0, -0.09, 0.015), bend(42, 8, 2, 24), DIG_ARMS, ANGRY),
    // Digging, claw over claw, deep in the crouch.
    key(0.36, shift(0.008, -0.095, 0.01), bend(44, 8, 2, 24), SCOOP_R, ANGRY),
    key(0.5, shift(-0.008, -0.095, 0.01), bend(44, 8, 2, 25), SCOOP_L, ANGRY),
    key(0.64, shift(0.008, -0.095, 0.01), bend(44, 8, 2, 24), SCOOP_R, ANGRY),
    // Gathered low, fists chambered...
    key(0.8, shift(0, -0.1, 0), bend(26, 6, 0, -10), CHAMBER, FISTS, ANGRY, flames(0.5)),
    // ...and it bursts up out of the crouch, knee first, fists driving up.
    snap(0.92, shift(-0.005, 0.015, 0.03, 0, 'L'), bend(-8, -6, -4, -16), RISING_KNEE, ANGRY, flames(1)),
    key(1.06, shift(-0.005, 0.018, 0.03, 0, 'L'), bend(-10, -6, -4, -18), RISING_KNEE, ANGRY, flames(1)),
    // The foot comes down into a crouch.
    fall(1.22, shift(0, -0.06, 0.01), bend(20, 4, 0, -6), GUARD, ANGRY, flames(0.7)),
    key(1.42, shift(0, -0.035, 0), bend(12, 2, 0, -2), GUARD, ANGRY, flames(0.5)),
    key(1.9, flames(0), OPEN_EYES),
  ],
  // The claws trail the hips (overlap): they hit the ground just after their key.
  events: [{ t: 0.28, name: 'dig' }, { t: 0.93, name: 'impact' }],
};

/**
 * Mud-Slap (fling): weight back, the right foot scoops the ground and flicks
 * a clod of mud at the foe (release from the foot: legs have no overlap).
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.15,
  keys: [
    key(0),
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.045, -0.012), { bones: { spine: { x: 24, y: -10 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.9, -0.3] }, shinR: { dir: [-0.15, -0.78, -0.61] } } }),
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.03, 0.012), { bones: { spine: { x: 4, y: 8 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.25, 0.94] }, shinR: { dir: [-0.12, 0.02, 0.99] } } }),
    key(0.44, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.03, 0.01), { bones: { spine: { x: 2, y: 9 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.28, 0.93] }, shinR: { dir: [-0.12, -0.12, 0.98] } } }),
    key(0.64, pelvis(0, -0.04), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }],
};

/** The head held level against the torso's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * Double Team, Agility (afterimage): feints faster than the eye, from the
 * waist, the feet planted: the upper body slips to one side, dips under and
 * slips out to the other (a boxer's bob and weave), the knees dipping under
 * each slip and the head held level, guard up. The game moves the sprite
 * (Agility's sweep, Double Team's copies); the afterimages start at the aura
 * and run 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.6,
  keys: [
    key(0),
    key(0.1, shift(0, -0.05, 0), bend(14, 2, 0, -4), GUARD, ANGRY),
    // Slip to its right...
    key(0.22, shift(-0.04, -0.045, 0), { bones: { spine: { x: 10, y: -14, z: 22 } } }, level(-16), GUARD, ANGRY),
    // ...dip under...
    key(0.33, shift(0, -0.085, 0.005), { bones: { spine: { x: 26 } } }, GUARD, ANGRY),
    // ...and out to its left; again, and again.
    key(0.44, shift(0.04, -0.045, 0), { bones: { spine: { x: 10, y: 14, z: -22 } } }, level(16), GUARD, ANGRY),
    key(0.55, shift(0, -0.085, 0.005), { bones: { spine: { x: 26 } } }, GUARD, ANGRY),
    key(0.66, shift(-0.04, -0.045, 0), { bones: { spine: { x: 10, y: -14, z: 22 } } }, level(-16), GUARD, ANGRY),
    key(0.77, shift(0, -0.085, 0.005), { bones: { spine: { x: 26 } } }, GUARD, ANGRY),
    key(0.88, shift(0.036, -0.045, 0), { bones: { spine: { x: 10, y: 12, z: -19 } } }, level(14), GUARD, ANGRY),
    key(1.0, shift(0, -0.07, 0.004), { bones: { spine: { x: 19 } } }, GUARD, ANGRY),
    key(1.14, shift(-0.014, -0.045, 0), { bones: { spine: { x: 8, y: -5, z: 8 } } }, level(-5), GUARD, ANGRY),
    key(1.3, shift(0, -0.035, 0), { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/** Taking a hit: snap back and wince (the battler adds a sprung recoil), then shake it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, bend(-14, -6, -4, -18), HURT,
      { aim: { armR: { dir: [-0.75, -0.3, 0.58] }, forearmR: { dir: [-0.3, 0.2, 0.93] }, armL: { dir: [0.75, -0.45, -0.48] }, forearmL: { dir: [0.4, 0.1, 0.9] } } }),
    key(0.2, bend(-6, -2, -2, -8), HURT),
    key(0.36, bend(4, 1, 0, 4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway, then
 * it curls over onto its heels hugging itself, head tucked and eyes shut, and
 * from the 'shrink' the curled body shrinks away (Battler3D). It sits back as
 * it curls: bowed forward over its feet, the foe's head came down onto our
 * healthbox (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, { root: { z: -0.02 } }, bend(-8, -4, -2, -12), DROWSY),
    key(0.48, pelvis(0, -0.08), { root: { z: -0.04 } }, bend(14, 5, 4, 20), CROSSED, SHUT),
    key(0.82, pelvis(0, -0.22), { root: { z: -0.1 } }, bend(28, 12, 8, 30), CROSSED, SHUT),
    key(0.96, pelvis(0, -0.235), { root: { z: -0.1 } }, bend(30, 13, 8, 32), CROSSED, SHUT),
    key(1.6, pelvis(0, -0.228), { root: { z: -0.1 } }, bend(29, 12, 8, 31), CROSSED, SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const BLAZIKEN_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, physicalWeak, physicalWeakKick, physicalStrong, punch, tackle, peck, toss, burrow, fling, afterimage, specialWeak, specialStrong, statusSelf, statusTarget, statusTargetKick, hit, faint].map((c) => [c.name, c]),
);

/** Eye atlas (pm0257_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const BLAZIKEN_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  closed2: [1, 2],
  hurt: [0, 3],
};
