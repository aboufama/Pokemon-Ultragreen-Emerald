// Beautifly's battle animation set, in the style of the first clips of
// Blaziken, Sceptile and Swampert (src/pokemon/blaziken/first.ts): each clip
// a short list of key poses written by hand, STANCE plus small named deltas,
// extremes first (anticipation, the action, follow-through, recovery). A
// clip per action its moves take, not per move: every move of an action
// plays the same clip (index.ts maps the motifs).
//
// Beautifly hovers and never stands (plantFeet 0 in the stance): its travel
// is always flight. Its wings never stop, and the wing beat is part of the
// acting, keyed like any limb: the stance holds them up in the sprites' V,
// the top of a stroke, and every key says where they are in it (W_DOWN at
// the bottom of an ordinary stroke, W_DEEP a power stroke, W_HIGH clapped
// over the back to wind up, W_FWD swept forward to strike or brake). At rest
// it beats slowly; flying at the foe the strokes come quick and big. Each
// downstroke lifts the body a little (the hover's bob).
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has flown
//   root     x aside (+ its left), y up, z toward the foe (all in heights),
//            pitch (+ tips forward, about the point under it: 20° carries
//            the head ~0.16 of its height forward), roll (+ banks to its right), yaw
//   bones    wingL/wingR the wing roots (both wings of a side), hindL/R the
//            hindwings, spine the thorax, hips the abdomen, head, antennae,
//            the twelve joints of the proboscis
//   pelvis   the whole body inside the model (a faint's slump)
//   scale    a swell or a shrink
// Events: impact (contact lands), release (a ranged effect leaves: the
// wings' gusts, the proboscis' drink), releaseEnd, charge, cry, aura, emit, shrink.
//
// A contact blow lands on the foe's body, not inside it: advance 1 stops its
// front (the coiled proboscis) 0.15 of its height short of the foe's front,
// and the blow closes that with its lunge (root.z) and its lean (pitch) —
// about 0.16-0.2 in all at the impact, no more.
//
// The animator adds the rest: overlapping action (the head trails the body
// by ~0.065 s), the life layer's breathing, and springs on the forewing
// tips, the hindwing streamers and the antennae (index.ts).

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

/** Both sides alike: the left one given, y and z mirrored on the right. */
function sides(bones: Record<string, { x?: number; y?: number; z?: number }>): Pose {
  const out: NonNullable<Pose['bones']> = {};
  for (const [k, r] of Object.entries(bones)) {
    out[`${k}L`] = { x: r.x ?? 0, y: r.y ?? 0, z: r.z ?? 0 };
    out[`${k}R`] = { x: r.x ?? 0, y: -(r.y ?? 0), z: -(r.z ?? 0) };
  }
  return { bones: out };
}

/**
 * Both wings from the stance: swept back (+) or forward (-), raised (+) or
 * lowered (-); the hindwings give back `hind` of the raise, so their long
 * streamers swing less than the forewings beat.
 */
const wings = (sweep: number, lift: number, hind = 0.5): Pose => sides({ wing: { y: sweep, z: lift }, hind: { z: -lift * hind } });
/** One wing at a time (a bank, a single wing's slash): left and right given separately. */
const wingLR = (l: [number, number], r: [number, number], hind = 0.5): Pose => ({
  bones: {
    wingL: { y: l[0], z: l[1] }, hindL: { z: -l[1] * hind },
    wingR: { y: -r[0], z: -r[1] }, hindR: { z: r[1] * hind },
  },
});

/** The bottom of an ordinary stroke: spread wide and low. */
const W_DOWN = wings(-12, -30);
/** Halfway down (a light flutter). */
const W_MID = wings(-6, -15);
/** The bottom of a power stroke: spread flat, driven down and forward. */
const W_DEEP = wings(-18, -40);
/**
 * Drawn up into a narrower V (a wind-up, the top of a power stroke). No
 * further: from our side (behind it and to its left) wings raised past
 * this close up behind each other, one wing's face with the head at its
 * edge, and it reads as turned aside; a wind-up draws the body back instead.
 */
const W_HIGH = wings(8, 12);
/** Swept forward and down, at the foe (a wing strike, braking). */
const W_FWD = wings(-46, -16);
/** Spread flat and still (gliding, basking). */
const W_SPREAD = wings(-8, -26, 0.8);
/** Folded shut up over its back, as a butterfly rests. */
const W_FOLD = wings(28, 40, 0.2);

