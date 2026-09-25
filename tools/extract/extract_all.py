#!/usr/bin/env python3
"""Run every decomp extraction step: data, graphics, then sound (which needs g++).

  python3 tools/extract/extract_all.py [path/to/pokeemerald]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import extract_data  # noqa: E402
import extract_gfx  # noqa: E402
import extract_sound  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]

if __name__ == "__main__":
    decomp = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "decomp/pokeemerald"
    if not (decomp / "Makefile").exists():
        sys.exit(f"decomp not found at {decomp} (run: git submodule update --init)")
    extract_data.main(decomp, ROOT / "src/data/generated")
    extract_gfx.main(decomp, ROOT)
    extract_sound.main(decomp)
