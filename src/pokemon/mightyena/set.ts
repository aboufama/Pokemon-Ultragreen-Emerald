// Mightyena's battle clips, written by hand as key poses in the style of the
// first clips of Blaziken, Sceptile and Swampert (src/pokemon/blaziken/first.ts):
// the moments, the category clips and a clip for every action its moves take.
// This file: the helpers, the moments and the blows it goes to the foe for;
// ./set_home.ts: the moves it performs from home (ranged and status).
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (a pounce's arc,
//            landing in on the foe, spins, going underground)
//   plantFeet / plantFront   hind / front paws pinned with IK (0: the legs are
//            free and follow their `post` swings: leaping, rearing, swiping)
//   expression      eye atlas cell (open, look, half, happy, closed, angry, hurt)
// Events: impact, release, releaseEnd, charge, cry, aura, emit, shrink, dig.
//
// How Mightyena moves (the brief in index.ts): a 37 kg pack hunter,
// economical and menacing. Its stance stands square on four straight legs,
// head high, the hindquarters swung off to its left. To attack it stalks:
// it sinks, its weight creeping forward low over its forepaws, then rocks
// back onto its haunches, quivering; then it explodes into one long pounce
// along an arc (the hindquarters lined up behind it, forelegs reaching,
// hind legs stretched out behind), lands heavily in front of the foe (it
// comes down a little in on it: `root.z`), and the blow drives into the foe
// with the whole body behind it: the neck drives the jaws in, the shoulders
// the forepaws, the whole weight the ram. It bounds home gathered small and
// lands deep in its legs. Its jaws are its weapon (bites, the orb and the
// beam it fires, howls and snarls); its forepaws swipe, dig and scoop, its
// hind paws kick the dirt back. Holds keep moving: the springs swing the
// mane, the locks, the shaggy tufts and the brush of a tail after it.
//
// Legs in the air are swung with `post` rotations about the model's X axis
// (+ swings a hanging leg's foot back, - forward and up), so every key
// carries the same channels and the curves between keys stay smooth; on the
// ground the IK pins every paw where the stance puts it, and the body
// crouches, leans, coils and rears over them.
//
// The healthboxes are drawn over the Pokémon: from our side the foe's box is
// just above our Mightyena's ears, so clips at home lean in rather than rise.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const LOOK: Pose = { expression: 'look' };
const NARROW: Pose = { expression: 'half' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };

/** The jaws, from the stance's (shut over the fangs): + opens them. */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
/** The body's weight over its paws (heights): y up, z toward the foe, x its left. */
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The spine chain from the waist to the head: spine and chest (+ dips the
 * forequarters, - rears them), the neck over its two bones (+ bows it
 * forward and down, - raises it), the head (+ tips the snout down), and the
 * head's turn (+ to its left) and tilt.
 */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: {
    spine: { x: spine }, chest: { x: chest },
    neck: { x: neck * 0.55 }, neck2: { x: neck * 0.45 },
    head: { x: head, y: headY, z: headZ },
  },
});
/** The forequarters turned (+ to its left: the right shoulder comes forward). */
const twist = (deg: number): Pose => ({ bones: { spine: { y: deg * 0.6 }, chest: { y: deg * 0.4 } } });
/** The neck and head turned together (+ to its left), and rolled: a head shake. */
const shake = (deg: number, roll = 0): Pose => ({
  bones: { neck: { y: deg * 0.3, z: roll * 0.5 }, neck2: { y: deg * 0.3, z: roll * 0.5 }, head: { y: deg * 0.4 } },
});
/** The hindquarters: pitch (+ raises the rump) and swing (+ swings it to its right). */
const rump = (x: number, y = 0): Pose => ({ bones: { hips: { x, y } } });
/** Ears: + pricked forward, - pinned back. */
const ears = (deg: number): Pose => ({ bones: { earL: { x: deg }, earR: { x: deg } } });
/** The brush: lift (+ raises it), sweep (+ swings it to its right), curl (+ curls it up along the chain). */
const tail = (lift: number, sweep = 0, curl = 0): Pose => ({
  bones: {
    tail: { x: lift, y: sweep * 0.5 },
    tail2: { x: curl * 0.3, y: sweep * 0.25 },
    tail3: { x: curl * 0.3, y: sweep * 0.25 },
    tail4: { x: curl * 0.25 },
    tail5: { x: curl * 0.2 },
  },
});
/** Hackles: the mane and the shaggy tufts of its shoulders, flanks and rump bristle (+) or lie flat (-). */
const hackles = (deg: number): Pose => ({
  bones: {
    mane: { x: deg * 0.7 },
    furShoulderL: { x: deg * 0.5 }, furShoulderR: { x: deg * 0.5 },
    furFlankL: { x: deg * 0.5 }, furFlankR: { x: deg * 0.5 },
    furRumpL: { x: deg * 0.45 }, furRumpR: { x: deg * 0.45 },
    furHipL: { x: deg * 0.35 }, furHipR: { x: deg * 0.35 },
  },
});
/** Menace: ears pinned back, hackles up, eyes narrowed in anger. */
const MENACE: Pose = compose({}, ears(-24), hackles(22), ANGRY);
/** Where along the way to the foe (advance), how high in a leap (root.y) and how far in on it (root.z), in heights. */
const at = (advance: number, y = 0, z = 0): Pose => ({ advance, root: { y, z } });

