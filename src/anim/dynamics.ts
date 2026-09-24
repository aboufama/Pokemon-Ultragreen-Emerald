// Secondary motion: spring chains for loose parts (mane, tail, feathers) and a
// second-order system for smoothing single values.
//
// Spring chains follow the "dynamic bone" approach: every joint after the
// chain root, plus a virtual end past the last bone, is a Verlet particle in
// world space, pulled back toward where the animation puts it (elasticity),
// kept within a drift limit and at its bone length; then the bones are
// rotated to point at the particles. Body motion is inherited through world
// space, so loose parts lag, overshoot and settle on their own: follow-through
// without hand-animating it.

import * as THREE from 'three';

export interface SpringParams {
  /** Fraction of velocity lost per 60 Hz step (0..1). */
  damping?: number;
  /** Pull toward the animated position per 60 Hz step (0..1). */
  elasticity?: number;
  /** Max drift from the animated position, as a fraction of the segment length. */
  maxDrift?: number;
}

export interface SpringChainSpec extends SpringParams {
  /** Semantic bone names from the chain root to its last bone. */
  bones: string[];
  /**
   * The virtual end past the last bone, in that bone's local frame. Measured
   * from the skin weights when omitted (see skinnedExtent).
   */
  tip?: [number, number, number];
}

interface Particle {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  anim: THREE.Vector3;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _pq = new THREE.Quaternion();
const _wq = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();

export class SpringChain {
  private readonly particles: Particle[];
  private initialized = false;

  constructor(private readonly bones: THREE.Object3D[], private readonly tip: THREE.Vector3, private readonly params: SpringParams = {}) {
    this.particles = Array.from({ length: bones.length + 1 }, () => ({ pos: new THREE.Vector3(), prev: new THREE.Vector3(), anim: new THREE.Vector3() }));
  }

  /** Forget velocities (teleports, re-shown battlers). */
  reset(): void {
    this.initialized = false;
  }

  /** Animated positions of every particle: bone pivots plus the virtual end. */
  private readAnimated(): void {
    const n = this.bones.length;
    for (let i = 0; i < n; i++) {
      this.bones[i].updateWorldMatrix(true, false);
      this.particles[i].anim.setFromMatrixPosition(this.bones[i].matrixWorld);
    }
    this.particles[n].anim.copy(this.tip).applyMatrix4(this.bones[n - 1].matrixWorld);
  }

