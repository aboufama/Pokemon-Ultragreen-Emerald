---
name: pokemon-arena
description: Design, paint or fix a battle arena (the place a battle happens) in this repo — the ground, the far view, what stands in it and how it moves — in the remake's pixel-art style with Hoenn's colors and no platforms under the Pokémon. Use when adding a place to battle, when an arena looks flat, noisy or "not like Pokémon", when something in an arena covers a Pokémon, or when touching src/render3d/arena, environment.ts or ambience.ts.
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
the intro there are no healthboxes and the slide shows the painted area
beyond the screen (three screens wide), so paint and populate it too.

Props may not overlap the battlers' boxes (the player's is x 10-138 from row
54 down, the enemy's x 133-225, rows 3-83): standing props frame only the
very edges (`frameProp()` nudges one outward until it fits, cropped by the
frame) or stand in the far band. Foreground framing at the left (big tufts,
rocks, reefs) is painted into the ground with `stand()` or `ground.sprite()`:
the player's Pokémon is nearer and covers it correctly.

## What an arena is made of

| layer | how | where |
|---|---|---|
| ground and far view | `fill()` paints every screen pixel from its ground point (x, z, ppu); `scatter()` spreads marks evenly for their distance; `hills()` paints ridges and reefs; `dunes()` sharp-crested dunes; `stand()` paints trees and rocks in the far view (and painted foreground framing) with shadows; `onLine()` draws crisp 1-pixel pattern lines (wave crests, ripples, grout, court lines) at any distance; `shafts()` light shafts; `shift()` moves a color along its ramp (lighten/darken in the palette); `cells()` (art.ts) cellular noise for crusts, basalt joints, slabs | `design.ts`, `art.ts`, `arenas.ts` |
| geometry | a vertical wall is the view ray meeting z = WZ (the tower); a chamber with side walls and terraced ledges is traced per pixel into typed arrays once (the cave) | `arenas.ts` |
| materials | each painted pixel carries a material the ground shader animates per GBA pixel: `GRASS` (leans, wind bands), `WATER`/`SHALLOW` (drifting waves, glints, ripples at the feet), `LAVA` (churning glow), `BACKDROP` (far things: no ground effects, heat haze), `SOLID` | `art.ts` `MAT`, `ground.ts` |
| props | pixel-art sprites made at their on-screen size (`sprites.ts`: trees, bushes, tall grass, reeds, rocks, faceted `crag`s, `seaweed`, `coralHead`, `staghorn`, `seaFan`, `anemone`, `starfish`, desert `shrub`s, stalagmites, lamp posts, steam `wisp`s and `plume`s) standing at their depth, hidden by and hiding the Pokémon by depth, swaying row by row in whole pixels | `props.ts`, `addProp()` / `place()` / `frameProp()` |
| life | wind, gusts, motes (seeds, sand, ash, bubbles), dust on landings, cloud shadows; ground effects: grass waves, glints, underwater caustics (a drifting cellular net), heat haze (the far view's rows wobble, sand and Mt. Chimney) | `ambience.ts` (`ArenaDesign.ambience`), `ground.ts` |
| intro and fades | the scanline split of the intro and the arena's palette fades (ball flash, move tints) are the pixel pipeline's (`bands`, `setEnvironmentBlend`) | `pipeline.ts` |

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
4. **Never cover a battler.** Add every prop with `addProp()` (or `place()`,
   `frameProp()`), which rejects props whose drawn rectangle (`propRect`, sway
   included) meets a battler's box. Don't push to `ctx.props` directly.
5. **Lit from the upper left**, like the battle sprites: lit flanks on the
   left, shadows on the right, outlines on standing things.
6. **Seeded.** Use `ctx.rng` and the noise helpers: an arena paints the same
   every time (its seed is its name).
7. **Readable behind the Pokémon.** Keep the busiest detail away from the
   wild Pokémon's silhouette (x 140-215, rows 10-80): a calm wall, sand or
   water right behind its head; framing and clusters go to the sides.
8. **Composed.** A far view across the top, the arena's middle distance, and
   framing at the edges (cropped by the frame); the battlers' ground the
   brightest, darker toward the sides; depth by marks shrinking with distance
   and the far view hazier.

## Workflow

1. Write or change the arena in `arenas.ts`: an entry in `ARENAS` with the
   Hoenn place it is (`name`, as the menus show it, and a line `about` it).
   The playtest's place list and the battle page's picker are built from
   `ARENAS`, so that is the only list.
2. Iterate fast in node: `node tools/arena/preview.mjs <arena> --wide --boxes`
   paints it in a second and saves what the resting camera sees
   (`build/arenas/<arena>.paint.png`, and the whole painted area with
   `--wide`). It matches the browser exactly except for the ground shader's
   life and the Pokémon.
3. Look at it in the browser:
   `/?mode=stage&env=<arena>&player=blaziken&enemy=swampert&scale=3` (`&ui=0`
   without the UI). Zoom into screenshots: judge at GBA pixels.
4. `node tools/arena/check.mjs` (every arena names its place, no Emerald
   backgrounds, the screen fully painted, the palette, nothing over a battler,
   seeded, painting time); `--render` also renders each arena in the browser
   into build/arenas/.
5. Watch a battle in it (`/?mode=battle&env=<arena>`, or step one with
   `&manual=1` and `window.__battle.step(n)`): the intro slide, the ball's
   white flash, a big move's tint and camera shake
   (`/?mode=clipreview&move=EARTHQUAKE&species=swampert&enemy=blaziken&attacker=player&env=<arena>`),
   the life of the ground.

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
  their foot; keep them to the far view or where they land.
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
| a thing peeking behind the wild Pokémon's head | move it past x 225 or out of rows 10-80 around x 140-215 |
| a prop over a Pokémon | it was pushed directly or its size guessed: use `addProp()` |
| a framing prop never shows | `place()` scattered it off-screen: use `frameProp()` at a screen spot |
| the top of the screen empty | nothing standing far enough back: a tree line, ridges, dunes or a wall whose feet sit around z 14-20 |
| water too white | lower `look.waveDensity`, wave color a shade lighter than the water rather than white |
| painting too slow | trace geometry once per pixel into typed arrays; avoid Maps and repeated `fbm` in neighbor tests |
