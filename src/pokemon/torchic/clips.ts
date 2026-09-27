// Torchic's battle animation set: a small, plucky fire chick with tiny wing
// tufts and no arms. Keys are STANCE + deltas (see compose()).
//
// Channels used here:
//   pelvis          hips and spine roots together, in heights (crouch, lean);
//                   the planted feet keep their height, not their place, so
//                   sideways and forward offsets stay small
//   root            unused: every clip acts in place (the compiled game moves
//                   the sprite and the body follows it; advance stays 0)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell
// Events: impact (contact lands), release (fire leaves the beak), releaseEnd,
// charge, cry, aura, emit, dig, shrink.
//
// How Torchic acts (see the brief in index.ts):
//   - it is all head: a big round head on a round body, pivoting on the chest.
//     Any forward pitch of the head turns its face to the ground, so the body
//     leans from the hips while the head keeps its face on the foe (lean());
//     only the headlong charges lead with the crown;
//   - its legs are short (0.16 heights to the ankle): crouches are shallow,
//     it bobs rather than squats, and its talons rake and kick sand;
//   - it has no arms: the wing tufts flare for balance, flutter when it is
//     fired up, fling Swift's stars and fold in when it gathers or tires;
//   - fire comes up from its belly (the Pokédex: balls of fire it forms in its
//     stomach): it hunches or swells, then the head thrusts forward and the
//     beak spits or streams;
//   - from our side only the head, the crest and the collar show above the
//     text box, so every action also reads in the head, the crest (on springs)
//     and the wing tufts;
//   - the game's effects start with the move (Scratch's marks, Peck's hit,
//     Ember's embers leave at once): the strikes and spits of its early moves
//     come within 0.2 s, after a quick anticipation.
// The animator adds overlapping action (the head trails the body by 0.045 s,
// the crest and the wing tufts a little more: see index.ts), breathing,
// blinks and springs on the crest, the tail and the wing tufts
// (src/anim/animator.ts, src/battle3d/battler.ts).

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (drops, sinking). */
const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const HAPPY: Pose = { expression: 'happy' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
/** Eyes squeezed shut with effort (the atlas' hurt cell). */
const STRAIN: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The body leans in `fwd` degrees from the hips (spine 70%, chest 30%) while
 * the head keeps its aim: `face` is where the face ends up relative to the
 * stance (+ tips it toward the ground, - up to the sky), `turn` turns the
 * head toward its left (+), `tilt` rolls it (+ toward its right).
 */
const lean = (fwd: number, face = 0, turn = 0, tilt = 0): Pose => ({
  bones: { spine: { x: fwd * 0.7 }, chest: { x: fwd * 0.3 }, head: { x: face - fwd, y: turn, z: tilt } },
});
/** The spine twisted toward its left (+y: the left side draws back) and tilted (+z: the top toward its right). */
const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y, z } } });
/**
 * The wing tufts: raised (+) or folded down against the body (-), swept
 * forward (+) or back (-). Mirrored left and right; the back feather of
 * each tuft moves a little less.
 */
const wings = (raise: number, sweep = 0): Pose => ({
  bones: {
    wingAL: { z: raise, y: -sweep }, wingBL: { z: raise, y: -sweep }, wingCL: { z: raise * 0.85, y: -sweep * 0.85 },
    wingAR: { z: -raise, y: sweep }, wingBR: { z: -raise, y: sweep }, wingCR: { z: -raise * 0.85, y: sweep * 0.85 },
  },
});
/** The crest's three plumes: stood up (+) or swept further back (-), and fanned apart. */
const crest = (lift: number, fan = 0): Pose => ({
  bones: { crest: { x: lift }, crestL: { x: lift, z: fan }, crestR: { x: lift, z: -fan } },
});
/** The tail feathers: cocked up (-) or down (+), wagged toward its left (+y). */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });

