// Move choreography: picks the attacker's clip for a move and reacts to its
// events with VFX and the target's hit reaction.
//
// Every move has a motif (src/battle3d/motifs.ts: bite, kick, breath, jet,
// beam, leaf volley, quake...) read from its name, effect, contact flag and
// type. The clip is chosen per species: an explicit per-move clip, else the
// species' clip for the motif (strong variant first), else the category clip
// (physical/special x weak/strong, status). Effects take their shape from the
// motif, their look from the move's type, and leave from the species'
// emitter for that motif (mouth, cannons, flower, hands...).
//
// Some motifs move more than the attacker: a toss's `grab` hands the foe to
// the attacker's grip (Battler3D.grabbedBy) until its `throw` hurls it back
// down into its place, landing on the `impact` (or the impact drops it);
// a burrow's `dig` throws up the ground as the attacker sinks out of sight;
// afterimages and Flash's white-out are drawn by the pixel pipeline, as
// Emerald draws them with sprite clones and palette fades.

import * as THREE from 'three';
import type { MoveData } from '../data';
import { toScreen } from '../render3d/stage';
import type { Battler3D } from './battler';
import type { VfxSystem } from './vfx';
import { MOTIFS, type Motif, isStrong, motifOf } from './motifs';
import { TYPE_COLOR, statusSprite, typeFx } from './type_fx';

export type AnimCategory = 'physical_weak' | 'physical_strong' | 'special_weak' | 'special_strong' | 'status_self' | 'status_target';

const SELF_TARGETS = new Set(['MOVE_TARGET_USER', 'MOVE_TARGET_USER_OR_SELECTED', 'MOVE_TARGET_DEPENDS']);
export { STRONG_POWER } from './motifs';

/**
 * The category clip for a move: its motif's body kind (a contact-flagged
 * Overheat is still a special burst; Earthquake is a physical stomp), weak or
 * strong by power.
 */
export function categorize(move: MoveData): AnimCategory {
  const motif = motifOf(move);
  const strong = isStrong(move);
  if (move.power === 0 || motif === 'other') {
    if (move.power === 0) return SELF_TARGETS.has(move.target) ? 'status_self' : 'status_target';
    return move.flags.includes('FLAG_MAKES_CONTACT') ? (strong ? 'physical_strong' : 'physical_weak') : strong ? 'special_strong' : 'special_weak';
  }
  const fallback = MOTIFS[motif].fallback;
  if (fallback === 'status_self' || fallback === 'status_target') return fallback;
  return `${fallback}_${strong ? 'strong' : 'weak'}`;
}

/**
 * Clip for a move: per-move override, then the motif clip for the body part
 * the species performs it with (`<motif>@<part>`, from moveParts), then the
 * motif clip (strong variants first), then the category clip.
 */
export function clipFor(attacker: Battler3D, move: MoveData): string {
  const p = attacker.profile;
  const explicit = p.moveClips[move.const];
  if (explicit && p.clips[explicit]) return explicit;
  const motif = motifOf(move);
  const part = p.moveParts?.[move.const];
  const bases = part ? [`${motif}@${part}`, motif] : [motif];
  const keys = bases.flatMap((m) => (isStrong(move) ? [`${m}_strong`, m] : [m]));
  for (const k of keys) {
    const name = p.motifClips?.[k] ?? k;
    if (p.clips[name]) return name;
  }
  return categorize(move);
}

/** World position of a rig bone (semantic name), falling back to the body center. */
export function bonePoint(b: Battler3D, name: string): THREE.Vector3 {
  const node = b.inst.rig.node(name);
  if (!node) return bodyPoint(b, 0.6);
  node.updateWorldMatrix(true, false);
  return new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
}

/**
 * A point on the body's axis, a fraction of its height up from its feet
 * along the body (so it stays on the body when it leans, flips or lies down).
 */
export function bodyPoint(b: Battler3D, heightFraction: number): THREE.Vector3 {
  b.inst.root.updateWorldMatrix(true, false);
  // The root's local unit is the body's height.
  return b.inst.root.localToWorld(new THREE.Vector3(0, heightFraction, 0));
}

/** The point on the ground under the middle of a battler's body (as shown: carried, lying, leaping or sunk). */
export function groundPoint(b: Battler3D): THREE.Vector3 {
  const p = bodyPoint(b, 0.4);
  p.y = b.stage.slots[b.slot].getWorldPosition(new THREE.Vector3()).y;
  return p;
}

/**
 * Slide a point toward the camera along its view ray: same screen position
 * and pixel scale, but in front of the body it sits in (sprites drawn inside
 * a model would be hidden by it).
 */
export function towardCamera(b: Battler3D, p: THREE.Vector3, heights: number): THREE.Vector3 {
  const cam = b.stage.homeCamera.position;
  return p.clone().add(cam.clone().sub(p).normalize().multiplyScalar(b.height * heights));
}

/**
 * Where effects hit a battler: in front of its body center, raised while
 * that projects below y=92 (the player's back view is cut off by the text
 * box, so its visible body is higher up).
 */
