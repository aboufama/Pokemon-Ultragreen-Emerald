import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

/**
 * CASCOON: Wurmple's other cocoon. It hides motionless and glares out of the
 * opening in its silk; it has no limbs, so it hops, tips and throws its
 * whole body, and spits thread and barbs from the opening. Its ability,
 * Shed Skin, sheds a status condition (shake_off).
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'cascoon',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'blob',
      character: 'A purple silk cocoon on the tips of its silk strands (0.7 m, 11.5 kg), heavier than Silcoon. It hides motionless under leaves and in the gaps of branches, so it keeps still and glares out of the opening in its silk rather than watching round; when it does move it is slow, stiff and grumpy: heavy hops, tips and rocks of its whole body, which it throws at a foe. With Shed Skin it shivers and heaves an ailment off with its old skin.',
      powerSource: 'Its whole body for Tackle (it throws itself at the foe); the opening in its silk, where its eyes glare out, for String Shot and Poison Sting; Harden tenses and stiffens its silk.',
    },
    // The eye texture is an atlas of 4 x 2 cells (eye_mat): offsets from the
    // open eye; blinks come from its half and closed cells.
    expressions: { material: 'eye_mat', cell: [0.25, 0.5], cells: EXPRESSIONS },
    emitters: {
      opening: { bones: ['opening'], offset: [0, 0, 0], about: 'the opening in its silk where its eyes glare out, where it spits thread and fires barbs' },
    },
    // Moves by body part, set by hand (Jev needs an API key this checkout
    // does not have): thread and barbs leave the silk opening; Tackle and
    // Harden are the whole body.
    emitterFor: { powder: 'opening', spit: 'opening' },
    // The silk strands that don't touch the ground quiver on springs: stiffer
    // and heavier than Silcoon's.
    dynamics: [
      { bones: ['strandTop'], damping: 0.26, elasticity: 0.17, maxDrift: 0.26 },
      { bones: ['strandUpL'], damping: 0.26, elasticity: 0.17, maxDrift: 0.26 },
      { bones: ['strandUpR'], damping: 0.26, elasticity: 0.17, maxDrift: 0.26 },
      { bones: ['strandL'], damping: 0.28, elasticity: 0.18, maxDrift: 0.24 },
      { bones: ['strandR'], damping: 0.28, elasticity: 0.18, maxDrift: 0.24 },
    ],
    moveClips: {},
    // Its moves' motifs, played by its own clips (it learns no move that
    // calls others: Mimic, Mirror Move...).
    motifClips: {
      tackle: 'tackle',
      shield: 'harden',
      powder: 'string_shot',
      spit: 'poison_sting',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'STRING_SHOT', 'HARDEN', 'POISON_STING'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
