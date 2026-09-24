// Blaziken's battle animation set, one clip per attack category (+ idle, intro,
// hit, faint and a kick variant). Keys are STANCE + deltas (see compose()).
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (jumps, spins, sink)
//   fx.flames 0..1  wrist flames (the stock sprite shows none at rest)
//   expression      eye atlas cell
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, cry, aura, emit, thud.

import type { Clip, Ease, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

const key = (t: number, delta: Pose = {}, ease: Ease = 'inOut'): Keyframe => ({ t, pose: compose(STANCE, delta), ease });

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };

const GUARD: Pose = {
  aim: {
    armR: { dir: [-0.35, -0.55, 0.75] },
    forearmR: { dir: [0.25, 0.75, 0.6] },
    armL: { dir: [0.35, -0.6, 0.7] },
    forearmL: { dir: [-0.25, 0.75, 0.6] },
  },
};

const ARMS_SPREAD_UP: Pose = {
  aim: {
    armR: { dir: [-0.85, 0.35, 0.3] },
    forearmR: { dir: [-0.45, 0.85, 0.25] },
    armL: { dir: [0.85, 0.35, 0.3] },
    forearmL: { dir: [0.45, 0.85, 0.25] },
  },
};

const THRUST_FORWARD: Pose = {
  aim: {
    armR: { dir: [-0.22, 0.05, 0.97] },
    forearmR: { dir: [-0.05, 0.1, 0.99] },
    armL: { dir: [0.22, 0.05, 0.97] },
    forearmL: { dir: [0.05, 0.1, 0.99] },
  },
  bones: { handR: { z: 25 }, handL: { z: -25 } },
};

const LIMP_ARMS: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.95, 0.1] },
    forearmR: { dir: [-0.1, -0.95, 0.3] },
    armL: { dir: [0.3, -0.95, 0.1] },
    forearmL: { dir: [0.1, -0.95, 0.3] },
  },
};

const JAW_OPEN: Pose = { bones: { jaw: { x: 24 } } };

// Clips -----------------------------------------------------------------------

const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, { pelvis: { y: -0.006 }, bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(2.4),
  ],
};

