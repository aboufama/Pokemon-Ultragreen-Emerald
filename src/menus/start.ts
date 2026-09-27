// The game page's start screen, drawn as Emerald's main menu draws CONTINUE /
// NEW GAME / OPTION (main_menu.c): white windows in the standard frame, one
// under another on the menu's backdrop, the highlighted one lit and the others
// darkened (WIN0 around it, the darken blend outside), each window's heading
// in dark gray and the line under it in the player's color. UP and DOWN move
// the highlight; A chooses (SE_SELECT and a fade to black). It fades in from
// black, as the main menu does coming back from OPTION.

import { type Bitmap, type RGB, clear, createBitmap } from '../gba/bitmap';
import { print, stdWindow } from './draw';
import type { MenuScreen } from './screen';
import { sound } from '../audio/sound';

/** GBA 5-bit color to 8-bit. */
const rgb = (r: number, g: number, b: number): RGB => [(r << 3) | (r >> 2), (g << 3) | (g >> 2), (b << 3) | (b >> 2)];

/** graphics/interface/main_menu_bg.pal color 0: the backdrop. */
const BACKDROP = rgb(17, 18, 31);

/**
 * Task_DisplayMainMenu's text colors: 1 the player's color (a boy's blue),
 * 2 RGB(12, 12, 12) the headings, 3 RGB(26, 26, 25) their shadow.
 */
const TEXT: RGB[] = [[255, 255, 255], rgb(4, 16, 31), rgb(12, 12, 12), rgb(26, 26, 25)];

/** MENU_LEFT and MENU_WIDTH (tiles); the darken blend's BLDY. */
const LEFT = 2 * 8;
const WIDTH = 26 * 8;
const DARKEN = 7;
/** Each window: a heading and a line (4 tiles tall), a tile of border above and below, one blank between. */
const HEIGHT = 4 * 8;
const PITCH = HEIGHT + 3 * 8;
const TOP = 8;

export interface StartItem {
  label: string;
  /** The line under the heading. */
  about: string;
}

/** Resolves the index of the item chosen. */
export async function startScreen(m: MenuScreen, items: StartItem[], start = 0): Promise<number> {
  let cursor = Math.max(0, Math.min(items.length - 1, start));
  // BG0 (the windows) drawn apart from the backdrop, so the darken blend
  // touches only the windows, as BLDCNT's first target is BG0 alone.
  const bg0 = createBitmap(240, 160);
  const remove = m.show((fb: Bitmap) => {
    clear(fb, [...BACKDROP, 255]);
    clear(bg0);
    items.forEach((item, i) => {
      const y = TOP + i * PITCH;
      stdWindow(bg0, m.g, LEFT, y, WIDTH, HEIGHT);
      print(bg0, m.g, item.label, LEFT, y + 1, { palette: TEXT, fg: 2, shadow: 3 });
      print(bg0, m.g, item.about, LEFT, y + 17, { palette: TEXT, fg: 1, shadow: 3 });
    });
    // MENU_WIN_HCOORDS / MENU_WIN_VCOORDS: the frame, less a pixel of its shadow.
    const wy = TOP + cursor * PITCH;
    const win = { x0: LEFT - 8 + 1, x1: LEFT + WIDTH + 8 - 1, y0: wy - 8 + 1, y1: wy + HEIGHT + 8 - 1 };
    const d = bg0.data, out = fb.data;
    for (let y = 0; y < 160; y++) {
      const inside = y >= win.y0 && y < win.y1;
      for (let x = 0; x < 240; x++) {
        const i = (y * 240 + x) * 4;
        if (!d[i + 3]) continue;
        const k = inside && x >= win.x0 && x < win.x1 ? 0 : DARKEN;
        for (let c = 0; c < 3; c++) out[i + c] = d[i + c] - ((d[i + c] * k) >> 4);
      }
    }
  });
  try {
    await m.fadeTo(0);
    await m.clock.until(() => {
      if (m.pressed('UP') && cursor > 0) cursor--;
      else if (m.pressed('DOWN') && cursor < items.length - 1) cursor++;
      else if (m.pressed('A')) return true;
      return false;
    });
    sound.playSE('se_select');
    await m.fadeTo(16);
    return cursor;
  } finally {
    remove();
  }
}
