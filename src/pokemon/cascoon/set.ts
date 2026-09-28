// Cascoon's battle animation set, written by hand as key poses in the style
// of the first clips of Blaziken, Sceptile and Swampert (src/pokemon/blaziken/
// first.ts): a clip for every action its moves take, each a short list of
// extremes over the stance (anticipation, the action, follow-through,
// recovery), timed by eye. (The cocoon kit it used to share with Silcoon,
// src/pokemon/silcoon/cocoon/, and ./clips.ts are no longer used.)
//
// How Cascoon moves (the brief in index.ts): a purple cocoon that hides
// motionless and glares out of the opening in its silk; heavier than Silcoon
// (11.5 kg), stiff and grumpy. It has no limbs, so it acts with its whole
// shell:
//   - root.pitch / root.roll tip the shell on its strands (forward +, to its
//     right +); root.y lifts it off them (hops); root.z lunges it at the foe;
//   - pelvis.y settles it down onto its strands (a squash) or rises on them;
//   - scale swells it (gathering silk) or clenches it (Harden);
//   - spine and head bend the soft silk: the top hunches forward over its
//     glaring eyes, leans and turns (the opening, where thread and barbs
//     leave, turns with it);
//   - its five loose strands are posed like limbs (drawn in, clamped flat,
//     bristling, trailing, drooping) and quiver on their springs on top.
// Its character: hunkered and glaring. Where Silcoon rocks back and bobs,
// Cascoon hunches its brow forward and narrows its eyes; it hops low and
// heavy, thuds down deep rather than bouncing, rams and grinds instead of
// bumping, clenches with its eyes open, and settles with a grumpy rock.
//
// From our side only the top third of the shell shows above the text box, so
// every action also reads in the dome and its upper strands. As the foe, its
// lower strands touch the top of our healthbox: at home it hunches by bending
// its top forward, never by tipping its front down or sinking far
// (tools/gauntlet/uiclear.mjs).
//
// Events: impact (the ram lands), release (the barb leaves the opening),
// emit (thread sprays from the opening), aura (the shell's shine), cry, shrink.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (a heavy drop onto its strands). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas ----------------------------------------------------------------

const OPEN: Pose = { expression: 'open' };
/** Narrowed: its glare. */
const GLARE: Pose = { expression: 'half' };
const SHUT: Pose = { expression: 'closed' };
/** Squeezed shut (a jolt, a hit). */
const SQUEEZE: Pose = { expression: 'squeeze' };

/** The soft silk bending: its middle and its top hunch forward (+) or straighten back (-); the top turns (y, to its left +) and tilts (z). */
const bend = (spine: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, head: { x: head, y: headY, z: headZ } },
});
/** The whole shell tipped on its strands: forward (+) or back (-), to its right (+) or left (-). */
const tip = (pitch: number, roll = 0): Pose => ({ root: { pitch, roll } });
/** Settled down onto its strands (-) or risen on them (+), in heights. */
const sink = (y: number): Pose => ({ pelvis: { y } });
/** The shell swelling (> 1) or clenching (< 1). */
const swell = (s: number): Pose => ({ scale: s });
/** Lunged toward the foe (+) or drawn back (-), in heights. */
const lunge = (z: number): Pose => ({ root: { z } });
/** Off its strands: a hop's height (heights), and how far toward the foe it has travelled. */
const air = (y: number, advance = 0): Pose => ({ plantFeet: 0, advance, root: { y } });
/** On its strands, this far toward the foe. */
const at = (advance: number): Pose => ({ advance });

/** The loose strands swept back as it hurtles forward. */
const TRAIL: Pose = { bones: { strandTop: { x: -18 }, strandUpL: { x: -12 }, strandUpR: { x: -12 }, strandL: { y: 16 }, strandR: { y: -16 } } };
/** The strands drawn in round the shell (curled up; hunched for a ram). */
const DRAWN_IN: Pose = { bones: { strandTop: { x: 16 }, strandUpL: { x: -8, z: -8 }, strandUpR: { x: -8, z: 8 }, strandL: { z: -14 }, strandR: { z: 14 } } };
/** The strands clamped flat down against the shell (Harden: armoured). */
const CLAMPED: Pose = { bones: { strandTop: { x: 22 }, strandUpL: { x: -10, z: -14 }, strandUpR: { x: -10, z: 14 }, strandL: { z: -18 }, strandR: { z: 18 } } };
/** The strands bristling stiff (angry, straining). */
const BRISTLE: Pose = { bones: { strandTop: { x: -10 }, strandUpL: { z: 8 }, strandUpR: { z: -8 }, strandL: { z: 12 }, strandR: { z: -12 } } };
/** The strands hanging limp (worn out). */
const DROOP: Pose = { bones: { strandTop: { x: 20 }, strandUpL: { z: -16 }, strandUpR: { z: 16 }, strandL: { z: -16 }, strandR: { z: 16 } } };

