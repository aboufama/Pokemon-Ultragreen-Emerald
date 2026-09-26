// Move motifs: what a move *looks like* when a Pokémon performs it, read from
// the move's name, effect, contact flag, type and power. Categories
// (physical/special x weak/strong, status) say how hard a move hits; motifs
// say which body action and effect shape it has: a bite, a claw swipe, a kick,
// a breath stream from the mouth, a water jet from cannons, a leaf volley, a
// ground quake...
//
// Species pick bespoke clips per motif (SpeciesProfile.motifClips) and say
// where each motif's effect comes from (emitters: mouth, cannons, flower...),
// so "Hydro Pump" is a braced cannon blast for Blastoise and a jet from the
// jaws for Feraligatr, from the same move data.

import type { MoveData } from '../data';

export type Motif =
  // Contact: the body reaches the foe (clip events: impact, one per hit).
  | 'strike' | 'punch' | 'kick' | 'bite' | 'tackle' | 'slam' | 'tail' | 'wing' | 'peck' | 'horn' | 'spin' | 'grapple' | 'vine'
  // ... and the foe is carried (toss: grab), or the attacker goes underground first (burrow: dig).
  | 'toss' | 'burrow'
  // Ranged: something travels from an emitter (release, releaseEnd; charge).
  | 'breath' | 'spit' | 'beam' | 'jet' | 'throw' | 'wave' | 'quake' | 'burst' | 'erupt' | 'storm' | 'bolt' | 'mind' | 'orb' | 'drain' | 'sound' | 'fling'
  // Status (emit, aura, heal).
  | 'roar' | 'glare' | 'kick_sand' | 'powder' | 'buff' | 'shield' | 'heal' | 'weather' | 'charm' | 'afterimage' | 'flash' | 'other';

export type MotifKind = 'contact' | 'ranged' | 'status';

export interface MotifInfo {
  kind: MotifKind;
  /** Category clip used when a species has no clip for this motif. */
  fallback: 'physical' | 'special' | 'status_self' | 'status_target';
  /** What the body does (for clip authors). */
  body: string;
  /** Events the director reacts to in this motif's clip. */
  events: string[];
  /**
   * Events a clip for this motif must have (the gauntlet checks them); by
   * default the kind's main one: impact (contact), release (ranged), the
   * first of `events` (status).
   */
  requires?: string[];
  /** Default emitter for the effect (species override with emitterFor). */
  emitter?: 'mouth' | 'hands' | 'feet' | 'body' | 'eyes';
}

