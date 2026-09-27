// Every battle situation (src/battle3d/situations.ts), each its own clip:
// the moments (idle, intro, hit, faint), engaging the foe (hit_strong,
// dodge, unaffected, return_home), the status conditions, the loops of
// sleep and exhaustion, the game's other animations and messages, the
// weather, and Mightyena's Intimidate. A dog acts with its whole body: the
// head, ears, hackles and tail say how it feels, and its weight shows in
// how it sinks, braces, shakes and bristles.

import type { Clip } from '../../../anim/clip';
import type { Pose } from '../../../anim/rig';
import { AIR, GROUND, HIND, type Kit, Take, at, body, eyes } from './kit';
import { boundHome, fierce, furious } from './travel';
import { lying } from './self';

const mighty = (k: Kit) => k.slug === 'mightyena';

/** Standing its ground: a silent growl (lips tighten, hackles pulse), a flick of the tail; Mightyena's head sweeps, scanning. Loops. */
export function idle(k: Kit): Clip {
  const c = new Take(k);
  const scan = mighty(k) ? 5 : 0;
  c.key(0, GROUND);
  c.key(0.6, GROUND, body(k, { neck: 2, head: -2, headY: scan }), k.hackles(4), k.jaw(-2), k.tail(4));
  c.key(1.2, GROUND, body(k, { y: -0.01, spine: 2, neck: 2, headY: scan * 0.4 }), k.hackles(8), k.tail(10), k.ears(4));
  c.key(1.8, GROUND, body(k, { spine: 0.5, neck: -1, head: 1, headY: -scan }), k.hackles(3), k.jaw(1), k.tail(3));
  c.key(2.4, GROUND);
  return c.clip('idle', { loop: true });
}

/**
 * Its entrance and cry: gathered low, it throws its head up and cries
 * (Poochyena a short yipping howl, Mightyena a long wolf's howl), then
 * brings it down on the foe with a snarl.
 */
export function intro(k: Kit): Clip {
  const c = new Take(k);
  const long = mighty(k) ? 0.2 : 0;
  c.key(0, GROUND, body(k, { y: -0.05, spine: 4, neck: 14, head: 10 }), k.ears(-20), k.tail(-12), k.hackles(-8), eyes('closed'));
  c.key(0.2, GROUND, body(k, { y: -0.07, spine: 6, neck: 18, head: 12 }), k.ears(-24), k.tail(-16), k.hackles(-10), eyes('closed'));
  c.snap(0.42, GROUND, body(k, { y: 0.004, spine: -7, chest: -5, neck: -15, head: -12, headY: 4, headZ: -4 }), k.jaw(34), k.ears(6), k.tail(24), k.hackles(30), eyes('closed'));
  c.on('cry', 0.46);
  c.key(0.62 + long * 0.5, GROUND, body(k, { y: 0.004, spine: -7, chest: -5, neck: -16, head: -14, headY: 5, headZ: -7 }), k.jaw(31), k.ears(6), k.tail(26), k.hackles(30), eyes('closed'));
  c.key(0.82 + long, GROUND, body(k, { y: 0.002, spine: -7, chest: -5, neck: -15, head: -13, headY: 3, headZ: -2 }), k.jaw(34), k.ears(4), k.tail(24), k.hackles(32), eyes('closed'));
  c.key(1.02 + long, GROUND, body(k, { y: -0.014, spine: 4, neck: 6, head: 4 }), k.jaw(12), k.ears(6), k.tail(16), k.hackles(24), eyes('angry'));
  c.key(1.24 + long, GROUND, body(k, { y: -0.006, spine: 1, neck: 1, head: 1 }), k.jaw(3), k.ears(3), k.tail(8), k.hackles(12), eyes('angry'));
  c.key(1.6 + long, GROUND, eyes('open'));
  return c.clip('intro');
}

/** Hit: a yelp, jolted back with its head jerked up and away and its eyes squeezed shut, tail tucked; it cringes, then bristles up again. */
export function hit(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.snap(0.05, GROUND, body(k, { y: -0.02, z: -0.028, spine: -5, chest: -2, neck: -10, head: -6, neckY: 8, headY: 24, headZ: -12, roll: -4 }), k.jaw(16), k.ears(-38), k.tail(-28), k.hackles(-12), eyes('hurt'));
  c.key(0.2, GROUND, body(k, { y: -0.04, z: -0.018, spine: 4, chest: 2, neck: 8, head: 8, neckY: 3, headY: 10, headZ: -4, roll: -2 }), k.jaw(4), k.ears(-32), k.tail(-24), k.hackles(-8), eyes('hurt'));
  c.key(0.38, GROUND, body(k, { y: -0.008, spine: -1, neck: -2, head: -2, headY: -3 }), k.ears(-4), k.tail(8), k.hackles(10), eyes('angry'));
  c.key(0.62, GROUND, eyes('open'));
  return c.clip('hit');
}

/** A critical or super-effective blow: knocked off its forepaws and back a step, it lands staggering, shakes its head hard and squares up again. */
export function hitStrong(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.snap(0.05, HIND, body(k, { y: 0.01, z: -0.05, spine: -16, chest: -4, neck: -14, head: -10, headY: 26, headZ: -14, roll: -6 }), k.legs.rear, k.jaw(24), k.ears(-40), k.tail(-30), k.hackles(-14), eyes('hurt'));
  // Knocked back a step.
  c.key(0.16, AIR, { root: { y: 0.05, z: -0.1 } }, k.legs.tuck, body(k, { spine: -8, neck: -8, head: -6, headY: 18, headZ: -8 }), k.jaw(18), k.ears(-38), k.tail(-26), k.hackles(-10), eyes('hurt'));
  c.key(0.3, GROUND, { root: { z: -0.14 } }, body(k, { y: -0.08, x: -0.01, spine: 8, neck: 12, head: 10, roll: 6, headZ: 8 }), k.jaw(8), k.ears(-34), k.tail(-24), k.hackles(-6), eyes('hurt'));
  // Shakes it off hard.
  c.key(0.4, GROUND, { root: { z: -0.14 } }, body(k, { y: -0.06, spine: 5, neck: 6, head: 2, headY: 16, headZ: -12 }), k.jaw(6), k.ears(-20), k.tail(-4), k.hackles(10), eyes('closed'));
  c.key(0.5, GROUND, { root: { z: -0.14 } }, body(k, { y: -0.06, spine: 5, neck: 6, head: 2, headY: -14, headZ: 10 }), k.jaw(4), k.ears(-20), k.tail(4), k.hackles(16), eyes('closed'));
  // Steps back up to its place, squaring up.
  c.key(0.62, AIR, { root: { y: 0.05, z: -0.07 } }, k.legs.tuck, body(k, { spine: -2, neck: 2 }), ...fierce(k, 0.8));
  c.key(0.74, GROUND, { root: { z: 0 } }, body(k, { y: -0.04, spine: 4, neck: 4, head: -2 }), ...fierce(k, 0.8));
  c.key(1.0, GROUND, { root: { z: 0 } }, eyes('open'));
  return c.clip('hit_strong');
}

