// Gen 3 battle rules for single battles, ported from pokeemerald
// (CalculateBaseDamage, Cmd_critcalc/typecalc/adjustnormaldamage,
// accuracy check, stat stages). The engine produces a script of steps that
// the battle scene presents (messages, move animations, HP changes...).
//
// Move effects resolved the Gen 3 way: stat-stage moves and stat changes on
// hits, burns, multi-hit (2-5 and 2), recoil, draining, fixed damage (Seismic
// Toss, Dragon Rage, SonicBoom), Hidden Power (from the IVs), Return, False
// Swipe, Protect / Detect / Endure, Hyper Beam's recharge turn, Focus Punch's
// focus, Revenge, Eruption, Foresight, Mirror Move, Focus Energy, Struggle.
// Other damaging moves hit plainly (the paralysis, poison, sleep, freeze,
// flinch and confusion they may cause are not modelled, and two-turn moves
// strike at once); isSupportedMove() says which moves a moveset may use.

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
  /** Must skip its next turn (Hyper Beam). */
  recharging: boolean;
  /** Protect / Detect / Endure used in a row (each success halves the next chance). */
  protectStreak: number;
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
    recharging: false,
    protectStreak: 0,
  };
}

export function natureName(n: number): string {
  return NATURES[n] ?? 'HARDY';
}

// ---------------------------------------------------------------------------
// Move effects

type StatChange = [who: 'self' | 'foe', stat: StatKey, stages: number];
const up = (stat: StatKey, n = 1): StatChange => ['self', stat, n];
const down = (stat: StatKey, n = 1): StatChange => ['foe', stat, -n];

/** Status moves that change stat stages. */
const STAT_MOVES: Record<string, StatChange[]> = {
  EFFECT_ATTACK_UP: [up('attack')], EFFECT_ATTACK_UP_2: [up('attack', 2)],
  EFFECT_DEFENSE_UP: [up('defense')], EFFECT_DEFENSE_UP_2: [up('defense', 2)], EFFECT_DEFENSE_CURL: [up('defense')],
  EFFECT_SPEED_UP: [up('speed')], EFFECT_SPEED_UP_2: [up('speed', 2)],
  EFFECT_SPECIAL_ATTACK_UP: [up('spAttack')], EFFECT_SPECIAL_ATTACK_UP_2: [up('spAttack', 2)],
  EFFECT_SPECIAL_DEFENSE_UP: [up('spDefense')], EFFECT_SPECIAL_DEFENSE_UP_2: [up('spDefense', 2)],
  EFFECT_ACCURACY_UP: [up('accuracy')], EFFECT_EVASION_UP: [up('evasion')], EFFECT_MINIMIZE: [up('evasion')],
  EFFECT_BULK_UP: [up('attack'), up('defense')], EFFECT_CALM_MIND: [up('spAttack'), up('spDefense')],
  EFFECT_DRAGON_DANCE: [up('attack'), up('speed')], EFFECT_COSMIC_POWER: [up('defense'), up('spDefense')],
  EFFECT_ATTACK_DOWN: [down('attack')], EFFECT_ATTACK_DOWN_2: [down('attack', 2)],
  EFFECT_DEFENSE_DOWN: [down('defense')], EFFECT_DEFENSE_DOWN_2: [down('defense', 2)],
  EFFECT_SPEED_DOWN: [down('speed')], EFFECT_SPEED_DOWN_2: [down('speed', 2)],
  EFFECT_SPECIAL_ATTACK_DOWN: [down('spAttack')], EFFECT_SPECIAL_ATTACK_DOWN_2: [down('spAttack', 2)],
  EFFECT_SPECIAL_DEFENSE_DOWN: [down('spDefense')], EFFECT_SPECIAL_DEFENSE_DOWN_2: [down('spDefense', 2)],
  EFFECT_ACCURACY_DOWN: [down('accuracy')], EFFECT_EVASION_DOWN: [down('evasion')],
  EFFECT_TICKLE: [down('attack'), down('defense')],
};

