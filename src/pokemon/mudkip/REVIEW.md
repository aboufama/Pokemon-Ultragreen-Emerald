# Mudkip review log

Every clip, watched frame by frame from both sides: contact sheets of each
move performed as the battle does, against itself (every 6 frames, the enemy
block then the player block, with a zoom on the first blow), each situation
played on its own, and the gap between the two bodies read at every blow
(in the foe's heights, both sides, at all four stop-motion phases the battle
can start a move on; 0.1 or less lands); then the healthbox clearance
(`tools/gauntlet/uiclear.mjs`) for every clip played at home. Reviewed
against the checklist: anticipation before the action · a contact move
leaps to the foe and the blow lands on its body, then it comes home ·
follow-through after it · arcs, no sliding (feet planted or clearly
airborne) · the effect leaves the right emitter · it is *that* move's action
(reference/move-actions.md) · the silhouette reads from our side (back view,
cropped by the text box) and from the opponent's side · starts and ends on
the stance.

How it travels: a pup that is mostly head, light and bouncy. It crouches
back onto its haunches (the coil), springs into a bounding pounce with all
four feet off the ground, the front paws reaching and the hind legs kicking
out behind (0.2-0.35 of its height up; a second bound for the running
charges), lands front paws first in front of the foe and closes the last
0.15 of its height with the blow itself (its crown, its paws, its tail fin,
its whole body), and bounces home in two hops, curled at the top of each.

Rig notes that shaped every clip:

- Mudkip is mostly head (the head bone moves 974 of its vertices), so its
  head, jaw and head fin trail the body by 0.045 s (index.ts `overlap`);
  head-led blows land about 0.04 s after their key.
- The fin on its head rides the head. Thrown back with the head, it points
  at our camera and from behind the head reads as a round stub: every pose
  that tips the head back keeps the fin upright (`finUp`).
- The front legs are planted by IK like the hind legs; rearing or pawing
  frees them (`plantFront`).
- A blow's gap is read from the pose on screen, which stop motion (15 poses
  a second) may have sampled up to four frames before the impact: every blow
  is on the foe by then (build note: a blow timed mid-travel read short at
  some phases).

## Situations

- [x] `idle`: the life layer's breathing, weight shift and gaze drift, a slow head tilt and an easy wag of the tail fin; head fin and tail fin sway on springs; the loop point is the stance
- [x] `intro`: curled up small with its eyes shut, it pops up onto its haunches with its head thrown up and its mouth wide in a cheerful cry (a moving hold, the head swaying), comes down onto its front paws and settles with a wag
- [x] `hit`: a 3-frame snap into a wince, the head back and the tail fin flicking up, hurt eyes; recovers
- [x] `hit_strong`: knocked back onto its haunches and skidded back, front paws lifting, then plants itself and shakes its head hard; reads bigger than `hit` from both sides
- [x] `faint`: a tired sway with its eyes half shut, then its legs fold and it lies down on its belly like a sleeping pup, head resting tilted, tail fin curled round, eyes shut, and shrinks away (worn out, never dying)
- [x] `dodge`: a quick hop to its left ducking low, the tail fin swinging, and a bounce back on guard
  - fixed after review: the landing came 0.1 s after the hop's snap (a hitch); a beat later
- [x] `unaffected`: blinks at the foe unimpressed, tilts its head and gives a dismissive flick of its tail fin
- [x] `return_home`: from the foe it coils and bounces home in two hops
- [x] `status_sleep`: its eyes droop, its head nods, nods again and sinks, a slow sway, then it straightens
- [x] `status_poison`: a sickly shudder, hunched low with its head hanging and the tail fin drooping, wincing
- [x] `status_burn`: yelps and hops up off its feet, lands and turns to lick at the burn, then shakes it off
  - fixed after review: the turn back from licking was a rush (83° in 0.14 s); a beat longer with a breakdown
