#!/usr/bin/env python3
"""Extract Emerald's music and sound effects for the m4a engine (src/audio).

  python3 tools/extract/extract_sound.py [path/to/pokeemerald]

The songs are converted exactly as the decomp's build converts them: its own
tools (tools/mid2agb, tools/wav2agb) are compiled with g++, every song's MIDI
goes through mid2agb with its midi.cfg options, and the resulting m4a
assembly is assembled here into the bytecode the GBA's sound engine reads.
Then everything the songs play is gathered: voicegroups (instruments),
keysplit tables, programmable waves, and DirectSound samples in the ROM's
WaveData format (wav2agb -b, uncompressed).

Output (public/assets/sound/):
  bank.json     songs (bytecode, track offsets, player, priority, reverb,
                voicegroup), voicegroups, keysplit tables, waves, sample index
  samples.bin   the samples' signed 8-bit PCM, back to back
"""

from __future__ import annotations

import base64
import json
import re
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/sound"

# What the playtest plays: the music of the title, the setup (Professor
# Birch's lab), wild battles, the win and the level-up fanfare, and the
# battle and menu sound effects.
SONGS = [
    "mus_title", "mus_birch_lab", "mus_vs_wild", "mus_victory_wild", "mus_level_up",
    "se_select", "se_ball_open", "se_effective", "se_super_effective",
    "se_not_effective", "se_faint", "se_flee", "se_exp", "se_exp_max", "se_low_health",
]

PLAYERS = {"MUSIC_PLAYER_BGM": 0, "MUSIC_PLAYER_SE1": 1, "MUSIC_PLAYER_SE2": 2, "MUSIC_PLAYER_SE3": 3}


def build_tools(decomp: Path, work: Path) -> tuple[Path, Path]:
    tools = {}
    for name in ["mid2agb", "wav2agb"]:
        exe = work / name
        srcs = sorted(str(p) for p in (decomp / "tools" / name).glob("*.cpp"))
        subprocess.run(["g++", "-O2", "-std=c++17", "-o", str(exe), *srcs], check=True)
        tools[name] = exe
    return tools["mid2agb"], tools["wav2agb"]


# --- a small assembler for mid2agb's output ---------------------------------

def parse_equs(text: str, symbols: dict) -> None:
    for line in text.splitlines():
        m = re.match(r"\s*\.equ\s+(\w+)\s*,\s*([^@]+)", line)
        if m:
            symbols[m.group(1)] = evaluate(m.group(2).strip(), symbols)


def evaluate(expr: str, symbols: dict):
    expr = expr.strip()
    if re.fullmatch(r"[A-Za-z_]\w*", expr):
        # A symbol, a label or an external name (voicegroup_...).
        return symbols.get(expr, expr)
    py = re.sub(r"\b0x[0-9a-fA-F]+\b", lambda m: str(int(m.group(0), 16)), expr).replace("/", "//")

    def sym(m):
        name = m.group(0)
        if name not in symbols:
            raise KeyError(f"unknown symbol {name} in {expr!r}")
        return str(symbols[name])

    py = re.sub(r"\b[A-Za-z_]\w*\b", sym, py)
    return int(eval(py, {"__builtins__": {}}))


def assemble_song(asm: str, mplaydef: dict, name: str) -> dict:
    """Assemble a song: every track's bytes in one array, labels resolved to offsets in it."""
    symbols = dict(mplaydef)
    parse_equs(asm, symbols)
    data = bytearray()
    labels: dict[str, int] = {}
    fixups: list[tuple[int, str]] = []
    header: list = []
    in_header = False
    for raw in asm.splitlines():
        line = raw.split("@")[0].strip()
        if not line:
            continue
        m = re.fullmatch(r"(\w+):", line)
        if m:
            labels[m.group(1)] = len(data)
            if m.group(1) == name:
                in_header = True
            continue
        if line.startswith((".include", ".equ", ".section", ".global", ".align", ".end")):
            continue
        m = re.match(r"\.(byte|word)\s+(.*)", line)
        if not m:
            raise ValueError(f"{name}: can't assemble {raw!r}")
        kind, args = m.group(1), [a.strip() for a in m.group(2).split(",") if a.strip()]
        for a in args:
            v = evaluate(a, symbols)
            if in_header:
                header.append(v)
                continue
            if kind == "byte":
                if not isinstance(v, int) or not 0 <= v <= 255:
                    raise ValueError(f"{name}: byte out of range {a!r} = {v!r}")
                data.append(v)
            else:
                fixups.append((len(data), v))
                data += b"\0\0\0\0"
    for pos, label in fixups:
        struct.pack_into("<I", data, pos, labels[label])
    track_count, block_count, priority, reverb, voicegroup, *parts = header
    return {
        "data": base64.b64encode(bytes(data)).decode(),
        "tracks": [labels[p] for p in parts[:track_count]],
        "priority": priority,
        "reverb": reverb,
        "voicegroup": voicegroup.removeprefix("voicegroup_"),
    }


