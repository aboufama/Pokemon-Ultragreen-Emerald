// Status moves aimed at the foe, all from home: Howl, Roar, Leer, Scary
// Face, Taunt, Torment, Odor Sleuth, Snatch, Mimic, Swagger, Attract, Toxic,
// Yawn. Each is its own gesture: Howl throws the head up to the sky, Roar
// lunges it at the foe, Leer is a slow creeping stare, Scary Face a sudden
// lunge of the face with the jaws wide, Taunt a play bow and a yap, Torment
// a jeering bob from paw to paw, Odor Sleuth a nose-down sniffing that snaps
// up onto the foe, Snatch a crouch poised to spring, Mimic a watchful tilt
// and a copied pose, Swagger a chest-out strut, Attract a coy tilt and a
// wink, Toxic a retch and a spew, Yawn a slow contagious yawn. From our side
// the foe's healthbox sits just above the head: nothing rears far up.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { GROUND, HIND, type Kit, Take, body, eyes } from './kit';
import { fierce, furious } from './travel';

/** A forepaw lifted in place (the other stands where it stood). */
const lift = (side: 'L' | 'R', x = -30, fold = 55): Pose => ({ plantFront: 0, post: { [`arm${side}`]: { x }, [`forearm${side}`]: { x: fold } } });

/** Howl: the chest fills, then the head goes up to the sky, jaws wide and eyes shut: a long trembling howl; it comes down fired up. */
export function howl(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Breath in.
  c.key(0.22, GROUND, body(k, { y: 0.004, spine: -4, chest: -4, neck: -6, head: -2 }), k.jaw(2), k.ears(-8), k.tail(8), k.hackles(10), eyes('closed'));
  // The howl, the snout to the sky (not further: from our side the foe's box sits just above).
  c.snap(0.38, GROUND, body(k, { y: 0.006, spine: -8, chest: -6, neck: -18, head: -12, headY: 3, headZ: -4 }), k.jaw(34), k.ears(8), k.tail(26), k.hackles(30), eyes('closed'));
  c.on('emit', 0.38, k.headLag);
  c.key(0.6, GROUND, body(k, { y: 0.006, spine: -8, chest: -6, neck: -19, head: -14, headY: 4, headZ: -7 }), k.jaw(38), k.ears(8), k.tail(28), k.hackles(33), eyes('closed'));
  c.on('aura', 0.62);
  c.key(0.82, GROUND, body(k, { y: 0.005, spine: -8, chest: -6, neck: -18, head: -13, headY: 2, headZ: -2 }), k.jaw(30), k.ears(7), k.tail(28), k.hackles(34), eyes('closed'));
  c.key(1.0, GROUND, body(k, { y: 0.004, spine: -8, chest: -6, neck: -18, head: -12, headY: 3, headZ: -5 }), k.jaw(26), k.ears(6), k.tail(27), k.hackles(34), eyes('closed'));
  // Down again, fired up.
  c.key(1.2, GROUND, body(k, { y: -0.014, spine: 3, neck: 4, head: 2 }), k.jaw(8), k.ears(4), k.tail(16), k.hackles(22), eyes('angry'));
  c.key(1.38, GROUND, body(k, { y: -0.005, spine: 1, neck: 1 }), k.jaw(2), k.ears(2), k.tail(8), k.hackles(10), eyes('angry'));
  c.key(1.64, GROUND, eyes('open'));
  return c.clip('howl');
}

