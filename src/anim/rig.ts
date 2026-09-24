// Rig: applies semantic poses to a pre-rigged glTF skeleton.
//
// Rotations are authored in *model space at bind pose*: {x, y, z} degrees about
// the model axes (+X = the creature's left, +Y = up, +Z = forward), applied at
// the bone's pivot and carried along by the parent chain (plain FK). Internally
// each delta is conjugated into the bone's bind frame:
//     local = bindLocal * (W_bind^-1 * Q_model * W_bind)
// so poses do not depend on how the original rig oriented its bones. This is
// what lets one animation set be shared by every biped in the gauntlet: only
// the semantic -> bone-name map (RigProfile) changes per species.

import * as THREE from 'three';
import type { LoadedModel } from '../render3d/model';

export type Vec3 = [number, number, number];

export interface BoneRotation {
  x?: number;
  y?: number;
  z?: number;
}

export interface BoneAim {
  /** Model-space direction the bone's axis should point along. */
  dir: Vec3;
  /** Extra roll (degrees) about the aimed direction. */
  twist?: number;
}

/** A pose: semantic bone name -> rotation (degrees), plus special channels. */
export interface Pose {
  bones?: Record<string, BoneRotation>;
  /** Point limbs along model-space directions (applied after `bones`, parents first). */
  aim?: Record<string, BoneAim>;
  /** Extra rotations applied after aims (model-space axes, about the bone pivot). */
  post?: Record<string, BoneRotation>;
  /** Pelvis translation (hips + spine roots together), in model units (height = 1). */
  pelvis?: { x?: number; y?: number; z?: number };
  /** Whole-model offset in the battler's local space (model units) and yaw (degrees). */
  root?: { x?: number; y?: number; z?: number; yaw?: number; pitch?: number; roll?: number };
  /** 0..1: how far a contact attack has advanced toward its target. */
  advance?: number;
  /** Keep the feet planted with IK (0..1 weight). */
  plantFeet?: number;
  /** Per-leg overrides of plantFeet (a kick lifts one foot, the other stays down). */
  plantLeft?: number;
  plantRight?: number;
  /** Override of plantFeet for both front feet of a quadruped (rearing up lifts them). */
  plantFront?: number;
  /** Eye expression cell name (species specific). */
  expression?: string;
  /** Effect intensities, e.g. { flames: 1 }. */
  fx?: Record<string, number>;
  /** Uniform squash/stretch (1 = none). */
  scale?: number;
}

export interface LegChain {
  thigh: string;
  shin: string;
  foot: string;
  /** Which way the middle joint bends: 1 = forward like a knee (default), -1 = back like a quadruped's front leg. */
  bend?: number;
}

export interface RigProfile {
  /** semantic name -> node name in the model. */
  bones: Record<string, string>;
  /** Local axis each bone points along (toward its child). Default +X. */
  boneAxis?: Vec3;
  /** Node names that together form the pelvis (moved by Pose.pelvis). */
  pelvisNodes: string[];
  legs?: { left: LegChain; right: LegChain };
  /** Quadrupeds: the front legs (arm, forearm, hand), planted like the hind legs. */
  frontLegs?: { left: LegChain; right: LegChain };
}

interface NodeInfo {
  node: THREE.Object3D;
  bindLocalQ: THREE.Quaternion;
  bindLocalP: THREE.Vector3;
  /** Bind world rotation in model space. */
  bindModelQ: THREE.Quaternion;
}

const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v2 = new THREE.Vector3();
const DEG = Math.PI / 180;

export function rotationQuat(r: BoneRotation, out = new THREE.Quaternion()): THREE.Quaternion {
  _e.set((r.x ?? 0) * DEG, (r.y ?? 0) * DEG, (r.z ?? 0) * DEG, 'YXZ');
  return out.setFromEuler(_e);
}

export class Rig {
  readonly nodes = new Map<string, NodeInfo>();
  /** Model-space transform root (the glTF scene inside the normalized wrapper). */
  private readonly modelRoot: THREE.Object3D;
  private readonly modelInv = new THREE.Matrix4();
  /** Bind-pose foot positions in model space, for IK planting. */
  private readonly footBind = new Map<string, { pos: THREE.Vector3; q: THREE.Quaternion }>();

