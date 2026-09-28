# Combusken review log

The set in `set.ts`: Blaziken's first clips (`../blaziken/first.ts`) and the
clips added since in their style (`../blaziken/more.ts`), ported to
Combusken's own stance, rig and proportions. Every clip watched frame by
frame from both sides (`tools/shots/fastsheet.mjs`, every 5 or 6 frames,
the key frames enlarged 2-3x), next to Blaziken's first clip for the same
moves, and its key poses in the rig lab's turntable. Reviewed against the
checklist: anticipation before the action · a contact move leaps to the foe
and the blow lands on its body, then it comes home · follow-through after
it · arcs, no sliding (feet planted or clearly airborne) · the effect
leaves the right emitter · it is *that* move's action · the silhouette
reads from our side (back view) and the opponent's side · starts and ends
on the stance.

What the port changed, for every clip:

- The stance stands on both feet (the front sprite's crane pose on one leg
  gave the character, not the pose): a wide split crouch, the right foot
  forward, the right claw raised at the foe and the left arm low and wide,
  as the sprite flings its arms. Its fit on the opponent's side is a
  documented exception in `tools/gauntlet/check.mjs` (IoU 0.44 against the
  one-legged sprite; box 0.84; our side 0.54 / 0.75; colour loss 0.69).
- Its legs are half as long as Blaziken's for its height and its stance
  already bends them further: the pelvis offsets are about 0.6 of
  Blaziken's (the same knee bend), the leaps a little higher (it is lighter),
  the timing Blaziken's.
