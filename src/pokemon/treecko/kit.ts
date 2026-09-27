// Treecko's kit for the line's choreography (./line): its stance, its timing
// and its version of every named pose. Treecko is small (5 kg, 0.5 m), quick
// and cool: its weapons are its big three-fingered hands on short arms (a
// cut is a knife-hand, a Pound the flat of the hand), its jaws and its thick
// leaf tail. Its huge head sits low between its shoulders, so hands raised
// high go up beside the head, never over it; its short arms reach less, so it
// lands closer to the foe (a larger reach) and drives its whole body in.
//
// The hands keep the stance's twist (palms turned up and open: right -70,
// left +70) unless a position gives its own. Directions are model space: +X
// its left, +Y up, +Z forward.

import type { Pose } from '../../anim/rig';
import type { Arm, ArmName, Kit, LegName } from './line/kit';
import { STANCE } from './poses';

const R: Record<ArmName, Arm> = {
  // Stances and guards.
  stance: [[-0.95, 0.04, 0.3], [-0.8, 0.36, 0.48], [-0.55, 0.66, 0.52]],
  guard: [[-0.62, -0.3, 0.72], [-0.1, 0.72, 0.69], [0.0, 0.9, 0.44]],
  guardLow: [[-0.8, -0.3, 0.52], [-0.45, 0.2, 0.87], [-0.3, 0.45, 0.84]],
  braced: [[-0.5, -0.78, -0.36], [-0.3, -0.55, 0.78], [-0.2, -0.35, 0.92]],
  elbowsBack: [[-0.6, -0.4, -0.7], [-0.25, 0.1, 0.96], [-0.1, 0.25, 0.96]],
  crossed: [[-0.3, 0.3, 0.9], [0.6, 0.6, 0.53], [0.5, 0.78, 0.38]],
  crossedLow: [[-0.35, -0.6, 0.72], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]],
  spread: [[-0.85, 0.42, 0.32], [-0.5, 0.82, 0.28], [-0.35, 0.9, 0.25]],
  wide: [[-0.95, 0.15, 0.27], [-0.8, 0.45, 0.4], [-0.6, 0.6, 0.53]],
  low: [[-0.88, -0.38, 0.28], [-0.62, -0.25, 0.74], [-0.45, -0.1, 0.89]],
  palmsUp: [[-0.86, 0.2, 0.47], [-0.62, 0.55, 0.56], [-0.45, 0.8, 0.4]],
  reach: [[-0.7, 0.28, 0.66], [-0.5, 0.42, 0.76], [-0.4, 0.5, 0.77]],
  reachFar: [[-0.64, 0.25, 0.73], [-0.44, 0.38, 0.81], [-0.34, 0.44, 0.83]],
  clawsUp: [[-0.72, 0.35, 0.6], [-0.35, 0.88, 0.32], [-0.2, 0.96, 0.18]],
  clawsOut: [[-0.5, 0.05, 0.86], [-0.3, 0.25, 0.92], [-0.2, 0.4, 0.9]],
  flinch: [[-0.8, 0.15, 0.58], [-0.5, 0.55, 0.67], [-0.3, 0.75, 0.59]],
  back: [[-0.4, -0.55, -0.73], [-0.3, -0.35, -0.89], [-0.2, -0.25, -0.95]],
  droop: [[-0.6, -0.76, 0.24], [-0.32, -0.88, 0.35], [-0.22, -0.88, 0.42]],
  flare: [[-0.9, 0.35, 0.26], [-0.7, 0.62, 0.35], [-0.55, 0.75, 0.37]],
  flex: [[-0.95, 0.2, 0.24], [-0.3, 0.93, 0.2], [-0.15, 0.95, 0.27]],
  hug: [[-0.45, -0.5, 0.74], [0.75, 0.1, 0.65], [0.7, 0.25, 0.67]],
  shade: [[-0.7, 0.35, 0.62], [0.35, 0.55, 0.76], [0.55, 0.35, 0.76]],
  cover: [[-0.7, 0.3, 0.65], [0.3, 0.8, 0.52], [0.5, 0.7, 0.51]],
  // Cuts and chops: the edge of the hand (a knife-hand) leads.
  bladeHigh: [[-0.86, 0.44, -0.26], [-0.6, 0.77, -0.2], [-0.45, 0.87, -0.2]],
  bladeBack: [[-0.9, 0.1, -0.42], [-0.6, 0.2, 0.77], [-0.45, 0.25, 0.86]],
  cutAcross: [[0.1, 0.0, 0.99], [0.75, 0.05, 0.66], [0.85, 0.05, 0.52]],
  cutFollow: [[0.45, -0.05, 0.89], [0.95, -0.05, 0.3], [0.96, -0.1, 0.2]],
  slashEnd: [[0.3, -0.45, 0.84], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]],
  slashFollow: [[0.45, -0.65, 0.61], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]],
  chopHigh: [[-0.75, 0.6, 0.27], [-0.4, 0.9, -0.15], [-0.3, 0.9, -0.3]],
  chopDown: [[-0.4, -0.3, 0.87], [-0.2, -0.72, 0.66], [-0.1, -0.9, 0.42]],
  chopLow: [[-0.35, -0.6, 0.72], [-0.1, -0.95, 0.3], [-0.05, -0.98, 0.18]],
  backhandCock: [[0.2, -0.1, 0.97], [0.9, 0.2, -0.38], [0.85, 0.3, -0.43]],
  backhandEnd: [[-0.95, 0.05, 0.3], [-0.95, 0.1, 0.3], [-0.95, 0.1, 0.28]],
  rakeWide: [[-0.95, 0.25, -0.2], [-0.7, 0.7, -0.15], [-0.5, 0.85, -0.15]],
  rakeBack: [[-0.85, 0.1, 0.52], [-0.95, 0.25, 0.2], [-0.9, 0.35, 0.25]],
  clawHigh: [[-0.7, 0.62, 0.35], [-0.35, 0.88, 0.32], [-0.2, 0.8, 0.56]],
  clawDown: [[-0.35, -0.35, 0.87], [-0.15, -0.7, 0.7], [-0.05, -0.9, 0.44]],
  bladesHigh: [[-0.8, 0.55, -0.24], [-0.3, 0.92, -0.25], [-0.2, 0.9, -0.4]],
  bladesCrossed: [[0.2, -0.5, 0.84], [0.7, -0.55, 0.45], [0.75, -0.55, 0.35]],
  risingBlade: [[-0.6, 0.72, 0.35], [-0.3, 0.95, 0.1], [-0.2, 0.95, -0.2]],
  bladeLow: [[-0.5, -0.75, -0.43], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]],
  slapHigh: [[-0.86, 0.44, -0.26], [-0.6, 0.77, -0.2], [-0.45, 0.87, -0.2], 20],
  slapDown: [[-0.45, -0.3, 0.84], [-0.3, -0.55, 0.78], [-0.25, -0.7, 0.67], 20],
  elbow: [[-0.1, 0.15, 0.98], [0.6, 0.15, -0.78], [0.65, 0.2, -0.73]],
  palm: [[-0.45, 0.2, 0.87], [-0.3, 0.3, 0.9], [-0.1, 0.9, 0.42], 0],
  // Fists.
  fistHip: [[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]],
  // A haymaker's wind-up: the elbow swung back and out, the fist cocked up beside the big head.
  fistBack: [[-0.88, 0.12, -0.46], [-0.45, 0.7, 0.55], [-0.35, 0.8, 0.49]],
  punch: [[-0.3, 0.2, 0.93], [-0.2, 0.28, 0.94], [-0.15, 0.3, 0.94]],
  punchHigh: [[-0.3, 0.3, 0.9], [-0.2, 0.4, 0.9], [-0.15, 0.43, 0.89]],
  // An overhand landing: the short arm come over beside the head, the fist driving forward and down.
  overhand: [[-0.4, 0.4, 0.82], [-0.2, -0.1, 0.97], [-0.12, -0.2, 0.97]],
  hookBack: [[-0.97, -0.05, -0.22], [-0.2, 0.05, 0.98], [-0.1, 0.05, 0.99]],
  hook: [[-0.45, 0.1, 0.89], [0.75, 0.1, 0.65], [0.85, 0.1, 0.52]],
  uppercutLow: [[-0.5, -0.78, -0.38], [-0.25, -0.25, 0.94], [-0.15, 0.1, 0.98]],
  uppercut: [[-0.45, 0.78, 0.43], [-0.2, 0.95, 0.24], [-0.1, 0.95, 0.3]],
  hammerHigh: [[-0.8, 0.58, -0.15], [-0.3, 0.9, -0.3], [-0.2, 0.85, -0.48]],
  hammerDown: [[-0.35, -0.35, 0.87], [-0.1, -0.85, 0.52], [-0.05, -0.97, 0.25]],
  // Grips, throws, scoops.
  grabWide: [[-0.75, 0.1, 0.65], [-0.35, 0.2, 0.91], [-0.2, 0.3, 0.93]],
  clamp: [[-0.45, -0.4, 0.8], [0.45, -0.05, 0.89], [0.45, 0.05, 0.89]],
  carry: [[-0.45, -0.3, 0.84], [0.45, 0.05, 0.89], [0.45, 0.1, 0.88]],
  hoist: [[-0.45, 0.15, 0.88], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]],
  hurl: [[-0.3, -0.5, 0.81], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]],
  hurlLow: [[-0.3, -0.62, 0.72], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]],
  dive: [[-0.45, 0.8, 0.4], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]],
  scoop: [[-0.65, -0.72, -0.25], [-0.5, -0.82, -0.2], [-0.4, -0.9, -0.15]],
  sling: [[-0.5, 0.4, 0.77], [-0.3, 0.66, 0.69], [-0.2, 0.72, 0.66]],
};

