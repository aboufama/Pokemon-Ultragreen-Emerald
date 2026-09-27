// The compiled game in the browser: pret/pokeemerald built for WebAssembly
// (platform/, docs/ARCHITECTURE.md), run at the GBA's frame rate on the GBA
// screen, with the keyboard, a gamepad or the GBA buttons on touch screens
// (src/ui/handheld.ts), its sound (the game's own m4a engine and the GBA's
// sound chip, played as it comes: ./audio.ts), and the cartridge's save kept
// in the browser. Its battles are drawn in 3D by the remake layer
// (src/remake).
//
// The page opens on a start screen drawn like the game's main menu
// (src/menus/start.ts): PLAY THE GAME runs the game from power-on; DEMO
// BATTLES sets up wild battles on the GBA screen and plays them in the game
// (./demo.ts), back to the start screen after. ?play=1 goes straight to the
// game.
//
// ?battle=BLAZIKEN:50,SWAMPERT:50[,GRASS] starts a test battle as soon as
// the game can (platform/game/remake_test.c): the player's Pokémon and the
// wild one with their levels (and moves: BLAZIKEN:50:BLAZE_KICK/SLASH), and
// the place (BATTLE_ENVIRONMENT_*, the map's by default).
//
// ?manual=1 is for tools (tools/remake/run.mjs): the game runs only when
// told, frame by frame (window.__game), from a blank save, and with
// ?time=2026,1,1,4,10,0,0 on a fixed clock, so a run is the same every time.
// An input script's keys change at the VBlanks it names, as in the headless
// runner (platform/tools/run.mjs), so a script plays the same in both.

import { loadGame, KEYS, GameHalt, type Game } from '../../platform/host/game.mjs';
import speciesTable from '../data/generated/species.json';
import movesTable from '../data/generated/moves.json';
import { RemakeLayer } from '../remake/layer';
import { type GameInfo, loadGameInfo, readBattleState, constant } from '../remake/state';
import { type TestBattle, startTestBattle, testBattleArgs } from '../../platform/host/test_battle.mjs';
import { GameAudio } from './audio';
import { type Button, GAME_KEYS, GAME_MENU_KEYS, Input } from '../battle/input';
import { GbaScreen } from '../battle/screen';
import { mountHandheld, touchDevice } from '../ui/handheld';
import { type MenuGfx, loadMenuGfx } from '../menus/gfx';
import { MenuScreen } from '../menus/screen';
import { startScreen } from '../menus/start';
import { sound } from '../audio/sound';
import { type DemoConsole, demoBattles } from './demo';

declare global {
  interface Window {
    /** For tests: the screen the page is on (start, the demo's screens, game) and the game. */
    __page?: { step: () => string; game: () => Game | null };
  }
}

/** The GBA's refresh: 16.78 MHz / 280896 cycles a frame. */
const FRAME_MS = 1000 / 59.7275;
const SAVE_KEY = 'ultragreen.flash';
const RTC_KEY = 'ultragreen.rtcOffset';
const KEY_HINT = 'Arrows move · X is A · Z is B · Enter is START · Backspace is SELECT · A and S are L and R';
const BUTTON_BITS: [Button, number][] = (['A', 'B', 'SELECT', 'START', 'RIGHT', 'LEFT', 'UP', 'DOWN', 'R', 'L'] as const).map((b) => [b, KEYS[b]]);

// ---------------------------------------------------------------- input

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

/** The GBA's keys (KEYS bits) down this frame: the keyboard and the GBA buttons (`input`), and gamepads. */
function keysOf(input: Input): number {
  let bits = gamepadKeys();
  for (const [b, bit] of BUTTON_BITS) if (input.isDown(b)) bits |= bit;
  return bits;
}

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

// ---------------------------------------------------------------- the game at its frame rate

/**
 * The game running on the screen at the GBA's frame rate: its frames, its
 * sound, and the buttons (none while a menu is over it). It holds while the
 * remake layer loads what a battle needs.
 */
class Runner {
  /** The game steps (and plays its sound). */
  running = false;
  /** The game's save is kept (the demo battles' games are not). */
  saves = true;
  onError: (e: unknown) => void = () => undefined;
  private pending: TestBattle | null = null;
  private waiters: { done: () => boolean; resolve: () => void }[] = [];
  private last = 0;
  private owed = 0;

  constructor(
    readonly game: Game,
    readonly layer: RemakeLayer,
    private readonly screen: GbaScreen,
    private readonly audio: GameAudio | null,
    private readonly input: Input,
    /** Whether the game takes the buttons (no menu over it). */
    private readonly takesKeys: () => boolean,
  ) {
    requestAnimationFrame(this.tick);
  }

  /** A test battle, started before the first frame the game can. */
  battle(args: TestBattle): void {
    this.pending = args;
  }

