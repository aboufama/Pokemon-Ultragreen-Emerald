#!/usr/bin/env node
// Check the built site (tools/game/build_site.mjs) before it is published:
// serve build/site under the repository's path, as GitHub Pages does, and
//
//   - boot the compiled game on the front page, and play a test battle with
//     the remake layer (?manual=1&battle=...): no file missing, no page error,
//     and the frame has the 3D arena and battlers in it;
//   - play the opening as a new player does (platform/tests/opening.json,
//     from power-on through Birch's battle to a wild battle in Route 101's
//     grass): it ends in that wild battle, drawn in 3D;
//   - open a battle in every place of the earlier playtest (battle/,
//     tools/demo/smoke_pages.mjs).
//
//   node tools/game/smoke_site.mjs [--prefix /Pokemon-Ultragreen-Emerald/]

import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { keysFrom } from '../../platform/host/game.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const speciesTable = JSON.parse(await readFile(join(ROOT, 'src/data/generated/species.json'), 'utf8'));
const SITE = join(ROOT, 'build/site');
const argv = process.argv.slice(2);
const prefix = argv.includes('--prefix') ? argv[argv.indexOf('--prefix') + 1] : '/Pokemon-Ultragreen-Emerald/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (!path.startsWith(prefix)) return res.writeHead(404).end();
  let file = normalize(join(SITE, decodeURIComponent(path.slice(prefix.length))));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;

// The battle playtest alone (build_site.mjs --playtest-only): its own smoke test.
if (!existsSync(join(SITE, 'game'))) {
  server.close();
  const s = spawnSync(process.execPath, [join(ROOT, 'tools/demo/smoke_pages.mjs'), '--site', 'build/site', '--prefix', prefix], { cwd: ROOT, stdio: 'inherit' });
  process.exit(s.status ?? 1);
}

const problems = [];
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// The front page as a player opens it: it boots and runs.
{
  const page = await browser.newPage();
  page.on('response', (r) => r.status() >= 400 && problems.push(`game: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`game: ${e.message}`));
  await page.goto(base, { waitUntil: 'load' });
  const booted = await page.waitForFunction(() => document.getElementById('status')?.textContent === '', null, { timeout: 60000 }).then(() => true, () => false);
  if (!booted) problems.push(`game: never started (${await page.textContent('#status')})`);
  await page.waitForTimeout(3000);
  console.log(`${booted ? 'ok  ' : 'FAIL'}  the game boots`);
  await page.close();
}

// A test battle with the remake layer: the 3D arena and battlers are drawn.
{
  const page = await browser.newPage();
  page.on('response', (r) => r.status() >= 400 && problems.push(`battle: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`battle: ${e.message}`));
  await page.goto(`${base}?manual=1&time=2026,1,1,4,10,0,0&battle=BLAZIKEN:50,SWAMPERT:50,GRASS`, { waitUntil: 'load' });
  await page.waitForFunction(() => 'runTo' in (window.__game ?? {}), null, { timeout: 60000 });
  // Run to the move menu (A through the send-out), then read the PPU's pictures.
  for (const [frame, keys] of [[700, 0], [704, 1], [900, 0], [904, 1], [1000, 0]]) await page.evaluate(([n, k]) => window.__game.runTo(n, k), [frame, keys]);
  const drawn = await page.evaluate(() => {
    const g = window.__game.game;
    const view = new DataView(g.memory().buffer);
    const layers = g.exports().PlatformRemakeLayers();
    return { arena: view.getUint32(layers, true) === 1 };
  });
  const ok = drawn.arena;
  if (!ok) problems.push('battle: the remake layer drew no arena');
  console.log(`${ok ? 'ok  ' : 'FAIL'}  a test battle in 3D`);
  await page.close();
}

// The opening, key for key as its script plays it on the GBA ROM: it ends a
// few seconds into a wild battle in Route 101's grass, the arena in 3D.
const openingScript = join(ROOT, 'platform/tests/opening.json');
if (existsSync(openingScript)) {
  const script = JSON.parse(await readFile(openingScript, 'utf8'));
  const info = JSON.parse(await readFile(join(SITE, 'game/remake_state.json'), 'utf8'));
  const page = await browser.newPage();
  page.on('response', (r) => r.status() >= 400 && problems.push(`opening: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`opening: ${e.message}`));
  await page.goto(`${base}?manual=1&time=${script.time.join(',')}`, { waitUntil: 'load' });
  await page.waitForFunction(() => 'runTo' in (window.__game ?? {}), null, { timeout: 60000 });
  await page.evaluate((list) => window.__game.play(list), script.inputs.map(([f, k]) => [f, keysFrom(k)]));
  await page.evaluate((n) => window.__game.runTo(n), script.frames);
  const field = (struct, name) => info.structs[struct].fields[name][0];
  const end = await page.evaluate(([at, battler, species, grass, trainer]) => {
    const g = window.__game.game;
    const view = new DataView(g.memory().buffer);
    const state = g.exports().RemakeState();
    const u32 = (o) => view.getUint32(state + o, true);
    return {
      battle: u32(at.inBattle) === 1 && u32(at.battleScreen) === 1,
      wild: (u32(at.typeFlags) & trainer) === 0,
      grass: grass.includes(u32(at.environment)),
      foe: view.getUint16(state + at.battlers + battler + species, true),
      arena: view.getUint32(g.exports().PlatformRemakeLayers(), true) === 1,
    };
  }, [
    Object.fromEntries(['inBattle', 'battleScreen', 'typeFlags', 'environment', 'battlers'].map((n) => [n, field('RemakeState', n)])),
    info.structs.RemakeBattler.size * info.constants.B_POSITION_OPPONENT_LEFT,
    field('RemakeBattler', 'species'),
    [info.constants.BATTLE_ENVIRONMENT_GRASS, info.constants.BATTLE_ENVIRONMENT_LONG_GRASS],
    info.constants.BATTLE_TYPE_TRAINER,
  ]);
  const foe = Object.values(speciesTable).find((s) => s.id === end.foe)?.slug ?? `species ${end.foe}`;
  const ok = end.battle && end.wild && end.grass && end.arena;
  if (!ok) problems.push(`opening: at frame ${script.frames} ${JSON.stringify({ ...end, foe })}, not a wild battle in the grass drawn in 3D`);
  console.log(`${ok ? 'ok  ' : 'FAIL'}  the opening plays to a wild battle in Route 101's grass (a wild ${foe})`);
  await page.close();
}
await browser.close();
server.close();

// The earlier playtest.
if (existsSync(join(SITE, 'battle'))) {
  const s = spawnSync(process.execPath, [join(ROOT, 'tools/demo/smoke_pages.mjs'), '--site', 'build/site/battle', '--prefix', `${prefix}battle/`], { cwd: ROOT, stdio: 'inherit' });
  if (s.status !== 0) problems.push('battle/: the earlier playtest fails its smoke test');
}

if (problems.length) {
  console.error(`\nthe built site has problems:\n  ${[...new Set(problems)].join('\n  ')}`);
  process.exit(1);
}
console.log('\nthe built site plays');
