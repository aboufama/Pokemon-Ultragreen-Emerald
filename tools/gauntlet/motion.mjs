#!/usr/bin/env node
// How fluid a species' clips are, measured on its joints as the battle
// animates them (curves, overlap, IK and springs included), next to the
// reference species:
//
//   node tools/gauntlet/motion.mjs --species sceptile,blaziken [--clips physical_weak,idle] [--base URL] [--json out.json]
//
// Per clip and joint (head, hands, feet, chest, tail tip):
//   stop-starts  the joint slows to under a third of its speed and speeds up
//                again in the same direction within 0.25 s: a stutter at a
//                key, the main thing that reads as robotic (a turnaround at
//                an extreme reverses direction and is not counted)
//   pops         a one-frame speed spike: a key too close to the next, or an
//                aimed bone missing from some keys
//   holds        spans over 0.3 s where the whole body is nearly still
//   turn         how far the body yaws in the clip's first 0.3 s (a pivot
//                on the spot before the move reads as mechanical)
// Lower is better; compare with blaziken, the reference.

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { loadProfile } from './species.mjs';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
}
const species = String(args.species ?? 'blaziken').split(',');
const base = String(args.base ?? 'http://127.0.0.1:5173/');
const FPS = 60;
const JOINTS = ['head', 'handL', 'handR', 'footL', 'footR', 'chest', 'tail', 'tail2', 'tail3', 'tail4', 'tail5', 'tail6', 'tail7'];

const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const angle = (a, b) => {
  const d = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (norm(a) * norm(b) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, d))) * 180) / Math.PI;
};

function analyse(frames, duration) {
  const names = Object.keys(frames[0]).filter((n) => n !== 'rootYaw' && frames[0][n]);
  // The tail's tip is the last tail bone the rig has.
  const tails = names.filter((n) => /^tail\d*$/.test(n));
  const tip = tails.sort().at(-1);
  const joints = names.filter((n) => !/^tail\d*$/.test(n) || n === tip);
  const n = frames.length;
  const end = Math.min(n - 1, Math.round(duration * FPS));
  const result = { stopStarts: [], pops: [], holds: [], turn: 0 };
  const allSpeed = new Array(n).fill(0);
  for (const j of joints) {
    const vel = [];
    for (let t = 0; t < n - 1; t++) vel.push(sub(frames[t + 1][j], frames[t][j]).map((x) => x * FPS));
    const sp = vel.map(norm);
    // 3-frame smoothing for the stop-start scan.
    const sm = sp.map((_, t) => (sp[Math.max(0, t - 1)] + sp[t] + sp[Math.min(sp.length - 1, t + 1)]) / 3);
    for (let t = 0; t < sp.length; t++) allSpeed[t] = Math.max(allSpeed[t], sp[t]);
    const W = Math.round(0.25 * FPS);
    for (let t = 2; t < Math.min(end, sm.length - 2); t++) {
      if (!(sm[t] <= sm[t - 1] && sm[t] <= sm[t + 1])) continue;
      let a = t, b = t;
      for (let k = t - 1; k >= Math.max(0, t - W); k--) if (sm[k] > sm[a]) a = k;
      for (let k = t + 1; k <= Math.min(sm.length - 1, t + W); k++) if (sm[k] > sm[b]) b = k;
      const lo = Math.min(sm[a], sm[b]);
      if (a === t || b === t || lo < 0.35 || sm[t] > lo / 3) continue;
      if (angle(vel[a], vel[b]) > 75) continue; // a turnaround, not a stutter
      result.stopStarts.push({ joint: j, t: +(t / FPS).toFixed(2) });
    }
    for (let t = 3; t < Math.min(end, sp.length - 3); t++) {
      const around = [sp[t - 3], sp[t - 2], sp[t + 2], sp[t + 3]].sort((x, y) => x - y);
      const med = (around[1] + around[2]) / 2;
      if (sp[t] > 2.5 && sp[t] > 3.5 * Math.max(med, 0.2)) result.pops.push({ joint: j, t: +(t / FPS).toFixed(2), speed: +sp[t].toFixed(1) });
    }
  }
  let still = 0;
  for (let t = 0; t < Math.min(end, allSpeed.length); t++) {
    if (allSpeed[t] < 0.06) still++;
    else {
      if (still > 0.3 * FPS) result.holds.push({ t: +((t - still) / FPS).toFixed(2), seconds: +(still / FPS).toFixed(2) });
      still = 0;
    }
  }
  const yaw = frames.map((f) => f.rootYaw?.[0] ?? 0);
  const early = yaw.slice(0, Math.round(0.3 * FPS));
  result.turn = +(Math.max(...early) - Math.min(...early)).toFixed(1);
  return result;
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const report = {};
for (const slug of species) {
  const profile = await loadProfile(slug);
  const clips = args.clips ? String(args.clips).split(',') : Object.keys(profile.clips).filter((c) => c !== 'idle');
  report[slug] = {};
  const page = await browser.newPage({ viewport: { width: 740, height: 500 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  for (const clip of clips) {
    // poseRate=0: the motion itself, not its stop-motion display.
    await page.goto(`${base}?mode=clipreview&species=${slug}&enemy=${slug}&clip=${clip}&attacker=enemy&ui=0&poseRate=0`);
    await page.waitForFunction(() => !!window.__clip, null, { timeout: 120000 });
    const duration = await page.evaluate(() => window.__clip.info.duration);
    const frames = await page.evaluate(({ n, names }) => {
      window.__clip.start();
      const out = [];
      for (let i = 0; i < n; i++) {
        window.__clip.tick(1);
        out.push(window.__clip.joints(names));
      }
      return out;
    }, { n: Math.round((duration + 0.3) * FPS), names: [...JOINTS, 'rootYaw'] });
    report[slug][clip] = { duration, ...analyse(frames, duration) };
  }
  await page.close();
}
await browser.close();

for (const [slug, clips] of Object.entries(report)) {
  let ss = 0, pops = 0, holds = 0, turns = 0, secs = 0;
  console.log(`\n${slug}`);
  for (const [clip, r] of Object.entries(clips)) {
    ss += r.stopStarts.length; pops += r.pops.length; holds += r.holds.length; secs += r.duration; turns += r.turn > 3 ? 1 : 0;
    const where = (list) => list.slice(0, 6).map((x) => `${x.joint ?? ''}@${x.t}`).join(' ');
    console.log(`  ${clip.padEnd(24)} ${r.duration.toFixed(2)}s  stop-starts ${String(r.stopStarts.length).padStart(2)}  pops ${String(r.pops.length).padStart(2)}  holds ${r.holds.length}  turn ${String(r.turn).padStart(4)}°  ${where(r.stopStarts)} ${r.pops.length ? '| pops ' + where(r.pops) : ''}${r.holds.length ? ' | holds ' + r.holds.map((h) => `${h.t}+${h.seconds}s`).join(' ') : ''}`);
  }
  console.log(`  total: ${ss} stop-starts (${(ss / secs).toFixed(1)}/s), ${pops} pops, ${holds} dead holds, ${turns} clips turning >3° in the first 0.3 s, over ${secs.toFixed(1)} s of clips`);
}
if (args.json) await writeFile(String(args.json), JSON.stringify(report, null, 2) + '\n');
