// Torchic's status moves, from home: a fierce little scold, a fired-up puff,
// a sand kick, a retch and spit, a mirror act, a stare, a spinning dance, a
// strut, hunkering behind its wing tufts, bracing, a decoy pop, a ducking
// weave, a nap, a coy charm, a sun call, mumbling in its sleep.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, LIFT_L, LIFT_R, DROWSY, HAPPY, HOP, LAND, LEG_REST_L, LEG_REST_R, OPEN_EYES, SCRAPE_R, SHUT, STRAIN, WORRIED,
  crest, fall, jaw, key, lean, legR, pelvis, root, snap, tail, twist, wings,
} from './kit';

/**
 * Growl: a chick's fierce scolding. It rears back drawing breath, then
 * thrusts its head at the foe with the beak wide, crest up and wing tufts
 * flared, shaking its head from side to side as it cries; the beak shuts.
 */
export const growl: Clip = {
  name: 'growl',
  duration: 1.2,
  keys: [
    key(0),
    key(0.06, pelvis(0, 0.008, -0.006), lean(-5, -14), wings(12, -10), crest(3), tail(-10), ANGRY),
    snap(0.12, pelvis(0, -0.004, 0.014), lean(12, -8), wings(28, 4), crest(17, 10), tail(-16), jaw(42), ANGRY),
    key(0.26, pelvis(0, -0.016, 0.018), lean(15, -7, 11, 3), wings(16, 2), crest(16, 10), tail(-16), jaw(40), ANGRY),
    key(0.4, pelvis(0, -0.002, 0.008), lean(10, -8, -11, -3), wings(28, 4), crest(17, 10), tail(-16), jaw(42), ANGRY),
    key(0.54, pelvis(0, -0.015, 0.017), lean(14, -7, 9, 2), wings(16, 2), crest(15, 9), tail(-14), jaw(38), ANGRY),
    key(0.68, pelvis(0, -0.003, 0.007), lean(9, -6, -4, -1), wings(22, 3), crest(12, 8), tail(-12), jaw(30), ANGRY),
    key(0.84, pelvis(0, -0.004, 0.003), lean(5, -3), wings(4), crest(2), tail(-6), jaw(6), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.17, name: 'emit' }],
};

/**
 * Focus Energy: it gathers itself, crouched small with its eyes squeezed
 * shut, wing tufts folded and crest flat; then fires up: stretched tall,
 * chest out, crest standing and fanned, wing tufts flung open and fluttering
 * while the aura rises; and relaxes.
 */
export const focus_energy: Clip = {
  name: 'focus_energy',
  duration: 1.6,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.034, -0.004), lean(3, 10), wings(-14, 12), crest(-24), tail(8), STRAIN),
    key(0.36, pelvis(0, -0.04, -0.004), lean(4, 11, 0, 1.5), wings(-15, 13), crest(-26), tail(9), STRAIN),
    snap(0.48, pelvis(0, 0.012), lean(-10, -14), wings(36, -8), crest(27, 14), tail(-26), jaw(14), ANGRY),
    key(0.6, pelvis(0, 0.011), lean(-10.5, -15, 0, 1.5), wings(22, -6), crest(26, 14), tail(-25), jaw(10), ANGRY),
    key(0.72, pelvis(0, 0.012), lean(-10, -14, 0, -1.5), wings(36, -8), crest(27, 14), tail(-26), jaw(8), ANGRY),
    key(0.84, pelvis(0, 0.011), lean(-10.5, -15, 0, 1.5), wings(22, -6), crest(26, 14), tail(-25), jaw(6), ANGRY),
    key(0.98, pelvis(0, 0.012), lean(-10, -14, 0, -1), wings(32, -7), crest(27, 14), tail(-26), jaw(4), ANGRY),
    key(1.18, pelvis(0, -0.01), lean(3, 2), wings(4), crest(2, 2), tail(-4), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

/**
 * Sand-Attack: weight back onto its left foot, the right foot draws back
 * along the ground, then kicks forward low, flinging sand at the foe, and
 * stamps back down (legs have no overlap: the sand flies on the kick).
 */
export const sand_attack: Clip = {
  name: 'sand_attack',
  duration: 1.1,
  keys: [
    key(0, LEG_REST_R),
    key(0.09, pelvis(0.006, -0.014, -0.008), lean(-4, 2), wings(14, -10), tail(-8), ANGRY, SCRAPE_R),
    snap(0.17, { plantRight: 0 }, pelvis(0.007, -0.006, -0.008), lean(-10, -8, 0, 4), wings(24, 8), tail(-14), jaw(12), ANGRY,
      legR([-0.08, -0.4, 0.91], [-0.05, -0.15, 0.99])),
    key(0.28, { plantRight: 0 }, pelvis(0.006, -0.008, -0.007), lean(-8, -6, 0, 3), wings(18, 4), tail(-12), jaw(8), ANGRY,
      legR([-0.08, -0.5, 0.86], [-0.05, -0.45, 0.89])),
    key(0.42, pelvis(0, -0.018, 0.003), lean(6, 2), wings(2), ANGRY, LEG_REST_R),
    key(0.6, pelvis(0, -0.004), lean(-1, -3, 4, 3), crest(3, 3), ANGRY, LEG_REST_R),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.17, name: 'emit' }],
};

