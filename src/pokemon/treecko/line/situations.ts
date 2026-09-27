// Situations: everything a battle puts it through besides its moves (src/battle3d/situations.ts):
// being hit, dodging, shrugging a move off, going home after a run of hits,
// each status condition, the states that loop instead of idle (asleep, worn
// down), stat changes, levelling up, being drained or healed, Focus Punch's
// focus, hanging on, flinching, recharging, waking, shaking a condition off,
// breaking out of a Poké Ball and each weather. Written in Sceptile's time.
// All stay at home (clear of the healthboxes: sidesteps go to its left, the
// side away from both boxes; nothing drops far forward) except return_home.
//
// idle, intro, hit and faint (the moments every battle plays) are here for a
// species without its own; Sceptile and Treecko keep theirs.

import type { Clip } from '../../../anim/clip';
import type { Line } from './kit';

// The moments.

/** Idle: the ninja's ready crouch, alive: breathing, the weight shifting from foot to foot, the tail swaying (loops). */
export function idle(L: Line): Clip {
  const k = L.k;
  return L.clip('idle', 2.4, [
    L.key(0),
    L.key(0.6, L.pelvis(0.006, -0.008), k.bend(1.5, 0.5, 0, -1), k.tail(2, 6), L.both('stance')),
    L.key(1.2, L.pelvis(0, -0.012), k.bend(2.5, 1, 0, -1.5, 2), k.tail(3, 0)),
    L.key(1.8, L.pelvis(-0.006, -0.008), k.bend(1.5, 0.5, 0, -1), k.tail(2, -6)),
    L.key(2.4),
  ], [], { loop: true });
}

/** Intro: curled up low behind its crossed arms, eyes shut; it springs up into its cry, arms flung wide and the tail raised, holds it (moving), and settles into its stance. */
export function intro(L: Line): Clip {
  const k = L.k;
  return L.clip('intro', 1.6, [
    L.key(0, L.pelvis(0, -0.07), k.bend(20, 6, 4, 18), k.SHUT, k.tail(-8), L.both('crossedLow')),
    L.key(0.2, L.pelvis(0, -0.085), k.bend(24, 7, 5, 22), k.SHUT, k.tail(-12), L.both('crossedLow')),
    // The cry.
    L.snap(0.4, L.pelvis(0, 0.012), k.bend(-8, -4, -4, -10), k.ANGRY, k.jaw(30), k.tail(34), L.both('spread'), k.SPLAYED),
    L.key(0.6, L.pelvis(0, 0.01), k.bend(-7, -4, -4, -9, 3, 4), k.ANGRY, k.jaw(28), k.tail(31, 6), L.both('spread'), k.SPLAYED),
    L.key(0.8, L.pelvis(0, 0.012), k.bend(-8, -4, -4, -10, -3, -4), k.ANGRY, k.jaw(30), k.tail(29, -6), L.both('spread'), k.SPLAYED),
    L.key(1.0, L.pelvis(0, 0.004), k.bend(-3, -2, -1, -3), k.ANGRY, k.jaw(6), k.tail(16), L.both('guard')),
    L.key(1.24, L.pelvis(0, -0.014), k.bend(5, 2, 0, 2), k.ANGRY, k.tail(4)),
    L.key(1.6, k.OPEN),
  ], [{ t: 0.46, name: 'cry' }]);
}

/** Hit: snaps away from the blow within a few frames, wincing, eases back with a small overshoot and settles. */
export function hit(L: Line): Clip {
  const k = L.k;
  return L.clip('hit', 0.6, [
    L.key(0),
    L.snap(0.05, L.pelvis(0, 0, -0.012), k.bend(-14, -6, -4, -16), k.HURT, k.tail(12), L.both('flinch'), k.SPLAYED),
    L.key(0.2, L.pelvis(0, 0, -0.016), k.bend(-6, -2, -2, -8), k.HURT, k.tail(6), L.both('flinch')),
    L.key(0.36, L.pelvis(0, 0, -0.008), k.bend(4, 1, 0, 4), k.HURT, k.tail(2)),
    L.key(0.6, k.OPEN),
  ]);
}

/**
 * Faint: worn out, not dying: a tired sway with the arms dropping, then it
 * sinks back onto its heels and curls over hugging itself, head bowed and
 * the tail curling round, eyes shut; from the 'shrink' the curled body
 * shrinks away. It sits back over its heels as it curls (clear of our
 * healthbox), never toppling.
 */
export function faint(L: Line): Clip {
  const k = L.k;
  return L.clip('faint', 1.7, [
    L.key(0),
    L.key(0.18, L.root({ z: -0.02 }), k.bend(-8, -4, -4, -12), k.DROWSY, k.tail(4), L.both('droop')),
    L.key(0.48, L.pelvis(0, -0.07), L.root({ z: -0.04 }), k.bend(12, 5, 6, 14), k.SHUT, k.tail(6, -14), L.both('crossedLow')),
    L.key(0.82, L.pelvis(0, -0.14), L.root({ z: -0.07 }), k.bend(22, 9, 10, 20), k.SHUT, k.tail(12, -26), L.both('crossedLow')),
    L.key(0.96, L.pelvis(0, -0.15), L.root({ z: -0.07 }), k.bend(24, 10, 11, 22), k.SHUT, k.tail(13, -28), L.both('crossedLow')),
    L.key(1.7, L.pelvis(0, -0.146), L.root({ z: -0.07 }), k.bend(23, 9, 10, 21), k.SHUT, k.tail(13, -27), L.both('crossedLow')),
  ], [{ t: 1.04, name: 'shrink' }]);
}

// Engaging the foe.

