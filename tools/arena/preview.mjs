#!/usr/bin/env node
// Paint arenas in node and save what the resting battle camera sees of them
// (the painted ground with the props standing on it, no Pokémon, no ground
// shader life), in a second, for designing an arena without the browser:
//
//   node tools/arena/preview.mjs [arena,arena|all] [--wide] [--boxes] [--scale 3] [--out build/arenas]
//
//   --wide    the whole painted area (the screen and the camera shake's margins)
//   --boxes   outline the battlers' boxes (props never enter them) and dim what
//             the healthboxes and the text box cover
//
// Writes <out>/<arena>.paint.png (and .wide.png), and prints how calm it is
// where the battle shows it (the measures check.mjs holds against the sea's;
// see the arena skill). Judge the result in the browser too
// (/?mode=stage&env=<arena>): the ground's life, the Pokémon and their
// shadows are only there.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { importTs } from '../gauntlet/tsimport.mjs';
import { calm, compose as composeWith, propsShowing, shownMask } from './screen.mjs';
import { ROOT } from '../gauntlet/species.mjs';

const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);
const scale = Number(opt('scale', 3));
const out = join(ROOT, opt('out', 'build/arenas'));

const { ARENAS, paintArena, battlerBox, propRect, BATTLE_CAMERA, groundPointAt, makeBattleCamera } = await importTs('tools/arena/entry.ts');
const compose = (ctx, x0, y0, w, h) => composeWith(ctx, propRect, x0, y0, w, h);
const camera = makeBattleCamera(BATTLE_CAMERA);
const player = groundPointAt(camera, ...BATTLE_CAMERA.anchors.player);
const enemy = groundPointAt(camera, ...BATTLE_CAMERA.anchors.enemy);
const first = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'all';
const names = first === 'all' ? Object.keys(ARENAS) : first.split(',');
await mkdir(out, { recursive: true });

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

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

/** Write RGBA pixels as a PNG, each pixel `scale` x `scale` (nearest neighbor). */
async function save(img, w, h, path) {
  const W = w * scale, H = h * scale;
  const raw = Buffer.alloc(H * (W * 4 + 1));
  for (let y = 0; y < H; y++) {
    const row = y * (W * 4 + 1);
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / scale) * w + Math.floor(x / scale)) * 4;
      raw[row + 1 + x * 4] = img[i];
      raw[row + 2 + x * 4] = img[i + 1];
      raw[row + 3 + x * 4] = img[i + 2];
      raw[row + 4 + x * 4] = img[i + 3];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(W, 0);
  header.writeUInt32BE(H, 4);
  header.set([8, 6, 0, 0, 0], 8);
  await writeFile(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
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
  const mask = shownMask(battlerBox(ctx, 'player'));
  const c = calm(compose(ctx, 0, 0, 240, 160), mask, battlerBox(ctx, 'enemy'));
  const figures = `busy ${c.busy.toFixed(1)}  strong ${c.strong.toFixed(1)}%  specks ${c.specks.toFixed(1)}  marks ${c.marks.toFixed(1)}  open ${c.open.toFixed(0)}%  foe ${c.foe.toFixed(1)}  props ${propsShowing(ctx, propRect, mask)}`;
  console.log(`${name.padEnd(11)} ${ms.toFixed(0).padStart(4)} ms  ${figures}  -> ${join(out, name)}.paint.png`);
}
