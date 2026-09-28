import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { TREECKO_CLIPS, TREECKO_EXPRESSIONS } from './set';
import { MORE_CLIPS } from './set_more';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'treecko',
    rig: RIG,
    poses: { stance: STANCE },
    // Sceptile's first clips, re-posed and re-timed for Treecko (./set.ts), and
    // the clips made since in their style (./set_more.ts).
    clips: { ...TREECKO_CLIPS, ...MORE_CLIPS },
    // The model has no effect meshes.
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: TREECKO_EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A small, light (5 kg) and quick wood gecko, the protector of its forest tree: cool and cocky, it never panics and glares right back at a bigger foe. It stands low on bent, bowed legs, square to the foe, with its big three-fingered hands held out wide, springs in quick, high bursts, slaps and chops with its hands and whips its fat leaf tail to slam foes.',
      powerSource:
        'Grass power drawn from sunlight and living things: it drains the foe\'s strength through its outstretched hands into its body (Absorb, Mega Drain, Giga Drain), spits seeds and fires Solar Beam from its mouth, and slams foes with its heavy leaf-shaped tail (Slam, Iron Tail).',
    },
    // Effects leave the built-in points (the mouth, the hands, the eyes) and
    // the tip of the leaf tail (Mud Sport flings the mud with it).
    emitters: {
      tail: { bones: ['tail5'], about: 'the tip of its thick leaf tail' },
    },
    emitterFor: {
      // Stars (Swift) and rocks (Rock Tomb) leave its hands as the arms whip out; so does Mud-Slap's clod.
      throw: 'hands',
      fling: 'hands',
      // Toxic and Leech Seed are spat from the mouth.
      powder: 'mouth',
      kick_sand: 'tail',
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
    // Clips by move motif (src/battle3d/motifs.ts), as Sceptile's first clips
    // have them: the category clips are Treecko's versions of Pound, Slam,
    // Bullet Seed, Solar Beam, Swords Dance and Screech; the motif clips keep
    // a category prefix (physical_strong_punch...); toss, burrow, fling,
    // afterimage, flash, kick, bite, kick_sand and breath are named after
    // their motifs and need no entry here. Where two motifs share a clip, the
    // level-up one is listed last (tools/gauntlet/check.mjs records one motif
    // per clip).
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
      // As Sceptile's first clips have it: Snore is its mouth attack, Hidden
      // Power its strong ranged one; Toxic and Leech Seed are spat from the mouth.
      sound: 'special_weak',
      orb: 'special_strong',
      powder: 'special_weak',
      // Moves outside its movepool that Mimic can call play the clip of the
      // closest action it has: a sweep of the arm for wings and vines, the
      // head leading for pecks and horns, the tail spin for spins, the
      // two-handed crush for grapples, a blast from the mouth for jets and
      // bolts, the volley flung from the hands for waves, storms and what it
      // calls down, the flare for bursts, the stare for the mind.
      wing: 'physical_weak',
      vine: 'physical_weak',
      peck: 'bite',
      horn: 'physical_weak_tackle',
      spin: 'physical_strong',
      grapple: 'physical_strong_strike',
      jet: 'special_strong',
      bolt: 'special_strong',
      wave: 'special_weak_throw',
      storm: 'special_weak_throw',
      erupt: 'special_weak_throw',
      burst: 'flash',
      mind: 'status_target_glare',
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
