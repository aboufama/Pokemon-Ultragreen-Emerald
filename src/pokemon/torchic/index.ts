import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { TORCHIC_CLIPS, TORCHIC_EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'torchic',
    rig: RIG,
    poses: { stance: STANCE },
    clips: TORCHIC_CLIPS,
    // The model has no effect meshes: its fire is the game's (and the move effects').
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: TORCHIC_EXPRESSIONS },
    brief: {
      bodyPlan: 'bird',
      character:
        'A 2.5 kg fire chick, all round head and down on stubby legs, not a small Blaziken: plucky and eager, it squares up to ' +
        'anything, bobs and bounces rather than strides, and when it gets fired up it puffs out its chest, stands its crest up ' +
        'and flutters its tiny wings. It has no arms: it fights with its little beak (pecks, chirps, spits), the talons of its ' +
        'big feet (a barnyard scratch, a sand kick) and its whole round body, thrown head first.',
      powerSource:
        'The fire in its belly (Pokédex: if attacked, it strikes back by spitting balls of fire it forms in its stomach): it ' +
        'heaves its chest to bring the flame up, then spits embers and streams of fire from its beak. Its feet scratch and kick ' +
        'up sand; its wing tufts only flutter and fling.',
    },
    emitters: {
      wings: { bones: ['wingBL', 'wingBR'], about: 'tiny yellow wing tufts at the sides of its chest (it has no arms or hands)' },
      // It has no hands: it seizes with its beak (Seismic Toss carries the foe there).
      hands: { bones: ['jaw'], about: 'its beak, which it seizes with (it has no arms or hands)' },
    },
    emitterFor: {
      // Swift's stars (and the rocks it calls) are flung with a flap of the wing tufts.
      throw: 'wings',
      // Mud-Slap is pecked up and flicked from the beak (its feet kick the
      // sand of Sand-Attack); Toxic is spat and Hidden Power's orbs fly from
      // the beak too.
      fling: 'mouth',
      powder: 'mouth',
      orb: 'mouth',
    },
    // Loose parts on springs: the crest's three plumes (long, a little
    // springy; stiffer and it would not sway, looser and from our side it
    // flops back on every thrust, showing its shaded back), the short tail
    // feathers, and the wing tufts and the feather at the back of the collar
    // (stiff).
    dynamics: [
      { bones: ['crest', 'crestTip'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['crestL', 'crestTipL'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['crestR', 'crestTipR'], damping: 0.24, elasticity: 0.15, maxDrift: 0.28 },
      { bones: ['tail', 'tail2'], damping: 0.2, elasticity: 0.12, maxDrift: 0.4 },
      { bones: ['wingAL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingBL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingCL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingAR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingBR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['wingCR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['collarBack'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
    ],
    // Overlapping action: no neck (the head sits on the chest), so the head
    // trails the body less than a necked biped's and a bird's steady head
    // doesn't nod down on every thrust; the crest trails the head like
    // hair, the wing tufts trail the collar, the tail ripples out.
    overlap: {
      ...DEFAULT_OVERLAP,
      head: 0.045, jaw: 0.045,
      crest: 0.08, crestTip: 0.1, crestL: 0.08, crestR: 0.08, crestTipL: 0.1, crestTipR: 0.1,
      collar: 0.035, collarBack: 0.07,
      wingAL: 0.06, wingBL: 0.06, wingCL: 0.065, wingAR: 0.06, wingBR: 0.06, wingCR: 0.065,
      tail2: 0.08,
    },
    // Every move it can know has a clip of its own, named after it.
    moveClips: {},
    // Moves outside its movepool that Mimic or Mirror Move call play its
    // closest clip for their motif (src/battle3d/motifs.ts).
    motifClips: {
      // No hands: a strike is its talon rake, a punch its whole body thrown head first.
      strike: 'scratch',
      punch: 'mega_punch',
      kick: 'mega_kick',
      bite: 'peck',
      tackle: 'quick_attack',
      tackle_strong: 'double_edge',
      slam: 'body_slam',
      // Iron Tail: a leap and a swoop down onto the foe; Wing Attack: a slap of a wing tuft.
      tail: 'aerial_ace',
      wing: 'smelling_salt',
      peck: 'peck',
      // Horn Attack: its crown as the horn.
      horn: 'rock_smash',
      // Rapid Spin, Rollout, Flame Wheel: a streak at the foe crown first.
      spin: 'quick_attack',
      // Bind, Wrap: set against the foe and shoving.
      grapple: 'strength',
      // Vine Whip: the beak whipped across the foe.
      vine: 'cut',
      toss: 'seismic_toss',
      burrow: 'dig',
      breath: 'flamethrower',
      spit: 'ember',
      spit_strong: 'fire_blast',
      beam: 'flamethrower',
      jet: 'flamethrower',
      throw: 'swift',
      wave: 'rock_slide',
      // Earthquake: the stamp that shakes the ground.
      quake: 'rock_tomb',
      burst: 'overheat',
      erupt: 'rock_slide',
      storm: 'fire_spin',
      bolt: 'hidden_power',
      mind: 'hidden_power',
      orb: 'hidden_power',
      drain: 'hidden_power',
      sound: 'growl',
      fling: 'mud_slap',
      roar: 'growl',
      glare: 'mimic',
      kick_sand: 'sand_attack',
      powder: 'toxic',
      buff: 'focus_energy',
      shield: 'protect',
      heal: 'rest',
      weather: 'sunny_day',
      charm: 'attract',
      afterimage: 'double_team',
      flash: 'growl',
    },
    // The beak comes as two alternate meshes: the open one (with the inside
    // of the mouth) follows the jaw both shut and open; the closed one would
    // show through it.
    hiddenParts: ['MouthClosed'],
    // What a starter Torchic has in its first battles: Scratch and Growl at
    // level 5, Focus Energy at 7, Ember (its signature: fire spat from the
    // belly) at 10.
    showcaseMoves: ['SCRATCH', 'EMBER', 'GROWL', 'FOCUS_ENERGY'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
