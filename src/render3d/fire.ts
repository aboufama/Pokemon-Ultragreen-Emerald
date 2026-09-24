// Additive, skinned flame material for effect meshes shipped with the models
// (e.g. Blaziken's wrist flames). Uses the model's own flame masks, scrolls
// them upward and colors them with a fire ramp; the pixel pass then snaps the
// result like any other pixel.

import * as THREE from 'three';

export interface FireOptions {
  core: THREE.ColorRepresentation;
  mid: THREE.ColorRepresentation;
  edge: THREE.ColorRepresentation;
  scroll?: number;
}

/**
 * Id-pass twin of a fire material: same skinning and animated cutout, writes
 * a flat object id so flame pixels are not palette-snapped as body pixels.
 */
export function makeFireIdMaterial(fire: THREE.ShaderMaterial, id: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { ...fire.uniforms, id: { value: id } },
    vertexShader: fire.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D mask;
      uniform float time;
      uniform float intensity;
      uniform float scroll;
      uniform float id;
      varying vec2 vUv;
      void main() {
        float m1 = texture2D(mask, vUv + vec2(0.0, time * scroll)).r;
        float m2 = texture2D(mask, vUv * vec2(1.0, 0.7) + vec2(0.37, time * scroll * 1.7)).r;
        float m = clamp(m1 * 0.65 + m2 * 0.55, 0.0, 1.0) * intensity;
        if (m < 0.3) discard;
        gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0);
      }
    `,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

export function makeFireMaterial(mask: THREE.Texture | null, opts: FireOptions): THREE.ShaderMaterial {
  if (mask) {
    mask.wrapS = THREE.RepeatWrapping;
    mask.wrapT = THREE.RepeatWrapping;
    mask.colorSpace = THREE.NoColorSpace;
    mask.needsUpdate = true;
  }
  const color = (c: THREE.ColorRepresentation) => new THREE.Color().setStyle(typeof c === 'string' ? c : `#${new THREE.Color(c).getHexString()}`, THREE.LinearSRGBColorSpace);
  return new THREE.ShaderMaterial({
    uniforms: {
      mask: { value: mask },
      time: { value: 0 },
      intensity: { value: 0 },
      scroll: { value: opts.scroll ?? 1.4 },
      core: { value: color(opts.core) },
      mid: { value: color(opts.mid) },
      edge: { value: color(opts.edge) },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <skinning_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv;
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        #include <project_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D mask;
      uniform float time;
      uniform float intensity;
      uniform float scroll;
      uniform vec3 core;
      uniform vec3 mid;
      uniform vec3 edge;
      varying vec2 vUv;
      void main() {
        float m1 = texture2D(mask, vUv + vec2(0.0, time * scroll)).r;
        float m2 = texture2D(mask, vUv * vec2(1.0, 0.7) + vec2(0.37, time * scroll * 1.7)).r;
        float m = clamp(m1 * 0.65 + m2 * 0.55, 0.0, 1.0) * intensity;
        if (m < 0.08) discard;
        vec3 c = m > 0.6 ? core : (m > 0.3 ? mid : edge);
        gl_FragColor = vec4(c * m, m);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}
