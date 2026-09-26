// A 3D battler: species model + rig + animator placed in a battle slot.
// Applies the non-skeletal pose channels every frame: root motion (advance
// toward the target, jumps, spins, sinking), facing, eye expression, effects.
// On top of the clips it adds what makes the creature feel alive: loose parts
// on springs, eye blinks and a sprung recoil when hit. It always faces its
// opponent.
//
// Stop motion: the body is shown in poses held for several frames
// (Battler3D.poseRate a second, 15 by default; ?poseRate=0 for smooth
// motion, as the motion gates use). The animation runs on underneath at 60
// fps, so clips keep their timing and springs their feel; a clip event
// (an impact, a release) shows its pose at once. What the GBA does to
// sprites stays per frame: slides, bounces, blinks and palette flashes.
//
// Carried: a toss move's grab hands the foe to the attacker (grabbedBy):
// the foe's body rides rigidly with the attacker's grip (between its hands,
// turned with its chest) until it is thrown back down into its own place
// (thrown: it lands on its side) or dropped where it is (release); it lies
// there a moment, then gets up.

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
import { type Entrance, entranceOffset } from './entrance';

const DEG = Math.PI / 180;
/** Lying on its side (a thrown body lands so): rolled about its forward axis. */
const ON_SIDE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 80 * DEG);

/** Poses a second from the page's ?poseRate= (0 or 60: every frame), 15 by default (each held 4 frames). */
function pagePoseRate(): number {
  const q = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('poseRate');
  const v = q === null ? 15 : Number(q);
  return Number.isFinite(v) && v > 0 && v < 60 ? v : 0;
}
/** Effect origins every species has, by the rig bones they sit on. */
const BUILTIN_EMITTERS: Record<string, string[]> = { mouth: ['head'], eyes: ['head'], hands: ['handR', 'handL'], feet: ['footR', 'footL'], body: ['chest'] };

export class Battler3D {
  /** Stop motion: poses shown a second (0 = every frame). */
  static poseRate = pagePoseRate();

  readonly animator: Animator;
  target: Battler3D | null = null;
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
  /**
   * Extra root offset in body heights, in the slot's frame (y up, z toward
   * the foe): the path of an entrance (see enter()). Unlike screenOffset it
   * moves the body in the world, pose by pose.
   */
  readonly rootOffset = new THREE.Vector3();
  /** The entrance playing: its path, and when its clip leaves the ground and lands. */
  private entering: { entrance: Entrance; launch: number; land: number } | null = null;
  /** Seconds of remaining blink (GBA hit blink). */
  private blinkTime = 0;
  private time = 0;
  private readonly chains: SpringChain[] = [];
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
  /** Carried by a toss (see grabbedBy): who holds it, and the body relative to their grip. */
  private carry: { by: Battler3D; rel: THREE.Matrix4 } | null = null;
  /** Let go after a carry: where from (slot frame), how long it flies back to its place (0: dropped where it is), lies and gets up. */
  private letGo: { from: THREE.Vector3; fromQ: THREE.Quaternion; t: number; flight: number; lie: number; back: number } | null = null;
  /** Stop motion: time since the shown pose, whether to show the next at once, and the shown pose. */
  private poseClock = 0;
  private snapPose = true;
  private posed: { nodes: THREE.Object3D[]; values: Float32Array; root: THREE.Vector3; rotation: THREE.Euler; scale: number } | null = null;

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
    // Every node the pose moves, for holding a pose on screen (stop motion).
    const nodes: THREE.Object3D[] = [];
    inst.root.traverse((o) => {
      if (o !== inst.root && ((o as THREE.Bone).isBone || o.type === 'Object3D')) nodes.push(o);
    });
    this.posed = { nodes, values: new Float32Array(nodes.length * 10), root: new THREE.Vector3(), rotation: new THREE.Euler(0, 0, 0, 'YXZ'), scale: 1 };
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

  /** Whether effects can leave from this part: a built-in emitter or one of the profile's. */
  hasEmitter(name: string): boolean {
    return name in BUILTIN_EMITTERS || !!this.profile.emitters?.[name];
  }