export function hitPoint(b: Battler3D, fraction = 0.55): THREE.Vector3 {
  let f = fraction;
  let p = bodyPoint(b, f);
  while (f < 0.85 && toScreen(b.stage.homeCamera, p)[1] > 92) {
    f += 0.05;
    p = bodyPoint(b, f);
  }
  return towardCamera(b, p, 0.35);
}

/** Where breath/beam effects leave the attacker: its mouth (or in front of its head). */
export function mouthPoint(b: Battler3D): THREE.Vector3 {
  return towardCamera(b, b.emitterPoints('mouth')[0], 0.04);
}

/**
 * The emitter a move's effect leaves from on this species: the body part it
 * is performed with when that part emits (not the whole body), else the
 * species' emitter for the motif, else the motif's default.
 */
export function emitterName(b: Battler3D, motif: Motif, move?: MoveData): string {
  const part = move && b.profile.moveParts?.[move.const];
  if (part && part !== 'body' && b.hasEmitter(part)) return part;
  return b.profile.emitterFor?.[motif] ?? MOTIFS[motif].emitter ?? 'mouth';
}

/** Effect origins for a move's motif, nudged in front of the body. */
export function emitterPoints(b: Battler3D, motif: Motif, move?: MoveData): THREE.Vector3[] {
  const name = emitterName(b, motif, move);
  return b.emitterPoints(name).map((p) => towardCamera(b, p, name === 'mouth' ? 0.04 : 0.08));
}

export interface PerformHooks {
  /** Called for every hit that lands (multi-hit moves call it several times). */
  onHit?: (index: number) => void;
}

function hitReaction(target: Battler3D, vfx: VfxSystem, strong: boolean, move?: MoveData): void {
  target.blink(0.45);
  target.recoil(strong ? 1 : 0.6);
  void target.perform('hit');
  if (strong) vfx.shake(0.06, 0.3);
  // The target's palette flashes toward the move's type color.
  const color = move && TYPE_COLOR[move.type];
  if (color) target.flashTint(color, strong ? 0.55 : 0.4, strong ? 0.4 : 0.28);
}

/** Motifs whose big versions fade the backdrop toward the type color. */
const BACKDROP_FADES = new Set<Motif>(['breath', 'jet', 'beam', 'burst', 'erupt', 'wave', 'storm', 'bolt', 'mind', 'quake']);

/**
 * Fade the battle background toward a darkened type color while a big move
 * plays, then back (Emerald fades BG palettes for Hyper Beam, Thunder...).
 */
function backdropFade(attacker: Battler3D, move: MoveData, vfx: VfxSystem, hold: Promise<unknown>): void {
  const env = attacker.stage.environment;
  const rgb = TYPE_COLOR[move.type] ?? [40, 40, 56];
  if (!env) return;
  const color = new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).multiplyScalar(0.55);
  const peak = 0.24;
  vfx.tween(0.25, (t) => env.setTint(color, peak * t * t * (3 - 2 * t)));
  void hold.then(() => vfx.tween(0.35, (t) => env.setTint(color, peak * (1 - t)), () => env.setTint(color, 0)));
}

const sleep = (vfx: VfxSystem, s: number) => new Promise<void>((resolve) => vfx.after(s, resolve));

/**
 * Keep launching projectiles from the emitter(s) to the target until
 * stopped: breath streams, water jets, beams. Resolves `arrived` when the
 * first one lands and `done` when the last one has.
 */
function spray(
  vfx: VfxSystem,
  sheet: string,
  from: () => THREE.Vector3[],
  to: () => THREE.Vector3,
  o: { every: number; travel: number; px: number; fps?: number; arc?: number; scaleFrom?: number; scaleTo?: number; max: number; wobble?: number; orient?: number },
): { stop: () => void; arrived: Promise<void>; done: Promise<void> } {
  let stopped = false;
  let elapsed = 0;
  let resolveArrived!: () => void;
  const arrived = new Promise<void>((r) => (resolveArrived = r));
  const flights: Promise<void>[] = [];
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => (resolveDone = r));
  let i = 0;
  const tick = () => {
    if (stopped || elapsed > o.max) {
      void Promise.all(flights).then(() => {
        resolveArrived();
        resolveDone();
      });
      return;
    }
    const target = to();
    for (const start of from()) {
      const w = o.wobble ?? 0.05;
      const end = target.clone().add(new THREE.Vector3(0, Math.sin(i * 1.7) * w, Math.cos(i * 1.3) * w));
      const flight = vfx.projectile(sheet, start, end, o.travel, { px: o.px + (i % 3) * 3, fps: o.fps ?? 20, arc: o.arc ?? 0.03, scaleFrom: o.scaleFrom ?? 0.5, scaleTo: o.scaleTo ?? 1.1, orient: o.orient });
      flights.push(flight);
      if (i === 0) void flight.then(resolveArrived);
    }
    i++;
    elapsed += o.every;
    vfx.after(o.every, tick);
  };
  tick();
  return { stop: () => (stopped = true), arrived, done };
}

