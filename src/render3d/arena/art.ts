// Pixel art tools for painting arenas: colors, the GBA-style 4x4 ordered
// dither, seeded randomness and noise, the painted ground canvas (color plus
// a material per pixel that the ground shader animates) and sprites.

export type Rgb = readonly [number, number, number];

export const hex = (s: string): Rgb => {
  const v = parseInt(s.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

/** A ramp of colors, darkest first. */
export type Ramp = readonly Rgb[];
export const ramp = (...colors: string[]): Ramp => colors.map(hex);

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** 4x4 ordered dither threshold in (0, 1). */
export function bayer(x: number, y: number): number {
  return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
}

/** Pick a ramp entry for a continuous shade (0 = darkest), dithering between neighbors. */
export function shade(r: Ramp, v: number, x: number, y: number): Rgb {
  const n = r.length - 1;
  const c = Math.max(0, Math.min(n, v));
  const i = Math.floor(c);
  return c - i > bayer(x, y) ? r[Math.min(n, i + 1)] : r[i];
}

/** Same, but only dithered inside a narrow band around each step (clean bands, soft edges). */
export function band(r: Ramp, v: number, x: number, y: number, softness = 0.35): Rgb {
  const n = r.length - 1;
  const c = Math.max(0, Math.min(n, v));
  const i = Math.floor(c);
  const f = c - i;
  const t = Math.max(0, Math.min(1, (f - 0.5) / softness + 0.5));
  return t > bayer(x, y) ? r[Math.min(n, i + 1)] : r[i];
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round) as unknown as Rgb;
}

export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = (seed >>> 0) % 2147483647 || 1;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  pick<T>(xs: readonly T[]): T {
    return xs[Math.floor(this.next() * xs.length)];
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
}

/** Integer hash to [0, 1). */
export function hash2(x: number, y: number, seed = 0): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Smooth value noise in [0, 1]. */
export function noise(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed), c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/** Fractal noise: `octaves` layers, each twice as fine and half as strong. */
export function fbm(x: number, y: number, seed = 0, octaves = 3): number {
  let sum = 0, amp = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise(x, y, seed + o * 17) * amp;
    norm += amp;
    amp *= 0.5;
    x *= 2.03;
    y *= 2.03;
  }
  return sum / norm;
}

export const smoothstep = (a: number, b: number, v: number): number => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Materials of painted ground pixels, which the ground shader brings to life
 * (stored in the alpha channel of the painted image).
 */
export const MAT = {
  SOLID: 255,
  /** Grass blades lean with the wind; wind rolls over them in lighter bands. */
  GRASS: 1,
  /** Water: moving wave lines, glints, ripples at the battlers' feet. */
  WATER: 2,
  /** Shallow water over sand: the same, lighter. */
  SHALLOW: 3,
  /** Lava: glowing, slowly churning. */
  LAVA: 4,
  /** Standing things painted in the far view (trees, walls): no ground effects. */
  BACKDROP: 5,
} as const;

/** An RGBA sprite, drawn by its bottom-center anchor. */
export interface Sprite {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

export function createSprite(w: number, h: number): Sprite {
  return { w, h, data: new Uint8ClampedArray(w * h * 4) };
}

export function put(s: Sprite, x: number, y: number, c: Rgb): void {
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return;
  const i = (y * s.w + x) * 4;
  s.data[i] = c[0];
  s.data[i + 1] = c[1];
  s.data[i + 2] = c[2];
  s.data[i + 3] = 255;
}

export function opaque(s: Sprite, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < s.w && y < s.h && s.data[(y * s.w + x) * 4 + 3] > 0;
}

/**
 * The painted ground: GBA screen pixels from (ox, oy), wider and taller than
 * the screen so the intro slide and camera shake find ground beyond the
 * edges. Color in RGB, material in A.
 */
export class Paint {
  readonly data: Uint8ClampedArray;
  constructor(readonly width: number, readonly height: number, readonly ox: number, readonly oy: number) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  set(sx: number, sy: number, c: Rgb, mat: number = MAT.SOLID): void {
    const x = sx - this.ox, y = sy - this.oy;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
    this.data[i + 3] = mat;
  }
  get(sx: number, sy: number): Rgb | null {
    const x = sx - this.ox, y = sy - this.oy;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    const i = (y * this.width + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2]];
  }
  material(sx: number, sy: number): number {
    const x = sx - this.ox, y = sy - this.oy;
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
    return this.data[(y * this.width + x) * 4 + 3];
  }
  /** Draw a sprite with its bottom-center at (sx, sy). */
  sprite(s: Sprite, sx: number, sy: number, mat: number = MAT.BACKDROP): void {
    const x0 = Math.round(sx - s.w / 2), y0 = Math.round(sy - s.h);
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const i = (y * s.w + x) * 4;
        if (s.data[i + 3] === 0) continue;
        this.set(x0 + x, y0 + y, [s.data[i], s.data[i + 1], s.data[i + 2]], mat);
      }
    }
  }
}
