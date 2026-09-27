// Ranged moves, fired from home: Shadow Ball, Hidden Power, Snore, Hyper
// Beam (Mightyena). Shadow Ball is gathered in the open jaws and hurled with
// a thrust of the whole front half; Hidden Power is summoned standing tall
// with the eyes shut and sent with a toss of the head; Snore slumps asleep
// and blasts out one huge snore; Hyper Beam gathers for a long time, braces
// wide and low and holds a massive beam from the jaws, then sags, spent.

import type { Clip } from '../../../anim/clip';
import { GROUND, type Kit, Take, body, eyes } from './kit';
import { fierce, furious } from './travel';
import { lying } from './self';

/** Shadow Ball: sunk low with the weight back, it gathers the dark orb in its open jaws, trembling; then hurls it with a thrust of its whole front half. */
export function shadowBall(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.on('charge', 0.12);
  c.key(0.16, GROUND, body(k, { y: -0.018, neck: 3, head: 4 }), k.ears(-4), k.tail(8), k.hackles(10), eyes('angry'));
  c.key(0.5, GROUND, body(k, { y: -0.055, z: -0.035, spine: 5, neck: 10, head: -14 }), k.jaw(28), k.ears(-22), k.tail(14), k.hackles(32), eyes('angry'));
  c.key(0.62, GROUND, body(k, { y: -0.058, z: -0.038, spine: 5, neck: 10, head: -15, headZ: 2 }), k.jaw(30), k.ears(-24), k.tail(14), k.hackles(34), eyes('angry'));
  c.key(0.74, GROUND, body(k, { y: -0.056, z: -0.038, spine: 5, neck: 9, head: -15, headZ: -2 }), k.jaw(29), k.ears(-24), k.tail(14), k.hackles(36), eyes('angry'));
  // Hurl.
  c.snap(0.84, GROUND, body(k, { y: -0.028, z: 0.055, spine: 10, chest: 5, neck: 26, head: 2 }), k.jaw(40), ...furious(k));
  c.on('release', 0.84, k.headLag);
  c.key(0.98, GROUND, body(k, { y: -0.024, z: 0.048, spine: 9, chest: 4, neck: 21, head: -3 }), k.jaw(28), ...furious(k));
  c.key(1.16, GROUND, body(k, { y: -0.012, z: 0.008, spine: 2, neck: 3, head: -7 }), k.jaw(8), ...fierce(k, 0.5));
  c.key(1.4, GROUND, body(k, { y: -0.004, neck: 1, head: -1 }), k.jaw(2), k.tail(6), eyes('angry'));
  c.key(1.8, GROUND, eyes('open'));
  return c.clip('shadow_ball');
}

/** Hidden Power: it draws itself up, eyes shut, still, while the orbs gather round it; then flings them at the foe with a sharp toss of its head. */
export function hiddenPower(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.on('charge', 0.1);
  c.key(0.26, GROUND, body(k, { y: 0.008, z: -0.01, spine: -4, chest: -4, neck: -8, head: 4 }), k.jaw(-4), k.ears(12), k.tail(12), k.hackles(18), eyes('closed'));
  c.key(0.46, GROUND, body(k, { y: 0.01, z: -0.012, spine: -5, chest: -4, neck: -9, head: 5, headZ: 1.5 }), k.jaw(-4), k.ears(14), k.tail(14), k.hackles(22), eyes('closed'));
  c.key(0.62, GROUND, body(k, { y: 0.008, z: -0.02, spine: -6, chest: -4, neck: -12, head: -6, headY: 12 }), k.jaw(4), k.ears(10), k.tail(14), k.hackles(26), eyes('angry'));
  // The toss.
  c.snap(0.72, GROUND, body(k, { y: -0.02, z: 0.03, spine: 6, chest: 2, neck: 12, head: 8, headY: -14, headZ: 8 }), k.jaw(18), k.ears(-14), k.tail(24), k.hackles(30), eyes('angry'));
  c.on('release', 0.72, k.headLag);
  c.key(0.88, GROUND, body(k, { y: -0.018, z: 0.025, spine: 5, chest: 2, neck: 10, head: 6, headY: -10, headZ: 6 }), k.jaw(8), ...fierce(k, 0.8));
  c.key(1.08, GROUND, body(k, { y: -0.006, spine: 1, neck: 2, head: 1 }), k.tail(8), k.hackles(10), eyes('angry'));
  c.key(1.36, GROUND, eyes('open'));
  return c.clip('hidden_power');
}

