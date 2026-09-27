// The remake layer: the compiled game's battles drawn in 3D
// (docs/ARCHITECTURE.md, "Remake layer"). At the start of each frame (the
// platform's line 0) it reads the battle from the game (state.ts) and the
// hardware's state for that frame (OAM, the palettes, the registers line by
// line), renders the scene with the 3D stack at the GBA's resolution and
// hands the pictures to the platform's PPU (struct RemakeLayers,
// platform/include/remake_state.h), which composes them in the frame like
// its own layers:
//
//   - the arena in place of the battle background (BG3) while BG3 shows the
//     place's own background (not a move's), faded as the game fades BG3's
//     palette;
//   - each battler the remake has a 3D model for in place of its sprite. The
//     body stands where the sprite is (its offset from where it rests, plus
//     the battle background's scroll at its row: the arena stays still where
//     the GBA slides its background, as in the intro, and the body rides it),
//     is scaled, turned and stretched as the sprite's affine transform draws
//     it, shows when the sprite shows, and its pixels are the sprite's
//     palette indices, so the game's own fades, tints and flashes color it.
//     It acts in place on the game's events (acting.ts). A fainting body is
//     drawn where it is, free of its sprite, which slides away and is freed
//     while the body curls over and shrinks away;
//   - a battler a move animation copies into BG1 or BG2 (the game draws its
//     sprite there and scrolls the background with it: Tackle's target) in
//     place of the copy, so no 2D Pokémon shows around the body.
//
// ?remake=0 turns it off.

import * as THREE from 'three';
import speciesTable from '../data/generated/species.json';
import { Battler3D } from '../battle3d/battler';
import { hasProfile } from '../pokemon/registry';
import { SLOT_PIXEL_ID } from '../pokemon/instantiate';
import { PixelPipeline } from '../render3d/pipeline';
import { BattleStage, type SlotName } from '../render3d/stage';
import { WIDTH, HEIGHT, type Game } from '../../platform/host/game.mjs';
import { Acting } from './acting';
import { StructView, constant, readBattleState, type BattleState, type GameInfo, type StructLayouts } from './state';
/** A GBA frame: 280896 cycles at 16.78 MHz. */
const FRAME_SECONDS = 280896 / 16777216;

// The GBA's memory map (the game's memory is laid out as the GBA's).
const IO = 0x04000000;
const PLTT = 0x05000000;
const VRAM = 0x06000000;
const OAM = 0x07000000;
const REG_BG3CNT = 0x0e;
const REG_BG3HOFS = 0x1c;
const REG_BG3VOFS = 0x1e;
/** BGnCNT, BGnHOFS, BGnVOFS of background n. */
const regBgCnt = (bg: number) => 0x08 + bg * 2;
const regBgHofs = (bg: number) => 0x10 + bg * 4;
const regBgVofs = (bg: number) => 0x12 + bg * 4;

/** The arena for each battle environment the remake has one for; the others keep the game's background. */
const ARENAS: Record<string, string> = {
  BATTLE_ENVIRONMENT_GRASS: 'grass',
  BATTLE_ENVIRONMENT_LONG_GRASS: 'grass',
  BATTLE_ENVIRONMENT_PLAIN: 'grass',
  BATTLE_ENVIRONMENT_WATER: 'water',
  BATTLE_ENVIRONMENT_POND: 'water',
  BATTLE_ENVIRONMENT_MOUNTAIN: 'cave',
  BATTLE_ENVIRONMENT_CAVE: 'cave',
};

/** Where each battle position stands on the stage. Doubles' second positions keep the game's sprites for now. */
const SLOTS: Record<string, SlotName> = { B_POSITION_PLAYER_LEFT: 'player', B_POSITION_OPPONENT_LEFT: 'enemy' };

/** A species' model name (src/pokemon/<slug>) by its number (SPECIES_*). */
const SLUGS = new Map<number, string>(Object.values(speciesTable as Record<string, { id: number; slug: string }>).map((s) => [s.id, s.slug]));

/** The GBA's sprite sizes by shape and size. */
const OBJ_SIZE: [number, number][][] = [
  [[8, 8], [16, 16], [32, 32], [64, 64]],
  [[16, 8], [32, 8], [32, 16], [64, 32]],
  [[8, 16], [8, 32], [16, 32], [32, 64]],
];

