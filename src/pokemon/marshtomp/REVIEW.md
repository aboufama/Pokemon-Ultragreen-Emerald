# Marshtomp review log

The set in `set.ts`: Swampert's first clips (`../swampert/first.ts`) and the
clips added since in their style (`../swampert/more.ts`), ported to
Marshtomp, one clip per action. Every clip was watched frame by frame from
both sides next to Swampert's first clip for the same action
(`tools/shots/fastsheet.mjs --species marshtomp` and `--species swampert`
with the same moves, every 2 to 5 frames, whole frames at game resolution
and zoomed crops of each side), then in the compiled game's test battle.
Reviewed against the checklist: anticipation before the action · a contact
move leaps to the foe and the blow lands on its body, then it comes home ·
follow-through after it · arcs, no sliding (feet planted or clearly
airborne) · the effect leaves the right emitter · it is that move's action
· the silhouette reads from our side (back view, cropped by the text box)
and from the opponent's side · starts and ends on the stance.

The stance, checked against the brief: grounded on both feet, square to the
foe (the render gate's head yaw), in the stock sprite's spirit: a squat
wrestler with both arms up in a Y, the grin, the tail lobes splayed on the
ground behind its feet and the head fin turned so its broad face shows from
both cameras. Unchanged, so the calibration stands (opponent side IoU
0.7473, box 0.9056; player side 0.7024, box 0.9185; color loss 0.6487).

How the port differs from Swampert, and why:

- Timing: about 0.9 of Swampert's (28 kg to its 82), hops about a third
  higher (0.075-0.09 of its height for the hops in, 0.2 for the belly
  slam's leap), crouches shallower (its legs are a fifth of its height).
- Its arms rest up in a Y, where Swampert's hang in crab arms: a clip that
  lets go of the arms brings them up into the Y, and arms coming back from
  a low pose (the spit's brace, the blast's brace, the quake's hammer, the
  wave's push, the heal's limp arms) come up the front through `Y_EASED`
  rather than swinging out round the side.
- No neck: its head carries the upper body. Thrown back as far as
  Swampert's, the head fin fell back toward our camera and the head read as
  a round stub from our side; the rears (the cry, the call to the sky, the
  quake and wave heaves, the blast's gather, the spit's gulp, the toss's
  hoist, the breach) throw it back a little less and `finUp` keeps the fin
  standing.
- Its own parts where Swampert used its own: Iron Tail whips both tail
  lobes, Foresight's glint is at the head fin, which tips toward the foe.

## Battle moments

- [x] `idle`: slow breaths through the grin, the raised arms rising a little with each breath; the head fin and tail lobes sway on springs, blinks; both ends are the stance
- [x] `intro`: curled low with its eyes shut, a hop with its fists pulled up by its shoulders (lands in a squat, fists coming down in front), then cries with both arms up in a narrow V, jaw wide, head swaying, and opens its arms out into the Y
  - fixed after review: the cry's head thrown back laid the fin toward our camera (a round stub from our side); less back pitch and the fin kept standing
- [x] `hit`: a 3-frame snap into a flinch, the head back and the hands up before its face, hurt eyes; the knock-back carries it and it digs back in (watched every 2 frames)
- [x] `faint`: a tired sway back, then it settles onto its heels hunched over its belly, arms folded low and head bowed, eyes shut, and shrinks away from its `shrink`: worn out, never dying

## Attack categories

- [x] `physical_weak`: Tackle, Facade, Secret Power, Struggle — Swampert's shoulder charge: sinks with the right shoulder drawn back, hops in with the head down, lands shoulder-first on the foe and compresses into it (impact on the landing), rebounds in a hop shaking its head and carries on home
- [x] `physical_strong`: Take Down, Double-Edge, Return, Frustration, Strength, Waterfall, Endeavor, Bide, Body Slam — Swampert's belly crash: a long coil with the arms drawn back, a big leap with the arms swinging up and forward, comes down belly-first on the foe (impact), shoves off, plants its feet and hops home
- [x] `physical_strong_charge`: Bide's storing turns (the turn it unleashes plays `physical_strong` whole) — digs into a squat with its fists clenched hard at its sides, teeth gritted and eyes squeezed shut, the whole body shaking harder and harder (charge), then eases back up still glaring, the arms coming up the front into the Y. Not in Swampert's set, made from its guard hold and its gather's shut eyes: its `physical_strong` played whole on every turn of Bide (the gate's warning), and Bide's first turn is its own action
  - fixed after review: the first tremor (the head alone, ±2-4°) didn't show at game resolution; the whole body shivers now, growing
- [x] `special_weak`: Water Gun, Mud Shot, Water Pulse, Hidden Power — a gulp of air (head back, elbows back, mouth shut), the head snaps forward and the wide mouth spits (release from the mouth), a recoil bob, settle
  - fixed after review: the arms swung back out round the side into the Y; they come up the front now. Water Pulse and Hidden Power are spat from the mouth, so their part in moves.json is the mouth (it was the hands)
- [x] `special_strong`: Hydro Pump, Ice Beam, Blizzard, Icy Wind — rises and gathers with its eyes shut (charge at the mouth), drops into a wide squat brace and fires a sustained blast from its jaws; the recoil pushes it back while it holds with a tremor and a small head sweep; the mouth shuts and it shakes it off
- [x] `status_self`: Rain Dance, Hail, Sleep Talk, Curse — curls in with its fists crossed before its chest, eyes shut, then rears up with its arms flung up to the sky and cries (its skin must stay wet: it calls the rain), a moving hold with the head swaying, aura at the peak, and the arms open back out into the Y
- [x] `status_target`: Growl, Toxic, Snore, Uproar — rears back, then lunges its chest in with the arms thrown wide and bellows, head swaying; the effect leaves the mouth

## Motif clips

- [x] `quake`: Earthquake — a dip, rears up with both fists rising up the front to high overhead, then drops into a crouch and hammers them into the ground at its sides (impact: the screen shakes, dirt bursts at the foe), holds the crouch while the ground heaves, rises into the Y
- [x] `wave`: Muddy Water, Surf, Whirlpool, Rock Tomb, Rock Slide — scoops down low with both arms, heaves them up the front and high as it rears up, drives them forward and down: the wave rolls out from its feet (the rocks leave its hands)
- [x] `shield`: Protect, Endure, Substitute, Defense Curl, Mirror Coat — digs in behind forearms crossed before its face, eyes squeezed shut, settling deeper with a small tremor; the barrier covers it from both sides; the guard opens back into the Y
- [x] `punch`: Mega Punch, DynamicPunch, Ice Punch, Counter — Swampert's haymaker: cocks the right fist far back with the torso turned away, hops in with it cocked, lands and unwinds hips and shoulders, driving the fist straight into the foe (impact), follows through leaning into it, hops home
- [x] `strike`: Rock Smash — the right hand raised high behind its head, hops in, lands with it cocked further back, chops down and across through the foe (impact), follows through, hops home
- [x] `glare`: Foresight, Mimic — braces low and leans its chest in, face up at the foe, mouth shut, peering with narrowed eyes in a slow head sway, its head fin tipping toward the foe (the glint at the fin's tip)
- [x] `kick_sand`: Mud Sport — the weight onto its left leg and the right foot dragged back through the mud, then flung forward and up with the body rocking back over the standing leg: mud flies from the foot
  - fixed after review: the kick was too small to read at game resolution; the drag, the kick and the lean are larger
- [x] `heal`: Rest, Refresh — settles down with its arms easing out and dropping limp at its sides, eyes closing, the head sinking, slow deep breaths (a moving hold) while it recovers, then rises with its arms lifting back into the Y
- [x] `toss`: Seismic Toss — Swampert's sumo bear hug: squares up with the arms flung wide, a hop in, lands chest to chest as the arms close round the foe (grab), sinks with it straining, heaves it up against its chest and springs back toward mid-field spinning round with it, hurls it down into its own place from the top of the leap (throw) and drops into a deep crouch at advance 0.4; the foe crashes on its side in its place (impact), where both views see it, and it hops home
- [x] `burrow`: Dig, Dive — rears back with its arms swung back, hops and plunges head first into the ground (dig: dirt, or a splash for Dive), the tail lobes going under last; the mounds run to the foe; it breaches in front of it with both fists driving up (impact), comes down with its arms braced wide, holds the crouch glaring up at the foe and hops home
- [x] `fling`: Mud-Slap — a two-handed scoop: drops into a squat and digs both hands into the mud beside its feet, draws the load back by its hips, heaves it underhand at the foe as it rises (release from the hands), the arms carry on up past its face and open back out into the Y
- [x] `afterimage`: Double Team — short, quick side-hops, a wrestler's shuffle: each a low hop to one side landing in the knees, the body leaning with it and the head held level, the arms spread in a grappler's guard; the afterimages swing out from the aura; lands home as the guard rises back into the Y
- [x] `tail`: Iron Tail — a coil turning its shoulders away, a hop in that turns its back to the foe with both tail lobes rising high behind it, the body pitches forward and the lobes whip down through the foe (impact), it lands in a squat, swings back round and hops home
  - fixed after review: the lobes hardly moved (hidden behind the body); they rise high on the way in, visible from both sides, and the whip is bigger. At the impact the lobes are at the foe's body, not down in the ground (the engine lands a blow where the impact pose touches the foe: whipped into the ground, its back would have bumped the foe), and the impact waits the lobes' 0.06-0.08 s trail
- [x] `kick`: Mega Kick, Stomp — a coil and a hop in; at the foe it rears up onto its left leg with the right knee hauled high and the arms out, springs up off the standing leg (lighter than Swampert, it hops into the stomp) and drives the foot down onto the foe with its weight behind it (impact), holds, steps down, hops home
  - fixed after review: the knee-up alone didn't read from our side (the body hides the leg); the spring up into the stomp does. At the stomp the foot drives forward and the arms stay out wide for balance (spread forward, they reached the foe first)
- [x] `spin`: Rollout, Ice Ball — curls into a ball (its middle at the root, so it rolls about its middle), rolls at the foe over and over, bowls into it and grinds, rolls back home and uncurls
  - fixed after review: the tail lobes and head fin stuck out and made the ball a tumbling body; the lobes fold up round its back and the fin lies back. It is still a curled body rolling, as Swampert's is
- [x] `charm`: Swagger, Attract — chest puffed out and head up, it holds its right hand out to the foe palm up and beckons twice, smug, then drops back into its stance

## Battles

- [x] the compiled game's test battle both ways (`tools/remake/run.mjs --hold`, a frame every 6): Marshtomp as ours with Take Down against a wild Zigzagoon, and as the wild one with Mega Punch against our Torchic. The intros read both ways (the wild one in shadow as the field slides in, then its curl, hop and cry; ours out of its ball into the same). Take Down's coil, leap with the arms swinging up and belly-first crash land on the Zigzagoon as the game's hit flashes, and it hops home; Mega Punch's cocked fist, hop in and straight right land on Torchic as the game's fist and flash appear, and it hops home while the game's burst plays
