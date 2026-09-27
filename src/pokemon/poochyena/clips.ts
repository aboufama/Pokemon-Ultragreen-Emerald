// Poochyena's battle animation set: the moments (idle, intro, hit, faint), one
// clip per attack category and the motifs its moves need. Keys are STANCE +
// deltas (see compose()).
//
// Poochyena is a light, jumpy hyena pup: quick snaps (3-5 frames), short
// holds, and everything it does comes from the jaws, the hackles and the
// tail. It acts in place: in the compiled game its sprite does the lunges
// and shakes and the body follows; a clip's strike reaches from where it
// stands (the hips drive forward, the neck stretches, the jaws snap) and
// lands about when the game's own move animation lands (Tackle's lunge hits
// on frame 6, Bite's teeth shut on frame 10, Take Down charges on frame 35).
//
// Both views: from the foe's side it faces us; from ours we see its back and
// right flank, its legs under the text box. So the acting is pushed into
// what reads from behind as well: the head dives below the line of the back
// and flies up above it, the hackles stand up along the back, and the tail,
// a loose spring, whips up at every blow.
//
// Quadruped mechanics: foot IK only pins the feet's height, so a key that
// moves the pelvis or pitches the front half swings the legs back under it
// (body(), below) to keep the paws where they stand. The front paws are
// both planted by plantFront; a paw that scoops or swipes is aimed and
// plantFront goes to 0 while the body stays level (the other forefoot
// stands on its own).
//
// Channels used here:
//   pelvis   the body's weight (x its left, y up, z toward the foe)
//   plantFeet / plantFront   foot IK weights (hind / front)
//   expression               eye atlas cell (EXPRESSIONS below)
// Events: impact, release, charge, cry, aura, emit, shrink.
//
// The animator adds the rest: overlapping action (profile.overlap: the head
// and jaw trail the body by a few frames, so bite and bark events sit a
// little after their key), breathing, blinks, and springs on the tail (a
// loose brush), ears, hackles and cheek tufts.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { BoneAim, Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });

// Reusable deltas -----------------------------------------------------------

const OPEN: Pose = { expression: 'open' };
const ANGRY: Pose = { expression: 'angry' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const SMUG: Pose = { expression: 'happy' };

const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
/** Ears: + pricked forward, - pinned back. */
const ears = (deg: number): Pose => ({ bones: { earL: { x: deg }, earR: { x: deg } } });
/** The tail's root: + raised (the brush follows on its spring), y swings it to its left. */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });
/** Hackles: the crest, the rump tuft and the flank tufts bristle (+) or lie flat (-). */
const hackles = (deg: number): Pose => ({
  bones: { mane: { x: deg }, maneB: { x: deg * 0.8 }, furL: { x: deg * 0.5 }, furR: { x: deg * 0.5 } },
});

interface Body {
  /** Front half pitch at the waist and at the chest (+ dips it). */
  spine?: number;
  chest?: number;
  /** Neck and head pitch (+ forward/down), head yaw (+ its left) and roll. */
  neck?: number;
  head?: number;
  headY?: number;
  headZ?: number;
  neckY?: number;
  /** Sway: the front half rolls (+ toward its left). */
  roll?: number;
  /** The weight: pelvis offset in heights (x its left, y up, z toward the foe). */
  x?: number;
  y?: number;
  z?: number;
  /** The right foreleg is aimed by the clip (lifted): not swung to keep its paw. */
  freeR?: boolean;
}

/**
 * The body's pose with the paws kept where they stand: pitching the front
 * half swings the forelegs with it and shifting the weight carries every
 * foot along (foot IK pins only their height), so the legs swing back the
 * other way (post: forelegs about 0.37 heights long, hind legs 0.4).
 */
function body(o: Body): Pose {
  const spine = o.spine ?? 0, chest = o.chest ?? 0, z = o.z ?? 0;
  const fore = -(spine + chest) + 155 * z;
  const hind = 143 * z;
  return {
    pelvis: { x: o.x ?? 0, y: o.y ?? 0, z },
    bones: {
      spine: { x: spine, z: o.roll ?? 0 },
      chest: { x: chest },
      neck: { x: o.neck ?? 0, y: o.neckY ?? 0 },
      head: { x: o.head ?? 0, y: o.headY ?? 0, z: o.headZ ?? 0 },
    },
    post: {
      armL: { x: fore },
      ...(o.freeR ? {} : { armR: { x: fore } }),
      thighL: { x: hind },
      thighR: { x: hind },
    },
  };
}

