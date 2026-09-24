// Battle page (default mode).
//
//   /?player=blaziken&enemy=blaziken&level=50
//     &moves=BLAZE_KICK,FLAMETHROWER,DOUBLE_KICK,BULK_UP
//     &enemyMoves=EMBER,SLASH,SKY_UPPERCUT,SAND_ATTACK
//     &shiny=1 &enemyShiny=1 &env=grass &seed=123
//     &autoplay=1 &text=slow|mid|fast &intro=0 &loop=0 &manual=1 &scale=3
//     &playerExp=0.9 (progress toward the next level, to see a level-up)

import { BattleScene, type BattleSceneOptions, type TextSpeed } from './scene';

/** Default movesets: one move per animation category, so every clip is reachable. */
const PLAYER_MOVES = ['BLAZE_KICK', 'FLAMETHROWER', 'DOUBLE_KICK', 'BULK_UP'];
const ENEMY_MOVES = ['EMBER', 'SLASH', 'SKY_UPPERCUT', 'SAND_ATTACK'];

declare global {
  interface Window {
    __battle?: {
      scene: BattleScene;
      step: (frames: number, renderEvery?: boolean) => Promise<void>;
      state: () => ReturnType<BattleScene['debugState']>;
    };
  }
}

export async function runBattle(root: HTMLElement): Promise<BattleScene> {
  const params = new URLSearchParams(location.search);
  const num = (k: string, d?: number) => (params.has(k) ? Number(params.get(k)) : d);
  const list = (k: string, d: string[]) => params.get(k)?.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) ?? d;
  const level = num('level', 50);
  const opts: BattleSceneOptions = {
    player: { slug: params.get('player') ?? 'blaziken', level, moves: list('moves', PLAYER_MOVES), shiny: params.get('shiny') === '1', expProgress: num('playerExp') },
    opponent: { slug: params.get('enemy') ?? 'blaziken', level: num('enemyLevel', level), moves: list('enemyMoves', ENEMY_MOVES), shiny: params.get('enemyShiny') === '1' },
    environment: params.get('env') ?? 'grass',
    seed: num('seed'),
    autoplay: params.get('autoplay') === '1',
    textSpeed: (params.get('text') as TextSpeed | null) ?? 'fast',
    intro: params.get('intro') !== '0',
    loop: params.get('loop') !== '0',
    manual: params.get('manual') === '1',
    scale: num('scale'),
  };

  root.style.cssText = 'position:fixed;inset:0;background:#101018;overflow:hidden;';
  const stageBox = document.createElement('div');
  stageBox.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:28px;';
  const hint = document.createElement('div');
  hint.style.cssText = 'position:absolute;left:0;right:0;bottom:6px;text-align:center;color:#8a8aa0;font:12px/16px system-ui,sans-serif;';
  hint.textContent = 'A: Z / Enter / Space / tap  ·  B: X / Esc  ·  D-pad: arrow keys  ·  ?autoplay=1 plays by itself';
  root.append(stageBox, hint);

  const scene = await BattleScene.create(stageBox, opts);
  window.__battle = {
    scene,
    step: (frames, renderEvery) => scene.stepFrames(frames, renderEvery),
    state: () => scene.debugState(),
  };
  scene.start();
  return scene;
}
