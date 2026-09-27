#!/usr/bin/env node
// Check the built site (tools/game/build_site.mjs) before it is published:
// serve build/site under the repository's path, as GitHub Pages does, and
//
//   - open the front page on its start screen and choose PLAY THE GAME: the
//     compiled game boots and runs, and H holds it under the HACKS menu;
//   - open HACKS from the start screen: a change is kept;
//   - choose DEMO BATTLES: set a battle up in its menus (Treecko against a
//     wild Wurmple in the grass), battle it in the game drawn in 3D, run from
//     it, and get the question of another battle;
//   - play a test battle with the remake layer (?manual=1&battle=...): the
//     frame has the 3D arena and battlers in it;
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
// The game's struct layouts and constants (platform/build.mjs), to read its memory by name.
const info = JSON.parse(await readFile(join(SITE, 'game/remake_state.json'), 'utf8'));
const field = (struct, name) => info.structs[struct].fields[name][0];
// The arena's picture is the first background picture (src/remake/layer.ts).
const arenaActive = field('RemakeLayers', 'backgrounds') + field('RemakeBackground', 'active');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

/** The front page on its start screen (a new player's: nothing saved), and its keys. */
async function frontPage(name) {
  const page = await browser.newPage();
  page.on('response', (r) => r.status() >= 400 && problems.push(`${name}: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`${name}: ${e.message}`));
  await page.goto(base, { waitUntil: 'load' });
  const step = () => page.evaluate(() => window.__page?.step() ?? '');
  const started = await page.waitForFunction(() => window.__page?.step() === 'start' && document.getElementById('status')?.textContent === '', null, { timeout: 90000 }).then(() => true, () => false);
  if (!started) problems.push(`${name}: no start screen (${await page.textContent('#status').catch(() => '')})`);
  // It takes the keys once it has faded in, as the game's main menu does.
  await page.waitForTimeout(1500);
  /** A key pressed as a player does, then time for the screen to answer. */
  const press = async (key, wait = 300) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(90);
    await page.keyboard.up(key);
    await page.waitForTimeout(wait);
  };
  /** Wait for the page to reach a screen; false if it doesn't in time. */
  const reach = async (want, timeout = 60000) => {
    const t = Date.now();
    while ((await step()) !== want) {
      if (Date.now() - t > timeout) return false;
      await page.waitForTimeout(200);
    }
    return true;
  };
  return { page, started, step, press, reach };
}

/** The game's picture layers: whether the arena is drawn in 3D. */
const arenaDrawn = (page) => page.evaluate((at) => {
  const g = window.__page.game();
  return new DataView(g.memory().buffer).getUint32(g.exports().PlatformRemakeLayers() + at, true) === 1;
}, arenaActive);

// PLAY THE GAME: the compiled game boots and runs.
{
  const { page, started, press } = await frontPage('game');
  let ok = false;
  if (started) {
    await press('KeyX', 1500);
    // The start screen shows while the game downloads: it may still be coming.
    await page.waitForFunction(() => window.__page.step() === 'game' && window.__page.game(), null, { timeout: 90000 }).catch(() => undefined);
    const at = await page.evaluate(() => window.__page.game()?.vblanks() ?? 0);
    await page.waitForTimeout(3000);
    const later = await page.evaluate(() => window.__page.game()?.vblanks() ?? 0);
    ok = (await page.evaluate(() => window.__page.step())) === 'game' && later > at + 30;
    if (!ok) problems.push(`game: PLAY THE GAME didn't run the game (VBlank ${at} then ${later})`);
    // H: the HACKS menu over the game, held meanwhile; B back to it.
    await press('KeyH', 1500);
    const held = await page.evaluate(() => [window.__page.step(), window.__page.game().vblanks()]);
    await page.waitForTimeout(1000);
    const stillHeld = await page.evaluate(() => window.__page.game().vblanks()) === held[1];
    await press('KeyZ', 1500);
    const back = await page.evaluate(() => window.__page.step());
    const hacks = held[0] === 'hacks' && stillHeld && back === 'game';
    if (!hacks) problems.push(`game: H didn't hold the game under the HACKS menu (${held[0]}, held ${stillHeld}, then ${back})`);
    ok &&= hacks;
  }
  console.log(`${ok ? 'ok  ' : 'FAIL'}  the start screen, the game boots from PLAY THE GAME, and H holds it under the HACKS menu`);
  await page.close();
}

// HACKS from the start screen: EXP x2, kept in the browser.
{
  const { page, started, press, step } = await frontPage('hacks');
  let ok = false;
  if (started) {
    await press('ArrowDown');
    await press('ArrowDown');
    await press('KeyX', 1200);
    const open = (await step()) === 'hacks';
    await press('ArrowDown');
    await press('ArrowRight');
    await press('KeyZ', 1200);
    const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('ultragreen.hacks.v1') ?? '{}').exp);
    ok = open && kept === 2 && (await step()) === 'start';
    if (!ok) problems.push(`hacks: the menu ${open ? 'opened' : "didn't open"}; EXP kept as ${kept}; back at ${await step()}`);
  }
  console.log(`${ok ? 'ok  ' : 'FAIL'}  the HACKS menu keeps a change`);
  await page.close();
}