// Legs.

/** Both forelegs [arm, forearm, paw] and both hind legs [thigh, shin, hock] swung (+ back, - forward). */
const legs = (front: [number, number, number], hind: [number, number, number]): Pose => ({
  post: {
    armL: { x: front[0] }, armR: { x: front[0] },
    forearmL: { x: front[1] }, forearmR: { x: front[1] },
    handL: { x: front[2] }, handR: { x: front[2] },
    thighL: { x: hind[0] }, thighR: { x: hind[0] },
    shinL: { x: hind[1] }, shinR: { x: hind[1] },
    footL: { x: hind[2] }, footR: { x: hind[2] },
  },
});
/** One foreleg swung: arm (+ back, - forward and up), forearm, paw, and the arm rolled out (+ toward its left). */
const foreleg = (side: 'L' | 'R', arm: number, forearm: number, paw = 0, roll = 0): Pose => ({
  post: { [`arm${side}`]: { x: arm, z: roll }, [`forearm${side}`]: { x: forearm }, [`hand${side}`]: { x: paw } },
});
/** All four paws off the ground. */
const AIR: Pose = { plantFeet: 0, plantFront: 0 };
/** Reared on its hind legs: the forepaws off the ground. */
const REARED: Pose = { plantFeet: 1, plantFront: 0 };
/** All four paws on the ground. */
const GROUNDED: Pose = { plantFeet: 1, plantFront: 1 };
/** The hindquarters lined up behind the chest (the stance swings them to its left): leaping, it flies straight. */
const STRAIGHT: Pose = { bones: { hips: { y: 40 } } };
/** Driving off the hind legs: hind legs thrust out behind, forelegs reaching ahead. */
const PUSH: Pose = compose({}, AIR, STRAIGHT, legs([-50, -10, 30], [35, 10, 35]));
/** Stretched out at the top of the pounce. */
const FLY: Pose = compose({}, AIR, STRAIGHT, legs([-70, -5, 20], [55, 20, 40]));
/** Coming down: the forelegs reach for the ground, the hind legs swing under. */
const REACH: Pose = compose({}, AIR, STRAIGHT, legs([-35, -5, 10], [-20, 25, 10]));
/** Gathered small in a hop (bounding home, darting). */
const TUCK: Pose = compose({}, AIR, legs([15, 70, 30], [-35, 45, -10]));
/** Landing: the legs take the weight, the forequarters dip into it. */
const LAND: Pose = { plantFeet: 1, plantFront: 1, pelvis: { y: -0.06 }, bones: { spine: { x: 6 }, head: { x: -4 } } };
/** Landing home from a bound: the legs take it, the head carries on up a little. */
const LAND_HOME: Pose = { plantFeet: 1, plantFront: 1, pelvis: { y: -0.05 }, bones: { spine: { x: 3 }, head: { x: -2 } } };

// Battle moments --------------------------------------------------------------

/** Idle: slow breaths on its straight legs, the head drifting a little; the life layer and the springs add the rest. */
const idle: Clip = {
  name: 'idle',
  duration: 2.6,
  loop: true,
  keys: [
    key(0),
    key(1.3, pelvis(0, -0.006), bend(1.5, 0, 2, -1.5), tail(2, 4)),
    key(2.6),
  ],
};

