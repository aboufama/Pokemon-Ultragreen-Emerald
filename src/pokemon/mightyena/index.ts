import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'mightyena',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 37 kg pack hunter that never defies its leader: it stands tall on straight, stiff legs with its head high and its ' +
        'black mane and brush of a tail bristling, eyes locked on the foe. To attack it drops low and stalks, weight gathered ' +
        'on its haunches, then explodes into a long pounce that lands its whole weight and its heavy jaws on the foe, holds ' +
        'the bite and shakes. Heavier and more deliberate than Poochyena: slower wind-ups, bigger leaps, deep landings, a ' +
        'bound home with the mane flying. It does not back down when struck: it braces, snarls and bristles up again.',
      powerSource:
        'Its jaws: crushing bites (Bite, Crunch, Poison Fang), howls and roars from its mouth, the dark orb of Shadow Ball and ' +
        'the beam of Hyper Beam gathered in them. Dark menace from its red eyes (Leer, Scary Face, Taunt, its Intimidate) and ' +
        'its nose (Odor Sleuth); its mass behind Take Down, Body Slam and Strength; its right forepaw digs, swipes and scoops ' +
        '(Dig, Thief, Rock Smash, Mud-Slap); its hind paws kick up the dirt behind it (Sand-Attack).',
    },
    // The mouth (jaw tip, built in) serves its bites' effects, roars, howls,
    // the Shadow Ball it hurls, Hyper Beam and Toxic; the eyes its glares.
    // The right forepaw (the near one from our side) scoops mud and swipes;
    // the hind paws kick the sand back at the foe with its back turned.
    emitters: {
      forepaw: { bones: ['handR'], about: 'its right forepaw, which digs, scoops mud and swipes' },
      hindPaws: { bones: ['toeR', 'toeL'], about: 'its hind paws, which kick dirt back at the foe' },
    },
    emitterFor: {
      kick_sand: 'hindPaws',
      fling: 'forepaw',
      strike: 'forepaw',
      powder: 'mouth',
    },
    // Heavier than Poochyena: the head and jaws follow the body a little
    // later; the legs barely trail (they stand, leap and land on time).
    overlap: {
      spine: 0.015, chest: 0.03, neck: 0.045, neck2: 0.055, head: 0.065, jaw: 0.05,
      earL: 0.09, earR: 0.09, mane: 0.06,
      tail: 0.05, tail2: 0.07, tail3: 0.09, tail4: 0.11, tail5: 0.13,
      armL: 0.012, armR: 0.012, forearmL: 0.024, forearmR: 0.024, handL: 0.035, handR: 0.035,
    },
    // Loose parts on springs: the long mane and its locks (loose), the tail
    // (a heavy brush), the ears (stiff), the shaggy tufts of the shoulders,
    // flanks and rump and the cheek tufts (stiffer).
    dynamics: [
      { bones: ['mane'], damping: 0.15, elasticity: 0.06, maxDrift: 0.5 },
      { bones: ['hairL', 'hairTipL'], damping: 0.14, elasticity: 0.05, maxDrift: 0.5 },
      { bones: ['hairR', 'hairTipR'], damping: 0.14, elasticity: 0.05, maxDrift: 0.5 },
      { bones: ['lockBL'], damping: 0.16, elasticity: 0.07, maxDrift: 0.45 },
      { bones: ['lockBR'], damping: 0.16, elasticity: 0.07, maxDrift: 0.45 },
      { bones: ['lockCL'], damping: 0.16, elasticity: 0.07, maxDrift: 0.45 },
      { bones: ['lockCR'], damping: 0.16, elasticity: 0.07, maxDrift: 0.45 },
      { bones: ['tail', 'tail2', 'tail3', 'tail4', 'tail5'], damping: 0.14, elasticity: 0.08, maxDrift: 0.5 },
      { bones: ['earL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['earR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['furShoulderL'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furShoulderR'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furFlankL'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furFlankR'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furRumpL'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furRumpR'], damping: 0.22, elasticity: 0.13, maxDrift: 0.35 },
      { bones: ['furHipL', 'furHipTipL'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['furHipR', 'furHipTipR'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
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
      vine: 'thief', toss: 'strength', burrow: 'dig',
      breath: 'hyper_beam', spit: 'shadow_ball', beam: 'hyper_beam', jet: 'hyper_beam', throw: 'hidden_power',
      wave: 'mud_slap', quake: 'rock_smash', burst: 'hyper_beam', erupt: 'hidden_power', storm: 'hidden_power',
      bolt: 'hidden_power', mind: 'hidden_power', orb: 'shadow_ball', drain: 'hidden_power', sound: 'sound', fling: 'mud_slap',
      roar: 'roar', glare: 'leer', kick_sand: 'sand_attack', powder: 'toxic', buff: 'psych_up', shield: 'protect',
      heal: 'rest', weather: 'sunny_day', charm: 'attract', afterimage: 'double_team', flash: 'scary_face',
    },
    hiddenParts: [],
    showcaseMoves: ['CRUNCH', 'SHADOW_BALL', 'SCARY_FACE', 'TAKE_DOWN'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
