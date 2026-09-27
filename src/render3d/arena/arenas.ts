// The battle arenas, one per kind of place: Route 101's meadow, the open sea
// of Route 124 and Granite Cave. Each is painted in Hoenn's colors (the
// overworld tilesets' palettes: mint route grass, round trees, sea blues,
// cave sand and rock) for the one battle camera, and composed with the
// restraint of Emerald's own battle backgrounds: a few broad tones, a far
// view across the top, framing at the edges, the ground around the Pokémon
// quiet so they stay the focus. The ground is lit the way those backgrounds
// light it, in bands by distance (the same tone right across the view at
// each distance), never in a pool, oval or ring of light. No platforms: the
// Pokémon stand on the ground itself, with their shadows.

import { MAT, type Rgb, type Sprite, band, bayer, fbm, hash2, hex, ramp, smoothstep } from './art';
import { type ArenaContext, type ArenaDesign, type StandSpec, battlerBox, darker, fill, onLine, scatter, shift, stand } from './design';
import { crag, tallGrass, tree } from './sprites';

// --- ROUTE 101 ------------------------------------------------------------------

// Route 101's greens from the general tileset (palette 02: the route grass
// #a4d5c5, #73c5a4 and the tree leaves #83c562, #398b31), three steps each,
// hue-shifted: the shade cooler and more saturated, the light warmer. The
// meadow is pale, like Emerald's grass background; the trees far off are
// hazed toward the sky (lighter, grayer, closer steps), outlined in a dark
// tone of their own green rather than near-black.
const MEADOW = ramp('#7cc2a4', '#98d1b4', '#b3e0bd');
const LEAVES = ramp('#5f9f78', '#7fb888', '#a0cf98');
const LEAF_OUTLINE = hex('#4a8466');
const TRUNK = ramp('#6b7462', '#8a8672');

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

/**
 * Route 101: a pale meadow in three broad tones, in bands by distance: the
 * palest right across the view nearer, stepping down toward the back, after
 * a thin stripe (Emerald's grass background), into the shade of a soft, hazy
 * tree line; every border drawn as blades. The tree line opens behind the
 * wild Pokémon onto a hazier row farther off, the calmest part of the far
 * view right behind it. One clump of tall grass frames the left and a few
 * tufts grow beside the player's Pokémon; nothing else.
 */
