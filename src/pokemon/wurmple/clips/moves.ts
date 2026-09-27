// Wurmple's moves, one clip each: its whole movepool (Tackle, String Shot,
// Poison Sting and Struggle). See kit.ts for the body, the channels and its
// scrunch-and-spring travel.
//
// A blow is in contact for a few frames before its `impact`: the battle shows
// poses held for four frames (stop motion), and the game's hit effects and
// the foe's flinch start on the impact.

import type { Clip } from '../../../anim/clip';
import {
  AIR, BUTT, COIL, DROWSY, GLARE, OPEN, SCORPION, SCRUNCH, SHUT, STAB, TOUCH,
  at, clip, fall, flight, flightHome, front, key, lean, pelvis, snap, tail,
} from './kit';

/**
 * Tackle: it bunches up at home and springs at the foe in one clean arc,
 * flying head first, lands in front of it on its belly, rears back to throw
 * itself, then slams its whole body into the foe crest first (the body
 * lunges in and drives on through it), bounces off and springs home.
 */
export const tackle: Clip = clip('tackle', 1.64, [
  key(0),
  // Bunch up to spring, eyes on the foe.
  key(0.12, SCRUNCH, GLARE),
  key(0.22, SCRUNCH, front(3, 3, 1, -1), pelvis(0, -0.006), GLARE),
  // Spring: it shoots out long, flying head first at the foe.
  snap(0.3, flight(0.28, 0.1, 14), GLARE),
  key(0.42, flight(0.7, 0.2, 22), GLARE),
  // Down in front of the foe, squashed on its belly.
  fall(0.52, at(1, 0, 0, { pitch: 4 }), front(6, 6, 2, 0), pelvis(0, -0.03), { scale: 0.95 }, GLARE),
  // Rear back to throw the body.
  key(0.66, at(1, 0, -0.05, { pitch: -6 }), COIL, GLARE),
  // The slam: the whole body lunges in, crest first, and drives on through it.
  snap(0.74, at(1, 0, 0.1, { pitch: 8 }), BUTT, front(6, 6, 2, 0), GLARE),
  key(0.88, at(1, 0, 0.13, { pitch: 10 }), BUTT, front(9, 9, 3, 3), tail(0, 4, 8), GLARE),
  // Bounce off it.
  snap(0.98, at(1, 0.05, 0, { pitch: -4 }), AIR, front(-6, -8, -4, -6), tail(0, 4, 8), GLARE),
  key(1.12, at(1), SCRUNCH, GLARE),
  // Spring home, then settle.
  snap(1.24, flightHome(0.5, 0.17), GLARE),
  fall(1.38, at(0), TOUCH, GLARE),
  key(1.5, front(-2, -3, -1, -2), OPEN),
  key(1.64, OPEN),
], [{ t: 0.82, name: 'impact' }]);

/**
 * Struggle: out of moves and worn out, it gathers itself feebly (eyes
 * drooping), flops toward the foe in a low, clumsy hop, then throws itself
 * at it with its front half flailing from side to side, hits it, and winces
 * from the recoil; it drags itself home in a tired hop and sags.
 */