  private resolveEmitter(name: string): { node: THREE.Object3D; local: THREE.Vector3 }[] {
    const rig = this.inst.rig;
    const spec = this.profile.emitters?.[name];
    const bones = spec?.bones ?? BUILTIN_EMITTERS[name] ?? [];
    const out: { node: THREE.Object3D; local: THREE.Vector3 }[] = [];
    for (const bone of bones) {
      const node = rig.node(bone);
      if (!node) continue;
      let local: THREE.Vector3;
      if (spec?.offset) {
        local = new THREE.Vector3(...spec.offset);
        // Offsets are authored for the left/center bone; mirror for right-side bones.
        if (/R$/.test(bone) && bones.some((b) => b === bone.slice(0, -1) + 'L')) local.x *= -1;
      } else if (name === 'eyes') {
        local = (!spec && this.eyeCentre(node)) || new THREE.Vector3();
      } else if (name === 'body') {
        local = new THREE.Vector3();
      } else {
        local = skinnedExtent(this.inst.model.scene, node, spec?.reach ?? 0.9) ?? new THREE.Vector3();
      }
      out.push({ node, local });
    }
    return out;
  }

  /**
   * Centre of the eyes in a bone's frame: the vertices drawn with the eye
   * atlas material (profile.expressions), so glints sit on the eyes rather
   * than on the head bone's pivot (at mouth level on some models).
   */
  private eyeCentre(bone: THREE.Object3D): THREE.Vector3 | null {
    const material = this.profile.expressions?.material;
    if (!material) return null;
    const sum = new THREE.Vector3();
    const v = new THREE.Vector3();
    let n = 0;
    this.inst.model.scene.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;
      const k = mesh.skeleton.bones.indexOf(bone as THREE.Bone);
      if (k < 0) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const eye = mats.findIndex((m) => m.name.includes(material));
      if (eye < 0) return;
      const toLocal = new THREE.Matrix4().multiplyMatrices(mesh.skeleton.boneInverses[k], mesh.bindMatrix);
      const pos = mesh.geometry.getAttribute('position');
      const index = mesh.geometry.getIndex();
      // With several materials, only the eye material's group of triangles.
      const groups = mats.length > 1 ? mesh.geometry.groups.filter((g) => g.materialIndex === eye) : [{ start: 0, count: index ? index.count : pos.count }];
      for (const g of groups) {
        for (let j = g.start; j < g.start + g.count; j++) {
          sum.add(v.fromBufferAttribute(pos, index ? index.getX(j) : j).applyMatrix4(toLocal));
          n++;
        }
      }
    });
    return n ? sum.divideScalar(n) : null;
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

  /** The id this battler's pixels have in the pixel pipeline. */
  get pixelId(): number {
    return SLOT_PIXEL_ID[this.slot];
  }

  /**
   * Where this battler holds what it carries (world): between its hands (the
   * `hands` emitter), turned with its chest.
   */
  gripMatrix(): THREE.Matrix4 {
    const hands = this.emitterPoints('hands');
    const at = hands.reduce((sum, p) => sum.add(p), new THREE.Vector3()).divideScalar(hands.length);
    const chest = this.inst.rig.node('chest') ?? this.inst.root;
    chest.updateWorldMatrix(true, false);
    const turn = new THREE.Quaternion();
    chest.matrixWorld.decompose(new THREE.Vector3(), turn, new THREE.Vector3());
    return new THREE.Matrix4().compose(at, turn, new THREE.Vector3(1, 1, 1));
  }

  /** Seized by a toss (its `grab`): from now on the body rides with the carrier's grip. */
  grabbedBy(carrier: Battler3D): void {
    this.inst.root.updateWorldMatrix(true, false);
    this.carry = { by: carrier, rel: carrier.gripMatrix().invert().multiply(this.inst.root.matrixWorld) };
    this.letGo = null;
  }

  /**
   * Hurled back down into its own place (a toss's `throw`): it lands on its
   * side after `flight` seconds, lies there for `lie`, then gets up in `back`.
   */
  thrown(flight: number, lie = 0.3, back = 0.4): void {
    if (!this.carry) return;
    this.carry = null;
    const root = this.inst.root;
    this.letGo = { from: root.position.clone(), fromQ: root.quaternion.clone(), t: 0, flight: Math.max(0.05, flight), lie, back };
  }

  /** Dropped where it is (a slam's impact): it lies there for `lie`, then hops back to its place in `back`. */
  release(lie = 0.22, back = 0.42): void {
    if (!this.carry) return;
    this.carry = null;
    const root = this.inst.root;
    this.letGo = { from: root.position.clone(), fromQ: root.quaternion.clone(), t: 0, flight: 0, lie, back };
  }

  get carried(): boolean {
    return !!this.carry;
  }

  /**
   * The body placed by its carrier's grip, or let go: flying back down to its
   * place, lying on the ground, getting up (slot frame; the pose's root is
   * where it belongs). Always on the ground, never in it.
   */
  private placeCarried(dt: number): void {
    const root = this.inst.root;
    const slot = this.stage.slots[this.slot];
    slot.updateWorldMatrix(true, false);
    let margin = 1;
    if (this.carry) {
      const local = slot.matrixWorld.clone().invert().multiply(this.carry.by.gripMatrix().multiply(this.carry.rel));
      local.decompose(root.position, root.quaternion, new THREE.Vector3());
    } else {
      const g = this.letGo!;
      g.t += dt;
      // Stop motion: the flight and the getting up are posed too.
      const rate = Battler3D.poseRate;
      const t = rate > 0 ? Math.floor(g.t * rate + 1e-6) / rate : g.t;
      const home = root.position.clone();
      const upright = root.quaternion.clone();
      // Thrown: it lands on its side in its own place; dropped: it lies where it fell.
      const lieP = g.flight > 0 ? home : g.from;
      const lieQ = g.flight > 0 ? upright.clone().multiply(ON_SIDE) : g.fromQ;
      if (t < g.flight) {
        const k = t / g.flight;
        root.position.lerpVectors(g.from, lieP, k * k);
        root.position.y += Math.sin(Math.PI * k) * this.height * 0.15;
        root.quaternion.slerpQuaternions(g.fromQ, lieQ, k);
      } else {
        const k = Math.max(0, Math.min(1, (t - g.flight - g.lie) / g.back));
        const e = k * k * (3 - 2 * k);
        root.position.lerpVectors(lieP, home, e);
        root.position.y += Math.sin(Math.PI * e) * this.height * (g.flight > 0 ? 0.18 : 0.3);
        root.quaternion.slerpQuaternions(lieQ, upright, e);
        margin = 1 - e;
        if (k >= 1) this.letGo = null;
      }
    }
    // Lying or carried low, the lowest joint stays a body's thickness above the ground.
    root.updateMatrixWorld(true);
    const ground = slot.getWorldPosition(new THREE.Vector3()).y + this.height * 0.12 * margin;
    const lowest = Math.min(...this.posed!.nodes.map((n) => n.getWorldPosition(new THREE.Vector3()).y));
    if (lowest < ground) root.position.y += ground - lowest;
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
    return this.animator.play(name, {
      ...opts,
      onEvent: (e) => {
        // An event's pose shows on the frame it happens.
        this.snapPose = true;
        this.onEvent?.(e);
      },
    });
  }

  /**
   * Come into the battle along a place's path (src/battle3d/entrance.ts),
   * acted out by the `entrance` clip; resolves once it has landed and
   * settled. The clip's `launch` and `land` events time the path.
   */
  async enter(entrance: Entrance): Promise<void> {
    const clip = this.profile.clips.entrance;
    if (!clip) {
      // Nothing to act it out with: it is simply there.
      this.onEvent?.('launch');
      this.onEvent?.('land');
      return;
    }
    const at = (name: string) => clip.events?.find((e) => e.name === name)?.t;
    this.entering = { entrance, launch: at('launch') ?? 0, land: at('land') ?? clip.duration };
    entranceOffset(entrance, this.entering.launch, this.entering.land, 0, this.rootOffset);
    this.snapPose = true;
    await this.perform('entrance', { fade: 0, speed: entrance.speed });
    this.entering = null;
    this.rootOffset.set(0, 0, 0);
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

  /** The root's scale and the per-frame sprite offsets (appear, slide, bounce) on top of the pose's position. */
  private placeRoot(poseScale: number): void {
    const root = this.inst.root;
    root.scale.setScalar(poseScale * this.appear);
    if (this.appear !== 1) root.position.y += (1 - this.appear) * this.height * this.appearPivot;
    if (this.screenOffset[0] || this.screenOffset[1]) root.position.add(this.screenOffsetLocal());
  }

  update(dt: number): void {
    this.time += dt;
    const pose = this.animator.update(dt);
    this.pose = pose;
    const recoil = this.recoilSpring.update(dt, 0);

    // Root transform: calibration + animation channels (+ hit recoil: pushed
    // back and leaning away).
    const cal = this.profile.calibration.slots[this.slot];
    const H = this.height;
    const r = pose.root ?? {};
    // Always facing the opponent (the slot looks at it): the same direction
    // at rest, in every move and on the way home. Clips turn the body with
    // root.yaw (spins) on top.
    const yaw = 0;
    const root = this.inst.root;
    const poseScale = H * (pose.scale ?? 1);
    root.rotation.set(((r.pitch ?? 0) - 7 * recoil) * DEG, yaw + (r.yaw ?? 0) * DEG, (r.roll ?? 0) * DEG, 'YXZ');
    const off = new THREE.Vector3(r.x ?? 0, r.y ?? 0, (r.z ?? 0) - 0.035 * recoil).multiplyScalar(H).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const e = this.entering;
    if (e && this.animator.currentClip === 'entrance') entranceOffset(e.entrance, e.launch, e.land, this.animator.time, this.rootOffset);
    root.position.set(cal.dx, cal.lift, cal.dz + (pose.advance ?? 0) * this.approachDistance()).add(off).addScaledVector(this.rootOffset, H);
    const posePosition = root.position.clone();
    this.placeRoot(poseScale);

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

    // Stop motion: show this pose, or hold the one on screen.
    this.poseClock += dt;
    const show = !this.posed || Battler3D.poseRate <= 0 || this.snapPose || this.poseClock >= 1 / Battler3D.poseRate - 1e-6;

    // Landing: dust kicked up at the feet when coming down fast.
    const lift = root.position.y - cal.lift;
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
      if (show) this.eyeMap.offset.set(cell[0] * ex.cell[0], cell[1] * ex.cell[1]);
    }

    // Effects.
    if (show) {
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
    }

    // The body on screen: this pose (kept for the frames to come), or the held one.
    const held = this.posed;
    if (held && show) {
      held.nodes.forEach((n, i) => {
        const o = i * 10;
        n.position.toArray(held.values, o);
        n.quaternion.toArray(held.values, o + 3);
        n.scale.toArray(held.values, o + 7);
      });
      held.root.copy(posePosition);
      held.rotation.copy(root.rotation);
      held.scale = poseScale;
      this.poseClock = 0;
      this.snapPose = false;
    } else if (held) {
      held.nodes.forEach((n, i) => {
        const o = i * 10;
        n.position.fromArray(held.values, o);
        n.quaternion.fromArray(held.values, o + 3);
        n.scale.fromArray(held.values, o + 7);
      });
      root.position.copy(held.root);
      root.rotation.copy(held.rotation);
      this.placeRoot(held.scale);
    }

    if (this.carry || this.letGo) this.placeCarried(dt);

    // Shadow on the ground under the body on screen: follows the feet,
    // shrinks and fades in the air, gone when sunk (fainted) or not sent out.
    const shownLift = root.position.y - cal.lift;
    const up = Math.max(0, shownLift / H);
    const sunk = Math.min(1, Math.max(0, 1 + (shownLift / H) * 4));
    const shadowScale = (this.appear / (1 + up * 1.6)) * H;
    this.shadow.update(root.position.x, root.position.z, root.rotation.y, this.footprint.x * shadowScale, this.footprint.z * shadowScale, this.visible ? sunk * Math.max(0, 1 - up * 1.4) : 0);

    // Visibility / blink (GBA hit blink toggles every 4 frames).
    let seen = this.visible;
    if (this.blinkTime > 0) {
      this.blinkTime -= dt;
      seen = seen && Math.floor(this.blinkTime * 60 / 4) % 2 === 0;
    }
    root.visible = seen;
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
