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
        'A 7.6 kg mud-fish pup, mostly head, on four short legs: plucky, eager and sturdy rather than quick. It fights low ' +
        'to the ground from four planted feet, the way its Pokédex says it heaves boulders: it braces, drives off its hind ' +
        'legs and leads with its big head (it rams with its crown and fin, then shakes the daze off), and it rocks back onto ' +
        'its haunches to cry. The fin on its head and its tail fin wobble after everything it does.',
      powerSource:
        'Water from its wide mouth: it plants all four feet and fires from the jaws (Water Gun, Hydro Pump, Ice Beam), ' +
        'bracing against the push. Mud is its element: it scoops mud with its chin and tosses it with its head (Mud-Slap) ' +
        'and paws it up with its front paws (Mud Sport). Its head for charges. The fin on its head is its radar: it tips it ' +
        'at the foe to sense it (Foresight).',
    },
    // Where effects leave the body. The built-in hands and feet are its front
    // paws and hind feet, described here for the move classifier.
    emitters: {
      hands: { bones: ['handR', 'handL'], about: 'front paws: it paws and splashes mud with them' },
      feet: { bones: ['footR', 'footL'], about: 'hind feet: it pushes off with them' },
      fin: { bones: ['finTip'], about: 'fin on its head, a radar that senses the foe' },
      tailFin: { bones: ['tail2'], about: 'big tail fin: it swings and slaps with it' },
    },
    // Jev (tools/gauntlet/classify_moves.mjs) needs an API key this run did
    // not have: the parts are set per motif by hand. Mud Sport and Foresight
    // need no entry: the director draws kicked-up clumps from a hind foot and
    // a glint at the eyes whatever the part, and the clips act them with the
    // front paws (kick_sand) and the head fin (glare).
    emitterFor: {
      // Mud-Slap: the mud scooped with its chin flies from its mouth.
      fling: 'mouth',
    },
    // Mudkip is mostly head (the head bone moves 974 of its vertices): a head
    // trailing the body by the default 0.065 s arrived after the game's own
    // lunge and hit, so its head, jaw and neck trail less. The head fin trails
    // with the head, so its counter-tilts (clips.ts finUp) match the head's.
    overlap: { ...DEFAULT_OVERLAP, neck: 0.03, head: 0.045, jaw: 0.045, fin: 0.045 },
    // Loose parts on springs: the head fin wobbles on its base, the tail fin
    // fans and swings behind (single chains; the far ends come from the skin).
    dynamics: [
      { bones: ['fin', 'finTip'], damping: 0.2, elasticity: 0.11, maxDrift: 0.45 },
      { bones: ['tail', 'tail2'], damping: 0.17, elasticity: 0.09, maxDrift: 0.45 },
    ],
    // Bide stores energy (the game trembles its sprite) before it strikes back.
    moveClips: { MOVE_BIDE: 'bide' },
    // Clips by move motif (src/battle3d/motifs.ts). fling, glare, kick_sand,
    // weather, charm and heal have clips of their own name; these motifs are
    // performed by the category clips.
    motifClips: {
      // Tackle is the head-first ram, Take Down the big one.
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      // Water from the mouth: the spat jet, the braced sustained jet.
      spit: 'special_weak',
      jet: 'special_strong',
      beam: 'special_strong',
      // Protect: hunkered down behind the barrier.
      shield: 'status_self',
      // Growl.
      roar: 'status_target',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'WATER_GUN', 'GROWL', 'MUD_SLAP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
