// Blaziken's clip kit: the key helpers, its reusable deltas (guards, fists,
// its tuck, landing and hop) and its travel, used by every clip file.
//
// Channels:
//   advance  0..1   how far toward the target a contact move has travelled
//                   (1: in front of the foe at striking distance, not touching)
//   root     offsets and turns of the whole body in heights/degrees (a leap's
//            arc in y, a lunge into the foe in z, spins in yaw)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   fx.flames 0..1  wrist flames (the stock sprite shows none at rest)
//   expression      eye atlas cell (BLAZIKEN_EXPRESSIONS)
// Events: impact (a blow lands), grab / throw (a toss), dig (goes under),
// release / releaseEnd (fire leaves the beak), charge, emit, aura, cry, shrink.
//
// How Blaziken fights (the 12 principles, applied): every action winds up
// against itself (a crouch, a claw cocked, a breath drawn) and carries through
// after (the limb past the foe, the body settling); keys are extremes and
// breakdowns joined by smooth curves, 'out' marks the snaps; travel is a
// springing leap along an arc with the legs tucked, landing into a knee bend,
// and a blow drives the hips, spine and limb *into* the foe (at advance 1 its
// front stops 0.15 of its height short of the foe's: a punch steps the body
// in, the rear foot staying put, a tackle throws all of it); holds keep moving; breath comes from the beak with the
// arms braced. The animator adds the rest: overlapping action (the head
// trails the hips by 0.065 s, the hands by 0.08 s: events that depend on them
// come that much after their key), breathing, blinks, springs on the mane,
// tail and wrist feathers.

import type { Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import { mirrorPose } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, drops). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

export type Dir = [number, number, number];

// Faces -----------------------------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const SHUT: Pose = { expression: 'closed' };
/** Eyes shut tight (the atlas' second closed cell). */
export const SQUEEZE: Pose = { expression: 'closed2' };
export const DROWSY: Pose = { expression: 'half' };
export const HURT: Pose = { expression: 'hurt' };
export const HAPPY: Pose = { expression: 'happy' };
export const OPEN_EYES: Pose = { expression: 'open' };

// Channels as deltas -------------------------------------------------------------

export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
export const flames = (v: number): Pose => ({ fx: { flames: v } });
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * Where it strikes from: a step to its left of the foe's front, turned to face
 * it. The battle camera looks along the line between the two Pokémon, so a
 * blow struck straight in front of the foe hides behind one of the two bodies;
 * from beside it, both sides of the field see the two bodies side by side and
 * the blow landing between them.
 */
export const FLANK = { x: 0.3, yaw: -20 };
/** How far toward the foe (0 home, 1 at striking distance beside its front, turned to it). */
export const at = (a: number): Pose => ({ advance: a, root: { x: FLANK.x * a, yaw: FLANK.yaw * a } });
/** A lunge of `d` heights at the foe it faces (forward and to its right). */
export const lunge = (d: number): Pose => ({ root: { x: -0.34 * d, z: 0.94 * d } });
/** The whole body: x sideways (its left +), y up (a leap's arc), z forward (a lunge into the foe), in heights; turns in degrees. */
export const root = (r: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number; roll?: number }): Pose => ({ root: r });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
export const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The torso twisted toward its left (+y: the right shoulder comes forward) and tilted (+z). */
export const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y, z }, chest: { y: y * 0.4 } } });
/** Arms by aim: [upper arm, forearm] directions for the right and left arm. */
export const arms = (r: [Dir, Dir], l: [Dir, Dir]): Pose => ({
  aim: { armR: { dir: r[0] }, forearmR: { dir: r[1] }, armL: { dir: l[0] }, forearmL: { dir: l[1] } },
});
export const armR = (a: Dir, f: Dir): Pose => ({ aim: { armR: { dir: a }, forearmR: { dir: f } } });
export const armL = (a: Dir, f: Dir): Pose => ({ aim: { armL: { dir: a }, forearmL: { dir: f } } });
export const legR = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighR: { dir: thigh }, shinR: { dir: shin } } });
export const legL = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighL: { dir: thigh }, shinL: { dir: shin } } });
/**
 * A lunge that steps into the blow: the body drives `d` heights at the foe
 * while the rear (left) foot keeps its place on the ground, the whole left
 * leg swinging back from the hip (its ankle hangs 0.37 below the hip: up to
 * 0.18 of swing, further and the foot follows); the front foot steps in with
 * the body. A lunge alone, with the feet planted, slides both feet along
 * the ground.
 */
