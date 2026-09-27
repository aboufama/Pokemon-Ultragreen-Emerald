#!/usr/bin/env python3
"""Check the sound against the GBA ROM: the compiled game (the sound engine's
assembly half ported to C, platform/game/m4a_1.c, and the sound chip,
platform/src/apu.c) and the decomp's own ROM in mGBA, run with the same input
script (as run.mjs and reference.py run it), frame by frame:

  (a) the sequencer: the music players (gMPlayInfo_BGM, SE1-3, the cries'),
      their tracks, the DirectSound and GB channels and the rest of
      gSoundInfo equal the ROM's at every VBlank. Pointers are compared by
      what they point to: a variable (name and offset), a place in a data
      object (a song's commands, a sample), a function.
  (b) the mixer: gSoundInfo.pcmBuffer equals the ROM's, byte for byte: the
      part the mixer wrote in each VBlank, and the whole buffer.
  (c) the GB channels: the writes to the sound registers (0x60-0x9F: the GB
      channels, the mixing, SOUNDBIAS, the wave RAM) in each frame equal the
      ROM's, byte by byte in order (mGBA's write watchpoints).
  (d) the sound: both runs' audio (mGBA's through its bindings, at the same
      65536 Hz) written to WAV files, and compared: the level, the spectrum
      over time (32 bands, 60 Hz - 16 kHz), the waveform once aligned.

A frame that differs from the ROM's same frame is also compared with the
ROM's frames up to --slack before and after (a timing shift, as
tools/compare.py allows for the picture) and reported as shifted if equal.

    python3 platform/tools/sound_check.py --script platform/tests/title.json [--out build/sound_check/title]

Build first (node platform/build.mjs). Exits non-zero if (a), (b) or (c)
differ anywhere (beyond the slack), or (d) is off (thresholds below).
"""

import argparse
import bisect
import collections
import hashlib
import json
import os
import pickle
import re
import struct
import subprocess
import sys
import time

import numpy as np

import mgba.core
import mgba.log
from mgba._pylib import ffi, lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DECOMP = os.path.join(ROOT, 'decomp/pokeemerald')
KEYS = {'A': 0, 'B': 1, 'SELECT': 2, 'START': 3, 'RIGHT': 4, 'LEFT': 5, 'UP': 6, 'DOWN': 7, 'R': 8, 'L': 9}
RATE = 65536
# The sound's gain here (10-bit DAC value x 64) and mGBA's (x 48).
GAIN_OURS, GAIN_MGBA = 64, 48
# (d)'s thresholds: the level within 5%, the bands' correlation, the waveform's.
LEVEL_RATIO = (0.95, 1.05)
MIN_BAND_CORR = 0.95
MIN_WAVE_CORR = 0.90

# ---------------------------------------------------------------- the structures

# (name, offset, size, kind): u unsigned, s signed, p a pointer or a number,
# f a function pointer.
CHANNEL_HEAD = [(n, i, 1, 'u') for i, n in enumerate(
    'statusFlags type rightVolume leftVolume attack decay sustain release key envelopeVolume'.split())]
