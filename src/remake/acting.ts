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
//                               home (the clip's _first, _next, _last variants)
//   a two-turn move's first turn  its _charge variant (Solar Beam gathering
//                               light, Fly rising out of sight, Dig burrowing)
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

import type { Battler3D } from '../battle3d/battler';
import { clipFor } from '../battle3d/director';
import { CHARGE_VARIANT, EFFECT_EVENTS, MULTI_HIT_EFFECTS, MULTI_HIT_VARIANTS, TWO_TURN_EFFECTS } from '../battle3d/situations';
import { isStrong } from '../battle3d/motifs';
import { MOVES, type MoveData } from '../data';
import { constant, type BattleState, type GameInfo } from './state';

const MOVES_BY_ID = new Map<number, MoveData>(Object.values(MOVES).map((m) => [m.id, m]));
/** A held animation is let go after this many frames whatever the clip does (the game lets go after 240). */
const HOLD_FRAMES_MAX = 150;

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

  /** The move's clip for this hit and turn: a multi-hit move's variants, a two-turn move's charge. */
  private moveClip(attacker: Battler3D, battler: number, move: MoveData, state: BattleState): string {
    const base = clipFor(attacker, move);
    const has = (name: string) => !!attacker.profile.clips[name];
    if (TWO_TURN_EFFECTS.has(move.effect) && state.animTurn === 0 && has(base + CHARGE_VARIANT)) return base + CHARGE_VARIANT;
    if (!MULTI_HIT_EFFECTS.has(move.effect)) {
      this.inRun.delete(battler);
      return base;
    }
    const more = state.animHits >= 2;
    const variant = more ? (this.inRun.has(battler) ? MULTI_HIT_VARIANTS.next : MULTI_HIT_VARIANTS.first) : this.inRun.has(battler) ? MULTI_HIT_VARIANTS.last : '';
    if (more) this.inRun.add(battler);
    else this.inRun.delete(battler);
    return variant && has(base + variant) ? base + variant : base;
  }

  private startMove(state: BattleState, bodyOf: (battler: number) => Battler3D | null, release: () => void): void {
    const attacker = bodyOf(state.animAttacker);
    const move = MOVES_BY_ID.get(state.animId);
    if (!attacker || !move || this.fainting.has(state.animAttacker)) {
      if (state.animHeld) release();
      return;
    }
    // A blow from before is done with.
    this.struck.delete(state.animTarget);
    const clip = this.moveClip(attacker, state.animAttacker, move, state);
    const events = attacker.profile.clips[clip]?.events ?? [];
    const held = state.animHeld && events.some((e) => EFFECT_EVENTS.has(e.name));
    if (state.animHeld && !held) release();
    this.perform(attacker, clip, { attacker: state.animAttacker, target: state.animTarget, move, held, heldFrames: 0, struck: false, foeTakes: null }, bodyOf, release);
  }

  private startFailedMove(state: BattleState, bodyOf: (battler: number) => Battler3D | null): void {
    const attacker = bodyOf(state.failAttacker);
    const move = MOVES_BY_ID.get(state.failMove);
    if (!attacker || !move || this.fainting.has(state.failAttacker) || this.performing.has(state.failAttacker)) return;
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
    attacker.onEvent = (name) => {
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
    void attacker.perform(clip).then(() => {
      if (attacker.onEvent) attacker.onEvent = null;
      target?.release();
      this.driven.delete(p.attacker);
      this.driven.delete(p.target);
      if (this.performing.get(p.attacker) === p) this.performing.delete(p.attacker);
      if (p.held) {
        p.held = false;
        release();
      }
    });
  }

  /** A status condition's, a stat change's, a level up's... animation: the battler's situation clip. */
  private startSituation(state: BattleState, bodyOf: (battler: number) => Battler3D | null): void {
    const clip = this.situationClip(state);
    const battler = state.animAttacker;
    const body = bodyOf(battler);
    if (!clip || !body || this.fainting.has(battler) || this.performing.has(battler)) return;
    if (body.profile.clips[clip]) void body.perform(clip);
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
