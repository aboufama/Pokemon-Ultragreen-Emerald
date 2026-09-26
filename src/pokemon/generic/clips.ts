// Starter animation set for any species: one clip per attack category (+ idle,
// intro, hit, faint) built from root motion and the common semantic bones
// (spine, chest, neck, head, jaw, tail). Bones a rig does not map are
// skipped, so every body plan (biped, quadruped, serpent, bird, blob) gets a
// readable set on day one of the gauntlet. Species then replace clips with
// bespoke ones (see src/pokemon/blaziken/clips.ts and docs/POKEMON_PIPELINE.md).
//
// Event names and timings match the Blaziken set so the move director drives
// both the same way: impact, release, releaseEnd, charge, aura, emit, cry,
// thud, and the entrance's launch and land.

import type { Clip, Ease, Keyframe } from '../../anim/clip';
import { compose } from '../../anim/animator';
import type { Pose } from '../../anim/rig';

export function makeGenericClips(stance: Pose = {}): Record<string, Clip> {
  const key = (t: number, delta: Pose = {}, ease: Ease = 'inOut'): Keyframe => ({ t, pose: compose(stance, delta), ease });
  const OPEN: Pose = { bones: { jaw: { x: 22 } } };

  const clips: Clip[] = [
    {
      name: 'idle',
      duration: 2.4,
      loop: true,
      keys: [key(0), key(1.2, { root: { y: 0.008 }, bones: { spine: { x: 2 }, head: { x: -2 }, tail: { y: 6 } } }), key(2.4)],
    },
    {
      // Sent out / appears: gather, then rear up with a cry.
      name: 'intro',
      duration: 1.4,
      keys: [
        key(0, { root: { y: -0.02, pitch: 6 }, bones: { spine: { x: 10 }, head: { x: 12 } } }),
        key(0.35, { root: { y: 0.03, pitch: -8 }, bones: { spine: { x: -10 }, head: { x: -18 }, tail: { x: -12 } }, ...OPEN }, 'outBack'),
        key(0.8, { root: { y: 0.02, pitch: -6 }, bones: { spine: { x: -8 }, head: { x: -14 }, tail: { x: -8 } }, ...OPEN }),
        key(1.4),
      ],
      events: [{ t: 0.35, name: 'cry' }],
    },
    {
      // A wild Pokémon comes into the battle (the path is the place's,
      // src/battle3d/entrance.ts): crouch, spring (launch), stretch in the
      // air, land low (land), settle.
      name: 'entrance',
      duration: 1.3,
      keys: [
        key(0, { root: { pitch: 8 }, pelvis: { y: -0.06 }, bones: { spine: { x: 14 }, head: { x: 12 } } }),
        key(0.3, { root: { pitch: -6 }, bones: { spine: { x: -10 }, head: { x: -12 }, tail: { x: -14 } } }, 'out'),
        key(0.6, { root: { pitch: 4 }, bones: { spine: { x: 6 }, head: { x: -4 }, tail: { x: -6 } } }),
        key(0.78, { root: { pitch: 10 }, pelvis: { y: -0.06 }, bones: { spine: { x: 14 }, head: { x: 8 }, tail: { x: 10 } } }, 'out'),
        key(1.0, { root: { pitch: 4 }, pelvis: { y: -0.02 }, bones: { spine: { x: 6 }, head: { x: 2 } } }),
        key(1.3),
      ],
      events: [{ t: 0.3, name: 'launch' }, { t: 0.78, name: 'land' }],
    },
    {
      // Weak contact: short wind-up, dash in, strike, hop back.
      name: 'physical_weak',
      duration: 1.25,
      keys: [
        key(0),
        key(0.16, { root: { z: -0.04, pitch: -6 }, bones: { spine: { x: -8 }, head: { x: 6 } } }, 'out'),
        key(0.36, { advance: 1, root: { pitch: 14 }, bones: { spine: { x: 12 }, head: { x: -6 } } }, 'in'),
        key(0.46, { advance: 1, root: { pitch: 18, yaw: -12 }, bones: { spine: { x: 16, y: -12 }, head: { x: -8, y: 8 } }, ...OPEN }, 'out'),
        key(0.62, { advance: 1, root: { pitch: 10, yaw: -6 } }),
        key(0.9, { advance: 0, root: { y: 0.06 } }),
        key(1.25),
      ],
      events: [{ t: 0.44, name: 'impact' }],
    },
    {
      // Strong contact: crouch, leap, body slam, recover.
      name: 'physical_strong',
      duration: 2.0,
      keys: [
        key(0),
        key(0.32, { root: { y: -0.03, pitch: -10 }, bones: { spine: { x: -12 }, head: { x: 10 }, tail: { x: 16 } } }, 'out'),
        key(0.56, { advance: 0.65, root: { y: 0.22, pitch: 10 }, bones: { spine: { x: 6 }, tail: { x: -16 } } }, 'out'),
        key(0.8, { advance: 1, root: { y: 0.04, pitch: 28 }, bones: { spine: { x: 18 }, head: { x: -12 } }, ...OPEN }, 'in'),
        key(1.05, { advance: 1, root: { pitch: 12 }, bones: { spine: { x: 10 } } }),
        key(1.28, { advance: 1, root: { pitch: 4 } }),
        key(1.62, { advance: 0, root: { y: 0.08 } }),
        key(2.0),
      ],
      events: [{ t: 0.8, name: 'impact' }],
    },
    {
      // Weak ranged: rear back, snap forward and spit/fire a projectile.
      name: 'special_weak',
      duration: 1.15,
      keys: [
        key(0),
        key(0.22, { root: { pitch: -8 }, bones: { spine: { x: -10 }, head: { x: -14 } } }, 'out'),
        key(0.42, { root: { pitch: 10, z: 0.02 }, bones: { spine: { x: 14 }, head: { x: 8 } }, ...OPEN }, 'outBack'),
        key(0.7, { root: { pitch: 8, z: 0.015 }, bones: { spine: { x: 12 }, head: { x: 6 } }, ...OPEN }),
        key(1.15),
      ],
      events: [{ t: 0.44, name: 'release' }],
    },
    {
      // Strong ranged: charge up (swell), then hold a sustained blast.
      name: 'special_strong',
      duration: 2.2,
      keys: [
        key(0),
        key(0.3, { scale: 1.03, root: { y: -0.02, pitch: -6 }, bones: { spine: { x: -8 }, head: { x: -10 } } }, 'out'),
        key(0.45, { scale: 1.0, root: { y: -0.02, pitch: -6 }, bones: { spine: { x: -8 }, head: { x: -10 } } }),
        key(0.6, { scale: 1.04, root: { y: -0.025, pitch: -7 }, bones: { spine: { x: -9 }, head: { x: -11 } } }),
        key(0.8, { root: { pitch: 12, z: 0.02 }, bones: { spine: { x: 16 }, head: { x: 6 } }, ...OPEN }, 'outBack'),
        key(1.2, { root: { pitch: 11, z: 0.02 }, bones: { spine: { x: 15 }, head: { x: 6, y: 3 } }, ...OPEN }),
        key(1.55, { root: { pitch: 12, z: 0.02 }, bones: { spine: { x: 16 }, head: { x: 6, y: -3 } }, ...OPEN }),
        key(2.2),
      ],
      events: [{ t: 0.1, name: 'charge' }, { t: 0.8, name: 'release' }, { t: 1.6, name: 'releaseEnd' }],
    },
    {
      // Self status (Growth, Harden, Bulk Up...): gather, then puff up.
      name: 'status_self',
      duration: 1.6,
      keys: [
        key(0),
        key(0.35, { root: { y: -0.03, pitch: 8 }, bones: { spine: { x: 12 }, head: { x: 14 } } }, 'out'),
        key(0.72, { scale: 1.06, root: { y: 0.01, pitch: -6 }, bones: { spine: { x: -10 }, head: { x: -14 }, tail: { x: -14 } } }, 'outBack'),
        key(1.05, { scale: 1.05, root: { y: 0.01, pitch: -6 }, bones: { spine: { x: -10 }, head: { x: -14, y: 4 } } }),
        key(1.6),
      ],
      events: [{ t: 0.72, name: 'aura' }],
    },
    {
      // Status aimed at the foe (Growl, Leer, Sand-Attack): lean in and roar.
      name: 'status_target',
      duration: 1.35,
      keys: [
        key(0),
        key(0.3, { root: { pitch: 10, z: 0.02 }, bones: { spine: { x: 12 }, head: { x: -10 } }, ...OPEN }, 'out'),
        key(0.55, { root: { pitch: 10, z: 0.02, yaw: 8 }, bones: { spine: { x: 12 }, head: { x: -10, y: 8 } }, ...OPEN }),
        key(0.8, { root: { pitch: 10, z: 0.02, yaw: -8 }, bones: { spine: { x: 12 }, head: { x: -10, y: -8 } }, ...OPEN }),
        key(1.35),
      ],
      events: [{ t: 0.32, name: 'emit' }],
    },
    {
      name: 'hit',
      duration: 0.6,
      keys: [
        key(0),
        key(0.07, { root: { z: -0.05, pitch: -8 }, bones: { spine: { x: -10 }, head: { x: -14 } } }, 'out'),
        key(0.28, { root: { z: -0.03, pitch: -4 }, bones: { spine: { x: -5 }, head: { x: -7 } } }),
        key(0.6),
      ],
    },
    {
      // Faint: stagger, slump and sink into the ground (the ground hides it).
      name: 'faint',
      duration: 1.7,
      keys: [
        key(0),
        key(0.3, { root: { z: -0.04, pitch: -8 }, bones: { spine: { x: -10 }, head: { x: -16 } } }, 'out'),
        key(0.85, { root: { y: -0.05, pitch: 22 }, bones: { spine: { x: 20 }, head: { x: 26 } } }, 'in'),
        key(1.15, { root: { y: -0.06, pitch: 26 }, bones: { spine: { x: 24 }, head: { x: 30 } } }),
        key(1.7, { root: { y: -1.1, pitch: 26 }, bones: { spine: { x: 24 }, head: { x: 30 } } }, 'in'),
      ],
      events: [{ t: 0.85, name: 'thud' }],
    },
  ];
  return Object.fromEntries(clips.map((c) => [c.name, { ...c, generic: true }]));
}