/** Sent out: crouch, then a battle cry with flames flaring (cf. BACK_ANIM_SHAKE_GLOW_RED). */
const intro: Clip = {
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, { pelvis: { y: -0.04 }, bones: { spine: { x: 14 }, head: { x: 16 } }, expression: 'closed', ...GUARD }),
    key(0.38, { pelvis: { y: 0.01 }, bones: { spine: { x: -14 }, chest: { x: -6 }, head: { x: -24 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }, 'outBack'),
    key(0.55, { pelvis: { y: 0.01 }, bones: { spine: { x: -12 }, chest: { x: -6 }, head: { x: -22, z: 4 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }),
    key(0.72, { pelvis: { y: 0.01 }, bones: { spine: { x: -12 }, chest: { x: -6 }, head: { x: -22, z: -4 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }),
    key(0.9, { pelvis: { y: 0.01 }, bones: { spine: { x: -12 }, chest: { x: -6 }, head: { x: -20 } }, ...ARMS_SPREAD_UP, ...ANGRY, fx: { flames: 0.8 } }),
    key(1.5, { fx: { flames: 0 } }),
  ],
  events: [{ t: 0.38, name: 'cry' }],
};

/** Weak contact move (Scratch, Quick Attack, Peck...): dash in, claw slash, hop back. */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.25,
  keys: [
    key(0),
    key(0.16, {
      pelvis: { y: -0.025 },
      bones: { spine: { x: 10, y: 14 }, head: { x: -6 } },
      aim: { armR: { dir: [-0.55, 0.25, -0.8] }, forearmR: { dir: [-0.2, 0.9, 0.35] } },
      ...ANGRY,
    }, 'out'),
    key(0.36, {
      advance: 1,
      plantFeet: 0.7,
      bones: { spine: { x: 16, y: 18 }, head: { x: -8 } },
      aim: { armR: { dir: [-0.55, 0.3, -0.78] }, forearmR: { dir: [-0.2, 0.92, 0.3] } },
      ...ANGRY,
    }, 'in'),
    key(0.44, {
      advance: 1,
      bones: { spine: { x: 20, y: -26 }, chest: { y: -10 }, head: { x: -8, y: 10 } },
      aim: { armR: { dir: [0.35, -0.35, 0.87] }, forearmR: { dir: [0.55, -0.55, 0.62] } },
      ...ANGRY,
    }, 'out'),
    key(0.62, {
      advance: 1,
      bones: { spine: { x: 18, y: -24 }, chest: { y: -8 }, head: { x: -8, y: 10 } },
      aim: { armR: { dir: [0.4, -0.45, 0.8] }, forearmR: { dir: [0.6, -0.6, 0.52] } },
      ...ANGRY,
    }),
    key(0.9, { advance: 0, root: { y: 0.06 }, plantFeet: 0.3, ...ANGRY }, 'inOut'),
    key(1.25, { expression: 'open' }),
  ],
  events: [{ t: 0.44, name: 'impact' }],
};

/** Strong contact move (Blaze Kick, Sky Uppercut...): crouch, leap, flaming roundhouse kick. */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.0,
  keys: [
    key(0),
    key(0.32, { pelvis: { y: -0.09 }, bones: { spine: { x: 26 }, head: { x: -14 } }, ...GUARD, ...ANGRY, fx: { flames: 0.6 } }, 'out'),
    key(0.56, {
      advance: 0.65,
      plantFeet: 0,
      root: { y: 0.16, yaw: -20 },
      bones: { spine: { x: 10 }, head: { x: -10 } },
      aim: {
        thighR: { dir: [-0.2, -0.2, 0.96] }, shinR: { dir: [-0.15, -0.9, 0.4] },
        thighL: { dir: [0.25, -0.35, 0.9] }, shinL: { dir: [0.1, -0.85, -0.5] },
      },
      ...GUARD,
      ...ANGRY,
      fx: { flames: 1 },
    }, 'out'),
    key(0.78, {
      advance: 1,
      plantFeet: 0,
      root: { y: 0.1, yaw: 45 },
      bones: { spine: { x: -22, y: -10 }, head: { x: 6, y: -16 } },
      aim: {
        thighR: { dir: [-0.25, 0.35, 0.9] }, shinR: { dir: [-0.2, 0.4, 0.9] },
        thighL: { dir: [0.35, -0.8, 0.3] }, shinL: { dir: [0.15, -0.6, -0.8] },
        armR: { dir: [-0.9, 0.1, -0.35] }, forearmR: { dir: [-0.8, 0.4, -0.3] },
        armL: { dir: [0.9, 0.2, 0.3] }, forearmL: { dir: [0.7, 0.6, 0.35] },
      },
      ...ANGRY,
      fx: { flames: 1 },
    }, 'out'),
    key(1.02, {
      advance: 1,
      plantFeet: 0,
      root: { y: 0.05, yaw: 95 },
      bones: { spine: { x: -12 }, head: { y: -30 } },
      aim: {
        thighR: { dir: [-0.5, -0.4, 0.75] }, shinR: { dir: [-0.35, -0.9, 0.2] },
        armR: { dir: [-0.9, 0.0, -0.4] }, armL: { dir: [0.9, 0.1, 0.35] },
      },
      ...ANGRY,
      fx: { flames: 1 },
    }, 'inOut'),
    key(1.28, { advance: 1, plantFeet: 1, pelvis: { y: -0.07 }, root: { yaw: 0 }, bones: { spine: { x: 24 } }, ...GUARD, ...ANGRY, fx: { flames: 0.7 } }, 'in'),
    key(1.62, { advance: 0, plantFeet: 0.3, root: { y: 0.08 }, ...ANGRY, fx: { flames: 0.3 } }, 'inOut'),
    key(2.0, { fx: { flames: 0 }, expression: 'open' }),
  ],
  events: [{ t: 0.8, name: 'impact' }],
};

/** Kick variant for weak contact kicks (Double Kick): two alternating snap kicks. */
const physicalWeakKick: Clip = {
  name: 'physical_weak_kick',
  duration: 1.45,
  keys: [
    key(0),
    key(0.2, { pelvis: { y: -0.03 }, bones: { spine: { x: 18 } }, ...GUARD, ...ANGRY }, 'out'),
    key(0.38, { advance: 1, plantFeet: 0.8, bones: { spine: { x: 12 } }, ...GUARD, ...ANGRY }, 'in'),
    key(0.46, {
      advance: 1,
      plantFeet: 0,
      bones: { spine: { x: -12 } },
      aim: { thighR: { dir: [-0.15, 0.15, 0.98] }, shinR: { dir: [-0.1, 0.2, 0.97] } },
      ...GUARD,
      ...ANGRY,
    }, 'out'),
    key(0.6, { advance: 1, plantFeet: 1, bones: { spine: { x: 10 } }, ...GUARD, ...ANGRY }),
    key(0.7, {
      advance: 1,
      plantFeet: 0,
      root: { yaw: -15 },
      bones: { spine: { x: -14 } },
      aim: { thighL: { dir: [0.15, 0.2, 0.97] }, shinL: { dir: [0.1, 0.25, 0.96] } },
      ...GUARD,
      ...ANGRY,
    }, 'out'),
    key(0.86, { advance: 1, plantFeet: 1, bones: { spine: { x: 10 } }, ...GUARD, ...ANGRY }),
    key(1.12, { advance: 0, plantFeet: 0.3, root: { y: 0.06 }, ...ANGRY }),
    key(1.45, { expression: 'open' }),
  ],
  events: [{ t: 0.46, name: 'impact' }, { t: 0.7, name: 'impact' }],
};

/** Weak ranged move (Ember): inhale, then flick a fireball forward. */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.15,
  keys: [
    key(0),
    key(0.22, { bones: { spine: { x: -10 }, chest: { x: -6 }, head: { x: -16 } }, ...GUARD, ...ANGRY, fx: { flames: 0.8 } }, 'out'),
    key(0.42, { bones: { spine: { x: 26 }, head: { x: 8 } }, ...THRUST_FORWARD, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }, 'outBack'),
    key(0.7, { bones: { spine: { x: 22 }, head: { x: 6 } }, ...THRUST_FORWARD, ...ANGRY, fx: { flames: 0.6 } }),
    key(1.15, { fx: { flames: 0 }, expression: 'open' }),
  ],
  events: [{ t: 0.44, name: 'release' }],
};

/** Strong ranged move (Flamethrower, Overheat): charge the wrist flames, blast a stream. */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.2,
  keys: [
    key(0),
    key(0.55, {
      pelvis: { y: -0.05 },
      bones: { spine: { x: -6 }, chest: { x: -4 }, head: { x: -8 } },
      aim: {
        armR: { dir: [-0.6, -0.65, -0.45] }, forearmR: { dir: [0.4, 0.2, 0.9] },
        armL: { dir: [0.6, -0.65, -0.45] }, forearmL: { dir: [-0.4, 0.2, 0.9] },
      },
      expression: 'closed',
      fx: { flames: 1 },
    }, 'in'),
    key(0.62, {
      pelvis: { y: -0.052 },
      bones: { spine: { x: -6 }, chest: { x: -4 }, head: { x: -8, z: 3 } },
      aim: {
        armR: { dir: [-0.6, -0.65, -0.45] }, forearmR: { dir: [0.4, 0.2, 0.9] },
        armL: { dir: [0.6, -0.65, -0.45] }, forearmL: { dir: [-0.4, 0.2, 0.9] },
      },
      expression: 'closed',
      fx: { flames: 1 },
    }),
    key(0.8, { pelvis: { y: -0.03, z: 0.02 }, bones: { spine: { x: 30 }, chest: { x: 8 }, head: { x: 4 } }, ...THRUST_FORWARD, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }, 'outBack'),
    key(1.2, { pelvis: { y: -0.028, z: 0.015 }, bones: { spine: { x: 28 }, chest: { x: 8 }, head: { x: 6, z: -2 } }, ...THRUST_FORWARD, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }),
    key(1.55, { pelvis: { y: -0.03, z: 0.02 }, bones: { spine: { x: 29 }, chest: { x: 8 }, head: { x: 5, z: 2 } }, ...THRUST_FORWARD, ...JAW_OPEN, ...ANGRY, fx: { flames: 1 } }),
    key(2.2, { fx: { flames: 0 }, expression: 'open' }),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.8, name: 'release' }, { t: 1.6, name: 'releaseEnd' }],
};

