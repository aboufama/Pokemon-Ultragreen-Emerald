#!/usr/bin/env python3
"""A/B the remake's sound engine (src/audio/m4a.ts) against the game itself.

  tools/reference/build_rom.sh && tools/reference/build_capture.sh [mgba_src]   (once)
  python3 tools/sound/reference/run.py [--seconds 12] [song ...]

The reference is Emerald's own m4a engine running in mGBA: the harness ROM of
tools/reference (the decomp with a boot hook) in its sound mode, recorded by
tools/reference/capture/sound.c. Each song (default: every song in
public/assets/sound/bank.json) is recorded, rendered by the engine at mGBA's
65536 Hz (render.mjs) and compared:

  - DirectSound (the sampled instruments), alone, sample by sample at its
    13379 Hz: the engine mixes as SoundMainRAM does, so the samples are the
    game's own (99.7% equal; the rest fall on the edges of mGBA's
    sample-and-hold, whose 65536 Hz grid lies a fraction of a sample off).
  - The whole mix: band energies over time, which ignores phase (the GB
    channels' oscillators start at other phases than mGBA's, which doesn't
    change how they sound), and the level (from the bands, 60 Hz - 16 kHz).

Needs numpy. Work files go in build/sound-ref/. Exits non-zero if a song differs.

A known difference that is mGBA's, not the engine's: when a GB square
channel's frequency sweep overflows, mGBA holds the channel's last level as
DC (se_faint), where the hardware outputs 0. DC is inaudible.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
REF = ROOT / "build/reference"
WORK = ROOT / "build/sound-ref"
RATE = 65536
FRAME = RATE / 59.7275
START_FRAME = 30

# Thresholds (measured: DirectSound 99.7-99.8% equal, bands 0.98-0.998, level within 5%).
MIN_DS_EQUAL = 0.99
MIN_BAND_CORR = 0.95
LEVEL_RATIO = (0.9, 1.1)
DS_RATE = 16777216 / 1254


def reference() -> tuple[Path, Path, Path, dict[str, int]]:
    """The harness ROM, its map, the recorder and the song numbers (see tools/reference)."""
    rom = REF / "pokeemerald/pokeemerald_modern.gba"
    tool = REF / "sound"
    if not rom.exists() or not tool.exists():
        raise SystemExit("build the reference first: tools/reference/build_rom.sh && tools/reference/build_capture.sh [mgba_src]")
    songs = {m.group(1).lower(): int(m.group(2)) for m in re.finditer(r"#define (\w+)\s+(\d+)", (REF / "pokeemerald/include/constants/songs.h").read_text())}
    return rom, rom.with_suffix(".map"), tool, songs


def load(path: Path) -> np.ndarray:
    return np.fromfile(path, dtype=np.int16).reshape(-1, 2).astype(np.float64) / 24576


def best_offset(a: np.ndarray, b: np.ndarray, lo: int, hi: int) -> tuple[float, int]:
    """The offset of b in a (between lo and hi) where they correlate best, and that correlation."""
    n = min(len(b), 2 * RATE)
    b = b[:n] - b[:n].mean()
    lo = max(0, lo)
    seg = a[lo:hi + n]
    count = len(seg) - n + 1
    size = 1 << int(np.ceil(np.log2(len(seg) + n)))
    # Every offset at once: the cross-correlation by FFT, normalized by each window's energy.
    num = np.fft.irfft(np.fft.rfft(seg, size) * np.conj(np.fft.rfft(b, size)), size)[:count]
    s1, s2 = np.concatenate([[0], np.cumsum(seg)]), np.concatenate([[0], np.cumsum(seg ** 2)])
    energy = (s2[n:n + count] - s2[:count]) - (s1[n:n + count] - s1[:count]) ** 2 / n
    c = num / (np.sqrt(np.maximum(energy, 1e-12)) * max(np.linalg.norm(b), 1e-9))
    k = int(np.argmax(c))
    return float(c[k]), lo + k


def align(ref: np.ndarray, eng: np.ndarray) -> int:
    """Where the engine's first sample is in the recording (the song starts at frame 30)."""
    guess = int(START_FRAME * FRAME)
    return best_offset(ref.mean(1), eng.mean(1), guess - 1200, guess + 3200)[1]


