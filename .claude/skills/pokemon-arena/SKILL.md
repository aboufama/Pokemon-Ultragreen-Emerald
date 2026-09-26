---
name: pokemon-arena
description: Design, paint or fix a battle arena (the place a battle happens) in this repo — the ground, the far view, what stands in it and how it moves — in the remake's pixel-art style with Hoenn's colors and no platforms under the Pokémon, beautiful but sparse like Emerald's own battle backgrounds, as calm and as sparse as the open sea so the Pokémon stay the focus. Use when adding a place to battle, when an arena looks flat, noisy, too busy, cluttered or "not like Pokémon", when something in an arena covers a Pokémon, when tools/arena/check.mjs fails (e.g. "as calm as the sea", "as sparse as the sea", "the Pokémon are the focus"), or when touching src/render3d/arena, environment.ts or ambience.ts.
---

# Battle arenas

An arena is designed for the remake, not copied from Emerald: Emerald's battle
backgrounds (BG3 art with two platform ellipses) are never projected or traced.
The Pokémon stand on the ground itself; their shadows ground them. Everything
is painted for the one battle camera, so every pixel lands on exactly one GBA
pixel at rest.

There are three places, in `src/render3d/arena/arenas.ts`: Route 101's
`meadow()`, the open sea's `sea()` (Route 124) and Granite Cave's `cave()`.
Read that file first, then `design.ts` (the painting helpers), `sprites.ts`
and the header of `src/render3d/environment.ts`.

