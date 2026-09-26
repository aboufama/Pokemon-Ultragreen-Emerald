// What the resting battle camera sees of a painted arena (the ground with
// its props standing on it; no Pokémon, no ground shader life), and how busy
// that is, for the arena tools (preview.mjs, check.mjs).

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

/**
 * How busy the screen above the text box is: the mean luma step between
 * neighboring pixels (right and down), over rows 0-111 of a 240-wide screen.
 * Calm backdrops (the sea, the desert) measure about 14, the busiest liked
 * arenas about 20: the Pokémon, drawn with strong outlines and full color,
 * must stand out against the place.
 */
export function busyness(img, w = 240, rows = 112) {
  const luma = (i) => 0.299 * img[i] + 0.587 * img[i + 1] + 0.114 * img[i + 2];
  let sum = 0, n = 0;
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const l = luma(i);
      sum += Math.abs(l - luma(i + 4)) + Math.abs(l - luma(i + w * 4));
      n++;
    }
  }
  return sum / n;
}
