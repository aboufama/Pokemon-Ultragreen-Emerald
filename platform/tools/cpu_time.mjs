// The game's own code takes time, as on the GBA.
//
// Compiled natively, the game's C runs in no time on the platform's clock:
// only register polls, BIOS calls and DMA would move it. But the GBA's
// timeline depends on how long the code runs: a long computation delays the
// next frame (a lag frame), and the game's register manager applies a write
// at once or at the next VBlank depending on where the scanline is. So every
// basic block of the game's LLVM IR adds its cost to the platform's clock
// (gPlatformCycles) as it runs: each instruction's ARM7TDMI cost, roughly,
// by kind, added before each call and register access for the instructions
// up to it. The hardware catches up at the next register access, BIOS call
// or DMA (platform/src/clock.c). CYCLE_SCALE is calibrated against the GBA ROM:
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
  if (division(t)) return division(t).shifts ?? 1;          // shifts, or the call to libgcc (its time: DIVISION)
  if (/^(%\S+ = )?mul /.test(t)) return 3;
  return 1;
}

// Thumb has no divide instruction, and no long multiply to divide by a
// constant with: the game's divisions and remainders call libgcc's
// __divsi3, __udivsi3, __modsi3 and __umodsi3 (but for a power of two, which
// is shifts). Their time depends on the operands, as measured on the ROM
// call by call over the opening (40000 calls): a dividend no larger than the
// divisor returns at once (`le`); __divsi3 and __udivsi3 shift for a power of
// two (`pow2`); the rest is `base` and `nibble` more for every 4 bits the
// quotient has past the first 4 (the loops take 4 bits a turn). The time is
// the library's, as the copies' is: added as the division runs, from its
// operands.
const DIVISION = {
  sdiv: { le: 98, pow2: 159, base: 216, nibble: 104 },
  udiv: { le: 74, pow2: 135, base: 192, nibble: 104 },
  srem: { le: 60, base: 310, nibble: 100 },
  urem: { le: 18, base: 293, nibble: 86 },
};

/**
 * A division or remainder on this line: {kind, bits, a, b}, with {shifts}
 * (their IR cost) if it is by a power of two; or null.
 */