/** Damaging moves' stat changes, at the move's secondary effect chance (always, for the self-lowering ones). */
const HIT_STAT_CHANGES: Record<string, StatChange[]> = {
  EFFECT_ATTACK_DOWN_HIT: [down('attack')], EFFECT_DEFENSE_DOWN_HIT: [down('defense')], EFFECT_SPEED_DOWN_HIT: [down('speed')],
  EFFECT_SPECIAL_ATTACK_DOWN_HIT: [down('spAttack')], EFFECT_SPECIAL_DEFENSE_DOWN_HIT: [down('spDefense')],
  EFFECT_ACCURACY_DOWN_HIT: [down('accuracy')], EFFECT_EVASION_DOWN_HIT: [down('evasion')],
  EFFECT_ATTACK_UP_HIT: [up('attack')], EFFECT_DEFENSE_UP_HIT: [up('defense')],
  EFFECT_ALL_STATS_UP_HIT: [up('attack'), up('defense'), up('speed'), up('spAttack'), up('spDefense')],
  EFFECT_OVERHEAT: [up('spAttack', -2)], EFFECT_SUPERPOWER: [up('attack', -1), up('defense', -1)],
};

/** Damage effects resolved as a plain hit here. */
const PLAIN_HITS = new Set([
  'EFFECT_HIT', 'EFFECT_HIGH_CRITICAL', 'EFFECT_ALWAYS_HIT', 'EFFECT_QUICK_ATTACK', 'EFFECT_EARTHQUAKE', 'EFFECT_BRICK_BREAK',
  'EFFECT_FACADE', 'EFFECT_PURSUIT', 'EFFECT_ROLLOUT', 'EFFECT_FURY_CUTTER', 'EFFECT_SECRET_POWER', 'EFFECT_SEMI_INVULNERABLE',
  'EFFECT_SOLAR_BEAM', 'EFFECT_SKULL_BASH', 'EFFECT_RAZOR_WIND', 'EFFECT_SKY_ATTACK', 'EFFECT_FLINCH_HIT', 'EFFECT_FREEZE_HIT',
  'EFFECT_PARALYZE_HIT', 'EFFECT_POISON_HIT', 'EFFECT_CONFUSE_HIT', 'EFFECT_TRI_ATTACK', 'EFFECT_POISON_TAIL', 'EFFECT_POISON_FANG',
  'EFFECT_THUNDER', 'EFFECT_TWISTER', 'EFFECT_GUST', 'EFFECT_FLINCH_MINIMIZE_HIT', 'EFFECT_SKY_UPPERCUT', 'EFFECT_THIEF',
  'EFFECT_KNOCK_OFF', 'EFFECT_RAPID_SPIN', 'EFFECT_WEATHER_BALL', 'EFFECT_VITAL_THROW', 'EFFECT_THRASH', 'EFFECT_UPROAR',
  'EFFECT_SMELLINGSALT', 'EFFECT_FAKE_OUT', 'EFFECT_TRAP', 'EFFECT_PAY_DAY', 'EFFECT_BURN_HIT', 'EFFECT_BLAZE_KICK',
]);
/** Damage effects with their own rule in useMove(). */
const RULED_HITS = new Set([
  'EFFECT_DOUBLE_HIT', 'EFFECT_TWINEEDLE', 'EFFECT_MULTI_HIT', 'EFFECT_RECOIL', 'EFFECT_DOUBLE_EDGE', 'EFFECT_ABSORB',
  'EFFECT_RECHARGE', 'EFFECT_FOCUS_PUNCH', 'EFFECT_HIDDEN_POWER', 'EFFECT_RETURN', 'EFFECT_LEVEL_DAMAGE', 'EFFECT_DRAGON_RAGE',
  'EFFECT_SONICBOOM', 'EFFECT_FALSE_SWIPE', 'EFFECT_REVENGE', 'EFFECT_ERUPTION',
]);
/** Status effects handled besides the stat moves. */
const RULED_STATUS = new Set(['EFFECT_PROTECT', 'EFFECT_ENDURE', 'EFFECT_FOCUS_ENERGY', 'EFFECT_FORESIGHT', 'EFFECT_MIRROR_MOVE']);

/** Whether this engine resolves the move's effect (the demo's movesets use only these). */
export function isSupportedMove(m: MoveData): boolean {
  if (m.power === 0) return !!STAT_MOVES[m.effect] || RULED_STATUS.has(m.effect);
  return PLAIN_HITS.has(m.effect) || RULED_HITS.has(m.effect) || !!HIT_STAT_CHANGES[m.effect];
}

