// Battle page (default mode).
//
//   /?player=blaziken&enemy=swampert&level=50
//     &moves=BLAZE_KICK,FLAMETHROWER,DOUBLE_KICK,BULK_UP
//     &enemyMoves=EMBER,SLASH,SKY_UPPERCUT,SAND_ATTACK
//     &shiny=1 &enemyShiny=1 &env=grass &seed=123
//     &autoplay=1 &text=slow|mid|fast &intro=0 &loop=0 &manual=1 &scale=3
//     &playerExp=0.9 (progress toward the next level, to see a level-up)
//     &pad=0 (hide the on-screen buttons) &picker=0 (hide the species picker)
//
// Movesets default to each species' showcase moves; a mirror match gives the
// opponent its Gen 3 wild moveset at its level instead.

import { SPECIES } from '../data';
import { getSpeciesProfile, profiledSpecies } from '../pokemon/registry';
import { BattleScene, type BattleSceneOptions, type TextSpeed } from './scene';
import { createTouchPad } from './touch_pad';
import { ARENAS } from '../render3d/arena';

declare global {
  interface Window {
    __battle?: {
      scene: BattleScene;
      step: (frames: number, renderEvery?: boolean) => Promise<void>;
      state: () => ReturnType<BattleScene['debugState']>;
    };
  }
}

/** Every arena by its Hoenn place. */
const ARENA_CHOICES: [string, string][] = Object.entries(ARENAS).map(([id, d]) => [id, d.name]);

const displayName = (slug: string) => {
  const n = SPECIES[slug]?.name ?? slug;
  return n.charAt(0) + n.slice(1).toLowerCase();
};

/** The last four level-up moves learned by `level` (how Gen 3 fills a wild Pokémon's moves). */
function wildMoves(slug: string, level: number): string[] {
  const learned = (SPECIES[slug]?.learnset ?? []).filter((l) => l.level <= level).map((l) => l.move.replace('MOVE_', ''));
  return [...new Set(learned)].slice(-4);
}

async function defaultMoves(slug: string, level: number, mirror: boolean): Promise<string[]> {
  const showcase = (await getSpeciesProfile(slug)).showcaseMoves;
  if (showcase?.length && !mirror) return showcase.map((m) => m.replace('MOVE_', ''));
  const wild = wildMoves(slug, level);
  return wild.length ? wild : showcase ?? ['TACKLE'];
}

const PICKER_CSS = `
.battle-picker { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 10px;
  padding: 8px 12px 6px; font: 13px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; color: #b9b8cc; }
.battle-picker label { display: inline-flex; align-items: center; gap: 6px; }
.battle-picker select, .battle-picker button { font: inherit; color: #e7e6f2; background: #22253a; border: 1px solid #3d4262;
  border-radius: 6px; padding: 5px 8px; min-height: 30px; }
.battle-picker button { background: #2f3f5e; border-color: #4c6590; cursor: pointer; font-weight: 600; padding: 5px 14px; }
.battle-picker button:hover { background: #38507a; }
.battle-picker select:focus-visible, .battle-picker button:focus-visible { outline: 2px solid #7fc3c3; outline-offset: 2px; }
.battle-picker .vs { color: #6f7090; }
`;

export async function runBattle(root: HTMLElement): Promise<BattleScene> {
  const params = new URLSearchParams(location.search);
  const num = (k: string, d?: number) => (params.has(k) ? Number(params.get(k)) : d);
  const list = (k: string) => params.get(k)?.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  const level = num('level', 50) ?? 50;
  const roster = profiledSpecies().sort((a, b) => (SPECIES[a]?.nationalDex ?? 0) - (SPECIES[b]?.nationalDex ?? 0));
  const choice = {
    player: params.get('player') ?? 'blaziken',
    enemy: params.get('enemy') ?? (roster.find((s) => s !== 'blaziken') ?? 'blaziken'),
    env: params.get('env') ?? 'grass',
  };
  const options = async (): Promise<BattleSceneOptions> => {
    const mirror = choice.player === choice.enemy;
    return {
      player: { slug: choice.player, level, moves: list('moves') ?? (await defaultMoves(choice.player, level, false)), shiny: params.get('shiny') === '1', expProgress: num('playerExp') },
      opponent: { slug: choice.enemy, level: num('enemyLevel', level), moves: list('enemyMoves') ?? (await defaultMoves(choice.enemy, level, mirror)), shiny: params.get('enemyShiny') === '1' },
      environment: choice.env,
      seed: num('seed'),
      autoplay: params.get('autoplay') === '1',
      textSpeed: (params.get('text') as TextSpeed | null) ?? 'fast',
      intro: params.get('intro') !== '0',
      loop: params.get('loop') !== '0',
      manual: params.get('manual') === '1',
      scale: num('scale'),
    };
  };

  // Picker on top, screen, on-screen buttons below, keyboard legend on desktop.
  root.style.cssText = 'position:fixed;inset:0;background:#101018;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;'
    + 'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);';
  const stageBox = document.createElement('div');
  stageBox.style.cssText = 'position:relative;flex:1;min-height:0;';
  let scene: BattleScene | null = null;
  const pad = createTouchPad(() => scene?.input);
  if (params.get('pad') === '0') pad.hidden = true;
  const hint = document.createElement('div');
  hint.style.cssText = 'text-align:center;color:#8a8aa0;font:12px/16px system-ui,sans-serif;padding:0 12px 10px;';
  hint.textContent = 'Keyboard: A = Z / Enter / Space  ·  B = X / Esc  ·  arrow keys move';
  if (matchMedia('(pointer: coarse)').matches) hint.hidden = true;

  const start = async () => {
    const opts = await options();
    scene?.dispose();
    scene = await BattleScene.create(stageBox, opts);
    const s = scene;
    window.__battle = {
      scene: s,
      step: (frames, renderEvery) => s.stepFrames(frames, renderEvery),
      state: () => s.debugState(),
    };
    s.start();
    return s;
  };

  if (params.get('picker') !== '0' && roster.length > 1) {
    if (!document.getElementById('battle-picker-css')) {
      const style = document.createElement('style');
      style.id = 'battle-picker-css';
      style.textContent = PICKER_CSS;
      document.head.appendChild(style);
    }
    const picker = document.createElement('div');
    picker.className = 'battle-picker';
    const select = (label: string, values: [string, string][], value: string, onChange: (v: string) => void) => {
      const wrap = document.createElement('label');
      wrap.append(label);
      const el = document.createElement('select');
      for (const [v, text] of values) el.add(new Option(text, v, false, v === value));
      el.addEventListener('change', () => onChange(el.value));
      wrap.append(el);
      return wrap;
    };
    const mons = roster.map((s): [string, string] => [s, displayName(s)]);
    const vs = document.createElement('span');
    vs.className = 'vs';
    vs.textContent = 'vs';
    const go = document.createElement('button');
    go.type = 'button';
    go.textContent = 'New battle';
    go.addEventListener('click', () => {
      go.disabled = true;
      void start().finally(() => (go.disabled = false));
    });
    picker.append(
      select('You', mons, choice.player, (v) => (choice.player = v)),
      vs,
      select('Foe', mons, choice.enemy, (v) => (choice.enemy = v)),
      select('Arena', ARENA_CHOICES, choice.env, (v) => (choice.env = v)),
      go,
    );
    root.append(picker);
  }
  root.append(stageBox, pad, hint);
  return start();
}
