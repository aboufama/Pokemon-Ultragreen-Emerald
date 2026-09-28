// Zigzagoon's status moves, in the style of the first clips (./set.ts has
// the helpers and the notes on how it moves): a gather or a rear-up, the
// action with a moving hold, a relax. Its big zigzag tail does a lot of
// the talking: it wags it at the foe (Tail Whip), rakes dirt back at it
// with its hind legs (Sand-Attack), curls up behind it (Protect) and wraps
// it round itself to sleep (Rest).
//
// Staying clear of the healthboxes (tools/gauntlet/uiclear.mjs): as the foe
// its paws stand on the top edge of our healthbox, so its head stays above
// its paws (a nose to the ground in front of them goes under our box); ours
// has the foe's box well above it and its own a little to its right, so its
// side-steps stay short.

import type { Clip } from '../../anim/clip';
import type { Pose, Vec3 } from '../../anim/rig';
import {
  ANGRY, DROWSY, FIERCE, GATHER, HAPPY, LAND, LAND_HOME, LOOK_BACK, OPEN_EYES, PAWS_DOWN, SHUT,
  bend, ears, fall, jaw, key, legs, mirror, pelvis, root, rump, snap, tail, turn, veer,
} from './set';
import { PAWS_UP, bristle } from './set_ranged';

/** Turning to look back over its shoulder (halfway to LOOK_BACK: its body turning away from the foe in a hop). */
const HALF_LOOK: Pose = { bones: { neck: { y: 12 }, head: { y: 14 } } };

/**
 * Growl (and Snore): after Blaziken's status_target. It draws itself up,
 * then juts its head out at the foe with its jaws wide, ears flat, fur and
 * tail bristling, and growls, the head shaking; then the mouth shuts and it
 * settles.
 */
