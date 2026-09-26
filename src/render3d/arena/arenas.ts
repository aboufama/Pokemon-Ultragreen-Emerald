// The battle arenas, one per kind of place, painted in Hoenn's colors (the
// overworld tilesets' palettes: mint route grass, round trees, pink-brown
// rock, desert sand, sea blues, cave browns, Mt. Chimney's ash and lava, the
// Battle Tower's yellow grid floor). No platforms: the Pokémon stand on the
// ground itself, with their shadows.

import { MAT, type Ramp, type Rgb, type Sprite, band, bayer, cells, fbm, hash2, hex, noise, ramp, smoothstep } from './art';
import { type ArenaContext, type ArenaDesign, addProp, at, darker, fill, frameProp, hills, scatter, shafts, shift, stand } from './design';
import { anemone, bush, coralHead, crag, lampPost, wisp, seaFan, staghorn, reeds, rock, seaweed, stalagmite, starfish, tallGrass, tree } from './sprites';

// Hoenn's greens (general tileset): route grass, tall grass and tree leaves.
const MEADOW = ramp('#287a54', '#3c9f72', '#56b98b', '#73c5a4', '#8dd3b4', '#a9e0c8');
const BLADES = ramp('#398b31', '#83c562', '#b4ff83');
const LEAVES = ramp('#1d5a20', '#398b31', '#5ea846', '#83c562', '#b4ff83');
const TREE_OUTLINE = hex('#233f0c');
const TRUNK = ramp('#413931', '#6a5a5a', '#9c7373');
const FLOWERS: Rgb[][] = [
  [hex('#e8505a'), hex('#ffd89c')], // red, yellow middle
  [hex('#f8f8f8'), hex('#ffe070')], // white
  [hex('#f0a0c8'), hex('#fff0a0')], // pink
];

const PATH = ramp('#b98f4c', '#cda462', '#decd83', '#eee6a4');

interface MeadowOptions {
  grass: typeof MEADOW;
  blades: typeof BLADES;
  leaves: typeof LEAVES;
  flowers?: number;
  /** Where the tree line starts (z). */
  treeLine?: number;
  tallGrass?: number;
  /** A sandy path across the field behind the wild Pokémon. */
  path?: boolean;
  /** A pond behind the wild Pokémon (world center and radii). */
  pond?: { x: number; z: number; rx: number; rz: number };
  /** Rain puddles scattered in the grass. */
  puddles?: number;
  /** Taller clumps of tall grass (1 = knee high). */
  tallGrassHeight?: number;
}

// Pond water (Hoenn's fresh water): deep edge to sunlit middle.
const POND = ramp('#2b4c8a', '#3f67a8', '#4f86c8', '#63a6e6', '#7cc0f4', '#a6daf8');
const LILY = ramp('#2d6a1f', '#4f9a33', '#83c562');
const REED_STEM = ramp('#2d5a1a', '#4a8a2a', '#83b552');
const REED_HEAD = ramp('#5a3a21', '#8a5a31');

/** Index of a color in a ramp (-1 if absent). */
const indexIn = (r: readonly Rgb[], c: Rgb | null) => (c ? r.findIndex((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]) : -1);

/** A 1-2 row mark ("v" of two blades, or a dot far away) sized for its distance. */
function grassMark(ctx: ArenaContext, sx: number, sy: number, ppu: number, dark: Rgb, light: Rgb | null, mat: number): void {
  const g = ctx.ground;
  if (ppu < 24) {
    g.set(sx, sy, dark, mat);
  } else if (ppu < 44) {
    g.set(sx - 1, sy - 1, dark, mat);
    g.set(sx + 1, sy - 1, dark, mat);
    g.set(sx, sy, dark, mat);
  } else {
    g.set(sx - 2, sy - 2, dark, mat);
    g.set(sx - 1, sy - 1, dark, mat);
    g.set(sx + 1, sy - 2, dark, mat);
    g.set(sx + 1, sy - 1, dark, mat);
    g.set(sx, sy, dark, mat);
    if (light) g.set(sx, sy - 2, light, mat);
  }
}

/**
 * A short sand ripple: a crest arching a pixel up in the middle, a shade
 * lighter along its ramp, its shadow a shade darker below and to the right.
 */
function rippleMark(ctx: ArenaContext, sx: number, sy: number, len: number, ramps: Ramp[]): void {
  const g = ctx.ground;
  const tweak = (x: number, y: number, steps: number) => {
    const c = g.get(x, y);
    if (c && g.material(x, y) !== MAT.BACKDROP) g.set(x, y, shift(ramps, c, steps), g.material(x, y));
  };
  const x0 = sx - Math.floor(len / 2);
  for (let i = 0; i < len; i++) {
    const inner = i > 0 && i < len - 1;
    const y = sy - (len >= 5 && inner ? 1 : 0);
    tweak(x0 + i, y, 1);
    if (inner) tweak(x0 + i + 1, y + 1, -1);
  }
}

