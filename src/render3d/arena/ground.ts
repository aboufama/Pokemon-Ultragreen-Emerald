// The arena floor: a ground plane carrying the arena's painted ground, which
// was painted pixel by pixel for the battle camera and is projected from it,
// so at rest every painted pixel is one GBA pixel and when the camera shakes
// it behaves like real ground.
//
// The ground's life is computed per GBA pixel (at the pixel's own ground
// point) so it stays crisp: grass leaning and rippling in the wind, waves
// drifting across water with glints and ripples at the battlers' feet, and
// cloud shadows.

import * as THREE from 'three';
import { MAT, type Paint } from './art';

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform vec2 mapOrigin;
  uniform vec2 mapSize;
  uniform mat4 projView;
  uniform mat4 invProjView;
  uniform float time;
  uniform float gust;
  uniform vec2 windOffset;
  uniform float grassWaves;
  uniform float clouds;
  uniform float glints;
  uniform vec3 arena;
  uniform vec3 waveLight;
  uniform vec3 waveDark;
  uniform float waveDensity;
  uniform vec4 feet[2];
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float bayer(vec2 p) {
    vec2 q = mod(p, 4.0);
    float b = mod(q.x, 2.0) * 2.0 + mod(q.y, 2.0) * 3.0 - 2.0 * mod(q.x, 2.0) * mod(q.y, 2.0);
    float c = mod(floor(q.x / 2.0), 2.0) * 2.0 + mod(floor(q.y / 2.0), 2.0) * 3.0 - 2.0 * mod(floor(q.x / 2.0), 2.0) * mod(floor(q.y / 2.0), 2.0);
    return (b * 4.0 + c + 0.5) / 16.0;
  }
  vec4 painted(vec2 screen) {
    vec2 p = clamp(screen - mapOrigin, vec2(0.0), mapSize - 1.0);
    return texture2D(map, (p + 0.5) / mapSize);
  }
  int materialOf(vec4 t) { return int(t.a * 255.0 + 0.5); }
  // The ground point seen through the center of a GBA pixel from the resting camera.
  vec3 groundAt(vec2 screen) {
    vec2 ndc = vec2((screen.x + 0.5) / 240.0 * 2.0 - 1.0, 1.0 - (screen.y + 0.5) / 160.0 * 2.0);
    vec4 a = invProjView * vec4(ndc, -1.0, 1.0);
    vec4 b = invProjView * vec4(ndc, 1.0, 1.0);
    vec3 p0 = a.xyz / a.w, p1 = b.xyz / b.w;
    float t = p0.y / (p0.y - p1.y);
    return mix(p0, p1, t);
  }
  vec2 toScreen(vec3 w) {
    vec4 c = projView * vec4(w, 1.0);
    vec2 n = c.xy / c.w;
    return vec2((n.x * 0.5 + 0.5) * 240.0, (0.5 - n.y * 0.5) * 160.0);
  }

  // Waves: short light dashes drifting across the water, one per cell of a
  // world grid, each a whole number of pixels long for its distance.
  float waveDash(vec2 screen, vec3 w, float cellX, float cellZ, float speed, float len, float seed) {
    vec2 drift = vec2(time * speed, time * speed * 0.18);
    vec2 g = (w.xz + drift) / vec2(cellX, cellZ);
    float hit = 0.0;
    for (int dz = -1; dz <= 1; dz++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cell = floor(g) + vec2(float(dx), float(dz));
        float r = hash(cell + seed);
        if (r > waveDensity) continue;
        vec2 local = vec2(hash(cell + seed + 3.1), hash(cell + seed + 7.7));
        vec2 mp = (cell + local) * vec2(cellX, cellZ) - drift;
        vec2 s = toScreen(vec3(mp.x, 0.0, mp.y));
        // Dash length scales with nearness; it grows and shrinks over its life.
        float px = abs(toScreen(vec3(mp.x + len, 0.0, mp.y)).x - s.x);
        float life = sin(fract(time * 0.35 + r * 5.0) * 3.14159);
        float hl = floor(px * 0.5 * life + 0.5);
        if (floor(s.y) == screen.y && abs(screen.x - floor(s.x)) <= hl && hl >= 1.0) hit = 1.0;
      }
    }
    return hit;
  }

  void main() {
    vec4 clip = projView * vec4(vWorld, 1.0);
    vec2 ndc = clip.xy / clip.w;
    vec2 screen = floor(vec2((ndc.x * 0.5 + 0.5) * 240.0, (0.5 - ndc.y * 0.5) * 160.0));
    vec3 w = groundAt(screen);
    vec4 t = painted(screen);
    int mat = materialOf(t);
    vec3 c = t.rgb;
    float near = 1.0 - smoothstep(arena.z * 0.8, arena.z * 1.4, distance(w.xz, arena.xy));

    if (mat == ${MAT.GRASS} && grassWaves > 0.0) {
      // Blades lean with the wind: where it blows hard, take the pixel upwind.
      float lean = sin(time * 2.3 + screen.y * 0.9 + screen.x * 0.05) * 0.5 + gust;
      if (lean > 0.9) {
        vec4 n = painted(screen + vec2(-1.0, 0.0));
        if (materialOf(n) == ${MAT.GRASS}) c = n.rgb;
      }
      // Wind rolling over the grass: lighter bands travelling downwind.
      float wv = sin(w.x * 2.2 + w.z * 0.8 - time * 2.6) * sin(w.x * 0.7 - time * 0.9);
      if (wv * (0.5 + gust) > 0.55 && bayer(screen) < 0.5) c = min(c * 1.08 + 0.02, 1.0);
    }
    if (mat == ${MAT.WATER}) {
      if (waveDash(screen, w, 0.9, 0.45, 0.22, 0.34, 0.0) > 0.0) c = waveLight;
      else if (waveDash(screen + vec2(0.0, -1.0), w, 0.9, 0.45, 0.22, 0.34, 0.0) > 0.0) c = mix(c, waveDark, 0.6);
      if (glints > 0.0) {
        float h = hash(floor(screen / 2.0) + floor(time * 6.0) * 7.13);
        if (h > 0.9965) c = mix(c, vec3(1.0), 0.85);
      }
      // Rings spreading from the battlers' feet now and then.
      for (int i = 0; i < 2; i++) {
        vec4 f = feet[i];
        if (f.z <= 0.0) continue;
        float cyc = fract(time * 0.33 + f.w);
        float r = 0.15 + cyc * f.z;
        vec2 d = w.xz - f.xy;
        float dist = length(d * vec2(1.0, 1.35));
        vec3 wn = groundAt(screen + vec2(0.0, 1.0));
        float stp = max(0.004, length(wn.xz - w.xz));
        if (abs(dist - r) < stp * 0.75 && cyc < 0.8 && bayer(screen) < (1.0 - cyc) * 1.1) c = mix(c, waveLight, 0.75);
      }
    }
    if (clouds > 0.0 && mat != ${MAT.BACKDROP}) {
      // Cloud shadows drifting with the wind across the arena, edges dithered.
      float n = noise(w.xz * 0.11 + windOffset) * 0.7 + noise(w.xz * 0.3 + windOffset * 1.7) * 0.3;
      float s = smoothstep(0.56, 0.6, n) * near;
      if (s > bayer(screen)) c *= vec3(1.0 - clouds, 1.0 - clouds * 0.85, 1.0 - clouds * 0.6);
    }
    gl_FragColor = vec4(c, 1.0);
  }
