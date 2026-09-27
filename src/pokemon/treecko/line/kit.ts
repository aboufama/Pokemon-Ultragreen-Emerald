// The Treecko line's shared choreography: what each species brings to it.
//
// Treecko, Grovyle and Sceptile fight the same way at three sizes: quick,
// springy leaps to the foe, cuts led by the forearm (Treecko's flat hand,
// Grovyle's arm leaves, Sceptile's leaf blades), a heavy leaf tail, grass
// power from the mouth and the hands. The clips in this folder write every
// move and situation once, in Sceptile's time; each species brings a Kit:
//
//   - its STANCE-based keys (a key is STANCE plus deltas, compose()),
//   - its tempo (every time is multiplied by it: Treecko is quicker than
//     Sceptile) and its spring (how high it leaps: Grovyle, the forest
//     ninja, springs highest),
//   - its reach: how far past the engine's striking distance it lands at
//     the foe (root.z, in heights). At advance 1 the attacker's front stops
//     0.15 of its height short of the foe's front: a blow closes that with
//     the landing, the limb reaching past the stance's front and the body
//     driving in,
//   - its own version of every pose the choreography names, posed on its
//     body (bend, twist, tail, the arm positions, the legs, the eyes).
//
// So Grovyle's Leaf Blade is Sceptile's action on Grovyle's stance, timed
// for Grovyle; every clip is reviewed on its own model, and a species
// replaces any clip whose action its body does differently.

import type { Clip, ClipEvent, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose, Vec3 } from '../../../anim/rig';

export type { Pose, Vec3 };
/**
 * One arm: [upper arm, forearm, hand] directions in model space (+X its
 * left, +Y up, +Z forward), and optionally the forearm's twist (degrees; the
 * species' default otherwise: how its blade or leaf is turned).
 */
export type Arm = [arm: Vec3, forearm: Vec3, hand: Vec3, twist?: number];

export const mirror = (v: Vec3): Vec3 => [-v[0], v[1], v[2]];
/** A right arm's position as the left arm's (mirrored across the body). */
export const mirrorArm = (a: Arm): Arm => [mirror(a[0]), mirror(a[1]), mirror(a[2]), a[3] === undefined ? undefined : -a[3]];

/**
 * The arm positions the choreography names, for the right arm (the left
 * mirrors them unless the species gives the left its own).
 */
export const ARM_NAMES = [
  // Stances and guards.
  'stance', 'guard', 'guardLow', 'braced', 'elbowsBack', 'crossed', 'crossedLow', 'spread', 'wide', 'low', 'palmsUp',
  'reach', 'reachFar', 'clawsUp', 'clawsOut', 'flinch', 'back', 'droop', 'flare', 'flex', 'hug', 'shade', 'cover',
  // Cuts, chops and slaps (the forearm edge, or the flat hand, leads).
  'bladeHigh', 'bladeBack', 'cutAcross', 'cutFollow', 'slashEnd', 'slashFollow', 'chopHigh', 'chopDown', 'chopLow',
  'backhandCock', 'backhandEnd', 'rakeWide', 'rakeBack', 'clawHigh', 'clawDown', 'bladesHigh', 'bladesCrossed',
  'risingBlade', 'bladeLow', 'slapHigh', 'slapDown',
  // The elbow driven in (the forearm folded back across the chest), a palm thrust (the hand bent back).
  'elbow', 'palm',
  // Fists.
  'fistHip', 'fistBack', 'punch', 'punchHigh', 'overhand', 'hookBack', 'hook', 'uppercutLow', 'uppercut', 'hammerHigh',
  'hammerDown',
  // Grips, throws, scoops.
  'grabWide', 'clamp', 'carry', 'hoist', 'hurl', 'hurlLow', 'dive', 'scoop', 'sling',
] as const;
export type ArmName = (typeof ARM_NAMES)[number];

/** Leg poses the choreography names (both legs at once, with their foot planting). */
export const LEG_NAMES = [
  // Airborne going forward (leading knee up), hopping (both knees up), legs free reaching down for the ground.
  'tuck', 'hop', 'drop',
  // A deep crouch with the knees out (a sumo's squat); a split stance, one foot forward (a lunge).
  'squat', 'lungeR', 'lungeL',
  // Kicks: the right knee chambered up, the right leg snapped out straight at the foe, a high kick;
  // side-on (the left side to the foe): the left knee chambered across the chest, the leg shot out sideways.
  'kickChamberR', 'kickOutR', 'kickHighR', 'sideChamberL', 'sideKickL',
  // Airborne coming up out of the ground: the right knee up, the left leg trailing.
  'rise',
  // A sumo stomp's raised left knee (out to its side); a foot pawing the ground backward.
  'stompL', 'pawR', 'pawL',
] as const;
export type LegName = (typeof LEG_NAMES)[number];

export interface Kit {
  slug: 'treecko' | 'grovyle' | 'sceptile';
  stance: Pose;
  /** Every time is multiplied by this (1 = Sceptile). */
  tempo: number;
  /** Leap heights (root.y) are multiplied by this. */
  spring: number;
  /** Heights it lands in past the engine's striking distance (root.z at the foe). */
  reach: number;
  /**
   * Further heights a clip lands in at the foe, by clip name: where its blow
   * would stop short on this body (a sweep that stays wide of the foe). Added
   * to every key in proportion to its advance, so the whole leap stretches.
   */
  extraReach?: Record<string, number>;

