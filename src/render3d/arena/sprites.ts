// Props drawn as pixel art at the size they appear on screen (one sprite
// pixel per GBA pixel), lit from the upper left like the battle sprites:
// round Hoenn trees and bushes, tall grass, rocks and faceted crags, reeds
// and stalagmites.

import { type Ramp, type Rgb, type Sprite, Rng, band, createSprite, hash2, noise, opaque, put } from './art';

/** Light from the upper left, toward the viewer (x right, y down, z out of the screen). */
const L = (() => {
  const v = [-0.5, -0.62, 0.6];
  const n = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / n);
})();

/** Lambert light on a sphere lump at (x, y) (pixel center), 0..1. */
function sphereLight(x: number, y: number, cx: number, cy: number, r: number): number {
  const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r;
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
}

/** A dark line around the sprite's silhouette (on the transparent pixels next to it). */
export function outline(s: Sprite, c: Rgb, sides: { bottom?: boolean } = {}): void {
  const add: [number, number][] = [];
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      if (opaque(s, x, y)) continue;
      const n = opaque(s, x - 1, y) || opaque(s, x + 1, y) || opaque(s, x, y + 1) || (sides.bottom !== false && opaque(s, x, y - 1));
      if (n) add.push([x, y]);
    }
  }
  for (const [x, y] of add) put(s, x, y, c);
}

interface Lump {
  cx: number;
  cy: number;
  r: number;
}

/**
 * Round clumps shaded as spheres: each clump darkens along its lower-right
 * rim where it overlaps the ones behind, the way Hoenn's trees are drawn.
 */
function lumps(s: Sprite, list: Lump[], shades: Ramp, seed: number, speckle = 0.07, soft = 0.3): Int16Array {
  const owner = new Int16Array(s.w * s.h).fill(-1);
  list.forEach((l, i) => {
    for (let y = Math.floor(l.cy - l.r); y <= l.cy + l.r; y++) {
      for (let x = Math.floor(l.cx - l.r); x <= l.cx + l.r; x++) {
        if (x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
        if ((x + 0.5 - l.cx) ** 2 + (y + 0.5 - l.cy) ** 2 <= l.r * l.r) owner[y * s.w + x] = i;
      }
    }
  });
  const top = shades.length - 1;
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const i = owner[y * s.w + x];
      if (i < 0) continue;
      const l = list[i];
      let v = sphereLight(x, y, l.cx, l.cy, l.r) * (top + 0.6) - 0.1;
      // The rim of a clump where it covers the ones behind it: a shadow line.
      const below = y + 1 < s.h ? owner[(y + 1) * s.w + x] : -1;
      const right = x + 1 < s.w ? owner[y * s.w + x + 1] : -1;
      if ((below >= 0 && below !== i && below < i) || (right >= 0 && right !== i && right < i)) v = Math.min(v, 0.4);
      // Leaves: a few specks of the next shade down on the lit side and up on the dark side.
      const h = hash2(x, y, seed);
      if (h < speckle) v += v > top * 0.55 ? -1 : 1;
      put(s, x, y, band(shades, v, x, y, soft));
    }
  }
  return owner;
}

export interface TreePalette {
  leaves: Ramp; // dark .. light (3-4)
  outline: Rgb;
  trunk: Ramp; // dark .. light
  /** Share of leaf pixels flecked a shade off (default 0.07), and how wide the dither between shades spreads (default 0.3): lower is calmer. */
  speckle?: number;
  soft?: number;
}