/** Impact VFX at the target for a contact move: shape from the motif, color from the type. */
function contactFx(move: MoveData, motif: Motif, target: Battler3D, vfx: VfxSystem, index: number): void {
  const at = hitPoint(target);
  const upp = vfx.unitsPerPixel(at);
  const jitter = new THREE.Vector3((index % 2 ? 6 : -6) * upp, (index % 2 ? -4 : 4) * upp, 0);
  const strong = isStrong(move);
  const fx = typeFx(move.type);
  const typed = move.type !== 'TYPE_NORMAL';
  const extra = () => {
    if (typed && fx.extra) void vfx.sprite(fx.extra, at.clone().add(new THREE.Vector3(0, -8 * upp, 0)), { px: 32, fps: 14, life: 0.36, loop: true });
  };
  switch (motif) {
    case 'bite':
      // Jaws closing on the foe: the upper and lower teeth snap together.
      void vfx.sprite('SharpTeeth', at.clone().add(new THREE.Vector3(0, 10 * upp, 0)), { px: 44, fps: 0, life: 0.22, velocity: new THREE.Vector3(0, -36 * upp, 0) });
      void vfx.sprite('SharpTeeth', at.clone().add(new THREE.Vector3(0, -10 * upp, 0)), { px: 44, fps: 0, life: 0.22, rotation: Math.PI, velocity: new THREE.Vector3(0, 36 * upp, 0) });
      void vfx.sprite(fx.impact, at, { px: 28, life: 0.2, scaleFrom: 0.5, scaleTo: 1.1 });
      extra();
      return;
    case 'strike':
      if (!typed && !strong) {
        void vfx.sprite('ClawSlash', at.clone().add(jitter), { px: 32, fps: 18 });
        return;
      }
      void vfx.sprite(move.type === 'TYPE_GRASS' ? 'Cut' : 'ClawSlash', at.clone().add(jitter), { px: strong ? 40 : 32, fps: 18 });
      void vfx.sprite(fx.impact, at, { px: strong ? 36 : 28, life: 0.22, scaleFrom: 0.5, scaleTo: 1.1 });
      extra();
      return;
    case 'punch':
      void vfx.sprite('PunchImpact', at.clone().add(jitter), { px: strong ? 40 : 32, life: 0.24, scaleFrom: 0.6, scaleTo: 1.2 });
      extra();
      return;
    case 'kick':
      void vfx.sprite(fx.impact, at.clone().add(jitter), { px: strong ? 40 : 30, life: strong ? 0.28 : 0.2, scaleFrom: 0.5, scaleTo: 1.15 });
      void vfx.sprite('HumanoidFoot', at.clone().add(jitter.clone().multiplyScalar(-1)), { px: 24, life: 0.2 });
      extra();
      return;
    case 'slam':
    case 'tail':
      void vfx.sprite('SlamHit', at.clone().add(jitter), { px: 40, fps: 20 });
      void vfx.sprite(fx.impact, at, { px: strong ? 40 : 30, life: 0.26, scaleFrom: 0.5, scaleTo: 1.2 });
      extra();
      return;
    case 'peck':
    case 'horn':
      void vfx.sprite('HornHit', at.clone().add(jitter), { px: 32, life: 0.22 });
      extra();
      return;
    case 'wing':
      void vfx.sprite('WhiteFeather', at.clone().add(jitter), { px: 28, fps: 8, life: 0.5, velocity: new THREE.Vector3(0, -20 * upp, 0) });
      void vfx.sprite(fx.impact, at, { px: 32, life: 0.22, scaleFrom: 0.5, scaleTo: 1.15 });
      extra();
      return;
    case 'vine':
      void vfx.sprite('Vine', at.clone().add(jitter), { px: 36, fps: 16 });
      void vfx.sprite('Impact', at, { px: 26, life: 0.18 });
      return;
    case 'quake':
      quakeFx(target, vfx, strong);
      return;
    case 'toss':
      tossFx(move, target, vfx, strong);
      return;
    case 'burrow':
      // Bursting up out of the ground (or the water) under the foe.
      groundBurst(target, move, vfx, 1.5);
      void vfx.sprite(fx.impact, at, { px: 40, life: 0.28, scaleFrom: 0.5, scaleTo: 1.2 });
      vfx.shake(0.07, 0.4);
      return;
    default:
      void vfx.sprite(fx.impact, at.clone().add(jitter), { px: strong ? 40 : 30, life: strong ? 0.28 : 0.2, scaleFrom: 0.5, scaleTo: 1.15 });
      extra();
  }
}

/** The ground heaves under the foe: a long shake and dirt bursting along the ground. */
function quakeFx(target: Battler3D, vfx: VfxSystem, strong: boolean): void {
  vfx.shake(strong ? 0.09 : 0.06, 0.8);
  const ambience = target.stage.ambience;
  if (ambience) for (let i = 0; i < 3; i++) vfx.after(i * 0.12, () => ambience.puff(bodyPoint(target, 0).add(new THREE.Vector3((i - 1) * target.height * 0.4, 0, 0)), 1.5, target.height));
  for (let i = 0; i < 6; i++) {
    vfx.after(i * 0.08, () => {
      const p = bodyPoint(target, 0.02);
      p.x += (i % 2 ? 1 : -1) * target.height * (0.2 + 0.08 * i);
      void vfx.sprite(i % 2 ? 'DirtMound' : 'FlyingDirt', towardCamera(target, p, 0.2), { px: 32, life: 0.35, velocity: new THREE.Vector3(0, target.height * 0.8, 0) });
    });
  }
}