// The right foreleg (the near one from our side, and toward us from the
// foe's), aimed when it scoops or swipes. -X is outward (its right).
type Leg = { armR: BoneAim; forearmR: BoneAim; handR: BoneAim };
const leg = (arm: [number, number, number], fore: [number, number, number], hand: [number, number, number]): Leg => ({
  armR: { dir: arm }, forearmR: { dir: fore }, handR: { dir: hand },
});
/** Standing: the bind directions (the stance leaves the forelegs as modelled). */
const PAW_DOWN = leg([0, -0.945, -0.328], [0, -0.982, 0.188], [0, -0.5, 0.866]);
/** Drawn back under the chest, the paw curled up behind. */
const PAW_BACK = leg([-0.06, -0.88, -0.47], [-0.03, -0.62, -0.78], [0, -0.45, -0.89]);
/** Swept forward and up: flinging the dirt at the foe. */
const PAW_FLING = leg([-0.1, -0.45, 0.89], [-0.06, 0, 1], [-0.02, 0.5, 0.87]);
const PAW_THROUGH = leg([-0.1, -0.42, 0.9], [-0.06, 0.04, 1], [-0.02, 0.55, 0.84]);
/** Still up after the rake, sinking back. */
const PAW_HANG = leg([-0.08, -0.62, 0.78], [-0.05, -0.3, 0.95], [-0.02, 0.2, 0.98]);
/** Raised and cocked: a swipe about to come down. */
const PAW_RAISED = leg([-0.14, 0.3, 0.94], [-0.06, 0.7, 0.71], [0, 0.35, -0.94]);
/** Halfway down: the swipe's breakdown. */
const PAW_MID = leg([-0.12, -0.25, 0.96], [-0.05, -0.3, 0.95], [0, -0.1, 0.99]);
/** Slammed down in front: the swipe's follow-through (planted: the foot IK keeps it on the ground). */
const PAW_SLAM = leg([-0.04, -0.96, 0.28], [-0.02, -1, 0.06], [0, -0.55, 0.83]);
const pawAim = (l: Leg): Pose => ({ aim: { ...l } });

// Clips -----------------------------------------------------------------------

/**
 * Standing its ground: breathing (the life layer), a silent growl (the lips
 * tighten, the hackles pulse) and a flick of the tail that its spring
 * carries on. Loops without a seam.
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.6, body({ neck: 2, head: -2 }), hackles(4), jaw(-2), tail(4)),
    key(1.2, body({ y: -0.01, spine: 2, neck: 2 }), hackles(8), tail(10), ears(4)),
    key(1.8, body({ spine: 0.5, neck: -1, head: 1 }), hackles(3), jaw(1), tail(3)),
    key(2.4),
  ],
};

/**
 * Its entrance and cry (the wild one's as its healthbox comes, ours out of
 * the ball): gathered low, it throws its head up in a short yipping howl,
 * then brings it down on the foe with a snarl.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, body({ y: -0.05, spine: 4, neck: 14, head: 10 }), ears(-20), tail(-12), hackles(-8), SHUT),
    key(0.2, body({ y: -0.07, spine: 6, neck: 18, head: 12 }), ears(-24), tail(-16), hackles(-10), SHUT),
    // The howl: head flung up, jaws wide, chest out, hackles and tail up. Not
    // further back: from the front the head turns into a dark dome with the
    // ears hidden behind it.
    snap(0.42, body({ y: 0.004, spine: -7, chest: -5, neck: -15, head: -12, headY: 4, headZ: -4 }), jaw(34), ears(6), tail(24), hackles(30), SHUT),
    key(0.62, body({ y: 0.004, spine: -7, chest: -5, neck: -16, head: -14, headY: 5, headZ: -7 }), jaw(31), ears(6), tail(26), hackles(30), SHUT),
    key(0.82, body({ y: 0.002, spine: -7, chest: -5, neck: -15, head: -13, headY: 3, headZ: -2 }), jaw(34), ears(4), tail(24), hackles(32), SHUT),
    // Down on the foe: a snarl, ears forward.
    key(1.02, body({ y: -0.014, spine: 4, neck: 6, head: 4 }), jaw(12), ears(6), tail(16), hackles(24), ANGRY),
    key(1.24, body({ y: -0.006, spine: 1, neck: 1, head: 1 }), jaw(3), ears(3), tail(8), hackles(12), ANGRY),
    key(1.6, OPEN),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Tackle (and Facade, Secret Power, Dig's strike): a butt with the head and
 * shoulders. The game lunges the sprite at once (frames 0-8, the hit on
 * frame 6), so the drive comes almost at once: a flinch of a coil, then the
 * hips shove, the head dives, the ears pin back and the tail flies up; it
 * bounces off and shakes it off.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.9,
  keys: [
    key(0),
    // Coil: head drops, weight back on the haunches.
    key(0.05, body({ y: -0.03, z: -0.014, spine: 3, neck: 9, head: 9 }), ears(-16), tail(10), hackles(10), ANGRY),
    // Drive: hips shove, forehead first.
    snap(0.11, body({ y: -0.024, z: 0.048, spine: 10, chest: 6, neck: 28, head: 8 }), jaw(-4), ears(-34), tail(38), hackles(24), ANGRY),
    key(0.2, body({ y: -0.022, z: 0.044, spine: 9, chest: 5, neck: 23, head: 3 }), jaw(-4), ears(-30), tail(34), hackles(22), ANGRY),
    // Bounce off, head up.
    key(0.36, body({ y: -0.012, z: -0.016, spine: -3, neck: -9, head: -6 }), jaw(6), ears(-8), tail(16), hackles(12), ANGRY),
    key(0.52, body({ y: -0.006, z: 0.004, spine: 1, neck: 2, head: 2, headY: 8, headZ: -4 }), ears(0), tail(10), hackles(7), ANGRY),
    key(0.66, body({ neck: 1, headY: -4, headZ: 2 }), tail(6), hackles(4), ANGRY),
    key(0.9, OPEN),
  ],
  events: [{ t: 0.14, name: 'impact' }],
};

/**
 * Take Down, Double-Edge, Return, Frustration, Body Slam, Counter: the game
 * backs the sprite off in a bobbing wind-up and charges it into the foe on
 * frame 35. Poochyena lowers its head like a ram and gathers on its hind
 * legs, then drives everything into the foe; the recoil jolts it back, it
 * shakes its head and bristles up again.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.55,
  keys: [
    key(0),
    // Backing off: head down, glaring up, weight on the haunches.
    key(0.2, body({ y: -0.034, z: -0.03, spine: 3, neck: 12, head: 12 }), ears(-18), tail(12), hackles(16), ANGRY),
    key(0.42, body({ y: -0.058, z: -0.042, spine: 5, neck: 17, head: 16 }), jaw(-4), ears(-24), tail(8), hackles(26), ANGRY),
    key(0.5, body({ y: -0.062, z: -0.044, spine: 5, neck: 18, head: 17, headZ: 2 }), jaw(-4), ears(-26), tail(8), hackles(28), ANGRY),
    // The charge: everything into the foe.
    snap(0.58, body({ y: -0.026, z: 0.06, spine: 11, chest: 7, neck: 30, head: 8 }), jaw(-6), ears(-38), tail(42), hackles(36), ANGRY),
    key(0.66, body({ y: -0.024, z: 0.056, spine: 10, chest: 6, neck: 27, head: 6 }), jaw(-6), ears(-36), tail(38), hackles(34), ANGRY),
    // Recoil: jolted back, wincing.
    key(0.82, body({ y: -0.02, z: -0.024, spine: -3, neck: -7, head: -8 }), jaw(14), ears(-26), tail(12), hackles(14), HURT),
    // Shake it off.
    key(0.94, body({ y: -0.016, z: -0.008, spine: 1, neck: 2, head: 4, headY: 13, headZ: -7 }), jaw(4), ears(-10), tail(14), hackles(12), SHUT),
    key(1.06, body({ y: -0.012, spine: 1, neck: 2, head: 4, headY: -11, headZ: 6 }), jaw(2), ears(-6), tail(14), hackles(14), SHUT),
    key(1.2, body({ y: -0.008, neck: 1, head: 2, headY: 4 }), ears(2), tail(10), hackles(10), ANGRY),
    key(1.55, OPEN),
  ],
  events: [{ t: 0.62, name: 'impact' }],
};

/**
 * Bite: the game snaps a set of teeth shut on the foe on frame 10 and the
 * sprite stays put. The head flies up with the jaws gaping, the neck shoots
 * out and down with the hips behind it, the jaws slam shut at full reach and
 * it worries its hold with three shakes before letting go.
 */
