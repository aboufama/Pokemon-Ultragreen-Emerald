// The battle arenas, one per kind of place, painted in Hoenn's colors (the
// overworld tilesets' palettes: mint route grass, round trees, sea blues,
// cave browns). Each is
// composed for the one battle camera: a far view across the top, the arena
// lit brightest around the battlers, framing at the edges of the view. No
// platforms: the Pokémon stand on the ground itself, with their shadows.

import { MAT, type Ramp, type Rgb, type Sprite, band, bayer, fbm, hash2, hex, mix, noise, ramp, smoothstep } from './art';
import { type ArenaContext, type ArenaDesign, addProp, at, darker, fill, foeCalm, frameProp, onLine, scatter, shafts, shift, stand } from './design';
import { bush, crag, reeds, rock, stalagmite, tallGrass, tree } from './sprites';

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
/** A ramp drawn toward its own middle by `t`: the same hues, less contrast between its shades. */
const squeeze = (r: Ramp, t: number): Ramp => {
  const m = mix(r[(r.length - 1) >> 1], r[r.length >> 1], 0.5);
  return r.map((k) => mix(k, m, t));
};
/** The far bank's trees mirrored in the water, softened toward the water's blue: a quiet band behind the wild Pokémon. */
const POND_REFLECT = tint(REFLECT, POND[3], 0.45);

