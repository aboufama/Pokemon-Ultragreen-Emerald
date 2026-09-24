// Import a TypeScript module of the app from a node tool: bundle it with
// esbuild (JSON imports included, three.js resolved from node_modules) into a
// temporary .mjs and import that.

import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function importTs(path) {
  const dir = await mkdtemp(join(tmpdir(), 'gauntlet-'));
  const out = join(dir, 'module.mjs');
  await build({
    entryPoints: [resolve(ROOT, path)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: out,
    logLevel: 'error',
    // Vite-only globals some modules read.
    define: { 'import.meta.env.BASE_URL': '"/"', 'import.meta.env.DEV': 'false' },
  });
  try {
    return await import(pathToFileURL(out).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
