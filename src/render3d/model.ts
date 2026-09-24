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
    // Decode embedded textures through <img> elements rather than
    // fetch(blob:) + createImageBitmap: sandboxed hosts may block fetching
    // blob: URLs, but allow blob: images.
    loader.register((parser) => {
      const images = new THREE.TextureLoader(parser.options.manager);
      images.setCrossOrigin(parser.options.crossOrigin);
      parser.textureLoader = images;
      return { name: 'image_element_textures' };
    });
  }
  return loader;
}

declare global {
  interface Window {
    /** Models embedded in the page as base64 .glb, by asset path (standalone demo build). */
    __EMBEDDED_MODELS__?: Record<string, string>;
  }
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

/** Load a model asset (path under assets/), from the page if it was embedded. */
export function loadGltf(path: string): Promise<GLTF> {
  const embedded = window.__EMBEDDED_MODELS__?.[path];
  if (embedded) return gltfLoader().parseAsync(base64ToBuffer(embedded), '');
  return gltfLoader().loadAsync(asset(path));
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

/** Extra level-of-detail meshes (newer exports ship lod1..lod3 next to lod0). */
const EXTRA_LOD = /(^|[_\s-])lod[1-9]/i;

export async function loadPokemonModel(slug: string, variant: 'regular' | 'shiny' = 'regular', opts: { hiddenParts?: string[] } = {}): Promise<LoadedModel> {
  // Battles use the regular mesh for shiny Pokémon too (they recolor through
  // the palette, as in Gen 3). An upstream shiny export, if present, is only
  // for inspection; fall back to the regular mesh when there is none.
  const gltf = variant === 'shiny'
    ? await loadGltf(`pokemon/${slug}/model.shiny.glb`).catch(() => loadGltf(`pokemon/${slug}/model.glb`))
    : await loadGltf(`pokemon/${slug}/model.glb`);
  const scene = gltf.scene;
  // Drop extra LODs and parts the profile hides (alternate meshes) before
  // measuring the model, so they neither render nor skew its size.
  const hidden = opts.hiddenParts ?? [];
  const drop: THREE.Object3D[] = [];
  scene.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const names = [o.name, o.parent?.name ?? ''];
    if (names.some((n) => EXTRA_LOD.test(n) || hidden.some((h) => n.includes(h)))) drop.push(o);
  });
  for (const o of drop) o.removeFromParent();
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