/** The left arm's own positions: the crossed arms, the flinch. */
const L: Partial<Record<ArmName, Arm>> = {
  crossed: [[0.3, 0.3, 0.9], [-0.6, 0.64, 0.48], [-0.5, 0.82, 0.28]],
  crossedLow: [[0.35, -0.6, 0.72], [-0.75, 0.12, 0.65], [-0.7, 0.28, 0.66]],
  flinch: [[0.78, 0.02, 0.62], [0.45, 0.45, 0.77], [0.25, 0.65, 0.72]],
};

const legs: Record<LegName, Pose> = {
  tuck: { plantFeet: 0, aim: { thighR: { dir: [-0.3, -0.4, 0.87] }, shinR: { dir: [-0.15, -0.95, -0.2] }, thighL: { dir: [0.35, -0.75, -0.55] }, shinL: { dir: [0.15, -0.45, -0.88] } } },
  hop: { plantFeet: 0, aim: { thighR: { dir: [-0.4, -0.7, 0.6] }, shinR: { dir: [-0.15, -0.93, -0.33] }, thighL: { dir: [0.4, -0.7, 0.6] }, shinL: { dir: [0.15, -0.93, -0.33] } } },
  drop: { plantFeet: 0 },
  squat: { aim: { thighR: { dir: [-0.85, -0.45, 0.27] }, shinR: { dir: [0.3, -0.9, -0.3] }, thighL: { dir: [0.85, -0.45, 0.27] }, shinL: { dir: [-0.3, -0.9, -0.3] } } },
  lungeR: { aim: { thighR: { dir: [-0.2, -0.75, 0.63] }, shinR: { dir: [-0.05, -0.99, 0.1] }, thighL: { dir: [0.25, -0.8, -0.55] }, shinL: { dir: [0.1, -0.8, -0.6] } } },
  lungeL: { aim: { thighL: { dir: [0.2, -0.75, 0.63] }, shinL: { dir: [0.05, -0.99, 0.1] }, thighR: { dir: [-0.25, -0.8, -0.55] }, shinR: { dir: [-0.1, -0.8, -0.6] } } },
  kickChamberR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.2, 0.3, 0.93] }, shinR: { dir: [-0.1, -0.8, 0.59] } } },
  kickOutR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.12, 0.15, 0.98] }, shinR: { dir: [-0.08, 0.2, 0.98] } } },
  kickHighR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.1, 0.55, 0.83] }, shinR: { dir: [-0.05, 0.6, 0.8] } } },
  sideChamberL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.5, 0.3, 0.81] }, shinL: { dir: [0.75, -0.62, -0.22] } } },
  sideKickL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.96, 0.22, 0.16] }, shinL: { dir: [0.96, 0.25, 0.12] } } },
  rise: { plantFeet: 0, aim: { thighR: { dir: [-0.2, 0.2, 0.96] }, shinR: { dir: [-0.12, -0.9, 0.42] }, thighL: { dir: [0.3, -0.9, -0.3] }, shinL: { dir: [0.15, -0.6, -0.78] } } },
  stompL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.85, 0.4, 0.35] }, shinL: { dir: [0.3, -0.95, 0.05] } } },
  pawR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.25, -0.75, -0.6] }, shinR: { dir: [-0.1, -0.4, -0.91] } } },
  pawL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.25, -0.75, -0.6] }, shinL: { dir: [0.1, -0.4, -0.91] } } },
};