- Its arms are long and end in one big clawed hand: the hands are never
  aimed (they carry on the forearm's line), and the guard holds the claws
  beside the head (held before the chest as Blaziken's fists are, they
  covered its face).

## Battle moments

- [x] `idle` (Blaziken's `idle`): breathing and a weight shift in the crouch, the crest, tail and waist feathers on springs, blinks; the loop point is the stance
- [x] `intro` (Blaziken's `intro`): curled in with the arms crossed and the eyes shut, bursts up into the cry with the arms flung wide (wide, not overhead) and the beak open, a head sway, settles through the guard to the stance; clear of the foe's healthbox from our side
- [x] `hit` (Blaziken's `hit`): snaps back with the hurt eyes and the arms thrown out, the sprung knock-back carries it, recovers without popping
- [x] `faint` (Blaziken's `faint`): a tired sway with its eyes half shut, then it curls down onto its heels with the arms folded and the head bowed, eyes shut, and shrinks away at its `shrink` (worn out; it sits back as it curls, clear of our healthbox)

## Attack categories

- [x] `physical_weak` (Blaziken's `physical_weak`, the Slash): Scratch, Slash, Brick Break, Aerial Ace, Cut, Rock Smash, Fury Cutter, Smelling Salt (strike) — crouches with the right claw cocked high behind the head, one leap in along an arc, lands at the foe, the torso unwinds and the claw rakes down and across its body, carries through low and hangs, guard, hops home
- [x] `physical_strong` (Blaziken's `physical_strong`, the Blaze Kick): Mega Kick (kick_strong) — coils turned away, springs up high and in, chambers at the top of the arc turning side-on, the kick lands side-on with the leg out at the foe (the leg reads in profile from both sides), the spin carries round, lands deep facing the foe, hops home
- [x] `special_weak` (Blaziken's `special_weak`, the Ember): Ember, Fire Blast (spit), Toxic (powder), Hidden Power (orb) — draws breath with the head back and the elbows back, the head snaps forward and the ember leaves the beak, recoil, settles
- [x] `special_strong` (Blaziken's `special_strong`, the Flamethrower): Flamethrower, Fire Spin (breath) — settles, a deep breath with the beak to the sky and the embers gathering at it, the head drives forward and the stream pours from the beak while the head sweeps, the beak shuts and it shakes off the heat
  - healthbox pass: the brace holds the claws out at the hips and the body leans in with the spine (its long hands hung by the knees and the hips carried the planted feet forward: 13 px under our healthbox from the foe's side)
- [x] `status_self` (Blaziken's `status_self`, the Bulk Up): Focus Energy, Bulk Up, Mirror Move, Swords Dance, Sleep Talk (buff) — gathers in with the arms crossed and the eyes shut, snaps into a double-biceps flex with a tremor while the aura rises, relaxes
- [x] `status_target` (Blaziken's `status_target`, the Growl): Growl (roar), Mimic (glare), Snore (sound) — rears back with the elbows back, lunges the head at the foe with the beak wide, cries with the head swaying, the sound leaving the beak

## Motif clips

- [x] `kick` (Blaziken's `physical_weak_kick`, the Double Kick): Double Kick — leaps in with the guard up, lands, the right knee comes up high and the talons snap out at the foe's chest (impact), hang a moment and draw back, the left kick with the hips turning into it (impact), lands, hops home; two impacts, so each of the battle's two hits gets its own kick
  - after review: Blaziken's kicks go to the foe's hips; with Combusken's short brown legs they hid between the two bodies, so each knee chambers high and the kick goes to the chest with the body leaning further back. A held beat after the first kick before the knee draws back (the snap hitched straight into the retraction)
- [x] `kick_sand` (Blaziken's `status_target_kick`, the Sand-Attack): Sand-Attack — weight onto the back leg, the front foot draws back along the ground, kicks forward and up flinging the sand from the foot (emit), sets down
- [x] `punch` (Blaziken's `punch`, the Sky Uppercut): Sky Uppercut, Focus Punch, Mega Punch, Counter, DynamicPunch, ThunderPunch, Fire Punch — crouches with the claw-fist chambered low, dashes in low, plants coiled under the foe, drives up through it with the whole body (the feet leave the ground, the claw high overhead at the apex), drops into a crouch, hops home
- [x] `tackle` (Blaziken's `tackle`): Quick Attack, Frustration, Return, Facade, Secret Power, Strength, Double-Edge, Reversal, Struggle — a quick dip, a blur of a low dash with the shoulder leading and the arms swept back, the impact on the foe, bounces off and hops home
- [x] `peck` (Blaziken's `peck`): Peck; also Bite and the like called by Mimic or Mirror Move — cocks the head back with the guard up, one leap in, lands and coils with the arms swept back, the body and head drive the beak down into the foe, the head rebounds, hops home
- [x] `toss` (Blaziken's `toss`, the Seismic Toss): Seismic Toss — rushes in with the claws reaching and seizes the foe (grab), sinks with it, springs up and back toward mid-field heaving it up in front, spins round with it, hurls it down into its own place (throw) where it crashes (impact: rocks and dust), lands deep and watches, hops home. As in the reference, the carried foe brushes the top edge of the screen at the height of the spin
- [x] `burrow` (Blaziken's `burrow`, the Dig): Dig — crouches and drives the claws into the ground (dig: the dirt flies), sinks out of sight, the mounds heave across to the foe, bursts up under it knee first (impact), comes down in front of it and holds the crouch, hops home
- [x] `fling` (Blaziken's `fling`, the Mud-Slap): Mud-Slap — weight back, the right foot scoops the ground and flicks the clods at the foe's face (release from the foot: `emitterFor.fling: feet`), sets down
- [x] `afterimage` (Blaziken's `afterimage`, the Double Team): Double Team — quick darts side to side with the guard up while the two darkened afterimages swing out from the aura, back to the centre
  - healthbox pass: the darts keep the legs in the stance under the body (the foot IK holds them level) and those toward its left zig-zag back a little: from the foe's side the hop's freed feet swung forward and down onto our healthbox (24 px)

## Clips from `more.ts` (added in the first clips' style)

- [x] `shield` (Blaziken's `shield`): Protect, Substitute, Endure — flinches back with the arms drawing in, snaps the forearms up into an X before its face and sinks behind them with a tremor while the barrier forms, lowers its guard
- [x] `heal` (Blaziken's `heal`): Rest — lets go, sinks into a deep calm crouch with its arms folded and its eyes shut, breathes slowly under the sparkles, rises
- [x] `weather` (Blaziken's `weather`): Sunny Day — gathers with the arms crossed, then throws its chest open and its head back to the sky with the arms flung wide, a slow sway while the sun comes out, back down to its guard
- [x] `charm` (Blaziken's `charm`): Swagger, Attract — chest out and head cocked, holds a claw out to the foe and beckons it twice, smug, back to its guard
- [x] `burst` (Blaziken's `burst`): Overheat — curls in tight around the heat with the arms crossed, trembling, bursts open with everything (arms flung wide, head back) as the fire erupts, holds the blast, slumps, spent
- [x] `throw` (Blaziken's `throw`): Rock Tomb, Rock Slide, Swift — winds away with the left claw cocked back behind the shoulder, unwinds and whips the arm through level at the foe (the volley leaves the claw), carries through low across the body
- [x] `slam` (Blaziken's `slam`): Body Slam — a deep coil, a big leap high over the foe, tips forward with the arms spread and comes down on it chest first (impact), bounces off, lands deep, hops home
- Also mapped (`motifClips`): strike → `physical_weak`, kick_strong and spin → `physical_strong`, spit, orb and powder → `special_weak`, breath and beam → `special_strong`, buff → `status_self`, roar, glare and sound → `status_target`, bite → `peck`, wing → `physical_weak`