export const stepIn = (d: number): Pose => {
  const a = Math.asin(Math.min(d, 0.18) / 0.37);
  const back = (v: readonly number[]): Dir => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
  return compose(lunge(d), legL(back(STANCE.aim!.thighL!.dir), back(STANCE.aim!.shinL!.dir)));
};
/** The same delta for the other side (right <-> left). */
export const mirror = (p: Pose): Pose => mirrorPose(p);

// Arms -------------------------------------------------------------------------

export const GUARD: Pose = arms([[-0.35, -0.55, 0.75], [0.25, 0.75, 0.6]], [[0.35, -0.6, 0.7], [-0.25, 0.75, 0.6]]);

/**
 * Arms flung wide at the shoulders, forearms raised: the battle cry. Wide
 * rather than overhead, so from the back our Blaziken's claws stay under the
 * foe's healthbox (tools/gauntlet/uiclear.mjs).
 */
export const ARMS_SPREAD_UP: Pose = arms([[-0.93, 0.1, 0.35], [-0.7, 0.62, 0.36]], [[0.93, 0.1, 0.35], [0.7, 0.62, 0.36]]);
/** Both fists chambered at the hips, elbows back (the stance's left arm, mirrored). */
export const CHAMBER: Pose = arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96]]);
/** Drawing breath: elbows pulled back and up, chest open. */
export const ELBOWS_BACK: Pose = arms([[-0.55, -0.42, -0.72], [-0.22, 0.08, 0.97]], [[0.55, -0.42, -0.72], [0.22, 0.08, 0.97]]);
/** Braced for a blast: arms low at the sides, fists by the thighs. */
export const BRACED: Pose = arms([[-0.42, -0.82, -0.38], [-0.22, -0.5, 0.84]], [[0.42, -0.82, -0.38], [0.22, -0.5, 0.84]]);
/** Arms crossed low in front (gathering power). */
export const CROSSED: Pose = arms([[-0.2, -0.75, 0.63], [0.75, -0.1, 0.65]], [[0.2, -0.75, 0.63], [-0.75, -0.05, 0.66]]);
/** Forearms crossed high in front of the face (an X guard). */
export const X_GUARD: Pose = arms([[-0.3, -0.35, 0.89], [0.6, 0.62, 0.5]], [[0.3, -0.38, 0.88], [-0.6, 0.6, 0.53]]);
/** Arms folded across the chest (unimpressed). */
export const FOLDED: Pose = arms([[-0.35, -0.7, 0.62], [0.8, 0.25, 0.55]], [[0.35, -0.72, 0.6], [-0.8, 0.3, 0.52]]);
/** Double-biceps flex. */
export const FLEX: Pose = arms([[-0.95, 0.25, 0.1], [-0.15, 0.97, 0.15]], [[0.95, 0.25, 0.1], [0.15, 0.97, 0.15]]);
/** Arms swept back for balance while the head or body leads (dashes, beak jabs). */
export const ARMS_BACK: Pose = arms([[-0.35, -0.5, -0.8], [-0.25, -0.3, -0.92]], [[0.35, -0.5, -0.8], [0.25, -0.3, -0.92]]);
/** Arms hanging limp (spent, asleep on its feet). */
export const LIMP: Pose = arms([[-0.3, -0.93, 0.18], [-0.12, -0.96, 0.25]], [[0.3, -0.93, 0.18], [0.12, -0.96, 0.25]]);
/** Both arms reaching out at chest height (grabbing). */
export const REACH: Pose = arms([[-0.18, -0.1, 0.98], [0.12, 0.02, 0.99]], [[0.18, -0.1, 0.98], [-0.12, 0.02, 0.99]]);
/** Arms locked around what it holds, low in front. */
export const GRIP: Pose = arms([[-0.28, -0.45, 0.85], [0.4, -0.12, 0.91]], [[0.28, -0.45, 0.85], [-0.4, -0.12, 0.91]]);
/** Holding it up in front, arms raised (overhead would carry the foe off the screen). */
export const HEAVE: Pose = arms([[-0.22, 0.45, 0.87], [0.18, 0.62, 0.76]], [[0.22, 0.45, 0.87], [-0.18, 0.62, 0.76]]);
/** Driving it down into the ground in front. */
export const SLAM_DOWN: Pose = arms([[-0.15, -0.5, 0.85], [0.12, -0.78, 0.62]], [[0.15, -0.5, 0.85], [-0.12, -0.78, 0.62]]);
/** Claws driven down into the ground in front (digging). */
export const DIG_ARMS: Pose = arms([[-0.22, -0.84, 0.5], [0.05, -0.95, 0.3]], [[0.22, -0.84, 0.5], [-0.05, -0.95, 0.3]]);
/** Both palms pushed out at the foe (a shove, a push of power). */
export const PUSH: Pose = arms([[-0.25, 0.05, 0.97], [-0.05, 0.12, 0.99]], [[0.25, 0.05, 0.97], [0.05, 0.12, 0.99]]);
/** The left arm's guard while the right strikes (forearm up before the face). */
export const GUARD_L: Pose = armL([0.35, -0.6, 0.7], [-0.2, 0.7, 0.68]);
/** The right arm's guard while the left strikes. */
export const GUARD_R: Pose = armR([-0.35, -0.6, 0.7], [0.2, 0.7, 0.68]);

