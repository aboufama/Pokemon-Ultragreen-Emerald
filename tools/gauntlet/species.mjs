// Node-side access to a species profile for the gauntlet tools: load it
// (bundled from TypeScript), resolve which clip each move plays, and pick
// representative moves for reviewing every clip.

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTs } from './tsimport.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function loadProfile(slug) {
  const mod = await importTs(`src/pokemon/${slug}/index.ts`);
  const palette = JSON.parse(await readFile(join(ROOT, 'public/assets/gba/pokemon', slug, 'palette.json'), 'utf8'));
  const profile = await mod.createProfile(palette);
  // Same as the registry: the body part per move from moves.json.
  const partsPath = join(ROOT, 'src/pokemon', slug, 'moves.json');
  if (existsSync(partsPath)) {
    const file = JSON.parse(await readFile(partsPath, 'utf8'));
    profile.moveParts = { ...Object.fromEntries(Object.entries(file.moves).map(([m, c]) => [m, c.part])), ...profile.moveParts };
  }
  return profile;
}

export async function gameData() {
  const moves = JSON.parse(await readFile(join(ROOT, 'src/data/generated/moves.json'), 'utf8'));
  const species = JSON.parse(await readFile(join(ROOT, 'src/data/generated/species.json'), 'utf8'));
  const director = await importTs('src/battle3d/director.ts');
  const motifs = await importTs('src/battle3d/motifs.ts');
  return { moves, species, ...director, ...motifs };
}

/** Clip a move plays for this profile (same rules as the move director). */
export function clipOf(data, profile, moveConst) {
  return data.clipFor({ profile }, data.moves[moveConst]);
}

export const CATEGORY_CLIPS = ['physical_weak', 'physical_strong', 'special_weak', 'special_strong', 'status_self', 'status_target'];
/** The clips every battle plays (as src/pokemon/registry.ts MOMENT_CLIPS). */
export const MOMENT_CLIPS = ['idle', 'intro', 'entrance', 'hit', 'faint'];

/**
 * One review job per clip: moments play the clip itself, attack clips play a
 * move that uses them (a showcase move first, then the species' own moves,
 * then any move in the game).
 */
export function reviewJobs(data, profile, learnable) {
  const jobs = MOMENT_CLIPS.filter((c) => profile.clips[c]).map((c) => ({ name: c, clip: c, seconds: c === 'idle' ? 2.4 : undefined }));
  const byClip = new Map();
  const consider = (moveConst) => {
    if (!data.moves[moveConst]) return;
    const clip = clipOf(data, profile, moveConst);
    if (!byClip.has(clip)) byClip.set(clip, moveConst);
  };
  for (const m of profile.showcaseMoves ?? []) consider(`MOVE_${m}`.replace('MOVE_MOVE_', 'MOVE_'));
  for (const m of learnable) consider(m);
  for (const m of Object.keys(data.moves)) consider(m);
  for (const clip of Object.keys(profile.clips)) {
    if (MOMENT_CLIPS.includes(clip)) continue;
    const move = byClip.get(clip);
    if (move) jobs.push({ name: clip, move: move.replace('MOVE_', '') });
  }
  return jobs;
}
