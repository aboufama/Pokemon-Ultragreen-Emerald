# Marshtomp review log

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

The model, rig, stance and calibration: the Pokemon-3D-api model (40
joints, the same naming as Mudkip's and Swampert's), optimized; the stance
from both sprites, facing the foe: squat and square on short, toughened
legs, knees out, both arms raised in a Y with the hands open at head height,
the grin, the two tail lobes splayed on the ground behind its feet, the head
fin turned so its broad face shows from both cameras. Calibrated: height
1.1801, opponent side IoU 0.7473 (box 0.9056), player side 0.7024 (box
0.9185), color loss 0.6487. Springs on the head fin and both tail lobes.

How it travels: a young wrestler who has just learned to stand, sturdy and
grounded, lighter and quicker than Swampert and never springy like a
fighter. It crouches, bounds in with a stocky leap (0.08-0.13 of its height
up; a second stride for the running charges), lands flat-footed in a squat
right in front of the foe, throws its weight behind its arms or its big head
to close the last 0.15 of its height with the blow, and hops home landing in
a squat. Its evolution's choreography, re-timed quicker (x0.88) with
springier hops (x1.3) on its own stance and kit: no neck (its head carries
the upper body), one head fin, two tail lobes, arms that rest up in a Y.

## Situations

- [x] `idle`: slow breathing through the grin, the life layer's weight shift and gaze drift; the head fin and tail lobes sway on springs; the loop point is the stance
- [x] `intro`: curled low with its eyes shut, a low hop with its fists pulled up by its shoulders, lands in a squat, then rears and cries with both arms up in a narrow V, and brings them down the front into its Y
- [x] `hit`: a 3-frame snap into a flinch, hands jerking up before its face, hurt eyes; digs back in
- [x] `hit_strong`: shoved back further with a stagger step and a shake of the head, then digs in
- [x] `faint`: a tired sway, then it settles back onto its heels hunched over with its arms folded low and its head bowed, eyes shut, and shrinks away (worn out, never dying)
- [x] `dodge`: a quick stocky side-hop to its left ducking low, a grappler's guard, and back
- [x] `unaffected`: stands firm with narrowed eyes, a small shrug with the palms up in front, a slow shake of the head
- [x] `return_home`: from the foe it sinks, pushes off in one hop and lands home in a squat
- [x] `status_sleep`: a drowsy sway, eyes drooping shut, the head sinking onto its chest, slow breaths
- [x] `status_poison`: a sickly shudder, hunched over its belly with its arms folded, wincing
- [x] `status_burn`: jerks from the burn and flaps its scorched left arm to cool it, wincing away from it, then shakes it off
- [x] `status_paralysis`: seizes rigid with its arms locked stiff and splayed down, twitching with each jolt
- [x] `status_freeze`: locked with its fists clenched to its chest, straining in tiny tremors
- [x] `status_confusion`: wobbles off balance, a stagger step each way, the head swimming round
- [x] `status_infatuation`: sways dreamily, head tilted and hands clasped at its chest, happy eyes
- [x] `status_curse`: doubles over in pain with its fists at its belly, shuddering
- [x] `status_nightmare`: asleep on its feet it writhes, the head tossing and an arm jerking up
- [x] `status_wrapped`: arms pinned to its sides, it strains outward against the bind twice
- [x] `idle_asleep`: a loop: slumped where it stands, head bowed on its chest, arms hanging, slow deep breaths
- [x] `idle_tired`: a loop: panting through the open mouth, the arms sagging low, still facing the foe
- [x] `stat_up`: draws itself up, chest out, and flexes both arms with a fierce grin
- [x] `stat_down`: shrinks back hunched and unsteady, arms drawn in
- [x] `level_up`: a proud little hop, then its arms go up in front and it cries out
- [x] `drained`: sags as the energy leaves, the head drooping, then steadies itself
- [x] `healed`: a long breath out, shoulders dropping, happy closed eyes
- [x] `focus`: sinks low, the right fist chambered at its hip and the left hand held out, still but for a tremor
- [x] `hang_on`: staggers back, knees buckling, catches itself and stays up gritting its teeth
- [x] `flinch`: jerks back with its hands up and falters, then shakes its head
- [x] `recharge`: spent, head hanging and arms dangling, panting heavily
- [x] `wake`: jolts awake, blinks, shakes the sleep off, back on guard
- [x] `shake_off`: a hard shake of its head and shoulders, a stamp and back on guard with a snort
- [x] `break_free`: bursts back out with its arms flung up, shakes itself, stamps and cries, settles
- [x] `weather_rain`: in its element: face turned up into the rain, arms opened in a narrow V, happy eyes, bobbing
- [x] `weather_sun`: squints and raises a hand to shade its eyes, peering at the foe from under it
- [x] `weather_sand`: braces low with a shoulder into the wind, shielding its eyes behind its forearm
- [x] `weather_hail`: flinches as the stones strike, hunching with its forearms over its bowed head

