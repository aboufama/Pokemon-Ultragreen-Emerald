"""Extract battle graphics from pret/pokeemerald into web-ready RGBA PNGs.

Output root: public/assets/gba/
  battle_env/<environment>.png          composed BG3 (tiles + tilemap + palette), 256x256:
                                        reference for the arenas' art, never drawn
  battle_interface/textbox.png          composed BG0 with the 3 pages (message/action/move), 256x512
  battle_interface/*.png                healthboxes, hp/exp bars, status icons (index 0 transparent)
  fonts/<font>.png                      glyph sheets, 2-bit index kept in the red channel (see font.ts)
  pokemon/<slug>/{front,back}[_shiny].png, palette.json
  trainers/<name>_back.png
  balls/<ball>.png
  menu/*.png                            setup screens: Birch's bag, window frame, type icons, cursors
  title/*.png                           the title screen: Rayquaza, clouds, the logo, EMERALD VERSION, PRESS START
Plus src/data/generated/gfx_meta.json with environment ids and palettes needed at runtime,
and the battle transitions' GridSquares pattern.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import cparse as C  # noqa: E402
import gbagfx as G  # noqa: E402


def save(im: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if im.mode == "P":
        im.save(path, optimize=True, transparency=im.info.get("transparency", 0), bits=4 if int(np.array(im).max()) < 16 else 8)
    else:
        im.save(path, optimize=True)


def symbol_files(decomp: Path, rel: str) -> dict[str, str]:
    src = C.read(decomp / rel)
    return {sym: path for sym, path in re.findall(r"(g\w+)\[\]\s*=\s*INC\w+\(\"([^\"]+)\"", src)}


def extract_environments(decomp: Path, out: Path, meta: dict) -> None:
    syms = symbol_files(decomp, "src/data/graphics/battle_environment.h")
    consts = C.resolve_defines(C.parse_defines(C.read(decomp / "include/constants/battle.h")))
    table = C.parse_designated_table(C.read(decomp / "src/battle_bg.c"), "sBattleEnvironmentTable")
    envs = {}
    for key, raw in table.items():
        f = C.parse_struct_fields(raw.strip()[1:-1])
        name = key[len("BATTLE_ENVIRONMENT_"):].lower()
        tiles = decomp / syms[f["tileset"]]
        tilemap = decomp / syms[f["tilemap"]]
        pal = G.read_jasc_pal(decomp / syms[f["palette"]])
        tile_px = G.tiles_of(G.indexed(tiles))
        tm = np.fromfile(tilemap, dtype="<u2")
        im = G.compose_tilemap(tile_px, tm[:1024], 32, G.palette_blocks(pal, 2))
        save(im, out / "battle_env" / f"{name}.png")
        envs[name] = {
            "id": consts[key],
            "const": key,
            "image": f"battle_env/{name}.png",
            "palette": [list(c) for c in pal],
        }
        print(f"env {name}: {tiles.parent.name}")
    meta["environments"] = envs


def extract_textbox(decomp: Path, out: Path, meta: dict, frame_type: int = 0) -> None:
    """Compose BG0 exactly as LoadBattleTextboxAndBackground leaves it.

    LoadBattleMenuWindowGfx then copies the player's window frame (options
    frame type, default 0 = text_window/1.png) over BG0 tiles 0x12 and 0x22
    and its palette into BG palette 1; the menu borders use those tiles.
    """
    bi = decomp / "graphics/battle_interface"
    pal = G.read_jasc_pal(bi / "textbox_0.pal") + G.read_jasc_pal(bi / "textbox_1.pal")
    tiles = G.tiles_of(G.indexed(bi / "textbox.png"))
    frame_png = decomp / "graphics/text_window" / f"{frame_type + 1}.png"
    frame_tiles = G.tiles_of(G.indexed(frame_png))[:9]
    tiles = tiles.copy()
    # Verified against a VRAM dump of the running battle (capture dump=1): the
    # copy at 0x12 - the one the menu borders use - has its transparent
    # pixels turned into color 15 (the dark outline), the copy at 0x22 is raw.
    ringed = frame_tiles.copy()
    ringed[ringed == 0] = 15
    tiles[0x12 : 0x12 + len(frame_tiles)] = ringed
    tiles[0x22 : 0x22 + len(frame_tiles)] = frame_tiles
    pal[16:32] = G.png_palette(frame_png)[:16]
    tm = np.fromfile(bi / "textbox_map.bin", dtype="<u2")
    im = G.compose_tilemap(tiles, tm, 32, G.palette_blocks(pal, 0))
    save(im, out / "battle_interface" / "textbox.png")
    # Menu cursor: BG0 tiles 1 and 2 stacked. CopyToBgTilemapBufferRect_ChangePalette
    # is called with palette 0x11, which CopyTileMapEntry treats as "keep the
    # source entry", i.e. palette 0.
    cursor = np.vstack([tiles[1], tiles[2]])
    save(G.to_rgba(cursor, pal[0:16]), out / "battle_interface" / "cursor.png")
    # Text colors: message windows use BG palette 0, menus use palette 5
    # (gBattleWindowTextPalette = text.pal); PP colors come from text_pp.pal.
    meta["textboxPalette"] = [list(c) for c in pal[:16]]
    meta["windowTextPalette"] = [list(c) for c in G.read_jasc_pal(bi / "text.pal")]
    meta["windowTextPpPalette"] = [list(c) for c in G.read_jasc_pal(bi / "text_pp.pal")]


def extract_interface(decomp: Path, out: Path, meta: dict) -> None:
    bi = decomp / "graphics/battle_interface"
    healthbox_pal = G.png_palette(bi / "ball_status_bar.png")
    healthbar_pal = G.png_palette(bi / "ball_display.png")
    meta["healthboxPalette"] = [list(c) for c in healthbox_pal[:16]]
    meta["healthbarPalette"] = [list(c) for c in healthbar_pal[:16]]
    # Healthbox frames use the status-bar palette; bar fills use ball_display's.
    for name, pal in [
        ("healthbox_singles_player", healthbox_pal),
        ("healthbox_singles_opponent", healthbox_pal),
        ("healthbox_doubles_player", healthbox_pal),
        ("healthbox_doubles_opponent", healthbox_pal),
        ("healthbox_safari", healthbox_pal),
        ("expbar", healthbox_pal),
        ("misc", healthbox_pal),
        ("status", healthbox_pal),
        ("hpbar", healthbar_pal),
        ("hpbar_anim", healthbar_pal),
        ("level_up_banner", None),
    ]:
        p = bi / f"{name}.png"
        if not p.exists():
            continue
        idx = G.indexed(p)
        use_pal = pal if pal is not None else G.png_palette(p)
        save(G.to_rgba(idx, use_pal), out / "battle_interface" / f"{name}.png")
    # status icons each have their own palette embedded in status{,2,3,4}.png
    for name in ["status2", "status3", "status4"]:
        p = bi / f"{name}.png"
        if p.exists():
            save(G.to_rgba(G.indexed(p), G.png_palette(p)), out / "battle_interface" / f"{name}.png")


def extract_fonts(decomp: Path, out: Path) -> None:
    # Keep the 2-bit glyph index: 0 = background, 1 = foreground, 2 = shadow,
    # 3 = glyph box (drawn as background). Stored in the red channel * 85.
    for name in ["latin_normal", "latin_narrow", "latin_small", "latin_short", "latin_small_narrow"]:
        idx = G.indexed(decomp / "graphics/fonts" / f"{name}.png").astype(np.uint16)
        rgba = np.zeros(idx.shape + (4,), dtype=np.uint8)
        rgba[..., 0] = (idx * 85).astype(np.uint8)
        rgba[..., 3] = 255
        save(Image.fromarray(rgba, "RGBA"), out / "fonts" / f"{name}.png")
    # Text "continue" arrows are drawn with the window's palette: keep the
    # 4bpp index (red channel * 16, alpha 0 for index 0).
    for name in ["down_arrow", "down_arrow_alt"]:
        idx = G.indexed(decomp / "graphics/fonts" / f"{name}.png").astype(np.uint16)
        rgba = np.zeros(idx.shape + (4,), dtype=np.uint8)
        rgba[..., 0] = (idx * 16).astype(np.uint8)
        rgba[..., 3] = np.where(idx > 0, 255, 0).astype(np.uint8)
        save(Image.fromarray(rgba, "RGBA"), out / "fonts" / f"{name}.png")


def resolve_gfx(decomp: Path, rel: str | None) -> Path | None:
    """Map a graphics path from the tables to a source file.

    Multi-form species (Castform) reference build products assembled from
    per-form subfolders; fall back to the normal form's source files.
    """
    if not rel:
        return None
    p = decomp / rel
    if p.exists():
        return p
    alts = [p.with_suffix(".png"), p.with_suffix(".pal"), p.parent / "normal" / p.name]
    alts += [p.parent / "normal" / p.with_suffix(".png").name, p.parent / "normal" / p.with_suffix(".pal").name]
    for alt in alts:
        if alt.exists():
            return alt
    return None


def extract_pokemon(decomp: Path, out: Path, species: dict) -> None:
    skipped = []
    for slug, s in species.items():
        gfx = s["gfx"]
        front_p, back_p = resolve_gfx(decomp, gfx.get("front")), resolve_gfx(decomp, gfx.get("back"))
        pal_p, shiny_p = resolve_gfx(decomp, gfx.get("palette")), resolve_gfx(decomp, gfx.get("shinyPalette"))
        if not front_p or not pal_p:
            skipped.append(slug)
            continue
        normal = G.read_jasc_pal(pal_p)
        shiny = G.read_jasc_pal(shiny_p) if shiny_p else normal
        dest = out / "pokemon" / slug
        front = G.indexed(front_p)
        # anim_front.png holds the battle frames (64x128 = 2 frames); still pics may be taller.
        save(G.to_indexed_png(front, normal), dest / "front.png")
        save(G.to_indexed_png(front, shiny), dest / "front_shiny.png")
        if back_p:
            back = G.indexed(back_p)
            save(G.to_indexed_png(back, normal), dest / "back.png")
            save(G.to_indexed_png(back, shiny), dest / "back_shiny.png")
        (dest / "palette.json").write_text(json.dumps({"normal": normal, "shiny": shiny}) + "\n")
    print(f"pokemon sprites: {len(species) - len(skipped)} (skipped: {skipped})")


def extract_trainers_and_balls(decomp: Path, out: Path) -> None:
    for name in ["brendan", "may"]:
        idx = G.indexed(decomp / "graphics/trainers/back_pics" / f"{name}.png")
        pal = G.read_jasc_pal(decomp / "graphics/trainers/palettes" / f"{name}.pal")
        save(G.to_rgba(idx, pal), out / "trainers" / f"{name}_back.png")
    for p in sorted((decomp / "graphics/balls").glob("*.png")):
        save(G.to_rgba(G.indexed(p), G.png_palette(p)), out / "balls" / p.name)


def extract_battle_anim_sprites(decomp: Path, out: Path, meta: dict) -> None:
    """Stock battle animation particles (fire, impact, claw slash, foot, ...).

    Each gBattleAnimSpriteGfx_<Name> is paired with gBattleAnimSpritePal_<Name>
    (embedded PNG palette or a .pal file) as in src/graphics.c.
    """
    src = C.read(decomp / "src/graphics.c")
    gfx = dict(re.findall(r"gBattleAnimSpriteGfx_(\w+)\[\]\s*=\s*INC\w+\(\"([^\"]+)\"", src))
    pals = dict(re.findall(r"gBattleAnimSpritePal_(\w+)\[\]\s*=\s*INC\w+\(\"([^\"]+)\"", src))
    names = []
    for name, path in sorted(gfx.items()):
        png = decomp / path
        if png.suffix != ".png" or not png.exists():
            continue
        pal_path = decomp / pals.get(name, path)
        try:
            pal = G.read_jasc_pal(pal_path) if pal_path.suffix == ".pal" else G.png_palette(pal_path)
            idx = G.indexed(png)
        except (ValueError, OSError):
            continue
        if idx.max() >= len(pal):
            idx = idx & 0xF
        save(G.to_indexed_png(idx, pal), out / "battle_anims" / f"{name}.png")
        names.append(name)
    meta["battleAnimSprites"] = names
    print(f"battle anim sprites: {len(names)}")


def extract_menus(decomp: Path, out: Path, meta: dict) -> None:
    """Graphics of the menus around the battles (the playtest's setup screens).

      menu/starter_bg.png       Birch's bag on the grass, as starter_choose.c
                                shows it (BG3 bag over BG2 grass), 240x160
      menu/pokeball_select.png  Poké Ball frames (still, tilted left/right) and
                                the pointing hand, 32x32 each, stacked
      menu/starter_circle.png   the white circle the chosen Pokémon appears in
      menu/frame_1.png          the standard window frame (3x3 tiles)
      menu/menu_info.png        type icons and the TYPE / POWER / ACCURACY / PP labels
      menu/arrow_cursor.png, menu/scroll_indicator.png
      menu/keypad_icons.png     the button icons text can show ({A_BUTTON}...)
      menu/down_arrow.png       the arrow a message shows while it waits for A
    Plus meta['menuTextPalette']: the message box palette (1 white, 2 dark
    gray, 3 light gray), which standard windows print with.
    """
    sc = decomp / "graphics/starter_choose"
    tiles = G.tiles_of(G.indexed(sc / "tiles.png"))
    pal = G.png_palette(sc / "tiles.png")
    blocks = G.palette_blocks(pal, 0)
    grass = G.compose_tilemap(tiles, np.fromfile(sc / "birch_grass.bin", dtype="<u2"), 32, blocks, backdrop=(*pal[0], 255))
    bag = G.compose_tilemap(tiles, np.fromfile(sc / "birch_bag.bin", dtype="<u2"), 32, blocks)
    screen = grass.copy()
    screen.alpha_composite(bag, (0, 0))
    save(screen.crop((0, 0, 240, 160)), out / "menu" / "starter_bg.png")
    for src, name in [
        (sc / "pokeball_selection.png", "pokeball_select.png"),
        (sc / "starter_circle.png", "starter_circle.png"),
        (decomp / "graphics/text_window/1.png", "frame_1.png"),
        (decomp / "graphics/interface/menu_info.png", "menu_info.png"),
        (decomp / "graphics/interface/arrow_cursor.png", "arrow_cursor.png"),
        (decomp / "graphics/interface/scroll_indicator.png", "scroll_indicator.png"),
        # {A_BUTTON}, {START_BUTTON}... in text (drawn in the text palette's colors).
        (decomp / "graphics/fonts/keypad_icons.png", "keypad_icons.png"),
        # The "more text" arrow at the end of a message page (sDownArrowTiles).
        (decomp / "graphics/fonts/down_arrow.png", "down_arrow.png"),
    ]:
        save(G.to_rgba(G.indexed(src), G.png_palette(src)), out / "menu" / name)
    meta["menuTextPalette"] = [list(c) for c in G.png_palette(decomp / "graphics/text_window/message_box.png")[:16]]
    meta["frame1Palette"] = [list(c) for c in G.png_palette(decomp / "graphics/text_window/1.png")[:16]]


def extract_title(decomp: Path, out: Path) -> None:
    """The title screen's layers, as title_screen.c sets them up.

      title/rayquaza.png        BG0, Rayquaza (256x256; color 0 clear)
      title/rayquaza_marks.png  where BG0 uses palette 14 color 15: Rayquaza's
                                markings, whose color UpdateLegendaryMarkingColor pulses
      title/clouds.png          BG1, the clouds blended over Rayquaza (256x256)
      title/logo.png            BG2, the POKéMON logo (8bpp affine map, 256x256)
      title/logo_shine.png      the shine sprite (64x64) whose shape lightens the logo
      title/emerald_version.png the EMERALD VERSION banner (two 64x32 sprites side by side)
      title/press_start.png     PRESS START (the five 32x8 sprite frames in a row)
    The BG palettes are pokemon_logo.pal's first 224 colors then
    rayquaza_and_clouds.pal (palette 14), as gTitleScreenBgPalettes.
    """
    t = decomp / "graphics/title_screen"
    bg_pal = G.read_jasc_pal(t / "pokemon_logo.pal")[:224] + G.read_jasc_pal(t / "rayquaza_and_clouds.pal")[:16]
    blocks = G.palette_blocks(bg_pal, 0)
    rq_tiles = G.tiles_of(G.indexed(t / "rayquaza.png"))
    rq_map = np.fromfile(t / "rayquaza.bin", dtype="<u2")
    save(G.compose_tilemap(rq_tiles, rq_map, 32, blocks), out / "title" / "rayquaza.png")
    marks = np.zeros((256, 256, 4), dtype=np.uint8)
    for i, entry in enumerate(rq_map):
        entry = int(entry)
        if entry >> 12 != 14:
            continue
        px = rq_tiles[entry & 0x3FF]
        if entry & 0x400:
            px = px[:, ::-1]
        if entry & 0x800:
            px = px[::-1, :]
        ty, tx = divmod(i, 32)
        marks[ty * 8 : ty * 8 + 8, tx * 8 : tx * 8 + 8][(px & 0xF) == 15] = (255, 255, 255, 255)
    save(Image.fromarray(marks, "RGBA"), out / "title" / "rayquaza_marks.png")
    cl_tiles = G.tiles_of(G.indexed(t / "clouds.png"))
    save(G.compose_tilemap(cl_tiles, np.fromfile(t / "clouds.bin", dtype="<u2"), 32, blocks), out / "title" / "clouds.png")
    # The logo: an 8bpp affine map, one byte per tile, 32x32.
    logo_tiles = G.tiles_of(G.indexed(t / "pokemon_logo.png"))
    logo_map = np.fromfile(t / "pokemon_logo.bin", dtype=np.uint8)
    logo = np.zeros((256, 256, 4), dtype=np.uint8)
    for i, tile in enumerate(logo_map):
        ty, tx = divmod(i, 32)
        px = logo_tiles[int(tile)]
        for y in range(8):
            for x in range(8):
                c = int(px[y, x])
                if c and c < len(bg_pal):
                    logo[ty * 8 + y, tx * 8 + x] = (*bg_pal[c], 255)
    save(Image.fromarray(logo, "RGBA"), out / "title" / "logo.png")
    for name in ["logo_shine", "emerald_version"]:
        save(G.to_rgba(G.indexed(t / f"{name}.png"), G.png_palette(t / f"{name}.png")), out / "title" / f"{name}.png")
    # PRESS START: sprite frames 1, 5, 9, 13, 17 (32x8 each, four tiles from
    # that tile on), with tiles numbered in 4x1 blocks across the sheet.
    ps = G.indexed(t / "press_start.png")
    per_row = ps.shape[1] // 32
    vram = []
    for m in range((ps.shape[0] // 8) * per_row):
        mx, my = m % per_row, m // per_row
        for k in range(4):
            vram.append(ps[my * 8 : my * 8 + 8, mx * 32 + k * 8 : mx * 32 + k * 8 + 8])
    frames = [np.concatenate(vram[f : f + 4], axis=1) for f in (1, 5, 9, 13, 17)]
    save(G.to_rgba(np.concatenate(frames, axis=1), G.png_palette(t / "press_start.png")), out / "title" / "press_start.png")


def extract_transitions(decomp: Path, meta: dict) -> None:
    """GridSquares (battle_transition.c) fills every 8x8 cell with the shrinking-box
    tiles, one stage every 3 frames: for each pixel of a cell, the first stage
    (tile) that fills it (99: never)."""
    tiles = G.indexed(decomp / "graphics/battle_transitions/shrinking_box.png")
    fill = []
    for y in range(8):
        for x in range(8):
            stages = [k for k in range(tiles.shape[0] // 8) if tiles[k * 8 + y, x]]
            fill.append(stages[0] if stages else 99)
    meta["gridSquaresFill"] = fill


def main(decomp: Path, root: Path) -> None:
    out = root / "public/assets/gba"
    data_dir = root / "src/data/generated"
    species = json.loads((data_dir / "species.json").read_text())
    meta: dict = {}
    extract_environments(decomp, out, meta)
    extract_textbox(decomp, out, meta)
    extract_interface(decomp, out, meta)
    extract_fonts(decomp, out)
    extract_trainers_and_balls(decomp, out)
    extract_battle_anim_sprites(decomp, out, meta)
    extract_pokemon(decomp, out, species)
    extract_menus(decomp, out, meta)
    extract_title(decomp, out)
    extract_transitions(decomp, meta)
    (data_dir / "gfx_meta.json").write_text(json.dumps(meta, separators=(",", ":")) + "\n")
    print(f"wrote {data_dir / 'gfx_meta.json'}")


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[2]
    decomp = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "decomp/pokeemerald"
    main(decomp, root)
