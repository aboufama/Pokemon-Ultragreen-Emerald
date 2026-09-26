#!/usr/bin/env node
// Check the built GitHub Pages site before it is published: serve
// build/demo/pages under the repository's path, as GitHub does, open a battle
// in every place (?go=1&env=<place>) and fail on any file the site asks for
// and doesn't have, or any page error. The Pages build copies a chosen set of
// assets (tools/demo/build_demo.mjs); this catches one the app needs that the
// set leaves out.
//
//   node tools/demo/smoke_pages.mjs [--prefix /Pokemon-Ultragreen-Emerald/]

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { importTs } from '../gauntlet/tsimport.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = join(ROOT, 'build/demo/pages');
const argv = process.argv.slice(2);
const prefix = argv.includes('--prefix') ? argv[argv.indexOf('--prefix') + 1] : '/Pokemon-Ultragreen-Emerald/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (!path.startsWith(prefix)) {
    res.writeHead(404).end();
    return;
  }
  let file = normalize(join(SITE, decodeURIComponent(path.slice(prefix.length))));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;

const { ARENAS } = await importTs('src/render3d/arena/arenas.ts');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
for (const place of Object.keys(ARENAS)) {
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  page.on('response', (r) => r.status() >= 400 && problems.push(`${place}: ${r.status()} ${r.url().replace(base, '')}`));
  page.on('pageerror', (e) => problems.push(`${place}: ${e.message}`));
  await page.goto(`${base}?go=1&env=${place}`, { waitUntil: 'load' });
  // The arena, its entry layer and both Pokémon load before the intro starts.
  const ok = await page.waitForFunction(() => window.__battle?.state().phase === 'intro', null, { timeout: 120000 }).then(() => true, () => false);
  if (!ok) problems.push(`${place}: the battle never reached its intro`);
  await page.waitForTimeout(1500);
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${place}`);
  await page.close();
}
await browser.close();
server.close();
if (problems.length) {
  console.error(`\nthe built site is missing something:\n  ${[...new Set(problems)].join('\n  ')}`);
  process.exit(1);
}
console.log('\nthe built site plays in every place');
