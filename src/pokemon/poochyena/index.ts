import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'poochyena',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 13.6 kg hyena pup that bullies above its size: it stands low on stiff legs with its hackles and tail bristling, ' +
        'head thrust at the foe and fangs bared. It attacks in quick, low, flat darts: a pounce that lands it on the foe ' +
        'and a snap, a tug or a head-down butt, then it springs back home. Light, quick and jerky, all nerve: fast snaps, ' +
        'sharp barks and a springy tail that flicks up at every move. It chases tenaciously, but when the foe strikes back ' +
        'it yelps and cringes (the Pokédex: it turns tail and runs), then bristles up again.',
      powerSource:
        'Its jaws: bared fangs for Bite, Crunch and Poison Fang, barks, howls and roars from its mouth, the dark orb of ' +
        'Shadow Ball gathered in them and hurled, Toxic retched up. Dark menace from its stare (Leer, Scary Face, Taunt) and ' +
        'its nose (Odor Sleuth); its low head and shoulders behind Tackle and Take Down; its right forepaw swipes, digs and ' +
        'scoops (Thief, Dig, Mud-Slap) and its hind paws kick the dirt back at the foe (Sand-Attack).',
    },
    // The mouth (jaw tip, built in) serves its bites' effects, barks, howls,
    // the Shadow Ball it hurls and Toxic; the eyes its glares. The right
    // forepaw (the near one from our side) swipes and scoops mud; the hind
    // paws kick the sand back at the foe with its back turned.
    emitters: {
      forepaw: { bones: ['handR'], about: 'its right forepaw, which swipes, digs and scoops mud' },
      hindPaws: { bones: ['toeR', 'toeL'], about: 'its hind paws, which kick dirt back at the foe' },
    },
    emitterFor: {
      kick_sand: 'hindPaws',
      fling: 'forepaw',
      strike: 'forepaw',
      powder: 'mouth',
    },
    // A light, jumpy pup: the head and jaws follow the body quickly (bites
    // land close to their key); legs stand, leap and land on time.
    overlap: {
      spine: 0.012, chest: 0.025, neck: 0.04, head: 0.05, jaw: 0.035,
      earL: 0.08, earR: 0.08, mane: 0.04, maneB: 0.05,
      tail: 0.05, tail2: 0.07, tail3: 0.09, tail4: 0.11,
      armL: 0.01, armR: 0.01, forearmL: 0.02, forearmR: 0.02, handL: 0.03, handR: 0.03,
    },
    // Loose parts on springs. The tail is a spring: a bristling brush that
    // flicks up and bounces at every move. Ears, hackles and cheek tufts are
    // stiffer (single bones: the far end comes from the skin).
    dynamics: [
      { bones: ['tail', 'tail2', 'tail3', 'tail4'], damping: 0.12, elasticity: 0.09, maxDrift: 0.5 },
      { bones: ['earL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['earR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['mane'], damping: 0.22, elasticity: 0.14, maxDrift: 0.35 },
      { bones: ['maneB'], damping: 0.22, elasticity: 0.14, maxDrift: 0.35 },
      { bones: ['furL'], damping: 0.24, elasticity: 0.15, maxDrift: 0.3 },
      { bones: ['furR'], damping: 0.24, elasticity: 0.15, maxDrift: 0.3 },
      { bones: ['hipFurL'], damping: 0.24, elasticity: 0.15, maxDrift: 0.3 },
      { bones: ['hipFurR'], damping: 0.24, elasticity: 0.15, maxDrift: 0.3 },
      { bones: ['cheekL'], damping: 0.28, elasticity: 0.18, maxDrift: 0.25 },
      { bones: ['cheekR'], damping: 0.28, elasticity: 0.18, maxDrift: 0.25 },
    ],
    // Every move in its movepool plays its own clip (named after it).
    moveClips: {},
    // For moves Mimic or Mirror Move call from outside its movepool: each
    // motif's closest clip of its own.
    motifClips: {
      strike: 'thief', punch: 'counter', kick: 'rock_smash', bite: 'bite', tackle: 'tackle', slam: 'body_slam',
      tail: 'iron_tail', wing: 'return', peck: 'poison_fang', horn: 'take_down', spin: 'iron_tail', grapple: 'crunch',
      vine: 'thief', toss: 'crunch', burrow: 'dig',
      breath: 'shadow_ball', spit: 'shadow_ball', beam: 'shadow_ball', jet: 'shadow_ball', throw: 'hidden_power',
      wave: 'mud_slap', quake: 'rock_smash', burst: 'shadow_ball', erupt: 'hidden_power', storm: 'hidden_power',
      bolt: 'hidden_power', mind: 'hidden_power', orb: 'shadow_ball', drain: 'hidden_power', sound: 'sound', fling: 'mud_slap',
      roar: 'roar', glare: 'leer', kick_sand: 'sand_attack', powder: 'toxic', buff: 'psych_up', shield: 'protect',
      heal: 'rest', weather: 'sunny_day', charm: 'attract', afterimage: 'double_team', flash: 'scary_face',
    },
    hiddenParts: [],
    showcaseMoves: ['BITE', 'SHADOW_BALL', 'HOWL', 'TAKE_DOWN'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