export const struggle: Clip = clip('struggle', 2.06, [
  key(0),
  // A tired gather: a sag, then a weak scrunch.
  key(0.14, front(6, 8, 6, 10), pelvis(0, -0.01), DROWSY),
  key(0.3, SCRUNCH, front(2, 2, 2, 8), DROWSY),
  // A low, clumsy flop at the foe.
  snap(0.4, flight(0.35, 0.06, 8), front(4, 4, 2, 6), lean(6), DROWSY),
  key(0.52, flight(0.75, 0.1, 14), front(6, 6, 4, 8), lean(-4), DROWSY),
  fall(0.64, at(1), TOUCH, front(4, 4, 2, 6), lean(3), DROWSY),
  // Flailing: the front half thrashes one way, then the other, into it.
  key(0.8, at(1, 0, -0.04), front(-6, -8, -4, -4), lean(-12), GLARE),
  snap(0.88, at(1, 0, 0.1, { roll: 6 }), BUTT, lean(12), GLARE),
  key(1.0, at(1, 0, 0.12, { roll: -5 }), BUTT, front(3, 3, 2, 4), lean(-10), GLARE),
  // The recoil hurts it: a wince, the body jolting back.
  snap(1.1, at(1, 0.03, 0), front(-10, -14, -8, -16), tail(0, 6, 16), SHUT),
  key(1.26, at(1, 0, 0), front(4, 6, 4, 10), tail(0, 2, 4), lean(4), SHUT),
  key(1.38, at(1), SCRUNCH, front(4, 4, 2, 10), DROWSY),
  // Drag itself home in a tired hop and sag.
  snap(1.52, flightHome(0.48, 0.1, -6), DROWSY),
  fall(1.66, at(0), TOUCH, front(4, 4, 2, 8), DROWSY),
  key(1.84, front(4, 5, 3, 8), pelvis(0, -0.008), DROWSY),
  key(2.06, OPEN),
], [{ t: 0.96, name: 'impact' }]);

/**
 * Poison Sting: the venom is in the two spikes on its tail end. The tail
 * rears up beside it like a scorpion's, spikes standing tall, while the
 * front half leans away and glares; then the tail whips over and down so
 * the spikes jab at the foe and the barb flies from them (release after the
 * tail end's overlap), the front half leaning into it. The tail follows
 * through and curls back down into place.
 */
export const poisonSting: Clip = clip('poison_sting', 1.1, [
  key(0),
  key(0.12, SCORPION, lean(-5), front(-4, -4, 0, -2), GLARE),
  key(0.24, SCORPION, tail(4, 4, -4), lean(-6), front(-5, -5, 0, -3), pelvis(0, 0, -0.01), GLARE),
  snap(0.31, STAB, lean(5), front(5, 5, 1, 4), pelvis(0, 0, 0.012), GLARE),
  key(0.46, STAB, tail(-2, -2, -6), lean(5.5), front(5, 5, 1, 5), pelvis(0, 0, 0.014), GLARE),
  key(0.62, tail(4, 4, -60, 4, 0, -5), lean(2), front(2, 2, 0, 2), GLARE),
  key(0.82, tail(1, 1, -12), lean(0.5), GLARE),
  key(1.1, OPEN),
], [{ t: 0.39, name: 'release' }]);

/**
 * String Shot: it rears back with its head up, drawing in, then thrusts its
 * head forward and down so its mouth points at the foe and sprays thread
 * (emit), weaving its head from side to side to spin the thread over the
 * foe for as long as the game's threads fly (about a second); then it
 * pulls its head back and settles.
 */
export const stringShot: Clip = clip('string_shot', 1.8, [
  key(0),
  key(0.22, front(-12, -10, -6, -16), tail(0, 6, 12), GLARE),
  snap(0.32, front(12, 12, 6, 6), tail(0, -2, -4), GLARE),
  key(0.5, front(11, 11, 6, 5, 7, 3), tail(0, -2, -4), GLARE),
  key(0.68, front(12, 12, 6, 7, -7, -3), tail(0, -2, -3), GLARE),
  key(0.86, front(11, 11, 6, 5, 6, 2), tail(0, -2, -4), GLARE),
  key(1.04, front(12, 12, 6, 7, -6, -2), tail(0, -2, -3), GLARE),
  key(1.22, front(11, 11, 6, 5, 4, 1), tail(0, -2, -4), GLARE),
  key(1.38, front(12, 12, 6, 6, -2), tail(0, -2, -3), GLARE),
  key(1.56, front(-3, -3, -2, -4), tail(0, 1, 2), GLARE),
  key(1.8, OPEN),
], [{ t: 0.38, name: 'emit' }]);

export const MOVES: Clip[] = [tackle, struggle, poisonSting, stringShot];
