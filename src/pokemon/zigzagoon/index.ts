import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './set';
import { RANGED_CLIPS } from './set_ranged';
import { STATUS_CLIPS } from './set_status';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'zigzagoon',
    rig: RIG,
    poses: { stance: STANCE },
    // A clip per action, written by hand in the first clips' style (./set.ts:
    // the moments and the contact moves; ./set_ranged.ts; ./set_status.ts).
    // The earlier kit-built set (./clips/) is kept, unused.
    clips: { ...CLIPS, ...RANGED_CLIPS, ...STATUS_CLIPS },
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A tiny raccoon (0.4 m, 17.5 kg), restless and curious: low on four short legs, nose to the ground, it wanders back ' +
        'and forth in zigzags and is never still. It fights scrappily and all at once: it goes to the foe in zigzag bounds ' +
        '(a springing bound off to one side, a second angled back in), rams it forehead first, rears onto its haunches to ' +
        'swat it with a forepaw, and taunts it with its bushy zigzag tail. Light and springy: it rebounds off what it hits ' +
        'and shakes it off; its tail and fur bounce after it.',
      powerSource:
        'Its body and its mouth: it rams with its forehead and its whole little body, swats with its forepaws, clubs with ' +
        'its big zigzag tail (Iron Tail) and wags it at the foe (Tail Whip), rakes dirt back with its hind legs, drums its ' +
        'belly, and everything it fires leaves its small mouth with the head driven at the foe. The Pokédex: it rubs its ' +
        'nose against the ground as it wanders, leaving zigzag footprints.',
    },
    // Built-in emitters cover most of it (the mouth for everything it fires,
    // the forepaws for Mud-Slap, the hind paws for the dirt it rakes back);
    // the tail and the spiky fur are its own.
    emitters: {
      tail: { bones: ['tailTop'], about: 'its bushy zigzag tail, raised behind it' },
      fur: { bones: ['mane', 'furBack'], about: 'the spiky fur on its shoulders and back, bristling' },
    },
    emitterFor: {
      // Tail Whip and the charms: the hearts come off the wagging tail.
      charm: 'tail',
      // Swift's stars fly off the flicked tail.
      throw: 'tail',
      // Sand-Attack and Mud Sport: its hind legs rake the dirt back at the foe.
      kick_sand: 'feet',
      // Mud-Slap is scooped and flicked with a forepaw.
      fling: 'hands',
      // Toxic is spat; Blizzard blows from the mouth.
      powder: 'mouth',
      storm: 'mouth',
    },
    // Loose parts on springs. The tail is big and bouncy (its top lobe on
    // the chain, its back lobe on its own); the ears and the fur are stiffer.
    dynamics: [
      { bones: ['tail', 'tail2', 'tailTop'], damping: 0.2, elasticity: 0.1, maxDrift: 0.45 },
      { bones: ['tail3'], damping: 0.24, elasticity: 0.14, maxDrift: 0.3 },
      { bones: ['earL', 'earTipL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['earR', 'earTipR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['mane'], damping: 0.28, elasticity: 0.18, maxDrift: 0.22 },
      { bones: ['furRump'], damping: 0.28, elasticity: 0.18, maxDrift: 0.22 },
    ],
    // The tail ripples out from the rump: each segment reads the clip a
    // little later than the one before (the springs add the bounce).
    overlap: { ...DEFAULT_OVERLAP, tail: 0.05, tail2: 0.09, tail3: 0.12, tailTop: 0.12 },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). Every motif of its
    // movepool has a clip of its name (tackle, tackle_strong, strike, tail,
    // slam, spin, burrow; spit, beam, breath, orb, bolt, erupt, wave, fling,
    // throw; roar, charm, kick_sand, buff, shield, heal, glare, weather,
    // afterimage); these motifs are the same action as one of them, and the
    // rest are for moves outside its movepool that Mimic calls.
    motifClips: {
      // Blizzard is a howling cold breath; Snore its growl; Toxic spat.
      storm: 'breath',
      sound: 'roar',
      powder: 'spit',
      // Called by Mimic: each plays its closest action.
      punch: 'strike',
      kick: 'strike',
      wing: 'strike',
      grapple: 'strike',
      bite: 'tackle',
      peck: 'tackle',
      horn: 'tackle',
      vine: 'tail',
      toss: 'slam',
      quake: 'slam',
      jet: 'beam',
      burst: 'bolt',
      drain: 'orb',
      mind: 'glare',
      flash: 'glare',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'PIN_MISSILE', 'GROWL', 'TAIL_WHIP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
