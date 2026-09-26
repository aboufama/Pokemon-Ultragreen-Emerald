// What an arena is made of, and the painting helpers the arenas share: fill
// the ground pixel by pixel from its ground point, scatter marks (tufts,
// pebbles, flowers) sized for their distance, stand rows of trees in the
// far view with their shadows, and place props around the battlers without
// covering them.

import { MAT, Paint, Rng, type Ramp, type Rgb, type Sprite, band, bayer, fbm, hash2, noise } from './art';
import type { GroundLook } from './ground';
import { type PropSpec, propRect } from './props';
import type { ArenaView, GroundPoint } from './view';

/** The painted area, in GBA screen pixels: three screens wide (the intro slide) and past the bottom and top edges (camera shake). */
export const PAINT_X0 = -240;
export const PAINT_Y0 = -24;
export const PAINT_W = 720;
export const PAINT_H = 224;

export interface ArenaContext {
  view: ArenaView;
  ground: Paint;
  props: PropSpec[];
  rng: Rng;
  /** Where the battlers stand (ground points). */
  player: { x: number; z: number };
  enemy: { x: number; z: number };
}

export interface ArenaDesign {
  /** The Hoenn place it is, as the menus name it (ROUTE 101), and a line about it. */
  name: string;
  about: string;
  /** Ambience style (wind, motes, dust, ground effects) in src/render3d/ambience.ts. */
  ambience: string;
  look?: GroundLook;
  /** Rings on the water at the battlers' feet: how far they spread (world units). */
  ripples?: number;
  paint(ctx: ArenaContext): void;
}

/** Paint every pixel from its ground point; return a color (and material), or null to leave it. */
export function fill(ctx: ArenaContext, fn: (sx: number, sy: number, g: GroundPoint) => Rgb | [Rgb, number] | null): void {
  const { ground, view } = ctx;
  for (let sy = ground.oy; sy < ground.oy + ground.height; sy++) {
    for (let sx = ground.ox; sx < ground.ox + ground.width; sx++) {
      const g = view.ground(sx, sy);
      if (!g) continue;
      const r = fn(sx, sy, g);
      if (!r) continue;
      if (r.length === 2) ground.set(sx, sy, r[0], r[1]);
      else ground.set(sx, sy, r as Rgb);
    }
  }
}

/**
 * Visit ground cells about `px` screen pixels apart at every distance (a world
 * grid that coarsens with depth), each with a random point in it: where to put
 * tufts, pebbles and flowers so they are evenly spread on screen.
 */
export function scatter(ctx: ArenaContext, px: number, seed: number, fn: (x: number, z: number, sx: number, sy: number, ppu: number, r: number) => void): void {
  const { view, ground } = ctx;
  const top = view.ground(120, ground.oy)!;
  let z = 3;
  for (let row = 0; z < top.z; row++) {
    const d = view.depth(0, 0, z);
    const step = px / view.ppu(d);
    // The painted area spans three screens: about 0.95 z either side at depth z.
    const halfW = z * 0.95 + 1.5;
    for (let i = Math.floor(-halfW / step); i < halfW / step; i++) {
      const rx = hash2(i, row, seed), rz = hash2(i, row, seed + 1);
      const x = (i + rx) * step, zz = z + rz * step;
      const [sx, sy] = view.screen(x, 0, zz);
      if (sx < ground.ox || sx >= ground.ox + ground.width || sy < ground.oy || sy >= ground.oy + ground.height) continue;
      fn(x, zz, Math.floor(sx), Math.floor(sy), view.ppu(view.depth(x, 0, zz)), hash2(i, row, seed + 2));
    }
    z += step;
  }
}

/** A soft shadow on the ground (dithered ellipse), e.g. under a tree. */
export function groundShadow(ctx: ArenaContext, cx: number, cy: number, rx: number, ry: number, dark: (c: Rgb) => Rgb, strength = 1): void {
  const { ground } = ctx;
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      if (d > 1) continue;
      const a = strength * (d < 0.55 ? 1 : 1 - (d - 0.55) / 0.45);
      if (a <= bayer(x, y)) continue;
      const c = ground.get(x, y);
      const m = ground.material(x, y);
      if (c && m !== MAT.BACKDROP) ground.set(x, y, dark(c), m === MAT.GRASS ? MAT.SOLID : m);
    }
  }
}

