// Marshtomp's battle animation set: Swampert's first clips
// (src/pokemon/swampert/first.ts) and the clips added since in their style
// (../swampert/more.ts), ported to Marshtomp: the same actions, beats, arcs
// and weight, re-posed on its own stance, rig and proportions and re-timed
// for a lighter, springier body. One clip per action: the moments (idle,
// intro, hit, faint), the category clips, and a clip per motif its moves
// need (quake, wave, shield, punch, strike, glare, kick_sand, heal, toss,
// burrow, fling, afterimage, tail, kick, spin, charm), and Bide's storing
// turns (physical_strong_charge); the profile maps the other motifs to the
// clip of their action (index.ts motifClips).
//
// Channels used here:
//   advance  0..1   how far toward the target a contact move has travelled
//                   (1: its front 0.15 of its height short of the foe's)
//   root     model-unit offset/rotation of the whole body (hops, lunges,
//                   dives; root.pitch tips it over about its feet)
//   plantFeet / plantLeft / plantRight   foot IK weights (0 = the leg is free)
//   expression      eye atlas cell (open, angry, half, happy, closed, focus, hurt)
// Events: impact (contact lands), release (projectile/stream/wave starts),
// releaseEnd, charge, cry, aura, emit, shrink; grab and throw (a toss carries
// the foe from its grab to its throw), dig (a burrow goes under).
//
// How Marshtomp moves (the brief in index.ts), next to Swampert:
//   - 28 kg to its 82: the same wrestler's moves, quicker (about 0.9 of
//     Swampert's timing) and springier (hops about a third higher), still
//     grounded: it crouches before it moves and lands flat-footed in a squat;
//   - its legs are short (a fifth of its height), so its crouches are
//     shallower than Swampert's; its head carries the whole upper body (there
//     is no neck: bend() folds the neck's share into the head);
//   - its stance holds both arms up in a Y, the sprites' pose: a clip that
//     lets go of the arms brings them back up into it, where Swampert's came
//     down into its crab arms;
//   - its blows land on the foe: the engine sweeps each blow's pose (its
//     impact, a toss's grab) toward the foe until the bodies touch, so the
//     pose at the impact is the real point of contact: the shoulder, the
//     belly, the fist, the foot, the tail lobes, the rolling ball;
//   - water and mud come from its wide mouth, the body braced in a squat;
//     waves and rocks are heaved up with both arms, Earthquake hammered into
//     the ground with both fists.
// The animator adds overlapping action (the head trails the hips by 0.05 s,
// forearms 0.06, hands 0.08: events that depend on them sit a little after
// their key), breathing, blinks and springs on the head fin and tail lobes.

import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose, Vec3 } from '../../anim/rig';
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
/** Eyes squeezed shut with effort (its atlas's > < cell). */
const SQUINT: Pose = { expression: 'hurt' };
/** Narrowed, peering. */
const NARROW: Pose = { expression: 'focus' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
/** Jaw relative to the stance's open grin: jaw(-24) shuts it, jaw(16) gapes. */
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const MOUTH_SHUT = jaw(-24);
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
/**
 * Spine chain pitch (x) from hips to head, with optional head turn/tilt: the
 * signature of Swampert's, with the neck's share added to the head (it has
 * no neck; its head carries the upper body).
 */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => ({
  bones: { spine: { x: spine }, chest: { x: chest }, head: { x: neck + head, y: headY, z: headZ } },
});
/** Upper-body twist (+ turns the chest toward its left: the right shoulder comes forward). */
const twist = (deg: number): Pose => ({ bones: { spine: { y: deg } } });
/** Sinking into the knees (heights). */
const sink = (y: number, z = 0): Pose => ({ pelvis: { x: 0, y, z } });
/** Both tail lobes raised (+) or swung down and through (-). */
const tail = (x: number, y = 0): Pose => ({ bones: { tailL: { x, y }, tailR: { x, y: -y } } });
/** The head fin tipped forward (+) at the foe. */
const fin = (x: number): Pose => ({ bones: { fin: { x } } });
/**
 * Keeps the head fin standing while the head is thrown back: from our side a
 * fin that falls back with the head points at the camera, and the head reads
 * as a round stub. A rotation about the model's X axis at the fin's base,
 * about 0.6 of the head's back-pitch (spine + chest + head).
 */
const finUp = (deg: number): Pose => ({ post: { fin: { x: deg } } });

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** Both arms (left given, right mirrored unless given): upper arm, forearm, hand. */
const arms = (armL: Vec3, forearmL: Vec3, handL: Vec3, right?: [Vec3, Vec3, Vec3]): Pose => ({
  aim: {
    armL: { dir: armL },
    forearmL: { dir: forearmL },
    handL: { dir: handL },
    armR: { dir: right?.[0] ?? mirror(armL) },
    forearmR: { dir: right?.[1] ?? mirror(forearmL) },
    handR: { dir: right?.[2] ?? mirror(handL) },
  },
});

// Swampert's arm shapes on Marshtomp's arms (its hands are open paddles,
// carried in line with the forearm). From our side the foe's healthbox sits
// just above its head fin and ours right beside its right hand, so a raise
// goes up the front of the body, never out round the side.

/** The stance's Y eased: elbows out at the shoulders, forearms up and a little in (a breakdown into and out of the stance). */
const Y_EASED = arms([0.92, 0.1, 0.38], [0.3, 0.8, 0.52], [0.15, 0.85, 0.5]);
/** Both fists raised high overhead (rearing up for a slam or a wave). */
const ARMS_UP = arms([0.5, 0.82, 0.28], [0.18, 0.95, 0.25], [-0.1, 0.97, 0.2]);
/** Forearms swinging up in front of the chest, elbows low: a raise goes up the front through here. */
const ARMS_RISING = arms([0.5, -0.2, 0.84], [-0.1, 0.9, 0.42], [-0.2, 0.95, 0.25]);
/** Arms flung up and out in a V (the leap of a body slam). */
const ARMS_SPREAD_UP = arms([0.85, 0.45, 0.25], [0.55, 0.8, 0.2], [0.3, 0.92, 0.2]);
/** Arms flung up high in a narrow V (battle cry, calling the sky). */
const ARMS_ROAR = arms([0.55, 0.8, 0.25], [0.3, 0.93, 0.2], [0.15, 0.97, 0.2]);
/** Fists pulled up by the shoulders, elbows out (bursting up in a hop). */
const FISTS_UP = arms([0.7, 0.45, 0.55], [-0.1, -0.4, 0.91], [-0.15, -0.5, 0.85]);
/** Both arms heaved up high in front (raising a wave). */
const ARMS_HEAVE_HIGH = arms([0.42, 0.72, 0.55], [0.15, 0.9, 0.4], [0.0, 0.93, 0.35]);
/** Arms thrown wide at shoulder height (roaring at the foe). */
const ARMS_WIDE = arms([0.95, 0.05, 0.3], [0.85, -0.2, 0.48], [0.75, -0.35, 0.56]);
/** Both fists hammered down in front (onto a foe it holds). */
const HAMMER_DOWN = arms([0.3, -0.5, 0.81], [0.08, -0.82, 0.57], [0.0, -0.9, 0.43]);
/** Both fists hammered down into the ground at its sides. */
const QUAKE_HAMMER = arms([0.72, -0.67, 0.12], [0.3, -0.94, 0.12], [0.1, -0.98, 0.1]);
/** Hands coming down in front of the chest, elbows in: raised arms come down the front through here. */
const ARMS_DOWN_FRONT = arms([0.45, 0.1, 0.89], [-0.15, -0.5, 0.85], [-0.2, -0.6, 0.77]);
/** Both arms thrust forward, palms toward the foe (pushing a wave). */
const PUSH = arms([0.38, -0.1, 0.92], [0.18, -0.02, 0.98], [0.05, 0.35, 0.94]);
/** The push follows through, low and long. */
const PUSH_LOW = arms([0.32, -0.35, 0.88], [0.15, -0.3, 0.94], [0.05, -0.2, 0.98]);
/** Arms swept down and back (scooping up water). */
const ARMS_SCOOP = arms([0.55, -0.75, -0.35], [0.3, -0.7, -0.65], [0.15, -0.6, -0.78]);
/** Forearms crossed in front of the face (Protect). */
const CROSSED_GUARD = arms([0.55, -0.45, 0.7], [-0.72, 0.62, 0.3], [-0.6, 0.75, 0.28]);
/** Forearms rising in front of the chest (on the way into CROSSED_GUARD). */
const GUARD_RISING = arms([0.6, -0.55, 0.58], [-0.35, 0.55, 0.76], [-0.35, 0.7, 0.62]);
/** Arms crossed in front of the belly (gathering, curled up). */
const CROSSED_LOW = arms([0.5, -0.6, 0.62], [-0.75, 0.0, 0.66], [-0.75, -0.1, 0.65]);
/** Fists crossed high in front of the chest (gathering). */
const CROSSED_CHEST = arms([0.6, -0.2, 0.77], [-0.7, 0.2, 0.69], [-0.65, 0.15, 0.74]);
/** A sumo brace: elbows out, forearms reaching forward low, hands open over the ground (bracing a blast). */
const BRACED = arms([0.9, -0.3, 0.3], [0.35, -0.55, 0.76], [0.1, -0.5, 0.86]);
/** Elbows out, forearms angled forward and down: bracing a quick spit. */
const SPIT_BRACE = arms([0.88, -0.4, 0.25], [0.35, -0.5, 0.79], [0.1, -0.55, 0.83]);
/** Elbows drawn back and up, chest open (drawing breath). */
const ELBOWS_BACK = arms([0.7, -0.2, -0.68], [0.35, -0.35, 0.87], [0.15, -0.4, 0.9]);
/** Arms tucked in, forearms up before the chest (a shoulder charge). */
const ARMS_TUCKED = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.3, 0.35, 0.89]);
/** Arms drawn back behind the body (coiling to launch). */
const ARMS_BACK = arms([0.6, -0.35, -0.72], [0.45, -0.6, -0.66], [0.3, -0.7, -0.65]);
/** Arms spread forward and wide (about to crash onto the foe). */
const ARMS_FWD_SPREAD = arms([0.75, -0.15, 0.65], [0.45, -0.35, 0.82], [0.3, -0.4, 0.87]);
/** Flinch: the hands jerk up in front of the face. */
const FLINCH = arms([0.62, 0.05, 0.78], [-0.05, 0.8, 0.6], [-0.2, 0.85, 0.49]);
/** Arms hanging limp at its sides, a little behind the hips (resting). */
const LIMP_ARMS = arms([0.55, -0.82, -0.12], [0.2, -0.97, 0.1], [0.1, -0.98, 0.15]);
/** The arms out at the elbows, forearms hanging (a breakdown between the Y and arms low at its sides). */
const ELBOWS_OUT = arms([0.93, -0.22, 0.28], [0.5, -0.85, 0.18], [0.25, -0.9, 0.35]);
/** Right fist cocked far back, left arm out front as a guard. */
const CHAMBER_R = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.25, 0.15, 0.96], [[-0.55, 0.25, -0.8], [-0.25, 0.1, 0.96], [-0.1, 0.0, 0.99]]);
/** Right fist driven straight at the foe, left fist pulled back to the hip. */
const PUNCH_R = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[-0.12, 0.02, 0.99], [-0.05, 0.02, 1], [-0.02, 0.04, 1]]);
/** The punch carries through past the foe. */
const PUNCH_R_THROUGH = arms([0.75, -0.35, -0.55], [0.35, -0.2, 0.92], [0.2, -0.3, 0.93], [[0.12, -0.08, 0.99], [0.2, -0.1, 0.97], [0.22, -0.1, 0.97]]);
/** Right hand raised high behind the head, edge ready to chop (Rock Smash). */
const CHOP_RAISED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.25, 0.15, 0.96], [[-0.55, 0.6, -0.58], [-0.1, 0.95, 0.3], [0.0, 0.95, 0.3]]);
/** CHOP_RAISED cocked further back as it lands, so the chop starts from a turnaround, not a dead stop. */
const CHOP_COCKED = arms([0.6, -0.4, 0.7], [-0.2, 0.2, 0.96], [-0.25, 0.15, 0.96], [[-0.5, 0.64, -0.58], [-0.06, 0.97, -0.2], [0.02, 0.9, -0.42]]);
/** The chop drives down and across in front. */
const CHOP_DOWN = arms([0.7, -0.5, -0.5], [0.3, -0.4, 0.87], [0.2, -0.45, 0.87], [[-0.25, -0.35, 0.9], [0.35, -0.75, 0.56], [0.4, -0.8, 0.45]]);
/** Fingers curled into fists. */
const FISTS: Pose = {
  bones: {
    fingerA1L: { z: -40 }, fingerB1L: { z: -40 }, fingerC1L: { z: -40 },
    fingerA2L: { z: -34 }, fingerB2L: { z: -34 }, fingerC2L: { z: -34 },
    fingerA1R: { z: 40 }, fingerB1R: { z: 40 }, fingerC1R: { z: 40 },
    fingerA2R: { z: 34 }, fingerB2R: { z: 34 }, fingerC2R: { z: 34 },
  },
};
/** Fingers half curled (relaxed hands; cupping mud). */
const CURL: Pose = {
  bones: {
    fingerA1L: { z: -22 }, fingerB1L: { z: -22 }, fingerC1L: { z: -22 },
    fingerA2L: { z: -18 }, fingerB2L: { z: -18 }, fingerC2L: { z: -18 },
    fingerA1R: { z: 22 }, fingerB1R: { z: 22 }, fingerC1R: { z: 22 },
    fingerA2R: { z: 18 }, fingerB2R: { z: 18 }, fingerC2R: { z: 18 },
  },
};

