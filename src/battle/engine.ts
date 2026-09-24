// Gen 3 battle rules for single battles, ported from pokeemerald
// (CalculateBaseDamage, Cmd_critcalc/typecalc/adjustnormaldamage,
// accuracy check, stat stages). The engine produces a script of steps that
// the battle scene presents (messages, move animations, HP changes...).

import { type MoveData, type SpeciesData, MOVES, TYPES, move as moveByName, species as speciesBySlug } from '../data';

export type Side = 'player' | 'opponent';
export type StatKey = 'attack' | 'defense' | 'speed' | 'spAttack' | 'spDefense' | 'accuracy' | 'evasion';
export type Status = 'none' | 'burn';

const STAT_NAMES: Record<StatKey, string> = {
  attack: 'ATTACK', defense: 'DEFENSE', speed: 'SPEED', spAttack: 'SP. ATK', spDefense: 'SP. DEF', accuracy: 'accuracy', evasion: 'evasiveness',
};

// gStatStageRatios / sAccuracyStageRatios (index = stage + 6)
const STAT_STAGE_RATIOS: [number, number][] = [[10, 40], [10, 35], [10, 30], [10, 25], [10, 20], [10, 15], [10, 10], [15, 10], [20, 10], [25, 10], [30, 10], [35, 10], [40, 10]];
const ACC_STAGE_RATIOS: [number, number][] = [[33, 100], [36, 100], [43, 100], [50, 100], [60, 100], [75, 100], [1, 1], [133, 100], [166, 100], [2, 1], [233, 100], [133, 50], [3, 1]];
const CRIT_CHANCE = [16, 8, 4, 3, 2];
const HIGH_CRIT_EFFECTS = new Set(['EFFECT_HIGH_CRITICAL', 'EFFECT_BLAZE_KICK', 'EFFECT_POISON_TAIL', 'EFFECT_SKY_ATTACK']);
const NATURES = ['HARDY', 'LONELY', 'BRAVE', 'ADAMANT', 'NAUGHTY', 'BOLD', 'DOCILE', 'RELAXED', 'IMPISH', 'LAX', 'TIMID', 'HASTY', 'SERIOUS', 'JOLLY', 'NAIVE', 'MODEST', 'MILD', 'QUIET', 'BASHFUL', 'RASH', 'CALM', 'GENTLE', 'SASSY', 'CAREFUL', 'QUIRKY'];
const NATURE_STATS: (keyof Stats)[] = ['attack', 'defense', 'speed', 'spAttack', 'spDefense'];

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export interface MoveSlotState {
  move: MoveData;
  pp: number;
  maxPp: number;
}

export interface BattleMon {
  species: SpeciesData;
  name: string;
  level: number;
  gender: 'male' | 'female' | null;
  nature: number;
  stats: Stats;
  hp: number;
  exp: number;
  moves: MoveSlotState[];
  stages: Record<StatKey, number>;
  status: Status;
  critStage: number;
  shiny: boolean;
}

/** Deterministic xorshift RNG (the scene seeds it; tests replay battles). */
export class Rng {
  constructor(private state = 0x1234567) {}
  next(): number {
    let x = this.state | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x;
    return (x >>> 0) & 0xffff;
  }
  below(n: number): number {
    return this.next() % n;
  }
}

// ---------------------------------------------------------------------------
// Pokémon creation

export function expForLevel(growth: string, n: number): number {
  if (n <= 1) return 0;
  const n3 = n * n * n;
  switch (growth) {
    case 'GROWTH_FAST': return Math.floor((4 * n3) / 5);
    case 'GROWTH_MEDIUM_FAST': return n3;
    case 'GROWTH_MEDIUM_SLOW': return Math.floor((6 * n3) / 5) - 15 * n * n + 100 * n - 140;
    case 'GROWTH_SLOW': return Math.floor((5 * n3) / 4);
    case 'GROWTH_ERRATIC':
      if (n <= 50) return Math.floor((n3 * (100 - n)) / 50);
      if (n <= 68) return Math.floor((n3 * (150 - n)) / 100);
      if (n <= 98) return Math.floor((n3 * Math.floor((1911 - 10 * n) / 3)) / 500);
      return Math.floor((n3 * (160 - n)) / 100);
    case 'GROWTH_FLUCTUATING':
      if (n <= 15) return Math.floor((n3 * (Math.floor((n + 1) / 3) + 24)) / 50);
      if (n <= 36) return Math.floor((n3 * (n + 14)) / 50);
      return Math.floor((n3 * (Math.floor(n / 2) + 32)) / 50);
    default: return n3;
  }
}

