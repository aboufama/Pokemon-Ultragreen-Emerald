"""The game's assembled data, as WebAssembly objects.

The decomp's data (data/*.s: event, battle, animation and AI scripts, maps,
sound; the songs from sound/songs/midi) is assembled by the decomp's own
build (arm-none-eabi-as and its macros) into ARM ELF objects. This converts
each object to LLVM wasm assembly with the same bytes and the same symbols,
every pointer a relocation, for clang to assemble into a wasm object:

- each allocated section becomes a data segment (its bytes through .incbin,
  so they are exactly the assembler's);
- global labels stay global symbols; everything else is addressed from a
  local symbol at its section's start;
- R_ARM_ABS32 relocations become 32-bit address relocations, or function
  table relocations when the target is a C function (a script's callnative,
  a table of task functions), declared with the type clang gave it
  (signatures JSON from wasmobj.py);
- relocations against absolute symbols (constants such as SPECIAL_* that
  another data file defines with .set) are resolved here;
- branch relocations in code (the ROM header's jump to crt0) are dropped:
  that code is never run.

    python3 elf2wasm.py --signatures sig.json --out DIR OBJ...
"""

import argparse
import json
import os
import re
import sys

from elftools.elf.elffile import ELFFile
from elftools.elf.relocation import RelocationSection

R_ARM_ABS32 = 2
R_ARM_ABS16 = 5
R_ARM_ABS8 = 8
CODE_RELOCS = {1, 10, 11, 28, 29, 30, 102}  # PC24, THM_CALL, THM_PC8, CALL, JUMP24, THM_JUMP24, THM_JUMP11

SHF_ALLOC = 0x2
SHF_WRITE = 0x1


def sanitize(name):
    return re.sub(r'[^A-Za-z0-9_]', '_', name).strip('_') or 'sec'


def expr(name, addend):
    if addend == 0:
        return name
    return f'{name}+{addend}' if addend > 0 else f'{name}-{-addend}'


