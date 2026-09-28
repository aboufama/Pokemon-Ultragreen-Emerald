import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CASCOON_CLIPS, CASCOON_EXPRESSIONS } from './set';
import calibration from './calibration.json';

/**
 * CASCOON: Wurmple's other cocoon. It hides motionless and glares out of the
 * opening in its silk; it has no limbs, so it hops, tips and throws its
 * whole shell, and spits thread and barbs from the opening.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'cascoon',
    rig: RIG,
    poses: { stance: STANCE },
    // Its clips, one per action its moves take, written by hand (./set.ts).
    clips: CASCOON_CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'blob',
      character: 'A purple silk cocoon on the tips of its silk strands (0.7 m, 11.5 kg), heavier than Silcoon. It hides motionless under leaves and in the gaps of branches, so it keeps still, hunkered, and glares out of the opening in its silk. When it does move it is heavy, stiff and grumpy: it hunches its brow forward and squats rather than rocking back, hops low and thuds down deep, rams and grinds with its whole shell, clenches with its eyes open, and keeps its glare on the foe throughout.',
      powerSource: 'Its whole body for Tackle (it throws itself at the foe); the opening in its silk, where its eyes glare out, for String Shot and Poison Sting; Harden tenses and stiffens its silk.',
    },
    // The eye texture is an atlas of 4 x 2 cells (eye_mat): offsets from the
    // open eye; blinks come from its half and closed cells.
    expressions: { material: 'eye_mat', cell: [0.25, 0.5], cells: CASCOON_EXPRESSIONS },
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
    // The category clips its moves take, each the action of its moves'
    // motif: its blow is the Tackle's ram, its spat barb Poison Sting, its
    // self-status Harden, its status at the foe String Shot's thread.
    motifClips: {
      tackle: 'physical_weak',
      spit: 'special_weak',
      shield: 'status_self',
      powder: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'STRING_SHOT', 'HARDEN', 'POISON_STING'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
