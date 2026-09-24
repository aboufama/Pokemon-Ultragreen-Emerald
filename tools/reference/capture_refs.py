#!/usr/bin/env python3
"""Capture real Pokémon Emerald battle screenshots via the harness ROM.

  python3 tools/reference/capture_refs.py blaziken:blaziken blaziken:zigzagoon --env grass
  python3 tools/reference/capture_refs.py --mirror blaziken,swampert     # X vs X (front + back of X)
  python3 tools/reference/capture_refs.py --mirror-all                   # every species (gauntlet)

Each capture lands in reference/emerald/<player>_vs_<enemy>[@env]/:
  action.png   full frame with the action menu (ground truth for the battle screen)
  obj.png      OBJ layer only (battler sprites + healthboxes) - used for sprite calibration
  bg3.png      BG3 only (battle environment)
  bg0.png      BG0 only (textbox/menus)
  moves.png    move selection menu
  sprites.json OAM/sprite positions for both battlers and healthboxes

Requires tools/reference/build_rom.sh and tools/reference/build_capture.sh to have run.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROM = ROOT / "build/reference/pokeemerald/pokeemerald_modern.gba"
MAP = ROOT / "build/reference/pokeemerald/pokeemerald_modern.map"
CAPTURE = ROOT / "build/reference/capture"
OUT = ROOT / "reference/emerald"

KEEP = ["action", "obj", "bg3", "bg0", "moves"]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pairs", nargs="*", help="player:enemy species slugs")
    ap.add_argument("--mirror", default="", help="comma-separated species, captured as X vs X")
    ap.add_argument("--mirror-all", action="store_true", help="capture X vs X for every species")
    ap.add_argument("--env", default="grass", help="battle environment name (see gfx_meta.json)")
    ap.add_argument("--level", type=int, default=50)
    ap.add_argument("--shiny", action="store_true", help="make both battlers shiny")
    args = ap.parse_args()

    species = json.loads((ROOT / "src/data/generated/species.json").read_text())
    envs = json.loads((ROOT / "src/data/generated/gfx_meta.json").read_text())["environments"]
    if args.env not in envs:
        print(f"unknown env {args.env}; choose from {sorted(envs)}", file=sys.stderr)
        return 1
    for tool in (ROM, MAP, CAPTURE):
        if not tool.exists():
            print(f"missing {tool}; run tools/reference/build_rom.sh and build_capture.sh", file=sys.stderr)
            return 1

    pairs = [tuple(p.split(":", 1)) for p in args.pairs]
    pairs += [(s, s) for s in args.mirror.split(",") if s]
    if args.mirror_all:
        pairs += [(s, s) for s in species]

    flags = 0b11 if args.shiny else 0
    failures = 0
    for player, enemy in pairs:
        if player not in species or enemy not in species:
            print(f"unknown species in {player}:{enemy}", file=sys.stderr)
            failures += 1
            continue
        name = f"{player}_vs_{enemy}" + ("" if args.env == "grass" else f"@{args.env}") + ("_shiny" if args.shiny else "")
        dest = OUT / name
        with tempfile.TemporaryDirectory() as tmp:
            prefix = Path(tmp) / "cap"
            cmd = [
                str(CAPTURE), str(ROM), str(MAP), str(prefix),
                f"player={species[player]['id']}", f"enemy={species[enemy]['id']}",
                f"plevel={args.level}", f"elevel={args.level}",
                f"env={envs[args.env]['id']}", f"flags={flags}",
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode != 0:
                print(f"FAILED {name}: {res.stderr.strip()[-400:]}", file=sys.stderr)
                failures += 1
                continue
            dest.mkdir(parents=True, exist_ok=True)
            for k in KEEP:
                shutil.copy(f"{prefix}_{k}.png", dest / f"{k}.png")
            sprites = json.loads(Path(f"{prefix}_sprites.json").read_text())
            sprites.update({"player": player, "enemy": enemy, "environment": args.env, "level": args.level,
                            "shiny": args.shiny})
            (dest / "sprites.json").write_text(json.dumps(sprites, indent=2) + "\n")
        print(f"captured {name}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
