# Wurmple review log

Every clip, watched frame by frame from both sides: contact sheets from
`tools/shots/move_sheet.mjs` at `--density 2` (moves on the whole field,
performed with their effects; situations cropped round Wurmple on each side,
where it is smallest: the foe's), and its moves in the compiled game's test
battles. Checked for: anticipation before the action; a contact move springs
to the foe, lands its blow on the foe's body and comes home; follow-through;
arcs, never sliding (it is clearly off the ground whenever it travels); the
effect leaving the right part (thread from the mouth, the barb from the tail
spikes); that move's own action; a silhouette that reads from our side (back
view) and the foe's; starting and ending on the stance.

How it travels: a caterpillar's scrunch-and-spring. It bunches up (the front
half folded down over its belly, the tail end curled in, the body squashed),
then springs: it shoots out long and flies head first in an arc to the foe,
lands squashed on its belly in front of it, and does the move there; home is
the same spring backward. At the foe it lands with its front 0.15 of its
height short of the foe's front (the approach convention: Wurmple's front
measured at 0.215 of its height), and every blow closes that gap: the lunge
carries it in about 0.1 of its height and the slam pose pushes its crest
forward, so the bodies meet without sinking into each other. Contact gaps at
the impact (from both sides, the skinned bodies measured every frame):
Tackle 0.004-0.012, Struggle 0.009-0.010 of the foe's height.

## Situations

- [x] `idle`: an inchworm's restlessness: the front half sways and bobs, the head held level on the foe, the spiked tail end lifts and settles out of step; blinks and breathing; loops without a pop
- [x] `intro`: ducked low with its eyes shut, it bursts up to its full height with the head raised and the spikes up, cries with a shake of the head and crest, drops into its stance with a glare; the crest stays under the foe's healthbox from our side
- [x] `hit`: the front half snaps back and up with the eyes squeezed shut and the tail end flicking up, bobs forward past the stance and settles
- [x] `hit_strong`: thrown further than `hit`: the front half flung back, the body skidding back and tipping, the tail end whipping up; it staggers from side to side and pulls itself back up
- [x] `faint`: the head droops and the eyes fall shut as it sways, the front half sags, it comes down and curls round to its right to meet its tail, and shrinks away: a small red ball from both sides, worn out, never dying; it curls on the ground rather than forward over its feet
- [x] `dodge`: a quick hop aside to its left, the body tilting away from the blow, a squashed landing, and a hop back onto its spot on guard
- [x] `unaffected`: it rears up and puffs itself out, turns its face away with a dismissive toss of its head (the crest flicking), gives a smug bob and glares back. Made bigger after the first review: at the foe's size the first version barely moved
- [x] `return_home`: at the foe it bunches up, springs back home in an arc and lands squashed, then settles
- [x] `status_sleep`: its eyes grow heavy, the head nods and sinks, a slow breath lifts it, it sinks again, and ends with its eyes shut
- [x] `status_poison`: a sickly shudder, hunched and wincing with the whole body rocking, then a queasy sway. Pushed after the first review
- [x] `status_burn`: it jolts up as the burn bites, the tail end flicking high as if singed, then shakes it off hard. The shake pushed after the first review
- [x] `status_paralysis`: it seizes up rigid, then twitches in hard jerks, the head snapping aside and the tail end jumping. Made bigger after the first review
- [x] `status_freeze`: locked stiff, straining against the ice in hard little quivers of the whole body, then easing. The strain pushed after the first review (still small: it is frozen)
- [x] `status_confusion`: the front half wobbles round in a circle, the head swimming the other way, eyes lidded
- [x] `status_infatuation`: lovestruck, it sways dreamily with its head tilted right over and the tail end wagging. Made bigger after the first review
- [x] `status_curse`: it sinks slowly under the curse until it is hunched low and pressed down, shudders, and pulls itself back up
- [x] `status_nightmare`: asleep, it writhes: the front half twisting one way and the other with the tail end thrashing, eyes shut throughout
- [x] `status_wrapped`: squeezed tight in a bind (the body pinched, the tail end drawn in), it strains and wriggles hard one way and the other. Made bigger after the first review
- [x] `idle_asleep`: lying low, curled round to its right toward its tail with the head turned into the curl and the eyes shut; slow deep breaths lift and settle the curl; loops without a pop
- [x] `idle_tired`: slumped, head low and eyes lidded, panting in quick shallow breaths, still facing the foe; loops without a pop
- [x] `stat_up`: a dip, then it draws itself up to its full height, puffed up with its spikes high, and holds it with a tremor
- [x] `stat_down`: it shrinks back and down, small and unsteady, wobbling, then pulls itself together
- [x] `level_up`: a proud little hop, then it rears up tall with a pleased tilt of the head and a wiggle of the tail
- [x] `drained`: a shiver, then it sags slowly as the energy leaves it, eyes falling shut, and recovers
- [x] `healed`: a deep, contented breath with its eyes closed that lifts it tall, then a refreshed little bob. The breath made bigger after the first review
- [x] `focus`: it coils back tight with its tail end cocked high behind it (the spikes up over its back from our side), eyes narrowed, still but for a tremor
- [x] `hang_on`: a big lurch back, a sway forward as if to fall, then it catches itself and digs in with a glare
- [x] `flinch`: startled, it jumps a little and jerks its head aside, then falters with its head dropping and shakes it
- [x] `recharge`: spent, it slumps forward and pants, too tired to move, then straightens
- [x] `wake`: starts in its sleeping curl (as `idle_asleep` leaves it), stirs, starts up with its eyes wide, shakes its head and is back on guard
- [x] `shake_off`: a vigorous whole-body wriggle, the head and tail end flying and the body rocking, then back on guard with a glare. Made bigger after the first review
- [x] `break_free`: bursts out of a tight curl up to its full height, shakes itself, coils back with an angry glare, and settles
- [x] `weather_rain`: it hunches under the rain with its eyes shut, then shakes the water off and looks up
- [x] `weather_sun`: it glances up, flinches from the glare and turns its face aside and down, squinting
- [x] `weather_sand`: it turns its face right out of the wind with its eyes shut and braces low, leaning hard into the gusts. Made bigger after the first review
- [x] `weather_hail`: each hailstone makes it flinch, and it hunches with its head curled down under the pelting