/** Hit strong: knocked right back, it staggers a step back on its heels, arms flung up, then catches itself and recovers. */
export function hitStrong(L: Line): Clip {
  const k = L.k;
  return L.clip('hit_strong', 1.1, [
    L.key(0),
    L.snap(0.05, L.pelvis(0, 0.005, -0.02), k.bend(-20, -8, -6, -22), k.HURT, k.jaw(14), k.tail(18), L.both('flinch'), k.SPLAYED),
    // A step back to catch itself.
    L.key(0.2, L.root({ z: -0.03, y: 0.03 * k.spring }), L.pelvis(0, -0.012 * k.spring, -0.02), k.bend(-14, -6, -4, -16, 6, 6), k.HURT, k.jaw(8), k.tail(14, 8), L.both('spread')),
    L.key(0.36, L.root({ z: -0.05 }), L.pelvis(0, -0.05, -0.01), k.bend(10, 3, 0, 6, 0, -4), k.HURT, k.tail(4, -6), L.both('low')),
    L.key(0.56, L.root({ z: -0.05 }), L.pelvis(0, -0.04), k.bend(6, 2, 0, 2), k.ANGRY, k.tail(4), L.both('guard')),
    // Back to its place.
    L.key(0.72, L.root({ z: -0.02, y: 0.025 * k.spring }), L.pelvis(0, -0.01 * k.spring), k.bend(4, 1, 0, 0), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(0.86, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.ANGRY, k.tail(3)),
    L.key(1.1, k.OPEN),
  ]);
}

/** Dodge: a quick, low sidestep hop to its left, leaning away, then a hop back to its place on guard. */
export function dodge(L: Line): Clip {
  const k = L.k;
  return L.clip('dodge', 0.9, [
    L.key(0),
    L.key(0.06, L.pelvis(-0.015, -0.045), k.twist(0, 6), k.bend(8, 2, 0, -4), k.WIDE, k.tail(4, -6)),
    // Hop aside, leaning away.
    L.snap(0.16, L.root({ x: 0.14, y: 0.05 * k.spring }), L.pelvis(0, -0.02 * k.spring), k.twist(-8, 12), k.bend(6, 2, 0, -6, 10), k.FOCUS, k.tail(12, -18), L.both('guard')),
    L.key(0.26, L.root({ x: 0.16 }), k.LAND, k.twist(-6, 8), k.FOCUS, k.tail(6, -12), L.both('guard')),
    L.key(0.4, L.root({ x: 0.16 }), L.pelvis(0, -0.04), k.twist(-4, 4), k.bend(8, 2, 0, -4, 8), k.FOCUS, k.tail(6, -6), L.both('guard')),
    // And back.
    L.key(0.52, L.root({ x: 0.06, y: 0.04 * k.spring }), L.pelvis(0, -0.016 * k.spring), k.twist(4, -6), k.bend(4, 1, 0, -2), k.FOCUS, k.tail(10, 10), L.both('guard')),
    L.key(0.62, k.LAND, k.FOCUS, k.tail(4, 6), L.both('guard')),
    L.key(0.9, k.OPEN),
  ]);
}

/** Unaffected: it stands firm, unimpressed: a shrug with the palms turned up, the head tilted, eyes half shut, a flick of the tail. */
export function unaffected(L: Line): Clip {
  const k = L.k;
  return L.clip('unaffected', 1.3, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.01), k.bend(-2, -2, 0, -4), k.DROWSY, k.tail(4), L.both('guardLow')),
    // The shrug.
    L.key(0.36, L.pelvis(0, 0.008), k.bend(-6, -3, 0, -6, 8, 10), k.DROWSY, k.tail(8, 12), L.both('palmsUp'), k.SPLAYED),
    L.key(0.62, L.pelvis(0, 0.006), k.bend(-5, -3, 0, -5, 10, 12), k.DROWSY, k.tail(8, -12), L.both('palmsUp'), k.SPLAYED),
    L.key(0.86, L.pelvis(0, -0.01), k.bend(2, 0, 0, -2, 4), k.FOCUS, k.tail(4, 6), L.both('guard')),
    L.key(1.3, k.OPEN),
  ]);
}

