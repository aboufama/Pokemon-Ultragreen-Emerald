// Marshtomp's clip kit: the key helpers, the reusable deltas every clip is
// built from (expressions, the spine, the arms' shapes, fists), and its
// travel: a crouch, a stocky bounding leap in, a flat-footed landing in a
// squat and a hop home. Clips are STANCE + deltas (see compose()).
//
// Channels:
//   advance  0..1   how far toward the foe a contact move has travelled
//                   (1: in front of it, at striking distance: the blow itself
//                   closes the gap, the limb reaching into it and the body
//                   lunging in with root.z)
//   root     model-unit offset/rotation of the whole body (hops, lunges,
//                   spins; root.pitch tips it over about its feet)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (open, angry, half, happy, closed, focus, hurt)
// Events: impact (a blow lands), release (a projectile, stream or wave
// leaves), releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a
// toss carries the foe between them), dig (it goes under).
//
// How Marshtomp moves (the brief in index.ts): it has only just learned to
// stand, on short, toughened legs, and fights like a young wrestler: sturdy
// and grounded, lighter and quicker than Swampert but never springy like a
// fighter. It crouches before it moves, bounds in with a stocky leap and
// lands flat-footed in a squat, throws its weight behind its thick arms or
// its big head, and bounces home. Its stance holds both arms up in a Y
// (the sprites' pose), so a clip that leaves the arms alone keeps them up.
// There is no neck: the head carries the whole upper body (bend() folds the
// neck's pitch into it). The head, arms and hands trail the hips (overlap:
// head 0.05 s, forearms 0.06, hands 0.08), so an event that depends on them
// sits a little after its key; legs have no delay.

import type { Clip, ClipEvent, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose, Vec3 } from '../../../anim/rig';
import { STANCE } from '../poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up, aims replace). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });
/** A clip from its keys (the last at its duration) and events. */
export const clip = (name: string, keys: Keyframe[], events: [number, string][] = [], loop = false): Clip => ({
  name,
  duration: keys[keys.length - 1].t,
  ...(loop ? { loop: true } : {}),
  keys,
  events: events.map(([t, n]): ClipEvent => ({ t, name: n })),
});

// Expressions -----------------------------------------------------------------

export const ANGRY: Pose = { expression: 'angry' };
export const SHUT: Pose = { expression: 'closed' };
export const DROWSY: Pose = { expression: 'half' };
/** Eyes squeezed shut with effort. */
export const SQUINT: Pose = { expression: 'closed' };
/** The happy arcs of its grin. */
export const HAPPY: Pose = { expression: 'happy' };
/** Narrowed, set, determined. */
export const NARROW: Pose = { expression: 'focus' };
export const HURT: Pose = { expression: 'hurt' };
export const OPEN_EYES: Pose = { expression: 'open' };

// The body ----------------------------------------------------------------------

/** Jaw relative to the stance's open grin: jaw(-24) shuts it, jaw(16) gapes. */
export const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
export const MOUTH_SHUT = jaw(-24);
export const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * Spine chain pitch (x) from hips to head, with optional head turn/tilt. It
 * has no neck: the neck's share is added to the head (the same signature as
 * its evolution's, so its choreography reads alike).
 */
export const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, head: { x: neck + head, y: headY, z: headZ } },
});
/** Upper-body twist (+ turns the chest toward its left: the right shoulder comes forward). */
export const twist = (deg: number): Pose => ({ bones: { spine: { y: deg } } });
/** The upper body leaning to one side (+ toward its right: the left shoulder rises). */
export const lean = (deg: number): Pose => ({ bones: { spine: { z: deg } } });
/** Sinking into the knees. */
export const sink = (y: number, z = 0): Pose => ({ pelvis: { x: 0, y, z } });
/** The whole body moved (heights) and turned (degrees). */
export const body = (x: number, y: number, z: number, pitch = 0, roll = 0, yaw = 0): Pose => ({ root: { x, y, z, pitch, roll, yaw } });
/** The head fin tipped (+x forward) and turned. */
export const fin = (x: number, y = 0): Pose => ({ bones: { fin: { x, y } } });
/** Both tail lobes raised (+x) and swung toward its left (+y). */
export const tail = (x: number, y = 0): Pose => ({ bones: { tailL: { x, y }, tailR: { x, y } } });

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both arms (left given, right mirrored unless given): upper arm, forearm, hand. */
export const arms = (armL: Vec3, forearmL: Vec3, handL: Vec3, right?: [Vec3, Vec3, Vec3]): Pose => ({
  aim: {
    armL: { dir: armL },
    forearmL: { dir: forearmL },
    handL: { dir: handL },
    armR: { dir: right?.[0] ?? mirror(armL) },
    forearmR: { dir: right?.[1] ?? mirror(forearmL) },
    handR: { dir: right?.[2] ?? mirror(handL) },
  },
});

// Arm shapes. Its stance holds them up in a Y; these are the shapes its
// moves pass through. From our side the foe's healthbox sits just above its
// head fin and ours to its right, so a raise goes up the front of the body
// rather than out round the side.

