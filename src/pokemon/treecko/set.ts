// Treecko's battle animation set: Sceptile's first clips
// (src/pokemon/sceptile/first.ts), key for key, re-posed on Treecko's stance,
// rig and proportions and re-timed for its size. One clip per action (the
// moments, the category clips and a clip per motif its moves take); every
// move of the same action plays the same clip (index.ts maps the motifs).
// Keys are STANCE + deltas (see compose()), written out and tuned by eye.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     offset/rotation of the whole body, in its heights (leaps, spins;
//            root.z is always toward the foe, whatever root.yaw does)
//   plantFeet       foot IK weight (0 = the legs are free: airborne)
//   expression      eye atlas cell (open, angry, focus, half, happy, closed, hurt)
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a toss carries
// the foe between them), dig (a burrow goes under).
//
// Treecko is a small wood gecko (0.5 m, 5 kg), quick and cocky. Next to
// Sceptile:
//   - its weapons are its big three-fingered hands (Pound is a slap, a chop
//     comes down with both hands, a punch is the hand curled shut), its fat
//     leaf tail (Slam, Iron Tail, Mud Sport's flick) and its whole body; it
//     has no leaf blades;
//   - its legs are half as long for its height (hips at 0.19 of it, not
//     0.39), so crouches, coils and landings sink about 0.6 as far to bend
//     the knees as deep;
//   - its arms are short and its huge head sits between its shoulders:
//     hands raised go up beside the head, never over it, and at the foe the
//     body drives in (a twist, a lean) behind the part that strikes: the
//     hand, the heel, the jaws, the head or the tail leads at every impact;
//   - its stance's front is its outstretched fingertips, so where advance 1
//     stops that front a fixed gap short of the foe's, a contact clip's
//     travel carries a forward shift that rises with it (root.z = k x
//     advance, k per clip) to bring the part that strikes onto the foe's
//     body. Where the engine instead sweeps the impact pose toward the foe
//     until it touches, it measures that pose with the shift in it, so there
//     the shift changes nothing;
//   - it is small and quick: the beats run about 0.9 of Sceptile's, the
//     leaps spring a little higher for its size;
//   - the huge head tips back only a little (tipped far, it turns into a
//     ball from behind), and when the hips drop the tail lifts at its root,
//     so it lies along the ground instead of sinking into it.
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is a few
// pixels above our Treecko's head and ours is to its right, so arms open
// wide rather than overhead; a wild Treecko's long toes are near the top of
// ours, so at home it leans with the spine rather than shifting its hips.

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
const advance = (a: number): Pose => ({ advance: a });
/** Spine chain pitch (x) from hips to head (one short neck bone), with head turn (+y: to its left) and tilt (+z: to its right). */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** Torso twist (+ turns the chest to its left, bringing the right shoulder forward) and lean (+z: to its right). */
const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y: y * 0.6, z }, chest: { y: y * 0.4 } } });
/**
 * The leaf tail: lift (+ raises it) and sweep (+ swings it toward its right),
 * spread along the chain. The stance sweeps it about 44° round to its left:
 * sweep 40 brings it straight out behind.
 */
const tail = (lift: number, sweep = 0): Pose => ({
  bones: {
    tail: { x: lift * 0.3, y: sweep * 0.3 },
    tail2: { x: lift * 0.2, y: sweep * 0.2 },
    tail3: { x: lift * 0.2, y: sweep * 0.2 },
    tail4: { x: lift * 0.15, y: sweep * 0.15 },
    tail5: { x: lift * 0.15, y: sweep * 0.15 },
  },
});

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
type Arm = [arm: Vec3, forearm: Vec3, hand: Vec3];
/**
 * Both arms: [arm, forearm, hand] directions for the right arm and the left
 * arm. The hands keep the stance's twist (palms turned up and open) unless
 * given another.
 */
const arms = (r: Arm, l: Arm, twistR = -70, twistL = 70): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1] }, handR: { dir: r[2], twist: twistR },
    armL: { dir: l[0] }, forearmL: { dir: l[1] }, handL: { dir: l[2], twist: twistL },
  },
});
/** The same pose on both arms (given for the right arm, mirrored to the left). */
const both = (r: Arm, twistR = -70): Pose => arms(r, [mirror(r[0]), mirror(r[1]), mirror(r[2])], twistR, -twistR);
/** The right arm alone (the left keeps the stance's, or the key's). */
const rightArm = (r: Arm, twistR = -70): Pose => ({ aim: { armR: { dir: r[0] }, forearmR: { dir: r[1] }, handR: { dir: r[2], twist: twistR } } });

/** Guard: both hands up in front, wide, palms to the foe. */
const GUARD = both([[-0.75, -0.15, 0.64], [-0.35, 0.55, 0.76], [-0.3, 0.8, 0.52]]);
/** Forearms crossed in front of the face, hands up and open (an X). */
const CROSSED = arms([[-0.3, 0.3, 0.9], [0.6, 0.6, 0.53], [0.5, 0.78, 0.38]], [[0.3, 0.3, 0.9], [-0.6, 0.64, 0.48], [-0.5, 0.82, 0.28]]);
/** Forearms crossed low in front of the belly (gathering, wind-ups, hugging itself). */
const CROSSED_LOW = arms([[-0.35, -0.6, 0.72], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]], [[0.35, -0.6, 0.72], [-0.75, 0.12, 0.65], [-0.7, 0.28, 0.66]]);
/** Arms flung up wide in a V, hands open (its sprite's second frame): wide, not overhead. */
const SPREAD = both([[-0.85, 0.42, 0.32], [-0.5, 0.82, 0.28], [-0.35, 0.9, 0.25]]);
/** Braced for a blast: arms low and back at the sides. */
const BRACED = both([[-0.5, -0.78, -0.36], [-0.3, -0.55, 0.78], [-0.2, -0.35, 0.92]]);
/** Drawing breath / rearing: elbows pulled back, chest open. */
const ELBOWS_BACK = both([[-0.6, -0.4, -0.7], [-0.25, 0.1, 0.96], [-0.1, 0.25, 0.96]]);
/** Arms swept right back for a head-first dash (its big hands would lead the head in front). */
const ARMS_BACK = both([[-0.35, -0.5, -0.8], [-0.25, -0.35, -0.9], [-0.2, -0.25, -0.95]]);
/** Hands raised beside the head, fingers splayed (Screech's nails on a slate). */
const CLAWS_UP = both([[-0.72, 0.35, 0.6], [-0.35, 0.88, 0.32], [-0.2, 0.96, 0.18]]);
/** Hands thrust at the foe, fingers splayed. */
const CLAWS_OUT = both([[-0.5, 0.05, 0.86], [-0.3, 0.25, 0.92], [-0.2, 0.4, 0.9]]);
/** Both big hands reaching wide at the foe, open (raised: straight at the foe they foreshorten from both views). */
const REACH = both([[-0.7, 0.28, 0.66], [-0.5, 0.42, 0.76], [-0.4, 0.5, 0.77]]);
/** Arms open to the sky, palms up (basking). */
const PALMS_UP = both([[-0.86, 0.2, 0.47], [-0.62, 0.55, 0.56], [-0.45, 0.8, 0.4]]);
/** Taking a hit: the arms thrown up and out, hands open. */
const FLINCH = arms([[-0.8, 0.15, 0.58], [-0.5, 0.55, 0.67], [-0.3, 0.75, 0.59]], [[0.78, 0.02, 0.62], [0.45, 0.45, 0.77], [0.25, 0.65, 0.72]]);
/** Worn out: the arms hanging low. */
const DROOP = both([[-0.6, -0.76, 0.24], [-0.32, -0.88, 0.35], [-0.22, -0.88, 0.42]]);

