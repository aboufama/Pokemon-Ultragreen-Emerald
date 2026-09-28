# Wurmple review log

The set in `set.ts`, made by hand in the style of the first clips of
Blaziken, Sceptile and Swampert (`src/pokemon/blaziken/first.ts`): a clip per
action its moves take, not per move. The kit's clips (`clips/`) stay in the
repo, unused.

Every clip watched frame by frame from both sides with
`tools/shots/fastsheet.mjs` (every 4 frames, the battle's own pose rate; the
moves performed as the battle performs them, effects and the foe's reaction
included), cropped round Wurmple on each side, and laid frame for frame next
to the first clip of Blaziken's that does the same action, at the same
density. Checked for: anticipation before the action · a contact move springs
to the foe and the blow lands on its body, then it comes home · follow-through
after it · arcs, never sliding (off the ground whenever it travels) · the
effect leaving the right part (the barb from the tail spikes, the thread from
the mouth) · that move's action (`reference/move-actions.md`) · a silhouette
that reads from our side (its back) and from the foe's (its front) · starts and
ends on the stance.

How it travels: it can't leap like a biped, it springs. It bunches up low
(the front half folded down over its belly, head up on the foe, drawing back),
springs up and out stretched long in one arc to the foe (root.y 0.2 at the
top, advance 0.62 there), and comes down in front of it; home is a smaller
hop. Contact at the blow, measured from both sides on the skinned bodies:
Tackle 0.005 of the foe's height (the crest and head on its body).

## Stance

- [x] Unchanged, checked from both sides in the battle view and the rig lab:
      grounded (its belly and little feet on the ground, the back half lying
      curled round to its right), reared up and squared to the foe (the belly
      faces it from the foe's side, the face looks at it), the spiked tail end
      raised on its right as both stock sprites draw it

## Battle moments

- [x] `idle` (after Blaziken's `idle`): an inchworm's calm restlessness: the front half sways slowly from one side to the other, the head held level on the foe, the tail end lifting as it goes; breathing and blinks from the life layer; loops without a pop
- [x] `intro` (after Blaziken's `intro`): curled down low with its eyes shut, a deeper coil, then it bursts up off the ground stretched tall (a little squish-and-bounce, its stock front anim), lands reared up and puffed out with the spikes high and cries with its head thrown back, shaking it, then drops into its stance with a glare; the crest stays clear of the foe's healthbox from our side
- [x] `hit` (after Blaziken's `hit`): a 3-frame snap back and up, eyes squeezed shut, the tail end flicking up (the battler adds the sprung knock-back), a bob back past the stance, settles
- [x] `faint` (after Blaziken's `faint`): a tired sway, tipping back to one side with the head lolling and the eyes drooping, then sagging forward to the other; it curls round toward its tail with the head laid down against its side, eyes shut, and shrinks away (worn out, never dying); it curls to its side rather than forward, clear of our healthbox as the foe
  - fixed after review: the sway was too small to see in the first 0.4 s; now a real wobble both ways

## Its moves

- [x] `tackle` (after Blaziken's `tackle` and `physical_weak`): Tackle, Struggle — it bunches up low and draws back, springs up and out stretched long, arcs to the foe rearing back as it comes down, lands in front of it reared back, then throws its whole body in and slams the front half down on the foe crest first (the tail end kicking up behind), hangs pressed into it, pushes itself back up and hops home; same beats and pacing as Blaziken's physical_weak frame for frame
  - fixed after review: the first launch pitched the body forward like a nosedive; it now springs up and out with the head up on the foe. The recovery off the foe is spread over two keys (cliplint's rush)
- [x] `special_weak` (after Blaziken's `special_weak`): Poison Sting (`motifClips` spit) — the venom is in its tail spikes (the Pokédex has it point them at the foe): it swings its back half round and rears the tail end up high, the front half rearing back and leaning away; then whips the back half round and thrusts the spikes at the foe as the front half bows in behind them; the barb flies from the spikes (`emitterFor` spit: `tailSpikes`), it recoils and settles
  - fixed after review: the first version moved only the tail, and aimed the spikes sideways (found by forward kinematics); the spikes now point at the foe on the jab and the whole body cocks and snaps
- [x] `status_target` (after Blaziken's `status_target`): String Shot (`motifClips` powder) — it rears back with its head raised, drawing in, then drives its head forward and down so its mouth points at the foe and sprays the thread (`emitterFor` powder: `mouth`), weaving its head and front half from side to side to spin it over the foe, then pulls its head back and settles

## Checks

- [x] healthboxes (`tools/gauntlet/uiclear_fast.mjs`): every clip at home clear of both boxes from both sides (0 px)
- [x] fluidity (`tools/gauntlet/motion.mjs --species wurmple,blaziken`): 0 stop-starts, 0 dead holds, no turn in the first 0.3 s; its pops fall on the tackle's launch and landing and on the faint's last frames of shrinking, where Blaziken has them too
- [x] a full battle both ways (`check.mjs --render`): Tackle, String Shot and Poison Sting each play their clip with its effect
