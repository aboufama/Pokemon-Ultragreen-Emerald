// Move choreography: picks the attacker's clip for a move and reacts to its
// events (impact / release / aura / emit) with VFX and the target's hit
// reaction. Categories come straight from decomp move data, so every move in
// the game maps to one of the per-species animation categories.

import * as THREE from 'three';
import type { MoveData } from '../data';
import type { Battler3D } from './battler';
import type { VfxSystem } from './vfx';

export type AnimCategory = 'physical_weak' | 'physical_strong' | 'special_weak' | 'special_strong' | 'status_self' | 'status_target';

const SELF_TARGETS = new Set(['MOVE_TARGET_USER', 'MOVE_TARGET_USER_OR_SELECTED', 'MOVE_TARGET_DEPENDS']);
export const STRONG_POWER = 75;

/** Gen 3 split is by type, so the animation style comes from contact/power/target instead. */
export function categorize(move: MoveData): AnimCategory {
  if (move.power === 0) return SELF_TARGETS.has(move.target) || move.target === 'MOVE_TARGET_USER' ? 'status_self' : 'status_target';
  const contact = move.flags.includes('FLAG_MAKES_CONTACT');
  const strong = move.power >= STRONG_POWER || move.power === 1; // power 1 = variable (e.g. Low Kick)
  if (contact) return strong ? 'physical_strong' : 'physical_weak';
  return strong ? 'special_strong' : 'special_weak';
}

export function clipFor(attacker: Battler3D, move: MoveData): string {
  return attacker.profile.moveClips[move.const] ?? categorize(move);
}

/** World position of a rig bone (semantic name), falling back to the body center. */
export function bonePoint(b: Battler3D, name: string): THREE.Vector3 {
  const node = b.inst.rig.node(name);
  if (!node) return bodyPoint(b, 0.6);
  node.updateWorldMatrix(true, false);
  return new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
}

export function bodyPoint(b: Battler3D, heightFraction: number): THREE.Vector3 {
  b.inst.root.updateWorldMatrix(true, false);
  const p = new THREE.Vector3().setFromMatrixPosition(b.inst.root.matrixWorld);
  p.y += b.height * heightFraction;
  return p;
}

export interface PerformHooks {
  /** Called for every hit that lands (multi-hit moves call it several times). */
  onHit?: (index: number) => void;
}

function hitReaction(target: Battler3D, vfx: VfxSystem, strong: boolean): void {
  target.blink(0.45);
  void target.perform('hit');
  if (strong) vfx.shake(0.06, 0.3);
}

/** Impact VFX at the target for a contact move. */
function contactFx(move: MoveData, target: Battler3D, vfx: VfxSystem, index: number): void {
  const at = bodyPoint(target, 0.55);
  const upp = vfx.unitsPerPixel(at);
  const jitter = new THREE.Vector3((index % 2 ? 6 : -6) * upp, (index % 2 ? -4 : 4) * upp, 0);
  const strong = categorize(move) === 'physical_strong';
  if (move.type === 'TYPE_FIRE') {
    void vfx.sprite('Impact', at.clone().add(jitter), { px: 32, life: 0.2, scaleFrom: 0.6, scaleTo: 1.1 });
    void vfx.sprite('FirePlume', at.clone().add(new THREE.Vector3(0, -8 * upp, 0)), { px: 32, fps: 14 });
  } else if (move.type === 'TYPE_NORMAL' && !move.name.includes('KICK') && !strong) {
    void vfx.sprite('ClawSlash', at.clone().add(jitter), { px: 32, fps: 18 });
  } else {
    void vfx.sprite('Impact', at.clone().add(jitter), { px: strong ? 40 : 30, life: strong ? 0.28 : 0.18, scaleFrom: 0.5, scaleTo: 1.15 });
    if (move.name.includes('KICK')) void vfx.sprite('HumanoidFoot', at.clone().add(jitter.multiplyScalar(-1)), { px: 24, life: 0.2 });
  }
}

