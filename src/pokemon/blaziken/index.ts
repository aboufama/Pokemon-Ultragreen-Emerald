import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { BLAZIKEN_RIG } from './rig';
import { STANCE } from './poses';
import { BLAZIKEN_CLIPS, BLAZIKEN_EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'blaziken',
    rig: BLAZIKEN_RIG,
    poses: { stance: STANCE },
    clips: BLAZIKEN_CLIPS,
    effectParts: ['Fire'],
    effects: {
      // Colors from Blaziken's own palette ramp (yellows -> orange -> red).
      flames: { parts: ['Fire'], fire: { core: '#fff69c', mid: '#ffd56a', edge: '#ff7b52' } },
    },
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: BLAZIKEN_EXPRESSIONS },
    // Loose parts on springs (each is a single bone; the virtual end comes
    // from the skin). The mane is long and loose, the feathers stiffer.
    dynamics: [
      { bones: ['hairTipL'], damping: 0.14, elasticity: 0.05, maxDrift: 0.55 },
      { bones: ['hairTipR'], damping: 0.14, elasticity: 0.05, maxDrift: 0.55 },
      { bones: ['tail'], damping: 0.2, elasticity: 0.1, maxDrift: 0.45 },
      { bones: ['wristFxL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['wristFxR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.35 },
      { bones: ['ankleFxL'], damping: 0.25, elasticity: 0.18, maxDrift: 0.35 },
      { bones: ['ankleFxR'], damping: 0.25, elasticity: 0.18, maxDrift: 0.35 },
    ],
    // Every move it can know has a clip of its own, named after it.
    moveClips: {},
    // Where its effects leave the body: fire from the beak (the default
    // mouth; Toxic is spewed from it too), mud slapped from a claw (the
    // default hands), Swift's stars flung from a claw, Hidden Power's orbs
    // pushed from the palms.
    emitterFor: { throw: 'hands', orb: 'hands', powder: 'mouth' },
    // Moves outside its movepool that Mimic or Mirror Move call play its
    // closest clip for their motif (src/battle3d/motifs.ts).
    motifClips: {
      strike: 'slash',
      punch: 'mega_punch',
      kick: 'mega_kick',
      bite: 'peck',
      tackle: 'quick_attack',
      tackle_strong: 'double_edge',
      slam: 'body_slam',
      // Iron Tail, Wing Attack: a leap and a sweep down onto the foe.
      tail: 'aerial_ace',
      wing: 'aerial_ace',
      peck: 'peck',
      horn: 'peck',
      // Rapid Spin, Rollout, Flame Wheel: its whirling spin kick.
      spin: 'blaze_kick',
      // Bind, Wrap: seizing and shoving with both hands.
      grapple: 'strength',
      vine: 'fury_cutter',
      toss: 'seismic_toss',
      burrow: 'dig',
      breath: 'flamethrower',
      spit: 'ember',
      spit_strong: 'fire_blast',
      beam: 'hyper_beam',
      jet: 'flamethrower',
      throw: 'swift',
      // Surf: a heave up and a push down at the foe.
      wave: 'rock_slide',
      quake: 'earthquake',
      burst: 'overheat',
      // Thunder, Frenzy Plant: a fist driven into the ground calls it up on the foe.
      erupt: 'rock_tomb',
      storm: 'fire_spin',
      bolt: 'hidden_power',
      mind: 'hidden_power',
      orb: 'hidden_power',
      drain: 'hidden_power',
      // Hyper Voice, Uproar: a bellow at the foe.
      sound: 'roar',
      fling: 'mud_slap',
      roar: 'roar',
      glare: 'growl',
      kick_sand: 'sand_attack',
      powder: 'toxic',
      buff: 'bulk_up',
      shield: 'protect',
      heal: 'rest',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
      flash: 'roar',
    },
    brief: {
      bodyPlan: 'biped',
      character: 'A lean martial artist: springy, fast, fights with kicks from a wide stance; proud and fiery.',
      powerSource: 'Fire from its beak (breath, embers) and flames that flare from its wrists when it powers up.',
    },
    showcaseMoves: ['BLAZE_KICK', 'FLAMETHROWER', 'DOUBLE_KICK', 'BULK_UP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
