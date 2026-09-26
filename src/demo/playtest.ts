// The battle playtest (the published demo), played entirely on the GBA
// screen like the game: the title screen, then choose your Pokémon from
// Professor Birch's bag and the wild Pokémon to battle, set the moves
// (random, or learned one by one in a Move Relearner-style list), pick the
// place (its arena shows live), battle, and battle again. The page is only
// the screen and, on touch screens, the GBA buttons. Emerald's music plays
// throughout: the title theme, Professor Birch's lab while you set up, the
// wild battle theme and its victory (sound=0 turns it off).
//
//   demo.html?player=sceptile&enemy=swampert&moves=LEAF_BLADE,AGILITY
//            &enemyMoves=SURF,EARTHQUAKE&env=cave&go=1
//   (optional; go=1 skips the menus and battles at once, title=0 skips the title)

import { MOVES, SPECIES } from '../data';
import { getSpeciesProfile, profiledSpecies } from '../pokemon/registry';
import type { Side } from '../battle/engine';
import { movePool, moveKey, randomMoveset } from '../battle/moveset';
import { BattleScene } from '../battle/scene';
import { createTouchPad } from '../battle/touch_pad';
import type { Input } from '../battle/input';
import { loadMenuGfx } from '../menus/gfx';
import { MenuScreen } from '../menus/screen';
import { bagBackdrop, chooseFromBag, displayName } from '../menus/bag';
import { editMoves } from '../menus/moves';
import { type Place, choosePlace } from '../menus/places';
import { titleScreen } from '../menus/title';
import { ARENAS } from '../render3d/arena';
import { sound } from '../audio/sound';

declare global {
  interface Window {
    __playtest?: {
      scene: () => BattleScene | null;
      menu: () => MenuScreen | null;
      step: () => string;
    };
  }
}

const LEVEL = 50;
const STORE = 'ultragreen.playtest.v2';

/** Places to battle: every arena, by its Hoenn place (src/render3d/arena/arenas.ts). */
export const PLACES: Place[] = Object.entries(ARENAS).map(([arena, d]) => ({ arena, name: d.name, about: d.about }));

interface Saved {
  you?: string;
  foe?: string;
  moves?: string[];
  arena?: string;
}
function load(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '{}') as Saved;
  } catch {
    return {};
  }
}
function save(s: Saved): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // Private mode or blocked storage: the setup just isn't remembered.
  }
}

/** One battle, fully decided (a rematch replays it). */
interface Battle {
  you: string;
  foe: string;
  moves: string[];
  foeMoves: string[] | null;
  arena: string;
}

