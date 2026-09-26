# Motif cookbook

One recipe per motif (`src/battle3d/motifs.ts`). Times are for a mid-weight
biped; stretch them ~1.2× for heavy species and quadrupeds, compress ~0.85×
for light, fast ones. "t" = seconds from the clip start. Every clip starts
and ends on the stance.

## Contact (event: `impact`, `advance: 1` at the hit)

**strike** (Scratch, Slash, Leaf Blade, Dragon Claw, Crush Claw)
- 0.12 wind-up: crouch, torso twists the striking side back, claw/blade cocked
  high behind. 0.25 leap in (`TUCK`, `root.y` 0.06–0.08). 0.38 land (`LAND`).
  0.46 `snap`: torso unwinds, the limb sweeps down and across. 0.64
  follow-through: the limb hangs past the foe. 0.8 guard. 0.96–1.08 hop home.
- `impact` ≈ strike key + 0.05 (forearm/hand overlap).
- Blades on the forearm (Sceptile): lead with the forearm edge, not the hand.
  Quadrupeds: rear onto the hind legs (`plantFront: 0`, pelvis back) and swipe
  with a front leg.

**punch** (Fire Punch, Mega Punch, Sky Uppercut, Focus Punch)
- Chamber the fist at the hip (the stance's back hand), step in, hips and
  shoulders turn into the punch, the arm drives straight at the foe. Sky
  Uppercut: crouch deep, rise with the fist driving up through the foe, feet
  leave the ground. Fire/Ice/Thunder Punch: `fx` flare on the fist if it has
  one.

**kick** (Double Kick, Blaze Kick, Low Kick, Stomp)
- Standing foot planted (`plantLeft: 1, plantRight: 0`), kicking thigh
  chambers (knee up), then the shin snaps out; body leans away. Strong kicks:
  leap and spin (Blaze Kick, `root.yaw` to 360). Stomp: rear up, drive the foot
  down onto the foe. Impact on the key (legs have no overlap delay).

**bite** (Bite, Crunch, Hyper Fang)
- Lead with the head: crouch low, lunge with the neck extended and the jaw wide
  (`jaw` 35–45°), snap shut at the foe (`snap`), then a head shake (two or three
  quick `head.y`/`head.z` swings) before releasing. Impact on the shut + head
  overlap (≈ +0.065 s). Big-jawed species (Feraligatr) open wider and shake
  harder; turtles (Blastoise) snap from a braced stance.

**tackle** (Tackle, Take Down, Double-Edge, Headbutt, Skull Bash)
- Crouch with the head down, charge in a low arc with the head or shoulder
  leading, hit with the body, bounce back a step (recoil) and hop home. Skull
  Bash: tuck the head, big wind-up. Quadrupeds: all four feet leave the ground
  in the leap (`plantFeet: 0`, `plantFront: 0`).

**slam** (Body Slam, Slam)
- Leap high (`root.y` 0.15–0.25) and come down on the foe with the whole body
  (`root.pitch` forward), impact on the landing with a big `LAND` and shake.
  Quadrupeds rear up first (`plantFront: 0`, pelvis back and down).

**tail** (Iron Tail, Poison Tail) — turn away (`root.yaw` 120–180), whip the
tail through the foe, turn back. **wing** (Wing Attack, Steel Wing) — wings
drawn back, a flying lunge, wings sweep forward through the foe.
**peck/horn** — head cocked back, a straight jab (drill: `head.z` spin).
**spin** (Rapid Spin, Rollout, Flame Wheel) — curl or withdraw (arms and head
in), `root.yaw` spins several turns (720+) while travelling, uncurl at home.
Flame Wheel: `fx` flames on. **grapple** — grab (arms forward), lift or
squeeze, throw. **vine** (Vine Whip) — brace, the body jerks as vines lash out
from under the flower/leaves (the VFX draws the vines at the foe).

**toss** (Seismic Toss, Vital Throw, Submission) — events `grab`, `throw`, `impact`
- Rush in (a leap, arms reaching), land at the foe (`advance: 1`) and `grab`
  when the hands arrive (key + ~0.07 s). From then the foe rides rigidly in
  the grip — between the hands, turned with the chest — so whatever the arms
  and chest do moves the foe with them.
- Sink with it (load), then spring up **and back toward mid-field** (advance
  1 → ~0.5) holding it up in front — not overhead: the player's Pokémon is
  close to the camera and leaves the screen if lifted high — spinning round
  with it (`root.yaw` 0 → 360).
- Facing the foe's place again, lean back, whip forward: `throw` on the hurl.
  The foe flies back down into its own place, landing on its side at the
  next `impact` (0.2–0.3 s later: rocks, dust, a heavy shake), lies there and
  gets up. Land deep, watch it crash, hop home. Both views see the crash
  because it happens in the foe's own spot while the attacker is at advance
  ≤ 0.4.
- Vital Throw: grab, turn (`root.yaw` ~180) and throw it over the shoulder.
  An impact without a throw drops the foe where the grip is (a slam).

**burrow** (Dig, Dive) — events `dig`, `impact`
- Crouch, drive the claws or hands into the ground: `dig` (dirt bursts at the
  feet; a splash for water moves), sink out of sight (`root.y` to about -1.3,
  gathering speed; `plantFeet: 0` underground — nothing to stand on), travel
  to the foe (advance 0 → 1: the director heaves mounds along the way), burst
  up in front of it (`root.y` -1.25 → 0.3 in ~0.15 s) with a rising strike —
  `impact` as it breaks the surface. Come down, hold the crouch ≥ 0.25 s, hop
  home.

## Ranged (event: `release`, plus `releaseEnd` when sustained)

**breath** (Flamethrower, Dragon Breath, Icy Wind) — the mouth
- 0.14 settle, 0.5 inhale (chest up, head back, beak/jaw to the sky, elbows
  back, `charge` at 0.1), hold 0.15 swelling, `snap` 0.78: head drives forward
  and down at the foe, jaw wide, body braced low; sustain to ~1.6 with small
  head sweeps (`head.y` ±4–5), then close the jaw and shake it off.
  `release` ≈ snap + 0.065, `releaseEnd` ≈ end of sustain.
- Arms stay braced (fists at the sides) — they are not part of a breath attack.

**spit** (Ember, Water Gun, Bubble, Mud Shot, Sludge, Bullet Seed)
- Quick breath in (0.24: head back), `snap` 0.34 head forward, jaw open,
  `release` ≈ 0.40, recoil (head bobs back), settle. Multi-hit spit (Bullet
  Seed): 3–5 quick head pecks with a release each.

**beam** (Solar Beam, Hyper Beam, Ice Beam, Aurora Beam)
- Long gather with `charge` (Solar Beam: turn the emitter up to the sky, soak
  up light), brace wide, aim the emitter (mouth, flower, cannons) at the foe,
  `release`, hold rigid with a tremor while it fires, `releaseEnd`, recoil and
  sag (Hyper Beam: exhausted slump).

**jet** (Hydro Pump, Hydro Cannon, Water Spout)
- Brace wide and low (a big `LAND`-like crouch, feet planted), aim the emitter
  (Blastoise: level the shell so both cannons point at the foe; others: the
  mouth), `release`, the recoil pushes the whole body back (`root.z` -0.02 to
  -0.04, pelvis back) and holds, `releaseEnd`, straighten up.

**throw** (Razor Leaf, Magical Leaf, Swift, Rock Throw, Rock Slide)
- A flick or sweep that launches the volley from the emitter: Venusaur shakes
  its fronds/flower (body twist and shimmy), Sceptile whips its arms across,
  Meganium swings its neck so the petals fling. `release` on the fling.

**fling** (Mud-Slap) — scoop the ground with a hand (or a foot:
`emitterFor: { fling: 'feet' }`) and hurl the clod: weight back, the
scooping limb draws back along the ground, then snaps forward and up;
`release` on the snap (plus the overlap for a hand).

**wave** (Surf, Muddy Water) — rear up tall, arms or body raised, push
forward and down; the wave rolls from the attacker's feet. **quake**
(Earthquake, Magnitude) — rear up (quadrupeds: front feet off the ground), stomp
down hard, `impact` on the stomp (the director shakes the screen and bursts
dirt at the foe). **burst** (Overheat, Eruption, Blast Burn) — gather in
(curl, `charge`), then explode outward (arms and head thrown back, `fx` max),
`release` on the explosion. **erupt** (Frenzy Plant, Thunder) — summon: plant
the feet, raise the emitter or roar skyward, `release` when the power arrives
at the foe. **storm/bolt/mind/orb/drain/sound** — see `MOTIFS[m].body`; keep
the emitter aimed at the foe and the rest of the body still.

## Status (events: `emit` toward the foe, `aura` on self)

**roar** (Growl, Roar, Screech) — rear up, lunge the head forward, jaw open,
a head sway. **glare** (Leer, Scary Face) — lean in, head low and forward,
angry eyes, hold. **kick_sand** (Sand-Attack) — weight back, one foot scoops the
ground forward (`plantRight: 0`), `emit` on the scoop. **powder** (Sleep
Powder, Stun Spore) — shake the emitter (Venusaur's flower: body shimmy), `emit`
at the peak. **buff** (Bulk Up, Swords Dance, Growth) — gather in with eyes
shut, then flex or pose, `aura` at the peak, tremor. **shield** (Withdraw,
Protect, Harden) — brace or pull into the shell (head and limbs in), `aura`.
**heal** (Synthesis, Rest) — face up to the light, eyes closed, calm sway,
`aura`. **weather** (Rain Dance, Sunny Day) — look up and call. **charm** (Tail
Whip) — turn and wag the tail at the foe, `emit`. **afterimage** (Double
Team, Agility) — quick darting hops side to side (`root.x` ±0.25–0.3, about
0.1 s a hop, guard up), `aura` early (≈0.2 s): the afterimages run 1.4 s from
it (Double Team: two darkened copies swinging out; Agility: a trail behind
the darts, so the darts must move the body). **flash** (Flash) — gather
(curl in, eyes shut), then flare up and open toward the foe (chest up,
arms or leaves spread), `emit` on the flare: the screen turns white and both
Pokémon black, then fade back (the director does it).

## Body-plan notes

- **Quadrupeds** (Venusaur, Meganium): power comes from the whole body — lower
  the chest (front legs bend back, `rig.frontLegs`), rear up with `plantFront:
  0`, travel with all feet off the ground. The head is low: breath/beam aims
  forward, not down.
- **Shelled** (Blastoise): the shell doesn't bend — spine and chest move little;
  act with the legs, arms, head and whole-body tilt (`root.pitch`, `root.roll`).
- **Winged** (Charizard): wings are arms in the rig or spring chains; beat them
  (big arcs) in anticipation and flight, fold them in strikes.
- **Long necks** (Meganium): the neck chain leads; overlap does most of the whip.
- **Long tails** (Charizard, Feraligatr, Sceptile): springs follow; for tail
  moves keyframe the tail chain explicitly.
