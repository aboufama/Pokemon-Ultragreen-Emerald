// The remake layer's acting: the 3D bodies act out what the game's battle
// does, as the battle playtest's director does (src/battle3d/director.ts):
//
//   a move's animation starts   the attacker performs the move's clip: a
//                               contact move leaps to the foe, strikes it and
//                               comes home; a ranged one aims and lets fly at
//                               it. The game holds its own animation at its
//                               start (RemakeHoldAnimation) until the clip's
//                               first effect event (its impact, release, emit,
//                               aura...), so the game's effects, sounds and the
//                               foe's shake begin as the strike lands. A strike
//                               knocks the foe back and it flinches then. While
//                               the clip runs the body is the clip's: drawn
//                               where it is (free of its sprite), not the
//                               sprite's own lunges and turns (layer.ts).
//   a multi-hit move            the first hit leaps in and stays at the foe,
//                               the next ones strike from there, the last goes
//                               home (the clip's _first, _next, _last variants);
//                               between hits the body holds at the foe, and if
//                               the next hit doesn't come (a long message, the
//                               foe fainted) it goes home ('return_home')
//   a two-turn move's first turn  its _charge variant (Solar Beam gathering
//                               light, Dig burrowing: it stays underground,
//                               out of sight, until its strike bursts up)
//   a move fails at the foe     no animation shows it: the attacker performs
//                               the move all the same and the foe dodges it
//                               (a miss) or shrugs it off (no effect, Protect)
//   the engine tells a battler it is hit   it flinches ('hit', or 'hit_strong'
//                               for a critical or super-effective blow), unless
//                               a strike just made it
//   ... that it faints          it curls over and shrinks away ('faint') where
//                               it stood, until a Pokémon comes out again
//   ... to come out of its ball  when it shows, it strikes its pose ('intro')
//   a wild Pokémon's healthbox comes   it cries: 'intro' (once per appearance)
//   a status condition's, stat change's or level up's animation, a Leech Seed
//   drain, a heal, Focus Punch's setup, a Focus Band: the battler plays the
//   situation's clip (src/battle3d/situations.ts)
//   the weather going on at a turn's end   both battlers react to it
//   a message the game shows without an animation ("flinched!", "must
//   recharge!", "woke up!", "broke free!", Intimidate...): the one it is
//   about plays the situation's clip
//   asleep, or worn down to a quarter of its HP: it rests in its state's loop
//   ('idle_asleep', 'idle_tired') instead of 'idle'; frozen, it holds still

import type { Battler3D } from '../battle3d/battler';
import { clipFor } from '../battle3d/director';
import { CHARGE_VARIANT, EFFECT_EVENTS, MULTI_HIT_EFFECTS, MULTI_HIT_VARIANTS, TWO_TURN_EFFECTS } from '../battle3d/situations';
import { isStrong } from '../battle3d/motifs';
import { MOVES, type MoveData } from '../data';
import { constant, type BattleState, type GameInfo } from './state';

const MOVES_BY_ID = new Map<number, MoveData>(Object.values(MOVES).map((m) => [m.id, m]));
/** A held animation is let go after this many frames whatever the clip does (the game lets go after 240). */
const HOLD_FRAMES_MAX = 150;
/** Frames a multi-hit move's attacker waits at the foe for its next hit before going home. */
const WAIT_AT_FOE = 150;
/** ?actlog=1: log the clips the acting asks for (for tools checking the game's events reach them). */
const LOG = typeof location !== 'undefined' && new URLSearchParams(location.search).has('actlog');
const log = (what: string) => {
  if (LOG) console.log(`[acting] ${what}`);
};

