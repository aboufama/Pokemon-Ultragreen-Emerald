// The paws and the ground: Thief, Covet, Rock Smash, Dig (its two turns),
// Mud-Slap and Sand-Attack. Thief darts in sly and low, swipes with the
// near forepaw and snatches with its jaws, then scampers home with its head
// high; Covet first begs, sitting up on its haunches, all charm, then darts
// in and nabs it; Rock Smash rears and hammers both forepaws down on the
// foe; Dig tears at the ground and dives out of sight, then bursts up under
// the foe; Mud-Slap rakes a clod of mud up at the foe with the near forepaw
// (from home); Sand-Attack turns its back and kicks dirt at the foe's face
// with its hind paws.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { AIR, GROUND, HIND, type Kit, Take, at, body, eyes } from './kit';
import { boundHome, fierce, furious, pounce } from './travel';

/** The near (right) foreleg posed on its own (posts): x swings it forward (-) or back (+), fold bends the elbow back up. */
const rightPaw = (x: number, fold: number, wrist = 0, out = 0): Pose => ({ post: { armR: { x, z: -out }, forearmR: { x: fold }, handR: { x: wrist } } });
const leftPaw = (x: number, fold: number, wrist = 0, out = 0): Pose => ({ post: { armL: { x, z: out }, forearmL: { x: fold }, handL: { x: wrist } } });

/**
 * Thief: sly and low, it darts in, swipes the near forepaw across the foe and
 * snaps something up in its jaws, then scampers home with its head high and
 * its prize clamped tight, tail up.
 */
export function thief(k: Kit): Clip {
  const c = new Take(k);
  const sly = [k.ears(-26), k.tail(4), k.hackles(10), eyes('look')];
  c.key(0, GROUND);
  c.key(0.12, GROUND, body(k, { y: -0.06, spine: 6, neck: 12, head: -4, headY: 6 }), k.jaw(-4), ...sly);
  const L = pounce(c, { from: 0.12, gather: 0.08, flight: 0.22, arc: 0.5, quick: true, act: sly, air: [k.jaw(-4)] });
  // The swipe: the near paw raked across the foe, the body leaning in behind it.
  c.key(L + 0.08, HIND, at(k, 1), body(k, { y: -0.03, z: -0.01, spine: -6, turn: -8, neck: 4, head: -6 }), rightPaw(-70, 40, 20, 20), k.jaw(6), k.ears(-30), k.tail(14), k.hackles(22), eyes('angry'));
  c.snap(L + 0.15, HIND, at(k, 1), body(k, { y: -0.03, z: 0.05, spine: -2, turn: 10, neck: 8, head: -2 }), rightPaw(-60, -10, 10, -25), k.jaw(24), k.ears(-32), k.tail(20), k.hackles(26), eyes('angry'));
  c.on('impact', L + 0.15, 0.04);
  // The snatch: a dip of the head, the jaws clamp, a yank back.
  c.snap(L + 0.24, GROUND, at(k, 1), body(k, { y: -0.04, z: 0.05, spine: 6, neck: 14, head: 2 }), rightPaw(0, 0), k.jaw(-12), k.ears(-26), k.tail(22), k.hackles(22), eyes('angry'));
  c.key(L + 0.34, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.03, spine: 3, neck: -8, head: -10 }), rightPaw(0, 0), k.jaw(-12), k.ears(4), k.tail(28), k.hackles(10), eyes('happy'));
  // Scamper home, head high, prize clamped.
  boundHome(c, { from: L + 0.34, arc: 0.7, act: [k.jaw(-12), body(k, { neck: -8, head: -8 }), k.ears(6), k.tail(30), k.hackles(6), eyes('happy')], end: [k.ears(4), k.tail(18), eyes('happy')] });
  return c.clip('thief');
}

/**
 * Covet: all charm first: it sits up on its haunches begging, forepaws
 * curled, head tilted, tail sweeping; then it darts in, nabs the foe's item
 * with a quick dip of the jaws and bounces home wagging.
 */