/** A Hoenn route meadow: mint grass in soft patches, little blade marks, flowers, a path, a tree line behind. */
function meadow(ctx: ArenaContext, o: MeadowOptions): void {
  const G = o.grass;
  const pathZ = (x: number) => 12.6 + Math.sin(x * 0.21 + 1.3) * 1.2 + Math.sin(x * 0.53) * 0.3;
  const pathHalf = 1.25;
  const onPath = (x: number, z: number) => (o.path ? Math.abs(z - pathZ(x)) - pathHalf : 1);
  // Water: the pond (a blob with a wobbly shore) and puddles.
  const pondD = (x: number, z: number) => {
    if (!o.pond) return 1;
    const p = o.pond;
    const a = Math.atan2(z - p.z, x - p.x);
    const wob = 1 + Math.sin(a * 3 + 1.1) * 0.08 + Math.sin(a * 5 + 0.4) * 0.05;
    return Math.hypot((x - p.x) / p.rx, (z - p.z) / p.rz) - wob;
  };
  const puddles: { x: number; z: number; r: number }[] = [];
  for (let i = 0; i < (o.puddles ?? 0); i++) {
    const c = at(ctx, ctx.rng.range(-100, 340), ctx.rng.range(28, 112));
    if (Math.hypot(c.x - ctx.enemy.x, c.z - ctx.enemy.z) < 1.2 || Math.hypot(c.x - ctx.player.x, c.z - ctx.player.z) < 1.5) continue;
    puddles.push({ x: c.x, z: c.z, r: ctx.rng.range(0.35, 0.75) });
  }
  const puddleD = (x: number, z: number) => {
    let d = 1;
    for (const p of puddles) d = Math.min(d, Math.hypot((x - p.x) / p.r, (z - p.z) / (p.r * 0.7)) - 1 + Math.sin(Math.atan2(z - p.z, x - p.x) * 4 + p.x) * 0.12);
    return d;
  };
  fill(ctx, (sx, sy, g) => {
    const w = Math.min(pondD(g.x, g.z), puddleD(g.x, g.z));
    if (w < 0) {
      // Deeper toward the middle; the far bank's shadow on the water.
      const v = 2.2 + Math.min(1.6, -w * 3) + (fbm(g.x * 0.5, g.z * 0.9, 31) - 0.5) * 0.8;
      const farBank = !!o.pond && g.z > o.pond.z && w > -0.12;
      return [band(POND, farBank ? 0.6 : v, sx, sy, 0.3), MAT.WATER];
    }
    if (w < 1.4 / g.ppu + 0.03) return [G[1], MAT.SOLID];
    const d = onPath(g.x, g.z);
    if (d < 0) {
      // Sand, lighter along the middle, with a darker rim where it meets the grass.
      const px = 1 / g.ppu;
      if (d > -px * 1.2) return [PATH[1], MAT.SOLID];
      const v = 2.2 + (fbm(g.x * 0.8, g.z * 0.8, 21) - 0.5) * 1.6 + (d < -pathHalf * 0.55 ? 0.6 : 0);
      return [band(PATH, v, sx, sy, 0.25), MAT.SOLID];
    }
    const n = fbm(g.x * 0.2, g.z * 0.34, 11);
    const edge = (t: number) => smoothstep(t - 0.018, t + 0.018, n) > bayer(sx, sy);
    let c = G[3];
    if (edge(0.6)) c = G[4];
    if (edge(0.7)) c = G[5];
    if (!edge(0.37)) c = G[2];
    return [c, MAT.GRASS];
  });
  // Lily pads on the pond.
  if (o.pond) {
    scatter(ctx, 11, 41, (x, z, sx, sy, ppu, r) => {
      if (r > 0.3 || pondD(x, z) > -0.25) return;
      const w = Math.max(2, Math.round(ppu * 0.22)), h = Math.max(1, Math.round(w * 0.4));
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const u = (xx + 0.5) / w - 0.5, v = (yy + 0.5) / h - 0.5;
          if (u * u + v * v > 0.25) continue;
          if (u > 0.05 && Math.abs(v) < 0.12 && w > 4) continue; // the notch
          ctx.ground.set(sx - Math.floor(w / 2) + xx, sy - h + 1 + yy, yy === 0 ? LILY[2] : yy === h - 1 ? LILY[0] : LILY[1]);
        }
      }
      if (w > 5 && r < 0.08) ctx.ground.set(sx, sy - h, FLOWERS[2][0]);
    });
  }
  // Blade marks, darker than the patch they are on.
  scatter(ctx, 10, 3, (x, z, sx, sy, ppu, r) => {
    if (r > 0.4 || onPath(x, z) < 0.1 || ctx.ground.material(sx, sy) !== MAT.GRASS) return;
    const i = indexIn(G, ctx.ground.get(sx, sy));
    if (i < 0) return;
    grassMark(ctx, sx, sy, ppu, G[Math.max(0, i - 2)], r < 0.2 ? G[Math.min(G.length - 1, i + 1)] : null, MAT.GRASS);
  });
  // Pebbles on the path.
  if (o.path) {
    scatter(ctx, 7, 9, (x, z, sx, sy, ppu, r) => {
      if (r > 0.35 || onPath(x, z) > -0.15) return;
      ctx.ground.set(sx, sy, PATH[0]);
      if (ppu > 30) ctx.ground.set(sx + 1, sy, PATH[3]);
    });
  }
  // Flower beds: loose clusters away from the battlers and the path.
  const beds = o.flowers ?? 6;
  for (let b = 0; b < beds; b++) {
    const c = at(ctx, ctx.rng.range(-180, 420), ctx.rng.range(30, 112));
    if (Math.hypot(c.x - ctx.enemy.x, c.z - ctx.enemy.z) < 1.6 || Math.hypot(c.x - ctx.player.x, c.z - ctx.player.z) < 1.8) continue;
    const kind = FLOWERS[ctx.rng.int(0, FLOWERS.length - 1)];
    const n = ctx.rng.int(7, 14);
    for (let i = 0; i < n; i++) {
      const x = c.x + ctx.rng.range(-0.8, 0.8), z = c.z + ctx.rng.range(-0.5, 0.5);
      if (onPath(x, z) < 0.1 || pondD(x, z) < 0.15 || puddleD(x, z) < 0.2) continue;
      const [fx, fy] = ctx.view.screen(x, 0, z);
      const px = Math.floor(fx), py = Math.floor(fy);
      const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
      if (ppu > 34) {
        ctx.ground.set(px, py + 1, G[1]);
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) ctx.ground.set(px + dx, py + dy, kind[0]);
        ctx.ground.set(px, py, kind[1]);
      } else if (ppu > 20) {
        ctx.ground.set(px, py, kind[0]);
        ctx.ground.set(px + 1, py, kind[0]);
        ctx.ground.set(px, py + 1, G[1]);
      } else ctx.ground.set(px, py, kind[0]);
    }
  }
  // The tree line: staggered rows of round trees across the back, bushes in front.
  const dark = darker([G, PATH, o.leaves]);
  const line = o.treeLine ?? 15.2;
  const pal = { leaves: o.leaves, outline: TREE_OUTLINE, trunk: TRUNK };
  const trees = [];
  for (let row = 0; row < 3; row++) {
    const z0 = line + row * 1.7;
    for (let x = -24 + row * 0.9; x < 24; x += ctx.rng.range(1.6, 2.2)) {
      const z = z0 + ctx.rng.range(-0.35, 0.35);
      const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(2.2, 2.7);
      trees.push({ sprite: tree(w, pal, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.6, ry: w * 0.13 } });
    }
  }
  for (let i = 0; i < 12; i++) {
    const x = ctx.rng.range(-20, 20), z = line - ctx.rng.range(0.6, 1.8);
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.9, 1.5);
    trees.push({ sprite: bush(w, pal, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.55, ry: w * 0.12 } });
  }
  stand(ctx, trees, dark);
  // Tall grass clumps standing around the arena (props: they sway and can hide the Pokémon's feet).
  const clumps = o.tallGrass ?? 12;
  for (let i = 0, tries = 0; i < clumps && tries < 300; tries++) {
    const p = at(ctx, ctx.rng.range(-60, 300), ctx.rng.range(30, 112));
    if (onPath(p.x, p.z) < 0.3 || pondD(p.x, p.z) < 0.25 || puddleD(p.x, p.z) < 0.3) continue;
    const ppu = ctx.view.ppu(ctx.view.depth(p.x, 0, p.z));
    const w = ppu * ctx.rng.range(0.4, 0.62), h = ppu * ctx.rng.range(0.3, 0.4) * (o.tallGrassHeight ?? 1);
    if (addProp(ctx, { sprite: tallGrass(w, h, { blades: o.blades, outline: TREE_OUTLINE }, ctx.rng.int(1, 1e6)), x: p.x, z: p.z, sway: Math.max(1, h * 0.12) })) i++;
  }
  // Reeds along the pond's shore.
  if (o.pond) {
    const p = o.pond;
    for (let i = 0; i < 26; i++) {
      const a = ctx.rng.range(0, Math.PI * 2);
      const x = p.x + Math.cos(a) * p.rx * 1.02, z = p.z + Math.sin(a) * p.rz * 1.02;
      const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(0.25, 0.45), h = ppu * ctx.rng.range(0.45, 0.75);
      addProp(ctx, { sprite: reeds(w, h, REED_STEM, REED_HEAD, TREE_OUTLINE, ctx.rng.int(1, 1e6)), x, z, sway: Math.max(1, h * 0.08) });
    }
  }
}

// Hoenn's pink-brown rock (cliffs, boulders, sea stacks).
const ROCK = ramp('#624152', '#835a5a', '#9c7373', '#bd948b', '#deb4a4');
const ROCK_OUTLINE = hex('#413141');

interface Placement {
  /** Screen region to try, GBA pixels: x0, x1, y0, y1 (y is where the base stands). */
  region: [number, number, number, number];
  count: number;
  /** Size of the sprite (in world units) and how to make it. */
  make: (ppu: number) => { sprite: Sprite; sway?: number; sink?: number };
  /** Keep this far (world units) from the battlers. */
  clear?: number;
  avoid?: (x: number, z: number) => boolean;
}

/** Stand props in a screen region, never over or in front of a battler. */
function place(ctx: ArenaContext, p: Placement): void {
  for (let i = 0, tries = 0; i < p.count && tries < p.count * 30; tries++) {
    const g = ctx.view.ground(ctx.rng.range(p.region[0], p.region[1]), ctx.rng.range(p.region[2], p.region[3]));
    if (!g) continue;
    if (p.avoid?.(g.x, g.z)) continue;
    const c = p.clear ?? 0.9;
    if (Math.hypot(g.x - ctx.enemy.x, g.z - ctx.enemy.z) < c || Math.hypot(g.x - ctx.player.x, g.z - ctx.player.z) < c) continue;
    const made = p.make(g.ppu);
    if (addProp(ctx, { sprite: made.sprite, x: g.x, z: g.z, sway: made.sway, sink: made.sink })) i++;
  }
}

/**
 * A pattern of thin lines on the ground, Hoenn-style (the sea's diagonal
 * wave lines, the desert's rows of little ripples): a pixel is on a line where
 * `phase` crosses a whole number between it and its right or lower neighbor.
 * Too far away (lines closer than `maxStep` apart) they fade out.
 */
function linePattern(ctx: ArenaContext, phase: (x: number, z: number) => number, color: (base: Rgb, sx: number, sy: number) => Rgb | null, maxStep = 0.4): void {
  const { ground, view } = ctx;
  const W = ground.width;
  let prev: Float64Array | null = null;
  // Phases row by row (one row ahead) so each pixel is computed once.
  const rowPhase = (sy: number) => {
    const out = new Float64Array(W + 1);
    for (let i = 0; i <= W; i++) {
      const g = view.ground(ground.ox + i, sy);
      out[i] = g ? phase(g.x, g.z) : NaN;
    }
    return out;
  };
  let cur = rowPhase(ground.oy);
  for (let sy = ground.oy; sy < ground.oy + ground.height; sy++) {
    const next = rowPhase(sy + 1);
    for (let i = 0; i < W; i++) {
      const p = cur[i], r = cur[i + 1], d = next[i];
      if (Number.isNaN(p)) continue;
      const cross = (q: number) => !Number.isNaN(q) && Math.abs(q - p) < maxStep && Math.floor(q) !== Math.floor(p);
      if (!cross(r) && !cross(d)) continue;
      const sx = ground.ox + i;
      const base = ground.get(sx, sy);
      if (!base) continue;
      const c = color(base, sx, sy);
      if (c) ground.set(sx, sy, c, ground.material(sx, sy));
    }
    prev = cur;
    cur = next;
  }
  void prev;
}

// --- ROUTE 111: the desert ------------------------------------------------

const SAND = ramp('#b98f4c', '#cda462', '#d5b46a', '#decd83', '#eee6a4', '#f6f0c4');

