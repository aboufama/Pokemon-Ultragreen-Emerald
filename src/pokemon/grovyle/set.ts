// Grovyle's battle animation set, ported from Sceptile's first clips
// (src/pokemon/sceptile/first.ts: the clips the user first saw and loved)
// and the clips added since in their style (sceptile/more.ts). Every clip
// keeps its Sceptile clip's keys, beats, arcs and body action (a springing
// leap to the foe along an arc, the whole body in the strike,
// follow-through, a deep landing, a hop home), re-posed on Grovyle's stance,
// rig and proportions and re-timed for its size. One clip per action its
// moves take; index.ts maps the motifs to them.
//
// Channels used here (as in Sceptile's clips):
//   advance  0..1   how far toward the target a contact move has travelled
//   root     heights: offset/rotation of the whole body (leaps, spins)
//   plantFeet       foot IK weight (0 = the legs are free: airborne)
//   expression      eye atlas cell (open, angry, focus, half, happy, closed, hurt, wide)
// Events: impact, release, releaseEnd, charge, cry, aura, emit, shrink;
// grab and throw (a toss carries the foe between them), dig (a burrow goes
// under).
//
// Grovyle's body against Sceptile's (tools/gauntlet/skeleton.mjs):
//   - one torso bone (Spine_09, a child of the pelvis): the chest's share of
//     a bend goes to it. The stance's forward lean (a forest ninja's, 45
//     degrees) is the pelvis's (./poses.ts), so the torso bends and twists
//     on it as Sceptile's upright torso does: a twist turns it about its own
//     axis rather than swinging the leaning upper body sideways;
//   - one long neck bone (Sceptile's two share its neck bend);
//   - no finger bones (its hands are single bones: no fists, no splayed
//     claws);
//   - the big leaves grow from its forearms and fan back from them (where
//     Sceptile's blades stand): a forearm's twist turns its fan, and every
//     arm position keeps the stance's (right +90, left -90) unless it gives
//     its own;
//   - a two-bone tail, the root and the leaf brush;
//   - an eye atlas like Sceptile's, with a wide-eyed cell besides.
//
// Grovyle is lighter (21.6 kg) and smaller than Sceptile and the springiest
// of the line (it leaps from branch to branch): its clips run at TEMPO of
// Sceptile's time and its leaps to the foe rise SPRING times as high.
//
// The healthboxes are drawn over the Pokémon, so clips at home stay clear of
// them (tools/gauntlet/uiclear.mjs): from our side the foe's box is a few
// pixels above our Grovyle's crown leaf and ours is to its right; a wild
// Grovyle's toes rest near the top edge of ours.

import { Euler, Quaternion, Vector3 } from 'three';
import type { Clip, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { BoneRotation, Pose, Vec3 } from '../../anim/rig';
import { STANCE } from './poses';

/** Grovyle's time: Sceptile's times are multiplied by this. */
const TEMPO = 0.92;
/** Its leaps to the foe and home rise this many times Sceptile's (in its own heights). */
const SPRING = 1.15;

// The leaf fans --------------------------------------------------------------
//
// Each forearm carries a fan of big leaves (a quarter of Grovyle's height
// long), and the rig aims a limb by the shortest turn from where it points,
// then a twist about its new axis (src/anim/rig.ts), so where a fan ends up
// for a given twist depends on the arm's whole path and the torso's bend. A
// key can say where a fan points instead (`fan`): the key turns the forearm
// to it.

const DEG = Math.PI / 180;
/**
 * Grovyle's arms at rest (the T-pose), model space, measured from the model:
 * each bone's axis (toward its child) and where the leaf fan points off the
 * forearm (straight back).
 */
const REST = {
  R: { arm: new Vector3(-0.996, 0.013, -0.087), fore: new Vector3(-0.998, 0.012, 0.06), fan: new Vector3(-0.061, -0.033, -0.998) },
  L: { arm: new Vector3(0.996, 0.013, -0.087), fore: new Vector3(0.998, 0.012, 0.06), fan: new Vector3(0.061, -0.033, -0.998) },
};
const rotation = (r: BoneRotation = {}): Quaternion => new Quaternion().setFromEuler(new Euler((r.x ?? 0) * DEG, (r.y ?? 0) * DEG, (r.z ?? 0) * DEG, 'YXZ'));

/**
 * The forearm twist that turns its leaf fan toward `want` (model space) when
 * the upper arm is aimed along `arm` and the forearm along `fore` under the
 * torso's rotation `torso` (the pelvis's and the torso bone's).
 */
function fanTwist(side: 'L' | 'R', arm: Vec3, fore: Vec3, torso: Quaternion, want: Vec3): number {
  const rest = REST[side];
  const tF = new Vector3(...fore).normalize();
  const q = new Quaternion().setFromUnitVectors(rest.arm.clone().applyQuaternion(torso).normalize(), new Vector3(...arm).normalize()).multiply(torso);
  q.premultiply(new Quaternion().setFromUnitVectors(rest.fore.clone().applyQuaternion(q).normalize(), tF));
  const flat = (v: Vector3) => v.sub(tF.clone().multiplyScalar(v.dot(tF))).normalize();
  const f = flat(rest.fan.clone().applyQuaternion(q));
  const w = flat(new Vector3(...want));
  return Math.atan2(new Vector3().crossVectors(f, w).dot(tF), f.dot(w)) / DEG;
}

/** A pose delta that may also say where each forearm's leaf fan points. */
type Delta = Pose & { fan?: { R?: Vec3; L?: Vec3 } };
/** Where a fan points: straight back behind its forearm (from our side, at the camera), hanging down. */
const BACK: Vec3 = [0, 0, -1];
const DOWN: Vec3 = [0, -1, 0];

/** A key whose forearm twists were turned to fans: quick() unwraps them along the clip. */
type FanKey = Keyframe & { fanned?: ('R' | 'L')[] };
/**
 * A key: STANCE plus deltas (bone rotations and offsets add up, aims
 * replace), each forearm turned so its fan points where the last delta that
 * aims it says.
 */
const key = (t: number, ...deltas: Delta[]): FanKey => {
  const pose = compose(STANCE, ...deltas);
  const fans: { R?: Vec3; L?: Vec3 } = {};
  for (const d of deltas) for (const s of ['R', 'L'] as const) if (d.aim?.[`forearm${s}`]) fans[s] = d.fan?.[s];
  const torso = rotation(pose.bones?.hips).multiply(rotation(pose.bones?.spine));
  const fanned: ('R' | 'L')[] = [];
  for (const s of ['R', 'L'] as const) {
    const want = fans[s], arm = pose.aim?.[`arm${s}`], fore = pose.aim?.[`forearm${s}`];
    if (!want || !arm || !fore) continue;
    fore.twist = Math.round(fanTwist(s, arm.dir, fore.dir, torso, want));
    fanned.push(s);
  }
  return fanned.length ? { t, pose, fanned } : { t, pose };
};
/**
 * The keys with every turned forearm's twist taken the short way round (a
 * twist is an angle: 270 and -90 turn a fan the same way, and the clip moves
 * the numbers between keys): each run of turned keys follows on from the
 * key before it, as a whole a turn either way if that brings it nearer the
 * keys on both sides of it.
 */
function unwrapFans(keys: FanKey[]): Keyframe[] {
  const out: Keyframe[] = keys.map(({ fanned: _, ...k }) => k);
  for (const s of ['R', 'L'] as const) {
    const tw = (i: number) => out[i].pose.aim?.[`forearm${s}`]?.twist;
    const set = (i: number, v: number) => (out[i].pose.aim![`forearm${s}`]!.twist = v);
    const turned = keys.map((k) => !!k.fanned?.includes(s) && tw(keys.indexOf(k)) !== undefined);
    for (let i = 0; i < out.length; i++) {
      if (!turned[i]) continue;
      // A run of turned keys, from i to j.
      let j = i;
      while (j + 1 < out.length && turned[j + 1]) j++;
      const before = i > 0 ? tw(i - 1) : undefined, after = j + 1 < out.length ? tw(j + 1) : undefined;
      for (let n = i; n <= j; n++) {
        const prev = n > i ? tw(n - 1) : before;
        if (prev !== undefined) set(n, tw(n)! - 360 * Math.round((tw(n)! - prev) / 360));
      }
      const jump = (o: number) => Math.max(before === undefined ? 0 : Math.abs(tw(i)! + o - before), after === undefined ? 0 : Math.abs(after - tw(j)! - o));
      const best = [0, -360, 360].reduce((a, b) => (jump(b) < jump(a) ? b : a));
      for (let n = i; n <= j; n++) set(n, tw(n)! + best);
      i = j;
    }
  }
  return out;
}

/** A snap into this key: fast start, soft stop. */
const snap = (t: number, ...deltas: Delta[]): Keyframe => ({ ...key(t, ...deltas), ease: 'out' });
/** Accelerating into this key (falls, sinking). */
const fall = (t: number, ...deltas: Delta[]): Keyframe => ({ ...key(t, ...deltas), ease: 'in' });

/** A time in Sceptile's clip, in Grovyle's (to a thousandth of a second). */
const at = (t: number): number => Math.round(t * TEMPO * 1000) / 1000;
/**
 * A clip written in Sceptile's time, played in Grovyle's. `reach`: how many
 * heights further in it lands at the foe. Sceptile's first clips were made
 * before contact travel stopped a fixed gap short of the foe (at advance 1
 * the fronts are 0.15 of a height apart, src/battle3d/battler.ts
 * STRIKE_GAP), so each blow here lands that much closer for its body to
 * touch the foe's: added to every key in proportion to its advance, the
 * whole leap stretches along its arc.
 */
const quick = (c: Clip, opts: { reach?: number } = {}): Clip => ({
  ...c,
  duration: at(c.duration),
  keys: unwrapFans(c.keys).map((k) => {

    const a = k.pose.advance ?? 0;
    const pose = opts.reach && a ? { ...k.pose, root: { ...(k.pose.root ?? {}), z: (k.pose.root?.z ?? 0) + a * opts.reach } } : k.pose;
    return { ...k, t: at(k.t), pose };
  }),
  events: (c.events ?? []).map((e) => ({ ...e, t: at(e.t) })),
});
/** A leap's height: Sceptile's, times Grovyle's spring. */
const leap = (y: number): number => Math.round(y * SPRING * 1000) / 1000;

// Reusable deltas -----------------------------------------------------------

const ANGRY: Pose = { expression: 'angry' };
const FOCUS: Pose = { expression: 'focus' };
const SHUT: Pose = { expression: 'closed' };
const DROWSY: Pose = { expression: 'half' };
const HAPPY: Pose = { expression: 'happy' };
const HURT: Pose = { expression: 'hurt' };
const OPEN_EYES: Pose = { expression: 'open' };
const jaw = (deg: number): Pose => ({ bones: { jaw: { x: deg } } });
const pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
const root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
const advance = (a: number): Pose => ({ advance: a });
/**
 * How far Grovyle's torso bends forward for one of Sceptile's forward bends
 * of `d` degrees: the same for a small bend, easing off as it grows (its
 * torso already leans 45 degrees in its stance, where Sceptile's stands
 * upright: taken whole, a strike's 40-degree lean laid it flat on its face).
 * Bends back (rearing up) are Sceptile's.
 */
const lean = (d: number): number => (d > 0 ? d * (1 - d / 100) : d);
/**
 * Spine chain pitch (x) from hips to head, with head turn/tilt: the chest's
 * share goes to the one torso bone, and the long neck takes a third of what
 * the torso eases off, carrying the head on into the blow.
 */
const bend = (spine: number, chest: number, neck: number, head: number, headY = 0, headZ = 0): Pose => {
  const d = spine + chest;
  const e = lean(d);
  return { bones: { spine: { x: e }, neck: { x: neck + 0.3 * (d - e) }, head: { x: head, y: headY, z: headZ } } };
};
/** Torso twist about its own axis (+ turns the chest to its left, bringing the right shoulder forward) and lean (+z: to its right). */
const twist = (y: number, z = 0): Pose => ({ bones: { spine: { y, z } } });
/** The tail: lift (+ raises it) and sweep (+ swings it toward its right), spread over the root and the leaf brush. */
const tail = (lift: number, sweep = 0): Pose => ({
  bones: {
    tail: { x: lift * 0.55, y: sweep * 0.55 },
    tail2: { x: lift * 0.45, y: sweep * 0.45 },
  },
});

const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
type Arm = [arm: Vec3, forearm: Vec3, hand: Vec3];
const mirrorArm = (a: Arm): Arm => [mirror(a[0]), mirror(a[1]), mirror(a[2])];
/** The forearm twist that shows the leaf fans (the stance's: the right one hanging, the left one spread). */
const FAN = 90;
/** Both arms: [arm, forearm, hand] directions for the right arm and the left arm; the forearm twists turn the leaf fans. */
const arms = (r: Arm, l: Arm, twistR = FAN, twistL = -FAN): Pose => ({
  aim: {
    armR: { dir: r[0] }, forearmR: { dir: r[1], twist: twistR }, handR: { dir: r[2] },
    armL: { dir: l[0] }, forearmL: { dir: l[1], twist: twistL }, handL: { dir: l[2] },
  },
});
/** The same pose on both arms (given for the right arm, mirrored to the left). */
const both = (r: Arm, twistR = FAN): Pose => arms(r, mirrorArm(r), twistR, -twistR);
/** Arms whose right fan points `fanR` (the left keeps the stance's spread): see "The leaf fans". */
const fanned = (r: Arm, l: Arm, fanR: Vec3): Delta => ({ ...arms(r, l), fan: { R: fanR } });
/**
 * Arms raised or flung wide, as Sceptile's first clips fling them: the left
 * arm takes Sceptile's own position (`wide`, given for the right arm and
 * mirrored) with its leaf fan spread like a wing; the right arm `r` rises
 * in front of the body instead, its fan trailing back behind the forearm
 * (or hanging, `fanR`, where the forearm points ahead). From our side our
 * Grovyle's right arm and fan, flung out to its right, went under our
 * healthbox just right of its shoulder, and a raised forearm turned its fan
 * out that way; the left side has room up to the foe's box. The stance
 * already carries the left arm raised and the right one low.
 */
const lifted = (r: Arm, wide: Arm, fanR: Vec3 = BACK): Delta => fanned(r, mirrorArm(wide), fanR);

/** Guard: both forearms up in front of the chest (the right fan tucked back). */
const GUARD = fanned([[-0.45, -0.45, 0.77], [0.25, 0.65, 0.72], [0.2, 0.9, 0.4]], [[0.45, -0.45, 0.77], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]], BACK);
/** Forearms crossed in front of the face (an X; the right fan tucked back). */
const CROSSED = fanned([[-0.35, -0.3, 0.88], [0.7, 0.45, 0.55], [0.6, 0.7, 0.4]], [[0.35, -0.3, 0.88], [-0.7, 0.5, 0.5], [-0.6, 0.75, 0.3]], BACK);
/** Forearms crossed low in front of the chest (gathering, wind-ups). */
const CROSSED_LOW = fanned([[-0.3, -0.6, 0.74], [0.75, 0.05, 0.66], [0.7, 0.2, 0.68]], [[0.3, -0.6, 0.74], [-0.75, 0.1, 0.65], [-0.7, 0.25, 0.67]], BACK);
/** Arms flung out wide and up, hands open (the right one up in front: see lifted()). */
const SPREAD = lifted([[-0.22, 0.6, 0.77], [-0.1, 0.96, 0.26], [-0.05, 0.99, 0.1]], [[-0.85, 0.35, 0.3], [-0.5, 0.85, 0.2], [-0.3, 0.95, 0.1]]);
/**
 * Braced for a blast: arms low, the left one back at its side, the right
 * one low in front (swung up or back from its side, it passed out under our
 * healthbox from our side).
 */