/** A Hoenn tree: a pyramid of round leaf clumps on a short trunk. `w` is the canopy width in pixels. */
export function tree(w: number, pal: TreePalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const cw = Math.max(6, Math.round(w));
  const ch = Math.round(cw * 0.9);
  const trunkH = Math.max(1, Math.round(cw * 0.07));
  const m = 1;
  const s = createSprite(cw + 2 * m, ch + trunkH + 2 * m);
  const u = (v: number) => m + v * cw, vv = (v: number) => m + v * ch;
  const j = () => rng.range(-0.03, 0.03);
  const rows: [number, number, number][][] = cw < 14
    ? [[[0.5, 0.36, 0.34]], [[0.3, 0.66, 0.31], [0.7, 0.66, 0.31]]]
    : [
        [[0.5, 0.26, 0.25]],
        [[0.28, 0.46, 0.25], [0.72, 0.46, 0.25]],
        [[0.17, 0.72, 0.2], [0.5, 0.76, 0.24], [0.83, 0.72, 0.2]],
      ];
  const list: Lump[] = rows.flat().map(([x, y, r]) => ({ cx: u(x + j()), cy: vv(y + j()), r: (r + j() * 0.5) * cw }));
  // Trunk first (the clumps hang over it; only its foot shows).
  const tw = Math.max(2, Math.round(cw * 0.16));
  const tx = Math.round(m + cw / 2 - tw / 2);
  for (let y = Math.round(vv(0.8)); y < s.h - m; y++) {
    for (let x = tx; x < tx + tw; x++) {
      const t = (x - tx) / Math.max(1, tw - 1);
      put(s, x, y, pal.trunk[t < 0.34 ? pal.trunk.length - 1 : t > 0.7 ? 0 : Math.min(1, pal.trunk.length - 1)]);
    }
  }
  lumps(s, list, pal.leaves, seed, pal.speckle, pal.soft);
  outline(s, pal.outline);
  return s;
}

/** A low bush: a row of clumps. */
export function bush(w: number, pal: TreePalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const bw = Math.max(6, Math.round(w));
  const bh = Math.max(4, Math.round(bw * 0.55));
  const s = createSprite(bw + 2, bh + 2);
  const n = bw < 12 ? 2 : 3;
  const list: Lump[] = [];
  for (let i = 0; i < n; i++) {
    const x = 1 + ((i + 0.5) / n) * bw + rng.range(-1, 1);
    list.push({ cx: x, cy: 1 + bh * rng.range(0.52, 0.62), r: (bw / n) * rng.range(0.62, 0.72) });
  }
  list.push({ cx: 1 + bw * rng.range(0.4, 0.6), cy: 1 + bh * 0.4, r: bw * 0.3 });
  list.sort((a, b) => a.cy - b.cy);
  // Flat bottom: clumps are cut at the ground.
  lumps(s, list, pal.leaves, seed, pal.speckle, pal.soft);
  for (let x = 0; x < s.w; x++) for (let y = bh + 1; y < s.h; y++) s.data[(y * s.w + x) * 4 + 3] = 0;
  outline(s, pal.outline, { bottom: false });
  return s;
}

export interface GrassPalette {
  blades: Ramp; // dark, mid, light (3)
  outline: Rgb;
}

/** A clump of tall grass: tapered blades, lit edge on the left, dark on the right. */
export function tallGrass(w: number, h: number, pal: GrassPalette, seed: number, blades = 0): Sprite {
  const rng = new Rng(seed);
  const gw = Math.max(3, Math.round(w)), gh = Math.max(3, Math.round(h));
  const s = createSprite(gw + 4, gh + 2);
  const n = blades || Math.max(2, Math.round(gw / 3));
  const order = Array.from({ length: n }, (_, i) => i).sort(() => rng.next() - 0.5);
  for (const i of order) {
    const base = 2 + ((i + 0.5) / n) * gw + rng.range(-0.8, 0.8);
    const bh = gh * rng.range(0.6, 1);
    const lean = rng.range(-0.35, 0.35) * bh;
    const bw = Math.max(1, gw / n) * rng.range(0.8, 1.2);
    const tipY = s.h - 1 - bh;
    for (let y = Math.floor(tipY); y < s.h; y++) {
      const t = (s.h - 1 - y) / bh; // 0 at the base, 1 at the tip
      const cx = base + lean * t * t;
      const half = Math.max(0.35, (bw / 2) * (1 - t));
      const x0 = Math.round(cx - half), x1 = Math.round(cx + half);
      for (let x = x0; x <= x1; x++) {
        const edge = x === x0 && x1 > x0 ? 2 : x === x1 && x1 > x0 ? 0 : 1;
        put(s, x, y, pal.blades[edge]);
      }
    }
  }
  outline(s, pal.outline, { bottom: false });
  return s;
}

