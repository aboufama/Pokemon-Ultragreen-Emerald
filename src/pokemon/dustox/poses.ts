// Dustox poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward; y: + turns toward its left, and sweeps its left
// wing back; z: + raises its left wing, tips an upright bone to its right).
// The bind pose holds it upright with its two wings spread behind it in a
// fan, facing +Z.
import type { Pose } from '../../anim/rig';

/**
 * Battle stance matched to the stock Emerald sprites: it hovers facing the
 * foe, its broad wings brought round to spread out to its sides and raised a
 * little (the sprites draw them wide open), antennae up. It never stands:
 * nothing is planted.
 */
export const STANCE: Pose = {
  plantFeet: 0,
  expression: 'open',
  bones: {
    wingL: { y: -15, z: 6 },
    wingR: { y: 15, z: -6 },
  },
};
