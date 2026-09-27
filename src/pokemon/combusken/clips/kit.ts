// Combusken's clip kit: the key helpers, its reusable deltas (guards, claw
// hands, its crane stance's legs, landings) and its travel, used by every
// clip file.
//
// Channels:
//   advance  0..1   how far toward the target a contact move has travelled
//                   (1: in front of the foe at striking distance, not touching)
//   root     offsets and turns of the whole body in heights/degrees (a hop's
//            arc in y, a lunge into the foe in z, spins in yaw)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free).
//            Its stance stands on the left leg with the right knee drawn up
//            (plantRight 0): a pose with both feet down says so (FEET).
//   expression      eye atlas cell (COMBUSKEN_EXPRESSIONS)
// Events: impact (a blow lands), grab (a toss), dig (goes under),
// release / releaseEnd (fire leaves the beak), charge, emit, aura, cry, shrink.
//
// How Combusken moves (the brief in index.ts): a lanky young kicker, light
// and restless. It travels in skipping bounds (a hop, a skip on one foot, a
// hop in), not one big leap; it kicks from its crane stance (the knee is
// already up), its long feathered arms fling out wide and its big clawed
// hands rake and thrust; fire comes up its throat and out of its beak. Its
// arms end in one big hand bone each (no fingers): every arm pose aims the
// upper arm, the forearm and the hand, or the hand would stay where the
// stance points it. The animator adds overlapping action (the head trails
// the hips by 0.065 s, the hands by 0.08 s: events that depend on them come
// that much after their key), breathing, blinks and springs on the crest,
// the tail and the waist feathers.

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
/** An arm: upper arm, forearm and hand directions (model space, +X its left, +Y up, +Z forward). */
export type Arm = [Dir, Dir, Dir];
const flip = (d: Dir): Dir => [-d[0], d[1], d[2]];
/** The same right-arm directions for the left arm. */
export const mirrorArm = (a: Arm): Arm => [flip(a[0]), flip(a[1]), flip(a[2])];

// Faces -----------------------------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const SHUT: Pose = { expression: 'closed' };
/** Eyes squeezed shut (effort, pain). */
export const SQUEEZE: Pose = { expression: 'hurt' };
export const DROWSY: Pose = { expression: 'half' };
export const HURT: Pose = { expression: 'hurt' };
export const HAPPY: Pose = { expression: 'happy' };
export const WORRIED: Pose = { expression: 'worried' };
export const OPEN_EYES: Pose = { expression: 'open' };

// Channels as deltas -------------------------------------------------------------

export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * Where it strikes from: a step to its left of the foe's front, turned to face
 * it. The battle camera looks along the line between the two Pokémon, so a
 * blow struck straight in front of the foe hides behind one of the bodies;
 * from beside it both sides of the field see the two side by side and the
 * blow landing between them.
 */
