// What an arena is made of, and the painting helpers the arenas share: fill
// the ground pixel by pixel from its ground point, scatter marks (tufts,
// pebbles, flowers) sized for their distance, stand rows of trees in the
// far view with their shadows, and place props around the battlers without
// covering them.

import { MAT, Paint, Rng, type Ramp, type Rgb, type Sprite, band, bayer, fbm, hash2, noise } from './art';
import type { GroundLook } from './ground';
import type { PropSpec } from './props';
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

/** True if a prop of this size standing at (x, z) would cover a battler or stand in front of it. */
export function blocksBattler(ctx: ArenaContext, x: number, z: number, wPx: number, hPx: number): boolean {
  const [sx, sy] = ctx.view.screen(x, 0, z);
  const box = [sx - wPx / 2, sy - hPx, sx + wPx / 2, sy];
  for (const who of ['player', 'enemy'] as const) {
    const b = battlerBox(ctx, who);
    const overlaps = box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1];
    if (overlaps) return true;
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
