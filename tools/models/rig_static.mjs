#!/usr/bin/env node
// Rig a model that ships without a skeleton (a static upstream export) so the
// gauntlet can pose it like the pre-rigged ones: build the skeleton from a
// joint spec and skin the meshes with bone-heat weights (Baran & Popović,
// "Automatic Rigging and Animation of 3D Characters", 2007: each bone's weight
// diffuses over the surface from the vertices it is nearest to).
//
//   node tools/models/rig_static.mjs --slug treecko [--from build/upstream/treecko.glb]
//        [--spec src/pokemon/treecko/skeleton.json] [--out public/assets/pokemon/treecko/model.glb]
//
// --from defaults to build/upstream/<slug>.glb, downloaded from the URL in
// SOURCE.json when missing. Then run tools/models/optimize_model.mjs, which
// re-encodes the geometry with Draco.
//
// The spec (JSON, in the upstream file's units, +Z forward, +X its left):
//   joints    [{ name, parent, pos, end? }]: each bone's local +X points at its
//             first child (or `end`), the axis the rig's aims use (RigProfile.boneAxis)
//   segments  { joint: [a, b] }: where a bone lies, for the weights (default: pos -> child/end)
//   regions   [{ box: { x?, y?, z? }, bones }]: the bones a vertex may be bound to,
//             first match wins (keeps an arm's weights off the chest, a thigh's off the tail)
//   heat      the heat constant c (default 1, as in the paper; higher is tighter)
//   jaw       optional: splits a closed mouth into the jaw and the head (see jawWeights)
//   meshes    { name: { follow: 'nearest' } }: meshes skinned like the nearest body vertex (eyes)
//   names     { material: newName }: renames materials and their textures
// Joint positions are where the meshes show in the file: a mesh node's world
// transform (a rotated or scaled export root, a dequantizing scale) is baked
// into its vertices first. The meshes are cleaned: exact duplicate triangles
// (some exports hold every face twice) are dropped.

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
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

// Small vector helpers ---------------------------------------------------------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const smoothstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** Rotation matrix (columns x, y, z) as a quaternion [x, y, z, w]. */
function quatFromBasis(x, y, z) {
  const m00 = x[0], m01 = y[0], m02 = z[0];
  const m10 = x[1], m11 = y[1], m12 = z[1];
  const m20 = x[2], m21 = y[2], m22 = z[2];
  const tr = m00 + m11 + m22;
  let q;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s];
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = [0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s];
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = [(m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s];
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
  }
  const l = Math.hypot(...q);
  return q.map((v) => v / l);
}

/** R^T v for a basis given as columns. */
const toLocal = (basis, v) => [dot(basis[0], v), dot(basis[1], v), dot(basis[2], v)];

function distToSegment(p, a, b) {
  const ab = sub(b, a);
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / (dot(ab, ab) || 1)));
  return len(sub(p, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]));
}

// Skeleton ---------------------------------------------------------------------

