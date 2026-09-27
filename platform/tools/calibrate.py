#!/usr/bin/env python3
"""Calibrate the CPU time model (tools/cpu_time.mjs) function by function
against the GBA ROM.

The model gives each basic block of the game's code its instructions' cost
times one scale; the GBA's Thumb code, compiled by another compiler, runs some
functions faster and some slower than that. This runs the compiled game's
profile build (node platform/build.mjs --profile; tools/profile.mjs) and the
decomp's ROM in mGBA on the same input script, measures each function's own
time on both (its inclusive time less the calls to the other functions
measured, and the interrupts it was interrupted by), and corrects the model
for the functions where they differ: their blocks cost `factor` times more
(platform/tools/cpu_time.json, which the build reads; rebuild after).

    python3 platform/tools/calibrate.py --script platform/tests/title.json [--functions 400]

The functions measured are those with the most time of their own on the
compiled game (the ROM's breakpoints are checked one by one), less those the
ROM's compiler inlined or that share a name. Where one compiler inlined some
calls and the other kept them (clang puts AllocSpriteTiles(0) inside
ResetSpriteData), those calls count as the caller's time on both sides: the
calls are counted by caller and callee on both. A function's own time includes
the platform's work it does (BIOS calls, DMA, the sound engine), which is
timed as the GBA's already: only its own code's part is corrected, and only
where it is a fair part of the function's time (in LoadOam, a BIOS copy with
a few instructions around it, the difference is the copy's, not the code's).
The platform's stand-ins for the GBA's code (the drivers, the sound engine's
assembly half) are measured on both sides too, so that they count in neither
their callers' own time; they are not corrected.

    python3 platform/tools/calibrate.py --script S --measured build/calibrate/measured.json

corrects again from the last measurements (after changing these rules).
"""

import argparse
import json
import os
import re
import subprocess
import sys

import mgba.core
import mgba.log
from mgba._pylib import ffi, lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DECOMP = os.path.join(ROOT, 'decomp/pokeemerald')
FACTORS = os.path.join(ROOT, 'platform/tools/cpu_time.json')
KEYS = {'A': 0, 'B': 1, 'SELECT': 2, 'START': 3, 'RIGHT': 4, 'LEFT': 5, 'UP': 6, 'DOWN': 7, 'R': 8, 'L': 9}
# Functions not timed as game code: the main loop's wait (the platform's
# here), and busy waits on the hardware.
SKIP = {'AgbMain', 'WaitForVBlank', 'SampleFreqSet'}
PAIR_KEYS = ('calls', 'cycles', 'code', 'self', 'selfCode')


def profile(script, wasm, counted=None):
    """Our profile build: {name: {calls, cycles, self, code}} (names shared by
    several functions are summed), and the calls by caller and callee:
    {(caller, callee): {calls, cycles, code, self, selfCode}}."""
    out = os.path.join(ROOT, 'build/calibrate')
    os.makedirs(out, exist_ok=True)
    cmd = ['node', os.path.join(ROOT, 'platform/tools/profile.mjs'), '--script', script, '--wasm', wasm,
           '--top', '0', '--json', os.path.join(out, 'profile.json'), '--pairs', os.path.join(out, 'pairs.json')]
    if counted is not None:
        with open(os.path.join(out, 'counted.txt'), 'w') as f:
            f.write('\n'.join(sorted(counted)))
        cmd += ['--counted', os.path.join(out, 'counted.txt')]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    rows = {}
    with open(os.path.join(out, 'profile.json')) as f:
        for r in json.load(f):
            t = rows.setdefault(r['name'], {'calls': 0, 'cycles': 0, 'self': 0, 'code': 0, 'count': 0})
            for k in ('calls', 'cycles', 'self', 'code'):
                t[k] += r[k]
            t['count'] += 1
    pairs = {}
    with open(os.path.join(out, 'pairs.json')) as f:
        for r in json.load(f):
            t = pairs.setdefault((r['caller'], r['callee']), dict.fromkeys(PAIR_KEYS, 0))
            for k in PAIR_KEYS:
                t[k] += r[k]
    return rows, pairs


