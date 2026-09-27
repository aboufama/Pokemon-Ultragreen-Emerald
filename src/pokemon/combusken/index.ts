import type { SpeciesProfile } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { COMBUSKEN_CLIPS, COMBUSKEN_EXPRESSIONS } from './clips';
import { applyCalibration } from '../profile';
import calibration from './calibration.json';

/** Combusken: a lanky young fowl that fights with its feet. */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'combusken',
    rig: RIG,
    poses: { stance: STANCE },
    clips: COMBUSKEN_CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: COMBUSKEN_EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A lanky young fowl and a born kicker (Pokédex: it lashes out with ten kicks a second, and its fighting instinct keeps ' +
        'it on the offensive until the foe gives up): light and quick on its long bird legs, it bounds about in skipping hops, ' +
        'balances on one leg with the other knee drawn up to kick, and flings its long feathered arms out wide. Cocky and ' +
        'restless; the kicks are its signature, its big talons spread as they strike.',
      powerSource:
        'The fire inside its body: it spits embers and streams of flame from its beak, the chest heaving to bring them up. ' +
        'Its fighting power is in its legs (kicks, knees, talon rakes) and its clawed hands (slashes, chops, claw-fist punches).',
    },
    // Where its effects leave the body: fire from the beak (the default
    // mouth; Toxic is spewed from it too), mud slapped from a claw (the
    // default hands), stars flung and Hidden Power's orbs pushed from its
    // hands.
    emitterFor: { throw: 'hands', orb: 'hands', powder: 'mouth' },
    // Loose parts on springs: the crest's three plumes, the two tail
    // feathers, the feathers round the waist (stiff), the claws of the hands
    // are one mesh with the hand (keyframed).
    dynamics: [
      { bones: ['crest', 'crestTip'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['crestL'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['crestR'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['tail', 'tail2'], damping: 0.18, elasticity: 0.1, maxDrift: 0.4 },
      { bones: ['featherAL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherBL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherCL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherAR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherBR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherCR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
    ],
    // Overlapping action: a long neck (the head trails a little more than a
    // short-necked biped's), the big feathered hands trail the forearms.
    overlap: { ...DEFAULT_OVERLAP, crest: 0.08, crestTip: 0.1, crestL: 0.08, crestR: 0.08, tail2: 0.08 },
    // Every move it can know has a clip of its own, named after it.
    moveClips: {},
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
      // Rapid Spin, Rollout, Flame Wheel: its whirl of kicks.
      spin: 'double_kick',
      // Bind, Wrap: seizing and shoving with both hands.
      grapple: 'strength',
      vine: 'fury_cutter',
      toss: 'seismic_toss',
      burrow: 'dig',
      breath: 'flamethrower',
      spit: 'ember',
      spit_strong: 'fire_blast',
      // Hyper Beam, Aurora Beam: a sustained stream from the beak.
      beam: 'flamethrower',
      jet: 'flamethrower',
      throw: 'swift',
      // Surf: a heave up and a push down at the foe.
      wave: 'rock_slide',
      // Earthquake, Magnitude: the stamp of its talons that shakes the ground.
      quake: 'rock_tomb',
      burst: 'overheat',
      // Thunder, Frenzy Plant: the heave and slam that calls it down on the foe.
      erupt: 'rock_slide',
      storm: 'fire_spin',
      bolt: 'hidden_power',
      mind: 'hidden_power',
      orb: 'hidden_power',
      drain: 'hidden_power',
      // Hyper Voice, Uproar: a cry at the foe (its own sound move is a snore).
      sound: 'growl',
      fling: 'mud_slap',
      roar: 'growl',
      glare: 'growl',
      kick_sand: 'sand_attack',
      powder: 'toxic',
      buff: 'bulk_up',
      shield: 'protect',
      heal: 'rest',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
      flash: 'growl',
    },
    hiddenParts: [],
    showcaseMoves: ['DOUBLE_KICK', 'EMBER', 'BULK_UP', 'SKY_UPPERCUT'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
