---
name: pokemon-animation
description: Author battle animation clips for a Pokémon in this repo at the level of the first clips of Blaziken, Sceptile and Swampert — contact moves that leap to the foe and land on it, a clip for every action the species' moves take (a Double Kick kicks twice, a Mega Punch is a haymaker), with anticipation, snaps, follow-through and weight, fitting the species' anatomy and type. Use when writing or fixing any clip in src/pokemon/<slug>/clips.ts, when a clip looks stiff, floaty, sliding, "flailing" or strikes the air, or when a move should use a body part (mouth, cannons, flower, tail) differently.
---

# Pokémon battle animation

Clips are keyframed poses in `src/pokemon/<slug>/clips.ts`. The engine turns a
handful of good key poses into fluid, living motion — so your job is the
*acting*: strong extremes, clear anticipation, the right body part leading, and
honest weight. Read `src/pokemon/blaziken/clips.ts` before writing anything: it
is the finished reference set, and its header explains the channels.

## Engage the foe: contact moves go to it and strike it

The standard is Blaziken's: **a Pokémon that uses a contact move leaps (or
dashes, pounces, flutters, rolls) to the foe, strikes it there, and goes back
home.** A punch lands on the foe, a kick connects, a bite closes on it, a
tackle slams into it. Never strike the air from home: that is the failure the
user called "animated fundamentally wrong".

How it works in the compiled game (src/remake/acting.ts, layer.ts): when a
move's animation starts, the attacker's body leaves its sprite and plays the
move's clip; `advance` carries it toward the foe (0 at home, 1 in front of
the foe, where the engine puts it by both bodies' sizes), and the game holds
its own animation until the clip's first effect event, so the game's hit
sparks, sounds and the foe's shake start on your `impact`. The foe flinches
and is knocked back on it. Then the body comes home and follows its sprite
again. The rules, all gated (`tools/gauntlet/fundamentals.mjs`, and
`check.mjs --render` for the reach):

- a contact move's clip starts at home (`advance` 0), is at the foe
  (`advance` >= 0.95) on every `impact`, and ends at home (`advance` 0, the
  stance);
- **it reaches the foe's body**: at every impact the attacker's body touches
  the foe's (the gap between their surfaces at most 0.1 of the foe's height,
  measured against itself as the foe, both sides). `advance` 1 stops the
  attacker's front (the furthest point of its body toward the foe in its
  stance) 0.15 of its height short of the foe's front (`STRIKE_GAP`,
  src/battle3d/battler.ts), whatever their shapes: the blow itself closes
  it, the limb at full extension into the foe, the hips and spine driving
  in, a bite's head lunging, a tackle lunging its whole body in (`root.z`
  forward) and bouncing off. Standing at the foe is not a blow;
- the travel is a leap or steps, never a slide: whenever `advance` changes
  between two keys, the feet are off the ground in one of them (`plantFeet:
  0` with the legs tucked and a `root.y` arc, or one foot lifted mid-step);
  landings bend the knees (`LAND`);
- a ranged move fires from home (`advance` 0.35 at most: a step in);
- a multi-hit move plays once per hit (the next section) and a toss grabs
  the foe at `advance` 1.

## A clip for every action, at the first clips' level

The standard is the first clips of Blaziken, Sceptile and Swampert
(`src/pokemon/<slug>/first.ts`, and `more.ts` for the clips added since in
their style): what the user saw first and loved, and asked every species to
match ("they need to be at the level they were at for the original three").

A species has a clip for every **action** its moves take, and every move
plays the clip of its action: the moments (`idle`, `intro`, `hit`, `faint`),
the category clips (`physical_weak`, `physical_strong`, `special_weak`,
`special_strong`, `status_self`, `status_target`) and a clip per motif its
movepool needs (`kick`, `punch`, `bite`, `slam`, `quake`, `shield`...), or a
category clip mapped to a motif in `motifClips` when it truly is that action.
**The clip is the action**: a Double Kick kicks twice (two impacts), a Mega
Kick is one huge kick, a Stomp comes down on the foe, a Mega Punch is a
haymaker, a Headbutt leads with the skull, a Body Slam is a leap and crush.
`reference/move-actions.md` says what each move's action is;
`node tools/gauntlet/brief.mjs --slug <slug>` lists the movepool with motifs.
One excellent clip per action beats a rushed clip per move.