function division(t) {
  const m = /^(?:%\S+ = )?([su](?:div|rem)) (?:exact )?i(\d+) (.+?), (-?\d+|%[-\w.$"]+)(?:,|$)/.exec(t);
  if (!m) return null;
  const n = /^-?\d+$/.test(m[4]) ? Math.abs(Number(m[4])) : 0;
  if (n > 0 && (n & (n - 1)) === 0) return { kind: m[1], shifts: m[1][0] === 's' ? 4 : 1 };
  return { kind: m[1], bits: Number(m[2]), a: m[3], b: m[4] };
}

/**
 * The IR that adds a library division's time to the clock, from its
 * operands (DIVISION), before it runs; `id` names its values.
 */
function divisionTime({ kind, bits, a, b }, id) {
  const c = DIVISION[kind];
  const signed = kind[0] === 's';
  const out = [];
  const operand = (v, tag) => {
    let x = v;
    if (bits < 32) {
      out.push(`  %__d${tag}x${id} = ${signed ? 'sext' : 'zext'} i${bits} ${v} to i32`);
      x = `%__d${tag}x${id}`;
    }
    if (signed) {
      out.push(`  %__d${tag}a${id} = call i32 @llvm.abs.i32(i32 ${x}, i1 false)`);
      x = `%__d${tag}a${id}`;
    }
    return x;
  };
  const x = operand(a, 'a'), y = operand(b, 'b');
  out.push(`  %__dza${id} = call i32 @llvm.ctlz.i32(i32 ${x}, i1 false)`,
    `  %__dzb${id} = call i32 @llvm.ctlz.i32(i32 ${y}, i1 false)`,
    `  %__dd${id} = sub i32 %__dzb${id}, %__dza${id}`,
    `  %__dn${id} = lshr i32 %__dd${id}, 2`,
    `  %__dm${id} = mul i32 %__dn${id}, ${c.nibble}`,
    `  %__db${id} = add i32 %__dm${id}, ${c.base}`);
  let body = `%__db${id}`;
  if (c.pow2) {
    out.push(`  %__dp${id} = add i32 ${y}, -1`,
      `  %__dq${id} = and i32 ${y}, %__dp${id}`,
      `  %__dr${id} = icmp eq i32 %__dq${id}, 0`,
      `  %__ds${id} = select i1 %__dr${id}, i32 ${c.pow2}, i32 %__db${id}`);
    body = `%__ds${id}`;
  }
  out.push(`  %__dl${id} = icmp ule i32 ${x}, ${y}`,
    `  %__dt${id} = select i1 %__dl${id}, i32 ${c.le}, i32 ${body}`,
    `  %__dw${id} = zext i32 %__dt${id} to i64`,
    `  %__dc${id} = load i64, ptr @gPlatformCycles, align 8`,
    `  %__de${id} = add i64 %__dc${id}, %__dw${id}`,
    `  store i64 %__de${id}, ptr @gPlatformCycles, align 8`);
  return out;
}

/**
 * A call or a hardware access (a volatile load or store): what it does
 * happens once the code before it has run, and the code after it runs after
 * it (a call's own time, a busy wait's end, an interrupt taken there). Not
 * the compiler's intrinsics and the copies, which take no time of their own
 * on the platform's clock (the copies' cost is the time pass's: copyOf).
 */
function syncs(line) {
  const t = line.trim();
  if (/^(%\S+ = )?(load|store) volatile /.test(t)) return true;
  // (a musttail call must be followed by the ret: nothing goes after it)
  if (!/^(%\S+ = )?(tail |notail )?call /.test(t)) return false;
  const callee = /@("[^"]+"|[-\w.$]+)\(/.exec(t)?.[1]?.replace(/^"|"$/g, '');
  return !callee || !(callee.startsWith('llvm.') || /^(memcpy|memmove|memset)$/.test(callee));
}

/** Instructions that cost nothing on the GBA: SSA bookkeeping and debug records. */
function free(line) {
  const t = line.trim();
  return !t || t.startsWith(';') || t.startsWith('#') || /^%\S+ = phi /.test(t) || /@llvm\.(dbg|lifetime|assume|experimental\.noalias)/.test(t)
    || /^(%\S+ = )?(bitcast|getelementptr|freeze) /.test(t) || /^unreachable$/.test(t);
}

export const CYCLE_SCALE = 2.6;

// Copies and fills take time by their size. The game's memcpy, memmove and
// memset (the platform's C library: platform/libc) are newlib's loops on the
// GBA, measured on the ROM call by call: base cycles and 1/16 cycles a byte.
// A struct copy or fill the compiler made (llvm.memcpy, llvm.memset) is
// inline loads and stores on the GBA up to 64 bytes, and a call past that.
const LIBRARY = { memcpy: [92, 53], memmove: [92, 53], memset: [121, 26] };
const INLINE = { memcpy: [4, 12], memmove: [4, 12], memset: [2, 8] };
const INLINE_BYTES = 64;

/** Split an argument list at its top-level commas. */
function args(text) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
    else if (c === ')' || c === ']' || c === '}' || c === '>') depth--;
    else if (c === ',' && depth === 0) {
      out.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(text.slice(start).trim());
  return out;
}

/**
 * A copy or fill on this line: {kind, size} with the size a number or an SSA
 * value, and the costs [base, 1/16 a byte] to use; or null.
 */
function copyOf(line) {
  const m = /\bcall [^@]*@(llvm\.(memcpy|memmove|memset)\.[\w.]+|memcpy|memmove|memset)\((.*)\)/.exec(line);
  if (!m) return null;
  const intrinsic = m[1].startsWith('llvm.');
  const kind = intrinsic ? m[2] : m[1];
  const a = args(m[3]);
  if (a.length < 3) return null;
  const size = /^i(32|64)\s+(?:\w+\s+)*(-?\d+|%[-\w.$"]+)$/.exec(a[2]);
  if (!size) return null;
  const n = /^-?\d+$/.test(size[2]) ? Number(size[2]) : null;
  const costs = intrinsic && n !== null && n <= INLINE_BYTES ? INLINE[kind] : LIBRARY[kind];
  return { kind, bits: size[1], size: n ?? size[2], costs };
}

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
 * Add the cycles of every basic block of every function defined in the
 * module to the clock: at its start for its instructions up to its first
 * call or hardware access, then after each for those up to the next (a call
 * that waits for the hardware, as SoundInit waits for a scanline, is
 * followed by the code after it, not preceded), and each library division's
 * as it runs. With `profile`, every function also reports its entry and
 * exits (PlatformProfileEnter/Exit, platform/src/profile.c; the id is the
 * function's own address). `factors` corrects the model function by
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
  // A block's time is added in parts: from its start (after its phis) up to
  // and including its first call or hardware access, from there up to the
  // next, and the rest; each part where it starts, so a call or access comes
  // after the code before it and before the code after it.
  let block = null; // { parts: [{ at: index in out, cycles (IR units), fixed (cycles: copies) }], phis }
  const newBlock = () => ({ parts: [{ at: out.length, cycles: 0, fixed: 0 }], phis: true });
  let counter = 0;
  let factor = 1;
  const flush = () => {
    const parts = block?.parts ?? [];
    const cycles = parts.reduce((n, p) => n + p.cycles, 0);
    if (timed && (cycles > 0 || parts.some((p) => p.fixed > 0))) {
      // The block's code time is rounded once and shared among the parts as
      // their instructions add up.
      const code = cycles > 0 ? Math.max(1, Math.round(cycles * scale * factor)) : 0;
      let sum = 0, charged = 0;
      const shares = parts.map((p) => {
        sum += p.cycles;
        const upTo = cycles > 0 ? Math.round(code * sum / cycles) : 0;
        const share = upTo - charged;
        charged = upTo;
        return share;
      });
      const add = (counterName, tag, id, n) => [
        `  %__${tag}${id} = load i64, ptr @${counterName}, align 8`,
        `  %__${tag}${id}n = add i64 %__${tag}${id}, ${n}`,
        `  store i64 %__${tag}${id}n, ptr @${counterName}, align 8`];
      // (the later parts first, so the earlier ones' places hold; a profile
      // build also counts the game's own code apart, the copies being the
      // library's)
      for (let i = parts.length - 1; i >= 0; i--) {
        const n = shares[i] + parts[i].fixed;
        if (!n) continue;
        const id = counter++;
        out.splice(parts[i].at, 0, ...add('gPlatformCycles', 'cyc', id, n),
          ...(profile && shares[i] ? add('gPlatformGameCycles', 'gcyc', id, shares[i]) : []));
      }
      blocks++;
    }
    block = null;
  };
  let fnName = null;
  let labels = new Set();   // the blocks seen so far in the function
  let polls = 0;
  let divisions = 0;
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
        block = newBlock();
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
      block = newBlock();
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
    // A copy or fill of a size known only as it runs adds its time then.
    const copy = timed && block ? copyOf(line) : null;
    if (copy && typeof copy.size === 'string') {
      const id = counter++;
      const [base, perByte] = copy.costs;
      const size = copy.bits === '64' ? copy.size : `%__mz${id}`;
      if (copy.bits !== '64') out.push(`  %__mz${id} = zext i32 ${copy.size} to i64`);
      out.push(`  %__mm${id} = mul i64 ${size}, ${perByte}`,
        `  %__md${id} = lshr i64 %__mm${id}, 4`,
        `  %__mc${id} = load i64, ptr @gPlatformCycles, align 8`,
        `  %__ma${id} = add i64 %__mc${id}, %__md${id}`,
        `  %__mb${id} = add i64 %__ma${id}, ${base}`,
        `  store i64 %__mb${id}, ptr @gPlatformCycles, align 8`);
      blocks++;
    }
    // A library division adds its time as it runs, from its operands.
    const divide = timed && block ? division(line.trim()) : null;
    if (divide && !divide.shifts && divide.bits <= 32) {
      out.push(...divisionTime(divide, counter++));
      divisions++;
    }
    out.push(line);
    if (!block) continue;
    const t = line.trim();
    if (block.phis && (/^%\S+ = phi /.test(t) || /^%\S+ = landingpad /.test(t) || /@llvm\.dbg/.test(t) || !t || t.startsWith(';'))) {
      // Instructions go after the block's phis.
      if (/^%\S+ = phi /.test(t)) block.parts[0].at = out.length;
      continue;
    }
    block.phis = false;
    const part = block.parts[block.parts.length - 1];
    if (copy) {
      if (typeof copy.size === 'number') part.fixed += copy.costs[0] + ((copy.size * copy.costs[1]) >> 4);
    } else if (!free(line)) {
      part.cycles += cost(line);
    }
    if (timed && syncs(line)) block.parts.push({ at: out.length, cycles: 0, fixed: 0 });
  }
  let result = out.join('\n');
  if (blocks && !/^@gPlatformCycles = /m.test(result)) result += '\n@gPlatformCycles = external global i64, align 8\n';
  if (polls) result += '\ndeclare void @PlatformPoll()\n';
  // (the intrinsics the divisions' time uses, unless the module has them)
  for (const d of divisions ? ['declare i32 @llvm.abs.i32(i32, i1)', 'declare i32 @llvm.ctlz.i32(i32, i1)'] : [])
    if (!result.includes(d.slice(0, d.indexOf('(') + 1))) result += `\n${d}\n`;
  if (profile) result += '\ndeclare void @PlatformProfileEnter(i32)\ndeclare void @PlatformProfileExit(i32)\n@gPlatformGameCycles = external global i64, align 8\n';
  return { ir: result, blocks };
}