/** Hidden Power's type order (sHiddenPowerTypes-style: the type index from the IVs' low bits). */
const HIDDEN_POWER_TYPES = ['TYPE_FIGHTING', 'TYPE_FLYING', 'TYPE_POISON', 'TYPE_GROUND', 'TYPE_ROCK', 'TYPE_BUG', 'TYPE_GHOST', 'TYPE_STEEL',
  'TYPE_FIRE', 'TYPE_WATER', 'TYPE_GRASS', 'TYPE_ELECTRIC', 'TYPE_PSYCHIC', 'TYPE_ICE', 'TYPE_DRAGON', 'TYPE_DARK'];

/** Hidden Power's type and power for IVs (HP, Atk, Def, Spe, SpA, SpD); every IV here is 31: DARK 70. */
export function hiddenPower(ivs: number[] = [31, 31, 31, 31, 31, 31]): { type: string; power: number } {
  let t = 0, p = 0;
  ivs.forEach((iv, i) => {
    t += (iv & 1) << i;
    p += ((iv >> 1) & 1) << i;
  });
  return { type: HIDDEN_POWER_TYPES[Math.floor((t * 15) / 63)], power: Math.floor((p * 40) / 63) + 30 };
}

/** sProtectSuccessRates: every Protect / Detect / Endure used in a row halves the next one's chance. */
const PROTECT_RATES = [0xffff, 0xffff / 2, 0xffff / 4, 0xffff / 8];

// ---------------------------------------------------------------------------
// Turn script

export type Step =
  | { kind: 'message'; text: string; wait?: boolean }
  | { kind: 'move'; side: Side; move: MoveData; hits: number[]; missed: boolean }
  /** An HP change; a move's hits carry the type effectiveness (10 = normal) for the hit's sound. */
  | { kind: 'hp'; side: Side; from: number; to: number; cause?: 'burn'; effectiveness?: number }
  | { kind: 'stat'; side: Side; stat: StatKey; delta: number }
  | { kind: 'faint'; side: Side }
  /** The wild Pokémon is beaten: getexp plays the victory music. */
  | { kind: 'victory' }
  /** EXP gain; the scene fills the bar and announces each level-up. */
  | { kind: 'exp'; gained: number; levelUps: number[] }
  | { kind: 'end'; winner: Side | 'escaped' };

/** A move slot, Struggle (no PP left in any move) or the turn Hyper Beam costs. */
export type Action = { kind: 'move'; index: number } | { kind: 'struggle' } | { kind: 'recharge' } | { kind: 'run' };

type Choice = MoveSlotState | 'struggle' | 'recharge';

export class BattleEngine {
  readonly rng: Rng;
  lastMove: Record<Side, MoveData | null> = { player: null, opponent: null };
  over = false;
  /** This turn: who is shielded by Protect / Detect or braced by Endure, and who has been hurt. */
  private shield: Record<Side, 'protect' | 'endure' | null> = { player: null, opponent: null };
  private hurt: Record<Side, boolean> = { player: false, opponent: false };
  /** Foresight: evasion stages no longer count against moves aimed at this side. */
  private identified: Record<Side, boolean> = { player: false, opponent: false };

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

  /** Enemy AI: a random move with PP left (wild Pokémon in Gen 3 pick at random); -1 = Struggle. */
  chooseOpponentMove(): number {
    const usable = this.opponent.moves.map((s, i) => (s.pp > 0 ? i : -1)).filter((i) => i >= 0);
    return usable.length ? usable[this.rng.below(usable.length)] : -1;
  }

  /** Whether the player has a move with PP left (else FIGHT means Struggle). */
  hasUsableMove(side: Side = 'player'): boolean {
    return this.mon(side).moves.some((s) => s.pp > 0);
  }