const bite: Clip = {
  name: 'bite',
  duration: 1.05,
  keys: [
    key(0),
    // Gape: head up and back, jaws wide.
    key(0.08, body({ y: -0.012, z: -0.02, spine: -4, neck: -16, head: -10 }), jaw(40), ears(-26), tail(10), hackles(16), ANGRY),
    // Lunge: neck and hips drive at the foe.
    snap(0.16, body({ y: -0.022, z: 0.05, spine: 10, chest: 4, neck: 28, head: 4 }), jaw(38), ears(-32), tail(24), hackles(28), ANGRY),
    // Snap shut at full reach.
    snap(0.21, body({ y: -0.024, z: 0.055, spine: 11, chest: 4, neck: 32, head: 9 }), jaw(-10), ears(-34), tail(34), hackles(30), ANGRY),
    // Worry it: three shakes.
    key(0.3, body({ y: -0.024, z: 0.054, spine: 11, chest: 4, neck: 31, head: 9, headY: 14, headZ: -8, neckY: 5 }), jaw(-10), ears(-32), tail(28), hackles(30), ANGRY),
    key(0.39, body({ y: -0.024, z: 0.054, spine: 11, chest: 4, neck: 31, head: 9, headY: -14, headZ: 8, neckY: -5 }), jaw(-10), ears(-32), tail(26), hackles(30), ANGRY),
    key(0.48, body({ y: -0.022, z: 0.052, spine: 10, chest: 4, neck: 30, head: 8, headY: 10, headZ: -6, neckY: 3 }), jaw(-10), ears(-30), tail(24), hackles(28), ANGRY),
    key(0.56, body({ y: -0.022, z: 0.05, spine: 10, chest: 4, neck: 29, head: 8, headY: -3 }), jaw(-9), ears(-28), tail(22), hackles(26), ANGRY),
    // Let go, pull back.
    key(0.67, body({ y: -0.012, z: 0.014, spine: 3, neck: 8, head: -5 }), jaw(18), ears(-12), tail(14), hackles(16), ANGRY),
    key(0.82, body({ y: -0.004, spine: 1, neck: 2, head: -1 }), jaw(4), ears(0), tail(7), hackles(8), ANGRY),
    key(1.05, OPEN),
  ],
  events: [{ t: 0.24, name: 'impact' }],
};

/**
 * Crunch: the game fades to darkness first (about 0.6 s), then two sets of
 * teeth close on the foe, 0.75 s and 1.2 s in. Poochyena sinks low and
 * stalks while it goes dark, then bites twice, the second harder, and
 * wrenches its head before letting go.
 */
