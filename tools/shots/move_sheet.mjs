#!/usr/bin/env node
// Contact sheets of moves in the battle view, for quick checks while
// authoring clips and effects: one row per move, frames every --every
// engine frames. Needs the dev server.
//
//   node tools/shots/move_sheet.mjs --moves FLAMETHROWER,EMBER --attacker enemy \
//        [--species blaziken] [--enemy blaziken] [--every 6] [--frames 16] [--density 1] \
//        [--crop x,y,w,h] --out build/sheets/blaziken.png
//
// Prints page errors; exits non-zero if any move throws.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const base = args.base ?? 'http://127.0.0.1:5173/';
const moves = String(args.moves ?? '').split(',').filter(Boolean);
const clips = String(args.clips ?? '').split(',').filter(Boolean);
const every = Number(args.every ?? 6);
const frames = Number(args.frames ?? 16);
const density = Number(args.density ?? 1);
const crop = args.crop ? String(args.crop).split(',').map(Number) : [0, 0, 240, 160];
const out = resolve(args.out ?? 'build/sheets/moves.png');
const q = { species: args.species ?? 'blaziken', enemy: args.enemy ?? args.species ?? 'blaziken', attacker: args.attacker ?? 'enemy', density: String(density), ui: args.ui ?? '0' };

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
let errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const rows = [];
let failed = 0;
for (const item of [...moves.map((m) => ({ move: m })), ...clips.map((c) => ({ clip: c }))]) {
  errors = [];
  const params = new URLSearchParams({ mode: 'clipreview', ...q, ...item });
  await page.goto(`${base}?${params}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
  const info = await page.evaluate(() => ({ clip: window.__clip.info.clip, label: window.__clip.label }));
  await page.evaluate(() => window.__clip.start());
  const shots = [];
  for (let i = 0; i < frames; i++) {
    await page.evaluate((f) => window.__clip.step(f), every);
    shots.push(await page.evaluate(() => window.__clip.grab()));
  }
  const name = item.move ?? item.clip;
  console.log(`${name.padEnd(16)} -> ${info.clip}${errors.length ? `  ERRORS: ${errors.join(' | ')}` : ''}`);
  if (errors.length) failed++;
  rows.push({ name: `${name} (${info.clip})`, shots });
}
const sheet = await page.evaluate(async ({ rows, crop, density, every }) => {
  const [cx, cy, cw, ch] = crop.map((v) => v * density);
  const label = 14, pad = 3;
  const cols = rows[0].shots.length;
  const c = document.createElement('canvas');
  c.width = cols * (cw + pad) + pad;
  c.height = rows.length * (ch + label + pad) + pad;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#15151c';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.imageSmoothingEnabled = false;
  ctx.font = '11px monospace';
  for (let r = 0; r < rows.length; r++) {
    const y = pad + r * (ch + label + pad);
    ctx.fillStyle = '#ddd';
    ctx.fillText(`${rows[r].name}  (every ${every} frames)`, pad, y + 11);
    for (let i = 0; i < rows[r].shots.length; i++) {
      const img = new Image();
      img.src = rows[r].shots[i];
      await img.decode();
      ctx.drawImage(img, cx, cy, cw, ch, pad + i * (cw + pad), y + label, cw, ch);
    }
  }
  return c.toDataURL('image/png');
}, { rows, crop, density, every });
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(sheet.split(',')[1], 'base64'));
console.log(`sheet ${out}`);
await browser.close();
process.exit(failed ? 1 : 0);
