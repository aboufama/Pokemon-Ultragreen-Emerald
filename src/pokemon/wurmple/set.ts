// Wurmple's battle animation set, made by hand in the style of the first
// clips of Blaziken, Sceptile and Swampert (src/pokemon/blaziken/first.ts):
// a clip for every action its moves take, each a short list of key poses
// over the stance. Keys are STANCE + deltas (see compose()).
//
// Its moves and the clips they play:
//   tackle          Tackle, Struggle (after Blaziken's tackle and physical_weak)
//   special_weak    Poison Sting: the tail spikes jab and the barb flies
//                   (after Blaziken's special_weak)
//   status_target   String Shot: thread sprayed from the mouth
//                   (after Blaziken's status_target)
// and the moments every battle plays: idle, intro, hit, faint.
//
// Wurmple is a caterpillar, 0.3 m and light: no limbs, a body that is a
// chain. The front half (spine, chest, neck, head) stands reared up and
// squared to the foe and does the acting: - rears it up and back, + bows it
// forward. The back half (tail, tail2, tail3) lies on the ground curled round
// to its right, the two venomous yellow spikes on its end (tailSpikes):
// + lifts a segment, + curls it further round toward the front.
//
// Channels used here:
//   bones      the chain and the head (see bend() and tail())
//   pelvis     the whole body (Hips is its root joint; it has no legs)
//   root       its leaps (y), a lunge into the foe (z), tipping (pitch)
//   advance    0 at home, 1 in front of the foe (contact moves)
//   plantFeet  0 marks it off the ground (it has no feet to plant)
//   expression eye atlas cell: open, half (lidded: its fighting glare, and
//              a tired droop), closed
// Events: impact (Tackle lands), release (the barb leaves the spikes), emit
// (the thread leaves the mouth), cry, shrink.
//
// How it moves: it can't leap like a biped, it springs. It bunches up low,
// the front half folded down over its belly, then springs its whole body at
// the foe in one arc, lands, and strikes with its whole weight; home is a
// smaller spring back. Light and quick, so its timings run a little under
// Blaziken's and its springs are high and bouncy.
//
// The animator adds overlapping action (index.ts: the head trails the hips
// by 0.065 s and the tail end by 0.1 s, so events that depend on them sit a
// little after their key), breathing, blinks, and springs on the crest, the
// tail end and its spikes.
//
// Clear of the healthboxes (tools/gauntlet/uiclear.mjs): from our side the
// foe's box is some 20 px above our Wurmple's crest; a wild Wurmple's feet
// rest on the top edge of ours, so nothing of it reaches down or toward the
// camera at home.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, landings). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

/** Lidded: its glare at the foe. */
const GLARE: Pose = { expression: 'half' };
const DROWSY: Pose = { expression: 'half' };
const SHUT: Pose = { expression: 'closed' };
const OPEN_EYES: Pose = { expression: 'open' };
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** The front half, hips to head: each segment's pitch (- rears up, + bows), with the head's turn (y, + to its left) and tilt (z). */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The back half: each segment's lift (+ raises it) and curl (+ further round toward the front). */
const tail = (lift1: number, lift2: number, lift3: number, curl1 = 0, curl2 = 0, curl3 = 0): Pose => ({
  bones: { tail: { x: lift1, y: curl1 }, tail2: { x: lift2, y: curl2 }, tail3: { x: lift3, y: curl3 } },
});
/** The front half leaning over from its base: + to its right (over its tail), - to its left. */
const lean = (z: number): Pose => ({ post: { spine: { z } } });
/** The front half turning round to its right, toward its tail, segment by segment. */
const turnRight = (spine: number, chest: number, neck: number, head: number): Pose => ({
  bones: { spine: { y: -spine }, chest: { y: -chest }, neck: { y: -neck }, head: { y: -head } },
});

/**
 * The back half swinging round from the hips (+ brings the tail forward
 * along its right side, - swings it back), the front half turned back the
 * same amount so it keeps facing the foe.
 */
