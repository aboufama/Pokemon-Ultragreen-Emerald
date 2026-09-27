# Treecko review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 3`, cropped around Treecko), then its first moves and moments
once more in the compiled game (`game.html?battle=`, frame by frame from
`tools/remake/run.mjs`: Pound, Leer, Absorb and Quick Attack as ours, its
send-out, a hit and a faint; the wild one's appearance, Leer, Pound and
Absorb). Reviewed against the checklist: anticipation, follow-through, arcs
with no sliding, effects from the right emitter, a readable silhouette from
our side (back view, cropped by the text box) and the opponent's side,
starts and ends on the stance, acts in place.

Treecko is small, quick and cool: strikes come from short coils and snap in
3-5 frames, holds are calm and keep moving. Its first moves are timed on the
compiled game's own animations: Pound's hit splat shows from the move's first
frame and Quick Attack hits on its 4th, so their coils are short; Absorb's
orbs stream in for about 1.6 s, so the drain holds its pull until they have
arrived.

Calibration notes: the toon grade is chosen by hand over the color fit's
optimum (loss 0.79 against 0.59): the optimum turned the dark teal leaf tail
lime to match the histogram of the sprites' body greens; this grade keeps
the tail the sprites' teal and still shades the head like the back sprite.
The wild Treecko stands 0.25 back in its slot (`slots.enemy.dz`): its long
toes reached 6 px under our healthbox at rest; the refit is closer to the
sprite (IoU 0.63, box 0.86).

## Battle moments

