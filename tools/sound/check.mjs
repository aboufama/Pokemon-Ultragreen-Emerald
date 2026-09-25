#!/usr/bin/env node
// Checks for the sound (src/audio): Emerald's songs as extracted by
// tools/extract/extract_sound.py, and the m4a engine that plays them.
//
//   node tools/sound/check.mjs               the checks below
//   node tools/sound/check.mjs --wav <song>  also write build/sound/<song>.wav (30 s) to listen to
//
//   - the bank is whole: every song's voicegroup, every voice's sample, wave
//     and keysplit are there, and every sample lies inside samples.bin;
//   - every song the game asks for (sound.playBGM / playSE / playSEPanned /
//     stopSE / fanfare, and {PLAY_SE ...} in text) is in the bank;
//   - every song renders: finite, never clipping, not silent; the music loops
//     (still playing after a minute) and a sound effect that loops is one the
//     game stops;
//   - the engine, minified as in the production build, runs the same from its
//     own source in an empty scope, the way the AudioWorklet builds it (no
//     helpers or globals from the page);
//   - it renders fast enough for a phone (at least 50x real time here).
//
// Exits non-zero if any check fails. When the engine itself changes, also
// compare it with the game running in mGBA: tools/sound/reference/run.py.

import { build } from 'esbuild';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean));
const results = [];
const gate = (name, ok, detail = '') => results.push({ level: ok ? 'pass' : 'FAIL', name, detail });
const warn = (name, detail) => results.push({ level: 'warn', name, detail });

const RATE = 48000;
const bank = JSON.parse(await readFile(join(ROOT, 'public/assets/sound/bank.json'), 'utf8'));
const pcmFile = await readFile(join(ROOT, 'public/assets/sound/samples.bin'));
const pcm = new Int8Array(pcmFile.buffer, pcmFile.byteOffset, pcmFile.byteLength);

// The engine as the production build ships it: minified for the same target.
const dir = await mkdtemp(join(tmpdir(), 'sound-check-'));
await build({ entryPoints: [join(ROOT, 'src/audio/m4a.ts')], bundle: true, minify: true, target: 'es2020', format: 'esm', platform: 'neutral', outfile: join(dir, 'm4a.mjs'), logLevel: 'error' });
const { M4AEngine } = await import(pathToFileURL(join(dir, 'm4a.mjs')).href);
await rm(dir, { recursive: true, force: true });

// 1. The bank is whole.
{
  const missing = [];
  for (const [name, s] of Object.entries(bank.songs)) if (!bank.voicegroups[s.voicegroup]) missing.push(`${name}: voicegroup ${s.voicegroup}`);
  for (const [name, g] of Object.entries(bank.voicegroups)) {
    g.voices.forEach((v, i) => {
      if (!v) return;
      if (v.sample !== undefined && !bank.samples[v.sample]) missing.push(`${name}[${i}]: sample ${v.sample}`);
      if (v.wave !== undefined && !bank.waves[v.wave]) missing.push(`${name}[${i}]: wave ${v.wave}`);
      if (v.group !== undefined && !bank.voicegroups[v.group]) missing.push(`${name}[${i}]: voicegroup ${v.group}`);
      if (v.split !== undefined && !bank.keysplits[v.split]) missing.push(`${name}[${i}]: keysplit ${v.split}`);
    });
  }
  const outside = Object.entries(bank.samples).filter(([, s]) => s.offset < 0 || s.offset + s.size > pcm.length || s.loopStart > s.size).map(([n]) => n);
  gate('the bank is whole (voicegroups, samples, waves, keysplits)', missing.length === 0, missing.slice(0, 4).join('; ') || `${Object.keys(bank.songs).length} songs, ${Object.keys(bank.samples).length} samples`);
  gate('every sample lies inside samples.bin', outside.length === 0, outside.join(', '));
}