/**
 * Fainting (worn out, not dying): a tired sway with the eyes half shut, the
 * tail and hackles drooping, then it sinks onto its belly, lays its head
 * down between its paws, shuts its eyes, and shrinks away.
 */
export function faint(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.2, GROUND, body(k, { y: -0.012, spine: 1, neck: 5, head: 8, roll: 5 }), k.jaw(-4), k.ears(-14), k.tail(-14), k.hackles(-14), eyes('half'));
  c.key(0.5, GROUND, body(k, { y: -0.09, spine: 4, chest: 1, neck: 12, head: 10, roll: -4 }), k.jaw(-4), k.ears(-24), k.tail(-20), k.hackles(-18), eyes('closed'));
  c.key(0.84, GROUND, ...lying(k, {}), body(k, { roll: 2 }), k.jaw(-4), k.ears(-30), k.tail(-10, 28), k.hackles(-20), eyes('closed'));
  c.key(0.98, GROUND, ...lying(k, { head: 1 }), body(k, { y: -0.006, roll: 2 }), k.jaw(-4), k.ears(-30), k.tail(-10, 30), k.hackles(-20), eyes('closed'));
  c.on('shrink', 1.04);
  c.key(1.6, GROUND, ...lying(k, {}), body(k, { y: -0.004, roll: 2 }), k.jaw(-4), k.ears(-30), k.tail(-10, 29), k.hackles(-20), eyes('closed'));
  const clip = c.clip('faint');
  // The shrink takes 32 frames from its event however slow the beat.
  clip.events = [{ t: Math.min(clip.events![0].t, clip.duration - 0.55), name: 'shrink' }];
  return clip;
}

/** Dodge: the move misses: it springs aside with its head ducked, lands light, and hops back to its place on guard. */
export function dodge(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.06, GROUND, body(k, { y: -0.05, spine: 6, neck: 10, head: 6, roll: 4 }), k.ears(-20), k.tail(6), k.hackles(10), eyes('angry'));
  c.key(0.16, AIR, { root: { x: 0.14, y: 0.08, roll: 10 } }, k.legs.tuck, body(k, { spine: 4, neck: 12, head: 8, headY: -8 }), k.ears(-26), k.tail(14), k.hackles(14), eyes('angry'));
  c.key(0.26, GROUND, { root: { x: 0.22 } }, body(k, { y: -0.06, spine: 6, neck: 8, head: 0, headY: -10 }), k.ears(-16), k.tail(12), k.hackles(14), eyes('angry'));
  c.key(0.46, GROUND, { root: { x: 0.22 } }, body(k, { y: -0.05, spine: 5, neck: 6, head: -2, headY: -6 }), ...fierce(k, 0.7));
  c.key(0.56, AIR, { root: { x: 0.1, y: 0.06 } }, k.legs.tuck, body(k, { spine: -2, neck: 2 }), ...fierce(k, 0.6));
  c.key(0.66, GROUND, { root: { x: 0 } }, body(k, { y: -0.04, spine: 4, neck: 4 }), ...fierce(k, 0.6));
  c.key(0.9, GROUND, { root: { x: 0 } }, eyes('open'));
  return c.clip('dodge');
}

/** Unaffected: it doesn't budge: a snort, the nose lifted in contempt, a flick of the ears and a lazy shake of the head. */
export function unaffected(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.16, GROUND, body(k, { y: 0.004, spine: -3, neck: -8, head: -12 }), k.jaw(-6), k.ears(10), k.tail(12), k.hackles(6), eyes('half'));
  c.key(0.32, GROUND, body(k, { y: 0.004, spine: -3, neck: -8, head: -12, headY: 10, headZ: -6 }), k.jaw(8), k.ears(-6), k.tail(14), k.hackles(6), eyes('closed'));
  c.key(0.46, GROUND, body(k, { y: 0.004, spine: -3, neck: -8, head: -11, headY: -8, headZ: 5 }), k.jaw(2), k.ears(12), k.tail(12), k.hackles(4), eyes('closed'));
  c.key(0.64, GROUND, body(k, { y: 0.002, spine: -2, neck: -6, head: -9, headY: 2 }), k.jaw(-4), k.ears(8), k.tail(10), k.hackles(4), eyes('half'));
  c.key(0.84, GROUND, body(k, { spine: -1, neck: -2, head: -3 }), k.tail(6), eyes('look'));
  c.key(1.1, GROUND, eyes('open'));
  return c.clip('unaffected');
}

/** Return home after a run of hits: from its guard at the foe it springs back off its forelegs and bounds home. */
export function returnHome(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND, at(k, 1), body(k, { y: -0.05, z: -0.01, spine: 6, neck: 6, head: -4 }), ...fierce(k));
  c.key(0.1, GROUND, at(k, 1), body(k, { y: -0.06, z: -0.03, spine: 7, neck: 6, head: -5 }), ...fierce(k));
  boundHome(c, { from: 0.1 });
  return c.clip('return_home');
}

/** Falling asleep: it sways, the eyes sinking shut, the head nodding down and jerking up once; it gives in and sinks down (the sleep loop follows). */
export function statusSleep(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.3, GROUND, body(k, { y: -0.02, spine: 2, neck: 8, head: 10, roll: 4 }), k.ears(-10), k.tail(-6), k.hackles(-8), eyes('half'));
  c.key(0.6, GROUND, body(k, { y: -0.04, spine: 4, neck: 16, head: 16, roll: -3 }), k.jaw(-4), k.ears(-16), k.tail(-10), k.hackles(-12), eyes('closed'));
  // A jerk awake...
  c.snap(0.7, GROUND, body(k, { y: -0.02, spine: 1, neck: 2, head: 0 }), k.ears(0), k.tail(-4), k.hackles(-6), eyes('half'));
  // ... and it gives in.
  c.key(1.0, GROUND, body(k, { y: -0.08, spine: 5, neck: 18, head: 16, roll: 3 }), k.jaw(-4), k.ears(-20), k.tail(-12), k.hackles(-14), eyes('closed'));
  c.key(1.24, GROUND, body(k, { y: -0.1, spine: 5, neck: 19, head: 17, roll: 2 }), k.jaw(-4), k.ears(-22), k.tail(-12), k.hackles(-14), eyes('closed'));
  c.key(1.5, GROUND, body(k, { y: -0.03, spine: 2, neck: 6, head: 6 }), k.ears(-8), k.tail(-4), k.hackles(-6), eyes('half'));
  c.key(1.8, GROUND, eyes('open'));
  return c.clip('status_sleep');
}

