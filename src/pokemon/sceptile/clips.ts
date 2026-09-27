// Sceptile's battle animation set: one clip per attack category (+ idle, intro,
// hit, faint) and the motif clips its moves need. Keys are STANCE +
// deltas (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   pelvis   model-unit offset of the hips and spine (crouches, weight
//            shifts: shift() moves it with the feet kept planted)
//   root     a small offset of the whole body (a recoil, a faint sitting
//            back); never travel or leaps
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is
//                   free). The IK pins a planted foot's height and keeps its
//                   posed x/z, so a pelvis shift alone slides planted feet
//   expression      eye atlas cell (open, angry, focus, half, happy, closed, hurt)
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a toss carries
// the foe between them), dig (a burrow goes under).
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is a few
// pixels above our Sceptile's crest and ours is to its right; a wild
// Sceptile's toe claws rest on the top edge of ours, so its feet never slide
// toward the camera and nothing reaches the ground in front of them.
//
// Every clip acts in place: the compiled game moves the sprite (its lunges,
// hops and slides) and the body follows it. A strike reaches from home: the
// weight sinks back, then the hips drive at the foe with the feet planted,
// the spine leans in and the blade, fist or tail reaches it on the impact.
//
// Sceptile is light and fast: timings run ~0.85x Blaziken's, strikes snap in
// 5-6 frames and it is back in guard quickly. Its weapons are the leaf blades
// on its forearms (a slashing arm leads with the forearm), its mouth (Bullet
// Seed, Solar Beam, Screech) and its heavy fern tail (Slam), which is keyed
// explicitly when it acts and otherwise follows on springs. The animator adds
// overlapping action (head, arms, hands, blades and the tail chain trail the
// body; events that depend on them sit a few frames after their key),
// breathing, blinks and the springs (see index.ts).
//
// Motif clips keep a category prefix (physical_weak_tackle...); index.ts maps
// motifs to clips. The later ones (toss, burrow, fling, afterimage, flash) are
// named after their motifs, which the director finds by name. The stance
// faces the foe, as the battler always does: no clip turns to look at it.

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
const FOCUS: Pose = { expression: 'focus' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HAPPY: Pose = { expression: 'happy' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
/** Spine chain pitch (x) from hips to head (the neck bends over both neck bones), with head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck * 0.6 }, neck2: { x: neck * 0.4 }, head: { x: head, y: headY, z: headZ } },
});
/** Torso twist (+ turns the chest to its left, bringing the right shoulder forward) and lean (+z: to its right). */
const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y: y * 0.6, z }, chest: { y: y * 0.4 } } });
/** The tail chain: lift (+ raises it) and sweep (+ swings it toward its right), spread along the chain. */
const tail = (lift: number, sweep = 0): Pose => ({
  bones: {
    tail: { x: lift * 0.3, y: sweep * 0.25 },
    tail2: { x: lift * 0.15, y: sweep * 0.15 },
    tail3: { x: lift * 0.15, y: sweep * 0.15 },
    tail4: { x: lift * 0.14, y: sweep * 0.15 },
    tail5: { x: lift * 0.1, y: sweep * 0.12 },
    tail6: { x: lift * 0.08, y: sweep * 0.1 },
    tail7: { x: lift * 0.08, y: sweep * 0.08 },
  },
});

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
type Arm = [arm: Vec3, forearm: Vec3, hand: Vec3];
/** Both arms: [arm, forearm, hand] directions for the right arm and the left arm. */
const arms = (r: Arm, l: Arm, twistR = 0, twistL = 0): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1], twist: twistR }, handR: { dir: r[2] },
    armL: { dir: l[0] }, forearmL: { dir: l[1], twist: twistL }, handL: { dir: l[2] },
  },
});
/** The same pose on both arms (given for the right arm, mirrored to the left). */
const both = (r: Arm, twistR = 0): Pose => arms(r, [mirror(r[0]), mirror(r[1]), mirror(r[2])], twistR, -twistR);

/** Guard: both forearms up in front of the chest, blades out. */
const GUARD = both([[-0.45, -0.45, 0.77], [0.25, 0.65, 0.72], [0.2, 0.9, 0.4]]);
/** Forearms crossed in front of the face, blades out to the sides (an X). */
const CROSSED = arms([[-0.35, -0.3, 0.88], [0.7, 0.45, 0.55], [0.6, 0.7, 0.4]], [[0.35, -0.3, 0.88], [-0.7, 0.5, 0.5], [-0.6, 0.75, 0.3]]);
/** Forearms crossed low in front of the chest (gathering, wind-ups). */
const CROSSED_LOW = arms([[-0.3, -0.6, 0.74], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]], [[0.3, -0.6, 0.74], [-0.75, 0.1, 0.65], [-0.7, 0.25, 0.67]]);
/** Arms flung out wide and up, claws open. */
const SPREAD = both([[-0.85, 0.35, 0.3], [-0.5, 0.85, 0.2], [-0.3, 0.95, 0.1]]);
/** Braced for a blast: arms low and back at the sides. */
const BRACED = both([[-0.45, -0.8, -0.35], [-0.25, -0.5, 0.83], [-0.2, -0.3, 0.93]]);
/** Drawing breath / rearing: elbows pulled back, chest open. */
const ELBOWS_BACK = both([[-0.55, -0.42, -0.72], [-0.22, 0.08, 0.97], [-0.1, 0.1, 0.99]]);
/** Claws raised beside the head, splayed (Screech's nails-on-slate). */
const CLAWS_UP = both([[-0.6, 0.3, 0.74], [-0.25, 0.9, 0.36], [-0.1, 0.98, 0.15]]);
/** Claws thrust at the foe, splayed. */
const CLAWS_OUT = both([[-0.5, 0.05, 0.86], [-0.3, 0.3, 0.9], [-0.2, 0.45, 0.87]]);
/** Both claws reaching wide at the foe, open (reads in both views). */
const REACH = both([[-0.55, 0.05, 0.83], [-0.35, 0.15, 0.92], [-0.3, 0.25, 0.92]]);
/** Arms open to the sky, palms up (basking). */
const PALMS_UP = both([[-0.8, 0.1, 0.55], [-0.6, 0.6, 0.5], [-0.4, 0.85, 0.35]]);
/** Flinching: the arms thrown out. */
const FLINCH = arms([[-0.75, -0.2, 0.6], [-0.35, 0.35, 0.87], [-0.2, 0.6, 0.77]], [[0.7, -0.35, 0.6], [0.35, 0.2, 0.9], [0.2, 0.3, 0.93]]);
/** Both blades raised high behind the head (the X-slash wind-up). */
const BLADES_HIGH = both([[-0.4, 0.75, -0.5], [0.15, 0.95, -0.2], [0.2, 0.9, -0.35]]);
/** Both blades slashed down and across: the forearms cross low in front. */
const BLADES_CROSSED = both([[0.3, -0.5, 0.8], [0.7, -0.55, 0.45], [0.75, -0.55, 0.35]]);
/** Right blade raised high behind the head like a sword, left forearm guarding. */
const BLADE_COCKED: Pose = arms([[-0.55, 0.65, -0.52], [-0.15, 0.96, -0.23], [-0.05, 0.9, -0.43]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]]);

