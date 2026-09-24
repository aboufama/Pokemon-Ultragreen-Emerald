#!/usr/bin/env node
// A review page for one or more species: every clip as looping GIFs from both
// sides (from tools/shots/clip_gifs.mjs), with the species brief, each clip's
// review note (src/pokemon/<slug>/REVIEW.md) and a timeline of its events.
//
//   node tools/shots/clip_gifs.mjs --species <slug> --out build/clips/<slug>     # for each species
//   node tools/gauntlet/review_page.mjs --species blaziken,swampert --clips build/clips --out build/review/index.html
//
// The page references GIFs at clips/<slug>/<file>; --files <map.json> writes
// the published-path -> source-path map for hosting the page with its GIFs.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { ROOT, gameData, loadProfile } from './species.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const clipsDir = resolve(String(args.clips ?? join(ROOT, 'build/clips')));
const out = resolve(String(args.out ?? join(ROOT, 'build/review/index.html')));
const registry = await readFile(join(ROOT, 'src/pokemon/registry.ts'), 'utf8');
const all = [...registry.matchAll(/^\s+(\w+): async \(\) =>/gm)].map((m) => m[1]);
const slugs = args.species ? String(args.species).split(',') : all;
const LEAD = 0.35;
const FPS = 30;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const title = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const KINDS = {
  idle: 'Idle loop', intro: 'Sent out', hit: 'Taking a hit', faint: 'Fainting',
  physical_weak: 'Weak contact move', physical_strong: 'Strong contact move',
  special_weak: 'Weak ranged move', special_strong: 'Strong ranged move',
  status_self: 'Status move on itself', status_target: 'Status move on the foe',
};
const MOMENTS = ['intro', 'idle', 'hit', 'faint'];

const data = await gameData();

function reviewNotes(md) {
  const notes = {};
  for (const m of md.matchAll(/^- \[[x ]\] `([\w]+)`[^:]*:\s*(.*)$/gm)) notes[m[1]] = m[2].trim();
  return notes;
}

function timeline(e) {
  const total = e.frames / FPS;
  const dur = e.name === 'idle' ? 0 : e.duration;
  const pct = (t) => `${((100 * t) / total).toFixed(2)}%`;
  let html = '<div class="tl-track">';
  if (dur) html += `<div class="tl-clip" style="left:${pct(LEAD)};width:${pct(dur)}"></div>`;
  let last = -9, up = false;
  const labels = [];
  for (const ev of e.events ?? []) {
    up = ev.t - last < 0.45 && !up;
    last = ev.t;
    labels.push(`${ev.name} at ${ev.t.toFixed(2)} s`);
    html += `<div class="tl-event${up ? ' up' : ''}" style="left:${pct(LEAD + ev.t)}"><span>${esc(ev.name)} ${ev.t.toFixed(2)}s</span></div>`;
  }
  html += '</div><div class="tl-axis">';
  for (let t = 0; t <= total + 1e-6; t += 0.5) html += `<span class="tl-tick" style="left:${pct(t)}">${t.toFixed(1)}</span>`;
  html += '</div>';
  const label = dur ? `Timeline: clip ${dur.toFixed(2)} s${labels.length ? ', ' + labels.join(', ') : ''}` : 'Timeline: idle loop';
  return `<div class="tl" role="img" aria-label="${esc(label)}">${html}</div>`;
}

