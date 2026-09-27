// Mudkip's battle animation set: one clip per attack category (+ idle, intro,
// hit, faint), motif clips for the actions its moves need (fling, glare,
// kick_sand, weather, charm, heal) and Bide's own. Keys are STANCE + deltas
// (see compose()); the structure follows src/pokemon/blaziken/clips.ts.
//
// Channels used here:
//   root     model-unit offset/rotation of the whole body (only leans and
//            rolls: every clip acts in place, the compiled game moves the sprite)
//   pelvis   the whole body over its four feet (a crouch, a lean in or back)
//   plantFeet / plantFront   foot IK (the front legs are planted like the hind
//            legs; plantFront 0 frees the front paws)
//   expression   eye atlas cell (open, angry, half, happy, closed, focus, hurt)
// Events: impact (contact lands), release (the water or mud leaves),
// releaseEnd, charge, cry, aura, emit, shrink.
//
// How Mudkip moves (the brief in index.ts):
//   - it is a 7.6 kg pup that is mostly head, on four short legs: it acts
//     with its whole big head, low to the ground, from four planted feet;
//   - it rams head first: the haunches load, the hind legs drive and the
//     head goes down so the fin leads like a ram's horn, then it bounces off
//     and shakes the daze out of its head;
//   - water comes from its wide mouth: the head snaps forward, the jaw drops
//     and the body braces on all fours against the push;
//   - mud is its element: it scoops mud with its chin and tosses it at the
//     foe with a flick of its head (Mud-Slap), paws it up (Mud Sport);
//   - its head fin is a radar (Foresight tips it at the foe), and it rocks
//     back onto its haunches to cry;
//   - the fin on its head and its tail fin are springs (profile.dynamics):
//     every stop sets them wobbling, so clips key only their pose.
//
// Timing with the compiled game: a clip starts on the first frame of the
// move's animation, and the game's own sprite motion runs from there (Tackle
// lunges 16 px out and back over frames 0-8, its hit splat on frame 6; Take
// Down winds back for 23 frames, holds 10 and lunges on frame 33, the splat
// on frame 35; Mud-Slap jerks back over frames 0-3 and forward over 3-5 as
// the mud flies; Water Gun's water leaves on frame 1; Growl's cry starts on
// frame 0). So the strikes come early, on the game's beat, and the acting
// continues after it (the rebound, the head shake).
//
// Overlapping action: the head (and the fin on it) trails the body by
// 0.045 s here (index.ts: Mudkip is mostly head, and a slower head arrived
// after the game's hit), so events that depend on the head sit ~0.04 s after
// its key. Springs on the head fin and tail fin, breathing and blinks come
// from the animator.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FOCUS: Pose = { expression: 'focus' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
/** Jaw relative to the stance's shut mouth: jaw(34) opens it wide. */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The front half's pitch: spine (from the hips: the chest dips or rises and
 * the front legs bend or straighten to stay planted), neck and head, with
 * the head's turn (y) and tilt (z).
 */
const bend = (spine: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The hips tip forward (+): the hind legs swing back and push; the tail rises. */
const hips = (deg: number): Pose => ({ bones: { hips: { x: deg } } });
/** Tail fin: raised (+x) and swung toward its left (+y). */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });
/** Head fin: tipped forward (+x) at the foe, turned (y). */
const fin = (x: number, y = 0): Pose => ({ bones: { fin: { x, y } } });
/**
 * Keeps the head fin upright while the head tips back: from our side a fin
 * thrown back with the head points at the camera and the head reads as a
 * round stub. A post rotation about the model's X axis at the fin's base
 * (`bones.fin.x`, applied after the stance's twist, tips it sideways). Each
 * key gives 90% of its spine + neck + head back-pitch; the fin trails the
 * body like the head (index.ts overlap), so the two stay matched.
 */
const finUp = (deg: number): Pose => ({ post: { fin: { x: deg } } });

