// What the resting battle camera sees of a painted arena (the ground with
// its props standing on it; no Pokémon, no ground shader life), which of it
// a battle shows (not under the text box, the healthboxes or the player's
// Pokémon), and how calm and how sparse that is, whether its ground holds a
// light pool, and whether the Pokémon are the focus of the rendered battle
// view, for the arena tools (preview.mjs, check.mjs).

/**
 * The screen at rest, RGBA, for GBA pixels [x0, x0 + w) x [y0, y0 + h):
 * ground, then the props farthest first (a prop's rows below its ground
 * point sink into the ground). `propRect` is design.ts's.
 */
export function compose(ctx, propRect, x0, y0, w, h) {
  const img = new Uint8ClampedArray(w * h * 4);
  const g = ctx.ground;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = g.get(x0 + x, y0 + y);
      const i = (y * w + x) * 4;
      if (c) img.set([c[0], c[1], c[2], 255], i);
      else img.set([255, 0, 255, 255], i);
    }
  }
  const props = [...ctx.props].sort((a, b) => ctx.view.depth(b.x, 0, b.z) - ctx.view.depth(a.x, 0, a.z));
  for (const p of props) {
    const [left, top] = propRect(ctx.view, p);
    const margin = Math.ceil(Math.abs(p.sway ?? 0)) + 1;
    const [, ay] = ctx.view.screen(p.x, 0, p.z);
    const s = p.sprite;
    for (let sy = 0; sy < s.h; sy++) {
      const Y = top + sy;
      if (Y > Math.floor(ay)) continue;
      for (let sx = 0; sx < s.w; sx++) {
        const k = (sy * s.w + sx) * 4;
        if (!s.data[k + 3]) continue;
        const X = left + margin + sx;
        if (X < x0 || X >= x0 + w || Y < y0 || Y >= y0 + h) continue;
        img.set([s.data[k], s.data[k + 1], s.data[k + 2], 255], ((Y - y0) * w + (X - x0)) * 4);
      }
    }
  }
  return img;
}

/** What covers the arena in battle at rest: the healthboxes (src/battle/ui), [x, y, w, h], and the text box from row 112. */
export const HEALTHBOXES = [[12, 14, 100, 30], [126, 72, 104, 37]];
export const TEXT_TOP = 112;

/**
 * The arena pixels a battle shows at rest, as a 240 x 160 mask: above the
 * text box, outside the healthboxes and the player's Pokémon's body (the
 * middle of its battler box, 24 px in from each side and 30 from the top,
 * which any Pokémon on our side covers). `playerBox` is design.ts's
 * battlerBox(ctx, 'player'). The outermost rows and columns are left out
 * so every shown pixel has its four neighbors.
 */
export function shownMask(playerBox) {
  const [x0, y0, x1] = playerBox;
  const mask = new Uint8Array(240 * 160);
  for (let y = 1; y < TEXT_TOP - 1; y++) {
    for (let x = 1; x < 239; x++) {
      if (HEALTHBOXES.some(([hx, hy, hw, hh]) => x >= hx && x < hx + hw && y >= hy && y < hy + hh)) continue;
      if (x >= x0 + 24 && x <= x1 - 24 && y >= y0 + 30) continue;
      mask[y * 240 + x] = 1;
    }
  }
  return mask;
}

/**
 * How many of the arena's props show in battle: those with at least `min`
 * of their pixels in `mask` (from shownMask). `propRect` is design.ts's.
 */
export function propsShowing(ctx, propRect, mask, min = 24) {
  let n = 0;
  for (const p of ctx.props) {
    const [left, top] = propRect(ctx.view, p);
    const x0 = left + Math.ceil(Math.abs(p.sway ?? 0)) + 1;
    const [, ay] = ctx.view.screen(p.x, 0, p.z);
    const s = p.sprite;
    let shown = 0;
    for (let y = 0; y < s.h && shown < min; y++) {
      const Y = top + y;
      if (Y > Math.floor(ay) || Y < 0 || Y >= 160) continue;
      for (let x = 0; x < s.w; x++) {
        const X = x0 + x;
        if (s.data[(y * s.w + x) * 4 + 3] && X >= 0 && X < 240 && mask[Y * 240 + X]) shown++;
      }
    }
    if (shown >= min) n++;
  }
  return n;
}

