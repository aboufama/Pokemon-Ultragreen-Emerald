#!/usr/bin/env node
// The Pokémon stay clear of the healthboxes. Emerald lays its sprites out so
// a Pokémon never reaches under a healthbox (the boxes are drawn over it: a
// body under one looks cut off); a 3D body that rears up, jumps or swings its
// tail can. For each species and side this plays the moments (idle, intro,
// hit, faint) and every clip that stays at home (no `advance`: ranged and
// status clips), and counts the body's pixels under each healthbox's drawn
// pixels, frame by frame. A body may tuck under a box's edge (EDGE px, the
// width of its frame: a foe's toes on the top of our box, as the GBA's
// sprites touch it); what goes deeper is cut off in plain view:
//
//   node tools/gauntlet/uiclear.mjs [--species blaziken,sceptile] [--clips intro,hit] [--shots dir] [--base URL]
//
// A box counts while the game shows it: the foe's from its slide-in on, ours
// from our send-out on (so not while the wild Pokémon plays its intro).
// Fails when any frame puts more than
// TOLERANCE pixels under a box. --shots saves the worst frame of each clip
// that fails. tools/gauntlet/check.mjs --render runs it for its species.
// Needs the dev server.

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOMENT_CLIPS, ROOT, loadProfile } from './species.mjs';

/** How far under a box's edge a body may tuck (px), and how many pixels may go deeper (a claw tip). */
export const EDGE = 2;
export const TOLERANCE = 4;
/** Seconds of idle watched (breathing, weight shifts, springs settling). */
const IDLE_SECONDS = 3;
const STEP = 2;

/** Clips that play at home: the moments, then every clip that never travels toward the foe. */
export function homeClips(profile, only = null) {
  const home = Object.entries(profile.clips).filter(([name, c]) => !MOMENT_CLIPS.includes(name) && c.keys.every((k) => !(k.pose.advance > 0)) && !(c.events ?? []).some((e) => ['grab', 'dig'].includes(e.name)));
  // The faint last: the body stays down after it.
  const order = ['idle', 'intro', 'hit', ...home.map(([n]) => n).sort(), 'faint'];
  return order.filter((n) => profile.clips[n] && (!only || only.includes(n)));
}

/** The pixels of a 240x160 mask more than `r` px inside it. */
function erode(mask, r) {
  const out = new Array(mask.length).fill(0);
  for (let y = r; y < 160 - r; y++) {
    for (let x = r; x < 240 - r; x++) {
      let inside = true;
      for (let dy = -r; dy <= r && inside; dy++) for (let dx = -r; dx <= r && inside; dx++) inside = !!mask[(y + dy) * 240 + x + dx];
      out[y * 240 + x] = inside ? 1 : 0;
    }
  }
  return out;
}

/**
 * Measure one species on an open page: a row per side and clip with the
 * worst frame's pixels past each box's edge ({ px, frame, shot }), and ok.
 * Rejects if the page reloads mid-way (a source file saved while measuring).
 */
export async function clearance(page, { base, slug, profile, only = null, shots = null, log = () => {} }) {
  const clips = homeClips(profile, only);
  const rows = [];
  for (const side of ['player', 'enemy']) {
    const q = new URLSearchParams({ mode: 'clipreview', species: slug, enemy: slug, attacker: side, clip: 'idle', poseRate: '0' });
    await page.goto(`${base}?${q}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
    let reloaded = false;
    const onNav = (f) => f === page.mainFrame() && (reloaded = true);
    page.on('framenavigated', onNav);
    const masks = await page.evaluate(() => ({ foe: window.__clip.boxMask('enemy'), ours: window.__clip.boxMask('player') }));
    for (const box of ['foe', 'ours']) masks[box] = erode(masks[box], EDGE);
    const id = side === 'player' ? 1 : 2;
    await page.evaluate(() => window.__clip.start());
    try {
      for (const clip of clips) {
        if (clip !== 'idle') await page.evaluate((c) => window.__clip.play(c), clip);
        const frames = clip === 'idle' ? IDLE_SECONDS * 60 : Math.ceil(profile.clips[clip].duration * 60) + 12;
        const worst = { foe: { px: 0, frame: 0, shot: null }, ours: { px: 0, frame: 0, shot: null } };
        // The wild Pokémon's intro plays before our healthbox is out.
        const boxes = side === 'enemy' && clip === 'intro' ? ['foe'] : ['foe', 'ours'];
        for (let f = 0; f < frames; f += STEP) {
          await page.evaluate((n) => window.__clip.step(n), STEP);
          const ids = await page.evaluate(() => window.__clip.ids());
          for (const box of boxes) {
            const mask = masks[box];
            let px = 0;
            for (let i = 0; i < ids.length; i++) if (mask[i] && ids[i] === id) px++;
            if (px > worst[box].px) worst[box] = { px, frame: f + STEP, shot: px > TOLERANCE && shots ? await page.evaluate(() => window.__clip.grab()) : null };
          }
        }
        const row = { slug, side, clip, boxes, ok: worst.foe.px <= TOLERANCE && worst.ours.px <= TOLERANCE, foe: worst.foe, ours: worst.ours };
        rows.push(row);
        log(row);
        for (const box of ['foe', 'ours']) {
          if (worst[box].shot) await writeFile(join(shots, `${slug}-${side}-${clip}-${box}.png`), Buffer.from(worst[box].shot.split(',')[1], 'base64'));
        }
      }
    } catch (e) {
      if (reloaded) throw new Error('the page reloaded (a source file changed while measuring): run again once edits are saved');
      throw e;
    } finally {
      page.off('framenavigated', onNav);
    }
  }
  return rows;
}

/** A row as one line: pixels past the edge of the foe's box and ours, with the worst frame. */
export function describe(row) {
  const cell = (w, box) => (row.boxes.includes(box) ? `${String(w.px).padStart(4)} px${w.px ? ` (frame ${w.frame})` : ''}` : '   -').padEnd(20);
  return `foe's box ${cell(row.foe, 'foe')} our box ${cell(row.ours, 'ours')}`;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  const base = String(args.base ?? 'http://127.0.0.1:5173/');
  const all = (await readdir(join(ROOT, 'src/pokemon'), { withFileTypes: true })).filter((d) => d.isDirectory() && existsSync(join(ROOT, 'src/pokemon', d.name, 'clips.ts'))).map((d) => d.name);
  const species = args.species ? String(args.species).split(',') : all;
  const only = args.clips ? String(args.clips).split(',') : null;
  const shots = typeof args.shots === 'string' ? args.shots : null;
  if (shots) await mkdir(shots, { recursive: true });

  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const rows = [];
  try {
    for (const slug of species) {
      const profile = await loadProfile(slug);
      rows.push(...(await clearance(page, { base, slug, profile, only, shots, log: (r) => console.log(`${r.ok ? ' ok ' : 'FAIL'}  ${slug.padEnd(9)} ${r.side.padEnd(6)} ${r.clip.padEnd(16)} ${describe(r)}`) })));
    }
  } catch (e) {
    console.error(`\n${e.message}`);
    process.exit(2);
  }
  await browser.close();
  const failed = rows.filter((r) => !r.ok);
  if (errors.length) console.error(`page errors: ${[...new Set(errors)].slice(0, 3).join(' | ')}`);
  console.log(failed.length || errors.length ? `\n${failed.length} clip(s) reach under a healthbox (more than ${TOLERANCE} px past its ${EDGE} px edge)` : '\nevery Pokémon stays clear of the healthboxes');
  process.exit(failed.length || errors.length ? 1 : 0);
}
