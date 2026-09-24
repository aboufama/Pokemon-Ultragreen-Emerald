#!/usr/bin/env node
// Which body part a species performs each of its moves with — mouth, hands,
// feet, tail, or one of its own parts such as Sceptile's arm leaves —
// classified by Jev, TypeSafe AI's "system one" model: typed questions in,
// calibrated probabilities out, one fast pass with no generated text. One
// call per move costs far less than reasoning through every move by hand.
//
//   node tools/gauntlet/classify_moves.mjs --slug sceptile [--moves LEAF_BLADE,BULLET_SEED] [--min 0.6] [--dry] [--out file]
//
// Needs TYPESAFE_API_KEY and network access to api.typesafe.ai
// (TYPESAFE_BASE_URL and TYPESAFE_MODEL override the endpoint and the model,
// default jev-latest). --dry prints the first request without calling Jev.
//
// The parts offered are the built-in ones below (tail only when the rig has
// one) plus the profile's emitters, described by their `about`, so write the
// brief and the emitters first: Jev reads them. The result goes to
// src/pokemon/<slug>/moves.json, which the battle uses for where each move's
// effects leave the body and for `<motif>@<part>` clips. Moves under --min
// confidence are listed for you to decide: set their "part" and "by": "hand"
// (reruns keep hand-set parts). Moves the motif table in
// src/battle3d/motifs.ts doesn't name also get Jev's motif pick, printed for
// you to add to the table if it is right.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { speciesBrief } from './brief.mjs';
import { ROOT, loadProfile } from './species.mjs';
import { importTs } from './tsimport.mjs';

// Node's fetch uses the proxy variables only with NODE_USE_ENV_PROXY=1.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, ['--disable-warning=UNDICI-EHPA', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
}
if (!args.slug) {
  console.error('usage: classify_moves.mjs --slug <slug> [--moves A,B] [--min 0.6] [--dry]');
  process.exit(2);
}
const slug = String(args.slug);
const MIN = Number(args.min ?? 0.6);
const BASE = (process.env.TYPESAFE_BASE_URL || 'https://api.typesafe.ai').replace(/\/+$/, '');
const MODEL = process.env.TYPESAFE_MODEL || 'jev-latest';
const KEY = process.env.TYPESAFE_API_KEY;
const outPath = args.out ? resolve(String(args.out)) : join(ROOT, 'src/pokemon', slug, 'moves.json');

const BUILTIN_PARTS = {
  mouth: 'Its mouth or jaws: bites, breathes, spits, roars or fires from the mouth',
  head: 'Its head, horn or crest: headbutts and rams',
  eyes: 'Its eyes: stares, glares, hypnotizes',
  hands: 'Its arms, hands or claws: punches, chops, slashes, grabs, throws',
  feet: 'Its legs or feet: kicks, stomps, scoops the ground',
  tail: 'Its tail: swings, slaps, whips',
  body: 'The whole body at once: tackles, spins, glows, shields, dances, calls the weather',
};

const title = (s) => s.toLowerCase().replace(/(^|[\s-])(\w)/g, (m, a, b) => a + b.toUpperCase());

const brief = await speciesBrief(slug);
const profile = await loadProfile(slug);
const { MOTIFS } = await importTs('src/battle3d/motifs.ts');

const parts = { ...BUILTIN_PARTS };
if (!profile.rig.bones.tail) delete parts.tail;
for (const [name, spec] of Object.entries(profile.emitters ?? {})) {
  parts[name] = spec.about ? `Its ${spec.about}` : parts[name] ?? `Its ${name.replace(/_/g, ' ')}`;
}

const pokemon = {
  name: title(brief.name),
  types: brief.types.map(title),
  species: `the ${title(brief.pokedex.category)} Pokémon`,
  pokedex: brief.pokedex.text,
  ...(profile.brief ? { build: `${profile.brief.bodyPlan}. ${profile.brief.character}`, power: profile.brief.powerSource } : {}),
};

const only = args.moves ? new Set(String(args.moves).split(',').map((m) => `MOVE_${m.trim().toUpperCase().replace(/^MOVE_/, '')}`)) : null;
const moves = brief.moves.filter((m) => !only || only.has(m.const));
const previous = existsSync(outPath) ? JSON.parse(await readFile(outPath, 'utf8')) : { moves: {} };

const partQuestion = {
  type: 'choice',
  instructions: `Which part of its body does ${pokemon.name} perform this move with: what strikes the foe, or where the attack leaves its body? Answer "body" only when the whole body does it at once.`,
  criteria: parts,
};
/** Motif question for moves the name table doesn't cover, limited to motifs of the move's kind. */
function motifQuestion(move) {
  const kind = move.power === 0 ? 'status' : move.contact ? 'contact' : 'ranged';
  const criteria = Object.fromEntries(Object.entries(MOTIFS).filter(([k, v]) => k !== 'other' && v.kind === kind).map(([k, v]) => [k, v.body]));
  return { type: 'choice', instructions: 'Which body action performs this move?', criteria };
}

