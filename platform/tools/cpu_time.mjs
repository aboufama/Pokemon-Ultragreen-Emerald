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

/**
 * Add a cycle count to the start of every basic block of every function
 * defined in the module. With `profile`, every function also reports its
 * entry and exits (PlatformProfileEnter/Exit, platform/src/profile.c; the id
 * is the function's own address). Returns the new IR and the number of blocks.
 */
export function addCpuTime(ir, { scale = CYCLE_SCALE, profile = false } = {}) {
  const lines = ir.split('\n');
  const out = [];
  let blocks = 0;
  let inFunction = false;
  let block = null; // { at: index in out after phis, cycles }
  let counter = 0;
  const flush = () => {
    if (block && block.cycles > 0) {
      const n = Math.max(1, Math.round(block.cycles * scale));
      const id = counter++;
      out.splice(block.at, 0,
        `  %__cyc${id} = load i64, ptr @gPlatformCycles, align 8`,
        `  %__cyc${id}n = add i64 %__cyc${id}, ${n}`,
        `  store i64 %__cyc${id}n, ptr @gPlatformCycles, align 8`);
      blocks++;
    }
    block = null;
  };
  let fnName = null;
  for (const line of lines) {
    if (!inFunction) {
      out.push(line);
      if (/^define .*\{\s*$/.test(line)) {
        inFunction = true;
        block = { at: out.length, cycles: 0, phis: true };
        fnName = profile ? /@("[^"]+"|[-\w.$]+)\(/.exec(line)?.[1] : null;
        if (fnName) out.push(`  call void @PlatformProfileEnter(i32 ptrtoint (ptr @${fnName} to i32))`);
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
      block = { at: out.length, cycles: 0, phis: true };
      continue;
    }
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
  if (profile) result += '\ndeclare void @PlatformProfileEnter(i32)\ndeclare void @PlatformProfileExit(i32)\n';
  return { ir: result, blocks };
}