const biteStrong: Clip = {
  name: 'bite_strong',
  duration: 1.9,
  keys: [
    key(0),
    // Stalk: low, head level at the foe, jaws parting.
    key(0.3, body({ y: -0.05, z: -0.012, spine: 6, neck: 12, head: -6 }), jaw(10), ears(-22), tail(14), hackles(30), ANGRY),
    key(0.55, body({ y: -0.056, z: -0.024, spine: 2, neck: -6, head: -12 }), jaw(40), ears(-28), tail(16), hackles(36), ANGRY),
    // First bite.
    snap(0.66, body({ y: -0.03, z: 0.05, spine: 10, chest: 4, neck: 28, head: 4 }), jaw(38), ears(-32), tail(28), hackles(36), ANGRY),
    snap(0.72, body({ y: -0.03, z: 0.055, spine: 11, chest: 4, neck: 32, head: 9 }), jaw(-10), ears(-34), tail(36), hackles(36), ANGRY),
    key(0.84, body({ y: -0.03, z: 0.052, spine: 10, chest: 4, neck: 30, head: 8, headY: 11, headZ: -7 }), jaw(-10), ears(-32), tail(30), hackles(34), ANGRY),
    // Gape again, drawn back a little.
    key(1.0, body({ y: -0.04, z: 0.004, spine: 1, neck: -6, head: -14, headY: -4 }), jaw(42), ears(-30), tail(22), hackles(36), ANGRY),
    // Second bite, harder: the hips drive further.
    snap(1.1, body({ y: -0.034, z: 0.06, spine: 12, chest: 5, neck: 30, head: 5 }), jaw(38), ears(-36), tail(34), hackles(38), ANGRY),
    snap(1.16, body({ y: -0.034, z: 0.064, spine: 12, chest: 5, neck: 34, head: 10 }), jaw(-12), ears(-36), tail(40), hackles(38), ANGRY),
    // Wrench.
    key(1.26, body({ y: -0.034, z: 0.062, spine: 12, chest: 5, neck: 33, head: 10, headY: -15, headZ: 9, neckY: -5 }), jaw(-12), ears(-34), tail(32), hackles(36), ANGRY),
    key(1.36, body({ y: -0.032, z: 0.06, spine: 11, chest: 5, neck: 32, head: 9, headY: 11, headZ: -6, neckY: 4 }), jaw(-12), ears(-32), tail(28), hackles(34), ANGRY),
    // Let go.
    key(1.5, body({ y: -0.016, z: 0.016, spine: 3, neck: 8, head: -5 }), jaw(16), ears(-14), tail(16), hackles(20), ANGRY),
    key(1.66, body({ y: -0.006, spine: 1, neck: 2, head: -1 }), jaw(4), ears(0), tail(8), hackles(10), ANGRY),
    key(1.9, OPEN),
  ],
  events: [{ t: 0.75, name: 'impact' }, { t: 1.19, name: 'impact' }],
};

/**
 * Howl (also Sunny Day and Rain Dance, called up to the sky): the game
 * swells the sprite in a deep breath and sends its noise lines from frame
 * 12. The chest fills, then the head goes up with the eyes shut and it
 * howls with a trembling hold, hackles and tail up; the aura of its raised
 * Attack comes as the howl peaks.
 */
const roar: Clip = {
  name: 'roar',
  duration: 1.6,
  keys: [
    key(0),
    // Breath in: chest up, head back.
    key(0.2, body({ y: 0.004, spine: -5, chest: -4, neck: -8, head: -4 }), ears(-8), tail(10), hackles(12), SHUT),
    // Howl: the snout up, trembling (further back and the head reads as a
    // dark dome from the front).
    snap(0.36, body({ y: 0.004, spine: -8, chest: -6, neck: -16, head: -12, headY: 4, headZ: -5 }), jaw(34), ears(6), tail(26), hackles(30), SHUT),
    key(0.56, body({ y: 0.004, spine: -8, chest: -6, neck: -17, head: -14, headY: 5, headZ: -8 }), jaw(36), ears(6), tail(28), hackles(32), SHUT),
    key(0.76, body({ y: 0.004, spine: -8, chest: -6, neck: -16, head: -13, headY: 3, headZ: -3 }), jaw(32), ears(5), tail(28), hackles(34), SHUT),
    key(0.96, body({ y: 0.003, spine: -8, chest: -6, neck: -16, head: -12, headY: 4, headZ: -6 }), jaw(35), ears(6), tail(27), hackles(34), SHUT),
    // Down again, fired up.
    key(1.16, body({ y: -0.012, spine: 3, neck: 4, head: 2 }), jaw(8), ears(4), tail(16), hackles(22), ANGRY),
    key(1.34, body({ y: -0.004, spine: 1, neck: 1 }), jaw(2), ears(2), tail(8), hackles(10), ANGRY),
    key(1.6, OPEN),
  ],
  events: [{ t: 0.4, name: 'emit' }, { t: 0.6, name: 'aura' }],
};

/**
 * Roar: rears its head back, then lunges it at the foe and roars into its
 * face, swinging its head; the game plays its cry at once and blows the
 * foe away.
 */
