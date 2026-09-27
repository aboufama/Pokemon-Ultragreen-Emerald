// Grovyle's kit for the Treecko line's choreography (src/pokemon/treecko/line):
// its stance, its timing and its version of every named pose. Grovyle is the
// forest ninja of the line (21.6 kg, 0.9 m): quicker than Sceptile and the
// springiest of the three (it leaps between branches), it cuts with the big
// leaves on its forearms (the forearm leads; the leaves fan back from it), its
// long neck carries the head forward from a torso leaning well forward, and
// its two-bone tail ends in a leaf brush.
//
// The skeleton has one torso bone (the chest's share of a bend goes to it),
// no finger bones (the hands are single bones), a lower jaw, and forearms
// that carry the leaves: a forearm's twist turns its leaf fan, so arm
// positions keep the stance's twists (right +90, left -90: the fans shown to
// the sides) unless they give their own.
//
// Directions are model space: +X its left, +Y up, +Z forward.

import type { Pose } from '../../anim/rig';
import type { Arm, ArmName, Kit, LegName } from '../treecko/line/kit';
import { STANCE } from './poses';

const R: Record<ArmName, Arm> = {
  // Stances and guards.
  stance: [[-0.45, -0.45, 0.77], [-0.2, -0.35, 0.92], [-0.1, -0.2, 0.97]],
  guard: [[-0.5, -0.4, 0.77], [0.2, 0.65, 0.73], [0.15, 0.85, 0.5]],
  guardLow: [[-0.45, -0.45, 0.77], [-0.2, -0.35, 0.92], [-0.1, -0.2, 0.97]],
  braced: [[-0.45, -0.8, -0.35], [-0.25, -0.55, 0.8], [-0.2, -0.4, 0.89]],
  elbowsBack: [[-0.55, -0.42, -0.72], [-0.25, 0.05, 0.97], [-0.15, 0.1, 0.98]],
  crossed: [[-0.35, -0.25, 0.9], [0.7, 0.45, 0.55], [0.6, 0.65, 0.45]],
  crossedLow: [[-0.3, -0.6, 0.74], [0.75, 0.05, 0.66], [0.7, 0.15, 0.7]],
  spread: [[-0.85, 0.35, 0.3], [-0.5, 0.85, 0.2], [-0.3, 0.95, 0.1]],
  wide: [[-0.92, 0.2, 0.34], [-0.72, 0.5, 0.48], [-0.55, 0.62, 0.56]],
  low: [[-0.88, -0.35, 0.3], [-0.6, -0.2, 0.77], [-0.45, -0.1, 0.89]],
  palmsUp: [[-0.8, 0.1, 0.55], [-0.6, 0.6, 0.5], [-0.4, 0.85, 0.35]],
  reach: [[-0.55, 0.05, 0.83], [-0.35, 0.15, 0.92], [-0.3, 0.2, 0.93]],
  reachFar: [[-0.4, 0.08, 0.91], [-0.22, 0.12, 0.97], [-0.18, 0.15, 0.97]],
  clawsUp: [[-0.6, 0.3, 0.74], [-0.25, 0.9, 0.36], [-0.1, 0.98, 0.15]],
  clawsOut: [[-0.5, 0.05, 0.86], [-0.3, 0.3, 0.9], [-0.2, 0.4, 0.89]],
  flinch: [[-0.75, -0.2, 0.6], [-0.35, 0.35, 0.87], [-0.2, 0.6, 0.77]],
  back: [[-0.35, -0.45, -0.82], [-0.25, -0.25, -0.93], [-0.2, -0.2, -0.96]],
  droop: [[-0.45, -0.88, 0.15], [-0.25, -0.93, 0.27], [-0.15, -0.95, 0.27]],
  flare: [[-0.86, 0.4, 0.32], [-0.64, 0.68, 0.36], [-0.5, 0.8, 0.33]],
  flex: [[-0.95, 0.25, 0.1], [-0.15, 0.97, 0.15], [-0.05, 0.95, 0.3]],
  hug: [[-0.3, -0.45, 0.84], [0.8, 0.05, 0.6], [0.75, 0.2, 0.63]],
  shade: [[-0.5, 0.45, 0.74], [0.7, 0.25, 0.67], [0.8, 0.1, 0.59]],
  cover: [[-0.45, 0.35, 0.82], [0.6, 0.7, 0.39], [0.7, 0.55, 0.45]],
  // Cuts: the forearm leaf leads.
  bladeHigh: [[-0.55, 0.65, -0.52], [-0.15, 0.96, -0.23], [-0.05, 0.9, -0.43]],
  bladeBack: [[-0.85, 0.08, -0.52], [-0.4, 0.15, 0.9], [-0.25, 0.2, 0.95]],
  cutAcross: [[0.3, 0.02, 0.95], [0.8, 0.05, 0.6], [0.88, 0.05, 0.47]],
  cutFollow: [[0.6, -0.05, 0.8], [0.95, -0.05, 0.3], [0.96, -0.1, 0.2]],
  slashEnd: [[0.45, -0.45, 0.77], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]],
  slashFollow: [[0.6, -0.65, 0.45], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]],
  chopHigh: [[-0.3, 0.88, 0.36], [-0.1, 0.95, -0.3], [-0.05, 0.85, -0.52]],
  chopDown: [[-0.2, -0.28, 0.94], [-0.1, -0.72, 0.69], [-0.05, -0.9, 0.43]],
  chopLow: [[-0.15, -0.6, 0.78], [0.0, -0.95, 0.3], [0.0, -0.98, 0.18]],
  backhandCock: [[0.4, -0.1, 0.91], [0.9, 0.2, -0.38], [0.85, 0.3, -0.43]],
  backhandEnd: [[-0.9, 0.05, 0.43], [-0.95, 0.1, 0.3], [-0.95, 0.1, 0.28]],
  rakeWide: [[-0.9, 0.3, -0.3], [-0.6, 0.75, -0.25], [-0.4, 0.9, -0.2]],
  rakeBack: [[-0.85, 0.1, 0.52], [-0.95, 0.25, 0.2], [-0.9, 0.35, 0.25]],
  clawHigh: [[-0.45, 0.8, 0.4], [-0.2, 0.9, 0.38], [-0.1, 0.8, 0.59]],
  clawDown: [[-0.25, -0.35, 0.9], [-0.1, -0.7, 0.7], [0.0, -0.9, 0.44]],
  bladesHigh: [[-0.4, 0.75, -0.5], [0.15, 0.95, -0.2], [0.2, 0.9, -0.35]],
  bladesCrossed: [[0.3, -0.5, 0.8], [0.7, -0.55, 0.45], [0.75, -0.55, 0.35]],
  risingBlade: [[-0.4, 0.82, 0.42], [-0.2, 0.97, 0.15], [-0.1, 0.95, -0.3]],
  bladeLow: [[-0.45, -0.75, -0.48], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]],
  slapHigh: [[-0.55, 0.7, 0.45], [-0.3, 0.9, 0.3], [-0.2, 0.7, 0.68]],
  slapDown: [[-0.25, -0.12, 0.96], [-0.15, -0.52, 0.84], [-0.1, -0.85, 0.52]],
  elbow: [[0.1, 0.05, 0.99], [0.6, 0.1, -0.79], [0.6, 0.15, -0.79]],
  palm: [[-0.3, 0.05, 0.95], [-0.15, 0.08, 0.99], [-0.05, 0.9, 0.43]],
  // Fists.
  fistHip: [[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]],
  // A haymaker's wind-up: the elbow swung far back and out, the fist cocked up beside the head.
  fistBack: [[-0.72, 0.08, -0.69], [-0.2, 0.72, 0.66], [-0.1, 0.8, 0.59]],
  punch: [[-0.1, 0.02, 0.99], [-0.02, 0.05, 1], [0, 0.05, 1]],
  punchHigh: [[-0.2, 0.2, 0.96], [-0.1, 0.25, 0.96], [-0.05, 0.25, 0.97]],
  // An overhand landing: the arm come over the top, the fist driving forward and down.
  overhand: [[-0.2, 0.3, 0.93], [-0.05, -0.28, 0.96], [0, -0.35, 0.94]],
  hookBack: [[-0.95, -0.05, -0.3], [-0.1, 0.0, 1.0], [0.0, 0.0, 1.0]],
  hook: [[-0.4, 0.05, 0.92], [0.75, 0.05, 0.66], [0.85, 0.05, 0.52]],
  uppercutLow: [[-0.45, -0.8, -0.4], [-0.2, -0.25, 0.95], [-0.1, 0.1, 0.99]],
  uppercut: [[-0.2, 0.85, 0.48], [-0.05, 0.98, 0.2], [0.0, 0.98, 0.2]],
  hammerHigh: [[-0.4, 0.8, -0.45], [0.1, 0.9, -0.42], [0.15, 0.8, -0.58]],
  hammerDown: [[-0.2, -0.35, 0.91], [-0.05, -0.85, 0.52], [0.0, -0.97, 0.25]],
  // Grips, throws, scoops.
  grabWide: [[-0.62, 0.02, 0.78], [-0.25, 0.12, 0.96], [-0.12, 0.2, 0.97]],
  clamp: [[-0.3, -0.45, 0.84], [0.45, -0.1, 0.89], [0.45, 0.02, 0.89]],
  carry: [[-0.3, -0.3, 0.9], [0.45, 0.05, 0.89], [0.45, 0.1, 0.88]],
  hoist: [[-0.3, 0.1, 0.95], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]],
  hurl: [[-0.15, -0.5, 0.85], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]],
  hurlLow: [[-0.18, -0.62, 0.76], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]],
  dive: [[-0.15, 0.9, 0.4], [0.1, 0.95, 0.3], [0.12, 0.95, 0.2]],
  scoop: [[-0.6, -0.75, -0.2], [-0.5, -0.82, -0.15], [-0.4, -0.9, -0.1]],
  sling: [[-0.35, 0.4, 0.85], [-0.2, 0.66, 0.72], [-0.15, 0.72, 0.68]],
};

