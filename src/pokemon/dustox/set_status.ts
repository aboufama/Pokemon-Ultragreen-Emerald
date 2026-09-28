// Dustox's status moves, in the first clips' style (./set.ts has the helpers
// and the notes on how it moves): a gather or a rear-up, the action with a
// moving hold, a relax, all from its hover. Its toxic powder is shaken from
// its wings; it guards behind its wings, soaks in the moonlight, stares with
// its antennae pricked, and darts aside on quick beats.
//
// From our side the text box hides all but its head and the tops of its
// wings (as Emerald's back sprite shows only its top), so each action raises
// its wings or its head where it can be seen; and it never sweeps its right
// wing far forward at home, which put the wing under our healthbox.

import type { Clip } from '../../anim/clip';
import { GAPE, SHUT, SMILE, antennae, bend, curl, fly, key, legs, snap, swell, wings } from './set';

/**
 * Sleep Talk and the buffs (buff; status_self): it draws its wings in round
 * itself and curls up, gathering, then flares them up and open, chest out
 * and head up, with a cry as the aura rises, trembling with the power, and
 * relaxes.
 */
const statusSelf: Clip = {
  name: 'status_self',
  duration: 1.6,
  keys: [
    key(0),
    // Gathering: wings drawn in round it, curled up.
    key(0.26, wings(-6, -34), fly(-0.02, 0, 6), bend(10, 14), curl(12), legs(-1), SHUT),
    key(0.4, wings(-8, -38), fly(-0.025, 0, 7), bend(12, 16), curl(14), legs(-1.2), SHUT),
    // The flare: wings up and open, chest out, head up.
    snap(0.54, wings(36, 4), fly(0.03, -0.02, -8), bend(-8, -12), curl(-4), legs(0.8), GAPE),
    // Trembling with it.
    key(0.68, wings(38, 5), fly(0.035, -0.02, -9), bend(-8, -13, 0, 1.5), curl(-4), legs(0.8), GAPE),
    key(0.82, wings(34, 3), fly(0.03, -0.02, -8), bend(-9, -12, 0, -1.5), curl(-3), legs(0.8), GAPE),
    key(0.96, wings(38, 5), fly(0.035, -0.02, -9), bend(-8, -13, 0, 1), curl(-4), legs(0.6)),
    // Relaxing into its hover.
    key(1.16, wings(-10, -3), fly(0.015, 0, 0), bend(2, 2)),
    key(1.36, wings(10, 3), fly(0.006)),
    key(1.6),
  ],
  events: [{ t: 0.6, name: 'aura' }],
};

/**
 * Mimic (glare; status_target): it leans in at the foe, head low and
 * forward and antennae pricked at it, and stares it down with a slow sway,
 * studying it, then eases back.
 */
const statusTarget: Clip = {
  name: 'status_target',
  duration: 1.4,
  keys: [
    key(0),
    // Leaning in, antennae pricked.
    key(0.24, fly(0, 0.02, 7), bend(6, 12), antennae(18, 6), wings(-10, -2), SHUT),
    key(0.42, fly(0.004, 0.025, 8), bend(7, 13, 6), antennae(20, 8), wings(12, 3), SHUT),
    // Staring it down, a slow sway.
    key(0.66, fly(0, 0.028, 8), bend(7, 14, -6), antennae(22, 6), wings(-10, -2), SHUT),
    key(0.88, fly(0.006, 0.02, 6), bend(5, 11, 3), antennae(18, 4), wings(12, 3), SHUT),
    // Easing back.
    key(1.08, fly(0.012, 0, 0), bend(1, 2), antennae(4), wings(-10, -3)),
    key(1.4),
  ],
  events: [{ t: 0.38, name: 'emit' }],
};

/**
 * Toxic (powder): it rises a little over its place, raises its wings high,
 * then shakes its highly toxic powder down from them at the foe in heavy,
 * shuddering strokes (emit on the first), twice, and settles back down.
 */
const powder: Clip = {
  name: 'powder',
  duration: 1.8,
  keys: [
    key(0),
    // Rising, the wings raised high.
    key(0.2, fly(0.04, 0, -6), wings(36, 12), bend(-4, -6), curl(4), SHUT),
    // A shuddering downstroke shakes the powder off.
    snap(0.36, fly(0.05, 0, 3), wings(-20, -6), bend(4, 4), curl(-2), SHUT),
    key(0.48, fly(0.05, 0, 2), wings(-8, -2), bend(3, 3), SHUT),
    key(0.6, fly(0.048, 0, 3), wings(-22, -6), bend(4, 4), SHUT),
    // Again.
    key(0.76, fly(0.045, 0, -4), wings(32, 10), bend(-3, -5), curl(3), SHUT),
    snap(0.92, fly(0.05, 0, 3), wings(-22, -6), bend(4, 4), curl(-2), SHUT),
    key(1.04, fly(0.05, 0, 2), wings(-10, -2), bend(3, 3), SHUT),
    key(1.16, fly(0.048, 0, 3), wings(-22, -6), bend(4, 4), SHUT),
    // Settling back down.
    key(1.34, fly(0.025, 0, -1), wings(18, 6), bend(0, 0)),
    key(1.54, fly(0.012, 0, 1), wings(-10, -3)),
    key(1.8),
  ],
  events: [{ t: 0.38, name: 'emit' }],
};

