// Types for test_battle.mjs.
import type { Game } from './game.mjs';

export declare function testBattleArgs(text: string, speciesTable: Record<string, { id: number; const: string }>, constants: Record<string, number>): number[];
export declare function startTestBattle(game: Game, args: number[]): boolean;