/** Where it flies: advance toward the foe, and the root: height, lunge (heights), lean. */
const at = (advance: number, y = 0, z = 0, pitch = 0, roll = 0, x = 0): Pose => ({ advance, root: { x, y, z, pitch, roll } });
/** The root alone (at home). */
const rise = (y: number, z = 0, pitch = 0, roll = 0, x = 0): Pose => ({ root: { x, y, z, pitch, roll } });
/** The body bent: thorax (+ forward), head (+ nods down, headY turns to its left), abdomen (- curls it under). */
const body = (spine: number, head: number, hips = 0, headY = 0): Pose => ({ bones: { spine: { x: spine }, head: { x: head, y: headY }, hips: { x: hips } } });
/** The antennae tipped forward (+) or swept back (-). */
const feelers = (x: number, spread = 0): Pose => sides({ antenna1: { x, z: spread }, antenna2: { x: x * 0.5 } });
/** A swell (a breath, puffing up) or a shrink. */
const swell = (s: number): Pose => ({ scale: s });
const pelvis = (y: number, z = 0): Pose => ({ pelvis: { y, z } });

/**
 * The proboscis from its coil (0: the stance) to straight out at the foe
 * (1): the chain uncoils from the root and the first joint lifts it level.
 * `aim` tips the whole of it down (+) or up (-).
 */
const reach = (k: number, aim = 0): Pose => {
  const bones: NonNullable<Pose['bones']> = { proboscis1: { x: -10 * k + aim } };
  for (let i = 2; i <= 12; i++) bones[`proboscis${i}`] = { x: 32 * k };
  return { bones };
};
/** A pull on the drink: the reaching proboscis ripples, its tip curling a little. */
const sip = (k: number, s: number): Pose => {
  const bones: NonNullable<Pose['bones']> = { proboscis1: { x: -10 * k } };
  for (let i = 2; i <= 12; i++) bones[`proboscis${i}`] = { x: 32 * k - s * (i > 8 ? 7 : 2) };
  return { bones };
};

// The moments ----------------------------------------------------------------