const BRACED = lifted([[-0.25, -0.85, 0.46], [-0.15, -0.55, 0.82], [-0.1, -0.35, 0.93]], [[-0.45, -0.8, -0.35], [-0.25, -0.5, 0.83], [-0.2, -0.3, 0.93]], DOWN);
/** Drawing breath / rearing: elbows pulled back, chest open. */
const ELBOWS_BACK = lifted([[-0.4, -0.45, -0.8], [-0.2, 0.08, 0.98], [-0.1, 0.1, 0.99]], [[-0.55, -0.42, -0.72], [-0.22, 0.08, 0.97], [-0.1, 0.1, 0.99]], DOWN);
/** Hands raised beside the head (Screech's nails-on-slate; the right one in front: see lifted()). */
const CLAWS_UP = lifted([[-0.22, 0.42, 0.88], [-0.08, 0.92, 0.38], [-0.04, 0.98, 0.2]], [[-0.6, 0.3, 0.74], [-0.25, 0.9, 0.36], [-0.1, 0.98, 0.15]]);
/** Hands thrust at the foe. */
const CLAWS_OUT = lifted([[-0.3, 0.05, 0.95], [-0.18, 0.3, 0.94], [-0.12, 0.45, 0.88]], [[-0.5, 0.05, 0.86], [-0.3, 0.3, 0.9], [-0.2, 0.45, 0.87]], DOWN);
/** Both hands reaching wide at the foe, open (reads in both views; the right one nearer the middle). */
const REACH = lifted([[-0.35, 0.1, 0.93], [-0.2, 0.2, 0.96], [-0.15, 0.3, 0.94]], [[-0.55, 0.05, 0.83], [-0.35, 0.15, 0.92], [-0.3, 0.25, 0.92]], DOWN);
/** Arms open to the sky, palms up (basking; the right one up in front: see lifted()). */
const PALMS_UP = lifted([[-0.28, 0.28, 0.92], [-0.18, 0.66, 0.73], [-0.1, 0.9, 0.42]], [[-0.8, 0.1, 0.55], [-0.6, 0.6, 0.5], [-0.4, 0.85, 0.35]]);
/** Flinching: the arms thrown out. */
const FLINCH = arms([[-0.75, -0.2, 0.6], [-0.35, 0.35, 0.87], [-0.2, 0.6, 0.77]], [[0.7, -0.35, 0.6], [0.35, 0.2, 0.9], [0.2, 0.3, 0.93]]);
/** Both arm leaves raised high behind the head (the X-slash wind-up). */
const BLADES_HIGH = both([[-0.4, 0.75, -0.5], [0.15, 0.95, -0.2], [0.2, 0.9, -0.35]]);
/** Both arm leaves slashed down and across: the forearms cross low in front. */
const BLADES_CROSSED = both([[0.3, -0.5, 0.8], [0.7, -0.55, 0.45], [0.75, -0.55, 0.35]]);
/** Right arm leaf raised high behind the head like a sword, left forearm guarding. */
const BLADE_COCKED: Pose = arms([[-0.55, 0.65, -0.52], [-0.15, 0.96, -0.23], [-0.05, 0.9, -0.43]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]]);