/** The situation clip for a status condition's animation (B_ANIM_STATUS_*). */
const STATUS_CLIPS: Record<string, string> = {
  B_ANIM_STATUS_PSN: 'status_poison',
  B_ANIM_STATUS_CONFUSION: 'status_confusion',
  B_ANIM_STATUS_BRN: 'status_burn',
  B_ANIM_STATUS_INFATUATION: 'status_infatuation',
  B_ANIM_STATUS_SLP: 'status_sleep',
  B_ANIM_STATUS_PRZ: 'status_paralysis',
  B_ANIM_STATUS_FRZ: 'status_freeze',
  B_ANIM_STATUS_CURSED: 'status_curse',
  B_ANIM_STATUS_NIGHTMARE: 'status_nightmare',
  B_ANIM_STATUS_WRAPPED: 'status_wrapped',
};
/** ... for the general animations (B_ANIM_*) that show a battler's situation (a stat change's depends on its kind). */
const GENERAL_CLIPS: Record<string, string> = {
  B_ANIM_TURN_TRAP: 'status_wrapped',
  B_ANIM_LEECH_SEED_DRAIN: 'drained',
  B_ANIM_FOCUS_PUNCH_SETUP: 'focus',
  B_ANIM_FOCUS_BAND: 'hang_on',
  B_ANIM_INGRAIN_HEAL: 'healed',
  B_ANIM_WISH_HEAL: 'healed',
  B_ANIM_HELD_ITEM_EFFECT: 'healed',
  B_ANIM_MON_HIT: 'hit',
};
/** ... for the special ones (B_ANIM_*). */
const SPECIAL_CLIPS: Record<string, string> = { B_ANIM_LVL_UP: 'level_up' };
/** The weather going on at a turn's end (general animations): every battler reacts. */
const WEATHER_CLIPS: Record<string, string> = {
  B_ANIM_RAIN_CONTINUES: 'weather_rain',
  B_ANIM_SUN_CONTINUES: 'weather_sun',
  B_ANIM_SANDSTORM_CONTINUES: 'weather_sand',
  B_ANIM_HAIL_CONTINUES: 'weather_hail',
};
/**
 * Messages the game shows without an animation (STRINGID_*): the situation
 * clip, and whom it is about (the battler its text names first: the
 * attacker's, the target's or the battle script's name).
 */
const MESSAGE_CLIPS: Record<string, [clip: string, who: 'attacker' | 'target' | 'scripting']> = {
  STRINGID_PKMNFLINCHED: ['flinch', 'attacker'],
  STRINGID_PKMNMUSTRECHARGE: ['recharge', 'attacker'],
  STRINGID_PKMNWOKEUP: ['wake', 'attacker'],
  STRINGID_PKMNWOKEUPINUPROAR: ['wake', 'attacker'],
  STRINGID_PKMNSITEMWOKEIT: ['wake', 'scripting'],
  STRINGID_PKMNWASDEFROSTED: ['shake_off', 'target'],
  STRINGID_PKMNWASDEFROSTED2: ['shake_off', 'attacker'],
  STRINGID_PKMNWASDEFROSTEDBY: ['shake_off', 'attacker'],
  STRINGID_PKMNHEALEDCONFUSION: ['shake_off', 'attacker'],
  STRINGID_PKMNFREEDFROM: ['shake_off', 'attacker'],
  STRINGID_PKMNGOTFREE: ['shake_off', 'attacker'],
  STRINGID_PKMNSTATUSNORMAL: ['shake_off', 'attacker'],
  STRINGID_PKMNSXCUREDYPROBLEM: ['shake_off', 'scripting'],
  STRINGID_PKMNENDUREDHIT: ['hang_on', 'target'],
  STRINGID_PKMNHUNGONWITHX: ['hang_on', 'target'],
  STRINGID_PKMNCUTSATTACKWITH: ['intimidate', 'scripting'],
  STRINGID_PKMNSTORINGENERGY: ['bide_charge', 'attacker'],
  // The ball opened and the wild Pokémon is out again.
  STRINGID_PKMNBROKEFREE: ['break_free', 'target'],
  STRINGID_ITAPPEAREDCAUGHT: ['break_free', 'target'],
  STRINGID_AARGHALMOSTHADIT: ['break_free', 'target'],
  STRINGID_SHOOTSOCLOSE: ['break_free', 'target'],
};

/** A move being performed: its attacker's clip is the body's until it ends. */
interface Performance {
  attacker: number;
  target: number;
  move: MoveData;
  /** The game's animation waits for the clip's first effect event. */
  held: boolean;
  heldFrames: number;
  /** The foe was struck (it flinched then: the engine's hit that follows doesn't repeat it). */
  struck: boolean;
  /** A failed move: how the foe takes it (dodge or unaffected), or null. */
  foeTakes: string | null;
}

