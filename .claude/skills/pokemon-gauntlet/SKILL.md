---
name: pokemon-gauntlet
description: Bring one Pokémon species into this repo's 3D battle system at the reference (Blaziken) quality, end to end — a species brief from the game's own data, the pre-rigged model, rig map, a grounded battle stance in the stock Emerald sprites' spirit that faces the foe, calibration, springs and effect emitters, a clip for every action its moves take at the level of the first clips of Blaziken, Sceptile and Swampert (contact moves leaping to the foe and landing on it; a Double Kick kicks twice), frame-by-frame review from both sides, and the automated gates. Use for "add <species>", "run the gauntlet for X", "rig/animate a new Pokémon", or finishing a species that fails tools/gauntlet/check.mjs.
---

# The Pokémon gauntlet

You are adding one species. The bar is Blaziken (`src/pokemon/blaziken/`):
it looks like its stock sprites from both sides, every attack reads as *this*
creature doing *that* move (Flamethrower comes from its beak with its arms
braced; Blaze Kick leaps to the foe and lands a spinning flaming kick on it,
then hops home), and it never freezes. What the user asked of every species,
in their words: *they must satisfy every attack type and move depending on
what the move is (punch, kick, double kick etc), not just standard attacks;
use the fundamentals of animated 3D characters; a comprehensive move set for
every Pokémon*, and contact moves *jump toward the opposing Pokémon and
actually engage with it, like Blaziken does*. So:

- **the first clips are the standard**: the clips of Blaziken, Sceptile and
  Swampert as the user first saw and loved them (`src/pokemon/<slug>/first.ts`,
  and `more.ts` for the clips added since in their style). Every clip you make
  reads like one of them: one springing leap to the foe along an arc (never a
  string of small hops, never a blow from beside the foe), the whole body in
  the strike, follow-through, a deep landing, a hop home;
- **a clip for every action its moves take**: the moments (idle, intro, hit,
  faint), the category clips, and a clip per motif its movepool needs (a punch
  punches, a kick kicks, Double Kick kicks twice, a bite bites, Earthquake
  stamps); every move plays the clip of its action (`motifClips`). One
  excellent clip per action, not a rushed clip per move: the user rejected
  that as "very bad";
- **contact moves travel to the foe and land on its body**, then come home;
- **the stance is battle-ready and grounded**: both feet on the ground (all
  four for a quadruped), the stock sprite's character and posture, never a
  copy of a mid-motion pose (a sprite caught mid-leap or on one foot: the
  user, of Combusken's crane stance: "you don't have to match exactly when
  they're in a dynamic stance").

The gates in `tools/gauntlet/check.mjs` hold all of it (a clip for every
action, the fundamentals and, with `--render`, that every blow lands),
and your own frame-by-frame review must back them up. Load the
`pokemon-animation` skill before writing clips.

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

In a git worktree (an agent working beside another, each in its own).
Run few at a time: at most two or three agents at once, one species each.
The user asked for slower, less parallel work. Fourteen at once overloaded the
4-core machine (load over 40) and used up the account's weekly limit in an
hour.

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

prints the Pokédex entry, types, stats, abilities, the Gen 3 level-50
moveset, and its whole **movepool**: every move it can know (its level-up
moves and its pre-evolutions', TM/HM, tutor, its family's egg moves,
Struggle), each with its motif (the kind of action: bite, beam, jet,
quake...) and the clips it needs; then the situation clips. That list is your
work order. Look at the stock sprites
(`public/assets/gba/pokemon/<slug>/front.png`, `back.png`; tile them at 4×).
Then decide, and write into `index.ts`:

- `brief`: `bodyPlan` (biped/quadruped/...), `character` (how it moves and
  fights: weight, temperament), `powerSource` (where its type power comes from —
  the Pokédex often says: Blastoise's shell spouts, Venusaur's flower).
- `showcaseMoves`: four learnable moves that show it off — one physical, one
  special, one status and its signature — preferring its level-up moves.
- How it travels to the foe, from its body plan and character: a biped's
  leap, a quadruped's pounce or dash (Linoone runs in straight lines,
  Zigzagoon zigzags), a heavy species' lumbering hop (Swampert), a
  caterpillar's scrunch-and-spring, a cocoon's hop and topple, a moth's
  flutter. Every contact clip uses it, re-timed per move.
- `emitters` / `emitterFor`: where each of its effects leaves the body.

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

