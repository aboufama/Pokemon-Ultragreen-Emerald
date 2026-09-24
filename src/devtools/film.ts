// Dev: filmstrip of a move animation in the real battle view.
//
//   /?mode=film&move=BLAZE_KICK[&attacker=player][&frames=12][&fps=...][&cols=4]
//   /?mode=film&clip=idle   (plays a clip directly, no target reaction)
//
// Simulates at 60 fps and captures evenly spaced frames into a grid, so a
// single screenshot shows a whole animation.

import { GbaScreen } from '../battle/screen';
import { clear } from '../gba/bitmap';
import { BattleStage } from '../render3d/stage';
import { Battler3D } from '../battle3d/battler';
import { VfxSystem, preloadSheets } from '../battle3d/vfx';
import { clipFor, performMove } from '../battle3d/director';
import { move as moveData } from '../data';

export async function runFilm(root: HTMLElement): Promise<unknown> {
  const params = new URLSearchParams(location.search);
  const frames = Number(params.get('frames') ?? 12);
  const cols = Number(params.get('cols') ?? 4);
  const scale = Number(params.get('scale') ?? 2);
  const attackerSlot = (params.get('attacker') ?? 'player') as 'player' | 'enemy';
  const species = params.get('species') ?? 'blaziken';

  root.style.cssText = 'position:fixed;inset:0;background:#15151c;color:#ccc;font:11px monospace;overflow:auto';
  const holder = document.createElement('div');
  holder.style.cssText = `position:absolute;left:-9999px;top:0;width:${240}px;height:${160}px;`;
  root.appendChild(holder);
  const screen = new GbaScreen(holder, 1);
  const stage = new BattleStage(screen.canvas3d, undefined, { supersample: 2 });
  await stage.setEnvironment('grass');
  const vfx = new VfxSystem(stage);
  await preloadSheets();
  const player = await Battler3D.create(stage, 'player', species);
  const enemy = await Battler3D.create(stage, 'enemy', params.get('enemy') ?? species);
  player.target = enemy;
  enemy.target = player;
  const attacker = attackerSlot === 'player' ? player : enemy;
  const defender = attacker === player ? enemy : player;

  const step = (dt: number) => {
    stage.update(dt);
    vfx.update(dt);
    player.update(dt);
    enemy.update(dt);
  };
  // Settle into idle.
  for (let i = 0; i < 30; i++) step(1 / 60);

  let duration: number;
  let label: string;
  let done = false;
  if (params.has('move')) {
    const m = moveData(params.get('move')!);
    const clip = clipFor(attacker, m);
    duration = attacker.profile.clips[clip]?.duration ?? 1.5;
    label = `${m.name} -> ${clip}`;
    void performMove(attacker, defender, m, vfx).then(() => (done = true));
  } else {
    const clip = params.get('clip') ?? 'idle';
    duration = attacker.profile.clips[clip]?.duration ?? 1.5;
    label = clip;
    void attacker.play(clip).then(() => (done = true));
  }
  const total = duration + 0.4;
  const grid = document.createElement('div');
  grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols}, ${240 * scale}px);gap:4px;padding:4px;`;
  const title = document.createElement('div');
  title.textContent = label;
  title.style.cssText = 'padding:4px 4px 0';
  root.append(title, grid);

  let t = 0;
  for (let f = 0; f < frames; f++) {
    const target = (f / (frames - 1)) * total;
    while (t < target - 1e-6) {
      step(1 / 60);
      t += 1 / 60;
    }
    stage.render();
    clear(screen.ui);
    const cell = document.createElement('div');
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 160;
    c.style.cssText = `width:${240 * scale}px;height:${160 * scale}px;image-rendering:pixelated;display:block`;
    c.getContext('2d')!.drawImage(screen.canvas3d, 0, 0);
    const cap = document.createElement('div');
    cap.textContent = `t=${t.toFixed(2)}s`;
    cell.append(c, cap);
    grid.appendChild(cell);
    await new Promise((r) => setTimeout(r, 0));
  }
  return { done };
}
