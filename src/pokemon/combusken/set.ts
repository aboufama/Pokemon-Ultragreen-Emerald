// Combusken's battle animation set: Blaziken's first clips
// (../blaziken/first.ts, as the user first saw and approved them) and the
// clips added since in their style (../blaziken/more.ts), ported to
// Combusken: the same keys, timing, arcs and body action, re-posed on its
// own stance, rig and proportions.
//
// What the port changes, and why:
//   - its legs are half as long as Blaziken's for its height (hip to ankle
//     0.22 of its height against 0.44) and its stance already bends them
//     further, so the pelvis offsets are about 0.6 of Blaziken's: the same
//     knee bend, not a deeper one;
//   - it is lighter (19.5 kg against 52): the same tempo (its speed is below
//     Blaziken's), a little more spring in the leaps and hops;
//   - its arms are long and end in one big clawed hand (no fingers, no wrist
//     flames): the hands are never aimed, they carry on the forearm's line,
//     so every arm pose below is Blaziken's re-posed for the longer reach;
//   - the engine brings each blow onto the foe's body (the pose at the
//     impact, swept toward the foe until the bodies touch), so the strikes
//     are posed as they should look, the limb or beak that lands leading.
//
// Channels:
//   advance  0..1   how far toward the target a contact move has travelled
//   root     model-unit offset/rotation of the whole body (jumps, spins)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (COMBUSKEN_EXPRESSIONS)
// Events: impact (contact lands), grab / throw (a toss), dig (goes under),
// release (projectile/stream starts), releaseEnd, charge, cry, aura, emit,
// shrink.
//
// The animator adds the rest: overlapping action (head, arms and hands trail
// the body by a few frames, so events that depend on them are placed a
// little after their key), breathing, blinks, and springs on the crest, the
// tail feathers and the feathers round its waist (see index.ts).

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
const DROWSY: Pose = { expression: 'half' };
const HURT: Pose = { expression: 'hurt' };
const HAPPY: Pose = { expression: 'happy' };
const OPEN_EYES: Pose = { expression: 'open' };
/** The lower beak (+ opens it). */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/** Spine chain pitch (x) from hips to head, with optional head turn/tilt. */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, neck: { x: neck }, head: { x: head, y: headY, z: headZ } },
});

/**
 * Guard: both clawed hands up, claws up. Its hands are big: held before the
 * chest as Blaziken's fists are, they covered its face, so the elbows go out
 * and the claws flank the head.
 */
const GUARD: Pose = {
  aim: {
    armR: { dir: [-0.55, -0.5, 0.67] },
    forearmR: { dir: [-0.3, 0.82, 0.48] },
    armL: { dir: [0.55, -0.52, 0.66] },
    forearmL: { dir: [0.3, 0.82, 0.48] },
  },
};

/**
 * Arms flung wide at the shoulders, forearms raised: the battle cry. Wide
 * rather than overhead, so from the back our Combusken's claws stay under
 * the foe's healthbox (tools/gauntlet/uiclear.mjs).
 */
const ARMS_SPREAD_UP: Pose = {
  aim: {
    armR: { dir: [-0.93, 0.1, 0.35] },
    forearmR: { dir: [-0.72, 0.58, 0.38] },
    armL: { dir: [0.93, 0.1, 0.35] },
    forearmL: { dir: [0.72, 0.58, 0.38] },
  },
};

/** Both clawed hands chambered at the hips, elbows back. */
const CHAMBER: Pose = {
  aim: {
    armR: { dir: [-0.5, -0.66, -0.56] },
    forearmR: { dir: [-0.2, -0.28, 0.94] },
    armL: { dir: [0.5, -0.66, -0.56] },
    forearmL: { dir: [0.2, -0.28, 0.94] },
  },
};

/** Drawing breath: elbows pulled back and up, chest open. */
const ELBOWS_BACK: Pose = {
  aim: {
    armR: { dir: [-0.55, -0.42, -0.72] },
    forearmR: { dir: [-0.25, 0.05, 0.97] },
    armL: { dir: [0.55, -0.42, -0.72] },
    forearmL: { dir: [0.25, 0.05, 0.97] },
  },
};

/** Braced for a blast: arms low at the sides, the claws by the thighs. */
const BRACED: Pose = {
  // Out at the sides at hip height: held down by the thighs as Blaziken's
  // fists are, its long hands hung past its knees, and from the foe's side
  // the claws reached down onto our healthbox (tools/gauntlet/uiclear.mjs).
  aim: {
    armR: { dir: [-0.6, -0.72, -0.34] },
    forearmR: { dir: [-0.62, -0.28, 0.73] },
    armL: { dir: [0.6, -0.72, -0.34] },
    forearmL: { dir: [0.62, -0.28, 0.73] },
  },
};

/** Arms crossed low in front (gathering power). */
const CROSSED: Pose = {
  aim: {
    armR: { dir: [-0.22, -0.78, 0.59] },
    forearmR: { dir: [0.72, -0.22, 0.66] },
    armL: { dir: [0.22, -0.78, 0.59] },
    forearmL: { dir: [-0.72, -0.16, 0.68] },
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

/** Arms swept back for balance while the head leads (dashes, beak jabs). */
const ARMS_BACK: Pose = {
  aim: { armR: { dir: [-0.35, -0.5, -0.8] }, forearmR: { dir: [-0.25, -0.3, -0.92] }, armL: { dir: [0.35, -0.5, -0.8] }, forearmL: { dir: [0.25, -0.3, -0.92] } },
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
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.027 }, bones: { spine: { x: 8 }, head: { x: -6 } } };

// Clips -----------------------------------------------------------------------

const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.004), { bones: { spine: { x: 1.5 }, head: { x: -1 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }),
    key(2.4),
  ],
};

