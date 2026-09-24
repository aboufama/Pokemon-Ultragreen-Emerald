"""Extract game data from pret/pokeemerald into JSON for the web runtime.

Outputs (src/data/generated/):
  species.json   per-species stats, types, graphics folder, sprite coords, anims, learnset
  moves.json     battle move data + names
  types.json     type names + effectiveness chart
  abilities.json ability names
  charmap.json   character -> font glyph id (single-glyph entries only)
  fonts.json     glyph width tables for the Latin fonts
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import cparse as C  # noqa: E402


def load_constants(decomp: Path) -> dict[str, int]:
    defines: dict[str, str] = {}
    for rel in [
        "include/constants/global.h",
        "include/constants/species.h",
        "include/constants/moves.h",
        "include/constants/pokemon.h",
        "include/constants/abilities.h",
        "include/constants/battle.h",
        "include/constants/battle_move_effects.h",
        "include/constants/items.h",
        "include/battle_main.h",
        "include/constants/pokemon_animation.h" if (decomp / "include/constants/pokemon_animation.h").exists() else None,
    ]:
        if rel is None:
            continue
        defines.update(C.parse_defines(C.read(decomp / rel)))
    consts = C.resolve_defines(defines)
    return consts


def enum_file(decomp: Path, rel: str, prefix: str) -> dict[str, int]:
    return C.parse_enum_values(C.read(decomp / rel), prefix)


def name_of(consts: dict[str, int], prefix: str) -> dict[int, str]:
    """Reverse map value -> first constant name with a prefix."""
    out: dict[int, str] = {}
    for k, v in consts.items():
        if k.startswith(prefix) and v not in out:
            out[v] = k
    return out


def gender_ratio(expr: str, consts: dict[str, int]) -> int:
    m = re.match(r"PERCENT_FEMALE\(([\d.]+)\)", expr)
    if m:
        return min(254, int(float(m.group(1)) * 255 / 100))
    return int(C.eval_expr(expr, consts))


def main(decomp: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    consts = load_constants(decomp)

    # ---- enums that are not #defines -------------------------------------
    anims_src = C.read(decomp / "include/pokemon_animation.h")
    front_anim_ids = C.parse_enum_values(anims_src, "ANIM_")
    back_anim_ids = C.parse_enum_values(anims_src, "BACK_ANIM_")
    national = enum_file(decomp, "include/constants/pokedex.h", "NATIONAL_DEX_")
    consts.update(national)

    species_ids = {k: v for k, v in consts.items() if k.startswith("SPECIES_") and k not in ("SPECIES_EGG",)}
    num_species = consts["NUM_SPECIES"]
    type_by_value = name_of({k: v for k, v in consts.items() if k.startswith("TYPE_") and not k.startswith("TYPE_MUL")}, "TYPE_")

    # ---- names -----------------------------------------------------------
    species_names = {k: C.parse_string_literal(v) for k, v in
                     C.parse_designated_table(C.read(decomp / "src/data/text/species_names.h"), "gSpeciesNames").items()}
    move_names = {k: C.parse_string_literal(v) for k, v in
                  C.parse_designated_table(C.read(decomp / "src/data/text/move_names.h"), "gMoveNames").items()}
    ability_names = {k: C.parse_string_literal(v) for k, v in
                     C.parse_designated_table(C.read(decomp / "src/data/text/abilities.h"), "gAbilityNames").items()}
    battle_main = C.read(decomp / "src/battle_main.c")
    type_names = {k: C.parse_string_literal(v) for k, v in C.parse_designated_table(battle_main, "gTypeNames").items()}

    # ---- species info ------------------------------------------------------
    info_table = C.parse_designated_table(C.read(decomp / "src/data/pokemon/species_info.h"), "gSpeciesInfo")
    front_coords = C.parse_designated_table(C.read(decomp / "src/data/pokemon_graphics/front_pic_coordinates.h"), "gMonFrontPicCoords")
    back_coords = C.parse_designated_table(C.read(decomp / "src/data/pokemon_graphics/back_pic_coordinates.h"), "gMonBackPicCoords")
    elevation = C.parse_designated_table(C.read(decomp / "src/data/pokemon_graphics/enemy_mon_elevation.h"), "gEnemyMonElevation")

    pokemon_c = C.read(decomp / "src/pokemon.c")
    front_anim_table = C.parse_designated_table(pokemon_c, "sMonFrontAnimIdsTable")
    back_anim_table = C.parse_designated_table(C.read(decomp / "src/pokemon_animation.c"), "sSpeciesToBackAnimSet")

    # national dex: ordered list SPECIES_TO_NATIONAL(NAME) indexed by species - 1
    m = re.search(r"sSpeciesToNationalPokedexNum\s*\[[^\]]*\]\s*=\s*\{", pokemon_c)
    start = m.end() - 1
    body = pokemon_c[start + 1 : C.match_brace(pokemon_c, start) - 1]
    dex_order = re.findall(r"SPECIES_TO_NATIONAL\((\w+)\)", body)

    # graphics folders: species -> symbol -> file path
    def symbol_paths(*rels: str) -> dict[str, str]:
        out: dict[str, str] = {}
        for rel in rels:
            for sym, path in re.findall(r"(g\w+)\[\]\s*=\s*INC\w+\(\"([^\"]+)\"", C.read(decomp / rel)):
                out[sym] = path
        return out

    sym_paths = symbol_paths("src/anim_mon_front_pics.c", "src/data/graphics/pokemon.h")

    def species_symbol_table(rel: str, macro: str) -> dict[str, str]:
        src = C.read(decomp / rel)
        return {f"SPECIES_{a}": b for a, b in re.findall(macro + r"\((\w+),\s*(\w+)\)", src)}

    front_syms = species_symbol_table("src/data/pokemon_graphics/front_pic_table.h", "SPECIES_SPRITE")
    back_syms = species_symbol_table("src/data/pokemon_graphics/back_pic_table.h", "SPECIES_SPRITE")
    pal_syms = species_symbol_table("src/data/pokemon_graphics/palette_table.h", "SPECIES_PAL")
    shiny_syms = species_symbol_table("src/data/pokemon_graphics/shiny_palette_table.h", "SPECIES_SHINY_PAL")

    # level-up learnsets
    learn_src = C.read(decomp / "src/data/pokemon/level_up_learnsets.h")
    learnsets_by_sym: dict[str, list[dict]] = {}
    for sym, body in re.findall(r"static const u16 (\w+)\[\]\s*=\s*\{(.*?)\};", learn_src, re.S):
        moves = [{"level": int(lv), "move": mv} for lv, mv in re.findall(r"LEVEL_UP_MOVE\(\s*(\d+),\s*(\w+)\)", body)]
        learnsets_by_sym[sym] = moves
    learn_ptrs = C.parse_designated_table(C.read(decomp / "src/data/pokemon/level_up_learnset_pointers.h"), "gLevelUpLearnsets")

    def coords(raw: str | None) -> dict | None:
        if raw is None:
            return None
        f = C.parse_struct_fields(raw.strip()[1:-1])
        w, h = (int(x) for x in re.match(r"MON_COORDS_SIZE\((\d+),\s*(\d+)\)", f["size"]).groups())
        return {"width": w, "height": h, "yOffset": int(f["y_offset"])}

    species_out: dict[str, dict] = {}
    for const, sid in sorted(species_ids.items(), key=lambda kv: kv[1]):
        if sid <= 0 or sid >= num_species or const not in info_table:
            continue
        f = C.parse_struct_fields(info_table[const].strip()[1:-1])
        if not f:
            continue
        slug = const[len("SPECIES_"):].lower()
        types = [type_by_value[consts[t]] for t in C.brace_list(f["types"])]
        abilities = [a for a in C.brace_list(f["abilities"])]
        front_sym = front_syms.get(const)
        folder = None
        if front_sym and front_sym in sym_paths:
            folder = str(Path(sym_paths[front_sym]).parent)
        dex_name = dex_order[sid - 1] if sid - 1 < len(dex_order) else None
        entry = {
            "id": sid,
            "const": const,
            "slug": slug,
            "name": species_names.get(const, slug.upper()),
            "nationalDex": national.get(f"NATIONAL_DEX_{dex_name}", 0) if dex_name else 0,
            "baseStats": {
                "hp": int(f["baseHP"]), "attack": int(f["baseAttack"]), "defense": int(f["baseDefense"]),
                "speed": int(f["baseSpeed"]), "spAttack": int(f["baseSpAttack"]), "spDefense": int(f["baseSpDefense"]),
            },
            "types": list(dict.fromkeys(types)),
            "catchRate": int(f["catchRate"]),
            "expYield": int(f["expYield"]),
            "genderRatio": gender_ratio(f["genderRatio"], consts),
            "growthRate": f["growthRate"],
            "abilities": [ability_names.get(a, a) for a in abilities if a != "ABILITY_NONE"],
            "bodyColor": f.get("bodyColor"),
            "noFlip": f.get("noFlip", "FALSE") == "TRUE",
            "gfx": {
                "folder": folder,
                "front": sym_paths.get(front_sym or ""),
                "back": sym_paths.get(back_syms.get(const, "")),
                "palette": sym_paths.get(pal_syms.get(const, "")),
                "shinyPalette": sym_paths.get(shiny_syms.get(const, "")),
            },
            "frontCoords": coords(front_coords.get(const)),
            "backCoords": coords(back_coords.get(const)),
            "elevation": int(elevation.get(const, "0")),
            "frontAnim": front_anim_table.get(f"{const} - 1"),
            "backAnim": back_anim_table.get(const),
            "learnset": [
                {"level": e["level"], "move": e["move"]}
                for e in learnsets_by_sym.get(learn_ptrs.get(const, ""), [])
            ],
        }
        species_out[slug] = entry

    # ---- moves -------------------------------------------------------------
    moves_table = C.parse_designated_table(C.read(decomp / "src/data/battle_moves.h"), "gBattleMoves")
    moves_out: dict[str, dict] = {}
    for const, raw in moves_table.items():
        f = C.parse_struct_fields(raw.strip()[1:-1])
        if const not in consts:
            continue
        flags = [x.strip() for x in f.get("flags", "0").split("|") if x.strip() and x.strip() != "0"]
        moves_out[const] = {
            "id": consts[const],
            "const": const,
            "name": move_names.get(const, const),
            "effect": f.get("effect"),
            "power": int(f.get("power", "0")),
            "type": f.get("type"),
            "accuracy": int(f.get("accuracy", "0")),
            "pp": int(f.get("pp", "0")),
            "secondaryEffectChance": int(f.get("secondaryEffectChance", "0")),
            "target": f.get("target"),
            "priority": int(C.eval_expr(f.get("priority", "0"), consts)),
            "flags": flags,
        }

    # ---- types -------------------------------------------------------------
    m = re.search(r"gTypeEffectiveness\s*\[[^\]]*\]\s*=\s*\{", battle_main)
    start = m.end() - 1
    eff_tokens = C.split_top_level(battle_main[start + 1 : C.match_brace(battle_main, start) - 1])
    chart = []
    for i in range(0, len(eff_tokens) - 2, 3):
        atk, dfn, mul = eff_tokens[i : i + 3]
        chart.append({"attacker": atk, "defender": dfn, "multiplier": mul})
    types_out = {
        "names": {k: v for k, v in type_names.items()},
        "values": {k: consts[k] for k in type_names},
        "chart": chart,
        "multipliers": {k: consts[k] for k in ("TYPE_MUL_NO_EFFECT", "TYPE_MUL_NOT_EFFECTIVE", "TYPE_MUL_NORMAL", "TYPE_MUL_SUPER_EFFECTIVE") if k in consts},
    }

    # ---- charmap -------------------------------------------------------------
    charmap: dict[str, int] = {}
    named: dict[str, list[int]] = {}
    for line in (decomp / "charmap.txt").read_text(encoding="utf-8").splitlines():
        line = line.split("@", 1)[0].rstrip()
        m = re.match(r"^'(.+)'\s*=\s*([0-9A-Fa-f]{2})\s*$", line)
        if m:
            ch = m.group(1).replace("\\'", "'").replace("\\\\", "\\")
            if ch not in charmap:
                charmap[ch] = int(m.group(2), 16)
            continue
        m = re.match(r"^([A-Z_0-9]+)\s*=\s*((?:[0-9A-Fa-f]{2}\s*)+)$", line)
        if m:
            named[m.group(1)] = [int(x, 16) for x in m.group(2).split()]

    # ---- fonts (glyph widths) -------------------------------------------------
    fonts_src = C.read(decomp / "src/fonts.c")
    fonts_out: dict[str, list[int]] = {}
    for sym, body in re.findall(r"const u8 (gFont\w+LatinGlyphWidths)\[\]\s*=\s*\{(.*?)\};", fonts_src, re.S):
        fonts_out[sym] = [int(x) for x in re.findall(r"\d+", body)]

    # ---- growth rates as referenced by species ---------------------------------
    abilities_out = {k: v for k, v in ability_names.items()}

    def dump(name: str, data) -> None:
        (out_dir / name).write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        print(f"wrote {out_dir / name}")

    dump("species.json", species_out)
    dump("moves.json", moves_out)
    dump("types.json", types_out)
    dump("abilities.json", abilities_out)
    dump("charmap.json", {"chars": charmap, "named": named})
    dump("fonts.json", fonts_out)
    dump("anim_ids.json", {"front": front_anim_ids, "back": back_anim_ids})


if __name__ == "__main__":
    decomp = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2] / "decomp/pokeemerald"
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[2] / "src/data/generated"
    main(decomp, out)
