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
  console.log(JSON.stringify(out));
  return out;
}