export async function performMove(attacker: Battler3D, target: Battler3D, move: MoveData, vfx: VfxSystem, hooks: PerformHooks = {}): Promise<void> {
  const clip = clipFor(attacker, move);
  const category = categorize(move);
  attacker.target = target;
  let hits = 0;
  const pending: Promise<void>[] = [];

  attacker.onEvent = (name) => {
    if (name === 'impact') {
      contactFx(move, target, vfx, hits);
      hooks.onHit?.(hits++);
      hitReaction(target, vfx, category === 'physical_strong');
    } else if (name === 'release') {
      pending.push(releaseFx(attacker, target, move, vfx, category).then(() => {
        hooks.onHit?.(hits++);
        hitReaction(target, vfx, category === 'special_strong');
      }));
    } else if (name === 'charge') {
      const hand = bonePoint(attacker, 'handR');
      for (let i = 0; i < 3; i++) vfx.after(i * 0.15, () => void vfx.sprite('SmallEmber', hand, { px: 24, fps: 12 }));
    } else if (name === 'aura') {
      auraFx(attacker, vfx);
    } else if (name === 'emit') {
      pending.push(emitFx(attacker, target, move, vfx));
    } else if (name === 'cry') {
      vfx.shake(0.02, 0.25);
    }
  };
  await attacker.perform(clip);
  await Promise.all(pending);
  attacker.onEvent = null;
}

async function releaseFx(attacker: Battler3D, target: Battler3D, move: MoveData, vfx: VfxSystem, category: AnimCategory): Promise<void> {
  const from = bonePoint(attacker, 'head');
  from.add(new THREE.Vector3(0, -0.05, 0));
  const to = bodyPoint(target, 0.55);
  const fire = move.type === 'TYPE_FIRE';
  if (category === 'special_weak') {
    // Ember: a small fireball arcs over, then bursts on the target.
    await vfx.projectile(fire ? 'SmallEmber' : 'Impact', from, to, 0.45, { px: 24, fps: 12, arc: 0.25 });
    void vfx.sprite(fire ? 'Fire' : 'Impact', to, { px: 32, fps: 16, life: 0.45 });
    return;
  }
  // Flamethrower & co: a stream of flame sprites for ~0.8s.
  const stream: Promise<void>[] = [];
  const count = 12;
  for (let i = 0; i < count; i++) {
    stream.push(new Promise((resolve) => {
      vfx.after(i * 0.065, () => {
        const wobble = new THREE.Vector3(0, Math.sin(i * 1.7) * 0.06, Math.cos(i * 1.3) * 0.06);
        void vfx.projectile(fire ? 'Fire' : 'Impact', from, to.clone().add(wobble), 0.32, { px: 20 + (i % 3) * 4, fps: 20, arc: 0.05 }).then(resolve);
      });
    }));
  }
  await Promise.all(stream);
  void vfx.sprite(fire ? 'FirePlume' : 'Impact', to, { px: 40, fps: 12 });
  vfx.shake(0.05, 0.35);
}

function auraFx(attacker: Battler3D, vfx: VfxSystem): void {
  // Focus energy streaks rising around the body (Bulk Up / Focus Energy).
  for (let i = 0; i < 10; i++) {
    vfx.after(i * 0.06, () => {
      const base = bodyPoint(attacker, 0.1 + (i % 3) * 0.12);
      const ang = (i / 10) * Math.PI * 2;
      base.add(new THREE.Vector3(Math.cos(ang) * 0.35, 0, Math.sin(ang) * 0.35).multiplyScalar(attacker.height));
      void vfx.sprite('FocusEnergy', base, { px: 16, fps: 16, life: 0.5, velocity: new THREE.Vector3(0, attacker.height * 1.4, 0) });
    });
  }
}

async function emitFx(attacker: Battler3D, target: Battler3D, move: MoveData, vfx: VfxSystem): Promise<void> {
  const from = bonePoint(attacker, 'head');
  const to = bodyPoint(target, 0.6);
  const sprite = move.name.includes('SAND') ? 'MudUnk' : 'NoiseLine';
  const waves: Promise<void>[] = [];
  for (let i = 0; i < 4; i++) {
    waves.push(new Promise((resolve) => vfx.after(i * 0.12, () => void vfx.projectile(sprite, from, to, 0.4, { px: 14 + i * 3, fps: 12 }).then(resolve))));
  }
  await Promise.all(waves);
}
