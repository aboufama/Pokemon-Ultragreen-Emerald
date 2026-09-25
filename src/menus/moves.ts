// A Pokémon's four moves, set the Emerald way. The moveset view shows it in
// the starter circle with its four moves (PP), RANDOM and DONE, and the
// highlighted move's description; a move opens the Move Relearner-style list
// (TYPE / PP / POWER / ACCURACY beside every move it can know) and the choice
// plays out as "1, 2, and… Poof!", forgetting the old move for the new one.

import { MOVES, type MoveData } from '../data';
import type { Bitmap } from '../gba/bitmap';
import { effectivePower, movePool, moveKey, randomMoveset } from '../battle/moveset';
import { bagBackdrop, displayName } from './bag';
import { infoLabel, print, scaled, stdWindow, textWidth, typeIcon, wrap } from './draw';
import { loadFront } from './gfx';
import type { ListItem, MenuScreen, Rect } from './screen';

const LIST: Rect = { x: 128, y: 8, w: 104, h: 96 };
const NAME: Rect = { x: 8, y: 88, w: 96, h: 16 };
const STATS: Rect = { x: 8, y: 8, w: 96, h: 64 };
const DESCRIPTION: Rect = { x: 8, y: 120, w: 224, h: 32 };
const PORTRAIT: [number, number] = [56, 44];

const moveOf = (key: string): MoveData | undefined => MOVES[`MOVE_${key}`];

/** A move's description in the bottom window: two lines of the normal font, the narrow one if it runs longer. */
function describe(m: MenuScreen, text: string): (fb: Bitmap) => void {
  const normal = wrap(m.g, text, DESCRIPTION.w, 'normal');
  const narrow = normal.split('\n').length > 2;
  const lines = narrow ? wrap(m.g, text, DESCRIPTION.w, 'narrow') : normal;
  return (fb) => {
    stdWindow(fb, m.g, DESCRIPTION.x, DESCRIPTION.y, DESCRIPTION.w, DESCRIPTION.h);
    print(fb, m.g, lines, DESCRIPTION.x, DESCRIPTION.y + 1, { font: narrow ? 'narrow' : 'normal' });
  };
}

/** The TYPE / PP / POWER / ACCURACY panel. */
function stats(m: MenuScreen, move: MoveData): (fb: Bitmap) => void {
  const power = move.power === 0 ? '---' : move.effect === 'EFFECT_LEVEL_DAMAGE' ? 'LV' : String(move.power > 1 ? move.power : effectivePower(move));
  const accuracy = move.accuracy ? String(move.accuracy) : '---';
  return (fb) => {
    const { x, y } = STATS;
    stdWindow(fb, m.g, STATS.x, STATS.y, STATS.w, STATS.h);
    infoLabel(fb, m.g, 'TYPE', x, y + 2);
    typeIcon(fb, m.g, move.type, x + 56, y + 2);
    const row = (label: 'PP' | 'POWER' | 'ACCURACY', value: string, i: number) => {
      infoLabel(fb, m.g, label, x, y + 2 + i * 16);
      print(fb, m.g, value, x + STATS.w - textWidth(m.g, value), y + 1 + i * 16);
    };
    row('PP', String(move.pp), 1);
    row('POWER', power, 2);
    row('ACCURACY', accuracy, 3);
  };
}

export interface MovesResult {
  moves: string[];
  /** Set when the wild Pokémon's moves were edited from this screen (SELECT). */
  foeMoves?: string[];
}

export interface MovesOptions {
  slug: string;
  level: number;
  moves: string[];
  /** The wild Pokémon, whose moves SELECT opens. */
  foe?: { slug: string; moves: string[] };
}

/** Resolves the moves (and the foe's when edited), or null when B backs out. */
export async function editMoves(m: MenuScreen, o: MovesOptions): Promise<MovesResult | null> {
  const g = m.g;
  const name = displayName(o.slug);
  const front = await loadFront(o.slug);
  let moves = [...o.moves];
  let foeMoves = o.foe ? [...o.foe.moves] : undefined;
  let hover: (fb: Bitmap) => void = () => {};
  let listView = false;

  const removeScene = m.show((fb) => {
    bagBackdrop(m)(fb);
    if (!listView) {
      scaled(fb, g.circle, 0, 0, 64, 64, PORTRAIT[0], PORTRAIT[1], 1);
      scaled(fb, front, 0, 0, 64, 64, PORTRAIT[0], PORTRAIT[1], 1);
      stdWindow(fb, g, NAME.x, NAME.y, NAME.w, NAME.h);
      print(fb, g, name, NAME.x, NAME.y);
      print(fb, g, `{LV_2}${o.level}`, NAME.x + NAME.w - textWidth(g, `{LV_2}${o.level}`), NAME.y);
    }
    hover(fb);
  });

  const items = (): ListItem[] => [
    ...moves.map((key) => {
      const mv = moveOf(key)!;
      return { label: mv.name, detail: String(mv.pp), onHover: () => (hover = describe(m, mv.description || mv.name)) };
    }),
    { label: 'RANDOM', onHover: () => (hover = describe(m, `Four random moves ${name} can know.`)) },
    {
      label: 'DONE',
      onHover: () => (hover = describe(m, o.foe ? `Battle with these moves!\n{SELECT_BUTTON} The wild POKéMON's moves` : 'Battle with these moves!')),
    },
  ];

  let cursor = 0;
  try {
    for (;;) {
      const list = items();
      const { index, button } = await m.list(list, LIST, { start: cursor, extra: (b) => b === 'START' || (b === 'SELECT' && !!o.foe) });
      if (index === null) return null;
      cursor = index;
      if (button === 'START' || index === list.length - 1) return { moves, foeMoves };
      if (button === 'SELECT' && o.foe) {
        const foe = await editMoves(m, { slug: o.foe.slug, level: o.level, moves: foeMoves ?? o.foe.moves });
        if (foe) foeMoves = foe.moves;
        continue;
      }
      if (index === list.length - 2) {
        moves = randomMoveset(o.slug, o.level);
        continue;
      }
      // Replace a move from the list of every move it can know.
      listView = true;
      const pool = movePool(o.slug, o.level);
      const poolItems: ListItem[] = pool.map((mv) => ({
        label: mv.name,
        onHover: () => {
          const s = stats(m, mv), d = describe(m, mv.description || mv.name);
          hover = (fb) => { s(fb); d(fb); };
        },
      }));
      const current = pool.findIndex((mv) => moveKey(mv) === moves[index]);
      const pick = await m.list(poolItems, LIST, { start: Math.max(0, current) });
      if (pick.index !== null) {
        const next = pool[pick.index];
        const old = moveOf(moves[index])!;
        if (moves.includes(moveKey(next))) {
          (await m.message(`${name} already knows\n${next.name}.`, { rect: DESCRIPTION, wait: true }))();
        } else if (moveKey(next) !== moves[index]) {
          hover = () => {};
          listView = false;
          (await m.message(`1, 2, and… … … Poof!\\p${name} forgot\n${old.name}.\\pAnd…\\p${name} learned\n${next.name}!`, { rect: DESCRIPTION, wait: true }))();
          moves = moves.map((k, i) => (i === index ? moveKey(next) : k));
        }
      }
      listView = false;
    }
  } finally {
    removeScene();
  }
}