/** The stance's Y, aimed (keys that must aim every arm bone). */
export const Y_ARMS = arms([0.88, 0.36, 0.3], [0.42, 0.86, 0.28], [0.3, 0.92, 0.24]);
/** The Y eased: elbows out at the shoulders, forearms up and a little in (a breakdown in and out of the stance). */
export const ELBOWS_OUT = arms([0.92, 0.1, 0.38], [0.3, 0.8, 0.52], [0.15, 0.85, 0.5]);
/** Both fists raised high overhead. */
export const ARMS_UP = arms([0.5, 0.82, 0.28], [0.18, 0.95, 0.25], [-0.1, 0.97, 0.2]);
/** Forearms swinging up in front of the chest, elbows low. */
export const ARMS_RISING = arms([0.5, -0.2, 0.84], [-0.1, 0.9, 0.42], [-0.2, 0.95, 0.25]);
/** Arms flung up and out in a V. */
export const ARMS_SPREAD_UP = arms([0.85, 0.45, 0.25], [0.55, 0.8, 0.2], [0.3, 0.92, 0.2]);
/** Arms flung up high in a narrow V (a cry). */
export const ARMS_ROAR = arms([0.55, 0.8, 0.25], [0.3, 0.93, 0.2], [0.15, 0.97, 0.2]);
/** Fists pulled up by the shoulders, elbows out. */
export const FISTS_UP = arms([0.7, 0.45, 0.55], [-0.1, -0.4, 0.91], [-0.15, -0.5, 0.85]);
/** Both arms heaved up high in front. */
export const ARMS_HEAVE_HIGH = arms([0.42, 0.72, 0.55], [0.15, 0.9, 0.4], [0.0, 0.93, 0.35]);
/** Arms thrown wide at shoulder height. */
export const ARMS_WIDE = arms([0.95, 0.05, 0.3], [0.85, -0.2, 0.48], [0.75, -0.35, 0.56]);
/** Both fists hammered down in front. */
export const HAMMER_DOWN = arms([0.3, -0.5, 0.81], [0.08, -0.82, 0.57], [0.0, -0.9, 0.43]);
/** Hands coming down in front of the chest. */
export const ARMS_DOWN_FRONT = arms([0.45, 0.1, 0.89], [-0.15, -0.5, 0.85], [-0.2, -0.6, 0.77]);
/** Both arms thrust forward, palms toward the foe. */
export const PUSH = arms([0.38, -0.1, 0.92], [0.18, -0.02, 0.98], [0.05, 0.35, 0.94]);
/** The push follows through, low and long. */
export const PUSH_LOW = arms([0.32, -0.35, 0.88], [0.15, -0.3, 0.94], [0.05, -0.2, 0.98]);
/** Arms swept down and back (scooping). */
export const ARMS_SCOOP = arms([0.55, -0.75, -0.35], [0.3, -0.7, -0.65], [0.15, -0.6, -0.78]);
/** Forearms crossed in front of the face. */
export const CROSSED_GUARD = arms([0.55, -0.45, 0.7], [-0.72, 0.62, 0.3], [-0.6, 0.75, 0.28]);
/** Forearms rising in front of the chest. */
export const GUARD_RISING = arms([0.6, -0.55, 0.58], [-0.35, 0.55, 0.76], [-0.35, 0.7, 0.62]);
/** Arms crossed in front of the belly. */
export const CROSSED_LOW = arms([0.5, -0.6, 0.62], [-0.75, 0.0, 0.66], [-0.75, -0.1, 0.65]);
/** Fists crossed high in front of the chest. */
export const CROSSED_CHEST = arms([0.6, -0.2, 0.77], [-0.7, 0.2, 0.69], [-0.65, 0.15, 0.74]);
/** A wide, low brace: elbows out, forearms reaching forward low. */
export const BRACED = arms([0.9, -0.3, 0.3], [0.35, -0.55, 0.76], [0.1, -0.5, 0.86]);
/** Elbows out, forearms angled forward and down (bracing a quick spit). */
export const SPIT_BRACE = arms([0.88, -0.4, 0.25], [0.35, -0.5, 0.79], [0.1, -0.55, 0.83]);
/** Elbows drawn back, chest open (drawing breath). */
export const ELBOWS_BACK = arms([0.7, -0.2, -0.68], [0.35, -0.35, 0.87], [0.15, -0.4, 0.9]);
/** Arms tucked in, forearms up before the chest (a shoulder charge). */
export const ARMS_TUCKED = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.3, 0.35, 0.89]);
/** Arms drawn back behind the body (coiling to launch). */
export const ARMS_BACK = arms([0.6, -0.35, -0.72], [0.45, -0.6, -0.66], [0.3, -0.7, -0.65]);
/** Arms spread forward and wide (about to crash onto the foe). */
export const ARMS_FWD_SPREAD = arms([0.75, -0.15, 0.65], [0.45, -0.35, 0.82], [0.3, -0.4, 0.87]);
/** Flinch: the hands jerk up in front of the face. */
export const FLINCH = arms([0.62, 0.05, 0.78], [-0.05, 0.8, 0.6], [-0.2, 0.85, 0.49]);
/** Arms hanging limp at its sides. */
export const LIMP_ARMS = arms([0.55, -0.82, -0.12], [0.2, -0.97, 0.1], [0.1, -0.98, 0.15]);
/** A grappler's guard: arms spread forward at chest height, hands open. */
export const SUMO_GUARD = arms([0.88, -0.3, 0.38], [0.45, 0.0, 0.89], [0.15, 0.1, 0.98]);
/** Focus: the left hand held out open at the foe, the right fist chambered at the hip. */
export const FOCUS_GUARD = arms([0.55, -0.3, 0.78], [0.1, 0.12, 0.99], [0.0, 0.35, 0.94], [[-0.6, -0.64, -0.48], [-0.2, -0.3, 0.93], [-0.05, -0.2, 0.98]]);
/** Fists clenched hard at its sides, elbows out. */
export const FISTS_AT_SIDES = arms([0.82, -0.52, 0.22], [0.35, -0.9, 0.25], [0.2, -0.95, 0.25]);
/** Right fist cocked far back, left arm out front as a guard. */
export const CHAMBER_R = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.25, 0.15, 0.96], [[-0.55, 0.25, -0.8], [-0.25, 0.1, 0.96], [-0.1, 0.0, 0.99]]);
/** Right fist driven straight at the foe, left fist pulled back to the hip. */
export const PUNCH_R = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, 0.02, 0.99], [-0.05, 0.02, 1], [-0.02, 0.04, 1]]);
/** The punch carries through past the foe. */
export const PUNCH_R_THROUGH = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[0.12, -0.08, 0.99], [0.2, -0.1, 0.97], [0.22, -0.1, 0.97]]);