export function covet(k: Kit): Clip {
  const c = new Take(k);
  const sweet = (y: number) => [k.ears(10), k.tail(8, y, 6), k.hackles(-6), eyes('happy')];
  const beg: Pose = { post: { armL: { x: -20 }, armR: { x: -20 }, forearmL: { x: 95 }, forearmR: { x: 95 }, handL: { x: 30 }, handR: { x: 30 } } };
  c.key(0, GROUND);
  // Sits up on its haunches, forepaws curled: begging.
  c.key(0.16, HIND, body(k, { y: -0.06, z: -0.05, spine: -26, chest: -6, neck: -4, head: 12, headZ: 10, rump: -10 }), beg, ...sweet(26));
  c.key(0.32, HIND, body(k, { y: -0.055, z: -0.05, spine: -27, chest: -6, neck: -5, head: 12, headZ: -12, rump: -10 }), beg, ...sweet(-26));
  c.key(0.48, HIND, body(k, { y: -0.06, z: -0.05, spine: -26, chest: -6, neck: -4, head: 12, headZ: 10, rump: -10 }), beg, ...sweet(26));
  // Down, and in.
  c.key(0.66, GROUND, body(k, { y: -0.07, z: -0.03, spine: 8, neck: 10, head: -8, rump: 4 }), k.ears(-10), k.tail(12), k.hackles(10), eyes('look'));
  const L = pounce(c, { from: 0.66, gather: 0.04, flight: 0.22, arc: 0.6, quick: true, act: [k.ears(-16), k.tail(14), k.hackles(12), eyes('look')] });
  // The nab: a quick dip and clamp.
  c.snap(L + 0.1, GROUND, at(k, 1), body(k, { y: -0.035, z: 0.06, spine: 8, neck: 16, head: 4 }), k.jaw(-12), k.ears(-20), k.tail(18), k.hackles(14), eyes('angry'));
  c.on('impact', L + 0.1, k.headLag);
  c.key(L + 0.22, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.03, spine: 3, neck: -8, head: -8, headZ: 8 }), k.jaw(-12), ...sweet(24));
  boundHome(c, { from: L + 0.22, arc: 0.8, act: [k.jaw(-12), ...sweet(-24)], end: sweet(14) });
  return c.clip('covet');
}

/**
 * Rock Smash: it closes in, rears up tall on its hind legs with both
 * forepaws raised, and hammers them down onto the foe as onto a boulder,
 * dropping its whole weight behind them; bounds home.
 */
export function rockSmash(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, gather: 0.12, flight: 0.24, arc: 0.8 });
  // Rear up, both forepaws raised high.
  c.key(L + 0.18, HIND, at(k, 1), body(k, { y: 0.02, z: -0.05, spine: -30, chest: -8, neck: -6, head: 8, rump: -6 }), rightPaw(-120, 30, 20, 6), leftPaw(-120, 30, 20, 6), k.jaw(10), ...furious(k));
  c.key(L + 0.28, HIND, at(k, 1), body(k, { y: 0.025, z: -0.055, spine: -32, chest: -8, neck: -7, head: 8, rump: -6, headZ: 2 }), rightPaw(-125, 35, 25, 6), leftPaw(-125, 35, 25, 6), k.jaw(14), ...furious(k));
  // SMASH: both paws driven down onto it, the body following.
  c.snap(L + 0.35, HIND, at(k, 1), body(k, { y: -0.04, z: 0.07, spine: 10, chest: 4, neck: 14, head: 8 }), rightPaw(-40, -10, 10, 4), leftPaw(-40, -10, 10, 4), k.jaw(-6), k.ears(-38), k.tail(34), k.hackles(40), eyes('angry'));
  c.on('impact', L + 0.35, 0.03);
  // The weight comes down after it.
  c.key(L + 0.46, GROUND, at(k, 1), body(k, { y: -0.08, z: 0.03, spine: 10, neck: 12, head: 6 }), rightPaw(0, 0), leftPaw(0, 0), k.jaw(-4), ...furious(k));
  c.key(L + 0.58, GROUND, at(k, 1), body(k, { y: -0.06, z: -0.02, spine: 6, neck: 6, head: -4 }), rightPaw(0, 0), leftPaw(0, 0), ...fierce(k));
  boundHome(c, { from: L + 0.58 });
  return c.clip('rock_smash');
}

/**
 * Dig, the first turn: it tears at the ground with both forepaws in turn,
 * dirt flying, then dives in nose first and sinks out of sight (it stays
 * there until the second turn).
 */
