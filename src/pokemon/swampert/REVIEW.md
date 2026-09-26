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

- [x] `physical_weak`: Tackle, Facade, Secret Power (tackle), Rollout (spin) — turns its right shoulder forward and sinks, a low hop with the head down, crashes shoulder-first into the foe (impact star), bounces off shaking its head, hops home
- [x] `physical_strong`: Take Down, Double-Edge, Return, Strength, Waterfall (tackle), Body Slam (slam), Iron Tail, Mega Kick — long coil with the arms drawn back, heavy leap with the arms swinging up, comes down belly-first on the foe, shoves off, hops home
- [x] `special_weak`: Mud Shot, Water Gun, Water Pulse (spit), Icy Wind, Snore — gulps air (head back, mouth shut, elbows back), the head snaps forward with the jaw wide and the arms bracing; the projectile leaves the mouth; recoil bob, settle
- [x] `special_strong`: Ice Beam, Hyper Beam (beam), Blizzard, Hidden Power — rises and gathers with the eyes shut (charge sprites at the mouth), drops into a wide sumo brace and fires from the jaws; the recoil pushes it back while it holds with a tremor and a small head sweep; mouth shuts, shakes it off
- [x] `status_self`: Rain Dance, Hail (weather), Sleep Talk (buff) — curls in with the eyes shut, then rears up with the arms flung to the sky and roars (it senses and calls storms), moving hold, aura at the peak
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
- [x] `toss`: Seismic Toss — a sumo's bear hug: squares up with the crab arms flung wide, a low heavy hop in, the arms close round the foe as it lands (grab) and it sinks into an upright squat with it, straining; heaves it up against its chest and springs back toward mid-field, spinning round with it, hurls it down from the top of the leap with both arms (throw) and drops into a deep crouch at advance 0.4; the foe crashes on its side in its own place (impact: rocks and dust), where both views see it, and gets up while Swampert hops home
  - fixed after review: the first hug bowed so far that the head fins hid the face (it read as a head-butt), and the foe, hoisted to face height, left the top of the screen through the spin: now it is held at the chest and the leap is low, so it stays on screen from both sides. The hurl no longer stops the falling body in mid-air (a stutter and a pop on the landing): it comes at the top of the leap and the body drops from there
- [x] `burrow`: Dig, Dive — digging and diving are its element: rears back with the arms swung back, hops and plunges head first into the ground as into water, the tail fan going under last (dig: dirt bursts up for Dig, a water column for Dive); the mounds (bubbles for Dive) run to the foe; it breaches in front of it with both fists driving up and the jaw wide (impact as it clears the surface), comes down heavily with the arms braced wide, holds the crouch glaring up at the foe and hops home
  - fixed after review: the dig burst came a beat after the body entered the ground; the landing arms (raised out at the sides) read as hands up from behind, and from the front the crouch showed only the fins (now it looks up at the foe); the breach apex touched the top of the frame
- [x] `fling`: Mud-Slap — a big two-handed scoop: drops into a deep sumo squat and digs both hands into the mud beside its feet, draws the load back by its hips, then heaves it underhand at the foe with both arms as it rises out of the squat; the spray of mud clods leaves the right hand and splatters on the foe. From our side the scoop itself is below the frame edge; the dip and the heave carry it
  - fixed after review: the first scoop bowed the fins over the face; the heave opens wider so both arms clear the big head fins from behind
- [x] `afterimage`: Double Team — short, heavy side-hops, a sumo's shuffle, not a sprinter's dart: low hops of a fifth of its height to each side, each landing deep in the knees with the body rolling into it, arms spread wide in a grappler's guard; the two darkened afterimages swing out on both sides from the aura
  - fixed after review: the first guard (hands up by the face) read as raised hands from behind
- Also mapped: tackle → `physical_weak`, tackle_strong and slam → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff and weather → `status_self`, roar → `status_target`, throw → `wave`

## Fluidity pass (after comparing with Blaziken)

Measured with `tools/gauntlet/motion.mjs` against Blaziken and re-reviewed on
contact sheets from both sides:

- The battler no longer pivots toward the foe before every move (the engine
  turn now rides a contact move's leap and unwinds on the hop home).
- `physical_weak`: the shoulder charge no longer yaws the whole body on its
  planted feet (a 31° turn on the spot); the spine twists instead, with a
  longer sink, a squash on the crash and a heavier head-shaking hop home.
- `quake`: the fists rise through the sides (`ARMS_OUT`) instead of sweeping
  across the body, and the hammer lands into a squash and a rebound.
- `shield`: the forearms rise into the X (`GUARD_RISING`) and the hold sinks
  slowly instead of trembling in place; `status_self` and `glare` got moving
  holds the same way.
- `physical_strong`: the belly slam got breakdown keys in the air (it popped
  at the crash). `punch` and `strike` swing the torso less (±18–23°, were up
  to ±28°) after a slower wind-up, and the chop starts from an arm cocked
  further back as it lands, over 6 frames (was under 5): heavy, not snappy.
- `hit`: the snap into the flinch is 4 frames (was 3).

The motif clips added with the toss, burrow, fling and afterimage motifs
measure 1, 1, 0 and 1 stop-starts and no pops (Blaziken's: 1, 1, 0 and 2, no
pops), and were checked with the game's stop motion as well as smooth.

## Showcase moves in battle

- [x] a full battle with swampert as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (Earthquake, Mud Shot, Protect, Muddy Water filmed in an autoplay
      battle; both battles pass the render gate)
