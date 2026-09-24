#!/usr/bin/env node
// The gauntlet's quality gates for one species (see
// .claude/skills/pokemon-gauntlet/SKILL.md for the process they guard).
//
//   node tools/gauntlet/check.mjs --slug swampert            static gates
//   node tools/gauntlet/check.mjs --slug swampert --render   + battles and every clip in the browser
//
// Static gates read the profile (bundled from TypeScript) and the model;
// --render needs the dev server (npm run dev) and takes a few minutes.
// Exits non-zero if any gate fails. Warnings don't fail the run but are
// worth fixing.

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { readGlbJson } from './rigmap.mjs';
import { CATEGORY_CLIPS, MOMENT_CLIPS, ROOT, clipOf, gameData, loadProfile, reviewJobs } from './species.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const slug = String(args.slug ?? '');
if (!slug) {
  console.error('usage: check.mjs --slug <species> [--render] [--base http://127.0.0.1:5173/]');
  process.exit(1);
}

const results = [];
const gate = (name, ok, detail = '') => results.push({ level: ok ? 'pass' : 'FAIL', name, detail });
const warn = (name, detail) => results.push({ level: 'warn', name, detail });

// Thresholds (Blaziken, the reference species: IoU 0.60 / 0.61, box 0.80 / 0.98, color loss 0.94).
const MIN_IOU = 0.55;
const MIN_BOX_IOU = 0.75;
const MAX_COLOR_LOSS = 1.0;

const REQUIRED_EVENTS = {
  physical_weak: ['impact'],
  physical_strong: ['impact'],
  special_weak: ['release'],
  special_strong: ['release'],
  status_self: ['aura'],
  status_target: ['emit'],
  intro: ['cry'],
  faint: ['thud'],
};
// Bones every species of a body plan has (shells may lack a spine; some necks are one bone).
const REQUIRED_BONES = {
  biped: ['hips', 'head', 'armL', 'armR', 'forearmL', 'forearmR', 'thighL', 'thighR', 'shinL', 'shinR', 'footL', 'footR'],
  quadruped: ['hips', 'head', 'armL', 'armR', 'forearmL', 'forearmR', 'handL', 'handR', 'thighL', 'thighR', 'shinL', 'shinR', 'footL', 'footR'],
};
const USEFUL_BONES = ['spine', 'chest', 'neck', 'jaw', 'tail'];

const data = await gameData();
const species = data.species[slug];
if (!species) {
  console.error(`unknown species ${slug}`);
  process.exit(1);
}

// 1. Model and provenance.
const modelPath = join(ROOT, 'public/assets/pokemon', slug, 'model.glb');
const sourcePath = join(ROOT, 'public/assets/pokemon', slug, 'SOURCE.json');
gate('model fetched', existsSync(modelPath), modelPath.replace(ROOT + '/', ''));
let source = null;
if (existsSync(sourcePath)) source = JSON.parse(await readFile(sourcePath, 'utf8'));
gate('provenance recorded (SOURCE.json with sha256)', !!source?.files?.some((f) => f.sha256));
if (existsSync(modelPath)) {
  const kb = (await readFile(modelPath)).length / 1024;
  if (kb > 600) warn('model size', `${kb.toFixed(0)} KB: run tools/models/optimize_model.mjs --slug ${slug}`);
}

// 2. Profile.
let profile;
try {
  profile = await loadProfile(slug);
  gate('profile loads', true);
} catch (e) {
  gate('profile loads', false, String(e?.message ?? e).split('\n')[0]);
  report();
}
const joints = new Set();
if (existsSync(modelPath)) {
  const gltf = readGlbJson(await readFile(modelPath));
  for (const n of gltf.nodes ?? []) if (n.name) joints.add(n.name);
}

// 3. Brief.
const brief = profile.brief;
gate('brief written (bodyPlan, character, powerSource)', !!brief && !!brief.bodyPlan && !!brief.character && !!brief.powerSource && !/TODO/.test(JSON.stringify(brief)));

// 4. Rig map.
const bones = profile.rig.bones;
const missingNodes = Object.entries(bones).filter(([, n]) => !joints.has(n)).map(([k, n]) => `${k}->${n}`);
gate('rig map resolves in the model', missingNodes.length === 0, missingNodes.join(', '));
const plan = brief?.bodyPlan ?? 'biped';
const needed = REQUIRED_BONES[plan] ?? ['hips', 'spine', 'head'];
const unmappedNeeded = needed.filter((b) => !bones[b]);
gate(`rig maps the ${plan} bones`, unmappedNeeded.length === 0, unmappedNeeded.join(', '));
if (plan === 'quadruped') gate('quadruped front legs planted (rig.frontLegs)', !!profile.rig.frontLegs);
const missingUseful = USEFUL_BONES.filter((b) => !bones[b]);
if (missingUseful.length) warn('bones not mapped', `${missingUseful.join(', ')}: map them if the model has them (no jaw: breath/bite effects fall back to the head)`);

