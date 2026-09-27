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
    slug: 'zigzagoon',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A tiny raccoon (0.4 m, 17.5 kg), restless and curious: low on four short legs, nose to the ground, it wanders back ' +
        'and forth in zigzags and is never still. It fights scrappily and all at once, head down, shoving with its whole ' +
        'little body (Tackle, Headbutt), rearing onto its haunches to swipe with a front paw, and taunting with its bushy ' +
        'striped tail. Light and quick: it rebounds off what it hits and shakes it off; its springy tail and fur bounce after it.',
      powerSource:
        'Its body and its nose: it rams with its forehead and shoulders, scoops sand with both front paws, wags its big ' +
        'zigzag tail at the foe (Tail Whip), growls and spits from its small mouth, drums its belly and bristles its fur. ' +
        'The Pokédex: it rubs its nose against the ground as it wanders, leaving zigzag footprints.',
    },
    // Built-in emitters cover most of it (the mouth for spit and beams, the
    // front paws for what it scoops); the tail is its own.
    emitters: {
      tail: { bones: ['tailTop'], about: 'its bushy zigzag tail, raised behind it' },
    },
    emitterFor: {
      // Tail Whip, Attract, Swagger: the hearts come off the wagging tail.
      charm: 'tail',
      // Sand-Attack, Mud Sport and Mud-Slap are scooped with the front paws.
      kick_sand: 'hands',
      fling: 'hands',
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
    moveClips: {
      // The game bows the sprite back, then drives it forward: its own clip.
      MOVE_HEADBUTT: 'headbutt',
      // Three volleys of needles, as the game fires them.
      MOVE_PIN_MISSILE: 'pin_missile',
    },
    // Clips by move motif (src/battle3d/motifs.ts). strike, tail, charm,
    // shield, kick_sand, glare, heal, bolt and afterimage have clips of their
    // own name; these motifs are performed by other clips.
    motifClips: {
      // Tackle is its everyday attack; Double-Edge, Flail, Return and
      // Frustration are the big pounce, and so is Body Slam.
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      slam: 'physical_strong',
      // Water Pulse is spat from the mouth. Ice Beam, Shadow Ball, Hidden
      // Power, Blizzard and Icy Wind are gathered with a deep breath and
      // fired from the mouth, braced on all fours.
      spit: 'special_weak',
      beam: 'special_strong',
      orb: 'special_strong',
      storm: 'special_strong',
      breath: 'special_strong',
      // Thunder crackles off its bristling fur like Thunderbolt.
      erupt: 'bolt',
      // Belly Drum is its buff; Growl is its roar.
      buff: 'status_self',
      roar: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'PIN_MISSILE', 'GROWL', 'TAIL_WHIP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
