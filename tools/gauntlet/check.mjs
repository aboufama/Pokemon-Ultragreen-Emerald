#!/usr/bin/env node
// The gauntlet's quality gates for one species (see
// .claude/skills/pokemon-gauntlet/SKILL.md for the process they guard).
//
//   node tools/gauntlet/check.mjs --slug swampert            static gates
//   node tools/gauntlet/check.mjs --slug swampert --render   + battles, every clip and the healthbox
//                                                            clearance (uiclear.mjs) in the browser
//
// Static gates read the profile (bundled from TypeScript) and the model;
// --render needs the dev server (npm run dev) and takes a few minutes.
// Exits non-zero if any gate fails. Warnings don't fail the run but are
// worth fixing.

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { speciesBrief } from './brief.mjs';
import { lintClips } from './cliplint.mjs';
import { clipProblems, clipRoles, duplicates, poseDistance } from './fundamentals.mjs';
import { readGlbJson } from './rigmap.mjs';
import { ROOT, clipOf, gameData, loadProfile } from './species.mjs';
import { importTs } from './tsimport.mjs';

const { SITUATIONS, MULTI_HIT_EFFECTS, MANY_HIT_EFFECTS, TWO_TURN_EFFECTS } = await importTs('src/battle3d/situations.ts');
const { SAME_ACTION, moveClipName, sameAction } = await importTs('src/battle3d/actions.ts');
/** How far apart (degrees) a multi-hit run's clips may hand over at the foe (the next one blends in over 0.12 s). */
const HANDOVER = 30;
/** How far (in the foe's heights) a blow may stop short of the foe's body at its impact (--render). */
const REACH = 0.1;

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
/**
 * Silhouette fit against the stock sprites. The opponent side's front sprite
 * is drawn about the way the model faces, so it must match closely; back
 * sprites are drawn side-on while the model always faces the foe, so on the
 * player side the model only has to cover the sprite's area (size and
 * placement). A stance that fails is fixed, never the thresholds.
 */
const FIT_GATES = { enemy: { iou: 0.55, box: 0.75 }, player: { iou: 0.45, box: 0.65 } };
/** How far the stance's head may turn from the foe (degrees). */
const MAX_HEAD_YAW = 20;
const MAX_COLOR_LOSS = 1.0;

const REQUIRED_EVENTS = {
  intro: ['cry'],
  faint: ['shrink'],
};
/**
 * A faint curls over and shrinks away, as the 3D games show it: it never
 * sinks into the ground (root.y) or topples over (root.pitch / root.roll),
 * and it lasts the shrink's length after its 'shrink' (src/anim/clip.ts).
 */
const FAINT_LIMITS = { sink: -0.1, tip: 40 };
const { SHRINK_FRAMES } = await importTs('src/anim/clip.ts');
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
gate('stance shaped to the stock sprite\'s posture (not the bind pose)', shaped >= 3, `${shaped} bones/aims set`);

// 6. Calibration.
const cal = profile.calibration;
for (const side of ['enemy', 'player']) {
  const fit = cal.fit?.[side];
  const g = FIT_GATES[side];
  gate(`${side} silhouette fit (IoU >= ${g.iou}, box >= ${g.box})`, !!fit && fit.iou >= g.iou && (fit.boxIou ?? 0) >= g.box, fit ? `IoU ${fit.iou}, box ${fit.boxIou}` : 'not fitted: node tools/calibrate/run.mjs --species ' + slug);
}
gate(`color fit (loss <= ${MAX_COLOR_LOSS})`, !!cal.colorFit && cal.colorFit.loss <= MAX_COLOR_LOSS, cal.colorFit ? `loss ${cal.colorFit.loss}` : 'not fitted: --phase color');

