// Combusken's ranged moves, fired from home: fire brought up its throat and
// out of its beak (it sets its raised foot down to brace, the head leads, the
// arms stay out of the way), a burst from the whole body, stars flung from a
// clawed hand, rocks called down with a heave and a stamp of its big talons,
// mud scooped and slapped with a claw, a snore. The head trails the hips by 0.065 s: a
// release comes that much after the snap that causes it.

import type { Clip } from '../../../anim/clip';
import type { Arm } from './kit';
import {
  ANGRY, BRACED, CHAMBER, CROSSED, DROWSY, ELBOWS_BACK, FEET, GUARD, GUARD_L, HEAVE, LIMP, OPEN_EYES, SHUT, SLAM_DOWN, SQUEEZE, WINGS_OUT,
  armR, arms, bend, both, crest, jaw, key, legR, pelvis, root, snap, tail, twist,
} from './kit';

const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];

/** Ember: a quick breath (chest up, head back), then the head snaps forward and spits embers from the beak. */
export const ember: Clip = {
  name: 'ember',
  duration: 1.15,
  keys: [
    key(0),
    key(0.22, pelvis(0, 0.01), bend(-8, -8, -8, -12), ELBOWS_BACK, crest(-6), ANGRY),
    snap(0.32, pelvis(0, -0.02, 0.03), bend(14, 9, 4, -8), CHAMBER, jaw(34), tail(-8), ANGRY),
    key(0.48, pelvis(0, -0.012, 0.015), bend(8, 4, 2, -11), CHAMBER, jaw(18), ANGRY),
    key(0.68, pelvis(0, -0.005), bend(3, 1, 0, -3), CHAMBER, jaw(3), ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

/** Flamethrower: it sets its foot down and draws a deep breath, embers gathering at the beak, then the head drives forward and a sustained stream pours out, the body braced low. */
export const flamethrower: Clip = {
  name: 'flamethrower',
  duration: 2.25,
  keys: [
    key(0),
    key(0.14, FEET, pelvis(0, -0.025), bend(4, 0, 0, 6), CHAMBER),
    key(0.5, FEET, pelvis(0, 0.015), bend(-12, -10, -10, -16), ELBOWS_BACK, crest(-8), SHUT),
    key(0.64, FEET, pelvis(0, 0.018), bend(-13, -11, -11, -18, 0, 2), ELBOWS_BACK, crest(-9), SHUT),
    snap(0.76, FEET, pelvis(0, -0.045, 0.03), bend(14, 9, 4, -8), BRACED, jaw(36), tail(-10), ANGRY),
    key(0.98, FEET, pelvis(0, -0.04, 0.024), bend(12, 8, 4, -6, 5), BRACED, jaw(34), ANGRY),
    key(1.2, FEET, pelvis(0, -0.044, 0.03), bend(13, 9, 4, -8, -4, -2), BRACED, jaw(36), ANGRY),
    key(1.42, FEET, pelvis(0, -0.04, 0.024), bend(12, 8, 4, -6, 3, 1), BRACED, jaw(34), ANGRY),
    key(1.6, FEET, pelvis(0, -0.042, 0.027), bend(12, 8, 4, -7), BRACED, jaw(33), ANGRY),
    key(1.78, FEET, pelvis(0, -0.02), bend(4, 2, 0, -6, 7), CHAMBER, jaw(4), ANGRY),
    key(1.92, pelvis(0, -0.01), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY),
    key(2.25, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.82, name: 'release' }, { t: 1.64, name: 'releaseEnd' }],
};

/** Fire Spin: a breath drawn in, then a stream that spirals round the foe: the head sweeps in a circle as it breathes, the body swaying with it. */
export const fire_spin: Clip = {
  name: 'fire_spin',
  duration: 2.25,
  keys: [
    key(0),
    key(0.14, FEET, pelvis(0, -0.025), bend(6, 0, 0, 6), CHAMBER),
    key(0.42, FEET, pelvis(0, 0.012), bend(-10, -8, -8, -14), ELBOWS_BACK, SHUT),
    snap(0.56, FEET, pelvis(0, -0.036, 0.026), bend(12, 8, 4, -6, 10), BRACED, jaw(34), ANGRY),
    key(0.74, FEET, pelvis(0.008, -0.034, 0.024), twist(6), bend(10, 6, -2, -10, 12, 6), BRACED, jaw(34), ANGRY),
    key(0.92, FEET, pelvis(0, -0.028, 0.02), bend(6, 4, -4, -16, 0, 2), BRACED, jaw(36), ANGRY),
    key(1.1, FEET, pelvis(-0.008, -0.034, 0.024), twist(-6), bend(10, 6, -2, -10, -12, -6), BRACED, jaw(34), ANGRY),
    key(1.28, FEET, pelvis(0, -0.042, 0.028), bend(16, 10, 6, -2, 0, -2), BRACED, jaw(36), ANGRY),
    key(1.46, FEET, pelvis(0.008, -0.034, 0.024), twist(6), bend(10, 6, 0, -8, 12, 6), BRACED, jaw(34), ANGRY),
    key(1.62, FEET, pelvis(0, -0.032, 0.02), bend(8, 5, -2, -12, 2, 2), BRACED, jaw(30), ANGRY),
    key(1.8, FEET, pelvis(0, -0.016), bend(4, 2, 0, -6, -7), CHAMBER, jaw(4), ANGRY),
    key(1.94, pelvis(0, -0.008), bend(2, 1, 0, -3, 6), CHAMBER, ANGRY),
    key(2.25, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.62, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/** Fire Blast: a huge breath (rising tall on both feet, chest out, arms swept back), then the whole upper body lunges and one huge blast leaves the beak; the recoil rocks it back. */
export const fire_blast: Clip = {
  name: 'fire_blast',
  duration: 2.0,
  keys: [
    key(0),
    key(0.16, FEET, pelvis(0, -0.035), bend(10, 4, 0, 8), CHAMBER),
    key(0.46, FEET, pelvis(0, 0.022), bend(-16, -12, -10, -18), ELBOWS_BACK, crest(-10), SQUEEZE),
    key(0.6, FEET, pelvis(0, 0.025), bend(-17, -13, -11, -20, 0, 2), ELBOWS_BACK, crest(-11), SQUEEZE),
    snap(0.7, FEET, pelvis(0, -0.05, 0.045), bend(20, 12, 4, -10), both(A([-0.35, -0.45, -0.82], [-0.25, -0.3, -0.92], [-0.2, -0.2, -0.96])), jaw(44), tail(-14), ANGRY),
    key(0.82, FEET, pelvis(0, -0.051, 0.046), bend(21, 12, 4, -10), both(A([-0.35, -0.47, -0.81], [-0.25, -0.32, -0.91], [-0.2, -0.22, -0.95])), jaw(42), ANGRY),
    key(0.98, FEET, pelvis(0, -0.035, 0.01), root({ z: -0.03 }), bend(6, 2, -2, -14), BRACED, jaw(24), ANGRY),
    key(1.18, FEET, pelvis(0, -0.033, 0.008), root({ z: -0.03 }), bend(8, 3, 0, -10), BRACED, jaw(8), ANGRY),
    key(1.38, pelvis(0, -0.015), bend(4, 2, 0, -6, 7), CHAMBER, ANGRY),
    key(1.54, pelvis(0, -0.008), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.77, name: 'release' }],
};

/** Overheat: it gathers all its fire in, curled over with its arms crossed and trembling, then erupts: chest out, arms flung wide, head back, the fire bursting at the foe; then it sags, spent. */
export const overheat: Clip = {
  name: 'overheat',
  duration: 2.3,
  keys: [
    key(0),
    key(0.3, FEET, pelvis(0, -0.06), bend(20, 8, 4, 16), CROSSED, crest(-14), SQUEEZE),
    key(0.46, FEET, pelvis(0.004, -0.066), bend(22, 8, 4, 17, 0, 1.5), CROSSED, crest(-15), SQUEEZE),
    key(0.62, FEET, pelvis(-0.004, -0.07), bend(23, 9, 4, 18, 0, -1.5), CROSSED, crest(-16), SQUEEZE),
    snap(0.76, FEET, pelvis(0, 0.02), bend(-16, -10, -6, -22), WINGS_OUT, jaw(40), crest(10), tail(-18), ANGRY),
    key(0.9, FEET, pelvis(0.003, 0.022), bend(-17, -10, -6, -23, 0, 2), WINGS_OUT, jaw(42), crest(10), ANGRY),
    key(1.06, FEET, pelvis(-0.003, 0.02), bend(-16, -10, -6, -22, 0, -2), WINGS_OUT, jaw(38), crest(8), ANGRY),
    key(1.32, FEET, pelvis(0, -0.055), bend(18, 8, 4, 14), LIMP, jaw(18), DROWSY),
    key(1.5, FEET, pelvis(0, -0.05), bend(16, 7, 4, 12), LIMP, jaw(8), DROWSY),
    key(1.68, FEET, pelvis(0, -0.055), bend(18, 8, 4, 14), LIMP, jaw(16), DROWSY),
    key(1.9, pelvis(0, -0.02), bend(6, 2, 0, 4), GUARD, jaw(2), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.8, name: 'release' }],
};

/** Hidden Power: its clawed hands cupped before its chest as orbs of light gather round it (charge), drawn back to the hip, then thrust out at the foe with both palms. */
export const hidden_power: Clip = {
  name: 'hidden_power',
  duration: 1.8,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.03), bend(6, 2, 0, 6), arms(A([-0.3, -0.62, 0.72], [0.62, 0.12, 0.77], [0.7, 0.3, 0.65]), A([0.3, -0.62, 0.72], [-0.62, 0.32, 0.72], [-0.7, 0.1, 0.7])), SHUT),
    key(0.42, FEET, pelvis(0.004, -0.034), bend(7, 2, 0, 7), arms(A([-0.3, -0.58, 0.76], [0.6, 0.32, 0.73], [0.7, 0.1, 0.7]), A([0.3, -0.64, 0.71], [-0.62, 0.1, 0.78], [-0.7, 0.3, 0.65])), SHUT),
    key(0.64, FEET, pelvis(0, -0.045), twist(-22), bend(10, 2, 0, -4, 10), arms(A([-0.5, -0.6, -0.62], [0.3, 0.1, 0.95], [0.5, 0.2, 0.84]), A([-0.1, -0.7, 0.7], [-0.7, -0.05, 0.71], [-0.8, 0.1, 0.59])), ANGRY),
    snap(0.74, FEET, pelvis(0, -0.03, 0.025), twist(12), bend(12, 4, 0, -6, -4), both(A([-0.25, 0.02, 0.97], [-0.02, 0.1, 0.99], [0, 0.35, 0.94])), ANGRY),
    key(0.9, FEET, pelvis(0, -0.031, 0.026), twist(13), bend(12, 4, 0, -6, -4), both(A([-0.25, 0, 0.97], [-0.02, 0.06, 1], [0, 0.3, 0.95])), ANGRY),
    key(1.1, pelvis(0, -0.02), bend(6, 2, 0, -2), GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.82, name: 'release' }],
};

/** Swift: the right arm wound across its body, then whipped out in a wide backhand that sprays stars from its claws. */
export const swift: Clip = {
  name: 'swift',
  duration: 1.3,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.03), twist(22, 4), bend(8, 2, 0, -8, -12), GUARD_L, armR(A([0.55, -0.1, 0.83], [0.82, 0.18, -0.54], [0.6, 0.2, -0.77])), ANGRY),
    snap(0.3, pelvis(0, -0.02, 0.012), twist(-20, -4), bend(6, 2, 0, -6, 10), GUARD_L, armR(A([-0.62, 0.12, 0.78], [-0.74, 0.18, 0.65], [-0.8, 0.2, 0.56])), ANGRY),
    key(0.42, pelvis(0, -0.022, 0.012), twist(-24, -4), bend(6, 2, 0, -6, 12), GUARD_L, armR(A([-0.76, 0.08, 0.64], [-0.82, 0.1, 0.56], [-0.88, 0.1, 0.46])), ANGRY),
    key(0.58, pelvis(0, -0.02), twist(-18, -2), bend(6, 2, 0, -4, 8), GUARD_L, armR(A([-0.86, -0.1, 0.5], [-0.8, -0.2, 0.56], [-0.8, -0.3, 0.52])), ANGRY),
    key(0.8, pelvis(0, -0.01), bend(2, 0, 0, -2), GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'release' }],
};

