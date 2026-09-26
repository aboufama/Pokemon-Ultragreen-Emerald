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
screen the way the game plays, with Emerald's own screens and menus (src/menus/): the
title screen (Rayquaza, the logo's shine, PRESS START; on a computer it shows the keys),
then choose your Pokémon from Professor Birch's bag, then the wild Pokémon to battle (SELECT picks one at random);
set the moves (RANDOM gives four of the moves it can know, with an attack of its main
type; A on a move opens a Move Relearner-style list of every move it can know, with its
TYPE, PP, POWER, ACCURACY and description, and the new move is learned "1, 2, and…
Poof!"; SELECT sets the wild Pokémon's moves the same way; START or DONE goes on); pick
the place, whose arena shows live behind the list; then battle, and battle again.
Emerald's own music plays throughout (the title theme, Professor Birch's lab while you
set up, the wild battle, its victory and the level-up fanfare) with the game's sound
effects; browsers let sound start with the first key press or tap (on the title screen
that press starts the music), and `sound=0` turns it off. It plays like an emulator: the GBA screen as large as the window allows, the keyboard on a
computer, and on a phone an on-screen D-pad, A/B and START/SELECT (beside the screen when
the phone is held sideways; "Add to Home Screen" runs it full screen). Shareable setups
skip the menus: `demo.html?player=sceptile&enemy=swampert&moves=LEAF_BLADE,AGILITY&env=sand&go=1`
(`title=0` skips only the title screen).

- `npm run demo` builds the static site into `build/demo/pages/`
  (`--embed`, with `npm run dev` running, adds single-file builds with every asset inlined).
- `node tools/demo/deploy_pages.mjs` builds it, opens a battle in every place on the built
  site (`tools/demo/smoke_pages.mjs`: no missing file, no page error) and publishes it to
  the `gh-pages` branch, which GitHub Pages serves at the link above.
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
| `env=` | arena: `grass` (Route 101), `water` (Route 124, the open sea), `cave` (Granite Cave) |
| `seed=` | deterministic battle RNG |
| `text=slow\|mid\|fast` | text speed |
| `intro=0` | skip the intro |
| `loop=0` | stop after one battle |
| `playerExp=0.9` | start close to a level-up |
| `sound=1` | Emerald's music and sound effects (from the first key press or tap; the playtest has them on) |
| `poseRate=15` | stop motion: poses a second the Pokémon are shown in (15 by default, `0` for smooth 60 fps motion) |

## What's in the battle

- **Intro** (`battle_transition.c`, `battle_intro.c` and the battle controllers):
  - picking a place starts the battle like a wild encounter: the battle theme and
    the place's transition over its arena (three gray flashes, then White Bars Fade,
    Grid Squares in the cave, Ripple on water);
  - the window opening from the middle row (WIN0, 1 px then 4 px a frame) onto the
    field, with the wild Pokémon already standing in its spot in the game's shadow
    palette (RGB(8, 8, 8) at 10/16) and the trainer already there: the camera holds
    still, so nothing slides in; then the wild Pokémon's healthbox slides in while its
    colors come back, and it cries (SpriteCB_WildMonShowHealthbox);
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
- **Moves** look like what they are: every move has a motif (a bite, a kick, a breath
  from the mouth, a jet from cannons, a leaf volley, a quake...) with its own clip per
  species and its effects. Seismic Toss grabs the foe, carries it into the air and
  hurls it back down into its place; Dig and Dive go underground (dirt heaving along
  the way) and burst up at the foe; Mud-Slap flings mud; Double Team and Agility leave
  afterimages as Emerald draws them; Flash whites out the screen with the Pokémon in
  silhouette.