/** The fingers curled shut. */
const FISTS: Pose = {
  bones: { fingerAR: { z: 55 }, fingerBR: { z: 55 }, fingerCR: { z: 55 }, fingerAL: { z: -55 }, fingerBL: { z: -55 }, fingerCL: { z: -55 } },
};
/** The fingers spread wide. */
const SPLAYED: Pose = {
  bones: { fingerAR: { y: 14, z: -10 }, fingerCR: { y: -14, z: -10 }, fingerAL: { y: -14, z: 10 }, fingerCL: { y: 14, z: 10 } },
};

// The slap (Pound): the right hand, palm first.
/** The left hand forward and up, guarding, while the right acts. */
const GUARD_L: Arm = [[0.75, -0.15, 0.64], [0.35, 0.55, 0.76], [0.3, 0.8, 0.52]];
/** The left arm swung back and out low as the right one strikes (a counterweight). */
const BACK_L: Arm = [[0.7, -0.45, -0.55], [0.4, -0.2, 0.89], [0.3, 0.2, 0.93]];
/**
 * The right hand raised high and out beside its head, fingers open, the left
 * guarding: the slap's wind-up (out to the side, it shows past the big head
 * from behind).
 */
const SLAP_COCKED = arms([[-0.9, 0.36, -0.24], [-0.62, 0.76, -0.2], [-0.45, 0.88, -0.15]], GUARD_L);
/** ...drawn back a little further in the leap. */
const SLAP_COCKED_HIGH = arms([[-0.88, 0.42, -0.22], [-0.58, 0.79, -0.2], [-0.42, 0.9, -0.13]], GUARD_L);
/**
 * The slap: the right arm swung round at head height, the hand sweeping in
 * across the foe's face from its right, palm first; the left swung back.
 */
const SLAP = arms([[-0.45, 0.26, 0.86], [-0.05, 0.2, 0.98], [0.32, 0.12, 0.94]], BACK_L);
/** ...carried on across and down past its left hip. */
const SLAP_THROUGH = arms([[0.3, -0.25, 0.92], [0.75, -0.3, 0.59], [0.85, -0.4, 0.34]], BACK_L);

// The two-handed chop (Brick Break, Crush Claw).
/** Both hands raised high beside the head (beside it, never over it). */
const HANDS_HIGH = both([[-0.8, 0.55, -0.24], [-0.3, 0.92, -0.25], [-0.2, 0.9, -0.4]]);
/** Both hands chopped forward and down onto the foe, converging on it. */
const HANDS_CHOP = both([[-0.22, 0.08, 0.97], [0.15, -0.25, 0.96], [0.25, -0.6, 0.76]], 20);
/** ...driving on down through it as it lands. */
const HANDS_CHOP_LOW = both([[-0.18, -0.08, 0.98], [0.2, -0.38, 0.9], [0.28, -0.68, 0.68]], 20);
/** ...carried on down: the forearms cross low in front. */
const HANDS_CROSSED = both([[0.2, -0.5, 0.84], [0.7, -0.55, 0.45], [0.75, -0.55, 0.35]], 20);

// The punch: the hand curled shut.
/** The right fist chambered at the hip, the left hand up guarding. */
const PUNCH_CHAMBER = arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.62, -0.25, 0.74], [0.25, 0.65, 0.72], [0.2, 0.9, 0.4]]);
/** The left fist pulled back to the hip as the right drives out. */
const FIST_HIP_L: Arm = [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]];
/** The punch: the right fist driven straight out at the foe's face (rising a little: straight at the camera it foreshortens into the body). */
const PUNCH = arms([[-0.1, 0.22, 0.97], [-0.02, 0.25, 0.97], [0, 0.25, 0.97]], FIST_HIP_L);
const PUNCH_HOLD = arms([[-0.08, 0.18, 0.98], [0, 0.2, 0.98], [0.02, 0.2, 0.98]], FIST_HIP_L);

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
 * lifts both feet level, just where they stood (freed, the long flat feet
 * would swing forward, and a wild Treecko's toes are near our healthbox).
 */
const DART = (lift: number): Pose => ({ root: { y: lift }, pelvis: { y: -0.4 * lift } });
/** Airborne with the legs reaching down for the ground (the stance's legs, feet free). */
const DROP: Pose = { plantFeet: 0 };
/** Landing: knees absorb the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.03 }, bones: { spine: { x: 8 }, head: { x: -5 } } };
/** Landing home from a hop: the torso upright, so the settle to the stance is small. */
const LIGHT: Pose = bend(-3, 0, 0, 3);
/**
 * Knees pushed out wide to the sides, a sumo's squat: in a deep crouch the
 * foot IK folds the legs outward and up, the feet kept where they stand.
 */
const SQUAT: Pose = {
  aim: {
    thighR: { dir: [-0.85, -0.45, 0.27] }, shinR: { dir: [0.3, -0.9, -0.3] },
    thighL: { dir: [0.85, -0.45, 0.27] }, shinL: { dir: [-0.3, -0.9, -0.3] },
  },
};

// Clips -----------------------------------------------------------------------

/** Breathing in its crouch; the leaf tail sways a little (its spring carries the rest). */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.005), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }, tail(3, 8)),
    key(2.4),
  ],
};

