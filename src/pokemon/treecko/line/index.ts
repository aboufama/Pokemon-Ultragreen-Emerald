// The Treecko line's choreography: every move and situation clip, written once
// (in Sceptile's time) and built for a species from its kit (./kit.ts).

import type { Clip } from '../../../anim/clip';
import { Line, type Kit } from './kit';
import { STRIKES } from './strikes';
import { PUNCHES } from './punches';
import { BODY } from './body';
import { TACKLES } from './tackles';
import { GRAPPLES } from './grapples';
import { RANGED } from './ranged';
import { STATUS } from './status';
import { MOMENTS, SITUATIONS } from './situations';

export { Line };
export type { Kit };

/** Every clip the line's choreography can build, by clip name. */
export const LINE_CLIPS: Record<string, (L: Line) => Clip> = {
  ...STRIKES,
  ...PUNCHES,
  ...BODY,
  ...TACKLES,
  ...GRAPPLES,
  ...RANGED,
  ...STATUS,
  ...SITUATIONS,
  ...MOMENTS,
};

/** The named clips built for a species (its movepool's moves and the situations). */
export function buildClips(kit: Kit, names: readonly string[]): Record<string, Clip> {
  const L = new Line(kit);
  const out: Record<string, Clip> = {};
  for (const name of names) {
    const make = LINE_CLIPS[name];
    if (!make) throw new Error(`the Treecko line has no clip ${name}`);
    out[name] = make(L);
  }
  return out;
}
