---
name: pokemon-animation
description: Author battle animation clips for a Pokémon in this repo at the reference (Blaziken) quality — poses, keyframes, timing, events, and choreography that fits the species' anatomy, its type and the move's name (bite, beam, water jet from cannons, leaf volley...). Use when writing or fixing any clip in src/pokemon/<slug>/clips.ts, when a clip looks stiff, floaty, sliding or "flailing", or when a move should use a body part (mouth, cannons, flower, tail) differently.
---

# Pokémon battle animation

Clips are keyframed poses in `src/pokemon/<slug>/clips.ts`. The engine turns a
handful of good key poses into fluid, living motion — so your job is the
*acting*: strong extremes, clear anticipation, the right body part leading, and
honest weight. Read `src/pokemon/blaziken/clips.ts` before writing anything: it
is the finished reference set, and its header explains the channels.

## What the engine already does (don't fight it)

- **Smooth curves.** Keys without an `ease` are joined by monotone cubic
  curves: motion flows through in-between keys and only slows where a channel
  turns around. Add a breakdown key to shape an arc, not an ease. Use `'out'`
  (`snap()` helper) for strikes and snaps — a fast start and a soft stop — and
  `'in'` (`fall()`) for drops and sinks. After a snap, the next key should be a
  near-hold of the same pose, or the curve hitches.
- **Overlapping action.** Head, arms, hands, tail and loose parts read the clip
  a few frames behind the hips (`DEFAULT_OVERLAP`, src/anim/animator.ts): head
  0.065 s, forearms 0.06 s, hands 0.08 s. An event that depends on the head
  (breath `release`, a `bite` impact) or a hand (claw `impact`) belongs
  **0.05–0.08 s after its key**. Legs have no delay: kicks land on their key.
- **Springs.** `profile.dynamics` chains (manes, tails, ears, fins, petals,
  wings) lag, overshoot and settle on their own. Don't keyframe secondary
  motion that a spring gives you; do keyframe the *pose* of the part at rest.
- **Life layer.** Breathing, weight shifts, an idle bounce, gaze drift and
  blinks run on top of every clip; the battler gets knocked back on a spring
  when hit (you animate the flinch pose, not the knock-back).
- **Always facing the foe.** A battler faces its opponent at rest, in every
  move and on the way home, and the stance faces it too (the gauntlet's
  `stance faces the foe` gate). No clip turns to look at the foe: a head or
  chest that swings round at the start of a move means the stance looks away;
  fix the stance. Twist the spine for wind-ups and follow-through, and use
  `root.yaw` only for real spins, never to pivot on planted feet.

## Pose authoring

Keys are `STANCE + deltas` via `compose()` (write a `key(t, ...deltas)` helper
as Blaziken does). Rules:

- `bones: { spine: { x, y, z } }` — degrees about **model** axes at bind pose:
  `x` pitches forward (+ tips the top of a bone forward / swings a hanging limb
  back), `y` yaws toward the creature's left, `z` rolls (+ raises a left arm).
  Deltas **add** to the stance.
- `aim: { armR: { dir: [x, y, z], twist } }` — point a limb along a model-space
  direction (+X its left, +Y up, +Z forward). Aims **replace** the stance's aim
  for that bone. Most reliable for limbs; give every key the same set of aimed
  bones (a bone aimed in only some keys snaps halfway).
- `post` — rotations after aims; `pelvis: { x, y, z }` in model heights (y
  -0.05 is a crouch); `root: { x, y, z, yaw, pitch, roll }` moves the whole
  body (jumps, spins; `root.y` in heights); `advance` 0..1 travels toward the
  foe; `plantFeet` pins feet with IK (1 = planted), `plantLeft`/`plantRight`
  per hind leg, `plantFront` for a quadruped's front feet; `fx.<channel>` drives
  effect meshes; `expression` picks an eye-atlas cell; `scale` pulses the body.
- Use small reusable deltas (`GUARD`, `CHAMBER`, `jaw(deg)`, `bend(spine,
  chest, neck, head)`, `TUCK`, `LAND`) so keys read like a shot list.
- A spin can end at `root.yaw: 360`; blends back to idle take the short way.

## Timing (at 60 fps, reference durations from Blaziken)

