#!/usr/bin/env node
// Render a song with the m4a engine the way mGBA outputs the GBA's sound, for
// tools/sound/reference/run.py: at 65536 Hz, without the analog stage (raw
// 10-bit mix), as int16 stereo scaled like mGBA's (x48).
//
//   node tools/sound/reference/render.mjs <song> <seconds> <out.raw> [all|ds|psg]
//
// ds / psg keep only the DirectSound channels / only the GB channels.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importTs } from '../../gauntlet/tsimport.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const [song, seconds, out, only = 'all'] = process.argv.slice(2);
const { M4AEngine } = await importTs('src/audio/m4a.ts');
const bank = JSON.parse(await readFile(join(ROOT, 'public/assets/sound/bank.json'), 'utf8'));
const bin = await readFile(join(ROOT, 'public/assets/sound/samples.bin'));
const e = new M4AEngine(bank, new Int8Array(bin.buffer, bin.byteOffset, bin.byteLength), 65536);
e.filter = false;
e.gain = 1;
if (only === 'ds') e.psgSample = (o) => (o[0] = o[1] = 0);
if (only === 'psg') {
  const mix = e.soundMainRAM.bind(e);
  e.soundMainRAM = () => {
    mix();
    e.frameA.fill(0);
    e.frameB.fill(0);
  };
}
e.start(song);
const n = Math.round(Number(seconds) * 65536);
const L = new Float32Array(n), R = new Float32Array(n);
for (let i = 0; i < n; i += 128) e.render(L.subarray(i, Math.min(n, i + 128)), R.subarray(i, Math.min(n, i + 128)));
// The engine's raw output is the 10-bit mix / 512; mGBA writes (mix - bias) * 48.
const pcm = new Int16Array(n * 2);
for (let i = 0; i < n; i++) {
  pcm[2 * i] = Math.round(L[i] * 512 * 48);
  pcm[2 * i + 1] = Math.round(R[i] * 512 * 48);
}
await writeFile(out, Buffer.from(pcm.buffer));
