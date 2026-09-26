---
name: pokemon-arena
description: Design, paint or fix a battle arena (the place a battle happens) in this repo — the ground, the far view, what stands in it and how it moves — in the remake's pixel-art style with Hoenn's colors and no platforms under the Pokémon, as calm as the open sea so the Pokémon stay the focus. Use when adding a place to battle, when an arena looks flat, noisy, too busy, cluttered or "not like Pokémon", when something in an arena covers a Pokémon, when tools/arena/check.mjs fails (e.g. "as calm as the sea"), or when touching src/render3d/arena, environment.ts or ambience.ts.
---

# Battle arenas

An arena is designed for the remake, not copied from Emerald: Emerald's battle
backgrounds (BG3 art with two platform ellipses) are never projected or traced.
The Pokémon stand on the ground itself; their shadows ground them. Everything
is painted for the one battle camera, so every pixel lands on exactly one GBA
pixel at rest.

Read `src/render3d/arena/arenas.ts` first (Route 101's `meadow` is the
reference; the Battle Tower, Granite Cave and Seafloor show the other
techniques), then `design.ts` (the painting helpers) and the header of
`src/render3d/environment.ts`.

**The Pokémon are the focus.** The open sea (Route 124, `sea()`) is the
benchmark of calm the user asked every place to reach: broad areas of one
tone, detail drawn as long crisp lines, almost nothing scattered, the water
right around and behind the wild Pokémon nearly still. Do not change the
sea. Every other place is held to it by `tools/arena/check.mjs` (see
[Calm](#calm-the-sea-is-the-benchmark)).

## What the battle view shows

The camera sees ground only (the horizon is ~38 px above the screen). At rest:

| rows (GBA px) | ground z | what goes there |
|---|---|---|
| 0-25 | 26-15 | the far view: tree lines, walls, dunes, ridges, reefs (feet around z 14-20) |
| 25-60 | 15-9.5 | the back of the arena: banks, paths, ponds, the wild Pokémon's surroundings |
| 60-112 | 9.5-6 | the arena around the battlers (1 unit = 40-60 px wide here) |
| 112-160 | < 6 | under the text box: never seen at rest |

The wild Pokémon stands at about (179, 73) (x -1.28, z 8.45) and fills the top
right; the player's is at (74, 174) (x 0.52, z 4.1), its body covering x
40-125 from row ~45 down. The enemy's healthbox covers x 12-112, rows 14-44;
the player's x 126-230, rows 72-109; the text box everything from row 112. So
what shows is the band across the top, the upper right around the wild
Pokémon, and the left side (x 0-40, rows 44-112): compose for those. During
the intro there are no healthboxes and nobody on our side yet: the whole
screen above the text box shows as the window opens on it, the wild Pokémon
already in its spot. The arena itself never moves, so nothing beyond the
screen's edges is ever seen.

Props may not overlap the battlers' boxes (the player's is x 10-138 from row
54 down, the enemy's x 133-225, rows 3-83): standing props frame only the
very edges (`frameProp()` nudges one outward until it fits, cropped by the
frame) or stand in the far band. Foreground framing at the left (big tufts,
rocks, reefs) is painted into the ground with `stand()` or `ground.sprite()`:
the player's Pokémon is nearer and covers it correctly. Nothing is placed
beyond the painted area (the screen and the shake margin): it never shows.

What the checks measure as shown (`tools/arena/screen.mjs` `shownMask()`):
rows 0-111, minus the healthboxes and the middle of the player's battler box
(24 px in from each side, 30 from its top), which any Pokémon on our side
covers. The calm around the wild Pokémon is its battler box widened
(`foeCalm()` in design.ts: 1 inside the box widened by `pad` px, fading to 0
over 16 px more).

## What an arena is made of

| layer | how | where |
|---|---|---|
| ground and far view | `fill()` paints every screen pixel from its ground point (x, z, ppu); `scatter()` spreads marks evenly for their distance; `hills()` paints ridges and reefs (`soft` dither, `layers` for rock's layer lines); `dunes()` sharp-crested dunes (`soft`); `stand()` paints trees and rocks in the far view (and painted foreground framing) with shadows; `onLine()` draws crisp 1-pixel pattern lines (wave crests, ripples, grout, court lines) at any distance; `shafts()` light shafts (dithered, or `banded`); `shift()` moves a color along its ramp (lighten/darken in the palette); `foeCalm()` how deep a pixel is in the calm around the wild Pokémon; `cells()` (art.ts) cellular noise for crusts, basalt joints, slabs; in arenas.ts `tint()` (haze), `squeeze()` (a ramp drawn toward its middle: less contrast, same hues) and `halves()` (a ramp with half-steps between its shades) | `design.ts`, `art.ts`, `arenas.ts` |
| geometry | a vertical wall is the view ray meeting z = WZ (the tower); a chamber with side walls and terraced ledges is traced per pixel into typed arrays once (the cave) | `arenas.ts` |
| materials | each painted pixel carries a material the ground shader animates per GBA pixel: `GRASS` (leans, wind bands), `WATER`/`SHALLOW` (drifting waves, glints, ripples at the feet), `LAVA` (churning glow), `BACKDROP` (far things: no ground effects, heat haze), `SOLID` | `art.ts` `MAT`, `ground.ts` |
| props | pixel-art sprites made at their on-screen size (`sprites.ts`: trees and bushes (`speckle`, `soft` in their palette), tall grass, reeds, rocks (`cracks`), faceted `crag`s, `seaweed`, `coralHead`, `staghorn`, `seaFan`, `anemone`, `starfish`, desert `shrub`s, stalagmites, lamp posts, steam `wisp`s) standing at their depth, hidden by and hiding the Pokémon by depth, swaying row by row in whole pixels | `props.ts`, `addProp()` / `frameProp()` |
| life | wind, gusts, motes (seeds, sand, ash, bubbles), dust on landings, cloud shadows; ground effects: grass waves, glints, underwater caustics (a drifting cellular net), heat haze (the far view's rows wobble, sand and Mt. Chimney) | `ambience.ts` (`ArenaDesign.ambience`), `ground.ts` |
| intro and fades | the intro is the window opening on the arena from the middle row (`src/battle/scene.ts` `intro()`); the arena's palette fades (ball flash, move tints) are the pixel pipeline's (`setEnvironmentBlend`). The arena never moves | `pipeline.ts`, `environment.ts`, `src/battle/scene.ts` `intro()` |

## Rules

1. **No platforms.** Nothing ring-, disc- or ellipse-shaped under a battler;
   the ground runs on under them. (Ripples spreading on water at the feet are
   fine: they come and go.) A light pool is lighting, not a platform, only if
   it is much bigger than the battlers and centered between them.
2. **Hoenn's colors.** Take ramps from the overworld tilesets
   (`decomp/pokeemerald/data/tilesets/*/palettes`, or
   render a route's map to see them in use) and keep a pixel-art palette: a
   few ramps, dark to light, hue-shifted (warm lights, cool shadows). The
   checks cap an arena at 96 colors; the good ones use 10-45.
3. **One sprite pixel per screen pixel.** Make sprites at the size they appear
   (`ppu` at their depth × their size in world units); never scale a sprite.
4. **Never cover a battler.** Add every prop with `addProp()` (or
   `frameProp()`), which rejects props whose drawn rectangle (`propRect`, sway
   included) meets a battler's box. Don't push to `ctx.props` directly.
5. **Lit from the upper left**, like the battle sprites: lit flanks on the
   left, shadows on the right, outlines on standing things.
6. **Seeded.** Use `ctx.rng` and the noise helpers: an arena paints the same
   every time (its seed is its name).
7. **Readable behind the Pokémon.** Keep detail out of the calm around the
   wild Pokémon (`foeCalm()`, its battler box widened): no marks, ripples,
   pebbles, props or boulders there; a calm wall, sand, water or a hazy
   tree line right behind it; framing and clusters go to the sides.
8. **Composed.** A far view across the top, the arena's middle distance, and
   framing at the edges (cropped by the frame); the battlers' ground the
   brightest, darker toward the sides; depth by marks shrinking with distance
   and the far view hazier.
9. **Calm, like the sea.** Restraint, not blandness: keep each place's
   character, but quietly (see [Calm](#calm-the-sea-is-the-benchmark)).
   `node tools/arena/check.mjs` holds every place to the sea.

## Workflow

1. Write or change the arena in `arenas.ts`: an entry in `ARENAS` with the
   Hoenn place it is (`name`, as the menus show it, and a line `about` it).
   The playtest's place list and the battle page's picker are built from
   `ARENAS`, so that is the only list.
2. Iterate fast in node: `node tools/arena/preview.mjs <arena> --wide --boxes`
   paints it in a second, saves what the resting camera sees
   (`build/arenas/<arena>.paint.png`, and the whole painted area with
   `--wide`) and prints its calm figures (run it with `water` too, to compare
   with the sea). It matches the browser exactly except for the ground
   shader's life and the Pokémon.
3. Look at it in the browser with the Pokémon and the UI, and without:
   `/?mode=stage&env=<arena>&player=blaziken&enemy=swampert&scale=3` (`&ui=0`
   without the UI), or a still of the battle view with
   `node tools/shots/move_sheet.mjs --base <dev server> --species blaziken --enemy swampert --clips idle --attacker enemy --every 1 --frames 1 --density 3 --ui 1 --env <arena> --out build/sheets/<arena>.png`
   (`--ui 0` without it). Zoom into screenshots: judge at GBA pixels, and
   judge calm by eye: the numbers are a guard, not the goal.
4. `node tools/arena/check.mjs` (every arena names its place, no Emerald
   backgrounds, the screen fully painted, the palette, nothing over a battler,
   seeded, painting time, as calm as the sea); `--render` also renders each
   arena in the browser into build/arenas/.
5. Watch a battle in it (`/?mode=battle&env=<arena>`, or step one with
   `&manual=1` and `window.__battle.step(n)`): the intro (the window opening
   on the arena), the ball's white flash, a big move's tint and camera shake
   (`/?mode=clipreview&move=EARTHQUAKE&species=swampert&enemy=blaziken&attacker=player&env=<arena>`),
   the life of the ground. An arena's battle transition is its kind of place's
   (`transitionKind` in src/battle/transition.ts; `/?mode=transition&env=<arena>`
   plays it).

## Calm (the sea is the benchmark)

The user loves the places but wants them subtle: the Pokémon, drawn with
strong outlines and full color, must stand out. The open sea is the level to
reach. How the calm places got there:

- **Around the wild Pokémon, nothing.** Every scatter of marks (tufts,
  clover, pebbles, shells, cinders, hatching, ripples) skips pixels in
  `foeCalm()`; no props, boulders, reeds, lily pads, kelp or steam stand
  right behind it; the far view behind it is the calmest part of the far
  view (open water, a hazy tree line, a plain ledge).
- **Marks a shade off their ground, never two, and few.** Sparse scatters
  (the desert's pebbles are 5% of cells, the path's 8%), none a near-black
  or white dot on a light or dark ground.
- **Detail as long lines, not scattered dashes.** The sea's crests are long
  crisp runs; the desert's ripples lie only on the near sand, where they
  read as rows of zigzags (farther off they break into dotted rows).
- **Clean bands, little dither.** `band()` softness 0.05-0.1 on grounds and
  far views; a gradient steps in whole shades, or in half-steps (`halves()`:
  the tower's grout and slab seams), never a wide dithered field. Light
  shafts that land near a battler are `banded` (solid levels, the foot
  narrowing) instead of dithered.
- **The far view soft.** Haze (`tint()` toward the sky), a ramp drawn toward
  its middle (`squeeze()`), no highlight above the second-lightest shade, few
  flecks (`speckle`) and clean steps (`soft`) in leaves, outlines a dark tone
  of the thing's own color instead of near-black.
- **Highlights short of white.** Court lines, pillar and rail highlights,
  water streaks: the next shade down from white.
- **Few props, at the edges.** Props frame the view's edges; at most three
  show. Nothing is placed where the view never shows it.
- **The sea is not changed.** Its painter and everything only it uses stay
  as they are; helpers it shares take new options with defaults that keep
  its pixels (it paints bit-identically).

The gates (`check.mjs`, one line per arena: "as calm as the sea") measure
the resting screen (ground and props, no Pokémon, no ground shader life)
where the battle shows it (`shownMask()`), in luma, with `screen.mjs`
`calm()` and `propsShowing()`. Each limit is the sea's own value with a
stated margin, so the sea passes by construction:

| measure | what it is | the sea | limit |
|---|---|---|---|
| busy | mean luma step from each shown pixel to its right and lower neighbors (the two added): texture, dither, marks, outlines, all of it | 15.9 | sea +10% (17.5) |
| strong edges | share of shown pixels with a step over 24 luma to the right or below: hard edges, dark outlines | 22.9% | sea +10% (25.2%) |
| specks | isolated pixels per 1000 shown: off all four neighbors by over 16 luma (pebbles, glints, checkered dither) | 26.4 | sea +10% (29.0) |
| marks | scattered marks per 1000 shown: 8-connected blobs of 12 px or fewer standing out of their 5x5 surroundings' median by over 20 luma (long lines and big things don't count) | 7.0 | sea +30% (9.2): land keeps small things the open sea has none of |
| open ground | share of shown pixels whose 7x7 surroundings' mean step is under 6 luma | 36% | at least sea -10% (32.8%) |
| behind the wild Pokémon | busy over the shown pixels of its battler box widened by 12 px | 15.1 | sea +10% (16.6) |
| props showing | props with 24+ pixels in the shown area | 0 | 3: props frame the edges |

Where the places stood when the gates were set (the sea first):

| arena | busy | strong | specks | marks | open | behind foe | props |
|---|---|---|---|---|---|---|---|
| water (sea) | 15.9 | 22.9% | 26.4 | 7.0 | 36% | 15.1 | 0 |
| grass | 11.3 | 15.5% | 25.0 | 5.9 | 51% | 7.3 | 2 |
| long_grass | 11.5 | 14.2% | 22.4 | 4.4 | 49% | 7.7 | 2 |
| sand | 7.8 | 6.7% | 12.1 | 8.7 | 63% | 5.9 | 2 |
| pond | 14.7 | 20.6% | 20.0 | 4.7 | 37% | 12.5 | 2 |
| underwater | 11.1 | 12.7% | 20.0 | 6.6 | 61% | 7.6 | 2 |
| mountain | 14.2 | 17.8% | 11.3 | 4.9 | 51% | 15.7 | 1 |
| cave | 11.8 | 20.4% | 9.6 | 8.0 | 42% | 13.4 | 0 |
| building | 15.7 | 17.2% | 9.0 | 5.1 | 34% | 16.1 | 3 |

Every arena as it was before this calm pass fails at least one gate (the
old seafloor only the props cap: its clutter was coral painted into the
ground). To see what a measure counts, map it: mark the pixels that count as
specks, strong edges or marks over the screen (the rule is in `calm()`), and
look at which things light up.

## Techniques that work

- **Borders drawn as blades** (meadow): sample a grass tone a blade's height
  lower (`bladeTooth()`), so the nearer tone pokes up into the farther in
  blades, instead of dithering between them.
- **Light quantized on the structure** (tower): light each whole tile (or
  slab) one shade, so the falloff steps cleanly along the grout.
- **Crisp lines at any distance** with `onLine()`: court lines, grout, wave
  crests, ripples; lines that crowd closer than `maxStep` drop out (keep every
  other one where rows crowd).
- **Reflections** as streaks under bright things, solid near their foot and
  breaking into lines as they fade (tower), or the object's own silhouette
  mirrored in darker water, broken into lines (sea stacks).
- **Joints and crusts** from `cells()` compared with the pixel's right and
  lower neighbors: 1-pixel seams (lava crust plates, basalt columns, slabs).
- **Light shafts** (`shafts()`): solid core, checkered edges, thinning toward
  their foot; keep them to the far view or where they land. Where one lands
  beside a battler (the cave's daylight), `banded`: the core two shades up,
  the sides one, the foot narrowing to nothing, no dither.
- **Half-steps** (`halves()`): lines that must read but not cut (grout, slab
  seams, a panel's shadowed edge) in the color halfway to the next shade.
- **Backdrops drawn together** (`squeeze()`, `tint()`): the far view's ramp
  pulled toward its middle and hazed, so its shapes read at low contrast.
- **Framing** a dark rock, reef or tuft cluster painted at the left edge of the
  foreground; tall props at the very left/right edges with `frameProp()`.

## Failure modes and fixes

| looks like | fix |
|---|---|
| vertical streaks of marks | a scatter or hash keyed on something constant down the rows; key each row by its own counter |
| noisy, busy ground | too many marks or dithered noise everywhere: fewer, clearer patches, marks clustered by a noise mask at 30-50% occupancy |
| a dithered field (a gradient spread over many pixels) | slow gradients with `band()` softness dither wide: use softness ≤ 0.1, blade borders, or quantize the light per tile/slab |
| long straight stripes (ripples, waves) | the pattern depends on z only: give it x-variation, break it into runs or short marks, fade it with distance |
| hills or dunes that read as flat bands | shading per column from a smoothed slope; lit flank toward screen left |
| dunes that read as pyramids | convex windward face, sharp crest, short concave slip face in cool shade, a smaller dune riding the bigger (`dunes()`) |
| rocks that read as eggs or beans | faceted `crag()` for volcanic, sea and desert rock |
| cracks that read as contour lines (a map) | noise iso-lines: use `cells()` seams instead |
| steam that reads as white pillars | thin curling `wisp()`s, few |
| far kelp or reeds that read as posts | thin ribbons, fewer, in clumps, one flat color far off |
| a thing peeking behind the wild Pokémon's head | move it past x 225 or out of rows 10-80 around x 140-215; skip it where `foeCalm()` > 0 |
| a prop over a Pokémon | it was pushed directly or its size guessed: use `addProp()` |
| a framing prop never shows | it was scattered off-screen: use `frameProp()` at a screen spot (nothing beyond the painted area ever shows) |
| "as calm as the sea" fails | map what the failing measure counts (the rule is in `screen.mjs` `calm()`) and calm that, by eye, with the Pokémon and the UI up |
| busy behind the wild Pokémon | marks, props or bright detail in `foeCalm()`: skip them there; haze the far view behind it |
| specks everywhere | checkered dither (a wide `band()` softness, a dithered shaft's foot or edges, a speckled canopy): clean bands, `banded` shafts, fewer flecks |
| marks along a tree line's clumps | the leaf shades are far apart, so curved shade steps leave stray pixels: `squeeze()` the ramp, leaf `soft` about 0.05 |
| strong edges on every tile and seam | grout and seams a full shade off: `halves()` half-steps; highlights short of white |
| ripples that break into dotted rows far off | keep them where they read as continuous lines (the near ground) |
| a rock with two cracks reads as a face | `cracks: 1` in its palette |
| the view cluttered with props | at most 3 show: frame the edges, none in the field or around the wild Pokémon |
| the top of the screen empty | nothing standing far enough back: a tree line, ridges, dunes or a wall whose feet sit around z 14-20 |
| water too white | lower `look.waveDensity`, wave color a shade lighter than the water rather than white |
| painting too slow | trace geometry once per pixel into typed arrays; avoid Maps and repeated `fbm` in neighbor tests |
