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
    slug: 'mudkip',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 7.6 kg mud-fish pup, mostly head, on four short legs: plucky, eager and bouncy, all heart. It fights low to the ' +
        'ground, the way its Pokédex says it heaves boulders: it crouches back on its haunches and bounds at the foe in ' +
        'pounces, all four feet off the ground, and rams it with its big head (its crown and fin lead), then bounces home. ' +
        'It rocks back onto its haunches to cry, shakes itself like a wet dog to get over things, and the fin on its head ' +
        'and its tail fin wobble after everything it does.',
      powerSource:
        'Water from its wide mouth: it plants all four feet and fires from the jaws (Water Gun, Hydro Pump, Ice Beam), ' +
        'bracing against the push. Mud is its element: it scoops mud with its chin and tosses it with its head (Mud-Slap) ' +
        'and paws it up with its front paws (Mud Sport, Dig). Its head for charges, its front paws for stamps (Stomp, ' +
        'Rock Tomb), its tail fin for slaps (Iron Tail). The fin on its head is its radar: it tips it at the foe to sense ' +
        'it (Foresight).',
    },
    // Where effects leave the body. The built-in hands and feet are its front
    // paws and hind feet, described here for the move classifier.
    emitters: {
      hands: { bones: ['handR', 'handL'], about: 'front paws: it paws, digs, stamps and splashes mud with them' },
      feet: { bones: ['footR', 'footL'], about: 'hind feet: it pushes off with them' },
      fin: { bones: ['finTip'], about: 'fin on its head, a radar that senses the foe' },
      tailFin: { bones: ['tail2'], about: 'big tail fin: it swings, slaps and wags it' },
    },
    // The part per move is in moves.json; these cover moves outside its
    // movepool that Mimic or Sleep Talk call, by motif.
    emitterFor: {
      // Mud-Slap: the mud raked up and flicked with a front paw.
      fling: 'hands',
      // Mud Sport: the clip paws the mud up with the front paws.
      kick_sand: 'hands',
      // Foresight: the head fin is the radar the clip tips at the foe.
      glare: 'fin',
      // Toxic is spewed from the mouth; Blizzard is cried out.
      powder: 'mouth',
      storm: 'mouth',
    },
    // Mudkip is mostly head (the head bone moves 974 of its vertices): a head
    // trailing the body by the default 0.065 s arrived after its blows, so its
    // head, jaw and neck trail less. The head fin trails with the head, so
    // its counter-tilts (clips/kit.ts finUp) match the head's.
    overlap: { ...DEFAULT_OVERLAP, neck: 0.03, head: 0.045, jaw: 0.045, fin: 0.045 },
    // Loose parts on springs: the head fin wobbles on its base, the tail fin
    // fans and swings behind (single chains; the far ends come from the skin).
    dynamics: [
      { bones: ['fin', 'finTip'], damping: 0.2, elasticity: 0.11, maxDrift: 0.45 },
      { bones: ['tail', 'tail2'], damping: 0.17, elasticity: 0.09, maxDrift: 0.45 },
    ],
    moveClips: {},
    // Every move it can know plays its own clip. These are for moves outside
    // its movepool that Mimic and Sleep Talk call: each motif
    // (src/battle3d/motifs.ts) plays its closest clip.
    motifClips: {
      // No claws, fists or feet to kick with: its head, its paws, its tail fin.
      strike: 'frustration',
      punch: 'secret_power',
      kick: 'stomp',
      bite: 'endeavor',
      peck: 'secret_power',
      horn: 'facade',
      tackle: 'tackle',
      tackle_strong: 'take_down',
      slam: 'body_slam',
      tail: 'iron_tail',
      wing: 'frustration',
      vine: 'iron_tail',
      spin: 'rollout',
      grapple: 'endeavor',
      toss: 'strength',
      burrow: 'dig',
      breath: 'icy_wind',
      spit: 'water_gun',
      beam: 'ice_beam',
      jet: 'hydro_pump',
      throw: 'rock_tomb',
      wave: 'surf',
      quake: 'rock_tomb',
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
    showcaseMoves: ['TACKLE', 'WATER_GUN', 'GROWL', 'MUD_SLAP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
