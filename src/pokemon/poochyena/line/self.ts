// Moves on itself, from home: Protect, Endure, Substitute, Psych Up, Sleep
// Talk, Double Team, Rest, Sunny Day, Rain Dance. Protect hunkers into a
// guard, Endure braces and trembles with its teeth clenched, Substitute
// strains and hops back out of the way, Psych Up shakes its head and pumps
// itself up, Sleep Talk dreams aloud (paws paddling), Double Team darts from
// side to side, Rest lies down and curls up asleep, Sunny Day calls the sun
// with its face raised, Rain Dance prances and spins and yips for the rain.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { AIR, GROUND, HIND, type Kit, Take, body, eyes } from './kit';
import { fierce, furious } from './travel';

/**
 * Lying on its belly, forelegs out in front and hind legs folded under it,
 * asleep with its chin on its paws; `lift` raises the head from there (an
 * alert lie, a snore), `curl` turns it round toward its flank.
 */
export const lying = (k: Kit, o: { lift?: number; head?: number; headY?: number; headZ?: number; roll?: number; curl?: number } = {}): Pose[] => [
  { plantFeet: 0, plantFront: 0 },
  k.legs.lie,
  body(k, { y: k.lieY, spine: 4, rump: k.lieRump, neck: k.sleepNeck - (o.lift ?? 0), head: k.sleepHead + (o.head ?? 0), headY: o.headY ?? 0, headZ: o.headZ ?? 0, roll: o.roll ?? 0, turn: (o.curl ?? 0) * 0.6, neckY: o.curl ?? 0 }),
];

/** Protect: it backs up and hunkers down on braced legs, ears pinned, head tucked, every hair on end, a growl's tremor through the guard. */
export function protect(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.2, GROUND, body(k, { y: -0.045, z: -0.03, spine: 2, neck: 8, head: 12 }), k.jaw(-4), k.ears(-22), k.tail(8), k.hackles(24), eyes('closed'));
  c.snap(0.34, GROUND, body(k, { y: -0.07, z: -0.04, spine: 3, neck: 12, head: 14 }), k.jaw(6), k.ears(-38), k.tail(20), k.hackles(42), eyes('angry'));
  c.on('aura', 0.38);
  c.key(0.54, GROUND, body(k, { y: -0.073, z: -0.041, spine: 3, neck: 12, head: 14, headY: 3, headZ: 4 }), k.jaw(5), k.ears(-38), k.tail(24), k.hackles(45), eyes('angry'));
  c.key(0.74, GROUND, body(k, { y: -0.066, z: -0.038, spine: 3, neck: 11, head: 13, headY: -3, headZ: -4 }), k.jaw(9), k.ears(-36), k.tail(17), k.hackles(39), eyes('angry'));
  c.key(0.94, GROUND, body(k, { y: -0.072, z: -0.041, spine: 3, neck: 12, head: 14, headY: 2, headZ: 3 }), k.jaw(5), k.ears(-38), k.tail(23), k.hackles(44), eyes('angry'));
  c.key(1.14, GROUND, body(k, { y: -0.024, z: -0.012, spine: 1, neck: 4, head: 5 }), k.ears(-8), k.tail(10), k.hackles(18), eyes('angry'));
  c.key(1.46, GROUND, eyes('open'));
  return c.clip('protect');
}

/** Endure: it braces forward over its planted paws, head low, teeth clenched and eyes screwed shut, trembling with the strain. */
export function endure(k: Kit): Clip {
  const c = new Take(k);
  const strain = (s: number) => body(k, { y: -0.08, z: 0.03, spine: 12, chest: 4, neck: 18, head: 6, roll: 3 * s, headZ: 3 * s });
  const grit = [k.jaw(-14), k.ears(-40), k.tail(-6), k.hackles(34), eyes('hurt')];
  c.key(0, GROUND);
  c.key(0.18, GROUND, body(k, { y: -0.05, z: 0.01, spine: 8, neck: 12, head: 4 }), k.jaw(-8), k.ears(-24), k.tail(0), k.hackles(20), eyes('angry'));
  c.snap(0.3, GROUND, strain(1), ...grit);
  c.on('aura', 0.34);
  c.key(0.38, GROUND, strain(-1), ...grit);
  c.key(0.46, GROUND, strain(1), ...grit);
  c.key(0.54, GROUND, strain(-1), ...grit);
  c.key(0.62, GROUND, strain(1), ...grit);
  c.key(0.7, GROUND, strain(-0.6), ...grit);
  c.key(0.86, GROUND, body(k, { y: -0.03, z: 0.01, spine: 4, neck: 6, head: 2 }), k.jaw(-4), ...fierce(k, 0.7));
  c.key(1.12, GROUND, eyes('open'));
  return c.clip('endure');
}

