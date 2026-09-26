// Sceptile's battle animation set: one clip per attack category (+ idle, intro,
// entrance, hit, faint) and the motif clips its moves need. Keys are STANCE +
// deltas (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (leaps, spins, sink)
//   plantFeet       foot IK weight (0 = the legs are free: airborne). The IK
//                   pins a planted foot's height and keeps its posed x/z, so
//                   a pelvis shift moves planted feet with it
//   expression      eye atlas cell (open, angry, focus, half, happy, closed, hurt)
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, thud; grab and throw (a toss carries
// the foe between them), dig (a burrow goes under); launch and land (the
// entrance leaves the ground and touches down: the battle adds the place's
// path between them, src/battle3d/entrance.ts).
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is a few
// pixels above our Sceptile's crest and ours is to its right; a wild
// Sceptile's toe claws rest on the top edge of ours, so its feet never slide
// toward the camera and nothing reaches the ground in front of them.
//
// Sceptile is light and fast: timings run ~0.85x Blaziken's, strikes snap in
// 3-5 frames and it is back in guard quickly. Its weapons are the leaf blades
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
const HAPPY: Pose = { expression: 'happy' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
const advance = (a: number): Pose => ({ advance: a });
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
/**
 * Hanging limp at its sides, a little back (faint): hanging forward, a wild
 * Sceptile's claws touched the ground in front of its feet, under our
 * healthbox.
 */
const LIMP = both([[-0.35, -0.82, -0.45], [-0.2, -0.8, -0.55], [-0.1, -0.85, -0.5]]);
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

/** Airborne, travelling forward: leading knee up, trailing leg back. */
const TUCK: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.4, 0.87] }, shinR: { dir: [-0.15, -0.95, -0.2] },
    thighL: { dir: [0.35, -0.75, -0.55] }, shinL: { dir: [0.15, -0.45, -0.88] },
  },
};
/** Airborne, hopping: both knees drawn up. */
const HOP: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.45, -0.7, 0.55] }, shinR: { dir: [-0.15, -0.93, -0.33] },
    thighL: { dir: [0.45, -0.7, 0.55] }, shinL: { dir: [0.15, -0.93, -0.33] },
  },
};
/**
 * Airborne on a quick side-step, `lift` heights up with the knees drawn up:
 * the root rises further than the body, so the foot IK folds the legs and
 * lifts both feet level, just where they stood. (Sceptile's stance reaches
 * the ground only through the IK: freed, its legs would drop its feet and
 * swing them forward with the long toes pointing down, and for a wild
 * Sceptile, whose toes rest on the top edge of our healthbox, forward and
 * down is under it.)
 */
const DART = (lift: number): Pose => ({ root: { y: lift }, pelvis: { y: -0.4 * lift } });
/** Airborne with the legs reaching down for the ground (the stance's legs, feet free). */
const DROP: Pose = { plantFeet: 0 };
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

/** Legs driven straight down: the push of the spring. */
const LEGS_DOWN: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.95, 0.08] }, shinR: { dir: [0.08, -0.98, -0.18] },
    thighL: { dir: [0.3, -0.95, 0.08] }, shinL: { dir: [-0.08, -0.98, -0.18] },
  },
};
/** Knees drawn up and splayed wide, frog-legged, the feet tucked under (a jump straight up or down). */
const KNEES_UP: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.7, -0.15, 0.7] }, shinR: { dir: [0.25, -0.85, -0.45] },
    thighL: { dir: [0.7, -0.15, 0.7] }, shinL: { dir: [-0.25, -0.85, -0.45] },
  },
};
/** Legs splayed and reaching down for the ground, like a gecko's. */
const LEGS_REACH: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.5, -0.83, 0.25] }, shinR: { dir: [0.1, -0.96, -0.25] },
    thighL: { dir: [0.5, -0.83, 0.25] }, shinL: { dir: [-0.1, -0.96, -0.25] },
  },
};
/** Arms swept back along the body, the blades trailing (the spring). */
const SWEPT = both([[-0.4, -0.62, -0.67], [-0.25, -0.5, -0.83], [-0.15, -0.45, -0.88]]);
/** Arms flung out wide to the sides, claws open: a leaping gecko, splayed. */
const SPLAYED_ARMS = both([[-0.9, 0.05, 0.42], [-0.75, 0.25, 0.6], [-0.6, 0.35, 0.72]]);
/** Claws reaching forward and down for the ground, like a gecko's front feet. */
const PAWS = both([[-0.45, -0.4, 0.8], [-0.25, -0.65, 0.72], [-0.15, -0.75, 0.64]]);
/** Claws down on the ground in front: on all fours. */
const ON_ALL_FOURS = both([[-0.35, -0.82, 0.45], [-0.12, -0.93, 0.35], [-0.05, -0.92, 0.38]]);

