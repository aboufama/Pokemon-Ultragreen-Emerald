// Beautifly's own moves (not Dustox's): the drains through its proboscis
// (Absorb, Mega Drain, Giga Drain: the same reach, more of it each time),
// Stun Spore shaken from its wings, Toxic sprayed from its proboscis,
// Morning Sun and Safeguard. Built on the moth kit (../moth/moth.ts).

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import { type MothCharacter, body, move, mothKit, swell } from './moth/moth';

/**
 * The proboscis, from its coil (0: the stance) to reaching straight out at
 * the foe (1): the chain uncoils and its root lifts it level.
 */
export const reach = (k: number): Pose => {
  const bones: Record<string, { x: number }> = { proboscis1: { x: -10 * k } };
  for (let i = 2; i <= 12; i++) bones[`proboscis${i}`] = { x: 32 * k };
  return { bones };
};

/** A sip: the reaching proboscis draws, the tip curling a little and the chain rippling. */
const sip = (k: number, s: number): Pose => {
  const bones: Record<string, { x: number }> = { proboscis1: { x: -10 * k } };
  for (let i = 2; i <= 12; i++) bones[`proboscis${i}`] = { x: 32 * k - s * (i > 8 ? 6 : 2) };
  return { bones };
};

export function beautiflyOwn(c: MothCharacter): Clip[] {
  const { key, snap, flutter, wings } = mothKit(c);

  /**
   * Absorb: it leans in and uncoils its proboscis at the foe, draws a sip of
   * its energy (release), swelling a little as it drinks, and coils back up.
   */
  const absorb = flutter('absorb', 1.56, [
    key(0),
    key(0.16, move(0, 0.03, -0.02, -6), wings(10, 10), body(-2, -6)),
    snap(0.32, move(0, 0.01, 0.03, 8), reach(1), body(2, 6)),
    key(0.5, move(0, 0.01, 0.03, 8), sip(1, 1), body(2, 6), swell(1.02)),
    key(0.66, move(0, 0.01, 0.03, 7), sip(1, 0), body(2, 5), swell(1.03)),
    key(0.84, move(0, 0.02, 0.01, 2), reach(0.5), body(1, 2), swell(1.02)),
    key(1.04, move(0, 0.01, 0, -1), reach(0.1)),
    key(1.28, move(0, 0, 0, 0.5)),
    key(1.56),
  ], [{ t: 0.38, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.3, rate: 1, amp: 0.6 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Mega Drain: it leans right in with its wings spread and its proboscis
   * stretched at the foe, and drinks in long pulls (release), its body
   * swelling with each, then pulls back and coils up.
   */
  const megaDrain = flutter('mega_drain', 1.86, [
    key(0),
    key(0.18, move(0, 0.04, -0.03, -8), wings(-14, -6), body(-3, -8)),
    snap(0.34, move(0, 0.01, 0.06, 12), wings(-24, -10), reach(1), body(3, 8)),
    key(0.52, move(0, 0.01, 0.07, 12), wings(-24, -10), sip(1, 1.5), body(3, 8), swell(1.03)),
    key(0.7, move(0, 0.01, 0.06, 11), wings(-22, -10), sip(1, 0), body(3, 7), swell(1.01)),
    key(0.88, move(0, 0.01, 0.07, 12), wings(-24, -10), sip(1, 1.5), body(3, 8), swell(1.045)),
    key(1.06, move(0, 0.01, 0.06, 10), wings(-20, -8), sip(1, 0), body(3, 6), swell(1.03)),
    key(1.26, move(0, 0.03, 0.01, 0), wings(-6, -2), reach(0.4), body(0, 0), swell(1.02)),
    key(1.5, move(0, 0.01, 0, -1), reach(0.05)),
    key(1.86),
  ], [{ t: 0.4, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.32, rate: 0.9, amp: 0.5 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  /**
   * Giga Drain: it rises and spreads its wings wide and still, stretches its
   * proboscis out at the foe and drinks deep, its whole body straining and
   * swelling in great pulls (release), then a last big gulp, and it coils
   * back up, glowing with the stolen energy.
   */
  const gigaDrain = flutter('giga_drain', 2.24, [
    key(0),
    key(0.2, move(0, 0.08, -0.03, -10), wings(-24, 14), body(-3, -10)),
    key(0.34, move(0, 0.1, -0.04, -12), wings(-28, 16), body(-4, -12), swell(1.02)),
    snap(0.46, move(0, 0.05, 0.07, 14), wings(-34, 8), reach(1), body(4, 10)),
    key(0.66, move(0, 0.05, 0.08, 14, 1), wings(-35, 8), sip(1, 2), body(4, 10), swell(1.04)),
    key(0.86, move(0, 0.05, 0.07, 13, -1), wings(-34, 8), sip(1, 0), body(4, 9), swell(1.02)),
    key(1.06, move(0, 0.05, 0.08, 14, 1), wings(-35, 8), sip(1, 2), body(4, 10), swell(1.06)),
    key(1.26, move(0, 0.05, 0.07, 13, -1), wings(-34, 8), sip(1, 0), body(4, 9), swell(1.04)),
    key(1.44, move(0, 0.06, 0.06, 10), wings(-30, 10), sip(1, 3), body(3, 7), swell(1.08)),
    key(1.62, move(0, 0.05, 0.01, -2), wings(-12, 4), reach(0.3), body(-1, -3), swell(1.04)),
    key(1.86, move(0, 0.02, 0, -1), reach(0.05), swell(1.01)),
    key(2.24),
  ], [{ t: 0.52, name: 'release' }], [
    { t: 0, rate: 1.2, amp: 1.1 }, { t: 0.44, rate: 0.8, amp: 0.3 }, { t: 1.6, rate: 1, amp: 1 },
  ]);

  /**
   * Stun Spore: it rises over the foe and shakes its wings in a quick,
   * shivering flurry, the body shimmying, so the powder sifts off them at
   * the foe (emit), then settles.
   */
  const stunSpore = flutter('stun_spore', 1.64, [
    key(0),
    key(0.18, move(0, 0.06, 0.02, 6), wings(10, 16), body(2, 4)),
    key(0.32, move(0.02, 0.08, 0.03, 10, 6), wings(-8, 12), body(3, 6, 0, 4)),
    key(0.44, move(-0.02, 0.08, 0.03, 10, -6), wings(-6, 14), body(3, 6, 0, -4)),
    key(0.56, move(0.02, 0.08, 0.03, 10, 6), wings(-8, 12), body(3, 6, 0, 4)),
    key(0.68, move(-0.02, 0.08, 0.03, 10, -5), wings(-6, 14), body(3, 6, 0, -3)),
    key(0.8, move(0.01, 0.07, 0.02, 8, 3), wings(-4, 10), body(2, 5, 0, 2)),
    key(1.02, move(0, 0.03, 0, 2), wings(2, 4)),
    key(1.3, move(0, 0.01, 0, -0.5)),
    key(1.64),
  ], [{ t: 0.4, name: 'emit' }], [
    { t: 0, rate: 1.2, amp: 1 }, { t: 0.3, rate: 3, amp: 0.5 }, { t: 0.84, rate: 1.2, amp: 1 },
  ]);

  /**
   * Toxic: it rears up, then leans in and sprays a stream of poison from its
   * half-uncoiled proboscis over the foe (emit), sweeping it, and coils back.
   */
  const toxic = flutter('toxic', 1.66, [
    key(0),
    key(0.18, move(0, 0.05, -0.03, -10), wings(14, 16), body(-3, -8), swell(1.03)),
    snap(0.32, move(0, 0.02, 0.03, 10), wings(-14, -4), reach(0.7), body(3, 8), swell(0.98)),
    key(0.5, move(0, 0.02, 0.03, 10, 4), reach(0.72), body(3, 8, 8)),
    key(0.68, move(0, 0.02, 0.03, 10, -4), reach(0.72), body(3, 8, -8)),
    key(0.86, move(0, 0.02, 0.03, 9, 2), reach(0.7), body(3, 7, 4)),
    key(1.06, move(0, 0.02, 0.01, 2), reach(0.3), body(1, 2)),
    key(1.3, move(0, 0.01, 0, -1), reach(0.05)),
    key(1.66),
  ], [{ t: 0.38, name: 'emit' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.3, rate: 1.1, amp: 0.6 }, { t: 1.1, rate: 1, amp: 1 },
  ]);

  /**
   * Morning Sun: it rises and turns its face up to the morning light, wings
   * spread flat and wide to soak it in, swaying gently on a slow beat as it
   * heals (aura), and drifts back down.
   */
  const morningSun = flutter('morning_sun', 1.9, [
    key(0),
    key(0.24, move(0, 0.08, -0.02, -12), wings(-18, -10), body(-5, -14)),
    key(0.52, move(0, 0.13, -0.03, -20, -3), wings(-30, -14), body(-7, -22, 0, -4), swell(1.03)),
    key(0.84, move(0, 0.14, -0.03, -21, 3), wings(-31, -14), body(-7, -23, 0, 4), swell(1.04)),
    key(1.14, move(0, 0.13, -0.03, -20, -2), wings(-30, -14), body(-7, -22, 0, -2), swell(1.035)),
    key(1.42, move(0, 0.06, -0.01, -8), wings(-10, -4), body(-3, -8), swell(1.01)),
    key(1.66, move(0, 0.01, 0, 0.5)),
    key(1.9),
  ], [{ t: 0.6, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.4, rate: 0.6, amp: 0.5 }, { t: 1.4, rate: 1, amp: 1 },
  ]);

  /**
   * Safeguard: calm, it opens its wings wide and slow and sweeps them round
   * itself in one serene stroke, the protecting veil settling over it (aura).
   */
  const safeguard = flutter('safeguard', 1.7, [
    key(0),
    key(0.22, move(0, 0.05, 0, -6), wings(-26, -8), body(-2, -8)),
    key(0.46, move(0, 0.07, 0, -8), wings(-32, -10), body(-3, -10), swell(1.03)),
    key(0.7, move(0, 0.06, 0, 2), wings(-56, -20), body(1, 4), swell(1.02)),
    key(0.94, move(0, 0.06, 0, 3, 1), wings(-58, -20), body(1, 5), swell(1.02)),
    key(1.18, move(0, 0.03, 0, 0), wings(-18, -6), body(0, 0)),
    key(1.44, move(0, 0.01, 0, -0.5)),
    key(1.7),
  ], [{ t: 0.74, name: 'aura' }], [
    { t: 0, rate: 0.7, amp: 0.7 }, { t: 0.2, rate: 0.6, amp: 0.3 }, { t: 1.2, rate: 1, amp: 1 },
  ]);

  return [absorb, megaDrain, gigaDrain, stunSpore, toxic, morningSun, safeguard];
}
