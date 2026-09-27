// Types for test_battle.mjs.
import type { Game } from './game.mjs';

export interface TestMon {
  /** The game's species number (SPECIES_*). */
  species: number;
  level: number;
  /** Four move numbers (MOVE_*); a 0 first: the moves it knows at its level. */
  moves: number[];
}

export interface TestBattle {
  player: TestMon;
  wild: TestMon;
  /** BATTLE_ENVIRONMENT_*, or 0xFF for the map's. */
  environment: number;
  /** Stay over when it ends (testBattleOutcome), instead of starting over. */
  once: boolean;
}

export declare function testBattleArgs(
  text: string,
  data: { species: Record<string, { id: number; const: string }>; moves: Record<string, { id: number; const: string }> },
  constants: Record<string, number>,
): TestBattle;
export declare function startTestBattle(game: Game, args: TestBattle): boolean;
export declare function testBattleTransition(game: Game, running: boolean): void;
export declare function testBattleOutcome(game: Game): number;
