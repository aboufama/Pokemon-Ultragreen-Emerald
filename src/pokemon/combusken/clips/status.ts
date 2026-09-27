// Combusken's status moves: at the foe (a snarl, sand kicked, venom spat, a
// wink, a strut, a copy) and on itself (focus, flexing, a sword dance,
// guards, a doll, afterimages, sleep, the sun). They play at home, so from
// our side they stay clear of the healthboxes: arms wide rather than
// overhead (tools/gauntlet/uiclear.mjs).

import type { Clip } from '../../../anim/clip';
import type { Arm } from './kit';
import {
  ANGRY, BRACED, CHAMBER, CHAMBER_ARM, CROSSED, DROWSY, ELBOWS_BACK, FEET, FLEX, FOLDED, GUARD, HAPPY, HOP, LIMP,
  OPEN_EYES, SHUT, SKIP, SQUEEZE, TUCK, WINGS_OUT, X_GUARD,
  armL, armR, arms, bend, both, crest, jaw, key, legR, mirrorArm, pelvis, root, snap, tail, twist,
} from './kit';

const A = (arm: [number, number, number], fore: [number, number, number], hand?: [number, number, number]): Arm => [arm, fore, hand ?? fore];
/** Clawed hands spread low and out: a threat. */
const CLAWS_OUT = both(A([-0.58, -0.52, 0.63], [-0.22, -0.06, 0.97], [-0.1, 0.1, 0.99]));

