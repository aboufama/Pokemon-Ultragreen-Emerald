// Test battles (platform/game/remake_test.c): a wild battle started from
// anywhere in the game, for the game page (?battle=), platform/tools/run.mjs
// and tools/remake/run.mjs (a script's "battle").
//
//   const args = testBattleArgs('BLAZIKEN:50,SWAMPERT:50,GRASS', speciesTable, constants);
//   while (!startTestBattle(game, args)) game.frame();
//
// The text names the player's Pokémon and the wild one with their levels
// (5 if left out), and the place (BATTLE_ENVIRONMENT_*; the map's if left out).
// `speciesTable` is src/data/generated/species.json, `constants` the game's
// constants the build writes (public/game/remake_state.json).

const ENVIRONMENT_OF_MAP = 0xff;

export function testBattleArgs(text, speciesTable, constants) {
  const ids = new Map(Object.values(speciesTable).map((s) => [s.const, s.id]));
  const [player, wild, place] = String(text).split(',');
  const mon = (part) => {
    const [name, level] = (part ?? '').split(':');
    const id = ids.get(`SPECIES_${name.toUpperCase()}`);
    if (id === undefined) throw new Error(`test battle "${text}": no species ${name}`);
    return [id, Number(level) || 5];
  };
  let env = ENVIRONMENT_OF_MAP;
  if (place) {
    env = constants[`BATTLE_ENVIRONMENT_${place.toUpperCase()}`];
    if (env === undefined) {
      const places = Object.keys(constants).filter((k) => k.startsWith('BATTLE_ENVIRONMENT_')).map((k) => k.slice('BATTLE_ENVIRONMENT_'.length));
      throw new Error(`test battle "${text}": no place ${place} (${places.join(', ')})`);
    }
  }
  return [...mon(player), ...mon(wild), env];
}

/** Start it if the game can yet (it has its save blocks once the copyright screen is up): call before each frame until true. */
export function startTestBattle(game, args) {
  return !!game.exports().RemakeTestBattle(...args);
}
