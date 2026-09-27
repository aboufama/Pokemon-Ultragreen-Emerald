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

## Moves: blades, claws and chops

The Treecko line's shared choreography (src/pokemon/treecko/line/strikes.ts)
built on this species' kit. Reviewed frame by frame from both sides at game
resolution (contact sheets every 6 frames, the attacker as the foe and as
ours). Every blow's contact is measured for the lead branch's approach (at
advance 1 the fronts stop 0.15 of a height apart, mirror match), from the
posed body at each impact: the gap to the foe's body in its heights (the
gate wants 0.1 or less).

- [x] `pound`: the hand rises beside the head in the wind-up, a leap in, the body bows into a flat smack down on the foe's head and the hand stays on it a beat, hop home (gap 0.03)
- [x] `cut`: the blade raised straight up overhead (a different silhouette from Pound's) and carried through the leap, a crisp vertical chop through the foe, the body folding over it and the blade stopping low (0.02)
- [x] `fury_cutter`: both blades raised crossed behind the head, a leap in, two crossing slashes (the right down and across, then the left chopping down across it: the X), a bug-type flash on each impact, blades crossed low, home (0.08 / 0.02)
- [x] `leaf_blade`: en garde with the blade drawn back low, a long low spring into a lunge, right foot forward, the torso whips round and the blade cuts flat across the foe (the grass Cut effect), then it holds the blade out, poised, and hops home (0.07; it lands 0.15 of a height further in, the sweep is wide)
- [x] `false_swipe`: at the foe a half-swing it checks (the feint), the arm drawn back across the chest, then a restrained backhand out to its right that stops still in the air, lowered (0.08)
- [x] `dragon_claw`: hunched low and predatory, jaws parted, it leaps in and rakes wide across, then rips back the other way (two impacts, the dragon effect on each), home (0.06 / 0.03)
- [x] `brick_break`: the hand drawn up past the ear and the other held forward to sight the target, a high leap, a karate chop straight down as the body drops into it, landing deep (0.05)
- [x] `aerial_ace`: barely a crouch, a fast high spring, the slash as it drops onto the foe, touching down just past the strike point, a quick hop home: a blur (0.06)
- [x] `rock_smash`: the fist raised high, a leap in, it rears back with the fist, then the whole body comes down behind a hammer blow (0.07)
- [x] `crush_claw`: both claws reared up high and open over the foe, driven down onto it gripping, a trembling crush under its weight, a wrench free (0.01)

## Moves: punches, kicks, the tail, slams and the jaws

Built from the line's choreography (src/pokemon/treecko/line/punches.ts and
body.ts) on this species' kit, reviewed frame by frame from both sides
(contact sheets every 5 or 6 frames, zoomed on the blows). Gaps as above: the
posed body at each impact against the mirror match's foe with the lead
branch's approach (fronts 0.15 of a height apart), in the foe's heights.