  /** Resolves after the first frame `done()` holds after. */
  until(done: () => boolean): Promise<void> {
    return new Promise((resolve) => this.waiters.push({ done, resolve }));
  }

  show(): void {
    this.screen.ui.data.set(this.game.frameRGBA());
    this.screen.presentUi();
  }

  /** One iteration of the game's loop: false after a soft reset (the GBA started over). */
  private async step(): Promise<boolean> {
    const { game } = this;
    if (this.pending && startTestBattle(game, this.pending)) this.pending = null;
    this.input.poll();
    game.setKeys(this.takesKeys() ? keysOf(this.input) : 0);
    if (!game.frame()) {
      await game.init();
      return false;
    }
    if (this.saves && game.saved()) storeSave(game);
    return true;
  }

  private readonly tick = async (now: number) => {
    const elapsed = now - (this.last || now);
    this.last = now;
    if (!this.running) {
      this.owed = 0;
      requestAnimationFrame(this.tick);
      return;
    }
    this.owed = Math.min(this.owed + elapsed, FRAME_MS * 4);
    try {
      while (this.owed >= FRAME_MS) {
        // The game waits while the remake layer loads what a battle needs.
        if (!this.layer.ready()) {
          this.owed = 0;
          break;
        }
        const before = this.game.vblanks();
        if (!(await this.step())) {
          this.owed = 0;
          break;
        }
        this.owed -= FRAME_MS * Math.max(1, this.game.vblanks() - before);
        this.waiters = this.waiters.filter((w) => !(w.done() && (w.resolve(), true)));
      }
      this.audio?.push(this.game.readAudio(), this.game.audioRate());
      this.show();
    } catch (e) {
      this.running = false;
      this.onError(e);
      return;
    }
    requestAnimationFrame(this.tick);
  };
}

// ---------------------------------------------------------------- the page

interface Loaded {
  game: Game;
  info: GameInfo;
  layer: RemakeLayer;
  /** What runs at each VBlank (manual mode's input script). */
  setOnVBlank: (f: (count: number) => void) => void;
}

/** The game and what the remake layer reads of it: most of the page's download. */
async function loadTheGame(manual: boolean, clock: number[] | undefined): Promise<Loaded> {
  const url = new URL('game/pokeemerald.wasm', document.baseURI);
  const [module, info] = await Promise.all([WebAssembly.compileStreaming(fetch(url)), loadGameInfo()]);
  let layer: RemakeLayer | null = null;
  let onVBlank: ((count: number) => void) | null = null;
  const game = await loadGame(module, {
    flash: manual ? undefined : loadSave(),
    rtcOffset: manual ? 0 : Number(localStorage.getItem(RTC_KEY) ?? 0) || 0,
    time: clock ? () => clock : undefined,
    log: (t) => console.log(`[game] ${t}`),
    // The remake layer draws the battles in 3D (src/remake): at the start of
    // each frame it prepares the frame's pictures.
    onFrameStart: () => layer?.onFrameStart(),
    onVBlank: (count) => onVBlank?.(count),
  });
  await game.init();
  layer = new RemakeLayer(game, info);
  return { game, info, layer, setOnVBlank: (f) => (onVBlank = f) };
}

