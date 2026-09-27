// The moths' status moves (Beautifly, Dustox), one clip each: at the foe
// (String Shot from the mouth, Attract, Swagger, Flash, Mimic) and on itself
// (Harden, Protect, Sunny Day, Double Team, Rest, Substitute, Endure, Sleep
// Talk). The wings carry most of the acting, the beat changing with the mood.

import type { Clip } from '../../../anim/clip';
import { type MothCharacter, body, move, mothKit, swell } from './moth';

export function mothStatus(c: MothCharacter): Clip[] {
  const { key, snap, flutter, wings } = mothKit(c);

  /**
   * String Shot: it draws its head back, then thrusts it at the foe and spits
   * a stream of thread from its mouth (emit), weaving its head from side to
   * side to spin the thread over the foe, and pulls back.
   */
  const stringShot = flutter('string_shot', 1.8, [
    key(0),
    key(0.2, move(0, 0.03, -0.02, -8), wings(12, 12), body(-4, -12)),
    snap(0.3, move(0, 0.01, 0.02, 8), wings(-8, -4), body(4, 12)),
    key(0.48, move(0, 0.01, 0.02, 8, 3), body(4, 12, 10, 4)),
    key(0.66, move(0, 0.01, 0.02, 8, -3), body(4, 12, -10, -4)),
    key(0.84, move(0, 0.01, 0.02, 8, 3), body(4, 12, 9, 3)),
    key(1.02, move(0, 0.01, 0.02, 8, -3), body(4, 12, -9, -3)),
    key(1.2, move(0, 0.01, 0.02, 7, 1.5), body(4, 11, 5, 2)),
    key(1.38, move(0, 0.01, 0.01, 6), body(3, 9)),
    key(1.56, move(0, 0.01, 0, -2), body(-1, -3)),
    key(1.8),
  ], [{ t: 0.36, name: 'emit' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.28, rate: 1.2, amp: 0.7 }, { t: 1.4, rate: 1, amp: 1 },
  ]);

  /**
   * Attract: coy and flirty, it tilts its head and banks prettily, flutters
   * its wings daintily, twirls, and blows the foe a heart (emit) with a
   * sweep of the wings.
   */
  const attract = flutter('attract', 1.64, [
    key(0),
    key(0.18, move(-0.04, 0.03, 0, -4, -12), wings(-10, -4), body(-2, -6, 10, 14)),
    key(0.36, move(-0.05, 0.05, 0, -6, -14), wings(10, 10), body(-2, -6, 12, 16)),
    key(0.52, move(0, 0.06, 0, -2, 0, 180), wings(16, 12), body(-2, -4, 0, 6)),
    key(0.66, move(0.03, 0.05, 0.01, 4, 8, 360), wings(-20, -8), body(2, 4, -6, -12)),
    snap(0.74, move(0.03, 0.04, 0.02, 6, 10, 360), wings(-28, -10), body(3, 6, -8, -14)),
    key(0.92, move(0.02, 0.04, 0.01, 4, 8, 360), wings(-18, -6), body(2, 4, -6, -12)),
    key(1.12, move(0, 0.02, 0, 0, 3, 360), body(0, 0, -2, -4)),
    key(1.36, move(0, 0, 0, 0, -1, 360)),
    key(1.64, move(0, 0, 0, 0, 0, 360)),
  ], [{ t: 0.8, name: 'emit' }], [
    { t: 0, rate: 1.4, amp: 0.6 }, { t: 0.5, rate: 1.2, amp: 0.8 }, { t: 0.72, rate: 1, amp: 0.3 }, { t: 1.0, rate: 1.3, amp: 0.8 }, { t: 1.3, rate: 1, amp: 1 },
  ]);

  /**
   * Swagger: cocky, it puffs itself up and throws its wings wide and high in
   * a showy display, struts from side to side in the air rocking its body,
   * and flicks a taunt at the foe (emit).
   */
  const swagger = flutter('swagger', 1.7, [
    key(0),
    key(0.18, move(0, 0.04, 0, -8), wings(-26, 16), body(-4, -10), swell(1.05)),
    key(0.36, move(0.07, 0.05, 0, -8, -10), wings(-28, 18), body(-4, -10, 10, -8), swell(1.06)),
    key(0.56, move(-0.07, 0.05, 0, -8, 10), wings(-28, 18), body(-4, -10, -10, 8), swell(1.06)),
    key(0.74, move(0, 0.05, 0.02, -2), wings(-18, 12), body(0, -4, 0, 10), swell(1.05)),
    snap(0.84, move(0, 0.04, 0.03, 6), wings(-34, 8), body(3, 6, 0, -6), swell(1.05)),
    key(1.02, move(0, 0.04, 0.02, 4), wings(-28, 8), body(2, 4, 0, -4), swell(1.04)),
    key(1.24, move(0, 0.02, 0, -2), wings(-6, 4), body(-1, -3), swell(1.02)),
    key(1.46, move(0, 0, 0, 0.5)),
    key(1.7),
  ], [{ t: 0.9, name: 'emit' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 0.8, amp: 0.5 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  /**
   * Flash: it folds its wings shut in front of itself, gathering the light
   * (curled small), then flings them wide open at the foe in a flare (emit:
   * the screen whites out), and eases back.
   */
  const flash = flutter('flash', 1.5, [
    key(0),
    key(0.2, move(0, 0.02, -0.02, 6), wings(-58, -30), body(4, 12), swell(0.95)),
    key(0.36, move(0, 0.02, -0.03, 8), wings(-62, -32), body(5, 14), swell(0.94)),
    snap(0.46, move(0, 0.06, 0.02, -10), wings(-6, 24), body(-5, -10), swell(1.06)),
    key(0.62, move(0, 0.06, 0.02, -9), wings(-4, 22), body(-4, -9), swell(1.05)),
    key(0.84, move(0, 0.03, 0, -2), wings(0, 6), body(-1, -3), swell(1.02)),
    key(1.1, move(0, 0, 0, 0.5)),
    key(1.5),
  ], [{ t: 0.5, name: 'emit' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1, amp: 0.1 }, { t: 0.8, rate: 1, amp: 1 },
  ]);

  /**
   * Mimic: it leans in and watches the foe closely, head tilting one way and
   * the other, then copies it: a mirrored flourish of the wings, one side,
   * then the other (emit).
   */
  const mimic = flutter('mimic', 1.7, [
    key(0),
    key(0.18, move(0, 0.01, 0.03, 8), body(3, 8, 10, 8)),
    key(0.38, move(0, 0.01, 0.03, 8), body(3, 8, -10, -8)),
    key(0.54, move(0, 0.02, 0.02, 4), body(2, 4)),
    snap(0.64, move(0.04, 0.04, 0, -4, -8), { bones: { wingL: { y: -30, z: -10 }, wingR: { y: -12, z: -16 } } }, body(-2, -4, 6)),
    key(0.8, move(-0.04, 0.04, 0, -4, 8), { bones: { wingL: { y: 12, z: 16 }, wingR: { y: 30, z: 10 } } }, body(-2, -4, -6)),
    key(0.96, move(0, 0.03, 0, -2), wings(-10, -4), body(-1, -2)),
    key(1.2, move(0, 0.01, 0, 1)),
    key(1.7),
  ], [{ t: 0.68, name: 'emit' }], [
    { t: 0, rate: 0.8, amp: 0.6 }, { t: 0.6, rate: 1, amp: 0.3 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Harden: it pulls its wings in tight to its body and tenses, stiffening
   * (a small shrink), shivering with the effort as the sheen spreads (aura),
   * then eases open.
   */
  const harden = flutter('harden', 1.4, [
    key(0),
    key(0.16, move(0, -0.02, 0, 2), wings(42, 10), body(2, 4), swell(0.97)),
    snap(0.3, move(0, -0.03, 0, 3), wings(50, 12), body(3, 6), swell(0.94)),
    key(0.4, move(0, -0.03, 0, 3, 2), wings(50, 12), body(3, 6), swell(0.94)),
    key(0.5, move(0, -0.03, 0, 3, -2), wings(51, 12), body(3, 6), swell(0.945)),
    key(0.6, move(0, -0.03, 0, 3, 1.5), wings(50, 12), body(3, 6), swell(0.94)),
    key(0.76, move(0, -0.02, 0, 2), wings(40, 10), body(2, 4), swell(0.96)),
    key(0.98, move(0, 0, 0, -1), wings(4, 2), swell(1.01)),
    key(1.4),
  ], [{ t: 0.46, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.14, rate: 1, amp: 0.1 }, { t: 0.9, rate: 1, amp: 1 },
  ]);

  /**
   * Protect: it sweeps its wings forward round its body like a shield and
   * holds them there, braced, as the barrier forms (aura), then opens them.
   */
  const protect = flutter('protect', 1.5, [
    key(0),
    key(0.14, move(0, 0.02, -0.02, -6), wings(20, 16), body(-2, -4)),
    snap(0.26, move(0, 0, 0, 4), wings(-66, -18), body(3, 8), swell(0.98)),
    key(0.46, move(0, 0, -0.01, 4, 1), wings(-68, -18), body(3, 8), swell(0.98)),
    key(0.66, move(0, 0, -0.01, 4, -1), wings(-67, -19), body(3, 8), swell(0.98)),
    key(0.86, move(0, 0.01, 0, 1), wings(-30, -6), body(1, 3)),
    key(1.1, move(0, 0, 0, -1), wings(-4, 0)),
    key(1.5),
  ], [{ t: 0.32, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.24, rate: 1.4, amp: 0.1 }, { t: 0.84, rate: 1, amp: 1 },
  ]);

  /**
   * Sunny Day: it rises and turns its face up to the sky, spreads its wings
   * wide and calls the sun (aura), basking a moment before it settles.
   */
  const sunnyDay = flutter('sunny_day', 1.6, [
    key(0),
    key(0.2, move(0, 0.06, -0.02, -10), wings(14, 14), body(-4, -10)),
    key(0.4, move(0, 0.12, -0.03, -18), wings(-26, -8), body(-7, -20), swell(1.03)),
    key(0.62, move(0, 0.13, -0.03, -19, 1), wings(-28, -8), body(-7, -21, 2), swell(1.04)),
    key(0.86, move(0, 0.12, -0.03, -18, -1), wings(-27, -8), body(-7, -20, -2), swell(1.035)),
    key(1.1, move(0, 0.05, -0.01, -6), wings(-8, -2), body(-2, -6), swell(1.01)),
    key(1.34, move(0, 0.01, 0, 1)),
    key(1.6),
  ], [{ t: 0.5, name: 'aura' }], [
    { t: 0, rate: 1.2, amp: 1.1 }, { t: 0.38, rate: 0.7, amp: 0.5 }, { t: 1.1, rate: 1, amp: 1 },
  ]);

  /**
   * Double Team: it darts from side to side in the air faster than the eye
   * can follow (quick dashes, banking into each), the afterimages flickering
   * round it from the aura.
   */
  const doubleTeam = flutter('double_team', 1.8, [
    key(0),
    key(0.1, move(0, 0.02, 0, -4), wings(16, 12)),
    key(0.2, move(0.2, 0.04, 0, 0, -16)),
    key(0.3, move(0.24, 0.02, 0, 0, -8)),
    key(0.42, move(-0.04, 0.05, 0, 0, 16)),
    key(0.52, move(-0.22, 0.03, 0, 0, 8)),
    key(0.64, move(0.02, 0.05, 0, 0, -16)),
    key(0.74, move(0.2, 0.03, 0, 0, -8)),
    key(0.86, move(-0.02, 0.04, 0, 0, 14)),
    key(0.96, move(-0.18, 0.02, 0, 0, 6)),
    key(1.1, move(-0.04, 0.03, 0, 0, -6)),
    key(1.24, move(0, 0.01, 0, 0, -1)),
    key(1.8),
  ], [{ t: 0.18, name: 'aura' }], [
    { t: 0, rate: 1.4, amp: 1 }, { t: 0.16, rate: 2.2, amp: 1.2 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  /**
   * Rest: it sinks, lets its wings droop and fold down, bows its head and
   * dozes off content in the air (aura: it heals), then stirs back into its
   * hover.
   */
  const rest = flutter('rest', 1.9, [
    key(0),
    key(0.24, move(0, -0.03, 0, 4), wings(-4, -12), body(2, 8)),
    key(0.5, move(0, -0.06, 0, 8), wings(-8, -20), body(4, 16), swell(0.98)),
    key(0.8, move(0, -0.07, 0, 9, 1), wings(-8, -21), body(4, 17, 0, 3), swell(0.99)),
    key(1.1, move(0, -0.07, 0, 9, -1), wings(-8, -21), body(4, 17, 0, -2), swell(0.985)),
    key(1.38, move(0, -0.03, 0, 4), wings(-2, -8), body(2, 6)),
    key(1.62, move(0, 0, 0, -1)),
    key(1.9),
  ], [{ t: 0.6, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.2, rate: 0.5, amp: 0.3 }, { t: 1.36, rate: 1, amp: 1 },
  ]);

  /**
   * Substitute: a burst of effort that swells it and snaps its wings, then it
   * darts back out of the way as the doll takes its place (aura), and eases
   * back.
   */
  const substitute = flutter('substitute', 1.5, [
    key(0),
    key(0.14, move(0, 0, 0, 6), wings(-20, -10), body(3, 8), swell(0.96)),
    key(0.24, move(0, -0.01, 0, 7), wings(-22, -11), body(3, 9), swell(0.95)),
    snap(0.34, move(0, 0.04, 0, -8), wings(26, 24), body(-4, -8), swell(1.06)),
    key(0.5, move(0, 0.08, -0.14, -12), wings(20, 18), body(-3, -6), swell(1.03)),
    key(0.7, move(0, 0.06, -0.14, -8), wings(10, 10), body(-2, -4)),
    key(0.98, move(0, 0.02, -0.04, -2)),
    key(1.2, move(0, 0, 0, 1)),
    key(1.5),
  ], [{ t: 0.4, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.12, rate: 1, amp: 0.3 }, { t: 0.46, rate: 1.8, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Endure: it braces hard, wings pulled in and body clenched, trembling as
   * it digs in against what is coming (aura), then lets out its breath.
   */
  const endure = flutter('endure', 1.5, [
    key(0),
    key(0.16, move(0, -0.02, -0.02, 6), wings(36, -6), body(3, 8), swell(0.97)),
    snap(0.28, move(0, -0.04, -0.03, 8), wings(40, -10), body(4, 10), swell(0.95)),
    key(0.4, move(0, -0.04, -0.03, 8, 1.5), wings(40, -10), body(4, 10, 1), swell(0.95)),
    key(0.52, move(0, -0.04, -0.03, 8, -1.5), wings(41, -10), body(4, 10, -1), swell(0.955)),
    key(0.64, move(0, -0.04, -0.03, 8, 1), wings(40, -10), body(4, 10, 1), swell(0.95)),
    key(0.84, move(0, -0.01, 0, 2), wings(10, -2), body(1, 2), swell(1.01)),
    key(1.1, move(0, 0, 0, -1)),
    key(1.5),
  ], [{ t: 0.46, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.14, rate: 1.6, amp: 0.2 }, { t: 0.82, rate: 1, amp: 1 },
  ]);

  /**
   * Sleep Talk: asleep in the air, wings drooping and head sunk, it mumbles
   * and twitches, a wing jerking and its head bobbing (aura), before the move
   * it calls plays.
   */
  const sleepTalk = flutter('sleep_talk', 1.7, [
    key(0),
    key(0.2, move(0, -0.04, 0, 6), wings(-6, -16), body(3, 12)),
    key(0.4, move(0, -0.05, 0, 7, 2), { bones: { wingL: { y: -6, z: -16 }, wingR: { y: 14, z: -4 } } }, body(3, 14, 8)),
    key(0.54, move(0, -0.04, 0, 5, -2), wings(-6, -16), body(3, 10, -6, 4)),
    key(0.7, move(0, -0.05, 0, 7, 1), { bones: { wingL: { y: -16, z: -8 }, wingR: { y: 6, z: -16 } } }, body(3, 13, 4)),
    key(0.9, move(0, -0.04, 0, 6), wings(-6, -16), body(3, 12, -3)),
    key(1.16, move(0, -0.02, 0, 3), body(2, 6)),
    key(1.42, move(0, 0, 0, -1)),
    key(1.7),
  ], [{ t: 0.44, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 0.5, amp: 0.3 }, { t: 1.12, rate: 1, amp: 1 },
  ]);

  return [stringShot, attract, swagger, flash, mimic, harden, protect, sunnyDay, doubleTeam, rest, substitute, endure, sleepTalk];
}