/**
 * Sent out: curled up behind its crossed arms with the eyes shut, it springs
 * up into its cry with the arms flung up wide and the hands open (its
 * sprite's second frame), the tail raised, and settles into its stance.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, pelvis(0, -0.036), bend(18, 6, 4, 12), CROSSED_LOW, SHUT, tail(4)),
    key(0.18, pelvis(0, -0.048), bend(22, 7, 5, 15), CROSSED_LOW, SHUT, tail(2)),
    snap(0.38, pelvis(0, 0.02), bend(-8, -5, -3, -6), SPREAD, SPLAYED, jaw(32), ANGRY, tail(34)),
    key(0.58, pelvis(0, 0.016), bend(-7, -5, -3, -5, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(31)),
    key(0.78, pelvis(0, 0.018), bend(-8, -5, -3, -6, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(29)),
    key(0.96, pelvis(0, 0.01), bend(-4, -3, -1, -3), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.008), bend(4, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
};

/**
 * Pound (weak strikes: Cut, Rock Smash, Aerial Ace, Fury Cutter): Sceptile's
 * Leaf Blade on Treecko's hand. The right hand cocked high beside its head, a
 * quick leap in along an arc, and a slap down onto the foe's head as the
 * torso unwinds, palm first; the hand carries through past its hip, then it
 * hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.15,
  keys: [
    key(0),
    // Wind up: crouch, right shoulder back, the hand raised high beside its head; the head stays on the foe.
    key(0.15, pelvis(0, -0.025), twist(-26), bend(8, 0, 0, -4, 20), SLAP_COCKED, FOCUS, tail(8, -12)),
    // Leap along an arc, legs tucked.
    key(0.26, advance(0.55), root({ y: 0.1, z: 0.028 }), TUCK, twist(-30), bend(6, 0, 0, -6, 23), SLAP_COCKED_HIGH, ANGRY, tail(14, -14)),
    // Land in front of the foe, knees taking the weight, the hand still up.
    key(0.35, advance(1), root({ z: 0.05 }), LAND, twist(-30), bend(12, 0, 0, -6, 22), SLAP_COCKED, ANGRY, tail(8, -12)),
    // The slap: the torso unwinds, the hand swings down onto the foe's head, palm first.
    snap(0.415, advance(1), root({ z: 0.05 }), pelvis(0.01, -0.028, 0.02), twist(26, -6), bend(22, 5, 0, -6, -8), SLAP, SPLAYED, ANGRY, tail(6, 22)),
    // Follow-through: the hand carries on down past its left hip, then hangs there.
    key(0.55, advance(1), root({ z: 0.05 }), pelvis(0.012, -0.028, 0.02), twist(32, -7), bend(24, 5, 0, -6, -10), SLAP_THROUGH, ANGRY, tail(6, 28)),
    key(0.68, advance(1), root({ z: 0.05 }), pelvis(0, -0.026), twist(8), bend(12, 2, 0, -2), GUARD, ANGRY, tail(6, 8)),
    // Hop home.
    key(0.8, advance(0.45), root({ y: 0.075, z: 0.022 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(0.91, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.47, name: 'impact' }],
};

/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail): coils with the
 * tail up, springs in high and turns its back to the foe, hangs at the top of
 * the arc with the fat leaf tail reared over its head, whips it down on the
 * foe, lands, and spins back round on the hop home. Its tail is short next to
 * Sceptile's, so it comes down right at the foe (root.z) for the tail to land
 * on it.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.75,
  keys: [
    key(0),
    // Coil: deep crouch, tail lifting behind and straightening out.
    key(0.22, pelvis(0, -0.05), bend(20, 6, 4, 8), BRACED, FOCUS, tail(30, 20)),
    // Spring up and in, turning its back to the foe.
    key(0.37, advance(0.5), root({ y: 0.22, z: 0.155, yaw: -80 }), TUCK, bend(4, 2, 0, -6), GUARD, ANGRY, tail(50, 30)),
    // Top of the arc, back to the foe: the tail rears up over its head (a moving hold).
    key(0.48, advance(0.85), root({ y: 0.3, z: 0.265, yaw: -172 }), TUCK, bend(-12, -4, 0, -10), SPREAD, ANGRY, tail(88, 40)),
    key(0.57, advance(0.92), root({ y: 0.29, z: 0.285, yaw: -180, pitch: -6 }), TUCK, bend(-14, -5, 0, -12), SPREAD, ANGRY, tail(96, 42)),
    // Slam: the body tips away and the tail whips down onto the foe.
    snap(0.66, advance(1), root({ y: 0.1, z: 0.31, yaw: -182, pitch: 16 }), DROP, bend(26, 8, 4, 8), BRACED, ANGRY, tail(-18, 44)),
    // Land, deep in the knees, the tail on the foe.
    key(0.75, advance(1), root({ z: 0.31, yaw: -182 }), LAND, pelvis(0, -0.018), bend(26, 8, 4, 10), BRACED, ANGRY, tail(-8, 44)),
    key(0.92, advance(1), root({ z: 0.31, yaw: -180 }), pelvis(0, -0.025), bend(12, 4, 2, 4), GUARD, ANGRY, tail(4, 30)),
    // Hop home, spinning back round to face the foe.
    key(1.08, advance(0.5), root({ y: 0.09, z: 0.155, yaw: -290 }), HOP, bend(6, 2, 0, 0), GUARD, ANGRY, tail(12, 10)),
    key(1.23, advance(0), root({ yaw: -360 }), LAND, GUARD, ANGRY, tail(6)),
    key(1.75, root({ yaw: -360 }), OPEN_EYES),
  ],
  // The tail lands on the foe as its tip (which trails the body by 0.1 s) comes down.
  events: [{ t: 0.77, name: 'impact' }],
};

/**
 * Bullet Seed (weak ranged from the mouth; Snore, and Toxic and Leech Seed
 * spat from it): a quick breath, then three pecks of the big head, a seed
 * each.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.15,
  keys: [
    key(0),
    // Breath in: chest up, head back a little, elbows back.
    key(0.19, pelvis(0, 0.008), bend(-8, -8, -6, -8), ELBOWS_BACK, ANGRY, tail(10)),
    // Three pecks: the head drives forward, jaw wide, and bobs back, each a little further in.
    snap(0.26, pelvis(0, -0.008, 0.003), bend(13, 7, 2, -2), BRACED, jaw(32), ANGRY, tail(4)),
    key(0.34, pelvis(0, -0.005, 0.002), bend(7, 4, 0, -7), BRACED, jaw(12), ANGRY, tail(7)),
    snap(0.42, pelvis(0, -0.009, 0.003), bend(14, 7, 2, -2, 4), BRACED, jaw(32), ANGRY, tail(4)),
    key(0.5, pelvis(0, -0.006, 0.002), bend(8, 4, 0, -7, 3), BRACED, jaw(12), ANGRY, tail(7)),
    snap(0.58, pelvis(0, -0.01, 0.003), bend(16, 8, 2, -2, -4), BRACED, jaw(34), ANGRY, tail(4)),
    // Recoil: the head bobs back up as the jaw closes.
    key(0.72, pelvis(0, -0.003, 0.001), bend(3, 1, -1, -9), BRACED, jaw(6), ANGRY, tail(8)),
    key(0.89, pelvis(0, -0.002), bend(2, 1, 0, -2), jaw(0), ANGRY, tail(3)),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'release' }, { t: 0.48, name: 'release' }, { t: 0.64, name: 'release' }],
};

/**
 * Solar Beam (strong ranged; Hidden Power): it lifts its face to the sun
 * with the arms flung up in its V, soaking up light, then braces low and
 * fires the beam from its mouth, holding against the recoil.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.2,
  keys: [
    key(0),
    key(0.13, pelvis(0, -0.014), bend(4, 0, 0, 5)),
    // Soak up light: rise, face lifted, arms open, eyes shut.
    key(0.46, pelvis(0, 0.012), bend(-10, -8, -6, -12), SPREAD, SPLAYED, SHUT, tail(25)),
    key(0.61, pelvis(0, 0.015), bend(-11, -9, -6, -13, 0, 2), SPREAD, SPLAYED, SHUT, tail(28)),
    key(0.74, pelvis(0, 0.013), bend(-11, -9, -6, -12, 0, -2), SPREAD, SPLAYED, SHUT, tail(27)),
    // Fire: the head drives forward at the foe, jaw wide; the body braces low.
    snap(0.85, pelvis(0, -0.028, 0.004), bend(16, 10, 0, -6), BRACED, jaw(36), ANGRY, tail(4)),
    // Sustain: pushed back by the beam, trembling.
    key(1.03, pelvis(0, -0.024, 0.003), root({ z: -0.015 }), bend(14, 8, 0, -4, 3), BRACED, jaw(34), ANGRY, tail(5)),
    key(1.22, pelvis(0, -0.026, 0.003), root({ z: -0.02 }), bend(15, 9, 0, -6, -3, -2), BRACED, jaw(36), ANGRY, tail(4)),
    key(1.4, pelvis(0, -0.024, 0.003), root({ z: -0.022 }), bend(14, 8, 0, -4, 2, 1), BRACED, jaw(34), ANGRY, tail(5)),
    key(1.57, pelvis(0, -0.025, 0.003), root({ z: -0.02 }), bend(14, 8, 0, -5), BRACED, jaw(33), ANGRY, tail(4)),
    // The jaw shuts, the head comes up and shakes it off.
    key(1.73, pelvis(0, -0.01), root({ z: -0.01 }), bend(4, 2, 0, -5, 5), GUARD, jaw(4), ANGRY, tail(6)),
    key(1.86, pelvis(0, -0.005), bend(2, 1, 0, -2, -4), ANGRY, tail(3)),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.11, name: 'charge' }, { t: 0.91, name: 'release' }, { t: 1.63, name: 'releaseEnd' }],
};

/**
 * Swords Dance (self status; Sleep Talk): blurs from side to side in three
 * quick hops, leaning into each, lands centred and snaps its arms up in its
 * V with an aura. Each hop peaks halfway across, so the body keeps flowing
 * through the air and only stops where it lands; the hops stay low and
 * narrow, zig-zagging back a little (clear of the healthboxes).
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.45,
  keys: [
    key(0),
    // Crouch, the hips loading to its left to push off to the right.
    key(0.13, pelvis(-0.012, -0.03), twist(0, 4), bend(12, 4, 2, 5), GUARD, FOCUS, tail(8, -6)),
    key(0.23, root({ x: 0.07, z: -0.025 }), DART(0.06), twist(0, -12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 20)),
    key(0.32, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -4), GUARD, FOCUS, tail(6, 14)),
    key(0.42, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, 12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, -20)),
    key(0.52, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 4), GUARD, FOCUS, tail(6, -14)),
    key(0.61, root({ x: -0.075, z: -0.015 }), DART(0.055), twist(0, -6), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 10)),
    key(0.7, LAND, GUARD, FOCUS, tail(6)),
    // Pose: the arms snapped up in its V, chest out; a moving hold with a tremor.
    snap(0.8, pelvis(0, -0.006), bend(-6, -4, -3, -5), SPREAD, SPLAYED, ANGRY, tail(20)),
    key(0.93, pelvis(0, -0.009), bend(-7, -4, -3, -6, 0, 1.5), SPREAD, SPLAYED, ANGRY, tail(22)),
    key(1.06, pelvis(0, -0.006), bend(-6, -5, -3, -5, 0, -1.5), SPREAD, ANGRY, tail(21)),
    key(1.19, pelvis(0, -0.013), bend(4, 2, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'aura' }],
};

/**
 * Screech (status at the foe): rears up with its hands raised by its head,
 * fingers splayed, then lunges the head forward and screeches, hands out,
 * the head shaking.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.3,
  keys: [
    key(0),
    key(0.19, pelvis(0, 0.01), bend(-10, -7, -5, -8), CLAWS_UP, SPLAYED, ANGRY, tail(24)),
    snap(0.28, pelvis(0, -0.015, 0.003), bend(20, 10, 4, -2), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(10)),
    key(0.43, pelvis(0, -0.015, 0.003), bend(21, 11, 4, -2, 8, 4), CLAWS_OUT, SPLAYED, jaw(38), ANGRY, tail(13)),
    key(0.6, pelvis(0, -0.015, 0.003), bend(20, 11, 4, -2, -8, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(10)),
    key(0.75, pelvis(0, -0.013, 0.003), bend(19, 10, 4, -2, 5, 2), CLAWS_OUT, jaw(32), ANGRY, tail(11)),
    key(0.9, pelvis(0, -0.007, 0.001), bend(7, 2, 0, -2), jaw(8), ANGRY, tail(5)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'emit' }],
};

/**
 * Quick Attack (tackle; Pursuit, Double-Edge, Return...): a blur-fast low
 * dash with its big head and right shoulder leading, arms swept right back
 * (its big hands would lead in Sceptile's elbows-back), a bounce off the foe
 * and a hop home.
 */
