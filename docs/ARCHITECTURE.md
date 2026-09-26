# Architecture: the game is the decomp

Pokémon Ultragreen Emerald runs **Pokémon Emerald's own code**: the C of
[pret/pokeemerald](https://github.com/pret/pokeemerald) (the submodule at
`decomp/pokeemerald`, pinned) compiled to WebAssembly. The overworld, event
scripts, menus, text, battle engine and move animations are that code, line
for line, so the whole game is there as it is reached, with nothing ported by
hand. The remake adds two things around it:

1. **A platform layer** doing what the GBA's hardware and BIOS did.
2. **A remake layer** drawing battles in 3D (the Pokémon, the arenas).

```
 decomp C (unchanged) ──clang wasm32──┐
 decomp data .s ──arm-none-eabi-as──> ELF ──> wasm data objects (same symbols)
 platform C (ours) ───────────────────┤
                                      └──wasm-ld──> game.wasm
 browser: game.wasm frame() 60x/s ──> platform: PPU draws VRAM/OAM/palettes/registers
                                           m4a sound, input, save, clock
                                  ──> remake layer: 3D battlers + arenas composited
```

## Rules

- **Never hand-port or re-implement game logic.** If the game does it, the
  compiled decomp does it. A new map, move, script, menu or species is already
  there.
- **The decomp stays unmodified.** What must change is a small, listed set of
  patches in `platform/patches/` applied to a copy at build time, each guarded by
  `#ifdef REMAKE` or `#ifdef PLATFORM_WASM` and explained.
- **The remake layer hooks narrowly.** It reads the game's state (battler
  sprites, palettes, the battle's environment) through a small C API in
  `platform/`, and replaces only what it draws. Every hook is in the list below.
- **Frameworks, not one-offs.** Every addition works for the whole game: a
  hook covers every battle, every species, every move.

## Build (`platform/build.mjs`)

1. The decomp's own tools (`make tools`) and its data build (graphics, maps
   JSON to assembly, text through `preproc`) run as the decomp's Makefile runs
   them.
2. **C**: each `src/*.c` and `gflib/*.c`, preprocessed exactly as the Makefile
   does (`cpp` then `preproc` with `charmap.txt`), compiled by clang for
   `wasm32` (freestanding). 307 of 310 compile unchanged; `script.c` needs one
   patch (`svc 2`), the wireless adapter and multiboot are stubbed.
3. **Data**: each `data/*.s` (event, battle, battle animation and AI scripts,
   maps, sound) assembled by `arm-none-eabi-as` with the decomp's macros, then
   `platform/tools/elf2wasm.py` converts the ELF object to a WebAssembly data
   object: the same bytes, the same symbols, every pointer a relocation
   (function pointers typed from the build's DWARF).
4. **Platform C** (below) and a minimal libc.
5. `wasm-ld`: the GBA's memory map lives at its own addresses in linear memory
   (I/O at 0x04000000, palettes 0x05000000, VRAM 0x06000000, OAM 0x07000000),
   so the game's register and VRAM accesses work unchanged.

## Platform layer (`platform/`)

| GBA | here |
|---|---|
| main loop, `VBlankIntrWait` | `AgbMain` split into init and one frame, run by the browser 60 times a second |
| interrupts | VBlank, HBlank (per line, while drawing) and timer handlers called from `gIntrTable` |
| DMA | immediate transfers at once; HBlank DMA per line while drawing (scanline effects) |
| BIOS | `CpuSet`, `CpuFastSet`, `LZ77UnComp*`, `RLUnComp*`, `Div`, `Sqrt`, `ArcTan2`, `BgAffineSet`, `ObjAffineSet`... in C |
| PPU | a line renderer: modes 0-2, text and affine BGs, regular and affine OBJs, windows (WIN0/1, OBJ window), blending, mosaic |
| sound | the m4a engine (`m4a.c` compiled; the assembly core of `m4a_1.s` replaced), mixed in an AudioWorklet |
| save flash | browser storage |
| real-time clock | the device's clock |
| keypad | keyboard, touch pad, gamepad |

## Remake layer (`src/remake/`)

Battles are the game's battles, with these substitutions:

| the game draws | the remake draws | how it knows |
|---|---|---|
| each battler's sprite | the species' 3D model, placed where the sprite is, following its offsets, affine scale/rotation, visibility and palette blends frame by frame | the battler sprite (`gBattlerSpriteIds`) read each frame |
| a move's motion of the attacker (lunge, shake, spin) | the same motion on the 3D body, with an in-place acting clip in sync | the move animation script running (`gAnimMoveIndex`, attacker, target) |
| the battle background (BG3) | the painted 3D arena for the battle's environment | `gBattleEnvironment` |
| the faint's slide down | the curl over and shrink | the faint sprite callback starting |
| an OBJ-window copy of a battler (stat changes) | the 3D battler's silhouette | the copy's source battler |

A species without a 3D model is drawn by the game (its 2D sprite): the layer
only substitutes what it has.

## Content milestones

**The opening (new game to Route 101's grass)**: title, Birch's speech (Lotad),
Brendan or May, the truck, Littleroot (the movers, the clock, Dad on TV, the
rival's house), Birch chased by a Zigzagoon on Route 101, the starter from his
bag, the lab, and wild battles in Route 101's grass. Maps: Inside of Truck,
Littleroot Town, Brendan's and May's houses (1F, 2F), Prof. Birch's Lab, Route
101. New 3D species: Treecko, Torchic, Mudkip, Zigzagoon, Wurmple, Poochyena.

## What the earlier code becomes

The TypeScript battle engine, battle UI and transitions (`src/battle/`) were a
re-implementation; the compiled game replaces them. The 3D stack (`src/anim`,
`src/battle3d`, `src/render3d`, `src/pokemon`) is the remake layer's and stays.
The playtest's battles move onto the compiled game once the remake layer draws
its battles.
