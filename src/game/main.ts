// The compiled game in the browser: pret/pokeemerald built for WebAssembly
// (platform/, docs/ARCHITECTURE.md), run at the GBA's frame rate on a
// canvas, with the keyboard, a gamepad or the touch pad, its sound (the
// game's own m4a engine and the GBA's sound chip, played as it comes:
// ./audio.ts), and the cartridge's save kept in the browser. Its battles are
// drawn in 3D by the remake layer (src/remake).
//
// ?battle=BLAZIKEN:50,SWAMPERT:50[,GRASS] starts a test battle as soon as
// the game can (platform/game/remake_test.c): the player's Pokémon and the
// wild one with their levels, and the place (BATTLE_ENVIRONMENT_*, the map's
// by default).
//
// ?manual=1 is for tools (tools/remake/run.mjs): the game runs only when
// told, frame by frame (window.__game), from a blank save, and with
// ?time=2026,1,1,4,10,0,0 on a fixed clock, so a run is the same every time.
// An input script's keys change at the VBlanks it names, as in the headless
// runner (platform/tools/run.mjs), so a script plays the same in both.

import { loadGame, KEYS, GameHalt, WIDTH, HEIGHT, type Game } from '../../platform/host/game.mjs';
import speciesTable from '../data/generated/species.json';
import { RemakeLayer } from '../remake/layer';
import { loadGameInfo } from '../remake/state';
import { startTestBattle, testBattleArgs } from '../../platform/host/test_battle.mjs';
import { GameAudio } from './audio';

/** The GBA's refresh: 16.78 MHz / 280896 cycles a frame. */
const FRAME_MS = 1000 / 59.7275;
const SAVE_KEY = 'ultragreen.flash';
const RTC_KEY = 'ultragreen.rtcOffset';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const status = document.getElementById('status') as HTMLDivElement;
const ctx = canvas.getContext('2d')!;

// ---------------------------------------------------------------- input

const KEYBOARD: Record<string, keyof typeof KEYS> = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  KeyX: 'A', KeyZ: 'B', Enter: 'START', Backspace: 'SELECT', ShiftRight: 'SELECT',
  KeyA: 'L', KeyS: 'R',
};
const held = new Set<keyof typeof KEYS>();
const touched = new Map<number, keyof typeof KEYS>();

addEventListener('keydown', (e) => {
  const k = KEYBOARD[e.code];
  if (k) {
    held.add(k);
    e.preventDefault();
  }
});
addEventListener('keyup', (e) => {
  const k = KEYBOARD[e.code];
  if (k) held.delete(k);
});
addEventListener('blur', () => held.clear());

if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-key]')) {
  const key = button.dataset.key as keyof typeof KEYS;
  const release = (e: PointerEvent) => {
    touched.delete(e.pointerId);
    button.classList.remove('down');
  };
  button.addEventListener('pointerdown', (e) => {
    touched.set(e.pointerId, key);
    button.classList.add('down');
    button.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
}

function gamepadKeys(): number {
  let bits = 0;
  for (const pad of navigator.getGamepads?.() ?? []) {
    if (!pad) continue;
    const b = (i: number) => pad.buttons[i]?.pressed;
    if (b(0)) bits |= KEYS.A;
    if (b(1)) bits |= KEYS.B;
    if (b(8)) bits |= KEYS.SELECT;
    if (b(9)) bits |= KEYS.START;
    if (b(4)) bits |= KEYS.L;
    if (b(5)) bits |= KEYS.R;
    if (b(12) || pad.axes[1] < -0.5) bits |= KEYS.UP;
    if (b(13) || pad.axes[1] > 0.5) bits |= KEYS.DOWN;
    if (b(14) || pad.axes[0] < -0.5) bits |= KEYS.LEFT;
    if (b(15) || pad.axes[0] > 0.5) bits |= KEYS.RIGHT;
  }
  return bits;
}

function keys(): number {
  let bits = gamepadKeys();
  for (const k of held) bits |= KEYS[k];
  for (const k of touched.values()) bits |= KEYS[k];
  return bits;
}

// ---------------------------------------------------------------- screen

function fit() {
  const pad = document.body.classList.contains('touch') ? 260 : 80;
  const scale = Math.max(1, Math.floor(Math.min(innerWidth / WIDTH, (innerHeight - pad) / HEIGHT)));
  canvas.style.width = `${WIDTH * scale}px`;
  canvas.style.height = `${HEIGHT * scale}px`;
}
addEventListener('resize', fit);
fit();

// ---------------------------------------------------------------- save

function loadSave(): Uint8Array | undefined {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) return undefined;
    return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  } catch {
    return undefined;
  }
}

let saveTimer = 0;
function storeSave(game: Game) {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      const bytes = game.flash();
      let text = '';
      for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      localStorage.setItem(SAVE_KEY, btoa(text));
      localStorage.setItem(RTC_KEY, String(game.rtcOffset()));
    } catch (e) {
      console.warn('saving failed', e);
    }
  }, 300);
}

