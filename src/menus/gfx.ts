// Graphics of the menus around the battles, extracted from the decomp
// (tools/extract/extract_gfx.py extract_menus): Birch's bag, the Poké Balls
// and the pointing hand, the starter circle, the standard window frame, the
// type icons and labels of menu_info.png, the list cursor and scroll arrows.

import { type Bitmap, type RGB, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { type Font, type FontName, loadAllFonts } from '../gba/font';
import { GFX_META } from '../data';

export interface MenuGfx {
  fonts: Record<FontName, Font>;
  starterBg: Bitmap;
  /** Four 32x32 frames stacked: ball still, tilted, tilted the other way, the hand. */
  pokeballs: Bitmap;
  circle: Bitmap;
  frame: Bitmap;
  menuInfo: Bitmap;
  arrow: Bitmap;
  scroll: Bitmap;
  /** The arrow a message shows while it waits for A (8 wide, sampled 16 tall at y 0/1/2). */
  downArrow: Bitmap;
  /** Standard window text colors: 1 white, 2 dark gray, 3 light gray, 4 red. */
  text: RGB[];
}

let cache: Promise<MenuGfx> | null = null;

export function loadMenuGfx(): Promise<MenuGfx> {
  cache ??= (async () => {
    const png = (name: string) => loadBitmap(asset(`gba/menu/${name}.png`));
    const [fonts, starterBg, pokeballs, circle, frame, menuInfo, arrow, scroll, downArrow] = await Promise.all([
      loadAllFonts(), png('starter_bg'), png('pokeball_select'), png('starter_circle'), png('frame_1'), png('menu_info'), png('arrow_cursor'), png('scroll_indicator'), png('down_arrow'),
    ]);
    return { fonts, starterBg, pokeballs, circle, frame, menuInfo, arrow, scroll, downArrow, text: GFX_META.menuTextPalette };
  })();
  return cache;
}

/** Front sprites (first frame of front.png), by species. */
const fronts = new Map<string, Promise<Bitmap>>();
export function loadFront(slug: string): Promise<Bitmap> {
  let p = fronts.get(slug);
  if (!p) {
    p = loadBitmap(asset(`gba/pokemon/${slug}/front.png`));
    fronts.set(slug, p);
  }
  return p;
}
