import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CONTACT_CLIPS, EXPRESSIONS } from './set';
import { HOME_CLIPS } from './set_home';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'mightyena',
    rig: RIG,
    poses: { stance: STANCE },
    // Its own clips, a clip for every action its moves take (./set.ts: the
    // moments and its blows at the foe; ./set_home.ts: the moves it performs
    // from home), written by hand in the style of the first clips.
    clips: { ...CONTACT_CLIPS, ...HOME_CLIPS },
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
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts): every move plays the clip
    // of its action. tackle, bite, tail, slam, burrow, punch, roar,
    // kick_sand, charm, shield, heal, weather, afterimage, powder, sound and
    // fling have clips of their own name; the category clips perform these.
    motifClips: {
      // Its forepaw's rake (Thief, Covet, Rock Smash), its reckless full-weight
      // charge (Take Down, Double-Edge, Return, Frustration, Strength), the orb
      // and the beam from its jaws, its shake, its snarl.
      strike: 'physical_weak',
      tackle_strong: 'physical_strong',
      orb: 'special_weak',
      beam: 'special_strong',
      buff: 'status_self',
      glare: 'status_target',
      // Moves outside its movepool that Mimic or Sleep Talk call: each motif's
      // closest clip of its own.
      kick: 'punch',
      quake: 'punch',
      peck: 'bite',
      grapple: 'bite',
      horn: 'tackle',
      wing: 'slam',
      spin: 'tail',
      vine: 'physical_weak',
      toss: 'physical_strong',
      breath: 'special_strong',
      jet: 'special_strong',
      burst: 'special_strong',
      spit: 'special_weak',
      bolt: 'special_weak',
      drain: 'special_weak',
      throw: 'fling',
      wave: 'roar',
      erupt: 'roar',
      storm: 'roar',
      mind: 'status_target',
      flash: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['CRUNCH', 'SHADOW_BALL', 'SCARY_FACE', 'TAKE_DOWN'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
