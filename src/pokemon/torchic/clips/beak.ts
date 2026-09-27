// Torchic's beak and wing-tuft blows: jabs, a sideways beak chop, a flurry,
// a hammer of the crown, a slap of a wing tuft. Each bounces in to the foe
// (kit: hopIn), lands beside its front turned to it, springs the last bit in
// on a little hop with the blow (kit: springTo), and hops home. The head
// trails the body by 0.045 s: a beak blow lands that much after its key.

import type { Clip } from '../../../anim/clip';
import {
  ANGRY, ARRIVE, BEAK, CROWN, HAPPY, HURT, LAND, OPEN_EYES, STRAIN,
  atFoe, crest, hopHome, hopIn, jaw, key, lean, pelvis, snap, springTo, tail, twist, wingR, wings,
} from './kit';

/**
 * Peck: the beak is the weapon. The head cocks back, it bounces in, then the
 * whole body springs forward and drives the beak into the foe with the wing
 * tufts swept back (the face on the foe: a crown-first dive is the tackle's);
 * it rebounds, gives its head a shake and hops home.
 */
export const peck: Clip = {
  name: 'peck',
  duration: 1.35,
  keys: [
    key(0),
    key(0.1, pelvis(0, 0.004, -0.012), lean(-8, -18), wings(10, -8), crest(-9), tail(-6), ANGRY),
    ...hopIn(0.16, lean(-4, -12), wings(12, -8), crest(-6), ANGRY),
    // Lands and coils, the head drawn back.
    key(0.55, ARRIVE, pelvis(0, 0.004, -0.01), lean(-8, -18), wings(10, -8), crest(-9), tail(-6), ANGRY),
    // The jab: a spring forward, the beak leading, forward and a little down at the foe.
    snap(0.62, springTo(BEAK), pelvis(0, -0.014, 0.022), lean(20, 12), wings(4, -18), crest(-21), tail(-14), jaw(3), ANGRY),
    key(0.7, atFoe(BEAK), LAND, pelvis(0, -0.016, 0.021), lean(21, 13), wings(3, -18), crest(-22), tail(-14), jaw(2), ANGRY),
    // Rebounds and shakes its head once.
    key(0.82, atFoe(BEAK), LAND, pelvis(0, 0.012, -0.004), lean(-3, -6), wings(10, -4), crest(2), jaw(2), ANGRY),
    key(0.92, atFoe(BEAK), LAND, pelvis(0, 0.014), lean(0, -2, 6, 3), ANGRY),
    key(1.0, atFoe(BEAK), LAND, pelvis(0, 0.018), lean(0, -1, -4, -2), ANGRY),
    ...hopHome(1.05, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/**
 * Cut: its beak swung like a blade. It turns its head far aside, beak open,
 * springs in and slashes the beak across the foe's face from its left to its
 * right, the body twisting behind it; the head carries on round and snaps
 * back.
 */
export const cut: Clip = {
  name: 'cut',
  duration: 1.35,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.006), lean(-2, -6, 28, -10), twist(10), wings(16, -6), crest(-4), jaw(10), ANGRY),
    ...hopIn(0.16, lean(-2, -6, 24, -8), twist(8), wings(14, -6), jaw(8), ANGRY),
    key(0.55, ARRIVE, lean(-3, -6, 34, -12), twist(14, 4), wings(18, -8), crest(-4), jaw(16), ANGRY),
    // The slash: the beak sweeps across the foe's face, the body twisting behind it.
    snap(0.62, springTo(BEAK), pelvis(0, -0.012, 0.02), lean(14, 4, -26, 10), twist(-16, -4), wings(10, 10), crest(-12, 6), tail(-10, 8), jaw(24), ANGRY),
    key(0.71, atFoe(BEAK), LAND, pelvis(0, -0.014, 0.018), lean(15, 5, -34, 12), twist(-20, -5), wings(8, 12), crest(-14, 6), tail(-10, 10), jaw(14), ANGRY),
    // Carried round, then it snaps its head back to the foe.
    key(0.84, atFoe(BEAK), LAND, pelvis(0, 0.01), lean(4, -2, -12, 4), twist(-6), wings(8), crest(2), jaw(4), ANGRY),
    key(0.96, atFoe(BEAK), LAND, pelvis(0, 0.016), lean(0, -2), ANGRY),
    ...hopHome(1.02, ANGRY),
    key(1.35, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/** A bob down harder than a landing: the crown's blow drives it into its legs. */
const LAND_BOB = { ...LAND, pelvis: { y: -0.03 } };

/**
 * Rock Smash: its crown as a hammer. It bounces in, rears up tall with its
 * head thrown back, then springs and slams its crown straight down onto the
 * foe as onto a rock; it bounces off the blow and shakes the sting out of
 * its head.
 */
export const rock_smash: Clip = {
  name: 'rock_smash',
  duration: 1.45,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.02), lean(4, 8), wings(6, -10), crest(-10), ANGRY),
    ...hopIn(0.16, lean(2, 4), wings(8, -10), ANGRY),
    // Rears up tall, the head thrown back.
    key(0.55, ARRIVE, pelvis(0, 0.012), lean(-14, -30), wings(26, -10), crest(16, 8), tail(-18), jaw(10), ANGRY),
    key(0.62, atFoe(0), LAND, pelvis(0, 0.016), lean(-16, -34), wings(30, -12), crest(18, 8), tail(-20), jaw(12), ANGRY),
    // The hammer: it springs and its crown slams down onto the foe.
    snap(0.69, springTo(CROWN, 0.04), pelvis(0, -0.02, 0.02), lean(34, 50), wings(-6, -24), crest(-40), tail(-22), ANGRY),
    key(0.78, atFoe(CROWN), LAND_BOB, pelvis(0, -0.03, 0.02), lean(36, 52), wings(-6, -22), crest(-42), tail(-20), jaw(16), ANGRY),
    // Bounces off the blow and shakes the sting out of its head.
    key(0.92, atFoe(CROWN), LAND, pelvis(0, 0.01, -0.006), lean(-6, -10, 8, 6), wings(16, -4), crest(4, 4), tail(-8), jaw(6), HURT),
    key(1.04, atFoe(CROWN), LAND, pelvis(0, 0.012), lean(-2, -4, -8, -5), wings(8), crest(2), jaw(4), ANGRY),
    ...hopHome(1.12, ANGRY),
    key(1.45, OPEN_EYES),
  ],
  events: [{ t: 0.76, name: 'impact' }],
};

