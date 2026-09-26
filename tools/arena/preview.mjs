#!/usr/bin/env node
// Paint arenas in node and save what the resting battle camera sees of them
// (the painted ground with the props standing on it, no Pokémon, no ground
// shader life), in a second, for designing an arena without the browser:
//
//   node tools/arena/preview.mjs [arena,arena|all] [--wide] [--boxes] [--scale 3] [--out build/arenas]
//
//   --wide    the whole painted area (three screens wide: the intro slide; the
//             camera shake's margins above and below)
//   --boxes   outline the battlers' boxes (props never enter them) and dim what
//             the healthboxes and the text box cover
//
// Writes <out>/<arena>.paint.png (and .wide.png). Judge the result in the
// browser too (/?mode=stage&env=<arena>): the ground's life, the Pokémon and
// their shadows are only there.

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { importTs } from '../gauntlet/tsimport.mjs';
import { ROOT } from '../gauntlet/species.mjs';

const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);
const scale = Number(opt('scale', 3));
const out = join(ROOT, opt('out', 'build/arenas'));

const { ARENAS, paintArena, battlerBox, propRect, BATTLE_CAMERA, groundPointAt, makeBattleCamera } = await importTs('tools/arena/entry.ts');
const camera = makeBattleCamera(BATTLE_CAMERA);
const player = groundPointAt(camera, ...BATTLE_CAMERA.anchors.player);
const enemy = groundPointAt(camera, ...BATTLE_CAMERA.anchors.enemy);
const first = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'all';
const names = first === 'all' ? Object.keys(ARENAS) : first.split(',');
await mkdir(out, { recursive: true });

/** The screen at rest: ground, then the props farthest first (a prop's rows below its ground point sink into the ground). */
function compose(ctx, x0, y0, w, h) {
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

function overlay(ctx, img, x0, y0, w, h) {
  const dim = (x, y) => {
    if (x < x0 || y < y0 || x >= x0 + w || y >= y0 + h) return;
    const i = ((y - y0) * w + (x - x0)) * 4;
    for (let k = 0; k < 3; k++) img[i + k] = img[i + k] * 0.45 + 20;
  };
  // Healthboxes and the text box (src/battle/ui).
  for (const [ax, ay, bw, bh] of [[12, 14, 100, 30], [126, 72, 104, 37], [0, 112, 240, 48]]) for (let y = ay; y < ay + bh; y++) for (let x = ax; x < ax + bw; x++) dim(x, y);
  for (const who of ['player', 'enemy']) {
    const b = battlerBox(ctx, who).map(Math.round);
    for (let x = b[0]; x <= b[2]; x++) for (const y of [b[1], b[3]]) if (x >= x0 && x < x0 + w && y >= y0 && y < y0 + h) img.set([255, 0, 255, 255], ((y - y0) * w + (x - x0)) * 4);
    for (let y = b[1]; y <= b[3]; y++) for (const x of [b[0], b[2]]) if (x >= x0 && x < x0 + w && y >= y0 && y < y0 + h) img.set([255, 0, 255, 255], ((y - y0) * w + (x - x0)) * 4);
  }
}

async function save(img, w, h, path) {
  await sharp(Buffer.from(img.buffer), { raw: { width: w, height: h, channels: 4 } })
    .resize(w * scale, h * scale, { kernel: 'nearest' })
    .png()
    .toFile(path);
}

for (const name of names) {
  const t0 = performance.now();
  const { ctx } = paintArena(name, camera, player, enemy);
  const ms = performance.now() - t0;
  const screen = compose(ctx, 0, 0, 240, 160);
  if (flag('boxes')) overlay(ctx, screen, 0, 0, 240, 160);
  await save(screen, 240, 160, join(out, `${name}.paint.png`));
  if (flag('wide')) {
    const g = ctx.ground;
    const wide = compose(ctx, g.ox, g.oy, g.width, g.height);
    if (flag('boxes')) overlay(ctx, wide, g.ox, g.oy, g.width, g.height);
    await save(wide, g.width, g.height, join(out, `${name}.wide.png`));
  }
  console.log(`${name.padEnd(11)} ${ms.toFixed(0).padStart(4)} ms  ${ctx.props.length} props  -> ${join(out, name)}.paint.png`);
}
