"""Read WebAssembly object files (clang's wasm32 .o): their symbols and the
types of the functions they define.

The data converter (elf2wasm.py) needs the exact type of every C function the
game's data points at (a script's `callnative`, a table of task functions):
in a wasm object a function is referenced by its type, and clang's objects
are where those types are decided.

    python3 wasmobj.py OBJ... > signatures.json
"""

import json
import sys

VALTYPES = {0x7F: 'i32', 0x7E: 'i64', 0x7D: 'f32', 0x7C: 'f64', 0x7B: 'v128', 0x70: 'funcref', 0x6F: 'externref'}

SYM_FUNCTION, SYM_DATA, SYM_GLOBAL, SYM_SECTION, SYM_TAG, SYM_TABLE = range(6)
FLAG_LOCAL = 0x2
FLAG_UNDEFINED = 0x10
FLAG_EXPLICIT_NAME = 0x40


class Reader:
    def __init__(self, data, pos=0, end=None):
        self.data = data
        self.pos = pos
        self.end = len(data) if end is None else end

    def byte(self):
        b = self.data[self.pos]
        self.pos += 1
        return b

    def uleb(self):
        result = shift = 0
        while True:
            b = self.byte()
            result |= (b & 0x7F) << shift
            shift += 7
            if not b & 0x80:
                return result

    def name(self):
        n = self.uleb()
        s = self.data[self.pos:self.pos + n].decode('utf-8')
        self.pos += n
        return s

    def limits(self):
        flags = self.uleb()
        self.uleb()
        if flags & 1:
            self.uleb()


def read_object(path):
    """Symbols of a wasm object: [{kind, name, defined, local, type?}]."""
    with open(path, 'rb') as f:
        data = f.read()
    if data[:4] != b'\0asm':
        raise ValueError(f'{path}: not a wasm file')
    r = Reader(data, 8)
    types = []
    func_imports = []  # type index per imported function
    func_types = []    # type index per defined function
    symbols = []
    while r.pos < len(data):
        sid = r.byte()
        size = r.uleb()
        start = r.pos
        end = start + size
        s = Reader(data, start, end)
        if sid == 1:
            for _ in range(s.uleb()):
                assert s.byte() == 0x60
                params = [VALTYPES[s.byte()] for _ in range(s.uleb())]
                results = [VALTYPES[s.byte()] for _ in range(s.uleb())]
                types.append((params, results))
        elif sid == 2:
            for _ in range(s.uleb()):
                s.name()
                s.name()
                kind = s.byte()
                if kind == 0:
                    func_imports.append(s.uleb())
                elif kind == 1:
                    s.byte()
                    s.limits()
                elif kind == 2:
                    s.limits()
                elif kind == 3:
                    s.byte()
                    s.byte()
                elif kind == 4:
                    s.byte()
                    s.uleb()
        elif sid == 3:
            func_types = [s.uleb() for _ in range(s.uleb())]
        elif sid == 0:
            name = s.name()
            if name == 'linking':
                s.uleb()  # version
                while s.pos < end:
                    sub = s.byte()
                    sub_size = s.uleb()
                    sub_end = s.pos + sub_size
                    if sub == 8:
                        for _ in range(s.uleb()):
                            kind = s.byte()
                            flags = s.uleb()
                            sym = {'kind': kind, 'defined': not flags & FLAG_UNDEFINED, 'local': bool(flags & FLAG_LOCAL)}
                            if kind in (SYM_FUNCTION, SYM_GLOBAL, SYM_TAG, SYM_TABLE):
                                index = s.uleb()
                                if sym['defined'] or flags & FLAG_EXPLICIT_NAME:
                                    sym['name'] = s.name()
                                if kind == SYM_FUNCTION:
                                    if index < len(func_imports):
                                        sym['type'] = types[func_imports[index]]
                                    else:
                                        sym['type'] = types[func_types[index - len(func_imports)]]
                            elif kind == SYM_DATA:
                                sym['name'] = s.name()
                                if sym['defined']:
                                    s.uleb()
                                    s.uleb()
                                    s.uleb()
                            elif kind == SYM_SECTION:
                                s.uleb()
                            symbols.append(sym)
                    s.pos = sub_end
        r.pos = end
    # Imported functions without an explicit name take the import's field name;
    # they are references, not definitions, so their names are not needed here.
    return symbols


def defined_functions(paths):
    """{name: [params, results]} for every global function the objects define."""
    out = {}
    for path in paths:
        for sym in read_object(path):
            if sym['kind'] == SYM_FUNCTION and sym['defined'] and not sym['local'] and 'name' in sym:
                out[sym['name']] = sym['type']
    return out


def defined_data(paths):
    """Names of the global data symbols the objects define."""
    out = set()
    for path in paths:
        for sym in read_object(path):
            if sym['kind'] == SYM_DATA and sym['defined'] and not sym['local']:
                out.add(sym['name'])
    return out


if __name__ == '__main__':
    json.dump(defined_functions(sys.argv[1:]), sys.stdout, indent=0, sort_keys=True)
