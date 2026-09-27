// Zigzagoon's status moves: at the foe (growls, its tail, sand and mud, its
// nose, its charms and tricks) and on itself (its belly drum, curling up,
// guarding, the weather, sleeping). Each is that move's own gesture.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  AIR, ANGRY, ASLEEP, CURL, DROWSY, FIERCE, FRONT_DOWN, HAPPY, HIND_TUCK, HURT, LANDED, OPEN_EYES, PAWS_DIG, PAWS_FACE, PAWS_FLING,
  PAWS_HIGH, PAWS_HUG, PAWS_UP, PAWS_WIDE, SHUT,
  at, bend, body, drum, ears, fall, frontLegs, jaw, key, pelvis, rump, scale, snap, tail, turn, zigzagHome, zigzagIn,
} from './kit';

// At the foe ------------------------------------------------------------------------------

/**
 * Growl: it draws itself up, then juts its head out at the foe with its jaws
 * open (the face level, so the foe sees the little snarl), ears flat, rump
 * and tail up, and growls with a shaking head.
 */
const growl: Clip = {
  name: 'growl',
  duration: 1.35,
  keys: [
    key(0),
    key(0.12, pelvis(0.008, -0.02), bend(-6, -8, -10), rump(3), tail(8), ears(8), ANGRY),
    key(0.2, pelvis(0.01, -0.024), bend(-7, -9, -12), rump(3), tail(9), ears(9), ANGRY),
    snap(0.28, pelvis(-0.03, 0.03), bend(2, 8, -8), rump(8), tail(16, 0, 6), ears(-30), jaw(28), FIERCE),
    key(0.46, pelvis(-0.032, 0.032), bend(2, 8, -7, 6, 3), rump(8, 3), tail(17, 3, 6), ears(-30), jaw(20), FIERCE),
    key(0.62, pelvis(-0.03, 0.03), bend(2, 8, -8, -5, -3), rump(8, -3), tail(16, -3, 6), ears(-32), jaw(30), FIERCE),
    key(0.78, pelvis(-0.032, 0.032), bend(2, 8, -7, 4, 2), rump(8, 2), tail(17, 2, 6), ears(-30), jaw(22), FIERCE),
    key(0.94, pelvis(-0.02, 0.015), bend(1, 3, -3), rump(4), tail(8), ears(-14), jaw(8), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'emit' }],
};

/**
 * Tail Whip: rump up and head held high with a cheeky look, square on the
 * foe, it wags its big bushy tail from side to side at it (the hearts leave
 * the tail), then settles, pleased with itself.
 */
