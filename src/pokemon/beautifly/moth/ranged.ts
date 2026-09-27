// The moths' ranged moves (Beautifly, Dustox), one clip each, fired from
// home: the wings whip up the wind (Gust, Whirlwind) or send scales (Silver
// Wind), light and power gather and leave the head (Hyper Beam, Solar Beam),
// the mind reaches out (Psychic: the species' mind emitter, Beautifly's eyes
// or Dustox's antennae), the abdomen curls forward like a wasp's to fire a
// barb (Poison Sting). Where the wings themselves stroke in the acting, the
// beat drops to a flutter so the strokes read.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { type MothCharacter, body, move, mothKit, swell } from './moth';

/** The abdomen curled forward under the body (the thorax held still): 0 at rest, 1 curled fully. */
export const abdomen = (k: number): Pose => ({ bones: { hips: { x: -44 * k }, spine: { x: 44 * k } } });

export function mothRanged(c: MothCharacter): Clip[] {
  const { key, snap, flutter, wings } = mothKit(c);

  /**
   * Gust: it rears back with its wings high, then beats them hard at the foe
   * twice, the second stroke the big one that whips the wind at it, and
   * recovers.
   */
  const gust = flutter('gust', 1.44, [
    key(0),
    key(0.14, move(0, 0.05, -0.02, -12), wings(22, 24), body(-3, -6)),
    key(0.22, move(0, 0.06, -0.03, -13), wings(24, 26), body(-3, -6)),
    snap(0.32, move(0, 0.03, 0.01, 6), wings(-30, -16), body(2, 3)),
    key(0.42, move(0, 0.06, -0.02, -10), wings(26, 26), body(-3, -6)),
    snap(0.52, move(0, 0.02, 0.03, 12), wings(-44, -20), body(4, 6)),
    key(0.66, move(0, 0.02, 0.02, 8), wings(-36, -16), body(3, 4)),
    key(0.84, move(0, 0.01, 0, 1), wings(6, 4)),
    key(1.08, move(0, 0, 0, -1)),
    key(1.44),
  ], [{ t: 0.56, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.12, rate: 1, amp: 0.2 }, { t: 0.76, rate: 1.2, amp: 1 },
  ]);

  /**
   * Whirlwind: it rises and spreads its wings to their widest, then beats
   * them in three huge strokes, the body rocking back with each, blowing a
   * gale at the foe; it holds the last stroke, then settles.
   */
  const whirlwind = flutter('whirlwind', 1.9, [
    key(0),
    key(0.16, move(0, 0.1, -0.03, -8), wings(-26, -12), body(-3, -5)),
    key(0.3, move(0, 0.12, -0.04, -14), wings(30, 28), body(-4, -7)),
    snap(0.42, move(0, 0.08, 0, 8), wings(-46, -22), body(3, 4)),
    key(0.54, move(0, 0.12, -0.04, -14), wings(32, 30), body(-4, -7)),
    snap(0.66, move(0, 0.07, 0, 10), wings(-50, -24), body(4, 5)),
    key(0.78, move(0, 0.12, -0.04, -14), wings(34, 30), body(-4, -7)),
    snap(0.9, move(0, 0.06, 0.02, 12), wings(-52, -24), body(4, 6)),
    key(1.08, move(0, 0.06, 0.02, 10), wings(-46, -22), body(4, 5)),
    key(1.3, move(0, 0.03, 0, 2), wings(4, 4)),
    key(1.56, move(0, 0.01, 0, -1)),
    key(1.9),
  ], [{ t: 0.7, name: 'release' }], [
    { t: 0, rate: 1.3, amp: 1.1 }, { t: 0.26, rate: 1, amp: 0.15 }, { t: 1.2, rate: 1.2, amp: 1 },
  ]);

  /**
   * Silver Wind: its wings spread wide and it glides in a sweeping arc to one
   * side, then turns into one long shimmering stroke that sends its scales
   * streaming on the wind at the foe, and glides back.
   */
  const silverWind = flutter('silver_wind', 1.7, [
    key(0),
    key(0.16, move(0.06, 0.04, 0, -6, -10), wings(-24, -10), body(-2, -4, 6, -6)),
    key(0.32, move(0.1, 0.06, -0.02, -8, -14), wings(-26, -10), body(-2, -4, 8, -8)),
    key(0.44, move(0.08, 0.07, -0.03, -10, -8), wings(28, 24), body(-3, -6, 4)),
    snap(0.56, move(0.02, 0.03, 0.02, 10, 6), wings(-42, -18), body(3, 4, -4)),
    key(0.74, move(-0.04, 0.03, 0.02, 8, 10), wings(-34, -14), body(2, 3, -6)),
    key(0.94, move(-0.05, 0.02, 0, 2, 6), wings(-14, -6), body(0, 0, -4)),
    key(1.16, move(-0.02, 0.01, 0, 0, 2)),
    key(1.4, move(0, 0, 0, -1)),
    key(1.7),
  ], [{ t: 0.6, name: 'release' }], [
    { t: 0, rate: 0.8, amp: 0.5 }, { t: 0.42, rate: 1, amp: 0.15 }, { t: 0.9, rate: 0.9, amp: 0.7 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  /**
   * Hidden Power: it folds its wings forward round the light gathering in
   * front of it (charge), hovers curled over it, then flings its wings open
   * wide at the foe, sending the orbs.
   */
  const hiddenPower = flutter('hidden_power', 1.56, [
    key(0),
    key(0.18, move(0, 0.03, 0, 6), wings(-44, -24), body(4, 10)),
    key(0.4, move(0, 0.04, 0, 8), wings(-50, -26), body(5, 12), swell(0.97)),
    key(0.56, move(0, 0.05, -0.01, 7, 1), wings(-52, -27), body(5, 12), swell(0.965)),
    snap(0.66, move(0, 0.02, 0.03, -8), wings(22, 18), body(-4, -8), swell(1.04)),
    key(0.82, move(0, 0.02, 0.02, -6), wings(18, 16), body(-3, -6), swell(1.03)),
    key(1.02, move(0, 0.01, 0, 1), wings(2, 2)),
    key(1.26, move(0, 0, 0, -1)),
    key(1.56),
  ], [{ t: 0.14, name: 'charge' }, { t: 0.7, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 1.4, amp: 0.3 }, { t: 0.64, rate: 1, amp: 0.2 }, { t: 0.96, rate: 1, amp: 1 },
  ]);

  /**
   * Hyper Beam: it rises with its wings raised and still while the power
   * gathers at its head (a long glow), braces with its wings spread wide
   * and its head down at the foe, fires the beam and holds it with a tremor
   * as the recoil pushes it back, then sags, spent.
   */
  const hyperBeam = flutter('hyper_beam', 2.4, [
    key(0),
    key(0.2, move(0, 0.06, -0.02, -6), wings(26, 28), body(-3, -8)),
    key(0.46, move(0, 0.08, -0.03, -8), wings(28, 30), body(-3, -9), swell(1.03)),
    key(0.62, move(0, 0.08, -0.03, -8, 1), wings(28, 31), body(-3, -9, 1), swell(1.035)),
    snap(0.74, move(0, 0.03, -0.02, 14), wings(-30, -12), body(5, 12)),
    key(0.96, move(0, 0.03, -0.05, 12, 1), wings(-32, -12), body(5, 12, 1)),
    key(1.18, move(0, 0.03, -0.06, 12, -1), wings(-32, -13), body(5, 12, -1)),
    key(1.4, move(0, 0.03, -0.07, 12, 1), wings(-31, -12), body(5, 12, 1)),
    key(1.6, move(0, 0.02, -0.07, 11), wings(-30, -12), body(5, 11)),
    key(1.78, move(0, -0.03, -0.05, -10), wings(-4, -16), body(-3, -4), swell(0.98)),
    key(1.98, move(0, -0.04, -0.02, 6), wings(-6, -18), body(4, 10), swell(0.98)),
    key(2.18, move(0, -0.01, 0, 2), body(1, 3)),
    key(2.4),
  ], [{ t: 0.1, name: 'charge' }, { t: 0.8, name: 'release' }, { t: 1.66, name: 'releaseEnd' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1.6, amp: 0.2 }, { t: 0.72, rate: 2, amp: 0.25 }, { t: 1.74, rate: 0.7, amp: 0.7 }, { t: 2.1, rate: 1, amp: 1 },
  ]);

  /**
   * Solar Beam, the first turn: it rises and turns its face up to the sun,
   * its wings spread wide and flat to soak up the light, glowing, gathering
   * it; then it settles, holding the light.
   */
  const solarBeamCharge = flutter('solar_beam_charge', 1.8, [
    key(0),
    key(0.24, move(0, 0.08, -0.02, -16), wings(-22, -14), body(-6, -16)),
    key(0.5, move(0, 0.12, -0.03, -22), wings(-30, -16), body(-8, -22), swell(1.03)),
    key(0.8, move(0, 0.13, -0.03, -23, 1), wings(-31, -16), body(-8, -23, 2), swell(1.04)),
    key(1.08, move(0, 0.12, -0.03, -22, -1), wings(-30, -16), body(-8, -22, -2), swell(1.035)),
    key(1.34, move(0, 0.06, -0.01, -8), wings(-10, -6), body(-3, -8), swell(1.02)),
    key(1.56, move(0, 0.01, 0, 1), swell(1.01)),
    key(1.8),
  ], [{ t: 0.3, name: 'charge' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.2, rate: 0.6, amp: 0.3 }, { t: 1.3, rate: 1, amp: 1 },
  ]);

  /**
   * Solar Beam: the gathered light flares at its head (charge), it leans at
   * the foe with its wings spread and braced, fires the beam, holds it
   * steady, and eases off.
   */
  const solarBeam = flutter('solar_beam', 2.1, [
    key(0),
    key(0.16, move(0, 0.05, -0.02, -10), wings(-20, -12), body(-4, -10), swell(1.03)),
    key(0.34, move(0, 0.06, -0.02, -11, 1), wings(-22, -12), body(-4, -11, 1), swell(1.04)),
    snap(0.46, move(0, 0.02, 0, 12), wings(-34, -14), body(5, 11)),
    key(0.7, move(0, 0.02, -0.03, 11, 0.5), wings(-35, -14), body(5, 11, 0.5)),
    key(0.94, move(0, 0.02, -0.04, 11, -0.5), wings(-35, -15), body(5, 11, -0.5)),
    key(1.18, move(0, 0.02, -0.04, 11, 0.5), wings(-34, -14), body(5, 11, 0.5)),
    key(1.4, move(0, 0.02, -0.03, 10), wings(-32, -13), body(5, 10)),
    key(1.58, move(0, 0.01, -0.01, -4), wings(-6, -4), body(-1, -3)),
    key(1.8, move(0, 0, 0, 1)),
    key(2.1),
  ], [{ t: 0.1, name: 'charge' }, { t: 0.52, name: 'release' }, { t: 1.44, name: 'releaseEnd' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.14, rate: 1.4, amp: 0.3 }, { t: 0.44, rate: 1.8, amp: 0.2 }, { t: 1.5, rate: 1, amp: 1 },
  ]);

  /**
   * Psychic: it rises, goes still with its wings spread and trembling and its
   * head thrust at the foe, the power leaving it in a surge (the body lifting
   * with it), holds, and sinks back.
   */
  const psychic = flutter('psychic', 1.86, [
    key(0),
    key(0.2, move(0, 0.05, -0.01, -4), wings(-16, -8), body(-3, -8)),
    key(0.38, move(0, 0.07, -0.02, -6), wings(-20, -10), body(-3, -10), swell(1.02)),
    snap(0.5, move(0, 0.12, 0.02, 8), wings(-30, -14), body(4, 12), swell(1.04)),
    key(0.7, move(0, 0.13, 0.02, 8, 1), wings(-31, -14), body(4, 12, 1), swell(1.045)),
    key(0.9, move(0, 0.13, 0.02, 8, -1), wings(-31, -15), body(4, 12, -1), swell(1.04)),
    key(1.1, move(0, 0.12, 0.02, 7, 1), wings(-30, -14), body(4, 11, 1), swell(1.04)),
    key(1.32, move(0, 0.05, 0, 1), wings(-8, -4), body(1, 3), swell(1.01)),
    key(1.56, move(0, 0.01, 0, -1)),
    key(1.86),
  ], [{ t: 0.56, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1.8, amp: 0.25 }, { t: 1.3, rate: 1, amp: 1 },
  ]);

  /**
   * Shadow Ball: it curls its wings forward round a dark ball swelling in
   * front of it (charge), draws back with it, then hurls it at the foe with a
   * sweep of both wings.
   */
  const shadowBall = flutter('shadow_ball', 1.76, [
    key(0),
    key(0.2, move(0, 0.03, 0, 6), wings(-42, -22), body(4, 10)),
    key(0.42, move(0, 0.05, -0.03, -4), wings(-48, -24), body(2, 6), swell(1.02)),
    key(0.6, move(0, 0.07, -0.05, -12), wings(20, 22), body(-4, -8), swell(1.03)),
    snap(0.7, move(0, 0.03, 0.04, 14), wings(-46, -18), body(5, 10)),
    key(0.86, move(0, 0.02, 0.03, 10), wings(-40, -16), body(4, 8)),
    key(1.08, move(0, 0.01, 0, 1), wings(-4, -2)),
    key(1.36, move(0, 0, 0, -1)),
    key(1.76),
  ], [{ t: 0.18, name: 'charge' }, { t: 0.74, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 1.3, amp: 0.3 }, { t: 0.58, rate: 1, amp: 0.15 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Snore: asleep in the air, wings drooping and head sunk, it draws a huge
   * breath (swelling), then snores it out at the foe with its head thrown
   * forward, and sinks back into its doze.
   */
  const snore = flutter('snore', 1.7, [
    key(0),
    key(0.2, move(0, -0.03, 0, 6), wings(-8, -16), body(4, 12)),
    key(0.46, move(0, -0.01, -0.02, -6), wings(-6, -14), body(-2, -8), swell(1.05)),
    key(0.58, move(0, 0, -0.02, -8), wings(-6, -14), body(-3, -10), swell(1.06)),
    snap(0.66, move(0, -0.02, 0.03, 10), wings(-10, -16), body(5, 14), swell(0.98)),
    key(0.84, move(0, -0.03, 0.02, 9), wings(-8, -16), body(5, 13), swell(0.985)),
    key(1.06, move(0, -0.04, 0, 6), wings(-8, -16), body(4, 12)),
    key(1.34, move(0, -0.01, 0, 2), body(1, 4)),
    key(1.7),
  ], [{ t: 0.72, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 0.6, amp: 0.4 }, { t: 1.3, rate: 1, amp: 1 },
  ]);

  /**
   * Swift: a quick twirl in the air, its wings flicking open at the end of
   * it to spray a fan of stars at the foe.
   */
  const swift = flutter('swift', 1.36, [
    key(0),
    key(0.12, move(0, 0.03, 0, -6), wings(20, 18), body(-2, -4)),
    key(0.26, move(0, 0.08, 0, -4, 0, 180), wings(26, 20), body(-2, -4)),
    key(0.38, move(0, 0.09, 0, 2, 0, 330), wings(24, 16)),
    snap(0.46, move(0, 0.06, 0.02, 8, 0, 360), wings(-32, -14), body(3, 5)),
    key(0.62, move(0, 0.04, 0.01, 6, 0, 360), wings(-26, -12), body(2, 4)),
    key(0.84, move(0, 0.01, 0, 0, 0, 360), wings(-2, 0)),
    key(1.08, move(0, 0, 0, -1, 0, 360)),
    key(1.36, move(0, 0, 0, 0, 0, 360)),
  ], [{ t: 0.5, name: 'release' }], [
    { t: 0, rate: 1.2, amp: 1 }, { t: 0.1, rate: 1.6, amp: 0.3 }, { t: 0.44, rate: 1, amp: 0.2 }, { t: 0.8, rate: 1.1, amp: 1 },
  ]);

  /**
   * Poison Sting: its abdomen curls forward under its body like a wasp's,
   * the tip drawn back, then jabs at the foe and fires the barb from its tip;
   * it uncurls as it recovers.
   */
  const poisonSting = flutter('poison_sting', 1.24, [
    key(0),
    key(0.14, move(0, 0.03, -0.02, -8), abdomen(0.7), wings(12, 12), body(-2, -4)),
    key(0.24, move(0, 0.04, -0.03, -10), abdomen(0.85), wings(14, 14), body(-2, -5)),
    snap(0.32, move(0, 0.01, 0.03, 10), abdomen(1.25), wings(-12, -4), body(2, 4)),
    key(0.46, move(0, 0.01, 0.02, 8), abdomen(1.15), wings(-8, -2), body(2, 3)),
    key(0.64, move(0, 0.02, 0, -2), abdomen(0.4), wings(4, 2)),
    key(0.86, move(0, 0, 0, 1), abdomen(0.1)),
    key(1.24),
  ], [{ t: 0.36, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.12, rate: 1.4, amp: 0.4 }, { t: 0.62, rate: 1, amp: 1 },
  ]);

  return [gust, whirlwind, silverWind, hiddenPower, hyperBeam, solarBeamCharge, solarBeam, psychic, shadowBall, snore, swift, poisonSting];
}

