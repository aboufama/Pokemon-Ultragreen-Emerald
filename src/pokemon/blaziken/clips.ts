// Blaziken's battle animation set, one clip per attack category (+ idle, intro,
// hit, faint and kick variants). Keys are STANCE + deltas (see compose()).
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (jumps, spins, sink)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   fx.flames 0..1  wrist flames (the stock sprite shows none at rest)
//   expression      eye atlas cell
// Events: impact (contact lands), release (projectile/beam starts),
// releaseEnd, charge, cry, aura, emit, thud.
//
// How the clips are built (the 12 principles, applied to game clips):
//   - every action has an anticipation (wind-up, crouch, drawn breath) and a
//     follow-through (the limb carries on past the hit, then settles);
//   - keys are extremes and breakdowns; without an explicit ease they are
//     joined by smooth curves, so motion flows and only eases where a
//     channel turns around. 'out' marks snaps (fast start, soft stop);
//   - travel is a leap along an arc with the legs tucked, landing into a
//     knee bend, never a slide;
//   - holds keep moving a little (moving holds);
//   - breath attacks come from the mouth: the head leads, the arms stay
//     braced at the sides so the silhouette reads the action.
// The animator adds the rest: overlapping action (head, arms and hands trail
// the body by a few frames, so events that depend on them are placed a
// little after their key), breathing, blinks, and springs on the mane, tail
// and feathers (see src/anim/animator.ts, src/battle3d/battler.ts).

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

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const SHUT: Pose = { expression: 'closed' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const flames = (v: number): Pose => ({ fx: { flames: v } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});

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

const LIMP_ARMS: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.95, 0.1] },
    forearmR: { dir: [-0.1, -0.95, 0.3] },
    armL: { dir: [0.3, -0.95, 0.1] },
    forearmL: { dir: [0.1, -0.95, 0.3] },
  },
};

/** Both fists chambered at the hips, elbows back (the stance's left arm, mirrored). */
const CHAMBER: Pose = {
  aim: {
    armR: { dir: [-0.5, -0.66, -0.56] },
    forearmR: { dir: [-0.18, -0.2, 0.96] },
    armL: { dir: [0.5, -0.66, -0.56] },
    forearmL: { dir: [0.18, -0.2, 0.96] },
  },
};

/** Drawing breath: elbows pulled back and up, chest open. */
const ELBOWS_BACK: Pose = {
  aim: {
    armR: { dir: [-0.55, -0.42, -0.72] },
    forearmR: { dir: [-0.22, 0.08, 0.97] },
    armL: { dir: [0.55, -0.42, -0.72] },
    forearmL: { dir: [0.22, 0.08, 0.97] },
  },
};

/** Braced for a blast: arms low at the sides, fists by the thighs. */
const BRACED: Pose = {
  aim: {
    armR: { dir: [-0.42, -0.82, -0.38] },
    forearmR: { dir: [-0.22, -0.5, 0.84] },
    armL: { dir: [0.42, -0.82, -0.38] },
    forearmL: { dir: [0.22, -0.5, 0.84] },
  },
};

/** Arms crossed low in front (gathering power). */
const CROSSED: Pose = {
  aim: {
    armR: { dir: [-0.2, -0.75, 0.63] },
    forearmR: { dir: [0.75, -0.1, 0.65] },
    armL: { dir: [0.2, -0.75, 0.63] },
    forearmL: { dir: [-0.75, -0.05, 0.66] },
  },
};

/** Double-biceps flex. */
const FLEX: Pose = {
  aim: {
    armR: { dir: [-0.95, 0.25, 0.1] },
    forearmR: { dir: [-0.15, 0.97, 0.15] },
    armL: { dir: [0.95, 0.25, 0.1] },
    forearmL: { dir: [0.15, 0.97, 0.15] },
  },
};

/** Claws curled into fists. */
const FISTS: Pose = {
  bones: {
    fingerA1R: { z: 34 }, fingerB1R: { z: 34 }, fingerC1R: { z: 34 },
    fingerA2R: { z: 30 }, fingerB2R: { z: 30 }, fingerC2R: { z: 30 },
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
  },
};

/** Airborne, travelling forward: leading knee up, trailing leg back. */
const TUCK: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.25, -0.38, 0.89] }, shinR: { dir: [-0.12, -0.96, -0.25] },
    thighL: { dir: [0.28, -0.78, -0.56] }, shinL: { dir: [0.12, -0.42, -0.9] },
  },
};

/** Airborne, hopping back: both knees drawn up a little. */
const HOP: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.72, 0.62] }, shinR: { dir: [-0.15, -0.93, -0.33] },
    thighL: { dir: [0.33, -0.8, 0.5] }, shinL: { dir: [0.18, -0.92, -0.35] },
  },
};