/**
 * A thrown foe hits the ground (Seismic Toss's SeismicTossRockScatter): an
 * impact on the body, dust and rocks bursting out where it landed, a heavy shake.
 */
function tossFx(move: MoveData, target: Battler3D, vfx: VfxSystem, strong: boolean): void {
  const at = hitPoint(target);
  const ground = groundPoint(target);
  vfx.shake(strong ? 0.09 : 0.07, 0.45);
  void vfx.sprite('SlamHit', at, { px: 44, fps: 20 });
  void vfx.sprite(typeFx(move.type).impact, at, { px: strong ? 44 : 36, life: 0.28, scaleFrom: 0.5, scaleTo: 1.2 });
  target.stage.ambience?.puff(ground, 1.8, target.height);
  const h = target.height;
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1;
    void vfx.sprite('Rocks', towardCamera(target, ground.clone().add(new THREE.Vector3(side * h * 0.2, h * 0.05, 0)), 0.3), {
      px: 14 + (i % 3) * 4, fps: 0, frame: i % 4, life: 0.42, spin: side * 6, velocity: new THREE.Vector3(side * h * (0.8 + i * 0.25), h * (1.6 - i * 0.2), 0),
    });
  }
}

/**
 * The ground bursting up under a battler: dirt mounds and clods (Dig), or a
 * splash and droplets from water (Dive), with dust on dry ground.
 */
function groundBurst(b: Battler3D, move: MoveData, vfx: VfxSystem, size: number): void {
  const water = move.type === 'TYPE_WATER';
  const ground = groundPoint(b);
  if (!water) b.stage.ambience?.puff(ground, size, b.height);
  const n = Math.round(4 * size);
  for (let i = 0; i < n; i++) {
    vfx.after(i * 0.04, () => {
      const p = ground.clone();
      p.x += (i % 2 ? 1 : -1) * b.height * (0.1 + 0.06 * i);
      const sheet = water ? (i % 2 ? 'Splash' : 'WaterDroplet') : i % 2 ? 'DirtMound' : 'FlyingDirt';
      void vfx.sprite(sheet, towardCamera(b, p, 0.3), { px: 24 + 6 * size, life: 0.4, velocity: new THREE.Vector3(0, b.height * (0.6 + 0.3 * size), 0) });
    });
  }
  if (water) void vfx.sprite('WaterColumn', towardCamera(b, ground.clone().add(new THREE.Vector3(0, b.height * 0.3, 0)), 0.3), { px: 36 + 8 * size, fps: 12, life: 0.45 });
}

/**
 * While a battler travels underground, the ground heaves above it: small
 * mounds of dirt (bubbles in water) where it passes. Returns a stop function.
 */
function tunnelFx(b: Battler3D, move: MoveData, vfx: VfxSystem): () => void {
  let stopped = false;
  let last: THREE.Vector3 | null = null;
  const water = move.type === 'TYPE_WATER';
  const tick = () => {
    if (stopped) return;
    const ground = groundPoint(b);
    const under = bodyPoint(b, 0.9).y < ground.y;
    if (under && (!last || last.distanceTo(ground) > b.height * 0.12)) {
      last = ground;
      void vfx.sprite(water ? 'SmallBubbles' : 'DirtMound', towardCamera(b, ground, 0.2), { px: 22, life: 0.3, scaleFrom: 0.6, scaleTo: 1 });
    }
    vfx.after(1 / 30, tick);
  };
  tick();
  // Stopped by the impact, or when the clip ends (performMove).
  return () => (stopped = true);
}

