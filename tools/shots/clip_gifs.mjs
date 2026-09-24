#!/usr/bin/env node
// Export a species' battle clips as looping GIFs from both sides, with the
// in-game UI, for review (the move categories use a representative move so
// the effects and the target's reaction show too).
//
//   node tools/shots/clip_gifs.mjs [--species blaziken] [--out build/clips] [--scale 2] [--only intro,faint]
//                                  [--sides player,enemy] [--density 3]
//
// Writes <out>/<side>_<clip>.gif and <out>/manifest.json. Needs the dev server
// (npm run dev) and Pillow (tools/requirements.txt).

import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

export const JOBS = [
  { name: 'idle', clip: 'idle', seconds: 2.4 },
  { name: 'intro', clip: 'intro' },
  { name: 'physical_weak', move: 'SLASH' },
  { name: 'physical_weak_kick', move: 'DOUBLE_KICK' },
  { name: 'physical_strong', move: 'BLAZE_KICK' },
  { name: 'special_weak', move: 'EMBER' },
  { name: 'special_strong', move: 'FLAMETHROWER' },
  { name: 'status_self', move: 'BULK_UP' },
  { name: 'status_target', move: 'GROWL' },
  { name: 'status_target_kick', move: 'SAND_ATTACK' },
  { name: 'hit', clip: 'hit' },
  { name: 'faint', clip: 'faint' },
];

const args = parseArgs(process.argv.slice(2));
const species = args.species ?? 'blaziken';
const base = args.base ?? 'http://127.0.0.1:5173/';
const out = resolve(args.out ?? join(ROOT, 'build/clips'));
const scale = Number(args.scale ?? 2);
const only = args.only ? String(args.only).split(',') : null;
const sides = args.sides ? String(args.sides).split(',') : ['player', 'enemy'];
const density = args.density ? { density: String(args.density) } : {};
const FPS = 30;
const LEAD = 0.35; // seconds of idle before the clip starts
const TAIL = 0.6; // seconds after it ends (return to idle)

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await mkdir(out, { recursive: true });

const manifest = [];
for (const job of JOBS.filter((j) => !only || only.includes(j.name))) {
  for (const side of sides) {
    const q = new URLSearchParams({ mode: 'clipreview', species, attacker: side, ...density, ...(job.move ? { move: job.move } : { clip: job.clip }) });
    await page.goto(`${base}?${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 120000 });
    const dir = join(out, 'frames', `${side}_${job.name}`);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    let n = 0;
    const grab = async () => {
      const url = await page.evaluate(() => window.__clip.grab());
      await writeFile(join(dir, `${String(n++).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
    };
    const step = (frames) => page.evaluate((f) => window.__clip.step(f), frames);
    const perGrab = 60 / FPS;
    for (let i = 0; i < LEAD * FPS; i++) {
      await grab();
      await step(perGrab);
    }
    await page.evaluate(() => window.__clip.start());
    if (job.seconds) {
      for (let i = 0; i < job.seconds * FPS; i++) {
        await grab();
        await step(perGrab);
      }
    } else {
      for (let i = 0; i < 20 * FPS && !(await page.evaluate(() => window.__clip.done)); i++) {
        await grab();
        await step(perGrab);
      }
      for (let i = 0; i < TAIL * FPS; i++) {
        await grab();
        await step(perGrab);
      }
    }
    const info = await page.evaluate(() => ({ label: window.__clip.label, ...window.__clip.info }));
    const gif = join(out, `${side}_${job.name}.gif`);
    const r = spawnSync('python3', [join(ROOT, 'tools/shots/make_gif.py'), dir, gif, '--scale', String(scale), '--fps', String(FPS)], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr);
    console.log(r.stdout.trim());
    manifest.push({ name: job.name, side, move: job.move ?? null, file: `${side}_${job.name}.gif`, frames: n, ...info });
  }
}
await writeFile(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await browser.close();
console.log(`wrote ${manifest.length} clips to ${out}`);
