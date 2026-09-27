// Grovyle's battle animation set: every move in its movepool and every
// situation, the four moments included, from the Treecko line's shared
// choreography on Grovyle's kit (./family.ts, ./kit.ts,
// src/pokemon/treecko/line).
import type { Clip } from '../../anim/clip';
import { LINE_CLIPS } from './family';

export const CLIPS: Record<string, Clip> = { ...LINE_CLIPS };
