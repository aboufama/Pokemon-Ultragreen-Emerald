// Species with 3D profiles (tools/gauntlet/new_species.mjs adds entries).
import { asset } from '../gba/assets';
import { type MovePartsFile, type SpeciesProfile, movePartsOf } from './profile';
import { makeGenericClips } from './generic/clips';

/** The clips every battle plays for every species (the rest are chosen per move). */
export const MOMENT_CLIPS = ['idle', 'intro', 'entrance', 'hit', 'faint'] as const;

type ProfileFactory = (palettes: { normal: SpeciesProfile['palette']; shiny: SpeciesProfile['palette'] }) => Promise<SpeciesProfile>;

const FACTORIES: Record<string, () => Promise<ProfileFactory>> = {
  sceptile: async () => (await import('./sceptile')).createProfile,
  blaziken: async () => (await import('./blaziken')).createProfile,
  swampert: async () => (await import('./swampert')).createProfile,
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
      // A moment a species has no clip for yet (mid-gauntlet) plays the generic one.
      const generic = makeGenericClips(profile.poses.stance ?? {});
      for (const name of MOMENT_CLIPS) if (!profile.clips[name]) profile.clips[name] = { ...generic[name], generic: true };
      return profile;
    })();
    cache.set(slug, p);
  }
  return p;
}