/** Claws curled shut. */
const FISTS: Pose = {
  bones: {
    fingerA1R: { z: 34 }, fingerB1R: { z: 34 }, fingerC1R: { z: 34 },
    fingerA2R: { z: 30 }, fingerB2R: { z: 30 }, fingerC2R: { z: 30 },
    fingerA1L: { z: -34 }, fingerB1L: { z: -34 }, fingerC1L: { z: -34 },
    fingerA2L: { z: -30 }, fingerB2L: { z: -30 }, fingerC2L: { z: -30 },
  },
};
/** Claws spread wide. */
const SPLAYED: Pose = {
  bones: {
    fingerA1R: { z: -14 }, fingerB1R: { y: 12 }, fingerC1R: { y: -12 },
    fingerA1L: { z: 14 }, fingerB1L: { y: -12 }, fingerC1L: { y: 12 },
  },
};

// Planted feet ----------------------------------------------------------------
//
// The foot IK pins a planted foot's height but keeps its posed x/z, so
// moving the pelvis would slide the feet with it (a wild Sceptile's toes rest
// on the top edge of our healthbox: forward is under it). shift() re-aims the
// legs instead (two bones, the knee bending in the stance's plane), so each
// foot stays where the stance puts it while the hips sink back, drive at the
// foe or turn. The stance's legs, in heights from the body's origin along
// the model's axes (measured in the clip review, window.__clip.joints()):
// the hips' pivot, and each leg's hip, knee and ankle.

const HIPS_PIVOT: Vec3 = [0, 0.394, 0.266];
const LEGS: Record<'L' | 'R', { hip: Vec3; knee: Vec3; foot: Vec3 }> = {
  L: { hip: [0.105, 0.316, 0.245], knee: [0.22, 0.166, 0.271], foot: [0.186, 0.089, 0.119] },
  R: { hip: [-0.107, 0.316, 0.268], knee: [-0.213, 0.195, 0.37], foot: [-0.174, 0.087, 0.239] },
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

/** Thigh and shin directions from `hip` to the leg's planted foot (or to `foot`). */
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

/** Where a leg's hip is with the pelvis moved (x, y, z) and the hips turned `yaw`°. */
const hipAt = (leg: 'L' | 'R', x: number, y: number, z: number, yaw: number): Vec3 => {
  const r = yawed(sub(LEGS[leg].hip, HIPS_PIVOT), yaw);
  return [HIPS_PIVOT[0] + r[0] + x, HIPS_PIVOT[1] + r[1] + y, HIPS_PIVOT[2] + r[2] + z];
};

/**
 * The weight shifted with the feet planted: the pelvis moved (x, y, z)
 * heights from the stance's (+x its left, +z at the foe) and the hips turned
 * `yaw`° (+ toward its left: the tail swings round to its right), each leg in
 * `legs` re-aimed so its foot stays where it stands. A leg left out is free.
 */
function shift(x: number, y: number, z: number, yaw = 0, legs = 'LR'): Pose {
  const pose: Pose = { pelvis: { x, y, z }, aim: {} };
  if (yaw) pose.bones = { hips: { y: yaw } };
  for (const leg of ['L', 'R'] as const) {
    if (!legs.includes(leg)) continue;
    const { thigh, shin } = legTo(leg, hipAt(leg, x, y, z, yaw));
    pose.aim![`thigh${leg}`] = { dir: thigh };
    pose.aim![`shin${leg}`] = { dir: shin };
  }
  return pose;
}

/**
 * A foot lifted `h` heights straight up off its spot (the pelvis and hips as
 * in shift()), its plant released: a foot leaves and meets the ground here,
 * so it never drags along it.
 */
function footUp(leg: 'L' | 'R', h: number, x: number, y: number, z: number, yaw = 0): Pose {
  const foot = LEGS[leg].foot;
  const { thigh, shin } = legTo(leg, hipAt(leg, x, y, z, yaw), [foot[0], foot[1] + h, foot[2]]);
  return { [leg === 'L' ? 'plantLeft' : 'plantRight']: 0, aim: { [`thigh${leg}`]: { dir: thigh }, [`shin${leg}`]: { dir: shin } } };
}

/** A pose's aims turned `yaw`° about the vertical: arms that turn with the torso. */
function turned(pose: Pose, yaw: number): Pose {
  return { ...pose, aim: Object.fromEntries(Object.entries(pose.aim ?? {}).map(([b, a]) => [b, { ...a, dir: yawed(a.dir, yaw) }])) };
}
/** The head held level against the torso's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/** Landing: knees absorb the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -6 } } };

// Clips -----------------------------------------------------------------------

/** Breathing in its crouch; the tail sways a little (the springs carry the frond). */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }, tail(2, 6)),
    key(2.4),
  ],
};

/** Sent out: crouched behind its crossed blades, it springs up with the arms flung wide and a cry, tail raised. */
const intro: Clip = {
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, pelvis(0, -0.06), bend(18, 6, 4, 16), CROSSED, SHUT, tail(-8)),
    key(0.18, pelvis(0, -0.08), bend(22, 8, 6, 20), CROSSED, SHUT, tail(-12)),
    snap(0.38, pelvis(0, 0.015), bend(-12, -8, -8, -24), SPREAD, SPLAYED, jaw(32), ANGRY, tail(35)),
    key(0.58, pelvis(0, 0.012), bend(-11, -8, -8, -22, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(32)),
    key(0.78, pelvis(0, 0.014), bend(-12, -8, -8, -23, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(30)),
    key(0.96, pelvis(0, 0.008), bend(-8, -5, -4, -14), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.012), bend(6, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
};

/** The right blade drawn further back behind the head as the weight sinks (the cut starts from a turnaround). */
const BLADE_DRAWN: Pose = arms([[-0.5, 0.68, -0.54], [-0.1, 0.97, -0.24], [0, 0.88, -0.47]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]]);
/** The cut: the forearm sweeping down and across in front at the foe, blade leading; the left arm pulled back. */
const BLADE_CUT: Pose = arms([[0.45, -0.45, 0.77], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]]);
/** ... carried on down past the left hip. */
const BLADE_THROUGH: Pose = arms([[0.6, -0.65, 0.45], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]]);