export class Acting {
  private animSerial: number | null = null;
  private failSerial: number | null = null;
  private messageSerial: number | null = null;
  private readonly commandSerials = new Map<number, number>();
  /** Battlers fainting (their bodies hold still while their sprites slide away). */
  private readonly fainting = new Set<number>();
  /** Battlers coming out of their balls: 'intro' when they show. */
  private readonly comingOut = new Set<number>();
  /** Battlers whose 'intro' has played since they appeared. */
  private readonly introduced = new Set<number>();
  private readonly healthboxes = new Map<number, boolean>();
  /** Moves being performed, by attacker. */
  private readonly performing = new Map<number, Performance>();
  /** Bodies a performance drives (the attacker, a foe it carries): not their sprites. */
  private readonly driven = new Set<number>();
  /** Battlers in a multi-hit move's run of hits (between its first and last). */
  private readonly inRun = new Set<number>();
  /** Battlers that were just struck (their next 'hit' from the engine is the same blow). */
  private readonly struck = new Set<number>();
  /** Attackers holding where a multi-hit move's hit left them, waiting for the next: for how many frames, and whether that is away from home. */
  private readonly waiting = new Map<number, { frames: number; away: boolean }>();
  private bodyOf: (battler: number) => Battler3D | null = () => null;
  private readonly loggedIdle = new Set<string>();
  private readonly k: Record<string, number>;
  private readonly MOVE_ANIM: number;
  private readonly STATUS_ANIM: number;
  private readonly GENERAL_ANIM: number;
  private readonly SPECIAL_ANIM: number;
  private readonly HIT: number;
  private readonly FAINT: number;
  private readonly COME_OUT: number[];

  constructor(info: GameInfo) {
    this.k = info.constants;
    this.MOVE_ANIM = constant(info, 'REMAKE_ANIM_MOVE');
    this.STATUS_ANIM = constant(info, 'REMAKE_ANIM_STATUS');
    this.GENERAL_ANIM = constant(info, 'REMAKE_ANIM_GENERAL');
    this.SPECIAL_ANIM = constant(info, 'REMAKE_ANIM_SPECIAL');
    this.HIT = constant(info, 'CONTROLLER_HITANIMATION');
    this.FAINT = constant(info, 'CONTROLLER_FAINTANIMATION');
    this.COME_OUT = ['CONTROLLER_SWITCHINANIM', 'CONTROLLER_INTROTRAINERBALLTHROW'].map((n) => constant(info, n));
  }

  /** The battle ended: nothing carries over to the next. */
  reset(): void {
    this.animSerial = null;
    this.failSerial = null;
    this.messageSerial = null;
    this.waiting.clear();
    this.commandSerials.clear();
    this.fainting.clear();
    this.comingOut.clear();
    this.introduced.clear();
    this.healthboxes.clear();
    this.performing.clear();
    this.driven.clear();
    this.inRun.clear();
    this.struck.clear();
  }

  isFainting(battler: number): boolean {
    return this.fainting.has(battler);
  }

  /** The body is a move's to move (its clip travels, leaps, carries): drawn where it is, not where its sprite is. */
  drives(battler: number): boolean {
    return this.driven.has(battler);
  }

