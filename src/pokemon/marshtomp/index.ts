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
    slug: 'marshtomp',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A 28 kg mud-fish that has just learned to stand: squat on short, toughened hind legs, all big head and thick arms, ' +
        'sturdy in the mud and built like a young wrestler. It fights from its feet, grounded and square, not springy: it ' +
        'bounds in with a stocky leap and lands flat-footed in a squat, and when it strikes it throws its whole weight behind ' +
        'its arms (shoves, swats, clubbing fists) or its big head. Cheerful and eager (the grin never quite leaves), stubborn ' +
        'when hurt, happiest splashing and wallowing in mud.',
      powerSource:
        'Water and mud from its wide mouth (Water Gun, Mud Shot, Hydro Pump, the beams): the head drives forward and the ' +
        'body braces in a squat. Its arms and weight for the ground: it scoops and hurls mud with its hands, heaves Surf and ' +
        'Muddy Water up with both arms and stamps the earth for Earthquake. The fin on its head senses the foe; its skin must ' +
        'stay wet, so it revels in rain and mud (the Pokédex: it replenishes fluids by playing in mud).',
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
      // Toxic is spat out; Blizzard's storm howls from its mouth.
      powder: 'mouth',
      storm: 'mouth',
      // Mud-Slap: a clod of mud slung from the hand.
      fling: 'hands',
      // Mud Sport: mud kicked up with its feet.
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
    // Every move it can know plays its own clip. These are for moves outside
    // its movepool that Mimic and Sleep Talk call: each motif
    // (src/battle3d/motifs.ts) plays its closest clip.
    motifClips: {
      strike: 'rock_smash',
      punch: 'mega_punch',
      kick: 'mega_kick',
      // No bite, beak or horn of its own: a lunge of its big head.
      bite: 'secret_power',
      peck: 'secret_power',
      horn: 'facade',
      tackle: 'tackle',
      tackle_strong: 'take_down',
      slam: 'body_slam',
      tail: 'iron_tail',
      // Its arm swung like a wing, or a vine: the backhand swat.
      wing: 'counter',
      vine: 'counter',
      spin: 'rollout',
      // Wrapping round the foe: the diving tackle that clings on.
      grapple: 'endeavor',
      toss: 'seismic_toss',
      burrow: 'dig',
      breath: 'icy_wind',
      spit: 'water_gun',
      beam: 'ice_beam',
      jet: 'hydro_pump',
      throw: 'rock_slide',
      wave: 'surf',
      quake: 'earthquake',
      burst: 'mirror_coat',
      erupt: 'whirlpool',
      storm: 'blizzard',
      bolt: 'hidden_power',
      mind: 'mirror_coat',
      orb: 'water_pulse',
      drain: 'hidden_power',
      sound: 'uproar',
      fling: 'mud_slap',
      roar: 'growl',
      glare: 'foresight',
      kick_sand: 'mud_sport',
      powder: 'toxic',
      buff: 'curse',
      shield: 'protect',
      heal: 'rest',
      weather: 'rain_dance',
      charm: 'attract',
      afterimage: 'double_team',
      flash: 'mimic',
    },
    hiddenParts: [],
    showcaseMoves: ['TAKE_DOWN', 'MUD_SHOT', 'PROTECT', 'EARTHQUAKE'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