const twist = (deg: number): Pose => ({ bones: { hips: { y: deg }, spine: { y: -deg } } });
/** The two spikes on its tail end: x + tips them back, - forward along the tail; y turns them. */
const spikes = (x: number, y = 0): Pose => ({ bones: { tailSpikes: { x, y } } });

/** Off the ground: it has no feet, so nothing is planted while it flies. */
const AIR: Pose = { plantFeet: 0 };

/**
 * Bunched up to spring: the front half folded down low over its belly, the
 * head kept up on the foe, the tail end pressed flat.
 */
const BUNCH: Pose = compose(bend(22, 34, -10, -16), tail(-4, -8, -12), pelvis(0, -0.02));
/** Sprung: stretched out long and leaning into the leap, head up on the foe, the tail streaming behind. */
const STRETCH: Pose = compose(AIR, bend(8, 6, -4, -8), tail(-8, -12, -20, -30, -16, -8));
/** Reared back to strike: the front half drawn up and back, the head cocked, the tail end braced. */
const REARED: Pose = compose(bend(-8, -16, -6, -14), tail(0, -6, -12));
/**
 * The slam: the front half thrown forward and down, the crest leading like a
 * horn; the tail end kicks up behind.
 */
const SLAM: Pose = compose(bend(22, 36, 16, 10), tail(2, 18, 32));
/** Hopping home: sprung back, the front half upright, the tail end off the ground. */
const HOP: Pose = compose(AIR, bend(-4, -6, 0, -2), tail(2, 6, 10));
/** Landing: the front half folds over the landing, the tail end slaps down. */
const LAND: Pose = compose(bend(8, 12, 4, 2), tail(-2, -4, -6), pelvis(0, -0.012));

// Battle moments ----------------------------------------------------------------

