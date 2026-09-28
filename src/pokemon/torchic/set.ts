// Torchic's battle animation set, made the way Blaziken's first clips are
// (../blaziken/first.ts, the reference for every species): each clip a short
// list of key poses written by hand over the stance, extremes first
// (anticipation, the action, follow-through, recovery), started from the
// first clip that does that action and re-timed for a light, quick chick.
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//                   (1: at the foe, where the pose at each impact touches it:
//                   src/battle3d/battler.ts blowTravel)
//   root     offsets of the whole body in heights (a leap's arc in y, a
//            thrust toward the foe in z) and its turns (spins, dives)
//   pelvis   hips and spine roots together, in heights (crouches)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (TORCHIC_EXPRESSIONS)
// Events: impact (a blow lands), grab / throw (a toss), dig (goes under),
// release / releaseEnd (fire leaves the beak), charge, emit, aura, cry,
// shrink.
//
// How Torchic's body shapes the first clips' beats:
//   - no neck: the big round head sits on the chest, so a body leaning in
//     tips the face to the ground unless the head pitches back against it
//     (bend(): spine + chest + head is where the face ends up);
//   - no arms: the tiny wing tufts at the collar do what Blaziken's arms do
//     when they are not striking (a guard held up and out, swept back for
//     balance in a dash, flung open in a cry, folded in when it gathers),
//     and one flung out is its fist;
//   - its beak sticks out 0.3 of its height ahead of its middle and its legs
//     are short (0.2 of its height): a blow with the feet goes in high,
//     leaning back, so the talons lead and the beak rides above the foe's
//     head; a blow with the head dives in crown first;
//   - legs that bend backward, like a bird's (rig.ts): folded up under the
//     body in a leap, leaning back under a lunge (stay());
//   - light and springy: higher, quicker leaps than Blaziken's, lighter
//     landings, the same beats.
// The animator adds overlapping action (the head trails the body by
// 0.045 s, the crest and wing tufts more: index.ts), breathing, blinks, and
// springs on the crest, the tail and the wing tufts.

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

type Dir = [number, number, number];

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const HAPPY: Pose = { expression: 'happy' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** The whole body: offsets in heights (x its left, y up, z toward the foe), turns in degrees. */
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
/**
 * Pitch from the hips to the head (no neck: the head sits on the chest),
 * with the head's turn (+y to its left) and tilt (+z to its right). The
 * face ends up spine + chest + head from where the stance holds it.
 */
const bend = (spine: number, chest: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, head: { x: head, y: headY, z: headZ } },
});
/** The torso turned toward its left (+: the right side comes forward), the head turning back by `look` to keep its eyes on the foe. */
const twist = (y: number, look = -y): Pose => ({ bones: { spine: { y: y * 0.7 }, chest: { y: y * 0.3 }, head: { y: look } } });
/**
 * The wing tufts (three feathers a side at the collar): raised (+) or
 * folded down (-), swept forward (+) or back (-), both sides alike.
 */
const wings = (raise: number, sweep = 0): Pose => ({
  bones: {
    wingAL: { z: raise, y: -sweep }, wingBL: { z: raise, y: -sweep }, wingCL: { z: raise * 0.85, y: -sweep * 0.85 },
    wingAR: { z: -raise, y: sweep }, wingBR: { z: -raise, y: sweep }, wingCR: { z: -raise * 0.85, y: sweep * 0.85 },
  },
});
/** The right wing tuft alone, on top of both (raised +, swept forward +). */
const wingR = (raise: number, sweep = 0): Pose => ({
  bones: { wingAR: { z: -raise, y: sweep }, wingBR: { z: -raise, y: sweep }, wingCR: { z: -raise * 0.85, y: sweep * 0.85 } },
});
/** The crest's three plumes stood up (+) or laid back (-), and fanned (+). */
const crest = (lift: number, fan = 0): Pose => ({
  bones: { crest: { x: lift }, crestL: { x: lift, z: fan }, crestR: { x: lift, z: -fan } },
});
/** The tail feathers raised (-) or lowered (+). */
const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });
/** Both legs aimed: [thigh, shin] of the left, then the right. */
const legs = (l: [Dir, Dir], r: [Dir, Dir]): Pose => ({
  aim: { thighL: { dir: l[0] }, shinL: { dir: l[1] }, thighR: { dir: r[0] }, shinR: { dir: r[1] } },
});
/** The left leg as given, the right one as the stance has it (and the other way round). */
const legL = (l: [Dir, Dir]): Pose => legs(l, REST_R);
const legR = (r: [Dir, Dir]): Pose => legs(REST_L, r);

/** Where the legs rest (the stance's): thigh down and back, shin down. */
const REST_L: [Dir, Dir] = [[0, -0.935, -0.355], [0, -0.98, 0.2]];
const REST_R: [Dir, Dir] = [[0, -0.935, -0.355], [0, -0.98, 0.2]];
/** A leg folded up under the body (in the air). */
const FOLD_L: [Dir, Dir] = [[0.03, -0.62, -0.78], [0.02, -0.55, 0.83]];
const FOLD_R: [Dir, Dir] = [[-0.03, -0.62, -0.78], [-0.02, -0.55, 0.83]];
/** A direction pitched back (+deg: its lower end swings back) about the body's side axis. */
const tilt = (d: Dir, deg: number): Dir => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [d[0], d[1] * c - d[2] * s, d[1] * s + d[2] * c];
};
/** From the hip to the ankle at rest, in heights. */
const LEG_REACH = 0.154;
/**
 * On its feet while the body is shifted `dz` heights toward the foe (a
 * lunge, + ) or back ( - ): both legs lean back (or forward) under it so the
 * planted feet stay where they stand instead of sliding with the body.
 */