- [x] `idle`: breathing in its square stance, arms out wide with the hands up as in both sprites; the leaf tail sways on its spring and the chain ripples to the tip; blinks (the eye atlas: half, then closed)
- [x] `intro`: curled over its crossed arms with the eyes shut, it springs up into the cry with the arms flung up in a V and the hands open (the stock sprite's second frame), jaw wide, tail raised; settles into its stance. In the game: out of the ball's pink flash, the cry lands as the sprite finishes growing
  - after review: the head no longer tips back as far (from behind the big head turned into a ball with its crest toward us)
- [x] `hit`: snaps back with the squeezed-shut eyes, arms thrown up and out, hands open; the sprung knock-back carries it; recovers without popping. In the game it plays through the hit blink
  - after review: a smaller head tilt, for the same reason as the intro
- [x] `faint`: a tired sway with the arms dropping and the eyes half shut, then it sinks back onto its heels and curls over hugging itself, the big head bowed and the tail curled round, eyes shut, and shrinks away (worn out); it sits back, clear of our healthbox
  - after review: the tail root lifts as the hips drop, so the tail lies along the ground instead of sinking into it

## Attack categories

- [x] `physical_weak`: Pound (also Cut, Rock Smash, Aerial Ace, Fury Cutter, Brick Break) — a short coil with the chest turned away and the right hand raised wide beside its head, then a big overhand arc down its right side as the torso unwinds and the spine leans it in: the open hand smacks down on the foe and carries on past the knee, and it snaps back into its stance. In the game the smack lands while the game's hit splat is still on the foe
  - after review: the thrust straight at the foe hid behind the body from our side (the left arm's counter-swing was all that showed); the arc runs up and down its side now, which both views see; the coil is shorter so the smack lands with the game's splat, and wider so the hand clears the head from behind
- [x] `physical_strong`: Slam (also Body Slam, Iron Tail; Mega Kick and Seismic Toss by fallback) — a quick coil with the tail loaded to its left, then it spins round on the spot to its left; the heavy leaf tail trails, rises and whips down through the foe as its back turns to it; it comes on round to face the foe and settles deep, the tail swinging back. It reads from both sides (the face swings past our view, the tail sweeps toward the camera from the front)
  - after review: the spin starts after 0.1 s instead of 0.3 s: the game's Slam shoves the sprite and hits within a few frames
- [x] `special_weak`: Bullet Seed (Swift, Rock Tomb, Snore, Mud-Slap by fallback, from the mouth) — a quick breath with the head back, then three pecks of the head, jaw wide, a seed leaving the mouth on each, each a little further in; arms braced low
- [x] `special_strong`: Solar Beam (Hidden Power by fallback) — rises with the chest up and the arms open to the sky, eyes shut, while the sunlight gathers at the mouth, then braces low and drives the head at the foe; the beam leaves the mouth and follows the head through a trembling hold against the recoil; the jaw shuts and the head comes up
  - after review: the head stays nearly level while it soaks up the light (tipped back to the sky, the big head turned into a ball from behind, as in the intro)
- [x] `status_self`: a sunlight power-up (Swords Dance, Sleep Talk, Rest, Sunny Day) — curls in over its crossed arms with the eyes shut, then opens up with the chest out and the arms flung up wide (its sprite's V), a moving hold with a tremor under the aura, and relaxes happy
  - after review: a smaller head tilt (from behind the head turned into a ball)
- [x] `status_target`: Leer (also Mimic; Swagger and Attract by fallback) — cool as ever, it draws its chin up, then juts its head forward and down and stares the foe down from under its brow (the glint leaves its eyes), leaning in with a slow, cocky tilt of the head, and eases back. In the game the stare shows after the game's own Leer (see "In the compiled game")

## Motif clips

- [x] `tackle` (tackle): Quick Attack, Pursuit, Facade, Secret Power, Return, Frustration, Strength, Double-Edge — no time to gather: the game whirls the sprite round a loop at the foe in 8 frames and hits on the 4th, so Treecko is already pitched far forward with its arms swept back like a sprinter and its right shoulder and head driving at the foe, then rebounds upright with the arms opening out and settles
  - after review: the gather and launch are gone (the lunge came after the game's hit)
- [x] `drain` (drain): Absorb, Mega Drain, Giga Drain — reaches both big hands raised wide at the foe, fingers open, closes them on its strength, draws the fists in to its chest with the chin up and the eyes shut and sways slowly while the energy streams in, then opens up, happy, as the healing sparkles on it
  - after review: the reach is raised and wide (straight at the foe it foreshortened from the front and hid from behind); the head no longer throws back so far; the pull holds until the game's orbs have arrived (1.6 s) and it brightens with the game's healing stars
- [x] `shield` (shield): Detect, Protect, Endure, Substitute, Safeguard — draws in and snaps its forearms into an X before its face with the focused eyes, holds under the barrier sinking a little with a slow sway and the tail swishing, opens back into its stance
  - after review: the hold sways and the tail swishes (`motion.mjs` measured a dead hold of 0.47 s)
- [x] `afterimage` (afterimage): Agility, Double Team — the game darts the sprite about and draws the afterimages; on it Treecko weaves low and fast from side to side with its hands up, leaning into each weave with the tail swinging out as a counterweight, and straightens up
  - after review: wider leans (the weave was lost at game size)
- [x] `roar` (roar): Screech (and Toxic, spat from the mouth) — rears up with its hands raised beside its head, fingers splayed (nails on a slate), then lunges the head forward and screeches, jaw wide and hands thrust out, the head shaking while the rings leave the mouth
- [x] `punch` (punch): Focus Punch, Mega Punch, DynamicPunch, ThunderPunch, Counter — the right fist chambered low at the hip with the left hand up as a guard, then it drives up out of the dip, hips and shoulders turning, and the fist rises straight out at the foe's face while the left snaps back to the hip; holds out a moment and comes back
  - after review: the fist rises as it goes out (a punch straight at the camera foreshortened into the body from the front)
- Also mapped: strike → `physical_weak`, slam and tail → `physical_strong`, spit → `special_weak`, beam → `special_strong`, buff, heal and weather → `status_self`, glare and charm → `status_target`, powder → `roar`. Orb, burrow, throw, flash, kick, toss, sound and fling (one TM or tutor move each) play their category clips.

## Healthbox pass

`tools/gauntlet/uiclear.mjs`: every clip stays clear of the healthboxes from
both sides. At first the wild Treecko's resting stance put its long toes 6 px
under our box (the model's feet sit lower than the sprite's); it now stands
0.25 back in its slot, which also fits the sprite better.

## In the compiled game

Watched frame by frame (`tools/remake/run.mjs`, `TREECKO:11,ZIGZAGOON:9`,
`TREECKO:5,BLAZIKEN:50`, `MAGIKARP:30,TREECKO:11`): the send-out, Pound,
Leer, Absorb and Quick Attack as ours, Blaze Kick's hit and the faint; the
wild one's appearance, Leer, Pound and Absorb. The body stays under the text
box, clear of the healthboxes, and acts in place on the game's motion.
These renders predate the remake-layer fixes of d385e08, so two things there
are the old layer's, not the clips': moves that copy a battler into a
background (`monbg`: Leer and Quick Attack's attacker, Blaze Kick's target)
showed the 2D sprite for those frames, and the faint's picture followed the
sprite's slide down, so its curl and shrink were not seen. Both are fixed in
the layer since.

## Moves: blades, claws and chops

The Treecko line's shared choreography (src/pokemon/treecko/line/strikes.ts)
built on this species' kit. Reviewed frame by frame from both sides at game
resolution (contact sheets every 6 frames, the attacker as the foe and as
ours). Every blow's contact is measured for the lead branch's approach (at
advance 1 the fronts stop 0.15 of a height apart, mirror match), from the
posed body at each impact: the gap to the foe's body in its heights (the
gate wants 0.1 or less).

Treecko acts with its big three-fingered hands on short arms: a cut is a
knife-hand, Pound the flat of the hand, Rock Smash a hammer fist. It is small
and quick (tempo 0.86): each action is a fast hop in, the blow and a hop home.
In this branch's engine it lands beside the foe (the slot-centre approach and
its calibration's sideways offset); the lead branch puts it in front.

- [x] `pound`: the hand rises beside the big head, a quick hop in, a flat-handed smack down on the foe's head held a beat, hop home (gap 0.02)
- [x] `cut`: the hand raised up beside the head edge-first, a hop in, a knife-hand chop straight down through the foe (0.01)
- [x] `fury_cutter`: both hands raised high beside the head, a hop in, two quick crossing chops (right, then left across it), bug flashes, home (0.01 / 0.02)
- [x] `brick_break`: the hand drawn up, the other forward, a high hop, a karate chop as it drops onto the foe, landing deep (0.01)
- [x] `aerial_ace`: a fast, high spring, the chop as it drops, past the foe, home at once (0.01)
- [x] `rock_smash`: the fist raised beside the head, a hop in, a rear back and a hammer fist down onto the foe (0.01)
- [x] `crush_claw`: both hands reared up and open beside the head, driven down onto the foe, gripping, the crush, a wrench free (0.01)

## Moves: punches, kicks, the tail, slams and the jaws

Built from the line's choreography (src/pokemon/treecko/line/punches.ts and
body.ts) on this species' kit, reviewed frame by frame from both sides
(contact sheets every 5 or 6 frames, zoomed on the blows). Gaps as above: the
posed body at each impact against the mirror match's foe with the lead
branch's approach (fronts 0.15 of a height apart), in the foe's heights.

Small and quick: every one is a short hop in, the blow and a hop home. Its
fists are its big three-fingered hands curled shut; its tail is thick and
heavy, the weapon of Slam and Iron Tail.

- [x] `mega_punch`: the haymaker with the fist cocked up beside the big head, the looping blow, carried across (0.01)
- [x] `thunder_punch`: the charged fist, a crouch and a high hop, the overhand from the air, landing on the foe (0.01)
- [x] `dynamic_punch`: the slow coil, the launch, the long lunge and the straight punch, the held extension (0.01)
- [x] `focus_punch`: still, eyes shut, then the spring and the straight punch from the hip (0.01)
- [x] `counter`: takes the blow behind crossed arms, then an uppercut up into the foe (0.04)
- [x] `mega_kick`: turning side-on in the air, the chambered knee and the side kick with the body leaning away, a hop round, home (0.05)
- [x] `slam`: springs in and turns its back, the big tail reared up and whipped down onto the foe, spinning round on the hop home (0.06)
- [x] `iron_tail`: a leaping spin, the thick tail held rigid and swung round through the foe (0.05)
- [x] `body_slam`: a leap and a belly-flop onto the foe, the tail sticking up, rolls off, home (0.02)
- [x] `crunch`: head low, jaws parting, a lunge, the bite and the head shakes, a wrench free (0.01)

## Moves: tackles, rams and shoves; the throw and the burrow

From the line's choreography (src/pokemon/treecko/line/tackles.ts and
grapples.ts) on this species' kit, reviewed from both sides (every 6 or 7
frames); Seismic Toss also played as the move, the foe carried and thrown.
Gaps as above.

