// Treecko's battle animation set: one clip per attack category (+ idle, intro,
// hit, faint) and the motif clips its moves need. Keys are STANCE + deltas
// (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   root            whole-body rotation (the Slam's spin) and small sways;
//                   every clip acts in place: no advance, the root on its
//                   spot (the compiled game moves the sprite and the body
//                   follows it: the pokemon-animation skill, "Acting in place")
//   plantFeet       foot IK weight. The IK pins a planted foot's height and
//                   keeps its posed x/z, so a pelvis shift slides the feet:
//                   strikes lean in with the spine, not the hips
//   expression      eye atlas cell (open, angry, focus, half, closed, happy, hurt, wide)
// Events: impact (contact lands), release (seeds, beam, drain), releaseEnd,
// charge, cry, aura, emit, shrink.
//
// Treecko is small, light and quick, and cool under pressure: strikes snap
// in 3-5 frames from a short coil, it is back in its stance quickly and its
// holds are calm. It acts with its big three-fingered hands (Pound's smack,
// the drain's reach, the punch), its mouth (seeds, Solar Beam, Screech), its
// eyes (Leer) and its heavy leaf tail (Slam), which is keyed when it acts and
// otherwise follows on its spring (index.ts). The animator adds overlapping
// action (head, arms, hands and the tail chain trail the body: events that
// depend on them sit a few frames after their key), breathing and blinks.
//
// The healthboxes are drawn over the Pokémon: from our side the foe's box is
// a few pixels above our Treecko's head and ours is to its right, so arms
// open wide rather than overhead (tools/gauntlet/uiclear.mjs).
//
// The category clips are Treecko's early moves (Pound, Slam, Bullet Seed,
// Solar Beam, a sunlight power-up, Leer); index.ts maps the motifs they
// perform. The motif clips (tackle, drain, shield, afterimage, roar, punch)
// are named after their motifs, which the director finds by name.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });

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
/** Spine chain pitch (x) from hips to head, with head turn (+y: to its left) and tilt (+z: to its right). */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** Torso twist (+ turns the chest to its left, bringing the right shoulder forward) and lean (+z: to its right). */
const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y: y * 0.6, z: z * 0.6 }, chest: { y: y * 0.4, z: z * 0.4 } } });
/** The leaf tail: lift (+ raises it) and sweep (+ swings it toward its right), spread along the chain. */
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

/** Forearms crossed low in front of the belly (gathering, hugging itself). */
const CROSSED_LOW = arms([[-0.35, -0.6, 0.72], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]], [[0.35, -0.6, 0.72], [-0.75, 0.12, 0.65], [-0.7, 0.28, 0.66]]);
/** Forearms crossed in an X before the face (a guard). */
const CROSSED = arms([[-0.3, 0.3, 0.9], [0.6, 0.6, 0.53], [0.5, 0.78, 0.38]], [[0.3, 0.3, 0.9], [-0.6, 0.64, 0.48], [-0.5, 0.82, 0.28]]);
/** Arms flung up wide in a V, hands open (the stock sprite's second frame): wide, not overhead. */
const SPREAD = both([[-0.85, 0.42, 0.32], [-0.5, 0.82, 0.28], [-0.35, 0.9, 0.25]]);
/** Arms open to the sky, palms up (basking). */
const PALMS_UP = both([[-0.86, 0.2, 0.47], [-0.62, 0.55, 0.56], [-0.45, 0.8, 0.4]]);
/** Braced for a blast: arms low and a little back at the sides. */
const BRACED = both([[-0.5, -0.78, -0.36], [-0.3, -0.55, 0.78], [-0.2, -0.35, 0.92]]);
/** Drawing breath / rearing: elbows pulled back, chest open. */
const ELBOWS_BACK = both([[-0.6, -0.4, -0.7], [-0.25, 0.1, 0.96], [-0.1, 0.25, 0.96]]);
/**
 * Both hands raised wide and forward at the foe, fingers open: wide enough
 * to show beside the body from behind, raised so they don't point straight
 * at the camera from the front.
 */
