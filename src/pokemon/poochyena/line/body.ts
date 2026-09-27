// The whole body: Tackle, Take Down, Double-Edge, Return, Frustration,
// Facade, Secret Power, Struggle, Strength, Body Slam, Counter, Iron Tail.
// Most are rams: the body flies into the foe head down (impact on arrival,
// still in the air), bounces off and lands short of it, then bounds home.
// What differs is the move: Tackle a quick dart; Take Down a gallop and a
// reckless crash that hurts it too; Double-Edge a longer, wilder gallop and
// a worse recoil; Return a joyful bounding charge; Frustration a sulky stamp
// and a spiteful butt; Facade a wince, then a gritty charge; Secret Power a
// scrappy shoulder check; Struggle an exhausted, clumsy lunge; Strength a
// planted, heaving shove; Body Slam a high leap and a belly-flop on top of
// the foe; Counter an explosive retaliation from a braced crouch; Iron
// Tail a leap that spins the steel-hard tail down across the foe.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { AIR, GROUND, type Kit, Take, at, body, eyes } from './kit';
import { bound, boundHome, fierce, furious, pounce } from './travel';

/** Head down, skull (or shoulder) first: the ram's lead. */
const headDown = (k: Kit, f = 1): Pose => body(k, { spine: 2 * f, neck: 16 * f, head: 22 * f });

/**
 * Arrive flying into the foe (a snap), crash into it and stay pressed
 * against it for a few frames (the impact: the foe flinches as the bodies
 * meet), then bounce off: thrown back up and short of the foe, landing and
 * gathering there. Returns the time it has gathered (planted at `back`).
 */
function ram(c: Take, t: number, o: { lunge?: number; lead?: Pose; act?: Pose[]; back?: number; hurt?: boolean; recoil?: number } = {}): number {
  const k = c.k;
  const act = o.act ?? furious(k);
  const lead = o.lead ?? headDown(k);
  const lunge = o.lunge ?? 0.05;
  c.snap(t, AIR, at(k, 1, lunge), { root: { y: 0.03 } }, k.legs.reach, lead, ...act);
  // Crushed against it: the body gives a little more, the legs start to fold.
  c.key(t + 0.07, AIR, at(k, 1, lunge + 0.01), { root: { y: 0.02 } }, k.legs.reach, lead, body(k, { spine: 2, neck: 2 }), ...act);
  c.on('impact', t + 0.05);
  const back = o.back ?? 0.84;
  const r = o.recoil ?? 1;
  const hurt = [k.ears(-30), k.tail(-10), k.hackles(10), eyes('hurt')];
  // Bounced back off it, the head flung up.
  c.key(t + 0.07 + 0.13 * r, AIR, at(k, 0.93 - (0.93 - back) * 0.4), { root: { y: k.arc * 0.55 * r } }, k.legs.tuck, body(k, { spine: -2, neck: 2, head: -2 }), ...(o.hurt ? hurt : act));
  c.key(t + 0.07 + 0.25 * r, GROUND, at(k, back), body(k, { y: -0.06 * k.A, z: -0.02, spine: 6, neck: 6, head: -4 }), ...(o.hurt ? hurt : act));
  return t + 0.07 + 0.25 * r;
}

/** Tackle: a quick low dart, head down, a butt into the foe on arrival, a bounce back; shakes its head and bounds home. */
export function tackle(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, gather: 0.1, flight: 0.22, arc: 0.6, quick: true, flying: true, air: [headDown(k, 0.6)] });
  const B = ram(c, L, { lunge: 0.05 });
  // Shake it off.
  c.key(B + 0.1, GROUND, at(k, 0.84), body(k, { y: -0.045, spine: 4, neck: 4, head: -2, headY: 12, headZ: -8 }), k.ears(-10), k.tail(12), k.hackles(12), eyes('closed'));
  c.key(B + 0.18, GROUND, at(k, 0.84), body(k, { y: -0.05, z: -0.02, spine: 5, neck: 5, head: -2, headY: -9, headZ: 6 }), ...fierce(k, 0.6));
  boundHome(c, { from: B + 0.18, start: 0.84 });
  return c.clip('tackle');
}

