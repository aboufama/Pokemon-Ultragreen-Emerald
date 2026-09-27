// Zigzagoon's battle animation set: a clip of its own for every move it can
// know and for every battle situation. The kit (./kit.ts) holds the key
// helpers, the deltas and its zigzag travel; the clips are grouped by action
// family.
import type { Clip } from '../../../anim/clip';
import { SITUATION_CLIPS } from './situations';
import { CONTACT_CLIPS } from './contact';
import { RANGED_CLIPS } from './ranged';
import { STATUS_CLIPS } from './status';

export { EXPRESSIONS } from './kit';

export const CLIPS: Record<string, Clip> = Object.fromEntries(
  [...SITUATION_CLIPS, ...CONTACT_CLIPS, ...RANGED_CLIPS, ...STATUS_CLIPS].map((c) => [c.name, c]),
);
