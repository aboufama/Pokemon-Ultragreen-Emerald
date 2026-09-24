#!/usr/bin/env node
// Compare stance candidates by how well each fits the stock sprites: runs the
// calibration fit (without writing anything) for several named poses of a
// species in one browser, prints a table against the gates, and saves each
// overlap report.
//
//   node tools/calibrate/candidates.mjs --species <slug> --poses stance,c1,c2 [--quick]
//        [--base http://127.0.0.1:5173/] [--init "yawLimit=60&height=1.2"] [--out build/calibrate]
//
// Candidates are extra named poses in the profile (poses.c1 = {...stance,
// bones: {...}}). Keep the winner as `stance`, delete the others, then store
// its fit with tools/calibrate/run.mjs. --quick searches fewer yaw starts
// (about 5x faster) for a first pass; confirm the finalists without it.
// Report colors: green = model and sprite, red = sprite only, blue = model only.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
}
if (!args.species || !args.poses) {
  console.error('usage: candidates.mjs --species <slug> --poses stance,c1,c2 [--quick] [--base URL] [--init "k=v&..."] [--out dir]');
  process.exit(2);
}
const slug = String(args.species);
const poses = String(args.poses).split(',').map((s) => s.trim()).filter(Boolean);
const base = String(args.base ?? 'http://127.0.0.1:5173/');
const outDir = resolve(ROOT, String(args.out ?? 'build/calibrate'));
const extra = [args.quick ? 'starts=-15,15' : '', args.init ? String(args.init) : ''].filter(Boolean).join('&');
// Same thresholds as tools/gauntlet/check.mjs.
const MIN_IOU = 0.55;
const MIN_BOX_IOU = 0.75;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1456, height: 490 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

const rows = [];
for (const pose of poses) {
  await page.goto(`${base}?mode=calibrate&species=${slug}&pose=${encodeURIComponent(pose)}${extra ? `&${extra}` : ''}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const r = await page.evaluate(() => window.calibrate.run());
  const c = r.calibration;
  const shot = join(outDir, `${slug}-${pose}.png`);
  await page.screenshot({ path: shot });
  const f = c.fit;
  const pass = ['enemy', 'player'].every((s) => f[s].iou >= MIN_IOU && f[s].boxIou >= MIN_BOX_IOU);
  const row = { pose, height: c.height, yaw: [c.slots.enemy.yaw, c.slots.player.yaw], fit: f, score: f.enemy.iou + f.player.iou + 0.5 * (f.enemy.boxIou + f.player.boxIou), pass, seconds: r.seconds, shot };
  rows.push(row);
  console.log(`${pose}: height ${row.height}, yaw enemy ${row.yaw[0]} / player ${row.yaw[1]}, enemy IoU ${f.enemy.iou} box ${f.enemy.boxIou}, player IoU ${f.player.iou} box ${f.player.boxIou}, ${pass ? 'passes' : 'fails'} (${row.seconds} s)`);
}
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad('pose', 14)}${pad('height', 8)}${pad('yaw e/p', 16)}${pad('enemy IoU/box', 16)}${pad('player IoU/box', 16)}${pad('score', 7)}gates`);
const best = rows.reduce((a, b) => ((b.pass && !a.pass) || (b.pass === a.pass && b.score > a.score) ? b : a), rows[0]);
for (const r of rows) {
  console.log(`${pad(r.pose + (r === best ? ' *' : ''), 14)}${pad(r.height.toFixed(3), 8)}${pad(`${r.yaw[0].toFixed(1)} / ${r.yaw[1].toFixed(1)}`, 16)}${pad(`${r.fit.enemy.iou.toFixed(2)} / ${r.fit.enemy.boxIou.toFixed(2)}`, 16)}${pad(`${r.fit.player.iou.toFixed(2)} / ${r.fit.player.boxIou.toFixed(2)}`, 16)}${pad(r.score.toFixed(2), 7)}${r.pass ? 'pass' : 'FAIL'}`);
}
console.log(`\nbest: ${best.pose}${args.quick ? ' (quick search: confirm without --quick)' : ''}. Reports: ${relative(ROOT, outDir)}/${slug}-<pose>.png (left: battle view, right: overlap)`);