export interface RockPalette {
  shades: Ramp; // dark .. light (3-5)
  outline: Rgb;
  /** At most this many cracks on a rock() (default: two on a big rock, one on a small one). */
  cracks?: number;
}

/** A rock or boulder: an irregular lump lit from the upper left, a few broad facets, a crack or two. */
export function rock(w: number, h: number, pal: RockPalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const rw = Math.max(3, Math.round(w)), rh = Math.max(3, Math.round(h));
  const s = createSprite(rw + 2, rh + 2);
  const cx = 1 + rw / 2, cy = 1 + rh * 0.7;
  const k = Array.from({ length: 6 }, () => rng.range(0.82, 1));
  const radius = (a: number) => {
    const f = ((a / (Math.PI * 2)) * 6 + 6) % 6;
    const i = Math.floor(f), t = f - i;
    return k[i] + (k[(i + 1) % 6] - k[i]) * t;
  };
  const top = pal.shades.length - 1;
  const inside = (x: number, y: number) => {
    if (y + 0.5 > 1 + rh) return false;
    const dx = (x + 0.5 - cx) / (rw / 2), dy = (y + 0.5 - cy) / (rh * 0.7);
    return Math.hypot(dx, dy) <= radius(Math.atan2(dy, dx));
  };
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      if (!inside(x, y)) continue;
      const dx = (x + 0.5 - cx) / (rw / 2), dy = (y + 0.5 - cy) / (rh * 0.7);
      // A smooth dome, bent into a few broad facets.
      let nx = dx + (noise(dx * 1.6, dy * 1.6, seed) - 0.5) * 0.7;
      let ny = dy * 0.9 + (noise(dx * 1.6 + 9, dy * 1.6, seed) - 0.5) * 0.7;
      const nl = Math.hypot(nx, ny);
      if (nl > 0.97) { nx *= 0.97 / nl; ny *= 0.97 / nl; }
      const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
      let v = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]) * (top + 0.4) - 0.1;
      // Darker toward the ground; a bright rim where the top-left edge catches the light.
      v -= Math.max(0, (y + 0.5 - (1 + rh * 0.75)) / (rh * 0.25)) * 0.8;
      if (!inside(x - 1, y) || !inside(x, y - 1)) v = Math.max(v, top - 0.2 - (dy > 0.2 ? 1.5 : 0));
      put(s, x, y, band(pal.shades, v, x, y, 0.2));
    }
  }
  // Cracks: short dark lines from the edge inward.
  for (let c = 0; c < Math.min(pal.cracks ?? 2, rw > 12 ? 2 : rw > 6 ? 1 : 0); c++) {
    let x = cx + rng.range(-rw * 0.3, rw * 0.3), y = cy - rh * rng.range(0.2, 0.5);
    const dx = rng.range(-0.6, 0.6);
    for (let i = 0; i < rh * 0.35; i++) {
      const px = Math.round(x), py = Math.round(y);
      if (opaque(s, px, py) && opaque(s, px, py + 1)) put(s, px, py, pal.shades[0]);
      x += dx;
      y += 1;
    }
  }
  outline(s, pal.outline, { bottom: false });
  return s;
}

/**
 * A crag: an angular rock of flat facets (volcanic rock, sea stacks, desert
 * boulders): a jagged silhouette on a flat foot, each facet one shade by how
 * it faces the light from the upper left, a lit edge along the facets' upper
 * sides, a dark outline.
 */
