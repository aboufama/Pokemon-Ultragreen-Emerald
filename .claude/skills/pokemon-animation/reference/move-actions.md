# What each move looks like

Every move a species can know gets its own clip (`<move>` in lower case:
`double_kick`), and the clip is **that move's action**. Below, each move in
the movepools of the species in the game, what the body does, beat by beat.
Adapt it to the body plan (a quadruped bites where a biped punches, a moth
beats its wings where a biped swings its arms, a cocoon can only hop, tip and
slam) and to the species' weight and temperament, but keep the action: a
reader who knows the move must recognise it at 64 px.

"Goes to the foe" means the contact rules of the skill: wind up at home,
leap or dash in (`advance` to 1 along an arc, feet off the ground), strike
**into** the foe's body on the `impact` (the gap under 0.1 of its height),
follow through, hop home. Ranged moves fire from home (a step in at most).
Multi-hit moves also need `_first`, `_next` (3+ hits) and `_last`; two-turn
moves a `_charge` (see the skill).

## Contact: claws, blades, hands

| move | action |
|---|---|
| POUND | goes to the foe; a flat-handed (or forepaw, or tail) smack down on its head: the arm rises, the wrist leads, a heavy slap, the hand stays on it a beat |
| SCRATCH | goes to the foe; claws cocked beside the head, a quick raking swipe down and across its face, fingers splayed; the claws carry through past it |
| FURY SWIPES | goes to the foe; frantic alternating rakes. `_first` lands the right claw and stays; `_next` the left, then right, each from a new angle (high, low, backhand); `_last` a big finishing rake and home |
| SLASH | goes to the foe; a big diagonal slash from high behind the shoulder down through the foe, the whole torso unwinding, the claws trailing a long follow-through low on the far side |
| CRUSH CLAW | goes to the foe; rears up with both claws high, then drives down onto it, gripping and crushing, the weight on the claws; wrench free |
| DRAGON CLAW | goes to the foe; a savage two-stage rake: a wide sweep, then a second rip back the other way, the body bent low and predatory |
| LEAF BLADE | goes to the foe; the forearm blade (Treecko line: the arm leaves; others: a leaf-edged arm) drawn back, a fencer's lunge and a clean horizontal cut through it; the blade held out afterwards |
| CUT | goes to the foe; a single vertical chop, blade or claws edge-first, from overhead down through it, crisp and sharp |
| FURY CUTTER | goes to the foe; a quick crossing X of two slashes (the power grows each turn: the same clip, fierce every time) |
| FALSE SWIPE | goes to the foe; a feint first, then a restrained, precise backhand swipe that pulls up short of full power; a controlled finish |
| AERIAL ACE | goes to the foe **fast**: a springing leap high over it, a slash as it passes over (or drops down onto it), landing behind the strike point and hopping home; a blur of speed |
| BRICK BREAK | goes to the foe; the hand raised high, a karate chop straight down through it (a wall shattering), the body dropping into the chop |
| ROCK SMASH | goes to the foe; a hammer blow: the fist (or forepaw, or head) raised, smashes down onto it as onto a boulder |
| SMELLING SALT | goes to the foe; a brisk open-handed slap across its face (to wake it), a quick recoil of the hand |
| THIEF / COVET | goes to the foe; darts in low and sly (Covet: bouncy and cute first, begging), a quick swipe that snatches at it, then scampers home clutching the prize |

## Contact: fists

| move | action |
|---|---|
| MEGA PUNCH | goes to the foe; a haymaker: the fist wound far back, the shoulder and hips rotate, a huge straight right into its middle; follow-through leaning over the front foot |
| FIRE PUNCH | goes to the foe; a hook: the fist ablaze arcs in from the side into its jaw (flames flare) |
| ICE PUNCH | goes to the foe; a stiff jab-straight, the fist driven dead ahead, the arm locking out cold and hard |
| THUNDER PUNCH | goes to the foe; an overhand: the fist crackling up high, brought down over the top into it |
| DYNAMIC PUNCH | goes to the foe; a slow, huge wind-up (the whole body coiled), then an explosive full-body punch; the impact rocks both, a beat of stillness after |
| FOCUS PUNCH | the focus is its own situation clip (`focus`); the move: goes to the foe, an exploding straight from a still, focused stance, the most powerful punch in its set |
| SKY UPPERCUT | goes to the foe; crouches under it, then an uppercut rising through it, the feet leaving the ground, the fist high overhead at the top; drops back |
| COUNTER | braced as the blow lands (the game plays it after it was hit): absorbs, then springs to the foe and strikes back hard with the same weapon it was hit with: a fast, angry retaliation |

