// An Emerald single battle with 3D battlers.
//
// The flow follows the game: the environment intro of battle_intro.c
// (window reveal, scanline-split slide, entry layer), the wild Pokémon's
// shadowed slide-in, the trainer's throw and the Poké Ball send-out
// (pokeball.c / battle_anim_throw.c), the action and move menus of
// battle_controller_player.c, and turns presented from BattleEngine steps.
// Timings are the decomp's frame counts at 60 fps. The 3D battlers stand in
// for the sprites; the 2D layer (text box, healthboxes, trainer, ball) is
// drawn exactly as on the GBA.

import * as THREE from 'three';
import { type Bitmap, type RGB, blit, clear, fillRect, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { loadAllFonts } from '../gba/font';
import { BattleStage } from '../render3d/stage';
import { Battler3D } from '../battle3d/battler';
import { VfxSystem, preloadSheets } from '../battle3d/vfx';
import { bodyPoint, performMove, towardCamera } from '../battle3d/director';
import { hasProfile } from '../pokemon/registry';
import { GbaScreen } from './screen';
import { type Button, Input } from './input';
import { FrameClock, gbaSin } from './clock';
import { BattleTextbox } from './ui/textbox';
import { Healthbox } from './ui/healthbox';
import { type Action, BattleEngine, type Side, type Step, calcStats, createMon, expForLevel } from './engine';

const DT = 1 / 60;
/** Frames per glyph for the options' text speeds (delay + 1, see RenderText). */
export const TEXT_FRAMES = { slow: 9, mid: 5, fast: 2 } as const;
export type TextSpeed = keyof typeof TEXT_FRAMES;
/** waitmessage B_WAIT_TIME_LONG / B_WAIT_TIME_SHORT. */
const WAIT_LONG = 64;
const WAIT_SHORT = 32;

const BLACK: RGB = [0, 0, 0];
/** RGB(8, 8, 8): palette the wild Pokémon is faded to while it slides in. */
const SHADOW: RGB = [66, 66, 66];
/** gBallOpenFadeColors[BALL_POKE] = RGB(31, 22, 30). */
const BALL_FADE: RGB = [255, 181, 247];
const GLOW_RED: RGB = [255, 0, 0];
const STAT_UP: RGB = [115, 173, 255];
const STAT_DOWN: RGB = [74, 66, 140];
const BURN: RGB = [255, 99, 41];

/** Brendan's throw (sAnimCmd_Brendan_1): [frame, duration]. */
const TRAINER_THROW: [number, number][] = [[0, 24], [1, 9], [2, 24], [0, 9], [3, 50]];

export interface MonSetup {
  slug: string;
  level?: number;
  moves?: string[];
  shiny?: boolean;
  nature?: number;
  /** Progress toward the next level (0..1). */
  expProgress?: number;
}

export interface BattleSceneOptions {
  player: MonSetup;
  opponent: MonSetup;
  environment?: string;
  seed?: number;
  /** Play both sides automatically (demo / headless checks). */
  autoplay?: boolean;
  textSpeed?: TextSpeed;
  /** Play the full battle intro (default true). */
  intro?: boolean;
  /** Start a new battle when one ends (default true). */
  loop?: boolean;
  /** Frames only advance through stepFrames() (tests). */
  manual?: boolean;
  /** Integer screen scale (default: fit the window). */
  scale?: number;
}

export type Phase = 'loading' | 'intro' | 'action' | 'move' | 'turn' | 'end';

interface BallParticle {
  angle: number;
  radius: number;
}

function macrotask(): Promise<void> {
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => resolve();
    ch.port2.postMessage(0);
  });
}

/** Blend the 2D layer toward a color; transparent pixels darken the 3D view below. */
function fadeLayer(fb: Bitmap, color: RGB, amount: number): void {
  const d = fb.data;
  const a = Math.round(amount * 255);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) {
      d[i] = color[0];
      d[i + 1] = color[1];
      d[i + 2] = color[2];
      d[i + 3] = a;
    } else {
      d[i] += (color[0] - d[i]) * amount;
      d[i + 1] += (color[1] - d[i + 1]) * amount;
      d[i + 2] += (color[2] - d[i + 2]) * amount;
    }
  }
}

export class BattleScene {
  readonly clock = new FrameClock();
  readonly input: Input;
  phase: Phase = 'loading';
  engine!: BattleEngine;
  turn = 0;
  battles = 0;
  error: string | null = null;
  private readonly opts: Required<Omit<BattleSceneOptions, 'seed' | 'scale'>> & { seed?: number };