function buildSkeleton(spec) {
  const byName = new Map(spec.joints.map((j) => [j.name, j]));
  const joints = spec.joints.map((j) => {
    const firstChild = spec.joints.find((c) => c.parent === j.name);
    const target = j.end ?? firstChild?.pos;
    if (!target) throw new Error(`joint ${j.name} needs an end (it has no child)`);
    const x = norm(sub(target, j.pos));
    const ref = Math.abs(x[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1];
    const y = norm(sub(ref, scale(x, dot(ref, x))));
    const z = cross(x, y);
    const seg = spec.segments?.[j.name] ?? [j.pos, target];
    return { ...j, basis: [x, y, z], target, seg };
  });
  for (const j of joints) if (j.parent && !byName.has(j.parent)) throw new Error(`joint ${j.name}: unknown parent ${j.parent}`);
  return joints;
}

// Meshes -----------------------------------------------------------------------

/** Positions welded by coordinates (glTF splits vertices at UV seams). */
function weld(positions, tol = 1e-4) {
  const ids = new Int32Array(positions.length / 3);
  const map = new Map();
  const unique = [];
  for (let i = 0; i < ids.length; i++) {
    const k = `${Math.round(positions[i * 3] / tol)},${Math.round(positions[i * 3 + 1] / tol)},${Math.round(positions[i * 3 + 2] / tol)}`;
    let id = map.get(k);
    if (id === undefined) {
      id = unique.length;
      map.set(k, id);
      unique.push([positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]);
    }
    ids[i] = id;
  }
  return { ids, unique };
}

/** Drop exact duplicate triangles and the vertices only they used. */
function dedupePrimitive(doc, prim, buffer) {
  const pos = prim.getAttribute('POSITION').getArray();
  const index = prim.getIndices().getArray();
  const { ids } = weld(pos);
  const seen = new Set();
  const kept = [];
  for (let f = 0; f < index.length; f += 3) {
    const k = [ids[index[f]], ids[index[f + 1]], ids[index[f + 2]]].sort((a, b) => a - b).join(',');
    if (seen.has(k)) continue;
    seen.add(k);
    kept.push(index[f], index[f + 1], index[f + 2]);
  }
  const remap = new Map();
  const order = [];
  const newIndex = new Uint32Array(kept.length);
  kept.forEach((v, i) => {
    let n = remap.get(v);
    if (n === undefined) {
      n = order.length;
      remap.set(v, n);
      order.push(v);
    }
    newIndex[i] = n;
  });
  for (const semantic of prim.listSemantics()) {
    const acc = prim.getAttribute(semantic);
    const size = acc.getElementSize();
    const src = acc.getArray();
    const dst = new src.constructor(order.length * size);
    order.forEach((v, i) => { for (let c = 0; c < size; c++) dst[i * size + c] = src[v * size + c]; });
    prim.setAttribute(semantic, doc.createAccessor().setType(acc.getType()).setArray(dst).setBuffer(buffer));
  }
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(newIndex).setBuffer(buffer));
  return { faces: index.length / 3, kept: kept.length / 3 };
}

// Bone heat --------------------------------------------------------------------

/**
 * Weights w[b][v] of every bone over the welded surface: solve
 * (L + M H) w_b = M H p_b, L the cotangent Laplacian (clamped), M the lumped
 * vertex areas, H = c/d^2 toward the nearest allowed bone, p_b = 1 where that
 * bone is the nearest. Each bone's weight lives only where a region allows it
 * (zero elsewhere), so it fades out inside its regions instead of leaking over
 * the whole body; c > 1 tightens the falloff for thick parts (a big head, a
 * leaf tail) whose surface lies far from their bones. Conjugate gradients
 * with a Jacobi preconditioner.
 */
