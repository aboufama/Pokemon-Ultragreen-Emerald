// The battle as the compiled game sees it: the snapshot
// platform/game/remake_state.c fills (struct RemakeState,
// platform/include/remake_state.h). Fields are read by name, at the offsets
// the build records next to the module (game/remake_state.json), and the
// game's constants by name from the same file, so nothing here repeats the C
// layout or the game's numbers.

/** field: [offset, size, C type]. */
export type StructLayouts = Record<string, { size: number; fields: Record<string, [number, number, string]> }>;

/** What the build tells about the game (platform/build.mjs): the structs' layouts and the game's constants (CONTROLLER_*, B_POSITION_*...). */
export interface GameInfo {
  structs: StructLayouts;
  constants: Record<string, number>;
}

export async function loadGameInfo(base: URL | string = document.baseURI): Promise<GameInfo> {
  const res = await fetch(new URL('game/remake_state.json', base));
  if (!res.ok) throw new Error(`game/remake_state.json: ${res.status}`);
  return res.json();
}

/** A constant of the game's by name (a missing one is a mistake, not a zero). */
export function constant(info: GameInfo, name: string): number {
  const v = info.constants[name];
  if (v === undefined) throw new Error(`the game has no constant ${name} (platform/build.mjs REMAKE_CONSTANTS)`);
  return v;
}

/** A C struct in the game's memory, read by field name. */
export class StructView {
  constructor(private readonly layouts: StructLayouts, readonly type: string, private readonly view: DataView, readonly address: number) {}

  get(field: string, index = 0): number {
    const f = this.layouts[this.type].fields[field];
    if (!f) throw new Error(`struct ${this.type} has no field ${field}`);
    const [offset, size, ctype] = f;
    const signed = /^int\d+_t$/.test(ctype);
    const width = /8_t$/.test(ctype) ? 1 : /16_t$/.test(ctype) ? 2 : /32_t$/.test(ctype) ? 4 : size;
    const at = this.address + offset + index * width;
    if (width === 1) return signed ? this.view.getInt8(at) : this.view.getUint8(at);
    if (width === 2) return signed ? this.view.getInt16(at, true) : this.view.getUint16(at, true);
    return signed ? this.view.getInt32(at, true) : this.view.getUint32(at, true);
  }

  /** An embedded struct (or an element of an array of them). */
  struct(field: string, type: string, index = 0): StructView {
    const [offset] = this.layouts[this.type].fields[field];
    return new StructView(this.layouts, type, this.view, this.address + offset + index * this.layouts[type].size);
  }
}

export interface BattlerState {
  species: number;
  present: boolean;
  side: 0 | 1;
  position: number;
  spriteId: number;
  shown: boolean;
  behindSubstitute: boolean;
  x: number;
  y: number;
  x2: number;
  y2: number;
  /** Where its centre rests (the position the game creates the sprite at). */
  homeX: number;
  homeY: number;
  /** pa, pb, pc, pd (8.8). */
  matrix: [number, number, number, number];
  affineMode: number;
  hFlip: boolean;
  tileNum: number;
  paletteNum: number;
  priority: number;
  objMode: number;
  invisible: boolean;
  /** The sprite shows its Pokémon (in the intro the trainer's picture takes its place). */
  showsPokemon: boolean;
  /** The last command the battle engine gave its controller (CONTROLLER in state.ts), and a count of them. */
  command: number;
  commandSerial: number;
  callback: number;
  personality: number;
  hp: number;
  maxHp: number;
  /** Its healthbox is on the screen (a wild Pokémon's shows as it cries). */
  healthboxShown: boolean;
}

