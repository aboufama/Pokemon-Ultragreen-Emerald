#!/usr/bin/env bash
# Build mGBA (as a static library) and the headless reference tools: capture
# (screenshots of a battle) and sound (recordings of the game's sound engine).
#
#   tools/reference/build_capture.sh [mgba_src_dir]
#
# mGBA is cloned from https://github.com/mgba-emu/mgba when no source dir is given.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/build/reference"
MGBA="${1:-$OUT/mgba}"
mkdir -p "$OUT"

if [ ! -f "$MGBA/CMakeLists.txt" ]; then
  git clone --depth 1 https://github.com/mgba-emu/mgba "$MGBA"
fi

if [ ! -f "$MGBA/build/libmgba.a" ]; then
  cmake -S "$MGBA" -B "$MGBA/build" -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_QT=OFF -DBUILD_SDL=OFF -DBUILD_STATIC=ON -DBUILD_SHARED=OFF -DUSE_FFMPEG=OFF \
    -DUSE_EDITLINE=OFF -DUSE_ELF=OFF -DUSE_LZMA=OFF -DUSE_DISCORD_RPC=OFF -DUSE_SQLITE3=OFF \
    -DUSE_LUA=OFF -DUSE_DEBUGGERS=OFF -DBUILD_GL=OFF -DBUILD_GLES2=OFF -DBUILD_GLES3=OFF \
    -DUSE_EPOXY=OFF -DM_CORE_GB=OFF -DUSE_MINIZIP=OFF -DUSE_LIBZIP=OFF -DUSE_PNG=ON -DUSE_ZLIB=ON \
    -DBUILD_PERF=OFF -DBUILD_TEST=OFF -DBUILD_SUITE=OFF -DBUILD_EXAMPLE=OFF -DUSE_JSON_C=OFF \
    -DENABLE_SCRIPTING=OFF >/dev/null
  make -C "$MGBA/build" -j"$(nproc)" mgba >/dev/null
fi

# Compile with exactly the defines libmgba was built with; several public
# structs (e.g. struct mCore) change layout depending on them.
DEFINES="$(sed -n 's/^C_DEFINES = //p' "$MGBA/build/CMakeFiles/mgba.dir/flags.make")"
# ...and the libraries those options pull in.
LIBS="-lpng -lz -lm -lpthread"
case " $DEFINES " in *" -DUSE_FREETYPE "*) LIBS="$LIBS -lfreetype" ;; esac
case " $DEFINES " in *" -DUSE_SQLITE3 "*) LIBS="$LIBS -lsqlite3" ;; esac
case " $DEFINES " in *" -DUSE_LIBZIP "*) LIBS="$LIBS -lzip" ;; esac
case " $DEFINES " in *" -DUSE_LZMA "*) LIBS="$LIBS -llzma" ;; esac
case " $DEFINES " in *" -DUSE_ELF "*) LIBS="$LIBS -lelf" ;; esac

for tool in capture sound; do
  cc -O2 -std=gnu11 $DEFINES \
    -I"$MGBA/include" -I"$MGBA/build/include" \
    "$ROOT/tools/reference/capture/$tool.c" \
    "$MGBA/build/libmgba.a" $LIBS \
    -o "$OUT/$tool"
  echo "built $OUT/$tool"
done
