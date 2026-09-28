import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { EXPRESSIONS, POOCHYENA_CLIPS } from './set';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'poochyena',
    rig: RIG,
    poses: { stance: STANCE },
    // A clip for every action its moves take, keyed by hand in the first
    // clips' style (./set.ts); every move of an action plays its clip.
    clips: { ...POOCHYENA_CLIPS },
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 13.6 kg hyena pup that bullies above its size: it stands squared up to the foe on all four paws, hindquarters ' +
        'swung out, head up and fangs bared, hackles and tail bristling. Light, quick and springy, all nerve: it pounces to ' +
        'the foe in one long, low arc with its body stretched out straight, lands on all fours in front of it and bites, ' +
        'rams head first, rakes with a forepaw or throws its weight on it, then bounds home backwards still facing it. Its ' +
        'hackles and tail flick up at every move; when struck it yelps and cringes, ears flat and tail tucked (the Pokédex: ' +
        'it turns tail and runs if the foe strikes back), then bristles up again.',
      powerSource:
        'Its jaws: bared fangs for Bite, Crunch and Poison Fang; howls, roars and snores from its mouth; the dark orb of ' +
        'Shadow Ball gathered in them and hurled, and Toxic breathed out. Dark menace from its snarl and stare (Leer, Scary ' +
        'Face, Taunt) and its nose (Odor Sleuth); its head and shoulders behind Tackle and Take Down; its right forepaw rakes ' +
        '(Thief, Rock Smash) and flicks mud (Mud-Slap), both forepaws dig (Dig) and strike back (Counter), and its hind paws ' +
        'kick the dirt back at the foe (Sand-Attack).',
    },
    // The mouth (jaw tip, built in) serves its bites' effects, howls, the
    // snore, the Shadow Ball it hurls and Toxic; the eyes its glares. The
    // right forepaw (the near one from our side) rakes and flicks mud; the
    // hind paws kick the sand back at the foe with its rump turned to it.
    emitters: {
      forepaw: { bones: ['handR'], about: 'its right forepaw, which rakes, digs and flicks mud' },
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
    // Every move plays the clip of its action: the clips are named after
    // their motifs (bite, tackle, tackle_strong for the strong charges, strike,
    // punch, tail, slam, burrow, orb, beam, sound, fling, roar, glare,
    // kick_sand, charm, shield, heal, weather, buff, afterimage, powder).
    moveClips: {},
    // The motifs outside its movepool (moves Mimic can call), each on its
    // closest action: a quadruped's kick is its rearing forepaw blow, a peck
    // or a grip its bite, a horn its head-first charge, a spin its tail's
    // spin; streams from the mouth its beam, a spat projectile or a bolt its
    // hurled orb, a thrown volley its flick; a summons, a wave or a flash its
    // howl; a mind move or a drain its stare; Earthquake its rearing
    // forepaw blow (a quadruped's stamp).
    motifClips: {
      kick: 'punch', wing: 'tackle', peck: 'bite', horn: 'tackle', spin: 'tail', grapple: 'bite', vine: 'strike', toss: 'bite',
      breath: 'beam', spit: 'orb', jet: 'beam', throw: 'fling', wave: 'roar', quake: 'punch', burst: 'beam', erupt: 'roar',
      storm: 'beam', bolt: 'orb', mind: 'glare', drain: 'glare', flash: 'roar',
    },
    hiddenParts: [],
    showcaseMoves: ['BITE', 'SHADOW_BALL', 'HOWL', 'TAKE_DOWN'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
