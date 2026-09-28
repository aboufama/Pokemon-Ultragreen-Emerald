// Silcoon's battle animation set, written by hand as key poses in the style
// of the first clips of Blaziken, Sceptile and Swampert (src/pokemon/blaziken/
// first.ts): a clip for every action its moves take, each a short list of
// extremes over the stance (anticipation, the action, follow-through,
// recovery), timed by eye. (The cocoon kit in ./cocoon/ and ./clips.ts is no
// longer used.)
//
// How Silcoon moves (the brief in index.ts): a placid cocoon, light for one
// (10 kg), resting on the tips of its silk strands. It has no limbs, so it
// acts with its whole shell:
//   - root.pitch / root.roll tip the shell on its strands (forward +, to its
//     right +); root.y lifts it off them (hops); root.z lunges it at the foe;
//   - pelvis.y settles it down onto its strands (a squash) or rises on them;
//   - scale swells it (a breath, gathering silk) or tightens it (Harden);
//   - spine and head bend the soft silk: the top nods, leans and turns (the
//     opening between its eyes, where thread and barbs leave, turns with it);
//   - its five loose strands are posed like limbs (drawn in, bristling,
//     trailing, drooping) and quiver on their springs on top.
// Its character: calm and buoyant. It bobs, its hops are springy and high for
// a cocoon, it lands soft and bobs twice before it settles, and it keeps its
// eyes calm (open, or half-lidded when it concentrates).
//
// From our side only the top third of the shell shows above the text box, so
// every action also reads in the dome and its upper strands: hops, rocks and
// swells, never only a squash at the base. As the foe, its lower strands
// touch the top of our healthbox: it never sinks far or tips its front down
// at home (tools/gauntlet/uiclear.mjs).
//
// Events: impact (the bump lands), release (the barb leaves the opening),
// emit (thread sprays from the opening), aura (the shell's shine), cry, shrink.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (a drop onto its strands). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas ----------------------------------------------------------------

const OPEN: Pose = { expression: 'open' };
/** Half-lidded: calm concentration, a drowsy droop. */
const HALF: Pose = { expression: 'half' };
const SHUT: Pose = { expression: 'closed' };
/** Squeezed shut (straining, a jolt). */
const SQUEEZE: Pose = { expression: 'squeeze' };

/** The soft silk bending: its middle and its top nod forward (+) or back (-); the top turns (y, to its left +) and tilts (z). */
const bend = (spine: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, head: { x: head, y: headY, z: headZ } },
});
/** The whole shell tipped on its strands: forward (+) or back (-), to its right (+) or left (-). */
const tip = (pitch: number, roll = 0): Pose => ({ root: { pitch, roll } });
/** Settled down onto its strands (-) or risen on them (+), in heights. */
const sink = (y: number): Pose => ({ pelvis: { y } });
/** The shell swelling (> 1) or tightening (< 1). */
const swell = (s: number): Pose => ({ scale: s });
/** Lunged toward the foe (+) or drawn back (-), in heights. */
const lunge = (z: number): Pose => ({ root: { z } });
/** Off its strands: a hop's height (heights), and how far toward the foe it has travelled. */
const air = (y: number, advance = 0): Pose => ({ plantFeet: 0, advance, root: { y } });
/** On its strands, this far toward the foe. */
const at = (advance: number): Pose => ({ advance });

/** The loose strands trailing back as it flies forward. */
const TRAIL: Pose = { bones: { strandTop: { x: -22 }, strandUpL: { x: -14 }, strandUpR: { x: -14 }, strandL: { y: 18 }, strandR: { y: -18 } } };
/** The strands drawn in close round the shell (curled up; hunched against a blow). */
const DRAWN_IN: Pose = { bones: { strandTop: { x: 14 }, strandUpL: { x: -10, z: 10 }, strandUpR: { x: -10, z: -10 }, strandL: { z: -14 }, strandR: { z: 14 } } };
/** The strands flung out wide (bursting out, a jolt). */
const FLARED: Pose = { bones: { strandTop: { x: -16 }, strandUpL: { z: -12 }, strandUpR: { z: 12 }, strandL: { z: 16 }, strandR: { z: -16 } } };
/** The strands stiff and straight, standing out from the tightened shell (Harden). */
const BRISTLE: Pose = { bones: { strandTop: { x: -12 }, strandUpL: { x: -6, z: 8 }, strandUpR: { x: -6, z: -8 }, strandL: { z: 12 }, strandR: { z: -12 } } };
/** The strands hanging limp (worn out). */
const DROOP: Pose = { bones: { strandTop: { x: 24 }, strandUpL: { z: -16 }, strandUpR: { z: 16 }, strandL: { z: -18 }, strandR: { z: 18 } } };