  // 2D layer state.
  private window: [number, number] | null = null;
  private fade = { color: BLACK, amount: 1 };
  private trainer = { visible: false, x: 80, y: 80, frame: 3 };
  private ball = { visible: false, x: 0, y: 0, frame: 0, hflip: false, vflip: false };
  private ballParticles: { x: number; y: number; frame: number; list: BallParticle[] } | null = null;
  private bouncing = false;
  private bounceHb = 0;
  private bounceMon = 0;
  private autoMove = 0;
  private lastTime = 0;
  private acc = 0;

  private constructor(
    readonly screen: GbaScreen,
    readonly stage: BattleStage,
    readonly vfx: VfxSystem,
    readonly player: Battler3D,
    readonly enemy: Battler3D,
    readonly textbox: BattleTextbox,
    readonly hbPlayer: Healthbox,
    readonly hbEnemy: Healthbox,
    private readonly trainerSheet: Bitmap,
    private readonly ballSheet: Bitmap,
    private readonly particleSheet: Bitmap,
    opts: BattleSceneOptions,
  ) {
    this.opts = {
      environment: 'grass',
      autoplay: false,
      textSpeed: 'fast',
      intro: true,
      loop: true,
      manual: false,
      ...opts,
    };
    this.input = new Input(window);
    screen.element.addEventListener('pointerdown', () => this.input.press('A'));
    player.target = enemy;
    enemy.target = player;
  }

  static async create(parent: HTMLElement, opts: BattleSceneOptions): Promise<BattleScene> {
    for (const s of [opts.player.slug, opts.opponent.slug]) {
      if (!hasProfile(s)) throw new Error(`No 3D profile for "${s}" yet: species are added one by one (see docs/POKEMON_PIPELINE.md).`);
    }
    const screen = new GbaScreen(parent, opts.scale);
    const stage = new BattleStage(screen.canvas3d);
    const fonts = await loadAllFonts();
    const [, textbox, hbPlayer, hbEnemy, trainerSheet, ballSheet, particleSheet, player, enemy] = await Promise.all([
      stage.setEnvironment(opts.environment ?? 'grass'),
      BattleTextbox.load(fonts),
      Healthbox.load('player', fonts.small),
      Healthbox.load('opponent', fonts.small),
      loadBitmap(asset('gba/trainers/brendan_back.png')),
      loadBitmap(asset('gba/balls/poke.png')),
      loadBitmap(asset('gba/battle_anims/Particles.png')),
      Battler3D.create(stage, 'player', opts.player.slug, { shiny: opts.player.shiny }),
      Battler3D.create(stage, 'enemy', opts.opponent.slug, { shiny: opts.opponent.shiny }),
      preloadSheets(),
    ]);
    const vfx = new VfxSystem(stage);
    return new BattleScene(screen, stage, vfx, player, enemy, textbox, hbPlayer, hbEnemy, trainerSheet, ballSheet, particleSheet, opts);
  }

  // -------------------------------------------------------------------------
  // Frame loop

  start(): void {
    void this.run().catch((err: unknown) => {
      console.error(err);
      this.error = String((err as Error)?.stack ?? err);
    });
    if (!this.opts.manual) requestAnimationFrame(this.loop);
    else this.render();
  }

  private readonly loop = (now: number): void => {
    if (!this.lastTime) this.lastTime = now;
    this.acc += Math.min(100, now - this.lastTime);
    this.lastTime = now;
    let steps = 0;
    while (this.acc >= 1000 / 60 - 0.5 && steps < 4) {
      this.update();
      this.acc -= 1000 / 60;
      steps++;
    }
    if (this.acc < 0) this.acc = 0;
    if (steps) this.render();
    requestAnimationFrame(this.loop);
  };

  /** Advance `n` frames deterministically (each frame lets async logic settle). */
  async stepFrames(n: number, renderEvery = false): Promise<void> {
    for (let i = 0; i < n; i++) {
      this.update();
      if (renderEvery || i === n - 1) this.render();
      await macrotask();
    }
  }

  private update(): void {
    this.input.poll();
    this.clock.tick();
    this.updateBounce();
    this.vfx.update(DT);
    this.player.update(DT);
    this.enemy.update(DT);
  }