const tailWhip: Clip = {
  name: 'tail_whip',
  duration: 1.45,
  keys: [
    key(0),
    key(0.12, pelvis(-0.005, -0.02), bend(-6, -6, -10), rump(12), tail(10, 0, 4), ears(10), HAPPY),
    key(0.2, pelvis(-0.006, -0.02), bend(-6, -6, -10, -2), rump(13, 6), tail(11, 8, 5, 4), ears(10), HAPPY),
    key(0.33, pelvis(-0.008, -0.02, 0.01), bend(-6, -6, -10, -6), rump(14, 30), tail(12, 40, 6, 20), ears(10), HAPPY),
    key(0.6, pelvis(-0.008, -0.02, -0.01), bend(-6, -6, -10, 6), rump(14, -24), tail(12, -40, 6, -20), ears(12), HAPPY),
    key(0.87, pelvis(-0.008, -0.02, 0.01), bend(-6, -6, -10, -6), rump(14, 30), tail(12, 40, 6, 20), ears(10), HAPPY),
    key(1.12, pelvis(-0.008, -0.02, -0.01), bend(-6, -6, -10, 6), rump(14, -24), tail(12, -40, 6, -20), ears(12), HAPPY),
    key(1.27, pelvis(-0.004), bend(-1, -2, -3), rump(4, 4), tail(4, 8, 0, 4), ears(4), OPEN_EYES),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Sand-Attack: weight back as both forepaws dig into the ground under its
 * chest, then they scoop forward and up, flinging the sand at the foe's
 * face, and hang there a moment before coming down.
 */
const sandAttack: Clip = {
  name: 'sand_attack',
  duration: 1.1,
  keys: [
    key(0, FRONT_DOWN),
    key(0.1, pelvis(-0.02, -0.03), bend(-2, 4, 10), rump(-1), tail(4), ears(-8), ANGRY, PAWS_DIG),
    key(0.17, pelvis(-0.03, -0.05), bend(-4, 6, 14), rump(-2), tail(6), ears(-10), ANGRY, PAWS_DIG),
    snap(0.24, pelvis(-0.02, 0.02), bend(-12, -4, -6), rump(2), tail(10), ears(-16), FIERCE, PAWS_FLING),
    key(0.35, pelvis(-0.021, 0.018), bend(-13, -5, -7), rump(2), tail(11), ears(-16), FIERCE, PAWS_FLING),
    key(0.52, pelvis(-0.024, 0.01), bend(-9, -3, -3), rump(1), tail(9), ears(-12), FIERCE, PAWS_UP),
    key(0.72, pelvis(-0.015), bend(0, 2, 4), tail(4), ears(-6), ANGRY, FRONT_DOWN),
    key(1.1, FRONT_DOWN, OPEN_EYES),
  ],
  // The paws trail the arms by their overlap: the sand leaves them just after the key.
  events: [{ t: 0.28, name: 'emit' }],
};

/**
 * Odor Sleuth: nose low and weight back, it sniffs along a zigzag (the rump
 * and tail swinging the other way), pokes its nose at the foe twice, then
 * its head comes up with the scent and a hard, knowing stare.
 */
const odorSleuth: Clip = {
  name: 'odor_sleuth',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(-0.02, -0.06), bend(3, 8, 14, 12), turn(8), rump(3, -8), tail(-4, -6), ears(6), DROWSY),
    key(0.21, pelvis(-0.022, -0.06), bend(3, 8, 17, 11), turn(8), rump(3, -8), tail(-4, -6), ears(6), DROWSY),
    key(0.29, pelvis(-0.02, -0.06), bend(3, 8, 13, -10), turn(-8), rump(3, 8), tail(-4, 6), ears(6), DROWSY),
    key(0.36, pelvis(-0.022, -0.06), bend(3, 8, 16, -11), turn(-8), rump(3, 8), tail(-4, 6), ears(6), DROWSY),
    snap(0.43, pelvis(-0.02, 0.03), bend(4, 8, 6), ears(10), ANGRY),
    key(0.48, pelvis(-0.022, 0.01), bend(4, 8, 9), ears(10), ANGRY),
    snap(0.53, pelvis(-0.02, 0.035), bend(4, 8, 5), ears(12), ANGRY),
    key(0.7, pelvis(-0.03, 0.02), bend(2, -2, -8), rump(4), tail(8), ears(14), FIERCE),
    key(0.9, pelvis(-0.032, 0.022), bend(2, -2, -9, 2), rump(4), tail(9), ears(14), FIERCE),
    key(1.1, pelvis(-0.03, 0.02), bend(2, -2, -8, -1), rump(4), tail(8), ears(13), FIERCE),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.72, name: 'emit' }],
};

/** Scooping mud up over itself: both forepaws flung up and back over its shoulders. */
const PAWS_OVER = frontLegs([0.35, 0.3, 0.89], [0.2, 0.8, -0.56]);

/**
 * Mud Sport: it digs both forepaws into the mud and flings it up over its
 * own back, then wriggles and rolls its shoulders in it, coating its fur,
 * mud spattering all around.
 */
const mudSport: Clip = {
  name: 'mud_sport',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, pelvis(-0.035, -0.02), bend(8, 6, 12), rump(6), tail(6), ears(-10), HAPPY, PAWS_DIG),
    key(0.22, pelvis(-0.04, -0.03), bend(10, 7, 14), rump(7), tail(7), ears(-12), HAPPY, PAWS_DIG),
    snap(0.32, pelvis(0.005, -0.04), bend(-20, -6, -12), rump(-8), tail(16, 0, 6), ears(8), SHUT, PAWS_OVER),
    key(0.46, pelvis(0.006, -0.04), bend(-21, -7, -14, 0, 4), rump(-8), tail(17, 0, 6), ears(8), SHUT, PAWS_OVER),
    key(0.62, pelvis(-0.03), turn(12, 10), rump(0, -16), bend(2, 2, 4, 8, 8), tail(6, 20, 0, 8), ears(-12, 8), HAPPY, FRONT_DOWN),
    key(0.78, pelvis(-0.03), turn(-12, -10), rump(0, 16), bend(2, 2, 4, -8, -8), tail(6, -20, 0, -8), ears(-12, 8), HAPPY, FRONT_DOWN),
    key(0.94, pelvis(-0.028), turn(8, 6), rump(0, -10), bend(1, 1, 3, 5, 5), tail(6, 12, 0, 5), ears(-10, 6), HAPPY, FRONT_DOWN),
    key(1.14, pelvis(-0.01), bend(0, 0, 1), tail(4), ears(-2), HAPPY, FRONT_DOWN),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/**
 * Toxic: it heaves, hunched, its belly contracting, then spews a stream of
 * toxic liquid from its mouth at the foe with its neck stretched out, and
 * shakes its head at the taste.
 */
