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
- [x] `faint`: a tired sway, then it sinks into its wide squat, knees out, and curls over hugging itself, the long neck bowed and the tail curling round, eyes shut, and shrinks away (worn out, as the 3D games show it; it sits back over its heels, clear of our healthbox)
  - healthbox pass: it used to slump forward over its feet, and on its long neck the head and chest came down onto our healthbox as it sank (184 px from the foe's side). It now folds back over its heels, the knees splay out (the foot IK folded the left knee down to the ground in front of the foot) and the limp arms hang at its sides, a little back (hanging forward, the claws touched the ground in front)

## Attack categories

- [x] `physical_weak`: Leaf Blade (also Pound, Fury Cutter, False Swipe, Aerial Ace, Cut, Rock Smash) — from where it stands: the weight sinks back with the right blade cocked high behind the head like a sword, then the hips drive at the foe and the torso unwinds into a cut down and across led by the forearm (impact at full reach: the Cut effect on the foe), the blade carries through past the left hip and hangs, and it is back in guard
  - after review: pushed the wind-up higher and the sweep wider (it read as a small chop from the opponent's side)
  - in place: the leap in and the hop home are gone (the game lunges the sprite)
- [x] `physical_strong`: Slam (also Body Slam, Iron Tail; Mega Kick by fallback) — from where it stands: a crouch wound the other way, guard up, the tail lifting, then the hips turn to its right over the planted feet and the heavy tail rears up high round its left side; the body bows at the foe and the tail comes down in an arc across in front of it, stopping hip high (impact); the hips turn back and the tail swings round behind
  - after review: the first version turned so fast that the springs dragged the tail and it only pointed at the foe; the turn now finishes before the tail rears up and slams, and the tail spring is a little stiffer
  - in place: no spring in, no turn in the air, no hop home. The turn is the hips' (turned by the leg solve: Sceptile's origin is behind its feet, so a `root.yaw` turn swung the body round the spot), and the tail lashes round its left side at shoulder height (round its right side, or down to the ground, it went under our healthbox from one side or the other); the coil keeps its guard up (claws braced low in front, a wild Sceptile's went under our healthbox)
- [x] `special_weak`: Bullet Seed (Snore by fallback) — a quick breath with the head back, three pecks of the head with the jaw wide, a seed leaving the mouth on each, arms braced at the sides
  - after review: the pecks and the recoil between them are bigger (they were lost at game size)
  - healthbox pass: the pecks lean in with the spine instead of shifting the hips forward (the foot IK keeps the posed feet's x/z, so the hips carried the planted feet toward our healthbox, 8 px under it from the foe's side)
- [x] `special_strong`: Solar Beam (also Hyper Beam; Hidden Power by fallback) — turns its face up to the sun with the arms spread and eyes shut while the sunlight gathers at the mouth, then braces low and drives the head at the foe; the beam leaves the mouth and follows the head through a trembling hold against the recoil; jaw shuts, head comes up
  - healthbox pass: the blast leans in with the spine, not the hips (the feet slid toward our healthbox, 7 px under it from the foe's side), so the beam's recoil now pushes the whole body back a little
- [x] `status_self`: Swords Dance (also Sleep Talk; Agility and Double Team moved to `afterimage`) — a quick flourish where it stands: the torso turns one way with the blades crossed before the face and the other way as they are flung out, the tail swinging round as a counterweight; it gathers low and snaps its blades up with the aura, a moving hold with a tremor, and relaxes (the game sweeps the sprite round in a small ellipse)
  - in place: the three hops side to side are gone (the game moves the sprite); the flourish is the torso's and the blades'
- [x] `status_target`: Screech (also Roar; Toxic by fallback, spat from the mouth) — rears up with the claws raised by its head, lunges the head forward, jaw wide and claws out, the head shaking while the sound waves leave the mouth
  - after review: added the raised claws (nails-on-slate) and pushed the rear and lunge
  - healthbox pass: the lunge leans in with the spine instead of the hips (8 px under our healthbox from the foe's side)

## Motif clips

- [x] `physical_weak_tackle` (tackle): Quick Attack, Pursuit, Facade, Secret Power, Double-Edge, Return, Frustration, Strength — a quick crouch, then the hips and the right shoulder drive at the foe, low and fast, the tail streaming out (impact), and it bounces back off the hit into its guard
  - in place: the dash, the tucked legs and the hop home are gone (the game makes the dash)
- [x] `physical_strong_punch` (punch): Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter — the weight sinks back with the right fist chambered at the hip and the left forearm guarding, then the hips drive at the foe and the hips and shoulders turn into a straight punch (impact at full reach: the punch effect on the foe), the arm stays out a moment, and back to the guard
  - in place: no leap in, no hop home
- [x] `physical_strong_strike` (strike_strong): Dragon Claw, Brick Break — both blades raised high behind the head as it sinks, a breath held with them cocked, then it drops its weight forward into a deep crouch as both forearms cut down across each other (impact), hangs low a moment and rises into its guard
  - in place: the big leap and the hop home are gone; the drop forward into the crouch carries the cut
- [x] `physical_strong_quake` (quake): Earthquake — a sumo's stomp where it stands: it settles its weight over the left foot and rears up on it, the right foot coming up off its spot and the knee going high and out to its side with the arms flung out wide and the tail up, then stamps the foot down into a deep squat, knees pushed out, the arms swung down and out low and the tail flicking up (impact: the ground shakes and dirt bursts at the foe), and rises with the arms flowing back to its guard
  - healthbox pass: the leap straight up took our Sceptile's head and claws under the foe's healthbox (897 px, the worst of the set). From the foe's side the stomp sank the root, and so the feet, into the ground, and in the deep crouch the braced claws and the folded left knee reached under ours (28 px): the knees now fold out to the sides (`SQUAT`, the feet kept where they stand), the arms swing out low and the tail lifts
  - in place: the tucked hop is now a stomp (the game shakes the screen); the knee goes out to the side, not forward (a wild Sceptile's foot would come down on our healthbox)
- [x] `special_weak_throw` (throw): Swift, Rock Tomb — forearms crossed low, then whipped out and forward; the volley flies off both forearm blades (the `blades` emitter)
- [x] `special_weak_drain` (drain): Absorb, Giga Drain — reaches both claws wide at the foe, closes them, then draws them to its chest with the head back and the eyes shut as the energy flows in to its body
  - after review: the reach opens sideways (straight at the foe it was foreshortened from both views)
  - healthbox pass: the reach leans in with the spine instead of the hips (6 px under our healthbox from the foe's side)
- [x] `status_self_shield` (shield): Detect, Protect, Endure, Substitute, Safeguard — draws in, snaps the forearms into an X before the face with the focused eyes, holds with a tremor under the barrier, opens back to the guard
- [x] `status_self_heal` (heal, weather): Sunny Day, Rest — basks: turns its face up to the light, arms open, eyes shut, swaying calmly (sunlight rises for Sunny Day, sparkles for Rest), happy eyes as it comes down
- [x] `status_target_glare` (glare, charm): Leer, Mimic, Swagger, Attract — leans in with the head low and forward and stares the foe down with narrowed eyes (the glint at its eyes; hearts for Attract), a cocky head tilt, eases back
  - healthbox pass: the lean-in comes from the spine instead of the hips (13 px under our healthbox from the foe's side)
- [x] `toss` (toss): Seismic Toss — an in-place heave: the hips drive at the foe with the claws flung open, the forearms clamp on it (grab: the foe rides in the grip) and it sinks with the load, the tail pressed down; the legs drive it up to the chest, the head thrown back and the tail streaming up, and from the top the whole body whips forward and down to hurl it into the ground at its place (throw); the foe crashes there on its side (impact: rocks and dust) while Sceptile watches from the crouch, the tail swishing, and straightens into its guard
  - in place: no dash in, no leap and no spin. The chest keeps its tilt from the clamp to the throw (in the playtest the foe rides in the grip turned with the chest: from where it stands a tilt swung the foe round it) and the throw comes at the start of the whip; the foe is held at the chest, never overhead, so it stays on screen from both sides
- [x] `burrow` (burrow): Dig — a crouch-and-dig where it stands: it crouches with its eyes on the ground and drives its claws in beside its feet (dig: the dirt bursts up), rakes the ground claw over claw with the tail swishing, gathers low with the right blade cocked and bursts up out of the crouch with a rising cut of the right blade, knee up and the tail trailing (impact), and comes down into a crouch; the game sinks the sprite into the ground and raises it under the foe
  - in place: it no longer dives or travels to the foe; the claws dig beside its feet, level with them (a wild Sceptile's toes rest on the top edge of our healthbox, and further forward is under it)
- [x] `fling` (fling): Mud-Slap — stoops and rakes the ground beside its right foot with the right claws, drags a handful of mud back past the hip, swings it through low and slings it underhand; the clods leave the right hand (the `hands` emitter) and the claws open high and out to the side in the follow-through while the left forearm keeps its guard
  - healthbox pass: the rake reached the ground out in front of the feet, under our healthbox from the foe's side (32 px), and the sling slid the feet forward: it now rakes beside the right foot from a shallower stoop and leans into the sling with the spine
- [x] `afterimage` (afterimage): Double Team, Agility — feints from the waist with the feet planted: the upper body slips to one side, dips under and slips out to the other (a boxer's bob and weave), again and again, the head held level and the tail swinging out as a counterweight, in its fighting stance (right claw raised, left forearm guarding); the game moves the sprite, Double Team's two darkened copies swing out from the aura and Agility's trail follows the sprite
  - in place: the darts are gone (the game makes them); the feint is the upper body's
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

## In place (the game moves the sprite)

The battles are the compiled game's (docs/ARCHITECTURE.md, "Remake layer"):
its move animations move the sprite (a lunge toward the foe, a hop, a
slide) and the 3D body follows it, so the clips act on top of that, in
place. Ten clips travelled or leapt (`cliplint` `travel`: `physical_weak`,
`physical_strong`, `status_self`, `physical_weak_tackle`,
`physical_strong_punch`, `physical_strong_strike`, `physical_strong_quake`,
`toss`, `burrow`, `afterimage`) and were reworked from home, each keeping
its move, character and weight (the notes above say what each became); the
earlier passes' notes on hops and darts describe the versions they replace.

- `advance` 0 and the root on its spot: no dashes, hops, leaps or spins in
  the air.
- A strike reaches from home: a coil (the weight back, the blade, fist or
  tail cocked), then the hips and spine drive at the foe with the weight
  onto the front foot, the blade, fist, shoulder or tail at full reach on
  the `impact` key, follow-through, recovery. Light and quick: the snaps
  are 5-6 frames from a turnaround, the tail swinging out as a
  counterweight.
- The feet stay planted. The foot IK pins a planted foot's height but keeps
  its posed x/z, so a pelvis shift slid both feet with it: `shift()` moves
  the pelvis (and turns the hips) and re-aims both legs (a two-bone solve,
  the knee bending in the stance's plane) so each foot stays where the
  stance puts it; the quake's stomping foot comes up straight off its spot
  (`footUp()`) and goes out to the side. Sceptile's origin sits behind its
  feet, so a `root.yaw` turn swung the whole body round that point: Slam's
  turn is the hips'.
- Seismic Toss clamps on and keeps the chest's tilt from the clamp to the
  throw: in the playtest the foe rides in the grip turned with the chest
  (src/battle3d/director.ts), and from where it stands a tilt swung the foe
  round it.

Checked: `cliplint` clean (no `travel`); every reworked clip that stays at
home played from both sides at eight phases of the life layer (the result
moves by a few pixels with the breathing), at most 2 px past a healthbox's
edge (3 px in the render gate's run: the X-slash's deep crouch as the
foe). Slam's coil turned the hips so far that a wild Sceptile's left toe
claws went 3 px under our box: the turn is smaller and a breakdown key
holds the feet on their spots through it. Watched on contact sheets from
both sides and in the compiled game's test battle (Slam as ours against a
wild Blaziken, and as the wild one against our Swampert). Fluidity
(`tools/gauntlet/motion.mjs`, stop-starts / pops, before → after):
`physical_weak` 3 / 2 → 0 / 0, `physical_strong` 4 / 1 (and a 17° turn in
its first 0.3 s) → 2 / 1, `physical_weak_tackle` 1 / 0 → 0 / 0,
`physical_strong_punch` 0 / 1 → 0 / 0; `status_self`,
`physical_strong_strike`, `physical_strong_quake`, `toss`, `burrow` and
`afterimage` 0 / 0 before and after; the whole set 9 stop-starts, 13 pops
and a clip turning in its first 0.3 s before, 3, 10 and none after, no
dead holds (the other pops are the faint's shrink and Bullet Seed's first
peck, clips this pass left alone).

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