**The Pokémon are the focus.** The user asked for fewer places, each
"beautiful, but sparse", after Emerald's own battle backgrounds and the
craft of pixel art (below). The open sea is **perfect** and is the benchmark:
do not change it. It must paint bit-identically (hash `paintArena('water', …)`'s
ground data and props with its `look`, `ripples`, `ambience`, `name` and
`about`: `c24aba7d26cc2e68677e9d6613988e5881e60a2b50a1cbc8a7bbd49527337f61`),
and the ground shader's water path stays as it is. Every other place is held
to the sea by `tools/arena/check.mjs` ([Calm](#calm-the-sea-is-the-benchmark),
[Sparse](#sparse-like-emeralds-backgrounds)) and must leave the Pokémon the
most saturated, highest-contrast things on screen ([Focus](#focus-the-pokémon-stand-out)).

## What the battle view shows

The camera sees ground only (the horizon is ~38 px above the screen). At rest:

| rows (GBA px) | ground z | what goes there |
|---|---|---|
| 0-25 | 26-15 | the far view: tree lines, the horizon, cave walls (feet around z 14-20) |
| 25-60 | 15-9.5 | the back of the arena: the wild Pokémon's surroundings |
| 60-112 | 9.5-6 | the arena around the battlers (1 unit = 40-60 px wide here) |
| 112-160 | < 6 | under the text box: never seen at rest |

World +x is screen left. The wild Pokémon stands at about (179, 73) (x -1.28,
z 8.45) and fills the top right; the player's is at (74, 174) (x 0.52, z 4.1),
its body covering x 40-125 from row ~45 down. The enemy's healthbox covers x
12-112, rows 14-44; the player's x 126-230, rows 72-109; the text box
everything from row 112. So what shows is the band across the top, the upper
right around the wild Pokémon, and the left side (x 0-40, rows 44-112):
compose for those. During the intro there are no healthboxes and nobody on
our side yet: the whole screen above the text box shows as the window opens
on it, the wild Pokémon already in its spot. The arena itself never moves, so
nothing beyond the screen's edges is ever seen.

The battlers' boxes (`battlerBox()` in design.ts; the player's x 10-138 from
row 54 down, the enemy's x 133-225, rows 3-83) are what nothing standing may
cover, and the enemy's is the calm the arena keeps around the wild Pokémon.
No place stands props now: a standing prop has to clear the player's huge box,
so at the left it ends up a sliver cropped by the frame. Foreground framing
(the meadow's tall grass, the cave's boulder) is painted into the ground with
`ground.sprite()` or `stand()`: the player's Pokémon is nearer and covers it
correctly. Nothing is placed beyond the painted area (the screen and the shake
margin): it never shows.

What the checks measure as shown (`tools/arena/screen.mjs` `shownMask()`):
rows 0-111, minus the healthboxes and the middle of the player's battler box
(24 px in from each side, 30 from its top), which any Pokémon on our side
covers.

## The Emerald reference

Emerald's own battle backgrounds are extracted at
`public/assets/gba/battle_env/<env>.png` (grass, long_grass, cave, water,
pond, sand, mountain, plain, building, underwater; 256x256, from the decomp's
tiles, map and palette). They are reference only (never drawn: a gate checks
that nothing under `src/` names `battle_env/`). Study `grass.png`, `cave.png`
and `water.png`; they are strikingly sparse:

- **A pale, low-saturation field**, almost all of it one tint: grass
  `#d6f7d6` (luma 233), cave `#c6ad73` (174), water `#f7f7ff` (248).
- **A few thin horizontal bands for depth** across the top, 3 rows each and a
  lighter row between them (the field keeps that stripe: 3 rows of its tint,
  1 lighter), stepping from the far band's tint to the field's: grass
  `#b5e794` `#bdefa5` `#c6efbd` `#cef7c6`, cave `#ad8c52` `#b59463`
  `#bd9c6b` `#c6a56b`, water `#cedef7` `#dee7ef` `#e7efef` `#eff7f7`.
- **2-3 value steps in all, 12-14 colors** on screen (besides the text
  box's black), large flat areas.
- **Tiny texture marks only where the Pokémon stand**: tufts, pebbles, crests
  on the platforms (which the remake never draws).

The sprites pop because the backdrop is quiet. Take their restraint, their
value range and their palettes as the model. The colors come from the
overworld tilesets (`build/reference/pokeemerald/data/tilesets/*/palettes`,
and `…/graphics/battle_environment/*/palette.pal`): the general tileset's
palette 02 (route grass `#a4d5c5` `#73c5a4` `#41b483`, leaves `#b4ff83`
`#83c562` `#398b31`), 00 and 04 (sea blues), 03 (pink-brown rock
`#deb4a4`…`#624152`); the cave tileset's 06 (sand and rust
`#ffe69c` `#e6c58b` `#cdac7b` `#ac8b6a` `#946a5a` `#734a39` `#522931`), 07
(pink-gray rock) and 10 (purple-gray shadows).

## Pixel art, distilled

From Derek Yu's tutorials, Slynyrd's Pixelblog (landscapes, layers, trees),
Pedro Medeiros (saint11), Lospec's cluster and dithering tutorials and
atmospheric-perspective guides:

- **Fewer colors look better.** A few ramps of 3 (at most 4) steps.
  Hue-shift them: shadows cooler and more saturated, lights warmer. Only the
  focal thing gets a 4th step (the cave's daylight).
- **Atmospheric perspective.** The far view is lighter, less saturated and
  lower in contrast, shifted toward the sky or haze with fewer colors (the
  meadow's far row of trees has two tones; the cave's wall is its rock hazed
  toward the dusty light). Near ground gets more contrast, but stays quiet
  around the Pokémon.
- **Clusters, not noise.** Pixels in intentional clusters with readable
  shapes (a tuft, a leaf clump, a rock). No stray single pixels, no jaggies
  in long lines (even steps), no pillow shading (from the outline inward), no
  1-px-thin detail.
- **Banding.** Where bands meet in parallel steps the eye reads the seams:
  Emerald's stripes are intentional; elsewhere keep steps clean and few.
- **Dither** only where it smooths a real gradient (haze, light falloff),
  never as texture over large areas. Between tones over 16 luma apart it
  reads as specks (and the gates count them).
- **Negative space.** The background less distinct than the characters:
  broad calm areas around and behind both Pokémon, the little detail at the
  edges and in the far band.
- **Composition.** A clear far band across the top, a calm middle where the
  Pokémon stand, framing at the edges, lit from the upper left like the
  sprites. Test it in grayscale: a Pokémon that disappears needs value, not
  hue.

## What an arena is made of

| layer | how | where |
|---|---|---|
| ground and far view | `fill()` paints every screen pixel from its ground point (x, z, ppu); `scatter()` spreads marks evenly for their distance; `stand()` paints trees and rocks in the far view (and painted foreground framing), farthest first; `onLine()` draws crisp 1-pixel pattern lines (wave crests) at any distance; `shift()` moves a color along its ramp; `band()` picks a ramp step with a narrow dither at the step | `design.ts`, `art.ts`, `arenas.ts` |
| geometry | a wall is traced per pixel: where the view ray meets it before the floor (the cave's back wall, a few fixed-point iterations), and at what height | `arenas.ts` |
| materials | each painted pixel carries a material the ground shader animates per GBA pixel: `GRASS` (leans, wind bands: a clean lift, never a checkered half of the pixels), `WATER` (drifting waves, glints, rings at the feet of a Pokémon standing in its place: `BattleEnvironment.setStanding`), `BACKDROP` (far things: no ground effects), `SOLID` | `art.ts` `MAT`, `ground.ts` |
| sprites | pixel art made at its on-screen size (`sprites.ts`): `tree()` (leaf clusters), `tallGrass()` (a fan of blades), `crag()` (faceted rock: sea stacks, boulders) | `sprites.ts` |
| props | standing quads at their depth that sway row by row and hide and are hidden by the Pokémon (`ctx.props`, `props.ts`): the mechanism is there, no place uses it now | `props.ts`, `environment.ts` |
| life | wind, gusts, motes (seeds, spray, cave dust), dust on landings, cloud shadows; ground effects: grass waves, glints on water | `ambience.ts` (`ArenaDesign.ambience`), `ground.ts` |
| intro and fades | the intro is the window opening on the arena from the middle row (`src/battle/scene.ts` `intro()`); the arena's palette fades (ball flash, move tints) are the pixel pipeline's (`setEnvironmentBlend`). The arena never moves | `pipeline.ts`, `environment.ts`, `src/battle/scene.ts` `intro()` |

## The three places

| place | palette (colors shown) | what is in it |
|---|---|---|
| Route 101 `meadow()` | meadow `#7cc2a4` `#98d1b4` `#b3e0bd`, leaves `#5f9f78` `#7fb888` `#a0cf98`, outline `#4a8466`, trunk `#6b7462` `#8a8672` (9) | a pale meadow in three broad tones, lightest over the battle; toward the back a thin stripe and the mid tone (Emerald's bands), then the trees' scalloped shade; a soft hazy tree line whose near row opens behind the wild Pokémon onto a hazier two-tone row; one clump of tall grass framing the left; a few tufts beside the player's Pokémon; every border drawn as blades |
| Route 124 `sea()` | Hoenn's sea blues, pink-brown rock (15) | the benchmark: unchanged |
| Granite Cave `cave()` | sand `#bd9c73` `#cdac7b` `#e6c58b` (the last only where the daylight lands), wall `#7d6361` `#957670` `#ab8d80`, Hoenn's pink-brown rock (11) | warm sand in a soft pool of light much bigger than the battlers, a close step darker around it; a quiet back wall in shadow, a step below the lit floor, of three bands, darker going up, each ledge's lip a row of low rounded rock tops catching the light; a column of daylight from the upper left crossing the wall and landing in a bright foot behind the wild Pokémon; a faceted boulder framing the left, a small hazed rock at the far right |

## Rules

1. **No platforms.** Nothing ring-, disc- or ellipse-shaped under a battler;
   the ground runs on under them. (Ripples spreading on water at the feet are
   fine: they come and go.) A light pool is lighting, not a platform, only if
   it is much bigger than the battlers, centered between them, and its edge
   soft (close tones); a light spot is the foot of the beam that makes it,
   away from the battlers, never concentric rings.
2. **Hoenn's colors.** Take ramps from the overworld tilesets (see
   [The Emerald reference](#the-emerald-reference)) and keep a pixel-art
   palette: a few ramps of 3-4 steps, hue-shifted (warm lights, cool shadows).
   A place shows no more colors than the sea (15).
3. **One sprite pixel per screen pixel.** Make sprites at the size they appear
   (`ppu` at their depth × their size in world units); never scale a sprite.
4. **Never cover a battler.** Nothing standing may meet a battler's box
   (`check.mjs`: "nothing stands over a battler"). Frame the view with things
   painted into the ground; a standing prop, if one is ever needed, must clear
   both boxes (`propRect()`, sway included) and at most two may show.
5. **Lit from the upper left**, like the battle sprites: lit flanks on the
   left, shadows on the right, outlines on standing things, light falling
   from the upper left.
6. **Seeded.** Use `ctx.rng` and the noise helpers: an arena paints the same
   every time (its seed is its name). Adding or removing an `rng` call
   reshuffles everything drawn after it: look again.
7. **Readable behind the Pokémon.** Nothing inside the wild Pokémon's box
   (`battlerBox(ctx, 'enemy')`, a few px wider): no marks, props or boulders;
   the calmest part of the far view right behind it (a hazier row of trees,
   open water, a plain wall); framing and the little detail go to the sides.
8. **Composed.** A far view across the top, the arena's middle distance, and
   framing at the edges (cropped by the frame); the battlers' ground the
   brightest, darker toward the sides and the back; depth by the far view's
   haze.
9. **Calm and sparse, like the sea.** Restraint, not blandness: each place
   keeps its character in a few well-drawn things. `node tools/arena/check.mjs`
   holds every place to the sea.

## Workflow

1. Write or change the arena in `arenas.ts`: an entry in `ARENAS` with the
   Hoenn place it is (`name`, as the menus show it, and a line `about` it).
   The playtest's place list and the battle page's picker are built from
   `ARENAS`, so that is the only list.
2. Iterate fast in node: `node tools/arena/preview.mjs <arena> --wide --boxes`
   paints it in a second, saves what the resting camera sees
   (`build/arenas/<arena>.paint.png`, and the whole painted area with
   `--wide`) and prints its calm and sparse figures (run it with `water` too,
   to compare with the sea). It matches the browser exactly except for the
   ground shader's life and the Pokémon.
3. Look at it in the browser with the Pokémon and the UI, and without:
   `/?mode=stage&env=<arena>&player=blaziken&enemy=swampert&scale=3` (`&ui=0`
   without the UI; try every species on both sides), or a still of the battle view with
   `node tools/shots/move_sheet.mjs --base <dev server> --species blaziken --enemy swampert --clips idle --attacker enemy --every 1 --frames 1 --density 3 --ui 1 --env <arena> --out build/sheets/<arena>.png`
   (`--ui 0` without it). Zoom into screenshots: judge at GBA pixels, and
   judge by eye: the numbers are a guard, not the goal. Put it next to the
   sea: the places should feel like one family.
4. `node tools/arena/check.mjs` (every arena names its place, no Emerald
   backgrounds, the screen fully painted, the palette, nothing over a battler,
   seeded, painting time, as calm as the sea, as sparse as the sea);
   `--render --base <dev server>` also renders each arena in the browser into
   build/arenas/ and checks that the Pokémon are the focus.
5. Watch a battle in it (`/?mode=battle&env=<arena>`, or step one with
   `&manual=1` and `window.__battle.step(n, false)`): the intro (the window
   opening on the arena, the wild Pokémon in shadow), the ball's white flash,
   a big move's tint and camera shake
   (`/?mode=clipreview&move=EARTHQUAKE&species=swampert&enemy=blaziken&attacker=player&env=<arena>`),
   the life of the ground. An arena's battle transition is its kind of place's
   (`transitionKind` in src/battle/transition.ts; `/?mode=transition&env=<arena>`
   plays it).

## Calm (the sea is the benchmark)

The user loves the places but wants them subtle: the Pokémon, drawn with
strong outlines and full color, must stand out. The open sea is the level to
reach, and the sparse pass went well below it on every measure.

- **Around the wild Pokémon, nothing.** No marks, props or boulders in its
  box; the far view behind it is the calmest part of the far view (the
  meadow's tree line opens onto a hazier row there, the cave's wall is plain).
- **Marks a shade off their ground, never two, and few.** Tone steps between
  neighbors of about 17-20 luma keep blade teeth and tufts from reading as
  marks; none a near-black or white dot on a light or dark ground.
- **Detail as long lines, not scattered dashes.** The sea's crests are long
  crisp runs; the meadow's borders are rows of blades, the cave's ledges long
  lips. Far off, fine repeated marks break into dotted rows: a stripe there
  must be 2-3 px, not 1.
- **Clean bands, no dither.** Tones step in whole shades with clean borders;
  a soft edge comes from close tones, not from dither.
- **The far view soft.** Hazed toward the sky or the dusty light: lighter,
  grayer, fewer and closer steps, outlines a dark tone of the thing's own
  color instead of near-black.
- **Highlights short of white.** The next shade down from white.
- **The sea is not changed.** Its painter and everything only it uses stay
  as they are; helpers it shares keep their behavior for its calls (it paints
  bit-identically).

The calm gates (`check.mjs`, "as calm as the sea") measure the resting
screen (ground and props, no Pokémon, no ground shader life) where the battle
shows it (`shownMask()`), in luma, with `screen.mjs` `calm()` and
`propsShowing()`. Each limit is the sea's own value with a stated margin, so
the sea passes by construction:

| measure | what it is | the sea | limit |
|---|---|---|---|
| busy | mean luma step from each shown pixel to its right and lower neighbors (the two added): texture, dither, marks, outlines, all of it | 15.9 | sea +10% (17.5) |
| strong edges | share of shown pixels with a step over 24 luma to the right or below: hard edges, dark outlines | 22.9% | sea +10% (25.2%) |
| specks | isolated pixels per 1000 shown: off all four neighbors by over 16 luma (pebbles, glints, checkered dither) | 26.4 | sea +10% (29.0) |
| marks | scattered marks per 1000 shown: 8-connected blobs of 12 px or fewer standing out of their 5x5 surroundings' median by over 20 luma (long lines and big things don't count) | 7.0 | sea +30% (9.2) |
| open ground | share of shown pixels whose 7x7 surroundings' mean step is under 6 luma | 36% | at least sea -10% (32.8%) |
| behind the wild Pokémon | busy over the shown pixels of its battler box widened by 12 px | 15.1 | sea +10% (16.6) |
| props showing | props with 24+ pixels in the shown area | 0 | 3 |

Where the places stand (before: as they were before the sparse repaint):

| arena | busy | strong | specks | marks | open | behind foe | props |
|---|---|---|---|---|---|---|---|
| water (sea) | 15.9 | 22.9% | 26.4 | 7.0 | 36% | 15.1 | 0 |
| grass | 5.1 (was 11.3) | 7.1% (15.5%) | 4.9 (25.0) | 2.4 (5.9) | 76% (51%) | 3.0 (7.3) | 0 (2) |
| cave | 3.9 (was 11.8) | 6.0% (20.4%) | 1.4 (9.6) | 0.8 (8.0) | 75% (42%) | 3.5 (13.4) | 0 (0) |

## Sparse (like Emerald's backgrounds)

The sparse gates (`check.mjs`, "as sparse as the sea") measure the same
screen the same way (`screen.mjs` `sparse()`, `calm()`, `propsShowing()`).
Every limit is the sea's own value, no margin but for the tones:

| measure | what it is | the sea | limit |
|---|---|---|---|
| colors | distinct colors shown: a small palette | 15 | at most the sea's (15) |
| three tones | share of the shown pixels in the three most-used colors: a few broad tones, large flat areas (the sea's water is three blues; Emerald's fields are one or two tints) | 75.0% | at least 90% of the sea's (67.5%) |
| specks | as in calm | 26.4 | at most the sea's (26.4) |
| marks | as in calm | 7.0 | at most the sea's (7.0) |
| far darks | 5th percentile of the luma of the shown far view (rows 1-25): haze lifts the far view's darks, no near-black far off | 93.8 | at least the sea's |
| far contrast | the far view's luma spread, 5th to 95th percentile: haze lowers its contrast | 99.5 | at most the sea's |
| props showing | as in calm | 0 | 2: framing at the edges, no clutter |

| arena | colors | three tones | specks | marks | far darks | far contrast | props |
|---|---|---|---|---|---|---|---|
| water (sea) | 15 | 75.0% | 26.4 | 7.0 | 93.8 | 99.5 | 0 |
| grass | 9 (was 31) | 81.8% (58.5%) | 4.9 (25.0) | 2.4 (5.9) | 132.9 (97.6) | 55.7 (69.1) | 0 (2) |
| cave | 11 (was 10) | 77.3% (61.5%) | 1.4 (9.6) | 0.8 (8.0) | 106.5 (31.6) | 41.9 (144.7) | 0 (0) |

Both places as they were before this pass fail it: the old meadow on colors
and tones (flowers, a sand path, six greens in the grass), the old cave on
tones, marks (floor hatching), far darks and far contrast (a near-black
chamber behind a bright pool).

## Focus (the Pokémon stand out)

With `--render`, `check.mjs` renders every arena in the browser with the
three species facing each other (Blaziken vs Swampert, Sceptile vs Blaziken,
Swampert vs Sceptile: each on both sides), no UI, reads the screen and the
pipeline's id mask (which pixels are a Pokémon), and measures with
`screen.mjs` `focus()`: the arena's most saturated color shown (99.9th
percentile of chroma, max - min of R, G, B) must stay under the Pokémon's
saturated colors (90th percentile of theirs), and the strongest edges of the
arena right around them (99th percentile of local contrast, 3-16 px from a
Pokémon) under their own strongest edges (99th percentile of theirs: their
outlines).

| arena | arena chroma < the Pokémon's | contrast around them < theirs |
|---|---|---|
| water (sea) | 132 < 148-173 | 146 < 165-181 |
| grass | 75-90 < 148-173 (was 198: the flowers) | 39-100 < 195-211 |
| cave | 90-91 < 148-173 (was 99 < 148-173) | 55 < 161-181 (was 123 < 161-186) |

## Techniques that work

- **Borders drawn as blades** (meadow): sample a grass tone a blade's height
  lower (`bladeTooth()`), so the nearer tone pokes up into the farther in
  blades, instead of dithering between them.
- **Emerald's bands** (meadow): toward the back, a thin stripe of the next
  tone before the tone itself, borders wandering gently; 2-3 px far off, or it
  breaks into dashes.
- **Shade that follows what casts it** (meadow): the shade under the tree
  line is the union of an ellipse under each canopy, so its edge is scalloped
  like the canopies.
- **A tree line that opens behind the wild Pokémon** onto a farther row in
  the leaves' two lighter tones, outlined in the darkest: depth, and the
  calmest far view right where the Pokémon reads.
- **Leaf clusters, not noise** (`tree()`): sphere light per clump, its tone
  boundaries broken by value noise ~3.5 px across into clusters, a leafy
  scalloped edge, a stray pixel taking its neighbors' tone.
- **Tall grass as a fan** (`tallGrass()`): tapered blades curving outward,
  tallest in the middle, the ones behind dark, the ones in front mid with a lit
  left edge; outlined except along the ground.
- **Ledges as rows of rock tops** (cave): each lip a row of low arcs (1 px
  high, 0.45-0.65 units wide), the lowest lip in the rock's light, the bands
  darker going up.
- **A beam and its foot** (cave): a slanted column lifts what it crosses one
  step (wall and floor) and ends in a small bright foot on the floor, the
  place's one 4th step; no concentric halo.
- **A soft pool of light from close tones** (cave): a lobed ellipse much
  bigger than the battlers, the floor around it only ~15 luma darker, so its
  edge reads soft with no dither.
- **Crisp lines at any distance** with `onLine()`: wave crests; lines that
  crowd closer than `maxStep` drop out.
- **Reflections**: the object's own silhouette mirrored in darker water,
  broken into lines (sea stacks).
- **One rock across places**: the cave's boulders are the sea stacks' `crag()`
  in Hoenn's pink-brown rock: the places read as one family.
- **Framing painted into the ground**: a dark rock or a clump of tall grass
  at the left edge of the foreground, its foot under the text box, cropped by
  the frame.

## Failure modes and fixes

| looks like | fix |
|---|---|
| empty or washed out | sparse is not empty: a few well-drawn things at the edges and in the far band (framing, a tree line, a wall with ledges), lit from the upper left; the middle stays calm |
| noisy, busy ground | too many marks or dithered noise everywhere: fewer, clearer patches, broad tones, marks only where the Pokémon stand |
| a light pool that reads as a stage or platform | make it much bigger than the battlers, centered between them, its edge a close step (~15 luma), lobed a little |
| a light spot that reads as a disc | draw it as the foot of the beam that lands there, one step, no halo around it |
| a meadow border that reads as a runway | a tone edge at constant world x converges to the vanishing point: bend it with z, or keep it at the frame's edge |
| a stripe that breaks into dashes far off | too thin: 2-3 px there, low wobble |
| a dithered field (a gradient spread over many pixels) | slow gradients with `band()` softness dither wide: clean steps, close tones |
| blade teeth or tufts counted as marks | the neighboring tones are over 20 luma apart: bring them within ~17-20 |
| rocks that read as eggs or beans | faceted `crag()` |
| a thing peeking behind the wild Pokémon's head | move it past x 225 or out of rows 10-80 around x 140-215 |
| a framing prop never shows, or shows as a sliver | the player's box starts at x 10: paint the framing into the ground instead |
| "as calm as the sea" or "as sparse as the sea" fails | map what the failing measure counts (the rules are in `screen.mjs` `calm()` and `sparse()`) and calm that, by eye, with the Pokémon and the UI up |
| too many colors | a ramp per material, 3 steps; reuse a ramp's step for another thing (the tall grass uses the meadow's and the leaves' tones) |
| far darks too dark | the far view is hazed toward the sky or the dusty light: lift its darkest steps, outline far things in their own dark tone |
| "the Pokémon are the focus" fails | something saturated in the arena (flowers, a bright accent): pull it toward the ground's tones; or strong edges beside a Pokémon: soften them |
| the top of the screen empty | nothing standing far enough back: a tree line or a wall whose feet sit around z 14-20 |
| water too white | lower `look.waveDensity`, wave color a shade lighter than the water rather than white |
| painting too slow | trace geometry once per pixel; avoid Maps and repeated `fbm` in neighbor tests |