// Battle moments -------------------------------------------------------------------

/**
 * Idle: it bobs gently on its strands like a buoy, rising as it rocks to one
 * side and settling as it rocks to the other, as if it still hung from a
 * thread; the second bob a little smaller than the first, and it passes
 * through its stance moving, never stopping. The life layer breathes on top
 * and the strands quiver.
 */
const idle: Clip = {
  name: 'idle',
  duration: 3.2,
  loop: true,
  keys: [
    key(0),
    key(0.4, sink(0.015), tip(-1, 2.4), bend(-1.5, -2.5), swell(1.008)),
    key(1.2, sink(-0.013), tip(1.2, -2.4), bend(1.8, 3), swell(0.993)),
    key(2.0, sink(0.012), tip(-0.8, 2), bend(-1.2, -2), swell(1.006)),
    key(2.8, sink(-0.011), tip(1, -2.2), bend(1.5, 2.6), swell(0.994)),
    key(3.2),
  ],
};

/**
 * Sent out: curled low on its strands with its eyes shut and its strands
 * drawn in, it pops up in a springy hop, eyes wide and strands flung out
 * (the cry, a shiver at the top), lands soft and bobs twice before it
 * settles, watching the foe.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, sink(-0.03), tip(-4), bend(8, 12), swell(0.95), DRAWN_IN, SHUT),
    key(0.2, sink(-0.04), tip(-6), bend(10, 15), swell(0.93), DRAWN_IN, SHUT),
    // Pop: up off its strands, stretched, eyes open, strands flung out.
    snap(0.4, air(0.07), tip(-5), bend(-6, -10), swell(1.05), FLARED, OPEN),
    // The cry: a shiver at the top of the hop (moving hold).
    key(0.52, air(0.08), tip(-4, 2.5), bend(-6, -11, 0, 3), swell(1.05), FLARED, OPEN),
    key(0.62, air(0.065), tip(-4, -2.5), bend(-5, -10, 0, -3), swell(1.045), FLARED, OPEN),
    // Lands soft, squashing onto its strands...
    fall(0.76, sink(-0.03), tip(3), bend(4, 7), swell(0.96), OPEN),
    // ...and bobs twice before it settles.
    key(0.94, sink(0.012), tip(-2), bend(-2, -3), swell(1.02), OPEN),
    key(1.12, sink(-0.01), tip(1.2), bend(1.5, 2), swell(0.99), OPEN),
    key(1.3, sink(0.004), tip(-0.5), bend(-0.5, -0.5), HALF),
    key(1.6, OPEN),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/** Hit: it rocks back on its strands with its eyes squeezed shut, then wobbles back upright through a small overshoot. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, tip(-14, 3), lunge(-0.02), bend(-6, -10, 0, 3), swell(0.97), DRAWN_IN, SQUEEZE),
    key(0.2, tip(-6, 1), bend(-2, -4), SQUEEZE),
    key(0.36, tip(4, -1), bend(2, 3), HALF),
    key(0.62, OPEN),
  ],
};

/**
 * Fainting (worn out, never dying): a tired sway with its eyes drooping,
 * then its top bows over and it slumps down on its strands, eyes shut and
 * strands hanging limp, and from the shrink it shrinks away. It sits back as
 * it slumps: as the foe, its lower strands rest on the top of our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, tip(-3, -4), bend(-3, -5, 0, -3), HALF),
    key(0.48, sink(-0.015), tip(-3, 3), bend(8, 12, 0, 3), swell(0.98), DROOP, SHUT),
    key(0.82, sink(-0.03), tip(-4, 2), bend(14, 20, 0, 4), swell(0.965), DROOP, SHUT),
    key(0.96, sink(-0.032), tip(-4, 2.4), bend(15, 21, 0, 5), swell(0.96), DROOP, SHUT),
    // Still sagging a little as it shrinks away (a moving hold).
    key(1.24, sink(-0.036), tip(-4.5, 3), bend(16.5, 23, 0, 6), swell(0.955), DROOP, SHUT),
    key(1.6, sink(-0.034), tip(-4, 2.6), bend(16, 22, 0, 5), swell(0.957), DROOP, SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// Its moves -------------------------------------------------------------------------

/**
 * Tackle, Struggle (tackle): it settles and rocks back on its strands,
 * eyes on the foe (the coil), springs up and over in one high, buoyant arc
 * with its strands trailing, lands in front of the foe soft on its strands,
 * then throws its whole shell into it (the bump: lunging in and tipping over
 * so its brow drives into the foe), hangs pressed against it a moment,
 * bounces off it in one arc back home and bobs to rest.
 * After Blaziken's physical_weak and tackle.
 */
