# Swampert review log

Every clip, watched frame by frame from both sides: contact sheets of the
move performed as the battle does (`build/review.mjs`-style grids, every 6
frames, the enemy block then the player block, plus a zoom on the first
blow), with the gap between the two bodies read at every blow (in the foe's
heights, both sides; ≤ 0.1 lands), then the healthbox clearance
(`tools/gauntlet/uiclear.mjs`) for every clip played at home. Reviewed
against the checklist: anticipation before the action · a contact move
leaps to the foe and the blow lands on its body, then it comes home ·
follow-through after it · arcs, no sliding (feet planted or clearly
airborne) · the effect leaves the right emitter · it is *that* move's action
(reference/move-actions.md) · the silhouette reads from our side (back view,
cropped by the text box) and from the opponent's side · starts and ends on
the stance.

Rig note that shaped every clip: Swampert's `head` bone moves most of the
upper body (head and torso are one mass), so head pitch tips the whole torso
and the head fins then hide the face. Blows keep the summed spine+head pitch
at about 35° or less and lunge the body in (root.z) instead: bent further,
the torso folded flat onto the foe and only the back showed.

How it travels: a long, heavy wind-up (sinking into the knees, the arms
drawn back), a low, lumbering hop in (0.06-0.1 heights; a second stride for
the running charges), a landing deep in the knees right in front of the foe,
where the blow itself closes the last 0.15 of its height (the travel stops
its front that far short of the foe's front: the lead's convention), and a
low, heavy hop home landing in the knees.

## Situations

- [x] `idle`: slow, heavy breathing through the open mouth, the life layer's weight shift and gaze drift; head fins, gills and tail fan sway on springs; no pop at the loop
- [x] `intro`: curled crouch, a low heavy hop with the fists pulled up by the shoulders, lands in the knees, rears up and roars with the arms flung up in a narrow V, the arms come down the front; clear of both healthboxes
- [x] `hit`: 3-frame snap into a flinch with the hands jerking up in front of the face and hurt eyes, digs back in
- [x] `hit_strong`: knocked back further (the whole body shoved back), a stagger step with the right foot, a shake of the head, digs back in; reads as a harder blow than `hit` from both sides
- [x] `faint`: a tired sway, settles back onto its heels hunched over, head bowed and arms folded low, eyes shut, shrinks away (worn out, never dying)
- [x] `dodge`: a quick, heavy side-hop to its left ducking low with the arms in a grappler's guard, lands deep, hops back and settles
- [x] `unaffected`: stands firm, unimpressed (narrowed eyes), a slow shrug with the palms up and a slow shake of the head
  - fixed for the healthboxes: the first shrug flung the forearms out to the sides at chest height (from our side the right hand went under our box); it now turns the palms up in front with the elbows in
- [x] `return_home`: from the foe it sinks, pushes off in one heavy hop and lands home in the knees
- [x] `status_sleep`: a drowsy sway, the eyes drooping shut, the head sinking onto its chest, slow breaths, then it straightens (the sleep loop takes over)
- [x] `status_poison`: a sickly shudder, hunched over its belly with the arms folded on it, wincing
- [x] `status_burn`: jerks from the burn and flaps its scorched left arm to cool it, looking at it, shakes it off
  - fixed for the healthboxes: it flapped its right arm, which from our side swung out under our box; it flaps the left one now
  - fixed after review: the head still turned the other way, away from the arm it was cooling; it looks at it
- [x] `status_paralysis`: seizes rigid with the arms locked stiff and splayed down, twitching at each jolt, the jaw clenched
  - fixed for the healthboxes: the stiff arms splay down and out, not out at shoulder height
