// Movesets for a battle: every move a species can know at a level (its
// level-up moves up to that level, as the Move Relearner teaches them, plus
// TMs, HMs and tutor moves) that the battle engine resolves, and random sets
// drawn from them.

import { MOVES, SPECIES, type MoveData } from '../data';
import { isSupportedMove } from './engine';

/** Moves `slug` can know at `level` that the engine plays properly, in learn order (level-up first). */
export function movePool(slug: string, level: number): MoveData[] {
  const sp = SPECIES[slug];
  if (!sp) return [];
  const consts = [...sp.learnset.filter((l) => l.level <= level).map((l) => l.move), ...(sp.teachable ?? [])];
  return [...new Set(consts)].map((c) => MOVES[c]).filter((m): m is MoveData => !!m && isSupportedMove(m));
}

/** Rough power for comparing moves: multi-hit moves by their usual hits, fixed and computed ones by what they do at level 50. */
export function effectivePower(m: MoveData): number {
  switch (m.effect) {
    case 'EFFECT_MULTI_HIT': return m.power * 3;
    case 'EFFECT_DOUBLE_HIT': case 'EFFECT_TWINEEDLE': return m.power * 2;
    case 'EFFECT_LEVEL_DAMAGE': return 60;
    case 'EFFECT_DRAGON_RAGE': return 45;
    case 'EFFECT_SONICBOOM': return 25;
    case 'EFFECT_HIDDEN_POWER': return 70;
    case 'EFFECT_RETURN': return 102;
    default: return m.power;
  }
}

/** Move name as the engine and the URL take it (LEAF_BLADE). */
export const moveKey = (m: MoveData): string => m.const.replace(/^MOVE_/, '');

/**
 * Four random moves that make a fair set: an attack of the species' main
 * type, an attack of another type, and the rest mostly attacks (stronger ones
 * more often) with at most one status move.
 */
export function randomMoveset(slug: string, level: number, random: () => number = Math.random): string[] {
  const pool = movePool(slug, level);
  const types = SPECIES[slug]?.types ?? [];
  const chosen: MoveData[] = [];
  const take = (list: MoveData[], weight: (m: MoveData) => number = () => 1) => {
    const free = list.filter((m) => !chosen.includes(m));
    if (!free.length) return false;
    const total = free.reduce((s, m) => s + weight(m), 0);
    let r = random() * total;
    for (const m of free) {
      r -= weight(m);
      if (r <= 0) {
        chosen.push(m);
        return true;
      }
    }
    chosen.push(free[free.length - 1]);
    return true;
  };
  // Stronger attacks come up more often (a 90-power move five times as often as a 40-power one; above 90 no more).
  const strength = (m: MoveData) => (Math.min(90, Math.max(20, effectivePower(m))) / 40) ** 2;
  const attacks = pool.filter((m) => m.power > 0);
  const status = pool.filter((m) => m.power === 0);
  // An attack of its main type (fire for Blaziken), then one of another type.
  if (!take(attacks.filter((m) => m.type === types[0]), strength)) take(attacks.filter((m) => types.includes(m.type)), strength);
  take(attacks.filter((m) => m.type !== types[0]), strength);
  let statusMoves = 0;
  while (chosen.length < Math.min(4, pool.length)) {
    const wantStatus = statusMoves === 0 && status.length > 0 && random() < 0.4;
    if (wantStatus && take(status)) statusMoves++;
    else if (!take(attacks, strength) && !take(status)) break;
  }
  return chosen.map(moveKey);
}
