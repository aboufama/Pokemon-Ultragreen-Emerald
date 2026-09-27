// The game page's demo battles: a wild battle set up on the GBA screen the
// way the battle playtest sets one up (src/demo/playtest.ts: your Pokémon,
// the wild one, the moves, the place, with Professor Birch's lab playing),
// then played in the compiled game itself (a test battle,
// platform/game/remake_test.c) and drawn in 3D by the remake layer, and
// another after it. Every Pokémon the remake draws in 3D can battle, at
// level 50.
//
// The battle starts as the game starts one from the field: its music starts
// with the transition, which here is the remake's own over the chosen
// place's arena (src/menus/places.ts), and the battle once it ends. When it
// is over the game stays where the battle left it (its victory music still
// playing after a win) under the question of another battle. B on the first
// screen goes back to the start screen.

import { MOVES, SPECIES } from '../data';
import { getSpeciesProfile, profiledSpecies } from '../pokemon/registry';
import { movePool, moveKey, randomMoveset } from '../battle/moveset';
import { bagBackdrop, displayName } from '../menus/bag';
import { chooseSpecies } from '../menus/species';
import { editMoves } from '../menus/moves';
import { type Place, choosePlace } from '../menus/places';
import type { MenuScreen } from '../menus/screen';
import { ARENAS } from '../render3d/arena';
import { sound } from '../audio/sound';
import type { Game } from '../../platform/host/game.mjs';
import { type TestBattle, testBattleOutcome, testBattleTransition } from '../../platform/host/test_battle.mjs';

const LEVEL = 50;
const STORE = 'ultragreen.demo.v1';

/** Places to battle: every arena, by its Hoenn place (src/render3d/arena/arenas.ts). */
const PLACES: Place[] = Object.entries(ARENAS).map(([arena, d]) => ({ arena, name: d.name, about: d.about }));

/** The battle environment each arena stands for (the remake draws the arena for it: src/remake/layer.ts). */
const ENVIRONMENTS: Record<string, string> = { grass: 'BATTLE_ENVIRONMENT_GRASS', water: 'BATTLE_ENVIRONMENT_WATER', cave: 'BATTLE_ENVIRONMENT_CAVE' };

/** What the demo needs of the page: the game running on the screen, and the menu screen over it. */
export interface DemoConsole {
  readonly game: Game;
  /** The game's constants (public/game/remake_state.json). */
  readonly constants: Record<string, number>;
  /** Run the game at its frame rate (its frames and its sound), or hold it. */
  run(on: boolean): void;
  /** Start a test battle in the game, before the first frame it can. */
  battle(args: TestBattle): void;
  /** Resolves after the first of the game's frames that `done()` holds after. */
  until(done: () => boolean): Promise<void>;
  /** The game's battle screen is up and drawn in 3D (its models loaded). */
  battleShown(): boolean;
  /** The game's volume (0..1), over `seconds`. */
  fade(level: number, seconds?: number): void;
  /** The menu screen over the game, taking the buttons. */
  openMenu(): MenuScreen;
  /** The menu goes; the game shows and takes the buttons. */
  closeMenu(): void;
  /** For tests: the screen the demo is on. */
  step: string;
}

interface Saved {
  you?: string;
  foe?: string;
  moves?: string[];
  arena?: string;
}
function load(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '{}') as Saved;
  } catch {
    return {};
  }
}
function save(s: Saved): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // Private mode or blocked storage: the setup just isn't remembered.
  }
}

/** What the screen after a battle says about how it went (B_OUTCOME_*). */
function outcomeText(c: DemoConsole, outcome: number, you: string, foe: string): string {
  const k = c.constants;
  if (outcome === k.B_OUTCOME_WON) return `You defeated the wild\n${displayName(foe)}!`;
  if (outcome === k.B_OUTCOME_LOST) return `${displayName(you)} fainted…`;
  if (outcome === k.B_OUTCOME_CAUGHT) return `Gotcha!\n${displayName(foe)} was caught!`;
  if (outcome === k.B_OUTCOME_MON_FLED || outcome === k.B_OUTCOME_MON_TELEPORTED) return `The wild ${displayName(foe)} fled!`;
  if (outcome === k.B_OUTCOME_DREW) return 'The battle ended in a draw.';
  return 'Got away safely!';
}

