// Species with 3D profiles (tools/gauntlet/new_species.mjs adds entries).
import { asset } from '../gba/assets';
import { type MovePartsFile, type SpeciesProfile, movePartsOf } from './profile';

type ProfileFactory = (palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }) => Promise<SpeciesProfile>;

const FACTORIES: Record<string, () => Promise<ProfileFactory>> = {
  swampert: async () => (await import('./swampert')).createProfile,
  blaziken: async () => (await import('./blaziken')).createProfile,
};

/** The body part each move uses, for species classified with tools/gauntlet/classify_moves.mjs. */
const MOVE_PARTS = import.meta.glob<MovePartsFile>('./*/moves.json', { eager: true, import: 'default' });

const cache = new Map<string, Promise<SpeciesProfile>>();

export function hasProfile(slug: string): boolean {
  return slug in FACTORIES;
}

/** Every species with a 3D profile. */
export function profiledSpecies(): string[] {
  return Object.keys(FACTORIES);
}

export function getSpeciesProfile(slug: string): Promise<SpeciesProfile> {
  let p = cache.get(slug);
  if (!p) {
    p = (async () => {
      const factory = FACTORIES[slug];
      if (!factory) throw new Error(`no 3D profile for ${slug}`);
      const palettes = await (await fetch(asset(`gba/pokemon/${slug}/palette.json`))).json();
      const profile = await (await factory())(palettes);
      const parts = MOVE_PARTS[`./${slug}/moves.json`];
      if (parts) profile.moveParts = { ...movePartsOf(parts), ...profile.moveParts };
      return profile;
    })();
    cache.set(slug, p);
  }
  return p;
}
