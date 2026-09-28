// Dustox's battle animation set, written in the style of the first clips of
// Blaziken, Sceptile and Swampert (src/pokemon/blaziken/first.ts): each clip
// a short list of hand-set key poses over the stance, extremes first
// (anticipation, the action, follow-through, recovery), one clip per action
// its moves take. This file holds the helpers, the moments (idle, intro, hit,
// faint) and the contact moves; ./set_ranged.ts and ./set_status.ts the rest.
//
// How Dustox moves (the brief in index.ts):
//   - it never stands: it hovers on its broad wings, and its wings never stop.
//     The beat is keyed in every clip, as the first clips key a landing: the
//     top of a stroke (wings raised and swept back) and the bottom (lowered
//     and brought forward), each downstroke lifting the body a little. At
//     rest it beats slowly and heavily (0.6 s a beat: a heavy moth, slower
//     than Beautifly); effort beats faster and harder, calm glides;
//   - it is heavy for a moth (31.6 kg) and grumpy: wind-ups are deliberate,
//     its rams are heavy rushes, it rears back to brake and bounces off;
//   - a contact move is a flight: the wings drawn up and the body drawn back
//     (the wind-up), one swoop along an arc to the foe, a braking flare in
//     front of it (its landing), the strike snapped with the body or a wing,
//     follow-through, a flight home, a settle into the hover. The strike's
//     pose is the point of contact: its face and thorax (a ram) or the
//     wing's edge (a slash) on the foe's body, touching it, never sunk in;
//   - its mind acts through its antennae (Confusion, Psybeam, Psychic, Giga
//     Drain), sludge and thread leave its mouth, its toxic powder is shaken
//     from its wings, and the tip of its abdomen curls under it to fire
//     Poison Sting's barb.
//
// Channels used here:
//   advance  0..1   how far toward the foe a contact move has travelled
//   root     y rises (heights; the calibration floats it as the foe), z lunges
//            toward the foe, pitch leans the body (+ forward), roll banks it
//            (+ to its right), x darts aside (+ its left)
//   bones    wingL/wingR the wings (the beat; wingTip and wingHind parts
//            trail on springs), spine and head the body, hips the abdomen,
//            antenna1L/R the antennae (their tips on springs), armL/R and
//            legL/R its two pairs of little legs
//   scale    a swell (gathering power, a breath)
//   expression  its mouth (it has no eyelids: its eyes are painted on)
// Events: impact (a blow lands), release/releaseEnd (a ranged effect
// leaves / stops), charge, emit, aura, cry, shrink.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';
import { STANCE } from './poses';

