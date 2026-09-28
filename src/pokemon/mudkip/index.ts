import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './set';
import { MOTIF_CLIPS } from './set_motifs';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'mudkip',
    rig: RIG,
    poses: { stance: STANCE },
    // A clip for every action its moves take, in the style of its line's first
    // clips (Swampert's): the moments and category clips (./set.ts) and the
    // motif clips (./set_motifs.ts). The per-move clips of ./clips/ are not used.
    clips: { ...CLIPS, ...MOTIF_CLIPS },
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 7.6 kg mud-fish pup, mostly head, on four short legs: plucky, eager and springy. It coils back on its haunches ' +
        'and pounces at the foe in one high springing arc, all four feet off the ground, lands on its front paws and ' +
        'butts it with its big head, the fin on its head leading like a horn and the hind legs driving the whole body in ' +
        'behind it, then bounces back and hops home. The Pokédex says it heaves boulders by planting its four feet: it ' +
        'braces on all four to fire water, and rears up with its whole body to raise waves.',
      powerSource:
        'Water from its wide mouth: a gulp with the head up, then the head snaps forward and the jaw drops (Water Gun, ' +
        'Hydro Pump, Ice Beam), braced on all four feet. Mud is its element: it digs its front paws into the mud and flings ' +
        'it (Mud-Slap), paws it up (Mud Sport) and dives into the ground head first (Dig). Its crown for rams and smashes, ' +
        'its front paws for stamps (Stomp), its big tail fin for slaps (Iron Tail). The fin on its head is its radar: it ' +
        'tips it at the foe to sense it (Foresight).',
    },
    // Where effects leave the body. The built-in hands and feet are its front
    // paws and hind feet, described here for the move classifier.
    emitters: {
      hands: { bones: ['handR', 'handL'], about: 'front paws: it paws, digs, stamps and flings mud with them' },
      feet: { bones: ['footR', 'footL'], about: 'hind feet: it pushes off with them' },
      fin: { bones: ['finTip'], about: 'fin on its head, a radar that senses the foe' },
      tailFin: { bones: ['tail2'], about: 'big tail fin: it swings, slaps and wags it' },
    },
    // The part per move is in moves.json; these cover moves outside its
    // movepool that Mimic or Sleep Talk call, by motif.
    emitterFor: {
      // Mud-Slap: the mud flung up with both front paws.
      fling: 'hands',
      // Mud Sport: the mud pawed up and flicked with a front paw.
      kick_sand: 'hands',
      // Foresight: the head fin is the radar the clip tips at the foe.
      glare: 'fin',
      // Toxic is spewed from the mouth; Blizzard is cried out.
      powder: 'mouth',
      storm: 'mouth',
    },
    // Mudkip is mostly head (the head bone moves 974 of its vertices): a head
    // trailing the body by the default 0.065 s arrived after its blows, so its
    // head, jaw and neck trail less, and the head fin with the head. Its front
    // legs are the arm chain: they are legs, and legs don't trail.
    overlap: {
      ...DEFAULT_OVERLAP, neck: 0.03, head: 0.045, jaw: 0.045, fin: 0.045,
      armL: 0, armR: 0, forearmL: 0, forearmR: 0, handL: 0, handR: 0,
    },
    // Loose parts on springs: the head fin wobbles on its base, the tail fin
    // fans and swings behind (single chains; the far ends come from the skin).
    dynamics: [
      { bones: ['fin', 'finTip'], damping: 0.2, elasticity: 0.11, maxDrift: 0.45 },
      { bones: ['tail', 'tail2'], damping: 0.17, elasticity: 0.09, maxDrift: 0.45 },
    ],
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). shield, glare, burrow,
    // heal, charm, spin, fling, kick_sand, afterimage, wave, strike, kick and
    // tail have clips of their own name; these motifs are performed by
    // other clips, as Swampert's first clips have them.
    motifClips: {
      // Its headbutt, and its whole-body crash for the big ones.
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      slam: 'physical_strong',
      // Spat from the mouth: water, Hidden Power's orbs.
      spit: 'special_weak',
      orb: 'special_weak',
      // Its blasts from the jaws: Ice Beam, Hydro Pump, Blizzard, Icy Wind.
      beam: 'special_strong',
      jet: 'special_strong',
      storm: 'special_strong',
      breath: 'special_strong',
      // Crying to the sky.
      buff: 'status_self',
      weather: 'status_self',
      // Its bellow: Growl, Toxic spat as it bellows, Snore and Uproar.
      roar: 'status_target',
      powder: 'status_target',
      sound: 'status_target',
      // Raised with its whole body, like a wave: Whirlpool's water, Rock Tomb's rocks.
      erupt: 'wave',
      throw: 'wave',
      // Moves outside its movepool that Mimic or Sleep Talk call, by the
      // closest thing its body does: a jab, a horn or a bite leads with its
      // head (its headbutt, the fin its horn); a punch or a grapple is its
      // forepaws coming down on the foe (its stomp); a vine lashes like its
      // tail fin; a wing or a toss is its leaping crash; bursts and bolts are
      // gathered and blasted from its mouth; mind powers and draining reach
      // out at the foe as its radar does; Flash flares at the foe like its
      // bellow; Earthquake is its rear and slam.
      peck: 'physical_weak',
      horn: 'physical_weak',
      bite: 'physical_weak',
      punch: 'kick',
      grapple: 'kick',
      vine: 'tail',
      wing: 'physical_strong',
      toss: 'physical_strong',
      burst: 'special_strong',
      bolt: 'special_strong',
      mind: 'glare',
      drain: 'glare',
      flash: 'status_target',
      quake: 'wave',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'WATER_GUN', 'GROWL', 'MUD_SLAP'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