// 5. Stance.
const stance = profile.poses?.stance ?? {};
const shaped = Object.keys(stance.bones ?? {}).length + Object.keys(stance.aim ?? {}).length;
gate('stance shaped to the stock sprite (not the bind pose)', shaped >= 3, `${shaped} bones/aims set`);

// 6. Calibration.
const cal = profile.calibration;
for (const side of ['enemy', 'player']) {
  const fit = cal.fit?.[side];
  gate(`${side} silhouette fit (IoU >= ${MIN_IOU}, box >= ${MIN_BOX_IOU})`, !!fit && fit.iou >= MIN_IOU && (fit.boxIou ?? 0) >= MIN_BOX_IOU, fit ? `IoU ${fit.iou}, box ${fit.boxIou}` : 'not fitted: node tools/calibrate/run.mjs --species ' + slug);
}
gate(`color fit (loss <= ${MAX_COLOR_LOSS})`, !!cal.colorFit && cal.colorFit.loss <= MAX_COLOR_LOSS, cal.colorFit ? `loss ${cal.colorFit.loss}` : 'not fitted: --phase color');

// 7. Clips.
const clips = profile.clips;
for (const name of [...MOMENT_CLIPS, ...CATEGORY_CLIPS]) {
  const c = clips[name];
  if (!c) {
    gate(`clip ${name}`, false, 'missing');
    continue;
  }
  const problems = [];
  if (c.generic) problems.push('still the generic placeholder');
  const keys = c.keys ?? [];
  if (name === 'idle' && !c.loop) problems.push('idle must loop');
  if (keys.length < (name === 'idle' ? 3 : 4)) problems.push(`only ${keys.length} keys`);
  if (keys[0]?.t !== 0) problems.push('first key not at 0');
  if (Math.abs((keys.at(-1)?.t ?? 0) - c.duration) > 1e-6) problems.push('last key not at duration');
  if (keys.some((k, i) => i && k.t <= keys[i - 1].t)) problems.push('keys not in time order');
  const events = (c.events ?? []).map((e) => e.name);
  const need = REQUIRED_EVENTS[name] ?? [];
  const lacking = need.filter((e) => !events.includes(e));
  if (lacking.length) problems.push(`missing events: ${lacking.join(', ')}`);
  if ((c.events ?? []).some((e) => e.t < 0 || e.t > c.duration)) problems.push('event outside the clip');
  gate(`clip ${name}`, problems.length === 0, problems.join('; ') || `${c.duration.toFixed(2)} s, ${keys.length} keys${events.length ? ', ' + events.join(' ') : ''}`);
}

// 8. Motif clips: events their effects need.
const motifClipNames = new Map();
for (const [k, v] of Object.entries(profile.motifClips ?? {})) if (v) motifClipNames.set(v, k.replace(/_strong$/, ''));
for (const name of Object.keys(clips)) if (data.MOTIFS[name.replace(/_strong$/, '')]) motifClipNames.set(name, name.replace(/_strong$/, ''));
for (const [clipName, motif] of motifClipNames) {
  const c = clips[clipName];
  if (!c) {
    gate(`motif clip ${motif} -> ${clipName}`, false, 'clip does not exist');
    continue;
  }
  const info = data.MOTIFS[motif];
  const events = (c.events ?? []).map((e) => e.name);
  const main = info.kind === 'contact' ? 'impact' : info.kind === 'ranged' ? (motif === 'quake' ? 'impact' : 'release') : info.events[0];
  const ok = !main || events.includes(main);
  gate(`motif clip ${motif} -> ${clipName}`, ok && !c.generic, ok ? (c.generic ? 'generic placeholder' : events.join(' ')) : `needs a '${main}' event`);
  if (['breath', 'jet', 'beam'].includes(motif) && !events.includes('releaseEnd')) warn(`motif clip ${clipName}`, 'sustained motif without releaseEnd: the stream runs until the clip ends');
}

// 9. Emitters and dynamics.
const builtins = ['mouth', 'eyes', 'hands', 'feet', 'body'];
for (const [name, spec] of Object.entries(profile.emitters ?? {})) {
  const bad = spec.bones.filter((b) => !bones[b] && !joints.has(b));
  gate(`emitter ${name}`, bad.length === 0, bad.length ? `unmapped bones: ${bad.join(', ')}` : spec.bones.join(', '));
}
for (const [motif, name] of Object.entries(profile.emitterFor ?? {})) {
  gate(`emitterFor ${motif} -> ${name}`, builtins.includes(name) || !!profile.emitters?.[name], '');
}
for (const chain of profile.dynamics ?? []) {
  const bad = chain.bones.filter((b) => !bones[b] && !joints.has(b));
  gate(`spring chain ${chain.bones.join('>')}`, bad.length === 0, bad.join(', '));
}
if (!(profile.dynamics ?? []).length) warn('no spring chains', 'loose parts (tail, ears, fins, leaves, wings) should sway: add profile.dynamics');