SOUND_CHANNEL = CHANNEL_HEAD + [
    ('envelopeVolumeRight', 10, 1, 'u'), ('envelopeVolumeLeft', 11, 1, 'u'), ('pseudoEchoVolume', 12, 1, 'u'),
    ('pseudoEchoLength', 13, 1, 'u'), ('dummy1', 14, 1, 'u'), ('dummy2', 15, 1, 'u'), ('gateTime', 16, 1, 'u'),
    ('midiKey', 17, 1, 'u'), ('velocity', 18, 1, 'u'), ('priority', 19, 1, 'u'), ('rhythmPan', 20, 1, 'u'),
    ('dummy3', 21, 3, 'u'), ('count', 0x18, 4, 'u'), ('fw', 0x1C, 4, 'u'), ('frequency', 0x20, 4, 'u'),
    ('wav', 0x24, 4, 'p'), ('currentPointer', 0x28, 4, 'p'), ('track', 0x2C, 4, 'p'),
    ('prevChannelPointer', 0x30, 4, 'p'), ('nextChannelPointer', 0x34, 4, 'p'), ('dummy4', 0x38, 4, 'u'),
    ('xpi', 0x3C, 2, 'u'), ('xpc', 0x3E, 2, 'u'),
]
CGB_CHANNEL = CHANNEL_HEAD + [
    ('envelopeGoal', 10, 1, 'u'), ('envelopeCounter', 11, 1, 'u'), ('pseudoEchoVolume', 12, 1, 'u'),
    ('pseudoEchoLength', 13, 1, 'u'), ('dummy1', 14, 1, 'u'), ('dummy2', 15, 1, 'u'), ('gateTime', 16, 1, 'u'),
    ('midiKey', 17, 1, 'u'), ('velocity', 18, 1, 'u'), ('priority', 19, 1, 'u'), ('rhythmPan', 20, 1, 'u'),
    ('dummy3', 21, 3, 'u'), ('dummy5', 24, 1, 'u'), ('sustainGoal', 25, 1, 'u'), ('n4', 26, 1, 'u'),
    ('pan', 27, 1, 'u'), ('panMask', 28, 1, 'u'), ('modify', 29, 1, 'u'), ('length', 30, 1, 'u'),
    ('sweep', 31, 1, 'u'), ('frequency', 0x20, 4, 'u'), ('wavePointer', 0x24, 4, 'p'),
    ('currentPointer', 0x28, 4, 'p'), ('track', 0x2C, 4, 'p'), ('prevChannelPointer', 0x30, 4, 'p'),
    ('nextChannelPointer', 0x34, 4, 'p'), ('dummy4', 0x38, 8, 'u'),
]
SOUND_INFO = [
    ('ident', 0, 4, 'u'), ('pcmDmaCounter', 4, 1, 'u'), ('reverb', 5, 1, 'u'), ('maxChans', 6, 1, 'u'),
    ('masterVolume', 7, 1, 'u'), ('freq', 8, 1, 'u'), ('mode', 9, 1, 'u'), ('c15', 10, 1, 'u'),
    ('pcmDmaPeriod', 11, 1, 'u'), ('maxLines', 12, 1, 'u'), ('gap', 13, 3, 'u'),
    ('pcmSamplesPerVBlank', 0x10, 4, 'u'), ('pcmFreq', 0x14, 4, 'u'), ('divFreq', 0x18, 4, 'u'),
    ('cgbChans', 0x1C, 4, 'p'), ('MPlayMainHead', 0x20, 4, 'f'), ('musicPlayerHead', 0x24, 4, 'p'),
    ('CgbSound', 0x28, 4, 'f'), ('CgbOscOff', 0x2C, 4, 'f'), ('MidiKeyToCgbFreq', 0x30, 4, 'f'),
    ('MPlayJumpTable', 0x34, 4, 'p'), ('plynote', 0x38, 4, 'f'), ('ExtVolPit', 0x3C, 4, 'f'),
    ('gap2', 0x40, 16, 'u'),
] + [(f'chans[{i}].{n}', 0x50 + i * 0x40 + o, s, k) for i in range(12) for n, o, s, k in SOUND_CHANNEL]
PCM_BUFFER = (0x350, 0xC60)
PLAYER = [
    ('songHeader', 0, 4, 'p'), ('status', 4, 4, 'u'), ('trackCount', 8, 1, 'u'), ('priority', 9, 1, 'u'),
    ('cmd', 10, 1, 'u'), ('unk_B', 11, 1, 'u'), ('clock', 12, 4, 'u'), ('gap', 16, 8, 'u'),
    ('memAccArea', 0x18, 4, 'p'), ('tempoD', 0x1C, 2, 'u'), ('tempoU', 0x1E, 2, 'u'), ('tempoI', 0x20, 2, 'u'),
    ('tempoC', 0x22, 2, 'u'), ('fadeOI', 0x24, 2, 'u'), ('fadeOC', 0x26, 2, 'u'), ('fadeOV', 0x28, 2, 'u'),
    ('padding', 0x2A, 2, 'u'), ('tracks', 0x2C, 4, 'p'), ('tone', 0x30, 4, 'p'), ('ident', 0x34, 4, 'u'),
    ('MPlayMainNext', 0x38, 4, 'f'), ('musicPlayerNext', 0x3C, 4, 'p'),
]
TRACK = [(n, i, 1, 'u') for i, n in enumerate(
    'flags wait patternLevel repN gateTime key velocity runningStatus keyM pitM keyShift keyShiftX tune pitX '
    'bend bendRange volMR volML vol volX pan panX modM mod modT lfoSpeed lfoSpeedC lfoDelay lfoDelayC priority '
    'pseudoEchoVolume pseudoEchoLength'.split())] + [
    ('chan', 0x20, 4, 'p'), ('tone.type', 0x24, 1, 'u'), ('tone.key', 0x25, 1, 'u'), ('tone.length', 0x26, 1, 'u'),
    ('tone.pan_sweep', 0x27, 1, 'u'), ('tone.wav', 0x28, 4, 'p'), ('tone.attack..release', 0x2C, 4, 'p'),
    ('gap', 0x30, 10, 'u'), ('timer', 0x3A, 2, 'u'), ('unk_3C', 0x3C, 4, 'u'), ('cmdPtr', 0x40, 4, 'p'),
    ('patternStack[0]', 0x44, 4, 'p'), ('patternStack[1]', 0x48, 4, 'p'), ('patternStack[2]', 0x4C, 4, 'p'),
]
CRY_SONG = [(n, o, 1, 'u') for n, o in (('trackCount', 0), ('blockCount', 1), ('priority', 2), ('reverb', 3))] + [
    ('tone', 4, 4, 'p'), ('part[0]', 8, 4, 'p'), ('part[1]', 12, 4, 'p'), ('bytes10', 0x10, 4, 'u'),
    ('gotoTarget', 0x14, 4, 'p'), ('bytes18', 0x18, 0x1C, 'u'),
]


