// Beautifly's status clips (./set.ts has the helpers and the story): the
// first clips' shape for a move made at home (Blaziken's status_self and
// status_target and the guard, rest, weather and charm of its more.ts;
// Sceptile's afterimage and flash): a gather, the action with a moving hold,
// a relax, acted with its wings: shaken to sift a powder, swept forward into
// a fan to guard it, spread to bask, fanned to flirt, drawn in and flung open
// to flare.

import type { Clip } from '../../anim/clip';
import type { Pose } from '../../anim/rig';
import {
  W_DEEP, W_DOWN, W_HIGH, W_MID, W_SPREAD,
  body, feelers, key, rise, snap, swell, wings,
} from './set';

/** Its head tilted to its right (+) or left (-). */
const tilt = (z: number): Pose => ({ bones: { head: { z } } });

/**
 * The guard: both wings swept forward and spread low before its body, a fan
 * it curls in behind (`k` 1 is the full guard). (Wrapped up over its head,
 * from our side the raised wings closed up behind each other and it read
 * as turned aside, a streamer sticking out.)
 */
const guard = (k: number): Pose => wings(-50 * k, -20 * k, 0.3);

/**
 * Sleep Talk (status_self: buff): it draws its wings in round itself and
 * curls, gathering itself, then rises on a strong stroke and snaps them open
 * wide and flat in a full display of its pattern, and holds it, trembling,
 * as the power rises round it (aura); then it relaxes. (Blaziken's
 * status_self: gather, the flex with a tremor, relax.)
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.7,
  keys: [
    key(0),
    // Gathers: wings drawn in down and forward round its curled body.
    key(0.28, rise(-0.025, 0, 5), wings(-34, -24, 0.3), body(8, 14, -16), feelers(-12), swell(0.97)),
    key(0.42, rise(-0.03, 0, 6), wings(-36, -26, 0.3), body(9, 15, -17), feelers(-13), swell(0.965)),
    // The display: wings snapped open wide and flat, the body lifting, head up.
    snap(0.56, rise(0.03, 0, -6), wings(-10, -32, 0.9), body(-6, -8, 6), feelers(10, 8), swell(1.03)),
    key(0.7, rise(0.034, 0, -7, 1.5), wings(-11, -34, 0.9), body(-7, -9, 6), feelers(11, 8), swell(1.035)),
    key(0.84, rise(0.03, 0, -6, -1.5), wings(-10, -31, 0.9), body(-6, -8, 6), feelers(10, 8), swell(1.03)),
    key(0.98, rise(0.034, 0, -7, 1), wings(-11, -33, 0.9), body(-7, -9, 6), feelers(11, 8), swell(1.035)),
    // Relaxes.
    key(1.22, rise(0.015, 0, -1), wings(2, 4), body(-1, -1)),
    key(1.44, rise(0.006, 0, 0.5), W_DOWN),
    key(1.7),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Mimic (status_target: glare): it draws up, then leans in toward the foe,
 * wings lowered and still and antennae pointed at it, and studies it with a
 * slow tilt of the head one way and the other (emit), then draws back.
 * (Sceptile's status_target_glare.)
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.45,
  keys: [
    key(0),
    // Draws up a little, then leans in, wings lowered, antennae at the foe.
    key(0.18, rise(0.015, -0.01, -4), wings(4, 6), body(-2, -4), feelers(-4)),
    snap(0.32, rise(-0.01, 0.05, 14), W_MID, body(8, 10, -6), feelers(24, -8)),
    // Studies it: the head (and body) tilting one way, then the other (a moving hold).
    key(0.52, rise(-0.014, 0.055, 15, 8), wings(-8, -18), body(8, 11, -6, 12), feelers(26, -8), tilt(18)),
    key(0.74, rise(-0.012, 0.054, 14, -8), W_MID, body(8, 10, -6, -12), feelers(24, -8), tilt(-18)),
    key(0.92, rise(-0.01, 0.05, 13), wings(-8, -18), body(7, 9, -5), feelers(22, -6)),
    // Draws back.
    key(1.12, rise(0.01, 0, -1), wings(2, 4), body(0, 0)),
    key(1.45),
  ],
  events: [{ t: 0.38, name: 'emit' }],
};

/**
 * Protect, Harden, Safeguard, Substitute, Endure (shield): it flinches back,
 * then snaps its wings forward into a fan before its body and curls in
 * behind them with its head tucked, and holds there, trembling, while the
 * barrier forms (aura); then it opens up again. (Blaziken's shield: the
 * block snapped up, the weight down behind it, a tremor, the guard down.)
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.55,
  keys: [
    key(0),
    // A flinch back, wings flung up.
    key(0.14, rise(0.015, -0.02, -8), W_HIGH, body(-4, -6, 4), feelers(-8)),
    // The guard: wings snapped forward into a fan, the body curled in behind them.
    snap(0.3, rise(-0.01, 0, 4), guard(1), body(8, 18, -18), feelers(-14), swell(0.97)),
    key(0.5, rise(-0.012, 0, 5, 1), guard(1.06), body(9, 19, -19), feelers(-15), swell(0.965)),
    key(0.7, rise(-0.01, 0, 4, -1), guard(0.97), body(8, 18, -18), feelers(-14), swell(0.97)),
    key(0.9, rise(-0.012, 0, 5, 0.5), guard(1.04), body(9, 19, -19), feelers(-15), swell(0.965)),
    // Opens up again.
    key(1.1, rise(0.015, 0, -2), W_DOWN, body(0, 0)),
    key(1.3, rise(0.008, 0, 0), wings(2, 4)),
    key(1.55),
  ],
  events: [{ t: 0.34, name: 'aura' }],
};

/**
 * Stun Spore (powder): it rises over its place with its wings drawn up and
 * shakes them in a quick, shivering flurry, the body shimmying from side to
 * side, so the powder sifts off them at the foe (emit); then it settles.
 */