- [x] `status_freeze`: locked with its fists clenched to its chest, straining in tiny tremors (a moving hold), eyes squeezed shut
- [x] `status_confusion`: wobbles off balance, a stagger step each way, the head swimming round
- [x] `status_infatuation`: sways dreamily with its head tilted and its hands clasped at its chest, eyes happily squinted
- [x] `status_curse`: doubles over in pain with its fists at its belly, shuddering, groaning (jaw working)
- [x] `status_nightmare`: asleep on its feet it writhes: the head tossing, an arm jerking up, a pained grimace
- [x] `status_wrapped`: arms pinned to its sides, it strains outward against the bind twice, grimacing
- [x] `idle_asleep`: a loop: slumped where it stands, head bowed on its chest, arms hanging, slow deep breaths (3 s)
- [x] `idle_tired`: a loop: heavy panting through the open mouth, the arms sagging, still facing the foe
- [x] `stat_up`: draws itself up tall, chest out, and flexes both arms with a fierce grin
- [x] `stat_down`: shrinks back, hunched and unsteady, the arms drawn in
- [x] `level_up`: a proud little hop, then throws its arms up in front and roars
- [x] `drained`: sags as the energy is drawn out, the head drooping, then steadies itself
- [x] `healed`: a long breath out, the shoulders dropping, eyes happily closed, then settles
- [x] `focus`: Focus Punch's setup: sinks low, the right fist chambered at its hip and the left hand held out at the foe, still but for a tremor
- [x] `hang_on`: staggers back, knees buckling, catches itself and stays up gritting its teeth
- [x] `flinch`: jerks back with its hands up and falters, then shakes its head (can't act)
- [x] `recharge`: spent: the head hanging, arms dangling, panting heavily, unable to move
- [x] `wake`: jolts awake from its slump, blinks, shakes the sleep out of its head, back on guard
- [x] `shake_off`: a hard shake of the head and shoulders, a stamp and back on guard with a snort
  - fixed after review: the head shake turned 66° in a tenth of a second (a rush); smaller and a beat longer
- [x] `break_free`: bursts back out with its fists pulled up, shakes itself, stamps, then raises its arms up the front into a narrow V and roars, brings them down the front and settles in its stance
  - fixed for the healthboxes: the arms flung out wide (under our box from our side); they went up in a narrow V, but still came down round the sides, the right one under our box (212 px): they rise and fall down the front now
- [x] `weather_rain`: a Water type in its element: the arms rise up the front and open into a narrow V, face up into the rain, eyes happily shut, bobbing, then the arms come down the front
  - fixed for the healthboxes: the arms open up in a narrow V instead of out wide, and rise and fall down the front (on the way up they swung out to its right at shoulder height, under our box from our side)
- [x] `weather_sun`: squints and raises its right hand to shade its eyes, peering at the foe from under it
- [x] `weather_sand`: braces low with a shoulder turned into the wind, shielding its eyes behind its forearm
- [x] `weather_hail`: flinches as the stones strike, hunching with its forearms over its bowed head

## Moves

Fists (the gap at the blow, enemy/player, in the foe's heights):

- [x] `mega_punch`: sinks and winds the right fist far back with the shoulders turned away, hops in with it cocked, lands deep and coils once more, unwinds the hips and shoulders into a straight right that drives into the foe's middle, leans through, hops home (0.01/0.01)
- [x] `focus_punch`: from the focused stance: sinks with the fist chambered at the hip and the left hand out, a tremor, a low fast hop and an explosive straight right with a big step, held locked out a beat (0.01/0.01)
- [x] `dynamic_punch`: a slow, huge wind-up, the right arm swung back behind the head, trembling; a heavy leap and an overhand driven down through the foe; a beat of stillness, home (0.01/0.01)
  - fixed after review: the torso folded flat onto the foe (only the back showed); the overhand now comes down with the body upright and the body lunges in instead
- [x] `ice_punch`: a stiff jab-straight: the left fist set by the shoulder, hops in, snaps the left arm out dead straight into the foe and locks it there trembling, pulls back, home (0.01/0.01)
- [x] `counter`: braces behind its forearms and is rocked back by the blow, then springs at the foe with the right arm across its chest and swats a huge backhand out through it (0.02/0.02)
- [x] `brick_break`: the right hand raised high behind its head edge-on, hops in, cocks it once more and chops straight down through the foe, the body dropping into the chop (0.01/0.01)
- [x] `rock_smash`: both fists clasped high as it hops in, drawn back behind the head as it lands, clubbed down onto the foe as onto a boulder, sinking into the blow (0.01/0.01)
  - fixed after review: the club folded the torso flat; the body sinks into the blow now
- [x] `strength`: a heavy hop in with the arms spread, palms set on the foe, a deep sumo squat to load, then one mighty two-handed shove, the body stretching out behind it (0.00/0.00)
  - fixed after review: less fold, the shove carried by the lunge
- [x] `seismic_toss`: a sumo's bear hug and a slam: arms flung wide, a heavy hop in, the arms close round the foe (grab), it sinks straining, heaves the foe up against its chest and leaps straight up spinning round once, hurls it down into its own place (throw) and drops after it to land crouched right over it as it crashes (impact), then hops home (grab 0.08/0.06)
  - fixed after review: the crash landed a fifth of a height short of the foe as the foe; it now drops right onto it, and the hug closes right on the foe

Legs:

- [x] `mega_kick`: a long run-up (two heavy strides), the right knee chambered high in the second leap, lands braced on its left foot and drives the right leg straight out into the foe sole-first, leaning back with its arms flung back for balance, hops home (0.02/0.02)
  - fixed after review: square on, the kicking leg hid behind the body from both sides; the body now turns side-on for the kick (the leg still aimed at the foe)
- [x] `stomp`: hops in, jumps with the right knee drawn high and the arms out for balance, comes down with that big foot on the foe, grinds the heel in, steps off and hops home (0.00/0.00)
- [x] `earthquake`: a sumo's shiko at home: weight onto the right leg, the left raised high out to its side with the left arm out for balance, held at the top, then stamped down into a deep squat with the hands slammed onto its knees as the ground heaves (impact on the stamp)
  - fixed for the healthboxes: both arms spread out at shoulder height and the body rolled to its right took its right hand under our box from our side (394 px); the right arm is held in front of the chest now, and the torso stays upright over the standing leg (leaning over it still put the body under our box, 151 px)

Whole body:

- [x] `tackle`: turns its right shoulder back and sinks, hops in low and slams the shoulder into the foe with the whole body lunging through, rebounds shaking its head, hops home (0.01/0.01)
  - fixed after review: the head was down so far the body folded flat; the shoulder leads with the face showing
- [x] `take_down`: lowers its head like a bull and scrapes a foot, charges in two heavy bounding strides with the arms swept back, crashes in head and shoulders first; the recoil rocks it back wincing, it shakes its head and hops home (0.01/0.01)
  - fixed after review: less fold (the crown showed, not the back)
- [x] `double_edge`: backs off pawing the ground twice, three pounding strides and a leap, throws its whole body into the foe arms-first; the recoil throws it back clutching its head, it staggers and hops home (0.00/0.00)
  - fixed after review: the crash folded it flat onto the foe
- [x] `body_slam`: a long coil with the arms drawn back, a heavy leap high with the arms flung up, comes down belly-first on the foe crushing it, shoves off and hops home (0.01/0.01)
- [x] `return`: grinning, it bounces on its toes, bounds in with two happy hops and bumps the foe with its big chest, arms flung wide, hops home pleased (0.00/0.00)
- [x] `frustration`: stamps its feet in a huff (left, right), glaring, stomps in and rams the foe with its right elbow thrown across, then huffs with a toss of its head (0.01/0.01)
  - fixed after review: the huffy stamps came down harder
- [x] `facade`: hunches wincing, then sets its jaw and drives in with a head-down ram, shoving through the foe with its crown, holds its ground and hops home (0.00/0.01)
  - fixed after review: less fold (the gritted face shows)
- [x] `secret_power`: a short dip, a quick low hop, a butt with the crown of its head, bounces off and hops home in one hop (0.00/0.00)
- [x] `endeavor`: crouches low, scrambles forward in two stumbling hops, then dives at the foe and wraps its arms round its legs in a flying tackle, clinging on; pushes itself up and hops home panting (0.00/0.00)
- [x] `struggle`: eyes heavy, a clumsy low hop with its arms whirling, bumps weakly into the foe, winces at the recoil and stumbles home (0.00/0.00)
- [x] `bide_charge`: braces and stores the blows, sunk low with its fists clenched at its sides, teeth gritted and eyes shut, trembling harder and harder (charge)
- [x] `bide`: roars the stored energy out, hops at the foe and blasts it with both palms thrust into it together, the recoil throwing its head back, hops home (0.00/0.00)
- [x] `waterfall`: hops in low, drops into a deep crouch under the foe and surges up through it, arms flung up and the whole body rising off the ground into it from below, comes down heavily and hops home
  - fixed after review: under the new contact convention the surge rose a fifth of a height in front of the foe (0.20/0.20); it surges up through it now
- [x] `iron_tail`: hops in, then spins round on the spot in a heavy hop, the tail fan swinging round and down onto the foe as its back comes round to it, lands facing it again and hops home (0.06/0.06)
- [x] `rollout`: curls into a ball (arms round the tucked knees, head down), rolls at the foe over and over, rams it, bounces back rolling and uncurls at home (0.01/0.01)

Burrows:

- [x] `dig_charge`: crouches and tears at the ground with both claws in turn, the dirt flying (dig), and sinks into the hole it makes, the head fins going under last
- [x] `dig`: from under its place it tunnels to the foe and bursts up out of the ground in front of it, both fists driving up into it (impact as it breaks the surface), comes down heavily braced wide, glares and hops home (0.08/0.08)
- [x] `dive_charge`: rears back with the arms swung back, hops and plunges head first into the water (dig: a splash), the tail fan going under last
- [x] `dive`: swims over under the field and breaches up in front of the foe head and arms first, surging up through it (impact), comes down with a heavy splash, braced wide, hops home (0.01/0.01)

Ranged (from home):

- [x] `water_gun`: a gulp of air (head back, mouth shut, elbows back), the head snaps forward and the huge mouth spits the jet, braced; recoil bob
- [x] `mud_shot`: dips its head and gulps up a mouthful of mud, rears back swelling, drives its head forward and spits the mud, wipes its mouth with a shake of the head
- [x] `water_pulse`: gathers water between its cupped hands into a pulsing ball (squeezing it twice), draws it back, thrusts both hands and flings it (release from the hands)
- [x] `hydro_pump`: rears up drawing the water in (charge), drops into a wide sumo brace and fires a massive sustained jet; the recoil pushes it back while it holds on
- [x] `muddy_water`: scoops down low with both arms, heaves them up the front as it rears (raising the wave), drives them forward and down; the wave rolls out from its feet
- [x] `surf`: crouches, rises tall as the wave rises, arms up as if riding the crest, then leans into the ride driving its arms forward and down as the wave crashes over the foe
  - fixed for the healthboxes: the riding arms go up in a narrow V
- [x] `whirlpool`: stirs the water with both arms sweeping round in front of it, the body rolling with them (charge), then thrusts both hands and the whirlpool closes round the foe
  - fixed for the healthboxes: the stirring arms circle in front instead of out to the sides
- [x] `ice_beam`: breathes cold into its hands cupped under its open jaw (charge), lowers its head, braced, and fires a straight beam from the mouth, rigid with a tremor; shivers the chill off
- [x] `hyper_beam`: a long gather crouched with the arms drawn back, trembling (charge), rears up, drops into its widest brace and fires; the recoil shoves it back; it sags, spent
- [x] `blizzard`: rears up with its arms flung up in a V calling the storm, then throws its head forward and hurls the blizzard at the foe with both arms flung forward and down, roaring, the head sweeping the snow across it
  - fixed for the healthboxes: the arms swung out wide at shoulder height (161 px under our box from our side), then dropped round the sides from overhead into a wide brace (177 px); they come down the front now
- [x] `icy_wind`: a long breath in, chest swelling (charge), then a wide cold wind from the open mouth sweeping slowly across the foe and back; a shiver
- [x] `hidden_power`: arms spread low and palms up while orbs gather about it (charge), rising slowly, then sweeps both hands forward and sends them
- [ ] `mirror_coat`: braces behind its crossed forearms, its body shining (charge), trembling, then throws its arms open and turns the blow back on the foe
  - fails the clearance from our side (170 px under our box, frame 64): to fix
  - fixed for the healthboxes: the arms throw open forward, not out to the sides
- [x] `rock_tomb`: squats and grips the ground, heaves a load of rock up to its chest straining, rears up with it and slams its arms down: the rocks crash down round the foe
- [x] `rock_slide`: tears into the ground with a low sweep of its right arm across, twisting into it, then unwinds and flings the arm up and over, hurling a slide of rocks at the foe
  - fixed for the healthboxes: the right arm is flung up and forward over the head, not up and out to its right
- [x] `mud_slap`: a two-handed scoop: squats and digs both hands into the mud beside its feet, draws the load back and heaves it underhand at the foe's face, rising out of the squat (release from the hands)
- [x] `snore`: asleep on its feet, it draws a huge breath (the chest heaving, the jaw falling open) and snores a blast at the foe, shuddering, then slumps again
- [x] `uproar`: rears and bellows at the foe again and again, stamping between the cries, three bellows each thrown harder
  - fixed for the healthboxes: the arms no longer fling out wide; fists clenched at its sides and a low brace

Status:

- [x] `roar`: rears back, then lunges its head in and bellows with all its might, fists clenched at its sides, head swaying (emit: sound waves)
  - fixed for the healthboxes: the arms were thrown wide at shoulder height
- [x] `growl`: leans in low and growls at the foe, head down and jaw half open, a deep rumble with small shakes of the head, arms braced
- [x] `toxic`: gulps with its cheeks bulging, rears back, then lunges its head forward and spews the poison in two heaves (emit from the mouth)
- [x] `attract`: a coy pose: tilts its big head, raises a hand to its cheek and gives the foe a happy wink, swaying its hips
- [x] `swagger`: a cocky strut: chest out, a heavy step with each foot, rolling its shoulders, a smug toss of its head
  - fixed for the healthboxes: the strutting elbows held closer and the flourish in a narrow V
- [x] `foresight`: braces low and leans its chest in, face up at the foe, mouth shut, peering with narrowed eyes, the head fins sensing it
- [x] `mimic`: watches the foe closely, head cocked one way then the other, then copies it with a flourish (emit)
- [x] `protect`: digs in behind forearms crossed before the face, eyes squeezed shut, a small tremor while the barrier stands
- [x] `endure`: digs into a deep squat with its fists clenched hard at its sides, teeth gritted and eyes shut, trembling with the strain
- [x] `substitute`: a burst of effort (it crouches, clenches and throws its arms down and out with a grunt), hops back a step and settles behind the doll
- [x] `defense_curl`: curls up tight where it stands, sitting back onto its heels hugging its knees with its head tucked, holds, unrolls
  - fixed for the healthboxes: it curls sitting back over its heels (a curl folded forward took the foe's head onto our box, as the faint once did)
- [x] `rest`: settles down heavily, arms dropping to its sides, eyes closed, slow deep breaths while it recovers, gets up
- [x] `refresh`: shakes itself off like a wet dog, the body wobbling and the head swinging against it, then stands tall with a happy grin, the arms opened forward
- [x] `curse`: slows and hunches heavily, sinking low with its fists on its knees and head bowed, tenses as the curse takes, and straightens slowly, heavier
- [x] `sleep_talk`: fast asleep standing, head drooping, it mumbles (the jaw working), twitching, an arm jerking as it dreams of fighting (aura)
- [x] `hail`: turns its face up to a cold sky and raises its arms palms up, calling the hail, shivers as it comes (moving hold), hunches back down
- [ ] `rain_dance`: a heavy stamping dance: arms raised, it rocks to its left and stamps, then to its right and stamps, face up, raising its arms once more as the rain comes
  - fails the clearance from our side (42 px under our box, frame 44): to fix
- [x] `double_team`: short, heavy side-hops, a sumo's shuffle, landing deep each time with the head held level; the afterimages swing out from the aura
- [x] `mud_sport`: stamps about in the mud splashing it up with its feet (left, right), scoops a handful and smears it over its belly, pats it down happily

Ice Ball plays `rollout` (the same action: src/battle3d/actions.ts). A
move outside its movepool plays the clip of its motif (`motifClips` in
index.ts: every motif is mapped). Each move's body part is in moves.json,
set by hand from the clips (Jev, tools/gauntlet/classify_moves.mjs, needs a
TYPESAFE_API_KEY this session did not have).

## Clear of the healthboxes

Pass in progress (tools/gauntlet/uiclear.mjs; build/uiclear_rest.mjs
finishes a stopped pass): from our side every clip from `idle` to
`rain_dance` measured, all clear but `mirror_coat` (170 px under our box)
and `rain_dance` (42 px), still to fix; the rest of our side (from
`recharge`) and the whole foe's side still to measure.

## Battles

- [x] a full battle with swampert as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
- [x] the compiled game's test battle both ways: contact moves leap to the
      foe and land as the game's hit effects flash, then come home

The compiled game's test battles (tools/remake/run.mjs with the page's
hold, a frame every 8), Swampert as ours with Take Down against a wild
Zigzagoon, and as the wild one with Take Down against our Torchic: the
intro reads both ways (the wild one in shadow as the field slides in, then
its hop and its roar with the arms up in a narrow V; ours out of its ball
the same, clear of both healthboxes), and Take Down's scrape, charge and
crash land on the foe both ways before it hops home. The game's own hit
splat comes late: its Take Down script plays a 35-frame wind-up lunge of
its own before the splat, and the page lets the script go only when the 3D
crash lands, so the splat flashes about 0.7 s after it, once Swampert is
home. That is the engine's timing for any species' Take Down (Tackle's and
Mega Punch's effects flash on the blow: see Mudkip's and Marshtomp's).