export async function performMove(attacker: Battler3D, target: Battler3D, move: MoveData, vfx: VfxSystem, hooks: PerformHooks = {}): Promise<void> {
  const clip = clipFor(attacker, move);
  const motif = motifOf(move);
  const strong = isStrong(move);
  attacker.target = target;
  let hits = 0;
  const pending: Promise<void>[] = [];
  let sustained: ReturnType<typeof spray> | null = null;
  let tunnel: (() => void) | null = null;
  const landed = () => {
    hooks.onHit?.(hits++);
    hitReaction(target, vfx, strong, move);
  };
  // Big moves fade the backdrop from their first charge/release until the clip ends.
  let resolveMove!: () => void;
  const moveDone = new Promise<void>((r) => (resolveMove = r));
  let faded = false;
  const fadeBackdrop = () => {
    if (faded || !strong || !BACKDROP_FADES.has(motif)) return;
    faded = true;
    backdropFade(attacker, move, vfx, moveDone);
  };

  attacker.onEvent = (name) => {
    if (name === 'impact') {
      tunnel?.();
      tunnel = null;
      if (motif === 'quake') fadeBackdrop();
      // A toss that never threw the foe drops it where it is.
      if (motif === 'toss') target.release();
      contactFx(move, motif, target, vfx, hits);
      landed();
    } else if (name === 'grab') {
      // From here the foe rides in the attacker's hands, flinching.
      target.grabbedBy(attacker);
      void target.perform('hit');
    } else if (name === 'throw') {
      // Hurled back down into its place, landing on the clip's impact after the throw.
      const events = attacker.profile.clips[clip]?.events ?? [];
      const at = events.find((e) => e.name === 'throw')?.t ?? 0;
      const land = events.find((e) => e.name === 'impact' && e.t > at)?.t;
      target.thrown(land === undefined ? 0.25 : land - at);
    } else if (name === 'dig') {
      // Going under: the ground bursts up around the attacker as it sinks,
      // and heaves along its way while it travels underground.
      groundBurst(attacker, move, vfx, 1);
      vfx.shake(0.03, 0.3);
      tunnel = tunnelFx(attacker, move, vfx);
    } else if (name === 'release') {
      fadeBackdrop();
      const r = releaseFx(attacker, target, move, motif, vfx);
      if ('stop' in r) {
        sustained = r;
        pending.push(r.arrived.then(landed), r.done.then(() => void vfx.sprite(typeFx(move.type).extra ?? typeFx(move.type).burst, hitPoint(target), { px: 40, fps: 12, life: 0.42, loop: true })));
      } else {
        pending.push(r.then(landed));
      }
    } else if (name === 'releaseEnd') {
      sustained?.stop();
    } else if (name === 'charge') {
      fadeBackdrop();
      chargeFx(attacker, move, motif, vfx);
    } else if (name === 'aura') {
      auraFx(attacker, motif, move, vfx);
    } else if (name === 'emit') {
      pending.push(emitFx(attacker, target, move, motif, vfx));
    } else if (name === 'cry') {
      vfx.shake(0.02, 0.25);
    }
  };
  await attacker.perform(clip);
  // A clip that grabbed the foe and never threw it lets go at its end.
  target.release();
  (tunnel as (() => void) | null)?.();
  (sustained as ReturnType<typeof spray> | null)?.stop();
  await Promise.all(pending);
  resolveMove();
  attacker.onEvent = null;
}

/** Power gathering at the emitter while the attacker draws breath or charges. */
function chargeFx(attacker: Battler3D, move: MoveData, motif: Motif, vfx: VfxSystem): void {
  const fx = typeFx(move.type);
  const sheet = motif === 'beam' && move.type === 'TYPE_GRASS' ? 'Sunlight' : fx.charge;
  for (let k = 0; k < 3; k++) {
    vfx.after(k * 0.14, () => {
      for (let e = 0; e < emitterPoints(attacker, motif, move).length; e++) {
        const follow = () => emitterPoints(attacker, motif, move)[e] ?? mouthPoint(attacker);
        void vfx.sprite(sheet, follow(), { px: 14 + k * 4, fps: 12, life: 0.34, loop: true, follow });
      }
    });
  }
}

/**
 * Ranged effects on `release`. Sustained ones (breath, jet, beam) return a
 * spray that runs until the clip's `releaseEnd`; the rest resolve when they land.
 */