- [x] `mega_punch`: the fist wound far back beside the head and the chest turned away, the left hand held out to sight the foe, a leap in, then the hips and shoulders whip round and the fist loops in (a haymaker), carried on across over the front foot (gap 0.07)
- [x] `thunder_punch`: the fist cocked back with a shiver through the shoulders (the charge), a crouch and a high leap, the fist brought over the top and down into the foe's face from the air, landing on it with the fist driven on through (0.04)
- [x] `dynamic_punch`: a slow, deep coil, the whole body wound round; a launch with the fist chambered at the hip, landing in a long lunge that drives a dead-straight punch through the foe, jaws open; a beat of stillness at full extension (0.08)
- [x] `focus_punch`: still and focused, a slow breath out with the eyes shut, a spring in, the straightest punch of its set with the other fist snapping back to the hip; the extension held (0.07)
- [x] `counter`: it takes the blow behind crossed arms, eyes screwed shut, drops into a crouch with the fist low, springs in and drives an uppercut up and forward into the foe's jaw, rising tall behind it (0.07)
- [x] `mega_kick`: a long bound turning side-on in the air, landing on its right foot with its left side to the foe and the knee chambered; the leg shoots out sideways into the foe as the body tilts away (a side kick: in profile from both sides, the face toward the foe and the tail trailing away); held a beat, a hop round and home (0.06)
- [x] `slam`: springs in and whips round, its back to the foe at the top of the arc with the tail reared up over its head, then the tail whips down across the foe; it lands deep and spins back round on the hop home (0.06)
- [x] `iron_tail`: a leaping spin to its left with the tail held rigid, lagging the turn, then cracking round flat through the foe; lands facing it, the tail swinging on past (0.07)
- [x] `body_slam`: a big leap high over the foe and a belly-flop down onto it, squashed on it a beat, rolls off onto its feet and hops home (0.07)
- [x] `crunch`: head lowered and jaws parting, a lunge in head first with the jaws wide, clamps down (the bite), three hard head shakes grinding, a wrench free (0.01)

## Moves: tackles, rams and shoves; the throw and the burrow

From the line's choreography (src/pokemon/treecko/line/tackles.ts and
grapples.ts) on this species' kit, reviewed from both sides (every 6 or 7
frames); Seismic Toss also played as the move, the foe carried and thrown.
Gaps as above.

- [x] `quick_attack`: barely a crouch, a long, low, flat dash, the right shoulder driven into the foe and it springs straight back home off it: the fastest clip it has (gap 0.06)
- [x] `pursuit`: it slinks low, head level with the shoulders and eyes narrowed, stalking, then darts in from the shadows and drives the right elbow into the foe (0.06)
- [x] `frustration`: a tantrum: it stamps one foot, then the other, shaking its head with its fists clenched, then flings itself at the foe and pounds it with both fists, twice (0.04 / 0.06)
- [x] `return`: a glad look back over its shoulder at its trainer, then a big bounding leap and a full-body tackle with the left shoulder, arms tucked; it bounces off, lands light and hops home, happy (0.05)
- [x] `facade`: puffed up with chest out and arms flexed (a brave front), then head down and a ram with the forehead; it rebounds a little dazed and shakes its head clear (0.04)
- [x] `secret_power`: it gathers the hidden power with its hands cupped together low, eyes shut, draws both hands back to its hips, springs in and thrusts both palms into the foe (0.05)
- [x] `strength`: a heave: it drops into a deep squat against the foe with both arms scooping in low under it, then drives up out of the squat, arms heaving up, and holds it there straining (0.04)
- [x] `double_edge`: a deep loaded crouch and a yell, a headlong launch like a missile with the arms swept back, and the recoil throws it back off the foe: it lands staggering, hurt, shakes it off and hops home (0.05)
- [x] `endeavor`: hurt and panting, it gathers its resolve, springs in and drives its shoulder into the foe with the heels dug in, straining and trembling, eyes screwed shut (0.06)
- [x] `struggle`: spent: a heavy, clumsy hop, a wild swipe flung on past, then it stumbles on into the foe butting it with its head; the effort hurts it and it drags itself home (0.08 / 0.01)
- [x] `seismic_toss`: a springy dash in with the hands flung open, it clamps on (grab), sinks, springs up and back toward mid-field with the foe hugged low in front, spinning round with it, and hurls it down into its own place (throw), where it crashes (impact) while it lands and watches, then home (grab gap 0.01)
- [x] `dig_charge`: Dig's first turn: a crouch with its eyes on the ground ahead, a springy hop and a head-first dive into the ground (dig: the dirt flies), arms overhead together; it stays down out of sight
- [x] `dig`: from underground at home it tunnels over (the ground heaving along its way), rights itself under the foe and bursts up with a rising cut of the right forearm, the tail trailing out of the ground (impact), drops in front of it, holds the crouch and hops home (0.06)

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