/**
 * Leaf Blade (weak contact: Pound, Fury Cutter, False Swipe, Aerial Ace...):
 * the weight sinks back with the right blade cocked high behind the head
 * like a sword, then the hips drive at the foe and the torso unwinds into a
 * cut down and across led by the forearm; the blade carries through past the
 * left hip and hangs, and it is back in guard.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.0,
  keys: [
    key(0),
    // Wind up: the weight sinks back, right shoulder back, the blade raised high behind the head.
    key(0.14, shift(0.008, -0.04, -0.02), twist(-26), bend(8, 0, 0, -6, 14), BLADE_COCKED, FOCUS, tail(8, -12)),
    key(0.22, shift(0.012, -0.05, -0.026), twist(-30), bend(6, 0, 0, -6, 16), BLADE_DRAWN, ANGRY, tail(14, -14)),
    // The cut: the hips drive at the foe, the torso unwinds, the forearm sweeps down and across, blade leading.
    snap(0.32, shift(-0.012, -0.045, 0.05), twist(26, -6), bend(20, 4, 0, -6, -8), BLADE_CUT, ANGRY, tail(4, 22)),
    // Follow-through: the blade carries on down past its left hip and hangs there.
    key(0.48, shift(-0.014, -0.05, 0.055), twist(32, -7), bend(22, 4, 0, -6, -10), BLADE_THROUGH, ANGRY, tail(2, 28)),
    key(0.58, shift(-0.012, -0.048, 0.052), twist(31, -6), bend(21, 4, 0, -6, -9), BLADE_THROUGH, ANGRY, tail(3, 26)),
    // Back into the guard.
    key(0.76, shift(0, -0.03, 0.01), twist(8), bend(10, 2, 0, -2), GUARD, ANGRY, tail(4, 8)),
    key(1.0, OPEN_EYES),
  ],
  // The forearm trails the hips (overlap): the blade is at full reach just after the snap.
  events: [{ t: 0.38, name: 'impact' }],
};

/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail, and Mega Kick by
 * fallback): a crouch wound the other way, guard up, the tail lifting, then
 * the hips turn to its right over the planted feet and the heavy tail rears
 * up high round its left side; the body bows at the foe and the tail comes
 * down in an arc across in front of it, stopping hip high; the hips turn
 * back and the tail swings round behind. (Round its right side, or down to
 * the ground, the tail went under our healthbox from one side or the other.)
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.7,
  keys: [
    key(0),
    // Coil: a crouch wound the other way, guard up, the tail lifting behind
    // (claws braced low in front, or the hips turned further, a wild
    // Sceptile's claws or left toes went under our healthbox).
    key(0.22, shift(0, -0.06, -0.01, 10), twist(16), bend(15, 5, 4, 8, -8), turned(GUARD, 8), FOCUS, tail(28, 12)),
    // The hips turn to its right over the planted feet (a breakdown: the legs
    // solved halfway round keep the feet on their spots), the arms coming
    // round with the turn, and the tail rears up high round its left side.
    key(0.32, shift(0, -0.055, -0.005, -14), twist(0), bend(8, 3, 2, 1, 2), turned(GUARD, -6), ANGRY, tail(64, 2)),
    key(0.42, shift(0, -0.05, 0, -35), twist(-16), bend(0, 0, 0, -6, 12), turned(SPREAD, -14), ANGRY, tail(100, -8)),
    key(0.52, shift(0, -0.045, 0, -40), twist(-20), bend(-4, -2, 0, -8, 14), turned(SPREAD, -18), ANGRY, tail(108, -12)),
    // Slam: the body bows at the foe and the tail comes down across in front of it, hip high.
    snap(0.62, shift(-0.01, -0.058, 0.02, -50), twist(-30), bend(20, 6, 2, 4, 22), turned(BRACED, -26), ANGRY, tail(80, -30)),
    key(0.74, shift(-0.012, -0.062, 0.022, -52), twist(-32), bend(22, 6, 2, 6, 24), turned(BRACED, -28), ANGRY, tail(76, -32)),
    // It turns back to face the foe, the tail swinging round behind it.
    key(0.98, shift(0, -0.045, 0, -24), twist(-12), bend(10, 4, 2, 2, 8), turned(GUARD, -10), ANGRY, tail(12, -30)),
    key(1.2, shift(0, -0.03, 0), bend(6, 2, 0, 0), GUARD, ANGRY, tail(4)),
    key(1.7, OPEN_EYES),
  ],
  // The tail trails the hips (overlap along its chain): its tip comes down after the snap.
  events: [{ t: 0.72, name: 'impact' }],
};

/**
 * Bullet Seed (weak ranged from the mouth; Snore by fallback): a quick
 * breath, then three pecks of the head, a seed each.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.25,
  keys: [
    key(0),
    // Breath in: chest up, head back, elbows back.
    key(0.2, pelvis(0, 0.012), bend(-8, -8, -8, -18), ELBOWS_BACK, ANGRY, tail(10)),
    // Three pecks: the head drives forward, jaw wide, and bobs back, each a little further in.
    snap(0.28, pelvis(0, -0.012, 0.004), bend(13, 7, 0, -4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.37, pelvis(0, -0.008, 0.002), bend(7, 4, -2, -10), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.45, pelvis(0, -0.014, 0.004), bend(14, 7, 0, -4, 4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.54, pelvis(0, -0.009, 0.002), bend(8, 4, -2, -10, 3), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.62, pelvis(0, -0.016, 0.004), bend(16, 8, 0, -4, -4), BRACED, jaw(34), ANGRY, tail(2)),
    // Recoil: the head bobs back up as the jaw closes.
    key(0.78, pelvis(0, -0.004, 0.001), bend(3, 1, -2, -14), BRACED, jaw(6), ANGRY, tail(7)),
    key(0.96, pelvis(0, -0.003), bend(2, 1, 0, -2), jaw(0), ANGRY, tail(2)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }, { t: 0.51, name: 'release' }, { t: 0.68, name: 'release' }],
};

/**
 * Solar Beam (strong ranged; Hyper Beam, Hidden Power): it turns its face up
 * to the sun with the arms spread, soaking up light, then braces low and
 * fires the beam from its mouth, holding against the recoil.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6)),
    // Soak up light: rise, face to the sky, arms open, eyes shut.
    key(0.5, pelvis(0, 0.018), bend(-12, -10, -12, -30), SPREAD, SPLAYED, SHUT, tail(25)),
    key(0.66, pelvis(0, 0.022), bend(-13, -11, -13, -32, 0, 2), SPREAD, SPLAYED, SHUT, tail(28)),
    key(0.8, pelvis(0, 0.02), bend(-13, -11, -13, -31, 0, -2), SPREAD, SPLAYED, SHUT, tail(27)),
    // Fire: the head drives forward at the foe, jaw wide; the body braces low.
    snap(0.92, pelvis(0, -0.04, 0.005), bend(16, 10, -2, -8), BRACED, jaw(36), ANGRY, tail(-5)),
    // Sustain: pushed back by the beam, trembling.
    key(1.12, pelvis(0, -0.035, 0.004), root({ z: -0.015 }), bend(14, 8, -2, -6, 3), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.32, pelvis(0, -0.038, 0.004), root({ z: -0.02 }), bend(15, 9, -2, -8, -3, -2), BRACED, jaw(36), ANGRY, tail(-5)),
    key(1.52, pelvis(0, -0.035, 0.004), root({ z: -0.022 }), bend(14, 8, -2, -6, 2, 1), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.7, pelvis(0, -0.036, 0.004), root({ z: -0.02 }), bend(14, 8, -2, -7), BRACED, jaw(33), ANGRY, tail(-4)),
    // The jaw shuts, the head comes up and shakes it off.
    key(1.88, pelvis(0, -0.015), root({ z: -0.01 }), bend(4, 2, 0, -6, 5), GUARD, jaw(4), ANGRY, tail(4)),
    key(2.02, pelvis(0, -0.008), bend(2, 1, 0, -3, -4), ANGRY, tail(2)),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.76, name: 'releaseEnd' }],
};

/** Both blades crossed before the face, then flung out to the sides (a sword dance's flourish). */
const BLADES_FLUNG = both([[-0.9, -0.05, 0.43], [-0.75, 0.3, 0.59], [-0.6, 0.5, 0.62]]);

