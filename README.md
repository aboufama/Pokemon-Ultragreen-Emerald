# Pokémon Ultragreen Emerald

A remake of Pokémon Emerald's battles built from the
[pret/pokeemerald](https://github.com/pret/pokeemerald) decompilation. Battlers
are rigged 3D models with their own animation for every kind of attack. The GBA
look comes from a pixelation pass over the 3D viewport, not from baked assets.
The interface, text, timings and battle rules come from the decomp and are
checked against captures of the real game.

This first milestone is the battle screen, with **Blaziken** as the reference
species. The pipeline that brings every other Pokémon to the same standard is in
[docs/POKEMON_PIPELINE.md](docs/POKEMON_PIPELINE.md).

## Run it

```sh
git submodule update --init          # decomp (only needed to re-extract data)
npm install
npm run dev                          # http://127.0.0.1:5173/
```

The extracted data and graphics are committed, so the decomp and Python are only
needed to regenerate them (`npm run extract`, which needs `pip install -r tools/requirements.txt`).

**Controls:**

| input | keys |
|---|---|
| A | Z, Enter, Space, or a click/tap |
| B | X, Esc |
| D-pad | arrow keys |

On touch screens, use the on-screen D-pad and A/B buttons (hide them with `?pad=0`).

**Standalone demo:** `npm run demo` (with `npm run dev` running) builds `build/demo/`. That
page has the app inlined, only the assets a battle loads, and the model embedded, so it
can be hosted on any static host.

**URL options:** `?autoplay=1` plays both sides.

| option | meaning |
|---|---|
| `player=` / `enemy=` | species slugs (must have a 3D profile) |
| `level=`, `enemyLevel=` | levels |
| `moves=` / `enemyMoves=` | comma lists, e.g. `BLAZE_KICK,FLAMETHROWER,DOUBLE_KICK,BULK_UP` |
| `shiny=1`, `enemyShiny=1` | shiny variants |
| `env=` | environment: `grass`, `long_grass`, `sand`, `cave`, ... |
| `seed=` | deterministic battle RNG |
| `text=slow\|mid\|fast` | text speed |
| `intro=0` | skip the intro |
| `loop=0` | stop after one battle |
| `playerExp=0.9` | start close to a level-up |

## What's in the battle

- **Intro** (`battle_intro.c` and the battle controllers):
  - the window opening from the middle row and the scanline-split slide of the backdrop;
  - the tall-grass entry layer scrolling away and the wild Pokémon sliding in as a shadow;
  - the trainer's throw, the Poké Ball arc and the white flash;
  - the Pokémon emerging in the ball's color, then Blaziken's red-glow send-out.
- **Menus**: action and move selection with the controller's cursor rules, the
  healthbox/battler bounce, and PP colors.
- **Turns** from a Gen 3 battle engine: damage formula, crits, STAB and type chart,
  accuracy and stat stages, Blaze, burn, and EXP curves with level-ups.
- **Presentation**:
  - HP drains at 1 HP per frame and the EXP bar fills at 1 px per frame, as in the game;
  - messages print and wait like battle text;
  - faint, whiteout and escape all play out.

## How it works

| piece | where |
|---|---|
| Data and graphics extraction from the decomp (species, moves, types, fonts, UI, environments, sprites, battle-animation sprites) | `tools/extract/`, `src/data/generated/`, `public/assets/gba/` |
| Pixel-exact 2D layer (text box, menus, healthboxes, trainer, ball) drawn into a software framebuffer | `src/gba/`, `src/battle/ui/` |
| 3D stage: camera calibrated so both battlers land where the stock sprites are drawn; the backdrop is projected from that camera onto a ground plane, so the resting view is identical to Emerald | `src/render3d/stage.ts`, `environment.ts`, `src/data/battle_camera.json` |
| Viewport pixel pass: object IDs, majority downsampling, snap to the species' stock palette, outline policy from the sprites, palette blends (fades, glows), RGB555 | `src/render3d/pipeline.ts` |
| Rig and animation: semantic bone map, model-space rotations, aim constraints, foot IK, keyframed clips on smooth curves with events and crossfades, overlapping action, springs for loose parts (mane, tail, feathers), and a life layer (breathing, weight shifts, blinks, sprung turns and hit recoil) | `src/anim/`, `src/pokemon/`, `src/battle3d/battler.ts` |
| Moves: animation category from move data, per-type effects from the stock battle-animation sprites, rendered in 3D through the pixel pass | `src/battle3d/` |
| Battle engine, scene and frame clock | `src/battle/` |

Species calibration fits each model's height and facing (silhouette IoU against
the stock sprites) and its toon color grade (palette histograms). See
`src/pokemon/blaziken/calibration.json`.

## Dev views and tools

| | |
|---|---|
| `/?mode=stage&compare=1` | 3D battle view next to a real Emerald frame |
| `/?mode=riglab&species=blaziken&onion=0.5` | pose authoring with the stock sprites onion-skinned |
| `/?mode=film&move=BLAZE_KICK&attacker=player` | filmstrip of one move in the battle view |
| `/?mode=calibrate&species=…` | sprite calibration (run it with `tools/calibrate/run.mjs`) |
| `/?mode=uifit` | pixel check of the UI against real captures |
| `/?mode=bonedump&species=…` | skeleton dump |
| `tools/shots/battle_film.mjs` | frame-stepped battle recordings with scripted button presses |
| `tools/shots/clip_gifs.mjs` | every clip of a species as looping GIFs from both sides (review) |
| `tools/gauntlet/new_species.mjs` | scaffold a new species (see the pipeline doc) |
| `tools/gauntlet/brief.mjs` | a species' Pokédex entry, stats and every move it can use with its motif |
| `tools/gauntlet/skeleton.mjs` | a model's skeleton, what each bone moves, and its textures |
| `tools/gauntlet/check.mjs` | the gauntlet's quality gates for a species (`--render` adds battles) |
| `tools/gauntlet/setup_worktree.mjs` | ready a git worktree for a gauntlet run beside other agents |
| `tools/gauntlet/review_page.mjs` | one review page with every clip GIF, brief and review note of one or more species |
| `tools/calibrate/candidates.mjs` | compare stance variants by how well each fits the stock sprites |
| `tools/models/optimize_model.mjs` | strip upstream animations and recompress a fetched model |
| `tools/shots/move_sheet.mjs` | contact sheets of moves and clips in the battle view |
| `.claude/skills/pokemon-gauntlet`, `pokemon-animation` | the process and the animation craft, as skills for agents |
| `tools/reference/` | build a harness ROM from the decomp and capture real frames with mGBA |

## Status

- Species with 3D profiles: Blaziken. Other species are added through the gauntlet
  (`.claude/skills/pokemon-gauntlet`).
- Not in this milestone:
  - the overworld;
  - trainer battles and double battles;
  - the Bag and party screens (the menu options show a message);
  - audio.

## Credits

- Game data and graphics are extracted from [pret/pokeemerald](https://github.com/pret/pokeemerald).
- 3D models come from [Pokemon-3D-api/assets](https://github.com/Pokemon-3D-api/assets)
  (via [Pokemon-3D-api](https://github.com/Sudhanshu-Ambastha/Pokemon-3D-api)).
- Pokémon and all related assets are © Nintendo / Creatures Inc. / GAME FREAK inc.
  This is a non-commercial fan project.