/** Sent out: bursts out of a crouch into a battle cry, arms flung wide (cf. BACK_ANIM_CONCAVE_ARC_LARGE). */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.03), bend(16, 4, 0, 18), CROSSED, SHUT),
    key(0.2, pelvis(0, -0.045), bend(22, 6, 2, 22), CROSSED, SHUT),
    snap(0.42, pelvis(0, 0.01), bend(-14, -8, -6, -22), ARMS_SPREAD_UP, jaw(30), ANGRY),
    key(0.62, pelvis(0, 0.007), bend(-13, -8, -6, -20, 0, 4), ARMS_SPREAD_UP, jaw(26), ANGRY),
    key(0.8, pelvis(0, 0.008), bend(-14, -8, -6, -21, 0, -4), ARMS_SPREAD_UP, jaw(28), ANGRY),
    key(0.98, pelvis(0, 0.006), bend(-11, -6, -4, -16), ARMS_SPREAD_UP, jaw(8), ANGRY),
    key(1.2, pelvis(0, -0.007), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/** Weak contact move (Scratch, Slash, Brick Break...): leap in, claw slash, hop back. */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: crouch, right shoulder back, claw cocked behind the head.
    key(0.13, pelvis(0, -0.021), { bones: { spine: { x: 14, y: -16 }, head: { x: -8, y: 10 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.55, -0.67] }, forearmR: { dir: [-0.15, 0.95, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Leap along an arc, legs tucked.
    key(0.27, { advance: 0.55 }, { root: { y: 0.082 } }, TUCK, { bones: { spine: { x: 10, y: -18 }, head: { x: -8, y: 12 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.6, -0.62] }, forearmR: { dir: [-0.1, 0.96, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Land in front of the foe, knees taking the weight.
    key(0.38, { advance: 1 }, LAND, { bones: { spine: { x: 16, y: -18 }, head: { x: -8, y: 12 } } }, ANGRY,
      { aim: { armR: { dir: [-0.5, 0.55, -0.67] }, forearmR: { dir: [-0.15, 0.95, 0.25] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Slash down and across: the torso unwinds, the claw leads.
    snap(0.46, { advance: 1 }, pelvis(0.006, -0.021), { bones: { spine: { x: 20, y: 22, z: -6 }, chest: { y: 8 }, head: { x: -6, y: -8 } } }, ANGRY,
      { aim: { armR: { dir: [0.35, -0.4, 0.85] }, forearmR: { dir: [0.6, -0.55, 0.58] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } } }),
    // Follow-through: the claw carries on down and to the side, then hangs there.
    key(0.64, { advance: 1 }, pelvis(0.007, -0.018), { bones: { spine: { x: 21, y: 26, z: -7 }, chest: { y: 9 }, head: { x: -6, y: -9 } } }, ANGRY,
      { aim: { armR: { dir: [0.5, -0.62, 0.6] }, forearmR: { dir: [0.62, -0.72, 0.3] }, armL: { dir: [0.5, -0.62, -0.6] }, forearmL: { dir: [0.2, -0.2, 0.96] } } }),
    key(0.8, { advance: 1 }, pelvis(0, -0.021), { bones: { spine: { x: 14, y: 8 } } }, GUARD, ANGRY),
    // Hop back home.
    key(0.96, { advance: 0.45 }, { root: { y: 0.066 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.08, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
};

/**
 * Punches (Sky Uppercut, Fire Punch, Mega Punch...): dash in low, coil with
 * the claw-fist at the hip, then drive up through the foe with the whole
 * body — the feet leave the ground — and drop back into a crouch.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.6,
  keys: [
    key(0),
    // Wind down: deep crouch, right fist chambered low, eyes on the foe.
    key(0.14, pelvis(0, -0.042), bend(24, 6, -6, -14), ANGRY,
      { aim: { armR: { dir: [-0.45, -0.75, -0.48] }, forearmR: { dir: [-0.15, -0.35, 0.92] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Dash in low along a shallow arc.
    key(0.3, { advance: 0.7 }, { root: { y: 0.044 } }, TUCK, bend(26, 6, -6, -14), ANGRY,
      { aim: { armR: { dir: [-0.45, -0.75, -0.48] }, forearmR: { dir: [-0.15, -0.35, 0.92] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // Plant under the foe, coiled.
    key(0.42, { advance: 1 }, LAND, pelvis(0, -0.018), bend(26, 8, -6, -16), ANGRY,
      { aim: { armR: { dir: [-0.5, -0.8, -0.33] }, forearmR: { dir: [-0.15, -0.2, 0.97] }, armL: { dir: [0.35, -0.6, 0.7] }, forearmL: { dir: [-0.2, 0.7, 0.68] } } }),
    // The uppercut: everything extends upward, the fist leads, feet leave the ground.
    snap(0.52, { advance: 1 }, { plantFeet: 0, root: { y: 0.13 } }, pelvis(0, 0.012), bend(-14, -8, -6, -20), ANGRY,
      { aim: { armR: { dir: [-0.15, 0.93, 0.33] }, forearmR: { dir: [-0.08, 0.99, 0.1] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] },
        thighR: { dir: [-0.3, -0.92, 0.2] }, shinR: { dir: [-0.2, -0.97, -0.1] }, thighL: { dir: [0.3, -0.85, -0.4] }, shinL: { dir: [0.15, -0.8, -0.58] } } }),
    // Apex: stretched tall, the fist high.
    key(0.7, { advance: 1 }, { plantFeet: 0, root: { y: 0.2 } }, pelvis(0, 0.012), bend(-16, -9, -6, -22), ANGRY,
      { aim: { armR: { dir: [-0.1, 0.97, 0.2] }, forearmR: { dir: [-0.05, 0.99, 0.05] }, armL: { dir: [0.45, -0.7, -0.55] }, forearmL: { dir: [0.2, -0.3, 0.93] },
        thighR: { dir: [-0.3, -0.92, 0.2] }, shinR: { dir: [-0.2, -0.97, -0.1] }, thighL: { dir: [0.3, -0.85, -0.4] }, shinL: { dir: [0.15, -0.8, -0.58] } } }),
    // Drop back into a crouch.
    fall(0.9, { advance: 1 }, LAND, pelvis(0, -0.018), bend(20, 4, 0, -8), GUARD, ANGRY),
    key(1.05, { advance: 1 }, pelvis(0, -0.012), bend(12, 2, 0, -4), GUARD, ANGRY),
    // Hop home.
    key(1.2, { advance: 0.45 }, { root: { y: 0.066 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.34, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/** Tackles (Quick Attack, Take Down, Return...): a blur of a dash, shoulder first, and a bounce back. */
const tackle: Clip = {
  name: 'tackle',
  duration: 1.15,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03), { bones: { spine: { x: 26, y: -14 }, head: { x: -12, y: 10 } } }, ANGRY,
      { aim: { armR: { dir: [-0.4, -0.7, -0.6] }, forearmR: { dir: [-0.2, -0.4, 0.9] }, armL: { dir: [0.4, -0.7, -0.6] }, forearmL: { dir: [0.2, -0.4, 0.9] } } }),
    // The dash: low and fast, the right shoulder leading, arms swept back.
    key(0.2, { advance: 0.75 }, { root: { y: 0.033 } }, TUCK, { bones: { spine: { x: 34, y: -22 }, head: { x: -16, y: 14 } } }, ANGRY, ARMS_BACK),
    snap(0.25, { advance: 1 }, LAND, { bones: { spine: { x: 30, y: -24 }, head: { x: -14, y: 14 } } }, ANGRY, ARMS_BACK),
    // Bounce off the foe.
    key(0.4, { advance: 0.75 }, { root: { y: 0.066 } }, HOP, { bones: { spine: { x: 6, y: -6 } } }, GUARD, ANGRY),
    key(0.55, { advance: 0.4 }, { root: { y: 0.044 } }, HOP, GUARD, ANGRY),
    key(0.7, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.25, name: 'impact' }],
};

/**
 * Peck: the beak is the weapon. The head cocks back, it leaps in, then the
 * body and head drive the beak down into the foe with the arms swept back;
 * the head rebounds and it hops home.
 */
const peck: Clip = {
  name: 'peck',
  duration: 1.25,
  keys: [
    key(0),
    // Cock the head back, beak up, weight settling.
    key(0.12, pelvis(0, -0.018), bend(-4, -6, -14, -20), GUARD, ANGRY),
    // Leap in along an arc, head still drawn back.
    key(0.26, { advance: 0.6 }, { root: { y: 0.077 } }, TUCK, bend(4, -4, -14, -20), GUARD, ANGRY),
    // Land in front of the foe and coil: the head goes further back, the arms sweep back for balance.
    key(0.36, { advance: 1 }, LAND, bend(0, -8, -18, -24), ARMS_BACK, ANGRY),
    // The jab: spine, neck and head all pitch forward, the beak leads.
    snap(0.44, { advance: 1 }, pelvis(0, -0.024), bend(22, 12, 18, 18), ARMS_BACK, ANGRY),
    // Rebound: the head springs back up off the hit.
    key(0.6, { advance: 1 }, pelvis(0, -0.021), bend(14, 6, 2, -2), ARMS_BACK, ANGRY),
    key(0.78, { advance: 1 }, pelvis(0, -0.018), bend(10, 2, 0, 0), GUARD, ANGRY),
    // Hop home.
    key(0.94, { advance: 0.45 }, { root: { y: 0.066 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.06, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.25, OPEN_EYES),
  ],
  // The head trails the spine a little (overlap), so the beak lands just after the key.
  events: [{ t: 0.49, name: 'impact' }],
};

/**
 * Double Kick (kick): leap in, two alternating snap kicks, hop back. Its
 * legs are half as long as Blaziken's for its height, and kicks at the
 * foe's hips hid between the two bodies: each knee comes up high and the
 * talons snap out at the foe's chest, the body leaning further back.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.7,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.024), { bones: { spine: { x: 22 } } }, GUARD, ANGRY),
    key(0.28, { advance: 0.55 }, { root: { y: 0.077 } }, TUCK, { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    key(0.4, { advance: 1 }, LAND, GUARD, ANGRY),
    // Right snap kick: the knee comes up high, the standing leg stays planted, the body leans back.
    key(0.46, { advance: 1 }, { plantLeft: 1, plantRight: 0 }, pelvis(0.007, -0.015), { bones: { spine: { x: -4 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.2, 0.3, 0.93] }, shinR: { dir: [-0.1, -0.75, 0.65] } } }),
    snap(0.53, { advance: 1 }, { plantLeft: 1, plantRight: 0 }, pelvis(0.009, -0.01), { bones: { spine: { x: -18 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.15, 0.38, 0.91] }, shinR: { dir: [-0.1, 0.32, 0.94] } } }),
    // The kick hangs a moment in the foe, then the knee draws back in.
    key(0.58, { advance: 1 }, { plantLeft: 1, plantRight: 0 }, pelvis(0.009, -0.011), { bones: { spine: { x: -16 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.16, 0.36, 0.92] }, shinR: { dir: [-0.1, 0.22, 0.97] } } }),
    key(0.65, { advance: 1 }, { plantLeft: 1, plantRight: 0 }, pelvis(0.007, -0.013), { bones: { spine: { x: -6 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.2, 0.22, 0.95] }, shinR: { dir: [-0.12, -0.8, 0.58] } } }),
    key(0.73, { advance: 1 }, pelvis(0, -0.024), { bones: { spine: { x: 12 } } }, GUARD, ANGRY),
    // Left kick: hips turn into it.
    snap(0.82, { advance: 1 }, { plantLeft: 0, plantRight: 1, root: { yaw: -22 } }, pelvis(-0.009, -0.01), { bones: { spine: { x: -18 } } }, GUARD, ANGRY,
      { aim: { thighL: { dir: [0.15, 0.38, 0.91] }, shinL: { dir: [0.1, 0.34, 0.93] } } }),
    key(0.93, { advance: 1 }, { plantLeft: 0, plantRight: 1, root: { yaw: -14 } }, pelvis(-0.007, -0.013), { bones: { spine: { x: -6 } } }, GUARD, ANGRY,
      { aim: { thighL: { dir: [0.22, 0.2, 0.95] }, shinL: { dir: [0.12, -0.8, 0.58] } } }),
    key(1.03, { advance: 1 }, LAND, GUARD, ANGRY),
    key(1.2, { advance: 0.45 }, { root: { y: 0.066 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.33, { advance: 0 }, LAND, GUARD, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }, { t: 0.83, name: 'impact' }],
};

/** Strong contact move (Mega Kick: Blaziken's Blaze Kick): deep crouch, leap, spinning kick, land. */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.1,
  keys: [
    key(0),
    // Coil: deep crouch, turned away from the foe.
    key(0.3, pelvis(0, -0.06), { root: { yaw: -25 } }, { bones: { spine: { x: 26 }, head: { x: -14, y: 18 } } }, GUARD, ANGRY),
    // Spring up and in.
    key(0.5, { advance: 0.5 }, { root: { y: 0.22, yaw: -8 } }, TUCK, { bones: { spine: { x: 6 }, head: { x: -8, y: 10 } } }, GUARD, ANGRY),
    // Chamber the kick at the top of the arc, already turning.
    key(0.64, { advance: 0.85 }, { plantFeet: 0, root: { y: 0.25, yaw: 55 } }, { bones: { spine: { x: -6, z: -8 }, head: { y: -40 } } }, ANGRY,
      { aim: { thighR: { dir: [-0.8, 0.1, 0.6] }, shinR: { dir: [0.1, -0.6, 0.8] }, thighL: { dir: [0.3, -0.85, -0.42] }, shinL: { dir: [0.1, -0.5, -0.86] },
        armR: { dir: [-0.2, -0.3, 0.93] }, forearmR: { dir: [0.4, 0.5, 0.77] }, armL: { dir: [0.9, 0.1, 0.4] }, forearmL: { dir: [0.6, 0.6, 0.5] } } }),
    // The kick lands side-on, leg fully extended at the foe.
    snap(0.76, { advance: 1 }, { plantFeet: 0, root: { y: 0.19, yaw: 100 } }, { bones: { spine: { x: -8, z: -18 }, head: { x: 4, y: -70 } } }, ANGRY,
      { aim: { thighR: { dir: [-0.97, 0.22, 0.1] }, shinR: { dir: [-0.97, 0.24, 0.05] }, thighL: { dir: [0.35, -0.85, -0.38] }, shinL: { dir: [0.15, -0.6, -0.78] },
        armR: { dir: [-0.3, -0.5, -0.8] }, forearmR: { dir: [0.3, -0.2, -0.93] }, armL: { dir: [0.95, 0.2, 0.2] }, forearmL: { dir: [0.75, 0.6, 0.25] } } }),
    // Follow-through: the spin carries on round.
    key(0.94, { advance: 1 }, { plantFeet: 0, root: { y: 0.11, yaw: 230 } }, TUCK, { bones: { spine: { x: 6, z: -6 }, head: { y: -30 } } }, GUARD, ANGRY),
    // Land facing the foe again, deep in the knees.
    key(1.12, { advance: 1 }, { root: { yaw: 360 } }, LAND, pelvis(0, -0.036), { bones: { spine: { x: 22 } } }, GUARD, ANGRY),
    key(1.34, { advance: 1 }, { root: { yaw: 360 } }, pelvis(0, -0.018), { bones: { spine: { x: 10 } } }, GUARD, ANGRY),
    // Hop back.
    key(1.52, { advance: 0.45 }, { root: { y: 0.077, yaw: 360 } }, HOP, { bones: { spine: { x: 8 } } }, GUARD, ANGRY),
    key(1.68, { advance: 0 }, { root: { yaw: 360 } }, LAND, GUARD, ANGRY),
    key(2.1, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/** Weak ranged move (Ember, Fire Blast; Toxic, Hidden Power): a quick breath, then the head snaps forward and spits. */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.2,
  keys: [
    key(0),
    // Draw breath: chest up, head tipped back, elbows back.
    key(0.24, pelvis(0, 0.007), bend(-8, -8, -8, -14), ELBOWS_BACK, ANGRY),
    // Spit: the head drives forward at the foe, beak wide; the body leans in.
    snap(0.34, pelvis(0, -0.01, 0.021), bend(15, 9, -4, -8), CHAMBER, jaw(30), ANGRY),
    // Recoil: the head bobs back up as the beak closes.
    key(0.5, pelvis(0, -0.006, 0.01), bend(9, 4, -3, -11), CHAMBER, jaw(16), ANGRY),
    key(0.7, pelvis(0, -0.002), bend(3, 1, 0, -2), CHAMBER, jaw(3), ANGRY),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'release' }],
};

/** Strong ranged move (Flamethrower, Fire Spin): a deep breath, then a sustained stream from the beak. */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    // Settle before drawing breath.
    key(0.14, pelvis(0, -0.012), bend(4, 0, 0, 6)),
    // Deep breath: rise, chest out, beak to the sky, elbows back; embers gather at the beak.
    key(0.52, pelvis(0, 0.011), bend(-12, -10, -10, -16), ELBOWS_BACK, SHUT),
    // Hold at the top, still swelling.
    key(0.66, pelvis(0, 0.013), bend(-13, -11, -11, -18, 0, 2), ELBOWS_BACK, SHUT),
    // Blast: the head drives forward and down at the foe, beak wide; the body
    // braces low, leaning in with the spine (the hips shifted forward carry
    // the planted feet with them, toward our healthbox from the foe's side).
    snap(0.78, pelvis(0, -0.018), bend(18, 10, -4, -11), BRACED, jaw(32), ANGRY),
    // Sustain: pushing into the stream, the head sweeping a little.
    key(1.0, pelvis(0, -0.016), bend(16, 9, -4, -9, 5), BRACED, jaw(30), ANGRY),
    key(1.22, pelvis(0, -0.018), bend(17, 10, -4, -11, -4, -2), BRACED, jaw(32), ANGRY),
    key(1.44, pelvis(0, -0.016), bend(16, 9, -4, -9, 3, 1), BRACED, jaw(30), ANGRY),
    key(1.62, pelvis(0, -0.017), bend(16, 9, -4, -10), BRACED, jaw(29), ANGRY),
    // Beak shuts, the head comes up and shakes off the heat.
    key(1.8, pelvis(0, -0.009), bend(4, 2, 0, -6, 7), CHAMBER, jaw(4), ANGRY),
    key(1.94, pelvis(0, -0.005), bend(2, 1, 0, -3, -6), CHAMBER, ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.84, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/** Self-targeting status move (Bulk Up, Focus Energy, Swords Dance...): gather, then flex hard with an aura. */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.7,
  keys: [
    key(0),
    // Gather: curl in, arms crossed, eyes shut.
    key(0.3, pelvis(0, -0.03), bend(22, 6, 4, 16), CROSSED, SHUT),
    key(0.42, pelvis(0, -0.034), bend(24, 7, 4, 18, 0, 1), CROSSED, SHUT),
    // Flex: chest out, arms up, straining (moving hold with a tremor).
    snap(0.56, pelvis(0, -0.012), bend(-10, -8, -4, -12), FLEX, ANGRY),
    key(0.68, pelvis(0, -0.014), bend(-11, -8, -4, -13, 0, 1.5), FLEX, ANGRY),
    key(0.8, pelvis(0, -0.012), bend(-10, -9, -4, -12, 0, -1.5), FLEX, ANGRY),
    key(0.92, pelvis(0, -0.014), bend(-11, -8, -4, -13, 0, 1.5), FLEX, ANGRY),
    key(1.04, pelvis(0, -0.013), bend(-10, -9, -4, -12, 0, -1), FLEX, ANGRY),
    // Relax: exhale, arms drop.
    key(1.28, pelvis(0, -0.012), bend(6, 2, 0, -2), CHAMBER, ANGRY),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/** Status move aimed at the foe (Growl; Mimic, Snore): rear up, then lunge the head forward and cry. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.006), bend(-8, -6, -6, -12), ELBOWS_BACK, ANGRY),
    snap(0.3, pelvis(0, -0.012, 0.018), bend(14, 8, 2, -6), ELBOWS_BACK, jaw(30), ANGRY),
    key(0.5, pelvis(0, -0.012, 0.018), bend(14, 8, 2, -6, 7, 3), ELBOWS_BACK, jaw(32), ANGRY),
    key(0.7, pelvis(0, -0.012, 0.015), bend(13, 8, 2, -6, -7, -3), ELBOWS_BACK, jaw(30), ANGRY),
    key(0.88, pelvis(0, -0.006, 0.007), bend(6, 2, 0, -3), CHAMBER, jaw(8), ANGRY),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

/** Sand-Attack (kick_sand): scoop the ground with the right foot and kick the sand at the foe. */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.35,
  keys: [
    key(0),
    // Weight onto the back leg, the front foot draws back along the ground.
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.012, -0.024, -0.007), { bones: { spine: { x: 22, y: -8 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.92, -0.25] }, shinR: { dir: [-0.15, -0.8, -0.58] } } }),
    // Kick: the foot sweeps forward and up, flinging sand.
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.009, -0.018, 0.007), { bones: { spine: { x: 6, y: 6 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.3, 0.93] }, shinR: { dir: [-0.12, -0.05, 0.99] } } }),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.007, -0.018, 0.006), { bones: { spine: { x: 8, y: 4 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.25, -0.45, 0.86] }, shinR: { dir: [-0.12, -0.55, 0.83] } } }),
    key(0.7, pelvis(0, -0.024), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'emit' }],
};

/** Both arms reaching out at chest height (grabbing). */
const REACH: Pose = {
  aim: {
    armR: { dir: [-0.2, -0.12, 0.97] },
    forearmR: { dir: [0.14, 0.0, 0.99] },
    armL: { dir: [0.2, -0.12, 0.97] },
    forearmL: { dir: [-0.14, 0.0, 0.99] },
  },
};

/** Arms locked around what it holds, low in front. */
const GRIP: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.48, 0.82] },
    forearmR: { dir: [0.45, -0.12, 0.88] },
    armL: { dir: [0.3, -0.48, 0.82] },
    forearmL: { dir: [-0.45, -0.12, 0.88] },
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
    key(0.14, pelvis(0, -0.03), bend(20, 4, 0, -10), ELBOWS_BACK, ANGRY),
    // Rush in low, arms reaching.
    key(0.3, { advance: 0.65 }, { root: { y: 0.066 } }, TUCK, bend(22, 4, 0, -12), REACH, ANGRY),
    // Seize: land at the foe, hands on it, then lock on low.
    key(0.4, { advance: 1 }, LAND, bend(18, 4, 0, -10), REACH, ANGRY),
    key(0.52, { advance: 1 }, pelvis(0, -0.042), bend(24, 6, 0, -12), GRIP, ANGRY),
    // Load: sink deeper with it.
    key(0.64, { advance: 1 }, pelvis(0, -0.057), bend(20, 6, 0, -14), GRIP, ANGRY),
    // Spring up and back, heaving the foe up in front.
    key(0.8, { advance: 0.86 }, { root: { y: 0.24, yaw: 40 } }, HOP, pelvis(0, 0.012), bend(-10, -8, -4, -16), HEAVE, ANGRY),
    // Spinning round with it at the top of the leap.
    key(0.96, { advance: 0.66 }, { root: { y: 0.33, yaw: 210 } }, HOP, pelvis(0, 0.012), bend(-12, -8, -4, -18), HEAVE, ANGRY),
    // Facing its place again, leaning back to hurl.
    key(1.08, { advance: 0.5 }, { root: { y: 0.33, yaw: 360 } }, HOP, pelvis(0, 0.012), bend(-18, -10, -6, -20), HEAVE, ANGRY),
    // The hurl: the body whips forward, arms driving down at the foe's place.
    snap(1.17, { advance: 0.4 }, { root: { y: 0.22, yaw: 360 } }, HOP, pelvis(0, -0.006), bend(34, 16, 4, 4), SLAM_DOWN, ANGRY),
    // Land deep, arms still down; watch it crash.
    key(1.3, { advance: 0.32 }, { root: { yaw: 360 } }, LAND, pelvis(0, -0.048), bend(30, 12, 2, 2), SLAM_DOWN, ANGRY),
    key(1.52, { advance: 0.32 }, { root: { yaw: 360 } }, pelvis(0, -0.036), bend(22, 8, 2, -2), SLAM_DOWN, ANGRY),
    // Straighten, then hop home.
    key(1.7, { advance: 0.32 }, { root: { yaw: 360 } }, pelvis(0, -0.018), bend(10, 2, 0, 0), GUARD, ANGRY),
    key(1.86, { advance: 0.15 }, { root: { y: 0.066, yaw: 360 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(2.0, { advance: 0 }, { root: { yaw: 360 } }, LAND, GUARD, ANGRY),
    key(2.3, { root: { yaw: 360 } }, OPEN_EYES),
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
    key(0.12, pelvis(0, -0.036), bend(28, 6, 0, 18), CHAMBER, ANGRY),
    // Claws into the ground: the dirt flies (dig) and it sinks, gathering speed.
    key(0.22, { root: { y: -0.1 } }, pelvis(0, -0.054), bend(42, 8, 2, 24), DIG_ARMS, ANGRY),
    key(0.48, { root: { y: -1.3 } }, pelvis(0, -0.054), bend(42, 8, 2, 24), DIG_ARMS, ANGRY),
    // Underground (nothing to stand on): tunnel over to the foe.
    key(0.62, { advance: 0.2 }, { plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.054), bend(40, 8, 2, 20), DIG_ARMS, ANGRY),
    key(0.84, { advance: 1 }, { plantFeet: 0, root: { y: -1.25 } }, pelvis(0, -0.06), bend(26, 6, 0, -10), CHAMBER, ANGRY),
    // Burst up under the foe, knee first.
    snap(1.0, { advance: 1 }, { root: { y: 0.33 } }, pelvis(0, 0.012), bend(-8, -6, -4, -16), RISING_KNEE, ANGRY),
    key(1.14, { advance: 0.92 }, { root: { y: 0.42 } }, pelvis(0, 0.012), bend(-10, -6, -4, -18), RISING_KNEE, ANGRY),
    // Come down in front of it and hold the crouch.
    fall(1.3, { advance: 0.8 }, LAND, pelvis(0, -0.036), bend(20, 4, 0, -6), GUARD, ANGRY),
    key(1.64, { advance: 0.8 }, pelvis(0, -0.018), bend(10, 2, 0, 0), GUARD, ANGRY),
    // Hop home.
    key(1.8, { advance: 0.38 }, { root: { y: 0.077 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.94, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.2, OPEN_EYES),
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
    key(0.22, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.012, -0.027, -0.008), { bones: { spine: { x: 24, y: -10 }, head: { x: -10, y: 8 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.3, -0.9, -0.3] }, shinR: { dir: [-0.15, -0.78, -0.61] } } }),
    snap(0.34, { plantLeft: 1, plantRight: 0 }, pelvis(0.009, -0.018, 0.008), { bones: { spine: { x: 4, y: 8 }, head: { x: -10, y: 2 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.25, 0.94] }, shinR: { dir: [-0.12, 0.02, 0.99] } } }),
    key(0.44, { plantLeft: 1, plantRight: 0 }, pelvis(0.007, -0.018, 0.007), { bones: { spine: { x: 2, y: 9 }, head: { x: -10 } } }, GUARD, ANGRY,
      { aim: { thighR: { dir: [-0.22, -0.28, 0.93] }, shinR: { dir: [-0.12, -0.12, 0.98] } } }),
    key(0.64, pelvis(0, -0.024), { bones: { spine: { x: 14 } } }, GUARD, ANGRY),
    key(1.15, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }],
};

/**
 * A dart from side to side: the body springs off the ground with the legs
 * kept in the stance under it (the foot IK holds them level). Freed, as in
 * a hop, its feet swung forward and, from the foe's side, down onto our
 * healthbox (tools/gauntlet/uiclear.mjs).
 */
const DART: Pose = { plantFeet: 1, pelvis: { y: 0.008 } };

/**
 * Double Team (afterimage): dart from side to side faster than the eye
 * (quick hops, root.x), guard up; the afterimages start at the aura and run
 * 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.75,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.03), bend(14, 2, 0, -4), GUARD, ANGRY),
    key(0.2, { root: { x: 0.12, y: 0.055, z: -0.03 } }, DART, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.3, { root: { x: 0.15, z: -0.05 } }, LAND, GUARD, ANGRY),
    key(0.42, { root: { x: -0.03, y: 0.066, z: -0.02 } }, DART, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.52, { root: { x: -0.18 } }, LAND, GUARD, ANGRY),
    key(0.64, { root: { x: 0.01, y: 0.066, z: -0.02 } }, DART, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.74, { root: { x: 0.13, z: -0.045 } }, LAND, GUARD, ANGRY),
    key(0.86, { root: { x: -0.012, y: 0.055, z: -0.02 } }, DART, bend(8, 0, 0, -4), GUARD, ANGRY),
    key(0.96, { root: { x: -0.144 } }, LAND, GUARD, ANGRY),
    key(1.1, { root: { x: -0.036, y: 0.044 } }, DART, bend(6, 0, 0, -2), GUARD, ANGRY),
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

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway, then
 * it curls over onto its heels hugging itself, head tucked and eyes shut, and
 * from the 'shrink' the curled body shrinks away (Battler3D). It sits back as
 * it curls, clear of our healthbox (tools/gauntlet/uiclear.mjs).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, { root: { z: -0.02 } }, bend(-8, -4, -2, -12), DROWSY),
    key(0.48, pelvis(0, -0.035), { root: { z: -0.04 } }, bend(14, 5, 4, 20), CROSSED, SHUT),
    key(0.82, pelvis(0, -0.09), { root: { z: -0.1 } }, bend(28, 12, 8, 30), CROSSED, SHUT),
    key(0.96, pelvis(0, -0.096), { root: { z: -0.1 } }, bend(30, 13, 8, 32), CROSSED, SHUT),
    key(1.6, pelvis(0, -0.093), { root: { z: -0.1 } }, bend(29, 12, 8, 31), CROSSED, SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

// The clips of ../blaziken/more.ts (added in the first clips' style) ---------

/** Forearms crossed in an X in front of the face, elbows forward: the block. */
const X_BLOCK: Pose = {
  aim: {
    armR: { dir: [-0.28, -0.12, 0.95] },
    forearmR: { dir: [0.62, 0.62, 0.48] },
    armL: { dir: [0.28, -0.12, 0.95] },
    forearmL: { dir: [-0.62, 0.64, 0.45] },
  },
};

/**
 * A throw with the left claw (the side away from our healthbox, and from a
 * wild one's): cocked back behind the shoulder, the right arm forward.
 */
const THROW_COCK: Pose = {
  aim: {
    armL: { dir: [0.45, 0.05, -0.89] },
    forearmL: { dir: [0.15, 0.45, -0.88] },
    armR: { dir: [-0.3, -0.4, 0.87] },
    forearmR: { dir: [-0.1, 0.35, 0.93] },
  },
};

/** The throwing arm whipped through, level, at the foe; the right drawn back. */
const THROW_OUT: Pose = {
  aim: {
    armL: { dir: [0.1, -0.02, 0.99] },
    forearmL: { dir: [-0.25, 0.0, 0.97] },
    armR: { dir: [-0.55, -0.5, -0.67] },
    forearmR: { dir: [-0.2, -0.3, 0.93] },
  },
};

/** Carried through low across the body. */
const THROW_THROUGH: Pose = {
  aim: {
    armL: { dir: [-0.4, -0.55, 0.73] },
    forearmL: { dir: [-0.62, -0.62, 0.48] },
    armR: { dir: [-0.55, -0.5, -0.67] },
    forearmR: { dir: [-0.2, -0.3, 0.93] },
  },
};

/** The right claw held out to the foe, palm up, the left on the hip. */
const BECKON: Pose = {
  aim: {
    armR: { dir: [-0.3, -0.25, 0.92] },
    forearmR: { dir: [-0.05, 0.3, 0.95] },
    armL: { dir: [0.62, -0.55, -0.56] },
    forearmL: { dir: [-0.35, -0.2, 0.92] },
  },
};

/** The beckoning claw curled in ("come on"). */
const CURL_R: Pose = { bones: { handR: { y: -40 } } };

/** Airborne and flying at the foe chest first, arms spread, legs trailing: the body press. */
const PRESS: Pose = {
  plantFeet: 0,
  aim: {
    armR: { dir: [-0.85, 0.2, 0.48] }, forearmR: { dir: [-0.4, 0.3, 0.87] },
    armL: { dir: [0.85, 0.2, 0.48] }, forearmL: { dir: [0.4, 0.3, 0.87] },
    thighR: { dir: [-0.2, -0.5, -0.84] }, shinR: { dir: [-0.1, -0.2, -0.97] },
    thighL: { dir: [0.2, -0.5, -0.84] }, shinL: { dir: [0.1, -0.2, -0.97] },
  },
};

/**
 * Protect, Endure, Substitute (shield): it snaps its forearms up into an X
 * before its face and sinks into its stance behind them while the barrier
 * forms, trembling with the effort; then lowers its guard.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    // A flinch back, the arms drawing in.
    key(0.14, pelvis(0, 0.004), bend(-6, -4, 0, -8), CHAMBER, ANGRY),
    // The block: forearms up in an X, weight down behind them.
    snap(0.28, pelvis(0, -0.03), bend(12, 4, 0, 6), X_BLOCK, ANGRY),
    key(0.46, pelvis(0, -0.032), bend(13, 4, 0, 7, 0, 1.5), X_BLOCK, ANGRY),
    key(0.66, pelvis(0, -0.031), bend(12, 5, 0, 6, 0, -1.5), X_BLOCK, ANGRY),
    key(0.86, pelvis(0, -0.033), bend(13, 4, 0, 7, 0, 1), X_BLOCK, ANGRY),
    // Guard down.
    key(1.1, pelvis(0, -0.012), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Rest (heal): it sinks down into a deep, calm crouch, arms folded and eyes
 * closed, breathes slowly in and out, and settles to sleep.
 */
const heal: Clip = {
  name: 'heal',
  duration: 1.9,
  keys: [
    key(0),
    // Letting go: the head drops, the arms fold.
    key(0.3, pelvis(0, -0.036), bend(10, 3, 2, 12), CROSSED, DROWSY),
    // Down into a deep calm crouch, eyes shut.
    key(0.62, pelvis(0, -0.09), bend(16, 6, 4, 18), CROSSED, SHUT),
    // A slow breath in (the chest rises) and out.
    key(0.98, pelvis(0, -0.084), bend(12, 3, 2, 14), CROSSED, SHUT),
    key(1.34, pelvis(0, -0.093), bend(17, 6, 4, 19), CROSSED, SHUT),
    // Back up.
    key(1.62, pelvis(0, -0.024), bend(6, 2, 0, 4), GUARD, DROWSY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/**
 * Sunny Day (weather): it gathers itself, then throws its chest open and its
 * head back to the sky, arms flung wide, and holds it (a slow sway) while
 * the sun comes out.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    key(0.26, pelvis(0, -0.027), bend(12, 3, 0, 10), CROSSED, SHUT),
    // Open to the sky.
    snap(0.5, pelvis(0, 0.008), bend(-16, -10, -8, -34), ARMS_SPREAD_UP, jaw(20), ANGRY),
    key(0.72, pelvis(0, 0.01), bend(-17, -10, -8, -36, 4, 3), ARMS_SPREAD_UP, jaw(16), ANGRY),
    key(0.94, pelvis(0, 0.007), bend(-16, -11, -8, -34, -4, -3), ARMS_SPREAD_UP, jaw(18), ANGRY),
    key(1.14, pelvis(0, 0.008), bend(-15, -10, -8, -32, 2, 1), ARMS_SPREAD_UP, jaw(9), ANGRY),
    // Back down to its guard.
    key(1.4, pelvis(0, -0.012), bend(6, 2, 0, 0), GUARD, ANGRY),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.56, name: 'aura' }],
};

/**
 * Swagger, Attract (charm): chest out and head cocked, it holds a claw out
 * to the foe and beckons it twice ("come on"), smug, then drops back into
 * its guard.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.55,
  keys: [
    key(0),
    // Chest out, head cocked, the hand going out.
    key(0.22, pelvis(0, 0.006), bend(-8, -5, 0, -6, 0, 10), BECKON, ANGRY),
    // Beckon: the claw curls in, the head nods with it.
    snap(0.38, pelvis(0, 0.007), bend(-9, -5, 0, -2, 0, 12), BECKON, CURL_R, HAPPY),
    key(0.52, pelvis(0, 0.006), bend(-8, -5, 0, -7, 0, 10), BECKON, HAPPY),
    snap(0.64, pelvis(0, 0.007), bend(-9, -5, 0, -2, 0, 12), BECKON, CURL_R, HAPPY),
    // Holds it, smug.
    key(0.86, pelvis(0, 0.006), bend(-8, -5, 0, -8, 4, 11), BECKON, HAPPY),
    key(1.14, pelvis(0, -0.006), bend(4, 1, 0, 0), GUARD, ANGRY),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'emit' }],
};

/**
 * Overheat (burst): it curls in tight around its fire, trembling as the heat
 * builds, then bursts open with everything: arms and head flung back; it
 * holds the blast, then slumps, spent.
 */
const burst: Clip = {
  name: 'burst',
  duration: 2.3,
  keys: [
    key(0),
    // Curling in around the heat.
    key(0.3, pelvis(0, -0.048), bend(28, 10, 6, 24), CROSSED, SHUT),
    key(0.52, pelvis(0, -0.057), bend(30, 11, 6, 26, 0, 1.5), CROSSED, SHUT),
    key(0.7, pelvis(0, -0.06), bend(31, 11, 6, 27, 0, -1.5), CROSSED, SHUT),
    // The burst.
    snap(0.84, pelvis(0, 0.013), bend(-18, -10, -8, -28), ARMS_SPREAD_UP, jaw(32), ANGRY),
    key(1.06, pelvis(0, 0.014), bend(-19, -10, -8, -30, 0, 2), ARMS_SPREAD_UP, jaw(30), ANGRY),
    key(1.28, pelvis(0, 0.012), bend(-18, -11, -8, -28, 0, -2), ARMS_SPREAD_UP, jaw(32), ANGRY),
    key(1.46, pelvis(0, 0.007), bend(-10, -6, -4, -16), CROSSED, jaw(22), ANGRY),
    // Spent: it slumps forward, breathing hard.
    key(1.72, pelvis(0, -0.024), bend(16, 6, 2, 12), CHAMBER, jaw(12), DROWSY),
    key(1.96, pelvis(0, -0.018), bend(12, 4, 2, 8), CHAMBER, jaw(5), DROWSY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.1, name: 'charge' }, { t: 0.86, name: 'release' }, { t: 1.5, name: 'releaseEnd' }],
};

/**
 * Rock Tomb, Rock Slide, Swift (throw): a sidearm throw with the left claw.
 * The body winds away with the claw cocked back behind the shoulder, then
 * unwinds and whips the arm through level at the foe; the volley leaves the
 * claw, the arm carries through low across the body.
 */
const throwing: Clip = {
  name: 'throw',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: turned away, the claw cocked back.
    key(0.2, pelvis(-0.006, -0.021), bend(8, 2, 0, -6, -18), THROW_COCK, ANGRY),
    key(0.3, pelvis(-0.007, -0.024), bend(9, 2, 0, -6, -20), THROW_COCK, ANGRY),
    // The throw: the torso unwinds, the arm whips through.
    snap(0.38, pelvis(0.004, -0.018), bend(14, 6, 0, -8, 10), THROW_OUT, ANGRY),
    // Carried through low across the body.
    key(0.56, pelvis(0.006, -0.021), bend(18, 7, 0, -6, 14), THROW_THROUGH, ANGRY),
    key(0.8, pelvis(0, -0.012), bend(8, 2, 0, -2), GUARD, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'release' }],
};

/**
 * Body Slam (slam): a deep coil, then a big leap high over the foe; at the
 * top it tips forward, arms spread, and comes down on it chest first with
 * its whole weight, bounces off, lands deep and hops home.
 */
const slam: Clip = {
  name: 'slam',
  duration: 2.05,
  keys: [
    key(0),
    // Coil.
    key(0.28, pelvis(0, -0.06), bend(26, 6, 0, -14), CHAMBER, ANGRY),
    // Spring up and in.
    key(0.48, { advance: 0.5 }, { root: { y: 0.26 } }, TUCK, bend(6, 0, 0, -10), CHAMBER, ANGRY),
    // The top: tipping forward over the foe, arms spread.
    key(0.64, { advance: 0.88 }, { root: { y: 0.33, pitch: 28 } }, PRESS, bend(8, 4, 0, -12), ANGRY),
    // Down on it with its whole weight.
    snap(0.76, { advance: 1 }, { root: { y: 0.09, pitch: 52 } }, PRESS, bend(12, 6, 0, -16), jaw(14), ANGRY),
    key(0.84, { advance: 1 }, { root: { y: 0.066, pitch: 54 } }, PRESS, bend(13, 6, 0, -17), jaw(10), ANGRY),
    // Bounces off it.
    key(0.98, { advance: 0.92 }, { root: { y: 0.18, pitch: 18 } }, TUCK, bend(6, 2, 0, -8), GUARD, ANGRY),
    // Lands in front of it, deep in the knees.
    fall(1.14, { advance: 0.9 }, LAND, pelvis(0, -0.042), bend(22, 4, 0, -4), GUARD, ANGRY),
    key(1.34, { advance: 0.9 }, pelvis(0, -0.018), bend(10, 2, 0, 0), GUARD, ANGRY),
    // Hop home.
    key(1.5, { advance: 0.42 }, { root: { y: 0.077 } }, HOP, bend(8, 0, 0, 0), GUARD, ANGRY),
    key(1.64, { advance: 0 }, LAND, GUARD, ANGRY),
    key(2.05, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/** Every clip, by name: the moments, the category clips and a clip per action its moves take. */
export const COMBUSKEN_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    kick, kickSand, punch, tackle, peck, toss, burrow, fling, afterimage,
    shield, heal, weather, charm, burst, throwing, slam,
  ].map((c) => [c.name, c]),
);

/** Eye atlas (pm0256_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const COMBUSKEN_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  worried: [1, 2],
  hurt: [0, 3],
};