/** Rock Tomb: a heave up on its standing leg, arms flung up wide and the knee drawn high, then a stamp of its big talons that calls the rocks down on the foe. */
export const rock_tomb: Clip = {
  name: 'rock_tomb',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.045), bend(14, 4, 0, 4), BRACED, ANGRY),
    key(0.42, legR([-0.2, 0.55, 0.81], [-0.1, -0.6, 0.79]), pelvis(-0.01, 0.012), bend(-8, -6, -4, -14), WINGS_OUT, crest(-10), ANGRY),
    key(0.52, legR([-0.2, 0.6, 0.78], [-0.1, -0.56, 0.82]), pelvis(-0.01, 0.014), bend(-9, -6, -4, -15), WINGS_OUT, crest(-11), ANGRY),
    snap(0.6, FEET, pelvis(0, -0.075), bend(18, 8, 2, 4), BRACED, jaw(16), ANGRY),
    key(0.74, FEET, pelvis(0, -0.078), bend(19, 8, 2, 4), BRACED, jaw(10), ANGRY),
    key(0.94, FEET, pelvis(0, -0.05), bend(12, 4, 0, 0), BRACED, ANGRY),
    key(1.14, pelvis(0, -0.02), bend(4, 2, 0, -2), GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'release' }],
};

/** Rock Slide: both arms scoop low, heave up in front, then slam down at the foe: the rocks come crashing down on it. */
export const rock_slide: Clip = {
  name: 'rock_slide',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.07), bend(28, 8, 2, 8), both(A([-0.22, -0.84, 0.5], [0.05, -0.95, 0.3], [0.1, -0.98, 0.15])), ANGRY),
    key(0.44, FEET, pelvis(0, 0.008, -0.01), bend(-10, -6, -4, -14), HEAVE, crest(-8), ANGRY),
    key(0.54, FEET, pelvis(0, 0.01, -0.012), bend(-11, -6, -4, -15), HEAVE, crest(-9), ANGRY),
    snap(0.62, FEET, pelvis(0, -0.065, 0.02), bend(28, 12, 2, 2), SLAM_DOWN, jaw(14), ANGRY),
    key(0.76, FEET, pelvis(0, -0.067, 0.02), bend(29, 12, 2, 2), SLAM_DOWN, jaw(8), ANGRY),
    key(0.96, FEET, pelvis(0, -0.045), bend(14, 4, 0, 0), BRACED, ANGRY),
    key(1.16, pelvis(0, -0.02), bend(4, 2, 0, -2), GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'release' }],
};