/** Darken a color to the next shade of its ramp (or by a factor when not in one). */
export function darker(ramps: Ramp[], factor = 0.78): (c: Rgb) => Rgb {
  return (c) => {
    for (const r of ramps) {
      const i = r.findIndex((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]);
      if (i > 0) return r[i - 1];
      if (i === 0) return r[0].map((v) => Math.round(v * 0.85)) as unknown as Rgb;
    }
    return c.map((v) => Math.round(v * factor)) as unknown as Rgb;
  };
}

/** Shift a color `steps` along whichever ramp holds it (clamped at its ends); colors in no ramp are left alone. */
export function shift(ramps: Ramp[], c: Rgb, steps: number): Rgb {
  for (const r of ramps) {
    const i = r.findIndex((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]);
    if (i >= 0) return r[Math.max(0, Math.min(r.length - 1, i + steps))];
  }
  return c;
}

/**
 * Whether a pattern's line passes through pixel (sx, sy): where `phase`
 * crosses a whole number between the pixel and its lower (or, with `right`,
 * its right) neighbor. Crisp 1-pixel lines at any distance; where lines crowd
 * closer than `maxStep` apart (in phase per pixel) they are left out.
 */
export function onLine(ctx: ArenaContext, sx: number, sy: number, phase: (x: number, z: number) => number, maxStep = 0.45, right = false): boolean {
  const g = ctx.view.ground(sx, sy), d = ctx.view.ground(sx, sy + 1);
  if (!g || !d) return false;
  const p = phase(g.x, g.z), q = phase(d.x, d.z);
  if (Math.abs(q - p) < maxStep && Math.floor(q) !== Math.floor(p)) return true;
  if (!right) return false;
  const r = ctx.view.ground(sx + 1, sy);
  if (!r) return false;
  const s = phase(r.x, r.z);
  return Math.abs(s - p) < maxStep && Math.floor(s) !== Math.floor(p);
}

export interface DuneRow {
  /** Where the dunes' feet are (world z), how tall they rise (world units), crests per world unit. */
  z: number;
  height: number;
  freq: number;
  seed: number;
  /** Lit faces (windward, facing the light at the left), darkest first; the shadowed slip faces; the crest line. */
  lit: Ramp;
  shade: Ramp;
  crest: Rgb;
}

/**
 * Dunes standing along the back, farthest row first: sharp crests, a long
 * lit windward face rising from the left and a short steep slip face falling
 * away on the right in shadow, a bright line along each crest.
 */
export function dunes(ctx: ArenaContext, rows: DuneRow[]): void {
  const { view, ground } = ctx;
  for (const r of [...rows].sort((a, b) => b.z - a.z)) {
    const [, footY] = view.screen(0, 0, r.z);
    const ppu = view.ppu(view.depth(0, 0, r.z));
    // Screen-right is world -x: u grows to the right. Each dune: a long convex
    // windward rise to its crest, then a short concave slip face; a smaller
    // dune rides on the back of the bigger ones, and the crests wander.
    const one = (u: number, seed: number) => {
      const k = Math.floor(u), t = u - k;
      const peak = 0.7 + (hash2(k, seed, 5) - 0.5) * 0.16;
      const amp = 0.45 + hash2(k, seed, 6) * 0.55;
      const up = t < peak;
      const p = up ? Math.sin((t / peak) * Math.PI * 0.5) ** 1.6 : ((1 - t) / (1 - peak)) ** 2.2;
      return { h: p * amp, up, t: up ? t / peak : (t - peak) / (1 - peak) };
    };
    const shape = (x: number) => {
      const u = -x * r.freq + (noise(x * r.freq * 0.3, r.seed, r.seed) - 0.5) * 0.8;
      const a = one(u, r.seed), b = one(u * 2.3 + 0.37, r.seed + 1);
      const hb = b.h * 0.45;
      const top = hb > a.h ? b : a;
      return { h: 0.08 + Math.max(a.h, hb) * 0.92, up: top.up, t: top.t };
    };
    for (let sx = ground.ox; sx < ground.ox + ground.width; sx++) {
      const g = view.groundAt(sx + 0.5, footY);
      if (!g) continue;
      const d = shape(g.x);
      const h = r.height * ppu * d.h;
      const y0 = Math.round(footY - h), y1 = Math.floor(footY);
      for (let sy = Math.max(ground.oy, y0); sy <= y1; sy++) {
        const down = (sy - y0) / Math.max(1, y1 - y0);
        let c: Rgb;
        if (d.up) {
          // The windward face: brightest just under the crest, a little darker toward the trough.
          const v = (r.lit.length - 1) * (0.45 + d.t * 0.55) - down * 1.2;
          c = band(r.lit, v, sx, sy, 0.3);
        } else {
          const v = (r.shade.length - 1) * (0.4 + (1 - d.t) * 0.6) - down * 0.8;
          c = band(r.shade, v, sx, sy, 0.3);
        }
        // The crest line along the lit face's top.
        if (sy === y0 && d.up && d.t > 0.25) c = r.crest;
        ground.set(sx, sy, c, MAT.BACKDROP);
      }
    }
  }
}