/**
 * A wild Sceptile comes into the battle: a gecko's quick coil, then it
 * springs (launch) with the arms swept back so the head and crest lead up out
 * of the grass, splays at the top like a leaping gecko (knees drawn up wide,
 * arms flung out, claws open) while the tail whips up for balance, reaches
 * down with its legs and its claws like front feet, touches down on its toes
 * (land) and keeps sinking, low onto all fours, the tail swinging out as a
 * counterweight, and rears up into its stance. The path (bursting up out of
 * the grass, dropping off the cave's ceiling, drifting down to the seabed) is
 * the place's: src/battle3d/entrance.ts. Only the wild Pokémon enters, and it
 * is in shadow while it does: the splayed shape at the top of the jump is
 * what reads (a tight tuck read as a dark knot).
 */
const entrance: Clip = {
  name: 'entrance',
  duration: 1.42,
  keys: [
    key(0, pelvis(0, -0.08), bend(24, 8, -4, 10), CROSSED_LOW, FOCUS, tail(-6, 8)),
    key(0.16, pelvis(0, -0.11), bend(30, 10, -4, 12), CROSSED_LOW, FOCUS, tail(-10, 12)),
    // The spring: the legs drive straight with the feet still down, the body stretches up, arms swept back.
    snap(0.24, pelvis(0, 0.03), bend(-8, -5, -6, -14), SWEPT, ANGRY, tail(-18)),
    // Off the ground, the legs trailing.
    key(0.34, LEGS_DOWN, pelvis(0, 0.03), bend(-5, -4, -4, -12), SWEPT, ANGRY, tail(-6)),
    // Splayed at the top: knees up wide, arms flung out, the tail whipping up.
    key(0.52, KNEES_UP, bend(12, 6, 0, -10), SPLAYED_ARMS, SPLAYED, ANGRY, tail(40, 12)),
    // Reaching down: legs splayed, claws out in front like front feet.
    key(0.63, LEGS_REACH, bend(10, 4, 0, -10), PAWS, SPLAYED, ANGRY, tail(14, -8)),
    // Touch down lightly on the toes...
    key(0.7, pelvis(0, -0.02), bend(16, 6, -4, -12), PAWS, SPLAYED, FOCUS, tail(20, -18)),
    // ... and keep sinking, low on all fours: the knees and claws take it, the head level, the tail out.
    key(0.8, LAND, pelvis(0, -0.055), bend(28, 10, -8, -16), ON_ALL_FOURS, SPLAYED, FOCUS, tail(28, -26)),
    key(0.94, LAND, pelvis(0, -0.065), bend(30, 10, -8, -17), ON_ALL_FOURS, SPLAYED, FOCUS, tail(10, 12)),
    // Rear up into the stance, eyes on the foe.
    key(1.14, pelvis(0, -0.02), bend(8, 2, 0, -2), ANGRY, tail(6, -6)),
    key(1.42, OPEN_EYES),
  ],
  events: [{ t: 0.24, name: 'launch' }, { t: 0.7, name: 'land' }],
};

