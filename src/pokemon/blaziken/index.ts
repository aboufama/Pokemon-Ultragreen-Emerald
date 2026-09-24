import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { BLAZIKEN_RIG } from './rig';
import { STANCE } from './poses';
import { BLAZIKEN_CLIPS, BLAZIKEN_EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'blaziken',
    rig: BLAZIKEN_RIG,
    poses: { stance: STANCE },
    clips: BLAZIKEN_CLIPS,
    effectParts: ['Fire'],
    effects: {
      // Colors from Blaziken's own palette ramp (yellows -> orange -> red).
      flames: { parts: ['Fire'], fire: { core: '#fff69c', mid: '#ffd56a', edge: '#ff7b52' } },
    },
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: BLAZIKEN_EXPRESSIONS },
    // Loose parts on springs (each is a single bone; the virtual end comes
    // from the skin). The mane is long and loose, the feathers stiffer.
    dynamics: [
      { bones: ['hairTipL'], damping: 0.14, elasticity: 0.05, maxDrift: 0.55 },
      { bones: ['hairTipR'], damping: 0.14, elasticity: 0.05, maxDrift: 0.55 },
      { bones: ['tail'], damping: 0.2, elasticity: 0.1, maxDrift: 0.45 },
      { bones: ['wristFxL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['wristFxR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['ankleFxL'], damping: 0.25, elasticity: 0.18, maxDrift: 0.35 },
      { bones: ['ankleFxR'], damping: 0.25, elasticity: 0.18, maxDrift: 0.35 },
    ],
    moveClips: {
      MOVE_DOUBLE_KICK: 'physical_weak_kick',
      MOVE_LOW_KICK: 'physical_weak_kick',
      MOVE_SAND_ATTACK: 'status_target_kick',
    },
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
