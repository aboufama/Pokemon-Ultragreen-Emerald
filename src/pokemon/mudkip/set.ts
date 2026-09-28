// Mudkip's battle animation set, made in the style of the first clips
// (src/pokemon/swampert/first.ts and more.ts: its line's final form, the
// reference every clip here starts from): a short list of key poses per
// clip, STANCE + small named deltas, extremes first. This file holds the
// helpers, the moments (idle, intro, hit, faint) and the category clips;
// ./set_motifs.ts holds the clips for the actions its moves need beyond them.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body, in its heights
//                   (leaps, rolls, spins; root.pitch + tips it nose down)
//   pelvis          the whole body over its four planted feet (a crouch, a
//                   lean in or back: the feet stay where they stand, rig.ts)
//   plantFeet / plantFront   foot IK: all four feet, or the front paws alone
//                   (0 frees them: in the air, rearing up, pawing)
//   expression      eye atlas cell (open, angry, half, happy, closed, focus, hurt)
// Events: impact (contact lands), release (projectile/stream/wave starts),
// releaseEnd, charge, cry, aura, emit, shrink, dig (a burrow goes under).
//
// How Mudkip moves (the brief in index.ts):
//   - it is small, light and springy (7.6 kg, 0.4 m): quick wind-ups, high
//     springing pounces with all four feet off the ground, quick landings
//     that squash into the front paws, strikes in a handful of frames;
//   - it is mostly head, and its head is its weapon: it rams and butts with
//     its crown, the fin on its head leading like a horn, the hind legs
//     driving the whole body in behind it;
//   - water comes from its wide mouth: a gulp with the head up, then the head
//     snaps forward and the jaw drops, braced on all four feet;
//   - it slaps with its big tail fin, flings mud with its front paws, and
//     raises waves by rearing up with its whole body and coming down on them;
//   - the fin on its head is its radar: it tips it at the foe.
// The animator adds overlapping action (the head, jaw and head fin trail the
// body by 0.045 s, index.ts `overlap`, so events that depend on them sit a
// little after their key; the legs do not trail), breathing, blinks and the
// springs on the head fin and the tail fin.
//
// Staying clear of the healthboxes (tools/gauntlet/uiclear.mjs): from our side
// only its top half shows above the text box and the foe's box sits over its
// head fin, so nothing rears up far; as the foe its feet stand on the top edge
// of our box, so at home nothing reaches down in front of its front paws.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** How far the front half (spine, neck and head) is pitched forward, in degrees. */
const pitchOf = (p: Pose): number => (p.bones?.spine?.x ?? 0) + (p.bones?.neck?.x ?? 0) + (p.bones?.head?.x ?? 0);
const STANCE_PITCH = pitchOf(STANCE);
/**
 * Keeps the head fin up when the head tips back (most of the back pitch taken
 * off the fin): from our side a fin thrown back with the head points at the
 * camera and the head reads as a round stub. A rotation about the body's own
 * side-to-side axis after everything else (`post`): the fin stands turned a
 * little toward its right, and a pitch inside that turn leaned it sideways. A
 * fin tipped forward on purpose (fin()) is left as it is.
 */
const finUp = (p: Pose): Pose => {
  const back = Math.min(0, pitchOf(p) - STANCE_PITCH);
  return back ? compose(p, { post: { fin: { x: -0.9 * back } } }) : p;
};
/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace), the head fin kept up. */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: finUp(compose(STANCE, ...deltas)) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, drops). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FOCUS: Pose = { expression: 'focus' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
/** Eyes squeezed shut (><): a wince, or all its effort in a ram. */
const SQUEEZE: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
/** Jaw relative to the stance's shut smile: jaw(30) opens it wide. */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The front half's pitch (+ forward and down): the spine (the chest and the
 * front legs, from the hips), the neck and the big head, with the head's turn
 * (y, + toward its left) and tilt (z).
 */