/**
 * Smelling Salt: a brisk slap of a wing tuft. It bounces in, cocks its right
 * wing tuft back, springs and slaps it across the foe's face, then shakes the
 * stinging tuft out, pleased with itself.
 */
export const smelling_salt: Clip = {
  name: 'smelling_salt',
  duration: 1.3,
  keys: [
    key(0),
    key(0.1, pelvis(0, -0.004), lean(-2, -4, -10), twist(14), wingR(34, -30), crest(-2), ANGRY),
    ...hopIn(0.16, lean(-2, -4, -8), twist(10), wingR(30, -26), ANGRY),
    key(0.55, ARRIVE, lean(-3, -5, -12), twist(18, 4), wingR(40, -36), tail(-8), ANGRY),
    // The slap: the wing tuft sweeps across the foe's face, the body turning into it.
    snap(0.62, springTo(BEAK), pelvis(0, -0.01, 0.018), lean(10, -2, 12, 4), twist(-16, -4), wingR(46, 40), crest(4, 4), tail(-10), jaw(16), ANGRY),
    key(0.7, atFoe(BEAK), LAND, pelvis(0, -0.012, 0.016), lean(11, -2, 14, 4), twist(-18, -4), wingR(42, 46), tail(-10), jaw(10), ANGRY),
    // A shake of the stinging tuft.
    key(0.8, atFoe(BEAK), LAND, pelvis(0, 0.012), lean(0, -4, 4), twist(-4), wingR(20, 10), HAPPY),
    key(0.87, atFoe(BEAK), LAND, pelvis(0, 0.014), lean(0, -4, 4), twist(-4), wingR(34, -6), HAPPY),
    key(0.94, atFoe(BEAK), LAND, pelvis(0, 0.014), lean(0, -3, 2), wingR(18, 8), HAPPY),
    ...hopHome(1.0, ANGRY),
    key(1.3, OPEN_EYES),
  ],
  events: [{ t: 0.69, name: 'impact' }],
};

/**
 * Reversal: desperate and wild. Hurt, it bounces in and pecks at the foe
 * again and again, head bobbing in a flurry with its wing tufts flapping,
 * the last peck the hardest (one impact: the flurry lands as one blow); it
 * backs off panting.
 */
export const reversal: Clip = {
  name: 'reversal',
  duration: 1.55,
  keys: [
    key(0),
    key(0.12, pelvis(0, -0.02), lean(6, 14, 0, 6), wings(-6, 8), crest(-12), HURT),
    ...hopIn(0.18, lean(2, 4), wings(16, -6), crest(-4), ANGRY),
    key(0.57, ARRIVE, lean(-6, -14), wings(20, -8), ANGRY),
    // The flurry: peck, peck, peck, each springing it a little further in.
    snap(0.62, springTo(BEAK * 0.6), lean(18, 10, 6), wings(30, -12), crest(-16), jaw(8), ANGRY),
    key(0.68, atFoe(BEAK * 0.6), LAND, lean(-4, -10, -4), wings(8, -4), crest(-2), ANGRY),
    snap(0.74, springTo(BEAK * 0.8), lean(18, 10, -6), wings(30, -12), crest(-16), jaw(8), ANGRY),
    key(0.8, atFoe(BEAK * 0.8), LAND, lean(-4, -10, 4), wings(8, -4), crest(-2), ANGRY),
    snap(0.86, springTo(BEAK), lean(22, 12), wings(34, -14), crest(-20), tail(-14), jaw(10), ANGRY),
    key(0.95, atFoe(BEAK), LAND, lean(23, 13), wings(28, -12), crest(-21), tail(-14), jaw(6), ANGRY),
    // Backs off, panting.
    key(1.08, atFoe(BEAK), LAND, pelvis(0, -0.01), lean(4, 12, 0, 6), wings(-4, 6), crest(-8), jaw(20), STRAIN),
    key(1.18, atFoe(BEAK), LAND, pelvis(0, 0.004), lean(2, 8, 0, 4), wings(-2, 4), crest(-6), jaw(8), HURT),
    ...hopHome(1.22, HURT),
    key(1.55, OPEN_EYES),
  ],
  events: [{ t: 0.93, name: 'impact' }],
};


export const BEAK_CLIPS: Clip[] = [peck, cut, rock_smash, smelling_salt, reversal];
