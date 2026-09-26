// The battle arena: a place painted for the battle camera (src/render3d/arena)
// with no platforms under the Pokémon, only the ground they stand on.
//
//   ground  the painted floor and far view, projected from the resting camera
//           and alive per pixel (wind in the grass, waves, lava, caustics,
//           cloud shadows; see arena/ground.ts)
//   props   trees, tall grass, rocks... standing at their depth, pixel-exact,
//           swaying (arena/props.ts)
//
// The arena's palette fades (the white flash when a Poké Ball opens, the
// backdrop tint of big moves) are drawn by the pipeline.

import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';
import { type ARENAS, paintArena } from './arena';
import { ArenaGround } from './arena/ground';
import { ArenaProp } from './arena/props';
import type { PixelPipeline } from './pipeline';

export interface EnvironmentOptions {
  name: string;
  /** The resting battle camera the arena is painted for. */
  camera: THREE.PerspectiveCamera;
  pipeline: PixelPipeline;
  /** Where the battlers stand. */
  player: THREE.Vector3;
  enemy: THREE.Vector3;
  /** Leave out the props (tools that measure the Pokémon alone). */
  props?: boolean;
}

const WHITE: RGB = [255, 255, 255];

export class BattleEnvironment {
  readonly group = new THREE.Group();
  readonly design: (typeof ARENAS)[string];
  private readonly ground: ArenaGround;
  private readonly props: ArenaProp[];
  private readonly cloudTint = new THREE.Vector3(1, 1, 1);

  private constructor(readonly name: string, private readonly pipeline: PixelPipeline, ground: ArenaGround, props: ArenaProp[], design: (typeof ARENAS)[string], private readonly feet: [THREE.Vector3, THREE.Vector3]) {
    this.design = design;
    this.ground = ground;
    this.props = props;
    this.group.add(ground.mesh);
    for (const p of props) this.group.add(p.mesh);
    this.whiteout = 0;
    this.setTint(new THREE.Color(0, 0, 0), 0);
  }

  static async load(opts: EnvironmentOptions): Promise<BattleEnvironment> {
    const { design, ctx } = paintArena(opts.name, opts.camera, opts.player, opts.enemy, { props: opts.props });
    const ground = new ArenaGround(ctx.ground, design.look ?? {});
    ground.setCamera(opts.camera);
    const props = ctx.props.map((p, i) => new ArenaProp(p, ctx.view, i * 7919 + 13));
    return new BattleEnvironment(opts.name, opts.pipeline, ground, props, design, [opts.player.clone(), opts.enemy.clone()]);
  }

  /** 0..1 fade of the arena toward white (a Poké Ball opening). */
  set whiteout(v: number) {
    this.pipeline.setEnvironmentBlend('flash', WHITE, v);
  }

  /** Blend the arena toward a color (0..1), like a move animation's BG fade. */
  setTint(color: THREE.Color, amount: number): void {
    this.pipeline.setEnvironmentBlend('tint', [color.r * 255, color.g * 255, color.b * 255], amount);
  }

  /** Ground effects of the environment's ambience (see src/render3d/ambience.ts). */
  setGroundEffects(fx: { grassWaves?: boolean; clouds?: number; glints?: boolean; caustics?: boolean; haze?: boolean }): void {
    const u = this.ground.material.uniforms;
    u.grassWaves.value = fx.grassWaves ? 1 : 0;
    u.clouds.value = fx.clouds ?? 0;
    u.glints.value = fx.glints ? 1 : 0;
    u.caustics.value = fx.caustics ? 1 : 0;
    u.haze.value = fx.haze ? 1 : 0;
    this.cloudTint.set(1 - u.clouds.value, 1 - u.clouds.value * 0.85, 1 - u.clouds.value * 0.6);
    const reach = this.design.ripples ?? 0;
    this.feet.forEach((f, i) => (u.feet.value as THREE.Vector4[])[i].set(f.x, f.z, reach, i * 0.47));
  }

  /** The arena floor: center (x, z) and radius, where ground effects are strongest. */
  setArena(center: THREE.Vector3, radius: number): void {
    this.ground.material.uniforms.arena.value.set(center.x, center.z, radius);
  }

  /** Advance the arena's life: time, gust (0..1), wind drift (world units). */
  tick(time: number, gust: number, windDrift: THREE.Vector2): void {
    const u = this.ground.material.uniforms;
    u.time.value = time;
    u.gust.value = gust;
    u.windOffset.value.copy(windDrift);
    for (const p of this.props) p.tick(time, gust, this.cloudShadeAt(p.anchor) * 0.9, this.cloudTint);
  }

  /**
   * How shaded a ground point is by the drifting clouds (0 = sun, 1 = full
   * shadow), matching the ground shader's pattern, to dim what stands in it.
   */
  cloudShadeAt(p: THREE.Vector3): number {
    const u = this.ground.material.uniforms;
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
    const a = u.arena.value as THREE.Vector3;
    const d = Math.hypot(p.x - a.x, p.z - a.y);
    const near = 1 - Math.min(1, Math.max(0, (d - a.z * 0.8) / (a.z * 0.6)));
    return t * t * (3 - 2 * t) * near;
  }

  /** The camera the arena is painted for (the resting battle camera). */
  setProjectionCamera(camera: THREE.PerspectiveCamera): void {
    this.ground.setCamera(camera);
  }

  dispose(): void {
    this.pipeline.setEnvironmentBlend('flash', WHITE, 0);
    this.pipeline.setEnvironmentBlend('tint', [0, 0, 0], 0);
    this.ground.dispose();
    for (const p of this.props) p.dispose();
  }
}
