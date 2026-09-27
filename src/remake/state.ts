// The battle as the compiled game sees it: the snapshot
// platform/game/remake_state.c fills (struct RemakeState,
// platform/include/remake_state.h). Fields are read by name, at the offsets
// the build records next to the module (game/remake_state.json), so nothing
// here repeats the C layout.

export const REMAKE_ANIM = { NONE: 0, MOVE: 1, STATUS: 2, GENERAL: 3, SPECIAL: 4 } as const;

/** field: [offset, size, C type]. */
export type StructLayouts = Record<string, { size: number; fields: Record<string, [number, number, string]> }>;

export async function loadStructLayouts(base: URL | string = document.baseURI): Promise<StructLayouts> {
  const res = await fetch(new URL('game/remake_state.json', base));
  if (!res.ok) throw new Error(`game/remake_state.json: ${res.status}`);
  return res.json();
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
  /** pa, pb, pc, pd (8.8). */
  matrix: [number, number, number, number];
  affineMode: number;
  hFlip: boolean;
  tileNum: number;
  paletteNum: number;
  priority: number;
  objMode: number;
  invisible: boolean;
  callback: number;
  personality: number;
  hp: number;
  maxHp: number;
}

export interface BattleState {
  inBattle: boolean;
  typeFlags: number;
  environment: number;
  battlerCount: number;
  animActive: boolean;
  animSerial: number;
  animTable: number;
  animId: number;
  animAttacker: number;
  animTarget: number;
  plttUnfaded: number;
  plttFaded: number;
  battlers: BattlerState[];
}

/** The snapshot at `address` (the game's RemakeState export fills it and returns it). */
export function readBattleState(layouts: StructLayouts, memory: WebAssembly.Memory, address: number): BattleState {
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
      matrix: [b.get('matrix', 0), b.get('matrix', 1), b.get('matrix', 2), b.get('matrix', 3)],
      affineMode: b.get('affineMode'),
      hFlip: !!b.get('hFlip'),
      tileNum: b.get('tileNum'),
      paletteNum: b.get('paletteNum'),
      priority: b.get('priority'),
      objMode: b.get('objMode'),
      invisible: !!b.get('invisible'),
      callback: b.get('callback'),
      personality: b.get('personality'),
      hp: b.get('hp'),
      maxHp: b.get('maxHp'),
    });
  }
  return {
    inBattle: !!s.get('inBattle'),
    typeFlags: s.get('typeFlags'),
    environment: s.get('environment'),
    battlerCount: s.get('battlerCount'),
    animActive: !!s.get('animActive'),
    animSerial: s.get('animSerial'),
    animTable: s.get('animTable'),
    animId: s.get('animId'),
    animAttacker: s.get('animAttacker'),
    animTarget: s.get('animTarget'),
    plttUnfaded: s.get('plttUnfaded'),
    plttFaded: s.get('plttFaded'),
    battlers,
  };
}