  constructor(readonly model: LoadedModel, readonly profile: RigProfile) {
    this.modelRoot = model.root;
    model.root.updateMatrixWorld(true);
    this.modelInv.copy(model.root.matrixWorld).invert();
    const byName = new Map<string, THREE.Object3D>();
    model.scene.traverse((o) => byName.set(o.name, o));
    const collect = (name: string) => {
      const node = byName.get(name);
      if (!node || this.nodes.has(name)) return;
      this.nodes.set(name, {
        node,
        bindLocalQ: node.quaternion.clone(),
        bindLocalP: node.position.clone(),
        bindModelQ: this.modelQuat(node, new THREE.Quaternion()),
      });
    };
    for (const n of Object.values(profile.bones)) collect(n);
    for (const n of profile.pelvisNodes) collect(n);
    // Also keep every bone so unmapped nodes reset cleanly.
    for (const name of model.bones.keys()) collect(name);
    for (const pair of [profile.legs, profile.frontLegs]) {
      if (!pair) continue;
      for (const leg of [pair.left, pair.right]) {
        const foot = this.node(leg.foot)!;
        this.footBind.set(leg.foot, { pos: this.modelPos(foot, new THREE.Vector3()), q: this.modelQuat(foot, new THREE.Quaternion()) });
      }
    }
  }

  node(name: string): THREE.Object3D | undefined {
    return this.nodes.get(this.profile.bones[name] ?? name)?.node;
  }

  private info(name: string): NodeInfo | undefined {
    return this.nodes.get(this.profile.bones[name] ?? name);
  }

  /** World rotation of a node relative to the model root. */
  modelQuat(node: THREE.Object3D, out: THREE.Quaternion): THREE.Quaternion {
    node.updateWorldMatrix(true, false);
    const m = new THREE.Matrix4().multiplyMatrices(this.modelInvCurrent(), node.matrixWorld);
    const s = new THREE.Vector3();
    m.decompose(_v2, out, s);
    return out;
  }

  modelPos(node: THREE.Object3D, out: THREE.Vector3): THREE.Vector3 {
    node.updateWorldMatrix(true, false);
    return out.setFromMatrixPosition(node.matrixWorld).applyMatrix4(this.modelInvCurrent());
  }

  private modelInvCurrent(): THREE.Matrix4 {
    this.modelRoot.updateWorldMatrix(true, false);
    return this.modelInv.copy(this.modelRoot.matrixWorld).invert();
  }

  resetToBind(): void {
    for (const info of this.nodes.values()) {
      info.node.quaternion.copy(info.bindLocalQ);
      info.node.position.copy(info.bindLocalP);
    }
  }

  /** Apply a pose on top of the bind pose (FK), then foot IK if requested. */
  applyPose(pose: Pose): void {
    this.resetToBind();
    const bones = pose.bones ?? {};
    for (const [semantic, rot] of Object.entries(bones)) {
      const info = this.info(semantic);
      if (!info) continue;
      rotationQuat(rot, _q);
      // D = W^-1 * Q * W ; local = bindLocal * D
      _q2.copy(info.bindModelQ).invert().multiply(_q).multiply(info.bindModelQ);
      info.node.quaternion.copy(info.bindLocalQ).multiply(_q2);
    }
    if (pose.aim) this.applyAims(pose.aim);
    if (pose.post) this.applyPost(pose.post);
    if (pose.pelvis) {
      // Pelvis nodes are roots of the glTF scene; the scene is scaled to unit
      // height, so convert model units to the scene's local units.
      const s = this.model.scene.scale.x;
      for (const name of this.profile.pelvisNodes) {
        const info = this.nodes.get(name);
        if (!info) continue;
        info.node.position.set(
          info.bindLocalP.x + (pose.pelvis.x ?? 0) / s,
          info.bindLocalP.y + (pose.pelvis.y ?? 0) / s,
          info.bindLocalP.z + (pose.pelvis.z ?? 0) / s,
        );
      }
    }
    const both = pose.plantFeet ?? 0;
    if (this.profile.legs) {
      const left = pose.plantLeft ?? both;
      const right = pose.plantRight ?? both;
      if (left > 0 || right > 0) this.plantFeet(this.profile.legs, left, right);
    }
    if (this.profile.frontLegs) {
      const front = pose.plantFront ?? both;
      if (front > 0) this.plantFeet(this.profile.frontLegs, front, front);
    }
  }

  private depth(node: THREE.Object3D): number {
    let d = 0;
    for (let p = node.parent; p; p = p.parent) d++;
    return d;
  }