/**
 * How calm the arena is where the battle shows it (`mask`, from shownMask),
 * measured on the luma (0-255) of the resting screen (`img`, from compose):
 *
 *   busy    mean luma step from a shown pixel to its right and lower
 *           neighbors (the two added): texture, dither, marks, outlines, all of it
 *   strong  share of shown pixels with a step over 24 luma to the right or
 *           below (%): hard edges and dark outlines
 *   specks  isolated pixels per 1000 shown: a pixel off all four neighbors by
 *           over 16 luma (pebbles, glints, checkered dither)
 *   marks   scattered marks per 1000 shown: blobs of 12 pixels or fewer
 *           standing out of their 5x5 surroundings by over 20 luma (tufts,
 *           shells, flowers, pebbles; long lines and big things don't count)
 *   open    share of shown pixels on calm open ground: the mean step of their
 *           7x7 surroundings under 6 luma (%)
 *   foe     busy right behind and around the wild Pokémon: over the shown
 *           pixels of `foeBox` (its battler box) widened by 12 px
 */
export function calm(img, mask, foeBox) {
  const W = 240, H = 160;
  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = 0.299 * img[i * 4] + 0.587 * img[i * 4 + 1] + 0.114 * img[i * 4 + 2];
  // Each pixel's step to its right and lower neighbors (0 on the last row and column).
  const step = new Float32Array(W * H);
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      step[i] = Math.abs(L[i] - L[i + 1]) + Math.abs(L[i] - L[i + W]);
    }
  }
  // A summed-area table of the steps, for the means over 7x7 surroundings.
  const S = W + 1;
  const sat = new Float64Array(S * (H + 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sat[(y + 1) * S + x + 1] = step[y * W + x] + sat[y * S + x + 1] + sat[(y + 1) * S + x] - sat[y * S + x];
  const around = (x, y, r) => {
    const xa = Math.max(0, x - r), ya = Math.max(0, y - r), xb = Math.min(W - 1, x + r) + 1, yb = Math.min(H - 1, y + r) + 1;
    return (sat[yb * S + xb] - sat[ya * S + xb] - sat[yb * S + xa] + sat[ya * S + xa]) / ((xb - xa) * (yb - ya));
  };
  const [e0, e1, e2, e3] = foeBox;
  let n = 0, busy = 0, strong = 0, specks = 0, open = 0, nFoe = 0, foe = 0;
  const marked = new Uint8Array(W * H);
  const win = new Float32Array(25);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!mask[i]) continue;
      const l = L[i];
      n++;
      busy += step[i];
      if (Math.abs(l - L[i + 1]) > 24 || Math.abs(l - L[i + W]) > 24) strong++;
      if (Math.abs(l - L[i - 1]) > 16 && Math.abs(l - L[i + 1]) > 16 && Math.abs(l - L[i - W]) > 16 && Math.abs(l - L[i + W]) > 16) specks++;
      if (around(x, y, 3) < 6) open++;
      if (x >= e0 - 12 && x <= e2 + 12 && y >= e1 - 12 && y <= e3 + 12) {
        foe += step[i];
        nFoe++;
      }
      let k = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) win[k++] = L[Math.min(H - 1, Math.max(0, y + dy)) * W + Math.min(W - 1, Math.max(0, x + dx))];
      }
      win.sort();
      if (Math.abs(l - win[12]) > 20) marked[i] = 1;
    }
  }
  // Scattered marks: 8-connected blobs of marked pixels, the small ones counted.
  let marks = 0;
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let i = 0; i < W * H; i++) {
    if (!marked[i] || seen[i]) continue;
    let size = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const k = stack.pop();
      size++;
      const x = k % W, y = (k - x) / W;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
          const j = Y * W + X;
          if (marked[j] && !seen[j]) {
            seen[j] = 1;
            stack.push(j);
          }
        }
      }
    }
    if (size <= 12) marks++;
  }
  return { busy: busy / n, strong: (strong / n) * 100, specks: (specks / n) * 1000, marks: (marks / n) * 1000, open: (open / n) * 100, foe: nFoe ? foe / nFoe : 0 };
}

