// A 3D battler: species model + rig + animator placed in a battle slot.
// Applies the non-skeletal pose channels every frame: root motion (advance
// toward the target, jumps, spins, sinking), facing, eye expression, effects.
// On top of the clips it adds what makes the creature feel alive: loose parts
// on springs, eye blinks, a sprung turn toward the target and a sprung recoil
// when hit.

import * as THREE from 'three';
import { Animator } from '../anim/animator';
import { SecondOrder, SpringChain, seededRandom, skinnedExtent } from '../anim/dynamics';
import type { Pose } from '../anim/rig';
import { makeFireIdMaterial, makeFireMaterial } from '../render3d/fire';
import { FX_PIXEL_ID } from './vfx';
import type { BattleStage, SlotName } from '../render3d/stage';
import type { RGB } from '../gba/bitmap';
import { SLOT_PIXEL_ID, instantiatePokemon, type PokemonInstance } from '../pokemon/instantiate';
import { GroundShadow } from '../render3d/shadow';
import { slotYaw } from '../pokemon/profile';

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
  private readonly chains: SpringChain[] = [];
  /** Turning toward the target: quick, smooth start, settles with a slight overshoot. */
  private readonly facingSpring = new SecondOrder(2.2, 0.8, 0);
  /** Recoil from hits (0 = at rest, 1 = a strong hit's push), a loose spring. */
  private readonly recoilSpring = new SecondOrder(2.4, 0.38, 0);
  /** Eye blinks: seconds until the next one, and time into the current one. */
  private readonly random: () => number;
  private nextEyeBlink: number;
  private eyeBlinkTime = -1;
  private readonly fireMaterials = new Map<string, THREE.ShaderMaterial[]>();
  /** Jaw tip in the jaw's frame, and the jaw's bind transform under the head. */
  private mouth: { tip: THREE.Vector3; bind: THREE.Matrix4 } | null = null;
  /** Emitter points (bone + local offset), resolved once. */
  private readonly emitterCache = new Map<string, { node: THREE.Object3D; local: THREE.Vector3 }[]>();
  private readonly shadow: GroundShadow;
  /** Shadow radii in model heights (from the stance's footprint). */
  private footprint = { x: 0.3, z: 0.2 };
  /** Height above the ground last frame (world units), for landing dust. */
  private lastLift = 0;
  private liftSpeed = 0;
  private shade = 1;
  /** A palette flash on hits (type color), fading out. */
  private flash: { color: RGB; amount: number; left: number; total: number } | null = null;
  private eyeMap: THREE.Texture | null = null;
  pose: Pose = {};
  onEvent: ((name: string) => void) | null = null;

  private constructor(readonly stage: BattleStage, readonly slot: SlotName, readonly inst: PokemonInstance) {
    this.animator = new Animator(inst.rig, inst.profile.clips, inst.profile.overlap);
    this.random = seededRandom(slot === 'player' ? 0x5eed1 : 0x5eed2);
    this.nextEyeBlink = 1 + this.random() * 2;
    this.setupEffects();
    this.setupExpressions();
    this.setupDynamics();
    this.setupMouth();
    const px = stage.pipeline.settings;
    this.shadow = new GroundShadow(px.density * px.supersample);
    stage.slots[slot].add(this.shadow.mesh);
    this.measureFootprint();
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

  /** Shadow size from where the feet stand in the stance (plus a margin). */
  private measureFootprint(): void {
    const rig = this.inst.rig;
    const feet = ['footL', 'footR', 'handL', 'handR', 'toeL', 'toeR']
      .filter((b) => b.startsWith('foot') || b.startsWith('toe') || rig.profile.frontLegs)
      .map((b) => rig.node(b))
      .filter((n): n is THREE.Object3D => !!n)
      .map((n) => rig.modelPos(n, new THREE.Vector3()));
    if (feet.length < 2) return;
    const xs = feet.map((p) => p.x), zs = feet.map((p) => p.z);
    const halfX = (Math.max(...xs) - Math.min(...xs)) / 2;
    const halfZ = (Math.max(...zs) - Math.min(...zs)) / 2;
    this.footprint = { x: Math.min(0.5, halfX + 0.14), z: Math.min(0.45, Math.max(0.1, halfZ + 0.1)) };
  }

  private setupMouth(): void {
    const rig = this.inst.rig;
    const jaw = rig.node('jaw');
    const info = rig.nodes.get(rig.profile.bones.jaw ?? 'jaw');
    const tip = jaw && skinnedExtent(this.inst.model.scene, jaw, 0.9);
    if (!jaw || !info || !tip) return;
    this.mouth = { tip, bind: new THREE.Matrix4().compose(info.bindLocalP, info.bindLocalQ, jaw.scale) };
  }

  /**
   * World position of the open mouth: halfway between the jaw's tip and where
   * that tip sits with the jaw closed (the upper beak / lip). Null without a jaw.
   */
  mouthPosition(): THREE.Vector3 | null {
    const jaw = this.inst.rig.node('jaw');
    if (!this.mouth || !jaw?.parent) return null;
    jaw.updateWorldMatrix(true, false);
    const lower = this.mouth.tip.clone().applyMatrix4(jaw.matrixWorld);
    const upper = this.mouth.tip.clone().applyMatrix4(this.mouth.bind).applyMatrix4(jaw.parent.matrixWorld);
    return lower.add(upper).multiplyScalar(0.5);
  }

  /**
   * World positions of a named effect origin: the profile's emitters
   * (cannons, flower...) or the built-in mouth, eyes, hands, feet and body.
   */
  emitterPoints(name: string): THREE.Vector3[] {
    if (name === 'mouth' && !this.profile.emitters?.mouth) {
      const m = this.mouthPosition();
      if (m) return [m];
    }
    let points = this.emitterCache.get(name);
    if (!points) {
      points = this.resolveEmitter(name);
      this.emitterCache.set(name, points);
    }
    if (!points.length) return [this.fallbackPoint(name)];
    return points.map(({ node, local }) => {
      node.updateWorldMatrix(true, false);
      return local.clone().applyMatrix4(node.matrixWorld);
    });
  }

  private resolveEmitter(name: string): { node: THREE.Object3D; local: THREE.Vector3 }[] {
    const rig = this.inst.rig;
    const spec = this.profile.emitters?.[name];
    const builtin: Record<string, string[]> = { mouth: ['head'], eyes: ['head'], hands: ['handR', 'handL'], feet: ['footR', 'footL'], body: ['chest'] };
    const bones = spec?.bones ?? builtin[name] ?? [];
    const out: { node: THREE.Object3D; local: THREE.Vector3 }[] = [];
    for (const bone of bones) {
      const node = rig.node(bone);
      if (!node) continue;
      let local: THREE.Vector3;
      if (spec?.offset) {
        local = new THREE.Vector3(...spec.offset);
        // Offsets are authored for the left/center bone; mirror for right-side bones.
        if (/R$/.test(bone) && bones.some((b) => b === bone.slice(0, -1) + 'L')) local.x *= -1;
      } else if (name === 'eyes' || name === 'body') {
        local = new THREE.Vector3();
      } else {
        local = skinnedExtent(this.inst.model.scene, node, spec?.reach ?? 0.9) ?? new THREE.Vector3();
      }
      out.push({ node, local });
    }
    return out;
  }

  private fallbackPoint(name: string): THREE.Vector3 {
    this.inst.root.updateWorldMatrix(true, false);
    const p = new THREE.Vector3().setFromMatrixPosition(this.inst.root.matrixWorld);
    p.y += this.height * (name === 'feet' ? 0.05 : name === 'mouth' || name === 'eyes' ? 0.8 : 0.55);
    return p;
  }

  private setupDynamics(): void {
    for (const spec of this.profile.dynamics ?? []) {
      const nodes = spec.bones.map((b) => this.inst.rig.node(b));
      if (nodes.some((n) => !n)) continue;
      const last = nodes[nodes.length - 1]!;
      const tip = spec.tip ? new THREE.Vector3(...spec.tip) : skinnedExtent(this.inst.model.scene, last);
      if (tip) this.chains.push(new SpringChain(nodes as THREE.Object3D[], tip, spec));
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

  /** A palette flash toward a color (a hit from a typed move), fading over `seconds`. */
  flashTint(color: RGB, amount: number, seconds = 0.3): void {
    this.flash = { color, amount, left: seconds, total: seconds };
  }

  /** Knock the battler back (1 = a strong hit); it springs back and settles. */
  recoil(strength: number): void {
    // Velocity for a peak of about `strength` (2*pi*f, less what damping eats).
    this.recoilSpring.impulse(strength * 2 * Math.PI * 2.4 * 1.45);
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
    this.facing = this.facingSpring.update(dt, attacking ? 1 : 0);
    const recoil = this.recoilSpring.update(dt, 0);

    // Root transform: calibration + animation channels (+ hit recoil: pushed
    // back and leaning away).
    const cal = this.profile.calibration.slots[this.slot];
    const H = this.height;
    const r = pose.root ?? {};
    const yaw = slotYaw(cal) * DEG * (1 - this.facing);
    const root = this.inst.root;
    root.scale.setScalar(H * (pose.scale ?? 1) * this.appear);
    root.rotation.set(((r.pitch ?? 0) - 7 * recoil) * DEG, yaw + (r.yaw ?? 0) * DEG, (r.roll ?? 0) * DEG, 'YXZ');
    const off = new THREE.Vector3(r.x ?? 0, r.y ?? 0, (r.z ?? 0) - 0.035 * recoil).multiplyScalar(H).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    root.position.set(cal.dx, cal.lift, cal.dz + (pose.advance ?? 0) * this.approachDistance()).add(off);
    if (this.appear !== 1) root.position.y += (1 - this.appear) * H * this.appearPivot;
    if (this.screenOffset[0] || this.screenOffset[1]) root.position.add(this.screenOffsetLocal());

    // Loose parts follow the body through world space (start from rest when
    // the battler (re)appears) and sway in the arena's wind.
    root.updateMatrixWorld(true);
    const settled = this.visible && this.appear >= 1;
    const ambience = this.stage.ambience;
    const wind = ambience ? ambience.wind.clone().multiplyScalar(H * 9) : undefined;
    for (const chain of this.chains) {
      if (settled) chain.update(dt, wind);
      else chain.reset();
    }

    // Shadow on the ground: follows the feet, shrinks and fades in the air,
    // gone when sunk (fainted) or not sent out.
    const lift = root.position.y - cal.lift;
    const up = Math.max(0, lift / H);
    const sunk = Math.min(1, Math.max(0, 1 + (lift / H) * 4));
    const shadowScale = (this.appear / (1 + up * 1.6)) * H;
    this.shadow.update(root.position.x, root.position.z, root.rotation.y, this.footprint.x * shadowScale, this.footprint.z * shadowScale, this.visible ? sunk * Math.max(0, 1 - up * 1.4) : 0);

    // Landing: dust kicked up at the feet when coming down fast.
    if (dt > 0) this.liftSpeed = (lift - this.lastLift) / dt;
    if (this.visible && this.appear >= 1 && this.lastLift > 0.025 * H && lift <= 0.01 * H && this.liftSpeed < -0.3 * H && ambience) {
      const at = new THREE.Vector3(root.position.x, 0, root.position.z).applyMatrix4(this.stage.slots[this.slot].matrixWorld);
      ambience.puff(at, Math.min(1.5, -this.liftSpeed / (1.5 * H)), H);
    }
    this.lastLift = lift;

    // Standing in a cloud's shadow dims the body a little.
    const env = this.stage.environment;
    if (env) {
      const at = new THREE.Vector3().setFromMatrixPosition(root.matrixWorld);
      const target = 1 - 0.14 * env.cloudShadeAt(at);
      this.shade += (target - this.shade) * Math.min(1, dt * 3);
      this.inst.toon.uniforms.shade.value = this.shade;
    }

    // Hit flash (type color), like Emerald's palette blends on the target.
    if (this.flash) {
      this.flash.left -= dt;
      const k = Math.max(0, this.flash.left / this.flash.total);
      this.setTint(this.flash.color, this.flash.amount * k * k);
      if (this.flash.left <= 0) {
        this.setTint(this.flash.color, 0);
        this.flash = null;
      }
    }

    // Expression, with blinks while the eyes are simply open.
    const ex = this.profile.expressions;
    if (ex && this.eyeMap) {
      const cell = ex.cells[this.eyeExpression(dt, pose.expression ?? 'open')] ?? ex.cells.open;
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

  /**
   * Blink every 2-5 s (sometimes twice): half-closed, closed, half-closed,
   * about 0.12 s in all. Only while the pose leaves the eyes open.
   */
  private eyeExpression(dt: number, expression: string): string {
    const cells = this.profile.expressions?.cells;
    if (expression !== 'open' || !cells?.closed) {
      this.eyeBlinkTime = -1;
      return expression;
    }
    this.nextEyeBlink -= dt;
    if (this.eyeBlinkTime < 0 && this.nextEyeBlink <= 0) {
      this.eyeBlinkTime = 0;
      this.nextEyeBlink = this.random() < 0.18 ? 0.3 : 2 + this.random() * 3;
    }
    if (this.eyeBlinkTime < 0) return expression;
    const frame = this.eyeBlinkTime * 60;
    this.eyeBlinkTime += dt;
    const half = cells.half ? 'half' : 'closed';
    if (frame < 2) return half;
    if (frame < 5) return 'closed';
    if (frame < 7) return half;
    this.eyeBlinkTime = -1;
    return expression;
  }
}
