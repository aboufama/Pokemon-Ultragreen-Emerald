#!/usr/bin/env node
// Fetch a pre-rigged Pokémon model from the Pokemon-3D-api/assets repository
// and record its provenance next to it.
//
//   node tools/models/fetch_model.mjs --dex 257 --slug blaziken [--variants regular,shiny]
//
// Output: public/assets/pokemon/<slug>/model.glb (+ model.<variant>.glb) and SOURCE.json.
// The upstream repo prunes its history, so we record the sha256 of each file
// instead of relying on a pinned commit URL.

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const UPSTREAM = 'https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[++i];
  }
  return args;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const args = parseArgs(process.argv.slice(2));
if (!args.dex || !args.slug) {
  console.error('usage: fetch_model.mjs --dex <national dex no> --slug <species slug> [--variants regular,shiny]');
  process.exit(1);
}

const variants = String(args.variants ?? 'regular,shiny').split(',');
const outDir = join(ROOT, 'public/assets/pokemon', args.slug);
await mkdir(outDir, { recursive: true });

const files = [];
for (const variant of variants) {
  const url = `${UPSTREAM}/${variant}/${args.dex}.glb`;
  try {
    const buf = await download(url);
    const name = variant === 'regular' ? 'model.glb' : `model.${variant}.glb`;
    await writeFile(join(outDir, name), buf);
    const sha256 = createHash('sha256').update(buf).digest('hex');
    files.push({ file: name, variant, url, bytes: buf.length, sha256 });
    console.log(`fetched ${variant} -> ${join('public/assets/pokemon', args.slug, name)} (${buf.length} bytes)`);
  } catch (err) {
    console.warn(`skipped ${variant}: ${err.message}`);
  }
}

if (files.length === 0) {
  console.error('no model variants could be fetched');
  process.exit(1);
}

const source = {
  dex: Number(args.dex),
  slug: args.slug,
  upstream: 'https://github.com/Pokemon-3D-api/assets',
  fetchedAt: new Date().toISOString(),
  license: 'Model assets are property of Nintendo / Creatures Inc. / GAME FREAK inc. (per upstream README).',
  files,
};
await writeFile(join(outDir, 'SOURCE.json'), JSON.stringify(source, null, 2) + '\n');