/** Return home: at the foe after a run of hits, in its guard: it pushes off, leaps home and lands, settling to its stance. */
export function returnHome(L: Line): Clip {
  const k = L.k;
  return L.clip('return_home', 0.9, [
    L.key(0, L.at(1), L.pelvis(0, -0.035), k.bend(12, 2, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(0.1, L.at(1), L.pelvis(0, -0.06), k.bend(16, 4, 0, -4), k.ANGRY, k.tail(2), L.both('guard')),
    L.key(0.24, L.at(0.5), L.air(0.08), L.legs('hop'), k.bend(6, 0, 0, 0), k.ANGRY, k.tail(12), L.both('guard')),
    L.key(0.38, L.at(0), k.LAND, k.LIGHT, k.ANGRY, k.tail(2), L.both('guard')),
    L.key(0.6, L.pelvis(0, -0.015), k.bend(3, 0, 0, -1), k.FOCUS, k.tail(2)),
    L.key(0.9, k.OPEN),
  ]);
}

// Status conditions (inflicted, or each turn it acts under one).

/** Sleep: drowsy, it sways, eyelids drooping, head sinking, then nods off, slow breaths (it sleeps on in idle_asleep). */
export function statusSleep(L: Line): Clip {
  const k = L.k;
  return L.clip('status_sleep', 1.8, [
    L.key(0),
    L.key(0.3, L.pelvis(0.01, -0.02), k.bend(6, 2, 0, 8, 0, 6), k.DROWSY, k.jaw(10), k.tail(0, 6), L.both('guardLow')),
    L.key(0.66, L.pelvis(-0.01, -0.04), k.bend(12, 4, 2, 14, 0, -4), k.DROWSY, k.tail(-2, -6), L.both('droop')),
    L.key(1.0, L.pelvis(0, -0.06), k.bend(18, 6, 2, 18, 0, 8), k.SHUT, k.tail(-6, 4), L.both('droop')),
    L.key(1.3, L.pelvis(0, -0.055), k.bend(16, 5, 2, 16, 0, 6), k.SHUT, k.tail(-5, -2), L.both('droop')),
    L.key(1.56, L.pelvis(0, -0.03), k.bend(8, 2, 0, 8, 0, 3), k.SHUT, k.tail(-2)),
    L.key(1.8, k.OPEN),
  ]);
}

/** Poison: a sickly shudder, hunched over its middle, wincing, a hand to its stomach. */
export function statusPoison(L: Line): Clip {
  const k = L.k;
  return L.clip('status_poison', 1.4, [
    L.key(0),
    L.snap(0.1, L.pelvis(0, -0.04), k.bend(18, 6, 0, 10, 0, 4), k.HURT, k.jaw(8), k.tail(-4), L.both('hug')),
    // The shudder.
    L.key(0.22, L.pelvis(0.01, -0.045), k.bend(20, 6, 0, 12, 4, -4), k.HURT, k.jaw(12), k.tail(-4, 8), L.both('hug')),
    L.key(0.34, L.pelvis(-0.01, -0.045), k.bend(20, 6, 0, 12, -4, 4), k.HURT, k.jaw(10), k.tail(-4, -8), L.both('hug')),
    L.key(0.46, L.pelvis(0.008, -0.044), k.bend(19, 6, 0, 11, 3, -3), k.HURT, k.jaw(12), k.tail(-4, 6), L.both('hug')),
    L.key(0.7, L.pelvis(0, -0.035), k.bend(14, 4, 0, 8, 0, 6), k.DROWSY, k.jaw(4), k.tail(-2), L.arms('hug', 'droop')),
    L.key(1.0, L.pelvis(0, -0.02), k.bend(6, 2, 0, 2), k.FOCUS, k.tail(2)),
    L.key(1.4, k.OPEN),
  ]);
}

/** Burn: it flinches from the burn, clutching at it and hopping on the spot, then shakes it off. */
export function statusBurn(L: Line): Clip {
  const k = L.k;
  return L.clip('status_burn', 1.4, [
    L.key(0),
    L.snap(0.06, L.pelvis(0, 0.005), k.bend(-10, -4, -2, -12, 0, 6), k.HURT, k.jaw(18), k.tail(14), L.arms('flinch', 'hug')),
    // A pained hop on the spot, clutching its arm.
    L.key(0.18, L.air(0.04), L.pelvis(0, -0.016 * k.spring), k.bend(-6, -2, 0, -8, 6, -4), k.HURT, k.jaw(20), k.tail(18, 8), L.arms('hug', 'flinch')),
    L.key(0.3, k.LAND, k.bend(10, 3, 0, 4, -4, 4), k.HURT, k.jaw(8), k.tail(6, -8), L.arms('hug', 'flinch')),
    // Shakes it off: the arms flung out and shaken.
    L.key(0.46, L.pelvis(0, -0.03), k.bend(6, 2, 0, 0, 10, 4), k.SHUT, k.tail(8, 10), L.both('low')),
    L.key(0.58, L.pelvis(0, -0.03), k.bend(6, 2, 0, 0, -10, -4), k.SHUT, k.tail(8, -10), L.both('guardLow')),
    L.key(0.7, L.pelvis(0, -0.03), k.bend(6, 2, 0, 0, 8, 3), k.SHUT, k.tail(8, 8), L.both('low')),
    L.key(0.96, L.pelvis(0, -0.02), k.bend(4, 1, 0, -2), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.4, k.OPEN),
  ]);
}

/** Paralysis: it seizes up, rigid, arms locked out before it and fingers splayed, twitching in jerks, then slumps free. */
export function statusParalysis(L: Line): Clip {
  const k = L.k;
  return L.clip('status_paralysis', 1.4, [
    L.key(0),
    // Seized: rigid, arms locked out, eyes wide.
    L.snap(0.06, L.pelvis(0, 0.008), k.bend(-6, -4, -2, -8), k.WIDE, k.jaw(16), k.tail(20), L.both('flinch'), k.SPLAYED),
    // Twitching in jerks.
    L.key(0.14, L.pelvis(0.006, 0.006), k.bend(-4, -3, -2, -6, 4, 4), k.WIDE, k.jaw(10), k.tail(24, 6), L.both('clawsUp'), k.SPLAYED),
    L.key(0.22, L.pelvis(-0.006, 0.008), k.bend(-7, -4, -2, -9, -4, -4), k.HURT, k.jaw(18), k.tail(18, -6), L.both('flinch'), k.SPLAYED),
    L.key(0.3, L.pelvis(0.005, 0.006), k.bend(-4, -3, -2, -6, 4, 3), k.WIDE, k.jaw(10), k.tail(24, 6), L.both('clawsUp'), k.SPLAYED),
    L.key(0.38, L.pelvis(-0.005, 0.008), k.bend(-7, -4, -2, -9, -3, -4), k.HURT, k.jaw(18), k.tail(18, -6), L.both('flinch'), k.SPLAYED),
    L.key(0.5, L.pelvis(0.004, 0.006), k.bend(-5, -3, -2, -7, 3, 2), k.WIDE, k.jaw(12), k.tail(22, 4), L.both('clawsUp'), k.SPLAYED),
    // Slumps free.
    L.key(0.72, L.pelvis(0, -0.05), k.bend(16, 4, 0, 10, 0, 6), k.HURT, k.jaw(6), k.tail(-4), L.both('droop')),
    L.key(1.02, L.pelvis(0, -0.025), k.bend(6, 2, 0, 2), k.FOCUS, k.tail(2), L.both('guardLow')),
    L.key(1.4, k.OPEN),
  ]);
}

/** Freeze: locked still in the ice, hunched and stiff, eyes shut; it strains against it, trembling, and can't move. */
export function statusFreeze(L: Line): Clip {
  const k = L.k;
  return L.clip('status_freeze', 1.5, [
    L.key(0),
    L.snap(0.08, L.pelvis(0, -0.03), k.bend(8, 3, 0, 4), k.SHUT, k.tail(-2), L.both('hug'), k.FISTS),
    // Straining: small, tight trembles.
    L.key(0.3, L.pelvis(0.004, -0.032), k.bend(9, 3, 0, 5, 2, 1), k.SHUT, k.tail(-2, 2), L.both('hug'), k.FISTS),
    L.key(0.5, L.pelvis(-0.004, -0.032), k.bend(9, 3, 0, 5, -2, -1), k.ANGRY, k.jaw(6), k.tail(-2, -2), L.both('hug'), k.FISTS),
    L.key(0.7, L.pelvis(0.005, -0.033), k.bend(10, 3, 0, 5, 2, 1), k.ANGRY, k.jaw(8), k.tail(-2, 3), L.both('hug'), k.FISTS),
    L.key(0.9, L.pelvis(-0.004, -0.032), k.bend(9, 3, 0, 5, -2, -1), k.SHUT, k.jaw(4), k.tail(-2, -2), L.both('hug'), k.FISTS),
    L.key(1.14, L.pelvis(0, -0.02), k.bend(5, 2, 0, 2), k.SHUT, k.tail(0), L.both('crossedLow')),
    L.key(1.5, k.OPEN),
  ]);
}

/** Confusion: it wobbles off balance, head swimming in circles, a stumbling step to the side and back. */
export function statusConfusion(L: Line): Clip {
  const k = L.k;
  return L.clip('status_confusion', 1.7, [
    L.key(0),
    L.key(0.2, L.pelvis(0.02, -0.02), k.twist(8, 8), k.bend(2, 0, 4, 4, 14, 12), k.DROWSY, k.tail(6, 14), L.both('low')),
    L.key(0.44, L.pelvis(0, -0.03), k.twist(0, 0), k.bend(6, 2, 4, -6, 0, 16), k.DROWSY, k.jaw(10), k.tail(8, 0), L.both('low')),
    // A stumbling step to its left.
    L.key(0.62, L.root({ x: 0.05, y: 0.025 * k.spring }), L.pelvis(-0.02, -0.02 - 0.01 * k.spring), k.twist(-8, -10), k.bend(4, 0, 4, 4, -14, -12), k.DROWSY, k.tail(6, -14), L.both('low')),
    L.key(0.8, L.root({ x: 0.06 }), L.pelvis(0, -0.035), k.bend(8, 2, 4, 8, 0, -16), k.HURT, k.jaw(6), k.tail(4, 4), L.both('low')),
    // ... and back.
    L.key(1.0, L.root({ x: 0.02, y: 0.02 * k.spring }), L.pelvis(0.02, -0.02 - 0.008 * k.spring), k.twist(8, 10), k.bend(2, 0, 4, 2, 14, 12), k.DROWSY, k.tail(6, 14), L.both('low')),
    L.key(1.2, L.pelvis(0, -0.02), k.bend(4, 1, 2, 2, 6, 4), k.DROWSY, k.tail(4), L.both('guardLow')),
    L.key(1.42, L.pelvis(0, -0.015), k.bend(3, 0, 0, -1), k.FOCUS, k.tail(2)),
    L.key(1.7, k.OPEN),
  ]);
}

/** Infatuation: lovestruck, it sways dreamily, hands clasped at its chest, head tilted and eyes happy, distracted from the fight. */
export function statusInfatuation(L: Line): Clip {
  const k = L.k;
  return L.clip('status_infatuation', 1.8, [
    L.key(0),
    L.key(0.24, L.pelvis(0.012, -0.015), k.twist(6, 6), k.bend(0, 0, 2, 0, 8, 14), k.HAPPY, k.tail(8, 14), L.both('hug')),
    L.key(0.6, L.pelvis(-0.012, -0.015), k.twist(-6, -6), k.bend(0, 0, 2, 0, -8, -14), k.HAPPY, k.tail(8, -14), L.both('hug')),
    L.key(0.96, L.pelvis(0.012, -0.015), k.twist(6, 6), k.bend(0, 0, 2, 0, 8, 14), k.HAPPY, k.tail(8, 14), L.both('hug')),
    L.key(1.28, L.pelvis(0, -0.02), k.bend(2, 0, 0, 0, 0, 6), k.DROWSY, k.tail(4), L.both('guardLow')),
    L.key(1.8, k.OPEN),
  ]);
}

/** Curse: hunched in pain under it, clutching its head, doubled over and shaking. */
export function statusCurse(L: Line): Clip {
  const k = L.k;
  return L.clip('status_curse', 1.5, [
    L.key(0),
    L.snap(0.08, L.pelvis(0, -0.05), k.bend(22, 8, 4, 14), k.HURT, k.jaw(12), k.tail(-8), L.both('cover'), k.FISTS),
    L.key(0.3, L.pelvis(0, -0.065), k.bend(26, 9, 4, 18, 4, 4), k.HURT, k.jaw(16), k.tail(-10, 6), L.both('cover'), k.FISTS),
    L.key(0.5, L.pelvis(0, -0.07), k.bend(27, 9, 4, 18, -4, -4), k.SHUT, k.jaw(14), k.tail(-10, -6), L.both('cover'), k.FISTS),
    L.key(0.7, L.pelvis(0, -0.066), k.bend(26, 9, 4, 17, 3, 3), k.HURT, k.jaw(16), k.tail(-10, 5), L.both('cover'), k.FISTS),
    L.key(0.98, L.pelvis(0, -0.035), k.bend(10, 3, 0, 6), k.HURT, k.tail(-2), L.both('droop')),
    L.key(1.22, L.pelvis(0, -0.02), k.bend(4, 1, 0, 1), k.FOCUS, k.tail(2)),
    L.key(1.5, k.OPEN),
  ]);
}

/** Nightmare: asleep and slumped, it writhes: twisting and flinching in its sleep, face screwed up. */
export function statusNightmare(L: Line): Clip {
  const k = L.k;
  return L.clip('status_nightmare', 1.8, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.06), k.bend(18, 6, 0, 16, 0, 8), k.SHUT, k.tail(-6), L.both('droop')),
    // Writhing.
    L.key(0.4, L.pelvis(0.015, -0.06), k.twist(18, 8), k.bend(14, 4, 0, 10, 16, 10), k.HURT, k.jaw(14), k.tail(-4, 16), L.arms('flinch', 'droop')),
    L.key(0.62, L.pelvis(-0.015, -0.062), k.twist(-18, -8), k.bend(16, 5, 0, 12, -16, -10), k.HURT, k.jaw(18), k.tail(-4, -16), L.arms('droop', 'flinch')),
    L.key(0.84, L.pelvis(0.012, -0.06), k.twist(14, 6), k.bend(15, 4, 0, 11, 12, 8), k.HURT, k.jaw(12), k.tail(-4, 12), L.both('cover')),
    L.key(1.08, L.pelvis(0, -0.062), k.bend(18, 6, 0, 16, 0, 8), k.SHUT, k.jaw(4), k.tail(-6), L.both('droop')),
    L.key(1.44, L.pelvis(0, -0.03), k.bend(8, 2, 0, 8, 0, 4), k.SHUT, k.tail(-2)),
    L.key(1.8, k.OPEN),
  ]);
}

