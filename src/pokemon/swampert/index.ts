import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'swampert',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A squat, 82 kg mud-fish wrestler: feet planted wide, crab arms out, slow to wind up and unstoppable once moving. ' +
        'It never springs like a fighter; it heaves its whole mass, lands with the ground shaking, and fights with its huge ' +
        'arms (swats, haymakers, hammering the earth) and its enormous mouth. Calm and sturdy, it digs in and braces rather than dodging.',
      powerSource:
        'Water and mud from its huge mouth (Water Gun, Mud Shot, beams); its massive arms and weight for the ground: it heaves ' +
        'Surf and Muddy Water up with both arms and pounds the earth with its fists for Earthquake. The Pokédex: it piles up ' +
        'boulders to shield its nest and senses storms with its fins and gills.',
    },
    // Built-in emitters cover it: the mouth (jaw tip) for spit, beams, roars;
    // the hands (finger tips) for anything it throws.
    emitters: {},
    emitterFor: {
      // Rock Tomb, Rock Slide: boulders hurled from both hands.
      throw: 'hands',
      // Toxic is spat out while it bellows; Blizzard's charge gathers at the mouth.
      powder: 'mouth',
      storm: 'mouth',
    },
    // Loose parts on springs. The head fins and cheek gills are stiff plates;
    // the tail fan's upper lobe is looser (single bones: the far end comes
    // from the skin).
    dynamics: [
      { bones: ['hairTipL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['hairTipR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['gillL'], damping: 0.28, elasticity: 0.18, maxDrift: 0.3 },
      { bones: ['gillR'], damping: 0.28, elasticity: 0.18, maxDrift: 0.3 },
      { bones: ['tail', 'tail2'], damping: 0.2, elasticity: 0.12, maxDrift: 0.4 },
    ],
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). quake, wave, shield,
    // punch, strike, glare, kick_sand, heal, toss, burrow, fling and
    // afterimage have clips of their own name; these motifs are performed by
    // other clips.
    motifClips: {
      // Heaving boulders up and hurling them is the same body action as
      // raising a wave (the Pokédex: it piles up boulders).
      throw: 'wave',
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      slam: 'physical_strong',
      spit: 'special_weak',
      beam: 'special_strong',
      buff: 'status_self',
      weather: 'status_self',
      roar: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['EARTHQUAKE', 'MUD_SHOT', 'PROTECT', 'MUDDY_WATER'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
