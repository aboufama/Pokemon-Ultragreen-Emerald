// Keyframed pose clips with easing and named events (impact, release, ...).
//
// Segments without an explicit ease are interpolated with monotone cubic
// curves through the keys: motion flows through in-between keys (no stop at
// every key, which reads as mechanical), eases only where a channel turns
// around (the extremes of an action), and never overshoots the keys. Explicit
// eases ('out', 'outBack', ...) keep their timing curve for accents.
//
// Clips can also be sampled "layered": bones further from the pelvis read the
// clip slightly in the past, so actions ripple outward from the body (hips,
// then chest, head, arms, hands): overlapping action.

import type { BoneAim, BoneRotation, Pose } from './rig';

export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'outBack' | 'inBack' | 'step' | 'outElastic' | 'smooth';

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

/** Eases that mean "flow through": interpolated with monotone cubic curves. */
const SPLINED = new Set<Ease | undefined>([undefined, 'inOut', 'smooth']);

export interface Keyframe {
  /** Seconds from clip start. */
  t: number;
  pose: Pose;
  /** Easing of the segment that ends at this key (none = smooth curve). */
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
  /** Placeholder from the generic starter set (the gauntlet requires bespoke clips). */
  generic?: boolean;
}

// ---------------------------------------------------------------------------
// Flattened channels

type ChannelKind = 'bone' | 'post' | 'aim' | 'twist' | 'pelvis' | 'root' | 'fx' | 'scalar';

interface Channel {
  kind: ChannelKind;
  /** Bone / fx / scalar name. */
  name: string;
  /** Axis key ('x', 'yaw', 0..2 for aim directions). */
  axis: string | number;
  /** Semantic bone this channel belongs to (for layered sampling). */
  bone: string | null;
  /** Value when a key does not set it (NaN: undefined, e.g. an aim). */
  missing: number;
}

interface FlatClip {
  channels: Channel[];
  keys: { t: number; ease?: Ease; values: Float64Array; expression?: string }[];
  /** For layered sampling: channel -> semantic bone name (or null). */
  boneOf: (string | null)[];
}

const flatCache = new WeakMap<Clip, FlatClip>();

function channelsOf(pose: Pose, add: (c: Channel) => void): void {
  for (const [n, r] of Object.entries(pose.bones ?? {})) for (const a of ['x', 'y', 'z'] as const) if (r[a] !== undefined) add({ kind: 'bone', name: n, axis: a, bone: n, missing: 0 });
  for (const [n, r] of Object.entries(pose.post ?? {})) for (const a of ['x', 'y', 'z'] as const) if (r[a] !== undefined) add({ kind: 'post', name: n, axis: a, bone: n, missing: 0 });
  for (const [n, aim] of Object.entries(pose.aim ?? {})) {
    for (let i = 0; i < 3; i++) add({ kind: 'aim', name: n, axis: i, bone: n, missing: NaN });
    if (aim.twist !== undefined) add({ kind: 'twist', name: n, axis: 0, bone: n, missing: 0 });
  }
  for (const a of ['x', 'y', 'z'] as const) if (pose.pelvis?.[a] !== undefined) add({ kind: 'pelvis', name: 'pelvis', axis: a, bone: null, missing: 0 });
  for (const a of ['x', 'y', 'z', 'yaw', 'pitch', 'roll'] as const) if (pose.root?.[a] !== undefined) add({ kind: 'root', name: 'root', axis: a, bone: null, missing: 0 });
  for (const k of Object.keys(pose.fx ?? {})) add({ kind: 'fx', name: k, axis: 0, bone: null, missing: 0 });
  if (pose.advance !== undefined) add({ kind: 'scalar', name: 'advance', axis: 0, bone: null, missing: 0 });
  if (pose.plantFeet !== undefined) add({ kind: 'scalar', name: 'plantFeet', axis: 0, bone: null, missing: 0 });
  // Per-leg plants default to the pose's plantFeet (see readChannel).
  if (pose.plantLeft !== undefined) add({ kind: 'scalar', name: 'plantLeft', axis: 0, bone: null, missing: NaN });
  if (pose.plantRight !== undefined) add({ kind: 'scalar', name: 'plantRight', axis: 0, bone: null, missing: NaN });
  if (pose.plantFront !== undefined) add({ kind: 'scalar', name: 'plantFront', axis: 0, bone: null, missing: NaN });
  if (pose.scale !== undefined) add({ kind: 'scalar', name: 'scale', axis: 0, bone: null, missing: 1 });
}