def array(fields, count, size):
    return [(f'[{i}].{n}', i * size + o, s, k) for i in range(count) for n, o, s, k in fields]


# The variables compared: (symbol, size, fields).
REGIONS = [
    ('gSoundInfo', 0xFB0, SOUND_INFO),
    ('gCgbChans', 0x100, array(CGB_CHANNEL, 4, 0x40)),
    ('gMPlayInfo_BGM', 0x40, PLAYER),
    ('gMPlayInfo_SE1', 0x40, PLAYER),
    ('gMPlayInfo_SE2', 0x40, PLAYER),
    ('gMPlayInfo_SE3', 0x40, PLAYER),
    ('gPokemonCryMusicPlayers', 0x80, array(PLAYER, 2, 0x40)),
    ('gMPlayTrack_BGM', 0x320, array(TRACK, 10, 0x50)),
    ('gMPlayTrack_SE1', 0xF0, array(TRACK, 3, 0x50)),
    ('gMPlayTrack_SE2', 0x2D0, array(TRACK, 9, 0x50)),
    ('gMPlayTrack_SE3', 0x50, array(TRACK, 1, 0x50)),
    ('gPokemonCryTracks', 0x140, array(TRACK, 4, 0x50)),
    ('gPokemonCrySongs', 0x68, array(CRY_SONG, 2, 0x34)),
    ('gPokemonCrySong', 0x34, CRY_SONG),
    ('gMPlayMemAccArea', 0x10, [(f'[{i}]', i, 1, 'u') for i in range(16)]),
    ('gMPlayJumpTable', 0x90, [(f'[{i}]', i * 4, 4, 'f') for i in range(36)]),
]
RECORD = 4 + sum(size for _, size, _ in REGIONS)

# ---------------------------------------------------------------- the two address spaces


def sanitize(name):
    return re.sub(r'[^A-Za-z0-9_]', '_', name).strip('_') or 'sec'


class Space:
    """Names for addresses: a variable with its size (name+offset), a data
    object's section (elf2wasm's __e2w_ name+offset), a function."""

    def __init__(self, variables, sections, functions):
        self.variables = sorted(variables)
        self.var_starts = [v[0] for v in self.variables]
        self.sections = sorted(sections)
        self.sec_starts = [s[0] for s in self.sections]
        self.functions = functions

    def data(self, value):
        if value == 0:
            return 'NULL'
        for starts, table in ((self.var_starts, self.variables), (self.sec_starts, self.sections)):
            i = bisect.bisect_right(starts, value) - 1
            if i >= 0 and value < table[i][0] + max(1, table[i][1]):
                return f'{table[i][2]}+{value - table[i][0]:#x}'
        return None

    def function(self, value):
        return 'NULL' if value == 0 else self.functions.get(value)


def rom_space():
    elf = os.path.join(DECOMP, 'pokeemerald_modern.elf')
    out = subprocess.run(['arm-none-eabi-nm', '-S', elf], capture_output=True, text=True, check=True).stdout
    sized, functions = {}, {}
    for line in out.splitlines():
        p = line.split()
        if len(p) == 4 and p[2] in 'BbDdCRrGgSs':
            sized[p[3]] = (int(p[0], 16), int(p[1], 16))
        if len(p) >= 3 and p[-2] in 'TtW':
            functions.setdefault(int(p[0], 16) & ~1, p[-1])
    # The data objects' sections (elf2wasm converts each to a wasm object
    # with the same bytes), from the ROM's map.
    # (a long section name is on a line of its own, the rest on the next)
    sections = []
    section = None
    with open(os.path.join(DECOMP, 'pokeemerald_modern.map')) as f:
        for line in f:
            m = re.match(r'^ (\.\S+)?\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)\s+(\S+\.o)\s*$', line)
            if m and (m.group(1) or section):
                name, start, size, obj = m.group(1) or section, int(m.group(2), 16), int(m.group(3), 16), m.group(4)
                if size and start and (obj.startswith('data/') or obj.startswith('sound/')):
                    sections.append((start, size, f'__e2w_{sanitize(os.path.splitext(obj)[0])}_{sanitize(name)}'))
            m = re.match(r'^ (\.\S+)\s*$', line)
            section = m.group(1) if m else None
    return sized, sections, functions


