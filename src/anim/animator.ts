// Plays clips on a rig with crossfades and events, plus a procedural layer
// (breathing / hair sway) so idle never looks frozen.

import { type Clip, eventsBetween, sampleClip } from './clip';
import { type Pose, type Rig, lerpPose } from './rig';

export interface PlayOptions {
  /** Crossfade duration in seconds. */
  fade?: number;
  speed?: number;
  onEvent?: (name: string) => void;
}

interface Track {
  clip: Clip;
  time: number;
  speed: number;
  onEvent?: (name: string) => void;
  resolve?: () => void;
  done: boolean;
}

/**
 * Compose poses for authoring: bone rotations and pelvis/root offsets add up,
 * aims and scalar channels (advance, expression, fx...) override.
 */
export function compose(base: Pose, ...deltas: Pose[]): Pose {
  const out: Pose = structuredClone(base);
  for (const d of deltas) {
    for (const [k, r] of Object.entries(d.bones ?? {})) {
      const o = ((out.bones ??= {})[k] ??= {});
      o.x = (o.x ?? 0) + (r.x ?? 0);
      o.y = (o.y ?? 0) + (r.y ?? 0);
      o.z = (o.z ?? 0) + (r.z ?? 0);
    }
    if (d.aim) out.aim = { ...(out.aim ?? {}), ...structuredClone(d.aim) };
    for (const [k, r] of Object.entries(d.post ?? {})) {
      const o = ((out.post ??= {})[k] ??= {});
      o.x = (o.x ?? 0) + (r.x ?? 0);
      o.y = (o.y ?? 0) + (r.y ?? 0);
      o.z = (o.z ?? 0) + (r.z ?? 0);
    }
    if (d.pelvis) {
      out.pelvis ??= {};
      for (const a of ['x', 'y', 'z'] as const) out.pelvis[a] = (out.pelvis[a] ?? 0) + (d.pelvis[a] ?? 0);
    }
    if (d.root) {
      out.root ??= {};
      for (const a of ['x', 'y', 'z', 'yaw', 'pitch', 'roll'] as const) out.root[a] = (out.root[a] ?? 0) + (d.root[a] ?? 0);
    }
    if (d.fx) out.fx = { ...(out.fx ?? {}), ...d.fx };
    for (const k of ['advance', 'plantFeet', 'expression', 'scale'] as const) {
      if (d[k] !== undefined) (out as Record<string, unknown>)[k] = d[k];
    }
  }
  return out;
}

export class Animator {
  private current: Track | null = null;
  private previous: Track | null = null;
  private fadeTime = 0;
  private fadeDuration = 0;
  private clock = 0;
  /** Procedural breathing amplitude (0 disables). */
  breathing = 1;
  lastPose: Pose = {};

  constructor(private readonly rig: Rig, readonly clips: Record<string, Clip>) {}

  get currentClip(): string | null {
    return this.current?.clip.name ?? null;
  }

  has(name: string): boolean {
    return name in this.clips;
  }

  /** Start a clip; resolves when a non-looping clip finishes. */
  play(name: string, opts: PlayOptions = {}): Promise<void> {
    const clip = this.clips[name];
    if (!clip) return Promise.reject(new Error(`no clip ${name}`));
    if (this.current?.resolve) this.current.resolve();
    this.previous = this.current;
    this.fadeTime = 0;
    this.fadeDuration = this.previous ? (opts.fade ?? 0.12) : 0;
    return new Promise<void>((resolve) => {
      this.current = { clip, time: 0, speed: opts.speed ?? 1, onEvent: opts.onEvent, resolve: clip.loop ? undefined : resolve, done: false };
      if (clip.loop) resolve();
    });
  }

  update(dt: number): Pose {
    this.clock += dt;
    const cur = this.current;
    if (!cur) {
      this.rig.applyPose(this.lastPose);
      return this.lastPose;
    }
    const prevT = cur.time;
    cur.time += dt * cur.speed;
    for (const e of eventsBetween(cur.clip, prevT, cur.time)) cur.onEvent?.(e.name);
    if (!cur.clip.loop && cur.time >= cur.clip.duration && !cur.done) {
      cur.done = true;
      cur.time = cur.clip.duration;
      cur.resolve?.();
    }
    let pose = sampleClip(cur.clip, cur.time);
    if (this.previous && this.fadeTime < this.fadeDuration) {
      this.fadeTime += dt;
      this.previous.time += dt * this.previous.speed;
      const w = Math.min(1, this.fadeTime / this.fadeDuration);
      pose = lerpPose(sampleClip(this.previous.clip, this.previous.time), pose, w * w * (3 - 2 * w));
    }
    pose = this.proceduralLayer(pose);
    this.rig.applyPose(pose);
    this.lastPose = pose;
    return pose;
  }

  /** Subtle breathing/sway on top of whatever plays (fades out during big moves). */
  private proceduralLayer(pose: Pose): Pose {
    if (!this.breathing) return pose;
    const calm = 1 - Math.min(1, Math.abs(pose.advance ?? 0) * 3);
    const a = this.breathing * calm;
    if (a <= 0) return pose;
    const t = this.clock;
    const breath = Math.sin(t * 2.4);
    const sway = Math.sin(t * 1.3 + 0.7);
    return compose(pose, {
      pelvis: { y: breath * 0.004 * a },
      bones: {
        chest: { x: breath * 1.6 * a },
        neck: { x: -breath * 1.0 * a },
        head: { y: sway * 1.5 * a },
      },
      post: {
        armL: { z: breath * 1.5 * a },
        armR: { z: -breath * 1.5 * a },
        hairTipL: { y: sway * 3 * a, x: breath * 2 * a },
        hairTipR: { y: sway * 3 * a, x: breath * 2 * a },
      },
    });
  }
}