| clip | length | shape |
|---|---|---|
| hit | ~0.6 s | 3-frame snap into the flinch, ease back, a small overshoot, settle |
| weak contact | ~1.3 s | 0.13 wind-up · 0.25 leap · land · snap strike · 0.2 follow-through · hop home |
| strong contact | ~2.1 s | 0.3 coil · spring up · strike at the top · follow-through · land deep · hop home |
| weak ranged | ~1.2 s | 0.24 breath in · 0.1 snap · release · recoil · settle |
| strong ranged | ~2.3 s | 0.5 gather (charge) · hold · snap · 0.8 sustained (release → releaseEnd) · recover |
| status | ~1.4–1.7 s | gather or rear up · the action with a moving hold · relax |
| intro | ~1.6 s | curled crouch · burst up · cry with a moving hold · settle to stance |
| faint | ~1.8 s | reel · sway forward · knees buckle · slump with a small bounce · sink (`root.y` -1.1) |

Strikes happen in 3–6 frames; holds last 8–20 frames and never freeze (move
something 1–3°). Everything starts at `key(0)` (the stance) and ends on a key at
`duration` that returns to the stance.

## The principles as rules for these clips

1. **Anticipation**: every action starts with a counter-move — crouch before a
   leap, wind back before a swing, inhale (chest up, head back) before a breath.
2. **Follow-through**: the striking limb carries past the target and hangs a
   moment; the body settles after landing; the head recoils after a blast.
3. **Arcs, not slides**: travel is a leap (`root.y` arc, `plantFeet: 0` and
   tucked legs in the air, `LAND` = pelvis dip with `plantFeet: 1`). Never move
   `advance` with the feet planted.
4. **Weight**: heavy species (Blastoise, Swampert, Venusaur) move slower, lower,
   with bigger landings and screen shake on stomps; light ones (Sceptile) are
   quick and springy. Timing sells mass.
5. **Staging**: the silhouette must read at 64 px from the back view (our side)
   and the front view. Keep limbs that don't act *braced* and out of the way —
   flailing arms read as noise. The part that acts (mouth, cannons, flower,
   claws) leads the pose.
   **Stay clear of the healthboxes**: they are drawn over the Pokémon, so a
   body under one looks cut off. From our side the foe's box sits a few
   pixels above our Pokémon's head and ours to its right; the foe's feet touch
   the top of ours. So at home: raise arms wide rather than overhead, keep
   jumps low (or lean into them instead), keep side-steps narrow, fold a faint
   back over the heels rather than forward over the feet. Clips that travel
   (`advance`) are free to pass. `tools/gauntlet/uiclear.mjs` checks every
   clip that stays at home, from both sides.
6. **Exaggeration**: GBA pixels eat subtlety. Push extremes ~1.5× further than
   feels natural in the turntable; check at `--density 1`.
7. **Moving holds and secondary action** are mostly automatic (life layer,
   springs); add a tremor or a head sway to sustained holds.

## Choreography: species × type × move

Read the move's **motif** (`node tools/gauntlet/brief.mjs --slug <slug>` lists
every move with its motif; definitions in `src/battle3d/motifs.ts`). A motif
says what the body does; the species decides *how*:

- **Where the power comes from** (`profile.emitters` + `emitterFor`): breath
  and spit leave the jaw tip by default; point water jets at Blastoise's
  cannons, Solar Beam and powders at Venusaur's flower, leaf volleys at
  Sceptile's arm leaves or Meganium's petals. Then the clip must *aim that part*
  at the foe: Blastoise braces and levels its shell, Venusaur lowers its body
  and tilts the flower forward, a breather drives its head forward.
- **Type flavor**: fire moves flare fire meshes (`fx.flames`) and use sharp,
  aggressive timing; water moves brace against recoil; grass moves gather
  (sunlight charge) and release gracefully; ground moves stomp.
- **The move's name**: Bite and Crunch lunge with the jaws; Slash and Leaf
  Blade swing the claw or blade; Body Slam leaps and crushes; Rapid Spin
  withdraws and spins; Earthquake rears up and stomps; Withdraw pulls into the
  shell; Synthesis turns up to the light. `reference/motif-cookbook.md` has a
  recipe for every motif with body-plan variants.