/** A sprite as OAM draws it this frame. */
interface OamSprite {
  /** Its centre on screen. */
  x: number;
  y: number;
  /** The linear map it is drawn with about its centre (x right, y down): the inverse of its affine matrix. */
  map: [number, number, number, number];
  /** Drawn semi-transparent (a copy's afterimage, usually). */
  blended: boolean;
}

/**
 * The sprite in OAM drawing tile `tileNum` (not hidden, not a window) as the
 * hardware reads it: the one centred at `at` (the battler's own sprite; the
 * others are copies of it, afterimages), else the first drawn opaque, else
 * the first.
 */
function oamSprite(view: DataView, tileNum: number, at: [number, number]): OamSprite | null {
  const found: OamSprite[] = [];
  for (let i = 0; i < 128; i++) {
    const a0 = view.getUint16(OAM + i * 8, true);
    const a1 = view.getUint16(OAM + i * 8 + 2, true);
    const a2 = view.getUint16(OAM + i * 8 + 4, true);
    const affine = (a0 & 0x100) !== 0;
    if ((!affine && (a0 & 0x200)) || ((a0 >> 10) & 3) === 2 || (a2 & 0x3ff) !== tileNum) continue;
    const shape = a0 >> 14;
    if (shape === 3) continue;
    const [w, h] = OBJ_SIZE[shape][a1 >> 14];
    const double = affine && (a0 & 0x200) !== 0;
    const bw = double ? w * 2 : w, bh = double ? h * 2 : h;
    let x = a1 & 0x1ff;
    if (x >= WIDTH) x -= 512;
    let y = a0 & 0xff;
    if (y + bh > 256) y -= 256;
    let map: OamSprite['map'] = [1, 0, 0, 1];
    if (affine) {
      const m = OAM + ((a1 >> 9) & 31) * 32;
      const pa = view.getInt16(m + 6, true), pb = view.getInt16(m + 14, true);
      const pc = view.getInt16(m + 22, true), pd = view.getInt16(m + 30, true);
      const det = (pa * pd - pb * pc) / 65536;
      map = det === 0 ? [0, 0, 0, 0] : [pd / 256 / det, -pb / 256 / det, -pc / 256 / det, pa / 256 / det];
    }
    found.push({ x: x + bw / 2, y: y + bh / 2, map, blended: ((a0 >> 10) & 3) === 1 });
  }
  return found.find((o) => o.x === at[0] && o.y === at[1]) ?? found.find((o) => !o.blended) ?? found[0] ?? null;
}

/** A scroll register's value as an offset within its background's map (-size/2 .. size/2). */
function signedScroll(v: number, size: number): number {
  const m = v % size;
  return m >= size / 2 ? m - size : m;
}

/** Where a point of a background's map (`v` along a map of `size`, the scroll taken off) is on the screen: a little left of or above it when it wraps. */
function onScreen(v: number, size: number): number {
  const m = ((v % size) + size) % size;
  return m > size - 64 ? m - size : m;
}

/**
 * A palette fade as the game makes one (BlendPalette: each channel moves
 * coeff/16 of the way to the target, in 5-bit steps) that turns `from`
 * into `to`, or the closest one when the change is something else.
 */
function estimateBlend(from: number[], to: number[]): { coeff: number; target: [number, number, number] } {
  if (from.every((c, i) => c === to[i])) return { coeff: 0, target: [0, 0, 0] };
  let best = { coeff: 0, target: [0, 0, 0] as [number, number, number], error: Infinity };
  for (let coeff = 1; coeff <= 16; coeff++) {
    const target: [number, number, number] = [0, 0, 0];
    let error = 0;
    for (let ch = 0; ch < 3; ch++) {
      let bestT = 0, bestE = Infinity;
      for (let t = 0; t < 32; t++) {
        let e = 0;
        for (let i = 0; i < from.length; i++) {
          const u = (from[i] >> (ch * 5)) & 31;
          const f = (to[i] >> (ch * 5)) & 31;
          e += Math.abs(u + (((t - u) * coeff) >> 4) - f);
        }
        if (e < bestE) {
          bestE = e;
          bestT = t;
        }
      }
      target[ch] = bestT;
      error += bestE;
    }
    if (error < best.error) best = { coeff, target, error };
    if (error === 0) break;
  }
  return { coeff: best.coeff, target: best.target };
}