export const MOTIFS: Record<Motif, MotifInfo> = {
  strike: { kind: 'contact', fallback: 'physical', body: 'claw, blade or chop swipe: wind-up behind, fast arc through the foe, follow-through', events: ['impact'], emitter: 'hands' },
  punch: { kind: 'contact', fallback: 'physical', body: 'fist driven from the hip, shoulder and hips turning into it', events: ['impact'], emitter: 'hands' },
  kick: { kind: 'contact', fallback: 'physical', body: 'standing foot planted, kicking leg chambers then snaps out', events: ['impact'], emitter: 'feet' },
  bite: { kind: 'contact', fallback: 'physical', body: 'lunge with the jaws wide, snap shut on the foe, shake', events: ['impact'], emitter: 'mouth' },
  tackle: { kind: 'contact', fallback: 'physical', body: 'crouch, charge with the head or shoulder leading, bounce back', events: ['impact'], emitter: 'body' },
  slam: { kind: 'contact', fallback: 'physical', body: 'leap or rear up and come down on the foe with the whole body', events: ['impact'], emitter: 'body' },
  tail: { kind: 'contact', fallback: 'physical', body: 'turn away and whip the tail through the foe', events: ['impact'], emitter: 'body' },
  wing: { kind: 'contact', fallback: 'physical', body: 'wings drawn back, then a sweeping wing strike', events: ['impact'], emitter: 'body' },
  peck: { kind: 'contact', fallback: 'physical', body: 'head cocked back, beak jabs forward (drill: spinning)', events: ['impact'], emitter: 'mouth' },
  horn: { kind: 'contact', fallback: 'physical', body: 'head lowered, horn drives forward', events: ['impact'], emitter: 'body' },
  spin: { kind: 'contact', fallback: 'physical', body: 'curl up and spin or roll into the foe', events: ['impact'], emitter: 'body' },
  grapple: { kind: 'contact', fallback: 'physical', body: 'seize or wrap around the foe and squeeze (Bind, Wrap, Constrict)', events: ['impact'], emitter: 'hands' },
  vine: { kind: 'contact', fallback: 'physical', body: 'vines lash out from the body at the foe', events: ['impact'], emitter: 'body' },
  toss: {
    kind: 'contact', fallback: 'physical',
    body: 'rush in and seize the foe (grab: from here the foe rides in the hands), heave it off its feet (Seismic Toss: leap up and back toward mid-field with it, spinning), hurl it back down into its own place (throw) where it crashes (impact: it lands then); or slam it down where you stand (impact without a throw). Then hop home',
    events: ['grab', 'throw', 'impact'], requires: ['grab', 'impact'], emitter: 'hands',
  },
  burrow: {
    kind: 'contact', fallback: 'physical',
    body: 'dig or dive down out of sight (dig: sink below the ground with root.y), travel under the field, then burst up out of the ground beneath the foe (impact), land and hop home',
    events: ['dig', 'impact'], requires: ['dig', 'impact'], emitter: 'feet',
  },
  breath: { kind: 'ranged', fallback: 'special', body: 'drawn breath, head drives forward, sustained stream from the mouth', events: ['charge', 'release', 'releaseEnd'], emitter: 'mouth' },
  spit: { kind: 'ranged', fallback: 'special', body: 'quick breath, head snaps forward, a projectile from the mouth', events: ['release'], emitter: 'mouth' },
  beam: { kind: 'ranged', fallback: 'special', body: 'gather power (charge glow), brace, fire a sustained beam, recoil', events: ['charge', 'release', 'releaseEnd'], emitter: 'mouth' },
  jet: { kind: 'ranged', fallback: 'special', body: 'brace wide and low, a high-pressure jet with heavy recoil', events: ['release', 'releaseEnd'], emitter: 'mouth' },
  throw: { kind: 'ranged', fallback: 'special', body: 'a flick or sweep that sends a volley of leaves, stars or rocks', events: ['release'], emitter: 'body' },
  wave: { kind: 'ranged', fallback: 'special', body: 'raise up and push forward; a wave rolls across the field', events: ['release'], emitter: 'body' },
  quake: { kind: 'ranged', fallback: 'physical', body: 'rear up and stomp; the ground shakes', events: ['impact'], emitter: 'feet' },
  burst: { kind: 'ranged', fallback: 'special', body: 'gather in, then explode outward with everything', events: ['charge', 'release'], emitter: 'body' },
  erupt: { kind: 'ranged', fallback: 'special', body: 'summon: power erupts at the foe from the ground or sky', events: ['charge', 'release'], emitter: 'body' },
  storm: { kind: 'ranged', fallback: 'special', body: 'whip up wind or snow at the foe (wings, arms or breath)', events: ['release'], emitter: 'body' },
  bolt: { kind: 'ranged', fallback: 'special', body: 'tense and crackle, electricity leaps to the foe', events: ['charge', 'release'], emitter: 'body' },
  mind: { kind: 'ranged', fallback: 'special', body: 'concentrate (still, head forward), the foe is gripped by the power', events: ['release'], emitter: 'eyes' },
  orb: { kind: 'ranged', fallback: 'special', body: 'form an orb between hands or at the mouth and hurl it', events: ['charge', 'release'], emitter: 'mouth' },
  drain: { kind: 'ranged', fallback: 'special', body: 'reach toward the foe; energy flows back to the attacker', events: ['release'], emitter: 'body' },
  sound: { kind: 'ranged', fallback: 'special', body: 'rear up and bellow at the foe; sound waves', events: ['release'], emitter: 'mouth' },
  fling: { kind: 'ranged', fallback: 'special', body: 'scoop a clod of mud or sand off the ground with a hand (or foot) and hurl it at the foe', events: ['release'], emitter: 'hands' },
  roar: { kind: 'status', fallback: 'status_target', body: 'rear up, then lunge the head forward and roar or cry', events: ['emit'], emitter: 'mouth' },
  glare: { kind: 'status', fallback: 'status_target', body: 'lean in and stare the foe down; eyes glint', events: ['emit'], emitter: 'eyes' },
  kick_sand: { kind: 'status', fallback: 'status_target', body: 'scoop the ground with a foot and fling sand at the foe', events: ['emit'], emitter: 'feet' },
  powder: { kind: 'status', fallback: 'status_target', body: 'shake or puff; spores or powder drift to the foe', events: ['emit'], emitter: 'body' },
  buff: { kind: 'status', fallback: 'status_self', body: 'gather in, then flex or pose with an aura', events: ['aura'], emitter: 'body' },
  shield: { kind: 'status', fallback: 'status_self', body: 'brace or withdraw into a guard; a barrier forms', events: ['aura'], emitter: 'body' },
  heal: { kind: 'status', fallback: 'status_self', body: 'calm, eyes closed, soak up light or rest', events: ['aura'], emitter: 'body' },
  weather: { kind: 'status', fallback: 'status_self', body: 'look up and call the weather', events: ['aura'], emitter: 'body' },
  charm: { kind: 'status', fallback: 'status_target', body: 'a cute or taunting gesture at the foe (tail wag, wink)', events: ['emit'], emitter: 'body' },
  afterimage: { kind: 'status', fallback: 'status_self', body: 'dart from side to side too fast to follow (quick hops, root.x); afterimages of the body flicker around it from the aura on', events: ['aura'], emitter: 'body' },
  flash: { kind: 'status', fallback: 'status_target', body: 'gather light, then flare up at the foe: the screen flashes white and both battlers show as black silhouettes (emit)', events: ['emit'], emitter: 'body' },
  other: { kind: 'status', fallback: 'status_self', body: 'anything else: uses the category clip', events: [] },
};

