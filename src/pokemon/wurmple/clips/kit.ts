// Wurmple's clip kit: the key helpers, its reusable deltas and its travel.
// Keys are STANCE + deltas (see compose()); the structure follows
// src/pokemon/blaziken/clips.ts.
//
// Wurmple is a caterpillar with no limbs to act with. Its body is a chain:
// the front half (spine, chest, neck, head) stands reared up and does the
// acting, rearing (-) and bowing (+); the back half (tail, tail2, tail3)
// lies on the ground curled round to its right, and lifts (+) or lowers (-)
// its spiked end. Rotations of the chain are about each segment's own axes
// (poses.ts), so a delta of the same sign on every front segment bends the
// whole front half one way. `post` turns a segment about the model axes
// (a lean of the whole front half from its base).
//
// Channels used here:
//   bones / post    the chain (front half, tail) and the crest
//   pelvis          the whole body (Hips is its root joint): a dip or a lift
//   root            leaps (y), a lunge into the foe (z), spins and rolls
//   advance         0 at home, 1 in front of the foe (contact moves)
//   scale           a squash as it bunches up, a stretch as it springs
//   expression      eye atlas cell (open, half: a lidded glare or a tired
//                   droop, closed)
//
// How it travels: a caterpillar's scrunch-and-spring. It bunches up (the
// front half bowed low over its belly, the tail end tucked in under it,
// the body squashed), then springs: the front half snaps out long toward
// the foe, the tail trails out behind, and it arcs through the air
// (root.y), lands in front of the foe on its belly with a squash, and does
// the move there. Home is the same spring the other way. Every contact clip
// uses these keys, re-timed and re-shaped per move (Tackle a clean arc,
// Struggle a feeble flop).
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is ~20 px
// above our Wurmple's crest; a wild Wurmple's feet rest on the top edge of
// our box, so nothing of it reaches down or toward the camera at home.
//
// The animator adds overlapping action (the head trails the hips by 0.065 s,
// the tail end by 0.09-0.1 s: index.ts), breathing, blinks and the springs
// on the crest, the tail end and its spikes.

import type { Clip, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (drops, sags). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });
/** A clip from its keys (the name is the move's or the situation's). */
export const clip = (name: string, duration: number, keys: Keyframe[], events: Clip['events'] = [], loop = false): Clip => ({
  name, duration, keys, events, ...(loop ? { loop } : {}),
});

// Expressions (eye atlas rows) -------------------------------------------------

export const OPEN: Pose = { expression: 'open' };
/** Lidded: a glare at the foe (and, slow, a tired droop). */
export const GLARE: Pose = { expression: 'half' };
export const DROWSY: Pose = { expression: 'half' };
export const SHUT: Pose = { expression: 'closed' };

// Body parts ---------------------------------------------------------------------

/**
 * The front half, hips to head: each segment's pitch (- rears up, + bows)
 * and the head's turn (y, + toward its left) and tilt (z).
 */
export const front = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});

/** The back half: each tail segment's lift (+ raises the tail end) and curl (+ further round to the front). */
export const tail = (lift1: number, lift2: number, lift3: number, curl1 = 0, curl2 = 0, curl3 = 0): Pose => ({
  bones: { tail: { x: lift1, y: curl1 }, tail2: { x: lift2, y: curl2 }, tail3: { x: lift3, y: curl3 } },
});

/** The front half leaning from its base (model axes): z + to its right (over the tail), - to its left. */
export const lean = (z: number, y = 0): Pose => ({ post: { spine: { z, y } } });

/** The front half curling round to its right (toward its tail) segment by segment (yaws, degrees). */
export const curlRight = (spine: number, chest: number, neck: number, head: number): Pose => ({
  bones: { spine: { y: spine }, chest: { y: chest }, neck: { y: neck }, head: { y: head } },
});

/** The whole body (Hips is the root joint): x to its left, y up, z toward the foe, in heights. */
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });

/** The crest on its head: + tips it forward. */
export const crest = (x: number, z = 0): Pose => ({ bones: { crest: { x, z } } });

/** Where the body is: advance toward the foe, and a root offset (heights) and tip. */
export const at = (advance: number, y = 0, z = 0, extra: Pose['root'] = {}): Pose => ({ advance, root: { y, z, ...extra } });

// Key poses (deltas on the stance) ----------------------------------------------

/** Coiled back for a strike: the front half drawn up and back, head low on the foe, the tail end pressed down. */
export const COIL: Pose = compose({}, front(-12, -16, -6, -12), tail(0, -8, -12));
/** A headbutt at full reach: the front half bows at the foe, the crest leading like a horn; the tail end kicks up. */
export const BUTT: Pose = compose({}, front(22, 26, 12, 8), tail(0, 8, 18));
/**
 * Reared up tall, the front half upright and the head raised (a cry, a
 * gathered breath); the spiked tail end raised. The head lifts rather than
 * tipping right back, so the crest still stands tall from behind.
 */
export const REAR_UP: Pose = compose({}, front(-14, -12, 6, -10), tail(0, 10, 20));
/**
 * The tail reared up beside it like a scorpion's: the base segments lift
 * steeply and the end bends over so the two spikes stand tall above its
 * back (from our side they rise clear of the text box).
 */
export const SCORPION: Pose = tail(40, 40, -90, 0, -10, -20);
/** The stab: the tail whips over and down, the spikes jabbing forward at the foe. */
export const STAB: Pose = tail(10, 8, -110, 10, 0, -10);
/** Curled up tight on itself: the front half hunched over its belly, head tucked, the tail wrapped round its side. */
export const CURL: Pose = compose({}, front(-4, 20, 34, 34), tail(0, 12, 28, 12, 14, 12));
/** Slumped: the front half sagging forward, the head hanging, the tail end flat. */
export const SLUMP: Pose = compose({}, front(12, 16, 10, 20), tail(0, -4, -10), pelvis(0, -0.015));
/** Flinched away: the front half thrown back and up, the tail end flicked up. */
export const RECOIL: Pose = compose({}, front(-10, -14, -10, -18), tail(0, 6, 18));

// Travel: the scrunch and the spring ---------------------------------------------

/**
 * Bunched up to spring: the front half lowered and folded down over its
 * belly (the head kept up, eyes on the foe), the tail end curled in and
 * raised, the whole body squashed down onto the ground.
 */
export const SCRUNCH: Pose = compose({}, front(14, 18, 10, -10), tail(0, 8, 14, 12, 12, 10), pelvis(0, -0.035), { scale: 0.92 });
/**
 * Sprung: the front half straightened out long (reared, the head leading),
 * the tail trailing out behind; the root tips the whole body forward so it
 * flies head first (the pitch comes with `flight`).
 */
export const STRETCH: Pose = compose({}, front(-8, -10, -6, -6), tail(-4, -8, -12, -14, -14, -12), { scale: 1.06 });
/** Touching down: the front half folds a little over the landing, squashed. */
export const TOUCH: Pose = compose({}, front(12, 14, 6, 2), tail(0, 2, 4, 4, 4, 4), pelvis(0, -0.03), { scale: 0.95 });

/** A body sprung off the ground: nothing to plant (it has no feet), a root arc. */
export const AIR: Pose = { plantFeet: 0 };

/**
 * In the air on the way to the foe (advance, height, forward tip): off the
 * ground, stretched, flying head first.
 */
export const flight = (advance: number, y: number, pitch: number, z = 0): Pose =>
  compose({}, AIR, STRETCH, { advance, root: { y, z, pitch } });
/**
 * In the air on the way home: sprung backward off the foe, leaning back,
 * the front half still on the foe.
 */
export const flightHome = (advance: number, y: number, pitch = -10): Pose =>
  compose({}, AIR, front(-6, -8, 0, 6), tail(2, 4, 8, -6, -6, -4), { advance, root: { y, pitch }, scale: 1.03 });
