// The battle arenas, one per kind of place, painted in Hoenn's colors (the
// overworld tilesets' palettes: mint route grass, round trees, pink-brown
// rock, desert sand, sea blues, cave browns, Mt. Chimney's ash and lava, the
// Battle Tower's yellow grid floor). No platforms: the Pokémon stand on the
// ground itself, with their shadows.

import { MAT, type Rgb, type Sprite, band, bayer, fbm, hex, ramp, smoothstep } from './art';
import { type ArenaContext, type ArenaDesign, addProp, at, darker, fill, hills, scatter, stand } from './design';
import { bush, coral, kelp, lampPost, lightShaft, reeds, rock, rockWall, stalagmite, tallGrass, tree } from './sprites';

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

const SEABED = ramp('#23306a', '#2f4282', '#3e5a9c', '#5276b6', '#6c94cc', '#8cb2de', '#b0d0ee');
const DEEP = ramp('#15204e', '#1a285c', '#20316a');
const KELP = ramp('#12463e', '#1f6a52', '#3c9270');
const CORAL = [ramp('#8a2a5a', '#c84a7a', '#f08ab0'), ramp('#8a4a1a', '#d0782a', '#f8b060'), ramp('#4a2a8a', '#7a5ac8', '#b09cf0')];
const SEA_ROCK = ramp('#1a1f40', '#2c355e', '#434d80', '#606ca0', '#8591c0');

function seafloor(ctx: ArenaContext): void {
  const S = SEABED;
  fill(ctx, (sx, sy, g) => {
    // The floor fades into the deep blue with distance.
    const fog = smoothstep(12, 21, g.z);
    if (fog > 0.02 && fog * 1.15 > bayer(sx, sy) + 0.25) return [band(DEEP, 2 - fog * 2, sx, sy, 0.4), MAT.BACKDROP];
    const v = 4.4 + (fbm(g.x * 0.16, g.z * 0.24, 3) - 0.5) * 2 - fog * 2.2;
    return [band(S, v, sx, sy, 0.3), MAT.SOLID];
  });
  const drift = (x: number, z: number) => fbm(x * 0.25, z * 0.5, 14);
  linePattern(ctx, (x, z) => z * 2.6 + Math.sin(x * 2.2 + z * 0.5) * 0.35, (base, sx, sy) => {
    const g = ctx.view.ground(sx, sy)!;
    if (drift(g.x, g.z) < 0.46 || ctx.ground.material(sx, sy) !== MAT.SOLID) return null;
    const i = indexIn(S, base);
    return i < 0 ? null : S[Math.min(S.length - 1, i + 1)];
  }, 0.34);
  scatter(ctx, 14, 23, (_x, _z, sx, sy, ppu, r) => {
    if (r > 0.18 || ctx.ground.material(sx, sy) !== MAT.SOLID) return;
    ctx.ground.set(sx, sy, SEA_ROCK[1]);
    if (ppu > 30) ctx.ground.set(sx + 1, sy, SEA_ROCK[3]);
  });
  // Reefs looming out of the blue behind.
  hills(ctx, [
    { z: 16, height: 2.6, shades: ramp('#161f4c', '#1b2656', '#212e62', '#27366e'), freq: 0.5, rough: 0.8, seed: 5 },
    { z: 13.8, height: 1.5, shades: ramp('#1b2556', '#243268', '#2e3f7c', '#3a4e90'), crest: hex('#4a60a2'), freq: 0.7, rough: 0.9, seed: 9 },
  ]);
  // Kelp swaying, coral, rocks; light shafts from the surface far behind.
  place(ctx, {
    region: [-60, 300, 22, 112],
    count: 14,
    make: (ppu) => ({ sprite: kelp(ppu * ctx.rng.range(0.3, 0.6), ppu * ctx.rng.range(1, 2), KELP, KELP[0], ctx.rng.int(1, 1e6)), sway: ppu * 0.06 + 1 }),
  });
  place(ctx, {
    region: [-60, 300, 30, 112],
    count: 9,
    make: (ppu) => {
      const c = CORAL[ctx.rng.int(0, CORAL.length - 1)];
      return { sprite: coral(ppu * ctx.rng.range(0.5, 0.9), ppu * ctx.rng.range(0.45, 0.8), c, c[0], ctx.rng.int(1, 1e6)) };
    },
  });
  place(ctx, {
    region: [-60, 300, 30, 112],
    count: 5,
    make: (ppu) => {
      const w = ppu * ctx.rng.range(0.4, 0.9);
      return { sprite: rock(w, w * 0.7, { shades: SEA_ROCK, outline: SEA_ROCK[0] }, ctx.rng.int(1, 1e6)), sink: 1 };
    },
  });
  for (let i = 0; i < 6; i++) {
    const x = ctx.rng.range(-9, 9), z = ctx.rng.range(12.8, 15.5);
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    addProp(ctx, { sprite: lightShaft(ppu * ctx.rng.range(0.5, 1), ppu * 5, hex('#5f82c4'), 0.55, i * 3.1), x, z });
  }
}