const tackle: Clip = {
  name: 'physical_weak',
  duration: 1.45,
  keys: [
    key(0),
    // The coil: settling down onto its strands, rocking well back, eyes narrowing.
    key(0.14, sink(-0.04), tip(-14), bend(-7, -11), swell(0.955), DRAWN_IN, HALF),
    key(0.24, sink(-0.05), tip(-16, 1), bend(-8, -12), swell(0.94), DRAWN_IN, HALF),
    // The spring: up and over along a high arc, tipping forward, strands trailing.
    key(0.37, air(0.16, 0.55), tip(8), bend(-3, -4), swell(1.04), TRAIL, OPEN),
    // Lands in front of the foe, soft on its strands, braking back a little.
    key(0.49, at(1), sink(-0.035), tip(-5), bend(3, 5), swell(0.95), OPEN),
    // The bump: the whole shell thrown into the foe, brow first.
    snap(0.57, at(1), lunge(0.2), tip(24), bend(5, 9), swell(1.03), FLARED, SQUEEZE),
    // Pressed against it (follow-through), then easing off.
    key(0.66, at(1), lunge(0.22), tip(26), bend(6, 10), swell(0.98), SQUEEZE),
    key(0.76, at(1), lunge(0.15), tip(15), bend(3, 5), HALF),
    // Bounces off it in one arc home.
    key(0.92, air(0.11, 0.45), tip(-8), bend(-2, -3), swell(1.03), TRAIL, OPEN),
    fall(1.04, at(0), sink(-0.03), tip(3), bend(3, 5), swell(0.96), OPEN),
    // Bobs twice to rest.
    key(1.18, sink(0.008), tip(-2), bend(-1, -2), swell(1.01), OPEN),
    key(1.3, sink(-0.004), tip(1), bend(0.5, 1), OPEN),
    key(1.45, OPEN),
  ],
  events: [{ t: 0.59, name: 'impact' }],
};

/**
 * Poison Sting (spit): it draws back and swells (a breath in, the barb
 * forming in its opening), then flicks its shell forward at the foe in a
 * little springing jolt off its strands, firing the barb from the opening;
 * it drops back onto its strands recoiling and bobs to rest.
 * After Blaziken's special_weak.
 */
const spit: Clip = {
  name: 'special_weak',
  duration: 1.25,
  keys: [
    key(0),
    // Breath in: rocked back, swelling, half-lidded.
    key(0.24, sink(0.012), tip(-14), bend(-7, -11), swell(1.045), HALF),
    key(0.31, sink(0.014), tip(-15, 1), bend(-8, -12), swell(1.05), HALF),
    // The flick: the shell springs forward off its strands, the opening (and its eyes) on the foe.
    snap(0.39, air(0.035), lunge(0.07), tip(10), bend(3, 4), swell(0.97), FLARED, OPEN),
    // Drops back onto its strands, recoiling, then bobs.
    fall(0.5, sink(-0.015), lunge(0.035), tip(-4), bend(-2, -3), swell(0.98), OPEN),
    key(0.64, sink(0.006), tip(2.5, -1), bend(1, 2), swell(1.01), HALF),
    key(0.82, sink(-0.004), tip(-1), bend(-0.5, -0.5), OPEN),
    key(1.25, OPEN),
  ],
  // The opening turns with its top, a few frames behind the shell.
  events: [{ t: 0.45, name: 'release' }],
};

/**
 * Harden (shield): calm, it draws in a slow breath and swells, closes its
 * eyes, then tightens its whole shell at once (it shrinks hard, its strands
 * stiff and bristling, eyes squeezed) as the shine spreads over it, and holds
 * the strain with a tremor until the shine has passed, so it is seen hard;
 * then it eases off and bobs, placid again.
 * After Blaziken's status_self and shield.
 */