/**
 * Leaf Blade (weak contact: Pound, Fury Cutter, False Swipe, Aerial Ace...):
 * the right blade cocked high behind, a quick leap in, and a slash down and
 * across led by the forearm; the blade carries through, then a hop home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: crouch, the head turning to the foe first, right shoulder back, the blade raised high behind like a sword.
    key(0.16, pelvis(0, -0.04), twist(-26), bend(8, 0, 0, -6, 14), BLADE_COCKED, FOCUS, tail(8, -12)),
    // Leap along an arc, legs tucked.
    key(0.28, advance(0.55), root({ y: 0.08 }), TUCK, twist(-30), bend(6, 0, 0, -6, 16), ANGRY, tail(14, -14),
      arms([[-0.55, 0.68, -0.48], [-0.15, 0.97, -0.2], [-0.05, 0.9, -0.43]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]])),
    // Land in front of the foe, knees taking the weight, the blade still cocked.
    key(0.38, advance(1), LAND, twist(-30), bend(12, 0, 0, -6, 15), BLADE_COCKED, ANGRY, tail(6, -12)),
    // Slash: the torso unwinds, the forearm sweeps down and across, blade leading.
    snap(0.45, advance(1), pelvis(0.012, -0.035), twist(26, -6), bend(20, 4, 0, -6, -8), ANGRY, tail(4, 22),
      arms([[0.45, -0.45, 0.77], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    // Follow-through: the blade carries on down past its left hip, then hangs there.
    key(0.6, advance(1), pelvis(0.014, -0.032), twist(32, -7), bend(22, 4, 0, -6, -10), ANGRY, tail(2, 28),
      arms([[0.6, -0.65, 0.45], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    key(0.76, advance(1), pelvis(0, -0.035), twist(8), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 8)),
    // Hop back home, the head easing back to its sideways look.
    key(0.9, advance(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.02, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
};

/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail, and Mega Kick by
 * fallback): coils with the tail up, springs in and turns its back to the
 * foe, hangs at the top of the arc with the tail reared high over its head,
 * whips it down on the foe, lands, and spins back round on the hop home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.9,
  keys: [
    key(0),
    // Coil: deep crouch, tail lifting behind.
    key(0.24, pelvis(0, -0.08), bend(20, 6, 4, 10), BRACED, FOCUS, tail(30)),
    // Spring up and in, turning its back to the foe.
    key(0.4, advance(0.5), root({ y: 0.2, yaw: -80 }), TUCK, bend(4, 2, 0, -6), GUARD, ANGRY, tail(50)),
    // Top of the arc, back to the foe: the tail rears up over its head (a moving hold).
    key(0.52, advance(0.85), root({ y: 0.27, yaw: -172 }), TUCK, bend(-12, -4, 0, -12), SPREAD, ANGRY, tail(88)),
    key(0.62, advance(0.92), root({ y: 0.26, yaw: -180, pitch: -6 }), TUCK, bend(-14, -5, 0, -14), SPREAD, ANGRY, tail(96)),
    // Slam: the body tips away and the tail whips down onto the foe.
    snap(0.72, advance(1), root({ y: 0.1, yaw: -182, pitch: 16 }), DROP, bend(26, 8, 4, 8), BRACED, ANGRY, tail(-18)),
    // Land, deep in the knees, the tail on the foe.
    key(0.82, advance(1), root({ yaw: -182 }), LAND, pelvis(0, -0.03), bend(26, 8, 4, 10), BRACED, ANGRY, tail(-22)),
    key(1.0, advance(1), root({ yaw: -180 }), pelvis(0, -0.04), bend(12, 4, 2, 4), GUARD, ANGRY, tail(-4)),
    // Hop home, spinning back round to face the foe.
    key(1.18, advance(0.5), root({ y: 0.08, yaw: -290 }), HOP, bend(6, 2, 0, 0), GUARD, ANGRY, tail(12)),
    key(1.34, advance(0), root({ yaw: -360 }), LAND, GUARD, ANGRY, tail(4)),
    key(1.9, root({ yaw: -360 }), OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
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

/**
 * Swords Dance (self status; Sleep Talk; Agility and Double Team have
 * `afterimage`): blurs from side to side in three quick hops, leaning into
 * each, lands centred and snaps its blades up with an aura. Each hop peaks
 * halfway across, so the body keeps flowing through the air and only stops
 * where it lands. The hops stay low and narrow, zig-zagging back a little
 * (clear of the healthboxes: the foe's above our Sceptile's head, ours at a
 * wild one's feet).
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    // Crouch, the hips loading to its left to push off to the right.
    key(0.14, pelvis(-0.02, -0.05), twist(0, 4), bend(12, 4, 2, 6), GUARD, FOCUS, tail(6, -6)),
    key(0.25, root({ x: 0.07, z: -0.025 }), DART(0.06), twist(0, -12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 20)),
    key(0.35, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -4), GUARD, FOCUS, tail(4, 14)),
    key(0.46, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, 12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, -20)),
    key(0.57, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 4), GUARD, FOCUS, tail(4, -14)),
    key(0.67, root({ x: -0.075, z: -0.015 }), DART(0.055), twist(0, -6), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 10)),
    key(0.77, LAND, GUARD, FOCUS, tail(4)),
    // Pose: blades snapped up, chest out; a moving hold with a tremor.
    snap(0.88, pelvis(0, -0.01), bend(-6, -4, -4, -8), SPREAD, ANGRY, tail(20)),
    key(1.02, pelvis(0, -0.013), bend(-7, -4, -4, -9, 0, 1.5), SPREAD, ANGRY, tail(22)),
    key(1.16, pelvis(0, -0.01), bend(-6, -5, -4, -8, 0, -1.5), SPREAD, ANGRY, tail(21)),
    key(1.3, pelvis(0, -0.02), bend(4, 2, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.92, name: 'aura' }],
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
 * Quick Attack (tackle; Pursuit, Double-Edge, Return...): a blur-fast low
 * dash with the shoulder leading, a bounce off the foe and a hop home.
 */
