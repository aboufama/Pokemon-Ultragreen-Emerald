// Emerald's Latin fonts rendered from the decomp glyph sheets.
//
// Sheets are 256x512, 16x16 cells, glyph id = row * 16 + column (ids >= 0x100
// are the "extra symbols" reached through CHAR_EXTRA_SYMBOL). The extractor
// stores each pixel's 2-bit value in the red channel (value * 85):
// 0 background, 1 foreground, 2 shadow, 3 glyph box (rendered as background).

import charmapJson from '../data/generated/charmap.json';
import fontWidths from '../data/generated/fonts.json';
import { type Bitmap, type RGB, loadBitmap } from './bitmap';
import { asset } from './assets';

export type FontName = 'normal' | 'narrow' | 'small' | 'short' | 'smallNarrow';

interface FontSpec {
  sheet: string;
  widths: keyof typeof fontWidths;
  /** Rows copied from the 16x16 cell (gCurGlyph.height). */
  glyphHeight: number;
  /** Newline advance (FontInfo.maxLetterHeight). */
  lineHeight: number;
}

const SPECS: Record<FontName, FontSpec> = {
  normal: { sheet: 'latin_normal', widths: 'gFontNormalLatinGlyphWidths', glyphHeight: 15, lineHeight: 16 },
  narrow: { sheet: 'latin_narrow', widths: 'gFontNarrowLatinGlyphWidths', glyphHeight: 15, lineHeight: 16 },
  small: { sheet: 'latin_small', widths: 'gFontSmallLatinGlyphWidths', glyphHeight: 13, lineHeight: 12 },
  short: { sheet: 'latin_short', widths: 'gFontShortLatinGlyphWidths', glyphHeight: 14, lineHeight: 14 },
  smallNarrow: { sheet: 'latin_small_narrow', widths: 'gFontSmallNarrowLatinGlyphWidths', glyphHeight: 12, lineHeight: 12 },
};

export class Font {
  private readonly values: Uint8Array;

  constructor(
    readonly name: FontName,
    sheet: Bitmap,
    readonly widths: readonly number[],
    readonly glyphHeight: number,
    readonly lineHeight: number,
  ) {
    this.values = new Uint8Array(sheet.width * sheet.height);
    for (let i = 0; i < this.values.length; i++) this.values[i] = Math.round(sheet.data[i * 4] / 85);
  }

  glyphWidth(glyph: number): number {
    return this.widths[glyph] ?? 0;
  }

  /** Draw one glyph with its top-left at (x, y). bg === null leaves background pixels untouched. */
  drawGlyph(dst: Bitmap, glyph: number, x: number, y: number, fg: RGB, shadow: RGB, bg: RGB | null): void {
    const w = this.glyphWidth(glyph);
    const cx = (glyph & 15) * 16;
    const cy = (glyph >> 4) * 16;
    const d = dst.data;
    for (let gy = 0; gy < this.glyphHeight; gy++) {
      const ty = y + gy;
      if (ty < 0 || ty >= dst.height) continue;
      for (let gx = 0; gx < w; gx++) {
        const tx = x + gx;
        if (tx < 0 || tx >= dst.width) continue;
        const v = this.values[(cy + gy) * 256 + cx + gx];
        const c = v === 1 ? fg : v === 2 ? shadow : bg;
        if (!c) continue;
        const i = (ty * dst.width + tx) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    }
  }
}

/**
 * Emerald's button icons in text ({A_BUTTON}, {START_BUTTON}, {DPAD_UPDOWN}...,
 * charmap F8 xx): sKeypadIcons in text.c, as [tile offset in the 128 px wide
 * sheet, width, height]. Their pixels use the text palette's colors.
 */
const KEYPAD_ICONS: [offset: number, width: number, height: number][] = [
  [0x00, 8, 12], [0x01, 8, 12], [0x02, 16, 12], [0x04, 16, 12], [0x06, 24, 12], [0x09, 24, 12],
  [0x0c, 8, 12], [0x0d, 8, 12], [0x0e, 8, 12], [0x0f, 8, 12], [0x20, 8, 12], [0x21, 8, 12], [0x22, 8, 12],
];
let keypadSheet: Bitmap | null = null;
let keypadLoad: Promise<void> | null = null;

/** Load the button icon sheet (loadAllFonts does it too). */
export function loadKeypadIcons(): Promise<void> {
  keypadLoad ??= loadBitmap(asset('gba/menu/keypad_icons.png')).then((b) => void (keypadSheet = b));
  keypadLoad.catch(() => (keypadLoad = null));
  return keypadLoad;
}

function keypadWidth(id: number): number {
  return KEYPAD_ICONS[id]?.[1] ?? 0;
}

function drawKeypadIcon(dst: Bitmap, id: number, x: number, y: number): void {
  const icon = KEYPAD_ICONS[id];
  if (!icon || !keypadSheet) return;
  const [offset, w, h] = icon;
  const sx = (offset % 16) * 8, sy = Math.floor(offset / 16) * 8;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const si = ((sy + py) * keypadSheet.width + sx + px) * 4;
      if (!keypadSheet.data[si + 3]) continue;
      const tx = x + px, ty = y + py;
      if (tx < 0 || ty < 0 || tx >= dst.width || ty >= dst.height) continue;
      const di = (ty * dst.width + tx) * 4;
      dst.data[di] = keypadSheet.data[si];
      dst.data[di + 1] = keypadSheet.data[si + 1];
      dst.data[di + 2] = keypadSheet.data[si + 2];
      dst.data[di + 3] = 255;
    }
  }
}