function readChannel(pose: Pose, c: Channel): number {
  let v: number | undefined;
  switch (c.kind) {
    case 'bone': v = pose.bones?.[c.name]?.[c.axis as 'x']; break;
    case 'post': v = pose.post?.[c.name]?.[c.axis as 'x']; break;
    case 'aim': v = pose.aim?.[c.name]?.dir[c.axis as number]; break;
    case 'twist': v = pose.aim?.[c.name]?.twist; break;
    case 'pelvis': v = pose.pelvis?.[c.axis as 'x']; break;
    case 'root': v = pose.root?.[c.axis as 'x']; break;
    case 'fx': v = pose.fx?.[c.name]; break;
    case 'scalar':
      v = (pose as Record<string, number | undefined>)[c.name];
      if (v === undefined && (c.name === 'plantLeft' || c.name === 'plantRight' || c.name === 'plantFront')) v = pose.plantFeet;
      break;
  }
  return v ?? c.missing;
}

function flatten(clip: Clip): FlatClip {
  let flat = flatCache.get(clip);
  if (flat) return flat;
  const channels: Channel[] = [];
  const seen = new Set<string>();
  for (const k of clip.keys) {
    channelsOf(k.pose, (c) => {
      const id = `${c.kind}|${c.name}|${c.axis}`;
      if (!seen.has(id)) {
        seen.add(id);
        channels.push(c);
      }
    });
  }
  // Aim directions are normalized so components interpolate consistently.
  const keys = clip.keys.map((k) => {
    const values = new Float64Array(channels.length);
    channels.forEach((c, i) => (values[i] = readChannel(k.pose, c)));
    for (let i = 0; i < channels.length; i++) {
      if (channels[i].kind !== 'aim' || channels[i].axis !== 0 || Number.isNaN(values[i])) continue;
      const len = Math.hypot(values[i], values[i + 1], values[i + 2]) || 1;
      values[i] /= len;
      values[i + 1] /= len;
      values[i + 2] /= len;
    }
    return { t: k.t, ease: k.ease, values, expression: k.pose.expression };
  });
  flat = { channels, keys, boneOf: channels.map((c) => c.bone) };
  flatCache.set(clip, flat);
  return flat;
}