- [x] `quick_attack`: barely a crouch, a long, low, flat dash, the right shoulder driven into the foe and it springs straight back home off it: the fastest clip it has (gap 0.02)
- [x] `pursuit`: it slinks low, head level with the shoulders and eyes narrowed, stalking, then darts in from the shadows and drives the right elbow into the foe (0.02)
- [x] `frustration`: a tantrum: it stamps one foot, then the other, shaking its head with its fists clenched, then flings itself at the foe and pounds it with both fists, twice (0.01 / 0.00)
- [x] `return`: a glad look back over its shoulder at its trainer, then a big bounding leap and a full-body tackle with the left shoulder, arms tucked; it bounces off, lands light and hops home, happy (0.01)
- [x] `facade`: puffed up with chest out and arms flexed (a brave front), then head down and a ram with the forehead; it rebounds a little dazed and shakes its head clear (0.01)
- [x] `secret_power`: it gathers the hidden power with its hands cupped together low, eyes shut, draws both hands back to its hips, springs in and thrusts both palms into the foe (0.02)
- [x] `strength`: a heave: it drops into a deep squat against the foe with both arms scooping in low under it, then drives up out of the squat, arms heaving up, and holds it there straining (0.02)
- [x] `double_edge`: a deep loaded crouch and a yell, a headlong launch like a missile with the arms swept back, and the recoil throws it back off the foe: it lands staggering, hurt, shakes it off and hops home (0.01)
- [x] `endeavor`: hurt and panting, it gathers its resolve, springs in and drives its shoulder into the foe with the heels dug in, straining and trembling, eyes screwed shut (0.01)
- [x] `struggle`: spent: a heavy, clumsy hop, a wild swipe flung on past, then it stumbles on into the foe butting it with its head; the effort hurts it and it drags itself home (0.01 / 0.01)
- [x] `seismic_toss`: a springy dash in with the hands flung open, it clamps on (grab), sinks, springs up and back toward mid-field with the foe hugged low in front, spinning round with it, and hurls it down into its own place (throw), where it crashes (impact) while it lands and watches, then home (grab gap 0.01)
- [x] `dig_charge`: Dig's first turn: a crouch with its eyes on the ground ahead, a springy hop and a head-first dive into the ground (dig: the dirt flies), arms overhead together; it stays down out of sight
- [x] `dig`: from underground at home it tunnels over (the ground heaving along its way), rights itself under the foe and bursts up with a rising cut of the right forearm, the tail trailing out of the ground (impact), drops in front of it, holds the crouch and hops home (0.02)

## Showcase moves in battle

- [x] a full battle with treecko as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
  - as ours (against a wild Treecko): Pound, Absorb, Leer and Quick Attack
    each play their clip and effect; the wild one's Giga Drain, Slam and
    Detect play theirs, and our faint curls and shrinks away
  - as the opponent (against Blaziken): Quick Attack, then Blaze Kick knocks
    it out (the faint plays); its Pound, Leer and Absorb as the wild one were
    watched in the compiled game (see above)