/**
 * Mud-Slap: it dips low and scoops a clod of mud off the ground with its big
 * right claw, winds it back by the hip, then slaps it at the foe with a
 * sidearm sweep, the body turning into the throw (the mud leaves the claws:
 * the hand trails the hips by 0.08 s). Its feet kick sand (Sand-Attack); its
 * hand slaps mud.
 */
export const mud_slap: Clip = {
  name: 'mud_slap',
  duration: 1.25,
  keys: [
    key(0),
    // Down low on both feet: the claw scoops the ground beside it.
    key(0.2, FEET, pelvis(0.01, -0.1), twist(-12), bend(34, 12, 0, -4, -6), GUARD_L, armR(A([-0.3, -0.9, 0.3], [-0.05, -0.97, 0.25], [0, -0.95, 0.3])), ANGRY),
    // The clod held, drawn back low behind the hip, the knee coming back up.
    key(0.36, pelvis(0.01, -0.07), twist(-24), bend(20, 6, 0, -8, -8), GUARD_L, armR(A([-0.55, -0.62, -0.56], [-0.4, -0.25, -0.88], [-0.3, -0.1, -0.95])), ANGRY),
    // The slap: a sidearm sweep across at the foe.
    snap(0.46, pelvis(-0.005, -0.045, 0.02), twist(18), bend(8, 2, 0, -8, 6), GUARD_L, armR(A([-0.2, -0.1, 0.97], [0.4, 0.05, 0.92], [0.6, 0.1, 0.79])), jaw(14), ANGRY),
    key(0.58, pelvis(-0.008, -0.045, 0.02), twist(22), bend(10, 2, 0, -8, 8), GUARD_L, armR(A([0.2, -0.2, 0.96], [0.62, -0.15, 0.77], [0.75, -0.15, 0.64])), jaw(8), ANGRY),
    key(0.8, pelvis(0, -0.03), twist(6), bend(8, 0, 0, -2), GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'release' }],
};