const stay = (dz: number): Pose => {
  const deg = (Math.asin(Math.max(-0.9, Math.min(0.9, dz / LEG_REACH))) * 180) / Math.PI;
  return legs([tilt(REST_L[0], deg), tilt(REST_L[1], deg)], [tilt(REST_R[0], deg), tilt(REST_R[1], deg)]);
};

// The wing tufts, as Blaziken's arms: the guard, swept back, flung open, folded in.
/** Held up and out, a little forward: its guard. */
const GUARD: Pose = wings(8, 8);
/** Swept back for balance while the head or body leads (dashes, beak jabs). */
const WINGS_BACK: Pose = wings(10, -28);
/** Flung open wide: the battle cry. */
const SPREAD: Pose = wings(30, -6);
/** Folded down against the body (gathering, curling up). */
const FOLDED: Pose = wings(-20, 12);
/** Pressed back and down, braced for a blast. */
const BRACED: Pose = wings(-8, -14);

/** Airborne, travelling forward: the leading (right) foot tucked up under the belly, the left pushed off behind. */
const TUCK: Pose = { plantFeet: 0, ...legs([[0.03, -0.75, -0.66], [0.02, -0.72, -0.69]], [[-0.03, -0.55, -0.83], [-0.02, -0.6, 0.8]]) };
/** Airborne, hopping: both feet folded up under the body. */
const HOP: Pose = { plantFeet: 0, ...legs(FOLD_L, FOLD_R) };
/** Landing: the short legs take the weight, the body dips in and the face stays up. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.02 }, bones: { spine: { x: 6 }, head: { x: -6 } } };
/** A deep landing, from a big leap. */
const LAND_DEEP: Pose = { plantFeet: 1, pelvis: { y: -0.036 }, bones: { spine: { x: 10 }, chest: { x: 3 }, head: { x: -12 } } };

// Its feet as weapons.
/** Both feet thrown up in front, talons out (a rooster's spring). */
const FEET_UP: Pose = legs([[0.08, 0.45, 0.89], [0.03, -0.1, 0.99]], [[-0.08, 0.45, 0.89], [-0.03, -0.1, 0.99]]);
/** Both feet driven forward and down at what is in front of them, talons first. */
const FEET_STRIKE: Pose = legs([[0.06, 0.05, 1], [0.02, -0.62, 0.78]], [[-0.06, 0.05, 1], [-0.02, -0.62, 0.78]]);
/** Both feet raked down and back through it, under the body. */
const FEET_RAKED: Pose = legs([[0.05, -0.7, 0.71], [0.02, -0.96, -0.28]], [[-0.05, -0.7, 0.71], [-0.02, -0.96, -0.28]]);
/** A kick chambered: the foot drawn up under the belly, the other folded (right kick, then left). */
const CHAMBER_R: Pose = legs(FOLD_L, [[-0.04, -0.5, -0.87], [-0.02, -0.15, 0.99]]);
const CHAMBER_L: Pose = legs([[0.04, -0.5, -0.87], [0.02, -0.15, 0.99]], FOLD_R);
/** The kick: the leg shot straight out at the foe, the sole leading. */
const KICK_R: Pose = legs(FOLD_L, [[-0.06, 0.12, 0.99], [-0.03, 0.18, 0.98]]);
const KICK_L: Pose = legs([[0.06, 0.12, 0.99], [0.03, 0.18, 0.98]], FOLD_R);
/** The right foot drawn back along the ground (a scrape: sand, a bull's pawing, digging). */
const SCRAPE_R: [Dir, Dir] = [[-0.03, -0.8, -0.6], [-0.02, -0.7, -0.71]];
/** The right foot flicked forward low along the ground. */
const FLICK_R: [Dir, Dir] = [[-0.05, -0.3, 0.95], [-0.03, -0.45, 0.89]];
/** The left foot drawn back, and flicked forward. */
const SCRAPE_L: [Dir, Dir] = [[0.03, -0.8, -0.6], [0.02, -0.7, -0.71]];

// Clips -----------------------------------------------------------------------

/** Standing ready: the life layer breathes and bounces it; a little tilt of the head each way. */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.8, pelvis(0, -0.004), bend(1.5, 0.5, -1.5, 4, 3), wings(3, 1)),
    key(1.6, pelvis(0, -0.002), bend(0.5, 0, -0.5, -3, -2), wings(-1)),
    key(2.4),
  ],
};