export const FLANK = { x: 0.3, yaw: -20 };
/** How far toward the foe (0 home, 1 at striking distance beside its front, turned to it). */
export const at = (a: number): Pose => ({ advance: a, root: { x: FLANK.x * a, yaw: FLANK.yaw * a } });
/** A lunge of `d` heights at the foe it faces (forward and to its right). */
export const lunge = (d: number): Pose => ({ root: { x: -0.34 * d, z: 0.94 * d } });
/** The whole body: x sideways (its left +), y up, z forward, in heights; turns in degrees. */
export const root = (r: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number; roll?: number }): Pose => ({ root: r });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
export const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});
/** The torso twisted toward its left (+y: the right shoulder comes forward) and tilted (+z). */
export const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y, z }, chest: { y: y * 0.4 } } });
/** The crest's plumes: stood up (+) or swept further back (-). */
export const crest = (lift: number): Pose => ({ bones: { crest: { x: lift }, crestL: { x: lift }, crestR: { x: lift } } });
/** The tail: cocked up (-) or down (+). */
export const tail = (x: number): Pose => ({ bones: { tail: { x } } });
/** Both arms by aim. */
export const arms = (r: Arm, l: Arm): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1] }, handR: { dir: r[2] },
    armL: { dir: l[0] }, forearmL: { dir: l[1] }, handL: { dir: l[2] },
  },
});
/** Both arms the same, mirrored. */
export const both = (r: Arm): Pose => arms(r, mirrorArm(r));
export const armR = (a: Arm): Pose => ({ aim: { armR: { dir: a[0] }, forearmR: { dir: a[1] }, handR: { dir: a[2] } } });
export const armL = (a: Arm): Pose => ({ aim: { armL: { dir: a[0] }, forearmL: { dir: a[1] }, handL: { dir: a[2] } } });
export const legR = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighR: { dir: thigh }, shinR: { dir: shin } } });
export const legL = (thigh: Dir, shin: Dir): Pose => ({ aim: { thighL: { dir: thigh }, shinL: { dir: shin } } });
/** The same delta for the other side (right <-> left). */
export const mirror = (p: Pose): Pose => mirrorPose(p);

// Arms (each arm: upper arm, forearm, hand) -----------------------------------

/** A fighter's guard: both clawed hands up before the chest, claws up. */
export const GUARD_ARM: Arm = [[-0.45, -0.4, 0.8], [0.22, 0.78, 0.59], [0.28, 0.9, 0.33]];
export const GUARD: Pose = both(GUARD_ARM);
/** The left arm's guard, while the right one acts. */
export const GUARD_L: Pose = armL(mirrorArm(GUARD_ARM));
/** The right arm's guard, while the left one acts. */
export const GUARD_R: Pose = armR(GUARD_ARM);
/** Arms flung out wide, the hands up: the battle cry (wide, not overhead: the healthboxes). */
export const WINGS_OUT: Pose = both([[-0.95, 0.12, 0.28], [-0.88, 0.32, 0.35], [-0.78, 0.5, 0.38]]);
/** The clawed hands chambered at the hips, elbows back. */
export const CHAMBER_ARM: Arm = [[-0.45, -0.7, -0.55], [-0.12, -0.25, 0.96], [-0.02, -0.12, 0.99]];
export const CHAMBER: Pose = both(CHAMBER_ARM);
/** Drawing breath: elbows back and up, chest open. */
export const ELBOWS_BACK: Pose = both([[-0.55, -0.4, -0.73], [-0.2, 0.1, 0.97], [-0.1, 0.2, 0.97]]);
/** Braced: arms low at the sides, the hands pointing down and out. */
export const BRACED: Pose = both([[-0.42, -0.84, -0.34], [-0.3, -0.88, 0.36], [-0.28, -0.9, 0.33]]);
/** Arms crossed low in front (gathering power). */
export const CROSSED: Pose = both([[-0.25, -0.72, 0.65], [0.78, -0.15, 0.61], [0.85, -0.05, 0.52]]);
/** Forearms crossed high before the face (an X guard). */
export const X_GUARD: Pose = both([[-0.32, -0.35, 0.88], [0.6, 0.62, 0.5], [0.55, 0.78, 0.3]]);
/** Arms folded across the chest. */
export const FOLDED: Pose = both([[-0.38, -0.72, 0.58], [0.82, 0.22, 0.53], [0.85, 0.3, 0.43]]);
/** Double-biceps flex, the hands up. */
export const FLEX: Pose = both([[-0.95, 0.25, 0.12], [-0.15, 0.97, 0.18], [0.12, 0.95, 0.28]]);
/** Arms swept back for balance while the head or body leads. */
export const ARMS_BACK: Pose = both([[-0.35, -0.45, -0.82], [-0.25, -0.3, -0.92], [-0.2, -0.2, -0.96]]);
/** Arms hanging limp. */
export const LIMP: Pose = both([[-0.32, -0.93, 0.17], [-0.14, -0.97, 0.2], [-0.1, -0.98, 0.18]]);
/** Both arms reaching out at chest height (grabbing). */
export const REACH: Pose = both([[-0.2, -0.1, 0.97], [0.12, 0.02, 0.99], [0.2, 0.02, 0.98]]);
/** Arms locked round what it holds, low in front. */
export const GRIP: Pose = both([[-0.3, -0.45, 0.84], [0.42, -0.12, 0.9], [0.62, -0.1, 0.78]]);
/** Holding it up in front, arms raised. */
export const HEAVE: Pose = both([[-0.24, 0.45, 0.86], [0.2, 0.62, 0.76], [0.35, 0.62, 0.7]]);
/** Driving it down into the ground in front. */
export const SLAM_DOWN: Pose = both([[-0.16, -0.5, 0.85], [0.12, -0.78, 0.61], [0.2, -0.85, 0.49]]);
/** Claws driven down into the ground in front (digging). */
export const DIG_ARMS: Pose = both([[-0.22, -0.84, 0.49], [0.05, -0.95, 0.3], [0.08, -0.97, 0.22]]);
/** Both clawed hands pushed out at the foe (a shove, a push of power). */
export const PUSH: Pose = both([[-0.26, 0.05, 0.96], [-0.05, 0.12, 0.99], [0, 0.35, 0.94]]);