/** Substitute: it gathers and strains in a burst of effort (the doll forms), then hops back out of the way and, after a beat, hops back to its spot. */
export function substitute(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.2, GROUND, body(k, { y: -0.07, z: -0.01, spine: 8, neck: 14, head: 14 }), k.jaw(-6), k.ears(-24), k.tail(-4), k.hackles(10), eyes('closed'));
  // The burst: it throws itself up and open.
  c.snap(0.32, GROUND, body(k, { y: 0.01, z: 0.01, spine: -8, chest: -5, neck: -10, head: -10 }), k.jaw(22), k.ears(10), k.tail(30), k.hackles(40), eyes('angry'));
  c.on('aura', 0.34);
  c.key(0.44, GROUND, body(k, { y: 0.008, spine: -7, chest: -5, neck: -9, head: -9, headZ: 3 }), k.jaw(16), k.ears(8), k.tail(28), k.hackles(38), eyes('angry'));
  // Hop back out of the way.
  c.key(0.56, AIR, { root: { y: 0.08, z: -0.12 } }, k.legs.tuck, body(k, { spine: -4, neck: 2 }), k.ears(-6), k.tail(16), k.hackles(16), eyes('angry'));
  c.key(0.68, GROUND, { root: { z: -0.22 } }, body(k, { y: -0.05, spine: 5, neck: 5 }), k.ears(-4), k.tail(12), k.hackles(12), eyes('angry'));
  c.key(0.9, GROUND, { root: { z: -0.22 } }, body(k, { y: -0.03, spine: 3, neck: 3, head: -2, headZ: 3 }), k.ears(-2), k.tail(10), k.hackles(10), eyes('open'));
  // And back to its spot.
  c.key(1.02, AIR, { root: { y: 0.07, z: -0.1 } }, k.legs.tuck, body(k, { spine: -3, neck: 2 }), k.tail(10), eyes('open'));
  c.key(1.14, GROUND, { root: { z: 0 } }, body(k, { y: -0.04, spine: 4, neck: 4 }), k.tail(8), eyes('open'));
  c.key(1.4, GROUND, { root: { z: 0 } }, eyes('open'));
  return c.clip('substitute');
}

/** Psych Up: a hard shake of the head, then it pumps itself up, bouncing on its forepaws, bristling, tail lashing: fired up. */
export function psychUp(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.12, GROUND, body(k, { y: -0.02, spine: 2, neck: 4, head: 2, headY: 18, headZ: -12 }), k.jaw(8), k.ears(-10), k.tail(12), k.hackles(14), eyes('closed'));
  c.key(0.22, GROUND, body(k, { y: -0.02, spine: 2, neck: 4, head: 2, headY: -18, headZ: 12 }), k.jaw(8), k.ears(-10), k.tail(12), k.hackles(18), eyes('closed'));
  c.key(0.32, GROUND, body(k, { y: -0.02, spine: 2, neck: 4, head: 2, headY: 14, headZ: -8 }), k.jaw(6), k.ears(-8), k.tail(14), k.hackles(22), eyes('closed'));
  // Bounce, bounce: the forepaws off the ground and down again.
  c.key(0.42, GROUND, body(k, { y: -0.05, z: -0.02, spine: 6, neck: 6, head: 0 }), k.jaw(4), ...fierce(k));
  c.snap(0.52, HIND, body(k, { y: 0.01, z: -0.02, spine: -12, chest: -4, neck: -4, head: 2 }), k.legs.rear, k.jaw(20), ...furious(k));
  c.on('aura', 0.54);
  c.fall(0.62, GROUND, body(k, { y: -0.05, z: -0.01, spine: 6, neck: 6, head: -2 }), k.jaw(6), ...furious(k));
  c.snap(0.72, HIND, body(k, { y: 0.012, z: -0.02, spine: -13, chest: -4, neck: -4, head: 2 }), k.legs.rear, k.jaw(24), ...furious(k));
  c.fall(0.82, GROUND, body(k, { y: -0.05, z: -0.01, spine: 6, neck: 6, head: -2 }), k.jaw(6), ...furious(k));
  c.key(1.0, GROUND, body(k, { y: -0.015, spine: 2, neck: 2 }), k.jaw(2), ...fierce(k, 0.7));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('psych_up');
}