// --- MT. CHIMNEY --------------------------------------------------------------

const ASH = ramp('#9c6252', '#bd8373', '#cd9282', '#d59c8b', '#e4b5a6', '#eecdc5');
const VOLCANIC = ramp('#3d0c02', '#621000', '#833120', '#9c6252', '#bd8373');
const LAVA = ramp('#8a1a00', '#cd3100', '#e65a1a', '#f08a3a');

function chimney(ctx: ArenaContext): void {
  const A = ASH;
  const crack = (x: number, z: number) => Math.abs(fbm(x * 0.3, z * 0.5, 19) - 0.5);
  const lava = { x: -3.6, z: 15.2, rx: 4.4, rz: 1.9 };
  const lavaD = (x: number, z: number) => Math.hypot((x - lava.x) / lava.rx, (z - lava.z) / lava.rz) - 1 - Math.sin(Math.atan2(z - lava.z, x - lava.x) * 4) * 0.08;
  fill(ctx, (sx, sy, g) => {
    const l = lavaD(g.x, g.z);
    if (l < 0) return [band(LAVA, 1 + Math.min(1.8, -l * 5) + (fbm(g.x, g.z * 2, 3) - 0.5), sx, sy, 0.3), MAT.LAVA];
    if (l < 0.06) return [VOLCANIC[1], MAT.SOLID];
    if (l < 0.14) return [VOLCANIC[2], MAT.SOLID];
    // Ash, warmer and darker toward the lava's glow.
    const v = 3 + (fbm(g.x * 0.18, g.z * 0.3, 7) - 0.5) * 2 + smoothstep(12, 24, g.z) * 0.4 - smoothstep(0.9, 0.14, l) * 1.2;
    let c = band(A, v, sx, sy, 0.3);
    if (g.ppu > 20 && crack(g.x, g.z) < 0.35 / g.ppu) c = A[Math.max(0, indexIn(A, c) - 2)];
    return [c, MAT.SOLID];
  });
  scatter(ctx, 13, 29, (_x, _z, sx, sy, ppu, r) => {
    if (r > 0.2 || ctx.ground.material(sx, sy) !== MAT.SOLID) return;
    ctx.ground.set(sx, sy, VOLCANIC[3]);
    if (ppu > 34) ctx.ground.set(sx + 1, sy, VOLCANIC[2]);
  });
  // The crater's rim behind: craggy ridges of dark rock.
  hills(ctx, [
    { z: 21, height: 3.2, shades: ramp('#4a1206', '#621a0a', '#7a2a14', '#93402a', '#a85a40'), crest: hex('#bd8373'), freq: 0.35, rough: 0.9, seed: 13 },
    { z: 18.2, height: 1.8, shades: VOLCANIC, crest: hex('#bd8373'), freq: 0.55, rough: 1, seed: 17 },
  ]);
  const far = [];
  for (let i = 0; i < 9; i++) {
    const x = ctx.rng.range(-16, 16), z = ctx.rng.range(12, 16);
    if (lavaD(x, z) < 0.3) continue;
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.5, 1.3);
    far.push({ sprite: rock(w, w * 0.75, { shades: VOLCANIC, outline: VOLCANIC[0] }, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.6, ry: w * 0.14 } });
  }
  stand(ctx, far, darker([A, VOLCANIC]));
  place(ctx, {
    region: [-40, 280, 34, 112],
    count: 5,
    avoid: (x, z) => lavaD(x, z) < 0.3,
    make: (ppu) => {
      const w = ppu * ctx.rng.range(0.35, 0.8);
      return { sprite: rock(w, w * 0.75, { shades: VOLCANIC, outline: VOLCANIC[0] }, ctx.rng.int(1, 1e6)), sink: 1 };
    },
  });
}