const toxic: Clip = {
  name: 'toxic',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03, -0.02), bend(8, 8, 14), rump(6), tail(-6), ears(-20), SHUT, scale(1.02)),
    key(0.26, pelvis(-0.04, -0.03), bend(10, 6, 12, 0, 4), rump(8), tail(-8), ears(-22), HURT, scale(0.98)),
    key(0.36, pelvis(-0.035, -0.035), bend(-2, -6, -10), rump(4), tail(0), ears(-14), SHUT, scale(1.03)),
    snap(0.46, pelvis(-0.03, 0.04), bend(6, 12, 2), rump(6), tail(-4), jaw(32), ears(-26), FIERCE, scale(1)),
    key(0.64, pelvis(-0.03, 0.04), bend(6, 12, 3, 3), rump(6), tail(-4), jaw(30), ears(-26), FIERCE),
    key(0.82, pelvis(-0.02, 0.02), bend(2, 4, 0), rump(3), jaw(6), ears(-14), ANGRY),
    key(0.96, pelvis(-0.015), bend(0, 0, 1, 8, 6), jaw(2), ears(-10), HURT),
    key(1.08, pelvis(-0.012), bend(0, 0, 1, -7, -5), ears(-8), HURT),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'emit' }],
};

/**
 * Attract: a coy look back over its shoulder at the foe, its rump turned and
 * wiggling, head tilted with a wink, and a flick of the tail; hearts float
 * over to the foe.
 */
const attract: Clip = {
  name: 'attract',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(-0.01), turn(-8), rump(4, 22), tail(12, 26, 6, 10), bend(-4, -6, -8, 14, 10), ears(6, 4), HAPPY),
    key(0.34, pelvis(-0.012), turn(-9), rump(6, 28), tail(14, 32, 6, 14), bend(-5, -7, -10, 16, 14), ears(8, 6), HAPPY),
    snap(0.44, pelvis(-0.012, 0, 0.01), turn(-9), rump(6, 18), tail(18, 10, 8, 4), bend(-5, -7, -10, 12, 16), ears(10, 6), SHUT),
    key(0.62, pelvis(-0.012, 0, -0.01), turn(-8), rump(6, 30), tail(16, 30, 8, 14), bend(-5, -7, -10, 14, 14), ears(10, 6), HAPPY),
    key(0.82, pelvis(-0.012, 0, 0.01), turn(-8), rump(6, 18), tail(16, 14, 8, 6), bend(-5, -7, -10, 14, 12), ears(10, 6), HAPPY),
    key(1.04, pelvis(-0.006), turn(-3), rump(2, 8), tail(8, 8, 4, 4), bend(-2, -3, -4, 4, 4), ears(4), HAPPY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'emit' }],
};

/**
 * Mimic: head cocked, it watches the foe intently, then copies it: it draws
 * itself up the way the foe stands and bobs its head in time with it, then
 * relaxes, pleased.
 */
const mimic: Clip = {
  name: 'mimic',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, pelvis(-0.01, 0.01), bend(2, 4, 6, 0, 16), ears(14, 6), OPEN_EYES),
    key(0.4, pelvis(-0.012, 0.012), bend(2, 4, 6, 0, -14), ears(14, 6), OPEN_EYES),
    snap(0.52, pelvis(0.015, -0.01), bend(-8, -8, -12), rump(6), tail(16, 0, 8), ears(12), FIERCE, scale(1.02)),
    key(0.66, pelvis(0.015, -0.01), bend(-8, -10, -8), rump(6), tail(16, 0, 8), ears(12), FIERCE, scale(1.02)),
    key(0.8, pelvis(0.015, -0.01), bend(-8, -6, -14), rump(6), tail(16, 0, 8), ears(12), FIERCE, scale(1.02)),
    key(0.94, pelvis(0.015, -0.01), bend(-8, -10, -8), rump(6), tail(16, 0, 8), ears(12), FIERCE, scale(1.02)),
    key(1.14, pelvis(0.004), bend(-2, -2, -3, 0, 6), rump(2), tail(6, 0, 3), ears(6), HAPPY, scale(1)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'emit' }],
};

/**
 * Thunder Wave: its fur prickles with static (a shiver), then a flick of its
 * head sends a weak crackling pulse at the foe.
 */
const thunderWave: Clip = {
  name: 'thunder_wave',
  duration: 1.25,
  keys: [
    key(0),
    key(0.1, pelvis(-0.02), bend(2, 2, 4), rump(4), tail(12, 0, 6), ears(-12), SHUT, scale(1.02)),
    key(0.17, pelvis(-0.02, 0, 0.006), turn(0, 3), bend(2, 2, 4), rump(5), tail(14, 0, 6), ears(-14), SHUT, scale(1.025)),
    key(0.24, pelvis(-0.02, 0, -0.006), turn(0, -3), bend(2, 2, 5), rump(5), tail(14, 0, 6), ears(-14), SHUT, scale(1.025)),
    snap(0.32, pelvis(-0.015, 0.02), bend(-2, 4, -2, -8), rump(6), tail(18, 0, 8), ears(-20), jaw(10), FIERCE, scale(1.03)),
    key(0.46, pelvis(-0.014, 0.018), bend(-2, 3, -1, -9), rump(6), tail(17, 0, 8), ears(-18), jaw(4), FIERCE, scale(1.02)),
    key(0.72, pelvis(-0.005), bend(0, 0, 1), rump(2), tail(5), ears(-6), ANGRY, scale(1)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'release' }],
};

