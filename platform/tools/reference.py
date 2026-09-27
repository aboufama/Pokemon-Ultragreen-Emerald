#!/usr/bin/env python3
"""Run the decomp's own GBA ROM (decomp/pokeemerald/pokeemerald_modern.gba,
built by `make modern`) in mGBA with the same input script as run.mjs, and
save the same frames: the reference the compiled game is compared with
(tools/compare.py).

    python3 platform/tools/reference.py --script platform/tests/boot.json --out build/reference/boot

Needs mGBA's Python bindings (pip: mgba). Frames count from 1: frame N is
the picture after the game's Nth main loop iteration, as in run.mjs.
"""

import argparse
import json
import os

import mgba.core
import mgba.image
import mgba.log

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
KEYS = {'A': 0, 'B': 1, 'SELECT': 2, 'START': 3, 'RIGHT': 4, 'LEFT': 5, 'UP': 6, 'DOWN': 7, 'R': 8, 'L': 9}


def keys_from(text):
    return [KEYS[k.upper()] for k in text.replace(',', '+').replace(' ', '+').split('+') if k]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--script', required=True)
    ap.add_argument('--out')
    ap.add_argument('--rom', default=os.path.join(ROOT, 'decomp/pokeemerald/pokeemerald_modern.gba'))
    ap.add_argument('--around', type=int, default=2, help='also save this many frames before and after each shot (for compare.py --slack)')
    args = ap.parse_args()
    with open(args.script) as f:
        script = json.load(f)
    out = args.out or os.path.join(ROOT, 'build/reference', os.path.splitext(os.path.basename(args.script))[0])
    os.makedirs(out, exist_ok=True)
    mgba.log.silence()
    core = mgba.core.load_path(args.rom)
    width, height = core.desired_video_dimensions()
    image = mgba.image.Image(width, height)
    core.set_video_buffer(image)
    core.reset()
    inputs = {f: keys_from(k) for f, k in script.get('inputs', [])}
    shots = set()
    for f in script.get('shots', []):
        shots.update(range(f - args.around, f + args.around + 1))
    every = script.get('every')
    keys = []
    for f in range(1, script['frames'] + 1):
        if f in inputs:
            keys = inputs[f]
        core.clear_keys(*KEYS.values())
        if keys:
            core.set_keys(*keys)
        core.run_frame()
        if f in shots or (every and f % every == 0):
            with open(os.path.join(out, f'f{f:05d}.png'), 'wb') as fh:
                image.save_png(fh)
    print(f'{script["frames"]} frames; {out}')


if __name__ == '__main__':
    main()