export interface Shaft {
  /** Screen x where the shaft leaves the top of the painted area, its width, and its lean (pixels right per row). */
  x: number;
  w: number;
  lean: number;
  /** Rows it reaches down to (it fades out over the last third). */
  bottom: number;
  strength: number;
  /** Shades its core is lifted (its edges one less); default 1. */
  lift?: number;
}

/**
 * Light shafts falling through water or a cave's gloom: slanted bands that
 * lift what they cross a shade along its ramp (`lift` shades in their core),
 * solid in the middle, checkered along their soft edges and thinning out
 * toward their foot. `only` limits them to some pixels (e.g. the far view).
 */
export function shafts(ctx: ArenaContext, list: Shaft[], ramps: Ramp[], only?: (sx: number, sy: number) => boolean): void {
  const { ground } = ctx;
  for (const s of list) {
    for (let sy = ground.oy; sy < Math.min(s.bottom, ground.oy + ground.height); sy++) {
      const t = (sy - ground.oy) / (s.bottom - ground.oy);
      const fade = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
      const x0 = s.x + (sy - ground.oy) * s.lean;
      for (let sx = Math.floor(x0); sx <= x0 + s.w; sx++) {
        const u = (sx + 0.5 - x0) / s.w;
        if (u < 0 || u > 1) continue;
        const core = u > 0.22 && u < 0.78;
        const density = (core ? s.strength : 0.5) * fade;
        if (density <= bayer(sx, sy)) continue;
        if (only && !only(sx, sy)) continue;
        const c = ground.get(sx, sy);
        const lift = core && fade > 0.6 ? s.lift ?? 1 : 1;
        if (c) ground.set(sx, sy, shift(ramps, c, lift), ground.material(sx, sy));
      }
    }
  }
}

export interface StandSpec {
  sprite: Sprite;
  x: number;
  z: number;
  shadow?: { rx: number; ry: number };
}

/** Paint standing things into the far view, farthest first, with shadows at their feet. */
export function stand(ctx: ArenaContext, items: StandSpec[], dark: (c: Rgb) => Rgb): void {
  const { view, ground } = ctx;
  const sorted = [...items].sort((a, b) => b.z - a.z);
  for (const it of sorted) {
    const [sx, sy] = view.screen(it.x, 0, it.z);
    if (it.shadow) groundShadow(ctx, sx, sy, it.shadow.rx, it.shadow.ry, dark, 0.9);
    ground.sprite(it.sprite, Math.round(sx), Math.floor(sy) + 1);
  }
}

/** Screen-space box a battler's sprite occupies (with room around it). */
export function battlerBox(ctx: ArenaContext, who: 'player' | 'enemy'): [number, number, number, number] {
  const p = ctx[who];
  const [sx, sy] = ctx.view.screen(p.x, 0, p.z);
  return who === 'enemy' ? [sx - 46, sy - 70, sx + 46, sy + 10] : [sx - 64, sy - 120, sx + 64, sy + 10];
}

/** True if a prop would cover a battler or stand in front of it (where it is drawn, sway included). */
export function blocksBattler(ctx: ArenaContext, prop: PropSpec): boolean {
  const r = propRect(ctx.view, prop);
  for (const who of ['player', 'enemy'] as const) {
    const b = battlerBox(ctx, who);
    if (r[0] < b[2] && r[2] > b[0] && r[1] < b[3] && r[3] > b[1]) return true;
  }
  return false;
}

