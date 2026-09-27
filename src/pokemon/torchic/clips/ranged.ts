// Torchic's ranged moves, from home: fire brought up from its belly and out
// of its beak (a hunch or a swell, then the head thrusts forward), a spiral
// of fire, a burst from its whole body, orbs pushed from its beak, stars and
// rocks flung with its wing tufts (the `throw` emitter), rocks called up with
// a stamp, mud flicked with its beak, a snore. The head trails the body by
// 0.045 s and the wing tufts a little more: a release comes that much after
// the snap that causes it. The game's effects leave early: its spits come
// quickly after a short gather.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, DROWSY, HAPPY, HOP, LAND, LAND_DEEP, OPEN_EYES, SHUT, STRAIN,
  crest, fall, jaw, key, lean, pelvis, root, snap, tail, twist, wings,
} from './kit';

/**
 * Ember: the fire comes up from its belly: a quick hunch as it forms, then
 * the head thrusts forward, the face up at the foe, and the beak spits it
 * (the game's embers leave at once); a recoil bob back and up, and it
 * settles.
 */
export const ember: Clip = {
  name: 'ember',
  duration: 0.92,
  keys: [
    key(0),
    // The fire rises: a hunch, the belly heaving.
    key(0.1, pelvis(0, -0.024, -0.008), lean(8, 16), wings(-8, 10), crest(-12), tail(6), ANGRY),
    // Spat: a sharp thrust of the head, beak wide, held while the embers fly.
    snap(0.16, pelvis(0, -0.002, 0.016), lean(11, -8), wings(22, -6), crest(14, 6), tail(-14), jaw(38), ANGRY),
    key(0.27, pelvis(0, -0.004, 0.017), lean(12, -7), wings(16, -4), crest(12, 6), tail(-14), jaw(34), ANGRY),
    // Recoil: the head bobs back and up as the beak closes.
    key(0.39, pelvis(0, 0.002, -0.004), lean(-2, -13), wings(10), crest(11), tail(-8), jaw(12), ANGRY),
    key(0.55, pelvis(0, -0.006), lean(2, 1), jaw(2), ANGRY),
    key(0.92, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'release' }],
};

/**
 * Flamethrower: a quick breath with the chest up and the eyes shut, then the
 * head drives forward and a stream of fire pours from the beak in pumping
 * gushes while the head sweeps across the foe; the beak shuts and it shakes
 * off the heat.
 */
export const flamethrower: Clip = {
  name: 'flamethrower',
  duration: 2.0,
  keys: [
    key(0),
    key(0.12, pelvis(0, 0.008, -0.006), lean(-6, -16), wings(14, -10), crest(3), tail(-10), jaw(4), SHUT),
    snap(0.2, pelvis(0, -0.016, 0.012), lean(14, -6), wings(22, 4), crest(6, 6), tail(-14), jaw(38), ANGRY),
    // The stream gushes in bursts: the body pumps with each while the head sweeps.
    key(0.32, pelvis(0, -0.008, 0.006), lean(11, -7, 3), wings(20, 3), crest(6, 6), tail(-14), jaw(34), ANGRY),
    key(0.44, pelvis(0, -0.02, 0.014), lean(15, -7, 6), wings(22, 4), crest(6, 6), tail(-14), jaw(38), ANGRY),
    key(0.56, pelvis(0, -0.008, 0.006), lean(11, -6, 1, -1), wings(20, 3), crest(6, 6), tail(-14), jaw(35), ANGRY),
    key(0.68, pelvis(0, -0.02, 0.014), lean(15, -6, -6, -2), wings(22, 4), crest(6, 6), tail(-14), jaw(38), ANGRY),
    key(0.8, pelvis(0, -0.008, 0.006), lean(11, -7, -1), wings(20, 3), crest(6, 6), tail(-14), jaw(35), ANGRY),
    key(0.92, pelvis(0, -0.02, 0.014), lean(15, -7, 5, 1), wings(22, 4), crest(6, 6), tail(-14), jaw(38), ANGRY),
    key(1.06, pelvis(0, -0.01, 0.008), lean(12, -6, -2), wings(21, 3), crest(6, 6), tail(-13), jaw(35), ANGRY),
    // The beak shuts; the head comes up and shakes off the heat.
    key(1.24, pelvis(0, -0.008, 0.004), lean(4, -8, 6), wings(8), crest(2), tail(-6), jaw(4), ANGRY),
    key(1.4, pelvis(0, -0.004), lean(1, -3, -6, -3), ANGRY),
    key(1.56, lean(0, -1, 3, 1), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.02, name: 'charge' }, { t: 0.25, name: 'release' }, { t: 1.12, name: 'releaseEnd' }],
};

