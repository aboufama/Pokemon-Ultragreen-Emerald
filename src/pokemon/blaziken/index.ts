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
      MOVE_LOW_KICK: 'physical_weak_kick',
    },
    // Mud-Slap is flicked with a foot.
    emitterFor: { fling: 'feet' },
    // Clips by move motif (src/battle3d/motifs.ts). Blaziken's clips keep
    // their category names; this maps the motifs they perform.
    motifClips: {
      // Category clips that depict a motif: Slash is a claw strike, the beak
      // stream serves beams, the spat ember serves thrown orbs.
      strike: 'physical_weak',
      beam: 'special_strong',
      orb: 'special_weak',
      kick: 'physical_weak_kick',
      kick_strong: 'physical_strong',
      kick_sand: 'status_target_kick',
      breath: 'special_strong',
      spit: 'special_weak',
      buff: 'status_self',
      roar: 'status_target',
    },
    brief: {
      bodyPlan: 'biped',
      character: 'A lean martial artist: springy, fast, fights with kicks from a wide stance; proud and fiery.',
      powerSource: 'Fire from its beak (breath, embers) and flames that flare from its wrists when it powers up.',
    },
    showcaseMoves: ['BLAZE_KICK', 'FLAMETHROWER', 'DOUBLE_KICK', 'BULK_UP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