class Converter:
    def __init__(self, signatures):
        self.signatures = signatures
        self.absolutes = {}
        self.warnings = []

    def scan_absolutes(self, paths):
        """Global absolute symbols (.set constants) across all the objects."""
        for path in paths:
            with open(path, 'rb') as f:
                elf = ELFFile(f)
                symtab = elf.get_section_by_name('.symtab')
                for sym in symtab.iter_symbols():
                    if sym['st_shndx'] == 'SHN_ABS' and sym['st_info']['bind'] == 'STB_GLOBAL':
                        self.absolutes[sym.name] = sym['st_value']

    def convert(self, path, out_dir, prefix):
        with open(path, 'rb') as f:
            elf = ELFFile(f)
            symtab = elf.get_section_by_name('.symtab')
            sections = {}
            for index, sec in enumerate(elf.iter_sections()):
                if sec['sh_flags'] & SHF_ALLOC and sec['sh_size'] > 0:
                    sections[index] = sec
            start_sym = {i: f'__e2w_{prefix}_{sanitize(s.name)}' for i, s in sections.items()}

            # Global labels per section.
            labels = {i: [] for i in sections}
            for sym in symtab.iter_symbols():
                shndx = sym['st_shndx']
                if isinstance(shndx, int) and shndx in sections and sym['st_info']['bind'] == 'STB_GLOBAL' and sym['st_info']['type'] != 'STT_SECTION':
                    labels[shndx].append((sym['st_value'], sym.name))

            # Relocations per section: {offset: text of the 32-bit value}.
            relocs = {i: {} for i in sections}
            patched = {i: bytearray(s.data()) if s['sh_type'] != 'SHT_NOBITS' else None for i, s in sections.items()}
            functypes = {}
            for rsec in elf.iter_sections():
                if not isinstance(rsec, RelocationSection):
                    continue
                target = rsec['sh_info']
                if target not in sections:
                    continue
                data = patched[target]
                for rel in rsec.iter_relocations():
                    off = rel['r_offset']
                    rtype = rel['r_info_type']
                    sym = symtab.get_symbol(rel['r_info_sym'])
                    where = f'{path}:{sections[target].name}+{off:#x}'
                    if rtype in CODE_RELOCS:
                        self.warnings.append(f'{where}: branch to {sym.name or "?"} dropped (code is not run)')
                        continue
                    size = {R_ARM_ABS32: 4, R_ARM_ABS16: 2, R_ARM_ABS8: 1}.get(rtype)
                    if size is None:
                        raise SystemExit(f'{where}: unsupported relocation type {rtype}')
                    addend = int.from_bytes(data[off:off + size], 'little', signed=True)
                    shndx = sym['st_shndx']
                    # A constant: resolve now.
                    value = None
                    if shndx == 'SHN_ABS':
                        value = sym['st_value'] + addend
                    elif shndx == 'SHN_UNDEF' and sym.name in self.absolutes:
                        value = self.absolutes[sym.name] + addend
                    if value is not None:
                        data[off:off + size] = (value & ((1 << (8 * size)) - 1)).to_bytes(size, 'little')
                        continue
                    if size != 4:
                        raise SystemExit(f'{where}: {size}-byte relocation against {sym.name}, which is not a constant')
                    if sym['st_info']['type'] == 'STT_SECTION' or (isinstance(shndx, int) and shndx in sections):
                        # Something in this object: from its section's start.
                        sec_index = shndx
                        base = 0 if sym['st_info']['type'] == 'STT_SECTION' else sym['st_value']
                        if sec_index not in sections:
                            raise SystemExit(f'{where}: relocation into an unallocated section')
                        relocs[target][off] = expr(start_sym[sec_index], base + addend)
                    elif shndx == 'SHN_UNDEF':
                        name = sym.name
                        if name in self.signatures:
                            if addend:
                                raise SystemExit(f'{where}: function {name} referenced with offset {addend}')
                            functypes[name] = self.signatures[name]
                            relocs[target][off] = name
                        else:
                            relocs[target][off] = expr(name, addend)
                    else:
                        raise SystemExit(f'{where}: relocation against {sym.name} in section {shndx}')

            lines = [f'# {os.path.relpath(path)} converted by platform/tools/elf2wasm.py', '']
            for name in sorted(functypes):
                params, results = functypes[name]
                lines.append(f'\t.functype\t{name} ({", ".join(params)}) -> ({", ".join(results)})')
            for index in sorted(sections):
                sec = sections[index]
                nobits = sec['sh_type'] == 'SHT_NOBITS'
                kind = 'bss' if nobits else ('data' if sec['sh_flags'] & SHF_WRITE else 'rodata')
                size = sec['sh_size']
                align = max(0, (sec['sh_addralign'] or 1).bit_length() - 1)
                sym0 = start_sym[index]
                lines += ['', f'\t.section\t.{kind}.{sym0},"",@', f'\t.p2align\t{align}', f'{sym0}:', f'\t.size\t{sym0}, {size}']
                marks = sorted(labels[index])
                sizes = {}
                for k, (value, name) in enumerate(marks):
                    nxt = marks[k + 1][0] if k + 1 < len(marks) else size
                    sizes[name] = max(0, nxt - value)
                events = sorted([(v, 0, n) for v, n in marks] + [(o, 1, t) for o, t in relocs[index].items()])
                if nobits:
                    pos = 0
                    for value, _, name in events:
                        if value > pos:
                            lines.append(f'\t.skip\t{value - pos}')
                            pos = value
                        lines += [f'\t.globl\t{name}', f'{name}:', f'\t.size\t{name}, {sizes[name]}']
                    if size > pos:
                        lines.append(f'\t.skip\t{size - pos}')
                    continue
                blob = f'{prefix}.{sanitize(sec.name)}.bin'
                with open(os.path.join(out_dir, blob), 'wb') as bf:
                    bf.write(patched[index])
                pos = 0
                for value, is_reloc, text in events:
                    if value > pos:
                        lines.append(f'\t.incbin\t"{blob}", {pos}, {value - pos}')
                        pos = value
                    if is_reloc:
                        lines.append(f'\t.int32\t{text}')
                        pos += 4
                    else:
                        lines += [f'\t.globl\t{text}', f'{text}:', f'\t.size\t{text}, {sizes[text]}']
                if size > pos:
                    lines.append(f'\t.incbin\t"{blob}", {pos}, {size - pos}')
            with open(os.path.join(out_dir, prefix + '.s'), 'w') as sf:
                sf.write('\n'.join(lines) + '\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--signatures', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--root', default='.', help='object paths are named relative to this')
    ap.add_argument('objects', nargs='+')
    args = ap.parse_args()
    with open(args.signatures) as f:
        signatures = json.load(f)
    os.makedirs(args.out, exist_ok=True)
    conv = Converter(signatures)
    conv.scan_absolutes(args.objects)
    for path in args.objects:
        rel = os.path.relpath(path, args.root)
        conv.convert(path, args.out, sanitize(os.path.splitext(rel)[0]))
    for w in conv.warnings:
        print('elf2wasm: ' + w, file=sys.stderr)


if __name__ == '__main__':
    main()