/** Self-targeting status move (Bulk Up, Focus Energy): gather, then flex with a flame aura. */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    key(0.35, { pelvis: { y: -0.05 }, bones: { spine: { x: 22 }, head: { x: 22 } }, ...LIMP_ARMS, expression: 'closed' }, 'out'),
    key(0.72, {
      pelvis: { y: 0.008 },
      bones: { spine: { x: -10 }, chest: { x: -8 }, head: { x: -16 } },
      aim: {
        armR: { dir: [-0.95, 0.25, 0.1] }, forearmR: { dir: [-0.15, 0.97, 0.15] },
        armL: { dir: [0.95, 0.25, 0.1] }, forearmL: { dir: [0.15, 0.97, 0.15] },
      },
      ...ANGRY,
      fx: { flames: 1 },
    }, 'outBack'),
    key(1.05, {
      pelvis: { y: 0.008 },
      bones: { spine: { x: -11 }, chest: { x: -8 }, head: { x: -16, z: 3 } },
      aim: {
        armR: { dir: [-0.95, 0.28, 0.1] }, forearmR: { dir: [-0.12, 0.98, 0.12] },
        armL: { dir: [0.95, 0.28, 0.1] }, forearmL: { dir: [0.12, 0.98, 0.12] },
      },
      ...ANGRY,
      fx: { flames: 1 },
    }),
    key(1.6, { fx: { flames: 0 }, expression: 'open' }),
  ],
  events: [{ t: 0.72, name: 'aura' }],
};

