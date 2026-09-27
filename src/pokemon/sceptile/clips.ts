// Sceptile's battle animation set. Every move in its movepool and every
// situation has its own clip, built from the Treecko line's shared
// choreography on Sceptile's kit (./family.ts, ./kit.ts,
// src/pokemon/treecko/line). This file keeps the four moments every battle
// plays (idle, intro, hit, faint), written for Sceptile alone, and the eye
// atlas. Keys are STANCE + deltas (see compose()).
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is a few
// pixels above our Sceptile's crest and ours is to its right; a wild
// Sceptile's toe claws rest on the top edge of ours, so its feet never slide
// toward the camera and nothing reaches the ground in front of them.

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
/** Spine chain pitch (x) from hips to head (the neck bends over both neck bones), with head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck * 0.6 }, neck2: { x: neck * 0.4 }, head: { x: head, y: headY, z: headZ } },
});
/** The tail chain: lift (+ raises it) and sweep (+ swings it toward its right), spread along the chain. */
const tail = (lift: number, sweep = 0): Pose => ({
  bones: {
    tail: { x: lift * 0.3, y: sweep * 0.25 },
    tail2: { x: lift * 0.15, y: sweep * 0.15 },
    tail3: { x: lift * 0.15, y: sweep * 0.15 },
    tail4: { x: lift * 0.14, y: sweep * 0.15 },
    tail5: { x: lift * 0.1, y: sweep * 0.12 },
    tail6: { x: lift * 0.08, y: sweep * 0.1 },
    tail7: { x: lift * 0.08, y: sweep * 0.08 },
  },
});

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
type Arm = [arm: Vec3, forearm: Vec3, hand: Vec3];
/** Both arms: [arm, forearm, hand] directions for the right arm and the left arm. */
const arms = (r: Arm, l: Arm): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1], twist: 0 }, handR: { dir: r[2] },
    armL: { dir: l[0] }, forearmL: { dir: l[1], twist: 0 }, handL: { dir: l[2] },
  },
});
/** The same pose on both arms (given for the right arm, mirrored to the left). */
const both = (r: Arm): Pose => arms(r, [mirror(r[0]), mirror(r[1]), mirror(r[2])]);

/** Forearms crossed in front of the face, blades out to the sides (an X). */
const CROSSED = arms([[-0.35, -0.3, 0.88], [0.7, 0.45, 0.55], [0.6, 0.7, 0.4]], [[0.35, -0.3, 0.88], [-0.7, 0.5, 0.5], [-0.6, 0.75, 0.3]]);
/** Arms flung out wide and up, claws open. */
const SPREAD = both([[-0.85, 0.35, 0.3], [-0.5, 0.85, 0.2], [-0.3, 0.95, 0.1]]);
/** Flinching: the arms thrown out. */
const FLINCH = arms([[-0.75, -0.2, 0.6], [-0.35, 0.35, 0.87], [-0.2, 0.6, 0.77]], [[0.7, -0.35, 0.6], [0.35, 0.2, 0.9], [0.2, 0.3, 0.93]]);
/** Claws spread wide. */
const SPLAYED: Pose = {
  bones: {
    fingerA1R: { z: -14 }, fingerB1R: { y: 12 }, fingerC1R: { y: -12 },
    fingerA1L: { z: 14 }, fingerB1L: { y: -12 }, fingerC1L: { y: 12 },
  },
};
/** A deep crouch with the knees pushed out wide (the foot IK folds it outward and up, feet kept where they stand). */
const SQUAT: Pose = {
  aim: {
    thighR: { dir: [-0.912, -0.342, -0.228] }, shinR: { dir: [0.646, -0.76, 0.029] },
    thighL: { dir: [0.912, -0.342, -0.228] }, shinL: { dir: [-0.589, -0.606, -0.537] },
  },
};

/** Breathing in its crouch; the tail sways a little (the springs carry the frond). */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }, tail(2, 6)),
    key(2.4),
  ],
};

/** Sent out: crouched behind its crossed blades, it springs up with the arms flung wide and a cry, tail raised. */
const intro: Clip = {
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, pelvis(0, -0.06), bend(18, 6, 4, 16), CROSSED, SHUT, tail(-8)),
    key(0.18, pelvis(0, -0.08), bend(22, 8, 6, 20), CROSSED, SHUT, tail(-12)),
    snap(0.38, pelvis(0, 0.015), bend(-12, -8, -8, -24), SPREAD, SPLAYED, jaw(32), ANGRY, tail(35)),
    key(0.58, pelvis(0, 0.012), bend(-11, -8, -8, -22, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(32)),
    key(0.78, pelvis(0, 0.014), bend(-12, -8, -8, -23, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(30)),
    key(0.96, pelvis(0, 0.008), bend(-8, -5, -4, -14), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.012), bend(6, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
};

/**
 * Taking a hit: snaps back and winces (the battler adds a sprung recoil),
 * then shakes it off. Its weight stays back on its heels while it recovers,
 * so the recoil's swing back doesn't carry a wild Sceptile's toes past the
 * top of our healthbox.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0, -0.015), bend(-14, -6, -6, -18), FLINCH, HURT, tail(12)),
    key(0.2, pelvis(0, 0, -0.02), bend(-6, -2, -2, -8), HURT, tail(6)),
    key(0.36, pelvis(0, 0, -0.012), bend(4, 1, 0, 4), HURT, tail(2)),
    key(0.6, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it sinks into a squat, knees out, and curls over hugging itself, the
 * long neck bowed and the tail curling round, eyes shut; from the 'shrink'
 * the curled body shrinks away (Battler3D). It sits back over its heels as
 * it curls: bowed forward over its feet on that long neck, a wild
 * Sceptile's head, knees and claws came down onto our healthbox
 * (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-8, -4, -4, -12), DROWSY, tail(6)),
    key(0.48, pelvis(0, -0.07), root({ z: -0.04 }), SQUAT, bend(12, 5, 8, 16), CROSSED, SHUT, tail(-6, 10)),
    key(0.82, pelvis(0, -0.18), root({ z: -0.1 }), SQUAT, bend(22, 10, 16, 24), CROSSED, SHUT, tail(-12, 26)),
    key(0.96, pelvis(0, -0.19), root({ z: -0.1 }), SQUAT, bend(24, 11, 17, 26), CROSSED, SHUT, tail(-13, 28)),
    key(1.6, pelvis(0, -0.186), root({ z: -0.1 }), SQUAT, bend(23, 10, 16, 25), CROSSED, SHUT, tail(-12, 27)),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const SCEPTILE_CLIPS: Record<string, Clip> = {
  ...Object.fromEntries([idle, intro, hit, faint].map((c) => [c.name, c])),
  ...LINE_CLIPS,
};

/** Eye atlas (pm0254_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const SCEPTILE_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  focus: [1, 2],
  hurt: [0, 3],
};