const shield: Clip = {
  name: 'status_self',
  duration: 1.8,
  keys: [
    key(0),
    // A slow breath in: swelling and rising, eyes lidded, then shut.
    key(0.24, sink(0.014), tip(-4), bend(-4, -6), swell(1.05), HALF),
    key(0.37, sink(0.016), tip(-4.5), bend(-4.5, -7), swell(1.055), SHUT),
    // Tighten: the shell draws in hard, the strands stand stiff.
    snap(0.46, sink(-0.014), bend(3, 5), swell(0.91), BRISTLE, SQUEEZE),
    // Holding the strain (a tremor) while the shine spreads, and after.
    key(0.58, sink(-0.014), tip(0, 2), bend(3, 5, 0, 1.5), swell(0.905), BRISTLE, SQUEEZE),
    key(0.7, sink(-0.014), tip(0, -2), bend(3, 5, 0, -1.5), swell(0.91), BRISTLE, SQUEEZE),
    key(0.82, sink(-0.013), tip(0, 1.8), bend(3, 5, 0, 1.2), swell(0.905), BRISTLE, SQUEEZE),
    key(0.94, sink(-0.013), tip(0, -1.6), bend(3, 5, 0, -1), swell(0.91), BRISTLE, SQUEEZE),
    key(1.06, sink(-0.012), tip(0, 1.4), bend(3, 5, 0, 1), swell(0.905), BRISTLE, SQUEEZE),
    key(1.2, sink(-0.012), tip(0, -1), bend(3, 5), swell(0.91), BRISTLE, HALF),
    // Eases off and bobs, calm again.
    key(1.38, sink(0.004), bend(0.5, 1), swell(0.985), HALF),
    key(1.54, sink(0.008), tip(-1), bend(-1, -1.5), swell(1.01), OPEN),
    key(1.8, OPEN),
  ],
  events: [{ t: 0.5, name: 'aura' }],
};

/**
 * String Shot (powder): it rocks back and swells, gathering silk, then
 * thrusts its shell forward so the opening points at the foe and sprays
 * thread from it, sweeping the stream across the foe (the top turning one
 * way and the other) while the threads fly; then it rocks back and bobs to
 * rest. After Blaziken's status_target and special_strong's sustain.
 */
const stringShot: Clip = {
  name: 'status_target',
  duration: 1.76,
  keys: [
    key(0),
    // Gathering silk: rocked back, swelling.
    key(0.2, sink(0.012), tip(-10), bend(-5, -9), swell(1.04), HALF),
    key(0.3, sink(0.013), tip(-11, -1), bend(-5.5, -10), swell(1.045), HALF),
    // The thrust: leaning in, the opening (and its eyes) on the foe, the thread streaming out.
    snap(0.4, sink(-0.012), lunge(0.045), tip(6), bend(2, 3), swell(0.98), OPEN),
    // Sweeping the stream across the foe.
    key(0.58, sink(-0.01), lunge(0.04), tip(5.5, 3), bend(2, 3, -7), swell(0.985), OPEN),
    key(0.76, sink(-0.012), lunge(0.04), tip(6, -3), bend(2, 3, 7), swell(0.98), OPEN),
    key(0.94, sink(-0.01), lunge(0.035), tip(5.5, 2), bend(2, 3, -4), swell(0.985), OPEN),
    key(1.1, sink(-0.006), lunge(0.02), tip(4), bend(1.5, 2), HALF),
    // Rocks back, then bobs to rest.
    key(1.26, sink(0.006), tip(-4), bend(-2, -3), swell(1.01), OPEN),
    key(1.44, tip(1.5), bend(1, 1), OPEN),
    key(1.76, OPEN),
  ],
  // The opening turns with its top, a few frames behind the shell.
  events: [{ t: 0.46, name: 'emit' }],
};

export const SILCOON_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, tackle, spit, shield, stringShot].map((c) => [c.name, c]),
);

/**
 * Eye atlas (eye_mat: 4 x 2 cells; the eyes show column 0 of row 1): row 1
 * holds the open eye, the closed eye, a half-lidded eye and a happy closed
 * curve; row 0 a squeezed-shut line. Offsets from the open cell.
 */
export const SILCOON_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  closed: [1, 0],
  half: [2, 0],
  happy: [3, 0],
  squeeze: [0, 1],
};
