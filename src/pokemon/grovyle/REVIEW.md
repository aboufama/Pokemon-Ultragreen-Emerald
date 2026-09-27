# Grovyle review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 3`, then the GIFs at game resolution). Tick a box only when the
answer is yes; otherwise fix the clip first. Add a line under a clip for
anything you changed after reviewing it. `tools/gauntlet/check.mjs` fails
while any box is unchecked or a clip is missing from this list.

For every clip:
anticipation before the action · a contact move leaps to the foe and the
blow lands on its body, then it comes home · follow-through after it · arcs,
no sliding (feet planted or clearly airborne) · the effect leaves the right
emitter · it is *that* move's action (reference/move-actions.md) · the
silhouette reads from our side (back view, cropped by the text box) and from
the opponent's side · starts and ends on the stance.

## Situations

- [ ] `idle`: breathing reads, nothing pops at the loop point, loose parts sway
- [ ] `intro`: bursts out with a cry that fits the species, clear of the foe's healthbox from our side
- [ ] `hit`: snaps away from the attacker, recovers without popping
- [ ] `hit_strong`:
- [ ] `faint`: a tired sway, curls over (arms in, head tucked, eyes shut), shrinks away at its `shrink`: worn out, never dying
- [ ] `dodge`:
- [ ] `unaffected`:
- [ ] `return_home`:
- [ ] `status_sleep`:
- [ ] `status_poison`:
- [ ] `status_burn`:
- [ ] `status_paralysis`:
- [ ] `status_freeze`:
- [ ] `status_confusion`:
- [ ] `status_infatuation`:
- [ ] `status_curse`:
- [ ] `status_nightmare`:
- [ ] `status_wrapped`:
- [ ] `idle_asleep`:
- [ ] `idle_tired`:
- [ ] `stat_up`:
- [ ] `stat_down`:
- [ ] `level_up`:
- [ ] `drained`:
- [ ] `healed`:
- [ ] `focus`:
- [ ] `hang_on`:
- [ ] `flinch`:
- [ ] `recharge`:
- [ ] `wake`:
- [ ] `shake_off`:
- [ ] `break_free`:
- [ ] `weather_rain`:
- [ ] `weather_sun`:
- [ ] `weather_sand`:
- [ ] `weather_hail`:

## Moves: blades, claws and chops

The Treecko line's shared choreography (src/pokemon/treecko/line/strikes.ts)
built on this species' kit. Reviewed frame by frame from both sides at game
resolution (contact sheets every 6 frames, the attacker as the foe and as
ours). Every blow's contact is measured for the lead branch's approach (at
advance 1 the fronts stop 0.15 of a height apart, mirror match), from the
posed body at each impact: the gap to the foe's body in its heights (the
gate wants 0.1 or less).

Grovyle's big head leaf covers most of its back from our side: its actions read
there by the arms and leaf fans swinging out beside the body, and from the
foe's side in full. Its leaps are the line's highest (its spring).

- [x] `pound`: the hand rises beside the head, a high springy leap, the body bows into a flat smack down on the foe's head and stays on it a beat, a quick hop home (gap 0.04)
- [x] `cut`: the arm raised straight up with its leaf fan standing, carried through the leap, a crisp chop down through the foe, the arm stopping low (0.05)
- [x] `fury_cutter`: both arms raised crossed behind the head, a leap in, the right leaf slashes down and across, then the left chops down across it (the X), bug flashes on both, home (0.02 / 0.06; it lands 0.24 of a height further in)
- [x] `leaf_blade`: en garde with the leaf drawn back, a long low spring into a lunge, a flat cut across the foe with the arm leaf leading (the grass Cut effect), held out poised, home (0.00)
- [x] `false_swipe`: the checked half-swing, the arm drawn back across the chest, a restrained backhand out to its right that stops still, lowered (0.03)
- [x] `brick_break`: the hand drawn up, a high leap (the springiest of the line), the chop straight down as it drops into the foe, landing deep (0.05)
- [x] `aerial_ace`: barely a crouch, a fast, high spring, the slash as it drops onto the foe, past it, a quick hop home (0.06)
- [x] `rock_smash`: the fist raised, a leap in, rearing back, a hammer blow with the whole body behind it (0.07)
- [x] `crush_claw`: both arms reared high with their leaf fans spread wide (a strong silhouette from both sides), driven down onto the foe, the crush, the wrench free (0.07)

## Moves: punches, kicks, the tail, slams and the jaws

Built from the line's choreography (src/pokemon/treecko/line/punches.ts and
body.ts) on this species' kit, reviewed frame by frame from both sides
(contact sheets every 5 or 6 frames, zoomed on the blows). Gaps as above: the
posed body at each impact against the mirror match's foe with the lead
branch's approach (fronts 0.15 of a height apart), in the foe's heights.

