// Where to battle: a list of Hoenn places, each a battle arena, shown live
// behind the menu as the cursor moves (wind in the grass, waves, falling ash),
// the way the battle will look without the Pokémon.

import { bagBackdrop } from './bag';
import type { ListItem, MenuScreen } from './screen';
import { stdWindow, print, wrap } from './draw';
import type { Bitmap } from '../gba/bitmap';
import { BattleStage } from '../render3d/stage';

export interface Place {
  /** Arena id (src/render3d/arena/arenas.ts). */
  arena: string;
  name: string;
  about: string;
}

/** The highlighted place's arena, rendered behind the menu on the screen's 3D canvas. */
class ArenaPreview {
  private stage: BattleStage | null = null;
  private wanted = '';
  shown = '';

  constructor(private readonly m: MenuScreen) {}

  show(arena: string): void {
    this.wanted = arena;
    this.stage ??= new BattleStage(this.m.screen.canvas3d);
    const stage = this.stage;
    void stage.setEnvironment(arena).then(() => {
      if (this.stage !== stage || this.wanted !== arena) return;
      this.shown = arena;
      this.m.backdrop = stage;
    });
  }

  dispose(): void {
    this.m.backdrop = null;
    this.stage?.dispose();
    this.stage = null;
  }
}

export async function choosePlace(m: MenuScreen, places: Place[], start = 0): Promise<string | null> {
  let about = '';
  const preview = new ArenaPreview(m);
  const removeScene = m.show((fb: Bitmap) => {
    if (!preview.shown) bagBackdrop(m)(fb);
    stdWindow(fb, m.g, 8, 8, 104, 16);
    print(fb, m.g, 'WHERE TO?', 8, 8);
    stdWindow(fb, m.g, 8, 120, 224, 32);
    print(fb, m.g, about, 8, 121);
  });
  const items: ListItem[] = places.map((p) => ({
    label: p.name,
    onHover: () => {
      about = wrap(m.g, p.about, 224);
      preview.show(p.arena);
    },
  }));
  const rows = Math.min(6, places.length);
  try {
    const { index } = await m.list(items, { x: 120, y: 8, w: 112, h: rows * 16 }, { start });
    // Fade out over the live arena before it goes.
    await m.fadeTo(16);
    return index === null ? null : places[index].arena;
  } finally {
    removeScene();
    preview.dispose();
  }
}