/** Wrapped: squeezed by a bind, arms pinned to its sides, it strains and twists against it. */
export function statusWrapped(L: Line): Clip {
  const k = L.k;
  return L.clip('status_wrapped', 1.6, [
    L.key(0),
    L.snap(0.08, L.pelvis(0, 0.005), k.bend(-4, -3, 0, -8), k.HURT, k.jaw(10), k.tail(8), L.both('braced'), k.FISTS),
    // Straining against it, twisting one way and the other.
    L.key(0.3, L.pelvis(0, -0.005), k.twist(20, 6), k.bend(-2, -2, 0, -10, 10, 6), k.ANGRY, k.jaw(16), k.tail(10, 14), L.both('braced'), k.FISTS),
    L.key(0.56, L.pelvis(0, -0.005), k.twist(-20, -6), k.bend(-2, -2, 0, -10, -10, -6), k.ANGRY, k.jaw(18), k.tail(10, -14), L.both('braced'), k.FISTS),
    L.key(0.8, L.pelvis(0, -0.004), k.twist(16, 5), k.bend(-2, -2, 0, -9, 8, 5), k.HURT, k.jaw(14), k.tail(10, 12), L.both('braced'), k.FISTS),
    L.key(1.06, L.pelvis(0, -0.03), k.bend(10, 3, 0, 6), k.HURT, k.jaw(4), k.tail(2), L.both('droop')),
    L.key(1.3, L.pelvis(0, -0.02), k.bend(4, 1, 0, 1), k.FOCUS, k.tail(2)),
    L.key(1.6, k.OPEN),
  ]);
}