// Legs for talon rakes, sand kicks and pawing. A leg is aimed in every key of
// a clip that moves it; planted keys pin the foot's height with IK and keep
// where the aim put it (so a planted foot aimed back scrapes the ground).
type Dir = [number, number, number];
const legL = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighL: { dir: thigh }, shinL: { dir: shin } } });
const legR = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighR: { dir: thigh }, shinR: { dir: shin } } });
/** Where the legs point at rest (their bind directions: thigh down and back, shin down). */
const LEG_REST_L = legL([0, -0.935, -0.355], [0, -0.98, 0.2]);
const LEG_REST_R = legR([0, -0.935, -0.355], [0, -0.98, 0.2]);
/** A foot drawn back along the ground (a scrape, a paw, a scratch). */
const SCRAPE_L = legL([0.05, -0.78, -0.62], [0.02, -0.62, -0.78]);
const SCRAPE_R = legR([-0.05, -0.78, -0.62], [-0.02, -0.62, -0.78]);

// Moments -----------------------------------------------------------------

/**
 * Standing ready: the life layer breathes and bounces it; on top, a chick's
 * idle: a curious head tilt, a little puff of the chest and, once a loop, a
 * quick flutter of the wing tufts.
 */
const idle: Clip = {
  name: 'idle',
  duration: 4,
  loop: true,
  keys: [
    key(0),
    key(0.9, pelvis(0.003, -0.004), lean(1.5, 1, 5, 7), wings(-2)),
    key(1.8, pelvis(0.002, -0.002), lean(0.5, 0.5, 2, 3)),
    // A little puff and a flutter.
    key(2.35, pelvis(0, 0.003), lean(-3, -5), wings(8)),
    key(2.5, pelvis(0, 0.002), lean(-3.5, -6), wings(20, -2)),
    key(2.62, pelvis(0, 0.002), lean(-3.5, -6), wings(4)),
    key(2.74, pelvis(0, 0.002), lean(-3, -5), wings(16, -2)),
    key(2.9, pelvis(0, 0), lean(-1.5, -3), wings(2)),
    key(3.3, pelvis(-0.003, -0.003), lean(1, 1, -3, -4)),
    key(4),
  ],
};

