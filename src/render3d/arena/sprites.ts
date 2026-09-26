// Props drawn as pixel art at the size they appear on screen (one sprite
// pixel per GBA pixel), lit from the upper left like the battle sprites:
// round Hoenn trees and bushes, tall grass, rocks, reeds, kelp, coral,
// stalagmites and the Battle Tower's lamp posts.

import { type Ramp, type Rgb, type Sprite, Rng, band, bayer, createSprite, hash2, noise, opaque, put } from './art';

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
function lumps(s: Sprite, list: Lump[], shades: Ramp, seed: number, speckle = 0.07): Int16Array {
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
      put(s, x, y, band(shades, v, x, y, 0.3));
    }
  }
  return owner;
}

export interface TreePalette {
  leaves: Ramp; // dark .. light (3-4)
  outline: Rgb;
  trunk: Ramp; // dark .. light
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
  lumps(s, list, pal.leaves, seed);
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
  lumps(s, list, pal.leaves, seed);
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

/**
 * A dry desert shrub: thin twigs fanning up from the sand, forking, tufts of
 * dusty leaves at their tips, lit on the left.
 */
export function shrub(w: number, h: number, twig: Ramp, leaves: Ramp, seed: number): Sprite {
  const rng = new Rng(seed);
  const sw = Math.max(5, Math.round(w)), sh = Math.max(4, Math.round(h));
  const s = createSprite(sw + 4, sh + 3);
  const tips: [number, number][] = [];
  const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
    for (let i = 0; i < len; i++) {
      x += Math.sin(ang);
      y -= Math.cos(ang);
      put(s, Math.round(x), Math.round(y), twig[ang < 0 ? twig.length - 1 : 0]);
    }
    if (depth > 0) {
      branch(x, y, ang - rng.range(0.3, 0.6), len * 0.6, depth - 1);
      branch(x, y, ang + rng.range(0.3, 0.6), len * 0.6, depth - 1);
    } else tips.push([x, y]);
  };
  const n = sw > 10 ? 4 : 3;
  for (let i = 0; i < n; i++) branch(2 + sw / 2 + rng.range(-1, 1), s.h - 1, ((i + 0.5) / n - 0.5) * 1.6, sh * 0.45, 1);
  const top = leaves.length - 1;
  for (const [tx, ty] of tips) {
    const r = Math.max(1, sw * 0.12);
    for (let y = Math.floor(ty - r); y <= ty + r; y++) {
      for (let x = Math.floor(tx - r); x <= tx + r; x++) {
        const d = Math.hypot(x + 0.5 - tx, (y + 0.5 - ty) * 1.2) / r;
        if (d > 1 || hash2(x, y, seed) < 0.15) continue;
        put(s, x, y, leaves[Math.max(0, Math.min(top, Math.round(sphereLight(x, y, tx, ty, r) * (top + 0.3))))]);
      }
    }
  }
  outline(s, twig[0], { bottom: false });
  return s;
}

/** A few short blades (a tuft of grass or weeds), no outline. */
export function tuft(h: number, pal: GrassPalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const th = Math.max(2, Math.round(h));
  const s = createSprite(th + 3, th);
  const n = rng.int(2, 3);
  for (let i = 0; i < n; i++) {
    const base = 1 + ((i + 0.5) / n) * (th + 1);
    const lean = (i - (n - 1) / 2) * rng.range(0.4, 0.9);
    const bh = th * rng.range(0.6, 1);
    for (let k = 0; k < bh; k++) {
      const t = k / bh;
      put(s, Math.round(base + lean * t * th * 0.5), th - 1 - k, pal.blades[t > 0.6 ? 2 : k === 0 ? 0 : 1]);
    }
  }
  return s;
}