/** The ram: the hind legs drive, the spine and head go down so the crown and fin lead. */
const RAM = (push: number): Pose => compose(
  pelvis(0, 0.002 * push, 0.026 * push),
  hips(12 * push),
  bend(14 * push, 10 * push, 24 * push),
  tail(-18 * push),
);

// Battle moments --------------------------------------------------------------

/**
 * Idle: the life layer breathes, shifts its weight and drifts its gaze; on
 * top, a slow head tilt and an easy wag of the tail fin (twice per head
 * tilt). The fin and tail fin sway on their springs.
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.002), bend(0.5, 0, 1, 0, 1.5), tail(1, 7)),
    key(0.6, pelvis(0, -0.004), bend(1, 0, 1.5, 0, 3), tail(2, 0)),
    key(0.9, pelvis(0, -0.002), bend(0.5, 0, 1, 0, 1.5), tail(1, -7)),
    key(1.2, bend(0, 0, 0)),
    key(1.5, pelvis(0, -0.002), bend(0.5, 0, 1, 0, -1.5), tail(1, 7)),
    key(1.8, pelvis(0, -0.004), bend(1, 0, 1.5, 0, -3), tail(2, 0)),
    key(2.1, pelvis(0, -0.002), bend(0.5, 0, 1, 0, -1.5), tail(1, -7)),
    key(2.4),
  ],
};

/**
 * Sent out (or the wild one's cry): curled up small with its eyes shut, it
 * pops up onto its haunches with its head thrown up and its mouth wide in a
 * cheerful cry (a moving hold, the head swaying), comes back down onto its
 * front paws and settles with a wag of its tail fin. The rear is modest:
 * from our side the foe's healthbox sits just above the head fin.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.8,
  keys: [
    key(0, pelvis(0, -0.055), bend(12, 6, 20), tail(-20), SHUT),
    key(0.22, pelvis(0, -0.066), bend(14, 8, 23), tail(-24), SHUT),
    // Pops up onto its haunches: chest up, head thrown back, mouth wide.
    // (Sent out, the game grows it out of the ball tinted for ~0.4 s: the
    // cry comes as the tint fades.)
    snap(0.44, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-21, -2, -5), tail(22), finUp(25), jaw(34), HAPPY),
    key(0.62, { plantFront: 0.3 }, pelvis(0, 0.005, -0.017), bend(-22, -2, -6, 6, 5), tail(24, 8), finUp(27), jaw(32), HAPPY),
    key(0.8, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-21, -2, -5, -6, -5), tail(23, -8), finUp(25), jaw(35), HAPPY),
    key(0.96, { plantFront: 0.3 }, pelvis(0, 0.004, -0.016), bend(-20, -2, -4, 3, 2), tail(22, 2), finUp(23), jaw(28), HAPPY),
    // Down onto its front paws, mouth closing, pleased, a wag of the tail fin.
    key(1.14, { plantFront: 1 }, pelvis(0, -0.014, 0.004), bend(3, 1, 6), tail(4), jaw(4), HAPPY),
    key(1.3, pelvis(0, -0.008), bend(1, 0, 2, 0, 3), tail(2, 12), OPEN_EYES),
    key(1.46, pelvis(0, -0.004), bend(0.5, 0, 1, 0, -2), tail(1, -10), OPEN_EYES),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Taking a hit: the head snaps back and up with a wince, the tail fin flicks up; it shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0.004, -0.02), bend(-10, -4, -16), finUp(27), tail(16), jaw(10), HURT),
    key(0.2, pelvis(0, 0, -0.01), bend(-4, -2, -7), finUp(12), tail(8), jaw(4), HURT),
    key(0.36, pelvis(0, -0.006, 0.004), bend(3, 1, 4), tail(-3), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway with
 * its eyes half shut, then its legs fold and it lies down on its belly like a
 * sleeping pup, head resting tilted on its front paws, eyes shut and the tail
 * fin curled round its side; from the 'shrink' the curled body shrinks away
 * (Battler3D). It settles back as it lies down: as the foe, a head laid
 * forward in front of its feet went under our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.004), bend(-4, 0, -6, 0, 5), finUp(9), DROWSY),
    key(0.48, pelvis(0, -0.045), { root: { z: -0.02 } }, bend(4, 2, 5, 5, -6), tail(-10, 12), DROWSY),
    key(0.82, pelvis(0, -0.1), { root: { z: -0.04 } }, bend(9, 3, 7, 10, -14), tail(-30, 40), jaw(-2), SHUT),
    key(0.96, pelvis(0, -0.104), { root: { z: -0.04 } }, bend(10, 3, 8, 10, -15), tail(-31, 42), jaw(-2), SHUT),
    key(1.6, pelvis(0, -0.1), { root: { z: -0.04 } }, bend(9, 3, 7.5, 10, -14), tail(-30, 41), jaw(-2), SHUT),
  ],
  events: [{ t: 1.02, name: 'shrink' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Tackle (physical_weak; the tackle motif: Facade, Secret Power): the head
 * dips and the haunches load, then the hind legs drive and the head goes
 * down so its crown and fin ram the foe, on the game's lunge (frames 0-8,
 * the splat on 6). It bounces off, head flung up, rocks back, and shakes the
 * daze out of its head.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.95,
  keys: [
    key(0),
    // The head dips and the haunches load for an instant: the game's lunge
    // is already under way (and the blend from idle takes a few frames).
    key(0.03, pelvis(0, -0.016, -0.006), bend(3, 1, 7), tail(8), ANGRY),
    snap(0.07, RAM(1), ANGRY),
    key(0.14, RAM(1.04), ANGRY),
    // Bounces off: the head flies up, the body rocks back onto its haunches.
    snap(0.3, pelvis(0, -0.008, -0.012), hips(-4), bend(-7, -3, -12), finUp(20), tail(10), jaw(6), ANGRY),
    key(0.42, pelvis(0, -0.012, 0.002), bend(2, 0, 4), tail(2), ANGRY),
    // Shakes its head, the fin wobbling.
    key(0.5, pelvis(0, -0.01), bend(1, 0, 3, 5, 14), tail(0, 8), SHUT),
    key(0.58, pelvis(0, -0.008), bend(1, 0, 3, -5, -14), tail(0, -8), SHUT),
    key(0.66, pelvis(0, -0.006), bend(0.5, 0, 2, 3, 8), tail(0, 4), ANGRY),
    key(0.74, pelvis(0, -0.004), bend(0, 0, 1, -1, -3), ANGRY),
    key(0.95, OPEN_EYES),
  ],
  events: [{ t: 0.09, name: 'impact' }],
};

/**
 * Take Down (physical_strong; the strong tackles: Double-Edge, Return,
 * Frustration, Endeavor, Strength, Waterfall): it backs into a low crouch with its head lowered
 * like a bull (the game winds its sprite back for 23 frames), holds there
 * quivering with its tail fin lashing, then rams with everything it has (the
 * game's lunge, the splat on frame 35) and presses through the foe. The
 * recoil hurts: it rocks back wincing and shakes it off.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.65,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.03, -0.018), hips(-3), bend(7, 4, 14), tail(16), ANGRY),
    key(0.38, pelvis(0, -0.05, -0.028), hips(-6), bend(10, 6, 20), tail(24, 6), ANGRY),
    // Holding, quivering, the tail fin lashing.
    key(0.46, pelvis(0, -0.052, -0.03), hips(-6), bend(10.5, 6, 21, 0, 1.5), tail(25, -8), ANGRY),
    key(0.54, pelvis(0, -0.053, -0.03), hips(-6), bend(11, 6, 21, 0, -1.5), tail(26, 8), ANGRY),
    // The ram: everything behind it, the hind legs straight out behind and
    // the tail fin streaming. (The head goes no lower than Tackle's: as the
    // foe, a face driven down in front of its feet went under our healthbox.)
    snap(0.61, RAM(1.04), hips(5), pelvis(0, 0.006, -0.004), tail(-8), ANGRY),
    key(0.7, RAM(1.06), hips(5), pelvis(0, 0.006, -0.004), tail(-9), ANGRY),
    // Pressing through the foe as it is shoved and shaken.
    key(0.88, RAM(0.9), pelvis(0, -0.004, -0.006), ANGRY),
    // The recoil: it rocks back wincing.
    snap(1.02, pelvis(0, -0.008, -0.014), hips(-4), bend(-8, -3, -14), finUp(22), tail(12), jaw(8), HURT),
    key(1.14, pelvis(0, -0.012, -0.01), bend(-3, -1, -5, 0, 8), finUp(8), tail(6, 6), HURT),
    key(1.24, pelvis(0, -0.012, -0.006), bend(0, 0, 0, 0, -8), tail(3, -6), HURT),
    key(1.34, pelvis(0, -0.01, -0.002), bend(1, 0, 2, 0, 4), ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

/**
 * Water Gun (special_weak; the spit motif: Water Pulse): a quick gulp with
 * the head up, then the head snaps forward and the jaw drops wide as the
 * water shoots out (the game's water leaves on frame 1); braced on all four
 * feet it holds the mouth open while the stream flies, then shuts it with a
 * bob of the head.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.1,
  keys: [
    key(0),
    // A quick gulp: the head pulls up and back, chest up, mouth shut tight.
    key(0.05, pelvis(0, 0.004, -0.008), bend(-7, -3, -12), finUp(20), tail(8), FOCUS),
    // Spit: the front of the body drives down and forward at the foe while
    // the head stays level, so the wide jaws face it; braced on all fours.
    snap(0.11, pelvis(0, -0.018, -0.012), bend(11, 4, -2), tail(-8), jaw(38), ANGRY),
    key(0.2, pelvis(0, -0.017, -0.016), bend(10, 4, -3), tail(-8), jaw(40), ANGRY),
    key(0.33, pelvis(0, -0.019, -0.018), bend(11, 4, -2, 4), tail(-9), jaw(38), ANGRY),
    key(0.46, pelvis(0, -0.017, -0.017), bend(10, 4, -3, -4), tail(-8), jaw(37), ANGRY),
    // The mouth shuts and the head comes back up.
    key(0.6, pelvis(0, -0.008, -0.006), bend(1, 0, 0), tail(0), jaw(2), ANGRY),
    key(0.76, pelvis(0, -0.008), bend(1.5, 0, 2), ANGRY),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.15, name: 'release' }],
};

/**
 * Hydro Pump (special_strong; the jet motif, and Ice Beam's beam): it plants
 * all four feet low and draws breath with its head up, then fires from its
 * wide jaws; the jet pushes it back onto its haunches, a little further
 * with every beat, while its head sweeps the stream across the foe (the
 * game shakes its sprite for 40 frames). The mouth shuts and it shakes the
 * water off.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.1,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.03), hips(-3), bend(-6, -4, -10), finUp(18), tail(14), jaw(-2), FOCUS),
    snap(0.2, pelvis(0, -0.045, -0.016), bend(6, 2, 6), tail(-10), jaw(36), ANGRY),
    // The jet pushes it back onto its haunches, a little more every beat,
    // while its head sweeps the stream across the foe.
    key(0.36, pelvis(0, -0.043, -0.026), bend(5, 2, 5, 6, 2), tail(-11, 6), jaw(38), ANGRY),
    key(0.54, pelvis(0, -0.047, -0.03), bend(6.5, 2, 6.5, -6, -2), tail(-9, -6), jaw(35), ANGRY),
    key(0.72, pelvis(0, -0.043, -0.036), bend(5, 2, 5, 6, 3), tail(-12, 7), jaw(38), ANGRY),
    key(0.9, pelvis(0, -0.048, -0.04), bend(7, 2, 7, -6, -3), tail(-9, -7), jaw(35), ANGRY),
    key(1.08, pelvis(0, -0.044, -0.044), bend(5, 2, 5, 4, 1), tail(-12, 4), jaw(38), ANGRY),
    // The mouth shuts, the head comes up.
    key(1.26, pelvis(0, -0.02, -0.01), bend(-4, -2, -8), finUp(13), tail(4), jaw(4), ANGRY),
    // Shakes the water off.
    key(1.4, pelvis(0, -0.012, -0.004), bend(0, 0, 0, 0, 9), tail(2, 8), ANGRY),
    key(1.5, pelvis(0, -0.01, -0.002), bend(0, 0, 0, 0, -9), tail(2, -8), ANGRY),
    key(1.6, pelvis(0, -0.008), bend(0.5, 0, 1, 0, 4), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.05, name: 'charge' }, { t: 0.24, name: 'release' }, { t: 1.16, name: 'releaseEnd' }],
};

/**
 * Protect (status_self; the shield motif: Endure, Substitute, Defense Curl):
 * it hunkers down low on four planted feet, head tucked and eyes squeezed
 * shut, tail fin wrapped down, and holds there bracing (squeezing down
 * tighter in shaky breaths) as long as the game's barrier stands (90 frames
 * from frame 16); then it rises.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 2.0,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 2, 6), tail(-8), FOCUS),
    snap(0.3, pelvis(0, -0.06), bend(8, 6, 12), tail(-28), SHUT),
    // Bracing behind the barrier: it squeezes down tighter in shaky breaths,
    // the head burrowing in and the tail fin twitching.
    key(0.55, pelvis(0.004, -0.058), bend(7.5, 6, 11, 3, 3), tail(-26, 8), SHUT),
    key(0.8, pelvis(-0.004, -0.066), bend(9.5, 6, 14.5, -3, -3), tail(-31, -8), SHUT),
    key(1.05, pelvis(0.004, -0.06), bend(8, 6, 12, 3, 3), tail(-27, 8), SHUT),
    key(1.3, pelvis(-0.004, -0.068), bend(10, 6, 15, -3, -3), tail(-32, -8), SHUT),
    key(1.5, pelvis(0, -0.062), bend(8.5, 6, 13, 1, 1), tail(-28, 2), SHUT),
    key(1.68, pelvis(0, -0.026), bend(3, 2, 4), tail(-10), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Bide (moveClips): it stores up the blows it takes, then pays them back.
 * The game plays the move's clip on both kinds of turn: storing (its sprite
 * trembles red for 32 frames) and unleashing (the same, then a lunge over
 * frames 32-36 and hits on 36, 41 and 46). So it hunkers down trembling with
 * its eyes squeezed shut and its tail fin stiff, then bursts forward with
 * three quick butts of its head (on the unleashing turn the game's lunge
 * carries them into the foe) and settles.
 */
