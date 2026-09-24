#!/usr/bin/env python3
"""Assemble PNG frames into a looping GIF without color loss.

  python3 tools/shots/make_gif.py <frames_dir> <out.gif> [--scale 2] [--fps 30]

Battle frames are RGB555 pixel art with a few dozen colors, so a shared
exact palette is used (per-frame palettes past 256 colors).
"""

import argparse
import glob

import numpy as np
from PIL import Image


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("frames")
    ap.add_argument("out")
    ap.add_argument("--scale", type=int, default=2)
    ap.add_argument("--fps", type=float, default=30)
    a = ap.parse_args()
    files = sorted(glob.glob(f"{a.frames}/*.png"))
    arrs = [np.asarray(Image.open(f).convert("RGB"), dtype=np.uint32) for f in files]
    packed = [(x[..., 0] << 16) | (x[..., 1] << 8) | x[..., 2] for x in arrs]
    colors = np.unique(np.concatenate([p.ravel() for p in packed]))
    frames = []
    if len(colors) <= 256:
        pal = np.zeros((256, 3), dtype=np.uint8)
        pal[: len(colors), 0] = colors >> 16
        pal[: len(colors), 1] = (colors >> 8) & 255
        pal[: len(colors), 2] = colors & 255
        flat = pal.ravel().tolist()
        for p in packed:
            im = Image.fromarray(np.searchsorted(colors, p).astype(np.uint8), "P")
            im.putpalette(flat)
            frames.append(im)
    else:
        # Too many for one table: exact per-frame palettes (local color tables)
        # while each frame fits, adaptive quantization otherwise.
        for x, p in zip(arrs, packed):
            local = np.unique(p)
            if len(local) <= 256:
                pal = np.zeros((256, 3), dtype=np.uint8)
                pal[: len(local), 0] = local >> 16
                pal[: len(local), 1] = (local >> 8) & 255
                pal[: len(local), 2] = local & 255
                im = Image.fromarray(np.searchsorted(local, p).astype(np.uint8), "P")
                im.putpalette(pal.ravel().tolist())
            else:
                im = Image.fromarray(x.astype(np.uint8), "RGB").quantize(256, dither=Image.Dither.NONE)
            frames.append(im)
    if a.scale != 1:
        frames = [f.resize((f.width * a.scale, f.height * a.scale), Image.NEAREST) for f in frames]
    # GIF delays are in 1/100 s: spread the remainder so the average is exact.
    step = 1000.0 / a.fps
    durations, t = [], 0.0
    for i in range(len(frames)):
        nxt = round((i + 1) * step / 10) * 10
        durations.append(max(20, nxt - round(t)))
        t = nxt
    frames[0].save(a.out, save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=1)
    print(f"{a.out}: {len(frames)} frames, {len(colors)} colors")


if __name__ == "__main__":
    main()