const physicalWeakTackle: Clip = {
  name: 'physical_weak_tackle',
  duration: 1.05,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.06), bend(18, 5, 0, -6), ELBOWS_BACK, FOCUS, tail(12)),
    key(0.24, advance(0.7), root({ y: 0.05, pitch: 16 }), TUCK, twist(14), bend(24, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(24)),
    snap(0.3, advance(1), root({ y: 0.03, pitch: 18 }), TUCK, twist(18), bend(25, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(22)),
    // Bounce off the foe.
    key(0.4, advance(0.84), root({ y: 0.06, pitch: 6 }), HOP, twist(6), bend(8, 2, 0, -6), GUARD, ANGRY, tail(14)),
    key(0.5, advance(0.78), LAND, bend(6, 2, 0, -2), GUARD, ANGRY, tail(6)),
    key(0.64, advance(0.35), root({ y: 0.06 }), HOP, GUARD, ANGRY, tail(10)),
    key(0.76, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.31, name: 'impact' }],
};

/**
 * Punch (Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter):
 * the right fist chambered at the hip, a leap in, and the fist driven
 * straight at the foe as the hips and shoulders turn into it.
 */
const physicalStrongPunch: Clip = {
  name: 'physical_strong_punch',
  duration: 1.5,
  keys: [
    key(0),
    // Chamber: crouch, right shoulder back, fist at the hip, left guard forward.
    key(0.2, pelvis(0, -0.05), twist(-22), bend(12, 4, 0, -4, 8), FISTS, FOCUS, tail(10, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.32, advance(0.55), root({ y: 0.07 }), TUCK, twist(-30), bend(10, 4, 0, -6, 12), FISTS, ANGRY, tail(16, -10),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.42, advance(1), LAND, twist(-28), bend(14, 4, 0, -6, 12), FISTS, ANGRY, tail(8, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    // Punch: hips and shoulders turn into it, the fist drives straight out.
    snap(0.5, advance(1), pelvis(0, -0.03, 0.03), twist(26), bend(16, 6, 0, -6, -8), FISTS, ANGRY, tail(4, 18),
      arms([[-0.1, 0.02, 0.99], [-0.02, 0.05, 1], [0, 0.05, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.66, advance(1), pelvis(0, -0.032, 0.034), twist(30), bend(18, 6, 0, -6, -9), FISTS, ANGRY, tail(2, 22),
      arms([[-0.08, -0.04, 0.99], [0, -0.02, 1], [0.02, -0.02, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    key(0.82, advance(1), pelvis(0, -0.035), twist(6), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 6)),
    key(0.96, advance(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.08, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
};

/**
 * Two-blade X-slash (strong strikes: Dragon Claw, Brick Break): both blades
 * raised high, a big leap, and both forearms slash down across each other on
 * the way down; lands deep, hangs, hops home.
 */
const physicalStrongStrike: Clip = {
  name: 'physical_strong_strike',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.07), bend(14, 4, 0, -8), BLADES_HIGH, FOCUS, tail(12)),
    key(0.36, advance(0.55), root({ y: 0.16 }), TUCK, bend(-6, -2, 0, -12), BLADES_HIGH, ANGRY, tail(30)),
    key(0.5, advance(0.9), root({ y: 0.12 }), TUCK, bend(-8, -3, 0, -14), BLADES_HIGH, ANGRY, tail(34)),
    // X-slash: both forearms cut down and across on the way down.
    snap(0.57, advance(1), root({ y: 0.03 }), DROP, bend(24, 8, 2, 0), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.64, advance(1), LAND, pelvis(0, -0.035), bend(26, 8, 2, 2), BLADES_CROSSED, ANGRY, tail(-10)),
    key(0.82, advance(1), pelvis(0, -0.07), bend(25, 8, 2, 2, 0, 2), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.98, advance(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4)),
    key(1.12, advance(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.24, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
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
 * Earthquake (quake): drops into a crouch, springs into a tucked hop with
 * the arms flung out wide and stomps down hard into a deep crouch; the
 * ground shakes. The hop is the feet drawn up high under a low body (DART's
 * foot IK) rather than a leap: from our side, a leap took our Sceptile's
 * head and claws under the foe's healthbox. The knees keep sinking after
 * touchdown instead of stopping dead.
 */
const physicalStrongQuake: Clip = {
  name: 'physical_strong_quake',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.09), bend(18, 6, 0, 6), BRACED, FOCUS, tail(10)),
    // The hop: the feet drawn up high under it, arms flung out wide.
    key(0.38, DART(0.1), pelvis(0, -0.045), bend(2, 0, -2, -8), ARMS_WIDE, SPLAYED, ANGRY, tail(35)),
    // Top of the hop: a moment's hang.
    key(0.47, DART(0.11), pelvis(0, -0.045), bend(3, 1, -2, -7), ARMS_WIDE, SPLAYED, ANGRY, tail(36)),
    // Stomp: falls from the top, accelerating into a deep landing, the arms swung
    // down and out low and the tail flicking up as a counterweight (lowered, its
    // fronds met the ground beside the left foot, under our healthbox for a wild one).
    fall(0.62, LAND, SQUAT, pelvis(0, -0.06), bend(16, 6, 2, 8), ARMS_LOW, SPLAYED, ANGRY, tail(14)),
    key(0.7, LAND, SQUAT, pelvis(0, -0.095), bend(24, 8, 4, 12, 0, 1), ARMS_LOW, SPLAYED, ANGRY, tail(20)),
    key(0.8, SQUAT, pelvis(0, -0.09), bend(25, 8, 4, 13, 0, 2), ARMS_LOW, ANGRY, tail(16)),
    key(0.98, pelvis(0, -0.068), bend(14, 4, 2, 6), ANGRY, tail(8)),
    key(1.24, pelvis(0, -0.02), bend(5, 1, 0, 2), ANGRY, tail(2)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

// Motif clips named after their motifs (the director finds `<motif>` clips by name).

/** Landing home from a hop: LAND with the torso upright, so the settle to the stance is small. */
const LIGHT: Pose = bend(-3, 0, 0, 3);
/** The right arm alone (the left keeps the stance's low guard). */
const rightArm = (r: Arm, twistR = 0): Pose => ({ aim: { armR: { dir: r[0] }, forearmR: { dir: r[1], twist: twistR }, handR: { dir: r[2] } } });

/** Claws flung open wide for the foe (the toss's rush). */
const GRAB_WIDE = both([[-0.62, 0.02, 0.78], [-0.25, 0.12, 0.96], [-0.12, 0.2, 0.97]]);
/** Forearms clamped round what it holds, low in front, blades out. */
const CLAMP = both([[-0.3, -0.45, 0.84], [0.45, -0.1, 0.89], [0.45, 0.02, 0.89]]);
/** Carrying it hugged low in front (not overhead: our Pokémon is near the camera and would leave the screen). */
const CARRY = both([[-0.3, -0.3, 0.9], [0.45, 0.05, 0.89], [0.45, 0.1, 0.88]]);
/** Heaving it up to chest height to hurl it. */
const HOIST = both([[-0.3, 0.1, 0.95], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]]);
/** Driving it down into the ground in front. */
const HURL = both([[-0.15, -0.5, 0.85], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]]);
/** ... and following through, the arms pressing on down. */
const HURL_LOW = both([[-0.18, -0.62, 0.76], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]]);

/**
 * Seismic Toss (toss): a springy dash in with the claws flung open, it clamps
 * on the foe (grab) and presses its tail down to spring off it, leaping up and
 * back toward mid-field with the foe hugged low in front (never overhead: our
 * Pokémon is near the camera), spinning round with it while the tail streams
 * out; then its whole body whips forward and down to hurl the foe back into
 * its own place (throw), where it crashes (impact) in both views while
 * Sceptile lands straight down at advance 0.4 and watches, the tail swishing.
 * Hands trail the hips by ~0.08 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.02,
  keys: [
    key(0),
    // Wind up: a quick crouch, forearms drawn back, tail lifting behind.
    key(0.12, pelvis(0, -0.06), bend(18, 5, 0, -8), ELBOWS_BACK, SPLAYED, FOCUS, tail(14)),
    // Spring in low, pitched forward, claws flung open.
    key(0.26, advance(0.65), root({ y: 0.07, pitch: 12 }), TUCK, bend(16, 4, 0, -12), GRAB_WIDE, SPLAYED, ANGRY, tail(26)),
    // Land at the foe, claws on it.
    key(0.34, advance(1), LAND, bend(16, 4, 0, -10), GRAB_WIDE, SPLAYED, ANGRY, tail(20)),
    // Clamp on low (grab), the claws closing.
    key(0.44, advance(1), pelvis(0, -0.07), bend(22, 6, 0, -12), CLAMP, FISTS, ANGRY, tail(0)),
    // Load: sink deep with it, the tail pressed down to spring off it.
    key(0.54, advance(1), pelvis(0, -0.1), bend(20, 6, 0, -14), CLAMP, FISTS, ANGRY, tail(-20)),
    // Spring up and back, hugging the foe low in front, starting to spin.
    key(0.68, advance(0.84), root({ y: 0.17, yaw: 60 }), HOP, pelvis(0, -0.02), bend(-2, -2, -2, -12), CARRY, FISTS, ANGRY, tail(30)),
    // Spinning round with it at the top, the tail streaming out.
    key(0.81, advance(0.62), root({ y: 0.21, yaw: 228 }), HOP, pelvis(0, -0.02), bend(-4, -3, -2, -14), CARRY, FISTS, ANGRY, tail(36, -16)),
    // Facing its place again, leaning back and heaving it up to hurl.
    key(0.91, advance(0.44), root({ y: 0.21, yaw: 360 }), HOP, pelvis(0, 0), bend(-10, -6, -6, -18), HOIST, FISTS, ANGRY, tail(40, 0)),
    // The hurl: the whole body whips forward and down with it, the tail flicking up.
    snap(0.99, advance(0.4), root({ y: 0.04, yaw: 360 }), DROP, pelvis(0, -0.02), bend(34, 16, 4, 4), HURL, ANGRY, tail(46, 14)),
    // Land deep where it is, arms still down; watch it crash from the crouch, the tail swishing.
    key(1.1, advance(0.4), root({ yaw: 360 }), LAND, pelvis(0, -0.08), bend(30, 12, 2, 2), HURL, ANGRY, tail(14, 10)),
    key(1.32, advance(0.4), root({ yaw: 360 }), LAND, pelvis(0, -0.085), bend(28, 11, 2, 0), HURL_LOW, ANGRY, tail(8, -10)),
    // Straighten into its stance, then hop home.
    key(1.47, advance(0.4), root({ yaw: 360 }), pelvis(0, -0.03), bend(10, 2, 0, 0), ANGRY, tail(4, 6)),
    key(1.6, advance(0.18), root({ y: 0.065, yaw: 360 }), HOP, bend(8, 0, 0, 0), ANGRY, tail(10)),
    key(1.72, advance(0), root({ yaw: 360 }), LAND, LIGHT, ANGRY, tail(2)),
    key(2.02, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'grab' }, { t: 1.02, name: 'throw' }, { t: 1.22, name: 'impact' }],
};

/** Both arms stretched overhead along the body, blades together (a diver's entry). */
const DIVE = both([[-0.15, 0.9, 0.4], [0.1, 0.95, 0.3], [0.12, 0.95, 0.2]]);
/** Right blade driven up through the foe from below, left forearm guarding low. */
const RISING_BLADE = arms([[-0.4, 0.82, 0.42], [-0.2, 0.97, 0.15], [-0.1, 0.95, -0.3]], [[0.45, -0.55, 0.7], [-0.1, 0.4, 0.91], [-0.1, 0.75, 0.65]]);
/** Right blade cocked low for the rising cut, left forearm guarding. */
const BLADE_LOW = arms([[-0.45, -0.75, -0.48], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]]);
/** Airborne coming up out of the ground: right knee up, left leg trailing. */
const RISING_LEGS: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, 0.2, 0.96] }, shinR: { dir: [-0.12, -0.9, 0.42] },
    thighL: { dir: [0.3, -0.9, -0.3] }, shinL: { dir: [0.15, -0.6, -0.78] },
  },
};

/**
 * Dig (burrow): a springy hop and a head-first dive into the ground, arms
 * overhead and blades together (dig: the dirt flies as it goes in, the tail
 * last), a trail of heaving dirt runs to the foe, then it bursts up under it
 * with a rising cut of the right blade, the tail trailing out of the ground
 * (impact as it breaks the surface), drops straight down in front of it, holds
 * the crouch and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.04,
  keys: [
    key(0),
    // Crouch, eyes on the ground ahead, forearms drawn back, the tail loading.
    key(0.12, pelvis(0, -0.09), bend(24, 7, 2, 18), ELBOWS_BACK, FOCUS, tail(16)),
    // Spring up and tip forward, the arms swinging overhead.
    key(0.22, advance(0.04), root({ y: 0.14, pitch: 35 }), TUCK, bend(4, 0, 0, 4), DIVE, ANGRY, tail(24)),
    key(0.3, advance(0.06), root({ y: 0.16, pitch: 75 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(20)),
    // Head and arms into the ground (dig), the body following, gathering speed.
    key(0.38, advance(0.07), root({ y: -0.05, pitch: 108 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(10)),
    fall(0.54, advance(0.1), root({ y: -1.3, pitch: 125 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(4)),
    // Underground (nothing to stand on): tunnel over to the foe, righting itself on the way,
    // and start up under it.
    key(0.7, advance(0.7), root({ y: -1.32, pitch: 60 }), DROP, bend(10, 3, 0, -2), BLADE_LOW, ANGRY, tail(-2)),
    key(0.8, advance(1), root({ y: -1.12, pitch: 20 }), DROP, pelvis(0, -0.06), bend(20, 6, 0, -8), BLADE_LOW, ANGRY, tail(-6)),
    // Burst up under the foe, the right blade cutting up through it, the tail trailing.
    snap(0.92, advance(1), root({ y: 0.24 }), RISING_LEGS, pelvis(0, 0.02), bend(-8, -6, -4, -16), twist(10), RISING_BLADE, ANGRY, tail(-40, 25)),
    key(1.04, advance(0.9), root({ y: 0.28 }), RISING_LEGS, pelvis(0, 0.02), bend(-10, -6, -4, -18), twist(12), RISING_BLADE, ANGRY, tail(-30, 15)),
    // Drop straight down in front of it and hold the crouch, the tail swishing.
    fall(1.2, advance(0.88), LAND, pelvis(0, -0.06), bend(20, 4, 0, -6), GUARD, ANGRY, tail(8, 10)),
    key(1.5, advance(0.88), pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY, tail(4, -8)),
    // Hop home.
    key(1.62, advance(0.44), root({ y: 0.07 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.74, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(2)),
    key(2.04, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'dig' }, { t: 0.85, name: 'impact' }],
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
 * Double Team, Agility (afterimage): low, springy darts from side to side,
 * leaning into each with the tail swinging out as a counterweight, in its
 * fighting stance (right claw raised, left forearm guarding); the afterimages
 * start at the aura and run 1.4 s (Agility's trail follows the darts). The
 * darts stay narrow and low, the feet tucked under: from our side a wider
 * dart to its right took the raised claw under our healthbox and a higher
 * hop the crest under the foe's; the foe's toes touch the top of ours.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.6,
  keys: [
    key(0),
    // Load onto its left foot to push off to the right.
    key(0.1, pelvis(0.02, -0.055), twist(0, -5), bend(10, 3, 0, -4), FOCUS, tail(6, 8)),
    // Zig-zagging back a little as it darts (a wild Sceptile's feet stay on our healthbox's edge).
    key(0.2, root({ x: -0.075, z: -0.015 }), DART(0.065), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.3, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(6, -16)),
    key(0.41, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.52, root({ x: 0.15, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(6, 16)),
    key(0.63, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.74, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(6, -16)),
    key(0.85, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.96, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(6, 16)),
    key(1.06, root({ x: 0.07, z: -0.025 }), DART(0.055), twist(0, 8), bend(3, 1, 0, -2), ANGRY, tail(10, -14)),
    key(1.16, LAND, ANGRY, tail(4, -6)),
    key(1.6, OPEN_EYES),
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
 * Fainting: reels, sways forward, its knees buckle and splay out and it sits
 * back on its heels in a low sprawl, then flops back onto its tail with the
 * head lolling onto its chest, and sinks into the ground. (Back over its
 * heels, knees out and arms hanging at its sides rather than slumped forward
 * over its feet: on its long neck a wild Sceptile's head, knees and claws came
 * down onto our healthbox.)
 */
const down = (y: number, back: number, sink = 0): Pose[] => [pelvis(0, y), root({ y: sink, z: -back }), LIMP, SHUT];
const faint: Clip = {
  name: 'faint',
  duration: 1.8,
  keys: [
    key(0),
    snap(0.12, root({ z: -0.04 }), bend(-14, -6, -6, -24), FLINCH, HURT, tail(10)),
    key(0.4, ...down(-0.04, 0.03), bend(10, 4, 6, 16), tail(-6)),
    // The knees buckle, splaying out: it sits back on its heels, the head drooping.
    key(0.72, ...down(-0.15, 0.1), SQUAT, bend(4, 2, 10, 20), tail(-8)),
    // Flops back onto its tail, the head lolling onto its chest.
    fall(0.9, ...down(-0.22, 0.18), SQUAT, bend(-18, -7, 14, 26, 0, 10), tail(-6)),
    key(1.0, ...down(-0.205, 0.18), SQUAT, bend(-16, -6, 13, 24, 0, 8), tail(-5)),
    key(1.12, ...down(-0.215, 0.18), SQUAT, bend(-18, -7, 14, 26, 0, 10), tail(-6)),
    fall(1.8, ...down(-0.215, 0.22, -1.1), SQUAT, bend(-18, -7, 14, 26, 0, 10), tail(-6)),
  ],
  events: [{ t: 0.9, name: 'thud' }],
};

export const SCEPTILE_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, entrance, hit, faint,
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