def wasm_functions(path):
    """The function table: index -> name (wasm-opt's fpcast-emu thunks named for their function)."""
    data = open(path, 'rb').read()

    def uleb(p):
        r = s = 0
        while True:
            b = data[p]
            p += 1
            r |= (b & 0x7F) << s
            s += 7
            if not b & 0x80:
                return r, p

    def sleb(p):
        r = s = 0
        while True:
            b = data[p]
            p += 1
            r |= (b & 0x7F) << s
            s += 7
            if not b & 0x80:
                if b & 0x40:
                    r -= 1 << s
                return r, p

    pos, table, names = 8, {}, {}
    while pos < len(data):
        sid = data[pos]
        size, p = uleb(pos + 1)
        end = p + size
        if sid == 9:
            n, p = uleb(p)
            for _ in range(n):
                flags, p = uleb(p)
                if flags == 2:
                    _, p = uleb(p)
                if flags not in (0, 2) or data[p] != 0x41:
                    raise SystemExit(f'{path}: element segment kind {flags} not understood')
                offset, p = sleb(p + 1)
                p += 1  # end
                if flags == 2:
                    p += 1  # elemkind
                count, p = uleb(p)
                for i in range(count):
                    f, p = uleb(p)
                    table[offset + i] = f
        elif sid == 0:
            length, q = uleb(p)
            if data[q:q + length] == b'name':
                q += length
                while q < end:
                    sub = data[q]
                    ssize, q = uleb(q + 1)
                    if sub == 1:
                        n, r = uleb(q)
                        for _ in range(n):
                            idx, r = uleb(r)
                            ln, r = uleb(r)
                            names[idx] = data[r:r + ln].decode('utf-8', 'replace')
                            r += ln
                    q += ssize
        pos = end
    return {i: re.sub(r'^byn\$fpcast-emu\$', '', names.get(f, f'function{f}')) for i, f in table.items()}


def wasm_space(map_path, wasm_path):
    symbols = {}
    with open(map_path) as f:
        for line in f:
            m = re.match(r'^\s*([0-9a-f]+)\s+[0-9a-f]+\s+([0-9a-f]+)\s+(\S+)\s*$', line)
            if m and '/' not in m.group(3) and '(' not in m.group(3):
                symbols[m.group(3)] = (int(m.group(1), 16), int(m.group(2), 16))
    return symbols, wasm_functions(wasm_path)


def spaces(args):
    rom_sized, rom_sections, rom_functions = rom_space()
    wasm_symbols, wasm_fns = wasm_space(args.map, args.wasm)
    # Variables named in both, with sizes in both (assembly labels have none
    # in the ROM; those are placed by their data object's section).
    common = [n for n in rom_sized if n in wasm_symbols and rom_sized[n][1] and not n.startswith('__e2w_')]
    rom = Space([(rom_sized[n][0], rom_sized[n][1], n) for n in common], rom_sections, rom_functions)
    keys = {s[2] for s in rom_sections}
    wasm = Space([(wasm_symbols[n][0], wasm_symbols[n][1], n) for n in common],
                 [(a, s, n) for n, (a, s) in wasm_symbols.items() if n in keys], wasm_fns)
    return rom, wasm, rom_sized

# ---------------------------------------------------------------- the ROM in mGBA


def keys_from(text):
    return [KEYS[k.upper()] for k in text.replace(',', '+').replace(' ', '+').split('+') if k]


THUMB_STORES = [(0xF800, 0x6000, 4), (0xF800, 0x7000, 1), (0xF800, 0x8000, 2), (0xFE00, 0x5000, 4),
                (0xFE00, 0x5200, 2), (0xFE00, 0x5400, 1), (0xF800, 0x9000, 4), (0xF800, 0xC000, 4), (0xFE00, 0xB400, 4)]


def store_width(core):
    """The width of the store being executed (from its instruction)."""
    cpu = core.cpu._native
    pc = cpu.gprs[15]
    if cpu.executionMode == 1:
        op = core._core.busRead16(core._core, (pc - 4) & ~1)
        for mask, value, width in THUMB_STORES:
            if op & mask == value:
                return width
        return 4
    op = core._core.busRead32(core._core, (pc - 8) & ~3)
    if (op >> 26) & 3 == 1:
        return 1 if op & (1 << 22) else 4
    if (op >> 25) & 7 == 0 and (op >> 4) & 0xF == 0xB:
        return 2
    return 4