function boneHeat(verts, faces, bones, allowed, c = 1) {
  const n = verts.length;
  const nbr = Array.from({ length: n }, () => new Map());
  const mass = new Float64Array(n);
  const addW = (a, b, w) => {
    nbr[a].set(b, (nbr[a].get(b) ?? 0) + w);
    nbr[b].set(a, (nbr[b].get(a) ?? 0) + w);
  };
  for (const [i, j, k] of faces) {
    const P = [verts[i], verts[j], verts[k]];
    const c = cross(sub(P[1], P[0]), sub(P[2], P[0]));
    const area = len(c) / 2;
    if (area < 1e-12) continue;
    for (const v of [i, j, k]) mass[v] += area / 3;
    const corner = (o, a, b) => {
      const e1 = sub(P[a], P[o]), e2 = sub(P[b], P[o]);
      return dot(e1, e2) / (len(cross(e1, e2)) || 1e-12);
    };
    addW(j, k, Math.max(0, corner(0, 1, 2)) / 2);
    addW(i, k, Math.max(0, corner(1, 0, 2)) / 2);
    addW(i, j, Math.max(0, corner(2, 0, 1)) / 2);
  }
  // Nearest allowed bone and the heat term.
  const nearest = new Int32Array(n);
  const H = new Float64Array(n);
  for (let v = 0; v < n; v++) {
    let best = -1, bd = Infinity;
    for (const b of allowed[v]) {
      const d = distToSegment(verts[v], bones[b].seg[0], bones[b].seg[1]);
      if (d < bd) { bd = d; best = b; }
    }
    nearest[v] = best;
    H[v] = c / Math.max(bd, 1e-3) ** 2;
  }
  // Matrix rows (CSR-ish).
  const rows = nbr.map((m) => [...m.entries()]);
  const diag = new Float64Array(n);
  for (let v = 0; v < n; v++) {
    let s = 0;
    for (const [, w] of rows[v]) s += w;
    diag[v] = s + mass[v] * H[v];
  }
  const mul = (x, out) => {
    for (let v = 0; v < n; v++) {
      let s = diag[v] * x[v];
      for (const [u, w] of rows[v]) s -= w * x[u];
      out[v] = s;
    }
  };
  const solve = (rhs, mask) => {
    const x = new Float64Array(n);
    const r = Float64Array.from(rhs);
    const z = new Float64Array(n);
    const p = new Float64Array(n);
    const Ap = new Float64Array(n);
    for (let v = 0; v < n; v++) { z[v] = mask[v] ? r[v] / diag[v] : 0; p[v] = z[v]; }
    let rz = 0;
    for (let v = 0; v < n; v++) rz += r[v] * z[v];
    const r0 = Math.sqrt(rhs.reduce((s, a) => s + a * a, 0)) || 1;
    for (let it = 0; it < 5000; it++) {
      mul(p, Ap);
      for (let v = 0; v < n; v++) if (!mask[v]) Ap[v] = 0;
      let pAp = 0;
      for (let v = 0; v < n; v++) pAp += p[v] * Ap[v];
      const alpha = rz / pAp;
      let rr = 0;
      for (let v = 0; v < n; v++) { x[v] += alpha * p[v]; r[v] -= alpha * Ap[v]; rr += r[v] * r[v]; }
      if (Math.sqrt(rr) / r0 < 1e-10) break;
      let rz2 = 0;
      for (let v = 0; v < n; v++) { z[v] = mask[v] ? r[v] / diag[v] : 0; rz2 += r[v] * z[v]; }
      const beta = rz2 / rz;
      rz = rz2;
      for (let v = 0; v < n; v++) p[v] = z[v] + beta * p[v];
    }
    return x;
  };
  const weights = bones.map((_, b) => {
    const rhs = new Float64Array(n);
    const mask = new Uint8Array(n);
    let any = false;
    for (let v = 0; v < n; v++) {
      mask[v] = allowed[v].includes(b) ? 1 : 0;
      if (nearest[v] === b) { rhs[v] = mass[v] * H[v]; any = true; }
    }
    return any ? solve(rhs, mask) : new Float64Array(n);
  });
  return { weights, nearest, adjacency: nbr };
}

// Jaw --------------------------------------------------------------------------

/**
 * The jaw's share of each vertex of a closed mouth. Inside the mouth pocket
 * (faces textured with `pocketUv`): the floor (faces turned up) goes with the
 * jaw, the palate (turned down) with the head, the back of the pocket where
 * they meet half and half; on the lips, a vertex on floor faces only is the
 * lower lip. Outside: the skin below the lip `line` (z, y pairs, from the
 * corner to the front) goes with the jaw, fading out behind the hinge
 * (`back`), down the throat (`throat`) and past the lower lip's front
 * (`front`: the snout's overhang stays with the head).
 */