function releaseFx(attacker: Battler3D, target: Battler3D, move: MoveData, motif: Motif, vfx: VfxSystem): ReturnType<typeof spray> | Promise<void> {
  const fx = typeFx(move.type);
  const strong = isStrong(move);
  const from = () => emitterPoints(attacker, motif, move);
  const to = () => hitPoint(target);
  switch (motif) {
    case 'breath':
      return spray(vfx, fx.stream, from, to, { every: 0.056, travel: 0.3, px: 22, max: 1.2 });
    case 'jet':
      // Water columns laid along the jet (the art points up), dense enough to read as one stream.
      return spray(vfx, move.type === 'TYPE_WATER' ? 'WaterColumn' : fx.stream, from, to, { every: 0.022, travel: 0.2, px: strong ? 22 : 18, max: 1.2, arc: 0, wobble: 0.02, scaleFrom: 0.8, scaleTo: 1.3, orient: move.type === 'TYPE_WATER' ? Math.PI / 2 : undefined });
    case 'beam':
      return spray(vfx, fx.beam ?? fx.projectile, from, to, { every: 0.025, travel: 0.16, px: 14, max: 1.2, arc: 0, wobble: 0.015, scaleFrom: 0.8, scaleTo: 1 });
    case 'throw':
      if (move.name === 'ROCK SLIDE' || move.name === 'ROCK TOMB') return rockFall(target, move, vfx);
      return (async () => {
        // A volley: several projectiles in a fan, landing one after another.
        const sheet = move.type === 'TYPE_GRASS' ? 'Leaf' : move.type === 'TYPE_ROCK' ? 'Rocks' : fx.projectile;
        const shots: Promise<void>[] = [];
        for (let i = 0; i < 5; i++) {
          shots.push(new Promise((resolve) => vfx.after(i * 0.07, () => {
            const start = from()[i % from().length];
            const end = to().add(new THREE.Vector3(0, ((i % 3) - 1) * 0.06, 0));
            void vfx.projectile(sheet, start, end, 0.42, { px: 18, fps: 14, arc: attacker.height * (0.1 + (i % 3) * 0.08), spin: 8 }).then(resolve);
          })));
        }
        await Promise.all(shots);
        void vfx.sprite(fx.burst, to(), { px: 32, fps: 16, life: 0.4, loop: true });
      })();
    case 'wave':
      return (async () => {
        // A wave rolls across the ground from the attacker to the foe.
        const start = bodyPoint(attacker, 0.05);
        const end = bodyPoint(target, 0.05);
        const sheet = move.type === 'TYPE_WATER' ? (move.name.includes('MUD') ? 'MudUnk' : 'WaterColumn') : fx.stream;
        const crests: Promise<void>[] = [];
        for (let i = 0; i < 9; i++) {
          crests.push(new Promise((resolve) => vfx.after(i * 0.05, () => {
            const side = new THREE.Vector3(((i % 3) - 1) * attacker.height * 0.35, 0, 0);
            void vfx.projectile(sheet, start.clone().add(side), end.clone().add(side), 0.55, { px: 26, fps: 16, arc: attacker.height * 0.25 }).then(resolve);
          })));
        }
        await Promise.all(crests);
        void vfx.sprite(move.type === 'TYPE_WATER' ? 'Splash' : fx.burst, hitPoint(target), { px: 44, life: 0.4, scaleFrom: 0.6, scaleTo: 1.1 });
        vfx.shake(0.05, 0.3);
      })();
    case 'burst':
      return (async () => {
        // Flare around the attacker, then the blast reaches the foe.
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const p = bodyPoint(attacker, 0.5).add(new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)).multiplyScalar(attacker.height * 0.25));
          void vfx.sprite(fx.burst, towardCamera(attacker, p, 0.1), { px: 28, fps: 14, life: 0.4, velocity: new THREE.Vector3(Math.cos(ang), 0.6, Math.sin(ang)).multiplyScalar(attacker.height * 1.2) });
        }
        vfx.shake(0.06, 0.4);
        await sleep(vfx, 0.2);
        await vfx.projectile(fx.burst, from()[0], to(), 0.3, { px: 36, fps: 16, arc: 0.1, scaleFrom: 0.6, scaleTo: 1.4 });
        void vfx.sprite('Explosion', to(), { px: 48, fps: 14, life: 0.4 });
      })();
    case 'erupt':
      return (async () => {
        // The power arrives at the foe: roots from the ground, lightning from the sky, a vortex.
        const at = to();
        const upp = vfx.unitsPerPixel(at);
        if (move.type === 'TYPE_GRASS') {
          for (let i = 0; i < 6; i++) {
            vfx.after(i * 0.06, () => void vfx.sprite(i % 2 ? 'Roots' : 'Vine', at.clone().add(new THREE.Vector3(((i % 3) - 1) * 14 * upp, -18 * upp, 0)), { px: 36, fps: 12, life: 0.5, velocity: new THREE.Vector3(0, 60 * upp, 0) }));
          }
        } else if (move.type === 'TYPE_ELECTRIC') {
          for (let i = 0; i < 3; i++) vfx.after(i * 0.08, () => void vfx.sprite('Lightning', at.clone().add(new THREE.Vector3(0, 30 * upp, 0)), { px: 40, fps: 14, life: 0.3 }));
        } else {
          for (let i = 0; i < 6; i++) vfx.after(i * 0.07, () => void vfx.sprite(move.type === 'TYPE_FIRE' ? 'SpinningFire' : fx.burst, at, { px: 36, fps: 16, life: 0.4, spin: 6 }));
        }
        vfx.shake(0.05, 0.4);
        await sleep(vfx, 0.45);
      })();
    case 'drain':
      return (async () => {
        // Energy flows from the foe back to the attacker.
        const flows: Promise<void>[] = [];
        for (let i = 0; i < 6; i++) flows.push(new Promise((resolve) => vfx.after(i * 0.06, () => void vfx.projectile('BluegreenOrb', to(), bodyPoint(attacker, 0.55), 0.4, { px: 12, arc: 0.1 }).then(resolve))));
        await Promise.all(flows);
      })();
    case 'mind':
      return (async () => {
        for (let i = 0; i < 4; i++) vfx.after(i * 0.08, () => void vfx.sprite(fx.burst, to(), { px: 36, fps: 16, life: 0.3, scaleFrom: 1.3, scaleTo: 0.6 }));
        vfx.shake(0.03, 0.4);
        await sleep(vfx, 0.4);
      })();
    case 'bolt':
      return (async () => {
        await vfx.projectile(fx.stream, from()[0], to(), 0.18, { px: 32, fps: 20 });
        void vfx.sprite(fx.burst, to(), { px: 40, fps: 16, life: 0.4, loop: true });
      })();
    case 'storm':
      return (async () => {
        for (let i = 0; i < 6; i++) vfx.after(i * 0.07, () => void vfx.sprite(move.type === 'TYPE_ICE' ? 'Snowball' : 'Gust', to().add(new THREE.Vector3(((i % 3) - 1) * 0.1, 0, 0)), { px: 32, fps: 12, life: 0.35, spin: 5 }));
        await sleep(vfx, 0.45);
      })();
    case 'fling':
      return (async () => {
        // Mud-Slap (MudSlapMud): a handful of mud flung in a spray that splatters on the foe.
        const sheet = move.type === 'TYPE_GROUND' ? 'MudUnk' : fx.projectile;
        const clods: Promise<void>[] = [];
        for (let i = 0; i < 6; i++) {
          clods.push(new Promise((resolve) => vfx.after(i * 0.03, () => {
            const end = to().add(new THREE.Vector3(((i % 3) - 1) * 0.06, ((i % 2) - 0.5) * 0.08, 0));
            void vfx.projectile(sheet, from()[0], end, 0.34, { px: 10 + (i % 3) * 4, fps: 12, arc: attacker.height * (0.16 + (i % 3) * 0.07), spin: 6 }).then(resolve);
          })));
        }
        await Promise.all(clods);
        void vfx.sprite(move.type === 'TYPE_GROUND' ? 'FlyingDirt' : fx.burst, to(), { px: 34, fps: 14, life: 0.36 });
      })();
    case 'sound':
      return (async () => {
        const waves: Promise<void>[] = [];
        for (let i = 0; i < 4; i++) waves.push(new Promise((resolve) => vfx.after(i * 0.1, () => void vfx.projectile('NoiseLine', from()[0], to(), 0.35, { px: 20 + i * 4, fps: 12 }).then(resolve))));
        await Promise.all(waves);
      })();
    default:
      // Spit, orb and anything else: a projectile that arcs over and bursts.
      return (async () => {
        const size = motif === 'orb' ? 32 : 24;
        await vfx.projectile(fx.projectile, from()[0], to(), strong ? 0.4 : 0.45, { px: strong ? size + 8 : size, fps: 12, arc: 0.25 });
        void vfx.sprite(fx.burst, to(), { px: strong ? 44 : 32, fps: 16, life: 0.45, loop: true });
      })();
  }
}

