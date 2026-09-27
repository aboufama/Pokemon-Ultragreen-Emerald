// Every move a species can know has its own clip, named after the move:
// MOVE_DOUBLE_KICK plays 'double_kick', MOVE_SAND_ATTACK 'sand_attack'. A
// move looks like what it is (a Double Kick kicks twice, a Mega Punch
// punches, a Headbutt leads with the head), so each is animated for itself.
// The only moves that share a clip are the ones below, which are the same
// action (the game treats them alike, and so does the body): a species may
// give one of them its own clip, or let the group's shared one play.
// Motif clips (./motifs.ts) remain for moves outside a species' movepool
// (Mimic, Mirror Move, Sleep Talk and Metronome can call any move).

import type { MoveData } from '../data';

/** The clip a move's own animation is named: its constant without MOVE_, in lower case. */
export function moveClipName(move: MoveData | string): string {
  const c = typeof move === 'string' ? move : move.const;
  return c.replace(/^MOVE_/, '').toLowerCase();
}

/**
 * Moves that are the same action: the clip of any of them plays for the
 * others when they have none of their own.
 */
export const SAME_ACTION: string[][] = [
  // A guard that stops the move (Detect: the same guard, a glint).
  ['MOVE_PROTECT', 'MOVE_DETECT'],
  // Energy drawn out of the foe; the stronger ones are the same reach, more of it.
  ['MOVE_ABSORB', 'MOVE_MEGA_DRAIN', 'MOVE_GIGA_DRAIN'],
  // Rolling into the foe, turn after turn.
  ['MOVE_ROLLOUT', 'MOVE_ICE_BALL'],
  // Turned up to the light of the sky, soaking it in.
  ['MOVE_MORNING_SUN', 'MOVE_SYNTHESIS', 'MOVE_MOONLIGHT'],
  // The same effect: flailing wildly at the foe, the weaker it is.
  ['MOVE_FLAIL', 'MOVE_REVERSAL'],
  // A reckless full-body charge that hurts the attacker too.
  ['MOVE_TAKE_DOWN', 'MOVE_DOUBLE_EDGE'],
  // Darting in to snatch the foe's item.
  ['MOVE_THIEF', 'MOVE_COVET'],
  // Peering at or sniffing out the foe so its evasion can't help it.
  ['MOVE_FORESIGHT', 'MOVE_ODOR_SLEUTH'],
];

const GROUP_OF = new Map<string, string[]>();
for (const group of SAME_ACTION) for (const m of group) GROUP_OF.set(m, group);

/** The moves the same action as this one (itself first), or just itself. */
export function sameAction(moveConst: string): string[] {
  const group = GROUP_OF.get(moveConst);
  return group ? [moveConst, ...group.filter((m) => m !== moveConst)] : [moveConst];
}