## Contact: kicks and feet

| move | action |
|---|---|
| DOUBLE KICK | goes to the foe; two kicks, one per hit. `double_kick_first`: leaps in, right snap kick into it, stays in guard; `double_kick_last`: left kick (hips turning into it), hop home. `double_kick` (a lone hit): in, one kick, home |
| MEGA KICK | goes to the foe; a long run-up leap, the kicking leg chambered high, a massive straight kick with the whole body behind it, the standing leg braced; follow-through turns the body |
| BLAZE KICK | goes to the foe; spinning: the body whirls, the heel ablaze, a roundhouse/spin kick at the top of a leap, landing deep; flames trail |
| STOMP | goes to the foe; jumps up and comes down with one big foot (or both, or the whole front) on it, grinding; a quadruped rears and brings the forefeet down |

## Contact: jaws

| move | action |
|---|---|
| BITE | goes to the foe; a lunge, jaws wide, snapping shut on it; a short tug before letting go |
| CRUNCH | goes to the foe; jaws wide, clamps down hard and **shakes** the head side to side, grinding; lets go with a wrench |
| POISON FANG | goes to the foe; a quick darting strike with bared fangs, a jab-bite and snap back like a snake |
| ASTONISH | sneaks to the foe low, then springs up in its face with a sudden "boo" (the head thrust forward, jaws open, arms flung wide), the foe jolts |

## Contact: the whole body

| move | action |
|---|---|
| TACKLE | goes to the foe; a short run and a shoulder (or body) charge into it, the body lunging in (`root.z`), bouncing off |
| QUICK ATTACK | a blur: barely any wind-up, a streaking dash low across the field, a glancing hit and a skid past or bounce off, snapping back home |
| HEADBUTT | goes to the foe; head lowered, a leaping ram with the skull, a jarring impact; the head shakes it off |
| TAKE DOWN / DOUBLE-EDGE | goes to the foe; a reckless all-out charge (Double-Edge: longer run-up, wilder), a crash into it, and it recoils hurt too (a wince, a stagger back) |
| STRENGTH | goes to the foe; plants itself and heaves: both arms (or the shoulders) shove it with enormous power, the legs driving |
| BODY SLAM | a leap high and a belly-flop crushing down on it with the whole weight; rolls off and hops home |
| SLAM | goes to the foe; whips round and slams the tail (or the body, a vine) down across it |
| WATERFALL | goes to the foe; a surging rush upward (as if climbing a waterfall), crashing into it from below |
| RETURN | goes to the foe; a joyful, loyal charge: a bounding leap, a strong full-body hit, a pleased look home |
| FRUSTRATION | goes to the foe; an angry, sulky stamp-and-charge, a spiteful hit, a huff |
| FACADE | goes to the foe; a gritty, determined charge (it hurts but it fights on) |
| SECRET POWER | goes to the foe; in the grass a quick charging strike (a scrappy ram) |
| ENDEAVOR | goes to the foe; a desperate, scrambling all-out tackle from a crouch |
| FLAIL / REVERSAL | goes to the foe; flails wildly, arms (or legs, tail) whirling, several frantic hits (one impact) |
| PURSUIT | a sneaky chase: slinks forward low, then a quick dark lunge-strike |
| BIDE | `bide_charge`: braced, gritting, shaking with stored energy (`charge`); `bide`: unleashes, rushing the foe and blasting into it |
| STRUGGLE | goes to the foe; a clumsy, exhausted flailing lunge, then it winces from the recoil |

## Contact: other parts