// 7. Clips: every situation, and every move it can know.
const clips = profile.clips;
const brief10 = await speciesBrief(slug);
const pool = brief10.moves;
/** Structure every clip keeps (keys in order from 0 to its length, its events inside it). */
function structure(name, c) {
  const problems = [];
  if (c.generic) problems.push('still the generic placeholder');
  const keys = c.keys ?? [];
  const idle = name === 'idle' || /^idle_/.test(name);
  if (!!c.loop !== idle) problems.push(idle ? `${name} must loop` : 'only idles loop');
  if (keys.length < 3) problems.push(`only ${keys.length} keys`);
  if (keys[0]?.t !== 0) problems.push('first key not at 0');
  if (Math.abs((keys.at(-1)?.t ?? 0) - c.duration) > 1e-6) problems.push('last key not at duration');
  if (keys.some((k, i) => i && k.t <= keys[i - 1].t)) problems.push('keys not in time order');
  if ((c.events ?? []).some((e) => e.t < 0 || e.t > c.duration)) problems.push('event outside the clip');
  return problems;
}
for (const name of brief10.situations) {
  const c = clips[name];
  if (!c) {
    gate(`situation ${name}`, false, `missing: ${SITUATIONS[name] ?? ''}`);
    continue;
  }
  const problems = structure(name, c);
  const events = (c.events ?? []).map((e) => e.name);
  const lacking = (REQUIRED_EVENTS[name] ?? []).filter((e) => !events.includes(e));
  if (lacking.length) problems.push(`missing events: ${lacking.join(', ')}`);
  if (name === 'faint') {
    const shrink = (c.events ?? []).find((e) => e.name === 'shrink');
    if (shrink && c.duration - shrink.t < SHRINK_FRAMES / 60 - 1e-6) problems.push(`ends ${(c.duration - shrink.t).toFixed(2)} s after its shrink (the shrink takes ${(SHRINK_FRAMES / 60).toFixed(2)} s)`);
    const r = (k) => k.pose.root ?? {};
    if (c.keys.some((k) => (r(k).y ?? 0) < FAINT_LIMITS.sink)) problems.push(`sinks into the ground (root.y below ${FAINT_LIMITS.sink}): a faint curls over and shrinks away`);
    if (c.keys.some((k) => Math.abs(r(k).pitch ?? 0) > FAINT_LIMITS.tip || Math.abs(r(k).roll ?? 0) > FAINT_LIMITS.tip)) problems.push(`topples over (root tipped past ${FAINT_LIMITS.tip}°): a faint curls over and shrinks away`);
  }
  gate(`situation ${name}`, problems.length === 0, problems.join('; ') || `${c.duration.toFixed(2)} s, ${c.keys.length} keys${events.length ? ', ' + events.join(' ') : ''}`);
}