function desert(ctx: ArenaContext): void {
  const S = SAND;
  fill(ctx, (sx, sy, g) => {
    const v = 3.1 + (fbm(g.x * 0.13, g.z * 0.22, 7) - 0.5) * 1.8 + smoothstep(12, 22, g.z) * 0.7;
    return [band(S, v, sx, sy, 0.3), MAT.SOLID];
  });
  // Rows of little wind ripples (light zigzags), in drifts; darker edges where drifts rise.
  const drift = (x: number, z: number) => fbm(x * 0.22, z * 0.5, 12);
  linePattern(ctx, (x, z) => z * 3.2 + Math.sin(x * 38) * 0.28 + Math.sin(x * 0.6 + z) * 0.4, (base, sx, sy) => {
    const g = ctx.view.ground(sx, sy)!;
    if (drift(g.x, g.z) < 0.47) return null;
    const i = indexIn(S, base);
    return i < 0 ? null : S[Math.min(S.length - 1, i + 1)];
  }, 0.34);
  linePattern(ctx, (x, z) => drift(x, z) * 9, (base) => {
    const i = indexIn(S, base);
    return i < 0 ? null : S[Math.max(0, i - 1)];
  }, 0.5);
  scatter(ctx, 14, 5, (_x, _z, sx, sy, ppu, r) => {
    if (r > 0.18) return;
    ctx.ground.set(sx, sy, ROCK[1]);
    if (ppu > 30) ctx.ground.set(sx + 1, sy, ROCK[3]);
  });
  // Dunes rolling away behind: hazier the farther they are.
  hills(ctx, [
    { z: 22, height: 1.6, shades: ramp('#d5b46a', '#e0c884', '#eadb9c', '#f2e8b4', '#f8f2cc'), freq: 0.22, seed: 3 },
    { z: 18.5, height: 1.4, shades: ramp('#c9a45a', '#d5b46a', '#decd83', '#eee6a4', '#f6f0c4'), freq: 0.3, seed: 7 },
    { z: 15.6, height: 0.9, shades: ramp('#b98f4c', '#cda462', '#d5b46a', '#decd83', '#eee6a4'), crest: hex('#f6f0c4'), freq: 0.42, seed: 11 },
  ]);
  const far = [];
  for (let i = 0; i < 8; i++) {
    const x = ctx.rng.range(-16, 16), z = ctx.rng.range(12, 15);
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.5, 1.2);
    far.push({ sprite: rock(w, w * 0.7, { shades: ROCK, outline: ROCK_OUTLINE }, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.6, ry: w * 0.15 } });
  }
  stand(ctx, far, darker([S, ROCK]));
  place(ctx, {
    region: [-40, 280, 34, 112],
    count: 6,
    make: (ppu) => {
      const w = ppu * ctx.rng.range(0.35, 0.8);
      return { sprite: rock(w, w * ctx.rng.range(0.55, 0.8), { shades: ROCK, outline: ROCK_OUTLINE }, ctx.rng.int(1, 1e6)), sink: 1 };
    },
  });
}

// --- ROUTE 124: the open sea ------------------------------------------------

const SEA = ramp('#29418b', '#39529c', '#415abd', '#526ad5', '#6a83d5', '#8ba4de', '#acc5e6');
const FOAM = hex('#dee6ee');

function sea(ctx: ArenaContext): void {
  const W = SEA;
  fill(ctx, (sx, sy, g) => {
    // Darker where it is deep, lighter far away (the sky on the water), and
    // long swells rolling in: a lit face and a shadowed trough.
    const swell = Math.sin(g.z * 1.5 + g.x * 0.22 + Math.sin(g.x * 0.3) * 1.2);
    const v = 3 + (fbm(g.x * 0.1, g.z * 0.18, 13) - 0.5) * 1.4 + smoothstep(12, 26, g.z) * 1.8 + (swell > 0.55 ? 0.9 : swell < -0.6 ? -0.7 : 0);
    return [band(W, v, sx, sy, 0.3), MAT.WATER];
  });
  // Hoenn's sea: long diagonal wave lines, a shade lighter, gently zigzagging.
  linePattern(ctx, (x, z) => (x * 0.55 + z) * 1.35 + Math.sin((x - z * 0.55) * 7) * 0.12, (base) => {
    const i = indexIn(W, base);
    return i < 0 ? null : W[Math.min(W.length - 1, i + 1)];
  }, 0.38);
  // Sea stacks at the sides and a few boulders, foam at their feet.
  const rocks = [];
  for (const [x, z, size] of [[11, 17.5, 3.4], [7.5, 20, 2.6], [-9, 16.5, 3], [-13, 19.5, 3.6], [2.5, 21, 1.6], [-4.5, 14.2, 1.1], [4.2, 13.2, 0.9]] as const) {
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    const w = ppu * size * ctx.rng.range(0.9, 1.1);
    rocks.push({ sprite: rock(w, w * ctx.rng.range(0.75, 1.05), { shades: ROCK, outline: ROCK_OUTLINE }, ctx.rng.int(1, 1e6)), x, z });
  }
  for (const r of rocks) {
    const [sx, sy] = ctx.view.screen(r.x, 0, r.z);
    const x0 = Math.round(sx - r.sprite.w / 2);
    for (let k = -2; k <= r.sprite.w + 2; k++) {
      if (bayer(x0 + k, Math.floor(sy)) < 0.75) ctx.ground.set(x0 + k, Math.floor(sy), FOAM, MAT.WATER);
      if (bayer(x0 + k, Math.floor(sy) + 1) < 0.35) ctx.ground.set(x0 + k, Math.floor(sy) + 1, W[5], MAT.WATER);
    }
  }
  stand(ctx, rocks, darker([W, ROCK]));
  place(ctx, {
    region: [-40, 290, 40, 112],
    count: 2,
    clear: 1.4,
    make: (ppu) => {
      const w = ppu * ctx.rng.range(0.5, 0.8);
      return { sprite: rock(w, w * 0.7, { shades: ROCK, outline: ROCK_OUTLINE }, ctx.rng.int(1, 1e6)), sink: 2 };
    },
  });
}

// --- SEAFLOOR (underwater) --------------------------------------------------

// Emerald's underwater tileset: lavender sand lit from above, fading through
// violet into the blue of deep water; teal-blue seaweed; violet-grey rock;
// coral in pinks, oranges and purples.
const UW = ramp('#18186a', '#26268f', '#3434b0', '#4a4ade', '#5f4fd6', '#734acd', '#9473de', '#b494ff', '#c5a4ff', '#d5d5ff');
const UW_WEED = ramp('#142050', '#20316a', '#395283', '#52739c', '#7394bd');
const UW_ROCK = ramp('#1c1450', '#2c226c', '#40348a', '#5a4ca6', '#7a6cc6', '#9c90e0', '#bcb4f4');
const UW_CORAL = [
  ramp('#5a1040', '#a82a64', '#e0609a', '#ffa8d0'), // pink
  ramp('#6a2a0c', '#bc5414', '#f0923a', '#ffd084'), // orange
  ramp('#6a4a08', '#b88a10', '#ecc83a', '#fff09a'), // yellow
  ramp('#0e4a44', '#1f7a62', '#48b48a', '#a4e8c0'), // sea green
];
const SHELL = ramp('#9c6ab8', '#ffc0dc', '#fff0f8');
// Deep water and what stands in it, darkest first (the far sand fades into #4a4ade).
const DEEP = ramp('#12124e', '#18186a', '#20207e', '#26268f', '#2e2ea4', '#3838ba', '#4a4ade', '#6262e8', '#7c7cf2');
const STAR = ramp('#7a2010', '#d8502c', '#f88a4a', '#ffd8a0');

