// Dev: play one clip or move in the battle view, with the in-game UI, stepped
// from outside one frame at a time (tools/shots/clip_gifs.mjs exports GIFs).
//
//   /?mode=clipreview&move=BLAZE_KICK&attacker=player[&species=blaziken&enemy=blaziken][&ui=0]
//   /?mode=clipreview&clip=intro&attacker=enemy
//   &density=3 renders 3 output pixels per GBA pixel (finer pixels, for
//   inspecting motion; the game uses 1)
//   &mark=mouth (or any emitter: cannons, flower, hands...) marks where the
//   attacker's effects start
//
// window.__clip = { start(), step(frames), grab(): PNG data URL, done }

import { GbaScreen } from '../battle/screen';
import { Healthbox } from '../battle/ui/healthbox';
import { BattleTextbox } from '../battle/ui/textbox';
import { createMon } from '../battle/engine';
import { clear } from '../gba/bitmap';
import { loadAllFonts } from '../gba/font';
import { BattleStage } from '../render3d/stage';
import { Battler3D } from '../battle3d/battler';
import { VfxSystem, preloadSheets } from '../battle3d/vfx';
import { clipFor, performMove, towardCamera } from '../battle3d/director';
import { move as moveData } from '../data';

declare global {
  interface Window {
    __clip?: {
      start: () => void;
      step: (frames: number) => Promise<void>;
      grab: () => string;
      done: boolean;
      label: string;
      /** The clip that plays, its length and events. */
      info: { clip: string; duration: number; events: { t: number; name: string }[] };
    };
  }
}

const DT = 1 / 60;

function macrotask(): Promise<void> {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => resolve();
    ch.port2.postMessage(0);
  });
}

export async function runClipReview(root: HTMLElement): Promise<void> {
  const params = new URLSearchParams(location.search);
  const species = params.get('species') ?? 'blaziken';
  const enemySlug = params.get('enemy') ?? species;
  const attackerSide = (params.get('attacker') ?? 'player') as 'player' | 'enemy';
  const showUi = params.get('ui') !== '0';
  const moveName = params.get('move');
  const clipName = params.get('clip') ?? 'idle';
  const density = Math.max(1, Math.round(Number(params.get('density') ?? 1)));

  root.style.cssText = 'position:fixed;inset:0;background:#15151c;';
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:0;top:0;width:720px;height:480px;';
  root.appendChild(holder);
  const screen = new GbaScreen(holder, 3);
  const stage = new BattleStage(screen.canvas3d, undefined, { density });
  await stage.setEnvironment(params.get('env') ?? 'grass');
  const vfx = new VfxSystem(stage);
  await preloadSheets();
  const [player, enemy] = await Promise.all([Battler3D.create(stage, 'player', species), Battler3D.create(stage, 'enemy', enemySlug)]);
  player.target = enemy;
  enemy.target = player;
  const attacker = attackerSide === 'player' ? player : enemy;
  const defender = attacker === player ? enemy : player;

  // In-game UI: healthboxes and the message the game shows for this moment.
  const fonts = await loadAllFonts();
  const textbox = await BattleTextbox.load(fonts);
  const boxes = { player: await Healthbox.load('player', fonts.small), enemy: await Healthbox.load('opponent', fonts.small) };
  for (const [side, slug] of [['player', species], ['enemy', enemySlug]] as const) {
    const mon = createMon(slug);
    const hb = boxes[side];
    hb.name = mon.name;
    hb.gender = mon.gender;
    hb.level = mon.level;
    hb.maxHp = hb.hp = hb.shownHp = mon.stats.hp;
  }
  const name = createMon(attackerSide === 'player' ? species : enemySlug).name;
  const who = attackerSide === 'player' ? name : `Wild ${name}`;
  let label: string;
  if (moveName) {
    const m = moveData(moveName);
    label = `${m.name}`;
    textbox.setMessage(`${who} used\n${m.name}!`);
  } else {
    label = clipName;
    if (clipName === 'idle' && attackerSide === 'player') {
      textbox.page = 'action';
      textbox.setActionPrompt(name);
    } else if (clipName === 'intro') {
      textbox.setMessage(attackerSide === 'player' ? `Go! ${name}!` : `Wild ${name} appeared!`);
    } else if (clipName === 'faint') {
      textbox.setMessage(attackerSide === 'player' ? `${name}\nfainted!` : `Wild ${name}\nfainted!`);
    } else {
      textbox.setMessage('');
    }
  }

  const update = () => {
    vfx.update(DT);
    player.update(DT);
    enemy.update(DT);
  };
  const render = () => {
    stage.render();
    clear(screen.ui);
    if (showUi) {
      boxes.enemy.draw(screen.ui);
      boxes.player.draw(screen.ui);
      textbox.draw(screen.ui, 0);
    }
    screen.presentUi();
  };
  const mark = params.get('mark');
  if (mark) {
    const points = () => attacker.emitterPoints(mark).map((p) => towardCamera(attacker, p, 0.04));
    points().forEach((p, i) => void vfx.sprite('Particles', p, { px: 6, fps: 0, life: 1e9, follow: () => points()[i] }));
  }
  // Settle into idle.
  for (let i = 0; i < 20; i++) update();
  render();

  const playing = moveName ? clipFor(attacker, moveData(moveName)) : clipName;
  const clip = attacker.profile.clips[playing];
  const api = {
    done: false,
    label,
    info: { clip: playing, duration: clip?.duration ?? 0, events: clip?.events ?? [] },
    start() {
      const finish = () => {
        api.done = true;
        if (clipName === 'faint' && !moveName) boxes[attackerSide].visible = false;
      };
      if (moveName) void performMove(attacker, defender, moveData(moveName), vfx).then(finish);
      else if (clipName === 'idle') finish();
      else {
        // A hit plays with the knock-back the move director adds in battle.
        if (clipName === 'hit') attacker.recoil(1);
        void attacker.play(clipName).then(finish);
      }
    },
    async step(frames: number) {
      for (let i = 0; i < frames; i++) {
        update();
        await macrotask();
      }
      render();
    },
    grab() {
      const c = document.createElement('canvas');
      c.width = 240 * density;
      c.height = 160 * density;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(screen.canvas3d, 0, 0, c.width, c.height);
      ctx.drawImage(screen.canvas2d, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    },
  };
  window.__clip = api;
}