/** Roar: it rears its head back drawing breath, then lunges it at the foe and roars into its face with all its might, the head swinging. */
export function roar(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.16, GROUND, body(k, { y: 0.002, z: -0.03, spine: -6, chest: -5, neck: -12, head: -8 }), k.jaw(10), k.ears(-10), k.tail(16), k.hackles(22), eyes('angry'));
  c.snap(0.26, GROUND, body(k, { y: -0.03, z: 0.05, spine: 9, chest: 3, neck: 22, head: 0 }), k.jaw(46), ...furious(k));
  c.on('emit', 0.26, k.headLag);
  c.key(0.44, GROUND, body(k, { y: -0.03, z: 0.048, spine: 9, chest: 3, neck: 21, head: 0, headY: 12, headZ: -6, neckY: 5 }), k.jaw(44), ...furious(k));
  c.key(0.62, GROUND, body(k, { y: -0.03, z: 0.048, spine: 9, chest: 3, neck: 21, head: 0, headY: -12, headZ: 6, neckY: -5 }), k.jaw(46), ...furious(k));
  c.key(0.8, GROUND, body(k, { y: -0.026, z: 0.04, spine: 8, chest: 3, neck: 19, head: 0, headY: 4 }), k.jaw(38), ...furious(k));
  c.key(1.0, GROUND, body(k, { y: -0.01, z: 0.01, spine: 2, neck: 4, head: 0 }), k.jaw(8), ...fierce(k, 0.6));
  c.key(1.36, GROUND, eyes('open'));
  return c.clip('roar');
}

/** Leer: slowly the head sinks and the weight creeps forward, eyes narrowed on the foe, the head swaying a little; the stare holds, then eases. */
export function leer(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.3, GROUND, body(k, { y: -0.03, z: 0.01, spine: 5, neck: 12, head: -12 }), k.ears(-6), k.tail(10), k.hackles(14), eyes('angry'));
  c.key(0.56, GROUND, body(k, { y: -0.045, z: 0.035, spine: 7, neck: 18, head: -18, headY: 6 }), k.jaw(-4), k.ears(-4), k.tail(14), k.hackles(26), eyes('angry'));
  c.on('emit', 0.6);
  c.key(0.8, GROUND, body(k, { y: -0.046, z: 0.038, spine: 7, neck: 18, head: -18, headY: -6, headZ: 2 }), k.jaw(-4), k.ears(-4), k.tail(14), k.hackles(30), eyes('angry'));
  c.key(1.02, GROUND, body(k, { y: -0.045, z: 0.036, spine: 7, neck: 18, head: -17, headY: 3 }), k.jaw(-2), k.ears(-4), k.tail(12), k.hackles(28), eyes('angry'));
  c.key(1.26, GROUND, body(k, { y: -0.012, z: 0.008, spine: 2, neck: 4, head: -4 }), k.tail(6), k.hackles(10), eyes('angry'));
  c.key(1.56, GROUND, eyes('open'));
  return c.clip('leer');
}

/** Scary Face: it lunges its face at the foe in a terrifying grimace, jaws wide, lips drawn back, ears flat, and holds it there, quivering. */
export function scaryFace(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.14, GROUND, body(k, { y: -0.02, z: -0.03, spine: 2, neck: -4, head: 6 }), k.jaw(-8), k.ears(-20), k.tail(10), k.hackles(24), eyes('angry'));
  c.snap(0.24, GROUND, body(k, { y: -0.04, z: 0.07, spine: 10, chest: 4, neck: 20, head: -10 }), k.jaw(42), k.ears(-40), k.tail(30), k.hackles(46), eyes('angry'));
  c.on('emit', 0.24, k.headLag);
  c.key(0.4, GROUND, body(k, { y: -0.042, z: 0.072, spine: 10, chest: 4, neck: 21, head: -11, headZ: 3 }), k.jaw(40), k.ears(-40), k.tail(30), k.hackles(47), eyes('angry'));
  c.key(0.56, GROUND, body(k, { y: -0.04, z: 0.07, spine: 10, chest: 4, neck: 20, head: -10, headZ: -3 }), k.jaw(43), k.ears(-40), k.tail(31), k.hackles(46), eyes('angry'));
  c.key(0.72, GROUND, body(k, { y: -0.042, z: 0.072, spine: 10, chest: 4, neck: 21, head: -11, headZ: 2 }), k.jaw(41), k.ears(-40), k.tail(30), k.hackles(47), eyes('angry'));
  c.key(0.92, GROUND, body(k, { y: -0.012, z: 0.01, spine: 2, neck: 4, head: -2 }), k.jaw(6), ...fierce(k, 0.6));
  c.key(1.24, GROUND, eyes('open'));
  return c.clip('scary_face');
}