async function main() {
  const params = new URLSearchParams(location.search);
  const manual = params.has('manual');
  const battle = params.get('battle');
  const touch = touchDevice();

  // The page: the screen and, on touch screens, the GBA buttons (with L and
  // R); the buttons drive the menu over the game while there is one.
  let menu: MenuScreen | null = null;
  const input = new Input(window, GAME_KEYS);
  const { screen: box } = mountHandheld(document.getElementById('app')!, () => menu?.input ?? input, {
    pad: touch && params.get('pad') !== '0' && !manual,
    shoulders: true,
    hint: touch ? undefined : KEY_HINT,
  });
  const screen = new GbaScreen(box, undefined, touch);
  const status = document.createElement('div');
  status.id = 'status';
  status.textContent = 'Loading…';
  box.append(status);
  const loading = loadTheGame(manual, params.get('time')?.split(',').map(Number));
  loading.catch((e) => (status.textContent = `Could not load the game: ${(e as Error).message}`));

  if (manual) {
    const { game, info, layer, setOnVBlank } = await loading;
    manualMode(game, layer, screen, setOnVBlank, battle ? testBattleArgs(battle, { species: speciesTable, moves: movesTable }, info.constants) : null);
    status.textContent = '';
    return;
  }

  // The game's sound, frame by frame (it starts with the first key press or
  // tap); the menus' music and sounds (src/audio/sound.ts).
  const audio = GameAudio.open();
  if (params.get('sound') !== '0') sound.enable();
  let step = 'start';
  let demo: DemoConsole | null = null;
  let loadedGame: Game | null = null;
  window.__page = { step: () => (step === 'demo' && demo ? demo.step : step), game: () => loadedGame };

  const openMenu = (g: MenuGfx) => {
    if (!menu) {
      menu = new MenuScreen(box, g, touch, GAME_MENU_KEYS);
      box.append(status);
    }
    return menu;
  };
  const closeMenu = () => {
    menu?.dispose();
    menu = null;
    // A button pressed or held for the menu is not the game's.
    input.reset();
  };

  // The game running on the screen, once it is in.
  let started: Promise<{ runner: Runner; demo: DemoConsole }> | null = null;
  const ready = (g: MenuGfx | null) =>
    (started ??= loading.then(({ game, info, layer }) => {
      loadedGame = game;
      const runner = new Runner(game, layer, screen, audio, input, () => menu === null);
      runner.onError = (e) => {
        status.textContent = e instanceof GameHalt ? `The game stopped: ${e.message}` : `Error: ${(e as Error).message}`;
        console.error(e);
      };
      demo = {
        game,
        constants: info.constants,
        step: 'you',
        run: (on) => (runner.running = on),
        battle: (args) => runner.battle(args),
        until: (done) => runner.until(done),
        battleShown: () => battleShown(game, layer, info),
        fade: (level, seconds) => audio?.fade(level, seconds),
        openMenu: () => openMenu(g!),
        closeMenu,
      };
      return { runner, demo };
    }));

  if (battle) {
    const { runner } = await ready(null);
    const { info } = await loading;
    step = 'game';
    runner.battle(testBattleArgs(battle, { species: speciesTable, moves: movesTable }, info.constants));
    runner.running = true;
    status.textContent = '';
    return;
  }

  /** PLAY THE GAME: after the demo battles, from power-on again. */
  const play = async (g: MenuGfx | null, reboot: boolean) => {
    const { runner } = await ready(g);
    step = 'game';
    closeMenu();
    if (reboot) await runner.game.init();
    audio?.fade(1);
    runner.saves = true;
    runner.running = true;
  };
  if (params.get('play') === '1') {
    await play(null, false);
    status.textContent = '';
    return;
  }

  // The start screen shows while the game is still loading.
  const g = await loadMenuGfx();
  status.textContent = '';
  let demoRan = false;
  let choice = 0;
  for (;;) {
    step = 'start';
    const m = openMenu(g);
    m.fadeAmount = 16;
    choice = await startScreen(m, [
      { label: 'PLAY THE GAME', about: 'Your journey in Hoenn.' },
      { label: 'DEMO BATTLES', about: 'Battle wild POKéMON in 3D now.' },
    ], choice);
    // The rest of the page waits for the game.
    if (!loadedGame) status.textContent = 'Loading the game…';
    const { runner, demo: c } = await ready(g);
    status.textContent = '';
    if (choice === 0) return play(g, demoRan);
    step = 'demo';
    demoRan = true;
    runner.saves = false;
    await demoBattles(c);
  }
}

/** The game's battle screen is up and drawn as the remake draws it. */
function battleShown(game: Game, layer: RemakeLayer, info: GameInfo): boolean {
  if (layer.mode === 'on') return layer.battleShown;
  const state = readBattleState(info.structs, game.memory(), (game.exports().RemakeState as () => number)(), constant(info, 'REMAKE_NO_BATTLER'));
  return state.battleScreen;
}

/**
 * Tools' mode (window.__game): the game runs only when told, an input
 * script's keys set at the VBlank before the frame they are held from (so
 * the game reads them in that frame), as platform/tools/run.mjs does.
 */
function manualMode(game: Game, layer: RemakeLayer, screen: GbaScreen, setOnVBlank: (f: (count: number) => void) => void, battle: TestBattle | null): void {
  let pending = battle;
  const schedule = new Map<number, number>();
  // The frame at the VBlank runTo stops at, as it was then (a game frame
  // can span two VBlanks when the GBA would lag).
  let stopAt = 0;
  let stopFrame: Uint8ClampedArray | null = null;
  setOnVBlank((count) => {
    if (count === stopAt) stopFrame = game.frameRGBA().slice();
    const keys = schedule.get(count + 1);
    if (keys !== undefined) game.setKeys(keys);
  });
  const show = (rgba: Uint8ClampedArray = game.frameRGBA()) => {
    screen.ui.data.set(rgba);
    screen.presentUi();
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
     * (or `held` keys from now on); the screen shows the frame at that VBlank.
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
        if (pending && startTestBattle(game, pending)) pending = null;
        if (!game.frame()) await game.init();
      }
      layer.drawPictures = true;
      show(stopFrame ?? undefined);
      return game.vblanks();
    },
    vblanks: () => game.vblanks(),
    /** The screen (the last frame shown) as a PNG data URL. */
    png: () => screen.canvas2d.toDataURL('image/png'),
    /** The game itself (its exports and memory), for tools that read its state. */
    game,
  };
}

main().catch((e) => {
  const status = document.getElementById('status');
  if (status) status.textContent = `Could not start: ${(e as Error).message}`;
  console.error(e);
});
