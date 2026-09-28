#!/usr/bin/env node
// Everything the game says about a species, for writing its brief and its
// clips: Pokédex entry, types, stats, abilities, and every move it can know in
// Emerald (its movepool: its level-up moves and its pre-evolutions', TM/HM,
// tutor and egg moves, and Struggle) with the move's motif, the action clip
// it needs (one per action, named after the motif, played by every move that
// takes it) and the clip it plays now; then the situation clips every
// species has.
//
//   node tools/gauntlet/brief.mjs --slug swampert [--json]

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { importTs } from './tsimport.mjs';
import { loadProfile } from './species.mjs';

const { MULTI_HIT_EFFECTS, MANY_HIT_EFFECTS, TWO_TURN_EFFECTS, SITUATIONS, ABILITY_SITUATIONS } = await importTs('src/battle3d/situations.ts');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** The decomp's species data: this checkout's submodule, else the main checkout's (in a git worktree). */
function decompDir() {
  const sub = 'decomp/pokeemerald/src/data/pokemon';
  if (existsSync(join(ROOT, sub))) return join(ROOT, sub);
  try {
    const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: ROOT, encoding: 'utf8' }).trim();
    const main = join(dirname(resolve(ROOT, common)), sub);
    if (existsSync(main)) return main;
  } catch {}
  return join(ROOT, sub);
}
const DECOMP = decompDir();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

const read = (f) => readFile(join(DECOMP, f), 'utf8').catch(() => '');

/** In-game move descriptions (MOVE_* -> text) from the decomp. */
async function moveDescriptions() {
  const src = await readFile(join(DECOMP, '../text/move_descriptions.h'), 'utf8').catch(() => '');
  const texts = {};
  for (const m of src.matchAll(/static const u8 (\w+)\[\] = _\(([\s\S]*?)\);/g)) {
    texts[m[1]] = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((q) => q[1].replace(/\\n/g, ' ')).join('').replace(/\s+/g, ' ').trim();
  }
  const out = {};
  for (const m of src.matchAll(/\[(MOVE_\w+) - 1\] = (\w+),/g)) if (texts[m[2]]) out[m[1]] = texts[m[2]];
  return out;
}

// Gen 3 decides physical or special by the move's type.
const PHYSICAL_TYPES = new Set(['NORMAL', 'FIGHTING', 'FLYING', 'GROUND', 'ROCK', 'BUG', 'GHOST', 'POISON', 'STEEL']);

/** The species it evolves from, nearest first (Beautifly: Silcoon, Wurmple). */
export function preEvolutions(allSpecies, slug) {
  const from = {};
  for (const [s, d] of Object.entries(allSpecies)) for (const e of d.evolutions ?? []) (from[e.into] ??= []).push(s);
  const out = [];
  for (let cur = from[slug]?.[0]; cur; cur = from[cur]?.[0]) out.push(cur);
  return out;
}

/** A family's egg moves (egg_moves.h lists them under its first form). */
function eggMoves(src, speciesConst) {
  const m = src.match(new RegExp(`egg_moves\\(${speciesConst.replace('SPECIES_', '')},([\\s\\S]*?)\\)`));
  return m ? [...m[1].matchAll(/MOVE_(\w+)/g)].map((x) => `MOVE_${x[1]}`) : [];
}

/**
 * What a move needs (the gauntlet's standard, check.mjs section 7): a clip
 * for its action, named after its motif (or a category clip the profile maps
 * to that motif in motifClips), played by every move that takes it. The
 * battles cut a multi-hit or two-turn move's pieces from that clip
 * (src/battle3d/variants.ts), so it needs no clips of its own: Double Kick's
 * two blows are two impacts in one clip, a two-turn move's turns a dig, or a
 * charge and a release.
 */
export function neededClips(move, motif) {
  const notes = [];
  if (move.effect === 'EFFECT_DOUBLE_HIT') notes.push('two impacts');
  else if (MULTI_HIT_EFFECTS.has(move.effect)) notes.push('a blow the battles repeat');
  if (TWO_TURN_EFFECTS.has(move.effect)) notes.push(motif === 'burrow' ? 'a dig' : 'a charge and a release');
  return [`a ${motif} clip${notes.length ? ` (${notes.join(', ')})` : ''}`];
}

