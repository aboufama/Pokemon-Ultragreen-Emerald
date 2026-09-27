// Mightyena's kit for the Poochyena line's choreography
// (src/pokemon/poochyena/line): its own stance, beat and body. A 37 kg pack
// hunter: slower and heavier than Poochyena (a longer beat, deeper
// crouches and landings), it stalks before it pounces and its pounce is a
// long, high explosion; a neck of two bones under a long mane, a heavy
// brush of a tail on five bones, shaggy tufts on its shoulders, flanks and
// rump.
import type { Pose } from '../../anim/rig';
import type { Kit } from '../poochyena/line/kit';
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
 * height short of the foe's front (Mightyena's stance reaches 0.658 of its
 * height in front of its root). Its pounces close that gap: every key at
 * the foe stands this much further in (heights, scaled by advance), so it
 * lands with the fronts touching and its head and forequarters drawn back
 * (the jaws about 0.1 of a height off the foe); the bite, ram or swipe then
 * snaps in to contact on the impact key, and the rebound opens the gap again.
 */
export const FOE_Z = 0.15;

const both = (x: number, y = 0, z = 0) => ({ x, y, z });

export const KIT: Kit = {
  slug: 'mightyena',
  stance: STANCE,
  T: 1.15,
  A: 1.1,
  headLag: 0.065,
  foeZ: FOE_Z,
  arc: 0.2,
  stalk: 0.3,
  straight: { bones: { hips: { y: 40 } } },
  lieY: -0.28,
  lieRump: -6,
  sleepNeck: 66,
  sleepHead: 4,
  neck: (x, y = 0, z = 0) => ({ bones: { neck: both(x * 0.55, y * 0.5, z * 0.5), neck2: both(x * 0.45, y * 0.5, z * 0.5) } }),
  jaw: (deg) => ({ bones: { jaw: { x: deg } } }),
  ears: (deg) => ({ bones: { earL: { x: deg }, earR: { x: deg } } }),
  tail: (x, y = 0, curl = 0) => ({
    bones: { tail: { x, y }, tail2: { x: curl * 0.3 }, tail3: { x: curl * 0.3 }, tail4: { x: curl * 0.25 }, tail5: { x: curl * 0.2 } },
  }),
  hackles: (deg) => ({
    bones: {
      mane: { x: deg * 0.7 },
      furShoulderL: { x: deg * 0.5 }, furShoulderR: { x: deg * 0.5 },
      furFlankL: { x: deg * 0.5 }, furFlankR: { x: deg * 0.5 },
      furRumpL: { x: deg * 0.45 }, furRumpR: { x: deg * 0.45 },
      furHipL: { x: deg * 0.35 }, furHipR: { x: deg * 0.35 },
    },
  }),
  legs: {
    push: legs([-50, -10, 30], [35, 10, 35]),
    fly: legs([-70, -5, 20], [55, 20, 40]),
    reach: legs([-35, -5, 10], [-20, 25, 10]),
    tuck: legs([15, 70, 30], [-35, 45, -10]),
    rear: legs([-30, 60, 30], [0, 0, 0]),
    paws: legs([-80, -20, 10], [0, 0, 0]),
    lie: legs([-80, -10, 80], [-60, 100, -100]),
  },
};
