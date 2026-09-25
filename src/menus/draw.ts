// Drawing for the menus, the way Emerald's window and sprite code draws them:
// standard window frames around 8-pixel aligned windows, text in the window
// palette, menu info icons (types, TYPE / POWER / ACCURACY / PP labels),
// sprites by center, affine-scaled sprites, and the darken blend effect.

import { type Bitmap, type RGB, blit, fillRect } from '../gba/bitmap';
import { type FontName, type TextLayout, drawText, encodeText, measureText } from '../gba/font';
import type { MenuGfx } from './gfx';

export interface PrintOptions {
  font?: FontName;
  /** Palette indices (standard window palette: 1 white, 2 dark gray, 3 light gray, 4 red). */
  fg?: number;
  shadow?: number;
  /** null leaves the background as it is. */
  bg?: number | null;
  palette?: RGB[];
  /** Typewriter: draw only this many glyphs. */
  maxGlyphs?: number;
}

export function print(fb: Bitmap, g: MenuGfx, text: string, x: number, y: number, o: PrintOptions = {}): TextLayout {
  return drawText(fb, encodeText(text), x, y, {
    font: g.fonts[o.font ?? 'normal'],
    palette: o.palette ?? g.text,
    fg: o.fg ?? 2,
    shadow: o.shadow ?? 3,
    bg: o.bg === undefined ? null : o.bg,
  }, o.maxGlyphs);
}

export function textWidth(g: MenuGfx, text: string, font: FontName = 'normal'): number {
  return measureText(encodeText(text), g.fonts[font]);
}

/** GetStringCenterAlignXOffset. */
export function centerX(g: MenuGfx, text: string, font: FontName, width: number): number {
  return Math.max(0, Math.floor((width - textWidth(g, text, font)) / 2));
}

/** Break text into lines that fit `width` pixels (words kept whole). */
export function wrap(g: MenuGfx, text: string, width: number, font: FontName = 'normal'): string {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(g, next, font) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/**
 * DrawStdFrameWithCustomTileAndPalette: the frame's nine tiles around a
 * window whose inside is (x, y, w, h) in pixels, the inside filled with the
 * window color (PIXEL_FILL(1), white).
 */
export function stdWindow(fb: Bitmap, g: MenuGfx, x: number, y: number, w: number, h: number, fill = true): void {
  const t = (i: number, dx: number, dy: number) => blit(fb, g.frame, (i % 3) * 8, Math.floor(i / 3) * 8, 8, 8, dx, dy);
  for (let tx = x; tx < x + w; tx += 8) {
    t(1, tx, y - 8);
    t(7, tx, y + h);
  }
  for (let ty = y; ty < y + h; ty += 8) {
    t(3, x - 8, ty);
    t(5, x + w, ty);
  }
  t(0, x - 8, y - 8);
  t(2, x + w, y - 8);
  t(6, x - 8, y + h);
  t(8, x + w, y + h);
  if (fill) fillRect(fb, x, y, w, h, g.text[1]);
}

/** The GBA's darken blend (BLDCNT darken, BLDY = coefficient / 16) over a rectangle. */
export function darken(fb: Bitmap, x: number, y: number, w: number, h: number, coefficient: number): void {
  const d = fb.data;
  for (let py = Math.max(0, y); py < Math.min(fb.height, y + h); py++) {
    for (let px = Math.max(0, x); px < Math.min(fb.width, x + w); px++) {
      const i = (py * fb.width + px) * 4;
      d[i] -= (d[i] * coefficient) >> 4;
      d[i + 1] -= (d[i + 1] * coefficient) >> 4;
      d[i + 2] -= (d[i + 2] * coefficient) >> 4;
    }
  }
}

/**
 * Blend the whole screen toward a color (a palette fade; 0..16). Where the
 * layer is see-through (a 3D backdrop shows), the color is laid over it with
 * the fade's strength.
 */
export function fade(fb: Bitmap, color: RGB, coefficient: number): void {
  if (coefficient <= 0) return;
  const d = fb.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) {
      d[i] = color[0];
      d[i + 1] = color[1];
      d[i + 2] = color[2];
      d[i + 3] = Math.min(255, coefficient * 16);
      continue;
    }
    d[i] += ((color[0] - d[i]) * coefficient) >> 4;
    d[i + 1] += ((color[1] - d[i + 1]) * coefficient) >> 4;
    d[i + 2] += ((color[2] - d[i + 2]) * coefficient) >> 4;
    d[i + 3] = 255;
  }
}