export function calcStats(sp: SpeciesData, level: number, nature: number, iv = 31, ev = 0): Stats {
  const b = sp.baseStats;
  const core = (base: number) => Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  const up = NATURE_STATS[Math.floor(nature / 5)];
  const down = NATURE_STATS[nature % 5];
  const other = (key: keyof Stats, base: number) => {
    let v = core(base) + 5;
    if (up !== down) {
      if (key === up) v = Math.floor((v * 110) / 100);
      if (key === down) v = Math.floor((v * 90) / 100);
    }
    return v;
  };
  return {
    hp: core(b.hp) + level + 10,
    attack: other('attack', b.attack),
    defense: other('defense', b.defense),
    speed: other('speed', b.speed),
    spAttack: other('spAttack', b.spAttack),
    spDefense: other('spDefense', b.spDefense),
  };
}

/** GiveBoxMonInitialMoveset: the last four distinct moves learned up to `level`. */
export function defaultMoves(sp: SpeciesData, level: number): MoveData[] {
  const moves: string[] = [];
  for (const l of sp.learnset) {
    if (l.level > level) break;
    if (moves.includes(l.move)) continue;
    if (moves.length === 4) moves.shift();
    moves.push(l.move);
  }
  return moves.map((m) => MOVES[m]).filter(Boolean);
}

export interface MonOptions {
  level?: number;
  moves?: string[];
  nature?: number;
  gender?: 'male' | 'female' | null;
  shiny?: boolean;
  /** Progress toward the next level (0..1). */
  expProgress?: number;
}

export function createMon(slug: string, opts: MonOptions = {}): BattleMon {
  const sp = speciesBySlug(slug);
  const level = opts.level ?? 50;
  const nature = opts.nature ?? 0;
  const stats = calcStats(sp, level, nature);
  const moves = (opts.moves?.length ? opts.moves.map((m) => moveByName(m)) : defaultMoves(sp, level)).slice(0, 4);
  const gender = opts.gender !== undefined ? opts.gender : sp.genderRatio === 255 ? null : sp.genderRatio === 254 ? 'female' : 'male';
  return {
    species: sp,
    name: sp.name,
    level,
    gender,
    nature,
    stats,
    hp: stats.hp,
    exp: Math.floor(expForLevel(sp.growthRate, level) + (opts.expProgress ?? 0) * (expForLevel(sp.growthRate, level + 1) - expForLevel(sp.growthRate, level))),
    moves: moves.map((m) => ({ move: m, pp: m.pp, maxPp: m.pp })),
    stages: { attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0, accuracy: 0, evasion: 0 },
    status: 'none',
    critStage: 0,
    shiny: opts.shiny ?? false,
  };
}

export function natureName(n: number): string {
  return NATURES[n] ?? 'HARDY';
}

// ---------------------------------------------------------------------------
// Turn script

export type Step =
  | { kind: 'message'; text: string; wait?: boolean }
  | { kind: 'move'; side: Side; move: MoveData; hits: number[]; missed: boolean }
  | { kind: 'hp'; side: Side; from: number; to: number; cause?: 'burn' }
  | { kind: 'stat'; side: Side; stat: StatKey; delta: number }
  | { kind: 'faint'; side: Side }
  /** EXP gain; the scene fills the bar and announces each level-up. */
  | { kind: 'exp'; gained: number; levelUps: number[] }
  | { kind: 'end'; winner: Side | 'escaped' };

export type Action = { kind: 'move'; index: number } | { kind: 'run' };

export class BattleEngine {
  readonly rng: Rng;
  lastMove: Record<Side, MoveData | null> = { player: null, opponent: null };
  over = false;

  constructor(readonly player: BattleMon, readonly opponent: BattleMon, readonly wild = true, seed = Date.now()) {
    this.rng = new Rng(seed | 1);
  }

  mon(side: Side): BattleMon {
    return side === 'player' ? this.player : this.opponent;
  }

  /** "Wild BLAZIKEN" / "Foe BLAZIKEN" / "BLAZIKEN" (B_ATK_NAME_WITH_PREFIX). */
  displayName(side: Side): string {
    const m = this.mon(side);
    if (side === 'player') return m.name;
    return `${this.wild ? 'Wild' : 'Foe'} ${m.name}`;
  }

  effectiveSpeed(m: BattleMon): number {
    const [n, d] = STAT_STAGE_RATIOS[m.stages.speed + 6];
    return Math.floor((m.stats.speed * n) / d);
  }

