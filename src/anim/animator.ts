// Plays clips on a rig with crossfades and events, overlapping action (bones
// further from the pelvis follow slightly later) and a procedural life layer
// (breathing, weight shifts, a fighter's bounce, head drift) so the creature
// never holds perfectly still.

import { type Clip, eventsBetween, sampleClipLayered } from './clip';
import { type Pose, type Rig, lerpPose } from './rig';

/**
 * Default overlap: how far behind the body each semantic bone reads the clip
 * (seconds). Actions start at the hips and ripple out to the head, arms,
 * hands and loose parts. Legs have none, so feet plant on time.
 */
export const DEFAULT_OVERLAP: Record<string, number> = {
  spine: 0.015, chest: 0.03, neck: 0.05, head: 0.065, jaw: 0.065, tail: 0.06,
  shoulderL: 0.025, shoulderR: 0.025, armL: 0.04, armR: 0.04, forearmL: 0.06, forearmR: 0.06,
  handL: 0.08, handR: 0.08, wristFxL: 0.09, wristFxR: 0.09,
  earL: 0.09, earR: 0.09, hairL: 0.08, hairR: 0.08, hairTipL: 0.1, hairTipR: 0.1,
};

function overlapOf(table: Record<string, number>, bone: string): number {
  const d = table[bone];
  if (d !== undefined) return d;
  return bone.startsWith('finger') ? 0.1 : 0;
}

const TAU = Math.PI * 2;
const smooth = (x: number) => x * x * (3 - 2 * x);

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
    for (const k of ['advance', 'plantFeet', 'plantLeft', 'plantRight', 'expression', 'scale'] as const) {
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
  /** Procedural life layer amplitude (0 disables). */
  breathing = 1;
  lastPose: Pose = {};
  /** 1 while a looping (idle) clip plays, eased toward 0 during actions. */
  private idleWeight = 1;
  private readonly delay: (bone: string) => number;

  constructor(private readonly rig: Rig, readonly clips: Record<string, Clip>, overlap: Record<string, number> = DEFAULT_OVERLAP) {
    this.delay = (bone) => overlapOf(overlap, bone);
  }

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
      // Time keeps running (sampling clamps): delayed bones finish their motion.
      cur.done = true;
      cur.resolve?.();
    }
    let pose = sampleClipLayered(cur.clip, cur.time, this.delay);
    if (this.previous && this.fadeTime < this.fadeDuration) {
      this.fadeTime += dt;
      this.previous.time += dt * this.previous.speed;
      const w = Math.min(1, this.fadeTime / this.fadeDuration);
      pose = lerpPose(sampleClipLayered(this.previous.clip, this.previous.time, this.delay), pose, w * w * (3 - 2 * w));
    }
    const idleTarget = cur.clip.loop ? 1 : 0;
    this.idleWeight += (idleTarget - this.idleWeight) * Math.min(1, dt * 4);
    pose = this.proceduralLayer(pose);
    this.rig.applyPose(pose);
    this.lastPose = pose;
    return pose;
  }

  /**
   * Life on top of whatever plays: an asymmetric breath (quick inhale, long
   * exhale), a slow irregular weight shift with the upper body
   * counter-balancing, a fighter's bounce and a drifting gaze while idle,
   * and small finger movements. Fades out while travelling to a target.
   */
  private proceduralLayer(pose: Pose): Pose {
    if (!this.breathing) return pose;
    const calm = 1 - Math.min(1, Math.abs(pose.advance ?? 0) * 3);
    const a = this.breathing * calm;
    if (a <= 0) return pose;
    const idle = this.idleWeight * a;
    const t = this.clock;
    // Breath: 0 (exhaled) .. 1 (inhaled), inhale over 40% of a 3.4 s cycle.
    const bp = (t / 3.4) % 1;
    const breath = bp < 0.4 ? smooth(bp / 0.4) : 1 - smooth((bp - 0.4) / 0.6);
    const b = breath * 2 - 1;
    // Weight shift: two incommensurate periods, so it never visibly repeats.
    const shift = Math.sin((t * TAU) / 7.3) * 0.75 + Math.sin((t * TAU) / 3.1 + 1.3) * 0.25;
    // Fighter's bounce: knees flex on a steady rhythm (idle only).
    const bounce = 0.5 - 0.5 * Math.cos(t * TAU * 0.85);
    const lookYaw = 2.4 * Math.sin(t * 0.37 + 0.5) + 1.1 * Math.sin(t * 0.93 + 2.1);
    const lookPitch = 1.3 * Math.sin(t * 0.53 + 1.7) + 0.6 * Math.sin(t * 1.29);
    const curl = Math.sin(t * 0.8 + 0.4) * 0.5 + Math.sin(t * 1.9) * 0.5;
    return compose(pose, {
      pelvis: { x: 0.006 * shift * a, y: (0.003 * b - 0.005 * bounce * idle) * a },
      bones: {
        spine: { z: -1.4 * shift * a, x: 0.8 * bounce * idle },
        chest: { x: -1.8 * b * a },
        neck: { x: 0.8 * b * a },
        head: { x: lookPitch * idle - 0.6 * bounce * idle, y: lookYaw * idle, z: 1.1 * shift * a },
        fingerA1L: { z: 4 * curl * idle }, fingerB1L: { z: 4 * curl * idle }, fingerC1L: { z: 4 * curl * idle },
        fingerA1R: { z: -4 * curl * idle }, fingerB1R: { z: -4 * curl * idle }, fingerC1R: { z: -4 * curl * idle },
      },
      post: {
        armL: { z: 1.4 * b * a },
        armR: { z: -1.4 * b * a },
      },
    });
  }
}
