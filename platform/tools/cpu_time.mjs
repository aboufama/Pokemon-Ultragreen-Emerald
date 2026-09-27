// The game's own code takes time, as on the GBA.
//
// Compiled natively, the game's C runs in no time on the platform's clock:
// only register polls, BIOS calls and DMA would move it. But the GBA's
// timeline depends on how long the code runs: a long computation delays the
// next frame (a lag frame), and the game's register manager applies a write
// at once or at the next VBlank depending on where the scanline is. So every
// basic block of the game's LLVM IR adds its cost to the platform's clock
// (gPlatformCycles) when it runs: each instruction's ARM7TDMI cost, roughly,
// by kind. The hardware catches up at the next register access, BIOS call or
// DMA (platform/src/clock.c). CYCLE_SCALE is calibrated against the GBA ROM:
// platform/tools/profile.mjs (a profile build) against platform/tools/
// timing.py over the same frames. The game's Thumb code runs from ROM with
// wait states and needs more instructions than the IR has (two-operand
// forms, literal pool loads, bitfields): at 2.6 the heavy functions of the
// boot are within a few percent of the GBA's (MainCB2_Intro 0.99,
// BuildOamBuffer 1.06, the copyright screen 1.02).

/** Cost per IR instruction, in CPU cycles, before the scale. */
function cost(line) {
  const t = line.trim();
  if (/^(%\S+ = )?(load|store) /.test(t)) return 3;          // a memory access with its wait states
  if (/^(%\S+ = )?(tail )?call /.test(t)) return 5;          // bl + push/pop
  if (/^br i1 /.test(t) || /^switch /.test(t)) return 3;     // a taken branch refills the pipeline
  if (/^(%\S+ = )?(s|u)?(div|rem) /.test(t)) return 40;      // a BIOS or libgcc division
  if (/^(%\S+ = )?mul /.test(t)) return 3;
  return 1;
}

/** Instructions that cost nothing on the GBA: SSA bookkeeping and debug records. */
function free(line) {
  const t = line.trim();
  return !t || t.startsWith(';') || t.startsWith('#') || /^%\S+ = phi /.test(t) || /@llvm\.(dbg|lifetime|assume|experimental\.noalias)/.test(t)
    || /^(%\S+ = )?(bitcast|getelementptr|freeze) /.test(t) || /^unreachable$/.test(t);
}

export const CYCLE_SCALE = 2.6;

// What memory a function touches, as the first compile inferred it: memory(read,
// argmem: readwrite) says it writes nothing but what its arguments point to.
const MEMORY_EFFECTS = /\s*\b(memory\([^)]*\)|readnone|readonly|writeonly|argmemonly|inaccessiblememonly|inaccessiblemem_or_argmemonly)(?=[\s}]|$)/g;

/**
 * The IR comes from an optimizing compile, which inferred each function's
 * memory effects; the time pass makes every function write the clock (and a
 * profile build's call the profiler), and the second compile trusts the
 * inferred effects: a caller would keep the clock in a register across a call
 * to a function said to write only through its arguments, store it back after,
 * and drop the callee's time. So the functions defined here get copies of their
 * attribute groups without the memory effects.
 */
function forgetMemoryEffects(lines) {
  const groups = new Map();
  for (const line of lines) {
    const m = /^attributes #(\d+) = \{(.*)\}\s*$/.exec(line);
    if (m) groups.set(m[1], m[2]);
  }
  let next = Math.max(-1, ...[...groups.keys()].map(Number)) + 1;
  const copies = new Map();
  const out = lines.map((line) => {
    if (!/^define /.test(line)) return line;
    return line.replace(/ #(\d+)(?=[\s{])/g, (all, g) => {
      const attrs = groups.get(g);
      if (attrs === undefined) return all;
      const freed = attrs.replace(MEMORY_EFFECTS, '');
      if (freed === attrs) return all;
      if (!copies.has(g)) copies.set(g, { id: next++, attrs: freed });
      return ` #${copies.get(g).id}`;
    });
  });
  for (const { id, attrs } of copies.values()) out.push(`attributes #${id} = {${attrs}}`);
  return out;
}

/**
 * Add a cycle count to the start of every basic block of every function
 * defined in the module. With `profile`, every function also reports its
 * entry and exits (PlatformProfileEnter/Exit, platform/src/profile.c; the id
 * is the function's own address). `factors` corrects the model function by
 * function: {name: factor}, the file's entry of platform/tools/cpu_time.json,
 * measured against the ROM (platform/tools/calibrate.py). Code that sets its
 * own time (`timed` false: the platform's drivers) only gets the profile's
 * brackets. Every loop's back edge (a branch to a block above it) polls the
 * hardware (PlatformPoll, platform/src/clock.c), so an interrupt can arrive
 * inside a loop that touches no register, as on the GBA. Returns the new IR
 * and the number of blocks.
 */