/** Hands curled shut, spread wide: Grovyle's hands are single bones, so these are the arms' work alone. */
const FISTS: Pose = {};
const SPLAYED: Pose = {};

/** Airborne, travelling forward: leading knee up, trailing leg back. */
const TUCK: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.3, -0.4, 0.87] }, shinR: { dir: [-0.15, -0.95, -0.2] },
    thighL: { dir: [0.35, -0.75, -0.55] }, shinL: { dir: [0.15, -0.45, -0.88] },
  },
};
/** Airborne, hopping: both knees drawn up. */
const HOP: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.45, -0.7, 0.55] }, shinR: { dir: [-0.15, -0.93, -0.33] },
    thighL: { dir: [0.45, -0.7, 0.55] }, shinL: { dir: [0.15, -0.93, -0.33] },
  },
};
/** Airborne on a quick side-step, `lift` heights up: the root rises further than the body, so the foot IK folds the legs and lifts both feet level, where they stood. */
const DART = (lift: number): Pose => ({ root: { y: lift }, pelvis: { y: -0.4 * lift } });
/** Airborne with the legs reaching down for the ground (the stance's legs, feet free). */
const DROP: Pose = { plantFeet: 0 };
/** Landing: knees absorb the weight (the torso, already leaning, dips a little less far than Sceptile's). */
const LAND: Pose = { plantFeet: 1, pelvis: { y: -0.045 }, bones: { spine: { x: lean(8) }, head: { x: -6 } } };

// Clips -----------------------------------------------------------------------

/** Breathing in its crouch; the leaf brush sways a little (its spring carries it). */
const idle: Clip = quick({
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.006), { bones: { spine: { x: 1.5 } }, post: { armR: { x: 3 }, armL: { x: -2 } } }, tail(2, 6)),
    key(2.4),
  ],
});

/** Sent out: crouched behind its crossed arms, it springs up with the arms flung wide and a cry, tail raised. */
const intro: Clip = quick({
  name: 'intro',
  duration: 1.5,
  keys: [
    key(0, pelvis(0, -0.06), bend(18, 6, 4, 16), CROSSED, SHUT, tail(-8)),
    key(0.18, pelvis(0, -0.08), bend(22, 8, 6, 20), CROSSED, SHUT, tail(-12)),
    snap(0.38, pelvis(0, 0.015), bend(-12, -8, -8, -24), SPREAD, SPLAYED, jaw(32), ANGRY, tail(35)),
    key(0.58, pelvis(0, 0.012), bend(-11, -8, -8, -22, 3, 4), SPREAD, SPLAYED, jaw(28), ANGRY, tail(32)),
    key(0.78, pelvis(0, 0.014), bend(-12, -8, -8, -23, -3, -4), SPREAD, SPLAYED, jaw(30), ANGRY, tail(30)),
    key(0.96, pelvis(0, 0.008), bend(-8, -5, -4, -14), SPREAD, jaw(6), ANGRY, tail(18)),
    key(1.18, pelvis(0, -0.012), bend(6, 2, 0, 2), ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'cry' }],
});

/**
 * Leaf Blade (weak contact: Pound, Fury Cutter, False Swipe, Aerial Ace,
 * Cut, Rock Smash): the right arm leaf cocked high behind like a sword, a
 * quick leap in, and a slash down and across led by the forearm; the leaf
 * carries through, then a hop home.
 */
const physicalWeak: Clip = quick({
  name: 'physical_weak',
  duration: 1.3,
  keys: [
    key(0),
    // Wind up: crouch, right shoulder back, the leaf raised high behind like a sword.
    key(0.16, pelvis(0, -0.04), twist(-26), bend(8, 0, 0, -6, 14), BLADE_COCKED, FOCUS, tail(8, -12)),
    // Leap along an arc, legs tucked.
    key(0.28, advance(0.55), root({ y: leap(0.08) }), TUCK, twist(-30), bend(6, 0, 0, -6, 16), ANGRY, tail(14, -14),
      arms([[-0.55, 0.68, -0.48], [-0.15, 0.97, -0.2], [-0.05, 0.9, -0.43]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]])),
    // Land in front of the foe, knees taking the weight, the leaf still cocked.
    key(0.38, advance(1), LAND, twist(-30), bend(12, 0, 0, -6, 15), BLADE_COCKED, ANGRY, tail(6, -12)),
    // Slash: the torso unwinds, the forearm sweeps down and across, its leaf leading.
    snap(0.45, advance(1), pelvis(0.012, -0.035), twist(26, -6), bend(20, 4, 0, -6, -8), ANGRY, tail(4, 22),
      arms([[0.45, -0.45, 0.77], [0.8, -0.5, 0.33], [0.85, -0.5, 0.15]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    // Follow-through: the leaf carries on down past its left hip, then hangs there.
    key(0.6, advance(1), pelvis(0.014, -0.032), twist(32, -7), bend(22, 4, 0, -6, -10), ANGRY, tail(2, 28),
      arms([[0.6, -0.65, 0.45], [0.7, -0.7, 0.15], [0.6, -0.8, 0.02]], [[0.5, -0.62, -0.6], [0.2, -0.2, 0.96], [0.2, -0.3, 0.93]])),
    key(0.76, advance(1), pelvis(0, -0.035), twist(8), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 8)),
    // Hop back home.
    key(0.9, advance(0.45), root({ y: leap(0.065) }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.02, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.5, name: 'impact' }],
}, { reach: 0.25 });

/**
 * The tail straight back behind it (the stance sweeps it to its left): Slam
 * brings it down on the foe, not beside it.
 */
const TAIL_BACK: Pose = { bones: { tail: { y: 36 }, tail2: { y: 15 } } };

/**
 * Slam (strong contact with the tail; Body Slam, Iron Tail): coils with the
 * tail up, springs in and turns its back to the foe, hangs at the top of the
 * arc with the leaf-brush tail reared high over its head, whips it down on
 * the foe, lands, and spins back round on the hop home. Grovyle's tail is
 * slimmer and shorter than Sceptile's fern: it rears further, right over its
 * head (the body leaning back under it), so the whip down onto the foe
 * reads, and it comes down straight at the foe.
 */
const physicalStrong: Clip = quick({
  name: 'physical_strong',
  duration: 1.9,
  keys: [
    key(0),
    // Coil: deep crouch, tail lifting behind.
    key(0.24, pelvis(0, -0.08), bend(20, 6, 4, 10), BRACED, FOCUS, tail(30)),
    // Spring up and in, turning its back to the foe.
    key(0.4, advance(0.5), root({ y: leap(0.2), yaw: -80 }), TUCK, bend(4, 2, 0, -6), GUARD, ANGRY, tail(60)),
    // Top of the arc, back to the foe: the tail rears up over its head (a moving hold).
    key(0.52, advance(0.85), root({ y: leap(0.27), yaw: -172, pitch: -8 }), TUCK, bend(-12, -4, 0, -12), SPREAD, ANGRY, tail(118), TAIL_BACK),
    key(0.62, advance(0.92), root({ y: leap(0.26), yaw: -180, pitch: -12 }), TUCK, bend(-14, -5, 0, -14), SPREAD, ANGRY, tail(128), TAIL_BACK),
    // Slam: the body tips away and the tail whips down onto the foe.
    snap(0.72, advance(1), root({ y: 0.1, yaw: -182, pitch: 16 }), DROP, bend(20, 6, 4, 8), BRACED, ANGRY, tail(-18), TAIL_BACK),
    // Land, deep in the knees, the tail on the foe.
    key(0.82, advance(1), root({ yaw: -182 }), LAND, pelvis(0, -0.03), bend(20, 6, 4, 10), BRACED, ANGRY, tail(-22), TAIL_BACK),
    key(1.0, advance(1), root({ yaw: -180 }), pelvis(0, -0.04), bend(12, 4, 2, 4), GUARD, ANGRY, tail(-4)),
    // Hop home, spinning back round to face the foe.
    key(1.18, advance(0.5), root({ y: leap(0.08), yaw: -290 }), HOP, bend(6, 2, 0, 0), GUARD, ANGRY, tail(12)),
    key(1.34, advance(0), root({ yaw: -360 }), LAND, GUARD, ANGRY, tail(4)),
    key(1.9, root({ yaw: -360 }), OPEN_EYES),
  ],
  events: [{ t: 0.8, name: 'impact' }],
}, { reach: 0.6 });

/**
 * Bullet Seed (weak ranged from the mouth; Snore, and Toxic and Leech Seed
 * spat at the foe): a quick breath, then three pecks of the head, a seed each.
 */
const specialWeak: Clip = quick({
  name: 'special_weak',
  duration: 1.25,
  keys: [
    key(0),
    // Breath in: chest up, head back, elbows back.
    key(0.2, pelvis(0, 0.012), bend(-8, -8, -8, -18), ELBOWS_BACK, ANGRY, tail(10)),
    // Three pecks: the head drives forward, jaw wide, and bobs back, each a little further in.
    snap(0.28, pelvis(0, -0.012, 0.004), bend(13, 7, 0, -4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.37, pelvis(0, -0.008, 0.002), bend(7, 4, -2, -10), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.45, pelvis(0, -0.014, 0.004), bend(14, 7, 0, -4, 4), BRACED, jaw(32), ANGRY, tail(3)),
    key(0.54, pelvis(0, -0.009, 0.002), bend(8, 4, -2, -10, 3), BRACED, jaw(12), ANGRY, tail(6)),
    snap(0.62, pelvis(0, -0.016, 0.004), bend(16, 8, 0, -4, -4), BRACED, jaw(34), ANGRY, tail(2)),
    // Recoil: the head bobs back up as the jaw closes.
    key(0.78, pelvis(0, -0.004, 0.001), bend(3, 1, -2, -14), BRACED, jaw(6), ANGRY, tail(7)),
    key(0.96, pelvis(0, -0.003), bend(2, 1, 0, -2), jaw(0), ANGRY, tail(2)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.34, name: 'release' }, { t: 0.51, name: 'release' }, { t: 0.68, name: 'release' }],
});

/**
 * Solar Beam (strong ranged; Hidden Power): it turns its face up to the sun
 * with the arms spread, soaking up light, then braces low and fires the
 * beam from its mouth, holding against the recoil.
 */
const specialStrong: Clip = quick({
  name: 'special_strong',
  duration: 2.4,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.02), bend(4, 0, 0, 6)),
    // Soak up light: rise, face to the sky, arms open, eyes shut.
    key(0.5, pelvis(0, 0.018), bend(-12, -10, -12, -30), SPREAD, SPLAYED, SHUT, tail(25)),
    key(0.66, pelvis(0, 0.022), bend(-13, -11, -13, -32, 0, 2), SPREAD, SPLAYED, SHUT, tail(28)),
    key(0.8, pelvis(0, 0.02), bend(-13, -11, -13, -31, 0, -2), SPREAD, SPLAYED, SHUT, tail(27)),
    // Fire: the head drives forward at the foe, jaw wide; the body braces low.
    snap(0.92, pelvis(0, -0.04, 0.005), bend(16, 10, -2, -8), BRACED, jaw(36), ANGRY, tail(-5)),
    // Sustain: pushed back by the beam, trembling.
    key(1.12, pelvis(0, -0.035, 0.004), root({ z: -0.015 }), bend(14, 8, -2, -6, 3), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.32, pelvis(0, -0.038, 0.004), root({ z: -0.02 }), bend(15, 9, -2, -8, -3, -2), BRACED, jaw(36), ANGRY, tail(-5)),
    key(1.52, pelvis(0, -0.035, 0.004), root({ z: -0.022 }), bend(14, 8, -2, -6, 2, 1), BRACED, jaw(34), ANGRY, tail(-3)),
    key(1.7, pelvis(0, -0.036, 0.004), root({ z: -0.02 }), bend(14, 8, -2, -7), BRACED, jaw(33), ANGRY, tail(-4)),
    // The jaw shuts, the head comes up and shakes it off.
    key(1.88, pelvis(0, -0.015), root({ z: -0.01 }), bend(4, 2, 0, -6, 5), GUARD, jaw(4), ANGRY, tail(4)),
    key(2.02, pelvis(0, -0.008), bend(2, 1, 0, -3, -4), ANGRY, tail(2)),
    key(2.4, OPEN_EYES),
  ],
  events: [{ t: 0.12, name: 'charge' }, { t: 0.98, name: 'release' }, { t: 1.76, name: 'releaseEnd' }],
});

