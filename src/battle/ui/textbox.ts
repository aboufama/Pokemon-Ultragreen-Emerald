// Battle text box (BG0): message box, action menu and move menu pages.
// Window rectangles, fonts and colors come from sStandardBattleWindowTemplates
// and sTextOnWindowsInfo_Normal in the decomp (src/battle_bg.c, src/battle_message.c).

import { type Bitmap, type RGB, blit, createBitmap, loadBitmap } from '../../gba/bitmap';
import { asset } from '../../gba/assets';
import { type Font, type FontName, type TextToken, decimal, drawText, encodeText } from '../../gba/font';
import { GFX_META, TYPES } from '../../data';

export type TextboxPage = 'message' | 'action' | 'move';

const PAGE_SCROLL: Record<TextboxPage, number> = { message: 0, action: 160, move: 320 };

interface WindowSpec {
  /** Tile coordinates within the 32x64 BG0 map. */
  left: number;
  top: number;
  font: FontName;
  x: number;
  y: number;
  fg: number;
  bg: number;
  shadow: number;
  palette: 'textbox' | 'window';
}

// B_WIN_* entries used by the single battle UI.
const WIN: Record<string, WindowSpec> = {
  msg: { left: 2, top: 15, font: 'normal', x: 0, y: 1, fg: 1, bg: 15, shadow: 6, palette: 'textbox' },
  actionPrompt: { left: 1, top: 35, font: 'normal', x: 1, y: 1, fg: 1, bg: 15, shadow: 6, palette: 'textbox' },
  actionMenu: { left: 17, top: 35, font: 'normal', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
  move1: { left: 2, top: 55, font: 'narrow', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
  move2: { left: 11, top: 55, font: 'narrow', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
  move3: { left: 2, top: 57, font: 'narrow', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
  move4: { left: 11, top: 57, font: 'narrow', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
  pp: { left: 21, top: 55, font: 'narrow', x: 0, y: 1, fg: 12, bg: 14, shadow: 11, palette: 'window' },
  ppRemaining: { left: 25, top: 55, font: 'normal', x: 2, y: 1, fg: 12, bg: 14, shadow: 11, palette: 'window' },
  moveType: { left: 21, top: 57, font: 'narrow', x: 0, y: 1, fg: 13, bg: 14, shadow: 15, palette: 'window' },
};

const BATTLE_MENU_TEXT = 'FIGHT{CLEAR_TO 56}BAG\nPOKéMON{CLEAR_TO 56}RUN';

/** Map an index bitmap (red = index * 16) through a palette. */
function colorize(indexed: Bitmap, palette: readonly RGB[]): Bitmap {
  const out = createBitmap(indexed.width, indexed.height);
  for (let i = 0; i < indexed.data.length; i += 4) {
    if (!indexed.data[i + 3]) continue;
    const c = palette[Math.round(indexed.data[i] / 16)];
    out.data[i] = c[0];
    out.data[i + 1] = c[1];
    out.data[i + 2] = c[2];
    out.data[i + 3] = 255;
  }
  return out;
}

/**
 * GetCurrentPpToMaxPpState: 3 = normal, 0 = at most half, 1 = at most a
 * quarter, 2 = empty. SetPpNumbersPaletteInMoveSelection copies the matching
 * pair from text_pp.pal into palette 5 entries 12 (fg) and 11 (shadow).
 */
export function ppState(pp: number, maxPp: number): number {
  if (maxPp === pp) return 3;
  if (maxPp <= 2) return pp > 1 ? 3 : 2 - pp;
  if (maxPp <= 7) return pp > 2 ? 3 : 2 - pp;
  if (pp === 0) return 2;
  if (pp <= Math.floor(maxPp / 4)) return 1;
  if (pp > Math.floor(maxPp / 2)) return 3;
  return 0;
}

export interface MoveSlot {
  name: string;
  pp: number;
  maxPp: number;
  type: string; // TYPE_* constant
}

export class BattleTextbox {
  page: TextboxPage = 'message';
  /** Message shown in the message page (already paginated by the caller). */
  message: TextToken[] = [];
  visibleGlyphs = Infinity;
  /**
   * Clock frame at which the message started waiting for input ("more"
   * arrow shown), or null.
   */
  promptSince: number | null = null;
  actionPrompt: TextToken[] = [];
  actionCursor = 0;
  moveCursor = 0;
  moves: (MoveSlot | null)[] = [null, null, null, null];

  private constructor(
    private readonly box: Bitmap,
    private readonly cursor: Bitmap,
    private readonly arrow: Bitmap,
    private readonly fonts: Record<FontName, Font>,
  ) {}

  static async load(fonts: Record<FontName, Font>): Promise<BattleTextbox> {
    const [box, cursor, arrow] = await Promise.all([
      loadBitmap(asset('gba/battle_interface/textbox.png')),
      loadBitmap(asset('gba/battle_interface/cursor.png')),
      // Battle windows use the alternate arrow (gTextFlags.useAlternateDownArrow).
      loadBitmap(asset('gba/fonts/down_arrow_alt.png')),
    ]);
    return new BattleTextbox(box, cursor, colorize(arrow, GFX_META.textboxPalette), fonts);
  }

  setMessage(text: string): void {
    this.message = encodeText(text);
    this.visibleGlyphs = Infinity;
    this.promptSince = null;
  }

  setActionPrompt(monName: string): void {
    this.actionPrompt = encodeText(`What will\n${monName} do?`);
  }

  private ppPalette: RGB[] = [...GFX_META.windowTextPalette];

  private palette(w: WindowSpec): readonly RGB[] {
    return w.palette === 'textbox' ? GFX_META.textboxPalette : this.ppPalette;
  }

  private applyPpColors(slot: MoveSlot | null): void {
    this.ppPalette = [...GFX_META.windowTextPalette];
    if (!slot) return;
    const state = ppState(slot.pp, slot.maxPp);
    this.ppPalette[12] = GFX_META.windowTextPpPalette[state * 2];
    this.ppPalette[11] = GFX_META.windowTextPpPalette[state * 2 + 1];
  }

  private text(fb: Bitmap, w: WindowSpec, tokens: TextToken[] | string, scroll: number, maxGlyphs = Infinity, overrides?: Partial<WindowSpec>) {
    const spec = { ...w, ...overrides };
    const toks = typeof tokens === 'string' ? encodeText(tokens) : tokens;
    return drawText(
      fb,
      toks,
      spec.left * 8 + spec.x,
      spec.top * 8 - scroll + spec.y,
      { font: this.fonts[spec.font], palette: this.palette(spec), fg: spec.fg, bg: null, shadow: spec.shadow },
      maxGlyphs,
    );
  }

  draw(fb: Bitmap, frame: number): void {
    const scroll = PAGE_SCROLL[this.page];
    blit(fb, this.box, 0, scroll, 240, 160, 0, 0);

    if (this.page === 'message') {
      const layout = this.text(fb, WIN.msg, this.message, scroll, this.visibleGlyphs);
      if (this.promptSince !== null && layout.glyphsDrawn >= layout.totalGlyphs) {
        // DrawDownArrow: redrawn every 9 frames from source rows
        // sDownArrowYCoords = {0, 1, 2, 1}, placed at (x, y - 2) after the text.
        const step = Math.floor(Math.max(0, frame - this.promptSince) / 9) & 3;
        blit(fb, this.arrow, 0, [0, 1, 2, 1][step], 8, 16, layout.endX, layout.endY - 2);
      }
    } else if (this.page === 'action') {
      this.text(fb, WIN.actionPrompt, this.actionPrompt, scroll);
      this.text(fb, WIN.actionMenu, BATTLE_MENU_TEXT, scroll);
      const c = this.actionCursor;
      blit(fb, this.cursor, 0, 0, 8, 16, (7 * (c & 1) + 16) * 8, (35 + (c & 2)) * 8 - scroll);
    } else {
      const wins = [WIN.move1, WIN.move2, WIN.move3, WIN.move4];
      this.moves.forEach((m, i) => this.text(fb, wins[i], m ? m.name : '-', scroll));
      const c = this.moveCursor;
      blit(fb, this.cursor, 0, 0, 8, 16, (9 * (c & 1) + 1) * 8, (55 + (c & 2)) * 8 - scroll);
      const sel = this.moves[c];
      this.applyPpColors(sel);
      if (sel) {
        this.text(fb, WIN.pp, 'PP ', scroll);
        this.text(fb, WIN.ppRemaining, `${decimal(sel.pp, 2, 'right')}/${decimal(sel.maxPp, 2, 'right')}`, scroll);
        this.text(fb, WIN.moveType, 'TYPE/', scroll);
        this.drawTypeName(fb, sel.type, scroll);
      }
    }
  }

  /** "TYPE/" is narrow, the type name switches to FONT_NORMAL (MoveSelectionDisplayMoveType). */
  private drawTypeName(fb: Bitmap, type: string, scroll: number): void {
    const w = WIN.moveType;
    const prefix = encodeText('TYPE/');
    let x = w.left * 8 + w.x;
    for (const t of prefix) if (t.kind === 'glyph') x += this.fonts.narrow.glyphWidth(t.id);
    drawText(fb, encodeText(TYPES.names[type] ?? '???'), x, w.top * 8 - scroll + w.y, {
      font: this.fonts.normal, palette: GFX_META.windowTextPalette, fg: w.fg, bg: null, shadow: w.shadow,
    });
  }
}