const bide: Clip = {
  name: 'bide',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.034, -0.01), bend(6, 4, 12), tail(18), SHUT),
    key(0.2, pelvis(0, -0.041, -0.012), bend(7, 4, 13, 0, 2), tail(20, 5), SHUT),
    key(0.28, pelvis(0, -0.044, -0.012), bend(7, 4, 13, 0, -2), tail(20, -5), SHUT),
    key(0.36, pelvis(0, -0.046, -0.013), bend(7.5, 4, 14, 0, 2), tail(21, 5), SHUT),
    key(0.44, pelvis(0, -0.047, -0.013), bend(7.5, 4, 14, 0, -2), tail(21, -5), SHUT),
    key(0.52, pelvis(0, -0.048, -0.014), bend(8, 4, 15, 0, 1), tail(22), ANGRY),
    // Unleashed: three butts of the head.
    snap(0.58, RAM(1.0), ANGRY),
    key(0.64, RAM(0.7), ANGRY),
    snap(0.68, RAM(1.0), ANGRY),
    key(0.73, RAM(0.7), ANGRY),
    snap(0.77, RAM(1.02), ANGRY),
    key(0.84, RAM(0.96), ANGRY),
    // Bounces off and settles.
    snap(0.98, pelvis(0, -0.008, -0.01), hips(-3), bend(-6, -2, -10), finUp(16), tail(10), jaw(6), ANGRY),
    key(1.12, pelvis(0, -0.01), bend(1, 0, 2), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }, { t: 0.7, name: 'impact' }, { t: 0.79, name: 'impact' }],
};