/**
 * Sent out: curled up small out of its ball, it bursts up tall with its wing
 * tufts flung open and its crest standing and cheeps its cry, the head
 * shaking, then bobs down into its stance (Blaziken's battle cry).
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.6,
  keys: [
    key(0, pelvis(0, -0.03), bend(14, 4, 4), FOLDED, crest(-16), tail(8), SHUT),
    key(0.2, pelvis(0, -0.04), bend(18, 5, 5), wings(-22, 14), crest(-20), tail(10), SHUT),
    snap(0.4, pelvis(0, 0.014), bend(-10, -6, -2), SPREAD, crest(16, 10), tail(-14), jaw(34), ANGRY),
    key(0.6, pelvis(0, 0.01), bend(-9, -6, -2, 0, 5), wings(26, -4), crest(15, 10), tail(-12), jaw(30), ANGRY),
    key(0.78, pelvis(0, 0.012), bend(-10, -6, -2, 0, -5), SPREAD, crest(16, 10), tail(-14), jaw(32), ANGRY),
    key(0.96, pelvis(0, 0.008), bend(-7, -4, -2), wings(16, -2), crest(9, 6), tail(-6), jaw(8), ANGRY),
    key(1.16, pelvis(0, -0.012), bend(5, 2, -6), GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Scratch, Slash, Cut, Aerial Ace, Rock Smash, Smelling Salt (strike): a
 * rooster's talon rake. It winds up, leaps in along an arc and lands coiled
 * in front of the foe; then it springs up over its face leaning back, wing
 * tufts beating up and both feet thrown up, drives the talons into its face
 * and rakes them down across it as it drops, lands deep and hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.32,
  keys: [
    key(0),
    // Wind up: a crouch, the body leaning in, the wing tufts drawn back, eyes on the foe.
    key(0.12, pelvis(0, -0.024), bend(8, 3, -11), wings(12, -18), crest(4), ANGRY),
    // Leap along an arc, legs tucked.
    key(0.25, { advance: 0.55 }, root({ y: 0.13 }), TUCK, bend(2, 0, -4), wings(24, -10), ANGRY),
    // Land in front of the foe, coiled low, sitting back to spring.
    key(0.35, { advance: 1 }, LAND, pelvis(0, -0.016), bend(-2, 0, -2), wings(10, -18), ANGRY),
    // Spring up over its face leaning back, wing tufts beating up, both feet thrown up.
    key(0.44, { advance: 1 }, root({ y: 0.3, z: 0.08 }), FEET_UP, { plantFeet: 0 }, bend(-14, -6, 6), wings(36, 0), crest(10), ANGRY),
    // The talons driven into its face.
    snap(0.49, { advance: 1 }, root({ y: 0.26, z: 0.14 }), FEET_STRIKE, { plantFeet: 0 }, bend(-8, -3, 2), wings(10, 10), crest(6), jaw(20), ANGRY),
    // Raked down across it as it drops, the wing tufts beating down.
    key(0.6, { advance: 1 }, root({ y: 0.07, z: 0.1 }), FEET_RAKED, { plantFeet: 0 }, bend(2, 2, -8), wings(-6, 14), crest(2), jaw(10), ANGRY),
    // Follow-through: down on its feet, low, face up at the foe.
    fall(0.67, { advance: 1 }, root({ z: 0.06 }), LAND_DEEP, bend(4, 2, -10), wings(6, 10), ANGRY),
    key(0.82, { advance: 1 }, root({ z: 0.06 }), pelvis(0, -0.02), bend(3, 1, -8), GUARD, ANGRY),
    // Hop home.
    key(0.98, { advance: 0.45 }, root({ y: 0.09, z: 0.03 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.1, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.32, OPEN_EYES),
  ],
  events: [{ t: 0.49, name: 'impact' }],
};

/**
 * Peck: the beak is the weapon. The head cocks back, it leaps in, lands and
 * draws its head back further, then the whole body thrusts the beak into
 * the foe, the legs driving it in and the wing tufts swept back; the head
 * springs back up off the hit and it hops home.
 */