  private render(): void {
    this.stage.render();
    this.drawUi();
  }

  private drawUi(): void {
    const fb = this.screen.ui;
    clear(fb);
    if (this.trainer.visible) {
      const t = this.trainer;
      blit(fb, this.trainerSheet, 0, t.frame * 64, 64, 64, Math.round(t.x) - 32, Math.round(t.y) - 32);
    }
    if (this.ball.visible) {
      const b = this.ball;
      blit(fb, this.ballSheet, 0, b.frame * 16, 16, 16, Math.round(b.x) - 8, Math.round(b.y) - 8, { hflip: b.hflip, vflip: b.vflip });
    }
    if (this.ballParticles) {
      const bp = this.ballParticles;
      for (const p of bp.list) {
        const x = bp.x + gbaSin(p.angle, p.radius);
        const y = bp.y + gbaSin(p.angle + 64, p.radius);
        blit(fb, this.particleSheet, 0, bp.frame * 8, 8, 8, x - 4, y - 4);
      }
    }
    this.hbEnemy.draw(fb);
    this.hbPlayer.draw(fb);
    this.textbox.draw(fb, this.clock.frame);
    if (this.window) {
      const [top, bottom] = this.window;
      fillRect(fb, 0, 0, 240, top, BLACK);
      fillRect(fb, 0, bottom, 240, 160 - bottom, BLACK);
    }
    if (this.fade.amount > 0) fadeLayer(fb, this.fade.color, this.fade.amount);
    this.screen.presentUi();
  }

  // -------------------------------------------------------------------------
  // Helpers

  battler(side: Side): Battler3D {
    return side === 'player' ? this.player : this.enemy;
  }

  healthbox(side: Side): Healthbox {
    return side === 'player' ? this.hbPlayer : this.hbEnemy;
  }

  /** Queue virtual button presses, `gap` frames apart, after `delay` frames. */
  private autoPress(buttons: Button[], delay = 30, gap = 10): void {
    buttons.forEach((b, i) => void this.clock.frames(delay + i * gap).then(() => this.input.press(b)));
  }

  private waitForButton(): Promise<void> {
    if (this.opts.autoplay) this.autoPress(['A'], 45);
    return this.clock.until(() => this.input.pressed('A', 'B'));
  }