/**
 * Swords Dance (self status; Sleep Talk; Agility and Double Team have
 * `afterimage`): a quick flourish where it stands, the torso turning one way
 * with the blades crossed before the face and the other way as they are flung
 * out, the tail swinging round as a counterweight; then it gathers and snaps
 * its blades up with an aura, a moving hold with a tremor, and relaxes. (The
 * game sweeps the sprite round in a small ellipse.)
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, shift(-0.018, -0.05, 0), twist(-20, 5), bend(12, 4, 2, 6, 12), CROSSED, FOCUS, tail(8, 18)),
    key(0.3, shift(0.018, -0.05, 0), twist(20, -5), bend(10, 4, 2, 6, -12), BLADES_FLUNG, SPLAYED, FOCUS, tail(8, -18)),
    key(0.46, shift(0, -0.065, 0), bend(16, 4, 2, 8), CROSSED_LOW, FISTS, FOCUS, tail(4)),
    // Pose: blades snapped up, chest out; a moving hold with a tremor.
    snap(0.58, shift(0, -0.01, 0), bend(-6, -4, -4, -8), SPREAD, ANGRY, tail(20)),
    key(0.72, shift(0, -0.013, 0), bend(-7, -4, -4, -9, 0, 1.5), SPREAD, ANGRY, tail(22)),
    key(0.86, shift(0, -0.01, 0), bend(-6, -5, -4, -8, 0, -1.5), SPREAD, ANGRY, tail(21)),
    key(1.0, shift(0, -0.02, 0), bend(4, 2, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Screech (status at the foe; Roar, and Toxic spat from the mouth): rears up
 * with its claws raised by its head, then lunges the head forward and
 * screeches, claws out, the head shaking.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.014), bend(-10, -7, -9, -18), CLAWS_UP, SPLAYED, ANGRY, tail(24)),
    snap(0.3, pelvis(0, -0.022, 0.005), bend(20, 10, 4, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.46, pelvis(0, -0.022, 0.005), bend(21, 11, 4, -4, 8, 4), CLAWS_OUT, SPLAYED, jaw(38), ANGRY, tail(12)),
    key(0.64, pelvis(0, -0.022, 0.005), bend(20, 11, 4, -4, -8, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.8, pelvis(0, -0.02, 0.004), bend(19, 10, 4, -4, 5, 2), CLAWS_OUT, jaw(32), ANGRY, tail(10)),
    key(0.96, pelvis(0, -0.01, 0.002), bend(7, 2, 0, -3), jaw(8), ANGRY, tail(4)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Quick Attack (tackle; Pursuit, Double-Edge, Return...): a quick crouch,
 * then the hips and the right shoulder drive at the foe, low and fast, the
 * tail streaming out; it bounces back off the hit into its guard.
 */
const physicalWeakTackle: Clip = {
  name: 'physical_weak_tackle',
  duration: 0.9,
  keys: [
    key(0),
    key(0.13, shift(0.006, -0.06, -0.025), bend(18, 5, 0, -6), ELBOWS_BACK, FOCUS, tail(12)),
    // The drive: the hips surge at the foe, low, the right shoulder leading, the tail streaming.
    snap(0.21, shift(-0.012, -0.065, 0.06), twist(18), bend(30, 8, 0, -14), ELBOWS_BACK, ANGRY, tail(26)),
    key(0.29, shift(-0.014, -0.067, 0.062), twist(19), bend(31, 8, 0, -14), ELBOWS_BACK, ANGRY, tail(24)),
    // Bounce back off the foe.
    key(0.42, shift(0.006, -0.045, -0.012), twist(6), bend(10, 2, 0, -6), GUARD, ANGRY, tail(14)),
    key(0.56, shift(0, -0.03, 0), bend(6, 2, 0, -2), GUARD, ANGRY, tail(6)),
    key(0.9, OPEN_EYES),
  ],
  events: [{ t: 0.22, name: 'impact' }],
};

/** The punch: the right fist wound back at the hip, then driven straight out; the left forearm guarding, then pulled back. */
const PUNCH_WOUND: Pose = arms([[-0.52, -0.62, -0.6], [-0.25, -0.25, 0.94], [-0.15, -0.15, 0.98]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]]);
const PUNCH_OUT: Pose = arms([[-0.1, 0.02, 0.99], [-0.02, 0.05, 1], [0, 0.05, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]]);
const PUNCH_THROUGH: Pose = arms([[-0.08, -0.04, 0.99], [0, -0.02, 1], [0.02, -0.02, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]]);

/**
 * Punch (Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter): the
 * weight sinks back with the right fist chambered at the hip, then the hips
 * drive at the foe and the hips and shoulders turn into a straight punch;
 * the arm stays out a moment, and back to the guard.
 */
const physicalStrongPunch: Clip = {
  name: 'physical_strong_punch',
  duration: 1.25,
  keys: [
    key(0),
    // Chamber: the weight sinks back, right shoulder back, the fist wound back at the hip, the left guard forward.
    key(0.28, shift(0.012, -0.06, -0.032), twist(-28), bend(13, 4, 0, -5, 11), PUNCH_WOUND, FISTS, ANGRY, tail(14, -10)),
    // Punch: the hips drive at the foe, hips and shoulders turn into it, the fist drives straight out.
    snap(0.38, shift(-0.012, -0.035, 0.055), twist(26), bend(16, 6, 0, -6, -8), PUNCH_OUT, FISTS, ANGRY, tail(4, 18)),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.52, shift(-0.014, -0.037, 0.058), twist(30), bend(18, 6, 0, -6, -9), PUNCH_THROUGH, FISTS, ANGRY, tail(2, 22)),
    key(0.7, shift(0, -0.03, 0.01), twist(6), bend(10, 2, 0, -2), GUARD, ANGRY, tail(4, 6)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.43, name: 'impact' }],
};

/**
 * Two-blade X-slash (strong strikes: Dragon Claw, Brick Break): both blades
 * raised high behind the head as it sinks, a breath held with them cocked,
 * then it drops its weight forward into a deep crouch as both forearms cut
 * down across each other; it hangs low a moment, then rises into its guard.
 */
