#!/usr/bin/env node
// Cut a trailer from moves in the battle view, with Emerald's music under it
// and each hit's sound on its frame. Needs the dev server (npm run dev) and,
// to encode, ffmpeg (else it leaves the frames and the soundtrack).
//
//   node tools/shots/trailer.mjs tools/shots/trailers/starters.json [--scale 6] [--out build/trailer]
//
// The cut list (JSON): the song, the length, and the shots in order. Each shot
// is a /?mode=clipreview query (a move, or a clip such as faint; &drain= makes
// hits take HP, &hp= / &foeHp= set the bars), when it starts in the trailer
// and when its (first) hit lands, which is how shots are timed: put hits on
// the music's accents. The hit's sound and its pan are the game's
// (Cmd_effectivenesssound, PlaySE12WithPanning: -64 left for our side, 63 right
// for the foe's).
//
//   { "music": "mus_vs_wild", "seconds": 10, "fade": 0.25,
//     "shots": [{ "query": "species=blaziken&enemy=sceptile&attacker=player&move=BLAZE_KICK",
//                 "from": 0, "hit": 0.619, "se": "se_super_effective", "pan": 63 }, ...] }
//
// Output: <out>/<name>.mp4 (H.264 + AAC, 60 fps, the GBA screen scaled up
// with square pixels), <out>/<name>/ (frames and soundtrack.wav).

import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTs } from '../gauntlet/tsimport.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);
const listPath = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
if (!listPath) {
  console.error('usage: node tools/shots/trailer.mjs <cuts.json> [--scale 6] [--out build/trailer] [--base http://127.0.0.1:5173/]');
  process.exit(1);
}
const cuts = JSON.parse(await readFile(listPath, 'utf8'));
const name = basename(listPath, '.json');
const scale = Number(opt('scale', 6));
const base = opt('base', 'http://127.0.0.1:5173/');
const outDir = resolve(opt('out', join(ROOT, 'build/trailer')));
const work = join(outDir, name);
const FPS = 60, IDLE = 12, TAIL = 12;
const total = Math.round(cuts.seconds * FPS);

// 1. Film every shot, a frame at a time, a few at once.
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
async function film(shot) {
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  // The same trailer every time: shakes and other random touches from a seeded generator.
  await page.addInitScript(() => {
    let s = 0x2545f491;
    Math.random = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}?mode=clipreview&${shot.query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true && !!window.__clip, null, { timeout: 180000 });
  const frames = [];
  const grab = async () => frames.push(Buffer.from((await page.evaluate(() => window.__clip.grab())).split(',')[1], 'base64'));
  for (let i = 0; i < IDLE; i++) {
    await page.evaluate(() => window.__clip.step(1));
    await grab();
  }
  await page.evaluate(() => window.__clip.start());
  for (let tail = TAIL; frames.length < 900; ) {
    await page.evaluate(() => window.__clip.step(1));
    await grab();
    if ((await page.evaluate(() => window.__clip.done)) && --tail <= 0) break;
  }
  const hits = await page.evaluate(() => window.__clip.hits);
  await page.close();
  if (errors.length) throw new Error(`${shot.query}: ${errors.join(' | ')}`);
  if (!hits.length) throw new Error(`${shot.query}: no hit to time the shot by`);
  // A hit counted on frame n shows in the n-th grab.
  return { frames, hit: hits[0] - 1 };
}
const filmed = [];
for (let i = 0; i < cuts.shots.length; i += 3) filmed.push(...(await Promise.all(cuts.shots.slice(i, i + 3).map(film))));
await browser.close();

// 2. Cut: each shot from its start to the next one's, lined up on its hit.
await rm(work, { recursive: true, force: true });
await mkdir(join(work, 'frames'), { recursive: true });
const starts = [...cuts.shots.map((s) => Math.round(s.from * FPS)), total];
for (let k = 0; k < cuts.shots.length; k++) {
  const { frames, hit } = filmed[k];
  const at = Math.round(cuts.shots[k].hit * FPS);
  const first = hit + starts[k] - at, last = hit + starts[k + 1] - 1 - at;
  if (first < 0 || last >= frames.length) throw new Error(`shot ${k + 1} needs film frames ${first}-${last} of ${frames.length}: move its start or its hit`);
  for (let t = starts[k]; t < starts[k + 1]; t++) await writeFile(join(work, 'frames', `${String(t).padStart(4, '0')}.png`), frames[hit + t - at]);
  console.log(`shot ${k + 1}  ${(starts[k] / FPS).toFixed(2)}-${(starts[k + 1] / FPS).toFixed(2)} s  hit at ${(at / FPS).toFixed(3)} s  ${cuts.shots[k].query}`);
}

// 3. The soundtrack: the song from its first note, each hit's sound cued a
//    frame early (it starts on the engine's next frame).
const RATE = 48000;
const { M4AEngine } = await importTs('src/audio/m4a.ts');
const bank = JSON.parse(await readFile(join(ROOT, 'public/assets/sound/bank.json'), 'utf8'));
const bin = await readFile(join(ROOT, 'public/assets/sound/samples.bin'));
const engine = new M4AEngine(bank, new Int8Array(bin.buffer, bin.byteOffset, bin.byteLength), RATE);
engine.start(cuts.music);
const n = Math.round(cuts.seconds * RATE);
const L = new Float32Array(n), R = new Float32Array(n);
const cues = cuts.shots.filter((s) => s.se).map((s) => ({ at: Math.max(0, Math.round((s.hit - 1 / FPS) * RATE)), se: s.se, pan: s.pan ?? 0 })).sort((a, b) => a.at - b.at);
let i = 0;
for (const cue of [...cues, { at: n }]) {
  for (; i < cue.at; i += 128) engine.render(L.subarray(i, Math.min(cue.at, i + 128)), R.subarray(i, Math.min(cue.at, i + 128)));
  i = cue.at;
  if (cue.se) engine.startPanned(cue.se, cue.pan);
}
const wav = Buffer.alloc(44 + n * 4);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + n * 4, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(RATE, 24);
wav.writeUInt32LE(RATE * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(n * 4, 40);
for (let k = 0; k < n; k++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[k])) * 32767), 44 + k * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[k])) * 32767), 46 + k * 4);
}
await writeFile(join(work, 'soundtrack.wav'), wav);

// 4. Encode: square pixels, a fade to black at the end, the sound fading with it.
const fade = cuts.fade ?? 0.25;
const out = join(outDir, `${name}.mp4`);
const ff = spawnSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-framerate', String(FPS), '-i', join(work, 'frames/%04d.png'), '-i', join(work, 'soundtrack.wav'),
  '-vf', `scale=iw*${scale}:ih*${scale}:flags=neighbor,fade=t=out:st=${cuts.seconds - fade}:d=${fade}`,
  '-af', `afade=t=out:st=${cuts.seconds - fade - 0.1}:d=${fade + 0.1}`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out,
], { stdio: 'inherit' });
if (ff.error || ff.status !== 0) {
  console.log(`no ffmpeg to encode with: the frames and soundtrack.wav are in ${work}`);
  process.exit(ff.error ? 0 : 1);
}
console.log(`trailer: ${out} (${240 * scale}x${160 * scale}, ${FPS} fps, ${cuts.seconds} s)`);
