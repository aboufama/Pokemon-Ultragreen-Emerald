#!/usr/bin/env node
// Print a model's skeleton: the node hierarchy with joint/helper flags, bone
// lengths in model heights, the guessed semantic name of each joint, and the
// meshes/materials (effect candidates). Works on the Draco-compressed models.
//
//   node tools/gauntlet/skeleton.mjs --slug venusaur [--weights]
//   node tools/gauntlet/skeleton.mjs --model path/to/model.glb
//
//   --weights   also list, per joint, how many vertices it moves and where
//               they are (the far end of loose parts; useful for springs
//               and emitters such as cannons, flowers or tail flames)
//   --textures <dir>  write every texture as PNG (find eye atlases for
//               expressions and blinks, effect textures, alternate parts)

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guessRig } from './rigmap.mjs';

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
const file = args.model ? resolve(String(args.model)) : join(ROOT, 'public/assets/pokemon', String(args.slug), 'model.glb');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.read(file);
const root = doc.getRoot();
const skin = root.listSkins()[0];
const joints = skin ? skin.listJoints() : [];
const jointSet = new Set(joints);
const rig = guessRig(joints.map((j) => j.getName()));
const semanticOf = new Map(Object.entries(rig.bones).map(([k, v]) => [v, k]));

// World matrices at bind pose (column-major 4x4).
const mul = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
const world = new Map();
const walk = (n, parent) => {
  const m = mul(parent, n.getMatrix());
  world.set(n, m);
  for (const c of n.listChildren()) walk(c, m);
};
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
for (const s of root.listScenes()) for (const n of s.listChildren()) walk(n, I);
const pos = (n) => world.get(n).slice(12, 15);

// Model height from the skinned vertices at bind pose (via inverse binds).
let minY = Infinity, maxY = -Infinity;
const ibm = skin?.getInverseBindMatrices();
const weights = new Map();
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const P = prim.getAttribute('POSITION');
    const J = prim.getAttribute('JOINTS_0');
    const W = prim.getAttribute('WEIGHTS_0');
    const nm = world.get(node) ?? I;
    for (let i = 0; i < P.getCount(); i++) {
      const p = P.getElement(i, []);
      const wp = [0, 1, 2].map((r) => nm[r] * p[0] + nm[4 + r] * p[1] + nm[8 + r] * p[2] + nm[12 + r]);
      minY = Math.min(minY, wp[1]);
      maxY = Math.max(maxY, wp[1]);
      if (!J || !args.weights) continue;
      const j = J.getElement(i, []), w = W.getElement(i, []);
      for (let k = 0; k < 4; k++) {
        if (w[k] < 0.5) continue;
        const joint = joints[j[k]];
        const e = weights.get(joint) ?? { n: 0, sum: [0, 0, 0], max: -Infinity, far: null };
        e.n++;
        for (let a = 0; a < 3; a++) e.sum[a] += wp[a];
        const jp = pos(joint);
        const d = Math.hypot(wp[0] - jp[0], wp[1] - jp[1], wp[2] - jp[2]);
        if (d > e.max) {
          e.max = d;
          e.far = wp;
        }
        weights.set(joint, e);
      }
    }
  }
}
const H = maxY - minY || 1;
const f = (v) => (v / H).toFixed(3);

console.log(`${file.replace(ROOT + '/', '')}: ${joints.length} joints, height ${H.toFixed(3)} model units (lengths below in heights; +Z forward, +Y up, +X its left)`);
const print = (n, depth) => {
  const name = n.getName();
  const isJoint = jointSet.has(n);
  const p = pos(n);
  const parent = n.getParentNode?.();
  const len = parent && world.has(parent) ? Math.hypot(...p.map((v, i) => v - pos(parent)[i])) : 0;
  let line = `${'  '.repeat(depth)}${name}${isJoint ? '' : ' (helper)'}`;
  const sem = semanticOf.get(name);
  if (sem) line += `  [${sem}]`;
  line += `  at (${f(p[0])}, ${f(p[1] - minY)}, ${f(p[2])})`;
  if (len) line += ` len ${f(len)}`;
  const w = weights.get(n);
  if (w) line += `  moves ${w.n} verts, far end (${f(w.far[0])}, ${f(w.far[1] - minY)}, ${f(w.far[2])})`;
  if (n.getMesh()) line += `  mesh "${n.getMesh().getName()}"`;
  console.log(line);
  for (const c of n.listChildren()) print(c, depth + 1);
};
for (const s of root.listScenes()) for (const n of s.listChildren()) print(n, 0);
console.log('\nmaterials:');
for (const m of root.listMaterials()) {
  const tex = m.getBaseColorTexture();
  const size = tex?.getSize();
  const meshes = root.listMeshes().filter((me) => me.listPrimitives().some((p) => p.getMaterial() === m)).map((me) => me.getName());
  console.log(`  ${m.getName()}: texture "${tex?.getName() || tex?.getURI() || '-'}" ${size ? size.join('x') : ''} on meshes ${meshes.join(', ')}`);
}
if (args.textures) {
  const dir = resolve(String(args.textures));
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const t of root.listTextures()) {
    const ext = (t.getMimeType() ?? 'image/png').split('/')[1];
    const base = join(dir, `${String(i++).padStart(2, '0')}_${(t.getName() || t.getURI() || 'texture').replace(/[^\w.-]+/g, '_').replace(/\.(png|webp|jpg)$/i, '')}`);
    await writeFile(`${base}.${ext}`, t.getImage());
    if (ext !== 'png') spawnSync('python3', ['-c', `from PIL import Image; Image.open('${base}.${ext}').save('${base}.png')`]);
  }
  console.log(`textures written to ${dir}`);
}
console.log('guessed rig:', JSON.stringify(rig.bones));
console.log(`legs IK: ${rig.legs ? 'yes' : 'no'}; unmapped joints: ${rig.unmapped.length}`);