const physicalStrongStrike: Clip = {
  name: 'physical_strong_strike',
  duration: 1.35,
  keys: [
    key(0),
    // The blades come up behind the head as the weight settles back, the chest opening.
    key(0.3, shift(0.004, -0.05, -0.03), bend(-4, -2, 0, -12), BLADES_HIGH, FOCUS, tail(28)),
    key(0.42, shift(0.004, -0.046, -0.033), bend(-7, -3, 0, -13), BLADES_HIGH, ANGRY, tail(33)),
    // X-slash: the weight drops forward into a deep crouch, both forearms cutting down across each other.
    snap(0.52, shift(-0.004, -0.085, 0.05), bend(26, 8, 2, 0), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.64, shift(-0.004, -0.092, 0.052), bend(27, 8, 2, 2, 0, 2), BLADES_CROSSED, ANGRY, tail(-10)),
    key(0.78, shift(0, -0.082, 0.04), bend(25, 8, 2, 2), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.96, shift(0, -0.035, 0.01), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4)),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'impact' }],
};

/**
 * Leaf volley (throw: Swift, Rock Tomb): the forearms cross low in front,
 * then whip out and forward, flinging the volley off the blades.
 */
const specialWeakThrow: Clip = {
  name: 'special_weak_throw',
  duration: 1.2,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.045), bend(14, 4, 2, 6), CROSSED_LOW, FOCUS, tail(8)),
    snap(0.3, pelvis(0, -0.02, 0.02), bend(-4, -4, -2, -8), both([[-0.8, 0.1, 0.6], [-0.7, 0.2, 0.7], [-0.6, 0.3, 0.75]]), SPLAYED, ANGRY, tail(20)),
    key(0.46, pelvis(0, -0.022, 0.018), bend(-5, -4, -2, -9), both([[-0.9, 0.05, 0.42], [-0.85, 0.1, 0.5], [-0.8, 0.2, 0.55]]), SPLAYED, ANGRY, tail(22)),
    key(0.66, pelvis(0, -0.02), bend(4, 1, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.37, name: 'release' }],
};

/** Detect (shield; Protect, Endure, Substitute, Safeguard): the blades snap into an X before the face; the eyes flash. */
const statusSelfShield: Clip = {
  name: 'status_self_shield',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.03), bend(8, 2, 0, 6), BRACED, FOCUS, tail(4)),
    snap(0.3, pelvis(0, -0.045), bend(6, 2, 0, 4), CROSSED, FOCUS, tail(12)),
    key(0.46, pelvis(0, -0.05), bend(7, 2, 0, 5, 0, 1), CROSSED, FOCUS, tail(13)),
    key(0.84, pelvis(0, -0.058), bend(10, 3, 1, 7, 0, -1), CROSSED, FOCUS, tail(16)),
    key(1.08, pelvis(0, -0.02), bend(4, 1, 0, 0), GUARD, ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'aura' }],
};

/** Basking (heal: Rest; weather: Sunny Day): it turns its face up to the light, arms open, eyes shut, swaying calmly. */
const statusSelfHeal: Clip = {
  name: 'status_self_heal',
  duration: 1.8,
  keys: [
    key(0),
    key(0.3, pelvis(0, 0.012), bend(-10, -8, -12, -26), PALMS_UP, SHUT, tail(15)),
    key(0.56, pelvis(0.006, 0.014), bend(-11, -8, -12, -28, 0, 5), PALMS_UP, SHUT, tail(17, 6)),
    key(0.86, pelvis(-0.006, 0.014), bend(-11, -8, -12, -28, 0, -5), PALMS_UP, SHUT, tail(17, -6)),
    key(1.14, pelvis(0.003, 0.013), bend(-10, -8, -12, -27, 0, 3), PALMS_UP, SHUT, tail(16, 3)),
    key(1.42, pelvis(0, -0.01), bend(3, 1, 0, 2), HAPPY, tail(4)),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'aura' }],
};

/** Absorb / Giga Drain (drain): reaches its claws wide at the foe, then draws them to its chest as the energy flows in. */
const specialWeakDrain: Clip = {
  name: 'special_weak_drain',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.022, 0.004), bend(16, 7, 0, -6), REACH, SPLAYED, ANGRY, tail(6)),
    key(0.34, pelvis(0, -0.024, 0.004), bend(17, 7, 0, -6), REACH, FISTS, ANGRY, tail(8)),
    // Pull the energy in: claws to the chest, back arched, eyes shut.
    key(0.56, pelvis(0, 0.008, -0.012), bend(-10, -7, -6, -18), CROSSED_LOW, FISTS, SHUT, tail(20)),
    key(0.8, pelvis(0, 0.01, -0.012), bend(-11, -7, -6, -19, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(22)),
    key(1.0, pelvis(0, 0.008, -0.01), bend(-10, -7, -6, -18, 0, -2), CROSSED_LOW, SHUT, tail(20)),
    key(1.16, pelvis(0, -0.01), bend(2, 0, 0, -2), OPEN_EYES, tail(6)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'release' }],
};