/** Sleep Talk: it slumps down asleep, then mumbles in its sleep, jaws working and paws paddling as it dreams; it stirs back up. */
export function sleepTalk(k: Kit): Clip {
  const c = new Take(k);
  const paddle = (s: number): Pose => ({ post: { armL: { x: -75 + 18 * s }, armR: { x: -75 - 18 * s }, forearmL: { x: -15 - 20 * s }, forearmR: { x: -15 + 20 * s } } });
  c.key(0, GROUND);
  c.key(0.26, GROUND, body(k, { y: -0.08, spine: 4, neck: 12, head: 10 }), k.ears(-14), k.tail(-8), k.hackles(-8), eyes('half'));
  c.key(0.5, GROUND, ...lying(k, {}), k.ears(-18), k.tail(-8, 20), k.hackles(-12), eyes('closed'));
  // Mumbling, paws paddling.
  c.key(0.62, GROUND, ...lying(k, { lift: 3, head: -4, headZ: 4 }), paddle(1), k.jaw(12), k.ears(-12), k.tail(-6, 22), k.hackles(-10), eyes('closed'));
  c.on('aura', 0.64);
  c.key(0.74, GROUND, ...lying(k, { head: -1, headZ: -2 }), paddle(-1), k.jaw(2), k.ears(-18), k.tail(-6, 18), k.hackles(-12), eyes('closed'));
  c.key(0.86, GROUND, ...lying(k, { lift: 3, head: -4, headZ: 3 }), paddle(1), k.jaw(14), k.ears(-12), k.tail(-6, 22), k.hackles(-10), eyes('closed'));
  c.key(0.98, GROUND, ...lying(k, { head: -1, headZ: -2 }), paddle(-1), k.jaw(0), k.ears(-18), k.tail(-6, 18), k.hackles(-12), eyes('closed'));
  c.key(1.14, GROUND, ...lying(k, {}), paddle(0), k.jaw(4), k.ears(-16), k.tail(-6, 20), k.hackles(-12), eyes('closed'));
  // Stirs back up, drowsy.
  c.key(1.4, GROUND, body(k, { y: -0.05, spine: 3, neck: 8, head: 6 }), k.ears(-8), k.tail(0), k.hackles(-4), eyes('half'));
  c.key(1.7, GROUND, eyes('open'));
  return c.clip('sleep_talk');
}