/**
 * Swagger: a cocky strut in place, front paws stepping high one after the
 * other, chest puffed out and chin up, tail swinging, then a smug pose.
 */
const STEP_L = frontLegs([0.1, -0.5, 0.86], [0.05, -0.3, 0.95], [-0.05, -1, 0.1], [0, -1, 0.06]);
const STEP_R = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.1, -0.5, 0.86], [-0.05, -0.3, 0.95]);
const swagger: Clip = {
  name: 'swagger',
  duration: 1.6,
  keys: [
    key(0),
    key(0.14, pelvis(0.012, -0.02), bend(-10, -10, -14), rump(6), tail(18, 0, 8), ears(10), ANGRY, scale(1.03)),
    key(0.3, pelvis(0.016, -0.02, 0.01), turn(4, 4), bend(-12, -10, -16, -6), rump(6, 12), tail(20, 16, 8, 6), ears(12), ANGRY, scale(1.04), STEP_L),
    key(0.46, pelvis(0.012, -0.02, -0.01), turn(-4, -4), bend(-12, -10, -16, 6), rump(6, -12), tail(20, -16, 8, -6), ears(12), ANGRY, scale(1.04), STEP_R),
    key(0.62, pelvis(0.016, -0.02, 0.01), turn(4, 4), bend(-12, -10, -16, -6), rump(6, 12), tail(20, 16, 8, 6), ears(12), ANGRY, scale(1.04), STEP_L),
    snap(0.76, pelvis(0.018, -0.03), bend(-14, -12, -18, 0, 8), rump(8), tail(22, 0, 10), ears(14), HAPPY, jaw(12), scale(1.05), FRONT_DOWN),
    key(0.96, pelvis(0.017, -0.03), bend(-14, -12, -18, 0, 10), rump(8), tail(22, 4, 10), ears(14), HAPPY, jaw(8), scale(1.05), FRONT_DOWN),
    key(1.2, pelvis(0.004, -0.008), bend(-3, -3, -4), rump(2), tail(6), ears(4), HAPPY, scale(1.01), FRONT_DOWN),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'emit' }],
};

/** Sitting up begging: front paws held together under its chin. */
const BEG = frontLegs([0.1, -0.2, 0.97], [-0.3, 0.6, 0.74], [-0.1, -0.2, 0.97], [0.3, 0.6, 0.74]);

/** Charm: it sits up with its paws together under its chin, tilts its head with big happy eyes and bounces cutely. */
const charm: Clip = {
  name: 'charm',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(-0.005, -0.045), bend(-22, -4, -6), rump(-10), tail(12, 8, 4, 4), ears(12, 6), HAPPY, BEG),
    key(0.3, pelvis(0.006, -0.045), bend(-24, -5, -8, 0, 16), rump(-10), tail(14, 16, 4, 8), ears(14, 8), HAPPY, BEG),
    snap(0.4, pelvis(0.012, -0.045), bend(-24, -5, -8, 0, 18), rump(-10), tail(14, 22, 4, 10), ears(14, 8), SHUT, BEG, scale(1.02)),
    key(0.56, pelvis(-0.002, -0.045), bend(-23, -5, -7, 0, 14), rump(-10), tail(14, -10, 4, -6), ears(14, 8), HAPPY, BEG),
    key(0.72, pelvis(0.01, -0.045), bend(-24, -5, -8, 0, -14), rump(-10), tail(14, 16, 4, 8), ears(14, 8), HAPPY, BEG),
    key(0.9, pelvis(-0.002, -0.042), bend(-22, -4, -7, 0, -10), rump(-9), tail(12, -8, 4, -4), ears(12, 6), HAPPY, BEG),
    key(1.14, pelvis(-0.008), bend(-4, -1, -2), rump(-2), tail(4), ears(4), HAPPY, FRONT_DOWN),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/** Both forepaws raised in front, paws wiggling (tickling). */
const WIGGLE = (k: number): Pose => frontLegs([0.15, -0.1 + 0.08 * k, 0.98], [0.1, 0.2 - 0.25 * k, 0.96], [-0.15, -0.1 - 0.08 * k, 0.98], [-0.1, 0.2 + 0.25 * k, 0.96]);

/**
 * Tickle: it zigzags up to the foe, rears up in front of it and tickles it
 * with both forepaws wriggling, giggling (happy eyes), then scampers home.
 */