def wasm_files(map_path, where='src'):
    """Function name -> the source files that define one (the wasm map): the
    game's (src), or the platform's (platform)."""
    files = {}
    with open(map_path) as f:
        for line in f:
            m = re.search(r'/obj/(' + where + r'/\S+?)\.o:\((\w+)\)$', line.strip())
            if m:
                files.setdefault(m.group(2), set()).add(m.group(1) + '.c')
    return files


def rom_functions():
    """Function name -> address on the ROM (names defined once)."""
    nm = subprocess.run(['arm-none-eabi-nm', os.path.join(DECOMP, 'pokeemerald_modern.elf')],
                        capture_output=True, text=True, check=True).stdout
    seen = {}
    for line in nm.splitlines():
        p = line.split()
        if len(p) == 3 and p[1] in 'Tt':
            seen.setdefault(p[2], set()).add(int(p[0], 16) & ~1)
    return {n: a.pop() for n, a in seen.items() if len(a) == 1}


def interrupt_return():
    """Where the game's interrupt handlers return to: IntrMain_RetAddr in the
    copy of IntrMain that the ROM runs from IWRAM (IntrMain_Buffer)."""
    nm = subprocess.run(['arm-none-eabi-nm', os.path.join(DECOMP, 'pokeemerald_modern.elf')],
                        capture_output=True, text=True, check=True).stdout
    syms = {p[2]: int(p[0], 16) for p in (line.split() for line in nm.splitlines()) if len(p) == 3}
    return syms['IntrMain_Buffer'] + syms['IntrMain_RetAddr'] - syms['IntrMain']


def inline(stats, pairs, caller, callee):
    """Count a caller's calls to a callee as the caller's own time: the
    callee's own time in them moves to the caller, and the calls the callee
    made in them become the caller's (as they are where it was inlined)."""
    p = pairs.pop((caller, callee))
    f, g = stats[callee], stats[caller]
    share = p['calls'] / f['calls']    # of all the callee's calls
    g['self'] += p['self']
    f['calls'] -= p['calls']
    f['cycles'] -= p['cycles']
    f['self'] -= p['self']
    if 'selfCode' in p:
        g['code'] += p['selfCode']
        f['code'] -= p['selfCode']
    for key in [k for k in pairs if k[0] == callee and k[1] != callee]:
        q = pairs[key]
        t = pairs.setdefault((caller, key[1]), dict.fromkeys(q, 0))
        for x in q:
            t[x] += q[x] * share
            q[x] -= q[x] * share


def reconcile(ours, ours_pairs, theirs, rom_pairs, handlers):
    """One compiler inlines calls the other keeps: count those calls as the
    caller's own time on both sides. A caller whose calls to a function one
    side makes and the other never does (the compiler inlined them there) has
    them counted as its own on the side that makes them. Callers first, so
    that the calls a function inlined into another makes are its new
    caller's. Interrupt handlers are left as they are (the function an
    interrupt lands in is the timing's doing, not the compiler's)."""
    def inlined():
        found = []
        for key in set(ours_pairs) | set(rom_pairs):
            caller, callee = key
            if caller == callee or callee in handlers or not all(n in ours and n in theirs for n in key):
                continue
            o = ours_pairs.get(key, {}).get('calls', 0)
            r = rom_pairs.get(key, {}).get('calls', 0)
            if r >= 0.5 and o < 0.5:
                found.append((key, theirs, rom_pairs))
            elif o >= 0.5 and r < 0.5:
                found.append((key, ours, ours_pairs))
        return found
    while True:
        found = inlined()
        if not found:
            return
        callees = {key[1] for key, _, _ in found}
        # (the callers no other inlined call leads to; all of them if they
        # call each other round)
        first = [f for f in found if f[0][0] not in callees] or found
        for key, stats, pairs in first:
            if key in pairs:
                inline(stats, pairs, *key)