const physicalWeakTackle: Clip = {
  name: 'physical_weak_tackle',
  duration: 0.98,
  keys: [
    key(0),
    key(0.15, pelvis(0, -0.04), bend(18, 5, 0, -4), ELBOWS_BACK, FOCUS, tail(12)),
    key(0.24, advance(0.7), root({ y: 0.06, z: 0.37, pitch: 16 }), TUCK, twist(14), bend(24, 6, 0, -10), ARMS_BACK, ANGRY, tail(24)),
    snap(0.3, advance(1), root({ y: 0.03, z: 0.53, pitch: 18 }), TUCK, twist(18), bend(25, 6, 0, -10), ARMS_BACK, ANGRY, tail(22)),
    // Bounce off the foe.
    key(0.4, advance(0.84), root({ y: 0.07, z: 0.445, pitch: 6 }), HOP, twist(6), bend(8, 2, 0, -5), GUARD, ANGRY, tail(14)),
    key(0.49, advance(0.78), root({ z: 0.41 }), LAND, bend(6, 2, 0, -2), GUARD, ANGRY, tail(8)),
    key(0.62, advance(0.35), root({ y: 0.07, z: 0.185 }), HOP, GUARD, ANGRY, tail(10)),
    key(0.73, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(0.98, OPEN_EYES),
  ],
  events: [{ t: 0.31, name: 'impact' }],
};

/**
 * Punch (Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter): the
 * right fist chambered at the hip, a leap in, and the fist driven straight at
 * the foe's face as the hips and shoulders turn into it.
 */
const physicalStrongPunch: Clip = {
  name: 'physical_strong_punch',
  duration: 1.38,
  keys: [
    key(0),
    // Chamber: crouch, right shoulder back, fist at the hip, left hand up guarding.
    key(0.18, pelvis(0, -0.032), twist(-22), bend(12, 4, 0, -3, 17), PUNCH_CHAMBER, FISTS, FOCUS, tail(10, -8)),
    key(0.29, advance(0.55), root({ y: 0.09, z: 0.033 }), TUCK, twist(-30), bend(10, 4, 0, -5, 22), PUNCH_CHAMBER, FISTS, ANGRY, tail(16, -10)),
    key(0.38, advance(1), root({ z: 0.06 }), LAND, twist(-28), bend(14, 4, 0, -5, 21), PUNCH_CHAMBER, FISTS, ANGRY, tail(10, -8)),
    // Punch: hips and shoulders turn into it, the fist drives straight out.
    snap(0.455, advance(1), root({ z: 0.06 }), pelvis(0, -0.02, 0.025), twist(26), bend(16, 6, 0, -5, -8), PUNCH, FISTS, ANGRY, tail(6, 18)),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.6, advance(1), root({ z: 0.06 }), pelvis(0, -0.021, 0.028), twist(30), bend(18, 6, 0, -5, -9), PUNCH_HOLD, FISTS, ANGRY, tail(6, 22)),
    key(0.75, advance(1), root({ z: 0.06 }), pelvis(0, -0.024), twist(6), bend(12, 2, 0, -2), GUARD, ANGRY, tail(6, 6)),
    key(0.88, advance(0.45), root({ y: 0.075, z: 0.027 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(0.99, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.38, OPEN_EYES),
  ],
  events: [{ t: 0.495, name: 'impact' }],
};

/**
 * Two-handed chop (strong strikes: Brick Break, Crush Claw): Sceptile's
 * X-slash on Treecko's hands. Both hands raised high beside the head, a big
 * leap, and both chop down onto the foe on the way down and carry through,
 * crossing low; lands deep, hangs, hops home.
 */
const physicalStrongStrike: Clip = {
  name: 'physical_strong_strike',
  duration: 1.5,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.045), bend(14, 4, 0, -6), HANDS_HIGH, SPLAYED, FOCUS, tail(12)),
    key(0.33, advance(0.55), root({ y: 0.2, z: 0.039 }), TUCK, bend(-6, -2, 0, -9), HANDS_HIGH, SPLAYED, ANGRY, tail(30)),
    key(0.46, advance(0.9), root({ y: 0.15, z: 0.063 }), TUCK, bend(-8, -3, 0, -10), HANDS_HIGH, SPLAYED, ANGRY, tail(34)),
    // The chop: both hands come down onto the foe on the way down.
    snap(0.52, advance(1), root({ y: 0.04, z: 0.07 }), DROP, bend(24, 8, 2, 0), HANDS_CHOP, SPLAYED, ANGRY, tail(4)),
    key(0.59, advance(1), root({ z: 0.07 }), LAND, pelvis(0, -0.022), bend(26, 8, 2, 2), HANDS_CHOP_LOW, ANGRY, tail(4)),
    key(0.76, advance(1), root({ z: 0.07 }), pelvis(0, -0.045), bend(25, 8, 2, 2, 0, 2), HANDS_CROSSED, ANGRY, tail(8)),
    key(0.91, advance(1), root({ z: 0.07 }), pelvis(0, -0.022), bend(12, 2, 0, -2), GUARD, ANGRY, tail(6)),
    key(1.04, advance(0.45), root({ y: 0.075, z: 0.032 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.15, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.575, name: 'impact' }],
};

/** Arms flung out wide at the shoulders, a little up, hands open: wide rather than overhead. */
const ARMS_WIDE = both([[-0.92, 0.2, 0.34], [-0.72, 0.5, 0.48], [-0.55, 0.62, 0.56]]);
/** Arms swung down and out low to the sides, taking the stomp. */
const ARMS_LOW = both([[-0.88, -0.35, 0.3], [-0.6, -0.2, 0.77], [-0.45, -0.1, 0.89]]);

/**
 * Earthquake (quake; not in its movepool: the clip moves Mimic calls play):
 * drops into a crouch, springs into a tucked hop with the arms flung out
 * wide and stomps down hard into a deep squat, knees out; the ground shakes.
 * The hop is the feet drawn up under a low body (DART's foot IK) rather than
 * a leap, which would rise under the foe's healthbox from our side.
 */
const physicalStrongQuake: Clip = {
  name: 'physical_strong_quake',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.055), bend(18, 6, 0, 5), BRACED, FOCUS, tail(12)),
    // The hop: the feet drawn up high under it, arms flung out wide.
    key(0.35, DART(0.11), pelvis(0, -0.027), bend(2, 0, -2, -6), ARMS_WIDE, SPLAYED, ANGRY, tail(35)),
    // Top of the hop: a moment's hang.
    key(0.43, DART(0.12), pelvis(0, -0.027), bend(3, 1, -2, -5), ARMS_WIDE, SPLAYED, ANGRY, tail(36)),
    // Stomp: falls from the top, accelerating into a deep landing, the arms swung
    // down and out low and the tail flicking up as a counterweight.
    fall(0.57, LAND, SQUAT, pelvis(0, -0.036), bend(16, 6, 2, 6), ARMS_LOW, SPLAYED, ANGRY, tail(16)),
    key(0.65, LAND, SQUAT, pelvis(0, -0.057), bend(24, 8, 4, 9, 0, 1), ARMS_LOW, SPLAYED, ANGRY, tail(22)),
    key(0.74, SQUAT, pelvis(0, -0.054), bend(25, 8, 4, 10, 0, 2), ARMS_LOW, ANGRY, tail(18)),
    key(0.9, pelvis(0, -0.04), bend(14, 4, 2, 5), ANGRY, tail(10)),
    key(1.14, pelvis(0, -0.012), bend(5, 1, 0, 2), ANGRY, tail(3)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/** The arms whipped out and forward (the fling of a volley). */
const FLING_OUT = both([[-0.8, 0.1, 0.6], [-0.7, 0.2, 0.7], [-0.6, 0.3, 0.75]]);
/** ...carrying on out wide. */
const FLING_WIDE = both([[-0.9, 0.05, 0.42], [-0.85, 0.1, 0.5], [-0.8, 0.2, 0.55]]);

/**
 * Swift, Rock Tomb (throw): the forearms cross low in front, then whip out
 * and forward, flinging the volley off both hands.
 */
const specialWeakThrow: Clip = {
  name: 'special_weak_throw',
  duration: 1.1,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.028), bend(14, 4, 2, 5), CROSSED_LOW, FOCUS, tail(12)),
    snap(0.27, pelvis(0, -0.012, 0.006), bend(-4, -4, -2, -5), FLING_OUT, SPLAYED, ANGRY, tail(20)),
    key(0.42, pelvis(0, -0.013, 0.006), bend(-5, -4, -2, -6), FLING_WIDE, SPLAYED, ANGRY, tail(22)),
    key(0.6, pelvis(0, -0.012), bend(4, 1, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }],
};