def bands(x: np.ndarray) -> np.ndarray:
    """Energy in 32 bands from 60 Hz to 16 kHz, every 512 samples."""
    n, hop = 2048, 512
    w = np.hanning(n)
    spec = np.array([np.abs(np.fft.rfft(x[i:i + n] * w)) ** 2 for i in range(0, max(1, len(x) - n), hop)])
    f = np.fft.rfftfreq(n, 1 / RATE)
    edges = np.geomspace(60, 16000, 33)
    return np.stack([spec[:, (f >= lo) & (f < hi)].sum(1) for lo, hi in zip(edges[:-1], edges[1:])], 1)


def ds_equal(ref: np.ndarray, eng: np.ndarray, off: int) -> float:
    """The share of (non-silent) DirectSound samples that are equal, read at the middle of each held sample."""
    n = min(len(ref) - off - 8, len(eng))
    j = np.arange(int(n * DS_RATE / RATE) - 2)
    at = np.round((j + 0.5) * RATE / DS_RATE).astype(int)
    a, b = np.round(ref[off + at] * 128), np.round(eng[at] * 128)
    loud = (np.abs(a) + np.abs(b)).sum(1) > 0
    return float(np.all(a == b, axis=1)[loud].mean()) if loud.any() else 1.0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seconds", type=float, default=12)
    ap.add_argument("songs", nargs="*")
    args = ap.parse_args()
    WORK.mkdir(parents=True, exist_ok=True)
    rom, rom_map, tool, ids = reference()
    bank = json.loads((ROOT / "public/assets/sound/bank.json").read_text())
    songs = args.songs or list(bank["songs"])
    frames = int(args.seconds * 59.7275)
    failed = 0
    for song in songs:
        rec = {}
        for only, mute in (("all", 0), ("ds", 15)):
            ref = WORK / f"{song}.{only}.ref.raw"
            eng = WORK / f"{song}.{only}.eng.raw"
            subprocess.run([str(tool), str(rom), str(rom_map), str(ref), f"m{mute}", f"w{START_FRAME}", f"s{ids[song]}", f"w{frames}"], check=True, stdout=subprocess.DEVNULL)
            subprocess.run(["node", str(HERE / "render.mjs"), song, str(args.seconds), str(eng), only], check=True)
            rec[only] = (load(ref), load(eng))
        ref, eng = rec["all"]
        off = align(ref, eng)
        n = min(len(ref) - off, len(eng))
        r, e = ref[off:off + n], eng[:n]
        ba, bb = bands(r.mean(1)), bands(e.mean(1))
        level = float(np.sqrt(bb.sum() / max(ba.sum(), 1e-12)))
        la, lb = np.log10(ba + 1e-7), np.log10(bb + 1e-7)
        loud = (la.max(1) > -3) & (la.std(1) > 1e-6) & (lb.std(1) > 1e-6)
        band = float(np.mean([np.corrcoef(x, y)[0, 1] for x, y in zip(la[loud], lb[loud])])) if loud.any() else 1.0
        dref, deng = rec["ds"]
        has_ds = np.abs(deng).max() > 0.01
        # DirectSound aligned on its own: the GB channels change mid-frame on the GBA.
        ds = ds_equal(dref, deng, best_offset(dref[:, 0], deng[:, 0], off - 1200, off + 1200)[1]) if has_ds else float("nan")
        ok = (not has_ds or ds >= MIN_DS_EQUAL) and band >= MIN_BAND_CORR and LEVEL_RATIO[0] <= level <= LEVEL_RATIO[1]
        failed += not ok
        equal = f"{ds * 100:6.2f}%" if has_ds else "  (none)"
        print(f"{'pass' if ok else 'FAIL'}  {song:20s} DirectSound equal {equal}   bands {band:.3f}   level {level:.3f}")
    print(f"\n{failed} song(s) differ from the game" if failed else "\nthe engine plays every song like the game")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