// Legs and travel ---------------------------------------------------------------

/** Both feet down (the stance lifts the right knee): standing square. */
export const FEET: Pose = { plantLeft: 1, plantRight: 1, ...legR([-0.1, -0.9, 0.42], [-0.06, -0.94, -0.33]) };
/** Airborne, travelling forward: both knees drawn up. */
export const TUCK: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.2, -0.2, 0.96] }, shinR: { dir: [-0.12, -0.95, -0.28] },
    thighL: { dir: [0.25, -0.62, -0.74] }, shinL: { dir: [0.12, -0.35, -0.93] },
  },
};
/** Airborne, both knees drawn up high (a big jump). */
export const TUCK_HIGH: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.2, 0.05, 0.98] }, shinR: { dir: [-0.12, -0.88, -0.46] },
    thighL: { dir: [0.22, -0.05, 0.97] }, shinL: { dir: [0.12, -0.86, -0.49] },
  },
};
/** Airborne, hopping back: the knees drawn up a little. */
export const HOP: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.3, -0.6, 0.74] }, shinR: { dir: [-0.15, -0.93, -0.33] },
    thighL: { dir: [0.3, -0.75, 0.59] }, shinL: { dir: [0.15, -0.93, -0.33] },
  },
};
/** A skip: touching down on the left foot mid-travel, the right knee up (its stance's legs). */
export const SKIP: Pose = { plantFeet: 1, plantLeft: 1, plantRight: 0, pelvis: { y: -0.03 } };
/** A running stride in the air (a dash): right leg reaching forward, left leg kicked back. */
export const STRIDE: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.2, -0.45, 0.87] }, shinR: { dir: [-0.1, -0.98, 0.15] },
    thighL: { dir: [0.22, -0.72, -0.66] }, shinL: { dir: [0.1, -0.2, -0.97] },
  },
};
/** Airborne, rising straight up: the legs trailing below. */
export const RISING: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.25, -0.92, 0.3] }, shinR: { dir: [-0.15, -0.96, -0.2] },
    thighL: { dir: [0.25, -0.88, -0.4] }, shinL: { dir: [0.12, -0.75, -0.65] },
  },
};
/** A rising knee: the right knee driven up, the left leg trailing. */
export const RISING_KNEE: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: {
    thighR: { dir: [-0.12, 0.45, 0.88] }, shinR: { dir: [-0.08, -0.85, 0.52] },
    thighL: { dir: [0.22, -0.92, -0.32] }, shinL: { dir: [0.1, -0.6, -0.79] },
  },
};
/** Landing on both feet, the knees taking the weight. */
export const LAND: Pose = compose(FEET, { plantFeet: 1, pelvis: { y: -0.05 }, bones: { spine: { x: 8 }, head: { x: -6 } } });
/** A deep landing (from a high jump, a slam). */
export const LAND_DEEP: Pose = compose(FEET, { plantFeet: 1, pelvis: { y: -0.09 }, bones: { spine: { x: 16 }, head: { x: -10 } } });

