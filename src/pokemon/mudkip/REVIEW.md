# Mudkip review log

Every clip, watched frame by frame from both sides: contact sheets at
`--density 2` (every 4-5 frames, cropped to each slot) while iterating and
the moments at `--density 3`, then the GIFs at game resolution
(`tools/shots/clip_gifs.mjs`, tiled every 3 frames), and the compiled game's
test battles filmed frame by frame (`tools/remake/run.mjs`): our Mudkip in
`MUDKIP:10,ZIGZAGOON:8,GRASS` (send-out, Tackle, Growl, Mud-Slap, Water Gun)
and the wild one in `TORCHIC:10,MUDKIP:10,GRASS` (its entrance, Mud-Slap,
Growl, Water Gun) and `TORCHIC:10,MUDKIP:5,GRASS` (Tackle, a hit, its faint).
Reviewed against the checklist: anticipation before the action ·
follow-through after it · arcs, no sliding (feet planted) · the effect leaves
the right emitter · the silhouette reads from our side (back view, cropped by
the text box) and from the opponent's side · starts and ends on the stance.

Acting in place: no clip travels (`advance` 0, the root on its spot). The
game's own sprite motion (Tackle's 16 px lunge, Take Down's wind-up and
lunge, Mud-Slap's jerk back) carries the body, and the clips are timed to
it: the ram lands on Tackle's lunge (the splat on frame 6), the chin scoop
on Mud-Slap's jerk back and the toss as the clods fly, the spit as Water
Gun's water leaves (frame 1), the open mouth with Growl's double cry.

Rig notes that shaped every clip:

- Mudkip is mostly head (the head bone moves 974 of its vertices), so its
  head, jaw and head fin trail the body by 0.045 s instead of the default
  0.065 (index.ts `overlap`): with the default, the wild Mudkip's ram came
  four frames after the game's lunge and splat.