/**
 * Swords Dance (self status; Sleep Talk): blurs from side to side in three
 * quick hops, leaning into each, lands centred and snaps its arms up with an
 * aura. Each hop peaks halfway across, so the body keeps flowing through the
 * air and only stops where it lands; the hops stay low and narrow, zig-zagging
 * back a little (clear of the healthboxes).
 */
const statusSelf: Clip = quick({
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    // Crouch, the hips loading to its left to push off to the right.
    key(0.14, pelvis(-0.02, -0.05), twist(0, 4), bend(12, 4, 2, 6), GUARD, FOCUS, tail(6, -6)),
    key(0.25, root({ x: 0.07, z: -0.025 }), DART(0.06), twist(0, -12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 20)),
    key(0.35, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -4), GUARD, FOCUS, tail(4, 14)),
    key(0.46, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, 12), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, -20)),
    key(0.57, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 4), GUARD, FOCUS, tail(4, -14)),
    key(0.67, root({ x: -0.075, z: -0.015 }), DART(0.055), twist(0, -6), bend(3, 1, 0, 2), GUARD, FOCUS, tail(10, 10)),
    key(0.77, LAND, GUARD, FOCUS, tail(4)),
    // Pose: arm leaves snapped up, chest out; a moving hold with a tremor.
    snap(0.88, pelvis(0, -0.01), bend(-6, -4, -4, -8), SPREAD, ANGRY, tail(20)),
    key(1.02, pelvis(0, -0.013), bend(-7, -4, -4, -9, 0, 1.5), SPREAD, ANGRY, tail(22)),
    key(1.16, pelvis(0, -0.01), bend(-6, -5, -4, -8, 0, -1.5), SPREAD, ANGRY, tail(21)),
    key(1.3, pelvis(0, -0.02), bend(4, 2, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.92, name: 'aura' }],
});

/**
 * Screech (status at the foe; Roar): rears up with its hands raised by its
 * head, then lunges the head forward and screeches, hands out, the head
 * shaking.
 */
const statusTarget: Clip = quick({
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, 0.014), bend(-10, -7, -9, -18), CLAWS_UP, SPLAYED, ANGRY, tail(24)),
    snap(0.3, pelvis(0, -0.022, 0.005), bend(20, 10, 4, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.46, pelvis(0, -0.022, 0.005), bend(21, 11, 4, -4, 8, 4), CLAWS_OUT, SPLAYED, jaw(38), ANGRY, tail(12)),
    key(0.64, pelvis(0, -0.022, 0.005), bend(20, 11, 4, -4, -8, -4), CLAWS_OUT, SPLAYED, jaw(36), ANGRY, tail(8)),
    key(0.8, pelvis(0, -0.02, 0.004), bend(19, 10, 4, -4, 5, 2), CLAWS_OUT, jaw(32), ANGRY, tail(10)),
    key(0.96, pelvis(0, -0.01, 0.002), bend(7, 2, 0, -3), jaw(8), ANGRY, tail(4)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'emit' }],
});

/**
 * Quick Attack (tackle: Pursuit, Double-Edge, Return, Frustration, Facade,
 * Secret Power, Strength, Endeavor, Struggle): a blur-fast low dash with the
 * shoulder leading, a bounce off the foe and a hop home.
 */