def run_rom(args, script, rom_sized):
    mgba.log.silence()
    core = mgba.core.load_path(args.rom)
    core.reset()
    # (and --slack frames more, for the compiled game's last frames if it is ahead)
    frames = (args.frames or script['frames']) + args.slack
    # Every write to 0x04000060-0x0400009F, through mGBA's watchpoints.
    writes = []
    dbg = ffi.new('struct mDebugger*')
    lib.mDebuggerAttach(dbg, core._core)

    @ffi.callback('void(struct mDebugger *, enum mDebuggerEntryReason, struct mDebuggerEntryInfo *)')
    def entered(d, reason, info):
        if reason == lib.DEBUGGER_ENTER_WATCHPOINT:
            now = lib.mTimingGlobalTime(core._core.timing)
            # (mGBA's reset writes the registers before the game starts)
            if now > 1000:
                width = store_width(core)
                value = info.type.wp.newValue
                for i in range(width):
                    offset = info.address - 0x04000000 + i
                    if 0x60 <= offset < 0xA0:
                        writes.append((core.frame_counter, offset, (value >> (8 * i)) & 0xFF))
        d.state = lib.DEBUGGER_RUNNING

    dbg.entered = entered
    dbg.state = lib.DEBUGGER_RUNNING
    for a in range(0x04000060, 0x040000A0):
        wp = ffi.new('struct mWatchpoint*')
        wp.address = a
        wp.segment = -1
        wp.type = lib.WATCHPOINT_WRITE
        dbg.platform.setWatchpoint(dbg.platform, wp)

    core.set_audio_buffer_size(0x8000)
    audio = core.get_audio_channels()
    audio.set_rate(RATE)
    iwram = ffi.buffer(core._native.memory.iwram, 0x8000)
    ewram = ffi.buffer(core._native.memory.wram, 0x40000)

    def read(addr, size):
        if addr >> 24 == 3:
            return iwram[addr - 0x03000000:addr - 0x03000000 + size]
        return ewram[addr - 0x02000000:addr - 0x02000000 + size]

    inputs = {f: keys_from(k) for f, k in script.get('inputs', [])}
    keys = []
    records, frame_writes, sound = [], [], []
    for f in range(1, frames + 1):
        if f in inputs:
            keys = inputs[f]
        core.clear_keys(*KEYS.values())
        if keys:
            core.set_keys(*keys)
        core.run_frame()
        records.append(b''.join(read(rom_sized[name][0], size) for name, size, _ in REGIONS))
        frame_writes.append([(o, v) for fr, o, v in writes if fr == f - 1])
        writes[:] = [w for w in writes if w[0] >= f]
        n = audio.available
        if n:
            buf = ffi.new('short[]', 2 * n)
            n = audio.read_into(buf, n)
            sound.append(np.frombuffer(ffi.buffer(buf, 4 * n), dtype=np.int16).copy())
    return records, frame_writes, np.concatenate(sound).reshape(-1, 2) if sound else np.zeros((0, 2), np.int16)


def run_rom_cached(args, script, rom_sized, out):
    """run_rom, kept in the output directory (rom.pkl) for the next check with
    the same ROM, script, frames and variables: the ROM's side never changes
    while the compiled game's does, and it is the slow one (mGBA with
    watchpoints)."""
    key = hashlib.sha1()
    with open(args.rom, 'rb') as f:
        key.update(f.read())
    key.update(json.dumps(script, sort_keys=True).encode())
    key.update(repr((args.frames, args.slack, [(n, s, rom_sized[n][0]) for n, s, _ in REGIONS])).encode())
    key = key.hexdigest()
    path = os.path.join(out, 'rom.pkl')
    if not args.fresh and os.path.exists(path):
        with open(path, 'rb') as f:
            cached = pickle.load(f)
        if cached.get('key') == key:
            return cached['run']
    run = run_rom(args, script, rom_sized)
    with open(path, 'wb') as f:
        pickle.dump({'key': key, 'run': run}, f)
    return run

# ---------------------------------------------------------------- the compiled game