/**
 * Fire Spin: it breathes out a spiral: the head circles round and round as
 * the fire pours, the whole round body swaying in a circle with it and the
 * wing tufts flapping to keep its balance; it ends dizzy for a moment.
 */
export const fire_spin: Clip = {
  name: 'fire_spin',
  duration: 1.9,
  keys: [
    key(0),
    key(0.12, pelvis(0, 0.006), lean(-4, -12), wings(12, -8), crest(2), jaw(4), SHUT),
    snap(0.2, pelvis(0, -0.012, 0.01), lean(10, -6, 10, 6), wings(24, 2), crest(6, 6), tail(-12), jaw(36), ANGRY),
    // The circles: the head and body go round, left, up, right, down.
    key(0.34, pelvis(0.012, -0.006, 0.008), lean(8, -12, 14, 10), twist(8, -6), wings(28, -2), crest(8, 6), tail(-12, 10), jaw(38), ANGRY),
    key(0.48, pelvis(0, 0.006, 0.006), lean(4, -16, 0, 0), twist(0, 0), wings(20, 4), crest(8, 6), tail(-14), jaw(36), ANGRY),
    key(0.62, pelvis(-0.012, -0.006, 0.008), lean(8, -12, -14, -10), twist(-8, 6), wings(28, -2), crest(8, 6), tail(-12, -10), jaw(38), ANGRY),
    key(0.76, pelvis(0, -0.018, 0.012), lean(14, -2, 0, 0), wings(18, 6), crest(6, 6), tail(-12), jaw(36), ANGRY),
    key(0.9, pelvis(0.012, -0.006, 0.008), lean(8, -12, 14, 10), twist(8, -6), wings(28, -2), crest(8, 6), tail(-12, 10), jaw(38), ANGRY),
    key(1.04, pelvis(0, 0.006, 0.006), lean(4, -16, 0, 0), wings(20, 4), crest(8, 6), tail(-14), jaw(36), ANGRY),
    key(1.18, pelvis(-0.012, -0.006, 0.008), lean(8, -12, -14, -10), twist(-8, 6), wings(28, -2), crest(8, 6), tail(-12, -10), jaw(34), ANGRY),
    // The beak shuts; a dizzy wobble.
    key(1.34, pelvis(0.006, -0.01), lean(4, 2, 8, 8), wings(6), crest(2), jaw(4), DROWSY),
    key(1.5, pelvis(-0.004, -0.006), lean(2, 0, -6, -6), wings(4), DROWSY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.02, name: 'charge' }, { t: 0.25, name: 'release' }, { t: 1.24, name: 'releaseEnd' }],
};

/**
 * Fire Blast: it gathers the fire in its belly, curled small with its eyes
 * squeezed shut, swells up tall with its wing tufts flung wide and its crest
 * standing, then blasts it from the beak with the head thrust forward; the
 * recoil pushes it back and it holds with a tremor, then sags and shakes it
 * off.
 */