/** Detect (shield; Protect, Endure, Substitute, Safeguard): the forearms snap into an X before its face; the eyes flash. */
const statusSelfShield: Clip = {
  name: 'status_self_shield',
  duration: 1.4,
  keys: [
    key(0),
    key(0.15, pelvis(0, -0.018), bend(8, 2, 0, 5), BRACED, FOCUS, tail(6)),
    snap(0.28, pelvis(0, -0.027), bend(6, 2, 0, 3), CROSSED, FOCUS, tail(12)),
    key(0.43, pelvis(0, -0.03), bend(7, 2, 0, 4, 0, 1), CROSSED, FOCUS, tail(13, 4)),
    key(0.78, pelvis(0, -0.035), bend(10, 3, 1, 6, 0, -1), CROSSED, FOCUS, tail(16, -4)),
    key(1.0, pelvis(0, -0.012), bend(4, 1, 0, 0), GUARD, ANGRY, tail(6)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.33, name: 'aura' }],
};

/** Basking (heal: Rest; weather: Sunny Day): it lifts its face to the light, arms open, eyes shut, swaying calmly. */
const statusSelfHeal: Clip = {
  name: 'status_self_heal',
  duration: 1.7,
  keys: [
    key(0),
    key(0.28, pelvis(0, 0.008), bend(-8, -7, -6, -12), PALMS_UP, SHUT, tail(15)),
    key(0.52, pelvis(0.004, 0.009), bend(-9, -7, -6, -13, 0, 5), PALMS_UP, SHUT, tail(17, 6)),
    key(0.8, pelvis(-0.004, 0.009), bend(-9, -7, -6, -13, 0, -5), PALMS_UP, SHUT, tail(17, -6)),
    key(1.06, pelvis(0.002, 0.008), bend(-8, -7, -6, -12, 0, 3), PALMS_UP, SHUT, tail(16, 3)),
    key(1.33, pelvis(0, -0.006), bend(3, 1, 0, 2), HAPPY, tail(5)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'aura' }],
};