Match the stock **front** sprite's posture: the crouch, how the limbs are
held, the head's tilt, the tail, how wide it stands; but a battle stance,
grounded: both feet on the ground (all four for a quadruped). A sprite drawn
mid-motion (mid-leap, on one foot, a kick raised) gives the character, not
the pose: stand it on its feet in that spirit, and document the lower
silhouette score as a FIT_EXCEPTIONS entry in check.mjs. Not its orientation:
every battler always faces its opponent, at rest and in every move, so the
stance faces the foe (body square to it, head looking at it). Sprites are
drawn side-on; copying that turn leaves the Pokémon looking away until it
attacks, then turning round to strike, which reads as wrong. The render gate
measures it (`stance faces the foe`: head within 20°). Iterate:

```sh
node tools/shots/shoot.mjs --url "http://127.0.0.1:5173/?mode=riglab&species=<slug>&onion=0.5" --out build/riglab/<slug>.png
```

Bottom row: the battle view with the stock sprites onion-skinned over the
model, next to a real Emerald frame. Keep `plantFeet: 1` and an expression
if the eyes use an atlas. Conventions are in the pokemon-animation skill.

## 5. Calibrate

```sh
node tools/calibrate/run.mjs --species <slug>                # height (silhouette IoU; the model faces the foe, no yaw)
node tools/calibrate/run.mjs --species <slug> --phase color  # toon grade + outline policy
```

The fit sets the height and where the model stands in each slot (a small
sideways and depth offset), never a turn. Gates: opponent side IoU ≥ 0.55 and
box IoU ≥ 0.75 (the front sprite is drawn about the way the model faces);
player side IoU ≥ 0.45 and box IoU ≥ 0.65 (back sprites are side-on, the
model faces the foe: it has to cover the sprite's area); color loss ≤ 1.0. A
poor fit means the stance is wrong — fix the stance and re-run, never the
thresholds. Check `reference/calibration/<slug>.png`. Floating species set
`slots.enemy.lift` by hand.

Steps 4 and 5 go together: when a fit is poor, write two to four stance
variants as extra named poses (`c1`, `c2`... each a copy of `stance` with the
change you are testing: more crouch, head up, arms wider) and compare them in
one run instead of editing the stance back and forth:

```sh
node tools/calibrate/candidates.mjs --species <slug> --poses stance,c1,c2,c3
```

It prints each candidate's height and fit against the gates, marks the best,
and saves `build/calibrate/<slug>-<pose>.png` (battle view and overlap: green
both, red sprite only, blue model only — red at the top means the model is too
short there, blue at the sides means it stands too wide). Make the winner the
`stance`, delete the candidates, then run `run.mjs`. Candidates vary posture
only: a candidate that turns the head or body away from the foe fails the
facing gate, whatever its IoU.

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

Follow the **pokemon-animation** skill and `reference/move-actions.md`, with
the first clips open beside you. Required, all bespoke to the species (none
may stay a generic placeholder):

- the **moments**: `idle` (a loop), `intro` (with its `cry`), `hit`, `faint`
  (with its `shrink`);
- the **category clips** its movepool uses: `physical_weak` (its quick blow),
  `physical_strong` (its big blow), `special_weak`, `special_strong`,
  `status_self`, `status_target`;
- a **clip per motif** its movepool needs, named after the motif (`kick`,
  `punch`, `bite`, `tackle`, `slam`, `quake`, `shield`, `burrow`, `toss`...)
  or a category clip mapped to the motif in `motifClips` when it truly is that
  action (a spit serves Toxic; a roar serves a bellow). The gate lists every
  motif whose moves fall through to a clip made for another action.

Start each clip from the first clip that does that action (Blaziken's kicks
and punches, Sceptile's blades and tail, Swampert's heavy blows, breaths and
waves): the same beats, timing and arcs, re-posed on your stance and
proportions and re-timed for your weight. An evolution line starts from its
final form's first clips (Combusken and Torchic from Blaziken's, Grovyle and
Treecko from Sceptile's, Marshtomp and Mudkip from Swampert's); a body the
first clips don't have (a quadruped, a caterpillar, a cocoon, a moth) keeps
their beats: anticipation, one springing leap or pounce along an arc, the
strike with the whole body, follow-through, a deep landing, a hop home.

The engine plays a clip made in one piece in the pieces a battle needs (a
hit each for multi-hit moves, a turn each for Dig and Solar Beam: see the
pokemon-animation skill); give a two-blow action two impacts and a burrow its
`dig`, and the rest follows. Situations beyond the moments (sleeping, a
status taking hold, a stat rising...) are optional: the game shows its own
effect on the body at rest.

Each clip carries the events its effects need. Keep the clip files
organised like the first clips: helpers and reusable deltas (the stance's
guard, tuck, landing), then one commented clip per action.

## 8. Review — the part that makes the quality