export interface RockPalette {
  shades: Ramp; // dark .. light (3-5)
  outline: Rgb;
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
  for (let c = 0; c < (rw > 12 ? 2 : rw > 6 ? 1 : 0); c++) {
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

/**
 * A plume of steam or smoke: puffs swelling as they rise, lit on the left,
 * thinning (dithered away) toward the top. `lean` pixels right per row.
 */
export function plume(w: number, h: number, shades: Ramp, seed: number, lean = 0.2, density = 0.6): Sprite {
  const rng = new Rng(seed);
  const pw = Math.max(4, Math.round(w)), ph = Math.max(6, Math.round(h));
  const s = createSprite(Math.round(pw * 1.6 + ph * Math.abs(lean)) + 4, ph + 2);
  const puffs: Lump[] = [];
  for (let y = ph; y > 0;) {
    const t = 1 - y / ph;
    const r = (pw / 2) * (0.45 + t * 0.6) * rng.range(0.8, 1.1);
    puffs.push({ cx: 2 + pw * 0.8 + (ph - y) * lean + rng.range(-1, 1) * r * 0.3, cy: y - r * 0.4, r });
    y -= r * rng.range(0.7, 1);
  }
  const top = shades.length - 1;
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      let best = -1, lit = 0, edge = 0;
      puffs.forEach((p, i) => {
        const d = Math.hypot(x + 0.5 - p.cx, y + 0.5 - p.cy) / p.r;
        if (d <= 1 && best < 0) { best = i; lit = sphereLight(x, y, p.cx, p.cy, p.r); edge = d; }
      });
      if (best < 0) continue;
      // Puffs are solid low down; higher up they thin out in coarse (2x2) dither, from their rims in.
      const thin = (best / Math.max(1, puffs.length - 1)) * (1 - density) * 2 + edge * edge * 0.5;
      if (thin > bayer(x >> 1, y >> 1)) continue;
      put(s, x, y, shades[Math.max(0, Math.min(top, Math.round(lit * (top + 0.4) - 0.2)))]);
    }
  }
  return s;
}

/**
 * A wisp of steam: a thin ribbon curling up, lit on the left, breaking up and
 * thinning out as it rises. `lean` pixels right per row.
 */
export function wisp(w: number, h: number, shades: Ramp, seed: number, lean = 0.15): Sprite {
  const rng = new Rng(seed);
  const ww = Math.max(2, Math.round(w)), wh = Math.max(8, Math.round(h));
  const amp = ww * rng.range(0.6, 1), per = rng.range(0.16, 0.26), ph = rng.range(0, 6);
  const s = createSprite(Math.round(ww * 3 + wh * Math.abs(lean)) + 4, wh + 1);
  const x0 = 2 + ww * 1.5;
  const top = shades.length - 1;
  for (let k = 0; k < wh; k++) {
    const t = k / wh;
    // Higher up it breaks into dashes.
    if (t > 0.45 && hash2(k >> 1, 0, seed) < (t - 0.45) * 1.6) continue;
    const cx = x0 + k * lean + Math.sin(k * per + ph) * amp * (0.3 + t);
    const half = Math.max(0.5, (ww / 2) * (1 - t * 0.6));
    const y = s.h - 1 - k;
    for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) put(s, x, y, shades[x <= cx - half + 1 ? top : x >= cx + half - 1 ? 0 : Math.max(0, top - 1)]);
  }
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

/** Kelp: tall wavy strands, a lit left edge. */
export function kelp(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const kw = Math.max(4, Math.round(w)), kh = Math.max(6, Math.round(h));
  const s = createSprite(kw + 6, kh + 2);
  const n = Math.max(1, Math.round(kw / 4));
  for (let i = 0; i < n; i++) {
    const x0 = 3 + ((i + 0.5) / n) * kw;
    const sh = kh * rng.range(0.6, 1);
    const ph = rng.range(0, 6), amp = rng.range(0.8, 1.6), bw = rng.range(1.5, 2.6);
    for (let k = 0; k < sh; k++) {
      const t = k / sh;
      const cx = x0 + Math.sin(k * 0.35 + ph) * amp * t;
      const half = bw * (1 - t * 0.5) * 0.5;
      const xa = Math.round(cx - half), xb = Math.round(cx + half);
      for (let x = xa; x <= xb; x++) put(s, x, s.h - 1 - k, shades[x === xa ? 2 : x === xb ? 0 : 1]);
    }
  }
  outline(s, outlineColor, { bottom: false });
  return s;
}

/**
 * Seaweed: a few ribbon fronds waving up from the floor, each a flat blade
 * that twists as it rises (lit edge on the left, shaded on the right, the
 * blade's face showing where it turns toward the light), tapering to its tip.
 * With a one-color ramp it is a silhouette far off in the blue.
 */