/** Poisoned: a sickly shudder through the whole body, hunched with the head hanging, a gag; it wobbles upright again, queasy. */
export function statusPoison(k: Kit): Clip {
  const c = new Take(k);
  const sick = (r: number) => body(k, { y: -0.05, spine: 8, chest: 3, neck: 16, head: 12, roll: r, headZ: -r });
  c.key(0, GROUND);
  c.key(0.14, GROUND, sick(4), k.jaw(6), k.ears(-24), k.tail(-16), k.hackles(-6), eyes('hurt'));
  c.key(0.22, GROUND, sick(-4), k.jaw(6), k.ears(-24), k.tail(-16), k.hackles(-6), eyes('hurt'));
  c.key(0.3, GROUND, sick(3), k.jaw(6), k.ears(-24), k.tail(-16), k.hackles(-6), eyes('hurt'));
  // The gag.
  c.snap(0.46, GROUND, body(k, { y: -0.06, z: -0.02, spine: 10, chest: 4, neck: 22, head: 6 }), k.jaw(26), k.ears(-26), k.tail(-18), k.hackles(-4), eyes('closed'));
  c.key(0.62, GROUND, body(k, { y: -0.055, spine: 9, chest: 3, neck: 18, head: 12 }), k.jaw(10), k.ears(-24), k.tail(-16), k.hackles(-6), eyes('hurt'));
  c.key(0.84, GROUND, body(k, { y: -0.02, spine: 3, neck: 6, head: 4, roll: 3 }), k.jaw(2), k.ears(-12), k.tail(-6), eyes('half'));
  c.key(1.1, GROUND, eyes('open'));
  return c.clip('status_poison');
}

/** Burned: it jolts at the sting, kicks out a hind leg and licks at it with a wince, then shakes the leg out. */
export function statusBurn(k: Kit): Clip {
  const c = new Take(k);
  const legOut = (x: number): Pose => ({ plantRight: 0, post: { thighR: { x, z: -10 }, shinR: { x: x * 0.4 }, footR: { x: x * 0.6 } } });
  c.key(0, GROUND);
  c.snap(0.06, AIR, { root: { y: 0.05 } }, body(k, { spine: -6, neck: -8, head: -6 }), k.jaw(14), k.ears(-34), k.tail(26), k.hackles(20), eyes('hurt'));
  c.key(0.22, GROUND, legOut(35), body(k, { y: -0.03, spine: 4, neck: 8, head: 10, headY: -30, neckY: -18, turn: -10 }), k.jaw(8), k.ears(-26), k.tail(18), k.hackles(14), eyes('hurt'));
  // Licks at the burn.
  c.key(0.32, GROUND, legOut(30), body(k, { y: -0.04, spine: 6, neck: 14, head: 16, headY: -36, neckY: -22, turn: -12 }), k.jaw(12), k.ears(-22), k.tail(14), k.hackles(10), eyes('closed'));
  c.key(0.42, GROUND, legOut(34), body(k, { y: -0.04, spine: 6, neck: 13, head: 14, headY: -34, neckY: -20, turn: -12 }), k.jaw(4), k.ears(-22), k.tail(14), k.hackles(10), eyes('closed'));
  // Shakes the leg out.
  c.key(0.56, GROUND, legOut(10), body(k, { y: -0.02, spine: 2, neck: 4, head: 2, headY: -14, neckY: -8 }), k.jaw(2), k.ears(-12), k.tail(10), eyes('angry'));
  c.key(0.62, GROUND, legOut(30), body(k, { y: -0.02, spine: 2, neck: 4, head: 2, headY: -6 }), k.ears(-12), k.tail(10), eyes('angry'));
  c.key(0.72, GROUND, legOut(0), body(k, { y: -0.02, spine: 2, neck: 3 }), k.ears(-6), k.tail(8), eyes('angry'));
  c.key(1.0, GROUND, eyes('open'));
  return c.clip('status_burn');
}

/** Paralyzed: it seizes up, every limb locked stiff, jerking in sharp twitches, the tail spiking, eyes wide. */
export function statusParalysis(k: Kit): Clip {
  const c = new Take(k);
  const seize = (s: number) => body(k, { y: 0.004, z: -0.01, spine: -4 * s, neck: -10 + 4 * s, head: -6, headY: 10 * s, roll: 4 * s });
  const stiff = [k.ears(18), k.tail(40, 0, -20), k.hackles(44), eyes('hurt')];
  c.key(0, GROUND);
  c.snap(0.06, GROUND, seize(1), k.jaw(20), ...stiff);
  c.snap(0.14, GROUND, seize(-1), k.jaw(4), ...stiff);
  c.snap(0.2, GROUND, seize(0.8), k.jaw(22), ...stiff);
  c.key(0.4, GROUND, seize(0.6), k.jaw(18), ...stiff);
  c.snap(0.48, GROUND, seize(-1), k.jaw(6), ...stiff);
  c.snap(0.56, GROUND, seize(0.9), k.jaw(20), ...stiff);
  c.key(0.76, GROUND, body(k, { y: -0.04, spine: 5, neck: 8, head: 6 }), k.jaw(6), k.ears(-12), k.tail(-6), k.hackles(10), eyes('half'));
  c.key(1.1, GROUND, eyes('open'));
  return c.clip('status_paralysis');
}