/** The far view on screen: rows 1-25 (ground z 26-15, where tree lines, walls and the far water stand). */
export const FAR_ROWS = [1, 26];

const luma = (img, i) => 0.299 * img[i * 4] + 0.587 * img[i * 4 + 1] + 0.114 * img[i * 4 + 2];
const chroma = (img, i) => Math.max(img[i * 4], img[i * 4 + 1], img[i * 4 + 2]) - Math.min(img[i * 4], img[i * 4 + 1], img[i * 4 + 2]);
/** The value at fraction `p` of sorted numbers. */
const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0);

/**
 * How sparse the arena is where the battle shows it (`mask`, from
 * shownMask), on the resting screen (`img`, from compose), after Emerald's
 * own battle backgrounds (a pale field of a few close tones, detail kept
 * small) and the pixel-art rules of the arena skill:
 *
 *   colours   distinct colors shown: a small palette
 *   tones     share of the shown pixels in the three most-used colors (%):
 *             a few broad tones, large flat areas
 *   farDark   the far view's darks: 5th percentile of the luma of the shown
 *             pixels in FAR_ROWS (haze lifts the far view's darks: no
 *             near-black far off)
 *   farRange  the far view's contrast: the spread of that luma, 5th to 95th
 *             percentile (haze lowers the far view's contrast)
 */
export function sparse(img, mask) {
  const counts = new Map();
  const far = [];
  let n = 0;
  for (let i = 0; i < 240 * 160; i++) {
    if (!mask[i]) continue;
    n++;
    const k = (img[i * 4] << 16) | (img[i * 4 + 1] << 8) | img[i * 4 + 2];
    counts.set(k, (counts.get(k) ?? 0) + 1);
    const y = Math.floor(i / 240);
    if (y >= FAR_ROWS[0] && y < FAR_ROWS[1]) far.push(luma(img, i));
  }
  const top = [...counts.values()].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
  far.sort((a, b) => a - b);
  return { colours: counts.size, tones: (top / n) * 100, farDark: pct(far, 0.05), farRange: pct(far, 0.95) - pct(far, 0.05) };
}

/**
 * The light regions of an arena's painted ground, to find light pools: a
 * region of the ground lighter than the ground beside it at the same
 * distance (a screen row is one distance from the camera; the camera has no
 * roll). `ground` is the painted area as design.ts's Paint holds it
 * ({ data, width, height, ox, oy }: RGBA, the material in A); the ground is
 * every painted pixel that is not `backdrop` (the far view: trees, walls,
 * rocks), which is left out. `feet` are the screen points the battle stands
 * on (the wild Pokémon's feet, the player's, the ground midway between them).
 *
 * A light region is a connected region of the ground at least as light as
 * some level, holes filled (a ring counts with what it encloses, a pool with
 * the tufts in it), 40 px or more, found on the luma with small detail taken
 * out:
 *
 *   areas    on the median of the ground's 5x5 surroundings (4-connected):
 *            tufts, crests, pebbles and dither drop out, a dithered pool
 *            still counts
 *   rings    on the luma itself (8-connected), where an outline of light 1 px
 *            thin still encloses what it rings: the light regions that
 *            enclose darker ground (a hole of a quarter of their area or more)
 *
 * For each one:
 *
 *   lift     how much lighter it is than the ground beside it at the same
 *            distance: its median luma minus the median of the ground just
 *            left of its first run and just right of its last run, row by row
 *   beside   the share of its row ends (two per row) with ground beside them,
 *            which is darker (the region holds everything as light next to
 *            it), rather than the painted area's edge or the far view: a band
 *            by distance runs off both sides (0), a pool is ringed by darker
 *            ground
 *   closed   the share of its outline inside the painted area that faces
 *            ground at least 6 luma darker (the far view counts against it)
 *   ellipse  how well it fills the ellipse of its own moments (semi-axes
 *            twice the standard deviations; intersection over union): about
 *            0.98 for a painted ellipse, 0.83 for a rectangle (a square, a
 *            stripe), less for a ragged shape
 *   holds    which of `feet` it holds (their indices)
 *
 * and its area (holes filled), hole and bounding box (screen pixels).
 */