  /** Enemy AI: a random move with PP left (wild Pokémon in Gen 3 pick at random). */
  chooseOpponentMove(): number {
    const usable = this.opponent.moves.map((s, i) => (s.pp > 0 ? i : -1)).filter((i) => i >= 0);
    return usable.length ? usable[this.rng.below(usable.length)] : 0;
  }

  runTurn(action: Action): Step[] {
    const steps: Step[] = [];
    if (this.over) return steps;
    if (action.kind === 'run') {
      steps.push({ kind: 'message', text: 'Got away safely!\\p', wait: true }, { kind: 'end', winner: 'escaped' });
      this.over = true;
      return steps;
    }
    const oppIndex = this.chooseOpponentMove();
    const pMove = this.player.moves[action.index];
    const oMove = this.opponent.moves[oppIndex];
    const order: [Side, MoveSlotState][] = [['player', pMove], ['opponent', oMove]];
    const pPri = pMove.move.priority, oPri = oMove.move.priority;
    const pSpd = this.effectiveSpeed(this.player), oSpd = this.effectiveSpeed(this.opponent);
    const opponentFirst = oPri > pPri || (oPri === pPri && (oSpd > pSpd || (oSpd === pSpd && this.rng.below(2) === 0)));
    if (opponentFirst) order.reverse();

    for (const [side, slot] of order) {
      if (this.over) break;
      if (this.mon(side).hp <= 0) continue;
      this.useMove(side, slot, steps);
      if (this.checkFaints(steps)) break;
    }
    if (!this.over) this.endOfTurn(steps);
    return steps;
  }

  private other(side: Side): Side {
    return side === 'player' ? 'opponent' : 'player';
  }

  private useMove(side: Side, slot: MoveSlotState, steps: Step[]): void {
    const atk = this.mon(side);
    const defSide = this.other(side);
    const def = this.mon(defSide);
    let move = slot.move;
    slot.pp = Math.max(0, slot.pp - 1);
    steps.push({ kind: 'message', text: `${this.displayName(side)} used\n${move.name}!` });

    if (move.effect === 'EFFECT_MIRROR_MOVE') {
      const copied = this.lastMove[defSide];
      if (!copied || copied.effect === 'EFFECT_MIRROR_MOVE') {
        steps.push({ kind: 'message', text: 'But it failed!' });
        return;
      }
      move = copied;
      steps.push({ kind: 'message', text: `${this.displayName(side)} used\n${move.name}!` });
    }
    this.lastMove[side] = move;

    // Accuracy check (moves with accuracy 0 never miss).
    const selfTarget = move.target === 'MOVE_TARGET_USER';
    if (!selfTarget && move.accuracy > 0) {
      const stage = Math.max(-6, Math.min(6, atk.stages.accuracy - def.stages.evasion));
      const [n, d] = ACC_STAGE_RATIOS[stage + 6];
      const calc = Math.floor((move.accuracy * n) / d);
      if (this.rng.below(100) + 1 > calc) {
        steps.push({ kind: 'move', side, move, hits: [], missed: true });
        steps.push({ kind: 'message', text: `${this.displayName(side)}'s\nattack missed!` });
        return;
      }
    }

    if (move.power === 0) {
      steps.push({ kind: 'move', side, move, hits: [], missed: false });
      this.applyStatusEffect(side, move, steps);
      return;
    }

    // Damage (possibly multi-hit).
    const hitCount = move.effect === 'EFFECT_DOUBLE_HIT' ? 2 : 1;
    const hits: number[] = [];
    let crit = false;
    let effectiveness = 10;
    const moveStep: Step = { kind: 'move', side, move, hits, missed: false };
    steps.push(moveStep);
    const hpSteps: Step[] = [];
    for (let h = 0; h < hitCount && def.hp > 0; h++) {
      const r = this.damage(atk, def, move);
      crit ||= r.crit;
      effectiveness = r.effectiveness;
      if (r.effectiveness === 0) break;
      const from = def.hp;
      def.hp = Math.max(0, def.hp - r.damage);
      hits.push(from - def.hp);
      hpSteps.push({ kind: 'hp', side: defSide, from, to: def.hp });
    }
    steps.push(...hpSteps);
    if (effectiveness === 0) {
      steps.push({ kind: 'message', text: `It doesn't affect\n${this.displayName(defSide)}…` });
      return;
    }
    if (crit) steps.push({ kind: 'message', text: 'A critical hit!' });
    if (effectiveness > 10) steps.push({ kind: 'message', text: "It's super effective!" });
    else if (effectiveness < 10) steps.push({ kind: 'message', text: "It's not very effective…" });
    if (hitCount > 1) steps.push({ kind: 'message', text: `Hit ${hits.length} time(s)!` });

    // Secondary effects.
    if (def.hp > 0 && move.secondaryEffectChance > 0 && this.rng.below(100) < move.secondaryEffectChance) {
      if ((move.effect === 'EFFECT_BURN_HIT' || move.effect === 'EFFECT_BLAZE_KICK') && def.status === 'none' && !def.species.types.includes('TYPE_FIRE')) {
        def.status = 'burn';
        steps.push({ kind: 'message', text: `${this.displayName(defSide)} was burned!` });
      }
    }
    if (move.effect === 'EFFECT_OVERHEAT') this.changeStat(side, 'spAttack', -2, steps);
  }

