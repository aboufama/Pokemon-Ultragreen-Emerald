// Beautifly poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward, - lifts a bone that points forward; y: + turns
// toward its left, and sweeps its left wing back; z: + raises its left wing,
// tips an upright bone to its right). The bind pose holds the wings spread
// flat and wide like a pinned specimen, the proboscis hanging straight down
// in front and the hindwing streamers splayed, facing +Z.
import type { Pose } from '../../anim/rig';

/** The proboscis coiled into its spiral under the face (each of its twelve joints curled up). */
const COIL: Pose['bones'] = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`proboscis${i + 1}`, { x: -32 }]));

/**
 * Battle stance matched to the stock Emerald sprites: it hovers facing the
 * foe with its wings raised and swept back into a V over its back (the
 * sprites draw them up), the hindwings lower with their tail streamers
 * hanging, the proboscis coiled in its spiral and the antennae up. It never
 * stands: nothing is planted.
 */
export const STANCE: Pose = {
  plantFeet: 0,
  bones: {
    ...COIL,
    wingL: { y: 24, z: 18 },
    wingR: { y: -24, z: -18 },
    hindL: { z: -18 },
    hindR: { z: 18 },
    hind3L: { z: -14 },
    hind3R: { z: 14 },
    hind4L: { z: -16 },
    hind4R: { z: 16 },
    antenna1L: { x: 12 },
    antenna1R: { x: 12 },
    handL: { x: 20 },
    handR: { x: 20 },
    footL: { x: -20 },
    footR: { x: -20 },
  },
};