| move | action |
|---|---|
| IRON TAIL | goes to the foe; leaps and flips (or spins), the tail swung down like a steel club onto it |
| PECK | goes to the foe; the head cocked back, a fast beak (or snout) jab into it, the head rebounds |
| ROLLOUT / ICE BALL | curls into a ball and rolls at the foe along the ground, ramming into it, bouncing back and uncurling home |
| DIG | `dig_charge`: digs frantically and sinks out of sight (`dig`, `root.y` under -1); `dig`: travels under the field, bursts up out of the ground under the foe (`impact`), lands and hops home |
| DIVE | as Dig through water: `dive_charge` dives down with a splash, `dive` surges up under the foe |
| SEISMIC TOSS | goes to the foe, grabs it (`grab`), leaps up and back with it spinning, hurls it down into its place (`throw`) where it crashes (`impact`); hops home |
| OVERHEAT | not a blow: the body gathers, glows and then **erupts** with all its fire outward at the foe (a burst from home), then sags, spent |

## Ranged

| move | action |
|---|---|
| EMBER | a quick breath, then a snap of the head spitting a few embers |
| FLAMETHROWER | a deep breath, then a sustained stream of fire from the mouth, the head steady, the body braced |
| FIRE BLAST | a big breath, a lunge of the head, one huge blast (the 大 of flames) |
| FIRE SPIN | breathes a spiralling stream that circles the foe: the head sweeps round in a circle as it breathes |
| WATER GUN | puffs the cheeks, a quick squirt of water |
| WATER PULSE | gathers water in the hands (or at the mouth) into a pulsing ball and flings it |
| HYDRO PUMP | braces low and wide, then a massive high-pressure jet (from the mouth, or the species' water source), recoil pushing it back |
| MUD SHOT | scoops and spits (or flings) a burst of mud |
| MUD-SLAP | scoops mud from the ground with a hand (or foot, or tail) and slaps it into the foe's face |
| BULLET SEED | rapid spitting of seeds: `_first` the breath and a burst, `_next` more bursts (the head bobbing), `_last` a final burst and settle |
| PIN MISSILE | fires pins from its spikes (the body jolting with each volley): `_first`, `_next`, `_last` as Bullet Seed |
| POISON STING | a quick jab of the stinger (Wurmple's tail spikes, a horn) that fires a barb |
| SLUDGE BOMB | heaves up and hurls a big glob of sludge from the mouth |
| DRAGON BREATH | a fierce breath of shimmering dragon fire, the neck extended |
| ICY WIND | breathes a wide, cold wind across the foe, the head sweeping |
| ICE BEAM | gathers cold at the mouth (or hands), then a straight freezing beam |
| HYPER BEAM | gathers power (a long glow), braces, fires a massive beam, recoils; spent after (the next turn is `recharge`) |
| SOLAR BEAM | `solar_beam_charge`: turns to the sky and soaks in sunlight, glowing (`charge`); `solar_beam`: faces the foe and fires the gathered light |
| PSYBEAM | concentrates, the eyes (or antennae) glow, fires a wavering beam |
| SHADOW BALL | gathers a dark ball between the hands or at the mouth and hurls it |
| HIDDEN POWER | orbs of light gather around the body, then it sends them at the foe with a gesture |
| MIRROR COAT | braced, shining like a mirror, turns the blow back at the foe |
| THUNDERBOLT | tenses and crackles, then a bolt leaps from the body to the foe |
| SHOCK WAVE | a quick jolt thrown from the body at the foe |
| THUNDER WAVE | a crackling pulse sent at the foe (weak, a shiver of sparks) |
| THUNDER | calls a lightning bolt down on the foe from the sky, arms (or head) raised |
| CONFUSION / PSYCHIC | concentrates, still, the eyes glowing, head forward (Psychic: stronger, a lift of the whole body) |
| GUST | beats the wings (or arms) hard at the foe, whipping up wind |
| SILVER WIND | wings spread and beat, sending shimmering scales on the wind |
| WHIRLWIND | a huge beating of wings (or arms) that blows the foe away |
| BLIZZARD | rears and sends a howling storm of snow at the foe |
| SWIFT | a flick of the head (or tail) that sprays star-shaped rays |
| ROCK TOMB / ROCK SLIDE | calls rocks down on the foe: a heave upward, then a slam of the arms (or stamp) as they fall |
| SURF / MUDDY WATER | raises up and pushes forward; a wave rises behind it and crashes over the foe |
| WHIRLPOOL | spins its arms (or body) and whips up a whirlpool around the foe |
| EARTHQUAKE | rears up high and stomps down with everything; the ground shakes |
| ABSORB / MEGA DRAIN / GIGA DRAIN | reaches toward the foe, draws its energy in, glows as it heals |
| SNORE | asleep (eyes shut, slumped), a huge snore that blasts out |
| UPROAR | rears up and roars again and again, wild and loud |

## Status at the foe

| move | action |
|---|---|
| GROWL | leans in and growls cutely, head low, a little snarl |
| ROAR | rears up and roars with all its might, head thrown forward |
| SCREECH | a piercing shriek, head thrust forward, the whole body tense |
| HOWL | lifts the head to the sky and howls (raises its own attack) |
| LEER | a slow, menacing stare, leaning in, eyes narrowed |
| SCARY FACE | lunges the face at the foe, jaws wide, a terrifying grimace |
| TAUNT | a mocking gesture: a beckoning claw, a head toss, a smirk |
| TORMENT | a jeering, bobbing mockery at the foe |
| FORESIGHT / ODOR SLEUTH | peers intently at the foe (Odor Sleuth: sniffs it out, snout working) |
| MIMIC | watches the foe, then copies its pose |
| SNATCH | crouches, poised, ready to pounce on what the foe does next |
| TRICK | a sleight of hand: offers something, a quick swap |
| SAND-ATTACK | kicks (or flicks) sand at the foe's face |
| TAIL WHIP | turns and wags the tail cutely at the foe |
| CHARM | a sweet, cute pose, head tilted, a wink |
| ATTRACT | a flirty pose and a wink: hearts |
| SWAGGER | a swaggering, cocky strut and chest-out pose |
| TICKLE | goes to the foe and tickles it, fingers (or paws, antennae) wiggling |
| TOXIC | spews toxic liquid at the foe |
| LEECH SEED | spits (or flicks) a seed onto the foe |
| STRING SHOT | spits a stream of string at the foe |
| STUN SPORE | shakes (wings beating) a cloud of powder at the foe |
| YAWN | a big, slow, contagious yawn |
| FLASH | gathers light, then flares at the foe (the screen whites out) |

## Status on itself

| move | action |
|---|---|
| SWORDS DANCE | a fierce fighting dance: a spin, blades (claws) crossed and raised |
| BULK UP | flexes, muscles swelling |
| FOCUS ENERGY | still, tense, gathers focus, then a sharp exhale |
| BELLY DRUM | pounds its belly like a drum, harder and harder |
| CURSE | slows, hunching, bracing heavily (its speed falls, its power rises) |
| PSYCH UP | shakes its head and pumps itself up, fired up |
| MIRROR MOVE | watches, then copies the foe with a mirrored flourish (then the move plays) |
| SLEEP TALK | asleep, mumbling, the body twitching (then the move plays) |
| AGILITY | a quick, light bounce and shimmer: loosened up, fast |
| DOUBLE TEAM | darts side to side too fast to follow, afterimages |
| PROTECT / DETECT | braced, arms (or wings, shell) raised in a guard, a barrier (Detect: a sharp glint of the eyes) |
| ENDURE | braced, gritting the teeth, digging in |
| DEFENSE CURL | curls up tight |
| HARDEN | tenses and hardens, the body stiffening with a sheen |
| LIGHT SCREEN | raises a wall of light before itself |
| SAFEGUARD | a calm aura spreads over it |
| SUBSTITUTE | a burst of effort, then steps back (a doll takes its place; the game shows it) |
| REST | lies down and falls asleep, content |
| REFRESH | shakes itself off, refreshed |
| MORNING SUN / MOONLIGHT | turns up to the sky, soaking in the light, eyes closed |
| SUNNY DAY | raises its face to the sky and calls the sun |
| RAIN DANCE | a dance calling the rain |
| HAIL | calls the hail, arms (or head) raised to a cold sky |
| MUD SPORT | rolls and splashes in mud, coating itself |