const roarFoe: Clip = {
  name: 'roar_foe',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, body({ y: 0.002, z: -0.024, spine: -7, chest: -5, neck: -13, head: -8 }), jaw(10), ears(-10), tail(16), hackles(22), ANGRY),
    snap(0.22, body({ y: -0.022, z: 0.04, spine: 8, chest: 3, neck: 24, head: 2 }), jaw(40), ears(-26), tail(30), hackles(36), ANGRY),
    key(0.4, body({ y: -0.022, z: 0.038, spine: 8, chest: 3, neck: 23, head: 2, headY: 11, headZ: -5, neckY: 4 }), jaw(38), ears(-26), tail(28), hackles(36), ANGRY),
    key(0.58, body({ y: -0.022, z: 0.038, spine: 8, chest: 3, neck: 23, head: 2, headY: -11, headZ: 5, neckY: -4 }), jaw(40), ears(-26), tail(28), hackles(36), ANGRY),
    key(0.76, body({ y: -0.02, z: 0.032, spine: 7, chest: 3, neck: 20, head: 2, headY: 4 }), jaw(34), ears(-22), tail(24), hackles(32), ANGRY),
    key(0.96, body({ y: -0.008, z: 0.008, spine: 2, neck: 4, head: 0 }), jaw(8), ears(-4), tail(14), hackles(18), ANGRY),
    key(1.35, OPEN),
  ],
  events: [{ t: 0.26, name: 'emit' }],
};

/**
 * Sand-Attack: the game jerks the sprite back and sprays sand from frame 5.
 * Weight back, the near forepaw draws back under the chest, then rakes
 * forward and up flinging the dirt at the foe; the head ducks to the dirt
 * and snaps up after it, the tail whipping. The paw hangs a moment, comes
 * back down, and it snorts at the dust.
 */
function scoop(name: string, event: 'emit' | 'release'): Clip {
  return {
    name,
    duration: 1.0,
    keys: [
      key(0, pawAim(PAW_DOWN)),
      // Weight back, the paw drawn back under the chest, the head ducking to the dirt.
      key(0.09, { plantFront: 0 }, body({ z: -0.006, neck: 11, head: 9, freeR: true }), pawAim(PAW_BACK), ears(-12), tail(12), hackles(12), ANGRY),
      // Rake: the paw flings forward and up, the head snaps up after the dirt.
      snap(0.17, { plantFront: 0 }, body({ z: 0.004, neck: -4, head: -6, freeR: true }), pawAim(PAW_FLING), jaw(10), ears(-20), tail(32), hackles(22), ANGRY),
      key(0.29, { plantFront: 0 }, body({ z: 0.004, neck: -4, head: -7, freeR: true }), pawAim(PAW_THROUGH), jaw(8), ears(-18), tail(28), hackles(22), ANGRY),
      key(0.42, { plantFront: 0 }, body({ z: 0.002, neck: -2, head: -4, freeR: true }), pawAim(PAW_HANG), jaw(6), ears(-14), tail(22), hackles(18), ANGRY),
      // The paw comes down and takes the weight again; a snort at the dust.
      key(0.56, { plantFront: 0.3 }, body({ y: -0.004, neck: 2, head: 1, headY: 6, freeR: true }), pawAim(PAW_DOWN), jaw(2), ears(-6), tail(14), hackles(12), ANGRY),
      key(0.68, { plantFront: 1 }, body({ y: -0.006, neck: 1, headY: -5 }), pawAim(PAW_DOWN), tail(10), hackles(8), ANGRY),
      key(0.82, body({ y: -0.003, headY: 2 }), pawAim(PAW_DOWN), tail(6), hackles(5), ANGRY),
      key(1.0, pawAim(PAW_DOWN), OPEN),
    ],
    events: [{ t: 0.2, name: event }],
  };
}
const kickSand = scoop('kick_sand', 'emit');
/** Mud-Slap: the same rake, flinging a clod of mud. */
const fling = scoop('fling', 'release');