/**
 * Protect, Light Screen, Harden, Substitute, Endure (shield): a flinch back
 * with the wings thrown up, then it wraps its wings forward round itself and
 * hunches behind them as the barrier forms, holding it with a tremor, and
 * opens up again.
 */
const shield: Clip = {
  name: 'shield',
  duration: 1.5,
  keys: [
    key(0),
    // A flinch back, the wings thrown up.
    key(0.14, fly(0.015, -0.02, -6), wings(30, 10), bend(-4, -6), SHUT),
    // Wrapped behind its wings.
    snap(0.28, fly(-0.01, 0, 5), wings(-6, -44), bend(8, 12), curl(10), legs(-1), SHUT),
    key(0.46, fly(-0.012, 0, 5), wings(-7, -46), bend(9, 13, 0, 1), curl(11), legs(-1), SHUT),
    key(0.66, fly(-0.008, 0, 4), wings(-5, -45), bend(8, 13, 0, -1), curl(10), legs(-1), SHUT),
    key(0.86, fly(-0.012, 0, 5), wings(-7, -46), bend(9, 13, 0, 1), curl(11), legs(-1), SHUT),
    // Opening up.
    key(1.06, fly(0.012, 0, -1), wings(20, 4), bend(0, 0)),
    key(1.26, fly(0.012, 0, 1), wings(-10, -3)),
    key(1.5),
  ],
  events: [{ t: 0.32, name: 'aura' }],
};

/**
 * Moonlight, Rest (heal): it rises and turns its face up to the night sky,
 * wings spread wide in a glide, and soaks in the moonlight on slow, gentle
 * beats with a calm sway (aura), then drifts back down.
 */
const heal: Clip = {
  name: 'heal',
  duration: 1.9,
  keys: [
    key(0),
    // Rising, turning its face up.
    key(0.3, fly(0.04, -0.02, -10), wings(24, 6), bend(-6, -14), antennae(-6, 8)),
    // Soaking in the light on slow beats.
    key(0.6, fly(0.06, -0.03, -14), wings(-4, -4), bend(-8, -24), antennae(-10, 12), SHUT),
    key(0.9, fly(0.065, -0.03, -14, 2), wings(12, 2), bend(-8, -25, 0, 3), antennae(-10, 12), swell(1.02), SHUT),
    key(1.2, fly(0.06, -0.03, -13, -2), wings(-4, -4), bend(-8, -24, 0, -3), antennae(-10, 12), swell(1.02), SHUT),
    // Drifting back down.
    key(1.46, fly(0.03, -0.01, -4), wings(16, 4), bend(-2, -4), antennae(-2)),
    key(1.66, fly(0.012, 0, 1), wings(-10, -3)),
    key(1.9),
  ],
  events: [{ t: 0.66, name: 'aura' }],
};

/**
 * Sunny Day (weather): it gathers itself with its wings drawn down, then
 * flings them up high and throws its head back to the sky with a cry,
 * calling the sun, holds it on small beats, and comes back down.
 */
const weather: Clip = {
  name: 'weather',
  duration: 1.7,
  keys: [
    key(0),
    // Gathering.
    key(0.24, fly(-0.02, 0, 6), wings(-16, -6), bend(8, 10), curl(6), SHUT),
    // Calling the sun: wings flung high, head thrown back.
    snap(0.46, fly(0.04, -0.02, -12), wings(42, 6), bend(-10, -26), curl(-4), GAPE),
    key(0.66, fly(0.045, -0.02, -12, 2), wings(34, 4), bend(-10, -27, 0, 3), GAPE),
    key(0.86, fly(0.04, -0.02, -12, -2), wings(42, 6), bend(-10, -26, 0, -3), GAPE),
    key(1.06, fly(0.04, -0.02, -11), wings(34, 4), bend(-9, -24), SHUT),
    // Back down.
    key(1.26, fly(0.015, 0, 0), wings(-12, -4), bend(2, 2)),
    key(1.46, fly(0.006), wings(10, 3)),
    key(1.7),
  ],
  events: [{ t: 0.52, name: 'aura' }],
};