const REACH = both([[-0.7, 0.28, 0.66], [-0.5, 0.42, 0.76], [-0.4, 0.5, 0.77]]);
/** ... and a little further, the grip closing on the foe's strength. */
const REACH_FAR = both([[-0.64, 0.25, 0.73], [-0.44, 0.38, 0.81], [-0.34, 0.44, 0.83]]);
/** Hands raised beside the head, splayed (Screech's nails on a slate). */
const CLAWS_UP = both([[-0.72, 0.35, 0.6], [-0.35, 0.88, 0.32], [-0.2, 0.96, 0.18]]);
/** Hands thrust at the foe, splayed. */
const CLAWS_OUT = both([[-0.5, 0.05, 0.86], [-0.3, 0.25, 0.92], [-0.2, 0.4, 0.9]]);
/** Taking a hit: the arms thrown up and out, hands open. */
const FLINCH = arms([[-0.8, 0.15, 0.58], [-0.5, 0.55, 0.67], [-0.3, 0.75, 0.59]], [[0.78, 0.02, 0.62], [0.45, 0.45, 0.77], [0.25, 0.65, 0.72]]);
/** Sprinting: both arms swept back for balance while the shoulder leads. */
const ARMS_BACK = both([[-0.4, -0.55, -0.73], [-0.3, -0.35, -0.89], [-0.2, -0.25, -0.95]]);
/** Worn out: the arms hanging low. */
const DROOP = both([[-0.6, -0.76, 0.24], [-0.32, -0.88, 0.35], [-0.22, -0.88, 0.42]]);
/** Guarding: hands up in front of the chest, ready (quick footwork). */
const GUARD = both([[-0.62, -0.3, 0.72], [-0.1, 0.72, 0.69], [0.0, 0.9, 0.44]]);

/** Fingers curled into fists (the curl is toward the palm). */
const FISTS: Pose = {
  bones: {
    fingerAR: { z: 40 }, fingerBR: { z: 40 }, fingerCR: { z: 40 },
    fingerAL: { z: -40 }, fingerBL: { z: -40 }, fingerCL: { z: -40 },
  },
};
/** Fingers spread wide. */
const SPLAYED: Pose = {
  bones: {
    fingerAR: { y: 14, z: -10 }, fingerCR: { y: -14, z: -10 },
    fingerAL: { y: -14, z: 10 }, fingerCL: { y: 14, z: 10 },
  },
};

// Clips -----------------------------------------------------------------------

/** Breathing in its stance; the leaf tail sways (its spring carries the rest). */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }, tail(3, 8)),
    key(2.4),
  ],
};

