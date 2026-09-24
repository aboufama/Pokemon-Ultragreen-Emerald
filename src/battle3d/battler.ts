// A 3D battler: species model + rig + animator placed in a battle slot.
// Applies the non-skeletal pose channels every frame: root motion (advance
// toward the target, jumps, spins, sinking), facing, eye expression, effects.

import * as THREE from 'three';
import { Animator } from '../anim/animator';
import type { Pose } from '../anim/rig';
import { makeFireIdMaterial, makeFireMaterial } from '../render3d/fire';
import { FX_PIXEL_ID } from './vfx';
import type { BattleStage, SlotName } from '../render3d/stage';
import type { RGB } from '../gba/bitmap';
import { SLOT_PIXEL_ID, instantiatePokemon, type PokemonInstance } from '../pokemon/instantiate';

const DEG = Math.PI / 180;
const ATTACK_CLIPS = /^(physical|special|status)/;

export class Battler3D {
  readonly animator: Animator;
  target: Battler3D | null = null;
  /** 0 = calibrated display yaw (matches the stock sprite), 1 = facing the target. */
  facing = 0;
  /** Scale multiplier for the Poke Ball appear/withdraw effect. */
  appear = 1;
  /** Height fraction the appear scale pivots on (sprites scale about their center). */
  appearPivot = 0.5;
  visible = true;
  /**
   * Sprite-style offset in GBA pixels (x right, y down), like OAM x2/y2:
   * used for the intro slide, the action-menu bounce and shakes.
   */
  screenOffset: [number, number] = [0, 0];
  /** Seconds of remaining blink (GBA hit blink). */
  private blinkTime = 0;
  private time = 0;
  private readonly fireMaterials = new Map<string, THREE.ShaderMaterial[]>();
  private eyeMap: THREE.Texture | null = null;
  pose: Pose = {};
  onEvent: ((name: string) => void) | null = null;

  private constructor(readonly stage: BattleStage, readonly slot: SlotName, readonly inst: PokemonInstance) {
    this.animator = new Animator(inst.rig, inst.profile.clips);
    this.setupEffects();
    this.setupExpressions();
    void this.animator.play('idle');
  }

  static async create(stage: BattleStage, slot: SlotName, slug: string, opts: { shiny?: boolean } = {}): Promise<Battler3D> {
    const inst = await instantiatePokemon(stage, slot, slug, opts);
    return new Battler3D(stage, slot, inst);
  }

  get profile() {
    return this.inst.profile;
  }

  get height(): number {
    return this.profile.calibration.height;
  }

  private setupEffects(): void {
    for (const [channel, binding] of Object.entries(this.profile.effects)) {
      const mats: THREE.ShaderMaterial[] = [];
      for (const [key, meshes] of this.inst.toon.effects) {
        if (!binding.parts.some((p) => key.includes(p)) || !binding.fire) continue;
        for (const mesh of meshes) {
          const src = mesh.userData.effectMaterial as THREE.MeshStandardMaterial | undefined;
          const mat = makeFireMaterial(src?.map ?? null, binding.fire);
          mesh.material = mat;
          mesh.visible = false;
          // Flames own their pixels (effect id): not snapped/outlined as body.
          mesh.userData.pixelId = FX_PIXEL_ID;
          mesh.userData.idMaterial = makeFireIdMaterial(mat, FX_PIXEL_ID);
          mats.push(mat);
        }
      }
      this.fireMaterials.set(channel, mats);
    }
  }

  private setupExpressions(): void {
    const ex = this.profile.expressions;
    if (!ex) return;
    for (const m of this.inst.toon.materials) {
      if (m.name.includes(ex.material) && m.map) {
        this.eyeMap = m.map;
        break;
      }
    }
  }

  /** Distance a contact move travels so the attacker ends up in front of its target. */
  approachDistance(): number {
    if (!this.target) return 0;
    const a = this.stage.slots[this.slot].position;
    const b = this.stage.slots[this.target.slot].position;
    const contact = 0.42 * (this.height + this.target.height);
    return Math.max(0, a.distanceTo(b) - contact);
  }