/** Taunt: a mocking play bow, front down and rump up, tail wagging, a yap at the foe and a toss of the head. */
export function taunt(k: Kit): Clip {
  const c = new Take(k);
  const smug = (y: number) => [k.ears(6), k.tail(24, y, 10), k.hackles(8), eyes('happy')];
  c.key(0, GROUND);
  // Down into the bow.
  c.key(0.2, GROUND, body(k, { y: -0.05, z: -0.03, spine: 16, chest: 6, neck: -10, head: -12, rump: 10 }), ...smug(24));
  c.key(0.36, GROUND, body(k, { y: -0.055, z: -0.035, spine: 17, chest: 6, neck: -11, head: -12, rump: 11 }), ...smug(-24));
  // Yap!
  c.snap(0.44, GROUND, body(k, { y: -0.05, z: -0.02, spine: 16, chest: 6, neck: -6, head: -6 }), k.jaw(28), k.ears(8), k.tail(26, 26, 10), k.hackles(10), eyes('angry'));
  c.on('emit', 0.44, k.headLag);
  c.key(0.56, GROUND, body(k, { y: -0.05, z: -0.03, spine: 16, chest: 6, neck: -9, head: -10 }), k.jaw(6), ...smug(-26));
  // Up, and a toss of the head.
  c.key(0.72, GROUND, body(k, { y: 0, spine: -2, neck: -8, head: -10, headY: -14, headZ: -10 }), k.jaw(2), ...smug(22));
  c.key(0.88, GROUND, body(k, { y: -0.004, spine: -1, neck: -6, head: -8, headY: -8, headZ: -6 }), ...smug(-14));
  c.key(1.1, GROUND, body(k, { neck: -2, head: -2 }), k.tail(8), eyes('happy'));
  c.key(1.36, GROUND, eyes('open'));
  return c.clip('taunt');
}

/** Torment: a jeering bob: it hops from one forepaw to the other, head bobbing and tilting side to side, tongue-lolling mockery. */
export function torment(k: Kit): Clip {
  const c = new Take(k);
  const jeer = (side: number) => [k.jaw(18), k.ears(4 * side), k.tail(22, 20 * side, 8), k.hackles(6), eyes('happy')];
  c.key(0, GROUND);
  c.key(0.12, GROUND, body(k, { y: -0.02, spine: 2, neck: -2, head: 0 }), k.jaw(8), k.tail(16), eyes('happy'));
  c.key(0.24, GROUND, lift('R'), body(k, { y: -0.005, roll: 5, spine: -2, neck: -4, head: -2, headZ: 16, headY: 6 }), ...jeer(1));
  c.on('emit', 0.26);
  c.key(0.36, GROUND, body(k, { y: -0.03, spine: 3, neck: 2 }), k.jaw(12), k.tail(18), eyes('happy'));
  c.key(0.48, GROUND, lift('L'), body(k, { y: -0.005, roll: -5, spine: -2, neck: -4, head: -2, headZ: -16, headY: -6 }), ...jeer(-1));
  c.key(0.6, GROUND, body(k, { y: -0.03, spine: 3, neck: 2 }), k.jaw(12), k.tail(18), eyes('happy'));
  c.key(0.72, GROUND, lift('R'), body(k, { y: -0.005, roll: 5, spine: -2, neck: -4, head: -2, headZ: 16, headY: 6 }), ...jeer(1));
  c.key(0.84, GROUND, body(k, { y: -0.03, spine: 3, neck: 2 }), k.jaw(12), k.tail(18), eyes('happy'));
  c.key(0.96, GROUND, lift('L'), body(k, { y: -0.005, roll: -5, spine: -2, neck: -4, head: -2, headZ: -16, headY: -6 }), ...jeer(-1));
  c.key(1.12, GROUND, body(k, { y: -0.012, spine: 1 }), k.jaw(4), k.tail(10), eyes('happy'));
  c.key(1.38, GROUND, eyes('open'));
  return c.clip('torment');
}