const bend = (spine: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The hindquarters' pitch: + tips the rump up behind it, - sits it down. */
const hips = (deg: number): Pose => ({ bones: { hips: { x: deg } } });
/** The tail fin: + raises it, y swings it toward its left. */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });
/** The head fin: + tips it forward (at the foe, leading a ram), about the body's side-to-side axis, on top of what finUp() keeps up. */
const fin = (x: number): Pose => ({ post: { fin: { x } } });
/** Both front legs aimed (model space): shoulder to elbow, elbow to paw. */
const front = (arm: Vec3, forearm: Vec3): Pose => ({
  aim: { armL: { dir: arm }, forearmL: { dir: forearm }, armR: { dir: arm }, forearmR: { dir: forearm } },
});
/** One front leg aimed (the other keeps its own aim). */
const paw = (side: 'L' | 'R', arm: Vec3, forearm: Vec3): Pose => ({
  aim: { [`arm${side}`]: { dir: arm }, [`forearm${side}`]: { dir: forearm } },
});
/** Both hind legs: thigh, shin and foot pitch (+ swings them back). */
const hind = (thigh: number, shin: number, foot = 0): Pose => ({
  bones: { thighL: { x: thigh }, thighR: { x: thigh }, shinL: { x: shin }, shinR: { x: shin }, footL: { x: foot }, footR: { x: foot } },
});

/** Front paws reaching forward for the foe (a pounce). */
const FRONT_REACH = front([0, -0.45, 0.89], [0, -0.2, 0.98]);
/** Front paws folded up under the chest (curled in the air). */
const FRONT_TUCK = front([0, -0.5, 0.87], [0, -0.9, -0.44]);
/** Front paws raised in front of the chest (rearing up). */
const FRONT_UP = front([0, 0.1, 0.99], [0, -0.45, 0.89]);

/**
 * Coiled to pounce, like a cat or a pup at play: flattened low, the rump up
 * behind, the head tipped up to keep its eyes on the foe, the tail fin
 * raised. (The chest stays level: dipped too, its short front legs had no
 * room left and the elbows went into the ground.)
 */
const COIL: Pose = compose(pelvis(0, -0.06, -0.03), hips(8), bend(4, -4, -16), tail(26));
/** The rump wiggling in the coil (side +1 toward its left, -1 its right). */
const wiggle = (side: number): Pose => compose(pelvis(0.012 * side, 0, 0), { bones: { hips: { z: 5 * side } } }, tail(0, 12 * side));
/** Airborne, stretched out in a pounce: front paws reaching, hind legs thrust out behind. */
const LEAP: Pose = compose({ plantFeet: 0, plantFront: 0 }, FRONT_REACH, hind(55, -15, 20));
/** Airborne, curled: all four legs drawn in (the top of a spring). */
const TUCK: Pose = compose({ plantFeet: 0, plantFront: 0 }, FRONT_TUCK, hind(-35, 50));
/** Airborne, dropping: the legs hang as they stand, reaching for the ground (feet free). */
const DROP: Pose = { plantFeet: 0, plantFront: 0 };
/** Hopping: the legs drawn in a little. */
const HOP: Pose = compose({ plantFeet: 0, plantFront: 0 }, front([0, -0.8, 0.6], [0, -0.95, -0.3]), hind(-18, 28));
/** Landing: the front paws take it, the chest dips and the knees give. */
const LAND: Pose = compose({ plantFeet: 1, plantFront: 1 }, pelvis(0, -0.05, 0.015), bend(8, 2, -6));
/** Landing home from a hop: the knees give, the chest comes up a little (the body carries on back). */
const LAND_HOME: Pose = compose({ plantFeet: 1, plantFront: 1 }, pelvis(0, -0.045, -0.01), bend(-2, 0, 2));

// Battle moments --------------------------------------------------------------

/** Idle: easy breathing, the tail fin swaying a little; the life layer adds the rest. */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.008), bend(2, 0, -1), fin(1), tail(3, 5)),
    key(2.4),
  ],
};

