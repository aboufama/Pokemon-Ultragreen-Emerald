// Dustox's own moves (not Beautifly's): its mind reaches out through its
// antennae (Confusion, Psybeam), it hurls sludge from its mouth (Sludge
// Bomb), looses its toxic powder from its wings (Toxic), draws energy in
// with its antennae forward (Giga Drain), soaks in the moonlight and raises
// a wall of light. Built on the moth kit (src/pokemon/beautifly/moth/moth.ts).

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import { FROWN, GAPE, type MothCharacter, SHUT, body, move, mothKit, swell } from '../beautifly/moth/moth';

/** The antennae swung forward at the foe (1) or back (-1), spread (+) or drawn together (-). */
export const antennae = (forward: number, spread = 0): Pose => ({
  bones: {
    antenna1L: { x: 30 * forward, z: 10 * spread }, antenna2L: { x: 20 * forward },
    antenna1R: { x: 30 * forward, z: -10 * spread }, antenna2R: { x: 20 * forward },
  },
});

export function dustoxOwn(c: MothCharacter): Clip[] {
  const { key, snap, flutter, wings } = mothKit(c);

  /**
   * Confusion: it goes still in the air and concentrates, its antennae
   * swinging forward at the foe as the power gathers in them, then pushes
   * with its head (release: the foe is gripped), holds, and eases.
   */
  const confusion = flutter('confusion', 1.56, [
    key(0),
    key(0.18, move(0, 0.03, -0.02, -6), antennae(-0.4, 0.4), body(-2, -8), SHUT),
    key(0.34, move(0, 0.04, -0.02, -7), antennae(-0.5, 0.5), body(-2, -9), swell(1.02), SHUT),
    snap(0.44, move(0, 0.03, 0.03, 8), antennae(1, 0.2), body(3, 12)),
    key(0.62, move(0, 0.03, 0.03, 8, 1), antennae(1.05, 0.2), body(3, 12, 1)),
    key(0.8, move(0, 0.03, 0.03, 8, -1), antennae(1, 0.2), body(3, 12, -1)),
    key(1.0, move(0, 0.02, 0.01, 2), antennae(0.3), body(1, 3)),
    key(1.26, move(0, 0.01, 0, -0.5)),
    key(1.56),
  ], [{ t: 0.5, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 1.4, amp: 0.3 }, { t: 1.0, rate: 1, amp: 1 },
  ]);

  /**
   * Psybeam: it draws its antennae back and together, glowing (charge),
   * then points them at the foe and fires a wavering beam from them,
   * swaying with it, and eases off.
   */
  const psybeam = flutter('psybeam', 2.06, [
    key(0),
    key(0.2, move(0, 0.04, -0.02, -8), antennae(-0.6, -0.4), body(-3, -10), SHUT),
    key(0.42, move(0, 0.05, -0.03, -9), antennae(-0.7, -0.5), body(-3, -11), swell(1.03), SHUT),
    snap(0.54, move(0, 0.03, 0.02, 10), antennae(1, 0), body(4, 12), wings(-16, -4)),
    key(0.76, move(0.02, 0.03, 0.02, 10, 4), antennae(1, 0.2), body(4, 12, 6), wings(-16, -4)),
    key(0.98, move(-0.02, 0.03, 0.02, 10, -4), antennae(1, -0.2), body(4, 12, -6), wings(-16, -4)),
    key(1.2, move(0.02, 0.03, 0.02, 10, 3), antennae(1, 0.2), body(4, 12, 4), wings(-16, -4)),
    key(1.4, move(0, 0.03, 0.02, 9), antennae(0.9), body(4, 11), wings(-14, -4)),
    key(1.6, move(0, 0.02, 0, 1), antennae(0.2), body(1, 2)),
    key(1.82, move(0, 0.01, 0, -0.5)),
    key(2.06),
  ], [{ t: 0.12, name: 'charge' }, { t: 0.6, name: 'release' }, { t: 1.44, name: 'releaseEnd' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1.3, amp: 0.3 }, { t: 1.56, rate: 1, amp: 1 },
  ]);

  /**
   * Sludge Bomb: it rears up and back, swelling as it heaves the sludge up,
   * then lunges its head at the foe and hurls the glob from its mouth
   * (release), recoiling from the throw.
   */
  const sludgeBomb = flutter('sludge_bomb', 1.64, [
    key(0),
    key(0.18, move(0, 0.05, -0.03, -10), wings(16, 18), body(-4, -12), swell(1.04), SHUT),
    key(0.34, move(0, 0.07, -0.04, -13), wings(20, 22), body(-5, -15), swell(1.07), SHUT),
    snap(0.44, move(0, 0.02, 0.04, 12), wings(-18, -6), body(5, 14), swell(0.98), GAPE),
    key(0.6, move(0, 0.02, 0.03, 10), wings(-14, -4), body(4, 12), swell(0.99), GAPE),
    key(0.8, move(0, 0.03, -0.01, -4), wings(4, 4), body(-1, -3), FROWN),
    key(1.02, move(0, 0.01, 0, 1), body(0, 1)),
    key(1.3, move(0, 0, 0, -0.5)),
    key(1.64),
  ], [{ t: 0.5, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.16, rate: 1.2, amp: 0.4 }, { t: 0.78, rate: 1, amp: 1 },
  ]);

  /**
   * Toxic: it rises over the foe and beats its wings in slow, heavy,
   * dusting strokes, loosing its highly toxic powder down on the foe (emit),
   * then drifts back down.
   */
  const toxic = flutter('toxic', 1.84, [
    key(0),
    key(0.2, move(0, 0.08, 0.03, 8), wings(18, 22), body(2, 6)),
    key(0.36, move(0, 0.1, 0.04, 12), wings(-30, -12), body(3, 8)),
    key(0.52, move(0, 0.1, 0.04, 10), wings(22, 24), body(3, 8)),
    key(0.68, move(0, 0.1, 0.04, 12), wings(-32, -12), body(3, 8)),
    key(0.84, move(0, 0.09, 0.04, 10), wings(20, 22), body(3, 7)),
    key(1.0, move(0, 0.08, 0.03, 11), wings(-28, -10), body(3, 7)),
    key(1.2, move(0, 0.04, 0.01, 3), wings(-4, 0), body(1, 2)),
    key(1.5, move(0, 0.01, 0, -0.5)),
    key(1.84),
  ], [{ t: 0.4, name: 'emit' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.18, rate: 1, amp: 0.2 }, { t: 1.16, rate: 1, amp: 1 },
  ]);

  /**
   * Giga Drain: it spreads its wings wide and leans in with its antennae
   * swung forward at the foe, and draws the energy out of it in deep pulls
   * (release), the body swelling and the wings trembling, then settles back,
   * glowing.
   */
  const gigaDrain = flutter('giga_drain', 2.2, [
    key(0),
    key(0.2, move(0, 0.06, -0.03, -8), wings(-22, 10), antennae(-0.3, 0.4), body(-3, -8)),
    snap(0.4, move(0, 0.04, 0.06, 12), wings(-32, 6), antennae(1, 0.3), body(4, 10), GAPE),
    key(0.6, move(0, 0.04, 0.07, 12, 1), wings(-33, 6), antennae(1.1, 0.3), body(4, 10), swell(1.04), GAPE),
    key(0.8, move(0, 0.04, 0.06, 11, -1), wings(-32, 6), antennae(1, 0.3), body(4, 9), swell(1.02), GAPE),
    key(1.0, move(0, 0.04, 0.07, 12, 1), wings(-33, 6), antennae(1.1, 0.3), body(4, 10), swell(1.06), GAPE),
    key(1.2, move(0, 0.04, 0.06, 11, -1), wings(-32, 6), antennae(1, 0.3), body(4, 9), swell(1.04), GAPE),
    key(1.42, move(0, 0.03, 0.01, -2), wings(-10, 2), antennae(0.2), body(-1, -3), swell(1.05)),
    key(1.7, move(0, 0.01, 0, 1), swell(1.01)),
    key(2.2),
  ], [{ t: 0.46, name: 'release' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.38, rate: 1.8, amp: 0.25 }, { t: 1.4, rate: 1, amp: 1 },
  ]);

  /**
   * Moonlight: it rises and turns its face up to the night sky, wings spread
   * wide and flat, soaking in the moonlight on a slow beat as it heals
   * (aura), and drifts back down.
   */
  const moonlight = flutter('moonlight', 1.9, [
    key(0),
    key(0.26, move(0, 0.07, -0.02, -12), wings(-14, -8), antennae(-0.4, 0.4), body(-4, -14), SHUT),
    key(0.56, move(0, 0.12, -0.03, -19, 2), wings(-24, -10), antennae(-0.6, 0.6), body(-6, -21, 0, 3), swell(1.03), SHUT),
    key(0.88, move(0, 0.13, -0.03, -20, -2), wings(-25, -10), antennae(-0.6, 0.6), body(-6, -22, 0, -3), swell(1.04), SHUT),
    key(1.18, move(0, 0.12, -0.03, -19, 1), wings(-24, -10), antennae(-0.6, 0.6), body(-6, -21, 0, 2), swell(1.035), SHUT),
    key(1.46, move(0, 0.05, -0.01, -6), wings(-8, -4), antennae(-0.1), body(-2, -6), swell(1.01)),
    key(1.68, move(0, 0.01, 0, 0.5)),
    key(1.9),
  ], [{ t: 0.64, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.4, rate: 0.55, amp: 0.45 }, { t: 1.44, rate: 1, amp: 1 },
  ]);

  /**
   * Light Screen: it sweeps its wings forward and holds them out in front of
   * itself, pushing a wall of light out before it (aura), then draws them
   * back.
   */
  const lightScreen = flutter('light_screen', 1.56, [
    key(0),
    key(0.16, move(0, 0.03, -0.03, -6), wings(22, 18), body(-2, -6)),
    snap(0.3, move(0, 0.02, 0.03, 4), wings(-50, 4), body(2, 4), swell(1.02)),
    key(0.5, move(0, 0.02, 0.05, 5, 1), wings(-52, 4), body(2, 5), swell(1.02)),
    key(0.7, move(0, 0.02, 0.05, 5, -1), wings(-52, 5), body(2, 5), swell(1.02)),
    key(0.9, move(0, 0.02, 0.02, 1), wings(-20, 2), body(0, 1)),
    key(1.16, move(0, 0, 0, -0.5)),
    key(1.56),
  ], [{ t: 0.36, name: 'aura' }], [
    { t: 0, rate: 1, amp: 1 }, { t: 0.28, rate: 1.2, amp: 0.15 }, { t: 0.9, rate: 1, amp: 1 },
  ]);

  return [confusion, psybeam, sludgeBomb, toxic, gigaDrain, moonlight, lightScreen];
}