const peck: Clip = {
  name: 'peck',
  duration: 1.2,
  keys: [
    key(0),
    // Cock the head back, beak up, weight settling.
    key(0.12, pelvis(0, -0.02), bend(-6, -4, -8), crest(8), wings(8, -6), ANGRY),
    // Leap in along an arc, head still drawn back.
    key(0.25, { advance: 0.6 }, root({ y: 0.12 }), TUCK, bend(-2, -4, -12), crest(6), wings(22, -12), ANGRY),
    // Land in front of the foe and coil: the head goes further back, the wing tufts sweep back.
    key(0.35, { advance: 1 }, LAND, bend(-10, -6, -10), crest(12), WINGS_BACK, ANGRY),
    // The jab: the whole body thrusts forward from the legs, the beak leading into the foe.
    snap(0.42, { advance: 1 }, root({ z: 0.09 }), stay(0.09), pelvis(0, -0.028), bend(18, 8, -12), crest(-2), WINGS_BACK, ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.53, { advance: 1 }, root({ z: 0.04 }), stay(0.04), pelvis(0, -0.024), bend(6, 2, -16), crest(6), WINGS_BACK, ANGRY),
    key(0.7, { advance: 1 }, pelvis(0, -0.02), bend(4, 1, -7), GUARD, ANGRY),
    // Hop home.
    key(0.88, { advance: 0.45 }, root({ y: 0.09 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.0, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.2, OPEN_EYES),
  ],
  // The head trails the body a little (overlap), so the beak lands just after the key.
  events: [{ t: 0.465, name: 'impact' }],
};

/**
 * Kicks (Double Kick, Low Kick and the like, when Mimic or Mirror Move calls
 * them): it leaps in and lands in front of the foe, then two hop-kicks, the
 * body leaning back and the sole shot out into the foe, the right foot and
 * then the left with the hips turned into it, landing between them; it hops
 * home. Each hop lifts the kick to the foe's chest, the beak above its head.
 */
const physicalWeakKick: Clip = {
  name: 'physical_weak_kick',
  duration: 1.65,
  keys: [
    key(0),
    // Wind up: a crouch, leaning in.
    key(0.13, pelvis(0, -0.026), bend(10, 4, -14), GUARD, ANGRY),
    // Leap in along an arc.
    key(0.26, { advance: 0.55 }, root({ y: 0.12 }), TUCK, bend(4, 1, -5), GUARD, ANGRY),
    // Land in front of the foe.
    key(0.36, { advance: 1 }, LAND, GUARD, ANGRY),
    // Right kick: a hop up, leaning back, the foot drawn up under the belly...
    key(0.43, { advance: 1 }, root({ y: 0.14, yaw: 10 }), CHAMBER_R, { plantFeet: 0 }, bend(-8, -3, 4, -8), wings(20, -10), ANGRY),
    // ...and shot out into the foe, the hips turned into it.
    snap(0.5, { advance: 1 }, root({ y: 0.21, z: 0.03, yaw: 24 }), KICK_R, { plantFeet: 0 }, bend(-22, -9, 12, -20), wings(30, -18), jaw(12), ANGRY),
    key(0.61, { advance: 1 }, root({ y: 0.1, yaw: 14 }), CHAMBER_R, { plantFeet: 0 }, bend(-6, -2, 3, -8), wings(16, -8), ANGRY),
    // Down on both feet between the kicks.
    key(0.68, { advance: 1 }, LAND, bend(0, 0, -1), GUARD, ANGRY),
    // Left kick: the hips turned the other way into it.
    key(0.76, { advance: 1 }, root({ y: 0.14, yaw: -10 }), CHAMBER_L, { plantFeet: 0 }, bend(-8, -3, 4, 8), wings(20, -10), ANGRY),
    snap(0.83, { advance: 1 }, root({ y: 0.21, z: 0.03, yaw: -26 }), KICK_L, { plantFeet: 0 }, bend(-22, -9, 12, 22), wings(30, -18), jaw(12), ANGRY),
    key(0.94, { advance: 1 }, root({ y: 0.1, yaw: -14 }), CHAMBER_L, { plantFeet: 0 }, bend(-10, -4, 6, 12), wings(16, -8), ANGRY),
    key(1.02, { advance: 1 }, LAND, GUARD, ANGRY),
    // Hop home.
    key(1.18, { advance: 0.45 }, root({ y: 0.09 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.3, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }, { t: 0.83, name: 'impact' }],
};

/**
 * Mega Kick (physical_strong): a deep coil, a big springing leap, and at the
 * top of the arc the right foot chambered and then shot out into the foe's
 * face with the whole body behind it, leaning far back; it bounces off,
 * lands deep and hops home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.0,
  keys: [
    key(0),
    // Coil: a deep crouch, leaning in, wing tufts drawn back.
    key(0.26, pelvis(0, -0.04), bend(14, 5, -19), wings(14, -22), crest(-4), ANGRY),
    key(0.34, pelvis(0, -0.044), bend(15, 5, -20, 0, 2), wings(12, -24), crest(-5), ANGRY),
    // Spring up and in.
    key(0.52, { advance: 0.5 }, root({ y: 0.26 }), TUCK, bend(0, 0, -4), wings(30, -8), ANGRY),
    // The top of the arc: leaning back, the right foot chambered.
    key(0.64, { advance: 0.85 }, root({ y: 0.32 }), CHAMBER_R, { plantFeet: 0 }, bend(-14, -6, 8), wings(34, -4), crest(8), ANGRY),
    // The kick: the leg shot out into the foe, the whole body behind it.
    snap(0.76, { advance: 1 }, root({ y: 0.25, z: 0.04 }), KICK_R, { plantFeet: 0 }, bend(-24, -9, 14), wings(22, -20), jaw(22), ANGRY),
    // Follow-through: the leg hangs out as it bounces back off.
    key(0.88, { advance: 1 }, root({ y: 0.18, z: -0.04 }), KICK_R, { plantFeet: 0 }, bend(-16, -6, 10), wings(18, -12), jaw(14), ANGRY),
    // Lands deep in front of it.
    fall(1.04, { advance: 1 }, root({ z: -0.08 }), LAND_DEEP, bend(6, 3, -8), GUARD, ANGRY),
    key(1.28, { advance: 1 }, root({ z: -0.08 }), pelvis(0, -0.02), bend(4, 1, -5), GUARD, ANGRY),
    // Hop home.
    key(1.46, { advance: 0.45 }, root({ y: 0.1, z: -0.04 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.6, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/**
 * Mega Punch, Counter (punch): it has no fists, so it throws a haymaker with
 * its wing tuft and its whole round body behind it. Winding round as it
 * leaps in low, it lands at the foe wound right up with the right wing tuft
 * drawn back, then springs and whips round into it, the tuft swung through
 * like a fist; it carries on round a moment, drops, bounces back square to
 * the foe and hops home.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.55,
  keys: [
    key(0),
    // Wind up: a crouch, the right wing tuft drawn back.
    key(0.14, pelvis(0, -0.03), bend(10, 4, -14), twist(-18), wingR(16, -30), ANGRY),
    // Leap in low along an arc, winding round.
    key(0.28, { advance: 0.6 }, root({ y: 0.09, yaw: -16 }), TUCK, bend(6, 2, -8), twist(-16, 26), wingR(20, -34), ANGRY),
    // Land at the foe wound right round, low.
    key(0.4, { advance: 1 }, root({ yaw: -34 }), LAND, pelvis(0, -0.016), bend(6, 2, -8), twist(-12, 30), wingR(26, -40), ANGRY),
    // The haymaker: it springs and whips round into the foe, the right wing tuft swung through like a fist.
    snap(0.49, { advance: 1 }, root({ y: 0.1, yaw: 36 }), HOP, bend(2, 1, -6), twist(16, -30), wings(6, -10), wingR(34, 46), jaw(24), ANGRY),
    // Follow-through: carried on round, the tuft past it, hanging a moment.
    key(0.6, { advance: 1 }, root({ y: 0.06, yaw: 46 }), HOP, bend(4, 2, -7), twist(20, -36), wings(4, -8), wingR(30, 50), jaw(12), ANGRY),
    // Down, then a bounce back round square to the foe, guard up.
    fall(0.7, { advance: 1 }, root({ yaw: 40 }), LAND_DEEP, bend(4, 2, -8), twist(12, -32), GUARD, ANGRY),
    key(0.84, { advance: 1 }, root({ y: 0.06, yaw: 6 }), HOP, bend(2, 0, -4), twist(2, -4), GUARD, ANGRY),
    key(0.94, { advance: 1 }, LAND, GUARD, ANGRY),
    // Hop home.
    key(1.1, { advance: 0.45 }, root({ y: 0.09 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.22, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.51, name: 'impact' }],
};

/**
 * Quick Attack, Facade, Secret Power, Struggle (tackle): a blur of a dash.
 * A quick dip with the wing tufts swept back, then it streaks in low, tipped
 * forward, and rams the foe crown first; it bounces off and hops home.
 */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.1,
  keys: [
    key(0),
    // A quick dip: head down, wing tufts swept back.
    key(0.1, pelvis(0, -0.03), bend(14, 6, -8), WINGS_BACK, crest(-6), ANGRY),
    // The dash: low and fast, tipped forward, head down.
    key(0.2, { advance: 0.72 }, root({ y: 0.05, pitch: 22 }), TUCK, bend(8, 4, 8), wings(8, -32), crest(-8), ANGRY),
    // The ram: crown first into it.
    snap(0.26, { advance: 1 }, root({ y: 0.03, pitch: 30 }), TUCK, bend(10, 4, 20), wings(6, -34), crest(-12), ANGRY),
    // Bounce off.
    key(0.4, { advance: 0.76 }, root({ y: 0.09, pitch: -8 }), HOP, bend(-4, -2, -6), wings(24, -6), ANGRY),
    key(0.55, { advance: 0.4 }, root({ y: 0.06 }), HOP, bend(2, 0, -4), GUARD, ANGRY),
    key(0.7, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.27, name: 'impact' }],
};

/**
 * Double-Edge, Strength, Return, Frustration, Reversal (the strong
 * tackles): a reckless all-out charge. It paws the ground like a bull, coils
 * low with its head down, launches itself in a big leap and crashes into the
 * foe crown first with everything; it rebounds hurt, lands dazed, shakes it
 * off and hops home.
 */
const tackleStrong: Clip = {
  name: 'tackle_strong',
  duration: 1.8,
  keys: [
    key(0),
    // Paws the ground like a bull: the right foot scrapes back, head down...
    key(0.14, { plantRight: 0 }, pelvis(0.006, -0.026), legR(SCRAPE_R), bend(14, 6, -6), WINGS_BACK, crest(-4), ANGRY),
    key(0.24, pelvis(0.002, -0.03), bend(15, 6, -6), WINGS_BACK, crest(-5), ANGRY),
    // ...and again.
    key(0.34, { plantRight: 0 }, pelvis(0.006, -0.03), legR(SCRAPE_R), bend(16, 6, -6), WINGS_BACK, crest(-6), ANGRY),
    // Coil low.
    key(0.46, pelvis(0, -0.042), bend(20, 8, -6), wings(6, -30), crest(-8), ANGRY),
    // The charge: a big leap, tipped forward, head down.
    key(0.62, { advance: 0.55 }, root({ y: 0.17, pitch: 18 }), TUCK, bend(10, 4, 8), wings(10, -32), crest(-10), ANGRY),
    // The crash: crown first into it, with everything.
    snap(0.74, { advance: 1 }, root({ y: 0.05, pitch: 34 }), TUCK, bend(10, 4, 20), wings(4, -36), crest(-14), ANGRY),
    // Rebounds, hurt.
    key(0.9, { advance: 0.8 }, root({ y: 0.1, pitch: -14 }), HOP, bend(-10, -4, -8, 0, 10), wings(30, -8), jaw(16), HURT),
    fall(1.04, { advance: 0.7 }, LAND_DEEP, bend(0, 0, -4, 0, -8), wings(10), HURT),
    // Shakes it off.
    key(1.2, { advance: 0.7 }, pelvis(0, -0.02), bend(2, 0, -4, 10, 5), GUARD, ANGRY),
    key(1.3, { advance: 0.7 }, pelvis(0, -0.018), bend(2, 0, -4, -8, -4), GUARD, ANGRY),
    // Hop home.
    key(1.44, { advance: 0.33 }, root({ y: 0.09 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.56, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.75, name: 'impact' }],
};

/**
 * Seismic Toss (toss): it has no hands, so it seizes the foe in its beak.
 * It rushes in and clamps on (grab), sinks with it, springs up and back
 * toward mid-field hauling it up and spinning round with it in the air,
 * then whips its head down and hurls it back into its own place (throw),
 * lands deep and watches it crash (impact), then hops home. The foe rides at
 * the beak from the grab to the throw (the `hands` emitter is its beak).
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.3,
  keys: [
    key(0),
    // Wind up: a crouch, head drawn back, beak up.
    key(0.14, pelvis(0, -0.03), bend(-4, -3, -8), wings(10, -12), ANGRY),
    // Rush in low along an arc, beak open.
    key(0.3, { advance: 0.65 }, root({ y: 0.08 }), TUCK, bend(8, 3, -6), wings(24, -12), jaw(26), ANGRY),
    // Seize: land at the foe, the beak on it...
    key(0.4, { advance: 1 }, LAND, bend(14, 5, -8), WINGS_BACK, jaw(30), ANGRY),
    // ...and clamped shut.
    key(0.5, { advance: 1 }, pelvis(0, -0.034), bend(16, 6, -8), wings(6, -24), jaw(4), ANGRY),
    // Load: sinks with it.
    key(0.62, { advance: 1 }, pelvis(0, -0.046), bend(18, 6, -10), wings(2, -26), jaw(2), ANGRY),
    // Spring up and back, hauling it up, turning.
    key(0.78, { advance: 0.86 }, root({ y: 0.24, yaw: 40 }), HOP, pelvis(0, 0.01), bend(-10, -4, -6), wings(34, -4), jaw(2), ANGRY),
    // Spinning round with it at the top.
    key(0.94, { advance: 0.66 }, root({ y: 0.32, yaw: 210 }), HOP, bend(-12, -5, -8), wings(36, 0), jaw(2), ANGRY),
    // Facing its place again, leaning back to hurl.
    key(1.06, { advance: 0.5 }, root({ y: 0.32, yaw: 360 }), HOP, bend(-18, -6, -8), wings(30, -10), jaw(2), ANGRY),
    // The hurl: the head whips forward and down, flinging it.
    snap(1.15, { advance: 0.4 }, root({ y: 0.2, yaw: 360 }), HOP, bend(22, 10, 4), wings(10, -30), jaw(30), ANGRY),
    // Land deep, watching it crash.
    key(1.28, { advance: 0.32 }, root({ yaw: 360 }), LAND_DEEP, bend(16, 6, -8), wings(6, -16), jaw(10), ANGRY),
    key(1.5, { advance: 0.32 }, root({ yaw: 360 }), pelvis(0, -0.03), bend(12, 4, -10), GUARD, ANGRY),
    // Straighten, then hop home.
    key(1.68, { advance: 0.32 }, root({ yaw: 360 }), pelvis(0, -0.02), bend(6, 2, -8), GUARD, ANGRY),
    key(1.84, { advance: 0.15 }, root({ y: 0.08, yaw: 360 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.98, { advance: 0 }, root({ yaw: 360 }), LAND, GUARD, ANGRY),
    key(2.3, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'grab' }, { t: 1.18, name: 'throw' }, { t: 1.4, name: 'impact' }],
};

/**
 * Dig (burrow): head down, it scratches at the ground with one foot and then
 * the other like a hen, the dirt flying (dig), and sinks out of sight; it
 * tunnels over to the foe and bursts up out of the ground under it,
 * stretched tall with its wing tufts flung open (impact as it breaks the
 * surface), comes down in front of it and hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.2,
  keys: [
    key(0),
    // Head down, eyes on the ground: the right foot scratches back...
    key(0.1, { plantRight: 0 }, pelvis(0.006, -0.03), legR(SCRAPE_R), bend(16, 6, 6), wings(4, -16), ANGRY),
    // ...then the left, the dirt flying, and it starts to sink.
    snap(0.22, { plantLeft: 0 }, root({ y: -0.08 }), pelvis(-0.006, -0.036), legL(SCRAPE_L), bend(20, 7, 8), wings(0, -20), ANGRY),
    key(0.32, { plantRight: 0 }, root({ y: -0.3 }), pelvis(0.006, -0.036), legR(SCRAPE_R), bend(22, 8, 8), FOLDED, ANGRY),
    // Sinks out of sight, gathering speed.
    fall(0.5, { plantFeet: 0 }, root({ y: -1.3 }), HOP, bend(22, 8, 8), FOLDED, ANGRY),
    // Tunnels over to the foe.
    key(0.64, { advance: 0.2, plantFeet: 0 }, root({ y: -1.3 }), HOP, bend(20, 8, 6), FOLDED, ANGRY),
    key(0.86, { advance: 1, plantFeet: 0 }, root({ y: -1.25 }), HOP, bend(12, 4, 4), FOLDED, ANGRY),
    // Bursts up under it, stretched tall, wing tufts flung open.
    snap(1.0, { advance: 1 }, root({ y: 0.28, z: 0.08 }), TUCK, bend(-10, -4, -6), SPREAD, crest(12), jaw(28), ANGRY),
    key(1.14, { advance: 0.94 }, root({ y: 0.34, z: 0.06 }), HOP, bend(-12, -5, -6), wings(28, -4), crest(10), jaw(20), ANGRY),
    // Comes down in front of it and holds the crouch.
    fall(1.3, { advance: 0.82 }, LAND_DEEP, bend(6, 2, -8), GUARD, ANGRY),
    key(1.62, { advance: 0.82 }, pelvis(0, -0.02), bend(4, 1, -5), GUARD, ANGRY),
    // Hop home.
    key(1.8, { advance: 0.38 }, root({ y: 0.09 }), HOP, bend(4, 0, -4), GUARD, ANGRY),
    key(1.94, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.2, OPEN_EYES),
  ],
  events: [{ t: 0.21, name: 'dig' }, { t: 0.95, name: 'impact' }],
};

/**
 * Mud-Slap (fling): it dips its head to the ground and scoops up a beakful
 * of mud, then tosses its head up at the foe and flings it (release from
 * the beak: emitterFor fling), and settles.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.15,
  keys: [
    key(0),
    // Dips down to the ground, beak open, scooping.
    key(0.2, pelvis(0, -0.034), bend(22, 8, 14), wings(10, -16), jaw(24), ANGRY),
    key(0.3, pelvis(0, -0.036), bend(23, 8, 16), wings(8, -18), jaw(4), ANGRY),
    // The fling: the head tosses up and forward, beak opening, and the mud flies at the foe.
    snap(0.4, pelvis(0, -0.01, 0.012), bend(-2, -2, -12), wings(22, -6), jaw(30), ANGRY),
    key(0.52, pelvis(0, -0.012, 0.01), bend(-4, -2, -10), wings(18, -4), jaw(20), ANGRY),
    key(0.72, pelvis(0, -0.02), bend(4, 1, -8), GUARD, jaw(4), ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'release' }],
};

/**
 * Double Team (afterimage): it darts from side to side faster than the eye
 * in quick hops, guard up; the afterimages start at the aura and run 1.4 s
 * (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.7,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03), bend(10, 3, -13), GUARD, ANGRY),
    key(0.19, root({ x: 0.16, y: 0.07 }), HOP, bend(6, 0, -8), GUARD, ANGRY),
    key(0.28, root({ x: 0.2 }), LAND, GUARD, ANGRY),
    key(0.39, root({ x: -0.03, y: 0.08 }), HOP, bend(6, 0, -8), GUARD, ANGRY),
    key(0.49, root({ x: -0.2 }), LAND, GUARD, ANGRY),
    key(0.6, root({ x: 0.01, y: 0.08 }), HOP, bend(6, 0, -8), GUARD, ANGRY),
    key(0.7, root({ x: 0.17 }), LAND, GUARD, ANGRY),
    key(0.81, root({ x: -0.01, y: 0.07 }), HOP, bend(6, 0, -8), GUARD, ANGRY),
    key(0.91, root({ x: -0.16 }), LAND, GUARD, ANGRY),
    key(1.04, root({ x: -0.04, y: 0.05 }), HOP, bend(4, 0, -6), GUARD, ANGRY),
    key(1.15, root({ x: 0 }), LAND, GUARD, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Ember (special_weak): the fire comes up from its belly. A quick breath,
 * chest up and head back, then the head drives forward at the foe with the
 * beak wide and spits the embers; it bobs back up as the beak closes.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.15,
  keys: [
    key(0),
    // Draw breath: chest up, head tipped back, wing tufts back.
    key(0.22, pelvis(0, 0.01), bend(-8, -6, -6), wings(16, -18), crest(8), ANGRY),
    // Spit: the head drives forward at the foe, beak wide; the body leans in.
    snap(0.32, pelvis(0, -0.016, 0.026), bend(12, 6, -14), wings(4, -8), crest(-2), jaw(34), ANGRY),
    // Recoil: the head bobs back up as the beak closes.
    key(0.48, pelvis(0, -0.01, 0.014), bend(6, 2, -14), wings(8, -6), jaw(18), ANGRY),
    key(0.68, pelvis(0, -0.004), bend(2, 1, -4), GUARD, jaw(3), ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.37, name: 'release' }],
};

/**
 * Flamethrower, Fire Spin (special_strong): a deep breath that heaves the
 * fire up from its belly, then a sustained stream from the beak, the body
 * braced low and the head sweeping; the beak shuts and it shakes off the
 * heat.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    // Settle before drawing breath.
    key(0.14, pelvis(0, -0.018), bend(4, 1, 2), wings(-4, 4)),
    // Deep breath: rise, chest out, beak to the sky, wing tufts back; embers gather at the beak.
    key(0.5, pelvis(0, 0.014), bend(-10, -7, -8), wings(20, -20), crest(10), SHUT),
    // Hold at the top, still swelling.
    key(0.64, pelvis(0, 0.018), bend(-11, -8, -9, 0, 2), wings(22, -22), crest(11), SHUT),
    // Blast: the head drives forward at the foe, beak wide; the body braces low.
    snap(0.76, pelvis(0, -0.03, 0.026), bend(12, 6, -14), BRACED, crest(-2), jaw(36), ANGRY),
    // Sustain: pushing into the stream, the head sweeping a little.
    key(1.0, pelvis(0, -0.026, 0.02), bend(10, 5, -12, 5), BRACED, jaw(34), ANGRY),
    key(1.22, pelvis(0, -0.03, 0.024), bend(11, 6, -13, -4, -2), BRACED, jaw(36), ANGRY),
    key(1.44, pelvis(0, -0.026, 0.02), bend(10, 5, -12, 3, 1), BRACED, jaw(34), ANGRY),
    key(1.62, pelvis(0, -0.028, 0.022), bend(10, 5, -12), BRACED, jaw(33), ANGRY),
    // Beak shuts, the head comes up and shakes off the heat.
    key(1.8, pelvis(0, -0.012), bend(4, 2, -10, 7), wings(4), jaw(4), ANGRY),
    key(1.94, pelvis(0, -0.006), bend(2, 1, -6, -6), wings(2), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.81, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Focus Energy, Swords Dance, Mirror Move, Sleep Talk (status_self): it
 * gathers itself, crouched small with its wing tufts folded, crest flat and
 * eyes shut, then fires up: stretched tall, chest out, crest standing and
 * fanned, wing tufts flung up, trembling with it while the aura rises.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.7,
  keys: [
    key(0),
    // Gather: curled small, eyes shut.
    key(0.3, pelvis(0, -0.034), bend(14, 5, 4), FOLDED, crest(-12), SHUT),
    key(0.42, pelvis(0, -0.038), bend(15, 5, 5, 0, 1), wings(-22, 13), crest(-13), SHUT),
    // Fired up: chest out, crest up, wing tufts up, straining (a moving hold with a tremor).
    snap(0.56, pelvis(0, 0.012), bend(-8, -5, -4), wings(32, 2), crest(16, 10), tail(-12), ANGRY),
    key(0.68, pelvis(0, 0.01), bend(-9, -5, -4, 0, 1.5), wings(30, 4), crest(15, 10), tail(-12), ANGRY),
    key(0.8, pelvis(0, 0.012), bend(-8, -6, -4, 0, -1.5), wings(33, 2), crest(16, 11), tail(-13), ANGRY),
    key(0.92, pelvis(0, 0.01), bend(-9, -5, -4, 0, 1.5), wings(30, 4), crest(15, 10), tail(-12), ANGRY),
    key(1.04, pelvis(0, 0.011), bend(-8, -6, -4, 0, -1), wings(32, 2), crest(16, 10), tail(-12), ANGRY),
    // Relax.
    key(1.28, pelvis(0, -0.012), bend(4, 1, -4), GUARD, crest(4), ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Growl (status_target): a chick's fierce scolding. It rears back drawing
 * breath, thrusts its head at the foe with the beak wide and the wing tufts
 * flared, and cries, the head shaking from side to side; the beak shuts.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.01), bend(-8, -5, -6), wings(14, -16), crest(8), ANGRY),
    snap(0.3, pelvis(0, -0.02, 0.024), bend(12, 5, -14), wings(26, -4), crest(8, 6), jaw(32), ANGRY),
    key(0.5, pelvis(0, -0.02, 0.024), bend(12, 5, -14, 8, 4), wings(24, -2), crest(8, 6), jaw(34), ANGRY),
    key(0.7, pelvis(0, -0.02, 0.02), bend(11, 5, -13, -8, -4), wings(26, -4), crest(8, 6), jaw(32), ANGRY),
    key(0.88, pelvis(0, -0.01, 0.01), bend(5, 2, -8), GUARD, jaw(8), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.35, name: 'emit' }],
};

/**
 * Sand-Attack (kick_sand): weight onto the left foot, the right draws back
 * along the ground, then kicks forward low and flings the sand at the foe;
 * it stamps back down.
 */
const statusTargetKick: Clip = {
  name: 'status_target_kick',
  duration: 1.3,
  keys: [
    key(0),
    // Weight onto the left leg, the right foot drawn back along the ground.
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.012, -0.03, -0.01), legR(SCRAPE_R), bend(12, 4, -12), twist(-10), GUARD, ANGRY),
    // Kick: the foot sweeps forward and up, flinging sand.
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.008, -0.02, 0.01), legR(FLICK_R), bend(0, 0, -4), twist(8), GUARD, ANGRY),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.006, -0.022, 0.008), legR([[-0.05, -0.45, 0.89], [-0.03, -0.62, 0.78]]), bend(2, 1, -5), twist(6), GUARD, ANGRY),
    key(0.7, pelvis(0, -0.024), bend(6, 2, -8), GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'emit' }],
};