export function seaweed(w: number, h: number, shades: Ramp, outlineColor: Rgb | null, seed: number): Sprite {
  const rng = new Rng(seed);
  const kw = Math.max(3, Math.round(w)), kh = Math.max(6, Math.round(h));
  const s = createSprite(kw + 8, kh + 2);
  const n = Math.max(1, Math.min(3, Math.round(kw / 3.5)));
  const top = shades.length - 1;
  for (let i = 0; i < n; i++) {
    const x0 = 4 + ((i + 0.5) / n) * kw + rng.range(-0.6, 0.6);
    const sh = kh * rng.range(0.6, 1);
    const ph = rng.range(0, 6), amp = rng.range(1, 2.2), per = rng.range(0.1, 0.16);
    const bw = Math.max(1.5, Math.min(4, kw / n)) * rng.range(0.8, 1.1);
    for (let k = 0; k < sh; k++) {
      const t = k / sh;
      const cx = x0 + Math.sin(k * per + ph) * amp * (0.35 + t);
      // The blade twists: its width breathes, and it faces the light where the wave bends left.
      const twist = Math.cos(k * per * 1.7 + ph);
      const half = Math.max(0.5, (bw / 2) * (1 - t * 0.55) * (0.55 + 0.45 * Math.abs(twist)));
      const y = s.h - 1 - k;
      const xa = Math.round(cx - half), xb = Math.round(cx + half);
      for (let x = xa; x <= xb; x++) {
        const face = twist > 0.3 ? top : top - 1;
        put(s, x, y, shades[x === xa ? top : x === xb && xb > xa ? 0 : Math.max(0, Math.min(top, face))]);
      }
    }
  }
  if (outlineColor) outline(s, outlineColor, { bottom: false });
  return s;
}

/** A coral head: a mound of round lumps in coral colors, pocked with polyps, a few fingers on top. */
export function coralHead(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const cw = Math.max(6, Math.round(w)), ch = Math.max(4, Math.round(h));
  const s = createSprite(cw + 2, ch + 2);
  const list: Lump[] = [];
  const n = cw < 10 ? 2 : cw < 18 ? 3 : 4;
  for (let i = 0; i < n; i++) {
    const r = (cw / n) * rng.range(0.6, 0.75);
    list.push({ cx: 1 + ((i + 0.5) / n) * cw + rng.range(-1, 1), cy: 1 + ch - r * rng.range(0.7, 0.95), r });
  }
  list.push({ cx: 1 + cw * rng.range(0.35, 0.65), cy: 1 + ch * 0.45, r: Math.min(cw, ch) * 0.38 });
  list.sort((a, b) => a.cy - b.cy);
  lumps(s, list, shades, seed, 0.02);
  // Polyps: a sprinkle of dark pits and light rims on the lit side.
  for (let k = 0; k < (cw * ch) / 14; k++) {
    const x = rng.int(1, cw), y = rng.int(1, ch);
    if (!opaque(s, x, y) || !opaque(s, x + 1, y) || !opaque(s, x, y + 1)) continue;
    put(s, x, y, shades[0]);
    put(s, x + 1, y + 1, shades[shades.length - 1]);
  }
  for (let y = ch + 1; y < s.h; y++) for (let x = 0; x < s.w; x++) s.data[(y * s.w + x) * 4 + 3] = 0;
  outline(s, outlineColor, { bottom: false });
  return s;
}