/** Frozen: locked mid-snarl in the ice; it strains against it, trembling, and heaves once, hard, still held. */
export function statusFreeze(k: Kit): Clip {
  const c = new Take(k);
  const locked = (s: number, f = 1) => body(k, { y: -0.04, z: 0.01 * s, spine: 5, neck: 10, head: -4, roll: 1.5 * s * f, headZ: 1.5 * s * f });
  const ice = [k.jaw(14), k.ears(-20), k.tail(6), k.hackles(20), eyes('closed')];
  c.key(0, GROUND);
  c.key(0.2, GROUND, locked(1), ...ice);
  c.key(0.34, GROUND, locked(-1), ...ice);
  c.key(0.48, GROUND, locked(1), ...ice);
  // Heaves against the ice.
  c.snap(0.6, GROUND, locked(1, 3), body(k, { spine: 2, neck: 3 }), k.jaw(20), k.ears(-30), k.tail(8), k.hackles(28), eyes('hurt'));
  c.key(0.74, GROUND, locked(-1, 3), body(k, { spine: 2, neck: 3 }), k.jaw(20), k.ears(-30), k.tail(8), k.hackles(28), eyes('hurt'));
  c.key(0.9, GROUND, locked(1), ...ice);
  c.key(1.06, GROUND, locked(-1), ...ice);
  c.key(1.4, GROUND, eyes('open'));
  return c.clip('status_freeze');
}

/** Confused: it wobbles off balance, its head swimming in circles, a forepaw stumbling; it blinks and shakes it off. */
export function statusConfusion(k: Kit): Clip {
  const c = new Take(k);
  const swim = (a: number) => body(k, { y: -0.03, spine: 3, neck: 6, head: 4, headY: 14 * Math.cos(a), headZ: 12 * Math.sin(a), roll: 6 * Math.sin(a), x: 0.012 * Math.sin(a) });
  const daze = [k.jaw(10), k.ears(-6), k.tail(-4), k.hackles(0), eyes('look')];
  c.key(0, GROUND);
  c.key(0.2, GROUND, swim(0), ...daze);
  c.key(0.4, GROUND, swim(Math.PI / 2), ...daze);
  c.key(0.6, { plantFeet: 1, plantFront: 0 }, swim(Math.PI), { post: { armR: { x: -25 }, forearmR: { x: 50 } } }, ...daze);
  c.key(0.8, GROUND, swim(Math.PI * 1.5), ...daze);
  c.key(1.0, GROUND, swim(Math.PI * 2), ...daze);
  // Blinks, shakes it off.
  c.key(1.14, GROUND, body(k, { y: -0.02, spine: 2, neck: 3, headY: -12 }), k.jaw(4), eyes('closed'));
  c.key(1.26, GROUND, body(k, { y: -0.02, spine: 2, neck: 3, headY: 10 }), eyes('closed'));
  c.key(1.5, GROUND, eyes('open'));
  return c.clip('status_confusion');
}

/** Infatuated: lovestruck, it sways dreamily, head tilted, tail wagging slow, eyes soft; a sigh. */
export function statusInfatuation(k: Kit): Clip {
  const c = new Take(k);
  const dreamy = (s: number) => [body(k, { y: -0.01, spine: -2, neck: -6, head: -4, headZ: 16 * s, headY: 8 * s, roll: 4 * s }), k.ears(12), k.tail(6, 24 * s, 8), k.hackles(-10), eyes('happy')];
  c.key(0, GROUND);
  c.key(0.3, GROUND, ...dreamy(1));
  c.key(0.62, GROUND, ...dreamy(-1));
  c.key(0.94, GROUND, ...dreamy(1));
  // A sigh.
  c.key(1.1, GROUND, body(k, { y: -0.03, spine: 3, neck: 4, head: 6, headZ: 8 }), k.jaw(12), k.ears(6), k.tail(4, 10), k.hackles(-8), eyes('closed'));
  c.key(1.4, GROUND, eyes('open'));
  return c.clip('status_infatuation');
}

/** Cursed: the curse bears down on it: it sinks and hunches, head low and ears flat, shivering in pain, and hauls itself up. */
export function statusCurse(k: Kit): Clip {
  const c = new Take(k);
  const bowed = (r: number) => body(k, { y: -0.1, z: -0.02, spine: 10, chest: 5, neck: 20, head: 16, roll: r, rump: -6 });
  const pain = [k.jaw(-8), k.ears(-40), k.tail(-30), k.hackles(-16), eyes('hurt')];
  c.key(0, GROUND);
  c.fall(0.3, GROUND, bowed(0), ...pain);
  c.key(0.42, GROUND, bowed(2.5), ...pain);
  c.key(0.52, GROUND, bowed(-2.5), ...pain);
  c.key(0.62, GROUND, bowed(2), ...pain);
  c.key(0.72, GROUND, bowed(-2), ...pain);
  c.key(0.96, GROUND, body(k, { y: -0.04, spine: 4, neck: 8, head: 6 }), k.jaw(-4), k.ears(-20), k.tail(-10), k.hackles(-4), eyes('half'));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('status_curse');
}

/** Nightmare: it slumps asleep and writhes, the head tossing, paws twitching, whimpering in its sleep. */
export function statusNightmare(k: Kit): Clip {
  const c = new Take(k);
  const writhe = (s: number) => [...lying(k, { lift: 12, head: -6, headY: 18 * s, headZ: -10 * s, roll: 5 * s }), { post: { armL: { x: -75 + 22 * s }, armR: { x: -75 - 22 * s } } }, k.jaw(s > 0 ? 16 : 2), k.ears(-30), k.tail(-6, 20 * s), k.hackles(-4), eyes('hurt')];
  c.key(0, GROUND);
  c.key(0.3, GROUND, ...lying(k, {}), k.ears(-18), k.tail(-8), k.hackles(-10), eyes('closed'));
  c.key(0.46, GROUND, ...writhe(1));
  c.key(0.6, GROUND, ...writhe(-1));
  c.key(0.74, GROUND, ...writhe(1));
  c.key(0.88, GROUND, ...writhe(-1));
  c.key(1.02, GROUND, ...writhe(0.6));
  c.key(1.3, GROUND, body(k, { y: -0.05, spine: 3, neck: 8, head: 6 }), k.ears(-12), k.tail(-4), eyes('half'));
  c.key(1.6, GROUND, eyes('open'));
  return c.clip('status_nightmare');
}

/** Wrapped: squeezed by the bind, it strains against it, twisting one way and the other, legs braced, teeth gritted. */
export function statusWrapped(k: Kit): Clip {
  const c = new Take(k);
  const strain = (s: number) => [body(k, { y: -0.06, z: -0.01, spine: 6, turn: 12 * s, roll: -6 * s, neck: 8, neckY: 10 * s, head: 2, headY: 12 * s }), { scale: 0.975 }, k.jaw(-10), k.ears(-34), k.tail(-4, -20 * s), k.hackles(30), eyes('hurt')];
  c.key(0, GROUND);
  c.key(0.18, GROUND, ...strain(1));
  c.key(0.38, GROUND, ...strain(-1));
  c.key(0.58, GROUND, ...strain(1));
  c.key(0.78, GROUND, ...strain(-1));
  c.key(0.98, GROUND, body(k, { y: -0.03, spine: 3, neck: 4 }), k.ears(-12), k.tail(4), k.hackles(14), eyes('angry'));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('status_wrapped');
}