/**
 * Sent out: curled up small with its eyes shut, it springs up in a bouncy
 * hop (the stock front anim stretches it twice), lands on its front paws,
 * then rocks back onto its haunches and cries with its mouth wide (a moving
 * hold, the head swaying), and drops back into its stance with a wag. The
 * hop is low: from our side a high one took the head fin under the foe's
 * healthbox.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.7,
  keys: [
    key(0, pelvis(0, -0.07, -0.035), hips(-4), bend(8, 4, 12), tail(-14), SHUT),
    // Curls up tighter.
    key(0.2, pelvis(0, -0.085, -0.04), hips(-5), bend(10, 4, 14), tail(-18), SHUT),
    // Springs up, uncurling, the head coming up.
    snap(0.38, { root: { y: 0.13 } }, TUCK, bend(-4, -2, -8), tail(16), jaw(10), HAPPY),
    key(0.5, { root: { y: 0.15 } }, TUCK, bend(-6, -3, -10), tail(20), jaw(14), HAPPY),
    // Lands on its front paws, squashing.
    fall(0.64, LAND, bend(2, 0, 0), tail(4), jaw(4), ANGRY),
    key(0.72, LAND, pelvis(0, -0.012, 0), bend(3, 0, 2), tail(0), jaw(2), ANGRY),
    // The cry: rocks back onto its haunches, head up, mouth wide.
    snap(0.88, pelvis(0, 0.004, -0.03), hips(-4), bend(-12, -4, -12), tail(20), jaw(34), ANGRY),
    key(1.04, pelvis(0, 0.006, -0.032), hips(-4), bend(-13, -4, -13, 6, 4), tail(22), jaw(36), ANGRY),
    key(1.2, pelvis(0, 0.005, -0.031), hips(-4), bend(-12, -4, -13, -6, -4), tail(21), jaw(34), ANGRY),
    // Drops back onto its front paws and wags its tail fin once.
    key(1.36, pelvis(0, -0.02, 0.006), bend(4, 1, 0), jaw(6), tail(4, 14), ANGRY),
    key(1.5, pelvis(0, -0.01), bend(2, 0, 0), jaw(2), tail(2, -8), ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.94, name: 'cry' }],
};

/** Taking a hit: the head snaps back, the body jerks back on its feet, the tail fin flicks up; it digs back in. */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.02, -0.03), bend(-10, -6, -14), tail(18), jaw(12), SQUEEZE),
    key(0.2, pelvis(0, -0.012, -0.014), bend(-4, -2, -6), tail(8), jaw(4), SQUEEZE),
    key(0.36, pelvis(0, -0.008, 0.006), bend(3, 1, 3), tail(-2), SQUEEZE),
    key(0.6, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * its eyes half shut, then its legs fold and it settles down onto its belly,
 * head bowed, the tail fin drooping round, eyes shut; from the 'shrink' the
 * curled body shrinks away. It settles back over its hind legs: bowed forward,
 * the foe's head came down onto our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.75,
  keys: [
    key(0),
    key(0.22, pelvis(0.01, -0.015, -0.01), bend(-4, -2, -8, 0, 6), tail(4), DROWSY),
    key(0.52, pelvis(-0.004, -0.05, -0.025), hips(-3), bend(6, 3, 8, 0, -4), tail(-10, 6), SHUT),
    key(0.86, pelvis(0, -0.078, -0.035), hips(-4), bend(9, 5, 12, 0, -7), tail(-20, 12), SHUT),
    key(1.0, pelvis(0, -0.082, -0.036), hips(-4), bend(10, 5, 13, 0, -7), tail(-22, 13), SHUT),
    key(1.75, pelvis(0, -0.08, -0.035), hips(-4), bend(9, 5, 12, 0, -6), tail(-21, 12), SHUT),
  ],
  events: [{ t: 1.1, name: 'shrink' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Weak contact (Tackle, Facade, Secret Power, Struggle): a headbutt. After
 * Swampert's shoulder charge, led by the head as Blaziken's peck is: it
 * flattens low to pounce, eyes on the foe, springs at it in one arc, lands on its front paws and cocks its head, then drives
 * its crown into the foe with the head fin leading and the hind legs pushing
 * the whole body in behind it; it bounces back off, shaking its head, and
 * hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Coil: it flattens low to pounce, eyes on the foe...
    key(0.12, COIL, ANGRY),
    // ...and sinks a little deeper, the tail fin twitching (a moving hold).
    key(0.22, COIL, pelvis(0, -0.01, -0.006), bend(1, 0, -2), tail(4, 6), ANGRY),
    // The pounce, stretched out along its arc.
    key(0.36, { advance: 0.55, root: { y: 0.2, pitch: 2 } }, LEAP, bend(0, -4, -10), tail(8), ANGRY),
    // Lands on its front paws in front of the foe; the head cocks back.
    key(0.48, { advance: 1 }, LAND, bend(-4, -6, -12), ANGRY),
    // The butt: crown first, the fin leading, the hind legs driving the body in.
    snap(0.55, { advance: 1 }, pelvis(0, -0.03, 0.05), hips(8), bend(10, 12, 22), fin(12), tail(-14), SQUEEZE),
    // Presses in a moment (follow-through).
    key(0.66, { advance: 1 }, pelvis(0, -0.032, 0.054), hips(9), bend(11, 12, 24, 3), fin(12), tail(-16), SQUEEZE),
    // Bounces back off, shaking its head, and hops home.
    key(0.8, { advance: 1 }, pelvis(0, -0.03, -0.01), bend(-2, -2, -6, 7), tail(6), ANGRY),
    key(0.94, { advance: 0.45, root: { y: 0.12 } }, HOP, bend(2, 0, -2, -6), tail(10), ANGRY),
    key(1.06, { advance: 0 }, LAND_HOME, ANGRY),
    key(1.18, pelvis(0, -0.015), bend(2, 1, 0), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.59, name: 'impact' }],
};

/**
 * Strong contact (Take Down, Double-Edge, Body Slam, Return, Frustration,
 * Strength, Waterfall, Endeavor, Bide): the whole body as a weapon, after
 * Swampert's belly slam. It flattens to pounce with its rump wiggling,
 * springs high over the field, and comes down chest and crown first onto the
 * foe with all its weight, squashes into it, shoves off and hops home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.05,
  keys: [
    key(0),
    // Coil: it flattens low to pounce...
    key(0.2, COIL, pelvis(0, -0.01, -0.005), ANGRY),
    // ...its rump wiggling from side to side, winding up (a moving hold).
    key(0.32, COIL, pelvis(0, -0.012, -0.008), wiggle(1), ANGRY),
    key(0.42, COIL, pelvis(0, -0.014, -0.01), wiggle(-1), ANGRY),
    // The spring: up and in, stretched out, nose up.
    snap(0.56, { advance: 0.4, root: { y: 0.28, pitch: -10 } }, LEAP, bend(-6, -4, -10), tail(10), jaw(6), ANGRY),
    // The top of the arc: it curls to come down on the foe.
    key(0.7, { advance: 0.74, root: { y: 0.34, pitch: 8 } }, TUCK, bend(4, 2, 6), fin(6), tail(18), ANGRY),
    // The crash: chest and crown first onto the foe.
    fall(0.82, { advance: 1, root: { y: 0.06, pitch: 28 } }, LEAP, pelvis(0, 0, 0.02), bend(10, 6, 14), fin(8), tail(-6), SQUEEZE),
    key(0.88, { advance: 1, root: { y: 0, pitch: 30 } }, LEAP, pelvis(0, -0.04, 0.02), bend(12, 6, 16), fin(8), tail(-10), SQUEEZE),
    key(1.0, { advance: 1, root: { y: 0.01, pitch: 25 } }, LEAP, pelvis(0, -0.03, 0.02), bend(10, 6, 15, 4), fin(8), tail(-8), SQUEEZE),
    // Shoves off and plants its feet again, shaking its head.
    key(1.16, { advance: 1 }, LAND, pelvis(0, -0.005, 0), bend(3, 0, 0), ANGRY),
    key(1.3, { advance: 1 }, LAND, pelvis(0, 0.01, -0.01), bend(-4, -2, 4, -5), ANGRY),
    // Hops home.
    key(1.46, { advance: 0.45, root: { y: 0.12 } }, HOP, ANGRY),
    key(1.6, { advance: 0 }, LAND_HOME, ANGRY),
    key(1.76, pelvis(0, -0.015), bend(2, 1, 0), ANGRY),
    key(2.05, OPEN_EYES),
  ],
  events: [{ t: 0.86, name: 'impact' }],
};

/**
 * Bide's turn of storing energy (a two-turn move's first turn plays its clip's
 * _charge, src/remake/acting.ts; the unleashing turn plays physical_strong):
 * it dips, then stiffens up tall, chest out, eyes squeezed shut and the tail
 * fin held stiff, trembling harder and harder with the energy it holds in,
 * and lets it settle back into its stance.
 */
const physicalStrongCharge: Clip = {
  name: 'physical_strong_charge',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.03, -0.006), bend(4, 2, 6), tail(4), ANGRY),
    // Stiffens up tall, chest out, holding it in.
    snap(0.28, pelvis(0, 0.02, -0.018), hips(-5), bend(-9, -3, -7), tail(26), SQUEEZE),
    // Trembling harder and harder (a moving hold).
    key(0.38, pelvis(0.006, 0.02, -0.018), hips(-5), bend(-9, -3, -7, 3, 3), tail(26, 4), SQUEEZE),
    key(0.47, pelvis(-0.009, 0.021, -0.019), hips(-5), bend(-10, -3, -7, -4, -4), tail(27, -6), SQUEEZE),
    key(0.56, pelvis(0.012, 0.021, -0.019), hips(-5), bend(-10, -3, -8, 5, 5), tail(27, 8), SQUEEZE),
    key(0.65, pelvis(-0.014, 0.022, -0.02), hips(-5), bend(-10, -3, -8, -6, -6), tail(28, -9), SQUEEZE),
    key(0.74, pelvis(0.016, 0.022, -0.02), hips(-5), bend(-11, -3, -8, 7, 6), tail(28, 10), SQUEEZE),
    key(0.83, pelvis(-0.016, 0.022, -0.02), hips(-5), bend(-11, -3, -8, -7, -6), tail(28, -10), SQUEEZE),
    // Settles, still holding it.
    key(0.98, pelvis(0, -0.02, -0.006), bend(3, 1, 2), tail(6), ANGRY),
    key(1.18, pelvis(0, -0.012), bend(2, 1, 0), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'charge' }],
};