/**
 * Take Down: a reckless charge: a gallop (a first bound touches down on the
 * way), then it throws itself into the foe head down; the recoil hurts it
 * too: thrown back, it lands wincing, staggers and shakes its head, then
 * bounds home.
 */
export function takeDown(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Head down, pawing to go.
  c.key(0.14, GROUND, body(k, { y: -0.06, z: -0.03, spine: 8, neck: 16, head: 14, rump: 6 }), ...furious(k));
  const g = bound(c, 0.2, 0, 0.42, { flight: 0.2, arc: 0.6, air: [headDown(k, 0.5)] });
  const L = pounce(c, { from: g, gather: 0.05, start: 0.42, flight: 0.2, arc: 0.55, flying: true, air: [headDown(k)] });
  const B = ram(c, L, { lunge: 0.07, lead: headDown(k, 1.2), back: 0.78, hurt: true, recoil: 1.25 });
  // Staggers, wincing, and shakes the pain out of its head.
  c.key(B + 0.12, GROUND, at(k, 0.78), body(k, { y: -0.07, x: 0.01, spine: 6, neck: 10, head: 6, roll: 6, headZ: 8 }), k.ears(-30), k.tail(-8), k.hackles(4), eyes('hurt'));
  c.key(B + 0.24, GROUND, at(k, 0.78), body(k, { y: -0.055, spine: 4, neck: 6, head: 0, headY: 14, headZ: -10, roll: -3 }), k.ears(-20), k.tail(6), k.hackles(8), eyes('closed'));
  c.key(B + 0.34, GROUND, at(k, 0.78), body(k, { y: -0.055, z: -0.02, spine: 5, neck: 6, head: -2, headY: -10, headZ: 7 }), ...fierce(k, 0.7));
  boundHome(c, { from: B + 0.34, start: 0.78 });
  return c.clip('take_down');
}

/**
 * Double-Edge: a longer, wilder run-up (two bounds before the leap, higher
 * and faster, ears flat, everything bristling), a crash with all its weight;
 * the recoil throws it well back: it lands sprawling, legs splayed, hurt,
 * shakes its whole head and neck, gathers itself and bounds home.
 */
export function doubleEdge(k: Kit): Clip {
  const c = new Take(k);
  const wild = [k.ears(-40), k.tail(34, 0, 12), k.hackles(44), eyes('angry')];
  c.key(0, GROUND);
  c.key(0.16, GROUND, body(k, { y: -0.075, z: -0.04, spine: 10, neck: 18, head: 16, rump: 8 }), k.jaw(12), ...wild);
  let g = bound(c, 0.22, 0, 0.3, { flight: 0.18, arc: 0.75, act: wild, air: [headDown(k, 0.4), k.jaw(16)] });
  g = bound(c, g, 0.3, 0.6, { flight: 0.18, arc: 0.85, act: wild, air: [headDown(k, 0.6), k.jaw(16)] });
  const L = pounce(c, { from: g, gather: 0.05, start: 0.6, flight: 0.18, arc: 0.7, flying: true, act: wild, air: [headDown(k, 1.1)] });
  const B = ram(c, L, { lunge: 0.08, lead: headDown(k, 1.3), back: 0.68, hurt: true, recoil: 1.45, act: wild });
  // Sprawled, legs splayed, dazed.
  c.key(B + 0.1, GROUND, at(k, 0.68), body(k, { y: -0.1, x: -0.015, spine: 8, neck: 14, head: 10, roll: -8, headZ: -10 }), { post: { armL: { z: 12 }, armR: { z: -12 } } }, k.ears(-34), k.tail(-14), k.hackles(0), eyes('hurt'));
  // A violent shake of the head and neck.
  c.key(B + 0.22, GROUND, at(k, 0.68), body(k, { y: -0.08, spine: 6, neck: 8, head: 2, neckY: 7, headY: 12, headZ: -9 }), k.ears(-24), k.tail(-4), k.hackles(10), eyes('closed'));
  c.key(B + 0.34, GROUND, at(k, 0.68), body(k, { y: -0.08, spine: 6, neck: 8, head: 2, neckY: -7, headY: -12, headZ: 9 }), k.ears(-24), k.tail(4), k.hackles(14), eyes('closed'));
  c.key(B + 0.46, GROUND, at(k, 0.68), body(k, { y: -0.065, z: -0.02, spine: 6, neck: 6, head: -2, headY: 4 }), ...fierce(k, 0.8));
  boundHome(c, { from: B + 0.46, start: 0.68, arc: 1 });
  return c.clip('double_edge');
}