// 2. Every song the game asks for is in the bank: the songs named in the
//    code ('mus_...' / 'se_...', and {PLAY_SE ...} in text).
const named = new Set();
const stopped = new Set(); // sound.stopSE('...')
{
  const files = (await readdir(join(ROOT, 'src'), { recursive: true })).filter((f) => f.endsWith('.ts'));
  for (const f of files) {
    const text = await readFile(join(ROOT, 'src', f), 'utf8');
    for (const m of text.matchAll(/'((?:mus|se)_[a-z0-9_]+)'/g)) named.add(m[1]);
    for (const m of text.matchAll(/\{PLAY_SE (\w+)\}/g)) named.add(m[1].toLowerCase());
    for (const m of text.matchAll(/sound\.stopSE\(\s*'([a-z0-9_]+)'/g)) stopped.add(m[1]);
  }
  const absent = [...named].filter((s) => !bank.songs[s]);
  gate('every song the game plays is in the bank', absent.length === 0, absent.length ? `${absent.join(', ')}: add to SONGS in tools/extract/extract_sound.py and re-run it` : `${named.size} songs`);
  const unused = Object.keys(bank.songs).filter((s) => !named.has(s));
  if (unused.length) warn('songs in the bank nothing plays', `${unused.join(', ')}: drop them from SONGS in tools/extract/extract_sound.py`);
}

// 3. Every song renders sanely.
function render(Engine, song, seconds, block = 128) {
  const e = new Engine(bank, pcm, RATE);
  e.start(song);
  const n = Math.round(seconds * RATE);
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i += block) e.render(L.subarray(i, Math.min(n, i + block)), R.subarray(i, Math.min(n, i + block)));
  return { e, L, R };
}
for (const [song, s] of Object.entries(bank.songs)) {
  const bgm = s.player === 0;
  const { e, L, R } = render(M4AEngine, song, bgm ? 60 : 12);
  let peak = 0, sum = 0, bad = 0;
  for (let i = 0; i < L.length; i++) {
    const a = L[i], b = R[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) bad++;
    else {
      peak = Math.max(peak, Math.abs(a), Math.abs(b));
      sum += a * a + b * b;
    }
  }
  const rms = Math.sqrt(sum / (2 * L.length));
  const stillPlaying = e.playing(s.player) === song;
  const detail = `peak ${peak.toFixed(2)}, rms ${rms.toFixed(3)}`;
  gate(`${song}: renders (finite, no clipping, not silent)`, bad === 0 && peak < 1 && rms > 0.002, bad ? `${bad} non-finite samples` : detail);
  if (bgm) gate(`${song}: the music loops`, stillPlaying, stillPlaying ? '' : 'ended within a minute');
  else if (stillPlaying) gate(`${song}: loops, and the game stops it`, stopped.has(song), 'a looping sound effect needs sound.stopSE');
}

// 4. The worklet's engine: its own source, in a scope with nothing but JavaScript.
{
  let ok = false, detail = '';
  try {
    const Isolated = vm.runInNewContext(`(${M4AEngine.toString()})`, {});
    const a = render(M4AEngine, 'mus_vs_wild', 3), b = render(Isolated, 'mus_vs_wild', 3);
    const diff = a.L.findIndex((v, i) => v !== b.L[i] || a.R[i] !== b.R[i]);
    ok = diff < 0;
    detail = ok ? 'identical output' : `differs at sample ${diff}`;
  } catch (err) {
    detail = String(err).split('\n')[0];
  }
  gate('the engine runs from its own source alone (AudioWorklet)', ok, detail);
}

// 5. Fast enough.
{
  const t0 = performance.now();
  render(M4AEngine, 'mus_vs_wild', 60);
  const x = 60000 / (performance.now() - t0);
  gate('renders fast enough for a phone (>= 50x real time)', x >= 50, `${x.toFixed(0)}x`);
}

if (typeof args.wav === 'string') {
  const { L, R } = render(M4AEngine, args.wav, 30);
  const out = join(ROOT, 'build/sound');
  await mkdir(out, { recursive: true });
  const buf = Buffer.alloc(44 + L.length * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + L.length * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(L.length * 4, 40);
  for (let i = 0; i < L.length; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  await writeFile(join(out, `${args.wav}.wav`), buf);
  console.log(`wrote build/sound/${args.wav}.wav`);
}

let failed = 0;
for (const r of results) {
  if (r.level === 'FAIL') failed++;
  console.log(`${r.level.padEnd(4)}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall sound checks pass');
process.exit(failed ? 1 : 0);