/** The left arm's own positions: the stance's raised wing-arm, the crossed arms. */
const L: Partial<Record<ArmName, Arm>> = {
  stance: [[0.6, 0.25, -0.76], [0.35, 0.75, 0.56], [0.2, 0.9, 0.39]],
  crossed: [[0.35, -0.25, 0.9], [-0.7, 0.5, 0.5], [-0.6, 0.7, 0.4]],
  crossedLow: [[0.3, -0.6, 0.74], [-0.75, 0.1, 0.65], [-0.7, 0.2, 0.68]],
  flinch: [[0.7, -0.35, 0.6], [0.35, 0.2, 0.9], [0.2, 0.3, 0.93]],
};

const legs: Record<LegName, Pose> = {
  tuck: { plantFeet: 0, aim: { thighR: { dir: [-0.3, -0.25, 0.92] }, shinR: { dir: [-0.1, -0.85, -0.52] }, thighL: { dir: [0.35, -0.75, -0.55] }, shinL: { dir: [0.15, -0.4, -0.9] } } },
  hop: { plantFeet: 0, aim: { thighR: { dir: [-0.4, -0.4, 0.82] }, shinR: { dir: [-0.1, -0.9, -0.42] }, thighL: { dir: [0.4, -0.4, 0.82] }, shinL: { dir: [0.1, -0.9, -0.42] } } },
  drop: { plantFeet: 0 },
  squat: { aim: { thighR: { dir: [-0.85, -0.3, 0.43] }, shinR: { dir: [0.3, -0.8, -0.52] }, thighL: { dir: [0.85, -0.3, 0.43] }, shinL: { dir: [-0.3, -0.8, -0.52] } } },
  lungeR: { aim: { thighR: { dir: [-0.3, -0.3, 0.9] }, shinR: { dir: [-0.05, -0.9, -0.43] }, thighL: { dir: [0.35, -0.75, -0.56] }, shinL: { dir: [0.1, -0.5, -0.86] } } },
  lungeL: { aim: { thighL: { dir: [0.3, -0.3, 0.9] }, shinL: { dir: [0.05, -0.9, -0.43] }, thighR: { dir: [-0.35, -0.75, -0.56] }, shinR: { dir: [-0.1, -0.5, -0.86] } } },
  kickChamberR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.2, 0.3, 0.93] }, shinR: { dir: [-0.1, -0.85, 0.52] } } },
  kickOutR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.12, 0.12, 0.98] }, shinR: { dir: [-0.08, 0.15, 0.98] } } },
  kickHighR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.1, 0.5, 0.86] }, shinR: { dir: [-0.05, 0.55, 0.83] } } },
  sideChamberL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.45, 0.35, 0.82] }, shinL: { dir: [0.75, -0.62, -0.22] } } },
  sideKickL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.95, 0.28, 0.12] }, shinL: { dir: [0.95, 0.3, 0.08] } } },
  rise: { plantFeet: 0, aim: { thighR: { dir: [-0.2, 0.2, 0.96] }, shinR: { dir: [-0.12, -0.9, 0.42] }, thighL: { dir: [0.3, -0.9, -0.3] }, shinL: { dir: [0.15, -0.6, -0.78] } } },
  stompL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.85, 0.4, 0.35] }, shinL: { dir: [0.3, -0.95, 0.05] } } },
  pawR: { plantLeft: 1, plantRight: 0, aim: { thighR: { dir: [-0.25, -0.75, -0.6] }, shinR: { dir: [-0.1, -0.4, -0.91] } } },
  pawL: { plantLeft: 0, plantRight: 1, aim: { thighL: { dir: [0.25, -0.75, -0.6] }, shinL: { dir: [0.1, -0.4, -0.91] } } },
};

