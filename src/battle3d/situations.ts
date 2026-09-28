// What a Pokémon acts out in battle besides its moves: every situation the
// game's battles put it in, each with its own clip. Every species has a clip
// for every one (the gauntlet fails a species without it). The compiled
// game's battles play them on the game's own events, animations and
// messages (src/remake/acting.ts); a move's clip is picked by clipFor
// (./director.ts) and its variants below.

/** Situation clips, and what the body does in each (for clip authors). */
export const SITUATIONS: Record<string, string> = {
  // Every battle.
  idle: 'breathing, weight shifting, eyes on the foe: alive, never frozen (loops)',
  intro: 'out of its ball or revealed: a curled crouch, bursts up, cries with a moving hold, settles to its stance',
  hit: 'struck: snaps away from the blow within 3 frames, eases back, a small overshoot, settles',
  hit_strong: 'a critical or super-effective blow: knocked further back, staggers a step, recovers',
  faint: 'reels, sways, knees buckle, curls over (then shrinks away)',
  // Engaging the foe.
  dodge: "the foe's move misses it: a quick sidestep, hop or duck out of the way, then back on guard",
  unaffected: 'a move has no effect on it (or it protected itself): stands firm, shrugs it off, unimpressed',
  return_home: 'at the foe after a run of hits (starts at advance 1, in the pose its _first/_next variants end on): pushes off and leaps home, lands, settles to its stance',
  // A status condition's animation (inflicted, or each turn it acts under it).
  status_sleep: 'drowsy sway, eyes shut, head sinking; slow breaths',
  status_poison: 'a sickly shudder, hunched, wincing',
  status_burn: 'flinches from the burn, shakes it off',
  status_paralysis: 'seizes up and twitches, stiff limbs',
  status_freeze: 'locked still in the ice, straining to break free',
  status_confusion: 'wobbles off balance, head swimming',
  status_infatuation: 'lovestruck: sways, distracted, head tilted',
  status_curse: 'hunched in pain under the curse',
  status_nightmare: 'writhes in its sleep',
  status_wrapped: 'squeezed by a bind or trap: strains against it',
  // States that last (loops the battle plays instead of idle while they last).
  idle_asleep: 'asleep: slumped or curled, eyes shut, slow deep breaths (loops while it sleeps)',
  idle_tired: 'worn down (a quarter of its HP or less): heavy panting, guard sagging, still facing the foe (loops)',
  // The game's other animations on a battler.
  stat_up: 'powers up: draws itself up, chest out, a fierce pose',
  stat_down: 'weakened: shrinks back, unsteady',
  level_up: 'grown stronger: a proud flourish',
  drained: 'Leech Seed saps it: sags as the energy leaves',
  healed: 'healed (Ingrain, Wish, a held item): relaxes, refreshed',
  focus: "Focus Punch's setup: tightens its focus, fist drawn back",
  hang_on: 'hangs on at 1 HP (Focus Band, Endure): staggers but stays up',
  // What the game only says (a message, no animation).
  flinch: '"flinched!": startled, recoils and falters, can\'t act',
  recharge: '"must recharge!": spent after a huge move, panting, can\'t move',
  wake: '"woke up!": startles awake, shakes the sleep off, back on guard',
  shake_off: 'thawed out, snapped out of confusion, free of a bind, a status healed: shakes it off, back on guard',
  break_free: 'bursts back out of a Poké Ball ("Oh, no! The POKéMON broke free!"): shakes itself, angry, back in its stance',
  // The weather, at the end of each turn it lasts.
  weather_rain: 'the rain keeps falling: shakes the water off (a Water type revels in it)',
  weather_sun: 'the sunlight is strong: squints and shades itself (a Fire or Grass type basks)',
  weather_sand: 'the sandstorm rages: braces and shields its eyes',
  weather_hail: 'the hail keeps falling: flinches and hunches from the hailstones',
};

/** Situation clips only species with an ability need (by its name, as species.json lists abilities): its clip, and what the body does. */
export const ABILITY_SITUATIONS: Record<string, { clip: string; about: string }> = {
  INTIMIDATE: { clip: 'intimidate', about: 'comes out and glares the foe down, menacing (Intimidate cuts its Attack)' },
};

/**
 * A multi-hit move (Double Kick, Fury Swipes, Pin Missile...) plays its clip
 * once per hit: the first leaps to the foe and stays there, the ones between
 * strike again from there (another limb, another angle), the last strikes and
 * goes home (a lone hit plays the move's own clip). Their variants of the
 * move's clip, by name suffix. Between hits the body holds where its variant
 * ended; if the next hit doesn't come soon it goes home with 'return'.
 */
export const MULTI_HIT_VARIANTS = { first: '_first', next: '_next', last: '_last' } as const;

/** A two-turn move's first turn (Solar Beam gathering light, Dig burrowing, Bide storing energy): its clip's variant. */
export const CHARGE_VARIANT = '_charge';

/** A two-turn move's second turn, where its clip is played in two pieces (src/battle3d/variants.ts). */
export const SECOND_TURN_VARIANT = '_turn2';

/** The way home from the foe after a multi-hit run whose next hit didn't come, cut from the run's clip. */
export const HOME_VARIANT = '_home';

/**
 * Moves that take two turns, by their effect: the game plays the first turn's
 * animation (its choosetwoturnanim's first branch) with animTurn 0.
 */
export const TWO_TURN_EFFECTS = new Set(['EFFECT_RAZOR_WIND', 'EFFECT_SKY_ATTACK', 'EFFECT_SKULL_BASH', 'EFFECT_SOLAR_BEAM', 'EFFECT_SEMI_INVULNERABLE', 'EFFECT_BIDE']);

/** Moves that hit several times in one turn (the game counts the hits down in gMultiHitCounter), by their effect. */
export const MULTI_HIT_EFFECTS = new Set(['EFFECT_MULTI_HIT', 'EFFECT_DOUBLE_HIT', 'EFFECT_TRIPLE_KICK', 'EFFECT_TWINEEDLE']);
/** ... of them, those with more than two hits (a _next variant between the first and the last). */
export const MANY_HIT_EFFECTS = new Set(['EFFECT_MULTI_HIT', 'EFFECT_TRIPLE_KICK']);

/** The events a clip marks where the game's own effects for its move begin (the game's animation waits for the first). */
export const EFFECT_EVENTS = new Set(['impact', 'release', 'emit', 'aura', 'grab', 'dig', 'charge']);
