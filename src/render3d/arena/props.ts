// A prop standing in the arena (a tree, a clump of tall grass, a rock): a
// quad facing the battle camera at the prop's depth, sized so each sprite
// pixel covers exactly one GBA pixel. It sways row by row in whole pixels
// (like a scanline effect), is hidden by and hides the Pokémon by depth, and
// darkens under passing cloud shadows.

import * as THREE from 'three';
import type { Sprite } from './art';
import type { ArenaView } from './view';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const common = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 size;      // sprite size in pixels
  uniform float margin;   // extra columns each side for the sway
  uniform float sway;     // sway at the top, in pixels
  uniform float phase;
  uniform float time;
  uniform float gust;
  varying vec2 vUv;
  vec4 texel() {
    vec2 q = floor(vUv * vec2(size.x + 2.0 * margin, size.y));
    float row = size.y - 1.0 - q.y;          // 0 = top row of the sprite
    float up = 1.0 - (row + 0.5) / size.y;   // 0 at the base, 1 at the top
    float wave = sin(time * 2.1 + phase) * 0.55 + sin(time * 0.9 + phase * 1.7) * 0.25 + gust * 0.7;
    float shift = floor(sway * up * up * wave + 0.5);
    float x = q.x - margin - shift;
    if (x < 0.0 || x >= size.x) return vec4(0.0);
    return texture2D(map, (vec2(x, row) + 0.5) / size);
  }
`;

const colorFragment = /* glsl */ `
  ${common}
  uniform float cloud;
  uniform vec3 cloudTint;
  float bayer(vec2 p) {
    vec2 q = mod(p, 4.0);
    float b = mod(q.x, 2.0) * 2.0 + mod(q.y, 2.0) * 3.0 - 2.0 * mod(q.x, 2.0) * mod(q.y, 2.0);
    float c = mod(floor(q.x / 2.0), 2.0) * 2.0 + mod(floor(q.y / 2.0), 2.0) * 3.0 - 2.0 * mod(floor(q.x / 2.0), 2.0) * mod(floor(q.y / 2.0), 2.0);
    return (b * 4.0 + c + 0.5) / 16.0;
  }
  void main() {
    vec4 c = texel();
    if (c.a < 0.5) discard;
    vec2 q = floor(vUv * vec2(size.x + 2.0 * margin, size.y));
    if (cloud > bayer(q)) c.rgb *= cloudTint;
    gl_FragColor = vec4(c.rgb, 1.0);
  }
`;

const idFragment = /* glsl */ `
  ${common}
  uniform float id;
  void main() {
    if (texel().a < 0.5) discard;
    gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0);
  }
`;

export interface PropSpec {
  sprite: Sprite;
  /** Ground point under the sprite's bottom-center. */
  x: number;
  z: number;
  /** Sway at the top in pixels (0: still). */
  sway?: number;
  /** Rows the sprite sinks into the ground (its base hidden). */
  sink?: number;
}

export class ArenaProp {
  readonly mesh: THREE.Mesh;
  readonly anchor: THREE.Vector3;
  private readonly uniforms: Record<string, THREE.IUniform>;

  constructor(spec: PropSpec, view: ArenaView, seed: number) {
    const s = spec.sprite;
    const margin = Math.ceil(Math.abs(spec.sway ?? 0)) + 1;
    const [ax, ay] = view.screen(spec.x, 0, spec.z);
    // Whole pixels: the bottom row sits on the row the anchor falls in.
    const bottom = Math.floor(ay) + 1 + (spec.sink ?? 0);
    const left = Math.round(ax - s.w / 2) - margin;
    const depth = view.depth(spec.x, 0, spec.z);
    const w = s.w + 2 * margin;
    const corners = [
      view.unproject(left, bottom, depth),
      view.unproject(left + w, bottom, depth),
      view.unproject(left + w, bottom - s.h, depth),
      view.unproject(left, bottom - s.h, depth),
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(corners.flatMap((c) => [c.x, c.y, c.z]), 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const tex = new THREE.DataTexture(s.data, s.w, s.h, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.NoColorSpace;
    tex.flipY = false;
    tex.needsUpdate = true;
    this.uniforms = {
      map: { value: tex },
      size: { value: new THREE.Vector2(s.w, s.h) },
      margin: { value: margin },
      sway: { value: spec.sway ?? 0 },
      phase: { value: (seed % 628) / 100 },
      time: { value: 0 },
      gust: { value: 0 },
      cloud: { value: 0 },
      cloudTint: { value: new THREE.Vector3(1, 1, 1) },
      id: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader, fragmentShader: colorFragment, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, material);
    this.mesh.name = 'arena-prop';
    this.mesh.userData.idMaterial = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader, fragmentShader: idFragment, side: THREE.DoubleSide });
    this.anchor = new THREE.Vector3(spec.x, 0, spec.z);
  }

  tick(time: number, gust: number, cloud: number, tint: THREE.Vector3): void {
    this.uniforms.time.value = time;
    this.uniforms.gust.value = gust;
    this.uniforms.cloud.value = cloud;
    (this.uniforms.cloudTint.value as THREE.Vector3).copy(tint);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    (this.mesh.userData.idMaterial as THREE.Material).dispose();
    (this.uniforms.map.value as THREE.Texture).dispose();
  }
}
