# Pokémon Ultragreen Emerald

A remake of Pokémon Emerald's battles built from the
[pret/pokeemerald](https://github.com/pret/pokeemerald) decompilation. Battlers
are rigged 3D models with their own animation for every kind of attack. The GBA
look comes from a pixelation pass over the 3D viewport, not from baked assets.
The interface, text, timings and battle rules come from the decomp and are
checked against captures of the real game.

**Play the battle playtest: <https://aboufama.github.io/Pokemon-Ultragreen-Emerald/>**
(computer or phone; pick your Pokémon, the foe, the moves and the place, then battle).

This first milestone is the battle screen with the three Hoenn starters in their
final forms: **Blaziken** (the reference species), **Sceptile** and **Swampert**.
Blaziken was built by hand; Sceptile and Swampert were brought to the same bar by
fresh agents following the gauntlet ([docs/POKEMON_PIPELINE.md](docs/POKEMON_PIPELINE.md),
`.claude/skills/pokemon-gauntlet`), which is how every other Pokémon gets added.

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
| START | S |
| SELECT | Shift |

On touch screens, use the on-screen D-pad and A/B buttons (hide them with `?pad=0`).

**Battle playtest** (`demo.html`, src/demo/playtest.ts), played entirely on the GBA
screen the way the game plays, with Emerald's own menus (src/menus/): choose your Pokémon
from Professor Birch's bag, then the wild Pokémon to battle (SELECT picks one at random);
set the moves (RANDOM gives four of the moves it can know, with an attack of its main
type; A on a move opens a Move Relearner-style list of every move it can know, with its
TYPE, PP, POWER, ACCURACY and description, and the new move is learned "1, 2, and…
Poof!"; SELECT sets the wild Pokémon's moves the same way; START or DONE goes on); pick
the place, whose arena shows live behind the list; then battle, and battle again. It
plays like an emulator: the GBA screen as large as the window allows, the keyboard on a
computer, and on a phone an on-screen D-pad, A/B and START/SELECT (beside the screen when
the phone is held sideways; "Add to Home Screen" runs it full screen). Shareable setups
skip the menus: `demo.html?player=sceptile&enemy=swampert&moves=LEAF_BLADE,AGILITY&env=sand&go=1`.

- `npm run demo` builds the static site into `build/demo/pages/`
  (`--embed`, with `npm run dev` running, adds single-file builds with every asset inlined).
- `node tools/demo/deploy_pages.mjs` builds it and publishes it to the `gh-pages` branch,
  which GitHub Pages serves at the link above.
- `node tools/battle/engine_check.mjs` checks the engine's move effects against the Gen 3
  rules (Protect, recharge, Focus Punch, multi-hit, recoil, drain, Struggle...) and that
  random movesets only hold moves it plays.

**URL options:** `?autoplay=1` plays both sides.

| option | meaning |
|---|---|
| `player=` / `enemy=` | species slugs (must have a 3D profile) |
| `level=`, `enemyLevel=` | levels |
| `moves=` / `enemyMoves=` | comma lists, e.g. `BLAZE_KICK,FLAMETHROWER,DOUBLE_KICK,BULK_UP` |
| `shiny=1`, `enemyShiny=1` | shiny variants |
| `env=` | arena: `grass` (Route 101), `long_grass` (Route 120), `sand` (Route 111), `water` (Route 124), `pond` (Route 102), `underwater` (the seafloor), `mountain` (Mt. Chimney), `cave` (Granite Cave), `building` (Battle Tower) |
| `seed=` | deterministic battle RNG |
| `text=slow\|mid\|fast` | text speed |
| `intro=0` | skip the intro |
| `loop=0` | stop after one battle |
| `playerExp=0.9` | start close to a level-up |

## What's in the battle

- **Intro** (`battle_intro.c` and the battle controllers):
  - the window opening from the middle row and the scanline-split slide of the arena
    (the top half comes in from the left with the wild Pokémon in shadow, the bottom
    half from the right);
  - the trainer's throw, the Poké Ball arc and the white flash;
  - the Pokémon emerging in the ball's color, then Blaziken's red-glow send-out.
- **Menus**: action and move selection with the controller's cursor rules, the
  healthbox/battler bounce, and PP colors.
- **Turns** from a Gen 3 battle engine: damage formula, crits, STAB and type chart,
  accuracy and stat stages, Blaze, burn, and EXP curves with level-ups; stat moves
  and stat changes on hits, multi-hit moves (2-5 hits), recoil, draining, fixed
  damage, Hidden Power, Protect / Detect / Endure, Hyper Beam's recharge, Focus
  Punch, and Struggle. Paralysis, poison, sleep, freeze, confusion, flinching and
  weather are not modelled yet (moves that only cause those are left out of movesets).
- **Presentation**:
  - HP drains at 1 HP per frame and the EXP bar fills at 1 px per frame, as in the game;
  - messages print and wait like battle text;
  - faint, whiteout and escape all play out.

## How it works

| piece | where |
|---|---|
| Data and graphics extraction from the decomp (species, Pokédex categories, moves and descriptions, types, fonts, UI, menus, sprites, battle-animation sprites) | `tools/extract/`, `src/data/generated/`, `public/assets/gba/` |
| Pixel-exact 2D layer (text box, menus, healthboxes, trainer, ball) drawn into a software framebuffer | `src/gba/`, `src/battle/ui/` |
| 3D stage: camera calibrated so both battlers land where the stock sprites are drawn | `src/render3d/stage.ts`, `src/data/battle_camera.json` |
| Arenas, designed from scratch for the remake in Hoenn's overworld colors, with no platforms under the Pokémon: each place is painted pixel by pixel for the battle camera (ground, paths, ponds, dunes, ridges, walls, a tree line) and projected onto the ground, props stand at their depth one sprite pixel per screen pixel (trees, tall grass, reeds, rocks, kelp, coral, lamp posts) and sway, and the ground lives per pixel (wind in the grass, waves and glints, ripples at the battlers' feet, lava, caustics, cloud shadows) | `src/render3d/arena/`, `environment.ts`, `ambience.ts` |
| Viewport pixel pass: object IDs, majority downsampling, snap to the species' stock palette, outline policy from the sprites, palette blends (fades, glows) and the arena's fades (the ball's white flash, move tints), scanline bands (the intro slide), RGB555 | `src/render3d/pipeline.ts` |
| Menus drawn like Emerald's: window frames, text and the keypad icons, messages with the waiting arrow, YES/NO, list menus with scroll arrows, Birch's bag, the move relearner | `src/menus/`, `src/gba/font.ts` |
| Rig and animation: semantic bone map, model-space rotations, aim constraints, foot IK, keyframed clips on smooth curves with events and crossfades, overlapping action, springs for loose parts (mane, tail, feathers), and a life layer (breathing, weight shifts, blinks, sprung turns and hit recoil) | `src/anim/`, `src/pokemon/`, `src/battle3d/battler.ts` |
| Moves: animation category from move data, per-type effects from the stock battle-animation sprites, rendered in 3D through the pixel pass | `src/battle3d/` |
| Battle engine, scene and frame clock | `src/battle/` |

Species calibration fits each model's height and facing (silhouette IoU against
the stock sprites) and its toon color grade (palette histograms). See
`src/pokemon/blaziken/calibration.json`.

## Dev views and tools

| | |
|---|---|
| `/?mode=stage&env=cave` | the battle view in one arena (`&compare=1`: next to a real Emerald frame) |
| `/?mode=riglab&species=blaziken&onion=0.5` | pose authoring with the stock sprites onion-skinned |
| `/?mode=film&move=BLAZE_KICK&attacker=player` | filmstrip of one move in the battle view |
| `/?mode=calibrate&species=…` | sprite calibration (run it with `tools/calibrate/run.mjs`) |
| `/?mode=uifit` | pixel check of the UI against real captures |
| `/?mode=bonedump&species=…` | skeleton dump |
| `tools/shots/battle_film.mjs` | frame-stepped battle recordings with scripted button presses |
| `tools/shots/clip_gifs.mjs` | every clip of a species as looping GIFs from both sides (review) |
| `tools/gauntlet/new_species.mjs` | scaffold a new species (see the pipeline doc) |
| `tools/gauntlet/brief.mjs` | a species' Pokédex entry, stats and every move it can use with its motif |
| `tools/gauntlet/skeleton.mjs` | a model's skeleton, what each bone moves, its textures, and any animations it ships |
| `tools/gauntlet/classify_moves.mjs` | which body part a species uses for each move, classified by [Jev](https://typesafe.ai) (needs `TYPESAFE_API_KEY`) |
| `tools/gauntlet/check.mjs` | the gauntlet's quality gates for a species (`--render` adds battles) |
| `tools/gauntlet/cliplint.mjs` | static clip checks: slides, pivots on planted feet, partly aimed bones, torso rushes, limb hitches |
| `tools/gauntlet/motion.mjs` | how fluid a species' clips are on the animated joints (stop-starts, pops, dead holds, early turns), next to Blaziken |
| `tools/gauntlet/setup_worktree.mjs` | ready a git worktree for a gauntlet run beside other agents |
| `tools/gauntlet/review_page.mjs` | one review page with every clip GIF, brief and review note of one or more species |
| `tools/calibrate/candidates.mjs` | compare stance variants by how well each fits the stock sprites |
| `tools/models/optimize_model.mjs` | strip upstream animations and recompress a fetched model |
| `tools/shots/move_sheet.mjs` | contact sheets of moves and clips in the battle view |
| `tools/arena/check.mjs` | the arenas' checks: every place has one, painted (no Emerald backgrounds, no platforms), fully painted, a pixel-art palette, nothing over a battler, seeded, fast to paint (`--render` adds screenshots) |
| `.claude/skills/pokemon-gauntlet`, `pokemon-animation`, `pokemon-arena` | the process, the animation craft and the arenas' design rules, as skills for agents |
| `tools/reference/` | build a harness ROM from the decomp and capture real frames with mGBA |

## Status

- Species with 3D profiles: Blaziken, Sceptile, Swampert. Other species are added
  through the gauntlet (`.claude/skills/pokemon-gauntlet`, agent
  `.claude/agents/pokemon-gauntlet.md`).
- Moves by body part (`tools/gauntlet/classify_moves.mjs`) need a TypeSafe API key
  (`TYPESAFE_API_KEY`) and network access to `api.typesafe.ai`; until a species is
  classified, its effects leave the emitter set per motif.
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
