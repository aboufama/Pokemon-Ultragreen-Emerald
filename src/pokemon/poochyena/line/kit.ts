// The Poochyena line's shared choreography (Poochyena, Mightyena): the same
// moves and situations, each built on the species' own stance, proportions,
// timing and temperament from a Kit (src/pokemon/<slug>/kit.ts). A clip is
// never pasted from one species to the other: every key is its STANCE plus
// deltas made by its kit (its neck is one bone or two, its leap is a dart or
// an explosive pounce, its bite a snap or a heavy clamp), timed by its
// beat, and each is reviewed on its own model from both sides.
//
// Conventions (degrees about model axes at bind pose; heights for offsets):
//   bones   spine x + dips the front half; neck/head x + bows them (the
//           snout goes down), - raises them; head y + turns to its left;
//           jaw x + opens; tail x + raises it; hips y swings the rump
//   pelvis  the body's weight over its planted paws (y up, z toward the foe)
//   root    the whole body: y a leap's arc, z a lunge, yaw a spin
//   advance 0 at home .. 1 at the foe; `at(a)` adds the kit's foeZ so two of
//           a kind meet snout to snout at 1 (see the species' FOE_Z)
//   plantFeet / plantFront  hind / front paws pinned (1) or free (0: leaping,
//           rearing, swiping; the legs then follow `post` rotations)
// Legs are posed with `post` rotations about model axes (x + swings a
// hanging leg's foot back, - forward), so every key carries the same
// channels and the curves between keys stay smooth.