/** In the air on the way in: `a` of the way there, `y` high (heights). */
export const leap = (a: number, y: number): Pose => compose(TUCK, at(a), { root: { y } });

/**
 * Where it fights at the foe. At advance 1 its front (the claw of the arm
 * it holds out) stops 0.15 of its height short of the foe's front; that is
 * far off for a body that fights with its short legs, so its last hop in
 * carries it CLOSE heights further (its claw by the foe's head, its body
 * clear of the foe's own reaching arm) and every blow springs it in again
 * from there: a kick KICK further, a rake CLAW, the beak BEAK, a charge BODY.
 */
export const CLOSE = 0.4;
export const KICK = 0.3;
export const CLAW = 0.22;
export const BEAK = 0.5;
export const BODY = 0.42;
/** At the foe: advance 1 beside its front, turned to it, `extra` heights further in than CLOSE. */
export const atFoe = (extra = 0): Pose => compose(at(1), lunge(CLOSE + extra));
/** Arrived at the foe on its left foot (its stance's legs), the knee taking the weight. */
export const ARRIVE: Pose = compose(SKIP, atFoe(), { pelvis: { y: -0.02 }, bones: { spine: { x: 6 }, head: { x: -4 } } });
/** Arrived at the foe on both feet, knees taking the weight. */
export const ARRIVE_FEET: Pose = compose(LAND, atFoe());

/** Off the ground on a skip: the left foot has sprung and trails a little, the right knee up. */
export const SKIP_AIR: Pose = {
  plantFeet: 0, plantLeft: 0, plantRight: 0,
  aim: { thighL: { dir: [0.1, -0.86, 0.5] }, shinL: { dir: [0.06, -0.72, -0.69] } },
};
/**
 * A skip into a blow: its left foot springs it `extra` heights further in
 * than CLOSE, off the ground (`y`), so its feet never slide; the key after
 * lands the blow there, and it holds that place until it hops home.
 */
export const skipTo = (extra: number, y = 0.05): Pose => compose(SKIP_AIR, atFoe(extra), { root: { y } });

/**
 * Its skipping approach, from `t`: a hop, a skip on the left foot, and a
 * hop in that comes down at the foe 0.08 s after the third key (the clip's
 * ARRIVE). `hold` keeps the arms and face of the wind-up through it.
 */
export const skipIn = (t: number, ...hold: Pose[]): Keyframe[] => [
  key(t, leap(0.42, 0.07), ...hold),
  key(t + 0.1, at(0.62), SKIP, ...hold),
  key(t + 0.2, leap(0.92, 0.07), lunge(CLOSE * 0.6), ...hold),
];

/**
 * The hop home from the foe (at `t`): it springs off (fast out of the
 * ground, the feet leaving it at once, so nothing slides back) into an arc,
 * and falls onto the left foot 0.14 s later, the right knee coming up into
 * its stance.
 */
export const hopHome = (t: number, ...hold: Pose[]): Keyframe[] => [
  snap(t, at(0.45), root({ y: 0.07 }), HOP, bend(6, 0, 0, 0), ...hold),
  fall(t + 0.14, at(0), SKIP, pelvis(0, -0.02), ...hold),
];

/** At the foe in a guard, on both feet, where it kicks from: where a multi-hit run's first hits end and the next begin. */
export const AT_FOE_GUARD: Pose[] = [atFoe(KICK), FEET, pelvis(0, -0.04), bend(10, 2, 0, -2), GUARD, ANGRY];