- **Stop motion**: the Pokémon are shown in poses held for several frames (15 a second),
  while the animation runs on underneath at 60 fps, so timing, springs and hits stay
  exact (a hit's pose shows on its frame); slides, bounces, blinks and flashes stay smooth,
  as the GBA moves sprites.
- **Presentation**:
  - HP drains at 1 HP per frame and the EXP bar fills at 1 px per frame, as in the game;
  - messages print and wait like battle text;
  - faint, whiteout and escape all play out.
- **Sound**, where the game plays it: the wild battle theme from the start, the ball's
  pop, the hit sounds by effectiveness panned toward the target, the low-HP beep, the
  faint, the victory theme when EXP is given, the EXP bar's fill, the level-up sparkle
  and fanfare, the flee sound, and the select sound on menus and text.

## How it works

| piece | where |
|---|---|
| Data and graphics extraction from the decomp (species, Pokédex categories, moves and descriptions, types, fonts, UI, menus, sprites, battle-animation sprites) | `tools/extract/`, `src/data/generated/`, `public/assets/gba/` |
| Pixel-exact 2D layer (text box, menus, healthboxes, trainer, ball) drawn into a software framebuffer | `src/gba/`, `src/battle/ui/` |
| 3D stage: camera calibrated so both battlers land where the stock sprites are drawn | `src/render3d/stage.ts`, `src/data/battle_camera.json` |
| Arenas, designed from scratch for the remake in Hoenn's overworld colors, with no platforms under the Pokémon: each place is painted pixel by pixel for the battle camera (ground, paths, ponds, dunes, ridges, walls, a tree line) and projected onto the ground, props stand at their depth one sprite pixel per screen pixel (trees, tall grass, reeds, rocks, kelp, coral, lamp posts) and sway, and the ground lives per pixel (wind in the grass, waves and glints, ripples at the battlers' feet, lava, caustics, cloud shadows) | `src/render3d/arena/`, `environment.ts`, `ambience.ts` |
| Viewport pixel pass: object IDs, majority downsampling, snap to the species' stock palette, outline policy from the sprites, palette blends (fades, glows) and the arena's fades (the ball's white flash, move tints), afterimages (sprite clones in blend mode), the battle transitions, RGB555 | `src/render3d/pipeline.ts` |
| Screens and menus drawn like Emerald's: the title screen (title_screen.c's layers, blends, shines and timings), window frames, text and the keypad icons, messages with the waiting arrow, YES/NO, list menus with scroll arrows, Birch's bag, the move relearner | `src/menus/`, `src/gba/font.ts` |
| Rig and animation: semantic bone map, model-space rotations, aim constraints, foot IK, keyframed clips on smooth curves with events and crossfades, overlapping action, springs for loose parts (mane, tail, feathers), and a life layer (breathing, weight shifts, blinks, sprung turns and hit recoil) | `src/anim/`, `src/pokemon/`, `src/battle3d/battler.ts` |
| Moves: animation category from move data, per-type effects from the stock battle-animation sprites, rendered in 3D through the pixel pass | `src/battle3d/` |
| Battle engine, scene and frame clock | `src/battle/` |
| Music and sound effects: Emerald's songs and samples, converted with the decomp's own tools (mid2agb, wav2agb), played by a port of its m4a sound engine (the sequencer, SoundMainRAM's DirectSound mixer and reverb, CgbSound on a model of the GB channels, the output stage) running in an AudioWorklet. Checked against the game in mGBA: the sampled instruments come out sample for sample the same | `src/audio/`, `tools/extract/extract_sound.py` |

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
| `tools/gauntlet/check.mjs` | the gauntlet's quality gates for a species (`--render` adds battles, every clip and the healthbox clearance) |
| `tools/gauntlet/uiclear.mjs` | the Pokémon stay clear of the healthboxes: every clip played at home, from both sides, against the pixels each box draws |
| `tools/gauntlet/cliplint.mjs` | static clip checks: slides, pivots on planted feet, partly aimed bones, torso rushes, limb hitches |
| `tools/gauntlet/motion.mjs` | how fluid a species' clips are on the animated joints (stop-starts, pops, dead holds, early turns), next to Blaziken |
| `tools/gauntlet/setup_worktree.mjs` | ready a git worktree for a gauntlet run beside other agents |
| `tools/gauntlet/review_page.mjs` | one review page with every clip GIF, brief and review note of one or more species |
| `tools/calibrate/candidates.mjs` | compare stance variants by how well each fits the stock sprites |
| `tools/models/optimize_model.mjs` | strip upstream animations and recompress a fetched model |
| `tools/shots/move_sheet.mjs` | contact sheets of moves and clips in the battle view |
| `tools/shots/trailer.mjs` | cut a trailer from moves in the battle view: shots timed so each hit lands on the music, Emerald's music and hit sounds from the sound engine, MP4 with square pixels (`tools/shots/trailers/starters.json` is the starters' 10-second trailer; needs `npm run dev` and ffmpeg) |
| `tools/arena/check.mjs` | the arenas' checks: every place has one, painted (no Emerald backgrounds, no platforms), fully painted, a pixel-art palette, nothing over a battler, seeded, fast to paint (`--render` adds screenshots) |
| `tools/sound/check.mjs` | the sound's checks: the extracted bank is whole, every song the game plays is in it, every song renders (music loops, looping effects get stopped), the engine runs alone as the AudioWorklet builds it, fast enough for a phone (`--wav <song>` writes one to listen to) |
| `tools/sound/reference/run.py` | the engine against the game itself in mGBA, song by song (after `tools/reference/build_rom.sh` and `build_capture.sh`) |
| `.claude/skills/pokemon-gauntlet`, `pokemon-animation`, `pokemon-arena`, `pokemon-sound` | the process, the animation craft, the arenas' design rules and the sound, as skills for agents |
| `tools/reference/` | build a harness ROM from the decomp, capture real frames and record its sound with mGBA |

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
  - Pokémon cries.

## Credits

- Game data and graphics are extracted from [pret/pokeemerald](https://github.com/pret/pokeemerald).
- 3D models come from [Pokemon-3D-api/assets](https://github.com/Pokemon-3D-api/assets)
  (via [Pokemon-3D-api](https://github.com/Sudhanshu-Ambastha/Pokemon-3D-api)).
- Pokémon and all related assets are © Nintendo / Creatures Inc. / GAME FREAK inc.
  This is a non-commercial fan project.