/**
 * Toxic: a retch: it hunches over, wing tufts clutched in, the belly heaving
 * twice, then it spits a glob of poison at the foe from its beak and shakes
 * its head at the taste.
 */
export const toxic: Clip = {
  name: 'toxic',
  duration: 1.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.03), lean(10, 26, 0, 4), wings(-12, 12), crest(-14), tail(6), jaw(10), STRAIN),
    key(0.26, pelvis(0, -0.022), lean(6, 18, 0, -3), wings(-10, 10), crest(-12), tail(6), jaw(4), STRAIN),
    key(0.38, pelvis(0, -0.032), lean(11, 28, 0, 4), wings(-12, 12), crest(-15), tail(6), jaw(14), STRAIN),
    // The spit.
    snap(0.48, pelvis(0, -0.004, 0.016), lean(12, -6), wings(20, -2), crest(8, 6), tail(-12), jaw(36), ANGRY),
    key(0.6, pelvis(0, -0.006, 0.016), lean(13, -5), wings(16, -2), crest(6, 6), tail(-12), jaw(30), ANGRY),
    // Yuck: a shake of the head.
    key(0.74, pelvis(0, -0.006), lean(2, -2, 10, 8), wings(6), jaw(6), STRAIN),
    key(0.86, lean(1, -2, -10, -8), wings(4), jaw(4), STRAIN),
    key(1.0, lean(0, -1, 3, 2), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'emit' }],
};

/**
 * Attract: a coy little act at the foe: its head tilts one way then the other
 * with happy eyes, the tail wagging behind, a bob and a sweet cheep.
 */
