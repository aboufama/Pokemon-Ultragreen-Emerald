// Mightyena's clips for the moves it performs from home, in the style of the
// first clips (./set.ts has the helpers, the moments and its blows): the orb
// and the beam from its jaws, the snore, the forepaw's flick of mud; its
// howl, its snarl, the dirt its hind paws kick back, its swagger, its guard,
// its rest, its call to the sky, its shake and its darting afterimages.
// Ranged moves: a breath in or a gather, a snap, the release with a moving
// hold, a recoil, a settle. Nothing rises far: from our side the foe's
// healthbox is just above its ears.

import type { Clip } from '../../anim/clip';
import {
  ANGRY, AIR, GROUNDED, HAPPY, HURT, LAND_HOME, LOOK, MENACE, NARROW, OPEN_EYES, REARED, SHUT, TUCK,
  bend, ears, foreleg, hackles, jaw, key, legs, pelvis, root, rump, shake, snap, tail, twist,
} from './set';

/**
 * Shadow Ball, Hidden Power (special_weak: the orb, after Blaziken's
 * special_weak): it drops its head and draws it back, jaws parted, while the
 * dark orb gathers in them (charge), trembling with it; then the head whips
 * forward and up and hurls it (release), bobs back with the recoil and
 * settles.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.5,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), bend(2, 0, 8, 0), MENACE),
    // Gathering the orb in its jaws, head low and drawn back.
    key(0.38, pelvis(0, -0.065, -0.035), bend(7, 1, 28, -10), jaw(22), MENACE, tail(12)),
    key(0.54, pelvis(0, -0.07, -0.04), bend(8, 1, 30, -11, 0, 2), jaw(24), MENACE, tail(14)),
    // The hurl: the head whips forward and up.
    snap(0.64, pelvis(0, -0.015, 0.05), bend(-6, -1, -10, -22), jaw(30), MENACE, tail(20)),
    // Recoil: the head bobs back as the jaws close.
    key(0.8, pelvis(0, -0.02, 0.02), bend(-1, 0, 2, -8), jaw(10), MENACE, tail(12)),
    key(1.0, pelvis(0, -0.01), bend(1, 0, 2, -2), jaw(2), ANGRY, tail(6)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'charge' }, { t: 0.7, name: 'release' }],
};

/**
 * Hyper Beam (special_strong: the beam, after Blaziken's special_strong): it
 * settles, then draws the power in with its head reared back and eyes shut,
 * swelling with it; drops into a low brace and drives its head forward at
 * the foe, jaws wide, and fires, the recoil pushing it back while it holds
 * the beam trembling; the jaws close and it sags, spent.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(2, 0, 4, 2)),
    // Drawing the power in: head reared back, chest out, eyes shut.
    key(0.5, pelvis(0, -0.03, -0.03), bend(-4, -1, -12, -16), jaw(8), hackles(18), ears(-10), tail(16), SHUT),
    key(0.66, pelvis(0, -0.032, -0.035), bend(-5, -1, -13, -18, 0, 2), jaw(10), hackles(22), ears(-12), tail(18), SHUT),
    // Fire: braced low, the head driven forward at the foe, jaws wide.
    snap(0.78, pelvis(0, -0.07, 0.035), bend(8, 2, 16, -8), jaw(30), MENACE, ears(-30), tail(22)),
    // Holding the beam against its recoil, trembling.
    key(1.0, pelvis(0, -0.068, 0.02), bend(7, 2, 15, -7, 4), jaw(29), MENACE, ears(-30), tail(22)),
    key(1.22, pelvis(0, -0.072, 0.012), bend(8, 2, 16, -8, -3, -2), jaw(31), MENACE, ears(-30), tail(21)),
    key(1.44, pelvis(0, -0.068, 0.004), bend(7, 2, 15, -7, 3, 1), jaw(29), MENACE, ears(-30), tail(20)),
    key(1.62, pelvis(0, -0.07, 0), bend(8, 2, 16, -8), jaw(28), MENACE, ears(-28), tail(18)),
    // The jaws close; spent, it sags, panting.
    key(1.8, pelvis(0, -0.06, -0.01), bend(8, 2, 18, 6), jaw(8), hackles(4), ears(-12), tail(4), NARROW),
    key(2.0, pelvis(0, -0.05, -0.008), bend(6, 2, 14, 4, 0, 2), jaw(12), ears(-10), tail(2), NARROW),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Snore (sound): asleep on its feet, slumped and eyes shut, it draws a long
 * breath that lifts its chest, then a huge snore blasts out with its head
 * thrown forward and its jaws wide (release), shuddering; the head droops
 * again and it sways back up, still drowsy.
 */