export const fire_blast: Clip = {
  name: 'fire_blast',
  duration: 2.0,
  keys: [
    key(0),
    key(0.26, pelvis(0, -0.034, -0.004), lean(3, 10), wings(-14, 12), crest(-21), tail(8), STRAIN),
    key(0.4, pelvis(0, -0.038, -0.004), lean(4, 11, 0, 1.5), wings(-15, 13), crest(-22), tail(9), STRAIN),
    // Swells up.
    key(0.6, pelvis(0, 0.012), lean(-10, -16), wings(34, -8), crest(26, 12), tail(-24), jaw(6), ANGRY),
    key(0.72, pelvis(0, 0.013), lean(-11, -17, 0, 1.5), wings(36, -8), crest(27, 12), tail(-25), jaw(8), ANGRY),
    // The blast: the head drives forward at the foe, beak wide; the body braces.
    snap(0.82, pelvis(0, -0.022, 0.012), lean(14, -6), wings(30, 8), crest(18, 12), tail(-20), jaw(40), ANGRY),
    // Recoil: pushed back, straining against it.
    key(0.98, pelvis(0, -0.026, -0.004), lean(8, -10, 3), wings(28, 4), crest(20, 12), tail(-18), jaw(38), ANGRY),
    key(1.14, pelvis(0, -0.028, -0.006), lean(7, -11, -3, 1), wings(30, 4), crest(19, 11), tail(-18), jaw(36), ANGRY),
    // The beak shuts, it sags and shakes it off.
    key(1.32, pelvis(0, -0.022), lean(4, 6), wings(4), crest(1), tail(-6), jaw(4), DROWSY),
    key(1.52, pelvis(0, -0.012), lean(1, 0, 6, 3), ANGRY),
    key(1.68, pelvis(0, -0.006), lean(0, -2, -4, -2), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.08, name: 'charge' }, { t: 0.87, name: 'release' }],
};

/**
 * Overheat: everything it has. It curls up tight and trembles as the heat
 * builds, then bursts open, wing tufts flung wide, crest up, head thrown
 * back, and the fire erupts off its whole body; then it droops, spent,
 * panting with its wing tufts hanging.
 */
export const overheat: Clip = {
  name: 'overheat',
  duration: 2.1,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.04, -0.004), lean(6, 16), wings(-16, 14), crest(-26), tail(10), STRAIN),
    key(0.32, pelvis(0.003, -0.044, -0.004), lean(7, 17, 0, 2), wings(-17, 15), crest(-27), tail(10), STRAIN),
    key(0.42, pelvis(-0.003, -0.044, -0.004), lean(7, 17, 0, -2), wings(-17, 15), crest(-27), tail(10), STRAIN),
    key(0.52, pelvis(0.003, -0.046, -0.004), lean(8, 18, 0, 2), wings(-18, 15), crest(-28), tail(11), STRAIN),
    // Bursts open: the fire erupts off its whole body.
    snap(0.62, pelvis(0, 0.016), lean(-14, -30), wings(44, -14), crest(30, 16), tail(-28), jaw(40), ANGRY),
    key(0.78, pelvis(0, 0.018), lean(-15, -32, 0, 2), wings(46, -14), crest(31, 16), tail(-28), jaw(42), ANGRY),
    key(0.94, pelvis(0, 0.016), lean(-14, -30, 0, -2), wings(44, -12), crest(30, 16), tail(-28), jaw(38), ANGRY),
    // Spent: it droops, panting.
    key(1.14, pelvis(0, -0.03), lean(8, 18, 0, 6), wings(-16, 6), crest(-18), tail(8), jaw(20), DROWSY),
    key(1.3, pelvis(0, -0.026), lean(7, 16, 0, 5), wings(-16, 6), crest(-17), tail(8), jaw(8), DROWSY),
    key(1.46, pelvis(0, -0.03), lean(8, 18, 0, 6), wings(-16, 6), crest(-18), tail(8), jaw(20), DROWSY),
    key(1.66, pelvis(0, -0.012), lean(2, 4), wings(-4), crest(-4), jaw(4), ANGRY),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.66, name: 'release' }],
};

/**
 * Hidden Power: it bows its head and goes still while the orbs of light
 * gather round it (charge), then whips its head up and forward with the beak
 * open, and the orbs fly at the foe from it.
 */