export const attract: Clip = {
  name: 'attract',
  duration: 1.3,
  keys: [
    key(0),
    key(0.12, pelvis(0.004, 0.002), lean(-2, -6, -6, 12), wings(-6, 12), tail(-10, 10), HAPPY),
    key(0.28, pelvis(-0.004, 0.006), lean(-3, -8, 6, -12), wings(16, 0), tail(-14, -12), HAPPY),
    key(0.44, pelvis(0.004, 0.002), lean(-2, -6, -6, 12), wings(-4, 10), tail(-10, 12), HAPPY),
    key(0.6, pelvis(0, -0.014), lean(2, 2), wings(4), tail(-8), HAPPY),
    key(0.74, pelvis(0, 0.008), lean(-4, -10), wings(20, -4), tail(-16), jaw(22), HAPPY),
    key(0.9, lean(-1, -4), wings(6), tail(-6), jaw(4), HAPPY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/**
 * Swagger: a cocky strut on the spot: chest puffed out, head high, two proud
 * high-stepping steps, then a taunting cheep at the foe with its tail
 * wagging.
 */
export const swagger: Clip = {
  name: 'swagger',
  duration: 1.5,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    key(0.12, pelvis(0, 0.01), lean(-10, -18), wings(20, -18), crest(10, 6), tail(-18), LEG_REST_L, LEG_REST_R, HAPPY),
    // Strut: the left foot high...
    key(0.26, { plantFeet: 1, plantLeft: 0 }, pelvis(-0.006, 0.014), lean(-11, -19, 6), wings(22, -20), crest(12, 6), tail(-18, 8), HAPPY,
      LIFT_L, LEG_REST_R),
    key(0.38, pelvis(0, 0.008), lean(-10, -18), wings(20, -18), crest(10, 6), tail(-18), LEG_REST_L, LEG_REST_R, HAPPY),
    // ...then the right.
    key(0.5, { plantFeet: 1, plantRight: 0 }, pelvis(0.006, 0.014), lean(-11, -19, -6), wings(22, -20), crest(12, 6), tail(-18, -8), HAPPY,
      LIFT_R, LEG_REST_L),
    key(0.62, pelvis(0, 0.008), lean(-10, -18), wings(20, -18), crest(10, 6), tail(-18), LEG_REST_L, LEG_REST_R, HAPPY),
    // The taunt: a cheep at the foe, the tail wagging.
    snap(0.74, pelvis(0, 0.004, 0.01), lean(6, -6, 0, 10), wings(10, 6), crest(6, 6), tail(-14, 12), jaw(26), ANGRY),
    key(0.86, pelvis(0, 0.004, 0.01), lean(6, -6, 0, -10), wings(10, 6), crest(6, 6), tail(-14, -12), jaw(20), ANGRY),
    key(0.98, pelvis(0, 0.002), lean(2, -4, 0, 6), wings(6), tail(-10, 10), jaw(4), HAPPY, LEG_REST_L, LEG_REST_R),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'emit' }],
};

/**
 * Mimic: it stares hard at the foe, the head cocking one way, then the
 * other, studying it, the eyes narrowing; then it nods sharply, got it.
 */
export const mimic: Clip = {
  name: 'mimic',
  duration: 1.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, 0.004, 0.01), lean(8, -2, 0, 14), wings(-4, 6), crest(4, 4), DROWSY),
    key(0.36, pelvis(0, 0.004, 0.012), lean(9, -2, 0, 16), wings(-4, 6), crest(4, 4), DROWSY),
    key(0.52, pelvis(0, 0.004, 0.01), lean(8, -2, 0, -14), wings(-4, 6), crest(4, 4), DROWSY),
    key(0.7, pelvis(0, 0.004, 0.012), lean(9, -2, 0, -16), wings(-4, 6), crest(4, 4), DROWSY),
    // Got it: a sharp nod.
    snap(0.8, pelvis(0, -0.012, 0.012), lean(10, 18), wings(16, -4), crest(-6), ANGRY),
    key(0.9, pelvis(0, 0.004), lean(-2, -8), wings(20, -4), crest(8, 6), jaw(14), ANGRY),
    key(1.06, lean(0, -2), wings(4), jaw(2), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'emit' }],
};

/**
 * Mirror Move: it watches the foe, then copies it with a showy little act: a
 * hop, a flap of both wing tufts high and a proud chirp, fired up.
 */
export const mirror_move: Clip = {
  name: 'mirror_move',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, 0.004, 0.008), lean(6, -4, 10, 8), wings(-2, 6), DROWSY),
    key(0.36, pelvis(0, 0.004, 0.008), lean(6, -4, -10, -8), wings(-2, 6), DROWSY),
    key(0.46, pelvis(0, -0.022), lean(6, 10), wings(-8, -10), crest(-10), ANGRY),
    // A hop and a big flap.
    snap(0.56, root({ y: 0.08 }), HOP, lean(-8, -14), wings(46, -10), crest(18, 10), tail(-22), jaw(20), ANGRY),
    key(0.64, root({ y: 0.09 }), HOP, lean(-8, -14), wings(20, 8), crest(18, 10), tail(-22), jaw(24), ANGRY),
    key(0.72, root({ y: 0.07 }), HOP, lean(-8, -14), wings(44, -8), crest(18, 10), tail(-22), jaw(20), ANGRY),
    fall(0.82, LAND, lean(2, 2), wings(12), crest(6, 6), jaw(4), ANGRY),
    key(0.98, pelvis(0, -0.004), lean(-2, -6, 4, 4), wings(20, -4), crest(8, 6), HAPPY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'aura' }],
};