# --- instruments --------------------------------------------------------------

VOICE_RE = re.compile(r"^\s*(voice_\w+|cry\w*)\s+(.*)$")


def parse_args(s: str) -> list[str]:
    return [a.strip() for a in s.split("@")[0].split(",")]


def parse_voicegroups(decomp: Path) -> dict[str, dict]:
    """Every voicegroup: {start, voices}; a voice's index is the MIDI key or VOICE number."""
    groups: dict[str, dict] = {}
    for inc in sorted((decomp / "sound/voicegroups").rglob("*.inc")):
        current = None
        for line in inc.read_text().splitlines():
            m = re.match(r"^\s*voice_group\s+(\w+)(?:\s*,\s*(\d+))?", line)
            if m:
                current = {"start": int(m.group(2) or 0), "voices": []}
                groups[m.group(1)] = current
                continue
            m = VOICE_RE.match(line)
            if m and current is not None:
                current["voices"].append(voice(m.group(1), parse_args(m.group(2))))
    return groups


def voice(kind: str, a: list[str]) -> dict:
    """A voice as the engine's ToneData: type, key, length, pan_sweep, wav, attack, decay, sustain, release."""
    def num(x):
        return int(x, 0)

    if kind in ("voice_directsound", "voice_directsound_no_resample", "voice_directsound_alt"):
        t = {"voice_directsound": 0, "voice_directsound_no_resample": 8, "voice_directsound_alt": 16}[kind]
        pan = num(a[1])
        return {"type": t, "key": num(a[0]), "length": 0, "panSweep": (0x80 | pan) if pan else 0,
                "sample": a[2].removeprefix("DirectSoundWaveData_"), "attack": num(a[3]), "decay": num(a[4]), "sustain": num(a[5]), "release": num(a[6])}
    if kind in ("voice_square_1", "voice_square_1_alt"):
        pan = num(a[1])
        return {"type": 1 if kind == "voice_square_1" else 9, "key": num(a[0]), "length": (0x80 | pan) if pan else 0, "panSweep": num(a[2]),
                "duty": num(a[3]) & 3, "attack": num(a[4]) & 7, "decay": num(a[5]) & 7, "sustain": num(a[6]) & 15, "release": num(a[7]) & 7}
    if kind in ("voice_square_2", "voice_square_2_alt"):
        pan = num(a[1])
        return {"type": 2 if kind == "voice_square_2" else 10, "key": num(a[0]), "length": (0x80 | pan) if pan else 0, "panSweep": 0,
                "duty": num(a[2]) & 3, "attack": num(a[3]) & 7, "decay": num(a[4]) & 7, "sustain": num(a[5]) & 15, "release": num(a[6]) & 7}
    if kind in ("voice_programmable_wave", "voice_programmable_wave_alt"):
        pan = num(a[1])
        return {"type": 3 if kind == "voice_programmable_wave" else 11, "key": num(a[0]), "length": (0x80 | pan) if pan else 0, "panSweep": 0,
                "wave": a[2].removeprefix("ProgrammableWaveData_"), "attack": num(a[3]) & 7, "decay": num(a[4]) & 7, "sustain": num(a[5]) & 15, "release": num(a[6]) & 7}
    if kind in ("voice_noise", "voice_noise_alt"):
        pan = num(a[1])
        return {"type": 4 if kind == "voice_noise" else 12, "key": num(a[0]), "length": (0x80 | pan) if pan else 0, "panSweep": 0,
                "period": num(a[2]) & 1, "attack": num(a[3]) & 7, "decay": num(a[4]) & 7, "sustain": num(a[5]) & 15, "release": num(a[6]) & 7}
    if kind == "voice_keysplit":
        return {"type": 0x40, "group": a[0].removeprefix("voicegroup_"), "split": a[1].removeprefix("keysplit_")}
    if kind == "voice_keysplit_all":
        return {"type": 0x80, "group": a[0].removeprefix("voicegroup_")}
    return {"type": -1, "unsupported": kind}