const BY_NAME: Record<string, Motif> = {};
const add = (motif: Motif, names: string) => {
  for (const n of names.split(',')) BY_NAME[n.trim()] = motif;
};
add('strike', 'POUND, KARATE CHOP, DOUBLESLAP, SCRATCH, VICEGRIP, GUILLOTINE, CUT, SLASH, FURY SWIPES, CRUSH CLAW, METAL CLAW, DRAGON CLAW, FALSE SWIPE, CROSS CHOP, BRICK BREAK, ROCK SMASH, LEAF BLADE, NEEDLE ARM, FURY CUTTER, KNOCK OFF, THIEF, COVET, FAINT ATTACK, SMELLINGSALT, FAKE OUT, CRABHAMMER, AERIAL ACE, BEAT UP');
add('punch', 'COMET PUNCH, MEGA PUNCH, FIRE PUNCH, ICE PUNCH, THUNDERPUNCH, DIZZY PUNCH, MACH PUNCH, DYNAMICPUNCH, FOCUS PUNCH, SHADOW PUNCH, METEOR MASH, SKY UPPERCUT, ARM THRUST, COUNTER, REVENGE');
add('kick', 'STOMP, DOUBLE KICK, MEGA KICK, JUMP KICK, HI JUMP KICK, ROLLING KICK, LOW KICK, TRIPLE KICK, BLAZE KICK');
add('bite', 'BITE, CRUNCH, HYPER FANG, SUPER FANG, POISON FANG, LEECH LIFE, LICK, ASTONISH, CLAMP');
add('tackle', 'TACKLE, TAKE DOWN, DOUBLE-EDGE, HEADBUTT, SKULL BASH, QUICK ATTACK, EXTREMESPEED, RAGE, STRUGGLE, RETURN, FRUSTRATION, FACADE, ENDEAVOR, PURSUIT, SPARK, VOLT TACKLE, SUPERPOWER, STRENGTH, BIDE, REVERSAL, FLAIL, THRASH, OUTRAGE, PETAL DANCE, WATERFALL, SECRET POWER');
add('slam', 'BODY SLAM, SLAM, BOUNCE');
add('tail', 'IRON TAIL, POISON TAIL');
add('wing', 'WING ATTACK, STEEL WING, FLY, SKY ATTACK');
add('peck', 'PECK, DRILL PECK');
add('horn', 'HORN ATTACK, FURY ATTACK, HORN DRILL, MEGAHORN');
add('spin', 'RAPID SPIN, ROLLOUT, ICE BALL, FLAME WHEEL');
add('grapple', 'BIND, WRAP, CONSTRICT');
add('toss', 'SEISMIC TOSS, VITAL THROW, SUBMISSION');
add('burrow', 'DIG, DIVE');
add('vine', 'VINE WHIP');
add('breath', 'FLAMETHROWER, DRAGONBREATH, ICY WIND, POWDER SNOW, SMOG, HEAT WAVE, FIRE SPIN, SACRED FIRE, MIST, HAZE');
add('spit', 'EMBER, WATER GUN, BUBBLE, ACID, SLUDGE, SLUDGE BOMB, MUD SHOT, OCTAZOOKA, POISON STING, TWINEEDLE, PIN MISSILE, SPIKE CANNON, BULLET SEED, BARRAGE, EGG BOMB, SPIT UP, WATER PULSE, FIRE BLAST, BONE CLUB, BONE RUSH');
add('beam', 'SOLARBEAM, HYPER BEAM, ICE BEAM, AURORA BEAM, BUBBLEBEAM, PSYBEAM, SIGNAL BEAM, TRI ATTACK, AEROBLAST');
add('jet', 'HYDRO PUMP, HYDRO CANNON, WATER SPOUT');
add('throw', 'RAZOR LEAF, MAGICAL LEAF, SWIFT, ROCK THROW, ROCK SLIDE, ROCK TOMB, ANCIENTPOWER, RAZOR WIND, AIR CUTTER, ICICLE SPEAR, ROCK BLAST, BONEMERANG, PAY DAY, SPIKES');
add('wave', 'SURF, MUDDY WATER, SONICBOOM, DRAGON RAGE');
add('quake', 'EARTHQUAKE, MAGNITUDE, FISSURE');
add('burst', 'OVERHEAT, ERUPTION, BLAST BURN, SELFDESTRUCT, EXPLOSION, PSYCHO BOOST, PRESENT');
add('erupt', 'FRENZY PLANT, THUNDER, WHIRLPOOL, SAND TOMB, FUTURE SIGHT, DOOM DESIRE, SHEER COLD');
add('storm', 'GUST, TWISTER, BLIZZARD, SILVER WIND, WHIRLWIND');
add('bolt', 'THUNDERSHOCK, THUNDERBOLT, THUNDER WAVE, SHOCK WAVE, CHARGE');
add('mind', 'CONFUSION, PSYCHIC, PSYWAVE, EXTRASENSORY, DREAM EATER, NIGHT SHADE, KINESIS, TELEPORT');
add('orb', 'SHADOW BALL, WEATHER BALL, MIST BALL, LUSTER PURGE, ZAP CANNON, HIDDEN POWER, MIRROR COAT');
add('drain', 'ABSORB, MEGA DRAIN, GIGA DRAIN, PAIN SPLIT');
add('sound', 'HYPER VOICE, UPROAR, SNORE');
add('fling', 'MUD-SLAP');
add('roar', 'GROWL, ROAR, SCREECH, SING, SUPERSONIC, METAL SOUND, GRASSWHISTLE, PERISH SONG, HOWL');
add('glare', 'LEER, SCARY FACE, GLARE, MEAN LOOK, BLOCK, HYPNOSIS, CONFUSE RAY, DISABLE, FORESIGHT, ODOR SLEUTH, MIND READER, LOCK-ON, TAUNT, TORMENT, SPITE, GRUDGE, IMPRISON, NIGHTMARE, SPIDER WEB, ENCORE, SNATCH');
add('kick_sand', 'SAND-ATTACK, MUD SPORT, SMOKESCREEN');
add('powder', 'SLEEP POWDER, STUN SPORE, POISONPOWDER, SPORE, COTTON SPORE, SWEET SCENT, AROMATHERAPY, LEECH SEED, POISON GAS, TOXIC, STRING SHOT, WILL-O-WISP, YAWN, INGRAIN');
add('buff', 'SWORDS DANCE, GROWTH, MEDITATE, SHARPEN, AMNESIA, BELLY DRUM, CURSE, MINIMIZE, FOCUS ENERGY, BULK UP, CALM MIND, DRAGON DANCE, COSMIC POWER, TAIL GLOW, STOCKPILE, PSYCH UP');
add('shield', 'WITHDRAW, HARDEN, IRON DEFENSE, BARRIER, ACID ARMOR, DEFENSE CURL, PROTECT, DETECT, ENDURE, LIGHT SCREEN, REFLECT, SAFEGUARD, SUBSTITUTE, MAGIC COAT');
add('heal', 'RECOVER, SOFTBOILED, REST, MILK DRINK, MORNING SUN, SYNTHESIS, MOONLIGHT, SLACK OFF, WISH, SWALLOW, REFRESH, HEAL BELL');
add('weather', 'SUNNY DAY, RAIN DANCE, SANDSTORM, HAIL, WATER SPORT');
add('afterimage', 'DOUBLE TEAM, AGILITY');
add('flash', 'FLASH');
add('charm', 'TAIL WHIP, CHARM, TICKLE, FLATTER, SWAGGER, FAKE TEARS, ATTRACT, SWEET KISS, LOVELY KISS, TEETER DANCE, FEATHERDANCE, FOLLOW ME, HELPING HAND, SPLASH');

