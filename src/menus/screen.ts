// The GBA screen while no battle runs: a 60 Hz frame loop, a frame clock for
// menu logic written as async steps (like the battle scene), the buttons, and
// the pieces every Emerald menu is made of: palette fades, messages printed
// letter by letter into a framed window with the bobbing arrow, the YES/NO
// box and list menus with the ▶ cursor.

import type { Bitmap, RGB } from '../gba/bitmap';
import { clear } from '../gba/bitmap';
import { GbaScreen } from '../battle/screen';
import { type Button, Input } from '../battle/input';
import { FrameClock } from '../battle/clock';
import { TEXT_FRAMES } from '../battle/scene';
import { encodeText } from '../gba/font';
import type { MenuGfx } from './gfx';
import { blit } from '../gba/bitmap';
import { fade, print, stdWindow, textWidth } from './draw';

export const BLACK: RGB = [0, 0, 0];

/** A window's inside, in pixels (8-pixel aligned). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The message window most screens use (tile 3,15, 24x4 tiles, like the starter screen). */
export const MESSAGE_WINDOW: Rect = { x: 24, y: 120, w: 192, h: 32 };

export interface ListItem {
  label: string;
  /** Drawn right-aligned in the row (PP, a level...). */
  detail?: string;
  /** Called while the item is highlighted. */
  onHover?: () => void;
}

export class MenuScreen {
  readonly screen: GbaScreen;
  readonly clock = new FrameClock();
  readonly input: Input;
  readonly fb: Bitmap;
  /** Drawn every frame, bottom first. */
  layers: ((fb: Bitmap) => void)[] = [];
  /** Palette fade over everything: 0 (none) .. 16 (solid). */
  fadeAmount = 16;
  /**
   * A live 3D scene behind the menus (an arena preview): it advances and
   * renders every frame and shows wherever the layers leave the screen clear.
   */
  backdrop: { update(dt: number): void; render(): void } | null = null;
  fadeColor: RGB = BLACK;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private disposed = false;