def parse_keysplits(decomp: Path) -> dict[str, list[int]]:
    """keysplit_tables.inc: for every key, which voice of the keysplit's group plays it."""
    tables: dict[str, list[int]] = {}
    current = None
    last = 0
    for line in (decomp / "sound/keysplit_tables.inc").read_text().splitlines():
        m = re.match(r"^\s*keysplit\s+(\w+)(?:\s*,\s*(\d+))?", line)
        if m:
            current = []
            last = int(m.group(2) or 0)
            tables[m.group(1)] = current
            current.extend([-1] * last)
            continue
        m = re.match(r"^\s*split\s+(\d+)\s*,\s*(\d+)", line)
        if m and current is not None:
            index, end = int(m.group(1)), int(m.group(2))
            current.extend([index] * (end - last))
            last = end
    # Keys outside a table read the neighboring tables' bytes on the GBA; take the nearest entry.
    for t in tables.values():
        first = next((v for v in t if v >= 0), 0)
        for i in range(len(t)):
            if t[i] < 0:
                t[i] = first
        t.extend([t[-1] if t else 0] * (128 - len(t)))
        del t[128:]
    return tables


def parse_labels(path: Path, prefix: str) -> dict[str, Path]:
    out = {}
    label = None
    for line in path.read_text().splitlines():
        m = re.match(rf"^({prefix}\w+)::", line)
        if m:
            label = m.group(1).removeprefix(prefix)
            continue
        m = re.match(r'^\s*\.incbin\s+"([^"]+)"', line)
        if m and label:
            out[label] = Path(m.group(1))
            label = None
    return out


def main(decomp: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="m4a-"))
    mid2agb, wav2agb = build_tools(decomp, work)

    mplaydef: dict = {}
    parse_equs((decomp / "sound/MPlayDef.s").read_text(), mplaydef)
    cfg = {}
    for line in (decomp / "sound/songs/midi/midi.cfg").read_text().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            cfg[k.strip()] = v.split()
    song_players = {}
    for line in (decomp / "sound/song_table.inc").read_text().splitlines():
        m = re.match(r"^\s*song\s+(\w+)\s*,\s*(\w+)", line)
        if m:
            song_players[m.group(1)] = PLAYERS.get(m.group(2), 0)

    songs = {}
    for name in SONGS:
        s = work / f"{name}.s"
        subprocess.run([str(mid2agb), str(decomp / f"sound/songs/midi/{name}.mid"), str(s), *cfg[f"{name}.mid"]], check=True)
        song = assemble_song(s.read_text(), mplaydef, name)
        song["player"] = song_players[name]
        songs[name] = song

    groups = parse_voicegroups(decomp)
    keysplits = parse_keysplits(decomp)
    sample_paths = parse_labels(decomp / "sound/direct_sound_data.inc", "DirectSoundWaveData_")
    wave_paths = parse_labels(decomp / "sound/programmable_wave_data.inc", "ProgrammableWaveData_")

    # Everything the songs can reach.
    used_groups: dict[str, dict] = {}
    used_splits: dict[str, list[int]] = {}

    def use_group(g: str) -> None:
        if g in used_groups:
            return
        used_groups[g] = groups[g]
        for v in groups[g]["voices"]:
            if v["type"] in (0x40, 0x80):
                use_group(v["group"])
                if "split" in v:
                    used_splits[v["split"]] = keysplits[v["split"]]

    for song in songs.values():
        use_group(song["voicegroup"])
    samples_needed = sorted({v["sample"] for g in used_groups.values() for v in g["voices"] if "sample" in v})
    waves_needed = sorted({v["wave"] for g in used_groups.values() for v in g["voices"] if "wave" in v})

    pcm = bytearray()
    samples = {}
    for name in samples_needed:
        wav = decomp / sample_paths[name].with_suffix(".wav")
        out = work / f"{name}.bin"
        subprocess.run([str(wav2agb), "-b", str(wav), str(out)], check=True)
        raw = out.read_bytes()
        flags, freq, loop_start, size = struct.unpack_from("<IIII", raw, 0)
        data = raw[16 : 16 + size]
        samples[name] = {"offset": len(pcm), "size": size, "freq": freq, "loopStart": loop_start, "loop": bool(flags & 0x40000000)}
        pcm += data
    waves = {}
    for name in waves_needed:
        raw = (decomp / wave_paths[name]).read_bytes()[:16]
        # 32 4-bit samples, high nibble first.
        waves[name] = [n for b in raw for n in (b >> 4, b & 15)]

    bank = {"songs": songs, "voicegroups": used_groups, "keysplits": used_splits, "waves": waves, "samples": samples}
    (OUT / "bank.json").write_text(json.dumps(bank, separators=(",", ":")))
    (OUT / "samples.bin").write_bytes(bytes(pcm))
    print(f"{len(songs)} songs, {len(used_groups)} voicegroups, {len(samples)} samples ({len(pcm) // 1024} KB), {len(waves)} waves -> {OUT}")


if __name__ == "__main__":
    decomp = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "decomp/pokeemerald"
    if not (decomp / "Makefile").exists():
        sys.exit(f"decomp not found at {decomp} (run: git submodule update --init)")
    main(decomp)
