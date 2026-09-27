// The jaws: Bite, Crunch, Poison Fang, Astonish. Each pounces to the foe
// (./travel.ts) and acts with its jaws on the foe's face and throat: Bite a
// lunge and snap with a tug, Crunch a heavy clamp and a shake that worries
// the hold, Poison Fang a snake-quick jab and recoil, Astonish a low sneak
// and a sudden rear up into the foe's face. Impacts come the head's lag
// after the snap (profile.overlap).

import type { Clip } from '../../../anim/clip';
import { GROUND, HIND, type Kit, Take, at, body, eyes } from './kit';
import { boundHome, fierce, furious, pounce } from './travel';

/** Bite: pounce, jaws opening in the air; land, cock the head, a lunge and a snap on the foe's face, a tug, let go, bound home. */
export function bite(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, air: [k.jaw(26)], act: fierce(k) });
  // Cock: the head draws up and back, the jaws gape.
  c.key(L + 0.07, GROUND, at(k, 1), body(k, { y: -0.04, z: -0.015, spine: 4, neck: -8, head: -10 }), k.jaw(44), ...furious(k));
  // The lunge and the snap: hips drive, the neck shoots out, the jaws slam shut on it.
  c.snap(L + 0.14, GROUND, at(k, 1), body(k, { y: -0.03, z: 0.07, spine: 6, neck: 12, head: -2, headZ: 6 }), k.jaw(-12), ...furious(k));
  c.on('impact', L + 0.14, k.headLag);
  // Tug: it hangs on and pulls, the head wrenching one way then the other.
  c.key(L + 0.24, GROUND, at(k, 1), body(k, { y: -0.035, z: 0.045, spine: 5, neck: 10, head: -2, headY: 12, headZ: -6, neckY: 5 }), k.jaw(-12), ...furious(k));
  c.key(L + 0.34, GROUND, at(k, 1), body(k, { y: -0.04, z: 0.03, spine: 4, neck: 8, head: -3, headY: -9, headZ: 5, neckY: -4 }), k.jaw(-11), ...furious(k));
  // Let go, weight back onto the haunches for the spring home.
  c.key(L + 0.44, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.02, spine: 6, neck: 4, head: -6 }), k.jaw(14), ...fierce(k));
  boundHome(c, { from: L + 0.44 });
  return c.clip('bite');
}

/**
 * Crunch: a heavier pounce, the jaws gaping wide on the way; the jaws clamp
 * down with the whole body driving in, then it grinds and shakes its head
 * hard from side to side, the body and tail swinging with it, and wrenches
 * free; bound home.
 */
export function crunch(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, gather: 0.16, arc: 1.12, air: [k.jaw(34)], act: furious(k), crouch: body(k, { y: -0.015, spine: 2 }) });
  // Gape wide, head reared back over the foe.
  c.key(L + 0.08, GROUND, at(k, 1), body(k, { y: -0.035, z: -0.02, spine: 2, neck: -12, head: -14 }), k.jaw(50), ...furious(k));
  // Clamp: everything drives in, the jaws crush shut.
  c.snap(L + 0.15, GROUND, at(k, 1), body(k, { y: -0.035, z: 0.08, spine: 8, neck: 14, head: 2 }), k.jaw(-14), ...furious(k));
  c.on('impact', L + 0.15, k.headLag);
  // Grind and shake: the head and neck thrash side to side, the body swinging after them.
  const shake = (t: number, side: number, f: number) =>
    c.key(t, GROUND, at(k, 1), body(k, { y: -0.04, z: 0.065, spine: 7, neck: 13, head: 2, headY: 18 * side * f, headZ: -10 * side * f, neckY: 9 * side * f, turn: 5 * side * f, roll: -4 * side * f }), k.jaw(-14), k.tail(24, -26 * side * f, 10), k.ears(-36), k.hackles(40), eyes('angry'));
  shake(L + 0.25, 1, 0.7);
  shake(L + 0.35, -1, 0.66);
  shake(L + 0.45, 1, 0.64);
  shake(L + 0.55, -1, 0.55);
  // Wrench free: a last yank back, the jaws opening.
  c.key(L + 0.67, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.025, spine: 5, neck: 2, head: -8, headY: -10 }), k.jaw(22), ...fierce(k));
  c.key(L + 0.76, GROUND, at(k, 1), body(k, { y: -0.055, z: -0.03, spine: 6, neck: 4, head: -6, headY: -3 }), k.jaw(6), ...fierce(k));
  boundHome(c, { from: L + 0.76 });
  return c.clip('crunch');
}

/**
 * Poison Fang: a low, quick dart, landing coiled with the head drawn back
 * like a snake's; then a lightning jab, fangs bared, and it snaps its head
 * back out of reach at once, hissing; bound home.
 */
