// Typed access to the JSON extracted from the decomp (tools/extract).
import speciesJson from './generated/species.json';
import movesJson from './generated/moves.json';
import typesJson from './generated/types.json';
import gfxMetaJson from './generated/gfx_meta.json';
import type { RGB } from '../gba/bitmap';

export interface PicCoords {
  width: number;
  height: number;
  yOffset: number;
}

export interface SpeciesData {
  id: number;
  const: string;
  slug: string;
  name: string;
  nationalDex: number;
  baseStats: { hp: number; attack: number; defense: number; speed: number; spAttack: number; spDefense: number };
  types: string[];
  catchRate: number;
  expYield: number;
  genderRatio: number;
  growthRate: string;
  abilities: string[];
  bodyColor: string | null;
  noFlip: boolean;
  frontCoords: PicCoords | null;
  backCoords: PicCoords | null;
  elevation: number;
  frontAnim: string | null;
  backAnim: string | null;
  learnset: { level: number; move: string }[];
}

export interface MoveData {
  id: number;
  const: string;
  name: string;
  effect: string;
  power: number;
  type: string;
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: string;
  priority: number;
  flags: string[];
}

export const SPECIES = speciesJson as unknown as Record<string, SpeciesData>;
export const MOVES = movesJson as unknown as Record<string, MoveData>;
export const TYPES = typesJson as {
  names: Record<string, string>;
  values: Record<string, number>;
  chart: { attacker: string; defender: string; multiplier: string }[];
  multipliers: Record<string, number>;
};

export interface EnvironmentMeta {
  id: number;
  const: string;
  image: string;
  entryImage: string | null;
  palette: RGB[];
}

export const GFX_META = gfxMetaJson as unknown as {
  environments: Record<string, EnvironmentMeta>;
  textboxPalette: RGB[];
  windowTextPalette: RGB[];
  windowTextPpPalette: RGB[];
  healthboxPalette: RGB[];
  healthbarPalette: RGB[];
};

export function species(slug: string): SpeciesData {
  const s = SPECIES[slug];
  if (!s) throw new Error(`unknown species ${slug}`);
  return s;
}

export function move(constOrName: string): MoveData {
  const key = constOrName.startsWith('MOVE_') ? constOrName : `MOVE_${constOrName.toUpperCase().replace(/[ -]/g, '_')}`;
  const m = MOVES[key];
  if (!m) throw new Error(`unknown move ${constOrName}`);
  return m;
}