// 10. Moves: showcase and motif coverage.
const learnable = new Set(species.learnset.map((l) => l.move));
const showcase = (profile.showcaseMoves ?? []).map((m) => (m.startsWith('MOVE_') ? m : `MOVE_${m}`));
gate('4 showcase moves', showcase.length === 4 && showcase.every((m) => data.moves[m]), showcase.join(', '));
for (const m of showcase) {
  const clip = clipOf(data, profile, m);
  gate(`showcase ${m.replace('MOVE_', '')} -> ${clip}`, !!clips[clip] && !clips[clip].generic, `${data.motifOf(data.moves[m])} motif`);
}
const levelMotifs = new Map();
for (const m of learnable) {
  const motif = data.motifOf(data.moves[m]);
  levelMotifs.set(motif, (levelMotifs.get(motif) ?? 0) + 1);
}
const fallback = [...levelMotifs.entries()].filter(([motif]) => !['other'].includes(motif) && !motifClipNames.has(motif) && ![...motifClipNames.values()].includes(motif)).map(([m, n]) => `${m}(${n})`);
if (fallback.length) warn('level-up motifs on category clips', fallback.join(', '));

// 11. Review log.
const reviewPath = join(ROOT, 'src/pokemon', slug, 'REVIEW.md');
if (existsSync(reviewPath)) {
  const review = await readFile(reviewPath, 'utf8');
  const open = (review.match(/- \[ \]/g) ?? []).length;
  const listed = Object.keys(clips).filter((c) => review.includes(`\`${c}\``));
  gate('review log: every clip reviewed from both sides', open === 0 && listed.length === Object.keys(clips).length, `${listed.length}/${Object.keys(clips).length} clips listed, ${open} unchecked`);
} else {
  gate('review log: every clip reviewed from both sides', false, `write src/pokemon/${slug}/REVIEW.md (template: .claude/skills/pokemon-gauntlet/REVIEW_TEMPLATE.md)`);
}

// 12. Runtime: battles both ways and every clip, in the browser.
if (args.render) {
  const base = args.base ?? 'http://127.0.0.1:5173/';
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  let errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const moves = showcase.map((m) => m.replace('MOVE_', '')).join(',');
  for (const [side, q] of [['player', `player=${slug}&moves=${moves}`], ['enemy', `enemy=${slug}&enemyMoves=${moves}`]]) {
    errors = [];
    await page.goto(`${base}?manual=1&autoplay=1&seed=3&loop=0&${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
    let state = null;
    for (let i = 0; i < 12 && state?.phase !== 'end' && !state?.error; i++) {
      await page.evaluate(() => window.__battle.step(1000));
      state = await page.evaluate(() => window.__battle.state());
    }
    gate(`battle with ${slug} as ${side} runs to the end`, state?.phase === 'end' && !state?.error && errors.length === 0, state?.error ?? errors.slice(0, 2).join(' | ') ?? '');
  }
  for (const job of reviewJobs(data, profile, [...learnable])) {
    for (const side of ['enemy', 'player']) {
      errors = [];
      const q = new URLSearchParams({ mode: 'clipreview', species: slug, enemy: slug, attacker: side, ...(job.move ? { move: job.move } : { clip: job.clip }) });
      await page.goto(`${base}?${q}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
      await page.evaluate(() => window.__clip.start());
      for (let i = 0; i < 30 && !(await page.evaluate(() => window.__clip.done)); i++) await page.evaluate(() => window.__clip.step(10));
      const done = await page.evaluate(() => window.__clip.done);
      gate(`plays ${job.name}${job.move ? ` (${job.move})` : ''} as ${side}`, done && errors.length === 0, errors.slice(0, 2).join(' | '));
    }
  }
  await browser.close();
}

report();

function report() {
  const pad = Math.max(...results.map((r) => r.name.length), 10);
  for (const r of results) console.log(`${r.level === 'pass' ? ' ok ' : r.level === 'warn' ? 'warn' : 'FAIL'}  ${r.name.padEnd(pad)}  ${r.detail}`);
  const failed = results.filter((r) => r.level === 'FAIL').length;
  const warned = results.filter((r) => r.level === 'warn').length;
  console.log(`\n${slug}: ${failed ? `${failed} gate(s) failing` : 'all gates pass'}${warned ? `, ${warned} warning(s)` : ''}`);
  process.exit(failed ? 1 : 0);
}
