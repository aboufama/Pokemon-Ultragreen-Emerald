// Paint an arena for a camera and the battlers' places: the one path both the
// battle (src/render3d/environment.ts) and the arena checks (tools/arena) use.

import type * as THREE from 'three';
import { Rng } from './art';
import { ARENAS } from './arenas';
import { type ArenaContext, type ArenaDesign, newPaint } from './design';
import { ArenaView } from './view';

export { ARENAS };

/** Each arena always looks the same: its randomness is seeded by its name. */
export function arenaSeed(name: string): number {
  let h = 2166136261;
  for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 1000000 || 1;
}

export interface PaintedArena {
  name: string;
  design: ArenaDesign;
  ctx: ArenaContext;
}

/**
 * Paint an arena (unknown names get Route 101's). `props: false` leaves out
 * everything standing (for tools that measure the Pokémon alone).
 */
export function paintArena(name: string, camera: THREE.PerspectiveCamera, player: { x: number; z: number }, enemy: { x: number; z: number }, opts: { props?: boolean } = {}): PaintedArena {
  const design = ARENAS[name] ?? ARENAS.grass;
  const ctx: ArenaContext = {
    view: new ArenaView(camera),
    ground: newPaint(),
    props: [],
    rng: new Rng(arenaSeed(name)),
    player: { x: player.x, z: player.z },
    enemy: { x: enemy.x, z: enemy.z },
  };
  design.paint(ctx);
  if (opts.props === false) ctx.props.length = 0;
  return { name, design, ctx };
}