/**
 * Sent out: curled up behind its crossed arms with the eyes shut, it springs
 * up into its cry with the arms flung up wide and the hands open (the stock
 * sprite's second frame), the tail raised, and settles into its stance.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, pelvis(0, -0.06), bend(18, 6, 4, 16), CROSSED_LOW, SHUT, tail(-8)),
    key(0.18, pelvis(0, -0.075), bend(22, 7, 5, 20), CROSSED_LOW, SHUT, tail(-12)),
    // The cry: chest up and the head raised, but not thrown back (from behind the big head turned into a ball).
    snap(0.38, pelvis(0, 0.012), bend(-6, -4, -2, -3), SPREAD, SPLAYED, jaw(32), ANGRY, tail(34)),
    key(0.58, pelvis(0, 0.01), bend(-5, -4, -2, -2, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(31)),
    key(0.78, pelvis(0, 0.012), bend(-6, -4, -2, -3, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(29)),
    key(0.96, pelvis(0, 0.006), bend(-3, -2, -1, -2), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.012), bend(5, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
};

/** Pound's left arm: held out a little forward and low for balance while the right hand acts. */
const POUND_BALANCE: Arm = [[0.9, -0.12, 0.42], [0.7, 0.18, 0.69], [0.5, 0.42, 0.76]];
/**
 * Pound (weak contact; Cut, Rock Smash, Aerial Ace, Fury Cutter, Brick
 * Break): the game leaves the sprite where it is, so the clip carries it all.
 * The right hand cocks up and back beside its head while the chest turns
 * away, then swings round in a big overhand arc down its right side as the
 * torso unwinds and the spine drives it at the foe: the open hand smacks
 * down on the foe, carries on down and snaps back into its stance. The arc
 * runs across both camera views (up and down its side), so it reads from
 * the front and from behind; a thrust straight at the foe hid behind the
 * body from our side. The coil is short: the game shows its hit splat from
 * the move's first frame, so the smack lands while it is still on the foe.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.9,
  keys: [
    key(0),
    // Coil: a dip, the chest turning away, the right hand raised up and back beside its head (not overhead).
    key(0.11, pelvis(0, -0.03), twist(-18), bend(4, 2, 0, -6, 12), FOCUS, tail(6, -14),
      arms([[-0.86, 0.44, -0.26], [-0.6, 0.77, -0.2], [-0.45, 0.87, -0.2]], POUND_BALANCE)),
    // Smack: the torso unwinds and leans in, the hand comes down on the foe at its right side.
    snap(0.19, pelvis(0, -0.04), twist(14), bend(22, 8, 0, -8, -4), ANGRY, tail(2, 16),
      arms([[-0.45, -0.35, 0.82], [-0.3, -0.55, 0.78], [-0.25, -0.65, 0.72]], [[0.92, -0.25, 0.3], [0.75, 0.05, 0.66], [0.55, 0.3, 0.78]])),
    // Follow-through: the hand carries on down past its right knee and hangs there.
    key(0.33, pelvis(0, -0.042), twist(18), bend(24, 8, 0, -8, -5), ANGRY, tail(0, 22),
      arms([[-0.4, -0.72, 0.57], [-0.25, -0.85, 0.46], [-0.2, -0.9, 0.38]], [[0.92, -0.28, 0.28], [0.75, 0.02, 0.66], [0.55, 0.28, 0.79]])),
    // Back into the stance, a small overshoot, settle.
    key(0.52, pelvis(0, -0.02), twist(4), bend(8, 2, 0, -2), ANGRY, tail(4, 6)),
    key(0.7, twist(-2), bend(-1, 0, 0, 1), ANGRY, tail(2, -4)),
    key(0.9, OPEN_EYES),
  ],
  events: [{ t: 0.25, name: 'impact' }],
};

/** Arms drawn in to the chest for a spin, hands up. */
const ARMS_IN = both([[-0.45, -0.5, 0.74], [0.35, 0.45, 0.82], [0.25, 0.75, 0.61]]);
/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail, and Mega Kick,
 * Seismic Toss by fallback): a quick coil with the chest turned away and the
 * tail loaded to its left, then it spins round on the spot to its left; the
 * tail trails, rises and whips down through the foe as its back turns to it,
 * and it comes on round to face the foe again and settles deep. The game
 * shoves the sprite at the foe and hits within a few frames, so the spin
 * starts almost at once and the tail comes round a third of a second in.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.35,
  keys: [
    key(0),
    // Coil: crouch, the chest turned to its right, arms drawn in, the tail loaded to its left.
    key(0.1, pelvis(0, -0.06), twist(-18), bend(12, 4, 0, -6, 10), FOCUS, tail(18, -22), ARMS_IN),
    // The spin: round to its left, the tail trailing and rising.
    key(0.2, root({ yaw: 90 }), pelvis(0, -0.05), twist(-6), bend(8, 2, 0, -4), ANGRY, tail(30, -30), ARMS_IN),
    // Its back to the foe: the tail whips down through it, the body bowing away, arms flung out.
    key(0.3, root({ yaw: 190 }), pelvis(0, -0.065), twist(8), bend(20, 6, 2, 4), ANGRY, tail(-14, 22),
      both([[-0.85, -0.2, 0.49], [-0.55, 0.2, 0.81], [-0.4, 0.4, 0.82]])),
    // Coming on round, the tail dragging behind.
    key(0.41, root({ yaw: 290 }), pelvis(0, -0.06), twist(6), bend(14, 4, 0, -2), ANGRY, tail(-8, 30)),
    // Facing the foe again: settle deep, the tail swinging back to its side.
    key(0.54, root({ yaw: 360 }), pelvis(0, -0.055), bend(10, 3, 0, -2), ANGRY, tail(4, 4)),
    key(0.76, root({ yaw: 360 }), pelvis(0, -0.03), bend(4, 1, 0, 0), ANGRY, tail(2, -10)),
    key(1.0, root({ yaw: 360 }), pelvis(0, -0.01), bend(1, 0, 0, 0), ANGRY, tail(3, 4)),
    key(1.35, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.37, name: 'impact' }],
};