const sound: Clip = {
  name: 'sound',
  duration: 1.9,
  keys: [
    key(0),
    // Slumped, asleep.
    key(0.24, pelvis(0, -0.07, -0.02), bend(6, 2, 30, 12), ears(-10), tail(-8), SHUT),
    // A long breath in.
    key(0.52, pelvis(0, -0.06, -0.03), bend(2, 0, 20, 2), jaw(-2), ears(-8), tail(-4), SHUT),
    key(0.64, pelvis(0, -0.058, -0.032), bend(1, 0, 18, 0, 0, 2), jaw(-2), ears(-8), tail(-2), SHUT),
    // The snore: head thrown forward, jaws wide.
    snap(0.74, pelvis(0, -0.06, 0.025), bend(6, 1, 8, -18), jaw(33), ears(-16), tail(6), SHUT),
    key(0.9, pelvis(0, -0.062, 0.022), bend(6, 1, 8, -18, 0, 2), jaw(30), ears(-16), tail(6), SHUT),
    key(1.06, pelvis(0, -0.06, 0.02), bend(6, 1, 8, -17, 0, -2), jaw(32), ears(-16), tail(5), SHUT),
    // The head droops again.
    key(1.22, pelvis(0, -0.07, -0.01), bend(6, 2, 28, 10), jaw(0), ears(-10), tail(-6), SHUT),
    key(1.5, pelvis(0, -0.03), bend(3, 1, 10, 4), ears(-4), tail(-2), NARROW),
    key(1.9, NARROW),
  ],
  events: [{ t: 0.8, name: 'release' }],
};

/**
 * Mud-Slap (fling): the weight back, head down, its right forepaw digs in
 * ahead and scoops the mud back under its chest, then flicks it forward and
 * up at the foe (release from the paw); the paw comes back down and it
 * snorts.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.3,
  keys: [
    key(0),
    // Head down, the right forepaw reaching ahead to dig in.
    key(0.18, REARED, pelvis(0, -0.025, -0.02), bend(5, 1, 22, 10), foreleg('R', -40, 34, 10), ANGRY, tail(6)),
    // The scoop: the paw drags the mud back under its chest.
    key(0.32, REARED, pelvis(0, -0.035, -0.035), bend(7, 1, 24, 12), foreleg('R', 34, 60, 22), ANGRY, tail(8)),
    // The flick: forward and up at the foe, the head coming up with it.
    snap(0.42, REARED, pelvis(0, -0.02, 0.025), bend(-2, 0, 4, -14), foreleg('R', -100, -10, -12), MENACE, tail(16)),
    key(0.56, REARED, pelvis(0, -0.02, 0.025), bend(-2, 0, 4, -14), foreleg('R', -106, -2, -6), MENACE, tail(14)),
    // The paw comes back down; a snort.
    key(0.74, GROUNDED, pelvis(0, -0.02, 0.005), bend(3, 1, 10, -2, 0, 3), jaw(6), MENACE, tail(8)),
    key(0.92, pelvis(0, -0.012), bend(2, 0, 4, -2), jaw(0), ANGRY, tail(4)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'release' }],
};

/**
 * Howl, Roar (roar): it dips its head and draws breath, then throws its
 * head up with its jaws wide and howls, eyes shut, the hackles up (a moving
 * hold, the head swaying with it); the howl dies away and the head comes
 * back down.
 */