/** Taking a hit: snaps back with the hurt eyes and its wing tufts flared (the battler adds a sprung recoil), then shakes it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.006, -0.012), bend(-12, -5, -6, 0, 8), wings(26, -8), crest(6), tail(-10), jaw(14), HURT),
    key(0.2, pelvis(0, -0.004, -0.006), bend(-5, -2, -3, 0, 3), wings(10, -3), tail(-4), jaw(5), HURT),
    key(0.36, bend(3, 1, -2), wings(-2), HURT),
    key(0.6, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a woozy sway with
 * its eyes half shut, then it sits down onto its heels, the head drooping to
 * one side, eyes shut and wing tufts folded, and from the 'shrink' the
 * curled body shrinks away (Battler3D). It sits back as it drops, so the
 * big head stays over its feet.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-5, -3, -4, 0, 7), wings(-4), DROWSY),
    key(0.48, pelvis(0, -0.03), root({ z: -0.03 }), bend(8, 3, 6, 0, -6), wings(-10, 6), crest(-6), DROWSY),
    key(0.82, pelvis(0, -0.07), root({ z: -0.05 }), bend(16, 6, 10, 0, 12), FOLDED, crest(-16), tail(8), SHUT),
    key(0.96, pelvis(0, -0.074), root({ z: -0.05 }), bend(17, 7, 11, 0, 13), wings(-21, 13), crest(-18), tail(9), SHUT),
    key(1.6, pelvis(0, -0.072), root({ z: -0.05 }), bend(16, 7, 10, 0, 12), wings(-20, 13), crest(-17), tail(9), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const TORCHIC_SET: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, physicalWeak, physicalWeakKick, physicalStrong, punch, tackle, tackleStrong, peck, toss, burrow, fling, afterimage,
    specialWeak, specialStrong, statusSelf, statusTarget, statusTargetKick, hit, faint,
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

// The set's helpers, for the clips in ./set_more.ts.
export {
  key, snap, fall, ANGRY, SHUT, DROWSY, HURT, HAPPY, OPEN_EYES, jaw, pelvis, root, bend, twist, wings, wingR, crest, tail, legs, legL, legR,
  REST_L, REST_R, FOLD_L, FOLD_R, stay, GUARD, WINGS_BACK, SPREAD, FOLDED, BRACED, TUCK, HOP, LAND, LAND_DEEP, SCRAPE_R, SCRAPE_L,
};