/**
 * Sent out (cf. its stock anim, a shake): crouched low and gathered, eyes
 * shut, it bursts up rearing off its forepaws with its hackles up and barks
 * its cry at the foe (a moving hold), comes down heavily onto its forepaws
 * still snarling, and settles into its stance.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.75,
  keys: [
    key(0, GROUNDED, pelvis(0, -0.1, -0.02), bend(10, 2, 24, -6), ears(-28), hackles(-6), tail(-14, 0, -8), SHUT),
    // Coiling deeper.
    key(0.22, GROUNDED, pelvis(0, -0.12, -0.03), bend(12, 3, 28, -4), ears(-30), hackles(-8), tail(-18, 0, -10), SHUT),
    // Bursts up, rearing off its forepaws: the cry.
    snap(0.42, REARED, pelvis(0, 0.01, -0.03), bend(-18, -4, -6, -16), foreleg('L', -35, 55, 25), foreleg('R', -30, 50, 25), jaw(26), ears(-18), hackles(30), tail(24, 0, 8), ANGRY),
    key(0.6, REARED, pelvis(0, 0.012, -0.03), bend(-19, -4, -8, -18, 0, 3), foreleg('L', -38, 58, 25), foreleg('R', -33, 53, 25), jaw(28), ears(-20), hackles(32), tail(26, 4, 8), ANGRY),
    // Down onto its forepaws, still snarling at the foe.
    key(0.78, GROUNDED, pelvis(0, -0.035, 0.01), bend(4, 1, 8, -6, 0, -2), jaw(20), ears(-22), hackles(28), tail(20, -4, 6), ANGRY),
    key(0.96, GROUNDED, pelvis(0, -0.03, 0.012), bend(4, 1, 9, -6, 4, 2), jaw(14), ears(-20), hackles(26), tail(18, 3, 6), ANGRY),
    // Settling.
    key(1.2, pelvis(0, -0.012), bend(1, 0, 3, -2), jaw(2), ears(-8), hackles(10), tail(6), ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Taking a hit: the head snaps up and away with a yelp, the ears flat, the body jolted back; then it shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.02, -0.03), bend(-8, -2, -12, -10, 12, -6), jaw(12), ears(-30), tail(-8), HURT),
    key(0.2, pelvis(0, -0.012, -0.015), bend(-3, -1, -5, -4, 5, -2), jaw(4), ears(-14), tail(-3), HURT),
    key(0.38, pelvis(0, -0.004), bend(3, 1, 4, 2), ears(-4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * eyes half shut, then its legs fold under it and it curls down low, the
 * head bowed onto its chest and the brush curling round, eyes shut; from
 * the 'shrink' the curled body shrinks away (Battler3D).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.66,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.01, -0.015), bend(-3, -1, -6, -6), jaw(6), ears(-10), tail(-4), NARROW),
    key(0.5, pelvis(0, -0.1, -0.03), bend(6, 2, 28, 10), jaw(0), ears(-18), tail(-12, -10, -6), SHUT),
    key(0.86, pelvis(0, -0.19, -0.04), bend(8, 3, 40, 14), ears(-24), tail(-18, -24, -10), SHUT),
    key(1.0, pelvis(0, -0.2, -0.042), bend(9, 3, 42, 15), ears(-25), tail(-19, -26, -10), SHUT),
    key(1.66, pelvis(0, -0.197, -0.04), bend(8, 3, 41, 14), ears(-24), tail(-18, -25, -10), SHUT),
  ],
  events: [{ t: 1.08, name: 'shrink' }],
};

// Blows at the foe --------------------------------------------------------------

/**
 * Thief, Covet, Rock Smash (physical_weak, after Blaziken's claw slash): it
 * stalks and coils, pounces, rearing up at the top of the arc with its right
 * forepaw cocked high, comes down on its hind legs in front of the foe, and
 * rakes the paw down across its face as its forequarters drop and its
 * shoulders unwind; the paw carries on down past it, the forepaws land, and
 * it bounds home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.6,
  keys: [
    key(0),
    // Stalk: it sinks, its weight creeping forward low; the right shoulder draws back.
    key(0.14, pelvis(0, -0.06, 0.02), bend(7, 1, 14, -10), twist(-6), MENACE, tail(6)),
    // Coiled on its haunches, quivering.
    key(0.26, pelvis(0, -0.09, -0.035), bend(8, 2, 14, -12, 0, 1.5), twist(-10), rump(4), MENACE, tail(10)),
    // Explodes off its hind legs...
    key(0.35, at(0.3, 0.1), PUSH, bend(-8, -2, 8, -8), twist(-8), MENACE, tail(16)),
    // ...rearing at the top of the arc, the right forepaw coming up.
    key(0.43, at(0.68, 0.15), AIR, STRAIGHT, legs([-40, 40, 20], [50, 20, 30]), foreleg('R', -80, 30, 10, -24), bend(-18, -4, 2, -8, 6), twist(-12), jaw(8), MENACE, tail(20)),
    // Down on its hind legs in front of the foe, reared tall, the paw cocked high.
    key(0.52, at(1), REARED, pelvis(0, -0.05, -0.02), bend(-26, -5, -2, -8, 8), twist(-16), foreleg('R', -156, 50, 20, -24), foreleg('L', -40, 60, 25), jaw(12), MENACE, tail(16)),
    // Rearing a little higher, the paw drawn back over its head.
    key(0.6, at(1), REARED, pelvis(0, -0.045, -0.03), bend(-30, -6, -4, -8, 10), twist(-19), foreleg('R', -174, 42, 20, -20), foreleg('L', -44, 62, 25), jaw(14), MENACE, tail(18)),
    // The rake: the shoulders unwind and the paw slashes down across its face...
    snap(0.67, at(1), REARED, pelvis(0, -0.055, 0.03), bend(-8, -2, 6, -6, -6), twist(20), foreleg('R', -94, -2, -10, 16), foreleg('L', -30, 30, 15), jaw(18), MENACE, tail(10)),
    // ...and carries on down past it to its other side as the forequarters crash down.
    key(0.8, at(1), REARED, pelvis(0, -0.07, 0.03), bend(10, 2, 12, -4, -8), twist(24), foreleg('R', -20, 12, 5, 32), foreleg('L', -10, 10, 5), jaw(10), MENACE, tail(8)),
    // The forepaws on the ground.
    key(0.92, at(1), GROUNDED, pelvis(0, -0.06), bend(7, 1, 9, -6), twist(5), jaw(4), MENACE, tail(8)),
    // Bound home.
    key(1.06, at(0.5, 0.09), TUCK, bend(-4, 0, 2, -2), MENACE, tail(12)),
    key(1.2, at(0), LAND_HOME, MENACE, tail(6)),
    key(1.6, OPEN_EYES),
  ],
  // The forepaw trails the shoulders a little.
  events: [{ t: 0.7, name: 'impact' }],
};

/**
 * Tackle, Facade, Secret Power, Struggle (tackle, after Blaziken's tackle):
 * the quickest of its blows: a crouch with the head dropped, a low springing
 * dash, and it rams the foe head and shoulders first, bounces back off it
 * shaking its head, and hops home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.25,
  keys: [
    key(0),
    // Crouch, the head dropped to ram.
    key(0.12, pelvis(0, -0.07, -0.03), bend(8, 2, 24, 4), rump(4), MENACE, tail(8)),
    // The dash: low and fast, head down leading.
    key(0.22, at(0.4, 0.08), PUSH, bend(-4, 0, 24, 8), MENACE, tail(16)),
    key(0.3, at(0.82, 0.07), FLY, bend(2, 1, 26, 10), MENACE, tail(20)),
    // The ram: head and shoulders into the foe.
    snap(0.35, at(1, 0.03), REACH, bend(10, 3, 28, 12, 0, 4), jaw(-2), MENACE, HURT, tail(14)),
    // Bounces back off it, shaking its head.
    key(0.48, at(0.8, 0.08), TUCK, bend(-4, 0, 4, -4), shake(12), MENACE, tail(10)),
    key(0.62, at(0.4, 0.07), TUCK, bend(-2, 0, 2, -2), shake(-8), MENACE, tail(8)),
    key(0.74, at(0), LAND_HOME, MENACE, tail(4)),
    key(0.92, pelvis(0, -0.015), bend(2, 0, 2, 0), MENACE),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'impact' }],
};

/**
 * Take Down, Double-Edge, Return, Frustration, Strength (physical_strong:
 * the strong tackle, on Blaziken's physical_strong scale): a long stalk and
 * a deep coil, head down; a huge explosive pounce, and it crashes into the
 * foe head and shoulders first with all its weight; the jolt throws it
 * back off it, it lands deep, shakes its head clear, snarling, and bounds
 * home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.1,
  keys: [
    key(0),
    // Stalk: sinks, the weight creeping forward, head dropping.
    key(0.18, pelvis(0, -0.05, 0.025), bend(6, 1, 14, -8), MENACE, tail(8)),
    // A deep coil on its haunches, head down between its shoulders, quivering.
    key(0.36, pelvis(0, -0.11, -0.045), bend(10, 3, 24, 2), rump(6), MENACE, tail(16)),
    key(0.48, pelvis(0, -0.115, -0.05), bend(11, 3, 25, 3, 0, 2), rump(6), MENACE, tail(18)),
    // The explosion off its hind legs.
    key(0.57, at(0.3, 0.14), PUSH, bend(-8, -2, 18, 6), MENACE, tail(24)),
    // Flying at the foe, head down leading.
    key(0.67, at(0.68, 0.2), FLY, bend(-2, 0, 22, 8), MENACE, tail(26)),
    // The crash: head and shoulders into the foe with all its weight.
    snap(0.75, at(1, 0.06), REACH, bend(12, 4, 28, 14, 0, 5), jaw(-2), MENACE, HURT, tail(18)),
    // Thrown back off it by the jolt, squinting.
    snap(0.86, at(0.9, 0.12), TUCK, bend(-8, -2, -6, -10, 8, -4), jaw(10), ears(-30), HURT, tail(10)),
    // Lands deep, staggered, head hanging.
    key(1.0, at(0.82), LAND, pelvis(0, -0.03, -0.01), bend(4, 1, 10, 2, 2, 4), jaw(4), ears(-20), NARROW, tail(4)),
    // Shakes its head clear.
    key(1.12, at(0.82), GROUNDED, pelvis(0, -0.07, -0.01), bend(6, 2, 12, 2), shake(-18, 6), ears(-16), MENACE, tail(6)),
    key(1.24, at(0.82), GROUNDED, pelvis(0, -0.065, -0.01), bend(6, 2, 12, 2), shake(14, -5), ears(-18), MENACE, tail(6)),
    key(1.36, at(0.82), GROUNDED, pelvis(0, -0.06, -0.02), bend(5, 1, 8, -4), shake(-4), MENACE, tail(8)),
    // Bound home.
    key(1.5, at(0.4, 0.09), TUCK, bend(-4, 0, 2, -2), MENACE, tail(12)),
    key(1.64, at(0), LAND_HOME, MENACE, tail(6)),
    key(1.82, pelvis(0, -0.018), bend(2, 0, 2, 0), MENACE, tail(3)),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/**
 * Bite, Crunch, Poison Fang, Astonish (bite, after Sceptile's bite and
 * Blaziken's peck): it stalks, its head drawn back and the jaws parting;
 * pounces along an arc and lands in front of the foe; the neck drives the
 * open jaws into it and they snap shut; it shakes its grip, heavy shakes
 * that swing the mane, lets go and bounds home.
 */
