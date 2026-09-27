// The remake layer: the compiled game's battles drawn in 3D
// (docs/ARCHITECTURE.md, "Remake layer"). At each VBlank it reads the
// battle's state from the game's memory (state.ts), renders the scene with
// the 3D stack at the GBA's resolution and hands the pictures to the
// platform's PPU (struct RemakeLayers, platform/include/remake_state.h),
// which composes them for the next frame like its own layers: the arena in
// place of the battle background (BG3).
//
// ?remake=0 turns it off; ?remake=arena puts the grass arena in place of
// BG0, the front background, whatever the game shows (a test of the path
// from WebGL to the PPU outside battles).

import { BattleStage } from '../render3d/stage';
import type { Game } from '../../platform/host/game.mjs';
import { StructView, readBattleState, type StructLayouts } from './state';

const WIDTH = 240;
const HEIGHT = 160;
const OPAQUE = 0x8000;

/** The battle environments (BATTLE_ENVIRONMENT_*) the remake has an arena for; the others keep the game's background. */
const ARENAS: Record<number, string> = {
  0: 'grass', // GRASS
  1: 'grass', // LONG_GRASS
  4: 'water', // WATER
  5: 'water', // POND
  6: 'cave', // MOUNTAIN
  7: 'cave', // CAVE
  9: 'grass', // PLAIN
};

type Mode = 'off' | 'battle' | 'arena-test';

function pageMode(): Mode {
  const q = new URLSearchParams(location.search).get('remake');
  if (q === '0') return 'off';
  if (q === 'arena') return 'arena-test';
  return 'battle';
}

export class RemakeLayer {
  readonly mode = pageMode();
  private stage: BattleStage | null = null;
  private arena: string | null = null;
  private loading: Promise<void> | null = null;
  private readonly pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  private last = performance.now();

  constructor(private readonly game: Game, private readonly layouts: StructLayouts) {}

  /** The platform's picture buffers, as the game's memory (a view: take it anew each time). */
  private layers(): StructView {
    const address = (this.game.exports().PlatformRemakeLayers as () => number)();
    return new StructView(this.layouts, 'RemakeLayers', new DataView(this.game.memory().buffer), address);
  }

  private background(): { view: DataView; base: number } {
    const layers = this.layers();
    const bg = layers.struct('background', 'RemakeBackground');
    return { view: new DataView(this.game.memory().buffer), base: bg.address };
  }

  private setBackground(active: boolean, bg = 3): void {
    const { view, base } = this.background();
    const f = this.layouts.RemakeBackground.fields;
    view.setUint32(base + f.active[0], active ? 1 : 0, true);
    view.setUint32(base + f.bg[0], bg, true);
  }

  /** Make sure the stage shows `arena`; false while it loads. */
  private ready(arena: string): boolean {
    if (this.stage && this.arena === arena && !this.loading) return true;
    if (!this.loading) {
      if (!this.stage) {
        const canvas = document.createElement('canvas');
        this.stage = new BattleStage(canvas, undefined, { density: 1 });
      }
      this.arena = arena;
      this.loading = this.stage.setEnvironment(arena).then(() => {
        this.loading = null;
        console.log(`remake: ${arena} arena ready`);
      }, (e) => {
        console.warn('remake: arena failed to load', e);
        this.loading = null;
        this.arena = null;
      });
    }
    return false;
  }

  /** A frame is done: prepare the next frame's pictures. */
  onVBlank(): void {
    if (this.mode === 'off') return;
    let arena: string | null = null;
    if (this.mode === 'arena-test') {
      arena = 'grass';
    } else {
      const address = (this.game.exports().RemakeState as () => number)();
      const state = readBattleState(this.layouts, this.game.memory(), address);
      arena = state.inBattle ? ARENAS[state.environment] ?? null : null;
    }
    if (!arena || !this.ready(arena)) {
      this.setBackground(false);
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.renderArena(dt, this.mode === 'arena-test' ? 0 : 3);
  }

  /** The arena alone (BG3's picture): rendered, read back and handed to the PPU. */
  private renderArena(dt: number, bg: number): void {
    const stage = this.stage!;
    stage.update(dt);
    stage.render();
    const gl = stage.renderer.getContext();
    gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
    const { view, base } = this.background();
    const pixelsAt = base + this.layouts.RemakeBackground.fields.pixels[0];
    const out = new Uint16Array(view.buffer, pixelsAt, WIDTH * HEIGHT);
    for (let y = 0; y < HEIGHT; y++) {
      const src = (HEIGHT - 1 - y) * WIDTH * 4;
      for (let x = 0; x < WIDTH; x++) {
        const i = src + x * 4;
        out[y * WIDTH + x] = OPAQUE | (this.pixels[i] >> 3) | ((this.pixels[i + 1] >> 3) << 5) | ((this.pixels[i + 2] >> 3) << 10);
      }
    }
    this.setBackground(true, bg);
  }
}