/** Growl: it lowers its head and leans in, clawed hands spread, and a low, menacing snarl rumbles from its beak. */
export const growl: Clip = {
  name: 'growl',
  duration: 1.35,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.035, 0.01), bend(14, 6, 8, -4), CLAWS_OUT, crest(-10), ANGRY),
    snap(0.3, pelvis(0, -0.04, 0.02), bend(16, 8, 12, -8), CLAWS_OUT, jaw(22), crest(-12), tail(-8), ANGRY),
    key(0.48, pelvis(0, -0.042, 0.022), bend(16, 8, 12, -8, 5, 2), CLAWS_OUT, jaw(18), ANGRY),
    key(0.64, pelvis(0, -0.04, 0.02), bend(16, 8, 12, -8, -5, -2), CLAWS_OUT, jaw(24), ANGRY),
    key(0.8, pelvis(0, -0.035, 0.015), bend(14, 7, 10, -6, 3), CLAWS_OUT, jaw(12), ANGRY),
    key(0.96, pelvis(0, -0.015), bend(4, 2, 2, -2), jaw(2), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Sand-Attack: weight on its standing leg, the raised foot swings down and back along the ground, then kicks sand up at the foe's face. */
export const sand_attack: Clip = {
  name: 'sand_attack',
  duration: 1.35,
  keys: [
    key(0),
    key(0.22, legR([-0.3, -0.88, -0.37], [-0.15, -0.78, -0.61]), pelvis(0.02, -0.045, -0.01), bend(20, 0, 0, -10, 8), twist(-8), GUARD, ANGRY),
    snap(0.34, legR([-0.22, -0.3, 0.93], [-0.12, -0.05, 0.99]), pelvis(0.015, -0.03, 0.01), bend(4, 0, 0, -10, 2), twist(6), GUARD, ANGRY),
    key(0.5, legR([-0.25, -0.1, 0.96], [-0.12, -0.4, 0.91]), pelvis(0.012, -0.03, 0.008), bend(6, 0, 0, -10), twist(4), GUARD, ANGRY),
    key(0.7, pelvis(0, -0.04), bend(12, 0, 0, 0), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/** Toxic: a retch (hunched, the head down, eyes squeezed), then it spits poison from its beak at the foe, twice. */
export const toxic: Clip = {
  name: 'toxic',
  duration: 1.45,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.05), bend(18, 9, 6, 12), CROSSED, SQUEEZE),
    key(0.4, FEET, pelvis(0, -0.012), bend(-4, -6, -8, -12), ELBOWS_BACK, SQUEEZE),
    snap(0.5, FEET, pelvis(0, -0.035, 0.03), bend(14, 8, 8, -6), BRACED, jaw(36), ANGRY),
    key(0.64, FEET, pelvis(0, -0.037, 0.03), bend(15, 8, 8, -6, 3), BRACED, jaw(32), ANGRY),
    key(0.76, FEET, pelvis(0, -0.025, 0.015), bend(6, 4, 2, -10), BRACED, jaw(10), ANGRY),
    key(0.86, FEET, pelvis(0, -0.035, 0.028), bend(13, 8, 8, -6, -3), BRACED, jaw(30), ANGRY),
    key(1.04, pelvis(0, -0.015), bend(4, 2, 0, -3, 6), CHAMBER, jaw(2), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'emit' }],
};

/** Attract: a cocky, flirty pose: a clawed hand on its hip, a tilt of the head, then it points at the foe with a wink (hearts), its raised foot tapping. */
export const attract: Clip = {
  name: 'attract',
  duration: 1.5,
  keys: [
    key(0),
    key(0.2, pelvis(0.01, -0.01, -0.01), bend(-6, -4, 0, -6, 0, 10), armL(A([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89], [-0.5, -0.2, 0.84])), armR(A([-0.4, -0.7, 0.59], [-0.2, -0.6, 0.77])), HAPPY),
    snap(0.36, pelvis(0.01, -0.012), bend(-4, -4, 0, -8, 0, -12), armL(A([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89], [-0.5, -0.2, 0.84])), armR(A([-0.22, 0.1, 0.97], [-0.1, 0.2, 0.97], [-0.05, 0.3, 0.95])), HAPPY),
    key(0.52, legR([-0.25, 0.1, 0.96], [-0.15, -0.4, 0.9]), pelvis(0.012, -0.012), bend(-4, -4, 0, -8, 4, -13), armL(A([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89], [-0.5, -0.2, 0.84])), armR(A([-0.22, 0.12, 0.97], [-0.1, 0.24, 0.96], [-0.05, 0.34, 0.94])), HAPPY),
    key(0.7, pelvis(0.006, -0.01), bend(-4, -4, 0, -7, -3, -9), armL(A([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89], [-0.5, -0.2, 0.84])), armR(A([-0.24, 0.08, 0.97], [-0.1, 0.18, 0.98], [-0.05, 0.28, 0.96])), HAPPY),
    key(0.9, pelvis(0, -0.008), bend(0, 0, 0, -4, 0, -4), GUARD, HAPPY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/** Swagger: a cocky strut on its long legs, chest out and chin up with its arms folded, a step each way, then a beckoning claw at the foe. */
export const swagger: Clip = {
  name: 'swagger',
  duration: 1.65,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, 0.008), bend(-10, -8, -4, -12), FOLDED, crest(6), ANGRY),
    key(0.38, root({ x: -0.03 }), pelvis(-0.01, 0.01), bend(-10, -8, -4, -12, 8, 4), FOLDED, ANGRY),
    key(0.52, FEET, root({ x: -0.06 }), pelvis(0, 0.005), bend(-10, -8, -4, -12, 6), FOLDED, ANGRY),
    key(0.66, { plantLeft: 0, plantRight: 1 }, legR([-0.1, -0.9, 0.42], [-0.06, -0.94, -0.33]), root({ x: -0.03 }), pelvis(0.01, 0.01), bend(-10, -8, -4, -12, -8, -4), FOLDED, ANGRY),
    snap(0.78, FEET, pelvis(0, 0.004), bend(-8, -6, -4, -12), armL(mirrorArm(CHAMBER_ARM)), armR(A([-0.35, -0.2, 0.92], [-0.1, 0.62, 0.78], [0.1, 0.8, 0.59])), HAPPY),
    key(0.9, FEET, pelvis(0, 0.004), bend(-8, -6, -4, -12, 0, 6), armL(mirrorArm(CHAMBER_ARM)), armR(A([-0.35, -0.2, 0.92], [-0.12, 0.8, 0.59], [0.15, 0.95, 0.27])), HAPPY),
    key(1.02, FEET, pelvis(0, 0.004), bend(-8, -6, -4, -12, 0, -4), armL(mirrorArm(CHAMBER_ARM)), armR(A([-0.35, -0.2, 0.92], [-0.1, 0.6, 0.79], [0.1, 0.78, 0.62])), HAPPY),
    key(1.2, pelvis(0, -0.006), bend(-2, -2, 0, -6), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'emit' }],
};

/** Mimic: it studies the foe, the head tilting one way then the other, then copies it: both flat hands raised before it like a mirror, a mime's pose. */
export const mimic: Clip = {
  name: 'mimic',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.02, 0.012), bend(8, 4, 6, -6, 6, 10), FOLDED, ANGRY),
    key(0.4, pelvis(0, -0.022, 0.014), bend(9, 4, 6, -6, -6, -10), FOLDED, ANGRY),
    snap(0.54, FEET, pelvis(0, -0.012), bend(0, 0, 0, -4), both(A([-0.4, -0.3, 0.87], [0.1, 0.72, 0.69], [0.05, 0.95, 0.3])), HAPPY),
    key(0.7, FEET, pelvis(0.006, -0.012), bend(0, 0, 0, -4, 4, 3), both(A([-0.4, -0.28, 0.87], [0.1, 0.74, 0.66], [0.05, 0.96, 0.27])), HAPPY),
    key(0.88, FEET, pelvis(-0.006, -0.012), bend(0, 0, 0, -4, -4, -3), both(A([-0.4, -0.3, 0.87], [0.1, 0.72, 0.69], [0.05, 0.95, 0.3])), HAPPY),
    key(1.08, pelvis(0, -0.012), bend(2, 0, 0, -2), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'emit' }],
};