function jawWeights(jaw, verts, faceData) {
  const n = verts.length;
  const pocketUp = new Int32Array(n), pocketDown = new Int32Array(n), outside = new Int32Array(n);
  for (const f of faceData) {
    const [u0, v0, u1, v1] = jaw.pocketUv;
    const inPocket = f.uv[0] >= u0 && f.uv[0] <= u1 && f.uv[1] >= v0 && f.uv[1] <= v1;
    for (const v of f.verts) {
      if (!inPocket) outside[v]++;
      else if (f.normal[1] > 0) pocketUp[v]++;
      else pocketDown[v]++;
    }
  }
  const [[za, ya], [zb, yb]] = jaw.line;
  const lineY = (z) => (z <= za ? ya : z >= zb ? yb : ya + ((yb - ya) * (z - za)) / (zb - za));
  const w = new Float64Array(n);
  for (let v = 0; v < n; v++) {
    const [x, y, z] = verts[v];
    const up = pocketUp[v] > 0, down = pocketDown[v] > 0;
    if (up || down) {
      // In the pocket or on its rim (the lips).
      w[v] = up && !down ? 1 : down && !up ? 0 : 0.5;
      continue;
    }
    if (Math.abs(x) > jaw.sides) continue;
    const below = smoothstep(lineY(z) + jaw.band, lineY(z) - jaw.band, y);
    const front = smoothstep(jaw.front + 0.02, jaw.front - 0.02, z);
    const back = smoothstep(jaw.back[0], jaw.back[1], z);
    const throat = smoothstep(jaw.throat[0], jaw.throat[1], y);
    w[v] = below * front * back * throat;
  }
  return w;
}

// Main -------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
if (!args.slug) {
  console.error('usage: rig_static.mjs --slug <species> [--from upstream.glb] [--spec skeleton.json] [--out model.glb]');
  process.exit(1);
}
const slug = String(args.slug);
const assetDir = join(ROOT, 'public/assets/pokemon', slug);
const specPath = resolve(String(args.spec ?? join(ROOT, 'src/pokemon', slug, 'skeleton.json')));
const from = resolve(String(args.from ?? join(ROOT, 'build/upstream', `${slug}.glb`)));
const out = resolve(String(args.out ?? join(assetDir, 'model.glb')));
const spec = JSON.parse(await readFile(specPath, 'utf8'));
const sourcePath = join(assetDir, 'SOURCE.json');
const source = existsSync(sourcePath) ? JSON.parse(await readFile(sourcePath, 'utf8')) : null;

if (!existsSync(from)) {
  const url = source?.files?.find((f) => f.variant === 'regular')?.url;
  if (!url) throw new Error(`no ${from} and no upstream URL in SOURCE.json`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  await mkdir(dirname(from), { recursive: true });
  await writeFile(from, Buffer.from(await res.arrayBuffer()));
  console.log(`downloaded ${url} -> ${relative(ROOT, from)}`);
}
const upstream = await readFile(from);
const upstreamSha = createHash('sha256').update(upstream).digest('hex');

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
});
const doc = await io.readBinary(new Uint8Array(upstream));
const root = doc.getRoot();
if (root.listSkins().length) throw new Error(`${relative(ROOT, from)} already has a skeleton`);
// Written uncompressed; tools/models/optimize_model.mjs re-encodes with Draco.
for (const ext of root.listExtensionsUsed()) if (ext.extensionName === 'KHR_draco_mesh_compression') ext.dispose();

const buffer = root.listBuffers()[0] ?? doc.createBuffer();

const meshNodes = root.listNodes().filter((n) => n.getMesh());

