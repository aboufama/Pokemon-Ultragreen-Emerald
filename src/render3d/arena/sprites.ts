// Things standing in an arena, drawn as pixel art at the size they appear on
// screen (one sprite pixel per GBA pixel), lit from the upper left like the
// battle sprites: Hoenn's round trees in leaf clusters, clumps of tall grass
// and faceted crags (sea stacks, boulders).

import { type Ramp, type Rgb, type Sprite, Rng, createSprite, noise, opaque, put } from './art';

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

export interface TreePalette {
  /** Leaf tones, dark to light (2 or 3). */
  leaves: Ramp;
  outline: Rgb;
  /** Trunk tones: shaded, lit. */
  trunk: Ramp;
}

/**
 * A Hoenn tree for the far view: a dome of round leaf clumps on a short
 * trunk, `w` pixels across. Each clump is lit from the upper left in flat
 * tones whose boundaries break into leaf clusters a few pixels across
 * (clusters, not noise: a stray pixel takes its neighbors' tone), with a
 * leafy scalloped edge and a dark rim where it covers the clumps behind it.
 */
export function tree(w: number, pal: TreePalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const cw = Math.max(8, Math.round(w));
  const ch = Math.round(cw * 0.9);
  const trunkH = Math.max(2, Math.round(cw * 0.09));
  const m = 2;
  const s = createSprite(cw + 2 * m, ch + trunkH + 2 * m);
  const u = (v: number) => m + v * cw, vv = (v: number) => m + v * ch;
  const j = () => rng.range(-0.03, 0.03);
  // Clumps (center and radius, in canopy widths): one on top, two below it, three along the bottom.
  const rows: [number, number, number][][] = [
    [[0.5, 0.26, 0.25]],
    [[0.28, 0.46, 0.25], [0.72, 0.46, 0.25]],
    [[0.17, 0.72, 0.2], [0.5, 0.76, 0.24], [0.83, 0.72, 0.2]],
  ];
  const clumps = rows.flat().map(([x, y, r]) => ({ cx: u(x + j()), cy: vv(y + j()), r: (r + j() * 0.5) * cw, k: Math.max(5, Math.round((r * cw * Math.PI * 2) / 7)), ph: rng.range(0, 6.28) }));
  // Which clump each pixel belongs to (later ones in front), each clump's edge scalloped into leaves.
  const owner = new Int16Array(s.w * s.h).fill(-1);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      clumps.forEach((c, i) => {
        const dx = x + 0.5 - c.cx, dy = y + 0.5 - c.cy;
        const edge = c.r * (1 + 0.07 * (Math.abs(Math.cos((Math.atan2(dy, dx) * c.k) / 2 + c.ph)) - 0.6));
        if (dx * dx + dy * dy <= edge * edge) owner[y * s.w + x] = i;
      });
    }
  }
  // Trunk first (the clumps hang over it; only its foot shows), lit on the left.
  const tw = Math.max(2, Math.round(cw * 0.14));
  const tx = Math.round(m + cw / 2 - tw / 2);
  for (let y = Math.round(vv(0.8)); y < s.h - m; y++) for (let x = tx; x < tx + tw; x++) put(s, x, y, pal.trunk[x - tx < tw * 0.45 ? pal.trunk.length - 1 : 0]);
  // Leaves: each clump lit as a sphere, its tone boundaries broken into clusters by noise about 3.5 px
  // across; a dark rim where a clump covers one behind it.
  const top = pal.leaves.length - 1;
  const tone = new Int8Array(s.w * s.h).fill(-1);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const i = owner[y * s.w + x];
      if (i < 0) continue;
      const c = clumps[i];
      let v = sphereLight(x, y, c.cx, c.cy, c.r) * (top + 0.7) - 0.15 + (noise(x / 3.5, y / 3.5, seed) - 0.5) * 0.9;
      const below = y + 1 < s.h ? owner[(y + 1) * s.w + x] : -1;
      const right = x + 1 < s.w ? owner[y * s.w + x + 1] : -1;
      if ((below >= 0 && below < i) || (right >= 0 && right < i)) v = Math.min(v, 0.4);
      tone[y * s.w + x] = Math.max(0, Math.min(top, Math.floor(v)));
    }
  }
  // No stray pixels: a leaf pixel whose four neighbors all share another tone takes it.
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= s.w || y >= s.h ? -1 : tone[y * s.w + x]);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const t = at(x, y), l = at(x - 1, y);
      if (t < 0 || l < 0 || l === t) continue;
      if (at(x + 1, y) === l && at(x, y - 1) === l && at(x, y + 1) === l) tone[y * s.w + x] = l;
    }
  }
  for (let i = 0; i < s.w * s.h; i++) if (tone[i] >= 0) put(s, i % s.w, Math.floor(i / s.w), pal.leaves[tone[i]]);
  outline(s, pal.outline);
  return s;
}

export interface GrassPalette {
  /** The blades behind, the blades in front, their lit edge. */
  blades: Ramp;
  outline: Rgb;
}

/**
 * A clump of tall grass: a fan of tapered blades curving outward from its
 * foot, tallest in the middle; the blades behind in the dark tone, those in
 * front mid with a lit left edge, outlined except along the ground.
 */
export function tallGrass(w: number, h: number, pal: GrassPalette, seed: number, n = 9): Sprite {
  const rng = new Rng(seed);
  const gw = Math.max(6, Math.round(w)), gh = Math.max(6, Math.round(h));
  const s = createSprite(gw + 2, gh + 2);
  const mid = (n - 1) / 2;
  const blades = Array.from({ length: n }, (_, i) => {
    const k = (i - mid) / Math.max(1, mid);
    const bh = gh * (0.7 + 0.3 * (1 - k * k)) * rng.range(0.85, 1);
    const base = 1 + gw / 2 + k * gw * 0.3 + rng.range(-0.8, 0.8);
    const lean = k * gw * 0.4 + rng.range(-1.5, 1.5);
    return { base, bh, lean, bw: gw * 0.2 * rng.range(0.85, 1.15), back: i % 2 === 0 };
  });
  // The blades behind first, then the ones in front.
  for (const b of [...blades.filter((b) => b.back), ...blades.filter((b) => !b.back)]) {
    for (let y = s.h - 1; y >= s.h - 1 - b.bh; y--) {
      const t = (s.h - 1 - y) / b.bh; // 0 at the foot, 1 at the tip
      const c = b.base + b.lean * t * t;
      const half = (b.bw / 2) * (1 - t);
      const x0 = Math.round(c - half), x1 = Math.max(x0, Math.round(c + half) - 1);
      for (let x = x0; x <= x1; x++) put(s, x, y, b.back ? pal.blades[0] : x === x0 && x1 > x0 && t > 0.1 ? pal.blades[2] : pal.blades[1]);
    }
  }
  outline(s, pal.outline, { bottom: false });
  return s;
}

export interface RockPalette {
  shades: Ramp; // dark .. light (3-5)
  outline: Rgb;
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

