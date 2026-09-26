// How a wild Pokémon comes into the battle. The camera holds still (the arena
// never moves), so the Pokémon gets to its spot the way a creature would, by
// place:
//
//   rise  it was hiding in the tall grass, the sand or the sea: it bursts up
//         out of it and drops onto its spot (the intro's entry layer, the
//         grass or waves in front of it, hides where it comes up)
//   leap  it leaps in from beyond the field: down from the rocks, over the
//         pond, from the back of the hall, off a cave's ceiling
//   sink  underwater, it drifts down to the seabed
//
// The body acts it out in the species' `entrance` clip: crouch, spring at the
// `launch` event, tuck in the air, reach down, land at `land`, settle. The
// path is added here as a root offset (Battler3D.rootOffset), so one clip
// serves every place and the path is always a real throw: ballistic, or
// slowed by the water.

import * as THREE from 'three';
import type { Battler3D } from './battler';
import { groundPoint, towardCamera } from './director';
import type { VfxSystem } from './vfx';

export type EntranceKind = 'rise' | 'leap' | 'sink';

export interface Entrance {
  kind: EntranceKind;
  /** rise: what it bursts out of (the spray thrown up). */
  cover?: 'grass' | 'sand' | 'water';
  /**
   * leap, sink: where it starts, in body heights: above its spot, back from
   * it (away from the foe) and to the side (+: screen right for the foe);
   * `hop`: how high it springs up off its perch first.
   */
  from?: { up: number; back: number; side?: number; hop?: number };
  /** Clip speed (it moves slowly through water). */
  speed?: number;
}

/**
 * By arena. A leap starts just out of sight (the foe's feet leave the top of
 * the screen about 1.2 heights up) and is slowed a little, so the fall reads
 * on screen for about 0.4 s, not a blink.
 */
export const ENTRANCES: Record<string, Entrance> = {
  grass: { kind: 'rise', cover: 'grass' },
  long_grass: { kind: 'rise', cover: 'grass' },
  sand: { kind: 'rise', cover: 'sand' },
  water: { kind: 'rise', cover: 'water' },
  pond: { kind: 'leap', from: { up: 1.25, back: 1.1, side: 0.5 }, speed: 0.9 },
  mountain: { kind: 'leap', from: { up: 1.3, back: 1.2, side: 0.6 }, speed: 0.9 },
  building: { kind: 'leap', from: { up: 1.25, back: 1.0, side: 0.5 }, speed: 0.9 },
  // Dropping off the ceiling.
  cave: { kind: 'leap', from: { up: 1.3, back: 0 }, speed: 0.9 },
  underwater: { kind: 'sink', from: { up: 1.6, back: 0.4, side: 0.2 }, speed: 0.6 },
};

export function entranceFor(arena: string): Entrance {
  return ENTRANCES[arena] ?? ENTRANCES.building;
}

/**
 * Rising: how deep it starts (all of it below the ground, the cover hiding
 * where it comes up) and how high it springs above its spot (a little: the
 * foe's head is near the top of the screen).
 */
const RISE = { depth: 1.05, peak: 0.12 };

/**
 * The root offset in body heights (y up, z toward the foe) at clip time `t`,
 * for a clip that leaves the ground at `launch` and lands at `land`. Before
 * the launch it is at its start (below the ground, or off the top of the
 * screen); from the landing on, at its spot.
 */
export function entranceOffset(e: Entrance, launch: number, land: number, t: number, out = new THREE.Vector3()): THREE.Vector3 {
  const T = Math.max(1e-3, land - launch);
  if (t >= land) return out.set(0, 0, 0);
  const tau = Math.max(0, t - launch);
  if (e.kind === 'rise') {
    // Thrown up from below: through the peak and down onto the spot in T.
    const { depth: D, peak: P } = RISE;
    const g = (2 * (Math.sqrt(P + D) + Math.sqrt(P)) ** 2) / (T * T);
    const v = Math.sqrt(2 * g * (P + D));
    return out.set(0, -D + v * tau - (g * tau * tau) / 2, 0);
  }
  const { up, back, side = 0, hop = 0 } = e.from ?? { up: 1.3, back: 0 };
  if (e.kind === 'sink') {
    // Water slows it: it comes down fast and settles gently.
    const k = (1 - tau / T) ** 2;
    return out.set(side * k, up * k, -back * k);
  }
  // A leap: up `hop` off its perch, then falling, carried along evenly.
  const peak = up + hop;
  const g = (2 * (Math.sqrt(hop) + Math.sqrt(peak)) ** 2) / (T * T);
  const v = Math.sqrt(2 * g * hop);
  const k = 1 - tau / T;
  return out.set(side * k, up + v * tau - (g * tau * tau) / 2, -back * k);
}

/** What the place throws up as the Pokémon comes (at `launch`) and lands (`land`). */
export function entranceFx(b: Battler3D, e: Entrance, event: string, vfx: VfxSystem): void {
  const ground = groundPoint(b);
  const H = b.height;
  if (event === 'launch' && e.kind === 'rise') {
    // Out of the cover: a spray of it, flung up and out.
    const sheets = e.cover === 'water' ? ['Splash', 'WaterDroplet'] : e.cover === 'sand' ? ['FlyingDirt', 'SpeedDust'] : ['Leaf', 'Leaf'];
    for (let i = 0; i < 6; i++) {
      vfx.after(i * 0.03, () => {
        const side = i % 2 ? 1 : -1;
        const p = ground.clone().add(new THREE.Vector3(side * H * (0.12 + 0.05 * i), H * 0.05, 0));
        void vfx.sprite(sheets[i % 2], towardCamera(b, p, 0.3), { px: e.cover === 'grass' ? 12 : 22, life: 0.45, spin: e.cover === 'grass' ? side * 5 : 0, velocity: new THREE.Vector3(side * H * 0.35, H * (1.1 - 0.08 * i), 0) });
      });
    }
    if (e.cover === 'water') void vfx.sprite('WaterColumn', towardCamera(b, ground.clone().add(new THREE.Vector3(0, H * 0.3, 0)), 0.3), { px: 40, fps: 12, life: 0.45 });
    else if (e.cover === 'sand') b.stage.ambience?.puff(ground, 1.4, H);
  }
  if (event === 'land') {
    if (e.kind === 'leap') vfx.shake(0.02, 0.14);
    // Water: a splash where it comes down; the seabed: a slow cloud (a soft landing kicks up no dust of its own).
    if (e.kind === 'rise' && e.cover === 'water') void vfx.sprite('Splash', towardCamera(b, ground, 0.3), { px: 30, life: 0.35 });
    if (e.kind === 'sink') b.stage.ambience?.puff(ground, 0.8, H);
  }
  if (event === 'launch' && e.kind === 'sink') {
    // A trail of bubbles as it comes down.
    for (let i = 0; i < 8; i++) {
      vfx.after(i * 0.09, () => {
        const p = b.emitterPoints('body')[0] ?? ground;
        void vfx.sprite('SmallBubbles', towardCamera(b, p.clone().add(new THREE.Vector3((i % 2 ? 1 : -1) * H * 0.2, 0, 0)), 0.3), { px: 14, life: 0.6, velocity: new THREE.Vector3(0, H * 0.5, 0) });
      });
    }
  }
}