/** Staghorn coral: thick branches forking upward with rounded tips, lit on the left. */
export function staghorn(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const cw = Math.max(6, Math.round(w)), chh = Math.max(6, Math.round(h));
  const s = createSprite(cw + 4, chh + 3);
  const top = shades.length - 1;
  const thick = Math.max(1, Math.round(cw / 9));
  const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
    for (let i = 0; i < len; i++) {
      x += Math.sin(ang) * 0.9;
      y -= Math.cos(ang) * 0.9;
      for (let d = -thick; d <= thick; d++) {
        const px = Math.round(x + d), py = Math.round(y);
        put(s, px, py, shades[d < 0 ? top : d > 0 || thick === 0 ? Math.max(0, top - 2) : top - 1]);
      }
      ang += rng.range(-0.06, 0.06);
    }
    if (depth > 0 && len > 2) {
      branch(x, y, ang - rng.range(0.35, 0.65), len * rng.range(0.55, 0.75), depth - 1);
      branch(x, y, ang + rng.range(0.35, 0.65), len * rng.range(0.55, 0.75), depth - 1);
    } else {
      // A pale rounded tip.
      put(s, Math.round(x), Math.round(y) - 1, shades[top]);
    }
  };
  const n = cw > 14 ? 3 : 2;
  for (let i = 0; i < n; i++) branch(2 + ((i + 0.5) / n) * cw, s.h - 1, (i - (n - 1) / 2) * 0.45 + rng.range(-0.1, 0.1), chh * 0.42, 2);
  outline(s, outlineColor, { bottom: false });
  return s;
}

/** A sea fan: a flat fan of lattice on a short stalk, facing the viewer. */
export function seaFan(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const fw = Math.max(6, Math.round(w)), fh = Math.max(6, Math.round(h));
  const s = createSprite(fw + 2, fh + 2);
  const cx = 1 + fw / 2, base = s.h - 1;
  const top = shades.length - 1;
  const ph = rng.range(0, 6);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const dx = (x + 0.5 - cx) / (fw / 2), dy = (base - y - 0.5) / fh;
      const r = Math.hypot(dx, dy * 1.05);
      if (dy < 0.12) {
        if (Math.abs(x + 0.5 - cx) < 1) put(s, x, y, shades[1]);
        continue;
      }
      if (r > 0.98 + Math.sin(Math.atan2(dy, dx) * 9 + ph) * 0.04) continue;
      // Ribs fanning out from the stalk, crossed by rings: a lattice with holes.
      const a = Math.atan2(dy, dx) * 7, ring = r * 7;
      const rib = Math.abs(a - Math.round(a)) < 0.18, hoop = Math.abs(ring - Math.round(ring)) < 0.2;
      if (!rib && !hoop && r > 0.25) continue;
      put(s, x, y, shades[dx < -0.2 ? top : dx > 0.3 ? 1 : top - 1]);
    }
  }
  outline(s, outlineColor, { bottom: false });
  return s;
}

/** A sea anemone: a squat column with a crown of soft tentacles, tips lit. */
export function anemone(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const aw = Math.max(5, Math.round(w)), ah = Math.max(4, Math.round(h));
  const s = createSprite(aw + 4, ah + 2);
  const top = shades.length - 1;
  const n = Math.max(3, Math.round(aw / 1.6));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x0 = 2 + t * aw;
    const lean = (t - 0.5) * 2 * rng.range(0.6, 1.2);
    const len = ah * rng.range(0.7, 1) * (1 - Math.abs(t - 0.5) * 0.6);
    for (let k = 0; k < len; k++) {
      const u = k / len;
      const x = Math.round(x0 + lean * u * u * ah * 0.4), y = s.h - 1 - k;
      put(s, x, y, u > 0.75 ? shades[top] : shades[t < 0.45 ? top - 1 : Math.max(0, top - 2)]);
    }
  }
  outline(s, outlineColor, { bottom: false });
  return s;
}

/** A starfish lying on the sand: five arms, a lit upper-left half, a pale middle. */
export function starfish(size: number, shades: Ramp, seed: number): Sprite {
  const rng = new Rng(seed);
  const d = Math.max(5, Math.round(size));
  const s = createSprite(d + 2, Math.max(4, Math.round(d * 0.6)) + 2);
  const cx = s.w / 2, cy = s.h / 2, rx = d / 2, ry = (s.h - 2) / 2;
  const rot = rng.range(0, Math.PI * 2);
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) + rot;
      // Arms: the radius swells five times around.
      const arm = 0.38 + 0.62 * Math.pow(Math.abs(Math.cos((a * 5) / 2)), 3);
      if (r > arm) continue;
      const lit = -dx * 0.5 - dy * 0.7 > 0 ? 1 : 0;
      put(s, x, y, shades[r < 0.25 ? shades.length - 1 : 1 + lit]);
    }
  }
  outline(s, shades[0], { bottom: false });
  return s;
}