const fontCache = new Map<FontName, Promise<Font>>();

export function loadFont(name: FontName): Promise<Font> {
  let p = fontCache.get(name);
  if (!p) {
    const spec = SPECS[name];
    p = loadBitmap(asset(`gba/fonts/${spec.sheet}.png`)).then(
      (sheet) => new Font(name, sheet, fontWidths[spec.widths], spec.glyphHeight, spec.lineHeight),
    );
    p.catch(() => fontCache.delete(name));
    fontCache.set(name, p);
  }
  return p;
}

export async function loadAllFonts(): Promise<Record<FontName, Font>> {
  const names = Object.keys(SPECS) as FontName[];
  const [fonts] = await Promise.all([Promise.all(names.map(loadFont)), loadKeypadIcons()]);
  return Object.fromEntries(names.map((n, i) => [n, fonts[i]])) as Record<FontName, Font>;
}

// ---------------------------------------------------------------------------
// Text encoding: a subset of the decomp's string syntax.
//   "\n" newline, "\p" wait + clear, "\l" wait + scroll
//   {CLEAR_TO n}          move to x + n
//   {COLOR n} {HIGHLIGHT n} {SHADOW n}  palette-index color changes
//   {PKMN}, {LV_2} and other named glyph sequences from charmap.txt
// ---------------------------------------------------------------------------

export type TextToken =
  | { kind: 'glyph'; id: number }
  | { kind: 'keypad'; id: number }
  | { kind: 'newline' }
  | { kind: 'paragraph' }
  | { kind: 'scroll' }
  | { kind: 'clearTo'; x: number }
  | { kind: 'color'; which: 'fg' | 'bg' | 'shadow'; index: number };

const CHARS: Record<string, number> = charmapJson.chars;
const NAMED: Record<string, number[]> = charmapJson.named;
const EXTRA_SYMBOLS: Record<string, number> = { LV_2: 0x05, LV: 0x05 };
const COLOR_NAMES: Record<string, number> = {
  TRANSPARENT: 0, WHITE: 1, DARK_GRAY: 2, LIGHT_GRAY: 3, RED: 4, LIGHT_RED: 5, GREEN: 6, LIGHT_GREEN: 7,
  BLUE: 8, LIGHT_BLUE: 9, DYNAMIC_COLOR1: 10, DYNAMIC_COLOR2: 11, DYNAMIC_COLOR3: 12, DYNAMIC_COLOR4: 13,
  DYNAMIC_COLOR5: 14, DYNAMIC_COLOR6: 15,
};

function colorIndex(arg: string): number {
  return arg in COLOR_NAMES ? COLOR_NAMES[arg] : Number(arg);
}