From our side Grovyle's head leaf hides what its arms do in front of it: the
punches read by the leap, the body's turn and the fist at the foe; the side
kick turns it into profile, so the kick reads from both sides.

- [x] `mega_punch`: the haymaker: fist wound back, the other hand out, a high leap, the looping blow and the carry across (0.01)
- [x] `thunder_punch`: the charged fist cocked back, a crouch and its springiest leap, the overhand from the air into the foe's face, landing on it (0.05)
- [x] `dynamic_punch`: the slow coil, the launch, the long lunge and the dead-straight punch, a beat of stillness at full extension (0.01)
- [x] `focus_punch`: stillness, the eyes shut, the spring in and the straight punch from the hip, the other fist snapped back (0.03)
- [x] `counter`: takes the blow behind crossed arms, the crouch, the uppercut up and forward into the foe (0.03)
- [x] `mega_kick`: the bound turning side-on, the chambered knee, the side kick in profile with the body tilted away, the hop round, home (0.06)
- [x] `slam`: springs highest of the line, turns its back at the top of the arc with the leaf-brush tail reared up, whips it down onto the foe, spins round on the way home (0.06)
- [x] `iron_tail`: the leaping spin, the rigid tail cracking round through the foe, landing facing it (0.08)
- [x] `body_slam`: a high leap and a belly-flop onto the foe, the head leaf sticking up as it lies on it, rolls off, home (0.08)
- [x] `crunch`: the head low and the jaws parting, a lunge in, the bite, the head shakes, the wrench free (0.02)

## Moves: tackles, rams and shoves; the throw and the burrow

From the line's choreography (src/pokemon/treecko/line/tackles.ts and
grapples.ts) on this species' kit, reviewed from both sides (every 6 or 7
frames); Seismic Toss also played as the move, the foe carried and thrown.
Gaps as above.

- [x] `quick_attack`: barely a crouch, a long, low, flat dash, the right shoulder driven into the foe and it springs straight back home off it: the fastest clip it has (gap 0.06)
- [x] `pursuit`: it slinks low, head level with the shoulders and eyes narrowed, stalking, then darts in from the shadows and drives the right elbow into the foe (0.05)
- [x] `frustration`: a tantrum: it stamps one foot, then the other, shaking its head with its fists clenched, then flings itself at the foe and pounds it with both fists, twice (0.07 / 0.05)
- [x] `return`: a glad look back over its shoulder at its trainer, then a big bounding leap and a full-body tackle with the left shoulder, arms tucked; it bounces off, lands light and hops home, happy (0.09)
- [x] `facade`: puffed up with chest out and arms flexed (a brave front), then head down and a ram with the forehead; it rebounds a little dazed and shakes its head clear (0.06)
- [x] `secret_power`: it gathers the hidden power with its hands cupped together low, eyes shut, draws both hands back to its hips, springs in and thrusts both palms into the foe (0.05)
- [x] `strength`: a heave: it drops into a deep squat against the foe with both arms scooping in low under it, then drives up out of the squat, arms heaving up, and holds it there straining (0.07)
- [x] `double_edge`: a deep loaded crouch and a yell, a headlong launch like a missile with the arms swept back, and the recoil throws it back off the foe: it lands staggering, hurt, shakes it off and hops home (0.06)
- [x] `endeavor`: hurt and panting, it gathers its resolve, springs in and drives its shoulder into the foe with the heels dug in, straining and trembling, eyes screwed shut (0.09)
- [x] `struggle`: spent: a heavy, clumsy hop, a wild swipe flung on past, then it stumbles on into the foe butting it with its head; the effort hurts it and it drags itself home (0.06 / 0.06)
- [x] `seismic_toss`: a springy dash in with the hands flung open, it clamps on (grab), sinks, springs up and back toward mid-field with the foe hugged low in front, spinning round with it, and hurls it down into its own place (throw), where it crashes (impact) while it lands and watches, then home (grab gap 0.02)
- [x] `dig_charge`: Dig's first turn: a crouch with its eyes on the ground ahead, a springy hop and a head-first dive into the ground (dig: the dirt flies), arms overhead together; it stays down out of sight
- [x] `dig`: from underground at home it tunnels over (the ground heaving along its way), rights itself under the foe and bursts up with a rising cut of the right forearm, the tail trailing out of the ground (impact), drops in front of it, holds the crouch and hops home (0.06)

## Battles

- [ ] a full battle with grovyle as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
- [ ] the compiled game's test battle both ways: contact moves leap to the
      foe and land as the game's hit effects flash, then come home
