#!/usr/bin/env python3
"""Compare the compiled game's frames (tools/run.mjs) with the GBA ROM's
(tools/reference.py).

Colors are compared as the GBA's (5 bits a channel). A pixel whose channels
are all within 1 of the reference's is "near": mGBA's renderer blends colors
expanded to 8 bits, which rounds some blended pixels one step up from the
GBA's own 5-bit blending (the platform keeps the GBA's). Any other difference
counts. A frame that differs is also tried against the reference's frames
up to --slack before and after (a timing shift, reported as such).

    python3 platform/tools/compare.py build/run/boot build/reference/boot --slack 2
"""

import argparse
import glob
import os

from PIL import Image


def load(path):
    im = Image.open(path).convert('RGB')
    return bytes(b >> 3 for b in im.tobytes()), im.size


def differences(a, b):
    exact = near = 0
    far = []
    for i in range(0, len(a), 3):
        if a[i:i + 3] == b[i:i + 3]:
            continue
        if max(abs(a[i + k] - b[i + k]) for k in range(3)) <= 1:
            near += 1
        else:
            far.append(i // 3)
    return far, near


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ours')
    ap.add_argument('reference')
    ap.add_argument('--slack', type=int, default=0)
    args = ap.parse_args()
    names = sorted(os.path.basename(p) for p in glob.glob(os.path.join(args.ours, 'f?????.png')))
    refs = {os.path.basename(p): p for p in glob.glob(os.path.join(args.reference, 'f?????.png'))}
    failing = 0
    for name in names:
        if name not in refs:
            continue
        ours, size = load(os.path.join(args.ours, name))
        ref, _ = load(refs[name])
        far, near = differences(ours, ref)
        shift = None
        if far and args.slack:
            n = int(name[1:6])
            for d in range(1, args.slack + 1):
                for m in (n + d, n - d):
                    alt = refs.get(f'f{m:05d}.png')
                    if alt:
                        f2, n2 = differences(ours, load(alt)[0])
                        if not f2:
                            shift, far, near = m - n, f2, n2
                            break
                if shift is not None:
                    break
        if far:
            failing += 1
            status = f'{len(far)} px differ'
            w, h = size
            im = Image.new('RGB', (w * 3, h))
            im.paste(Image.open(os.path.join(args.ours, name)).convert('RGB'), (0, 0))
            im.paste(Image.open(refs[name]).convert('RGB'), (w, 0))
            mask = Image.new('RGB', (w, h))
            px = mask.load()
            for i in far:
                px[i % w, i // w] = (255, 0, 255)
            im.paste(mask, (w * 2, 0))
            im.save(os.path.join(args.ours, name.replace('.png', '.diff.png')))
        else:
            status = 'same' if not near else f'same ({near} px one step off: blending)'
        if shift is not None:
            status += f', as the reference {abs(shift)} frame{"s" if abs(shift) > 1 else ""} {"later" if shift > 0 else "earlier"}'
        print(f'{name}: {status}')
    print('every frame matches' if not failing else f'{failing} frame(s) differ')
    raise SystemExit(1 if failing else 0)


if __name__ == '__main__':
    main()