// ---------------------------------------------------------------- run

async function main() {
  const params = new URLSearchParams(location.search);
  const manual = params.has('manual');
  const clock = params.get('time')?.split(',').map(Number);
  const url = new URL('game/pokeemerald.wasm', document.baseURI);
  const [module, info] = await Promise.all([WebAssembly.compileStreaming(fetch(url)), loadGameInfo()]);
  // The remake layer draws the battles in 3D (src/remake): at the start of
  // each frame it prepares the frame's pictures.
  let remake: RemakeLayer | null = null;
  let onVBlank: ((count: number) => void) | null = null;
  const game = await loadGame(module, {
    flash: manual ? undefined : loadSave(),
    rtcOffset: manual ? 0 : Number(localStorage.getItem(RTC_KEY) ?? 0) || 0,
    time: clock ? () => clock : undefined,
    log: (t) => console.log(`[game] ${t}`),
    onFrameStart: () => remake?.onFrameStart(),
    onVBlank: (count) => onVBlank?.(count),
  });
  await game.init();
  const layer = new RemakeLayer(game, info);
  remake = layer;
  const battle = params.get('battle');
  let pendingBattle = battle ? testBattleArgs(battle, speciesTable, info.constants) : null;
  const image = new ImageData(WIDTH, HEIGHT);
  const show = (rgba: Uint8ClampedArray = game.frameRGBA()) => {
    image.data.set(rgba);
    ctx.putImageData(image, 0, 0);
  };
  /**
   * One iteration of the game's loop, `held` keys (KEYS bits) pressed, or
   * the keys as they are (null): false after a soft reset (the GBA started
   * over).
   */
  const step = async (held: number | null): Promise<boolean> => {
    if (pendingBattle && startTestBattle(game, pendingBattle)) pendingBattle = null;
    if (held !== null) game.setKeys(held);
    if (!game.frame()) {
      await game.init();
      return false;
    }
    if (!manual && game.saved()) storeSave(game);
    return true;
  };
  status.textContent = '';

  if (manual) {
    // An input script's keys, by the frame they are held from: set at the
    // VBlank before it (so the game reads them in that frame), as
    // platform/tools/run.mjs does.
    const schedule = new Map<number, number>();
    // The frame at the VBlank runTo stops at, as it was then (a game frame
    // can span two VBlanks when the GBA would lag).
    let stopAt = 0;
    let stopFrame: Uint8ClampedArray | null = null;
    onVBlank = (count) => {
      if (count === stopAt) stopFrame = game.frameRGBA().slice();
      const keys = schedule.get(count + 1);
      if (keys !== undefined) game.setKeys(keys);
    };
    (window as unknown as { __game: unknown }).__game = {
      /** An input script's keys: [frame, KEYS bits] pairs, each held from its frame until the next. */
      play(inputs: [number, number][]) {
        schedule.clear();
        for (const [frame, keys] of inputs) schedule.set(frame, keys);
        game.setKeys(schedule.get(1) ?? 0);
      },
      /**
       * Run until `vblanks` VBlanks since power-on, the script's keys pressed
       * (or `held` keys from now on); the canvas shows the frame at that VBlank.
       */
      async runTo(vblanks: number, held?: number): Promise<number> {
        if (held !== undefined) game.setKeys(held);
        stopAt = vblanks;
        stopFrame = null;
        while (game.vblanks() < vblanks) {
          // The game waits while the remake layer loads what a battle needs.
          while (!layer.ready()) await new Promise((r) => setTimeout(r, 20));
          // Only the frame shown gets the remake's pictures.
          layer.drawPictures = game.vblanks() + 1 >= vblanks;
          await step(null);
        }
        layer.drawPictures = true;
        show(stopFrame ?? undefined);
        return game.vblanks();
      },
      vblanks: () => game.vblanks(),
      /** The canvas (the last frame shown) as a PNG data URL. */
      png: () => canvas.toDataURL('image/png'),
      /** The game itself (its exports and memory), for tools that read its state. */
      game,
    };
    return;
  }

  // The game's sound, frame by frame (it starts with the first key press or tap).
  const audio = GameAudio.open();
  let last = performance.now();
  let owed = 0;
  const tick = async (now: number) => {
    owed = Math.min(owed + (now - last), FRAME_MS * 4);
    last = now;
    try {
      while (owed >= FRAME_MS) {
        // The game waits while the remake layer loads what a battle needs.
        if (!layer.ready()) {
          owed = 0;
          break;
        }
        const before = game.vblanks();
        if (!(await step(keys()))) {
          owed = 0;
          break;
        }
        owed -= FRAME_MS * Math.max(1, game.vblanks() - before);
      }
    } catch (e) {
      status.textContent = e instanceof GameHalt ? `The game stopped: ${e.message}` : `Error: ${(e as Error).message}`;
      throw e;
    }
    audio?.push(game.readAudio(), game.audioRate());
    show();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

main().catch((e) => {
  status.textContent = `Could not start: ${(e as Error).message}`;
  console.error(e);
});