// States that loop instead of idle.

/** Asleep: slumped low, head bowed on its chest, eyes shut, slow deep breaths, the tail curled round (loops). */
export function idleAsleep(L: Line): Clip {
  const k = L.k;
  const base = [L.pelvis(0, -0.07), k.bend(20, 6, 2, 18, 0, 8), k.SHUT, k.tail(-6, 10), L.both('droop')];
  return L.clip('idle_asleep', 3.2, [
    L.key(0, ...base),
    L.key(1.4, L.pelvis(0, -0.062), k.bend(17, 5, 2, 15, 0, 7), k.SHUT, k.tail(-4, 12), L.both('droop')),
    L.key(3.2, ...base),
  ], [], { loop: true });
}

/** Worn down: heavy panting, the guard sagging, shoulders heaving, still facing the foe (loops). */
export function idleTired(L: Line): Clip {
  const k = L.k;
  const base = [L.pelvis(0, -0.05), k.bend(14, 4, 0, 4), k.HURT, k.jaw(12), k.tail(-4), L.both('guardLow')];
  return L.clip('idle_tired', 1.2, [
    L.key(0, ...base),
    L.key(0.3, L.pelvis(0, -0.042), k.bend(10, 3, 0, 1), k.HURT, k.jaw(18), k.tail(-3), L.both('guardLow')),
    L.key(0.6, L.pelvis(0, -0.054), k.bend(16, 5, 0, 6), k.DROWSY, k.jaw(8), k.tail(-5), L.both('droop')),
    L.key(0.9, L.pelvis(0, -0.044), k.bend(11, 3, 0, 2), k.HURT, k.jaw(16), k.tail(-3), L.both('guardLow')),
    L.key(1.2, ...base),
  ], [], { loop: true });
}

// The game's other animations on a battler.

/** Stat up: it draws itself up, chest out, and strikes a fierce pose, fists pumped up before it, a tremor of power. */
export function statUp(L: Line): Clip {
  const k = L.k;
  return L.clip('stat_up', 1.4, [
    L.key(0),
    L.key(0.14, L.pelvis(0, -0.05), k.bend(12, 4, 0, 6), k.SHUT, k.tail(0), L.both('crossedLow'), k.FISTS),
    L.snap(0.3, L.pelvis(0, 0.014), k.bend(-12, -6, -2, -12), k.ANGRY, k.jaw(12), k.tail(24), L.both('clawsUp'), k.FISTS),
    L.key(0.5, L.pelvis(0, 0.016), k.bend(-13, -6, -2, -13, 2, 2), k.ANGRY, k.jaw(8), k.tail(26, 6), L.both('clawsUp'), k.FISTS),
    L.key(0.7, L.pelvis(0, 0.014), k.bend(-12, -6, -2, -12, -2, -2), k.ANGRY, k.jaw(6), k.tail(24, -6), L.both('clawsUp'), k.FISTS),
    L.key(0.98, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.ANGRY, k.tail(6), L.both('guard')),
    L.key(1.4, k.OPEN),
  ]);
}

/** Stat down: weakened, it shrinks back, shoulders dropping, and wobbles unsteadily. */
export function statDown(L: Line): Clip {
  const k = L.k;
  return L.clip('stat_down', 1.4, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.05, -0.012), k.bend(10, 3, -2, 12), k.HURT, k.tail(-6), L.both('droop')),
    L.key(0.46, L.pelvis(0.012, -0.055, -0.012), k.bend(12, 4, -2, 14, 6, 8), k.DROWSY, k.tail(-8, 8), L.both('droop')),
    L.key(0.72, L.pelvis(-0.012, -0.055, -0.01), k.bend(12, 4, -2, 14, -6, -8), k.DROWSY, k.tail(-8, -8), L.both('droop')),
    L.key(1.0, L.pelvis(0, -0.03), k.bend(6, 2, 0, 4), k.HURT, k.tail(-2), L.both('guardLow')),
    L.key(1.4, k.OPEN),
  ]);
}

/** Level up: a proud flourish: a spin on the spot and a pose, one fist raised beside its head, eyes bright. */
export function levelUp(L: Line): Clip {
  const k = L.k;
  return L.clip('level_up', 1.8, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.05), k.bend(10, 3, 0, 4), k.HAPPY, k.tail(4), L.both('low'), k.FISTS),
    // A spin on the spot.
    L.key(0.36, L.root({ yaw: 140, y: 0.04 * k.spring }), L.pelvis(0, -0.016 * k.spring), k.bend(0, 0, 0, -6), k.HAPPY, k.tail(20, -20), L.both('spread')),
    L.key(0.54, L.root({ yaw: 290, y: 0.05 * k.spring }), L.pelvis(0, -0.02 * k.spring), k.bend(-2, 0, 0, -8), k.HAPPY, k.tail(22, -24), L.both('spread')),
    L.key(0.68, L.root({ yaw: 360 }), k.LAND, k.HAPPY, k.tail(12, -10), L.both('guard')),
    // The pose: a fist raised high.
    L.snap(0.8, L.root({ yaw: 360 }), L.pelvis(0, 0.01), k.twist(-10), k.bend(-8, -4, 0, -12, 10), k.HAPPY, k.jaw(14), k.tail(24, 10), L.arms('clawsUp', 'fistHip'), k.FISTS),
    L.key(1.08, L.root({ yaw: 360 }), L.pelvis(0, 0.012), k.twist(-11), k.bend(-9, -4, 0, -13, 11, 2), k.HAPPY, k.jaw(10), k.tail(26, 6), L.arms('clawsUp', 'fistHip'), k.FISTS),
    L.key(1.4, L.root({ yaw: 360 }), L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.HAPPY, k.tail(6), L.both('guard')),
    L.key(1.8, L.root({ yaw: 360 }), k.OPEN),
  ]);
}

