// The cocoons' situation clips (every battle situation, src/battle3d/situations.ts),
// built on each species' stance and character (./cocoon.ts): the whole body
// hops, tips, wobbles and swells, the soft top nods and leans, the eyes
// narrow, shut and smile, and the strands quiver on their springs.
//
// A round cocoon hides a small turn (its outline hardly changes), so every
// clip here moves the whole body clearly: it tips well over on its strands,
// shifts and hops, and each state has a posture of its own (asleep it leans
// to its left, worn down it sags to its right, spent it slumps straight
// forward, cursed it rears and collapses, frozen it is locked tipped back).

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import { type CocoonCharacter, HALF, HAPPY, OPEN, SHUT, SQUEEZE, aside, at, bend, cocoonKit, hop, swell, tip } from './cocoon';

export function cocoonSituations(c: CocoonCharacter): Clip[] {
  const { key, snap, fall, clip, b } = cocoonKit(c);
  const w = c.watchful;
  /** A shift of the body (heights): z toward the foe, x to its left. */
  const shift = (z: number, x = 0): Pose => ({ root: { z, x } });

  /**
   * Idle. Silcoon keeps watch: it sways slowly like a cocoon hanging from its
   * thread, breathing, and now and then its top turns aside to glance round
   * with a watchful squint. Cascoon hides motionless: barely a rock, a slow
   * breath, the glare fixed on the foe.
   */
  const idle = w
    ? clip('idle', 3.2, [
      key(0),
      key(0.8, tip(2, 4), bend(0, 0, 0, 0, 0), swell(1.02)),
      key(1.4, tip(0.5, 1), bend(0, 1, 0, 0, 10), swell(1.006), HALF),
      key(1.9, tip(-1, -4), bend(0, 1, 0, 0, 9), swell(1.018), HALF),
      key(2.5, tip(-1.5, -1.5), bend(0, 0, 0, 0, -3), swell(1.004)),
      key(3.2),
    ], [], true)
    : clip('idle', 3.2, [
      key(0),
      key(1.0, tip(1.4, 1), swell(1.016)),
      key(1.9, tip(0.3, -0.8), bend(0, 1), swell(1.003)),
      key(2.5, tip(-0.8, 0.4), swell(1.012)),
      key(3.2),
    ], [], true);

  /**
   * Sent out: tipped back with its eyes shut, it pops up in a hop, eyes
   * wide, shivers (the cry: the strands quiver), lands with a wobble and
   * settles, watching (Silcoon) or glaring (Cascoon).
   */
  const intro = clip('intro', 1.6, [
    key(0, tip(-12), bend(-4, -6), swell(0.94), SHUT),
    key(0.18, tip(-14), bend(-5, -7), swell(0.93), SHUT),
    snap(0.36, hop(0.12 * b), tip(4), bend(-2, -3), swell(1.05), OPEN),
    key(0.5, hop(0.13 * b), tip(3, 3), bend(-2, -3, 0, -3), swell(1.05), OPEN),
    key(0.58, hop(0.1 * b), tip(3, -3), bend(-2, -3, 0, 3), swell(1.04), OPEN),
    fall(0.7, tip(-3), bend(2, 4), swell(0.95), OPEN),
    key(0.84, tip(4, 2), bend(-1, -1), swell(1.01), w ? OPEN : HALF),
    key(1.0, tip(-2, -1), swell(1.0), w ? OPEN : HALF),
    key(1.2, tip(1), HALF),
    key(1.6, OPEN),
  ], [{ t: 0.42, name: 'cry' }]);

  /** Hit: it rocks back on its strands with its eyes squeezed shut, then wobbles back upright. */
  const hit = clip('hit', 0.62, [
    key(0),
    snap(0.05, tip(-16 * b), shift(-0.03), bend(-5, -7), swell(0.97), SQUEEZE),
    key(0.2, tip(-7 * b), shift(-0.02), bend(-2, -3), SQUEEZE),
    key(0.36, tip(6 * b), bend(2, 3), HALF),
    key(0.5, tip(-1.5), OPEN),
    key(0.62, OPEN),
  ]);

  /** A heavy blow: it is knocked back in a little hop, tipped far back, lands and wobbles twice before it steadies. */
  const hitStrong = clip('hit_strong', 1.0, [
    key(0),
    snap(0.04, hop(0.05), tip(-28 * b, 5), shift(-0.07), bend(-6, -9), swell(0.96), SQUEEZE),
    key(0.2, tip(-15 * b, 3), shift(-0.08), bend(-3, -4), SQUEEZE),
    key(0.36, tip(10 * b, -4), shift(-0.05), bend(3, 5), HALF),
    key(0.52, tip(-6, 3), shift(-0.02), bend(-2, -2), HALF),
    key(0.68, tip(3, -1.5), OPEN),
    key(0.84, tip(-1, 0.5), OPEN),
    key(1.0, OPEN),
  ]);

  /**
   * Fainting: worn out, it wobbles with its eyes drooping, then tips over
   * onto its side (as far as a cocoon tips: its strands stop it) with its
   * eyes shut, and from the 'shrink' shrinks away.
   */
  const faint = clip('faint', 1.6, [
    key(0),
    key(0.16, tip(-4, -8), bend(0, 2, 0, -2), HALF),
    key(0.34, tip(3, 7), bend(1, 3, 0, 2), HALF),
    key(0.52, tip(0, -4), bend(2, 5), SHUT),
    fall(0.84, tip(6, 34), bend(4, 8, 6, 8), swell(0.98), SHUT),
    key(0.98, tip(5, 32), bend(4, 8, 5, 7), swell(0.98), SHUT),
    key(1.6, tip(5, 33), bend(4, 8, 5, 8), swell(0.98), SHUT),
  ], [{ t: 1.04, name: 'shrink' }]);

  /** Dodge: it hops aside out of the way, lands with a wobble and hops back onto its spot. */
  const dodge = clip('dodge', 0.86, [
    key(0),
    key(0.08, tip(-3, 6), bend(0, 0, 3), swell(0.97), HALF),
    snap(0.18, hop(0.1 * b), aside(0.24), tip(2, -12), swell(1.03), OPEN),
    fall(0.3, aside(0.3), tip(-2, -4), swell(0.95), OPEN),
    key(0.44, hop(0.07 * b), aside(0.14), tip(0, 6), swell(1.02), HALF),
    fall(0.56, tip(1, 2), swell(0.96), HALF),
    key(0.7, tip(-1, -1), OPEN),
    key(0.86, OPEN),
  ]);

  /** Unaffected: it gives a smug little rock and puffs up, eyes narrowed, unimpressed. */
  const unaffected = clip('unaffected', 1.2, [
    key(0),
    key(0.16, tip(-10, 4), bend(-3, -6), swell(1.04), HALF),
    key(0.32, tip(7, -7), bend(2, 4, 0, -5), swell(1.055), HALF),
    key(0.48, tip(-5, 7), bend(-1, -3, 0, 5), swell(1.05), HALF),
    key(0.64, tip(3, -3), swell(1.03), HALF),
    key(0.86, tip(-1, 0), swell(1.005), OPEN),
    key(1.2, OPEN),
  ]);

  /** Home from the foe after a run of hits: two hops back, a wobble. */
  const returnHome = clip('return_home', 1.0, [
    key(0, at(1)),
    key(0.1, at(1, 0, 0, -4), bend(1, 2), swell(0.96), HALF),
    key(0.24, at(0.55, 0.14 * b, 0, -8), swell(1.03), OPEN),
    fall(0.38, at(0.22, 0, 0, 3), bend(2, 3), swell(0.95), OPEN),
    key(0.5, at(0.08, 0.07 * b, 0, -4), swell(1.02), OPEN),
    fall(0.62, at(0, 0, 0, 3), bend(2, 3), swell(0.96), HALF),
    key(0.78, tip(-2, 1), OPEN),
    key(1.0, OPEN),
  ]);

  // Status conditions ------------------------------------------------------------------

  /** Asleep (its loop's posture): tipped forward and leaning over to its left on its strands, top bowed, eyes shut. */
  const SLEEP: Pose = compose({}, tip(9, -10), bend(3, 10, -3, -5), SHUT);

  /**
   * Falling asleep: the eyes droop and it nods far forward, jerks back up
   * awake with a start, then nods again, slowly this time, and leans over
   * to its left into sleep.
   */
  const statusSleep = clip('status_sleep', 1.6, [
    key(0),
    key(0.2, tip(3, -2), bend(1, 4), HALF),
    key(0.46, tip(15, 0), bend(4, 13), SHUT),
    snap(0.6, tip(-6, 2), bend(-2, -4), swell(1.03), HALF),
    key(0.78, tip(-5, 1), bend(-2, -3), swell(1.02), HALF),
    key(1.08, tip(9, -8), bend(3, 9, -2, -4), SHUT),
    key(1.34, tip(4, -3), bend(1, 4, -1, -1), swell(1.01), SHUT),
    key(1.6, SHUT),
  ]);

  /** Poisoned: a sickly shudder that shrinks it, eyes squeezed, then a queasy lurch over to its right. */
  const statusPoison = clip('status_poison', 1.36, [
    key(0),
    key(0.12, tip(5, 6), bend(2, 5), swell(0.96), SQUEEZE),
    key(0.2, tip(5, -6), bend(2, 5), swell(0.955), SQUEEZE),
    key(0.28, tip(5, 6), bend(2, 5), swell(0.96), SQUEEZE),
    key(0.36, tip(5, -5), bend(2, 5), swell(0.955), SQUEEZE),
    key(0.46, tip(6, 4), bend(2, 5), swell(0.96), SQUEEZE),
    key(0.7, tip(11, 14), shift(0, -0.03), bend(3, 8, 5, 8), swell(0.975), HALF),
    key(0.94, tip(6, 8), bend(2, 5, 3, 4), HALF),
    key(1.14, tip(1.5, 1), HALF),
    key(1.36, OPEN),
  ]);

  /** Burned: it jumps as the burn bites, eyes squeezed, then shakes itself hard to put it out. */
  const statusBurn = clip('status_burn', 1.24, [
    key(0),
    snap(0.05, hop(0.08 * b), tip(-12), swell(1.05), SQUEEZE),
    fall(0.18, tip(4), swell(0.96), SQUEEZE),
    key(0.3, tip(0, 12), bend(0, 0, 4, 6), OPEN),
    key(0.4, tip(0, -12), bend(0, 0, -4, -6), OPEN),
    key(0.5, tip(0, 9), bend(0, 0, 3, 4), OPEN),
    key(0.6, tip(0, -6), bend(0, 0, -2, -3), OPEN),
    key(0.8, tip(0, 2), HALF),
    key(1.24, OPEN),
  ]);

  /** Paralysed: it seizes up stiff, then jerks in sharp twitches one way and the other, the strands jumping. */
  const statusParalysis = clip('status_paralysis', 1.36, [
    key(0),
    snap(0.06, tip(-6), bend(-2, -4), swell(1.03), HALF),
    key(0.2, tip(-6.5, 1), bend(-2, -4), swell(1.03), HALF),
    snap(0.26, tip(6, -12), bend(3, 5, -4, -6), swell(1.02), SQUEEZE),
    key(0.36, tip(-6, 1), bend(-2, -4), swell(1.03), HALF),
    snap(0.5, tip(-12, 11), bend(-4, -6, 3, 5), swell(1.02), SQUEEZE),
    key(0.6, tip(-6), bend(-2, -4), swell(1.03), HALF),
    snap(0.76, tip(4, 9), bend(2, 3, 3, 4), swell(1.02), SQUEEZE),
    key(0.9, tip(-3), bend(-1, -2), HALF),
    key(1.1, tip(1), HALF),
    key(1.36, OPEN),
  ]);

  /** Frozen: locked stiff in the ice, tipped back and to its left, straining in small quivers, then thawing loose. */
  const statusFreeze = clip('status_freeze', 1.5, [
    key(0),
    snap(0.1, tip(-10, -9), bend(-3, -5, -2), swell(0.97), SQUEEZE),
    key(0.3, tip(-10, -7), bend(-3, -5, -1), swell(0.97), SQUEEZE),
    key(0.4, tip(-10, -10), bend(-3, -5, -2.5), swell(0.97), SQUEEZE),
    key(0.5, tip(-11, -7), bend(-3, -6, -1), swell(0.965), SQUEEZE),
    key(0.6, tip(-11, -10), bend(-3, -6, -2.5), swell(0.965), SQUEEZE),
    key(0.72, tip(-11.5, -7), bend(-3, -6, -1), swell(0.96), SQUEEZE),
    key(0.84, tip(-9, -8), bend(-3, -5, -2), swell(0.97), SQUEEZE),
    key(1.0, tip(-3, -2), HALF),
    key(1.22, tip(1.5, 1), HALF),
    key(1.5, OPEN),
  ]);

  /** Confused: it wobbles round in wide circles on its strands, the top lolling the other way, eyes swimming. */
  const statusConfusion = clip('status_confusion', 1.6, [
    key(0),
    key(0.2, tip(0, 11), bend(0, 0, -4, -7), HALF),
    key(0.4, tip(11, 0), bend(-4, -7), HALF),
    key(0.6, tip(0, -11), bend(0, 0, 4, 7), HALF),
    key(0.8, tip(-11, 0), bend(4, 7), HALF),
    key(1.0, tip(0, 8), bend(0, 0, -3, -5), HALF),
    key(1.2, tip(5, -3), bend(-1, -2, 1, 1), HALF),
    key(1.4, tip(0.5), OPEN),
    key(1.6, OPEN),
  ]);

  /** Infatuated: leaning in toward the foe, it sways dreamily from side to side with a happy look, the top tilted. */
  const statusInfatuation = clip('status_infatuation', 1.6, [
    key(0),
    key(0.24, tip(6, -10), shift(0.02), bend(1, 4, -3, -7), swell(1.02), HAPPY),
    key(0.56, tip(6, 10), shift(0.02), bend(1, 4, 3, 7), swell(1.03), HAPPY),
    key(0.88, tip(6, -9), shift(0.02), bend(1, 4, -3, -6), swell(1.02), HAPPY),
    key(1.18, tip(3, 5), bend(0, 2, 1, 3), swell(1.01), HAPPY),
    key(1.4, tip(0, -1), OPEN),
    key(1.6, OPEN),
  ]);

  /** Cursed: the curse bites and it rears back, then collapses forward and over to its left, hunched and shrunk, shuddering. */
  const statusCurse = clip('status_curse', 1.5, [
    key(0),
    snap(0.12, tip(-14), bend(-5, -8), swell(1.03), SQUEEZE),
    key(0.34, tip(18, -9), bend(6, 13, -3, -4), swell(0.95), SHUT),
    key(0.5, tip(19, -5), bend(6, 14, -3, -4), swell(0.94), SHUT),
    key(0.6, tip(19, -13), bend(6, 14, -3, -4), swell(0.94), SHUT),
    key(0.7, tip(19, -6), bend(6, 14, -3, -4), swell(0.94), SHUT),
    key(0.9, tip(12, -6), bend(4, 9, -2, -2), swell(0.96), HALF),
    key(1.18, tip(4), bend(1, 3), HALF),
    key(1.5, OPEN),
  ]);

  /** Nightmare: asleep, it writhes, rocking and twisting one way and the other. */
  const statusNightmare = clip('status_nightmare', 1.6, [
    key(0, SHUT),
    key(0.15, tip(5, 12), bend(2, 5, -5, -7), SHUT),
    key(0.35, tip(-7, -11), bend(-3, -5, 5, 7), SQUEEZE),
    key(0.55, tip(7, 13), bend(3, 6, -5, -8), SHUT),
    key(0.75, tip(-6, -10), bend(-2, -4, 4, 6), SQUEEZE),
    key(0.95, tip(3, 6), bend(1, 2, -2, -3), SHUT),
    key(1.2, tip(1.5), SHUT),
    key(1.6, SHUT),
  ]);

  /** Wrapped: squeezed tight in a bind, it strains and rocks hard against it. */
  const statusWrapped = clip('status_wrapped', 1.5, [
    key(0),
    key(0.1, swell(0.92), bend(-3, -3), SQUEEZE),
    key(0.3, tip(-6, 11), bend(-3, -4, -4, -5), swell(0.92), SQUEEZE),
    key(0.5, tip(-6, -11), bend(-3, -4, 4, 5), swell(0.92), SQUEEZE),
    key(0.7, tip(-7, 10), bend(-3, -4, -3, -4), swell(0.915), SQUEEZE),
    key(0.9, tip(-4, -6), bend(-2, -3, 2, 3), swell(0.94), SQUEEZE),
    key(1.1, tip(-1.5), swell(0.99), HALF),
    key(1.5, OPEN),
  ]);

  // States that last (loops) ---------------------------------------------------------

  /** Asleep: leaning over to its left on its strands, eyes shut, breathing slow and deep. */
  const idleAsleep = clip('idle_asleep', 3.2, [
    key(0, SLEEP),
    key(1.3, SLEEP, tip(-3, -2), bend(-1, -2), swell(1.03)),
    key(2.0, SLEEP, tip(-1.5, -1), swell(1.012)),
    key(3.2, SLEEP),
  ], [], true);

  /** Worn down: sagging forward and over to its right, eyes heavy, heaving with big tired breaths. */
  const TIRED: Pose = compose({}, tip(11, 9), bend(4, 10, 3, 5), HALF);
  const idleTired = clip('idle_tired', 2.2, [
    key(0, TIRED),
    key(0.35, TIRED, tip(-5, -2), swell(1.035)),
    key(0.7, TIRED, tip(1), swell(0.99)),
    key(1.05, TIRED, tip(-4.5, -3), swell(1.03)),
    key(1.45, TIRED, tip(1.5, 1), swell(0.99)),
    key(1.8, TIRED, tip(-4), swell(1.03)),
    key(2.2, TIRED),
  ], [], true);

  // The game's other animations ---------------------------------------------------------

  /** Stat up: it hops up and swells, puffed and proud, eyes fierce, and holds it with a tremor. */
  const statUp = clip('stat_up', 1.36, [
    key(0),
    key(0.16, tip(-4), swell(0.95), HALF),
    snap(0.3, hop(0.07 * b), tip(-8), bend(-3, -5), swell(1.07), OPEN),
    fall(0.44, tip(-6), bend(-2, -4), swell(1.07), w ? OPEN : HALF),
    key(0.58, tip(-6, 1.5), bend(-2, -4), swell(1.075), w ? OPEN : HALF),
    key(0.72, tip(-6.5, -1.5), bend(-2, -4), swell(1.07), w ? OPEN : HALF),
    key(0.9, tip(-2), swell(1.03), HALF),
    key(1.36, OPEN),
  ]);

  /** Stat down: it shrinks back small and unsteady, wobbling wide from side to side, eyes drooping. */
  const statDown = clip('stat_down', 1.36, [
    key(0),
    key(0.18, tip(-7), shift(-0.02), bend(-2, 4), swell(0.93), HALF),
    key(0.36, tip(-5, 10), shift(-0.02), bend(-2, 4, -3), swell(0.93), HALF),
    key(0.52, tip(-5, -10), shift(-0.02), bend(-2, 4, 3), swell(0.935), HALF),
    key(0.68, tip(-4, 6), bend(-1, 3), swell(0.95), HALF),
    key(0.9, tip(-1.5, -2), swell(0.98), HALF),
    key(1.1, tip(1), OPEN),
    key(1.36, OPEN),
  ]);

  /** Level up: two happy hops, beaming. */
  const levelUp = clip('level_up', 1.4, [
    key(0),
    key(0.1, tip(-3), swell(0.95), HAPPY),
    snap(0.22, hop(0.1 * b), tip(4), swell(1.05), HAPPY),
    fall(0.36, tip(-2), swell(0.95), HAPPY),
    key(0.5, hop(0.12 * b), tip(-4, 4), swell(1.05), HAPPY),
    fall(0.64, tip(2, -2), swell(0.95), HAPPY),
    key(0.8, tip(-2, 2), swell(1.02), HAPPY),
    key(1.0, tip(1, -1), HAPPY),
    key(1.4, OPEN),
  ]);

  /**
   * Drained by Leech Seed: a jolt forward as the seed pulls at it, a
   * shiver, then it sags back and over to its left as the energy leaves it,
   * shrinking.
   */
  const drained = clip('drained', 1.4, [
    key(0),
    snap(0.1, tip(10, 3), shift(0.03), bend(3, 5), swell(0.99), SQUEEZE),
    key(0.22, tip(9, -3), shift(0.03), bend(3, 5), swell(0.98), SQUEEZE),
    key(0.46, tip(-9, -8), bend(-3, -6, -2, -3), swell(0.955), HALF),
    key(0.72, tip(-11, -10), bend(-4, -7, -3, -4), swell(0.94), SHUT),
    key(0.96, tip(-6, -5), bend(-2, -4), swell(0.965), HALF),
    key(1.16, tip(-1.5, -1), HALF),
    key(1.4, OPEN),
  ]);

  /** Healed: it rises up in a little hop and tips its face back to the light, drawing a deep contented breath, eyes smiling. */
  const healed = clip('healed', 1.36, [
    key(0),
    key(0.2, tip(-8), hop(0.04), bend(-3, -5), swell(1.05), HAPPY),
    key(0.46, tip(-12, 2), hop(0.05), bend(-4, -7), swell(1.07), HAPPY),
    fall(0.7, tip(2), bend(1, 2), swell(0.99), HAPPY),
    key(0.96, tip(-2), swell(1.005), OPEN),
    key(1.36, OPEN),
  ]);

  /** Focus: it tips back and tenses tight, drawn back like a coiled spring, eyes narrowed, still but for a tremor. */
  const focus = clip('focus', 1.36, [
    key(0),
    key(0.2, tip(-11), shift(-0.03), bend(-4, -6), swell(0.95), HALF),
    key(0.4, tip(-13, 1), shift(-0.04), bend(-4, -8), swell(0.94), HALF),
    key(0.55, tip(-13, -1), shift(-0.04), bend(-4, -8), swell(0.945), HALF),
    key(0.7, tip(-13.5, 1), shift(-0.04), bend(-4, -8), swell(0.94), HALF),
    key(0.86, tip(-13, 0), shift(-0.04), bend(-4, -8), swell(0.945), HALF),
    key(1.06, tip(-4), shift(-0.01), swell(0.98), HALF),
    key(1.36, OPEN),
  ]);

  /** Hanging on at 1 HP: a big lurch back, a teeter forward as if to topple, then it steadies itself. */
  const hangOn = clip('hang_on', 1.36, [
    key(0),
    snap(0.08, tip(-22 * b, -4), shift(-0.04), bend(-5, -8), SQUEEZE),
    key(0.3, tip(16 * b, 6), shift(0.02), bend(4, 7), HALF),
    key(0.5, tip(-8, -3), bend(-2, -3), HALF),
    key(0.68, tip(4, 1), bend(1, 2), swell(0.97), HALF),
    key(0.9, tip(-1), swell(1.01), HALF),
    key(1.36, OPEN),
  ]);

  // What the game only says ------------------------------------------------------------------

  /** Flinched: startled, it jumps with its eyes squeezed, then falters, drooping. */
  const flinch = clip('flinch', 0.95, [
    key(0),
    snap(0.05, hop(0.06), tip(-10, 8), bend(-3, -5, 3, 4), swell(1.03), SQUEEZE),
    fall(0.2, tip(-4, 4), SQUEEZE),
    key(0.36, tip(8, -3), bend(2, 6), HALF),
    key(0.54, tip(4, 1), bend(1, 3), HALF),
    key(0.74, tip(1), OPEN),
    key(0.95, OPEN),
  ]);

  /** Must recharge: spent, it slumps straight forward and heaves for breath, unable to move. */
  const recharge = clip('recharge', 1.46, [
    key(0),
    key(0.2, tip(16), shift(0.02), bend(6, 12), swell(0.97), HALF),
    key(0.4, tip(11), shift(0.02), bend(4, 9), swell(1.03), HALF),
    key(0.6, tip(17), shift(0.02), bend(6, 13), swell(0.96), SHUT),
    key(0.8, tip(11), shift(0.02), bend(4, 9), swell(1.03), HALF),
    key(1.0, tip(16), shift(0.02), bend(6, 12), swell(0.97), SHUT),
    key(1.2, tip(6), bend(2, 4), HALF),
    key(1.46, OPEN),
  ]);

  /** Woke up: from its sleep it stirs, starts up in a hop with its eyes wide, shakes itself and is back on guard. */
  const wake = clip('wake', 1.26, [
    key(0, SLEEP),
    key(0.2, SLEEP, tip(-3), SHUT),
    snap(0.32, hop(0.07 * b), tip(-7), swell(1.04), OPEN),
    fall(0.46, tip(0, 7), bend(0, 0, 3, 4), OPEN),
    key(0.58, tip(0, -7), bend(0, 0, -3, -4), OPEN),
    key(0.7, tip(0, 4), OPEN),
    key(0.9, tip(-1.5), HALF),
    key(1.26, OPEN),
  ]);

  /**
   * Shaking it off. Silcoon: a vigorous rocking shake that sets its strands
   * quivering, and back on watch. Cascoon (Shed Skin): it shivers from the
   * base up, then gives a sharp swelling heave, bursting up out of the old
   * skin with the ailment, and settles with a glare.
   */
  const shakeOff = w
    ? clip('shake_off', 1.1, [
      key(0),
      key(0.1, tip(-4), swell(0.98), HALF),
      key(0.18, tip(0, 13), bend(0, 0, 4, 6), SQUEEZE),
      key(0.28, tip(0, -13), bend(0, 0, -4, -6), SQUEEZE),
      key(0.38, tip(0, 10), bend(0, 0, 3, 4), SQUEEZE),
      key(0.48, tip(0, -7), bend(0, 0, -2, -3), SQUEEZE),
      key(0.6, tip(0, 3), OPEN),
      key(0.8, tip(-1.5), OPEN),
      key(1.1, OPEN),
    ])
    : clip('shake_off', 1.2, [
      key(0),
      key(0.1, tip(3, 3), swell(0.97), SQUEEZE),
      key(0.18, tip(3, -3), swell(0.965), SQUEEZE),
      key(0.26, tip(5, 3.5), bend(2, 4), swell(0.96), SQUEEZE),
      key(0.34, tip(5, -3.5), bend(2, 4), swell(0.955), SQUEEZE),
      snap(0.42, hop(0.07), tip(-12), bend(-4, -7), swell(1.08), OPEN),
      fall(0.56, tip(3), swell(1.0), OPEN),
      key(0.7, tip(-3, 2), HALF),
      key(0.9, tip(1), HALF),
      key(1.2, OPEN),
    ]);

  /** Broke free of a Poké Ball: it bursts out of a tight shrink in a hop, shakes itself and glares, then settles. */
  const breakFree = clip('break_free', 1.36, [
    key(0, swell(0.88), tip(-6), SQUEEZE),
    snap(0.16, hop(0.08 * b), swell(1.05), tip(4), OPEN),
    fall(0.3, tip(0, 9), swell(1.0), OPEN),
    key(0.4, tip(0, -9), OPEN),
    key(0.5, tip(0, 6), OPEN),
    key(0.64, tip(8), bend(2, 5), HALF),
    key(0.82, tip(8.5, 1), bend(2, 5), HALF),
    key(1.04, tip(1.5), HALF),
    key(1.36, OPEN),
  ]);

  // The weather ------------------------------------------------------------------------------

  /** Rain: it hunches under the rain, eyes shut, then rocks the water off its silk and looks up. */
  const weatherRain = clip('weather_rain', 1.36, [
    key(0),
    key(0.2, tip(7), bend(3, 7), swell(0.97), SHUT),
    key(0.44, tip(8, 1), bend(3, 8), swell(0.965), SHUT),
    key(0.56, tip(3, 11), bend(1, 2, 4, 4), SHUT),
    key(0.64, tip(3, -11), bend(1, 2, -4, -4), SHUT),
    key(0.72, tip(3, 8), bend(1, 2, 3, 3), SHUT),
    key(0.8, tip(1, -5), SHUT),
    key(1.02, tip(-8), bend(-3, -6), OPEN),
    key(1.36, OPEN),
  ]);

  /** Harsh sunlight: it squints, tips back and turns its top aside from the glare. */
  const weatherSun = clip('weather_sun', 1.3, [
    key(0),
    key(0.2, tip(-6), bend(-2, -4), HALF),
    key(0.42, tip(-4, 8), bend(0, 2, 3, 6, -14), SHUT),
    key(0.72, tip(-4, 9), bend(0, 2, 3, 6, -16), HALF),
    key(0.96, tip(-1, 3), bend(0, 1, 1, 1, -4), HALF),
    key(1.3, OPEN),
  ]);

  /** Sandstorm: it braces, tipped hard into the wind with its eyes shut, buffeted by the gusts. */
  const weatherSand = clip('weather_sand', 1.36, [
    key(0),
    key(0.16, tip(4, -10), bend(1, 2, -3, -4, 14), SHUT),
    key(0.4, tip(5, -13), bend(1, 3, -4, -5, 16), SHUT),
    key(0.58, tip(5, -16), bend(1, 3, -4, -6, 16), SHUT),
    key(0.78, tip(4, -11), bend(1, 2, -3, -4, 14), SHUT),
    key(1.0, tip(1, -3), bend(0, 1, 0, 0, 4), HALF),
    key(1.36, OPEN),
  ]);

  /** Hail: each hailstone makes it jolt down and aside, eyes squeezed, hunched under the pelting. */
  const weatherHail = clip('weather_hail', 1.3, [
    key(0),
    snap(0.08, tip(9, 9), bend(3, 6, 3, 4), swell(0.95), SQUEEZE),
    key(0.22, tip(5, 3), bend(2, 4), swell(0.96), SQUEEZE),
    snap(0.36, tip(11, -10), bend(3, 7, -3, -5), swell(0.945), SQUEEZE),
    key(0.5, tip(6, -2), bend(2, 4), swell(0.96), SQUEEZE),
    snap(0.7, tip(9, 8), bend(3, 6, 2, 3), swell(0.95), SQUEEZE),
    key(0.9, tip(3), bend(1, 2), HALF),
    key(1.3, OPEN),
  ]);

  return [
    idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome,
    statusSleep, statusPoison, statusBurn, statusParalysis, statusFreeze, statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped,
    idleAsleep, idleTired,
    statUp, statDown, levelUp, drained, healed, focus, hangOn,
    flinch, recharge, wake, shakeOff, breakFree,
    weatherRain, weatherSun, weatherSand, weatherHail,
  ];
}