// --- GRANITE CAVE -------------------------------------------------------------

const CAVE = ramp('#26140f', '#3a1e1a', '#522931', '#734a39', '#946a5a', '#ac8b6a', '#cdac7b', '#e6c58b');

function cave(ctx: ArenaContext): void {
  const C = CAVE;
  // Light falls on the battle from above; the cave darkens all around it.
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 0.8;
  const crack = (x: number, z: number) => Math.abs(fbm(x * 0.4, z * 0.6, 37) - 0.5);
  fill(ctx, (sx, sy, g) => {
    const d = Math.hypot((g.x - cx) * 0.8, g.z - cz);
    let v = 5.2 + (fbm(g.x * 0.2, g.z * 0.3, 5) - 0.5) * 2 - smoothstep(2.5, 8.5, d) * 3.6;
    let c = band(C, v, sx, sy, 0.45);
    if (crack(g.x, g.z) < 0.01 * (40 / g.ppu)) c = C[Math.max(0, indexIn(C, c) - 2)];
    return [c, MAT.SOLID];
  });
  scatter(ctx, 9, 31, (_x, _z, sx, sy, ppu, r) => {
    if (r > 0.3) return;
    const i = indexIn(C, ctx.ground.get(sx, sy));
    if (i < 0) return;
    ctx.ground.set(sx, sy, C[Math.max(0, i - 2)]);
    if (ppu > 30) ctx.ground.set(sx, sy - 1, C[Math.min(C.length - 1, i + 1)]);
  });
  // The back wall, stalagmites before it.
  const shadeWall = { shades: ramp('#1c0f0c', '#2e1916', '#442522', '#5c3a2e', '#734a39'), outline: C[0] };
  const far = [];
  for (let x = -22; x < 22; x += ctx.rng.range(3, 4.5)) {
    const z = ctx.rng.range(13.4, 14.4);
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    far.push({ sprite: rockWall(ppu * ctx.rng.range(3.5, 5), ppu * ctx.rng.range(2.6, 3.4), shadeWall, ctx.rng.int(1, 1e6)), x, z });
  }
  for (let i = 0; i < 12; i++) {
    const x = ctx.rng.range(-14, 14), z = ctx.rng.range(11.2, 13.2);
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    far.push({ sprite: stalagmite(ppu * ctx.rng.range(0.4, 0.8), ppu * ctx.rng.range(0.8, 1.8), shadeWall, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * 0.4, ry: ppu * 0.08 } });
  }
  stand(ctx, far, darker([C]));
  const lit = { shades: ramp('#3a1e1a', '#522931', '#734a39', '#946a5a', '#ac8b6a'), outline: C[0] };
  place(ctx, {
    region: [-40, 290, 30, 112],
    count: 5,
    make: (ppu) => ({ sprite: stalagmite(ppu * ctx.rng.range(0.3, 0.55), ppu * ctx.rng.range(0.6, 1.2), lit, ctx.rng.int(1, 1e6)) }),
  });
  place(ctx, {
    region: [-40, 290, 34, 112],
    count: 4,
    make: (ppu) => {
      const w = ppu * ctx.rng.range(0.35, 0.7);
      return { sprite: rock(w, w * 0.7, lit, ctx.rng.int(1, 1e6)), sink: 1 };
    },
  });
}

