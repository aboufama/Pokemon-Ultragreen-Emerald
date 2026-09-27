import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'linoone',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'The rushing Pokémon (0.5 m, 32.5 kg): a long, low weasel on short legs, exceedingly fast as long as it runs in ' +
        'a straight line. Where Zigzagoon wanders in zigzags, Linoone locks its eyes on the foe and bolts at it dead ' +
        'straight, belly skimming the ground, legs a blur, and stops short on its forepaws. Sleek and controlled: a ' +
        'coiled crouch, then everything at once. It fights with its sharp claws (the Pokédex: it leaps on pond prey and ' +
        'catches it with them), rams with its long body at full speed, and whips its long striped tail; twice ' +
        "Zigzagoon's weight, it lands with it.",
      powerSource:
        'Its claws and its speed: it rakes and slashes with the two big claws of each forepaw, rams with its forehead ' +
        'and shoulders at full tilt, swings its long tail like a club and scoops the ground with its forepaws. What it ' +
        'fires leaves its small mouth (spits, beams, roars); its long fur bristles and crackles with electricity.',
    },
    // Where its effects leave the body besides the built-in mouth, eyes,
    // hands (its forepaws), feet and body.
    emitters: {
      tail: { bones: ['tail4'], about: 'its long striped tail, swept up behind it' },
      fur: { bones: ['chest', 'hips'], about: 'the long fur along its back, bristling' },
    },
    emitterFor: {
      // Sand-Attack, Mud Sport and Mud-Slap are scooped with the forepaws.
      kick_sand: 'hands',
      fling: 'hands',
    },
    // Loose parts on springs: the long tail (its base is keyframed, the rest
    // flows and overshoots), the ears (stiff) and the tufts of cheek fur.
    dynamics: [
      { bones: ['tail2', 'tail3', 'tail4'], damping: 0.16, elasticity: 0.07, maxDrift: 0.4 },
      { bones: ['earL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['earR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['cheekL', 'cheekTipL'], damping: 0.2, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['cheekR', 'cheekTipR'], damping: 0.2, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['jowlL', 'jowlTipL'], damping: 0.22, elasticity: 0.14, maxDrift: 0.25 },
      { bones: ['jowlR', 'jowlTipR'], damping: 0.22, elasticity: 0.14, maxDrift: 0.25 },
    ],
    // The long tail ripples out from the rump, each joint a little later.
    overlap: { ...DEFAULT_OVERLAP, tail: 0.04, tail2: 0.07, tail3: 0.1, tail4: 0.13, cheekL: 0.08, cheekR: 0.08, jowlL: 0.08, jowlR: 0.08 },
    moveClips: {},
    motifClips: {},
    hiddenParts: [],
    showcaseMoves: ['FURY_SWIPES', 'SLASH', 'BELLY_DRUM', 'SHADOW_BALL'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