export async function runPlaytest(root: HTMLElement): Promise<void> {
  injectCss();
  const params = new URLSearchParams(location.search);
  if (params.get('sound') !== '0') sound.enable();
  const coarse = matchMedia('(pointer: coarse)').matches;
  const roster = profiledSpecies().sort((a, b) => (SPECIES[a]?.nationalDex ?? 0) - (SPECIES[b]?.nationalDex ?? 0)).slice(0, 3);
  const showcase: Record<string, string[]> = {};
  await Promise.all(roster.map(async (s) => (showcase[s] = ((await getSpeciesProfile(s)).showcaseMoves ?? []).map((m) => m.replace(/^MOVE_/, '')))));
  const g = await loadMenuGfx();

  // The page: the screen, and the GBA buttons on touch screens.
  root.className = 'pt';
  root.dataset.pad = coarse && params.get('pad') !== '0' ? 'on' : 'off';
  root.replaceChildren();
  const screenBox = document.createElement('div');
  screenBox.className = 'pt-screen';
  screenBox.addEventListener('contextmenu', (e) => e.preventDefault());
  let menu: MenuScreen | null = null;
  let scene: BattleScene | null = null;
  const input = (): Input | null => scene?.input ?? menu?.input ?? null;
  const pad = createTouchPad(input);
  root.append(screenBox, pad);

  const openMenu = () => {
    menu ??= new MenuScreen(screenBox, g, coarse);
    return menu;
  };
  const closeMenu = async () => {
    if (!menu) return;
    await menu.fadeTo(16);
    menu.dispose();
    menu = null;
  };

  const saved = load();
  const valid = (s: string | null | undefined) => (s && roster.includes(s) ? s : null);
  const knows = (slug: string, moves: string[] | undefined) => {
    const pool = new Set(movePool(slug, LEVEL).map(moveKey));
    return !!moves?.length && moves.every((m) => pool.has(m) || showcase[slug]?.includes(m));
  };
  const firstMoves = (slug: string) => (showcase[slug]?.length === 4 ? showcase[slug] : randomMoveset(slug, LEVEL));

  let step = 'you';
  window.__playtest = {
    scene: () => scene,
    menu: () => menu,
    step: () => step,
  };
  // The playtest runs for as long as the page is open: ready once it can take input.
  (window as { __ready?: boolean }).__ready = true;

  async function battle(b: Battle): Promise<Side | 'escaped'> {
    step = 'battle';
    await closeMenu();
    let done!: (r: Side | 'escaped') => void;
    const finished = new Promise<Side | 'escaped'>((resolve) => (done = resolve));
    const s = await BattleScene.create(screenBox, {
      player: { slug: b.you, level: LEVEL, moves: b.moves },
      opponent: { slug: b.foe, level: LEVEL, moves: b.foeMoves ?? randomMoveset(b.foe, LEVEL) },
      environment: b.arena,
      textSpeed: 'fast',
      intro: true,
      loop: false,
      fill: coarse,
      onEnd: (r) => done(r),
    });
    scene = s;
    window.__battle = { scene: s, step: (frames, renderEvery) => s.stepFrames(frames, renderEvery), state: () => s.debugState() };
    s.start();
    const result = await finished;
    s.dispose();
    scene = null;
    return result;
  }

  // Straight to a battle from the URL (tests, shared setups).
  const list = (k: string) => params.get(k)?.split(',').map((m) => m.trim().toUpperCase().replace(/^MOVE_/, '')).filter((m) => !!MOVES[`MOVE_${m}`]);
  if (params.get('go') === '1') {
    const you = valid(params.get('player')) ?? roster[0];
    const foe = valid(params.get('enemy')) ?? roster[1] ?? roster[0];
    await battle({ you, foe, moves: list('moves')?.slice(0, 4) ?? firstMoves(you), foeMoves: list('enemyMoves')?.slice(0, 4) ?? null, arena: params.get('env') ?? 'grass' });
  }

  // The title screen, then the setup, one screen after another; B goes back a screen.
  if (params.get('title') !== '0') await titleScreen(openMenu(), { hints: !coarse });

  let you = valid(saved.you) ?? roster[1] ?? roster[0];
  let foe = valid(saved.foe) ?? roster[2] ?? roster[0];
  let moves = knows(you, saved.moves) ? saved.moves! : firstMoves(you);
  let foeMoves: string[] | null = null;
  let arena = PLACES.some((p) => p.arena === saved.arena) ? saved.arena! : 'grass';
  for (;;) {
    const m = openMenu();
    // Setting up plays Professor Birch's lab (after the last song's fade-out).
    sound.playBGM('mus_birch_lab');
    if (step === 'you' || step === 'battle') {
      step = 'you';
      m.fadeAmount = 16;
      const pick = await chooseFromBag(m, {
        roster,
        start: roster.indexOf(you),
        prompt: 'Which POKéMON will you\nbattle with?',
        confirm: 'Do you choose this POKéMON?',
      });
      if (!pick) continue;
      if (pick !== you) moves = firstMoves(pick);
      you = pick;
      step = 'foe';
    } else if (step === 'foe') {
      m.fadeAmount = 16;
      const pick = await chooseFromBag(m, {
        roster,
        start: roster.indexOf(foe),
        random: true,
        prompt: `Which wild POKéMON will\nyou battle? {SELECT_BUTTON} Random`,
        confirm: 'Battle this POKéMON?',
      });
      if (!pick) {
        step = 'you';
        continue;
      }
      if (pick !== foe) foeMoves = null;
      foe = pick;
      step = 'moves';
    } else if (step === 'moves') {
      m.fadeAmount = 16;
      void m.fadeTo(0);
      const r = await editMoves(m, { slug: you, level: LEVEL, moves, foe: { slug: foe, moves: foeMoves ?? randomMoveset(foe, LEVEL) } });
      await m.fadeTo(16);
      if (!r) {
        step = 'foe';
        continue;
      }
      moves = r.moves;
      if (r.foeMoves) foeMoves = r.foeMoves;
      step = 'place';
    } else if (step === 'place') {
      m.fadeAmount = 16;
      void m.fadeTo(0);
      const pick = await choosePlace(m, PLACES, Math.max(0, PLACES.findIndex((p) => p.arena === arena)));
      await m.fadeTo(16);
      if (!pick) {
        step = 'moves';
        continue;
      }
      arena = pick;
      save({ you, foe, moves, arena });
      // Battle, then offer another.
      for (;;) {
        const result = await battle({ you, foe, moves, foeMoves, arena });
        // A win keeps its victory music; otherwise the lab's comes back.
        if (result !== 'player') sound.playBGM('mus_birch_lab');
        const after = openMenu();
        after.fadeAmount = 16;
        const removeBg = after.show(bagBackdrop(after));
        void after.fadeTo(0);
        const said = result === 'player' ? `You defeated the wild\n${displayName(foe)}!` : result === 'opponent' ? `${displayName(you)} fainted…` : 'Got away safely!';
        const removeMsg = await after.message(`${said}\\pBattle again?`);
        const again = await after.yesNo();
        removeMsg();
        // Back to the setup: the victory music fades out first.
        if (!again && sound.currentBGM !== 'mus_birch_lab') sound.fadeOutBGM(4);
        await after.fadeTo(16);
        removeBg();
        if (!again) break;
      }
      step = 'you';
    }
  }
}

