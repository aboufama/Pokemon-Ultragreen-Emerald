// Loading and preparing pre-rigged Pokémon models (glTF from Pokemon-3D-api).
//
// Every model is wrapped so that, in its own space: feet on y = 0, facing +Z,
// height normalized to 1. Species calibration then scales/rotates the wrapper.

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { asset } from '../gba/assets';

let loader: GLTFLoader | null = null;

function gltfLoader(): GLTFLoader {
  if (!loader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${import.meta.env.BASE_URL}libs/draco/`);
    loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
  }
  return loader;
}

export function loadGltf(url: string): Promise<GLTF> {
  return gltfLoader().loadAsync(url);
}

export interface LoadedModel {
  /** Wrapper: normalized space (feet at 0, +Z forward, height 1). */
  root: THREE.Group;
  /** The glTF scene inside the wrapper. */
  scene: THREE.Group;
  skinnedMeshes: THREE.SkinnedMesh[];
  bones: Map<string, THREE.Bone>;
  /** Materials by glTF texture/material name, for per-part overrides. */
  materials: Map<string, THREE.Material>;
  /** Height of the bind pose in glTF units (before normalization). */
  rawHeight: number;
}

export async function loadPokemonModel(slug: string, variant: 'regular' | 'shiny' = 'regular'): Promise<LoadedModel> {
  const file = variant === 'shiny' ? 'model.shiny.glb' : 'model.glb';
  const gltf = await loadGltf(asset(`pokemon/${slug}/${file}`));
  const scene = gltf.scene;
  const root = new THREE.Group();
  root.name = `${slug}-root`;
  root.add(scene);

  const skinnedMeshes: THREE.SkinnedMesh[] = [];
  const bones = new Map<string, THREE.Bone>();
  const materials = new Map<string, THREE.Material>();
  scene.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
      const m = o as THREE.SkinnedMesh;
      skinnedMeshes.push(m);
      // Skinned bounds change with animation; skip culling (the scene is tiny).
      m.frustumCulled = false;
    }
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).frustumCulled = false;
    if ((o as THREE.Bone).isBone) bones.set(o.name, o as THREE.Bone);
    const mat = (o as THREE.Mesh).material;
    if (mat) {
      for (const m of Array.isArray(mat) ? mat : [mat]) {
        const tex = (m as THREE.MeshStandardMaterial).map;
        const key = tex?.name || m.name;
        materials.set(key, m);
      }
    }
  });

  // Normalize from the bind pose.
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene, true);
  const height = box.max.y - box.min.y;
  const s = 1 / height;
  scene.scale.setScalar(s);
  scene.position.set(-((box.min.x + box.max.x) / 2) * s, -box.min.y * s, -((box.min.z + box.max.z) / 2) * s);
  return { root, scene, skinnedMeshes, bones, materials, rawHeight: height };
}