/**
 * Out of its ball: curled up small, then it bursts up tall with its wing
 * tufts flung open and its crest standing, cheeps its cry with two flaps,
 * and bobs down into its stance, ready (its stock front animation stretches).
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, pelvis(0, -0.034), lean(4, 12), wings(-12, 10), crest(-24), tail(10), SHUT),
    key(0.16, pelvis(0, -0.04), lean(6, 14), wings(-14, 12), crest(-27), tail(12), SHUT),
    // Bursts up, the beak wide.
    snap(0.34, pelvis(0, 0.012), lean(-6, -14), wings(36, -6), crest(24, 12), tail(-22), jaw(34), ANGRY),
    // The cry: a moving hold, two flaps (the body bouncing with them) and a
    // shake of the head.
    key(0.46, pelvis(0, -0.004, 0.006), lean(-1, -11, 6, 3), wings(12, -2), crest(22, 12), tail(-20), jaw(36), ANGRY),
    key(0.58, pelvis(0, 0.012), lean(-6, -14), wings(32, -6), crest(23, 12), tail(-22), jaw(38), ANGRY),
    key(0.7, pelvis(0, -0.004, 0.006), lean(-1, -11, -6, -3), wings(10, -2), crest(22, 12), tail(-20), jaw(36), ANGRY),
    key(0.82, pelvis(0, 0.011), lean(-5, -12, -2, -1), wings(28, -4), crest(20, 11), tail(-20), jaw(30), ANGRY),
    key(0.98, pelvis(0, 0.006), lean(-3, -7), wings(6), crest(10, 6), tail(-12), jaw(8), ANGRY),
    // Bobs down into its stance, ready.
    key(1.16, pelvis(0, -0.018), lean(5, 8), wings(-2), crest(0), tail(-4), ANGRY),
    key(1.36, pelvis(0, 0.002), lean(0, -1), ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'cry' }],
};

/** Taking a hit: snaps back with a squawk and its wing tufts flared, then shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.55,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.008, -0.012), lean(-10, -20, 0, 8), wings(30, -8), tail(-14), jaw(14), HURT),
    key(0.17, pelvis(0, -0.005, -0.006), lean(-4, -8, 0, 3), wings(12, -3), tail(-6), jaw(6), HURT),
    key(0.31, pelvis(0, -0.002), lean(0, -2, -3), wings(-2), HURT),
    key(0.42, lean(0, 0, 3), ANGRY),
    key(0.55, OPEN_EYES),
  ],
};

/**
 * Fainting, worn out: a woozy sway with drooping eyes, then it plops down
 * onto its bottom with its head drooping to one side, eyes shut and wing
 * tufts folded, and from the 'shrink' it shrinks away. It sits back as it
 * drops, so the big head stays over its feet.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.004, -0.004), lean(-3, -6, 0, 9), wings(-4), DROWSY),
    key(0.4, pelvis(0, -0.02, -0.01), lean(2, 4, 0, -8), wings(-10), crest(-6), DROWSY),
    fall(0.7, pelvis(0, -0.07, -0.024), lean(6, 14, 0, 17), wings(-18, 10), crest(-18), tail(8), SHUT),
    key(0.84, pelvis(0, -0.076, -0.026), lean(7, 16, 0, 19), wings(-19, 11), crest(-20), tail(9), SHUT),
    key(1.6, pelvis(0, -0.073, -0.026), lean(6, 15, 0, 20), wings(-18, 11), crest(-18), tail(9), SHUT),
  ],
  events: [{ t: 1.02, name: 'shrink' }],
};

// Contact -----------------------------------------------------------------

/**
 * Scratch (strike; also Slash, Aerial Ace, Cut, Rock Smash, Mega Kick): a
 * barnyard talon rake. It rocks back onto its right foot with the body
 * turned away and the near foot cocked up and out by its belly, talons out;
 * then the foot rakes down and across through the foe as the body unwinds
 * into it with a squawk (the crest whips toward the foe: what our side
 * sees), carries on down, stamps and it straightens with a flick of the
 * crest. Legs have no overlap delay: the impact is on the rake.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 0.9,
  keys: [
    key(0, LEG_REST_L),
    key(0.06, { plantLeft: 0.3 }, pelvis(-0.008, 0.002, -0.006), lean(-4, -3, -6, -2), twist(8, 4), wings(20, -8), tail(-8), ANGRY,
      legL([0.35, -0.3, 0.89], [0.3, -0.75, 0.59])),
    // Cocked: knee up and out by the belly, talons out at the foe, the body
    // rocked back onto the right foot and turned away.
    key(0.13, { plantLeft: 0 }, pelvis(-0.012, 0.006, -0.01), lean(-12, -8, -14, -8), twist(20, 12), wings(30, -14), crest(2, 4), tail(-12), jaw(6), ANGRY,
      legL([0.62, 0.45, 0.64], [0.6, -0.15, 0.79])),
    // The rake: down and across through the foe, the body unwinding into it.
    snap(0.18, { plantLeft: 0 }, pelvis(-0.004, -0.012, 0.014), lean(14, -6, 12, 6), twist(-18, -12), wings(8, 14), crest(-2), tail(-6), jaw(30), ANGRY,
      legL([-0.2, -0.3, 0.93], [-0.3, -0.7, 0.65])),
    // Follow-through: the foot carries on down across its body.
    key(0.29, { plantLeft: 0 }, pelvis(-0.003, -0.018, 0.012), lean(16, -4, 14, 7), twist(-20, -13), wings(4, 12), crest(-5), tail(-4), jaw(12), ANGRY,
      legL([-0.3, -0.75, 0.58], [-0.25, -0.95, 0.2])),
    // Stamps down, the knees taking it.
    key(0.41, pelvis(0, -0.02, 0.005), lean(8, 2, 4, 2), twist(-6, -3), wings(0, 4), jaw(4), ANGRY, LEG_REST_L),
    // Straightens with a flick of the crest.
    key(0.56, pelvis(0, -0.004), lean(-2, -4, -2, 4), crest(4, 4), ANGRY, LEG_REST_L),
    key(0.9, OPEN_EYES, LEG_REST_L),
  ],
  events: [{ t: 0.19, name: 'impact' }],
};

/**
 * Peck: the beak is the weapon. It cocks its head back, then the whole body
 * drives the beak forward and a little down into the foe with the wing
 * tufts swept back (the face on the foe: a crown-first dive is the
 * tackle's); it rebounds and gives its head a shake.
 */
