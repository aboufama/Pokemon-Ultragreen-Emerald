// What the resting battle camera sees of a painted arena (the ground with
// its props standing on it; no Pokémon, no ground shader life), which of it
// a battle shows (not under the text box, the healthboxes or the player's
// Pokémon), and how calm that is, for the arena tools (preview.mjs,
// check.mjs).

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
