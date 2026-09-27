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

1. **The decomp's own build** (`make modern DINFO=1`): its tools, its generated
   graphics and maps, its data assembled into ARM objects, and the GBA ROM
   with debug info (the reference the tools below compare with).
2. **C**: each `src/*.c`, preprocessed as the Makefile does (`cpp`, then
   `preproc` for text and `INCBIN`), then:
   - **the GBA's struct layout** (`tools/apcs_layout.mjs`): the GBA build's
     `-mabi=apcs-gnu` rounds every struct and union to 4 bytes, and the data
     files and saves are laid out for it; every non-packed struct definition
     gets `aligned(4)`. `tools/layouts.py` checks all 614 types against the
     GBA build's debug info.
   - compiled by clang for `wasm32` to LLVM IR;
   - **timed** (`tools/cpu_time.mjs`): each basic block adds its instructions'
     ARM7 cost to the platform's CPU clock, corrected function by function
     where it was measured against the ROM (`tools/cpu_time.json`, from
     `tools/calibrate.py`); copies and fills cost by their size, as newlib's
     memcpy and memset do on the GBA; each loop turn polls the hardware, so
     interrupts arrive inside loops that touch no register; the functions
     lose the memory effects the first compile inferred for them (one said
     to write only through its arguments now writes the clock, and a caller
     trusting that would drop its time);
   - **I/O hooked** (`tools/volatile_io.mjs`): every volatile access to
     0x04xxxxxx goes to the platform, which gives registers the hardware's
     behavior; other memory is untouched.