  private applyAims(aims: Record<string, BoneAim>): void {
    const axis = new THREE.Vector3(...(this.profile.boneAxis ?? [1, 0, 0]));
    const entries = Object.entries(aims)
      .map(([name, aim]) => ({ info: this.info(name), aim }))
      .filter((e): e is { info: NodeInfo; aim: BoneAim } => !!e.info)
      .sort((a, b) => this.depth(a.info.node) - this.depth(b.info.node));
    for (const { info, aim } of entries) {
      const node = info.node;
      const worldQ = this.modelQuat(node, new THREE.Quaternion());
      const cur = axis.clone().applyQuaternion(worldQ).normalize();
      const tgt = new THREE.Vector3(...aim.dir).normalize();
      const delta = new THREE.Quaternion().setFromUnitVectors(cur, tgt);
      if (aim.twist) delta.premultiply(new THREE.Quaternion().setFromAxisAngle(tgt, aim.twist * DEG));
      const parentQ = this.modelQuat(node.parent!, new THREE.Quaternion());
      node.quaternion.copy(parentQ.invert().multiply(delta.multiply(worldQ)));
      node.updateMatrixWorld(true);
    }
  }

  /** Rotate bones about model-space axes through their pivots, on top of the current pose. */
  private applyPost(post: Record<string, BoneRotation>): void {
    const entries = Object.entries(post)
      .map(([name, r]) => ({ info: this.info(name), r }))
      .filter((e): e is { info: NodeInfo; r: BoneRotation } => !!e.info)
      .sort((a, b) => this.depth(a.info.node) - this.depth(b.info.node));
    for (const { info, r } of entries) {
      const node = info.node;
      const worldQ = this.modelQuat(node, new THREE.Quaternion());
      const parentQ = this.modelQuat(node.parent!, new THREE.Quaternion());
      const q = rotationQuat(r, new THREE.Quaternion());
      node.quaternion.copy(parentQ.invert().multiply(q.multiply(worldQ)));
      node.updateMatrixWorld(true);
    }
  }

  /** Two-bone IK: keep each foot at its bind (planted) position and orientation. */
  private plantFeet(legs: { left: LegChain; right: LegChain }, left: number, right: number): void {
    for (const [leg, weight] of [[legs.left, left], [legs.right, right]] as const) {
      if (weight <= 0) continue;
      const bind = this.footBind.get(leg.foot)!;
      const current = this.modelPos(this.node(leg.foot)!, new THREE.Vector3());
      // Keep the posed x/z (stance width, steps) but pin the foot to the ground.
      const target = current.clone();
      target.y = THREE.MathUtils.lerp(current.y, bind.pos.y, weight);
      this.solveTwoBone(leg, target);
      // Foot keeps its planted orientation.
      const footInfo = this.info(leg.foot)!;
      const parentQ = this.modelQuat(footInfo.node.parent!, new THREE.Quaternion());
      const want = footInfo.node.quaternion.clone();
      const planted = parentQ.clone().invert().multiply(bind.q);
      footInfo.node.quaternion.copy(want.slerp(planted, weight));
    }
  }

  /** Analytic two-bone IK in model space, the knee bending forward (+Z) or back (leg.bend = -1). */
  solveTwoBone(leg: LegChain, target: THREE.Vector3): void {
    const thigh = this.node(leg.thigh)!;
    const shin = this.node(leg.shin)!;
    const foot = this.node(leg.foot)!;
    const a = this.modelPos(thigh, new THREE.Vector3());
    const b = this.modelPos(shin, new THREE.Vector3());
    const c = this.modelPos(foot, new THREE.Vector3());
    const lab = a.distanceTo(b);
    const lbc = b.distanceTo(c);
    const lat = Math.min(a.distanceTo(target), lab + lbc - 1e-4);

    // Current knee plane: use the existing knee direction, biased forward.
    const toTarget = target.clone().sub(a).normalize();
    const kneeDir = b.clone().sub(a);
    const pole = kneeDir.clone().sub(toTarget.clone().multiplyScalar(kneeDir.dot(toTarget)));
    const bend = leg.bend ?? 1;
    pole.add(new THREE.Vector3(0, 0, 0.02 * bend));
    if (pole.lengthSq() < 1e-8) pole.set(0, 0, bend);
    pole.normalize();

    // Knee position from the law of cosines.
    const cosA = THREE.MathUtils.clamp((lab * lab + lat * lat - lbc * lbc) / (2 * lab * lat), -1, 1);
    const sinA = Math.sqrt(1 - cosA * cosA);
    const knee = a.clone().addScaledVector(toTarget, lab * cosA).addScaledVector(pole, lab * sinA);

    // Rotate thigh so that (a->b) points to (a->knee).
    this.aimChild(thigh, a, b, knee);
    // Recompute shin/foot positions and aim shin at the target.
    const b2 = this.modelPos(shin, new THREE.Vector3());
    const c2 = this.modelPos(foot, new THREE.Vector3());
    const endTarget = b2.clone().add(target.clone().sub(b2).normalize().multiplyScalar(lbc));
    this.aimChild(shin, b2, c2, endTarget);
  }

