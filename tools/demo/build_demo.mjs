#!/usr/bin/env node
// Build the standalone, playable battle demo into build/demo/:
//
//   node tools/demo/build_demo.mjs [--base http://127.0.0.1:5173/]
//
//   build/demo/index.html   page content with the whole app inlined as one
//                           module script and every asset embedded: a single
//                           self-contained file (for hosts that allow nothing else)
//   build/demo/page.html    the same wrapped in a full HTML document
//   build/demo/site/        the same as three files: index.html (tiny), app.js
//                           (the bundle) and data.js (models and assets), for
//                           hosts that take a page with a couple of scripts
//   build/demo/assets/...   exactly the files a battle requests (also embedded)
//
// The asset list is recorded from a real battle on the dev server (npm run
// dev), so it stays in sync with the code, plus what the in-page picker can
// ask for: every species with a 3D profile (model and palette) and every
// arena. Models are decoded from Draco and embedded in the page as base64
// (window.__EMBEDDED_MODELS__): the demo needs no WebAssembly decoder, and
// hosts that don't serve .glb files still work.

import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'build/demo');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]] : null)).filter(Boolean));
const base = args.base ?? 'http://127.0.0.1:5173/';

// 1. Bundle.
const vite = spawnSync('npx', ['vite', 'build', '--config', 'vite.demo.config.ts'], { cwd: ROOT, stdio: 'inherit' });
if (vite.status !== 0) process.exit(vite.status ?? 1);
const bundle = await readFile(join(ROOT, 'build/demo-dist/demo.js'), 'utf8');

// 2. Record the assets a battle loads (startup preloads every effect sheet;
//    the intro and a few turns cover the rest).
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
const assets = new Set();
page.on('request', (r) => {
  const path = new URL(r.url()).pathname;
  if (path.startsWith('/assets/')) assets.add(decodeURIComponent(path.slice(1)));
});
await page.goto(`${base}?manual=1&autoplay=1&seed=1&loop=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
await page.evaluate(() => window.__battle.step(1500));
await browser.close();
if (!assets.size) throw new Error('no assets recorded: is the dev server running?');

// Everything the picker can switch to.
const registry = await readFile(join(ROOT, 'src/pokemon/registry.ts'), 'utf8');
const species = [...registry.matchAll(/^\s+(\w+): async \(\) =>/gm)].map((m) => m[1]);
for (const slug of species) {
  assets.add(`assets/pokemon/${slug}/model.glb`);
  assets.add(`assets/gba/pokemon/${slug}/palette.json`);
}
for (const f of await readdir(join(ROOT, 'public/assets/gba/battle_env'))) if (f.endsWith('.png')) assets.add(`assets/gba/battle_env/${f}`);

// 3. Copy the files; decode models and keep them for embedding.
await rm(OUT, { recursive: true, force: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
let bytes = 0;
const models = {};
const files = [];
for (const rel of [...assets].sort()) {
  const src = join(ROOT, 'public', rel);
  if (rel.endsWith('.glb')) {
    const doc = await io.read(src);
    for (const ext of doc.getRoot().listExtensionsUsed()) if (ext.extensionName === 'KHR_draco_mesh_compression') ext.dispose();
    models[rel.replace(/^assets\//, '')] = Buffer.from(await io.writeBinary(doc)).toString('base64');
    continue;
  }
  const dst = join(OUT, rel);
  await mkdir(dirname(dst), { recursive: true });
  await copyFile(src, dst);
  bytes += (await stat(dst)).size;
  files.push(rel);
}

// Every other file goes in the page too, as a data: URL (window.__EMBEDDED_ASSETS__),
// so index.html is a single self-contained file; assets/ is kept for reference.
const MIME = { png: 'image/png', json: 'application/json' };
const embedded = {};
for (const rel of files) {
  const type = MIME[rel.split('.').pop()] ?? 'application/octet-stream';
  embedded[rel.replace(/^assets\//, '')] = `data:${type};base64,${(await readFile(join(OUT, rel))).toString('base64')}`;
}

// 4. Page: the app inlined as one module script (escape closing tags).
const script = bundle.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const content = `<title>Ultragreen Emerald Battle</title>
<style>
  :root { color-scheme: dark; }
  html, body { height: 100%; }
  body { margin: 0; background: #101018; color: #d9d8e6; }
</style>
<div id="app"></div>
<script>window.__EMBEDDED_MODELS__ = ${JSON.stringify(models)};
window.__EMBEDDED_ASSETS__ = ${JSON.stringify(embedded)};</script>
<script type="module">
${script}
</script>
`;
await writeFile(join(OUT, 'index.html'), content);
await writeFile(join(OUT, 'page.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head>
<body>
${content}</body></html>
`);
await writeFile(join(OUT, 'assets.json'), JSON.stringify(files, null, 2) + '\n');
await mkdir(join(OUT, 'site'), { recursive: true });
await writeFile(join(OUT, 'site/data.js'), `window.__EMBEDDED_MODELS__ = ${JSON.stringify(models)};\nwindow.__EMBEDDED_ASSETS__ = ${JSON.stringify(embedded)};\n`);
await writeFile(join(OUT, 'site/app.js'), bundle);
await writeFile(join(OUT, 'site/index.html'), content.replace(/<script>window\.__EMBEDDED_MODELS__[\s\S]*$/, '<script src="data.js"></script>\n<script type="module" src="app.js"></script>\n'));
console.log(`demo: ${files.length} files (${(bytes / 1024).toFixed(0)} KB), ${Object.keys(models).length} embedded model(s), page ${(content.length / 1024).toFixed(0)} KB -> ${OUT}`);