/** Branching coral. */
export function coral(w: number, h: number, shades: Ramp, outlineColor: Rgb, seed: number): Sprite {
  const rng = new Rng(seed);
  const cw = Math.max(5, Math.round(w)), chh = Math.max(5, Math.round(h));
  const s = createSprite(cw + 2, chh + 2);
  const branch = (x: number, y: number, ang: number, len: number, width: number, depth: number) => {
    for (let i = 0; i < len; i++) {
      x += Math.sin(ang);
      y -= Math.cos(ang);
      for (let d = -width / 2; d <= width / 2; d += 0.5) {
        const px = Math.round(x + d), py = Math.round(y);
        put(s, px, py, shades[d < 0 ? 2 : d > 0.2 ? 0 : 1]);
      }
      ang += rng.range(-0.08, 0.08);
    }
    if (depth > 0) {
      branch(x, y, ang - rng.range(0.35, 0.7), len * 0.65, Math.max(1, width - 0.5), depth - 1);
      branch(x, y, ang + rng.range(0.35, 0.7), len * 0.65, Math.max(1, width - 0.5), depth - 1);
    }
  };
  branch(1 + cw / 2, s.h - 1, rng.range(-0.15, 0.15), chh * 0.42, Math.max(1.5, cw / 6), 2);
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

/**
 * The Battle Tower's lamp posts (the battle room's corner lamps): a round
 * column on a wider foot, a glowing teal ring under a yellow glass globe, and
 * a soft dithered halo of light around the globe. `w` is the column's width.
 */
export function lampPost(w: number, h: number, metal: Ramp, glass: Ramp, ring: Ramp, outlineColor: Rgb, halo?: Rgb): Sprite {
  const pw = Math.max(5, Math.round(w)), ph = Math.max(10, Math.round(h));
  const pad = halo ? Math.max(2, Math.round(pw * 0.45)) : 1;
  const s = createSprite(pw + 2 * pad, ph + pad + 1);
  const cx = pad + pw / 2;
  const globeR = pw * 0.5;
  const globeCy = pad + globeR;
  const ringY0 = Math.round(globeCy + globeR * 0.55), ringY1 = ringY0 + Math.max(1, Math.round(ph * 0.05));
  const top = metal.length - 1;
  for (let y = 0; y < s.h - 1; y++) {
    for (let x = 0; x < s.w; x++) {
      const px = x + 0.5 - cx;
      // The globe: lit from the upper left, a white glint.
      if (y + 0.5 < ringY0) {
        const d = Math.hypot(px, y + 0.5 - globeCy) / globeR;
        if (d > 1) continue;
        const l = sphereLight(x, y, cx, globeCy, globeR);
        put(s, x, y, band(glass, l * (glass.length - 0.2) + 0.3, x, y, 0.25));
        continue;
      }
      // The column (wider at the foot and under the ring), shaded as a cylinder.
      const foot = y >= s.h - 1 - Math.max(2, Math.round(ph * 0.1));
      const r = foot || (y >= ringY0 && y < ringY1 + 1) ? pw / 2 : pw / 2 - 1;
      const u = px / r;
      if (Math.abs(u) > 1) continue;
      if (y >= ringY0 && y < ringY1) {
        put(s, x, y, ring[u < -0.2 ? 2 : u < 0.5 ? 1 : 0]);
        continue;
      }
      let v = (0.62 - u * 0.55) * (top + 0.4);
      if (y === ringY1 || (foot && y === s.h - 1 - Math.max(2, Math.round(ph * 0.1)))) v += 0.8; // lips catch the light
      put(s, x, y, band(metal, v, x, y, 0.2));
    }
  }
  outline(s, outlineColor, { bottom: false });
  // A halo of light around the globe, dithered, on the empty pixels only.
  if (halo) {
    const hr = globeR + pad + 0.5;
    for (let y = 0; y < ringY1 + 2; y++) {
      for (let x = 0; x < s.w; x++) {
        if (opaque(s, x, y)) continue;
        const d = Math.hypot(x + 0.5 - cx, (y + 0.5 - globeCy) * 1.1) / hr;
        if (d < 1 && (1 - d) * 0.9 > bayer(x, y) + 0.12) put(s, x, y, halo);
      }
    }
  }
  return s;
}

/** A soft, dithered light shaft (for underwater): opaque pixels where the dither passes. */
export function lightShaft(w: number, h: number, color: Rgb, strength: number, seed: number): Sprite {
  const s = createSprite(Math.max(2, Math.round(w)), Math.max(2, Math.round(h)));
  const lean = s.h * 0.35;
  for (let y = 0; y < s.h; y++) {
    const t = y / s.h;
    const x0 = (1 - t) * lean * 0.3;
    for (let x = 0; x < s.w; x++) {
      const u = (x - x0) / (s.w - lean * 0.3);
      if (u < 0 || u > 1) continue;
      const a = strength * Math.sin(u * Math.PI) * (1 - t) * (0.7 + 0.3 * Math.sin(seed + u * 9));
      if (a > bayer(x, y)) put(s, x, y, color);
    }
  }
  return s;
}

/** A sand dune: a smooth hump, lit on the left, a crisp ridge, the lee side in shadow. */
export function dune(w: number, h: number, shades: Ramp, seed: number): Sprite {
  const rng = new Rng(seed);
  const dw = Math.max(8, Math.round(w)), dh = Math.max(3, Math.round(h));
  const s = createSprite(dw, dh);
  const peak = rng.range(0.4, 0.6);
  const top = shades.length - 1;
  for (let x = 0; x < dw; x++) {
    const u = (x + 0.5) / dw;
    const hump = u < peak ? Math.pow(u / peak, 0.8) : Math.pow((1 - u) / (1 - peak), 1.3);
    const colH = Math.round(dh * Math.sin((hump * Math.PI) / 2));
    for (let k = 0; k < colH; k++) {
      const y = dh - 1 - k;
      const lit = u < peak ? 0.75 + 0.25 * (1 - k / Math.max(1, colH)) : 0.25;
      const ridge = Math.abs(u - peak) < 1.5 / dw;
      put(s, x, y, ridge ? shades[top] : band(shades, lit * top, x, y, 0.3));
    }
  }
  return s;
}

/** A shelf of rock: a wall face with ledges and cracks (cliffs, the cave's back wall). */
export function rockWall(w: number, h: number, pal: RockPalette, seed: number): Sprite {
  const rng = new Rng(seed);
  const rw = Math.max(8, Math.round(w)), rh = Math.max(6, Math.round(h));
  const s = createSprite(rw, rh);
  const top = pal.shades.length - 1;
  // A ragged top edge, horizontal ledges with lit tops and shadowed faces.
  const edge: number[] = [];
  let y0 = rng.range(0, rh * 0.2);
  for (let x = 0; x < rw; x++) {
    y0 += rng.range(-1, 1) * 0.8;
    y0 = Math.max(0, Math.min(rh * 0.35, y0));
    edge.push(Math.round(y0));
  }
  const ledges: number[] = [];
  for (let y = rng.int(4, 8); y < rh; y += rng.int(5, 9)) ledges.push(y);
  for (let x = 0; x < rw; x++) {
    for (let y = edge[x]; y < rh; y++) {
      const onLedge = ledges.some((l) => y === l + Math.round(Math.sin(x * 0.2 + l) * 1.2));
      const underLedge = ledges.some((l) => y === l + 1 + Math.round(Math.sin(x * 0.2 + l) * 1.2));
      let v = top * 0.45 + (hash2(Math.floor(x / 3), Math.floor(y / 4), seed) - 0.5) * 1.2;
      if (y === edge[x] || onLedge) v = top;
      if (underLedge) v = 0.4;
      put(s, x, y, band(pal.shades, v, x, y, 0.3));
    }
  }
  // Vertical cracks.
  for (let c = 0; c < rw / 10; c++) {
    let x = rng.range(0, rw);
    for (let y = rng.int(edge[Math.floor(x)] ?? 0, rh - 4); y < rh; y++) {
      if (rng.chance(0.3)) x += rng.range(-1, 1);
      if (opaque(s, Math.round(x), y)) put(s, Math.round(x), y, pal.shades[0]);
      if (rng.chance(0.08)) break;
    }
  }
  return s;
}