export function encodeText(text: string): TextToken[] {
  const out: TextToken[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\n') {
      out.push({ kind: 'newline' });
      i++;
    } else if (ch === '\\' && text[i + 1] === 'p') {
      out.push({ kind: 'paragraph' });
      i += 2;
    } else if (ch === '\\' && text[i + 1] === 'l') {
      out.push({ kind: 'scroll' });
      i += 2;
    } else if (ch === '\\' && text[i + 1] === 'n') {
      out.push({ kind: 'newline' });
      i += 2;
    } else if (ch === '{') {
      const end = text.indexOf('}', i);
      const [cmd, ...args] = text.slice(i + 1, end).trim().split(/\s+/);
      i = end + 1;
      if (cmd === 'CLEAR_TO') out.push({ kind: 'clearTo', x: Number(args[0]) });
      else if (cmd === 'COLOR') out.push({ kind: 'color', which: 'fg', index: colorIndex(args[0]) });
      else if (cmd === 'HIGHLIGHT') out.push({ kind: 'color', which: 'bg', index: colorIndex(args[0]) });
      else if (cmd === 'SHADOW') out.push({ kind: 'color', which: 'shadow', index: colorIndex(args[0]) });
      else if (cmd in EXTRA_SYMBOLS) out.push({ kind: 'glyph', id: 0x100 + EXTRA_SYMBOLS[cmd] });
      else if (cmd in NAMED && NAMED[cmd][0] === 0xf9) out.push({ kind: 'glyph', id: 0x100 + NAMED[cmd][1] });
      else if (cmd in NAMED && NAMED[cmd][0] === 0xf8) out.push({ kind: 'keypad', id: NAMED[cmd][1] });
      else if (cmd in NAMED && NAMED[cmd][0] < 0xf7) for (const id of NAMED[cmd]) out.push({ kind: 'glyph', id });
      else throw new Error(`unsupported text command {${cmd}}`);
    } else {
      // Longest match first so multi-character charmap entries win.
      let matched = false;
      for (let len = 3; len >= 1; len--) {
        const s = text.slice(i, i + len);
        if (s.length === len && s in CHARS) {
          out.push({ kind: 'glyph', id: CHARS[s] });
          i += len;
          matched = true;
          break;
        }
      }
      if (!matched) {
        out.push({ kind: 'glyph', id: CHARS['?'] });
        i++;
      }
    }
  }
  return out;
}

export interface TextStyle {
  font: Font;
  palette: readonly RGB[];
  fg: number;
  shadow: number;
  /** Palette index used to paint glyph backgrounds; null keeps whatever is underneath. */
  bg: number | null;
  letterSpacing?: number;
  lineSpacing?: number;
}

export interface TextLayout {
  endX: number;
  endY: number;
  glyphsDrawn: number;
  totalGlyphs: number;
}

/**
 * Draw encoded text. `maxGlyphs` supports the typewriter effect of the text
 * printer; paragraph/scroll tokens stop the draw (callers split pages).
 */
export function drawText(dst: Bitmap, tokens: TextToken[], x: number, y: number, style: TextStyle, maxGlyphs = Infinity): TextLayout {
  const { font, palette } = style;
  let fg = style.fg, shadow = style.shadow;
  let bg = style.bg;
  let cx = x, cy = y;
  let drawn = 0, total = 0;
  for (const t of tokens) {
    if (t.kind === 'glyph') {
      total++;
      if (drawn < maxGlyphs) {
        font.drawGlyph(dst, t.id, cx, cy, palette[fg], palette[shadow], bg === null || bg === 0 ? null : palette[bg]);
        drawn++;
        cx += font.glyphWidth(t.id) + (style.letterSpacing ?? 0);
      }
    } else if (t.kind === 'keypad') {
      total++;
      if (drawn < maxGlyphs) {
        drawKeypadIcon(dst, t.id, cx, cy);
        drawn++;
        cx += keypadWidth(t.id);
      }
    } else if (t.kind === 'newline') {
      if (drawn < maxGlyphs) {
        cx = x;
        cy += font.lineHeight + (style.lineSpacing ?? 0);
      }
    } else if (t.kind === 'clearTo') {
      if (drawn < maxGlyphs) cx = x + t.x;
    } else if (t.kind === 'color') {
      if (t.which === 'fg') fg = t.index;
      else if (t.which === 'shadow') shadow = t.index;
      else bg = t.index;
    } else {
      break;
    }
  }
  return { endX: cx, endY: cy, glyphsDrawn: drawn, totalGlyphs: total };
}

/**
 * ConvertIntToDecimalStringN: RIGHT_ALIGN pads with CHAR_SPACER, LEADING_ZEROS
 * pads with '0', LEFT_ALIGN does not pad.
 */
export function decimal(value: number, digits: number, mode: 'left' | 'right' | 'zeros' = 'left'): string {
  const s = String(Math.max(0, Math.floor(value))).slice(-digits);
  if (mode === 'left') return s;
  if (mode === 'zeros') return s.padStart(digits, '0');
  return '{UNK_SPACER}'.repeat(digits - s.length) + s;
}

export function measureText(tokens: TextToken[], font: Font, letterSpacing = 0): number {
  let w = 0, best = 0;
  for (const t of tokens) {
    if (t.kind === 'glyph') w += font.glyphWidth(t.id) + letterSpacing;
    else if (t.kind === 'keypad') w += keypadWidth(t.id);
    else if (t.kind === 'newline') { best = Math.max(best, w); w = 0; }
    else if (t.kind === 'clearTo') w = t.x;
  }
  return Math.max(best, w);
}
