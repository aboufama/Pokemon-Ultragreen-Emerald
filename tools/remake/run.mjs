#!/usr/bin/env node
// Run the compiled game with its remake layer (the game page in Chromium,
// frame by frame) on an input script, frames saved as PNG: the browser's
// counterpart of platform/tools/run.mjs, for what only the browser draws
// (the 3D battles).
//
//   node tools/remake/run.mjs --script platform/tests/battle.json --out build/remake/battle [--base http://127.0.0.1:5173/]
//
// The script is platform/tools/run.mjs's ({ "frames", "inputs": [[frame,
// "A+START"], ...], "shots", "every", "time" }) with "battle": a test battle
// to start as soon as the game can ("BLAZIKEN:50,SWAMPERT:50,GRASS", see
// src/game/main.ts), and "hold": true (or --hold) to have moves' animations
// wait for the 3D attackers as the page does. Frames are the GBA's (the Nth ends at the Nth VBlank);
// keys named at a frame are held from that frame on, set at the VBlank before
// it as the headless runner does, so a script plays the same in both. The run
// starts from a blank save on the script's clock, so it is the same every
// time. Needs the dev server (npx vite) and the compiled game
// (node platform/build.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { keysFrom } from '../../platform/host/game.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const script = JSON.parse(fs.readFileSync(opt('--script'), 'utf8'));
const out = opt('--out', path.join(ROOT, 'build/remake', path.basename(opt('--script'), '.json')));
const base = opt('--base', 'http://127.0.0.1:5173/');
fs.mkdirSync(out, { recursive: true });

const query = new URLSearchParams({ manual: '1' });
if (script.time) query.set('time', script.time.join(','));
if (script.battle) query.set('battle', script.battle);
// "hold": moves' animations wait for the 3D attackers, as on the page (off: as the ROM plays).
if (script.hold || args.includes('--hold')) query.set('hold', '1');

// The page presses the keys at their VBlanks; the run stops at each shot.
const inputs = (script.inputs ?? []).map(([f, k]) => [f, keysFrom(k)]);
const shots = new Set(script.shots ?? []);
if (script.every) for (let f = script.every; f <= script.frames; f += script.every) shots.add(f);
const stops = [...new Set([...shots, script.frames])].filter((f) => f >= 1 && f <= script.frames).sort((a, b) => a - b);

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(new URL(`game.html?${query}`, base).href);
await page.waitForFunction(() => 'runTo' in (window.__game ?? {}), null, { timeout: 60000 });

const t0 = performance.now();
await page.evaluate((list) => window.__game.play(list), inputs);
for (const stop of stops) {
  await page.evaluate((n) => window.__game.runTo(n), stop);
  if (shots.has(stop)) {
    const png = await page.evaluate(() => window.__game.png());
    fs.writeFileSync(path.join(out, `f${String(stop).padStart(5, '0')}.png`), Buffer.from(png.split(',')[1], 'base64'));
  }
}
await browser.close();
const errors = logs.filter((l) => /^(error|pageerror)/.test(l));
console.log(`${script.frames} frames in ${((performance.now() - t0) / 1000).toFixed(1)} s; ${shots.size} shots in ${path.relative(ROOT, out)}${errors.length ? `; ${errors.length} errors:\n${errors.slice(0, 10).join('\n')}` : ''}`);
process.exit(errors.length ? 1 : 0);