  /** Rotate `node` (pivot at `pivot`) so the direction pivot->from becomes pivot->to. */
  private aimChild(node: THREE.Object3D, pivot: THREE.Vector3, from: THREE.Vector3, to: THREE.Vector3): void {
    const d0 = from.clone().sub(pivot).normalize();
    const d1 = to.clone().sub(pivot).normalize();
    const delta = new THREE.Quaternion().setFromUnitVectors(d0, d1); // model space
    const worldQ = this.modelQuat(node, new THREE.Quaternion());
    const parentQ = this.modelQuat(node.parent!, new THREE.Quaternion());
    const newWorld = delta.multiply(worldQ);
    node.quaternion.copy(parentQ.invert().multiply(newWorld));
    node.updateMatrixWorld(true);
  }
}

// ---------------------------------------------------------------------------
// Pose math

export function mirrorName(name: string): string {
  if (name.endsWith('L')) return `${name.slice(0, -1)}R`;
  if (name.endsWith('R')) return `${name.slice(0, -1)}L`;
  return name;
}

/** Mirror a pose across the model's YZ plane (left <-> right). */
export function mirrorPose(p: Pose): Pose {
  const bones: Record<string, BoneRotation> = {};
  for (const [k, r] of Object.entries(p.bones ?? {})) {
    bones[mirrorName(k)] = { x: r.x, y: r.y === undefined ? undefined : -r.y, z: r.z === undefined ? undefined : -r.z };
  }
  const post: Record<string, BoneRotation> = {};
  for (const [k, r] of Object.entries(p.post ?? {})) {
    post[mirrorName(k)] = { x: r.x, y: r.y === undefined ? undefined : -r.y, z: r.z === undefined ? undefined : -r.z };
  }
  const aim: Record<string, BoneAim> = {};
  for (const [k, a] of Object.entries(p.aim ?? {})) {
    aim[mirrorName(k)] = { dir: [-a.dir[0], a.dir[1], a.dir[2]], twist: a.twist === undefined ? undefined : -a.twist };
  }
  return {
    ...p,
    plantLeft: p.plantRight,
    plantRight: p.plantLeft,
    bones,
    aim: p.aim ? aim : undefined,
    post: p.post ? post : undefined,
    pelvis: p.pelvis ? { ...p.pelvis, x: p.pelvis.x === undefined ? undefined : -p.pelvis.x } : undefined,
    root: p.root ? { ...p.root, x: p.root.x === undefined ? undefined : -p.root.x, yaw: p.root.yaw === undefined ? undefined : -p.root.yaw, roll: p.root.roll === undefined ? undefined : -p.root.roll } : undefined,
  };
}

/** Deep-merge poses: later poses add their bone rotations on top (component sum). */
export function addPoses(...poses: Pose[]): Pose {
  const out: Pose = { bones: {} };
  for (const p of poses) {
    for (const [k, r] of Object.entries(p.bones ?? {})) {
      const o = (out.bones![k] ??= {});
      o.x = (o.x ?? 0) + (r.x ?? 0);
      o.y = (o.y ?? 0) + (r.y ?? 0);
      o.z = (o.z ?? 0) + (r.z ?? 0);
    }
    if (p.pelvis) {
      out.pelvis ??= {};
      for (const a of ['x', 'y', 'z'] as const) out.pelvis[a] = (out.pelvis[a] ?? 0) + (p.pelvis[a] ?? 0);
    }
    if (p.root) {
      out.root ??= {};
      for (const a of ['x', 'y', 'z', 'yaw', 'pitch', 'roll'] as const) out.root[a] = (out.root[a] ?? 0) + (p.root[a] ?? 0);
    }
    for (const k of ['advance', 'plantFeet', 'plantLeft', 'plantRight', 'plantFront', 'expression', 'scale'] as const) {
      if (p[k] !== undefined) (out as Record<string, unknown>)[k] = p[k];
    }
    if (p.fx) out.fx = { ...(out.fx ?? {}), ...p.fx };
  }
  return out;
}

const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();

