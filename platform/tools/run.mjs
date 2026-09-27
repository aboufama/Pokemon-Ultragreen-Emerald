#!/usr/bin/env node
// Run the compiled game headlessly: an input script, frames saved as PNG,
// and its sound as a WAV file if asked.
//
//   node platform/tools/run.mjs --script platform/tests/boot.json --out build/run/boot
//   node platform/tools/run.mjs --script platform/tests/title.json --wav build/run/title.wav
//
// The script (JSON): { "frames": N, "inputs": [[frame, "A+START"], ...],
// "shots": [frame, ...], "every": K, "time": [2026, 1, 1, 4, 10, 0, 0],
// "battle": "BLAZIKEN:50,SWAMPERT:50,GRASS" (a test battle, started as soon
// as the game can: platform/host/test_battle.mjs) }.
// Frames are the GBA's: frame N ends at the Nth VBlank since power-on, as
// tools/reference.py counts them on the GBA ROM. Keys named at a frame are
// held from that frame on, until the next entry.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGame, keysFrom, GameHalt, WIDTH, HEIGHT } from '../host/game.mjs';
import { startTestBattle, testBattleArgs } from '../host/test_battle.mjs';
import { encodePng } from './png.mjs';
import { encodeWav, AudioRecorder } from './wav.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

const script = JSON.parse(fs.readFileSync(opt('--script'), 'utf8'));
const out = opt('--out', path.join(ROOT, 'build/run', path.basename(opt('--script'), '.json')));
const wasm = opt('--wasm', path.join(ROOT, 'build/wasm/pokeemerald.wasm'));
const wav = opt('--wav');
fs.mkdirSync(out, { recursive: true });

const inputs = new Map((script.inputs ?? []).map(([f, k]) => [f, keysFrom(k)]));
const json = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
let battle = script.battle
  ? testBattleArgs(script.battle, { species: json('src/data/generated/species.json'), moves: json('src/data/generated/moves.json') },
    json('public/game/remake_state.json').constants)
  : null;
const shots = new Set(script.shots ?? []);
const logs = [];
const audio = wav ? new AudioRecorder() : null;
let keys = inputs.get(1) ?? 0;
let game;
const game_ = await loadGame(fs.readFileSync(wasm), {
  time: script.time ? () => script.time : undefined,
  log: (t) => logs.push(t),
  onVBlank(n) {
    if (shots.has(n) || (script.every && n % script.every === 0)) {
      fs.writeFileSync(path.join(out, `f${String(n).padStart(5, '0')}.png`), encodePng(game.frameRGBA(), WIDTH, HEIGHT));
    }
    if (inputs.has(n + 1)) keys = inputs.get(n + 1);
    game.setKeys(keys);
    audio?.add(game.readAudio());
  },
});
game = game_;
const t0 = performance.now();
let halted = null;
try {
  await game.init();
  game.setKeys(keys);
  while (game.vblanks() < script.frames) {
    if (battle && startTestBattle(game, battle)) battle = null;
    if (!game.frame()) {
      logs.push(`soft reset at frame ${game.vblanks()}`);
      await game.init();
    }
  }
} catch (e) {
  halted = `frame ${game.vblanks()}: ${e instanceof GameHalt ? 'halted: ' : ''}${e.message}`;
  console.log(e.stack);
}
const ms = performance.now() - t0;
fs.writeFileSync(path.join(out, 'log.txt'), logs.join('\n') + '\n');
if (audio) {
  fs.mkdirSync(path.dirname(path.resolve(wav)), { recursive: true });
  fs.writeFileSync(wav, encodeWav(audio.samples(), game.audioRate()));
}
const frames = game.vblanks();
console.log(`${halted ?? `${frames} frames`} in ${(ms / 1000).toFixed(2)} s (${(ms / Math.max(1, frames)).toFixed(2)} ms/frame); ${logs.length} log lines; ${out}`);
if (halted) process.exit(1);
