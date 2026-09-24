import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import type { SpringChainSpec } from '../../anim/dynamics';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG, TAIL_FRONDS } from './rig';
import { STANCE } from './poses';
import { SCEPTILE_CLIPS, SCEPTILE_EXPRESSIONS } from './clips';
import calibration from './calibration.json';

/** The tail's fern leaflets: two-bone chains on Tail3..Tail5, stiff, so the frond rustles as the tail moves. */
const frondSprings: SpringChainSpec[] = TAIL_FRONDS.flatMap((f) =>
  (['L', 'R'] as const).map((s) => ({ bones: [`frond${f}${s}`, `frond${f}Tip${s}`], damping: 0.25, elasticity: 0.18, maxDrift: 0.3 })),
);

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'sceptile',
    rig: RIG,
    poses: { stance: STANCE },
    clips: SCEPTILE_CLIPS,
    // The model has no effect meshes (no glow or flame parts).
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: SCEPTILE_EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A lean jungle fighter, light (52 kg) and the fastest of the Hoenn starters: coiled low in a wide, bow-legged crouch, it moves in quick, springy bursts, cuts with the leaf blades on its forearms and whips its heavy fern tail; cool and cocky, it strikes and is back in guard before the foe reacts.',
      powerSource:
        'Sunlight: it basks to charge (Pokédex: it regulates its temperature by basking), then fires grass power from its mouth (Bullet Seed, Solar Beam), cuts and flings leaves with the blades on its forearms (Leaf Blade, leaf volleys) and draws the foe\'s energy in through its claws (Absorb, Giga Drain).',
    },
    // The leaf blades on the forearms: the tip of each front blade.
    emitters: {
      blades: { bones: ['bladeATipR', 'bladeATipL'] },
    },
    emitterFor: {
      // Leaf volleys (Swift, Rock Tomb) fly off the forearm blades as the arms whip across.
      throw: 'blades',
      // Toxic is spat at the foe.
      powder: 'mouth',
    },
    // Loose parts on springs: the long tail (heavy, a little loose), the
    // forearm blades and the tail's leaflets (stiff).
    dynamics: [
      { bones: ['tail', 'tail2', 'tail3', 'tail4', 'tail5', 'tail6', 'tail7'], damping: 0.2, elasticity: 0.15, maxDrift: 0.35 },
      { bones: ['bladeAL', 'bladeATipL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['bladeBL', 'bladeBTipL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['bladeAR', 'bladeATipR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['bladeBR', 'bladeBTipR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      ...frondSprings,
    ],
    // Overlapping action: the second neck bone between neck and head, the
    // tail rippling out along its length, the blades trailing the forearms.
    overlap: {
      ...DEFAULT_OVERLAP,
      neck2: 0.058,
      tail2: 0.07, tail3: 0.08, tail4: 0.09, tail5: 0.1, tail6: 0.11, tail7: 0.12,
      bladeAL: 0.08, bladeAR: 0.08, bladeBL: 0.08, bladeBR: 0.08,
      bladeATipL: 0.09, bladeATipR: 0.09, bladeBTipL: 0.09, bladeBTipR: 0.09,
    },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). The category clips are
    // Sceptile's own versions of its showcase moves; this maps the motifs
    // they perform, plus motifs whose moves read right on a shared clip.
    // Motif clips are named after the category they stand in for
    // (physical_strong_punch...).
    // Where two motifs share a clip, the level-up one is listed last
    // (tools/gauntlet/check.mjs records one motif per clip).
    motifClips: {
      strike: 'physical_weak',
      strike_strong: 'physical_strong_strike',
      tail: 'physical_strong',
      slam: 'physical_strong',
      spit: 'special_weak',
      beam: 'special_strong',
      buff: 'status_self',
      roar: 'status_target',
      tackle: 'physical_weak_tackle',
      punch: 'physical_strong_punch',
      quake: 'physical_strong_quake',
      throw: 'special_weak_throw',
      drain: 'special_weak_drain',
      shield: 'status_self_shield',
      weather: 'status_self_heal',
      heal: 'status_self_heal',
      charm: 'status_target_glare',
      glare: 'status_target_glare',
    },
    hiddenParts: [],
    showcaseMoves: ['LEAF_BLADE', 'SOLAR_BEAM', 'SLAM', 'AGILITY'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
