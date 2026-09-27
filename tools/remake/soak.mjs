#!/usr/bin/env node
// Battle after battle with the remake layer: the game page's test battle
// (a level 100 Pokémon against a level 5 one, so each ends in a turn) starts
// over each time it ends, A pressed now and then, for a stretch of frames.
// Fails on a page error, a battle that stops starting over, or memory that
// keeps growing (3D bodies and pictures not freed between battles).
//
//   node tools/remake/soak.mjs [--frames 12000] [--battle BLAZIKEN:100,SWAMPERT:5,GRASS] [--base http://127.0.0.1:5173/]
//
// Needs the dev server (npx vite) and the compiled game (node platform/build.mjs).

import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const frames = Number(opt('--frames', 12000));
const battle = opt('--battle', 'BLAZIKEN:100,SWAMPERT:5,GRASS');
const base = opt('--base', 'http://127.0.0.1:5173/');

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--enable-precise-memory-info'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error' || (m.type() === 'warning' && !/GL Driver|GPU stall/.test(m.text()))) errors.push(`${m.type()}: ${m.text()}`);
});
await page.goto(new URL(`game.html?manual=1&time=2026,1,1,4,10,0,0&battle=${battle}`, base).href);
await page.waitForFunction(() => 'runTo' in (window.__game ?? {}), null, { timeout: 60000 });
const info = await page.evaluate(() => fetch('game/remake_state.json').then((r) => r.json()));
const at = (struct, field) => info.structs[struct].fields[field][0];
const foeHp = at('RemakeState', 'battlers') + info.structs.RemakeBattler.size + at('RemakeBattler', 'hp');

let battles = 0;
let lastHp = -1;
const heaps = [];
for (let f = 30; f <= frames; f += 30) {
  await page.evaluate(([n]) => window.__game.runTo(n - 4, 0), [f]);
  await page.evaluate(([n]) => window.__game.runTo(n, 1), [f]);
  const s = await page.evaluate((hpAt) => {
    const g = window.__game.game;
    const st = g.exports().RemakeState();
    return { hp: new DataView(g.memory().buffer).getUint16(st + hpAt, true), heap: performance.memory?.usedJSHeapSize ?? 0 };
  }, foeHp);
  // A new battle: the foe's HP back up after it fainted.
  if (s.hp > 0 && lastHp === 0) battles++;
  lastHp = s.hp;
  if (f % 1500 === 0) {
    heaps.push(s.heap);
    console.log(`frame ${f}: ${battles} battles over, heap ${(s.heap / 1048576).toFixed(1)} MB`);
  }
}
await browser.close();

const problems = [...new Set(errors)];
if (battles < Math.floor(frames / 3000)) problems.push(`only ${battles} battles in ${frames} frames: the test battle stopped starting over`);
// Memory: the second half's heap no more than 25% above the first half's.
const half = Math.floor(heaps.length / 2);
const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
if (heaps.length >= 4 && heaps[0] > 0 && mean(heaps.slice(half)) > 1.25 * mean(heaps.slice(0, half))) problems.push(`the heap keeps growing (${(mean(heaps.slice(0, half)) / 1048576).toFixed(0)} MB, then ${(mean(heaps.slice(half)) / 1048576).toFixed(0)} MB)`);
if (problems.length) {
  console.error(`\nsoak failed:\n  ${problems.slice(0, 10).join('\n  ')}`);
  process.exit(1);
}
console.log(`\n${battles} battles, no errors, memory steady`);