  play(clip: string, opts: { fade?: number; speed?: number } = {}): Promise<void> {
    const name = this.animator.has(clip) ? clip : 'idle';
    return this.animator.play(name, { ...opts, onEvent: (e) => this.onEvent?.(e) });
  }

  /** Play a clip, then return to idle. */
  async perform(clip: string, opts: { fade?: number; speed?: number } = {}): Promise<void> {
    await this.play(clip, opts);
    if (clip !== 'faint') void this.play('idle', { fade: 0.2 });
  }

  blink(seconds: number): void {
    this.blinkTime = seconds;
  }

  /**
   * Blend the battler's palette toward a color (amount 0..1 = coefficient/16),
   * like BlendPalette on its sprite palette: intro shadow, Poké Ball flash,
   * glows. Applied by the pixel pipeline after palette snapping.
   */
  setTint(color: RGB, amount: number): void {
    this.stage.pipeline.setBlend(SLOT_PIXEL_ID[this.slot] - 1, color, amount);
  }

  /** screenOffset converted to a translation in the slot's local frame. */
  private screenOffsetLocal(): THREE.Vector3 {
    const cam = this.stage.homeCamera;
    const slot = this.stage.slots[this.slot];
    const world = slot.getWorldPosition(new THREE.Vector3());
    const upp = this.stage.unitsPerPixel(world);
    // Camera right is horizontal (no roll), so a sideways move stays on the
    // ground; a vertical world move projects shortened by the camera pitch.
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const pitch = THREE.MathUtils.degToRad(this.stage.spec.pitch);
    const v = right.multiplyScalar(this.screenOffset[0] * upp);
    v.y -= (this.screenOffset[1] * upp) / Math.max(0.2, Math.cos(pitch));
    return v.applyQuaternion(slot.quaternion.clone().invert());
  }

  update(dt: number): void {
    this.time += dt;
    const pose = this.animator.update(dt);
    this.pose = pose;
    const attacking = ATTACK_CLIPS.test(this.animator.currentClip ?? '');
    const wantFacing = attacking ? 1 : 0;
    this.facing += (wantFacing - this.facing) * Math.min(1, dt * 8);

    // Root transform: calibration + animation channels.
    const cal = this.profile.calibration.slots[this.slot];
    const H = this.height;
    const r = pose.root ?? {};
    const yaw = cal.yaw * DEG * (1 - this.facing);
    const root = this.inst.root;
    root.scale.setScalar(H * (pose.scale ?? 1) * this.appear);
    root.rotation.set((r.pitch ?? 0) * DEG, yaw + (r.yaw ?? 0) * DEG, (r.roll ?? 0) * DEG, 'YXZ');
    const off = new THREE.Vector3(r.x ?? 0, r.y ?? 0, r.z ?? 0).multiplyScalar(H).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    root.position.set(cal.dx, cal.lift, cal.dz + (pose.advance ?? 0) * this.approachDistance()).add(off);
    if (this.appear !== 1) root.position.y += (1 - this.appear) * H * this.appearPivot;
    if (this.screenOffset[0] || this.screenOffset[1]) root.position.add(this.screenOffsetLocal());

    // Expression.
    const ex = this.profile.expressions;
    if (ex && this.eyeMap) {
      const cell = ex.cells[pose.expression ?? 'open'] ?? ex.cells.open;
      this.eyeMap.offset.set(cell[0] * ex.cell[0], cell[1] * ex.cell[1]);
    }

    // Effects.
    for (const [channel, mats] of this.fireMaterials) {
      const v = pose.fx?.[channel] ?? 0;
      for (const m of mats) {
        m.uniforms.intensity.value = v;
        m.uniforms.time.value = this.time;
      }
    }
    for (const [key, meshes] of this.inst.toon.effects) {
      const channel = Object.entries(this.profile.effects).find(([, b]) => b.parts.some((p) => key.includes(p)))?.[0];
      const v = channel ? pose.fx?.[channel] ?? 0 : 0;
      for (const m of meshes) m.visible = v > 0.02;
    }

    // Visibility / blink (GBA hit blink toggles every 4 frames).
    let show = this.visible;
    if (this.blinkTime > 0) {
      this.blinkTime -= dt;
      show = show && Math.floor(this.blinkTime * 60 / 4) % 2 === 0;
    }
    root.visible = show;
  }
}
