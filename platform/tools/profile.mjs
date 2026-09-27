#!/usr/bin/env node
// Where the compiled game's time goes, in the platform's CPU clock: runs a
// profile build (node platform/build.mjs --profile) on an input script and
// lists the functions by inclusive cycles, with calls, cycles a call and
// their own (less the game functions they call; --json also has the part
// the time pass counts, `code`, apart from the platform's: BIOS, DMA...).
// Compare a function with the GBA ROM's (platform/tools/timing.py) to
// calibrate the time model (platform/tools/cpu_time.mjs).
//
//   node platform/tools/profile.mjs --script platform/tests/boot.json [--top 40] [--json out.json]
//        [--counted names.txt]   only these functions are counted apart; a call
//                                to another counts as its caller's own time
//        [--trace 200-210]       also list each counted call starting in those
//                                frames: its frame, scanline, cycle and time
//        [--pairs pairs.json]    the counted calls by caller and callee: calls,
//                                the callee's cycles, code, self and selfCode

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

const counted = opt('--counted') ? new Set(fs.readFileSync(opt('--counted'), 'utf8').split(/\s+/).filter(Boolean)) : null;
const trace = opt('--trace') ? opt('--trace').split('-').map(Number) : null;

const inputs = new Map((script.inputs ?? []).map(([f, k]) => [f, keysFrom(k)]));
let keys = 0;
let game;
game = await loadGame(fs.readFileSync(wasm), {
  time: script.time ? () => script.time : undefined,
  log: () => {},
  onInstance(ex) {
    if (trace) new Uint32Array(ex.memory.buffer, ex.PlatformProfileTrace(), 2).set(trace);
    if (!counted) return;
    const base = ex.PlatformProfile();
    const count = new Uint32Array(ex.memory.buffer, base, 1)[0];
    const mask = new Uint8Array(ex.memory.buffer, base + 4, count);
    for (let i = 0; i < count; i++) mask[i] = counted.has(names.get(i)) ? 1 : 0;
  },
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
const calls = new Uint32Array(mem, base + 4 + count, count);
const cyclesAt = (base + 4 + count * 5 + 7) & ~7;
const cycles = new BigUint64Array(mem, cyclesAt, count);
const self = new BigUint64Array(mem, cyclesAt + count * 8, count);
const code = new BigUint64Array(mem, cyclesAt + count * 16, count);
const rows = [];
for (let i = 0; i < count; i++) {
  if (!calls[i]) continue;
  rows.push({ name: names.get(i) ?? `#${i}`, calls: calls[i], cycles: Number(cycles[i]), self: Number(self[i]), code: Number(code[i]) });
}
rows.sort((a, b) => b.cycles - a.cycles);
for (const r of rows.slice(0, top)) {
  console.log(`${r.name.padEnd(44)} ${String(r.calls).padStart(9)} calls ${String(r.cycles).padStart(13)} cycles ${String(Math.round(r.cycles / r.calls)).padStart(10)} a call ${String(r.self).padStart(13)} its own`);
}
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(rows));

if (opt('--pairs')) {
  // struct Pairs: u32 size, unused; then {u32 caller, callee, calls, unused; u64 cycles, code, self, selfCode} each.
  const p = ex.PlatformProfilePairs();
  const size = new Uint32Array(mem, p, 1)[0];
  const pairs = [];
  for (let i = 0; i < size; i++) {
    const e = p + 8 + i * 48;
    const [caller, callee, n] = new Uint32Array(mem, e, 3);
    if (!n) continue;
    const [c, g, s, sg] = new BigUint64Array(mem, e + 16, 4);
    pairs.push({ caller: names.get(caller) ?? `#${caller}`, callee: names.get(callee) ?? `#${callee}`, calls: n,
      cycles: Number(c), code: Number(g), self: Number(s), selfCode: Number(sg) });
  }
  fs.writeFileSync(opt('--pairs'), JSON.stringify(pairs));
}

if (trace) {
  const t = ex.PlatformProfileTrace();
  const n = new Uint32Array(mem, t + 8, 1)[0];
  const calls = [];
  for (let i = 0; i < n; i++) {
    const e = t + 16 + i * 32;
    const [fn, frame, line] = new Uint32Array(mem, e, 3);
    const [start, cycles] = new BigUint64Array(mem, e + 16, 2);
    calls.push({ name: names.get(fn) ?? `#${fn}`, frame, line, start: Number(start), cycles: Number(cycles) });
  }
  calls.sort((a, b) => a.start - b.start);
  for (const c of calls) console.log(`${c.name} enters: frame ${c.frame} line ${c.line} cycle ${c.start} (${c.cycles} cycles)`);
}