/** Leer (glare; Swagger, Attract, Mimic): leans in, head low and forward, and stares the foe down with narrowed eyes. */
const statusTargetGlare: Clip = {
  name: 'status_target_glare',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.035, 0.004), bend(18, 7, 10, 14), ANGRY, tail(4)),
    key(0.34, pelvis(0, -0.04, 0.005), bend(20, 7, 11, 16, 0, 4), ANGRY, tail(5)),
    key(0.62, pelvis(0, -0.046, 0.006), bend(23, 8, 12, 17, 4, 8), ANGRY, tail(7)),
    key(0.84, pelvis(0, -0.044, 0.005), bend(21, 7, 11, 16, -2, 5), ANGRY, tail(5)),
    key(1.02, pelvis(0, -0.012), bend(4, 1, 0, 2), ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/** Arms flung out wide at the shoulders, a little up, claws open: wide rather than overhead. */
const ARMS_WIDE = both([[-0.92, 0.2, 0.34], [-0.72, 0.5, 0.48], [-0.55, 0.62, 0.56]]);
/**
 * Arms swung down and out low to the sides, taking the stomp. (Driven down in
 * front, a wild Sceptile's claws reached under our healthbox in the crouch.)
 */
const ARMS_LOW = both([[-0.88, -0.35, 0.3], [-0.6, -0.2, 0.77], [-0.45, -0.1, 0.89]]);
/**
 * Knees pushed out wide to the sides, a sumo's squat: in a deep crouch the
 * foot IK folds the legs outward and up (left to itself it folded the left
 * knee down to the ground in front of the foot, under our healthbox for a
 * wild Sceptile). The shins are solved so the posed feet stay where the
 * stance puts them (the IK keeps their posed x/z).
 */
const SQUAT: Pose = {
  aim: {
    thighR: { dir: [-0.912, -0.342, -0.228] }, shinR: { dir: [0.646, -0.76, 0.029] },
    thighL: { dir: [0.912, -0.342, -0.228] }, shinL: { dir: [-0.589, -0.606, -0.537] },
  },
};

/**
 * The right knee raised high and out to its side, the foot hanging under it:
 * a sumo's stomp (the left leg planted by shift()). Out to the side, not
 * forward: a wild Sceptile's foot would come down under our healthbox.
 */
const KNEE_WIDE: Pose = { plantRight: 0, aim: { thighR: { dir: [-0.86, 0.2, 0.12] }, shinR: { dir: [0.05, -0.98, -0.05] } } };
const KNEE_WIDE_HIGH: Pose = { plantRight: 0, aim: { thighR: { dir: [-0.84, 0.3, 0.12] }, shinR: { dir: [0.05, -0.98, -0.06] } } };

/**
 * Earthquake (quake): a sumo's stomp where it stands. It settles its weight
 * over the left foot and rears up on it, the right knee raised high and out
 * to its side with the arms flung out wide and the tail up, then stamps the
 * foot down into a deep squat, knees pushed out, the arms swung down and out
 * low and the tail flicking up; the ground shakes and it rises. (A hop took
 * our Sceptile's head under the foe's healthbox; the game shakes the screen.)
 */
const physicalStrongQuake: Clip = {
  name: 'physical_strong_quake',
  duration: 1.55,
  keys: [
    key(0),
    key(0.18, shift(0.03, -0.07, 0), bend(14, 4, 0, 6), BRACED, FOCUS, tail(10)),
    // It rears up on the left leg, the right foot coming up off its spot and the knee going high and wide, the arms flung out.
    key(0.27, shift(0.036, -0.055, 0, 0, 'L'), footUp('R', 0.05, 0.036, -0.055, 0), bend(8, 2, -1, 0), BRACED, FOCUS, tail(22)),
    key(0.36, shift(0.04, -0.035, 0, 0, 'L'), KNEE_WIDE, bend(0, 0, -2, -8), ARMS_WIDE, SPLAYED, ANGRY, tail(35)),
    key(0.46, shift(0.042, -0.03, 0, 0, 'L'), KNEE_WIDE_HIGH, bend(-2, 0, -2, -9), ARMS_WIDE, SPLAYED, ANGRY, tail(38)),
    // Stomp: the foot slams down into a deep squat, the arms swung down and out low, the tail flicking up.
    fall(0.6, LAND, SQUAT, pelvis(0, -0.06), bend(16, 6, 2, 8), ARMS_LOW, SPLAYED, ANGRY, tail(14)),
    key(0.68, LAND, SQUAT, pelvis(0, -0.095), bend(24, 8, 4, 12, 0, 1), ARMS_LOW, SPLAYED, ANGRY, tail(20)),
    key(0.78, SQUAT, pelvis(0, -0.09), bend(25, 8, 4, 13, 0, 2), ARMS_LOW, ANGRY, tail(16)),
    key(0.96, pelvis(0, -0.068), bend(14, 4, 2, 6), ANGRY, tail(8)),
    key(1.2, pelvis(0, -0.02), bend(5, 1, 0, 2), ANGRY, tail(2)),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

// Motif clips named after their motifs (the director finds `<motif>` clips by name).

/** The right arm alone (the left keeps the stance's low guard). */
const rightArm = (r: Arm, twistR = 0): Pose => ({ aim: { armR: { dir: r[0] }, forearmR: { dir: r[1], twist: twistR }, handR: { dir: r[2] } } });

/** Claws flung open wide for the foe (the toss's rush). */
const GRAB_WIDE = both([[-0.62, 0.02, 0.78], [-0.25, 0.12, 0.96], [-0.12, 0.2, 0.97]]);
/** Forearms clamped round what it holds, low in front, blades out. */
const CLAMP = both([[-0.3, -0.45, 0.84], [0.45, -0.1, 0.89], [0.45, 0.02, 0.89]]);
/** Heaving it up to chest height to hurl it. */
const HOIST = both([[-0.3, 0.1, 0.95], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]]);
/** Driving it down into the ground in front. */
const HURL = both([[-0.15, -0.5, 0.85], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]]);
/** ... and following through, the arms pressing on down. */
const HURL_LOW = both([[-0.18, -0.62, 0.76], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]]);

/** Forearms clamped tight round what it holds as it loads. */
const CLAMP_TIGHT = both([[-0.32, -0.52, 0.79], [0.5, -0.14, 0.85], [0.5, 0, 0.87]]);

/**
 * Seismic Toss (toss): an in-place heave. The hips drive at the foe with the
 * claws flung open, the forearms clamp on it (grab: in the playtest the foe
 * rides in the grip from here, src/battle3d/director.ts) and it sinks with
 * the load, the tail pressed down; the legs drive it up to the chest, the
 * head thrown back and the tail streaming up, and from the top the whole body
 * whips forward and down to hurl it into the ground at its place (throw),
 * where it crashes (impact) while Sceptile watches from the crouch, the tail
 * swishing. The chest keeps its tilt from the clamp to the throw (the foe
 * rides in the grip turned with the chest: from where it stands a tilt swung
 * the foe round it). Hands trail the hips by ~0.08 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.05,
  keys: [
    key(0),
    // Wind up: a quick crouch, forearms drawn back, tail lifting behind.
    key(0.15, shift(0.006, -0.06, -0.02), bend(18, 5, 0, -8), ELBOWS_BACK, SPLAYED, FOCUS, tail(14)),
    // Reach: the hips drive at the foe, the claws flung open for it.
    key(0.3, shift(-0.004, -0.055, 0.045), bend(14, 3, 0, -12), GRAB_WIDE, SPLAYED, ANGRY, tail(22)),
    // Clamp on, the back straightening as the weight sinks back with it, the tail pressed down.
    key(0.46, shift(0.002, -0.075, 0.025), bend(6, 0, 0, -12), CLAMP, FISTS, ANGRY, tail(4)),
    key(0.64, shift(0.004, -0.1, 0), bend(4, 0, 0, -14), CLAMP_TIGHT, FISTS, ANGRY, tail(-18)),
    // Hoist: the legs drive it up to the chest, the head thrown back, the tail streaming up.
    key(0.82, shift(0, -0.05, -0.02), bend(4, 0, -6, -18), HOIST, FISTS, ANGRY, tail(30)),
    key(0.94, shift(0, -0.045, -0.025), bend(4, 0, -8, -21), HOIST, FISTS, ANGRY, tail(36, -10)),
    key(1.04, shift(0, -0.047, -0.027), bend(4, 0, -11, -25), HOIST, FISTS, ANGRY, tail(40)),
    // The hurl: the whole body whips forward and down with it, the tail flicking up.
    snap(1.14, shift(-0.01, -0.07, 0.05), bend(34, 16, 4, 4), HURL, ANGRY, tail(46, 14)),
    // Deep in the follow-through, the arms pressing on down; it watches it crash, the tail swishing.
    key(1.3, shift(-0.01, -0.085, 0.05), bend(31, 13, 2, 2), HURL_LOW, ANGRY, tail(14, 10)),
    key(1.46, shift(0, -0.08, 0.035), bend(26, 10, 2, 0), HURL_LOW, ANGRY, tail(8, -10)),
    // Straighten into the guard.
    key(1.63, shift(0, -0.03, 0.01), bend(10, 2, 0, 0), GUARD, ANGRY, tail(4, 6)),
    key(2.05, OPEN_EYES),
  ],
  // The throw lets go as the whip starts (the hands trail the hips); it lands on the impact.
  events: [{ t: 0.52, name: 'grab' }, { t: 1.09, name: 'throw' }, { t: 1.34, name: 'impact' }],
};


/**
 * Digging: both claws driven into the ground beside the feet, then raking in
 * turn, the right claws dragging back while the left dig in, and the other
 * way round (level with the feet: a wild Sceptile's toes rest on the top edge
 * of our healthbox, and further forward is under it).
 */