/**
 * Attract, Swagger (charm): a showy flutter at the foe: it cocks its head
 * with a smirk and sways one way, then the other on quick, flirty beats,
 * then puffs its chest out, wings raised, and holds it, smug.
 */
const charm: Clip = {
  name: 'charm',
  duration: 1.5,
  keys: [
    key(0),
    // A cocked head and a sway, on quick beats.
    key(0.2, fly(0.02, 0, -6, -8), wings(20, 6), bend(-6, -6, 0, 12), SMILE),
    key(0.32, fly(0.024, 0, -5, -6), wings(-8, -2), bend(-6, -6, 0, 12), SMILE),
    snap(0.44, fly(0.03, 0, -6, 8), wings(24, 8), bend(-6, -6, 0, -12), SMILE),
    key(0.56, fly(0.032, 0, -5, 6), wings(-8, -2), bend(-6, -6, 0, -12), SMILE),
    // Chest out, wings raised, smug.
    key(0.7, fly(0.03, 0, -10, -4), wings(28, 4), bend(-10, -10, 0, 8), curl(-4), SMILE),
    key(0.9, fly(0.034, 0, -10, -5), wings(22, 4), bend(-10, -11, 4, 9), curl(-4), SMILE),
    // Relaxing.
    key(1.1, fly(0.012, 0, 0), wings(-10, -3), bend(0, 0)),
    key(1.3, fly(0.006), wings(8, 2)),
    key(1.5),
  ],
  events: [{ t: 0.46, name: 'emit' }],
};

/**
 * Double Team (afterimage): it darts from side to side on quick, hard beats,
 * banking into each dart, too fast to follow (the afterimages run from the
 * aura), and settles back where it was.
 */
const afterimage: Clip = {
  name: 'afterimage',
  duration: 1.7,
  keys: [
    key(0),
    key(0.1, fly(0.01, 0, 0, 6), wings(28, 10), bend(2, 2), SHUT),
    // Darting aside and back, banking into each.
    key(0.2, fly(0.02, 0, 0, -10, 0.14), wings(-18, -6), SHUT),
    key(0.3, fly(0.012, 0, 0, -6, 0.16), wings(24, 8), SHUT),
    key(0.42, fly(0.02, 0, 0, 10, -0.02), wings(-18, -6), SHUT),
    key(0.52, fly(0.012, 0, 0, 6, -0.16), wings(24, 8), SHUT),
    key(0.64, fly(0.02, 0, 0, -10, 0.01), wings(-18, -6), SHUT),
    key(0.74, fly(0.012, 0, 0, -6, 0.15), wings(24, 8), SHUT),
    key(0.86, fly(0.02, 0, 0, 10, -0.01), wings(-18, -6), SHUT),
    key(0.96, fly(0.012, 0, 0, 6, -0.14), wings(24, 8), SHUT),
    key(1.1, fly(0.018, 0, 0, -6, -0.03), wings(-16, -5)),
    // Settling where it was.
    key(1.24, fly(0.01, 0, 0, 2, 0), wings(16, 5)),
    key(1.44, fly(0.012, 0, 1), wings(-10, -3)),
    key(1.7),
  ],
  events: [{ t: 0.18, name: 'aura' }],
};

/**
 * Flash (flash): it folds its wings back over itself and curls in, eyes on
 * the ground, gathering the light, then flares its wings open wide at the
 * foe, chest out (emit: the screen flashes white), holds the flare and
 * relaxes.
 */
const flash: Clip = {
  name: 'flash',
  duration: 1.3,
  keys: [
    key(0),
    // Folded in, gathering.
    key(0.18, wings(26, 30), fly(-0.02, -0.02, 6), bend(12, 16), curl(12), legs(-1), SHUT),
    key(0.34, wings(30, 34), fly(-0.025, -0.02, 7), bend(14, 18), curl(14), legs(-1.2), SHUT),
    // The flare at the foe.
    snap(0.44, wings(20, -16), fly(0.02, 0.02, -4), bend(-6, -8), curl(-4), legs(0.8), GAPE),
    key(0.6, wings(22, -14), fly(0.024, 0.02, -5), bend(-6, -9, 0, 2), curl(-4), legs(0.8), GAPE),
    key(0.78, wings(18, -16), fly(0.02, 0.018, -4), bend(-5, -8, 0, -2), curl(-3), legs(0.6)),
    // Relaxing.
    key(0.98, wings(-8, -4), fly(0.012, 0, 0), bend(0, 0)),
    key(1.14, wings(8, 2), fly(0.006)),
    key(1.3),
  ],
  events: [{ t: 0.46, name: 'emit' }],
};

export const STATUS: Clip[] = [statusSelf, statusTarget, powder, shield, heal, weather, charm, afterimage, flash];