/**
 * Weak ranged (Water Gun, Water Pulse, Hidden Power): a gulp with the head
 * up and the mouth shut, then the head snaps forward, the jaw drops and it
 * spits, braced on all four feet; the head bobs back as the mouth closes.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // The gulp: rocks back, head up, mouth shut, the tail fin lifting.
    key(0.24, pelvis(0, 0.008, -0.025), bend(-6, -4, -12), tail(10), ANGRY),
    // The spit: the head drives forward, the jaw drops.
    snap(0.33, pelvis(0, -0.025, 0.03), bend(6, 4, 2), jaw(30), tail(-6), ANGRY),
    // Recoil: the head bobs back up as the mouth closes a little.
    key(0.5, pelvis(0, -0.012, 0.01), bend(2, 2, -6), jaw(12), tail(2), ANGRY),
    key(0.7, pelvis(0, -0.005), bend(1, 1, -1), jaw(3), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

/**
 * Strong ranged (Ice Beam, Hydro Pump, Blizzard, Icy Wind): rocks back onto
 * its haunches with its head up and draws in power at the mouth, eyes shut,
 * then drops into a low brace on all four feet and fires a sustained blast
 * from its jaws; the recoil pushes it back while its head holds the aim.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.02), bend(4, 0, 4)),
    // Gather: back on its haunches, chest up, head back, eyes shut.
    key(0.52, pelvis(0, 0.012, -0.03), hips(-4), bend(-10, -4, -14), tail(16), SHUT),
    key(0.68, pelvis(0, 0.016, -0.034), hips(-4), bend(-11, -5, -15, 0, 2), tail(18), SHUT),
    // Fire: drops into the brace, the head drives forward, jaw wide.
    snap(0.8, pelvis(0, -0.05, 0.02), hips(4), bend(8, 4, 0), jaw(32), tail(-8), ANGRY),
    // Sustain: the recoil pushes it back; a tremor, the head holding the aim.
    key(1.0, pelvis(0, -0.046, 0.004), { root: { z: -0.012 } }, hips(3), bend(7, 4, -1, 4), jaw(30), tail(-6), ANGRY),
    key(1.24, pelvis(0, -0.052, -0.004), { root: { z: -0.022 } }, hips(3), bend(8, 4, 0, -4, -2), jaw(33), tail(-8), ANGRY),
    key(1.46, pelvis(0, -0.047, -0.01), { root: { z: -0.028 } }, hips(3), bend(7, 4, -1, 3, 2), jaw(30), tail(-6), ANGRY),
    key(1.66, pelvis(0, -0.05, -0.014), { root: { z: -0.032 } }, hips(3), bend(8, 4, 0, -1), jaw(32), tail(-7), ANGRY),
    // The mouth closes; it straightens and shakes it off.
    key(1.86, pelvis(0, -0.03, -0.008), { root: { z: -0.02 } }, bend(2, 1, -4, 6), jaw(0), tail(2), ANGRY),
    key(2.0, pelvis(0, -0.015), { root: { z: -0.01 } }, bend(1, 0, -2, -5), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.86, name: 'release' }, { t: 1.72, name: 'releaseEnd' }],
};

/**
 * Self-targeting status (Rain Dance, Hail, Sleep Talk, Curse): after
 * Swampert's call to the sky. It crouches small with its eyes shut, then
 * rears up onto its haunches, front paws lifting, and cries to the sky (a
 * moving hold), and comes back down onto its front paws.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.8,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.05, -0.02), bend(8, 4, 10), tail(-10), SHUT),
    key(0.42, pelvis(0, -0.055, -0.022), bend(9, 4, 11, 0, 1), tail(-12), SHUT),
    key(0.52, { plantFront: 0.5 }, pelvis(0, -0.03, -0.03), bend(-8, -2, -6), tail(6), jaw(6), ANGRY),
    // Rears up and cries to the sky.
    snap(0.6, { plantFront: 0 }, pelvis(0, -0.01, -0.05), hips(-10), bend(-26, -4, -12), FRONT_UP, tail(20), jaw(26), ANGRY),
    key(0.8, { plantFront: 0 }, pelvis(0, -0.008, -0.052), hips(-10), bend(-27, -4, -13, 5, 3), FRONT_UP, tail(22), jaw(30), ANGRY),
    key(1.0, { plantFront: 0 }, pelvis(0, -0.008, -0.052), hips(-10), bend(-27, -4, -13, -5, -3), FRONT_UP, tail(21), jaw(28), ANGRY),
    key(1.14, { plantFront: 0 }, pelvis(0, -0.014, -0.046), hips(-8), bend(-22, -3, -10), FRONT_UP, tail(16), jaw(16), ANGRY),
    // Comes back down onto its front paws.
    key(1.3, LAND, pelvis(0, 0.01, -0.01), bend(-2, 0, 4), jaw(4), ANGRY),
    key(1.46, pelvis(0, -0.02), bend(3, 1, 0), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'aura' }],
};

/** Status aimed at the foe (Growl, Toxic, Snore, Uproar): rocks back, then lunges its head in and bellows, the head swaying. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.008, -0.03), bend(-6, -4, -12), tail(12), ANGRY),
    snap(0.3, pelvis(0, -0.03, 0.04), hips(4), bend(10, 6, -4), jaw(30), tail(-6), ANGRY),
    key(0.5, pelvis(0, -0.03, 0.04), hips(4), bend(10, 6, -4, 7, 3), jaw(32), tail(-4), ANGRY),
    key(0.7, pelvis(0, -0.028, 0.036), hips(4), bend(9, 6, -4, -7, -3), jaw(30), tail(-6), ANGRY),
    key(0.9, pelvis(0, -0.015, 0.012), bend(3, 2, 0), jaw(4), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, physicalStrong, physicalStrongCharge, specialWeak, specialStrong, statusSelf, statusTarget].map((c) => [c.name, c]),
);

/** Eye atlas (pm0258_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  focus: [1, 2],
  hurt: [0, 3],
};

// The helpers, for the clips of ./set_motifs.ts.
export {
  key, snap, fall, ANGRY, FOCUS, HAPPY, SHUT, DROWSY, SQUEEZE, OPEN_EYES, jaw, pelvis, bend, hips, tail, fin, front, paw, hind,
  FRONT_REACH, FRONT_TUCK, FRONT_UP, COIL, LEAP, TUCK, DROP, HOP, LAND, LAND_HOME,
};