/**
 * Growl (status_target; the roar motif, and Attract, Swagger, Toxic): it
 * rears back drawing breath, then lunges its head at the foe with its mouth
 * wide and growls (the game's double cry starts on frame 0), head swaying
 * through both cries; the mouth shuts and it settles.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.3,
  keys: [
    key(0),
    // Rears back onto its haunches, drawing breath (the fin kept upright).
    key(0.08, { plantFront: 0.5 }, pelvis(0, 0.004, -0.016), bend(-15, -3, -8), finUp(23), tail(18), jaw(10), ANGRY),
    // Lunges its head at the foe, mouth wide: the growl, the head swaying.
    snap(0.16, { plantFront: 1 }, pelvis(0, -0.022, 0.012), bend(13, 3, -7), tail(-10), jaw(40), ANGRY),
    key(0.34, pelvis(0, -0.022, 0.012), bend(13, 3, -7, 11, 6), tail(-10, 8), jaw(37), ANGRY),
    key(0.5, pelvis(0, -0.024, 0.014), bend(14, 3, -6, -11, -6), tail(-11, -8), jaw(42), ANGRY),
    key(0.64, pelvis(0, -0.022, 0.012), bend(13, 3, -7, 9, 5), tail(-10, 7), jaw(38), ANGRY),
    key(0.78, pelvis(0, -0.018, 0.008), bend(9, 2, -4, -4, -2), tail(-7), jaw(28), ANGRY),
    key(0.94, pelvis(0, -0.008, 0.002), bend(2, 0, 1), tail(-2), jaw(4), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'emit' }],
};

// Motif clips -------------------------------------------------------------------

/**
 * Mud-Slap (fling): it scoops the mud with its chin, dipping its head to the
 * ground as the game jerks its sprite back (frames 0-3), then tosses its head
 * up and forward on the jerk forward and the mud flies at the foe from its
 * mouth; it shakes the mud off its face.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.15,
  keys: [
    key(0),
    snap(0.07, pelvis(0, -0.02, 0.008), bend(10, 8, 28), tail(10), jaw(8), ANGRY),
    key(0.1, pelvis(0, -0.021, 0.008), bend(10.5, 8, 29), tail(11), jaw(10), ANGRY),
    // The toss: the head whips up and forward, rocking back onto its haunches.
    snap(0.17, pelvis(0, -0.012, -0.02), bend(-14, -6, -16), finUp(32), tail(-6), jaw(26), ANGRY),
    key(0.24, pelvis(0, -0.012, -0.022), bend(-15, -6, -17), finUp(34), tail(-8), jaw(28), ANGRY),
    key(0.38, pelvis(0, -0.008, -0.01), bend(-5, -2, -5), finUp(11), tail(-2), jaw(6), ANGRY),
    // Shakes the mud off its face.
    key(0.54, pelvis(0, -0.008), bend(1, 0, 3, 0, 8), tail(0, 6), SHUT),
    key(0.64, pelvis(0, -0.007), bend(1, 0, 3, 0, -8), tail(0, -6), SHUT),
    key(0.74, pelvis(0, -0.005), bend(0.5, 0, 2, 0, 3), ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'release' }],
};

/**
 * Foresight, Mimic (glare): the fin on its head is its radar. It leans in
 * low, eyes narrowed, and tips the fin forward until it points at the foe;
 * the fin quivers and the head peers from side to side as it senses, then
 * it straightens up.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.018, 0.006), bend(3, 1, 5), fin(18, 10), FOCUS),
    snap(0.36, pelvis(0, -0.03, 0.012), bend(5, 2, 7), fin(46, 26), tail(-8), FOCUS),
    // Peering: the head swings slowly from side to side, the radar fin
    // following it, the weight shifting with it.
    key(0.55, pelvis(0.006, -0.031, 0.013), bend(5, 2, 7, 10, 4), fin(50, 34), tail(-8, -8), FOCUS),
    key(0.75, pelvis(-0.006, -0.03, 0.012), bend(5.5, 2, 7, -10, -4), fin(42, 18), tail(-9, 8), FOCUS),
    key(0.95, pelvis(0.004, -0.033, 0.015), bend(5, 2, 9, 6, 2), fin(50, 30), tail(-8, -5), FOCUS),
    key(1.15, pelvis(0, -0.016, 0.006), bend(2, 1, 3), fin(20, 10), tail(-3), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

/** Front paw raised (the other stays down): for pawing at the mud. */
const pawUp = (side: 'L' | 'R'): Pose => ({
  aim: { [`arm${side}`]: { dir: [0, -0.62, 0.78] }, [`forearm${side}`]: { dir: [0, -0.85, 0.52] } },
});
/** Front paw raking back through the mud. */
const pawBack = (side: 'L' | 'R'): Pose => ({
  aim: { [`arm${side}`]: { dir: [0, -0.9, -0.44] }, [`forearm${side}`]: { dir: [0, -0.8, -0.6] } },
});

