#!/usr/bin/env node
// Run the sprite calibration for a species headlessly and store the results.
//
//   node tools/calibrate/run.mjs --species blaziken [--fitCamera] [--base http://127.0.0.1:5173/] [--dry]
//
// Writes src/pokemon/<slug>/calibration.json (species fit), and with
// --fitCamera also src/data/battle_camera.json (global battle camera).
// A report screenshot goes to reference/calibration/<slug>.png.

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null).filter(Boolean));
const slug = args.species ?? 'blaziken';
const base = args.base ?? 'http://127.0.0.1:5173/';
const fitCamera = !!args.fitCamera;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1456, height: 490 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const extra = args.init ? `&${args.init}` : '';
await page.goto(`${base}?mode=calibrate&species=${slug}${fitCamera ? '&fitCamera=1' : ''}${extra}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
console.log('initial', await page.evaluate(() => window.calibrate.initial));
const phase = args.phase ?? 'geometry';
let result;
if (phase === 'color') {
  const color = await page.evaluate(() => window.calibrate.runColor());
  console.log(JSON.stringify(color));
  result = { calibration: { grade: color.grade, colorFit: { loss: color.loss } } };
} else {
  result = await page.evaluate(() => window.calibrate.run());
}
if (phase !== 'color') console.log(JSON.stringify(result, null, 2));
await mkdir(resolve(ROOT, 'reference/calibration'), { recursive: true });
await page.screenshot({ path: resolve(ROOT, `reference/calibration/${slug}.png`) });
await browser.close();

if (!args.dry) {
  const calPath = resolve(ROOT, `src/pokemon/${slug}/calibration.json`);
  const prev = JSON.parse(await readFile(calPath, 'utf8'));
  await writeFile(calPath, JSON.stringify({ ...prev, ...result.calibration }, null, 2) + '\n');
  console.log(`wrote ${calPath}`);
  if (fitCamera && phase !== 'color') {
    const camPath = resolve(ROOT, 'src/data/battle_camera.json');
    await writeFile(camPath, JSON.stringify(result.camera, null, 2) + '\n');
    console.log(`wrote ${camPath}`);
  }
}