export function addCpuTime(ir, { scale = CYCLE_SCALE, profile = false, factors = {}, timed = true } = {}) {
  const lines = forgetMemoryEffects(ir.split('\n'));
  const out = [];
  let blocks = 0;
  let inFunction = false;
  let block = null; // { at: index in out after phis, cycles }
  let counter = 0;
  let factor = 1;
  const flush = () => {
    if (timed && block && block.cycles > 0) {
      const n = Math.max(1, Math.round(block.cycles * scale * factor));
      const id = counter++;
      const add = (counterName, tag) => [
        `  %__${tag}${id} = load i64, ptr @${counterName}, align 8`,
        `  %__${tag}${id}n = add i64 %__${tag}${id}, ${n}`,
        `  store i64 %__${tag}${id}n, ptr @${counterName}, align 8`];
      // (a profile build also counts the game's own code apart)
      out.splice(block.at, 0, ...add('gPlatformCycles', 'cyc'), ...(profile ? add('gPlatformGameCycles', 'gcyc') : []));
      blocks++;
    }
    block = null;
  };
  let fnName = null;
  let labels = new Set();   // the blocks seen so far in the function
  let polls = 0;
  let pollAt = -1;          // where a switch is in out while its cases are read
  const backEdge = (text) => [...text.matchAll(/label %([-\w.$"]+)/g)].some((m) => labels.has(m[1]));
  for (const line of lines) {
    if (!inFunction) {
      out.push(line);
      if (/^define .*\{\s*$/.test(line)) {
        inFunction = true;
        labels = new Set();
        const name = /@("[^"]+"|[-\w.$]+)\(/.exec(line)?.[1];
        factor = factors[name?.replace(/^"|"$/g, '')] ?? 1;
        fnName = profile ? name : null;
        // (the profile's entry first, so the entry block's time is the function's)
        if (fnName) out.push(`  call void @PlatformProfileEnter(i32 ptrtoint (ptr @${fnName} to i32))`);
        block = { at: out.length, cycles: 0, phis: true };
      }
      continue;
    }
    if (fnName && /^\s+ret\b/.test(line)) out.push(`  call void @PlatformProfileExit(i32 ptrtoint (ptr @${fnName} to i32))`);
    if (/^\}\s*$/.test(line)) {
      flush();
      out.push(line);
      inFunction = false;
      continue;
    }
    // A label starts a block: "4:", "for.body:", optionally with "; preds = ...".
    if (/^[-\w.$"]+:(\s*;.*)?$/.test(line)) {
      flush();
      out.push(line);
      labels.add(line.slice(0, line.indexOf(':')));
      block = { at: out.length, cycles: 0, phis: true };
      continue;
    }
    // A branch back to a block above (a loop's) polls the hardware first; a
    // switch's cases follow it on lines of their own.
    if (timed && /^\s+br /.test(line) && backEdge(line)) {
      out.push('  call void @PlatformPoll()');
      polls++;
    } else if (timed && /^\s+switch /.test(line)) {
      pollAt = out.length;
    }
    if (pollAt >= 0 && backEdge(line)) {
      out.splice(pollAt, 0, '  call void @PlatformPoll()');
      polls++;
      pollAt = -1;
    }
    if (pollAt >= 0 && line.includes(']')) pollAt = -1;
    out.push(line);
    if (!block) continue;
    const t = line.trim();
    if (block.phis && (/^%\S+ = phi /.test(t) || /^%\S+ = landingpad /.test(t) || /@llvm\.dbg/.test(t) || !t || t.startsWith(';'))) {
      // Instructions go after the block's phis.
      if (/^%\S+ = phi /.test(t)) block.at = out.length;
      continue;
    }
    block.phis = false;
    if (!free(line)) block.cycles += cost(line);
  }
  let result = out.join('\n');
  if (blocks && !/^@gPlatformCycles = /m.test(result)) result += '\n@gPlatformCycles = external global i64, align 8\n';
  if (polls) result += '\ndeclare void @PlatformPoll()\n';
  if (profile) result += '\ndeclare void @PlatformProfileEnter(i32)\ndeclare void @PlatformProfileExit(i32)\n@gPlatformGameCycles = external global i64, align 8\n';
  return { ir: result, blocks };
}