const peck: Clip = {
  name: 'peck',
  duration: 0.8,
  keys: [
    key(0),
    key(0.08, pelvis(0, 0.004, -0.012), lean(-8, -18), wings(10, -8), crest(-9), tail(-6), ANGRY),
    // The jab: the beak leads, forward and a little down at the foe.
    snap(0.15, pelvis(0, -0.014, 0.022), lean(20, 12), wings(4, -18), crest(-21), tail(-14), jaw(3), ANGRY),
    key(0.25, pelvis(0, -0.016, 0.021), lean(21, 13), wings(3, -18), crest(-22), tail(-14), jaw(2), ANGRY),
    // Rebounds and shakes its head once.
    key(0.38, pelvis(0, -0.004, -0.004), lean(-3, -6), wings(10, -4), crest(2), jaw(2), ANGRY),
    key(0.5, pelvis(0, -0.006), lean(0, -2, 6, 3), ANGRY),
    key(0.6, lean(0, -1, -4, -2), ANGRY),
    key(0.8, OPEN_EYES),
  ],
  // The head trails the body (overlap): the beak lands just after the key.
  events: [{ t: 0.2, name: 'impact' }],
};

/**
 * Quick Attack, Facade, Secret Power (tackle): a quick dip and pull-back,
 * and it darts headlong at the foe, crown first with its wing tufts swept
 * back and its crest streaming; it bounces off and settles. The wind-up is
 * short: the game's dash starts at once.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 0.95,
  keys: [
    key(0),
    key(0.07, pelvis(0, -0.026, -0.012), lean(-5, -6), wings(8, -18), crest(-12), tail(-10), ANGRY),
    snap(0.14, pelvis(0, -0.012, 0.022), lean(30, 38), wings(-4, -28), crest(-42), tail(-20), ANGRY),
    key(0.23, pelvis(0, -0.018, 0.021), lean(31, 34), wings(-4, -26), crest(-42), tail(-20), jaw(18), ANGRY),
    // Bounces off the foe.
    key(0.36, pelvis(0, -0.004, -0.006), lean(-6, -8), wings(14, -4), crest(3), tail(-8), jaw(6), ANGRY),
    key(0.52, pelvis(0, -0.012), lean(2, 2), wings(2), ANGRY),
    key(0.95, OPEN_EYES),
  ],
  events: [{ t: 0.17, name: 'impact' }],
};

/**
 * Strong contact (Double-Edge, Return, Frustration, Strength; Body Slam;
 * Mega Punch and Counter, which it throws with its body, having no fists):
 * it settles back and paws the ground with its right foot like a bull, coils
 * low with its head down, then throws its whole round body at the foe crown
 * first, squashes against it, bounces back dazed and shakes its head.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 1.5,
  keys: [
    key(0, LEG_REST_R),
    key(0.1, pelvis(0.004, -0.016, -0.01), lean(-4, 4), wings(6, -14), crest(-12), tail(-12), ANGRY, LEG_REST_R),
    // Paws the ground: the right foot scrapes back through the dirt.
    key(0.22, pelvis(0.008, -0.024, -0.012), lean(2, 8), wings(4, -18), crest(-15), tail(-14), ANGRY, SCRAPE_R),
    // Coiled low, head down.
    key(0.34, pelvis(0, -0.04, -0.014), lean(4, 14), wings(0, -24), crest(-24), tail(-16), ANGRY, LEG_REST_R),
    // The charge: the whole round body thrown head first.
    snap(0.44, pelvis(0, -0.016, 0.02), lean(30, 40), wings(-6, -28), crest(-42), tail(-22), ANGRY, LEG_REST_R),
    // Squashed against the foe.
    key(0.54, pelvis(0, -0.028, 0.019), lean(31, 38), wings(-6, -26), crest(-42), tail(-20), jaw(20), ANGRY, LEG_REST_R),
    // Bounced back, dazed: a shake of the head.
    key(0.7, pelvis(0, -0.01, -0.008), lean(-8, -10, 8, 6), wings(16, -4), crest(4, 4), tail(-8), jaw(8), HURT, LEG_REST_R),
    key(0.84, pelvis(0, -0.012, -0.004), lean(-3, -4, -8, -5), wings(8), crest(2), jaw(4), HURT, LEG_REST_R),
    key(0.98, pelvis(0, -0.01), lean(0, 0, 5, 3), wings(4), ANGRY, LEG_REST_R),
    key(1.16, pelvis(0, -0.006), lean(1, 2), ANGRY, LEG_REST_R),
    key(1.5, OPEN_EYES, LEG_REST_R),
  ],
  events: [{ t: 0.47, name: 'impact' }],
};

/**
 * Dig (burrow): head down, it scratches at the ground with both feet in
 * turn (dig: the dirt flies), coils low and bursts up out of it, stretched
 * tall with its beak open (impact). The game plays it on both turns: going
 * under (its sprite sinks as it scratches) and coming up.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 1.5,
  keys: [
    key(0, LEG_REST_L, LEG_REST_R),
    key(0.1, pelvis(0, -0.026, -0.004), lean(8, 24), wings(10, -10), crest(-12), tail(-10), ANGRY, LEG_REST_L, LEG_REST_R),
    // Scratches: left, right, left, right.
    key(0.2, pelvis(0.005, -0.03, -0.004), lean(10, 26), wings(14, -12), tail(-12), ANGRY, SCRAPE_L, LEG_REST_R),
    key(0.3, pelvis(-0.005, -0.03, -0.004), lean(10, 26), wings(10, -10), tail(-12), ANGRY, LEG_REST_L, SCRAPE_R),
    key(0.4, pelvis(0.005, -0.03, -0.004), lean(10, 26), wings(14, -12), tail(-12), ANGRY, SCRAPE_L, LEG_REST_R),
    key(0.5, pelvis(-0.005, -0.03, -0.004), lean(10, 26), wings(10, -10), tail(-12), ANGRY, LEG_REST_L, SCRAPE_R),
    // Coils low...
    key(0.64, pelvis(0, -0.042, -0.008), lean(6, 16), wings(-4, -16), crest(-21), tail(-14), ANGRY, LEG_REST_L, LEG_REST_R),
    // ...and bursts up out of it, stretched tall, beak open, wing tufts flung up.
    snap(0.76, pelvis(0, 0.014, 0.012), lean(-4, -16), wings(34, -8), crest(10, 10), tail(-22), jaw(26), ANGRY, LEG_REST_L, LEG_REST_R),
    key(0.9, pelvis(0, 0.012, 0.01), lean(-5, -15, 3, 2), wings(26, -6), crest(9, 10), tail(-20), jaw(20), ANGRY, LEG_REST_L, LEG_REST_R),
    key(1.08, pelvis(0, -0.014), lean(4, 4), wings(4), crest(0), jaw(2), ANGRY, LEG_REST_L, LEG_REST_R),
    key(1.5, OPEN_EYES, LEG_REST_L, LEG_REST_R),
  ],
  events: [{ t: 0.2, name: 'dig' }, { t: 0.8, name: 'impact' }],
};

// Ranged ------------------------------------------------------------------

/**
 * Ember (spit): the fire comes up from its belly: a quick hunch as it
 * forms, then the head thrusts forward, the face up at the foe, and the
 * beak spits it (the game's embers leave at once); a recoil bob back and
 * up, and it settles.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 0.85,
  keys: [
    key(0),
    // The fire rises: a hunch, the belly heaving.
    key(0.05, pelvis(0, -0.024, -0.008), lean(8, 16), wings(-8, 10), crest(-12), tail(6), ANGRY),
    // Spat: a sharp thrust of the head, beak wide, held while the embers fly.
    snap(0.1, pelvis(0, -0.002, 0.016), lean(11, -8), wings(22, -6), crest(14, 6), tail(-14), jaw(38), ANGRY),
    key(0.2, pelvis(0, -0.004, 0.017), lean(12, -7), wings(16, -4), crest(12, 6), tail(-14), jaw(34), ANGRY),
    // Recoil: the head bobs back and up as the beak closes.
    key(0.32, pelvis(0, 0.002, -0.004), lean(-2, -13), wings(10), crest(11), tail(-8), jaw(12), ANGRY),
    key(0.48, pelvis(0, -0.006), lean(2, 1), jaw(2), ANGRY),
    key(0.85, OPEN_EYES),
  ],
  events: [{ t: 0.14, name: 'release' }],
};

/**
 * Fire Spin, Flamethrower (breath): a quick breath with the chest up and the
 * eyes shut, then the head drives forward and a stream of fire pours from
 * the beak while the head sweeps; the beak shuts and it shakes off the heat.
 * The game's flames leave early, so the breath is short.
 */