/**
 * Rocks that fall on the foe from above instead of flying from the attacker.
 * Rock Slide (RockSlideRocks): rocks drop two frames apart across the foe
 * and bounce off; Rock Tomb (gRockTombRockSpriteTemplate): four big rocks
 * land around it, one every 16 frames, and stay a moment.
 */
function rockFall(target: Battler3D, move: MoveData, vfx: VfxSystem): Promise<void> {
  const tomb = move.name === 'ROCK TOMB';
  const at = hitPoint(target);
  const upp = vfx.unitsPerPixel(at);
  const xs = tomb ? [20, -20, 30, -10] : [-20, 28, -10, 10, 24, -32, -20, 30];
  const falls: Promise<void>[] = [];
  xs.forEach((x, i) => {
    falls.push(new Promise((resolve) => vfx.after(i * (tomb ? 16 / 60 : 2 / 60), () => {
      const land = at.clone().add(new THREE.Vector3(x * upp, (tomb ? -14 : (i % 3) * 6 - 4) * upp, 0));
      const from = land.clone().add(new THREE.Vector3(0, 80 * upp, 0));
      void vfx.projectile('Rocks', from, land, tomb ? 0.24 : 0.2, { px: tomb ? 28 : 14 + (i % 3) * 4, fps: 0, frame: i % 4, spin: tomb ? 0 : 5 }).then(() => {
        vfx.shake(tomb ? 0.05 : 0.025, 0.12);
        if (tomb) void vfx.sprite('Rocks', land, { px: 28, fps: 0, frame: i % 4, life: 0.5 });
        else void vfx.sprite('Rocks', land, { px: 12 + (i % 3) * 4, fps: 0, frame: i % 4, life: 0.25, spin: -6, velocity: new THREE.Vector3(Math.sign(x) * 40 * upp, 50 * upp, 0) });
        resolve();
      });
    })));
  });
  return Promise.all(falls).then(() => undefined);
}

