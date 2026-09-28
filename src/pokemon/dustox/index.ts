import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { EXPRESSIONS, MOMENTS_AND_BLOWS } from './set';
import { RANGED } from './set_ranged';
import { STATUS } from './set_status';
import calibration from './calibration.json';

/**
 * DUSTOX: the poison moth the Wurmple line becomes through Cascoon. It
 * hovers on its broad wings, heavier and slower-beating than Beautifly,
 * looses toxic powder from them, and reaches out with the power of its mind
 * through its antennae. Its clips are its own, hand-keyed in the first
 * clips' style (./set.ts and the files it names); the moth kit it once
 * shared with Beautifly (./clips.ts, ./own.ts) is no longer used.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'dustox',
    rig: RIG,
    poses: { stance: STANCE },
    clips: Object.fromEntries([...MOMENTS_AND_BLOWS, ...RANGED, ...STATUS].map((c) => [c.name, c])),
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'bird',
      character: 'A nocturnal poison moth (1.2 m, 31.6 kg) drawn to streetlights at night: it never stands, hovering on two broad green wings with a heavy, slow beat (slower than Beautifly\'s), its big head with its downturned mouth and feathery antennae up front, two pairs of stubby red legs on its chest. Grumpy and steady rather than quick: it rears back and flies at a foe in a heavy rush to ram it or slash it with a wing, shakes its highly toxic powder down from its wings, and grips foes with the power of its mind through its antennae.',
      powerSource: 'Its wings for the toxic powder it looses from them (Toxic), the wind of its beats (Gust, Whirlwind, Silver Wind), its wing strikes and the stars it flings (Swift); its antennae for the power of its mind (Confusion, Psybeam, Psychic) and to draw energy in (Giga Drain); its mouth for sludge (Sludge Bomb), thread (String Shot), beams (Hyper Beam, Solar Beam) and snores; the tip of its abdomen, curled under it, for Poison Sting\'s barb.',
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
    // Which part each motif's effect leaves from when a move has no part of
    // its own (moves.json sets its moves'): its mind acts through its
    // antennae (a stare too: its painted eyes have no bone of their own).
    emitterFor: {
      powder: 'wings', storm: 'wings', throw: 'wings', wave: 'wings', fling: 'wings', kick_sand: 'wings',
      mind: 'antennae', drain: 'antennae', glare: 'antennae', bolt: 'antennae', erupt: 'antennae',
      spit: 'mouth', breath: 'mouth', beam: 'mouth', jet: 'mouth', sound: 'mouth', roar: 'mouth',
      orb: 'body',
    },
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
    // Clips by move motif (src/battle3d/motifs.ts): a clip per action its
    // moves take, named after its motif (strike, beam, spit, storm, drain,
    // orb, throw, sound, powder, shield, heal, weather, charm, afterimage,
    // flash, and the strong versions mind_strong and spit_strong) or a
    // category clip mapped here when it is that action. The rest are the
    // motifs a move Mimic copies may take, each its closest clip.
    motifClips: {
      // Its body ram (Tackle, Facade, Secret Power, Struggle) and its reckless
      // dive (Double-Edge, Return, Frustration).
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      // Confusion; Psybeam has its own beam; Hyper Beam and Solar Beam are its
      // great beam from the mouth.
      mind: 'special_weak',
      beam_strong: 'special_strong',
      // Sleep Talk, and the buffs Mimic may copy; Mimic's own stare.
      buff: 'status_self',
      glare: 'status_target',
      // String Shot is spat from its mouth, as Sludge Bomb is.
      'powder@mouth': 'spit_strong',
      // Moves outside its movepool that Mimic may copy.
      punch: 'physical_weak', kick: 'physical_weak', bite: 'physical_weak', peck: 'physical_weak', horn: 'physical_weak',
      slam: 'physical_strong', spin: 'physical_strong', toss: 'physical_strong', burrow: 'physical_strong',
      wing: 'strike', tail: 'strike', grapple: 'strike', vine: 'strike',
      breath: 'special_strong', jet: 'special_strong', burst: 'special_strong',
      bolt: 'special_weak', erupt: 'mind_strong',
      wave: 'storm', quake: 'storm', kick_sand: 'storm', fling: 'throw',
      roar: 'sound',
    },
    hiddenParts: [],
    // Its heavy body ram, its psychic ray, its toxic powder and the silver wind of its line.
    showcaseMoves: ['TACKLE', 'PSYBEAM', 'TOXIC', 'SILVER_WIND'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
