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
reference), then `design.ts` (the painting helpers) and the header of
`src/render3d/environment.ts`.

## What an arena is made of

| layer | how | where |
|---|---|---|
| ground and far view | `fill()` paints every screen pixel from its ground point (x, z, ppu); `scatter()` spreads marks evenly for their distance; `hills()` paints dunes, reefs and ridges; `stand()` paints trees and rocks in the far view with shadows; `linePattern()` draws Hoenn's line patterns (the sea's diagonal waves, the desert's ripple rows) | `design.ts`, `arenas.ts` |
| materials | each painted pixel carries a material the ground shader animates per GBA pixel: `GRASS` (leans, wind bands), `WATER`/`SHALLOW` (drifting waves, glints, ripples at the feet), `LAVA` (churning glow), `BACKDROP` (far things: no ground effects), `SOLID` | `art.ts` `MAT`, `ground.ts` |
| props | pixel-art sprites made at their on-screen size (`sprites.ts`: trees, bushes, tall grass, reeds, rocks, kelp, coral, stalagmites, lamp posts, light shafts) standing at their depth, hidden by and hiding the Pokémon by depth, swaying row by row in whole pixels | `props.ts`, `addProp()` / `place()` |
| life | wind, gusts, motes (seeds, sand, ash, bubbles), dust on landings, cloud shadows | `ambience.ts` (`ArenaDesign.ambience`) |
| intro and fades | the scanline split of the intro and the arena's palette fades (ball flash, move tints) are the pixel pipeline's (`bands`, `setEnvironmentBlend`) | `pipeline.ts` |

## Rules

1. **No platforms.** Nothing ring-, disc- or ellipse-shaped under a battler;
   the ground runs on under them. (Ripples spreading on water at the feet are
   fine: they come and go.)
2. **Hoenn's colors.** Take ramps from the overworld tilesets
   (`pret/pokeemerald/data/tilesets/*/palettes`, or render a route's map to
   see them in use) and keep a pixel-art palette: a few ramps, dark to light.
   The checks cap an arena at 96 colors; the good ones use 12-40.
3. **One sprite pixel per screen pixel.** Make sprites at the size they appear
   (`ppu` at their depth × their size in world units); never scale a sprite.
4. **Never cover a battler.** Add every prop with `addProp()` (or `place()`),
   which rejects props whose drawn rectangle (`propRect`, sway included)
   meets a battler's box. Don't push to `ctx.props` directly.
5. **Lit from the upper left**, like the battle sprites: lit flanks on the
   left, shadows on the right, outlines on standing things.
6. **Seeded.** Use `ctx.rng` and the noise helpers: an arena paints the same
   every time (its seed is its name).
7. **Readable behind the Pokémon.** The wild Pokémon stands at about (179, 73)
   and fills the top right; the healthboxes cover the top left and the right
   middle. Keep the busiest detail away from the enemy's silhouette; a calm
   ground under it reads best.

## Workflow

1. Write or change the arena in `arenas.ts`: an entry in `ARENAS` with the
   Hoenn place it is (`name`, as the menus show it, and a line `about` it).
   The playtest's place list and the battle page's picker are built from
   `ARENAS`, so that is the only list.
2. Look at it: `/?mode=stage&env=<arena>&player=blaziken&enemy=swampert&scale=3`
   (`&ui=0` without the UI). Zoom into screenshots: judge at GBA pixels.
3. `node tools/arena/check.mjs` (every arena names its place, no Emerald
   backgrounds, the screen fully painted, the palette, nothing over a battler,
   seeded, painting time); `--render` also renders each arena in the browser
   into build/arenas/.
4. Watch a battle in it (`/?mode=battle&env=<arena>`): the intro slide, the
   ball's white flash, a big move's tint, the life of the ground.

## Failure modes and fixes

| looks like | fix |
|---|---|
| vertical streaks of marks | a scatter or hash keyed on something constant down the rows; key each row by its own counter |
| noisy, busy ground | too many marks or dithered noise everywhere: fewer, clearer patches (`band()` with a small softness), marks at 30-50% occupancy |
| long straight stripes (ripples, waves) | the pattern depends on z only; give it x-variation (zigzags, diagonal lines) and break it into drifts with a mask |
| hills or dunes that read as flat bands | shading per column from a smoothed slope; lit flank toward screen left |
| a prop over a Pokémon | it was pushed directly or its size guessed: use `addProp()` |
| the top of the screen empty | nothing standing far enough back: a tree line, ridges, dunes or a wall whose feet sit around z 14-20 |
| water too white | lower `look.waveDensity`, wave color a shade lighter than the water rather than white |