/**
 * Return: a joyful, loyal charge: tail wagging, ears up, it bounds in high
 * and throws its whole flank into the foe; landing, it wags and looks back
 * home, pleased, and bounces back.
 */
export function returnMove(k: Kit): Clip {
  const c = new Take(k);
  const glad = (y: number) => [k.ears(10), k.tail(30, y, 12), k.hackles(4), eyes('happy')];
  c.key(0, GROUND);
  c.key(0.12, GROUND, body(k, { y: -0.03, spine: -3, neck: -6, head: -6 }), ...glad(28));
  c.key(0.24, GROUND, body(k, { y: -0.06, z: -0.02, spine: 6, neck: 8, head: -8, rump: 4 }), ...glad(-28));
  const L = pounce(c, { from: 0.24, gather: 0.08, flight: 0.28, arc: 1.3, quick: true, flying: true, act: glad(22), air: [k.jaw(10)] });
  // The flank thrown into it: turned side-on, shoulder and hip first.
  const flank = body(k, { spine: 2, turn: -22, roll: 10, neck: 6, head: 4, headY: 14 });
  const B = ram(c, L, { lunge: 0.06, lead: flank, act: [k.ears(4), k.tail(30, 26, 12), k.hackles(10), eyes('angry')], back: 0.85 });
  // Wagging, a glance back home, pleased.
  c.key(B + 0.12, GROUND, at(k, 0.85), body(k, { y: -0.04, spine: 2, neck: -4, head: -6, headY: -22, neckY: -10 }), ...glad(-30));
  c.key(B + 0.24, GROUND, at(k, 0.85), body(k, { y: -0.05, z: -0.02, spine: 4, neck: 0, head: -4, headY: -12, neckY: -6 }), ...glad(30));
  boundHome(c, { from: B + 0.24, start: 0.85, arc: 1.1, act: glad(-20), end: glad(10) });
  return c.clip('return');
}

/**
 * Frustration: sulky and spiteful: it stamps a forepaw twice with a snarl,
 * charges low and butts the foe with a vicious twist of the head, then
 * turns its nose up with a huff and stalks home.
 */
export function frustration(k: Kit): Clip {
  const c = new Take(k);
  const sulk = [k.ears(-24), k.tail(-4), k.hackles(30), eyes('angry')];
  const paw = (x: number, y: number): Pose => ({ post: { armR: { x }, forearmR: { x: y } } });
  c.key(0, GROUND);
  // Stamp, stamp: the right forepaw up and slammed down, head low, snarling.
  c.key(0.1, { plantFeet: 1, plantFront: 0 }, body(k, { y: -0.02, z: -0.01, spine: 2, neck: 10, head: 8, roll: -3 }), paw(-35, 60), k.jaw(8), ...sulk);
  c.snap(0.17, GROUND, body(k, { y: -0.035, spine: 4, neck: 12, head: 10 }), paw(0, 0), k.jaw(4), ...sulk);
  c.key(0.25, { plantFeet: 1, plantFront: 0 }, body(k, { y: -0.02, z: -0.01, spine: 2, neck: 10, head: 8, roll: -3 }), paw(-35, 60), k.jaw(12), ...sulk);
  c.snap(0.32, GROUND, body(k, { y: -0.04, spine: 5, neck: 12, head: 10 }), paw(0, 0), k.jaw(6), ...sulk);
  const L = pounce(c, { from: 0.32, gather: 0.08, flight: 0.22, arc: 0.5, quick: true, flying: true, act: sulk, air: [headDown(k, 0.8)] });
  // A spiteful butt with a twist of the head.
  const twist = body(k, { spine: 2, neck: 16, head: 22, headY: -18, headZ: 16 });
  const B = ram(c, L, { lunge: 0.06, lead: twist, act: sulk, back: 0.86 });
  // Nose in the air, a huff.
  c.key(B + 0.12, GROUND, at(k, 0.86), body(k, { y: -0.03, spine: -2, neck: -12, head: -10, headY: -14, headZ: -8 }), k.jaw(14), k.ears(-10), k.tail(8, -20), k.hackles(18), eyes('closed'));
  c.key(B + 0.24, GROUND, at(k, 0.86), body(k, { y: -0.04, z: -0.02, spine: 1, neck: -8, head: -8, headY: -8, headZ: -4 }), k.jaw(2), k.ears(-12), k.tail(6, -12), k.hackles(14), eyes('closed'));
  boundHome(c, { from: B + 0.24, start: 0.86, arc: 0.7, act: [k.ears(-16), k.tail(4), k.hackles(16), eyes('angry')] });
  return c.clip('frustration');
}

