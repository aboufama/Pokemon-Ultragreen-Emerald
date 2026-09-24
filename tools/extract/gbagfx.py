"""GBA graphics helpers: palettes, 4bpp indexed images, tilemaps.

Colors are passed through the same 5-bit quantization the hardware applies and
expanded the way mGBA does ((c5 << 3) | (c5 >> 2)), so extracted art matches
emulator screenshots pixel for pixel.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image


def gba_color(r: int, g: int, b: int) -> tuple[int, int, int]:
    def ch(c: int) -> int:
        c5 = c >> 3
        return (c5 << 3) | (c5 >> 2)

    return ch(r), ch(g), ch(b)


def read_jasc_pal(path: Path) -> list[tuple[int, int, int]]:
    if path.suffix == ".gbapal":
        # Binary BGR555 palette (used by multi-form species such as Castform).
        raw = np.fromfile(path, dtype="<u2")
        out = []
        for c in raw:
            c = int(c)
            r5, g5, b5 = c & 31, (c >> 5) & 31, (c >> 10) & 31
            out.append(((r5 << 3) | (r5 >> 2), (g5 << 3) | (g5 >> 2), (b5 << 3) | (b5 >> 2)))
        return out
    lines = path.read_text().split()
    assert lines[0] == "JASC-PAL", path
    count = int(lines[2])
    vals = [int(x) for x in lines[3 : 3 + count * 3]]
    return [gba_color(*vals[i * 3 : i * 3 + 3]) for i in range(count)]


def png_palette(path: Path) -> list[tuple[int, int, int]]:
    im = Image.open(path)
    pal = im.getpalette() or []
    return [gba_color(*pal[i : i + 3]) for i in range(0, len(pal), 3)]


def indexed(path: Path) -> np.ndarray:
    im = Image.open(path)
    if im.mode not in ("P", "L"):
        raise ValueError(f"{path} is not an indexed image ({im.mode})")
    return np.array(im, dtype=np.uint8)


def to_rgba(idx: np.ndarray, palette: list[tuple[int, int, int]], transparent_index: int | None = 0) -> Image.Image:
    pal = np.zeros((256, 4), dtype=np.uint8)
    for i, (r, g, b) in enumerate(palette[:256]):
        pal[i] = (r, g, b, 255)
    if transparent_index is not None:
        pal[transparent_index, 3] = 0
    return Image.fromarray(pal[idx], "RGBA")


def to_indexed_png(idx: np.ndarray, palette: list[tuple[int, int, int]], transparent_index: int = 0) -> Image.Image:
    """Paletted image with index 0 transparent (small files, exact colors)."""
    im = Image.fromarray(idx.astype(np.uint8), "P")
    flat = [c for rgb in palette[:256] for c in rgb]
    im.putpalette(flat + [0] * (768 - len(flat)))
    im.info["transparency"] = transparent_index
    return im


def tiles_of(idx: np.ndarray) -> np.ndarray:
    """Split an indexed image into 8x8 tiles in row-major order: (n, 8, 8)."""
    h, w = idx.shape
    t = idx.reshape(h // 8, 8, w // 8, 8).swapaxes(1, 2).reshape(-1, 8, 8)
    return t


def compose_tilemap(
    tiles: np.ndarray,
    tilemap: np.ndarray,
    width_tiles: int,
    palettes: dict[int, list[tuple[int, int, int]]],
    backdrop: tuple[int, int, int, int] = (0, 0, 0, 0),
    tile_offset: int = 0,
) -> Image.Image:
    """Render a text-mode tilemap (u16 entries) to RGBA.

    palettes maps hardware palette slot -> 16 colors. Color index 0 is
    transparent (shows `backdrop`).
    """
    height_tiles = len(tilemap) // width_tiles
    out = np.zeros((height_tiles * 8, width_tiles * 8, 4), dtype=np.uint8)
    out[:, :] = backdrop
    for i, entry in enumerate(tilemap):
        entry = int(entry)
        tile = (entry & 0x3FF) - tile_offset
        hflip = entry & 0x400
        vflip = entry & 0x800
        pal = palettes.get(entry >> 12)
        if tile < 0 or tile >= len(tiles) or pal is None:
            continue
        px = tiles[tile]
        if hflip:
            px = px[:, ::-1]
        if vflip:
            px = px[::-1, :]
        ty, tx = divmod(i, width_tiles)
        block = out[ty * 8 : ty * 8 + 8, tx * 8 : tx * 8 + 8]
        for y in range(8):
            for x in range(8):
                c = int(px[y, x]) & 0xF
                if c:
                    r, g, b = pal[c]
                    block[y, x] = (r, g, b, 255)
    return Image.fromarray(out, "RGBA")


def palette_blocks(colors: list[tuple[int, int, int]], first_slot: int) -> dict[int, list[tuple[int, int, int]]]:
    return {first_slot + i: colors[i * 16 : i * 16 + 16] for i in range(len(colors) // 16)}