/** Claws curled into fists. */
export const FISTS: Pose = {
  bones: {
    fingerA1R: { z: 34 }, fingerB1R: { z: 34 }, fingerC1R: { z: 34 },
    fingerA2R: { z: 30 }, fingerB2R: { z: 30 }, fingerC2R: { z: 30 },
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
  },
};
/** Claws splayed wide (a rake). */
export const SPLAY: Pose = {
  bones: {
    fingerA1R: { z: -18 }, fingerB1R: { z: -14 }, fingerC1R: { z: -10 },
    fingerA1L: { z: 14 }, fingerB1L: { z: 12 }, fingerC1L: { z: 8 },
  },
};
/** A flat hand, fingers together and straight (a chop, a slap). */
export const BLADE_HAND: Pose = {
  bones: {
    fingerA1R: { z: -20 }, fingerB1R: { z: -24 }, fingerC1R: { z: -24 },
    fingerA2R: { z: -12 }, fingerB2R: { z: -12 }, fingerC2R: { z: -12 },
  },
};

// Legs and travel ---------------------------------------------------------------

/** Airborne, travelling forward: leading knee up, trailing leg back. */
export const TUCK: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.25, -0.38, 0.89] }, shinR: { dir: [-0.12, -0.96, -0.25] },
    thighL: { dir: [0.28, -0.78, -0.56] }, shinL: { dir: [0.12, -0.42, -0.9] },
  },
};
/** Airborne, both knees drawn up high (a big leap, a jump over). */
export const TUCK_HIGH: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, -0.1, 0.97] }, shinR: { dir: [-0.12, -0.9, -0.42] },
    thighL: { dir: [0.22, -0.2, 0.95] }, shinL: { dir: [0.12, -0.88, -0.46] },
  },
};
/** Airborne, hopping back: both knees drawn up a little. */
export const HOP: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.72, 0.62] }, shinR: { dir: [-0.15, -0.93, -0.33] },
    thighL: { dir: [0.33, -0.8, 0.5] }, shinL: { dir: [0.18, -0.92, -0.35] },
  },
};
/** A running stride in the air (a dash): right leg reaching forward, left leg kicked back. */
export const STRIDE: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, -0.55, 0.81] }, shinR: { dir: [-0.1, -0.98, 0.15] },
    thighL: { dir: [0.24, -0.72, -0.65] }, shinL: { dir: [0.1, -0.2, -0.97] },
  },
};
/** Airborne, rising straight up (an uppercut, a jump): the legs trailing below, the left knee bent. */
export const RISING: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.92, 0.2] }, shinR: { dir: [-0.2, -0.97, -0.1] },
    thighL: { dir: [0.3, -0.85, -0.4] }, shinL: { dir: [0.15, -0.8, -0.58] },
  },
};
/** A rising knee: the right knee driven up, the left leg trailing. */
export const RISING_KNEE: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.15, 0.35, 0.92] }, shinR: { dir: [-0.1, -0.88, 0.45] },
    thighL: { dir: [0.25, -0.92, -0.3] }, shinL: { dir: [0.12, -0.6, -0.79] },
  },
};
/** Landing: knees absorb the weight. */
export const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -6 } } };
/** A deep landing (from a high leap, a slam). */
export const LAND_DEEP: Pose = { plantFeet: 1, pelvis: { y: -0.085 }, bones: { spine: { x: 16 }, head: { x: -10 } } };

/** In the air on the way in: `a` of the way there, `y` high (heights). */
export const leap = (a: number, y: number): Pose => compose(TUCK, at(a), { root: { y } });
/** Arrived at the foe, knees taking the weight. */
export const ARRIVE: Pose = compose(LAND, at(1));

/**
 * The hop home from the foe (at `t`): push off into an arc with the knees
 * drawn up, land in a knee bend 0.13 s later. `hold` keeps the arms (and
 * face) of the pose it leaves in.
 */
export const hopHome = (t: number, ...hold: Pose[]): Keyframe[] => [
  key(t, at(0.45), root({ y: 0.065 }), HOP, bend(8, 0, 0, 0), ...hold),
  key(t + 0.13, at(0), LAND, ...hold),
];

/** At the foe in a guard: where a multi-hit run's first hits end and the next begin. */
export const AT_FOE_GUARD: Pose[] = [at(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY];
