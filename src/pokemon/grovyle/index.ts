import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS } from './clips';
import calibration from './calibration.json';

/**
 * Eye atlas (the model's eye texture): 4 x 2 expressions, each a pair of
 * cells (one per eye). The eye mesh maps the open pair (bottom row, first
 * pair), so each expression is given relative to it, in pairs.
 */
export const EXPRESSIONS: Record<string, [number, number]> = {
  open: [0, 0],
  happy: [1, 0],
  angry: [2, 0],
  hurt: [3, 0],
  closed: [0, -1],
  focus: [1, -1],
  half: [2, -1],
  wide: [3, -1],
};

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'grovyle',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    // The model has no effect meshes.
    effectParts: [],
    effects: {},
    expressions: { material: 'eye', cell: [0.25, 0.5], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A swift forest ninja (21.6 kg, 0.9 m) that leaps from branch to branch in the thick forest: coiled low on its long legs and leaning forward, it springs at the foe in high, light bounds, cuts with the big leaves on its forearms and is back in its crouch before the foe reacts; cool and sharp-eyed, it never stands still.',
      powerSource:
        'Grass power from its leaves: it cuts with the big leaves that grow from its forearms (Leaf Blade, Fury Cutter) and flings volleys off them, fires seeds and Solar Beam from its mouth, and draws the foe\'s strength in through its hands (Absorb, Giga Drain); the leaves on its head and tail stream behind it (Pokédex: they hide it in the overgrown forest).',
    },
    // The big leaves on its forearms: the far end of each forearm's mesh is the leaf tip.
    emitters: {
      leaves: { bones: ['forearmR', 'forearmL'], about: 'the big leaves that grow from its forearms' },
    },
    emitterFor: {
      // Leaf and star volleys fly off the forearm leaves as the arms whip across.
      throw: 'leaves',
      // Toxic and Leech Seed are spat from the mouth.
      powder: 'mouth',
    },
    // The tail and its leaf brush on springs (a little loose: it trails the leaps).
    dynamics: [
      { bones: ['tail', 'tail2'], damping: 0.18, elasticity: 0.12, maxDrift: 0.4 },
    ],
    // Overlapping action: the tail's brush trails its root.
    overlap: { ...DEFAULT_OVERLAP, tail2: 0.08 },
    moveClips: {},
    motifClips: {
      // Moves outside its movepool (Mimic can call any move) play the closest
      // of its own move clips: the same body part doing the same kind of thing.
      strike: 'cut',
      strike_strong: 'leaf_blade',
      punch: 'mega_punch',
      kick: 'mega_kick',
      bite: 'crunch',
      tackle: 'return',
      tackle_strong: 'double_edge',
      slam: 'body_slam',
      tail: 'iron_tail',
      // A flying slash for wing blows; a head jab for pecks and horns.
      wing: 'aerial_ace',
      peck: 'facade',
      horn: 'facade',
      spin: 'iron_tail',
      grapple: 'crush_claw',
      toss: 'seismic_toss',
      burrow: 'dig',
      vine: 'cut',
      breath: 'dragon_breath',
      spit: 'bullet_seed',
      beam: 'solar_beam',
      jet: 'solar_beam',
      throw: 'swift',
      // A push of power from the hands: waves, bursts, bolts, the mind, orbs.
      wave: 'hidden_power',
      burst: 'hidden_power',
      bolt: 'hidden_power',
      mind: 'hidden_power',
      orb: 'hidden_power',
      // Summoned from the sky onto the foe.
      erupt: 'rock_tomb',
      storm: 'swift',
      quake: 'earthquake',
      drain: 'absorb',
      sound: 'dragon_breath',
      fling: 'mud_slap',
      roar: 'screech',
      glare: 'leer',
      kick_sand: 'mud_sport',
      powder: 'toxic',
      buff: 'swords_dance',
      shield: 'protect',
      heal: 'safeguard',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
      flash: 'flash',
      other: 'safeguard',
    },
    hiddenParts: [],
    showcaseMoves: ['LEAF_BLADE', 'BULLET_SEED', 'AGILITY', 'DETECT'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
