// Blaziken's status moves: at the foe (a snarl, a roar, sand kicked, venom
// spewed, a wink, a strut, a copy) and on itself (focus, flexing, a sword
// dance, guards, a doll, afterimages, sleep, the sun). They play at home, so
// from our side they stay clear of the healthboxes: arms wide rather than
// overhead (tools/gauntlet/uiclear.mjs).

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import {
  ANGRY, ARMS_SPREAD_UP, BLADE_HAND, BRACED, CHAMBER, CROSSED, DROWSY, ELBOWS_BACK, FISTS, FLEX, FOLDED, GUARD, HAPPY, HOP, LAND, LIMP,
  OPEN_EYES, SHUT, SPLAY, SQUEEZE, X_GUARD,
  armL, armR, arms, bend, flames, jaw, key, legR, pelvis, root, snap, twist,
} from './kit';

/** Growl: it lowers its head and leans in, claws open, and a low, menacing snarl rumbles from the beak. */
export const growl: Clip = {
  name: 'growl',
  duration: 1.35,
  keys: [
    key(0),
    // The head lowers, the body leans in, claws spread.
    key(0.18, pelvis(0, -0.035, 0.01), bend(16, 6, 6, -4), SPLAY, arms([[-0.55, -0.55, 0.63], [-0.2, -0.1, 0.97]], [[0.55, -0.6, 0.58], [0.2, -0.1, 0.97]]), ANGRY),
    // The snarl.
    snap(0.3, pelvis(0, -0.04, 0.02), bend(18, 8, 10, -8), SPLAY, arms([[-0.58, -0.52, 0.63], [-0.22, -0.06, 0.97]], [[0.58, -0.56, 0.6], [0.22, -0.06, 0.97]]), jaw(22), ANGRY),
    // It rumbles: the head shaking a little.
    key(0.48, pelvis(0, -0.042, 0.022), bend(18, 8, 10, -8, 5, 2), SPLAY, arms([[-0.58, -0.52, 0.63], [-0.22, -0.06, 0.97]], [[0.58, -0.56, 0.6], [0.22, -0.06, 0.97]]), jaw(18), ANGRY),
    key(0.64, pelvis(0, -0.04, 0.02), bend(18, 8, 10, -8, -5, -2), SPLAY, arms([[-0.58, -0.52, 0.63], [-0.22, -0.06, 0.97]], [[0.58, -0.56, 0.6], [0.22, -0.06, 0.97]]), jaw(24), ANGRY),
    key(0.8, pelvis(0, -0.035, 0.015), bend(16, 7, 8, -6, 3), SPLAY, arms([[-0.56, -0.54, 0.63], [-0.2, -0.08, 0.97]], [[0.56, -0.58, 0.59], [0.2, -0.08, 0.97]]), jaw(12), ANGRY),
    key(0.96, pelvis(0, -0.015), bend(6, 2, 2, -2), jaw(2), ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Roar: it rears up tall, chest out, then throws its head forward and roars with all its might, swaying with it. */
export const roar: Clip = {
  name: 'roar',
  duration: 1.55,
  keys: [
    key(0),
    // Rears up, drawing breath.
    key(0.24, pelvis(0, 0.016), bend(-12, -8, -8, -16), ELBOWS_BACK, FISTS, ANGRY, flames(0.4)),
    // The roar: head thrown forward, beak wide.
    snap(0.36, pelvis(0, -0.03, 0.03), bend(16, 10, 4, -6), ELBOWS_BACK, FISTS, jaw(40), ANGRY, flames(1)),
    key(0.56, pelvis(0, -0.03, 0.03), bend(16, 10, 4, -6, 8, 3), ELBOWS_BACK, FISTS, jaw(42), ANGRY, flames(1)),
    key(0.76, pelvis(0, -0.03, 0.026), bend(15, 10, 4, -6, -8, -3), ELBOWS_BACK, FISTS, jaw(40), ANGRY, flames(1)),
    key(0.94, pelvis(0, -0.024, 0.02), bend(12, 8, 2, -5, 3), ELBOWS_BACK, FISTS, jaw(30), ANGRY, flames(0.8)),
    key(1.1, pelvis(0, -0.01, 0.01), bend(6, 2, 0, -3), CHAMBER, jaw(6), ANGRY, flames(0.4)),
    key(1.55, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/** Sand-Attack: weight on the back leg, the front foot draws back along the ground and kicks sand up at the foe's face. */
export const sand_attack: Clip = {
  name: 'sand_attack',
  duration: 1.35,
  keys: [
    key(0),
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.04, -0.01), bend(22, 0, 0, -10, 8), twist(-8), GUARD, ANGRY,
      legR([-0.3, -0.92, -0.25], [-0.15, -0.8, -0.58])),
    // The kick: the foot sweeps forward and up, flinging the sand.
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.03, 0.01), bend(6, 0, 0, -10, 2), twist(6), GUARD, ANGRY,
      legR([-0.22, -0.3, 0.93], [-0.12, -0.05, 0.99])),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.03, 0.008), bend(8, 0, 0, -10), twist(4), GUARD, ANGRY,
      legR([-0.25, -0.45, 0.86], [-0.12, -0.55, 0.83])),
    key(0.7, pelvis(0, -0.04), bend(14, 0, 0, 0), GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/** Toxic: a retch (hunched, the head down, eyes squeezed), then it spews poison from its beak at the foe, twice. */
export const toxic: Clip = {
  name: 'toxic',
  duration: 1.45,
  keys: [
    key(0),
    // The retch.
    key(0.2, pelvis(0, -0.045), bend(18, 9, 6, 12), CROSSED, SQUEEZE),
    key(0.4, pelvis(0, -0.01), bend(-4, -6, -8, -12), ELBOWS_BACK, SQUEEZE),
    // Spewed at the foe.
    snap(0.5, pelvis(0, -0.03, 0.03), bend(16, 8, 6, -6), BRACED, jaw(36), ANGRY),
    key(0.64, pelvis(0, -0.032, 0.03), bend(17, 8, 6, -6, 3), BRACED, jaw(32), ANGRY),
    // A second heave.
    key(0.76, pelvis(0, -0.02, 0.015), bend(8, 4, 2, -10), BRACED, jaw(10), ANGRY),
    key(0.86, pelvis(0, -0.03, 0.028), bend(15, 8, 6, -6, -3), BRACED, jaw(30), ANGRY),
    key(1.04, pelvis(0, -0.014), bend(6, 2, 0, -3, 6), CHAMBER, jaw(2), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'emit' }],
};

/** Attract: a cool, flirty pose: a hand on the hip, a tilt of the head, then it points its claw at the foe with a wink (hearts). */
export const attract: Clip = {
  name: 'attract',
  duration: 1.5,
  keys: [
    key(0),
    // Leans back cool, the left hand on its hip.
    key(0.2, pelvis(0.01, -0.01, -0.01), bend(-6, -4, 0, -6, 0, 10), armL([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89]), armR([-0.4, -0.7, 0.59], [-0.2, -0.6, 0.77]), HAPPY),
    // Points at the foe, the head tipped the other way: a wink.
    snap(0.36, pelvis(0.01, -0.012), bend(-4, -4, 0, -8, 0, -12), armL([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89]), armR([-0.22, 0.1, 0.97], [-0.1, 0.2, 0.97]), HAPPY),
    key(0.52, pelvis(0.012, -0.012), bend(-4, -4, 0, -8, 4, -13), armL([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89]), armR([-0.22, 0.12, 0.97], [-0.1, 0.24, 0.96]), HAPPY),
    // A little sway, still pointing.
    key(0.7, pelvis(0.006, -0.01), bend(-4, -4, 0, -7, -3, -9), armL([0.62, -0.52, -0.58], [-0.3, -0.35, 0.89]), armR([-0.24, 0.08, 0.97], [-0.1, 0.18, 0.98]), HAPPY),
    key(0.9, pelvis(0, -0.008), bend(0, 0, 0, -4, 0, -4), GUARD, HAPPY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/** Swagger: a cocky strut, a step each way with the chest thrown out and the chin up, then a beckoning claw at the foe. */
export const swagger: Clip = {
  name: 'swagger',
  duration: 1.65,
  keys: [
    key(0),
    // Chest out, chin up, arms folded.
    key(0.2, pelvis(0, 0.01), bend(-10, -8, -4, -12), FOLDED, ANGRY),
    // A strut to one side...
    key(0.38, { plantRight: 0 }, legR([-0.25, -0.5, 0.83], [-0.12, -0.95, 0.28]), root({ x: -0.03 }), pelvis(-0.01, 0.012), bend(-10, -8, -4, -12, 8, 4), FOLDED, ANGRY),
    key(0.52, root({ x: -0.06 }), pelvis(0, 0.006), bend(-10, -8, -4, -12, 6), FOLDED, ANGRY),
    // ...and back.
    key(0.66, { plantLeft: 0 }, root({ x: -0.03 }), pelvis(0.01, 0.012), bend(-10, -8, -4, -12, -8, -4), FOLDED, ANGRY),
    // The beckoning claw.
    snap(0.78, pelvis(0, 0.004), bend(-8, -6, -4, -12), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), armR([-0.35, -0.2, 0.92], [-0.1, 0.62, 0.78]), HAPPY),
    key(0.9, pelvis(0, 0.004), bend(-8, -6, -4, -12, 0, 6), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), armR([-0.35, -0.2, 0.92], [-0.12, 0.8, 0.59]), HAPPY),
    key(1.02, pelvis(0, 0.004), bend(-8, -6, -4, -12, 0, -4), armL([0.5, -0.66, -0.56], [0.18, -0.2, 0.96]), armR([-0.35, -0.2, 0.92], [-0.1, 0.6, 0.79]), HAPPY),
    key(1.2, pelvis(0, -0.006), bend(-2, -2, 0, -6), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.84, name: 'emit' }],
};

/**
 * Mimic: it studies the foe, leaning in with the head tilting one way then
 * the other, then copies it: both hands raised flat before it like a mirror,
 * a mime's pose, and back.
 */
export const mimic: Clip = {
  name: 'mimic',
  duration: 1.55,
  keys: [
    key(0),
    // Studying the foe.
    key(0.2, pelvis(0, -0.02, 0.012), bend(10, 4, 4, -6, 6, 10), FOLDED, ANGRY),
    key(0.4, pelvis(0, -0.022, 0.014), bend(11, 4, 4, -6, -6, -10), FOLDED, ANGRY),
    // The copy: flat hands up before it, a mirror image.
    snap(0.54, pelvis(0, -0.01), bend(0, 0, 0, -4), BLADE_HAND, arms([[-0.4, -0.3, 0.87], [0.1, 0.72, 0.69]], [[0.4, -0.3, 0.87], [-0.1, 0.72, 0.69]]), HAPPY),
    key(0.7, pelvis(0.006, -0.01), bend(0, 0, 0, -4, 4, 3), BLADE_HAND, arms([[-0.4, -0.28, 0.87], [0.1, 0.74, 0.66]], [[0.4, -0.28, 0.87], [-0.1, 0.74, 0.66]]), HAPPY),
    key(0.88, pelvis(-0.006, -0.01), bend(0, 0, 0, -4, -4, -3), BLADE_HAND, arms([[-0.4, -0.3, 0.87], [0.1, 0.72, 0.69]], [[0.4, -0.3, 0.87], [-0.1, 0.72, 0.69]]), HAPPY),
    key(1.08, pelvis(0, -0.01), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'emit' }],
};

/** Focus Energy: still and tense, eyes shut, fists at the hips, gathering; then a sharp exhale, the eyes snapping open and the flames flaring. */
export const focus_energy: Clip = {
  name: 'focus_energy',
  duration: 1.6,
  keys: [
    key(0),
    // Still, tense, sinking a little.
    key(0.26, pelvis(0, -0.035), bend(6, 2, 0, 6), CHAMBER, FISTS, SHUT),
    key(0.44, pelvis(0.002, -0.04), bend(7, 2, 0, 7, 0, 1), CHAMBER, FISTS, SHUT, flames(0.2)),
    key(0.56, pelvis(-0.002, -0.042), bend(7, 2, 0, 7, 0, -1), CHAMBER, FISTS, SHUT, flames(0.3)),
    // The exhale: the chest pops, the eyes snap open.
    snap(0.66, pelvis(0, -0.02), bend(-6, -6, -2, -8), CHAMBER, FISTS, jaw(14), ANGRY, flames(0.9)),
    key(0.82, pelvis(0.002, -0.022), bend(-6, -6, -2, -8, 0, 1.5), CHAMBER, FISTS, jaw(6), ANGRY, flames(1)),
    key(0.98, pelvis(-0.002, -0.02), bend(-5, -6, -2, -8, 0, -1.5), CHAMBER, FISTS, ANGRY, flames(0.9)),
    key(1.2, pelvis(0, -0.01), bend(2, 0, 0, -2), CHAMBER, ANGRY, flames(0.4)),
    key(1.6, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/** Bulk Up: it gathers in, arms crossed and eyes shut, then flexes hard with a tremor, flames at its wrists, and relaxes. */
export const bulk_up: Clip = {
  name: 'bulk_up',
  duration: 1.7,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.05), bend(22, 6, 4, 16), CROSSED, FISTS, SHUT),
    key(0.42, pelvis(0, -0.056), bend(24, 7, 4, 18, 0, 1), CROSSED, FISTS, SHUT),
    // Flex: chest out, arms up, straining.
    snap(0.56, pelvis(0, -0.02), bend(-10, -8, -4, -12), FLEX, FISTS, ANGRY, flames(1)),
    key(0.68, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.8, pelvis(0, -0.02), bend(-10, -9, -4, -12, 0, -1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.92, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(1.04, pelvis(0, -0.021), bend(-10, -9, -4, -12, 0, -1), FLEX, FISTS, ANGRY, flames(1)),
    key(1.28, pelvis(0, -0.02), bend(6, 2, 0, -2), CHAMBER, ANGRY, flames(0.4)),
    key(1.7, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Swords Dance: a fierce fighting dance. A crouch with the claws low, a
 * hopping spin with the arms out, and it lands with its claws crossed and
 * raised before it, trembling with power.
 */
export const swords_dance: Clip = {
  name: 'swords_dance',
  duration: 1.8,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.055), bend(18, 4, 0, -6), SPLAY, arms([[-0.35, -0.8, 0.49], [0.4, -0.7, 0.59]], [[0.35, -0.8, 0.49], [-0.4, -0.7, 0.59]]), ANGRY),
    // The spin: a hop round with the arms out.
    key(0.38, root({ y: 0.06, yaw: 150 }), HOP, bend(4, 0, 0, -8), SPLAY, ARMS_SPREAD_UP, ANGRY, flames(0.6)),
    key(0.54, root({ y: 0.04, yaw: 320 }), HOP, bend(4, 0, 0, -8), SPLAY, ARMS_SPREAD_UP, ANGRY, flames(0.8)),
    // Lands facing the foe, claws crossed and raised.
    snap(0.64, root({ yaw: 360 }), LAND, bend(4, 0, 0, -8), SPLAY, X_GUARD, ANGRY, flames(1)),
    key(0.82, root({ yaw: 360 }), pelvis(0.002, -0.04), bend(4, 0, 0, -8, 0, 1.5), SPLAY, X_GUARD, ANGRY, flames(1)),
    key(1.0, root({ yaw: 360 }), pelvis(-0.002, -0.04), bend(4, 0, 0, -8, 0, -1.5), SPLAY, X_GUARD, ANGRY, flames(1)),
    key(1.18, root({ yaw: 360 }), pelvis(0.002, -0.038), bend(4, 0, 0, -8, 0, 1), SPLAY, X_GUARD, ANGRY, flames(0.9)),
    key(1.4, root({ yaw: 360 }), pelvis(0, -0.02), bend(4, 0, 0, -2), GUARD, ANGRY, flames(0.4)),
    key(1.8, root({ yaw: 360 }), flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/**
 * Mirror Move: it watches the foe, arms folded, then sweeps its right arm
 * across before it (a flash of a mirror) and strikes the foe's own pose back
 * at it, mirrored: its left claw reaching forward.
 */
export const mirror_move: Clip = {
  name: 'mirror_move',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.02), bend(4, 0, 0, -6, 0, 6), FOLDED, ANGRY),
    // The sweep across.
    key(0.36, pelvis(0, -0.03), twist(16), bend(6, 0, 0, -6, -6), BLADE_HAND, armR([0.3, 0.1, 0.95], [0.9, 0.3, 0.3]), armL([0.4, -0.7, 0.59], [-0.3, 0.3, 0.9]), ANGRY),
    snap(0.48, pelvis(0, -0.03), twist(-16), bend(6, 0, 0, -6, 6), BLADE_HAND, armR([-0.9, 0.2, 0.39], [-0.9, 0.3, -0.3]), armL([0.4, -0.7, 0.59], [-0.3, 0.3, 0.9]), ANGRY),
    // The mirrored pose: its stance turned about, the left claw reaching.
    key(0.68, pelvis(0, -0.05), { bones: { spine: { y: 20 }, chest: { y: 12 }, head: { y: -20 } } }, arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]], [[0.42, -0.42, 0.8], [0.2, -0.3, 0.93]]), SPLAY, ANGRY),
    key(0.86, pelvis(0.003, -0.052), { bones: { spine: { y: 20 }, chest: { y: 12 }, head: { y: -22 } } }, arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96]], [[0.42, -0.4, 0.81], [0.2, -0.28, 0.94]]), SPLAY, ANGRY),
    key(1.06, pelvis(0, -0.03), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/** Sleep Talk: asleep on its feet, it mumbles and twitches, an arm jerking and a foot shifting, then droops. */
export const sleep_talk: Clip = {
  name: 'sleep_talk',
  duration: 1.65,
  keys: [
    key(0),
    key(0.22, pelvis(0, -0.035), root({ roll: -3 }), bend(16, 6, 6, 18, 0, -8), LIMP, SHUT),
    // A twitch of the arm and a mumble.
    key(0.36, pelvis(0, -0.033), root({ roll: -3 }), bend(15, 6, 6, 16, 4, -8), LIMP, armR([-0.6, -0.4, 0.69], [-0.3, 0.2, 0.93]), jaw(12), SHUT),
    key(0.48, pelvis(0, -0.036), root({ roll: -3 }), bend(16, 6, 6, 18, 0, -8), LIMP, jaw(3), SHUT),
    // A foot shifts, a mumble.
    key(0.6, { plantRight: 0.3 }, legR([-0.25, -0.8, 0.54], [-0.12, -0.97, 0.2]), pelvis(0, -0.03), root({ roll: -2 }), bend(15, 6, 6, 17, -3, -7), LIMP, jaw(14), SHUT),
    key(0.74, pelvis(0, -0.036), root({ roll: -3 }), bend(16, 6, 6, 18, 0, -8), LIMP, jaw(4), SHUT),
    key(0.9, pelvis(0, -0.034), root({ roll: -2 }), bend(15, 6, 6, 17, 2, -9), LIMP, armL([0.6, -0.45, 0.66], [0.3, 0.1, 0.95]), jaw(10), SHUT),
    key(1.1, pelvis(0, -0.03), root({ roll: -2 }), bend(14, 6, 5, 16, 0, -8), LIMP, jaw(2), SHUT),
    key(1.65, SHUT),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/** Protect: it steps back into a crouch and snaps its forearms crossed before its face: a barrier; it holds, trembling, and lowers them. */
export const protect: Clip = {
  name: 'protect',
  duration: 1.45,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.04, -0.01), bend(10, 2, 0, 4), GUARD, ANGRY),
    snap(0.28, pelvis(0, -0.06, -0.012), bend(14, 4, 2, 8), X_GUARD, FISTS, SQUEEZE),
    key(0.46, pelvis(0.003, -0.062, -0.012), bend(14, 4, 2, 8, 0, 1), X_GUARD, FISTS, SQUEEZE),
    key(0.64, pelvis(-0.003, -0.063, -0.012), bend(15, 4, 2, 8, 0, -1), X_GUARD, FISTS, SQUEEZE),
    key(0.82, pelvis(0.002, -0.061, -0.012), bend(14, 4, 2, 8, 0, 1), X_GUARD, FISTS, ANGRY),
    key(1.02, pelvis(0, -0.03), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/** Endure: it sinks into a deep, wide crouch, fists clenched at its sides, gritting its beak, trembling as it digs in. */
export const endure: Clip = {
  name: 'endure',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.08), bend(18, 6, 2, 6), BRACED, FISTS, SQUEEZE),
    snap(0.32, pelvis(0, -0.1), bend(22, 8, 2, 8), BRACED, FISTS, jaw(4), SQUEEZE, flames(0.6)),
    key(0.46, pelvis(0.003, -0.102), bend(22, 8, 2, 8, 0, 1.5), BRACED, FISTS, jaw(6), SQUEEZE, flames(0.8)),
    key(0.6, pelvis(-0.003, -0.1), bend(23, 8, 2, 8, 0, -1.5), BRACED, FISTS, jaw(4), SQUEEZE, flames(0.9)),
    key(0.74, pelvis(0.003, -0.102), bend(22, 8, 2, 8, 0, 1.5), BRACED, FISTS, jaw(6), SQUEEZE, flames(0.8)),
    key(0.9, pelvis(-0.002, -0.1), bend(22, 8, 2, 8, 0, -1), BRACED, FISTS, jaw(4), ANGRY, flames(0.7)),
    key(1.14, pelvis(0, -0.04), bend(8, 2, 0, 0), GUARD, ANGRY, flames(0.3)),
    key(1.55, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.38, name: 'aura' }],
};

/** Substitute: a burst of effort, arms flung out, then it hops back out of the way (the doll takes its place) and steps up again. */
export const substitute: Clip = {
  name: 'substitute',
  duration: 1.55,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.05), bend(18, 6, 2, 10), CROSSED, FISTS, SQUEEZE),
    // The burst.
    snap(0.34, pelvis(0, 0.01), bend(-10, -6, -4, -14), ARMS_SPREAD_UP, jaw(20), ANGRY, flames(0.8)),
    key(0.46, pelvis(0, 0.012), bend(-10, -6, -4, -14, 0, 2), ARMS_SPREAD_UP, jaw(14), ANGRY, flames(0.8)),
    // Hops back.
    key(0.6, root({ y: 0.05, z: -0.1 }), HOP, bend(6, 0, 0, -6), GUARD, ANGRY, flames(0.5)),
    key(0.74, root({ z: -0.14 }), LAND, GUARD, ANGRY, flames(0.3)),
    key(0.92, root({ z: -0.14 }), pelvis(0, -0.02), bend(6, 0, 0, -4), GUARD, ANGRY),
    // And steps back up.
    key(1.1, { plantRight: 0 }, legR([-0.25, -0.6, 0.76], [-0.12, -0.95, 0.28]), root({ z: -0.07 }), bend(4, 0, 0, -2), GUARD, ANGRY),
    key(1.26, pelvis(0, -0.01), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'aura' }],
};

