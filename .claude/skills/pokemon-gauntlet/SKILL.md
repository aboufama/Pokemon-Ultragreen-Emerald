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

In the main checkout:

```sh
npm install                     # if node_modules is missing
node tools/prepare_libs.mjs     # copies the Draco decoder into public/libs (npm run dev does this)
npx vite --port 5173 --strictPort --host 127.0.0.1 &
```

In a git worktree (several agents at once, each in its own):

```sh
node tools/gauntlet/setup_worktree.mjs   # links the main checkout's node_modules, copies the
                                         # decoder, prints the vite command on a free port
```

Commit by explicit paths (`git add src/pokemon/<slug> ...`), never `git add -A`:
a worktree holds links and scratch files that must not be committed.

`tools/gauntlet/brief.mjs` reads the Pokédex text from the decomp
(`decomp/pokeemerald`, a git submodule; `git submodule update --init --depth 1
decomp/pokeemerald`). In a worktree it reads the main checkout's copy.

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

Check whether the upstream file shipped animations: `SOURCE.json` records
`optimized.removedAnimations`. When it is above zero, list them from the
upstream file (the `url` in `SOURCE.json`, downloaded to `build/upstream/`):
`node tools/gauntlet/skeleton.mjs --model build/upstream/<slug>.glb --animations`.
Official exports carry a whole battle set (`battlewait01_loop`, `attack01`,
`rangeattack01`, `charge01`, `damage01`, `down01`, `roar01`...). Those are
worth reusing: see step 7. Most models ship none.

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

Steps 4 and 5 go together: when a fit is poor, write two to four stance
variants as extra named poses (`c1`, `c2`... each a copy of `stance` with the
change you are testing: more crouch, head up, arms wider) and compare them in
one run instead of editing the stance back and forth:

```sh
node tools/calibrate/candidates.mjs --species <slug> --poses stance,c1,c2,c3 --quick
```

It prints each candidate's height, yaws and fit against the gates, marks the
best, and saves `build/calibrate/<slug>-<pose>.png` (battle view and overlap:
green both, red sprite only, blue model only — red at the top means the model
is too short there, blue at the sides means it stands too wide). Confirm the
finalists without `--quick`, make the winner the `stance`, delete the
candidates, then run `run.mjs`. If the fit turns the model side-on or away
from the foe to cover a wide back sprite, pass `--init yawLimit=60`.

## 6. Life: springs, eyes, effects, emitters

- `dynamics`: a spring chain per loose part (tail, ears, fins, leaves, petals,
  antennae, wing membranes). Stiff parts: damping 0.25, elasticity 0.16; loose
  ones: 0.14 / 0.05. Single-bone parts work (the far end comes from the skin).
- `expressions`: if the eye texture is an atlas (look at the exported
  `*Eye*.png`: a grid of eye states — `open`, `half`, `closed`, `angry`,
  `hurt`), declare it like Blaziken's (`material`, `cell` size in UV, `cells`) —
  blinks then come for free. Models with eyelid bones instead can blink by
  keyframing them in the clips.
- `emitters`: e.g. `cannons: { bones: ['cannonL', 'cannonR'], about: 'the
  cannons on its shell' }`, `flower: { bones: ['flower'], about: 'the flower
  on its back' }` (default point: the far end of the mesh each bone moves;
  `offset`/`reach` adjust it; `about` is what the move classifier reads).
  Verify every emitter:
  `/?mode=clipreview&species=<slug>&clip=idle&mark=<emitter>&density=3`.

### Moves by body part (Jev)

Which part performs each move is the species' call: Hydro Pump leaves
Blastoise's cannons but a Feraligatr's jaws; Razor Leaf flies from Sceptile's
arm leaves. Don't reason through its sixty-odd moves one by one. Classify them
with Jev (TypeSafe AI's fast "system one" classifier: a typed question in,
calibrated probabilities out) once the brief and emitters are written, since
Jev reads both:

```sh
node tools/gauntlet/classify_moves.mjs --slug <slug>        # --dry shows a request
```

One question per move: which part — mouth, head, eyes, hands, feet, tail (if
the rig has one), body (the whole body at once), or one of your emitters. It
writes `src/pokemon/<slug>/moves.json`. The battle then takes that move's
effects from the emitter its part names, and plays a `<motif>@<part>` clip
(or `motifClips` key) before the motif clip. The printout groups the moves by
motif@part (step 7 uses the groups), lists the moves under 0.6 confidence for
you to decide (set `"part"` and `"by": "hand"`; reruns keep them), and gives
Jev's motif for moves the motif table doesn't name. It needs
`TYPESAFE_API_KEY` in the environment and network access to
`api.typesafe.ai`. Without them, set `emitterFor` per motif by hand.

## 7. Clips

Follow the **pokemon-animation** skill. Required: `idle` (loop), `intro`,
`hit`, `faint`, the six category clips (`physical_weak`, `physical_strong`,
`special_weak`, `special_strong`, `status_self`, `status_target`), plus the
motif clips you chose in step 1 (named after the motif, e.g. `bite`, `jet`,
`jet_strong`, or mapped in `motifClips`). Replace every generic placeholder.
Each clip carries the events its effects need. Keep `clips.ts` organised like
Blaziken's: helpers, reusable deltas, then one commented clip per action.

Reuse before you author, but never at the expense of quality:

- **Animations the model shipped** (step 2): an official `attack01` or
  `damage01` is better than one you would write. Reuse the ones that read
  from both battle views and fit the category, keyed on your stance. There is
  no importer yet, so say in your report that the species has them.
- **Clips of finished species with the same body plan**: Blaziken's clips are
  STANCE plus deltas. Rebuild an action on your STANCE, re-time it for your
  species' weight, and make the parts it uses its own (Sceptile slashes with
  its arm leaves, not claws).
- **One clip for several moves** (`motifClips`, `moveClips`) when the motion
  genuinely reads right for all of them.
- **Enough distinct clips**: every category clip bespoke to the species, plus
  motif clips for the showcase moves and for every motif@part group of three
  or more moves whose motion differs from the category clip. When moves that
  look different share a clip, the battle reads as repetitive, and that
  costs quality.

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
node tools/gauntlet/check.mjs --slug <slug>            # static gates (+ clip lint warnings)
node tools/gauntlet/check.mjs --slug <slug> --render   # + battles both ways, every clip plays
node tools/gauntlet/motion.mjs --species <slug>,blaziken   # fluidity next to the reference
npx tsc --noEmit
```

`motion.mjs` measures the clips as the battle plays them. Blaziken's numbers
are the bar: pops only on strikes and landings, no dead holds, and no turn in
the first 0.3 s of a move made from home (a pivot on the spot before a move
reads as mechanical; the battler turns only while a contact move travels).

All gates pass; fix warnings where they point at real gaps (a motif its moves
use a lot still on a category clip, no springs). Commit
`src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and the registry line
with a message that says what the species does (e.g. "Blastoise: cannon jets,
shell spin, braced bite"). Report: the brief, the clips and motif clips, the
gate output, and anything you could not get right.