  /** Spine chain pitch (x) from the hips to the head, with a head turn (+y: its left) and tilt (+z: its right). */
  bend(spine: number, chest: number, neck: number, head: number, headY?: number, headZ?: number): Pose;
  /** Torso twist (+ turns the chest to its left, the right shoulder forward) and lean (+z: to its right). */
  twist(y: number, z?: number): Pose;
  /** The tail: lift (+ raises it) and sweep (+ swings it toward its right), spread along the chain. */
  tail(lift: number, sweep?: number): Pose;
  jaw(deg: number): Pose;

  /** Named arm positions (the right arm; `left` overrides the mirrored ones). */
  right: Record<ArmName, Arm>;
  left: Partial<Record<ArmName, Arm>>;
  /** Both arms from a right and a left arm position. */
  arms(r: Arm, l: Arm): Pose;
  /** Named leg poses. */
  legs: Record<LegName, Pose>;

  /** Hands: curled shut, spread wide, held flat. */
  FISTS: Pose;
  SPLAYED: Pose;
  FLAT: Pose;
  /** Landing: the knees take the weight. Home landings are lighter (upright). */
  LAND: Pose;
  LIGHT: Pose;

  /** Eyes. */
  OPEN: Pose;
  ANGRY: Pose;
  FOCUS: Pose;
  SHUT: Pose;
  DROWSY: Pose;
  HAPPY: Pose;
  HURT: Pose;
  WIDE: Pose;
}

/** Everything the choreography writes clips with, built on a kit. */
export class Line {
  constructor(readonly k: Kit) {}

  key = (t: number, ...d: Pose[]): Keyframe => ({ t, pose: compose(this.k.stance, ...d) });
  /** A snap into this key: fast start, soft stop (strikes). */
  snap = (t: number, ...d: Pose[]): Keyframe => ({ ...this.key(t, ...d), ease: 'out' });
  /** Accelerating into this key (falls, drops). */
  fall = (t: number, ...d: Pose[]): Keyframe => ({ ...this.key(t, ...d), ease: 'in' });

  /**
   * A clip written in Sceptile's time, scaled to the species' tempo (times
   * to a thousandth of a second). `tempo` scales it further.
   */
  clip(name: string, duration: number, keys: Keyframe[], events: ClipEvent[] = [], opts: { loop?: boolean; tempo?: number } = {}): Clip {
    const s = this.k.tempo * (opts.tempo ?? 1);
    const at = (t: number) => Math.round(t * s * 1000) / 1000;
    const extra = this.k.extraReach?.[name] ?? 0;
    const reach = (kf: Keyframe): Keyframe => {
      const a = kf.pose.advance ?? 0;
      if (!extra || !a) return kf;
      return { ...kf, pose: { ...kf.pose, root: { ...(kf.pose.root ?? {}), z: (kf.pose.root?.z ?? 0) + a * extra } } };
    };
    const out: Clip = {
      name,
      duration: at(duration),
      keys: keys.map((kf) => ({ ...reach(kf), t: at(kf.t) })),
      events: events.map((e) => ({ ...e, t: Math.min(at(duration), at(e.t)) })),
    };
    if (opts.loop) out.loop = true;
    return out;
  }

  // Channels.
  pelvis = (x: number, y: number, z = 0): Pose => ({ pelvis: { x, y, z } });
  root = (r: NonNullable<Pose['root']>): Pose => ({ root: r });
  /** Travelled `a` of the way to the foe; at the foe it lands `reach` (+ `extra`) heights further in. */
  at = (a: number, extra = 0): Pose => ({ advance: a, root: { z: a * (this.k.reach + extra) } });
  /** In the air, `y` heights up (times the species' spring). */
  air = (y: number): Pose => ({ root: { y: y * this.k.spring } });
  /** The feet planted one by one (1 planted, 0 free). */
  plant = (left: number, right: number): Pose => ({ plantLeft: left, plantRight: right });

  // Arms.
  arm = (name: ArmName): Arm => this.k.right[name];
  armL = (name: ArmName): Arm => this.k.left[name] ?? mirrorArm(this.k.right[name]);
  /** Both arms in the same named position (the left mirrored). */
  both = (name: ArmName): Pose => this.k.arms(this.arm(name), this.armL(name));
  /** The right arm in one named position, the left in another. */
  arms = (r: ArmName, l: ArmName): Pose => this.k.arms(this.arm(r), this.armL(l));
  /** Arms from positions (for in-betweens made with `mix`). */
  raw = (r: Arm, l: Arm): Pose => this.k.arms(r, l);
  /** An in-between of two arm positions (0 = a, 1 = b), direction by direction. */
  mix = (a: Arm, b: Arm, t: number): Arm => {
    const lerp = (v: Vec3, w: Vec3): Vec3 => {
      const m: Vec3 = [v[0] + (w[0] - v[0]) * t, v[1] + (w[1] - v[1]) * t, v[2] + (w[2] - v[2]) * t];
      const l = Math.hypot(...m) || 1;
      return [m[0] / l, m[1] / l, m[2] / l];
    };
    const tw = a[3] === undefined && b[3] === undefined ? undefined : (a[3] ?? 0) + ((b[3] ?? 0) - (a[3] ?? 0)) * t;
    return [lerp(a[0], b[0]), lerp(a[1], b[1]), lerp(a[2], b[2]), tw];
  };
  legs = (name: LegName): Pose => this.k.legs[name];
}