  /** Print a battle message; "\p" waits for A/B, otherwise hold `hold` frames. */
  async printMessage(text: string, hold = 0): Promise<void> {
    const pages = text.split('\\p');
    const perGlyph = TEXT_FRAMES[this.opts.textSpeed];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const waits = i < pages.length - 1;
      if (!page) continue;
      const tb = this.textbox;
      tb.page = 'message';
      tb.setMessage(page);
      const total = tb.message.filter((t) => t.kind === 'glyph').length;
      let shown = 1;
      let timer = 0;
      // canABSpeedUpPrint: a press speeds printing up while A/B stays held.
      let spedUp = false;
      tb.visibleGlyphs = shown;
      await this.clock.until(() => {
        if (shown >= total) return true;
        if (this.input.pressed('A', 'B')) spedUp = true;
        const fast = spedUp && (this.input.isHeld('A') || this.input.isHeld('B'));
        if (fast || ++timer >= perGlyph) {
          timer = 0;
          tb.visibleGlyphs = ++shown;
        }
        return false;
      });
      if (waits) {
        tb.promptSince = this.clock.frame;
        await this.waitForButton();
        tb.promptSince = null;
      } else if (hold > 0) {
        await this.clock.frames(hold);
      }
    }
  }

  /** Step a value by `delta` per frame from `from` to `to`, calling `apply` each frame. */
  private ramp(from: number, to: number, delta: number, apply: (v: number) => void): Promise<void> {
    let v = from;
    apply(v);
    if (from === to) return Promise.resolve();
    const dir = Math.sign(to - from);
    return this.clock.task(() => {
      v += dir * delta;
      if ((dir > 0 && v > to) || (dir < 0 && v < to)) v = to;
      apply(v);
      return v === to;
    });
  }

  /**
   * BeginNormalPaletteFade with delay 0: BG and OBJ palettes are updated on
   * alternate frames, so the coefficient moves 2 every other frame.
   */
  private palFade(from: number, to: number, apply: (coeff: number) => void): Promise<void> {
    let y = from, f = 0;
    apply(y);
    if (from === to) return Promise.resolve();
    return this.clock.task(() => {
      if (++f % 2) return false;
      y = from < to ? Math.min(to, y + 2) : Math.max(to, y - 2);
      apply(y);
      return y === to;
    });
  }

  /** StartHealthboxSlideIn: x2 = +/-115, 5px per frame. */
  private slideInHealthbox(hb: Healthbox): Promise<void> {
    const dir = hb.side === 'player' ? 1 : -1;
    hb.visible = true;
    return this.ramp(115 * dir, 0, 5, (x) => (hb.offset = [x, hb.offset[1]]));
  }

  private startBounce(): void {
    if (this.bouncing) return;
    // DoBounceEffect(battler, BOUNCE_HEALTHBOX / BOUNCE_MON, 7, 1)
    this.bouncing = true;
    this.bounceHb = 128;
    this.bounceMon = 192;
  }

  private stopBounce(): void {
    this.bouncing = false;
    this.hbPlayer.offset = [0, 0];
    this.player.screenOffset = [0, 0];
  }

  private updateBounce(): void {
    if (!this.bouncing) return;
    this.hbPlayer.offset = [0, gbaSin(this.bounceHb, 1) + 1];
    this.player.screenOffset = [0, gbaSin(this.bounceMon, 1) + 1];
    this.bounceHb = (this.bounceHb + 7) & 255;
    this.bounceMon = (this.bounceMon + 7) & 255;
  }

  // -------------------------------------------------------------------------
  // Battle lifecycle

  private async run(): Promise<void> {
    for (;;) {
      this.setupBattle();
      if (this.opts.intro) await this.intro();
      else await this.quickStart();
      await this.battleLoop();
      this.phase = 'end';
      // BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)
      await this.palFade(0, 16, (v) => (this.fade = { color: BLACK, amount: v / 16 }));
      await this.clock.frames(30);
      this.battles++;
      if (!this.opts.loop) return;
    }
  }

  private setupBattle(): void {
    const o = this.opts;
    const seed = (o.seed ?? Date.now()) + this.battles * 7919;
    const player = createMon(o.player.slug, { level: o.player.level, moves: o.player.moves, shiny: o.player.shiny, nature: o.player.nature, expProgress: o.player.expProgress });
    const opponent = createMon(o.opponent.slug, { level: o.opponent.level, moves: o.opponent.moves, shiny: o.opponent.shiny, nature: o.opponent.nature });
    this.engine = new BattleEngine(player, opponent, true, seed);
    this.turn = 0;
    this.autoMove = 0;
    for (const [side, hb] of [['player', this.hbPlayer], ['opponent', this.hbEnemy]] as const) {
      const m = this.engine.mon(side);
      hb.name = m.name;
      hb.gender = m.gender;
      hb.level = m.level;
      hb.maxHp = m.stats.hp;
      hb.hp = hb.shownHp = m.hp;
      hb.expFraction = side === 'player' ? this.engine.expFraction() : 0;
      hb.offset = [0, 0];
      hb.visible = false;
    }
    for (const b of [this.player, this.enemy]) {
      b.visible = true;
      b.appear = 1;
      b.screenOffset = [0, 0];
      b.setTint(BLACK, 0);
      b.onEvent = null;
      void b.play('idle', { fade: 0 });
    }
    const env = this.stage.environment!;
    env.slide = 0;
    env.whiteout = 0;
    env.setEntry(false);
    this.textbox.page = 'message';
    this.textbox.setMessage('');
    this.textbox.actionCursor = 0;
    this.textbox.moveCursor = 0;
    this.trainer.visible = false;
    this.ball.visible = false;
    this.ballParticles = null;
    this.window = null;
    this.fade = { color: BLACK, amount: 0 };
  }

  /** Skip the intro: everything in place, straight to the action menu. */
  private async quickStart(): Promise<void> {
    this.hbEnemy.visible = true;
    this.hbPlayer.visible = true;
    await this.clock.frames(1);
  }

  private async intro(): Promise<void> {
    this.phase = 'intro';
    const env = this.stage.environment!;
    const { enemy, player } = this;
    player.visible = false;
    enemy.setTint(SHADOW, 10 / 16);
    this.trainer = { visible: true, x: 80 + 240, y: 80, frame: 3 };

    // BattleIntroSlide1: WIN0 opens from the middle row (1px/frame to row 48,
    // then 4px/frame), BG1 (entry layer) scrolls 6px/frame and after 32
    // frames sinks behind the text box, BG3 halves slide in 2px/frame. The
    // wild Pokémon and the trainer ride along with their half.
    let slide = 240, bg1x = 0, bg1y = 0, top = 80, bottom = 81, delay = 32, state = 2;
    const apply = () => {
      env.slide = slide;
      env.setEntry(state < 4, bg1x, bg1y);
      this.window = top > 0 ? [top, bottom] : null;
      enemy.screenOffset = [-slide, 0];
      this.trainer.x = 80 + slide;
    };
    apply();
    await this.clock.task(() => {
      bg1x += 6;
      if (state === 2) {
        top--;
        bottom++;
        if (top === 48) state = 3;
      } else {
        if (delay > 0) delay--;
        else if (bg1y > -56) bg1y--;
        if (top > 0) {
          top -= 4;
          bottom += 4;
        }
        if (slide > 0) slide -= 2;
        if (slide === 0) state = 4;
      }
      apply();
      return state === 4;
    });

    // SpriteCB_WildMonShowHealthbox: the healthbox slides in while the
    // shadow fades out (10 -> 0), then the front animation plays.
    const hbIn = this.slideInHealthbox(this.hbEnemy);
    await this.palFade(10, 0, (v) => enemy.setTint(SHADOW, v / 16));
    await enemy.perform('intro');
    await hbIn;

    await this.printMessage(`Wild ${this.engine.opponent.name} appeared!\\p`);
    await this.printMessage(`Go! ${this.engine.player.name}!`);
    await this.sendOut(player);
  }

  /** Trainer throw, Poké Ball arc, ball open, emerge, healthbox and back animation. */
  private async sendOut(mon: Battler3D): Promise<void> {
    // PlayerHandleIntroTrainerBallThrow: slide to x=-40 over 50 frames with the throw anim.
    let t = 0;
    const trainerOut = this.clock.task(() => {
      t++;
      this.trainer.x = 80 + ((-40 - 80) * t) / 50;
      let acc = 0;
      for (const [frame, duration] of TRAINER_THROW) {
        acc += duration;
        if (t < acc) {
          this.trainer.frame = frame;
          break;
        }
      }
      if (t >= 50) this.trainer.visible = false;
      return t >= 50;
    });
    // Task_StartSendOutAnim waits 31 frames before the ball leaves the hand.
    await this.clock.frames(31);
    await this.throwBall([24, 68], [72, 104]);

    // SpriteCB_ReleaseMonFromBall: the ball opens, sparks fly out and the
    // Pokémon appears in the ball's color.
    this.ball.frame = 1;
    void this.clock.frames(4).then(() => (this.ball.frame = 2));
    this.openParticles(this.ball.x, this.ball.y - 5);
    mon.visible = true;
    mon.setTint(BALL_FADE, 1);
    // LaunchBallFadeMonTask: the backdrop fades to white; once it is white it
    // fades back while the Pokémon steps from the ball color to normal.
    const env = this.stage.environment!;
    const flash = this.palFade(0, 16, (v) => (env.whiteout = v / 16)).then(() =>
      Promise.all([
        this.palFade(16, 0, (v) => (env.whiteout = v / 16)),
        this.ramp(16, 0, 1, (v) => mon.setTint(BALL_FADE, v / 16)),
      ]),
    );
    // BATTLER_AFFINE_EMERGE: scale 0x28 -> 0x100 in 12 frames, while
    // HandleBallAnimEnd lifts the sprite by 0x60/256 px per frame.
    let k = 0;
    mon.appear = 40 / 256;
    await this.clock.task(() => {
      k++;
      mon.appear = Math.min(256, 40 + 18 * k) / 256;
      mon.screenOffset = [0, -((0x60 * k) >> 8)];
      return k >= 12;
    });
    mon.appear = 1;
    mon.screenOffset = [0, 0];
    this.ball.visible = false;
    await trainerOut;

    // ballAnimActive cleared: the healthbox slides in and the back animation
    // (BACK_ANIM_SHAKE_GLOW_RED for Blaziken) plays over the 3D send-out clip.
    await Promise.all([this.slideInHealthbox(this.hbPlayer), this.shakeGlow(mon, GLOW_RED), mon.perform('intro'), flash]);
  }

  /** SpriteCB_PlayerMonSendOut: 25-frame arc (30px high), slowed to 1/3 near the top. */
  private throwBall(from: [number, number], to: [number, number]): Promise<void> {
    let u = 0, f = 0;
    this.ball = { visible: true, x: from[0], y: from[1], frame: 0, hflip: false, vflip: false };
    return this.clock.task(() => {
      const slow = u >= 35 / 128 && u < 80 / 128;
      u = Math.min(1, u + (slow ? 1 / 75 : 1 / 25));
      this.ball.x = from[0] + (to[0] - from[0]) * u;
      this.ball.y = from[1] + (to[1] - from[1]) * u - 30 * Math.sin(Math.PI * u);
      // The affine spin, approximated with flips in quarter turns.
      const q = Math.floor(++f / 3) % 4;
      this.ball.hflip = q === 1 || q === 2;
      this.ball.vflip = q >= 2;
      return u >= 1;
    });
  }

  /** PokeBallOpenParticleAnimation: 8 sparks fly out 2px/frame to radius 50. */
  private openParticles(x: number, y: number): void {
    const list = Array.from({ length: 8 }, (_, i) => ({ angle: i * 32, radius: 0 }));
    this.ballParticles = { x, y, frame: 0, list };
    let f = 0;
    void this.clock.task(() => {
      f++;
      for (const p of list) p.radius += 2;
      if (this.ballParticles) this.ballParticles.frame = f % 3;
      if (list[0].radius >= 50) {
        this.ballParticles = null;
        return true;
      }
      return false;
    });
  }

  /** Anim_ShakeGlowRed: palette blend Sin(t, 12) every 2 frames, then a 6px wobble. */
  private shakeGlow(b: Battler3D, color: RGB): Promise<void> {
    const period = 20;
    const wobbleStart = (128 - period) / 2;
    let t = 0, w = 0;
    // A sprite callback: runs after tasks (see FrameClock.task).
    return this.clock.task(() => {
      if (t % 2 === 0) {
        if (t > 127) {
          b.setTint(color, 0);
          b.screenOffset = [0, b.screenOffset[1]];
          return true;
        }
        b.setTint(color, gbaSin(t, 12) / 16);
      }
      if (t >= wobbleStart) {
        const x = w > period ? 0 : gbaSin(Math.floor((w * 384) / period) % 256, 6);
        b.screenOffset = [x, b.screenOffset[1]];
        w++;
      }
      t++;
      return false;
    }, true);
  }

  // -------------------------------------------------------------------------
  // Menus

  private async battleLoop(): Promise<void> {
    for (;;) {
      const action = await this.chooseAction();
      this.phase = 'turn';
      this.turn++;
      const steps = this.engine.runTurn(action);
      if (await this.presentTurn(steps)) return;
    }
  }

  private async chooseAction(): Promise<Action> {
    const tb = this.textbox;
    for (;;) {
      this.phase = 'action';
      tb.page = 'action';
      tb.setActionPrompt(this.engine.player.name);
      this.startBounce();
      if (this.opts.autoplay) {
        const c = tb.actionCursor;
        this.autoPress([...(c & 1 ? ['LEFT' as Button] : []), ...(c & 2 ? ['UP' as Button] : []), 'A']);
      }
      let choice = -1;
      await this.clock.until(() => {
        const c = tb.actionCursor;
        const inp = this.input;
        if (inp.pressed('A')) {
          choice = c;
          return true;
        }
        if (inp.pressed('LEFT') && c & 1) tb.actionCursor = c ^ 1;
        else if (inp.pressed('RIGHT') && !(c & 1)) tb.actionCursor = c ^ 1;
        else if (inp.pressed('UP') && c & 2) tb.actionCursor = c ^ 2;
        else if (inp.pressed('DOWN') && !(c & 2)) tb.actionCursor = c ^ 2;
        return false;
      });
      if (choice === 0) {
        const move = await this.chooseMove();
        if (move === null) continue;
        this.stopBounce();
        return { kind: 'move', index: move };
      }
      this.stopBounce();
      if (choice === 3) return { kind: 'run' };
      await this.printMessage(choice === 1 ? "The BAG can't be used\nin this demo.\\p" : `${this.engine.player.name} is your only\nPOKéMON!\\p`);
    }
  }

  private async chooseMove(): Promise<number | null> {
    const tb = this.textbox;
    const moves = this.engine.player.moves;
    this.phase = 'move';
    for (;;) {
      tb.page = 'move';
      tb.moves = [0, 1, 2, 3].map((i) => (moves[i] ? { name: moves[i].move.name, pp: moves[i].pp, maxPp: moves[i].maxPp, type: moves[i].move.type } : null));
      if (tb.moveCursor >= moves.length) tb.moveCursor = 0;
      if (this.opts.autoplay) this.autoPress(this.autoMovePresses());
      let result: number | null = null;
      await this.clock.until(() => {
        const c = tb.moveCursor, n = moves.length, inp = this.input;
        if (inp.pressed('A')) {
          result = c;
          return true;
        }
        if (inp.pressed('B')) {
          result = null;
          return true;
        }
        if (inp.pressed('LEFT') && c & 1) tb.moveCursor = c ^ 1;
        else if (inp.pressed('RIGHT') && !(c & 1) && (c ^ 1) < n) tb.moveCursor = c ^ 1;
        else if (inp.pressed('UP') && c & 2) tb.moveCursor = c ^ 2;
        else if (inp.pressed('DOWN') && !(c & 2) && (c ^ 2) < n) tb.moveCursor = c ^ 2;
        return false;
      });
      if (result === null) return null;
      if (moves[result].pp > 0) return result;
      await this.printMessage("There's no PP left for\nthis move!\\p");
    }
  }

  /** Autoplay cycles through the moves so every animation gets shown. */
  private autoMovePresses(): Button[] {
    const moves = this.engine.player.moves;
    let target = this.autoMove % moves.length;
    for (let k = 0; k < moves.length && moves[target].pp === 0; k++) target = (target + 1) % moves.length;
    this.autoMove = target + 1;
    const c = this.textbox.moveCursor;
    const presses: Button[] = [];
    if ((c & 1) !== (target & 1)) presses.push(target & 1 ? 'RIGHT' : 'LEFT');
    if ((c & 2) !== (target & 2)) presses.push(target & 2 ? 'DOWN' : 'UP');
    presses.push('A');
    return presses;
  }

  // -------------------------------------------------------------------------
  // Turn presentation

  /** Present one turn's steps; resolves true when the battle is over. */
  private async presentTurn(steps: Step[]): Promise<boolean> {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      switch (s.kind) {
        case 'message': {
          // "X used Y!" hands over to the animation as soon as it is printed.
          const next = steps[i + 1];
          const intoMove = next?.kind === 'move' && !next.missed;
          await this.printMessage(s.text, intoMove ? 0 : next?.kind === 'move' ? WAIT_SHORT : WAIT_LONG);
          break;
        }
        case 'move': {
          if (s.missed) break;
          const hp: Extract<Step, { kind: 'hp' }>[] = [];
          while (hp.length < s.hits.length && steps[i + 1]?.kind === 'hp') hp.push(steps[++i] as Extract<Step, { kind: 'hp' }>);
          await this.playMove(s.side, s.move, hp);
          break;
        }
        case 'hp':
          if (s.cause === 'burn') await this.burnFx(s.side);
          await this.drainHp(s.side, s.to);
          break;
        case 'stat':
          await this.statFx(s.side, s.delta);
          break;
        case 'faint':
          await this.faint(s.side);
          break;
        case 'exp':
          await this.gainExp(s.gained);
          break;
        case 'end':
          return true;
      }
    }
    return false;
  }

  private async playMove(side: Side, move: Extract<Step, { kind: 'move' }>['move'], hp: Extract<Step, { kind: 'hp' }>[]): Promise<void> {
    const attacker = this.battler(side);
    const target = this.battler(side === 'player' ? 'opponent' : 'player');
    const drains: Promise<void>[] = [];
    let landed = 0;
    await performMove(attacker, target, move, this.vfx, {
      onHit: () => {
        const h = hp[landed++];
        if (h) drains.push(this.drainHp(h.side, h.to));
      },
    });
    // Hits the clip had no impact event for drain one after another.
    for (; landed < hp.length; landed++) {
      await Promise.all(drains);
      drains.push(this.drainHp(hp[landed].side, hp[landed].to));
    }
    await Promise.all(drains);
    await this.clock.until(() => !this.vfx.busy);
  }

  /** MoveBattleBar: 1 HP per frame, or one bar pixel per frame below 48 max HP. */
  private drainHp(side: Side, to: number): Promise<void> {
    const hb = this.healthbox(side);
    const rate = hb.maxHp >= 48 ? 1 : hb.maxHp / 48;
    let v = hb.shownHp;
    hb.hp = to;
    return this.clock.until(() => {
      v = v > to ? Math.max(to, v - rate) : Math.min(to, v + rate);
      hb.shownHp = v > to ? Math.ceil(v) : Math.floor(v);
      return v === to;
    });
  }

  private async statFx(side: Side, delta: number): Promise<void> {
    const b = this.battler(side);
    const up = delta > 0;
    for (let i = 0; i < 10; i++) {
      this.vfx.after(i * 0.05, () => {
        const p = bodyPoint(b, up ? 0.05 + (i % 3) * 0.12 : 0.95 - (i % 3) * 0.12);
        const ang = (i / 10) * Math.PI * 2;
        p.add(new THREE.Vector3(Math.cos(ang) * 0.3, 0, Math.sin(ang) * 0.3).multiplyScalar(b.height));
        void this.vfx.sprite('FocusEnergy', p, { px: 16, fps: 16, life: 0.55, velocity: new THREE.Vector3(0, (up ? 1.3 : -1.3) * b.height, 0) });
      });
    }
    // Palette pulse in the stat-change color (coefficient up to 10/16).
    let t = 0;
    const color = up ? STAT_UP : STAT_DOWN;
    await this.clock.until(() => {
      t++;
      b.setTint(color, Math.round(Math.sin((t / 48) * Math.PI) * 10) / 16);
      if (t < 48) return false;
      b.setTint(color, 0);
      return true;
    });
    await this.clock.until(() => !this.vfx.busy);
  }

  private async burnFx(side: Side): Promise<void> {
    const b = this.battler(side);
    for (let i = 0; i < 3; i++) {
      this.vfx.after(i * 0.2, () => {
        const p = towardCamera(b, bodyPoint(b, 0.25 + i * 0.2), 0.35);
        void this.vfx.sprite('SmallEmber', p, { px: 24, fps: 12, velocity: new THREE.Vector3(0, b.height * 0.5, 0) });
      });
    }
    let t = 0;
    await this.clock.until(() => {
      t++;
      b.setTint(BURN, Math.round(Math.sin((t / 40) * Math.PI) * 8) / 16);
      if (t < 40) return false;
      b.setTint(BURN, 0);
      return true;
    });
    await this.clock.until(() => !this.vfx.busy);
  }

  private async faint(side: Side): Promise<void> {
    const b = this.battler(side);
    b.onEvent = (e) => {
      if (e === 'thud') this.vfx.shake(0.03, 0.25);
    };
    await b.play('faint');
    b.onEvent = null;
    b.visible = false;
    this.healthbox(side).visible = false;
  }

  /** Task_GiveExpWithExpBar: 13-frame pause, then one bar pixel per frame. */
  private async gainExp(gained: number): Promise<void> {
    const m = this.engine.player;
    const hb = this.hbPlayer;
    const growth = m.species.growthRate;
    // The engine already applied the gain; replay it from the old values.
    let level = hb.level;
    let exp = m.exp - gained;
    let remaining = gained;
    await this.clock.frames(13);
    while (remaining > 0 && level < 100) {
      const lo = expForLevel(growth, level), hi = expForLevel(growth, level + 1);
      const chunk = Math.min(remaining, hi - exp);
      exp += chunk;
      remaining -= chunk;
      const target = (exp - lo) / (hi - lo);
      await this.clock.until(() => {
        const px = Math.round(hb.expFraction * 64);
        const goal = Math.floor(target * 64);
        if (px >= goal) {
          hb.expFraction = target;
          return true;
        }
        hb.expFraction = (px + 1) / 64;
        return false;
      });
      if (exp >= hi) {
        level++;
        const stats = calcStats(m.species, level, m.nature);
        hb.shownHp += stats.hp - hb.maxHp;
        hb.hp = hb.shownHp;
        hb.maxHp = stats.hp;
        hb.level = level;
        hb.expFraction = 0;
        await this.printMessage(`${m.name} grew to\nLV. ${level}!\\p`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Debug / test hooks

  debugState() {
    return {
      phase: this.phase,
      frame: this.clock.frame,
      turn: this.turn,
      battles: this.battles,
      error: this.error,
      player: { hp: this.engine?.player.hp, shown: this.hbPlayer.shownHp, level: this.hbPlayer.level },
      opponent: { hp: this.engine?.opponent.hp, shown: this.hbEnemy.shownHp },
      page: this.textbox.page,
    };
  }
}
