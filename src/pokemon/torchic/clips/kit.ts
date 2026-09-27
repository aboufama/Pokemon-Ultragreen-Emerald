// Torchic's clip kit: the key helpers, its reusable deltas (the lean that
// keeps its face on the foe, the wing tufts, the crest, the tail, the legs)
// and its travel, used by every clip file.
//
// Channels:
//   advance  0..1   how far toward the target a contact move has travelled
//                   (1: at the foe, its beak 0.15 of its height short of the
//                   foe's front, beside it and turned to it)
//   root     offsets and turns of the whole body in heights/degrees (a hop's
//            arc in y, a spring at the foe along its facing, spins in yaw)
//   pelvis   hips and spine roots together, in heights (crouch, lean); the
//            planted feet keep their height, not their place, so sideways
//            and forward offsets stay small
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (TORCHIC_EXPRESSIONS)
// Events: impact (a blow lands), grab (a toss), dig (goes under), release /
// releaseEnd (fire leaves the beak), charge, emit, aura, cry, shrink.
//
// How Torchic acts (the brief in index.ts):
//   - it is all head: a big round head on a round body, pivoting on the chest.
//     Any forward pitch of the head turns its face to the ground, so the body
//     leans from the hips while the head keeps its face on the foe (lean());
//     only the headlong charges lead with the crown;
//   - its legs are short (0.16 heights to the ankle): crouches are shallow,
//     it bobs rather than squats; it travels in quick two-footed hops, a
//     chick's bounce, and every blow springs it the last bit at the foe on a
//     little hop (its feet off the ground, so nothing slides);
//   - it has no arms: the wing tufts flare for balance, flutter when it is
//     fired up, slap, fling Swift's stars and fold in when it gathers or
//     tires; its talons rake and kick; its beak pecks and seizes;
//   - fire comes up from its belly (the Pokédex: balls of fire it forms in its
//     stomach): it hunches or swells, then the head thrusts forward and the
//     beak spits or streams;
//   - from our side only the head, the crest and the collar show above the
//     text box, so every action also reads in the head, the crest (on springs)
//     and the wing tufts.
// The animator adds overlapping action (the head trails the body by 0.045 s,
// the crest and the wing tufts a little more: see index.ts), breathing,
// blinks and springs on the crest, the tail and the wing tufts.

import type { Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (drops, falls). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

export type Dir = [number, number, number];

// Faces -----------------------------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const HAPPY: Pose = { expression: 'happy' };
export const SHUT: Pose = { expression: 'closed' };
export const DROWSY: Pose = { expression: 'half' };
export const HURT: Pose = { expression: 'hurt' };
/** Eyes squeezed shut with effort (the atlas' hurt cell). */
export const STRAIN: Pose = { expression: 'hurt' };
/** Round, startled eyes under raised brows. */
export const WORRIED: Pose = { expression: 'worried' };
export const OPEN_EYES: Pose = { expression: 'open' };

// Channels as deltas -------------------------------------------------------------

export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * The body leans in `fwd` degrees from the hips (spine 70%, chest 30%) while
 * the head keeps its aim: `face` is where the face ends up relative to the
 * stance (+ tips it toward the ground, - up to the sky), `turn` turns the
 * head toward its left (+), `tilt` rolls it (+ toward its right).
 */
export const lean = (fwd: number, face = 0, turn = 0, tilt = 0): Pose => ({
  bones: { spine: { x: fwd * 0.7 }, chest: { x: fwd * 0.3 }, head: { x: face - fwd, y: turn, z: tilt } },
});
/** The spine twisted toward its left (+y: the left side draws back) and tilted (+z: the top toward its right). */
export const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y, z } } });
/**
 * The wing tufts: raised (+) or folded down against the body (-), swept
 * forward (+) or back (-). Mirrored left and right; the back feather of
 * each tuft moves a little less.
 */
export const wings = (raise: number, sweep = 0): Pose => ({
  bones: {
    wingAL: { z: raise, y: -sweep }, wingBL: { z: raise, y: -sweep }, wingCL: { z: raise * 0.85, y: -sweep * 0.85 },
    wingAR: { z: -raise, y: sweep }, wingBR: { z: -raise, y: sweep }, wingCR: { z: -raise * 0.85, y: sweep * 0.85 },
  },
});
/** One wing tuft (the right one: raised +, swept forward +), the other left as the stance has it. */
export const wingR = (raise: number, sweep = 0): Pose => ({
  bones: { wingAR: { z: -raise, y: sweep }, wingBR: { z: -raise, y: sweep }, wingCR: { z: -raise * 0.85, y: sweep * 0.85 } },
});
/** The crest's three plumes: stood up (+) or swept further back (-), and fanned apart. */
export const crest = (lift: number, fan = 0): Pose => ({
  bones: { crest: { x: lift }, crestL: { x: lift, z: fan }, crestR: { x: lift, z: -fan } },
});
/** The tail feathers: cocked up (-) or down (+), wagged toward its left (+y). */
export const tail = (x: number, y = 0): Pose => ({ bones: { tail: { x, y } } });