// Battle moments -------------------------------------------------------------------

/**
 * Idle: it hides motionless, glaring: only a slow, heavy breath swells it,
 * its top hunching a touch lower as it breathes in, and now and then its
 * glare narrows on the foe; the life layer and the strands' springs do the
 * rest.
 */
const idle: Clip = {
  name: 'idle',
  duration: 3.6,
  loop: true,
  keys: [
    key(0),
    key(1.2, sink(-0.006), bend(1, 2), swell(1.014)),
    key(1.7, sink(-0.007), bend(1.4, 2.8), swell(1.016), GLARE),
    key(2.4, sink(-0.003), tip(1), bend(0.6, 1.2), swell(1.006), GLARE),
    key(3.0, sink(0.002), tip(-0.6), bend(-0.4, -0.8), swell(0.998)),
    key(3.6),
  ],
};

/**
 * Sent out: curled tight with its eyes shut and its strands drawn in, it
 * heaves itself up in a short, heavy hop, thuds down hunched over its
 * glaring eyes and shudders at the foe (the cry, its strands bristling),
 * then settles, glaring.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.7,
  keys: [
    key(0, sink(-0.03), tip(-3), bend(8, 12), swell(0.95), DRAWN_IN, SHUT),
    key(0.24, sink(-0.04), tip(-4), bend(10, 14), swell(0.935), DRAWN_IN, SHUT),
    // Heaves up, eyes open.
    snap(0.44, air(0.05), tip(-4), bend(-4, -6), swell(1.04), BRISTLE, OPEN),
    // Thuds down, hunched, its glare on the foe.
    fall(0.58, sink(-0.03), tip(1), bend(3, 5), swell(0.97), GLARE),
    // The cry: a glaring shudder, strands bristling (moving hold).
    key(0.7, sink(-0.026), tip(1, 2.5), bend(3.5, 5.5, 0, 3), swell(1.0), BRISTLE, GLARE),
    key(0.8, sink(-0.026), tip(1, -2.5), bend(3.5, 5.5, 0, -3), swell(1.005), BRISTLE, GLARE),
    key(0.9, sink(-0.024), tip(1, 2), bend(3, 5, 0, 2), swell(1.0), BRISTLE, GLARE),
    // Settles, still glaring.
    key(1.1, sink(-0.012), tip(0.5), bend(2, 3), GLARE),
    key(1.36, sink(-0.003), tip(0.3), bend(1, 1.5), OPEN),
    key(1.7, OPEN),
  ],
  events: [{ t: 0.72, name: 'cry' }],
};

/** Hit: heavy, it jolts back only a little with its eyes squeezed, then settles forward and glares back. */
const hit: Clip = {
  name: 'hit',
  duration: 0.66,
  keys: [
    key(0),
    snap(0.05, tip(-10, -2), lunge(-0.015), bend(-4, -7, 0, -2), swell(0.97), DRAWN_IN, SQUEEZE),
    key(0.22, tip(-4, -1), bend(-1, -2), SQUEEZE),
    key(0.4, tip(1.5), bend(3, 5), GLARE),
    key(0.66, OPEN),
  ],
};

/**
 * Fainting (worn out, never dying): a heavy, grudging sway with its glare
 * failing, then it settles down onto its strands with its top bowed over its
 * shut eyes and its strands hanging limp, and from the shrink it shrinks
 * away. It sits back as it slumps: as the foe, its lower strands rest on the
 * top of our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.7,
  keys: [
    key(0),
    key(0.22, tip(-2, 3), bend(-2, -3, 0, 3), GLARE),
    key(0.54, sink(-0.015), tip(-3, -2), bend(9, 13, 0, -3), swell(0.98), DROOP, SHUT),
    key(0.9, sink(-0.03), tip(-4, -1.5), bend(16, 22, 0, -4), swell(0.96), DROOP, SHUT),
    key(1.04, sink(-0.032), tip(-4, -1.8), bend(17, 23, 0, -5), swell(0.955), DROOP, SHUT),
    // Still settling, heavily, as it shrinks away (a moving hold).
    key(1.34, sink(-0.036), tip(-4.5, -2.4), bend(18.5, 25, 0, -6), swell(0.95), DROOP, SHUT),
    key(1.7, sink(-0.035), tip(-4.2, -2), bend(18, 24, 0, -5), swell(0.952), DROOP, SHUT),
  ],
  events: [{ t: 1.12, name: 'shrink' }],
};

// Its moves -------------------------------------------------------------------------

/**
 * Tackle, Struggle (tackle): a grumpy rock back, then it hunkers down low
 * with its brow forward like a ram (the coil), hops at the foe in one low,
 * heavy arc, thuds down deep in front of it, then drives its whole shell into
 * it brow first and grinds against it, glaring; it pulls back off it, hops
 * home heavily, thuds down and settles with a rock.
 * After Blaziken's physical_weak and Swampert's heavy shoulder charge.
 */