  /**
   * A frame of the battle: start the clips its events call for. `bodyOf`
   * gives a battler's 3D body (null without one, or while it loads), `shows`
   * whether its body shows this frame, `release` lets the game's held
   * animation go.
   */
  update(state: BattleState, bodyOf: (battler: number) => Battler3D | null, shows: (battler: number) => boolean, release: () => void): void {
    this.bodyOf = bodyOf;
    // A move's animation, or a situation's. (The first frame only notes where
    // the game is: an animation from before is not replayed.)
    if (this.animSerial !== null && state.animSerial !== this.animSerial) {
      if (state.animTable === this.MOVE_ANIM) this.startMove(state, bodyOf, release);
      else this.startSituation(state, bodyOf);
    }
    this.animSerial = state.animSerial;
    // A move that failed at its foe: acted out, the foe dodging or shrugging it off.
    if (this.failSerial !== null && state.failSerial !== this.failSerial) this.startFailedMove(state, bodyOf);
    this.failSerial = state.failSerial;
    // A message the game shows without an animation.
    if (this.messageSerial !== null && state.messageSerial !== this.messageSerial) this.startMessage(state, bodyOf);
    this.messageSerial = state.messageSerial;
    // A multi-hit move's attacker waiting at the foe goes home when its next hit doesn't come.
    for (const [battler, w] of this.waiting) if (++w.frames > WAIT_AT_FOE) this.goHome(battler);
    // The states it rests in: asleep, worn down; frozen solid.
    state.battlers.forEach((b, i) => {
      const body = bodyOf(i);
      if (!body || !b.present) return;
      const asleep = (b.status1 & this.k.STATUS1_SLEEP) !== 0;
      const worn = b.maxHp > 0 && b.hp > 0 && b.hp * 4 <= b.maxHp;
      const idle = asleep ? 'idle_asleep' : worn ? 'idle_tired' : 'idle';
      if (LOG && body.idleClip !== idle && (idle === 'idle' || body.profile.clips[idle] || !this.loggedIdle.has(`${i}${idle}`))) {
        this.loggedIdle.add(`${i}${idle}`);
        log(`idle ${i} ${idle}`);
      }
      body.setIdle(idle);
      body.frozen = (b.status1 & this.k.STATUS1_FREEZE) !== 0 && !this.fainting.has(i);
    });

    // A held animation goes once its clip gets there, or after a while.
    for (const p of this.performing.values()) {
      if (!p.held) continue;
      if (!state.animHeld || ++p.heldFrames > HOLD_FRAMES_MAX) {
        p.held = false;
        if (state.animHeld) release();
      }
    }

    // What the engine tells each battler.
    state.battlers.forEach((b, i) => {
      const seen = this.commandSerials.get(i);
      this.commandSerials.set(i, b.commandSerial);
      const body = bodyOf(i);
      if (seen !== undefined && seen !== b.commandSerial) {
        if (b.command === this.FAINT) {
          this.fainting.add(i);
          if (body) void body.play('faint');
        } else if (this.COME_OUT.includes(b.command)) {
          // A Pokémon comes out in its place: the faint is over. (The
          // engine's other commands to a fainted battler, its data, don't
          // end it.)
          this.fainting.delete(i);
          this.comingOut.add(i);
          this.introduced.delete(i);
        } else if (b.command === this.HIT && body && !this.fainting.has(i)) {
          // The blow that struck it already made it flinch.
          if (!this.struck.delete(i)) void body.perform(this.hitClip(body, state));
        }
      }
      // Its entrance: out of its ball as it shows, or (a wild one, already
      // there) as its healthbox comes and it cries.
      const healthboxCame = b.healthboxShown && this.healthboxes.get(i) === false;
      this.healthboxes.set(i, b.healthboxShown);
      if (body && shows(i) && !this.introduced.has(i) && (this.comingOut.has(i) || healthboxCame)) {
        this.comingOut.delete(i);
        this.introduced.add(i);
        void body.perform('intro');
      }
    });
  }

  /** How a battler takes a blow: harder from a critical or super-effective one. */
  private hitClip(body: Battler3D, state: BattleState): string {
    const hard = state.critical || (state.moveResult & this.k.MOVE_RESULT_SUPER_EFFECTIVE) !== 0;
    return hard && body.profile.clips.hit_strong ? 'hit_strong' : 'hit';
  }

  /**
   * The move's clip for this hit and turn: a two-turn move's charge; a
   * multi-hit move's hit from home (_first) or from the foe where the last
   * one left it (_next, and _last when no more come), a lone hit its own.
   */
  private moveClip(attacker: Battler3D, battler: number, move: MoveData, state: BattleState): string {
    const base = clipFor(attacker, move);
    const has = (name: string) => !!attacker.profile.clips[name];
    if (TWO_TURN_EFFECTS.has(move.effect) && state.animTurn === 0 && has(base + CHARGE_VARIANT)) return base + CHARGE_VARIANT;
    // In a run: the last hit left it at the foe (it may still be finishing there).
    const atFoe = this.inRun.has(battler);
    if (!MULTI_HIT_EFFECTS.has(move.effect)) {
      this.inRun.delete(battler);
      return base;
    }
    const more = state.animHits >= 2;
    const { first, next, last } = MULTI_HIT_VARIANTS;
    let variant = '';
    if (atFoe) variant = more && has(base + next) ? next : last;
    else if (more) variant = first;
    if (variant && !has(base + variant)) variant = '';
    // In a run while it stays at the foe for the next hit.
    if (variant === first || variant === next) this.inRun.add(battler);
    else this.inRun.delete(battler);
    return base + variant;
  }