def rom_profile(script, functions, frames, interrupt_return):
    """The ROM's {name: {calls, cycles, self}} for the named functions, from
    breakpoints at their entries and at the addresses they return to; the
    calls by caller and callee, {(caller, callee): {calls, cycles, self}}
    (interrupts apart); and the functions called as interrupt handlers (those
    that return to IntrMain)."""
    mgba.log.silence()
    core = mgba.core.load_path(os.path.join(DECOMP, 'pokeemerald_modern.gba'))
    core.reset()
    dbg = ffi.new('struct mDebugger*')
    lib.mDebuggerAttach(dbg, core._core)
    cpu = core.cpu._native
    points = {}   # address -> [breakpoint, id, uses]
    entries = {addr: name for name, addr in functions.items()}
    stack = []    # [name, return address, sp, start, callees]
    table = {name: {'calls': 0, 'cycles': 0, 'self': 0} for name in functions}
    pairs = {}
    handlers = set()

    def hold(addr):
        if addr in points:
            points[addr][2] += 1
            return
        bp = ffi.new('struct mBreakpoint*')
        bp.address = addr
        bp.segment = -1
        bp.type = lib.BREAKPOINT_HARDWARE
        points[addr] = [bp, dbg.platform.setBreakpoint(dbg.platform, bp), 1]

    def release(addr):
        p = points[addr]
        p[2] -= 1
        if p[2] == 0 and addr not in entries:
            dbg.platform.clearBreakpoint(dbg.platform, p[1])
            del points[addr]

    for addr in entries:
        hold(addr)

    @ffi.callback('void(struct mDebugger *, enum mDebuggerEntryReason, struct mDebuggerEntryInfo *)')
    def entered(d, reason, info):
        if reason == lib.DEBUGGER_ENTER_BREAKPOINT:
            pc = info.address
            now = lib.mTimingGlobalTime(core._core.timing)
            sp = cpu.gprs[13]
            while stack and stack[-1][1] == pc and sp >= stack[-1][2]:
                name, ret, _, start, callees = stack.pop()
                release(ret)
                total = now - start
                t = table[name]
                t['calls'] += 1
                t['cycles'] += total
                t['self'] += total - callees
                if ret == interrupt_return:
                    handlers.add(name)
                elif stack:
                    p = pairs.setdefault((stack[-1][0], name), {'calls': 0, 'cycles': 0, 'self': 0})
                    p['calls'] += 1
                    p['cycles'] += total
                    p['self'] += total - callees
                if stack:
                    stack[-1][4] += total
            if pc in entries:
                ret = cpu.gprs[14] & ~1
                stack.append([entries[pc], ret, sp, now, 0])
                hold(ret)
        d.state = lib.DEBUGGER_RUNNING

    dbg.entered = entered
    dbg.state = lib.DEBUGGER_RUNNING
    inputs = {f: [KEYS[k.upper()] for k in t.replace(',', '+').replace(' ', '+').split('+') if k]
              for f, t in script.get('inputs', [])}
    keys = []
    for f in range(1, frames + 1):
        if f in inputs:
            keys = inputs[f]
        core.clear_keys(*KEYS.values())
        if keys:
            core.set_keys(*keys)
        lib.mDebuggerRunFrame(dbg)
    return table, pairs, handlers


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--script', required=True)
    ap.add_argument('--functions', type=int, default=400, help='how many functions to measure')
    ap.add_argument('--wasm', default=os.path.join(ROOT, 'build/wasm-profile/pokeemerald.wasm'))
    ap.add_argument('--map', default=os.path.join(ROOT, 'build/wasm-profile/pokeemerald.map'))
    ap.add_argument('--dry-run', action='store_true', help='report, but leave cpu_time.json as it is')
    ap.add_argument('--measured', help='use these measurements (build/calibrate/measured.json) instead of measuring')
    args = ap.parse_args()
    with open(args.script) as f:
        script = json.load(f)
    script_path = os.path.abspath(args.script)
    measured = os.path.join(ROOT, 'build/calibrate/measured.json')

    files = wasm_files(args.map)
    if args.measured:
        with open(args.measured) as f:
            m = json.load(f)
        chosen, ours, theirs, handlers = m['chosen'], m['ours'], m['rom'], set(m['handlers'])
        ours_pairs = {tuple(k.split('>')): v for k, v in m['ours_pairs'].items()}
        rom_pairs = {tuple(k.split('>')): v for k, v in m['rom_pairs'].items()}
    else:
        rom = rom_functions()
        # The functions with the most time of their own here, that the ROM has
        # (not inlined there) and that one name names.
        ours, _ = profile(script_path, args.wasm)
        usable = [n for n, r in ours.items() if n in rom and n not in SKIP and len(files.get(n, ())) == 1 and r['count'] == 1]
        chosen = sorted(usable, key=lambda n: -ours[n]['self'])[:args.functions]
        # The platform's stand-ins for the GBA's code (platform/game: the
        # drivers, the sound engine's assembly half) are timed as the GBA's
        # already: measured on both sides too, so that their callers' own
        # time is their code's alone, but not corrected.
        stand_ins = {n: f for n, f in wasm_files(args.map, 'platform').items()
                     if all(x.startswith('platform/game/') for x in f)}
        chosen += sorted(n for n, r in ours.items() if n in rom and n not in SKIP and n not in chosen
                         and len(stand_ins.get(n, ())) == 1 and r['count'] == 1)
        print(f'{len(ours)} functions ran here; measuring the {len(chosen)} with the most time of their own'
              ' and the platform\'s stand-ins for the GBA\'s')
        ours, ours_pairs = profile(script_path, args.wasm, counted=chosen)
        theirs, rom_pairs, handlers = rom_profile(script, {n: rom[n] for n in chosen}, script['frames'], interrupt_return())
        with open(measured, 'w') as f:
            json.dump({'chosen': chosen, 'ours': ours, 'rom': theirs, 'handlers': sorted(handlers),
                       'ours_pairs': {'>'.join(k): v for k, v in ours_pairs.items()},
                       'rom_pairs': {'>'.join(k): v for k, v in rom_pairs.items()}}, f)
    reconcile(ours, ours_pairs, theirs, rom_pairs, handlers)

    factors = {}
    if os.path.exists(FACTORS):
        with open(FACTORS) as f:
            factors = json.load(f)
    changed = []
    for name in chosen:
        o, t = ours[name], theirs[name]
        if name not in files or not o['calls'] or not t['calls'] or o['code'] < 2000:
            continue
        # Per call, as the two runs may call it a different number of times.
        own, gba, code = o['self'] / o['calls'], t['self'] / t['calls'], o['code'] / o['calls']
        if code < own / 5:
            continue
        correction = (code + gba - own) / code
        # (a loop the ROM's compiler turned into a memset call runs ten
        # times faster there: the correction can be large, not absurd)
        if not 0.1 <= correction <= 10 or abs(o['calls'] - t['calls']) > 0.05 * t['calls']:
            continue
        (src,) = files[name]
        old = factors.get(src, {}).get(name, 1)
        new = round(old * correction, 3)
        if abs(new - old) >= 0.005:
            factors.setdefault(src, {})[name] = new
            changed.append((abs(gba - own) * t['calls'], name, src, old, new, o['calls'], t['calls']))
    for weight, name, src, old, new, oc, tc in sorted(changed, reverse=True)[:40]:
        print(f'  {src}:{name}: {old} -> {new} ({oc} calls here, {tc} on the ROM, {weight / tc:.0f} cycles a call apart)')
    print(f'{len(changed)} functions corrected')
    if not args.dry_run:
        with open(FACTORS, 'w') as f:
            json.dump({s: dict(sorted(v.items())) for s, v in sorted(factors.items())}, f, indent=1)
            f.write('\n')
        print(f'{os.path.relpath(FACTORS, ROOT)} written; rebuild (node platform/build.mjs) to use it')


if __name__ == '__main__':
    main()
