// Sceptile's battle animation set: one clip per attack category (+ idle, intro,
// hit, faint) and the motif clips its moves need. Keys are STANCE + deltas
// (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (leaps, spins, sink)
//   plantFeet       foot IK weight (0 = the legs are free: airborne)
//   expression      eye atlas cell (open, angry, focus, half, happy, closed, hurt)
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, thud.
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
// motifs to clips. The battler turns toward its target only while a contact
// move carries it there (advance); on the spot, FACE turns the head and chest.

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
/** Turn the upper body and head from the stance's sideways look to face the foe. */
const FACE: Pose = { bones: { spine: { y: 12 }, neck: { z: -6 }, head: { y: 22, z: 2 } } };
/** Part of FACE: the head leads the turn over the anticipation instead of snapping round. */
const face = (f: number): Pose => ({ bones: { spine: { y: 12 * f }, neck: { z: -6 * f }, head: { y: 22 * f, z: 2 * f } } });
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
/** Hanging limp (faint). */
const LIMP = both([[-0.3, -0.95, 0.1], [-0.1, -0.95, 0.3], [-0.05, -0.95, 0.3]]);
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
    key(0, pelvis(0, -0.06), FACE, bend(18, 6, 4, 16), CROSSED, SHUT, tail(-8)),
    key(0.18, pelvis(0, -0.08), FACE, bend(22, 8, 6, 20), CROSSED, SHUT, tail(-12)),
    snap(0.38, pelvis(0, 0.015), FACE, bend(-12, -8, -8, -24), SPREAD, SPLAYED, jaw(32), ANGRY, tail(35)),
    key(0.58, pelvis(0, 0.012), FACE, bend(-11, -8, -8, -22, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(32)),
    key(0.78, pelvis(0, 0.014), FACE, bend(-12, -8, -8, -23, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(30)),
    key(0.96, pelvis(0, 0.008), FACE, bend(-8, -5, -4, -14), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.012), bend(6, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
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
    key(0.16, pelvis(0, -0.04), face(0.6), twist(-26), bend(8, 0, 0, -6, 14), BLADE_COCKED, FOCUS, tail(8, -12)),
    // Leap along an arc, legs tucked.
    key(0.28, advance(0.55), root({ y: 0.08 }), TUCK, FACE, twist(-30), bend(6, 0, 0, -6, 16), ANGRY, tail(14, -14),
      arms([[-0.55, 0.68, -0.48], [-0.15, 0.97, -0.2], [-0.05, 0.9, -0.43]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]])),
    // Land in front of the foe, knees taking the weight, the blade still cocked.
    key(0.38, advance(1), LAND, FACE, twist(-30), bend(12, 0, 0, -6, 15), BLADE_COCKED, ANGRY, tail(6, -12)),
    // Slash: the torso unwinds, the forearm sweeps down and across, blade leading.
    snap(0.45, advance(1), pelvis(0.012, -0.035), FACE, twist(26, -6), bend(20, 4, 0, -6, -8), ANGRY, tail(4, 22),
      arms([[0.45, -0.45, 0.77], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    // Follow-through: the blade carries on down past its left hip, then hangs there.
    key(0.6, advance(1), pelvis(0.014, -0.032), FACE, twist(32, -7), bend(22, 4, 0, -6, -10), ANGRY, tail(2, 28),
      arms([[0.6, -0.65, 0.45], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    key(0.76, advance(1), pelvis(0, -0.035), FACE, twist(8), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 8)),
    // Hop back home, the head easing back to its sideways look.
    key(0.9, advance(0.45), root({ y: 0.065 }), HOP, face(0.8), bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.02, advance(0), LAND, face(0.5), GUARD, ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
};

/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail, and Seismic Toss
 * and Mega Kick by fallback): coils with the tail up, springs in and turns
 * its back to the foe, hangs at the top of the arc with the tail reared high
 * over its head, whips it down on the foe, lands, and spins back round on the
 * hop home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.9,
  keys: [
    key(0),
    // Coil: deep crouch, tail lifting behind.
    key(0.24, pelvis(0, -0.08), FACE, bend(20, 6, 4, 10), BRACED, FOCUS, tail(30)),
    // Spring up and in, turning its back to the foe.
    key(0.4, advance(0.5), root({ y: 0.2, yaw: -80 }), TUCK, FACE, bend(4, 2, 0, -6), GUARD, ANGRY, tail(50)),
    // Top of the arc, back to the foe: the tail rears up over its head (a moving hold).
    key(0.52, advance(0.85), root({ y: 0.27, yaw: -172 }), TUCK, FACE, bend(-12, -4, 0, -12), SPREAD, ANGRY, tail(88)),
    key(0.62, advance(0.92), root({ y: 0.26, yaw: -180, pitch: -6 }), TUCK, FACE, bend(-14, -5, 0, -14), SPREAD, ANGRY, tail(96)),
    // Slam: the body tips away and the tail whips down onto the foe.
    snap(0.72, advance(1), root({ y: 0.1, yaw: -182, pitch: 16 }), DROP, FACE, bend(26, 8, 4, 8), BRACED, ANGRY, tail(-18)),
    // Land, deep in the knees, the tail on the foe.
    key(0.82, advance(1), root({ yaw: -182 }), LAND, pelvis(0, -0.03), FACE, bend(26, 8, 4, 10), BRACED, ANGRY, tail(-22)),
    key(1.0, advance(1), root({ yaw: -180 }), pelvis(0, -0.04), FACE, bend(12, 4, 2, 4), GUARD, ANGRY, tail(-4)),
    // Hop home, spinning back round to face the foe.
    key(1.18, advance(0.5), root({ y: 0.08, yaw: -290 }), HOP, FACE, bend(6, 2, 0, 0), GUARD, ANGRY, tail(12)),
    key(1.34, advance(0), root({ yaw: -360 }), LAND, FACE, GUARD, ANGRY, tail(4)),
    key(1.9, root({ yaw: -360 }), OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
};

/**
 * Bullet Seed (weak ranged from the mouth; Mud-Slap, and Snore by
 * fallback): a quick breath, then three pecks of the head, a seed each.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.25,
  keys: [
    key(0),
    // Breath in: chest up, head back, elbows back.
    key(0.2, pelvis(0, 0.012), face(0.8), bend(-8, -8, -8, -18), ELBOWS_BACK, ANGRY, tail(10)),
    // Three pecks: the head drives forward, jaw wide, and bobs back, each a little further in.
    snap(0.28, pelvis(0, -0.012, 0.026), FACE, bend(11, 6, 0, -4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.37, pelvis(0, -0.008, 0.016), FACE, bend(6, 3, -2, -10), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.45, pelvis(0, -0.014, 0.03), FACE, bend(12, 6, 0, -4, 4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.54, pelvis(0, -0.009, 0.018), FACE, bend(7, 3, -2, -10, 3), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.62, pelvis(0, -0.016, 0.034), FACE, bend(13, 7, 0, -4, -4), BRACED, jaw(34), ANGRY, tail(2)),
    // Recoil: the head bobs back up as the jaw closes.
    key(0.78, pelvis(0, -0.004, 0.008), FACE, bend(2, 1, -2, -14), BRACED, jaw(6), ANGRY, tail(7)),
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
    key(0.14, pelvis(0, -0.02), face(0.5), bend(4, 0, 0, 6)),
    // Soak up light: rise, face to the sky, arms open, eyes shut.
    key(0.5, pelvis(0, 0.018), FACE, bend(-12, -10, -12, -30), SPREAD, SPLAYED, SHUT, tail(25)),
    key(0.66, pelvis(0, 0.022), FACE, bend(-13, -11, -13, -32, 0, 2), SPREAD, SPLAYED, SHUT, tail(28)),
    key(0.8, pelvis(0, 0.02), FACE, bend(-13, -11, -13, -31, 0, -2), SPREAD, SPLAYED, SHUT, tail(27)),
    // Fire: the head drives forward at the foe, jaw wide; the body braces low.
    snap(0.92, pelvis(0, -0.04, 0.03), FACE, bend(14, 9, -2, -8), BRACED, jaw(36), ANGRY, tail(-5)),
    // Sustain: pushed back by the beam, trembling.
    key(1.12, pelvis(0, -0.035, 0.02), root({ z: -0.015 }), FACE, bend(12, 8, -2, -6, 3), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.32, pelvis(0, -0.038, 0.024), root({ z: -0.02 }), FACE, bend(13, 9, -2, -8, -3, -2), BRACED, jaw(36), ANGRY, tail(-5)),
    key(1.52, pelvis(0, -0.035, 0.02), root({ z: -0.022 }), FACE, bend(12, 8, -2, -6, 2, 1), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.7, pelvis(0, -0.036, 0.022), root({ z: -0.02 }), FACE, bend(12, 8, -2, -7), BRACED, jaw(33), ANGRY, tail(-4)),
    // The jaw shuts, the head comes up and shakes it off.
    key(1.88, pelvis(0, -0.015), root({ z: -0.01 }), FACE, bend(4, 2, 0, -6, 5), GUARD, jaw(4), ANGRY, tail(4)),
    key(2.02, pelvis(0, -0.008), bend(2, 1, 0, -3, -4), ANGRY, tail(2)),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.76, name: 'releaseEnd' }],
};

/**
 * Agility (self status; Double Team, Swords Dance): blurs from side to side
 * in three quick hops, leaning into each, lands centred and snaps its blades
 * up with an aura. Each hop peaks halfway across, so the body keeps flowing
 * through the air and only stops where it lands.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    // Crouch, the hips loading to its left to push off to the right.
    key(0.14, pelvis(-0.02, -0.05), face(0.7), twist(0, 4), bend(12, 4, 2, 6), GUARD, FOCUS, tail(6, -6)),
    key(0.25, root({ x: 0.09, y: 0.06 }), HOP, FACE, twist(0, -12), bend(8, 2, 0, 2), GUARD, FOCUS, tail(10, 20)),
    key(0.35, root({ x: 0.18 }), LAND, FACE, twist(0, -4), GUARD, FOCUS, tail(4, 14)),
    key(0.46, root({ x: 0.01, y: 0.065 }), HOP, FACE, twist(0, 12), bend(8, 2, 0, 2), GUARD, FOCUS, tail(10, -20)),
    key(0.57, root({ x: -0.17 }), LAND, FACE, twist(0, 4), GUARD, FOCUS, tail(4, -14)),
    key(0.67, root({ x: -0.08, y: 0.05 }), HOP, FACE, twist(0, -6), bend(6, 2, 0, 2), GUARD, FOCUS, tail(10, 10)),
    key(0.77, LAND, FACE, GUARD, FOCUS, tail(4)),
    // Pose: blades snapped up, chest out; a moving hold with a tremor.
    snap(0.88, pelvis(0, -0.01), FACE, bend(-6, -4, -4, -8), SPREAD, ANGRY, tail(20)),
    key(1.02, pelvis(0, -0.013), FACE, bend(-7, -4, -4, -9, 0, 1.5), SPREAD, ANGRY, tail(22)),
    key(1.16, pelvis(0, -0.01), FACE, bend(-6, -5, -4, -8, 0, -1.5), SPREAD, ANGRY, tail(21)),
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
    key(0.2, pelvis(0, 0.014), face(0.7), bend(-10, -7, -9, -18), CLAWS_UP, SPLAYED, ANGRY, tail(24)),
    snap(0.3, pelvis(0, -0.022, 0.035), FACE, bend(17, 9, 4, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.46, pelvis(0, -0.022, 0.035), FACE, bend(18, 10, 4, -4, 8, 4), CLAWS_OUT, SPLAYED, jaw(38), ANGRY, tail(12)),
    key(0.64, pelvis(0, -0.022, 0.032), FACE, bend(17, 10, 4, -4, -8, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.8, pelvis(0, -0.02, 0.03), FACE, bend(16, 9, 4, -4, 5, 2), CLAWS_OUT, jaw(32), ANGRY, tail(10)),
    key(0.96, pelvis(0, -0.01, 0.012), FACE, bend(6, 2, 0, -3), jaw(8), ANGRY, tail(4)),
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
    key(0.14, pelvis(0, -0.06), face(0.7), bend(18, 5, 0, -6), ELBOWS_BACK, FOCUS, tail(12)),
    key(0.24, advance(0.7), root({ y: 0.05, pitch: 16 }), TUCK, FACE, twist(14), bend(24, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(24)),
    snap(0.3, advance(1), root({ y: 0.03, pitch: 18 }), TUCK, FACE, twist(18), bend(25, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(22)),
    // Bounce off the foe.
    key(0.4, advance(0.84), root({ y: 0.06, pitch: 6 }), HOP, FACE, twist(6), bend(8, 2, 0, -6), GUARD, ANGRY, tail(14)),
    key(0.5, advance(0.78), LAND, FACE, bend(6, 2, 0, -2), GUARD, ANGRY, tail(6)),
    key(0.64, advance(0.35), root({ y: 0.06 }), HOP, face(0.8), GUARD, ANGRY, tail(10)),
    key(0.76, advance(0), LAND, face(0.5), GUARD, ANGRY, tail(2)),
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
    key(0.2, pelvis(0, -0.05), face(0.6), twist(-22), bend(12, 4, 0, -4, 8), FISTS, FOCUS, tail(10, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.32, advance(0.55), root({ y: 0.07 }), TUCK, FACE, twist(-30), bend(10, 4, 0, -6, 12), FISTS, ANGRY, tail(16, -10),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.42, advance(1), LAND, FACE, twist(-28), bend(14, 4, 0, -6, 12), FISTS, ANGRY, tail(8, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    // Punch: hips and shoulders turn into it, the fist drives straight out.
    snap(0.5, advance(1), pelvis(0, -0.03, 0.03), FACE, twist(26), bend(16, 6, 0, -6, -8), FISTS, ANGRY, tail(4, 18),
      arms([[-0.1, 0.02, 0.99], [-0.02, 0.05, 1], [0, 0.05, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.66, advance(1), pelvis(0, -0.032, 0.034), FACE, twist(30), bend(18, 6, 0, -6, -9), FISTS, ANGRY, tail(2, 22),
      arms([[-0.08, -0.04, 0.99], [0, -0.02, 1], [0.02, -0.02, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    key(0.82, advance(1), pelvis(0, -0.035), FACE, twist(6), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 6)),
    key(0.96, advance(0.45), root({ y: 0.065 }), HOP, face(0.8), bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.08, advance(0), LAND, face(0.5), GUARD, ANGRY, tail(2)),
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
    key(0.2, pelvis(0, -0.07), FACE, bend(14, 4, 0, -8), BLADES_HIGH, FOCUS, tail(12)),
    key(0.36, advance(0.55), root({ y: 0.16 }), TUCK, FACE, bend(-6, -2, 0, -12), BLADES_HIGH, ANGRY, tail(30)),
    key(0.5, advance(0.9), root({ y: 0.12 }), TUCK, FACE, bend(-8, -3, 0, -14), BLADES_HIGH, ANGRY, tail(34)),
    // X-slash: both forearms cut down and across on the way down.
    snap(0.57, advance(1), root({ y: 0.03 }), DROP, FACE, bend(24, 8, 2, 0), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.64, advance(1), LAND, pelvis(0, -0.035), FACE, bend(26, 8, 2, 2), BLADES_CROSSED, ANGRY, tail(-10)),
    key(0.82, advance(1), pelvis(0, -0.07), FACE, bend(25, 8, 2, 2, 0, 2), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.98, advance(1), pelvis(0, -0.035), FACE, bend(12, 2, 0, -2), GUARD, ANGRY, tail(4)),
    key(1.12, advance(0.45), root({ y: 0.065 }), HOP, FACE, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.24, advance(0), LAND, FACE, GUARD, ANGRY, tail(2)),
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
    key(0.2, pelvis(0, -0.045), FACE, bend(14, 4, 2, 6), CROSSED_LOW, FOCUS, tail(8)),
    snap(0.3, pelvis(0, -0.02, 0.02), FACE, bend(-4, -4, -2, -8), both([[-0.8, 0.1, 0.6], [-0.7, 0.2, 0.7], [-0.6, 0.3, 0.75]]), SPLAYED, ANGRY, tail(20)),
    key(0.46, pelvis(0, -0.022, 0.018), FACE, bend(-5, -4, -2, -9), both([[-0.9, 0.05, 0.42], [-0.85, 0.1, 0.5], [-0.8, 0.2, 0.55]]), SPLAYED, ANGRY, tail(22)),
    key(0.66, pelvis(0, -0.02), FACE, bend(4, 1, 0, -2), GUARD, ANGRY, tail(8)),
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
    key(0.16, pelvis(0, -0.03), face(0.7), bend(8, 2, 0, 6), BRACED, FOCUS, tail(4)),
    snap(0.3, pelvis(0, -0.045), FACE, bend(6, 2, 0, 4), CROSSED, FOCUS, tail(12)),
    key(0.46, pelvis(0, -0.05), FACE, bend(7, 2, 0, 5, 0, 1), CROSSED, FOCUS, tail(13)),
    key(0.84, pelvis(0, -0.058), FACE, bend(10, 3, 1, 7, 0, -1), CROSSED, FOCUS, tail(16)),
    key(1.08, pelvis(0, -0.02), FACE, bend(4, 1, 0, 0), GUARD, ANGRY, tail(4)),
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
    key(0.3, pelvis(0, 0.012), FACE, bend(-10, -8, -12, -26), PALMS_UP, SHUT, tail(15)),
    key(0.56, pelvis(0.006, 0.014), FACE, bend(-11, -8, -12, -28, 0, 5), PALMS_UP, SHUT, tail(17, 6)),
    key(0.86, pelvis(-0.006, 0.014), FACE, bend(-11, -8, -12, -28, 0, -5), PALMS_UP, SHUT, tail(17, -6)),
    key(1.14, pelvis(0.003, 0.013), FACE, bend(-10, -8, -12, -27, 0, 3), PALMS_UP, SHUT, tail(16, 3)),
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
    key(0.2, pelvis(0, -0.022, 0.024), FACE, bend(14, 6, 0, -6), REACH, SPLAYED, ANGRY, tail(6)),
    key(0.34, pelvis(0, -0.024, 0.026), FACE, bend(15, 6, 0, -6), REACH, FISTS, ANGRY, tail(8)),
    // Pull the energy in: claws to the chest, back arched, eyes shut.
    key(0.56, pelvis(0, 0.008, -0.012), FACE, bend(-10, -7, -6, -18), CROSSED_LOW, FISTS, SHUT, tail(20)),
    key(0.8, pelvis(0, 0.01, -0.012), FACE, bend(-11, -7, -6, -19, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(22)),
    key(1.0, pelvis(0, 0.008, -0.01), FACE, bend(-10, -7, -6, -18, 0, -2), CROSSED_LOW, SHUT, tail(20)),
    key(1.16, pelvis(0, -0.01), bend(2, 0, 0, -2), OPEN_EYES, tail(6)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'release' }],
};

/** Leer (glare; Swagger, Attract, Flash, Mimic): leans in, head low and forward, and stares the foe down with narrowed eyes. */
const statusTargetGlare: Clip = {
  name: 'status_target_glare',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.035, 0.026), face(0.7), bend(16, 6, 10, 14), ANGRY, tail(4)),
    key(0.34, pelvis(0, -0.04, 0.03), FACE, bend(17, 6, 11, 16, 0, 4), ANGRY, tail(5)),
    key(0.62, pelvis(0, -0.046, 0.04), FACE, bend(19, 7, 12, 17, 4, 8), ANGRY, tail(7)),
    key(0.84, pelvis(0, -0.044, 0.036), FACE, bend(18, 6, 11, 16, -2, 5), ANGRY, tail(5)),
    key(1.02, pelvis(0, -0.012), bend(4, 1, 0, 2), ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/** Earthquake (quake): crouches, leaps straight up with the arms flung wide, and stomps down hard; the ground shakes. */
const physicalStrongQuake: Clip = {
  name: 'physical_strong_quake',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.08), face(0.7), bend(18, 6, 0, 6), BRACED, FOCUS, tail(10)),
    key(0.38, root({ y: 0.19 }), HOP, FACE, bend(-8, -4, -4, -12), SPREAD, ANGRY, tail(35)),
    // Top of the leap: a moment's hang, the legs reaching down.
    key(0.47, root({ y: 0.225 }), DROP, FACE, bend(-5, -3, -3, -9), SPREAD, ANGRY, tail(36)),
    // Stomp: falls from the top, accelerating into a deep landing, arms driven
    // down; the knees keep sinking after touchdown (the root dips below the
    // ground line with the feet pinned) instead of stopping dead.
    fall(0.62, LAND, pelvis(0, -0.06), FACE, bend(16, 6, 2, 8), BRACED, ANGRY, tail(-12)),
    key(0.7, root({ y: -0.025 }), LAND, pelvis(0, -0.07), FACE, bend(24, 8, 4, 12, 0, 1), BRACED, ANGRY, tail(-15)),
    key(0.8, root({ y: -0.02 }), pelvis(0, -0.07), FACE, bend(25, 8, 4, 13, 0, 2), BRACED, ANGRY, tail(-14)),
    key(0.98, root({ y: -0.008 }), pelvis(0, -0.06), FACE, bend(14, 4, 2, 6), BRACED, ANGRY, tail(-4)),
    key(1.24, pelvis(0, -0.02), face(0.5), bend(5, 1, 0, 2), ANGRY, tail(2)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

/** Taking a hit: snaps back and winces (the battler adds a sprung recoil), then shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, bend(-14, -6, -6, -18), FLINCH, HURT, tail(12)),
    key(0.2, bend(-6, -2, -2, -8), HURT, tail(6)),
    key(0.36, bend(4, 1, 0, 4), HURT, tail(-2)),
    key(0.6, OPEN_EYES),
  ],
};

/** Fainting: reels, sways forward, knees buckle, slumps with the tail dropping, then sinks into the ground. */
const down = (y: number, sink = 0): Pose[] => [pelvis(0, y), root({ y: sink, z: -0.02 }), LIMP, SHUT];
const faint: Clip = {
  name: 'faint',
  duration: 1.8,
  keys: [
    key(0),
    snap(0.12, root({ z: -0.04 }), bend(-14, -6, -6, -24), FLINCH, HURT, tail(10)),
    key(0.4, ...down(-0.04), bend(10, 4, 6, 16), tail(-6)),
    key(0.72, ...down(-0.16), bend(30, 8, 8, 26), tail(-12)),
    fall(0.9, ...down(-0.21), bend(42, 10, 8, 32), tail(-16)),
    key(1.0, ...down(-0.195), bend(40, 10, 8, 30), tail(-15)),
    key(1.12, ...down(-0.205), bend(42, 10, 8, 32), tail(-16)),
    fall(1.8, ...down(-0.205, -1.1), bend(42, 10, 8, 32), tail(-16)),
  ],
  events: [{ t: 0.9, name: 'thud' }],
};

export const SCEPTILE_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    physicalWeakTackle, physicalStrongPunch, physicalStrongStrike, physicalStrongQuake,
    specialWeakThrow, specialWeakDrain, statusSelfShield, statusSelfHeal, statusTargetGlare,
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
