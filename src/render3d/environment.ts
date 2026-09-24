// Battle environment as a 3D ground plane textured by projecting the original
// GBA BG3 image from the calibrated battle camera. At the default camera the
// ground is pixel-identical to Emerald; when the camera moves (big attacks)
// it behaves like real ground.

import * as THREE from 'three';
import { type Bitmap, createBitmap, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { GFX_META } from '../data';

/** Rows 0-111 are visible above the text box; we extend the art below it. */
export const BG_VISIBLE_HEIGHT = 112;
const EXT_HEIGHT = 224;

/**
 * Build the extended backdrop: the visible BG3 rows, the stripe pattern
 * continued downward, and the player platform completed by copying the
 * (identical) opponent platform ellipse.
 */
export function extendBackdrop(bg3: Bitmap, enemyPlatform: { cx: number; cy: number }, playerPlatform: { cx: number; cy: number }): Bitmap {
  const out = createBitmap(240, EXT_HEIGHT);
  const W = 240;
  // Base: visible rows as-is.
  for (let y = 0; y < BG_VISIBLE_HEIGHT; y++) out.data.set(bg3.data.subarray(y * bg3.width * 4, y * bg3.width * 4 + W * 4), y * W * 4);
  // Continue the 4-row stripe period of the lower BG rows.
  for (let y = BG_VISIBLE_HEIGHT; y < EXT_HEIGHT; y++) {
    const srcY = BG_VISIBLE_HEIGHT - 16 + ((y - BG_VISIBLE_HEIGHT) % 4);
    for (let x = 0; x < W; x++) {
      const si = (srcY * bg3.width + 0) * 4; // stripe rows are uniform; use column 0
      out.data.set(bg3.data.subarray(si, si + 4), (y * W + x) * 4);
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
      out.data.set(bg3.data.subarray(si, si + 4), (ty * W + tx) * 4);
    }
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
  varying vec3 vWorld;
  void main() {
    vec4 clip = projView * vec4(vWorld, 1.0);
    vec2 ndc = clip.xy / clip.w;
    // GBA pixel coordinates, y down.
    vec2 px = vec2((ndc.x * 0.5 + 0.5) * 240.0, (0.5 - ndc.y * 0.5) * 160.0);
    px = clamp(floor(px), vec2(0.0), mapSize - 1.0);
    gl_FragColor = texture2D(map, (px + 0.5) / mapSize);
  }
`;

export interface EnvironmentOptions {
  name: string;
  enemyPlatform: { cx: number; cy: number };
  playerPlatform: { cx: number; cy: number };
}

export class BattleEnvironment {
  readonly group = new THREE.Group();
  private material: THREE.ShaderMaterial;

  private constructor(readonly backdrop: Bitmap, texture: THREE.DataTexture) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        projView: { value: new THREE.Matrix4() },
        mapSize: { value: new THREE.Vector2(backdrop.width, backdrop.height) },
      },
      vertexShader,
      fragmentShader,
      depthWrite: true,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), this.material);
    ground.name = 'ground';
    ground.renderOrder = -1;
    this.group.add(ground);
  }

  static async load(opts: EnvironmentOptions): Promise<BattleEnvironment> {
    const env = GFX_META.environments[opts.name];
    const bg3 = await loadBitmap(asset(`gba/${env.image}`));
    const ext = extendBackdrop(bg3, opts.enemyPlatform, opts.playerPlatform);
    const tex = new THREE.DataTexture(ext.data, ext.width, ext.height, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.NoColorSpace;
    tex.flipY = false;
    tex.needsUpdate = true;
    return new BattleEnvironment(ext, tex);
  }

  /** Project the backdrop from this (default, calibrated) camera. */
  setProjectionCamera(camera: THREE.PerspectiveCamera): void {
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    this.material.uniforms.projView.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }
}
