import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

/**
 * WURMPLE: a small caterpillar that rears its front half up to face the foe.
 * It spits sticky thread from its mouth (String Shot), stabs venom from the
 * two yellow spikes on its tail end (Poison Sting) and butts with its head
 * and red crest (Tackle).
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'wurmple',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      // A segmented crawler: no limbs to act with. The front half (spine,
      // chest, neck, head) rears, bows and strikes; the back half lies on
      // the ground, curls and lifts its spiked tail end.
      bodyPlan: 'serpent',
      character: 'A small, light caterpillar (0.3 m, 3.6 kg): it rears its front half up to face a foe and never keeps still, bobbing and swaying like an inchworm. Plucky and twitchy rather than strong: it butts with its head and crest, sprays thread from its mouth and curls up tight when hurt or worn out.',
      powerSource: 'Its mouth, which spits a thread that turns gooey in the air (String Shot); the two venomous yellow spikes on its tail end, which it rears up like a scorpion\'s tail and jabs at the foe (Poison Sting); its head and red crest for butting (Tackle).',
    },
    // The eye texture is an atlas of 4 x 4 cells; the eyes sample column 0
    // (its left) and column 3 (its right, mirrored), so a row offset moves
    // both: row 0 open, row 1 lidded, row 2 shut.
    expressions: { material: 'material', cell: [0.25, 0.25], cells: EXPRESSIONS },
    emitters: {
      mouth: { bones: ['mouth'], offset: [0, 0, 0], about: 'its mouth between its little mandibles, where it spits its sticky thread' },
      tailSpikes: { bones: ['tailSpikes'], about: 'the two venomous yellow spikes on its tail end' },
    },
    // Jev (tools/gauntlet/classify_moves.mjs) needs an API key this checkout
    // does not have, so the parts are set per motif: the thread leaves the
    // mouth, the sting the tail spikes; Tackle is the whole body (default).
    emitterFor: { powder: 'mouth', spit: 'tailSpikes' },
    // Loose parts on springs: the back half trails the front a little when
    // the body lurches (a segmented body's follow-through), the crest and
    // the tail spikes are stiff.
    dynamics: [
      { bones: ['tail2', 'tail3'], damping: 0.22, elasticity: 0.2, maxDrift: 0.3 },
      { bones: ['tailSpikes'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['crest'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
    ],
    // Overlapping action ripples out from the hips both ways: up the front
    // half to the head, and back along the tail to its spikes.
    overlap: {
      ...DEFAULT_OVERLAP,
      tail: 0.03, tail2: 0.06, tail3: 0.09, tailSpikes: 0.1, crest: 0.08,
    },
    moveClips: {},
    // The category clips are Wurmple's versions of its three moves.
    motifClips: {
      tackle: 'physical_weak',
      spit: 'special_weak',
      powder: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'STRING_SHOT', 'POISON_STING'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
