// Test battles (platform/game/remake_test.c): a wild battle started from
// anywhere in the game, for the game page (?battle=, its demo battles),
// platform/tools/run.mjs and tools/remake/run.mjs (a script's "battle").
//
//   const args = testBattleArgs('BLAZIKEN:50:BLAZE_KICK/SLASH,SWAMPERT:50,GRASS', data, constants);
//   while (!startTestBattle(game, args)) game.frame();
//
// The text names the player's Pokémon and the wild one, each with its level
// (5 if left out) and its moves (/-separated, up to four; the ones it knows at
// its level if left out), and the place (BATTLE_ENVIRONMENT_*; the map's if
// left out). `data` is src/data's generated species and moves
// ({ species, moves }: species.json and moves.json), `constants` the game's
// constants the build writes (public/game/remake_state.json). The battle
// starts over when it ends, or, with args.once, stays over:
// testBattleOutcome() then tells how it ended (B_OUTCOME_*).
//
// The battle music starts with the battle. A page that draws its own
// transition first (the demo battles: the remake's, over the arena) holds
// the battle while it plays, the music already playing, as the game's
// battle start waits for the field's transition:
//
//   testBattleTransition(game, true);
//   while (!startTestBattle(game, args)) game.frame();
//   ...frames while the transition plays...
//   testBattleTransition(game, false);  // the battle starts

const ENVIRONMENT_OF_MAP = 0xff;

export function testBattleArgs(text, data, constants) {
  const speciesIds = new Map(Object.values(data.species).map((s) => [s.const, s.id]));
  const moveIds = new Map(Object.values(data.moves).map((m) => [m.const, m.id]));
  const [player, wild, place] = String(text).split(',');
  const mon = (part) => {
    const [name, level, moves] = (part ?? '').split(':');
    const species = speciesIds.get(`SPECIES_${name.toUpperCase()}`);
    if (species === undefined) throw new Error(`test battle "${text}": no species ${name}`);
    const ids = (moves ? moves.split('/') : []).filter(Boolean).slice(0, 4).map((m) => {
      const key = m.toUpperCase().replace(/^MOVE_/, '');
      const id = moveIds.get(`MOVE_${key}`);
      if (id === undefined) throw new Error(`test battle "${text}": no move ${m}`);
      return id;
    });
    return { species, level: Number(level) || 5, moves: [...ids, 0, 0, 0, 0].slice(0, 4) };
  };
  let environment = ENVIRONMENT_OF_MAP;
  if (place) {
    environment = constants[`BATTLE_ENVIRONMENT_${place.toUpperCase()}`];
    if (environment === undefined) {
      const places = Object.keys(constants).filter((k) => k.startsWith('BATTLE_ENVIRONMENT_')).map((k) => k.slice('BATTLE_ENVIRONMENT_'.length));
      throw new Error(`test battle "${text}": no place ${place} (${places.join(', ')})`);
    }
  }
  return { player: mon(player), wild: mon(wild), environment, once: false };
}

/** Start it if the game can yet (it has its save blocks once the copyright screen is up): call before each frame until true. */
export function startTestBattle(game, args) {
  const e = game.exports();
  e.RemakeTestBattleMoves(0, ...args.player.moves);
  e.RemakeTestBattleMoves(1, ...args.wild.moves);
  return !!e.RemakeTestBattle(args.player.species, args.player.level, args.wild.species, args.wild.level, args.environment, args.once ? 1 : 0);
}

/** Whether the page's transition is playing: a test battle started meanwhile waits for it to end. */
export function testBattleTransition(game, running) {
  game.exports().RemakeTestBattleTransition(running ? 1 : 0);
}

/** How a battle started once ended (B_OUTCOME_*: won, lost, ran...), or 0 while it runs. */
export function testBattleOutcome(game) {
  return game.exports().RemakeTestBattleOutcome() >>> 0;
}