const roar: Clip = {
  name: 'roar',
  duration: 1.8,
  keys: [
    key(0),
    // A breath in, the head dipping.
    key(0.2, pelvis(0, -0.04, -0.01), bend(4, 1, 12, 8), ears(-10), tail(4), ANGRY),
    // The howl: head thrown up, jaws wide.
    snap(0.4, pelvis(0, -0.03, 0.01), bend(-2, 0, -22, -40), jaw(30), hackles(24), ears(-14), tail(20, 0, 8), SHUT),
    key(0.6, pelvis(0, -0.032, 0.012), bend(-2, 0, -24, -42, 0, 3), jaw(32), hackles(26), ears(-14), tail(22, 4, 8), SHUT),
    key(0.8, pelvis(0, -0.03, 0.012), bend(-2, 0, -23, -41, 0, -3), jaw(29), hackles(26), ears(-14), tail(22, -4, 8), SHUT),
    key(1.0, pelvis(0, -0.028, 0.01), bend(-2, 0, -22, -38, 0, 2), jaw(24), hackles(24), ears(-12), tail(20, 2, 6), SHUT),
    // It dies away; the head comes back down.
    key(1.2, pelvis(0, -0.02), bend(1, 0, -2, -10), jaw(6), hackles(12), ears(-8), tail(10), ANGRY),
    key(1.4, pelvis(0, -0.01), bend(1, 0, 2, -2), jaw(0), hackles(4), tail(4), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'emit' }],
};

