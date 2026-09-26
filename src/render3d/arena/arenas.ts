// The battle arenas, one per kind of place, painted in Hoenn's colors (the
// overworld tilesets' palettes: mint route grass, round trees, pink-brown
// rock, desert sand, sea blues, the underwater lavender, cave browns, Mt.
// Chimney's ash and lava, the Battle Tower's yellow grid floor). Each is
// composed for the one battle camera: a far view across the top, the arena
// lit brightest around the battlers, framing at the edges of the view. No
// platforms: the Pokémon stand on the ground itself, with their shadows.

import { MAT, type Ramp, type Rgb, type Sprite, band, bayer, cells, fbm, hash2, hex, mix, noise, ramp, smoothstep } from './art';
import { type ArenaContext, type ArenaDesign, addProp, at, darker, dunes, fill, frameProp, hills, onLine, scatter, shafts, shift, stand } from './design';
import { anemone, bush, coralHead, crag, lampPost, shrub, wisp, seaFan, staghorn, reeds, rock, seaweed, stalagmite, starfish, tallGrass, tree } from './sprites';

// Hoenn's greens (general tileset): route grass, tall grass and tree leaves.
const MEADOW = ramp('#287a54', '#3c9f72', '#56b98b', '#73c5a4', '#8dd3b4', '#a9e0c8');
const BLADES = ramp('#398b31', '#83c562', '#b4ff83');
const LEAVES = ramp('#1d5a20', '#398b31', '#5ea846', '#83c562', '#b4ff83');
const TREE_OUTLINE = hex('#233f0c');
const TRUNK = ramp('#413931', '#6a5a5a', '#9c7373');
// Route flowers: petals and their middles.
const FLOWERS: Rgb[][] = [
  [hex('#e8505a'), hex('#ffd89c')], // red
  [hex('#f8f8f8'), hex('#ffe070')], // white
  [hex('#f0a0c8'), hex('#fff0a0')], // pink
  [hex('#f8d838'), hex('#f89830')], // yellow
];
const PATH = ramp('#9c7b4a', '#b98f4c', '#cda462', '#decd83', '#eee6a4');
/** The sky's haze the far trees fade toward. */
const HAZE = hex('#c8ecf0');

interface MeadowOptions {
  grass: typeof MEADOW;
  blades: typeof BLADES;
  leaves: typeof LEAVES;
  /** Flower beds. */
  flowers?: number;
  /** Where the tree line starts (z). */
  treeLine?: number;
  /** Clumps of tall grass (props) around the sides. */
  tallGrass?: number;
  /** Taller clumps of tall grass (1 = knee high). */
  tallGrassHeight?: number;
  /** A sandy path across the field behind the wild Pokémon. */
  path?: boolean;
  /** A pond behind the wild Pokémon (world center and radii). */
  pond?: { x: number; z: number; rx: number; rz: number };
  /** Rain puddles (world center and radius), clear of the battlers. */
  puddles?: { x: number; z: number; r: number }[];
}

// Pond water (Hoenn's fresh water), deepest shade first; its banks' wet earth.
const POND = ramp('#1f3a70', '#2b4c8a', '#3f67a8', '#4f86c8', '#63a6e6', '#7cc0f4', '#a6daf8', '#d8f0fc');
const BANK = ramp('#3a4a2a', '#5a6a3a', '#7b8b4a');
const REFLECT = ramp('#1f4a4a', '#2a6058', '#3c7a62');
const LILY = ramp('#2d6a1f', '#4f9a33', '#83c562');
const REED_STEM = ramp('#2d5a1a', '#4a8a2a', '#83b552');
const REED_HEAD = ramp('#5a3a21', '#8a5a31');

/** Index of a color in a ramp (-1 if absent). */
const indexIn = (r: readonly Rgb[], c: Rgb | null) => (c ? r.findIndex((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]) : -1);

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

/**
 * Grass blades along a border: the height (pixels) a blade of the nearer
 * grass pokes up into the farther at column sx, blades a few pixels wide and
 * of random heights, taller near the camera.
 */
function bladeTooth(sx: number, ppu: number): number {
  const max = ppu > 56 ? 3 : ppu > 40 ? 2 : ppu > 26 ? 1 : 0;
  if (!max) return 0;
  const b = Math.floor(sx / 4), u = sx - b * 4;
  const h = 1 + Math.floor(hash2(b, 3, 71) * max);
  return Math.round(h * (1 - Math.abs(u - 1.5) / 2));
}

/** A mix of each color of a ramp toward another color (for haze and tints). */
const tint = (r: Ramp, c: Rgb, t: number): Ramp => r.map((k) => mix(k, c, t));

/**
 * A Hoenn route meadow: mint grass in patches whose borders are drawn as
 * blades, lit over the battle and shaded toward the sides and under the trees
 * (sun flecks through their leaves); blade tufts, clover and flower beds in
 * clusters, big tufts and flowers framing the left; a path, a pond or rain
 * puddles; round trees in rows behind, the far ones hazy.
 */