## Moves

Fists (the worst gap at the blow over both sides and the four stop-motion
phases, in the foe's heights):

- [x] `mega_punch`: sinks and winds the right fist far back, shoulders turned away, hops in with it cocked, lands in a squat and coils once more, then unwinds hips and shoulders into a straight right that drives into the foe's middle, leans through, hops home (0.00)
- [x] `dynamic_punch`: a slow wind-up, the right arm swung back behind its head, trembling; a leap in and an overhand driven down through the foe with the body behind it; a beat of stillness, home (0.01)
- [x] `ice_punch`: the left fist set by its shoulder, hops in, snaps the left arm out dead straight into the foe and locks it there trembling, pulls back, home (0.01)
- [x] `counter`: braced behind its forearms and rocked back by the blow, then springs at the foe with its right arm drawn across and swats a big backhand out through it (0.01)
- [x] `rock_smash`: both fists clasped high as it hops in, drawn back behind its head as it lands, clubbed down onto the foe as onto a boulder (0.01)
- [x] `strength`: a hop in with its arms spread, palms set on the foe, a deep squat to load, then one mighty two-handed shove, the legs driving (0.00)
- [x] `seismic_toss`: a bear hug and a slam: arms flung wide, a hop in, the arms close round the foe (grab), it sinks straining, heaves it up against its chest and leaps straight up spinning round once, hurls it down into its place (throw) and drops after it to land crouched over it as it crashes (impact), then hops home (0.01)

Legs:

- [x] `mega_kick`: a run-up of two stocky strides, the right knee chambered high in the second leap, lands braced on its left foot side-on and drives the right leg straight out into the foe sole first, arms flung back for balance, hops home (0.05)
- [x] `stomp`: hops in, jumps with its right knee drawn high and its arms out, comes down with the foot on the foe, grinds, steps off and hops home (0.01)
  - fixed after review: at two stop-motion phases the foot was still coming down at the impact (0.13 short); the impact now comes as it lands
- [x] `earthquake`: a sumo's shiko at home: weight onto the right leg, the left raised high out to its side with the left arm out and the right across its chest (all to its left, clear of our healthbox from our side), the body tipping away over the standing leg (the tip its bigger evolution had to give up for our box), held at the top, then stamped down into a deep squat with its hands slammed onto its knees as the ground heaves (impact on the stamp)

Whole body:

- [x] `tackle`: sinks with its right shoulder back, hops in low and slams the shoulder into the foe, the whole body lunging through, rebounds shaking its head and hops home (0.00)
  - fixed after review: the impact came mid-lunge (0.17 short at one phase); now as the shoulder lands
- [x] `take_down`: lowers its head like a bull and scrapes a foot, two stocky strides and a crash into the foe head and shoulders first; the recoil rocks it back wincing, it shakes its head and hops home (0.01)
- [x] `double_edge`: backs off pawing twice, three pounding strides and a leap, throws its whole body into the foe arms first; the recoil throws it back clutching its head (0.01)
- [x] `body_slam`: a long coil with its arms drawn back, a leap high with its arms flung up, and it comes down belly first on top of the foe, shoves off and hops home (0.01)
  - fixed after review: it came down short of the foe, and at two phases it was still falling at the impact (0.57 short); now it lands on top and is down before the impact
- [x] `return`: grinning, bounces on its toes, bounds in with two happy hops and bumps the foe with its chest, arms flung wide, hops home pleased (0.02)
- [x] `frustration`: stamps its feet in a huff, stomps in and rams the foe with its right elbow thrown across, then a huff with a toss of its head (0.01)
- [x] `facade`: hunches wincing, then sets its jaw and drives in with a head-down ram, shoving through the foe with its crown (0.00)
- [x] `secret_power`: a short dip, a quick low hop and a butt with the crown of its head held into the foe, then one hop home (0.00)
  - fixed after review: the butt left the foe before the impact at some phases; it is held into it now
- [x] `endeavor`: crouches low, scrambles forward in stumbling hops and dives at the foe's legs, wrapping its arms round them and clinging on; pushes up and hops home panting (0.01)
- [x] `struggle`: eyes heavy, a clumsy hop with its arms whirling, bumps weakly into the foe, winces and stumbles home (0.02)
- [x] `bide_charge`: braced low with its fists clenched at its sides, teeth gritted, eyes shut, trembling harder and harder (charge)
- [x] `bide`: cries out the stored energy, hops at the foe and blasts it with both palms thrust into it together, the recoil throwing its head back (0.00)
- [x] `waterfall`: hops in low, drops into a deep crouch under the foe and surges up through it with its arms flung up, comes down and hops home (0.01)
- [x] `iron_tail`: hops in, then spins round in a hop so its two tail lobes swing round and slam down on the foe as its back comes round, holding on it through the blow, lands facing it and hops home (0.02)
- [x] `rollout` (and Ice Ball, the same action): curls into a ball and rolls at the foe over and over, bowls into it and grinds against it, rolls back home and uncurls (0.00)
  - fixed after review: the ball rolled about its feet and bobbed; its middle is at the root now, so it rolls about it

Burrows:

- [x] `dig_charge`: crouches and tears at the ground with both claws in turn, the dirt flying (dig), and sinks into the hole it makes, the head fin going under last
- [x] `dig`: tunnels to the foe and bursts up out of the ground right in front of it, both fists driving up into it (impact as it breaks the surface), comes down braced wide, glares and hops home (0.01)
- [x] `dive_charge`: rears back with its arms swung back, hops and plunges head first into the water (dig: a splash), the tail lobes going under last
- [x] `dive`: swims over and breaches up in front of the foe head and arms first, surging up through it (impact), comes down with a splash and hops home (0.01)

Water, mud, ice, rock and sound (from home; the effect leaves the mouth unless noted):

- [x] `water_gun`: a gulp of air, head back and elbows back, then the head snaps forward and the wide mouth spits the jet, braced
- [x] `mud_shot`: dips its head and gulps up mud, rears back swelling, drives its head forward and spits the burst of mud, wipes its mouth with a shake
- [x] `water_pulse`: gathers water between its cupped hands into a pulsing ball, squeezing it twice, draws it back, thrusts both hands and flings it (release from the hands)
- [x] `hydro_pump`: rears up drawing the water in (charge), drops into a wide squat brace and fires a sustained jet; the recoil pushes it back as it holds on
- [x] `muddy_water`: scoops down low with both arms, heaves them up the front as it rears, drives them forward and down; the wave rolls out from its feet
- [x] `surf`: crouches, rises tall as the wave rises, arms up in a narrow V riding the crest, then leans into the ride driving its arms forward and down as the wave crashes over the foe
- [x] `whirlpool`: stirs the water, both arms sweeping round in front of it, the body rolling with them (charge), thrusts both hands and the whirlpool closes round the foe
- [x] `ice_beam`: breathes cold into its hands cupped under its open jaw (charge), lowers its head, braced, and fires a straight beam, rigid with a tremor; shivers the chill off
- [x] `blizzard`: rears up with its arms flung up in a V calling the storm, then throws its head forward and roars the blizzard out, the arms swinging down into a wide, low brace, the head sweeping the snow across the foe
- [x] `icy_wind`: a long breath in (charge), then a wide cold wind from the open mouth sweeping across the foe and back; a shiver
- [x] `hidden_power`: arms spread low, palms up, while orbs gather about it (charge), rising slowly, then sweeps both hands forward and sends them
- [x] `mirror_coat`: braces behind its crossed forearms, its body shining (charge), trembling, then throws its arms open forward and turns the blow back
- [x] `rock_tomb`: squats and grips the ground, heaves a load of rock up to its chest, rears up with it and slams its arms down: the rocks crash round the foe (release from the hands)
- [x] `rock_slide`: tears into the ground with a low sweep of its right arm, twisting into it, then unwinds and flings the arm up and over, hurling the rocks (release from the hands)
- [x] `mud_slap`: a two-handed scoop: squats, digs both hands into the mud beside its feet, draws the load back and heaves it underhand at the foe's face (release from the hands)
- [x] `snore`: asleep standing, draws a huge breath, the jaw falling open, and snores a blast at the foe, shuddering, then slumps again
- [x] `uproar`: rears and bellows at the foe again and again, stamping between the cries, three bellows each harder, fists clenched

Status (at home):

- [x] `growl`: leans in low and growls, head down and jaw half open, small shakes of the head, arms braced
- [x] `toxic`: gulps with its cheeks bulging, rears back, then lunges its head forward and spews the poison in two heaves
- [x] `attract`: a coy pose: tilts its big head, raises a hand to its cheek and gives the foe a happy wink, swaying
- [x] `swagger`: a cocky strut, chest out, a step with each foot, rolling its shoulders, a smug toss of its head
- [x] `foresight`: braces low and leans its chest in, face up at the foe, peering with narrowed eyes, its head fin sensing it (the glint at the fin)
- [x] `mimic`: watches the foe with its head cocked one way then the other, then copies it with a flourish
- [x] `mud_sport`: stamps about in the mud splashing it up with its feet, scoops a handful and smears it over its belly, pats it down happily (mud from the feet)
- [x] `protect`: digs in behind forearms crossed before its face, eyes squeezed shut, a small tremor while the barrier stands
- [x] `endure`: digs into a deep squat with its fists clenched at its sides, teeth gritted, eyes shut, trembling
- [x] `substitute`: a burst of effort, arms thrown down and out with a grunt, then a hop back as the doll appears
- [x] `defense_curl`: curls up tight sitting back onto its heels, hugging its knees with its head tucked, holds, unrolls
- [x] `rest`: settles down heavily, arms dropping to its sides, eyes closed, slow deep breaths, gets up
- [x] `refresh`: shakes itself off like a wet dog, then stands tall with a happy grin
- [x] `curse`: slows and hunches heavily, fists on its knees, head bowed, tenses, straightens slowly
- [x] `sleep_talk`: fast asleep standing, mumbling, twitching, an arm jerking as it dreams (aura)
- [x] `hail`: turns its face up to a cold sky and raises its arms palms up calling the hail, shivers, hunches down
- [x] `rain_dance`: a stamping dance, arms raised, rocking left and stamping, right and stamping, face up
- [x] `double_team`: short stocky side-hops, landing in a squat each time with its head held level; the afterimages swing out from the aura

Ice Ball plays `rollout` (the same action: src/battle3d/actions.ts). A
move outside its movepool plays the clip of its motif (`motifClips` in
index.ts: every motif is mapped). Each move's body part is in moves.json,
set by hand from the clips (Jev, tools/gauntlet/classify_moves.mjs, needs a
TYPESAFE_API_KEY this session did not have).

## Clear of the healthboxes

Pass in progress (tools/gauntlet/uiclear.mjs; build/uiclear_rest.mjs
finishes a stopped pass): from our side every clip from `idle` to
`stat_down` is clear; the rest of our side (from `stat_up`) and the whole
foe's side still to measure.

## Battles

- [x] a full battle with marshtomp as ours and as the opponent (autoplay,
      both runs reach the end): every showcase move plays its clip and effect
- [x] the compiled game's test battle both ways: contact moves leap to the
      foe and land as the game's hit effects flash, then come home

The compiled game's test battles (tools/remake/run.mjs with the page's
hold, a frame every 8), Marshtomp as ours with Take Down against a wild
Zigzagoon, and as the wild one with Mega Punch against our Torchic: the
intro reads both ways (the wild one in shadow as the field slides in, then
its hop and roar); Mega Punch's hop in and straight right land on Torchic
as the game's fist appears on it, and it hops home while the game's big
impact plays. Take Down's scrape, charge and crash land on the foe and it
hops home, but the game's hit splat flashes about 0.7 s after the crash:
the game's Take Down script plays a 35-frame wind-up lunge of its own
before its splat, and the page lets it go only when the 3D crash lands
(the engine's timing for any species' Take Down).