export function lightRegions(ground, feet, backdrop) {
  const { data, width: W, height: H, ox, oy } = ground;
  const n = W * H;
  const isGround = new Uint8Array(n);
  const L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = data[i * 4 + 3];
    isGround[i] = a !== 0 && a !== backdrop ? 1 : 0;
    L[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  /** The luma with small detail taken out: the median of the ground in each ground pixel's (2r+1)² surroundings. */
  const median = (r) => {
    const M = new Int16Array(n).fill(-1);
    const win = new Float32Array((2 * r + 1) ** 2);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!isGround[y * W + x]) continue;
        let k = 0;
        for (let Y = Math.max(0, y - r); Y <= Math.min(H - 1, y + r); Y++) {
          for (let X = Math.max(0, x - r); X <= Math.min(W - 1, x + r); X++) {
            if (!isGround[Y * W + X]) continue;
            const v = L[Y * W + X];
            let j = k++;
            for (; j > 0 && win[j - 1] > v; j--) win[j] = win[j - 1];
            win[j] = v;
          }
        }
        M[y * W + x] = Math.round(win[k >> 1]);
      }
    }
    return M;
  };
  const at = feet.map(([fx, fy]) => [Math.floor(fx) - ox, Math.floor(fy) - oy]);
  const regions = [];
  const lab = new Int32Array(n);
  let stamp = 0;
  /** Every level `M` has (the lowest holds all the ground), each level's connected regions that `keep` keeps, measured. */
  const collect = (M, eight, keep) => {
    const levels = [...new Set(M)].filter((v) => v >= 0).sort((a, b) => a - b).slice(1);
    const seen = new Set();
    for (const level of levels) {
      stamp++;
      for (let s = 0; s < n; s++) {
        if (M[s] < level || lab[s] === stamp) continue;
        const px = [s];
        lab[s] = stamp;
        for (let q = 0; q < px.length; q++) {
          const k = px[q], x = k % W;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if ((!dx && !dy) || (!eight && dx && dy) || x + dx < 0 || x + dx >= W) continue;
              const j = k + dy * W + dx;
              if (j < 0 || j >= n || M[j] < level || lab[j] === stamp) continue;
              lab[j] = stamp;
              px.push(j);
            }
          }
        }
        if (px.length < (eight ? 12 : 40)) continue;
        const r = lightRegion(px, M, isGround, W, H, at);
        // The same region at several levels is measured once.
        const key = `${r.bbox}:${px.length}`;
        if (r.area < 40 || seen.has(key) || !keep(r)) continue;
        seen.add(key);
        r.bbox = [r.bbox[0] + ox, r.bbox[1] + oy, r.bbox[2] + ox, r.bbox[3] + oy];
        regions.push(r);
      }
    }
  };
  // Areas, small detail taken out; rings, on the luma itself (the median of 1x1).
  collect(median(2), false, () => true);
  collect(median(0), true, (r) => r.hole >= r.area / 4);
  return regions;
}