/**
 * Bullet Seed (weak ranged from the mouth; Swift, Rock Tomb, Snore, Mud-Slap
 * by fallback): a quick breath with the head back, then three pecks of the
 * head with the jaw wide, a seed leaving the mouth on each, arms braced.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Breath in: chest up, head back, elbows back.
    key(0.2, pelvis(0, 0.01), bend(-8, -6, -6, -16), ELBOWS_BACK, ANGRY, tail(8)),
    // Three pecks: the head drives forward, jaw wide, and bobs back, each a little further in.
    snap(0.28, pelvis(0, -0.012), bend(12, 6, 0, -2), BRACED, jaw(28), ANGRY, tail(2)),
    key(0.36, pelvis(0, -0.008), bend(6, 3, -2, -8), BRACED, jaw(10), ANGRY, tail(5)),
    snap(0.44, pelvis(0, -0.014), bend(14, 7, 0, -2, 4), BRACED, jaw(30), ANGRY, tail(2)),
    key(0.52, pelvis(0, -0.009), bend(7, 3, -2, -8, 3), BRACED, jaw(10), ANGRY, tail(5)),
    snap(0.6, pelvis(0, -0.016), bend(16, 8, 0, -2, -4), BRACED, jaw(32), ANGRY, tail(1)),
    // Recoil: the head bobs back up as the jaw closes.
    key(0.76, pelvis(0, -0.004), bend(2, 1, -2, -12), BRACED, jaw(6), ANGRY, tail(6)),
    key(0.94, pelvis(0, -0.002), bend(1, 0, 0, -2), jaw(0), ANGRY, tail(2)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.345, name: 'release' }, { t: 0.505, name: 'release' }, { t: 0.665, name: 'release' }],
};

/**
 * Solar Beam (strong ranged; Hidden Power by fallback): it turns its face up
 * to the sun with the arms open and the eyes shut, soaking up the light,
 * then braces low and fires the beam from its mouth, trembling against the
 * recoil; the jaw shuts and the head comes up.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6)),
    // Soak up the light: rise with the chest up and the arms open to the sky, eyes shut
    // (the head stays nearly level: tipped back, the big head became a ball from behind).
    key(0.5, pelvis(0, 0.014), bend(-7, -5, -2, -4), PALMS_UP, SPLAYED, SHUT, tail(22)),
    key(0.66, pelvis(0, 0.018), bend(-8, -6, -2, -5, 0, 2), PALMS_UP, SPLAYED, SHUT, tail(25)),
    key(0.8, pelvis(0, 0.016), bend(-8, -6, -2, -5, 0, -2), PALMS_UP, SPLAYED, SHUT, tail(24)),
    // Fire: the head drives forward at the foe, jaw wide; the body braces low.
    snap(0.92, pelvis(0, -0.04), bend(16, 10, -2, -8), BRACED, jaw(36), ANGRY, tail(-6)),
    // Sustain: pushed back by the beam, trembling.
    key(1.12, pelvis(0, -0.035), root({ z: -0.015 }), bend(14, 8, -2, -6, 3), BRACED, jaw(34), ANGRY, tail(-4)),
    key(1.32, pelvis(0, -0.038), root({ z: -0.02 }), bend(15, 9, -2, -8, -3, -2), BRACED, jaw(36), ANGRY, tail(-6)),
    key(1.52, pelvis(0, -0.035), root({ z: -0.022 }), bend(14, 8, -2, -6, 2, 1), BRACED, jaw(34), ANGRY, tail(-4)),
    key(1.7, pelvis(0, -0.036), root({ z: -0.02 }), bend(14, 8, -2, -7), BRACED, jaw(33), ANGRY, tail(-5)),
    // The jaw shuts, the head comes up and shakes it off.
    key(1.88, pelvis(0, -0.015), root({ z: -0.01 }), bend(4, 2, 0, -6, 5), jaw(4), ANGRY, tail(4)),
    key(2.02, pelvis(0, -0.008), bend(2, 1, 0, -3, -4), ANGRY, tail(2)),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.76, name: 'releaseEnd' }],
};

/**
 * A sunlight power-up (self status: Swords Dance, Sleep Talk, Rest, Sunny
 * Day): it draws in over its crossed arms with the eyes shut, then opens up
 * with the chest out, the arms flung up wide and the face to the light;
 * the aura rises and it holds, trembling, then relaxes.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    // Gather: curl in over the crossed arms, eyes shut, the tail drawn in low.
    key(0.28, pelvis(0, -0.05), bend(20, 6, 4, 14), CROSSED_LOW, FISTS, SHUT, tail(-6)),
    key(0.42, pelvis(0, -0.056), bend(22, 7, 4, 16, 0, 1), CROSSED_LOW, FISTS, SHUT, tail(-8)),
    // Open up: chest out, arms flung wide, face to the light (a moving hold with a tremor).
    snap(0.56, pelvis(0, 0.01), bend(-6, -4, -2, -4), SPREAD, SPLAYED, ANGRY, tail(28)),
    key(0.68, pelvis(0, 0.012), bend(-7, -4, -2, -5, 0, 1.5), SPREAD, SPLAYED, ANGRY, tail(30)),
    key(0.8, pelvis(0, 0.01), bend(-6, -5, -2, -4, 0, -1.5), SPREAD, SPLAYED, ANGRY, tail(29)),
    key(0.92, pelvis(0, 0.012), bend(-7, -4, -2, -5, 0, 1.5), SPREAD, SPLAYED, ANGRY, tail(30)),
    key(1.04, pelvis(0, 0.01), bend(-6, -5, -2, -4, 0, -1), SPREAD, ANGRY, tail(28)),
    // Relax back into the stance.
    key(1.28, pelvis(0, -0.012), bend(5, 2, 0, -2), HAPPY, tail(6)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Leer (status at the foe; Mimic, and Swagger, Attract by fallback): cool as
 * ever, it draws its head up, then juts it forward and down and stares the
 * foe down from under its brow (the glint leaves its eyes), leaning in with
 * a slow, cocky tilt of the head; then it eases back.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.35,
  keys: [
    key(0),
    // Draw up: chin up, chest up.
    key(0.16, pelvis(0, 0.006), bend(-4, -2, -2, -8), FOCUS, tail(6)),
    // Jut the head forward and down: the stare.
    snap(0.28, pelvis(0, -0.03), bend(14, 6, 8, 10), ANGRY, tail(2),
      both([[-0.9, -0.2, 0.38], [-0.72, 0.18, 0.67], [-0.5, 0.42, 0.76]])),
    // A moving hold: leaning in, the head tilting.
    key(0.42, pelvis(0, -0.032), bend(15, 6, 8, 11, 0, 3), ANGRY, tail(3),
      both([[-0.9, -0.2, 0.38], [-0.72, 0.18, 0.67], [-0.5, 0.42, 0.76]])),
    key(0.66, pelvis(0, -0.036), bend(18, 7, 9, 12, 4, 8), ANGRY, tail(5),
      both([[-0.9, -0.22, 0.37], [-0.72, 0.16, 0.67], [-0.5, 0.4, 0.77]])),
    key(0.88, pelvis(0, -0.034), bend(17, 6, 8, 12, -2, 6), ANGRY, tail(4),
      both([[-0.9, -0.2, 0.38], [-0.72, 0.18, 0.67], [-0.5, 0.42, 0.76]])),
    // Ease back.
    key(1.06, pelvis(0, -0.01), bend(3, 1, 0, 2), ANGRY, tail(2)),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/**
 * Quick Attack (tackle; Pursuit, Facade, Secret Power, Return, Frustration,
 * Strength, Double-Edge): the game whirls the sprite round a small loop at
 * the foe and back in 8 frames and hits on the 4th, so there is no time to
 * gather: Treecko is already pitched far forward with its arms swept back
 * like a sprinter and its right shoulder and head driving at the foe through
 * the blur (impact), then it rebounds upright and settles.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 0.8,
  keys: [
    key(0),
    // The dash: low and pitched forward, the right shoulder leading, arms swept back, tail streaming.
    snap(0.08, pelvis(0, -0.05), twist(12), bend(28, 9, -5, -15), ARMS_BACK, ANGRY, tail(24, 6)),
    // The hit: driven on in a moving hold.
    key(0.16, pelvis(0, -0.054), twist(15), bend(31, 10, -6, -16), ARMS_BACK, ANGRY, tail(28, 8)),
    // Rebound upright, the arms opening out.
    key(0.34, pelvis(0, -0.03), twist(4), bend(2, 0, 0, 2), ANGRY, tail(10, -6),
      both([[-0.9, -0.25, 0.35], [-0.7, 0.1, 0.71], [-0.5, 0.35, 0.79]])),
    key(0.5, pelvis(0, -0.012), bend(5, 2, 0, -2), ANGRY, tail(4, 4)),
    key(0.8, OPEN_EYES),
  ],
  events: [{ t: 0.11, name: 'impact' }],
};

/**
 * Absorb, Mega Drain, Giga Drain (drain): it reaches both big hands wide at
 * the foe, closes them on its strength, then draws them in to its chest with
 * the chin up and the eyes shut while the energy streams into its body, and
 * opens up, happy, as the healing sparkles on it. Timed on the game's
 * Absorb: its orbs stream in until about 1.6 s and the healing comes at 2 s.
 */