/** Asleep: lying curled, chin on its paws, eyes shut, slow deep breaths; an ear twitches. Loops. */
export function idleAsleep(k: Kit): Clip {
  const c = new Take(k);
  const sleep = (b: number, ear = 0) => [...lying(k, { curl: 14, headY: 8 }), body(k, { y: 0.008 * b, spine: -1.2 * b, chest: -1 * b }), k.jaw(-4), k.ears(-20 + ear), k.tail(-8, 34), k.hackles(-14 + 3 * b), eyes('closed')];
  c.key(0, ...sleep(0));
  c.key(1.2, ...sleep(1));
  c.key(1.9, ...sleep(0.2, 10));
  c.key(2.3, ...sleep(0.4));
  c.key(3.2, ...sleep(0));
  return c.clip('idle_asleep', { loop: true });
}

/** Worn down: panting hard, jaws open, head low and guard sagging, but its eyes stay on the foe. Loops. */
export function idleTired(k: Kit): Clip {
  const c = new Take(k);
  const pant = (b: number) => [body(k, { y: -0.05 - 0.008 * b, spine: 6 + 1.5 * b, chest: 2 * b, neck: 12, head: -2 - 3 * b }), k.jaw(18 + 8 * b), k.ears(-16), k.tail(-10), k.hackles(-6), eyes('half')];
  c.key(0, ...pant(0));
  c.key(0.2, ...pant(1));
  c.key(0.4, ...pant(0));
  c.key(0.6, ...pant(1));
  c.key(0.8, ...pant(0));
  c.key(1.0, ...pant(1));
  c.key(1.2, ...pant(0));
  c.key(1.4, ...pant(0.9));
  c.key(1.6, ...pant(0));
  return c.clip('idle_tired', { loop: true });
}

/** A stat rises: it draws itself up, chest out, hackles and tail bristling, a snarl. */
export function statUp(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.16, GROUND, body(k, { y: -0.03, spine: 4, neck: 6, head: 4 }), k.ears(-6), k.tail(6), k.hackles(10), eyes('angry'));
  c.snap(0.32, GROUND, body(k, { y: 0.012, spine: -8, chest: -6, neck: -10, head: 2 }), k.jaw(16), k.ears(10), k.tail(34, 0, 14), k.hackles(44), eyes('angry'));
  c.key(0.56, GROUND, body(k, { y: 0.012, spine: -8, chest: -6, neck: -10, head: 2, headZ: 2 }), k.jaw(12), k.ears(10), k.tail(34, 0, 14), k.hackles(46), eyes('angry'));
  c.key(0.8, GROUND, body(k, { y: 0.006, spine: -3, neck: -4, head: 0 }), k.jaw(2), k.tail(16), k.hackles(20), eyes('angry'));
  c.key(1.1, GROUND, eyes('open'));
  return c.clip('stat_up');
}

/** A stat falls: it shrinks back, ears flat and tail tucked, unsteady on its paws. */
export function statDown(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.2, GROUND, body(k, { y: -0.07, z: -0.04, spine: 4, neck: 10, head: 14, roll: 4 }), k.ears(-36), k.tail(-30), k.hackles(-16), eyes('hurt'));
  c.key(0.4, GROUND, body(k, { y: -0.075, z: -0.045, spine: 5, neck: 11, head: 15, roll: -4 }), k.ears(-36), k.tail(-30), k.hackles(-16), eyes('look'));
  c.key(0.6, GROUND, body(k, { y: -0.07, z: -0.04, spine: 4, neck: 10, head: 14, roll: 3 }), k.ears(-34), k.tail(-28), k.hackles(-14), eyes('look'));
  c.key(0.86, GROUND, body(k, { y: -0.02, spine: 1, neck: 2, head: 3 }), k.ears(-10), k.tail(-6), eyes('half'));
  c.key(1.16, GROUND, eyes('open'));
  return c.clip('stat_down');
}

/** Level up: a proud little bounce, forepaws off the ground, head up, a yip and a wag. */
export function levelUp(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.14, GROUND, body(k, { y: -0.05, spine: 6, neck: 6, head: -2 }), k.tail(16, 16), k.ears(6), eyes('happy'));
  c.snap(0.26, HIND, body(k, { y: 0.02, z: -0.02, spine: -14, chest: -4, neck: -8, head: -2 }), k.legs.rear, k.jaw(26), k.tail(30, -20, 10), k.ears(12), k.hackles(14), eyes('happy'));
  c.fall(0.4, GROUND, body(k, { y: -0.05, spine: 6, neck: 6, head: -2 }), k.jaw(4), k.tail(24, 22, 8), k.ears(8), eyes('happy'));
  c.key(0.56, GROUND, body(k, { y: -0.01, spine: -2, neck: -4, head: -4, headZ: 8 }), k.tail(22, -22, 8), k.ears(8), eyes('happy'));
  c.key(0.76, GROUND, body(k, { spine: -1, neck: -2, headZ: -4 }), k.tail(14, 14), eyes('happy'));
  c.key(1.04, GROUND, eyes('open'));
  return c.clip('level_up');
}

/** Drained (Leech Seed): it sags as the energy is sapped out of it, knees giving, head drooping, then drags itself back up. */
export function drained(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.06, spine: 5, neck: 12, head: 10 }), k.jaw(8), k.ears(-20), k.tail(-16), k.hackles(-12), eyes('half'));
  c.fall(0.5, GROUND, body(k, { y: -0.1, spine: 7, neck: 20, head: 18, roll: 3 }), k.jaw(12), k.ears(-26), k.tail(-22), k.hackles(-16), eyes('hurt'));
  c.key(0.7, GROUND, body(k, { y: -0.1, spine: 7, neck: 20, head: 18, roll: -2 }), k.jaw(10), k.ears(-26), k.tail(-22), k.hackles(-16), eyes('half'));
  c.key(0.96, GROUND, body(k, { y: -0.03, spine: 2, neck: 6, head: 4 }), k.jaw(2), k.ears(-10), k.tail(-6), eyes('half'));
  c.key(1.26, GROUND, eyes('open'));
  return c.clip('drained');
}

