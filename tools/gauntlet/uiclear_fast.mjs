#!/usr/bin/env node
// A quicker pass of tools/gauntlet/uiclear.mjs for iterating: the same
// masks, edge and tolerance, but the pixels are counted inside the page and
// the frames sampled every 4 (not 2), both sides in parallel. The gate
// (check.mjs --render) still runs the real one.
//   node tools/gauntlet/uiclear_fast.mjs --species treecko [--clips a,b] [--base URL]
import { chromium } from 'playwright';
import { homeClips, EDGE, TOLERANCE } from './uiclear.mjs';
import { loadProfile } from './species.mjs';
const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
const base = String(args.base ?? 'http://127.0.0.1:5173/');
const slug = String(args.species);
const only = args.clips ? String(args.clips).split(',') : null;
const STEP = Number(args.step ?? 4);
const profile = await loadProfile(slug);
const clips = homeClips(profile, only);

function erode(mask, r) {
  const out = new Array(mask.length).fill(0);
  for (let y = r; y < 160 - r; y++) for (let x = r; x < 240 - r; x++) {
    let inside = true;
    for (let dy = -r; dy <= r && inside; dy++) for (let dx = -r; dx <= r && inside; dx++) inside = !!mask[(y + dy) * 240 + x + dx];
    out[y * 240 + x] = inside ? 1 : 0;
  }
  return out;
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
async function side(s) {
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  const q = new URLSearchParams({ mode: 'clipreview', species: slug, enemy: slug, attacker: s, clip: 'idle', poseRate: '0' });
  await page.goto(`${base}?${q}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 240000 });
  const masks = await page.evaluate(() => ({ foe: window.__clip.boxMask('enemy'), ours: window.__clip.boxMask('player') }));
  await page.evaluate((m) => { window.__masks = m; }, { foe: erode(masks.foe, EDGE), ours: erode(masks.ours, EDGE) });
  const id = s === 'player' ? 1 : 2;
  await page.evaluate(() => window.__clip.start());
  const rows = [];
  for (const clip of clips) {
    if (clip !== 'idle') await page.evaluate((c) => window.__clip.play(c), clip);
    const frames = clip === 'idle' ? 180 : Math.ceil(profile.clips[clip].duration * 60) + 12;
    const boxes = s === 'enemy' && clip === 'intro' ? ['foe'] : ['foe', 'ours'];
    const worst = { foe: 0, ours: 0, foeF: 0, oursF: 0 };
    for (let f = 0; f < frames; f += STEP) {
      const c = await page.evaluate(async ({ n, id }) => {
        await window.__clip.step(n);
        const ids = window.__clip.ids();
        let foe = 0, ours = 0;
        for (let i = 0; i < ids.length; i++) {
          if (ids[i] !== id) continue;
          if (window.__masks.foe[i]) foe++;
          if (window.__masks.ours[i]) ours++;
        }
        return { foe, ours };
      }, { n: STEP, id });
      for (const b of boxes) if (c[b] > worst[b]) { worst[b] = c[b]; worst[`${b}F`] = f + STEP; }
    }
    const ok = worst.foe <= TOLERANCE && worst.ours <= TOLERANCE;
    rows.push(`${ok ? ' ok ' : 'FAIL'}  ${slug.padEnd(9)} ${s.padEnd(6)} ${clip.padEnd(18)} foe's box ${String(worst.foe).padStart(4)} px (f${worst.foeF})   our box ${String(worst.ours).padStart(4)} px (f${worst.oursF})`);
    console.log(rows.at(-1));
  }
  await page.close();
  return rows;
}
const all = (await Promise.all(['player', 'enemy'].map(side))).flat();
await browser.close();
const failed = all.filter((r) => r.startsWith('FAIL'));
console.log(`\n${slug}: ${failed.length} failing`);
for (const r of failed) console.log(r);