/** Airborne: knees drawn up, feet trailing (legs rotate, so blends stay smooth). */
const TUCK: Pose = { plantFeet: 0, bones: { thighL: { x: -34 }, thighR: { x: -34 }, shinL: { x: 44 }, shinR: { x: 44 } } };
/** Airborne, hopping back: knees drawn up a little. */
const HOP: Pose = { plantFeet: 0, bones: { thighL: { x: -20 }, thighR: { x: -20 }, shinL: { x: 24 }, shinR: { x: 24 } } };
/** Landing flat-footed in a squat: the knees take the weight. */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: 8 }, head: { x: -6 } } };
/** Landing from a hop home: the knees take the weight and the torso carries on back a little. */
const LAND_HOME: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: -3 }, head: { x: 1 } } };

// Battle moments --------------------------------------------------------------

/** Idle: breathing through the open grin, the raised arms rising a little with each breath; the life layer adds the rest. */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.01), { bones: { spine: { x: 2 } } }, jaw(3), { post: { armL: { z: 4 }, armR: { z: -4 } } }),
    key(2.4),
  ],
};

/**
 * Sent out: rises from a curled crouch in a hop with its fists pulled up
 * (the stock front anim of its line is a jump), lands in a squat, then cries
 * with its arms flung up in a narrow V, and opens them out into its Y. The
 * hop leans in and the arms go up the front of the body (Swampert's
 * healthbox lessons: a high jump takes the head under the foe's box, arms
 * swung round the sides the right hand under ours).
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.75,
  keys: [
    key(0, pelvis(0, -0.055), bend(16, 6, 0, 14), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Coil deeper.
    key(0.2, pelvis(0, -0.075), bend(21, 7, 0, 18), CROSSED_LOW, MOUTH_SHUT, SHUT),
    // Burst up, leaning into the hop, fists pulled up.
    snap(0.38, { root: { y: 0.08, pitch: 5 } }, TUCK, bend(-6, -4, 0, -12), finUp(10), FISTS_UP, FISTS, jaw(4), ANGRY),
    key(0.5, { root: { y: 0.09, pitch: 5 } }, TUCK, bend(-7, -4, 0, -14), finUp(12), FISTS_UP, FISTS, jaw(6), ANGRY),
    // Lands in a squat, the fists coming down in front.
    fall(0.65, LAND, pelvis(0, -0.025), bend(8, 2, 0, 4), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    key(0.72, LAND, pelvis(0, -0.03), bend(9, 2, 0, 5), ARMS_DOWN_FRONT, FISTS, MOUTH_SHUT, ANGRY),
    // The cry: rears up, arms flung up high, jaw wide (moving hold), the fin kept standing.
    snap(0.86, pelvis(0, 0.012), bend(-10, -7, 0, -20), finUp(22), ARMS_ROAR, jaw(16), ANGRY),
    key(1.02, pelvis(0, 0.014), bend(-11, -7, 0, -22, 5, 3), finUp(24), ARMS_ROAR, jaw(18), ANGRY),
    key(1.18, pelvis(0, 0.012), bend(-10, -7, 0, -21, -5, -3), finUp(23), ARMS_ROAR, jaw(16), ANGRY),
    // The arms open out into its Y and it settles into the stance.
    key(1.34, pelvis(0, -0.01), bend(4, 2, 0, -4), Y_EASED, jaw(6), ANGRY),
    key(1.48, pelvis(0, -0.012), bend(4, 2, 0, -2), jaw(3), ANGRY),
    key(1.75, OPEN_EYES),
  ],
  events: [{ t: 0.92, name: 'cry' }],
};

/** Taking a hit: the head snaps back, the hands jerk up before its face, then it digs back in. */
const hit: Clip = {
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, bend(-12, -6, 0, -20), finUp(14), FLINCH, jaw(7), HURT),
    key(0.18, bend(-5, -2, 0, -9), finUp(6), jaw(3), HURT),
    key(0.34, bend(3, 1, 0, 3), HURT),
    key(0.6, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it settles back onto its heels and curls over its belly, arms folded
 * in and head bowed, eyes shut; from the 'shrink' the curled body shrinks
 * away (Battler3D). It sits back as it curls, as Swampert does (slumped
 * forward, the foe's head falls onto our healthbox).
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, { root: { z: -0.02 } }, bend(-8, -4, 0, -14), finUp(12), jaw(-10), DROWSY),
    key(0.5, sink(-0.04), { root: { z: -0.03 } }, bend(6, 2, 0, 13), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(0.84, sink(-0.065), { root: { z: -0.05, pitch: -2 } }, bend(10, 4, 0, 21), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(0.98, sink(-0.07), { root: { z: -0.05, pitch: -2 } }, bend(11, 5, 0, 22), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
    key(1.6, sink(-0.068), { root: { z: -0.05, pitch: -2 } }, bend(10, 4, 0, 21), CROSSED_LOW, CURL, MOUTH_SHUT, SHUT),
  ],
  events: [{ t: 1.06, name: 'shrink' }],
};

// Attack categories -------------------------------------------------------------

/**
 * Weak contact (Tackle, Facade, Secret Power, Struggle): a shoulder charge.
 * It sinks and turns its right shoulder back, hops in with the head down,
 * lands shoulder-first on the foe driving into it, bounces off and hops home.
 */
const physicalWeak: Clip = {
  name: 'physical_weak',
  duration: 1.26,
  keys: [
    key(0),
    // Wind-up: sinks, the right shoulder draws back (the spine twists; the feet stay put), head lowering.
    key(0.18, pelvis(0, -0.045, -0.02), twist(-14), bend(10, 4, 0, 12), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Launch: the right shoulder drives forward as it hops in, head down.
    key(0.31, { advance: 0.6, root: { y: 0.075 } }, TUCK, twist(14), bend(18, 6, 0, 14), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Body blow: lands shoulder-first on the foe and compresses into it.
    snap(0.41, { advance: 1, root: { pitch: 6 } }, LAND, pelvis(0, -0.03, 0.02), twist(20), bend(22, 8, 0, 14), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    key(0.48, { advance: 1, root: { pitch: 5 } }, LAND, pelvis(0, -0.04, 0.02), twist(17), bend(20, 8, 0, 12), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // Rebounds off the foe in a hop, shaking its head, and carries on home in one flow.
    key(0.62, { advance: 0.72, root: { y: 0.07 } }, HOP, twist(4), bend(8, 2, 0, 0, 7), ANGRY),
    key(0.75, { advance: 0.36, root: { y: 0.075 } }, HOP, bend(6, 0, 0, 0, -5), ANGRY),
    key(0.88, { advance: 0 }, LAND, ANGRY),
    key(1.02, pelvis(0, -0.02), bend(3, 1, 0, 1), ANGRY),
    key(1.26, OPEN_EYES),
  ],
  events: [{ t: 0.42, name: 'impact' }],
};

/**
 * Strong contact (Take Down, Double-Edge, Body Slam, Strength, Return...):
 * the whole mass as a weapon. A long coil with the arms drawn back, a big
 * leap, and it comes down belly-first on the foe, shoves off and hops home.
 */
const physicalStrong: Clip = {
  name: 'physical_strong',
  duration: 2.02,
  keys: [
    key(0),
    // Coil: sinks deep, rears back, arms drawn back.
    key(0.3, pelvis(0, -0.075, -0.02), bend(-8, -6, 0, -10), finUp(12), ARMS_BACK, MOUTH_SHUT, ANGRY),
    key(0.41, pelvis(0, -0.082, -0.025), bend(-9, -6, 0, -12), finUp(14), ARMS_BACK, MOUTH_SHUT, ANGRY),
    // Launch: the arms swing forward and up, the body tips toward the foe.
    snap(0.56, { advance: 0.45, root: { y: 0.2, pitch: 10 } }, TUCK, bend(6, 2, 0, -6), ARMS_SPREAD_UP, jaw(8), ANGRY),
    key(0.69, { advance: 0.8, root: { y: 0.19, pitch: 24 } }, TUCK, bend(12, 4, 0, -4), ARMS_FWD_SPREAD, jaw(10), ANGRY),
    // Crash: belly-first onto the foe.
    fall(0.8, { advance: 1, root: { y: 0.02, pitch: 38 } }, TUCK, bend(16, 6, 0, 2), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    key(0.86, { advance: 1, root: { y: 0, pitch: 40 } }, TUCK, pelvis(0, -0.03), bend(18, 7, 0, 4), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    key(0.96, { advance: 1, root: { y: 0.01, pitch: 33 } }, TUCK, pelvis(0, -0.022), bend(15, 6, 0, 4), ARMS_FWD_SPREAD, MOUTH_SHUT, SQUINT),
    // Shoves off and plants its feet again.
    key(1.12, { advance: 1, root: { pitch: 6 } }, LAND, pelvis(0, -0.03), bend(10, 2, 0, 0), ANGRY),
    key(1.24, { advance: 1 }, LAND, pelvis(0, -0.022), bend(8, 2, 0, 0), ANGRY),
    // Hops home.
    key(1.4, { advance: 0.45, root: { y: 0.08 } }, HOP, ANGRY),
    key(1.54, { advance: 0 }, LAND, pelvis(0, -0.015), ANGRY),
    key(2.02, OPEN_EYES),
  ],
  events: [{ t: 0.81, name: 'impact' }],
};

/** Fists clenched hard at its sides, elbows out (storing up energy). */
const FISTS_AT_SIDES = arms([0.82, -0.52, 0.22], [0.35, -0.9, 0.25], [0.2, -0.95, 0.25]);

/**
 * Bide's storing turns (a two-turn move's first turn plays its clip's
 * `_charge`; the turn it unleashes plays the whole belly crash): it digs into
 * a squat with its fists clenched hard at its sides, teeth gritted and eyes
 * squeezed shut, and shakes with the energy it stores, harder and harder
 * (Swampert's braced guard hold, the gather's shut eyes); it eases back up
 * still glaring at the foe.
 */
const physicalStrongCharge: Clip = {
  name: 'physical_strong_charge',
  duration: 1.5,
  keys: [
    key(0),
    // Digs in: sinks into a squat, the fists clenching at its sides.
    key(0.2, sink(-0.03), bend(8, 3, 0, 6), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, ANGRY),
    snap(0.34, sink(-0.05), bend(12, 4, 0, 10), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    // Storing it up: the whole body shaking, harder and harder (a moving hold).
    key(0.5, sink(-0.052), { root: { roll: 1 } }, bend(12, 4, 0, 10, 2, 1), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    key(0.62, sink(-0.05), { root: { roll: -1.5 } }, bend(13, 4, 0, 11, -2, -1), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    key(0.72, sink(-0.055), { root: { roll: 2 } }, bend(12, 4, 0, 10, 3, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    key(0.8, sink(-0.051), { root: { roll: -2.5 } }, bend(13, 5, 0, 11, -3, -2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    key(0.88, sink(-0.056), { root: { roll: 3 } }, bend(12, 4, 0, 10, 4, 2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    key(0.96, sink(-0.052), { root: { roll: -3 } }, bend(13, 5, 0, 11, -4, -2), FISTS_AT_SIDES, FISTS, MOUTH_SHUT, SQUINT),
    // Eases back up, still glaring, the arms coming up the front into its Y.
    key(1.16, sink(-0.025), bend(5, 2, 0, 3), Y_EASED, MOUTH_SHUT, ANGRY),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'charge' }],
};

/**
 * Weak ranged (Water Gun, Mud Shot, Water Pulse, Hidden Power): a gulp of
 * air, then the head snaps forward and the wide mouth spits.
 */
const specialWeak: Clip = {
  name: 'special_weak',
  duration: 1.12,
  keys: [
    key(0),
    // Breath in: chest up, head back, mouth shut, elbows back.
    key(0.23, pelvis(0, 0.012), bend(-8, -6, 0, -16), finUp(16), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
    // Spit: the head drives forward and down, jaw wide, arms bracing.
    snap(0.32, pelvis(0, -0.018, 0.025), bend(12, 6, 0, 6), SPIT_BRACE, jaw(15), ANGRY),
    // Recoil: the head bobs back up as the mouth closes a little; the arms come back up the front.
    key(0.47, pelvis(0, -0.01, 0.012), bend(6, 3, 0, -4), SPIT_BRACE, jaw(7), ANGRY),
    key(0.66, pelvis(0, -0.004), bend(2, 1, 0, 0), Y_EASED, jaw(2), ANGRY),
    key(1.12, OPEN_EYES),
  ],
  events: [{ t: 0.37, name: 'release' }],
};

/**
 * Strong ranged (Hydro Pump, Ice Beam, Blizzard, Icy Wind): rears up and
 * draws in power at the mouth, then drops into a wide squat brace and fires
 * a sustained blast from its jaws; the recoil pushes it back.
 */
const specialStrong: Clip = {
  name: 'special_strong',
  duration: 2.3,
  keys: [
    key(0),
    key(0.16, sink(-0.018), bend(4, 0, 0, 6)),
    // Gather: rises, chest out, head back, elbows drawn back, eyes shut.
    key(0.53, pelvis(0, 0.018), bend(-11, -7, 0, -20), finUp(22), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    key(0.68, pelvis(0, 0.022), bend(-12, -8, 0, -22, 0, 2), finUp(24), ELBOWS_BACK, MOUTH_SHUT, SHUT),
    // Fire: drops into the brace, the head drives forward, jaw wide.
    snap(0.79, sink(-0.045, 0.012), bend(14, 6, 0, 4), BRACED, jaw(17), ANGRY),
    // Sustain: the recoil pushes it back; a tremor, the head sweeping a little.
    key(0.97, sink(-0.042, 0.006), { root: { z: -0.015 } }, bend(12, 6, 0, 2, 4), BRACED, jaw(15), ANGRY),
    key(1.2, sink(-0.048, 0.004), { root: { z: -0.025 } }, bend(14, 6, 0, 3, -4, -2), BRACED, jaw(18), ANGRY),
    key(1.42, sink(-0.042, 0.003), { root: { z: -0.03 } }, bend(12, 6, 0, 2, 3, 2), BRACED, jaw(14), ANGRY),
    key(1.6, sink(-0.046, 0.002), { root: { z: -0.033 } }, bend(13, 6, 0, 3, -1), BRACED, jaw(16), ANGRY),
    // The mouth closes; it straightens and shakes it off, the arms coming back up the front.
    key(1.78, sink(-0.025), { root: { z: -0.02 } }, bend(4, 2, 0, -4, 6), Y_EASED, jaw(0), ANGRY),
    key(1.93, pelvis(0, -0.012), { root: { z: -0.01 } }, bend(2, 1, 0, -2, -5), ANGRY),
    key(2.3, OPEN_EYES),
  ],
  events: [{ t: 0.11, name: 'charge' }, { t: 0.85, name: 'release' }, { t: 1.66, name: 'releaseEnd' }],
};

/**
 * Self-targeting status (Rain Dance, Hail, Sleep Talk, Curse): curls in, then
 * rears up with its arms flung to the sky and cries (its skin must stay wet:
 * it calls the rain), a moving hold with a tremor. The arms rise up the front
 * and open forward, not out round the sides, and open out into its Y.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.72,
  keys: [
    key(0),
    key(0.29, sink(-0.032), bend(14, 5, 0, 14), CROSSED_CHEST, FISTS, MOUTH_SHUT, SHUT),
    key(0.4, sink(-0.036), bend(16, 6, 0, 16, 0, 1), CROSSED_CHEST, FISTS, MOUTH_SHUT, SHUT),
    key(0.49, sink(-0.016), bend(8, 2, 0, 4), ARMS_RISING, jaw(6), ANGRY),
    snap(0.56, pelvis(0, 0.018), bend(-11, -7, 0, -22), finUp(24), ARMS_ROAR, jaw(14), ANGRY),
    key(0.72, pelvis(0, 0.02), bend(-12, -7, 0, -23, 4, 2), finUp(25), ARMS_UP, jaw(17), ANGRY),
    key(0.92, pelvis(0, 0.02), bend(-12, -7, 0, -23, -4, -2), finUp(25), ARMS_ROAR, jaw(18), ANGRY),
    key(1.04, pelvis(0, 0.02), bend(-11, -7, 0, -22, 0, 1), finUp(24), ARMS_ROAR, jaw(13), ANGRY),
    key(1.19, pelvis(0, -0.005), bend(2, 1, 0, -6), Y_EASED, jaw(4), ANGRY),
    key(1.33, sink(-0.016), bend(6, 2, 0, -2), jaw(2), ANGRY),
    key(1.72, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'aura' }],
};

/** Status aimed at the foe (Growl, Toxic, Snore, Uproar): rears back, then lunges the head in and bellows, arms thrown wide. */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.012), bend(-8, -6, 0, -18), finUp(16), ELBOWS_BACK, MOUTH_SHUT, ANGRY),
    snap(0.31, pelvis(0, -0.025, 0.03), bend(8, 4, 0, -6), ARMS_WIDE, jaw(17), ANGRY),
    key(0.5, pelvis(0, -0.025, 0.03), bend(8, 4, 0, -6, 8, 3), ARMS_WIDE, jaw(18), ANGRY),
    key(0.68, pelvis(0, -0.025, 0.026), bend(7, 4, 0, -6, -8, -3), ARMS_WIDE, jaw(17), ANGRY),
    key(0.86, pelvis(0, -0.012, 0.01), bend(4, 2, 0, -2), jaw(3), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
};

// Motif clips -------------------------------------------------------------------

/**
 * Earthquake (quake): rears up with both fists high overhead, then drops into
 * a crouch and hammers them into the ground at its sides; holds the crouch
 * while the ground heaves. The fists rise and come down the front of the body.
 */
const quake: Clip = {
  name: 'quake',
  duration: 1.76,
  keys: [
    key(0),
    // A small dip before rearing up (anticipation).
    key(0.13, sink(-0.018), bend(8, 2, 0, 6), CURL, MOUTH_SHUT, ANGRY),
    // Rearing up: the fists rise up the front...
    key(0.31, pelvis(0, 0.01, -0.01), bend(-6, -3, 0, -8), ARMS_RISING, FISTS, jaw(4), ANGRY),
    // ...to both fists high overhead, reared tall (a moving hold, still rising).
    key(0.45, pelvis(0, 0.022, -0.02), bend(-13, -6, 0, -17), finUp(20), ARMS_UP, FISTS, jaw(10), ANGRY),
    key(0.54, pelvis(0, 0.027, -0.025), bend(-15, -7, 0, -19), finUp(24), ARMS_UP, FISTS, jaw(11), ANGRY),
    // The hammer: the fists come down in front of the chest as it drops...
    key(0.6, pelvis(0, 0.0, -0.01), bend(-4, -2, 0, -7), ARMS_DOWN_FRONT, FISTS, jaw(8), ANGRY),
    // ...into a crouch, driving both fists into the ground.
    snap(0.66, sink(-0.04), bend(12, 5, 0, 4), QUAKE_HAMMER, FISTS, jaw(7), ANGRY),
    // Squash on impact, then a small rebound.
    key(0.72, sink(-0.048), bend(14, 6, 0, 5), QUAKE_HAMMER, FISTS, jaw(6), ANGRY),
    key(0.86, sink(-0.042), bend(10, 4, 0, 3, 3), QUAKE_HAMMER, FISTS, jaw(6), ANGRY),
    // Holds the crouch while the ground heaves, pressing down (moving hold).
    key(1.04, sink(-0.047), bend(12, 5, 0, 4, -3), QUAKE_HAMMER, FISTS, jaw(4), ANGRY),
    key(1.28, sink(-0.02), bend(6, 2, 0, 0), Y_EASED, CURL, ANGRY),
    key(1.76, OPEN_EYES),
  ],
  events: [{ t: 0.7, name: 'impact' }],
};

/**
 * Muddy Water, Surf (wave); Whirlpool; Rock Tomb, Rock Slide (the rocks
 * heaved up and hurled from both hands): scoops down low with both arms,
 * heaves them up high in front as it rears up (raising the wave), then drives
 * them forward and down: the wave rolls out from its feet.
 */
const wave: Clip = {
  name: 'wave',
  duration: 1.9,
  keys: [
    key(0),
    key(0.3, pelvis(0, -0.04), bend(20, 6, 0, 12), ARMS_SCOOP, MOUTH_SHUT, ANGRY),
    // The heave comes up the front of the body.
    key(0.5, pelvis(0, -0.008), bend(4, 1, 0, -4), ARMS_RISING, jaw(6), ANGRY),
    key(0.65, pelvis(0, 0.018), bend(-12, -7, 0, -19), finUp(22), ARMS_HEAVE_HIGH, jaw(11), ANGRY),
    key(0.77, pelvis(0, 0.02), bend(-13, -7, 0, -20, 0, 2), finUp(24), ARMS_HEAVE_HIGH, jaw(12), ANGRY),
    snap(0.9, pelvis(0, -0.032, 0.03), bend(20, 6, 0, 6), PUSH, jaw(8), ANGRY),
    key(1.1, pelvis(0, -0.036, 0.034), bend(22, 7, 0, 8), PUSH_LOW, jaw(7), ANGRY),
    key(1.35, pelvis(0, -0.016), bend(6, 2, 0, 0), Y_EASED, ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.94, name: 'release' }],
};

/** Protect, Endure, Substitute, Defense Curl, Mirror Coat (shield): digs in behind crossed forearms, eyes squeezed shut. */
const shield: Clip = {
  name: 'shield',
  duration: 1.45,
  keys: [
    key(0),
    // Digs in, the forearms rising in front of the chest.
    key(0.14, pelvis(0, -0.025), bend(6, 2, 0, 4), GUARD_RISING, ANGRY),
    snap(0.29, pelvis(0, -0.048), bend(12, 4, 0, 16), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    // Braces behind the guard: settles deeper and leans into it (moving hold, never frozen).
    key(0.41, pelvis(0, -0.053), bend(13, 4, 0, 17, 0, 1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    key(0.76, pelvis(0, -0.06, 0.012), bend(15, 5, 0, 18, 0, -1), CROSSED_GUARD, MOUTH_SHUT, SQUINT),
    // Lowers the guard, the arms opening back to the stance.
    key(0.94, pelvis(0, -0.04), bend(9, 3, 0, 10), GUARD_RISING, ANGRY),
    key(1.12, pelvis(0, -0.016), bend(3, 1, 0, 2), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'aura' }],
};

/**
 * Mega Punch, DynamicPunch, Ice Punch, Counter (punch): a haymaker. Cocks the
 * right fist far back with the torso turned away, hops in, unwinds hips and
 * shoulders and drives the fist through the foe.
 */
const punch: Clip = {
  name: 'punch',
  duration: 1.44,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.04), bend(10, 2, 0, 4), twist(-20), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.36, { advance: 0.6, root: { y: 0.075 } }, TUCK, bend(8, 2, 0, 2), twist(-22), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    key(0.47, { advance: 1 }, LAND, bend(12, 2, 0, 4), twist(-22), CHAMBER_R, FISTS, MOUTH_SHUT, ANGRY),
    // The punch: hips and shoulders unwind, the fist drives straight at the foe.
    snap(0.54, { advance: 1 }, pelvis(0, -0.03, 0.02), bend(14, 4, 0, 4), twist(20), PUNCH_R, FISTS, jaw(4), ANGRY),
    // Follow-through: the fist carries on, the body leans into it.
    key(0.7, { advance: 1 }, pelvis(0, -0.03, 0.025), bend(16, 4, 0, 4), twist(25), PUNCH_R_THROUGH, FISTS, jaw(3), ANGRY),
    key(0.85, { advance: 1 }, pelvis(0, -0.03), bend(8, 2, 0, 0), ANGRY),
    key(0.99, { advance: 0.45, root: { y: 0.075 } }, HOP, ANGRY),
    key(1.12, { advance: 0 }, LAND, ANGRY),
    key(1.44, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
};

/**
 * Rock Smash (strike): after Blaziken's slash, as Swampert does it. Raises
 * the right hand high behind its head, hops in, and chops down and across.
 */
const strike: Clip = {
  name: 'strike',
  duration: 1.35,
  keys: [
    key(0),
    key(0.18, pelvis(0, -0.032), bend(10, 2, 0, 2), twist(-16), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.32, { advance: 0.55, root: { y: 0.075 } }, TUCK, bend(8, 2, 0, 0), twist(-17), CHOP_RAISED, MOUTH_SHUT, ANGRY),
    key(0.42, { advance: 1 }, LAND, bend(12, 2, 0, 2), twist(-21), CHOP_COCKED, MOUTH_SHUT, ANGRY),
    snap(0.51, { advance: 1 }, pelvis(0.01, -0.036, 0.01), bend(22, 6, 0, 6), twist(16), CHOP_DOWN, jaw(4), ANGRY),
    key(0.66, { advance: 1 }, pelvis(0.012, -0.036, 0.012), bend(23, 6, 0, 6), twist(20), CHOP_DOWN, jaw(3), ANGRY),
    key(0.8, { advance: 1 }, pelvis(0, -0.028), bend(10, 2, 0, 0), ANGRY),
    key(0.93, { advance: 0.45, root: { y: 0.075 } }, HOP, ANGRY),
    key(1.05, { advance: 0 }, LAND, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.57, name: 'impact' }],
};

/**
 * Foresight, Mimic (glare): braces low and leans its chest in, face kept up at
 * the foe, mouth shut, and peers at it with narrowed eyes (a slow head sway),
 * its head fin tipping toward it (the fin senses the foe: the glint is there).
 */
const glare: Clip = {
  name: 'glare',
  duration: 1.22,
  keys: [
    key(0),
    key(0.23, pelvis(0, -0.025, 0.02), bend(12, 4, 0, -6, 0, 6), BRACED, fin(10), MOUTH_SHUT, NARROW),
    key(0.4, pelvis(0, -0.028, 0.025), bend(14, 5, 0, -6, -6, 8), BRACED, fin(14), MOUTH_SHUT, NARROW),
    key(0.67, pelvis(0, -0.032, 0.03), bend(16, 6, 0, -6, 6, 5), BRACED, fin(12), MOUTH_SHUT, NARROW),
    key(0.86, pelvis(0, -0.016, 0.01), bend(5, 2, 0, -2), fin(3), ANGRY),
    key(1.22, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/**
 * Mud Sport (kick_sand): after Blaziken's sand kick, as Swampert does it.
 * Shifts its weight onto the left leg, drags the right foot back through the
 * mud and flings it forward.
 */
const kickSand: Clip = {
  name: 'kick_sand',
  duration: 1.3,
  keys: [
    key(0),
    // The weight goes onto the left leg and the right foot drags back through the mud; the arms lift for balance.
    key(0.23, { plantLeft: 1, plantRight: 0.6 }, pelvis(0.014, -0.032, -0.012), bend(18, 5, 0, 10), twist(-9), MOUTH_SHUT, ANGRY,
      { bones: { thighR: { x: 26 }, shinR: { x: 16 } }, post: { armL: { z: 8 }, armR: { z: -4 } } }),
    // The fling: the foot swings forward and up, the body rocking back over the standing leg.
    snap(0.36, { plantLeft: 1, plantRight: 0 }, pelvis(0.01, -0.026, 0.01), bend(2, 0, 0, -2), twist(9), finUp(4), jaw(5), ANGRY,
      { bones: { thighR: { x: -56 }, shinR: { x: -26 } }, post: { armL: { z: 7 }, armR: { z: -6 } } }),
    key(0.5, { plantLeft: 1, plantRight: 0 }, pelvis(0.008, -0.026, 0.008), bend(5, 1, 0, 0), twist(6), jaw(4), ANGRY,
      { bones: { thighR: { x: -40 }, shinR: { x: -12 } }, post: { armL: { z: 5 }, armR: { z: -4 } } }),
    key(0.7, sink(-0.026), bend(10, 2, 0, 2), ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
};

/**
 * Rest, Refresh (heal): settles down, arms dropping to its sides, eyes closed
 * and the head sinking forward, then slow, deep breaths (a moving hold) while
 * it recovers, and it rises again, the arms lifting back into its Y.
 */
const heal: Clip = {
  name: 'heal',
  duration: 2.0,
  keys: [
    key(0),
    // The arms ease out and drop to its sides as it settles.
    key(0.15, sink(-0.01), bend(4, 2, 0, 3), ELBOWS_OUT, CURL, MOUTH_SHUT, DROWSY),
    key(0.33, sink(-0.04), bend(10, 4, 0, 8), LIMP_ARMS, CURL, MOUTH_SHUT, DROWSY),
    key(0.56, sink(-0.052), bend(14, 6, 0, 12), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    // Slow breaths: the chest rises and falls.
    key(0.86, sink(-0.046), bend(10, 2, 0, 9), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    key(1.16, sink(-0.052), bend(14, 6, 0, 12, 0, 2), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    key(1.44, sink(-0.046), bend(10, 2, 0, 9, 0, -1), LIMP_ARMS, CURL, MOUTH_SHUT, SHUT),
    // Rises again, the arms lifting back into its Y.
    key(1.58, sink(-0.024), bend(4, 1, 0, 0), ELBOWS_OUT, CURL, jaw(2), DROWSY),
    key(1.73, sink(-0.016), bend(2, 0, 0, -2), Y_EASED, jaw(2), DROWSY),
    key(2.0, OPEN_EYES),
  ],
  events: [{ t: 0.82, name: 'aura' }],
};

/** Arms flung wide at chest height, reaching round the foe (a bear hug about to close). */
const HUG_OPEN = arms([0.85, 0.05, 0.52], [0.5, 0.05, 0.86], [0.15, 0.0, 0.99]);
/** The hug closing (a breakdown between HUG_OPEN and HUG). */
const HUG_MID = arms([0.7, -0.03, 0.72], [0.0, 0.05, 1.0], [-0.35, 0.05, 0.94]);
/** Arms locked round the foe's waist, the hands meeting in front of the chest. */
const HUG = arms([0.45, -0.1, 0.89], [-0.55, 0.05, 0.83], [-0.75, 0.1, 0.65]);
/** Hoisting it up against the chest (overhead would carry the foe off the screen). */
const HOIST = arms([0.42, 0.14, 0.9], [-0.4, 0.3, 0.87], [-0.55, 0.3, 0.78]);

/**
 * Seismic Toss (toss): Swampert's sumo bear hug. Squares up with the arms
 * flung wide, a hop in, and the arms close round the foe as it lands chest to
 * chest (grab: from here it rides in the grip, src/battle3d/director.ts).
 * Sinks with it, straining, then heaves it up against its chest (not
 * overhead: the foe would leave the screen) and springs back toward
 * mid-field, spinning round with it; from the top of the leap it hurls it
 * back down into its own place with both arms (throw) and drops into a deep
 * crouch at advance 0.4. The foe crashes there (impact), where both camera
 * views see it, and it hops home. Hands trail the hips by ~0.08 s.
 */
const toss: Clip = {
  name: 'toss',
  duration: 2.48,
  keys: [
    key(0),
    // Squares up: sinks, the arms swinging open wide.
    key(0.2, pelvis(0, -0.055, -0.01), bend(6, 2, 0, 2), HUG_OPEN, MOUTH_SHUT, ANGRY),
    // A hop in, arms spread for the hug.
    key(0.36, { advance: 0.6, root: { y: 0.08 } }, TUCK, bend(6, 2, 0, 0), HUG_OPEN, MOUTH_SHUT, ANGRY),
    // Lands chest to chest with the foe, the arms already closing...
    key(0.47, { advance: 1, root: { z: 0.12 } }, LAND, bend(0, 1, 0, 2), HUG_MID, MOUTH_SHUT, ANGRY),
    // ...and locking round it (grab as the hands meet).
    key(0.58, { advance: 1, root: { z: 0.15 } }, pelvis(0, -0.07), bend(2, 2, 0, -2), HUG, MOUTH_SHUT, ANGRY),
    // Load: sinks into an upright squat with it, straining.
    key(0.72, { advance: 1, root: { z: 0.14 } }, pelvis(0, -0.09), bend(4, 2, 0, 0), HUG, MOUTH_SHUT, SQUINT),
    key(0.85, { advance: 1, root: { z: 0.12 } }, pelvis(0, -0.1), bend(1, 1, 0, 2), HUG, MOUTH_SHUT, SQUINT),
    // Heaves it up against its chest and springs up and back toward mid-field, the back arching.
    key(0.99, { advance: 0.86, root: { y: 0.12, yaw: 35 } }, HOP, pelvis(0, 0.01), bend(-10, -6, 0, -12), finUp(14), HOIST, jaw(7), ANGRY),
    // Spinning round with it in the air.
    key(1.13, { advance: 0.66, root: { y: 0.18, yaw: 200 } }, HOP, pelvis(0, 0.01), bend(-12, -6, 0, -14), finUp(16), HOIST, jaw(8), ANGRY),
    // At the top, facing its place again, leaning back to hurl.
    key(1.24, { advance: 0.48, root: { y: 0.19, yaw: 360 } }, HOP, pelvis(0, 0.01), bend(-16, -8, 0, -17), finUp(22), HOIST, jaw(10), ANGRY),
    // The hurl, still at the top: the whole body folds forward, both arms driving it down at its place.
    snap(1.32, { advance: 0.4, root: { y: 0.18, yaw: 360 } }, HOP, pelvis(0, -0.02), bend(26, 8, 0, 8), HAMMER_DOWN, jaw(14), ANGRY),
    // Drops like a stone and lands deep in the knees, arms still down: watches it crash.
    fall(1.48, { advance: 0.4, root: { yaw: 360 } }, LAND, pelvis(0, -0.08), bend(28, 9, 0, 8), HAMMER_DOWN, jaw(11), ANGRY),
    key(1.57, { advance: 0.4, root: { yaw: 360 } }, LAND, pelvis(0, -0.095), bend(29, 9, 0, 9), HAMMER_DOWN, jaw(13), ANGRY),
    key(1.78, { advance: 0.4, root: { yaw: 360 } }, pelvis(0, -0.06), bend(18, 6, 0, 2), HAMMER_DOWN, jaw(15), ANGRY),
    // Straightens, then a hop home.
    key(1.94, { advance: 0.4, root: { yaw: 360 } }, pelvis(0, -0.03), bend(8, 2, 0, 0), jaw(4), ANGRY),
    key(2.08, { advance: 0.2, root: { y: 0.07, yaw: 360 } }, HOP, ANGRY),
    key(2.2, { advance: 0, root: { yaw: 360 } }, LAND_HOME, ANGRY),
    key(2.48, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.64, name: 'grab' }, { t: 1.35, name: 'throw' }, { t: 1.59, name: 'impact' }],
};

/** Arms swung back behind the body (a diver about to spring). */
const DIVE_BACK = arms([0.55, -0.45, -0.7], [0.4, -0.6, -0.7], [0.25, -0.7, -0.67]);
/** Arms swept forward together past the head (a diver's reach). */
const DIVE_REACH = arms([0.25, 0.6, 0.76], [0.05, 0.7, 0.71], [-0.02, 0.7, 0.71]);
/** Fists drawn in low before the belly (underground, coiled to burst up). */
const FISTS_LOW = arms([0.6, -0.7, 0.38], [-0.2, -0.3, 0.93], [-0.3, -0.25, 0.92]);

/**
 * Dig, Dive (burrow): digging and diving are its line's element. It rears
 * back with the arms swung back, hops and plunges head first into the ground
 * as into water (dig: dirt, or a splash for Dive, bursts up as it goes in),
 * the tail lobes going under last; swims over to the foe underground (the
 * director heaves mounds, or bubbles, along the way), then breaches up in
 * front of it with both fists driving up (impact as it clears the surface),
 * comes down with the arms braced wide, holds the crouch glaring up at it and
 * hops home.
 */
const burrow: Clip = {
  name: 'burrow',
  duration: 2.35,
  keys: [
    key(0),
    // Rears back and sinks, arms swung back (the wind-up before throwing itself forward).
    key(0.22, pelvis(0, -0.032, -0.05), bend(-9, -4, 0, -4), finUp(8), DIVE_BACK, MOUTH_SHUT, ANGRY),
    // The dive: a hop, tipping forward, the arms sweeping forward past the head.
    key(0.38, { advance: 0.06, root: { y: 0.15, pitch: 40 } }, TUCK, pelvis(0, -0.02), bend(-4, -3, 0, -4), DIVE_REACH, MOUTH_SHUT, ANGRY),
    // Plunges in head first (dig: the ground splashes up round it)...
    key(0.5, { advance: 0.1, plantFeet: 0, root: { y: 0.1, pitch: 98 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
    // ...and slides under, the tail lobes last, gathering speed.
    key(0.66, { advance: 0.16, plantFeet: 0, root: { y: -0.95, pitch: 108 } }, pelvis(0, -0.02), bend(-6, -3, 0, -6), DIVE_REACH, MOUTH_SHUT, SHUT),
    // Underground (nothing to stand on): swims over to the foe, turning upright to come up.
    key(0.8, { advance: 0.45, plantFeet: 0, root: { y: -1.3, pitch: 60 } }, pelvis(0, -0.04), bend(6, 2, 0, 0), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
    key(0.96, { advance: 1, plantFeet: 0, root: { y: -1.3 } }, pelvis(0, -0.06), bend(16, 4, 0, 6), FISTS_LOW, FISTS, MOUTH_SHUT, ANGRY),
    // Breaches up in front of the foe, both fists driving up.
    snap(1.1, { advance: 1, plantFeet: 0, root: { y: 0.25 } }, pelvis(0, 0.02), bend(-10, -6, 0, -16), finUp(16), ARMS_UP, FISTS, jaw(14), ANGRY),
    key(1.19, { advance: 0.97, plantFeet: 0, root: { y: 0.28 } }, TUCK, pelvis(0, 0.02), bend(-12, -6, 0, -18), finUp(18), ARMS_UP, FISTS, jaw(15), ANGRY),
    // Comes down in front of it, deep in the knees, arms braced wide, and holds the
    // crouch glaring up at the foe.
    fall(1.35, { advance: 0.9 }, LAND, pelvis(0, -0.065), bend(-2, -1, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.44, { advance: 0.9 }, LAND, pelvis(0, -0.078), bend(0, 0, 0, -8), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    key(1.69, { advance: 0.9 }, pelvis(0, -0.04), bend(2, 1, 0, -6), ARMS_WIDE, MOUTH_SHUT, ANGRY),
    // Hops home.
    key(1.84, { advance: 0.45, root: { y: 0.08 } }, HOP, ANGRY),
    key(1.98, { advance: 0 }, LAND_HOME, ANGRY),
    key(2.35, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'dig' }, { t: 1.05, name: 'impact' }],
};

/** Both hands dug into the mud beside the feet, a little behind them (scooping). */
const SCOOP_DOWN = arms([0.72, -0.68, 0.12], [0.35, -0.92, 0.15], [-0.1, -0.9, 0.42]);
/** Both arms swinging through low in front of the thighs, the hands together (the scoop comes forward here). */
const SWING_LOW = arms([0.3, -0.9, 0.3], [0.0, -0.95, 0.3], [-0.15, -0.9, 0.4]);
/** The heave: both arms swung forward and up at the foe, the hands together (an underhand hurl). */
const HEAVE_FWD = arms([0.3, 0.2, 0.93], [-0.05, 0.5, 0.86], [-0.1, 0.55, 0.83]);
/** The heave carries on up past the face. */
const HEAVE_UP = arms([0.35, 0.65, 0.67], [0.1, 0.85, 0.52], [0.05, 0.9, 0.44]);

/**
 * Mud-Slap (fling): a big two-handed scoop. Drops into a squat and digs both
 * hands into the mud beside its feet, draws the load back by its hips, then
 * heaves it underhand at the foe with both arms, rising out of the squat
 * (release from the hands: + their overlap), and the arms open back out into
 * its Y.
 */
const fling: Clip = {
  name: 'fling',
  duration: 1.26,
  keys: [
    key(0),
    // Drops into a squat and digs both hands into the mud at its sides, face up at the foe.
    key(0.09, sink(-0.012, -0.01), bend(6, 2, 0, 0), ELBOWS_OUT, CURL, MOUTH_SHUT, ANGRY),
    key(0.2, sink(-0.048, -0.025), bend(12, 4, 0, -2), SCOOP_DOWN, CURL, MOUTH_SHUT, ANGRY),
    // Scoops: the load drawn back by the hips, weight back, deeper in the squat.
    key(0.38, sink(-0.064, -0.035), bend(12, 4, 0, -5), ARMS_SCOOP, FISTS, MOUTH_SHUT, ANGRY),
    // Heaves it at the foe: rises out of the squat, both arms swinging through low and up together.
    key(0.43, sink(-0.048, -0.01), bend(6, 2, 0, -5), SWING_LOW, FISTS, MOUTH_SHUT, ANGRY),
    snap(0.5, sink(-0.024, 0.02), bend(-4, -2, 0, -6), finUp(6), HEAVE_FWD, jaw(10), ANGRY),
    // Follow-through: the arms carry on up past the face...
    key(0.63, sink(-0.02, 0.015), bend(-8, -4, 0, -8), finUp(10), HEAVE_UP, jaw(11), ANGRY),
    // ...and open back out into its Y.
    key(0.8, sink(-0.028, 0.01), bend(4, 2, 0, -2), Y_EASED, jaw(6), ANGRY),
    key(0.95, sink(-0.018), bend(5, 2, 0, 0), jaw(3), ANGRY),
    key(1.26, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'release' }],
};

/** A grappler's guard: arms spread wide and forward at chest height, hands open, ready to grab. */
const SUMO_GUARD = arms([0.88, -0.3, 0.38], [0.45, 0.0, 0.89], [0.15, 0.1, 0.98]);
/** The guard rising back into the Y. */
const GUARD_LOWERING = arms([0.9, -0.1, 0.42], [0.45, 0.45, 0.77], [0.25, 0.6, 0.76]);
/** A side-hop's landing: in the knees (the body leans with it: root.roll). */
const SQUASH: Pose = { plantFeet: 1, pelvis: { y: -0.055 }, bones: { spine: { x: 10 }, head: { x: -6 } } };
/** The head held level against the body's lean (+ tips its top to its right). */
const level = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * Double Team (afterimage): short side-hops, a wrestler's shuffle, not a
 * sprinter's dart, quicker than Swampert's: each a low hop to one side and a
 * landing in the knees, the body leaning with it and the head held level, the
 * arms spread in a grappler's guard. The afterimages start at the aura and
 * run 1.4 s (src/battle3d/director.ts).
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.9,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.05), bend(10, 3, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.23, { root: { x: 0.08, y: 0.055, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.34, { root: { x: 0.16, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.46, { root: { x: 0.0, y: 0.06, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.57, { root: { x: -0.12, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.69, { root: { x: 0.0, y: 0.06, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.8, { root: { x: 0.16, roll: -3 } }, SQUASH, level(4), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(0.92, { root: { x: 0.0, y: 0.06, roll: 2 } }, HOP, bend(6, 2, 0, 0, 0, -2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.03, { root: { x: -0.12, roll: 2 } }, SQUASH, level(-6), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    key(1.15, { root: { x: -0.06, y: 0.045, roll: -2 } }, HOP, bend(6, 2, 0, 0, 0, 2), SUMO_GUARD, MOUTH_SHUT, ANGRY),
    // Lands home, the guard already rising back into its Y.
    key(1.26, { root: { x: 0 } }, SQUASH, pelvis(0, -0.008), GUARD_LOWERING, MOUTH_SHUT, ANGRY),
    key(1.48, pelvis(0, -0.032), bend(6, 2, 0, 0), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

// The clips Swampert added since in its first clips' style (../swampert/more.ts).

/** Standing on its left leg, the right knee hauled up high (the stomp loading). */
const KNEE_UP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -62 }, shinR: { x: 50 } } };
/** Springing up off the left leg, the right knee at its highest (lighter than Swampert, it hops into the stomp). */
const KNEE_UP_HOP: Pose = { plantLeft: 0, plantRight: 0, bones: { thighR: { x: -70 }, shinR: { x: 58 }, thighL: { x: -8 }, shinL: { x: 12 } } };
/** The right foot driven down and forward onto the foe. */
const STOMP_R: Pose = { plantLeft: 1, plantRight: 0, bones: { thighR: { x: -40 }, shinR: { x: 6 } } };

/** How high the curled ball's middle sits above its feet (heights). */
const BALL_MID = 0.26;
/**
 * Curled into a ball: knees drawn in, the head tucked, the back rounded, arms
 * wrapped round the knees, the tail lobes folded up over its back and the head
 * fin laid back along it (sticking out, they made the ball a tumbling body).
 */
const BALL: Pose[] = [
  { plantFeet: 0, bones: { thighL: { x: -70 }, thighR: { x: -70 }, shinL: { x: 90 }, shinR: { x: 90 } } },
  bend(30, 14, 0, 32),
  arms([0.45, -0.7, 0.55], [-0.45, -0.35, 0.82], [-0.65, -0.1, 0.75]),
  tail(74, 30),
  fin(-65),
];
/**
 * The ball at advance `a`, rolled to `deg`: the root rides at the ball's
 * middle and the body hangs BALL_MID below it, so root.pitch rolls it about
 * its middle, not its feet.
 */
const ball = (a: number, deg: number, z = 0, lift = 0): Pose[] => [
  { advance: a, root: { y: BALL_MID + lift, z, pitch: deg } }, ...BALL, { pelvis: { y: -BALL_MID } }, MOUTH_SHUT, SHUT,
];

/** The right hand held out to the foe, palm up; the left fist at its side. */
const RIGHT_OUT: [Vec3, Vec3, Vec3] = [[-0.3, -0.2, 0.93], [-0.05, 0.35, 0.94], [0, 0.6, 0.8]];
const BECKON = arms([0.4, -0.88, 0.25], [-0.25, 0.2, 0.95], [-0.3, 0.35, 0.89], RIGHT_OUT);

/**
 * Iron Tail (tail): a coil, then a hop in that turns its back to the foe;
 * both tail lobes whip down and through it as the turn carries on round; it
 * lands in a squat, swings back round and hops home.
 */
const ironTail: Clip = {
  name: 'tail',
  duration: 1.75,
  keys: [
    key(0),
    // Coil, the shoulders turning away.
    key(0.22, sink(-0.055), twist(16), bend(8, 2, 0, 6), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(14)),
    // A hop in, turning its back to the foe, the tail lobes rising high behind it.
    key(0.38, { advance: 0.6, root: { y: 0.1, yaw: 100 } }, TUCK, bend(6, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(42)),
    key(0.5, { advance: 1, root: { y: 0.06, yaw: 168 } }, TUCK, bend(2, 1, 0, 0), ARMS_TUCKED, MOUTH_SHUT, ANGRY, tail(64)),
    // The whip: the body pitches forward and the lobes come down on the foe's body (they trail the hips by
    // 0.06-0.08 s: the impact follows), carrying on down past it as the turn goes on.
    snap(0.59, { advance: 1, root: { y: 0.02, yaw: 198 } }, LAND, bend(8, 3, 0, 4), ARMS_TUCKED, MOUTH_SHUT, SQUINT, tail(12)),
    key(0.7, { advance: 1, root: { yaw: 212 } }, LAND, sink(-0.048), bend(9, 3, 0, 5), ARMS_TUCKED, MOUTH_SHUT, SQUINT, tail(-26)),
    // Swinging back round to face the foe.
    key(0.85, { advance: 0.86, root: { y: 0.065, yaw: 300 } }, HOP, bend(2, 0, 0, 0), ARMS_TUCKED, ANGRY, tail(-8)),
    key(0.97, { advance: 0.8, root: { yaw: 360 } }, LAND, bend(8, 2, 0, 2), ANGRY, tail(0)),
    // Hop home.
    key(1.17, { advance: 0.4, root: { y: 0.08, yaw: 360 } }, HOP, ANGRY),
    key(1.31, { advance: 0, root: { yaw: 360 } }, LAND, ANGRY),
    key(1.75, { root: { yaw: 360 } }, OPEN_EYES),
  ],
  events: [{ t: 0.65, name: 'impact' }],
};

/**
 * Mega Kick, Stomp (kick): a coil and a hop in; at the foe it rears up onto
 * its left leg, hauls its right knee up high, arms out for balance, and
 * stamps the foot down onto the foe with its whole weight; it holds it there,
 * steps back down and hops home.
 */
const kick: Clip = {
  name: 'kick',
  duration: 1.66,
  keys: [
    key(0),
    // Coil.
    key(0.2, sink(-0.055), bend(10, 4, 0, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // A hop in.
    key(0.36, { advance: 0.7, root: { y: 0.09 } }, TUCK, bend(6, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    key(0.47, { advance: 1 }, LAND, bend(8, 2, 0, 2), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    // Rears up on the left leg, the right knee hauled high, and springs up off it.
    key(0.57, { advance: 1 }, KNEE_UP_R, bend(-8, -3, 0, -5), finUp(8), ARMS_WIDE, jaw(7), ANGRY),
    key(0.67, { advance: 1, root: { y: 0.07 } }, KNEE_UP_HOP, bend(-12, -5, 0, -8, 0, 2), finUp(12), ARMS_WIDE, jaw(8), ANGRY),
    // The stomp: drives down onto the foe with its whole weight behind the foot.
    snap(0.76, { advance: 1, root: { pitch: 4 } }, STOMP_R, sink(-0.03, 0.02), bend(10, 3, 0, 6), ARMS_WIDE, MOUTH_SHUT, SQUINT),
    key(0.86, { advance: 1, root: { pitch: 4 } }, STOMP_R, sink(-0.04, 0.02), bend(11, 3, 0, 7, 0, -2), ARMS_WIDE, MOUTH_SHUT, SQUINT),
    // Steps back down.
    key(1.0, { advance: 1 }, LAND, bend(8, 2, 0, 2), ANGRY),
    // Hop home.
    key(1.17, { advance: 0.45, root: { y: 0.08 } }, HOP, ANGRY),
    key(1.31, { advance: 0 }, LAND, ANGRY),
    key(1.66, OPEN_EYES),
  ],
  events: [{ t: 0.78, name: 'impact' }],
};

/**
 * Rollout, Ice Ball (spin): it curls up into a ball and rolls at the foe over
 * and over along the ground, bowls into it and grinds against it, rolls back
 * home and uncurls.
 */
const spin: Clip = {
  name: 'spin',
  duration: 1.9,
  keys: [
    key(0),
    // Curling down.
    key(0.18, sink(-0.06), bend(16, 6, 0, 16), ARMS_TUCKED, MOUTH_SHUT, SQUINT),
    // Rolling at the foe.
    key(0.3, ...ball(0, 30)),
    key(0.45, ...ball(0.3, 220)),
    key(0.58, ...ball(0.66, 420)),
    key(0.67, ...ball(0.9, 560)),
    // Bowls into it and grinds.
    snap(0.72, ...ball(1, 640, 0.3)),
    key(0.81, ...ball(1, 656, 0.3)),
    // Rolls back home.
    key(0.92, ...ball(0.84, 600, 0.1, 0.05)),
    key(1.06, ...ball(0.46, 420)),
    key(1.21, ...ball(0.1, 190)),
    key(1.3, ...ball(0, 90)),
    // Uncurls.
    key(1.42, { advance: 0, root: { pitch: 0 } }, LAND, sink(-0.05), bend(10, 4, 0, 8), ARMS_TUCKED, MOUTH_SHUT, ANGRY),
    key(1.6, sink(-0.024), bend(4, 1, 0, 0, 6, 4), ANGRY),
    key(1.9, OPEN_EYES),
  ],
  events: [{ t: 0.74, name: 'impact' }],
};

/**
 * Swagger, Attract (charm): chest puffed out and head up, it holds a hand out
 * to the foe and beckons twice, smug, then drops back into its stance.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.45,
  keys: [
    key(0),
    key(0.22, sink(0.01), bend(-8, -6, 0, -12, 0, 8), finUp(12), BECKON, jaw(4), ANGRY),
    snap(0.36, sink(0.012), bend(-9, -6, 0, -8, 0, 10), finUp(10), BECKON, CURL, NARROW),
    key(0.49, sink(0.01), bend(-8, -6, 0, -12, 0, 8), finUp(12), BECKON, NARROW),
    snap(0.59, sink(0.012), bend(-9, -6, 0, -8, 0, 10), finUp(10), BECKON, CURL, NARROW),
    key(0.81, sink(0.01), bend(-8, -6, 0, -11, 4, 9), finUp(12), BECKON, jaw(7), NARROW),
    key(1.04, sink(-0.016), bend(4, 1, 0, 0), ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'emit' }],
};

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, physicalStrongCharge, specialWeak, specialStrong, statusSelf, statusTarget,
    quake, wave, shield, punch, strike, glare, kickSand, heal, toss, burrow, fling, afterimage,
    ironTail, kick, spin, charm,
  ].map((c) => [c.name, c]),
);

/** Eye atlas (pm0259_00_Eye1): 2 columns x 4 rows of 128x64 cells. */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  angry: [1, 0],
  half: [0, 1],
  happy: [1, 1],
  closed: [0, 2],
  focus: [1, 2],
  hurt: [0, 3],
};