// Every move in its movepool has its own clip (and its variants): made for
// that move, or for a move of the same action (src/battle3d/actions.ts),
// never another move's or a category clip.
const ownClip = (moveConst) => {
  for (const m of sameAction(moveConst)) {
    const name = profile.moveClips?.[m] ?? moveClipName(m);
    if (clips[name]) return { name, via: m };
  }
  return null;
};
const inPool = new Set(pool.map((m) => m.const));
for (const [m, target] of Object.entries(profile.moveClips ?? {})) {
  const allowed = sameAction(m).map(moveClipName);
  const ok = allowed.some((a) => target === a || target.startsWith(`${a}_`));
  if (inPool.has(m)) gate(`moveClips ${m} -> ${target}`, ok, ok ? '' : `plays a clip made for another move: give ${m.replace('MOVE_', '')} its own (${allowed[0]})`);
  else if (!ok) warn(`moveClips ${m} -> ${target}`, 'a move it can\'t know: remove the entry');
}
for (const m of pool) {
  const move = data.moves[m.const];
  const own = ownClip(m.const);
  const motif = data.motifOf(move);
  if (!own) {
    gate(`move ${m.name}`, false, `no clip: ${moveClipName(m.const)} (${motif}: ${data.MOTIFS[motif].body}) [${m.sources.join(',')}]`);
    continue;
  }
  const c = clips[own.name];
  const problems = structure(own.name, c);
  const events = (c.events ?? []).map((e) => e.name);
  const info = data.MOTIFS[motif];
  const twoTurn = TWO_TURN_EFFECTS.has(move.effect);
  // The events its effects need: a contact move's impact, a ranged one's release, a status move's own.
  let need = info.requires ?? (info.kind === 'contact' ? ['impact'] : info.kind === 'ranged' ? (motif === 'quake' ? ['impact'] : ['release']) : info.events.slice(0, 1));
  // A two-turn move's first turn is its _charge (a burrow's dig): its strike needs the rest.
  if (twoTurn) need = need.filter((e) => e !== 'dig');
  const lacking = need.filter((e) => !events.includes(e));
  if (lacking.length) problems.push(`needs ${lacking.map((e) => `a '${e}'`).join(' and ')} event`);
  gate(`move ${m.name} -> ${own.name}`, problems.length === 0, problems.join('; ') || `${c.duration.toFixed(2)} s ${events.join(' ')}${own.via !== m.const ? ` (the same action as ${own.via.replace('MOVE_', '')})` : ''}`);
  // Its variants: each hit of a multi-hit move, a two-turn move's first turn.
  const variants = [];
  if (MULTI_HIT_EFFECTS.has(move.effect)) variants.push('_first', ...(MANY_HIT_EFFECTS.has(move.effect) ? ['_next'] : []), '_last');
  if (twoTurn) variants.push('_charge');
  for (const v of variants) {
    const vc = clips[own.name + v];
    if (!vc) {
      gate(`move ${m.name} ${v.slice(1)} -> ${own.name + v}`, false, `missing: ${v === '_charge' ? 'the first turn (gathering power, burrowing, storing energy)' : v === '_first' ? 'the first hit: leap in, strike, stay at the foe' : v === '_next' ? 'a hit between: strike again from the foe (another limb, another angle), stay' : 'the last hit: strike from the foe, go home'}`);
      continue;
    }
    const ve = (vc.events ?? []).map((e) => e.name);
    const vp = structure(own.name + v, vc);
    const vneed = v === '_charge' ? (ve.includes('charge') || ve.includes('dig') ? [] : ["a 'charge' (or a burrow's 'dig')"]) : ve.includes(info.kind === 'contact' ? 'impact' : 'release') ? [] : [`a '${info.kind === 'contact' ? 'impact' : 'release'}'`];
    if (vneed.length) vp.push(`needs ${vneed.join(' and ')} event`);
    gate(`move ${m.name} ${v.slice(1)} -> ${own.name + v}`, vp.length === 0, vp.join('; ') || `${vc.duration.toFixed(2)} s ${ve.join(' ')}`);
  }
}

// Moves outside its movepool that one of its moves can call (Mimic, Mirror
// Move, Metronome, Assist, Nature Power) play its clip for their motif: every
// motif resolves to a clip of its own (motifClips, or a clip named after it).
const CALLERS = ['MOVE_MIMIC', 'MOVE_MIRROR_MOVE', 'MOVE_METRONOME', 'MOVE_ASSIST', 'MOVE_NATURE_POWER'];
if (pool.some((m) => CALLERS.includes(m.const))) {
  const unmapped = Object.keys(data.MOTIFS).filter((mo) => mo !== 'other' && !clips[profile.motifClips?.[mo] ?? mo] && !clips[profile.motifClips?.[`${mo}_strong`] ?? `${mo}_strong`]);
  gate('every motif has a clip (for moves Mimic or Mirror Move call)', unmapped.length === 0, unmapped.length ? `map these in motifClips to its closest clip: ${unmapped.join(', ')}` : '');
}

