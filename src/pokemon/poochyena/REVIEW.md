# Poochyena review log

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

## Jaws (pounce to the foe, bite on its face)

- [x] `bite`: a quick low dart with the jaws opening in the air, lands face to face with the foe, cocks its head, lunges and snaps shut on its face (the teeth close on the foe), tugs one way and the other, lets go and bounds home. From our side the head drives in over the foe's face; from the foe's the jaws gape at us. Gap 0.03
- [x] `crunch`: a bigger gather and a higher pounce, jaws gaping; the head rears, clamps down with the whole body driving in, then worries the hold in four slowing shakes, the body and tail swinging after the head; wrenches free and bounds home. Gap 0.03
- [x] `poison_fang`: barely a gather: a low flat dart, lands coiled with the head drawn back like a snake's, a lightning jab (the poison flashes on the foe) and snaps straight back, hissing; home. Gap 0.05
- [x] `astonish`: slinks in low and flat, eyes sly, crouches under the foe's nose, then rears up into its face: forelegs flung wide, jaws gaping, ears up; drops back pleased and bounds home. The rear reads from both sides. Gap 0.05

## The whole body (rams, charges, slams)

- [x] `tackle`: a quick low dart, head down, and it butts the foe on arrival, pressed into it a few frames (the hit), bounces off and lands short, shakes its head and bounds home
- [x] `take_down`: head down, pawing to go, then a gallop: a first bound touches down mid-field (the paws hold still as it gathers again), a second throws it into the foe head first; the recoil hurts it: thrown back wincing, it staggers and shakes the pain out of its head, then bounds home
- [x] `double_edge`: a longer, wilder run: two bounds before the leap, ears flat and everything bristling, a crash with all its weight; the recoil throws it well back to mid-field, where it lands sprawled and dazed, shakes its head and neck and bounds home
- [x] `return`: joyful: tail wagging and ears up, a high bound and its whole flank thrown into the foe; landing, it wags and glances back home, pleased, and bounces back
- [x] `frustration`: sulky: the near forepaw stamped twice with a snarl, then a low charge and a spiteful butt with a twist of the head; turns its nose up with a huff and stalks home
- [x] `facade`: a shudder and a wince of pain, then it sets its jaw and lowers its head: a hard, straight charge and a heavy butt; a grimace (it felt that too) and home
- [x] `secret_power`: ducks low in the grass, springs in on a slant and checks the foe with its shoulder, side-on; skips back and bounds home
- [x] `struggle`: nothing left: a sagging crouch, a clumsy low lunge with the legs sprawled, a flailing butt with the head swinging; winces from the recoil and trudges home in a weak hop
- [x] `body_slam`: a deep gather, a leap high over the foe and a belly-flop on top of it, legs splayed (from our side our Poochyena comes down over the foe; from the foe's it drops onto ours); rolls off it, lands in front and bounds home
- [x] `counter`: takes the blow braced low with its eyes screwed shut, then explodes at the foe in a flat furious leap and slams into it; snarls in its face and bounds home
- [x] `iron_tail`: braces with the tail up stiff, leaps at the foe and spins round in the air, whipping the tail across it as its back comes round (the impact comes with the tail), lands facing the foe and bounds home

## Paws and the ground

- [x] `thief`: a quick dart in, it lands against the foe's face, rears a forepaw and swipes across the foe's head (the spark lands on its face), snatching the item; bounds home with it. From our side the swipe is half hidden behind its head: the twist of the head and shoulders carries it
- [x] `covet`: sits up on its haunches and begs, forepaws raised, head tilted; then a dart in, lands against the foe and grabs at its face (the spark on the foe's head) and bounds home with the prize
- [x] `rock_smash`: a dart in, it lands against the foe, rears up tall on its hind legs with the forepaws high, and smashes them down on the foe's head (the fighting blow on it); drops back and bounds home
- [x] `dig_charge`: nose to the ground, tail and rump up, the forepaws tear at the earth right, left, right, left; then it dives nose first into the hole and sinks out of sight (the turn ends with it underground)
- [x] `dig`: under the ground to the foe (its ear tips break the surface in front of the foe), then it bursts up right under the foe's chin, jaws wide, rising nose-up into it (contact at the blow); knocked back off, it drops down in front, holds its crouch and bounds home
- [x] `mud_slap`: from home: the head ducks and the near forepaw rakes back under the chest scooping mud, then flings it forward and up; the clods fly from the paw into the foe's face; a snort
- [x] `sand_attack`: a hop round to turn its back on the foe (from our side its face comes round to us), kicks with the hind paws, the sand flying back at the foe; a hop back round to face it again

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

## Motif clips (moves Mimic or Mirror Move call)

- [ ] `sound`:

## In battle

- [ ] full battles with it as ours and as the opponent (autoplay): every showcase move plays its clip and effect
