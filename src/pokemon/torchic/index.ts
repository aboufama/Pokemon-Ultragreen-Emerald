import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { TORCHIC_SET, TORCHIC_EXPRESSIONS } from './set';
import { TORCHIC_MORE } from './set_more';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'torchic',
    rig: RIG,
    poses: { stance: STANCE },
    // A clip for every action its moves take, made the way Blaziken's first
    // clips are (./set.ts) and its clips since (./set_more.ts). The per-move
    // clips of ./clips/ are no longer played.
    clips: { ...TORCHIC_SET, ...TORCHIC_MORE },
    // The model has no effect meshes: its fire is the game's (and the move effects').
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: TORCHIC_EXPRESSIONS },
    brief: {
      bodyPlan: 'bird',
      character:
        'A 2.5 kg fire chick, all round head and down on stubby legs, not a small Blaziken: plucky and eager, it squares up to ' +
        'anything and springs about light and quick, and when it gets fired up it puffs out its chest, stands its crest up ' +
        'and flutters its tiny wings. It has no arms: it fights with its little beak (pecks, spits, seizes), the talons of its ' +
        'big feet (a rooster\'s spring and rake, hop-kicks, a sand kick) and its whole round body (thrown crown first, or ' +
        'swung round behind a wing tuft like a fist).',
      powerSource:
        'The fire in its belly (Pokédex: if attacked, it strikes back by spitting balls of fire it forms in its stomach): it ' +
        'heaves its chest to bring the flame up, then spits embers and streams of fire from its beak. Its feet rake, kick and ' +
        'scratch up sand; its wing tufts flutter.',
    },
    emitters: {
      wings: { bones: ['wingBL', 'wingBR'], about: 'tiny yellow wing tufts at the sides of its chest (it has no arms or hands)' },
      // It has no hands: it seizes with its beak (Seismic Toss carries the foe there).
      hands: { bones: ['jaw'], about: 'its beak, which it seizes with (it has no arms or hands)' },
    },
    emitterFor: {
      // Swift's stars leave the beak as it flicks its head (the rocks of
      // Rock Slide and Rock Tomb fall on the foe from above).
      throw: 'mouth',
      // Mud-Slap is scooped up and flung from the beak (its feet kick the
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
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). The category clips keep
    // their names (Blaziken's); punch, tackle, tackle_strong, peck, toss,
    // burrow, fling, afterimage, shield, heal, weather, charm, burst, throw,
    // slam and quake are named after their motifs. The rest are the
    // actions its own moves show, and the clips that best show a move
    // Mimic or Mirror Move calls from outside its movepool.
    motifClips: {
      // Scratch, Slash, Cut: its talon rake. A lash of a vine is raked too.
      strike: 'physical_weak',
      vine: 'physical_weak',
      // Mega Kick is its big flying kick; kicks Mirror Move copies (Double
      // Kick) are its two hop-kicks.
      kick: 'physical_weak_kick',
      kick_strong: 'physical_strong',
      // Its beak does what jaws and horns do, and seizes what it binds.
      bite: 'peck',
      horn: 'peck',
      grapple: 'peck',
      // A tail swung down, or a rolling spin, is its whole body thrown.
      tail: 'slam',
      spin: 'tackle',
      // A wing strike is its wing-tuft haymaker.
      wing: 'punch',
      // Ember is spat from the beak (and Fire Blast), Flamethrower and Fire
      // Spin stream from it; so do beams, jets and gusts.
      spit: 'special_weak',
      breath: 'special_strong',
      beam: 'special_strong',
      jet: 'special_strong',
      storm: 'special_strong',
      // Hidden Power's orb and Toxic are spat from the beak, energy drawn from
      // the foe comes with a spit's heave.
      orb: 'special_weak',
      powder: 'special_weak',
      drain: 'special_weak',
      // A cry at the foe: Growl, a stare (Mimic), a snore, a psychic push.
      roar: 'status_target',
      glare: 'status_target',
      sound: 'status_target',
      mind: 'status_target',
      // Power gathered and let out all at once: Overheat, and a wave, a
      // bolt, an eruption or a flash called from outside its movepool.
      wave: 'burst',
      bolt: 'burst',
      erupt: 'burst',
      flash: 'burst',
      kick_sand: 'status_target_kick',
      buff: 'status_self',
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