const SELF_TARGETS = new Set(['MOVE_TARGET_USER', 'MOVE_TARGET_USER_OR_SELECTED', 'MOVE_TARGET_DEPENDS']);

/** Ranged fallback by type, for moves not in the table. */
const RANGED_BY_TYPE: Record<string, [weak: Motif, strong: Motif]> = {
  TYPE_FIRE: ['spit', 'breath'],
  TYPE_WATER: ['spit', 'jet'],
  TYPE_GRASS: ['throw', 'beam'],
  TYPE_ELECTRIC: ['bolt', 'bolt'],
  TYPE_ICE: ['breath', 'beam'],
  TYPE_PSYCHIC: ['mind', 'mind'],
  TYPE_GHOST: ['orb', 'orb'],
  TYPE_DRAGON: ['breath', 'breath'],
  TYPE_ROCK: ['throw', 'throw'],
  TYPE_GROUND: ['spit', 'quake'],
  TYPE_POISON: ['spit', 'spit'],
  TYPE_BUG: ['spit', 'beam'],
  TYPE_FLYING: ['storm', 'storm'],
  TYPE_DARK: ['orb', 'orb'],
  TYPE_STEEL: ['orb', 'beam'],
  TYPE_FIGHTING: ['orb', 'orb'],
  TYPE_NORMAL: ['orb', 'beam'],
};

