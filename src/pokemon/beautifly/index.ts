import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { SET_CLIPS } from './set';
import { RANGED_CLIPS } from './set_ranged';
import { STATUS_CLIPS } from './set_status';
import calibration from './calibration.json';

/** The proboscis uncoils (and coils) from the face out to the tip, like a whip unrolling. */
const PROBOSCIS_OVERLAP = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`proboscis${i + 1}`, +(0.005 * (i + 1)).toFixed(3)]));

/**
 * BEAUTIFLY: the butterfly the Wurmple line becomes through Silcoon. It never
 * stands: it hovers on its big patterned wings, which never stop beating, and
 * it attacks ferociously when angered, flying at the foe to strike it.
 */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'beautifly',
    rig: RIG,
    poses: { stance: STANCE },
    // Its set (./set.ts, ./set_ranged.ts, ./set_status.ts): a clip for every
    // action its moves take, hand-keyed in the first clips' style.
    clips: { ...SET_CLIPS, ...RANGED_CLIPS, ...STATUS_CLIPS },
    effectParts: [],
    effects: {},
    brief: {
      bodyPlan: 'bird',
      character: 'A butterfly (1 m, 28.4 kg) that flits through flower fields drinking nectar: light and graceful, it hovers on big patterned wings with long trailing tail streamers, beating slowly at rest and fast and hard in a fight. It attacks ferociously when angered: it rears back, swoops at the foe in one arc and rams it or slashes it with its wings, then flutters home.',
      powerSource: 'Its wings: every beat whips up wind (Gust, Whirlwind, Silver Wind), scales, spores and stars are shaken or flung off them (Stun Spore, Silver Wind, Swift), and they slash in its flying strikes. Its long needle of a proboscis, coiled under its face, uncoils at the foe to drink its energy (Absorb, Mega Drain, Giga Drain), fires a poison barb (Poison Sting) and sprays poison (Toxic); thread and beams leave its mouth at the proboscis root (String Shot, Hyper Beam, Solar Beam).',
    },
    emitters: {
      mouth: { bones: ['proboscis1'], offset: [0, 0, 0], about: 'its mouth under its face, where the proboscis starts: thread, beams, orbs and its snore leave it' },
      proboscis: { bones: ['proboscis12'], reach: 0.9, about: 'the tip of its long needle-like proboscis, uncoiled at the foe to drink (drains), fire a barb and spray' },
      wings: { bones: ['foreTipL', 'foreTipR'], reach: 0.9, about: 'its big patterned forewings: the wind of every beat, the scales, spores and stars shaken or flung off them' },
    },
    // Which part each motif's effect leaves from when a move has no part of its own (moves.json sets its moves').
    emitterFor: { storm: 'wings', powder: 'wings', throw: 'wings', drain: 'proboscis', spit: 'proboscis', beam: 'mouth', orb: 'mouth', sound: 'mouth' },
    // The hindwings' long tail streamers trail and flutter behind every beat;
    // the forewing tips flex; the antennae bob.
    dynamics: [
      { bones: ['foreTipL'], damping: 0.3, elasticity: 0.2, maxDrift: 0.2 },
      { bones: ['foreTipR'], damping: 0.3, elasticity: 0.2, maxDrift: 0.2 },
      { bones: ['hind2L', 'hind3L', 'hind4L', 'hind5L'], damping: 0.16, elasticity: 0.08, maxDrift: 0.4 },
      { bones: ['hind2R', 'hind3R', 'hind4R', 'hind5R'], damping: 0.16, elasticity: 0.08, maxDrift: 0.4 },
      { bones: ['antenna2L', 'antenna3L'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
      { bones: ['antenna2R', 'antenna3R'], damping: 0.22, elasticity: 0.12, maxDrift: 0.3 },
    ],
    overlap: { ...DEFAULT_OVERLAP, ...PROBOSCIS_OVERLAP },
    // Double-Edge (and Take Down, the same action) is its reckless stoop and crash.
    moveClips: { MOVE_DOUBLE_EDGE: 'physical_strong' },
    // Clips by move motif (src/battle3d/motifs.ts). The clips named after a
    // motif (tackle, storm, drain, orb, mind, sound, throw, shield, powder,
    // heal, weather, charm, afterimage, flash) need no entry; this maps the
    // category clips to the motifs they perform, and every other motif to its
    // closest clip for the moves Mimic and Sleep Talk can call.
    motifClips: {
      // Its wing slash (Aerial Ace, Thief).
      strike: 'physical_weak',
      wing: 'physical_weak',
      // Its needle of a proboscis: Poison Sting's barb, String Shot's thread and Toxic's poison.
      spit: 'special_weak',
      'powder@mouth': 'special_weak',
      'powder@proboscis': 'special_weak',
      // The beam from its mouth (Hyper Beam, Solar Beam).
      beam: 'special_strong',
      // Sleep Talk's display, Mimic's stare.
      buff: 'status_self',
      glare: 'status_target',
      // Called moves: blows fly to the foe (a ram, a wing slash, the big stoop)...
      punch: 'tackle',
      kick: 'physical_weak',
      bite: 'tackle',
      peck: 'tackle',
      horn: 'tackle',
      grapple: 'tackle',
      spin: 'tackle',
      tail: 'physical_weak',
      vine: 'physical_weak',
      slam: 'physical_strong',
      toss: 'physical_strong',
      burrow: 'physical_strong',
      punch_strong: 'physical_strong',
      kick_strong: 'physical_strong',
      strike_strong: 'physical_strong',
      // ...rays and throws leave from home...
      breath: 'special_strong',
      jet: 'special_strong',
      burst: 'special_strong',
      bolt: 'special_weak',
      fling: 'special_weak',
      wave: 'storm',
      quake: 'storm',
      erupt: 'mind',
      // ...and status moves stay at home.
      roar: 'status_target',
      kick_sand: 'powder',
    },
    hiddenParts: [],
    // Its wing slash, its drink, its paralysing powder and its signature silver wind.
    showcaseMoves: ['AERIAL_ACE', 'GIGA_DRAIN', 'STUN_SPORE', 'SILVER_WIND'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