/**
 * Scary Face, Leer, Odor Sleuth, Taunt, Torment, Mimic (glare): the game
 * darkens the screen and flashes the eyes about 0.5 s in. Head down low,
 * the eyes up at the foe, hackles fully up, lips curled; it creeps its
 * weight forward and holds the stare with a growl's tremor.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.5,
  keys: [
    key(0),
    key(0.22, body({ y: -0.034, z: -0.02, spine: 6, neck: 14, head: -12 }), jaw(4), ears(-10), tail(14), hackles(22), ANGRY),
    snap(0.42, body({ y: -0.05, z: 0.03, spine: 9, chest: 3, neck: 24, head: -20 }), jaw(14), ears(8), tail(26), hackles(40), ANGRY),
    key(0.6, body({ y: -0.052, z: 0.032, spine: 9, chest: 3, neck: 25, head: -21, headZ: 2 }), jaw(12), ears(8), tail(26), hackles(41), ANGRY),
    key(0.78, body({ y: -0.05, z: 0.03, spine: 9, chest: 3, neck: 24, head: -20, headZ: -2 }), jaw(15), ears(9), tail(27), hackles(40), ANGRY),
    key(0.96, body({ y: -0.052, z: 0.033, spine: 9, chest: 3, neck: 25, head: -21, headZ: 1 }), jaw(12), ears(8), tail(26), hackles(41), ANGRY),
    key(1.16, body({ y: -0.018, z: 0.008, spine: 3, neck: 6, head: -5 }), jaw(3), ears(3), tail(14), hackles(18), ANGRY),
    key(1.5, OPEN),
  ],
  events: [{ t: 0.46, name: 'emit' }],
};

/**
 * Protect, Endure, Substitute, Double Team, Psych Up (the self moves): it
 * backs up and hunkers down on braced legs, ears pinned and head tucked,
 * every hair on end, and holds its guard while the barrier forms.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.5,
  keys: [
    key(0),
    key(0.22, body({ y: -0.045, z: -0.026, spine: 2, neck: 8, head: 12 }), jaw(-4), ears(-22), tail(8), hackles(24), SHUT),
    snap(0.36, body({ y: -0.068, z: -0.036, spine: 3, neck: 12, head: 14 }), jaw(6), ears(-38), tail(20), hackles(42), ANGRY),
    key(0.56, body({ y: -0.072, z: -0.037, spine: 3, neck: 12, head: 14, headY: 3, headZ: 4 }), jaw(5), ears(-38), tail(24), hackles(45), ANGRY),
    key(0.76, body({ y: -0.064, z: -0.034, spine: 3, neck: 11, head: 13, headY: -3, headZ: -4 }), jaw(9), ears(-36), tail(17), hackles(39), ANGRY),
    key(0.96, body({ y: -0.071, z: -0.037, spine: 3, neck: 12, head: 14, headY: 2, headZ: 3 }), jaw(5), ears(-38), tail(23), hackles(44), ANGRY),
    key(1.16, body({ y: -0.024, z: -0.012, spine: 1, neck: 4, head: 5 }), ears(-8), tail(10), hackles(18), ANGRY),
    key(1.5, OPEN),
  ],
  events: [{ t: 0.4, name: 'aura' }],
};

/**
 * Snore (sound) and anything else weak and ranged: a sharp bark. The head
 * draws up and back, then snaps forward and down with the jaws wide; the
 * bark leaves the mouth and the head bobs back up.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.0,
  keys: [
    key(0),
    key(0.12, body({ y: 0.002, z: -0.018, spine: -4, neck: -14, head: -8 }), jaw(2), ears(-6), tail(12), hackles(12), ANGRY),
    snap(0.2, body({ y: -0.016, z: 0.034, spine: 6, chest: 3, neck: 18, head: 4 }), jaw(36), ears(-20), tail(28), hackles(24), ANGRY),
    key(0.3, body({ y: -0.014, z: 0.028, spine: 5, chest: 2, neck: 13, head: -2 }), jaw(22), ears(-16), tail(24), hackles(20), ANGRY),
    key(0.44, body({ y: -0.006, z: 0.004, spine: 1, neck: 1, head: -5 }), jaw(4), ears(-4), tail(14), hackles(12), ANGRY),
    key(0.64, body({ neck: 1, head: 0 }), ears(0), tail(8), hackles(6), ANGRY),
    key(1.0, OPEN),
  ],
  events: [{ t: 0.23, name: 'release' }],
};

/**
 * Shadow Ball, Hidden Power (orb): the game fades to its ghostly backdrop
 * and throws the ball about 0.85 s in. Poochyena sinks and gathers the dark
 * orb in its open jaws, trembling, then hurls it with a thrust of its whole
 * front half.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 1.8,
  keys: [
    key(0),
    key(0.16, body({ y: -0.016, neck: 3, head: 4 }), ears(-4), tail(8), hackles(10), ANGRY),
    // Gather: sunk low, weight back, jaws open on the forming orb.
    key(0.5, body({ y: -0.052, z: -0.03, spine: 5, neck: 10, head: -14 }), jaw(26), ears(-22), tail(14), hackles(32), ANGRY),
    key(0.62, body({ y: -0.055, z: -0.034, spine: 5, neck: 10, head: -15, headZ: 2 }), jaw(28), ears(-24), tail(14), hackles(34), ANGRY),
    key(0.74, body({ y: -0.053, z: -0.034, spine: 5, neck: 9, head: -15, headZ: -2 }), jaw(27), ears(-24), tail(14), hackles(36), ANGRY),
    // Hurl.
    snap(0.84, body({ y: -0.026, z: 0.052, spine: 10, chest: 5, neck: 28, head: 4 }), jaw(38), ears(-32), tail(36), hackles(38), ANGRY),
    key(0.98, body({ y: -0.022, z: 0.046, spine: 9, chest: 4, neck: 22, head: -3 }), jaw(28), ears(-28), tail(32), hackles(34), ANGRY),
    // Recoil and settle.
    key(1.16, body({ y: -0.012, z: 0.006, spine: 2, neck: 3, head: -7 }), jaw(8), ears(-10), tail(16), hackles(20), ANGRY),
    key(1.4, body({ y: -0.004, neck: 1, head: -1 }), jaw(2), ears(0), tail(8), hackles(8), ANGRY),
    key(1.8, OPEN),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.88, name: 'release' }],
};

/**
 * Thief, Rock Smash (strike): it rears off its forepaws, the near paw
 * cocked high, and swipes it down onto the foe, then drops back onto all
 * fours. (The game fades to dark first for Thief and lunges the sprite.)
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.2,
  keys: [
    key(0, pawAim(PAW_DOWN)),
    key(0.1, body({ y: -0.034, z: -0.014, spine: 4, neck: 8, head: 6 }), pawAim(PAW_DOWN), ears(-12), tail(12), hackles(14), ANGRY),
    // Rear: the front half comes up off the forepaws, the near paw cocked.
    key(0.28, { plantFront: 0 }, body({ y: 0.004, z: -0.022, spine: -17, chest: -5, neck: 2, head: 8, roll: 4, freeR: true }), pawAim(PAW_RAISED), jaw(12), ears(-20), tail(18), hackles(26), ANGRY),
    key(0.35, { plantFront: 0 }, body({ y: 0.004, z: -0.024, spine: -18, chest: -5, neck: 2, head: 8, roll: 5, freeR: true }), pawAim(PAW_RAISED), jaw(14), ears(-22), tail(20), hackles(28), ANGRY),
    // Swipe down: through a breakdown, the paw leading, onto the foe.
    key(0.425, { plantFront: 0 }, body({ y: -0.008, z: 0.008, spine: -5, chest: -2, neck: 7, head: 5, roll: 2, freeR: true }), pawAim(PAW_MID), jaw(18), ears(-26), tail(26), hackles(32), ANGRY),
    key(0.5, { plantFront: 1 }, body({ y: -0.012, z: 0.018, spine: 6, chest: 2, neck: 14, head: 2, freeR: true }), pawAim(PAW_SLAM), jaw(18), ears(-30), tail(32), hackles(34), ANGRY),
    key(0.6, { plantFront: 1 }, body({ y: -0.016, z: 0.016, spine: 6, chest: 2, neck: 14, head: 2, freeR: true }), pawAim(PAW_SLAM), jaw(8), ears(-28), tail(28), hackles(30), ANGRY),
    key(0.72, { plantFront: 1 }, body({ y: -0.016, z: 0.01, spine: 2, neck: 4, head: 0 }), pawAim(PAW_DOWN), jaw(2), ears(-10), tail(16), hackles(18), ANGRY),
    key(0.92, body({ y: -0.006, neck: 1 }), pawAim(PAW_DOWN), ears(0), tail(8), hackles(8), ANGRY),
    key(1.2, pawAim(PAW_DOWN), OPEN),
  ],
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Iron Tail (tail): the game makes the sprite shine like steel for about a
 * second, then lunges it (the hit 6 frames later). Poochyena braces and
 * holds its brush up stiff while it shines, then spins round on the spot
 * to its right, the tail lashing through the foe as its back comes round,
 * and faces the foe again.
 */