const breath: Clip = {
  name: 'breath',
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
 * Strong ranged (Fire Blast, Overheat, Hidden Power): it gathers the fire in
 * its belly, curled small with its eyes squeezed shut, swells up tall with
 * its wing tufts flung wide and its crest standing, then blasts it from the
 * beak with the head thrust forward; the recoil pushes it back and it holds
 * with a tremor, then sags, spent, and shakes it off.
 */
const specialStrong: Clip = {
  name: 'special_strong',
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
    // The beak shuts, it sags, spent, and shakes it off.
    key(1.32, pelvis(0, -0.022), lean(4, 6), wings(4), crest(1), tail(-6), jaw(4), DROWSY),
    key(1.52, pelvis(0, -0.012), lean(1, 0, 6, 3), ANGRY),
    key(1.68, pelvis(0, -0.006), lean(0, -2, -4, -2), ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.08, name: 'charge' }, { t: 0.87, name: 'release' }],
};

/**
 * Swift, Rock Tomb, Rock Slide (throw): it winds up with its wing tufts
 * drawn back and up and its body turned, then whips round and flaps them
 * forward hard, twice, bobbing with each flap, flinging the volley (the
 * stars leave the wing tufts; the rocks fall on the foe from above).
 */
const throwClip: Clip = {
  name: 'throw',
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
  // The wing tufts trail the body a little (overlap): the volley leaves on their sweep.
  events: [{ t: 0.21, name: 'release' }],
};

