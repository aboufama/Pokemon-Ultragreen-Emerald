// Species with 3D profiles. Species without one fall back to stock sprites.
import { asset } from '../gba/assets';
import type { SpeciesProfile } from './profile';

type ProfileFactory = (palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }) => Promise<SpeciesProfile>;

const FACTORIES: Record<string, () => Promise<ProfileFactory>> = {
  blaziken: async () => (await import('./blaziken')).createProfile,
};

const cache = new Map<string, Promise<SpeciesProfile>>();

export function hasProfile(slug: string): boolean {
  return slug in FACTORIES;
}

export function getSpeciesProfile(slug: string): Promise<SpeciesProfile> {
  let p = cache.get(slug);
  if (!p) {
    p = (async () => {
      const factory = FACTORIES[slug];
      if (!factory) throw new Error(`no 3D profile for ${slug}`);
      const palettes = await (await fetch(asset(`gba/pokemon/${slug}/palette.json`))).json();
      return (await factory())(palettes);
    })();
    cache.set(slug, p);
  }
  return p;
}
