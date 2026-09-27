# Mightyena review log

Every clip, watched from both sides (contact sheets of the battle view at
`--density 2`, every 4 frames, cropped round the action; close-ups where
something needed a closer look), against the checklist: anticipation before
the action; a contact move pounces to the foe and the blow lands on its
body, then it bounds home; follow-through; arcs with no sliding (paws
planted or clearly airborne); the effect from the right part; the move's
own action (reference/move-actions.md); a silhouette that reads from our
side (the back view, cropped by the text box) and the foe's; it ends on
the stance.

Contact clips are reviewed in the mirror match the gates use. The engine
stops a contact move at advance 1 with the attacker's front 0.15 of its
height short of the foe's; keys at the foe carry the kit's FOE_Z (+0.15),
so it lands with the fronts touching, the head and forequarters drawn back,
and the bite, ram or swipe snaps in to contact on the impact key (see
kit.ts and line/travel.ts).

## Battle moments and situations

- [ ] `idle`:
- [ ] `intro`:
- [ ] `hit`:
- [ ] `hit_strong`:
- [ ] `faint`:
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
- [ ] `intimidate`:

## Jaws (pounce to the foe, bite on its face)

- [x] `bite`: the hunter's stalk (it sinks, creeps its weight forward, quivers), then an explosive long, high pounce with the jaws opening; lands against the foe, cocks its head and snaps its heavy jaws shut on its face, tugs, lets go and bounds home, mane flying
- [x] `crunch`: stalks, pounces higher; gapes wide over the foe, clamps with its whole weight driving in and worries the hold in four heavy shakes, the mane and tail swinging after them; wrenches free and bounds home
- [x] `poison_fang`: no stalk: a quick low dart, coiled with the head drawn back, a snake-quick jab (the poison flashes on the foe) and it snaps back out of reach; home
- [x] `astonish`: slinks in low, crouches right under the foe's nose, then rears up tall into its face with the forelegs flung wide and the jaws gaping: from the foe's side a big dark shape looming over our Mightyena; drops back and bounds home

## The whole body (rams, charges, slams)

- [x] `tackle`: a quick dart (no stalk), head down, it butts the foe on arrival and stays pressed into it a few frames, bounces off and lands short, shakes its head and bounds home, mane flying
- [x] `take_down`: head down and pawing, then a heavy gallop: a first bound touches down mid-field (the paws hold still as it gathers), the second throws its weight into the foe head first; the recoil hurts: thrown back wincing, it staggers, shakes its head and bounds home
- [x] `double_edge`: a longer, wilder run of three bounds, ears flat, mane and tail streaming, a crash with all its weight; the recoil throws it back to mid-field, where it lands sprawled and dazed, shakes its head and neck, and bounds home
- [x] `return`: joyful: tail sweeping, ears up, a high bound and its whole flank thrown into the foe; a wag and a glance back home, and it bounces back
- [x] `frustration`: sulky: a forepaw stamped twice, snarling, then a low charge and a spiteful butt with a twist of the head; nose up, a huff, and home
- [x] `facade`: a shudder of pain and a wince, then it sets its jaw and charges hard and straight into a heavy butt; a grimace and home
- [x] `secret_power`: ducks low, springs in on a slant and checks the foe with its shoulder, side-on; skips back and bounds home
- [x] `struggle`: spent: a sagging crouch, a clumsy low lunge with the legs sprawled, a flailing butt; winces from the recoil and trudges home in a weak hop
- [x] `strength`: a pounce to the foe, then it plants all four feet and sets its shoulder against it, head aside, and heaves: the hind legs drive, the rump rises, two surges of shoving (from the foe's side it leans its whole weight into ours); lets up and bounds home
- [x] `body_slam`: a deep gather, a leap high over the foe and a belly-flop on top of it, legs splayed, all its weight; rolls off, lands in front and bounds home. The leap was lowered after review: at its top our Mightyena reached the top of the screen
- [x] `counter`: braced low with its eyes shut as the blow lands, then a flat, furious leap and a slam into the foe (the fighting blow flashes on it); a snarl in its face and home
- [x] `iron_tail`: tail up stiff, a leap at the foe and a spin in the air (from our side its face comes round), the steel tail whipping across the foe as its back swings past; lands facing it and bounds home

## Paws and the ground

- [x] `thief`: sinks low and stalks, then an explosive pounce; lands against the foe, rears a forepaw and rakes it across the foe's face (the spark on its head), the item snatched; bounds home. From our side the rake is half hidden by its own head and mane: the twist of its shoulders carries it
- [x] `covet`: sits back on its haunches and begs, a forepaw raised, head tilted, sweet-eyed; then the pounce, it lands against the foe and grabs at its face (the spark on the foe's head), and bounds home with the prize
- [x] `rock_smash`: stalks and pounces, lands against the foe, rears up tall on its hind legs with both forepaws high over the foe's head and smashes them down on it (the fighting blow on it); drops back and bounds home
- [x] `dig_charge`: nose down, mane up, the forepaws tear at the ground in turn; then it dives nose first into the hole, the tail last, and is gone (the turn ends with it underground)
- [x] `dig`: under the ground to the foe, then it bursts up vertical right under the foe's chin, jaws wide, rising into it (contact at the blow); knocked back up off it, it drops in front, holds its crouch in the dust and bounds home
- [x] `mud_slap`: from home: the head ducks and the near forepaw scoops the mud back under its chest, then flings it forward and up; the clods fly from the paw into the foe's face; a snort
- [x] `sand_attack`: a hop round to turn its back on the foe (from our side its face comes round to us, the big tail up), kicks back with the hind paws, the sand flying at the foe; a hop back round. From our side its body is partly out of the sheet's crop while it is turned, not out of the battle view

## Status moves at the foe (from home)

- [ ] `howl`:
- [ ] `roar`:
- [ ] `leer`:
- [ ] `scary_face`:
- [ ] `taunt`:
- [ ] `torment`:
- [ ] `odor_sleuth`:
- [ ] `snatch`:
- [ ] `mimic`:
- [ ] `swagger`:
- [ ] `attract`:
- [ ] `toxic`:
- [ ] `yawn`:

## Moves on itself (from home)

- [ ] `protect`:
- [ ] `endure`:
- [ ] `substitute`:
- [ ] `psych_up`:
- [ ] `sleep_talk`:
- [ ] `double_team`:
- [ ] `rest`:
- [ ] `sunny_day`:
- [ ] `rain_dance`:

## Ranged (from home)

- [ ] `shadow_ball`:
- [ ] `hidden_power`:
- [ ] `snore`:
- [ ] `hyper_beam`:

## Motif clips (moves Mimic or Mirror Move call)

- [ ] `sound`:

## In battle

- [ ] full battles with it as ours and as the opponent (autoplay): every showcase move plays its clip and effect