const tackle: Clip = {
  name: 'physical_weak',
  duration: 1.72,
  keys: [
    key(0),
    // Gathering itself: a grumpy rock back.
    key(0.14, sink(-0.02), tip(-6), bend(-3, -5), swell(0.98), GLARE),
    // The coil: hunkered down low and squat, brow lowered, the glare fixed on
    // the foe; it digs in, easing back a touch, before it springs.
    key(0.3, sink(-0.055), tip(4), bend(4, 5), swell(0.94), DRAWN_IN, GLARE),
    key(0.37, sink(-0.06), tip(2.5, 1), bend(3.5, 4.5), swell(0.935), DRAWN_IN, GLARE),
    // A low, heavy hop at the foe, brow leading, strands swept back.
    key(0.49, air(0.09, 0.55), tip(14), bend(4, 6), swell(1.02), TRAIL, GLARE),
    // Thuds down deep in front of it, glaring.
    key(0.62, at(1), sink(-0.05), tip(3), bend(4, 6), swell(0.94), GLARE),
    // The ram: its whole shell driven into the foe, brow first.
    snap(0.72, at(1), lunge(0.19), tip(26), bend(7, 12), swell(1.02), BRISTLE, SQUEEZE),
    // Grinding against it, one way and the other (follow-through).
    key(0.8, at(1), lunge(0.21), tip(28, 3), bend(8, 13, 0, 3), swell(0.99), BRISTLE, SQUEEZE),
    key(0.9, at(1), lunge(0.2), tip(27, -3), bend(8, 13, 0, -3), swell(0.995), GLARE),
    // Pulls back off it...
    key(1.02, at(1), lunge(0.1), tip(10), bend(4, 6), GLARE),
    // ...and hops home, low and heavy.
    key(1.18, air(0.07, 0.45), tip(-6), bend(-1, -2), swell(1.02), TRAIL, GLARE),
    fall(1.32, at(0), sink(-0.045), tip(4), bend(4, 7), swell(0.95), GLARE),
    // Settles with a grumpy rock.
    key(1.48, sink(-0.012), tip(-1.5, 1.5), bend(1, 2), OPEN),
    key(1.72, OPEN),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/**
 * Poison Sting (spit): it draws in and tenses, trembling, its glare fixed on
 * the foe, then jerks its shell forward hard (no hop: it is heavy) and fires
 * the barb from its opening; it holds the glare a beat, then pulls back.
 * After Blaziken's special_weak.
 */
const spit: Clip = {
  name: 'special_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Drawing in and tensing, a shiver running through it.
    key(0.18, sink(-0.01), tip(-6), bend(-3, -5), swell(1.02), GLARE),
    key(0.32, sink(-0.015), tip(-8.5, 1.2), bend(-4.5, -7.5, 0, 1), swell(1.04), GLARE),
    // The jab: a hard jerk forward, the barb spat from the opening.
    snap(0.42, lunge(0.05), tip(5), bend(3, 3), swell(0.96), BRISTLE, SQUEEZE),
    // Holds its glare after it a beat, then pulls back.
    key(0.52, lunge(0.055), tip(5.5), bend(3.5, 3.5), swell(0.965), BRISTLE, GLARE),
    key(0.7, sink(-0.006), lunge(0.015), tip(1), bend(1.5, 2), GLARE),
    key(0.9, sink(-0.003), tip(-1, 1), bend(0.5, 1), GLARE),
    key(1.3, OPEN),
  ],
  // The opening turns with its top, a few frames behind the shell.
  events: [{ t: 0.48, name: 'release' }],
};

/**
 * Harden (shield): a short breath, then it hunches and clenches its whole
 * shell (it shrinks hard, its strands clamped flat against it like armour)
 * as the shine spreads over it, glaring through it all rather than closing
 * its eyes, and holds it with a strained tremor until the shine has passed,
 * so it is seen hard; then it unclenches slowly.
 * After Blaziken's status_self and shield.
 */
const shield: Clip = {
  name: 'status_self',
  duration: 1.82,
  keys: [
    key(0),
    // A short breath in.
    key(0.22, sink(0.006), tip(-3), bend(-2, -3), swell(1.025), GLARE),
    // Hunching...
    key(0.34, sink(-0.012), bend(2, 3), swell(0.97), GLARE),
    // ...and clenching: the shell shrinks hard, the strands clamp down, the glare on the foe.
    snap(0.46, sink(-0.022), bend(3, 4.5), swell(0.9), CLAMPED, GLARE),
    // Holding it, strained (a tremor), through the shine and after.
    key(0.58, sink(-0.022), tip(0, 1.8), bend(3, 4.5, 0, 1.5), swell(0.895), CLAMPED, GLARE),
    key(0.7, sink(-0.022), tip(0, -1.8), bend(3, 4.5, 0, -1.5), swell(0.9), CLAMPED, GLARE),
    key(0.82, sink(-0.021), tip(0, 1.6), bend(3, 4.5, 0, 1.2), swell(0.895), CLAMPED, GLARE),
    key(0.94, sink(-0.021), tip(0, -1.6), bend(3, 4.5, 0, -1.2), swell(0.9), CLAMPED, GLARE),
    key(1.06, sink(-0.02), tip(0, 1.4), bend(3, 4.5, 0, 1), swell(0.895), CLAMPED, GLARE),
    key(1.2, sink(-0.02), tip(0, -1.2), bend(2.8, 4.2), swell(0.9), CLAMPED, GLARE),
    // Unclenching slowly.
    key(1.4, sink(-0.01), bend(1.5, 2), swell(0.97), GLARE),
    key(1.58, sink(-0.004), bend(0.5, 0.8), swell(0.995), OPEN),
    key(1.82, OPEN),
  ],
  events: [{ t: 0.5, name: 'aura' }],
};

/**
 * String Shot (powder): it rears back a little and swells, gathering silk,
 * then thrusts its shell forward and holds its aim rigidly on the foe while
 * the thread sprays from its opening, shuddering with the effort and
 * glaring; then it settles back heavily.
 * After Blaziken's status_target and special_strong's sustain.
 */
const stringShot: Clip = {
  name: 'status_target',
  duration: 1.8,
  keys: [
    key(0),
    // Gathering silk: reared back, swelling.
    key(0.22, sink(0.008), tip(-8), bend(-4, -7), swell(1.035), GLARE),
    key(0.34, sink(0.01), tip(-10.5, -1), bend(-5, -9), swell(1.04), GLARE),
    // The thrust: the opening (and its glare) on the foe, the thread streaming out.
    snap(0.44, lunge(0.04), tip(5), bend(2.5, 3.5), swell(0.97), SQUEEZE),
    // Holding the aim rigidly, shuddering with the effort.
    key(0.6, lunge(0.04), tip(5.5, 1.2), bend(2.5, 4, 0, 1), swell(0.975), GLARE),
    key(0.74, lunge(0.04), tip(5, -1.2), bend(2.5, 3.5, 0, -1), swell(0.97), GLARE),
    key(0.88, lunge(0.038), tip(5.5, 1), bend(2.5, 4, 0, 1), swell(0.975), GLARE),
    key(1.02, lunge(0.036), tip(5, -0.8), bend(2.5, 3.5, 0, -0.8), swell(0.972), GLARE),
    key(1.16, lunge(0.02), tip(3), bend(1.5, 2.5), GLARE),
    // Settles back heavily.
    key(1.34, sink(-0.012), tip(-2), bend(1, 2), swell(0.99), GLARE),
    key(1.54, sink(-0.004), tip(0.6), bend(0.5, 1), OPEN),
    key(1.8, OPEN),
  ],
  // The opening turns with its top, a few frames behind the shell.
  events: [{ t: 0.5, name: 'emit' }],
};

export const CASCOON_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, tackle, spit, shield, stringShot].map((c) => [c.name, c]),
);

/**
 * Eye atlas (eye_mat: 4 x 2 cells; the eyes show column 0 of row 1, a
 * slanted glaring eye): row 1 holds the open eye, the closed eye, a narrowed
 * glare and a happy closed curve; row 0 a squeezed-shut line. Offsets from
 * the open cell.
 */
export const CASCOON_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  closed: [1, 0],
  half: [2, 0],
  happy: [3, 0],
  squeeze: [0, 1],
};
