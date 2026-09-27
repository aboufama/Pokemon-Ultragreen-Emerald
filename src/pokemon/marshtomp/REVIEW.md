# Marshtomp review log

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

## Moves

(One line per move clip in its movepool, and per variant: the clip name, the
action, and what you checked, e.g. "- [x] `double_kick_first`: leaps in, right
snap kick lands on the foe's chest, holds a guard at the foe". Delete this
paragraph.)

## Battles

- [ ] a full battle with marshtomp as ours and as the opponent (autoplay, both
      runs reach the end): every showcase move plays its clip and effect
- [ ] the compiled game's test battle both ways: contact moves leap to the
      foe and land as the game's hit effects flash, then come home
