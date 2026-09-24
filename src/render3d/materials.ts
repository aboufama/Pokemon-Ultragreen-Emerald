// Material setup for Pokémon models: flat toon shading in display space. The
// pixel pipeline snaps the result to the species' GBA palette afterwards, so
// these parameters only need to land each surface in the right palette ramp;
// they are fitted per species by the calibration tool (color phase).

import * as THREE from 'three';
import type { LoadedModel } from './model';

export interface ColorGrade {
  /** Multiplier on the texture color (after saturation). */
  gain: number;
  /** 1 = texture as-is, > 1 more saturated (GBA sprites are punchy). */
  saturation: number;
  /** Toon light levels for the shadow / mid / lit bands (0..1). */
  bands: [number, number, number];
}

export const DEFAULT_GRADE: ColorGrade = { gain: 1, saturation: 1, bands: [0.35, 0.69, 1] };

export interface MaterialOptions {
  /** Texture/material names that are special effects (hidden unless enabled). */
  effectParts?: string[];
  grade?: ColorGrade;
}

export interface ToonHandles {
  effects: Map<string, THREE.Mesh[]>;
  materials: THREE.MeshToonMaterial[];
  gradient: THREE.DataTexture;
  uniforms: { gain: { value: number }; saturation: { value: number }; flash: { value: number }; shade: { value: number } };
  setGrade(grade: ColorGrade): void;
}

function makeGradient(bands: [number, number, number]): THREE.DataTexture {
  const data = new Uint8Array(12);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  writeBands(tex, bands);
  return tex;
}

function writeBands(tex: THREE.DataTexture, bands: [number, number, number]): void {
  const data = tex.image.data as Uint8Array;
  bands.forEach((b, i) => {
    const v = Math.round(Math.min(1, Math.max(0, b)) * 255);
    data.set([v, v, v, 255], i * 4);
  });
  tex.needsUpdate = true;
}

export function applyToonMaterials(model: LoadedModel, opts: MaterialOptions = {}): ToonHandles {
  const grade = opts.grade ?? DEFAULT_GRADE;
  const effects = new Map<string, THREE.Mesh[]>();
  const materials: THREE.MeshToonMaterial[] = [];
  const gradient = makeGradient(grade.bands);
  const uniforms = { gain: { value: grade.gain }, saturation: { value: grade.saturation }, flash: { value: 0 }, shade: { value: 1 } };

  model.scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const src = mesh.material as THREE.MeshStandardMaterial;
    const map = src.map;
    const key = map?.name || src.name;
    if (map) {
      // Work in display space: keep the raw texel values.
      map.colorSpace = THREE.NoColorSpace;
      map.magFilter = THREE.NearestFilter;
      map.needsUpdate = true;
    }
    if (opts.effectParts?.some((p) => key.includes(p))) {
      const list = effects.get(key) ?? [];
      list.push(mesh);
      effects.set(key, list);
      mesh.visible = false;
      mesh.userData.effectMaterial = src;
      return;
    }
    const toon = new THREE.MeshToonMaterial({ map: map ?? null, gradientMap: gradient });
    toon.name = key;
    toon.color.setRGB(1, 1, 1, THREE.LinearSRGBColorSpace);
    toon.onBeforeCompile = (shader) => {
      shader.uniforms.uGain = uniforms.gain;
      shader.uniforms.uSaturation = uniforms.saturation;
      shader.uniforms.uFlash = uniforms.flash;
      shader.uniforms.uShade = uniforms.shade;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uGain;\nuniform float uSaturation;\nuniform float uFlash;\nuniform float uShade;')
        // Shade (standing in a cloud's shadow), then the white flash (Poke
        // Ball send-out, hits) that blends the lit color to white.
        .replace('#include <opaque_fragment>', 'outgoingLight *= uShade;\noutgoingLight = mix(outgoingLight, vec3(1.0), uFlash);\n#include <opaque_fragment>')
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = max(mix(vec3(luma), diffuseColor.rgb, uSaturation), 0.0) * uGain;`,
        );
    };
    materials.push(toon);
    mesh.material = toon;
  });

  return {
    effects,
    materials,
    gradient,
    uniforms,
    setGrade(g: ColorGrade) {
      uniforms.gain.value = g.gain;
      uniforms.saturation.value = g.saturation;
      writeBands(gradient, g.bands);
    },
  };
}