const tickle: Clip = {
  name: 'tickle',
  duration: 1.9,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03), bend(2, 2, 4), rump(6, 8), tail(10, 12), ears(8), HAPPY),
    ...zigzagIn(0.14, 0.5, [HAPPY]),
    key(0.5, at(1), ...LANDED, pelvis(-0.03), bend(-4, -2, -4), rump(4), tail(10), ears(8), HAPPY),
    key(0.6, at(1), body(0, 0, 0.14), pelvis(-0.01, -0.02), bend(-22, -4, -6), rump(-8), tail(12, 8, 4), ears(10), HAPPY, WIGGLE(1)),
    key(0.68, at(1), body(0, 0, 0.14), pelvis(-0.01, -0.02), bend(-22, -4, -6, 4, 6), rump(-8), tail(12, -8, 4), ears(10), HAPPY, WIGGLE(-1)),
    key(0.76, at(1), body(0, 0, 0.14), pelvis(-0.01, -0.02), bend(-22, -4, -6, -4, -6), rump(-8), tail(12, 8, 4), ears(10), HAPPY, WIGGLE(1)),
    key(0.84, at(1), body(0, 0, 0.14), pelvis(-0.01, -0.02), bend(-22, -4, -6, 4, 6), rump(-8), tail(12, -8, 4), ears(10), HAPPY, WIGGLE(-1)),
    key(0.92, at(1), body(0, 0, 0.14), pelvis(-0.01, -0.02), bend(-22, -4, -6, -3, -4), rump(-8), tail(12, 6, 4), ears(10), HAPPY, WIGGLE(1)),
    key(1.02, at(1), body(0, 0.04, 0.06), ...AIR, bend(-6, -2, -4), rump(-2), tail(10), ears(8), HAPPY),
    key(1.12, at(1), ...LANDED, bend(-2, -1, -2), tail(8), ears(6), HAPPY),
    ...zigzagHome(1.12, 1.5, [HAPPY]),
    key(1.5, at(0), ...LANDED, HAPPY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'emit' }],
};

/** Offering with the right forepaw held out, palm up; the left braced. */
const OFFER = frontLegs([0.05, -1, 0.1], [0, -1, 0.06], [-0.1, -0.3, 0.95], [-0.05, 0.05, 1]);
/** The swap: the forepaws crossing quickly in front of its chest. */
const SWAP = frontLegs([0.05, -0.4, 0.92], [-0.7, 0.1, 0.7], [-0.05, -0.4, 0.92], [0.7, 0.2, 0.68]);

/**
 * Trick: it sits up and holds out a forepaw innocently, as if offering
 * something, then its paws flash across each other in a quick swap and it
 * sits back with a sly look.
 */
const trick: Clip = {
  name: 'trick',
  duration: 1.55,
  keys: [
    key(0),
    key(0.16, pelvis(-0.005, -0.04), bend(-18, -4, -6, 0, 8), rump(-8), tail(10), ears(10), HAPPY, OFFER),
    key(0.34, pelvis(-0.004, -0.04), bend(-19, -4, -6, 0, 10), rump(-8), tail(11, 4), ears(10), HAPPY, OFFER),
    snap(0.44, pelvis(0.004, -0.045), bend(-22, -6, -8, 0, -4), rump(-9), tail(12, -6), ears(4), FIERCE, SWAP),
    key(0.52, pelvis(0.004, -0.045), bend(-22, -6, -8, 0, -5), rump(-9), tail(12, -8), ears(4), FIERCE, SWAP),
    key(0.7, pelvis(-0.006, -0.05), bend(-18, -4, -4, 8, 6), rump(-8), tail(10, 10, 4, 4), ears(6), HAPPY, PAWS_HUG),
    key(0.92, pelvis(-0.006, -0.05), bend(-18, -4, -4, 10, 8), rump(-8), tail(10, 14, 4, 6), ears(6), HAPPY, PAWS_HUG),
    key(1.16, pelvis(-0.008), bend(-3, -1, -1), rump(-1), tail(4), ears(3), HAPPY, FRONT_DOWN),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'emit' }],
};

// On itself ------------------------------------------------------------------------------

/**
 * Rest: it lies down curled round to its left, the head turned in toward
 * its tail, eyes shut, breathing slow; the sparkles rise; then it gets up
 * again, still drowsy.
 */
const rest: Clip = {
  name: 'rest',
  duration: 2.4,
  keys: [
    key(0, FRONT_DOWN),
    key(0.3, pelvis(-0.06, -0.035), bend(0, 0, -2, 8), turn(10), rump(-6, -12), tail(-6, -20), ears(-10), FRONT_DOWN, DROWSY),
    key(0.62, ...ASLEEP),
    key(1.0, ...ASLEEP, pelvis(0.005), scale(1.015)),
    key(1.4, ...ASLEEP, pelvis(-0.002)),
    key(1.75, ...ASLEEP, pelvis(0.005), scale(1.015)),
    key(2.05, pelvis(-0.05, -0.02), bend(0, 2, 4), turn(4), rump(-2, -4), tail(-2, -6), ears(-6), FRONT_DOWN, DROWSY, scale(1)),
    key(2.4, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 0.95, name: 'aura' }],
};

