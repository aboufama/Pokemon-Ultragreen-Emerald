// The moths' situation clips (every battle situation, src/battle3d/situations.ts),
// built on each species' stance and character (./moth.ts). A moth acts with
// its flight: it rises and sinks, darts, banks and tumbles in the air, and
// its wing beat carries its mood (quick and wide when fired up, slow and
// weak when drowsy or spent, locked when frozen). It never lands: a faint
// droops and curls in the air and shrinks away.

import type { Clip } from '../../../anim/clip';
import { compose } from '../../../anim/animator';
import type { Pose } from '../../../anim/rig';
import { FROWN, GAPE, type MothCharacter, SHUT, at, body, move, mothKit, swell } from './moth';

export function mothSituations(c: MothCharacter): Clip[] {
  const { key, snap, fall, flutter, wings } = mothKit(c);

  /** Idle: it hovers, beating steadily, drifting a little from side to side, its head on the foe. */
  const idle = flutter('idle', 3.2, [
    key(0),
    key(0.8, move(0.02, 0.01, 0, 0, -2), body(0, 1, 3)),
    key(1.6, move(0, 0.02, 0, -1, 0), body(0, -1)),
    key(2.4, move(-0.02, 0.01, 0, 0, 2), body(0, 1, -3)),
    key(3.2),
  ], [], [{ t: 0, rate: 1, amp: 1 }], true);

  /**
   * Sent out: it comes out folded small, wings shut tight over its back,
   * then flings them open and rises with a few strong beats, cries with a
   * snap of its wings (the cry), and settles into its hover.
   */
  const intro = flutter('intro', 1.7, [
    key(0, move(0, -0.06, 0, 8), wings(56, 20), body(4, 12), swell(0.92), SHUT),
    key(0.18, move(0, -0.07, 0, 9), wings(58, 22), body(5, 13), swell(0.91), SHUT),
    snap(0.36, move(0, 0.06, 0, -10), wings(-30, -10), body(-4, -10), swell(1.04), GAPE),
    key(0.5, move(0, 0.1, 0, -8, 3), wings(-32, -10), body(-4, -12, 0, 4), swell(1.05), GAPE),
    key(0.64, move(0, 0.1, 0, -8, -3), wings(-30, -10), body(-4, -12, 0, -4), swell(1.05), GAPE),
    key(0.84, move(0, 0.05, 0, 2), wings(-8, -2), body(0, -2)),
    key(1.06, move(0, 0.02, 0, -1)),
    key(1.34, move(0, 0.01, 0, 0.5)),
    key(1.7),
  ], [{ t: 0.42, name: 'cry' }], [
    { t: 0, rate: 1, amp: 0.1 }, { t: 0.34, rate: 1.8, amp: 1.3 }, { t: 0.9, rate: 1.2, amp: 1.1 }, { t: 1.3, rate: 1, amp: 1 },
  ]);

  /** Hit: knocked back in the air, it tips back with its wings flung up, then beats hard to steady itself. */
  const hit = flutter('hit', 0.66, [
    key(0),
    snap(0.05, move(0, 0.02, -0.04, -18, 8), wings(24, 26), body(-4, -10, 0, 6), FROWN),
    key(0.2, move(0, 0.01, -0.03, -8, 4), wings(10, 12), body(-2, -5, 0, 3), FROWN),
    key(0.38, move(0, 0, -0.01, 4, -2), wings(-6, -2), body(1, 2)),
    key(0.52, move(0, 0, 0, -1)),
    key(0.66),
  ], [], [{ t: 0, rate: 1.8, amp: 1.2 }, { t: 0.4, rate: 1.2, amp: 1 }]);

  /** A heavy blow: it tumbles back in the air, dropping and rolling, wings flailing, and fights its way level again. */
  const hitStrong = flutter('hit_strong', 1.04, [
    key(0),
    snap(0.05, move(0, 0.03, -0.08, -30, 18), wings(30, 30), body(-6, -14, 0, 10), FROWN),
    key(0.2, move(0, -0.05, -0.1, -16, -12), wings(-20, -16), body(-3, -8, 0, -6), FROWN),
    key(0.38, move(0, -0.06, -0.07, 8, 8), wings(18, 14), body(2, 4, 0, 4), FROWN),
    key(0.56, move(0, -0.02, -0.03, -6, -4), wings(-8, -4), body(-1, -2)),
    key(0.74, move(0, 0, -0.01, 2, 2)),
    key(0.88, move(0, 0, 0, -1)),
    key(1.04),
  ], [], [{ t: 0, rate: 2.2, amp: 1.3 }, { t: 0.5, rate: 1.4, amp: 1.1 }, { t: 0.86, rate: 1, amp: 1 }]);

  /**
   * Fainting: its beat falters and slows, its wings droop, it sinks a little
   * and sways; then it curls up in the air, the wings folding down round
   * its body and its head bowed, and from the 'shrink' shrinks away.
   */
  const faint = flutter('faint', 1.7, [
    key(0),
    key(0.2, move(0, -0.02, 0, 4, -6), wings(-6, -12), body(2, 6, 0, -4), FROWN),
    key(0.42, move(0, -0.04, 0, 6, 6), wings(-10, -18), body(3, 10, 0, 4), SHUT),
    key(0.62, move(0, -0.06, 0, 8, -2), wings(-12, -22), body(4, 14), SHUT),
    fall(0.9, move(0, -0.08, 0, 14, 4), wings(-40, -34), body(10, 22), swell(0.97), SHUT),
    key(1.02, move(0, -0.08, 0, 15, 4), wings(-42, -35), body(10, 23), swell(0.97), SHUT),
    key(1.7, move(0, -0.08, 0, 15, 4), wings(-42, -35), body(10, 23), swell(0.97), SHUT),
  ], [{ t: 1.08, name: 'shrink' }], [
    { t: 0, rate: 0.8, amp: 0.8 }, { t: 0.4, rate: 0.6, amp: 0.4 }, { t: 0.86, rate: 0.5, amp: 0.05 },
  ]);

  /** Dodge: it darts aside in the air, banking away from the blow, and flits back to its place. */
  const dodge = flutter('dodge', 0.86, [
    key(0),
    key(0.08, move(-0.02, 0, 0, -2, 6), wings(12, 10)),
    snap(0.18, move(0.26, 0.05, 0, 0, -20), wings(20, 14), body(0, -4, 8)),
    key(0.32, move(0.3, 0.04, 0, 0, -10), body(0, -2, 4)),
    key(0.48, move(0.14, 0.03, 0, 0, 10), wings(6, 6)),
    key(0.62, move(0, 0.01, 0, 0, 3)),
    key(0.86),
  ], [], [{ t: 0, rate: 1.6, amp: 1.1 }, { t: 0.6, rate: 1.1, amp: 1 }]);

  /** Unaffected: it rises lazily, gives its wings a dismissive flick and tilts its head at the foe, unimpressed. */
  const unaffected = flutter('unaffected', 1.24, [
    key(0),
    key(0.18, move(0, 0.04, 0, -4), wings(-12, -6), body(-2, -6)),
    key(0.36, move(0, 0.06, 0, -6, 4), wings(16, 20), body(-2, -8, 12, 10)),
    key(0.54, move(0, 0.06, 0, -4, 2), wings(-16, -6), body(-2, -6, 8, 8)),
    key(0.74, move(0, 0.03, 0, 0), wings(-4, 0), body(0, -2, 2, 2)),
    key(0.96, move(0, 0.01, 0, 0.5)),
    key(1.24),
  ], [], [{ t: 0, rate: 0.8, amp: 0.8 }, { t: 0.9, rate: 1, amp: 1 }]);

  /** Home from the foe after a run of hits: it pushes off and flutters back to its place. */
  const returnHome = flutter('return_home', 0.9, [
    key(0, at(1)),
    key(0.1, at(1, 0.02, 0, -8), wings(14, 12)),
    key(0.28, at(0.5, 0.08, 0, -10), wings(8, 8)),
    key(0.46, at(0.08, 0.02, 0, -3)),
    key(0.62, at(0, 0, 0, 1)),
    key(0.9, at(0)),
  ], [], [{ t: 0, rate: 1.6, amp: 1.1 }, { t: 0.5, rate: 1, amp: 1 }]);

  // Status conditions ---------------------------------------------------------------------

  /** Falling asleep: its beat slows and its wings droop, its head nods, and it sinks into a doze in the air. */
  const statusSleep = flutter('status_sleep', 1.7, [
    key(0),
    key(0.24, move(0, -0.01, 0, 2), wings(-4, -8), body(1, 6, 0, 4)),
    key(0.54, move(0, -0.04, 0, 5), wings(-6, -14), body(2, 12, 0, -4), SHUT),
    key(0.84, move(0, -0.02, 0, 3), wings(-4, -10), body(1, 8, 0, 2), SHUT),
    key(1.14, move(0, -0.05, 0, 6), wings(-8, -16), body(3, 14, 0, -3), SHUT),
    key(1.42, move(0, -0.02, 0, 2), body(1, 4), SHUT),
    key(1.7, SHUT),
  ], [], [{ t: 0, rate: 0.8, amp: 0.8 }, { t: 0.5, rate: 0.55, amp: 0.45 }, { t: 1.4, rate: 0.8, amp: 0.8 }]);

  /** Poisoned: a sickly shudder runs through it, wings trembling, and it lurches down, hunched, before it steadies. */
  const statusPoison = flutter('status_poison', 1.4, [
    key(0),
    key(0.12, move(0, -0.02, 0, 6, 4), wings(4, -6), body(3, 10, 0, 4), FROWN),
    key(0.2, move(0, -0.03, 0, 6, -4), wings(6, -8), body(3, 10, 0, -4), FROWN),
    key(0.28, move(0, -0.03, 0, 6, 4), wings(4, -6), body(3, 10, 0, 4), FROWN),
    key(0.36, move(0, -0.04, 0, 6, -3), wings(6, -8), body(3, 10, 0, -3), FROWN),
    key(0.56, move(0, -0.08, 0, 10, 6), wings(-8, -16), body(4, 14, 0, 6), SHUT),
    key(0.82, move(0, -0.04, 0, 4, -2), wings(-4, -8), body(2, 6, 0, -2), FROWN),
    key(1.08, move(0, -0.01, 0, 1), body(0, 2)),
    key(1.4),
  ], [], [{ t: 0, rate: 2, amp: 0.5 }, { t: 0.5, rate: 0.9, amp: 0.8 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Burned: it jerks up away from the burn, wings beating frantically, then shakes itself and settles. */
  const statusBurn = flutter('status_burn', 1.3, [
    key(0),
    snap(0.06, move(0, 0.08, -0.02, -14, -6), wings(22, 24), body(-4, -10), FROWN),
    key(0.2, move(0, 0.1, -0.02, -8, 4), wings(-10, -4), body(-2, -6), GAPE),
    key(0.34, move(0.04, 0.07, 0, 0, -10), body(0, 0, 10, -6), FROWN),
    key(0.46, move(-0.04, 0.06, 0, 0, 10), body(0, 0, -10, 6), FROWN),
    key(0.58, move(0.02, 0.04, 0, 0, -6), body(0, 0, 6, -3)),
    key(0.76, move(0, 0.02, 0, 0, 2)),
    key(1.0, move(0, 0.01, 0, -0.5)),
    key(1.3),
  ], [], [{ t: 0, rate: 2.4, amp: 1.3 }, { t: 0.6, rate: 1.4, amp: 1.1 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Paralysed: its wings lock half open and it seizes, dropping a little, twitching in jerks as the sparks bite. */
  const statusParalysis = flutter('status_paralysis', 1.44, [
    key(0),
    snap(0.06, move(0, -0.02, 0, -4), wings(-14, 18), body(-2, -4), swell(1.02), FROWN),
    key(0.2, move(0, -0.04, 0, -4, 1), wings(-14, 18), body(-2, -4), swell(1.02), FROWN),
    snap(0.28, move(0.02, -0.03, 0, 4, -10), wings(-4, 26), body(2, 6, 12, -8), SHUT),
    key(0.38, move(0, -0.05, 0, -3, 1), wings(-14, 18), body(-2, -4), FROWN),
    snap(0.52, move(-0.02, -0.04, 0, -10, 10), wings(-24, 10), body(-3, -8, -12, 8), SHUT),
    key(0.62, move(0, -0.06, 0, -3), wings(-14, 18), body(-2, -4), FROWN),
    snap(0.78, move(0, -0.05, 0, 6, 6), wings(-8, 24), body(2, 6, 0, 8), SHUT),
    key(0.94, move(0, -0.03, 0, 0), wings(-6, 8), body(0, -1)),
    key(1.16, move(0, -0.01, 0, 0.5)),
    key(1.44),
  ], [], [{ t: 0, rate: 1, amp: 0.6 }, { t: 0.06, rate: 1, amp: 0.05 }, { t: 0.9, rate: 1.4, amp: 1 }, { t: 1.2, rate: 1, amp: 1 }]);

  /** Frozen: locked in the ice, wings stiff, it strains in tiny quivers and hangs there. */
  const statusFreeze = flutter('status_freeze', 1.54, [
    key(0),
    key(0.1, move(0, -0.01, 0, -2), wings(-4, 4), swell(1.01), SHUT),
    key(0.3, move(0, -0.01, 0, -2, 1.5), wings(-4, 4), body(0, 0, 1), swell(1.01), SHUT),
    key(0.42, move(0, -0.01, 0, -2, -1.5), wings(-5, 5), body(0, 0, -1), swell(1.01), SHUT),
    key(0.54, move(0, -0.01, 0, -3, 2), wings(-4, 4), body(0, -1, 1.5), swell(1.012), SHUT),
    key(0.66, move(0, -0.01, 0, -3, -2), wings(-5, 5), body(0, -1, -1.5), swell(1.012), SHUT),
    key(0.8, move(0, -0.01, 0, -2.5, 1), wings(-4, 4), swell(1.01), SHUT),
    key(1.0, move(0, 0, 0, -1), wings(-2, 2)),
    key(1.24, move(0, 0, 0, 0.5)),
    key(1.54),
  ], [], [{ t: 0, rate: 1, amp: 0.8 }, { t: 0.08, rate: 1, amp: 0 }, { t: 0.98, rate: 1.2, amp: 1 }]);

  /** Confused: it flies in wobbly loops on the spot, banking round and round, its head lolling. */
  const statusConfusion = flutter('status_confusion', 1.64, [
    key(0),
    key(0.2, move(0.08, 0.03, 0.03, -4, -14), body(0, 2, 10, 10), FROWN),
    key(0.4, move(0, 0.05, 0.06, 6, 0), body(0, -4, 0, -12), FROWN),
    key(0.6, move(-0.08, 0.03, 0.03, -4, 14), body(0, 2, -10, -10), FROWN),
    key(0.8, move(0, 0.01, -0.02, -8, 0), body(0, 4, 0, 12), FROWN),
    key(1.0, move(0.06, 0.03, 0.02, 2, -10), body(0, 0, 8, 8)),
    key(1.2, move(-0.03, 0.02, 0, -2, 4), body(0, 0, -4, -4)),
    key(1.4, move(0, 0.01, 0, 0.5)),
    key(1.64),
  ], [], [{ t: 0, rate: 1.1, amp: 1 }]);

  /** Infatuated: lovestruck, it sways dreamily in the air with its head tilted, its beat slow and fluttery. */
  const statusInfatuation = flutter('status_infatuation', 1.64, [
    key(0),
    key(0.24, move(-0.04, 0.03, 0, -4, -10), wings(-12, -4), body(-2, -6, 8, 16)),
    key(0.56, move(0.04, 0.04, 0, -4, 10), wings(-12, -4), body(-2, -6, 8, 18)),
    key(0.88, move(-0.03, 0.03, 0, -4, -8), wings(-10, -4), body(-2, -5, 6, 14)),
    key(1.18, move(0.02, 0.02, 0, -2, 4), body(-1, -3, 3, 8)),
    key(1.4, move(0, 0.01, 0, -0.5)),
    key(1.64),
  ], [], [{ t: 0, rate: 0.7, amp: 0.7 }, { t: 1.2, rate: 1, amp: 1 }]);

  /** Cursed: it sinks under the curse as if weighed down, wings dragging, hunched and shuddering. */
  const statusCurse = flutter('status_curse', 1.54, [
    key(0),
    key(0.3, move(0, -0.06, 0, 10), wings(-8, -20), body(4, 14), FROWN),
    key(0.5, move(0, -0.08, 0, 14, 2), wings(-10, -24), body(6, 18), swell(0.97), SHUT),
    key(0.6, move(0, -0.08, 0, 14, -2), wings(-10, -24), body(6, 18), swell(0.97), SHUT),
    key(0.7, move(0, -0.08, 0, 14, 2), wings(-10, -24), body(6, 18), swell(0.97), SHUT),
    key(0.92, move(0, -0.05, 0, 8), wings(-6, -14), body(4, 10), FROWN),
    key(1.2, move(0, -0.01, 0, 2), body(1, 3)),
    key(1.54),
  ], [], [{ t: 0, rate: 0.8, amp: 0.8 }, { t: 0.3, rate: 0.6, amp: 0.4 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Nightmare: asleep, it thrashes in the air, wings twitching and jerking, rolling one way and the other. */
  const statusNightmare = flutter('status_nightmare', 1.64, [
    key(0, SHUT),
    key(0.16, move(0.03, -0.03, 0, 6, 12), { bones: { wingL: { y: -12, z: -18 }, wingR: { y: 16, z: 6 } } }, body(3, 12, 8), SHUT),
    key(0.36, move(-0.03, -0.05, 0, 8, -12), { bones: { wingL: { y: 14, z: 6 }, wingR: { y: -12, z: -18 } } }, body(3, 14, -8), FROWN),
    key(0.56, move(0.03, -0.03, 0, 4, 10), { bones: { wingL: { y: -14, z: -18 }, wingR: { y: 12, z: 4 } } }, body(2, 10, 8), SHUT),
    key(0.76, move(-0.02, -0.04, 0, 6, -8), { bones: { wingL: { y: 10, z: 4 }, wingR: { y: -12, z: -16 } } }, body(3, 12, -6), FROWN),
    key(0.98, move(0, -0.03, 0, 4, 3), wings(-6, -12), body(2, 8, 2), SHUT),
    key(1.26, move(0, -0.01, 0, 1), body(1, 3), SHUT),
    key(1.64, SHUT),
  ], [], [{ t: 0, rate: 0.6, amp: 0.4 }, { t: 1.2, rate: 0.8, amp: 0.8 }]);

  /** Wrapped: its wings pinned to its sides, it twists and strains against the bind, sinking with the effort. */
  const statusWrapped = flutter('status_wrapped', 1.54, [
    key(0),
    key(0.12, move(0, -0.04, 0, 2), wings(46, -24), body(2, 6), swell(0.95), FROWN),
    key(0.32, move(0.03, -0.05, 0, 4, 12), wings(48, -26), body(2, 6, 12), swell(0.95), SHUT),
    key(0.52, move(-0.03, -0.05, 0, 4, -12), wings(48, -26), body(2, 6, -12), swell(0.95), SHUT),
    key(0.72, move(0.02, -0.06, 0, 5, 10), wings(50, -28), body(3, 7, 10), swell(0.94), SHUT),
    key(0.92, move(-0.02, -0.04, 0, 3, -6), wings(40, -20), body(2, 5, -6), swell(0.96), FROWN),
    key(1.14, move(0, -0.01, 0, 1), wings(6, -2), swell(1.0)),
    key(1.54),
  ], [], [{ t: 0, rate: 1, amp: 0.8 }, { t: 0.1, rate: 1, amp: 0.05 }, { t: 1.1, rate: 1.4, amp: 1 }]);

  // States that last (loops) ----------------------------------------------------------------

  /** Asleep: it dozes in the air, wings drooping and beating slow and weak, head sunk, sinking and lifting with its breath. */
  const SLEEP: Pose = compose({}, move(0, -0.05, 0, 6), wings(-6, -16), body(3, 14), SHUT);
  const idleAsleep = flutter('idle_asleep', 3.6, [
    key(0, SLEEP),
    key(1.4, SLEEP, move(0, 0.02, 0, -2), body(-1, -3), swell(1.015)),
    key(2.4, SLEEP, move(0, 0.01, 0, -1), swell(1.005)),
    key(3.6, SLEEP),
  ], [], [{ t: 0, rate: 0.5, amp: 0.4 }], true);

  /** Worn down: it hangs low on labouring wings, heavy slow beats, head drooping, still facing the foe. */
  const TIRED: Pose = compose({}, move(0, -0.04, 0, 5), body(2, 8), FROWN);
  const idleTired = flutter('idle_tired', 2.4, [
    key(0, TIRED),
    key(0.6, TIRED, move(0, 0.02, 0, -2)),
    key(1.2, TIRED, move(0, -0.01, 0, 1)),
    key(1.8, TIRED, move(0, 0.02, 0, -2), body(0, 0, 0, 3)),
    key(2.4, TIRED),
  ], [], [{ t: 0, rate: 0.75, amp: 1.25 }], true);

  // The game's other animations ------------------------------------------------------------

  /** Stat up: it rises proudly, spreads its wings their widest and highest and swells, beating strong, fierce. */
  const statUp = flutter('stat_up', 1.4, [
    key(0),
    key(0.16, move(0, -0.02, 0, 4), wings(20, 8), body(2, 4), swell(0.97)),
    snap(0.3, move(0, 0.1, 0, -8), wings(-30, 12), body(-4, -10), swell(1.07), GAPE),
    key(0.48, move(0, 0.11, 0, -8, 1), wings(-32, 14), body(-4, -10), swell(1.075), GAPE),
    key(0.66, move(0, 0.11, 0, -9, -1), wings(-32, 14), body(-4, -11), swell(1.07)),
    key(0.86, move(0, 0.05, 0, -3), wings(-10, 4), body(-1, -3), swell(1.03)),
    key(1.1, move(0, 0.01, 0, 0.5)),
    key(1.4),
  ], [], [{ t: 0, rate: 1, amp: 1 }, { t: 0.28, rate: 1.4, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Stat down: it sinks, shrinking back, wings drooping, and wobbles unsteadily in the air. */
  const statDown = flutter('stat_down', 1.4, [
    key(0),
    key(0.2, move(0, -0.06, -0.03, -4), wings(-6, -16), body(2, 6), swell(0.94), FROWN),
    key(0.38, move(0.02, -0.07, -0.03, -4, 8), wings(-6, -16), body(2, 6, 0, 6), swell(0.94), FROWN),
    key(0.56, move(-0.02, -0.07, -0.03, -4, -8), wings(-6, -16), body(2, 6, 0, -6), swell(0.945), FROWN),
    key(0.74, move(0, -0.05, -0.02, -2, 4), wings(-4, -10), swell(0.96)),
    key(0.98, move(0, -0.02, 0, 0), swell(0.985)),
    key(1.4),
  ], [], [{ t: 0, rate: 0.8, amp: 0.7 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Level up: a joyful spinning rise in the air, wings wide, and a happy flutter back down. */
  const levelUp = flutter('level_up', 1.5, [
    key(0),
    key(0.12, move(0, -0.02, 0, 4), wings(14, 10), swell(0.97)),
    snap(0.28, move(0, 0.12, 0, -8, 0, 120), wings(-24, -8), body(-3, -8), swell(1.04), GAPE),
    key(0.46, move(0, 0.16, 0, -6, 0, 300), wings(-26, -8), body(-3, -8), swell(1.04), GAPE),
    key(0.62, move(0, 0.12, 0, -2, 0, 360), wings(-14, -4), body(-2, -4)),
    key(0.84, move(0, 0.04, 0, 2, 4, 360), body(0, 0, 0, 6)),
    key(1.08, move(0, 0.01, 0, -1, -2, 360), body(0, 0, 0, -3)),
    key(1.5, move(0, 0, 0, 0, 0, 360)),
  ], [], [{ t: 0, rate: 1.2, amp: 1 }, { t: 0.26, rate: 1.6, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Drained by Leech Seed: a shiver, then it sags lower as the energy leaves it, the beat weakening. */
  const drained = flutter('drained', 1.44, [
    key(0),
    key(0.12, move(0, 0, 0, 0, 3), wings(2, -2), FROWN),
    key(0.42, move(0, -0.06, 0, 8), wings(-6, -14), body(3, 10), swell(0.97), FROWN),
    key(0.72, move(0, -0.09, 0, 10, -2), wings(-8, -18), body(4, 13), swell(0.96), SHUT),
    key(0.98, move(0, -0.05, 0, 5), wings(-4, -10), body(2, 7), swell(0.98), FROWN),
    key(1.2, move(0, -0.01, 0, 1)),
    key(1.44),
  ], [], [{ t: 0, rate: 1, amp: 1 }, { t: 0.3, rate: 0.6, amp: 0.5 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Healed: it rises easily on a slow, wide, contented beat, swelling with a deep breath, and relaxes. */
  const healed = flutter('healed', 1.44, [
    key(0),
    key(0.28, move(0, 0.06, 0, -6), wings(-14, -4), body(-2, -8), swell(1.04)),
    key(0.54, move(0, 0.08, 0, -7, 1), wings(-16, -4), body(-2, -9, 0, 3), swell(1.05)),
    key(0.8, move(0, 0.04, 0, -2), wings(-6, -2), body(0, -2), swell(1.01)),
    key(1.08, move(0, 0.01, 0, 1)),
    key(1.44),
  ], [], [{ t: 0, rate: 0.7, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Focus: it draws its wings back tight and hangs tense and still in the air, trembling, gathering itself. */
  const focus = flutter('focus', 1.4, [
    key(0),
    key(0.2, move(0, 0.02, -0.03, -8), wings(36, 22), body(-3, -6), swell(0.97)),
    key(0.4, move(0, 0.02, -0.04, -9, 0.5), wings(38, 24), body(-3, -7, 0.5), swell(0.965)),
    key(0.56, move(0, 0.02, -0.04, -9, -0.5), wings(38, 24), body(-3, -7, -0.5), swell(0.965)),
    key(0.72, move(0, 0.02, -0.04, -9.5, 0.5), wings(39, 24), body(-3, -7, 0.5), swell(0.965)),
    key(0.9, move(0, 0.02, -0.03, -8), wings(36, 22), body(-3, -6), swell(0.97)),
    key(1.12, move(0, 0, 0, -1), wings(4, 2)),
    key(1.4),
  ], [], [{ t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1.6, amp: 0.15 }, { t: 1.06, rate: 1, amp: 1 }]);

  /** Hanging on at 1 HP: it lurches down, nearly falling out of the air, beats frantically and hauls itself back up. */
  const hangOn = flutter('hang_on', 1.4, [
    key(0),
    snap(0.08, move(0, -0.02, -0.03, -14, 8), wings(24, 26), body(-4, -10), FROWN),
    fall(0.3, move(0, -0.09, 0, 12, -6), wings(-12, -20), body(4, 12), SHUT),
    key(0.5, move(0, -0.05, 0, -6, 4), wings(10, 8), body(-2, -4), FROWN),
    key(0.7, move(0, -0.01, 0, 2), wings(-4, 0), body(1, 2)),
    key(0.94, move(0, 0.01, 0, -1)),
    key(1.4),
  ], [], [{ t: 0, rate: 1.4, amp: 1.2 }, { t: 0.3, rate: 2.4, amp: 1.3 }, { t: 0.9, rate: 1, amp: 1 }]);

  // What the game only says ------------------------------------------------------------------

  /** Flinched: startled, it jerks back in the air with its wings flared and falters, drooping. */
  const flinch = flutter('flinch', 0.96, [
    key(0),
    snap(0.05, move(0, 0.03, -0.04, -12, -8), wings(-20, 18), body(-3, -8, 16), GAPE),
    key(0.2, move(0, 0.02, -0.03, -8, -6), wings(-14, 12), body(-2, -6, 12)),
    key(0.38, move(0, -0.03, -0.01, 6, 3), wings(-6, -10), body(2, 8, -4), FROWN),
    key(0.56, move(0, -0.02, 0, 3, 1), wings(-4, -6), body(1, 4)),
    key(0.74, move(0, 0, 0, -0.5)),
    key(0.96),
  ], [], [{ t: 0, rate: 1.6, amp: 0.8 }, { t: 0.3, rate: 0.8, amp: 0.7 }, { t: 0.7, rate: 1, amp: 1 }]);

  /** Must recharge: spent, it hangs low and sags on labouring wings, heaving for breath. */
  const recharge = flutter('recharge', 1.5, [
    key(0),
    key(0.2, move(0, -0.06, 0, 8), wings(-6, -14), body(3, 10), FROWN),
    key(0.46, move(0, -0.04, 0, 5), wings(-4, -10), body(2, 8), swell(1.02), GAPE),
    key(0.72, move(0, -0.07, 0, 9), wings(-6, -14), body(3, 11), swell(0.98), FROWN),
    key(0.98, move(0, -0.04, 0, 5), wings(-4, -10), body(2, 8), swell(1.02), GAPE),
    key(1.22, move(0, -0.02, 0, 2), body(1, 3)),
    key(1.5),
  ], [], [{ t: 0, rate: 0.7, amp: 1.25 }, { t: 1.2, rate: 1, amp: 1 }]);

  /** Woke up: from its doze it starts up in the air with a burst of beats, shakes its head and is back on guard. */
  const wake = flutter('wake', 1.3, [
    key(0, SLEEP),
    key(0.2, SLEEP, move(0, 0.01, 0, -2)),
    snap(0.32, move(0, 0.06, 0, -8), wings(-16, 10), body(-3, -8), GAPE),
    key(0.46, move(0, 0.05, 0, -4), wings(-6, 4), body(0, -2, 14, 6)),
    key(0.58, move(0, 0.04, 0, -3), body(0, -2, -12, -6)),
    key(0.7, move(0, 0.03, 0, -2), body(0, -1, 6, 2)),
    key(0.92, move(0, 0.01, 0, 0)),
    key(1.3),
  ], [], [{ t: 0, rate: 0.5, amp: 0.4 }, { t: 0.3, rate: 2, amp: 1.2 }, { t: 0.9, rate: 1, amp: 1 }]);

  /** Shaking it off (thawed, free, cured): a vigorous shake of its whole body and wings, then back on guard. */
  const shakeOff = flutter('shake_off', 1.14, [
    key(0),
    key(0.1, move(0, -0.01, 0, 3), wings(10, 4), swell(0.98)),
    key(0.18, move(0.03, 0, 0, 0, 12), { bones: { wingL: { y: -16, z: 10 }, wingR: { y: 16, z: 10 } } }, body(0, 0, 12, 8)),
    key(0.28, move(-0.03, 0, 0, 0, -12), { bones: { wingL: { y: 16, z: -10 }, wingR: { y: -16, z: -10 } } }, body(0, 0, -12, -8)),
    key(0.38, move(0.02, 0, 0, 0, 9), { bones: { wingL: { y: -12, z: 8 }, wingR: { y: 12, z: 8 } } }, body(0, 0, 9, 6)),
    key(0.48, move(-0.02, 0, 0, 0, -6), { bones: { wingL: { y: 8, z: -6 }, wingR: { y: -8, z: -6 } } }, body(0, 0, -6, -4)),
    key(0.62, move(0, 0.01, 0, 0, 2)),
    key(0.84, move(0, 0, 0, -1)),
    key(1.14),
  ], [], [{ t: 0, rate: 1, amp: 0.4 }, { t: 0.6, rate: 1.2, amp: 1 }]);

  /** Broke free of a Poké Ball: folded small, it bursts out with its wings flung wide, shakes itself and flares at the foe. */
  const breakFree = flutter('break_free', 1.4, [
    key(0, move(0, -0.04, 0, 6), wings(54, 20), body(4, 10), swell(0.9)),
    snap(0.16, move(0, 0.06, 0, -8), wings(-32, 16), body(-3, -8), swell(1.05), GAPE),
    key(0.3, move(0.02, 0.05, 0, -4, 10), wings(-20, 10), body(0, -4, 10)),
    key(0.42, move(-0.02, 0.05, 0, -4, -10), wings(-20, 10), body(0, -4, -10)),
    key(0.56, move(0, 0.04, 0.02, 6), wings(-28, 18), body(3, 8), FROWN),
    key(0.76, move(0, 0.04, 0.02, 7, 1), wings(-28, 18), body(3, 9), FROWN),
    key(1.04, move(0, 0.01, 0, 1), wings(-4, 2)),
    key(1.4),
  ], [], [{ t: 0, rate: 1, amp: 0.1 }, { t: 0.14, rate: 1.8, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 }]);

  // The weather ----------------------------------------------------------------------------------

  /** Rain: it presses its wings down and back against the rain, head low, then shakes the water off and lifts. */
  const weatherRain = flutter('weather_rain', 1.44, [
    key(0),
    key(0.2, move(0, -0.04, 0, 6), wings(30, -18), body(2, 10), SHUT),
    key(0.46, move(0, -0.05, 0, 7, 1), wings(32, -20), body(3, 11), SHUT),
    key(0.6, move(0.02, -0.03, 0, 2, 10), { bones: { wingL: { y: -10, z: 8 }, wingR: { y: 18, z: 12 } } }, body(0, 2, 8)),
    key(0.7, move(-0.02, -0.03, 0, 2, -10), { bones: { wingL: { y: 18, z: -12 }, wingR: { y: -10, z: -8 } } }, body(0, 2, -8)),
    key(0.8, move(0.01, -0.02, 0, 1, 6), body(0, 1, 4)),
    key(1.02, move(0, 0.02, 0, -4), wings(-8, 4), body(-1, -4)),
    key(1.44),
  ], [], [{ t: 0, rate: 1, amp: 0.6 }, { t: 0.56, rate: 1, amp: 0.3 }, { t: 0.9, rate: 1.2, amp: 1 }]);

  /** Harsh sunlight: it squints away from the glare, raising a wing to shade its head, and sinks back into the shade of it. */
  const weatherSun = flutter('weather_sun', 1.36, [
    key(0),
    key(0.2, move(0, 0.02, 0, -6), body(-2, -8), FROWN),
    key(0.44, move(0, -0.02, 0, 4, -6), { bones: { wingL: { y: -34, z: 26 } } }, body(1, 8, -14, -6), SHUT),
    key(0.74, move(0, -0.02, 0, 4, -7), { bones: { wingL: { y: -36, z: 27 } } }, body(1, 8, -16, -6), FROWN),
    key(1.0, move(0, 0, 0, 1, -2), { bones: { wingL: { y: -10, z: 8 } } }, body(0, 2, -4)),
    key(1.36),
  ], [], [{ t: 0, rate: 1, amp: 1 }, { t: 0.4, rate: 1, amp: 0.5 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Sandstorm: it turns its face out of the wind with its wings pulled in, buffeted sideways by the gusts. */
  const weatherSand = flutter('weather_sand', 1.44, [
    key(0),
    key(0.16, move(-0.04, -0.01, 0, 3, 8), wings(30, 4), body(1, 6, 22, 6), SHUT),
    key(0.4, move(-0.08, -0.02, 0, 4, 12), wings(32, 4), body(2, 8, 24, 8), SHUT),
    key(0.58, move(-0.11, -0.02, 0, 4, 16), wings(34, 4), body(2, 8, 24, 8), SHUT),
    key(0.78, move(-0.07, -0.01, 0, 3, 10), wings(28, 4), body(1, 6, 20, 6), SHUT),
    key(1.02, move(-0.02, 0, 0, 1, 3), wings(6, 2), body(0, 2, 5)),
    key(1.44),
  ], [], [{ t: 0, rate: 1.3, amp: 0.5 }, { t: 1.0, rate: 1, amp: 1 }]);

  /** Hail: each hailstone makes it jolt down, wings pulled over its head, cowering under the pelting. */
  const weatherHail = flutter('weather_hail', 1.36, [
    key(0),
    snap(0.08, move(0, -0.04, 0, 8), wings(30, 30), body(3, 12), SHUT),
    key(0.22, move(0, -0.03, 0, 6), wings(28, 28), body(3, 10), FROWN),
    snap(0.36, move(0, -0.06, 0, 10, 5), wings(32, 32), body(4, 13, 0, 5), SHUT),
    key(0.5, move(0, -0.04, 0, 7), wings(28, 28), body(3, 10), FROWN),
    snap(0.7, move(0, -0.06, 0, 9, -4), wings(31, 31), body(4, 12, 0, -4), SHUT),
    key(0.92, move(0, -0.02, 0, 3), wings(8, 8), body(1, 4)),
    key(1.36),
  ], [], [{ t: 0, rate: 1, amp: 0.4 }, { t: 0.9, rate: 1.2, amp: 1 }]);

  return [
    idle, intro, hit, hitStrong, faint, dodge, unaffected, returnHome,
    statusSleep, statusPoison, statusBurn, statusParalysis, statusFreeze, statusConfusion, statusInfatuation, statusCurse, statusNightmare, statusWrapped,
    idleAsleep, idleTired,
    statUp, statDown, levelUp, drained, healed, focus, hangOn,
    flinch, recharge, wake, shakeOff, breakFree,
    weatherRain, weatherSun, weatherSand, weatherHail,
  ];
}
