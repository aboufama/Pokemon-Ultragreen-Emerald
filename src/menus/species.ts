// Choosing a Pokémon from more than Birch's bag holds (./bag.ts has three
// balls): the names in a list at the right, scrolling with the scroll arrows;
// the highlighted one in the starter circle at the left, with its name and
// level; the question in the message window. A asks to confirm it (YES /
// NO); with `random`, SELECT hops down the list and picks where it lands.

import type { Bitmap } from '../gba/bitmap';
import { bagBackdrop, displayName } from './bag';
import { print, scaled, stdWindow, textWidth } from './draw';
import { loadFront } from './gfx';
import type { MenuScreen, Rect } from './screen';

// As the moveset screen (./moves.ts) lays it out.
const LIST: Rect = { x: 128, y: 8, w: 104, h: 96 };
const NAME: Rect = { x: 8, y: 88, w: 96, h: 16 };
const PORTRAIT: [number, number] = [56, 44];

export interface SpeciesChoice {
  /** Species slugs, in the list's order. */
  roster: string[];
  /** The level it battles at, shown by its name. */
  level: number;
  prompt: string;
  confirm: string;
  /** SELECT picks one at random. */
  random?: boolean;
  start?: number;
}

/** Resolves the chosen species, or null when B backs out. */
export async function chooseSpecies(m: MenuScreen, o: SpeciesChoice): Promise<string | null> {
  const g = m.g;
  const fronts = await Promise.all(o.roster.map(loadFront));
  let sel = Math.max(0, Math.min(o.roster.length - 1, o.start ?? 0));
  const level = `{LV_2}${o.level}`;
  const removeScene = m.show((fb: Bitmap) => {
    bagBackdrop(m)(fb);
    scaled(fb, g.circle, 0, 0, 64, 64, PORTRAIT[0], PORTRAIT[1], 1);
    scaled(fb, fronts[sel], 0, 0, 64, 64, PORTRAIT[0], PORTRAIT[1], 1);
    stdWindow(fb, g, NAME.x, NAME.y, NAME.w, NAME.h);
    print(fb, g, displayName(o.roster[sel]), NAME.x, NAME.y);
    print(fb, g, level, NAME.x + NAME.w - textWidth(g, level), NAME.y);
  });
  void m.fadeTo(0);
  let removePrompt = await m.message(o.prompt);
  try {
    for (;;) {
      const items = o.roster.map((slug, i) => ({ label: displayName(slug), onHover: () => (sel = i) }));
      const { index } = await m.list(items, LIST, { start: sel, random: o.random });
      if (index === null) return null;
      sel = index;
      removePrompt();
      removePrompt = await m.message(o.confirm);
      if (await m.yesNo()) {
        await m.fadeTo(16);
        return o.roster[sel];
      }
      removePrompt();
      removePrompt = await m.message(o.prompt);
    }
  } finally {
    removePrompt();
    removeScene();
  }
}