/** Odor Sleuth: nose down, it sniffs its way toward the foe in short bursts, the head sweeping; then snaps its head up, eyes locked on it: found you. */
export function odorSleuth(k: Kit): Clip {
  const c = new Take(k);
  const nose = (y: number, z: number) => body(k, { y: -0.04, z, spine: 8, neck: 22, head: -2, headY: y });
  const sniff = [k.jaw(-6), k.ears(14), k.tail(12), k.hackles(4), eyes('half')];
  c.key(0, GROUND);
  c.key(0.14, GROUND, nose(10, 0.01), ...sniff);
  c.key(0.22, GROUND, nose(8, 0.03), ...sniff);
  c.key(0.3, GROUND, nose(-8, 0.02), ...sniff);
  c.key(0.38, GROUND, nose(-10, 0.04), ...sniff);
  c.key(0.46, GROUND, nose(2, 0.03), ...sniff);
  c.key(0.54, GROUND, nose(0, 0.05), ...sniff);
  // Head up: there you are.
  c.snap(0.66, GROUND, body(k, { y: -0.01, z: 0.02, spine: 2, neck: -4, head: -6 }), k.jaw(-8), k.ears(16), k.tail(20), k.hackles(22), eyes('angry'));
  c.on('emit', 0.66, k.headLag);
  c.key(0.84, GROUND, body(k, { y: -0.012, z: 0.02, spine: 2, neck: -3, head: -5, headZ: 2 }), k.jaw(-8), k.ears(14), k.tail(18), k.hackles(22), eyes('angry'));
  c.key(1.04, GROUND, body(k, { y: -0.006, z: 0.006, spine: 1, neck: 0, head: -1 }), k.ears(4), k.tail(8), k.hackles(8), eyes('angry'));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('odor_sleuth');
}

/** Snatch: it drops into a hunting crouch, rump up and tail twitching, eyes locked, quivering, poised to spring at whatever the foe does; a feint. */
export function snatch(k: Kit): Clip {
  const c = new Take(k);
  const poised = (y: number) => [k.jaw(-6), k.ears(10), k.tail(12, y, -6), k.hackles(16), eyes('angry')];
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.09, z: -0.02, spine: 12, chest: 4, neck: 14, head: -18, rump: 12 }), ...poised(10));
  c.key(0.44, GROUND, body(k, { y: -0.095, z: -0.025, spine: 12, chest: 4, neck: 14, head: -18, rump: 13, headZ: 1.5 }), ...poised(-8));
  // A feint forward.
  c.snap(0.54, GROUND, body(k, { y: -0.08, z: 0.03, spine: 11, chest: 4, neck: 16, head: -16, rump: 12 }), k.jaw(10), k.ears(-10), k.tail(18), k.hackles(24), eyes('angry'));
  c.on('emit', 0.56);
  c.key(0.7, GROUND, body(k, { y: -0.092, z: -0.02, spine: 12, chest: 4, neck: 14, head: -18, rump: 13 }), ...poised(10));
  c.key(0.88, GROUND, body(k, { y: -0.094, z: -0.024, spine: 12, chest: 4, neck: 14, head: -18, rump: 13, headZ: -1.5 }), ...poised(-10));
  c.key(1.08, GROUND, body(k, { y: -0.02, spine: 3, neck: 3, head: -4 }), k.tail(6), k.hackles(8), eyes('angry'));
  c.key(1.34, GROUND, eyes('open'));
  return c.clip('snatch');
}