/** Healed: refreshed, it stretches: forelegs out and chest down in a long bow, eyes shut, then rocks forward to stretch the hind legs, and wags. */
export function healed(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  // The long bow: chest down to the ground, forelegs out, rump high, a yawn.
  c.key(0.36, GROUND, body(k, { y: -0.07, z: -0.06, spine: 22, chest: 8, neck: -16, head: -16, rump: 12 }), k.jaw(24), k.ears(-6), k.tail(20, 0, 8), k.hackles(-10), eyes('closed'));
  c.key(0.6, GROUND, body(k, { y: -0.072, z: -0.062, spine: 23, chest: 8, neck: -17, head: -16, rump: 13 }), k.jaw(30), k.ears(-6), k.tail(22, 0, 8), k.hackles(-10), eyes('closed'));
  // Rocks forward, hind legs stretched out behind.
  c.key(0.86, GROUND, body(k, { y: -0.02, z: 0.05, spine: -6, chest: -4, neck: -10, head: -6, rump: -8 }), k.jaw(4), k.ears(6), k.tail(10, 0, 6), k.hackles(-6), eyes('happy'));
  c.key(1.06, GROUND, body(k, { y: -0.01, z: 0.02, spine: -2, neck: -4, head: -2 }), k.ears(8), k.tail(16, 20, 8), eyes('happy'));
  c.key(1.24, GROUND, body(k, { spine: -1, neck: -1 }), k.tail(12, -16, 6), eyes('happy'));
  c.key(1.5, GROUND, eyes('open'));
  return c.clip('healed');
}

/** Focus (Focus Punch's setup): it sinks into a coiled crouch, a forepaw drawn up and back, eyes narrowing to a slit, utterly still but for a tremor. */
export function focus(k: Kit): Clip {
  const c = new Take(k);
  const coil = (s: number) => [{ plantFront: 0 }, body(k, { y: -0.08, z: -0.03, spine: 10, chest: 3, neck: 12, head: -12, rump: 8, roll: 0.8 * s }), { post: { armR: { x: 30 }, forearmR: { x: 90 }, handR: { x: 30 } } }, k.jaw(-8), k.ears(-20), k.tail(20, 0, -10), k.hackles(30), eyes('closed')];
  c.key(0, GROUND);
  c.key(0.24, GROUND, body(k, { y: -0.05, z: -0.02, spine: 6, neck: 8, head: -6 }), k.ears(-12), k.tail(12), k.hackles(18), eyes('angry'));
  c.key(0.46, GROUND, ...coil(1));
  c.key(0.66, GROUND, ...coil(-1));
  c.key(0.86, GROUND, ...coil(1));
  c.key(1.02, GROUND, ...coil(-1), eyes('angry'));
  c.key(1.2, GROUND, body(k, { y: -0.03, spine: 3, neck: 4, head: -2 }), k.ears(-8), k.tail(10), k.hackles(14), eyes('angry'));
  c.key(1.44, GROUND, eyes('open'));
  return c.clip('focus');
}

/** Hanging on at 1 HP: its legs buckle and it lurches, nearly down, then plants itself and bristles up, defiant. */
export function hangOn(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.fall(0.2, GROUND, body(k, { y: -0.12, x: -0.015, spine: 8, neck: 16, head: 14, roll: 10, headZ: 10 }), k.jaw(12), k.ears(-30), k.tail(-24), k.hackles(-10), eyes('hurt'));
  c.key(0.4, GROUND, body(k, { y: -0.11, x: -0.01, spine: 7, neck: 14, head: 12, roll: 6, headZ: 6 }), k.jaw(10), k.ears(-30), k.tail(-22), k.hackles(-8), eyes('hurt'));
  // It holds: plants itself, bristling.
  c.snap(0.56, GROUND, body(k, { y: -0.05, spine: 4, neck: 6, head: -4 }), k.jaw(-8), ...furious(k));
  c.key(0.78, GROUND, body(k, { y: -0.052, spine: 4, neck: 6, head: -4, headZ: 2 }), k.jaw(-6), ...furious(k));
  c.key(1.0, GROUND, body(k, { y: -0.02, spine: 2, neck: 2 }), ...fierce(k, 0.6));
  c.key(1.3, GROUND, eyes('open'));
  return c.clip('hang_on');
}

/** Flinch: startled, it jumps back, ears flat and eyes wide, cringes and falters, glancing aside, before it can steady itself. */
export function flinch(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.snap(0.06, AIR, { root: { y: 0.06, z: -0.06 } }, k.legs.tuck, body(k, { spine: -8, neck: -10, head: -8 }), k.jaw(14), k.ears(-40), k.tail(-26), k.hackles(24), eyes('hurt'));
  c.key(0.22, GROUND, { root: { z: -0.08 } }, body(k, { y: -0.08, spine: 6, neck: 12, head: 14, headY: 14 }), k.jaw(2), k.ears(-38), k.tail(-30), k.hackles(10), eyes('look'));
  c.key(0.42, GROUND, { root: { z: -0.08 } }, body(k, { y: -0.08, spine: 6, neck: 12, head: 14, headY: 20, neckY: 6 }), k.ears(-36), k.tail(-28), k.hackles(6), eyes('look'));
  c.key(0.56, AIR, { root: { y: 0.04, z: -0.04 } }, k.legs.tuck, body(k, { spine: -2, neck: 2 }), k.ears(-16), k.tail(-6), eyes('angry'));
  c.key(0.66, GROUND, { root: { z: 0 } }, body(k, { y: -0.04, spine: 3, neck: 4 }), k.ears(-10), k.tail(4), eyes('angry'));
  c.key(0.9, GROUND, { root: { z: 0 } }, eyes('open'));
  return c.clip('flinch');
}

/** Recharging: spent after its huge move, it sags on trembling legs, head hanging, heaving for breath, unable to move. */
export function recharge(k: Kit): Clip {
  const c = new Take(k);
  const spent = (b: number, r: number) => [body(k, { y: -0.09 - 0.008 * b, spine: 8 + 2 * b, chest: 2 * b, neck: 20, head: 16 - 3 * b, roll: r }), k.jaw(22 + 10 * b), k.ears(-24), k.tail(-24), k.hackles(-12), eyes('half')];
  c.key(0, GROUND);
  c.fall(0.3, GROUND, ...spent(0, 2));
  c.key(0.48, GROUND, ...spent(1, -2));
  c.key(0.66, GROUND, ...spent(0, 2));
  c.key(0.84, GROUND, ...spent(1, -2));
  c.key(1.02, GROUND, ...spent(0, 1));
  c.key(1.26, GROUND, body(k, { y: -0.04, spine: 4, neck: 8, head: 6 }), k.jaw(8), k.ears(-12), k.tail(-8), eyes('half'));
  c.key(1.56, GROUND, eyes('open'));
  return c.clip('recharge');
}