/** Snore: asleep on its feet (both down), slumped with its eyes shut; a big breath, and a huge snore blasts out at the foe, the head thrown back; it droops again. */
export const snore: Clip = {
  name: 'snore',
  duration: 1.85,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.04), root({ roll: 3 }), bend(14, 6, 6, 18, 0, 8), LIMP, SHUT),
    key(0.5, FEET, pelvis(0, -0.025), root({ roll: 2 }), bend(4, -4, -2, -6, 0, 6), LIMP, jaw(10), SHUT),
    snap(0.62, FEET, pelvis(0, -0.015), root({ roll: 1 }), bend(-6, -8, -8, -20, 0, 4), LIMP, jaw(40), crest(-10), SHUT),
    key(0.8, FEET, pelvis(0, -0.018), root({ roll: 1 }), bend(-5, -8, -8, -19, 0, 5), LIMP, jaw(36), SHUT),
    key(1.04, FEET, pelvis(0, -0.042), root({ roll: 3 }), bend(14, 6, 6, 18, 0, 8), LIMP, jaw(6), SHUT),
    key(1.3, FEET, pelvis(0, -0.036), root({ roll: 2 }), bend(12, 6, 5, 16, 0, 9), LIMP, jaw(2), SHUT),
    key(1.85, SHUT),
  ],
  events: [{ t: 0.68, name: 'release' }],
};

export const RANGED: Clip[] = [ember, flamethrower, fire_spin, fire_blast, overheat, hidden_power, swift, rock_tomb, rock_slide, mud_slap, snore];
