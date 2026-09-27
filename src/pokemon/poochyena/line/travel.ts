// How the line gets to the foe and back: a pounce (gather, drive off the
// hind legs, fly stretched out, reach down with the forelegs, land), bounds
// (a gallop: each bound lands and drives off again before the next), and the
// bound home (a spring back off the forelegs, gathered small in the air,
// landing on its spot). Airborne keys free all four legs (AIR) and line the
// rump up behind the chest (kit.straight); landings plant them and sink
// into the legs. Poochyena darts in low and flat; Mightyena first stalks
// (sinks, creeps its weight forward, quivers) and then explodes into a
// longer, higher pounce (kit.stalk, kit.arc, kit.T).

import type { Pose } from '../../../anim/rig';
import { AIR, GROUND, type Kit, type Take, at, body, eyes } from './kit';

/** Attitudes: the head, jaws, ears, tail and hackles of a mood. */
export const fierce = (k: Kit, f = 1): Pose[] => [k.ears(-26 * f), k.tail(16 * f), k.hackles(28 * f), eyes('angry')];
export const furious = (k: Kit): Pose[] => [k.ears(-36), k.tail(28), k.hackles(38), eyes('angry')];
export const wary = (k: Kit): Pose[] => [k.ears(-14), k.tail(8), k.hackles(14), eyes('angry')];
export const calm = (k: Kit): Pose[] => [k.ears(0), k.tail(0), k.hackles(0), eyes('open')];

export interface Pounce {
  /** When it starts (s on the beat): the gather follows. */
  from: number;
  /** Seconds (on the beat) of gathering before it drives off (a stalker adds kit.stalk). */
  gather?: number;
  /** Seconds in the air. */
  flight?: number;
  /** Arc (x kit.arc). */
  arc?: number;
  /** What the head, jaws, ears and tail do on the way (added to every key). */
  act?: Pose[];
  /** Head and jaws in the air (added to the flying keys): a bite flies jaws first, a ram head down. */
  air?: Pose[];
  /** The crouch it gathers in (added to the gather). */
  crouch?: Pose;
  /** The landing (added to the landing key, at the foe). */
  land?: Pose[];
  /** Arrives in the air (a flying ram: the landing key stays airborne, at the foe). */
  flying?: boolean;
  /** Start of travel (for bounds after a first touch-down), default 0. */
  start?: number;
  /** Lands at this advance (a bound that touches down on the way). */
  to?: number;
  /** Skip the stalk (a quick move: Quick-Attack-like darts). */
  quick?: boolean;
}

/**
 * Gather, drive off, fly, reach, land (at the foe unless `to`): adds the
 * keys and returns the landing time (s on the beat).
 */
export function pounce(c: Take, o: Pounce): number {
  const k = c.k;
  const act = o.act ?? fierce(k);
  const air = o.air ?? [];
  const a0 = o.start ?? 0;
  const a1 = o.to ?? 1;
  const span = a1 - a0;
  const arc = k.arc * (o.arc ?? 1);
  let t = o.from;
  const g = o.gather ?? 0.12;
  const stalk = o.quick || a0 > 0 ? 0 : k.stalk;
  if (stalk > 0) {
    // The hunter sinks, creeps its weight forward low over its forepaws, then
    // draws it back onto its haunches, quivering.
    c.key(t + stalk * 0.45, GROUND, at(k, a0), body(k, { y: -0.07 * k.A, z: 0.025, spine: 10, neck: 14, head: -14, rump: 4 }), ...act);
    c.key(t + stalk * 0.8, GROUND, at(k, a0), body(k, { y: -0.08 * k.A, z: -0.01, spine: 9, neck: 14, head: -15, headZ: 1.5, rump: 5 }), ...act);
    t += stalk;
  }
  // Gather: weight back and down on the haunches, the front low, eyes on the foe.
  c.key(t + g, GROUND, at(k, a0), body(k, { y: -0.075 * k.A, z: -0.035, spine: 9, neck: 12, head: -12, rump: 6 }), o.crouch ?? {}, ...act);
  const f = o.flight ?? 0.24;
  // Drive off the hind legs: the forelegs reach out, the rump lines up behind.
  c.snap(t + g + f * 0.28, AIR, at(k, a0 + span * 0.22), { root: { y: arc * 0.62 } }, k.straight, k.legs.push, body(k, { spine: -7, neck: 4, head: -6 }), ...act, ...air);
  // Stretched out at the top of the arc.
  c.key(t + g + f * 0.6, AIR, at(k, a0 + span * 0.6), { root: { y: arc } }, k.straight, k.legs.fly, body(k, { spine: -2, neck: 8, head: -6 }), ...act, ...air);
  const land = t + g + f;
  if (o.flying) return land;
  // Coming down: the forelegs reach for the ground, the hind legs swing under.
  c.key(t + g + f * 0.84, AIR, at(k, a0 + span * 0.9), { root: { y: arc * 0.38 } }, k.legs.reach, body(k, { spine: 5, neck: 2, head: -7 }), ...act, ...air);
  // Land, fronts meeting: the legs take the weight and the head and
  // forequarters draw back off the foe, so the blow that follows snaps in.
  c.key(land, GROUND, at(k, a1), body(k, { y: -0.06 * k.A, z: -0.02, spine: 7, neck: -3, head: -8 }), ...act, ...(o.land ?? []));
  return land;
}