/** Drained: Leech Seed saps it: it sags as the energy leaves, knees giving, arms hanging, then gathers itself. */
export function drained(L: Line): Clip {
  const k = L.k;
  return L.clip('drained', 1.5, [
    L.key(0),
    L.key(0.12, L.pelvis(0, -0.02), k.bend(-6, -3, 0, -8), k.HURT, k.tail(8), L.both('flinch')),
    L.key(0.4, L.pelvis(0, -0.075), k.bend(20, 6, 2, 16, 0, 6), k.DROWSY, k.jaw(10), k.tail(-8), L.both('droop')),
    L.key(0.72, L.pelvis(0, -0.085), k.bend(22, 7, 2, 18, 0, 8), k.SHUT, k.jaw(12), k.tail(-10, 4), L.both('droop')),
    L.key(1.0, L.pelvis(0, -0.05), k.bend(12, 3, 0, 8, 0, 4), k.HURT, k.jaw(4), k.tail(-4), L.both('guardLow')),
    L.key(1.26, L.pelvis(0, -0.02), k.bend(4, 1, 0, 1), k.FOCUS, k.tail(2)),
    L.key(1.5, k.OPEN),
  ]);
}

/** Healed: it relaxes, refreshed: a deep breath in, chest rising and face up, eyes shut, arms loose, then a contented settle. */
export function healed(L: Line): Clip {
  const k = L.k;
  return L.clip('healed', 1.6, [
    L.key(0),
    L.key(0.3, L.pelvis(0, 0.01), k.bend(-8, -4, -2, -16), k.SHUT, k.tail(12), L.both('palmsUp'), k.SPLAYED),
    L.key(0.66, L.pelvis(0, 0.012), k.bend(-9, -4, -2, -17, 0, 3), k.SHUT, k.tail(14, 6), L.both('palmsUp'), k.SPLAYED),
    L.key(0.96, L.pelvis(0, -0.02), k.bend(4, 1, 0, 2, 0, -3), k.HAPPY, k.tail(6, -4), L.both('guardLow')),
    L.key(1.26, L.pelvis(0, -0.012), k.bend(2, 0, 0, -1), k.HAPPY, k.tail(3)),
    L.key(1.6, k.OPEN),
  ]);
}

/** Focus: Focus Punch's setup: it tightens its focus, eyes shut, breath held, the fist drawn back to its hip, the other hand forward, utterly still but for a tremor. */
export function focus(L: Line): Clip {
  const k = L.k;
  return L.clip('focus', 1.6, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.05), k.twist(-20), k.bend(8, 2, 0, -2, 8), k.SHUT, k.tail(4, -8), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.5, L.pelvis(0, -0.055), k.twist(-22), k.bend(9, 2, 0, -2, 8, 1), k.SHUT, k.tail(3, -8), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(0.8, L.pelvis(0, -0.056), k.twist(-22), k.bend(9, 2, 0, -2, 8, -1), k.FOCUS, k.tail(3, -9), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(1.1, L.pelvis(0, -0.055), k.twist(-21), k.bend(9, 2, 0, -2, 8, 1), k.FOCUS, k.tail(3, -8), L.arms('fistHip', 'reach'), k.FISTS),
    L.key(1.36, L.pelvis(0, -0.02), k.bend(3, 0, 0, -1), k.FOCUS, k.tail(2), L.both('guard')),
    L.key(1.6, k.FOCUS),
  ]);
}

/** Hang on: at 1 HP it staggers, a knee buckling, sways... and stays up, forcing itself back to its guard. */
export function hangOn(L: Line): Clip {
  const k = L.k;
  return L.clip('hang_on', 1.6, [
    L.key(0),
    L.snap(0.08, L.pelvis(0, -0.01, -0.012), k.bend(-12, -5, -4, -14), k.HURT, k.jaw(14), k.tail(14), L.both('flinch')),
    // A knee buckles.
    L.key(0.3, L.pelvis(0.02, -0.09), k.twist(0, 10), k.bend(20, 6, 2, 12, 0, 8), k.HURT, k.jaw(10), k.tail(-4, 10), L.both('droop')),
    L.key(0.52, L.pelvis(-0.015, -0.08), k.twist(0, -8), k.bend(18, 6, 2, 10, 0, -6), k.SHUT, k.jaw(8), k.tail(-4, -8), L.both('droop')),
    // ... it stays up, forcing itself back into its guard.
    L.key(0.8, L.pelvis(0, -0.04), k.bend(8, 2, 0, -4), k.ANGRY, k.jaw(10), k.tail(4), L.both('guard'), k.FISTS),
    L.key(1.08, L.pelvis(0, -0.035), k.bend(9, 2, 0, -4, 0, 2), k.ANGRY, k.jaw(4), k.tail(4, 4), L.both('guard'), k.FISTS),
    L.key(1.3, L.pelvis(0, -0.015), k.bend(3, 0, 0, -1), k.ANGRY, k.tail(2)),
    L.key(1.6, k.OPEN),
  ]);
}

// What the game only says.

/** Flinch: startled, it recoils, eyes wide, arms up in front of it, and falters, unable to act. */
export function flinch(L: Line): Clip {
  const k = L.k;
  return L.clip('flinch', 1.1, [
    L.key(0),
    L.snap(0.06, L.pelvis(0, -0.01, -0.012), k.bend(-10, -4, -4, -10), k.WIDE, k.tail(12), L.both('cover'), k.SPLAYED),
    L.key(0.24, L.pelvis(0, -0.03, -0.012), k.bend(-4, -2, -2, -2, 8, 6), k.WIDE, k.tail(8, 8), L.both('cover'), k.SPLAYED),
    L.key(0.46, L.pelvis(0, -0.04, -0.006), k.bend(6, 2, 0, 6, -6, -4), k.HURT, k.tail(2, -6), L.both('flinch')),
    L.key(0.72, L.pelvis(0, -0.025), k.bend(4, 1, 0, 1), k.FOCUS, k.tail(3), L.both('guardLow')),
    L.key(1.1, k.OPEN),
  ]);
}