// Legs for talon rakes, sand kicks and pawing. A leg is aimed in every key of
// a clip that moves it; planted keys pin the foot's height with IK and keep
// where the aim put it (so a planted foot aimed back scrapes the ground).
export const legL = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighL: { dir: thigh }, shinL: { dir: shin } } });
export const legR = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighR: { dir: thigh }, shinR: { dir: shin } } });
/** Where the legs point at rest (their bind directions: thigh down and back, shin down). */
export const LEG_REST_L = legL([0, -0.935, -0.355], [0, -0.98, 0.2]);
export const LEG_REST_R = legR([0, -0.935, -0.355], [0, -0.98, 0.2]);
export const LEGS_REST: Pose = compose(LEG_REST_L, LEG_REST_R);
/** A foot drawn back along the ground (a scrape, a paw, a scratch). */
export const SCRAPE_L = legL([0.05, -0.78, -0.62], [0.02, -0.62, -0.78]);
export const SCRAPE_R = legR([-0.05, -0.78, -0.62], [-0.02, -0.62, -0.78]);

// Travel --------------------------------------------------------------------------

/**
 * Where it strikes from: a step to its left of the foe's front, turned to face
 * it. The battle camera looks along the line between the two Pokémon, so a
 * blow struck straight in front of the foe hides behind one of the bodies;
 * from beside it both sides of the field see the two side by side and the
 * blow landing between them.
 */
export const FLANK = { x: 0.3, yaw: -20 };
/** How far toward the foe (0 home, 1 at the foe beside its front, turned to it). */
export const at = (a: number): Pose => ({ advance: a, root: { x: FLANK.x * a, yaw: FLANK.yaw * a } });
/** A spring of `d` heights at the foe it faces (forward and to its right). */
export const lunge = (d: number): Pose => ({ root: { x: -0.34 * d, z: 0.94 * d } });
/** The whole body: x sideways (its left +), y up (a hop's arc), z forward, in heights; turns in degrees. */
export const root = (r: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number; roll?: number }): Pose => ({ root: r });

/**
 * In the air on a hop: both feet off the ground, the legs folded up under
 * the round body (its leg's middle joint bends backward, a bird's ankle).
 */
export const HOP: Pose = compose(
  { plantFeet: 0, plantLeft: 0, plantRight: 0 },
  legL([0.04, -0.62, -0.78], [0.02, -0.55, 0.83]),
  legR([-0.04, -0.62, -0.78], [-0.02, -0.55, 0.83]),
);
/** On both feet, the short legs taking the weight (a bob, not a squat): landings, and holds at the foe. */
export const LAND: Pose = compose(LEGS_REST, { plantFeet: 1, pelvis: { y: -0.012 } });
/** A deeper landing (from a big jump, a slam). */
export const LAND_DEEP: Pose = compose(LEGS_REST, { plantFeet: 1, pelvis: { y: -0.026 } }, lean(5, 8));
/** A foot lifted a little off the ground, in place (a strut, a hop from foot to foot). */
export const LIFT_L = legL([0.05, -0.8, -0.6], [0.02, -0.6, 0.8]);
export const LIFT_R = legR([-0.05, -0.8, -0.6], [-0.02, -0.6, 0.8]);
/** Hopping at the foe: `a` of the way there, `y` high (heights). */
export const hop = (a: number, y: number): Pose => compose(HOP, at(a), { root: { y } });

/**
 * How much further in than advance 1 each blow springs it (tools/gauntlet
 * check: the blow must reach the foe's body): the beak, the talons, the
 * crown, the whole round body.
 */
export const BEAK = 0.2;
export const TALON = 0.34;
export const CROWN = 0.24;
export const BODY = 0.36;
/** At the foe, `d` heights further in than advance 1. */
export const atFoe = (d = 0): Pose => compose(at(1), lunge(d));
/** A little hop at the foe that carries it `d` heights in, `y` high: the spring into a blow. */
export const springTo = (d: number, y = 0.03): Pose => compose(HOP, atFoe(d), { root: { y } });

/**
 * Its bouncing approach, from `t`: three quick two-footed hops (each touch a
 * bob on both feet), the last coming down at the foe 0.1 s after the third
 * key (the clip's ARRIVE). `hold` keeps the face and the wind-up through it.
 */
export const hopIn = (t: number, ...hold: Pose[]): Keyframe[] => [
  key(t, hop(0.24, 0.07), ...hold),
  key(t + 0.08, at(0.44), LAND, ...hold),
  key(t + 0.16, hop(0.7, 0.08), ...hold),
  key(t + 0.24, at(0.86), LAND, ...hold),
  key(t + 0.31, hop(0.96, 0.06), ...hold),
];
/** Arrived at the foe on both feet, the knees taking it. */
export const ARRIVE: Pose = compose(LAND, at(1));

/**
 * The hops home from the foe (from `t`): it springs off (fast out of the
 * ground, so nothing slides back), bounces once halfway and lands home
 * 0.3 s later.
 */
export const hopHome = (t: number, ...hold: Pose[]): Keyframe[] => [
  snap(t, hop(0.72, 0.07), ...hold),
  fall(t + 0.1, at(0.46), LAND, ...hold),
  snap(t + 0.18, hop(0.2, 0.07), ...hold),
  fall(t + 0.3, at(0), LAND, ...hold),
];

/** At the foe on both feet, ready: where return_home starts (after a run of hits). */
export const AT_FOE_GUARD: Pose[] = [atFoe(BEAK), LAND, wings(10, -4), ANGRY];