const tackle: Clip = quick({
  name: 'tackle',
  duration: 1.05,
  keys: [
    key(0),
    key(0.14, pelvis(0, -0.06), bend(18, 5, 0, -6), ELBOWS_BACK, FOCUS, tail(12)),
    key(0.24, advance(0.7), root({ y: leap(0.05), pitch: 16 }), TUCK, twist(14), bend(24, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(24)),
    snap(0.3, advance(1), root({ y: leap(0.03), pitch: 18 }), TUCK, twist(18), bend(25, 6, 0, -12), ELBOWS_BACK, ANGRY, tail(22)),
    // Bounce off the foe (0.1 s after the blow in its time, as in Sceptile's).
    key(0.41, advance(0.84), root({ y: leap(0.06), pitch: 6 }), HOP, twist(6), bend(8, 2, 0, -6), GUARD, ANGRY, tail(14)),
    key(0.5, advance(0.78), LAND, bend(6, 2, 0, -2), GUARD, ANGRY, tail(6)),
    key(0.64, advance(0.35), root({ y: leap(0.06) }), HOP, GUARD, ANGRY, tail(10)),
    key(0.76, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.05, OPEN_EYES),
  ],
  events: [{ t: 0.31, name: 'impact' }],
}, { reach: 0.16 });

/**
 * Punch (Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter): the
 * right fist chambered at the hip, a leap in, and the fist driven straight
 * at the foe as the hips and shoulders turn into it.
 */
const punch: Clip = quick({
  name: 'punch',
  duration: 1.5,
  keys: [
    key(0),
    // Chamber: crouch, right shoulder back, fist at the hip, left guard forward.
    key(0.2, pelvis(0, -0.05), twist(-22), bend(12, 4, 0, -4, 8), FISTS, FOCUS, tail(10, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.32, advance(0.55), root({ y: leap(0.07) }), TUCK, twist(-30), bend(10, 4, 0, -6, 12), FISTS, ANGRY, tail(16, -10),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    key(0.42, advance(1), LAND, twist(-28), bend(14, 4, 0, -6, 12), FISTS, ANGRY, tail(8, -8),
      arms([[-0.5, -0.66, -0.56], [-0.18, -0.2, 0.96], [-0.1, -0.1, 0.99]], [[0.4, -0.45, 0.8], [-0.25, 0.65, 0.72], [-0.2, 0.9, 0.4]])),
    // Punch: hips and shoulders turn into it, the fist drives straight out.
    snap(0.5, advance(1), pelvis(0, -0.03, 0.03), twist(26), bend(16, 6, 0, -6, -8), FISTS, ANGRY, tail(4, 18),
      arms([[-0.1, 0.02, 0.99], [-0.02, 0.05, 1], [0, 0.05, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    // Follow-through: the arm stays out a moment, the body leaning in.
    key(0.66, advance(1), pelvis(0, -0.032, 0.034), twist(30), bend(18, 6, 0, -6, -9), FISTS, ANGRY, tail(2, 22),
      arms([[-0.08, -0.04, 0.99], [0, -0.02, 1], [0.02, -0.02, 1]], [[0.5, -0.66, -0.56], [0.18, -0.2, 0.96], [0.1, -0.1, 0.99]])),
    key(0.82, advance(1), pelvis(0, -0.035), twist(6), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4, 6)),
    key(0.96, advance(0.45), root({ y: leap(0.065) }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.08, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.54, name: 'impact' }],
}, { reach: 0.07 });

/**
 * Two-leaf X-slash (strong strikes: Brick Break, Crush Claw): both arm
 * leaves raised high, a big leap, and both forearms slash down across each
 * other on the way down; lands deep, hangs, hops home.
 */
const strikeStrong: Clip = quick({
  name: 'strike_strong',
  duration: 1.6,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.07), bend(14, 4, 0, -8), BLADES_HIGH, FOCUS, tail(12)),
    key(0.36, advance(0.55), root({ y: leap(0.16) }), TUCK, bend(-6, -2, 0, -12), BLADES_HIGH, ANGRY, tail(30)),
    key(0.5, advance(0.9), root({ y: leap(0.12) }), TUCK, bend(-8, -3, 0, -14), BLADES_HIGH, ANGRY, tail(34)),
    // X-slash: both forearms cut down and across on the way down.
    snap(0.57, advance(1), root({ y: 0.03 }), DROP, bend(24, 8, 2, 0), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.64, advance(1), LAND, pelvis(0, -0.035), bend(26, 8, 2, 2), BLADES_CROSSED, ANGRY, tail(-10)),
    key(0.82, advance(1), pelvis(0, -0.07), bend(25, 8, 2, 2, 0, 2), BLADES_CROSSED, ANGRY, tail(-6)),
    key(0.98, advance(1), pelvis(0, -0.035), bend(12, 2, 0, -2), GUARD, ANGRY, tail(4)),
    key(1.12, advance(0.45), root({ y: leap(0.065) }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.24, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.6, OPEN_EYES),
  ],
  events: [{ t: 0.62, name: 'impact' }],
}, { reach: 0.22 });

/**
 * Leaf volley (throw: Swift, Rock Tomb): the forearms cross low in front,
 * then whip out and forward, flinging the volley off the arm leaves.
 */
const throwVolley: Clip = quick({
  name: 'throw',
  duration: 1.2,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.045), bend(14, 4, 2, 6), CROSSED_LOW, FOCUS, tail(8)),
    // (The right arm whips out forward at the foe: see lifted().)
    snap(0.3, pelvis(0, -0.02, 0.02), bend(-4, -4, -2, -8), lifted([[-0.3, 0.15, 0.94], [-0.25, 0.25, 0.93], [-0.2, 0.35, 0.91]], [[-0.8, 0.1, 0.6], [-0.7, 0.2, 0.7], [-0.6, 0.3, 0.75]], DOWN), SPLAYED, ANGRY, tail(20)),
    key(0.46, pelvis(0, -0.022, 0.018), bend(-5, -4, -2, -9), lifted([[-0.35, 0.1, 0.93], [-0.3, 0.15, 0.94], [-0.25, 0.25, 0.94]], [[-0.9, 0.05, 0.42], [-0.85, 0.1, 0.5], [-0.8, 0.2, 0.55]], DOWN), SPLAYED, ANGRY, tail(22)),
    key(0.66, pelvis(0, -0.02), bend(4, 1, 0, -2), GUARD, ANGRY, tail(8)),
    key(1.2, OPEN_EYES),
  ],
  events: [{ t: 0.37, name: 'release' }],
});

/** Detect (shield: Protect, Endure, Substitute, Safeguard): the forearms snap into an X before the face; the eyes flash. */
const shield: Clip = quick({
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    key(0.16, pelvis(0, -0.03), bend(8, 2, 0, 6), BRACED, FOCUS, tail(4)),
    snap(0.3, pelvis(0, -0.045), bend(6, 2, 0, 4), CROSSED, FOCUS, tail(12)),
    key(0.46, pelvis(0, -0.05), bend(7, 2, 0, 5, 0, 1), CROSSED, FOCUS, tail(13)),
    key(0.84, pelvis(0, -0.058), bend(10, 3, 1, 7, 0, -1), CROSSED, FOCUS, tail(16)),
    key(1.08, pelvis(0, -0.02), bend(4, 1, 0, 0), GUARD, ANGRY, tail(4)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.36, name: 'aura' }],
});

/** Basking (heal: Rest; weather: Sunny Day): it turns its face up to the light, arms open, eyes shut, swaying calmly. */
const heal: Clip = quick({
  name: 'heal',
  duration: 1.8,
  keys: [
    key(0),
    key(0.3, pelvis(0, 0.012), bend(-10, -8, -12, -26), PALMS_UP, SHUT, tail(15)),
    key(0.56, pelvis(0.006, 0.014), bend(-11, -8, -12, -28, 0, 5), PALMS_UP, SHUT, tail(17, 6)),
    key(0.86, pelvis(-0.006, 0.014), bend(-11, -8, -12, -28, 0, -5), PALMS_UP, SHUT, tail(17, -6)),
    key(1.14, pelvis(0.003, 0.013), bend(-10, -8, -12, -27, 0, 3), PALMS_UP, SHUT, tail(16, 3)),
    key(1.42, pelvis(0, -0.01), bend(3, 1, 0, 2), HAPPY, tail(4)),
    key(1.8, OPEN_EYES),
  ],
  events: [{ t: 0.45, name: 'aura' }],
});

/** Absorb, Mega Drain, Giga Drain (drain): reaches its hands wide at the foe, then draws them to its chest as the energy flows in. */
const drain: Clip = quick({
  name: 'drain',
  duration: 1.4,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.022, 0.004), bend(16, 7, 0, -6), REACH, SPLAYED, ANGRY, tail(6)),
    key(0.34, pelvis(0, -0.024, 0.004), bend(17, 7, 0, -6), REACH, FISTS, ANGRY, tail(8)),
    // Pull the energy in: hands to the chest, back arched, eyes shut.
    key(0.56, pelvis(0, 0.008, -0.012), bend(-10, -7, -6, -18), CROSSED_LOW, FISTS, SHUT, tail(20)),
    key(0.8, pelvis(0, 0.01, -0.012), bend(-11, -7, -6, -19, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(22)),
    key(1.0, pelvis(0, 0.008, -0.01), bend(-10, -7, -6, -18, 0, -2), CROSSED_LOW, SHUT, tail(20)),
    key(1.16, pelvis(0, -0.01), bend(2, 0, 0, -2), OPEN_EYES, tail(6)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.3, name: 'release' }],
});

/** Leer (glare; Mimic; Attract and Swagger, charm): leans in, head low and forward, and stares the foe down with narrowed eyes. */
const glare: Clip = quick({
  name: 'glare',
  duration: 1.3,
  keys: [
    key(0),
    key(0.2, pelvis(0, -0.035, 0.004), bend(18, 7, 10, 14), ANGRY, tail(4)),
    key(0.34, pelvis(0, -0.04, 0.005), bend(20, 7, 11, 16, 0, 4), ANGRY, tail(5)),
    key(0.62, pelvis(0, -0.046, 0.006), bend(23, 8, 12, 17, 4, 8), ANGRY, tail(7)),
    key(0.84, pelvis(0, -0.044, 0.005), bend(21, 7, 11, 16, -2, 5), ANGRY, tail(5)),
    key(1.02, pelvis(0, -0.012), bend(4, 1, 0, 2), ANGRY, tail(2)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'emit' }],
});

/** Knees pushed out wide to the sides, a sumo's squat: in a deep crouch the foot IK folds the legs outward and up. */
const SQUAT: Pose = {
  aim: {
    thighR: { dir: [-0.912, -0.342, -0.228] }, shinR: { dir: [0.646, -0.76, 0.029] },
    thighL: { dir: [0.912, -0.342, -0.228] }, shinL: { dir: [-0.589, -0.606, -0.537] },
  },
};

// (Sceptile's first Earthquake clip is not ported: Grovyle cannot learn a
// quake move, and Mimic, the only way one could reach it, is rare.)

/** Landing home from a hop: LAND with the torso upright, so the settle to the stance is small. */
const LIGHT: Pose = bend(-3, 0, 0, 3);
/** The right arm alone (the left keeps the stance's), its leaf fan pointing `fanR`: see "The leaf fans". */
const rightArm = (r: Arm, fanR: Vec3): Delta => ({ aim: { armR: { dir: r[0] }, forearmR: { dir: r[1], twist: FAN }, handR: { dir: r[2] } }, fan: { R: fanR } });