/** Fingers curled into fists. */
export const FISTS: Pose = {
  bones: {
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
    fingerA1R: { z: 40 }, fingerB1R: { z: 40 }, fingerC1R: { z: 40 },
    fingerA2R: { z: 34 }, fingerB2R: { z: 34 }, fingerC2R: { z: 34 },
  },
};
/** Fingers half curled. */
export const CURL: Pose = {
  bones: {
    fingerA1L: { z: -22 }, fingerB1L: { z: -22 }, fingerC1L: { z: -22 },
    fingerA2L: { z: -18 }, fingerB2L: { z: -18 }, fingerC2L: { z: -18 },
    fingerA1R: { z: 22 }, fingerB1R: { z: 22 }, fingerC1R: { z: 22 },
    fingerA2R: { z: 18 }, fingerB2R: { z: 18 }, fingerC2R: { z: 18 },
  },
};
/** Fingers splayed wide open. */
export const SPLAY: Pose = {
  bones: {
    fingerA1L: { y: 12 }, fingerC1L: { y: -12 },
    fingerA1R: { y: -12 }, fingerC1R: { y: 12 },
  },
};

// Legs and travel -------------------------------------------------------------------

/** Airborne: knees drawn up, feet trailing. */
export const TUCK: Pose = { plantFeet: 0, bones: { thighL: { x: -34 }, thighR: { x: -34 }, shinL: { x: 44 }, shinR: { x: 44 } } };
/** Airborne, hopping back: knees drawn up a little. */
export const HOP: Pose = { plantFeet: 0, bones: { thighL: { x: -20 }, thighR: { x: -20 }, shinL: { x: 24 }, shinR: { x: 24 } } };
/** Landing flat-footed in a squat. */
export const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -6 } } };
/** A heavy landing, deep in the knees. */
export const LAND_DEEP: Pose = { plantFeet: 1, pelvis: { y: -0.07 }, bones: { spine: { x: 12 }, head: { x: -8 } } };
/** Landing from a hop home, the torso carrying on back a little. */
export const LAND_HOME: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: -3 }, head: { x: 1 } } };
/** One leg lifted (the other planted), knee up in front: a step. */
export const stepL = (knee = 40): Pose => ({ plantLeft: 0, plantRight: 1, bones: { thighL: { x: -knee }, shinL: { x: knee * 0.9 } } });
export const stepR = (knee = 40): Pose => ({ plantLeft: 1, plantRight: 0, bones: { thighR: { x: -knee }, shinR: { x: knee * 0.9 } } });

/** In the air on the way (advance a), `y` heights up. */
export const flying = (a: number, y: number): Pose => compose({ advance: a, root: { y } }, TUCK);
/** Landed at advance a (1: at the foe). */
export const landed = (a = 1, deep = false): Pose => compose({ advance: a }, deep ? LAND_DEEP : LAND);
/** At the foe, lunging `z` heights further in. */
export const atFoe = (z = 0, pitch = 0): Pose => ({ advance: 1, root: { z, pitch } });

/** The hop home from the foe: a bounding hop (apex halfway), landing home in a squat. */
export const hopHome = (t: number, ...upper: Pose[]): Keyframe[] => [
  key(t, { advance: 0.5, root: { y: 0.08 } }, HOP, ...upper),
  key(t + 0.14, { advance: 0 }, LAND_HOME, ...upper),
];