/**
 * Absorb / Mega Drain / Giga Drain (drain): reaches both big hands wide at
 * the foe, closes them on its strength, then draws them to its chest as the
 * energy flows in (the pull holds while the game's orbs stream over).
 */
const specialWeakDrain: Clip = {
  name: 'special_weak_drain',
  duration: 1.6,
  keys: [
    key(0),
    key(0.19, pelvis(0, -0.014, 0.002), bend(16, 7, 0, -4), REACH, SPLAYED, ANGRY, tail(8)),
    key(0.32, pelvis(0, -0.015, 0.002), bend(17, 7, 0, -4), REACH, FISTS, ANGRY, tail(10)),
    // Pull the energy in: fists to the chest, back arched, eyes shut.
    key(0.54, pelvis(0, 0.006, -0.008), bend(-9, -7, -5, -10), CROSSED_LOW, FISTS, SHUT, tail(20)),
    key(0.8, pelvis(0, 0.007, -0.008), bend(-10, -7, -5, -11, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(22)),
    key(1.06, pelvis(0, 0.006, -0.007), bend(-9, -7, -5, -10, 0, -2), CROSSED_LOW, FISTS, SHUT, tail(21)),
    key(1.26, pelvis(0, 0.005, -0.005), bend(-8, -6, -4, -9, 0, 1), CROSSED_LOW, SHUT, tail(18)),
    key(1.4, pelvis(0, -0.006), bend(2, 0, 0, -1), HAPPY, tail(6)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.29, name: 'release' }],
};

/** Leer (glare; Mimic, Swagger, Attract): leans in, head low and forward, and stares the foe down from under its brow. */
const statusTargetGlare: Clip = {
  name: 'status_target_glare',
  duration: 1.25,
  keys: [
    key(0),
    key(0.19, pelvis(0, -0.021, 0.002), bend(16, 6, 6, 10), ANGRY, tail(6)),
    key(0.32, pelvis(0, -0.024, 0.003), bend(18, 6, 7, 12, 0, 4), ANGRY, tail(7)),
    key(0.58, pelvis(0, -0.028, 0.003), bend(21, 7, 8, 13, 4, 8), ANGRY, tail(9)),
    key(0.79, pelvis(0, -0.026, 0.003), bend(19, 6, 7, 12, -2, 5), ANGRY, tail(7)),
    key(0.96, pelvis(0, -0.007), bend(4, 1, 0, 2), ANGRY, tail(3)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

// The toss's grip.
/** Hands flung open wide for the foe (the rush). */
const GRAB_WIDE = both([[-0.75, 0.1, 0.65], [-0.35, 0.2, 0.91], [-0.2, 0.3, 0.93]]);
/** Forearms clamped round what it holds, low in front. */
const CLAMP = both([[-0.45, -0.4, 0.8], [0.45, -0.05, 0.89], [0.45, 0.05, 0.89]]);
/** Carrying it hugged low in front (not overhead: our Pokémon is near the camera and would leave the screen). */
const CARRY = both([[-0.45, -0.3, 0.84], [0.45, 0.05, 0.89], [0.45, 0.1, 0.88]]);
/** Heaving it up to chest height to hurl it. */
const HOIST = both([[-0.45, 0.15, 0.88], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]]);
/** Driving it down into the ground in front. */
const HURL = both([[-0.3, -0.5, 0.81], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]]);
/** ...and following through, the arms pressing on down. */
const HURL_LOW = both([[-0.3, -0.62, 0.72], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]]);

/**
 * Seismic Toss (toss): a springy dash in with the hands flung open, it clamps
 * on the foe (grab) and presses down to spring off it, leaping up and back
 * toward mid-field with the foe hugged low in front, spinning round with it
 * while the tail streams out; then its whole body whips forward and down to
 * hurl the foe back into its own place (throw), where it crashes (impact)
 * while Treecko lands at advance 0.4 and watches, the tail swishing.
 */
const toss: Clip = {
  name: 'toss',
  duration: 1.9,
  keys: [
    key(0),
    // Wind up: a quick crouch, forearms drawn back, tail lifting behind.
    key(0.15, pelvis(0, -0.036), bend(18, 5, 0, -6), ELBOWS_BACK, SPLAYED, FOCUS, tail(14)),
    // Spring in low, pitched forward, hands flung open.
    key(0.26, advance(0.65), root({ y: 0.08, z: 0.052, pitch: 12 }), TUCK, bend(16, 4, 0, -10), GRAB_WIDE, SPLAYED, ANGRY, tail(26)),
    // Land at the foe, hands on it.
    key(0.34, advance(1), root({ z: 0.08 }), LAND, bend(16, 4, 0, -8), GRAB_WIDE, SPLAYED, ANGRY, tail(20)),
    // Clamp on low (grab), the hands closing.
    key(0.43, advance(1), root({ z: 0.08 }), pelvis(0, -0.042), bend(22, 6, 0, -10), CLAMP, FISTS, ANGRY, tail(8)),
    // Load: sink deep with it, the tail pressed to the ground to spring off it.
    key(0.52, advance(1), root({ z: 0.08 }), pelvis(0, -0.06), bend(20, 6, 0, -12), CLAMP, FISTS, ANGRY, tail(2)),
    // Spring up and back, hugging the foe low in front, starting to spin.
    key(0.65, advance(0.84), root({ y: 0.19, z: 0.067, yaw: 60 }), HOP, pelvis(0, -0.012), bend(-2, -2, -2, -10), CARRY, FISTS, ANGRY, tail(30)),
    // Spinning round with it at the top, the tail streaming out.
    key(0.77, advance(0.62), root({ y: 0.23, z: 0.05, yaw: 228 }), HOP, pelvis(0, -0.012), bend(-4, -3, -2, -12), CARRY, FISTS, ANGRY, tail(36, -16)),
    // Facing its place again, leaning back and heaving it up to hurl.
    key(0.86, advance(0.44), root({ y: 0.23, z: 0.035, yaw: 360 }), HOP, bend(-10, -6, -5, -12), HOIST, FISTS, ANGRY, tail(40, 0)),
    // The hurl: the whole body whips forward and down with it, the tail flicking up.
    snap(0.94, advance(0.4), root({ y: 0.04, z: 0.032, yaw: 360 }), DROP, pelvis(0, -0.012), bend(34, 16, 4, 4), HURL, ANGRY, tail(46, 14)),
    // Land deep where it is, arms still down; watch it crash from the crouch, the tail swishing.
    key(1.04, advance(0.4), root({ z: 0.032, yaw: 360 }), LAND, pelvis(0, -0.048), bend(30, 12, 2, 2), HURL, ANGRY, tail(16, 10)),
    key(1.25, advance(0.4), root({ z: 0.032, yaw: 360 }), LAND, pelvis(0, -0.051), bend(28, 11, 2, 0), HURL_LOW, ANGRY, tail(12, -10)),
    // Straighten into its stance, then hop home.
    key(1.39, advance(0.4), root({ z: 0.032, yaw: 360 }), pelvis(0, -0.018), bend(10, 2, 0, 0), ANGRY, tail(6, 6)),
    key(1.51, advance(0.18), root({ y: 0.075, z: 0.014, yaw: 360 }), HOP, bend(8, 0, 0, 0), ANGRY, tail(10)),
    key(1.62, advance(0), root({ yaw: 360 }), LAND, LIGHT, ANGRY, tail(4)),
    key(1.9, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.39, name: 'grab' }, { t: 0.97, name: 'throw' }, { t: 1.16, name: 'impact' }],
};

/** Both arms stretched up along the head, hands together above it (a diver's entry). */
const DIVE = both([[-0.45, 0.8, 0.4], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]]);
/** The right hand driven up through the foe from below, palm first; the left guarding low. */
const RISING_HAND = arms([[-0.6, 0.72, 0.35], [-0.3, 0.95, 0.1], [-0.2, 0.95, -0.2]], [[0.45, -0.55, 0.7], [0.1, 0.4, 0.91], [0.1, 0.75, 0.65]]);
/** The right hand cocked low for the rising strike, the left guarding. */
const HAND_LOW = arms([[-0.5, -0.75, -0.43], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]], GUARD_L);
/** Airborne coming up out of the ground: right knee up, left leg trailing. */
const RISING_LEGS: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, 0.2, 0.96] }, shinR: { dir: [-0.12, -0.9, 0.42] },
    thighL: { dir: [0.3, -0.9, -0.3] }, shinL: { dir: [0.15, -0.6, -0.78] },
  },
};