- The fin on its head rides the head. Thrown back with the head, it points
  at our camera and from behind the head reads as a round stub (the send-out
  cry, Growl's rear, the Mud-Slap toss all did). Every pose that tips the
  head back keeps the fin upright with a post rotation (`finUp`, 90% of the
  back-pitch). `bones.fin.x` does not: applied after the stance's twist, it
  tips the fin sideways.
- The front legs are planted by IK like the hind legs (`rig.frontLegs`);
  rearing up frees them part way (`plantFront` 0.3-0.5) so the chest can
  rise without the paws leaving the ground.

## Battle moments

- [x] `idle`: the life layer's breathing, weight shift and gaze drift, a slow head tilt and an easy wag of the tail fin (twice per tilt); the head fin and tail fin sway on springs; blinks; the loop point is the stance
- [x] `intro`: curled up small with its eyes shut, it pops up onto its haunches, head thrown up and mouth wide in a cheerful cry (happy eyes, the head swaying), comes down onto its front paws and settles with a wag of its tail fin; the cry comes as the ball's pink tint fades
  - fixed after review: the rear was bigger and later (the ball's tint hid the first half of it); from our side the fin, thrown back with the head, read as a round cap: now kept upright (`finUp`)
- [x] `hit`: a 3-frame snap into a wince, the head back and the tail fin flicking up, hurt eyes; the sprung knock-back carries it and it shakes it off
- [x] `faint`: a tired sway with its eyes half shut, then its legs fold and it lies down on its belly like a sleeping pup, head resting tilted, tail fin curled round its side, eyes shut, and shrinks away (worn out, never dying)
  - fixed for the healthboxes: as the foe, its head laid forward in front of its feet went under our healthbox (8 px): it settles back as it lies down
  - in the compiled game the faint was cut short (the body followed the game's sliding sprite and vanished when the game freed it): a remake-layer issue fixed on the branch (d385e08), not in this worktree's base

## Attack categories

- [x] `physical_weak`: Tackle (also Facade, Secret Power; Rock Smash, Rollout, Dig and Dive by fallback) — the head dips and the haunches load for an instant, then the hind legs drive and the head goes down so its crown and fin ram the foe on the game's lunge (impact on the splat, frame 6), it bounces off with the head flung up and shakes the daze out of its head, eyes squeezed shut
  - fixed after review: the head shake was too small to read at game size; in the compiled game the ram came 4 frames after the splat (it now drives by 0.07 s, the head trails less)
- [x] `physical_strong`: Take Down (also Double-Edge, Return, Frustration, Endeavor, Strength, Waterfall; Iron Tail and Body Slam by fallback) — backs into a low crouch with its head lowered like a bull while the game winds its sprite back, holds there quivering with its tail fin lashing, rams with everything on the game's lunge (splat on frame 35), presses through the foe, then the recoil: it rocks back wincing and shakes it off
  - fixed for the healthboxes: as the foe, the face driven down in front of its feet went under our healthbox (21 px): the ram drives with the hips and spine, the head no lower than Tackle's
- [x] `special_weak`: Water Gun (also Water Pulse; Whirlpool, Icy Wind, Rock Tomb and Snore by fallback) — a quick gulp with the head up, then the front of the body drives down at the foe with the head kept level so the wide jaws face it, braced on all fours while the water flies from the mouth, then the mouth shuts and the head comes back up
  - fixed after review: at game size the first spit was too small to read, and from the front the pitched-down head showed the fin rather than the mouth
- [x] `special_strong`: Hydro Pump (also Ice Beam; Surf, Blizzard and Hidden Power by fallback) — plants its feet low with the head up drawing breath, fires from its wide jaws; the jet pushes it back onto its haunches a little further every beat while its head sweeps the stream across the foe; the mouth shuts and it shakes the water off
  - fixed after the fluidity pass: the jet's hold was a dead hold (0.4 s); now it is pushed back beat by beat with a wider sweep
- [x] `status_self`: Protect (also Endure, Substitute, Defense Curl; Sleep Talk and Double Team by fallback) — hunkers down low on four planted feet, head tucked, eyes squeezed shut, tail fin wrapped down, and braces behind the barrier for as long as the game shows it, squeezing down in shaky breaths; then it rises
  - fixed after the fluidity pass: the brace was a dead hold (0.9 s)
- [x] `status_target`: Growl (Toxic by fallback) — rears back onto its haunches drawing breath, lunges its head at the foe with the mouth wide and growls through both of the game's cries, the head swaying; the noise lines leave the mouth
  - fixed after review: at game size the growl was too small; the lunge now drops the chest and raises the face so the open mouth faces the foe, and the rear keeps the fin upright

## Motif clips

- [x] `bide` (moveClips: Bide) — the game plays Bide's clip on the storing turns and on the unleashing one: it hunkers down trembling with its eyes squeezed shut and its tail fin stiff, then bursts into three quick butts of its head, an impact on each (on the unleashing turn the game's lunge carries them into the foe), and settles
- [x] `fling` (fling: Mud-Slap, from the mouth) — it scoops mud with its chin, dipping its head to the ground on the game's jerk back, then tosses its head up and forward as the clods fly from its mouth at the foe, and shakes the mud off its face
  - fixed after review: the toss kept the fin upright (from our side the head read as a stub)
- [x] `glare` (glare: Foresight, Mimic) — the fin on its head is its radar: it leans in low with its eyes narrowed and tips the fin forward until it points at the foe, then peers from side to side, the fin following, and straightens up. The director's glint shows at its eyes
  - fixed after the fluidity pass: the peering was a dead hold (0.5 s); it now swings the head slowly with the weight shifting
- [x] `kick_sand` (kick_sand: Mud Sport) — paws at the mud with its front paws, right then left, raking it up, then shakes itself like a wet pup: the body rolls side to side and the head swings against it, splashing mud about
  - fixed after review: the first wiggle was invisible at game size
- [x] `weather` (weather: Rain Dance, Hail) — rocks back onto its haunches and turns its face up to the sky with happy closed eyes and its mouth open, calling the weather (a moving hold, the head swaying), then comes back down
- [x] `charm` (charm: Attract, Swagger) — cocks its head coyly with happy closed eyes and wags its big tail fin at the foe, bobbing on its front paws with each wag; the hearts float out from its chest, under its chin
  - fixed after review: bigger, slower wags (the first were lost at game size)
- [x] `heal` (heal: Rest) — a big yawn, then it lies down on its belly like a pup at the water's edge, head resting tilted and eyes shut, breathing slowly while the sparkles rise, and gets back up drowsy
- Also mapped (`motifClips`): tackle -> `physical_weak`, tackle_strong -> `physical_strong`, spit -> `special_weak`, jet and beam -> `special_strong`, shield -> `status_self`, roar -> `status_target`. The moves whose motifs have no clip of their own play their category clips (the "by fallback" moves above).

## Clear of the healthboxes

Measured with `tools/gauntlet/uiclear.mjs` (every clip, from both sides,
pixels past a box's 2 px edge): none goes past an edge from our side, and as
the foe only Take Down touches our box (1 px). Two clips needed it:

- `physical_strong` as the foe: the ram pitched the face down in front of
  its feet, 21 px under our healthbox; the ram now drives with the hips and
  spine and the head goes no lower than Tackle's (1 px).
- `faint` as the foe: lying down with its head laid forward in front of its
  feet, 8 px under our box; it settles back as it lies down (0 px).

From our side the foe's box sits just above the head fin, so every rear is
modest (the chest rises and the head tips back rather than the body rising).

## Fluidity

Measured with `tools/gauntlet/motion.mjs --species mudkip,blaziken` on the
joints as the battle animates them: over 24.0 s of clips, 7 stop-starts
(0.3 a second; Blaziken 29, 1.0 a second), 3 pops (all at the end of the
faint's shrink, where Blaziken's faint has 7), no dead holds (Blaziken 2)
and no clip turning in its first 0.3 s (Blaziken 1). The first pass had
three dead holds: the jet's recoil (0.4 s), Protect's brace (0.9 s) and
Foresight's peering (0.5 s); each is now a moving hold (pushed back beat by
beat, squeezing down in shaky breaths, the head swinging slowly).

## Showcase moves in battle

- [x] a full battle with mudkip as ours and as the opponent: the autoplay
      battles run to the end in the render gate, and in the compiled game's
      test battles every showcase move plays its clip on the game's beat from
      both sides (as ours: Tackle, Growl, Mud-Slap, Water Gun; as the wild
      one: Mud-Slap, Growl, Water Gun, Tackle, then its hit and faint)

## In the compiled game

Watched frame by frame in the test battles above. The send-out: curled in
the ball's pink tint, the cry as the tint fades, the fin upright through
it. The wild one's entrance: its shadowed curl, then the cheerful cry as it
appears. Tackle: the ram lands with the game's lunge and splat, and it
shakes the daze off after. Mud-Slap: the chin scoop on the game's jerk
back, the toss as the clods fly. Water Gun: the spit as the game's water
leaves the mouth. Growl: the lunge into both of the game's cries.

Two things looked wrong there that were the remake layer's, not the clips'
(fixed on the branch in d385e08, after this worktree's base): the faint was
cut short (the body followed the game's sliding sprite and vanished when
the game freed it), and a move that copies its target into a background
(`monbg`, e.g. Tackle's) showed the 2D copy around the 3D body.