def run_ours(args, script_path, out):
    regions = os.path.join(out, 'regions.json')
    with open(regions, 'w') as f:
        json.dump([[name, size] for name, size, _ in REGIONS], f)
    state = os.path.join(out, 'state.bin')
    wav = os.path.join(out, 'ours.wav')
    cmd = ['node', os.path.join(ROOT, 'platform/tools/sound_state.mjs'), '--script', script_path,
           '--regions', regions, '--out', state, '--wav', wav, '--wasm', args.wasm, '--map', args.map]
    if args.frames:
        cmd += ['--frames', str(args.frames)]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    data = open(state, 'rb').read()
    records, frame_writes = [], []
    p = 0
    while p < len(data):
        records.append(data[p + 4:p + RECORD])
        p += RECORD
        n = struct.unpack_from('<I', data, p)[0]
        frame_writes.append([struct.unpack_from('<HB', data, p + 4 + i * 4) for i in range(n)])
        p += 4 + n * 4
    return records, frame_writes, read_wav(wav)


def read_wav(path):
    data = open(path, 'rb').read()
    return np.frombuffer(data[44:], dtype=np.int16).reshape(-1, 2)


def write_wav(path, samples):
    raw = samples.astype('<i2').tobytes()
    header = b'RIFF' + struct.pack('<I', 36 + len(raw)) + b'WAVEfmt ' + struct.pack('<IHHIIHH', 16, 1, 2, RATE, RATE * 4, 4, 16)
    with open(path, 'wb') as f:
        f.write(header + b'data' + struct.pack('<I', len(raw)) + raw)

# ---------------------------------------------------------------- the comparisons
#
# The compiled game may reach a point of the game a frame or two before or
# after the ROM (a timing difference elsewhere: tools/compare.py --slack
# allows for it in the picture), and the sound moves with it. So a frame
# that differs from the ROM's same frame is also compared with the ROM's
# frames up to --slack before and after, and counted as shifted if one of
# them is equal. Two things follow the frame count rather than the game:
# which part of the PCM buffer the DMA plays (pcmDmaCounter, compared at
# the same frame only), and so which part the mixer writes ((b) compares
# the part each frame wrote).


def fields_of(space, records, rom_side):
    """Each frame's state as a tuple of values: numbers as they are, pointers
    as what they point to, the PCM buffer left out."""
    fields = []
    at = 0
    for name, size, layout in REGIONS:
        for field, offset, fsize, kind in layout:
            key = f'{name}{field}' if field.startswith('[') else f'{name}.{field}'
            fields.append((key, at + offset, fsize, kind))
        at += size
    cache = {}
    out = []
    for rec in records:
        values = []
        for key, offset, size, kind in fields:
            v = int.from_bytes(rec[offset:offset + size], 'little')
            if kind in 'pf':
                named = cache.get((kind, v))
                if named is None:
                    named = space.data(v) if kind == 'p' else space.function(v & ~1 if rom_side else v)
                    named = named if named is not None else f'{v:#x}'
                    cache[(kind, v)] = named
                v = named
            values.append(v)
        out.append(tuple(values))
    return [f[0] for f in fields], out


def nearest(i, count, slack):
    """The ROM's frames to try for frame i: the same, then 1, -1, 2, -2..."""
    yield i
    for d in range(1, slack + 1):
        for j in (i + d, i - d):
            if 0 <= j < count:
                yield j


def compare_state(rom, wasm, rom_records, our_records, slack):
    """(a): per frame, equal / equal to a frame within slack / different."""
    keys, a = fields_of(rom, rom_records, True)
    _, b = fields_of(wasm, our_records, False)
    counter = keys.index('gSoundInfo.pcmDmaCounter')
    strip = lambda t: t[:counter] + t[counter + 1:]
    a2, b2 = [strip(t) for t in a], [strip(t) for t in b]
    keys2 = strip(keys)
    exact, shifts, bad, fields = 0, collections.Counter(), [], collections.Counter()
    for i in range(min(len(a), len(b))):
        if a[i] == b[i]:
            exact += 1
            continue
        match = next((j for j in nearest(i, len(a), slack) if j != i and a2[j] == b2[i]), None)
        if match is not None:
            shifts[match - i] += 1
            continue
        best = min(nearest(i, len(a), slack), key=lambda j: sum(x != y for x, y in zip(a2[j], b2[i])))
        diff = [(k, x, y) for k, x, y in zip(keys2, a2[best], b2[i]) if x != y]
        fields.update(k for k, _, _ in diff)
        bad.append((i + 1, best - i, diff))
    return exact, shifts, bad, fields


def shown(v):
    return f'{v:#x}' if isinstance(v, int) else v