## Moves

- [x] `tackle`: it bunches up at home, springs at the foe in one clean arc flying head first, lands squashed in front of it, rears back, then slams its whole body into the foe crest first (the body lunges in and presses against it) as the hit lands, bounces off and springs home; from both sides the slam meets the foe's body without sinking into it (re-checked from both sides after the approach convention moved the landing spot 0.26 of its height closer: the lunge eased from 0.3 to 0.1)
- [x] `struggle`: worn out, it gathers itself feebly (eyes drooping), flops at the foe in a low clumsy hop, thrashes its front half one way and the other and throws itself into the foe (the throw eased with Tackle's and re-checked from both sides), winces from the recoil, and drags itself home in a tired hop and sags
- [x] `poison_sting`: the tail rears up beside it like a scorpion's, spikes standing tall (clear of the text box from our side), while the front half leans away; the tail whips over and the spikes jab at the foe as the barb leaves them (`emitterFor` spit: `tailSpikes`), then it curls back down
- [x] `string_shot`: it rears back with its head up, thrusts its head forward and down so its mouth points at the foe and the thread leaves the mouth (`emitterFor` powder: `mouth`), weaving its head from side to side as the threads fly, then pulls its head back

## Battles

- [x] a full battle with wurmple as ours and as the opponent (autoplay, both
      runs reach the end: `check.mjs --render`); its showcase moves Tackle,
      String Shot and Poison Sting each play their own clip with its effect
      (watched performed as the battle performs them, in the move sheets
      from both sides)
- [x] the compiled game's test battle both ways (`tools/remake/run.mjs`,
      Wurmple against a wild Zigzagoon, and a wild Wurmple against our
      Torchic): the intro, then Tackle: it scrunches, springs, lands at the
      foe, slams it as the game's hit effect flashes and the HP drains, and
      springs home