/** Up on its haunches, both paws out (the drummer's pose between beats). */
const belly = (k: number, beat: boolean): Pose[] => [
  pelvis(beat ? -0.036 : -0.02, -0.05), bend(beat ? -29 : -32, 12, beat ? 18 : 16, beat ? 5 * k : 0), turn(beat ? -7 * k : 0), rump(beat ? -9 : -10), tail(beat ? 4 : 7), ears(beat ? 4 : 6),
];

/**
 * Belly Drum: it sits up on its haunches and drums its belly with its
 * forepaws, right, left, then faster and harder, every beat bouncing its
 * body and bringing that shoulder forward; the aura rises and it drops back
 * onto all fours, pumped up.
 */
const bellyDrum: Clip = {
  name: 'belly_drum',
  duration: 1.6,
  keys: [
    key(0, FRONT_DOWN),
    key(0.14, pelvis(-0.02, -0.05), bend(-32, 12, 16), rump(-10), tail(6), ears(8), PAWS_UP, ANGRY),
    key(0.27, ...belly(1, true), drum(true), ANGRY),
    key(0.39, ...belly(0, false), PAWS_UP, ANGRY),
    key(0.52, ...belly(-1, true), drum(false), FIERCE),
    key(0.575, ...belly(0, false), PAWS_UP, FIERCE),
    key(0.63, ...belly(1, true), drum(true), FIERCE),
    key(0.69, ...belly(0, false), PAWS_UP, FIERCE),
    key(0.75, ...belly(-1, true), drum(false), FIERCE),
    key(0.81, ...belly(0, false), PAWS_UP, FIERCE),
    key(0.87, ...belly(1, true), drum(true), FIERCE),
    key(1.0, pelvis(-0.018, -0.05), bend(-36, 8, 10), rump(-11), tail(12, 0, 4), ears(12), PAWS_UP, FIERCE, scale(1.03)),
    fall(1.24, pelvis(-0.02), bend(2, 2, 4), rump(0), tail(4), ears(-4), FRONT_DOWN, ANGRY, scale(1)),
    key(1.6, FRONT_DOWN, OPEN_EYES),
  ],
  events: [{ t: 1.02, name: 'aura' }],
};

/** Sunny Day: it sits up, tips its face up to the sky with its eyes shut happily and calls the sun out, basking a moment. */
const sunnyDay: Clip = {
  name: 'sunny_day',
  duration: 1.7,
  keys: [
    key(0),
    key(0.18, pelvis(-0.02), bend(4, 4, 8), ears(-4), DROWSY),
    key(0.42, pelvis(0.008, -0.045), bend(-24, -14, -22), rump(-8), tail(14, 0, 6), ears(8), HAPPY, PAWS_WIDE),
    snap(0.54, pelvis(0.01, -0.048), bend(-26, -16, -26), rump(-8), tail(16, 0, 6), ears(10), jaw(24), SHUT, PAWS_WIDE, scale(1.02)),
    key(0.76, pelvis(0.01, -0.048), bend(-26, -16, -25, 3), rump(-8), tail(16, 6, 6), ears(10), jaw(8), SHUT, PAWS_WIDE, scale(1.02)),
    key(0.98, pelvis(0.01, -0.048), bend(-25, -15, -24, -3), rump(-8), tail(16, -6, 6), ears(10), jaw(4), HAPPY, PAWS_WIDE, scale(1.01)),
    key(1.24, pelvis(-0.006), bend(-2, -2, -4), rump(-1), tail(4), ears(3), HAPPY, FRONT_DOWN, scale(1)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.58, name: 'aura' }],
};

/**
 * Rain Dance: a little dance calling the rain: up on its hind legs, paws up,
 * it hops round in a circle, head tipped up to the sky, and comes down
 * facing the foe again.
 */
const rainDance: Clip = {
  name: 'rain_dance',
  duration: 1.9,
  keys: [
    key(0),
    key(0.16, pelvis(-0.03), bend(4, 2, 4), ears(-4), HAPPY),
    key(0.34, pelvis(0.008, -0.04), bend(-22, -8, -14), rump(-8), tail(14, 0, 6), ears(8), HAPPY, PAWS_HIGH),
    key(0.5, body(0, 0.06, 0, 90), { plantFeet: 0 }, HIND_TUCK, pelvis(0.008, -0.04), bend(-24, -10, -18, 0, 8), rump(-8, 10), tail(14, 16, 6, 6), ears(10), SHUT, PAWS_HIGH),
    key(0.64, body(0, 0, 0, 180), pelvis(0.006, -0.04), bend(-22, -10, -18, 0, -8), rump(-8, -8), tail(14, -14, 6, -6), ears(10), HAPPY, PAWS_HIGH),
    key(0.78, body(0, 0.06, 0, 270), { plantFeet: 0 }, HIND_TUCK, pelvis(0.008, -0.04), bend(-24, -10, -18, 0, 8), rump(-8, 10), tail(14, 16, 6, 6), ears(10), SHUT, PAWS_HIGH),
    key(0.92, body(0, 0, 0, 360), pelvis(0.006, -0.04), bend(-24, -12, -20), rump(-8), tail(16, 0, 6), ears(10), jaw(16), HAPPY, PAWS_HIGH),
    key(1.08, body(0, 0, 0, 360), pelvis(0.008, -0.042), bend(-25, -13, -22, 3), rump(-8), tail(16, 6, 6), ears(10), jaw(20), SHUT, PAWS_HIGH),
    key(1.34, body(0, 0, 0, 360), pelvis(-0.008), bend(-2, -2, -3), rump(-1), tail(4), ears(3), HAPPY, FRONT_DOWN),
    key(1.9, body(0, 0, 0, 360), OPEN_EYES),
  ],
  events: [{ t: 1.02, name: 'aura' }],
};