export const hidden_power: Clip = {
  name: 'hidden_power',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.02), lean(6, 26), wings(-8, 14), crest(-14), tail(6), SHUT),
    key(0.46, pelvis(0, -0.022), lean(7, 28, 0, 2), wings(-10, 16), crest(-16), tail(6), SHUT),
    key(0.62, pelvis(0, -0.024), lean(8, 30, 0, -2), wings(-10, 16), crest(-17), tail(7), SHUT),
    // The whip: up and forward, the beak open.
    snap(0.72, pelvis(0, 0.006, 0.014), lean(8, -14), wings(30, -4), crest(16, 10), tail(-18), jaw(34), ANGRY),
    key(0.84, pelvis(0, 0.004, 0.014), lean(9, -12, 2), wings(24, -2), crest(14, 10), tail(-16), jaw(28), ANGRY),
    key(1.0, pelvis(0, -0.006), lean(2, -2), wings(6), crest(2), jaw(4), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.77, name: 'release' }],
};

/**
 * Swift: it winds up with its wing tufts drawn back and up and its body
 * turned, then whips round and flaps them forward hard, twice, bobbing with
 * each flap, flinging the stars from them.
 */
export const swift: Clip = {
  name: 'swift',
  duration: 1.1,
  keys: [
    key(0),
    key(0.08, pelvis(0, -0.014, -0.006), lean(-6, -6), twist(14, 4), wings(34, -30), crest(3), tail(-8), ANGRY),
    snap(0.15, pelvis(0, 0.004, 0.012), lean(10, -8), twist(-14, -4), wings(38, 34), crest(6, 6), tail(-12), jaw(18), ANGRY),
    key(0.25, pelvis(0, -0.012, 0.004), lean(4, -4), twist(8, 3), wings(28, -24), crest(4, 5), tail(-10), jaw(10), ANGRY),
    key(0.35, pelvis(0, 0.004, 0.012), lean(10, -8), twist(-10, -3), wings(36, 30), crest(6, 6), tail(-11), jaw(14), ANGRY),
    key(0.46, pelvis(0, -0.01), lean(4, -2), wings(12, 4), crest(2), tail(-6), jaw(4), ANGRY),
    key(0.62, lean(1, -2), wings(4), ANGRY),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.21, name: 'release' }],
};

/**
 * Rock Tomb: a hop up and a hard two-footed stamp that calls the rocks up
 * round the foe; it lands deep, wing tufts flung out, and glares at them
 * rising (the rocks leave with the stamp).
 */
export const rock_tomb: Clip = {
  name: 'rock_tomb',
  duration: 1.35,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03), lean(6, 10), wings(-6, -10), crest(-12), ANGRY),
    // Up...
    snap(0.24, root({ y: 0.12 }), HOP, lean(-8, -10), wings(34, -10), crest(10, 8), tail(-20), ANGRY),
    // ...and the stamp.
    fall(0.34, LAND_DEEP, pelvis(0, -0.02), lean(10, 6), wings(28, 16), crest(-6, 6), tail(-8), jaw(24), ANGRY),
    key(0.46, LAND_DEEP, pelvis(0, -0.022), lean(10, 6), wings(24, 14), crest(-8, 6), tail(-8), jaw(18), ANGRY),
    key(0.64, LAND, pelvis(0, -0.006), lean(2, -4), wings(10), crest(2, 4), jaw(4), ANGRY),
    key(0.84, pelvis(0, -0.004), lean(0, -2, 5, 3), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'release' }],
};

/**
 * Rock Slide: it rises on tiptoe with its wing tufts raised high, heaving,
 * then brings them down hard with a bob of its whole body and a squawk: the
 * rocks come tumbling down on the foe.
 */