import type { Clip, ClipEvent, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';

/** Eye atlas cells every species of the line has. */
export type Eyes = 'open' | 'look' | 'half' | 'closed' | 'happy' | 'angry' | 'hurt';

export interface Kit {
  slug: 'poochyena' | 'mightyena';
  stance: Pose;
  /** Its beat: the line is timed for Poochyena (1); Mightyena's heavier body takes longer. */
  T: number;
  /** How big its acting is (1 Poochyena): the angles of its lunges, rears and shakes. */
  A: number;
  /** How long its head and jaws trail the body (profile.overlap.head): bites and barks land this long after their key. */
  headLag: number;
  /** root.z at the foe (heights; added as advance times this): two of a kind meet snout to snout at advance 1. */
  foeZ: number;
  /** A leap's arc (heights at its top). */
  arc: number;
  /** A stalking hunter (Mightyena) sinks and creeps before it pounces; a pup (0) darts straight in. */
  stalk: number;
  /** Delta that lines the rump up behind the chest (the stance swings it to its left): leaping, it flies straight. */
  straight: Pose;
  /** Lying on its belly: how far the body sinks (heights) and the rump's pitch. */
  lieY: number;
  lieRump: number;
  /** Asleep with its chin on its paws: the neck's pitch (all its bones) and the head's. */
  sleepNeck: number;
  sleepHead: number;
  /** The neck bent (x + down, - up), turned (y) and rolled (z): one bone, or spread over two. */
  neck(x: number, y?: number, z?: number): Pose;
  jaw(deg: number): Pose;
  /** Ears: + pricked forward, - pinned back. */
  ears(deg: number): Pose;
  /** The tail's root raised (x +) and swung (y + to its left), its brush curled (curl +, up). */
  tail(x: number, y?: number, curl?: number): Pose;
  /** Hackles (and Mightyena's mane) bristling (+) or lying flat (-). */
  hackles(deg: number): Pose;
  /** Leg poses in the air (posts; the feet free). */
  legs: {
    /** Driving off the ground: hind legs thrust back, forelegs reaching out. */
    push: Pose;
    /** Stretched out flying at the foe. */
    fly: Pose;
    /** Forelegs reaching down for the ground, hind legs swinging under. */
    reach: Pose;
    /** Gathered small in a hop (bounding home, dodging). */
    tuck: Pose;
    /** Reared on its hind legs: forelegs drawn up in front of the chest. */
    rear: Pose;
    /** Forelegs thrown forward and up, clawing (a swipe's cock, a pounce on the foe's shoulders). */
    paws: Pose;
    /** Lying down: forelegs folded forward under the chest, hind legs folded under the rump. */
    lie: Pose;
  };
}

/** A clip's builder: keys in the kit's beat. */
export class Take {
  readonly keys: Keyframe[] = [];
  readonly events: ClipEvent[] = [];
  constructor(readonly k: Kit) {}
  /** Seconds on the kit's beat. */
  s(t: number): number {
    return Math.round(t * this.k.T * 1000) / 1000;
  }
  key(t: number, ...deltas: Pose[]): this {
    this.keys.push({ t: this.s(t), pose: compose(this.k.stance, ...deltas) });
    return this;
  }
  /** A snap into this key: fast start, soft stop. */
  snap(t: number, ...deltas: Pose[]): this {
    this.keys.push({ t: this.s(t), pose: compose(this.k.stance, ...deltas), ease: 'out' });
    return this;
  }
  /** Accelerating into this key (a drop, a sink). */
  fall(t: number, ...deltas: Pose[]): this {
    this.keys.push({ t: this.s(t), pose: compose(this.k.stance, ...deltas), ease: 'in' });
    return this;
  }
  /** An event at t on the beat, plus a lag in seconds (the head's, a hand's). */
  on(name: string, t: number, lag = 0): this {
    this.events.push({ t: Math.round((this.s(t) + lag) * 1000) / 1000, name });
    return this;
  }
  clip(name: string, extra: Partial<Clip> = {}): Clip {
    const keys = this.keys.slice().sort((a, b) => a.t - b.t);
    return { name, duration: keys[keys.length - 1].t, keys, events: this.events.slice().sort((a, b) => a.t - b.t), ...extra };
  }
}

/** Where along the way to the foe (0 home .. 1 at the foe), with the kit's snout-to-snout offset. */
export const at = (k: Kit, a: number, z = 0): Pose => ({ advance: a, root: { z: k.foeZ * a + z } });

/** The body's weight and bend over its planted paws (heights, degrees). */
export interface Body {
  /** Pelvis: y up, z toward the foe, x its left. */
  y?: number;
  z?: number;
  x?: number;
  /** Front half pitch at the waist and at the chest (+ dips it). */
  spine?: number;
  chest?: number;
  /** Front half turned (+ its left) and rolled (+ its left side down). */
  turn?: number;
  roll?: number;
  /** Rear half: rump pitch (+ raises the rump) and swing (+ to its left). */
  rump?: number;
  rumpY?: number;
  /** Neck pitch (+ down), turn, roll. */
  neck?: number;
  neckY?: number;
  neckZ?: number;
  /** Head pitch (+ down), turn (+ its left), tilt. */
  head?: number;
  headY?: number;
  headZ?: number;
}

export function body(k: Kit, o: Body): Pose {
  return compose(
    {},
    {
      pelvis: { x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0 },
      bones: {
        spine: { x: o.spine ?? 0, y: o.turn ?? 0, z: o.roll ?? 0 },
        chest: { x: o.chest ?? 0 },
        hips: { x: o.rump ?? 0, y: o.rumpY ?? 0 },
        head: { x: o.head ?? 0, y: o.headY ?? 0, z: o.headZ ?? 0 },
      },
    },
    k.neck(o.neck ?? 0, o.neckY ?? 0, o.neckZ ?? 0),
  );
}

/** Expression. */
export const eyes = (e: Eyes): Pose => ({ expression: e });

/** Feet off the ground (both pairs). */
export const AIR: Pose = { plantFeet: 0, plantFront: 0 };
/** All four paws planted. */
export const GROUND: Pose = { plantFeet: 1, plantFront: 1 };
/** Hind paws planted, forepaws off the ground (rearing, swiping, scooping). */
export const HIND: Pose = { plantFeet: 1, plantFront: 0 };

/** Scale a pose's bone angles (degrees) by f: the same shape, bigger or smaller. */
export function scaled(p: Pose, f: number): Pose {
  const out: Pose = structuredClone(p);
  for (const group of [out.bones, out.post]) {
    if (!group) continue;
    for (const r of Object.values(group)) {
      if (r.x !== undefined) r.x *= f;
      if (r.y !== undefined) r.y *= f;
      if (r.z !== undefined) r.z *= f;
    }
  }
  return out;
}

/** Mix two leg poses (posts): a in-between for breakdown keys. */
export function mix(a: Pose, b: Pose, t: number): Pose {
  const out: Pose = { post: {} };
  const names = new Set([...Object.keys(a.post ?? {}), ...Object.keys(b.post ?? {})]);
  for (const n of names) {
    const ra = a.post?.[n] ?? {}, rb = b.post?.[n] ?? {};
    out.post![n] = {
      x: (ra.x ?? 0) * (1 - t) + (rb.x ?? 0) * t,
      y: (ra.y ?? 0) * (1 - t) + (rb.y ?? 0) * t,
      z: (ra.z ?? 0) * (1 - t) + (rb.z ?? 0) * t,
    };
  }
  return out;
}
