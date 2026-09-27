#!/usr/bin/env node
// The sound engine's state in the compiled game, frame by frame: for
// platform/tools/sound_check.py, which takes the same from the GBA ROM in
// mGBA and compares them.
//
//   node platform/tools/sound_state.mjs --script S --regions R.json --out state.bin [--wav out.wav] [--mute MASK]
//
// R.json: [[symbol, size], ...], the variables saved at each VBlank (their
// addresses from build/wasm/pokeemerald.map; "symbol+offset" names a part). state.bin holds a record per
// frame: u32 frame, each variable's bytes in order, u32 n, then the n sound
// register writes (0x60-0x9F) since the last VBlank, {u16 offset, u8 value,
// u8 0} each. The script is run.mjs's. --mute silences some of the sound's
// sources in the WAV (bits 0-3 the GB channels, 4 and 5 DirectSound A and B).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGame, keysFrom } from '../host/game.mjs';
import { encodeWav, AudioRecorder } from './wav.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

const script = JSON.parse(fs.readFileSync(opt('--script'), 'utf8'));
const regions = JSON.parse(fs.readFileSync(opt('--regions'), 'utf8'));
const wasm = opt('--wasm', path.join(ROOT, 'build/wasm/pokeemerald.wasm'));
const mapFile = opt('--map', path.join(ROOT, 'build/wasm/pokeemerald.map'));
const frames = Number(opt('--frames', script.frames));
const wav = opt('--wav');
const mute = Number(opt('--mute', 0));

// Data symbols: "  addr  offset  size  name" lines of wasm-ld's map.
const symbols = new Map();
for (const line of fs.readFileSync(mapFile, 'utf8').split('\n')) {
  const m = /^\s*([0-9a-f]+)\s+[0-9a-f]+\s+([0-9a-f]+)\s+(\S+)\s*$/.exec(line);
  if (m && !m[3].includes('/') && !m[3].includes('(')) symbols.set(m[3], parseInt(m[1], 16));
}
const addresses = regions.map(([name, size]) => {
  const [symbol, offset] = name.split('+');
  if (!symbols.has(symbol)) throw new Error(`${symbol}: not in ${mapFile}`);
  return [symbols.get(symbol) + Number(offset ?? 0), size];
});
const recordSize = 4 + regions.reduce((n, [, size]) => n + size, 0);

const inputs = new Map((script.inputs ?? []).map(([f, k]) => [f, keysFrom(k)]));
const chunks = [];
const audio = wav ? new AudioRecorder() : null;
let keys = inputs.get(1) ?? 0;
let game;
game = await loadGame(fs.readFileSync(wasm), {
  time: script.time ? () => script.time : undefined,
  log: () => {},
  onInstance: (ex) => {
    ex.PlatformSoundLog(1);
    ex.PlatformSoundMute(mute);
  },
  onVBlank(n) {
    const mem = new Uint8Array(game.memory().buffer);
    const record = Buffer.alloc(recordSize);
    record.writeUInt32LE(n, 0);
    let at = 4;
    for (const [addr, size] of addresses) {
      record.set(mem.subarray(addr, addr + size), at);
      at += size;
    }
    const ex = game.exports();
    const log = ex.PlatformSoundLog(1);
    const count = ex.PlatformSoundLogTake();
    const writes = Buffer.alloc(4 + count * 4);
    writes.writeUInt32LE(count, 0);
    const view = new DataView(game.memory().buffer, log, count * 8);
    for (let i = 0; i < count; i++) {
      writes.writeUInt16LE(view.getUint16(i * 8 + 4, true), 4 + i * 4);
      writes.writeUInt8(view.getUint8(i * 8 + 6), 4 + i * 4 + 2);
    }
    chunks.push(record, writes);
    if (inputs.has(n + 1)) keys = inputs.get(n + 1);
    game.setKeys(keys);
    audio?.add(game.readAudio());
  },
});
await game.init();
game.setKeys(keys);
while (game.vblanks() < frames) {
  if (!game.frame()) await game.init();  // a soft reset
}
fs.writeFileSync(opt('--out'), Buffer.concat(chunks));
if (audio) fs.writeFileSync(wav, encodeWav(audio.samples(), game.audioRate()));
console.log(`${game.vblanks()} frames; ${opt('--out')}`);