export function crag(w: number, h: number, pal: RockPalette, seed: number, facets = 6): Sprite {
  const rng = new Rng(seed);
  const rw = Math.max(4, Math.round(w)), rh = Math.max(4, Math.round(h));
  const s = createSprite(rw + 2, rh + 2);
  const top = pal.shades.length - 1;
  // The silhouette: a polygon of jittered points around a squat half-ellipse, flat underneath.
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * (1 - i / n);
    const r = rng.range(0.78, 1);
    pts.push([1 + rw / 2 + Math.cos(a) * (rw / 2) * r, 1 + rh - Math.sin(a) * rh * r * (i === 0 || i === n ? 0.25 : 1)]);
  }
  const inside = (x: number, y: number) => {
    if (y > 1 + rh) return false;
    let c = false;
    const poly = [...pts, [1 + rw, 1 + rh], [1, 1 + rh]] as [number, number][];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  // Facets: the interior split among a few seeds, each with its own tilt.
  const seeds = Array.from({ length: facets }, () => ({ x: 1 + rng.range(0.1, 0.9) * rw, y: 1 + rng.range(0.15, 0.95) * rh, tilt: rng.range(-0.35, 0.35) }));
  const facetAt = (x: number, y: number) => {
    let best = 0, bd = 1e9;
    seeds.forEach((f, i) => {
      const d = (x - f.x) ** 2 + ((y - f.y) * 1.3) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  const cxr = 1 + rw / 2;
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      if (!inside(x + 0.5, y + 0.5)) continue;
      const f = facetAt(x + 0.5, y + 0.5), fs = seeds[f];
      // A facet faces the way its seed sits from the rock's middle (left and top: toward the light).
      const nx = (fs.x - cxr) / (rw / 2) + fs.tilt, ny = (fs.y - (1 + rh * 0.55)) / (rh * 0.6);
      let v = (0.55 - nx * 0.45 - ny * 0.4) * (top + 0.3);
      // Edges between facets: lit where the facet above or to the left is a different one.
      if (facetAt(x - 0.5, y + 0.5) !== f || facetAt(x + 0.5, y - 0.5) !== f) v += 0.9;
      // Toward the foot, in the shadow of the ground.
      v -= Math.max(0, (y + 0.5 - (1 + rh * 0.8)) / (rh * 0.2)) * 0.8;
      put(s, x, y, pal.shades[Math.max(0, Math.min(top, Math.round(v)))]);
    }
  }
  outline(s, pal.outline, { bottom: false });
  return s;
}

/** Reeds and cattails at the water's edge. */
export function reeds(w: number, h: number, stem: Ramp, head: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const rw = Math.max(3, Math.round(w)), rh = Math.max(4, Math.round(h));
  const s = createSprite(rw + 2, rh + 2);
  const n = Math.max(2, Math.round(rw / 2));
  for (let i = 0; i < n; i++) {
    const x0 = 1 + ((i + 0.5) / n) * rw + rng.range(-0.5, 0.5);
    const sh = rh * rng.range(0.55, 1);
    const lean = rng.range(-0.25, 0.25);
    const hasHead = rng.chance(0.55) && sh > 6;
    for (let k = 0; k < sh; k++) {
      const t = k / sh;
      const x = Math.round(x0 + lean * t * sh * 0.4), y = s.h - 1 - k;
      if (hasHead && t > 0.62 && t < 0.9) {
        put(s, x, y, head[1]);
        put(s, x + 1, y, head[0]);
      } else put(s, x, y, stem[t > 0.5 ? 2 : 1]);
    }
  }
  outline(s, outlineColor, { bottom: false });
  return s;
}

/** A stalagmite: a tapered, rounded cone lit on the left. */
export function stalagmite(w: number, h: number, pal: RockPalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const sw = Math.max(3, Math.round(w)), sh = Math.max(4, Math.round(h));
  const s = createSprite(sw + 2, sh + 2);
  const cx = 1 + sw / 2 + rng.range(-0.5, 0.5);
  const top = pal.shades.length - 1;
  for (let y = 1; y < s.h; y++) {
    const t = (y - 1) / sh; // 0 tip .. 1 base
    const half = (sw / 2) * Math.pow(t, 0.8);
    for (let x = 0; x < s.w; x++) {
      const dx = (x + 0.5 - cx) / Math.max(0.5, half);
      if (Math.abs(dx) > 1) continue;
      const lit = Math.max(0, -dx * 0.55 + 0.55 + (1 - t) * 0.2);
      put(s, x, y, band(pal.shades, lit * (top + 0.4), x, y, 0.3));
    }
  }
  outline(s, pal.outline, { bottom: false });
  return s;
}