function meadow(ctx: ArenaContext, o: MeadowOptions): void {
  const { view, ground } = ctx;
  const G = o.grass;
  const line = o.treeLine ?? 15.2;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1.2;
  // --- where things are ---
  const pathZ = (x: number) => 12.6 + Math.sin(x * 0.21 + 1.3) * 1.2 + Math.sin(x * 0.53) * 0.3;
  const pathHalf = 1.1 + 0.15 * Math.sin(0.7);
  const onPath = (x: number, z: number) => (o.path ? Math.abs(z - pathZ(x)) - (pathHalf + Math.sin(x * 1.7) * 0.08) : 1);
  const pondD = (x: number, z: number) => {
    if (!o.pond) return 1;
    const p = o.pond;
    const a = Math.atan2(z - p.z, x - p.x);
    const wob = 1 + Math.sin(a * 3 + 1.1) * 0.07 + Math.sin(a * 5 + 0.4) * 0.04;
    return Math.hypot((x - p.x) / p.rx, (z - p.z) / p.rz) - wob;
  };
  const puddles = o.puddles ?? [];
  const puddleD = (x: number, z: number) => {
    let d = 1;
    for (const p of puddles) {
      const a = Math.atan2(z - p.z, x - p.x);
      d = Math.min(d, Math.hypot((x - p.x) / p.r, (z - p.z) / (p.r * 0.85)) - 1 + Math.sin(a * 3 + p.x * 2) * 0.1 + Math.sin(a * 5 + p.z) * 0.06);
    }
    return d;
  };
  const water = (x: number, z: number) => Math.min(pondD(x, z), puddleD(x, z));
  // --- light ---
  /** Grass tone before its patches: lit over the battle, darker to the sides, in the trees' shade at the back (with sun flecks). */
  const grassTone = (x: number, z: number) => {
    const pool = 1 - smoothstep(0.35, 1.3, Math.hypot((x - cx) / 3.6, (z - cz) / 5.2));
    const shade = smoothstep(line - 2.2, line - 0.6, z);
    const fleck = shade > 0.3 && fbm(x * 1.2, z * 2.2, 57) > 0.64 ? 1 : 0;
    const patch = fbm(x * 0.2, z * 0.34, 11);
    const p = patch > 0.66 ? 1 : patch < 0.38 ? -1 : 0;
    return 2.4 + pool * 1.7 + p * 0.7 - shade * 1.7 + fleck * 1.4;
  };
  fill(ctx, (sx, sy, g) => {
    const w = water(g.x, g.z);
    if (w < 0) {
      const pond = pondD(g.x, g.z) < 0 && o.pond;
      if (pond) {
        const p = o.pond!;
        // The far bank's trees mirrored along the far water, scalloped; the sky on the open water, darker toward the banks.
        const farEdge = -pondD(g.x, g.z);
        const inFar = g.z > p.z && farEdge < 0.32 + Math.abs(Math.sin(g.x * 2.3) + Math.sin(g.x * 5.1) * 0.4) * 0.07;
        if (inFar) return [REFLECT[farEdge < 0.08 ? 0 : farEdge < 0.2 ? 1 : 2], MAT.WATER];
        // Open water: darker toward the banks, the sky lighter on the near water, in crisp wavy bands with ripple lines.
        const wob = Math.sin(g.x * 2.1 + g.z * 3) * 0.08 + Math.sin(g.x * 5.3) * 0.03;
        const depth = -w + wob;
        let v = depth < 0.1 ? 2 : depth < 0.3 ? 3 : g.z < p.z ? 5 : 4;
        if (v >= 4 && Math.abs(Math.sin(g.z * 9 + Math.sin(g.x * 1.7) * 1.5)) > 0.97 && Math.sin(g.x * 3.3 + g.z) > 0) v += 1;
        return [POND[v], MAT.WATER];
      }
      // A puddle: the grass of its far rim mirrored dark along the top, sky on the rest, a pale streak.
      const d = -puddleD(g.x, g.z);
      const up2 = view.ground(sx, sy - 2), up4 = view.ground(sx, sy - 4);
      if (up2 && puddleD(up2.x, up2.z) >= 0) return [REFLECT[1], MAT.WATER];
      if (up4 && puddleD(up4.x, up4.z) >= 0) return [POND[3], MAT.WATER];
      const streak = Math.abs(((g.x - g.z * 0.6) * 3.1) % 1) < 0.12 && d > 0.25;
      return [streak ? POND[7] : band(POND, 5 + Math.min(1.4, d * 3), sx, sy, 0.2), MAT.WATER];
    }
    // Blades of the nearer grass poke up over the near edges of the path and the banks.
    const t = bladeTooth(sx, g.ppu);
    const q = t ? view.ground(sx, sy + t)! : g;
    const qIsGrass = water(q.x, q.z) >= 0.07 + 1.4 / q.ppu && onPath(q.x, q.z) >= 0;
    if (t && qIsGrass && (w < 0.07 + 1.4 / g.ppu || onPath(g.x, g.z) < 0)) return [band(G, grassTone(q.x, q.z), sx, sy, 0.06), MAT.GRASS];
    // Banks: wet earth around the water.
    if (w < 0.07 + 1.4 / g.ppu) return [BANK[w < 0.04 ? 0 : 1], MAT.SOLID];
    const d = onPath(g.x, g.z);
    if (d < 0) {
      // Sand, packed lighter down the middle, a darker rim where the grass meets it.
      if (d > -1.3 / g.ppu) return [PATH[1], MAT.SOLID];
      const v = 2.4 + (fbm(g.x * 0.8, g.z * 0.8, 21) - 0.5) * 1.4 + (d < -pathHalf * 0.45 ? 0.7 : 0);
      return [band(PATH, v, sx, sy, 0.2), MAT.SOLID];
    }
    // Grass: its tones sampled a blade's height lower, so the nearer grass pokes up into the farther in blades.
    const v = grassTone(qIsGrass ? q.x : g.x, qIsGrass ? q.z : g.z);
    return [band(G, v, sx, sy, 0.06), MAT.GRASS];
  });
  // Blade tufts, in clusters: two darker blades, a light tip near the camera.
  scatter(ctx, 9, 3, (x, z, sx, sy, ppu, r) => {
    const f = fbm(x * 0.45, z * 0.75, 51);
    if (r > (f - 0.5) * 3.2 || ground.material(sx, sy) !== MAT.GRASS) return;
    const i = indexIn(G, ground.get(sx, sy));
    if (i < 0) return;
    const dark = G[Math.max(0, i - 2)], light = r < 0.2 ? G[Math.min(G.length - 1, i + 1)] : null;
    if (ppu < 24) ground.set(sx, sy, dark, MAT.GRASS);
    else if (ppu < 44) {
      ground.set(sx - 1, sy - 1, dark, MAT.GRASS);
      ground.set(sx + 1, sy - 1, dark, MAT.GRASS);
      ground.set(sx, sy, dark, MAT.GRASS);
    } else {
      for (const [dx, dy] of [[-2, -2], [-1, -1], [1, -2], [1, -1], [0, 0]]) ground.set(sx + dx, sy + dy, dark, MAT.GRASS);
      if (light) ground.set(sx, sy - 2, light, MAT.GRASS);
    }
  });
  // Clover in patches near the camera: three round leaves, a light dot.
  scatter(ctx, 11, 17, (x, z, sx, sy, ppu, r) => {
    if (ppu < 40 || r > 0.45 || fbm(x * 0.6, z * 0.9, 52) < 0.62 || ground.material(sx, sy) !== MAT.GRASS) return;
    const i = indexIn(G, ground.get(sx, sy));
    if (i < 1) return;
    const dark = G[Math.max(0, i - 2)], leaf = G[Math.max(0, i - 1)];
    ground.set(sx - 1, sy, leaf, MAT.GRASS);
    ground.set(sx + 1, sy, leaf, MAT.GRASS);
    ground.set(sx, sy - 1, leaf, MAT.GRASS);
    ground.set(sx, sy, dark, MAT.GRASS);
    if (ppu > 52) ground.set(sx, sy - 2, G[Math.min(G.length - 1, i + 1)], MAT.GRASS);
  });
  // Pebbles on the path.
  if (o.path) {
    scatter(ctx, 7, 9, (x, z, sx, sy, ppu, r) => {
      if (r > 0.3 || onPath(x, z) > -0.15) return;
      ground.set(sx, sy, PATH[0]);
      if (ppu > 30) ground.set(sx + 1, sy, PATH[4]);
    });
  }
  // Flower beds: loose clusters toward the sides and in the middle distance, clear of the battlers.
  const flower = (x: number, z: number, kind: Rgb[]) => {
    if (onPath(x, z) < 0.1 || water(x, z) < 0.2) return;
    const [fx, fy] = view.screen(x, 0, z);
    const px = Math.floor(fx), py = Math.floor(fy);
    const ppu = view.ppu(view.depth(x, 0, z));
    const stem = G[1];
    if (ppu > 48) {
      ground.set(px, py + 1, stem, MAT.GRASS);
      ground.set(px, py + 2, stem, MAT.GRASS);
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) ground.set(px + dx, py + dy, kind[0], MAT.GRASS);
      ground.set(px, py, kind[1], MAT.GRASS);
    } else if (ppu > 30) {
      ground.set(px, py, kind[0], MAT.GRASS);
      ground.set(px + 1, py, kind[0], MAT.GRASS);
      ground.set(px, py + 1, stem, MAT.GRASS);
    } else ground.set(px, py, kind[0], MAT.GRASS);
  };
  const beds = o.flowers ?? 7;
  // The first beds where they show (below the wild Pokémon's healthbox, past its right, behind it), then anywhere.
  const spots = [[20, 62], [238, 100], [124, 46]];
  for (let b = 0, tries = 0; b < beds && tries < 200; tries++) {
    const spot = spots[b];
    const c = spot && tries < spots.length ? at(ctx, spot[0], spot[1]) : at(ctx, ctx.rng.range(-200, 440), ctx.rng.range(34, 112));
    if (Math.hypot(c.x - ctx.enemy.x, (c.z - ctx.enemy.z) * 1.4) < 2.2 || Math.hypot(c.x - ctx.player.x, c.z - ctx.player.z) < 1.6 || c.z > line - 0.6) continue;
    b++;
    const kind = FLOWERS[ctx.rng.int(0, FLOWERS.length - 1)];
    const n = ctx.rng.int(6, 13);
    for (let i = 0; i < n; i++) flower(c.x + ctx.rng.range(-0.7, 0.7) * (1 - i / n * 0.5), c.z + ctx.rng.range(-0.4, 0.4), kind);
  }
  // The tree line: staggered rows of round trees, the far rows hazy; bushes at its foot.
  const dark = darker([G, PATH]);
  const trees = [];
  for (let row = 0; row < 3; row++) {
    const z0 = line + row * 1.7;
    const pal = { leaves: row ? tint(o.leaves, HAZE, row * 0.16) : o.leaves, outline: row ? mix(TREE_OUTLINE, HAZE, row * 0.16) : TREE_OUTLINE, trunk: TRUNK };
    for (let x = -24 + row * 0.9; x < 24; x += ctx.rng.range(1.6, 2.2)) {
      const z = z0 + ctx.rng.range(-0.35, 0.35);
      const ppu = view.ppu(view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(2.2, 2.7);
      trees.push({ sprite: tree(w, pal, ctx.rng.int(1, 1e6)), x, z });
    }
  }
  const bushPal = { leaves: o.leaves, outline: TREE_OUTLINE, trunk: TRUNK };
  for (let i = 0; i < 14; i++) {
    const x = ctx.rng.range(-20, 20), z = line - ctx.rng.range(0.5, 1.6);
    if (water(x, z) < 0.3) continue;
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.9, 1.5);
    trees.push({ sprite: bush(w, bushPal, ctx.rng.int(1, 1e6)), x, z });
  }
  stand(ctx, trees, dark);
  // Framing the left: big tufts of grass in the foreground, cropped by the frame, with red flowers
  // (Route 101), grown taller (Route 120), or around a mossy boulder and reeds (Route 102).
  const tall = o.tallGrassHeight ?? 1;
  const tufts: { sprite: Sprite; x: number; z: number; mat: number }[] = [];
  const tuftSpots = o.pond ? [[22, 106, 0.8], [36, 112, 0.7], [-8, 90, 0.8]] : [[2, 110, 1], [22, 104, 0.8], [-6, 92, 0.9], [34, 112, 0.7], [10, 84, 0.6]];
  for (const [sx, sy, s] of tuftSpots) {
    const g = view.ground(sx, sy)!;
    const w = g.ppu * 0.55 * s, h = g.ppu * 0.42 * s * Math.min(1.3, tall);
    tufts.push({ sprite: tallGrass(w, h, { blades: o.blades, outline: TREE_OUTLINE }, ctx.rng.int(1, 1e6)), x: g.x, z: g.z, mat: MAT.GRASS });
  }
  if (o.pond) {
    const g = view.ground(2, 104)!;
    tufts.push({ sprite: rock(g.ppu * 0.7, g.ppu * 0.45, { shades: ramp('#4a5a31', '#6a7b41', '#8b946a', '#b4ac8b', '#d5cdac'), outline: TREE_OUTLINE }, ctx.rng.int(1, 1e6)), x: g.x, z: g.z, mat: MAT.SOLID });
    for (const [sx, sy] of [[14, 96], [-2, 88]]) {
      const r = view.ground(sx, sy)!;
      tufts.push({ sprite: reeds(r.ppu * 0.35, r.ppu * 0.7, REED_STEM, REED_HEAD, TREE_OUTLINE, ctx.rng.int(1, 1e6)), x: r.x, z: r.z, mat: MAT.GRASS });
    }
  }
  tufts.sort((a, b) => b.z - a.z);
  for (const t of tufts) {
    const [px, py] = view.screen(t.x, 0, t.z);
    ground.sprite(t.sprite, Math.round(px), Math.floor(py) + 1, t.mat);
  }
  if (!o.pond && tall <= 1) {
    for (let i = 0; i < 7; i++) {
      const g = view.ground(ctx.rng.range(4, 30), ctx.rng.range(88, 100))!;
      flower(g.x, g.z, FLOWERS[0]);
    }
  }
  // Tall grass swaying at the edges of the view and around the sides (props: it can hide the Pokémon's feet).
  const clump = (ppu: number) => {
    const w = ppu * ctx.rng.range(0.4, 0.62), h = ppu * ctx.rng.range(0.3, 0.4) * (o.tallGrassHeight ?? 1);
    return { sprite: tallGrass(w, h, { blades: o.blades, outline: TREE_OUTLINE }, ctx.rng.int(1, 1e6)), sway: Math.max(1, h * 0.12) };
  };
  frameProp(ctx, 3, 70, -1, clump);
  frameProp(ctx, 236, 64, 1, clump);
  frameProp(ctx, 232, 40, 1, clump);
  const clumps = o.tallGrass ?? 10;
  for (let i = 0, tries = 0; i < clumps && tries < 400; tries++) {
    // Around the sides and the back, not in the middle of the field.
    const side = ctx.rng.chance(0.5) ? ctx.rng.range(-220, 30) : ctx.rng.range(210, 460);
    const p = at(ctx, ctx.rng.chance(0.25) ? ctx.rng.range(40, 200) : side, ctx.rng.range(24, 112));
    if (onPath(p.x, p.z) < 0.3 || water(p.x, p.z) < 0.25 || p.z > line - 0.4) continue;
    const ppu = view.ppu(view.depth(p.x, 0, p.z));
    if (addProp(ctx, { ...clump(ppu), x: p.x, z: p.z })) i++;
  }
  // Reeds along the pond's shore, lily pads in a few clusters on it.
  if (o.pond) {
    const p = o.pond;
    for (let i = 0; i < 30; i++) {
      const a = ctx.rng.range(0, Math.PI * 2);
      if (Math.sin(a) < -0.3 && ctx.rng.chance(0.7)) continue; // fewer on the near shore
      const x = p.x + Math.cos(a) * p.rx * 1.03, z = p.z + Math.sin(a) * p.rz * 1.03;
      const ppu = view.ppu(view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(0.25, 0.45), h = ppu * ctx.rng.range(0.45, 0.8);
      addProp(ctx, { sprite: reeds(w, h, REED_STEM, REED_HEAD, TREE_OUTLINE, ctx.rng.int(1, 1e6)), x, z, sway: Math.max(1, h * 0.08) });
    }
    for (let k = 0; k < 4; k++) {
      const cxp = p.x + ctx.rng.range(-0.7, 0.7) * p.rx, czp = p.z + ctx.rng.range(-0.5, 0.2) * p.rz;
      for (let i = ctx.rng.int(4, 8); i > 0; i--) {
        const x = cxp + ctx.rng.range(-0.6, 0.6), z = czp + ctx.rng.range(-0.3, 0.3);
        if (pondD(x, z) > -0.2) continue;
        const [fx, fy] = view.screen(x, 0, z);
        const ppu = view.ppu(view.depth(x, 0, z));
        const w = Math.max(2, Math.round(ppu * 0.2)), h = Math.max(1, Math.round(w * 0.4));
        const sx0 = Math.floor(fx) - Math.floor(w / 2), sy0 = Math.floor(fy) - h + 1;
        for (let yy = 0; yy < h; yy++) {
          for (let xx = 0; xx < w; xx++) {
            const u = (xx + 0.5) / w - 0.5, v = (yy + 0.5) / h - 0.5;
            if (u * u + v * v > 0.25 || (u > 0.05 && Math.abs(v) < 0.12 && w > 4)) continue;
            ground.set(sx0 + xx, sy0 + yy, yy === 0 ? LILY[2] : yy === h - 1 ? LILY[0] : LILY[1], MAT.SOLID);
          }
        }
        if (w > 5 && ctx.rng.chance(0.2)) ground.set(Math.floor(fx), sy0 - 1, FLOWERS[2][0]);
      }
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

// --- ROUTE 111: the desert ------------------------------------------------

// Route 111's sand (the general tileset's desert yellows) with shadows cooling
// toward mauve, dry scrub and straw, pink-brown rock.
const SAND = ramp('#a47b41', '#bd9452', '#cd9c52', '#d5b46a', '#decd83', '#eee6a4', '#f6f0c4');
const SAND_SHADE = ramp('#8b6a5a', '#a4836a', '#b49473', '#c5a47b');
const SCRUB = ramp('#4a4a20', '#6a6a29', '#8b8b39', '#aca45a');
const STRAW = ramp('#8b6a31', '#b49452', '#dec583');

/**
 * Route 111's desert: dunes with sharp crests rolling away behind (lit on
 * their windward faces, their slip faces in shade, hazier the farther),
 * the heat shimmering over them; the floor heaped in low drifts combed by
 * the wind into rows of little ripples, sand ridges running away along the
 * sides; pointed pink-brown rocks, dry scrub and straw at the edges.
 */
function desert(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const S = SAND;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1;
  // Low drifts on the floor: a height field lit from the upper left and front.
  const height = (x: number, z: number) => fbm(x * 0.24, z * 0.42, 7) + fbm(x * 0.6, z * 0.9, 8) * 0.25;
  const lightOn = (x: number, z: number) => {
    const e = 0.06;
    const hx = (height(x + e, z) - height(x - e, z)) / (2 * e), hz = (height(x, z + e) - height(x, z - e)) / (2 * e);
    return -hx * 0.9 + hz * 0.7;
  };
  // Ripples: Emerald's rows of little zigzags, in patches, wandering with the drifts.
  const rippled = (x: number, z: number) => fbm(x * 0.22 + 4, z * 0.5, 12);
  const ripple = (x: number, z: number) => z * 3.1 + Math.sin(x * 38) * 0.28 + Math.sin(x * 0.45 + z * 0.6) * 0.8 + height(x, z) * 3;
  // Sand ridges running away from the camera along the sides: a long lit face on their left (screen),
  // a crisp crest, a short slip face in shade on their right; they taper out near and far.
  const ridges = [{ x: 2.3, a: 0.05, w: 1.0, s: 0.3 }, { x: -3.15, a: -0.07, w: 1.1, s: 0.34 }];
  const ridgeAt = (x: number, z: number) => {
    const taper = smoothstep(4.5, 7, z) * (1 - smoothstep(12.5, 15, z));
    if (taper <= 0) return null;
    for (const r of ridges) {
      // The crest meanders; the ridge swells and thins along its length.
      const u = x - (r.x + r.a * (z - 8) + Math.sin(z * 0.8 + r.x) * 0.45 + Math.sin(z * 2.1 + r.x * 3) * 0.08);
      const k = taper * (0.65 + 0.35 * Math.sin(z * 1.3 + r.x * 2));
      if (u >= 0 && u < r.w * k) return { lit: true, t: u / (r.w * k), u };
      if (u < 0 && u > -r.s * k) return { lit: false, t: -u / (r.s * k), u };
    }
    return null;
  };
  fill(ctx, (sx, sy, g) => {
    const far = smoothstep(12, 22, g.z);
    const light = 1 - smoothstep(0.55, 1.35, Math.hypot((g.x - cx) / 3.4, (g.z - cz) / 5));
    const slope = lightOn(g.x, g.z) * (1 - far);
    let v = 3.3 + light * 1.2 + slope * 1.1 + far * 0.9 - smoothstep(3, 6, Math.abs(g.x - cx)) * 0.7;
    const r = ridgeAt(g.x, g.z);
    if (r && !r.lit) return [band(SAND_SHADE, 1.2 + r.t * 1.6, sx, sy, 0.2), MAT.SOLID];
    if (r && r.u < 1.2 / g.ppu) return [S[6], MAT.SOLID];
    if (r) v += 1.3 * (1 - r.t);
    if (g.z < 13 && rippled(g.x, g.z) > 0.47 && onLine(ctx, sx, sy, ripple, 0.34)) v += 1;
    if (slope < -0.75) return [band(SAND_SHADE, 3.4 + (slope + 0.75) * 3, sx, sy, 0.25), MAT.SOLID];
    return [band(S, v, sx, sy, 0.14), MAT.SOLID];
  });
  // Pebbles, few.
  scatter(ctx, 16, 5, (_x, z, sx, sy, ppu, r) => {
    if (r > 0.12 || z > 14 || indexIn(S, ground.get(sx, sy)) < 0) return;
    ground.set(sx, sy, ROCK[1]);
    if (ppu > 30) ground.set(sx + 1, sy, ROCK[3]);
  });
  // Dunes rolling away behind, hazier the farther they are; the heat shimmering in a pale band over the farthest.
  dunes(ctx, [
    { z: 30, height: 2.4, freq: 0.13, seed: 3, lit: ramp('#e6d59c', '#eee6b4', '#f6eecd', '#fff6de'), shade: ramp('#cdb494', '#d5c5a4', '#decdac'), crest: hex('#ffffee') },
    { z: 21, height: 1.9, freq: 0.2, seed: 7, lit: ramp('#d5b46a', '#decd83', '#eee6a4', '#f6f0c4'), shade: ramp('#b49473', '#c5a47b', '#d5b48b'), crest: hex('#fff8d8') },
    { z: 16.4, height: 1.55, freq: 0.19, seed: 11, lit: ramp('#cd9c52', '#d5b46a', '#decd83', '#eee6a4'), shade: SAND_SHADE, crest: hex('#f6f0c4') },
  ]);
  // Pointed rocks standing in the sand (Route 111's), far and near, clear of the battlers.
  const rockPal = { shades: ROCK, outline: ROCK_OUTLINE };
  const standing = [];
  for (let i = 0; i < 9; i++) {
    const x = ctx.rng.range(-16, 16), z = ctx.rng.range(13, 16);
    if (Math.abs(x - ctx.enemy.x) < 2.2) continue;
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.45, 1);
    standing.push({ sprite: crag(w, w * ctx.rng.range(0.6, 0.9), rockPal, ctx.rng.int(1, 1e6), 5), x, z, shadow: { rx: w * 0.6, ry: w * 0.15 } });
  }
  for (const [x, z, s] of [[2.6, 7.2, 1.1], [2.9, 10.6, 0.8], [-3.2, 11.4, 0.9], [-2.9, 9.2, 0.6]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * s;
    standing.push({ sprite: crag(w, w * 0.75, rockPal, ctx.rng.int(1, 1e6), 6), x, z, shadow: { rx: w * 0.62, ry: w * 0.15 } });
  }
  stand(ctx, standing, darker([S, SAND_SHADE, ROCK]));
  // Dry scrub and straw at the edges of the view, swaying in the wind.
  const scrub = (ppu: number) => ({ sprite: shrub(ppu * ctx.rng.range(0.45, 0.7), ppu * ctx.rng.range(0.35, 0.55), ramp('#5a4221', '#8b6a39'), SCRUB, ctx.rng.int(1, 1e6)), sway: 1 });
  const straw = (ppu: number) => {
    const h = ppu * ctx.rng.range(0.25, 0.4);
    return { sprite: tallGrass(ppu * ctx.rng.range(0.4, 0.6), h, { blades: STRAW, outline: hex('#5a4221') }, ctx.rng.int(1, 1e6)), sway: Math.max(1, h * 0.12) };
  };
  frameProp(ctx, 4, 96, -1, scrub);
  frameProp(ctx, 8, 70, -1, straw);
  frameProp(ctx, 232, 66, 1, straw);
  frameProp(ctx, 236, 48, 1, scrub);
  place(ctx, { region: [-240, -20, 40, 112], count: 8, make: (ppu) => (ctx.rng.chance(0.5) ? scrub(ppu) : straw(ppu)) });
  place(ctx, { region: [260, 480, 40, 112], count: 8, make: (ppu) => (ctx.rng.chance(0.5) ? scrub(ppu) : straw(ppu)) });
}

// --- ROUTE 124: the open sea ------------------------------------------------
// --- ROUTE 124: the open sea ------------------------------------------------
// --- ROUTE 124: the open sea ------------------------------------------------

// Hoenn's sea (the general tileset's blues), deepest first, up to the foam.
const SEA = ramp('#213a7b', '#29418b', '#39529c', '#415abd', '#526ad5', '#6a83d5', '#8ba4de', '#acc5e6', '#dee6ee');

/**
 * Route 124's open sea: deep blue near, lighter far off where the sky lies on
 * it; long swells and rows of wavelets that shrink and crowd with distance,
 * calm over the battle; pink-brown sea stacks framing the sides with surf
 * ringing their feet and their dark reflections under them, rocky islets
 * far out, patches of deep water (the dive spots), a path of sparkles toward
 * the sun.
 */
function sea(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const W = SEA;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1;
  const calm = (x: number, z: number) => 1 - smoothstep(0.45, 1.15, Math.hypot((x - cx) / 3.3, (z - cz) / 4.8));
  // Rows of waves rolling in: long gentle crests (lit on top, the trough dark under them), their spacing
  // shrinking with distance; broken into long runs, sparse in the calm over the battle.
  const wave = (x: number, z: number) => z / 0.62 + Math.sin(x * 0.42 + z * 0.2) * 0.75 + Math.sin(x * 1.1 - z * 0.5) * 0.18;
  const run = (x: number, row: number) => Math.sin(x * 0.9 + row * 2.3) + Math.sin(x * 0.37 - row * 1.1) * 0.8;
  const crestAt = (sx: number, sy: number) => {
    const g = view.ground(sx, sy);
    if (!g || g.z > 19) return false;
    if (!onLine(ctx, sx, sy, wave, 0.42)) return false;
    return run(g.x, Math.floor(wave(g.x, g.z))) > -0.2 + calm(g.x, g.z) * 1.4;
  };
  // Dive spots (Emerald's patches of deep water): darker, their edge wandering, a pale rim.
  const spots = [{ x: 2.15, z: 10.3, rx: 1.0, rz: 1.3 }, { x: 2.3, z: 21, rx: 1.8, rz: 2.4 }, { x: -7, z: 11, rx: 1.4, rz: 1.6 }, { x: 7.5, z: 12.5, rx: 1.6, rz: 1.8 }];
  const deep = (x: number, z: number) => {
    let d = 9;
    for (const p of spots) {
      const a = Math.atan2(z - p.z, x - p.x);
      d = Math.min(d, Math.hypot((x - p.x) / p.rx, (z - p.z) / p.rz) - 1 + Math.sin(a * 3 + p.x) * 0.12 + Math.sin(a * 5) * 0.06);
    }
    return d;
  };
  fill(ctx, (sx, sy, g) => {
    // Lighter far off (the sky on the water), a slow swell of light and shade.
    const far = smoothstep(9, 26, g.z);
    let v = 2.8 + far * 2.7 + (fbm(g.x * 0.12, g.z * 0.2, 13) - 0.5) * 0.7;
    const d = deep(g.x, g.z);
    if (d < 0) v -= 1.4;
    else if (d < 1.3 / g.ppu + 0.03) v += 0.9;
    if (crestAt(sx, sy)) {
      // Now and then a crest breaks white, out in the open water.
      const row = Math.floor(wave(g.x, g.z)), seg = Math.floor(g.x / 0.7);
      if (g.z > 9.5 && g.z < 18 && calm(g.x, g.z) < 0.2 && hash2(row, seg, 77) < 0.14) return [W[8], MAT.WATER];
      v += far > 0.5 ? 1 : 1.6;
    } else if (crestAt(sx, sy - 1)) v -= 1;
    return [band(W, v, sx, sy, 0.12), MAT.WATER];
  });
  // A path of sparkles toward the sun (up and to the left), thickest far off.
  scatter(ctx, 5, 73, (x, z, sx, sy, ppu, r) => {
    const path = Math.abs(sx - (sy + 24) * 1.1 - 10);
    if (path > 40 || r > 0.07 * (1 - path / 40) || ppu > 30) return;
    ground.set(sx, sy, W[8], MAT.WATER);
    if (r < 0.03 && ppu < 26) {
      ground.set(sx - 1, sy, W[7], MAT.WATER);
      ground.set(sx + 1, sy, W[7], MAT.WATER);
    }
    void x; void z;
  });
  // Sea stacks and rocks, surf ringing their feet, their reflections darkening the water under them.
  const rockPal = { shades: ROCK, outline: ROCK_OUTLINE };
  const rocks: { sprite: Sprite; x: number; z: number }[] = [];
  const stack = (x: number, z: number, w: number, h: number, facets = 7) => {
    const ppu = view.ppu(view.depth(x, 0, z));
    rocks.push({ sprite: crag(ppu * w, ppu * h, rockPal, ctx.rng.int(1, 1e6), facets), x, z });
  };
  // Framing: a tall stack cropped by the left edge, another past the right; islets far out.
  stack(2.6, 8.3, 1.3, 1.7, 9);
  stack(2.2, 9.6, 0.5, 0.45);
  stack(-3.9, 12.2, 1.2, 1.5, 8);
  stack(1.9, 13.9, 0.5, 0.4);
  for (const [x, z, w, h] of [[6, 18, 2.4, 1.6], [-8, 17, 3, 2.1], [1.2, 22, 1.4, 0.8], [-3.6, 24, 2.2, 1.2], [9.5, 23, 2.8, 1.5], [-12, 21, 2.6, 1.8], [14, 16, 2.4, 2.4], [-16, 15, 2.6, 2.6]] as const) stack(x, z, w, h, 8);
  for (const r of rocks) {
    const [px, py] = view.screen(r.x, 0, r.z);
    const base = Math.floor(py);
    const x0 = Math.round(px - r.sprite.w / 2);
    // The reflection: the rock's silhouette mirrored under its foot in darker water, broken into lines, fading.
    const depth = Math.round(r.sprite.h * 0.55);
    for (let k = 1; k <= depth; k++) {
      if (k % 3 === 0 || (k > depth * 0.6 && k % 2)) continue;
      const row = r.sprite.h - 1 - k;
      if (row < 0) break;
      for (let i = 0; i < r.sprite.w; i++) {
        if (!r.sprite.data[(row * r.sprite.w + i) * 4 + 3]) continue;
        const x = x0 + i + (k % 4 === 1 ? 1 : 0), y = base + k;
        const c = ground.get(x, y);
        if (c && ground.material(x, y) === MAT.WATER) ground.set(x, y, shift([W], c, -2), MAT.WATER);
      }
    }
    // Surf at the waterline: a bright line along the foot, lighter water lapping around it, flecks drifting right.
    const rx = r.sprite.w * 0.58, ry = Math.max(1.5, rx * 0.16);
    for (let y = Math.floor(py - ry * 1.5); y <= py + ry * 1.5; y++) {
      for (let x = Math.floor(px - rx * 1.5); x <= px + rx * 1.5; x++) {
        const d = Math.hypot((x + 0.5 - px) / rx, (y + 0.5 - py) / ry);
        if (d > 1.5 || ground.material(x, y) !== MAT.WATER) continue;
        if (d < 1.12 && d > 0.8) ground.set(x, y, W[8], MAT.WATER);
        else if ((1.5 - d) * 1.4 > bayer(x, y)) ground.set(x, y, shift([W], ground.get(x, y)!, 2), MAT.WATER);
      }
    }
    for (let k = 0; k < r.sprite.w / 4; k++) {
      const fx = Math.round(px + rx * ctx.rng.range(0.9, 2.4)), fy = Math.round(py + ry * ctx.rng.range(-0.5, 1.8));
      ground.set(fx, fy, W[7], MAT.WATER);
      if (ctx.rng.chance(0.5)) ground.set(fx + 1, fy, W[7], MAT.WATER);
    }
  }
  stand(ctx, rocks, darker([W, ROCK]));
}

// --- SEAFLOOR (underwater) --------------------------------------------------

// Emerald's underwater tileset: lavender sand lit from above, fading through
// violet into the blue of deep water; teal-blue seaweed; violet-grey rock;
// coral in pinks, oranges, yellows and sea greens.
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
    if (z > 12 || f < 0.47 || r > (f - 0.47) * 3.6) return;
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
    { k: 'rock', x: -4.7, z: 13.4, s: 0.8 },
    { k: 'anem', x: -4.4, z: 13.2, s: 0.26, c: 0 },
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
const SMOKE = ramp('#2c2028', '#41303a', '#5a4148', '#7b5352', '#a46a52');

/**
 * Mt. Chimney: an ash slope running up to a river of lava below the crater's
 * wall. The lava churns (crusted plates along its banks, a few bright
 * currents down its middle), its light warms the ash and glows in the joints
 * of the basalt bank along it; steam curls off it. Ash lies in soft mounds;
 * bare rock shows at the sides, and basalt crags frame the view.
 */
function chimney(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const cx = (ctx.player.x + ctx.enemy.x) / 2, cz = (ctx.player.z + ctx.enemy.z) / 2 + 1;
  // The lava river winding across the back.
  const riverZ = (x: number) => 15.4 + Math.sin(x * 0.33 + 0.8) * 0.9 + Math.sin(x * 0.9 + 2) * 0.3;
  const riverW = (x: number) => 1.25 + Math.sin(x * 0.5 + 2) * 0.35;
  const river = (x: number, z: number) => Math.abs(z - riverZ(x)) - riverW(x);
  // Bare basalt: a bank along the near side of the river (widening and narrowing), patches out at the sides.
  const bankW = (x: number) => 0.8 + fbm(x * 0.4, 3.3, 25) * 0.7 + Math.max(0, Math.sin(x * 0.7 + 1)) * 0.5;
  const sideRock = (x: number, z: number) => fbm(x * 0.32 + 7, z * 0.55, 21) + smoothstep(2.4, 5.5, Math.abs(x - cx)) * 0.28 - 0.14;
  const plate = (x: number, z: number) => cells(x / 1.0, z / 0.6, 41).id;
  const joint = (x: number, z: number) => cells(x / 0.6, z / 0.8, 42).id;
  const rockAt = (x: number, z: number) => { const d = river(x, z); return d >= 0 && (d < bankW(x) || z > riverZ(x) || sideRock(x, z) > 0.62); };
  // Ash lies in soft mounds lit from the upper left.
  const mound = (x: number, z: number) => fbm(x * 0.26, z * 0.46, 23);
  fill(ctx, (sx, sy, g) => {
    // Far beyond the crater's rim: the sky, thick with the volcano's smoke, glowing low down over the lava.
    if (g.z > 23) {
      const billow = fbm(g.x * 0.05 + sy * 0.02, sy * 0.09, 27);
      const v = 2.4 + smoothstep(-24, 12, sy) * 1.6 + (billow - 0.5) * 2.2;
      return [band(SMOKE, v, sx, sy, 0.2), MAT.BACKDROP];
    }
    const gr = view.ground(sx + 1, sy)!, gd = view.ground(sx, sy + 1)!;
    const d = river(g.x, g.z);
    if (d < 0) {
      // The flow: molten down its middle with a few long bright currents; toward the banks it crusts into dark plates with glowing seams.
      const depth = Math.min(1, -d / riverW(g.x));
      const crusted = depth + (fbm(g.x * 0.8, g.z * 1.6, 3) - 0.5) * 0.6 < 0.4;
      if (crusted) {
        const id = plate(g.x, g.z);
        const seam = plate(gr.x, gr.z) !== id || plate(gd.x, gd.z) !== id;
        if (seam) return [LAVA[4], MAT.LAVA];
        return [LAVA[id < 0.35 ? 0 : 1], MAT.LAVA];
      }
      const current = Math.sin(g.x * 0.8 + Math.sin(g.z * 1.7) * 1.5 + g.z * 0.3);
      const v = 2.6 + depth * 1.9 + (current > 0.93 ? 1.2 : 0);
      return [band(LAVA, v, sx, sy, 0.1), MAT.LAVA];
    }
    // The bank: a lip of black rock, glowing where the lava licks it.
    if (d < 0.06 + 1.1 / g.ppu) return [d < 0.05 ? LAVA[3] : BASALT[0], d < 0.05 ? MAT.LAVA : MAT.SOLID];
    const glow = 1 - smoothstep(0, 2.4, d);
    if (rockAt(g.x, g.z)) {
      // Basalt: columns of dark rock, each a shade of its own, their joints glowing near the lava; a lit rim where the ash begins.
      if (!rockAt(gd.x, gd.z) || !rockAt(gr.x, gr.z)) return [BASALT[4], MAT.SOLID];
      const id = joint(g.x, g.z);
      const seam = joint(gr.x, gr.z) !== id || joint(gd.x, gd.z) !== id;
      if (seam) return glow > 0.62 ? [LAVA[glow > 0.8 ? 4 : 3], MAT.LAVA] : [BASALT[0], MAT.SOLID];
      // Each column's top catches the light along its upper-left edge.
      const gu = view.ground(sx, sy - 1)!, gl = view.ground(sx - 1, sy)!;
      if (joint(gu.x, gu.z) !== id || joint(gl.x, gl.z) !== id) return [BASALT[3], MAT.SOLID];
      return [BASALT[1 + (id < 0.55 ? 0 : 1)], MAT.SOLID];
    }
    // Ash: lit over the battle, darker toward the sides, in soft mounds; warmed by the lava near it.
    const light = 1 - smoothstep(0.5, 1.3, Math.hypot((g.x - cx) / 3.3, (g.z - cz) / 4.5));
    const e = 0.08;
    const slope = -(mound(g.x + e, g.z) - mound(g.x - e, g.z)) / (2 * e) * 0.9 + (mound(g.x, g.z + e) - mound(g.x, g.z - e)) / (2 * e) * 0.7;
    let v = 2.9 + light * 1.5 + slope * 1.2;
    if (sideRock(g.x, g.z) > 0.55) v -= 0.8; // thin ash over the rock
    if (glow > 0.42 || (glow > 0.3 && (glow - 0.3) * 8 > bayer(sx, sy))) return [band(WARM, v - 1.7 + glow * 1.3, sx, sy, 0.12), MAT.SOLID];
    return [band(ASH, v, sx, sy, 0.12), MAT.SOLID];
  });
  // Cinders on the ash, sparse.
  scatter(ctx, 11, 29, (_x, _z, sx, sy, ppu, r) => {
    if (r < 0.9 || ground.material(sx, sy) !== MAT.SOLID || indexIn(ASH, ground.get(sx, sy)) < 0) return;
    ground.set(sx, sy, BASALT[2]);
    if (ppu > 34) ground.set(sx + 1, sy, BASALT[3]);
  });
  // The crater's wall rising behind the lava: dark rock, lit along its crests, the far rim hazier.
  hills(ctx, [
    { z: 21, height: 1.5, shades: WALL, crest: hex('#bd948b'), freq: 0.3, rough: 0.9, seed: 13 },
    { z: 18.6, height: 0.9, shades: BASALT, crest: ASH[1], freq: 0.5, rough: 0.9, seed: 17 },
  ]);
  // Steam rising off the lava, drifting right, before the crater wall.
  const steam = [];
  for (let x = -14; x < 14; x += ctx.rng.range(1.5, 3)) {
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
  // Steam vents on the slope: a crack glowing in the ash, a wisp wavering up out of it (one between the
  // wild Pokémon's healthbox and the wild Pokémon, one at the right edge, more beyond for the intro).
  for (const [vsx, vsy] of [[114, 50], [245, 66], [-60, 70], [300, 60]] as const) {
    const g = view.ground(vsx, vsy)!;
    const w = Math.max(3, Math.round(g.ppu * 0.2));
    for (let i = -w; i <= w; i++) {
      const y = vsy + Math.round(Math.sin(i * 0.9) * 0.6);
      const x = vsx + i;
      ground.set(x, y, Math.abs(i) < w * 0.4 ? LAVA[4] : LAVA[1], MAT.LAVA);
      ground.set(x, y + 1, BASALT[0], MAT.SOLID);
      if (Math.abs(i) < w * 0.7) ground.set(x, y - 1, BASALT[1], MAT.SOLID);
    }
    // Grey against the pale ash, so it reads.
    addProp(ctx, { sprite: wisp(g.ppu * 0.12, g.ppu * 1.1, ramp('#8b7373', '#a49494', '#c5b4b4'), ctx.rng.int(1, 1e6), 0.15), x: g.x, z: g.z, sway: 2 });
  }
  // Basalt boulders and spires at the sides, the biggest framing the foreground at the left.
  const pal = { shades: BASALT, outline: BASALT[0] };
  const lit = { shades: ramp('#411418', '#623931', '#833120', '#9c6252', '#bd8373'), outline: BASALT[0] };
  const standing = [];
  for (const [x, z, w, h] of [[2.45, 7.2, 1.2, 0.75], [2.05, 6.3, 0.6, 0.4], [3.0, 9.8, 1.1, 0.8], [2.6, 12.4, 0.8, 0.5], [-3.3, 11.2, 1.2, 0.85], [-2.7, 12.6, 0.7, 0.45], [-3.2, 9.2, 0.8, 0.5]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    standing.push({ sprite: crag(ppu * w, ppu * h, x > 0 ? pal : lit, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * w * 0.6, ry: ppu * w * 0.13 } });
  }
  for (const [x, z, s] of [[2.3, 11.6, 0.9], [-4.6, 13.4, 0.8]] as const) {
    const ppu = view.ppu(view.depth(x, 0, z));
    standing.push({ sprite: stalagmite(ppu * s * 0.5, ppu * s * 1.3, lit, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: ppu * s * 0.35, ry: ppu * 0.07 } });
  }
  stand(ctx, standing, darker([ASH, BASALT, WARM]));
}

// --- GRANITE CAVE -------------------------------------------------------------
// --- GRANITE CAVE -------------------------------------------------------------
// --- GRANITE CAVE -------------------------------------------------------------
// --- GRANITE CAVE -------------------------------------------------------------
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
    const a = Math.hypot((x - cx) / 2.8, (z - cz) / 4.1) + (fbm(x * 0.32, z * 0.4, 84) - 0.5) * 0.9 + (fbm(x * 1.1, z * 1.3, 85) - 0.5) * 0.25;
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
    // Clear of the daylight's spot, and of the wild Pokémon's head and shoulders (a calm wall behind it).
    if (Math.abs(x - spot.x) < 0.8 || (x > ctx.enemy.x - 1.3 && x < ctx.enemy.x + 0.45)) continue;
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
  const spikes = [[2.2, 12.1, 0.8], [-3.35, 12.3, 1], [1.6, 12.5, 0.55]] as const;
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
      // White lines around the court (wider near the camera), down its middle and across its far end.
      const lw = Math.max(0.06, 1.05 / g.ppu), lz = Math.max(0.03, 0.55 / g.ppu);
      if (Math.min(g.x - court.x0, court.x1 - g.x) < lw || Math.min(g.z - court.z0, court.z1 - g.z) < lz) return [G[7], MAT.SOLID];
      const midX = (court.x0 + court.x1) / 2;
      if (Math.abs(g.x - midX) < lw * 0.5 || (Math.abs(g.z - (court.z1 - 1.5)) < lz * 0.6 && Math.abs(g.x - midX) > lw * 2)) return [G[6], MAT.SOLID];
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
        tallGrass: 30,
        tallGrassHeight: 1.5,
        puddles: [{ x: 2.45, z: 9.4, r: 0.8 }, { x: -3.6, z: 11.4, r: 0.9 }, { x: 3.6, z: 12.2, r: 0.8 }, { x: -6, z: 9, r: 1 }, { x: 6.5, z: 10.5, r: 0.9 }],
        flowers: 2,
        treeLine: 14.2,
      }),
  },
  sand: { name: 'ROUTE 111', about: 'The desert, where sand never stops blowing.', ambience: 'sand', paint: desert },
  water: {
    name: 'ROUTE 124',
    about: 'The open sea off LILYCOVE CITY.',
    ambience: 'water',
    look: { waveLight: [172, 197, 230], waveDark: [57, 82, 156], waveDensity: 0.06 },
    ripples: 0.9,
    paint: sea,
  },
  pond: {
    name: 'ROUTE 102',
    about: 'A calm pond hidden among the trees.',
    ambience: 'pond',
    look: { waveLight: [166, 218, 248], waveDark: [63, 103, 168], waveDensity: 0.12 },
    ripples: 0,
    paint: (ctx) => meadow(ctx, { grass: MEADOW, blades: BLADES, leaves: LEAVES, pond: { x: -0.8, z: 12.5, rx: 4.2, rz: 1.8 }, tallGrass: 8, treeLine: 16.2 }),
  },
  underwater: { name: 'SEAFLOOR', about: 'Deep below the waves of ROUTE 128.', ambience: 'underwater', paint: seafloor },
  mountain: { name: 'MT. CHIMNEY', about: 'Rocky slopes dusted with volcanic ash.', ambience: 'mountain', look: { lavaHot: [255, 190, 80] }, paint: chimney },
  cave: { name: 'GRANITE CAVE', about: 'A dim cave on DEWFORD ISLAND.', ambience: 'cave', paint: cave },
  building: { name: 'BATTLE TOWER', about: 'Where trainers test their POKéMON.', ambience: 'building', paint: tower },
};