/** Fritsch-Butland tangent: 0 at turning points, so curves never overshoot. */
function tangent(v0: number, v1: number, v2: number, h0: number, h1: number): number {
  if (!(h0 > 0) || !(h1 > 0)) return 0;
  const d0 = (v1 - v0) / h0;
  const d1 = (v2 - v1) / h1;
  if (d0 * d1 <= 0) return 0;
  return (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
}

/** Channel values of a clip at time t. */
function sampleFlat(flat: FlatClip, clip: Clip, time: number, out: Float64Array): { expression?: string } {
  const keys = flat.keys;
  const n = keys.length;
  let t = time;
  if (clip.loop) t = ((t % clip.duration) + clip.duration) % clip.duration;
  else t = Math.min(Math.max(t, 0), clip.duration);

  // Segment [i, j] containing t (for loops, the last key wraps to the first).
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    if (t < keys[k].t) {
      i = k - 1;
      break;
    }
  }
  if (i < 0) {
    if (!clip.loop) {
      out.set(keys[0].values);
      return { expression: keys[0].expression };
    }
    i = n - 1;
  }
  let j = i + 1;
  if (j >= n) {
    if (!clip.loop) {
      out.set(keys[n - 1].values);
      return { expression: keys[n - 1].expression };
    }
    j = 0;
  }
  const at = (k: number) => {
    // Key time on a continuous axis around segment i (wrapping for loops).
    if (!clip.loop) return keys[Math.min(n - 1, Math.max(0, k))].t;
    const w = Math.floor(k / n);
    return keys[((k % n) + n) % n].t + w * clip.duration;
  };
  const key = (k: number) => (clip.loop ? keys[((k % n) + n) % n] : keys[Math.min(n - 1, Math.max(0, k))]);
  const iAbs = i;
  const jAbs = j === 0 && i === n - 1 ? n : j;
  const t0 = at(iAbs - 1), t1 = at(iAbs), t2 = at(jAbs), t3 = at(jAbs + 1);
  const tt = t < t1 ? t + clip.duration : t;
  const h = Math.max(1e-6, t2 - t1);
  const u = Math.min(1, Math.max(0, (tt - t1) / h));
  const k0 = key(iAbs - 1), k1 = key(iAbs), k2 = key(jAbs), k3 = key(jAbs + 1);
  // Clip ends have no neighbor: start and finish at rest.
  const hasPrev = clip.loop || iAbs > 0;
  const hasNext = clip.loop || jAbs < n - 1;
  const easeKind = k2.ease;
  const splined = SPLINED.has(easeKind);
  const w = splined ? 0 : ease(easeKind, u);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const channels = flat.channels;
  for (let c = 0; c < channels.length; c++) {
    const v1 = k1.values[c], v2 = k2.values[c];
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
      // Only one side sets it (aims): switch halfway.
      out[c] = u < 0.5 ? v1 : v2;
      if (Number.isNaN(out[c])) out[c] = Number.isNaN(v1) ? v2 : v1;
      continue;
    }
    if (!splined) {
      out[c] = v1 + (v2 - v1) * w;
      continue;
    }
    const v0 = hasPrev && !Number.isNaN(k0.values[c]) ? k0.values[c] : v1;
    const v3 = hasNext && !Number.isNaN(k3.values[c]) ? k3.values[c] : v2;
    const m1 = hasPrev ? tangent(v0, v1, v2, t1 - t0, t2 - t1) : 0;
    const m2 = hasNext ? tangent(v1, v2, v3, t2 - t1, t3 - t2) : 0;
    out[c] = h00 * v1 + h10 * h * m1 + h01 * v2 + h11 * h * m2;
  }
  retimeAimArcs(channels, k1.values, k2.values, out);
  return { expression: u < 0.5 ? k1.expression ?? k2.expression : k2.expression ?? k1.expression };
}

/**
 * Aimed limbs swing along the arc between two key directions at an even
 * angular speed. The component splines trace the chord, and a normalized
 * chord whips through the middle of a large swing (1.7x the average speed
 * at 120°, 3x at 150°, crawling at both ends); here the progress along the
 * chord is re-mapped onto the great circle, keeping the spline's bend from
 * the neighbouring keys. Swings under 60° are left as they are (the chord
 * and the arc agree), and near-opposite directions have no single arc.
 */
function retimeAimArcs(channels: Channel[], a: Float64Array, b: Float64Array, out: Float64Array): void {
  for (let c = 0; c + 2 < channels.length; c++) {
    if (channels[c].kind !== 'aim' || channels[c].axis !== 0) continue;
    const ux = a[c], uy = a[c + 1], uz = a[c + 2];
    const wx = b[c], wy = b[c + 1], wz = b[c + 2];
    if (Number.isNaN(ux) || Number.isNaN(wx) || Number.isNaN(out[c])) continue;
    const dot = ux * wx + uy * wy + uz * wz;
    if (dot > 0.5 || dot < -0.985) continue;
    const cx = wx - ux, cy = wy - uy, cz = wz - uz;
    const px = out[c] - ux, py = out[c + 1] - uy, pz = out[c + 2] - uz;
    const s = Math.min(1, Math.max(0, (px * cx + py * cy + pz * cz) / (cx * cx + cy * cy + cz * cz)));
    const theta = Math.acos(dot);
    const f1 = Math.sin((1 - s) * theta) / Math.sin(theta), f2 = Math.sin(s * theta) / Math.sin(theta);
    // The spline's bend off the chord (from the neighbouring keys), kept.
    const rx = px - s * cx, ry = py - s * cy, rz = pz - s * cz;
    out[c] = f1 * ux + f2 * wx + rx;
    out[c + 1] = f1 * uy + f2 * wy + ry;
    out[c + 2] = f1 * uz + f2 * wz + rz;
  }
}