/**
 * Mud-Slap (fling): weight onto its right foot, the left foot scoops back
 * through the mud and flicks it forward, low along the ground, at the foe
 * (the clods leave the foot: legs have no overlap), and stamps back down. A
 * foot raised higher reads as a hand from the foe's side.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.1,
  keys: [
    key(0, LEG_REST_L),
    key(0.1, pelvis(-0.006, -0.02, -0.008), lean(4, 8), twist(8), wings(10, -12), tail(-8), ANGRY, SCRAPE_L),
    snap(0.2, { plantLeft: 0 }, pelvis(-0.008, -0.004, -0.008), lean(-10, -10, -4, -4), twist(-8), wings(26, 10), tail(-14), jaw(14), ANGRY,
      legL([0.12, -0.3, 0.95], [0.1, -0.05, 0.99])),
    key(0.31, { plantLeft: 0 }, pelvis(-0.007, -0.006, -0.007), lean(-8, -8, -3, -3), twist(-6), wings(20, 6), tail(-12), jaw(8), ANGRY,
      legL([0.12, -0.45, 0.88], [0.1, -0.35, 0.93])),
    key(0.46, pelvis(0, -0.018, 0.003), lean(6, 2), wings(2), ANGRY, LEG_REST_L),
    key(0.62, pelvis(0, -0.004), lean(-1, -2, -4, -3), ANGRY, LEG_REST_L),
    key(1.1, OPEN_EYES, LEG_REST_L),
  ],
  events: [{ t: 0.2, name: 'release' }],
};

/**
 * Snore (sound): asleep on its feet, eyes shut and head drooping, it snores
 * twice: the head tips back with the beak open and the body swells, then
 * droops again; it wakes with a start.
 */