/** A key: STANCE plus deltas (bone rotations and offsets add up). */
export const key = (t: number, ...deltas: Pose[]): Keyframe => ({ t, pose: compose(STANCE, ...deltas) });
/** A snap into this key: fast start, soft stop. */
export const snap = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (a drop). */
export const fall = (t: number, ...deltas: Pose[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

// Reusable deltas ------------------------------------------------------------------

/** Its mouth (mouth_mat atlas): open wide, pressed shut, a pained frown, a smirk. */
export const GAPE: Pose = { expression: 'gape' };
export const SHUT: Pose = { expression: 'shut' };
export const FROWN: Pose = { expression: 'frown' };
export const SMILE: Pose = { expression: 'smile' };
export const MOUTH: Pose = { expression: 'open' };

/** How far toward the foe a contact move has flown (0 home, 1 at the foe). */
export const go = (advance: number): Pose => ({ advance });
/** The body in the air: height and lunge toward the foe (heights), lean (+ forward) and bank (+ to its right), x aside (+ its left). */
export const fly = (y: number, z = 0, pitch = 0, roll = 0, x = 0): Pose => ({ root: { x, y, z, pitch, roll } });
/** Both wings alike: lifted (+) or lowered (-), swept back (+) or brought forward (-), from their spread in the stance. */
export const wings = (lift: number, sweep = 0): Pose => ({ bones: { wingL: { y: sweep, z: lift }, wingR: { y: -sweep, z: -lift } } });
/** The left wing alone (its lift and sweep as for wings()). */
export const wingL = (lift: number, sweep = 0): Pose => ({ bones: { wingL: { y: sweep, z: lift } } });
/** The right wing alone. */
export const wingR = (lift: number, sweep = 0): Pose => ({ bones: { wingR: { y: -sweep, z: -lift } } });
/** The thorax leans (+ forward, at the foe); the head nods (+ down), turns (+ to its left) and tilts (+ to its right). */
export const bend = (spine: number, head = 0, headY = 0, headZ = 0): Pose => ({ bones: { spine: { x: spine }, head: { x: head, y: headY, z: headZ } } });
/** The thorax twists (+ turns to its left: its left side goes back, its right side comes forward). */
export const twist = (deg: number): Pose => ({ bones: { spine: { y: deg } } });
/** The abdomen curled forward under it (+) or swung back (-); the thorax keeps its place. */
export const curl = (deg: number): Pose => ({ bones: { hips: { x: -deg }, spine: { x: deg } } });
/** The feathery antennae swung forward at the foe (+) or laid back (-), spread apart (+) or drawn together (-). */
export const antennae = (fwd: number, spread = 0): Pose => ({
  bones: { antenna1L: { x: fwd, z: -spread }, antenna1R: { x: fwd, z: spread } },
});
/** The little legs reaching out at the foe (+) or folded in against its chest (-). */
export const legs = (reach: number): Pose => ({
  bones: {
    armL: { y: -20 * reach, z: 14 * reach }, armR: { y: 20 * reach, z: -14 * reach },
    legL: { y: -16 * reach, z: 10 * reach }, legR: { y: 16 * reach, z: -10 * reach },
  },
});
/** A swell (drawing in power or breath) or a shrink. */
export const swell = (s: number): Pose => ({ scale: s });

/** The top of a hover stroke: the wings raised and swept back a little. */
export const UP = wings(22, 8);
/** The bottom of a hover stroke: the wings lowered and brought forward. */
export const DOWN = wings(-16, -6);

// The moments ---------------------------------------------------------------------

/**
 * Hovering: a slow, heavy beat (0.6 s: a quicker downstroke that lifts it a
 * little and tips it forward, a longer upstroke on which it sinks back), the
 * abdomen swinging a little against each stroke and the body drifting in a
 * slow sway, so no two beats are alike. The wing tips and lower wings, and
 * the antennae, trail on springs. It loops on the stance, at the middle of
 * an upstroke.
 */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(0.17, UP, fly(-0.01, 0, -1), curl(2)),
    key(0.43, DOWN, fly(0.02, 0, 1.5, 0.8, 0.004), curl(-2), bend(0, 1.5)),
    key(0.77, wings(24, 9), fly(-0.012, 0, -1.2, 0.6, 0.006), curl(2.5)),
    key(1.03, wings(-17, -6), fly(0.024, 0, 1.6, 1.2, 0.008), curl(-2), bend(0, 2)),
    key(1.37, wings(21, 7), fly(-0.008, 0, -0.8, 0, 0.004), curl(2)),
    key(1.63, wings(-15, -5), fly(0.018, 0, 1.4, -1, -0.004), curl(-1.5), bend(0, 1)),
    key(1.97, wings(23, 8), fly(-0.01, 0, -1, -0.8, -0.006), curl(2.5)),
    key(2.23, wings(-16, -6), fly(0.021, 0, 1.5, -0.6, -0.003), curl(-2), bend(0, 1.5)),
    key(2.4),
  ],
};