  /** Run after the pose and the battler's transform have been applied. */
  update(dt: number): void {
    this.readAnimated();
    const ps = this.particles;
    if (!this.initialized) {
      for (const p of ps) {
        p.pos.copy(p.anim);
        p.prev.copy(p.anim);
      }
      this.initialized = true;
    }
    // Rates are tuned per 60 Hz step; convert for other step sizes.
    const steps = Math.max(1e-3, dt * 60);
    const damping = 1 - Math.pow(1 - (this.params.damping ?? 0.14), steps);
    const elasticity = 1 - Math.pow(1 - (this.params.elasticity ?? 0.1), steps);
    const maxDrift = this.params.maxDrift ?? 0.6;
    ps[0].pos.copy(ps[0].anim);
    ps[0].prev.copy(ps[0].anim);
    for (let i = 1; i < ps.length; i++) {
      const p = ps[i];
      const segment = p.anim.distanceTo(ps[i - 1].anim);
      if (segment < 1e-6) {
        p.pos.copy(p.anim);
        p.prev.copy(p.anim);
        continue;
      }
      // Verlet with damping.
      _a.subVectors(p.pos, p.prev).multiplyScalar(1 - damping);
      p.prev.copy(p.pos);
      p.pos.add(_a);
      // Pull toward the animated pose, and never drift too far from it.
      p.pos.lerp(p.anim, elasticity);
      _b.subVectors(p.pos, p.anim);
      const limit = segment * maxDrift;
      if (_b.length() > limit) p.pos.copy(p.anim).addScaledVector(_b.normalize(), limit);
      // Keep the bone length.
      _b.subVectors(p.pos, ps[i - 1].pos);
      const len = _b.length();
      if (len > 1e-6) p.pos.copy(ps[i - 1].pos).addScaledVector(_b, segment / len);
    }
    // Rotate each bone so its child (or the virtual end) points at the
    // simulated particle. Updating a bone refreshes its descendants, so the
    // next bone's current position is always up to date.
    for (let i = 0; i < this.bones.length; i++) {
      const bone = this.bones[i];
      bone.updateWorldMatrix(true, false);
      bone.matrixWorld.decompose(_p, _wq, _s);
      if (i + 1 < this.bones.length) _a.setFromMatrixPosition(this.bones[i + 1].matrixWorld);
      else _a.copy(this.tip).applyMatrix4(bone.matrixWorld);
      const from = _a.sub(_p);
      const to = _b.subVectors(ps[i + 1].pos, _p);
      if (from.lengthSq() < 1e-12 || to.lengthSq() < 1e-12) continue;
      _q.setFromUnitVectors(from.normalize(), to.normalize());
      // New world rotation = delta * world, back into the parent's frame.
      _wq.premultiply(_q);
      bone.parent!.updateWorldMatrix(true, false);
      bone.parent!.matrixWorld.decompose(_p, _pq, _s);
      bone.quaternion.copy(_pq.invert().multiply(_wq));
      bone.updateMatrixWorld(true);
    }
  }
}

/**
 * Where a loose part's mass is, in the local frame of the bone it is skinned
 * to: the weighted centroid direction of the vertices the bone moves, at the
 * median distance along it (`quantile` 0.5; near 1 gives its far end). Used
 * as the virtual end of single-bone chains (manes, tails and feathers are
 * often one bone in game rigs) and to find beak and jaw tips.
 */
export function skinnedExtent(root: THREE.Object3D, bone: THREE.Object3D, quantile = 0.5): THREE.Vector3 | null {
  const sum = new THREE.Vector3();
  let weight = 0;
  const points: THREE.Vector3[] = [];
  const v = new THREE.Vector3();
  root.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh) return;
    const k = mesh.skeleton.bones.indexOf(bone as THREE.Bone);
    if (k < 0) return;
    const pos = mesh.geometry.getAttribute('position');
    const idx = mesh.geometry.getAttribute('skinIndex');
    const wts = mesh.geometry.getAttribute('skinWeight');
    if (!pos || !idx || !wts) return;
    const toLocal = new THREE.Matrix4().multiplyMatrices(mesh.skeleton.boneInverses[k], mesh.bindMatrix);
    for (let i = 0; i < pos.count; i++) {
      let w = 0;
      for (let c = 0; c < 4; c++) if (idx.getComponent(i, c) === k) w += wts.getComponent(i, c);
      if (w < 0.05) continue;
      v.fromBufferAttribute(pos, i).applyMatrix4(toLocal);
      sum.addScaledVector(v, w);
      weight += w;
      if (w > 0.5) points.push(v.clone());
    }
  });
  if (weight <= 0) return null;
  const dir = sum.divideScalar(weight);
  if (dir.lengthSq() < 1e-12) return null;
  dir.normalize();
  const along = points.map((p) => p.dot(dir)).sort((a, b) => a - b);
  const length = along.length ? along[Math.min(along.length - 1, Math.floor(along.length * quantile))] : 0;
  return length > 0 ? dir.multiplyScalar(length) : null;
}

/**
 * Second-order system (natural frequency f in Hz, damping zeta, initial
 * response r): y follows x with lag, overshoot or anticipation. r > 1
 * overshoots at the start, r < 0 anticipates, zeta < 1 wobbles.
 */
export class SecondOrder {
  private xp: number;
  private y: number;
  private yd = 0;
  private readonly k1: number;
  private readonly k2: number;
  private readonly k3: number;

  constructor(f: number, zeta: number, r: number, x0 = 0) {
    this.k1 = zeta / (Math.PI * f);
    this.k2 = 1 / ((2 * Math.PI * f) * (2 * Math.PI * f));
    this.k3 = (r * zeta) / (2 * Math.PI * f);
    this.xp = x0;
    this.y = x0;
  }

  get value(): number {
    return this.y;
  }

  /** Kick the output's velocity (impulses such as hit recoils). */
  impulse(v: number): void {
    this.yd += v;
  }

  reset(x: number): void {
    this.xp = x;
    this.y = x;
    this.yd = 0;
  }

  update(dt: number, x: number): number {
    if (dt <= 0) return this.y;
    const xd = (x - this.xp) / dt;
    this.xp = x;
    // Clamp k2 for stability at large steps.
    const k2 = Math.max(this.k2, (dt * dt) / 2 + (dt * this.k1) / 2, dt * this.k1);
    this.y += dt * this.yd;
    this.yd += (dt * (x + this.k3 * xd - this.y - this.k1 * this.yd)) / k2;
    return this.y;
  }
}

/** Small deterministic PRNG (mulberry32) for procedural timing. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