/** Interpolate two poses (rotations slerped as quaternions, other channels lerped). */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const bones: Record<string, BoneRotation> = {};
  const names = new Set([...Object.keys(a.bones ?? {}), ...Object.keys(b.bones ?? {})]);
  for (const n of names) {
    const ra = a.bones?.[n] ?? {};
    const rb = b.bones?.[n] ?? {};
    rotationQuat(ra, _qa);
    rotationQuat(rb, _qb);
    _qa.slerp(_qb, t);
    _e.setFromQuaternion(_qa, 'YXZ');
    bones[n] = { x: _e.x / DEG, y: _e.y / DEG, z: _e.z / DEG };
  }
  let post: Record<string, BoneRotation> | undefined;
  if (a.post || b.post) {
    post = {};
    for (const n of new Set([...Object.keys(a.post ?? {}), ...Object.keys(b.post ?? {})])) {
      rotationQuat(a.post?.[n] ?? {}, _qa);
      rotationQuat(b.post?.[n] ?? {}, _qb);
      _qa.slerp(_qb, t);
      _e.setFromQuaternion(_qa, 'YXZ');
      post[n] = { x: _e.x / DEG, y: _e.y / DEG, z: _e.z / DEG };
    }
  }
  const lerp = (x?: number, y?: number) => (x === undefined && y === undefined ? undefined : (x ?? 0) + ((y ?? 0) - (x ?? 0)) * t);
  // Root angles take the short way round (a clip can end a full spin at 360).
  const lerpAngle = (x?: number, y?: number) => {
    if (x === undefined && y === undefined) return undefined;
    const a = x ?? 0;
    const d = ((((y ?? 0) - a + 180) % 360) + 360) % 360 - 180;
    return a + d * t;
  };
  const plant = (p: Pose, side: 'plantLeft' | 'plantRight' | 'plantFront') => p[side] ?? p.plantFeet;
  const lerpObj = <T extends Record<string, number | undefined>>(x?: T, y?: T): T | undefined => {
    if (!x && !y) return undefined;
    const keys = new Set([...Object.keys(x ?? {}), ...Object.keys(y ?? {})]);
    const o: Record<string, number | undefined> = {};
    for (const k of keys) o[k] = lerp(x?.[k], y?.[k]);
    return o as T;
  };
  const fx: Record<string, number> = {};
  for (const k of new Set([...Object.keys(a.fx ?? {}), ...Object.keys(b.fx ?? {})])) fx[k] = lerp(a.fx?.[k], b.fx?.[k]) ?? 0;
  let aim: Record<string, BoneAim> | undefined;
  if (a.aim || b.aim) {
    aim = {};
    for (const n of new Set([...Object.keys(a.aim ?? {}), ...Object.keys(b.aim ?? {})])) {
      const da = a.aim?.[n], db = b.aim?.[n];
      if (da && db) {
        const v = new THREE.Vector3(...da.dir).normalize().lerp(new THREE.Vector3(...db.dir).normalize(), t);
        if (v.lengthSq() < 1e-6) v.set(...db.dir);
        aim[n] = { dir: v.normalize().toArray() as Vec3, twist: lerp(da.twist, db.twist) };
      } else {
        // Only one side aims this bone: switch halfway (keys should define both).
        aim[n] = (t < 0.5 ? da : db) ?? (da ?? db)!;
      }
    }
  }
  return {
    bones,
    aim,
    post,
    pelvis: lerpObj(a.pelvis, b.pelvis),
    root: a.root || b.root
      ? {
          x: lerp(a.root?.x, b.root?.x), y: lerp(a.root?.y, b.root?.y), z: lerp(a.root?.z, b.root?.z),
          yaw: lerpAngle(a.root?.yaw, b.root?.yaw), pitch: lerpAngle(a.root?.pitch, b.root?.pitch), roll: lerpAngle(a.root?.roll, b.root?.roll),
        }
      : undefined,
    advance: lerp(a.advance, b.advance),
    plantFeet: lerp(a.plantFeet, b.plantFeet),
    plantLeft: a.plantLeft !== undefined || b.plantLeft !== undefined ? lerp(plant(a, 'plantLeft'), plant(b, 'plantLeft')) : undefined,
    plantRight: a.plantRight !== undefined || b.plantRight !== undefined ? lerp(plant(a, 'plantRight'), plant(b, 'plantRight')) : undefined,
    plantFront: a.plantFront !== undefined || b.plantFront !== undefined ? lerp(plant(a, 'plantFront'), plant(b, 'plantFront')) : undefined,
    expression: t < 0.5 ? a.expression ?? b.expression : b.expression ?? a.expression,
    fx,
    scale: lerp(a.scale ?? 1, b.scale ?? 1),
  };
}

