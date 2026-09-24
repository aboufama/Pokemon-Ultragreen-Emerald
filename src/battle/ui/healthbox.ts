// Singles healthboxes (battle_interface.c). Positions are expressed relative
// to the healthbox image's top-left; they were fitted pixel-exactly against
// real Emerald captures (see src/devtools/uifit.ts and reference/emerald).

import { type Bitmap, blit, loadBitmap } from '../../gba/bitmap';
import { asset } from '../../gba/assets';
import { type Font, decimal, drawText, encodeText } from '../../gba/font';
import { GFX_META } from '../../data';

export type Side = 'player' | 'opponent';
export type Gender = 'male' | 'female' | null;

export interface HealthboxLayout {
  /** Top-left of the healthbox image on screen (sprite center + centerToCornerVec). */
  box: [number, number];
  name: [number, number];
  /** Position of the "Lv" glyph for a 3-digit level; shorter levels shift right by 5px per digit. */
  level: [number, number];
  /** Healthbar sprite: [H][P] label followed by six 8px bar tiles. */
  hpBar: [number, number];
  hpText?: [number, number];
  expBar?: [number, number];
}

export const HEALTHBOX_LAYOUT: Record<Side, HealthboxLayout> = {
  player: { box: [126, 72], name: [16, 3], level: [72, 3], hpBar: [32, 16], hpText: [60, 21], expBar: [32, 32] },
  opponent: { box: [12, 14], name: [8, 3], level: [64, 3], hpBar: [24, 16] },
};

export const HP_BAR_PIXELS = 48;
export const EXP_BAR_PIXELS = 64;

/** CalcBarFilledPixels for a whole bar: filled pixel count. */
export function barPixels(value: number, max: number, total: number): number {
  if (max <= 0) return 0;
  let px = Math.floor((Math.max(0, Math.min(value, max)) * total) / max);
  if (px === 0 && value > 0) px = 1;
  return px;
}

export function hpBarColor(filled: number): 'green' | 'yellow' | 'red' {
  if (filled > (HP_BAR_PIXELS * 50) / 100) return 'green';
  if (filled > Math.floor((HP_BAR_PIXELS * 20) / 100)) return 'yellow';
  return 'red';
}

export class Healthbox {
  name = '';
  gender: Gender = null;
  level = 1;
  hp = 1;
  maxHp = 1;
  /** HP value currently shown (animated toward `hp` by the battle UI). */
  shownHp = 1;
  expFraction = 0;
  visible = true;
  /** Offset used by slide-in and the action-menu bounce. */
  offset: [number, number] = [0, 0];
  layout: HealthboxLayout;

  private constructor(
    readonly side: Side,
    private readonly box: Bitmap,
    private readonly hpbar: Bitmap,
    private readonly hpbarAnim: Bitmap,
    private readonly expbar: Bitmap,
    private readonly font: Font,
  ) {
    this.layout = HEALTHBOX_LAYOUT[side];
  }

  static async load(side: Side, smallFont: Font): Promise<Healthbox> {
    const [box, hpbar, hpbarAnim, expbar] = await Promise.all([
      loadBitmap(asset(`gba/battle_interface/healthbox_singles_${side}.png`)),
      loadBitmap(asset('gba/battle_interface/hpbar.png')),
      loadBitmap(asset('gba/battle_interface/hpbar_anim.png')),
      loadBitmap(asset('gba/battle_interface/expbar.png')),
    ]);
    return new Healthbox(side, box, hpbar, hpbarAnim, expbar, smallFont);
  }

  private textStyle() {
    // AddTextPrinterAndCreateWindowOnHealthbox: FONT_SMALL, colors {bg 2, fg 1, shadow 3}.
    return { font: this.font, palette: GFX_META.healthboxPalette, fg: 1, bg: null, shadow: 3 };
  }

  nameTokens() {
    const gender = this.gender === 'male' ? '{COLOR DYNAMIC_COLOR2}♂' : this.gender === 'female' ? '{COLOR DYNAMIC_COLOR1}♀' : '';
    return encodeText(`${this.name}${gender}`);
  }

  levelTokens() {
    return encodeText(`{LV_2}${decimal(this.level, 3)}`);
  }

  hpTokens() {
    return encodeText(`${decimal(this.shownHp, 3, 'right')}/${decimal(this.maxHp, 3, 'right')}`);
  }

  drawName(fb: Bitmap, x: number, y: number): void {
    drawText(fb, this.nameTokens(), x, y, this.textStyle());
  }

  drawLevel(fb: Bitmap, x: number, y: number): void {
    const digits = String(this.level).length;
    drawText(fb, this.levelTokens(), x + 5 * (3 - digits), y, this.textStyle());
  }

  drawHpText(fb: Bitmap, x: number, y: number): void {
    drawText(fb, this.hpTokens(), x, y, this.textStyle());
  }

  drawHpBar(fb: Bitmap, x: number, y: number): void {
    blit(fb, this.hpbar, 8, 0, 16, 8, x, y); // "H" "P"
    const filled = barPixels(this.shownHp, this.maxHp, HP_BAR_PIXELS);
    const color = hpBarColor(filled);
    let remaining = filled;
    for (let i = 0; i < HP_BAR_PIXELS / 8; i++) {
      const px = Math.max(0, Math.min(8, remaining));
      remaining -= 8;
      if (color === 'green') blit(fb, this.hpbar, (3 + px) * 8, 0, 8, 8, x + 16 + i * 8, y);
      else blit(fb, this.hpbarAnim, ((color === 'yellow' ? 0 : 9) + px) * 8, 0, 8, 8, x + 16 + i * 8, y);
    }
  }

  drawExpBar(fb: Bitmap, x: number, y: number): void {
    let remaining = Math.round(this.expFraction * EXP_BAR_PIXELS);
    for (let i = 0; i < EXP_BAR_PIXELS / 8; i++) {
      const px = Math.max(0, Math.min(8, remaining));
      remaining -= 8;
      blit(fb, this.expbar, px * 8, 0, 8, 8, x + i * 8, y);
    }
  }

  draw(fb: Bitmap): void {
    if (!this.visible) return;
    const L = this.layout;
    const bx = L.box[0] + this.offset[0];
    const by = L.box[1] + this.offset[1];
    blit(fb, this.box, 0, 0, this.box.width, this.box.height, bx, by);
    this.drawName(fb, bx + L.name[0], by + L.name[1]);
    this.drawLevel(fb, bx + L.level[0], by + L.level[1]);
    this.drawHpBar(fb, bx + L.hpBar[0], by + L.hpBar[1]);
    if (L.hpText) this.drawHpText(fb, bx + L.hpText[0], by + L.hpText[1]);
    if (L.expBar) this.drawExpBar(fb, bx + L.expBar[0], by + L.expBar[1]);
  }
}
