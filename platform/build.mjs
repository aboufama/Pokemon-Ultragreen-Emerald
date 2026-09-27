#!/usr/bin/env node
// Build the game for the browser: pret/pokeemerald compiled to WebAssembly
// (docs/ARCHITECTURE.md).
//
//   node platform/build.mjs              build/wasm/pokeemerald.wasm (+ public/game/)
//   node platform/build.mjs --no-make    skip the decomp's own build
//   node platform/build.mjs --only src/main.c    compile one game file and stop
//   node platform/build.mjs --jobs 8
//   node platform/build.mjs --profile    build/wasm-profile/: every game function
//                                        reports its time (platform/tools/profile.mjs)
//
// Stages:
//  1. The decomp's own build (`make modern DINFO=1`): its tools, its generated
//     graphics and maps, its data assembled into ARM objects, and the GBA ROM
//     with debug info (the reference: tools/layouts.py, tools/reference.py).
//  2. The game's C, each file preprocessed as the decomp's Makefile does
//     (cpp, then preproc for text and INCBIN), with the GBA's struct layout
//     (tools/apcs_layout.mjs), compiled by clang for wasm32 to LLVM IR, its
//     basic blocks timed (tools/cpu_time.mjs) and its volatile accesses
//     hooked to the platform (tools/volatile_io.mjs), then to a wasm object. Patched files (platform/patches/) are compiled from
//     a patched copy; drivers in REPLACED give way to the platform's own
//     (platform/game, compiled like the game).
//  3. The platform's C (platform/src, platform/libc).
//  4. The data: each ARM data object converted to a wasm object with the same
//     bytes and symbols (tools/elf2wasm.py), function references typed from
//     the C objects (tools/wasmobj.py).
//  5. wasm-ld, then wasm-opt: function pointer casts as on the GBA
//     (--fpcast-emu: a call through a pointer of another type works, extra
//     arguments ignored, a missing result 0) and optimization.

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apcsLayout } from './tools/apcs_layout.mjs';
import { hookVolatileIo } from './tools/volatile_io.mjs';
import { addCpuTime } from './tools/cpu_time.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DECOMP = path.join(ROOT, 'decomp/pokeemerald');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const PROFILE = flag('--profile');
const OUT = path.join(ROOT, PROFILE ? 'build/wasm-profile' : 'build/wasm');
const PUBLIC = path.join(ROOT, 'public/game');
const JOBS = Number(option('--jobs', Math.max(1, os.cpus().length)));

/**
 * Decomp C files the platform replaces with its own (platform/game): the
 * flash chip's and the real-time clock's drivers. (The assembly files are
 * not compiled at all: crt0.s, m4a_1.s and libgcnmultiboot.s are replaced by
 * platform/src and platform/game; rom_header.s is converted as data.)
 */
const REPLACED = ['src/agb_flash.c', 'src/agb_flash_1m.c', 'src/agb_flash_le.c', 'src/agb_flash_mx.c', 'src/siirtc.c'];

const CPPFLAGS = [
  '--target=wasm32-unknown-unknown', '-E', '-ffreestanding', '-nostdlibinc',
  '-isystem', path.join(HERE, 'libc/include'),
  '-iquote', 'include', '-iquote', path.join(HERE, 'include'), '-iquote', 'src',
  '-Wno-trigraphs', '-DMODERN=1', '-DPLATFORM_WASM=1',
];
const CFLAGS = [
  '--target=wasm32-unknown-unknown', '-O2', '-g', '-ffreestanding',
  '-fno-strict-aliasing', '-fwrapv', '-fno-delete-null-pointer-checks',
  '-mbulk-memory', '-w',
];
const PLATFORM_CFLAGS = [
  '--target=wasm32-unknown-unknown', '-O2', '-g', '-ffreestanding', '-nostdlibinc',
  '-isystem', path.join(HERE, 'libc/include'), '-I', path.join(HERE, 'include'),
  '-iquote', path.join(DECOMP, 'include'),
  '-fno-strict-aliasing', '-fwrapv', '-mbulk-memory', '-DMODERN=1', '-DPLATFORM_WASM=1',
  '-Wall', '-Wno-unused-function',
];
/** Memory: the GBA's map at its own addresses (OAM ends at 0x07000400). */
const MEMORY_BYTES = 0x08000000;
const STACK_BYTES = 1 << 20;