/**
 * Protect: it hunkers down behind its raised forepaws, crossed in front of
 * its face, fur puffed and eyes narrowed, and holds firm behind the barrier.
 */
const protect: Clip = {
  name: 'protect',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03, -0.02), bend(4, 4, 8), ears(-16), FIERCE),
    snap(0.26, pelvis(-0.02, -0.05), bend(-16, 2, 10), rump(-6), tail(12, 0, 6), ears(-26), FIERCE, PAWS_FACE, scale(1.03)),
    key(0.46, pelvis(-0.022, -0.052), bend(-16, 2, 11, 0, 1), rump(-6), tail(13, 0, 6), ears(-26), FIERCE, PAWS_FACE, scale(1.03)),
    key(0.7, pelvis(-0.02, -0.05), bend(-15, 2, 10, 0, -1), rump(-6), tail(12, 0, 6), ears(-25), FIERCE, PAWS_FACE, scale(1.03)),
    key(0.92, pelvis(-0.022, -0.052), bend(-16, 2, 11), rump(-6), tail(13, 0, 6), ears(-26), FIERCE, PAWS_FACE, scale(1.03)),
    key(1.12, pelvis(-0.01), bend(0, 0, 2), rump(-1), tail(4), ears(-8), ANGRY, FRONT_DOWN, scale(1)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'aura' }],
};

/**
 * Endure: it digs in low with its claws, braced and trembling with the
 * effort, jaws clenched and eyes fierce, holding its ground.
 */
const endure: Clip = {
  name: 'endure',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03), bend(4, 4, 6), rump(4), ears(-18), FIERCE),
    snap(0.26, pelvis(-0.055, -0.02), bend(8, 6, 4), rump(10), tail(-8), ears(-30), FIERCE, jaw(4), scale(0.98)),
    key(0.38, pelvis(-0.056, -0.02, 0.006), turn(0, 2), bend(8, 6, 5), rump(10), tail(-8), ears(-30), FIERCE, scale(0.98)),
    key(0.5, pelvis(-0.055, -0.02, -0.006), turn(0, -2), bend(8, 6, 4), rump(10), tail(-8), ears(-30), FIERCE, scale(0.98)),
    key(0.62, pelvis(-0.056, -0.02, 0.006), turn(0, 2), bend(8, 6, 5), rump(10), tail(-8), ears(-30), FIERCE, scale(0.98)),
    key(0.74, pelvis(-0.055, -0.02, -0.006), turn(0, -2), bend(8, 6, 4), rump(10), tail(-8), ears(-30), FIERCE, scale(0.98)),
    key(0.94, pelvis(-0.03), bend(4, 3, 2), rump(4), tail(-2), ears(-16), ANGRY, scale(1)),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'aura' }],
};

/**
 * Substitute: a burst of effort (it puffs itself up, straining), then it
 * hops back out of its place as the doll takes it, and settles.
 */
