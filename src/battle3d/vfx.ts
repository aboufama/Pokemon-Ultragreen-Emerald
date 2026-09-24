// Move VFX in 3D, built from the stock GBA battle-animation sprites
// (public/assets/gba/battle_anims) drawn as camera-facing billboards. They are
// rendered in the 3D scene and pixelated by the viewport pass like everything
// else; sizes are given in GBA pixels at the effect's depth.

import * as THREE from 'three';
import { asset } from '../gba/assets';
import type { BattleStage } from '../render3d/stage';
import { TYPE_SHEETS } from './type_fx';

/** Object id range for effects: never palette-snapped or outlined. */
export const FX_PIXEL_ID = 9;

interface SheetInfo {
  texture: THREE.Texture;
  frames: number;
  frameW: number;
  frameH: number;
}

const loader = new THREE.TextureLoader();
const sheets = new Map<string, Promise<SheetInfo>>();
const ready = new Map<string, SheetInfo>();

function sheet(name: string): Promise<SheetInfo> {
  let p = sheets.get(name);
  if (!p) {
    p = loader.loadAsync(asset(`gba/battle_anims/${name}.png`)).then((tex) => {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.NoColorSpace;
      tex.generateMipmaps = false;
      const img = tex.image as HTMLImageElement;
      const fw = img.width;
      const fh = Math.min(img.width, img.height);
      const info = { texture: tex, frames: Math.max(1, Math.round(img.height / fh)), frameW: fw, frameH: fh };
      ready.set(name, info);
      return info;
    });
    sheets.set(name, p);
  }
  return p;
}

/** Sheets used by the standard move choreography (loaded before battles). */
export const COMMON_SHEETS = [...new Set([...TYPE_SHEETS, 'Particles', 'SmallEmber', 'Fire', 'FirePlume'])];

export function preloadSheets(names: string[] = COMMON_SHEETS): Promise<unknown> {
  return Promise.all(names.map(sheet));
}

export interface SpriteFxOptions {
  /** Size of one frame on screen in GBA pixels (default: its texture size). */
  px?: number;
  fps?: number;
  loop?: boolean;
  /** First frame of the sheet to show; with fps 0 the frame is held. */
  frame?: number;
  /** Lifetime in seconds (defaults to one pass through the frames). */
  life?: number;
  /** World-space velocity (units/s). */
  velocity?: THREE.Vector3;
  rotation?: number;
  spin?: number;
  /** Fade out over the last part of the life. */
  fade?: boolean;
  scaleFrom?: number;
  scaleTo?: number;
  /** Stick to a moving point (e.g. a mouth), read every frame. */
  follow?: () => THREE.Vector3;
  /**
   * Projectiles: turn the sprite along its flight on screen. The value is the
   * direction the sprite art points, in radians (0 = right, PI/2 = up).
   */
  orient?: number;
}

/** Id-pass shader for billboards: alpha cutout from the sheet, flat id color. */
function makeIdMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, uvTransform: { value: map.matrix }, id: { value: FX_PIXEL_ID } },
    vertexShader: /* glsl */ `
      uniform mat3 uvTransform;
      varying vec2 vUv;
      void main() {
        vUv = (uvTransform * vec3(uv, 1.0)).xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float id;
      varying vec2 vUv;
      void main() {
        if (texture2D(map, vUv).a < 0.5) discard;
        gl_FragColor = vec4(id / 255.0, 0.0, 0.0, 1.0);
      }`,
  });
}

const plane = new THREE.PlaneGeometry(1, 1);

interface Particle {
  sprite: THREE.Mesh;
  rotation: number;
  info: SheetInfo;
  age: number;
  life: number;
  fps: number;
  loop: boolean;
  startFrame: number;
  velocity: THREE.Vector3;
  spin: number;
  basePx: number;
  scaleFrom: number;
  scaleTo: number;
  fade: boolean;
  path?: (t: number) => THREE.Vector3;
  onDone?: () => void;
}

export class VfxSystem {
  readonly group = new THREE.Group();
  private readonly particles: Particle[] = [];
  private shakeTime = 0;
  private shakeAmp = 0;
  private readonly timers: { at: number; fn: () => void }[] = [];
  private clock = 0;

  constructor(private readonly stage: BattleStage) {
    this.group.userData.pixelId = FX_PIXEL_ID;
    stage.scene.add(this.group);
  }

  /** World units per GBA pixel at a point (for pixel-exact sprite sizes). */
  unitsPerPixel(at: THREE.Vector3): number {
    return this.stage.unitsPerPixel(at, this.stage.camera);
  }

  after(seconds: number, fn: () => void): void {
    this.timers.push({ at: this.clock + seconds, fn });
  }

  /** Spawn an animated billboard. Synchronous once the sheet is loaded (see preloadSheets). */
  sprite(name: string, at: THREE.Vector3, opts: SpriteFxOptions = {}): Promise<Particle> {
    const info = ready.get(name);
    if (!info) return sheet(name).then(() => this.sprite(name, at, opts));
    return Promise.resolve(this.spawn(info, at, opts));
  }

