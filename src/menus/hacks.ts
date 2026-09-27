// The HACKS menu, drawn as Emerald's OPTION menu draws itself (option_menu.c):
// the heading window at the top and the settings window under it on the
// menu's backdrop, a row per hack with its name at the left and its
// choices at the right (the chosen one in red), the highlighted row lit
// and the rest darkened (WIN0 around it, the darken blend outside); here a
// line under them says what the highlighted row does, and the rows scroll
// when there are more than fit. UP and DOWN move (wrapping, as OPTION's do),
// LEFT and RIGHT change a setting, A does a help (heal, items, money) or
// leaves on CANCEL, B leaves. Changes take effect at once.

import { type Bitmap, type RGB, blit, clear, createBitmap, fillRect } from '../gba/bitmap';
import { print, stdWindow, textWidth } from './draw';
import type { MenuScreen } from './screen';
import { sound } from '../audio/sound';
import { EXP_MULTIPLIERS, type HackHelps, type Hacks, SPEEDS } from '../game/hacks';

/** GBA 5-bit color to 8-bit. */
const rgb = (r: number, g: number, b: number): RGB => [(r << 3) | (r >> 2), (g << 3) | (g >> 2), (b << 3) | (b >> 2)];

/** sOptionMenuBg_Pal: the backdrop. */
const BACKDROP = rgb(17, 18, 31);

/**
 * graphics/interface/option_menu_text.pal: 1 the windows' white, 2 and 3 the
 * names (and their shadow), 4 and 5 the chosen choice (TEXT_COLOR_RED,
 * TEXT_COLOR_LIGHT_RED), 6 and 7 the others (the strings' GREEN and
 * LIGHT_GREEN).
 */
const TEXT: RGB[] = [[0, 0, 0], rgb(31, 31, 31), rgb(31, 22, 10), rgb(24, 15, 0), rgb(31, 17, 16), rgb(31, 6, 3), rgb(9, 9, 9), rgb(26, 26, 25)];

// sOptionMenuWinTemplates (tiles 2,1 26x2 and 2,5 26x14), the settings window
// here 5 rows tall, and a line under it; HighlightOptionMenuItem's WIN0 and BLDY.
const HEADER = { x: 16, y: 8, w: 208, h: 16 };
const ROWS = 5;
const LIST = { x: 16, y: 40, w: 208, h: ROWS * 16 };
const ABOUT = { x: 16, y: 136, w: 208, h: 16 };
const DARKEN = 4;
/** Where the choices go in a row: the first at 104, the last ending at 198. */
const CHOICES_X = 104, CHOICES_END = 198;

interface Row {
  label: string;
  about: string;
  /** A setting's choices and which is chosen; a help has none. */
  choices?: string[];
  chosen?: () => number;
  choose?: (i: number) => void;
  /** A help: what it says it did (or couldn't). */
  help?: () => string;
}

export interface HacksMenuOptions {
  hacks: Hacks;
  /** A setting changed (the page sets it in the game and keeps it). */
  changed: () => void;
  /** The helps, when a game is running. */
  helps?: HackHelps | null;
}