function auraFx(attacker: Battler3D, motif: Motif, move: MoveData, vfx: VfxSystem): void {
  if (motif === 'afterimage') {
    afterimageFx(attacker, move, vfx);
    return;
  }
  if (motif === 'heal') {
    // Light gathering on the body.
    for (let i = 0; i < 8; i++) {
      vfx.after(i * 0.07, () => {
        const p = bodyPoint(attacker, 0.2 + (i % 4) * 0.2);
        p.x += ((i % 3) - 1) * attacker.height * 0.25;
        void vfx.sprite('Sparkle1', towardCamera(attacker, p, 0.3), { px: 18, fps: 14, life: 0.5, velocity: new THREE.Vector3(0, attacker.height * 0.5, 0) });
      });
    }
    return;
  }
  if (motif === 'shield') {
    void vfx.sprite('Protect', towardCamera(attacker, bodyPoint(attacker, 0.5), 0.45), { px: 48, fps: 10, life: 0.6 });
    return;
  }
  if (motif === 'weather') {
    for (let i = 0; i < 8; i++) vfx.after(i * 0.05, () => void vfx.sprite('Sunlight', towardCamera(attacker, bodyPoint(attacker, 1.1), 0.2), { px: 20, life: 0.5, velocity: new THREE.Vector3(0, attacker.height, 0) }));
    return;
  }
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

/** How long afterimages last from the aura event (seconds). */
export const AFTERIMAGE_SECONDS = 1.4;

/**
 * Afterimages, drawn as Emerald draws them: clones of the Pokémon's sprite in
 * blend mode (BLDALPHA 12/8). Double Team (AnimTask_DoubleTeam): two copies
 * darkened 11/16 toward black swing from side to side on opposite phases,
 * wider and faster until they vanish. Agility and others
 * (AnimTask_TraceMonBlended): copies left where the body was a moment ago,
 * a trail behind its dashes.
 */
function afterimageFx(attacker: Battler3D, move: MoveData, vfx: VfxSystem): void {
  const pipe = attacker.stage.pipeline;
  const id = attacker.pixelId;
  const clear = () => {
    for (let k = 0; k < 3; k++) pipe.setEcho(k, 0);
  };
  if (move.name === 'DOUBLE TEAM') {
    let phase = 0;
    let last = 0;
    vfx.tween(AFTERIMAGE_SECONDS, (t) => {
      // A quarter sine (gSineTable[0..64]) drives both the swing and its speed.
      const s = Math.sin((t * Math.PI) / 2);
      phase += (t - last) * AFTERIMAGE_SECONDS * 60 * ((s * 256) / 13) * ((2 * Math.PI) / 256);
      last = t;
      for (let k = 0; k < 2; k++) pipe.setEcho(k, id, Math.sin(phase + k * Math.PI) * 32 * s, 0, 12 / 16, 8 / 16, { color: [0, 0, 0], amount: 11 / 16 });
    }, clear);
    return;
  }
  // A trail: where the body was 4, 8 and 12 frames ago, relative to where it is.
  const seen: [number, number][] = [];
  vfx.tween(AFTERIMAGE_SECONDS, () => {
    const now = toScreen(attacker.stage.homeCamera, bodyPoint(attacker, 0.5));
    seen.unshift(now);
    seen.length = Math.min(seen.length, 13);
    for (let k = 0; k < 3; k++) {
      const then = seen[Math.min(seen.length - 1, 4 * (k + 1))];
      pipe.setEcho(k, id, then[0] - now[0], then[1] - now[1]);
    }
  }, clear);
}

/**
 * Flash (AnimTask_Flash): the battle background turns white and every
 * Pokémon black for 7 frames, then both fade back in 16 steps of 2 frames.
 */
function flashFx(attacker: Battler3D, target: Battler3D, vfx: VfxSystem): Promise<void> {
  const env = attacker.stage.environment;
  const set = (k: number) => {
    if (env) env.whiteout = k;
    for (const b of [attacker, target]) b.setTint([0, 0, 0], k);
  };
  set(1);
  return new Promise((resolve) => vfx.after(7 / 60, () => vfx.tween(32 / 60, (t) => set(Math.ceil(16 * (1 - t)) / 16), () => {
    set(0);
    resolve();
  })));
}

async function emitFx(attacker: Battler3D, target: Battler3D, move: MoveData, motif: Motif, vfx: VfxSystem): Promise<void> {
  if (motif === 'flash') return flashFx(attacker, target, vfx);
  const to = hitPoint(target, 0.6);
  const { sheet: sprite, at } = statusSprite(move.name);
  if (at === 'feet' || motif === 'kick_sand') {
    // Sand-Attack, Mud-Slap: clumps kicked up from the foot, arcing at the foe.
    const foot = attacker.inst.rig.node('footR') ? 'footR' : 'hips';
    const clumps: Promise<void>[] = [];
    for (let i = 0; i < 5; i++) {
      clumps.push(new Promise((resolve) => vfx.after(i * 0.05, () => {
        const from = towardCamera(attacker, bonePoint(attacker, foot), 0.1);
        void vfx.projectile(sprite, from, to.clone().add(new THREE.Vector3(0, (i - 2) * 0.04, 0)), 0.42, { px: 12 + (i % 3) * 4, fps: 12, arc: attacker.height * (0.35 + i * 0.04) }).then(resolve);
      })));
    }
    await Promise.all(clumps);
    return;
  }
  if (at === 'eyes' || motif === 'glare') {
    // Leer, Scary Face: a glint at the attacker's eyes.
    void vfx.sprite(at === 'eyes' ? sprite : 'Leer', towardCamera(attacker, attacker.emitterPoints('eyes')[0], 0.15), { px: 32, fps: 14 });
    await sleep(vfx, 0.5);
    return;
  }
  const from = emitterPoints(attacker, motif, move);
  if (motif === 'powder') {
    // Spores drift from the emitter (a flower, the mouth) and settle on the foe.
    const puffs: Promise<void>[] = [];
    for (let i = 0; i < 8; i++) {
      puffs.push(new Promise((resolve) => vfx.after(i * 0.06, () => void vfx.projectile(sprite === 'NoiseLine' ? 'Spore' : sprite, from[i % from.length], to.clone().add(new THREE.Vector3(((i % 4) - 1.5) * 0.08, 0, 0)), 0.7, { px: 12, fps: 10, arc: attacker.height * 0.3 }).then(resolve))));
    }
    await Promise.all(puffs);
    return;
  }
  if (motif === 'charm') {
    for (let i = 0; i < 3; i++) vfx.after(i * 0.12, () => void vfx.projectile('MagentaHeart', from[0], to, 0.5, { px: 14, arc: 0.2 }));
    await sleep(vfx, 0.7);
    return;
  }
  const waves: Promise<void>[] = [];
  for (let i = 0; i < 4; i++) {
    waves.push(new Promise((resolve) => vfx.after(i * 0.12, () => void vfx.projectile(sprite, from[0], to, 0.4, { px: 14 + i * 3, fps: 12 }).then(resolve))));
  }
  await Promise.all(waves);
}