// World space: the spec's joints are where the meshes show in the file, so
// each mesh node's world transform (exports often hang the meshes under a
// rotated or scaled root node, or dequantize them with a node scale) is baked
// into its vertices, and the meshes move to the scene root with identity
// transforms (glTF ignores a skinned mesh's own transform).
{
  const isIdentity = (m) => m.every((v, i) => Math.abs(v - (i % 5 === 0 ? 1 : 0)) < 1e-9);
  // Every world matrix first: moving a node changes its children's.
  const worlds = new Map(meshNodes.map((n) => [n, Array.from(n.getWorldMatrix())]));
  const users = new Map();
  for (const node of meshNodes) users.set(node.getMesh(), (users.get(node.getMesh()) ?? 0) + 1);
  const baked = new Set();
  const mul3 = (M, v) => [0, 1, 2].map((r) => M[r][0] * v[0] + M[r][1] * v[1] + M[r][2] * v[2]);
  for (const node of meshNodes) {
    const m = worlds.get(node);
    if (isIdentity(m)) continue;
    const mesh = node.getMesh();
    if (users.get(mesh) > 1) throw new Error(`mesh ${mesh.getName()} is used by several nodes: split it before rigging`);
    // Column-major 4x4. Normals go by the inverse transpose of its 3x3: the
    // cofactor matrix, signed by the determinant.
    const a = [[m[0], m[4], m[8]], [m[1], m[5], m[9]], [m[2], m[6], m[10]]];
    const cof = (r, c) => {
      const rr = [0, 1, 2].filter((x) => x !== r), cc = [0, 1, 2].filter((x) => x !== c);
      return ((r + c) % 2 ? -1 : 1) * (a[rr[0]][cc[0]] * a[rr[1]][cc[1]] - a[rr[0]][cc[1]] * a[rr[1]][cc[0]]);
    };
    const C = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cof(r, c)));
    const det = a[0][0] * C[0][0] + a[0][1] * C[0][1] + a[0][2] * C[0][2];
    const s = det < 0 ? -1 : 1;
    /** Rewrite an attribute as plain floats (it may be quantized or normalized), each element through f. */
    const bake = (acc, f) => {
      if (!acc) return;
      if (baked.has(acc)) throw new Error(`an accessor of mesh ${mesh.getName()} is shared with another mesh`);
      baked.add(acc);
      const n = acc.getCount(), size = acc.getElementSize();
      const out = new Float32Array(n * size);
      const el = new Array(size);
      for (let i = 0; i < n; i++) {
        acc.getElement(i, el);
        out.set(f(el), i * size);
      }
      acc.setArray(out).setNormalized(false);
    };
    for (const prim of mesh.listPrimitives()) {
      if (prim.listTargets().length) throw new Error(`mesh ${mesh.getName()} has morph targets under a transformed node: not supported`);
      bake(prim.getAttribute('POSITION'), (p) => mul3(a, p).map((v, k) => v + m[12 + k]));
      bake(prim.getAttribute('NORMAL'), (nv) => norm(scale(mul3(C, nv), s)));
      bake(prim.getAttribute('TANGENT'), (t) => [...norm(mul3(a, t)), t[3] * s]);
      // A mirroring transform turns the faces inside out: flip their winding back.
      const index = prim.getIndices();
      if (det < 0 && index) {
        if (baked.has(index)) throw new Error(`the indices of mesh ${mesh.getName()} are shared with another mesh`);
        baked.add(index);
        const ix = index.getArray();
        for (let f = 0; f + 2 < ix.length; f += 3) [ix[f + 1], ix[f + 2]] = [ix[f + 2], ix[f + 1]];
        index.setArray(ix);
      } else if (det < 0) {
        throw new Error(`mesh ${mesh.getName()} is mirrored and not indexed: not supported`);
      }
    }
    console.log(`${node.getName()}: its world transform baked into the vertices`);
  }
  for (const node of meshNodes) {
    if (node.getParentNode()) root.getDefaultScene().addChild(node);
    node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
  }
}

// Clean the meshes.
for (const node of meshNodes) {
  for (const prim of node.getMesh().listPrimitives()) {
    const r = dedupePrimitive(doc, prim, buffer);
    if (r.kept !== r.faces) console.log(`${node.getName()}: ${r.faces} triangles -> ${r.kept} (duplicates dropped)`);
  }
}