/** Moves listed for a species in a C table ([SPECIES_X] = ... up to the next entry). */
function tableMoves(src, speciesConst, pattern) {
  const start = src.indexOf(`[${speciesConst}]`);
  if (start < 0) return [];
  const next = src.indexOf('[SPECIES_', start + speciesConst.length + 2);
  const body = src.slice(start, next < 0 ? undefined : next);
  return [...body.matchAll(pattern)].map((m) => `MOVE_${m[1]}`);
}

export async function speciesBrief(slug) {
  const species = JSON.parse(await readFile(join(ROOT, 'src/data/generated/species.json'), 'utf8'))[slug];
  if (!species) throw new Error(`unknown species ${slug}`);
  const moves = JSON.parse(await readFile(join(ROOT, 'src/data/generated/moves.json'), 'utf8'));
  const { motifOf, namedMotif, MOTIFS } = await importTs('src/battle3d/motifs.ts');
  const descriptions = await moveDescriptions();
  const { categorize, clipFor } = await importTs('src/battle3d/director.ts');
  // The clip each move plays: the species' own (clipFor) once it has a profile.
  const profile = existsSync(join(ROOT, 'src/pokemon', slug, 'index.ts')) ? await loadProfile(slug) : null;
  const clipOf = (move) => (profile ? clipFor({ profile }, move) : categorize(move));

  const camel = species.name.charAt(0) + species.name.slice(1).toLowerCase();
  const text = await read('pokedex_text.h');
  const dexText = (text.match(new RegExp(`g${camel}PokedexText\\[\\] = _\\(([\\s\\S]*?)\\);`))?.[1] ?? '')
    .split('\n').map((l) => l.trim().replace(/^"|"$/g, '').replace(/\\n$/, '')).join(' ').replace(/\s+/g, ' ').trim();
  const entries = await read('pokedex_entries.h');
  const entry = entries.match(new RegExp(`\\[NATIONAL_DEX_${species.const.replace('SPECIES_', '')}\\] =\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? '';
  const category = entry.match(/categoryName = _\("([^"]*)"\)/)?.[1] ?? '';
  const heightDm = Number(entry.match(/\.height = (\d+)/)?.[1] ?? 0);
  const weightHg = Number(entry.match(/\.weight = (\d+)/)?.[1] ?? 0);

  // Its family before it: a Pokémon keeps the moves it learned before evolving.
  const allSpecies = JSON.parse(await readFile(join(ROOT, 'src/data/generated/species.json'), 'utf8'));
  const pre = preEvolutions(allSpecies, slug);
  const tmSrc = await read('tmhm_learnsets.h');
  const tutorSrc = await read('tutor_learnsets.h');
  const levelUp = [slug, ...pre].flatMap((s) => allSpecies[s].learnset.map((l) => ({ ...l, source: s === slug ? `L${l.level}` : `L${l.level}:${s}` })));
  const tm = [slug, ...pre].flatMap((s) => tableMoves(tmSrc, allSpecies[s].const, /\.(\w+) = TRUE/g)).map((move) => ({ move, source: 'TM/HM' }));
  const tutor = [slug, ...pre].flatMap((s) => tableMoves(tutorSrc, allSpecies[s].const, /TUTOR\(MOVE_(\w+)\)/g)).map((move) => ({ move, source: 'tutor' }));
  // Egg moves are the family's first form's (a Grovyle hatched as a Treecko keeps them).
  const base = allSpecies[[slug, ...pre].at(-1)];
  const egg = eggMoves(await read('egg_moves.h'), base.const).map((move) => ({ move, source: 'egg' }));
  // Any Pokémon out of PP struggles.
  const always = [{ move: 'MOVE_STRUGGLE', source: 'always' }];
  const seen = new Map();
  for (const m of [...levelUp, ...tm, ...tutor, ...egg, ...always]) {
    const data = moves[m.move];
    if (!data) continue;
    const type = data.type.replace('TYPE_', '');
    const e = seen.get(m.move) ?? {
      const: m.move, name: data.name, type, power: data.power,
      split: data.power === 0 ? 'status' : PHYSICAL_TYPES.has(type) ? 'physical' : 'special',
      contact: data.flags.includes('FLAG_MAKES_CONTACT'), target: data.target.replace('MOVE_TARGET_', '').toLowerCase(),
      description: descriptions[m.move] ?? '',
      motif: motifOf(data), motifByName: !!namedMotif(data), clip: clipOf(data), sources: [],
      effect: data.effect, needs: neededClips(data, motifOf(data)),
    };
    if (!e.sources.includes(m.source)) e.sources.push(m.source);
    seen.set(m.move, e);
  }
  const all = [...seen.values()];
  const motifs = {};
  for (const m of all) (motifs[m.motif] ??= []).push(m.name);
  // Wild Pokémon in Gen 3 know the last four level-up moves learned by their level.
  const at50 = [...new Set(species.learnset.filter((l) => l.level <= 50).map((l) => l.move))].slice(-4);
  return {
    slug,
    name: species.name,
    nationalDex: species.nationalDex,
    types: species.types.map((t) => t.replace('TYPE_', '')),
    baseStats: species.baseStats,
    bodyColor: species.bodyColor.replace('BODY_COLOR_', ''),
    elevation: species.elevation,
    stockAnims: { front: species.frontAnim, back: species.backAnim },
    pokedex: { category, heightM: heightDm / 10, weightKg: weightHg / 10, text: dexText },
    abilities: species.abilities,
    movesAtLevel50: at50,
    moves: all,
    situations: [...Object.keys(SITUATIONS), ...species.abilities.filter((a) => ABILITY_SITUATIONS[a]).map((a) => ABILITY_SITUATIONS[a].clip)],
    motifs: Object.fromEntries(Object.entries(motifs).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => [k, { kind: MOTIFS[k].kind, body: MOTIFS[k].body, events: MOTIFS[k].requires ?? MOTIFS[k].events, moves: v }])),
  };
}

const args = parseArgs(process.argv.slice(2));
if (args.slug && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const b = await speciesBrief(String(args.slug));
  if (args.json) {
    console.log(JSON.stringify(b, null, 2));
  } else {
    console.log(`${b.name} #${b.nationalDex} — ${b.types.join('/')} — the ${b.pokedex.category} Pokémon, ${b.pokedex.heightM} m, ${b.pokedex.weightKg} kg, ${b.bodyColor}`);
    console.log(`Pokédex: ${b.pokedex.text}`);
    console.log(`Stats: ${Object.entries(b.baseStats).map(([k, v]) => `${k} ${v}`).join(', ')}; elevation ${b.elevation}; stock anims ${b.stockAnims.front} / ${b.stockAnims.back}`);
    console.log(`Level 50 moveset (Gen 3 wild rule): ${b.movesAtLevel50.join(', ')}`);
    console.log('\nMotifs across its moves (most common first) — clip each motif that matters:');
    for (const [motif, m] of Object.entries(b.motifs)) console.log(`  ${motif.padEnd(10)} ${m.kind.padEnd(8)} ${m.moves.join(', ')}${m.events.length ? `  [events: ${m.events.join(', ')}]` : ''}`);
    console.log(`\nMovepool (${b.moves.length} moves): each needs a clip for its action (one per motif, not per move); it plays <now> today`);
    for (const m of b.moves) console.log(`  ${m.const.padEnd(22)} ${m.type.padEnd(9)} ${String(m.power).padStart(3)} ${m.contact ? 'contact' : '       '}  ${m.motif.padEnd(10)} needs ${m.needs.join(', ').padEnd(40)} now ${m.clip.padEnd(16)} ${m.sources.join(',')}`);
    console.log(`\nSituations (${b.situations.length}): ${b.situations.join(', ')}`);
  }
}