function seafloor(ctx: ArenaContext): void {
  const { view } = ctx;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1.6;
  const far = (z: number) => smoothstep(9.8, 16.5, z);
  fill(ctx, (sx, sy, g) => {
    // Light from the surface pooling over the battle, dappled; the floor sinks into the blue with distance.
    const d = Math.hypot((g.x - cx) * 0.75, (g.z - cz) * 0.55) + (fbm(g.x * 0.45, g.z * 0.6, 71) - 0.5) * 1.6;
    const light = 1 - smoothstep(1.6, 4.6, d);
    const mound = (fbm(g.x * 0.32, g.z * 0.5, 3) - 0.5) * (1 - far(g.z));
    const v = 5.3 + light * 1.75 + mound * 1.0 - far(g.z) * 2.6;
    return [band(UW, v, sx, sy, 0.07), MAT.SOLID];
  });
  // Sand ripples: short crests in rows, lit on top with their shadow under them, in patches.
  const rippled = (x: number, z: number) => fbm(x * 0.34 + 3, z * 0.5, 44);
  scatter(ctx, 8, 61, (x, z, sx, sy, ppu, r) => {
    const f = rippled(x, z);
    if (z > 12 || f < 0.45 || r > (f - 0.45) * 5) return;
    const len = ppu > 52 ? 7 + Math.round(r * 5) : ppu > 38 ? 5 + Math.round(r * 3) : 3;
    rippleMark(ctx, sx, sy, len, [UW]);
  });
  // Reefs looming out of the blue behind, the nearer ones darker, their crests catching the light.
  hills(ctx, [
    { z: 22, height: 3.6, shades: DEEP.slice(3, 6), crest: DEEP[6], freq: 0.3, rough: 0.6, seed: 5 },
    { z: 16.8, height: 2.1, shades: DEEP.slice(1, 5), crest: DEEP[5], freq: 0.5, rough: 0.7, seed: 9 },
  ]);
  // A kelp forest standing in the blue: dim silhouettes, dimmer the farther.
  const farKelp = [];
  for (let x = -18; x < 18; x += ctx.rng.range(1.6, 3.4)) {
    // Clumps of a few fronds.
    const z0 = ctx.rng.range(14.4, 18.5);
    for (let k = ctx.rng.int(2, 4); k > 0; k--) {
      const xx = x + ctx.rng.range(-0.5, 0.5), z = z0 + ctx.rng.range(-0.3, 0.3);
      const ppu = view.ppu(view.depth(xx, 0, z));
      const c = z > 16.4 ? DEEP[4] : DEEP[2];
      farKelp.push({ sprite: seaweed(ppu * ctx.rng.range(0.2, 0.32), ppu * ctx.rng.range(1.2, 2.8), [c, c, c], null, ctx.rng.int(1, 1e6)), x: xx, z });
    }
  }
  stand(ctx, farKelp, (c) => c);
  // Light shafts from the surface, slanting down from the upper left through the far water onto the sand.
  const shaftList = [
    // Two in the view (one left of the wild Pokémon, one past it), more beyond for the intro's slide.
    { x: 40, w: 16, lean: 0.42, bottom: 58, strength: 0.9, lift: 2 },
    { x: 196, w: 11, lean: 0.42, bottom: 52, strength: 0.8, lift: 2 },
  ];
  for (let x = -250; x < 500; x += ctx.rng.range(70, 120)) if (x < 0 || x > 240) shaftList.push({ x, w: ctx.rng.range(9, 20), lean: 0.42, bottom: ctx.rng.range(44, 66), strength: ctx.rng.range(0.7, 0.95), lift: 2 });
  const farWater = (sx: number, sy: number) => ctx.ground.material(sx, sy) === MAT.BACKDROP || (view.ground(sx, sy)?.z ?? 0) > 11;
  shafts(ctx, shaftList, [DEEP, UW], farWater);
  // Shells, pebbles and a starfish on the sand, sparse, clear of the battlers.
  scatter(ctx, 15, 23, (x, z, sx, sy, ppu, r) => {
    if (r > 0.14 || z > 12.2) return;
    if (Math.hypot(x - ctx.enemy.x, z - ctx.enemy.z) < 1.3) return;
    const g = ctx.ground;
    if (r < 0.045 && ppu > 34) {
      g.set(sx - 1, sy, SHELL[1]);
      g.set(sx, sy, SHELL[2]);
      g.set(sx + 1, sy, SHELL[1]);
      g.set(sx, sy + 1, SHELL[0]);
    } else {
      g.set(sx, sy, UW[4]);
      if (ppu > 30) g.set(sx + 1, sy, UW[8]);
    }
  });
  // Reefs: rocks with coral growing on and around them, framing the sides (the
  // biggest in the foreground at the left), none near the battlers.
  const rockPal = { shades: UW_ROCK, outline: UW_ROCK[0] };
  type Piece = { k: 'rock' | 'head' | 'stag' | 'fan' | 'anem' | 'star'; x: number; z: number; s: number; c?: number };
  const pieces: Piece[] = [
    // Foreground, left.
    { k: 'fan', x: 2.75, z: 7.5, s: 0.62, c: 0 },
    { k: 'rock', x: 2.5, z: 7.1, s: 1.3 },
    { k: 'stag', x: 2.2, z: 7.25, s: 0.55, c: 1 },
    { k: 'head', x: 2.85, z: 6.95, s: 0.45, c: 2 },
    { k: 'rock', x: 2.0, z: 6.25, s: 0.7 },
    { k: 'anem', x: 1.72, z: 6.55, s: 0.3, c: 0 },
    { k: 'head', x: 1.85, z: 6.1, s: 0.34, c: 0 },
    // Midground, left.
    { k: 'rock', x: 3.1, z: 9.7, s: 1.0 },
    { k: 'stag', x: 2.8, z: 9.95, s: 0.42, c: 2 },
    { k: 'anem', x: 2.55, z: 9.5, s: 0.24, c: 2 },
    { k: 'head', x: 2.2, z: 12.6, s: 0.4, c: 0 },
    { k: 'fan', x: 1.4, z: 13.1, s: 0.45, c: 2 },
    // Behind the enemy, far right.
    { k: 'rock', x: -3.6, z: 11.8, s: 1.3 },
    { k: 'fan', x: -3.2, z: 12.2, s: 0.5, c: 0 },
    { k: 'stag', x: -4.0, z: 12.0, s: 0.5, c: 1 },
    { k: 'head', x: -3.1, z: 11.7, s: 0.36, c: 2 },
    { k: 'rock', x: -2.4, z: 13.4, s: 0.8 },
    { k: 'anem', x: -2.1, z: 13.2, s: 0.26, c: 0 },
    // On the sand.
    { k: 'star', x: 1.55, z: 8.2, s: 0.28 },
    { k: 'star', x: -2.6, z: 10.1, s: 0.26 },
  ];
  const standing = pieces.map((p) => {
    const ppu = view.ppu(view.depth(p.x, 0, p.z));
    const c = UW_CORAL[p.c ?? 0];
    const seed = ctx.rng.int(1, 1e6);
    const w = ppu * p.s;
    switch (p.k) {
      case 'rock': return { sprite: rock(w, w * 0.56, rockPal, seed), x: p.x, z: p.z, shadow: { rx: w * 0.62, ry: w * 0.13 } };
      case 'head': return { sprite: coralHead(w * 1.2, w * 0.8, c, c[0], seed), x: p.x, z: p.z };
      case 'stag': return { sprite: staghorn(w, w * 1.1, c, c[0], seed), x: p.x, z: p.z };
      case 'fan': return { sprite: seaFan(w, w * 1.05, c, c[0], seed), x: p.x, z: p.z };
      case 'anem': return { sprite: anemone(w * 1.3, w, c, c[0], seed), x: p.x, z: p.z };
      default: return { sprite: starfish(w, STAR, seed), x: p.x, z: p.z };
    }
  });
  stand(ctx, standing, darker([UW, UW_ROCK]));
  // Seaweed swaying at the edges of the view and beyond, and a few fronds farther back.
  const weed = (ppu: number, tall: number) => ({ sprite: seaweed(ppu * ctx.rng.range(0.3, 0.5), ppu * tall * ctx.rng.range(0.8, 1.2), UW_WEED.slice(1, 4), UW_WEED[0], ctx.rng.int(1, 1e6)), sway: ppu * 0.05 + 1 });
  // Framing the view: fronds at its left and right edges, cropped by the frame.
  frameProp(ctx, 2, 84, -1, (ppu) => weed(ppu, 2.3));
  frameProp(ctx, 12, 64, -1, (ppu) => weed(ppu, 1.7));
  frameProp(ctx, 232, 70, 1, (ppu) => weed(ppu, 2.4));
  frameProp(ctx, 238, 52, 1, (ppu) => weed(ppu, 1.9));
  place(ctx, { region: [-240, -10, 30, 112], count: 10, make: (ppu) => weed(ppu, 1.7) });
  place(ctx, { region: [250, 480, 30, 112], count: 10, make: (ppu) => weed(ppu, 1.7) });
  for (const [sx, sy] of [[28, 30], [214, 24], [104, 22]] as const) {
    const g = view.ground(sx, sy)!;
    addProp(ctx, { x: g.x, z: g.z, ...weed(g.ppu, 1.2) });
  }
}

// --- MT. CHIMNEY --------------------------------------------------------------

// Lavaridge's tileset: pink-beige ash, red-brown volcanic rock, the crater's
// orange lava; the ash warms toward orange in the lava's light.
const ASH = ramp('#9c6252', '#bd8373', '#d59c8b', '#deb4a4', '#eebdac', '#eed5cd', '#f6e6de');
const WARM = ramp('#ac6231', '#c5834a', '#e69452', '#eeb48b', '#f6d0b0');
const BASALT = ramp('#2c1220', '#411418', '#623931', '#833120', '#9c6252');
const LAVA = ramp('#621000', '#943100', '#cd3100', '#e65a1a', '#ff7341', '#f69400', '#ffd573');
const WALL = ramp('#623931', '#734a42', '#835a52', '#9c7373', '#bd8373');
const STEAM = ramp('#b49c9c', '#d5c5c5', '#eee2de');

/**
 * Mt. Chimney: an ash slope running up to a river of lava below the crater's
 * wall. The lava churns (crusted plates on a glowing flow), its light warms
 * the ash and glows in the cracks of the basalt near it; steam rises off it.
 * Ash lies in soft drifts between patches of bare dark rock; basalt boulders
 * frame the sides.
 */
