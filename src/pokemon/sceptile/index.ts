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
      beam_strong: 'hyper_beam',
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
      roar: 'roar',
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
    showcaseMoves: ['LEAF_BLADE', 'SOLAR_BEAM', 'SLAM', 'AGILITY'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