/** Recharge: spent after its huge move, it hangs forward panting, arms dangling, and can't move. */
export function recharge(L: Line): Clip {
  const k = L.k;
  return L.clip('recharge', 1.8, [
    L.key(0),
    L.key(0.24, L.pelvis(0, -0.08), k.bend(26, 8, 4, 12), k.DROWSY, k.jaw(16), k.tail(-8), L.both('droop')),
    L.key(0.5, L.pelvis(0, -0.074), k.bend(23, 7, 4, 9), k.HURT, k.jaw(22), k.tail(-7), L.both('droop')),
    L.key(0.76, L.pelvis(0, -0.084), k.bend(27, 8, 4, 13), k.DROWSY, k.jaw(12), k.tail(-9), L.both('droop')),
    L.key(1.02, L.pelvis(0, -0.074), k.bend(23, 7, 4, 9), k.HURT, k.jaw(22), k.tail(-7), L.both('droop')),
    L.key(1.3, L.pelvis(0, -0.04), k.bend(10, 3, 0, 4), k.DROWSY, k.jaw(6), k.tail(-2), L.both('guardLow')),
    L.key(1.8, k.OPEN),
  ]);
}

/** Wake: asleep, it startles awake with a jolt, blinks, shakes the sleep out of its head and snaps back on guard. */
export function wake(L: Line): Clip {
  const k = L.k;
  return L.clip('wake', 1.4, [
    L.key(0, L.pelvis(0, -0.06), k.bend(18, 6, 2, 16, 0, 8), k.SHUT, k.tail(-6), L.both('droop')),
    // The jolt.
    L.snap(0.14, L.air(0.03), L.pelvis(0, -0.012 * k.spring), k.bend(-8, -4, -2, -12), k.WIDE, k.jaw(16), k.tail(18), L.both('spread'), k.SPLAYED),
    L.key(0.26, k.LAND, k.bend(2, 0, 0, -4), k.WIDE, k.jaw(4), k.tail(8), L.both('guardLow')),
    // Shaking the sleep out of its head.
    L.key(0.4, L.pelvis(0, -0.03), k.bend(4, 1, 0, -2, 14, 8), k.SHUT, k.tail(6, 10), L.both('guardLow')),
    L.key(0.52, L.pelvis(0, -0.03), k.bend(4, 1, 0, -2, -14, -8), k.SHUT, k.tail(6, -10), L.both('guardLow')),
    L.key(0.64, L.pelvis(0, -0.03), k.bend(4, 1, 0, -2, 8, 4), k.FOCUS, k.tail(6, 6), L.both('guardLow')),
    // Back on guard.
    L.snap(0.8, L.pelvis(0, -0.045), k.bend(8, 2, 0, -4), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.06, L.pelvis(0, -0.02), k.bend(3, 0, 0, -1), k.ANGRY, k.tail(3)),
    L.key(1.4, k.OPEN),
  ]);
}

/** Shake off: a condition gone, it shakes its whole body out from head to tail and settles back on guard. */
export function shakeOff(L: Line): Clip {
  const k = L.k;
  return L.clip('shake_off', 1.3, [
    L.key(0),
    L.key(0.12, L.pelvis(0, -0.04), k.bend(8, 2, 0, 4), k.SHUT, k.tail(2), L.both('low')),
    // A full-body shake, head to tail.
    L.key(0.24, L.pelvis(0.015, -0.035), k.twist(14, 8), k.bend(6, 2, 0, 2, 12, 10), k.SHUT, k.tail(10, -16), L.both('guardLow')),
    L.key(0.36, L.pelvis(-0.015, -0.035), k.twist(-14, -8), k.bend(6, 2, 0, 2, -12, -10), k.SHUT, k.tail(10, 16), L.both('low')),
    L.key(0.48, L.pelvis(0.012, -0.035), k.twist(10, 6), k.bend(6, 2, 0, 2, 9, 8), k.SHUT, k.tail(10, -12), L.both('guardLow')),
    L.key(0.6, L.pelvis(-0.008, -0.035), k.twist(-6, -4), k.bend(6, 2, 0, 2, -6, -5), k.FOCUS, k.tail(8, 8), L.both('low')),
    L.key(0.8, L.pelvis(0, -0.035), k.bend(8, 2, 0, -4), k.ANGRY, k.tail(4), L.both('guard')),
    L.key(1.04, L.pelvis(0, -0.018), k.bend(3, 0, 0, -1), k.ANGRY, k.tail(3)),
    L.key(1.3, k.OPEN),
  ]);
}

/** Break free: burst back out of the ball: it comes out curled, springs up angry, shakes itself off and stamps back into its stance. */
export function breakFree(L: Line): Clip {
  const k = L.k;
  return L.clip('break_free', 1.5, [
    L.key(0, L.pelvis(0, -0.07), k.bend(20, 6, 4, 18), k.SHUT, k.tail(-8), L.both('crossedLow'), k.FISTS),
    // Bursts up, angry, arms flung out.
    L.snap(0.16, L.air(0.05), L.pelvis(0, -0.02 * k.spring), k.bend(-10, -4, -2, -10), k.ANGRY, k.jaw(24), k.tail(28), L.both('flare'), k.SPLAYED),
    L.key(0.3, k.LAND, k.bend(6, 2, 0, -2), k.ANGRY, k.jaw(10), k.tail(12), L.both('low'), k.FISTS),
    // Shakes itself off.
    L.key(0.44, L.pelvis(0.012, -0.035), k.twist(10, 6), k.bend(6, 2, 0, 0, 10, 8), k.ANGRY, k.tail(10, -12), L.both('low'), k.FISTS),
    L.key(0.56, L.pelvis(-0.012, -0.035), k.twist(-10, -6), k.bend(6, 2, 0, 0, -10, -8), k.ANGRY, k.tail(10, 12), L.both('low'), k.FISTS),
    // Stamps back into its stance.
    L.key(0.72, L.pelvis(0.01, -0.015), k.bend(2, 1, 0, -6), k.ANGRY, k.tail(8), L.both('guard'), k.FISTS),
    L.snap(0.82, L.pelvis(0, -0.05), k.bend(10, 3, 0, -6), k.ANGRY, k.jaw(8), k.tail(4), L.both('guard'), k.FISTS),
    L.key(1.1, L.pelvis(0, -0.02), k.bend(3, 0, 0, -1), k.ANGRY, k.tail(3)),
    L.key(1.5, k.OPEN),
  ]);
}

