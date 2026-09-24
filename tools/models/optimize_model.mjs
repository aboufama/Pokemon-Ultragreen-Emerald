#!/usr/bin/env node
// Slim a fetched model for battle use, in place, and record it in SOURCE.json:
// strip the upstream animation clips (battles use our own clips), drop unused
// data and re-encode the geometry with Draco.
//
//   node tools/models/optimize_model.mjs --slug feraligatr [--drop lod1,lod2,lod3]
//
//   --drop   also remove nodes whose name contains one of these fragments
//            (their meshes go with them), e.g. extra LOD meshes

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.slug) {
  console.error('usage: optimize_model.mjs --slug <species> [--drop fragment,fragment]');
  process.exit(1);
}
const dir = join(ROOT, 'public/assets/pokemon', String(args.slug));
const file = join(dir, 'model.glb');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const before = (await stat(file)).size;
const doc = await io.read(file);
const root = doc.getRoot();

const animations = root.listAnimations().length;
for (const a of root.listAnimations()) {
  // Samplers hold the keyframe accessors; dispose them too so prune drops the data.
  for (const c of a.listChannels()) c.dispose();
  for (const s of a.listSamplers()) s.dispose();
  a.dispose();
}
const drop = args.drop ? String(args.drop).split(',') : [];
let dropped = 0;
for (const n of root.listNodes()) {
  if (drop.some((d) => n.getName().includes(d))) {
    n.getMesh()?.dispose();
    n.dispose();
    dropped++;
  }
}
await doc.transform(prune({ keepLeaves: true }), dedup(), draco({ method: 'edgebreaker', quantizePosition: 14 }));
const out = await io.writeBinary(doc);
await writeFile(file, out);

const sourcePath = join(dir, 'SOURCE.json');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const entry = source.files.find((f) => f.file === 'model.glb');
source.optimized = {
  tool: 'tools/models/optimize_model.mjs',
  removedAnimations: animations,
  droppedNodes: dropped,
  bytesBefore: entry?.bytes ?? before,
  bytes: out.byteLength,
  sha256: createHash('sha256').update(out).digest('hex'),
};
await writeFile(sourcePath, JSON.stringify(source, null, 2) + '\n');
console.log(`${args.slug}: ${(before / 1024).toFixed(0)} KB -> ${(out.byteLength / 1024).toFixed(0)} KB (removed ${animations} animations, ${dropped} nodes)`);
