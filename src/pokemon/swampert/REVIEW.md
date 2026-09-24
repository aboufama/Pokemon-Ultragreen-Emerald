# Swampert review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 3`, every 5 frames, cropped to the enemy slot and to the player
slot above the text box line), then the showcase moves again at game
resolution (`--density 1`) and in a filmed autoplay battle. Reviewed against
the checklist: anticipation before the action · follow-through after it ·
arcs, no sliding (feet planted or clearly airborne) · the effect leaves the
right emitter · the silhouette reads from our side (back view, cropped by the
text box) and from the opponent's side · starts and ends on the stance.

Rig note that shaped every clip: Swampert's `head` bone moves most of the
upper body (head and torso are one mass), so head pitch tips the whole torso
and the head fins then hide the face. Clips keep the summed spine+head pitch
small unless the body should fold over (tackle, quake).

## Battle moments

- [x] `idle`: slow, heavy breathing through the open mouth, the life layer's weight shift and gaze drift; head fins, gills and tail fan sway on springs; blinks; no pop at the loop (both ends are the stance)
- [x] `intro`: curled crouch, a big heavy jump (like its stock ANIM_V_JUMPS_BIG), lands in the knees, rears up and roars with both arms flung up, settles into the crab-armed stance
  - fixed after review: the landing crouch was too deep (read as a stumble); now a short dip
- [x] `hit`: 3-frame snap into a flinch with the hands jerking up by the face and hurt eyes, the sprung knock-back carries it, digs back in
  - fixed after review: the first version flung the arms straight out, which read as a T-pose flash from the back view
- [x] `faint`: reels back with the flinch, sways forward, the knees give and it slumps onto its belly with a small bounce, sinks

## Attack categories

- [x] `physical_weak`: Tackle, Dig, Dive, Facade, Secret Power (tackle), Rollout (spin) — turns its right shoulder forward and sinks, a low hop with the head down, crashes shoulder-first into the foe (impact star), bounces off shaking its head, hops home
- [x] `physical_strong`: Take Down, Double-Edge, Return, Strength, Waterfall (tackle), Body Slam (slam), Iron Tail, Mega Kick, Seismic Toss — long coil with the arms drawn back, heavy leap with the arms swinging up, comes down belly-first on the foe, shoves off, hops home
- [x] `special_weak`: Mud Shot, Water Gun, Mud-Slap, Water Pulse (spit), Icy Wind, Snore — gulps air (head back, mouth shut, elbows back), the head snaps forward with the jaw wide and the arms bracing; the projectile leaves the mouth; recoil bob, settle
- [x] `special_strong`: Ice Beam, Hyper Beam (beam), Blizzard, Hidden Power — rises and gathers with the eyes shut (charge sprites at the mouth), drops into a wide sumo brace and fires from the jaws; the recoil pushes it back while it holds with a tremor and a small head sweep; mouth shuts, shakes it off
- [x] `status_self`: Rain Dance, Hail (weather), Double Team, Sleep Talk (buff) — curls in with the eyes shut, then rears up with the arms flung to the sky and roars (it senses and calls storms), moving hold, aura at the peak
- [x] `status_target`: Growl, Roar (roar), Attract, Swagger (charm), Toxic (powder, from the mouth) — rears back, lunges the chest in with the arms thrown wide and bellows, head swaying; sound waves from the mouth
  - fixed after review: less forward pitch so the open mouth faces the foe instead of the fins

## Motif clips

- [x] `quake`: Earthquake (showcase) — rears up with both fists high overhead, then drops deep and hammers them into the ground; impact on the hammer (screen shake, dirt bursting at the foe), holds the crouch while the ground heaves. Reads from the back as two fists raised over the fins
- [x] `wave`: Muddy Water (showcase), Surf; also Rock Tomb, Rock Slide (throw, rocks from both hands) — scoops down low with both arms, heaves them up high as it rears (raising the wave, lifting boulders), drives them forward and down; the wave rolls out from its feet / the rocks leave the hands at the push
- [x] `shield`: Protect (showcase), Endure, Substitute, Defense Curl — digs in behind forearms crossed before the face, eyes squeezed shut, a small tremor; the Protect barrier covers it from both sides
- [x] `punch`: Mega Punch, Focus Punch, DynamicPunch, Ice Punch, Counter — cocks the right fist far back with the torso turned away, hops in, hips and shoulders unwind and the fist drives through the foe (impact on the extended arm), follow-through, hops home
- [x] `strike`: Brick Break, Rock Smash — right hand raised high behind the head, hops in, chops down and across (claw-slash impact), follow-through, hops home
- [x] `glare`: Foresight, Mimic — braces low and leans its chest in, face kept up at the foe, mouth shut, narrowed eyes and a slow peering head sway
  - fixed after review: the first version pitched the head so far that the fins hid the face. The engine's Leer glint sits at the `head` bone pivot, which on Swampert is at mouth level, so the glint is small; the body carries the move
- [x] `kick_sand`: Mud Sport — weight onto the left leg, the right foot drags back through the mud and flings forward; mud clumps arc from the foot at the foe
- [x] `heal`: Rest — settles down heavily with the arms dropping limp, eyes closing and the head sinking forward, slow deep breaths (moving hold) while sparkles rise, gets back up
- Also mapped: tackle → `physical_weak`, tackle_strong and slam → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff and weather → `status_self`, roar → `status_target`, throw → `wave`

## Showcase moves in battle

- [x] a full battle with swampert as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (Earthquake, Mud Shot, Protect, Muddy Water filmed in an autoplay
      battle; both battles pass the render gate)