// 8. The fundamentals (tools/gauntlet/fundamentals.mjs): contact moves travel
// to the foe and strike it there; wind-ups, snaps, follow-through, moving
// holds, settling; no two clips the same animation.
const roles = clipRoles(profile, pool, data.moves);
for (const [name, c] of Object.entries(clips)) {
  if (c.generic) continue;
  const problems = clipProblems(name, c, roles.get(name), profile.poses?.stance);
  if (problems.length) for (const p of problems) gate(`clip ${name}: ${p.rule}`, false, p.what);
}
const sharedAction = (a, b) => [...Object.values(SAME_ACTION)].some((g) => g.map(moveClipName).includes(a) && g.map(moveClipName).includes(b));
const dupes = duplicates(Object.fromEntries(Object.entries(clips).filter(([, c]) => !c.generic)), sharedAction);
gate('every clip its own animation (no copies)', dupes.length === 0, dupes.map(([a, b, far]) => `${a} = ${b} (${far.toFixed(1)}°)`).join('; '));
// A multi-hit run hands over at the foe: its _first ends, its _next starts and ends, its _last and 'return_home' start in one pose.
{
  const handovers = [];
  for (const [name] of Object.entries(clips)) {
    const base = name.replace(/_(first|next|last)$/, '');
    if (base === name || !clips[`${base}_first`]) continue;
    const endOf = (n) => clips[n].keys.at(-1).pose, startOf = (n) => clips[n].keys[0].pose;
    for (const [from, to] of [[`${base}_first`, `${base}_next`], [`${base}_first`, `${base}_last`], [`${base}_next`, `${base}_last`], [`${base}_first`, 'return_home']]) {
      if (!clips[from] || !clips[to] || name !== from) continue;
      const d = poseDistance(endOf(from), startOf(to));
      if (d > HANDOVER) handovers.push(`${from} ends ${d.toFixed(0)}° from where ${to} starts`);
    }
  }
  if (Object.keys(clips).some((n) => /_first$/.test(n))) gate(`multi-hit runs hand over in one pose (within ${HANDOVER}°)`, handovers.length === 0, handovers.join('; '));
}

// Clip mistakes that read as robotic (tools/gauntlet/cliplint.mjs): planted
// pivots, half-aimed bones, hitches after snaps, rushed turns.
for (const i of lintClips(clips)) if (i.kind !== 'slide') warn(`clip ${i.clip}: ${i.kind}`, i.what);

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

// Moves by body part (tools/gauntlet/classify_moves.mjs): every part must be
// one the file offered; a missing file only warns (Jev needs an API key).
const partsPath = join(ROOT, 'src/pokemon', slug, 'moves.json');
if (existsSync(partsPath)) {
  const file = JSON.parse(await readFile(partsPath, 'utf8'));
  const bad = Object.entries(file.moves).filter(([, e]) => !(e.part in file.parts)).map(([m, e]) => `${m}: ${e.part}`);
  gate(`moves by body part (${Object.keys(file.moves).length} moves)`, bad.length === 0, bad.length ? `parts not offered: ${bad.join(', ')}` : file.classifier);
} else {
  warn('moves by body part', 'no moves.json: run tools/gauntlet/classify_moves.mjs (Jev), or keep emitterFor per motif');
}