/**
 * Facade: it hurts, but it fights on: a shudder and a wince, then it sets its
 * jaw, lowers its head and charges hard and straight, a heavy butt into
 * the foe; a grimace, and home.
 */
export function facade(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // A shudder of pain.
  c.key(0.1, GROUND, body(k, { y: -0.04, spine: 3, neck: 8, head: 8, roll: 4, headZ: 6 }), k.jaw(10), k.ears(-30), k.tail(-10), k.hackles(-4), eyes('hurt'));
  c.key(0.2, GROUND, body(k, { y: -0.045, spine: 4, neck: 9, head: 9, roll: -4, headZ: -5 }), k.jaw(8), k.ears(-30), k.tail(-10), k.hackles(-2), eyes('hurt'));
  // It sets its jaw: head down, glaring up, bristling.
  c.key(0.34, GROUND, body(k, { y: -0.07, z: -0.03, spine: 9, neck: 18, head: 6, rump: 6 }), k.jaw(-8), ...furious(k));
  const L = pounce(c, { from: 0.34, gather: 0.06, flight: 0.24, arc: 0.55, quick: true, flying: true, act: furious(k), air: [headDown(k, 1)] });
  const B = ram(c, L, { lunge: 0.06, lead: headDown(k, 1.15), back: 0.84 });
  // A grimace: it felt that too.
  c.key(B + 0.14, GROUND, at(k, 0.84), body(k, { y: -0.055, spine: 5, neck: 8, head: 4, headZ: 6 }), k.jaw(12), k.ears(-26), k.tail(10), k.hackles(20), eyes('hurt'));
  c.key(B + 0.26, GROUND, at(k, 0.84), body(k, { y: -0.055, z: -0.02, spine: 5, neck: 6, head: -2 }), k.jaw(-4), ...fierce(k, 0.8));
  boundHome(c, { from: B + 0.26, start: 0.84 });
  return c.clip('facade');
}

/**
 * Secret Power: scrappy: it ducks low in the grass, springs aside and in on a
 * slant and checks the foe with its shoulder, turned side-on; skips back and
 * bounds home.
 */
export function secretPower(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Ducked low in the grass, head down, ears flat.
  c.key(0.12, GROUND, body(k, { y: -0.09, z: -0.02, spine: 8, neck: 20, head: 8 }), k.ears(-32), k.tail(-6), k.hackles(18), eyes('angry'));
  const L = pounce(c, { from: 0.12, gather: 0.08, flight: 0.24, arc: 0.7, quick: true, flying: true, air: [{ root: { x: 0.06, roll: -6 } }, body(k, { turn: 8 })] });
  // The shoulder check: side-on, the near shoulder driving in.
  const shoulder = body(k, { spine: 4, turn: 16, roll: -8, neck: 10, head: 6, headY: -8 });
  const B = ram(c, L, { lunge: 0.1, lead: shoulder, back: 0.86 });
  c.key(B + 0.1, GROUND, at(k, 0.86), body(k, { y: -0.05, spine: 4, turn: 8, neck: 4, head: -2, headY: -6 }), ...fierce(k, 0.8));
  c.key(B + 0.18, GROUND, at(k, 0.86), body(k, { y: -0.055, z: -0.02, spine: 5, neck: 5, head: -3 }), ...fierce(k, 0.7));
  boundHome(c, { from: B + 0.18, start: 0.86, arc: 0.75 });
  return c.clip('secret_power');
}