  private applyStatusEffect(side: Side, move: MoveData, steps: Step[]): void {
    const defSide = this.other(side);
    switch (move.effect) {
      case 'EFFECT_BULK_UP':
        this.changeStat(side, 'attack', 1, steps);
        this.changeStat(side, 'defense', 1, steps);
        return;
      case 'EFFECT_ATTACK_UP': return this.changeStat(side, 'attack', 1, steps);
      case 'EFFECT_ATTACK_UP_2': return this.changeStat(side, 'attack', 2, steps);
      case 'EFFECT_DEFENSE_UP': return this.changeStat(side, 'defense', 1, steps);
      case 'EFFECT_DEFENSE_UP_2': return this.changeStat(side, 'defense', 2, steps);
      case 'EFFECT_SPEED_UP_2': return this.changeStat(side, 'speed', 2, steps);
      case 'EFFECT_SPECIAL_ATTACK_UP': return this.changeStat(side, 'spAttack', 1, steps);
      case 'EFFECT_ATTACK_DOWN': return this.changeStat(defSide, 'attack', -1, steps);
      case 'EFFECT_DEFENSE_DOWN': return this.changeStat(defSide, 'defense', -1, steps);
      case 'EFFECT_ACCURACY_DOWN': return this.changeStat(defSide, 'accuracy', -1, steps);
      case 'EFFECT_SPEED_DOWN': return this.changeStat(defSide, 'speed', -1, steps);
      case 'EFFECT_FOCUS_ENERGY': {
        const m = this.mon(side);
        if (m.critStage >= 2) steps.push({ kind: 'message', text: 'But it failed!' });
        else {
          m.critStage = 2;
          steps.push({ kind: 'message', text: `${this.displayName(side)} is getting\npumped!` });
        }
        return;
      }
      default:
        steps.push({ kind: 'message', text: 'But it failed!' });
    }
  }

  private changeStat(side: Side, stat: StatKey, delta: number, steps: Step[]): void {
    const m = this.mon(side);
    const before = m.stages[stat];
    const after = Math.max(-6, Math.min(6, before + delta));
    const name = this.displayName(side);
    if (after === before) {
      steps.push({ kind: 'message', text: delta > 0 ? `${name}'s ${STAT_NAMES[stat]}\nwon't go higher!` : `${name}'s ${STAT_NAMES[stat]}\nwon't go lower!` });
      return;
    }
    m.stages[stat] = after;
    steps.push({ kind: 'stat', side, stat, delta });
    const verb = delta > 0 ? (delta > 1 ? 'sharply rose!' : 'rose!') : delta < -1 ? 'harshly fell!' : 'fell!';
    steps.push({ kind: 'message', text: `${name}'s ${STAT_NAMES[stat]}\n${verb}` });
  }

