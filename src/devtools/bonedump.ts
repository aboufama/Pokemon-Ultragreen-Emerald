// Dev: print bind-pose bone frames in normalized model space.
import * as THREE from 'three';
import { loadPokemonModel } from '../render3d/model';

export async function runBoneDump(): Promise<unknown> {
  const slug = new URLSearchParams(location.search).get('species') ?? 'blaziken';
  const model = await loadPokemonModel(slug);
  model.root.updateMatrixWorld(true);
  const out: Record<string, unknown> = {};
  const fmt = (v: THREE.Vector3) => v.toArray().map((x) => +x.toFixed(3));
  for (const [name, bone] of model.bones) {
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    bone.matrixWorld.decompose(p, q, s);
    out[name] = {
      parent: bone.parent?.name,
      pos: fmt(p),
      x: fmt(new THREE.Vector3(1, 0, 0).applyQuaternion(q)),
      y: fmt(new THREE.Vector3(0, 1, 0).applyQuaternion(q)),
      z: fmt(new THREE.Vector3(0, 0, 1).applyQuaternion(q)),
    };
  }
  const meshes: Record<string, unknown> = {};
  model.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    const uv = m.geometry.getAttribute('uv');
    const pos = m.geometry.getAttribute('position');
    let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9;
    for (let i = 0; i < uv.count; i++) { u0 = Math.min(u0, uv.getX(i)); u1 = Math.max(u1, uv.getX(i)); v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); }
    const skin = m.geometry.getAttribute('skinIndex');
    const joints = new Set<number>();
    for (let i = 0; i < skin.count; i++) for (let k = 0; k < 4; k++) if (m.geometry.getAttribute('skinWeight').getComponent(i, k) > 0.01) joints.add(skin.getComponent(i, k));
    const names = [...joints].map((j) => (m as THREE.SkinnedMesh).skeleton.bones[j].name);
    meshes[m.name + ':' + (mat.map?.name ?? mat.name)] = { verts: pos.count, uv: [u0, v0, u1, v1].map((x) => +x.toFixed(3)), joints: names };
  });
  console.log(JSON.stringify({ meshes }));
  console.log(JSON.stringify(out));
  return out;
}