/** Waking up: from its sleep it startles up onto its feet, shakes the sleep out of its head and squares up, on guard. */
export function wake(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND, ...lying(k, { curl: 14, headY: 8 }), k.ears(-20), k.tail(-8, 34), k.hackles(-14), eyes('closed'));
  c.snap(0.14, GROUND, ...lying(k, { lift: 30, head: -12 }), k.ears(12), k.tail(-4, 20), k.hackles(10), eyes('open'));
  c.key(0.38, GROUND, body(k, { y: -0.05, spine: 4, neck: 4, head: -2 }), k.ears(6), k.tail(6), k.hackles(16), eyes('open'));
  c.key(0.5, GROUND, body(k, { y: -0.03, spine: 2, neck: 3, head: 2, headY: 18, headZ: -12 }), k.ears(-10), k.tail(8), k.hackles(18), eyes('closed'));
  c.key(0.62, GROUND, body(k, { y: -0.03, spine: 2, neck: 3, head: 2, headY: -18, headZ: 12 }), k.ears(-10), k.tail(8), k.hackles(18), eyes('closed'));
  c.key(0.8, GROUND, body(k, { y: -0.03, spine: 3, neck: 4, head: -4 }), ...fierce(k, 0.8));
  c.key(1.1, GROUND, eyes('open'));
  return c.clip('wake');
}

/** Shaking it off (thawed, clear-headed, free, cured): a wet dog's shake from the head down the shoulders to the rump and tail, then back on guard. */
export function shakeOff(k: Kit): Clip {
  const c = new Take(k);
  const shake = (s: number, f: number) => [body(k, { y: -0.03, spine: 3, turn: 10 * s * f, roll: 8 * s * f, rumpY: -12 * s * f, neck: 4, neckY: 12 * s * f, headY: 18 * s * f, headZ: -16 * s * f }), k.ears(-14 * s), k.tail(10, -30 * s * f, 6), k.hackles(30), eyes('closed')];
  c.key(0, GROUND);
  c.key(0.12, GROUND, body(k, { y: -0.04, spine: 4, neck: 6 }), k.ears(-8), k.tail(8), k.hackles(16), eyes('half'));
  c.key(0.23, GROUND, ...shake(1, 0.52));
  c.key(0.34, GROUND, ...shake(-1, 0.52));
  c.key(0.45, GROUND, ...shake(1, 0.5));
  c.key(0.56, GROUND, ...shake(-1, 0.45));
  c.key(0.67, GROUND, ...shake(1, 0.4));
  c.key(0.78, GROUND, ...shake(-1, 0.25));
  c.key(0.94, GROUND, body(k, { y: -0.03, spine: 3, neck: 4, head: -2 }), ...fierce(k, 0.7));
  c.key(1.2, GROUND, eyes('open'));
  return c.clip('shake_off');
}

/** Breaking free of a Poké Ball: it bursts up out of a curl snarling, bristling all over, snaps at the air and squares up, furious. */
export function breakFree(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND, body(k, { y: -0.1, spine: 6, neck: 18, head: 16 }), k.ears(-30), k.tail(-20), k.hackles(-10), eyes('closed'));
  c.snap(0.14, GROUND, body(k, { y: 0.01, spine: -8, chest: -5, neck: -8, head: -6 }), k.jaw(34), k.ears(-20), k.tail(34, 0, 12), k.hackles(46), eyes('angry'));
  c.key(0.3, GROUND, body(k, { y: -0.02, z: 0.03, spine: 4, neck: 10, head: -6 }), k.jaw(-10), ...furious(k));
  c.snap(0.38, GROUND, body(k, { y: -0.03, z: 0.05, spine: 6, neck: 14, head: -4 }), k.jaw(30), ...furious(k));
  c.key(0.48, GROUND, body(k, { y: -0.03, z: 0.04, spine: 6, neck: 13, head: -4 }), k.jaw(-10), ...furious(k));
  c.key(0.7, GROUND, body(k, { y: -0.04, spine: 4, neck: 6, head: -4, headY: 8 }), k.jaw(8), ...furious(k));
  c.key(0.9, GROUND, body(k, { y: -0.015, spine: 1, neck: 2 }), ...fierce(k, 0.7));
  c.key(1.2, GROUND, eyes('open'));
  return c.clip('break_free');
}

/** Rain: it hunches under the downpour, ears flat and eyes squinted, then flicks the water off its head. */
export function weatherRain(k: Kit): Clip {
  const c = new Take(k);
  c.key(0, GROUND);
  c.key(0.26, GROUND, body(k, { y: -0.06, spine: 4, neck: 12, head: 10 }), k.ears(-34), k.tail(-18), k.hackles(-16), eyes('half'));
  c.key(0.5, GROUND, body(k, { y: -0.062, spine: 4, neck: 12, head: 11, headZ: 3 }), k.ears(-36), k.tail(-18), k.hackles(-16), eyes('closed'));
  c.key(0.6, GROUND, body(k, { y: -0.04, spine: 3, neck: 8, head: 6, headY: 16, headZ: -14 }), k.ears(-10), k.tail(-10), k.hackles(-10), eyes('closed'));
  c.key(0.7, GROUND, body(k, { y: -0.04, spine: 3, neck: 8, head: 6, headY: -16, headZ: 14 }), k.ears(-10), k.tail(-10), k.hackles(-10), eyes('closed'));
  c.key(0.8, GROUND, body(k, { y: -0.04, spine: 3, neck: 8, head: 6, headY: 10, headZ: -8 }), k.ears(-12), k.tail(-8), k.hackles(-8), eyes('half'));
  c.key(1.0, GROUND, body(k, { y: -0.015, spine: 1, neck: 2 }), k.ears(-4), eyes('half'));
  c.key(1.26, GROUND, eyes('open'));
  return c.clip('weather_rain');
}

