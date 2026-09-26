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
- [x] `faint`: reels back, sways forward, knees buckle and it slumps with the head and tail down and a small bounce, then sinks

## Attack categories

- [x] `physical_weak`: Leaf Blade (also Pound, Fury Cutter, False Swipe, Aerial Ace, Cut, Rock Smash) — crouch with the right blade raised high behind the head like a sword, leap in along an arc, land, the torso unwinds and the forearm cuts down and across (the Cut effect on the foe), the blade carries through past the left hip and hangs, guard, hop home
  - after review: pushed the wind-up higher and the sweep wider (it read as a small chop from the opponent's side)
- [x] `physical_strong`: Slam (also Body Slam, Iron Tail; Mega Kick by fallback) — coils with the tail lifting, springs in and turns its back to the foe, hangs at the top of the arc with the tail reared up, whips it down onto the foe, lands deep, spins back round on the hop home
  - after review: the first version turned so fast that the springs dragged the tail and it only pointed at the foe; the turn now finishes before the tail rears up and slams, and the tail spring is a little stiffer
- [x] `special_weak`: Bullet Seed (Snore by fallback) — a quick breath with the head back, three pecks of the head with the jaw wide, a seed leaving the mouth on each, arms braced at the sides
  - after review: the pecks and the recoil between them are bigger (they were lost at game size)
- [x] `special_strong`: Solar Beam (also Hyper Beam; Hidden Power by fallback) — turns its face up to the sun with the arms spread and eyes shut while the sunlight gathers at the mouth, then braces low and drives the head at the foe; the beam leaves the mouth and follows the head through a trembling hold against the recoil; jaw shuts, head comes up
- [x] `status_self`: Swords Dance (also Sleep Talk; Agility and Double Team moved to `afterimage`) — three quick hops side to side, leaning into each (airborne between landings), lands centred and snaps its arms up with the aura, relaxes
  - after review: wider hops with more lean
- [x] `status_target`: Screech (also Roar; Toxic by fallback, spat from the mouth) — rears up with the claws raised by its head, lunges the head forward, jaw wide and claws out, the head shaking while the sound waves leave the mouth
  - after review: added the raised claws (nails-on-slate) and pushed the rear and lunge

## Motif clips

- [x] `physical_weak_tackle` (tackle): Quick Attack, Pursuit, Facade, Secret Power, Double-Edge, Return, Frustration, Strength — a blur-fast low dash with the shoulder leading (legs tucked, body pitched in), impact, bounce off the foe, land, hop home
- [x] `physical_strong_punch` (punch): Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter — right fist chambered at the hip with the left forearm guarding, leap in, hips and shoulders turn into a straight punch (the punch effect on the foe), holds, hop home
- [x] `physical_strong_strike` (strike_strong): Dragon Claw, Brick Break — both blades raised high, a big leap, both forearms cut down across each other on the way down, lands deep and hangs, hop home
- [x] `physical_strong_quake` (quake): Earthquake — crouches, leaps straight up with the arms flung wide, stomps down into a deep landing; the ground shakes and dirt bursts at the foe; it stays home
- [x] `special_weak_throw` (throw): Swift, Rock Tomb — forearms crossed low, then whipped out and forward; the volley flies off both forearm blades (the `blades` emitter)
- [x] `special_weak_drain` (drain): Absorb, Giga Drain — reaches both claws wide at the foe, closes them, then draws them to its chest with the head back and the eyes shut as the energy flows in to its body
  - after review: the reach opens sideways (straight at the foe it was foreshortened from both views)
- [x] `status_self_shield` (shield): Detect, Protect, Endure, Substitute, Safeguard — draws in, snaps the forearms into an X before the face with the focused eyes, holds with a tremor under the barrier, opens back to the guard
- [x] `status_self_heal` (heal, weather): Sunny Day, Rest — basks: turns its face up to the light, arms open, eyes shut, swaying calmly (sunlight rises for Sunny Day, sparkles for Rest), happy eyes as it comes down
- [x] `status_target_glare` (glare, charm): Leer, Mimic, Swagger, Attract — leans in with the head low and forward and stares the foe down with narrowed eyes (the glint at its eyes; hearts for Attract), a cocky head tilt, eases back
- [x] `toss` (toss): Seismic Toss — a springy dash in with the claws flung open, lands at the foe and clamps on low (grab), presses its tail down and springs up and back toward mid-field with the foe hugged low in front (never overhead), spinning round with it while the tail streams out, then whips its whole body forward and down to hurl it back into its own place (throw); the foe crashes there on its side (impact: rocks and dust) while Sceptile lands at advance 0.4 and watches from the crouch, the tail swishing, then hops home. Both views see the crash. At the height of the spin the top edge cuts off much of the foe (most in the opponent's view, around 0.8 s) but it never leaves the screen, where the reference loses it for 0.25 s
  - after review: the foe is carried low (it was held up in front and went off the top) and Sceptile lands straight down where it throws
- [x] `burrow` (burrow): Dig — crouches, springs and dives head first into the ground with the arms overhead and the blades together (dig: dirt bursts, the tail goes in last), a trail of heaving dirt runs to the foe, it bursts up in front of it with a rising cut of the right blade, knee up and the tail trailing out of the ground (impact as it breaks the surface), drops straight down, holds the crouch and hops home
  - after review: the burst was lowered (it left the top of the screen), the tail hangs down as it comes out of the ground (it fanned across the body from our side) and the blade angles out so it clears the head in both views
- [x] `fling` (fling): Mud-Slap — stoops and rakes the ground with the right claws, drags a handful of mud back past the hip, swings it through low and slings it underhand; the clods leave the right hand (the `hands` emitter) and the claws open high and out to the side in the follow-through while the left forearm keeps its guard
- [x] `afterimage` (afterimage): Double Team, Agility — five low, springy darts side to side in its fighting stance (right claw raised, left forearm guarding), leaning into each with the tail swinging out as a counterweight, and back to the centre; Double Team's two darkened copies swing out from the aura, Agility's trail follows the darts (from our side the darts to its left run to the screen edge, as the reference's do)
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

## Showcase moves in battle

- [x] a full battle with sceptile as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (filmed with tools/shots/battle_film.mjs: Leaf Blade, Solar Beam, Slam
      and Agility as ours; the wild intro, Agility and the faint as the
      opponent)
  - re-checked after the toss, burrow, fling, afterimage and flash clips
    (Agility now plays `afterimage`): `check.mjs --render` runs both battles
    to the end and plays every clip from both sides without errors