/** Resolves when the player leaves the menu (CANCEL, or B). */
export async function hacksMenu(m: MenuScreen, o: HacksMenuOptions): Promise<void> {
  const h = o.hacks;
  const set = <K extends keyof Hacks>(key: K, value: Hacks[K]) => {
    h[key] = value;
    o.changed();
  };
  const rows: Row[] = [
    {
      label: 'SPEED',
      about: 'How fast the game runs.',
      choices: SPEEDS.map((s) => `×${s}`),
      chosen: () => SPEEDS.indexOf(h.speed),
      choose: (i) => set('speed', SPEEDS[i]),
    },
    {
      label: 'EXP',
      about: 'The EXP your POKéMON gain, multiplied.',
      choices: EXP_MULTIPLIERS.map((x) => `×${x}`),
      chosen: () => EXP_MULTIPLIERS.indexOf(h.exp),
      choose: (i) => set('exp', EXP_MULTIPLIERS[i]),
    },
    {
      label: 'WILD POKéMON',
      about: 'In grass and water: none, or every step.',
      choices: ['NORMAL', 'NONE', 'EVERY STEP'],
      chosen: () => ['normal', 'never', 'always'].indexOf(h.encounters),
      choose: (i) => set('encounters', (['normal', 'never', 'always'] as const)[i]),
    },
    {
      label: 'CATCH',
      about: 'ALWAYS: every ball catches.',
      choices: ['NORMAL', 'ALWAYS'],
      chosen: () => (h.catch ? 1 : 0),
      choose: (i) => set('catch', i === 1),
    },
    {
      label: 'ONE-HIT KO',
      about: 'ON: your hits knock the foe out.',
      choices: ['OFF', 'ON'],
      chosen: () => (h.knockout ? 1 : 0),
      choose: (i) => set('knockout', i === 1),
    },
  ];
  const helps = o.helps;
  if (helps) {
    rows.push(
      {
        label: 'HEAL PARTY',
        about: "{A_BUTTON} Your POKéMON's HP and PP, full.",
        help: () => (helps.heal() ? 'Your POKéMON are fully healed!' : 'Not during a battle.'),
      },
      {
        label: 'GET ITEMS',
        about: '{A_BUTTON} RARE CANDY, POKé BALL, FULL RESTORE.',
        help: () => (helps.items() ? '99 of each went into the BAG.' : 'Start the game first.'),
      },
      {
        label: 'GET MONEY',
        about: '{A_BUTTON} The most money there is.',
        help: () => (helps.money() ? 'You have ¥999999!' : 'Start the game first.'),
      },
    );
  }
  rows.push({ label: 'CANCEL', about: 'Back.' });

  let cursor = 0;
  let top = 0;
  let said: string | null = null;
  let tick = 0;
  // BG0 (the windows' insides and their text) drawn apart from the frames and
  // the backdrop, so the darken blend touches only it, as BLDCNT's first
  // target is BG0 alone.
  const bg0 = createBitmap(240, 160);
  const remove = m.show((fb: Bitmap) => {
    tick++;
    clear(fb, [...BACKDROP, 255]);
    clear(bg0);
    // The frames are BG1's (DrawBgWindowFrames), the insides BG0's.
    for (const r of [HEADER, LIST, ABOUT]) {
      stdWindow(fb, m.g, r.x, r.y, r.w, r.h, false);
      fillRect(bg0, r.x, r.y, r.w, r.h, m.g.text[1]);
    }
    print(bg0, m.g, 'HACKS', HEADER.x + 8, HEADER.y + 1, { palette: TEXT, fg: 2, shadow: 3 });
    for (let i = 0; i < ROWS && top + i < rows.length; i++) {
      const row = rows[top + i];
      const y = LIST.y + i * 16 + 1;
      print(bg0, m.g, row.label, LIST.x + 8, y, { palette: TEXT, fg: 2, shadow: 3 });
      if (row.choices) drawChoices(bg0, m, row.choices, row.chosen!(), LIST.x, y);
    }
    const about = said ?? rows[cursor].about;
    const font = textWidth(m.g, about) > ABOUT.w ? 'narrow' : 'normal';
    print(bg0, m.g, about, ABOUT.x, ABOUT.y + 1, { palette: TEXT, fg: 6, shadow: 7, font });
    // The highlighted row lit (WIN0: x 16-224, its 16 lines), the rest darkened.
    const wy = LIST.y + (cursor - top) * 16;
    const d = bg0.data, out = fb.data;
    for (let y = 0; y < 160; y++) {
      const inside = y >= wy && y < wy + 16;
      for (let x = 0; x < 240; x++) {
        const k = (y * 240 + x) * 4;
        if (!d[k + 3]) continue;
        const dim = inside && x >= 16 && x < 224 ? 0 : DARKEN;
        for (let c = 0; c < 3; c++) out[k + c] = d[k + c] - ((d[k + c] * dim) >> 4);
      }
    }
    // More rows above or below: the scroll arrows bob at the window's edge.
    const bob = [0, 1, 2, 1][(tick >> 3) & 3];
    if (top > 0) blit(fb, m.g.scroll, 0, 16, 16, 16, LIST.x + LIST.w / 2 - 8, LIST.y - 14 - bob);
    if (top + ROWS < rows.length) blit(fb, m.g.scroll, 0, 16, 16, 16, LIST.x + LIST.w / 2 - 8, LIST.y + LIST.h - 2 + bob, { vflip: true });
  });
  try {
    await m.fadeTo(0);
    await m.clock.until(() => {
      const row = rows[cursor];
      const move = (to: number) => {
        cursor = (to + rows.length) % rows.length;
        if (cursor < top) top = cursor;
        if (cursor >= top + ROWS) top = cursor - ROWS + 1;
        said = null;
      };
      if (m.pressed('UP')) move(cursor - 1);
      else if (m.pressed('DOWN')) move(cursor + 1);
      else if (row.choices && (m.pressed('LEFT') || m.pressed('RIGHT'))) {
        const n = row.choices.length;
        row.choose!((row.chosen!() + (m.pressed('RIGHT') ? 1 : n - 1)) % n);
      } else if (m.pressed('A') && row.help) {
        sound.playSE('se_select');
        said = row.help();
      } else if ((m.pressed('A') && !row.choices) || m.pressed('B')) {
        sound.playSE('se_select');
        return true;
      }
      return false;
    });
    await m.fadeTo(16);
  } finally {
    remove();
  }
}

/**
 * A setting's choices, as OPTION draws TEXT SPEED's: spread from x 104 to
 * 198, the chosen one in red. If they don't fit, only the chosen one, as
 * FRAME's number is.
 */
function drawChoices(fb: Bitmap, m: MenuScreen, choices: string[], chosen: number, x: number, y: number): void {
  const widths = choices.map((c) => textWidth(m.g, c));
  const total = widths.reduce((a, b) => a + b, 0);
  const room = CHOICES_END - CHOICES_X;
  const style = (i: number) => (i === chosen ? { fg: 4, shadow: 5 } : { fg: 6, shadow: 7 });
  if (total + 4 * (choices.length - 1) > room) {
    print(fb, m.g, choices[chosen], x + CHOICES_X, y, { palette: TEXT, ...style(chosen) });
    return;
  }
  const gap = choices.length > 1 ? (room - total) / (choices.length - 1) : 0;
  let cx = CHOICES_X;
  choices.forEach((c, i) => {
    print(fb, m.g, c, x + Math.round(cx), y, { palette: TEXT, ...style(i) });
    cx += widths[i] + gap;
  });
}