export const TREECKO_KIT: Kit = {
  slug: 'treecko',
  stance: STANCE,
  tempo: 0.86,
  spring: 0.9,
  reach: 0.18,
  // Measured with the mirror match's approach (fronts 0.15 apart): Slam's tail has to reach.
  extraReach: { counter: 0.06, mega_kick: 0.3, slam: 0.12, iron_tail: 0.03 },
  bend: (spine, chest, neck, head, headY = 0, headZ = 0) => ({
    bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
  }),
  twist: (y, z = 0) => ({ bones: { spine: { y: y * 0.6, z: z * 0.6 }, chest: { y: y * 0.4, z: z * 0.4 } } }),
  tail: (lift, sweep = 0) => ({
    bones: {
      tail: { x: lift * 0.3, y: sweep * 0.3 },
      tail2: { x: lift * 0.2, y: sweep * 0.2 },
      tail3: { x: lift * 0.2, y: sweep * 0.2 },
      tail4: { x: lift * 0.15, y: sweep * 0.15 },
      tail5: { x: lift * 0.15, y: sweep * 0.15 },
    },
  }),
  jaw: (deg) => ({ bones: { jaw: { x: deg } } }),
  right: R,
  left: L,
  arms: (r, l) => ({
    aim: {
      armR: { dir: r[0] }, forearmR: { dir: r[1] }, handR: { dir: r[2], twist: r[3] ?? -70 },
      armL: { dir: l[0] }, forearmL: { dir: l[1] }, handL: { dir: l[2], twist: l[3] ?? 70 },
    },
  }),
  legs,
  // The fingers curl toward the palm.
  FISTS: { bones: { fingerAR: { z: 40 }, fingerBR: { z: 40 }, fingerCR: { z: 40 }, fingerAL: { z: -40 }, fingerBL: { z: -40 }, fingerCL: { z: -40 } } },
  SPLAYED: { bones: { fingerAR: { y: 14, z: -10 }, fingerCR: { y: -14, z: -10 }, fingerAL: { y: -14, z: 10 }, fingerCL: { y: 14, z: 10 } } },
  FLAT: { bones: { fingerAR: { z: -6 }, fingerBR: { z: -6 }, fingerCR: { z: -6 }, fingerAL: { z: 6 }, fingerBL: { z: 6 }, fingerCL: { z: 6 } } },
  LAND: { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -4 } } },
  LIGHT: { bones: { spine: { x: -3 }, head: { x: 3 } } },
  OPEN: { expression: 'open' },
  ANGRY: { expression: 'angry' },
  FOCUS: { expression: 'focus' },
  SHUT: { expression: 'closed' },
  DROWSY: { expression: 'half' },
  HAPPY: { expression: 'happy' },
  HURT: { expression: 'hurt' },
  WIDE: { expression: 'wide' },
};
