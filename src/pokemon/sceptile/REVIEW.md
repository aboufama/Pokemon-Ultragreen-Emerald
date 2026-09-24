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
- [x] `physical_strong`: Slam (also Body Slam, Iron Tail; Seismic Toss and Mega Kick by fallback) — coils with the tail lifting, springs in and turns its back to the foe, hangs at the top of the arc with the tail reared up, whips it down onto the foe, lands deep, spins back round on the hop home
  - after review: the first version turned so fast that the springs dragged the tail and it only pointed at the foe; the turn now finishes before the tail rears up and slams, and the tail spring is a little stiffer
- [x] `special_weak`: Bullet Seed (also Mud-Slap; Snore by fallback) — a quick breath with the head back, three pecks of the head with the jaw wide, a seed leaving the mouth on each, arms braced at the sides
  - after review: the pecks and the recoil between them are bigger (they were lost at game size)
- [x] `special_strong`: Solar Beam (also Hyper Beam; Hidden Power by fallback) — turns its face up to the sun with the arms spread and eyes shut while the sunlight gathers at the mouth, then braces low and drives the head at the foe; the beam leaves the mouth and follows the head through a trembling hold against the recoil; jaw shuts, head comes up
- [x] `status_self`: Agility (also Double Team, Swords Dance, Sleep Talk) — three quick hops side to side, leaning into each (airborne between landings), lands centred and snaps its arms up with the aura, relaxes
  - after review: wider hops with more lean
- [x] `status_target`: Screech (also Roar; Toxic by fallback, spat from the mouth) — rears up with the claws raised by its head, lunges the head forward, jaw wide and claws out, the head shaking while the sound waves leave the mouth
  - after review: added the raised claws (nails-on-slate) and pushed the rear and lunge

## Motif clips

- [x] `physical_weak_tackle` (tackle): Quick Attack, Pursuit, Dig, Facade, Secret Power, Double-Edge, Return, Frustration, Strength — a blur-fast low dash with the shoulder leading (legs tucked, body pitched in), impact, bounce off the foe, land, hop home
- [x] `physical_strong_punch` (punch): Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter — right fist chambered at the hip with the left forearm guarding, leap in, hips and shoulders turn into a straight punch (the punch effect on the foe), holds, hop home
- [x] `physical_strong_strike` (strike_strong): Dragon Claw, Brick Break — both blades raised high, a big leap, both forearms cut down across each other on the way down, lands deep and hangs, hop home
- [x] `physical_strong_quake` (quake): Earthquake — crouches, leaps straight up with the arms flung wide, stomps down into a deep landing; the ground shakes and dirt bursts at the foe; it stays home
- [x] `special_weak_throw` (throw): Swift, Rock Tomb — forearms crossed low, then whipped out and forward; the volley flies off both forearm blades (the `blades` emitter)
- [x] `special_weak_drain` (drain): Absorb, Giga Drain — reaches both claws wide at the foe, closes them, then draws them to its chest with the head back and the eyes shut as the energy flows in to its body
  - after review: the reach opens sideways (straight at the foe it was foreshortened from both views)
- [x] `status_self_shield` (shield): Detect, Protect, Endure, Substitute, Safeguard — draws in, snaps the forearms into an X before the face with the focused eyes, holds with a tremor under the barrier, opens back to the guard
- [x] `status_self_heal` (heal, weather): Sunny Day, Rest — basks: turns its face up to the light, arms open, eyes shut, swaying calmly (sunlight rises for Sunny Day, sparkles for Rest), happy eyes as it comes down
- [x] `status_target_glare` (glare, charm): Leer, Flash, Mimic, Swagger, Attract — leans in with the head low and forward and stares the foe down with narrowed eyes (the glint at its eyes; hearts for Attract), a cocky head tilt, eases back
- Also mapped: strike → `physical_weak`, slam and tail → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff → `status_self`, roar → `status_target`. Kick, grapple, orb, sound and powder (one TM/tutor move each) play their category clips.

## Showcase moves in battle

- [x] a full battle with sceptile as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (filmed with tools/shots/battle_film.mjs: Leaf Blade, Solar Beam, Slam
      and Agility as ours; the wild intro, Agility and the faint as the
      opponent)
