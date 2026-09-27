#!/usr/bin/env node
// Where the compiled game's time goes, in the platform's CPU clock: runs a
// profile build (node platform/build.mjs --profile) on an input script and
// lists the functions by inclusive cycles, with calls and cycles a call.
// Compare a function with the GBA ROM's (platform/tools/timing.py) to
// calibrate the time model (platform/tools/cpu_time.mjs).
//
//   node platform/tools/profile.mjs --script platform/tests/boot.json [--top 40] [--json out.json]

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadGame, keysFrom } from '../host/game.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const wasm = opt('--wasm', path.join(ROOT, 'build/wasm-profile/pokeemerald.wasm'));
const script = JSON.parse(fs.readFileSync(opt('--script'), 'utf8'));
const top = Number(opt('--top', 40));

// Table index -> function name (the names section is kept; fpcast-emu's thunks carry the name).
const elem = execSync(`wasm-objdump -x -j Elem ${wasm}`, { maxBuffer: 1 << 28 }).toString();
const names = new Map();
for (const m of elem.matchAll(/elem\[(\d+)\] = ref\.func:\d+ <([^>]+)>/g)) names.set(Number(m[1]), m[2].replace(/^byn\$fpcast-emu\$/, ''));

const inputs = new Map((script.inputs ?? []).map(([f, k]) => [f, keysFrom(k)]));
let keys = 0;
let game;
game = await loadGame(fs.readFileSync(wasm), {
  time: script.time ? () => script.time : undefined,
  log: () => {},
  onVBlank(n) {
    if (inputs.has(n + 1)) keys = inputs.get(n + 1);
    game.setKeys(keys);
  },
});
await game.init();
while (game.vblanks() < script.frames) if (!game.frame()) await game.init();

const ex = game.exports();
const base = ex.PlatformProfile();
const mem = game.memory().buffer;
const count = new Uint32Array(mem, base, 1)[0];
const calls = new Uint32Array(mem, base + 4, count);
const cycles = new BigUint64Array(mem, (base + 4 + count * 4 + 7) & ~7, count);
const rows = [];
for (let i = 0; i < count; i++) {
  if (!calls[i]) continue;
  rows.push({ name: names.get(i) ?? `#${i}`, calls: calls[i], cycles: Number(cycles[i]) });
}
rows.sort((a, b) => b.cycles - a.cycles);
for (const r of rows.slice(0, top)) {
  console.log(`${r.name.padEnd(44)} ${String(r.calls).padStart(9)} calls ${String(r.cycles).padStart(13)} cycles ${String(Math.round(r.cycles / r.calls)).padStart(10)} a call`);
}
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(rows));
