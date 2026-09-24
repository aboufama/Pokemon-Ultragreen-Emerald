#!/usr/bin/env node
// Film a battle frame-by-frame (deterministic manual stepping) and save the
// composited 240x160 screen (3D view + GBA layer), plus a contact sheet.
//
//   node tools/shots/battle_film.mjs --query "autoplay=1&seed=7&loop=0" \
//        --every 10 --until 700 --out build/film/intro [--cols 8] [--scale 1]
//   node tools/shots/battle_film.mjs --frames 150,230,480 ...
//   --presses "620:RIGHT,640:DOWN,660:A"   scripted buttons (pressed on that frame)
//
// Needs the dev server (npm run dev) at --base (default http://127.0.0.1:5173/).

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const base = args.base ?? 'http://127.0.0.1:5173/';
const query = `manual=1&${args.query ?? 'autoplay=1&seed=1&loop=0'}`;
const outDir = resolve(args.out ?? 'build/film/battle');
const cols = Number(args.cols ?? 8);
let frames;
if (args.frames) frames = String(args.frames).split(',').map(Number);
else {
  const every = Number(args.every ?? 10), until = Number(args.until ?? 600), from = Number(args.from ?? 0);
  frames = [];
  for (let f = from; f <= until; f += every) frames.push(f);
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 960, height: 700 }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(`${base}?${query}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
await mkdir(outDir, { recursive: true });

const grab = () => page.evaluate(() => {
  const s = window.__battle.scene.screen;
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 160;
  const ctx = c.getContext('2d');
  ctx.drawImage(s.canvas3d, 0, 0, 240, 160);
  ctx.drawImage(s.canvas2d, 0, 0);
  return c.toDataURL('image/png');
});

const presses = String(args.presses ?? '').split(',').filter(Boolean).map((p) => {
  const [f, b] = p.split(':');
  return { f: Number(f), b: b.trim().toUpperCase() };
});
const stepTo = async (f, current) => {
  // Stop at every scripted press on the way; a press is seen on the next frame.
  for (const p of presses) {
    if (p.f <= current || p.f > f) continue;
    await page.evaluate((n) => window.__battle.step(n), p.f - 1 - current);
    await page.evaluate((b) => window.__battle.scene.input.press(b), p.b);
    current = p.f - 1;
  }
  if (f > current) await page.evaluate((n) => window.__battle.step(n), f - current);
};

let current = 0;
const shots = [];
for (const f of frames) {
  await stepTo(f, current);
  current = Math.max(current, f);
  const url = await grab();
  const state = await page.evaluate(() => window.__battle.state());
  const file = `${outDir}/f${String(f).padStart(5, '0')}.png`;
  await writeFile(file, Buffer.from(url.split(',')[1], 'base64'));
  shots.push({ f, url, state });
  console.log(`frame ${f}: ${JSON.stringify(state)}`);
  if (state.error) break;
}

// Contact sheet, rendered in the page.
const sheet = await page.evaluate(async ({ shots, cols }) => {
  const W = 240, H = 160, pad = 4, label = 12;
  const rows = Math.ceil(shots.length / cols);
  const c = document.createElement('canvas');
  c.width = cols * (W + pad);
  c.height = rows * (H + label + pad);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#16161e';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = '10px monospace';
  for (let i = 0; i < shots.length; i++) {
    const img = new Image();
    img.src = shots[i].url;
    await img.decode();
    const x = (i % cols) * (W + pad), y = Math.floor(i / cols) * (H + label + pad);
    ctx.drawImage(img, x, y);
    ctx.fillStyle = '#ccc';
    ctx.fillText(`${shots[i].f} ${shots[i].state.phase}`, x + 2, y + H + 10);
  }
  return c.toDataURL('image/png');
}, { shots: shots.map(({ f, url, state }) => ({ f, url, state })), cols });
await writeFile(`${outDir}/sheet.png`, Buffer.from(sheet.split(',')[1], 'base64'));
console.log(`sheet ${outDir}/sheet.png`);
if (logs.length) console.log(logs.slice(-30).join('\n'));
await browser.close();