  /** CalculateBaseDamage + crit + typecalc (STAB, type chart) + random factor. */
  damage(atk: BattleMon, def: BattleMon, move: MoveData): { damage: number; crit: boolean; effectiveness: number } {
    const type = move.type;
    const physical = TYPES.values[type] < TYPES.values.TYPE_MYSTERY;
    // Crit
    let critStage = atk.critStage + (HIGH_CRIT_EFFECTS.has(move.effect) ? 1 : 0);
    critStage = Math.min(4, critStage);
    const crit = this.rng.below(CRIT_CHANCE[critStage]) === 0;
    const critMul = crit ? 2 : 1;
    let power = move.power;
    if (type === 'TYPE_FIRE' && atk.species.abilities[0] === 'BLAZE' && atk.hp <= Math.floor(atk.stats.hp / 3)) power = Math.floor((150 * power) / 100);

    const mod = (value: number, stage: number) => {
      const [n, d] = STAT_STAGE_RATIOS[stage + 6];
      return Math.floor((value * n) / d);
    };
    const aKey = physical ? 'attack' : 'spAttack';
    const dKey = physical ? 'defense' : 'spDefense';
    const aStage = crit && atk.stages[aKey] < 0 ? 0 : atk.stages[aKey];
    const dStage = crit && def.stages[dKey] > 0 ? 0 : def.stages[dKey];
    let dmg = mod(atk.stats[aKey], aStage) * power;
    dmg *= Math.floor((2 * atk.level) / 5) + 2;
    dmg = Math.floor(dmg / mod(def.stats[dKey], dStage));
    dmg = Math.floor(dmg / 50);
    if (physical && atk.status === 'burn') dmg = Math.floor(dmg / 2);
    if (physical && dmg === 0) dmg = 1;
    dmg += 2;
    dmg *= critMul;

    // typecalc: STAB then each matching type-chart entry.
    if (atk.species.types.includes(type)) dmg = Math.floor((dmg * 15) / 10);
    let effectiveness = 10;
    for (const e of TYPES.chart) {
      if (e.attacker === 'TYPE_FORESIGHT' || e.attacker === 'TYPE_ENDTABLE') continue;
      if (e.attacker !== type || !def.species.types.includes(e.defender)) continue;
      const mul = TYPES.multipliers[e.multiplier];
      dmg = Math.floor((dmg * mul) / 10);
      if (dmg === 0 && mul !== 0) dmg = 1;
      effectiveness = Math.floor((effectiveness * mul) / 10);
    }
    // ApplyRandomDmgMultiplier
    if (dmg > 0) {
      dmg = Math.floor((dmg * (100 - this.rng.below(16))) / 100);
      if (dmg === 0) dmg = 1;
    }
    return { damage: dmg, crit, effectiveness };
  }

  private checkFaints(steps: Step[]): boolean {
    if (this.opponent.hp <= 0) {
      steps.push({ kind: 'faint', side: 'opponent' });
      steps.push({ kind: 'message', text: `${this.displayName('opponent')}\nfainted!\\p`, wait: true });
      const gained = Math.floor((this.opponent.species.expYield * this.opponent.level) / 7) * (this.wild ? 1 : 1.5);
      steps.push(...this.gainExp(Math.floor(gained)));
      steps.push({ kind: 'end', winner: 'player' });
      this.over = true;
      return true;
    }
    if (this.player.hp <= 0) {
      steps.push({ kind: 'faint', side: 'player' });
      steps.push({ kind: 'message', text: `${this.player.name}\nfainted!\\p`, wait: true });
      steps.push({ kind: 'message', text: 'BRENDAN is out of\nusable POKéMON!\\p', wait: true });
      steps.push({ kind: 'message', text: 'BRENDAN whited out!\\p', wait: true });
      steps.push({ kind: 'end', winner: 'opponent' });
      this.over = true;
      return true;
    }
    return false;
  }

  private gainExp(amount: number): Step[] {
    const m = this.player;
    const steps: Step[] = [{ kind: 'message', text: `${m.name} gained\n${amount} EXP. Points!\\p`, wait: true }];
    const levelUps: number[] = [];
    m.exp += amount;
    while (m.level < 100 && m.exp >= expForLevel(m.species.growthRate, m.level + 1)) {
      m.level++;
      levelUps.push(m.level);
      const before = m.stats.hp;
      m.stats = calcStats(m.species, m.level, m.nature);
      m.hp += m.stats.hp - before;
    }
    steps.push({ kind: 'exp', gained: amount, levelUps });
    return steps;
  }

  private endOfTurn(steps: Step[]): void {
    for (const side of ['player', 'opponent'] as Side[]) {
      const m = this.mon(side);
      if (m.status === 'burn' && m.hp > 0) {
        const from = m.hp;
        m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(m.stats.hp / 8)));
        steps.push({ kind: 'message', text: `${this.displayName(side)} is hurt\nby its burn!` });
        steps.push({ kind: 'hp', side, from, to: m.hp, cause: 'burn' });
        if (this.checkFaints(steps)) return;
      }
    }
  }

  expFraction(): number {
    const m = this.player;
    const lo = expForLevel(m.species.growthRate, m.level);
    const hi = expForLevel(m.species.growthRate, m.level + 1);
    return hi > lo ? Math.min(1, (m.exp - lo) / (hi - lo)) : 0;
  }
}