  private spawn(info: SheetInfo, at: THREE.Vector3, opts: SpriteFxOptions): Particle {
    const tex = info.texture.clone();
    tex.needsUpdate = true;
    tex.repeat.set(1, 1 / info.frames);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: false, depthTest: true });
    const sprite = new THREE.Mesh(plane, mat);
    sprite.userData.idMaterial = makeIdMaterial(tex);
    sprite.position.copy(at);
    sprite.renderOrder = 10;
    this.group.add(sprite);
    const fps = opts.fps ?? 15;
    const held = fps === 0;
    const p: Particle = {
      sprite,
      rotation: opts.rotation ?? 0,
      info,
      age: 0,
      life: opts.life ?? (held ? 0.5 : info.frames / fps),
      fps,
      loop: opts.loop ?? false,
      startFrame: opts.frame ?? 0,
      velocity: opts.velocity ?? new THREE.Vector3(),
      spin: opts.spin ?? 0,
      basePx: opts.px ?? info.frameW,
      scaleFrom: opts.scaleFrom ?? 1,
      scaleTo: opts.scaleTo ?? 1,
      fade: opts.fade ?? false,
      path: opts.follow ? () => opts.follow!() : undefined,
    };
    this.particles.push(p);
    this.updateParticle(p, 0);
    return p;
  }

  private spawnSync(name: string, at: THREE.Vector3, opts: SpriteFxOptions): Particle | null {
    const info = ready.get(name);
    return info ? this.spawn(info, at, opts) : null;
  }

  /** A sprite that travels along a path from `from` to `to`; resolves on arrival. */
  projectile(name: string, from: THREE.Vector3, to: THREE.Vector3, duration: number, opts: SpriteFxOptions & { arc?: number } = {}): Promise<void> {
    return new Promise((resolve) => {
      const attach = (p: Particle) => {
        const arc = opts.arc ?? 0;
        p.path = (t) => {
          const v = from.clone().lerp(to, t);
          v.y += Math.sin(Math.PI * t) * arc;
          return v;
        };
        p.onDone = resolve;
      };
      let rotation = opts.rotation;
      if (opts.orient !== undefined) {
        const a = from.clone().project(this.stage.camera);
        const b = to.clone().project(this.stage.camera);
        rotation = Math.atan2(b.y - a.y, (b.x - a.x) * 1.5) - opts.orient;
      }
      const p = this.spawnSync(name, from, { ...opts, rotation, loop: true, life: duration });
      if (p) attach(p);
      else void this.sprite(name, from, { ...opts, rotation, loop: true, life: duration }).then(attach);
    });
  }

  shake(amplitude: number, seconds: number): void {
    this.shakeAmp = Math.max(this.shakeAmp, amplitude);
    this.shakeTime = Math.max(this.shakeTime, seconds);
  }

  private updateParticle(p: Particle, dt: number): boolean {
    p.age += dt;
    const t = Math.min(1, p.age / p.life);
    if (p.path) p.sprite.position.copy(p.path(t));
    else p.sprite.position.addScaledVector(p.velocity, dt);
    const n = p.info.frames;
    const step = Math.floor(p.age * p.fps);
    const frame = (p.startFrame + (p.loop ? step % n : Math.min(n - 1 - p.startFrame, step))) % n;
    const mat = p.sprite.material as THREE.MeshBasicMaterial;
    const map = mat.map!;
    // Sheets run top to bottom; flipY puts frame 0 at the top of the texture.
    map.offset.set(0, 1 - (frame + 1) / p.info.frames);
    map.updateMatrix();
    const s = p.scaleFrom + (p.scaleTo - p.scaleFrom) * t;
    const upp = this.unitsPerPixel(p.sprite.position);
    p.sprite.scale.set(p.basePx * upp * s, p.basePx * (p.info.frameH / p.info.frameW) * upp * s, 1);
    // Billboard: face the camera, spin about the view axis.
    p.rotation += p.spin * dt;
    p.sprite.quaternion.copy(this.stage.camera.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), p.rotation));
    if (p.fade) {
      // Pixel art has no partial alpha: fade by thinning (dithered cutout would
      // need a shader); shrink instead.
      const k = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      p.sprite.scale.multiplyScalar(0.5 + 0.5 * k);
    }
    return p.age < p.life;
  }

  update(dt: number): void {
    this.clock += dt;
    for (let i = this.timers.length - 1; i >= 0; i--) {
      if (this.timers[i].at <= this.clock) {
        const fn = this.timers[i].fn;
        this.timers.splice(i, 1);
        fn();
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!this.updateParticle(p, dt)) {
        this.group.remove(p.sprite);
        const m = p.sprite.material as THREE.MeshBasicMaterial;
        m.map?.dispose();
        m.dispose();
        (p.sprite.userData.idMaterial as THREE.Material).dispose();
        this.particles.splice(i, 1);
        p.onDone?.();
      }
    }
    // Camera shake around the home camera.
    const cam = this.stage.camera;
    cam.position.copy(this.stage.homeCamera.position);
    cam.quaternion.copy(this.stage.homeCamera.quaternion);
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const a = this.shakeAmp * Math.max(0, Math.min(1, this.shakeTime * 4));
      cam.position.x += (Math.random() * 2 - 1) * a;
      cam.position.y += (Math.random() * 2 - 1) * a * 0.5;
      if (this.shakeTime <= 0) this.shakeAmp = 0;
    }
  }

  get busy(): boolean {
    return this.particles.length > 0 || this.timers.length > 0;
  }
}
