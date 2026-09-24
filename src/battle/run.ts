// Battle page (default mode).
//
//   /?player=blaziken&enemy=blaziken&level=50
//     &moves=BLAZE_KICK,FLAMETHROWER,DOUBLE_KICK,BULK_UP
//     &enemyMoves=EMBER,SLASH,SKY_UPPERCUT,SAND_ATTACK
//     &shiny=1 &enemyShiny=1 &env=grass &seed=123
//     &autoplay=1 &text=slow|mid|fast &intro=0 &loop=0 &manual=1 &scale=3
//     &playerExp=0.9 (progress toward the next level, to see a level-up)
//     &pad=0 (hide the on-screen buttons)

import { BattleScene, type BattleSceneOptions, type TextSpeed } from './scene';
import { createTouchPad } from './touch_pad';

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

  // Screen on top, on-screen buttons below, keyboard legend on desktop.
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
  root.append(stageBox, pad, hint);

  scene = await BattleScene.create(stageBox, opts);
  window.__battle = {
    scene,
    step: (frames, renderEvery) => scene.stepFrames(frames, renderEvery),
    state: () => scene.debugState(),
  };
  scene.start();
  return scene;
}