const drain: Clip = {
  name: 'drain',
  duration: 2.3,
  keys: [
    key(0),
    // Reach: leaning in with the spine, both hands raised wide at the foe, fingers open.
    key(0.22, pelvis(0, -0.02), bend(12, 5, 0, -6), REACH, SPLAYED, ANGRY, tail(6)),
    // Grip: the hands close on the foe's strength.
    key(0.34, pelvis(0, -0.024), bend(14, 5, 0, -6), REACH_FAR, FISTS, ANGRY, tail(8)),
    // Pull it in: fists to the chest, chin up, eyes shut; a slow sway while it flows in.
    key(0.58, pelvis(0, 0.006), bend(-6, -5, -4, -10), CROSSED_LOW, FISTS, SHUT, tail(18)),
    key(0.9, pelvis(0, 0.008), twist(0, -3), bend(-7, -5, -4, -11, 0, 3), CROSSED_LOW, FISTS, SHUT, tail(20, 5)),
    key(1.24, pelvis(0, 0.009), twist(0, 3), bend(-8, -5, -4, -12, 0, -3), CROSSED_LOW, FISTS, SHUT, tail(21, -5)),
    key(1.56, pelvis(0, 0.008), twist(0, -2), bend(-7, -5, -4, -11, 0, 2), CROSSED_LOW, SHUT, tail(19, 3)),
    // Healed: it opens up, pleased, and settles back into its stance.
    key(1.84, pelvis(0, 0.002), bend(-3, -2, 0, -5), PALMS_UP, HAPPY, tail(12)),
    key(2.05, pelvis(0, -0.004), bend(1, 0, 0, -1), HAPPY, tail(5)),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'release' }],
};