3. **Patches** (`platform/patches/*.patch`, applied to copies): the main loop
   split into init and one iteration (`main.c`), code the GBA runs from RAM
   or as assembly (the wireless library's callbacks and copies, multiboot's
   cycle-counting delay, the script engine's halt), two linker constants
   (`m4a.c`). Each patch explains itself.
4. **Replaced**: the hardware drivers (`platform/game`, compiled like the
   game): the flash chip and the real-time clock (each call as long as the
   GBA driver's, measured with `tools/timing.py`), the GameCube link, and the
   sound engine's assembly half (`m4a_1.s`: the sequencer and the mixer,
   ported to C instruction by instruction and timed as the GBA's).
5. **Data** (`tools/elf2wasm.py`): each ARM data object converted to a wasm
   object with the same bytes (`.incbin`) and symbols, every pointer a
   relocation, function references typed from the C objects (`tools/wasmobj.py`).
6. **Link** (`wasm-ld`): 128 MB of memory, the GBA's I/O, palettes, VRAM and
   OAM at their own addresses; then `wasm-opt --fpcast-emu` so a call through
   a pointer of another type works as on the GBA (extra arguments ignored, a
   missing result 0).

## Platform layer (`platform/src`)

| GBA | here |
|---|---|
| CPU time | `gPlatformCycles`: the game's basic blocks, register polls, BIOS calls, DMA, interrupts' way in and out, the sound engine and the drivers' delays move it, each as long as on the GBA (measured on the ROM in mGBA) |
| the screen's timeline | `clock.c`: as the clock moves, each scanline starts, is drawn and reaches its HBlank, line 160 its VBlank; interrupts are delivered then, inside whatever the game is doing. The game starts 888 cycles into line 126, where mGBA starts it. At line 0 the browser prepares the remake layer's pictures for the frame (`PlatformHostFrameStart`), at line 160 it takes the frame (`PlatformHostVBlank`) |
| main loop | `AgbMainFrame` is one iteration; the platform then waits as `WaitForVBlank` does, for the VBlank handler's flag. A slow iteration spans two VBlanks: a lag frame, as on the GBA |
| I/O registers | `io.c`: VCOUNT and DISPSTAT from the timeline, IF write-1-to-clear, timers on the clock (their prescalers running free from power on), the power-on state the BIOS leaves (forced blank, line 126) |
| interrupts | `io.c`: crt0.s's IntrMain (priorities, acknowledging, IE/IME while the handler runs) calling `gIntrTable`, with the time the BIOS's vector and IntrMain take |
| DMA | `dma.c`: latched on enable; immediate, VBlank and HBlank transfers (the scanline effects), timed by the memory they read and write; what the HBlank DMA will write to a register on each line of the frame (`PlatformPredictLines`, for the remake layer). The sound FIFOs' DMA runs in `apu.c` |
| BIOS | `bios.c`: the SWIs in C, with their cycle costs (CpuSet, CpuFastSet by the memory they touch, LZ77 by what the data holds) |
| PPU | `ppu.c`: a scanline renderer: modes 0-5, text and affine backgrounds, sprites (affine, double size, mosaic, semi-transparent, window), windows, blending; the remake layer's pictures standing in for a background and for sprites |
| sound | the m4a engine (the decomp's `m4a.c`, and `platform/game/m4a_1.c`: `m4a_1.s`'s sequencer and mixer in C) and `apu.c`, the sound chip: DirectSound A and B fed by the sound DMA from the mixer's buffer as their FIFOs run low, the four GB channels as the engine's register writes set them, SOUNDCNT's mixing and volumes, SOUNDBIAS; stereo samples at 65536 Hz into a ring the browser reads (`game.readAudio()`, `game.audioRate()`) |
| cartridge | `cartridge.c`: 128 KB flash kept in the browser, the real-time clock from the device's |
| keypad | keyboard, touch pad, gamepad (`src/game/main.ts`) |

## Tools (`platform/tools`)

- `run.mjs`: the compiled game headless, on an input script (`platform/tests`),
  frames saved as PNG, its sound as a WAV file (`--wav`).
- `reference.py`: the decomp's GBA ROM in mGBA on the same script.
- `compare.py`: frame by frame, the GBA's 15-bit colors (`--slack` finds a
  timing shift). The boot matches the ROM frame for frame through the intro.
- `timing.py`: how many cycles functions take on the ROM (the drivers' costs).
- `sound_check.py`: the sound against the ROM's, frame by frame on an input
  script (`platform/tests/title.json`): the music players, their tracks and
  channels equal; the mixer's PCM buffer equal byte for byte; the writes to
  the sound registers equal; both runs' audio as WAV files, compared.
- `profile.mjs`: where the compiled game's time goes, function by function
  (a profile build), and a trace of calls with their frame, line and cycle.
- `calibrate.py`: each function's own time on the compiled game and on the
  ROM (mGBA's breakpoints) over an input script, and the corrections of the
  time model where they differ (`tools/cpu_time.json`).
- `layouts.py`: every struct's layout against the GBA build's.
- `tools/remake/run.mjs`: `run.mjs`'s scripts in the browser, with the remake
  layer (the 3D battles), frames saved as PNG.
- `tools/remake/soak.mjs`: battle after battle with the remake layer; fails
  on a page error or memory that keeps growing.

## Remake layer (`src/remake/`)

Battles are the game's battles, with these substitutions:

| the game draws | the remake draws | how it knows |
|---|---|---|
| each battler's sprite, while it shows the Pokémon | the species' 3D model where the sprite is: its offset from where it rests, its affine scale, turn and stretch, shown when the sprite is, in the sprite's palette | the battler's sprite (`gBattlerSpriteIds`, `showsPokemon`: a trainer's picture holds the sprite during the intro, a substitute doll behind a Substitute) and its OAM entry this frame |
| the battle background (BG3), while it shows the place's own | the painted 3D arena for the battle's environment, faded as the game fades BG3's palette | `gBattleEnvironment`; the hooks where the game draws its main background or a move's (`platform/patches/battle_bg.patch`, `battle_anim.patch`) |
| a move's motion of the attacker (lunge, shake, spin) | the same motion on the 3D body (it follows the sprite), and the move's clip acted in place (no travel, no leaps: `Battler3D.inPlace`) | the move animation starting (`RemakeBattleAnimation`: its table and index) |
| a hit (the sprite blinks) | the body flinches (`hit`) as it blinks | the engine's command to the battler's controller (`RemakeBattlerCommand`, `platform/patches/battle_controllers.patch`) |
| the faint's slide down | the curl over and shrink (`faint`); the slide is not followed | the same, `CONTROLLER_FAINTANIMATION` |
| a send-out, a switch-in | the body strikes its pose (`intro`) as it shows | the same, `CONTROLLER_INTROTRAINERBALLTHROW`, `CONTROLLER_SWITCHINANIM` |
| copies of the battler's sprite (afterimages, a stat change's window) | the same 3D picture at each copy's place, in its mode | the copies share the sprite's tiles; the PPU moves the picture by the difference of their centres |

A species without a 3D model, a battle position without a place on the stage
(doubles' second positions, for now) and a place without an arena are drawn
by the game: the layer only substitutes what it has. Menus over the battle
(the bag, the party) are the game's (`battleScreen`: the battle's VBlank
callback runs).

**How the pictures combine.** The 3D renders are layers the platform's PPU
composes like its own, so everything the GBA does to a picture applies to
them too. At the start of each frame (line 0, `PlatformHostFrameStart`) the
hardware holds that frame's OAM, palettes and registers; the remake layer
reads them and the battle's state from the game's memory (`RemakeState`,
`platform/game/remake_state.c`), renders at 240x160 and fills the PPU's
pictures (`struct RemakeLayers`, `platform/include/remake_state.h`), which
the frame's lines then use:

- the arena, in color, in place of BG3's pixels (BG3's priority, windows and
  blending apply). The game fades BG3 through its palette (to black or white,
  a move's darkening): the layer compares the palette BG3's map uses, as the
  hardware has it, with the game's unfaded copy, finds the game's fade
  (`BlendPalette`'s coefficient and color) and applies it to the arena in the
  same 5-bit steps.
- each battler, in place of its sprite's OAM entries (at their place in the
  OAM order, with their priority, mode and mosaic; a window copy shapes the
  OBJ window). Its pixels are **palette indices**: the pixel pipeline snaps
  the 3D colors to the species' palette (as it always did) and outputs the
  index, and the PPU colors it with the sprite's own palette as the line is
  drawn. So every palette effect of the game (the wild Pokémon's silhouette
  in the intro, the ball's color on a send-out, a hit's flash, a fade to
  black) colors the 3D body exactly as it colors the sprite, and a shiny
  Pokémon is shiny.

The arena is drawn with a margin around the screen (`REMAKE_BG_MARGIN`,
within the margin the arenas are painted with), so when the game scrolls BG3
the same on every line (a shake: Earthquake's 13 px) the arena moves with
it. Where the lines differ (the intro's two halves sliding in) the arena
stays still, and a battler whose sprite moves with the background keeps its
place on it: its offset plus BG3's scroll at its row, less what the arena
shows of it, from the registers and the HBlank DMA's writes for the frame
(`PlatformPredictLines`). So the wild Pokémon is already standing there when
the window opens, as the remake's intro was designed. The two renders are passes of the same stage:
the arena with the battlers' shadows, then the battlers alone with their
object ids, split into one picture each.

While a battle's models or arena load, the page holds the game (it runs no
frame) and the loading battlers' sprites are hidden, so no 2D Pokémon shows
for a moment.

The remake reads the game's structs and constants by name: the build writes
their layouts and values (`CONTROLLER_*`, `B_POSITION_*`,
`BATTLE_ENVIRONMENT_*`: `REMAKE_CONSTANTS` in `platform/build.mjs`) to
`public/game/remake_state.json`, so `src/remake` repeats none of the game's
numbers.

**Test battles.** `platform/game/remake_test.c` starts a wild battle from
anywhere, as the game starts one, and starts it over when it ends: the game
page's `?battle=BLAZIKEN:50,SWAMPERT:50,GRASS` (the player's Pokémon, the wild
one, the place) and an input script's `"battle"`
(`platform/host/test_battle.mjs`), so the remake's battles can be looked at
without playing up to one. `platform/tests/battle.json` is one:
`platform/tools/run.mjs` runs it headless (the game's own 2D battle) and
`tools/remake/run.mjs` in the browser with the remake layer (the page's
`?manual=1`: frame by frame, a blank save, a fixed clock), frame for frame
the same battle, so the two can be set side by side.

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