/**
 * Double Team: it darts left and right in quick hops faster than the eye,
 * guard up; the two darkened afterimages swing out on both sides from the
 * aura (0.18 heights a dart: wider took our Blaziken under our healthbox).
 */
export const double_team: Clip = {
  name: 'double_team',
  duration: 1.75,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(14, 2, 0, -4), GUARD, ANGRY),
    key(0.2, root({ x: 0.144, y: 0.05 }), HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.3, root({ x: 0.18 }), LAND, GUARD, ANGRY),
    key(0.42, root({ x: -0.03, y: 0.06 }), HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.52, root({ x: -0.18 }), LAND, GUARD, ANGRY),
    key(0.64, root({ x: 0.012, y: 0.06 }), HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.74, root({ x: 0.156 }), LAND, GUARD, ANGRY),
    key(0.86, root({ x: -0.012, y: 0.05 }), HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.96, root({ x: -0.144 }), LAND, GUARD, ANGRY),
    key(1.1, root({ x: -0.036, y: 0.04 }), HOP, bend(6, 0, 0, -2), GUARD, ANGRY),
    key(1.22, root({ x: 0 }), LAND, GUARD, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Rest: a big yawn, then it sits down on its heels with its arms folded and
 * its head nodding to one side, and dozes off contentedly (aura: it heals),
 * breathing slow; it stirs and rises, still drowsy.
 */
export const rest: Clip = {
  name: 'rest',
  duration: 2.0,
  keys: [
    key(0),
    // The yawn.
    key(0.2, pelvis(0, 0.008), bend(-8, -6, -6, -18), ELBOWS_BACK, jaw(30), SHUT),
    key(0.34, pelvis(0, 0.006), bend(-7, -6, -6, -17, 0, 4), ELBOWS_BACK, jaw(26), SHUT),
    // Sits down on its heels, arms folded, head nodding over.
    key(0.64, pelvis(0, -0.2, -0.04), bend(14, 6, 6, 14, 0, 14), FOLDED, SHUT),
    key(0.84, pelvis(0, -0.19, -0.04), bend(12, 5, 5, 12, 0, 15), FOLDED, SHUT),
    key(1.04, pelvis(0, -0.2, -0.04), bend(14, 6, 6, 14, 0, 16), FOLDED, SHUT),
    key(1.24, pelvis(0, -0.19, -0.04), bend(12, 5, 5, 12, 0, 15), FOLDED, SHUT),
    // Stirs and rises, drowsy.
    key(1.52, pelvis(0, -0.04), bend(6, 2, 0, 2, 0, 6), FOLDED, DROWSY),
    key(2.0, DROWSY),
  ],
  events: [{ t: 0.7, name: 'aura' }],
};

/** Cupped claws low before the belly (gathering heat). */
const CUPPED_LOW: Pose = arms([[-0.3, -0.85, 0.43], [0.35, -0.2, 0.92]], [[0.3, -0.85, 0.43], [-0.35, -0.2, 0.92]]);
/** Cupped claws lifted before the face (an offering up to the sky). */
const CUPPED_HIGH: Pose = arms([[-0.35, -0.2, 0.92], [0.3, 0.8, 0.52]], [[0.35, -0.2, 0.92], [-0.3, 0.8, 0.52]]);

/**
 * Sunny Day: it cups its claws low before its belly and gathers heat (the
 * wrist flames swelling), then rises and offers it up to the sky, the cupped
 * claws lifted before its face and its head tipped back; the sun answers
 * and it basks a moment.
 */
export const sunny_day: Clip = {
  name: 'sunny_day',
  duration: 1.7,
  keys: [
    key(0),
    // Gathering heat in the cupped claws.
    key(0.22, pelvis(0, -0.055), bend(18, 6, 2, 10), CUPPED_LOW, SHUT, flames(0.6)),
    key(0.36, pelvis(0, -0.06), bend(19, 6, 2, 11), CUPPED_LOW, SHUT, flames(0.8)),
    // Rising, the claws lifted before its face, the head tipped back to the sky.
    key(0.6, pelvis(0, 0.012), bend(-8, -8, -10, -24), CUPPED_HIGH, jaw(12), HAPPY, flames(1)),
    key(0.84, pelvis(0.004, 0.016), bend(-10, -9, -10, -26, 4, 3), CUPPED_HIGH, jaw(16), HAPPY, flames(1)),
    key(1.06, pelvis(-0.004, 0.014), bend(-9, -8, -10, -25, -4, -3), CUPPED_HIGH, jaw(10), HAPPY, flames(0.9)),
    key(1.3, pelvis(0, -0.01), bend(4, 0, 0, -2), GUARD, HAPPY, flames(0.5)),
    key(1.7, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

export const STATUS: Clip[] = [
  growl, roar, sand_attack, toxic, attract, swagger, mimic,
  focus_energy, bulk_up, swords_dance, mirror_move, sleep_talk, protect, endure, substitute, double_team, rest, sunny_day,
];
