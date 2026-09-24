---
name: pokemon-gauntlet
description: Bring one Pokémon species into this repo's 3D battle system at the reference (Blaziken) quality, end to end — a species brief from the game's own data, the pre-rigged model, rig map, a stance matched to the stock Emerald sprites, calibration, springs and effect emitters, a bespoke clip for every attack category and for the move motifs its moves need, frame-by-frame review from both sides, and the automated gates. Use for "add <species>", "run the gauntlet for X", "rig/animate a new Pokémon", or finishing a species that fails tools/gauntlet/check.mjs.
---

# The Pokémon gauntlet

You are adding one species. The bar is Blaziken (`src/pokemon/blaziken/`):
it looks like its stock sprites from both sides, every attack reads as *this*
creature doing *that* move (Flamethrower comes from its beak with its arms
braced; kicks leap and land with weight), and it never freezes. The gates in
`tools/gauntlet/check.mjs` must all pass, and your own frame-by-frame review
must back them up. Load the `pokemon-animation` skill before writing clips.

Work only in `src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and one
line of `src/pokemon/registry.ts`, unless a shared fix is truly needed (then
keep it minimal and say so in your report).

## 0. Setup

```sh
npm install                     # if node_modules is missing (in a git worktree you can
                                # symlink the main checkout's node_modules instead)
node tools/prepare_libs.mjs     # copies the Draco decoder into public/libs (npm run dev does this)
npx vite --port 5173 --strictPort --host 127.0.0.1 &   # pick a free port if several agents run
```

`tools/gauntlet/brief.mjs` reads the Pokédex text from the decomp
(`decomp/pokeemerald`, a git submodule): `git submodule update --init --depth 1
decomp/pokeemerald`, or symlink the main checkout's copy in a worktree.

Every browser tool takes `--base http://127.0.0.1:<port>/`. Rendering is
headless Chromium on the CPU: slow. Render only what you need while iterating
(`tools/shots/move_sheet.mjs` with a few moves), export GIFs once at the end.
Don't edit source files while a render runs (the dev server reloads the page
and the render fails).

## 1. Brief: understand the creature before touching it

```sh
node tools/gauntlet/brief.mjs --slug <slug>
```

prints the Pokédex entry, types, stats, the Gen 3 level-50 moveset and every
move it can use (level-up, TM/HM, tutor) with the move's **motif** (the body
action: bite, beam, jet, quake...). Look at the stock sprites
(`public/assets/gba/pokemon/<slug>/front.png`, `back.png`; tile them at 4×).
Then decide, and write into `index.ts`:

- `brief`: `bodyPlan` (biped/quadruped/...), `character` (how it moves and
  fights: weight, temperament), `powerSource` (where its type power comes from —
  the Pokédex often says: Blastoise's shell spouts, Venusaur's flower).
- `showcaseMoves`: four learnable moves that show it off — one physical, one
  special, one status and its signature — preferring its level-up moves.
- Which motifs get bespoke clips: the showcase moves' motifs, the two or three
  motifs most common in its learnset, and anything iconic (Blastoise: `jet`,
  `bite`, `shield`, `spin`; Venusaur: `beam`, `throw`, `powder`, `vine`).
- `emitters` / `emitterFor`: where each of those effects leaves the body.

## 2. Model

```sh
node tools/gauntlet/new_species.mjs --slug <slug> --fetch    # model, rig guess, profile files, REVIEW.md, registry
node tools/models/optimize_model.mjs --slug <slug>           # strip upstream animations, recompress
node tools/gauntlet/skeleton.mjs --slug <slug> --weights --textures build/tex/<slug>
                                # hierarchy, bone lengths, what each bone moves, textures as PNG
```

Watch for: extra LOD meshes (dropped automatically when named `lod1..`; else
list them in `hiddenParts`), alternate meshes (two cannon meshes, open/closed
parts: view both in the rig lab, hide the wrong one), effect meshes (flames:
`effectParts` + `effects`; parts the stock sprite always shows stay visible),
helper nodes and eyelid bones.

## 3. Rig map (`rig.ts`)

The guess covers the standard bones (both CamelCase `LArm` and snake_case
`left_arm_01` skeletons). Add semantic names for everything your clips and
springs will touch: tail chain (`tail`, `tail2`...), wings, fins, petals,
leaves, cannons, antennae. Quadrupeds get `frontLegs` (the scaffold detects
them). Check `/?mode=riglab&species=<slug>&bones=1`.