/** Mimic: it watches the foe, head tilting one way and the other, then snaps into a copy of its pose: up on its haunches, a forepaw raised. */
export function mimic(k: Kit): Clip {
  const c = new Take(k);
  const curious = [k.ears(14), k.tail(6), k.hackles(0), eyes('look')];
  c.key(0, GROUND);
  c.key(0.2, GROUND, body(k, { y: -0.005, neck: -4, head: -2, headZ: 18, headY: 6 }), ...curious);
  c.key(0.42, GROUND, body(k, { y: -0.005, neck: -4, head: -2, headZ: -18, headY: -6 }), ...curious);
  // The copy.
  c.snap(0.54, HIND, body(k, { y: 0.01, z: -0.03, spine: -14, chest: -4, neck: -4, head: 4 }), { post: { armR: { x: -80 }, forearmR: { x: 20 }, armL: { x: -10 }, forearmL: { x: 60 } } }, k.jaw(8), k.ears(10), k.tail(20), k.hackles(10), eyes('angry'));
  c.on('emit', 0.56);
  c.key(0.74, HIND, body(k, { y: 0.01, z: -0.03, spine: -15, chest: -4, neck: -4, head: 4, headZ: 3 }), { post: { armR: { x: -82 }, forearmR: { x: 22 }, armL: { x: -12 }, forearmL: { x: 62 } } }, k.jaw(6), k.ears(10), k.tail(20), k.hackles(10), eyes('angry'));
  c.fall(0.9, GROUND, body(k, { y: -0.03, spine: 4, neck: 4 }), k.tail(10), eyes('angry'));
  c.key(1.04, GROUND, body(k, { y: -0.01, spine: 1, neck: 1, head: -1 }), k.tail(6), eyes('open'));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('mimic');
}

/** Swagger: chest puffed out, nose in the air, it struts on the spot, forepaws lifting high in turn, tail high and swinging: cocky. */
export function swagger(k: Kit): Clip {
  const c = new Take(k);
  const cocky = (y: number) => [k.jaw(-4), k.ears(8), k.tail(34, y, 14), k.hackles(18), eyes('happy')];
  const puffed = (roll: number) => body(k, { y: 0.01, z: 0.01, spine: -8, chest: -6, neck: -10, head: -6, roll, headZ: -roll });
  c.key(0, GROUND);
  c.key(0.18, GROUND, puffed(0), ...cocky(0));
  c.key(0.32, GROUND, lift('R', -55, 75), puffed(4), ...cocky(20));
  c.on('emit', 0.34);
  c.key(0.46, GROUND, puffed(0), ...cocky(0));
  c.key(0.6, GROUND, lift('L', -55, 75), puffed(-4), ...cocky(-20));
  c.key(0.74, GROUND, puffed(0), ...cocky(0));
  c.key(0.88, GROUND, lift('R', -55, 75), puffed(4), ...cocky(20));
  c.key(1.02, GROUND, puffed(0), ...cocky(-10));
  c.key(1.2, GROUND, body(k, { spine: -2, neck: -2 }), k.tail(10), eyes('happy'));
  c.key(1.44, GROUND, eyes('open'));
  return c.clip('swagger');
}

/** Attract: a coy tilt of the head, a slow sweep of the tail, a little bow and a wink at the foe. */
export function attract(k: Kit): Clip {
  const c = new Take(k);
  const coy = (y: number) => [k.ears(12), k.tail(10, y, 8), k.hackles(-8), eyes('happy')];
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.02, spine: 4, neck: -4, head: 4, headZ: 20, headY: 8 }), ...coy(22));
  c.key(0.46, GROUND, body(k, { y: -0.04, z: -0.02, spine: 10, chest: 4, neck: -6, head: -4, headZ: 22, headY: 10, rump: 6 }), ...coy(-22));
  // The wink.
  c.snap(0.58, GROUND, body(k, { y: -0.035, z: -0.015, spine: 9, chest: 4, neck: -6, head: -6, headZ: 24, headY: 10, rump: 5 }), k.ears(14), k.tail(10, 24, 8), k.hackles(-8), eyes('closed'));
  c.on('emit', 0.6);
  c.key(0.76, GROUND, body(k, { y: -0.03, spine: 7, chest: 3, neck: -5, head: -3, headZ: 18, headY: 8, rump: 4 }), ...coy(-20));
  c.key(0.98, GROUND, body(k, { y: -0.01, spine: 2, neck: -2, head: 0, headZ: 8 }), ...coy(14));
  c.key(1.24, GROUND, eyes('open'));
  return c.clip('attract');
}

