# Sceptile review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 2` while iterating, then `--density 3` for the review below, with
the key frames of each strike at full size; the showcase moves once more at
`--density 1` with the in-game UI, so the text box crops our side as in the
game). Reviewed against the checklist: anticipation, follow-through, arcs
with no sliding, effects from the right emitter, a readable silhouette from
our side (back view, cropped by the text box) and the opponent's side, starts
and ends on the stance. GIFs are exported by the orchestrator.

## Battle moments

- [x] `idle`: breathing, weight shift and the fighter's bounce read in the crouch; the tail sways and the fern leaflets and forearm blades ride on springs; blinks; the loop point is the stance, nothing pops
- [x] `intro`: crouched behind its crossed blades with the eyes shut, springs up with the arms flung wide, claws open, jaw wide for the cry and the tail raised, settles into the stance (reads from both sides; the cry lands on the burst)
- [x] `hit`: snaps back with the hurt eyes and the arms thrown out, the sprung knock-back carries it, recovers without popping
  - healthbox pass: its weight stays back on its heels while it recovers (the knock-back spring's swing back carried a wild Sceptile's toes a pixel past the top of our healthbox: 5 px under it)
- [x] `faint`: reels back, sways forward, its knees buckle and splay out and it sits back on its heels in a low gecko sprawl, flops back onto its tail with the head bowed onto its chest and a small bounce, then sinks
  - healthbox pass: it used to slump forward over its feet, and on its long neck the head and chest came down onto our healthbox as it sank (184 px from the foe's side). It now folds back over its heels, the knees splay out (the foot IK folded the left knee down to the ground in front of the foot) and the limp arms hang at its sides, a little back (hanging forward, the claws touched the ground in front)

## Attack categories

- [x] `physical_weak`: Leaf Blade (also Pound, Fury Cutter, False Swipe, Aerial Ace, Cut, Rock Smash) — crouch with the right blade raised high behind the head like a sword, leap in along an arc, land, the torso unwinds and the forearm cuts down and across (the Cut effect on the foe), the blade carries through past the left hip and hangs, guard, hop home
  - after review: pushed the wind-up higher and the sweep wider (it read as a small chop from the opponent's side)
- [x] `physical_strong`: Slam (also Body Slam, Iron Tail; Mega Kick by fallback) — coils with the tail lifting, springs in and turns its back to the foe, hangs at the top of the arc with the tail reared up, whips it down onto the foe, lands deep, spins back round on the hop home
  - after review: the first version turned so fast that the springs dragged the tail and it only pointed at the foe; the turn now finishes before the tail rears up and slams, and the tail spring is a little stiffer
- [x] `special_weak`: Bullet Seed (Snore by fallback) — a quick breath with the head back, three pecks of the head with the jaw wide, a seed leaving the mouth on each, arms braced at the sides
  - after review: the pecks and the recoil between them are bigger (they were lost at game size)
  - healthbox pass: the pecks lean in with the spine instead of shifting the hips forward (the foot IK keeps the posed feet's x/z, so the hips carried the planted feet toward our healthbox, 8 px under it from the foe's side)
- [x] `special_strong`: Solar Beam (also Hyper Beam; Hidden Power by fallback) — turns its face up to the sun with the arms spread and eyes shut while the sunlight gathers at the mouth, then braces low and drives the head at the foe; the beam leaves the mouth and follows the head through a trembling hold against the recoil; jaw shuts, head comes up
  - healthbox pass: the blast leans in with the spine, not the hips (the feet slid toward our healthbox, 7 px under it from the foe's side), so the beam's recoil now pushes the whole body back a little
- [x] `status_self`: Swords Dance (also Sleep Talk; Agility and Double Team moved to `afterimage`) — three quick hops side to side, leaning into each (airborne between landings), lands centred and snaps its arms up with the aura, relaxes
  - after review: wider hops with more lean
  - healthbox pass: lower, narrower hops (0.14 to 0.15 heights across, 0.06 up) that zig-zag back a little, the feet drawn up level by the foot IK (`DART`) instead of freed legs. From our side the hop took the crest under the foe's healthbox (11 px); from the foe's side the freed feet swung forward and down onto ours (57 px)
- [x] `status_target`: Screech (also Roar; Toxic by fallback, spat from the mouth) — rears up with the claws raised by its head, lunges the head forward, jaw wide and claws out, the head shaking while the sound waves leave the mouth
  - after review: added the raised claws (nails-on-slate) and pushed the rear and lunge
  - healthbox pass: the lunge leans in with the spine instead of the hips (8 px under our healthbox from the foe's side)

## Motif clips

- [x] `physical_weak_tackle` (tackle): Quick Attack, Pursuit, Facade, Secret Power, Double-Edge, Return, Frustration, Strength — a blur-fast low dash with the shoulder leading (legs tucked, body pitched in), impact, bounce off the foe, land, hop home
- [x] `physical_strong_punch` (punch): Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter — right fist chambered at the hip with the left forearm guarding, leap in, hips and shoulders turn into a straight punch (the punch effect on the foe), holds, hop home
- [x] `physical_strong_strike` (strike_strong): Dragon Claw, Brick Break — both blades raised high, a big leap, both forearms cut down across each other on the way down, lands deep and hangs, hop home
- [x] `physical_strong_quake` (quake): Earthquake — crouches, springs into a tucked hop with the arms flung out wide (the feet drawn up high under a low body), then stomps down into a deep sumo squat, knees pushed out, the arms swung out low and the tail flicking up, then rises with the arms flowing back to its guard; the ground shakes and dirt bursts at the foe; it stays home
  - healthbox pass: the leap straight up took our Sceptile's head and claws under the foe's healthbox (897 px, the worst of the set). From the foe's side the stomp sank the root, and so the feet, into the ground, and in the deep crouch the braced claws and the folded left knee reached under ours (28 px): the knees now fold out to the sides (`SQUAT`, the feet kept where they stand), the arms swing out low and the tail lifts
- [x] `special_weak_throw` (throw): Swift, Rock Tomb — forearms crossed low, then whipped out and forward; the volley flies off both forearm blades (the `blades` emitter)
- [x] `special_weak_drain` (drain): Absorb, Giga Drain — reaches both claws wide at the foe, closes them, then draws them to its chest with the head back and the eyes shut as the energy flows in to its body
  - after review: the reach opens sideways (straight at the foe it was foreshortened from both views)
  - healthbox pass: the reach leans in with the spine instead of the hips (6 px under our healthbox from the foe's side)
- [x] `status_self_shield` (shield): Detect, Protect, Endure, Substitute, Safeguard — draws in, snaps the forearms into an X before the face with the focused eyes, holds with a tremor under the barrier, opens back to the guard
- [x] `status_self_heal` (heal, weather): Sunny Day, Rest — basks: turns its face up to the light, arms open, eyes shut, swaying calmly (sunlight rises for Sunny Day, sparkles for Rest), happy eyes as it comes down
- [x] `status_target_glare` (glare, charm): Leer, Mimic, Swagger, Attract — leans in with the head low and forward and stares the foe down with narrowed eyes (the glint at its eyes; hearts for Attract), a cocky head tilt, eases back
  - healthbox pass: the lean-in comes from the spine instead of the hips (13 px under our healthbox from the foe's side)
- [x] `toss` (toss): Seismic Toss — a springy dash in with the claws flung open, lands at the foe and clamps on low (grab), presses its tail down and springs up and back toward mid-field with the foe hugged low in front (never overhead), spinning round with it while the tail streams out, then whips its whole body forward and down to hurl it back into its own place (throw); the foe crashes there on its side (impact: rocks and dust) while Sceptile lands at advance 0.4 and watches from the crouch, the tail swishing, then hops home. Both views see the crash. At the height of the spin the top edge cuts off much of the foe (most in the opponent's view, around 0.8 s) but it never leaves the screen, where the reference loses it for 0.25 s
  - after review: the foe is carried low (it was held up in front and went off the top) and Sceptile lands straight down where it throws
- [x] `burrow` (burrow): Dig — crouches, springs and dives head first into the ground with the arms overhead and the blades together (dig: dirt bursts, the tail goes in last), a trail of heaving dirt runs to the foe, it bursts up in front of it with a rising cut of the right blade, knee up and the tail trailing out of the ground (impact as it breaks the surface), drops straight down, holds the crouch and hops home
  - after review: the burst was lowered (it left the top of the screen), the tail hangs down as it comes out of the ground (it fanned across the body from our side) and the blade angles out so it clears the head in both views
- [x] `fling` (fling): Mud-Slap — stoops and rakes the ground beside its right foot with the right claws, drags a handful of mud back past the hip, swings it through low and slings it underhand; the clods leave the right hand (the `hands` emitter) and the claws open high and out to the side in the follow-through while the left forearm keeps its guard
  - healthbox pass: the rake reached the ground out in front of the feet, under our healthbox from the foe's side (32 px), and the sling slid the feet forward: it now rakes beside the right foot from a shallower stoop and leans into the sling with the spine
- [x] `afterimage` (afterimage): Double Team, Agility — five low, springy darts side to side in its fighting stance (right claw raised, left forearm guarding), leaning into each with the tail swinging out as a counterweight, and back to the centre; Double Team's two darkened copies swing out from the aura, Agility's trail follows the darts
  - healthbox pass: from our side a 0.3-height dart to its right took the raised claw under our healthbox (194 px); from the foe's side the freed hop legs swung its feet forward onto ours (65 px). The darts are now 0.15 to 0.17 heights (Blaziken's are 0.18) and zig-zag back a little (the slot's side axis tilts toward the camera: a dart to a wild Sceptile's left drops its feet a pixel), and the feet are drawn up level by the foot IK (`DART`)
- [x] `flash` (flash): Flash — curls in over its crossed forearms with the eyes shut, gathering the light, then flares up tall with the chest open and the arms and blades flung wide at the foe, the tail fanned high (emit: the screen turns white and both Pokémon black, so the flare reads as a silhouette: a wide V from the front, both claws clear of the head from behind), holds and relaxes
  - after review: the flare opened wider (from our side the left arm hid behind the head)
- Also mapped: strike → `physical_weak`, slam and tail → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff → `status_self`, roar → `status_target`. Kick, orb, sound and powder (one TM/tutor move each) play their category clips.

## Fluidity pass (after comparing with Blaziken)

Measured with `tools/gauntlet/motion.mjs` against Blaziken and re-reviewed on
contact sheets from both sides:

- The battler no longer turns toward the foe before its moves: every battler
  now always faces its opponent, and the stance faces it too (the sideways
  look copied from the stock sprite is gone, and so is the FACE turn every
  move made to undo it; `stance faces the foe` gate: head at -0.8 deg).
- `physical_weak`: a longer wind-up (0.16 s), smaller torso twists (±26–32°,
  were ±44–50°), the head easing back to its sideways look on the hop home.
- `physical_weak_tackle`, `physical_strong_punch`: longer anticipation; the
  punch strikes over 5 frames (was under 4) with a smaller hip turn.
- `special_weak`: the pecks grow in (each a little further) instead of three
  identical snaps; `status_target`: the lunge slowed to Blaziken's speed.
- `status_self` (Agility): each hop peaks halfway across, so the body flows
  through the air and only stops where it lands (7 one-frame pops → 0).
- `physical_strong_quake`: falls from the top of the leap (the fall used to
  start mid-descent from a standstill); the knees keep sinking after
  touchdown, then it rises without a hitch.
- `status_self_shield`, `status_target_glare`: the holds move (a slow sink and
  sway) instead of trembling in place.
- `toss`, `burrow`, `fling`, `afterimage`, `flash`: 0 stop-starts and 0 pops
  each (Blaziken's toss 1, burrow 1, fling 0, afterimage 2). A landing after
  travel comes straight down, so landing and hopping home never read as one
  motion stopping and restarting; landings are held a little longer and home
  landings are light (small settles); the tail keeps moving through slow
  moments (a press down before the toss's leap, an overshoot as the spin
  stops, a swish while it watches); Dig rights itself while tunnelling and
  starts up before the burst; the fling swings through a breakdown key into
  its snap; the darts keep the stance's arms, so nothing settles after them.

## Healthbox pass (the healthboxes are drawn over the Pokémon)

`tools/gauntlet/uiclear.mjs` plays every clip that stays at home from both
sides and counts the body's pixels more than 2 px under a healthbox's edge.
Before this pass (worst frame, px): from our side `afterimage` 194 under our
box, `physical_strong_quake` 897 and `status_self` 11 under the foe's; from
the foe's side, under our box, `faint` 184, `afterimage` 65, `status_self`
57, `fling` 32, `physical_strong_quake` 28, `status_target_glare` 13,
`special_weak` 8, `status_target` 8, `special_strong` 7, `special_weak_drain`
6, `hit` 5. After it every clip is at most 2 px from both sides (each clip's
note above says what changed and why).

What made the foe's side tight: at rest a wild Sceptile's toe claws sit on
the top edge of our healthbox, less than a pixel from the counted rows (the
stance itself is clear). The foot IK pins only the height of a planted foot
and keeps its posed x/z, so a `pelvis` z lean or a root dip slid the feet
toward the camera, which is down onto the box; and Sceptile's stance reaches
the ground only through the IK, so hops with freed legs dropped the feet and
swung them forward. The fixes lean with the spine instead, lift hop feet with
the IK (`DART`), fold deep crouches' knees outward (`SQUAT`) and keep claws
and knees from reaching the ground in front of the feet.

Fluidity of the changed clips (`tools/gauntlet/motion.mjs`, stop-starts / one-frame pops,
before → after; Blaziken in brackets): `physical_strong_quake` 2 / 0 → 0 / 0; `status_self`
1 / 0 → 0 / 0 [0 / 0]; `special_weak` 3 / 2 → 1 / 2, the pops on the first peck's snap
[0 / 1]; `faint` 14 / 0 → 13 / 0 [15 / 0]; `afterimage`, `hit`, `fling`, `special_strong`,
`special_weak_drain`, `status_target` and `status_target_glare` 0 / 0 before and after.
No dead holds and no turn in the first 0.3 s anywhere.

## Showcase moves in battle

- [x] a full battle with sceptile as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (filmed with tools/shots/battle_film.mjs: Leaf Blade, Solar Beam, Slam
      and Agility as ours; the wild intro, Agility and the faint as the
      opponent)
  - re-checked after the toss, burrow, fling, afterimage and flash clips
    (Agility now plays `afterimage`): `check.mjs --render` runs both battles
    to the end and plays every clip from both sides without errors
  - re-checked after the healthbox pass: `check.mjs --render` runs both
    battles to the end, plays every clip from both sides, and every clip at
    home stays clear of the healthboxes from both sides (at most 2 px past
    the edge)