/** Snore: it slumps down asleep, then its chest heaves and one huge snore blasts out, jaws wide; it stirs back up, groggy. */
export function snore(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.07, spine: 3, neck: 10, head: 10 }), k.ears(-14), k.tail(-8), k.hackles(-8), eyes('half'));
  c.key(0.46, GROUND, ...lying(k, {}), k.jaw(-2), k.ears(-18), k.tail(-8, 16), k.hackles(-12), eyes('closed'));
  // Drawing in the breath: the chest swells, the head lifts.
  c.key(0.66, GROUND, ...lying(k, { lift: 14, head: -8 }), body(k, { y: 0.012, spine: -3, chest: -3 }), k.jaw(6), k.ears(-14), k.tail(-8, 16), k.hackles(-6), eyes('closed'));
  // The snore.
  c.snap(0.76, GROUND, ...lying(k, { lift: 10, head: -18 }), body(k, { y: 0.004, spine: 2 }), k.jaw(40), k.ears(-10), k.tail(-4, 18), k.hackles(4), eyes('closed'));
  c.on('release', 0.76, k.headLag);
  c.key(0.96, GROUND, ...lying(k, { lift: 9, head: -16, headZ: 3 }), k.jaw(34), k.ears(-12), k.tail(-4, 18), k.hackles(2), eyes('closed'));
  c.key(1.14, GROUND, ...lying(k, {}), k.jaw(0), k.ears(-18), k.tail(-8, 16), k.hackles(-12), eyes('closed'));
  // Stirs back up, groggy.
  c.key(1.44, GROUND, body(k, { y: -0.05, spine: 3, neck: 8, head: 6, headZ: 4 }), k.ears(-8), k.tail(0), k.hackles(-4), eyes('half'));
  c.key(1.74, GROUND, eyes('open'));
  return c.clip('snore');
}

/**
 * Hyper Beam: a long gather, sinking and bracing wide and low with the
 * power building in its jaws; then it fires, the head driven forward and the
 * body rigid and trembling against the recoil; the beam stops and it sags,
 * spent, head hanging.
 */
export function hyperBeam(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.on('charge', 0.1);
  c.key(0.3, GROUND, body(k, { y: -0.04, z: -0.02, spine: 4, neck: 4, head: -6 }), k.jaw(12), k.ears(-16), k.tail(10), k.hackles(24), eyes('angry'));
  c.key(0.62, GROUND, body(k, { y: -0.08, z: -0.04, spine: 8, chest: 3, neck: 8, head: -12, rump: 4 }), k.jaw(26), k.ears(-24), k.tail(14), k.hackles(38), eyes('closed'));
  c.key(0.8, GROUND, body(k, { y: -0.085, z: -0.045, spine: 8, chest: 3, neck: 8, head: -13, rump: 4, headZ: 2 }), k.jaw(28), k.ears(-26), k.tail(14), k.hackles(42), eyes('closed'));
  // Fire: head driven forward, jaws wide, the body braced rigid.
  c.snap(0.9, GROUND, body(k, { y: -0.075, z: 0.02, spine: 10, chest: 4, neck: 18, head: -10 }), k.jaw(50), ...furious(k));
  c.on('release', 0.9, k.headLag);
  const hold = (t: number, s: number) => c.key(t, GROUND, body(k, { y: -0.076, z: 0.012 + 0.003 * s, spine: 10, chest: 4, neck: 17, head: -10, headZ: 1.5 * s, roll: s }), k.jaw(48), ...furious(k));
  hold(1.06, 1);
  hold(1.2, -1);
  hold(1.34, 1);
  hold(1.48, -1);
  c.on('releaseEnd', 1.52);
  // Spent: it sags, head hanging, panting.
  c.key(1.66, GROUND, body(k, { y: -0.06, z: -0.01, spine: 8, neck: 16, head: 14 }), k.jaw(22), k.ears(-20), k.tail(-6), k.hackles(4), eyes('half'));
  c.key(1.84, GROUND, body(k, { y: -0.055, spine: 7, neck: 14, head: 12 }), k.jaw(12), k.ears(-18), k.tail(-6), k.hackles(2), eyes('half'));
  c.key(2.04, GROUND, body(k, { y: -0.02, spine: 2, neck: 4, head: 2 }), k.jaw(4), k.ears(-6), k.tail(2), eyes('half'));
  c.key(2.3, GROUND, eyes('open'));
  return c.clip('hyper_beam');
}

/**
 * A bark (the sound motif: Hyper Voice, Uproar and the like when Mimic or
 * Mirror Move call them): the head draws up and back, then snaps forward and
 * down with the jaws wide, the bark blasting out, and bobs back up.
 */
export function sound(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.14, GROUND, body(k, { y: 0.002, z: -0.02, spine: -4, neck: -14, head: -8 }), k.jaw(2), k.ears(-6), k.tail(12), k.hackles(12), eyes('angry'));
  c.snap(0.22, GROUND, body(k, { y: -0.018, z: 0.035, spine: 6, chest: 3, neck: 18, head: 4 }), k.jaw(38), k.ears(-20), k.tail(28), k.hackles(24), eyes('angry'));
  c.on('release', 0.22, k.headLag);
  c.key(0.32, GROUND, body(k, { y: -0.015, z: 0.028, spine: 5, chest: 2, neck: 13, head: -2 }), k.jaw(22), k.ears(-16), k.tail(24), k.hackles(20), eyes('angry'));
  c.snap(0.42, GROUND, body(k, { y: -0.02, z: 0.036, spine: 6, chest: 3, neck: 17, head: 3 }), k.jaw(36), k.ears(-20), k.tail(28), k.hackles(24), eyes('angry'));
  c.key(0.56, GROUND, body(k, { y: -0.006, z: 0.004, spine: 1, neck: 1, head: -5 }), k.jaw(4), k.ears(-4), k.tail(14), k.hackles(12), eyes('angry'));
  c.key(0.76, GROUND, body(k, { neck: 1 }), k.tail(8), k.hackles(6), eyes('angry'));
  c.key(1.04, GROUND, eyes('open'));
  return c.clip('sound');
}

export const RANGED = {
  sound,
  shadow_ball: shadowBall,
  hidden_power: hiddenPower,
  snore,
  hyper_beam: hyperBeam,
};