export const rock_slide: Clip = {
  name: 'rock_slide',
  duration: 1.4,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.02), lean(4, 8), wings(-8, 8), crest(-8), ANGRY),
    // Heaving up on tiptoe, the wing tufts high.
    key(0.3, pelvis(0, 0.02), lean(-10, -22), wings(46, -6), crest(18, 10), tail(-22), jaw(10), ANGRY),
    key(0.42, pelvis(0, 0.022), lean(-11, -24, 0, 2), wings(48, -6), crest(19, 10), tail(-23), jaw(12), ANGRY),
    // Down hard, the whole body bobbing into it.
    snap(0.5, pelvis(0, -0.03, 0.01), lean(14, 10), wings(-10, 20), crest(-18, 6), tail(-8), jaw(30), ANGRY),
    key(0.62, pelvis(0, -0.032, 0.01), lean(15, 11), wings(-12, 20), crest(-20, 6), tail(-8), jaw(20), ANGRY),
    key(0.82, pelvis(0, -0.008), lean(2, -2), wings(6), crest(2), jaw(4), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'release' }],
};

/**
 * Mud-Slap: it pecks up a beakful of mud off the ground and flings it at the
 * foe with a flick of its head (the mud leaves the beak), then shakes its
 * head clean.
 */
export const mud_slap: Clip = {
  name: 'mud_slap',
  duration: 1.2,
  keys: [
    key(0),
    // Down to the ground: a peck at the mud.
    key(0.14, pelvis(0, -0.03, 0.01), lean(24, 54), wings(12, -12), crest(-20), tail(-12), jaw(20), ANGRY),
    key(0.24, pelvis(0, -0.03, 0.01), lean(26, 58), wings(12, -12), crest(-22), tail(-12), jaw(2), ANGRY),
    // Up, the head drawn back with it...
    key(0.36, pelvis(0, 0.006, -0.006), lean(-8, -24, 10), wings(24, -10), crest(8, 6), tail(-16), jaw(2), ANGRY),
    // ...and the flick: the head whips forward, the beak opens.
    snap(0.44, pelvis(0, -0.006, 0.014), lean(12, -2, -6), wings(20, 8), crest(-6, 6), tail(-14), jaw(32), ANGRY),
    key(0.54, pelvis(0, -0.008, 0.014), lean(13, -1, -8), wings(18, 8), crest(-8, 6), tail(-14), jaw(24), ANGRY),
    // A shake of the head, clean.
    key(0.68, pelvis(0, -0.004), lean(2, -4, 10, 6), wings(8), jaw(4), ANGRY),
    key(0.78, lean(1, -3, -10, -6), wings(6), ANGRY),
    key(0.9, lean(0, -1, 4, 2), HAPPY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'release' }],
};

/**
 * Snore: asleep on its feet, eyes shut and head drooping, it snores twice:
 * the head tips back with the beak open and the body swells, then droops
 * again; it wakes with a start.
 */
export const snore: Clip = {
  name: 'snore',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.03, -0.008), lean(3, 14, 0, 8), wings(-10, 6), crest(-12), SHUT),
    key(0.42, pelvis(0, -0.018, -0.01), lean(-4, -14, 0, 4), wings(6, -2), crest(-3), jaw(26), SHUT),
    key(0.62, pelvis(0, -0.032, -0.008), lean(3, 14, 0, 9), wings(-10, 6), crest(-12), jaw(2), SHUT),
    key(0.86, pelvis(0, -0.018, -0.01), lean(-4, -14, 0, 4), wings(6, -2), crest(-3), jaw(26), SHUT),
    key(1.06, pelvis(0, -0.032, -0.008), lean(3, 14, 0, 9), wings(-10, 6), crest(-12), jaw(2), SHUT),
    key(1.3, pelvis(0, -0.008), lean(-1, -4), wings(8), crest(2), OPEN_EYES),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'release' }, { t: 0.9, name: 'release' }],
};

export const RANGED: Clip[] = [ember, flamethrower, fire_spin, fire_blast, overheat, hidden_power, swift, rock_tomb, rock_slide, mud_slap, snore];