const bite: Clip = {
  name: 'bite',
  duration: 1.72,
  keys: [
    key(0),
    // Stalk: sinks, weight creeping forward low, head level with its shoulders.
    key(0.14, pelvis(0, -0.07, 0.025), bend(8, 2, 18, -12), MENACE, tail(6)),
    // Coiled on its haunches, the head drawn back, the jaws parting.
    key(0.28, pelvis(0, -0.1, -0.04), bend(9, 2, 10, -14, 0, 1.5), rump(5), jaw(6), MENACE, tail(10)),
    // The pounce: off its hind legs, jaws opening...
    key(0.36, at(0.28, 0.1), PUSH, bend(-8, -2, 2, -8), jaw(12), MENACE, tail(16)),
    key(0.45, at(0.66, 0.15), FLY, bend(-3, 0, 4, -10), jaw(20), MENACE, tail(20)),
    key(0.53, at(0.92, 0.07), REACH, bend(5, 1, 0, -12), jaw(26), MENACE, tail(16)),
    // ...lands heavily in front of the foe, jaws wide, the head drawn right back.
    key(0.6, at(1), LAND, pelvis(0, -0.02, -0.02), bend(2, 0, -10, -14), jaw(30), MENACE, tail(12)),
    // The lunge: the neck drives the open jaws into the foe...
    snap(0.67, at(1), GROUNDED, pelvis(0, -0.04, 0.05), bend(-2, 0, 18, -16, 8), jaw(32), MENACE, tail(8)),
    // ...and they snap shut on it.
    key(0.72, at(1), GROUNDED, pelvis(0, -0.045, 0.055), bend(-1, 0, 20, -14, 10), jaw(-2), MENACE, tail(8)),
    // Shaking its grip.
    key(0.84, at(1), GROUNDED, pelvis(0.012, -0.05, 0.045), bend(0, 0, 20, -14, 10), shake(18, 7), twist(10), rump(0, -10), jaw(-2), MENACE, tail(10, -14)),
    key(0.96, at(1), GROUNDED, pelvis(-0.012, -0.05, 0.045), bend(0, 0, 20, -14, 10), shake(-16, -7), twist(-10), rump(0, 10), jaw(-2), MENACE, tail(10, 14)),
    // Lets go, the head coming up.
    key(1.08, at(1), GROUNDED, pelvis(0, -0.05, -0.01), bend(4, 1, 6, -8), jaw(8), MENACE, tail(8)),
    // Bound home.
    key(1.22, at(0.5, 0.09), TUCK, bend(-4, 0, 2, -2), jaw(0), MENACE, tail(12)),
    key(1.36, at(0), LAND_HOME, MENACE, tail(6)),
    key(1.72, OPEN_EYES),
  ],
  // The jaws trail the neck: they shut on the foe just after their key.
  events: [{ t: 0.76, name: 'impact' }],
};