## 4. Stance (`poses.ts`)

Match the stock **front** sprite's silhouette: posture, head angle, limb
placement, how wide it stands. Iterate:

```sh
node tools/shots/shoot.mjs --url "http://127.0.0.1:5173/?mode=riglab&species=<slug>&onion=0.5" --out build/riglab/<slug>.png
```

Bottom row: the battle view with the stock sprites onion-skinned over the
model, next to a real Emerald frame. Keep `plantFeet: 1` and an expression
if the eyes use an atlas. Conventions are in the pokemon-animation skill.

## 5. Calibrate

```sh
node tools/calibrate/run.mjs --species <slug>                # height + per-side yaw (silhouette IoU)
node tools/calibrate/run.mjs --species <slug> --phase color  # toon grade + outline policy
```

Gates: IoU ≥ 0.55 and box IoU ≥ 0.75 on both sides, color loss ≤ 1.0. A poor
fit means the stance is wrong — fix the stance and re-run, never the
thresholds. Check `reference/calibration/<slug>.png`. Floating species set
`slots.enemy.lift` by hand.

## 6. Life: springs, eyes, effects, emitters

- `dynamics`: a spring chain per loose part (tail, ears, fins, leaves, petals,
  antennae, wing membranes). Stiff parts: damping 0.25, elasticity 0.16; loose
  ones: 0.14 / 0.05. Single-bone parts work (the far end comes from the skin).
- `expressions`: if the eye texture is an atlas (look at the exported
  `*Eye*.png`: a grid of eye states — `open`, `half`, `closed`, `angry`,
  `hurt`), declare it like Blaziken's (`material`, `cell` size in UV, `cells`) —
  blinks then come for free. Models with eyelid bones instead can blink by
  keyframing them in the clips.
- `emitters`: e.g. `cannons: { bones: ['cannonL', 'cannonR'] }`, `flower: {
  bones: ['flower'] }` (default point: the far end of the mesh each bone moves;
  `offset`/`reach` adjust it). Verify every emitter:
  `/?mode=clipreview&species=<slug>&clip=idle&mark=<emitter>&density=3`.

## 7. Clips

Follow the **pokemon-animation** skill. Required: `idle` (loop), `intro`,
`hit`, `faint`, the six category clips (`physical_weak`, `physical_strong`,
`special_weak`, `special_strong`, `status_self`, `status_target`), plus the
motif clips you chose in step 1 (named after the motif, e.g. `bite`, `jet`,
`jet_strong`, or mapped in `motifClips`). Replace every generic placeholder.
Each clip carries the events its effects need. Keep `clips.ts` organised like
Blaziken's: helpers, reusable deltas, then one commented clip per action.

## 8. Review — the part that makes the quality

For every clip, from **both** sides:

```sh
node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE,...> --attacker enemy  --density 3 --every 4 --frames 24 --out build/sheets/<slug>-enemy.png
node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE,...> --attacker player --density 3 --every 4 --frames 24 --out build/sheets/<slug>-player.png
node tools/shots/move_sheet.mjs --species <slug> --clips idle,intro,hit,faint --attacker enemy --density 3 --out build/sheets/<slug>-moments.png
```

Open the sheets and look at every frame: anticipation, follow-through, arcs,
no sliding, the effect leaving the right body part, the silhouette readable
from our side (cropped by the text box) and the opponent's side. Fix, re-render,
and tick the clip in `src/pokemon/<slug>/REVIEW.md` only when it is right. When
all clips pass, export the GIFs at game resolution and watch them once more:

```sh
node tools/shots/clip_gifs.mjs --species <slug> --out build/clips/<slug>
```

## 9. Gates and handoff

```sh
node tools/gauntlet/check.mjs --slug <slug>            # static gates
node tools/gauntlet/check.mjs --slug <slug> --render   # + battles both ways, every clip plays
npx tsc --noEmit
```

All gates pass; fix warnings where they point at real gaps (a motif its moves
use a lot still on a category clip, no springs). Commit
`src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and the registry line
with a message that says what the species does (e.g. "Blastoise: cannon jets,
shell spin, braced bite"). Report: the brief, the clips and motif clips, the
gate output, and anything you could not get right.