def pcm_part(record, sound_info_at):
    """The part of the PCM buffer the mixer wrote in the frame's VBlank (from
    pcmDmaCounter, which m4aSoundVSync has counted down once since), and the
    whole buffer."""
    info = record[sound_info_at:sound_info_at + 0xFB0]
    period, samples = info[11], int.from_bytes(info[0x10:0x14], 'little')
    pcm = info[PCM_BUFFER[0]:PCM_BUFFER[0] + PCM_BUFFER[1]]
    if not period or not samples:
        return pcm, pcm
    counter = info[4] % period + 1
    at = samples * (period - (counter - 1)) if counter > 1 else 0
    half = PCM_BUFFER[1] // 2
    return pcm[at:at + samples] + pcm[half + at:half + at + samples], pcm


def compare_pcm(rom_records, our_records, slack):
    """(b): the whole buffer at the same frame, and each frame's part (with slack)."""
    at = 0
    for name, size, _ in REGIONS:
        if name == 'gSoundInfo':
            break
        at += size
    a = [pcm_part(r, at) for r in rom_records]
    b = [pcm_part(r, at) for r in our_records]
    whole = sum(x[1] == y[1] for x, y in zip(a, b))
    exact, shifts, bad = 0, collections.Counter(), []
    for i in range(min(len(a), len(b))):
        if a[i][0] == b[i][0]:
            exact += 1
            continue
        match = next((j for j in nearest(i, len(a), slack) if j != i and a[j][0] == b[i][0]), None)
        if match is not None:
            shifts[match - i] += 1
            continue
        x, y = a[i][0], b[i][0]
        diff = [k for k in range(min(len(x), len(y))) if x[k] != y[k]]
        bad.append(f'frame {i + 1}: {len(diff)} of {len(x)} bytes differ' +
                   (f' (first at {diff[0]:#x}: ROM {x[diff[0]]:#04x}, here {y[diff[0]]:#04x})' if diff else ''))
    return whole, exact, shifts, bad


def compare_writes(rom_writes, our_writes, slack):
    """(c): each frame's sound register writes (with slack)."""
    a = [list(w) for w in rom_writes]
    b = [[tuple(w) for w in ws] for ws in our_writes]
    total = sum(len(w) for w in a)
    exact, shifts, bad = 0, collections.Counter(), []
    for i in range(min(len(a), len(b))):
        if a[i] == b[i]:
            exact += 1
            continue
        match = next((j for j in nearest(i, len(a), slack) if j != i and a[j] == b[i]), None)
        if match is not None:
            shifts[match - i] += 1
            continue
        fmt = lambda ws: ' '.join(f'{o:02x}={v:02x}' for o, v in ws[:12]) + (' ...' if len(ws) > 12 else '')
        bad.append(f'frame {i + 1}: ROM {fmt(a[i])} / here {fmt(b[i])}')
    return exact, shifts, bad, total


def bands(x):
    """Energy in 32 bands from 60 Hz to 16 kHz, every 1024 samples (log)."""
    n, hop = 4096, 1024
    w = np.hanning(n)
    frames = [x[i:i + n] * w for i in range(0, max(1, len(x) - n), hop)]
    spec = np.abs(np.fft.rfft(np.array(frames), axis=1)) ** 2
    f = np.fft.rfftfreq(n, 1 / RATE)
    edges = np.geomspace(60, 16000, 33)
    return np.log10(np.stack([spec[:, (f >= lo) & (f < hi)].sum(1) for lo, hi in zip(edges[:-1], edges[1:])], 1) + 1e-3)


def best_lag(a, b, most):
    """The shift of b (in samples, within most) that best lines it up with a."""
    n = 1 << int(np.ceil(np.log2(len(a) + len(b))))
    corr = np.fft.irfft(np.fft.rfft(a, n) * np.conj(np.fft.rfft(b, n)), n)
    lags = np.concatenate([np.arange(0, most + 1), np.arange(-most, 0)])
    return int(lags[np.argmax(corr[lags])])


def compare_audio(ref, ours, start_frame, slack):
    """(d): level, spectrum over time and waveform of the mono mix from
    start_frame on, lined up first (mGBA's resampler delays a little, and a
    timing shift moves the sound by frames)."""
    start = int(start_frame * 280896 / 256)
    a = ref[start:].astype(np.float64).mean(1) / GAIN_MGBA
    b = ours[start:].astype(np.float64).mean(1) / GAIN_OURS
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    a, b = a - np.convolve(a, np.ones(4096) / 4096, 'same'), b - np.convolve(b, np.ones(4096) / 4096, 'same')
    seg = slice(0, min(n, 16 * RATE))
    lag = best_lag(a[seg], b[seg], (slack + 1) * 1100)
    b = np.roll(b, lag)
    edge = abs(lag) + 1024
    level = float(np.sqrt(np.mean(b[edge:-edge] ** 2)) / max(np.sqrt(np.mean(a[edge:-edge] ** 2)), 1e-9))
    wave = float(np.corrcoef(a[edge:-edge], b[edge:-edge])[0, 1])
    ba, bb = bands(a[edge:-edge]), bands(b[edge:-edge])
    loud = (ba.max(1) > 0) & (ba.std(1) > 1e-6) & (bb.std(1) > 1e-6)
    band = float(np.mean([np.corrcoef(x, y)[0, 1] for x, y in zip(ba[loud], bb[loud])])) if loud.any() else 1.0
    return {'lag': lag, 'level': level, 'bands': band, 'wave': wave, 'seconds': n / RATE}