  runTurn(action: Action): Step[] {
    const steps: Step[] = [];
    if (this.over) return steps;
    if (action.kind === 'run') {
      steps.push({ kind: 'message', text: '{PLAY_SE SE_FLEE}Got away safely!\\p', wait: true }, { kind: 'end', winner: 'escaped' });
      this.over = true;
      return steps;
    }
    this.shield = { player: null, opponent: null };
    this.hurt = { player: false, opponent: false };
    const player: Choice = this.player.recharging || action.kind === 'recharge' ? 'recharge'
      : action.kind === 'struggle' ? 'struggle' : this.player.moves[action.index];
    const oppIndex = this.opponent.recharging ? -2 : this.chooseOpponentMove();
    const opponent: Choice = oppIndex === -2 ? 'recharge' : oppIndex === -1 ? 'struggle' : this.opponent.moves[oppIndex];
    const priority = (c: Choice) => (c === 'recharge' ? 0 : c === 'struggle' ? 0 : c.move.priority);
    const order: [Side, Choice][] = [['player', player], ['opponent', opponent]];
    const pPri = priority(player), oPri = priority(opponent);
    const pSpd = this.effectiveSpeed(this.player), oSpd = this.effectiveSpeed(this.opponent);
    const opponentFirst = oPri > pPri || (oPri === pPri && (oSpd > pSpd || (oSpd === pSpd && this.rng.below(2) === 0)));
    if (opponentFirst) order.reverse();

    // Focus Punch is announced before anyone moves.
    for (const [side, c] of order) {
      if (c !== 'recharge' && c !== 'struggle' && c.move.effect === 'EFFECT_FOCUS_PUNCH') {
        steps.push({ kind: 'message', text: `${this.displayName(side)} is\ntightening its focus!` });
      }
    }
    for (let i = 0; i < order.length; i++) {
      const [side, c] = order[i];
      if (this.over) break;
      const m = this.mon(side);
      if (m.hp <= 0) continue;
      if (c === 'recharge') {
        m.recharging = false;
        steps.push({ kind: 'message', text: `${this.displayName(side)} must\nrecharge!` });
        continue;
      }
      this.useMove(side, c, steps, i === order.length - 1);
      if (this.checkFaints(steps)) break;
    }
    if (!this.over) this.endOfTurn(steps);
    return steps;
  }

  private other(side: Side): Side {
    return side === 'player' ? 'opponent' : 'player';
  }

