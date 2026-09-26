#!/usr/bin/env node
// Checks for the battle arenas (src/render3d/arena), the rules every arena
// keeps (see .claude/skills/pokemon-arena/SKILL.md):
//
//   node tools/arena/check.mjs              paint every arena in node and check it
//   node tools/arena/check.mjs --render     + each arena in the browser, battlers and
//                                           UI up, screenshots in build/arenas/ (needs npm run dev)
//
//   - every arena is a named Hoenn place, and the playtest lists them all;
//   - arenas are painted, never Emerald's battle backgrounds projected (no
//     platforms under the Pokémon);
//   - the whole screen is painted (no holes), with a pixel-art palette;
//   - nothing standing in an arena covers a battler;
//   - an arena always paints the same (seeded) and quickly (it paints when a
//     battle loads, on phones too);
//   - every place is as calm as the open sea (Route 124, the benchmark) where
//     the battle shows it, within a stated margin: the Pokémon are the focus.
// Exits non-zero if any check fails.

import { readFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { importTs } from '../gauntlet/tsimport.mjs';
import { ROOT } from '../gauntlet/species.mjs';
import { calm, compose, propsShowing, shownMask } from './screen.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean));
const results = [];
const gate = (name, ok, detail = '') => results.push({ level: ok ? 'pass' : 'FAIL', name, detail });
const warn = (name, detail) => results.push({ level: 'warn', name, detail });

/** Distinct colors an arena may show on screen (Emerald's battle backgrounds use a few 16-color palettes). */
const MAX_COLORS = 96;
/** Painting time budget in node (ms); phones are a few times slower. */
const MAX_PAINT_MS = 700;

/**
 * Calm, measured on what a battle shows of an arena at rest (above the text
 * box, outside the healthboxes and the player's Pokémon: screen.mjs calm()).
 * The open sea (Route 124) is the benchmark: every limit is the sea's own
 * value with the margin stated here, so the sea passes by construction and
 * no other place may be busier. Most measures get 10%; scattered marks 30%
 * (land keeps small things the open sea has none of: pebbles, flowers,
 * ripples in rows); open ground is a floor, at most 10% less than the sea's.
 */
const BENCHMARK = 'water';
const CALM = [
  { key: 'busy', label: 'busy', margin: 0.1 },
  { key: 'strong', label: 'strong edges', margin: 0.1, unit: '%' },
  { key: 'specks', label: 'specks/1k', margin: 0.1 },
  { key: 'marks', label: 'marks/1k', margin: 0.3 },
  { key: 'foe', label: 'behind the wild Pokémon', margin: 0.1 },
  { key: 'open', label: 'open ground', margin: -0.1, unit: '%' },
];
/** Props that show (24+ pixels): the sea shows none, and props frame only the edges, so at most 3. */
const MAX_PROPS_SHOWING = 3;

const app = await importTs('tools/arena/entry.ts');
const { ARENAS, paintArena, battlerBox, propRect, BATTLE_CAMERA, groundPointAt, makeBattleCamera } = app;
const camera = makeBattleCamera(BATTLE_CAMERA);
const player = groundPointAt(camera, ...BATTLE_CAMERA.anchors.player);
const enemy = groundPointAt(camera, ...BATTLE_CAMERA.anchors.enemy);

// Every arena is a Hoenn place the menus can list (the playtest's places and
// the battle page's picker are built from the registry).
for (const [id, d] of Object.entries(ARENAS)) gate(`${id}: names its place`, /^[A-Z0-9 .é']+$/.test(d.name ?? '') && (d.about ?? '').length > 8 && (d.about ?? '').length <= 64, `${d.name}: ${d.about}`);
const playtest = await readFile(join(ROOT, 'src/demo/playtest.ts'), 'utf8');
gate('the playtest lists every arena', /PLACES[^=]*=\s*Object\.entries\(ARENAS\)/.test(playtest));

// No projected Emerald backgrounds anywhere in the app. The one Emerald layer
// allowed is the intro's entry layer (battle_env/<place>_entry.png), which
// sweeps over the arena for a moment as battle_intro.c's BG1 does.
const offenders = [];
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, e.name);
    if (e.isDirectory()) await walk(path);
    else if (/\.(ts|js)$/.test(e.name)) {
      const lines = (await readFile(path, 'utf8')).split('\n').filter((l) => /battle_env\//.test(l) && !/battle_env\/[^'"`\s]*_entry\.png/.test(l));
      if (lines.length) offenders.push(path.slice(ROOT.length + 1));
    }
  }
};
await walk(join(ROOT, 'src'));
gate('arenas are painted, not Emerald backgrounds projected (entry layers aside)', offenders.length === 0, offenders.join(', '));

/** How calm an arena is where the battle shows it, and how many props show. */
const measure = (ctx) => {
  const mask = shownMask(battlerBox(ctx, 'player'));
  return { ...calm(compose(ctx, propRect, 0, 0, 240, 160), mask, battlerBox(ctx, 'enemy')), props: propsShowing(ctx, propRect, mask) };
};
const sea = measure(paintArena(BENCHMARK, camera, player, enemy).ctx);
const limits = Object.fromEntries(CALM.map((m) => [m.key, sea[m.key] * (1 + m.margin)]));

for (const name of Object.keys(ARENAS)) {
  const t0 = performance.now();
  const { ctx } = paintArena(name, camera, player, enemy);
  const ms = performance.now() - t0;
  const again = paintArena(name, camera, player, enemy);
  const g = ctx.ground;
  // The screen above the text box (and a margin for the camera shake).
  let holes = 0;
  const colors = new Set();
  for (let sy = -4; sy < 112; sy++) {
    for (let sx = -4; sx < 244; sx++) {
      const i = ((sy - g.oy) * g.width + (sx - g.ox)) * 4;
      if (g.data[i + 3] === 0) holes++;
      else colors.add((g.data[i] << 16) | (g.data[i + 1] << 8) | g.data[i + 2]);
    }
  }
  for (const p of ctx.props) {
    const s = p.sprite;
    for (let k = 0; k < s.data.length; k += 4) if (s.data[k + 3]) colors.add((s.data[k] << 16) | (s.data[k + 1] << 8) | s.data[k + 2]);
  }
  gate(`${name}: the whole screen is painted`, holes === 0, holes ? `${holes} unpainted pixels` : '');
  gate(`${name}: pixel-art palette`, colors.size <= MAX_COLORS, `${colors.size} colors (max ${MAX_COLORS})`);
  gate(`${name}: paints the same every time`, Buffer.compare(Buffer.from(g.data), Buffer.from(again.ctx.ground.data)) === 0 && ctx.props.length === again.ctx.props.length);
  (ms > MAX_PAINT_MS ? gate : (n, ok, d) => (ms > MAX_PAINT_MS / 2 ? warn(n, d) : gate(n, true, d)))(`${name}: paints quickly`, ms <= MAX_PAINT_MS, `${ms.toFixed(0)} ms`);
  // Props: where each one lands on screen (as ArenaProp places it) against the battlers' boxes.
  const covering = [];
  for (const p of ctx.props) {
    const rect = propRect(ctx.view, p);
    for (const who of ['player', 'enemy']) {
      const b = battlerBox(ctx, who);
      if (rect[0] < b[2] && rect[2] > b[0] && rect[1] < b[3] && rect[3] > b[1]) covering.push(`${who}: prop at ${rect.map((v) => Math.round(v)).join(',')}`);
    }
  }
  gate(`${name}: nothing stands over a battler`, covering.length === 0, covering.slice(0, 3).join('; ') || `${ctx.props.length} props`);
  // As calm as the sea where the battle shows it: each measure against its limit (the sea's value and its margin).
  const m = measure(ctx);
  const over = [];
  const shown = CALM.map((c) => {
    const least = c.margin < 0;
    const ok = least ? m[c.key] >= limits[c.key] : m[c.key] <= limits[c.key];
    const text = `${c.label} ${m[c.key].toFixed(1)}${c.unit ?? ''} ${least ? '>=' : '<='} ${limits[c.key].toFixed(1)}${c.unit ?? ''}`;
    if (!ok) over.push(text);
    return text;
  });
  if (m.props > MAX_PROPS_SHOWING) over.push(`props showing ${m.props} <= ${MAX_PROPS_SHOWING}`);
  shown.push(`props showing ${m.props} <= ${MAX_PROPS_SHOWING}`);
  gate(`${name}: as calm as the sea`, over.length === 0, over.length ? `over: ${over.join('; ')}` : shown.join(', '));
}

if (args.render) {
  const { chromium } = await import('playwright');
  const base = typeof args.base === 'string' ? args.base : 'http://127.0.0.1:5173/';
  const out = join(ROOT, 'build/arenas');
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 480 } });
  for (const name of Object.keys(ARENAS)) {
    const errors = [];
    const onError = (e) => errors.push(String(e.message ?? e));
    const onConsole = (m) => m.type() === 'error' && errors.push(m.text());
    page.on('pageerror', onError);
    page.on('console', onConsole);
    await page.goto(`${base}?mode=stage&env=${name}&player=blaziken&enemy=swampert&scale=3`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
    await page.screenshot({ path: join(out, `${name}.png`), clip: { x: 0, y: 0, width: 720, height: 480 } });
    page.off('pageerror', onError);
    page.off('console', onConsole);
    gate(`${name}: renders in a battle`, errors.length === 0, errors.slice(0, 2).join(' | ') || `build/arenas/${name}.png`);
  }
  await browser.close();
}

let failed = 0;
for (const r of results) {
  if (r.level === 'FAIL') failed++;
  console.log(`${r.level.padEnd(4)}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall arena checks pass');
process.exit(failed ? 1 : 0);