/**
 * Leer, Scary Face, Taunt, Torment, Odor Sleuth, Snatch, Mimic
 * (status_target: the glare): its hackles rise and its head drops level
 * with its shoulders, eyes fixed on the foe; its lips curl back in a snarl
 * and it leans in (emit), swaying menacingly, growling; then it lifts its
 * head again.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.5,
  keys: [
    key(0),
    // Hackles up, head dropping.
    key(0.22, pelvis(0, -0.04, 0.01), bend(6, 1, 22, -14), ears(-22), hackles(26), tail(10), ANGRY),
    // The snarl, leaning in.
    snap(0.34, pelvis(0, -0.05, 0.035), bend(8, 2, 26, -14), jaw(12), ears(-28), hackles(34), tail(14), ANGRY),
    key(0.54, pelvis(0, -0.052, 0.038), bend(8, 2, 26, -14, 5, 3), jaw(14), ears(-28), hackles(34), tail(14, 4), ANGRY),
    key(0.76, pelvis(0, -0.05, 0.036), bend(8, 2, 25, -13, -5, -3), jaw(11), ears(-28), hackles(33), tail(14, -4), ANGRY),
    key(0.96, pelvis(0, -0.048, 0.03), bend(7, 2, 24, -12, 2, 1), jaw(13), ears(-26), hackles(30), tail(12), ANGRY),
    // Lifts its head again.
    key(1.16, pelvis(0, -0.02), bend(2, 0, 8, -4), jaw(2), ears(-10), hackles(12), tail(6), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'emit' }],
};

/**
 * Sand-Attack (kick_sand): a hop round to stand side-on to the foe, its
 * head turned back to watch it, then the dog's scratch: the hind legs rake
 * the dirt back at the foe, one then the other (emit on the first), and a
 * hop back round to face it.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.62,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.045), bend(4, 1, 8, -4), ANGRY, tail(8)),
    // A hop round to its left, putting its hindquarters to the foe.
    key(0.24, AIR, root({ y: 0.05, yaw: 70 }), legs([10, 40, 20], [-20, 30, 0]), bend(0, 0, 6, -4), shake(-20), ANGRY, tail(12)),
    key(0.35, GROUNDED, root({ yaw: 140 }), pelvis(0, -0.05, 0.03), bend(8, 2, 10, -8), shake(-44), ANGRY, tail(16)),
    // The scratch, looking back over its shoulder: the right hind leg rakes the dirt back at the foe...
    snap(0.45, { plantFeet: 1, plantRight: 0, plantLeft: 1, plantFront: 1 }, root({ yaw: 140 }), pelvis(0, -0.055, 0.045), bend(11, 2, 6, -12), shake(-46), rump(8), ANGRY, tail(22),
      { post: { thighR: { x: 55 }, shinR: { x: 20 }, footR: { x: 40 } } }),
    // ...then the left...
    snap(0.59, { plantFeet: 1, plantRight: 1, plantLeft: 0, plantFront: 1 }, root({ yaw: 140 }), pelvis(0, -0.055, 0.045), bend(11, 2, 6, -12), shake(-46), rump(8), ANGRY, tail(20),
      { post: { thighL: { x: 55 }, shinL: { x: 20 }, footL: { x: 40 } } }),
    // ...and the right again.
    snap(0.73, { plantFeet: 1, plantRight: 0, plantLeft: 1, plantFront: 1 }, root({ yaw: 140 }), pelvis(0, -0.055, 0.04), bend(10, 2, 6, -12), shake(-44), rump(7), ANGRY, tail(20),
      { post: { thighR: { x: 45 }, shinR: { x: 16 }, footR: { x: 32 } } }),
    key(0.87, GROUNDED, root({ yaw: 140 }), pelvis(0, -0.045, 0.02), bend(6, 1, 6, -8), shake(-40), rump(3), ANGRY, tail(12)),
    // A hop back round to face it.
    key(1.01, AIR, root({ y: 0.05, yaw: 64 }), legs([10, 40, 20], [-20, 30, 0]), bend(0, 0, 6, -4), shake(-16), ANGRY, tail(10)),
    key(1.14, GROUNDED, LAND_HOME, root({ yaw: 0 }), ANGRY, tail(6)),
    key(1.62, OPEN_EYES),
  ],
  events: [{ t: 0.47, name: 'emit' }],
};

/**
 * Swagger, Attract (charm): chest out and head held high and cocked, it
 * swings its hindquarters and sweeps its brush from side to side at the foe
 * (emit), smug, with a sly look and a wink, and drops back into its stance.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    // Chest out, head up and cocked, the brush raised.
    key(0.2, pelvis(0, 0, -0.015), bend(-3, -1, -10, -6, 0, 16), ears(14), tail(20, 0, 10), LOOK),
    // The swagger: the hindquarters and the brush swing one way, the other, and back.
    key(0.36, pelvis(0.016, 0, -0.015), bend(-3, -1, -10, -6, 4, 20), rump(0, 18), ears(14), tail(22, 40, 10), LOOK),
    key(0.52, pelvis(-0.016, 0, -0.015), bend(-3, -1, -10, -6, -2, 12), rump(0, -16), ears(14), tail(22, -40, 10), LOOK),
    key(0.68, pelvis(0.016, 0, -0.015), bend(-3, -1, -10, -6, 4, 20), rump(0, 18), ears(14), tail(22, 40, 10), HAPPY),
    key(0.84, pelvis(-0.012, 0, -0.015), bend(-3, -1, -11, -7, -2, 14), rump(0, -12), ears(14), tail(22, -32, 10), HAPPY),
    // Holding it, smug.
    key(1.02, pelvis(0, 0, -0.012), bend(-2, -1, -9, -6, 3, 14), ears(10), tail(18, 0, 8), LOOK),
    key(1.24, pelvis(0, -0.01), bend(1, 0, 2, -2), ears(2), tail(6), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

/**
 * Protect, Substitute, Endure (shield): it flinches back, then braces low
 * with its head tucked down between its shoulders, the hackles bristling
 * and the tail clamped down, eyes squeezed shut while the barrier forms,
 * trembling; then it rises out of its guard.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.015, -0.025), bend(-2, 0, -4, -6), ears(-12), tail(4), ANGRY),
    // The brace.
    snap(0.28, pelvis(0, -0.07, -0.03), bend(8, 2, 28, 12), ears(-32), hackles(28), tail(-16, 0, -6), HURT),
    key(0.46, pelvis(0, -0.074, -0.032), bend(9, 2, 29, 13, 0, 1.5), ears(-32), hackles(30), tail(-17, 0, -6), HURT),
    key(0.66, pelvis(0, -0.072, -0.03), bend(8, 2, 28, 12, 0, -1.5), ears(-32), hackles(29), tail(-16, 0, -6), HURT),
    key(0.86, pelvis(0, -0.076, -0.033), bend(9, 2, 30, 13, 0, 1), ears(-32), hackles(30), tail(-17, 0, -6), HURT),
    // Out of its guard.
    key(1.1, pelvis(0, -0.03, -0.01), bend(3, 1, 8, 2), ears(-10), hackles(8), tail(2), ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Rest (heal): it settles, then its legs fold and it lies down low, its
 * head sinking onto its paws and the brush curling round, eyes shut; a
 * slow breath in and out; then it gets back up.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.0,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.05, -0.02), bend(3, 1, 12, 6), ears(-6), tail(-6), NARROW),
    // Lying down, the head on its paws.
    key(0.64, pelvis(0, -0.19, -0.03), bend(8, 2, 40, 14), ears(-14), tail(-14, -20, -6), SHUT),
    // A slow breath in and out.
    key(0.98, pelvis(0, -0.18, -0.03), bend(6, 2, 36, 12), ears(-12), tail(-13, -18, -6), SHUT),
    key(1.34, pelvis(0, -0.195, -0.032), bend(8, 2, 41, 15), ears(-14), tail(-14, -21, -6), SHUT),
    // Back up.
    key(1.64, pelvis(0, -0.04), bend(3, 1, 8, 2), ears(-4), tail(-2), NARROW),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'aura' }],
};

/**
 * Sunny Day, Rain Dance (weather): it sits back on its haunches and turns
 * its face up to the sky, then calls to it twice, short sharp barks, the
 * brush sweeping; it gazes up while the weather turns, then stands again.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    // Sitting back on its haunches, face turned up.
    key(0.26, pelvis(0, -0.1, -0.06), bend(-8, -2, -6, -16), rump(-6), ears(8), tail(-4, 0, 4), LOOK),
    // Two calls to the sky.
    snap(0.42, pelvis(0, -0.1, -0.06), bend(-9, -2, -12, -28), rump(-6), jaw(24), ears(4), tail(4, 16, 6), ANGRY),
    key(0.58, pelvis(0, -0.098, -0.058), bend(-8, -2, -10, -24), rump(-6), jaw(4), ears(6), tail(2, -10, 6), LOOK),
    snap(0.72, pelvis(0, -0.1, -0.06), bend(-9, -2, -12, -29, 0, 3), rump(-6), jaw(26), ears(4), tail(4, 16, 6), ANGRY),
    // Gazing up while it turns.
    key(0.9, pelvis(0, -0.098, -0.058), bend(-8, -2, -11, -26, 0, -2), rump(-6), jaw(6), ears(8), tail(0, -8, 6), LOOK),
    key(1.12, pelvis(0, -0.096, -0.057), bend(-8, -2, -11, -25, 0, 2), rump(-6), jaw(2), ears(8), tail(-2, 6, 6), LOOK),
    // Standing again.
    key(1.38, pelvis(0, -0.03, -0.01), bend(0, 0, 0, -6), ears(2), tail(2), ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'aura' }],
};

/**
 * Psych Up, Sleep Talk (status_self: the buff): it gathers itself, head
 * down and eyes shut, then shakes itself hard from its head down its body,
 * the mane and tufts flying, and stands tall bristling with the power
 * (aura, a trembling hold), then eases back.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.75,
  keys: [
    key(0),
    // Gathering itself.
    key(0.22, pelvis(0, -0.05, -0.01), bend(6, 2, 16, 10), ears(-14), hackles(-6), tail(-6), SHUT),
    key(0.34, pelvis(0, -0.054, -0.012), bend(7, 2, 17, 11, 0, 1.5), ears(-14), hackles(-6), tail(-7), SHUT),
    // The shake: its head, then its body.
    snap(0.44, pelvis(0.01, -0.04), bend(4, 1, 10, 4), shake(34, 14), twist(12), rump(0, -10), ears(-20), hackles(20), tail(6, -24), NARROW),
    snap(0.55, pelvis(-0.01, -0.04), bend(4, 1, 10, 4), shake(-30, -14), twist(-12), rump(0, 10), ears(-20), hackles(24), tail(6, 24), NARROW),
    snap(0.65, pelvis(0.008, -0.04), bend(4, 1, 10, 4), shake(20, 8), twist(8), rump(0, -6), ears(-20), hackles(26), tail(8, -16), NARROW),
    key(0.75, pelvis(-0.004, -0.035), bend(3, 1, 8, 2), shake(-8, -3), twist(-3), rump(0, 3), ears(-18), hackles(28), tail(10, 8), ANGRY),
    // Standing tall, bristling with it.
    snap(0.88, pelvis(0, -0.01, -0.01), bend(-2, 0, -6, -10), ears(-16), hackles(36), tail(26, 0, 10), ANGRY),
    key(1.04, pelvis(0, -0.012, -0.012), bend(-3, 0, -7, -11, 0, 1.5), ears(-16), hackles(38), tail(27, 3, 10), ANGRY),
    key(1.2, pelvis(0, -0.01, -0.01), bend(-2, 0, -6, -10, 0, -1.5), ears(-16), hackles(36), tail(26, -3, 10), ANGRY),
    // Easing back.
    key(1.4, pelvis(0, -0.012), bend(1, 0, 2, -3), ears(-6), hackles(12), tail(8), ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.9, name: 'aura' }],
};

/**
 * Double Team (afterimage): low, quick darting hops from side to side,
 * gathered small in the air and landing in a crouch, head low and fierce;
 * the afterimages start at the aura and run 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.7,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(6, 1, 12, -8), MENACE, tail(8)),
    key(0.2, AIR, root({ x: -0.1, y: 0.05, z: -0.01 }), TUCK, bend(2, 0, 8, -6), MENACE, tail(12, 20)),
    key(0.3, GROUNDED, root({ x: -0.16, z: -0.02 }), pelvis(0, -0.05), bend(6, 1, 12, -8), MENACE, tail(10, 10)),
    key(0.42, AIR, root({ x: 0.0, y: 0.055, z: -0.025 }), TUCK, bend(2, 0, 8, -6), MENACE, tail(12, -20)),
    key(0.52, GROUNDED, root({ x: 0.14, z: -0.03 }), pelvis(0, -0.05), bend(6, 1, 12, -8), MENACE, tail(10, -10)),
    key(0.64, AIR, root({ x: -0.01, y: 0.055, z: -0.03 }), TUCK, bend(2, 0, 8, -6), MENACE, tail(12, 20)),
    key(0.74, GROUNDED, root({ x: -0.15, z: -0.03 }), pelvis(0, -0.05), bend(6, 1, 12, -8), MENACE, tail(10, 10)),
    key(0.86, AIR, root({ x: 0.0, y: 0.05, z: -0.025 }), TUCK, bend(2, 0, 8, -6), MENACE, tail(12, -20)),
    key(0.96, GROUNDED, root({ x: 0.12, z: -0.02 }), pelvis(0, -0.05), bend(6, 1, 12, -8), MENACE, tail(10, -10)),
    key(1.1, AIR, root({ x: 0.05, y: 0.04, z: -0.01 }), TUCK, bend(2, 0, 6, -4), MENACE, tail(12, 10)),
    key(1.22, GROUNDED, LAND_HOME, root({ x: 0 }), MENACE, tail(6)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Toxic, Yawn (powder): its head rises and its jaws open slowly into a huge
 * gape, eyes shut; then the head drives forward at the foe and it breathes
 * it out (emit), jaws wide, a moving hold; the jaws close and it shakes its
 * head.
 */