/**
 * Detect (shield; Protect, Endure, Substitute, Safeguard): it draws in and
 * snaps its forearms into an X before its face with the focused eyes, holds
 * under the barrier sinking a little, then opens back into its stance.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.4,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.03), bend(8, 2, 0, 6), BRACED, FOCUS, tail(4)),
    snap(0.3, pelvis(0, -0.045), bend(6, 2, 0, 4), CROSSED, FOCUS, tail(12)),
    // A moving hold under the barrier: sinking a little, a slow sway, the tail swishing.
    key(0.46, pelvis(0, -0.05), twist(0, 3), bend(7, 2, 0, 5, 0, 2), CROSSED, FOCUS, tail(14, 8)),
    key(0.66, pelvis(0, -0.056), twist(0, -3), bend(9, 3, 1, 7, 0, -2), CROSSED, FOCUS, tail(16, -8)),
    key(0.86, pelvis(0, -0.06), twist(0, 2), bend(10, 3, 1, 7, 0, 1), CROSSED, FOCUS, tail(16, 4)),
    key(1.08, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY, tail(4)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'aura' }],
};

/**
 * Agility, Double Team (afterimage): the game darts the sprite about and
 * draws the afterimages; on it Treecko weaves low and fast from side to side
 * with its hands up, leaning into each weave with the tail swinging out as a
 * counterweight, and straightens up.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.45,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(10, 3, 0, -4), GUARD, FOCUS, tail(6)),
    key(0.24, pelvis(0, -0.062), twist(10, 20), bend(8, 2, 0, -4, 0, -10), GUARD, FOCUS, tail(10, -26)),
    key(0.42, pelvis(0, -0.045), twist(-10, -20), bend(8, 2, 0, -4, 0, 10), GUARD, FOCUS, tail(10, 26)),
    key(0.6, pelvis(0, -0.062), twist(10, 20), bend(8, 2, 0, -4, 0, -10), GUARD, FOCUS, tail(10, -26)),
    key(0.78, pelvis(0, -0.045), twist(-10, -20), bend(8, 2, 0, -4, 0, 10), GUARD, FOCUS, tail(10, 26)),
    key(0.96, pelvis(0, -0.055), twist(5, 10), bend(8, 2, 0, -4, 0, -5), GUARD, FOCUS, tail(8, -13)),
    key(1.12, pelvis(0, -0.02), bend(3, 1, 0, 0), ANGRY, tail(4, 4)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Screech (roar; Toxic spat from the mouth): it rears up with its hands
 * raised beside its head, fingers splayed, then lunges the head forward and
 * screeches, jaw wide and hands thrust out, the head shaking.
 */