/** Runs the demo battles until the player backs out of the first screen. */
export async function demoBattles(c: DemoConsole): Promise<void> {
  // Every Pokémon drawn in 3D, in the Pokédex's order.
  const roster = profiledSpecies()
    .filter((s) => SPECIES[s])
    .sort((a, b) => SPECIES[a].nationalDex - SPECIES[b].nationalDex);
  const showcase: Record<string, string[]> = {};
  await Promise.all(roster.map(async (s) => (showcase[s] = ((await getSpeciesProfile(s)).showcaseMoves ?? []).map((m) => m.replace(/^MOVE_/, '')))));
  const knows = (slug: string, moves: string[] | undefined) => {
    const pool = new Set(movePool(slug, LEVEL).map(moveKey));
    return !!moves?.length && moves.every((m) => pool.has(m) || showcase[slug]?.includes(m));
  };
  const firstMoves = (slug: string) => (showcase[slug]?.length === 4 ? showcase[slug] : randomMoveset(slug, LEVEL));
  const valid = (s: string | undefined) => (s && roster.includes(s) ? s : null);
  // The game's numbers for a battle (SPECIES_*, MOVE_*).
  const speciesId = (slug: string) => SPECIES[slug].id;
  const moveIds = (keys: string[]) => [...keys.map((k) => MOVES[`MOVE_${k}`].id), 0, 0, 0, 0].slice(0, 4);
  const argsFor = (b: { you: string; foe: string; moves: string[]; foeMoves: string[]; arena: string }): TestBattle => ({
    player: { species: speciesId(b.you), level: LEVEL, moves: moveIds(b.moves) },
    wild: { species: speciesId(b.foe), level: LEVEL, moves: moveIds(b.foeMoves) },
    environment: c.constants[ENVIRONMENTS[b.arena] ?? 'BATTLE_ENVIRONMENT_GRASS'],
    once: true,
  });

  const saved = load();
  let you = valid(saved.you) ?? roster[0];
  let foe = valid(saved.foe) ?? roster[1] ?? roster[0];
  let moves = knows(you, saved.moves) ? saved.moves! : firstMoves(you);
  let foeMoves: string[] | null = null;
  let arena = PLACES.some((p) => p.arena === saved.arena) ? saved.arena! : 'grass';

  c.step = 'you';
  for (;;) {
    const m = c.openMenu();
    // Setting up plays Professor Birch's lab (after the last song's fade-out).
    sound.playBGM('mus_birch_lab');
    if (c.step === 'you') {
      m.fadeAmount = 16;
      const pick = await chooseSpecies(m, {
        roster,
        level: LEVEL,
        start: roster.indexOf(you),
        prompt: 'Which POKéMON will you\nbattle with?',
        confirm: 'Do you choose this POKéMON?',
      });
      if (!pick) {
        sound.fadeOutBGM(4);
        return;
      }
      if (pick !== you) moves = firstMoves(pick);
      you = pick;
      c.step = 'foe';
    } else if (c.step === 'foe') {
      m.fadeAmount = 16;
      const pick = await chooseSpecies(m, {
        roster,
        level: LEVEL,
        start: roster.indexOf(foe),
        random: true,
        prompt: 'Which wild POKéMON will\nyou battle? {SELECT_BUTTON} Random',
        confirm: 'Battle this POKéMON?',
      });
      if (!pick) {
        c.step = 'you';
        continue;
      }
      if (pick !== foe) foeMoves = null;
      foe = pick;
      c.step = 'moves';
    } else if (c.step === 'moves') {
      m.fadeAmount = 16;
      void m.fadeTo(0);
      const r = await editMoves(m, { slug: you, level: LEVEL, moves, foe: { slug: foe, moves: foeMoves ?? randomMoveset(foe, LEVEL) } });
      await m.fadeTo(16);
      if (!r) {
        c.step = 'foe';
        continue;
      }
      moves = r.moves;
      if (r.foeMoves) foeMoves = r.foeMoves;
      c.step = 'place';
    } else if (c.step === 'place') {
      m.fadeAmount = 16;
      void m.fadeTo(0);
      const wildMoves = foeMoves ?? randomMoveset(foe, LEVEL);
      // The battle starts with the transition: the game's battle music
      // plays through it, the battle waiting for it to end.
      let started = false;
      const start = (place: string, transition: boolean) => {
        started = true;
        sound.stopBGM();
        c.fade(1);
        testBattleTransition(c.game, transition);
        c.battle(argsFor({ you, foe, moves, foeMoves: wildMoves, arena: place }));
        c.run(true);
      };
      const pick = await choosePlace(m, PLACES, Math.max(0, PLACES.findIndex((p) => p.arena === arena)), { startBattle: (place) => start(place, true) });
      if (!pick) {
        c.step = 'moves';
        continue;
      }
      arena = pick;
      save({ you, foe, moves, arena });
      if (!started) start(arena, false);
      // Battle, then offer another.
      for (;;) {
        c.step = 'battle';
        testBattleTransition(c.game, false);
        // The battle screen comes up behind the black menu screen: the menu
        // goes, and the battle plays in the game.
        await c.until(() => c.battleShown());
        c.closeMenu();
        await c.until(() => testBattleOutcome(c.game) !== 0);
        const outcome = testBattleOutcome(c.game);
        c.step = 'after';
        const won = outcome === c.constants.B_OUTCOME_WON;
        // A win keeps the game's victory music; otherwise the lab's comes back.
        if (!won) {
          c.fade(0, 0.3);
          sound.playBGM('mus_birch_lab');
        }
        const after = c.openMenu();
        after.fadeAmount = 16;
        const removeBg = after.show(bagBackdrop(after));
        void after.fadeTo(0);
        const removeMsg = await after.message(`${outcomeText(c, outcome, you, foe)}\\pBattle again?`);
        const again = await after.yesNo();
        removeMsg();
        if (again) {
          await after.fadeTo(16);
          removeBg();
          start(arena, false);
          continue;
        }
        // Back to the setup: the game's music fades out first.
        c.fade(0, 0.4);
        await after.fadeTo(16);
        removeBg();
        c.run(false);
        break;
      }
      c.step = 'you';
    }
  }
}