/**
 * Idle: an inchworm's restlessness: the front half sways slowly from one
 * side to the other, the head held level on the foe, the tail end lifting
 * as it goes. The life layer adds breathing, blinks and the gaze.
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.6, bend(-1.5, -2, 0, 1.5, 0, -2), lean(-2.5), tail(0, 1, 5)),
    key(1.2, bend(1.5, 2, 0.5, -1), tail(0, 0, 1)),
    key(1.8, bend(-1.5, -2, 0, 1.5, 0, 2), lean(2.5), tail(0, -1, -3)),
    key(2.4),
  ],
};

/**
 * Sent out: curled down low with its eyes shut, it bursts up in a little
 * squish-and-bounce (its stock front anim) to its full height, spikes
 * raised, cries with a shake of the head, and drops into its stance with a
 * glare.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, bend(16, 30, 10, 14), tail(-4, -6, -10, 10, 10, 10), SHUT),
    key(0.2, bend(20, 36, 12, 16), tail(-6, -8, -12, 12, 12, 12), pelvis(0, -0.012), SHUT),
    // Bursts up and off the ground, stretched tall, the tail end flicking up.
    snap(0.38, { root: { y: 0.09 } }, AIR, bend(-10, -14, 0, -12), tail(0, 14, 26), OPEN_EYES),
    // Lands and cries: reared up, puffed out, spikes high (a moving hold, the head shaking).
    fall(0.5, bend(-8, -12, 0, -14), tail(0, 12, 24), OPEN_EYES),
    key(0.64, bend(-9, -13, 0, -15, 10, 8), tail(0, 12, 23), OPEN_EYES),
    key(0.8, bend(-9, -13, 0, -14, -10, -8), tail(0, 11, 21), OPEN_EYES),
    key(0.96, bend(-5, -7, 0, -7, 4, 3), tail(0, 6, 12), GLARE),
    // Down into its stance with a glare.
    key(1.18, bend(4, 5, 2, 4), tail(0, -1, -2), GLARE),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/** Taking a hit: the front half snaps back and up, eyes squeezed shut, the tail end flicking up; it bobs back past the stance and settles. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, bend(-12, -16, -8, -18), tail(0, 10, 22), lean(3), SHUT),
    key(0.2, bend(-4, -6, -3, -7), tail(0, 3, 8), SHUT),
    key(0.36, bend(3, 4, 2, 5), tail(0, -1, -2), SHUT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, worn out rather than dying: a tired sway with its eyes
 * drooping, then it sags and curls round toward its tail, the head laid in
 * against its side and its eyes shut; from the 'shrink' the curled body
 * shrinks away (Battler3D). It curls round to its side, not forward: a wild
 * Wurmple bowed forward came down onto our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    // A tired sway one way, tipping back, the head lolling, the eyes drooping...
    key(0.22, { root: { z: -0.015 } }, bend(-6, -8, -2, -10, 0, 12), lean(-10), tail(0, 2, 4), DROWSY),
    // ...and back the other, sagging forward.
    key(0.46, { root: { z: -0.025 } }, bend(8, 14, 8, 16, 0, -10), lean(8), tail(0, -2, -6, 4, 4, 4), DROWSY),
    // It curls round toward its tail, the head laid in against its side.
    key(0.68, { root: { z: -0.03 } }, bend(10, 22, 14, 18), turnRight(10, 16, 16, 16), lean(3), tail(0, -3, -8, 12, 12, 12), SHUT),
    key(0.86, { root: { z: -0.04 } }, bend(12, 32, 22, 22), turnRight(22, 32, 32, 32), tail(0, -4, -12, 22, 22, 22), SHUT),
    key(1.0, { root: { z: -0.04 } }, bend(13, 33, 22, 23), turnRight(23, 33, 33, 34), tail(0, -4, -12, 23, 23, 23), SHUT),
    key(1.6, { root: { z: -0.04 } }, bend(12, 32, 23, 22), turnRight(23, 33, 33, 33), tail(0, -4, -13, 23, 23, 23), SHUT),
  ],
  events: [{ t: 1.02, name: 'shrink' }],
};

// Its moves ----------------------------------------------------------------------

/**
 * Tackle, Struggle: after Blaziken's tackle and physical_weak. It bunches
 * up low, springs its whole body at the foe in one arc, head first, rears
 * back as it comes down in front of it, then throws its whole weight into
 * it: the body lunges in and the front half slams down on it crest first,
 * the tail end kicking up behind. It hangs there a moment, bounces off and
 * springs home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.4,
  keys: [
    key(0),
    // Wind-up: it bunches up low, drawing back, eyes on the foe.
    key(0.12, bend(12, 20, -6, -8), tail(-2, -4, -6), pelvis(0, -0.01), GLARE),
    key(0.24, { root: { z: -0.03 } }, BUNCH, GLARE),
    // The spring: it shoots up and out at the foe, stretched long.
    snap(0.32, { advance: 0.28, root: { y: 0.11, pitch: 8 } }, STRETCH, GLARE),
    // The top of the arc: the front half rearing back to strike as it comes down.
    key(0.42, { advance: 0.62, root: { y: 0.2, pitch: 4 } }, AIR, bend(-2, -6, -4, -12), tail(-4, -6, -12, -12, -6, -2), GLARE),
    // Down in front of the foe, reared back, the landing taking the weight.
    fall(0.52, { advance: 1, root: { z: -0.02 } }, REARED, pelvis(0, -0.012), GLARE),
    // The slam: the whole body throws itself in and the front half comes down on the foe, crest first.
    snap(0.6, { advance: 1, root: { z: 0.14 } }, SLAM, GLARE),
    // Follow-through: pressed into the foe, a moment's hang.
    key(0.72, { advance: 1, root: { z: 0.15 } }, SLAM, bend(3, 3, 2, 2), tail(0, 2, 4), GLARE),
    // It pushes itself back up off the foe...
    key(0.86, { advance: 1, root: { z: 0.05 } }, bend(10, 14, 6, 4), tail(0, 6, 10), GLARE),
    // ...and hops home.
    key(0.98, { advance: 0.45, root: { y: 0.09 } }, HOP, GLARE),
    key(1.1, { advance: 0 }, LAND, GLARE),
    key(1.24, bend(-2, -3, -1, -2), tail(0, 1, 2), GLARE),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'impact' }],
};

/**
 * The sting drawn back: the back half swung round behind it and the tail end
 * reared up high on its right, the spikes pointing up and back.
 */
