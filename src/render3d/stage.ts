// The 3D battle stage: calibrated camera, projected environment, battler slots
// and the pixel pipeline. Screen-space numbers are GBA pixels (240x160).

import * as THREE from 'three';
import cameraJson from '../data/battle_camera.json';
import { BattleEnvironment } from './environment';
import { PixelPipeline, type PixelSettings } from './pipeline';

export type SlotName = 'player' | 'enemy';

export interface BattleCameraSpec {
  /** Vertical field of view in degrees. */
  fov: number;
  /** Camera height above the ground plane (world units). */
  height: number;
  /** Downward pitch in degrees. */
  pitch: number;
  /** Yaw in degrees (0 = looking along +Z). */
  yaw: number;
  /** Where each battler stands, as the GBA pixel its feet project to. */
  anchors: Record<SlotName, [number, number]>;
  /** Platform ellipse centers in the GBA background (for the extended backdrop). */
  platforms: Record<SlotName, [number, number]>;
}

export const BATTLE_CAMERA: BattleCameraSpec = cameraJson as BattleCameraSpec;

export function makeBattleCamera(spec: BattleCameraSpec): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(spec.fov, 240 / 160, 0.05, 200);
  cam.position.set(0, spec.height, 0);
  cam.rotation.order = 'YXZ';
  // three.js cameras look down -Z; yaw 180 turns them to look along +Z.
  cam.rotation.set(THREE.MathUtils.degToRad(-spec.pitch), THREE.MathUtils.degToRad(180 + spec.yaw), 0);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  return cam;
}

/** Intersect the view ray through GBA pixel (x, y) with the ground plane y = 0. */
export function groundPointAt(cam: THREE.PerspectiveCamera, x: number, y: number): THREE.Vector3 {
  const ndc = new THREE.Vector3((x / 240) * 2 - 1, 1 - (y / 160) * 2, 0.5);
  const dir = ndc.unproject(cam).sub(cam.position).normalize();
  const t = -cam.position.y / dir.y;
  return cam.position.clone().addScaledVector(dir, t);
}

/** Project a world point to GBA pixel coordinates. */
export function toScreen(cam: THREE.PerspectiveCamera, p: THREE.Vector3): [number, number] {
  const v = p.clone().project(cam);
  return [(v.x * 0.5 + 0.5) * 240, (0.5 - v.y * 0.5) * 160];
}

export class BattleStage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  /** The calibrated resting camera; `camera` may move during attacks. */
  readonly homeCamera: THREE.PerspectiveCamera;
  readonly camera: THREE.PerspectiveCamera;
  readonly pipeline: PixelPipeline;
  readonly slots: Record<SlotName, THREE.Group>;
  environment: BattleEnvironment | null = null;
  readonly keyLight: THREE.DirectionalLight;
  readonly ambient: THREE.HemisphereLight;

  constructor(readonly canvas: HTMLCanvasElement, readonly spec: BattleCameraSpec = BATTLE_CAMERA, pixel: Partial<PixelSettings> = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(1);
    this.pipeline = new PixelPipeline(this.renderer, pixel);
    this.renderer.setSize(this.pipeline.outWidth, this.pipeline.outHeight, false);

    this.homeCamera = makeBattleCamera(spec);
    this.camera = this.homeCamera.clone();

    // Sprites are shaded as if lit from the upper left of the screen; keep the
    // key light fixed in camera space so both battlers read that way.
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    this.ambient = new THREE.HemisphereLight(0xffffff, 0xb8b0c0, 1.35);
    this.scene.add(this.keyLight, this.keyLight.target, this.ambient);
    this.updateLightFromCamera();

    this.slots = { player: new THREE.Group(), enemy: new THREE.Group() };
    for (const name of ['player', 'enemy'] as SlotName[]) {
      const g = this.slots[name];
      g.name = `slot-${name}`;
      g.position.copy(groundPointAt(this.homeCamera, ...spec.anchors[name]));
      this.scene.add(g);
    }
    // Face each other by default.
    this.slots.player.lookAt(this.slots.enemy.position.x, 0, this.slots.enemy.position.z);
    this.slots.enemy.lookAt(this.slots.player.position.x, 0, this.slots.player.position.z);
  }

  updateLightFromCamera(): void {
    const cam = this.homeCamera;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    const back = new THREE.Vector3(0, 0, 1).applyQuaternion(cam.quaternion);
    const dir = new THREE.Vector3().addScaledVector(right, -0.55).addScaledVector(up, 0.9).addScaledVector(back, 0.45).normalize();
    this.keyLight.position.copy(dir.multiplyScalar(20));
    this.keyLight.target.position.set(0, 0, 0);
  }

  async setEnvironment(name: string): Promise<void> {
    if (this.environment) this.scene.remove(this.environment.group);
    const env = await BattleEnvironment.load({
      name,
      enemyPlatform: { cx: this.spec.platforms.enemy[0], cy: this.spec.platforms.enemy[1] },
      playerPlatform: { cx: this.spec.platforms.player[0], cy: this.spec.platforms.player[1] },
    });
    env.setProjectionCamera(this.homeCamera);
    this.environment = env;
    this.scene.add(env.group);
  }

  /** World units per GBA pixel at a point, seen from the resting camera. */
  unitsPerPixel(at: THREE.Vector3, camera: THREE.PerspectiveCamera = this.homeCamera): number {
    const depth = at.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3()));
    return (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / 160;
  }

  resetCamera(): void {
    this.camera.copy(this.homeCamera);
  }

  render(): void {
    this.pipeline.render(this.scene, this.camera);
  }
}