/** Hands flung open wide for the foe (the toss's rush). */
const GRAB_WIDE = both([[-0.62, 0.02, 0.78], [-0.25, 0.12, 0.96], [-0.12, 0.2, 0.97]]);
/** Forearms clamped round what it holds, low in front. */
const CLAMP = both([[-0.3, -0.45, 0.84], [0.45, -0.1, 0.89], [0.45, 0.02, 0.89]]);
/** Carrying it hugged low in front (not overhead: our Pokémon is near the camera and would leave the screen). */
const CARRY = both([[-0.3, -0.3, 0.9], [0.45, 0.05, 0.89], [0.45, 0.1, 0.88]]);
/** Heaving it up to chest height to hurl it. */
const HOIST = both([[-0.3, 0.1, 0.95], [0.3, 0.45, 0.84], [0.35, 0.4, 0.85]]);
/** Driving it down into the ground in front. */
const HURL = both([[-0.15, -0.5, 0.85], [0.12, -0.78, 0.62], [0.1, -0.85, 0.5]]);
/** ... and following through, the arms pressing on down. */
const HURL_LOW = both([[-0.18, -0.62, 0.76], [0.1, -0.88, 0.46], [0.08, -0.92, 0.38]]);

/**
 * Seismic Toss (toss): a springy dash in with the hands flung open, it
 * clamps on the foe (grab) and presses its tail down to spring off it,
 * leaping up and back toward mid-field with the foe hugged low in front,
 * spinning round with it; then its whole body whips forward and down to
 * hurl the foe back into its own place (throw), where it crashes (impact)
 * while Grovyle lands at advance 0.4 and watches, the tail swishing.
 */
const toss: Clip = quick({
  name: 'toss',
  duration: 2.02,
  keys: [
    key(0),
    // Wind up: a quick crouch, forearms drawn back, tail lifting behind.
    key(0.12, pelvis(0, -0.06), bend(18, 5, 0, -8), ELBOWS_BACK, SPLAYED, FOCUS, tail(14)),
    // Spring in low, pitched forward, hands flung open.
    key(0.26, advance(0.65), root({ y: 0.07, pitch: 12 }), TUCK, bend(16, 4, 0, -12), GRAB_WIDE, SPLAYED, ANGRY, tail(26)),
    // Land at the foe, hands on it.
    key(0.34, advance(1), LAND, bend(16, 4, 0, -10), GRAB_WIDE, SPLAYED, ANGRY, tail(20)),
    // Clamp on low (grab).
    key(0.44, advance(1), pelvis(0, -0.07), bend(22, 6, 0, -12), CLAMP, FISTS, ANGRY, tail(0)),
    // Load: sink deep with it, the tail pressed down to spring off it.
    key(0.54, advance(1), pelvis(0, -0.1), bend(20, 6, 0, -14), CLAMP, FISTS, ANGRY, tail(-20)),
    // Spring up and back, hugging the foe low in front, starting to spin.
    key(0.68, advance(0.84), root({ y: 0.17, yaw: 60 }), HOP, pelvis(0, -0.02), bend(-2, -2, -2, -12), CARRY, FISTS, ANGRY, tail(30)),
    // Spinning round with it at the top, the tail streaming out.
    key(0.81, advance(0.62), root({ y: 0.21, yaw: 228 }), HOP, pelvis(0, -0.02), bend(-4, -3, -2, -14), CARRY, FISTS, ANGRY, tail(36, -16)),
    // Facing its place again, leaning back and heaving it up to hurl.
    key(0.91, advance(0.44), root({ y: 0.21, yaw: 360 }), HOP, pelvis(0, 0), bend(-10, -6, -6, -18), HOIST, FISTS, ANGRY, tail(40, 0)),
    // The hurl: the whole body whips forward and down with it, the tail flicking up.
    snap(0.99, advance(0.4), root({ y: 0.04, yaw: 360 }), DROP, pelvis(0, -0.02), bend(34, 16, 4, 4), HURL, ANGRY, tail(46, 14)),
    // Land deep where it is, arms still down; watch it crash from the crouch, the tail swishing.
    key(1.1, advance(0.4), root({ yaw: 360 }), LAND, pelvis(0, -0.08), bend(30, 12, 2, 2), HURL, ANGRY, tail(14, 10)),
    key(1.32, advance(0.4), root({ yaw: 360 }), LAND, pelvis(0, -0.085), bend(28, 11, 2, 0), HURL_LOW, ANGRY, tail(8, -10)),
    // Straighten into its stance, then hop home.
    key(1.47, advance(0.4), root({ yaw: 360 }), pelvis(0, -0.03), bend(10, 2, 0, 0), ANGRY, tail(4, 6)),
    key(1.6, advance(0.18), root({ y: 0.065, yaw: 360 }), HOP, bend(8, 0, 0, 0), ANGRY, tail(10)),
    key(1.72, advance(0), root({ yaw: 360 }), LAND, LIGHT, ANGRY, tail(2)),
    key(2.02, root({ yaw: 360 }), OPEN_EYES),
  ],
  events: [{ t: 0.4, name: 'grab' }, { t: 1.02, name: 'throw' }, { t: 1.22, name: 'impact' }],
}, { reach: 0.05 });

/** Both arms stretched overhead along the body, the leaves together (a diver's entry). */
const DIVE = both([[-0.15, 0.9, 0.4], [0.1, 0.95, 0.3], [0.12, 0.95, 0.2]]);
/** Right arm leaf driven up through the foe from below, left forearm guarding low. */
const RISING_BLADE = arms([[-0.4, 0.82, 0.42], [-0.2, 0.97, 0.15], [-0.1, 0.95, -0.3]], [[0.45, -0.55, 0.7], [-0.1, 0.4, 0.91], [-0.1, 0.75, 0.65]]);
/** Right arm leaf cocked low for the rising cut, left forearm guarding. */
const BLADE_LOW = arms([[-0.45, -0.75, -0.48], [-0.2, -0.3, 0.93], [-0.1, -0.1, 0.99]], [[0.4, -0.5, 0.77], [-0.2, 0.75, 0.63], [-0.15, 0.95, 0.25]]);
/** Airborne coming up out of the ground: right knee up, left leg trailing. */
const RISING_LEGS: Pose = {
  plantFeet: 0,
  aim: {
    thighR: { dir: [-0.2, 0.2, 0.96] }, shinR: { dir: [-0.12, -0.9, 0.42] },
    thighL: { dir: [0.3, -0.9, -0.3] }, shinL: { dir: [0.15, -0.6, -0.78] },
  },
};

/**
 * Dig (burrow): a springy hop and a head-first dive into the ground, arms
 * overhead and the leaves together (dig: the dirt flies as it goes in, the
 * tail last), a trail of heaving dirt runs to the foe, then it bursts up
 * under it with a rising cut of the right arm leaf, the tail trailing out of
 * the ground (impact as it breaks the surface), drops straight down in front
 * of it, holds the crouch and hops home.
 */
