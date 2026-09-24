#!/usr/bin/env bash
# Build the pokeemerald "battle harness" ROM used to capture real Emerald
# reference screenshots. The decomp itself is never modified: it is copied to
# a build directory, the harness source is dropped in and the boot callback is
# redirected to it.
#
#   tools/reference/build_rom.sh [decomp_dir] [build_dir]
#
# Requires: arm-none-eabi-gcc/binutils/newlib, libpng-dev, a host C compiler.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DECOMP="${1:-$ROOT/decomp/pokeemerald}"
BUILD="${2:-$ROOT/build/reference/pokeemerald}"

if [ ! -f "$DECOMP/Makefile" ]; then
  echo "decomp not found at $DECOMP (run: git submodule update --init)" >&2
  exit 1
fi

mkdir -p "$BUILD"
# Copy sources (keep previous build products for incremental rebuilds).
rsync -a --delete --exclude .git --exclude build --exclude '*.gba' --exclude '*.elf' --exclude '*.map' \
  --exclude 'tools/*/*.o' "$DECOMP/" "$BUILD/" 2>/dev/null || cp -a "$DECOMP/." "$BUILD/"

cp "$ROOT/tools/reference/harness/battle_harness.c" "$BUILD/src/battle_harness.c"

# Boot straight into the harness instead of the copyright screen.
python3 - "$BUILD/src/main.c" <<'PY'
import sys, re
p = sys.argv[1]
src = open(p).read()
if 'CB2_BattleHarness' not in src:
    src = src.replace('SetMainCallback2(CB2_InitCopyrightScreenAfterBootup);',
                      'SetMainCallback2(CB2_BattleHarness);', 1)
    src = src.replace('static void InitMainCallbacks(void);',
                      'static void InitMainCallbacks(void);\nvoid CB2_BattleHarness(void);', 1)
    open(p, 'w').write(src)
assert 'SetMainCallback2(CB2_BattleHarness);' in src, 'failed to patch main.c'
PY

# Let the harness pick the battle environment instead of the (absent) map tile.
python3 - "$BUILD/src/battle_main.c" <<'PY'
import sys
p = sys.argv[1]
src = open(p).read()
if 'BattleHarness_GetEnvironment' not in src:
    src = src.replace('gBattleEnvironment = BattleSetup_GetEnvironmentId();',
                      'gBattleEnvironment = BattleHarness_GetEnvironment();', 1)
    src = src.replace('#include "battle_main.h"', '#include "battle_main.h"\nu8 BattleHarness_GetEnvironment(void);', 1)
    open(p, 'w').write(src)
assert 'gBattleEnvironment = BattleHarness_GetEnvironment();' in src, 'failed to patch battle_main.c'
PY

make -C "$BUILD" modern -j"$(nproc)" >"$BUILD/build.log" 2>&1 || { tail -40 "$BUILD/build.log"; exit 1; }
echo "ROM: $BUILD/pokeemerald_modern.gba"
echo "MAP: $BUILD/pokeemerald_modern.map"
