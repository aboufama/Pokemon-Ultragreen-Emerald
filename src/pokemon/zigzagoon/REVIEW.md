# Zigzagoon review log

Every clip, watched frame by frame from both sides (contact sheets at
`--density 2` and `3`, cropped to the Pokémon, then the GIFs' frames at game
resolution), and the ones it uses most in the compiled game's test battles
(`TORCHIC:2,ZIGZAGOON:5` and `TORCHIC:5,ZIGZAGOON:2` for the wild one,
`ZIGZAGOON:3,POOCHYENA:6` for ours). Reviewed against the checklist:
anticipation, follow-through, arcs with no sliding (every paw is pinned where
the stance puts it, `plantAt` in rig.ts, so the body leans, coils and wags
over paws that stay put), the effect from the right emitter, a readable
silhouette from our side (back view, cropped by the text box: the rump, the
tail and the top of the head carry the action there) and from the opponent's
side, starts and ends on the stance, and in time with the game's own motion
of the sprite (data/battle_anim_scripts.s) for the moves it uses most.

Two things shaped every clip:

- Its legs are short and set low under a big fluffy body: a paw raised
  straight up disappears into the fur, so paws that act reach out to the side
  and forward (the swipe, the drum, the scoop), and the rear-up, the twist
  and the rump sell the action.
- From the opponent's side our healthbox's top edge is at the foe's paws: a
  head dropped to the ground in front of its paws, or paws laid out ahead of
  it, go under the box. Heads lead but stay above the paw line (the front
  half lifts as the head drives), and it lies down on tucked paws, curled
  round to its side (tools/gauntlet/uiclear.mjs: nothing under a box, both
  sides).

## Battle moments

- [x] `idle`: breathing, weight shifts and gaze from the life layer; the rump and the tail sway one way and the other and halfway it dips its nose for a sniff; blinks (eye atlas); the tail, ears, mane and rump fur on springs; no pop at the loop point
- [x] `intro`: low with its nose in the grass (the wild one noticed, or just out of its ball), then the head snaps up and it bristles, tail shooting up, and cries with its mouth wide (the stock sprite's open-mouthed frame), head shaking; settles into its stance with a wag. In the game: the wild one cries as its healthbox comes; ours grows out of the ball's flash nose-down and pops up into the cry. Clear of the foe's healthbox from our side
- [x] `hit`: the head knocked up and aside, eyes squeezed shut, ears flat; the sprung knock-back carries the body, the tail and fur bounce; it comes back up without the face tipping out of view (the last key counters the recoil spring's forward swing). In the game it plays during the sprite's blink, both sides
- [x] `faint`: a tired sway with its eyes half shut, then its legs fold and it lies down curled round to its left like a sleeping raccoon, head turned in toward its tail, eyes shut, tail round it; shrinks away from its `shrink`. Worn out, not dying; it lies on tucked paws (laid out in front, the foe's paws went under our box)

## Attack categories

- [x] `physical_weak`: Tackle (and Facade, Secret Power) — a quick coil onto its haunches, then it shoves at the foe forehead first with its front paws off the ground and the rump pushed up (from behind: the rump rises, the tail streams back), rebounds and shakes its head. In the game the shove pose lands on the sprite's 8-frame lunge, both ways
- [x] `physical_strong`: Double-Edge, Flail, Return, Frustration, Body Slam — crouches with the rump up and the haunches wiggling (the tail swinging), launches with the front paws out, comes down on the foe with its front half, paws landing on their spots, bounces back and shakes it off
- [x] `special_weak`: Water Pulse (spit) and the ranged moves that fall back to it — chin up drawing breath with the tail rising, then the head snaps forward and the shot leaves its open mouth; the head bobs back
- [x] `special_strong`: Ice Beam, Shadow Ball, Hidden Power, Blizzard, Icy Wind, Surf — a deep breath with the chest up, the tail raised and the charge gathering at its mouth, then it braces low on all fours and fires from its open mouth with the face held level toward the foe, the head sweeping; shakes it off
- [x] `status_self`: Belly Drum (and Sleep Talk) — sits up on its haunches on the game's first beat and drums its belly with the game's other beats (frames 16, 31, 38, 45, 52), one paw swung out beside its head while the other beats; every beat bounces the body and brings that shoulder forward, so the drumming reads from behind; the aura rises and it drops back onto all fours
- [x] `status_target`: Growl — draws itself up, then juts its head out at the foe with the jaws open and the face level (the snarl shows), ears flat, rump and tail bristling up, and growls with a shaking head through the game's two noise bursts; the sound lines leave its mouth

## Motif clips

- [x] `headbutt` (moveClips: Headbutt) — rears back onto its haunches with its chin up as the game bows the sprite back, then swings its forehead down into the foe from a raised front half, eyes shut, as the game drives the sprite forward; rebounds and shakes its head
- [x] `pin_missile` (moveClips: Pin Missile) — bristles (hunched, tail and fur up, the body puffed) and fires three volleys with a jolt of the whole body and a snap of the head at each, as the game sends its three needles
- [x] `strike` (strike): Covet, Thief, Cut, Rock Smash, Fury Cutter — rears onto its haunches with the front half twisted back and the right paw cocked out beside its head, then unwinds and swipes the paw across at the foe, dropping back onto all fours
- [x] `tail` (tail): Iron Tail — crouched with its tail raised stiff, it spins round on the spot (after 0.3 s: no pivot before the move) with the tail swung out level like a club, through the foe, and comes round to face it again
- [x] `charm` (charm): Tail Whip, Attract, Swagger — the rump up and the head held high with happy eyes, square on the foe, and the rump and the big tail wag from side to side with the game's sway (a swing each way every 32 frames); the hearts leave the tail (emitter `tail`). The head stays up because the game's sway dips the sprite 8 px: in a play bow the foe's face went under our healthbox in the game
- [x] `kick_sand` (kick_sand): Sand-Attack, Mud Sport — weight back as the game slides the sprite back, both front paws dig in, then scoop forward and up as it slides back in, flinging the sand at the foe, and hang there a moment before coming down
- [x] `glare` (glare): Odor Sleuth, Mimic — nose low with its weight back, it sniffs along a zigzag (the rump and tail swinging the other way), pokes its nose at the foe twice with the game's two little lunges, then its head comes up with a hard stare and the glint
- [x] `shield` (shield): Protect, Defense Curl, Endure, Substitute — sits back over its haunches and curls into a spiky ball, head tucked into its chest, tail over its back; holds trembling behind the barrier, then peeks out
- [x] `heal` (heal): Rest — lies down curled round to its left, head turned in toward its tail, eyes shut, breathing slow; the sparkles rise; then it gets up, still drowsy
- [x] `bolt` (bolt; erupt maps here): Thunderbolt, Shock Wave, Thunder Wave, Thunder — hunkers with its eyes shut and its tail stiff, then tenses with its fur on end (the body swelling) as the charge crackles out of it, trembling, the tail straight up
- [x] `afterimage` (afterimage): Double Team — zigzags on the spot faster than the eye, the body swinging from side to side over its paws in quick zigzag bends; the afterimages swing out from the aura
- Also mapped: tackle → `physical_weak`, tackle_strong and slam → `physical_strong`, spit → `special_weak`, beam, orb, storm and breath → `special_strong`, erupt → `bolt`, buff → `status_self`, roar → `status_target`. Weather, powder, sound, throw, fling, wave, burrow and spin (single TM or tutor moves) play the category clips

## Showcase moves in battle

- [x] a full battle with zigzagoon as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