// The weather, at the end of each turn it lasts.

/** Rain: it hunches its shoulders as the rain falls, then shakes the water off head to tail, flicking it from its hands. */
export function weatherRain(L: Line): Clip {
  const k = L.k;
  return L.clip('weather_rain', 1.5, [
    L.key(0),
    L.key(0.2, L.pelvis(0, -0.03), k.bend(8, 3, -2, 8), k.SHUT, k.tail(-4), L.both('hug')),
    L.key(0.42, L.pelvis(0, -0.035), k.bend(9, 3, -2, 9, 0, 3), k.SHUT, k.tail(-4, 4), L.both('hug')),
    // Shakes the water off.
    L.key(0.56, L.pelvis(0.012, -0.03), k.twist(12, 6), k.bend(4, 1, 0, 0, 12, 8), k.SHUT, k.tail(8, -14), L.both('low'), k.SPLAYED),
    L.key(0.68, L.pelvis(-0.012, -0.03), k.twist(-12, -6), k.bend(4, 1, 0, 0, -12, -8), k.SHUT, k.tail(8, 14), L.both('guardLow'), k.SPLAYED),
    L.key(0.8, L.pelvis(0.01, -0.03), k.twist(8, 4), k.bend(4, 1, 0, 0, 8, 6), k.FOCUS, k.tail(8, -10), L.both('low'), k.SPLAYED),
    L.key(1.08, L.pelvis(0, -0.02), k.bend(3, 0, 0, -1), k.FOCUS, k.tail(3), L.both('guardLow')),
    L.key(1.5, k.OPEN),
  ]);
}

/** Sun: a Grass type, it basks: it turns its face up to the strong sunlight, eyes shut, arms opening to it, and soaks it in, content. */
export function weatherSun(L: Line): Clip {
  const k = L.k;
  return L.clip('weather_sun', 1.8, [
    L.key(0),
    L.key(0.3, L.pelvis(0, 0.006), k.bend(-8, -4, -4, -20), k.SHUT, k.tail(10), L.both('palmsUp'), k.SPLAYED),
    L.key(0.7, L.pelvis(0, 0.01), k.bend(-10, -5, -4, -22, 0, 4), k.HAPPY, k.tail(12, 6), L.both('palmsUp'), k.SPLAYED),
    L.key(1.1, L.pelvis(0, 0.008), k.bend(-9, -5, -4, -21, 0, -3), k.SHUT, k.tail(12, -6), L.both('palmsUp'), k.SPLAYED),
    L.key(1.44, L.pelvis(0, -0.015), k.bend(3, 0, 0, -2), k.HAPPY, k.tail(4), L.both('guardLow')),
    L.key(1.8, k.OPEN),
  ]);
}

/** Sand: the sandstorm rages: it braces low, turning its face away and shielding its eyes with a forearm. */
export function weatherSand(L: Line): Clip {
  const k = L.k;
  return L.clip('weather_sand', 1.6, [
    L.key(0),
    L.key(0.16, L.pelvis(0, -0.05), k.twist(-10), k.bend(10, 3, 0, 6, -16), k.SHUT, k.tail(-2, 8), L.arms('shade', 'guardLow')),
    L.key(0.44, L.pelvis(0, -0.06), k.twist(-14), k.bend(14, 4, 0, 10, -22, -4), k.SHUT, k.tail(-4, 10), L.arms('shade', 'guardLow')),
    L.key(0.74, L.pelvis(0, -0.062), k.twist(-13), k.bend(15, 4, 0, 11, -20, 4), k.HURT, k.tail(-4, 6), L.arms('shade', 'guardLow')),
    L.key(1.02, L.pelvis(0, -0.06), k.twist(-14), k.bend(14, 4, 0, 10, -22, -3), k.SHUT, k.tail(-4, 10), L.arms('shade', 'guardLow')),
    L.key(1.3, L.pelvis(0, -0.02), k.bend(3, 0, 0, -1), k.FOCUS, k.tail(2), L.both('guardLow')),
    L.key(1.6, k.OPEN),
  ]);
}

/** Hail: the hailstones keep falling: it flinches and hunches under them, arms over its head, ducking each one. */
export function weatherHail(L: Line): Clip {
  const k = L.k;
  return L.clip('weather_hail', 1.5, [
    L.key(0),
    L.snap(0.1, L.pelvis(0, -0.05), k.bend(14, 5, 0, 14), k.HURT, k.tail(-4), L.both('cover')),
    L.key(0.3, L.pelvis(0, -0.06), k.bend(16, 5, 0, 16, 6, 4), k.SHUT, k.tail(-6, 6), L.both('cover')),
    L.snap(0.4, L.pelvis(0, -0.075), k.bend(20, 6, 0, 18, -4, -4), k.HURT, k.tail(-8, -6), L.both('cover')),
    L.key(0.62, L.pelvis(0, -0.065), k.bend(17, 5, 0, 16, 4, 3), k.SHUT, k.tail(-6, 4), L.both('cover')),
    L.snap(0.72, L.pelvis(0, -0.075), k.bend(20, 6, 0, 18, 0, -4), k.HURT, k.tail(-8, -4), L.both('cover')),
    L.key(1.02, L.pelvis(0, -0.03), k.bend(6, 2, 0, 4), k.HURT, k.tail(-2), L.both('guardLow')),
    L.key(1.5, k.OPEN),
  ]);
}

/** Every situation clip but the four moments. */
export const SITUATIONS = {
  hit_strong: hitStrong, dodge, unaffected, return_home: returnHome,
  status_sleep: statusSleep, status_poison: statusPoison, status_burn: statusBurn, status_paralysis: statusParalysis,
  status_freeze: statusFreeze, status_confusion: statusConfusion, status_infatuation: statusInfatuation, status_curse: statusCurse,
  status_nightmare: statusNightmare, status_wrapped: statusWrapped, idle_asleep: idleAsleep, idle_tired: idleTired,
  stat_up: statUp, stat_down: statDown, level_up: levelUp, drained, healed, focus, hang_on: hangOn,
  flinch, recharge, wake, shake_off: shakeOff, break_free: breakFree,
  weather_rain: weatherRain, weather_sun: weatherSun, weather_sand: weatherSand, weather_hail: weatherHail,
};

/** The four moments, for a species that has no clips of its own for them. */
export const MOMENTS = { idle, intro, hit, faint };