/** Focus Energy: still and tense on both feet, eyes shut, hands at the hips, gathering; then a sharp exhale, the eyes snapping open, the crest standing. */
export const focus_energy: Clip = {
  name: 'focus_energy',
  duration: 1.6,
  keys: [
    key(0),
    key(0.26, FEET, pelvis(0, -0.04), bend(6, 2, 0, 6), CHAMBER, crest(-8), SHUT),
    key(0.44, FEET, pelvis(0.002, -0.045), bend(7, 2, 0, 7, 0, 1), CHAMBER, crest(-9), SHUT),
    key(0.56, FEET, pelvis(-0.002, -0.047), bend(7, 2, 0, 7, 0, -1), CHAMBER, crest(-10), SHUT),
    snap(0.66, FEET, pelvis(0, -0.025), bend(-6, -6, -2, -8), CHAMBER, jaw(14), crest(12), tail(-14), ANGRY),
    key(0.82, FEET, pelvis(0.002, -0.027), bend(-6, -6, -2, -8, 0, 1.5), CHAMBER, jaw(6), crest(12), ANGRY),
    key(0.98, FEET, pelvis(-0.002, -0.025), bend(-5, -6, -2, -8, 0, -1.5), CHAMBER, crest(10), ANGRY),
    key(1.2, pelvis(0, -0.012), bend(2, 0, 0, -2), CHAMBER, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/** Bulk Up: it gathers in, arms crossed and eyes shut, then flexes hard on both feet, chest out, with a tremor, and relaxes. */
export const bulk_up: Clip = {
  name: 'bulk_up',
  duration: 1.7,
  keys: [
    key(0),
    key(0.3, FEET, pelvis(0, -0.055), bend(20, 6, 4, 16), CROSSED, SHUT),
    key(0.42, FEET, pelvis(0, -0.06), bend(22, 7, 4, 18, 0, 1), CROSSED, SHUT),
    snap(0.56, FEET, pelvis(0, -0.025), bend(-10, -8, -4, -12), FLEX, crest(10), ANGRY),
    key(0.68, FEET, pelvis(0, -0.029), bend(-11, -8, -4, -13, 0, 1.5), FLEX, crest(10), ANGRY),
    key(0.8, FEET, pelvis(0, -0.025), bend(-10, -9, -4, -12, 0, -1.5), FLEX, crest(9), ANGRY),
    key(0.92, FEET, pelvis(0, -0.029), bend(-11, -8, -4, -13, 0, 1.5), FLEX, crest(10), ANGRY),
    key(1.04, FEET, pelvis(0, -0.026), bend(-10, -9, -4, -12, 0, -1), FLEX, crest(9), ANGRY),
    key(1.28, pelvis(0, -0.02), bend(4, 2, 0, -2), CHAMBER, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/** Swords Dance: a fierce dance: a crouch with the claws low, a hopping spin with the arms flung out, and it lands with its claws crossed and raised, trembling with power. */
export const swords_dance: Clip = {
  name: 'swords_dance',
  duration: 1.8,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.06), bend(16, 4, 0, -6), both(A([-0.35, -0.8, 0.49], [0.4, -0.7, 0.59], [0.5, -0.6, 0.62])), ANGRY),
    key(0.38, root({ y: 0.07, yaw: 150 }), HOP, bend(4, 0, 0, -8), WINGS_OUT, crest(-12), ANGRY),
    key(0.54, root({ y: 0.05, yaw: 320 }), HOP, bend(4, 0, 0, -8), WINGS_OUT, crest(-12), ANGRY),
    snap(0.64, root({ yaw: 360 }), FEET, pelvis(0, -0.05), bend(4, 0, 0, -8), X_GUARD, ANGRY),
    key(0.82, root({ yaw: 360 }), FEET, pelvis(0.002, -0.045), bend(4, 0, 0, -8, 0, 1.5), X_GUARD, ANGRY),
    key(1.0, root({ yaw: 360 }), FEET, pelvis(-0.002, -0.045), bend(4, 0, 0, -8, 0, -1.5), X_GUARD, ANGRY),
    key(1.18, root({ yaw: 360 }), FEET, pelvis(0.002, -0.043), bend(4, 0, 0, -8, 0, 1), X_GUARD, ANGRY),
    key(1.4, root({ yaw: 360 }), pelvis(0, -0.02), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.8, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/** Mirror Move: it watches, arms folded, then sweeps its right arm across before it (a flash of a mirror) and strikes the foe's own pose back, mirrored: the left claw reaching, the left knee up. */
export const mirror_move: Clip = {
  name: 'mirror_move',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.02), bend(4, 0, 0, -6, 0, 6), FOLDED, ANGRY),
    key(0.36, pelvis(0, -0.03), twist(16), bend(6, 0, 0, -6, -6), armR(A([0.3, 0.1, 0.95], [0.9, 0.3, 0.3], [0.95, 0.3, 0.1])), armL(A([0.4, -0.7, 0.59], [-0.3, 0.3, 0.9])), ANGRY),
    snap(0.48, pelvis(0, -0.03), twist(-16), bend(6, 0, 0, -6, 6), armR(A([-0.9, 0.2, 0.39], [-0.9, 0.3, -0.3], [-0.85, 0.4, -0.35])), armL(A([0.4, -0.7, 0.59], [-0.3, 0.3, 0.9])), ANGRY),
    // Its stance, mirrored: the left leg up, the left claw reaching.
    key(0.68, { plantLeft: 0, plantRight: 1 }, legR([-0.1, -0.9, 0.42], [-0.06, -0.94, -0.33]), { aim: { thighL: { dir: [0.25, 0.3, 0.92] }, shinL: { dir: [0.15, -0.15, 0.98] } } }, pelvis(0, -0.035), { bones: { spine: { y: -20 }, chest: { y: -12 }, head: { y: 16 } } }, arms(A([-0.45, -0.5, -0.74], [-0.4, -0.55, -0.73], [-0.35, -0.62, -0.7]), A([0.4, 0.35, 0.85], [0.3, 0.38, 0.87], [0.22, 0.36, 0.9])), ANGRY),
    key(0.86, { plantLeft: 0, plantRight: 1 }, legR([-0.1, -0.9, 0.42], [-0.06, -0.94, -0.33]), { aim: { thighL: { dir: [0.25, 0.32, 0.91] }, shinL: { dir: [0.15, -0.13, 0.98] } } }, pelvis(0.003, -0.037), { bones: { spine: { y: -20 }, chest: { y: -12 }, head: { y: 18 } } }, arms(A([-0.45, -0.5, -0.74], [-0.4, -0.55, -0.73], [-0.35, -0.62, -0.7]), A([0.4, 0.37, 0.84], [0.3, 0.4, 0.87], [0.22, 0.38, 0.9])), ANGRY),
    key(1.06, FEET, pelvis(0, -0.03), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/** Sleep Talk: asleep on both feet, it mumbles and twitches, a clawed hand jerking and a foot shifting, then droops. */
export const sleep_talk: Clip = {
  name: 'sleep_talk',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, FEET, pelvis(0, -0.04), root({ roll: -3 }), bend(14, 6, 6, 18, 0, -8), LIMP, SHUT),
    key(0.36, FEET, pelvis(0, -0.038), root({ roll: -3 }), bend(13, 6, 6, 16, 4, -8), LIMP, armR(A([-0.6, -0.4, 0.69], [-0.3, 0.2, 0.93], [-0.2, 0.4, 0.89])), jaw(12), SHUT),
    key(0.48, FEET, pelvis(0, -0.041), root({ roll: -3 }), bend(14, 6, 6, 18, 0, -8), LIMP, jaw(3), SHUT),
    key(0.6, { plantRight: 0.3 }, legR([-0.25, -0.75, 0.61], [-0.12, -0.97, 0.2]), pelvis(0, -0.035), root({ roll: -2 }), bend(13, 6, 6, 17, -3, -7), LIMP, jaw(14), SHUT),
    key(0.74, FEET, pelvis(0, -0.041), root({ roll: -3 }), bend(14, 6, 6, 18, 0, -8), LIMP, jaw(4), SHUT),
    key(0.9, FEET, pelvis(0, -0.039), root({ roll: -2 }), bend(13, 6, 6, 17, 2, -9), LIMP, armL(A([0.6, -0.45, 0.66], [0.3, 0.1, 0.95], [0.2, 0.3, 0.93])), jaw(10), SHUT),
    key(1.1, FEET, pelvis(0, -0.035), root({ roll: -2 }), bend(12, 6, 5, 16, 0, -8), LIMP, jaw(2), SHUT),
    key(1.65, SHUT),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/** Protect: it drops onto both feet in a crouch and snaps its forearms crossed before its face: a barrier; it holds, trembling, and lowers them. */
export const protect: Clip = {
  name: 'protect',
  duration: 1.45,
  keys: [
    key(0),
    key(0.16, FEET, pelvis(0, -0.045, -0.01), bend(8, 2, 0, 4), GUARD, ANGRY),
    snap(0.28, FEET, pelvis(0, -0.065, -0.012), bend(12, 4, 2, 8), X_GUARD, crest(-10), SQUEEZE),
    key(0.46, FEET, pelvis(0.003, -0.067, -0.012), bend(12, 4, 2, 8, 0, 1), X_GUARD, crest(-10), SQUEEZE),
    key(0.64, FEET, pelvis(-0.003, -0.068, -0.012), bend(13, 4, 2, 8, 0, -1), X_GUARD, crest(-11), SQUEEZE),
    key(0.82, FEET, pelvis(0.002, -0.066, -0.012), bend(12, 4, 2, 8, 0, 1), X_GUARD, crest(-10), ANGRY),
    key(1.02, pelvis(0, -0.03), bend(4, 2, 0, 0), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/** Endure: it sinks into a deep, wide crouch on both feet, clawed hands clenched low at its sides, gritting its beak, trembling as it digs in. */
export const endure: Clip = {
  name: 'endure',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.085), bend(16, 6, 2, 6), BRACED, SQUEEZE),
    snap(0.32, FEET, pelvis(0, -0.105), bend(20, 8, 2, 8), BRACED, jaw(4), crest(-12), SQUEEZE),
    key(0.46, FEET, pelvis(0.003, -0.107), bend(20, 8, 2, 8, 0, 1.5), BRACED, jaw(6), crest(-12), SQUEEZE),
    key(0.6, FEET, pelvis(-0.003, -0.105), bend(21, 8, 2, 8, 0, -1.5), BRACED, jaw(4), crest(-13), SQUEEZE),
    key(0.74, FEET, pelvis(0.003, -0.107), bend(20, 8, 2, 8, 0, 1.5), BRACED, jaw(6), crest(-12), SQUEEZE),
    key(0.9, FEET, pelvis(-0.002, -0.105), bend(20, 8, 2, 8, 0, -1), BRACED, jaw(4), crest(-12), ANGRY),
    key(1.14, pelvis(0, -0.04), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'aura' }],
};

/** Substitute: a burst of effort, arms flung out, then it hops back out of the way (the doll takes its place) and skips up again. */
export const substitute: Clip = {
  name: 'substitute',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.055), bend(16, 6, 2, 10), CROSSED, SQUEEZE),
    snap(0.34, FEET, pelvis(0, 0.01), bend(-10, -6, -4, -14), WINGS_OUT, jaw(20), crest(8), ANGRY),
    key(0.46, FEET, pelvis(0, 0.012), bend(-10, -6, -4, -14, 0, 2), WINGS_OUT, jaw(14), crest(8), ANGRY),
    key(0.6, root({ y: 0.06, z: -0.1 }), HOP, bend(4, 0, 0, -6), GUARD, ANGRY),
    key(0.74, root({ z: -0.14 }), SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(0.92, root({ z: -0.14 }), pelvis(0, -0.03), bend(4, 0, 0, -4), GUARD, ANGRY),
    key(1.1, root({ y: 0.04, z: -0.07 }), TUCK, bend(2, 0, 0, -2), GUARD, ANGRY),
    key(1.24, SKIP, pelvis(0, -0.02), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'aura' }],
};

/** Double Team: it darts left and right in quick skipping hops faster than the eye, guard up; the afterimages swing out on both sides from the aura. */
export const double_team: Clip = {
  name: 'double_team',
  duration: 1.75,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(12, 2, 0, -4), GUARD, ANGRY),
    key(0.2, root({ x: 0.144, y: 0.05 }), HOP, bend(6, 0, 0, -4), GUARD, ANGRY),
    key(0.3, root({ x: 0.18 }), SKIP, GUARD, ANGRY),
    key(0.42, root({ x: -0.03, y: 0.06 }), HOP, bend(6, 0, 0, -4), GUARD, ANGRY),
    key(0.52, root({ x: -0.18 }), SKIP, GUARD, ANGRY),
    key(0.64, root({ x: 0.012, y: 0.06 }), HOP, bend(6, 0, 0, -4), GUARD, ANGRY),
    key(0.74, root({ x: 0.156 }), SKIP, GUARD, ANGRY),
    key(0.86, root({ x: -0.012, y: 0.05 }), HOP, bend(6, 0, 0, -4), GUARD, ANGRY),
    key(0.96, root({ x: -0.144 }), SKIP, GUARD, ANGRY),
    key(1.1, root({ x: -0.036, y: 0.04 }), HOP, bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.22, root({ x: 0 }), SKIP, GUARD, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/** Rest: a big yawn, then it sits down on its heels with its arms folded and its head nodding to one side, dozing contentedly (aura: it heals); it stirs and rises, drowsy. */
export const rest: Clip = {
  name: 'rest',
  duration: 2.0,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, 0.006), bend(-8, -6, -6, -18), ELBOWS_BACK, jaw(30), SHUT),
    key(0.34, FEET, pelvis(0, 0.004), bend(-7, -6, -6, -17, 0, 4), ELBOWS_BACK, jaw(26), SHUT),
    key(0.64, FEET, pelvis(0, -0.16, -0.04), bend(14, 6, 8, 14, 0, 14), FOLDED, crest(-10), SHUT),
    key(0.84, FEET, pelvis(0, -0.15, -0.04), bend(12, 5, 7, 12, 0, 15), FOLDED, crest(-10), SHUT),
    key(1.04, FEET, pelvis(0, -0.16, -0.04), bend(14, 6, 8, 14, 0, 16), FOLDED, crest(-11), SHUT),
    key(1.24, FEET, pelvis(0, -0.15, -0.04), bend(12, 5, 7, 12, 0, 15), FOLDED, crest(-10), SHUT),
    key(1.52, FEET, pelvis(0, -0.04), bend(4, 2, 0, 2, 0, 6), FOLDED, DROWSY),
    key(2.0, DROWSY),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/** Sunny Day: it dips, then rises on both feet with its face to the sky and its arms spread wide, calling the sun, basking with happy eyes. */
export const sunny_day: Clip = {
  name: 'sunny_day',
  duration: 1.65,
  keys: [
    key(0),
    key(0.2, FEET, pelvis(0, -0.045), bend(8, 2, 0, 8), BRACED, SHUT),
    key(0.46, FEET, pelvis(0, 0.015), bend(-12, -10, -10, -22), WINGS_OUT, jaw(20), crest(8), HAPPY),
    key(0.64, FEET, pelvis(0.008, 0.017), bend(-13, -10, -10, -23, 4, 4), WINGS_OUT, jaw(24), crest(8), HAPPY),
    key(0.84, FEET, pelvis(-0.008, 0.015), bend(-12, -10, -10, -22, -4, -4), WINGS_OUT, jaw(20), crest(8), HAPPY),
    key(1.02, FEET, pelvis(0.004, 0.013), bend(-11, -9, -9, -20, 2, 2), WINGS_OUT, jaw(12), crest(6), HAPPY),
    key(1.26, pelvis(0, -0.012), bend(2, 0, 0, -2), GUARD, HAPPY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

export const STATUS: Clip[] = [
  growl, sand_attack, toxic, attract, swagger, mimic,
  focus_energy, bulk_up, swords_dance, mirror_move, sleep_talk, protect, endure, substitute, double_team, rest, sunny_day,
];