const roar: Clip = {
  name: 'roar',
  duration: 1.45,
  keys: [
    key(0),
    // Draws itself up, chest out, head back, ears up.
    key(0.2, pelvis(0, 0.01, -0.02), bend(-8, -4, -6, -14), rump(-4), tail(16), ears(10), ANGRY),
    // The growl: the head juts out at the foe, jaws wide, ears flat, fur and tail bristling.
    snap(0.3, pelvis(0, -0.03, 0.03), bend(4, 2, -4, -8), jaw(32), rump(10), tail(34, 0, 12), ears(-36), bristle(1.04), ANGRY),
    key(0.5, pelvis(0, -0.032, 0.03), bend(4, 2, -4, -8, 8, 4), jaw(34), rump(10, 4), tail(36, 6, 12), ears(-36), bristle(1.045), ANGRY),
    key(0.7, pelvis(0, -0.03, 0.028), bend(4, 2, -4, -8, -8, -4), jaw(32), rump(10, -4), tail(35, -6, 12), ears(-36), bristle(1.04), ANGRY),
    key(0.88, pelvis(0, -0.015, 0.012), bend(2, 1, -2, -4), jaw(8), rump(4), tail(18, 0, 6), ears(-16), bristle(1.01), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Tail Whip (Charm, Tickle, Attract, Swagger): after the first clips' charm,
 * a cheeky one. A happy little bounce, then a hop round that turns its back
 * to the foe; rump up and looking back over its shoulder with happy eyes,
 * it wags its big zigzag tail at the foe, side to side; then it hops back
 * round to face it.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.9,
  keys: [
    key(0),
    // A happy little bounce on its forepaws.
    key(0.14, pelvis(0, -0.03), bend(4, 0, 0, -8, 0, 8), rump(8, 6), tail(14, 8), ears(10), HAPPY),
    key(0.3, pelvis(0, -0.045, -0.01), bend(6, 0, 0, -6, 0, -6), rump(10, -6), tail(16, -8), ears(8), HAPPY),
    // The hop round: turning its back to the foe.
    key(0.42, root({ y: 0.14, yaw: 90 }), ...GATHER, HALF_LOOK, tail(20), ears(6), HAPPY),
    key(0.54, root({ yaw: 180 }), LAND_HOME, rump(14), LOOK_BACK, tail(34, 0, 10), ears(10), HAPPY),
    // The wag: the rump and the tail swinging side to side at the foe.
    key(0.66, root({ yaw: 180 }), rump(16, 16), LOOK_BACK, tail(36, 30, 10, 14), ears(10), HAPPY),
    key(0.8, root({ yaw: 180 }), rump(16, -16), LOOK_BACK, tail(36, -30, 10, -14), ears(10), HAPPY),
    key(0.94, root({ yaw: 180 }), rump(16, 16), LOOK_BACK, tail(36, 30, 10, 14), ears(10), HAPPY),
    key(1.08, root({ yaw: 180 }), rump(16, -14), LOOK_BACK, tail(36, -28, 10, -12), ears(10), HAPPY),
    key(1.2, root({ yaw: 180 }), rump(12), LOOK_BACK, tail(30, 0, 8), ears(8), HAPPY),
    // It hops back round to face the foe.
    key(1.34, root({ y: 0.14, yaw: 270 }), ...GATHER, tail(16), ears(4), HAPPY),
    key(1.48, root({ yaw: 360 }), LAND_HOME, tail(10), HAPPY),
    key(1.9, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'emit' }],
};

/** A hind leg kicked out behind, raking the dirt back (`side` +1: the left), the other planted. */
const rake = (side: number): Pose => (side > 0
  ? { plantLeft: 0, plantRight: 1, bones: { thighL: { x: 62 }, shinL: { x: -22 } } }
  : { plantLeft: 1, plantRight: 0, bones: { thighR: { x: 62 }, shinR: { x: -22 } } });

/**
 * Sand-Attack, Mud Sport: its hind legs rake dirt back at the foe, like a
 * dog. A glance at the ground, a hop round that turns its back to the foe,
 * and, looking back over its shoulder, it kicks the dirt back at it with
 * one hind leg and the other, and once more; then it hops back round.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.8,
  keys: [
    key(0),
    // A glance down at the ground, weight settling.
    key(0.16, pelvis(0, -0.03), bend(6, 0, 4, 10), tail(8), ears(-10), FIERCE),
    key(0.3, pelvis(0, -0.045, -0.01), bend(4, 0, 2, 4), rump(6), tail(12), ears(-16), FIERCE),
    // The hop round: its back to the foe.
    key(0.42, root({ y: 0.13, yaw: 90 }), ...GATHER, bend(2, 1, 2, 4), HALF_LOOK, tail(16), ears(-16), FIERCE),
    key(0.54, root({ yaw: 180 }), LAND, bend(10, 2, 4, 6), rump(-6), LOOK_BACK, tail(24, 0, 8), ears(-18), FIERCE),
    // It rakes the dirt back at the foe with its hind legs, one and the other.
    snap(0.62, root({ yaw: 180 }), rake(1), PAWS_DOWN, pelvis(0, -0.03, 0.02), bend(14, 2, 4, 6), rump(4), LOOK_BACK, tail(30, 10, 8), ears(-20), FIERCE),
    key(0.7, root({ yaw: 180 }), { plantFeet: 1 }, PAWS_DOWN, pelvis(0, -0.035), bend(12, 2, 4, 6), rump(-2), LOOK_BACK, tail(28, 0, 8), ears(-20), FIERCE),
    snap(0.78, root({ yaw: 180 }), rake(-1), PAWS_DOWN, pelvis(0, -0.03, 0.02), bend(14, 2, 4, 6), rump(4), LOOK_BACK, tail(30, -10, 8), ears(-20), FIERCE),
    key(0.86, root({ yaw: 180 }), { plantFeet: 1 }, PAWS_DOWN, pelvis(0, -0.035), bend(12, 2, 4, 6), rump(-2), LOOK_BACK, tail(28, 0, 8), ears(-20), FIERCE),
    snap(0.94, root({ yaw: 180 }), rake(1), PAWS_DOWN, pelvis(0, -0.03, 0.02), bend(14, 2, 4, 6), rump(4), LOOK_BACK, tail(30, 10, 8), ears(-20), FIERCE),
    key(1.06, root({ yaw: 180 }), { plantFeet: 1 }, PAWS_DOWN, pelvis(0, -0.03), bend(8, 2, 2, 4), rump(-2), LOOK_BACK, tail(24, 0, 8), ears(-16), ANGRY),
    // It hops back round to face the foe.
    key(1.2, root({ y: 0.13, yaw: 270 }), ...GATHER, tail(14), ears(-12), ANGRY),
    key(1.34, root({ yaw: 360 }), LAND_HOME, tail(8), ears(-8), ANGRY),
    key(1.8, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.63, name: 'emit' }, { t: 0.79, name: 'emit' }, { t: 0.95, name: 'emit' }],
};

/** Sitting up on its haunches like a meerkat, the front half upright over its hind legs. */
const SIT_UP: Pose[] = [{ plantFeet: 1 }, pelvis(0, -0.03, -0.05), bend(-55, -10, 15, 25), rump(-25)];
/** Drumming its belly: one forepaw beating it, the other drawn back to strike next (`side` +1: the left beats). */
const drum = (side: number): Pose => {
  const beat: [Vec3, Vec3] = [[0.12, -0.45, 0.88], [-0.45, -0.55, 0.7]];
  const back: [Vec3, Vec3] = [[0.55, 0.15, 0.82], [0.2, 0.7, 0.68]];
  const [l, r] = side > 0 ? [beat, back] : [back, beat];
  return legs(l[0], l[1], mirror(r[0]), mirror(r[1]));
};
/** Forepaws flung out wide (a roar, sitting up). */
const PAWS_WIDE = legs([0.75, -0.3, 0.59], [0.55, 0.25, 0.8]);

/**
 * Belly Drum (and Sleep Talk): it sits up on its haunches and drums its
 * belly with its forepaws, one and the other, each beat bouncing it, harder
 * and harder; then it throws its head back and roars with its forepaws
 * flung wide, the aura flaring, and drops back onto all fours.
 */
const buff: Clip = {
  name: 'buff',
  duration: 2.05,
  keys: [
    key(0),
    // Sits up on its haunches, forepaws up.
    key(0.22, ...SIT_UP, PAWS_UP, tail(10), ears(4), FIERCE),
    // The drum: forepaw after forepaw on its belly, each beat bouncing it.
    key(0.32, ...SIT_UP, drum(1), turn(6), pelvis(0, -0.012), tail(12), ears(-6), FIERCE),
    key(0.42, ...SIT_UP, drum(-1), turn(-6), pelvis(0, -0.004), tail(13), ears(-8), FIERCE),
    key(0.51, ...SIT_UP, drum(1), turn(7), pelvis(0, -0.014), tail(14), ears(-10), FIERCE),
    key(0.6, ...SIT_UP, drum(-1), turn(-7), pelvis(0, -0.004), tail(16), ears(-12), FIERCE),
    key(0.68, ...SIT_UP, drum(1), turn(8), pelvis(0, -0.016), tail(18), ears(-14), FIERCE),
    key(0.76, ...SIT_UP, drum(-1), turn(-8), pelvis(0, -0.004), tail(20), ears(-16), FIERCE),
    // Then it throws its head back and roars, forepaws flung wide, the aura flaring.
    snap(0.9, ...SIT_UP, PAWS_WIDE, bend(-4, -2, -8, -22), jaw(32), tail(32, 0, 12), ears(-20), bristle(1.04), ANGRY),
    key(1.06, ...SIT_UP, PAWS_WIDE, bend(-5, -2, -8, -24, 0, 4), jaw(34), tail(34, 0, 12), ears(-22), bristle(1.045), ANGRY),
    key(1.22, ...SIT_UP, PAWS_WIDE, bend(-4, -2, -8, -23, 0, -4), jaw(30), tail(33, 0, 12), ears(-22), bristle(1.04), ANGRY),
    // Drops back onto all fours.
    fall(1.46, LAND, pelvis(0, -0.02), bend(4, 0, 0, -4), jaw(6), tail(20, 0, 6), ears(-14), bristle(1.02), ANGRY),
    key(1.64, pelvis(0, -0.012), bend(2, 0, 0, -2), tail(12), ears(-8), ANGRY),
    key(2.05, OPEN_EYES),
  ],
  events: [{ t: 0.94, name: 'aura' }],
};

/**
 * Protect (Defense Curl, Endure, Substitute): after the first clips'
 * guards. A flinch back, then it snaps into a tight crouch behind its big
 * tail: head tucked into its chest, the tail swung up and over its back
 * like a shield, eyes squeezed shut; it holds there trembling while the
 * barrier forms, then peeks out and uncurls.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.6,
  keys: [
    key(0),
    // A flinch back.
    key(0.14, pelvis(0, 0.008, -0.025), bend(-6, -2, -2, -8), rump(-4), tail(10), ears(-10), OPEN_EYES),
    // It curls up tight behind its tail.
    snap(0.3, pelvis(0, -0.07, -0.02), bend(12, 6, 10, 22), rump(-10), tail(56, 0, 28), ears(-40), SHUT),
    // Holding there, trembling (a moving hold).
    key(0.46, pelvis(0, -0.074, -0.02), bend(13, 6, 10, 23, 0, 1.5), rump(-11), tail(58, 2, 28), ears(-40), SHUT),
    key(0.66, pelvis(0, -0.072, -0.02), bend(12, 6, 10, 22, 0, -1.5), rump(-10), tail(57, -2, 28), ears(-40), SHUT),
    key(0.86, pelvis(0, -0.076, -0.02), bend(13, 6, 10, 23, 0, 1), rump(-11), tail(58, 1, 28), ears(-40), SHUT),
    // It peeks out, then uncurls.
    key(1.04, pelvis(0, -0.05, -0.01), bend(8, 3, 4, 6), rump(-6), tail(40, 0, 18), ears(-20), OPEN_EYES),
    key(1.24, pelvis(0, -0.02), bend(2, 1, 0, 0), rump(-2), tail(16, 0, 6), ears(-6), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'aura' }],
};

/**
 * Rest: a big yawn, then it settles down onto its folded legs with its
 * chin on its forepaws and its tail wrapped round it, eyes shut, and
 * breathes slowly while it recovers; it gets up again still drowsy.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.1,
  keys: [
    key(0),
    // A big yawn.
    key(0.24, pelvis(0, 0.006, -0.01), bend(-6, -2, -6, -16), jaw(30), ears(-10), DROWSY),
    // It settles down, the legs folding.
    key(0.5, pelvis(0, -0.07, -0.02), bend(2, 0, 2, 6), jaw(4), rump(-6), tail(-8, -14), ears(-16), DROWSY),
    // Lying down, chin on its forepaws, the tail wrapped round, eyes shut.
    key(0.8, pelvis(0, -0.12, -0.03), bend(4, 2, 4, 10), rump(-10, -6), tail(-16, -36, -6, -12), ears(-24), SHUT),
    // Slow breaths.
    key(1.12, pelvis(0, -0.114, -0.03), bend(2, 1, 3, 8), rump(-9, -6), tail(-15, -35, -6, -12), ears(-22), SHUT),
    key(1.44, pelvis(0, -0.122, -0.03), bend(4, 2, 4, 10, 0, 2), rump(-10, -6), tail(-16, -37, -6, -12), ears(-24), SHUT),
    // It gets up again, still drowsy.
    key(1.72, pelvis(0, -0.03), bend(1, 0, 0, 0), rump(-2), tail(0, -8), ears(-8), DROWSY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'aura' }],
};

/**
 * Odor Sleuth (Mimic, Trick): nose low, it sniffs the air along a zigzag,
 * to one side and the other and in toward the foe; then its head snaps up
 * and it fixes the foe with a hard stare (the glint), leaning in.
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.6,
  keys: [
    key(0),
    // Nose low, sniffing along a zigzag: to its left...
    key(0.18, pelvis(0, -0.03, 0.01), bend(8, 2, 6, 12, 14, 4), rump(4, -8), tail(8, -10), ears(6), OPEN_EYES),
    // ...to its right...
    key(0.36, pelvis(0, -0.035, 0.02), bend(8, 2, 6, 12, -14, -4), rump(4, 8), tail(8, 10), ears(6), OPEN_EYES),
    // ...and in toward the foe, nose working.
    key(0.52, pelvis(0, -0.04, 0.03), bend(9, 2, 6, 13, 4, 0), rump(5), tail(10), ears(8), OPEN_EYES),
    // Found it: the head snaps up at the foe with a hard stare.
    snap(0.64, pelvis(0, -0.02, 0.035), bend(-2, -2, -6, -10), rump(4), tail(22, 0, 8), ears(14), FIERCE),
    key(0.84, pelvis(0, -0.024, 0.038), bend(-2, -2, -6, -11, 0, 2), rump(4), tail(24, 0, 8), ears(14), FIERCE),
    key(1.04, pelvis(0, -0.022, 0.036), bend(-2, -2, -6, -10, 0, -2), rump(4), tail(23, 0, 8), ears(12), FIERCE),
    key(1.24, pelvis(0, -0.01, 0.014), bend(0, 0, -2, -4), tail(12), ears(4), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'emit' }],
};

/**
 * Sunny Day, Rain Dance: it gathers itself with its eyes shut, then lifts
 * its face to the sky and calls the weather with a long yip, its tail
 * raised high, and sways there with its face up; then it comes back down.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.85,
  keys: [
    key(0),
    // Gathers itself, eyes shut.
    key(0.24, pelvis(0, -0.035, -0.01), bend(6, 2, 4, 10), rump(6), tail(12), ears(-10), SHUT),
    // It lifts its face to the sky and calls: a long yip, the tail raised high.
    snap(0.48, pelvis(0, 0.012, -0.02), bend(-14, -4, -10, -30), rump(-6), tail(34, 0, 12), jaw(24), ears(12), HAPPY),
    // Swaying with its face to the sky.
    key(0.7, pelvis(0.004, 0.014, -0.02), bend(-15, -4, -10, -32, 0, 5), rump(-6, 4), tail(36, 8, 12), jaw(16), ears(12), HAPPY),
    key(0.94, pelvis(-0.004, 0.014, -0.02), bend(-15, -4, -10, -32, 0, -5), rump(-6, -4), tail(36, -8, 12), jaw(8), ears(12), HAPPY),
    key(1.16, pelvis(0, 0.012, -0.018), bend(-14, -4, -10, -30, 0, 2), rump(-5), tail(34, 0, 12), jaw(4), ears(10), HAPPY),
    // Back down.
    key(1.42, pelvis(0, -0.012), bend(2, 0, 0, 0), rump(1), tail(12), ears(2), OPEN_EYES),
    key(1.85, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

/**
 * Double Team: its own zigzag, on the spot and faster than the eye: quick
 * darting hops one way and the other, the body angled into each, the tail
 * swinging out behind; the afterimages swing out from the aura.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.75,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05, -0.01), bend(6, 2, 0, -6), rump(8), tail(14), ears(-24), FIERCE),
    key(0.2, root({ x: 0.1, y: 0.06 }), ...GATHER, veer(1, 12), ears(-26), FIERCE),
    key(0.3, root({ x: 0.2 }), LAND, veer(1, 6), ears(-24), FIERCE),
    key(0.41, root({ x: 0, y: 0.07 }), ...GATHER, veer(-1, 12), ears(-26), FIERCE),
    key(0.52, root({ x: -0.2 }), LAND, veer(-1, 6), ears(-24), FIERCE),
    key(0.63, root({ x: 0, y: 0.07 }), ...GATHER, veer(1, 12), ears(-26), FIERCE),
    key(0.74, root({ x: 0.18 }), LAND, veer(1, 6), ears(-24), FIERCE),
    key(0.85, root({ x: 0, y: 0.06 }), ...GATHER, veer(-1, 12), ears(-26), FIERCE),
    key(0.96, root({ x: -0.16 }), LAND, veer(-1, 6), ears(-24), FIERCE),
    key(1.08, root({ x: -0.06, y: 0.05 }), ...GATHER, veer(1, 8), ears(-22), FIERCE),
    key(1.2, LAND, ears(-16), ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/** The status clips, by the motif they show. */
export const STATUS_CLIPS: Record<string, Clip> = Object.fromEntries(
  [roar, charm, kickSand, buff, shield, heal, glare, weather, afterimage].map((c) => [c.name, c]),
);
