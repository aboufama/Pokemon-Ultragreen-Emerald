import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { TORCHIC_CLIPS, TORCHIC_EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'torchic',
    rig: RIG,
    poses: { stance: STANCE },
    clips: TORCHIC_CLIPS,
    // The model has no effect meshes: its fire is the game's (and the move effects').
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: TORCHIC_EXPRESSIONS },
    brief: {
      bodyPlan: 'bird',
      character:
        'A 2.5 kg fire chick, all round head and down on stubby legs, not a small Blaziken: plucky and eager, it squares up to ' +
        'anything, bobs and bounces rather than strides, and when it gets fired up it puffs out its chest, stands its crest up ' +
        'and flutters its tiny wings. It has no arms: it fights with its little beak (pecks, chirps, spits), the talons of its ' +
        'big feet (a barnyard scratch, a sand kick) and its whole round body, thrown head first.',
      powerSource:
        'The fire in its belly (Pokédex: if attacked, it strikes back by spitting balls of fire it forms in its stomach): it ' +
        'heaves its chest to bring the flame up, then spits embers and streams of fire from its beak. Its feet scratch and kick ' +
        'up sand; its wing tufts only flutter and fling.',
    },
    emitters: {
      wings: { bones: ['wingBL', 'wingBR'], about: 'tiny yellow wing tufts at the sides of its chest (it has no arms or hands)' },
    },
    emitterFor: {
      // Swift's stars (and the rocks it calls) are flung with a flap of the wing tufts.
      throw: 'wings',
      // Mud-Slap is scooped and flicked with a foot; Toxic is spat from the beak.
      fling: 'feet',
      powder: 'mouth',
    },
    // Loose parts on springs: the crest's three plumes (long, a little
    // springy; stiffer and it would not sway, looser and from our side it
    // flops back on every thrust, showing its shaded back), the short tail
    // feathers, and the wing tufts and the feather at the back of the collar
    // (stiff).
    dynamics: [
      { bones: ['crest', 'crestTip'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['crestL', 'crestTipL'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['crestR', 'crestTipR'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['tail', 'tail2'], damping: 0.2, elasticity: 0.12, maxDrift: 0.4 },
      { bones: ['wingAL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingBL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingCL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingAR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingBR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingCR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['collarBack'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
    ],
    // Overlapping action: no neck (the head sits on the chest), so the head
    // trails the body less than a necked biped's and a bird's steady head
    // doesn't nod down on every thrust; the crest trails the head like
    // hair, the wing tufts trail the collar, the tail ripples out.
    overlap: {
      ...DEFAULT_OVERLAP,
      head: 0.045, jaw: 0.045,
      crest: 0.08, crestTip: 0.1, crestL: 0.08, crestR: 0.08, crestTipL: 0.1, crestTipR: 0.1,
      collar: 0.035, collarBack: 0.07,
      wingAL: 0.06, wingBL: 0.06, wingCL: 0.065, wingAR: 0.06, wingBR: 0.06, wingCR: 0.065,
      tail2: 0.08,
    },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). peck, tackle, burrow,
    // breath, throw, fling, sound, kick_sand, shield, weather, heal, charm
    // and afterimage have clips of their own name; these motifs are performed
    // by the category clips. Where two motifs share a clip the level-up one
    // is listed last (tools/gauntlet/check.mjs records one motif per clip).
    // Seismic Toss (toss) plays physical_strong: with no arms it cannot grab.
    motifClips: {
      // No arms: its kicks are talon rakes, its punches and slams the whole
      // round body thrown head first.
      kick: 'physical_weak',
      strike: 'physical_weak',
      punch: 'physical_strong',
      slam: 'physical_strong',
      tackle_strong: 'physical_strong',
      // The big belly-fire blast serves Fire Blast, Overheat and Hidden Power.
      orb: 'special_strong',
      burst: 'special_strong',
      spit_strong: 'special_strong',
      spit: 'special_weak',
      buff: 'status_self',
      glare: 'status_target',
      powder: 'status_target',
      roar: 'status_target',
    },
    // The beak comes as two alternate meshes: the open one (with the inside
    // of the mouth) follows the jaw both shut and open; the closed one would
    // show through it.
    hiddenParts: ['MouthClosed'],
    // What a starter Torchic has in its first battles: Scratch and Growl at
    // level 5, Focus Energy at 7, Ember (its signature: fire spat from the
    // belly) at 10.
    showcaseMoves: ['SCRATCH', 'EMBER', 'GROWL', 'FOCUS_ENERGY'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
