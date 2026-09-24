// A Pokémon's shadow on the ground: an ellipse that darkens whatever it lies
// on (multiply blend) with a dithered edge in GBA pixels, so it reads as
// pixel art. It shrinks and fades as the Pokémon leaves the ground, which is
// what makes leaps and landings read.

import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float strength;
  uniform float pixelScale;
  uniform vec3 shade;
  varying vec2 vUv;
  float bayer(vec2 p) {
    vec2 q = mod(p, 4.0);
    float x = q.x, y = q.y;
    float b = mod(x, 2.0) * 2.0 + mod(y, 2.0) * 3.0 - 2.0 * mod(x, 2.0) * mod(y, 2.0);
    float c = mod(floor(x / 2.0), 2.0) * 2.0 + mod(floor(y / 2.0), 2.0) * 3.0 - 2.0 * mod(floor(x / 2.0), 2.0) * mod(floor(y / 2.0), 2.0);
    return (b * 4.0 + c + 0.5) / 16.0;
  }
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float a = strength * (1.0 - smoothstep(0.45, 1.0, r));
    if (a < bayer(floor(gl_FragCoord.xy / pixelScale)) || r > 1.0) discard;
    gl_FragColor = vec4(shade, 1.0);
  }
`;

export class GroundShadow {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;

  constructor(pixelScale: number, darkness = 0.72) {
    this.material = new THREE.ShaderMaterial({
      uniforms: { strength: { value: 1 }, pixelScale: { value: pixelScale }, shade: { value: new THREE.Color(darkness, darkness, darkness * 1.08) } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      // Multiply: result = shadow color x what is already on the ground.
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.DstColorFactor,
      blendDst: THREE.ZeroFactor,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), this.material);
    this.mesh.renderOrder = 1;
    this.mesh.name = 'ground-shadow';
  }

  /** Place under a point (in the parent's frame) with radii in world units. */
  update(x: number, z: number, yaw: number, radiusX: number, radiusZ: number, strength: number): void {
    this.mesh.position.set(x, 0.004, z);
    this.mesh.rotation.set(0, yaw, 0);
    this.mesh.scale.set(radiusX * 2, 1, radiusZ * 2);
    this.material.uniforms.strength.value = strength;
    this.mesh.visible = strength > 0.02;
  }
}
