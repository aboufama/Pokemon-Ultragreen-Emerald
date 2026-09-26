// What an arena is made of, and the painting helpers the arenas share: fill
// the ground pixel by pixel from its ground point, scatter marks (tufts,
// sparkles) sized for their distance, draw crisp pattern lines (wave
// crests), and stand things in the far view (trees, rocks) farthest first.

import { MAT, Paint, Rng, type Ramp, type Rgb, type Sprite, bayer, hash2 } from './art';
import type { GroundLook } from './ground';
import type { PropSpec } from './props';
import type { ArenaView, GroundPoint } from './view';

/**
 * The painted area, in GBA screen pixels: the screen and a margin all round
 * for the camera shake. (The camera never pans, and the intro slides only
 * the Pokémon and the trainer in, so nothing beyond it is ever seen.)
 */
export const PAINT_X0 = -32;
export const PAINT_Y0 = -24;
export const PAINT_W = 304;
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
    // The painted area spans the screen and its margin: under 0.4 z either side at depth z.
    const halfW = z * 0.4 + 1.5;
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

/**
 * Screen-space box a battler's sprite occupies (with room around it): what
 * nothing standing may cover, and, for the wild Pokémon, the calm the arena
 * keeps around it (no marks, clutter or busy far view there).
 */
export function battlerBox(ctx: ArenaContext, who: 'player' | 'enemy'): [number, number, number, number] {
  const p = ctx[who];
  const [sx, sy] = ctx.view.screen(p.x, 0, p.z);
  return who === 'enemy' ? [sx - 46, sy - 70, sx + 46, sy + 10] : [sx - 64, sy - 120, sx + 64, sy + 10];
}

export function newPaint(): Paint {
  return new Paint(PAINT_W, PAINT_H, PAINT_X0, PAINT_Y0);
}