const files = {};
const sections = [];
const nav = [];
for (const slug of slugs) {
  const manifestPath = join(clipsDir, slug, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.warn(`skip ${slug}: no ${relative(ROOT, manifestPath)} (run clip_gifs.mjs --species ${slug} --out ${relative(ROOT, join(clipsDir, slug))})`);
    continue;
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const profile = await loadProfile(slug);
  const sp = data.species[slug];
  const reviewPath = join(ROOT, 'src/pokemon', slug, 'REVIEW.md');
  const notes = existsSync(reviewPath) ? reviewNotes(await readFile(reviewPath, 'utf8')) : {};
  const bySide = {};
  for (const e of manifest) (bySide[e.name] ??= {})[e.side] = e;
  const order = [...Object.keys(bySide).filter((n) => !MOMENTS.includes(n)), ...MOMENTS.filter((n) => bySide[n])];
  const motifOfClip = {};
  for (const [k, v] of Object.entries(profile.motifClips ?? {})) if (v) motifOfClip[v] = k;
  const cards = order.map((name) => {
    const sides = bySide[name];
    const first = sides.player ?? sides.enemy;
    const move = first.move ? first.move.replace(/_/g, ' ') : null;
    const motif = motifOfClip[name] ?? (data.MOTIFS[name.replace(/_strong$/, '')] ? name : null);
    const kind = KINDS[name] ?? (motif ? `Motif clip: ${motif.replace('_', ' ')}` : 'Clip');
    const figs = ['player', 'enemy'].filter((s) => sides[s]).map((side) => {
      const e = sides[side];
      const pub = `clips/${slug}/${e.file}`;
      files[pub] = relative(ROOT, join(clipsDir, slug, e.file));
      const alt = `${side === 'player' ? 'Our side' : 'Opponent'}: ${title(sp.name)} ${move ? `uses ${move}` : `plays ${name}`}`;
      return `<figure><button class="gif" type="button" title="Restart"><img src="${pub}" alt="${esc(alt)}" width="480" height="320" loading="lazy"></button><figcaption>${side === 'player' ? 'Our side' : 'Opponent'}</figcaption></figure>`;
    }).join('');
    const note = notes[name] ?? '';
    return `<article class="card" id="${slug}-${name}">
  <header class="card-head">
    <div class="card-title"><h4><code>${esc(name)}</code></h4><p class="kind">${esc(kind)}</p></div>
    <p class="meta"><span>${esc(move ?? 'clip only')}</span>${name === 'idle' ? '' : `<span>${first.duration.toFixed(2)} s</span>`}</p>
  </header>
  ${note ? `<p class="desc">${esc(note)}</p>` : ''}
  <div class="pair">${figs}</div>
  ${timeline(first)}
</article>`;
  });
  const brief = profile.brief ?? {};
  const types = sp.types.map((t) => title(t.replace('TYPE_', ''))).join(' / ');
  const showcase = (profile.showcaseMoves ?? []).map((m) => m.replace(/_/g, ' ')).join(' · ');
  nav.push(`<a href="#${slug}">${esc(title(sp.name))}</a>`);
  sections.push(`<section class="species" id="${slug}" aria-labelledby="${slug}-h">
  <header class="species-head">
    <h2 id="${slug}-h">${esc(title(sp.name))} <span class="dex">#${sp.nationalDex} · ${esc(types)}</span></h2>
    ${brief.character ? `<p><strong>Character.</strong> ${esc(brief.character)}</p>` : ''}
    ${brief.powerSource ? `<p><strong>Power.</strong> ${esc(brief.powerSource)}</p>` : ''}
    ${showcase ? `<p><strong>Showcase moves.</strong> ${esc(showcase)}</p>` : ''}
  </header>
  <div class="cards">${cards.join('\n')}</div>
</section>`);
}

const CSS = await readFile(new URL('./review_page.css', import.meta.url), 'utf8');
const pageTitle = args.title ?? (slugs.length === 1 ? `${title(data.species[slugs[0]].name)} Clip Review` : 'Starter Clip Review');
const html = `<title>${esc(pageTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Pixelify+Sans:wght@500;600&display=swap">
<style>
${CSS}
</style>
<div class="wrap">
  <header class="intro">
    <p class="eyebrow">Ultragreen Emerald · battle animation review</p>
    <h1>${esc(pageTitle)}</h1>
    ${args.intro ? `<p>${esc(String(args.intro))}</p>` : ''}
    <p>Every clip of each species, played in the battle view with the in-game UI, from <strong>our side</strong> (back view) and from the <strong>opponent's side</strong>. Attack clips play a move that uses them, so you also see the move's effects and the target's reaction. Each loop starts with 0.35 s of idle, plays the clip, then shows about 0.6 s of the return to idle. Click a clip to restart it.</p>
    <div class="legend"><span><i style="background:var(--accent);opacity:.55"></i>clip</span><span><i style="background:var(--mark)"></i>event (impact, release, cry...)</span><span><i style="background:var(--line)"></i>idle lead-in and return</span></div>
    <p>To ask for a change, name the species, clip and side, for example: "Blastoise jet, opponent side: more recoil".</p>
  </header>
  ${nav.length > 1 ? `<nav class="species-nav" aria-label="Species">${nav.join('')}</nav>` : ''}
  ${sections.join('\n')}
</div>
<script>
document.querySelectorAll('.gif').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    const base = img.getAttribute('src').split('?')[0];
    img.setAttribute('src', base + '?r=' + Date.now());
  });
});
</script>
`;
await mkdir(dirname(out), { recursive: true });
await writeFile(out, html);
if (args.files) await writeFile(resolve(String(args.files)), JSON.stringify(files, null, 2) + '\n');
console.log(`${relative(ROOT, out)}: ${sections.length} species, ${Object.keys(files).length} GIFs, ${(html.length / 1024).toFixed(0)} KB`);