export function digCharge(k: Kit): Clip {
  const c = new Take(k);
  const dig = [k.ears(-26), k.tail(26), k.hackles(20), eyes('angry')];
  c.key(0, GROUND);
  // Nose down at the ground.
  c.key(0.12, GROUND, body(k, { y: -0.05, z: 0.01, spine: 10, neck: 20, head: 14, rump: 8 }), ...dig);
  // Tearing at it: right, left, right.
  c.key(0.2, HIND, body(k, { y: -0.05, spine: 10, neck: 20, head: 16, rump: 9 }), rightPaw(-45, 50, 30), leftPaw(15, 20), ...dig);
  c.on('dig', 0.2);
  c.key(0.28, HIND, body(k, { y: -0.055, spine: 11, neck: 20, head: 16, rump: 9 }), rightPaw(25, 20), leftPaw(-45, 50, 30), ...dig);
  c.key(0.36, HIND, body(k, { y: -0.06, spine: 12, neck: 21, head: 17, rump: 10 }), rightPaw(-45, 50, 30), leftPaw(20, 20), ...dig);
  c.key(0.44, HIND, body(k, { y: -0.07, spine: 13, neck: 22, head: 18, rump: 11 }), rightPaw(20, 20), leftPaw(-45, 50, 30), ...dig);
  // Nose first into the hole: it sinks out of sight, gathering speed.
  c.key(0.52, { plantFeet: 0, plantFront: 0 }, { root: { y: -0.15, pitch: 20 } }, body(k, { y: -0.08, spine: 14, neck: 24, head: 20, rump: 12 }), k.legs.reach, ...dig);
  c.fall(0.8, { plantFeet: 0, plantFront: 0 }, { root: { y: -1.3, pitch: 30 } }, body(k, { y: -0.08, spine: 14, neck: 24, head: 20, rump: 12 }), k.legs.reach, ...dig);
  c.key(1.0, { plantFeet: 0, plantFront: 0 }, { root: { y: -1.3, pitch: 28 } }, body(k, { y: -0.08, spine: 13, neck: 22, head: 18, rump: 11 }), k.legs.reach, ...dig);
  return c.clip('dig_charge');
}

/**
 * Dig, the strike: from under its own spot it tunnels to the foe (the
 * ground heaves along the way) and bursts up out of the ground under the
 * foe's chin, jaws first, rising into it; it comes down in front of it,
 * holds its crouch a beat and bounds home.
 */
export function dig(k: Kit): Clip {
  const c = new Take(k);
  const under = { plantFeet: 0, plantFront: 0 };
  c.key(0, under, { root: { y: -1.3, pitch: 28 } }, body(k, { y: -0.08, spine: 13, neck: 22, head: 18, rump: 11 }), k.legs.reach, ...fierce(k));
  c.key(0.2, under, at(k, 0.3), { root: { y: -1.3, pitch: 10 } }, body(k, { y: -0.08, spine: 8, neck: 14, head: 6 }), k.legs.fly, ...fierce(k));
  c.key(0.46, under, at(k, 1, 0.22), { root: { y: -1.25, pitch: -10 } }, body(k, { y: -0.06, spine: -4, neck: -6, head: -10 }), k.legs.push, k.jaw(20), ...furious(k));
  // Bursts up right under its chin, jaws first, and drives up into it.
  c.snap(0.6, AIR, at(k, 1, 0.3), { root: { y: 0.1, pitch: -22 } }, body(k, { spine: -16, chest: -6, neck: -10, head: -12 }), k.legs.fly, k.jaw(40), ...furious(k));
  c.on('impact', 0.66);
  c.key(0.7, AIR, at(k, 1, 0.28), { root: { y: 0.18, pitch: -20 } }, body(k, { spine: -15, chest: -5, neck: -10, head: -12 }), k.legs.fly, k.jaw(30), ...furious(k));
  // Knocked back off it, tucked.
  c.key(0.8, AIR, at(k, 1, 0.12), { root: { y: 0.26, pitch: -12 } }, body(k, { spine: -10, neck: -6, head: -8 }), k.legs.tuck, k.jaw(16), ...furious(k));
  // Down in front of it, crouched.
  c.fall(0.92, GROUND, at(k, 1), { root: { pitch: 0 } }, body(k, { y: -0.08, spine: 10, neck: 10, head: -6 }), k.jaw(4), ...fierce(k));
  c.key(1.2, GROUND, at(k, 1), body(k, { y: -0.065, z: -0.02, spine: 7, neck: 8, head: -4, headZ: 2 }), ...fierce(k));
  boundHome(c, { from: 1.2 });
  return c.clip('dig');
}

/**
 * Mud-Slap: from home, weight back, the near forepaw rakes back under the
 * chest scooping a clod of mud, then flings it forward and up into the foe's
 * face; the head ducks after it and it snorts at the mess.
 */