  private startMove(state: BattleState, bodyOf: (battler: number) => Battler3D | null, release: () => void): void {
    const attacker = bodyOf(state.animAttacker);
    const move = MOVES_BY_ID.get(state.animId);
    // Anyone else waiting at a foe is done waiting: another move has begun.
    for (const b of [...this.waiting.keys()]) if (b !== state.animAttacker) this.goHome(b);
    if (!attacker || !move || this.fainting.has(state.animAttacker)) {
      if (state.animHeld) release();
      return;
    }
    // A blow from before is done with.
    this.struck.delete(state.animTarget);
    const clip = this.moveClip(attacker, state.animAttacker, move, state);
    log(`move ${state.animAttacker} ${move.const} ${clip}`);
    // Not waiting any more: this hit carries on from where the last left it.
    this.waiting.delete(state.animAttacker);
    const events = attacker.profile.clips[clip]?.events ?? [];
    const held = state.animHeld && events.some((e) => EFFECT_EVENTS.has(e.name));
    if (state.animHeld && !held) release();
    this.perform(attacker, clip, { attacker: state.animAttacker, target: state.animTarget, move, held, heldFrames: 0, struck: false, foeTakes: null }, bodyOf, release);
  }

  /** A multi-hit move's attacker waiting where its last hit left it goes home (hops back from the foe, or just rests). */
  private goHome(battler: number): void {
    const w = this.waiting.get(battler);
    this.waiting.delete(battler);
    this.inRun.delete(battler);
    const body = this.bodyOf(battler);
    if (!w || !body) {
      this.driven.delete(battler);
      return;
    }
    if (w.away && body.profile.clips.return_home) {
      void body.perform('return_home').then(() => {
        if (!this.waiting.has(battler) && !this.performing.has(battler)) this.driven.delete(battler);
      });
    } else {
      void body.play(body.idleClip, { fade: 0.25 });
      if (!this.performing.has(battler)) this.driven.delete(battler);
    }
  }

  private startFailedMove(state: BattleState, bodyOf: (battler: number) => Battler3D | null): void {
    const attacker = bodyOf(state.failAttacker);
    const move = MOVES_BY_ID.get(state.failMove);
    // (A multi-hit move that misses partway leaves its attacker waiting at the foe: it goes home in time.)
    if (!attacker || !move || this.fainting.has(state.failAttacker) || this.performing.has(state.failAttacker) || this.waiting.has(state.failAttacker)) return;
    const foeTakes = state.failResult & this.k.MOVE_RESULT_MISSED ? 'dodge' : 'unaffected';
    this.perform(attacker, clipFor(attacker, move), { attacker: state.failAttacker, target: state.failTarget, move, held: false, heldFrames: 0, struck: false, foeTakes }, bodyOf, () => {});
  }

  /** A move's clip on its attacker, the foe taking its effect events. */
  private perform(attacker: Battler3D, clip: string, p: Performance, bodyOf: (battler: number) => Battler3D | null, release: () => void): void {
    const target = p.target !== p.attacker ? bodyOf(p.target) : null;
    const strong = isStrong(p.move);
    this.performing.set(p.attacker, p);
    this.driven.add(p.attacker);
    attacker.target = target;
    let foeReacted = false;
    const onEvent = (name: string) => {
      if (p.held && EFFECT_EVENTS.has(name)) {
        p.held = false;
        release();
      }
      if (!target || this.fainting.has(p.target)) return;
      if (name === 'impact' && !foeReacted) {
        // The strike lands: the foe takes it (or dodges it, or shrugs it off).
        if (p.foeTakes) {
          foeReacted = true;
          if (target.profile.clips[p.foeTakes]) void target.perform(p.foeTakes);
          return;
        }
        target.recoil(strong ? 1 : 0.6);
        void target.perform(strong && target.profile.clips.hit_strong ? 'hit_strong' : 'hit');
        this.struck.add(p.target);
        foeReacted = true;
      } else if (name === 'impact') {
        // A multi-strike clip's later blows knock it again.
        target.recoil(strong ? 0.8 : 0.5);
      } else if (name === 'grab' && !p.foeTakes) {
        // From here the foe rides in the attacker's hands.
        this.driven.add(p.target);
        target.grabbedBy(attacker);
      } else if (name === 'throw' && !p.foeTakes) {
        const clipEvents = attacker.profile.clips[clip]?.events ?? [];
        const at = clipEvents.find((e) => e.name === 'throw')?.t ?? 0;
        const land = clipEvents.find((e) => e.name === 'impact' && e.t > at)?.t;
        target.thrown(land === undefined ? 0.25 : land - at);
      } else if ((name === 'release' || name === 'emit') && p.foeTakes && !foeReacted) {
        // A ranged move that misses: the foe gets out of its way.
        foeReacted = true;
        if (target.profile.clips[p.foeTakes]) void target.perform(p.foeTakes);
      }
    };
    attacker.onEvent = onEvent;
    // A hit that stays at the foe for the next holds its last pose there; a
    // burrow's first turn stays underground (out of sight: its sprite is
    // hidden) until it bursts up at its strike.
    const stays = clip.endsWith(MULTI_HIT_VARIANTS.first) || clip.endsWith(MULTI_HIT_VARIANTS.next);
    const buried = clip.endsWith(CHARGE_VARIANT) && (attacker.profile.clips[clip]?.events ?? []).some((e) => e.name === 'dig');
    void attacker.perform(clip, { hold: stays || buried }).then(() => {
      if (attacker.onEvent === onEvent) attacker.onEvent = null;
      target?.release();
      this.driven.delete(p.target);
      if (p.held) {
        p.held = false;
        release();
      }
      // The next hit may have begun already (it carries on from here).
      if (this.performing.get(p.attacker) !== p) return;
      this.performing.delete(p.attacker);
      if (stays && this.inRun.has(p.attacker)) this.waiting.set(p.attacker, { frames: 0, away: (attacker.pose.advance ?? 0) > 0.5 });
      else this.driven.delete(p.attacker);
    });
  }

