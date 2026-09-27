// The throw and the burrow: Seismic Toss (seize the foe, spring up and back
// with it spinning, hurl it down into its own place) and Dig (the first turn
// dives into the ground and stays there; the strike tunnels over, bursts up
// under the foe and hops home). Written in Sceptile's time; underground and
// thrown heights are the engine's own (root.y in heights), not the kit's
// spring.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

/**
 * Seismic Toss: a springy dash in with the claws flung open; it clamps on the
 * foe (grab) and sinks, the tail pressing down, to spring up and back toward
 * mid-field with the foe hugged low in front (never overhead: our Pokémon is
 * near the camera), spinning round with it; then the whole body whips
 * forward and down to hurl the foe back into its own place (throw), where it
 * crashes (impact) in both views while it lands at advance 0.4 and watches,
 * the tail swishing; then home.
 */
export function seismicToss(L: Line): Clip {
  const k = L.k;
  return L.clip('seismic_toss', 2.02, [
    L.key(0),
    // Wind up: a quick crouch, forearms drawn back, the tail lifting behind.
    L.key(0.12, L.pelvis(0, -0.06), k.bend(18, 5, 0, -8), k.FOCUS, k.tail(14), L.both('elbowsBack'), k.SPLAYED),
    // Spring in low, pitched forward, claws flung open.
    L.key(0.26, L.at(0.65), L.air(0.07), L.root({ pitch: 12 }), L.legs('tuck'), k.bend(16, 4, 0, -12), k.ANGRY, k.tail(26), L.both('grabWide'), k.SPLAYED),
    // Land at the foe, hands on it.
    L.key(0.34, L.at(1), k.LAND, k.bend(16, 4, 0, -10), k.ANGRY, k.tail(20), L.both('grabWide'), k.SPLAYED),
    // Clamp on (grab), the hands closing.
    L.key(0.44, L.at(1), L.pelvis(0, -0.07), k.bend(22, 6, 0, -12), k.ANGRY, k.tail(0), L.both('clamp'), k.FISTS),
    // Load: sink deep with it, the tail pressed down to spring off it.
    L.key(0.54, L.at(1), L.pelvis(0, -0.1), k.bend(20, 6, 0, -14), k.ANGRY, k.tail(-20), L.both('clamp'), k.FISTS),
    // Spring up and back, hugging the foe low in front, starting to spin.
    L.key(0.68, L.at(0.84), L.root({ y: 0.17, yaw: 60 }), L.legs('hop'), L.pelvis(0, -0.02), k.bend(-2, -2, -2, -12), k.ANGRY, k.tail(30), L.both('carry'), k.FISTS),
    // Spinning round with it at the top, the tail streaming out.
    L.key(0.81, L.at(0.62), L.root({ y: 0.21, yaw: 228 }), L.legs('hop'), L.pelvis(0, -0.02), k.bend(-4, -3, -2, -14), k.ANGRY, k.tail(36, -16), L.both('carry'), k.FISTS),
    // Facing its place again, leaning back and heaving it up to hurl.
    L.key(0.91, L.at(0.44), L.root({ y: 0.21, yaw: 360 }), L.legs('hop'), k.bend(-10, -6, -6, -18), k.ANGRY, k.tail(40), L.both('hoist'), k.FISTS),
    // The hurl: the whole body whips forward and down with it, the tail flicking up.
    L.snap(0.99, L.at(0.4), L.root({ y: 0.04, yaw: 360 }), L.legs('drop'), L.pelvis(0, -0.02), k.bend(34, 16, 4, 4), k.ANGRY, k.tail(46, 14), L.both('hurl')),
    // Land deep where it is, arms still down; watch it crash from the crouch, the tail swishing.
    L.key(1.1, L.at(0.4), L.root({ yaw: 360 }), k.LAND, L.pelvis(0, -0.08), k.bend(30, 12, 2, 2), k.ANGRY, k.tail(14, 10), L.both('hurl')),
    L.key(1.32, L.at(0.4), L.root({ yaw: 360 }), k.LAND, L.pelvis(0, -0.085), k.bend(28, 11, 2, 0), k.ANGRY, k.tail(8, -10), L.both('hurlLow')),
    // Straighten into its stance, then hop home.
    L.key(1.47, L.at(0.4), L.root({ yaw: 360 }), L.pelvis(0, -0.03), k.bend(10, 2, 0, 0), k.ANGRY, k.tail(4, 6), L.both('guard')),
    L.key(1.6, L.at(0.18), L.air(0.065), L.root({ yaw: 360 }), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.72, L.at(0), L.root({ yaw: 360 }), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(2.02, L.root({ yaw: 360 }), k.OPEN),
  ], [{ t: 0.4, name: 'grab' }, { t: 1.02, name: 'throw' }, { t: 1.22, name: 'impact' }]);
}

/** Underground (nothing to stand on): pitched, out of sight. */
const under = (L: Line, a: number, y: number, pitch: number) => [L.at(a), L.root({ y, pitch }), L.legs('drop')];

/**
 * Dig, the first turn: a crouch with its eyes on the ground ahead, a springy
 * hop, and a head-first dive into the ground, arms overhead together (dig:
 * the dirt flies as it goes in, the tail last); it stays down there.
 */
export function digCharge(L: Line): Clip {
  const k = L.k;
  return L.clip('dig_charge', 1.1, [
    L.key(0),
    // Crouch, eyes on the ground ahead, forearms drawn back, the tail loading.
    L.key(0.12, L.pelvis(0, -0.09), k.bend(24, 7, 2, 18), k.FOCUS, k.tail(16), L.both('elbowsBack')),
    // Spring up and tip forward, the arms swinging overhead.
    L.key(0.22, L.at(0.04), L.air(0.14), L.root({ pitch: 35 }), L.legs('tuck'), k.bend(4, 0, 0, 4), k.ANGRY, k.tail(24), L.both('dive')),
    L.key(0.3, L.at(0.06), L.air(0.16), L.root({ pitch: 75 }), L.legs('drop'), k.bend(0, 0, 0, 2), k.ANGRY, k.tail(20), L.both('dive')),
    // Head and arms into the ground (dig), the body following, gathering speed.
    L.key(0.38, ...under(L, 0.07, -0.05, 108), k.bend(0, 0, 0, 2), k.ANGRY, k.tail(10), L.both('dive')),
    L.fall(0.54, ...under(L, 0.1, -1.3, 125), k.bend(0, 0, 0, 2), k.ANGRY, k.tail(4), L.both('dive')),
    // Down there, out of sight, until the next turn.
    L.key(0.8, ...under(L, 0.1, -1.32, 124), k.bend(2, 0, 0, 2), k.ANGRY, k.tail(2), L.both('dive')),
    L.key(1.1, ...under(L, 0.1, -1.32, 122), k.bend(4, 1, 0, 0), k.ANGRY, k.tail(0), L.both('dive')),
  ], [{ t: 0.32, name: 'dig' }]);
}

/**
 * Dig, the strike: from underground at home it tunnels over to the foe (the
 * ground heaving along its way), rights itself under it and bursts up with a
 * rising cut of the right forearm, the tail trailing out of the ground
 * (impact as it breaks the surface); drops straight down in front of it,
 * holds the crouch and hops home.
 */
export function dig(L: Line): Clip {
  const k = L.k;
  const riseLegs = L.legs('rise');
  return L.clip('dig', 1.56, [
    L.key(0, ...under(L, 0.1, -1.32, 122), k.bend(4, 1, 0, 0), k.ANGRY, k.tail(0), L.both('dive')),
    // Tunnelling over to the foe, righting itself on the way.
    L.key(0.1, ...under(L, 0.3, -1.32, 100), k.bend(6, 2, 0, 0), k.ANGRY, k.tail(0), L.both('dive')),
    L.key(0.22, ...under(L, 0.75, -1.32, 55), k.bend(10, 3, 0, -2), k.ANGRY, k.tail(-2), L.arms('bladeLow', 'guardLow')),
    // Under the foe, gathering to burst up.
    L.key(0.32, ...under(L, 1, -1.12, 20), L.pelvis(0, -0.06), k.bend(20, 6, 0, -8), k.ANGRY, k.tail(-6), L.arms('bladeLow', 'guardLow')),
    // Burst up under the foe, the right forearm cutting up through it, the tail trailing.
    L.snap(0.44, L.at(1), L.root({ y: 0.24 }), riseLegs, L.pelvis(0, 0.02), k.twist(10), k.bend(-8, -6, -4, -16), k.ANGRY, k.tail(-40, 25), L.arms('risingBlade', 'guardLow')),
    L.key(0.56, L.at(0.9), L.root({ y: 0.28 }), riseLegs, L.pelvis(0, 0.02), k.twist(12), k.bend(-10, -6, -4, -18), k.ANGRY, k.tail(-30, 15), L.arms('risingBlade', 'guardLow')),
    // Drop straight down in front of it and hold the crouch, the tail swishing.
    L.fall(0.72, L.at(0.88), k.LAND, L.pelvis(0, -0.06), k.bend(20, 4, 0, -6), k.ANGRY, k.tail(8, 10), L.both('guard')),
    L.key(1.02, L.at(0.88), L.pelvis(0, -0.03), k.bend(10, 2, 0, 0), k.ANGRY, k.tail(4, -8), L.both('guard')),
    // Hop home.
    L.key(1.14, L.at(0.44), L.air(0.07), L.legs('hop'), k.bend(8, 0, 0, 0), k.ANGRY, k.tail(10), L.both('guard')),
    L.key(1.26, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(1.56, k.OPEN),
  ], [{ t: 0.2, name: 'dig' }, { t: 0.37, name: 'impact' }]);
}

export const GRAPPLES = { seismic_toss: seismicToss, dig_charge: digCharge, dig };