Clip lookup per move (src/battle3d/director.ts `clipFor`): `moveClips[MOVE]` →
`<motif>_strong` (strong moves) → `<motif>` → the category clip. Name motif
clips after the motif (`bite`, `jet`, `jet_strong`, `beam`, `quake`...) or map
existing clips in `profile.motifClips`.

## Events

| event | when | effect |
|---|---|---|
| `impact` | the hit connects (one per hit) | contact VFX by motif, target reaction, HP drain |
| `grab` | a toss's hands close on the foe | the foe rides in the grip (between the hands, turned with the chest) |
| `throw` | a toss hurls the foe | the foe flies back into its place, landing at the next `impact` |
| `dig` | a burrow goes under | dirt (or a splash) at the feet; mounds heave along the way underground |
| `release` | the projectile/stream/beam leaves | ranged VFX from the motif's emitter |
| `releaseEnd` | a sustained stream/jet/beam stops | ends the spray (else it runs to the clip end) |
| `charge` | power starts gathering | charge sprites that follow the emitter |
| `emit` | a status move reaches out | sand, spores, sound, glare |
| `aura` | a self-buff peaks | aura / shield / heal sparkle |
| `cry` | intro roar | small shake |
| `thud` | faint hits the ground | — |

Place events on the pose that causes them *plus the overlap delay* of the part
that acts. Contact moves must have `advance: 1` at `impact`.

## Workflow for one clip

1. Write the keys (extremes first: anticipation, action, follow-through,
   recovery), then events.
2. `node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE> --attacker enemy --density 3 --every 4 --frames 24 --out build/sheets/<slug>-<clip>.png`
   (and `--attacker player`). Look at every frame. `--clips intro,hit` for moments.
3. Fix what reads wrong (see below), repeat. Then check at `--density 1`.
4. Measure it next to the reference:
   `node tools/gauntlet/cliplint.mjs --species <slug>` (static: slides, pivots
   on planted feet, aims missing from some keys, torso swings over 500°/s,
   limb hitches after an eased key) and
   `node tools/gauntlet/motion.mjs --species <slug>,blaziken --clips <clip>`
   (on the animated joints: stop-starts, one-frame pops, dead holds, turning
   in the first 0.3 s). Aim for Blaziken's numbers: pops only on strikes and
   landings, no dead holds, no early turn in clips made from home.
5. Check it stays clear of the healthboxes from both sides:
   `node tools/gauntlet/uiclear.mjs --species <slug> --clips <clip> --shots build/sheets/uiclear`
   (clips that stay at home; `--shots` saves the worst frame).
6. Record the verdict in `src/pokemon/<slug>/REVIEW.md`.

## Failure modes and fixes

| looks like | fix |
|---|---|
| stiff / robotic | extremes not pushed; every key eased; add anticipation and a breakdown key |
| floaty | holds too long, landings too soft: shorten travel, add a pelvis dip and shake |
| sliding | `advance` changes with `plantFeet: 1`: leap instead (`TUCK`, `root.y` arc) |
| flailing arms | arms not acting: brace them (`CHAMBER`/`BRACED`), let the acting part lead |
| effect from the wrong place | emitter / `emitterFor`; verify with `/?mode=clipreview&mark=<emitter>` |
| pop at a key | an aimed bone missing from some keys; an ease after a snap; a big pose change in < 3 frames |
| turns to the foe before the move | the stance looks away from the foe: fix the stance (it must face the foe) rather than turning in the clip; `root.yaw` on planted feet is a pivot, twist the spine instead |
| stutters mid-motion | a key that stops a channel halfway (a `fall()` that starts mid-descent instead of at the apex; a hop whose apex sits near the landing): fall from the top; put a hop's apex halfway across |
| strike snaps harder than Blaziken's | under 5 frames, or a torso swing over ~50°: land, then a 0.08 s snap; cock the arm further back as it lands so the strike starts from a turnaround |
| unreadable from our side | the back view hides it: exaggerate the silhouette, move the action above y≈92 px |
| cut off by a healthbox (uiclear fails) | from our side: arms raised wide not overhead, a lower jump, a narrower side-step toward our box; the foe's faint folds back over its heels (slumped forward, its head falls onto our box) |
| limbs through the body | aim directions crossing the torso: check the turntable in the rig lab |
