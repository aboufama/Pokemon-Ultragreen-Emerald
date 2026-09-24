import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { BLAZIKEN_RIG } from './rig';
import { STANCE } from './poses';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'blaziken',
    rig: BLAZIKEN_RIG,
    poses: { stance: STANCE },
    clips: {},
    effectParts: ['Fire'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