function chimney(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1;
  // The lava river winding across the back.
  const riverZ = (x: number) => 15.4 + Math.sin(x * 0.33 + 0.8) * 0.9 + Math.sin(x * 0.9 + 2) * 0.3;
  const riverW = (x: number) => 1.25 + Math.sin(x * 0.5 + 2) * 0.35;
  const river = (x: number, z: number) => Math.abs(z - riverZ(x)) - riverW(x);
  // Bare basalt showing through the ash, in patches, cracked into columns.
  const rockyAt = (x: number, z: number) => fbm(x * 0.32 + 7, z * 0.55, 21) + smoothstep(3, 6, Math.abs(x - cx)) * 0.12;
  const plate = (x: number, z: number) => cells(x / 0.75, z / 0.5, 41).id;
  const joint = (x: number, z: number) => cells(x / 0.42, z / 0.3, 42).id;
  fill(ctx, (sx, sy, g) => {
    const gr = view.ground(sx + 1, sy)!, gd = view.ground(sx, sy + 1)!;
    const d = river(g.x, g.z);
    if (d < 0) {
      // The flow: molten down its middle in streaks; toward the banks it crusts into dark plates with glowing seams.
      const depth = Math.min(1, -d / riverW(g.x));
      const crusted = depth + (fbm(g.x * 0.8, g.z * 1.6, 3) - 0.5) * 0.7 < 0.45;
      if (crusted) {
        const id = plate(g.x, g.z);
        const seam = plate(gr.x, gr.z) !== id || plate(gd.x, gd.z) !== id;
        if (seam) return [LAVA[4], MAT.LAVA];
        return [LAVA[id < 0.3 ? 0 : 1], MAT.LAVA];
      }
      const streak = Math.sin(g.x * 1.3 + Math.sin(g.z * 2.3) * 1.2 + g.z * 0.6);
      const v = 3.2 + depth * 1.5 + (streak > 0.82 ? 1 : 0);
      return [band(LAVA, v, sx, sy, 0.1), MAT.LAVA];
    }
    // The bank: a lip of black rock, glowing where the lava licks it.
    if (d < 0.06 + 1.1 / g.ppu) return [d < 0.05 ? LAVA[3] : BASALT[0], d < 0.05 ? MAT.LAVA : MAT.SOLID];
    const glow = 1 - smoothstep(0, 2.4, d);
    const rocky = rockyAt(g.x, g.z);
    if (rocky > 0.6) {
      // Basalt: columns of dark rock, each a shade of its own, their joints dark or glowing near the lava; a lit rim along the patch.
      const id = joint(g.x, g.z);
      const seam = joint(gr.x, gr.z) !== id || joint(gd.x, gd.z) !== id;
      if (seam) return glow > 0.45 ? [LAVA[glow > 0.75 ? 4 : 3], MAT.LAVA] : [BASALT[0], MAT.SOLID];
      if (rocky < 0.62) return [BASALT[4], MAT.SOLID];
      return [BASALT[1 + Math.floor(id * 2.99)], MAT.SOLID];
    }
    // Ash: lit over the battle, darker toward the sides; drifts a shade lighter; warmed by the lava.
    const light = 1 - smoothstep(0.5, 1.3, Math.hypot((g.x - cx) / 3.3, (g.z - cz) / 4.5));
    // Drifts: long banks of lighter ash, a crisp shadow along their lee (near) side.
    const drift = (x: number, z: number) => fbm(x * 0.17, z * 0.8, 23);
    const inDrift = drift(g.x, g.z) > 0.56;
    let v = 2.6 + light * 1.6 + (inDrift ? 1 : 0) + (fbm(g.x * 0.9, g.z * 1.2, 24) - 0.5) * 0.5;
    if (inDrift && drift(gd.x, gd.z) <= 0.56) v -= 1.6;
    if (rocky > 0.54) v -= 1; // thin ash over the rock
    if (glow > 0.12 && glow * 1.4 > bayer(sx, sy) + 0.25) return [band(WARM, v - 1.6 + glow * 1.4, sx, sy, 0.2), MAT.SOLID];
    return [band(ASH, v, sx, sy, 0.12), MAT.SOLID];
  });
  // Drifts' soft ripples and pebbles of cinder on the ash.
  scatter(ctx, 8, 29, (x, z, sx, sy, ppu, r) => {
    if (ground.material(sx, sy) !== MAT.SOLID || indexIn(ASH, ground.get(sx, sy)) < 0) return;
    if (r < 0.22 && fbm(x * 0.17, z * 0.8, 23) > 0.5) rippleMark(ctx, sx, sy, ppu > 50 ? 5 : ppu > 34 ? 4 : 3, [ASH]);
    else if (r > 0.95) {
      ground.set(sx, sy, BASALT[2]);
      if (ppu > 34) ground.set(sx + 1, sy, BASALT[3]);
    }
  });
  // The crater's wall rising behind the lava: dark rock, lit along its crests, the far rim hazier.
  hills(ctx, [
    { z: 26, height: 5.5, shades: WALL, crest: hex('#bd948b'), freq: 0.22, rough: 0.7, seed: 13 },
    { z: 18.6, height: 2.6, shades: BASALT, crest: ASH[1], freq: 0.42, rough: 0.9, seed: 17 },
  ]);
  // Steam rising off the lava, drifting right, before the crater wall.
  const steam = [];
  for (let x = -14; x < 14; x += ctx.rng.range(0.9, 2.2)) {
    const z = riverZ(x) + ctx.rng.range(-0.4, 0.6);
    const ppu = view.ppu(view.depth(x, 0, z));
    steam.push({ sprite: wisp(ppu * ctx.rng.range(0.1, 0.16), ppu * ctx.rng.range(0.8, 1.5), STEAM, ctx.rng.int(1, 1e6), ctx.rng.range(0.1, 0.3)), x, z });
  }
  // The lava's glow on the foot of the crater wall.
  for (let sx = ground.ox; sx < ground.ox + ground.width; sx++) {
    let top = -1;
    for (let sy = ground.oy; sy < ground.oy + ground.height; sy++) if (ground.material(sx, sy) === MAT.LAVA) { top = sy; break; }
    if (top < 0) continue;
    for (let k = 1; k <= 7; k++) {
      const y = top - k;
      if (ground.material(sx, y) !== MAT.BACKDROP || (1 - k / 8) * 0.9 <= bayer(sx, y)) continue;
      ground.set(sx, y, shift([WALL, BASALT], ground.get(sx, y)!, 1), MAT.BACKDROP);
    }
  }
  stand(ctx, steam, (c) => c);
  // Basalt boulders and spires at the sides, the biggest framing the foreground at the left.
  const pal = { shades: BASALT, outline: BASALT[0] };
  const lit = { shades: ramp('#411418', '#623931', '#833120', '#9c6252', '#bd8373'), outline: BASALT[0] };
  const standing = [];
  for (const [x, z, w, h] of [[2.45, 7.2, 1.2, 0.75], [2.05, 6.3, 0.6, 0.4], [3.0, 9.8, 1.1, 0.8], [2.6, 12.4, 0.8, 0.5], [-3.3, 11.2, 1.2, 0.85], [-2.7, 12.6, 0.7, 0.45], [-3.2, 9.2, 0.8, 0.5]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    standing.push({ sprite: crag(ppu * w, ppu * h, x > 0 ? pal : lit, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * w * 0.6, ry: ppu * w * 0.13 } });
  }
  for (const [x, z, s] of [[2.3, 11.6, 0.9], [-2.4, 13.2, 0.7]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    standing.push({ sprite: stalagmite(ppu * s * 0.5, ppu * s * 1.3, lit, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * s * 0.35, ry: ppu * 0.07 } });
  }
  stand(ctx, standing, darker([ASH, BASALT, WARM]));
}

// --- GRANITE CAVE -------------------------------------------------------------

// The cave tileset's browns: sandy floor and pale boulders in the light,
// down through rust browns to the purple-brown of the dark (cool shadows,
// warm light).
const GC = ramp('#1a0e16', '#2c1826', '#412941', '#522931', '#734a39', '#946a5a', '#ac8b6a', '#cdac7b', '#e6c58b', '#ffe69c');

/**
 * Granite Cave: a chamber walled in rock (its side walls receding along the
 * edges of the view, a ledge across the back with terraces rising behind it
 * into the dark, like Emerald's cave ledges), daylight falling through an
 * opening in the ceiling onto the floor behind the wild Pokémon, the battle
 * lit around it and the cave darkening toward its walls; boulders and rubble
 * at the walls' feet and on the terraces.
 */
function cave(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const cam = view.camera.position;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1;
  const spot = { x: -0.25, z: 10.4 };
  // The chamber: a ledge across the back (wandering in and out), walls down the sides, terraces behind.
  const back = (x: number) => 12.9 + Math.sin(x * 0.55 + 1) * 0.45 + Math.sin(x * 1.4 + 0.3) * 0.18;
  const left = (z: number) => 2.95 + Math.sin(z * 0.9 + 0.5) * 0.18 + Math.sin(z * 2.3) * 0.06;
  const right = (z: number) => -3.05 + Math.sin(z * 0.8 + 2.1) * 0.2 + Math.sin(z * 2.1 + 1) * 0.06;
  const LEDGES = [
    { z: back, h: 0.72 },
    { z: (x: number) => 15.8 + Math.sin(x * 0.4 + 2) * 0.5 + Math.sin(x * 1.1) * 0.2, h: 1.5 },
    { z: (x: number) => 19 + Math.sin(x * 0.35 + 4) * 0.7, h: 9 },
  ];
  // What each pixel's view ray meets first: kind (0 chamber floor, 1 terrace, 2 ledge face, 3 left wall, 4 right wall), level, and the point.
  const W = ground.width, H = ground.height;
  const KIND = new Int8Array(W * H), LEVEL = new Int8Array(W * H);
  const PX = new Float32Array(W * H), PY = new Float32Array(W * H), PZ = new Float32Array(W * H);
  const trace = (X: number, G: number, i: number) => {
    const set = (k: number, lv: number, t: number) => {
      KIND[i] = k;
      LEVEL[i] = lv;
      PX[i] = cam.x + (X - cam.x) * t;
      PY[i] = cam.y * (1 - t);
      PZ[i] = cam.z + (G - cam.z) * t;
    };
    for (const [side, sgn, k] of [[left, 1, 3], [right, -1, 4]] as const) {
      if ((X - cam.x) * sgn <= 0) continue;
      let t = 0.5;
      for (let n = 0; n < 4; n++) t = (side(cam.z + (G - cam.z) * t) - cam.x) / (X - cam.x);
      if (t <= 0 || t > 1.0001) continue;
      const x = cam.x + (X - cam.x) * t, z = cam.z + (G - cam.z) * t;
      if (z < back(x)) return set(k, 0, t);
    }
    let base = 0;
    for (let lv = 0; lv < LEDGES.length; lv++) {
      const l = LEDGES[lv];
      const tf = 1 - base / cam.y;
      if (cam.z + (G - cam.z) * tf < l.z(cam.x + (X - cam.x) * tf)) return set(lv === 0 ? 0 : 1, lv, tf);
      let t = tf;
      for (let n = 0; n < 4; n++) t = (l.z(cam.x + (X - cam.x) * t) - cam.z) / (G - cam.z);
      if (cam.y * (1 - t) < l.h) return set(2, lv, t);
      base = l.h;
    }
    set(2, LEDGES.length - 1, 1);
  };
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const g = view.ground(ground.ox + i, ground.oy + j);
      if (g) trace(g.x, g.z, j * W + i);
    }
  }
  const idx = (sx: number, sy: number) => {
    const i = sx - ground.ox, j = sy - ground.oy;
    return i < 0 || j < 0 || i >= W || j >= H ? -1 : j * W + i;
  };
  /** Light on the chamber floor: the daylight's spot, the battle around it, dark toward the walls. */
  const floorLight = (x: number, z: number) => {
    const s = Math.hypot((x - spot.x) / 1.3, (z - spot.z) / 1.0) + (fbm(x * 1.3, z * 1.3, 83) - 0.5) * 0.3;
    const a = Math.hypot((x - cx) / 2.7, (z - cz) / 4.0) + (fbm(x * 0.5, z * 0.5, 84) - 0.5) * 0.35;
    const inSpot = s < 1 ? 1 : s < 1.2 ? 0.55 : 0;
    return Math.max(inSpot * 1.75 + (s < 0.5 ? 0.4 : 0), 1 - smoothstep(0.35, 1.15, a));
  };
  /**
   * Rock faces: irregular layers of rock (each a little lighter or darker, a
   * lit edge along its top and a dark seam under it), bulging here and there,
   * split now and then by a dark crack.
   */
  const rockFace = (along: number, y: number, base: number, px: number) => {
    const L = y / 0.3 + (noise(along * 0.8, y * 0.6, 92) - 0.5) * 0.9 + Math.sin(along * 1.3) * 0.15;
    const layer = Math.floor(L), f = L - layer;
    let v = base + (hash2(layer, 7, 93) - 0.5) * 0.9 + (noise(along * 1.6, layer * 3.1, 94) - 0.5) * 1.1;
    if (f < px * 1.2) v -= 1.5;
    else if (f > 1 - px * 1.2) v += 0.9;
    const c = along / 0.9 + hash2(layer, 3, 95) * 5;
    if (Math.abs(c - Math.round(c)) < px * 0.2 && hash2(layer, Math.round(c), 96) < 0.45) v -= 1.6;
    return v;
  };
  fill(ctx, (sx, sy) => {
    const i = idx(sx, sy);
    const kind = KIND[i], lv = LEVEL[i], x = PX[i], y = PY[i], z = PZ[i];
    const up = idx(sx, sy - 1), down = idx(sx, sy + 1);
    const ppu = view.ppu(view.depth(x, y, z));
    const px = 1 / (ppu * 0.3);
    // Away from the daylight the cave sinks into the dark.
    const dark = smoothstep(2.5, 7, Math.hypot(x - spot.x, (z - spot.z) * 0.8));
    if (kind === 0) {
      const L = floorLight(x, z);
      // The walls' feet: a shadow along the back ledge and the sides.
      const ao = Math.max(smoothstep(back(x) - 1.1, back(x), z), smoothstep(left(z) - 0.9, left(z), x), smoothstep(right(z) + 0.9, right(z), x));
      const v = 3.2 + L * 2.9 - ao * 1.3 + (fbm(x * 0.6, z * 0.8, 5) - 0.5) * 0.5;
      return [band(GC, v, sx, sy, 0.12), MAT.SOLID];
    }
    if (kind === 1) {
      // A terrace: a pale lip along its edge, darker sand behind.
      if (down >= 0 && (KIND[down] !== 1 || LEVEL[down] !== lv)) return [GC[lv === 1 ? 7 : 5], MAT.BACKDROP];
      const v = 4.4 - lv * 1.3 - dark * 1.6 + (fbm(x * 0.7, z * 0.9, 6) - 0.5) * 0.6;
      return [band(GC, v, sx, sy, 0.15), MAT.BACKDROP];
    }
    if (kind >= 3) {
      // The left wall faces away from the light, the right one into it.
      let v = rockFace(z * 1.4, y, kind === 3 ? 3.3 : 4.9, px) - dark * 0.8;
      if (y < 0.08) v -= 1;
      return [band(GC, v, sx, sy, 0.15), MAT.BACKDROP];
    }
    // A ledge's face, lit by the daylight's spill near the spot; the lip along its top catches the light.
    if (up >= 0 && KIND[up] === 1 && LEVEL[up] === lv + 1) return [GC[Math.max(2, Math.round(7 - lv - dark * 1.5))], MAT.BACKDROP];
    const spill = 1 - smoothstep(0.8, 3.6, Math.abs(x - spot.x - 0.3));
    let v = rockFace(x, y, 3.7 - lv * 1.1 + spill * (lv === 0 ? 1.0 : 0.3), px) - dark * (1.2 + lv * 0.4);
    if (y < 0.06) v -= 1.2;
    return [band(GC, v, sx, sy, 0.15), MAT.BACKDROP];
  });
  // The floor's texture: Emerald's cave hatching (short light strokes up to the right) in the light, and rubble.
  scatter(ctx, 7, 31, (x, z, sx, sy, ppu, r) => {
    if (ground.material(sx, sy) !== MAT.SOLID) return;
    const i = indexIn(GC, ground.get(sx, sy));
    if (i >= 5 && r < 0.3 && fbm(x * 0.5, z * 0.7, 77) > 0.47) {
      const len = ppu > 50 ? 3 : 2;
      for (let k = 0; k < len; k++) {
        const c = ground.get(sx + k, sy - k);
        if (c && ground.material(sx + k, sy - k) === MAT.SOLID) ground.set(sx + k, sy - k, shift([GC], c, 1));
      }
    } else if (r > 0.93 && i >= 0) {
      ground.set(sx, sy, GC[Math.max(0, i - 2)]);
      if (ppu > 34) ground.set(sx + 1, sy, GC[Math.min(9, i + 1)]);
    }
  });
  // Daylight through an opening in the ceiling, slanting down from the upper left onto the spot.
  const [spx, spy] = view.screen(spot.x, 0, spot.z);
  const slope = 0.3;
  shafts(ctx, [
    { x: spx - (spy - ground.oy) * slope - 16, w: 30, lean: slope, bottom: spy + 5, strength: 0.9, lift: 2 },
    { x: spx - (spy - ground.oy) * slope + 18, w: 6, lean: slope, bottom: spy - 8, strength: 0.6, lift: 1 },
  ], [GC]);
  // Boulders heaped at the walls' feet and on the terraces; stalagmites along the sides.
  const pale = { shades: ramp('#522931', '#734a39', '#946a5a', '#ac8b6a', '#cdac7b', '#e6c58b'), outline: GC[1] };
  const dim = { shades: ramp('#2c1826', '#412941', '#522931', '#734a39', '#946a5a'), outline: GC[0] };
  const heap = [];
  for (let x = -2.9; x < 2.9; x += ctx.rng.range(0.7, 1.5)) {
    const z = back(x) - ctx.rng.range(0.15, 0.5);
    if (Math.abs(x - spot.x) < 0.8) continue;
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.35, 0.75);
    const pal = Math.abs(x - spot.x) < 2.4 ? pale : dim;
    heap.push({ sprite: rock(w, w * ctx.rng.range(0.6, 0.8), pal, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.6, ry: w * 0.14 } });
    if (ctx.rng.chance(0.6)) {
      const w2 = w * ctx.rng.range(0.4, 0.6);
      heap.push({ sprite: rock(w2, w2 * 0.7, pal, ctx.rng.int(1, 1e6)), x: x + ctx.rng.range(-0.45, 0.45), z: z - ctx.rng.range(0.2, 0.5) });
    }
  }
  for (const [x, z, s] of [[2.55, 11.2, 0.7], [2.45, 9.4, 0.5], [-2.7, 11.6, 0.8], [-2.65, 10.3, 0.55], [2.6, 7.3, 0.9], [-2.7, 8.2, 0.9]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    heap.push({ sprite: rock(ppu * s, ppu * s * 0.65, dim, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * s * 0.6, ry: ppu * s * 0.13 } });
  }
  const spikes = [[2.2, 12.1, 0.8], [-2.3, 12.3, 1], [1.6, 12.5, 0.55]] as const;
  for (const [x, z, s] of spikes) {
    const ppu = view.ppu(view.depth(x, 0, z));
    heap.push({ sprite: stalagmite(ppu * s * 0.42, ppu * s * 1.4, dim, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * s * 0.3, ry: ppu * 0.06 } });
  }
  // Boulders up on the first terrace (standing on it: painted at their height).
  for (let x = -12; x < 12; x += ctx.rng.range(1.2, 2.6)) {
    const z = back(x) + ctx.rng.range(0.4, 1.6);
    const [bx, by] = view.screen(x, LEDGES[0].h, z);
    const ppu = view.ppu(view.depth(x, LEDGES[0].h, z));
    const w = ppu * ctx.rng.range(0.4, 0.8);
    const i = idx(Math.round(bx), Math.floor(by));
    if (i < 0 || KIND[i] !== 1 || LEVEL[i] !== 1) continue;
    // Not right behind a stalagmite's tip (it would read as a cap).
    if (spikes.some((sp) => Math.abs(view.screen(sp[0], 0, sp[1])[0] - bx) < w * 0.5 + 4)) continue;
    ground.sprite(rock(w, w * 0.7, dim, ctx.rng.int(1, 1e6)), Math.round(bx), Math.floor(by) + 1);
  }
  stand(ctx, heap, darker([GC]));
}