/**
 * Sent out: it comes out resting, its wings folded up together over its back
 * and its body curled low; it coils tighter, then snaps its wings open with
 * one great downstroke that lifts it, mouth wide in its cry, beats twice
 * more, hanging high with its chest out, and settles into its hover.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.75,
  keys: [
    key(0, wings(50, 20), fly(-0.04, 0, 6), bend(10, 14), curl(14), legs(-1), SHUT),
    // Coiling tighter: the folded wings drawn further back, the head tucked.
    key(0.22, wings(56, 26), fly(-0.06, 0, 8), bend(14, 18), curl(18), legs(-1.2), SHUT),
    // The wings snap open in one great downstroke that lifts it: the cry.
    snap(0.42, wings(-26, -10), fly(0.07, 0, -8), bend(-10, -14), curl(-6), legs(0.8), GAPE),
    key(0.6, wings(26, 8), fly(0.05, 0, -6, 2), bend(-9, -13, 0, 4), curl(2), legs(0.8), GAPE),
    key(0.8, wings(-22, -7), fly(0.08, 0, -5, -2), bend(-9, -13, 0, -4), curl(-3), legs(0.8), GAPE),
    // Easing down into its hover.
    key(1.0, wings(22, 7), fly(0.035, 0, -4), bend(-5, -6), curl(2), legs(0.3)),
    key(1.22, wings(-17, -5), fly(0.035, 0, 1), bend(1, 0), curl(-1)),
    key(1.44, wings(16, 5), fly(0.004, 0, -1)),
    key(1.6, wings(-8, -3), fly(0.012, 0, 0.5)),
    key(1.75),
  ],
  events: [{ t: 0.46, name: 'cry' }],
};

/**
 * Taking a hit: jolted back, it tips away with its wings flung up and
 * forward in a startled flap, the head snapped back, the abdomen swinging
 * back; a steadying downstroke, a small overshoot, and it settles.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.64,
  keys: [
    key(0),
    snap(0.05, wings(30, -14), fly(0.01, -0.03, -10), bend(-10, -16), curl(-8), legs(0.6), FROWN),
    key(0.2, wings(-14, -4), fly(0.004, -0.015, -4), bend(-4, -6), curl(-3), FROWN),
    key(0.38, wings(10, 3), fly(0.012, 0, 2), bend(3, 3), curl(2), FROWN),
    key(0.64),
  ],
};

/**
 * Fainting, worn out (not dying): a faltering stroke and a sway, one weak
 * flap, then its wings give out and droop round it and it sinks, curling up
 * with its head bowed and its mouth shut, and from the 'shrink' the curled
 * body shrinks away. (As the foe it hovers off the ground: it sinks as far as
 * a faint may, and shrinks away there.)
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.68,
  keys: [
    key(0),
    key(0.2, wings(-12, 0), fly(0.01, 0, -4, 3), bend(-6, -10), curl(-3), FROWN),
    key(0.42, wings(14, 4), fly(-0.02, 0, 0, -4), bend(4, 6), curl(3), FROWN),
    key(0.64, wings(-24, -18), fly(-0.05, 0, 6, 3), bend(10, 14), curl(8), legs(-0.6), FROWN),
    // The wings give out, drooping and wrapping round it; it sinks, curling up.
    fall(0.88, wings(-38, -48), fly(-0.09, -0.01, 8, 2), bend(18, 24), curl(18), legs(-1.2), SHUT),
    key(1.02, wings(-40, -52), fly(-0.1, -0.012, 9, 1), bend(20, 26), curl(20), legs(-1.3), SHUT),
    key(1.68, wings(-39, -51), fly(-0.098, -0.012, 9, 1.5), bend(19, 25), curl(19), legs(-1.3), SHUT),
  ],
  events: [{ t: 1.1, name: 'shrink' }],
};

// Contact moves ------------------------------------------------------------------

/**
 * Tackle (Facade, Secret Power, Struggle, and the blows Mimic may call): a
 * heavy rush and a body ram. It rears back with its wings drawn up high and
 * its abdomen coiled, drives itself off with one hard downstroke and swoops
 * along an arc to the foe, flares its wings forward to brake in front of it,
 * then rams its head and thorax into the foe with its wings swept back,
 * leaning its weight into it; it bounces off, tipping back, and flies home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.42,
  keys: [
    key(0),
    // Wind-up: rearing back, the wings drawn up high, the abdomen coiled under it.
    key(0.12, wings(34, 14), fly(0.02, -0.05, -12), bend(-6, -8), curl(10), SHUT),
    key(0.22, wings(40, 18), fly(0.03, -0.06, -14), bend(-8, -10), curl(14), SHUT),
    // One hard downstroke drives it off along an arc to the foe.
    key(0.34, go(0.55), wings(-28, -10), fly(0.12, 0, 14), bend(6, 6), curl(4), SHUT),
    // It brakes in front of the foe: the wings flared forward, the body tipped back, coiled for the ram.
    key(0.46, go(1), wings(24, -20), fly(0.03, -0.06, -8), bend(-6, -6), curl(10), legs(-0.6), SHUT),
    // The ram: head and thorax driven into the foe, the wings swept back in a V.
    snap(0.54, go(1), wings(24, 36), fly(0.02, 0, 10), bend(10, 10), curl(-6), legs(-1), SHUT),
    // Leaning its weight on it.
    key(0.64, go(1), wings(20, 38), fly(0.02, 0, 10.5), bend(10.5, 10.5), curl(-7), legs(-1), SHUT),
    // It bounces off, tipping back, and flies home.
    key(0.78, go(0.88), wings(30, 6), fly(0.07, -0.02, -12), bend(-4, -6), curl(8), FROWN),
    key(0.92, go(0.45), wings(-20, -6), fly(0.09, 0, -6), bend(-2, -2), curl(2)),
    key(1.06, go(0), wings(18, 6), fly(0.02, 0, -2)),
    key(1.22, wings(-12, -4), fly(0.016, 0, 1), bend(1, 1)),
    key(1.42),
  ],
  events: [{ t: 0.56, name: 'impact' }],
};

/**
 * Double-Edge (Return, Frustration): reckless. It dips, then climbs over its
 * place on two heavy strokes, folds its wings back and dives down along an
 * arc into the foe, crashing into it head first; the recoil hurts it too, and
 * it tumbles back, wincing, flutters home unsteadily and settles.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.1,
  keys: [
    key(0),
    // A dip to load, the wings raised for a big stroke.
    key(0.16, wings(38, 16), fly(-0.03, -0.02, 6), bend(6, 8), curl(10), SHUT),
    // Climbing over its place on two heavy strokes, rearing back.
    key(0.3, wings(-30, -10), fly(0.1, -0.04, -10), bend(-6, -8), curl(4), SHUT),
    key(0.44, go(0.08), wings(34, 14), fly(0.16, -0.05, -12), bend(-8, -10), curl(8), SHUT),
    // At the top it folds its wings back in a V over its back and tips into the dive.
    key(0.56, go(0.3), wings(30, 42), fly(0.24, -0.02, 20), bend(10, 10), curl(-4), legs(-1), FROWN),
    key(0.7, go(0.75), wings(28, 48), fly(0.14, 0, 30), bend(12, 12), curl(-6), legs(-1.2), FROWN),
    // The crash: head first into the foe.
    snap(0.8, go(1), wings(36, 34), fly(0.03, -0.2, 16), bend(12, 14), curl(-8), legs(-1.2), SHUT),
    // The wings splay out from the jolt.
    key(0.9, go(1), wings(8, 14), fly(0.02, -0.2, 15), bend(12, 14), curl(-6), legs(-1), FROWN),
    // The recoil: it tumbles back off the foe, wincing, wings flailing.
    key(1.02, go(0.86), wings(30, -10), fly(0.1, -0.04, -24, 12), bend(-10, -14, 0, 8), curl(10), FROWN),
    key(1.18, go(0.7), wings(-24, -8), fly(0.06, 0, -8, -10), bend(-4, -6, 0, -6), curl(4), FROWN),
    // Home, unsteadily.
    key(1.36, go(0.35), wings(24, 8), fly(0.1, 0, -4, 8), bend(-2, -3, 0, 4), FROWN),
    key(1.52, go(0.1), wings(-20, -6), fly(0.04, 0, 2, -4), bend(1, 1, 0, -2)),
    key(1.66, go(0), wings(18, 6), fly(0.02, 0, -2, 2), bend(0, 2)),
    key(1.86, wings(-10, -3), fly(0.012, 0, 1)),
    key(2.1),
  ],
  events: [{ t: 0.82, name: 'impact' }],
};

/**
 * Aerial Ace, Thief (strike: a wing slash): it cocks its left wing up high
 * and back over its shoulder, the thorax turned with it, streaks along an
 * arc to the foe, and cuts the wing down and forward across the foe's body
 * as it turns its shoulder into the cut and banks (turned, the wing shows
 * its face to both views as it chops: swung straight forward it went edge-on
 * and vanished); the wing carries on down past it as the body pulls away,
 * and it swings home.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.36,
  keys: [
    key(0),
    // Cocking the left wing up high and back, the thorax turned with it.
    key(0.1, wingL(40, 26), wingR(8, 0), twist(16), fly(0.02, -0.03, -8, 4), bend(-4, -6, 6), curl(8), SHUT),
    key(0.2, wingL(48, 30), wingR(10, 2), twist(20), fly(0.03, -0.04, -10, 5), bend(-5, -7, 8), curl(10), SHUT),
    // A streak along an arc to the foe, the other wing swept back.
    key(0.3, go(0.6), wingL(50, 32), wingR(14, 36), twist(20), fly(0.15, 0, 14, 4), bend(4, 2, 6), curl(2), SHUT),
    key(0.4, go(1), wingL(54, 34), wingR(16, 10), twist(22), fly(0.06, -0.02, 2, 6), bend(-2, -4, 8), curl(6), SHUT),
    // The cut: the wing comes down and forward across the foe as the thorax unwinds, banking into it.
    snap(0.47, go(1), wingL(-24, -50), wingR(20, 22), twist(-10), fly(0.02, -0.23, 6, -8), { root: { yaw: -30 } }, bend(6, 6, -8), curl(-4), FROWN),
    // It carries on down past the foe as the body pulls away.
    key(0.6, go(1), wingL(-50, -54), wingR(22, 24), twist(-14), fly(0.02, -0.3, 2, -12), { root: { yaw: -38 } }, bend(7, 7, -10), curl(-5), FROWN),
    // Swinging home.
    key(0.74, go(0.94), wings(24, 8), twist(-6), fly(0.07, 0, -6, 4), bend(-2, -2), curl(4)),
    key(0.88, go(0.45), wings(-20, -6), fly(0.1, 0, -6), bend(-1, -1)),
    key(1.02, go(0), wings(18, 6), fly(0.02, 0, -2)),
    key(1.16, wings(-10, -3), fly(0.012, 0, 1)),
    key(1.36),
  ],
  events: [{ t: 0.49, name: 'impact' }],
};

export const MOMENTS_AND_BLOWS: Clip[] = [idle, intro, hit, faint, physicalWeak, physicalStrong, strike];

/**
 * Mouth atlas (mouth_mat: 4 x 2 cells; its usual thick downturned mouth is
 * column 0 of row 1): offsets from that mouth. Row 1 also holds a thin,
 * slightly rising line, a thin downturned line and a thin straight line; row
 * 0 a thick straight line, the mouth open wide, and two open curves.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  gape: [1, 1],
  shut: [3, 0],
  frown: [2, 0],
  smile: [1, 0],
};