function meadow(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const G = MEADOW;
  /** Where the tree line stands (z). */
  const line = 16;
  // The near row, open behind the wild Pokémon; the far row in the leaves' two lighter tones, outlined
  // in the darkest.
  const nearPal = { leaves: LEAVES, outline: LEAF_OUTLINE, trunk: TRUNK };
  const farPal = { leaves: LEAVES.slice(1), outline: LEAVES[0], trunk: [LEAVES[0], TRUNK[1]] };
  const [e0, , e1] = battlerBox(ctx, 'enemy');
  const trees: (StandSpec & { r: number })[] = [];
  for (let x = -12; x < 12; x += ctx.rng.range(1.9, 2.3)) {
    const z = line + ctx.rng.range(-0.2, 0.3);
    const ppu = view.ppu(view.depth(x, 0, z));
    const k = ctx.rng.range(2.3, 2.7);
    const sprite = tree(ppu * k, nearPal, ctx.rng.int(1, 1e6));
    const [sx] = view.screen(x, 0, z);
    if (sx + ppu * k * 0.35 > e0 + 7 && sx - ppu * k * 0.35 < e1 - 11) continue;
    trees.push({ sprite, x, z, r: k / 2 });
  }
  for (let x = -12; x < 12; x += ctx.rng.range(1.7, 2.1)) {
    const z = line + 1.8 + ctx.rng.range(-0.2, 0.3);
    const ppu = view.ppu(view.depth(x, 0, z));
    const k = ctx.rng.range(2.1, 2.5);
    trees.push({ sprite: tree(ppu * k, farPal, ctx.rng.int(1, 1e6)), x, z, r: k / 2 });
  }
  /** In the trees' shade: under each canopy and a little in front of it, so the shade's edge is scalloped. */
  const shaded = (x: number, z: number) => trees.some((t) => ((x - t.x) / (t.r * 0.95)) ** 2 + ((z - t.z) / 1.1) ** 2 < 1 || (z > t.z - 0.2 && Math.abs(x - t.x) < t.r));
  /** The meadow's tone, by distance: 0 shade, 1 mid, 2 light. */
  const tone = (x: number, z: number) => {
    if (shaded(x, z)) return 0;
    // Toward the back, the mid tone after a thin stripe of it, the borders wandering gently.
    const b = z + Math.sin(x * 0.7 + 1.3) * 0.22 + Math.sin(x * 1.9 + 0.4) * 0.08;
    if (b > 12.1 || (b > 11.45 && b < 11.75)) return 1;
    return 2;
  };
  // The tones sampled a blade's height lower, so the nearer grass pokes up into the farther in blades.
  fill(ctx, (sx, sy, g) => {
    const t = bladeTooth(sx, g.ppu);
    const q = t ? view.ground(sx, sy + t)! : g;
    return [G[tone(q.x, q.z)], MAT.GRASS];
  });
  stand(ctx, trees, darker([G]));
  // A few tufts in the strip left of the player's Pokémon (Emerald draws its tufts where the Pokémon
  // stand): two blades a shade darker than the grass they grow in, the taller one either side.
  const tuft = [[-1, -1], [-1, 0], [1, -2], [1, -1], [1, 0], [0, 0]];
  scatter(ctx, 12, 3, (_x, _z, sx, sy, ppu, r) => {
    if (r > 0.35 || sx > 44 || sy < 50 || sy > 108 || ppu < 36) return;
    const shape = r < 0.17 ? tuft.map(([dx, dy]) => [-dx, dy]) : tuft;
    const i = indexIn(G, ground.get(sx, sy));
    if (i < 1 || shape.some(([dx, dy]) => ground.material(sx + dx, sy + dy) !== MAT.GRASS || indexIn(G, ground.get(sx + dx, sy + dy)) !== i)) return;
    for (const [dx, dy] of shape) ground.set(sx + dx, sy + dy, G[i - 1], MAT.GRASS);
  });
  // Framing the left: one clump of tall grass in the foreground, its foot under the text box, cropped by
  // the frame (painted into the ground: the player's Pokémon is nearer and covers it).
  const g = view.ground(10, 118)!;
  ground.sprite(tallGrass(g.ppu * 0.75, g.ppu * 0.55, { blades: [LEAVES[0], G[0], G[2]], outline: LEAF_OUTLINE }, ctx.rng.int(1, 1e6)), 10, 118, MAT.GRASS);
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

// --- GRANITE CAVE -----------------------------------------------------------------

// Granite Cave's sand from the cave tileset (palette 06: #cdac7b, and a step
// between it and #ac8b6a): the lit floor, and a close step darker by the
// wall, in its shade. Its back wall: the tileset's pink-gray rock (palette
// 07) in shadow, a step below the lit floor, and hazed toward the dusty
// light (no near-black far off), three steps. Its boulders and pebbles are
// Hoenn's pink-brown rock, like the sea's stacks.
const SAND = ramp('#bd9c73', '#cdac7b');
const WALL = ramp('#7d6361', '#957670', '#ab8d80');

/**
 * Granite Cave: a calm chamber of warm sand under a quiet back wall of
 * layered ledges (Emerald's cave ledges: each lip a row of low rounded rock
 * tops catching the light, the bands darker going up into the gloom), the
 * wall coming forward at the chamber's corners. Daylight falls in a column
 * from an opening at the upper left across the wall, down to its foot. The
 * floor is lit by distance, like Emerald's cave background: a close step
 * darker by the wall and in a thin stripe in front of it, the lit sand right
 * across the view nearer (no pool or spot of light). A boulder frames the
 * left with a few pebbles beside it, a smaller rock the far right; nothing
 * else.
 */
function cave(ctx: ArenaContext): void {
  const { view, ground } = ctx;
  const cam = view.camera.position;
  // The back wall: its foot wanders a little and comes forward at the sides (the chamber's corners).
  const wallZ = (x: number) => 14.6 + Math.sin(x * 0.5 + 1) * 0.3 + Math.sin(x * 1.3) * 0.08 - 0.45 * Math.max(0, Math.abs(x + 0.4) - 3) ** 2;
  // The daylight: a column bw px wide slanting down from the upper left, its axis through (bx, by), across
  // the back wall down to its foot. It lifts the wall it crosses a step and never lights the floor.
  const [bx, by] = view.screen(1.2, 0, 12.2);
  const lean = 0.42, bw = 24;
  /** A ledge's lip: a row of low rounded rock tops, each 0.45-0.65 wide (world units). */
  const lip = (x: number, k: number) => {
    const u = x / (0.45 + hash2(Math.floor(x / 0.5), k, 62) * 0.2) + k * 0.37;
    const f = u - Math.floor(u);
    return (1 - (2 * f - 1) ** 2) * 0.035;
  };
  fill(ctx, (sx, sy, g) => {
    const beam = Math.abs(sx + 0.5 - (bx + (sy - by) * lean)) < bw / 2;
    // Does the view ray meet the wall before the floor?
    let t = wallZ(g.x) / g.z;
    for (let n = 0; n < 5; n++) t = (wallZ(cam.x + (g.x - cam.x) * t) - cam.z) / (g.z - cam.z);
    if (t < 1) {
      const y = cam.y * (1 - t), x = cam.x + (g.x - cam.x) * t, z = cam.z + (g.z - cam.z) * t;
      const px = 1 / view.ppu(view.depth(x, y, z));
      // Two ledges: three bands, darker going up, the lower lip in the rock's light, the upper in the wall's;
      // the daylight lifts what it crosses a step.
      const ledge1 = 0.36 + Math.sin(x * 0.45 + 0.8) * 0.06 + Math.sin(x * 1.1) * 0.02 + lip(x, 1);
      const ledge2 = 0.78 + Math.sin(x * 0.38 + 2.6) * 0.07 + Math.sin(x * 0.9 + 1) * 0.02 + lip(x, 2);
      const lift = beam ? 1 : 0;
      if (y < px * 1.5) return [WALL[lift], MAT.BACKDROP];
      if (y < ledge1) return [y > ledge1 - px ? ROCK[3] : WALL[2], MAT.BACKDROP];
      if (y < ledge2) return [y > ledge2 - px ? WALL[2] : WALL[1 + lift], MAT.BACKDROP];
      return [WALL[lift], MAT.BACKDROP];
    }
    // The floor, lit by distance like Emerald's own cave background: by the wall a close step darker (the
    // wall's shade), a thin stripe of it in front, the rest the lit tone right across the view.
    const b = g.z + Math.sin(g.x * 0.6 + 0.5) * 0.2 + Math.sin(g.x * 1.7 + 2.1) * 0.07;
    return [SAND[b > 12 || (b > 11.35 && b < 11.6) ? 0 : 1], MAT.SOLID];
  });
  // Framing: a boulder at the left edge of the foreground, cropped by the frame (painted into the ground:
  // the player's Pokémon is nearer and covers it), and a smaller one hazed at the wall's foot, past the right.
  const g = view.ground(12, 116)!;
  ground.sprite(crag(g.ppu * 0.85, g.ppu * 0.7, { shades: ROCK.slice(1), outline: ROCK_OUTLINE }, ctx.rng.int(1, 1e6), 9), 12, 116);
  const r = view.ground(240, 30)!;
  stand(ctx, [{ sprite: crag(r.ppu * 0.8, r.ppu * 0.7, { shades: ROCK.slice(1, 4), outline: ROCK[1] }, ctx.rng.int(1, 1e6), 6), x: r.x, z: r.z }], darker([SAND]));
  // A few pebbles of the boulder's rock in the strip left of the player's Pokémon (Emerald's cave has its
  // pebbles where the Pokémon stand): lit on the upper left, each tone a shade off the sand.
  const pebble = [[[0, -1, 1], [1, -1, 0], [-1, 0, 1], [0, 0, 0], [1, 0, 0]], [[0, -1, 1], [1, -1, 0], [0, 0, 0], [1, 0, 0]]];
  scatter(ctx, 13, 29, (_x, _z, sx, sy, ppu, k) => {
    if (k > 0.3 || sx > 44 || sy < 48 || sy > 108 || ppu < 36) return;
    const shape = pebble[k < 0.12 ? 0 : 1];
    if (shape.some(([dx, dy]) => indexIn(SAND, ground.get(sx + dx, sy + dy)) !== 1 || ground.material(sx + dx, sy + dy) !== MAT.SOLID)) return;
    for (const [dx, dy, lit] of shape) ground.set(sx + dx, sy + dy, ROCK[3 + lit], MAT.SOLID);
  });
}

/** Every arena, in the order the playtest lists the places. */
export const ARENAS: Record<string, ArenaDesign> = {
  grass: {
    name: 'ROUTE 101',
    about: 'A quiet grassy route near LITTLEROOT TOWN.',
    ambience: 'grass',
    paint: meadow,
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
