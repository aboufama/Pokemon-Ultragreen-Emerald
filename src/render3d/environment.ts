// Battle environment as a 3D ground plane textured by projecting the original
// GBA BG3 image from the calibrated battle camera. At the default camera the
// ground is pixel-identical to Emerald; when the camera moves (big attacks)
// it behaves like real ground.
//
// The intro effects of battle_intro.c are emulated in the same shader: the
// scanline-split slide of BG3, the scrolling "entry" layer (BG1, e.g. the
// tall grass band) and the white palette fade of the Poké Ball flash.
//
// The arena's life is drawn here too, in GBA pixels so it stays crisp: grass
// tufts swaying and wind rolling over grass platforms, drifting cloud
// shadows, glints on water, caustics underwater, and a backdrop tint for big
// moves (as Emerald's move animations fade the battle background).

import * as THREE from 'three';
import { type Bitmap, createBitmap, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { GFX_META } from '../data';

/** Rows 0-111 are visible above the text box; we extend the art below it. */
export const BG_VISIBLE_HEIGHT = 112;
const EXT_HEIGHT = 224;
const W = 240;
/**
 * The backdrop gets one extra column holding each row's stripe color: BG3 is
 * a 512px wide map whose off-screen half is plain stripes, which is what the
 * intro slide (and a moving camera) reveals beyond the screen edges.
 */
const STRIPE_COLUMN = W;

function rowMode(bmp: Bitmap, y: number): number {
  const counts = new Map<number, number>();
  let best = 0, bestN = -1;
  for (let x = 0; x < W; x++) {
    const i = (y * bmp.width + x) * 4;
    const key = (bmp.data[i] << 16) | (bmp.data[i + 1] << 8) | bmp.data[i + 2];
    const n = (counts.get(key) ?? 0) + 1;
    counts.set(key, n);
    if (n > bestN) { best = key; bestN = n; }
  }
  return best;
}

/**
 * Build the extended backdrop: the visible BG3 rows, the stripe pattern
 * continued downward, the player platform completed by copying the
 * (identical) opponent platform ellipse, and the stripe column.
 */
export function extendBackdrop(bg3: Bitmap, enemyPlatform: { cx: number; cy: number }, playerPlatform: { cx: number; cy: number }): Bitmap {
  const out = createBitmap(W + 1, EXT_HEIGHT);
  const stride = out.width * 4;
  // Base: visible rows as-is.
  for (let y = 0; y < BG_VISIBLE_HEIGHT; y++) out.data.set(bg3.data.subarray(y * bg3.width * 4, y * bg3.width * 4 + W * 4), y * stride);
  // Continue the 4-row stripe period of the lower BG rows.
  for (let y = BG_VISIBLE_HEIGHT; y < EXT_HEIGHT; y++) {
    const srcY = BG_VISIBLE_HEIGHT - 16 + ((y - BG_VISIBLE_HEIGHT) % 4);
    for (let x = 0; x < W; x++) {
      const si = (srcY * bg3.width + 0) * 4; // stripe rows are uniform; use column 0
      out.data.set(bg3.data.subarray(si, si + 4), y * stride + x * 4);
    }
  }
  // Copy the opponent platform's non-stripe pixels to the player platform.
  const stripe = new Set<number>();
  for (let y = 0; y < BG_VISIBLE_HEIGHT; y++) {
    const i = (y * bg3.width) * 4;
    stripe.add((bg3.data[i] << 16) | (bg3.data[i + 1] << 8) | bg3.data[i + 2]);
  }
  const dx = Math.round(playerPlatform.cx - enemyPlatform.cx);
  const dy = Math.round(playerPlatform.cy - enemyPlatform.cy);
  for (let y = Math.floor(enemyPlatform.cy - 20); y < enemyPlatform.cy + 20; y++) {
    for (let x = Math.floor(enemyPlatform.cx - 70); x < enemyPlatform.cx + 70; x++) {
      if (x < 0 || x >= W || y < 0 || y >= BG_VISIBLE_HEIGHT) continue;
      const si = (y * bg3.width + x) * 4;
      const key = (bg3.data[si] << 16) | (bg3.data[si + 1] << 8) | bg3.data[si + 2];
      if (stripe.has(key)) continue;
      const tx = x + dx, ty = y + dy;
      if (tx < 0 || tx >= W || ty < 0 || ty >= EXT_HEIGHT) continue;
      out.data.set(bg3.data.subarray(si, si + 4), ty * stride + tx * 4);
    }
  }
  for (let y = 0; y < EXT_HEIGHT; y++) {
    const key = rowMode(out, y);
    const i = y * stride + STRIPE_COLUMN * 4;
    out.data[i] = key >> 16;
    out.data[i + 1] = (key >> 8) & 255;
    out.data[i + 2] = key & 255;
  }
  for (let i = 3; i < out.data.length; i += 4) out.data[i] = 255;
  return out;
}

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
  uniform mat4 projView;
  uniform vec2 mapSize;
  uniform float slide;
  uniform float whiteout;
  uniform sampler2D entryMap;
  uniform vec2 entrySize;
  uniform vec2 entryScroll;
  uniform bool entryOn;
  uniform float time;
  uniform float gust;
  uniform vec2 windOffset;
  uniform float grassWaves;
  uniform float clouds;
  uniform float glints;
  uniform float caustics;
  uniform vec3 tintColor;
  uniform float tintAmount;
  uniform vec3 arena;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float bayer(vec2 p) {
    vec2 q = mod(p, 4.0);
    float x = q.x, y = q.y;
    // 4x4 ordered dither thresholds in (0, 1).
    float b = mod(x, 2.0) * 2.0 + mod(y, 2.0) * 3.0 - 2.0 * mod(x, 2.0) * mod(y, 2.0);
    float c = mod(floor(x / 2.0), 2.0) * 2.0 + mod(floor(y / 2.0), 2.0) * 3.0 - 2.0 * mod(floor(x / 2.0), 2.0) * mod(floor(y / 2.0), 2.0);
    return (b * 4.0 + c + 0.5) / 16.0;
  }
  vec4 backdrop(vec2 px) {
    return texture2D(map, (px + 0.5) / mapSize);
  }
  bool isPlatform(vec4 c, vec2 px) {
    vec3 stripe = texture2D(map, (vec2(${STRIPE_COLUMN}.0, px.y) + 0.5) / mapSize).rgb;
    return distance(c.rgb, stripe) > 0.02;
  }

  void main() {
    vec4 clip = projView * vec4(vWorld, 1.0);
    vec2 ndc = clip.xy / clip.w;
    // GBA pixel coordinates, y down.
    vec2 screen = floor(vec2((ndc.x * 0.5 + 0.5) * 240.0, (0.5 - ndc.y * 0.5) * 160.0));
    // BattleIntroSlide1's scanline split: BG3HOFS = +d for the top half and
    // -d for the bottom half, so the opponent's side enters from the left and
    // the player's side from the right.
    vec2 px = screen;
    px.x += px.y < 80.0 ? slide : -slide;
    if (px.x < 0.0 || px.x >= ${W}.0) px.x = ${STRIPE_COLUMN}.0;
    px.y = clamp(px.y, 0.0, mapSize.y - 1.0);
    vec4 c = backdrop(px);
    bool platform = px.x < ${STRIPE_COLUMN}.0 && isPlatform(c, px);
    if (platform && grassWaves > 0.0) {
      // Tufts lean with the wind: inside the platform, sample one pixel
      // upwind where the wind is strong (the ellipse edge stays put).
      float lean = sin(time * 2.3 + px.y * 0.9 + px.x * 0.05) * 0.5 + gust;
      if (lean > 0.9) {
        vec2 q = px + vec2(-1.0, 0.0);
        vec4 n = backdrop(q);
        if (isPlatform(n, q)) c = n;
      }
      // Wind rolling over the grass: lighter bands travelling downwind.
      float w = sin(vWorld.x * 2.2 + vWorld.z * 0.8 - time * 2.6) * sin(vWorld.x * 0.7 - time * 0.9);
      if (w * (0.5 + gust) > 0.55 && bayer(screen) < 0.5) c.rgb = min(c.rgb * 1.09 + 0.02, 1.0);
    }
    if (platform && glints > 0.0) {
      float h = hash(floor(px / 2.0) + floor(time * 5.0) * 7.13);
      if (h > 0.992) c.rgb = mix(c.rgb, vec3(1.0), 0.8);
    }
    if (caustics > 0.0) {
      // Light rippling across the sea floor (the arena only; far away it would streak).
      vec2 p = vWorld.xz * 3.0;
      float k = abs(sin(p.x + time * 0.9 + sin(p.y * 1.3 + time * 0.6)) + sin(p.y * 1.1 - time * 0.7 + sin(p.x * 0.9)));
      float near = 1.0 - smoothstep(arena.z * 0.7, arena.z * 1.1, distance(vWorld.xz, arena.xy));
      if (k < 0.18 * near && bayer(screen) < 0.7) c.rgb = min(c.rgb * 1.12 + 0.03, 1.0);
    }
    if (clouds > 0.0) {
      // Cloud shadows drifting with the wind across the arena floor (not the
      // far field, where they would streak), edges dithered, a cool shade.
      float n = noise(vWorld.xz * 0.11 + windOffset) * 0.7 + noise(vWorld.xz * 0.3 + windOffset * 1.7) * 0.3;
      float near = 1.0 - smoothstep(arena.z * 0.8, arena.z * 1.3, distance(vWorld.xz, arena.xy));
      float shade = smoothstep(0.56, 0.6, n) * near;
      if (shade > bayer(screen)) c.rgb *= vec3(1.0 - clouds, 1.0 - clouds * 0.85, 1.0 - clouds * 0.6);
    }
    if (entryOn) {
      // BG1 entry layer: a 256px wide wrapping map, transparent outside its rows.
      vec2 e = vec2(mod(screen.x + entryScroll.x, entrySize.x), screen.y + entryScroll.y);
      if (e.y >= 0.0 && e.y < entrySize.y) {
        vec4 ec = texture2D(entryMap, (floor(e) + 0.5) / entrySize);
        if (ec.a > 0.5) c = ec;
      }
    }
    c.rgb = mix(c.rgb, tintColor, tintAmount);
    gl_FragColor = vec4(mix(c.rgb, vec3(1.0), whiteout), 1.0);
  }
`;

export interface EnvironmentOptions {
  name: string;
  enemyPlatform: { cx: number; cy: number };
  playerPlatform: { cx: number; cy: number };
}

function nearestTexture(bmp: Bitmap): THREE.DataTexture {
  const tex = new THREE.DataTexture(bmp.data, bmp.width, bmp.height, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.NoColorSpace;
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
}

export class BattleEnvironment {
  readonly group = new THREE.Group();
  private material: THREE.ShaderMaterial;

  private constructor(readonly backdrop: Bitmap, texture: THREE.DataTexture, entry: Bitmap | null) {
    const entryTex = entry ? nearestTexture(entry) : null;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        projView: { value: new THREE.Matrix4() },
        mapSize: { value: new THREE.Vector2(backdrop.width, backdrop.height) },
        slide: { value: 0 },
        whiteout: { value: 0 },
        entryMap: { value: entryTex },
        entrySize: { value: new THREE.Vector2(entry?.width ?? 1, entry?.height ?? 1) },
        entryScroll: { value: new THREE.Vector2() },
        entryOn: { value: false },
        time: { value: 0 },
        gust: { value: 0 },
        windOffset: { value: new THREE.Vector2() },
        grassWaves: { value: 0 },
        clouds: { value: 0 },
        glints: { value: 0 },
        caustics: { value: 0 },
        tintColor: { value: new THREE.Color(0, 0, 0) },
        tintAmount: { value: 0 },
        arena: { value: new THREE.Vector3(0, 0, 1000) },
      },
      vertexShader,
      fragmentShader,
      depthWrite: true,
    });
    this.hasEntry = !!entry;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), this.material);
    ground.name = 'ground';
    ground.renderOrder = -1;
    this.group.add(ground);
  }

  readonly hasEntry: boolean;

  static async load(opts: EnvironmentOptions): Promise<BattleEnvironment> {
    const env = GFX_META.environments[opts.name];
    const [bg3, entry] = await Promise.all([
      loadBitmap(asset(`gba/${env.image}`)),
      env.entryImage ? loadBitmap(asset(`gba/${env.entryImage}`)) : Promise.resolve(null),
    ]);
    const ext = extendBackdrop(bg3, opts.enemyPlatform, opts.playerPlatform);
    return new BattleEnvironment(ext, nearestTexture(ext), entry);
  }

  /** Horizontal intro slide offset in GBA pixels (240 -> 0). */
  set slide(px: number) {
    this.material.uniforms.slide.value = px;
  }

  /** 0..1 blend of the backdrop toward white (ball-open flash). */
  set whiteout(v: number) {
    this.material.uniforms.whiteout.value = v;
  }

  /** Show the entry (BG1) layer scrolled by (BG1HOFS, BG1VOFS). */
  setEntry(visible: boolean, scrollX = 0, scrollY = 0): void {
    const u = this.material.uniforms;
    u.entryOn.value = visible && this.hasEntry;
    u.entryScroll.value.set(scrollX, scrollY);
  }

  /** Ground effects of the environment's ambience (see src/render3d/ambience.ts). */
  setGroundEffects(fx: { grassWaves?: boolean; clouds?: number; glints?: boolean; caustics?: boolean }): void {
    const u = this.material.uniforms;
    u.grassWaves.value = fx.grassWaves ? 1 : 0;
    u.clouds.value = fx.clouds ?? 0;
    u.glints.value = fx.glints ? 1 : 0;
    u.caustics.value = fx.caustics ? 1 : 0;
  }

  /** The arena floor: center (x, z) and radius, where ground effects are strongest. */
  setArena(center: THREE.Vector3, radius: number): void {
    this.material.uniforms.arena.value.set(center.x, center.z, radius);
  }

  /** Advance the ground effects: time, gust (0..1), wind drift (world units). */
  tick(time: number, gust: number, windDrift: THREE.Vector2): void {
    const u = this.material.uniforms;
    u.time.value = time;
    u.gust.value = gust;
    u.windOffset.value.copy(windDrift);
  }

  /** Blend the backdrop toward a color (0..1), like a move animation's BG fade. */
  setTint(color: THREE.Color, amount: number): void {
    this.material.uniforms.tintColor.value.copy(color);
    this.material.uniforms.tintAmount.value = amount;
  }

  /**
   * How shaded a ground point is by the drifting clouds (0 = sun, 1 = full
   * shadow), matching the shader's pattern, to dim battlers standing in it.
   */
  cloudShadeAt(p: THREE.Vector3): number {
    const u = this.material.uniforms;
    if (!u.clouds.value) return 0;
    const hash = (x: number, y: number) => {
      const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
    const noise = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
      return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
    };
    const w = u.windOffset.value as THREE.Vector2;
    const n = noise(p.x * 0.11 + w.x, p.z * 0.11 + w.y) * 0.7 + noise(p.x * 0.3 + w.x * 1.7, p.z * 0.3 + w.y * 1.7) * 0.3;
    const t = Math.min(1, Math.max(0, (n - 0.56) / 0.04));
    return t * t * (3 - 2 * t);
  }

  /** Project the backdrop from this (default, calibrated) camera. */
  setProjectionCamera(camera: THREE.PerspectiveCamera): void {
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    this.material.uniforms.projView.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }
}
