#!/usr/bin/env node
// Build the published site (GitHub Pages; tools/demo/deploy_pages.mjs
// publishes it):
//
//   node tools/game/build_site.mjs [--no-demo | --playtest-only]
//
//   build/site/            the front page: the compiled Emerald with its remake
//                          layer (game.html, src/game/main.ts)
//     game.js, assets/     its bundle (and the files Vite emitted for it)
//     game/                the game itself: pokeemerald.wasm and
//                          remake_state.json (node platform/build.mjs makes them)
//     assets/pokemon/<slug>/, assets/gba/pokemon/<slug>/
//                          the 3D Pokémon the remake layer draws: every species
//                          with a 3D profile (src/pokemon/registry.ts)
//     assets/gba/menu/, assets/gba/fonts/, assets/sound/
//                          the page's own menus (its start screen, the demo
//                          battles' setup): their graphics, fonts, music and
//                          sounds
//     libs/draco/          the models' decoder
//     battle/              the earlier battle playtest (tools/demo/build_demo.mjs),
//                          as it was (left out with --no-demo)
//
// With --playtest-only the site is the battle playtest alone, at the root, as
// it was published before the compiled game (until the game's opening plays).
//
// tools/game/smoke_site.mjs checks the result before it is published.

import { spawnSync } from 'node:child_process';
import { cp, copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = join(ROOT, 'build/site');
const argv = process.argv.slice(2);

if (argv.includes('--playtest-only')) {
  const demo = spawnSync(process.execPath, [join(ROOT, 'tools/demo/build_demo.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (demo.status !== 0) process.exit(demo.status ?? 1);
  await rm(SITE, { recursive: true, force: true });
  await cp(join(ROOT, 'build/demo/pages'), SITE, { recursive: true });
  console.log('site: build/site (the battle playtest alone)');
  process.exit(0);
}

for (const f of ['public/game/pokeemerald.wasm', 'public/game/remake_state.json']) {
  if (!existsSync(join(ROOT, f))) {
    console.error(`${f} is missing: build the game first (node platform/build.mjs)`);
    process.exit(1);
  }
}

// 1. The page's bundle.
const vite = spawnSync('npx', ['vite', 'build', '--config', 'vite.game.config.ts'], { cwd: ROOT, stdio: 'inherit' });
if (vite.status !== 0) process.exit(vite.status ?? 1);

// 2. The site.
await rm(SITE, { recursive: true, force: true });
await mkdir(SITE, { recursive: true });
await copyFile(join(ROOT, 'build/game-dist/game.html'), join(SITE, 'index.html'));
await copyFile(join(ROOT, 'build/game-dist/game.js'), join(SITE, 'game.js'));
await cp(join(ROOT, 'build/game-dist/assets'), join(SITE, 'assets'), { recursive: true });
await cp(join(ROOT, 'public/game'), join(SITE, 'game'), { recursive: true });
await cp(join(ROOT, 'public/libs/draco'), join(SITE, 'libs/draco'), { recursive: true });
for (const f of ['manifest.webmanifest', 'icon-192.png', 'icon-512.png']) await copyFile(join(ROOT, 'public', f), join(SITE, f));
const registry = await readFile(join(ROOT, 'src/pokemon/registry.ts'), 'utf8');
const species = [...registry.matchAll(/^\s+(\w+): async \(\) =>/gm)].map((m) => m[1]);
for (const slug of species) {
  await cp(join(ROOT, 'public/assets/pokemon', slug), join(SITE, 'assets/pokemon', slug), { recursive: true });
  await cp(join(ROOT, 'public/assets/gba/pokemon', slug), join(SITE, 'assets/gba/pokemon', slug), { recursive: true });
}
for (const dir of ['gba/menu', 'gba/fonts', 'sound']) await cp(join(ROOT, 'public/assets', dir), join(SITE, 'assets', dir), { recursive: true });
// No Jekyll on GitHub Pages: serve the files as they are.
await writeFile(join(SITE, '.nojekyll'), '');

// 3. The earlier battle playtest, under battle/.
if (!argv.includes('--no-demo')) {
  const demo = spawnSync(process.execPath, [join(ROOT, 'tools/demo/build_demo.mjs')], { cwd: ROOT, stdio: 'inherit' });
  if (demo.status !== 0) process.exit(demo.status ?? 1);
  await cp(join(ROOT, 'build/demo/pages'), join(SITE, 'battle'), { recursive: true, filter: (src) => !src.endsWith('.nojekyll') });
}

const { size } = await stat(join(SITE, 'game/pokeemerald.wasm'));
console.log(`site: build/site (the game ${(size / 1048576).toFixed(1)} MB; 3D species: ${species.join(', ')}${argv.includes('--no-demo') ? '' : '; the battle playtest in battle/'})`);
