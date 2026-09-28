import type { SpeciesProfile } from '../profile';
import { DEFAULT_OVERLAP } from '../../anim/animator';
import { RIG } from './rig';
import { STANCE } from './poses';
import { COMBUSKEN_CLIPS, COMBUSKEN_EXPRESSIONS } from './set';
import { applyCalibration } from '../profile';
import calibration from './calibration.json';

/** Combusken: a young fowl that fights with its feet. */
export async function createProfile(palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }): Promise<SpeciesProfile> {
  const cal = calibration as SpeciesProfile['calibration'];
  return {
    slug: 'combusken',
    rig: RIG,
    poses: { stance: STANCE },
    // Blaziken's first clips and the clips added since in their style,
    // ported to Combusken (./set.ts): a clip for every action its moves take.
    clips: COMBUSKEN_CLIPS,
    effectParts: [],
    effects: {},
    expressions: { material: 'Eye', cell: [0.5, 0.25], cells: COMBUSKEN_EXPRESSIONS },
    brief: {
      bodyPlan: 'biped',
      character:
        'A young fowl and a born kicker (Pokédex: it lashes out with ten kicks a second, and its fighting instinct keeps ' +
        'it on the offensive until the foe gives up): lighter than Blaziken and as springy, it fights from a wide crouch ' +
        'on its short, strong bird legs with its long feathered arms held wide like wings, leaps in to strike and hops ' +
        'back out. Cocky and relentless; the kicks are its signature, its big talons spread as they strike.',
      powerSource:
        'The fire inside its body: it spits embers and streams of flame from its beak, the chest heaving to bring them up. ' +
        'Its fighting power is in its legs (kicks, knees) and its big clawed hands (slashes, claw-fist punches).',
    },
    // Where its effects leave the body (as Blaziken's): fire from the beak
    // (the default mouth; Toxic is spat from it too), Mud-Slap flicked with a
    // foot, thrown volleys (Rock Slide, Swift) from the claw.
    emitterFor: { fling: 'feet', powder: 'mouth', throw: 'hands' },
    // Loose parts on springs: the crest's three plumes, the two tail
    // feathers, the feathers round the waist (stiff); the claws of the hands
    // are one mesh with the hand.
    dynamics: [
      { bones: ['crest', 'crestTip'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['crestL'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['crestR'], damping: 0.2, elasticity: 0.12, maxDrift: 0.35 },
      { bones: ['tail', 'tail2'], damping: 0.18, elasticity: 0.1, maxDrift: 0.4 },
      { bones: ['featherAL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherBL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherCL'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherAR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherBR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
      { bones: ['featherCR'], damping: 0.25, elasticity: 0.16, maxDrift: 0.3 },
    ],
    // Overlapping action: the crest's plumes and the second tail feather
    // trail a little more than the head.
    overlap: { ...DEFAULT_OVERLAP, crest: 0.08, crestTip: 0.1, crestL: 0.08, crestR: 0.08, tail2: 0.08 },
    moveClips: {},
    // Clips by move motif (src/battle3d/motifs.ts). kick, kick_sand, punch,
    // tackle, peck, toss, burrow, fling, afterimage, shield, heal, weather,
    // charm, burst, throw and slam have clips of their own name; these
    // motifs are performed by the category clips, as Blaziken's are. Where
    // two motifs share a clip, its own action is listed first
    // (tools/gauntlet/fundamentals.mjs reads a clip's role from the first).
    motifClips: {
      // Slash is a claw strike; the big kick is the spinning kick.
      strike: 'physical_weak',
      kick_strong: 'physical_strong',
      // The spat ember serves spat and thrown orbs; the beak stream serves beams.
      spit: 'special_weak',
      orb: 'special_weak',
      breath: 'special_strong',
      beam: 'special_strong',
      buff: 'status_self',
      roar: 'status_target',
      // Toxic spat from the beak; a stare and a snore are its cry at the foe.
      powder: 'special_weak',
      glare: 'status_target',
      sound: 'status_target',
      // Moves that Mimic or Mirror Move call from outside its movepool: a
      // bite is its beak jab, a spin its spinning kick, a wing strike a
      // sweep of its feathered arm.
      bite: 'peck',
      spin: 'physical_strong',
      wing: 'physical_weak',
    },
    hiddenParts: [],
    showcaseMoves: ['DOUBLE_KICK', 'EMBER', 'BULK_UP', 'SKY_UPPERCUT'],
    palette: palettes.normal,
    shinyPalette: palettes.shiny,
    calibration: cal,
    placeInSlot: (root, slot) => applyCalibration(root, cal, slot),
  };
}