const COCKED: Pose = compose(twist(-25), tail(25, -2, -50, -25, -30, -33), spikes(-62, -45));
/** The jab: the back half whipped round and the tail end thrust forward along its right side, the spikes at the foe. */
const JAB: Pose = compose(twist(20), tail(-8, -17, -40, 3, 0, -6), spikes(-74, -18));

/**
 * Poison Sting: after Blaziken's special_weak (a breath in, a snap, the
 * release, a recoil, a settle). The venom is in the two spikes on its tail
 * end, and it fights by pointing them at the foe: it swings its back half
 * round and rears the tail end up high, the front half rearing back and
 * leaning away; then whips the back half round and thrusts the spikes at the
 * foe as the front half bows in behind it, and the barb flies from them (the
 * tail end trails the hips by 0.1 s); it follows through, recoils and settles.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Drawing the sting back.
    key(0.12, twist(-12), tail(12, -1, -24, -12, -15, -16), spikes(-30, -22), bend(-5, -7, -2, -5), lean(-5), GLARE),
    key(0.26, COCKED, bend(-12, -16, -4, -12), lean(-10), pelvis(0, 0.01, -0.015), GLARE),
    // The jab: the spikes stab at the foe, the front half bowing in behind them.
    snap(0.36, JAB, bend(12, 16, 5, 9), lean(7), pelvis(0, -0.008, 0.024), GLARE),
    // Follow-through: the thrust carries on a touch and hangs.
    key(0.5, JAB, twist(4), bend(14, 18, 6, 10), lean(8), pelvis(0, -0.009, 0.027), GLARE),
    // Recoil: the tail end draws back and the front half comes up.
    key(0.7, twist(6), tail(-2, -6, -12, 1, 0, -2), spikes(-20, -6), bend(2, 3, 1, 2), lean(2), GLARE),
    key(0.9, twist(1), spikes(-4), bend(-1, -1, 0, -1), GLARE),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'release' }],
};

/**
 * String Shot: after Blaziken's status_target (rear up, lunge the head
 * forward, a moving hold). It rears back with its head raised, drawing in,
 * then drives its head forward and down so its mouth points at the foe and
 * sprays the thread, weaving its head from side to side to spin it over the
 * foe; then it pulls its head back and settles.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.55,
  keys: [
    key(0),
    // Drawing in: reared up and back, the head raised.
    key(0.24, pelvis(0, 0.01, -0.01), bend(-10, -16, -8, -18), tail(0, 8, 16), GLARE),
    // Spray: the head drives forward and down at the foe.
    snap(0.34, pelvis(0, -0.008, 0.025), bend(14, 18, 8, 8), tail(0, -2, -4), GLARE),
    // Weaving the thread over the foe, the head and the front half swaying.
    key(0.52, pelvis(0, -0.008, 0.025), bend(14, 18, 8, 8, 12, 5), lean(3), tail(0, -2, -3), GLARE),
    key(0.7, pelvis(0, -0.009, 0.023), bend(15, 19, 8, 9, -12, -5), lean(-3), tail(0, -2, -4), GLARE),
    key(0.88, pelvis(0, -0.008, 0.025), bend(14, 18, 8, 8, 10, 4), lean(3), tail(0, -2, -3), GLARE),
    key(1.04, pelvis(0, -0.006, 0.018), bend(11, 14, 6, 6, -6, -2), lean(-1), tail(0, -1, -2), GLARE),
    // Done: the head comes back up and it settles.
    key(1.22, bend(-3, -4, -2, -5), tail(0, 1, 2), GLARE),
    key(1.36, bend(1, 1, 0, 1), GLARE),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, tackle, specialWeak, statusTarget].map((c) => [c.name, c]),
);

/** Eye atlas (4 x 4 cells of 64 px): row 0 open, row 1 lidded, row 2 shut. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  half: [0, 1],
  closed: [0, 2],
};