For every clip, from **both** sides:

```sh
node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE,...> --attacker enemy  --density 3 --every 4 --frames 24 --out build/sheets/<slug>-enemy.png
node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE,...> --attacker player --density 3 --every 4 --frames 24 --out build/sheets/<slug>-player.png
node tools/shots/move_sheet.mjs --species <slug> --clips idle,intro,hit,faint --attacker enemy --density 3 --out build/sheets/<slug>-moments.png
node tools/gauntlet/uiclear.mjs --species <slug> --shots build/sheets/uiclear
```

`uiclear.mjs` plays every clip that stays at home from both sides and fails
any that goes under a healthbox: from our side the foe's box is only a few
pixels above our Pokémon's head and ours is to its right (see the
pokemon-animation skill); `--shots` saves the worst frames.

For a batch, `tools/shots/fastsheet.mjs` is many times quicker than
move_sheet: the battle view loads once per side and every item plays after
the last, one image per item with both sides stacked
(`--items move:LEAF_BLADE,clip:dodge,...`, `--enemy <slug>` for a foe of
another size). `tools/gauntlet/uiclear_fast.mjs --species <slug> [--clips a,b]`
is the quick healthbox pass while iterating; the gate still runs the real one.

The benchmark for *engaging* is the first set of clips the user saw and
loved, from before the compiled game: `git show
b7c4fdb:src/pokemon/blaziken/clips.ts` (and `sceptile/clips.ts`,
`swampert/clips.ts` at the same commit). A contact move there springs into a
real leap (`root.y` 0.07 h for a jab, 0.2 h and more for a big blow), strikes
with the whole body at the foe (a spinning kick at the top of the arc, an
uppercut that lifts both feet off the ground), carries through, lands deep
and hops home. Hold every contact clip to that: a shuffle, a small step or
a strike that barely leaves home is not engaging.

Open the sheets and look at every frame: anticipation, the leap to the foe
and the blow landing **on its body**, follow-through, arcs, no sliding, the
hop home, the effect leaving the right body part, the silhouette readable
from our side (cropped by the text box) and the opponent's side. Fix, re-render,
and tick the clip in `src/pokemon/<slug>/REVIEW.md` only when it is right. When
all clips pass, export the GIFs at game resolution and watch them once more:

```sh
node tools/shots/clip_gifs.mjs --species <slug> --out build/clips/<slug>
```

Then watch it in the compiled game, where it will be played: the game page's
test battle puts it on either side (`node tools/gauntlet/setup_worktree.mjs`
copied the compiled game into the worktree):

```text
http://127.0.0.1:<port>/game.html?battle=<SPECIES>:5,ZIGZAGOON:3,GRASS   (ours)
http://127.0.0.1:<port>/game.html?battle=TORCHIC:5,<SPECIES>:3,GRASS    (the wild one)
```

X is A, arrows move, Z is B. The page has the game's move animations wait
for the 3D attacker's blow (with `&manual=1`, add `&hold=1`). A battle's moves are the
wild rule's (its last four level-up moves); give it others with
`<SPECIES>:<LEVEL>:<MOVE>/<MOVE>/...`. Watch the intro (the wild one in
shadow, ours coming out of its ball), moves each way, the hits and a faint:
contact moves must leap to the foe, land on it as the game's hit effects
flash, and come home; everything reads clearly at the GBA's pixels and stays
under the text box and clear of the healthboxes.
Screenshot the canvas with Playwright (`page.screenshot` with the canvas's
box) and look at the frames.

## 9. Gates and handoff

```sh
node tools/gauntlet/check.mjs --slug <slug>            # static gates: movepool, situations, fundamentals
node tools/gauntlet/check.mjs --slug <slug> --render   # + battles both ways, every move performed and
                                                       #   every clip played, each blow landing on the foe
node tools/gauntlet/fundamentals.mjs --species <slug>  # the fundamentals alone, clip by clip
node tools/gauntlet/motion.mjs --species <slug>,blaziken   # fluidity next to the reference
npx tsc --noEmit
```

`motion.mjs` measures the clips as the battle plays them. Blaziken's numbers
are the bar: pops only on strikes, no dead holds, and no turn in the first
0.3 s of a move (a pivot on the spot before a move reads as mechanical).

All gates pass; fix warnings where they point at real gaps (no springs, a
rushed turn). Commit
`src/pokemon/<slug>/`, `public/assets/pokemon/<slug>/` and the registry line
with a message that says what the species does (e.g. "Blastoise: cannon jets,
shell spin, braced bite"). Report: the brief, how it travels, the clips (a
line per action family), the gate output, and anything you could not get
right.
