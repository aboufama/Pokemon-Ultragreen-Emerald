// Treecko's battle animation set. Every move in its movepool and every
// situation has its own clip, built from the line's shared choreography on
// Treecko's kit (./family.ts, ./kit.ts, ./line). This file keeps the four
// moments every battle plays (idle, intro, hit, faint), written for Treecko
// alone, and the eye atlas. Keys are STANCE + deltas (see compose()).
//
// The healthboxes are drawn over the Pokémon: from our side the foe's box is
// a few pixels above our Treecko's head and ours is to its right, so arms
// open wide rather than overhead (tools/gauntlet/uiclear.mjs).

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';
import { LINE_CLIPS } from './family';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });

const ANGRY: Pose = { expression: 'angry' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
/** Spine chain pitch (x) from hips to head, with head turn (+y: to its left) and tilt (+z: to its right). */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
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
 * arm. The hands keep the stance's twist (palms turned up and open).
 */
const arms = (r: Arm, l: Arm): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1] }, handR: { dir: r[2], twist: -70 },
    armL: { dir: l[0] }, forearmL: { dir: l[1] }, handL: { dir: l[2], twist: 70 },
  },
});
/** The same pose on both arms (given for the right arm, mirrored to the left). */
const both = (r: Arm): Pose => arms(r, [mirror(r[0]), mirror(r[1]), mirror(r[2])]);

/** Forearms crossed low in front of the belly (gathering, hugging itself). */
const CROSSED_LOW = arms([[-0.35, -0.6, 0.72], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]], [[0.35, -0.6, 0.72], [-0.75, 0.12, 0.65], [-0.7, 0.28, 0.66]]);
/** Arms flung up wide in a V, hands open (the stock sprite's second frame): wide, not overhead. */
const SPREAD = both([[-0.85, 0.42, 0.32], [-0.5, 0.82, 0.28], [-0.35, 0.9, 0.25]]);
/** Taking a hit: the arms thrown up and out, hands open. */
const FLINCH = arms([[-0.8, 0.15, 0.58], [-0.5, 0.55, 0.67], [-0.3, 0.75, 0.59]], [[0.78, 0.02, 0.62], [0.45, 0.45, 0.77], [0.25, 0.65, 0.72]]);
/** Worn out: the arms hanging low. */
const DROOP = both([[-0.6, -0.76, 0.24], [-0.32, -0.88, 0.35], [-0.22, -0.88, 0.42]]);
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

export const CLIPS: Record<string, Clip> = {
  ...Object.fromEntries([idle, intro, hit, faint].map((c) => [c.name, c])),
  ...LINE_CLIPS,
};

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