`;

export interface GroundLook {
  /** Wave crest and trough colors on water. */
  waveLight?: readonly [number, number, number];
  waveDark?: readonly [number, number, number];
  /** Share of the water's cells that carry a drifting wave (0..1). */
  waveDensity?: number;
}

export class ArenaGround {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private readonly texture: THREE.DataTexture;

  constructor(paint: Paint, look: GroundLook) {
    this.texture = new THREE.DataTexture(paint.data, paint.width, paint.height, THREE.RGBAFormat);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.flipY = false;
    this.texture.needsUpdate = true;
    const rgb = (c: readonly [number, number, number] | undefined, d: readonly [number, number, number]) => new THREE.Vector3(...(c ?? d).map((v) => v / 255));
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.texture },
        mapOrigin: { value: new THREE.Vector2(paint.ox, paint.oy) },
        mapSize: { value: new THREE.Vector2(paint.width, paint.height) },
        projView: { value: new THREE.Matrix4() },
        invProjView: { value: new THREE.Matrix4() },
        time: { value: 0 },
        gust: { value: 0 },
        windOffset: { value: new THREE.Vector2() },
        grassWaves: { value: 0 },
        clouds: { value: 0 },
        glints: { value: 0 },
        arena: { value: new THREE.Vector3(0, 0, 1000) },
        waveLight: { value: rgb(look.waveLight, [240, 248, 255]) },
        waveDark: { value: rgb(look.waveDark, [40, 80, 160]) },
        waveDensity: { value: look.waveDensity ?? 0.2 },
        feet: { value: [new THREE.Vector4(), new THREE.Vector4()] },
      },
      vertexShader,
      fragmentShader,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), this.material);
    this.mesh.name = 'ground';
    this.mesh.renderOrder = -1;
  }

  setCamera(camera: THREE.PerspectiveCamera): void {
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    const u = this.material.uniforms;
    (u.projView.value as THREE.Matrix4).multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    (u.invProjView.value as THREE.Matrix4).copy(u.projView.value as THREE.Matrix4).invert();
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