/**
 * Iron Tail (tail, after Swampert's): it stalks with its brush raised stiff,
 * leaps and turns in the air to put its back to the foe, the tail reared up
 * high; the tail whips down through the foe as the turn carries on; it
 * lands, swings back round to face it and bounds home.
 */
const tailWhip: Clip = {
  name: 'tail',
  duration: 2.0,
  keys: [
    key(0),
    // Stalk, the tail rising stiff.
    key(0.16, pelvis(0, -0.05, 0.02), bend(6, 1, 12, -8), MENACE, tail(26, 0, 6)),
    // Coiled, the shoulders turning away.
    key(0.3, pelvis(0, -0.08, -0.03), bend(8, 2, 14, -10), twist(10), rump(4), MENACE, tail(36, 0, 10)),
    // Up and in, turning its back to the foe.
    key(0.42, at(0.4, 0.13), PUSH, root({ yaw: 50 }), bend(-6, -2, 8, -6), MENACE, tail(44, 0, 12)),
    key(0.54, at(0.8, 0.18), TUCK, STRAIGHT, root({ yaw: 140 }), bend(-2, 0, 6, -4), MENACE, tail(64, 0, 14)),
    // Its back to the foe, the tail reared up high over it, held a beat.
    key(0.64, at(1, 0.14), TUCK, STRAIGHT, root({ yaw: 174 }), bend(0, 0, 4, -2), MENACE, tail(80, 0, 18)),
    key(0.7, at(1, 0.11), TUCK, STRAIGHT, root({ yaw: 178 }), bend(0, 0, 4, -2, 0, 2), MENACE, tail(84, 0, 18)),
    // The whip: straight down onto the foe as it comes down...
    snap(0.77, at(1, 0.04), REACH, root({ yaw: 186 }), bend(-4, -1, 6, -4), MENACE, tail(-16, 0, -8)),
    // ...and lands, the rump swinging round and the tail sweeping on out to its side.
    key(0.9, at(1), LAND, root({ yaw: 192 }), pelvis(0, -0.02), bend(-4, -1, 6, -4), MENACE, tail(-24, 30, -10)),
    // Swinging back round to face it.
    key(1.04, at(0.88, 0.07), TUCK, root({ yaw: 290 }), bend(-2, 0, 4, -2), MENACE, tail(-6, -10)),
    key(1.18, at(0.8), LAND, root({ yaw: 360 }), bend(4, 1, 4, -4), MENACE, tail(4)),
    // Bound home.
    key(1.36, at(0.4, 0.09), TUCK, root({ yaw: 360 }), bend(-4, 0, 2, -2), MENACE, tail(12)),
    key(1.5, at(0), LAND_HOME, root({ yaw: 360 }), MENACE, tail(6)),
    key(2.0, root({ yaw: 360 }), OPEN_EYES),
  ],
  // The tail's tip trails its root: it reaches the foe a few frames after the key.
  events: [{ t: 0.82, name: 'impact' }],
};