// A compiled file is reused while its preprocessed source, the flags, these
// transforms and its entry of the time model's corrections are unchanged.
const TOOLS_HASH = hashFiles(['apcs_layout.mjs', 'volatile_io.mjs', 'cpu_time.mjs'].map((f) => path.join(HERE, 'tools', f)));
// The time model's corrections, function by function (tools/cpu_time.mjs).
const CPU_TIME_FACTORS = fs.existsSync(path.join(HERE, 'tools/cpu_time.json'))
  ? JSON.parse(fs.readFileSync(path.join(HERE, 'tools/cpu_time.json'), 'utf8')) : {};

function hashFiles(files) {
  const h = createHash('sha1');
  for (const f of files) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 12);
}

function run(cmd, argv, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, argv, { cwd: opts.cwd ?? DECOMP, stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    p.stdout.on('data', (d) => out.push(d));
    p.stderr.on('data', (d) => err.push(d));
    p.on('close', (code) => resolve({ code, stdout: Buffer.concat(out), stderr: Buffer.concat(err).toString() }));
    if (opts.input !== undefined) p.stdin.end(opts.input);
    else p.stdin.end();
  });
}

async function pool(items, jobs, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(jobs, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

function mkdirFor(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

// ---------------------------------------------------------------- stage 1

function decompBuild() {
  console.log('decomp: make modern DINFO=1');
  const r = spawnSync('make', ['modern', 'DINFO=1', `-j${JOBS}`], { cwd: DECOMP, stdio: ['ignore', 'pipe', 'inherit'] });
  if (r.status !== 0) throw new Error('the decomp build failed');
}

// ---------------------------------------------------------------- stage 2

/**
 * Apply the platform's patches (platform/patches/*.patch, each naming the
 * decomp file it changes) to copies of those files. Returns {decomp path:
 * patched copy}.
 */
function overlay() {
  const dir = path.join(OUT, 'overlay');
  fs.rmSync(dir, { recursive: true, force: true });
  const sources = new Map();
  for (const name of fs.readdirSync(path.join(HERE, 'patches')).filter((f) => f.endsWith('.patch')).sort()) {
    const patch = path.join(HERE, 'patches', name);
    const target = /^\+\+\+ b\/(\S+)/m.exec(fs.readFileSync(patch, 'utf8'))?.[1];
    if (!target) throw new Error(`${name}: no target file`);
    const dest = path.join(dir, target);
    mkdirFor(dest);
    fs.copyFileSync(path.join(DECOMP, target), dest);
    const r = spawnSync('patch', ['-s', '-p1', '--no-backup-if-mismatch', '-d', dir, '-i', patch], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`${name} does not apply to ${target}:\n${r.stdout}${r.stderr}`);
    sources.set(target, dest);
  }
  return sources;
}

/** The game's C: the decomp's src/*.c, minus the replaced drivers, plus the platform's replacements. */
function gameSources() {
  const decomp = fs.readdirSync(path.join(DECOMP, 'src'))
    .filter((f) => f.endsWith('.c') && !f.endsWith('.inc.c'))
    .map((f) => `src/${f}`)
    .filter((f) => !REPLACED.includes(f));
  const platform = fs.readdirSync(path.join(HERE, 'game'))
    .filter((f) => f.endsWith('.c'))
    .map((f) => `platform/game/${f}`);
  return [...decomp, ...platform].sort();
}

/** Where a game file's source is: a patched copy, the platform's, or the decomp's. */
function sourceOf(rel, patched) {
  if (patched.has(rel)) return patched.get(rel);
  if (rel.startsWith('platform/')) return path.join(ROOT, rel);
  return rel;
}

const cacheFile = path.join(OUT, 'cache.json');
const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
const saveCache = () => fs.writeFileSync(cacheFile, JSON.stringify(cache));

async function compileGameFile(rel, source) {
  const obj = path.join(OUT, 'obj', rel.replace(/\.c$/, '.o'));
  mkdirFor(obj);
  const pp = await run('clang', [...CPPFLAGS, source]);
  if (pp.code !== 0) return { rel, error: pp.stderr };
  const { text, count: structs } = apcsLayout(pp.stdout.toString('latin1'));
  const pre = await run(path.join(DECOMP, 'tools/preproc/preproc'), ['-i', '-g', 'build/assets', rel, 'charmap.txt'], { input: Buffer.from(text, 'latin1') });
  if (pre.code !== 0) return { rel, error: pre.stderr };
  const factors = CPU_TIME_FACTORS[rel] ?? {};
  const key = createHash('sha1').update(pre.stdout).update(TOOLS_HASH).update(CFLAGS.join(' ')).update(PROFILE ? 'profile' : '')
    .update(JSON.stringify(factors)).digest('hex');
  if (cache[rel]?.key === key && fs.existsSync(obj)) return { rel, cached: true, ...cache[rel] };
  const ll = await run('clang', [...CFLAGS, '-S', '-emit-llvm', '-x', 'c', '-', '-o', '-'], { input: pre.stdout });
  if (ll.code !== 0) return { rel, error: ll.stderr };
  // The game's code takes time (tools/cpu_time.mjs); the platform's drivers
  // set theirs themselves (a profile build still counts their calls).
  const own = rel.startsWith('platform/');
  const timed = own && !PROFILE ? { ir: ll.stdout.toString('latin1'), blocks: 0 }
    : addCpuTime(ll.stdout.toString('latin1'), { profile: PROFILE, factors, timed: !own });
  const hooked = hookVolatileIo(timed.ir);
  const irFile = obj.replace(/\.o$/, '.ll');
  fs.writeFileSync(irFile, hooked.ir, 'latin1');
  const cc = await run('clang', ['--target=wasm32-unknown-unknown', '-O2', '-g', '-mbulk-memory', '-w', '-c', irFile, '-o', obj]);
  fs.rmSync(irFile);
  if (cc.code !== 0) return { rel, error: cc.stderr };
  cache[rel] = { key, structs, io: hooked.count, blocks: timed.blocks, others: hooked.others.length };
  return { rel, ...cache[rel] };
}

async function compileGame(only) {
  const patched = overlay();
  const files = only ? [only] : gameSources();
  console.log(`game: compiling ${files.length} C files`);
  let done = 0;
  const results = await pool(files, JOBS, async (rel) => {
    const r = await compileGameFile(rel, sourceOf(rel, patched));
    done++;
    if (r.error) console.log(`  FAIL ${rel}\n${r.error.split('\n').slice(0, 12).join('\n')}`);
    else if (!r.cached && (done % 25 === 0 || only)) console.log(`  ${done}/${files.length} ${rel}`);
    return r;
  });
  saveCache();
  const failed = results.filter((r) => r.error);
  const io = results.reduce((n, r) => n + (r.io ?? 0), 0);
  const structs = results.reduce((n, r) => n + (r.structs ?? 0), 0);
  const blocks = results.reduce((n, r) => n + (r.blocks ?? 0), 0);
  console.log(`game: ${results.length - failed.length}/${results.length} compiled (${results.filter((r) => r.cached).length} cached); ${structs} struct definitions laid out as on the GBA; ${blocks} basic blocks timed; ${io} volatile accesses hooked`);
  if (failed.length) throw new Error(`${failed.length} game files failed: ${failed.map((r) => r.rel).join(', ')}`);
  return files.map((rel) => path.join(OUT, 'obj', rel.replace(/\.c$/, '.o')));
}

// ---------------------------------------------------------------- stage 3

/**
 * The game's global variables in RAM (EWRAM, IWRAM) with their addresses on
 * the GBA, from the ROM's symbols: a table for PlatformGbaAddress
 * (platform/src/symbols.c). A variable not in this build (the ROM's libc,
 * the replaced drivers') is a weak reference, 0 here.
 */
function gbaSymbols() {
  const nm = spawnSync('arm-none-eabi-nm', ['-S', path.join(DECOMP, 'pokeemerald_modern.elf')], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (nm.status !== 0) throw new Error(`arm-none-eabi-nm failed:\n${nm.stderr}`);
  const symbols = [];
  for (const line of nm.stdout.split('\n')) {
    const m = /^([0-9a-f]{8}) ([0-9a-f]{8}) [BDC] ([A-Za-z_]\w*)$/.exec(line.trim());
    if (!m) continue;
    const address = parseInt(m[1], 16);
    if (address >= 0x02000000 && address < 0x04000000) symbols.push({ name: m[3], address, size: parseInt(m[2], 16) });
  }
  const hex = (n) => `0x${n.toString(16).toUpperCase().padStart(8, '0')}u`;
  const file = path.join(OUT, 'gba_symbols.c');
  fs.writeFileSync(file, [
    '// Generated by platform/build.mjs from the ROM\'s symbols: the game\'s global',
    '// variables in RAM, where they are here (0: not in this build) and on the GBA.',
    '#include <stdint.h>',
    'struct PlatformGbaSymbol { const void *here; uint32_t gba; uint32_t size; };',
    ...symbols.map((s) => `extern char ${s.name}[] __attribute__((weak));`),
    'const struct PlatformGbaSymbol gPlatformGbaSymbols[] = {',
    ...symbols.map((s) => `    { ${s.name}, ${hex(s.address)}, ${hex(s.size)} },`),
    '};',
    `const uint32_t gPlatformGbaSymbolCount = ${symbols.length};`,
    '',
  ].join('\n'));
  return file;
}

async function compilePlatform() {
  const dirs = ['src', 'libc'];  // (platform/game is compiled with the game)
  const files = dirs.flatMap((d) => fs.readdirSync(path.join(HERE, d)).filter((f) => f.endsWith('.c')).map((f) => path.join(HERE, d, f)));
  files.push(gbaSymbols());
  console.log(`platform: compiling ${files.length} C files`);
  const results = await pool(files, JOBS, async (file) => {
    const rel = file.startsWith(HERE) ? path.relative(HERE, file) : path.join('generated', path.basename(file));
    const obj = path.join(OUT, 'obj/platform', rel.replace(/\.c$/, '.o'));
    mkdirFor(obj);
    const r = await run('clang', [...PLATFORM_CFLAGS, '-c', file, '-o', obj], { cwd: ROOT });
    if (r.stderr.trim()) console.log(r.stderr.trimEnd());
    return { file, obj, ok: r.code === 0 };
  });
  const failed = results.filter((r) => !r.ok);
  if (failed.length) throw new Error(`platform files failed: ${failed.map((r) => path.relative(ROOT, r.file)).join(', ')}`);
  return results.map((r) => r.obj);
}

// ---------------------------------------------------------------- stage 4

function dataObjects() {
  const list = [];
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.o')) list.push(p);
    }
  };
  walk(path.join(DECOMP, 'build/modern/data'));
  walk(path.join(DECOMP, 'build/modern/sound'));
  // The ROM header (the game code, the logo) is data too.
  list.push(path.join(DECOMP, 'build/modern/src/rom_header.o'));
  return list.sort();
}

async function convertData(cObjects) {
  const sig = path.join(OUT, 'signatures.json');
  const s = spawnSync('python3', [path.join(HERE, 'tools/wasmobj.py'), ...cObjects], { maxBuffer: 1 << 28 });
  if (s.status !== 0) throw new Error(`wasmobj.py failed:\n${s.stderr}`);
  fs.writeFileSync(sig, s.stdout);
  const dir = path.join(OUT, 'data');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const objs = dataObjects();
  console.log(`data: converting ${objs.length} ARM objects`);
  const c = spawnSync('python3', [path.join(HERE, 'tools/elf2wasm.py'), '--signatures', sig, '--out', dir, '--root', path.join(DECOMP, 'build/modern'), ...objs], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (c.status !== 0) throw new Error(`elf2wasm.py failed:\n${c.stderr}`);
  const warnings = c.stderr.trim().split('\n').filter(Boolean);
  for (const w of warnings) console.log(`  ${w}`);
  const sources = fs.readdirSync(dir).filter((f) => f.endsWith('.s'));
  const results = await pool(sources, JOBS, async (f) => {
    const obj = path.join(OUT, 'obj/data', f.replace(/\.s$/, '.o'));
    mkdirFor(obj);
    const r = await run('clang', ['--target=wasm32-unknown-unknown', '-c', f, '-o', obj], { cwd: dir });
    if (r.code !== 0) console.log(`  FAIL data ${f}\n${r.stderr.split('\n').slice(0, 8).join('\n')}`);
    return r.code === 0 ? obj : null;
  });
  if (results.includes(null)) throw new Error('data objects failed to assemble');
  return results;
}

// ---------------------------------------------------------------- stage 5

function link(objects) {
  const linked = path.join(OUT, 'pokeemerald.debug.wasm');
  const rsp = path.join(OUT, 'link.rsp');
  fs.writeFileSync(rsp, objects.map((o) => JSON.stringify(o)).join('\n'));
  const argv = [
    '--no-entry', '--stack-first', '-z', `stack-size=${STACK_BYTES}`,
    `--initial-memory=${MEMORY_BYTES}`, `--max-memory=${MEMORY_BYTES}`,
    '--error-limit=0', `-Map=${path.join(OUT, 'pokeemerald.map')}`,
    '-o', linked, `@${rsp}`,
  ];
  console.log(`link: ${objects.length} objects`);
  const r = spawnSync('wasm-ld', argv, { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.stdout.trim() || r.stderr.trim()) console.log((r.stdout + r.stderr).trimEnd().split('\n').slice(0, 200).join('\n'));
  if (r.status !== 0) throw new Error('link failed');
  const out = path.join(OUT, 'pokeemerald.wasm');
  const o = spawnSync('wasm-opt', [linked, '--fpcast-emu', '-O2', '-g', '--strip-dwarf', '-o', out], { encoding: 'utf8' });
  if (o.status !== 0) throw new Error(`wasm-opt failed:\n${o.stderr}`);
  if (PROFILE) {
    console.log(`link: ${path.relative(ROOT, out)} (profile build)`);
    return;
  }
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.copyFileSync(out, path.join(PUBLIC, 'pokeemerald.wasm'));
  const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(1);
  console.log(`link: ${path.relative(ROOT, out)} ${mb(out)} MB (debug ${mb(linked)} MB), copied to public/game/`);
}

// ---------------------------------------------------------------- stage 6

/**
 * The layouts of the structs the browser reads from the game's memory
 * (platform/include/remake_state.h): every field's offset and size as clang
 * lays them out, written next to the module (remake_state.json), so the
 * browser reads fields by name and never keeps a copy of the offsets.
 */
/**
 * The game's constants the remake layer uses (src/remake): every constant
 * with one of these prefixes that these headers define (#define or enum),
 * evaluated as the game is compiled, so the remake repeats none of the
 * game's numbers.
 */
const REMAKE_CONSTANTS = [
  ['battle_controllers.h', 'CONTROLLER_'],
  ['constants/battle.h', 'BATTLE_ENVIRONMENT_'],
  ['constants/battle.h', 'BATTLE_TYPE_'],
  ['constants/battle.h', 'B_OUTCOME_'],
  ['constants/battle.h', 'MOVE_RESULT_'],
  ['constants/battle_anim.h', 'B_ANIM_'],
  ['battle_anim.h', 'STAT_ANIM_'],
  ['constants/battle.h', 'B_POSITION_'],
  ['constants/battle.h', 'B_SIDE_'],
  ['remake_state.h', 'REMAKE_'],
  ['hacks.h', 'HACK_'],
];

function gameConstants() {
  const headers = [...new Set(REMAKE_CONSTANTS.map(([h]) => h))];
  const names = new Set();
  for (const [header, prefix] of REMAKE_CONSTANTS) {
    const file = [path.join(DECOMP, 'include', header), path.join(HERE, 'include', header)].find((f) => fs.existsSync(f));
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(new RegExp(`^\\s*#define\\s+(${prefix}\\w+)\\s+\\S`, 'gm'))) names.add(m[1]);
    for (const m of text.matchAll(new RegExp(`^\\s*(${prefix}\\w+)\\s*(?:=[^,\\n]*)?,?\\s*(?://.*)?$`, 'gm'))) names.add(m[1]);
  }
  const probe = path.join(OUT, 'remake_constants_probe.c');
  fs.writeFileSync(probe, ['#include "global.h"', ...headers.map((h) => `#include "${h}"`),
    ...[...names].map((n) => `int const__${n} = ${n};`)].join('\n') + '\n');
  const flags = CPPFLAGS.filter((f) => f !== '-E');
  const r = spawnSync('clang', [...flags, '-O2', '-S', '-o', '-', probe], { cwd: DECOMP, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`game constants probe failed:\n${r.stderr}`);
  const constants = {};
  for (const m of r.stdout.matchAll(/^const__(\w+):\n\s+\.int32\s+(-?\d+)/gm)) constants[m[1]] = Number(m[2]);
  return constants;
}

function structLayouts() {
  const header = path.join(HERE, 'include/remake_state.h');
  const text = fs.readFileSync(header, 'utf8');
  const probes = [];
  const types = {};
  for (const m of text.matchAll(/struct (\w+) \{([^}]*)\};/g)) {
    const [, name, body] = m;
    probes.push(`int size__${name} = sizeof(struct ${name});`);
    // Every declaration of the body (comments dropped), so a field the
    // parser cannot read stops the build instead of going missing.
    const decls = body.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').split(';').map((d) => d.replace(/\s+/g, ' ').trim()).filter(Boolean);
    for (const decl of decls) {
      const d = /^(?:const )?((?:struct )?\w+) (.+)$/.exec(decl);
      const names = d ? d[2].split(',').map((n) => n.trim().replace(/\s*\[.*$/, '')) : [];
      if (!d || !names.every((n) => /^\w+$/.test(n))) throw new Error(`remake_state.h: struct ${name}: cannot read the field "${decl}"`);
      const type = d[1];
      for (const field of names) {
        (types[name] ??= {})[field] = type;
        probes.push(`int off__${name}__${field} = __builtin_offsetof(struct ${name}, ${field});`);
        probes.push(`int len__${name}__${field} = sizeof(((struct ${name} *)0)->${field});`);
      }
    }
  }
  const probe = path.join(OUT, 'remake_state_probe.c');
  fs.writeFileSync(probe, `#include "remake_state.h"\n${probes.join('\n')}\n`);
  const r = spawnSync('clang', ['--target=wasm32-unknown-unknown', '-O2', '-S', '-o', '-', '-I', path.join(HERE, 'include'), probe], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`struct layout probe failed:\n${r.stderr}`);
  const layouts = {};
  for (const m of r.stdout.matchAll(/^(size|off|len)__(\w+?)(?:__(\w+))?:\n\s+\.int32\s+(-?\d+)/gm)) {
    const [, kind, struct, field, value] = m;
    const l = (layouts[struct] ??= { size: 0, fields: {} });
    if (kind === 'size') l.size = Number(value);
    else (l.fields[field] ??= [0, 0, types[struct][field]])[kind === 'off' ? 0 : 1] = Number(value);
  }
  return layouts;
}

// ----------------------------------------------------------------

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const only = option('--only');
  if (!flag('--no-make') && !only) decompBuild();
  const game = await compileGame(only);
  if (only) return;
  const platform = await compilePlatform();
  const data = await convertData([...game, ...platform]);
  link([...game, ...platform, ...data]);
  if (!PROFILE) {
    const info = { structs: structLayouts(), constants: gameConstants() };
    fs.writeFileSync(path.join(PUBLIC, 'remake_state.json'), JSON.stringify(info, null, 1));
    console.log(`remake: public/game/remake_state.json (${Object.keys(info.structs).length} structs, ${Object.keys(info.constants).length} game constants)`);
  }
}

main().catch((e) => {
  console.error(`build: ${e.message}`);
  process.exit(1);
});