export const GROVYLE_KIT: Kit = {
  slug: 'grovyle',
  stance: STANCE,
  tempo: 0.9,
  spring: 1.35,
  reach: 0.12,
  // Measured with the mirror match's approach (fronts 0.15 apart): these blows need to land closer.
  // With its back to the foe (Slam, Iron Tail) the tail has to reach: it lands much closer.
  extraReach: {
    fury_cutter: 0.24, aerial_ace: 0.06, crush_claw: 0.07, brick_break: 0.03,
    counter: 0.2, mega_kick: 0.34, body_slam: 0.07, slam: 0.72, iron_tail: 0.5,
    quick_attack: 0.24, pursuit: 0.04, frustration: 0.14, return: 0.07, facade: 0.07, double_edge: 0.08, endeavor: 0.26,
    secret_power: 0.03, strength: 0.03,
    struggle: 0.2, dig: 0.04,
  },
  /** One torso bone: the chest's share goes to the spine; a single neck bone. */
  bend: (spine, chest, neck, head, headY = 0, headZ = 0) => ({
    bones: { spine: { x: spine + chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
  }),
  twist: (y, z = 0) => ({ bones: { spine: { y, z } } }),
  tail: (lift, sweep = 0) => ({ bones: { tail: { x: lift * 0.55, y: sweep * 0.55 }, tail2: { x: lift * 0.45, y: sweep * 0.45 } } }),
  jaw: (deg) => ({ bones: { jaw: { x: deg } } }),
  right: R,
  left: L,
  arms: (r, l) => ({
    aim: {
      armR: { dir: r[0] }, forearmR: { dir: r[1], twist: r[3] ?? 90 }, handR: { dir: r[2] },
      armL: { dir: l[0] }, forearmL: { dir: l[1], twist: l[3] ?? -90 }, handL: { dir: l[2] },
    },
  }),
  legs,
  // No finger bones: the hands stay as they are.
  FISTS: {},
  SPLAYED: {},
  FLAT: {},
  LAND: { plantFeet: 1, pelvis: { y: -0.05 }, bones: { spine: { x: 8 }, head: { x: -6 } } },
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