const DIG_IN = both([[-0.55, -0.8, 0.22], [-0.3, -0.93, 0.2], [-0.2, -0.95, 0.24]]);
const DIG_R = arms([[-0.5, -0.82, -0.28], [-0.3, -0.8, -0.52], [-0.2, -0.7, -0.68]], [[0.55, -0.8, 0.22], [0.3, -0.93, 0.2], [0.2, -0.95, 0.24]]);
const DIG_L = arms([[-0.55, -0.8, 0.22], [-0.3, -0.93, 0.2], [-0.2, -0.95, 0.24]], [[0.5, -0.82, -0.28], [0.3, -0.8, -0.52], [0.2, -0.7, -0.68]]);
/** Right blade cocked low for the rising cut, left forearm low in front. */
const BLADE_LOW = arms([[-0.45, -0.75, -0.48], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]], [[0.4, -0.6, 0.69], [-0.1, -0.35, 0.93], [-0.1, 0, 1]]);
/** Right blade driven up through the foe from below, left forearm guarding low. */
const RISING_BLADE = arms([[-0.4, 0.82, 0.42], [-0.2, 0.97, 0.15], [-0.1, 0.95, -0.3]], [[0.45, -0.55, 0.7], [-0.1, 0.4, 0.91], [-0.1, 0.75, 0.65]]);
/** The right knee driven up, the foot tucked back under it (the left leg planted by shift()). */
const RISING_KNEE: Pose = { plantRight: 0, aim: { thighR: { dir: [-0.25, 0.4, 0.88] }, shinR: { dir: [-0.1, -0.8, -0.59] } } };

/**
 * Dig (burrow): a crouch-and-dig where it stands. It crouches with its eyes
 * on the ground and drives its claws in beside its feet (dig: the dirt bursts
 * up), rakes the ground claw over claw with the tail swishing, gathers low
 * with the right blade cocked, and bursts up out of the crouch with a rising
 * cut of the right blade, knee up, the tail trailing (impact); it comes down
 * into a crouch. (The game sinks the sprite into the ground and raises it
 * under the foe; the body follows.)
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 1.8,
  keys: [
    key(0),
    // Crouch, eyes on the ground ahead, forearms drawn back, the tail loading.
    key(0.12, shift(0, -0.08, 0), bend(24, 7, 2, 18), ELBOWS_BACK, FOCUS, tail(16)),
    // Claws into the ground: the dirt flies.
    key(0.22, shift(0, -0.1, 0.005), bend(34, 8, 2, 22), DIG_IN, SPLAYED, ANGRY, tail(20)),
    // Digging, claw over claw, the tail swishing.
    key(0.34, shift(0.008, -0.105, 0.005), bend(36, 8, 2, 22), DIG_R, SPLAYED, ANGRY, tail(16, 12)),
    key(0.46, shift(-0.008, -0.105, 0.005), bend(36, 8, 2, 23), DIG_L, SPLAYED, ANGRY, tail(16, -12)),
    // Gathered low, the right blade cocked low...
    key(0.62, shift(0, -0.1, 0), bend(20, 6, 0, -8), BLADE_LOW, ANGRY, tail(-6)),
    // ...and it bursts up out of the crouch, the right blade cutting up, knee up, the tail trailing.
    snap(0.74, shift(-0.004, 0.01, 0.02, 0, 'L'), RISING_KNEE, bend(-8, -6, -4, -16), twist(10), RISING_BLADE, ANGRY, tail(-30, 25)),
    key(0.88, shift(-0.004, 0.012, 0.02, 0, 'L'), RISING_KNEE, bend(-10, -6, -4, -18), twist(12), RISING_BLADE, ANGRY, tail(-24, 15)),
    // The foot comes down into a crouch, the tail swishing.
    fall(1.04, shift(0, -0.06, 0.01), bend(20, 4, 0, -6), GUARD, ANGRY, tail(8, 10)),
    key(1.32, shift(0, -0.035, 0), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, -8)),
    key(1.8, OPEN_EYES),
  ],
  // The claws trail the hips (overlap): they hit the ground just after their key.
  events: [{ t: 0.29, name: 'dig' }, { t: 0.8, name: 'impact' }],
};

/**
 * Mud-Slap (fling): it stoops and rakes the ground beside its right foot with
 * its right claws, drags a handful of mud back past its hip, swings it through low and slings
 * it underhand at the foe (release from the right hand, which trails the hips
 * by ~0.08 s), following through with the claws open; the left forearm keeps
 * its guard.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.1,
  keys: [
    key(0),
    // Stoop: the right claws rake the ground beside its right foot, the tail lifts.
    // (Level with the foot, not out in front: a wild Sceptile's toes rest on
    // the top edge of our healthbox, and further forward is under it.)
    key(0.14, pelvis(0, -0.08, -0.005), twist(4), bend(24, 6, 0, 14), FOCUS, tail(20),
      rightArm([[-0.6, -0.75, -0.2], [-0.5, -0.82, -0.15], [-0.4, -0.9, -0.1]]), SPLAYED),
    // Scoop: the claws drag back along the ground past the right hip, weight back.
    key(0.24, pelvis(0.01, -0.07, -0.012), twist(-16), bend(20, 5, 0, 4, 6), ANGRY, tail(10),
      rightArm([[-0.45, -0.8, -0.4], [-0.25, -0.85, -0.47], [-0.15, -0.8, -0.58]]), FISTS),
    // Swing: the arm comes through low beside the hip as the torso unwinds.
    key(0.3, pelvis(0, -0.06, 0.002), twist(4), bend(16, 5, 0, 0, 3), ANGRY, tail(6, 6),
      rightArm([[-0.42, -0.85, 0.3], [-0.25, -0.6, 0.76], [-0.15, -0.45, 0.88]]), FISTS),
    // Sling it: the arm whips forward and up underhand, the claws opening.
    snap(0.36, pelvis(-0.005, -0.035, 0.004), twist(22), bend(10, 5, 0, -8, -4), ANGRY, tail(4, 14),
      rightArm([[-0.35, 0.4, 0.85], [-0.2, 0.66, 0.72], [-0.15, 0.72, 0.68]]), SPLAYED),
    // Follow-through: the claws open high and out at the foe, hanging a moment.
    key(0.5, pelvis(-0.006, -0.034, 0.004), twist(25), bend(11, 5, 0, -8, -5), ANGRY, tail(4, 18),
      rightArm([[-0.42, 0.52, 0.74], [-0.26, 0.78, 0.57], [-0.2, 0.84, 0.5]]), SPLAYED),
    key(0.62, pelvis(-0.005, -0.033, 0.004), twist(24), bend(10, 5, 0, -7, -4), ANGRY, tail(4, 16),
      rightArm([[-0.44, 0.5, 0.74], [-0.28, 0.76, 0.58], [-0.22, 0.82, 0.52]]), SPLAYED),
    key(0.86, pelvis(0, -0.02), twist(6), bend(4, 1, 0, -2), ANGRY, tail(4, 4)),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.41, name: 'release' }],
};

/**
 * Double Team, Agility (afterimage): feints faster than the eye, from the
 * waist, the feet planted: the upper body slips to one side, dips under and
 * slips out to the other (a boxer's bob and weave), the head held level and
 * the tail swinging out as a counterweight, in its fighting stance (right
 * claw raised, left forearm guarding). The game moves the sprite (Agility's
 * sweep, Double Team's copies); the afterimages start at the aura and run
 * 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.45,
  keys: [
    key(0),
    key(0.1, shift(0, -0.05, 0), bend(10, 3, 0, -4), FOCUS, tail(6)),
    // Slip to its right...
    key(0.2, shift(-0.035, -0.045, 0), twist(-8, 20), bend(6, 0, 0, 0), level(-14), ANGRY, tail(12, -22)),
    // ...dip under...
    key(0.3, shift(0, -0.085, 0.004), bend(22, 4, 0, 4), ANGRY, tail(6)),
    // ...and out to its left; again, and again.
    key(0.4, shift(0.035, -0.045, 0), twist(8, -20), bend(6, 0, 0, 0), level(14), ANGRY, tail(12, 22)),
    key(0.5, shift(0, -0.085, 0.004), bend(22, 4, 0, 4), ANGRY, tail(6)),
    key(0.6, shift(-0.035, -0.045, 0), twist(-8, 20), bend(6, 0, 0, 0), level(-14), ANGRY, tail(12, -22)),
    key(0.7, shift(0, -0.085, 0.004), bend(22, 4, 0, 4), ANGRY, tail(6)),
    key(0.8, shift(0.032, -0.045, 0), twist(7, -17), bend(6, 0, 0, 0), level(12), ANGRY, tail(12, 18)),
    key(0.91, shift(0, -0.07, 0.003), bend(17, 3, 0, 3), ANGRY, tail(6)),
    key(1.03, shift(-0.012, -0.045, 0), twist(-3, 6), level(-4), ANGRY, tail(8, -8)),
    key(1.17, shift(0, -0.03, 0), bend(6, 2, 0, 0), ANGRY, tail(4)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.15, name: 'aura' }],
};

/** Both arms flung open high and wide toward the foe, claws spread (Flash's flare). */
const FLARE = both([[-0.86, 0.4, 0.32], [-0.64, 0.68, 0.36], [-0.5, 0.8, 0.33]]);