function injectCss(): void {
  if (document.getElementById('pt-css')) return;
  const style = document.createElement('style');
  style.id = 'pt-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

const CSS = `
html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
.pt { position: fixed; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; grid-template-areas: "screen" "pad";
  background: #000; padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
  box-sizing: border-box; touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.pt-screen { grid-area: screen; position: relative; min-height: 0; overflow: hidden; }
.pt > .gba-pad { grid-area: pad; }
.pt[data-pad="off"] .gba-pad { display: none; }
/* GBA buttons sized for thumbs and to fit the phone's width. */
.pt .gba-pad { --dp: min(56px, 12.5vw); --ab: min(74px, 16vw); max-width: 600px; gap: 10px; padding: 8px 14px 16px; }
.pt .gba-dpad { grid-template-columns: repeat(3, var(--dp)); grid-template-rows: repeat(3, var(--dp)); }
.pt .gba-ab { grid-template-columns: var(--ab) var(--ab); grid-template-rows: calc(var(--ab) * 0.48) var(--ab) calc(var(--ab) * 0.48); column-gap: 10px; }
.pt .gba-ab button { width: var(--ab); height: var(--ab); font-size: calc(var(--ab) * 0.32); }
.pt .gba-mid button { width: 62px; height: 26px; }
/* Portrait: the screen across the top, the buttons below. */
@media (orientation: portrait) {
  .pt { grid-template-rows: auto minmax(0, 1fr); }
  .pt-screen { width: 100%; aspect-ratio: 3 / 2; max-height: 72vh; }
  .pt > .gba-pad { align-self: center; }
}
/* Held sideways: D-pad left of the screen, A/B right, like a handheld. */
@media (orientation: landscape) and (max-height: 540px) {
  .pt[data-pad="on"] { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-rows: minmax(0, 1fr) auto; grid-template-areas: "dpad screen ab" "dpad mid ab"; }
  .pt[data-pad="on"] > .gba-pad { display: contents; }
  .pt[data-pad="on"] .gba-pad { --dp: min(54px, 13vh); --ab: min(72px, 17vh); }
  .pt[data-pad="on"] .gba-dpad { grid-area: dpad; align-self: center; margin: 0 14px; }
  .pt[data-pad="on"] .gba-ab { grid-area: ab; align-self: center; margin: 0 14px; }
  .pt[data-pad="on"] .gba-mid { grid-area: mid; flex-direction: row; justify-self: center; align-self: center; margin: 4px 0 6px; gap: 14px; }
}
`;