export function poisonFang(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  const L = pounce(c, { from: 0, gather: 0.1, flight: 0.2, arc: 0.55, quick: true, air: [k.jaw(8)], act: fierce(k), land: [k.jaw(10)] });
  // Coiled: the head drawn back and up on the neck, fangs bared.
  c.key(L + 0.08, GROUND, at(k, 1), body(k, { y: -0.055, z: -0.03, spine: 4, neck: -16, head: -6 }), k.jaw(14), k.ears(-30), k.tail(20), k.hackles(34), eyes('angry'));
  c.key(L + 0.14, GROUND, at(k, 1), body(k, { y: -0.058, z: -0.035, spine: 4, neck: -18, head: -8, headZ: 3 }), k.jaw(18), k.ears(-32), k.tail(22), k.hackles(36), eyes('angry'));
  // The jab: the neck shoots out, the fangs sink in.
  c.snap(L + 0.19, GROUND, at(k, 1), body(k, { y: -0.03, z: 0.075, spine: 6, neck: 16, head: 4 }), k.jaw(-8), k.ears(-36), k.tail(30), k.hackles(38), eyes('angry'));
  c.on('impact', L + 0.19, k.headLag);
  // Snapped straight back, hissing.
  c.snap(L + 0.29, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.03, spine: 3, neck: -14, head: -8 }), k.jaw(16), k.ears(-30), k.tail(22), k.hackles(34), eyes('angry'));
  c.key(L + 0.4, GROUND, at(k, 1), body(k, { y: -0.052, z: -0.028, spine: 4, neck: -10, head: -6, headZ: -2 }), k.jaw(10), ...fierce(k));
  boundHome(c, { from: L + 0.4, settle: 0.22 });
  return c.clip('poison_fang');
}

/**
 * Astonish: it slinks in low and silent (a flat creeping leap, ears down),
 * crouches under the foe's nose, then springs up rearing into its face with
 * a sudden "boo": forelegs flung wide, jaws gaping, ears up, eyes wide. It
 * drops back onto its forepaws, pleased with itself, and bounds home.
 */
export function astonish(k: Kit): Clip {
  const c = new Take(k);
  const sly = [k.ears(-30), k.tail(-6), k.hackles(-6), eyes('look')];
  c.key(0, GROUND);
  // Down low, slinking.
  c.key(0.12, GROUND, body(k, { y: -0.07, spine: 6, neck: 16, head: -8 }), ...sly);
  const L = pounce(c, { from: 0.12, gather: 0.1, flight: 0.24, arc: 0.45, quick: true, act: sly, crouch: body(k, { y: -0.02, neck: 4 }), land: [body(k, { y: -0.03, neck: 8 })] });
  // Crouched right under its nose, still.
  c.key(L + 0.1, GROUND, at(k, 1), body(k, { y: -0.1, z: -0.02, spine: 8, neck: 18, head: -4 }), k.jaw(-4), ...sly);
  c.key(L + 0.2, GROUND, at(k, 1), body(k, { y: -0.105, z: -0.025, spine: 8, neck: 19, head: -3, headZ: 2 }), k.jaw(-4), ...sly);
  // BOO: up on its hind legs into the foe's face, forelegs flung wide, jaws wide.
  c.snap(L + 0.28, HIND, at(k, 1), body(k, { y: 0.03, z: 0.05, spine: -24, chest: -6, neck: -6, head: 8 }), k.legs.paws, { post: { armL: { z: 30 }, armR: { z: -30 } } }, k.jaw(48), k.ears(24), k.tail(34, 0, 14), k.hackles(40), eyes('open'));
  c.on('impact', L + 0.28, k.headLag);
  c.key(L + 0.42, HIND, at(k, 1), body(k, { y: 0.028, z: 0.045, spine: -23, chest: -6, neck: -5, head: 7, headZ: 4 }), k.legs.paws, { post: { armL: { z: 32 }, armR: { z: -32 } } }, k.jaw(44), k.ears(22), k.tail(32, 10, 14), k.hackles(38), eyes('open'));
  // Back down on its forepaws, a pleased toss of the head.
  c.fall(L + 0.58, GROUND, at(k, 1), body(k, { y: -0.05, z: 0.01, spine: 4, neck: 2, head: -4 }), k.jaw(6), k.ears(6), k.tail(20, -14), k.hackles(10), eyes('happy'));
  c.key(L + 0.7, GROUND, at(k, 1), body(k, { y: -0.055, z: -0.02, spine: 6, neck: 4, head: -4, headZ: -6 }), k.jaw(2), k.ears(4), k.tail(18, 12), k.hackles(8), eyes('happy'));
  boundHome(c, { from: L + 0.7, act: [k.ears(2), k.tail(14), k.hackles(6), eyes('happy')] });
  return c.clip('astonish');
}

export const JAWS = { bite, crunch, poison_fang: poisonFang, astonish };