/**
 * Flash (flash): it curls in over its crossed forearms, eyes shut, gathering
 * the sunlight, then flares up tall and throws its arms and blades open at
 * the foe with the tail fanned high (emit: the screen turns white and both
 * Pokémon black, so the flare is a silhouette), holds the flare and relaxes.
 */
const flash: Clip = {
  name: 'flash',
  duration: 1.25,
  keys: [
    key(0),
    // Gather: curl in over the crossed forearms, eyes shut, the tail drawn in low.
    key(0.18, pelvis(0, -0.06), bend(22, 7, 2, 16), CROSSED_LOW, FISTS, SHUT, tail(-8)),
    key(0.34, pelvis(0, -0.07), bend(25, 8, 2, 18, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(-10)),
    // Flare: up tall, chest thrown open, arms and blades flung wide at the foe.
    snap(0.44, pelvis(0, 0.02, 0.012), bend(-16, -9, -6, -16), FLARE, SPLAYED, jaw(18), ANGRY, tail(40)),
    key(0.6, pelvis(0, 0.018, 0.012), bend(-17, -9, -6, -17, 0, 2), FLARE, SPLAYED, jaw(16), ANGRY, tail(38)),
    key(0.78, pelvis(0, 0.014, 0.01), bend(-15, -9, -6, -15, 0, -2), FLARE, SPLAYED, jaw(10), ANGRY, tail(34)),
    // Relax back into the crouch.
    key(0.98, pelvis(0, -0.015), bend(4, 1, 0, 0), GUARD, ANGRY, tail(6)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'emit' }],
};

/**
 * Taking a hit: snaps back and winces (the battler adds a sprung recoil),
 * then shakes it off. Its weight stays back on its heels while it recovers,
 * so the recoil's swing back doesn't carry a wild Sceptile's toes past the
 * top of our healthbox.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0, -0.015), bend(-14, -6, -6, -18), FLINCH, HURT, tail(12)),
    key(0.2, pelvis(0, 0, -0.02), bend(-6, -2, -2, -8), HURT, tail(6)),
    key(0.36, pelvis(0, 0, -0.012), bend(4, 1, 0, 4), HURT, tail(2)),
    key(0.6, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it sinks into a squat, knees out, and curls over hugging itself, the
 * long neck bowed and the tail curling round, eyes shut; from the 'shrink'
 * the curled body shrinks away (Battler3D). It sits back over its heels as
 * it curls: bowed forward over its feet on that long neck, a wild
 * Sceptile's head, knees and claws came down onto our healthbox
 * (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-8, -4, -4, -12), DROWSY, tail(6)),
    key(0.48, pelvis(0, -0.07), root({ z: -0.04 }), SQUAT, bend(12, 5, 8, 16), CROSSED, SHUT, tail(-6, 10)),
    key(0.82, pelvis(0, -0.18), root({ z: -0.1 }), SQUAT, bend(22, 10, 16, 24), CROSSED, SHUT, tail(-12, 26)),
    key(0.96, pelvis(0, -0.19), root({ z: -0.1 }), SQUAT, bend(24, 11, 17, 26), CROSSED, SHUT, tail(-13, 28)),
    key(1.6, pelvis(0, -0.186), root({ z: -0.1 }), SQUAT, bend(23, 10, 16, 25), CROSSED, SHUT, tail(-12, 27)),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const SCEPTILE_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    physicalWeakTackle, physicalStrongPunch, physicalStrongStrike, physicalStrongQuake,
    specialWeakThrow, specialWeakDrain, statusSelfShield, statusSelfHeal, statusTargetGlare,
    toss, burrow, fling, afterimage, flash,
  ].map((c) => [c.name, c]),
);

/** Eye atlas (pm0254_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const SCEPTILE_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  focus: [1, 2],
  hurt: [0, 3],
};
