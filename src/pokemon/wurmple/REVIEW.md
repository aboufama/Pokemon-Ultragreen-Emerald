# Wurmple review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 3`, then the GIFs at game resolution), and Wurmple's own moves
in the compiled game's test battles (`game.html?battle=MUDKIP:5,WURMPLE:3,GRASS`
as the wild one, `WURMPLE:5,ZIGZAGOON:3,GRASS` and `WURMPLE:5,SWAMPERT:50,GRASS`
as ours, frame by frame with `tools/remake/run.mjs`). Reviewed against the
checklist: anticipation, follow-through, arcs with no sliding, effects from
the right emitter, a readable silhouette from our side (back view, cropped by
the text box) and the opponent's side, starts and ends on the stance, clear
of the healthboxes (`tools/gauntlet/uiclear.mjs`: nothing past a box's edge).

## Battle moments

- [x] `idle`: an inchworm's restlessness: the front half sways slowly from side to side and bobs, the head held level on the foe, the spiked tail end lifts and settles out of step; blinks from the eye atlas, breathing; loops without a pop
- [x] `intro`: ducked low with its eyes shut, it bursts up to its full height with the head raised and the tail spikes up, cries with a shake of the head and crest, then drops into its stance with a glare. In the compiled game the wild one's rear-up lands on the game's own squish-and-bounce (a lively hop as it cries); ours rears up out of the ball's flash. The head lifts rather than tipping right back, so from our side the crest still stands tall, under the foe's healthbox
- [x] `hit`: the front half snaps back and up with its eyes squeezed shut and the tail end flicking up, bobs forward past the stance and settles; in the compiled game it plays with the hit blink, from both sides
- [x] `faint`: the head droops and the eyes fall shut as it sways, the front half sags, then it comes down to the ground and curls round to its right to meet its tail, the head turned back into the curl so the crest lies along it, and shrinks away: a compact red ball from both sides, worn out rather than dying. It curls on the ground rather than over its feet (a wild Wurmple's feet rest on our healthbox). The compiled game takes the sprite away 10-16 frames into a faint, so only the droop shows there (see the note below)

## Attack categories

- [x] `physical_weak`: Tackle — draws its front half up and back (the tail end pressing down to load), whips it forward and down with the crest leading like a horn, carries on past the hit, springs back up and settles. In the compiled game the headbutt lands while the sprite lunges, with the game's hit splat, from both sides
- [x] `physical_strong`: rears up to its full height and back with the tail spikes raised, holds the coil, slams its whole front half down at the foe crest first, rebounds and settles (strong contact moves; none in its learnset)
- [x] `special_weak`: Poison Sting — the tail rears up beside it like a scorpion's, spikes standing tall (clear of the text box from our side), while the front half leans away; the tail whips over and down, the spikes jab at the foe and the sting leaves them (`emitterFor` spit: `tailSpikes`), then it follows through and curls back down. In the compiled game the game's needle appears beside the rising spikes
- [x] `special_strong`: rears back with its head up and eyes shut (charge), drives its head forward and down braced, the tail end pressed down, and holds the stream from its mouth with a weave of the head; shakes it off
- [x] `status_self`: curls up tight — the front half hunched over its belly, the head tucked, the tail curled round its side, eyes shut — shivers there drawing the curl tighter as the aura rises, then unrolls and rears back up
- [x] `status_target`: String Shot — rears back with its head up, thrusts its head forward and down so its mouth points at the foe and the thread leaves the mouth (`emit`, `emitterFor` powder: `mouth`), weaves its head from side to side for as long as the game's threads fly (the compiled game's 18 threads), then pulls its head back

## Motif clips

Wurmple learns three moves (no TM, HM or tutor moves), each played by the
category clip made for it and mapped in `motifClips`:

- [x] tackle -> `physical_weak`: Tackle, the headbutt above
- [x] spit -> `special_weak`: Poison Sting, from the tail spikes
- [x] powder -> `status_target`: String Shot, from the mouth

## Showcase moves in battle

- [x] a full battle with wurmple as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect

## Notes from the compiled game

- A fainting battler's body follows its sprite down and is gone when the
  game frees the sprite (16 frames for a wild Wurmple, about 10 for ours),
  so only the start of `faint` shows there; the curl and shrink show in the
  battle playtest. This is the remake layer's compositing (every species).
- While a move's animation holds the target in a background layer
  (`monbg`, e.g. Tackle, Take Down), the target shows as its 2D sprite.