/** Stand a prop in the arena unless it would cover a battler; true if it was placed. */
export function addProp(ctx: ArenaContext, prop: PropSpec): boolean {
  if (blocksBattler(ctx, prop)) return false;
  ctx.props.push(prop);
  return true;
}

/**
 * Frame the view with a prop: stand it with its foot at screen pixel
 * (sx, sy), nudged outward (dir -1 toward the left edge, +1 toward the right)
 * until it clears the battlers, so it ends up cropped by the frame; true if placed.
 */
export function frameProp(ctx: ArenaContext, sx: number, sy: number, dir: -1 | 1, make: (ppu: number) => Omit<PropSpec, 'x' | 'z'>): boolean {
  const g0 = ctx.view.ground(sx, sy);
  if (!g0) return false;
  const made = make(g0.ppu);
  for (let k = 0; k < 60; k++) {
    const g = ctx.view.ground(sx + dir * k, sy);
    if (!g) return false;
    if (addProp(ctx, { ...made, x: g.x, z: g.z })) return true;
  }
  return false;
}

/** The ground point under screen pixel (sx, sy). */
export function at(ctx: ArenaContext, sx: number, sy: number): { x: number; z: number } {
  const g = ctx.view.ground(sx, sy)!;
  return { x: g.x, z: g.z };
}

export function newPaint(): Paint {
  return new Paint(PAINT_W, PAINT_H, PAINT_X0, PAINT_Y0);
}

export interface HillRow {
  /** Where the hills' feet are (world z) and how tall they rise (world units). */
  z: number;
  height: number;
  /** Shades, darkest first: the shadowed flanks use the low end, the lit flanks the high end. */
  shades: Ramp;
  /** Ridge color along the tops. */
  crest?: Rgb;
  /** Bumps per world unit, and roughness (0 smooth dunes .. 1 craggy rock). */
  freq: number;
  rough?: number;
  seed: number;
}

/**
 * Far hills, dunes or ridges standing along the back, painted farthest row
 * first: each column rises from the row's foot to a smooth or craggy skyline,
 * flanks facing the light (left) lit, the others in shadow, the tops lined.
 */
export function hills(ctx: ArenaContext, rows: HillRow[]): void {
  const { view, ground } = ctx;
  for (const r of [...rows].sort((a, b) => b.z - a.z)) {
    const [, footY] = view.screen(0, 0, r.z);
    const ppu = view.ppu(view.depth(0, 0, r.z));
    const rough = r.rough ?? 0;
    const profile = (x: number) => {
      const f = r.freq;
      let p = 0.55 + 0.28 * Math.sin(x * f + r.seed) + 0.17 * Math.sin(x * f * 2.3 + r.seed * 1.7);
      p += (fbm(x * f * 2.2, r.seed, r.seed, 3) - 0.5) * 0.55 * rough;
      return Math.max(0.05, p);
    };
    const top = r.shades.length - 1;
    const slopeAt = (x: number) => (profile(x - 5 / ppu) - profile(x + 5 / ppu)) * r.height * ppu / 10;
    for (let sx = ground.ox; sx < ground.ox + ground.width; sx++) {
      const g = view.groundAt(sx + 0.5, footY);
      if (!g) continue;
      const x = g.x;
      const h = r.height * ppu * profile(x);
      // Screen right is world -x: a flank rising toward screen-right faces the light.
      const lit = Math.max(-1, Math.min(1, -slopeAt(x) * 5));
      const y0 = Math.round(footY - h), y1 = Math.floor(footY);
      for (let sy = Math.max(ground.oy, y0); sy <= y1; sy++) {
        const depthIn = (sy - y0) / Math.max(1, y1 - y0); // 0 at the top .. 1 at the foot
        let v = top * 0.5 + lit * top * 0.42 - depthIn * 0.8;
        // Rock shows its layers.
        if (rough > 0.5 && (sy + Math.round(noise(x * 0.8, r.seed) * 3)) % 5 === 0) v -= 0.7;
        const c = sy === y0 && r.crest ? r.crest : band(r.shades, v, sx, sy, 0.35);
        ground.set(sx, sy, c, MAT.BACKDROP);
      }
    }
  }
}
