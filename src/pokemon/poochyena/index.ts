import type { SpeciesProfile } from '../profile';
import { applyCalibration } from '../profile';
import { RIG } from './rig';
import { STANCE } from './poses';
import { CLIPS, EXPRESSIONS } from './clips';
import calibration from './calibration.json';

export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'poochyena',
    rig: RIG,
    poses: { stance: STANCE },
    clips: CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: EXPRESSIONS },
    brief: {
      bodyPlan: 'quadruped',
      character:
        'A 13.6 kg hyena pup that bullies above its size: it stands low on stiff legs with its hackles and tail bristling, ' +
        'head thrust at the foe and fangs bared, and snaps, lunges and barks from where it stands. Light, quick and jerky, ' +
        'all nerve: fast snaps, sharp barks and a springy tail that flicks up at every move. When the foe strikes back it ' +
        'yelps and cringes (the Pokédex: it turns tail and runs), then bristles up again.',
      powerSource:
        'Its jaws: bared fangs for Bite and Crunch, barks, howls and roars from its mouth, and the dark orb of Shadow Ball ' +
        'gathered in them and hurled. Dark menace from its stare (Scary Face, Taunt) and its nose (Odor Sleuth); its low ' +
        'head and shoulders behind Tackle and Take Down; its right forepaw rakes up the dirt for Sand-Attack and swipes for Thief.',
    },
    // The mouth (jaw tip, built in) serves its barks, howls, the Shadow Ball it
    // hurls and Toxic; the eyes its glares. The right forepaw (the near one
    // from our side, toward us from the foe's) rakes up the dirt for
    // Sand-Attack and Mud-Slap and swipes for Thief.
    emitters: {
      forepaw: { bones: ['handR'], about: 'its right forepaw, which rakes up dirt and swipes' },
    },
    emitterFor: {
      kick_sand: 'forepaw',
      fling: 'forepaw',
      strike: 'forepaw',
      powder: 'mouth',
    },
    // A light, jumpy pup: the head and jaws follow the body quickly (bites
    // land close to their key); legs stand, so they barely trail.
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
    // Roar is bellowed at the foe; Howl (the roar motif) goes up to the sky.
    moveClips: {
      MOVE_ROAR: 'roar_foe',
    },
    // Clips by move motif (src/battle3d/motifs.ts); clips named after a
    // motif (bite, roar, kick_sand, fling, strike, charm, heal) need no entry.
    motifClips: {
      // The head-and-shoulders butt is Tackle; the charge is Take Down,
      // Double-Edge, Return, Frustration, Body Slam and Counter's lunge.
      tackle: 'physical_weak',
      tackle_strong: 'physical_strong',
      slam: 'physical_strong',
      punch: 'physical_strong',
      // Shadow Ball and Hidden Power: the orb hurled from the jaws.
      orb: 'special_strong',
      // Snore: the bark.
      sound: 'special_weak',
      // Scary Face, Odor Sleuth, Taunt, Torment, Mimic, Snatch: the stare;
      // Toxic is snarled at the foe the same way.
      glare: 'status_target',
      powder: 'status_target',
      // Protect, Endure, Substitute, Psych Up, Sleep Talk, Double Team: the braced guard.
      shield: 'status_self',
      buff: 'status_self',
      afterimage: 'status_self',
      // Sunny Day and Rain Dance are howled up to the sky.
      weather: 'roar',
    },
    hiddenParts: [],
    showcaseMoves: ['TACKLE', 'SHADOW_BALL', 'HOWL', 'BITE'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
