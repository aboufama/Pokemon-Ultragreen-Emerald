// Wurmple's battle animation set: one clip per attack category (+ idle, intro,
// hit, faint). Keys are STANCE + deltas (see compose()); the structure follows
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
//   root            left alone: the clips act in place (the game moves the sprite)
//   expression      eye atlas cell (open, half: a lidded glare or a tired
//                   droop, closed)
// Events: impact (the head connects), release (the sting leaves the tail
// spikes, the stream the mouth), releaseEnd, charge, cry, aura, emit (thread
// from the mouth), shrink.
//
// Acting in place: the compiled game moves the sprite (Tackle's lunge) and
// the body follows it; these clips rear, bow and strike from the spot.
// Wurmple is small and light: timings run ~0.8x Blaziken's, strikes snap in
// 4-6 frames. The game shows 15 poses a second: every beat is held for a
// pose or more.
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is ~20 px
// above our Wurmple's crest; a wild Wurmple's feet rest on the top edge of
// our box, so nothing of it reaches down or toward the camera: its strikes
// bow the front half rather than dive, and its faint curls round on the
// ground to its right rather than forward over its feet.
//
// The animator adds overlapping action (the head trails the hips by 0.065 s,
// the tail end by 0.09-0.1 s: index.ts), breathing, blinks and the springs
// on the crest, the tail end and its spikes.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (sags, drops). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const OPEN: Pose = { expression: 'open' };
/** Lidded: a glare at the foe (and, slow, a tired droop). */
const GLARE: Pose = { expression: 'half' };
const DROWSY: Pose = { expression: 'half' };
const SHUT: Pose = { expression: 'closed' };

/**
 * The front half, hips to head: each segment's pitch (- rears up, + bows)
 * and the head's turn (y, + toward its left) and tilt (z).
 */
const front = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});

/** The back half: each tail segment's lift (+ raises the tail end) and curl (+ further round to the front). */
const tail = (lift1: number, lift2: number, lift3: number, curl1 = 0, curl2 = 0, curl3 = 0): Pose => ({
  bones: { tail: { x: lift1, y: curl1 }, tail2: { x: lift2, y: curl2 }, tail3: { x: lift3, y: curl3 } },
});

/** The front half leaning from its base (model axes): z + to its right (over the tail), - to its left. */
const lean = (z: number, y = 0): Pose => ({ post: { spine: { z, y } } });

/** The front half curling round to its right (toward its tail) segment by segment (yaws, degrees). */
const curlRight = (spine: number, chest: number, neck: number, head: number): Pose => ({
  bones: { spine: { y: spine }, chest: { y: chest }, neck: { y: neck }, head: { y: head } },
});

// Key poses (deltas on the stance) -------------------------------------------

/** Coiled back for a strike: the front half drawn up and back, head low on the foe, the tail end pressed down. */
const COIL: Pose = compose({}, front(-12, -16, -6, -12), tail(0, -8, -12));
/** A headbutt at full reach: the front half bows at the foe, the crest leading like a horn; the tail end kicks up. */
const BUTT: Pose = compose({}, front(22, 26, 12, 8), tail(0, 8, 18));
/**
 * Reared up tall, the front half upright and the head raised (a cry, a
 * gathered breath); the spiked tail end raised. The head lifts rather than
 * tipping right back, so the crest still stands tall from behind.
 */
const REAR_UP: Pose = compose({}, front(-14, -12, 6, -10), tail(0, 10, 20));
/**
 * The tail reared up beside it like a scorpion's: the base segments lift
 * steeply and the end bends over so the two spikes stand tall above its
 * back (from our side they rise clear of the text box).
 */
const SCORPION: Pose = tail(40, 40, -90, 0, -10, -20);
/** The stab: the tail whips over and down, the spikes jabbing forward at the foe. */
const STAB: Pose = tail(10, 8, -110, 10, 0, -10);

// Clips -----------------------------------------------------------------------