/**
 * Dig (burrow): a springy hop and a head-first dive into the ground, arms up
 * along its head (dig: the dirt flies as it goes in, the tail last), a trail
 * of heaving dirt runs to the foe, then it bursts up under it with the right
 * hand driving up through it, knee up and the tail trailing out of the ground
 * (impact as it breaks the surface), drops straight down in front of it,
 * holds the crouch and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 1.95,
  keys: [
    key(0),
    // Crouch, eyes on the ground ahead, forearms drawn back, the tail loading.
    key(0.15, pelvis(0, -0.054), bend(24, 7, 2, 12), ELBOWS_BACK, FOCUS, tail(16)),
    // Spring up and tip forward, the arms swinging up along the head.
    key(0.24, advance(0.04), root({ y: 0.16, pitch: 35 }), TUCK, bend(4, 0, 0, 4), DIVE, ANGRY, tail(24)),
    key(0.31, advance(0.06), root({ y: 0.18, pitch: 75 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(20)),
    // Head and arms into the ground (dig), the body following, gathering speed.
    key(0.38, advance(0.07), root({ y: -0.05, pitch: 108 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(10)),
    fall(0.52, advance(0.1), root({ y: -1.3, pitch: 125 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(4)),
    // Underground (nothing to stand on): tunnel over to the foe, righting itself on the way, and start up under it.
    key(0.67, advance(0.7), root({ y: -1.32, z: 0.042, pitch: 60 }), DROP, bend(10, 3, 0, -2), HAND_LOW, ANGRY, tail(-2)),
    key(0.77, advance(1), root({ y: -1.12, z: 0.06, pitch: 20 }), DROP, pelvis(0, -0.036), bend(20, 6, 0, -6), HAND_LOW, ANGRY, tail(-6)),
    // Burst up under the foe, the right hand driving up through it, the tail trailing.
    snap(0.88, advance(1), root({ y: 0.26, z: 0.06 }), RISING_LEGS, pelvis(0, 0.012), bend(-8, -6, -4, -10), twist(10), RISING_HAND, ANGRY, tail(-40, 25)),
    key(0.99, advance(0.9), root({ y: 0.3, z: 0.054 }), RISING_LEGS, pelvis(0, 0.012), bend(-10, -6, -4, -12), twist(12), RISING_HAND, ANGRY, tail(-30, 15)),
    // Drop straight down in front of it and hold the crouch, the tail swishing.
    fall(1.14, advance(0.88), root({ z: 0.053 }), LAND, pelvis(0, -0.036), bend(20, 4, 0, -5), GUARD, ANGRY, tail(10, 10)),
    key(1.43, advance(0.88), root({ z: 0.053 }), pelvis(0, -0.018), bend(10, 2, 0, 0), GUARD, ANGRY, tail(6, -8)),
    // Hop home.
    key(1.55, advance(0.44), root({ y: 0.08, z: 0.026 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.66, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(4)),
    key(1.95, OPEN_EYES),
  ],
  events: [{ t: 0.33, name: 'dig' }, { t: 0.82, name: 'impact' }],
};

/**
 * Mud-Slap (fling): it stoops and rakes the ground beside its right foot with
 * its big right hand, drags a handful of mud back past its hip, swings it
 * through low and slings it underhand at the foe (release from the right
 * hand, which trails the hips by ~0.08 s), following through with the fingers
 * open; the left hand keeps its place.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.05,
  keys: [
    key(0),
    // Stoop: the right fingers rake the ground beside its right foot (level with it, not out in front), the tail lifts.
    key(0.14, pelvis(0, -0.048, -0.003), twist(4), bend(24, 6, 0, 10), FOCUS, tail(20),
      rightArm([[-0.6, -0.75, -0.2], [-0.5, -0.82, -0.15], [-0.4, -0.9, -0.1]]), SPLAYED),
    // Scoop: the hand drags back along the ground past the right hip, weight back.
    key(0.23, pelvis(0.006, -0.042, -0.007), twist(-16), bend(20, 5, 0, 3, 6), ANGRY, tail(12),
      rightArm([[-0.45, -0.8, -0.4], [-0.25, -0.85, -0.47], [-0.15, -0.8, -0.58]]), FISTS),
    // Swing: the arm comes through low beside the hip as the torso unwinds.
    key(0.29, pelvis(0, -0.036, 0.001), twist(4), bend(16, 5, 0, 0, 3), ANGRY, tail(8, 6),
      rightArm([[-0.42, -0.85, 0.3], [-0.25, -0.6, 0.76], [-0.15, -0.45, 0.88]]), FISTS),
    // Sling it: the arm whips forward and up underhand, the fingers opening.
    snap(0.34, pelvis(-0.003, -0.021, 0.002), twist(22), bend(10, 5, 0, -6, -4), ANGRY, tail(6, 14),
      rightArm([[-0.35, 0.4, 0.85], [-0.2, 0.66, 0.72], [-0.15, 0.72, 0.68]]), SPLAYED),
    // Follow-through: the fingers open high and out at the foe, hanging a moment.
    key(0.47, pelvis(-0.004, -0.02, 0.002), twist(25), bend(11, 5, 0, -6, -5), ANGRY, tail(6, 18),
      rightArm([[-0.42, 0.52, 0.74], [-0.26, 0.78, 0.57], [-0.2, 0.84, 0.5]]), SPLAYED),
    key(0.58, pelvis(-0.003, -0.02, 0.002), twist(24), bend(10, 5, 0, -5, -4), ANGRY, tail(6, 16),
      rightArm([[-0.44, 0.5, 0.74], [-0.28, 0.76, 0.58], [-0.22, 0.82, 0.52]]), SPLAYED),
    key(0.81, pelvis(0, -0.012), twist(6), bend(4, 1, 0, -2), ANGRY, tail(5, 4)),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.39, name: 'release' }],
};

/**
 * Double Team, Agility (afterimage): low, springy darts from side to side,
 * leaning into each with the tail swinging out as a counterweight, the arms
 * held out wide as it stands; the afterimages start at the aura and run
 * 1.4 s (Agility's trail follows the darts). The darts stay narrow and low,
 * the feet tucked under, zig-zagging back a little (clear of the
 * healthboxes).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.5,
  keys: [
    key(0),
    // Load onto its left foot to push off to the right.
    key(0.1, pelvis(0.012, -0.033), twist(0, -5), bend(10, 3, 0, -3), FOCUS, tail(8, 8)),
    key(0.19, root({ x: -0.075, z: -0.015 }), DART(0.065), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.28, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(8, -16)),
    key(0.38, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.48, root({ x: 0.15, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(8, 16)),
    key(0.58, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.68, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(8, -16)),
    key(0.78, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.88, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(8, 16)),
    key(0.97, root({ x: 0.07, z: -0.025 }), DART(0.055), twist(0, 8), bend(3, 1, 0, -2), ANGRY, tail(10, -14)),
    key(1.06, LAND, ANGRY, tail(6, -6)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.15, name: 'aura' }],
};

/** Both arms flung open high and wide toward the foe, fingers spread (Flash's flare). */
const FLARE = both([[-0.9, 0.35, 0.26], [-0.7, 0.62, 0.35], [-0.55, 0.75, 0.37]]);