/**
 * Swords Dance: a war dance. It spins round on the spot in two quick hops,
 * wing tufts flung out, then stamps and strikes a proud pose, crest up,
 * beak raised, as the aura rises.
 */
export const swords_dance: Clip = {
  name: 'swords_dance',
  duration: 1.7,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(4, 8), wings(-6, -10), crest(-8), ANGRY),
    snap(0.24, root({ y: 0.08, yaw: 120 }), HOP, lean(-4, -8), wings(40, -4), crest(10, 8), tail(-18), ANGRY),
    key(0.34, root({ y: 0.02, yaw: 180 }), HOP, lean(-2, -4), wings(30, 4), crest(8, 8), tail(-16), ANGRY),
    snap(0.44, root({ y: 0.08, yaw: 300 }), HOP, lean(-4, -8), wings(40, -4), crest(10, 8), tail(-18), ANGRY),
    fall(0.54, root({ yaw: 360 }), LAND, lean(6, 4), wings(20, 10), crest(4, 6), ANGRY),
    // The pose.
    snap(0.64, root({ yaw: 360 }), pelvis(0, 0.014), lean(-12, -22), wings(42, -12), crest(28, 14), tail(-26), jaw(24), ANGRY),
    key(0.84, root({ yaw: 360 }), pelvis(0, 0.015), lean(-12, -23, 0, 2), wings(40, -10), crest(28, 14), tail(-26), jaw(18), ANGRY),
    key(1.04, root({ yaw: 360 }), pelvis(0, 0.014), lean(-11, -22, 0, -2), wings(42, -12), crest(27, 14), tail(-26), jaw(10), ANGRY),
    key(1.24, root({ yaw: 360 }), pelvis(0, -0.006), lean(2, 0), wings(6), crest(2), ANGRY),
    key(1.7, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/**
 * Sleep Talk: asleep on its feet, it mumbles: the beak works, the head bobs,
 * then a sleepy flutter of its wing tufts as the move comes out, and it
 * droops again.
 */
export const sleep_talk: Clip = {
  name: 'sleep_talk',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.028, -0.008), lean(3, 14, 0, 8), wings(-10, 6), crest(-12), SHUT),
    key(0.32, pelvis(0, -0.026, -0.008), lean(3, 12, 0, 8), wings(-10, 6), crest(-12), jaw(12), SHUT),
    key(0.42, pelvis(0, -0.028, -0.008), lean(3, 14, 0, 7), wings(-10, 6), crest(-12), jaw(2), SHUT),
    key(0.52, pelvis(0, -0.026, -0.008), lean(3, 12, 0, 8), wings(-10, 6), crest(-12), jaw(14), SHUT),
    // A sleepy flutter.
    key(0.66, pelvis(0, -0.014), lean(-2, 4, 0, 6), wings(28, -4), crest(-6), jaw(6), SHUT),
    key(0.76, pelvis(0, -0.016), lean(-2, 4, 0, 6), wings(4, 4), crest(-6), jaw(2), SHUT),
    key(0.86, pelvis(0, -0.014), lean(-2, 4, 0, 6), wings(26, -4), crest(-6), SHUT),
    key(1.04, pelvis(0, -0.03, -0.008), lean(3, 14, 0, 9), wings(-10, 6), crest(-12), SHUT),
    key(1.6, SHUT),
  ],
  events: [{ t: 0.68, name: 'aura' }],
};

/**
 * Protect: it hunkers down behind its wing tufts, swept forward over its
 * chest, with its eyes squeezed shut and its crest flat, trembling a little;
 * then pops back up.
 */