/** A battler the remake draws: its 3D body in a slot of the stage. */
interface Body {
  /** The game's number for the battler. */
  battlerId: number;
  species: number;
  slot: SlotName;
  battler: Battler3D | null;
  /** The sprite's affine transform beyond its scale (a turn, a stretch), about its centre: the body's parent in the slot. */
  sprite: THREE.Group;
  loading: Promise<void> | null;
  failed: boolean;
  /** Where its body is drawn on the screen this frame (the centre it stands at). */
  center: [number, number];
  /** Its sprite as last seen showing its Pokémon: a fainting body's picture keeps its priority and palette once the sprite is gone. */
  seen: { priority: number; palette: number } | null;
}

/** What a body's picture stands in for this frame. */
interface BodyPicture {
  body: Body;
  /**
   * Its sprite: the entries drawing `tileNum` show the picture moved as they
   * are, or, `free`, show nothing while the picture shows where it is (a
   * faint: the sprite slides away and is freed, `tileNum` REMAKE_NO_TILE).
   */
  sprite: { tileNum: number; free: { priority: number; palette: number } | null } | null;
  /** Its copy in BG1 or BG2: the picture shows there, in the copy's palette, moved to the copy (`pan`). */
  copy: { bg: number; palette: number; pan: [number, number] } | null;
}

function pageMode(): 'off' | 'on' {
  return new URLSearchParams(location.search).get('remake') === '0' ? 'off' : 'on';
}

export class RemakeLayer {
  readonly mode = pageMode();
  private stage: BattleStage | null = null;
  private arena: string | null = null;
  private arenaLoading: Promise<void> | null = null;
  /** The 3D bodies by the game's battler number. */
  private readonly bodies = new Map<number, Body>();
  private target: THREE.WebGLRenderTarget | null = null;
  private readonly rgba = new Uint8Array(WIDTH * HEIGHT * 4);
  /** The arena's picture is drawn with a margin around the screen (the game shakes the background): its own pipeline, camera and target. */
  private arenaPipeline: PixelPipeline | null = null;
  private arenaCamera: THREE.PerspectiveCamera | null = null;
  private arenaTarget: THREE.WebGLRenderTarget | null = null;
  private readonly arenaRgba: Uint8Array;
  private readonly layouts: StructLayouts;
  private readonly OPAQUE: number;
  private readonly FORMAT_COLOR: number;
  private readonly FORMAT_INDEX: number;
  private readonly NO_TILE: number;
  private readonly NO_BATTLER: number;
  private readonly BG_MAIN: number;
  private readonly MARGIN: number;
  private readonly BG_WIDTH: number;
  private readonly BG_HEIGHT: number;
  private readonly arenas = new Map<number, string>();
  private readonly slots = new Map<number, SlotName>();
  private readonly acting: Acting;
  /**
   * Whether frames get their pictures. Tools running many frames at once
   * (the page's manual mode) draw only the frames they show; the battle
   * lives on (its clips, its arena) in the others.
   */
  drawPictures = true;
  /** The last frame was a battle's, with everything its 3D needs loaded (a page can show it from now on). */
  battleShown = false;

  constructor(private readonly game: Game, info: GameInfo) {
    this.layouts = info.structs;
    this.OPAQUE = constant(info, 'REMAKE_OPAQUE');
    this.FORMAT_COLOR = constant(info, 'REMAKE_FORMAT_COLOR');
    this.FORMAT_INDEX = constant(info, 'REMAKE_FORMAT_INDEX');
    this.NO_TILE = constant(info, 'REMAKE_NO_TILE');
    this.NO_BATTLER = constant(info, 'REMAKE_NO_BATTLER');
    this.BG_MAIN = constant(info, 'REMAKE_BG_MAIN');
    this.MARGIN = constant(info, 'REMAKE_BG_MARGIN');
    this.BG_WIDTH = constant(info, 'REMAKE_BG_WIDTH');
    this.BG_HEIGHT = constant(info, 'REMAKE_BG_HEIGHT');
    this.arenaRgba = new Uint8Array(this.BG_WIDTH * this.BG_HEIGHT * 4);
    for (const [name, arena] of Object.entries(ARENAS)) this.arenas.set(constant(info, name), arena);
    for (const [name, slot] of Object.entries(SLOTS)) this.slots.set(constant(info, name), slot);
    this.acting = new Acting(info);
  }

