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
small unless the body should fold over (tackle, quake). The model also leans
forward at rest: a deep crouch plus a spine bend lays the whole body flat.

## Battle moments

- [x] `idle`: slow, heavy breathing through the open mouth, the life layer's weight shift and gaze drift; head fins, gills and tail fan sway on springs; blinks; no pop at the loop (both ends are the stance)
- [x] `intro`: curled crouch, a heavy hop with the fists pulled up by the shoulders (like its stock ANIM_V_JUMPS_BIG, but low), lands in the knees with the fists coming down in front, rears up and roars with both arms flung up high, the arms come down in front and it settles into the crab-armed stance
  - fixed after review: the landing crouch was too deep (read as a stumble); now a short dip
  - fixed for the healthboxes: from our side the big jump (0.15 heights) took the head fins under the foe's healthbox and the arms, flung wide and swung round the sides, took the right hand under ours (136 and 392 px: our send-out cut off by the boxes). The hop is 0.07 heights and leans in, the arms rise and come down the front of the body, and the roar's arms go up in a narrow V instead of wide; now 0 px from both sides
- [x] `hit`: 3-frame snap into a flinch with the hands jerking up in front of the face and hurt eyes, the sprung knock-back carries it, digs back in
  - fixed after review: the first version flung the arms straight out, which read as a T-pose flash from the back view
  - fixed for the healthboxes: from our side the hands, jerking up out at the sides, went under our healthbox (20 px); they now come up close in front of the face (1 px), with the 3-frame snap of the timing table (2 pops, as before)
- [x] `faint`: reels back with the flinch, the hands fall in front of it as it sways, the knees give and it sits back heavily onto its heels, slumped, and sinks tipping back a little
  - fixed for the healthboxes: as the foe it slumped forward onto its belly and its head fell onto our healthbox (278 px); it now folds back over its heels (3 px). From our side the flinching right hand went under our box (14 px): the flinch is narrower and the hands fall in front (0 px)

## Attack categories

- [x] `physical_weak`: Tackle, Facade, Secret Power (tackle), Rollout (spin) — turns its right shoulder forward and sinks, a low hop with the head down, crashes shoulder-first into the foe (impact star), bounces off shaking its head, hops home
- [x] `physical_strong`: Take Down, Double-Edge, Return, Strength, Waterfall (tackle), Body Slam (slam), Iron Tail, Mega Kick — long coil with the arms drawn back, heavy leap with the arms swinging up, comes down belly-first on the foe, shoves off, hops home
- [x] `special_weak`: Mud Shot, Water Gun, Water Pulse (spit), Icy Wind, Snore — gulps air (head back, mouth shut, elbows back), the head snaps forward with the jaw wide and the elbows braced out; the projectile leaves the mouth; recoil bob, settle
  - fixed for the healthboxes: as the foe the bracing hands reached down by its knees, under our healthbox (125 px); the elbows now brace out with the forearms angled forward (0 px)
- [x] `special_strong`: Ice Beam, Hyper Beam (beam), Blizzard, Hidden Power — rises and gathers with the eyes shut (charge sprites at the mouth), drops into a wide sumo brace and fires from the jaws; the recoil pushes it back while it holds with a tremor and a small head sweep; mouth shuts, shakes it off
  - fixed for the healthboxes: as the foe the brace, hands planted by its knees in a deep crouch, went under our healthbox (112 px); now a sumo brace with the elbows out and the forearms reaching forward low, a shallower crouch and a livelier tremor (2 px, no dead hold)