  /** A status condition's, a stat change's, a level up's... animation: the battler's situation clip. */
  private startSituation(state: BattleState, bodyOf: (battler: number) => Battler3D | null): void {
    // The weather going on: everyone out reacts to it.
    if (state.animTable === this.GENERAL_ANIM) {
      const weather = Object.entries(WEATHER_CLIPS).find(([name]) => this.k[name] === state.animId)?.[1];
      if (weather) {
        state.battlers.forEach((b, i) => {
          if (b.present && b.hp > 0) this.situation(i, weather, bodyOf);
        });
        return;
      }
    }
    const clip = this.situationClip(state);
    if (clip) this.situation(state.animAttacker, clip, bodyOf);
  }

  /** A battler plays a situation's clip, if it has one and isn't busy (a move, a faint, waiting at a foe). */
  private situation(battler: number, clip: string, bodyOf: (battler: number) => Battler3D | null): void {
    log(`situation ${battler} ${clip}`);
    const body = bodyOf(battler);
    if (!body || this.fainting.has(battler) || this.performing.has(battler) || this.waiting.has(battler)) return;
    if (body.profile.clips[clip] && body.animator.currentClip !== clip) void body.perform(clip);
  }

  /** A message the game shows without an animation: the one it is about acts it out. */
  private startMessage(state: BattleState, bodyOf: (battler: number) => Battler3D | null): void {
    const entry = Object.entries(MESSAGE_CLIPS).find(([name]) => this.k[name] === state.messageId)?.[1];
    if (!entry) return;
    const [clip, who] = entry;
    const battler = who === 'attacker' ? state.messageAttacker : who === 'target' ? state.messageTarget : state.messageScripting;
    if (battler < state.battlers.length) this.situation(battler, clip, bodyOf);
  }

  private situationClip(state: BattleState): string | null {
    const k = this.k;
    const named = (prefix: string, table: Record<string, string>) => {
      for (const [name, clip] of Object.entries(table)) if (k[name] === state.animId && name.startsWith(prefix)) return clip;
      return null;
    };
    if (state.animTable === this.STATUS_ANIM) return named('B_ANIM_STATUS_', STATUS_CLIPS);
    if (state.animTable === this.SPECIAL_ANIM) return named('B_ANIM_', SPECIAL_CLIPS);
    if (state.animTable !== this.GENERAL_ANIM) return null;
    if (state.animId === k.B_ANIM_STATS_CHANGE) {
      const a = state.animStatArg;
      const within = (from: number) => a >= from && a < from + 7;
      const rises = within(k.STAT_ANIM_PLUS1) || within(k.STAT_ANIM_PLUS2) || a === k.STAT_ANIM_MULTIPLE_PLUS1 || a === k.STAT_ANIM_MULTIPLE_PLUS2;
      return rises ? 'stat_up' : 'stat_down';
    }
    return named('B_ANIM_', GENERAL_CLIPS);
  }
}