- [x] `status_paralysis`: seizes rigid, legs locked stiff and splayed, head jerking with each jolt, tail fin twitching
- [x] `status_freeze`: locked mid-crouch, straining in tiny tremors, eyes squeezed shut
- [x] `status_confusion`: wobbles off balance, its head swimming round in a slow circle, a stagger each way
- [x] `status_infatuation`: sways dreamily with its head tilted and happy eyes, the tail fin wagging slowly
- [x] `status_curse`: flattens itself low in pain, head pressed down and tail fin clamped, shuddering
- [x] `status_nightmare`: asleep, it writhes: the head tossing, a front paw twitching up, whimpering
- [x] `status_wrapped`: strains outward against the bind twice, legs braced stiff and head thrown up, grimacing
- [x] `idle_asleep`: a loop: lying on its belly, head resting tilted on its paws, eyes shut, slow deep breaths
- [x] `idle_tired`: a loop: panting with its mouth open and its head low, the tail fin drooping, still facing the foe
- [x] `stat_up`: rears up proudly onto its haunches, front paws raised, chest out, a fierce little cry
- [x] `stat_down`: shrinks back low and small, head drawn in, tail fin tucked, unsteady
- [ ] `level_up`: a happy bounce straight up, all four feet off the ground, then a proud cry and a wag
  - fails the clearance from our side (the bounce took the head fin 29 px under the foe's box, frame 16): to fix
- [x] `drained`: sags as the energy leaves, head dropping and legs wobbling, then steadies
- [x] `healed`: a long happy breath out, eyes shut, and a wiggle all over
- [x] `focus`: crouched low and coiled, the head fin tipped at the foe, still but for a tremor
- [x] `hang_on`: staggers, legs buckling, catches itself and stays up, teeth gritted
- [x] `flinch`: jerks back onto its haunches with its eyes shut, falters, shakes its head
- [x] `recharge`: head hanging, panting hard, too worn out to move
- [x] `wake`: jolts awake, blinks, shakes the sleep out of its head, back on guard
- [x] `shake_off`: a hard wet-pup shake from head to tail, a stamp of its front paws, back on guard
  - fixed after review: the shake turned 63° in 0.12 s (a rush); smaller and quicker
- [x] `break_free`: bursts back out with a bounce, shakes itself, stamps crossly and yaps, settles
- [x] `weather_rain`: turns its face up into the rain with happy eyes, wagging its tail fin (a Water type in its element)
- [x] `weather_sun`: squints and turns its face away from the glare, head ducked, then peers back
- [x] `weather_sand`: braces low with its head turned from the wind and its eyes shut, tail fin clamped
- [x] `weather_hail`: flinches as the stones strike, flattening itself with its head ducked, a shiver

## Moves

Head and body (the worst gap at the blow over both sides and the four
stop-motion phases, in the foe's heights):

- [x] `tackle`: coils, wiggles once, pounces in one long bound and bowls into the foe crown first as it lands, bounces off rocking back onto its haunches, shakes its head and hops home (0.02)
- [x] `take_down`: lowers its head like a bull and scrapes the ground twice with a front paw, charges in two bounding strides and rams the foe, pressing through it; the recoil rocks it back wincing and it shakes its head (0.01)
  - fixed after review: the paw scrapes snapped into poses the next key undid (hitches); they flow now
- [x] `double_edge`: wiggles its haunches like a cat about to spring, three bounding strides and a flying dive stretched out, crashes into the foe; the recoil throws it back dazed (0.02)
- [x] `body_slam`: a deep coil, a huge leap high over the foe with its legs splayed, and it belly-flops down on top of it, pushes off and hops home (0.01)
  - fixed after review: it came down a quarter of a height short of the foe, and at one stop-motion phase the pose on screen was still falling at the impact (0.19): now it lands right on top and is down before the impact
- [x] `return`: grinning, bounces on the spot twice, bounds in with two happy hops and bumps its forehead into the foe, head tilted, and bounces home wagging (0.02)
- [x] `frustration`: stamps its front paws in a huff, pounces and bashes the foe with a spiteful sideways swing of its head, then turns its head away with a huff (0.01)
  - fixed after review: the huff turned 82° in 0.12 s (a rush); smaller and a beat longer
- [x] `facade`: hunches wincing, shakes it off with a set jaw, pounces and rams the foe with its crown, holding its ground pressing in (0.01)
- [x] `secret_power`: a short dip, one low quick pounce, a butt with the crown held into the foe, and one hop home (0.01)
  - fixed after review: the butt left the foe before the impact at some phases; it is held into it now
- [x] `endeavor`: scrambles forward low in skittering hops and dives at the foe's legs, front paws wrapped round it and its head pressed in, clinging on; pushes off and hops home panting (0.01)
- [x] `struggle`: eyes heavy, lurches in a clumsy low hop, stumbles, bumps the foe weakly with the side of its head, winces and wobbles home (0.03)
- [x] `strength`: pounces in, rears up to plant its front paws on the foe, sinks onto its haunches to load, then heaves with paws, head and shoulders, the hind legs driving (0.01)
  - fixed after review: the heave ended 0.09 short at one phase; it shoves further in
- [x] `rock_smash`: pounces up high, draws its head back at the top and brings its crown smashing down onto the foe as it drops, sinking into the blow (0.01)
- [x] `stomp`: bounds in, rears up tall on its hind legs with its front paws raised high, and stamps them down onto the foe, grinding (0.01)
  - fixed after review: at two stop-motion phases the paws were still coming down at the impact (0.13, 0.32 short); the impact now comes as they land
- [x] `waterfall`: bounds in low, drops into a deep crouch right under the foe and launches straight up through it nose first like a fish leaping a fall, comes down and hops home (0.04)
  - fixed after review: the leap rose in front of the foe (0.4 short); it surges up through it now
- [x] `iron_tail`: bounds in, springs up spinning so its tail fin swings round and slams down on the foe as its back comes round, holding on it through the blow, lands facing it and hops home (0.02)
- [x] `rollout` (and Ice Ball, the same action): curls into a ball and rolls at the foe over and over, bowls into it and grinds against it, rolls back home and uncurls with a shake (0.01)
  - fixed after review: the ball rolled about its feet, bobbing a quarter of its height, and at one phase it was a whole height off the foe at the impact; the ball's middle is at the root now, so it rolls about it
- [x] `bide_charge`: hunkers down with its eyes shut and its tail fin stiff, trembling harder and harder with the stored energy (charge), then eases
- [x] `bide`: still quivering, it launches itself at the foe in one explosive flat pounce and rams it with everything it took, pressing through, bounces off and hops home (0.02)
  - fixed after review: the first version butted three times; the second butt landed while the foe blinked from the first (no body to measure) and three small butts read weaker than one big release

Burrows:

- [x] `dig_charge`: scrabbles at the ground with its front paws, faster and faster, the dirt flying (dig), noses into the hole and dives in head first, the tail fin going under last
- [x] `dig`: tunnels over and bursts up out of the ground right under the foe crown first (impact as it breaks the surface), flips down onto its feet, shakes the dirt off and hops home (0.01)
  - fixed after review: it burst up a third of a height in front of the foe; it breaks the surface right under it now
- [x] `dive_charge`: coils, springs up in an arc and plunges in head first like a diver (dig: the splash), front paws together ahead of it
- [x] `dive`: swims over and leaps out in a dolphin's arc right into the foe (impact as it clears the surface), comes down with a splash, shakes the water off and hops home (0.05)
  - fixed after review: as Dig, it breached in front of the foe; now into it

Water, ice, mud and cries (from home; the effect leaves the mouth unless noted):

- [x] `water_gun`: a dip, a quick gulp with the head up and the mouth shut tight, then the head snaps forward and down and the jaw drops as the jet shoots out, braced on all four feet; a bob as it shuts
- [x] `hydro_pump`: plants all four feet low and draws a deep breath with its head up (charge), fires; the jet pushes it back onto its haunches a little further every beat while its head sweeps the stream; shakes the water off
- [x] `water_pulse`: blows a ball of water at its open mouth, bobbing as it swells and pulses twice, draws its head back and flings it with a toss of its head
- [x] `whirlpool`: spins round on the spot in two quick hops, its tail fin sweeping the water round (charge), lands facing the foe and thrusts its head at it
- [x] `hidden_power`: settles back on its haunches, eyes shut, still but for its head fin quivering as the orbs gather (charge), then snaps its eyes open and its head forward and sends them
- [x] `ice_beam`: draws in a cold breath, head raised, frost at the mouth (charge), then lowers its head, braced, and fires a straight beam, rigid with a tremor; shivers the chill off
- [x] `blizzard`: rears up onto its haunches with its face to the sky and cries the storm up, front paws raised, then drops onto its front paws and roars the blizzard out, the head sweeping it across the foe
- [x] `icy_wind`: a long breath in (charge), then a wide cold wind, the open mouth sweeping slowly across the foe and back; shivers
- [x] `mirror_coat`: braces low with its head tucked, its body shining as it takes the blow (charge), trembling, then throws its head up with a cry and turns it back
- [x] `rock_tomb`: rears up on its hind legs with its front paws raised high and stamps them down with all its weight; the rocks crash down round the foe (release from the paws)
  - fixed after review: the stamp was a rush (55° in 0.1 s); it comes down over 0.12 s
- [x] `surf`: crouches, rears up tall as the wave rises, front paws raised as if riding the crest, and dives forward into the ride as the wave crashes over the foe; a shake
- [x] `mud_slap`: rakes up a pawful of mud with its right front paw, rocks back onto its haunches and flicks it up into the foe's face with a swipe of the paw (release from the paws), shakes its head
  - fixed after review: the first version scooped with its chin and spat the mud; Mud-Slap is scooped with a hand (here a paw) and slapped at the face (move-actions.md)
- [x] `snore`: asleep standing, head drooping, it draws a huge breath and snores a blast at the foe, shuddering, then slumps again
- [x] `uproar`: yaps at the foe three times, bouncing on its front paws between the cries, each thrown harder

Status (at home):

- [x] `growl`: leans in low, head down and jaw half open in a cute little snarl, the head fin tipped forward and the tail fin stiff, growling with small shakes of the head (emit from the mouth)
  - fixed after review: the first growl reared back and roared; Growl is a cute growl, head low (move-actions.md)
- [x] `foresight`: the head fin is its radar: leans in with narrowed eyes and tips the fin forward at the foe, peering side to side (emit from the fin)
- [x] `mud_sport`: paws the mud up, then flops down on its belly and wallows in it, wriggling side to side with its tail fin slapping, coating itself, and gets up with a happy shake (emit from the paws)
  - fixed after review: the first version pawed and shook itself; Mud Sport rolls and splashes in mud, coating itself (move-actions.md)
- [x] `protect`: hunkers down low on four planted feet, head tucked, eyes shut, tail fin wrapped down, squeezing down in shaky breaths behind the barrier
- [x] `toxic`: gulps with the head pulled back, rocks back, then lunges its head forward and spews the poison in two heaves; spits the taste out
- [x] `hail`: turns its face up to a cold sky and cries for the hail (aura), then hunches down shivering as the first stones come
- [x] `rain_dance`: a pup's happy dance: bounces on its front paws left, right, its tail fin wagging, then rocks back onto its haunches with its face to the sky and a joyful cry
- [x] `double_team`: darts side to side in quick low hops, landing low each time with its head held on the foe; the afterimages swing out from the aura
- [x] `rest`: a big yawn, then lies down on its belly, head resting on its paws, eyes shut, slow breaths while the Z's rise; gets back up
- [x] `attract`: cocks its head coyly with happy eyes and wags its big tail fin at the foe, bobbing with each wag (emit: the hearts from the tail fin)
- [x] `swagger`: a cocky prance, head high and chest out, high steps of its front paws, tail fin swishing, and a smug toss of its head
- [x] `mimic`: watches the foe with its head cocked one way then the other, then copies it with a bob of its head and a flick of its fin
- [x] `substitute`: scrunches down small, trembling, then pops up with a shake (the doll appears) and hops back a little
- [x] `endure`: digs all four feet in with its head lowered, teeth gritted, trembling harder as the power builds, then shakes itself
- [x] `defense_curl`: lies down and curls up tight, head tucked, paws drawn in, tail fin wrapped round, holds, uncurls
- [x] `refresh`: shakes itself off like a wet pup, head swinging against the body, then stands tall and happy
  - fixed after review: the shake was a rush (74° in 0.14 s); smaller
- [x] `curse`: slows and sinks heavily, head hanging and eyes glaring up from under its brow, trembling as the power grows; a lash of the tail fin
- [x] `sleep_talk`: fast asleep standing, head nodding, mumbling, perks up still asleep with a happy little cry (aura), nods off again

Ice Ball plays `rollout` (the same action: src/battle3d/actions.ts). A
move outside its movepool plays the clip of its motif (`motifClips` in
index.ts: every motif is mapped). Each move's body part is in moves.json,
set by hand from the clips (Jev, tools/gauntlet/classify_moves.mjs, needs a
TYPESAFE_API_KEY this session did not have).

## Clear of the healthboxes

Pass in progress (tools/gauntlet/uiclear.mjs; build/uiclear_rest.mjs
finishes a stopped pass): from our side every clip from `idle` to `snore`
is clear but `level_up` (29 px under the foe's box: the bounce is too
high), still to fix; the rest of our side (from `stat_down`) and the whole
foe's side still to measure.

## Battles

- [x] a full battle with mudkip as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
- [x] the compiled game's test battle both ways: contact moves leap to the
      foe and land as the game's hit effects flash, then come home

The compiled game's test battles (tools/remake/run.mjs with the page's
hold, a frame every 8), Mudkip as ours against a wild Zigzagoon and as the
wild one against our Torchic, Tackle both ways: the intro reads both ways
(the wild one in shadow as the field slides in, then up on its haunches
crying; ours out of its ball the same, the head fin under the foe's
healthbox), and the pounce lands on the foe as the game's hit splat
flashes on it, then it bounces home; the foe's Tackle back lands on it and
it flinches.