/** Landing: knees absorb the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -6 } } };

// Clips -----------------------------------------------------------------------

const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(2.4),
  ],
};

/** Sent out: bursts out of a crouch into a battle cry, wrist flames flaring (cf. BACK_ANIM_SHAKE_GLOW_RED). */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.05), bend(16, 4, 0, 18), CROSSED, FISTS, SHUT),
    key(0.2, pelvis(0, -0.075), bend(22, 6, 2, 22), CROSSED, FISTS, SHUT),
    snap(0.42, pelvis(0, 0.016), bend(-14, -8, -6, -22), ARMS_SPREAD_UP, jaw(34), ANGRY, flames(1)),
    key(0.62, pelvis(0, 0.012), bend(-13, -8, -6, -20, 0, 4), ARMS_SPREAD_UP, jaw(30), ANGRY, flames(1)),
    key(0.8, pelvis(0, 0.014), bend(-14, -8, -6, -21, 0, -4), ARMS_SPREAD_UP, jaw(32), ANGRY, flames(1)),
    key(0.98, pelvis(0, 0.01), bend(-11, -6, -4, -16), ARMS_SPREAD_UP, jaw(8), ANGRY, flames(0.8)),
    key(1.2, pelvis(0, -0.012), bend(6, 2, 0, 0), GUARD, ANGRY, flames(0.4)),
    key(1.65, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Weak contact move (Scratch, Slash, Quick Attack...): leap in, claw slash, hop back. */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: crouch, right shoulder back, claw cocked behind the head.
    key(0.13, pelvis(0, -0.035), { bones: { spine: { x: 14, y: -16 }, head: { x: -8, y: 10 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.55, -0.67] }, forearmR: { dir: [-0.15, 0.95, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Leap along an arc, legs tucked.
    key(0.27, { advance: 0.55, root: { y: 0.075 } }, TUCK, { bones: { spine: { x: 10, y: -18 }, head: { x: -8, y: 12 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.6, -0.62] }, forearmR: { dir: [-0.1, 0.96, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Land in front of the foe, knees taking the weight.
    key(0.38, { advance: 1 }, LAND, { bones: { spine: { x: 16, y: -18 }, head: { x: -8, y: 12 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.55, -0.67] }, forearmR: { dir: [-0.15, 0.95, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Slash down and across: the torso unwinds, the claw leads.
    snap(0.46, { advance: 1 }, pelvis(0.01, -0.035), { bones: { spine: { x: 20, y: 22, z: -6 }, chest: { y: 8 }, head: { x: -6, y: -8 } } }, ANGRY,
      { aim: { armR: { dir: [0.35, -0.4, 0.85] }, forearmR: { dir: [0.6, -0.55, 0.58] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } } }),
    // Follow-through: the claw carries on down and to the side, then hangs there.
    key(0.64, { advance: 1 }, pelvis(0.012, -0.03), { bones: { spine: { x: 21, y: 26, z: -7 }, chest: { y: 9 }, head: { x: -6, y: -9 } } }, ANGRY,
      { aim: { armR: { dir: [0.5, -0.62, 0.6] }, forearmR: { dir: [0.62, -0.72, 0.3] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } } }),
    key(0.8, { advance: 1 }, pelvis(0, -0.035), { bones: { spine: { x: 14, y: 8 } } }, GUARD, ANGRY),
    // Hop back home.
    key(0.96, { advance: 0.45, root: { y: 0.06 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.08, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
};

/**
 * Punches (Sky Uppercut, Fire Punch, Mega Punch): dash in low, coil with the
 * fist at the hip, then drive up through the foe with the whole body — the
 * feet leave the ground — and drop back into a crouch.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.6,
  keys: [
    key(0),
    // Wind down: deep crouch, right fist chambered low, eyes on the foe.
    key(0.14, pelvis(0, -0.07), bend(24, 6, -6, -14), ANGRY, flames(0.5),
      { aim: { armR: { dir: [-0.45, -0.75, -0.48] }, forearmR: { dir: [-0.15, -0.35, 0.92] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }, FISTS),
    // Dash in low along a shallow arc.
    key(0.3, { advance: 0.7, root: { y: 0.04 } }, TUCK, bend(26, 6, -6, -14), ANGRY, flames(0.7),
      { aim: { armR: { dir: [-0.45, -0.75, -0.48] }, forearmR: { dir: [-0.15, -0.35, 0.92] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }, FISTS),
    // Plant under the foe, coiled.
    key(0.42, { advance: 1 }, LAND, pelvis(0, -0.03), bend(26, 8, -6, -16), ANGRY, flames(0.8),
      { aim: { armR: { dir: [-0.5, -0.8, -0.33] }, forearmR: { dir: [-0.15, -0.2, 0.97] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }, FISTS),
    // The uppercut: everything extends upward, the fist leads, feet leave the ground.
    snap(0.52, { advance: 1, plantFeet: 0, root: { y: 0.12 } }, pelvis(0, 0.02), bend(-14, -8, -6, -20), ANGRY, flames(1),
      { aim: { armR: { dir: [-0.15, 0.93, 0.33] }, forearmR: { dir: [-0.08, 0.99, 0.1] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] },
        thighR: { dir: [-0.3, -0.92, 0.2] }, shinR: { dir: [-0.2, -0.97, -0.1] }, thighL: { dir: [0.3, -0.85, -0.4] }, shinL: { dir: [0.15, -0.8, -0.58] } } }, FISTS),
    // Apex: stretched tall, the fist high.
    key(0.7, { advance: 1, plantFeet: 0, root: { y: 0.18 } }, pelvis(0, 0.02), bend(-16, -9, -6, -22), ANGRY, flames(1),
      { aim: { armR: { dir: [-0.1, 0.97, 0.2] }, forearmR: { dir: [-0.05, 0.99, 0.05] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] },
        thighR: { dir: [-0.3, -0.92, 0.2] }, shinR: { dir: [-0.2, -0.97, -0.1] }, thighL: { dir: [0.3, -0.85, -0.4] }, shinL: { dir: [0.15, -0.8, -0.58] } } }, FISTS),
    // Drop back into a crouch.
    fall(0.9, { advance: 1 }, LAND, pelvis(0, -0.03), bend(20, 4, 0, -8), GUARD, ANGRY, flames(0.6)),
    key(1.05, { advance: 1 }, pelvis(0, -0.02), bend(12, 2, 0, -4), GUARD, ANGRY, flames(0.4)),
    // Hop home.
    key(1.2, { advance: 0.45, root: { y: 0.06 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY, flames(0.3)),
    key(1.34, { advance: 0 }, LAND, GUARD, ANGRY, flames(0.1)),
    key(1.6, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/** Tackles (Quick Attack, Take Down): a blur of a dash, shoulder first, and a bounce back. */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.15,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), { bones: { spine: { x: 26, y: -14 }, head: { x: -12, y: 10 } } }, ANGRY,
      { aim: { armR: { dir: [-0.4, -0.7, -0.6] }, forearmR: { dir: [-0.2, -0.4, 0.9] }, armL: { dir: [0.4, -0.7, -0.6] }, forearmL: { dir: [0.2, -0.4, 0.9] } } }),
    // The dash: low and fast, the right shoulder leading, arms swept back.
    key(0.2, { advance: 0.75, root: { y: 0.03 } }, TUCK, { bones: { spine: { x: 34, y: -22 }, head: { x: -16, y: 14 } } }, ANGRY,
      { aim: { armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] } } }),
    snap(0.25, { advance: 1 }, LAND, { bones: { spine: { x: 30, y: -24 }, head: { x: -14, y: 14 } } }, ANGRY,
      { aim: { armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] } } }),
    // Bounce off the foe.
    key(0.4, { advance: 0.75, root: { y: 0.06 } }, HOP, { bones: { spine: { x: 6, y: -6 } } }, GUARD, ANGRY),
    key(0.55, { advance: 0.4, root: { y: 0.04 } }, HOP, GUARD, ANGRY),
    key(0.7, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.25, name: 'impact' }],
};

/** Arms swept back for balance while the head leads (dashes, beak jabs). */
const ARMS_BACK: Pose = {
  aim: { armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] } },
};

/**
 * Peck: the beak is the weapon. The head cocks back, Blaziken leaps in, then
 * the neck and head drive the beak down into the foe with the arms swept
 * back; the head rebounds and it hops home.
 */
const peck: Clip = {
  name: 'peck',
  duration: 1.25,
  keys: [
    key(0),
    // Cock the head back, beak up, weight settling.
    key(0.12, pelvis(0, -0.03), bend(-4, -6, -14, -20), GUARD, ANGRY),
    // Leap in along an arc, head still drawn back.
    key(0.26, { advance: 0.6, root: { y: 0.07 } }, TUCK, bend(4, -4, -14, -20), GUARD, ANGRY),
    // Land in front of the foe and coil: the head goes further back, the arms sweep back for balance.
    key(0.36, { advance: 1 }, LAND, bend(0, -8, -18, -24), ARMS_BACK, ANGRY),
    // The jab: spine, neck and head all pitch forward, the beak leads.
    snap(0.44, { advance: 1 }, pelvis(0, -0.04), bend(22, 12, 18, 18), ARMS_BACK, ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.6, { advance: 1 }, pelvis(0, -0.035), bend(14, 6, 2, -2), ARMS_BACK, ANGRY),
    key(0.78, { advance: 1 }, pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY),
    // Hop home.
    key(0.94, { advance: 0.45, root: { y: 0.06 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.06, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  // The head trails the spine a little (overlap), so the beak lands just after the key.
  events: [{ t: 0.49, name: 'impact' }],
};

/** Weak contact kicks (Double Kick, Low Kick): leap in, two alternating snap kicks, hop back. */
const physicalWeakKick: Clip = {
  name: 'physical_weak_kick',
  duration: 1.7,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.04), { bones: { spine: { x: 22 } } }, GUARD, ANGRY),
    key(0.28, { advance: 0.55, root: { y: 0.07 } }, TUCK, { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    key(0.4, { advance: 1 }, LAND, GUARD, ANGRY),
    // Right snap kick: the standing leg stays planted, the body leans back.
    key(0.46, { advance: 1, plantLeft: 1, plantRight: 0.4 }, pelvis(0.012, -0.03), { bones: { spine: { x: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.5, 0.84] }, shinR: { dir: [-0.12, -0.95, 0.1] } } }),
    snap(0.53, { advance: 1, plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.02), { bones: { spine: { x: -12 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.15, 0.12, 0.98] }, shinR: { dir: [-0.1, 0.18, 0.98] } } }),
    key(0.63, { advance: 1, plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.025), { bones: { spine: { x: 0 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.45, 0.86] }, shinR: { dir: [-0.12, -0.95, 0.15] } } }),
    key(0.72, { advance: 1 }, pelvis(0, -0.04), { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    // Left kick: hips turn into it.
    snap(0.82, { advance: 1, plantLeft: 0, plantRight: 1, root: { yaw: -22 } }, pelvis(-0.015, -0.02), { bones: { spine: { x: -12 } } }, GUARD, ANGRY,
      { aim: { thighL: { dir: [0.15, 0.15, 0.98] }, shinL: { dir: [0.1, 0.22, 0.97] } } }),
    key(0.93, { advance: 1, plantLeft: 0, plantRight: 1, root: { yaw: -14 } }, pelvis(-0.012, -0.025), { bones: { spine: { x: 0 } } }, GUARD, ANGRY,
      { aim: { thighL: { dir: [0.25, -0.5, 0.83] }, shinL: { dir: [0.12, -0.95, 0.1] } } }),
    key(1.03, { advance: 1 }, LAND, GUARD, ANGRY),
    key(1.2, { advance: 0.45, root: { y: 0.06 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.33, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }, { t: 0.83, name: 'impact' }],
};

/** Strong contact move (Blaze Kick, Sky Uppercut...): deep crouch, leap, spinning flame kick, land. */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.1,
  keys: [
    key(0),
    // Coil: deep crouch, turned away from the foe.
    key(0.3, pelvis(0, -0.1), { root: { yaw: -25 } }, { bones: { spine: { x: 26 }, head: { x: -14, y: 18 } } }, GUARD, ANGRY, flames(0.6)),
    // Spring up and in.
    key(0.5, { advance: 0.5, root: { y: 0.2, yaw: -8 } }, TUCK, { bones: { spine: { x: 6 }, head: { x: -8, y: 10 } } }, GUARD, ANGRY, flames(1)),
    // Chamber the kick at the top of the arc, already turning.
    key(0.64, { advance: 0.85, plantFeet: 0, root: { y: 0.23, yaw: 55 } }, { bones: { spine: { x: -6, z: -8 }, head: { y: -40 } } }, ANGRY, flames(1),
      { aim: { thighR: { dir: [-0.8, 0.1, 0.6] }, shinR: { dir: [0.1, -0.6, 0.8] }, thighL: { dir: [0.3, -0.85, -0.42] }, shinL: { dir: [0.1, -0.5, -0.86] },
        armR: { dir: [-0.2, -0.3, 0.93] }, forearmR: { dir: [0.4, 0.5, 0.77] }, armL: { dir: [0.9, 0.1, 0.4] }, forearmL: { dir: [0.6, 0.6, 0.5] } } }),
    // The kick lands side-on, leg fully extended at the foe.
    snap(0.76, { advance: 1, plantFeet: 0, root: { y: 0.17, yaw: 100 } }, { bones: { spine: { x: -8, z: -18 }, head: { x: 4, y: -70 } } }, ANGRY, flames(1),
      { aim: { thighR: { dir: [-0.97, 0.22, 0.1] }, shinR: { dir: [-0.97, 0.24, 0.05] }, thighL: { dir: [0.35, -0.85, -0.38] }, shinL: { dir: [0.15, -0.6, -0.78] },
        armR: { dir: [-0.3, -0.5, -0.8] }, forearmR: { dir: [0.3, -0.2, -0.93] }, armL: { dir: [0.95, 0.2, 0.2] }, forearmL: { dir: [0.75, 0.6, 0.25] } } }),
    // Follow-through: the spin carries on round.
    key(0.94, { advance: 1, plantFeet: 0, root: { y: 0.1, yaw: 230 } }, TUCK, { bones: { spine: { x: 6, z: -6 }, head: { y: -30 } } }, GUARD, ANGRY, flames(1)),
    // Land facing the foe again, deep in the knees.
    key(1.12, { advance: 1, root: { yaw: 360 } }, LAND, pelvis(0, -0.06), { bones: { spine: { x: 22 } } }, GUARD, ANGRY, flames(0.8)),
    key(1.34, { advance: 1, root: { yaw: 360 } }, pelvis(0, -0.03), { bones: { spine: { x: 10 } } }, GUARD, ANGRY, flames(0.6)),
    // Hop back.
    key(1.52, { advance: 0.45, root: { y: 0.07, yaw: 360 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY, flames(0.4)),
    key(1.68, { advance: 0, root: { yaw: 360 } }, LAND, GUARD, ANGRY, flames(0.2)),
    key(2.1, { root: { yaw: 360 } }, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/** Weak ranged move (Ember): a quick breath, then the head snaps forward and spits fire. */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Draw breath: chest up, head tipped back, elbows back.
    key(0.24, pelvis(0, 0.012), bend(-8, -8, -8, -14), ELBOWS_BACK, FISTS, ANGRY, flames(0.5)),
    // Spit: the head drives forward at the foe, beak wide; the body leans in.
    snap(0.34, pelvis(0, -0.016, 0.03), bend(15, 9, -4, -8), CHAMBER, FISTS, jaw(34), ANGRY, flames(0.9)),
    // Recoil: the head bobs back up as the beak closes.
    key(0.5, pelvis(0, -0.01, 0.015), bend(9, 4, -3, -11), CHAMBER, FISTS, jaw(18), ANGRY, flames(0.7)),
    key(0.7, pelvis(0, -0.004), bend(3, 1, 0, -2), CHAMBER, FISTS, jaw(3), ANGRY, flames(0.3)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/** Strong ranged move (Flamethrower, Overheat): a deep breath, then a sustained stream from the beak. */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    // Settle before drawing breath.
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6), FISTS),
    // Deep breath: rise, chest out, beak to the sky, elbows back; embers gather at the beak.
    key(0.52, pelvis(0, 0.018), bend(-12, -10, -10, -16), ELBOWS_BACK, FISTS, SHUT, flames(0.6)),
    // Hold at the top, still swelling.
    key(0.66, pelvis(0, 0.022), bend(-13, -11, -11, -18, 0, 2), ELBOWS_BACK, FISTS, SHUT, flames(0.8)),
    // Blast: the head drives forward and down at the foe, beak wide; the body braces low.
    snap(0.78, pelvis(0, -0.038, 0.032), bend(14, 9, -4, -8), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    // Sustain: pushing into the stream, the head sweeping a little.
    key(1.0, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 5), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.22, pelvis(0, -0.037, 0.03), bend(13, 9, -4, -8, -4, -2), BRACED, FISTS, jaw(36), ANGRY, flames(1)),
    key(1.44, pelvis(0, -0.033, 0.024), bend(12, 8, -4, -6, 3, 1), BRACED, FISTS, jaw(34), ANGRY, flames(1)),
    key(1.62, pelvis(0, -0.035, 0.027), bend(12, 8, -4, -7), BRACED, FISTS, jaw(33), ANGRY, flames(0.9)),
    // Beak shuts, the head comes up and shakes off the heat.
    key(1.8, pelvis(0, -0.015), bend(4, 2, 0, -6, 7), CHAMBER, FISTS, jaw(4), ANGRY, flames(0.5)),
    key(1.94, pelvis(0, -0.008), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY, flames(0.3)),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/** Self-targeting status move (Bulk Up, Focus Energy): gather, then flex hard with a flame aura. */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.7,
  keys: [
    key(0),
    // Gather: curl in, arms crossed, eyes shut.
    key(0.3, pelvis(0, -0.05), bend(22, 6, 4, 16), CROSSED, FISTS, SHUT),
    key(0.42, pelvis(0, -0.056), bend(24, 7, 4, 18, 0, 1), CROSSED, FISTS, SHUT),
    // Flex: chest out, arms up, straining (moving hold with a tremor).
    snap(0.56, pelvis(0, -0.02), bend(-10, -8, -4, -12), FLEX, FISTS, ANGRY, flames(1)),
    key(0.68, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.8, pelvis(0, -0.02), bend(-10, -9, -4, -12, 0, -1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(0.92, pelvis(0, -0.024), bend(-11, -8, -4, -13, 0, 1.5), FLEX, FISTS, ANGRY, flames(1)),
    key(1.04, pelvis(0, -0.021), bend(-10, -9, -4, -12, 0, -1), FLEX, FISTS, ANGRY, flames(1)),
    // Relax: exhale, arms drop.
    key(1.28, pelvis(0, -0.02), bend(6, 2, 0, -2), CHAMBER, ANGRY, flames(0.4)),
    key(1.7, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/** Status move aimed at the foe (Growl, Leer, Screech): rear up, then lunge the head forward and roar. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.01), bend(-8, -6, -6, -12), ELBOWS_BACK, FISTS, ANGRY),
    snap(0.3, pelvis(0, -0.02, 0.025), bend(14, 8, 2, -6), ELBOWS_BACK, FISTS, jaw(32), ANGRY),
    key(0.5, pelvis(0, -0.02, 0.025), bend(14, 8, 2, -6, 7, 3), ELBOWS_BACK, FISTS, jaw(34), ANGRY),
    key(0.7, pelvis(0, -0.02, 0.022), bend(13, 8, 2, -6, -7, -3), ELBOWS_BACK, FISTS, jaw(32), ANGRY),
    key(0.88, pelvis(0, -0.01, 0.01), bend(6, 2, 0, -3), CHAMBER, jaw(8), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Sand-Attack: scoop the ground with the right foot and kick the sand at the foe. */
const statusTargetKick: Clip = {
  name: 'status_target_kick',
  duration: 1.35,
  keys: [
    key(0),
    // Weight onto the back leg, the front foot draws back along the ground.
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.04, -0.01), { bones: { spine: { x: 22, y: -8 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.92, -0.25] }, shinR: { dir: [-0.15, -0.8, -0.58] } } }),
    // Kick: the foot sweeps forward and up, flinging sand.
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.03, 0.01), { bones: { spine: { x: 6, y: 6 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.3, 0.93] }, shinR: { dir: [-0.12, -0.05, 0.99] } } }),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.03, 0.008), { bones: { spine: { x: 8, y: 4 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.25, -0.45, 0.86] }, shinR: { dir: [-0.12, -0.55, 0.83] } } }),
    key(0.7, pelvis(0, -0.04), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/** Both arms reaching out at chest height (grabbing). */
const REACH: Pose = {
  aim: {
    armR: { dir: [-0.18, -0.1, 0.98] },
    forearmR: { dir: [0.12, 0.02, 0.99] },
    armL: { dir: [0.18, -0.1, 0.98] },
    forearmL: { dir: [-0.12, 0.02, 0.99] },
  },
};

/** Arms locked around what it holds, low in front. */
const GRIP: Pose = {
  aim: {
    armR: { dir: [-0.28, -0.45, 0.85] },
    forearmR: { dir: [0.4, -0.12, 0.91] },
    armL: { dir: [0.28, -0.45, 0.85] },
    forearmL: { dir: [-0.4, -0.12, 0.91] },
  },
};

/** Holding it up in front, arms raised (overhead would carry the foe off the screen). */
const HEAVE: Pose = {
  aim: {
    armR: { dir: [-0.22, 0.45, 0.87] },
    forearmR: { dir: [0.18, 0.62, 0.76] },
    armL: { dir: [0.22, 0.45, 0.87] },
    forearmL: { dir: [-0.18, 0.62, 0.76] },
  },
};

/** Driving it down into the ground in front. */
const SLAM_DOWN: Pose = {
  aim: {
    armR: { dir: [-0.15, -0.5, 0.85] },
    forearmR: { dir: [0.12, -0.78, 0.62] },
    armL: { dir: [0.15, -0.5, 0.85] },
    forearmL: { dir: [-0.12, -0.78, 0.62] },
  },
};

/**
 * Seismic Toss (toss): rush in and seize the foe, sink with it, spring up
 * and back toward mid-field holding it high, spinning round with it in the
 * air, then hurl it back down into its own place (throw) and land; it
 * crashes there (impact), where both camera views see it. Hop home. The foe
 * rides in the grip from the grab to the throw (src/battle3d/director.ts);
 * hands trail the hips by ~0.07 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.3,
  keys: [
    key(0),
    // Wind up: crouch, elbows back.
    key(0.14, pelvis(0, -0.05), bend(20, 4, 0, -10), ELBOWS_BACK, ANGRY),
    // Rush in low, arms reaching.
    key(0.3, { advance: 0.65, root: { y: 0.06 } }, TUCK, bend(22, 4, 0, -12), REACH, ANGRY),
    // Seize: land at the foe, hands on it, then lock on low.
    key(0.4, { advance: 1 }, LAND, bend(18, 4, 0, -10), REACH, ANGRY),
    key(0.52, { advance: 1 }, pelvis(0, -0.07), bend(24, 6, 0, -12), GRIP, ANGRY, FISTS),
    // Load: sink deeper with it.
    key(0.64, { advance: 1 }, pelvis(0, -0.095), bend(20, 6, 0, -14), GRIP, ANGRY, FISTS, flames(0.6)),
    // Spring up and back, heaving the foe up in front.
    key(0.8, { advance: 0.86, root: { y: 0.22, yaw: 40 } }, HOP, pelvis(0, 0.02), bend(-10, -8, -4, -16), HEAVE, ANGRY, FISTS, flames(1)),
    // Spinning round with it at the top of the leap.
    key(0.96, { advance: 0.66, root: { y: 0.3, yaw: 210 } }, HOP, pelvis(0, 0.02), bend(-12, -8, -4, -18), HEAVE, ANGRY, FISTS, flames(1)),
    // Facing its place again, leaning back to hurl.
    key(1.08, { advance: 0.5, root: { y: 0.3, yaw: 360 } }, HOP, pelvis(0, 0.02), bend(-18, -10, -6, -20), HEAVE, ANGRY, FISTS, flames(1)),
    // The hurl: the body whips forward, arms driving down at the foe's place.
    snap(1.17, { advance: 0.4, root: { y: 0.2, yaw: 360 } }, HOP, pelvis(0, -0.01), bend(34, 16, 4, 4), SLAM_DOWN, ANGRY, flames(1)),
    // Land deep, arms still down; watch it crash.
    key(1.3, { advance: 0.32, root: { yaw: 360 } }, LAND, pelvis(0, -0.08), bend(30, 12, 2, 2), SLAM_DOWN, ANGRY, flames(0.9)),
    key(1.52, { advance: 0.32, root: { yaw: 360 } }, pelvis(0, -0.06), bend(22, 8, 2, -2), SLAM_DOWN, ANGRY, flames(0.7)),
    // Straighten, then hop home.
    key(1.7, { advance: 0.32, root: { yaw: 360 } }, pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY, flames(0.5)),
    key(1.86, { advance: 0.15, root: { y: 0.06, yaw: 360 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY, flames(0.3)),
    key(2.0, { advance: 0, root: { yaw: 360 } }, LAND, GUARD, ANGRY, flames(0.1)),
    key(2.3, { root: { yaw: 360 } }, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.47, name: 'grab' }, { t: 1.2, name: 'throw' }, { t: 1.42, name: 'impact' }],
};

/** Claws driven down into the ground in front (digging). */
const DIG_ARMS: Pose = {
  aim: {
    armR: { dir: [-0.22, -0.84, 0.5] },
    forearmR: { dir: [0.05, -0.95, 0.3] },
    armL: { dir: [0.22, -0.84, 0.5] },
    forearmL: { dir: [-0.05, -0.95, 0.3] },
  },
};

/** A rising knee: right knee driven up, left leg trailing, arms swept back. */
const RISING_KNEE: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.15, 0.35, 0.92] }, shinR: { dir: [-0.1, -0.88, 0.45] },
    thighL: { dir: [0.25, -0.92, -0.3] }, shinL: { dir: [0.12, -0.6, -0.79] },
    armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] },
  },
};

/**
 * Dig (burrow): crouch and drive the claws into the ground, sink out of
 * sight (dig), tunnel over to the foe, then burst up out of the ground under
 * it with a rising knee (impact as the knee breaks the surface), come down
 * in front of it and hop home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.2,
  keys: [
    key(0),
    // Crouch, eyes on the ground.
    key(0.12, pelvis(0, -0.06), bend(28, 6, 0, 18), CHAMBER, FISTS, ANGRY),
    // Claws into the ground: the dirt flies (dig) and it sinks, gathering speed.
    key(0.22, { root: { y: -0.1 } }, pelvis(0, -0.09), bend(42, 8, 2, 24), DIG_ARMS, ANGRY),
    key(0.48, { root: { y: -1.3 } }, pelvis(0, -0.09), bend(42, 8, 2, 24), DIG_ARMS, ANGRY),
    // Underground (nothing to stand on): tunnel over to the foe.
    key(0.62, { advance: 0.2, plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.09), bend(40, 8, 2, 20), DIG_ARMS, ANGRY),
    key(0.84, { advance: 1, plantFeet: 0, root: { y: -1.25 } }, pelvis(0, -0.1), bend(26, 6, 0, -10), CHAMBER, FISTS, ANGRY),
    // Burst up under the foe, knee first.
    snap(1.0, { advance: 1, root: { y: 0.3 } }, pelvis(0, 0.02), bend(-8, -6, -4, -16), RISING_KNEE, ANGRY, flames(1)),
    key(1.14, { advance: 0.92, root: { y: 0.38 } }, pelvis(0, 0.02), bend(-10, -6, -4, -18), RISING_KNEE, ANGRY, flames(1)),
    // Come down in front of it and hold the crouch.
    fall(1.3, { advance: 0.8 }, LAND, pelvis(0, -0.06), bend(20, 4, 0, -6), GUARD, ANGRY, flames(0.7)),
    key(1.64, { advance: 0.8 }, pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY, flames(0.5)),
    // Hop home.
    key(1.8, { advance: 0.38, root: { y: 0.07 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY, flames(0.3)),
    key(1.94, { advance: 0 }, LAND, GUARD, ANGRY, flames(0.1)),
    key(2.2, flames(0), OPEN_EYES),
  ],
  events: [{ t: 0.21, name: 'dig' }, { t: 0.93, name: 'impact' }],
};

/**
 * Mud-Slap (fling): weight back, the right foot scoops the ground and flicks
 * a clod of mud at the foe (release from the foot: legs have no overlap).
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.15,
  keys: [
    key(0),
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.02, -0.045, -0.012), { bones: { spine: { x: 24, y: -10 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.9, -0.3] }, shinR: { dir: [-0.15, -0.78, -0.61] } } }),
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.015, -0.03, 0.012), { bones: { spine: { x: 4, y: 8 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.25, 0.94] }, shinR: { dir: [-0.12, 0.02, 0.99] } } }),
    key(0.44, { plantLeft: 1, plantRight: 0 }, pelvis(0.012, -0.03, 0.01), { bones: { spine: { x: 2, y: 9 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.28, 0.93] }, shinR: { dir: [-0.12, -0.12, 0.98] } } }),
    key(0.64, pelvis(0, -0.04), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }],
};

/**
 * Double Team, Agility (afterimage): dart from side to side faster than the
 * eye (quick hops, root.x), guard up; the afterimages start at the aura and
 * run 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.75,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.05), bend(14, 2, 0, -4), GUARD, ANGRY),
    key(0.2, { root: { x: 0.24, y: 0.05 } }, HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.3, { root: { x: 0.3 } }, LAND, GUARD, ANGRY),
    key(0.42, { root: { x: -0.05, y: 0.06 } }, HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.52, { root: { x: -0.3 } }, LAND, GUARD, ANGRY),
    key(0.64, { root: { x: 0.02, y: 0.06 } }, HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.74, { root: { x: 0.26 } }, LAND, GUARD, ANGRY),
    key(0.86, { root: { x: -0.02, y: 0.05 } }, HOP, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.96, { root: { x: -0.24 } }, LAND, GUARD, ANGRY),
    key(1.1, { root: { x: -0.06, y: 0.04 } }, HOP, bend(6, 0, 0, -2), GUARD, ANGRY),
    key(1.22, { root: { x: 0 } }, LAND, GUARD, ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/** Taking a hit: snap back and wince (the battler adds a sprung recoil), then shake it off. */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, bend(-14, -6, -4, -18), HURT,
      { aim: { armR: { dir: [-0.75, -0.3, 0.58] }, forearmR: { dir: [-0.3, 0.2, 0.93] }, armL: { dir: [0.75, -0.45, -0.48] }, forearmL: { dir: [0.4, 0.1, 0.9] } } }),
    key(0.2, bend(-6, -2, -2, -8), HURT),
    key(0.36, bend(4, 1, 0, 4), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/** Fainting: reels, sways forward, knees buckle, slumps, then sinks into the ground. */
const faint: Clip = {
  name: 'faint',
  duration: 1.8,
  keys: [
    key(0),
    snap(0.12, { root: { z: -0.04 } }, bend(-14, -6, -4, -24), HURT,
      { aim: { armR: { dir: [-0.8, -0.3, 0.5] }, armL: { dir: [0.8, -0.35, -0.48] } } }),
    key(0.4, pelvis(0, -0.04), { root: { z: -0.02 } }, bend(10, 4, 4, 16), LIMP_ARMS, SHUT),
    key(0.72, pelvis(0, -0.2), { root: { z: -0.02 } }, bend(30, 8, 6, 26), LIMP_ARMS, SHUT),
    fall(0.9, pelvis(0, -0.275), { root: { z: -0.02 } }, bend(42, 10, 6, 32), LIMP_ARMS, SHUT),
    key(1.0, pelvis(0, -0.255), { root: { z: -0.02 } }, bend(40, 10, 6, 30), LIMP_ARMS, SHUT),
    key(1.12, pelvis(0, -0.27), { root: { z: -0.02 } }, bend(42, 10, 6, 32), LIMP_ARMS, SHUT),
    fall(1.8, pelvis(0, -0.27), { root: { y: -1.1, z: -0.02 } }, bend(42, 10, 6, 32), LIMP_ARMS, SHUT),
  ],
  events: [{ t: 0.9, name: 'thud' }],
};

export const BLAZIKEN_CLIPS: Record<string, Clip> = Object.fromEntries(
  [idle, intro, physicalWeak, physicalWeakKick, physicalStrong, punch, tackle, peck, toss, burrow, fling, afterimage, specialWeak, specialStrong, statusSelf, statusTarget, statusTargetKick, hit, faint].map((c) => [c.name, c]),
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
