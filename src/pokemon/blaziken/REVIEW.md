# Blaziken review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 3`, then the GIFs at game resolution). Reviewed against the
checklist: anticipation, follow-through, arcs with no sliding, effects from
the right emitter, a readable silhouette from our side (back view, cropped by
the text box) and the opponent's side, starts and ends on the stance.

## Battle moments

- [x] `idle`: breathing, weight shift and bounce read; mane and wrist feathers sway on springs; blinks
- [x] `intro`: curled crouch as it emerges, bursts into the battle cry with arms flung wide and wrist flames (wide, not overhead: from our side the claws and crest stay under the foe's healthbox), settles into guard
- [x] `hit`: snaps back with the hurt eyes, the sprung knock-back carries the body, shakes it off
- [x] `faint`: a tired sway with its eyes half shut, then it curls over onto its heels hugging itself, head tucked and eyes shut, and shrinks away (worn out, as the 3D games show it; it sits back as it curls, clear of our healthbox)

## Attack categories

- [x] `physical_weak`: Slash — from where it stands: the weight sinks back with the claw raised up the front and cocked high behind the head, then the hips drive at the foe onto the front foot and the torso unwinds into a slash down and across at full reach (impact), the claw carries through past the left hip and hangs, back into the guard
  - in place: the leap in and the hop home are gone (the game lunges the sprite); the claw rises up the front, not out at the side (out at its side, our Blaziken's claw went under our healthbox)
- [x] `physical_strong`: Blaze Kick — a deep crouch wound away from the foe, then it whips round on the ball of its planted left foot (a real `root.yaw` spin, the standing foot counter-turned so it pivots on its spot), the flaming right leg chambering and driving out side-on at the foe at full extension (impact), the turn carries the leg on across, it folds back in and comes down deep in the knees facing the foe
  - in place: no spring into the air and no hop home. As the hips start the whip the right foot comes straight up off its spot, and the fold tucks it up under the knee (swung forward low or hanging low, a wild Blaziken's toes went under our healthbox)
- [x] `special_weak`: Ember — quick breath (chest up, head back), head snaps forward, the ember leaves the beak; arms chambered
- [x] `special_strong`: Flamethrower — deep breath with embers gathering at the beak, head drives forward, stream from the beak follows the head sway; arms braced
- [x] `status_self`: Bulk Up — gathers with eyes shut, flexes with a tremor, aura rises, relaxes
- [x] `status_target`: Growl — rears up, lunges the head and roars; sound waves from the beak

## Motif clips

- [x] `physical_weak_kick` (kick): Double Kick, Low Kick — two alternating snap kicks from where it stands: the weight onto the back foot, the right knee chambers and the leg snaps out at the foe at hip height as the body leans back over the standing foot (impact), re-chambers and comes down; the hips turn into the left kick over the planted right foot (impact on the extended leg), and it squares up
  - in place: the kicks no longer step in; each foot lifts straight up off its spot into a high chamber (swung forward low, a wild Blaziken's toes went under our healthbox)
- [x] `status_target_kick` (kick_sand): Sand-Attack — weight back, the front foot scoops, sand arcs from the foot
- [x] `punch` (punch): Sky Uppercut, Fire Punch, Mega Punch — a deep crouch with the fist chambered low at the hip, then the legs drive the whole body up and at the foe, the fist leading up through its chin in front (impact at full reach), stretched tall on straight legs a moment, and it drops back into a crouch and rises
  - in place: no dash in, no leaving the ground, no hop home; the fist swings up through the front (from the hip straight to overhead it swung out round the side like a hook) and is carried through up in front and a little out to its right (overhead, or up past the side of its head, our Blaziken's fist went under the foe's healthbox)
- [x] `tackle` (tackle): Quick Attack, Take Down — a crouch with the right shoulder turning forward and the arms swinging down and back, then the hips and shoulder drive at the foe, low and fast, the arms swept back (impact), and it rocks back off the hit into its guard
  - in place: the dash and the hop home are the game's; the arms go back and come back to the guard through a low breakdown (straight from the guard they flipped over in a frame: a pop)
- [x] `peck` (peck): Peck — the head cocks back as the weight sinks, then the hips drive forward and the spine, neck and head drive the beak down at the foe with the arms swept back (impact), the head rebounds off the hit and it recovers
  - in place: no leap in, no hop home; the reach is the hips, spine and neck
- [x] `toss` (toss): Seismic Toss — an in-place heave: it reaches for the foe with the hips driving forward, the hands close on it at chest height (grab: the foe rides in the grip), it sinks with the load, drives up out of its legs and heaves it up in front with the head thrown back, and from the top the whole body whips forward and down to hurl it into the ground at its place (throw); it watches the crash (impact) from deep in the follow-through
  - in place: no rush in, no leap and no spin; the chest keeps its tilt from the grab to the throw (in the playtest the foe rides in the grip turned with the chest: from where it stands, the tilting chest swung the foe off the top of the screen) and the throw comes at the start of the whip
- [x] `burrow` (burrow): Dig — a crouch-and-dig where it stands: it crouches with its eyes on the ground and drives the claws in (dig: the dirt bursts up at its feet), rakes the ground back under itself claw over claw, gathers into a low coil and bursts up with a rising knee, both fists driving up (impact), and comes down into a crouch; the game sinks the sprite into the ground and raises it under the foe
  - in place: it no longer sinks out of sight or travels to the foe; the rising knee comes with the fists up (it read as a stop-start with the arms hanging)
- [x] `fling` (fling): Mud-Slap — weight back, the right foot scoops and flicks a spray of mud clods at the foe (emitterFor fling: feet)
- [x] `afterimage` (afterimage): Double Team, Agility — feints from the waist with the feet planted: the upper body slips to one side, dips under and slips out to the other (a boxer's bob and weave), the knees dipping under each slip and the head held level, guard up; the game moves the sprite (Agility's sweep, Double Team's copies) and the two darkened afterimages swing out on both sides from the aura
  - in place: the side-hops are gone (the game makes the dart); the feint is the upper body's
- Also mapped: kick_strong → `physical_strong`, breath and beam → `special_strong` (the stream from the beak), spit and orb → `special_weak` (the spat ember), strike → `physical_weak` (Slash), buff → `status_self`, roar → `status_target`

## In place (the game moves the sprite)

The battles are the compiled game's (docs/ARCHITECTURE.md, "Remake layer"):
its move animations move the sprite (a lunge toward the foe, a hop, a
slide) and the 3D body follows it, so the clips act on top of that, in
place. Nine clips travelled or leapt (`cliplint` `travel`:
`physical_weak`, `physical_weak_kick`, `physical_strong`, `punch`,
`tackle`, `peck`, `toss`, `burrow`, `afterimage`) and were reworked from
home, each keeping its move, character and weight (the notes above say what
each became):

- `advance` 0 and the root on its spot: no dashes, hops or leaps. The only
  root motion left is Blaze Kick's spin (`root.yaw`, acting).
- A strike reaches from home: a coil (the weight back, the limb cocked),
  then the hips and spine drive at the foe with the weight onto the front
  foot (or, for a kick, the body leans back over the standing foot), the
  claw, fist, foot, beak or shoulder at full reach on the `impact` key,
  follow-through, recovery.
- The feet stay planted. The foot IK pins a planted foot's height but keeps
  its posed x/z, so a pelvis shift slid both feet with it: `shift()` moves
  the pelvis and re-aims both legs (a two-bone solve, the knee bending in
  the stance's plane) so each foot stays where the stance puts it,
  `footUp()` lifts a kicking foot straight up off its spot and puts it back
  there, and Blaze Kick's spin counter-turns the standing foot so it pivots
  on the ball of the foot.
- Seismic Toss grips at chest height and keeps the chest's tilt from the
  grab to the throw: in the playtest the foe rides in the grip turned with
  the chest (src/battle3d/director.ts), and from where it stands every
  degree of tilt swung the foe round it (off the top of the screen).

Checked: `cliplint` clean (no `travel`); every reworked clip that stays at
home played from both sides at eight phases of the life layer (the result
moves by a few pixels with the breathing), at most 1 px past a healthbox's
edge (`physical_weak` from our side: the claw cocked behind the head
touches the foe's box); watched on contact
sheets from both sides and in the compiled game's test battle against a
wild Swampert (Slash and Blaze Kick: the body strikes on the game's own
lunge). Fluidity (`tools/gauntlet/motion.mjs`, stop-starts / pops, before
→ after): `physical_weak` 3 / 2 → 0 / 0, `physical_weak_kick` 9 / 0 →
2 / 0, `physical_strong` 6 / 0 (and a 25° turn in its first 0.3 s) →
0 / 0, `punch` 1 / 0 → 1 / 0, `tackle` 1 / 0 → 0 / 0, `peck` 6 / 0 →
0 / 0, `toss` 1 / 0 → 0 / 0, `burrow` 1 / 0 → 1 / 0, `afterimage`
1 / 0 → 1 / 0; the whole set 29 stop-starts, 10 pops, 2 dead holds and
a clip turning in its first 0.3 s before, 5, 8, 2 and none after (the
pops are the faint's shrink and Ember's snap, the holds the intro's and
Growl's: clips this pass left alone).

## Showcase moves in battle

- [x] a full battle with blaziken as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