def report(label, count, exact, shifts, bad, extra=''):
    shifted = sum(shifts.values())
    by = ', '.join(f'{s:+d}: {n}' for s, n in sorted(shifts.items()))
    print(f'{label}: {exact}/{count} frames equal, {shifted} more equal to the ROM\'s a frame or two away'
          f'{f" ({by})" if by else ""}, {len(bad)} different{extra}')

# ----------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--script', required=True)
    ap.add_argument('--frames', type=int, help='stop after this many frames (default: the script\'s)')
    ap.add_argument('--slack', type=int, default=2, help='frames of timing shift allowed (as compare.py\'s)')
    ap.add_argument('--out')
    ap.add_argument('--rom', default=os.path.join(DECOMP, 'pokeemerald_modern.gba'))
    ap.add_argument('--wasm', default=os.path.join(ROOT, 'build/wasm/pokeemerald.wasm'))
    ap.add_argument('--map', default=os.path.join(ROOT, 'build/wasm/pokeemerald.map'))
    ap.add_argument('--audio-from', type=int, help='compare the sound from this frame on (default: the script\'s "music" frame, or 1)')
    ap.add_argument('--fresh', action='store_true', help='run the ROM again even if its run is kept in --out')
    args = ap.parse_args()
    with open(args.script) as f:
        script = json.load(f)
    out = args.out or os.path.join(ROOT, 'build/sound_check', os.path.splitext(os.path.basename(args.script))[0])
    os.makedirs(out, exist_ok=True)

    t0 = time.time()
    rom, wasm, rom_sized = spaces(args)
    ours = run_ours(args, os.path.abspath(args.script), out)
    ref = run_rom_cached(args, script, rom_sized, out)
    write_wav(os.path.join(out, 'rom.wav'), ref[2])
    frames = len(ours[0])
    print(f'{frames} frames, run in {time.time() - t0:.0f} s; {out}')

    failed = False
    exact, shifts, bad, fields = compare_state(rom, wasm, ref[0], ours[0], args.slack)
    report('(a) sequencer state', frames, exact, shifts, bad)
    for frame, shift, diff in bad[:6]:
        near = f' (the ROM\'s frame {frame + shift})' if shift else ''
        print(f'      frame {frame}{near}: ' + '; '.join(f'{k}: ROM {shown(x)}, here {shown(y)}' for k, x, y in diff[:4])
              + (f'; {len(diff) - 4} more' if len(diff) > 4 else ''))
    if fields:
        print('      fields: ' + ', '.join(f'{k} ({n})' for k, n in fields.most_common(10)))
    failed |= bool(bad)

    whole, exact, shifts, bad = compare_pcm(ref[0], ours[0], args.slack)
    report('(b) PCM buffer, the part mixed each frame', frames, exact, shifts, bad,
           f'; the whole buffer equal at {whole}/{frames}')
    for line in bad[:5]:
        print(f'      {line}')
    failed |= bool(bad)

    exact, shifts, bad, total = compare_writes(ref[1], ours[1], args.slack)
    report('(c) sound register writes', frames, exact, shifts, bad, f' ({total} byte writes on the ROM)')
    for line in bad[:5]:
        print(f'      {line}')
    failed |= bool(bad)

    start = args.audio_from or script.get('music', 1)
    d = compare_audio(ref[2], ours[2], start, args.slack)
    ok = LEVEL_RATIO[0] <= d['level'] <= LEVEL_RATIO[1] and d['bands'] >= MIN_BAND_CORR and d['wave'] >= MIN_WAVE_CORR
    print(f'(d) sound from frame {start} ({d["seconds"]:.1f} s): level {d["level"]:.3f} of mGBA\'s, '
          f'bands correlate {d["bands"]:.3f}, waveform {d["wave"]:.3f} (ours moved {d["lag"]:+d} samples to line up); '
          f'{os.path.join(out, "ours.wav")} and rom.wav')
    failed |= not ok
    print('the sound matches the ROM' if not failed else 'the sound differs from the ROM')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
