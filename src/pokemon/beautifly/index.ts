import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS } from './clips';
import calibration from './calibration.json';

/**
 * BEAUTIFLY: the butterfly the Wurmple line becomes through Silcoon. It never
 * stands: it hovers on its big patterned wings, which never stop beating, and
 * it attacks ferociously when angered, flying at the foe to strike it.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'beautifly',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'bird',
      character: 'A butterfly (1 m, 28.4 kg) that flits through flower fields drinking nectar and gathering pollen: light and graceful, it hovers on big patterned forewings and hindwings with long trailing tail streamers that never stop beating, its proboscis coiled under its face. It attacks ferociously when angered: it flies straight at a foe to strike it with its body or slash it with a wing, then flutters back.',
      powerSource: 'Its wings for the wind and the scales and spores it shakes off them (Gust, Whirlwind, Silver Wind, Stun Spore) and every flying strike; its long proboscis, uncoiled at the foe, to drink its energy (Absorb, Mega Drain, Giga Drain) and spray poison (Toxic); its mouth for String Shot; its abdomen for Poison Sting.',
    },
    emitters: {
      mouth: { bones: ['proboscis1'], offset: [0, 0, 0], about: 'its mouth under its face, where the proboscis starts: String Shot, beams and cries leave it' },
      proboscis: { bones: ['proboscis12'], reach: 0.9, about: 'the tip of its long proboscis, uncoiled at the foe to drink (drains) and spray' },
      wings: { bones: ['foreTipL', 'foreTipR'], reach: 0.9, about: 'its big patterned forewings: the wind of every beat, scales and spores shaken off them' },
      abdomen: { bones: ['hips'], reach: 0.95, about: 'the tip of its abdomen, curled under it like a wasp\'s to jab and fire a barb' },
    },
    // Which part each motif's effect leaves from when a move has no part of its own (moves.json sets its moves').
    emitterFor: { powder: 'wings', storm: 'wings', spit: 'abdomen', drain: 'proboscis', breath: 'mouth', beam: 'mouth', throw: 'wings', wave: 'wings' },
    // The hindwings' long tail streamers trail and flutter behind every beat;
    // the forewing tips flex; the antennae bob.
    dynamics: [
      { bones: ['foreTipL'], damping: 0.3, elasticity: 0.2, maxDrift: 0.2 },
      { bones: ['foreTipR'], damping: 0.3, elasticity: 0.2, maxDrift: 0.2 },
      { bones: ['hind2L', 'hind3L', 'hind4L', 'hind5L'], damping: 0.16, elasticity: 0.08, maxDrift: 0.4 },
      { bones: ['hind2R', 'hind3R', 'hind4R', 'hind5R'], damping: 0.16, elasticity: 0.08, maxDrift: 0.4 },
      { bones: ['antenna2L', 'antenna3L'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['antenna2R', 'antenna3R'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
    ],
    moveClips: {},
    // Mimic copies moves from outside its movepool: every motif plays its
    // closest clip of its own (blows fly to the foe, rays and throws leave
    // from home, status moves stay at home).
    motifClips: {
      strike: 'aerial_ace',
      wing: 'aerial_ace',
      punch: 'facade',
      horn: 'facade',
      kick: 'secret_power',
      peck: 'secret_power',
      bite: 'thief',
      grapple: 'thief',
      slam: 'double_edge',
      burrow: 'double_edge',
      tail: 'frustration',
      vine: 'frustration',
      spin: 'return',
      toss: 'return',
      breath: 'solar_beam',
      spit: 'poison_sting',
      beam: 'solar_beam',
      beam_strong: 'hyper_beam',
      jet: 'hyper_beam',
      burst: 'hyper_beam',
      erupt: 'psychic',
      bolt: 'hidden_power',
      mind: 'psychic',
      orb: 'shadow_ball',
      throw: 'swift',
      fling: 'swift',
      wave: 'silver_wind',
      storm: 'gust',
      quake: 'whirlwind',
      drain: 'giga_drain',
      sound: 'snore',
      roar: 'swagger',
      glare: 'mimic',
      kick_sand: 'stun_spore',
      powder: 'stun_spore',
      buff: 'endure',
      shield: 'protect',
      heal: 'morning_sun',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
    },
    hiddenParts: [],
    // Its wing slash, its drink, its paralysing powder and its signature silver wind.
    showcaseMoves: ['AERIAL_ACE', 'GIGA_DRAIN', 'STUN_SPORE', 'SILVER_WIND'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
