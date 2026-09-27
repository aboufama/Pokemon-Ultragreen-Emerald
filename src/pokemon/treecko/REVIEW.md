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

## Showcase moves in battle

- [x] a full battle with treecko as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
  - as ours (against a wild Treecko): Pound, Absorb, Leer and Quick Attack
    each play their clip and effect; the wild one's Giga Drain, Slam and
    Detect play theirs, and our faint curls and shrinks away
  - as the opponent (against Blaziken): Quick Attack, then Blaze Kick knocks
    it out (the faint plays); its Pound, Leer and Absorb as the wild one were
    watched in the compiled game (see above)