const roar: Clip = {
  name: 'roar',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.012), bend(-10, -7, -8, -16), CLAWS_UP, SPLAYED, ANGRY, tail(22)),
    snap(0.3, pelvis(0, -0.022), bend(18, 9, 4, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(6)),
    key(0.46, pelvis(0, -0.022), bend(19, 10, 4, -4, 8, 4), CLAWS_OUT, SPLAYED, jaw(38), ANGRY, tail(10)),
    key(0.64, pelvis(0, -0.022), bend(18, 10, 4, -4, -8, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(6)),
    key(0.8, pelvis(0, -0.02), bend(17, 9, 4, -4, 5, 2), CLAWS_OUT, jaw(32), ANGRY, tail(8)),
    key(0.96, pelvis(0, -0.01), bend(6, 2, 0, -3), jaw(8), ANGRY, tail(4)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** The punch's left arm pulled back to the hip, fist chambered. */
const CHAMBER_L: Arm = [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]];
/**
 * Punches (Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter):
 * the right fist chambered low at the hip with the left hand up as a guard,
 * then the legs drive up, the hips and shoulders turn and the fist rises
 * straight out at the foe's face, the left fist snapping back to the hip; it
 * holds out a moment and comes back to its stance. The fist travels up as
 * well as out, so the punch reads from the front (a punch straight at the
 * camera foreshortened into the body) and from behind.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.3,
  keys: [
    key(0),
    // Chamber: dip, the chest turned away, right fist low at the hip, left hand up and forward.
    key(0.2, pelvis(0, -0.045), twist(-22), bend(10, 4, 0, -4, 12), FISTS, FOCUS, tail(8, -10),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.45, -0.4, 0.8], [-0.2, 0.62, 0.76], [-0.15, 0.85, 0.5]])),
    key(0.3, pelvis(0, -0.052), twist(-26), bend(11, 4, 0, -4, 14), FISTS, FOCUS, tail(10, -12),
      arms([[-0.5, -0.7, -0.51], [-0.2, -0.24, 0.95], [-0.1, -0.14, 0.99]], [[0.45, -0.4, 0.8], [-0.2, 0.62, 0.76], [-0.15, 0.85, 0.5]])),
    // Punch: up out of the dip, hips and shoulders turning into it, the fist rising at the foe.
    snap(0.38, pelvis(0, -0.02), twist(22), bend(16, 6, 0, -10, -6), FISTS, ANGRY, tail(4, 18),
      arms([[-0.3, 0.25, 0.92], [-0.2, 0.34, 0.92], [-0.15, 0.38, 0.91]], CHAMBER_L)),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.54, pelvis(0, -0.022), twist(26), bend(18, 6, 0, -10, -7), FISTS, ANGRY, tail(2, 22),
      arms([[-0.28, 0.3, 0.91], [-0.18, 0.4, 0.9], [-0.14, 0.43, 0.89]], CHAMBER_L)),
    key(0.74, pelvis(0, -0.02), twist(6), bend(8, 2, 0, -2), ANGRY, tail(4, 6)),
    key(0.92, twist(-2), bend(-1, 0, 0, 1), ANGRY, tail(2, -4)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.43, name: 'impact' }],
};

/** Taking a hit: snaps back and winces (the battler adds a sprung recoil), then shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.56,
  keys: [
    key(0),
    snap(0.05, bend(-15, -6, -3, -7), FLINCH, SPLAYED, HURT, tail(14)),
    key(0.2, bend(-7, -3, -1, -4), HURT, tail(7)),
    key(0.36, bend(3, 1, 0, 4), HURT, tail(2)),
    key(0.56, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * the arms dropping, then it sinks back onto its heels and curls over hugging
 * itself, the big head bowed and the tail curling round, eyes shut; from the
 * 'shrink' the curled body shrinks away (Battler3D). It sits back over its
 * heels as it curls, clear of our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-8, -4, -4, -12), DROOP, DROWSY, tail(4)),
    // The hips drop, so the tail lifts at its root to lie along the ground instead of sinking into it.
    key(0.48, pelvis(0, -0.07), root({ z: -0.04 }), bend(12, 5, 8, 16), CROSSED_LOW, SHUT, tail(6, -14)),
    key(0.82, pelvis(0, -0.15), root({ z: -0.08 }), bend(22, 10, 14, 22), CROSSED_LOW, SHUT, tail(14, -28)),
    key(0.96, pelvis(0, -0.16), root({ z: -0.08 }), bend(24, 11, 15, 24), CROSSED_LOW, SHUT, tail(15, -30)),
    key(1.6, pelvis(0, -0.156), root({ z: -0.08 }), bend(23, 10, 14, 23), CROSSED_LOW, SHUT, tail(15, -29)),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    tackle, drain, shield, afterimage, roar, punch,
  ].map((c) => [c.name, c]),
);

/**
 * Eye atlas (Treecko_Eye): 2 columns x 4 rows. The eye mesh maps the big
 * open eye in column 0, row 3, so each cell is given relative to it.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  focus: [0, -1],
  half: [1, -2],
  closed: [0, -2],
  happy: [1, -1],
  hurt: [0, -3],
  wide: [1, -3],
};