/**
 * Struggle: nothing left: a tired, sagging crouch, a clumsy low lunge with
 * its legs sprawling, a flailing butt with the head swinging, then it winces
 * from the recoil and stumbles home in a weak hop.
 */
export function struggle(k: Kit): Clip {
  const c = new Take(k);
  const spent = [k.ears(-20), k.tail(-14), k.hackles(-8), eyes('half')];
  c.key(0, GROUND);
  c.key(0.16, GROUND, body(k, { y: -0.07, z: -0.02, spine: 8, neck: 16, head: 12, roll: 3 }), k.jaw(14), ...spent);
  c.key(0.3, GROUND, body(k, { y: -0.08, z: -0.03, spine: 9, neck: 18, head: 12, roll: -3 }), k.jaw(18), ...spent);
  const L = pounce(c, { from: 0.3, gather: 0.08, flight: 0.3, arc: 0.4, quick: true, flying: true, act: spent, air: [{ post: { armL: { z: 18 }, armR: { z: -22 } } }, k.jaw(20)] });
  // Flailing: the head swings wildly as it hits.
  const flail = body(k, { spine: 4, neck: 12, head: 14, headY: 20, headZ: -16, roll: 8 });
  const B = ram(c, L, { lunge: 0.05, lead: flail, act: [k.ears(-26), k.tail(-6), k.hackles(4), eyes('angry')], back: 0.88, hurt: true, recoil: 1.2 });
  // Winces, sagging.
  c.key(B + 0.14, GROUND, at(k, 0.88), body(k, { y: -0.09, spine: 7, neck: 14, head: 10, roll: -5 }), k.jaw(16), k.ears(-30), k.tail(-16), k.hackles(-8), eyes('hurt'));
  c.key(B + 0.3, GROUND, at(k, 0.88), body(k, { y: -0.085, z: -0.02, spine: 7, neck: 12, head: 8, roll: 3 }), k.jaw(12), ...spent);
  boundHome(c, { from: B + 0.3, start: 0.88, arc: 0.5, act: spent, settle: 0.34 });
  return c.clip('struggle');
}

/**
 * Strength: it closes in, plants all four feet and lowers its shoulder
 * against the foe, then heaves: the hind legs drive, the rump rises, and it
 * shoves with enormous power in two surges; it lets up and bounds home.
 */
export function strength(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, gather: 0.14, flight: 0.26, arc: 0.8, land: [k.jaw(-6)] });
  // Shoulder set against it, head down and aside, the weight gathered back.
  c.key(L + 0.12, GROUND, at(k, 1), body(k, { y: -0.08, z: -0.03, spine: 10, turn: 16, roll: -6, neck: 14, head: 10, headY: -20, rump: 6 }), k.jaw(-8), ...furious(k));
  // The first heave: legs driving, rump up, everything forward.
  c.snap(L + 0.24, GROUND, at(k, 1), body(k, { y: -0.05, z: 0.09, spine: 12, turn: 20, roll: -8, neck: 16, head: 10, headY: -22, rump: 14 }), k.jaw(-10), ...furious(k));
  c.on('impact', L + 0.24, 0.02);
  // Straining: it keeps shoving, trembling.
  c.key(L + 0.36, GROUND, at(k, 1), body(k, { y: -0.055, z: 0.1, spine: 12, turn: 19, roll: -7, neck: 15, head: 10, headY: -21, rump: 13, headZ: 2 }), k.jaw(14), ...furious(k));
  c.key(L + 0.48, GROUND, at(k, 1), body(k, { y: -0.05, z: 0.115, spine: 13, turn: 21, roll: -8, neck: 16, head: 11, headY: -22, rump: 15, headZ: -2 }), k.jaw(16), ...furious(k));
  // Lets up, gathering back to spring home.
  c.key(L + 0.62, GROUND, at(k, 1), body(k, { y: -0.06, z: -0.02, spine: 6, turn: 4, neck: 6, head: -2, rump: 4 }), k.jaw(2), ...fierce(k));
  boundHome(c, { from: L + 0.62 });
  return c.clip('strength');
}

