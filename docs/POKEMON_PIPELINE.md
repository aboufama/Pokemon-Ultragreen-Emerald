# Species pipeline (the gauntlet playbook)

Blaziken is the finished reference species; Sceptile and Swampert went through
the gauntlet as fresh agents (one worktree each, in parallel). Every other
Pokémon goes through the same steps so that it looks like its stock Emerald sprites (size, angle, colors,
outline) and has an animation for every attack category and for the move motifs
it uses. This page is the reference for the tools; the step-by-step process an
agent (or you) follows lives in the repo skills:

- `.claude/skills/pokemon-gauntlet/SKILL.md`: the process, from the species brief
  to the gates, and `REVIEW_TEMPLATE.md` for the review log;
- `.claude/skills/pokemon-animation/SKILL.md` and its `reference/motif-cookbook.md`:
  how to author clips that fit the species, its type and each move;
- `.claude/agents/pokemon-gauntlet.md`: a subagent that runs the gauntlet for one
  species (several can run in parallel in their own worktrees).

The gates are automated: `node tools/gauntlet/check.mjs --slug <slug> [--render]`.

All commands run from the repository root with the dev server up
(`npm run dev`, http://127.0.0.1:5173/).

## Definition of done

A species is done when all of these hold:

- [ ] The model is fetched with provenance (`public/assets/pokemon/<slug>/SOURCE.json`).
- [ ] The rig map is reviewed: every bone the clips use resolves (`src/pokemon/<slug>/rig.ts`).
- [ ] The stance matches the stock front sprite's silhouette (rig lab onion skin).
- [ ] Geometry calibration is fitted: enemy and player IoU ≥ 0.55 and box IoU ≥ 0.75.
      Blaziken is at 0.60 / 0.61 IoU and 0.80 / 0.98 box IoU.
- [ ] Color calibration is fitted (histogram loss ≤ 1.0; Blaziken 0.94) and the outline
      policy is checked in `reference/calibration/<slug>.png`.
- [ ] Clips exist for `idle`, `intro`, `hit`, `faint` and all six categories, with the
      events the director needs (below), and for the move motifs the species needs
      (its showcase moves and its most common motifs). No generic placeholders remain.
- [ ] The species brief (`bodyPlan`, `character`, `powerSource`), emitters and four
      showcase moves are set; loose parts have spring chains.
- [ ] Every clip is reviewed frame by frame from both sides (`REVIEW.md`).
- [ ] A full autoplay battle runs with the species on each side with no errors.
- [ ] `node tools/gauntlet/check.mjs --slug <slug> --render` passes, and so does `npm run build`.

## 1. Scaffold

```sh
node tools/gauntlet/new_species.mjs --slug <slug> --fetch
```

The scaffold:

1. Downloads the pre-rigged model from
   [Pokemon-3D-api/assets](https://github.com/Pokemon-3D-api/assets) by national dex
   number, recording the sha256 in `SOURCE.json`. Only the regular mesh is needed:
   shiny Pokémon use the same mesh and the pixel pass draws the shiny GBA palette at
   the same indices, as in Gen 3. The upstream shiny meshes are separate exports whose
   skeletons don't match.
2. Reads the skeleton and guesses the semantic rig map from Game Freak's joint names.
   It strips `050 Head`-style prefixes and `Waist_63`-style suffixes, and handles
   `L`/`R` prefixes.
3. Writes the profile files:
   - `src/pokemon/<slug>/rig.ts`
   - `poses.ts` (empty stance = bind pose)
   - `clips.ts` (the generic starter set)
   - `index.ts`
   - `calibration.json` (height scaled from the stock sprite height)
4. Registers the species in `src/pokemon/registry.ts`.

The species is playable right away (`/?enemy=<slug>&enemyMoves=TACKLE,GROWL`), with
generic animations and an approximate fit. Use `--dry` to print the guessed rig
without writing anything.

## 2. Rig map

Clips address bones by semantic name, so one clip vocabulary works across species:

| semantic | typical joint | notes |
|---|---|---|
| `hips`, `spine`, `chest` | `Hips`/`Waist`, `Spine1`, `Spine2` | `pelvisNodes` = hips + spine (pelvis translation) |
| `neck`, `head`, `jaw` | `Neck`/`Neck1`, `Head`, `Jaw`/`LowerBeak` | `jaw` opens for cries, breath moves |
| `tail` | `Tail`/`Tail1`/`TailA1` | first tail joint |
| `shoulderL/R`, `armL/R`, `forearmL/R`, `handL/R` | `LShoulder`, `LArm`, `LForeArm`, `LHand` | front legs on quadrupeds, wings on birds |
| `thighL/R`, `shinL/R`, `footL/R`, `toeL/R` | `LThigh`, `LLeg`, `LFoot`, `LToe` | full chains enable foot IK (`legs`) |
| `earL/R`, `hairL/R`, `hairTipL/R` | `LEar1`, `LHair1`, `LHair2` | secondary motion |

- Inspect the skeleton with `/?mode=bonedump&species=<slug>`: bind-pose frames in
  normalized model space (+Z forward, +Y up, height 1).
- Inspect the model with `/?mode=riglab&species=<slug>&bones=1`.
- Map anything species-specific the clips need, as Blaziken does for `wristFx` and
  the fingers. Bones missing from the map are skipped, not errors.

## 3. Stance

The stance is the pose the species holds in battle and during calibration. Match
it to the stock front sprite in the rig lab:

```
/?mode=riglab&species=<slug>&onion=0.5
```

- Top row: turntable views.
- Bottom row: the real battle view through the pixel pipeline, with the stock
  sprites onion-skinned on top and the real Emerald frame beside it.

Pose conventions (see `src/pokemon/blaziken/poses.ts`):

- `bones`: rotations in degrees about **model** axes at bind pose. `x` pitches forward,
  `y` yaws toward the creature's left, `z` rolls a left arm up.
- `aim`: point a limb along a model-space direction `[x, y, z]` (+X = its left,
  +Z = forward). Most reliable for arms and legs.
- `post`: extra rotation after aims (secondary motion on top of aimed limbs).
- `pelvis`: translation of the pelvis nodes (crouching); `plantFeet: 1` keeps the
  feet on the ground with two-bone IK while the pelvis moves.
- `expression`: a cell of the eye atlas, if the profile declares `expressions`.

## 4. Calibrate

```sh
node tools/calibrate/run.mjs --species <slug>                 # height + per-slot yaw
node tools/calibrate/run.mjs --species <slug> --phase color   # toon grade + outline policy
```

- **Geometry.** Nelder–Mead on silhouette IoU plus bounding-box IoU between the
  rendered stance and the stock sprites. Both sprites sit where Emerald draws them:
  the front sprite at (176, 40 + yOffset − elevation), the back sprite at
  (72, 80 + yOffset). The battle camera is global. Never refit it for one species:
  `--fitCamera` is only for re-deriving the shared camera.
- **Color.** Fits gain, saturation and toon bands so the per-palette-index histogram
  of the pixel pass matches the stock sprites. It also derives the outline policy
  from the sprites' boundary pixels:
  - `outer`: the outline index;
  - `inner`: the crease-line index;
  - `selective`: whether lit edges use the darkest shade of their own ramp.

Check `reference/calibration/<slug>.png`: render on the left, mask overlap on the
right (green = overlap, red = stock sprite only, blue = render only). A poor fit
usually means the stance is off, so fix the stance and re-run. Floating or flying
species have `elevation` > 0. Set `slots.enemy.lift` so the model hovers where the
sprite's shadow implies.

## 5. Effects and expressions (optional)

- **Effect meshes** (flames, glows) are listed as candidates in the generated
  `index.ts`. Add them to `effectParts` (hidden by default) and bind a channel in
  `effects`. For example, Blaziken's wrist flames are
  `flames: { parts: ['Fire'], fire: {...} }`, driven by `fx.flames` in clips.
  Parts the stock sprite always shows, such as Charizard's tail flame, stay out of
  `effectParts`.
- **Expressions**: if the eye texture is an atlas, declare
  `expressions: { material, cell, cells }` so clips can set `expression`.

## 6. Clips

One clip per category, plus `idle` (loop), `intro` (sent out / appears), `hit` and
`faint`. Categories come from move data, so every move in the game maps to one
(`src/battle3d/director.ts`, `categorize`):

| category | rule | events the director reacts to |
|---|---|---|
| `physical_weak` | makes contact, power < 75 | `impact` (once per hit) |
| `physical_strong` | makes contact, power ≥ 75 (or variable) | `impact` |
| `special_weak` | no contact, power < 75 | `release` (projectile) |
| `special_strong` | no contact, power ≥ 75 | `charge`, `release` (stream), `releaseEnd` |
| `status_self` | power 0, targets the user | `aura` |
| `status_target` | power 0, targets the foe | `emit` |
| `intro` / `faint` | send-out / fainting | `cry` / `thud` |

- **Per-move overrides** go in `moveClips` (e.g. `MOVE_DOUBLE_KICK: 'physical_weak_kick'`).
  Multi-hit clips emit one `impact` per hit.
- **Channels:**
  - `advance` 0..1 travels toward the target; contact moves reach 1 at `impact`.
  - `root` moves and turns the whole body, in units of its height (jumps, spins).
    A spin can end at `yaw: 360`: blends back to idle take the short way round.
  - `root.y = -1.1` at the end of `faint` sinks it below the ground, which hides it.
  - `plantFeet` pins both feet to the ground with IK; `plantLeft` / `plantRight`
    override one leg, so a kick lifts one foot while the other stays planted.
  - `scale` pulses the whole model; `fx.<channel>` drives effect meshes.
- **Starting point:** `makeGenericClips` (`src/pokemon/generic/clips.ts`). Replace
  clips one at a time with bespoke ones, using `compose(STANCE, delta)` keys as in
  `src/pokemon/blaziken/clips.ts`.
- **Effects are automatic.** Move effects come from the move's type
  (`src/battle3d/type_fx.ts`). Clips only decide *when* things happen.

### Making it move like a creature

The engine adds a lot on its own, so clips only need the big poses:

- **Smooth curves.** Keys without an `ease` are joined by monotone cubic curves.
  Motion flows through in-between keys and only slows where a channel turns
  around. To shape an arc, add a breakdown key rather than an ease. Use `'out'`
  (a fast start and a soft stop) for snaps and strikes, and `'in'` for falls.
- **Overlapping action.** The animator reads the head, arms, hands and loose parts
  a few frames behind the hips (`DEFAULT_OVERLAP` in `src/anim/animator.ts`; a
  profile can override it with `overlap`). An action therefore ripples outward
  from the body, and an event that depends on the head or a hand belongs about
  0.05–0.08 s after its key. Legs are not delayed, so feet land on time.
- **Springs.** List loose parts (manes, tails, ears, feathers) in the profile's
  `dynamics`, e.g. `{ bones: ['tail'], damping: 0.2, elasticity: 0.1, maxDrift: 0.45 }`.
  They lag behind the body, swing past and settle. Single-bone parts work: the
  chain's far end is measured from the skin weights.
- **Life layer.** Breathing, a slow weight shift, an idle bounce and a drifting
  gaze are always on. Eyes blink when the expression atlas has `closed` (and
  ideally `half`) cells. The battler turns toward its target only while a
  contact move carries it there (the turn rides `advance` and unwinds on the
  hop home); moves made from home keep the calibrated yaw, like the stock
  sprites. A hit knocks it back on a spring (`Battler3D.recoil`).
- **Breath attacks come from the mouth.** `charge`, `release` and mouth `emit`
  effects start at the jaw's tip (measured from the skin), so special clips lead
  with the head and open the jaw at `release`. Keep the arms braced so the
  silhouette reads.

Checklist for every clip:

- an anticipation before the action (crouch, wind-up, drawn breath);
- a follow-through after it (the limb carries on past the hit, then settles);
- leaps along an arc (`root.y`), with `plantFeet: 0` in the air and a pelvis dip
  on landing, never a slide;
- holds that keep moving a little (moving holds).

Review every clip as a filmstrip from **both** sides. The player side is seen from
behind and cropped by the text box, so check that the motion reads there too:

```
/?mode=film&species=<slug>&enemy=blaziken&move=TACKLE&attacker=player&frames=10&cols=5
/?mode=film&species=blaziken&enemy=<slug>&move=TACKLE&attacker=enemy&frames=10&cols=5
/?mode=film&species=<slug>&clip=intro
```

Batch them with `node tools/shots/shoot.mjs --plan plan.json`.

For a sign-off pass, export every clip from both sides as looping GIFs, in the
battle view with the in-game UI:

```sh
node tools/shots/clip_gifs.mjs --species <slug> --out build/clips/<slug>
```

This writes one GIF per clip and side, plus a `manifest.json` with each clip's
duration and events. The GIFs are 30 fps with exact colors. `--density 3` renders
finer pixels to inspect the motion itself. `/?mode=clipreview` plays a single
clip the same way in the browser (`&mark=mouth` marks where breath effects start).

## 7. Battle check

```sh
node tools/shots/battle_film.mjs --query "enemy=<slug>&enemyMoves=TACKLE,GROWL&autoplay=1&seed=1&loop=0" \
     --every 30 --until 3000 --out build/film/<slug>
```

The run must reach `end` with no `error` in the logged states. Then do the same with
`player=<slug>`.

## 8. Ground truth (optional, needs the reference ROM)

To compare against the real game frame by frame:

```sh
python3 tools/reference/capture_refs.py --mirror <slug>
```

This captures `<slug>` vs `<slug>` from the real game (front and back sprites
together) into `reference/emerald/`. Compare with
`/?mode=stage&player=<slug>&enemy=<slug>&compare=1`. Build the ROM and the capture
tool once with `tools/reference/build_rom.sh` and `tools/reference/build_capture.sh`.

## Known gaps to watch

- One physical height serves both slots. A species whose back sprite is drawn much
  smaller or larger than its front sprite compromises between the two. The fit
  report shows which side suffers.
- `lift` is not fitted yet; set it by hand for floating species.
- Effect sheets must be vertical strips of square frames (`VfxSystem`). Wide sheets
  such as `RazorLeaf` need frame metadata before a recipe can use them.
