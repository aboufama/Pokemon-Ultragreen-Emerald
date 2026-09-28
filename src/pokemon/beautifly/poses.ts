// Beautifly poses.
//
// `bones`: rotations in degrees about model axes at bind pose (x: + tips the
// top of a bone forward, swings a hanging part back; y: + turns toward its
// left, and sweeps its left wing back; z: + raises its left wing, tips an
// upright bone to its right). The bind pose holds the wings spread flat and
// wide like a pinned specimen, the proboscis reaching forward and down from
// the face and the hindwing streamers splayed out to the ground, facing +Z.
import type { Pose } from '../../anim/rig';

/** The proboscis coiled into its spiral under the face (each of its twelve joints curled up). */
const COIL: Pose['bones'] = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`proboscis${i + 1}`, { x: -32 }]));

/** The same rotation on both sides, given for the left one (y and z mirror on the right). */
function sides(bones: Record<string, { x?: number; y?: number; z?: number }>): NonNullable<Pose['bones']> {
  const out: NonNullable<Pose['bones']> = {};
  for (const [k, r] of Object.entries(bones)) {
    out[`${k}L`] = { x: r.x ?? 0, y: r.y ?? 0, z: r.z ?? 0 };
    out[`${k}R`] = { x: r.x ?? 0, y: -(r.y ?? 0), z: -(r.z ?? 0) };
  }
  return out;
}

/**
 * Battle stance: it hovers squared up to the foe, the thorax tipped a little
 * toward it and the head up on it, its wings raised in the V the stock
 * sprites draw (the top of a wing beat: the idle beats down from here and
 * back), the hindwings' long streamers hanging under and behind the body
 * (not splayed to the ground), the proboscis coiled in its spiral, antennae
 * up and forward, the little legs tucked. It never stands: nothing is planted.
 */
export const STANCE: Pose = {
  plantFeet: 0,
  bones: {
    ...COIL,
    spine: { x: 5 },
    head: { x: -4 },
    hips: { x: -6 },
    ...sides({
      wing: { y: 24, z: 10 },
      hind: { y: 10, z: -10 },
      hind2: { x: 14, y: 16, z: -8 },
      hind3: { x: 12, y: 10, z: -20 },
      hind4: { x: 10, y: 6, z: -16 },
      hind5: { x: 8 },
      antenna1: { x: 12 },
      hand: { x: 20 },
      foot: { x: -20 },
    }),
  },
};