export function mudSlap(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.12, HIND, body(k, { y: -0.03, z: -0.02, spine: 4, neck: 12, head: 10 }), rightPaw(0, 0), leftPaw(0, 0), k.ears(-14), k.tail(10), k.hackles(12), eyes('angry'));
  // Scoop: the paw rakes back under the chest, the head ducking to the mud.
  c.key(0.26, HIND, body(k, { y: -0.045, z: -0.03, spine: 6, neck: 16, head: 14, turn: -4 }), rightPaw(35, 70, 40), leftPaw(0, 0), k.jaw(4), k.ears(-18), k.tail(12), k.hackles(16), eyes('angry'));
  // Fling: the paw sweeps forward and up, the mud flying at the foe.
  c.snap(0.34, HIND, body(k, { y: -0.02, z: 0.02, spine: -2, neck: 2, head: -4, turn: 6 }), rightPaw(-95, -10, -20), leftPaw(0, 0), k.jaw(12), k.ears(-26), k.tail(26), k.hackles(22), eyes('angry'));
  c.on('release', 0.34, 0.035);
  c.key(0.46, HIND, body(k, { y: -0.02, z: 0.018, spine: -1, neck: 3, head: -3, turn: 5 }), rightPaw(-85, -5, -10), leftPaw(0, 0), k.jaw(10), k.ears(-24), k.tail(22), k.hackles(20), eyes('angry'));
  // Paw down; a snort.
  c.key(0.6, GROUND, body(k, { y: -0.025, spine: 2, neck: 4, head: 2, headY: 8 }), rightPaw(0, 0), leftPaw(0, 0), k.jaw(14), k.ears(-10), k.tail(14), k.hackles(12), eyes('closed'));
  c.key(0.74, GROUND, body(k, { y: -0.012, spine: 1, neck: 1, headY: -4 }), rightPaw(0, 0), leftPaw(0, 0), k.jaw(2), k.tail(8), k.hackles(6), eyes('angry'));
  c.key(1.0, GROUND, rightPaw(0, 0), leftPaw(0, 0), eyes('open'));
  return c.clip('mud_slap');
}

/**
 * Sand-Attack: it hops round to turn its back on the foe, then kicks the dirt
 * back at it with its hind paws, one and the other (the sand flies from the
 * paws), and hops round to face it again with a smug look back.
 */
export function sandAttack(k: Kit): Clip {
  const c = new Take(k);
  const kick = (l: number, r: number): Pose => ({ plantLeft: l > 0 ? 0 : 1, plantRight: r > 0 ? 0 : 1, post: { thighL: { x: 40 * l }, shinL: { x: 20 * l }, footL: { x: 45 * l }, thighR: { x: 40 * r }, shinR: { x: 20 * r }, footR: { x: 45 * r } } });
  const turned = (yaw: number): Pose => ({ root: { yaw } });
  c.key(0, GROUND);
  c.key(0.1, GROUND, body(k, { y: -0.05, spine: 4, neck: 6, head: -4 }), k.ears(-10), k.tail(10), eyes('look'));
  // Hop round, turning its back.
  c.key(0.2, AIR, turned(80), { root: { y: 0.08 } }, k.legs.tuck, body(k, { spine: -2, neck: 2, head: -2, headY: -30 }), k.ears(-10), k.tail(20), eyes('look'));
  c.key(0.3, GROUND, turned(165), body(k, { y: -0.04, spine: 6, neck: 6, head: 0, headY: -50, neckY: -20 }), k.ears(-6), k.tail(26), k.hackles(10), eyes('look'));
  // Kick, kick, kick: the hind paws fling the dirt back at the foe.
  c.snap(0.38, GROUND, turned(165), kick(1, 0), body(k, { y: -0.05, spine: 12, neck: 10, head: 2, headY: -52, neckY: -22, rump: 8 }), k.tail(34), k.ears(-6), k.hackles(14), eyes('angry'));
  c.on('emit', 0.38);
  c.snap(0.48, GROUND, turned(165), kick(0, 1), body(k, { y: -0.05, spine: 12, neck: 10, head: 2, headY: -54, neckY: -22, rump: 8 }), k.tail(34), k.ears(-6), k.hackles(14), eyes('angry'));
  c.snap(0.58, GROUND, turned(165), kick(1, 0), body(k, { y: -0.05, spine: 12, neck: 10, head: 2, headY: -52, neckY: -22, rump: 8 }), k.tail(34), k.ears(-6), k.hackles(14), eyes('angry'));
  c.key(0.68, GROUND, turned(165), kick(0, 0), body(k, { y: -0.045, spine: 8, neck: 8, head: 0, headY: -50, neckY: -20, rump: 4 }), k.tail(28), k.ears(0), k.hackles(10), eyes('happy'));
  // Hop round to face the foe again.
  c.snap(0.8, AIR, turned(260), { root: { y: 0.08 } }, k.legs.tuck, body(k, { spine: -2, neck: 2, head: -2, headY: -10 }), k.tail(20), eyes('happy'));
  c.key(0.9, GROUND, turned(360), body(k, { y: -0.045, spine: 4, neck: 4, head: -2 }), k.tail(14), k.ears(4), eyes('happy'));
  c.key(1.04, GROUND, turned(360), body(k, { y: -0.012, spine: 1, neck: 1 }), k.tail(6), eyes('open'));
  c.key(1.2, GROUND, turned(360), eyes('open'));
  return c.clip('sand_attack');
}

export const PAWS = {
  thief,
  covet,
  rock_smash: rockSmash,
  dig_charge: digCharge,
  dig,
  mud_slap: mudSlap,
  sand_attack: sandAttack,
};