/** Double Team: it darts from side to side in quick hops, too fast to follow, head and guard low; the afterimages swing out from it. */
export function doubleTeam(k: Kit): Clip {
  const c = new Take(k);
  const w = 0.2;
  const dart = (x: number) => [{ root: { x } }];
  c.key(0, GROUND);
  c.key(0.1, GROUND, body(k, { y: -0.05, spine: 6, neck: 8, head: -6 }), ...fierce(k, 0.8));
  c.key(0.18, AIR, ...dart(w * 0.8), { root: { y: 0.05 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k, 0.8));
  c.on('aura', 0.2);
  c.key(0.27, GROUND, ...dart(w), body(k, { y: -0.05, spine: 6, neck: 8, head: -6, headY: -8 }), ...fierce(k, 0.8));
  c.key(0.38, AIR, ...dart(0), { root: { y: 0.06 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k, 0.8));
  c.key(0.48, GROUND, ...dart(-w), body(k, { y: -0.05, spine: 6, neck: 8, head: -6, headY: 8 }), ...fierce(k, 0.8));
  c.key(0.59, AIR, ...dart(0), { root: { y: 0.06 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k, 0.8));
  c.key(0.69, GROUND, ...dart(w * 0.9), body(k, { y: -0.05, spine: 6, neck: 8, head: -6, headY: -8 }), ...fierce(k, 0.8));
  c.key(0.8, AIR, ...dart(0), { root: { y: 0.06 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k, 0.8));
  c.key(0.9, GROUND, ...dart(-w * 0.8), body(k, { y: -0.05, spine: 6, neck: 8, head: -6, headY: 8 }), ...fierce(k, 0.8));
  c.key(1.02, AIR, ...dart(-w * 0.3), { root: { y: 0.05 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k, 0.6));
  c.key(1.12, GROUND, ...dart(0), body(k, { y: -0.045, spine: 5, neck: 5, head: -3 }), ...fierce(k, 0.6));
  c.key(1.36, GROUND, ...dart(0), body(k, { y: -0.01, spine: 1, neck: 1 }), ...fierce(k, 0.3));
  c.key(1.6, GROUND, ...dart(0), eyes('open'));
  return c.clip('double_team');
}

/** Rest: it turns a little and lies down, curls up with its chin low and its tail round it, eyes shut, breathing slow while it heals; gets up refreshed. */
export function rest(k: Kit): Clip {
  const c = new Take(k);
  const sleep = (s: number) => [...lying(k, { curl: 16, headY: 10 }), body(k, { y: -0.006 * s, spine: 0.8 * s }), k.jaw(-4), k.ears(-20), k.tail(-8, 34), k.hackles(-14), eyes('closed')];
  c.key(0, GROUND);
  c.key(0.3, GROUND, body(k, { y: -0.06, spine: 3, neck: 8, head: 8, turn: 6 }), k.ears(-8), k.tail(-6), k.hackles(-10), eyes('half'));
  c.key(0.66, GROUND, ...sleep(0));
  c.on('aura', 0.8);
  c.key(0.96, GROUND, ...sleep(1));
  c.key(1.24, GROUND, ...sleep(-1));
  c.key(1.52, GROUND, ...sleep(1));
  // Up again, refreshed: a stretch of the forelegs, then the stance.
  c.key(1.8, GROUND, body(k, { y: -0.05, z: -0.03, spine: 12, chest: 4, neck: -6, head: -8, rump: 8 }), k.jaw(18), k.ears(-4), k.tail(10), k.hackles(0), eyes('closed'));
  c.key(2.02, GROUND, body(k, { y: -0.01, spine: 1, neck: 1 }), k.tail(8), eyes('open'));
  c.key(2.3, GROUND, eyes('open'));
  return c.clip('rest');
}

/** Sunny Day: it sits back, raises its face to the sky, eyes shut, and gives a bark to call the sun; the tail sweeps. */
export function sunnyDay(k: Kit): Clip {
  const c = new Take(k);
  const up = (y: number) => [k.ears(6), k.tail(14, y, 6), k.hackles(6)];
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.06, z: -0.04, spine: -6, chest: -4, neck: -12, head: -8, rump: -8 }), ...up(18), eyes('closed'));
  c.snap(0.4, GROUND, body(k, { y: -0.055, z: -0.04, spine: -8, chest: -5, neck: -17, head: -12 , rump: -8 }), k.jaw(30), ...up(-18), eyes('closed'));
  c.on('aura', 0.44);
  c.key(0.62, GROUND, body(k, { y: -0.057, z: -0.04, spine: -8, chest: -5, neck: -17, head: -13, rump: -8, headZ: 4 }), k.jaw(4), ...up(18), eyes('happy'));
  c.key(0.84, GROUND, body(k, { y: -0.056, z: -0.04, spine: -8, chest: -5, neck: -16, head: -12, rump: -8, headZ: -3 }), k.jaw(2), ...up(-18), eyes('happy'));
  c.key(1.04, GROUND, body(k, { y: -0.02, spine: 1, neck: -2 }), k.tail(8), eyes('open'));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('sunny_day');
}

/** Rain Dance: it prances on the spot, forepaws high in turn, spins round in a little hop and yips at the sky for the rain. */
export function rainDance(k: Kit): Clip {
  const c = new Take(k);
  const prance = (side: 'L' | 'R'): Pose => ({ plantFront: 0, post: { [`arm${side}`]: { x: -50 }, [`forearm${side}`]: { x: 80 } } });
  const glad = [k.ears(8), k.tail(26, 0, 10), k.hackles(4), eyes('happy')];
  c.key(0, GROUND);
  c.key(0.14, GROUND, prance('R'), body(k, { y: 0.004, spine: -4, neck: -6, head: -4, roll: 3 }), ...glad);
  c.key(0.28, GROUND, prance('L'), body(k, { y: 0.004, spine: -4, neck: -6, head: -4, roll: -3 }), ...glad);
  c.key(0.4, GROUND, body(k, { y: -0.05, spine: 5, neck: 4, head: -4 }), ...glad);
  // A spin in a hop.
  c.key(0.5, AIR, { root: { y: 0.1, yaw: 150 } }, k.legs.tuck, body(k, { spine: -4, neck: -4 }), ...glad);
  c.key(0.6, AIR, { root: { y: 0.08, yaw: 290 } }, k.legs.tuck, body(k, { spine: -4, neck: -4 }), ...glad);
  c.key(0.68, GROUND, { root: { yaw: 360 } }, body(k, { y: -0.05, spine: 5, neck: 4, head: -2 }), ...glad);
  // Yip at the sky.
  c.snap(0.8, GROUND, { root: { yaw: 360 } }, body(k, { y: 0.004, spine: -7, chest: -5, neck: -17, head: -12 }), k.jaw(32), k.ears(10), k.tail(30, 0, 12), k.hackles(10), eyes('closed'));
  c.on('aura', 0.84);
  c.key(0.98, GROUND, { root: { yaw: 360 } }, body(k, { y: 0.004, spine: -7, chest: -5, neck: -16, head: -12, headZ: 4 }), k.jaw(8), ...glad);
  c.key(1.16, GROUND, { root: { yaw: 360 } }, body(k, { spine: 1, neck: 1 }), k.tail(10), eyes('open'));
  c.key(1.4, GROUND, { root: { yaw: 360 } }, eyes('open'));
  return c.clip('rain_dance');
}

export const SELF = {
  protect,
  endure,
  substitute,
  psych_up: psychUp,
  sleep_talk: sleepTalk,
  double_team: doubleTeam,
  rest,
  sunny_day: sunnyDay,
  rain_dance: rainDance,
};