  /** False while a body or an arena the battle needs is loading: the page holds the game until it is ready. */
  ready(): boolean {
    if (this.arenaLoading) return false;
    for (const body of this.bodies.values()) if (body.loading) return false;
    return true;
  }

  private view(): DataView {
    return new DataView(this.game.memory().buffer);
  }

  /** The platform's picture buffers (struct RemakeLayers). */
  private layers(): StructView {
    const address = (this.game.exports().PlatformRemakeLayers as () => number)();
    return new StructView(this.layouts, 'RemakeLayers', this.view(), address);
  }

  private field(type: string, name: string): number {
    return this.layouts[type].fields[name][0];
  }

  /** Turn every picture off: the game's own layers show. */
  private clearPictures(): void {
    const view = this.view();
    const layers = this.layers();
    for (const [field, type] of [['backgrounds', 'RemakeBackground'], ['sprites', 'RemakeSprite']]) {
      const count = this.layouts.RemakeLayers.fields[field][1] / this.layouts[type].size;
      for (let i = 0; i < count; i++) view.setUint32(layers.struct(field, type, i).address + this.field(type, 'active'), 0, true);
    }
  }

  /** A frame is about to be drawn: prepare its pictures. */
  onFrameStart(): void {
    this.battleShown = false;
    if (this.mode === 'off') return;
    this.clearPictures();
    const state = readBattleState(this.layouts, this.game.memory(), (this.game.exports().RemakeState as () => number)(), this.NO_BATTLER);
    if (!state.inBattle) {
      this.endBattle();
      return;
    }
    if (!state.battleScreen) return;
    const stage = this.ensureStage();
    const arena = state.background === this.BG_MAIN ? this.arenas.get(state.environment) ?? null : null;
    if (arena && arena !== this.arena && !this.arenaLoading) this.loadArena(arena);
    const scroll = this.backgroundScroll(this.view());
    const pictures = this.placeBodies(state, scroll);
    const showing = new Set(pictures.map((p) => p.body.battlerId));
    this.acting.update(state, (i) => this.bodies.get(i)?.battler ?? null, (i) => showing.has(i));
    if (!this.ready()) {
      // The page holds the game on this frame until everything is loaded:
      // meanwhile the sprites of the bodies still loading are hidden.
      this.hideLoading(state);
      return;
    }
    this.battleShown = true;

    stage.update(FRAME_SECONDS);
    // Every body lives on (its clip runs) while its sprite blinks or is away.
    for (const body of this.bodies.values()) {
      if (!body.battler) continue;
      body.battler.update(FRAME_SECONDS);
      this.placeSprite(body);
    }
    if (!this.drawPictures) return;
    if (arena && arena === this.arena) this.renderArena(state, scroll.pan);
    if (pictures.length) this.renderBodies(pictures);
  }

  private hideLoading(state: BattleState): void {
    const view = this.view();
    const layers = this.layers();
    let n = 0;
    state.battlers.forEach((b, i) => {
      if (!this.bodies.get(i)?.loading || !b.showsPokemon) return;
      const sprite = layers.struct('sprites', 'RemakeSprite', n++);
      new Uint16Array(view.buffer, sprite.address + this.field('RemakeSprite', 'pixels'), WIDTH * HEIGHT).fill(0);
      view.setUint32(sprite.address + this.field('RemakeSprite', 'tileNum'), b.tileNum, true);
      view.setUint32(sprite.address + this.field('RemakeSprite', 'free'), 0, true);
      view.setUint32(sprite.address + this.field('RemakeSprite', 'active'), 1, true);
    });
  }