// --- BATTLE TOWER -------------------------------------------------------------

// The Battle Frontier tileset's colors: lavender greys, the yellow grid
// floor, the red trim, the lamps' yellow glass and teal rings.
const BT_GREY = ramp('#3a3a52', '#52526a', '#737383', '#9494a4', '#bdacb4', '#cdbdc5', '#ded5e6', '#ffffff');
const BT_FLOOR = ramp('#6a4a39', '#8b624a', '#a4834a', '#bd9431', '#d5b46a', '#ffd573', '#ffffac');
const BT_RED = ramp('#7b2010', '#bd2910', '#de4a20', '#ff6231');
const BT_GOLD = ramp('#bd9431', '#ffd573', '#ffffac');
const BT_TEAL = ramp('#00bd8b', '#52ffff', '#bdffff');

/**
 * The Battle Tower's battle room: a hall of lavender-grey walls (pillars with
 * glowing sconces, raised panels, a rail, niches, red banners hanging from
 * above), the yellow grid floor receding to it, lit from above (tile by tile
 * brightest down the middle, dimmer toward the sides and under the wall), a
 * polished slate court with white lines between the battlers, and the pillars
 * and lights mirrored in the polish.
 */
function tower(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const cam = view.camera.position;
  const G = BT_GREY, F = BT_FLOOR;
  const WZ = 14.2;
  const PIL = 2.6, PHW = 0.21, PX0 = 0.2;
  const T = 0.75;
  const court = { x0: -2.7, x1: 1.8, z0: 1.9, z1: WZ - 4 * T };
  const mid = (ctx.player.x + ctx.enemy.x) / 2;

  // --- the wall (x along it, height y) ---
  const pillarK = (x: number) => Math.round((x - PX0) / PIL);
  const pillarU = (x: number, y: number) => (x - PX0 - pillarK(x) * PIL) / (y < 0.2 ? PHW * 1.3 : PHW);
  const bayK = (x: number) => Math.round((x - PX0 - PIL / 2) / PIL);
  const bannerU = (x: number) => (x - PX0 - PIL / 2 - bayK(x) * PIL) / 0.3;
  const bannerBottom = (u: number) => 0.42 + Math.abs(u) * 0.14;
  const SCONCE_Y = 0.74, SCONCE_R = 0.085;
  const sconce = (x: number, y: number) => Math.hypot((x - PX0 - pillarK(x) * PIL) / SCONCE_R, (y - SCONCE_Y) / (SCONCE_R * 1.15));
  /** A zone id per wall point; outlines and bevels are drawn where it changes. */
  const zone = (x: number, y: number): number => {
    const b = bannerU(x);
    if (Math.abs(b) <= 1 && y > bannerBottom(b)) {
      if (Math.abs(b) * 0.3 / 0.09 + Math.abs(y - 0.72) / 0.12 < 1) return 21; // the emblem
      return y < bannerBottom(b) + 0.04 ? 22 : 20; // the gold hem, the cloth
    }
    if (sconce(x, y) < 1) return 30;
    if (Math.abs(pillarU(x, y)) <= 1) return 10;
    if (y < 0.03) return 0;
    if (y < 0.15) return 1;
    if (y < 0.5) {
      // Two raised panels between pillars, a stile between them (behind the banner).
      const gx = Math.abs(x - PX0 - PIL / 2 - bayK(x) * PIL);
      return gx > 0.1 && gx < PIL / 2 - PHW - 0.12 && y > 0.21 && y < 0.44 ? 4 : 3;
    }
    if (y < 0.57) return 5;
    if (y > 1.62) return 9;
    if (y > 1.55) return 8;
    // Niches in the upper wall, either side of the banner.
    const c = PX0 + PIL / 2 + bayK(x) * PIL;
    for (const ox of [c - PIL * 0.29, c + PIL * 0.29]) if (((x - ox) / 0.08) ** 2 + ((y - 0.86) / 0.16) ** 2 < 1) return 7;
    return 6;
  };
  const wallPt = (sx: number, sy: number) => {
    const g = view.ground(sx, sy);
    if (!g || g.z <= WZ) return null;
    const t = (WZ - cam.z) / (g.z - cam.z);
    return { x: cam.x + (g.x - cam.x) * t, y: cam.y * (1 - t) };
  };
  /** Light across the hall: brightest down the middle, dimmer toward the sides. */
  const sideLight = (x: number) => 1 - smoothstep(1.2, 4.2, Math.abs(x - mid));
  const wallColor = (sx: number, sy: number, w: { x: number; y: number }): Rgb => {
    const z = zone(w.x, w.y);
    const at = (dx: number, dy: number, dflt: number) => {
      const p = wallPt(sx + dx, sy + dy);
      return p ? zone(p.x, p.y) : dflt;
    };
    const zr = at(1, 0, z), zl = at(-1, 0, z), zd = at(0, 1, -1), zu = at(0, -1, z);
    const dim = sideLight(w.x) < 0.25 ? 1 : 0;
    if (z === 30) {
      // A sconce: a glowing globe with a highlight at its upper left.
      if (zr !== 30 || zd !== 30) return BT_GOLD[0];
      return BT_GOLD[zu !== 30 || zl !== 30 ? 1 : 2];
    }
    if (z >= 20) {
      const u = bannerU(w.x);
      if (zr < 20 || zl < 20 || (zd >= 0 && zd < 20)) return z === 20 ? BT_RED[0] : BT_GOLD[0];
      if (z === 21) return BT_GOLD[u > 0 && w.y > 0.72 ? 2 : 1];
      if (z === 22) return BT_GOLD[1];
      if (Math.abs(u) > 0.9) return BT_GOLD[1]; // gold edging
      return BT_RED[u > 0.5 ? 3 : u < -0.45 || Math.abs(u + 0.02) < 0.09 ? 1 : 2];
    }
    if (z === 10) {
      const u = pillarU(w.x, w.y);
      if (zr !== 10 && zr !== 30) return G[1];
      if (w.y < 0.2 && zu !== 10) return G[7]; // the foot's top edge
      let v = u > 0.5 ? 7 : u > 0.05 ? 6 : u > -0.45 ? 5 : u > -0.8 ? 3 : 2;
      if (sconce(w.x, w.y) < 2 && v > 2 && v < 7) v += 1; // the sconce's light on the pillar
      return G[Math.max(0, v - dim)];
    }
    if (z === 9) return BT_RED[w.y > 1.7 ? 3 : w.y > 1.66 ? 2 : 1];
    // Pillars and banners shade the wall to their right.
    const pu = pillarU(w.x, w.y), bu = bannerU(w.x);
    const shade = (pu < -1 && pu > -1.7) || (bu < -1 && bu > -1.25 && w.y > bannerBottom(1) - 0.05) ? 1 : 0;
    let c = [0, 1, -1, 5, 4, 6, 5, 4, 1][z] ?? 5;
    if (z === 4 && (zr !== 4 || zd !== 4)) c = 3; // panels: shadowed bottom-right edges
    else if (z === 3 && (zr === 4 || zd === 4)) c = 7; // lit top-left edges
    if (z === 5 && zu !== 5) c = 7; // the rail's lip
    if (z === 3 && zu === 5) c = 3; // the rail's shadow
    if (z === 1 && zu !== 1) c = 2; // the skirting's top
    if (z === 7) c = zu !== 7 || zl !== 7 ? 3 : zd !== 7 || zr !== 7 ? 6 : 4; // niches: shadowed at the top left, lit at the bottom right
    if ((z === 6 || z === 5) && sconce(w.x, w.y) < 2.4 && bayer(sx, sy) < 0.5) c = Math.min(7, c + 1);
    return G[Math.max(0, c - shade - (dim && c > 1 ? 1 : 0))];
  };

  // --- the floor ---
  const inCourt = (x: number, z: number) => x > court.x0 && x < court.x1 && z > court.z0 && z < court.z1;
  /** Each tile's light (a whole tile one shade, so the falloff steps cleanly along the grout). */
  const tileLight = (i: number, j: number) => {
    const x = court.x1 + (i + 0.5) * T, z = court.z1 + (j + 0.5) * T;
    const L = sideLight(x);
    return (L > 0.55 ? 4 : L > 0.15 ? 3 : 2) - (z > WZ - T ? 1 : 0);
  };
  /** The court's polished slabs: three across, six along. */
  const SLAB_X = (court.x1 - court.x0) / 3, SLAB_Z = (court.z1 - court.z0) / 6;
  const slab = (x: number, z: number) => Math.floor((x - court.x0) / SLAB_X) * 16 + Math.floor((z - court.z0) / SLAB_Z);
  fill(ctx, (sx, sy, g) => {
    const w = wallPt(sx, sy);
    if (w) return [wallColor(sx, sy, w), MAT.BACKDROP];
    const gr = view.ground(sx + 1, sy)!, gd = view.ground(sx, sy + 1)!;
    if (inCourt(g.x, g.z)) {
      // White lines around the court (wider near the camera).
      const lw = Math.max(0.06, 1.05 / g.ppu), lz = Math.max(0.03, 0.55 / g.ppu);
      if (Math.min(g.x - court.x0, court.x1 - g.x) < lw || Math.min(g.z - court.z0, court.z1 - g.z) < lz) return [G[7], MAT.SOLID];
      // Polished slate slabs, a darker seam between them.
      const k = slab(g.x, g.z);
      const seam = (inCourt(gr.x, gr.z) && slab(gr.x, gr.z) !== k) || (inCourt(gd.x, gd.z) && slab(gd.x, gd.z) !== k);
      // The far slabs catch the light at a glancing angle.
      const far = g.z > court.z1 - SLAB_Z ? 1 : 0;
      return [G[(seam ? 2 : 3) + far], MAT.SOLID];
    }
    // A dark inlay around the court.
    if (inCourt(gr.x, gr.z) || inCourt(gd.x, gd.z)) return [G[1], MAT.SOLID];
    // Tiles aligned with the court and the wall, light grout on each tile's left and far sides.
    const tx = (g.x - court.x1) / T, tz = (g.z - court.z1) / T, tzd = (gd.z - court.z1) / T;
    const rowsPx = 1 / Math.max(1e-6, tz - tzd);
    // Far away the rows crowd together: keep every other grout line.
    const step = rowsPx < 3 ? 2 : 1;
    const lineX = Math.floor(tx) !== Math.floor((gr.x - court.x1) / T);
    const lineZ = Math.floor(tz / step) !== Math.floor(tzd / step);
    const v = tileLight(Math.floor(tx), Math.floor(tz)) + (lineX || lineZ ? 1 : 0);
    if (g.z > WZ - 0.04) return [F[1], MAT.SOLID];
    return [F[Math.max(0, Math.min(F.length - 1, v))], MAT.SOLID];
  });

  // Reflections in the polish: a streak under each bright thing, a shade lighter,
  // solid near its foot and breaking into lines as it fades.
  const streak = (x0: number, x1: number, y0: number, len: number, lift: number) => {
    for (let r = 0; r < len; r++) {
      const f = r / len;
      if ((f > 0.4 && r % 2) || (f > 0.7 && r % 4)) continue;
      const yy = Math.floor(y0) + r;
      for (let xx = Math.round(x0); xx <= Math.round(x1); xx++) {
        const c = ground.get(xx, yy);
        if (!c || ground.material(xx, yy) === MAT.BACKDROP) continue;
        const i = indexIn(F, c), j = indexIn(G, c);
        if (i >= 0) ground.set(xx, yy, F[Math.min(F.length - 1, i + lift)]);
        else if (j >= 0 && j < 7) ground.set(xx, yy, G[Math.min(6, j + lift)]);
      }
    }
  };
  for (let k = pillarK(-40); k <= pillarK(40); k++) {
    const px = PX0 + k * PIL;
    const [, base] = view.screen(px, 0, WZ);
    const [la] = view.screen(px + PHW * 0.9, 0, WZ), [ra] = view.screen(px - PHW * 0.2, 0, WZ);
    const [, top] = view.screen(px, -1.2, WZ);
    streak(la, ra, base + 1, top - base, 1);
    // The sconce's glow, brighter, where the mirror shows it.
    const [cx] = view.screen(px, 0, WZ);
    const [, s0] = view.screen(px, -(SCONCE_Y - SCONCE_R), WZ), [, s1] = view.screen(px, -(SCONCE_Y + SCONCE_R * 2.5), WZ);
    streak(cx - 1, cx, s0, s1 - s0, 1);
  }

  // The lamp posts at the edges of the view (and beyond, for the intro's slide), mirrored below them.
  const metal = ramp('#52526a', '#737383', '#9494a4', '#cdbdc5', '#ded5e6', '#ffffff');
  for (const [x, z] of [[3.0, 9.4], [-3.45, 11.6], [court.x0 - 0.5, 7.4], [court.x1 + 0.7, 6.4], [court.x1 + 1.4, 12.2], [court.x0 - 1.4, 12.4]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * 0.36, h = ppu * 1.2;
    if (!addProp(ctx, { sprite: lampPost(w, h, metal, BT_GOLD, BT_TEAL, G[1], BT_GOLD[2]), x, z })) continue;
    const [lx, ly] = view.screen(x, 0, z);
    streak(lx - w * 0.35, lx + w * 0.1, ly + 1, h * 0.75, 1);
    const [, gy] = view.screen(x, -h / ppu * 0.8, z);
    streak(lx - w * 0.25, lx + w * 0.05, gy, w * 0.9, 1);
  }
}

/** Every arena, in the order the playtest lists the places. */
export const ARENAS: Record<string, ArenaDesign> = {
  grass: {
    name: 'ROUTE 101',
    about: 'A quiet grassy route near LITTLEROOT TOWN.',
    ambience: 'grass',
    paint: (ctx) => meadow(ctx, { grass: MEADOW, blades: BLADES, leaves: LEAVES, path: true }),
  },
  long_grass: {
    name: 'ROUTE 120',
    about: 'Tall grass sways in the rain-fed wind.',
    ambience: 'long_grass',
    paint: (ctx) =>
      meadow(ctx, {
        grass: ramp('#1f6a4f', '#2f8a66', '#48a37f', '#5fb392', '#79c3a6', '#93d0b8'),
        blades: ramp('#2f7a2a', '#6db353', '#9be070'),
        leaves: ramp('#17491b', '#2e7a2b', '#4c963c', '#6db353', '#9be070'),
        tallGrass: 34,
        tallGrassHeight: 1.5,
        puddles: 5,
        flowers: 2,
        treeLine: 14.2,
      }),
  },
  sand: { name: 'ROUTE 111', about: 'The desert, where sand never stops blowing.', ambience: 'sand', paint: desert },
  water: {
    name: 'ROUTE 124',
    about: 'The open sea off LILYCOVE CITY.',
    ambience: 'water',
    look: { waveLight: [172, 197, 230], waveDark: [57, 82, 156], waveDensity: 0.14 },
    ripples: 0.9,
    paint: sea,
  },
  pond: {
    name: 'ROUTE 102',
    about: 'A calm pond hidden among the trees.',
    ambience: 'pond',
    look: { waveLight: [166, 218, 248], waveDark: [63, 103, 168], waveDensity: 0.12 },
    ripples: 0,
    paint: (ctx) => meadow(ctx, { grass: MEADOW, blades: BLADES, leaves: LEAVES, pond: { x: -1.2, z: 12.4, rx: 5.2, rz: 2.3 }, tallGrass: 8, treeLine: 16.2 }),
  },
  underwater: { name: 'SEAFLOOR', about: 'Deep below the waves of ROUTE 128.', ambience: 'underwater', paint: seafloor },
  mountain: { name: 'MT. CHIMNEY', about: 'Rocky slopes dusted with volcanic ash.', ambience: 'mountain', look: { lavaHot: [255, 190, 80] }, paint: chimney },
  cave: { name: 'GRANITE CAVE', about: 'A dim cave on DEWFORD ISLAND.', ambience: 'cave', paint: cave },
  building: { name: 'BATTLE TOWER', about: 'Where trainers test their POKéMON.', ambience: 'building', paint: tower },
};