/**
 * Idle: an inchworm's restlessness. The front half sways slowly from side to
 * side and bobs up a little as it goes, the head levelled on the foe, while
 * the spiked tail end lifts and settles out of step (breathing, blinks and
 * gaze drift come from the life layer).
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.6, front(-3, -3, 1, 3, 0, -3), lean(-3.5), tail(0, 1, 7)),
    key(1.2, front(1.5, 1.5, 0, -1.5), tail(0, 0, 1)),
    key(1.8, front(-3, -3, 1, 3, 0, 3), lean(3.5), tail(0, -1, -4)),
    key(2.4),
  ],
};

/**
 * Sent out (and a wild one's cry): ducked low with its eyes shut, it bursts
 * up to its full height with its head raised and its tail spikes
 * raised, cries with a shake of the head and crest, then drops into its
 * stance with a glare. Upright rather than overhead-reaching: from our side
 * the crest stays under the foe's healthbox.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, front(22, 20, 15, 6), tail(0, -4, -10), SHUT),
    key(0.2, front(26, 24, 18, 9), tail(0, -6, -14), SHUT),
    snap(0.4, REAR_UP, OPEN),
    key(0.56, REAR_UP, front(-1, -1, 0, -2, 8, 7), OPEN),
    key(0.72, REAR_UP, front(0, 0, 0, -1, -8, -7), OPEN),
    key(0.88, REAR_UP, front(4, 4, 3, 10, 3, 2), OPEN),
    key(1.08, front(4, 4, 2, 4), tail(0, 2, 4), GLARE),
    key(1.6, OPEN),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Tackle: a headbutt from where it stands. It draws its front half up and
 * back (the tail end pressing down to load), then whips it forward and down
 * at the foe with the crest leading like a horn; it carries on a touch past
 * the hit, springs back up and settles. The game's lunge carries the body.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.95,
  keys: [
    key(0),
    key(0.1, COIL, GLARE),
    snap(0.18, BUTT, GLARE),
    key(0.3, BUTT, front(2, 2, 2, 3), GLARE),
    key(0.5, front(-2, -3, -2, -3), tail(0, 2, 5), GLARE),
    key(0.7, front(2, 2, 1, 2), GLARE),
    key(0.95, OPEN),
  ],
  // The head trails the hips (overlap): it lands just after the key.
  events: [{ t: 0.23, name: 'impact' }],
};

/**
 * Strong contact (Take Down, Skull Bash): it rears up to its full height and
 * back, tail spikes raised, holds the coil, then slams its whole front half
 * down at the foe crest first; it rebounds up off the hit and settles.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.5,
  keys: [
    key(0),
    key(0.3, front(-16, -14, -10, -12), tail(0, 10, 25), GLARE),
    key(0.42, front(-18, -16, -11, -14, 0, 2), tail(0, 12, 28), GLARE),
    snap(0.52, front(26, 30, 14, 8), tail(0, 2, 6), GLARE),
    key(0.66, front(28, 32, 15, 10), tail(0, 0, 2), GLARE),
    key(0.9, front(-4, -5, -3, -4), tail(0, 4, 8), GLARE),
    key(1.1, front(3, 3, 2, 3), GLARE),
    key(1.5, OPEN),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/**
 * Poison Sting: the venom is in the two spikes on its tail end. The tail
 * rears up beside it like a scorpion's, spikes standing tall, while the
 * front half leans away and glares; then it whips over and down so the
 * spikes jab at the foe (the sting flies from them: release after the tail
 * end's overlap), the front half leaning into it. The tail follows through
 * and curls back down into place.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.05,
  keys: [
    key(0),
    key(0.1, SCORPION, lean(-5), front(-4, -4, 0, -2), GLARE),
    key(0.2, SCORPION, tail(3, 3, -3), lean(-5.5), front(-4, -4, 0, -3), GLARE),
    snap(0.27, STAB, lean(4), front(4, 4, 1, 4), GLARE),
    key(0.42, STAB, tail(-2, -2, -5), lean(4.5), front(4, 4, 1, 4), GLARE),
    key(0.58, tail(4, 4, -60, 4, 0, -5), lean(2), front(2, 2, 0, 2), GLARE),
    key(0.78, tail(1, 1, -12), lean(0.5), GLARE),
    key(1.05, OPEN),
  ],
  events: [{ t: 0.35, name: 'release' }],
};

/**
 * Strong ranged move (a thick stream of silk): it rears back with its head
 * up and eyes shut, gathering, then drives its head forward and down at the
 * foe with its body braced and the tail end pressed down, and holds the
 * stream from its mouth, the head weaving a little; then it shakes it off.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.1,
  keys: [
    key(0),
    key(0.14, front(3, 3, 2, 4)),
    key(0.5, REAR_UP, front(0, 0, 6, 10), SHUT),
    key(0.64, REAR_UP, front(-1, -1, 5, 8, 0, 2), SHUT),
    snap(0.76, front(14, 16, 6, -2), tail(0, -4, -10), GLARE),
    key(0.98, front(13, 15, 6, -1, 5, 2), tail(0, -4, -10), GLARE),
    key(1.2, front(14, 16, 6, -2, -5, -2), tail(0, -5, -11), GLARE),
    key(1.42, front(13, 15, 6, -1, 4, 1), tail(0, -4, -10), GLARE),
    key(1.62, front(14, 16, 6, -2), tail(0, -4, -9), GLARE),
    key(1.8, front(2, 2, 0, 2, 7), tail(0, 0, 2), GLARE),
    key(1.94, front(1, 1, 0, 1, -5), GLARE),
    key(2.1, OPEN),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.82, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Self-targeting status move (Harden, Defense Curl): it curls up tight, the
 * front half hunched forward over its belly with the head tucked, the tail
 * curled up round its side, eyes shut; it shivers there, drawing the curl
 * tighter, as the aura rises, then unrolls and rears back up.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.5,
  keys: [
    key(0),
    key(0.25, front(-4, 18, 30, 30), tail(0, 10, 25, 10, 12, 10), SHUT),
    key(0.38, front(-5, 20, 34, 34), tail(0, 12, 28, 12, 14, 12), SHUT),
    key(0.5, front(-5, 23, 37, 35, 2, 1.5), tail(0, 12, 29, 13, 15, 13), SHUT),
    key(0.62, front(-6, 19, 33, 34, -2, -1.5), tail(0, 13, 30, 14, 16, 14), SHUT),
    key(0.74, front(-5, 24, 38, 36, 2, 1.5), tail(0, 13, 31, 15, 17, 15), SHUT),
    key(0.86, front(-6, 20, 34, 35, -2, -1), tail(0, 14, 31, 16, 18, 16), SHUT),
    key(1.1, front(-4, -4, -3, -6), tail(0, 2, 6), GLARE),
    key(1.5, OPEN),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/**
 * String Shot: it rears back with its head up, drawing in, then thrusts its
 * head forward and down so its mouth points at the foe and sprays thread
 * (emit), weaving its head from side to side to spin the thread over the
 * foe for as long as the game's threads fly (about a second); then it
 * pulls its head back and settles.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.8,
  keys: [
    key(0),
    key(0.22, front(-12, -10, -6, -16), tail(0, 6, 12), GLARE),
    snap(0.32, front(12, 12, 6, 6), tail(0, -2, -4), GLARE),
    key(0.5, front(11, 11, 6, 5, 7, 3), tail(0, -2, -4), GLARE),
    key(0.68, front(12, 12, 6, 7, -7, -3), tail(0, -2, -3), GLARE),
    key(0.86, front(11, 11, 6, 5, 6, 2), tail(0, -2, -4), GLARE),
    key(1.04, front(12, 12, 6, 7, -6, -2), tail(0, -2, -3), GLARE),
    key(1.22, front(11, 11, 6, 5, 4, 1), tail(0, -2, -4), GLARE),
    key(1.38, front(12, 12, 6, 6, -2), tail(0, -2, -3), GLARE),
    key(1.56, front(-3, -3, -2, -4), tail(0, 1, 2), GLARE),
    key(1.8, OPEN),
  ],
  // The head trails the hips: the thread leaves the mouth just after the thrust.
  events: [{ t: 0.38, name: 'emit' }],
};

/**
 * Taking a hit: the front half snaps back and up with its eyes squeezed shut
 * and the tail end flicking up (the battler adds a sprung knock-back), then
 * it bobs forward past the stance and settles.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, front(-10, -14, -10, -18), tail(0, 6, 18), SHUT),
    key(0.2, front(-4, -5, -4, -8), tail(0, 3, 8), SHUT),
    key(0.36, front(3, 3, 2, 5), tail(0, -1, -2), GLARE),
    key(0.62, OPEN),
  ],
};

/**
 * Fainting, worn out rather than dying: its head droops and its eyes fall
 * shut as it sways (in the compiled game this is what shows: the game
 * takes the sprite away 10-16 frames into a faint), the front half sags,
 * then it comes down to the ground and curls round to its right to meet
 * its tail, the head turned back into the curl so the crest lies along it,
 * and from the 'shrink' the curled body shrinks away into its middle. It
 * curls round on the ground rather than forward over its feet: a wild
 * Wurmple's feet rest on our healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, front(6, 6, 4, 14, 0, 5), lean(-4), tail(0, -2, -5), DROWSY),
    key(0.3, front(10, 10, 6, 18, 0, -4), lean(3), tail(0, -3, -8), SHUT),
    key(0.5, front(14, 18, 8, 16, 0, -2), lean(1), tail(0, -4, -10), SHUT),
    fall(0.84, front(19, 47, -10, 23), curlRight(-26, -40, -40, -44), tail(0, -8, -16, 11, 11, 11), SHUT),
    key(0.98, front(20, 48, -10, 25), curlRight(-30, -45, -45, -50), tail(0, -8, -17, 12, 12, 12), SHUT),
    key(1.6, front(20, 48, -10, 24), curlRight(-29, -44, -44, -49), tail(0, -8, -17, 12, 12, 12), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget, hit, faint].map((c) => [c.name, c]),
);

/** Eye atlas (4 x 4 cells of 64 px): row 0 open, row 1 lidded, row 2 shut. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  half: [0, 1],
  closed: [0, 2],
};
