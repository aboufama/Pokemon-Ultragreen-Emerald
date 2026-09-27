// Every clip of the Poochyena line, by name: each builds on a species' kit.
import type { Clip } from '../../../anim/clip';
import type { Kit } from './kit';
import { BODY } from './body';
import { JAWS } from './jaws';
import { PAWS } from './paws';
import { RANGED } from './ranged';
import { SELF } from './self';
import { SITUATION_CLIPS } from './situations';
import { STATUS } from './status';

export const LINE: Record<string, (k: Kit) => Clip> = {
  ...JAWS,
  ...BODY,
  ...PAWS,
  ...STATUS,
  ...SELF,
  ...RANGED,
  ...SITUATION_CLIPS,
};

/** The moves both species know (their shared movepool), by clip name. */
export const LINE_MOVES = [
  // Jaws.
  'bite', 'crunch', 'poison_fang', 'astonish',
  // The whole body.
  'tackle', 'take_down', 'double_edge', 'return', 'frustration', 'facade', 'secret_power', 'struggle', 'body_slam', 'counter', 'iron_tail',
  // Paws and the ground.
  'thief', 'covet', 'rock_smash', 'dig_charge', 'dig', 'mud_slap', 'sand_attack',
  // Status at the foe.
  'howl', 'roar', 'leer', 'scary_face', 'taunt', 'torment', 'odor_sleuth', 'snatch', 'mimic', 'swagger', 'attract', 'toxic', 'yawn',
  // On itself.
  'protect', 'endure', 'substitute', 'psych_up', 'sleep_talk', 'double_team', 'rest', 'sunny_day', 'rain_dance',
  // Ranged.
  'shadow_ball', 'hidden_power', 'snore',
];

/** Every battle situation (src/battle3d/situations.ts SITUATIONS). */
export const LINE_SITUATIONS = [
  'idle', 'intro', 'hit', 'hit_strong', 'faint', 'dodge', 'unaffected', 'return_home',
  'status_sleep', 'status_poison', 'status_burn', 'status_paralysis', 'status_freeze', 'status_confusion', 'status_infatuation', 'status_curse', 'status_nightmare', 'status_wrapped',
  'idle_asleep', 'idle_tired', 'stat_up', 'stat_down', 'level_up', 'drained', 'healed', 'focus', 'hang_on',
  'flinch', 'recharge', 'wake', 'shake_off', 'break_free',
  'weather_rain', 'weather_sun', 'weather_sand', 'weather_hail',
];

/** The named clips built for one species (every name must exist in the line). */
export function lineClips(k: Kit, names: string[]): Record<string, Clip> {
  const out: Record<string, Clip> = {};
  for (const n of names) {
    const make = LINE[n];
    if (!make) throw new Error(`the Poochyena line has no clip ${n}`);
    const clip = make(k);
    if (clip.name !== n) throw new Error(`clip ${n} is named ${clip.name}`);
    out[n] = clip;
  }
  return out;
}
