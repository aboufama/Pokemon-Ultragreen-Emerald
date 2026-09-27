// The compiled game in the browser: pret/pokeemerald built for WebAssembly
// (platform/, docs/ARCHITECTURE.md), run at the GBA's frame rate on a
// canvas, with the keyboard, a gamepad or the touch pad, and the cartridge's
// save kept in the browser. Its battles are drawn in 3D by the remake layer
// (src/remake).
//
// ?battle=BLAZIKEN:50,SWAMPERT:50[,GRASS] starts a test battle as soon as
// the game can (platform/game/remake_test.c): the player's Pokémon and the
// wild one with their levels, and the place (BATTLE_ENVIRONMENT_*, the map's
// by default).

import { loadGame, KEYS, GameHalt, WIDTH, HEIGHT, type Game } from '../../platform/host/game.mjs';
import speciesTable from '../data/generated/species.json';
import { RemakeLayer } from '../remake/layer';
import { loadGameInfo, type GameInfo } from '../remake/state';

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

// ---------------------------------------------------------------- test battles

/** The test battle ?battle= asks for: RemakeTestBattle's arguments. */
function testBattle(info: GameInfo): number[] | null {
  const q = new URLSearchParams(location.search).get('battle');
  if (!q) return null;
  const species = new Map(Object.values(speciesTable as Record<string, { id: number; const: string }>).map((s) => [s.const, s.id]));
  const [player, wild, place] = q.split(',');
  const mon = (text: string) => {
    const [name, level] = text.split(':');
    const id = species.get(`SPECIES_${name.toUpperCase()}`);
    if (id === undefined) throw new Error(`?battle=: no species ${name}`);
    return [id, Number(level) || 5];
  };
  const env = place ? info.constants[`BATTLE_ENVIRONMENT_${place.toUpperCase()}`] : 0xff;
  if (env === undefined) {
    const places = Object.keys(info.constants).filter((k) => k.startsWith('BATTLE_ENVIRONMENT_')).map((k) => k.slice(19));
    throw new Error(`?battle=: no place ${place} (${places.join(', ')})`);
  }
  return [...mon(player), ...mon(wild), env];
}

// ---------------------------------------------------------------- run

async function main() {
  const url = new URL('game/pokeemerald.wasm', document.baseURI);
  const [module, info] = await Promise.all([WebAssembly.compileStreaming(fetch(url)), loadGameInfo()]);
  // The remake layer draws the battles in 3D (src/remake): at the start of
  // each frame it prepares the frame's pictures.
  let remake: RemakeLayer | null = null;
  const game = await loadGame(module, {
    flash: loadSave(),
    rtcOffset: Number(localStorage.getItem(RTC_KEY) ?? 0) || 0,
    log: (t) => console.log(`[game] ${t}`),
    onFrameStart: () => remake?.onFrameStart(),
  });
  await game.init();
  remake = new RemakeLayer(game, info);
  let pendingBattle = testBattle(info);
  status.textContent = '';
  let last = performance.now();
  let owed = 0;
  const image = new ImageData(WIDTH, HEIGHT);
  const tick = async (now: number) => {
    owed = Math.min(owed + (now - last), FRAME_MS * 4);
    last = now;
    try {
      while (owed >= FRAME_MS) {
        // The game waits while the remake layer loads what a battle needs.
        if (!remake.ready()) {
          owed = 0;
          break;
        }
        if (pendingBattle && (game.exports().RemakeTestBattle as (...a: number[]) => number)(...pendingBattle)) pendingBattle = null;
        game.setKeys(keys());
        const before = game.vblanks();
        if (!game.frame()) {
          // A soft reset (A+B+START+SELECT): the GBA starts over.
          await game.init();
          owed = 0;
          break;
        }
        owed -= FRAME_MS * Math.max(1, game.vblanks() - before);
        if (game.saved()) storeSave(game);
      }
    } catch (e) {
      status.textContent = e instanceof GameHalt ? `The game stopped: ${e.message}` : `Error: ${(e as Error).message}`;
      throw e;
    }
    image.data.set(game.frameRGBA());
    ctx.putImageData(image, 0, 0);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

main().catch((e) => {
  status.textContent = `Could not start: ${(e as Error).message}`;
  console.error(e);
});
