import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'treecko',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    // The model has no effect meshes.
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A small, light (5 kg) and quick wood gecko, the protector of its forest tree: cool, calm and collected, it never panics and glares right back at a bigger foe without giving an inch. It stands square to the foe with its big three-fingered hands held out wide, moves in quick, springy bursts, smacks with its hands and swings its thick leaf tail to slam foes.',
      powerSource:
        'Grass power drawn from sunlight and living things: it drains the foe\'s strength through its outstretched hands into its body (Absorb, Mega Drain, Giga Drain), spits seeds and fires Solar Beam from its mouth, and slams foes with its heavy leaf-shaped tail (Slam, Iron Tail).',
    },
    // Effects leave the built-in points: the mouth (seeds, Solar Beam, and the
    // moves that fall back to the spit), the hands, the eyes (Leer's glint).
    emitters: {},
    emitterFor: {
      // These fall back to the spat seeds (special_weak) or the screech: the effect leaves the mouth.
      throw: 'mouth',
      fling: 'mouth',
      powder: 'mouth',
    },
    // The leaf tail: heavy and a little loose, so it lags and swings on its
    // own; the chain ripples out along its length (overlap below).
    dynamics: [
      { bones: ['tail', 'tail2', 'tail3', 'tail4', 'tail5'], damping: 0.2, elasticity: 0.14, maxDrift: 0.35 },
    ],
    overlap: {
      ...DEFAULT_OVERLAP,
      tail2: 0.07, tail3: 0.08, tail4: 0.09, tail5: 0.1,
    },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). The category clips are
    // Treecko's own versions of its early moves; this maps the motifs they
    // perform. tackle, drain, shield, afterimage, roar and punch are clips
    // named after their motifs (found by name). Where two motifs share a
    // clip, the level-up one is listed last (check.mjs records one per clip).
    motifClips: {
      // Pound's hand smack serves the other chops and cuts (Brick Break too).
      strike: 'physical_weak',
      // The spinning tail slam: Iron Tail, Body Slam, Slam.
      tail: 'physical_strong',
      slam: 'physical_strong',
      // Seeds spat from the mouth (Bullet Seed); Solar Beam from the mouth.
      spit: 'special_weak',
      beam: 'special_strong',
      // Gathering sunlight and opening up with the aura: Swords Dance, Rest, Sunny Day.
      buff: 'status_self',
      heal: 'status_self',
      weather: 'status_self',
      // The stare-down: Swagger and Attract, then Leer and Mimic.
      charm: 'status_target',
      glare: 'status_target',
      // Toxic is spat at the foe with the screech's lunge.
      powder: 'roar',
    },
    hiddenParts: [],
    // Its first moves (Route 101 at level 5: Pound and Leer; Absorb at 6, Quick Attack at 11).
    showcaseMoves: ['POUND', 'ABSORB', 'LEER', 'QUICK_ATTACK'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
