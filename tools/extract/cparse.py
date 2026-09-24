"""Minimal parsers for the C data tables in pret/pokeemerald.

The decomp keeps game data as designated initializers, e.g.

    [SPECIES_BLAZIKEN] =
    {
        .baseHP = 80,
        .types = { TYPE_FIRE, TYPE_FIGHTING },
        ...
    },

These helpers are deliberately small: they understand balanced braces,
string literals, #defines/enums and designated initializers, which is all the
data headers use. They are not a general C parser.
"""

from __future__ import annotations

import re
from pathlib import Path

_COMMENT_RE = re.compile(r"//[^\n]*|/\*.*?\*/", re.S)


def strip_comments(src: str) -> str:
    # Keep string literals intact: comments never appear inside _("...") strings
    # in these data files, so a regex pass is sufficient.
    return _COMMENT_RE.sub("", src)


def read(path: Path) -> str:
    return strip_comments(path.read_text(encoding="utf-8"))


def parse_defines(src: str) -> dict[str, str]:
    """Collect simple object-like #defines (NAME value)."""
    out: dict[str, str] = {}
    for m in re.finditer(r"^\s*#define\s+([A-Za-z_]\w*)\s+([^\n]+?)\s*$", src, re.M):
        out[m.group(1)] = m.group(2).strip()
    return out


def parse_enum_values(src: str, prefix: str) -> dict[str, int]:
    """Parse enum bodies and assign implicit values; only keep names with `prefix`."""
    out: dict[str, int] = {}
    for body in re.findall(r"enum\s*\w*\s*\{(.*?)\}", src, re.S):
        value = -1
        for item in body.split(","):
            item = item.strip()
            if not item:
                continue
            if "=" in item:
                name, expr = (s.strip() for s in item.split("=", 1))
                try:
                    value = int(eval_expr(expr, out))
                except ValueError:
                    continue
            else:
                name = item
                value += 1
            if name.startswith(prefix):
                out[name] = value
    return out


def eval_expr(expr: str, symbols: dict[str, int | float | str]) -> int | float:
    """Evaluate a small integer constant expression using known symbols."""
    expr = expr.strip()

    def repl(m: re.Match[str]) -> str:
        name = m.group(0)
        if name in symbols:
            v = symbols[name]
            if isinstance(v, str):
                return f"({eval_expr(v, symbols)})"
            return str(v)
        raise ValueError(f"unknown symbol {name!r} in {expr!r}")

    py = re.sub(r"(?<!\w)[A-Za-z_]\w*", repl, expr)
    py = py.replace("/", "//")
    if not re.fullmatch(r"[\d\s()+\-*/<>|&^~x.a-fA-F]*", py):
        raise ValueError(f"unsafe expression {expr!r}")
    return eval(py, {"__builtins__": {}}, {})  # noqa: S307 - vetted by the regex above


def resolve_defines(defines: dict[str, str]) -> dict[str, int]:
    """Resolve every #define that evaluates to an integer (iteratively)."""
    resolved: dict[str, int] = {}
    pending = dict(defines)
    for _ in range(8):
        progressed = False
        for name, expr in list(pending.items()):
            try:
                value = eval_expr(expr, {**resolved})
            except (ValueError, SyntaxError, TypeError, ZeroDivisionError, NameError):
                continue
            if isinstance(value, (int, float)):
                resolved[name] = int(value)
                del pending[name]
                progressed = True
        if not progressed:
            break
    return resolved


def match_brace(src: str, start: int) -> int:
    """Given index of an opening '{', return the index just past its match."""
    depth = 0
    i = start
    in_str = False
    while i < len(src):
        c = src[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == '"':
                in_str = False
        elif c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced braces")


def split_top_level(body: str, sep: str = ",") -> list[str]:
    """Split on `sep` ignoring separators nested in braces/parens/strings."""
    parts: list[str] = []
    depth = 0
    in_str = False
    cur = []
    i = 0
    while i < len(body):
        c = body[i]
        if in_str:
            cur.append(c)
            if c == "\\" and i + 1 < len(body):
                cur.append(body[i + 1])
                i += 2
                continue
            if c == '"':
                in_str = False
        elif c == '"':
            in_str = True
            cur.append(c)
        elif c in "{(":
            depth += 1
            cur.append(c)
        elif c in "})":
            depth -= 1
            cur.append(c)
        elif c == sep and depth == 0:
            parts.append("".join(cur).strip())
            cur = []
        else:
            cur.append(c)
        i += 1
    tail = "".join(cur).strip()
    if tail:
        parts.append(tail)
    return parts


def parse_struct_fields(body: str) -> dict[str, str]:
    """Parse `.field = value, ...` (body without the outer braces)."""
    fields: dict[str, str] = {}
    for part in split_top_level(body):
        m = re.match(r"\.(\w+)\s*=\s*(.*)$", part, re.S)
        if m:
            fields[m.group(1)] = m.group(2).strip()
    return fields


def parse_designated_table(src: str, table_name: str | None = None) -> dict[str, str]:
    """Return {KEY: raw_value} for `[KEY] = value` entries.

    If table_name is given, only the initializer of that array is scanned.
    """
    if table_name is not None:
        m = re.search(re.escape(table_name) + r"\s*\[[^\]]*\](?:\s*\[[^\]]*\])*\s*=\s*\{", src)
        if not m:
            raise ValueError(f"table {table_name} not found")
        start = m.end() - 1
        src = src[start + 1 : match_brace(src, start) - 1]
    out: dict[str, str] = {}
    for part in split_top_level(src):
        m = re.match(r"\[\s*([^\]]+?)\s*\]\s*=\s*(.*)$", part, re.S)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out


def parse_string_literal(value: str) -> str:
    """Decode `_("TEXT")` / `COMPOUND_STRING("TEXT")` / "TEXT" into plain text."""
    parts = re.findall(r'"((?:[^"\\]|\\.)*)"', value)
    return "".join(parts)


def brace_list(value: str) -> list[str]:
    value = value.strip()
    if value.startswith("{") and value.endswith("}"):
        value = value[1:-1]
    return [v for v in split_top_level(value) if v]
