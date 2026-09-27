// Poochyena's kit for the line's choreography (./line): its own stance,
// beat and body. A 13.6 kg hyena pup: quick (the line is timed on its
// beat), a low flat dart of a leap, a single neck bone, a brush of a tail
// on four bones and hackles along its back.
import type { Pose } from '../../anim/rig';
import type { Kit } from './line/kit';
import { STANCE } from './poses';

const legs = (front: [number, number, number], hind: [number, number, number]): Pose => ({
  post: {
    armL: { x: front[0] }, armR: { x: front[0] },
    forearmL: { x: front[1] }, forearmR: { x: front[1] },
    handL: { x: front[2] }, handR: { x: front[2] },
    thighL: { x: hind[0] }, thighR: { x: hind[0] },
    shinL: { x: hind[1] }, shinR: { x: hind[1] },
    footL: { x: hind[2] }, footR: { x: hind[2] },
  },
});

/**
 * At advance 1 the engine stops the attacker with its front 0.15 of its own
 * height short of the foe's front (Poochyena's stance reaches 0.663 of its
 * height in front of its root). Its pounces close that gap: every key at
 * the foe stands this much further in (heights, scaled by advance), so it
 * lands with the fronts touching and its head and forequarters drawn back
 * (the jaws about 0.1 of a height off the foe); the bite, ram or swipe then
 * snaps in to contact on the impact key, and the rebound opens the gap again.
 */
export const FOE_Z = 0.15;

export const KIT: Kit = {
  slug: 'poochyena',
  stance: STANCE,
  T: 1,
  A: 1,
  headLag: 0.05,
  foeZ: FOE_Z,
  arc: 0.16,
  stalk: 0,
  straight: { bones: { hips: { y: 50 } } },
  lieY: -0.22,
  lieRump: 0,
  sleepNeck: 40,
  sleepHead: 12,
  neck: (x, y = 0, z = 0) => ({ bones: { neck: { x, y, z } } }),
  jaw: (deg) => ({ bones: { jaw: { x: deg } } }),
  ears: (deg) => ({ bones: { earL: { x: deg }, earR: { x: deg } } }),
  tail: (x, y = 0, curl = 0) => ({ bones: { tail: { x, y }, tail2: { x: curl * 0.5 }, tail3: { x: curl * 0.3 }, tail4: { x: curl * 0.2 } } }),
  hackles: (deg) => ({ bones: { mane: { x: deg }, maneB: { x: deg * 0.8 }, furL: { x: deg * 0.5 }, furR: { x: deg * 0.5 } } }),
  legs: {
    push: legs([-50, -10, 30], [35, 10, 35]),
    fly: legs([-70, -5, 20], [55, 20, 40]),
    reach: legs([-35, -5, 10], [-20, 25, 10]),
    tuck: legs([15, 70, 30], [-35, 45, -10]),
    rear: legs([-30, 60, 30], [0, 0, 0]),
    paws: legs([-80, -20, 10], [0, 0, 0]),
    lie: legs([-80, -10, 80], [-60, 100, -80]),
  },
};
