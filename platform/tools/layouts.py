#!/usr/bin/env python3
"""The GBA's struct layouts, checked.

The game's data files (maps, events, scripts, sound) are laid out by hand for
the structs as the GBA build lays them out, and so are its saves. This
compares every struct and union the game defines, as the GBA build laid it
out (DWARF of decomp/pokeemerald/pokeemerald_modern.elf, `make modern
DINFO=1`) and as the WebAssembly build did (DWARF of
build/wasm/pokeemerald.debug.wasm): sizes, member offsets and bitfields.

    python3 platform/tools/layouts.py          # exit 1 on any difference
"""

import io
import os
import sys
from collections import defaultdict

from elftools.dwarf.dwarfinfo import DebugSectionDescriptor, DwarfConfig, DWARFInfo
from elftools.elf.elffile import ELFFile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
ARM_ELF = os.path.join(ROOT, 'decomp/pokeemerald/pokeemerald_modern.elf')
WASM = os.path.join(ROOT, 'build/wasm/pokeemerald.debug.wasm')

SECTIONS = ['info', 'aranges', 'abbrev', 'frame', 'eh_frame', 'str', 'loc', 'ranges', 'line', 'pubtypes',
            'pubnames', 'addr', 'str_offsets', 'line_str', 'loclists', 'rnglists', 'sup', 'gnu_debugaltlink', 'types']


def wasm_dwarf(path):
    """DWARF from a linked wasm module's custom sections."""
    with open(path, 'rb') as f:
        data = f.read()
    pos = 8
    found = {}

    def uleb():
        nonlocal pos
        result = shift = 0
        while True:
            b = data[pos]
            pos += 1
            result |= (b & 0x7F) << shift
            shift += 7
            if not b & 0x80:
                return result

    while pos < len(data):
        sid = data[pos]
        pos += 1
        size = uleb()
        end = pos + size
        if sid == 0:
            n = uleb()
            name = data[pos:pos + n].decode()
            pos += n
            if name.startswith('.debug_'):
                found[name[len('.debug_'):]] = data[pos:end]
        pos = end

    def desc(key):
        if key not in found:
            return None
        blob = found[key]
        return DebugSectionDescriptor(io.BytesIO(blob), '.debug_' + key, None, len(blob), 0)

    config = DwarfConfig(little_endian=True, machine_arch='wasm', default_address_size=4)
    return DWARFInfo(config, *[None if k in ('frame', 'eh_frame') else desc(k) for k in SECTIONS])


def member_location(die):
    attr = die.attributes.get('DW_AT_data_member_location')
    if attr is None:
        return 0
    if isinstance(attr.value, int):
        return attr.value
    # An expression: DW_OP_plus_uconst n.
    expr = attr.value
    if expr and expr[0] == 0x23:
        value, shift = 0, 0
        for b in expr[1:]:
            value |= (b & 0x7F) << shift
            shift += 7
            if not b & 0x80:
                break
        return value
    return None


def strip(die):
    """The type a DIE refers to, through typedefs and qualifiers."""
    while die is not None and die.tag in ('DW_TAG_typedef', 'DW_TAG_const_type', 'DW_TAG_volatile_type'):
        if 'DW_AT_type' not in die.attributes:
            return None
        die = die.get_DIE_from_attribute('DW_AT_type')
    return die


def layout(die, prefix=''):
    """[(member path, byte offset, bit offset, bit size)] of a struct/union, anonymous members flattened."""
    out = []
    for m in die.iter_children():
        if m.tag != 'DW_TAG_member':
            continue
        name = m.attributes['DW_AT_name'].value.decode() if 'DW_AT_name' in m.attributes else ''
        off = member_location(m)
        bits = m.attributes.get('DW_AT_bit_size')
        bit_off = None
        if bits is not None:
            if 'DW_AT_data_bit_offset' in m.attributes:
                bit_off = m.attributes['DW_AT_data_bit_offset'].value
                off = bit_off // 8
                bit_off = bit_off  # absolute bit position within the struct
            else:
                # DWARF 2/3: bit offset from the storage unit's most significant bit.
                unit = m.attributes['DW_AT_byte_size'].value if 'DW_AT_byte_size' in m.attributes else 4
                msb = m.attributes['DW_AT_bit_offset'].value
                bit_off = (off or 0) * 8 + unit * 8 - msb - bits.value
                off = bit_off // 8
        path = prefix + name
        out.append((path or '<anon>', off, bit_off, bits.value if bits else None))
        t = strip(m.get_DIE_from_attribute('DW_AT_type')) if 'DW_AT_type' in m.attributes else None
        if t is not None and not name and t.tag in ('DW_TAG_structure_type', 'DW_TAG_union_type'):
            for p, o, b, s in layout(t, prefix):
                out.append((p, (off or 0) + (o or 0), None if b is None else (off or 0) * 8 + b, s))
    return out


def collect(dwarf):
    """{'struct Name' | 'typedef Name': set of (size, layout)} for everything defined."""
    types = defaultdict(set)
    for cu in dwarf.iter_CUs():
        for die in cu.iter_DIEs():
            if die.tag in ('DW_TAG_structure_type', 'DW_TAG_union_type'):
                if die.attributes.get('DW_AT_declaration') or 'DW_AT_name' not in die.attributes:
                    continue
                kind = 'struct' if die.tag == 'DW_TAG_structure_type' else 'union'
                key = f'{kind} {die.attributes["DW_AT_name"].value.decode()}'
                types[key].add((die.attributes['DW_AT_byte_size'].value, tuple(layout(die))))
            elif die.tag == 'DW_TAG_typedef' and 'DW_AT_type' in die.attributes:
                t = die.get_DIE_from_attribute('DW_AT_type')
                if t.tag in ('DW_TAG_structure_type', 'DW_TAG_union_type') and 'DW_AT_name' not in t.attributes \
                        and not t.attributes.get('DW_AT_declaration'):
                    key = f'typedef {die.attributes["DW_AT_name"].value.decode()}'
                    types[key].add((t.attributes['DW_AT_byte_size'].value, tuple(layout(t))))
    return types


def main():
    with open(ARM_ELF, 'rb') as f:
        elf = ELFFile(f)
        if not elf.has_dwarf_info() or not elf.get_section_by_name('.debug_info').data_size > 100000:
            sys.exit(f'{ARM_ELF} has no debug info for the C files: build it with `make modern DINFO=1`')
        arm = collect(elf.get_dwarf_info())
    wasm = collect(wasm_dwarf(WASM))
    names = sorted(set(arm) | set(wasm))
    bad = 0
    compared = 0
    for name in names:
        a, w = arm.get(name), wasm.get(name)
        if a is None or w is None:
            continue  # only in one build's debug info (unused types are dropped differently)
        compared += 1
        if a != w:
            bad += 1
            if bad <= 30:
                print(f'DIFFERS {name}')
                for size, lay in sorted(a):
                    print(f'  GBA  size {size}: {lay[:12]}')
                for size, lay in sorted(w):
                    print(f'  wasm size {size}: {lay[:12]}')
    print(f'{compared} struct/union types compared, {bad} differ')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
