// Struct layout as the GBA build lays it out.
//
// The decomp is built with `-mabi=apcs-gnu`, whose structure size boundary is
// 32 bits: every struct and union (unless packed) is aligned to at least 4
// bytes and its size rounded up to a multiple of 4. The game's data files
// (data/*.s: maps, events, scripts, sound) are laid out by hand for that, and
// saves depend on it. Clang for wasm32 aligns structs naturally, so before
// compiling, every struct or union definition in the preprocessed source gets
// `__attribute__((aligned(4)))`, which gives the same layout. Packed structs
// are left alone (the GBA build doesn't round them either).
//
// tools/layouts.py checks the result: every struct's size and member offsets
// against the GBA build's debug info.

const ATTR = ' __attribute__((aligned(4)))';

const isIdent = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_';

/** Skip whitespace, preprocessor line markers and `__attribute__((...))` runs; returns the new index. */
function skipSpace(src, i) {
  for (;;) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === '#' && (i === 0 || src[i - 1] === '\n')) {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    return i;
  }
}

/** Index just past the parenthesized group starting at src[i] === '('. */
function skipParens(src, i) {
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") i = skipString(src, i);
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i + 1;
  }
  return i;
}

function skipString(src, i) {
  const q = src[i];
  for (i++; i < src.length; i++) {
    if (src[i] === '\\') i++;
    else if (src[i] === q) return i;
  }
  return i;
}

/** Index of the brace matching the one at src[i] === '{'. */
function matchBrace(src, i) {
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") i = skipString(src, i);
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

/** Attribute runs (`__attribute__((...))`) starting at i: [text, end]. */
function readAttributes(src, i) {
  let text = '';
  for (;;) {
    const j = skipSpace(src, i);
    const m = /^(__attribute__|__attribute)\s*\(/.exec(src.slice(j, j + 40));
    if (!m) return [text, i];
    const end = skipParens(src, j + m[0].length - 1);
    text += src.slice(j, end);
    i = end;
  }
}

const packed = (attrs) => /\b(__)?packed(__)?\b/.test(attrs);

/**
 * Add `__attribute__((aligned(4)))` to every non-packed struct/union
 * definition in preprocessed C. Returns the new text and how many definitions
 * were changed.
 */
export function apcsLayout(src) {
  let out = '';
  let last = 0;
  let count = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'") { i = skipString(src, i); continue; }
    if (c === '#' && (i === 0 || src[i - 1] === '\n')) {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c !== 's' && c !== 'u') continue;
    if (i > 0 && isIdent(src[i - 1])) continue;
    const kw = src.startsWith('struct', i) ? 'struct' : src.startsWith('union', i) ? 'union' : null;
    if (!kw || isIdent(src[i + kw.length] ?? '')) continue;
    // struct [attributes] [tag] [attributes] {
    let j = i + kw.length;
    const [before, afterBefore] = readAttributes(src, j);
    j = skipSpace(src, afterBefore);
    if (isIdent(src[j] ?? '') && !/[0-9]/.test(src[j])) {
      while (j < src.length && isIdent(src[j])) j++;
    }
    const [between, afterBetween] = readAttributes(src, j);
    j = skipSpace(src, afterBetween);
    if (src[j] !== '{') continue;
    const close = matchBrace(src, j);
    if (close < 0) continue;
    const [after] = readAttributes(src, close + 1);
    if (packed(before) || packed(between) || packed(after)) continue;
    out += src.slice(last, i + kw.length) + ATTR;
    last = i + kw.length;
    count++;
  }
  return { text: out + src.slice(last), count };
}