/**
 * A Hoenn route meadow: mint grass in patches whose borders are drawn as
 * blades, lit over the battle and shaded toward the sides and under the trees
 * (sun flecks through their leaves); blade tufts, clover and flower beds in
 * loose clusters, big tufts and flowers framing the left; a path, a pond or
 * rain puddles; round trees in rows behind, hazy and soft. Quiet right
 * behind and around the wild Pokémon.
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
    const fleck = shade > 0.25 && fbm(x * 1.1, z * 2, 57) > 0.62 ? 1 : 0;
    const patch = fbm(x * 0.2, z * 0.34, 11);
    const p = patch > 0.69 ? 1 : patch < 0.35 ? -1 : 0;
    // Kept within a narrow range of the ramp, in few broad patches: the grass is the ground the Pokémon stand on, not the show.
    return 2.4 + pool * 1.25 + p * 0.5 - shade * 1.1 + fleck * 0.8;
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
        if (inFar) return [POND_REFLECT[farEdge < 0.08 ? 0 : farEdge < 0.2 ? 1 : 2], MAT.WATER];
        // Open water: a shade darker toward the banks, the sky a shade lighter on the near water, in soft wavy bands, now and then a ripple line.
        const wob = Math.sin(g.x * 2.1 + g.z * 3) * 0.08 + Math.sin(g.x * 5.3) * 0.03;
        const depth = -w + wob;
        let v = depth < 0.18 ? 3 : g.z < p.z ? 5 : 4;
        if (v === 4 && Math.abs(Math.sin(g.z * 9 + Math.sin(g.x * 1.7) * 1.5)) > 0.985 && Math.sin(g.x * 3.3 + g.z) > 0.3) v += 1;
        return [POND[v], MAT.WATER];
      }
      // A puddle: the grass of its far rim mirrored dark along the top, sky on the rest, a pale streak.
      const d = -puddleD(g.x, g.z);
      const up2 = view.ground(sx, sy - 2), up4 = view.ground(sx, sy - 4);
      if (up2 && puddleD(up2.x, up2.z) >= 0) return [POND_REFLECT[1], MAT.WATER];
      if (up4 && puddleD(up4.x, up4.z) >= 0) return [POND[3], MAT.WATER];
      const streak = Math.abs(((g.x - g.z * 0.6) * 3.1) % 1) < 0.12 && d > 0.25;
      return [streak ? POND[6] : band(POND, 5 + Math.min(0.9, d * 3), sx, sy, 0.1), MAT.WATER];
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
  // Blade tufts, in loose clusters: two blades a shade darker than the grass, a light tip near the camera;
  // none right around the wild Pokémon.
  scatter(ctx, 9, 3, (x, z, sx, sy, ppu, r) => {
    const f = fbm(x * 0.45, z * 0.75, 51);
    if (r > (f - 0.52) * 1.8 || ground.material(sx, sy) !== MAT.GRASS || foeCalm(ctx, sx, sy) > 0.3) return;
    const i = indexIn(G, ground.get(sx, sy));
    if (i < 0) return;
    const dark = G[Math.max(0, i - 1)], light = r < 0.08 ? G[Math.min(G.length - 1, i + 1)] : null;
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
  // Clover in a few patches near the camera: three round leaves a shade darker than the grass.
  scatter(ctx, 11, 17, (x, z, sx, sy, ppu, r) => {
    if (ppu < 40 || r > 0.2 || fbm(x * 0.6, z * 0.9, 52) < 0.66 || ground.material(sx, sy) !== MAT.GRASS || foeCalm(ctx, sx, sy) > 0) return;
    const i = indexIn(G, ground.get(sx, sy));
    if (i < 1) return;
    const leaf = G[i - 1];
    ground.set(sx - 1, sy, leaf, MAT.GRASS);
    ground.set(sx + 1, sy, leaf, MAT.GRASS);
    ground.set(sx, sy - 1, leaf, MAT.GRASS);
    ground.set(sx, sy, leaf, MAT.GRASS);
  });
  // A few pebbles on the path, a shade off the sand.
  if (o.path) {
    scatter(ctx, 7, 9, (x, z, sx, sy, ppu, r) => {
      if (r > 0.08 || onPath(x, z) > -0.15 || foeCalm(ctx, sx, sy) > 0) return;
      ground.set(sx, sy, PATH[1]);
      if (ppu > 30) ground.set(sx + 1, sy, PATH[3]);
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
  const beds = o.flowers ?? 3;
  // The first beds where they show (below the wild Pokémon's healthbox, past the player's), then anywhere clear.
  const spots = [[20, 62], [238, 100]];
  for (let b = 0, tries = 0; b < beds && tries < 200; tries++) {
    const spot = spots[b];
    const c = spot && tries < spots.length ? at(ctx, spot[0], spot[1]) : at(ctx, ctx.rng.range(-30, 270), ctx.rng.range(34, 112));
    const [bx, by] = view.screen(c.x, 0, c.z);
    if (Math.hypot(c.x - ctx.enemy.x, (c.z - ctx.enemy.z) * 1.4) < 2.2 || Math.hypot(c.x - ctx.player.x, c.z - ctx.player.z) < 1.6 || c.z > line - 0.6 || foeCalm(ctx, bx, by, 16) > 0) continue;
    b++;
    const kind = FLOWERS[ctx.rng.int(0, FLOWERS.length - 1)];
    const n = ctx.rng.int(4, 8);
    for (let i = 0; i < n; i++) flower(c.x + ctx.rng.range(-0.7, 0.7) * (1 - i / n * 0.5), c.z + ctx.rng.range(-0.4, 0.4), kind);
  }
  // The tree line: staggered rows of round trees, the far rows hazier; bushes at its foot. It stands right
  // behind the wild Pokémon, so it is a quiet backdrop: every row hazy, its greens drawn together (no lime
  // highlights, shades close to each other, clean steps with few flecks), outlines a dark green rather
  // than near-black, olive trunks.
  const dark = darker([G, PATH]);
  const greens = o.leaves.slice(0, -1);
  const leaves = squeeze(greens, 0.25);
  const trunk = tint(TRUNK, greens[0], 0.35);
  const soften = (haze: number) => ({ leaves: tint(leaves, HAZE, haze), outline: mix(mix(TREE_OUTLINE, greens[0], 0.3), HAZE, haze * 0.8), trunk: tint(trunk, HAZE, haze), speckle: 0.012, soft: 0.05 });
  const trees = [];
  for (let row = 0; row < 3; row++) {
    const z0 = line + row * 1.7;
    const pal = soften(0.17 + row * 0.15);
    for (let x = -24 + row * 0.9; x < 24; x += ctx.rng.range(1.6, 2.2)) {
      const z = z0 + ctx.rng.range(-0.35, 0.35);
      const ppu = view.ppu(view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(2.2, 2.7);
      trees.push({ sprite: tree(w, pal, ctx.rng.int(1, 1e6)), x, z });
    }
  }
  const bushPal = soften(0.17);
  for (let i = 0; i < 14; i++) {
    const x = ctx.rng.range(-20, 20), z = line - ctx.rng.range(0.5, 1.6);
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.9, 1.5);
    const sprite = bush(w, bushPal, ctx.rng.int(1, 1e6));
    if (water(x, z) < 0.3 || i % 3 === 2) continue;
    trees.push({ sprite, x, z });
  }
  stand(ctx, trees, dark);
  // Framing the left: big tufts of grass in the foreground, cropped by the frame, with red flowers
  // (Route 101), grown taller (Route 120), or around a mossy boulder and reeds (Route 102).
  // Tall grass is drawn toward the meadow's own green, its blades' lit and shaded edges close together, its
  // outline a soft dark green: framing, not a feature.
  const blades = squeeze(tint(o.blades, G[2], 0.45), 0.2);
  const bladeOutline = mix(TREE_OUTLINE, G[1], 0.55);
  const softOutline = mix(TREE_OUTLINE, G[1], 0.35);
  const tall = o.tallGrassHeight ?? 1;
  const tufts: { sprite: Sprite; x: number; z: number; mat: number }[] = [];
  const tuftSpots = o.pond
    ? [[22, 106, 0.8], [36, 112, 0.7], [-8, 90, 0.8]]
    : [[2, 110, 1], [22, 104, 0.8], [-6, 92, 0.9], [34, 112, 0.7], ...(tall > 1 ? [] : [[10, 84, 0.6]])];
  for (const [sx, sy, s] of tuftSpots) {
    const g = view.ground(sx, sy)!;
    const w = g.ppu * 0.55 * s, h = g.ppu * 0.42 * s * Math.min(1.2, tall);
    tufts.push({ sprite: tallGrass(w, h, { blades, outline: bladeOutline }, ctx.rng.int(1, 1e6)), x: g.x, z: g.z, mat: MAT.GRASS });
  }
  if (o.pond) {
    const g = view.ground(2, 104)!;
    tufts.push({ sprite: rock(g.ppu * 0.7, g.ppu * 0.45, { shades: ramp('#4a5a31', '#6a7b41', '#8b946a', '#b4ac8b', '#d5cdac'), outline: softOutline }, ctx.rng.int(1, 1e6)), x: g.x, z: g.z, mat: MAT.SOLID });
    for (const [sx, sy] of [[14, 96], [-2, 88]]) {
      const r = view.ground(sx, sy)!;
      tufts.push({ sprite: reeds(r.ppu * 0.35, r.ppu * 0.7, REED_STEM, REED_HEAD, softOutline, ctx.rng.int(1, 1e6)), x: r.x, z: r.z, mat: MAT.GRASS });
    }
  }
  tufts.sort((a, b) => b.z - a.z);
  for (const t of tufts) {
    const [px, py] = view.screen(t.x, 0, t.z);
    ground.sprite(t.sprite, Math.round(px), Math.floor(py) + 1, t.mat);
  }
  if (!o.pond && tall <= 1) {
    for (let i = 0; i < 3; i++) {
      const g = view.ground(ctx.rng.range(4, 30), ctx.rng.range(88, 100))!;
      flower(g.x, g.z, FLOWERS[0]);
    }
  }
  // Tall grass swaying at the edges of the view (props: it can hide the Pokémon's feet), a few clumps
  // more along the sides where the view shows them, none around the wild Pokémon.
  const clump = (ppu: number) => {
    const w = ppu * ctx.rng.range(0.4, 0.62), h = ppu * ctx.rng.range(0.3, 0.4) * (o.tallGrassHeight ?? 1);
    return { sprite: tallGrass(w, h, { blades, outline: bladeOutline }, ctx.rng.int(1, 1e6)), sway: Math.max(1, h * 0.12) };
  };
  frameProp(ctx, 3, 70, -1, clump);
  frameProp(ctx, 238, 104, 1, clump);
  const clumps = Math.round((o.tallGrass ?? 10) / 8);
  for (let i = 0, tries = 0; i < clumps && tries < 400; tries++) {
    const [sx, sy] = ctx.rng.chance(0.7) ? [ctx.rng.range(-24, 16), ctx.rng.range(40, 112)] : [ctx.rng.range(16, 124), ctx.rng.range(26, 44)];
    const p = at(ctx, sx, sy);
    if (onPath(p.x, p.z) < 0.3 || water(p.x, p.z) < 0.25 || p.z > line - 0.4 || foeCalm(ctx, sx, sy, 16) > 0) continue;
    const ppu = view.ppu(view.depth(p.x, 0, p.z));
    if (addProp(ctx, { ...clump(ppu), x: p.x, z: p.z })) i++;
  }
  // Reeds along the pond's shore, lily pads in a couple of clusters on it, none right behind the wild Pokémon.
  if (o.pond) {
    const p = o.pond;
    for (let i = 0; i < 18; i++) {
      const a = ctx.rng.range(0, Math.PI * 2);
      const x = p.x + Math.cos(a) * p.rx * 1.03, z = p.z + Math.sin(a) * p.rz * 1.03;
      const ppu = view.ppu(view.depth(x, 0, z));
      const w = ppu * ctx.rng.range(0.25, 0.45), h = ppu * ctx.rng.range(0.45, 0.8);
      const sprite = reeds(w, h, REED_STEM, REED_HEAD, softOutline, ctx.rng.int(1, 1e6));
      const [rx, ry] = view.screen(x, 0, z);
      if (Math.sin(a) < -0.3 || i % 2 || foeCalm(ctx, rx, ry, 10) > 0) continue; // none on the near shore
      addProp(ctx, { sprite, x, z, sway: Math.max(1, h * 0.08) });
    }
    for (let k = 0; k < 4; k++) {
      const cxp = p.x + ctx.rng.range(-0.7, 0.7) * p.rx, czp = p.z + ctx.rng.range(-0.5, 0.2) * p.rz;
      const [kx, ky] = view.screen(cxp, 0, czp);
      const skip = k % 2 === 1 || foeCalm(ctx, kx, ky, 24) > 0;
      for (let i = ctx.rng.int(4, 8); i > 0; i--) {
        const x = cxp + ctx.rng.range(-0.6, 0.6), z = czp + ctx.rng.range(-0.3, 0.3);
        if (skip || pondD(x, z) > -0.2) continue;
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
   * split now and then by a dark crack. Kept to a shade or so either way: the
   * ledge stands right behind the wild Pokémon.
   */
  const rockFace = (along: number, y: number, base: number, px: number) => {
    const L = y / 0.3 + (noise(along * 0.8, y * 0.6, 92) - 0.5) * 0.9 + Math.sin(along * 1.3) * 0.15;
    const layer = Math.floor(L), f = L - layer;
    let v = base + (hash2(layer, 7, 93) - 0.5) * 0.6 + (noise(along * 1.6, layer * 3.1, 94) - 0.5) * 0.8;
    if (f < px * 1.2) v -= 1.0;
    else if (f > 1 - px * 1.2) v += 0.6;
    const c = along / 0.9 + hash2(layer, 3, 95) * 5;
    if (Math.abs(c - Math.round(c)) < px * 0.2 && hash2(layer, Math.round(c), 96) < 0.3) v -= 1.1;
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
      return [band(GC, v, sx, sy, 0.08), MAT.SOLID];
    }
    if (kind === 1) {
      // A terrace: a pale lip along its edge, darker sand behind.
      if (down >= 0 && (KIND[down] !== 1 || LEVEL[down] !== lv)) return [GC[lv === 1 ? 7 : 5], MAT.BACKDROP];
      const v = 4.4 - lv * 1.3 - dark * 1.6 + (fbm(x * 0.7, z * 0.9, 6) - 0.5) * 0.6;
      return [band(GC, v, sx, sy, 0.08), MAT.BACKDROP];
    }
    if (kind >= 3) {
      // The left wall faces away from the light, the right one into it.
      let v = rockFace(z * 1.4, y, kind === 3 ? 3.3 : 4.9, px) - dark * 0.8;
      if (y < 0.08) v -= 1;
      return [band(GC, v, sx, sy, 0.1), MAT.BACKDROP];
    }
    // A ledge's face, lit by the daylight's spill near the spot; the lip along its top catches the light.
    if (up >= 0 && KIND[up] === 1 && LEVEL[up] === lv + 1) return [GC[Math.max(2, Math.round(7 - lv - dark * 1.5))], MAT.BACKDROP];
    const spill = 1 - smoothstep(0.8, 3.6, Math.abs(x - spot.x - 0.3));
    let v = rockFace(x, y, 3.7 - lv * 1.1 + spill * (lv === 0 ? 1.0 : 0.3), px) - dark * (1.2 + lv * 0.4);
    if (y < 0.06) v -= 1.2;
    return [band(GC, v, sx, sy, 0.1), MAT.BACKDROP];
  });
  // The floor's texture: Emerald's cave hatching (short light strokes up to the right) in a few patches of
  // the light, and a little rubble; none around the wild Pokémon.
  scatter(ctx, 7, 31, (x, z, sx, sy, ppu, r) => {
    if (ground.material(sx, sy) !== MAT.SOLID || foeCalm(ctx, sx, sy) > 0) return;
    const i = indexIn(GC, ground.get(sx, sy));
    if (i >= 6 && r < 0.1 && fbm(x * 0.5, z * 0.7, 77) > 0.54) {
      const len = ppu > 50 ? 3 : 2;
      for (let k = 0; k < len; k++) {
        const c = ground.get(sx + k, sy - k);
        if (c && ground.material(sx + k, sy - k) === MAT.SOLID) ground.set(sx + k, sy - k, shift([GC], c, 1));
      }
    } else if (r > 0.97 && i >= 1) {
      ground.set(sx, sy, GC[i - 1]);
      if (ppu > 34) ground.set(sx + 1, sy, GC[Math.min(9, i + 1)]);
    }
  });
  // Daylight through an opening in the ceiling, slanting down from the upper left onto the spot.
  const [spx, spy] = view.screen(spot.x, 0, spot.z);
  const slope = 0.3;
  shafts(ctx, [
    { x: spx - (spy - ground.oy) * slope - 16, w: 30, lean: slope, bottom: spy + 5, strength: 1, lift: 2, banded: true },
    { x: spx - (spy - ground.oy) * slope + 18, w: 6, lean: slope, bottom: spy - 8, strength: 0.6, lift: 1, banded: true },
  ], [GC]);
  // Boulders heaped at the walls' feet and on the terraces; stalagmites along the sides. None right behind
  // the wild Pokémon (a calm wall behind it), each with a crack at most, the lit ones outlined a shade softer.
  const pale = { shades: ramp('#522931', '#734a39', '#946a5a', '#ac8b6a', '#cdac7b', '#e6c58b'), outline: GC[2], cracks: 1 };
  const dim = { shades: ramp('#2c1826', '#412941', '#522931', '#734a39', '#946a5a'), outline: GC[0], cracks: 1 };
  const heap = [];
  for (let x = -2.9; x < 2.9; x += ctx.rng.range(0.7, 1.5)) {
    const z = back(x) - ctx.rng.range(0.15, 0.5);
    const [bx, by] = view.screen(x, 0, z);
    // Clear of the daylight's spot, and of the wild Pokémon.
    if (Math.abs(x - spot.x) < 0.8 || foeCalm(ctx, bx, by, 4) > 0) continue;
    const ppu = view.ppu(view.depth(x, 0, z));
    const w = ppu * ctx.rng.range(0.35, 0.75);
    const pal = Math.abs(x - spot.x) < 2.4 ? pale : dim;
    heap.push({ sprite: rock(w, w * ctx.rng.range(0.6, 0.8), pal, ctx.rng.int(1, 1e6)), x, z, shadow: { rx: w * 0.6, ry: w * 0.14 } });
    if (ctx.rng.chance(0.35)) {
      const w2 = w * ctx.rng.range(0.4, 0.6);
      heap.push({ sprite: rock(w2, w2 * 0.7, pal, ctx.rng.int(1, 1e6)), x: x + ctx.rng.range(-0.45, 0.45), z: z - ctx.rng.range(0.2, 0.5) });
    }
  }
  for (const [x, z, s] of [[2.55, 11.2, 0.7], [2.45, 9.4, 0.5], [2.6, 7.3, 0.9], [-2.7, 8.2, 0.9]] as const) {
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
    if (i < 0 || KIND[i] !== 1 || LEVEL[i] !== 1 || foeCalm(ctx, bx, by, 4) > 0) continue;
    // Not right behind a stalagmite's tip (it would read as a cap).
    if (spikes.some((sp) => Math.abs(view.screen(sp[0], 0, sp[1])[0] - bx) < w * 0.5 + 4)) continue;
    ground.sprite(rock(w, w * 0.7, dim, ctx.rng.int(1, 1e6)), Math.round(bx), Math.floor(by) + 1);
  }
  stand(ctx, heap, darker([GC]));
}

/** Every arena, in the order the playtest lists the places. */
export const ARENAS: Record<string, ArenaDesign> = {
  grass: {
    name: 'ROUTE 101',
    about: 'A quiet grassy route near LITTLEROOT TOWN.',
    ambience: 'grass',
    paint: (ctx) => meadow(ctx, { grass: MEADOW, blades: BLADES, leaves: LEAVES, path: true }),
  },
  water: {
    name: 'ROUTE 124',
    about: 'The open sea off LILYCOVE CITY.',
    ambience: 'water',
    look: { waveLight: [172, 197, 230], waveDark: [57, 82, 156], waveDensity: 0.06 },
    ripples: 0.9,
    paint: sea,
  },
  cave: { name: 'GRANITE CAVE', about: 'A dim cave on DEWFORD ISLAND.', ambience: 'cave', paint: cave },
};