  private useMove(side: Side, choice: MoveSlotState | 'struggle', steps: Step[], movesLast: boolean): void {
    const atk = this.mon(side);
    const defSide = this.other(side);
    const def = this.mon(defSide);
    let move = choice === 'struggle' ? MOVES.MOVE_STRUGGLE : choice.move;
    if (choice !== 'struggle') choice.pp = Math.max(0, choice.pp - 1);

    if (move.effect === 'EFFECT_FOCUS_PUNCH' && this.hurt[side]) {
      steps.push({ kind: 'message', text: `${this.displayName(side)} lost its\nfocus and couldn't move!` });
      atk.protectStreak = 0;
      return;
    }
    steps.push({ kind: 'message', text: `${this.displayName(side)} used\n${move.name}!` });

    if (move.effect === 'EFFECT_MIRROR_MOVE') {
      const copied = this.lastMove[defSide];
      if (!copied || copied.effect === 'EFFECT_MIRROR_MOVE') {
        steps.push({ kind: 'message', text: 'But it failed!' });
        atk.protectStreak = 0;
        return;
      }
      move = copied;
      steps.push({ kind: 'message', text: `${this.displayName(side)} used\n${move.name}!` });
    }
    this.lastMove[side] = move;

    // Protect, Detect and Endure: fail when moving last, or by chance when used in a row.
    if (move.effect === 'EFFECT_PROTECT' || move.effect === 'EFFECT_ENDURE') {
      const chance = PROTECT_RATES[Math.min(3, atk.protectStreak)];
      if (movesLast || this.rng.next() > chance) {
        atk.protectStreak = 0;
        steps.push({ kind: 'message', text: 'But it failed!' });
        return;
      }
      atk.protectStreak++;
      const endure = move.effect === 'EFFECT_ENDURE';
      this.shield[side] = endure ? 'endure' : 'protect';
      steps.push({ kind: 'move', side, move, hits: [], missed: false });
      steps.push({ kind: 'message', text: endure ? `${this.displayName(side)} braced\nitself!` : `${this.displayName(side)} protected\nitself!` });
      return;
    }
    atk.protectStreak = 0;

    const selfTarget = move.target === 'MOVE_TARGET_USER';
    if (!selfTarget && this.shield[defSide] === 'protect' && move.flags.includes('FLAG_PROTECT_AFFECTED')) {
      steps.push({ kind: 'message', text: `${this.displayName(defSide)} protected\nitself!` });
      return;
    }

    // Accuracy check (moves with accuracy 0 never miss; Foresight drops the target's evasion).
    if (!selfTarget && move.accuracy > 0) {
      const evasion = this.identified[defSide] ? Math.min(0, def.stages.evasion) : def.stages.evasion;
      const stage = Math.max(-6, Math.min(6, atk.stages.accuracy - evasion));
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
    let hitCount = 1;
    if (move.effect === 'EFFECT_DOUBLE_HIT' || move.effect === 'EFFECT_TWINEEDLE') hitCount = 2;
    else if (move.effect === 'EFFECT_MULTI_HIT') {
      // gMultiHitCounter: 2 or 3 three times in eight, 4 or 5 once in eight.
      const r = this.rng.next() & 3;
      hitCount = r > 1 ? (this.rng.next() & 3) + 2 : r + 2;
    }
    const hits: number[] = [];
    let crit = false;
    let effectiveness = 10;
    let endured = false;
    const moveStep: Step = { kind: 'move', side, move, hits, missed: false };
    steps.push(moveStep);
    const hpSteps: Step[] = [];
    for (let h = 0; h < hitCount && def.hp > 0; h++) {
      const r = this.damage(atk, def, move, side);
      crit ||= r.crit;
      effectiveness = r.effectiveness;
      if (r.effectiveness === 0) break;
      let dmg = r.damage;
      if (dmg >= def.hp && (move.effect === 'EFFECT_FALSE_SWIPE' || this.shield[defSide] === 'endure')) {
        dmg = def.hp - 1;
        endured ||= this.shield[defSide] === 'endure';
      }
      const from = def.hp;
      def.hp = Math.max(0, def.hp - dmg);
      hits.push(from - def.hp);
      hpSteps.push({ kind: 'hp', side: defSide, from, to: def.hp, effectiveness: r.effectiveness });
      if (from > def.hp) this.hurt[defSide] = true;
    }
    steps.push(...hpSteps);
    if (effectiveness === 0) {
      steps.push({ kind: 'message', text: `It doesn't affect\n${this.displayName(defSide)}…` });
      return;
    }
    const dealt = hits.reduce((a, b) => a + b, 0);
    if (crit) steps.push({ kind: 'message', text: 'A critical hit!' });
    if (effectiveness > 10) steps.push({ kind: 'message', text: "It's super effective!" });
    else if (effectiveness < 10) steps.push({ kind: 'message', text: "It's not very effective…" });
    if (hitCount > 1) steps.push({ kind: 'message', text: `Hit ${hits.length} time(s)!` });
    if (endured) steps.push({ kind: 'message', text: `${this.displayName(defSide)} endured\nthe hit!` });

    // Recoil and draining.
    if ((move.effect === 'EFFECT_RECOIL' || move.effect === 'EFFECT_DOUBLE_EDGE') && dealt > 0) {
      const recoil = Math.max(1, Math.floor(dealt / (move.effect === 'EFFECT_RECOIL' ? 4 : 3)));
      const from = atk.hp;
      atk.hp = Math.max(0, atk.hp - recoil);
      steps.push({ kind: 'hp', side, from, to: atk.hp });
      steps.push({ kind: 'message', text: `${this.displayName(side)} is hit\nwith recoil!` });
    }
    if (move.effect === 'EFFECT_ABSORB' && dealt > 0 && atk.hp < atk.stats.hp) {
      const from = atk.hp;
      atk.hp = Math.min(atk.stats.hp, atk.hp + Math.max(1, Math.floor(dealt / 2)));
      steps.push({ kind: 'hp', side, from, to: atk.hp });
      steps.push({ kind: 'message', text: `${this.displayName(defSide)} had its\nenergy drained!` });
    }
    if (move.effect === 'EFFECT_RECHARGE') atk.recharging = true;

    // Secondary effects.
    const chance = move.secondaryEffectChance;
    const lands = () => chance === 0 || this.rng.below(100) < chance;
    if (def.hp > 0 && chance > 0 && (move.effect === 'EFFECT_BURN_HIT' || move.effect === 'EFFECT_BLAZE_KICK') && lands()) {
      if (def.status === 'none' && !def.species.types.includes('TYPE_FIRE')) {
        def.status = 'burn';
        steps.push({ kind: 'message', text: `${this.displayName(defSide)} was burned!` });
      }
    }
    const changes = HIT_STAT_CHANGES[move.effect];
    if (changes && lands()) {
      for (const [who, stat, n] of changes) {
        if (who === 'foe' && def.hp <= 0) continue;
        if (who === 'self' && atk.hp <= 0) continue;
        this.changeStat(who === 'self' ? side : defSide, stat, n, steps, true);
      }
    }
  }

  private applyStatusEffect(side: Side, move: MoveData, steps: Step[]): void {
    const defSide = this.other(side);
    const changes = STAT_MOVES[move.effect];
    if (changes) {
      for (const [who, stat, n] of changes) this.changeStat(who === 'self' ? side : defSide, stat, n, steps);
      return;
    }
    switch (move.effect) {
      case 'EFFECT_FOCUS_ENERGY': {
        const m = this.mon(side);
        if (m.critStage >= 2) steps.push({ kind: 'message', text: 'But it failed!' });
        else {
          m.critStage = 2;
          steps.push({ kind: 'message', text: `${this.displayName(side)} is getting\npumped!` });
        }
        return;
      }
      case 'EFFECT_FORESIGHT':
        this.identified[defSide] = true;
        steps.push({ kind: 'message', text: `${this.displayName(side)} identified\n${this.displayName(defSide)}!` });
        return;
      default:
        steps.push({ kind: 'message', text: 'But it failed!' });
    }
  }

  /** Change a stat stage; `quiet` (a hit's side effect) says nothing when it can't go further. */
  private changeStat(side: Side, stat: StatKey, delta: number, steps: Step[], quiet = false): void {
    const m = this.mon(side);
    const before = m.stages[stat];
    const after = Math.max(-6, Math.min(6, before + delta));
    const name = this.displayName(side);
    if (after === before) {
      if (!quiet) steps.push({ kind: 'message', text: delta > 0 ? `${name}'s ${STAT_NAMES[stat]}\nwon't go higher!` : `${name}'s ${STAT_NAMES[stat]}\nwon't go lower!` });
      return;
    }
    m.stages[stat] = after;
    steps.push({ kind: 'stat', side, stat, delta });
    const verb = delta > 0 ? (delta > 1 ? 'sharply rose!' : 'rose!') : delta < -1 ? 'harshly fell!' : 'fell!';
    steps.push({ kind: 'message', text: `${name}'s ${STAT_NAMES[stat]}\n${verb}` });
  }

  /** CalculateBaseDamage + crit + typecalc (STAB, type chart) + random factor. */
  damage(atk: BattleMon, def: BattleMon, move: MoveData, side: Side = 'player'): { damage: number; crit: boolean; effectiveness: number } {
    // Fixed damage: only an immunity stops it.
    const fixed = move.effect === 'EFFECT_LEVEL_DAMAGE' ? atk.level : move.effect === 'EFFECT_DRAGON_RAGE' ? 40 : move.effect === 'EFFECT_SONICBOOM' ? 20 : 0;
    if (fixed) {
      const immune = TYPES.chart.some((e) => e.attacker === move.type && def.species.types.includes(e.defender) && TYPES.multipliers[e.multiplier] === 0);
      return { damage: immune ? 0 : fixed, crit: false, effectiveness: immune ? 0 : 10 };
    }
    const hp = move.effect === 'EFFECT_HIDDEN_POWER' ? hiddenPower() : null;
    const type = hp?.type ?? move.type;
    const physical = TYPES.values[type] < TYPES.values.TYPE_MYSTERY;
    // Crit
    let critStage = atk.critStage + (HIGH_CRIT_EFFECTS.has(move.effect) ? 1 : 0);
    critStage = Math.min(4, critStage);
    const crit = this.rng.below(CRIT_CHANCE[critStage]) === 0;
    const critMul = crit ? 2 : 1;
    let power = hp?.power ?? move.power;
    // Return at full friendship; Eruption by HP; Revenge doubles after being hurt this turn.
    if (move.effect === 'EFFECT_RETURN') power = 102;
    if (move.effect === 'EFFECT_ERUPTION') power = Math.max(1, Math.floor((power * atk.hp) / atk.stats.hp));
    if (move.effect === 'EFFECT_REVENGE' && this.hurt[side]) power *= 2;
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
      if (this.player.hp > 0) steps.push({ kind: 'victory' });
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