/**
 * Body Slam: gathers deep, leaps high over the foe and comes down on top of
 * it in a belly-flop, all four legs splayed, its whole weight on it; then
 * rolls off it, lands and bounds home.
 */
export function bodySlam(k: Kit): Clip {
  const c = new Take(k);
  const splay: Pose = { post: { armL: { x: -40, z: 50 }, armR: { x: -40, z: -50 }, thighL: { x: 30, z: 40 }, thighR: { x: 30, z: -40 } } };
  c.key(0, GROUND);
  // A deep gather.
  c.key(0.18, GROUND, body(k, { y: -0.1, z: -0.04, spine: 6, neck: 6, head: -10, rump: 4 }), ...furious(k));
  // Up and over, high (its top 0.4 heights: the flop falls onto the foe's back at 0.34).
  c.key(0.3, AIR, at(k, 0.3), { root: { y: k.arc * 1.5 } }, k.straight, k.legs.push, body(k, { spine: -10, neck: -2, head: -8 }), ...furious(k));
  c.key(0.44, AIR, at(k, 0.8, 0.5), { root: { y: 0.4 } }, k.straight, k.legs.fly, body(k, { spine: 0, neck: 6, head: -4 }), ...furious(k));
  // Above the foe, spread out to come down on it.
  c.key(0.54, AIR, at(k, 1, 0.9), { root: { y: 0.38, pitch: 7 } }, splay, body(k, { spine: 6, neck: 10, head: 0 }), k.jaw(12), ...furious(k));
  // The flop: down on top of it with everything.
  c.fall(0.62, AIR, at(k, 1, 1.05), { root: { y: 0.34, pitch: 14 } }, splay, body(k, { spine: 10, neck: 14, head: 6 }), k.jaw(18), k.ears(-40), k.tail(30), k.hackles(44), eyes('angry'));
  c.on('impact', 0.62, 0.01);
  c.key(0.74, AIR, at(k, 1, 1.02), { root: { y: 0.32, pitch: 10, roll: 6 } }, splay, body(k, { spine: 9, neck: 12, head: 4 }), k.jaw(8), ...furious(k));
  // Rolls off it and drops down in front of it.
  c.key(0.86, AIR, at(k, 0.96, 0.45), { root: { y: 0.2, roll: 22, pitch: 4 } }, k.legs.tuck, body(k, { spine: 2, neck: 4, head: -4 }), ...fierce(k));
  c.fall(0.96, GROUND, at(k, 0.88), { root: { roll: 0 } }, body(k, { y: -0.07, spine: 8, neck: 8, head: -6 }), ...fierce(k));
  c.key(1.06, GROUND, at(k, 0.88), body(k, { y: -0.06, z: -0.02, spine: 6, neck: 6, head: -4 }), ...fierce(k));
  boundHome(c, { from: 1.06, start: 0.88 });
  return c.clip('body_slam');
}

/**
 * Counter: struck, it takes the blow braced low with its eyes screwed shut,
 * then explodes at the foe in a flat, furious leap and slams into it; it
 * snarls in its face and bounds home.
 */
export function counter(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Braced, absorbing it.
  c.key(0.08, GROUND, body(k, { y: -0.08, z: -0.04, spine: 6, neck: 12, head: 14, roll: 3 }), k.jaw(-6), k.ears(-38), k.tail(-6), k.hackles(34), eyes('hurt'));
  c.key(0.22, GROUND, body(k, { y: -0.09, z: -0.045, spine: 7, neck: 13, head: 14, roll: -2 }), k.jaw(-8), k.ears(-38), k.tail(-4), k.hackles(40), eyes('hurt'));
  // Eyes open: fury, and it launches.
  const L = pounce(c, { from: 0.22, gather: 0.1, flight: 0.18, arc: 0.45, quick: true, flying: true, crouch: body(k, { y: -0.02, z: -0.015, neck: 2, head: 16 }), act: [k.jaw(20), ...furious(k)], air: [headDown(k, 0.7), k.jaw(24)] });
  const B = ram(c, L, { lunge: 0.07, lead: body(k, { spine: 4, turn: 14, roll: -8, neck: 14, head: 12 }), back: 0.86 });
  // Snarls in its face.
  c.key(B + 0.1, GROUND, at(k, 0.86), body(k, { y: -0.05, z: 0.02, spine: 6, neck: 4, head: -8 }), k.jaw(34), ...furious(k));
  c.key(B + 0.24, GROUND, at(k, 0.86), body(k, { y: -0.055, z: -0.02, spine: 6, neck: 4, head: -6, headY: 4 }), k.jaw(12), ...furious(k));
  boundHome(c, { from: B + 0.24, start: 0.86 });
  return c.clip('counter');
}