  constructor(parent: HTMLElement, readonly g: MenuGfx, fill: boolean) {
    this.screen = new GbaScreen(parent, undefined, fill);
    this.fb = this.screen.ui;
    this.input = new Input(window);
    this.screen.element.addEventListener('pointerdown', () => this.input.press('A'));
    const loop = (now: number) => {
      if (this.disposed) return;
      if (!this.last) this.last = now;
      this.acc += Math.min(100, now - this.last);
      this.last = now;
      let steps = 0;
      while (this.acc >= 1000 / 60 - 0.5 && steps < 4) {
        this.input.poll();
        this.clock.tick();
        this.acc -= 1000 / 60;
        steps++;
      }
      if (this.acc < 0) this.acc = 0;
      if (steps && this.backdrop) {
        this.backdrop.update(steps / 60);
        this.backdrop.render();
      }
      if (steps) this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  render(): void {
    clear(this.fb, this.backdrop ? [0, 0, 0, 0] : [0, 0, 0, 255]);
    for (const layer of this.layers) layer(this.fb);
    fade(this.fb, this.fadeColor, this.fadeAmount);
    this.screen.presentUi();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    this.screen.dispose();
  }

  pressed(...b: Button[]): boolean {
    return this.input.pressed(...b);
  }

  /** Wait for one of the buttons; resolves with the one pressed. */
  async button(...bs: Button[]): Promise<Button> {
    let hit: Button = bs[0];
    await this.clock.until(() => {
      const b = bs.find((x) => this.input.pressed(x));
      if (b) hit = b;
      return !!b;
    });
    return hit;
  }

  /** BeginNormalPaletteFade: the coefficient moves 2 every other frame. */
  fadeTo(target: number, color: RGB = BLACK): Promise<void> {
    this.fadeColor = color;
    let f = 0;
    return this.clock.until(() => {
      if (++f % 2) return this.fadeAmount === target;
      this.fadeAmount = this.fadeAmount < target ? Math.min(target, this.fadeAmount + 2) : Math.max(target, this.fadeAmount - 2);
      return this.fadeAmount === target;
    });
  }

  /** Add a layer until the returned function removes it. */
  show(layer: (fb: Bitmap) => void): () => void {
    this.layers.push(layer);
    return () => {
      this.layers = this.layers.filter((l) => l !== layer);
    };
  }

  /**
   * Print text into a framed window letter by letter (holding A or B speeds
   * it up). With `wait`, the arrow bobs at the end until A or B. The window
   * stays up (with the finished text) until the returned remover is called.
   */
  async message(text: string, opts: { rect?: Rect; wait?: boolean } = {}): Promise<() => void> {
    const r = opts.rect ?? MESSAGE_WINDOW;
    const pages = text.split('\\p');
    let current = '';
    let shown = 0;
    let arrow = -1;
    const remove = this.show((fb) => {
      stdWindow(fb, this.g, r.x, r.y, r.w, r.h);
      const end = print(fb, this.g, current, r.x, r.y + 1, { maxGlyphs: shown });
      if (arrow >= 0) blit(fb, this.g.downArrow, 0, [0, 1, 2, 1][(arrow >> 3) & 3], 8, 16, end.endX, end.endY);
    });
    for (let p = 0; p < pages.length; p++) {
      current = pages[p];
      shown = 0;
      const total = encodeText(current).filter((t) => t.kind === 'glyph' || t.kind === 'keypad').length;
      let timer = 0, fast = false;
      await this.clock.until(() => {
        if (shown >= total) return true;
        if (this.input.pressed('A', 'B')) fast = true;
        if ((fast && (this.input.isHeld('A') || this.input.isHeld('B'))) || ++timer >= TEXT_FRAMES.fast) {
          timer = 0;
          shown++;
        }
        return false;
      });
      if (p < pages.length - 1 || opts.wait) {
        arrow = 0;
        await this.clock.until(() => {
          arrow++;
          return this.input.pressed('A', 'B');
        });
        arrow = -1;
      }
    }
    return remove;
  }

  /**
   * CreateYesNoMenu: a 5x4 tile window with YES and NO and the ▶ cursor.
   * Resolves true for YES, false for NO or B.
   */
  async yesNo(x = 192, y = 72): Promise<boolean> {
    let cursor = 0;
    const remove = this.show((fb) => {
      stdWindow(fb, this.g, x, y, 40, 32);
      print(fb, this.g, 'YES', x + 8, y + 1);
      print(fb, this.g, 'NO', x + 8, y + 17);
      print(fb, this.g, '▶', x, y + 1 + cursor * 16);
    });
    let result = false;
    await this.clock.until(() => {
      if (this.input.pressed('UP')) cursor = 0;
      else if (this.input.pressed('DOWN')) cursor = 1;
      else if (this.input.pressed('A')) {
        result = cursor === 0;
        return true;
      } else if (this.input.pressed('B')) return true;
      return false;
    });
    remove();
    return result;
  }

  /**
   * A list menu in a framed window: `rows` visible (16 px each), scrolling
   * with the arrows of scroll_indicator.png. Resolves the chosen index, or
   * null for B. `start` is the initial cursor; `keep` leaves the window up.
   */
  async list(items: ListItem[], r: Rect, opts: { start?: number; keep?: boolean; extra?: (b: Button) => boolean } = {}): Promise<{ index: number | null; remove: () => void; button?: Button }> {
    const rows = Math.floor(r.h / 16);
    let cursor = Math.min(items.length - 1, Math.max(0, opts.start ?? 0));
    let top = Math.max(0, Math.min(cursor - rows + 1, items.length - rows));
    let tick = 0;
    items[cursor]?.onHover?.();
    const remove = this.show((fb) => {
      stdWindow(fb, this.g, r.x, r.y, r.w, r.h);
      for (let i = 0; i < rows && top + i < items.length; i++) {
        const it = items[top + i];
        const y = r.y + 1 + i * 16;
        print(fb, this.g, it.label, r.x + 8, y);
        if (it.detail) print(fb, this.g, it.detail, r.x + r.w - textWidth(this.g, it.detail), y);
      }
      if (cursor >= top && cursor < top + rows) print(fb, this.g, '▶', r.x, r.y + 1 + (cursor - top) * 16);
      // Scroll arrows bob above and below the window when there is more.
      const bob = [0, 1, 2, 1][(tick >> 3) & 3];
      // scroll_indicator.png: tile 0 the left arrow, tile 4 the up arrow (flipped for down).
      if (top > 0) blit(fb, this.g.scroll, 0, 16, 16, 16, r.x + r.w / 2 - 8, r.y - 14 - bob);
      if (top + rows < items.length) blit(fb, this.g.scroll, 0, 16, 16, 16, r.x + r.w / 2 - 8, r.y + r.h - 2 + bob, { vflip: true });
    });
    let index: number | null = null;
    let button: Button | undefined;
    await this.clock.until(() => {
      tick++;
      const n = items.length;
      let moved = false;
      if (this.input.pressed('UP') && cursor > 0) { cursor--; moved = true; }
      else if (this.input.pressed('DOWN') && cursor < n - 1) { cursor++; moved = true; }
      else if (this.input.pressed('LEFT') && cursor > 0) { cursor = Math.max(0, cursor - rows); moved = true; }
      else if (this.input.pressed('RIGHT') && cursor < n - 1) { cursor = Math.min(n - 1, cursor + rows); moved = true; }
      if (moved) {
        if (cursor < top) top = cursor;
        if (cursor >= top + rows) top = cursor - rows + 1;
        items[cursor]?.onHover?.();
      }
      if (this.input.pressed('A')) {
        index = cursor;
        return true;
      }
      if (this.input.pressed('B')) return true;
      for (const b of ['START', 'SELECT'] as Button[]) {
        if (this.input.pressed(b) && opts.extra?.(b)) {
          button = b;
          index = cursor;
          return true;
        }
      }
      return false;
    });
    if (!opts.keep) remove();
    return { index, remove, button };
  }
}
