import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './set';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'marshtomp',
    rig: RIG,
    poses: { stance: STANCE },
    // Swampert's first clips, ported to Marshtomp: a clip per action (./set.ts).
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A 28 kg mud-fish that has just learned to stand: squat on short, toughened hind legs, all big head and thick arms, ' +
        'built like a young wrestler. It fights the way Swampert does, a third of its weight: it crouches before it moves, ' +
        'springs in with a quick, bouncy leap, lands flat-footed in a squat and throws its whole weight into the blow (a ' +
        'shoulder charge, a belly-first crash, a haymaker, a chop, a bear hug), then hops home. Cheerful and eager (the grin ' +
        'never quite leaves), stubborn when hurt, happiest splashing and wallowing in mud.',
      powerSource:
        'Water and mud from its wide mouth (Water Gun, Mud Shot, Hydro Pump, the beams): the head drives forward and the ' +
        'body braces in a squat. Its arms and weight for the ground: it scoops and hurls mud with both hands, heaves Surf, ' +
        'Muddy Water and boulders up with both arms and hammers the earth with its fists for Earthquake. The fin on its head ' +
        'senses the foe; its skin must stay wet, so it calls the rain and revels in mud (the Pokédex: it replenishes fluids ' +
        'by playing in mud).',
    },
    // Where effects leave the body besides the built-in mouth, eyes, hands,
    // feet and body.
    emitters: {
      fin: { bones: ['fin'], about: 'fin on top of its head, which senses the foe' },
      tail: { bones: ['tailTipL', 'tailTipR'], about: 'two broad tail lobes: it swats and slaps with them' },
    },
    emitterFor: {
      // Rock Tomb, Rock Slide: boulders heaved up from both hands.
      throw: 'hands',
      // Toxic is spat out as it bellows; Blizzard's charge gathers at its mouth.
      powder: 'mouth',
      storm: 'mouth',
      // Mud-Slap: the clod of mud heaved from both hands.
      fling: 'hands',
      // Mud Sport: mud kicked up with its foot.
      kick_sand: 'feet',
      // Foresight, Mimic: the head fin senses the foe.
      glare: 'fin',
    },
    // No neck: the head reads the clip like a neck would (it carries the
    // whole upper body), the fin with it.
    overlap: { ...DEFAULT_OVERLAP, head: 0.05, jaw: 0.055, fin: 0.07, tailL: 0.06, tailR: 0.06, tailTipL: 0.08, tailTipR: 0.08 },
    // Loose parts on springs: the head fin is a stiff plate on its crown; the
    // two tail lobes are broad, heavy fins that drag and flap behind.
    dynamics: [
      { bones: ['fin'], damping: 0.24, elasticity: 0.15, maxDrift: 0.35 },
      { bones: ['tailL', 'tailTipL'], damping: 0.18, elasticity: 0.1, maxDrift: 0.4 },
      { bones: ['tailR', 'tailTipR'], damping: 0.18, elasticity: 0.1, maxDrift: 0.4 },
    ],
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts), as Swampert's first clips
    // have them. quake, wave, shield, punch, strike, glare, kick_sand, heal,
    // toss, burrow, fling, afterimage, tail, kick, spin and charm have clips
    // of their own name; these motifs are performed by other clips.
    motifClips: {
      // Heaving boulders up and hurling them is the same body action as
      // raising a wave.
      throw: 'wave',
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      slam: 'physical_strong',
      spit: 'special_weak',
      beam: 'special_strong',
      buff: 'status_self',
      weather: 'status_self',
      roar: 'status_target',
      // Hydro Pump, Blizzard and Icy Wind are its blasts from the jaws,
      // Whirlpool its wave, Toxic is spat as it bellows, Snore and Uproar its
      // bellow, Hidden Power spat from the mouth.
      jet: 'special_strong',
      storm: 'special_strong',
      breath: 'special_strong',
      erupt: 'wave',
      powder: 'status_target',
      sound: 'status_target',
      orb: 'special_weak',
      // Motifs only a move it calls (Mimic, Sleep Talk) can bring: the clip
      // of its closest action, by strength where a category would choose.
      bite: 'physical_weak',
      bite_strong: 'physical_strong',
      peck: 'physical_weak',
      peck_strong: 'physical_strong',
      horn: 'physical_weak',
      horn_strong: 'physical_strong',
      // An arm swung through the foe, a wing's or a vine's.
      wing: 'strike',
      vine: 'strike',
      // Seizing the foe: its bear hug.
      grapple: 'toss',
      burst: 'special_strong',
      bolt: 'special_weak',
      bolt_strong: 'special_strong',
      drain: 'special_weak',
      drain_strong: 'special_strong',
      // Still, leaning in and peering at the foe.
      mind: 'glare',
      flash: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['TAKE_DOWN', 'MUD_SHOT', 'PROTECT', 'EARTHQUAKE'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