  private ensureStage(): BattleStage {
    if (!this.stage) {
      const stage = new BattleStage(document.createElement('canvas'), undefined, { density: 1 });
      const target = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, colorSpace: THREE.NoColorSpace });
      this.target = target(WIDTH, HEIGHT);
      // The arena: the resting camera seeing the margin too, pixel for pixel.
      this.arenaPipeline = new PixelPipeline(stage.renderer, { density: 1, screen: [this.BG_WIDTH, this.BG_HEIGHT] });
      this.arenaTarget = target(this.BG_WIDTH, this.BG_HEIGHT);
      const cam = stage.homeCamera.clone();
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (this.BG_HEIGHT / HEIGHT)));
      cam.aspect = this.BG_WIDTH / this.BG_HEIGHT;
      cam.updateProjectionMatrix();
      this.arenaCamera = cam;
      this.stage = stage;
    }
    return this.stage;
  }

  private loadArena(arena: string): void {
    this.arenaLoading = this.stage!.setEnvironment(arena).then(
      () => {
        this.arena = arena;
        this.arenaLoading = null;
      },
      (e) => {
        console.warn(`remake: the ${arena} arena failed to load`, e);
        this.arenaLoading = null;
      },
    );
  }

  /** The battle is over: the bodies leave the stage (the arena stays loaded for the next one). */
  private endBattle(): void {
    for (const battler of [...this.bodies.keys()]) this.removeBody(battler);
    this.acting.reset();
  }

  private removeBody(battler: number): void {
    const body = this.bodies.get(battler);
    if (!body) return;
    body.battler?.dispose();
    body.sprite.parent?.remove(body.sprite);
    this.bodies.delete(battler);
  }

  /**
   * Bodies for the battlers the remake has models for (loading the ones it
   * lacks), placed where their sprites (or their copies in a background)
   * are this frame. Returns what each one's picture stands in for.
   */
  private placeBodies(state: BattleState, scroll: ReturnType<RemakeLayer['backgroundScroll']>): BodyPicture[] {
    const view = this.view();
    const pictures: BodyPicture[] = [];
    state.battlers.forEach((b, i) => {
      const slot = this.slots.get(b.position);
      const slug = SLUGS.get(b.species);
      if (!b.present || !slot || !slug || !hasProfile(slug)) {
        this.removeBody(i);
        return;
      }
      let body = this.bodies.get(i);
      if (body && body.species !== b.species) {
        this.removeBody(i);
        body = undefined;
      }
      if (!body) body = this.addBody(i, b.species, slot, slug);
      if (!body.battler || b.behindSubstitute) return;
      if (b.showsPokemon) body.seen = { priority: b.priority, palette: b.paletteNum };
      // A fainting body stays where it was and curls over and shrinks away
      // by itself (then hides): drawn where it is, while its sprite slides
      // away (its entries show nothing) and after the game frees it.
      if (this.acting.isFainting(i)) {
        if (body.seen && body.battler.visible) {
          pictures.push({ body, sprite: { tileNum: b.showsPokemon ? b.tileNum : this.NO_TILE, free: body.seen }, copy: null });
        }
        return;
      }
      // A trainer's picture (the intro) keeps the game's sprite.
      if (!b.showsPokemon) return;
      // The body shows where the sprite does, or where a move animation's
      // copy of it is (the sprite hidden or over it), and only then.
      const sprite = oamSprite(view, b.tileNum, [b.x + b.x2, b.y + b.y2]);
      const copy = this.copyOf(i, state);
      const at: [number, number] | null = sprite ? [sprite.x, sprite.y] : copy?.center ?? null;
      body.battler.visible = !!at;
      if (!at) return;
      // Riding the background: its scroll at the body's row, less what the
      // arena itself shows of it (a shake).
      const row = Math.max(0, Math.min(HEIGHT - 1, Math.round(at[1])));
      body.battler.screenOffset = [at[0] - b.homeX + scroll.x[row] - scroll.pan[0], at[1] - b.homeY + scroll.y[row] - scroll.pan[1]];
      const map = sprite?.map ?? [1, 0, 0, 1];
      body.battler.spriteScale = Math.sqrt(Math.abs(map[0] * map[3] - map[1] * map[2]));
      body.sprite.userData.map = map;
      body.center = at;
      pictures.push({
        body,
        sprite: sprite ? { tileNum: b.tileNum, free: null } : null,
        copy: copy ? { bg: copy.bg, palette: copy.palette, pan: [at[0] - copy.center[0], at[1] - copy.center[1]] } : null,
      });
    });
    return pictures;
  }

  /**
   * A battler's copy in BG1 or BG2 while an animation runs (the game drew its
   * sprite at the top left of the background's map and scrolls the
   * background to move it): the background, its palette and the copy's
   * centre on the screen, if the background shows.
   */
  private copyOf(battler: number, state: BattleState): { bg: number; palette: number; center: [number, number] } | null {
    if (!state.animActive) return null;
    const k = state.copies.findIndex((c) => c.battler === battler);
    if (k < 0) return null;
    const bg = k + 1;
    const view = this.view();
    if (!(view.getUint16(IO, true) & (0x100 << bg))) return null;
    const cnt = view.getUint16(IO + regBgCnt(bg), true);
    const width = cnt & 0x4000 ? 512 : 256, height = cnt & 0x8000 ? 512 : 256;
    const predict = this.game.exports().PlatformPredictLines as (off: number) => number;
    const lines = (off: number) => new Uint16Array(this.game.memory().buffer, predict(off), HEIGHT);
    const cy = onScreen(32 - lines(regBgVofs(bg))[0], height);
    const cx = onScreen(32 - lines(regBgHofs(bg))[Math.max(0, Math.min(HEIGHT - 1, cy))], width);
    return { bg, palette: state.copies[k].palette, center: [cx, cy] };
  }

  private addBody(battler: number, species: number, slot: SlotName, slug: string): Body {
    const stage = this.stage!;
    const sprite = new THREE.Group();
    sprite.name = `remake-sprite-${slot}`;
    sprite.matrixAutoUpdate = false;
    stage.slots[slot].add(sprite);
    sprite.userData.map = [1, 0, 0, 1];
    const body: Body = { battlerId: battler, species, slot, battler: null, sprite, loading: null, failed: false, center: [0, 0], seen: null };
    body.loading = Battler3D.create(stage, slot, slug).then(
      (b3d) => {
        body.loading = null;
        if (this.bodies.get(battler) !== body) {
          b3d.dispose();
          return;
        }
        // The body goes under the sprite's transform, in its slot, and acts in place.
        sprite.add(b3d.inst.root);
        b3d.inPlace = true;
        body.battler = b3d;
      },
      (e) => {
        console.warn(`remake: no 3D body for ${slug}`, e);
        body.loading = null;
        body.failed = true;
      },
    );
    this.bodies.set(battler, body);
    return body;
  }

  /**
   * How far the battle background is scrolled at each line of this frame
   * (its registers and the HBlank DMA's writes), and the part of it the arena
   * shows (`pan`): a scroll the whole screen shares, as a shake, up to the
   * arena's margin. Where the lines differ (the intro's halves sliding in)
   * the arena stays still, and a battler whose sprite moves with the
   * background keeps its place on the arena.
   */
  private backgroundScroll(view: DataView): { x: number[]; y: number[]; pan: [number, number] } {
    const predict = this.game.exports().PlatformPredictLines as (off: number) => number;
    const read = (off: number) => Array.from(new Uint16Array(this.game.memory().buffer, predict(off), HEIGHT));
    const cnt = view.getUint16(IO + REG_BG3CNT, true);
    const width = cnt & 0x4000 ? 512 : 256, height = cnt & 0x8000 ? 512 : 256;
    const x = read(REG_BG3HOFS).map((v) => signedScroll(v, width));
    const y = read(REG_BG3VOFS).map((v) => signedScroll(v, height));
    const uniform = x.every((v) => v === x[0]) && y.every((v) => v === y[0]);
    const clamp = (v: number) => Math.max(-this.MARGIN, Math.min(this.MARGIN, v));
    return { x, y, pan: uniform ? [clamp(x[0]), clamp(y[0])] : [0, 0] };
  }

  /** The sprite's turn and stretch (its affine map without the scale, which `appear` carries), about the body's middle. */
  private placeSprite(body: Body): void {
    const b3d = body.battler!;
    const [a, b, c, d] = body.sprite.userData.map as [number, number, number, number];
    const s = b3d.spriteScale || 1;
    const m = [a / s, b / s, c / s, d / s];
    const group = body.sprite;
    if (Math.abs(m[0] - 1) + Math.abs(m[1]) + Math.abs(m[2]) + Math.abs(m[3] - 1) < 1e-3) {
      group.matrix.identity();
      group.matrixWorldNeedsUpdate = true;
      return;
    }
    const stage = this.stage!;
    const slot = stage.slots[body.slot];
    slot.updateMatrixWorld(true);
    // The camera's axes: screen right, screen up (y up: the map's y is down) and back.
    const cam = stage.homeCamera;
    const basis = new THREE.Matrix4().makeRotationFromQuaternion(cam.quaternion);
    const screen = new THREE.Matrix4().set(m[0], -m[1], 0, 0, -m[2], m[3], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    const pivot = b3d.inst.root.position.clone().addScaledVector(b3d.appearPivot, b3d.height).applyMatrix4(slot.matrixWorld);
    const world = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
      .multiply(basis).multiply(screen).multiply(basis.clone().transpose())
      .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
    group.matrix.copy(slot.matrixWorld.clone().invert().multiply(world).multiply(slot.matrixWorld));
    group.matrixWorldNeedsUpdate = true;
  }

  /**
   * Render one of the two passes into the target and read it back: the
   * arena alone (with the bodies' shadows), or the bodies alone.
   */
  private renderPass(which: 'arena' | 'bodies'): void {
    const stage = this.stage!;
    const hidden: THREE.Object3D[] = [];
    const hide = (o: THREE.Object3D | undefined) => {
      if (o?.visible) {
        o.visible = false;
        hidden.push(o);
      }
    };
    if (which === 'arena') {
      for (const body of this.bodies.values()) hide(body.sprite);
      this.arenaPipeline!.render(stage.scene, this.arenaCamera!, { target: this.arenaTarget! });
    } else {
      hide(stage.environment?.group);
      hide(stage.ambience?.group);
      for (const slot of Object.values(stage.slots)) for (const o of slot.children) if (o.name === 'ground-shadow') hide(o);
      stage.render({ target: this.target!, indices: true });
    }
    for (const o of hidden) o.visible = true;
    if (which === 'arena') stage.renderer.readRenderTargetPixels(this.arenaTarget!, 0, 0, this.BG_WIDTH, this.BG_HEIGHT, this.arenaRgba);
    else stage.renderer.readRenderTargetPixels(this.target!, 0, 0, WIDTH, HEIGHT, this.rgba);
  }

  /** The arena alone (BG3's picture): rendered, faded as the game fades BG3's palette, and handed to the PPU. */
  private renderArena(state: BattleState, pan: [number, number]): void {
    this.renderPass('arena');
    const view = this.view();
    const fade = this.backgroundFade(view, state);
    const layers = this.layers();
    const bg = layers.struct('backgrounds', 'RemakeBackground', 0);
    const W = this.BG_WIDTH, H = this.BG_HEIGHT, OPAQUE = this.OPAQUE;
    const out = new Uint16Array(view.buffer, bg.address + this.field('RemakeBackground', 'pixels'), W * H);
    const [tr, tg, tb] = fade.target, k = fade.coeff;
    for (let y = 0; y < H; y++) {
      const src = (H - 1 - y) * W * 4;
      for (let x = 0; x < W; x++) {
        const i = src + x * 4;
        let r = this.arenaRgba[i] >> 3, g = this.arenaRgba[i + 1] >> 3, b = this.arenaRgba[i + 2] >> 3;
        if (k) {
          r += ((tr - r) * k) >> 4;
          g += ((tg - g) * k) >> 4;
          b += ((tb - b) * k) >> 4;
        }
        out[y * W + x] = OPAQUE | r | (g << 5) | (b << 10);
      }
    }
    view.setInt32(bg.address + this.field('RemakeBackground', 'panX'), pan[0], true);
    view.setInt32(bg.address + this.field('RemakeBackground', 'panY'), pan[1], true);
    view.setUint32(bg.address + this.field('RemakeBackground', 'bg'), 3, true);
    view.setUint32(bg.address + this.field('RemakeBackground', 'format'), this.FORMAT_COLOR, true);
    view.setUint32(bg.address + this.field('RemakeBackground', 'active'), 1, true);
  }

  /**
   * How the game has faded the battle background's palette this frame (the
   * palette its map uses most, as the hardware has it, against the game's
   * unfaded copy): the arena fades the same way.
   */
  private backgroundFade(view: DataView, state: BattleState): ReturnType<typeof estimateBlend> {
    const cnt = view.getUint16(IO + REG_BG3CNT, true);
    const map = VRAM + ((cnt >> 8) & 0x1f) * 0x800;
    const blocks = [1, 2, 2, 4][cnt >> 14];
    const uses = new Array(16).fill(0);
    for (let i = 0; i < blocks * 1024; i++) uses[view.getUint16(map + i * 2, true) >> 12]++;
    const bank = uses.indexOf(Math.max(...uses));
    const unfaded: number[] = [], faded: number[] = [];
    for (let i = 0; i < 16; i++) {
      unfaded.push(view.getUint16(state.plttUnfaded + (bank * 16 + i) * 2, true));
      faded.push(view.getUint16(PLTT + (bank * 16 + i) * 2, true));
    }
    return estimateBlend(unfaded, faded);
  }

  /**
   * The bodies alone: each one's pixels, as its sprite's palette indices,
   * stand in for its sprite (or show where it is, free) and for its copy in a
   * background (BG1 and BG2 take backgrounds 1 and 2; the arena is 0).
   */
  private renderBodies(pictures: BodyPicture[]): void {
    this.renderPass('bodies');
    const view = this.view();
    const layers = this.layers();
    const M = this.MARGIN, W = this.BG_WIDTH;
    let n = 0;
    for (const { body, sprite, copy } of pictures) {
      const id = SLOT_PIXEL_ID[body.slot];
      if (sprite) {
        const pic = layers.struct('sprites', 'RemakeSprite', n++);
        const out = new Uint16Array(view.buffer, pic.address + this.field('RemakeSprite', 'pixels'), WIDTH * HEIGHT);
        for (let y = 0; y < HEIGHT; y++) {
          const src = (HEIGHT - 1 - y) * WIDTH * 4;
          for (let x = 0; x < WIDTH; x++) {
            const i = src + x * 4;
            out[y * WIDTH + x] = this.rgba[i + 3] === id ? this.OPAQUE | this.rgba[i] : 0;
          }
        }
        const set = (field: string, v: number) => view.setUint32(pic.address + this.field('RemakeSprite', field), v, true);
        set('tileNum', sprite.tileNum);
        set('format', this.FORMAT_INDEX);
        view.setInt32(pic.address + this.field('RemakeSprite', 'centerX'), body.center[0], true);
        view.setInt32(pic.address + this.field('RemakeSprite', 'centerY'), body.center[1], true);
        set('free', sprite.free ? 1 : 0);
        set('priority', sprite.free?.priority ?? 0);
        set('palette', sprite.free?.palette ?? 0);
        set('active', 1);
      }
      if (copy) {
        const pic = layers.struct('backgrounds', 'RemakeBackground', copy.bg);
        const out = new Uint16Array(view.buffer, pic.address + this.field('RemakeBackground', 'pixels'), this.BG_WIDTH * this.BG_HEIGHT);
        out.fill(0);
        for (let y = 0; y < HEIGHT; y++) {
          const src = (HEIGHT - 1 - y) * WIDTH * 4;
          for (let x = 0; x < WIDTH; x++) {
            const i = src + x * 4;
            if (this.rgba[i + 3] === id) out[(y + M) * W + x + M] = this.OPAQUE | this.rgba[i];
          }
        }
        const set = (field: string, v: number) => view.setUint32(pic.address + this.field('RemakeBackground', field), v, true);
        set('bg', copy.bg);
        set('format', this.FORMAT_INDEX);
        set('palette', copy.palette);
        view.setInt32(pic.address + this.field('RemakeBackground', 'panX'), copy.pan[0], true);
        view.setInt32(pic.address + this.field('RemakeBackground', 'panY'), copy.pan[1], true);
        set('active', 1);
      }
    }
  }
}