Battles play a clip in the pieces they need (src/battle3d/variants.ts: cut on
the clip's own keys, so every pose stays yours):

| move | how its clip plays |
|---|---|
| multi-hit (Double Kick, Fury Swipes, Bullet Seed) | a hit each: the first leaps in and stays at the foe, the next strike again from there, the last goes home. A clip with two impacts (Double Kick) gives each hit its own blow; a clip with one replays its strike |
| two-turn (Dig, Dive, Solar Beam) | a turn each: a clip with a `dig` is cut where it is deepest underground (it waits there, out of sight), one with a `charge` and a `release` on its gathered pose before the snap |

A species may still author its own `_first`/`_next`/`_last` or `_charge`
where the cut pieces aren't right; authored ones win.

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
- **Foes of other sizes.** Author every blow against a foe of the species'
  own size (the gates measure that match): `advance` 1 puts the attacker's
  front the same gap short of the foe's front whatever the foe's size, and around
  each impact the engine brings the blow to the same height on a smaller
  foe's body (the striking hand or foot reaches lower with IK, the body
  sinks and bows into it) or springs the body up at a bigger one
  (`reachFoe` in src/battle3d/battler.ts).
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
  body (jumps, lunges, spins, rearing; `root.y` in heights: a leap's arc,
  below 0 underground); `advance` 0..1 travels toward the foe (see "Engage
  the foe"); `plantFeet` pins feet with IK (1 = planted),
  `plantLeft`/`plantRight` per hind leg, `plantFront` for a quadruped's front
  feet; `fx.<channel>` drives effect meshes; `expression` picks an eye-atlas
  cell; `scale` pulses the body.
- Use small reusable deltas (`GUARD`, `CHAMBER`, `jaw(deg)`, `bend(spine,
  chest, neck, head)`, `TUCK`, `LAND`) so keys read like a shot list.
- A spin can end at `root.yaw: 360`; blends back to idle take the short way.

## Timing (at 60 fps, reference durations from Blaziken)

| clip | length | shape |
|---|---|---|
| hit | ~0.6 s | 3-frame snap into the flinch, ease back, a small overshoot, settle |
| weak contact | ~1.3 s | 0.13 wind-up · 0.25 leap in (legs tucked, `root.y` arc) · land at the foe · snap strike into its body · 0.2 follow-through · hop home |
| strong contact | ~2.1 s | 0.3 coil (crouch, wind back) · spring up and in · strike at the top or on landing, driving into the foe · follow-through · land deep · hop home |
| multi-hit | ~0.9 s a hit | `_first`: wind-up · leap in · strike · settle into a guard at the foe; `_next`: 0.08-0.15 re-cock · strike · guard; `_last`: re-cock · strike · follow-through · hop home |
| weak ranged | ~1.2 s | 0.24 breath in · 0.1 snap · release · recoil · settle |
| strong ranged | ~2.3 s | 0.5 gather (charge) · hold · snap · 0.8 sustained (release → releaseEnd) · recover |
| status | ~1.4–1.7 s | gather or rear up · the action with a moving hold · relax |
| intro | ~1.6 s | curled crouch · burst up · cry with a moving hold · settle to stance |
| faint | ~1.6 s | a tired sway (eyes half shut) · curl over onto the heels, hugging itself, head tucked, eyes shut · `shrink` · a moving hold while it shrinks away (0.53 s) |

Strikes happen in 3–6 frames; holds last 8–20 frames and never freeze (move
something 1–3°). Everything starts at `key(0)` (the stance) and ends on a key at
`duration` that returns to the stance, except the faint, which ends curled,
the hits that stay at the foe (`_first`, `_next`) and a two-turn move's
`_charge` (underground, in the sky).

**The faint is not a death.** As in the 3D games, the Pokémon is worn out:
it curls over (a crouch on its heels, arms folded in, head bowed, eyes
shut), and from its `shrink` event the battler shrinks the curled body away
into its middle, as the GBA shrinks a Pokémon into its ball
(`sAffineAnim_Battler_Return`, `SHRINK_FRAMES` in src/anim/clip.ts), with
SE_FAINT. Never sink it into the ground, topple it over or slump it lifeless:
`tools/gauntlet/check.mjs` fails a faint that sinks (`root.y` below -0.1),
tips past 40° or ends before its shrink does. Heavy species hunch rather than
fold (Swampert: bowed deeper, its head fins splayed and it looked face down).

## The principles as rules for these clips

1. **Anticipation**: every action starts with a counter-move — crouch before a
   lunge, wind back before a swing, inhale (chest up, head back) before a breath.
2. **Follow-through**: the striking limb carries past the target and hangs a
   moment; the body settles after the strike; the head recoils after a blast.
3. **Engage, along arcs, never sliding**: contact moves go to the foe and
   land on its body; travel is a leap along an arc (`root.y`, `plantFeet: 0`
   and tucked legs in the air, `LAND` on arrival) or real steps, and a
   strike drives the hips, spine and limb through the foe. Never move
   `advance` with the feet planted; never strike the air from home.
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
   the top of ours. So: raise arms wide rather than overhead, lean into a
   strike rather than rising, curl a faint back over the heels rather than
   forward over the feet. `tools/gauntlet/uiclear.mjs` checks every clip from
   both sides.
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
- **The move's name**: Bite and Crunch snap the jaws forward; Slash and Leaf
  Blade swing the claw or blade; Body Slam throws the body's weight forward
  and down; Rapid Spin withdraws and spins; Earthquake rears up and stomps;
  Withdraw pulls into the shell; Synthesis turns up to the light.
  `reference/motif-cookbook.md` has a recipe for every motif with body-plan
  variants, `reference/move-actions.md` each move's own action.

Clip lookup per move (src/battle3d/director.ts `clipFor`): `moveClips[MOVE]` →
the move's own clip (named after it) or one of the same action's →
`<motif>@<part>` → `<motif>_strong` (strong moves) → `<motif>` → the category
clip. The motif clips are for moves outside the movepool that Mimic or Mirror
Move call: map every motif to the species' closest clip in
`profile.motifClips` (the gauntlet checks every motif resolves).

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
| `shrink` | a faint is curled up | the body shrinks away into its middle (SE_FAINT); the clip holds the curl for `SHRINK_FRAMES` after it |

Place events on the pose that causes them *plus the overlap delay* of the part
that acts. A contact move's `impact` is on its strike at full reach, at the
foe, the body touching it.

## Workflow for one clip

1. Write the keys (extremes first: anticipation, action, follow-through,
   recovery), then events.
2. `node tools/shots/move_sheet.mjs --species <slug> --moves <MOVE> --attacker enemy --density 3 --every 4 --frames 24 --out build/sheets/<slug>-<clip>.png`
   (and `--attacker player`). Look at every frame. `--clips intro,hit` for moments.
3. Fix what reads wrong (see below), repeat. Then check at `--density 1`.
4. Hold it to the fundamentals: `node tools/gauntlet/fundamentals.mjs
   --species <slug> --clip <clip>` (travel to the foe and back, the wind-up,
   a snap strike, follow-through, moving holds, settling on the stance, no
   copies), and check its blows land: `node tools/gauntlet/check.mjs --slug
   <slug> --render` (`<move> lands on the foe`: the gap at each impact).
   Then measure it next to the reference:
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
| floaty | holds too long, settles too soft: shorten the holds, add a pelvis dip |
| strikes the air from home (`travel`: impact with advance 0) | a contact move goes to the foe: wind up, leap in (`advance` to 1 along a `root.y` arc, legs tucked), land, strike, hop home |
| a blow that doesn't land (`lands on the foe` gap over 0.1) | at `advance` 1 the fronts are 0.15 of its height apart: extend the limb fully into the foe, drive the hips and spine in, lunge the body (`root.z` 0.1-0.3) for a tackle or a bite |
| slides to the foe (`travel`: advance changes with both feet planted) | leap (`plantFeet: 0`, `TUCK`, `root.y` arc) or step (one foot lifted at a time) |
| the same animation as another move (`distinct`) | each move is its own action: see reference/move-actions.md |
| flailing arms | arms not acting: brace them (`CHAMBER`/`BRACED`), let the acting part lead |
| effect from the wrong place | emitter / `emitterFor`; verify with `/?mode=clipreview&mark=<emitter>` |
| pop at a key | an aimed bone missing from some keys; an ease after a snap; a big pose change in < 3 frames |
| turns to the foe before the move | the stance looks away from the foe: fix the stance (it must face the foe) rather than turning in the clip; `root.yaw` on planted feet is a pivot, twist the spine instead |
| stutters mid-motion | a key that stops a channel halfway (a `fall()` that starts mid-descent instead of at the apex; a hop whose apex sits near the landing): fall from the top; put a hop's apex halfway across |
| strike snaps harder than Blaziken's | under 5 frames, or a torso swing over ~50°: a 0.08 s snap from a turnaround; cock the arm further back in the coil |
| unreadable from our side | the back view hides it: exaggerate the silhouette, move the action above y≈92 px |
| cut off by a healthbox (uiclear fails) | from our side: arms raised wide not overhead, lean rather than rise, a narrower twist toward our box; the foe's faint curls back over its heels (bowed forward over its feet, its head comes down onto our box) |
| limbs through the body | aim directions crossing the torso: check the turntable in the rig lab |