/**
 * Mud Sport (kick_sand): it paws at the mud with its front paws, right then
 * left, raking it up, then shakes itself like a wet pup and splashes it all
 * about (the game bounces its sprite on top).
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.6,
  keys: [
    key(0, { plantFront: 1 }),
    key(0.12, { plantFront: 0 }, pelvis(0, -0.012, -0.006), bend(-4, 0, 4), pawUp('R'), ANGRY),
    snap(0.22, { plantFront: 0 }, pelvis(0, -0.018, 0.004), bend(4, 2, 12, 0, -4), pawBack('R'), tail(6), ANGRY),
    key(0.36, { plantFront: 0 }, pelvis(0, -0.012, -0.006), bend(-4, 0, 4), pawUp('L'), ANGRY),
    snap(0.46, { plantFront: 0 }, pelvis(0, -0.018, 0.004), bend(4, 2, 12, 0, 4), pawBack('L'), tail(6), ANGRY),
    // Then it shakes itself like a wet pup, the body rolling side to side
    // and the head swinging against it, splashing the mud all about.
    key(0.62, { plantFront: 1 }, pelvis(0.008, -0.012), { root: { roll: 7 } }, bend(2, 0, 2, -18, -10), { bones: { spine: { y: 10 } } }, tail(4, -22), HAPPY),
    key(0.76, { plantFront: 1 }, pelvis(-0.008, -0.012), { root: { roll: -7 } }, bend(2, 0, 2, 18, 10), { bones: { spine: { y: -10 } } }, tail(4, 22), HAPPY),
    key(0.9, { plantFront: 1 }, pelvis(0.008, -0.012), { root: { roll: 7 } }, bend(2, 0, 2, -18, -10), { bones: { spine: { y: 10 } } }, tail(4, -22), HAPPY),
    key(1.04, { plantFront: 1 }, pelvis(-0.005, -0.01), { root: { roll: -4 } }, bend(1, 0, 1, 10, 6), { bones: { spine: { y: -6 } } }, tail(3, 12), HAPPY),
    key(1.2, { plantFront: 1 }, pelvis(0, -0.006), bend(0.5, 0, 1, -2, -1), tail(1, -4), OPEN_EYES),
    key(1.6, { plantFront: 1 }),
  ],
  events: [{ t: 0.22, name: 'emit' }],
};

/**
 * Rain Dance, Hail (weather): it rocks back onto its haunches and turns its
 * face up to the sky with its eyes shut happily, calling the weather with its
 * mouth open (a moving hold, the head swaying), then comes back down.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.6,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.02), bend(5, 2, 8), tail(-6), SHUT),
    snap(0.4, { plantFront: 0.4 }, pelvis(0, 0, -0.012), bend(-13, -6, -16), finUp(32), tail(18), jaw(24), HAPPY),
    key(0.62, { plantFront: 0.4 }, pelvis(0, 0.001, -0.013), bend(-14, -6, -17, 5, 4), finUp(33), tail(19, 6), jaw(26), HAPPY),
    key(0.84, { plantFront: 0.4 }, pelvis(0, 0, -0.012), bend(-13, -6, -16, -5, -4), finUp(32), tail(18, -6), jaw(24), HAPPY),
    key(1.06, { plantFront: 1 }, pelvis(0, -0.012, 0.002), bend(2, 0, 4), tail(2), jaw(3), OPEN_EYES),
    key(1.6, { plantFront: 1 }, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'aura' }],
};

/**
 * Attract, Swagger (charm): it cocks its head coyly with its eyes shut
 * happily and wags its big tail fin at the foe, bobbing on its front paws
 * with each wag, then looks back at the foe.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.012), bend(2, 0, 4, 8, 10), tail(10), HAPPY),
    snap(0.28, pelvis(0, -0.004), bend(-2, 0, -2, 10, 14), tail(20, 30), HAPPY),
    key(0.46, pelvis(0, -0.012), bend(1, 0, 2, 10, 13), tail(20, -30), HAPPY),
    key(0.64, pelvis(0, -0.004), bend(-2, 0, -2, 10, 14), tail(20, 30), HAPPY),
    key(0.82, pelvis(0, -0.012), bend(1, 0, 2, 10, 13), tail(18, -26), HAPPY),
    key(0.98, pelvis(0, -0.005), bend(-1, 0, -1, 7, 10), tail(14, 16), HAPPY),
    key(1.16, pelvis(0, -0.008), bend(0.5, 0, 1, 2, 3), tail(6, -6), OPEN_EYES),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/**
 * Rest (heal): a big yawn, then it lies down on its belly like a pup at the
 * water's edge (the Pokédex: it sleeps buried in the soil there), head
 * resting on its paws and eyes shut, and breathes slowly while the Z's rise;
 * then it gets back up.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.1,
  keys: [
    key(0),
    key(0.24, pelvis(0, -0.006, -0.006), bend(-6, -3, -12), finUp(19), jaw(24), DROWSY),
    key(0.42, pelvis(0, -0.03), bend(3, 1, 4, 3, -4), tail(-8, 10), jaw(2), SHUT),
    key(0.7, pelvis(0, -0.094), bend(11, 4, 12, 8, -12), tail(-28, 36), jaw(-2), SHUT),
    key(1.0, pelvis(0, -0.086), bend(10, 4, 11, 8, -11), tail(-27, 35), jaw(-2), SHUT),
    key(1.3, pelvis(0, -0.096), bend(11, 4, 12.5, 8, -12), tail(-28, 36), jaw(-2), SHUT),
    key(1.55, pelvis(0, -0.088), bend(10, 4, 11, 8, -11), tail(-27, 35), jaw(-2), SHUT),
    key(1.8, pelvis(0, -0.028), bend(2, 1, 3), tail(-6, 8), DROWSY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'aura' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget, bide, fling, glare, kickSand, weather, charm, heal].map((c) => [c.name, c]),
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
