import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

/**
 * SILCOON: Wurmple's silk cocoon. It keeps watch through the opening in its
 * silk with its two eyes; it has no limbs, so it hops, tips and throws its
 * whole body, and spits thread and barbs from the opening.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'silcoon',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'blob',
      character: 'A silk cocoon resting on the tips of its silk strands (0.6 m, 10 kg), still living on the energy it stored as a Wurmple. It has no limbs: it hops, tips, rocks and wobbles, and throws its whole body at a foe. Watchful: it keeps watch over its surroundings through the opening in its silk with its two eyes, narrowing them at a foe. Light for a cocoon, so its hops are springy and its strands quiver.',
      powerSource: 'Its whole body for Tackle (it throws itself at the foe); the opening in its silk, between its eyes, for String Shot and Poison Sting; Harden tenses and stiffens its silk.',
    },
    // The eye texture is an atlas of 4 x 2 cells (eye_mat): offsets from the
    // open eye; blinks come from its half and closed cells.
    expressions: { material: 'eye_mat', cell: [0.25, 0.5], cells: EXPRESSIONS },
    emitters: {
      opening: { bones: ['opening'], offset: [0, 0, 0], about: 'the opening in its silk between its two eyes, where it spits thread and fires barbs' },
    },
    // Moves by body part, set by hand (Jev needs an API key this checkout
    // does not have): thread and barbs leave the silk opening; Tackle and
    // Harden are the whole body.
    emitterFor: { powder: 'opening', spit: 'opening' },
    // The silk strands that don't touch the ground quiver on springs: stiff
    // silk, springy on a hop or a hit.
    dynamics: [
      { bones: ['strandTop'], damping: 0.22, elasticity: 0.14, maxDrift: 0.3 },
      { bones: ['strandUpL'], damping: 0.22, elasticity: 0.14, maxDrift: 0.3 },
      { bones: ['strandUpR'], damping: 0.22, elasticity: 0.14, maxDrift: 0.3 },
      { bones: ['strandL'], damping: 0.24, elasticity: 0.16, maxDrift: 0.28 },
      { bones: ['strandR'], damping: 0.24, elasticity: 0.16, maxDrift: 0.28 },
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