function lightRegion(px, M, isGround, W, H, at) {
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (const k of px) {
    const x = k % W, y = (k - x) / W;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  // The region in its box with a pixel of margin; what the margin reaches around it is outside, the rest
  // (the region and its holes) inside.
  const bw = x1 - x0 + 3, bh = y1 - y0 + 3;
  const box = new Uint8Array(bw * bh);
  for (const k of px) {
    const x = k % W, y = (k - x) / W;
    box[(y - y0 + 1) * bw + x - x0 + 1] = 1;
  }
  const out = [0];
  box[0] = 2;
  for (let q = 0; q < out.length; q++) {
    const k = out[q], x = k % bw;
    for (const j of [x > 0 ? k - 1 : -1, x < bw - 1 ? k + 1 : -1, k - bw, k + bw]) {
      if (j < 0 || j >= box.length || box[j]) continue;
      box[j] = 2;
      out.push(j);
    }
  }
  const inside = (x, y) => {
    const X = x - x0 + 1, Y = y - y0 + 1;
    return X >= 0 && Y >= 0 && X < bw && Y < bh && box[Y * bw + X] !== 2;
  };
  const own = px.map((k) => M[k]).sort((a, b) => a - b);
  const median = own[own.length >> 1];
  let area = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, rows = 0, dark = 0, facing = 0;
  const beside = [];
  for (let y = y0; y <= y1; y++) {
    let first = -1, last = -1;
    for (let x = x0; x <= x1; x++) {
      if (!inside(x, y)) continue;
      if (first < 0) first = x;
      last = x;
      area++;
      sx += x;
      sy += y;
      sxx += x * x;
      syy += y * y;
      sxy += x * y;
      for (const [X, Y] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (X < 0 || Y < 0 || X >= W || Y >= H || inside(X, Y)) continue;
        facing++;
        if (isGround[Y * W + X] && M[Y * W + X] <= median - 6) dark++;
      }
    }
    if (first < 0) continue;
    rows++;
    for (const x of [first - 1, last + 1]) if (x >= 0 && x < W && isGround[y * W + x]) beside.push(M[y * W + x]);
  }
  beside.sort((a, b) => a - b);
  // The ellipse of its moments, and how well the region fills it.
  const mx = sx / area, my = sy / area;
  const cxx = sxx / area - mx * mx, cyy = syy / area - my * my, cxy = sxy / area - mx * my;
  const mid = (cxx + cyy) / 2, d = Math.sqrt(Math.max(0, mid * mid - (cxx * cyy - cxy * cxy)));
  const a = 2 * Math.sqrt(mid + d), b = 2 * Math.sqrt(Math.max(1e-6, mid - d));
  const t = 0.5 * Math.atan2(2 * cxy, cxx - cyy), c = Math.cos(t), s = Math.sin(t);
  let both = 0, inEllipse = 0;
  for (let y = Math.floor(my - a - 1); y <= my + a + 1; y++) {
    for (let x = Math.floor(mx - a - 1); x <= mx + a + 1; x++) {
      const u = (x - mx) * c + (y - my) * s, v = (y - my) * c - (x - mx) * s;
      if ((u / a) ** 2 + (v / b) ** 2 > 1) continue;
      inEllipse++;
      if (inside(x, y)) both++;
    }
  }
  return {
    area,
    hole: area - px.length,
    bbox: [x0, y0, x1, y1],
    lift: beside.length ? median - beside[beside.length >> 1] : 0,
    beside: beside.length / (2 * rows),
    closed: facing ? dark / facing : 0,
    ellipse: both / (area + inEllipse - both),
    holds: at.flatMap(([x, y], i) => (inside(x, y) ? [i] : [])),
  };
}

/**
 * What makes a light region (lightRegions()) a light pool: lighter than the
 * ground beside it at the same distance by a visible step (`lift` 6 luma; the
 * old pools were 15 and 18) and
 *
 *   under the battle  darker ground beside it on a third of its row ends
 *                     (`beside`), holding the wild Pokémon's feet, the
 *                     player's or the ground midway between them: a pool of
 *                     light under or between the battlers, any size or shape
 *                     (a band by distance runs off both sides: 0; the sea's
 *                     water round the battle 7%; the old Route 101's pale
 *                     middle 48%, the old Granite Cave's pool 54%)
 *   an oval           ringed by darker ground, beside it on `ringed` (80%)
 *                     of its row ends and on `closed` (80%) of its outline,
 *                     and filling the ellipse of its moments to `ellipse`
 *                     (0.9): an ellipse, disc or ring of light anywhere, any
 *                     size (a painted ellipse fills 0.98 of it, a square or a
 *                     stripe 0.83; the old cave's beam foot 0.98, the sea's
 *                     most oval light patch 0.82)
 */
export const POOLS = { lift: 6, beside: 1 / 3, ringed: 0.8, closed: 0.8, ellipse: 0.9 };

/**
 * The screen points a battle stands on, lightPools()'s `feet`: the wild
 * Pokémon's feet, the player's, the ground midway between them (`view` is
 * the arena's ArenaView, `player` and `enemy` the battlers' ground points).
 */
export const battleFeet = (view, player, enemy) => [view.screen(enemy.x, 0, enemy.z), view.screen(player.x, 0, player.z), view.screen((player.x + enemy.x) / 2, 0, (player.z + enemy.z) / 2)];
const FEET = ["the wild Pokémon's feet", "the player's", 'the ground between them'];
const where = (r) => `${r.area} px, ${r.bbox[0]},${r.bbox[1]} to ${r.bbox[2]},${r.bbox[3]}`;

/**
 * The light pools on an arena's painted ground (lightRegions()'s arguments):
 * `pools` under the battle and `ovals`, `found`, a line on each, and
 * `figures`, how near the ground comes to one: `under`, the light region
 * under the battle most beside darker ground, and `oval`, the most oval light
 * patch ringed by darker ground.
 */
export function lightPools(ground, feet, backdrop) {
  const lifted = lightRegions(ground, feet, backdrop).filter((r) => r.lift >= POOLS.lift);
  const under = lifted.filter((r) => r.holds.length).sort((a, b) => b.beside - a.beside);
  const ringed = lifted.filter((r) => r.beside >= POOLS.ringed && r.closed >= POOLS.closed).sort((a, b) => b.ellipse - a.ellipse);
  const pools = under.filter((r) => r.beside >= POOLS.beside), ovals = ringed.filter((r) => r.ellipse >= POOLS.ellipse);
  const pct = (v) => `${(v * 100).toFixed(0)}%`;
  const found = [
    ...pools.map((r) => `a pool of light under the battle: +${r.lift} luma over the ground beside it, which is darker on ${pct(r.beside)} of its row ends (>= ${pct(POOLS.beside)}), holding ${r.holds.map((i) => FEET[i]).join(', ')} (${where(r)})`),
    ...ovals.map((r) => `an oval of light: +${r.lift} luma, ringed by darker ground, filling its ellipse ${r.ellipse.toFixed(2)} (>= ${POOLS.ellipse.toFixed(2)}) (${where(r)})`),
  ];
  const figures = [
    under.length ? `the light region under the battle has darker ground beside it on ${pct(under[0].beside)} of its row ends (< ${pct(POOLS.beside)})` : 'no light region under the battle',
    ringed.length ? `the most oval light patch fills its ellipse ${ringed[0].ellipse.toFixed(2)} (< ${POOLS.ellipse.toFixed(2)})` : 'no light patch ringed by darker ground',
  ].join(', ');
  return { pools, ovals, found, figures, under: under[0] ?? null, oval: ringed[0] ?? null };
}

/**
 * Whether the Pokémon are the focus of the battle view: `img` is the
 * rendered screen (RGBA, 240 x 160, the Pokémon standing, no UI), `ids`
 * which of its pixels are a Pokémon (1 and 2, the pipeline's id mask),
 * `mask` the shown pixels (shownMask).
 *
 *   monChroma     the Pokémon's saturated colors: 90th percentile of the
 *                 chroma (max - min of R, G, B) of their pixels
 *   arenaChroma   the arena's most saturated color shown: 99.9th percentile
 *                 of the chroma of the shown pixels that are not a Pokémon
 *   monContrast   the Pokémon's strongest edges: 99th percentile of the local
 *                 contrast of their pixels (the largest luma step to a
 *                 4-neighbor): their outlines
 *   nearContrast  the strongest edges of the arena right around them: 99th
 *                 percentile of the local contrast of the shown pixels 3 to
 *                 16 px from a Pokémon
 */
export function focus(img, ids, mask) {
  const W = 240, H = 160;
  const isMon = (i) => ids[i] === 1 || ids[i] === 2;
  // Chessboard distance to the nearest Pokémon pixel (up to 17).
  const dist = new Uint8Array(W * H).fill(255);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!isMon(y * W + x)) continue;
      for (let dy = -17; dy <= 17; dy++) {
        for (let dx = -17; dx <= 17; dx++) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          if (d < dist[Y * W + X]) dist[Y * W + X] = d;
        }
      }
    }
  }
  const local = (i) => {
    const x = i % W, y = (i - x) / W, l = luma(img, i);
    let m = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < W && Y < H) m = Math.max(m, Math.abs(l - luma(img, Y * W + X)));
    }
    return m;
  };
  const monC = [], monK = [], arenaK = [], nearC = [];
  for (let i = 0; i < W * H; i++) {
    if (isMon(i)) {
      monC.push(local(i));
      monK.push(chroma(img, i));
    } else if (mask[i]) {
      arenaK.push(chroma(img, i));
      if (dist[i] >= 3 && dist[i] <= 16) nearC.push(local(i));
    }
  }
  for (const a of [monC, monK, arenaK, nearC]) a.sort((p, q) => p - q);
  return { monChroma: pct(monK, 0.9), arenaChroma: pct(arenaK, 0.999), monContrast: pct(monC, 0.99), nearContrast: pct(nearC, 0.99) };
}

