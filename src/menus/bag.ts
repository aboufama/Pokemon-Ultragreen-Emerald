// Choosing a Pokémon from Professor Birch's bag, as starter_choose.c does it:
// three Poké Balls in the bag on the grass, the selected one wobbling, the
// pointing hand bobbing above it, and a darkened label with the Pokédex
// category and name. A grows the circle and the Pokémon out of the ball up
// to the top of the screen and asks to confirm with YES / NO.

import { SPECIES } from '../data';
import type { Bitmap } from '../gba/bitmap';
import { blit } from '../gba/bitmap';
import { gbaSin } from '../battle/clock';
import { centerX, darken, print, scaled, sprite } from './draw';
import { loadFront } from './gfx';
import type { MenuScreen } from './screen';
import { sound } from '../audio/sound';

// sPokeballCoords, sCursorCoords, sStarterLabelCoords (tiles) in starter_choose.c.
const BALLS: [number, number][] = [[60, 64], [120, 88], [180, 64]];
const HAND: [number, number][] = [[60, 32], [120, 56], [180, 32]];
const LABELS: [number, number][] = [[0, 9], [16, 10], [8, 4]];
const CENTER: [number, number] = [120, 64];
// sAnim_Pokeball_Moving as [frame, duration] (tile 16 = frame 1, tile 32 = frame 2).
const WOBBLE: [number, number][] = [[1, 4], [0, 4], [2, 4], [0, 4], [1, 4], [0, 4], [2, 4], [0, 4], [0, 32], [1, 8], [0, 8], [2, 8], [0, 8], [1, 8], [0, 8], [2, 8], [0, 8]];
const WOBBLE_LENGTH = WOBBLE.reduce((s, [, d]) => s + d, 0);

function wobbleFrame(t: number): number {
  let k = t % WOBBLE_LENGTH;
  for (const [frame, d] of WOBBLE) {
    if (k < d) return frame;
    k -= d;
  }
  return 0;
}

export const displayName = (slug: string) => SPECIES[slug]?.name ?? slug.toUpperCase();

/** The darkened background every other setup screen stands on. */
export function bagBackdrop(m: MenuScreen): (fb: Bitmap) => void {
  return (fb) => {
    blit(fb, m.g.starterBg, 0, 0, 240, 160, 0, 0);
    darken(fb, 0, 0, 240, 160, 9);
  };
}

export interface BagOptions {
  /** Species in the three balls, left to right. */
  roster: string[];
  prompt: string;
  confirm: string;
  /** SELECT picks a ball at random. */
  random?: boolean;
  start?: number;
}

/** Resolves the chosen species, or null when B backs out. */
export async function chooseFromBag(m: MenuScreen, o: BagOptions): Promise<string | null> {
  const g = m.g;
  const fronts = await Promise.all(o.roster.map(loadFront));
  let sel = Math.max(0, Math.min(o.roster.length - 1, o.start ?? 1));
  let wobbleStart = m.clock.frame;
  let handPhase = 0;
  let label = true;
  let reveal: { x: number; y: number; circle: number; mon: number } | null = null;

  const removeScene = m.show((fb) => {
    blit(fb, g.starterBg, 0, 0, 240, 160, 0, 0);
    for (let i = 0; i < o.roster.length; i++) {
      const frame = i === sel && !reveal ? wobbleFrame(m.clock.frame - wobbleStart) : 0;
      sprite(fb, g.pokeballs, frame, 32, BALLS[i][0], BALLS[i][1]);
    }
    if (!reveal) sprite(fb, g.pokeballs, 3, 32, HAND[sel][0], HAND[sel][1] + gbaSin(handPhase, 8));
    if (label && !reveal) {
      // The label window (13x4 tiles) with the darken blend inside WIN0.
      const [lx, ly] = LABELS[sel];
      darken(fb, lx * 8 - 4, ly * 8, 13 * 8 + 8, 32, 7);
      const slug = o.roster[sel];
      const category = `${SPECIES[slug]?.category ?? ''} POKéMON`;
      const name = displayName(slug);
      print(fb, g, category, lx * 8 + centerX(g, category, 'narrow', 104), ly * 8 + 1, { font: 'narrow', fg: 1, shadow: 3 });
      print(fb, g, name, lx * 8 + centerX(g, name, 'normal', 104), ly * 8 + 17, { fg: 1, shadow: 3 });
    }
    if (reveal) {
      scaled(fb, g.circle, 0, 0, 64, 64, reveal.x, reveal.y, reveal.circle);
      scaled(fb, fronts[sel], 0, 0, 64, 64, reveal.x, reveal.y, reveal.mon);
    }
  });
  void m.fadeTo(0);
  let open = true;
  void m.clock.task(() => {
    handPhase = (handPhase + 4) & 255;
    return !open;
  });

  let removePrompt = await m.message(o.prompt);
  try {
    for (;;) {
      let action = 'a' as 'a' | 'b' | 'random';
      await m.clock.until(() => {
        if (m.pressed('LEFT') && sel > 0) {
          sel--;
          wobbleStart = m.clock.frame;
        } else if (m.pressed('RIGHT') && sel < o.roster.length - 1) {
          sel++;
          wobbleStart = m.clock.frame;
        } else if (m.pressed('A')) return true;
        else if (m.pressed('B')) {
          sound.playSE('se_select');
          action = 'b';
          return true;
        } else if (o.random && m.pressed('SELECT')) {
          sound.playSE('se_select');
          action = 'random';
          return true;
        }
        return false;
      });
      if (action === 'b') return null;
      if (action === 'random') {
        // A few quick hops of the hand across the balls, then it settles.
        const hops = 5 + Math.floor(Math.random() * o.roster.length);
        for (let i = 0; i < hops; i++) {
          sel = (sel + 1) % o.roster.length;
          wobbleStart = m.clock.frame;
          await m.clock.frames(6);
        }
      }

      // The circle and the Pokémon grow out of the ball and move up to the
      // center (affine scale 20 -> 320 and 16 -> 256 over 15 frames, 4 px
      // across and 2 px up per frame).
      const r = { x: BALLS[sel][0], y: BALLS[sel][1], circle: 20 / 256, mon: 16 / 256 };
      reveal = r;
      label = false;
      removePrompt();
      let f = 0;
      await m.clock.until(() => {
        f++;
        if (f <= 15) {
          r.circle = (20 + 20 * f) / 256;
          r.mon = (16 + 16 * f) / 256;
        }
        r.x += Math.sign(CENTER[0] - r.x) * Math.min(4, Math.abs(CENTER[0] - r.x));
        r.y += Math.sign(CENTER[1] - r.y) * Math.min(2, Math.abs(CENTER[1] - r.y));
        return f >= 15 && r.x === CENTER[0] && r.y === CENTER[1];
      });
      removePrompt = await m.message(o.confirm);
      const yes = await m.yesNo();
      if (yes) {
        await m.fadeTo(16);
        return o.roster[sel];
      }
      removePrompt();
      reveal = null;
      label = true;
      removePrompt = await m.message(o.prompt);
    }
  } finally {
    open = false;
    removePrompt();
    removeScene();
  }
}