// DEMO BATTLES: the setup in the page's menus, the battle in the game in 3D,
// run from it, and the question of another.
{
  const { page, started, press, reach, step } = await frontPage('demo');
  const fail = async (what) => problems.push(`demo: ${what} (at ${await step()})`);
  let ok = false;
  if (started) {
    await press('ArrowDown');
    await press('KeyX', 1000);
    // Your Pokémon: the first in the list (Treecko), YES.
    if (!(await reach('you'))) await fail('no choice of your POKéMON');
    await page.waitForTimeout(2500);
    await press('KeyX', 1500);
    await press('KeyX', 1000);
    // The wild one: Wurmple, the last in the list (slower than Treecko, so running always works), YES.
    if (!(await reach('foe'))) await fail('no choice of the wild POKéMON');
    await page.waitForTimeout(2500);
    for (let i = 0; i < 8; i++) await press('ArrowDown', 120);
    await press('KeyX', 1500);
    await press('KeyX', 1000);
    // The moves as they are: DONE.
    if (!(await reach('moves'))) await fail('no moves screen');
    await page.waitForTimeout(1000);
    for (let i = 0; i < 5; i++) await press('ArrowDown', 120);
    await press('KeyX', 1000);
    // The place: Route 101's grass.
    if (!(await reach('place'))) await fail('no choice of the place');
    await page.waitForTimeout(3000);
    await press('KeyX', 300);
    if (!(await reach('battle', 120000))) await fail('the battle never started');
    // The battle in the game: its arena in 3D; then RUN, over and over
    // until it takes: RIGHT and DOWN put the action menu's cursor on RUN
    // from anywhere and A chooses it, or they do nothing and A moves the
    // battle's text on. The battle gets a minute of the game's time (the
    // browser here draws the 3D in software: the game runs slower than on a
    // phone), and ten of the clock's at most.
    let arena = false;
    const t = Date.now();
    while (!arena && Date.now() - t < 180000) {
      await page.waitForTimeout(500);
      arena = await arenaDrawn(page);
    }
    if (!arena) await fail('the battle has no 3D arena');
    const vblanks = () => page.evaluate(() => window.__page.game().vblanks());
    const from = await vblanks();
    while ((await step()) === 'battle' && (await vblanks()) - from < 3600 && Date.now() - t < 600000) {
      await press('ArrowRight', 150);
      await press('ArrowDown', 150);
      await press('KeyX', 1200);
    }
    const after = await reach('after', 60000);
    if (!after) await fail(`running from the battle never ended it (${(await vblanks()) - from} of the game's frames, ${Math.round((Date.now() - t) / 1000)} s)`);
    ok = arena && after;
  }
  console.log(`${ok ? 'ok  ' : 'FAIL'}  demo battles: the setup, a battle in 3D in the game, and another offered`);
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
  const drawn = await page.evaluate((at) => {
    const g = window.__game.game;
    const view = new DataView(g.memory().buffer);
    return { arena: view.getUint32(g.exports().PlatformRemakeLayers() + at, true) === 1 };
  }, arenaActive);
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
  const page = await browser.newPage();
  page.on('response', (r) => r.status() >= 400 && problems.push(`opening: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`opening: ${e.message}`));
  await page.goto(`${base}?manual=1&time=${script.time.join(',')}`, { waitUntil: 'load' });
  await page.waitForFunction(() => 'runTo' in (window.__game ?? {}), null, { timeout: 60000 });
  await page.evaluate((list) => window.__game.play(list), script.inputs.map(([f, k]) => [f, keysFrom(k)]));
  await page.evaluate((n) => window.__game.runTo(n), script.frames);
  const end = await page.evaluate(([at, battler, species, grass, trainer, arenaAt]) => {
    const g = window.__game.game;
    const view = new DataView(g.memory().buffer);
    const state = g.exports().RemakeState();
    const u32 = (o) => view.getUint32(state + o, true);
    return {
      battle: u32(at.inBattle) === 1 && u32(at.battleScreen) === 1,
      wild: (u32(at.typeFlags) & trainer) === 0,
      grass: grass.includes(u32(at.environment)),
      foe: view.getUint16(state + at.battlers + battler + species, true),
      arena: view.getUint32(g.exports().PlatformRemakeLayers() + arenaAt, true) === 1,
    };
  }, [
    Object.fromEntries(['inBattle', 'battleScreen', 'typeFlags', 'environment', 'battlers'].map((n) => [n, field('RemakeState', n)])),
    info.structs.RemakeBattler.size * info.constants.B_POSITION_OPPONENT_LEFT,
    field('RemakeBattler', 'species'),
    [info.constants.BATTLE_ENVIRONMENT_GRASS, info.constants.BATTLE_ENVIRONMENT_LONG_GRASS],
    info.constants.BATTLE_TYPE_TRAINER,
    arenaActive,
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