const powder: Clip = {
  name: 'powder',
  duration: 1.6,
  keys: [
    key(0),
    // The head rising, a slow breath.
    key(0.22, pelvis(0, -0.01, -0.012), bend(-2, 0, -6, -12), jaw(6), ears(-4), tail(6), NARROW),
    // The gape.
    key(0.48, pelvis(0, -0.015, -0.02), bend(-2, 0, -10, -20), jaw(30), ears(-10), tail(10), SHUT),
    // It drives its head forward at the foe and breathes it out.
    snap(0.62, pelvis(0, -0.04, 0.035), bend(6, 1, 18, -6), jaw(32), MENACE, tail(14)),
    key(0.8, pelvis(0, -0.042, 0.03), bend(6, 1, 18, -6, 4), jaw(28), MENACE, tail(14, 4)),
    // The jaws close; a shake of the head.
    key(0.98, pelvis(0, -0.03, 0.012), bend(4, 1, 10, -4), shake(-12, -4), jaw(0), ANGRY, tail(10)),
    key(1.16, pelvis(0, -0.015), bend(2, 0, 4, -2), shake(6, 2), ANGRY, tail(6)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.68, name: 'emit' }],
};

/** The clips it performs from home. */
export const HOME_CLIPS: Record<string, Clip> = Object.fromEntries(
  [specialWeak, specialStrong, sound, fling, roar, statusTarget, kickSand, charm, shield, heal, weather, statusSelf, afterimage, powder].map((c) => [c.name, c]),
);