// --- BATTLE TOWER -------------------------------------------------------------

const FLOOR = ramp('#a4834a', '#c9a95e', '#d5b46a', '#ffde83', '#ffffac');
const COURT = ramp('#737383', '#9494a4', '#cdbdc5', '#ded5e6');
const WALL = ramp('#52526a', '#737383', '#9494a4', '#cdbdc5', '#ded5e6');
const TRIM = ramp('#a02808', '#cd3910', '#ff6231');

function tower(ctx: ArenaContext): void {
  const tile = 0.62;
  const wallZ = 15.6;
  const court = { x0: -3.1, x1: 3.1, z0: 2.4, z1: 11.4 };
  const mid = (ctx.player.z + ctx.enemy.z) / 2;
  const cam = ctx.view.camera.position;
  fill(ctx, (sx, sy, g) => {
    if (g.z > wallZ) {
      // The back wall: where the ray meets the plane z = wallZ.
      const f = (wallZ - cam.z) / (g.z - cam.z);
      const y = cam.y * (1 - f), x = cam.x + (g.x - cam.x) * f;
      if (y < 0.28) return [WALL[0], MAT.BACKDROP];
      if (y < 0.34) return [WALL[1], MAT.BACKDROP];
      if (Math.abs(x) < 1.1 && y < 2.2) return [y > 2.1 ? WALL[1] : WALL[0], MAT.BACKDROP]; // doorway
      if (y > 2.55) return [band(TRIM, y > 2.75 ? 2 : 1, sx, sy, 0.2), MAT.BACKDROP];
      if (y > 2.45) return [WALL[1], MAT.BACKDROP];
      const panel = ((x % 1.3) + 1.3) % 1.3;
      if (panel < 0.06) return [WALL[1], MAT.BACKDROP];
      if (panel < 0.12) return [WALL[4], MAT.BACKDROP];
      if (Math.abs(y - 1.2) < 0.05) return [WALL[2], MAT.BACKDROP];
      return [WALL[3], MAT.BACKDROP];
    }
    const px = 1 / g.ppu;
    const inCourt = g.x > court.x0 && g.x < court.x1 && g.z > court.z0 && g.z < court.z1;
    if (inCourt) {
      const edge = Math.min(g.x - court.x0, court.x1 - g.x, g.z - court.z0, court.z1 - g.z);
      if (edge < px * 1.5 + 0.02) return [hex('#ffffff'), MAT.SOLID];
      if (Math.abs(g.z - mid) < px * 1.6) return [hex('#ffffff'), MAT.SOLID];
      if (edge < 0.3) return [COURT[3], MAT.SOLID];
      return [band(COURT, 2 + (fbm(g.x * 0.5, g.z * 0.5, 3) - 0.5) * 0.6, sx, sy, 0.3), MAT.SOLID];
    }
    // Yellow floor tiles: grout lines, a light bevel on the upper-left of each tile.
    const tx = g.x / tile, tz = g.z / tile;
    const fx = tx - Math.floor(tx), fz = tz - Math.floor(tz);
    const lx = px / tile, lz = (px * 3.2) / tile;
    if (fx < lx || fz < lz * 0.5) return [FLOOR[0], MAT.SOLID];
    if (fx > 1 - lx * 1.2 || fz > 1 - lz * 0.6) return [FLOOR[4], MAT.SOLID];
    return [((Math.floor(tx) + Math.floor(tz)) & 1) ? FLOOR[2] : FLOOR[3], MAT.SOLID];
  });
  // Lamp posts at the court's far corners and along the sides.
  for (const [x, z] of [[court.x0 - 0.5, court.z1 + 0.4], [court.x1 + 0.5, court.z1 + 0.4], [court.x0 - 0.5, 7.2], [court.x1 + 0.5, 7.2]]) {
    const ppu = ctx.view.ppu(ctx.view.depth(x, 0, z));
    addProp(ctx, { sprite: lampPost(ppu * 0.38, ppu * 1.25, WALL, ramp('#d59c20', '#ffd573', '#ffffac'), WALL[0]), x, z });
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

