// The battle playtest (the published demo): pick your Pokémon and the foe,
// a random, showcase or hand-picked moveset for each, and battle, in a page
// that plays like an emulator: the GBA screen as large as the window allows,
// the keyboard on a computer, an on-screen D-pad and A/B on a phone (beside
// the screen when the phone is held sideways).
//
//   demo.html?player=sceptile&enemy=swampert&moves=LEAF_BLADE,AGILITY
//            &enemyMoves=SURF,EARTHQUAKE&env=sand&level=50&go=1
//   (every parameter optional; go=1 skips the setup and battles at once)

import { MOVES, SPECIES, type MoveData } from '../data';
import { asset } from '../gba/assets';
import { getSpeciesProfile, profiledSpecies } from '../pokemon/registry';
import type { Side } from '../battle/engine';
import { effectivePower, movePool, moveKey, randomMoveset } from '../battle/moveset';
import { BattleScene } from '../battle/scene';
import { createTouchPad } from '../battle/touch_pad';

declare global {
  interface Window {
    __playtest?: { scene: () => BattleScene | null; battle: (b: Battle) => Promise<void> };
  }
}

type Mode = 'random' | 'showcase' | 'choose';
interface Moveset {
  mode: Mode;
  moves: string[];
}
interface Setup {
  player: string;
  /** A species, or 'random'. */
  enemy: string;
  env: string;
  level: number;
  moves: Record<'player' | 'enemy', Moveset>;
  pad: boolean | null;
}
/** One battle, fully decided (a rematch replays it). */
export interface Battle {
  player: string;
  enemy: string;
  playerMoves: string[];
  enemyMoves: string[];
  env: string;
  level: number;
}

const STORE = 'ultragreen.playtest.v1';
const ARENAS: [string, string][] = [
  ['grass', 'Grass'], ['long_grass', 'Tall grass'], ['sand', 'Sand'], ['water', 'Water'], ['pond', 'Pond'],
  ['underwater', 'Underwater'], ['mountain', 'Mountain'], ['cave', 'Cave'], ['building', 'Building'], ['plain', 'Plain'],
];
const LEVELS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const TYPE_COLORS: Record<string, string> = {
  NORMAL: '#9c9c74', FIRE: '#e8772d', WATER: '#5b86e6', GRASS: '#62b346', ELECTRIC: '#d9b21f', ICE: '#6cbdbd',
  FIGHTING: '#b8302a', POISON: '#98419c', GROUND: '#c7a54f', FLYING: '#8f7ce0', PSYCHIC: '#e65583', BUG: '#98a91d',
  ROCK: '#a8923a', GHOST: '#6c5796', DRAGON: '#6c3ee6', DARK: '#6b5446', STEEL: '#9e9eb8', MYSTERY: '#68a090',
};
/** Gen 3 move names written as one word. */
const CAMEL: Record<string, string> = {
  DYNAMICPUNCH: 'DynamicPunch', THUNDERPUNCH: 'ThunderPunch', SOLARBEAM: 'SolarBeam', SMOKESCREEN: 'SmokeScreen',
  ANCIENTPOWER: 'AncientPower', EXTREMESPEED: 'ExtremeSpeed', DRAGONBREATH: 'DragonBreath', SONICBOOM: 'SonicBoom',
  THUNDERSHOCK: 'ThunderShock', POISONPOWDER: 'PoisonPowder', SELFDESTRUCT: 'Selfdestruct', SOFTBOILED: 'Softboiled',
};

const title = (s: string) => CAMEL[s] ?? s.toLowerCase().replace(/(^|[\s-])(\S)/g, (_m, a: string, b: string) => a + b.toUpperCase());
const monName = (slug: string) => title(SPECIES[slug]?.name ?? slug);
const typeName = (t: string) => t.replace(/^TYPE_/, '');
const moveOf = (key: string): MoveData | undefined => MOVES[`MOVE_${key}`];

