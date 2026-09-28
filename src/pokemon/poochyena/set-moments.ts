// Poochyena's battle moments: idle, intro, hit and faint, in the shape of
// the first clips' (src/pokemon/blaziken/first.ts).

import type { Clip } from '../../anim/clip';
import {
  ANGRY, DROWSY, HURT, OPEN_EYES, REAR, SHUT, bend, ears, fore, hackles, jaw, key, pelvis, root, snap, tail,
} from './set-base';

/** Breathing on all fours, the brush of a tail swaying; the life layer adds the rest. */
const idle: Clip = {
  name: 'idle',
  duration: 2.4,
  loop: true,
  keys: [
    key(0),
    key(1.2, pelvis(0, -0.008), bend(1.5, 0, 2, -2), ears(3), tail(4, 6)),
    key(2.4),
  ],
};

/**
 * Sent out: curled up small, head down and tail tucked, it springs up onto
 * its hind legs with a yapping bark (jaws wide, hackles and tail flung up),
 * holds it with a shake of the head, drops back onto its forepaws and
 * bristles into its stance. The rear stays low: from our side the foe's
 * healthbox is above its ears.
 */
const intro: Clip = {
  name: 'intro',
  duration: 1.65,
  keys: [
    key(0, pelvis(0, -0.07, -0.03), bend(12, 4, 16, 18), ears(-26), hackles(-14), tail(-34), SHUT),
    // Curling tighter.
    key(0.2, pelvis(0, -0.085, -0.035), bend(15, 5, 18, 21), ears(-28), hackles(-16), tail(-38), SHUT),
    // Bursting up: a spring onto its hind legs, the bark.
    snap(0.42, REAR(16), fore(-24, 30, 14), bend(0, -4, -12, -16), jaw(34), ears(10), hackles(26), tail(34), ANGRY),
    // Yapping (a moving hold, the head shaking).
    key(0.6, REAR(17), fore(-26, 34, 16), bend(0, -4, -12, -14, 0, 6), jaw(28), ears(8), hackles(28), tail(36, 10), ANGRY),
    key(0.8, REAR(16), fore(-24, 32, 14), bend(0, -4, -13, -15, 0, -6), jaw(32), ears(10), hackles(28), tail(34, -10), ANGRY),
    // Down onto its forepaws with a stamp.
    key(0.98, pelvis(0, -0.035), bend(8, 2, -4, -6), jaw(10), ears(4), hackles(24), tail(24), ANGRY),
    // Bristling into its stance.
    key(1.2, pelvis(0, -0.014), bend(3, 1, 0, -2), jaw(2), hackles(12), tail(10), ANGRY),
    key(1.65, OPEN_EYES),
  ],
  events: [{ t: 0.48, name: 'cry' }],
};

/**
 * Taking a hit: it yelps and cringes (the battler adds a sprung recoil), the
 * head thrown back, ears flat and tail tucked, then bristles up again.
 */
const hit: Clip = {
  name: 'hit',
  duration: 0.62,
  keys: [
    key(0),
    snap(0.05, pelvis(0, -0.02, -0.035), bend(-8, -4, -14, -12), jaw(14), ears(-30), hackles(-10), tail(-26), HURT),
    key(0.2, pelvis(0, -0.012, -0.02), bend(-3, -2, -6, -5), jaw(6), ears(-16), hackles(-4), tail(-12), HURT),
    key(0.36, pelvis(0, -0.004), bend(2, 1, 2, 3), jaw(0), ears(-4), hackles(4), tail(-2), HURT),
    key(0.62, OPEN_EYES),
  ],
};

/**
 * Fainting, as the 3D games show it (worn out, not dying): a tired sway,
 * then it sinks back onto its haunches and lies down curled up, head bowed
 * onto its forepaws, ears flat and the tail curled round, eyes shut; from
 * the 'shrink' the curled body shrinks away (Battler3D). It settles back
 * over its hind legs rather than forward: the foe's head stays off our
 * healthbox.
 */
const faint: Clip = {
  name: 'faint',
  duration: 1.6,
  keys: [
    key(0),
    key(0.18, root({ z: -0.02 }), bend(-4, -2, -6, -8), ears(-10), hackles(-6), tail(-10), DROWSY),
    key(0.48, pelvis(0, -0.08, -0.04), root({ z: -0.03 }), bend(6, 2, 10, 14), ears(-22), hackles(-14), tail(-24, 20), SHUT),
    key(0.82, pelvis(0, -0.17, -0.07), root({ z: -0.05 }), bend(10, 4, 16, 22), ears(-28), hackles(-18), tail(-22, 40), SHUT),
    key(0.96, pelvis(0, -0.18, -0.072), root({ z: -0.05 }), bend(11, 4, 17, 23), ears(-29), hackles(-18), tail(-22, 42), SHUT),
    key(1.6, pelvis(0, -0.176, -0.07), root({ z: -0.05 }), bend(10, 4, 16, 22), ears(-28), hackles(-18), tail(-21, 41), SHUT),
  ],
  events: [{ t: 1.04, name: 'shrink' }],
};

export const MOMENTS: Clip[] = [idle, intro, hit, faint];