// Skeleton nodes.
const joints = buildSkeleton(spec);
const jointNode = new Map();
for (const j of joints) {
  const parent = j.parent ? joints.find((p) => p.name === j.parent) : null;
  const t = parent ? toLocal(parent.basis, sub(j.pos, parent.pos)) : j.pos;
  // Local rotation: parent^T * this (both bases as columns).
  const R = parent ? j.basis.map((axis) => toLocal(parent.basis, axis)) : j.basis;
  const node = doc.createNode(j.name).setTranslation(t).setRotation(quatFromBasis(R[0], R[1], R[2]));
  jointNode.set(j.name, node);
  if (parent) jointNode.get(parent.name).addChild(node);
  else root.getDefaultScene().addChild(node);
}
const ibm = new Float32Array(joints.length * 16);
joints.forEach((j, i) => {
  const [x, y, z] = j.basis;
  const t = scale(toLocal(j.basis, j.pos), -1);
  // Column-major inverse of [R | p]: rows of R become columns.
  ibm.set([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, t[0], t[1], t[2], 1], i * 16);
});
const skin = doc.createSkin(`${slug}_skin`).setInverseBindMatrices(doc.createAccessor().setType('MAT4').setArray(ibm).setBuffer(buffer));
for (const j of joints) skin.addJoint(jointNode.get(j.name));

// Weights on the body (every mesh the spec doesn't skin otherwise).
const follow = spec.meshes ?? {};
/** A mesh's entry in spec.meshes, by node or mesh name. */
const followOf = (n) => follow[n.getName()] ?? follow[n.getMesh().getName()];
const bodyNodes = meshNodes.filter((n) => !followOf(n));
const bodyVerts = [];
const bodyFaces = [];
const faceData = [];
const primIds = new Map();
{
  // Weld all body primitives together.
  const all = [];
  for (const node of bodyNodes) for (const prim of node.getMesh().listPrimitives()) all.push(prim);
  const key = new Map();
  for (const prim of all) {
    const pos = prim.getAttribute('POSITION').getArray();
    const uv = prim.getAttribute('TEXCOORD_0')?.getArray();
    const ids = new Int32Array(pos.length / 3);
    for (let i = 0; i < ids.length; i++) {
      const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
      const k = p.map((c) => Math.round(c / 1e-4)).join(',');
      let id = key.get(k);
      if (id === undefined) { id = bodyVerts.length; key.set(k, id); bodyVerts.push(p); }
      ids[i] = id;
    }
    primIds.set(prim, ids);
    const index = prim.getIndices().getArray();
    for (let f = 0; f < index.length; f += 3) {
      const vs = [ids[index[f]], ids[index[f + 1]], ids[index[f + 2]]];
      if (vs[0] === vs[1] || vs[1] === vs[2] || vs[0] === vs[2]) continue;
      bodyFaces.push(vs);
      const P = vs.map((v) => bodyVerts[v]);
      const normal = norm(cross(sub(P[1], P[0]), sub(P[2], P[0])));
      const fuv = uv ? [0, 1].map((c) => (uv[index[f] * 2 + c] + uv[index[f + 1] * 2 + c] + uv[index[f + 2] * 2 + c]) / 3) : [0, 0];
      faceData.push({ verts: vs, normal, uv: fuv });
    }
  }
}
const inBox = (p, box) => ['x', 'y', 'z'].every((a, i) => !box[a] || (p[i] >= box[a][0] && p[i] <= box[a][1]));
const boneIndex = new Map(joints.map((j, i) => [j.name, i]));
const allowed = bodyVerts.map((p) => {
  const region = (spec.regions ?? []).find((r) => inBox(p, r.box ?? {}));
  const names = region ? region.bones : joints.map((j) => j.name);
  return names.map((b) => {
    if (!boneIndex.has(b)) throw new Error(`region bone ${b} is not a joint`);
    return boneIndex.get(b);
  });
});
const heat = boneHeat(bodyVerts, bodyFaces, joints, allowed, spec.heat ?? 1);
const nb = joints.length;
const W = bodyVerts.map((_, v) => joints.map((__, b) => Math.max(0, heat.weights[b][v])));
if (spec.jaw) {
  const jb = boneIndex.get(spec.jaw.bone);
  const jw = jawWeights(spec.jaw, bodyVerts, faceData);
  let moved = 0;
  W.forEach((w, v) => {
    if (jw[v] <= 0) { w[jb] = 0; return; }
    const rest = w.reduce((s, x, b) => (b === jb ? s : s + x), 0) || 1;
    for (let b = 0; b < nb; b++) w[b] = b === jb ? jw[v] : (w[b] / rest) * (1 - jw[v]);
    moved++;
  });
  console.log(`jaw: ${moved} vertices`);
}
/** The four strongest influences, small ones dropped, normalized. */
const top4 = (w) => {
  const order = w.map((x, b) => [x, b]).filter(([x]) => x > 0.02).sort((a, b) => b[0] - a[0]).slice(0, 4);
  const s = order.reduce((acc, [x]) => acc + x, 0) || 1;
  const j = [0, 0, 0, 0], ww = [0, 0, 0, 0];
  order.forEach(([x, b], i) => { j[i] = b; ww[i] = x / s; });
  if (!order.length) ww[0] = 1;
  return { j, w: ww };
};
const final = W.map(top4);

