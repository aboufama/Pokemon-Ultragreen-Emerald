#!/usr/bin/env node
// Contact sheets like tools/shots/move_sheet.mjs, but the battle view loads
// once per side and every item plays in place after the last (clipreview's
// play() for clips, perform() for moves, which runs the move as the battle
// does, effects and the foe's reaction included): many clips in the time
// move_sheet takes for one. One image per item, both sides stacked (the
// enemy side's row, then ours), each row split into two lines of frames.
//
//   node tools/shots/fastsheet.mjs --species grovyle --items move:LEER,clip:dodge [--enemy swampert] [--every 6] [--frames 14] [--base http://127.0.0.1:5173/] --out dir
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
const base = String(args.base ?? 'http://127.0.0.1:5173/');
const species = String(args.species);
const enemy = String(args.enemy ?? species);
const items = String(args.items).split(',').filter(Boolean).map((s) => { const [kind, name] = s.split(':'); return { kind, name }; });
const every = Number(args.every ?? 6);
const frames = Number(args.frames ?? 14);
const outDir = String(args.out);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function side(attacker) {
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const q = new URLSearchParams({ mode: 'clipreview', species, enemy, attacker, clip: 'idle', density: '1', ui: '0' });
  await page.goto(`${base}?${q}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 240000 });
  await page.evaluate(() => window.__clip.start());
  await page.evaluate(() => window.__clip.step(20));
  const rows = [];
  for (const it of items) {
    await page.evaluate(({ kind, name }) => (kind === 'move' ? window.__clip.perform(name) : window.__clip.play(name)), it);
    const shots = [];
    for (let i = 0; i < frames; i++) {
      await page.evaluate((f) => window.__clip.step(f), every);
      shots.push(await page.evaluate(() => window.__clip.grab()));
    }
    // Let it finish and settle before the next item.
    for (let n = 0; n < 40 && !(await page.evaluate(() => window.__clip.done)); n++) await page.evaluate(() => window.__clip.step(6));
    await page.evaluate(() => window.__clip.step(30));
    rows.push({ name: `${it.name} (${attacker} attacks)`, shots });
  }
  await page.close();
  return { rows, errors };
}

const sides = [];
sides.push(...(await Promise.all(['enemy', 'player'].map((s) => side(s)))));
for (const s of sides) if (s.errors.length) console.log('page errors:', s.errors.join(' | '));

// Compose: per item, the enemy row then the player row, each row as two lines of frames.
const page = await browser.newPage();
for (let i = 0; i < items.length; i++) {
  const data = await page.evaluate(async ({ rows, frames }) => {
    const W = 240, H = 160, pad = 3, label = 14, half = Math.ceil(frames / 2);
    const c = document.createElement('canvas');
    c.width = pad + half * (W + pad);
    c.height = rows.length * (label + 2 * (H + pad));
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#15151c';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = '11px monospace';
    let y = 0;
    for (const r of rows) {
      ctx.fillStyle = '#ddd';
      ctx.fillText(r.name, pad, y + 11);
      y += label;
      for (let f = 0; f < r.shots.length; f++) {
        const img = new Image();
        img.src = r.shots[f];
        await img.decode();
        const line = f < half ? 0 : 1, col = f % half;
        ctx.drawImage(img, pad + col * (W + pad), y + line * (H + pad), W, H);
      }
      y += 2 * (H + pad);
    }
    return c.toDataURL('image/png');
  }, { rows: [sides[0].rows[i], sides[1].rows[i]], frames });
  const file = `${outDir}/${species}-${items[i].name.toLowerCase()}.png`;
  await writeFile(file, Buffer.from(data.split(',')[1], 'base64'));
  console.log('wrote', file);
}
await browser.close();
