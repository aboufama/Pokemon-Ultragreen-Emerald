// The cocoon stage of the Wurmple line (Silcoon, Cascoon): their shared
// choreography. A cocoon has no limbs, so every action is the whole body:
// it hops, tips, wobbles, topples and leans, and its eyes (the atlas cells
// in the silk opening) and its silk strands (on springs) do the rest. Each
// species builds these clips on its own stance and character (timing for
// its weight, how far it tips and hops, its eyes' moods, its own touches:
// Silcoon's watchful glances and hanging sway, Cascoon's motionless glare
// and Shed Skin), and reviews them on its own model.
//
// Channels:
//   root     y hops, x steps aside, z lunges, pitch tips it forward (+) or
//            back (-), roll tips it to its right (+) or left (-): the body
//            pivots on the strands it stands on
//   bones    spine and head bend the soft body (x forward, z to its right):
//            a lean, a nod, a hunch
//   scale    a swell (breathing, puffing up) or a tensed shrink
//   advance  0 at home, 1 in front of the foe (contact moves)
//   expression  open, half (a watchful squint, a glare), closed, happy,
//            squeeze (shut tight)
//
// How it travels: it gathers with a hop in place, then springs in an arc
// and throws itself into the foe, tipped forward (the landing is the blow),
// bounces back off it and hops home, wobbling as it lands. The strands
// quiver on their springs all the way.

import type { Clip, ClipEvent, Keyframe } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';

export interface CocoonCharacter {
  /** Its stance (poses.ts). */
  stance: Pose;
  /** Time scale: 1 for Silcoon (light, quick), more for a heavier cocoon. */
  tempo: number;
  /** How far it hops and tips, relative to Silcoon's (1). */
  bounce: number;
  /** Silcoon keeps watch: quick glances with a watchful squint in its idle and on guard. */
  watchful: boolean;
}

/** A clip's keys and events on a species' stance, in its own time. */
export function cocoonKit(c: CocoonCharacter) {
  const T = (t: number) => Math.round(t * c.tempo * 1000) / 1000;
  const key = (t: number, ...d: Pose[]): Keyframe => ({ t: T(t), pose: compose(c.stance, ...d) });
  const snap = (t: number, ...d: Pose[]): Keyframe => ({ ...key(t, ...d), ease: 'out' });
  const fall = (t: number, ...d: Pose[]): Keyframe => ({ ...key(t, ...d), ease: 'in' });
  const clip = (name: string, duration: number, keys: Keyframe[], events: ClipEvent[] = [], loop = false): Clip => ({
    name, duration: T(duration), keys, events: events.map((e) => ({ ...e, t: T(e.t) })), ...(loop ? { loop } : {}),
  });
  const b = c.bounce;
  return { T, key, snap, fall, clip, b };
}

// Deltas ---------------------------------------------------------------------------

export const OPEN: Pose = { expression: 'open' };
/** A watchful squint (Silcoon), a narrowed glare (Cascoon). */
export const HALF: Pose = { expression: 'half' };
export const SHUT: Pose = { expression: 'closed' };
export const HAPPY: Pose = { expression: 'happy' };
/** Shut tight (a wince, straining). */
export const SQUEEZE: Pose = { expression: 'squeeze' };

/** The soft body bending: the middle (spine) and the top (head) forward (x +) and to its right (z +). */
export const bend = (spine: number, head: number, spineZ = 0, headZ = 0, headY = 0): Pose => ({
  bones: { spine: { x: spine, z: spineZ }, head: { x: head, z: headZ, y: headY } },
});
/** The whole body tipped on its strands: pitch forward (+) or back (-), roll to its right (+) or left (-). */
export const tip = (pitch: number, roll = 0): Pose => ({ root: { pitch, roll } });
/** Off the ground (it has no feet to plant): a hop. */
export const hop = (y: number): Pose => ({ plantFeet: 0, root: { y } });
/** Where it is: advance toward the foe, height, a lunge (heights), tipped. */
export const at = (advance: number, y = 0, z = 0, pitch = 0, roll = 0): Pose => ({
  advance, root: { y, z, pitch, roll }, ...(y > 0.02 ? { plantFeet: 0 } : {}),
});
/** A swell (breath, puff) or a tensed shrink. */
export const swell = (s: number): Pose => ({ scale: s });
/** A step aside (heights, + to its left). */
export const aside = (x: number): Pose => ({ root: { x } });
