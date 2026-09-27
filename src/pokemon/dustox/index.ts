import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

/**
 * DUSTOX: the poison moth the Wurmple line becomes through Cascoon. It
 * hovers on its broad wings, heavier and slower-beating than Beautifly,
 * looses toxic powder from them, and reaches out with the power of its mind
 * through its antennae.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'dustox',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'bird',
      character: 'A nocturnal poison moth (1.2 m, 31.6 kg) drawn to streetlights at night: it never stands, hovering on two broad green wings with a heavier, slower beat than Beautifly\'s, its big head with its downturned mouth and feathery antennae up front, two pairs of stubby red legs on its chest. Grumpy and steady rather than quick: it flies at a foe in a heavy rush to slam it, dusts its highly toxic powder down from its wings, and grips foes with the power of its mind through its antennae.',
      powerSource: 'Its wings for the toxic powder it looses from them (Toxic), the wind of its beats (Gust, Whirlwind, Silver Wind) and its strikes; its antennae for the power of its mind (Confusion, Psybeam, Psychic) and to draw energy in (Giga Drain); its mouth for sludge (Sludge Bomb), thread (String Shot) and beams; the tip of its abdomen for Poison Sting.',
    },
    // The mouth texture is an atlas of 4 x 2 cells (mouth_mat): offsets from
    // its usual downturned mouth. It has no eyelids (its eyes are painted
    // on), so there is no 'closed' cell and nothing blinks.
    expressions: { material: 'mouth_mat', cell: [0.25, 0.5], cells: EXPRESSIONS },
    emitters: {
      mouth: { bones: ['mouth'], offset: [0, 0, 0], about: 'its mouth in the front of its big head: sludge, thread, beams, cries and snores' },
      antennae: { bones: ['antenna2L', 'antenna2R'], reach: 0.9, about: 'the tips of its feathery antennae, through which the power of its mind reaches out and draws energy in' },
      wings: { bones: ['foreTipL', 'foreTipR'], reach: 0.8, about: 'its broad wings: the toxic powder it looses from them, the wind of its beats, its wing strikes' },
      abdomen: { bones: ['hips'], reach: 0.95, about: 'the tip of its abdomen, curled under it to jab and fire a barb' },
    },
    // Which part each motif's effect leaves from when a move has no part of its own (moves.json sets its moves').
    emitterFor: { powder: 'wings', storm: 'wings', throw: 'wings', wave: 'wings', mind: 'antennae', drain: 'antennae', spit: 'mouth', breath: 'mouth', beam: 'mouth' },
    // The wing tips and the lower half of each wing flex on springs behind
    // every beat; the antennae bob.
    dynamics: [
      { bones: ['foreTipL'], damping: 0.28, elasticity: 0.18, maxDrift: 0.22 },
      { bones: ['foreTipR'], damping: 0.28, elasticity: 0.18, maxDrift: 0.22 },
      { bones: ['hindL'], damping: 0.26, elasticity: 0.16, maxDrift: 0.22 },
      { bones: ['hindR'], damping: 0.26, elasticity: 0.16, maxDrift: 0.22 },
      { bones: ['antenna2L'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['antenna2R'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
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
      spit: 'sludge_bomb',
      beam: 'psybeam',
      beam_strong: 'hyper_beam',
      jet: 'hyper_beam',
      burst: 'hyper_beam',
      erupt: 'psychic',
      bolt: 'hidden_power',
      mind: 'confusion',
      mind_strong: 'psychic',
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
      kick_sand: 'toxic',
      powder: 'toxic',
      buff: 'endure',
      shield: 'protect',
      heal: 'moonlight',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
    },
    hiddenParts: [],
    // Its heavy body slam, its psychic ray, its toxic powder and the silver wind of its line.
    showcaseMoves: ['TACKLE', 'PSYBEAM', 'TOXIC', 'SILVER_WIND'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