const burrow: Clip = quick({
  name: 'burrow',
  duration: 2.04,
  keys: [
    key(0),
    // Crouch, eyes on the ground ahead, forearms drawn back, the tail loading.
    key(0.12, pelvis(0, -0.09), bend(24, 7, 2, 18), ELBOWS_BACK, FOCUS, tail(16)),
    // Spring up and tip forward, the arms swinging overhead.
    key(0.22, advance(0.04), root({ y: 0.14, pitch: 35 }), TUCK, bend(4, 0, 0, 4), DIVE, ANGRY, tail(24)),
    key(0.3, advance(0.06), root({ y: 0.16, pitch: 75 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(20)),
    // Head and arms into the ground (dig), the body following, gathering speed.
    key(0.38, advance(0.07), root({ y: -0.05, pitch: 108 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(10)),
    fall(0.54, advance(0.1), root({ y: -1.3, pitch: 125 }), DROP, bend(0, 0, 0, 2), DIVE, ANGRY, tail(4)),
    // Underground: tunnel over to the foe, righting itself on the way, and start up under it.
    key(0.7, advance(0.7), root({ y: -1.32, pitch: 60 }), DROP, bend(10, 3, 0, -2), BLADE_LOW, ANGRY, tail(-2)),
    key(0.8, advance(1), root({ y: -1.12, pitch: 20 }), DROP, pelvis(0, -0.06), bend(20, 6, 0, -8), BLADE_LOW, ANGRY, tail(-6)),
    // Burst up under the foe, the right arm leaf cutting up through it, the tail trailing.
    snap(0.92, advance(1), root({ y: 0.24 }), RISING_LEGS, pelvis(0, 0.02), bend(-8, -6, -4, -16), twist(10), RISING_BLADE, ANGRY, tail(-40, 25)),
    key(1.04, advance(0.9), root({ y: 0.28 }), RISING_LEGS, pelvis(0, 0.02), bend(-10, -6, -4, -18), twist(12), RISING_BLADE, ANGRY, tail(-30, 15)),
    // Drop straight down in front of it and hold the crouch, the tail swishing.
    fall(1.2, advance(0.88), LAND, pelvis(0, -0.06), bend(20, 4, 0, -6), GUARD, ANGRY, tail(8, 10)),
    key(1.5, advance(0.88), pelvis(0, -0.03), bend(10, 2, 0, 0), GUARD, ANGRY, tail(4, -8)),
    // Hop home.
    key(1.62, advance(0.44), root({ y: 0.07 }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.74, advance(0), LAND, LIGHT, GUARD, ANGRY, tail(2)),
    key(2.04, OPEN_EYES),
  ],
  events: [{ t: 0.32, name: 'dig' }, { t: 0.85, name: 'impact' }],
});

/**
 * Mud-Slap (fling): it stoops and rakes the ground beside its right foot
 * with its right hand, drags a handful of mud back past its hip, swings it
 * through low and slings it underhand at the foe (release from the right
 * hand, which trails the hips by ~0.08 s), following through with the hand
 * open; the left arm keeps the stance's.
 */
const fling: Clip = quick({
  name: 'fling',
  duration: 1.1,
  keys: [
    key(0),
    // Stoop: the right hand rakes the ground beside its right foot, the tail lifts.
    key(0.14, pelvis(0, -0.08, -0.005), twist(4), bend(24, 6, 0, 14), FOCUS, tail(20),
      rightArm([[-0.42, -0.85, -0.3], [-0.35, -0.9, -0.25], [-0.3, -0.95, -0.1]], BACK), SPLAYED),
    // Scoop: the hand drags back along the ground past the right hip, weight back.
    key(0.24, pelvis(0.01, -0.07, -0.012), twist(-16), bend(20, 5, 0, 4, 6), ANGRY, tail(10),
      rightArm([[-0.35, -0.85, -0.4], [-0.2, -0.85, -0.49], [-0.12, -0.8, -0.59]], BACK), FISTS),
    // Swing: the arm comes through low beside the hip as the torso unwinds.
    key(0.3, pelvis(0, -0.06, 0.002), twist(4), bend(16, 5, 0, 0, 3), ANGRY, tail(6, 6),
      rightArm([[-0.3, -0.9, 0.3], [-0.2, -0.6, 0.77], [-0.12, -0.45, 0.88]], DOWN), FISTS),
    // Sling it: the arm whips forward and up underhand, the hand opening.
    snap(0.36, pelvis(-0.005, -0.035, 0.004), twist(22), bend(10, 5, 0, -8, -4), ANGRY, tail(4, 14),
      rightArm([[-0.2, 0.42, 0.89], [-0.1, 0.66, 0.74], [-0.06, 0.72, 0.69]], BACK), SPLAYED),
    // Follow-through: the hand open high and out at the foe, hanging a moment.
    key(0.5, pelvis(-0.006, -0.034, 0.004), twist(25), bend(11, 5, 0, -8, -5), ANGRY, tail(4, 18),
      rightArm([[-0.22, 0.55, 0.8], [-0.12, 0.78, 0.61], [-0.08, 0.84, 0.54]], BACK), SPLAYED),
    key(0.62, pelvis(-0.005, -0.033, 0.004), twist(24), bend(10, 5, 0, -7, -4), ANGRY, tail(4, 16),
      rightArm([[-0.24, 0.52, 0.82], [-0.14, 0.76, 0.63], [-0.1, 0.82, 0.56]], BACK), SPLAYED),
    key(0.86, pelvis(0, -0.02), twist(6), bend(4, 1, 0, -2), ANGRY, tail(4, 4)),
    key(1.1, OPEN_EYES),
  ],
  events: [{ t: 0.41, name: 'release' }],
});

/**
 * Double Team, Agility (afterimage): low, springy darts from side to side,
 * leaning into each with the tail swinging out as a counterweight, in its
 * fighting stance; the afterimages start at the aura and run 1.4 s
 * (Agility's trail follows the darts). The darts stay narrow and low, the
 * feet tucked under (clear of the healthboxes).
 */
const afterimage: Clip = quick({
  name: 'afterimage',
  duration: 1.6,
  keys: [
    key(0),
    // Load onto its left foot to push off to the right.
    key(0.1, pelvis(0.02, -0.055), twist(0, -5), bend(10, 3, 0, -4), FOCUS, tail(6, 8)),
    // Zig-zagging back a little as it darts.
    key(0.2, root({ x: -0.075, z: -0.015 }), DART(0.065), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.3, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(6, -16)),
    key(0.41, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.52, root({ x: 0.15, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(6, 16)),
    key(0.63, root({ x: 0.0, z: -0.04 }), DART(0.07), twist(0, 12), bend(4, 1, 0, -2), ANGRY, tail(12, -22)),
    key(0.74, root({ x: -0.15, z: -0.03 }), LAND, twist(0, 5), ANGRY, tail(6, -16)),
    key(0.85, root({ x: -0.005, z: -0.04 }), DART(0.065), twist(0, -12), bend(4, 1, 0, -2), ANGRY, tail(12, 22)),
    key(0.96, root({ x: 0.14, z: -0.05 }), LAND, twist(0, -5), ANGRY, tail(6, 16)),
    key(1.06, root({ x: 0.07, z: -0.025 }), DART(0.055), twist(0, 8), bend(3, 1, 0, -2), ANGRY, tail(10, -14)),
    key(1.16, LAND, ANGRY, tail(4, -6)),
    key(1.6, OPEN_EYES),
  ],
  // (0.15 s in its time, as in Sceptile's.)
  events: [{ t: 0.165, name: 'aura' }],
});

/** Both arms flung open high and wide toward the foe, hands spread (Flash's flare; the right one up in front: see lifted()). */
const FLARE = lifted([[-0.22, 0.62, 0.75], [-0.1, 0.93, 0.35], [-0.06, 0.95, 0.3]], [[-0.86, 0.4, 0.32], [-0.64, 0.68, 0.36], [-0.5, 0.8, 0.33]]);

/**
 * Flash (flash): it curls in over its crossed forearms, eyes shut, gathering
 * the sunlight, then flares up tall and throws its arms and leaves open at
 * the foe with the tail fanned high (emit: the screen turns white and both
 * Pokémon black, so the flare is a silhouette), holds the flare and relaxes.
 */
const flash: Clip = quick({
  name: 'flash',
  duration: 1.25,
  keys: [
    key(0),
    // Gather: curl in over the crossed forearms, eyes shut, the tail drawn in low.
    key(0.18, pelvis(0, -0.06), bend(22, 7, 2, 16), CROSSED_LOW, FISTS, SHUT, tail(-8)),
    key(0.34, pelvis(0, -0.07), bend(25, 8, 2, 18, 0, 2), CROSSED_LOW, FISTS, SHUT, tail(-10)),
    // Flare: up tall, chest thrown open, arms and leaves flung wide at the foe.
    snap(0.44, pelvis(0, 0.02, 0.012), bend(-16, -9, -6, -16), FLARE, SPLAYED, jaw(18), ANGRY, tail(40)),
    key(0.6, pelvis(0, 0.018, 0.012), bend(-17, -9, -6, -17, 0, 2), FLARE, SPLAYED, jaw(16), ANGRY, tail(38)),
    key(0.78, pelvis(0, 0.014, 0.01), bend(-15, -9, -6, -15, 0, -2), FLARE, SPLAYED, jaw(10), ANGRY, tail(34)),
    // Relax back into the crouch.
    key(0.98, pelvis(0, -0.015), bend(4, 1, 0, 0), GUARD, ANGRY, tail(6)),
    key(1.25, OPEN_EYES),
  ],
  events: [{ t: 0.46, name: 'emit' }],
});

/** Taking a hit: snaps back and winces (the battler adds a sprung recoil), then shakes it off, its weight back on its heels. */
const hit: Clip = quick({
  name: 'hit',
  duration: 0.6,
  keys: [
    key(0),
    snap(0.05, pelvis(0, 0, -0.015), bend(-14, -6, -6, -18), FLINCH, HURT, tail(12)),
    key(0.2, pelvis(0, 0, -0.02), bend(-6, -2, -2, -8), HURT, tail(6)),
    key(0.36, pelvis(0, 0, -0.012), bend(4, 1, 0, 4), HURT, tail(2)),
    key(0.6, OPEN_EYES),
  ],
});

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it sinks into a squat, knees out, and curls over hugging itself, the
 * long neck bowed and the tail curling round, eyes shut; from the 'shrink'
 * the curled body shrinks away (Battler3D). It sits back over its heels as
 * it curls, clear of our healthbox. (The hold after the shrink keeps
 * Sceptile's length: the shrink takes 0.53 s.)
 */
const faint: Clip = {
  name: 'faint',
  duration: at(1.04) + 0.56,
  keys: unwrapFans([
    key(0),
    key(at(0.18), root({ z: -0.02 }), bend(-8, -4, -4, -12), DROWSY, tail(6)),
    key(at(0.48), pelvis(0, -0.07), root({ z: -0.04 }), SQUAT, bend(12, 5, 8, 16), CROSSED, SHUT, tail(-6, 10)),
    key(at(0.82), pelvis(0, -0.18), root({ z: -0.1 }), SQUAT, bend(22, 10, 16, 24), CROSSED, SHUT, tail(-12, 26)),
    key(at(0.96), pelvis(0, -0.19), root({ z: -0.1 }), SQUAT, bend(24, 11, 17, 26), CROSSED, SHUT, tail(-13, 28)),
    key(at(1.04) + 0.56, pelvis(0, -0.186), root({ z: -0.1 }), SQUAT, bend(23, 10, 16, 25), CROSSED, SHUT, tail(-12, 27)),
  ]),
  events: [{ t: at(1.04), name: 'shrink' }],

};

// The clips added to Sceptile's since, in the first clips' style (sceptile/more.ts).

/**
 * Standing on the left leg, the right knee chambered high at the foe (the
 * kick loading). Grovyle's legs are long and springy: the knee comes up to
 * its chest and the kick rises to the foe's chest, so the leg reads rising
 * at the foe from the front, where a level kick at the camera foreshortens.
 */
const CHAMBER_R: Pose = {
  plantLeft: 1,
  plantRight: 0,
  aim: { thighR: { dir: [-0.18, 0.55, 0.82] }, shinR: { dir: [-0.1, -0.55, -0.83] } },
};
/** The right leg snapped out straight into the foe. */
const KICK_R: Pose = {
  plantLeft: 1,
  plantRight: 0,
  aim: { thighR: { dir: [-0.12, 0.36, 0.93] }, shinR: { dir: [-0.08, 0.42, 0.9] } },
};

/**
 * Mega Kick (kick): a coil, a leap in along an arc, and a landing in front
 * of the foe; it chambers its right knee high, leans back and snaps the leg
 * out straight into the foe, holds it there a beat, draws it back and hops
 * home.
 */
const kick: Clip = quick({
  name: 'kick',
  duration: 1.5,
  keys: [
    key(0),
    // Coil.
    key(0.16, pelvis(0, -0.045), bend(10, 2, 0, -6), GUARD, FOCUS, tail(10)),
    // Leap along an arc, legs tucked.
    key(0.3, advance(0.55), root({ y: leap(0.09) }), TUCK, bend(6, 0, 0, -8), GUARD, ANGRY, tail(16)),
    // Land in front of the foe.
    key(0.42, advance(1), LAND, bend(10, 2, 0, -6), GUARD, ANGRY, tail(6)),
    // Chamber: the knee up high, the body leaning back to load it.
    key(0.52, advance(1), CHAMBER_R, pelvis(0, -0.01), bend(-6, -4, 0, -10), GUARD, ANGRY, tail(14)),
    // The kick: the leg snaps out straight into the foe.
    snap(0.59, advance(1), KICK_R, pelvis(0, -0.005, 0.02), bend(-16, -8, 0, -6), GUARD, ANGRY, tail(24)),
    key(0.72, advance(1), KICK_R, pelvis(0, -0.006, 0.022), bend(-17, -8, 0, -7, 0, 2), GUARD, ANGRY, tail(22)),
    // Drawn back and down.
    key(0.84, advance(1), CHAMBER_R, pelvis(0, -0.01), bend(-4, -2, 0, -6), GUARD, ANGRY, tail(12)),
    key(0.96, advance(1), LAND, bend(10, 2, 0, -2), GUARD, ANGRY, tail(6)),
    // Hop home.
    key(1.1, advance(0.45), root({ y: leap(0.065) }), HOP, bend(8, 0, 0, 0), GUARD, ANGRY, tail(10)),
    key(1.22, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.5, OPEN_EYES),
  ],
  events: [{ t: 0.6, name: 'impact' }],
}, { reach: 0.2 });

/**
 * Crunch (bite): the head drawn back with the jaws parting, a leap in, and
 * on the landing the long neck drives the open jaws into the foe and snaps
 * them shut; it shakes its head with its grip, lets go and hops home.
 */
const bite: Clip = quick({
  name: 'bite',
  duration: 1.4,
  keys: [
    key(0),
    // Head back, jaws parting.
    key(0.14, pelvis(0, -0.04), bend(-4, -4, -6, -16), jaw(10), GUARD, ANGRY, tail(8)),
    // Leap in.
    key(0.28, advance(0.6), root({ y: leap(0.08) }), TUCK, bend(4, 0, -6, -16), jaw(14), GUARD, ANGRY, tail(14)),
    // Land, the jaws wide, the head drawn right back.
    key(0.38, advance(1), LAND, bend(0, -4, -8, -20), jaw(32), GUARD, ANGRY, tail(8)),
    // The lunge: the neck drives the open jaws into the foe...
    snap(0.45, advance(1), pelvis(0, -0.03, 0.016), bend(22, 10, 12, 10), jaw(36), BRACED, ANGRY, tail(2)),
    // ...and they snap shut on it.
    key(0.5, advance(1), pelvis(0, -0.032, 0.018), bend(24, 10, 12, 12), jaw(1), BRACED, ANGRY, tail(2)),
    // Shaking its grip.
    key(0.62, advance(1), pelvis(0, -0.03, 0.016), bend(22, 10, 12, 10, 10), jaw(2), BRACED, ANGRY, tail(4, 10)),
    key(0.72, advance(1), pelvis(0, -0.03, 0.016), bend(23, 10, 12, 11, -10), jaw(2), BRACED, ANGRY, tail(4, -10)),
    // Lets go.
    key(0.84, advance(1), pelvis(0, -0.035), bend(10, 4, 0, 0), jaw(10), GUARD, ANGRY, tail(6)),
    // Hop home.
    key(0.98, advance(0.45), root({ y: leap(0.065) }), HOP, bend(8, 0, 0, 0), jaw(0), GUARD, ANGRY, tail(10)),
    key(1.1, advance(0), LAND, GUARD, ANGRY, tail(2)),
    key(1.4, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'impact' }],
}, { reach: 0.3 });

/**
 * Mud Sport (kick_sand): it turns its shoulder, sweeps its leaf-brush tail
 * low along the ground, then whips it up and over to fling the mud at the
 * foe (the mud leaves the tail's brush), and settles.
 */
const kickSand: Clip = quick({
  name: 'kick_sand',
  duration: 1.3,
  keys: [
    key(0),
    // The tail sweeps low along the ground, the head turned back to the foe
    // (the shoulder turns a little less than Sceptile's: its guard swung under our healthbox).
    key(0.18, pelvis(0, -0.03), twist(-10), bend(10, 2, 0, -4, 9), GUARD, FOCUS, tail(-24, -30)),
    key(0.3, pelvis(0, -0.035), twist(-12), bend(12, 2, 0, -4, 10), GUARD, FOCUS, tail(-28, -40)),
    // The whip: up and over, flinging the mud at the foe.
    snap(0.4, pelvis(0, -0.02), twist(14, -2), bend(2, 0, 0, -8, -6), GUARD, ANGRY, tail(70, 20)),
    key(0.54, pelvis(0, -0.018), twist(18, -3), bend(0, 0, 0, -8, -8), GUARD, ANGRY, tail(80, 26)),
    // Settling.
    key(0.8, pelvis(0, -0.02), twist(4), bend(6, 2, 0, -2), GUARD, ANGRY, tail(14, 6)),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.44, name: 'emit' }],
});

/**
 * DragonBreath (breath): a long breath in, chest up and head back; then the
 * head drives forward, jaws wide, and it breathes a sustained stream at the
 * foe, braced, the head swaying with it; it closes its jaws and settles.
 */
const breath: Clip = quick({
  name: 'breath',
  duration: 1.7,
  keys: [
    key(0),
    // Breath in.
    key(0.22, pelvis(0, 0.012), bend(-8, -8, -8, -18), ELBOWS_BACK, SHUT, tail(10)),
    key(0.42, pelvis(0, 0.016), bend(-10, -9, -9, -20), ELBOWS_BACK, SHUT, tail(12)),
    // The head drives forward: the stream.
    snap(0.52, pelvis(0, -0.02, 0.01), bend(14, 8, 2, -4), BRACED, jaw(34), ANGRY, tail(4)),
    key(0.72, pelvis(0, -0.022, 0.012), bend(15, 8, 2, -5, 5), BRACED, jaw(32), ANGRY, tail(3, 6)),
    key(0.92, pelvis(0, -0.02, 0.01), bend(14, 8, 2, -4, -5), BRACED, jaw(34), ANGRY, tail(3, -6)),
    // Jaws close, the head recoils.
    key(1.08, pelvis(0, -0.006), bend(3, 1, -2, -12), BRACED, jaw(6), ANGRY, tail(8)),
    key(1.3, pelvis(0, -0.003), bend(2, 1, 0, -2), GUARD, jaw(0), ANGRY, tail(2)),
    key(1.7, OPEN_EYES),
  ],
  events: [{ t: 0.55, name: 'release' }, { t: 1.06, name: 'releaseEnd' }],
});

/** Grovyle's clips: the moments, the category clips and a clip per action its moves take, by name. */
export const GROVYLE_CLIPS: Record<string, Clip> = Object.fromEntries(
  [
    idle, intro, hit, faint,
    physicalWeak, physicalStrong, specialWeak, specialStrong, statusSelf, statusTarget,
    tackle, punch, strikeStrong, throwVolley, drain, shield, heal, glare,

    toss, burrow, fling, afterimage, flash,
    kick, bite, kickSand, breath,
  ].map((c) => [c.name, c]),
);

/**
 * Eye atlas (the model's eye texture): 4 x 2 expressions, each a pair of
 * cells (one per eye). The eye mesh maps the open pair (bottom row, first
 * pair), so each expression is given relative to it, in pairs.
 */
export const GROVYLE_EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  happy: [1, 0],
  angry: [2, 0],
  hurt: [3, 0],
  closed: [0, -1],
  focus: [1, -1],
  half: [2, -1],
  wide: [3, -1],
};
