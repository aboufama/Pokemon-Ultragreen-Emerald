// The game page's hacks, for testing the game faster: the game's own
// (platform/include/hacks.h: EXP times a multiplier, wild Pokémon never or on
// every step, every ball catching, the player's hits knocking out) and the
// page's (the game running several frames a frame). They are kept in the
// browser and set in the game at every power-on and as they change; all off,
// the game plays as the ROM does. The helps (heal the party, items, money)
// are done once, when asked (src/menus/hacks.ts draws the menu).

export interface Hacks {
  /** Frames the game runs for each of the GBA's (fast forward). */
  speed: number;
  /** EXP multiplier. */
  exp: number;
  /** HACK_ENCOUNTERS_*: wild Pokémon as the game has them, never, or on every step. */
  encounters: 'normal' | 'never' | 'always';
  /** Every ball catches. */
  catch: boolean;
  /** The player's hits knock out. */
  knockout: boolean;
}

export const SPEEDS = [1, 2, 4, 8];
export const EXP_MULTIPLIERS = [1, 2, 5, 10, 100];
const STORE = 'ultragreen.hacks.v1';
const OFF: Hacks = { speed: 1, exp: 1, encounters: 'normal', catch: false, knockout: false };

export function loadHacks(): Hacks {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? '{}') as Partial<Hacks>;
    return {
      speed: SPEEDS.includes(saved.speed ?? 0) ? saved.speed! : OFF.speed,
      exp: EXP_MULTIPLIERS.includes(saved.exp ?? 0) ? saved.exp! : OFF.exp,
      encounters: saved.encounters === 'never' || saved.encounters === 'always' ? saved.encounters : OFF.encounters,
      catch: saved.catch === true,
      knockout: saved.knockout === true,
    };
  } catch {
    return { ...OFF };
  }
}

export function saveHacks(h: Hacks): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(h));
  } catch {
    // Private mode or blocked storage: the hacks last for this visit.
  }
}

/** Whether any hack is on (the page says so). */
export function anyHack(h: Hacks): boolean {
  return h.speed !== 1 || h.exp !== 1 || h.encounters !== 'normal' || h.catch || h.knockout;
}

/** Set the game's hacks (its exports, and its constants: HACK_*). */
export function applyHacks(exports: WebAssembly.Exports, constants: Record<string, number>, h: Hacks): void {
  const set = exports.HackSet as (hack: number, value: number) => void;
  const encounters = { normal: 'HACK_ENCOUNTERS_NORMAL', never: 'HACK_ENCOUNTERS_NEVER', always: 'HACK_ENCOUNTERS_ALWAYS' }[h.encounters];
  set(constants.HACK_EXP, h.exp);
  set(constants.HACK_ENCOUNTERS, constants[encounters]);
  set(constants.HACK_CATCH, h.catch ? 1 : 0);
  set(constants.HACK_KNOCKOUT, h.knockout ? 1 : 0);
}

/** The one-off helps, done at once between frames: false when the game can't (no game yet, or healing in a battle). */
export interface HackHelps {
  heal(): boolean;
  items(): boolean;
  money(): boolean;
}

export function gameHelps(exports: () => WebAssembly.Exports): HackHelps {
  const call = (name: string) => !!(exports()[name] as () => number)();
  return { heal: () => call('HackHealParty'), items: () => call('HackGiveItems'), money: () => call('HackGiveMoney') };
}