const tailWhip: Clip = {
  name: 'tail',
  duration: 1.8,
  keys: [
    key(0),
    // Braced, tail up stiff as it shines.
    key(0.25, body({ y: -0.02, z: -0.01, spine: 2, neck: 4, head: 2 }), ears(-10), tail(40), hackles(22), ANGRY),
    key(0.5, body({ y: -0.024, z: -0.012, spine: 2, neck: 4, head: 2, headZ: 1.5 }), ears(-12), tail(44), hackles(26), ANGRY),
    key(0.72, body({ y: -0.026, z: -0.012, spine: 2, neck: 4, head: 2, headZ: -1.5 }), ears(-12), tail(42), hackles(28), ANGRY),
    // Coil: the front half winds to its left, the head watching the foe.
    key(0.88, body({ y: -0.04, z: -0.01, spine: 3, neck: 6, head: 4, headY: -8 }), { bones: { spine: { y: 10 }, chest: { y: 5 } } }, ears(-20), tail(30, 20), hackles(30), ANGRY),
    // The spin: round to its right, the tail lashing through the foe.
    key(0.96, { root: { yaw: -70 } }, body({ y: -0.03, spine: 2, neck: 4, head: 2 }), { bones: { spine: { y: -6 }, chest: { y: -3 } } }, ears(-28), tail(24, -30), hackles(30), ANGRY),
    snap(1.03, { root: { yaw: -150 } }, body({ y: -0.028, spine: 2, neck: 4, head: 2 }), { bones: { spine: { y: -14 }, chest: { y: -8 } } }, ears(-30), tail(16, -40), hackles(30), ANGRY),
    key(1.1, { root: { yaw: -250 } }, body({ y: -0.03, spine: 2, neck: 4, head: 2 }), { bones: { spine: { y: -8 }, chest: { y: -4 } } }, ears(-26), tail(20, -24), hackles(28), ANGRY),
    // Round again, braced to face the foe.
    key(1.2, { root: { yaw: -360 } }, body({ y: -0.04, z: 0.004, spine: 3, neck: 6, head: 4 }), ears(-16), tail(24, 10), hackles(24), ANGRY),
    key(1.4, { root: { yaw: -360 } }, body({ y: -0.016, spine: 1, neck: 2, head: 1 }), ears(-4), tail(14), hackles(14), ANGRY),
    key(1.8, { root: { yaw: -360 } }, OPEN),
  ],
  events: [{ t: 1.05, name: 'impact' }],
};

