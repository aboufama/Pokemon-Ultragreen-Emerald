// Hardware registers behave like hardware.
//
// On the GBA a register is memory with side effects: reading a timer gives
// the current count, writing 1 to a bit of IF clears it, writing a DMA's
// control starts the transfer, writing a sound channel's control starts a
// note. The game reaches every register through volatile accesses (REG_*
// macros, `vu16 *` pointers), so after clang compiles a file to LLVM IR each
// volatile 8/16/32-bit load or store is replaced by a call to an inline check:
// addresses outside I/O memory load or store as before; I/O addresses go to
// the platform (PlatformIoRead / PlatformIoWrite in platform/src/io.c), which
// gives them the hardware's behavior. Other memory is untouched, so this costs
// nothing outside register accesses.

/** Split an IR operand list at top-level commas. */
function splitTop(s) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
    else if (c === ')' || c === ']' || c === '}' || c === '>') depth--;
    else if (c === '"') {
      for (i++; i < s.length && s[i] !== '"'; i++);
    } else if (c === ',' && depth === 0) {
      parts.push(s.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(s.slice(start).trim());
  return parts;
}

const TYPES = new Set(['i8', 'i16', 'i32']);

/** Keep the access's source location (a call in a function with debug info needs one). */
const dbg = (attrs) => {
  const d = attrs.find((a) => a.startsWith('!dbg '));
  return d ? `, ${d}` : '';
};
const REGION = 'I/O';

/** Where the hooks live: I/O at 0x04000000-0x04FFFFFF (the top byte 0x04). */
const IO_TOP_BYTE = 4;

function preamble(types) {
  let s = '\n; platform/tools/volatile_io.mjs: volatile accesses reach I/O through the platform\n';
  s += 'declare i32 @PlatformIoRead(i32, i32)\n';
  s += 'declare void @PlatformIoWrite(i32, i32, i32)\n';
  for (const t of types) {
    const bytes = { i8: 1, i16: 2, i32: 4 }[t];
    const ext = t === 'i32' ? '' : `\n  %w = zext ${t} %v to i32`;
    const wv = t === 'i32' ? '%v' : '%w';
    const trunc = t === 'i32' ? '' : `\n  %t = trunc i32 %r to ${t}`;
    const rv = t === 'i32' ? '%r' : '%t';
    s += `
define internal ${t} @__gba_vload_${t}(ptr %p) alwaysinline {
  %a = ptrtoint ptr %p to i32
  %hi = lshr i32 %a, 24
  %io = icmp eq i32 %hi, ${IO_TOP_BYTE}
  br i1 %io, label %slow, label %fast
fast:
  %v = load volatile ${t}, ptr %p, align 1
  ret ${t} %v
slow:
  %r = call i32 @PlatformIoRead(i32 %a, i32 ${bytes})${trunc}
  ret ${t} ${rv}
}

define internal void @__gba_vstore_${t}(ptr %p, ${t} %v) alwaysinline {
  %a = ptrtoint ptr %p to i32
  %hi = lshr i32 %a, 24
  %io = icmp eq i32 %hi, ${IO_TOP_BYTE}
  br i1 %io, label %slow, label %fast
fast:
  store volatile ${t} %v, ptr %p, align 1
  ret void
slow:${ext}
  call void @PlatformIoWrite(i32 %a, i32 ${wv}, i32 ${bytes})
  ret void
}
`;
  }
  return s;
}

/**
 * Rewrite a module's volatile loads and stores. Returns the new IR, the
 * number of accesses rewritten, and any volatile accesses of other types
 * (left as they are; none of them can be a register).
 */
export function hookVolatileIo(ir) {
  const used = new Set();
  let count = 0;
  const others = [];
  const lines = ir.split('\n');
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    if (!line.includes(' volatile ')) continue;
    let m = /^(\s*)(%[-\w.$]+) = load volatile (\S+), ptr (.*)$/.exec(line);
    if (m) {
      const [, indent, dst, type, rest] = m;
      if (!TYPES.has(type)) { others.push(line.trim()); continue; }
      const [ptr, ...attrs] = splitTop(rest);
      lines[n] = `${indent}${dst} = call ${type} @__gba_vload_${type}(ptr ${ptr})${dbg(attrs)}`;
      used.add(type);
      count++;
      continue;
    }
    m = /^(\s*)store volatile (\S+) (.*)$/.exec(line);
    if (m) {
      const [, indent, type, rest] = m;
      if (!TYPES.has(type)) { others.push(line.trim()); continue; }
      const parts = splitTop(rest);
      const value = parts[0];
      const ptr = parts[1].replace(/^ptr\s+/, '');
      lines[n] = `${indent}call void @__gba_vstore_${type}(ptr ${ptr}, ${type} ${value})${dbg(parts.slice(2))}`;
      used.add(type);
      count++;
      continue;
    }
    if (/\b(load|store) volatile\b/.test(line) || /@llvm\.mem(cpy|move|set)\.[^(]*\(.*i1 true\)/.test(line)) others.push(line.trim());
  }
  let out = lines.join('\n');
  if (used.size) out += preamble([...used].sort());
  return { ir: out, count, others, region: REGION };
}
