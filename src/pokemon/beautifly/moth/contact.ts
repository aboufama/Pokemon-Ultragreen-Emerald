// The moths' contact moves (Beautifly, Dustox), one clip each: they fly to
// the foe fast, the wings beating harder, strike it with the body (or slash
// with a wing), and flutter home. Each is its own action: Tackle a body slam
// in flight, Double-Edge a reckless dive, Aerial Ace a blur up and over and
// a wing slash on the way down, Thief a sly low dart and a snatch...
//
// A blow is in contact for a few frames before its `impact` (the battle
// shows poses held four frames), and the game's effects start on it.

import type { Clip } from '../../../anim/clip';
import { type MothCharacter, at, body, mothKit } from './moth';

export function mothContact(c: MothCharacter): Clip[] {
  const { key, snap, flutter, wings } = mothKit(c);

  /**
   * Tackle: it rears back and lifts, wings raised high, then flies at the
   * foe leaning into it, draws back and slams its body into the foe; it
   * bounces off and flutters home.
   */
  const tackle = flutter('tackle', 1.44, [
    key(0),
    key(0.12, at(0, 0.04, 0, -12), wings(18, 20), body(-4, -6)),
    key(0.22, at(0, 0.05, -0.02, -14), wings(20, 22), body(-5, -7)),
    key(0.34, at(0.55, 0.09, 0, 22), wings(28, 6), body(4, 4)),
    key(0.44, at(1, 0.02, 0, 10), wings(-6, 0), body(2, 2)),
    key(0.52, at(1, 0.03, -0.05, -10), wings(16, 16), body(-4, -6)),
    snap(0.6, at(1, 0, 0.28, 22), wings(34, 8), body(6, 8)),
    key(0.74, at(1, 0, 0.3, 20), wings(30, 6), body(7, 9)),
    snap(0.86, at(1, 0.06, 0.02, -14), wings(-10, -4), body(-3, -5)),
    key(1.0, at(0.5, 0.1, 0, -10), wings(6, 6)),
    key(1.14, at(0, 0.01, 0, -3)),
    key(1.28, at(0, 0, 0, 1.5)),
    key(1.44),
  ], [{ t: 0.68, name: 'impact' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.22, rate: 1.8, amp: 1.2 }, { t: 0.5, rate: 1.3, amp: 0.5 }, { t: 0.86, rate: 1.6, amp: 1.1 }, { t: 1.16, rate: 1, amp: 1 },
  ]);

  /**
   * Frustration: sulky and spiteful, it shivers with irritation and snaps
   * its wings, jinks at the foe, turns a shoulder and rams it with a spiteful
   * body check, gives a huffy toss of its head and flutters home, still
   * twitching with annoyance.
   */
  const frustration = flutter('frustration', 1.7, [
    key(0),
    key(0.12, at(0, 0, 0, 4, -6), wings(-18, -8), body(3, 10)),
    key(0.22, at(0, 0.01, 0, 5, 6), wings(20, 14), body(3, 10)),
    key(0.32, at(0, 0.02, -0.02, -6, -5), wings(22, 18), body(-2, -2)),
    key(0.46, at(0.5, 0.06, 0, 24, 0, 0.1), wings(30, 4), body(4, 6)),
    key(0.56, at(1, 0.02, 0, 12), wings(10, 4), body(3, 5)),
    key(0.64, at(1, 0.03, -0.06, -6, -18), wings(18, 16), body(-3, -4, -10)),
    snap(0.72, at(1, 0, 0.26, 16, 20), wings(34, 6), body(6, 8, 8)),
    key(0.86, at(1, 0, 0.28, 14, 18), wings(30, 6), body(6, 8, 8)),
    key(0.98, at(1, 0.05, 0.02, -10), wings(-6, -2), body(-6, -14, 0, 12)),
    key(1.14, at(0.5, 0.09, 0, -8), wings(8, 8), body(-2, -4, 0, 4)),
    key(1.3, at(0, 0.01, 0, -2)),
    key(1.44, at(0, 0, 0, 1, 4), body(0, 2, 0, -3)),
    key(1.56, at(0, 0, 0, 0, -3)),
    key(1.7),
  ], [{ t: 0.8, name: 'impact' }], [
    { t: 0, rate: 1.4, amp: 1.1 }, { t: 0.4, rate: 1.8, amp: 1.2 }, { t: 0.62, rate: 1.3, amp: 0.5 }, { t: 0.96, rate: 1.6, amp: 1.1 }, { t: 1.32, rate: 1.2, amp: 1 },
  ]);

  /**
   * Return: a joyful, loyal charge: a happy bob, then it rises in a
   * spinning swoop over the field and comes down into the foe with a strong
   * full-body hit, bounces up pleased and bobs its way home.
   */
  const ret = flutter('return', 1.84, [
    key(0),
    key(0.14, at(0, 0.06, 0, -6), wings(-16, -8), body(-3, -6)),
    key(0.24, at(0, 0.02, 0, 4), wings(16, 12), body(2, 3)),
    key(0.36, at(0.3, 0.2, 0, -18, 0, 0), wings(-10, -6), { root: { yaw: 180 } }, body(-3, -6)),
    key(0.48, at(0.68, 0.26, 0, 10), wings(18, 10), { root: { yaw: 360 } }, body(2, 2)),
    snap(0.58, at(1, 0.02, 0.26, 26), wings(34, 8), { root: { yaw: 360 } }, body(6, 8)),
    key(0.72, at(1, 0, 0.28, 24), wings(30, 6), { root: { yaw: 360 } }, body(6, 8)),
    snap(0.86, at(1, 0.12, 0.02, -12), wings(-18, -8), { root: { yaw: 360 } }, body(-4, -8)),
    key(1.0, at(0.62, 0.14, 0, -6), wings(4, 4), { root: { yaw: 360 } }, body(-2, -4, 0, 6)),
    key(1.16, at(0.28, 0.06, 0, 2), { root: { yaw: 360 } }, body(0, 0, 0, -6)),
    key(1.3, at(0, 0.03, 0, -2), { root: { yaw: 360 } }, body(0, 0, 0, 4)),
    key(1.46, at(0, 0.05, 0, 2), { root: { yaw: 360 } }),
    key(1.62, at(0, 0, 0, -1), { root: { yaw: 360 } }),
    key(1.84, { root: { yaw: 360 } }),
  ], [{ t: 0.66, name: 'impact' }], [
    { t: 0, rate: 1.3, amp: 1.2 }, { t: 0.3, rate: 1.6, amp: 1.3 }, { t: 0.56, rate: 1.2, amp: 0.5 }, { t: 0.86, rate: 1.4, amp: 1.2 }, { t: 1.3, rate: 1.1, amp: 1 },
  ]);

  /**
   * Facade: gritty and determined, it sets itself low and still, then
   * charges straight and hard at the foe, head down, and rams it head on,
   * grinding into it before it pushes off and flies home.
   */
  const facade = flutter('facade', 1.54, [
    key(0),
    key(0.12, at(0, -0.02, 0, 8), wings(22, 2), body(4, 8)),
    key(0.24, at(0, -0.03, -0.02, 9), wings(23, 2), body(4, 9, 1)),
    key(0.36, at(0.6, 0.02, 0, 30), wings(32, 0), body(6, 12)),
    key(0.46, at(1, 0.01, 0, 26), wings(30, 0), body(6, 12)),
    snap(0.54, at(1, 0, 0.28, 30), wings(34, 4), body(8, 14)),
    key(0.66, at(1, 0, 0.3, 28, 3), wings(32, 4), body(8, 14)),
    key(0.76, at(1, 0, 0.29, 28, -3), wings(32, 4), body(8, 14)),
    key(0.88, at(1, 0.04, 0.02, -6), wings(-6, 0), body(0, 0)),
    key(1.02, at(0.45, 0.08, 0, -8), wings(6, 6)),
    key(1.16, at(0, 0.01, 0, -2)),
    key(1.3, at(0, 0, 0, 2), body(1, 3)),
    key(1.54),
  ], [{ t: 0.62, name: 'impact' }], [
    { t: 0, rate: 1, amp: 0.8 }, { t: 0.3, rate: 1.9, amp: 1.2 }, { t: 0.52, rate: 1.3, amp: 0.5 }, { t: 0.86, rate: 1.5, amp: 1.1 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  /**
   * Secret Power: a scrappy, quick strike: it dips, swoops in low over the
   * grass and jabs up into the foe, carrying up off it, and zips home.
   */
  const secretPower = flutter('secret_power', 1.3, [
    key(0),
    key(0.1, at(0, -0.04, 0, 10), wings(16, 12), body(3, 5)),
    key(0.2, at(0.45, -0.06, 0, 18), wings(28, 4), body(4, 6)),
    key(0.3, at(1, -0.05, 0, 14), wings(20, 4), body(4, 6)),
    snap(0.38, at(1, 0.04, 0.24, -12), wings(-14, -6), body(-4, -8)),
    key(0.5, at(1, 0.09, 0.22, -14), wings(-10, -4), body(-4, -8)),
    key(0.64, at(0.5, 0.08, 0, -10), wings(6, 4)),
    key(0.78, at(0, 0.01, 0, -2)),
    key(1.0, at(0, 0, 0, 1.5), body(0, 1)),
    key(1.3),
  ], [{ t: 0.46, name: 'impact' }], [
    { t: 0, rate: 1.4, amp: 1 }, { t: 0.18, rate: 2, amp: 1.2 }, { t: 0.36, rate: 1.4, amp: 0.6 }, { t: 0.6, rate: 1.8, amp: 1.1 }, { t: 0.84, rate: 1, amp: 1 },
  ]);

  /**
   * Thief: sly, it sinks low with its wings tight and creeps, darts in low
   * at the foe, snatches at it in a sideways swoop, and zips off home with
   * the prize, pleased with itself.
   */
  const thief = flutter('thief', 1.44, [
    key(0),
    key(0.12, at(0, -0.05, 0, 14), wings(30, 0), body(4, 6, -6)),
    key(0.22, at(0, -0.055, -0.02, 15), wings(31, 0), body(4, 7, -8)),
    key(0.32, at(0.6, -0.04, 0, 22, 0, 0.06), wings(32, 2), body(4, 6)),
    key(0.42, at(1, -0.03, 0, 16, 0, 0.02), wings(24, 4), body(3, 5)),
    snap(0.5, at(1, 0, 0.24, 14, -22), wings(-8, 8), body(4, 6, 10)),
    key(0.62, at(1, 0.02, 0.18, 8, -26), wings(-4, 8), body(3, 4, 12)),
    key(0.72, at(0.45, 0.07, 0, -14, 10), wings(26, 4), body(-2, -2)),
    key(0.84, at(0, 0.02, 0, -4, 4), wings(10, 4)),
    key(0.98, at(0, 0.03, 0, 2, -3), body(0, -2, 6)),
    key(1.16, at(0, 0, 0, -1)),
    key(1.44),
  ], [{ t: 0.58, name: 'impact' }], [
    { t: 0, rate: 1.2, amp: 0.6 }, { t: 0.28, rate: 2, amp: 1.1 }, { t: 0.48, rate: 1.4, amp: 0.6 }, { t: 0.7, rate: 2, amp: 1.2 }, { t: 0.9, rate: 1.1, amp: 1 },
  ]);

  /**
   * Double-Edge: reckless: it beats its way up high over its place, then
   * folds into a wild dive at the foe and crashes into it; the recoil hurts
   * it too, sending it tumbling back, and it flutters home shakily.
   */
  const doubleEdge = flutter('double_edge', 2.0, [
    key(0),
    key(0.14, at(0, 0.12, -0.02, -14), wings(-14, -6), body(-4, -8)),
    key(0.3, at(0, 0.22, -0.04, -18), wings(-10, -4), body(-5, -10)),
    key(0.42, at(0.35, 0.2, 0, 40), wings(36, 4), body(6, 10)),
    key(0.54, at(0.8, 0.08, 0, 48), wings(40, 2), body(8, 12)),
    snap(0.62, at(1, 0, 0.28, 38), wings(36, 6), body(8, 12)),
    key(0.76, at(1, 0, 0.3, 36), wings(34, 6), body(8, 12)),
    snap(0.88, at(1, 0.08, -0.02, -26, 18), wings(-24, -14), body(-8, -12, 0, 10)),
    key(1.02, at(1, 0.04, 0, -8, -12), wings(-6, -8), body(-4, -6, 0, -8)),
    key(1.16, at(0.55, 0.08, 0, -4, 8), wings(8, 4), body(-2, -3, 0, 5)),
    key(1.32, at(0.12, 0.03, 0, -2, -6), body(0, 0, 0, -4)),
    key(1.46, at(0, 0, 0, 2, 4), body(1, 2, 0, 3)),
    key(1.64, at(0, 0, 0, 1, -2)),
    key(1.8, at(0, 0, 0, -0.5)),
    key(2.0),
  ], [{ t: 0.7, name: 'impact' }], [
    { t: 0, rate: 1.6, amp: 1.4 }, { t: 0.4, rate: 1, amp: 0.3 }, { t: 0.6, rate: 1, amp: 0.3 }, { t: 0.86, rate: 2.2, amp: 1.2 }, { t: 1.2, rate: 1.5, amp: 1 }, { t: 1.6, rate: 1, amp: 1 },
  ]);

  /**
   * Aerial Ace: a blur: it coils, streaks up and over the foe, turns down
   * and dives onto it slashing with a wing swept forward, carries on past
   * the strike and swings round home, fast.
   */
  const aerialAce = flutter('aerial_ace', 1.44, [
    key(0),
    key(0.1, at(0, 0.02, -0.02, -10), wings(24, 24), body(-3, -6)),
    key(0.18, at(0, 0.03, -0.03, -11), wings(25, 25), body(-3, -7)),
    snap(0.28, at(0.6, 0.26, 0, -20), wings(30, 10), body(-2, -4)),
    key(0.36, at(1, 0.3, 0, 30), wings(30, 20), body(4, 6)),
    snap(0.44, at(1, 0.04, 0.18, 34), { bones: { wingL: { y: -64, z: -10 }, wingR: { y: 30, z: -18 } } }, body(6, 8)),
    key(0.56, at(1, 0, 0.3, 30), { bones: { wingL: { y: -72, z: -14 }, wingR: { y: 32, z: -18 } } }, body(6, 8)),
    key(0.68, at(0.8, 0.12, 0, -10), wings(8, 8), body(-2, -4)),
    key(0.82, at(0.3, 0.06, 0, -8), wings(10, 6)),
    key(0.94, at(0, 0.01, 0, -2)),
    key(1.12, at(0, 0, 0, 1.5)),
    key(1.44),
  ], [{ t: 0.52, name: 'impact' }], [
    { t: 0, rate: 1.2, amp: 1 }, { t: 0.2, rate: 2.2, amp: 1.2 }, { t: 0.42, rate: 1, amp: 0.25 }, { t: 0.64, rate: 1.9, amp: 1.2 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Struggle: spent, its wings droop and falter; it flutters at the foe in
   * weak, wobbling bursts, flails, throws itself clumsily into the foe,
   * winces from the recoil, and sinks home on tired wings.
   */
  const struggle = flutter('struggle', 1.8, [
    key(0),
    key(0.14, at(0, -0.04, 0, 8), wings(-10, -14), body(3, 8)),
    key(0.3, at(0.4, 0.02, 0, 10, 8), wings(6, -6), body(2, 5)),
    key(0.44, at(0.8, -0.03, 0, 12, -8), wings(0, -10), body(2, 6)),
    key(0.56, at(1, 0.01, 0, 6), wings(4, -6), body(2, 5)),
    key(0.66, at(1, 0.02, -0.04, -10, 10), wings(18, 12), body(-3, -4)),
    snap(0.76, at(1, 0, 0.26, 26, -10), wings(30, 4), body(6, 8)),
    key(0.9, at(1, 0, 0.27, 24, -8), wings(28, 4), body(6, 8)),
    snap(1.02, at(1, 0.05, 0.02, -18), wings(-18, -12), body(-6, -10)),
    key(1.16, at(1, -0.02, 0, 6), wings(-10, -14), body(3, 8)),
    key(1.3, at(0.5, 0.04, 0, -6, 5), wings(4, -6), body(2, 5)),
    key(1.46, at(0, -0.02, 0, 2, -4), wings(-6, -10), body(3, 6)),
    key(1.6, at(0, -0.01, 0, 4), body(2, 4)),
    key(1.8),
  ], [{ t: 0.84, name: 'impact' }], [
    { t: 0, rate: 0.8, amp: 0.7 }, { t: 0.26, rate: 1.6, amp: 1 }, { t: 0.5, rate: 0.9, amp: 0.7 }, { t: 0.74, rate: 1, amp: 0.4 }, { t: 1.0, rate: 1.4, amp: 0.9 }, { t: 1.44, rate: 0.8, amp: 0.8 },
  ]);

  return [tackle, frustration, ret, facade, secretPower, thief, doubleEdge, aerialAce, struggle];
}