const substitute: Clip = {
  name: 'substitute',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(-0.04), bend(6, 6, 10), rump(6), tail(8), ears(-20), SHUT),
    snap(0.28, pelvis(0.01), bend(-8, -8, -12), rump(8), tail(22, 0, 10), ears(16), FIERCE, jaw(18), scale(1.06)),
    key(0.42, pelvis(0.01), bend(-8, -8, -13, 0, 3), rump(8), tail(22, 0, 10), ears(16), FIERCE, jaw(14), scale(1.06)),
    key(0.56, body(0, 0.07, -0.12), ...AIR, bend(-2, -2, -4), rump(2), tail(10), ears(-8), ANGRY, scale(1)),
    key(0.68, body(0, 0, -0.14), ...LANDED, bend(2, 2, 4), rump(2), tail(4), ears(-10), ANGRY),
    key(0.86, body(0, 0.05, -0.05), ...AIR, bend(0, 0, 0), tail(6), ears(-6), ANGRY),
    key(0.98, body(0, 0, 0), ...LANDED, bend(1, 1, 2), ears(-6), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/** Double Team: it zigzags left and right on the spot in quick darting hops, too fast to follow; the afterimages swing out from the aura. */
const doubleTeam: Clip = {
  name: 'double_team',
  duration: 1.55,
  keys: [
    key(0),
    key(0.1, pelvis(-0.04), bend(4, 2, 2), ears(-16), FIERCE),
    key(0.2, body(0.14, 0.06), turn(10), rump(0, 14), tail(-4, 16, 0, 6), ears(-18), FIERCE, ...AIR),
    key(0.3, body(0.26), turn(4), rump(0, 6), tail(2, 8), ears(-16), FIERCE, ...LANDED),
    key(0.42, body(0.02, 0.06), turn(-10), rump(0, -14), tail(-4, -16, 0, -6), ears(-18), FIERCE, ...AIR),
    key(0.52, body(-0.26), turn(-4), rump(0, -6), tail(2, -8), ears(-16), FIERCE, ...LANDED),
    key(0.64, body(-0.02, 0.06), turn(10), rump(0, 14), tail(-4, 16, 0, 6), ears(-18), FIERCE, ...AIR),
    key(0.74, body(0.22), turn(4), rump(0, 6), tail(2, 8), ears(-16), FIERCE, ...LANDED),
    key(0.86, body(0.02, 0.05), turn(-8), rump(0, -12), tail(-4, -12, 0, -4), ears(-16), FIERCE, ...AIR),
    key(0.96, body(-0.18), turn(-3), rump(0, -4), tail(2, -6), ears(-14), FIERCE, ...LANDED),
    key(1.1, body(-0.04, 0.04), turn(4), rump(0, 6), tail(0, 6), ears(-12), FIERCE, ...AIR),
    key(1.22, body(0), ...LANDED, ears(-8), ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Sleep Talk: asleep, curled up, it mumbles (its jaw working), its paws and
 * ears twitch as it dreams, and it stirs up onto its feet still asleep as the
 * move it dreams of plays.
 */
const sleepTalk: Clip = {
  name: 'sleep_talk',
  duration: 1.7,
  keys: [
    key(0, ...ASLEEP),
    key(0.2, ...ASLEEP, jaw(10), ears(6, 4)),
    key(0.34, ...ASLEEP, jaw(2), bend(0, 0, 2, 4), tail(0, 6)),
    key(0.48, ...ASLEEP, jaw(12), ears(-4), scale(1.02)),
    snap(0.6, pelvis(-0.03), bend(2, 4, 8, 0, 6), rump(-2), tail(4), ears(-6), SHUT, FRONT_DOWN),
    key(0.8, pelvis(-0.03), bend(2, 4, 9, 0, -4), rump(-2), tail(4), ears(-6), jaw(8), SHUT, FRONT_DOWN),
    key(1.0, pelvis(-0.028), bend(2, 4, 8, 0, 3), rump(-2), tail(3), ears(-5), jaw(2), SHUT, FRONT_DOWN),
    key(1.3, pelvis(-0.012), bend(1, 2, 3), tail(2), ears(-3), SHUT, FRONT_DOWN),
    key(1.7, SHUT),
  ],
  events: [{ t: 0.64, name: 'aura' }],
};

/** Curled into a tight ball: head tucked to the chest, paws in, rump curled under, tail wrapped over its back. */
const BALL: Pose[] = [pelvis(-0.06, -0.08), bend(-5, 13, 32), rump(-18, -10), tail(24, 10, 12), ears(-30), SHUT, PAWS_HUG];

/** Defense Curl: it sits back over its haunches and curls up into a tight spiky ball, holds it trembling, then peeks out. */
const defenseCurl: Clip = {
  name: 'defense_curl',
  duration: 1.45,
  keys: [
    key(0),
    key(0.14, pelvis(-0.03), bend(4, 4, 8), ears(-10), DROWSY),
    snap(0.26, ...BALL),
    key(0.38, ...BALL, pelvis(-0.003, -0.004), rump(-2, -2), tail(2, 2, 2), scale(0.98)),
    key(0.6, ...BALL, pelvis(-0.001, -0.004), rump(-2, -1), tail(1, 1, 1), bend(0, 0, 1), scale(0.98)),
    key(0.84, ...BALL, pelvis(-0.003, -0.004), rump(-2, -2), tail(2, 2, 2), scale(0.98)),
    key(1.08, pelvis(-0.03), bend(2, 2, 4), rump(-4), tail(6), ears(-6), ANGRY, FRONT_DOWN),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'aura' }],
};

export const STATUS_CLIPS: Clip[] = [
  growl, tailWhip, sandAttack, odorSleuth, mudSport, toxic, attract, mimic, thunderWave, swagger, charm, tickle, trick,
  rest, bellyDrum, sunnyDay, rainDance, protect, endure, substitute, doubleTeam, sleepTalk, defenseCurl,
];

export { CURL, HURT, PAWS_FLING };