/**
 * Body Slam (slam, after Blaziken's): a long stalk and a deep gather, then
 * a leap high over the foe; at the top it tips forward with its legs flung
 * out and comes down on it with its whole weight, chest first; it bounces
 * off, lands deep in front of it and bounds home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.1,
  keys: [
    key(0),
    // Stalk.
    key(0.16, pelvis(0, -0.05, 0.02), bend(6, 1, 12, -8), MENACE, tail(8)),
    // A deep gather on its haunches.
    key(0.32, pelvis(0, -0.12, -0.05), bend(8, 2, 14, -12), rump(6), MENACE, tail(16)),
    key(0.42, pelvis(0, -0.125, -0.055), bend(9, 2, 15, -13, 0, 2), rump(6), MENACE, tail(18)),
    // Springs up high and in.
    key(0.54, at(0.4, 0.2), PUSH, bend(-12, -3, 4, -8), MENACE, tail(26)),
    // The top: tipping forward over the foe, legs flung out.
    key(0.68, at(0.84, 0.27), AIR, STRAIGHT, legs([-80, 10, 20], [60, 20, 30]), root({ pitch: 20 }), bend(-2, 0, 10, -6), jaw(10), MENACE, tail(30)),
    // Down on it with its whole weight.
    snap(0.79, at(1, 0.07), AIR, STRAIGHT, legs([-60, 20, 20], [50, 20, 30]), root({ pitch: 30 }), bend(8, 2, 16, 4), jaw(8), MENACE, HURT, tail(20)),
    key(0.87, at(1, 0.05), AIR, STRAIGHT, legs([-58, 22, 20], [48, 22, 30]), root({ pitch: 31 }), bend(9, 2, 17, 5), jaw(6), MENACE, HURT, tail(18)),
    // Bounces off it.
    key(1.0, at(0.92, 0.13), TUCK, root({ pitch: 10 }), bend(-4, 0, 4, -4), MENACE, tail(14)),
    // Lands deep in front of it.
    fall(1.16, at(0.88), LAND, pelvis(0, -0.04), bend(6, 1, 10, -4), MENACE, tail(8)),
    key(1.34, at(0.88), GROUNDED, pelvis(0, -0.05), bend(4, 1, 6, -4), MENACE, tail(8)),
    // Bound home.
    key(1.5, at(0.42, 0.09), TUCK, bend(-4, 0, 2, -2), MENACE, tail(12)),
    key(1.64, at(0), LAND_HOME, MENACE, tail(6)),
    key(2.1, OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
};

/**
 * Dig (burrow, after Blaziken's and Swampert's): nose down, its forepaws
 * tear at the ground in turn (dig: the dirt flies), and it dives in nose
 * first, the tail last; it tunnels over to the foe, bursts up out of the
 * ground right under its chin, reared up with its jaws wide (impact as it
 * breaks the surface), comes down in front of it, holds its crouch in the
 * dust and bounds home. (The battles cut it where it is deepest: it waits
 * there for its second turn.)
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.34,
  keys: [
    key(0),
    // Nose down to the ground, crouching.
    key(0.14, pelvis(0, -0.06, 0.02), bend(12, 3, 30, 12), MENACE, tail(10)),
    // The forepaws tear at the ground, one then the other: the dirt flies.
    key(0.24, REARED, root({ y: -0.04 }), pelvis(0, -0.07, 0.03), bend(14, 3, 32, 14), foreleg('R', 30, 40, 20), foreleg('L', -30, 10, 0), MENACE, tail(12)),
    key(0.34, REARED, root({ y: -0.2 }), pelvis(0, -0.07, 0.03), bend(16, 3, 34, 14), foreleg('R', -30, 10, 0), foreleg('L', 30, 40, 20), MENACE, tail(14)),
    // Diving in nose first, gathering speed.
    key(0.46, AIR, root({ y: -0.55, pitch: 30 }), pelvis(0, -0.07, 0.03), bend(16, 3, 34, 14), legs([-30, 10, 0], [30, 10, 20]), MENACE, tail(20)),
    fall(0.6, AIR, root({ y: -1.3, pitch: 40 }), pelvis(0, -0.07, 0.03), bend(16, 3, 34, 14), legs([-30, 10, 0], [40, 10, 20]), MENACE, tail(24)),
    // Underground (nothing to stand on): tunnelling over to the foe, righting itself.
    key(0.76, at(0.35, -1.3), AIR, root({ pitch: 10 }), bend(8, 2, 16, 0), legs([-20, 20, 10], [20, 20, 10]), MENACE, tail(10)),
    key(0.92, at(1, -1.25, 0.2), AIR, bend(10, 2, 10, -10), legs([10, 50, 20], [-20, 40, 0]), jaw(10), MENACE, tail(4)),
    // Bursts up under the foe's chin, reared, jaws wide.
    snap(1.06, at(1, 0.24, 0.2), AIR, legs([-60, 40, 20], [20, 10, 20]), bend(-26, -6, -12, -18), jaw(30), MENACE, tail(-10)),
    key(1.18, at(0.96, 0.3, 0.18), AIR, legs([-66, 44, 20], [24, 12, 20]), bend(-28, -6, -14, -20), jaw(26), MENACE, tail(-4)),
    // Tipping forward as it comes down...
    key(1.29, at(0.9, 0.12, 0.1), AIR, legs([-40, 20, 10], [-10, 20, 10]), bend(-10, -2, -2, -12), jaw(14), MENACE, tail(4)),
    // ...in front of it, and holds its crouch.
    fall(1.4, at(0.86, 0, 0.06), LAND, pelvis(0, -0.03), bend(8, 2, 10, -6), jaw(6), MENACE, tail(8)),
    key(1.66, at(0.86, 0, 0.06), GROUNDED, pelvis(0, -0.06), bend(5, 1, 8, -6, 0, 2), jaw(4), MENACE, tail(8)),
    // Bound home.
    key(1.82, at(0.4, 0.09, 0.03), TUCK, bend(-4, 0, 2, -2), MENACE, tail(12)),
    key(1.96, at(0), LAND_HOME, MENACE, tail(6)),
    key(2.34, OPEN_EYES),
  ],
  events: [{ t: 0.26, name: 'dig' }, { t: 1.02, name: 'impact' }],
};

/**
 * Counter (punch): braced as the blow lands, it takes it with its head
 * down and eyes shut; then fury: it pounces flat and fast and rears in the
 * air, and both forepaws strike the foe square in the chest with all its
 * weight behind them; it drops onto its forepaws in the foe's face,
 * snarling, and bounds home.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.8,
  keys: [
    key(0),
    // Braced: it takes the blow, head down, eyes squeezed shut.
    key(0.1, pelvis(0, -0.05, -0.03), bend(6, 2, 16, 4), ears(-30), hackles(10), tail(-6), HURT),
    key(0.26, pelvis(0, -0.06, -0.035), bend(7, 2, 18, 5, 0, 2), ears(-30), hackles(14), tail(-8), HURT),
    // Its eyes snap open: coiled, snarling.
    key(0.36, pelvis(0, -0.085, -0.04), bend(8, 2, 12, -10), rump(4), jaw(10), MENACE, tail(12)),
    // A flat, furious pounce...
    key(0.45, at(0.35, 0.1), PUSH, bend(-8, -2, 6, -8), jaw(14), MENACE, tail(20)),
    // ...rearing in the air, both forepaws drawn back to strike.
    key(0.55, at(0.8, 0.14), AIR, STRAIGHT, legs([-50, 70, 30], [45, 20, 30]), bend(-18, -4, 2, -10), jaw(18), MENACE, tail(22)),
    // Both forepaws drive into its chest.
    snap(0.62, at(1, 0.07), AIR, STRAIGHT, legs([-92, -6, -10], [30, 20, 30]), bend(-12, -3, 8, -8), jaw(24), MENACE, tail(16)),
    key(0.74, at(1, 0.03), AIR, STRAIGHT, legs([-80, 0, 0], [10, 20, 20]), bend(-6, -2, 10, -8), jaw(20), MENACE, tail(12)),
    // Drops onto its forepaws in the foe's face, snarling.
    key(0.86, at(1), LAND, bend(4, 1, 12, -10), jaw(22), MENACE, tail(10)),
    key(1.02, at(1), GROUNDED, pelvis(0, -0.05, 0.02), bend(4, 1, 13, -10, 6), jaw(20), MENACE, tail(10)),
    key(1.14, at(1), GROUNDED, pelvis(0, -0.05, -0.01), bend(4, 1, 6, -6), jaw(6), MENACE, tail(8)),
    // Bound home.
    key(1.28, at(0.45, 0.09), TUCK, bend(-4, 0, 2, -2), jaw(0), MENACE, tail(12)),
    key(1.42, at(0), LAND_HOME, MENACE, tail(6)),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'impact' }],
};

/** The root delta alone (yaw for spins, pitch for dives and crashes). */
function root(r: NonNullable<Pose['root']>): Pose {
  return { root: r };
}

/** The clips it goes to the foe for, and the moments. */
export const CONTACT_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, hit, faint, physicalWeak, tackle, physicalStrong, bite, tailWhip, slam, burrow, punch].map((c) => [c.name, c]),
);

/** Eye atlas (pm0262_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  look: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  angry: [1, 2],
  hurt: [0, 3],
};

// The helpers, for the clips it plays from home (./set_home.ts).
export {
  key, snap, fall, ANGRY, LOOK, NARROW, HAPPY, SHUT, HURT, OPEN_EYES, jaw, pelvis, bend, twist, shake, rump, ears, tail, hackles, MENACE, at,
  legs, foreleg, AIR, REARED, GROUNDED, STRAIGHT, PUSH, FLY, REACH, TUCK, LAND, LAND_HOME, root,
};