const sound: Clip = {
  name: 'sound',
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

// Status ------------------------------------------------------------------

/**
 * Focus Energy (buff; also Swords Dance, Mirror Move, Sleep Talk): it
 * gathers itself, crouched small with its eyes squeezed shut, wing tufts
 * folded and crest flat; then fires up: stretched tall, chest out, crest
 * standing and fanned, wing tufts flung open and fluttering while the aura
 * rises; and relaxes.
 */
const statusSelf: Clip = {
  name: 'status_self',
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
 * Growl (roar; also Mimic, and Toxic spat from the beak): a chick's fierce
 * scolding. It rears back drawing breath, then thrusts its head at the foe
 * with the beak wide, crest up and wing tufts flared, shaking its head from
 * side to side as it cries; the beak shuts. The game's noise lines leave at
 * once, so the cry comes quickly.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.2,
  keys: [
    key(0),
    // Rears back and draws breath, chest up.
    key(0.06, pelvis(0, 0.008, -0.006), lean(-5, -14), wings(12, -10), crest(3), tail(-10), ANGRY),
    // The cry: head thrust at the foe, beak wide, crest up, wing tufts flared.
    snap(0.12, pelvis(0, -0.004, 0.014), lean(12, -8), wings(28, 4), crest(17, 10), tail(-16), jaw(42), ANGRY),
    // Scolding: the head shakes from side to side while it cries.
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
 * Sand-Attack (kick_sand): weight back onto its left foot, the right foot
 * draws back along the ground, then kicks forward low, flinging sand at the
 * foe, and stamps back down (legs have no overlap: the sand flies on the
 * kick).
 */
const kickSand: Clip = {
  name: 'kick_sand',
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
    key(1.1, OPEN_EYES, LEG_REST_R),
  ],
  events: [{ t: 0.17, name: 'emit' }],
};

/**
 * Protect, Endure, Substitute (shield): it hunkers down behind its wing
 * tufts, swept forward over its chest, with its eyes squeezed shut and its
 * crest flat, trembling a little; then pops back up.
 */
const shield: Clip = {
  name: 'shield',
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
 * Sunny Day (weather): a fire type calling the sun. It dips with its eyes
 * shut, then rises with its face turned up to the sky, beak open and wing
 * tufts spread, basking and chirping; it comes back down, content.
 */
const weather: Clip = {
  name: 'weather',
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

/**
 * Rest (heal): a big yawn, then it settles down onto its bottom and dozes
 * off, head drooping to one side and breathing slowly while it heals; it
 * wakes refreshed.
 */
const heal: Clip = {
  name: 'heal',
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
 * Attract, Swagger (charm): a coy little act at the foe: its head tilts one
 * way then the other with happy eyes, the tail wagging behind, a bob and a
 * cheep.
 */
const charm: Clip = {
  name: 'charm',
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
 * Double Team (afterimage): it ducks and weaves from side to side on the
 * spot, quick as a chick, wing tufts up; the game's afterimages swing out on
 * both sides from the aura.
 */
const afterimage: Clip = {
  name: 'afterimage',
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

export const TORCHIC_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, peck, tackle, burrow,
    specialWeak, specialStrong, breath, throwClip, fling, sound,
    statusSelf, statusTarget, kickSand, shield, weather, heal, charm, afterimage,
  ].map((c) => [c.name, c]),
);

/** Eye atlas (pm0255_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const TORCHIC_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  worried: [1, 2],
  hurt: [0, 3],
};