function unflatten(flat: FlatClip, values: Float64Array, expression?: string): Pose {
  const pose: Pose = { bones: {}, expression };
  const bones = pose.bones as Record<string, BoneRotation>;
  let post: Record<string, BoneRotation> | undefined;
  let aim: Record<string, BoneAim> | undefined;
  const channels = flat.channels;
  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    const v = values[c];
    switch (ch.kind) {
      case 'bone': (bones[ch.name] ??= {})[ch.axis as 'x'] = v; break;
      case 'post': ((post ??= {})[ch.name] ??= {})[ch.axis as 'x'] = v; break;
      case 'aim': {
        if (Number.isNaN(v)) break;
        const a = ((aim ??= {})[ch.name] ??= { dir: [0, 0, 0] });
        a.dir[ch.axis as number] = v;
        break;
      }
      case 'twist': {
        const a = (aim ??= {})[ch.name];
        if (a) a.twist = v;
        break;
      }
      case 'pelvis': (pose.pelvis ??= {})[ch.axis as 'x'] = v; break;
      case 'root': (pose.root ??= {})[ch.axis as 'x'] = v; break;
      case 'fx': (pose.fx ??= {})[ch.name] = Math.max(0, v); break;
      case 'scalar': if (!Number.isNaN(v)) (pose as Record<string, number>)[ch.name] = v; break;
    }
  }
  if (aim) {
    for (const a of Object.values(aim)) {
      const len = Math.hypot(a.dir[0], a.dir[1], a.dir[2]);
      if (len > 1e-6) a.dir = [a.dir[0] / len, a.dir[1] / len, a.dir[2] / len];
      else a.dir = [0, -1, 0];
    }
  }
  pose.post = post;
  pose.aim = aim;
  return pose;
}

export function sampleClip(clip: Clip, time: number): Pose {
  const flat = flatten(clip);
  const values = new Float64Array(flat.channels.length);
  const { expression } = sampleFlat(flat, clip, time, values);
  return unflatten(flat, values, expression);
}

/**
 * Sample with per-bone delays (seconds): each semantic bone reads the clip
 * `delay(bone)` in the past. Root, pelvis and other body channels are not
 * delayed, so contacts and events keep their timing.
 */
export function sampleClipLayered(clip: Clip, time: number, delay: (bone: string) => number): Pose {
  const flat = flatten(clip);
  const n = flat.channels.length;
  const values = new Float64Array(n);
  const { expression } = sampleFlat(flat, clip, time, values);
  const groups = new Map<number, number[]>();
  flat.boneOf.forEach((bone, c) => {
    if (!bone) return;
    const d = delay(bone);
    if (d <= 0) return;
    let list = groups.get(d);
    if (!list) groups.set(d, (list = []));
    list.push(c);
  });
  const tmp = new Float64Array(n);
  for (const [d, list] of groups) {
    sampleFlat(flat, clip, time - d, tmp);
    for (const c of list) values[c] = tmp[c];
  }
  return unflatten(flat, values, expression);
}

/** Events crossed when advancing from `from` (exclusive) to `to` (inclusive). */
export function eventsBetween(clip: Clip, from: number, to: number): ClipEvent[] {
  return (clip.events ?? []).filter((e) => e.t > from && e.t <= to);
}
