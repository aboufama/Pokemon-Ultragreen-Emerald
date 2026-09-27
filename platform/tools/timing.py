#!/usr/bin/env python3
"""How long functions take on the GBA: runs the decomp's ROM in mGBA
instruction by instruction and reports, for each call of the named functions,
the CPU cycles from entry to return. The platform's replacement drivers
(platform/game) spend these times, so the game's timeline (when the first
frame starts, which VBlanks happen during the boot) is the GBA's.

    python3 platform/tools/timing.py IdentifyFlash RtcInit SiiRtcGetDateTime --frames 20
"""

import argparse
import os
import subprocess

import mgba.core
import mgba.log
from mgba._pylib import lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DECOMP = os.path.join(ROOT, 'decomp/pokeemerald')


def symbols(elf):
    out = subprocess.run(['arm-none-eabi-nm', elf], capture_output=True, text=True, check=True).stdout
    table = {}
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[1] in 'Tt':
            table[parts[2]] = int(parts[0], 16) & ~1
    return table


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('functions', nargs='+')
    ap.add_argument('--frames', type=int, default=20, help='stop after this many frames')
    ap.add_argument('--max-calls', type=int, default=3)
    args = ap.parse_args()
    syms = symbols(os.path.join(DECOMP, 'pokeemerald_modern.elf'))
    targets = {syms[f]: f for f in args.functions}
    mgba.log.silence()
    core = mgba.core.load_path(os.path.join(DECOMP, 'pokeemerald_modern.gba'))
    core.reset()
    timing = core._core.timing
    open_calls = []  # (name, return address, start cycle, frame)
    counts = {}
    while core.frame_counter < args.frames:
        core.step()
        pc = core.cpu.pc
        now = lib.mTimingGlobalTime(timing)
        # Thumb: pc is the instruction address + 4 after a step (the pipeline).
        here = pc - 4 if pc & 2 == 0 else pc - 4
        for addr in (pc - 4, pc - 2):
            name = targets.get(addr)
            if name and counts.get(name, 0) < args.max_calls:
                counts[name] = counts.get(name, 0) + 1
                open_calls.append((name, core.cpu.gprs[14] & ~1, now, core.frame_counter))
                break
        while open_calls and (pc - 4 == open_calls[-1][1] or pc - 2 == open_calls[-1][1]):
            name, _, start, frame = open_calls.pop()
            print(f'{name}: {now - start} cycles (frame {frame})', flush=True)
    for name, _, start, frame in open_calls:
        print(f'{name}: still running after frame {args.frames} (started frame {frame})')


if __name__ == '__main__':
    main()
