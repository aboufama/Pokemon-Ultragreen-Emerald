// Sceptile's clips from the Treecko line's choreography (src/pokemon/treecko/line),
// built on its kit (./kit.ts): every move in its movepool and every situation.
import { buildClips } from '../treecko/line/index';
import { SCEPTILE_KIT } from './kit';

/** Its movepool's clips, by action family. */
export const MOVE_CLIPS = [
  // Blades, claws and chops.
  'pound', 'cut', 'fury_cutter', 'leaf_blade', 'false_swipe', 'dragon_claw', 'brick_break', 'aerial_ace', 'rock_smash', 'crush_claw',
  // Punches.
  'mega_punch', 'thunder_punch', 'dynamic_punch', 'focus_punch', 'counter',
  // Kicks, the tail, slams, the jaws.
  'mega_kick', 'slam', 'iron_tail', 'body_slam', 'crunch',
  // Tackles, rams and shoves; the throw and the burrow.
  'quick_attack', 'pursuit', 'frustration', 'return', 'facade', 'secret_power', 'strength', 'double_edge', 'endeavor', 'struggle',
  'seismic_toss', 'dig_charge', 'dig',
  // Ranged: drains, seeds, beams, an orb, rocks, stars, a stomp, a snore, mud, dragon breath.
  'absorb', 'mega_drain', 'giga_drain', 'bullet_seed', 'bullet_seed_first', 'bullet_seed_next', 'bullet_seed_last',
  'solar_beam_charge', 'solar_beam', 'hidden_power', 'rock_tomb', 'swift', 'snore', 'mud_slap', 'dragon_breath',
  'hyper_beam', 'earthquake',
  // Status: glares and cries, darts and weaving, guards and barriers, powders and seeds, charms, a dance,
  // sleep-talking, the sun, rest, a flash, mud.
  'leer', 'mimic', 'screech', 'agility', 'double_team', 'detect', 'protect', 'safeguard', 'substitute', 'endure',
  'toxic', 'leech_seed', 'attract', 'swagger', 'swords_dance', 'sleep_talk', 'sunny_day', 'rest', 'flash', 'mud_sport',
  'roar',
  // Situations.
  'hit_strong', 'dodge', 'unaffected', 'return_home',
  'status_sleep', 'status_poison', 'status_burn', 'status_paralysis', 'status_freeze', 'status_confusion',
  'status_infatuation', 'status_curse', 'status_nightmare', 'status_wrapped', 'idle_asleep', 'idle_tired',
  'stat_up', 'stat_down', 'level_up', 'drained', 'healed', 'focus', 'hang_on',
  'flinch', 'recharge', 'wake', 'shake_off', 'break_free', 'weather_rain', 'weather_sun', 'weather_sand', 'weather_hail',
] as const;

export const LINE_CLIPS = buildClips(SCEPTILE_KIT, MOVE_CLIPS);