/**
 * Iron Tail: it braces with its tail held up stiff as steel, leaps at the
 * foe and spins round in the air, whipping the tail down across it as its
 * back comes round; lands facing the foe and bounds home.
 */
export function ironTail(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Tail up, rigid.
  c.key(0.18, GROUND, body(k, { y: -0.04, z: -0.02, spine: 3, neck: 4, head: 2 }), k.tail(44, 0, 16), k.ears(-16), k.hackles(26), eyes('angry'));
  c.key(0.34, GROUND, body(k, { y: -0.075, z: -0.035, spine: 8, neck: 10, head: -8, rump: 6 }), k.tail(48, 0, 18), ...fierce(k).slice(0, 1), k.hackles(30), eyes('angry'));
  // Up at the foe, starting to turn.
  c.key(0.44, AIR, at(k, 0.45), { root: { y: k.arc * 1.2, yaw: -40 } }, k.straight, k.legs.push, body(k, { spine: -6, neck: 4, head: -4 }), k.tail(48, 0, 18), k.ears(-30), k.hackles(34), eyes('angry'));
  c.key(0.54, AIR, at(k, 0.9, 0.08), { root: { y: k.arc * 1.4, yaw: -130 } }, k.straight, k.legs.tuck, body(k, { spine: -2, neck: 6, head: -4 }), k.tail(50, 20, 18), k.ears(-32), k.hackles(36), eyes('angry'));
  // The tail comes down across the foe as its back swings round.
  c.snap(0.62, AIR, at(k, 1, 0.22), { root: { y: k.arc * 1.1, yaw: -190 } }, k.straight, k.legs.tuck, body(k, { spine: -2, neck: 6, head: -4 }), k.tail(-10, 34, -10), k.ears(-34), k.hackles(38), eyes('angry'));
  c.on('impact', 0.62, 0.03);
  c.key(0.72, AIR, at(k, 1, 0.14), { root: { y: k.arc * 0.7, yaw: -280 } }, k.legs.reach, body(k, { spine: 2, neck: 6, head: -4 }), k.tail(0, -10, -4), ...fierce(k).slice(0, 1), k.hackles(34), eyes('angry'));
  // Down, facing the foe again.
  c.key(0.82, GROUND, at(k, 1), { root: { yaw: -360 } }, body(k, { y: -0.07, spine: 8, neck: 8, head: -6 }), ...fierce(k));
  c.key(0.94, GROUND, at(k, 1), { root: { yaw: -360 } }, body(k, { y: -0.06, z: -0.02, spine: 6, neck: 6, head: -4 }), ...fierce(k));
  // Home (still counting the turn it made).
  c.key(1.07, AIR, at(k, 0.5), { root: { y: k.arc * 0.85, yaw: -360 } }, k.legs.tuck, body(k, { spine: -5, neck: 2, head: -2 }), ...fierce(k, 0.6));
  c.key(1.21, GROUND, at(k, 0), { root: { yaw: -360 } }, body(k, { y: -0.05, spine: 5, neck: 5, head: -3 }), ...fierce(k, 0.6));
  c.key(1.33, GROUND, { root: { yaw: -360 } }, body(k, { y: -0.012, spine: 1, neck: 1 }), ...fierce(k, 0.4));
  c.key(1.47, GROUND, { root: { yaw: -360 } }, eyes('open'));
  return c.clip('iron_tail');
}

export const BODY = {
  tackle,
  take_down: takeDown,
  double_edge: doubleEdge,
  return: returnMove,
  frustration,
  facade,
  secret_power: secretPower,
  struggle,
  strength,
  body_slam: bodySlam,
  counter,
  iron_tail: ironTail,
};
