// The cocoons' moves (Silcoon, Cascoon: Tackle, Harden, String Shot, Poison
// Sting and Struggle), one clip each, built on each species' stance and
// character (./cocoon.ts). String Shot and Poison Sting leave the silk
// opening in its front (the `opening` emitter), so the whole body aims it.
//
// A blow is in contact for a few frames before its `impact` (the battle
// shows poses held four frames), and the game's effects start on it.

import type { Clip } from '../../../anim/clip';
import { type CocoonCharacter, HALF, OPEN, SHUT, SQUEEZE, at, bend, cocoonKit, hop, swell, tip } from './cocoon';

export function cocoonMoves(c: CocoonCharacter): Clip[] {
  const { key, snap, fall, clip, b } = cocoonKit(c);

  /**
   * Tackle: it gathers itself with a hop in place, then springs in an arc
   * and throws itself into the foe tipped forward, so the landing is the
   * blow; it bounces back off the foe, lands, and hops home, wobbling.
   */
  const tackle = clip('tackle', 1.56, [
    key(0),
    // Gather: tip back a little, the eyes narrowing on the foe.
    key(0.12, tip(-6 * b), bend(-3, -5), swell(0.97), HALF),
    // A hop in place, and down again squashed.
    key(0.22, hop(0.07 * b), tip(-2), bend(-2, -3), swell(1.02), HALF),
    fall(0.32, tip(-5 * b), bend(2, 4), swell(0.94), HALF),
    // The spring: up and over at the foe, tipping forward as it goes.
    snap(0.4, at(0.3, 0.12 * b, 0, 12 * b), bend(-3, -4), swell(1.05), OPEN),
    key(0.52, at(0.76, 0.19 * b, 0, 20 * b), bend(-2, -2), swell(1.04), OPEN),
    // Crash: it lands into the foe tipped forward, squashed against it.
    snap(0.6, at(1, 0.03, 0.22, 28 * b), bend(6, 10), swell(0.97), SQUEEZE),
    key(0.74, at(1, 0.02, 0.25, 26 * b), bend(7, 11), swell(0.96), SQUEEZE),
    // It bounces back off the foe, then lands and hops home.
    snap(0.86, at(0.92, 0.11 * b, 0.02, -14 * b), bend(-4, -6), swell(1.03), OPEN),
    fall(0.98, at(0.78, 0, 0, -4), bend(2, 3), swell(0.95), OPEN),
    key(1.1, at(0.38, 0.14 * b, 0, -8 * b), bend(-2, -3), swell(1.03), HALF),
    fall(1.22, at(0, 0, 0, 4), bend(3, 5), swell(0.95), HALF),
    // Wobble to rest.
    key(1.32, tip(-4 * b, 2), bend(-2, -2), swell(1.01), OPEN),
    key(1.44, tip(1.5, -1), OPEN),
    key(1.56, OPEN),
  ], [{ t: 0.68, name: 'impact' }]);

  /**
   * Harden: it draws itself in and tenses, the silk tightening (a tensed
   * shrink, eyes shut tight), shivers with the effort as the sheen spreads
   * over it (aura), holds hard and narrow-eyed, then eases off.
   */
  const harden = clip('harden', 1.4, [
    key(0),
    key(0.16, bend(-4, 8), swell(0.96), SQUEEZE),
    snap(0.3, bend(-5, 10), swell(0.9), SQUEEZE),
    key(0.38, bend(-5, 10, 0, 3), tip(0, 3), swell(0.9), SQUEEZE),
    key(0.46, bend(-5, 10, 0, -3), tip(0, -3), swell(0.905), SQUEEZE),
    key(0.54, bend(-5, 10, 0, 3), tip(0, 2.5), swell(0.9), SQUEEZE),
    key(0.62, bend(-5, 10, 0, -2.5), tip(0, -2.5), swell(0.905), SQUEEZE),
    key(0.8, bend(-3, 6), swell(0.93), HALF),
    key(1.0, bend(1, 1), swell(1.015), HALF),
    key(1.18, bend(0, -1), swell(1.005), OPEN),
    key(1.4, OPEN),
  ], [{ t: 0.5, name: 'aura' }]);

  /**
   * String Shot: it tips back, drawing in, then tips forward so its silk
   * opening points at the foe and sprays thread (emit), sweeping it from
   * side to side over the foe (the top bending one way, the body rolling
   * the other) for as long as the threads fly, then rocks back upright.
   */
  const stringShot = clip('string_shot', 1.76, [
    key(0),
    key(0.16, tip(-12 * b), { root: { z: -0.03 } }, bend(-6, -9), swell(1.03), HALF),
    key(0.24, tip(-13 * b), { root: { z: -0.035 } }, bend(-6, -10), swell(1.035), HALF),
    snap(0.32, tip(14 * b), { root: { z: 0.04 } }, bend(7, 10), swell(0.97), HALF),
    key(0.5, tip(13 * b, 5), { root: { z: 0.04 } }, bend(7, 10, 0, -7), swell(0.97), HALF),
    key(0.68, tip(14 * b, -5), { root: { z: 0.04 } }, bend(7, 10, 0, 7), swell(0.97), HALF),
    key(0.86, tip(13 * b, 4.5), { root: { z: 0.035 } }, bend(7, 10, 0, -6), swell(0.97), HALF),
    key(1.04, tip(14 * b, -4.5), { root: { z: 0.035 } }, bend(7, 10, 0, 6), swell(0.97), HALF),
    key(1.22, tip(12 * b, 2.5), { root: { z: 0.03 } }, bend(6, 9, 0, -3), swell(0.98), HALF),
    key(1.38, tip(8 * b), { root: { z: 0.015 } }, bend(4, 5), HALF),
    key(1.54, tip(-3, 1), bend(-1, -2), OPEN),
    key(1.76, OPEN),
  ], [{ t: 0.38, name: 'emit' }]);

  /**
   * Poison Sting: it draws back and tenses, then jolts forward like a
   * thrown dart, firing the barb from its opening (release), rocks back
   * from the recoil and wobbles upright.
   */
  const poisonSting = clip('poison_sting', 1.2, [
    key(0),
    key(0.14, tip(-13 * b), { root: { z: -0.03 } }, bend(-6, -8), swell(0.96), HALF),
    key(0.22, tip(-15 * b, 1), { root: { z: -0.04 } }, bend(-7, -9), swell(0.95), HALF),
    snap(0.3, tip(18 * b), { root: { y: 0.03, z: 0.09 }, plantFeet: 0 }, bend(7, 10), swell(1.05), OPEN),
    key(0.46, tip(10 * b), { root: { z: 0.06 } }, bend(3, 5), swell(1.02), OPEN),
    key(0.6, tip(-5 * b, -1), bend(-2, -3), HALF),
    key(0.76, tip(3, 1), bend(1, 1), HALF),
    key(0.94, tip(-1), OPEN),
    key(1.2, OPEN),
  ], [{ t: 0.36, name: 'release' }]);

  /**
   * Struggle: spent, it sags, then flops toward the foe in two feeble hops,
   * teeters, topples into the foe (impact), jolts back wincing from the
   * recoil, and drags itself home in two tired hops.
   */
  const struggle = clip('struggle', 2.04, [
    key(0),
    key(0.14, tip(6), bend(3, 5), swell(0.98), HALF),
    key(0.3, at(0.35, 0.08 * b, 0, 8), swell(1.01), HALF),
    fall(0.42, at(0.55, 0, 0, 4), bend(2, 4), swell(0.96), HALF),
    key(0.56, at(0.85, 0.09 * b, 0, 10), swell(1.01), HALF),
    fall(0.68, at(1, 0, 0, 2), bend(2, 3), swell(0.96), HALF),
    // It teeters back, then topples into the foe.
    key(0.8, at(1, 0, 0, -8, 6), bend(-3, -5, 2), swell(0.99), HALF),
    snap(0.9, at(1, 0, 0.22, 30, -6), bend(6, 10, -3), swell(0.97), SQUEEZE),
    key(1.02, at(1, 0, 0.24, 28, -5), bend(6, 10, -3), swell(0.965), SQUEEZE),
    // The recoil hurts: it jolts back with a wince.
    snap(1.14, at(1, 0.04, 0.04, -12, 4), bend(-4, -6), swell(1.02), SHUT),
    key(1.28, at(1, 0, 0, 4, -5), bend(2, 2), HALF),
    // Two tired hops home.
    key(1.42, at(0.62, 0.08 * b, 0, -6), swell(1.01), HALF),
    fall(1.54, at(0.4, 0, 0, 2), bend(2, 3), swell(0.96), HALF),
    key(1.66, at(0.16, 0.07 * b, 0, -5), swell(1.01), HALF),
    fall(1.78, at(0, 0, 0, 3), bend(2, 3), swell(0.96), HALF),
    key(1.9, tip(-2, 1), HALF),
    key(2.04, OPEN),
  ], [{ t: 0.98, name: 'impact' }]);

  return [tackle, harden, stringShot, poisonSting, struggle];
}