- [x] `status_self`: Rain Dance, Hail (weather), Sleep Talk (buff) — curls in with the eyes shut and the fists crossed before the chest, then rears up with the arms flung to the sky and roars (it senses and calls storms), moving hold, aura at the peak; the arms come down in front
  - fixed for the healthboxes: from our side the arms rose out round the sides and flung out wide (under our healthbox, 340 px, and the foe's, 5 px); they now rise up the front, open in a narrow V and come down in front (0 px). As the foe the arms crossed low before the belly went under our box (133 px); the fists now cross before the chest (0 px)
- [x] `status_target`: Growl, Roar (roar), Attract, Swagger (charm), Toxic (powder, from the mouth) — rears back, lunges the chest in with the arms thrown wide and bellows, head swaying; sound waves from the mouth
  - fixed after review: less forward pitch so the open mouth faces the foe instead of the fins

## Motif clips

- [x] `quake`: Earthquake (showcase) — rears up with both fists high overhead, then drops deep and hammers them into the ground at its sides; impact on the hammer (screen shake, dirt bursting at the foe), holds the crouch while the ground heaves. Reads from the back as two fists raised over the fins
  - fixed for the healthboxes: from our side the fists rose out round the sides (under our healthbox, 346 px); they rise and come down the front of the body now. As the foe the fists hammered the ground in front of its feet, under our box (123 px); they hit the ground at its sides, from a slightly shallower crouch that deepens on the squash just after they land (the forearms trail the upper arms, so on the landing frame the fists were still out in front, low), and the dip before the rear-up is small with the fingers curled (2 px). The front breakdown also removed the old stop-starts (0 stop-starts, 0 pops; was 4 and 1)
- [x] `wave`: Muddy Water (showcase), Surf; also Rock Tomb, Rock Slide (throw, rocks from both hands) — scoops down low with both arms, heaves them up the front and high over its head as it rears (raising the wave, lifting boulders), drives them forward and down; the wave rolls out from its feet / the rocks leave the hands at the push
  - fixed for the healthboxes: from our side the heave straight overhead took the hands under the foe's healthbox (9 px); it now goes up the front and high in front of the fins, from a slightly lower rear-up (0 px)
- [x] `shield`: Protect (showcase), Endure, Substitute, Defense Curl — digs in behind forearms crossed before the face, eyes squeezed shut, a small tremor; the Protect barrier covers it from both sides
- [x] `punch`: Mega Punch, Focus Punch, DynamicPunch, Ice Punch, Counter — cocks the right fist far back with the torso turned away, hops in, hips and shoulders unwind and the fist drives through the foe (impact on the extended arm), follow-through, hops home
- [x] `strike`: Brick Break, Rock Smash — right hand raised high behind the head, hops in, chops down and across (claw-slash impact), follow-through, hops home
- [x] `glare`: Foresight, Mimic — braces low with the elbows out and leans its chest in, face kept up at the foe, mouth shut, narrowed eyes and a slow peering head sway
  - fixed after review: the first version pitched the head so far that the fins hid the face. The engine's Leer glint sits at the `head` bone pivot, which on Swampert is at mouth level, so the glint is small; the body carries the move
  - fixed for the healthboxes: as the foe the braced hands went under our healthbox (100 px); the new brace and a shallower lean in (2 px)
- [x] `kick_sand`: Mud Sport — weight onto the left leg, the right foot drags back through the mud and flings forward; mud clumps arc from the foot at the foe
  - fixed for the healthboxes: as the foe, the weight shift took its left hand's claws under our healthbox (59 px); a shallower crouch and that elbow lifting a little for balance (2 px)
- [x] `heal`: Rest — settles down heavily with the arms easing out and dropping limp at its sides, eyes closing and the head sinking forward, slow deep breaths (moving hold) while sparkles rise, gets back up
  - fixed for the healthboxes: as the foe the hanging hands went under our healthbox (54 px); the arms ease out at the elbows on the way down and up, hang a little behind the hips with the fingers curled, from a shallower settle (0 px)
- [x] `toss`: Seismic Toss — a sumo's bear hug: squares up with the crab arms flung wide, a low heavy hop in, the arms close round the foe as it lands (grab) and it sinks into an upright squat with it, straining; heaves it up against its chest and springs back toward mid-field, spinning round with it, hurls it down from the top of the leap with both arms (throw) and drops into a deep crouch at advance 0.4; the foe crashes on its side in its own place (impact: rocks and dust), where both views see it, and gets up while Swampert hops home
  - fixed after review: the first hug bowed so far that the head fins hid the face (it read as a head-butt), and the foe, hoisted to face height, left the top of the screen through the spin: now it is held at the chest and the leap is low, so it stays on screen from both sides. The hurl no longer stops the falling body in mid-air (a stutter and a pop on the landing): it comes at the top of the leap and the body drops from there
- [x] `burrow`: Dig, Dive — digging and diving are its element: rears back with the arms swung back, hops and plunges head first into the ground as into water, the tail fan going under last (dig: dirt bursts up for Dig, a water column for Dive); the mounds (bubbles for Dive) run to the foe; it breaches in front of it with both fists driving up and the jaw wide (impact as it clears the surface), comes down heavily with the arms braced wide, holds the crouch glaring up at the foe and hops home
  - fixed after review: the dig burst came a beat after the body entered the ground; the landing arms (raised out at the sides) read as hands up from behind, and from the front the crouch showed only the fins (now it looks up at the foe); the breach apex touched the top of the frame
- [x] `fling`: Mud-Slap — a big two-handed scoop: drops into a sumo squat and digs both hands into the mud beside its feet, draws the load back by its hips, then heaves it underhand at the foe with both arms together as it rises out of the squat, and the arms come back down in front; the spray of mud clods leaves the hands and splatters on the foe. From our side the scoop itself is below the frame edge; the dip and the heave carry it
  - fixed after review: the first scoop bowed the fins over the face; the heave opens wider so both arms clear the big head fins from behind
  - fixed for the healthboxes: from our side the arms swinging back round the sides after the heave took the right hand under our healthbox (95 px); the heave now swings through low with the hands together and the arms come down in front (0 px). As the foe the hands dug in front of its feet from a deeper squat, under our box (85 px); they dig beside and a little behind its feet, fingers cupped, from a shallower squat (3 px)
- [x] `afterimage`: Double Team — short, heavy side-hops, a sumo's shuffle, not a sprinter's dart: low hops to each side (0.15 heights to its left, 0.1 to its right), each landing deep in the knees with the body leaning a little into it and the head held level, arms spread wide in a grappler's guard that lowers as it lands home; the two darkened afterimages swing out on both sides from the aura
  - fixed after review: the first guard (hands up by the face) read as raised hands from behind
  - fixed for the healthboxes: from our side the wide hops (0.2 heights) leaning into the landing took the right head fin under our healthbox (256 px); the hops are narrower toward our box and lean less, with the head held level (0 px)
- Also mapped: tackle → `physical_weak`, tackle_strong and slam → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff and weather → `status_self`, roar → `status_target`, throw → `wave`

## Clear of the healthboxes

Measured with `tools/gauntlet/uiclear.mjs` (every clip that stays at home,
from both sides, pixels past a box's 2 px edge). Before this pass 23 clips
went under a box; now none goes more than 4 px past an edge (at most 1 px
from our side, 3 px as the foe). Four things made the difference:

- As the foe, the stance itself reached under our healthbox: the toes and
  the claws of the left hand hung 3 to 4 rows under its top edge at rest
  (up to 9 px through the idle), so every crouch took the hands further
  under (up to 133 px). The enemy slot is nudged back,
  `calibration.slots.enemy.dz` 0 to -0.3 (3.3 px up the screen, 3% smaller),
  so the model's feet now stand where the stock sprite's do (its bottom 1.5 px
  below the sprite's, was 5.5). The fit measured at the new depth, without
  refitting anything else (`tools/calibrate`'s own score): opponent side IoU
  0.5711 (gate 0.55), box IoU 0.8321 (gate 0.75).
- As the foe, a crouch keeps the hands off the ground in front of its feet
  (that ground is under our box): braces with the elbows out, hands that
  hang at its sides curled, digs and hammer blows at its sides, and
  `sink()`, which lifts the left elbow a little as it sinks (that hand hangs
  lowest on screen).
- From our side our box sits right beside the right hand at rest, so a raise
  goes up the front of the body (`ARMS_RISING`) and comes down the front
  (`ARMS_DOWN_FRONT`) instead of round the sides, and raised arms go up in a
  narrow V instead of out wide.
- From our side the foe's box sits just over the head fins: the hop of the
  send-out is low and leans in, and nothing rears up far with the arms
  straight overhead.

## Fluidity pass (after comparing with Blaziken)

Measured with `tools/gauntlet/motion.mjs` against Blaziken and re-reviewed on
contact sheets from both sides:

- The battler no longer pivots toward the foe before every move (the engine
  turn now rides a contact move's leap and unwinds on the hop home).
- `physical_weak`: the shoulder charge no longer yaws the whole body on its
  planted feet (a 31° turn on the spot); the spine twists instead, with a
  longer sink, a squash on the crash and a heavier head-shaking hop home.
- `quake`: the fists rise up the front of the body (they once swept across it,
  then rose round the sides, which went under our healthbox), and the hammer
  lands into a squash and a rebound.
- `shield`: the forearms rise into the X (`GUARD_RISING`) and the hold sinks
  slowly instead of trembling in place; `status_self` and `glare` got moving
  holds the same way.
- `physical_strong`: the belly slam got breakdown keys in the air (it popped
  at the crash). `punch` and `strike` swing the torso less (±18–23°, were up
  to ±28°) after a slower wind-up, and the chop starts from an arm cocked
  further back as it lands, over 6 frames (was under 5): heavy, not snappy.
- `hit`: the flinch keeps the 3-frame snap of the timing table; its hands
  come up close in front of the face (2 pops, as the first version).

The motif clips added with the toss, burrow, fling and afterimage motifs
measure 1, 1, 0 and 1 stop-starts and no pops (Blaziken's: 1, 1, 0 and 2, no
pops), and were checked with the game's stop motion as well as smooth. After
the healthbox pass, the clips it changed measure 8 stop-starts, 3 pops and no
dead holds over 15.7 s (`intro`, `hit`, `faint`, `afterimage`,
`fling`, `status_self`, `special_strong`, `special_weak`; Blaziken's same
clips: 16, 6 and 1 over 13.7 s); `quake`, `wave`, `glare`, `heal` and
`kick_sand`, which Blaziken lacks, measure none of either. No changed clip
measures worse than before the pass (`quake` 4 stop-starts and a pop to none,
`status_self` 2 to none, `faint` 8 to 7; `hit` keeps its 2 snap pops).

## Showcase moves in battle

- [x] a full battle with swampert as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (Earthquake, Mud Shot, Protect, Muddy Water filmed in an autoplay
      battle; both battles pass the render gate)
