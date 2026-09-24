// Battle environment as a 3D ground plane textured by projecting the original
// GBA BG3 image from the calibrated battle camera. At the default camera the
// ground is pixel-identical to Emerald; when the camera moves (big attacks)
// it behaves like real ground.
//
// The intro effects of battle_intro.c are emulated in the same shader: the
// scanline-split slide of BG3, the scrolling "entry" layer (BG1, e.g. the
// tall grass band) and the white palette fade of the Poké Ball flash.

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
  varying vec3 vWorld;
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
    vec4 c = texture2D(map, (px + 0.5) / mapSize);
    if (entryOn) {
      // BG1 entry layer: a 256px wide wrapping map, transparent outside its rows.
      vec2 e = vec2(mod(screen.x + entryScroll.x, entrySize.x), screen.y + entryScroll.y);
      if (e.y >= 0.0 && e.y < entrySize.y) {
        vec4 ec = texture2D(entryMap, (floor(e) + 0.5) / entrySize);
        if (ec.a > 0.5) c = ec;
      }
    }
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

  /** Project the backdrop from this (default, calibrated) camera. */
  setProjectionCamera(camera: THREE.PerspectiveCamera): void {
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    this.material.uniforms.projView.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }
}