function request(move) {
  const state = {
    pokemon,
    move: {
      name: title(move.name),
      type: title(move.type),
      power: move.power,
      makes_contact: move.contact,
      target: move.target,
      description: move.description,
      ...(move.motifByName ? { action: MOTIFS[move.motif].body } : {}),
    },
  };
  const questions = { part: partQuestion };
  if (!move.motifByName) questions.motif = motifQuestion(move);
  return { model: MODEL, state, questions };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** POST /v1/systemone with retries on rate limits and server errors. */
async function systemOne(body) {
  const url = `${BASE}/v1/systemone`;
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });
    } catch (e) {
      if (attempt < 2) { await sleep(500 * 2 ** attempt); continue; }
      throw new Error(`cannot reach ${url} (${e.cause?.message ?? e.message}); is the host allowed by the network policy?`);
    }
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(1000 * Number(res.headers.get('retry-after') || 0) || 500 * 2 ** attempt);
      continue;
    }
    throw new Error(`Jev answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

if (args.dry) {
  console.log(`${moves.length} requests to ${BASE}/v1/systemone (model ${MODEL}). The first:\n`);
  console.log(JSON.stringify(request(moves[0]), null, 2));
  process.exit(0);
}
if (!KEY) {
  console.error('TYPESAFE_API_KEY is not set: add your TypeSafe API key to the environment (see the pokemon-gauntlet skill), or decide the parts by hand.');
  process.exit(2);
}

const t0 = Date.now();
const usage = { input: 0, output: 0 };
const results = {};
const motifPicks = [];
const queue = moves.filter((m) => previous.moves?.[m.const]?.by !== 'hand');
async function worker() {
  for (let move = queue.shift(); move; move = queue.shift()) {
    const res = await systemOne(request(move));
    usage.input += res.usage?.input_tokens ?? 0;
    usage.output += res.usage?.output_tokens ?? 0;
    const a = res.answers.part;
    const ranked = Object.entries(a.probabilities ?? {}).sort((x, y) => y[1] - x[1]);
    const confidence = a.probabilities?.[a.choice] ?? a.confidence;
    const entry = { part: a.choice, confidence: +confidence.toFixed(3), by: 'jev' };
    const second = ranked.find(([p]) => p !== a.choice);
    if (second && second[1] > 0.2) entry.alt = [second[0], +second[1].toFixed(3)];
    results[move.const] = entry;
    const m = res.answers.motif;
    if (m) motifPicks.push({ move, motif: m.choice, p: m.probabilities?.[m.choice] ?? m.confidence });
  }
}
try {
  await Promise.all(Array.from({ length: 4 }, worker));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const merged = { ...previous.moves, ...results };
const ordered = Object.fromEntries(brief.moves.filter((m) => merged[m.const]).map((m) => [m.const, merged[m.const]]));
const file = { classifier: `${MODEL} (TypeSafe AI) via tools/gauntlet/classify_moves.mjs`, parts, moves: ordered };
await writeFile(outPath, JSON.stringify(file, null, 2) + '\n');

const name = (c) => brief.moves.find((m) => m.const === c)?.name ?? c;
console.log(`${pokemon.name}: ${Object.keys(results).length} moves classified by ${MODEL} in ${((Date.now() - t0) / 1000).toFixed(1)} s (${usage.input} input, ${usage.output} output tokens)\n`);
const byPart = {};
for (const [c, e] of Object.entries(ordered)) (byPart[e.part] ??= []).push(name(c));
for (const [p, list] of Object.entries(byPart).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${p.padEnd(12)} ${String(list.length).padStart(3)}  ${list.join(', ')}`);
const groups = {};
for (const m of brief.moves) if (ordered[m.const]) (groups[`${m.motif}@${ordered[m.const].part}`] ??= []).push(m.name);
console.log('\nMotif @ part (a group whose motion differs from the motif clip deserves a <motif>@<part> clip):');
for (const [g, list] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${g.padEnd(22)} ${list.join(', ')}`);
const unsure = Object.entries(ordered).filter(([, e]) => e.by !== 'hand' && e.confidence < MIN);
if (unsure.length) {
  console.log(`\nDecide these yourself (confidence under ${MIN}; set "part" and "by": "hand" in moves.json):`);
  for (const [c, e] of unsure) console.log(`  ${name(c).padEnd(16)} ${e.part} ${e.confidence}${e.alt ? ` / ${e.alt[0]} ${e.alt[1]}` : ''}`);
}
if (motifPicks.length) {
  console.log('\nJev\'s motif for moves the motif table does not name (add to src/battle3d/motifs.ts if right):');
  for (const { move, motif, p } of motifPicks) console.log(`  ${move.name.padEnd(16)} ${motif} (${p.toFixed(2)}; now ${move.motif})`);
}
console.log(`\nwrote ${relative(ROOT, outPath)}`);
