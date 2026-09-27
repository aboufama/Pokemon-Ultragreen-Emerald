// The remake layer's acting: the 3D bodies act out what the game's battle
// does. The game moves the sprites (a lunge, a shake, a slide) and the bodies
// follow them (layer.ts); on top of that each body acts in place
// (Battler3D.inPlace: no travel, no leaps), on the game's own events:
//
//   a move's animation starts          the attacker plays the move's clip (director.ts clipFor)
//   the engine tells a battler it is hit  it flinches ('hit'), as its sprite blinks
//   ... that it faints                   it curls over and shrinks away ('faint'); the sprite's
//                                        slide down is not followed
//   ... to come out of its ball          when it shows, it strikes its pose ('intro')

import type { Battler3D } from '../battle3d/battler';
import { clipFor } from '../battle3d/director';
import { MOVES, type MoveData } from '../data';
import { REMAKE_ANIM, constant, type BattleState, type GameInfo } from './state';

const MOVES_BY_ID = new Map<number, MoveData>(Object.values(MOVES).map((m) => [m.id, m]));

export class Acting {
  private animSerial: number | null = null;
  private readonly commandSerials = new Map<number, number>();
  /** Battlers fainting (their bodies hold still while their sprites slide away). */
  private readonly fainting = new Set<number>();
  /** Battlers coming out of their balls: 'intro' when they show. */
  private readonly comingOut = new Set<number>();
  private readonly HIT: number;
  private readonly FAINT: number;
  private readonly COME_OUT: number[];

  constructor(info: GameInfo) {
    this.HIT = constant(info, 'CONTROLLER_HITANIMATION');
    this.FAINT = constant(info, 'CONTROLLER_FAINTANIMATION');
    this.COME_OUT = ['CONTROLLER_SWITCHINANIM', 'CONTROLLER_INTROTRAINERBALLTHROW'].map((n) => constant(info, n));
  }

  /** The battle ended: nothing carries over to the next. */
  reset(): void {
    this.animSerial = null;
    this.commandSerials.clear();
    this.fainting.clear();
    this.comingOut.clear();
  }

  isFainting(battler: number): boolean {
    return this.fainting.has(battler);
  }

  /**
   * A frame of the battle: start the clips its events call for. `bodyOf`
   * gives a battler's 3D body (null without one), `shows` whether its body
   * shows this frame.
   */
  update(state: BattleState, bodyOf: (battler: number) => Battler3D | null, shows: (battler: number) => boolean): void {
    // A move's animation. (The first frame only notes where the game is: an
    // animation from before is not replayed.)
    if (this.animSerial !== null && state.animSerial !== this.animSerial && state.animTable === REMAKE_ANIM.MOVE) {
      const attacker = bodyOf(state.animAttacker);
      const move = MOVES_BY_ID.get(state.animId);
      if (attacker && move && !this.fainting.has(state.animAttacker)) void attacker.perform(clipFor(attacker, move));
    }
    this.animSerial = state.animSerial;

    // What the engine tells each battler.
    state.battlers.forEach((b, i) => {
      const seen = this.commandSerials.get(i);
      this.commandSerials.set(i, b.commandSerial);
      const body = bodyOf(i);
      if (seen !== undefined && seen !== b.commandSerial) {
        if (b.command === this.FAINT) {
          this.fainting.add(i);
          if (body) void body.play('faint');
        } else {
          this.fainting.delete(i);
          if (b.command === this.HIT && body) void body.perform('hit');
          if (this.COME_OUT.includes(b.command)) this.comingOut.add(i);
        }
      }
      if (body && this.comingOut.has(i) && shows(i)) {
        this.comingOut.delete(i);
        void body.perform('intro');
      }
    });
  }
}
