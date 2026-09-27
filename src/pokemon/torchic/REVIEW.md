# Torchic review log

Every clip, watched frame by frame from both sides: contact sheets every 4
frames at `--density 2` and `3`, cropped to the foe's slot and to our slot
with the in-game UI (`tools/shots/move_sheet.mjs` for the moves with their
effects), key poses in the rig lab's turntable, the GIFs at game resolution
(`tools/shots/clip_gifs.mjs`), and the early game in the compiled game's
test battles (see the last section). Reviewed against the checklist:
anticipation before the action · follow-through after it · arcs, no sliding
(feet planted or clearly off the ground) · the effect leaves the right
emitter · the silhouette reads from our side (back view, cropped by the text
box) and from the opponent's side · starts and ends on the stance.

What shaped every clip:

- Torchic has no neck and no arms: a big round head on a round body, tiny
  wing tufts, short legs (0.16 heights to the ankle). The head pivots on the
  chest, so pitching it forward turns the face to the ground (the first
  drafts' spits and cries looked at the grass): the body leans from the hips
  while the head keeps its face on the foe (`lean()` in clips.ts); only the
  headlong charges lead with the crown.
- From our side only the head, the crest and the top of the collar show over
  the text box, so every action also reads in the head, the crest and the
  wing tufts. The crest stands up, fanned, with its tips swept back: swept
  back from the base (the first stance) the plumes showed their shaded
  backs and read as a flat taupe tuft; standing, they are the golden fan of
  the back sprite and a flame from the foe's side. The big poses keep it
  standing, and its springs are a little stiffer than a mane's, so it sways
  without flopping back on every thrust. Refitted after the change: opponent
  side IoU 0.66 / box 0.77, player side 0.70 / 1.00 (were 0.67 / 0.80 and
  0.65 / 0.90), color loss 0.66 (was 0.70).
- Its legs bend backward, like a bird's (`bend: -1` in rig.ts): with the
  planting IK's default forward knee, every crouch flipped the knees forward
  and lifted the planted feet off the ground (found as foot pops by
  `tools/gauntlet/motion.mjs`, then frame by frame).
- The head trails the body by 0.045 s, less than a necked biped's 0.065 s,
  which nodded the face down on every thrust.
- The game's effects start with its moves (Scratch's marks, Ember's embers,
  Growl's noise lines appear within a few frames of the move starting), so
  the early moves strike, spit and cry within 0.1 to 0.2 s, after a quick
  anticipation.
- Moving holds move the body, not only the head and wings: the cries pump,
  the fire stream pulses, it sways as it basks, trembles in its hunker and
  breathes as it dozes.
- Clear of the healthboxes (`tools/gauntlet/uiclear.mjs`): 0 px under either
  box from both sides, every clip.
- Fluidity (`tools/gauntlet/motion.mjs`, smooth motion): 2 stop-starts over
  29.4 s of clips (Blaziken: 29 over 28.3 s), 5 pops (3 as the faint's
  shrink ends, as Blaziken's; 2 on Sand-Attack's scrape), no dead holds, no
  turn in the first 0.3 s of any clip.

## Battle moments

- [x] `idle`: the life layer's breathing and weight shift, a curious head tilt each way, a little puff of the chest and a quick flutter of the wing tufts once a loop; crest, tail and wing tufts sway on springs; blinks; no pop at the loop (both ends are the stance)
- [x] `intro`: out of its ball curled up small (crest flat, wing tufts folded, eyes shut), bursts up tall with the wing tufts flung open and the crest standing, cheeps with two flaps (the body bouncing with them) and a shake of the head, and bobs down into its stance; from our side the golden crest flares and sways through the cry, clear of the foe's box
  - fixed after review: from our side the crest flopped back and read as a dull tuft through the cry; it stands through it now, the face a little less far up
- [x] `hit`: a 3-frame snap back with a squawk and the hurt eyes, wing tufts flared and the head rolled away, the sprung knock-back carries it; shakes it off with an angry look
- [x] `faint`: a woozy sway with drooping eyes, then it plops down onto its bottom with the head drooping to one side, eyes shut, wing tufts folded, and shrinks away at its `shrink` (worn out; it sits back as it drops, so the big head stays over its feet, and its feet stay on the ground)
  - fixed after review: the first curl bowed the head so far that from the front it looked face down into the grass; the head now droops sideways

## Attack categories

- [x] `physical_weak`: Scratch (showcase), Slash, Aerial Ace, Cut, Rock Smash (strike), Mega Kick (kick) — a barnyard talon rake: it rocks back onto its right foot with the body turned away and the near foot cocked up by its belly, talons out, then the foot rakes down and across through the foe as the body unwinds into it with a squawk (impact on the rake: legs have no overlap), stamps down and straightens with a flick of the crest. From our side the twist and the whip of the crest toward the foe carry it
  - fixed after review: the first chamber lifted the foot straight up in front of the belly, hidden behind the body from the foe's side; it comes up and out by the belly now, and the body turns away further before it unwinds. The rake lands at 0.19 s, with the game's scratch marks
- [x] `physical_strong`: Double-Edge, Return, Frustration, Strength (tackle), Body Slam (slam), Mega Punch, Counter (punch: no fists, it throws its body), Seismic Toss (no arms to grab with) — paws the ground with the right foot like a bull, coils low with its head down, throws its whole round body at the foe crown first, squashes against it (impact), bounces back dazed with a shake of the head
- [x] `special_weak`: Ember (showcase) — the fire comes up from its belly: a quick hunch, then the head thrusts forward and up with the beak wide and the ember leaves the beak (release at 0.14 s, as the game's embers leave), a recoil bob back and up, settles
  - fixed after review: the head pitched forward with the body and the beak spat at the ground; the body leans and the face stays level. The hunch and the recoil were too small to read at the GBA's pixels: pushed further
- [x] `special_strong`: Fire Blast (spit), Overheat (burst), Hidden Power (orb) — gathers the fire in its belly curled small with its eyes squeezed shut (charge), swells up tall with the wing tufts flung wide and the crest standing, blasts it from the beak with the head thrust forward (release), the recoil pushes it back and it holds with a tremor, then sags, spent, and shakes it off
  - fixed after review: from our side the crest flopped back in the swell; it stands through the swell and the blast now
- [x] `status_self`: Focus Energy (showcase), Swords Dance, Mirror Move, Sleep Talk (buff) — gathers itself crouched small with its eyes squeezed shut, wing tufts folded and crest flat, then fires up: stretched tall, chest out, crest standing and fanned, wing tufts flung open and fluttering while the aura rises; relaxes
  - fixed after review: the first gather bowed the face into the ground from the front; from our side the fired-up crest flopped back (the face tipping up takes the crest with it): the crest now stands up golden through the aura, the face a little less far up
- [x] `status_target`: Growl (showcase, roar), Mimic (glare), Toxic (powder, spat from the beak) — a chick's fierce scolding: rears back drawing breath, thrusts its head at the foe with the beak wide, crest up and wing tufts flared (emit at 0.17 s, as the game's noise lines leave), then scolds, the body pumping with each cry as the head shakes from side to side; the beak shuts
  - fixed after review: the head pitched down with the lunge (the cry went into the grass); from our side the crest flopped back through the head shake. The face stays up at the foe and the crest stands, the head shaking more than it rolls, the body pumping (it held still under the shaking head)

## Motif clips

- [x] `peck` (peck): Peck — cocks its head back, then the whole body drives the beak forward and a little down at the foe with the wing tufts swept back (impact as the beak lands), rebounds and gives its head a shake
  - fixed after review: the first jab dived crown first like a headbutt; the beak leads now, the face on the foe
- [x] `tackle` (tackle): Quick Attack, Facade, Secret Power — a quick dip and pull-back, then it darts headlong at the foe crown first with the wing tufts swept back and the crest streaming (impact), bounces off and settles; from our side the collar rises and the crest flattens toward the foe
- [x] `burrow` (burrow): Dig — head down, it scratches at the ground with both feet in turn (dig: the dirt flies), coils low and bursts up out of it, stretched tall with its beak open (impact); the game plays it on both turns (its sprite sinks as it scratches, and rises)
  - fixed after review: the burst up led with the crown and read as a second headbutt; it stretches up tall now
- [x] `breath` (breath): Fire Spin, Flamethrower — a quick breath in with the chest up and the eyes shut (charge), the head drives forward and the fire pours from the beak in bursts, the body pumping with each while the head sweeps (release to releaseEnd), the beak shuts and it shakes off the heat
- [x] `throw` (throw): Swift, Rock Tomb, Rock Slide — winds up with the wing tufts drawn back and the body turned, then whips round and flaps them forward hard, twice, bobbing with each flap; the stars leave the wing tufts (`emitterFor.throw: wings`), the rocks fall on the foe from above
  - fixed after review: two small flaps with the body still read weakly at the GBA's pixels; the body twists into each flap now and the flaps are bigger
- [x] `fling` (fling): Mud-Slap — weight onto its right foot, the left foot scrapes back through the mud and flicks it forward low along the ground as the body rocks back (release from the foot: `emitterFor.fling: feet`), stamps back down
  - fixed after review: the foot flicked up in front of the face and read as a raised hand; it kicks low now
- [x] `sound` (sound): Snore — asleep on its feet, eyes shut, it snores twice (the head tips back with the beak open and the body swells, then droops; a release on each snore), and wakes with a start
- [x] `kick_sand` (kick_sand): Sand-Attack — weight back onto its left foot, the right foot draws back along the ground, then kicks forward low, flinging sand at the foe (emit on the kick), stamps back down; from our side the rock back reads above the text box
  - fixed after review: the kicking foot came up to face height (a raised hand again); it kicks low along the ground now
- [x] `shield` (shield): Protect, Endure, Substitute — hunkers down behind its wing tufts swept forward over its chest, eyes squeezed shut and crest flat, trembling (aura), then pops back up
  - fixed after review: the hunker bowed the face into the ground from the front; the face stays on the foe
- [x] `weather` (weather): Sunny Day — dips with its eyes shut, then rises with its face turned up to the sky, beak open, crest standing and wing tufts spread, swaying happily from side to side as it basks and chirps with happy eyes (aura), comes back down content
  - fixed after review: from our side the face turned up laid the crest flat back; it stands now
- [x] `heal` (heal): Rest — a big yawn, then it settles down onto its bottom and dozes off, head drooping to one side, breathing slowly and deeply while it heals (aura), and wakes refreshed
- [x] `charm` (charm): Attract, Swagger — a coy little act: the head tilts one way then the other with happy eyes, the tail wagging behind, a bob and a cheep (emit)
- [x] `afterimage` (afterimage): Double Team — ducks and weaves from side to side on the spot, quick as a chick, wing tufts up; the game's afterimages swing out on both sides from the aura
  - fixed after review: the first weave was too small to read; wider now
- Also mapped: strike and kick → `physical_weak`; tackle_strong, slam and punch → `physical_strong` (Seismic Toss, which has no toss clip, falls back to it too); spit → `special_weak`; spit_strong, burst and orb → `special_strong`; buff → `status_self`; roar, glare and powder → `status_target`

## Showcase moves in battle

- [x] a full battle with torchic as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
      (`tools/gauntlet/check.mjs --render`)
- [x] in the compiled game (`game.html?battle=`): ours at level 5 against a
      Zigzagoon (`TORCHIC:5,ZIGZAGOON:2,GRASS`: the send-out, Scratch,
      Growl) and at level 10 against a Magikarp (Ember), hit and knocked out
      by a wild Swampert's Muddy Water (`TORCHIC:5,SWAMPERT:50,GRASS`); the
      wild one appearing, using Growl, Focus Energy and Ember, and knocked
      out by our Swampert's Take Down (`SWAMPERT:50,TORCHIC:5,GRASS`,
      `MAGIKARP:14,TORCHIC:10,GRASS`). The body acts in place on the game's
      sprite motion, its cries and spits land with the game's own effects,
      and the hit reads through the game's blink. Watched on a base before
      the remake layer's faint and background-copy fixes (d385e08): there
      the faint followed the sprite's slide into the ground, and Take Down's
      target showed its 2D copy
