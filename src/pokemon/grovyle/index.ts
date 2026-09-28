import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { GROVYLE_CLIPS, GROVYLE_EXPRESSIONS } from './set';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'grovyle',
    rig: RIG,
    poses: { stance: STANCE },
    // Sceptile's first clips (and the clips added since in their style),
    // ported to Grovyle's body: one clip per action its moves take (./set.ts).
    clips: GROVYLE_CLIPS,
    // The model has no effect meshes.
    effectParts: [],
    effects: {},
    expressions: { material: 'eye', cell: [0.25, 0.5], cells: GROVYLE_EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A swift forest ninja (21.6 kg, 0.9 m) that leaps from branch to branch in the thick forest: coiled low on its long legs and leaning forward, it springs at the foe in high, light bounds, cuts with the big leaves on its forearms and is back in its crouch before the foe reacts; cool and sharp-eyed, it never stands still.',
      powerSource:
        'Grass power from its leaves: it cuts with the big leaves that grow from its forearms (Leaf Blade, Fury Cutter) and flings volleys off them, fires seeds and Solar Beam from its mouth, and draws the foe\'s strength in through its hands (Absorb, Giga Drain); the leaves on its head and tail stream behind it (Pokédex: they hide it in the overgrown forest).',
    },
    // The big leaves on its forearms: the far end of each forearm's mesh is
    // the leaf tip. The leaf brush at the tail's end (Mud Sport flings the
    // mud with it).
    emitters: {
      leaves: { bones: ['forearmR', 'forearmL'], about: 'the big leaves that grow from its forearms' },
      tail: { bones: ['tail2'], about: 'the leaf brush at the end of its tail' },
    },
    emitterFor: {
      // Leaf and star volleys (Swift, Rock Tomb) fly off the forearm leaves as the arms whip out.
      throw: 'leaves',
      // Toxic and Leech Seed are spat from the mouth.
      powder: 'mouth',
      kick_sand: 'tail',
    },
    // The tail and its leaf brush on springs (a little loose: it trails the leaps).
    dynamics: [
      { bones: ['tail', 'tail2'], damping: 0.18, elasticity: 0.12, maxDrift: 0.4 },
    ],
    // Overlapping action: the tail's brush trails its root.
    overlap: { ...DEFAULT_OVERLAP, tail2: 0.08 },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts), as Sceptile's first clips
    // have them: the category clips are its Leaf Blade, Slam, Bullet Seed,
    // Solar Beam, Swords Dance and Screech, and this maps the motifs they
    // perform; the other clips are named after their motifs. Where two motifs
    // share a clip, the level-up one is listed last (tools/gauntlet/check.mjs
    // records one motif per clip).
    motifClips: {
      strike: 'physical_weak',
      tail: 'physical_strong',
      slam: 'physical_strong',
      // Snore is its mouth attack; Toxic and Leech Seed are spat from the mouth.
      sound: 'special_weak',
      powder: 'special_weak',
      spit: 'special_weak',
      // Hidden Power's orbs gather and fly as Solar Beam's light does.
      orb: 'special_strong',
      beam: 'special_strong',
      buff: 'status_self',
      roar: 'status_target',
      weather: 'heal',
      charm: 'glare',
    },
    hiddenParts: [],
    showcaseMoves: ['LEAF_BLADE', 'BULLET_SEED', 'AGILITY', 'DETECT'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
