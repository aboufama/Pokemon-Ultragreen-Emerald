import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { EXPRESSIONS, SET_CONTACT } from './set';
import { SET_HOME } from './set_home';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'linoone',
    rig: RIG,
    poses: { stance: STANCE },
    // A clip for every action its moves take, made to the first clips of
    // Blaziken, Sceptile and Swampert (./set.ts, ./set_home.ts).
    clips: Object.fromEntries([...SET_CONTACT, ...SET_HOME].map((c) => [c.name, c])),
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'The rushing Pokémon (0.5 m, 32.5 kg): a long, low weasel on short legs, exceedingly fast as long as it runs in ' +
        'a straight line. Where Zigzagoon wanders in zigzags, Linoone locks its eyes on the foe and bolts at it dead ' +
        'straight, belly skimming the ground, legs a blur, and rams it or stops short on its forepaws. Sleek and ' +
        'controlled: a coiled crouch, then everything at once. It fights with its sharp claws (the Pokédex: it leaps on ' +
        'pond prey and catches it with them), rams with its long body at full speed, and whips its long striped tail; ' +
        "twice Zigzagoon's weight, it lands with it and bounds home.",
      powerSource:
        'Its claws and its speed: it rears up and rakes with the big claws of its forepaws, rams head first at full ' +
        'tilt, swings its long tail like a club and scoops the ground with its forepaws and hind legs. What it fires ' +
        'leaves its small mouth (spits, breaths, beams, roars): the head drives forward.',
    },
    // Where its effects leave the body besides the built-in mouth, eyes,
    // hands (its forepaws), feet (its hind paws) and body.
    emitters: {
      tail: { bones: ['tail4'], about: 'the tip of its long striped tail, swept up behind it' },
    },
    emitterFor: {
      // Sand-Attack and Mud Sport are raked back with the hind legs; Mud-Slap
      // is scooped with the forepaws.
      kick_sand: 'feet',
      fling: 'hands',
      // Swift flies off the tip of its flicked tail; Tail Whip and Charm are its tail's wag.
      throw: 'tail',
      charm: 'tail',
      // What it fires leaves its mouth: Thunderbolt, Blizzard, Toxic.
      bolt: 'mouth',
      storm: 'mouth',
      powder: 'mouth',
    },
    // Loose parts on springs: the long tail (its base is keyframed, the rest
    // flows and overshoots), the ears (stiff) and the tufts of cheek fur.
    dynamics: [
      { bones: ['tail2', 'tail3', 'tail4'], damping: 0.16, elasticity: 0.07, maxDrift: 0.4 },
      { bones: ['earL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['earR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['cheekL', 'cheekTipL'], damping: 0.2, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['cheekR', 'cheekTipR'], damping: 0.2, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['jowlL', 'jowlTipL'], damping: 0.22, elasticity: 0.14, maxDrift: 0.25 },
      { bones: ['jowlR', 'jowlTipR'], damping: 0.22, elasticity: 0.14, maxDrift: 0.25 },
    ],
    // The long tail ripples out from the rump, each joint a little later.
    overlap: { ...DEFAULT_OVERLAP, tail: 0.04, tail2: 0.07, tail3: 0.1, tail4: 0.13, cheekL: 0.08, cheekR: 0.08, jowlL: 0.08, jowlR: 0.08 },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). tackle, tail, slam,
    // burrow, spin, bolt, erupt, orb, breath, wave, fling, throw, charm,
    // kick_sand, glare, shield, heal, weather and afterimage have clips of
    // their own name (and Snore has its own, 'snore'); these motifs are
    // performed by other clips, down to the ones a move outside its movepool
    // (called by Mimic) would bring, each by the closest action it has.
    motifClips: {
      // The foreclaw rake; the big ram for the strong tackles.
      strike: 'physical_weak',
      tackle_strong: 'physical_strong',
      // The spit from its mouth (Toxic is spat); the beam from its jaws, and
      // the jet or burst a called move would be; Blizzard is blown like Icy Wind.
      spit: 'special_weak',
      powder: 'special_weak',
      beam: 'special_strong',
      jet: 'special_strong',
      burst: 'special_strong',
      storm: 'breath',
      // The roar at the foe (Growl, Roar), which serves a bellow and a flash;
      // the belly drum serves Belly Drum and Sleep Talk.
      roar: 'status_target',
      sound: 'status_target',
      flash: 'status_target',
      buff: 'status_self',
      // Moves outside its movepool: a blow of the forepaws, a head-first ram
      // for the head's blows, the big ram for holds and throws, the forepaws'
      // push for a quake, the stare for the mind's moves and a drain.
      punch: 'physical_weak',
      kick: 'physical_weak',
      wing: 'physical_weak',
      vine: 'physical_weak',
      bite: 'tackle',
      peck: 'tackle',
      horn: 'tackle',
      grapple: 'physical_strong',
      toss: 'physical_strong',
      quake: 'wave',
      mind: 'glare',
      drain: 'glare',
    },
    hiddenParts: [],
    // Its rushing ram, its claws (a run of rakes), a special move (Shadow
    // Ball, a TM) and its signature Belly Drum.
    showcaseMoves: ['HEADBUTT', 'FURY_SWIPES', 'SHADOW_BALL', 'BELLY_DRUM'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