function load(): Partial<Setup> {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '{}') as Partial<Setup>;
  } catch {
    return {};
  }
}
function save(setup: Setup): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(setup));
  } catch {
    // Private mode or blocked storage: the setup just isn't remembered.
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function button(cls: string, text: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', cls, text);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}
function typeChip(t: string): HTMLSpanElement {
  const c = el('span', 'pt-type', typeName(t));
  c.style.setProperty('--type', TYPE_COLORS[typeName(t)] ?? '#777');
  return c;
}
/** "85 · 90% · PP 10" (status moves: "Status · PP 30"; "—" accuracy never misses, as the game writes it). */
function moveMeta(m: MoveData): string {
  const acc = m.accuracy ? `${m.accuracy}%` : '—';
  if (m.power === 0) return `Status · ${m.accuracy ? `${acc} · ` : ''}PP ${m.pp}`;
  const power = m.effect === 'EFFECT_LEVEL_DAMAGE' ? 'Lv dmg' : m.power > 1 ? String(m.power) : String(effectivePower(m));
  return `${power} · ${acc} · PP ${m.pp}`;
}

export async function runPlaytest(root: HTMLElement): Promise<void> {
  injectCss();
  const params = new URLSearchParams(location.search);
  const roster = profiledSpecies().sort((a, b) => (SPECIES[a]?.nationalDex ?? 0) - (SPECIES[b]?.nationalDex ?? 0));
  const showcase: Record<string, string[]> = {};
  await Promise.all(roster.map(async (s) => (showcase[s] = ((await getSpeciesProfile(s)).showcaseMoves ?? []).map((m) => m.replace(/^MOVE_/, '')))));
  const coarse = matchMedia('(pointer: coarse)').matches;
  const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

  // Setup: the URL, else what was used last time, else a starter each.
  const saved = load();
  const list = (k: string) => params.get(k)?.split(',').map((s) => s.trim().toUpperCase().replace(/^MOVE_/, '')).filter((m) => !!moveOf(m));
  const valid = (s: string | null | undefined) => (s && roster.includes(s) ? s : null);
  const setup: Setup = {
    player: valid(params.get('player')) ?? valid(saved.player) ?? roster[0],
    enemy: params.get('enemy') === 'random' ? 'random' : valid(params.get('enemy')) ?? (saved.enemy === 'random' ? 'random' : valid(saved.enemy)) ?? roster[1] ?? roster[0],
    env: ARENAS.some(([k]) => k === params.get('env')) ? params.get('env')! : ARENAS.some(([k]) => k === saved.env) ? saved.env! : 'grass',
    level: Number(params.get('level')) || saved.level || 50,
    moves: {
      player: saved.moves?.player ?? { mode: 'random', moves: [] },
      enemy: saved.moves?.enemy ?? { mode: 'random', moves: [] },
    },
    pad: saved.pad ?? null,
  };
  setup.level = Math.max(1, Math.min(100, Math.round(setup.level)));
  const urlMoves = list('moves');
  const urlEnemyMoves = list('enemyMoves');
  if (urlMoves?.length) setup.moves.player = { mode: 'choose', moves: urlMoves.slice(0, 4) };
  if (urlEnemyMoves?.length) setup.moves.enemy = { mode: 'choose', moves: urlEnemyMoves.slice(0, 4) };
  if (setup.enemy === 'random' && setup.moves.enemy.mode !== 'random') setup.moves.enemy = { mode: 'random', moves: [] };
  /** Bring a side's moves in line with its species, level and mode (`reroll`: a new random roll). */
  const fillMoves = (side: 'player' | 'enemy', reroll = true) => {
    const slug = side === 'player' ? setup.player : setup.enemy;
    const ms = setup.moves[side];
    if (slug === 'random') {
      ms.moves = [];
      return;
    }
    const pool = new Set(movePool(slug, setup.level).map(moveKey));
    if (ms.mode === 'showcase') ms.moves = showcase[slug]?.slice(0, 4) ?? [];
    else if (ms.mode === 'choose') ms.moves = ms.moves.filter((m) => pool.has(m) || showcase[slug]?.includes(m)).slice(0, 4);
    else if (reroll || !ms.moves.length || !ms.moves.every((m) => pool.has(m))) ms.moves = randomMoveset(slug, setup.level);
  };
  // Keep last time's roll when it still fits (the URL or a new species rolls again).
  fillMoves('player', false);
  fillMoves('enemy', false);

  // Page: bar, screen with the pad, keyboard legend, and the two sheets.
  root.className = 'pt';
  root.innerHTML = '';
  const padOn = () => setup.pad ?? coarse;
  const bar = el('header', 'pt-bar');
  const brand = el('div', 'pt-brand');
  brand.append(el('strong', '', 'Ultragreen'), el('span', '', ' battle playtest'));
  const actions = el('div', 'pt-actions');
  const newBtn = button('pt-chip', 'New battle', () => openSetup());
  const padBtn = button('pt-chip', 'Buttons', () => {
    setup.pad = !padOn();
    save(setup);
    applyPad();
  });
  padBtn.title = 'Show or hide the on-screen buttons';
  padBtn.classList.add('pt-padtoggle');
  actions.append(newBtn, padBtn);
  if (document.fullscreenEnabled) {
    const fs = button('pt-chip', 'Full screen', () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.().catch(() => undefined);
    });
    document.addEventListener('fullscreenchange', () => (fs.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen'));
    actions.append(fs);
  }
  bar.append(brand, actions);

  const stage = el('div', 'pt-stage');
  const screenBox = el('div', 'pt-screen');
  const status = el('div', 'pt-status', 'Loading…');
  screenBox.append(status);
  // A long press on the screen is a held A button, not a menu.
  screenBox.addEventListener('contextmenu', (e) => e.preventDefault());
  let scene: BattleScene | null = null;
  const pad = createTouchPad(() => scene?.input);
  stage.append(screenBox, pad);
  const keys = el('footer', 'pt-keys');
  keys.innerHTML = '<b>Z</b> / <b>Enter</b> = A &nbsp;·&nbsp; <b>X</b> / <b>Esc</b> = B &nbsp;·&nbsp; <b>Arrow keys</b> = D-pad &nbsp;·&nbsp; hold A or B to speed up text';
  root.append(bar, stage, keys);
  const applyPad = () => {
    root.dataset.pad = padOn() ? 'on' : 'off';
    padBtn.setAttribute('aria-pressed', String(padOn()));
  };
  applyPad();

  // ---------------------------------------------------------------------------
  // Setup sheet

  const setupSheet = el('section', 'pt-sheet');
  setupSheet.setAttribute('aria-label', 'Battle setup');
  const card = el('div', 'pt-card');
  setupSheet.append(card);
  const head = el('div', 'pt-head');
  const closeSetup = button('pt-chip', 'Back to battle', () => hideSheets());
  head.append(el('h1', '', 'Battle setup'), closeSetup);
  const monsYou = el('div', 'pt-mons');
  const monsFoe = el('div', 'pt-mons');
  const movesYou = el('div', 'pt-moves');
  const movesFoe = el('div', 'pt-moves');
  const descs = { player: el('p', 'pt-desc', 'Tap a move to see what it does.'), enemy: el('p', 'pt-desc', 'Tap a move to see what it does.') };
  const options = el('div', 'pt-options');
  const arena = el('select');
  for (const [v, t] of ARENAS) arena.add(new Option(t, v, false, v === setup.env));
  arena.addEventListener('change', () => {
    setup.env = arena.value;
    save(setup);
  });
  const level = el('select');
  for (const l of LEVELS.includes(setup.level) ? LEVELS : [...LEVELS, setup.level].sort((a, b) => a - b)) level.add(new Option(`Lv. ${l}`, String(l), false, l === setup.level));
  level.addEventListener('change', () => {
    setup.level = Number(level.value);
    fillMoves('player');
    fillMoves('enemy');
    save(setup);
    renderMoves();
  });
  const label = (text: string, control: HTMLElement) => {
    const l = el('label', 'pt-field');
    l.append(el('span', '', text), control);
    return l;
  };
  options.append(label('Arena', arena), label('Level (both)', level));
  const go = el('div', 'pt-go');
  const battleBtn = button('pt-battle', 'Battle!', () => void startBattle(decide()));
  const hint = el('p', 'pt-hint');
  if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !(navigator as { standalone?: boolean }).standalone) {
    hint.textContent = 'Tip: Share → Add to Home Screen plays it full screen, like an app.';
  }
  go.append(battleBtn, hint);
  const section = (name: string, ...children: HTMLElement[]) => {
    const s = el('section', 'pt-section');
    s.append(el('h2', '', name), ...children);
    return s;
  };
  card.append(head, section('Your Pokémon', monsYou), section('Your moves', movesYou), section('Opponent', monsFoe), section("Opponent's moves", movesFoe), options, go);

  const describe = (side: 'player' | 'enemy', m: MoveData) => {
    const d = descs[side];
    d.textContent = '';
    d.append(typeChip(m.type), el('b', '', ` ${title(m.name)} `), el('span', 'pt-muted', `${moveMeta(m)}. `), m.description || '');
  };

  function renderMons(): void {
    const cardFor = (side: 'player' | 'enemy', slug: string) => {
      const b = el('button', 'pt-mon');
      b.type = 'button';
      const selected = (side === 'player' ? setup.player : setup.enemy) === slug;
      b.setAttribute('aria-pressed', String(selected));
      const sprite = el('span', 'pt-sprite');
      if (slug === 'random') {
        sprite.classList.add('pt-random');
        sprite.textContent = '?';
      } else sprite.style.backgroundImage = `url("${asset(`gba/pokemon/${slug}/front.png`)}")`;
      const types = el('span', 'pt-types');
      if (slug !== 'random') for (const t of SPECIES[slug]?.types ?? []) types.append(typeChip(t));
      b.append(sprite, el('span', 'pt-name', slug === 'random' ? 'Random' : monName(slug)), types);
      b.addEventListener('click', () => {
        if (side === 'player') setup.player = slug;
        else {
          setup.enemy = slug;
          if (slug === 'random') setup.moves.enemy.mode = 'random';
        }
        fillMoves(side);
        save(setup);
        renderMons();
        renderMoves();
      });
      return b;
    };
    monsYou.replaceChildren(...roster.map((s) => cardFor('player', s)));
    monsFoe.replaceChildren(...[...roster, 'random'].map((s) => cardFor('enemy', s)));
  }

  function renderMoves(): void {
    renderMoveset(movesYou, 'player');
    renderMoveset(movesFoe, 'enemy');
    const chosenEmpty = (['player', 'enemy'] as const).some((s) => setup.moves[s].mode === 'choose' && !setup.moves[s].moves.length);
    battleBtn.disabled = chosenEmpty;
    battleBtn.textContent = chosenEmpty ? 'Choose at least one move' : 'Battle!';
  }

  function renderMoveset(box: HTMLElement, side: 'player' | 'enemy'): void {
    const slug = side === 'player' ? setup.player : setup.enemy;
    const ms = setup.moves[side];
    box.replaceChildren();
    const seg = el('div', 'pt-seg');
    seg.setAttribute('role', 'group');
    const modes: [Mode, string][] = [['random', 'Random'], ['showcase', 'Showcase'], ['choose', 'Choose']];
    for (const [mode, text] of modes) {
      const b = button('', text, () => {
        ms.mode = mode;
        // Choosing starts from the set shown, to tweak it; Random rolls a new set.
        if (mode !== 'choose') fillMoves(side);
        save(setup);
        renderMoves();
      });
      b.setAttribute('aria-pressed', String(ms.mode === mode));
      b.disabled = slug === 'random' && mode !== 'random';
      seg.append(b);
    }
    const tools = el('div', 'pt-movehead');
    tools.append(seg);
    if (ms.mode === 'random' && slug !== 'random') {
      tools.append(button('pt-chip', side === 'enemy' ? 'Reroll now' : 'Reroll', () => {
        ms.moves = randomMoveset(slug, setup.level);
        save(setup);
        renderMoves();
      }));
    }
    box.append(tools);
    if (slug === 'random') {
      box.append(el('p', 'pt-muted', 'A random opponent with four random moves, decided when the battle starts.'));
      return;
    }
    if (side === 'enemy' && ms.mode === 'random') {
      box.append(el('p', 'pt-muted', 'Four random moves, rolled again for every new battle (shown here: this roll).'));
    }
    const slots = el('div', 'pt-slots');
    for (let i = 0; i < 4; i++) {
      const key = ms.moves[i];
      const m = key ? moveOf(key) : undefined;
      if (!m) {
        slots.append(el('div', 'pt-move pt-empty', ms.mode === 'choose' ? 'Pick a move below' : '—'));
        continue;
      }
      const b = moveButton(m);
      b.addEventListener('click', () => {
        describe(side, m);
        if (ms.mode === 'choose') {
          ms.moves = ms.moves.filter((k) => k !== key);
          save(setup);
          renderMoves();
        }
      });
      if (ms.mode === 'choose') b.title = 'Tap to remove';
      slots.append(b);
    }
    box.append(slots);
    if (ms.mode !== 'choose') {
      box.append(descs[side]);
      return;
    }
    const pool = movePool(slug, setup.level);
    const own = SPECIES[slug]?.types ?? [];
    pool.sort((a, b) => Number(own.includes(b.type)) - Number(own.includes(a.type)) || a.type.localeCompare(b.type) || effectivePower(b) - effectivePower(a));
    const listBox = el('div', 'pt-list');
    for (const m of pool) {
      const key = moveKey(m);
      const b = moveButton(m);
      const at = ms.moves.indexOf(key);
      b.setAttribute('aria-pressed', String(at >= 0));
      if (at >= 0) b.dataset.n = String(at + 1);
      b.addEventListener('click', () => {
        describe(side, m);
        if (ms.moves.includes(key)) ms.moves = ms.moves.filter((k) => k !== key);
        else if (ms.moves.length < 4) ms.moves = [...ms.moves, key];
        else {
          slots.classList.remove('pt-full');
          void slots.offsetWidth;
          slots.classList.add('pt-full');
          descs[side].textContent = 'Four moves already: tap one above (or here) to remove it first.';
          return;
        }
        save(setup);
        const scroll = listBox.scrollTop;
        renderMoves();
        const again = box.querySelector('.pt-list');
        if (again) again.scrollTop = scroll;
      });
      listBox.append(b);
    }
    box.append(el('p', 'pt-muted', `${pool.length} moves ${monName(slug)} can know at Lv. ${setup.level} (level-up, TM/HM, tutor). Pick up to four.`), listBox, descs[side]);
  }

  function moveButton(m: MoveData): HTMLButtonElement {
    const b = el('button', 'pt-move');
    b.type = 'button';
    b.style.setProperty('--type', TYPE_COLORS[typeName(m.type)] ?? '#777');
    const row = el('span', 'pt-mrow');
    row.append(typeChip(m.type), el('span', '', moveMeta(m)));
    b.append(el('span', 'pt-mname', title(m.name)), row);
    return b;
  }

  // ---------------------------------------------------------------------------
  // Result sheet

  const resultSheet = el('section', 'pt-sheet pt-result');
  resultSheet.setAttribute('aria-label', 'Battle result');
  const resultCard = el('div', 'pt-card');
  resultSheet.append(resultCard);
  let last: Battle | null = null;
  function showResult(result: Side | 'escaped', b: Battle): void {
    const you = monName(b.player), foe = monName(b.enemy);
    const [head, line] = result === 'player' ? ['You won!', `${you} defeated the wild ${foe}.`]
      : result === 'opponent' ? ['You lost', `${you} fainted against the wild ${foe}.`]
        : ['Got away safely', `${you} ran from the wild ${foe}.`];
    const rematch = button('pt-battle', 'Rematch', () => void startBattle(b));
    const change = button('pt-chip pt-wide', 'Change setup', () => openSetup());
    const actionsRow = el('div', 'pt-result-actions');
    actionsRow.append(rematch, change);
    resultCard.replaceChildren(el('h1', '', head), el('p', '', line), actionsRow, el('p', 'pt-muted', 'Enter / Z: rematch · Esc / X: change setup'));
    showSheet(resultSheet);
    rematch.focus();
  }

  // ---------------------------------------------------------------------------
  // Sheets and battles

  root.append(setupSheet, resultSheet);
  let open: HTMLElement | null = null;
  function showSheet(sheet: HTMLElement): void {
    for (const s of [setupSheet, resultSheet]) s.hidden = s !== sheet;
    open = sheet;
    if (scene) scene.input.muted = true;
  }
  function hideSheets(): void {
    setupSheet.hidden = resultSheet.hidden = true;
    open = null;
    if (scene) scene.input.muted = false;
    (document.activeElement as HTMLElement | null)?.blur?.();
  }
  function openSetup(): void {
    renderMons();
    renderMoves();
    closeSetup.hidden = !scene || scene.phase === 'end';
    showSheet(setupSheet);
    battleBtn.focus({ preventScroll: true });
  }

  /** Settle what the setup leaves open: a random foe, the foe's random moves. */
  function decide(): Battle {
    const enemy = setup.enemy === 'random' ? pick(roster) : setup.enemy;
    const mine = setup.moves.player.moves.length ? setup.moves.player.moves : randomMoveset(setup.player, setup.level);
    const theirs = setup.enemy === 'random' || setup.moves.enemy.mode === 'random' || !setup.moves.enemy.moves.length
      ? randomMoveset(enemy, setup.level) : setup.moves.enemy.moves;
    if (setup.moves.enemy.mode === 'random' && setup.enemy !== 'random') setup.moves.enemy.moves = theirs;
    return { player: setup.player, enemy, playerMoves: mine, enemyMoves: theirs, env: setup.env, level: setup.level };
  }

  let token = 0;
  async function startBattle(b: Battle): Promise<void> {
    const mine = ++token;
    hideSheets();
    status.textContent = 'Loading…';
    status.hidden = false;
    scene?.dispose();
    scene = null;
    try {
      const s = await BattleScene.create(screenBox, {
        player: { slug: b.player, level: b.level, moves: b.playerMoves },
        opponent: { slug: b.enemy, level: b.level, moves: b.enemyMoves },
        environment: b.env,
        textSpeed: 'fast',
        intro: true,
        loop: false,
        fill: coarse,
        onEnd: (result) => {
          if (scene === s) showResult(result, b);
        },
      });
      if (mine !== token) {
        s.dispose();
        return;
      }
      scene = s;
      last = b;
      status.hidden = true;
      s.input.muted = open !== null;
      window.__battle = { scene: s, step: (frames, renderEvery) => s.stepFrames(frames, renderEvery), state: () => s.debugState() };
      s.start();
    } catch (err) {
      console.error(err);
      status.textContent = `Could not start the battle: ${(err as Error)?.message ?? err}`;
    }
  }

  // Keyboard on the sheets: Z (or Enter off a button) confirms, Esc / X backs out.
  addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement | null;
    if (!open || target?.closest?.('select')) return;
    const onButton = !!target?.closest?.('button');
    const confirm = e.code === 'KeyZ' || ((e.code === 'Enter' || e.code === 'Space') && !onButton);
    const back = e.code === 'Escape' || e.code === 'KeyX' || e.code === 'Backspace';
    if (open === resultSheet) {
      if (confirm && last) {
        e.preventDefault();
        void startBattle(last);
      } else if (back) {
        e.preventDefault();
        openSetup();
      }
    } else if (open === setupSheet && back && !closeSetup.hidden) {
      e.preventDefault();
      hideSheets();
    }
  });

  window.__playtest = { scene: () => scene, battle: startBattle };
  renderMons();
  renderMoves();
  if (params.get('go') === '1') await startBattle(decide());
  else {
    status.textContent = '';
    openSetup();
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
:root { color-scheme: dark; }
html, body { margin: 0; height: 100%; background: #0d1015; overflow: hidden; }
.pt {
  --bg: #0d1015; --surface: #161b22; --surface2: #1d242e; --border: #2b3441; --text: #e7ebf1; --muted: #93a0b2;
  --accent: #3fcf7d; --accent-ink: #062414; --focus: #8fe3ff;
  position: fixed; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--text);
  font: 14px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
  box-sizing: border-box; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
.pt *, .pt *::before, .pt *::after { box-sizing: border-box; }
.pt button, .pt select { font: inherit; color: inherit; }
.pt button:focus-visible, .pt select:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.pt-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; min-height: 44px; }
.pt-brand { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pt-brand strong { color: var(--accent); letter-spacing: 0.02em; }
.pt-brand span { color: var(--muted); }
.pt-actions { display: flex; gap: 6px; flex-shrink: 0; }
.pt-chip { background: var(--surface2); border: 1px solid var(--border); border-radius: 999px; padding: 6px 12px; min-height: 32px; cursor: pointer; white-space: nowrap; }
.pt-chip:hover { border-color: #3d4a5c; }
.pt-chip[aria-pressed="true"] { border-color: var(--accent); }
.pt-stage { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; grid-template-areas: "screen" "pad"; }
.pt-screen { grid-area: screen; position: relative; min-height: 0; overflow: hidden; }
.pt-screen canvas { -webkit-touch-callout: none; }
.pt-status { position: absolute; inset: 0; display: grid; place-items: center; color: var(--muted); padding: 16px; text-align: center; pointer-events: none; }
.pt-status[hidden] { display: none; }
.pt-stage > .gba-pad { grid-area: pad; }
.pt[data-pad="off"] .gba-pad { display: none; }
.pt-keys { text-align: center; color: var(--muted); font-size: 12px; padding: 6px 12px 10px; }
.pt-keys b { color: var(--text); font-weight: 600; }
@media (pointer: coarse) { .pt-keys { display: none; } }
/* On-screen buttons sized for thumbs, and to fit the phone's width. */
.pt .gba-pad { --dp: 46px; --ab: 60px; max-width: 600px; gap: 10px; padding: 8px 14px 14px; }
@media (pointer: coarse) { .pt .gba-pad { --dp: min(56px, 12.5vw); --ab: min(74px, 16vw); } }
.pt .gba-dpad { grid-template-columns: repeat(3, var(--dp)); grid-template-rows: repeat(3, var(--dp)); }
.pt .gba-ab { grid-template-columns: var(--ab) var(--ab); grid-template-rows: calc(var(--ab) * 0.48) var(--ab) calc(var(--ab) * 0.48); column-gap: 10px; }
.pt .gba-ab button { width: var(--ab); height: var(--ab); font-size: calc(var(--ab) * 0.32); }
.pt .gba-mid button { width: 62px; height: 26px; }
/* Portrait: the screen across the top, the buttons in the space below. */
@media (orientation: portrait) {
  .pt-stage { grid-template-rows: auto minmax(0, 1fr); }
  .pt-screen { width: 100%; aspect-ratio: 3 / 2; max-height: 72vh; }
  .pt-stage > .gba-pad { align-self: center; }
}
@media (max-width: 520px) { .pt-brand span { display: none; } }
@media (pointer: coarse) { .pt-padtoggle { display: none; } }
/* A phone held sideways: D-pad left of the screen, A/B right, like a handheld. */
@media (orientation: landscape) and (max-height: 540px) {
  .pt-bar { min-height: 34px; padding: 2px 12px; }
  .pt-chip { min-height: 28px; padding: 3px 10px; }
  .pt[data-pad="on"] .pt-stage { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-rows: minmax(0, 1fr) auto; grid-template-areas: "dpad screen ab" "dpad mid ab"; }
  .pt[data-pad="on"] .pt-stage > .gba-pad { display: contents; }
  .pt[data-pad="on"] .gba-pad { --dp: min(54px, 13vh); --ab: min(72px, 17vh); }
  .pt[data-pad="on"] .gba-dpad { grid-area: dpad; align-self: center; margin: 0 14px; }
  .pt[data-pad="on"] .gba-ab { grid-area: ab; align-self: center; margin: 0 14px; }
  .pt[data-pad="on"] .gba-mid { grid-area: mid; flex-direction: row; justify-self: center; align-self: center; margin: 4px 0 6px; gap: 14px; }
  .pt .gba-mid button { height: 24px; }
}
.pt-sheet { position: fixed; inset: 0; z-index: 10; display: flex; justify-content: center; align-items: flex-start;
  overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y; background: rgba(8, 10, 14, 0.88);
  padding: max(12px, env(safe-area-inset-top, 0px)) 12px max(12px, env(safe-area-inset-bottom, 0px)); }
.pt-sheet[hidden] { display: none; }
@supports (backdrop-filter: blur(4px)) { .pt-sheet { backdrop-filter: blur(4px); background: rgba(8, 10, 14, 0.78); } }
.pt-card { width: 100%; max-width: 780px; margin: auto 0; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px 16px 0; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
.pt-result .pt-card { max-width: 420px; padding-bottom: 16px; text-align: center; margin: auto; }
.pt-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.pt-card h1 { font-size: 20px; margin: 0; }
.pt-result h1 { font-size: 26px; margin: 4px 0 6px; }
.pt-section { margin-top: 16px; }
.pt-card h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin: 0 0 8px; font-weight: 700; }
.pt-mons { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
@media (max-width: 420px) { .pt-mons { grid-template-columns: repeat(3, minmax(0, 1fr)); } .pt-mons .pt-mon:nth-child(4) { grid-column: 1 / -1; flex-direction: row; justify-content: center; gap: 10px; } .pt-mons .pt-mon:nth-child(4) .pt-sprite { width: 40px; height: 40px; font-size: 28px; } }
.pt-mon { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 6px 10px; border-radius: 12px; background: var(--surface2); border: 2px solid transparent; cursor: pointer; min-height: 44px; }
.pt-mon:hover { border-color: #334052; }
.pt-mon[aria-pressed="true"] { border-color: var(--accent); background: #1a2a22; }
.pt-sprite { width: 64px; height: 64px; background-size: 64px 128px; background-position: 0 0; background-repeat: no-repeat; image-rendering: pixelated; }
@media (min-width: 560px) { .pt-sprite { width: 96px; height: 96px; background-size: 96px 192px; } }
.pt-random { display: grid; place-items: center; font-size: 40px; font-weight: 800; color: var(--muted); }
.pt-name { font-weight: 650; }
.pt-types { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; min-height: 18px; }
.pt-type { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 0.04em; line-height: 16px; padding: 0 7px; border-radius: 999px;
  background: var(--type); color: #fff; text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35); vertical-align: middle; }
.pt-movehead { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.pt-seg { display: inline-flex; background: var(--surface2); border: 1px solid var(--border); border-radius: 999px; padding: 2px; }
.pt-seg button { border: 0; background: transparent; border-radius: 999px; padding: 5px 12px; min-height: 30px; cursor: pointer; color: var(--muted); }
.pt-seg button[aria-pressed="true"] { background: #2a3645; color: var(--text); font-weight: 650; }
.pt-seg button:disabled { opacity: 0.4; cursor: default; }
.pt-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.pt-slots.pt-full { animation: pt-shake 0.3s; }
@keyframes pt-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.pt-move { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 3px; text-align: left; min-width: 0;
  padding: 7px 10px; min-height: 52px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); border-left: 4px solid var(--type, var(--border)); cursor: pointer; }
.pt-mname { font-weight: 650; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pt-mrow { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; font-size: 11px; color: var(--muted); max-width: 100%; }
.pt-move.pt-empty { align-items: center; color: var(--muted); border-style: dashed; border-left-width: 1px; cursor: default; }
.pt-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 6px; max-height: 300px; overflow-y: auto; overscroll-behavior: contain; padding: 2px; margin-top: 6px; touch-action: pan-y; }
.pt-list .pt-move[aria-pressed="true"] { outline: 2px solid var(--accent); outline-offset: -2px; background: #1a2a22; }
.pt-list .pt-move[data-n]::after { content: attr(data-n); position: absolute; top: 4px; right: 6px; font-size: 11px; font-weight: 800; color: var(--accent); }
.pt-muted { color: var(--muted); font-size: 12px; margin: 6px 0; }
.pt-desc { margin: 8px 0 0; min-height: 40px; padding: 10px 12px; background: var(--surface2); border-radius: 10px; color: var(--text); font-size: 13px; }
.pt-desc .pt-muted { font-size: 12px; }
.pt-options { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
.pt-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--muted); flex: 1 1 140px; }
.pt-field select { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; min-height: 40px; color: var(--text); }
.pt-go { position: sticky; bottom: 0; margin: 14px -16px 0; padding: 12px 16px 14px; background: linear-gradient(to bottom, rgba(22, 27, 34, 0), var(--surface) 28%); border-radius: 0 0 16px 16px; }
.pt .pt-battle { width: 100%; min-height: 52px; border: 0; border-radius: 14px; background: var(--accent); color: var(--accent-ink); font-size: 18px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; }
.pt .pt-battle:hover { filter: brightness(1.06); }
.pt .pt-battle:disabled { background: #2a3645; color: var(--muted); cursor: default; filter: none; }
.pt-hint { color: var(--muted); font-size: 12px; margin: 8px 0 0; text-align: center; }
.pt-hint:empty { display: none; }
.pt-result-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.pt-wide { width: 100%; min-height: 44px; border-radius: 12px; }
`;