/** Harsh sunlight: it squints away from the glare, head turned down and aside, panting in the heat. */
export function weatherSun(k: Kit): Clip {
  const c = new Take(k);
  const hot = (b: number) => [body(k, { y: -0.03 - 0.005 * b, spine: 3, neck: 10, head: 12, headY: -20, neckY: -8, chest: b }), k.jaw(20 + 8 * b), k.ears(-10), k.tail(-6), k.hackles(-8), eyes('half')];
  c.key(0, GROUND);
  c.key(0.22, GROUND, ...hot(0));
  c.key(0.36, GROUND, ...hot(1));
  c.key(0.5, GROUND, ...hot(0));
  c.key(0.64, GROUND, ...hot(1));
  c.key(0.78, GROUND, ...hot(0));
  c.key(1.0, GROUND, body(k, { y: -0.01, neck: 2, head: 2, headY: -4 }), k.jaw(4), eyes('half'));
  c.key(1.26, GROUND, eyes('open'));
  return c.clip('weather_sun');
}

/** Sandstorm: it braces low against the wind, head turned aside and down, eyes shut tight and ears flat, the fur blown back. */
export function weatherSand(k: Kit): Clip {
  const c = new Take(k);
  const braced = (s: number) => [body(k, { y: -0.07, z: -0.02, spine: 6, neck: 12, head: 14, headY: 26 + 2 * s, neckY: 10, roll: -4 + s }), k.jaw(-8), k.ears(-40), k.tail(-10, 16), k.hackles(-20), eyes('closed')];
  c.key(0, GROUND);
  c.key(0.22, GROUND, ...braced(0));
  c.key(0.42, GROUND, ...braced(1.5));
  c.key(0.62, GROUND, ...braced(-1.5));
  c.key(0.82, GROUND, ...braced(1));
  c.key(1.02, GROUND, body(k, { y: -0.02, spine: 2, neck: 3, headY: 6 }), k.ears(-10), eyes('half'));
  c.key(1.26, GROUND, eyes('open'));
  return c.clip('weather_sand');
}

/** Hail: the stones pelt it: it ducks and flinches twice, hunching, eyes screwed shut, then shivers. */
export function weatherHail(k: Kit): Clip {
  const c = new Take(k);
  const duck = [body(k, { y: -0.08, spine: 6, neck: 18, head: 18 }), k.ears(-40), k.tail(-24), k.hackles(-10), eyes('hurt')];
  c.key(0, GROUND);
  c.snap(0.1, GROUND, ...duck);
  c.key(0.26, GROUND, body(k, { y: -0.05, spine: 4, neck: 10, head: 8, headY: 8 }), k.ears(-30), k.tail(-18), k.hackles(-8), eyes('half'));
  c.snap(0.36, GROUND, ...duck, body(k, { headY: -8 }));
  c.key(0.5, GROUND, body(k, { y: -0.06, spine: 5, neck: 12, head: 10, roll: 2 }), k.ears(-32), k.tail(-20), k.hackles(-6), eyes('closed'));
  c.key(0.58, GROUND, body(k, { y: -0.06, spine: 5, neck: 12, head: 10, roll: -2 }), k.ears(-32), k.tail(-20), k.hackles(-6), eyes('closed'));
  c.key(0.66, GROUND, body(k, { y: -0.06, spine: 5, neck: 12, head: 10, roll: 1.5 }), k.ears(-32), k.tail(-20), k.hackles(-6), eyes('closed'));
  c.key(0.9, GROUND, body(k, { y: -0.02, spine: 2, neck: 3 }), k.ears(-10), eyes('half'));
  c.key(1.14, GROUND, eyes('open'));
  return c.clip('weather_hail');
}

/**
 * Intimidate (Mightyena): it draws itself up to its full height, mane and
 * tail bristling, then lowers its head at the foe, lips peeled back from
 * the fangs, and takes one slow, heavy step toward it with a rumbling growl,
 * glaring it down.
 */
export function intimidate(k: Kit): Clip {
  const c = new Take(k);
  const menace = (s: number) => [k.jaw(10 + 2 * s), k.ears(-12), k.tail(38, 0, 14), k.hackles(50), eyes('angry')];
  c.key(0, GROUND);
  // Up to its full height.
  c.key(0.3, GROUND, body(k, { y: 0.014, spine: -8, chest: -6, neck: -12, head: 6 }), k.jaw(-6), k.ears(12), k.tail(36, 0, 14), k.hackles(44), eyes('angry'));
  // The head lowered at the foe, fangs bared; one heavy step: the near forepaw lifted...
  c.key(0.56, GROUND, { plantFront: 0 }, body(k, { y: -0.03, z: 0.02, spine: 8, chest: 2, neck: 18, head: -18 }), { post: { armR: { x: -35 }, forearmR: { x: 55 } } }, ...menace(0));
  // ... and planted, the weight rolling onto it.
  c.snap(0.72, GROUND, body(k, { y: -0.05, z: 0.05, spine: 10, chest: 3, neck: 20, head: -20 }), ...menace(1));
  c.key(0.9, GROUND, body(k, { y: -0.052, z: 0.052, spine: 10, chest: 3, neck: 20, head: -20, headZ: 2 }), ...menace(-1));
  c.key(1.08, GROUND, body(k, { y: -0.05, z: 0.05, spine: 10, chest: 3, neck: 20, head: -20, headZ: -2 }), ...menace(1));
  c.key(1.28, GROUND, body(k, { y: -0.02, z: 0.015, spine: 3, neck: 6, head: -6 }), k.jaw(2), k.tail(16), k.hackles(20), eyes('angry'));
  c.key(1.6, GROUND, eyes('open'));
  return c.clip('intimidate');
}

export const SITUATION_CLIPS = {
  idle,
  intro,
  hit,
  hit_strong: hitStrong,
  faint,
  dodge,
  unaffected,
  return_home: returnHome,
  status_sleep: statusSleep,
  status_poison: statusPoison,
  status_burn: statusBurn,
  status_paralysis: statusParalysis,
  status_freeze: statusFreeze,
  status_confusion: statusConfusion,
  status_infatuation: statusInfatuation,
  status_curse: statusCurse,
  status_nightmare: statusNightmare,
  status_wrapped: statusWrapped,
  idle_asleep: idleAsleep,
  idle_tired: idleTired,
  stat_up: statUp,
  stat_down: statDown,
  level_up: levelUp,
  drained,
  healed,
  focus,
  hang_on: hangOn,
  flinch,
  recharge,
  wake,
  shake_off: shakeOff,
  break_free: breakFree,
  weather_rain: weatherRain,
  weather_sun: weatherSun,
  weather_sand: weatherSand,
  weather_hail: weatherHail,
  intimidate,
};