export const protect: Clip = {
  name: 'protect',
  duration: 1.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.04, -0.006), lean(4, 5), wings(-6, 30), crest(-30), tail(10), STRAIN),
    key(0.28, pelvis(0.005, -0.044, -0.006), lean(5, 6, 0, 1.5), wings(-8, 34), crest(-33), tail(11), STRAIN),
    key(0.38, pelvis(-0.005, -0.04, -0.006), lean(4, 5, 0, -1.5), wings(-7, 33), crest(-32), tail(10), STRAIN),
    key(0.48, pelvis(0.005, -0.045, -0.006), lean(5, 6, 0, 1.5), wings(-8, 34), crest(-33), tail(11), STRAIN),
    key(0.58, pelvis(-0.005, -0.041, -0.006), lean(4, 5, 0, -1.5), wings(-7, 33), crest(-32), tail(10), STRAIN),
    key(0.68, pelvis(0.005, -0.045, -0.007), lean(5, 6, 0, 1.5), wings(-8, 34), crest(-33), tail(11), STRAIN),
    key(0.8, pelvis(-0.004, -0.041, -0.006), lean(4, 5, 0, -1), wings(-7, 33), crest(-32), tail(10), STRAIN),
    key(0.92, pelvis(0.002, -0.043, -0.006), lean(4, 5, 0, 0.5), wings(-7, 33), crest(-32), tail(10), STRAIN),
    // Peeks out and pops back up.
    key(1.08, pelvis(0, -0.012), lean(0, -4), wings(8, 6), crest(1), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'aura' }],
};

/**
 * Endure: it braces: feet dug in wide, body low and leaning into the foe,
 * wing tufts flung back, beak clenched, trembling with the effort; it holds,
 * then straightens with a defiant chirp.
 */
export const endure: Clip = {
  name: 'endure',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.034, 0.006), lean(14, 16), wings(20, -30), crest(-20), tail(-14), STRAIN),
    key(0.3, pelvis(0.004, -0.038, 0.008), lean(15, 17, 0, 2), wings(22, -32), crest(-22), tail(-15), STRAIN),
    key(0.42, pelvis(-0.004, -0.038, 0.008), lean(15, 17, 0, -2), wings(22, -32), crest(-22), tail(-15), STRAIN),
    key(0.54, pelvis(0.004, -0.04, 0.008), lean(16, 18, 0, 2), wings(22, -32), crest(-22), tail(-15), STRAIN),
    key(0.66, pelvis(-0.004, -0.038, 0.008), lean(15, 17, 0, -2), wings(22, -32), crest(-22), tail(-15), STRAIN),
    key(0.8, pelvis(0.003, -0.04, 0.008), lean(16, 18, 0, 1), wings(22, -32), crest(-22), tail(-15), STRAIN),
    // A defiant chirp.
    snap(0.94, pelvis(0, 0.008), lean(-6, -14), wings(26, -6), crest(14, 8), tail(-16), jaw(28), ANGRY),
    key(1.08, pelvis(0, 0.004), lean(-3, -8), wings(12), crest(8, 6), jaw(8), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.2, name: 'aura' }],
};

/**
 * Substitute: it screws its eyes shut and curls up small, wing tufts over
 * its head, and with a pop it springs aside (the decoy takes its place),
 * wing tufts flung up.
 */
export const substitute: Clip = {
  name: 'substitute',
  duration: 1.4,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.04, -0.004), lean(8, 24), wings(20, 34), crest(-34), tail(12), STRAIN),
    key(0.34, pelvis(0, -0.044, -0.004), lean(9, 26, 0, 2), wings(22, 36), crest(-36), tail(12), STRAIN),
    // Pop: it springs aside.
    snap(0.44, root({ x: 0.1, y: 0.08 }), HOP, lean(-6, -12), wings(44, -10), crest(16, 10), tail(-20), jaw(24), WORRIED),
    fall(0.56, root({ x: 0.12 }), LAND, lean(4, 2), wings(16), crest(6, 6), jaw(6), WORRIED),
    key(0.74, root({ x: 0.12 }), LAND, pelvis(0, 0.012), lean(0, -4, -8), wings(8), ANGRY),
    snap(0.9, root({ x: 0.06, y: 0.05 }), HOP, lean(-2, -4), wings(16), ANGRY),
    fall(1.0, LAND, ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'aura' }],
};