/**
 * Flash (flash): it curls in over its crossed forearms, eyes shut, gathering
 * the sunlight, then flares up tall and throws its arms open at the foe with
 * the tail fanned high (emit: the screen turns white and both Pokémon black,
 * so the flare is a silhouette), holds the flare and relaxes.
 */
const flash: Clip = {
  name: 'flash',
  duration: 1.2,
  keys: [
    key(0),
    // Gather: curl in over the crossed forearms, eyes shut, the tail drawn in low.
    key(0.17, pelvis(0, -0.036), bend(22, 7, 2, 12), CROSSED_LOW, FISTS, SHUT, tail(4)),
    key(0.32, pelvis(0, -0.042), bend(25, 8, 2, 14, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(2)),
    // Flare: up tall, chest thrown open, arms flung wide at the foe.
    snap(0.42, pelvis(0, 0.014, 0.006), bend(-14, -8, -5, -8), FLARE, SPLAYED, jaw(18), ANGRY, tail(40)),
    key(0.57, pelvis(0, 0.012, 0.006), bend(-15, -8, -5, -9, 0, 2), FLARE, SPLAYED, jaw(16), ANGRY, tail(38)),
    key(0.74, pelvis(0, 0.01, 0.005), bend(-13, -8, -5, -7, 0, -2), FLARE, SPLAYED, jaw(10), ANGRY, tail(34)),
    // Relax back into the crouch.
    key(0.93, pelvis(0, -0.01), bend(4, 1, 0, 0), GUARD, ANGRY, tail(8)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/**
 * Taking a hit: snaps back and winces (the battler adds a sprung recoil),
 * arms thrown up and out, then shakes it off. Its weight stays back on its
 * heels while it recovers.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.56,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0, -0.012), bend(-14, -6, -3, -8), FLINCH, SPLAYED, HURT, tail(12)),
    key(0.2, pelvis(0, 0, -0.015), bend(-6, -2, -1, -4), HURT, tail(7)),
    key(0.36, pelvis(0, 0, -0.009), bend(3, 1, 0, 3), HURT, tail(3)),
    key(0.56, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * the arms dropping, then it sinks into a squat, knees out, and curls over
 * hugging itself, the big head bowed and the tail curling round, eyes shut;
 * from the 'shrink' the curled body shrinks away (Battler3D). It sits back
 * over its heels as it curls, clear of our healthbox; the tail lifts at its
 * root as the hips drop, so it lies along the ground.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-8, -4, -4, -10), DROOP, DROWSY, tail(4)),
    key(0.48, pelvis(0, -0.045), root({ z: -0.04 }), SQUAT, bend(12, 5, 6, 14), CROSSED_LOW, SHUT, tail(8, -14)),
    key(0.82, pelvis(0, -0.1), root({ z: -0.08 }), SQUAT, bend(22, 10, 12, 20), CROSSED_LOW, SHUT, tail(16, -28)),
    key(0.96, pelvis(0, -0.108), root({ z: -0.08 }), SQUAT, bend(24, 11, 13, 22), CROSSED_LOW, SHUT, tail(17, -30)),
    key(1.6, pelvis(0, -0.105), root({ z: -0.08 }), SQUAT, bend(23, 10, 12, 21), CROSSED_LOW, SHUT, tail(17, -29)),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const TREECKO_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    physicalWeakTackle, physicalStrongPunch, physicalStrongStrike, physicalStrongQuake,
    specialWeakThrow, specialWeakDrain, statusSelfShield, statusSelfHeal, statusTargetGlare,
    toss, burrow, fling, afterimage, flash,
  ].map((c) => [c.name, c]),
);

/**
 * Eye atlas (Treecko_Eye): 2 columns x 4 rows. The eye mesh maps the big
 * open eye in column 0, row 3, so each cell is given relative to it.
 */
export const TREECKO_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  focus: [0, -1],
  half: [1, -2],
  closed: [0, -2],
  happy: [1, -1],
  hurt: [0, -3],
  wide: [1, -3],
};

// The set's own helpers, for the clips added in the same style (./set_more.ts).
export {
  key, snap, fall, ANGRY, FOCUS, SHUT, OPEN_EYES, jaw, pelvis, root, advance, bend, twist, tail, arms, both,
  GUARD, BRACED, ELBOWS_BACK, SPLAYED, TUCK, HOP, LAND, LIGHT,
};