/**
 * Swagger, Attract (charm): it puffs itself up, nose in the air and eyes
 * shut in smug contempt, wagging its brush of a tail at the foe, and tosses
 * its head.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    key(0.24, body({ y: 0.006, spine: -5, chest: -4, neck: -8, head: -2 }), jaw(-4), ears(6), tail(28, 30), hackles(28), SMUG),
    key(0.38, body({ y: 0.006, spine: -5, chest: -4, neck: -9, head: -3, headZ: 12 }), jaw(-4), ears(6), tail(30, -30), hackles(30), SMUG),
    key(0.52, body({ y: 0.006, spine: -5, chest: -4, neck: -9, head: -3, headZ: 15 }), jaw(-4), ears(6), tail(30, 30), hackles(30), SMUG),
    key(0.66, body({ y: 0.006, spine: -5, chest: -4, neck: -8, head: -2, headZ: 8 }), jaw(-4), ears(6), tail(30, -30), hackles(30), SMUG),
    // The head toss.
    snap(0.8, body({ y: 0.004, spine: -5, chest: -3, neck: -10, head: -6, headY: -14, headZ: -12 }), jaw(6), ears(4), tail(28, 24), hackles(28), SMUG),
    key(0.98, body({ y: 0.002, spine: -4, chest: -3, neck: -8, head: -4, headY: -9, headZ: -7 }), jaw(0), ears(4), tail(24, -20), hackles(24), ANGRY),
    key(1.16, body({ spine: -2, neck: -4, head: -2, headY: -2 }), ears(2), tail(16, 8), hackles(14), ANGRY),
    key(1.6, OPEN),
  ],
  events: [{ t: 0.5, name: 'emit' }],
};

/**
 * Rest (heal): it lies down, curls up with its chin on its paws and its
 * tail round it, and sleeps; the healing comes while it sleeps.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.1,
  keys: [
    key(0),
    key(0.3, body({ y: -0.06, spine: 3, neck: 8, head: 8 }), ears(-8), tail(-6), hackles(-10), DROWSY),
    key(0.7, body({ y: -0.19, spine: 6, chest: 2, neck: 20, head: 14 }), jaw(-4), ears(-18), tail(-8, 30), hackles(-16), SHUT),
    key(1.0, body({ y: -0.178, spine: 5, chest: 0, neck: 19, head: 13 }), jaw(-4), ears(-16), tail(-8, 32), hackles(-14), SHUT),
    key(1.25, body({ y: -0.192, spine: 6, chest: 3, neck: 22, head: 15 }), jaw(-4), ears(-19), tail(-8, 28), hackles(-17), SHUT),
    key(1.5, body({ y: -0.178, spine: 5, chest: 0, neck: 19, head: 13 }), jaw(-4), ears(-16), tail(-8, 33), hackles(-14), SHUT),
    key(1.8, body({ y: -0.05, spine: 2, neck: 4, head: 2 }), ears(0), tail(4), hackles(4), DROWSY),
    key(2.1, OPEN),
  ],
  events: [{ t: 0.8, name: 'aura' }],
};

/**
 * Hit: it yelps, jolted back with its head jerked up and away and its eyes
 * squeezed shut, ears pinned and tail tucked, then cringes low (the
 * Pokédex: it turns tail if the foe strikes back) before its hackles come
 * up again. The battler adds the sprung knock-back.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, body({ y: -0.02, z: -0.028, spine: -5, chest: -2, neck: -10, head: -6, neckY: 8, headY: 24, headZ: -12, roll: -4 }), jaw(16), ears(-38), tail(-28), hackles(-12), HURT),
    key(0.2, body({ y: -0.04, z: -0.018, spine: 4, chest: 2, neck: 8, head: 8, neckY: 3, headY: 10, headZ: -4, roll: -2 }), jaw(4), ears(-32), tail(-24), hackles(-8), HURT),
    key(0.38, body({ y: -0.008, spine: -1, neck: -2, head: -2, headY: -3 }), ears(-4), tail(8), hackles(10), ANGRY),
    key(0.62, OPEN),
  ],
};

/**
 * Fainting (worn out, not dying): a tired sway with the eyes half shut, the
 * tail and hackles drooping, then it sinks onto its belly, lays its head
 * down between its paws and shuts its eyes, and from the shrink the curled
 * body shrinks away (Battler3D).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, body({ y: -0.012, spine: 1, neck: 5, head: 8, roll: 5 }), jaw(-4), ears(-14), tail(-14), hackles(-14), DROWSY),
    key(0.5, body({ y: -0.09, spine: 4, chest: 1, neck: 12, head: 10, roll: -4 }), jaw(-4), ears(-24), tail(-20), hackles(-18), SHUT),
    key(0.84, body({ y: -0.2, spine: 7, chest: 2, neck: 24, head: 16, roll: 2 }), jaw(-4), ears(-30), tail(-10, 28), hackles(-20), SHUT),
    key(0.98, body({ y: -0.208, spine: 7, chest: 2, neck: 25, head: 17, roll: 2 }), jaw(-4), ears(-30), tail(-10, 30), hackles(-20), SHUT),
    key(1.6, body({ y: -0.204, spine: 7, chest: 2, neck: 24, head: 16, roll: 2 }), jaw(-4), ears(-30), tail(-10, 29), hackles(-20), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, physicalWeak, physicalStrong, bite, biteStrong, roar, roarFoe, kickSand, fling, statusTarget, statusSelf, specialWeak, specialStrong, strike, tailWhip, charm, heal, hit, faint].map((c) => [c.name, c]),
);

/** Eye atlas (pm0261_00_Eye1): 2 columns x 4 rows of 128x64 cells; the eyes' UVs sit in the bottom row. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  look: [1, 0],
  half: [0, -1],
  closed: [1, -1],
  happy: [0, -2],
  angry: [1, -2],
  hurt: [0, -3],
};