export interface BattleState {
  inBattle: boolean;
  /** The battle's screen is up (not a menu over it). */
  battleScreen: boolean;
  typeFlags: number;
  environment: number;
  battlerCount: number;
  animActive: boolean;
  animSerial: number;
  /** REMAKE_ANIM_* */
  animTable: number;
  animId: number;
  animAttacker: number;
  animTarget: number;
  /** The hits left as it launched, this one included (0: a single hit). */
  animHits: number;
  /** A two-turn move's charging turn is 0, its strike 1. */
  animTurn: number;
  /** The game holds the move's animation at its start until the remake lets it go. */
  animHeld: boolean;
  /** A stat change's STAT_ANIM_* kind (rises and falls). */
  animStatArg: number;
  /** gMoveResultFlags (MOVE_RESULT_*) and whether the hit is critical: how the foe takes it. */
  moveResult: number;
  critical: boolean;
  /** Counts the moves that failed at their foe (missed, protected against, no effect); the last one's. */
  failSerial: number;
  failAttacker: number;
  failTarget: number;
  failMove: number;
  failResult: number;
  /** REMAKE_BG_MAIN (the place's), or the move background (BG_*) BG3 shows. */
  background: number;
  /**
   * BG1 and BG2 (in that order): the battler whose sprite a move animation
   * drew into it (null: none) and the background palette of its copy.
   */
  copies: { battler: number | null; palette: number }[];
  plttUnfaded: number;
  plttFaded: number;
  battlers: BattlerState[];
}

/** The snapshot at `address` (the game's RemakeState export fills it and returns it). */
export function readBattleState(layouts: StructLayouts, memory: WebAssembly.Memory, address: number, noBattler: number): BattleState {
  const s = new StructView(layouts, 'RemakeState', new DataView(memory.buffer), address);
  const battlers: BattlerState[] = [];
  for (let i = 0; i < 4; i++) {
    const b = s.struct('battlers', 'RemakeBattler', i);
    battlers.push({
      species: b.get('species'),
      present: !!b.get('present'),
      side: b.get('side') as 0 | 1,
      position: b.get('position'),
      spriteId: b.get('spriteId'),
      shown: !!b.get('shown'),
      behindSubstitute: !!b.get('behindSubstitute'),
      x: b.get('x'),
      y: b.get('y'),
      x2: b.get('x2'),
      y2: b.get('y2'),
      homeX: b.get('homeX'),
      homeY: b.get('homeY'),
      matrix: [b.get('matrix', 0), b.get('matrix', 1), b.get('matrix', 2), b.get('matrix', 3)],
      affineMode: b.get('affineMode'),
      hFlip: !!b.get('hFlip'),
      tileNum: b.get('tileNum'),
      paletteNum: b.get('paletteNum'),
      priority: b.get('priority'),
      objMode: b.get('objMode'),
      invisible: !!b.get('invisible'),
      showsPokemon: !!b.get('showsPokemon'),
      command: b.get('command'),
      commandSerial: b.get('commandSerial'),
      callback: b.get('callback'),
      personality: b.get('personality'),
      hp: b.get('hp'),
      maxHp: b.get('maxHp'),
      healthboxShown: !!b.get('healthboxShown'),
    });
  }
  return {
    inBattle: !!s.get('inBattle'),
    battleScreen: !!s.get('battleScreen'),
    typeFlags: s.get('typeFlags'),
    environment: s.get('environment'),
    battlerCount: s.get('battlerCount'),
    animActive: !!s.get('animActive'),
    animSerial: s.get('animSerial'),
    animTable: s.get('animTable'),
    animId: s.get('animId'),
    animAttacker: s.get('animAttacker'),
    animTarget: s.get('animTarget'),
    animHits: s.get('animHits'),
    animTurn: s.get('animTurn'),
    animHeld: !!s.get('animHeld'),
    animStatArg: s.get('animStatArg'),
    moveResult: s.get('moveResult'),
    critical: !!s.get('critical'),
    failSerial: s.get('failSerial'),
    failAttacker: s.get('failAttacker'),
    failTarget: s.get('failTarget'),
    failMove: s.get('failMove'),
    failResult: s.get('failResult'),
    copies: [0, 1].map((i) => ({ battler: s.get('copyBattler', i) === noBattler ? null : s.get('copyBattler', i), palette: s.get('copyPalette', i) })),
    background: s.get('background'),
    plttUnfaded: s.get('plttUnfaded'),
    plttFaded: s.get('plttFaded'),
    battlers,
  };
}