// sMenuInfoIcons (menu.c): [tile offset in menu_info.png (16 tiles wide), width, height].
const TYPE_ICONS: Record<string, number> = {
  TYPE_NORMAL: 0x20, TYPE_FIGHTING: 0x64, TYPE_FLYING: 0x60, TYPE_POISON: 0x80, TYPE_GROUND: 0x48, TYPE_ROCK: 0x44,
  TYPE_BUG: 0x6c, TYPE_GHOST: 0x68, TYPE_STEEL: 0x88, TYPE_MYSTERY: 0xa4, TYPE_FIRE: 0x24, TYPE_WATER: 0x28,
  TYPE_GRASS: 0x2c, TYPE_ELECTRIC: 0x40, TYPE_PSYCHIC: 0x84, TYPE_ICE: 0x4c, TYPE_DRAGON: 0xa0, TYPE_DARK: 0x8c,
};
const LABELS = { TYPE: 0xa8, POWER: 0xc0, ACCURACY: 0xc8, PP: 0xe0, EFFECT: 0xe8 } as const;

function menuInfo(fb: Bitmap, g: MenuGfx, offset: number, w: number, h: number, x: number, y: number): void {
  blit(fb, g.menuInfo, (offset % 16) * 8, Math.floor(offset / 16) * 8, w, h, x, y);
}

/** A move type's icon (32x12). */
export function typeIcon(fb: Bitmap, g: MenuGfx, type: string, x: number, y: number): void {
  menuInfo(fb, g, TYPE_ICONS[type] ?? TYPE_ICONS.TYPE_MYSTERY, 32, 12, x, y);
}

/** The TYPE / POWER / ACCURACY / PP labels (42x12). */
export function infoLabel(fb: Bitmap, g: MenuGfx, name: keyof typeof LABELS, x: number, y: number): void {
  menuInfo(fb, g, LABELS[name], 42, 12, x, y);
}

/** A frame of a vertical strip of square sprites, placed by its center (GBA sprite x/y). */
export function sprite(fb: Bitmap, sheet: Bitmap, frame: number, size: number, cx: number, cy: number): void {
  blit(fb, sheet, 0, frame * size, size, size, Math.round(cx - size / 2), Math.round(cy - size / 2));
}

/**
 * An affine sprite scaled by `scale` about its center (nearest neighbor, as
 * the GBA samples): `src` rectangle drawn centered at (cx, cy).
 */
export function scaled(fb: Bitmap, src: Bitmap, sx: number, sy: number, sw: number, sh: number, cx: number, cy: number, scale: number): void {
  if (scale <= 0) return;
  const w = Math.round(sw * scale), h = Math.round(sh * scale);
  const x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
  const d = fb.data, s = src.data;
  for (let y = 0; y < h; y++) {
    const ty = y0 + y;
    if (ty < 0 || ty >= fb.height) continue;
    const syy = sy + Math.min(sh - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const tx = x0 + x;
      if (tx < 0 || tx >= fb.width) continue;
      const si = (syy * src.width + sx + Math.min(sw - 1, Math.floor(x / scale))) * 4;
      if (!s[si + 3]) continue;
      const di = (ty * fb.width + tx) * 4;
      d[di] = s[si];
      d[di + 1] = s[si + 1];
      d[di + 2] = s[si + 2];
      d[di + 3] = 255;
    }
  }
}