const powder: Clip = {
  name: 'powder',
  duration: 1.55,
  keys: [
    key(0),
    // Rises, wings drawn up to shake.
    key(0.2, rise(0.03, -0.01, -4), W_HIGH, body(-3, -2, 3), feelers(-6)),
    // The shiver: quick small beats, the body shimmying from side to side.
    key(0.3, rise(0.035, 0, 2, 6), wings(-6, 0), body(1, 2), feelers(4)),
    key(0.4, rise(0.038, 0, 1, -6), wings(5, 10), body(1, 2)),
    key(0.5, rise(0.035, 0, 2, 6), wings(-8, -2), body(1, 2), feelers(4)),
    key(0.6, rise(0.038, 0, 1, -6), wings(5, 10), body(1, 2)),
    key(0.7, rise(0.035, 0, 2, 5), wings(-8, -2), body(1, 2), feelers(4)),
    key(0.8, rise(0.036, 0, 1, -3), wings(4, 12), body(1, 2)),
    key(0.9, rise(0.032, 0, 2, 1), wings(-8, -8)),
    // Settles.
    key(1.08, rise(0.018, 0, -1), wings(2, 6)),
    key(1.28, rise(0.008, 0, 0), W_DOWN),
    key(1.55),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/**
 * Morning Sun, Rest (heal): calm, it rises gently and turns its face up to
 * the light, opening its wings wide and flat to bask, and sways slowly on
 * long, soft beats as it heals (aura); then it drifts back down. (Sceptile's
 * basking status_self_heal.)
 */
const heal: Clip = {
  name: 'heal',
  duration: 1.9,
  keys: [
    key(0),
    key(0.3, rise(0.025, -0.01, -6), wings(-6, -22, 0.9), body(-6, -14, 4), feelers(-4, 6)),
    key(0.58, rise(0.035, -0.015, -9, -4), wings(-10, -34, 0.9), body(-9, -22, 6), feelers(-6, 8), swell(1.02)),
    key(0.9, rise(0.04, -0.015, -9, 4), wings(-8, -28, 0.9), body(-9, -23, 6), feelers(-6, 8), swell(1.03)),
    key(1.2, rise(0.036, -0.015, -8, -2), wings(-10, -34, 0.9), body(-9, -22, 6), feelers(-6, 8), swell(1.025)),
    // Drifts back down into its hover.
    key(1.5, rise(0.015, 0, -2), wings(0, 2), body(-2, -4, 1)),
    key(1.9),
  ],
  events: [{ t: 0.62, name: 'aura' }],
};

/**
 * Sunny Day (weather): it dips on a deep stroke, then beats itself up with
 * its head raised to the sky, and calls the sun with big, slow, open
 * strokes while it comes out (aura); then it comes back down. (Blaziken's
 * weather: gather, open to the sky, a slow sway. The body stays level: from
 * our side a lean back tipped the raised wings toward us and they closed up.)
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.8,
  keys: [
    key(0),
    // Dips, wings driven down, gathering.
    key(0.22, rise(-0.02, 0, 4), W_DEEP, body(4, 6, -4), feelers(-6)),
    // Up: head raised to the sky, the wings beating up and open.
    snap(0.46, rise(0.035, -0.01, -2), wings(-2, 4), body(-5, -20, 5), feelers(-8, 10), swell(1.02)),
    key(0.66, rise(0.04, -0.012, -3, 3), wings(-12, -18), body(-6, -22, 5), feelers(-8, 10), swell(1.02)),
    key(0.86, rise(0.042, -0.012, -2, -3), wings(-2, 4), body(-6, -22, 5), feelers(-8, 10), swell(1.02)),
    key(1.06, rise(0.036, -0.01, -3, 1), wings(-12, -18), body(-5, -20, 5), feelers(-8, 10)),
    // Back down.
    key(1.34, rise(0.012, 0, -1), W_DOWN, body(-1, -2)),
    key(1.8),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

/**
 * Attract, Swagger (charm): coy and showy, it tips its body and head to one
 * side, bobs toward the foe and fans its wings open
 * slowly, twice, showing off its pattern (emit), then flits back upright.
 * (Blaziken's charm: the gesture made twice, held smugly.)
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.6,
  keys: [
    key(0),
    // A coy tilt, wings drawn up.
    key(0.22, rise(0.02, -0.01, -2, -8), wings(4, 6), body(-2, -4, 2, 10), feelers(-4, 8), tilt(-12)),
    // Bobs toward the foe and fans the wings open (showing off).
    snap(0.4, rise(0.01, 0.03, 6, -10), W_SPREAD, body(3, 4, -2, 12), feelers(10, 8), tilt(-14)),
    key(0.58, rise(0.02, 0.028, 4, -8), wings(3, 5), body(2, 2, -2, 10), feelers(8, 8), tilt(-12)),
    key(0.76, rise(0.012, 0.032, 6, -11), W_SPREAD, body(3, 4, -2, 12), feelers(10, 8), tilt(-15)),
    key(0.96, rise(0.02, 0.02, 3, -7), wings(2, 4), body(1, 2, -1, 8), feelers(6, 6), tilt(-10)),
    // Flits back upright.
    key(1.2, rise(0.012, 0, 0, 3), W_DOWN, body(0, 0)),
    key(1.6),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/**
 * Double Team (afterimage): it darts from side to side too fast to follow,
 * banking into each dart on quick beats (the afterimages run from the aura),
 * and flits back to its place. (Blaziken's afterimage: quick darts, the
 * guard up.)
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.7,
  keys: [
    key(0),
    key(0.1, rise(-0.01, 0, 2, 6, -0.02), W_HIGH, feelers(-6)),
    key(0.2, rise(0.02, 0, 0, -16, 0.15), W_DOWN),
    key(0.3, rise(0.01, 0, 0, -6, 0.17), wings(4, 10)),
    key(0.42, rise(0.02, 0, 0, 12, -0.05), W_MID),
    key(0.52, rise(0.01, 0, 0, 4, -0.06), wings(4, 10)),
    key(0.64, rise(0.02, 0, 0, -16, 0.14), W_DOWN),
    key(0.74, rise(0.01, 0, 0, -6, 0.16), wings(4, 10)),
    key(0.86, rise(0.02, 0, 0, 12, -0.05), W_MID),
    key(0.96, rise(0.01, 0, 0, 4, -0.055), wings(4, 10)),
    key(1.1, rise(0.015, 0, 0, -8, 0.02), W_DOWN),
    key(1.24, rise(0.005, 0, 0, 1, 0), wings(2, 4)),
    key(1.7),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Flash (flash): it draws its wings in round itself and curls, gathering
 * the light, then flings them wide open at the foe, flaring its whole pattern
 * (emit: the screen whites out), holds the flare and relaxes. (Sceptile's
 * flash: curl in, flare up and open at the foe.)
 */
const flash: Clip = {
  name: 'flash',
  duration: 1.3,
  keys: [
    key(0),
    // Gathers: wings drawn in down and forward round its curled body.
    key(0.18, rise(-0.015, -0.01, 5), wings(-34, -24, 0.3), body(8, 14, -16), feelers(-12), swell(0.965)),
    key(0.32, rise(-0.02, -0.012, 6), wings(-36, -26, 0.3), body(9, 15, -17), feelers(-13), swell(0.955)),
    // The flare: wings flung wide open at the foe.
    snap(0.42, rise(0.022, 0.025, 6, 0, 0.02), wings(-24, -24, 0.9), body(-4, -6, 4), feelers(14, 10), swell(1.03)),
    key(0.58, rise(0.024, 0.025, 5, 1, 0.02), wings(-24, -26, 0.9), body(-5, -6, 4), feelers(15, 10), swell(1.03)),
    key(0.74, rise(0.02, 0.02, 4, -1, 0.015), wings(-22, -23, 0.9), body(-4, -5, 4), feelers(13, 9), swell(1.025)),
    // Relaxes.
    key(0.96, rise(0.01, 0, 0), wings(2, 4), body(0, 0)),
    key(1.3),
  ],
  events: [{ t: 0.44, name: 'emit' }],
};

/** The status clips, by the action they show. */
export const STATUS_CLIPS: Record<string, Clip> = Object.fromEntries(
  [statusSelf, statusTarget, shield, powder, heal, weather, charm, afterimage, flash].map((c) => [c.name, c]),
);