export const STRONG_POWER = 75;

export function isStrong(move: MoveData): boolean {
  return move.power >= STRONG_POWER || move.power === 1;
}

/** The motif a move's name maps to, if the table lists it (else motifOf infers one). */
export function namedMotif(move: MoveData): Motif | undefined {
  return BY_NAME[move.name];
}

/** The motif of a move (see MOTIFS). */
export function motifOf(move: MoveData): Motif {
  const named = BY_NAME[move.name];
  if (named) return named;
  if (move.power === 0) return SELF_TARGETS.has(move.target) ? 'buff' : 'glare';
  if (move.flags.includes('FLAG_MAKES_CONTACT')) {
    const n = move.name;
    if (/KICK/.test(n)) return 'kick';
    if (/PUNCH/.test(n)) return 'punch';
    if (/FANG|BITE/.test(n)) return 'bite';
    if (/CLAW|SLASH|CUT|CHOP|BLADE/.test(n)) return 'strike';
    if (/TAIL/.test(n)) return 'tail';
    if (/WING/.test(n)) return 'wing';
    if (/HORN/.test(n)) return 'horn';
    return 'tackle';
  }
  const [weak, strong] = RANGED_BY_TYPE[move.type] ?? ['orb', 'beam'];
  return isStrong(move) ? strong : weak;
}

/** Every move's motif (for the gauntlet: which motifs a species' learnset needs). */
export function motifTable(moves: MoveData[]): Record<string, Motif> {
  return Object.fromEntries(moves.map((m) => [m.const, motifOf(m)]));
}