/**
 * Double Team: it ducks and weaves from side to side on the spot, quick as a
 * chick, wing tufts up; the game's afterimages swing out on both sides from
 * the aura.
 */
export const double_team: Clip = {
  name: 'double_team',
  duration: 1.3,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.02), lean(2, 4), wings(16, -6), ANGRY),
    key(0.2, pelvis(0.02, -0.014), lean(0, 0, -8, 6), twist(0, -14), wings(28, -6), ANGRY),
    key(0.32, pelvis(-0.02, -0.014), lean(0, 0, 8, -6), twist(0, 14), wings(28, -6), ANGRY),
    key(0.44, pelvis(0.02, -0.014), lean(0, 0, -8, 6), twist(0, -14), wings(28, -6), ANGRY),
    key(0.56, pelvis(-0.02, -0.014), lean(0, 0, 8, -6), twist(0, 14), wings(28, -6), ANGRY),
    key(0.7, pelvis(0, -0.016), lean(1, 2), wings(10), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Rest: a big yawn, then it settles down onto its bottom and dozes off, head
 * drooping to one side and breathing slowly while it heals; it wakes
 * refreshed.
 */
export const rest: Clip = {
  name: 'rest',
  duration: 1.9,
  keys: [
    key(0),
    key(0.26, pelvis(0, 0.006), lean(-5, -18), wings(14, -4), jaw(30), SHUT),
    key(0.44, pelvis(0, 0.004), lean(-4, -16, 0, 4), wings(10, -2), jaw(26), SHUT),
    key(0.72, pelvis(0, -0.062, -0.016), lean(5, 19, 0, 10), wings(-14, 8), crest(-15), tail(6), SHUT),
    key(0.92, pelvis(0, -0.046, -0.014), lean(1, 15, 0, 11), wings(-11, 8), crest(-13), tail(5), SHUT),
    key(1.12, pelvis(0, -0.062, -0.016), lean(5, 19, 0, 12), wings(-14, 8), crest(-15), tail(6), SHUT),
    key(1.3, pelvis(0, -0.048, -0.014), lean(2, 16, 0, 11), wings(-12, 8), crest(-14), tail(5), SHUT),
    key(1.5, pelvis(0, -0.01), lean(0, -6), wings(10), crest(2), tail(-6), OPEN_EYES),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'aura' }],
};

/**
 * Sunny Day: a fire type calling the sun. It dips with its eyes shut, then
 * rises with its face turned up to the sky, beak open and wing tufts spread,
 * chirping up at it; it comes back down, content.
 */
export const sunny_day: Clip = {
  name: 'sunny_day',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.02), lean(3, 8), wings(-8, 6), crest(-9), SHUT),
    key(0.42, pelvis(0, 0.012), lean(-8, -24), wings(34, -4), crest(26, 12), tail(-20), jaw(30), HAPPY),
    key(0.6, pelvis(0.012, 0.006), lean(-9, -25, 5, 4), twist(0, -5), wings(20, -2), crest(26, 12), tail(-20), jaw(34), HAPPY),
    key(0.78, pelvis(-0.012, 0.012), lean(-8, -24, -5, -4), twist(0, 5), wings(34, -4), crest(27, 12), tail(-21), jaw(30), HAPPY),
    key(0.96, pelvis(0.006, 0.006), lean(-8, -23, 2, 1), twist(0, -2), wings(22, -2), crest(24, 12), tail(-20), jaw(20), HAPPY),
    key(1.16, pelvis(0, -0.006), lean(2, 0), wings(4), crest(2), tail(-4), jaw(2), HAPPY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'aura' }],
};

export const STATUS: Clip[] = [
  growl, focus_energy, sand_attack, toxic, attract, swagger, mimic, mirror_move, swords_dance, sleep_talk,
  protect, endure, substitute, double_team, rest, sunny_day,
];