/** Toxic: it hunches and retches, the neck heaving, then thrusts its head at the foe and spews the poison; it shakes its head, disgusted. */
export function toxic(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // Retching: hunched, the neck heaving twice.
  c.key(0.14, GROUND, body(k, { y: -0.04, z: -0.02, spine: 10, chest: 4, neck: 18, head: 10 }), k.jaw(10), k.ears(-20), k.tail(-6), k.hackles(20), eyes('closed'));
  c.key(0.26, GROUND, body(k, { y: -0.03, z: -0.03, spine: 6, chest: 2, neck: 8, head: -2 }), k.jaw(4), k.ears(-20), k.tail(-6), k.hackles(22), eyes('closed'));
  c.key(0.38, GROUND, body(k, { y: -0.045, z: -0.02, spine: 11, chest: 4, neck: 20, head: 12 }), k.jaw(16), k.ears(-22), k.tail(-4), k.hackles(26), eyes('closed'));
  // Spew: the head thrust at the foe, jaws wide.
  c.snap(0.5, GROUND, body(k, { y: -0.03, z: 0.05, spine: 6, chest: 2, neck: 12, head: -12 }), k.jaw(44), k.ears(-30), k.tail(20), k.hackles(34), eyes('angry'));
  c.on('emit', 0.5, k.headLag);
  c.key(0.7, GROUND, body(k, { y: -0.03, z: 0.045, spine: 6, chest: 2, neck: 11, head: -11, headY: 4 }), k.jaw(40), k.ears(-30), k.tail(20), k.hackles(34), eyes('angry'));
  // Shakes its head, disgusted.
  c.key(0.84, GROUND, body(k, { y: -0.01, spine: 2, neck: 2, head: 0, headY: 16, headZ: -10 }), k.jaw(6), k.ears(-12), k.tail(10), k.hackles(14), eyes('closed'));
  c.key(0.96, GROUND, body(k, { y: -0.01, spine: 2, neck: 2, head: 0, headY: -14, headZ: 9 }), k.jaw(4), k.ears(-10), k.tail(8), k.hackles(12), eyes('closed'));
  c.key(1.12, GROUND, body(k, { y: -0.005, spine: 1, neck: 1 }), k.tail(4), eyes('angry'));
  c.key(1.38, GROUND, eyes('open'));
  return c.clip('toxic');
}

/** Yawn: a big, slow yawn: the head tips up, the jaws open wider and wider, eyes shut, a stretch of the forelegs; it smacks its lips and blinks. */
export function yawn(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.3, GROUND, body(k, { y: -0.03, z: -0.03, spine: 8, chest: 4, neck: -4, head: -8, rump: 6 }), k.jaw(14), k.ears(-6), k.tail(4), k.hackles(-6), eyes('half'));
  c.key(0.62, GROUND, body(k, { y: -0.045, z: -0.045, spine: 12, chest: 5, neck: -10, head: -12, rump: 9 }), k.jaw(46), k.ears(-12), k.tail(6), k.hackles(-8), eyes('closed'));
  c.on('emit', 0.66, k.headLag);
  c.key(0.86, GROUND, body(k, { y: -0.047, z: -0.047, spine: 12, chest: 5, neck: -11, head: -13, rump: 9, headZ: 3 }), k.jaw(50), k.ears(-14), k.tail(6), k.hackles(-8), eyes('closed'));
  // Snap shut, a lip smack.
  c.key(1.0, GROUND, body(k, { y: -0.02, z: -0.01, spine: 4, neck: -2, head: -2 }), k.jaw(-6), k.ears(-4), k.tail(2), k.hackles(-4), eyes('closed'));
  c.key(1.1, GROUND, body(k, { y: -0.015, spine: 3, neck: -1, head: -1 }), k.jaw(6), eyes('half'));
  c.key(1.22, GROUND, body(k, { y: -0.01, spine: 2 }), k.jaw(-2), eyes('half'));
  c.key(1.5, GROUND, eyes('open'));
  return c.clip('yawn');
}

export const STATUS = {
  howl,
  roar,
  leer,
  scary_face: scaryFace,
  taunt,
  torment,
  odor_sleuth: odorSleuth,
  snatch,
  mimic,
  swagger,
  attract,
  toxic,
  yawn,
};