const setSkinAttributes = (prim, perVertex) => {
  const count = prim.getAttribute('POSITION').getCount();
  const J = new Uint16Array(count * 4), Wt = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const { j, w } = perVertex(i);
    J.set(j, i * 4);
    Wt.set(w, i * 4);
  }
  prim.setAttribute('JOINTS_0', doc.createAccessor().setType('VEC4').setArray(J).setBuffer(buffer));
  prim.setAttribute('WEIGHTS_0', doc.createAccessor().setType('VEC4').setArray(Wt).setBuffer(buffer));
};
for (const node of bodyNodes) {
  for (const prim of node.getMesh().listPrimitives()) {
    const ids = primIds.get(prim);
    setSkinAttributes(prim, (i) => final[ids[i]]);
  }
  node.setSkin(skin);
}
for (const node of meshNodes.filter((n) => followOf(n))) {
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute('POSITION').getArray();
    setSkinAttributes(prim, (i) => {
      const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
      let best = 0, bd = Infinity;
      bodyVerts.forEach((q, v) => { const d = len(sub(p, q)); if (d < bd) { bd = d; best = v; } });
      return final[best];
    });
  }
  node.setSkin(skin);
}
for (const node of meshNodes) node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);

// Names (the eye atlas is found by its material's name).
for (const mat of root.listMaterials()) {
  const name = spec.names?.[mat.getName()];
  if (!name) continue;
  mat.setName(name);
  mat.getBaseColorTexture()?.setName(name);
}

// Report: vertices per bone (dominant influence).
const counts = new Map();
final.forEach(({ j, w }) => { const b = joints[j[0]].name; counts.set(b, (counts.get(b) ?? 0) + 1); void w; });
console.log('dominant bone per welded vertex:', [...counts.entries()].map(([b, c]) => `${b} ${c}`).join(', '));

await mkdir(dirname(out), { recursive: true });
await writeFile(out, await io.writeBinary(doc));
console.log(`wrote ${relative(ROOT, out)}: ${joints.length} joints, ${bodyVerts.length} welded body vertices`);

if (source && out === join(assetDir, 'model.glb')) {
  source.rigged = {
    tool: 'tools/models/rig_static.mjs',
    spec: relative(ROOT, specPath),
    upstreamSha256: upstreamSha,
    joints: joints.length,
    note: 'The upstream export has no skeleton: the skeleton and skin weights were added here.',
  };
  delete source.optimized;
  await writeFile(sourcePath, JSON.stringify(source, null, 2) + '\n');
}
