// The battle arena: a place painted for the battle camera (src/render3d/arena)
// with no platforms under the Pokémon, only the ground they stand on.
//
//   ground  the painted floor and far view, projected from the resting camera
//           and alive per pixel (wind in the grass, waves, cloud shadows;
//           see arena/ground.ts)
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
  setGroundEffects(fx: { grassLean?: boolean; glints?: boolean }): void {
    const u = this.ground.material.uniforms;
    u.grassLean.value = fx.grassLean ? 1 : 0;
    u.glints.value = fx.glints ? 1 : 0;
    // Nobody stands on the spots until a battler says so (setStanding).
    this.feet.forEach((f, i) => (u.feet.value as THREE.Vector4[])[i].set(f.x, f.z, 0, i * 0.47));
  }

  /**
   * Whether a Pokémon stands on its spot (0 ours, 1 the foe's): water rings
   * only the feet of one that does, not an empty spot before a send-out or
   * after a faint.
   */
  setStanding(spot: 0 | 1, standing: boolean): void {
    (this.ground.material.uniforms.feet.value as THREE.Vector4[])[spot].z = standing ? (this.design.ripples ?? 0) : 0;
  }

  /** Advance the arena's life: time, gust (0..1). */
  tick(time: number, gust: number): void {
    const u = this.ground.material.uniforms;
    u.time.value = time;
    u.gust.value = gust;
    for (const p of this.props) p.tick(time, gust);
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