export interface Home {
  /** When it pushes off from the foe (s on the beat). */
  from: number;
  /** The advance it leaves from (1 at the foe). */
  start?: number;
  arc?: number;
  act?: Pose[];
  /** Extra on the hop (a look back, a shake). */
  hop?: Pose[];
  /** How long it takes to settle after landing. */
  settle?: number;
  /** The pose it settles through at home before the stance (defaults to a crouch). */
  end?: Pose[];
}

/**
 * Spring back off the forelegs, gathered small in the air, land on its
 * spot and settle into the stance: adds the keys (the push-off pose is the
 * caller's last key) and returns the clip's end time.
 */
export function boundHome(c: Take, o: Home): number {
  const k = c.k;
  const act = o.act ?? fierce(k, 0.6);
  const a0 = o.start ?? 1;
  const arc = k.arc * (o.arc ?? 0.85);
  const t = o.from;
  c.key(t + 0.13, AIR, at(k, a0 * 0.5), { root: { y: arc } }, k.legs.tuck, body(k, { spine: -5, neck: 2, head: -2 }), ...act, ...(o.hop ?? []));
  c.key(t + 0.27, GROUND, at(k, 0), body(k, { y: -0.05 * k.A, spine: 5, neck: 5, head: -3 }), ...act);
  const s = o.settle ?? 0.26;
  c.key(t + 0.27 + s * 0.45, GROUND, body(k, { y: -0.012, spine: 1, neck: 1 }), ...(o.end ?? act.map((p) => p)));
  c.key(t + 0.27 + s, GROUND, eyes('open'));
  return t + 0.27 + s;
}

/**
 * A gallop's bound: from where it stands at `a0` (planted, gathered), drive
 * off, fly and touch down at `a1`, gathering for the next (planted, the same
 * advance for a beat: the paws never slide). Returns the touch-down time.
 */
export function bound(c: Take, from: number, a0: number, a1: number, o: { flight?: number; arc?: number; act?: Pose[]; air?: Pose[] } = {}): number {
  const k = c.k;
  const act = o.act ?? fierce(k);
  const f = o.flight ?? 0.2;
  const arc = k.arc * (o.arc ?? 0.7);
  c.snap(from + f * 0.35, AIR, at(k, a0 + (a1 - a0) * 0.3), { root: { y: arc * 0.8 } }, k.straight, k.legs.push, body(k, { spine: -6, neck: 4, head: -6 }), ...act, ...(o.air ?? []));
  c.key(from + f * 0.7, AIR, at(k, a0 + (a1 - a0) * 0.72), { root: { y: arc } }, k.straight, k.legs.fly, body(k, { spine: -2, neck: 6, head: -6 }), ...act, ...(o.air ?? []));
  // Touch down, the head still carried as it flies (a charge keeps it down).
  c.key(from + f, GROUND, at(k, a1), body(k, { y: -0.06 * k.A, z: 0.01, spine: 8, neck: 6, head: -6, rump: 3 }), ...act, ...(o.air ?? []));
  // Gathered for the next: the same spot, the weight rocking back onto the haunches.
  c.key(from + f + 0.06, GROUND, at(k, a1), body(k, { y: -0.07 * k.A, z: -0.03, spine: 9, neck: 8, head: -8, rump: 6 }), ...act, ...(o.air ?? []));
  return from + f + 0.06;
}