/**
 * How solid a patch the ground's life may lay: pixels inside it (all four
 * neighbors changed too), about an 8 x 8 patch. A shimmer, a ring or a mote
 * lays none, a wave crest near the horizon a few; the wind bands and cloud
 * shadows that read as ovals of light laid thousands.
 */
export const LIFE_PATCH = 64;

/**
 * The ground's life (src/render3d/arena/ground.ts: grass leaning, waves,
 * glints, ripples; the motes; the props swaying) against the ground at an
 * earlier moment: the most solid patch of changed pixels among `keep` (the
 * shown ground, no Pokémon), `before` and `after` RGBA frames of 240 x 160.
 * A patch of light or shade drifting over the ground (wind bands lifting the
 * grass, cloud shadows) is solid, and reads as a pool or an oval of light;
 * the rest of the life is thin. Returns the patch's interior pixel count,
 * its area and box.
 */
export function lifePatches(before, after, keep) {
  const W = 240, H = 160;
  const changed = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    if (!keep[i]) continue;
    for (let c = 0; c < 3; c++) if (Math.abs(before[i * 4 + c] - after[i * 4 + c]) >= 8) changed[i] = 1;
  }
  const seen = new Uint8Array(W * H);
  let best = { interior: 0, area: 0, bbox: [0, 0, 0, 0] };
  for (let start = 0; start < W * H; start++) {
    if (!changed[start] || seen[start]) continue;
    const stack = [start];
    seen[start] = 1;
    let interior = 0, area = 0;
    const bbox = [W, H, 0, 0];
    while (stack.length) {
      const i = stack.pop();
      const x = i % W, y = (i / W) | 0;
      area++;
      bbox[0] = Math.min(bbox[0], x); bbox[1] = Math.min(bbox[1], y); bbox[2] = Math.max(bbox[2], x); bbox[3] = Math.max(bbox[3], y);
      if (x > 0 && x < W - 1 && y > 0 && y < H - 1 && changed[i - 1] && changed[i + 1] && changed[i - W] && changed[i + W]) interior++;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (changed[j] && !seen[j]) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    if (interior > best.interior) best = { interior, area, bbox };
  }
  return best;
}
