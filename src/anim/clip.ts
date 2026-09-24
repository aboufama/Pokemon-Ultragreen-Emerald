// Keyframed pose clips with easing and named events (impact, release, ...).

import { type Pose, lerpPose } from './rig';

export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'outBack' | 'inBack' | 'step' | 'outElastic';

export function ease(kind: Ease | undefined, u: number): number {
  const t = Math.min(1, Math.max(0, u));
  switch (kind) {
    case 'in': return t * t;
    case 'out': return 1 - (1 - t) * (1 - t);
    case 'inOut': return t * t * (3 - 2 * t);
    case 'outBack': { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    case 'inBack': { const c = 1.7; return (c + 1) * t * t * t - c * t * t; }
    case 'step': return t < 1 ? 0 : 1;
    case 'outElastic': return t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    default: return t;
  }
}

export interface Keyframe {
  /** Seconds from clip start. */
  t: number;
  pose: Pose;
  /** Easing of the segment that ends at this key. */
  ease?: Ease;
}

export interface ClipEvent {
  t: number;
  name: string;
}

export interface Clip {
  name: string;
  duration: number;
  loop?: boolean;
  keys: Keyframe[];
  events?: ClipEvent[];
}

export function sampleClip(clip: Clip, time: number): Pose {
  const keys = clip.keys;
  let t = time;
  if (clip.loop) t = ((t % clip.duration) + clip.duration) % clip.duration;
  else t = Math.min(Math.max(t, 0), clip.duration);
  if (t <= keys[0].t) return keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    const k0 = keys[i - 1];
    const k1 = keys[i];
    if (t <= k1.t) {
      const u = (t - k0.t) / Math.max(1e-6, k1.t - k0.t);
      return lerpPose(k0.pose, k1.pose, ease(k1.ease, u));
    }
  }
  if (clip.loop) {
    // Wrap from the last key back to the first.
    const k0 = keys[keys.length - 1];
    const k1 = keys[0];
    const span = clip.duration - k0.t + k1.t;
    const u = (t - k0.t) / Math.max(1e-6, span);
    return lerpPose(k0.pose, k1.pose, ease(k1.ease, u));
  }
  return keys[keys.length - 1].pose;
}

/** Events crossed when advancing from `from` (exclusive) to `to` (inclusive). */
export function eventsBetween(clip: Clip, from: number, to: number): ClipEvent[] {
  return (clip.events ?? []).filter((e) => e.t > from && e.t <= to);
}