// 10. Showcase moves (the demo's picks).
const showcase = (profile.showcaseMoves ?? []).map((m) => (m.startsWith('MOVE_') ? m : `MOVE_${m}`));
// Four, or every move it can learn when it learns fewer (Wurmple: three).
const showcaseCount = Math.min(4, pool.filter((m) => m.const !== 'MOVE_STRUGGLE').length);
gate(`${showcaseCount} showcase moves`, showcase.length === showcaseCount && showcase.every((m) => data.moves[m]), showcase.join(', '));
for (const m of showcase) {
  const clip = clipOf(data, profile, m);
  gate(`showcase ${m.replace('MOVE_', '')} -> ${clip}`, !!clips[clip] && !clips[clip].generic, `${data.motifOf(data.moves[m])} motif`);
}

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
  // The stance faces the foe. Battlers always face their opponent; a head
  // turned away at rest (to match a side-on sprite) reads as looking the wrong
  // way, then turning round to attack.
  {
    const q = new URLSearchParams({ mode: 'clipreview', species: slug, enemy: slug, attacker: 'enemy', clip: 'idle', poseRate: '0' });
    await page.goto(`${base}?${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
    const yaw = await page.evaluate(() => {
      window.__clip.start();
      window.__clip.tick(1);
      return window.__clip.joints(['headYaw']).headYaw?.[0] ?? null;
    });
    gate(`stance faces the foe (head within ${MAX_HEAD_YAW} deg of it)`, yaw !== null && Math.abs(yaw) <= MAX_HEAD_YAW, yaw === null ? 'no head bone mapped' : `head turned ${yaw.toFixed(1)} deg`);
  }
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
  // Every move performed as the battle does, and every other clip played,
  // from both sides against itself: each plays to its end without errors,
  // and each blow lands on the foe (its body touches the foe's at every
  // impact: the gap between them at most REACH of the foe's height).
  for (const side of ['player', 'enemy']) {
    errors = [];
    const q = new URLSearchParams({ mode: 'clipreview', species: slug, enemy: slug, attacker: side, clip: 'idle' });
    await page.goto(`${base}?${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
    await page.evaluate(() => window.__clip.start());
    const run = async (what, arg) => {
      errors = [];
      await page.evaluate(([w, a]) => {
        window.__clip.contacts.length = 0;
        window.__clip[w](a);
      }, [what, arg]);
      for (let i = 0; i < 80 && !(await page.evaluate(() => window.__clip.done)); i++) await page.evaluate(() => window.__clip.tick(6));
      // Settle back into idle before the next.
      await page.evaluate(() => window.__clip.tick(20));
      return { done: await page.evaluate(() => window.__clip.done), contacts: await page.evaluate(() => window.__clip.contacts.slice()), errors: errors.slice() };
    };
    const blows = (name, r, contact) => {
      if (!contact) return;
      const far = r.contacts.filter((c) => c.reach > REACH);
      gate(`${name} lands on the foe as ${side}`, r.contacts.length > 0 && far.length === 0, r.contacts.length ? r.contacts.map((c) => `${c.event} gap ${c.reach.toFixed(2)}`).join(', ') + (far.length ? `: the blow must reach the foe's body (gap <= ${REACH} of its height)` : '') : 'no blow landed');
    };
    for (const m of pool) {
      const move = data.moves[m.const];
      const r = await run('perform', m.const.replace('MOVE_', ''));
      gate(`performs ${m.name} as ${side}`, r.done && r.errors.length === 0, r.errors.slice(0, 2).join(' | '));
      const role = roles.get(ownClip(m.const)?.name);
      blows(`${m.name}`, r, role?.contact && !(clips[ownClip(m.const)?.name]?.events ?? []).some((e) => e.name === 'dig') ? true : false);
      // A multi-hit run from its first hit to its last; a first hit, then home.
      const own = ownClip(m.const)?.name;
      if (own && MULTI_HIT_EFFECTS.has(move.effect)) {
        const run1 = [`${own}_first`, ...(MANY_HIT_EFFECTS.has(move.effect) ? [`${own}_next`] : []), `${own}_last`].filter((c) => clips[c]);
        for (const c of run1) {
          const rr = await run('play', c);
          gate(`plays ${c} as ${side}`, rr.done && rr.errors.length === 0, rr.errors.slice(0, 2).join(' | '));
          blows(c, rr, role?.contact);
        }
        if (clips[`${own}_first`] && clips.return_home) {
          await run('play', `${own}_first`);
          const rr = await run('play', 'return_home');
          gate(`plays ${own}_first then return_home as ${side}`, rr.done && rr.errors.length === 0, rr.errors.slice(0, 2).join(' | '));
        }
      }
      if (own && TWO_TURN_EFFECTS.has(move.effect) && clips[`${own}_charge`]) {
        const rr = await run('play', `${own}_charge`);
        gate(`plays ${own}_charge as ${side}`, rr.done && rr.errors.length === 0, rr.errors.slice(0, 2).join(' | '));
      }
    }
    for (const name of brief10.situations.filter((n) => clips[n] && n !== 'idle' && !/^idle_/.test(n))) {
      const r = await run('play', name);
      gate(`plays ${name} as ${side}`, r.done && r.errors.length === 0, r.errors.slice(0, 2).join(' | '));
    }
  }
  // Clear of the healthboxes: nothing played at home goes under one (tools/gauntlet/uiclear.mjs).
  const { clearance, describe, EDGE, TOLERANCE } = await import('./uiclear.mjs');
  try {
    for (const r of await clearance(page, { base, slug, profile })) {
      gate(`${r.clip} as ${r.side} stays clear of the healthboxes (<= ${TOLERANCE} px past a ${EDGE} px edge)`, r.ok, describe(r).replace(/\s+/g, ' ').trim());
    }
  } catch (e) {
    gate('clear of the healthboxes', false, e.message);
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