/**
 * Hovering: a slow, even beat (0.6 s a stroke), each downstroke lifting it a
 * touch, drifting a little from side to side with its head on the foe. The
 * loop turns round at the top of a stroke (the stance), where the wings
 * turn round anyway.
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.3, rise(0.018, 0, -1.2, -1, 0.006), W_DOWN, body(-1, -1)),
    key(0.6, rise(0.002, 0, 0.4, -1.8, 0.012), wings(1, 2), feelers(2)),
    key(0.9, rise(0.02, 0, -1.2, -1, 0.01), wings(-13, -32), body(-1, -1)),
    key(1.2, rise(0.003, 0, 0.3, 0.5, 0.002), wings(0, 1)),
    key(1.5, rise(0.017, 0, -1, 1.2, -0.008), wings(-11, -28), body(-1, -1)),
    key(1.8, rise(0.002, 0, 0.4, 1.8, -0.012), wings(1, 2), feelers(2)),
    key(2.1, rise(0.019, 0, -1.2, 0.8, -0.006), wings(-12, -31), body(-1, -1)),
    key(2.4),
  ],
};

/**
 * Sent out: it comes out folded small, wings shut over its back and the
 * body tucked; it flings them open with a snap and rises on two big beats
 * with its cry, then settles into its hover.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, rise(-0.05, 0, 6), W_FOLD, body(8, 14, -18), feelers(-10), swell(0.94)),
    key(0.2, rise(-0.06, 0, 8), wings(30, 42, 0.2), body(10, 16, -20), feelers(-12), swell(0.93)),
    // Bursts open: wings flung down and wide, the body rising on the stroke, head up.
    snap(0.4, rise(0.05, 0, -8), W_DEEP, body(-6, -10, 6), feelers(10, 6), swell(1.03)),
    // The cry: a quick, excited flutter at the top, a moving hold.
    key(0.52, rise(0.07, 0, -6), W_HIGH, body(-5, -9, 5), feelers(8, 6), swell(1.03)),
    key(0.64, rise(0.075, 0, -7, 3), wings(-16, -36), body(-6, -10, 6, 4), feelers(10, 6), swell(1.02)),
    key(0.76, rise(0.07, 0, -5, -3), wings(6, 12), body(-5, -8, 5, -4), feelers(8, 4)),
    key(0.9, rise(0.06, 0, -3), wings(-14, -32), body(-3, -5, 3)),
    // Down into its hover.
    key(1.08, rise(0.025, 0, 0), wings(2, 4)),
    key(1.3, rise(0.02, 0, -1), W_DOWN),
    key(1.65),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Taking a hit: knocked back in the air, it tips back with its wings flung
 * up (the battler adds a sprung knock-back), then beats hard to steady
 * itself and settles.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, rise(0.01, -0.03, -16, 6), wings(12, 16), body(-8, -14, 10), feelers(-8)),
    key(0.2, rise(0.005, -0.02, -8, 3), W_DOWN, body(-4, -7, 5), feelers(-6)),
    key(0.36, rise(0.012, 0, 2, -1), wings(2, 6), body(1, 2)),
    key(0.5, rise(0.01, 0, -0.5), W_MID),
    key(0.62),
  ],
};

/**
 * Fainting, worn out (not dying): its beat falters and its wings droop; it
 * flutters down on a few weak strokes, sagging to one side, and slumps low,
 * wings drooping open and head bowed, the abdomen curled; from the 'shrink'
 * the slumped body shrinks away. It comes down straight (the root sinks
 * a tenth of its height at most; the pelvis carries the body the rest of the
 * way) and leans back over itself rather than forward toward our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    // The beat falters: a weak half-stroke, the head nodding.
    key(0.2, rise(-0.01, 0, 3, -4), W_MID, body(2, 8, -4), feelers(-6)),
    key(0.36, rise(-0.025, 0, -2, 4), wings(4, 6), body(1, 10, -6), feelers(-8)),
    // Fluttering down on weak strokes, sagging to one side.
    key(0.54, rise(-0.05, -0.01, 2, -8), pelvis(-0.03), wings(-14, -30), body(4, 14, -10), feelers(-12)),
    key(0.7, rise(-0.07, -0.015, -3, -6), pelvis(-0.06), wings(-4, -10), body(4, 16, -12), feelers(-14)),
    // Slumps: wings drooping open, head bowed, the abdomen curled.
    fall(0.88, rise(-0.1, -0.02, -6, -12), pelvis(-0.1), wings(-10, -42, 0.2), body(6, 22, -18), feelers(-18, -6)),
    key(0.98, rise(-0.1, -0.02, -7, -13), pelvis(-0.105), wings(-11, -44, 0.2), body(7, 24, -20), feelers(-18, -6)),
    key(1.6, rise(-0.1, -0.02, -6, -12), pelvis(-0.1), wings(-10, -43, 0.2), body(6, 23, -19), feelers(-17, -6)),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// Contact: it flies at the foe and strikes it ---------------------------------

/**
 * Tackle and every blow with the whole body (Return, Frustration, Facade,
 * Secret Power, Struggle): it rears back with its wings clapped high, one
 * big downstroke flings it at the foe along an arc, and it rams it with its
 * head and thorax; it bounces off with its wings flung up and flutters home.
 * (Blaziken's `tackle`, flown.)
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.3,
  keys: [
    key(0),
    // Wind-up: rears back and up, wings clapped over the back.
    key(0.12, at(0, 0.03, -0.04, -10), W_HIGH, body(-6, -1, 6), feelers(-4)),
    key(0.2, at(0, 0.04, -0.06, -13), wings(10, 14), body(-8, -2, 8), feelers(-5)),
    // The launch: a big downstroke flings it up and at the foe.
    key(0.29, at(0.5, 0.14, 0, 4), W_DEEP, body(2, 0, -4)),
    // Over the top of the arc, the wings coming back up, tipping at the foe.
    key(0.37, at(0.84, 0.1, 0, 10), wings(6, 12), body(4, 2, -6)),
    // In front of it: the wings brake forward, the body drawn back to ram.
    key(0.44, at(1, 0.035, -0.02, 0), W_FWD, body(-3, -4, 4), feelers(-4)),
    // The ram: thorax and head driven into it.
    snap(0.5, at(1, 0.025, 0.02, 12), wings(-18, -34), body(6, 8, -10), feelers(8)),
    // Pressed into it a moment (follow-through).
    key(0.6, at(1, 0.025, 0.02, 13), wings(-14, -30), body(7, 9, -10), feelers(10)),
    // Bounces off it, wings flung up.
    key(0.72, at(0.82, 0.08, -0.02, -10), W_HIGH, body(-4, -6, 6), feelers(-6)),
    // Flutters home along a low arc.
    key(0.86, at(0.42, 0.085, 0, -4), W_DOWN, body(-2, -2)),
    key(0.98, at(0.08, 0.04, 0, -1), wings(2, 4)),
    // Settles into its hover.
    key(1.1, at(0, 0.012, 0, 0.5), W_DOWN),
    key(1.3),
  ],
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Aerial Ace and Thief (a wing slash): a blur: it cocks its wings high and
 * back, streaks up over the foe in one arc, dives down onto it slashing both
 * wings forward and down across it, carries through below and swings back
 * up and home. (Blaziken's `physical_weak`, flown.)
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Wind-up: wings cocked high and back, the body dropping a touch, coiled.
    key(0.12, at(0, -0.02, -0.045, -8), wings(12, 14), body(-5, -1, 6), feelers(-5)),
    // Streaks up over the foe (a downstroke launches it).
    key(0.26, at(0.55, 0.2, 0, -4), W_DEEP, body(-2, -2, 2), feelers(-6)),
    // Over the foe, wings cocked high for the slash, tipping down onto it.
    key(0.36, at(0.94, 0.17, 0, 12), wings(18, 22), body(2, 2, -4), feelers(-4)),
    // The slash: diving onto it, both wings swept forward and down across it.
    snap(0.43, at(1, 0.05, 0.005, 12), wings(-48, -30), body(8, 10, -12), feelers(10)),
    // Carried through below, the wings hanging forward a beat.
    key(0.58, at(1, 0.01, 0.005, 11), wings(-54, -38), body(9, 12, -14), feelers(10)),
    // Swings back up off it.
    key(0.72, at(0.92, 0.07, -0.02, -8), W_HIGH, body(-3, -4, 4)),
    // Home along an arc.
    key(0.86, at(0.45, 0.09, 0, -3), W_DOWN, body(-1, -1)),
    key(0.98, at(0.08, 0.04, 0, -1), wings(2, 4)),
    key(1.1, at(0, 0.012, 0, 0.5), W_DOWN),
    key(1.3),
  ],
  events: [{ t: 0.47, name: 'impact' }],
};

/**
 * Double-Edge (the big blow): reckless. It draws back low and beats itself
 * up, climbs high along its arc to the foe, folds its wings back and stoops
 * on it head first, crashing its whole body into it; the recoil throws it
 * back tumbling, wings flailing, and it steadies itself shakily and flies
 * home. (Blaziken's `physical_strong`: a coil, a big leap, the strike on
 * the way down, a deep landing.)
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.05,
  keys: [
    key(0),
    // Coil: drawn back and low, wings clapped high, gathering.
    key(0.2, at(0, -0.035, -0.06, -9), W_HIGH, body(-6, -2, 8), feelers(-5)),
    key(0.3, at(0, -0.045, -0.075, -11), wings(10, 14), body(-8, -3, 9), feelers(-6)),
    // Beats itself up and in: the climb.
    key(0.44, at(0.3, 0.14, -0.02, -10), W_DEEP, body(-4, -6, 4), feelers(-8)),
    key(0.56, at(0.6, 0.26, 0, -4), wings(8, 16), body(-2, -2, 2), feelers(-6)),
    // At the top it folds its wings back and tips over into the stoop.
    key(0.66, at(0.84, 0.25, 0, 24), wings(30, 18, 0.3), body(6, 6, -8), feelers(-14)),
    // The crash: head first into the foe with its whole weight.
    snap(0.76, at(1, 0.05, 0.01, 13), wings(24, 6, 0.3), body(8, 10, -10), feelers(-10)),
    key(0.84, at(1, 0.04, 0.012, 14), wings(22, 4, 0.3), body(9, 11, -10), feelers(-8)),
    // Thrown back by the recoil, tumbling, the wings flailing.
    key(0.96, at(0.9, 0.1, -0.03, -22, 14), wings(-20, -36), body(-8, -12, 10), feelers(-12)),
    key(1.08, at(0.84, 0.08, -0.02, -8, -10), wings(10, 16), body(-4, -6, 6), feelers(-6)),
    // Steadies itself, shaken.
    key(1.2, at(0.84, 0.06, 0, 4, 6), W_DOWN, body(2, 6, -2)),
    key(1.34, at(0.84, 0.07, 0, -2, -3), wings(2, 6), body(1, 4)),
    // Flies home.
    key(1.48, at(0.45, 0.1, 0, -3), W_DOWN, body(-1, 0)),
    key(1.62, at(0.1, 0.05, 0, -1), wings(2, 4)),
    key(1.76, at(0, 0.012, 0, 0.5), W_DOWN),
    key(2.05),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

export const SET_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, tackle, physicalWeak, physicalStrong].map((c) => [c.name, c]),
);

// The set's helpers and deltas, for the ranged and status clips (./set_ranged.ts, ./set_status.ts).
export {
  key, snap, fall, sides, wings, wingLR, at, rise, body, feelers, swell, pelvis, reach, sip,
  W_DOWN, W_MID, W_DEEP, W_HIGH, W_FWD, W_SPREAD, W_FOLD,
};