/** Status move aimed at the foe (Growl, Leer, Sand-Attack): lean in and roar. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.35,
  keys: [
    key(0),
    key(0.3, { pelvis: { y: -0.02, z: 0.02 }, bones: { spine: { x: 26 }, head: { x: -18 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY }, 'out'),
    key(0.55, { pelvis: { y: -0.02, z: 0.02 }, bones: { spine: { x: 26 }, head: { x: -16, y: 8 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY }),
    key(0.8, { pelvis: { y: -0.02, z: 0.02 }, bones: { spine: { x: 26 }, head: { x: -16, y: -8 } }, ...ARMS_SPREAD_UP, ...JAW_OPEN, ...ANGRY }),
    key(1.35, { expression: 'open' }),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/** Taking a hit: snap back, wince, recover. */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    key(0.07, { pelvis: { z: -0.03 }, root: { z: -0.05 }, bones: { spine: { x: -16 }, head: { x: -20 } }, aim: { armR: { dir: [-0.8, -0.1, -0.6] }, armL: { dir: [0.8, -0.1, -0.6] } }, expression: 'hurt' }, 'out'),
    key(0.28, { pelvis: { z: -0.02 }, root: { z: -0.04 }, bones: { spine: { x: -8 }, head: { x: -10 } }, expression: 'hurt' }),
    key(0.6, { expression: 'open' }),
  ],
};

/** Fainting: stagger, knees buckle, collapse and sink into the ground. */
const faint: Clip = {
  name: 'faint',
  duration: 1.7,
  keys: [
    key(0),
    key(0.3, { root: { z: -0.04 }, bones: { spine: { x: -12 }, head: { x: -22 } }, expression: 'hurt' }, 'out'),
    key(0.85, { pelvis: { y: -0.2 }, root: { z: -0.02 }, bones: { spine: { x: 36 }, head: { x: 34 } }, ...LIMP_ARMS, expression: 'closed' }, 'in'),
    key(1.15, { pelvis: { y: -0.27 }, root: { z: -0.02 }, bones: { spine: { x: 44 }, head: { x: 40 } }, ...LIMP_ARMS, expression: 'closed' }),
    key(1.7, { pelvis: { y: -0.27 }, root: { y: -1.1, z: -0.02 }, bones: { spine: { x: 44 }, head: { x: 40 } }, ...LIMP_ARMS, expression: 'closed' }, 'in'),
  ],
  events: [{ t: 0.85, name: 'thud' }],
};

export const BLAZIKEN_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, physicalWeak, physicalWeakKick, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget, hit, faint].map((c) => [c.name, c]),
);

/** Eye atlas (pm0257_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const BLAZIKEN_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  closed2: [1, 2],
  hurt: [0, 3],
};
