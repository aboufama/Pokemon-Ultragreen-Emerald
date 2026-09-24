// Dev tool: fit and verify the 2D battle UI against real Emerald captures.
//
//   /?mode=uifit[&ref=blaziken_vs_blaziken]
//
// For each healthbox element it searches the offset where every opaque
// rendered pixel equals the reference, then renders the full UI and reports
// per-region pixel mismatches. Results are exposed on window.__uifit.

import { type Bitmap, blit, createBitmap, loadBitmap } from '../gba/bitmap';
import { loadAllFonts } from '../gba/font';
import { Healthbox, type HealthboxLayout, type Side } from '../battle/ui/healthbox';
import { BattleTextbox } from '../battle/ui/textbox';
import { MOVES, SPECIES } from '../data';

interface ElementFit {
  element: string;
  side: Side;
  offset: [number, number];
  matched: number;
  total: number;
}

function renderOnly(draw: (fb: Bitmap) => void): Bitmap {
  const fb = createBitmap(240, 160);
  draw(fb);
  return fb;
}

/** Best offset (dx, dy) where the opaque pixels of `layer` (drawn at origin) match `ref`. */
function fitLayer(layer: Bitmap, ref: Bitmap, guess: [number, number], radius: number) {
  const pts: number[] = [];
  for (let i = 0; i < layer.width * layer.height; i++) if (layer.data[i * 4 + 3]) pts.push(i);
  let best = { dx: 0, dy: 0, matched: -1 };
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      let matched = 0;
      for (const i of pts) {
        const x = (i % layer.width) + guess[0] + dx;
        const y = Math.floor(i / layer.width) + guess[1] + dy;
        if (x < 0 || y < 0 || x >= ref.width || y >= ref.height) continue;
        const r = (y * ref.width + x) * 4;
        const l = i * 4;
        if (ref.data[r] === layer.data[l] && ref.data[r + 1] === layer.data[l + 1] && ref.data[r + 2] === layer.data[l + 2]) matched++;
      }
      if (matched > best.matched) best = { dx, dy, matched };
    }
  }
  return { offset: [guess[0] + best.dx, guess[1] + best.dy] as [number, number], matched: best.matched, total: pts.length };
}

function diffRegion(a: Bitmap, b: Bitmap, x0: number, y0: number, w: number, h: number, mask?: (x: number, y: number) => boolean) {
  let mismatched = 0, total = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (mask && !mask(x, y)) continue;
      total++;
      const i = (y * a.width + x) * 4;
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) mismatched++;
    }
  }
  return { mismatched, total };
}

function diffImage(a: Bitmap, b: Bitmap): Bitmap {
  const out = createBitmap(a.width, a.height);
  for (let i = 0; i < a.width * a.height; i++) {
    const same = a.data[i * 4] === b.data[i * 4] && a.data[i * 4 + 1] === b.data[i * 4 + 1] && a.data[i * 4 + 2] === b.data[i * 4 + 2];
    out.data.set(same ? [a.data[i * 4] >> 2, a.data[i * 4 + 1] >> 2, a.data[i * 4 + 2] >> 2, 255] : [255, 0, 255, 255], i * 4);
  }
  return out;
}

export async function runUiFit(root: HTMLElement): Promise<void> {
  const params = new URLSearchParams(location.search);
  const refName = params.get('ref') ?? 'blaziken_vs_blaziken';
  const base = `${import.meta.env.BASE_URL}reference/emerald/${refName}`;
  const [obj, bg0, action, moves, fonts] = await Promise.all([
    loadBitmap(`${base}/obj.png`),
    loadBitmap(`${base}/bg0.png`),
    loadBitmap(`${base}/action.png`),
    loadBitmap(`${base}/moves.png`),
    loadAllFonts(),
  ]);
  const meta = await (await fetch(`${base}/sprites.json`)).json();
  const player = SPECIES[meta.player];
  const enemy = SPECIES[meta.enemy];

  const boxes: Record<Side, Healthbox> = {
    player: await Healthbox.load('player', fonts.small),
    opponent: await Healthbox.load('opponent', fonts.small),
  };
  for (const [side, sp] of [['player', player], ['opponent', enemy]] as const) {
    const hb = boxes[side];
    hb.name = sp.name;
    hb.gender = sp.genderRatio === 255 ? null : sp.genderRatio === 254 ? 'female' : 'male';
    hb.level = meta.level;
    // Gen 3 HP at fixed IV 31, 0 EVs.
    const hp = Math.floor(((2 * sp.baseStats.hp + 31) * meta.level) / 100) + meta.level + 10;
    hb.hp = hb.shownHp = hb.maxHp = hp;
    hb.expFraction = 0;
  }

  // ---- fit each healthbox element --------------------------------------
  const fits: ElementFit[] = [];
  const layouts: Record<Side, HealthboxLayout> = {
    player: structuredClone(boxes.player.layout),
    opponent: structuredClone(boxes.opponent.layout),
  };
  for (const side of ['player', 'opponent'] as Side[]) {
    const hb = boxes[side];
    const L = layouts[side];
    const [bx, by] = L.box;
    const elems: [string, (fb: Bitmap) => void, [number, number] | undefined, (o: [number, number]) => void][] = [
      ['name', (fb) => hb.drawName(fb, 0, 0), L.name, (o) => (L.name = o)],
      ['level', (fb) => hb.drawLevel(fb, 0, 0), L.level, (o) => (L.level = o)],
      ['hpBar', (fb) => hb.drawHpBar(fb, 0, 0), L.hpBar, (o) => (L.hpBar = o)],
      ['hpText', (fb) => hb.drawHpText(fb, 0, 0), L.hpText, (o) => (L.hpText = o)],
      ['expBar', (fb) => hb.drawExpBar(fb, 0, 0), L.expBar, (o) => (L.expBar = o)],
    ];
    for (const [name, draw, guess, set] of elems) {
      if (!guess) continue;
      const layer = renderOnly(draw);
      const fit = fitLayer(layer, obj, [bx + guess[0], by + guess[1]], 12);
      const rel: [number, number] = [fit.offset[0] - bx, fit.offset[1] - by];
      set(rel);
      fits.push({ element: name, side, offset: rel, matched: fit.matched, total: fit.total });
    }
  }

  // ---- render the full UI with fitted layouts and diff against the captures
  const mine = createBitmap(240, 160);
  blit(mine, obj, 0, 0, 240, 160, 0, 0); // keep battler sprites identical; we only test UI regions
  for (const side of ['player', 'opponent'] as Side[]) {
    boxes[side].layout = layouts[side];
    boxes[side].draw(mine);
  }
  const hbPlayer = diffRegion(mine, obj, 126, 72, 104, 40);
  const hbOpp = diffRegion(mine, obj, 12, 14, 128, 32);

  const textbox = await BattleTextbox.load(fonts);
  textbox.page = 'action';
  textbox.setActionPrompt(player.name);
  const actionFb = createBitmap(240, 160);
  textbox.draw(actionFb, 0);
  const actionDiff = diffRegion(actionFb, bg0, 0, 112, 240, 48);

  textbox.page = 'move';
  const learned = player.learnset.filter((l) => l.level <= meta.level).map((l) => l.move);
  const lastFour = [...new Set(learned.reverse())].slice(0, 4).reverse();
  textbox.moves = [0, 1, 2, 3].map((i) => {
    const m = MOVES[lastFour[i]];
    return m ? { name: m.name, pp: m.pp, maxPp: m.pp, type: m.type } : null;
  });
  const movesFb = createBitmap(240, 160);
  textbox.draw(movesFb, 0);
  const movesDiff = diffRegion(movesFb, moves, 0, 112, 240, 48);

  const actionFull = createBitmap(240, 160);
  blit(actionFull, action, 0, 0, 240, 112, 0, 0);
  textbox.page = 'action';
  textbox.draw(actionFull, 0);

  const result = {
    ref: refName,
    fits,
    layouts,
    regions: { healthboxPlayer: hbPlayer, healthboxOpponent: hbOpp, actionMenu: actionDiff, moveMenu: movesDiff },
    moves: lastFour,
  };
  (window as unknown as { __uifit: unknown }).__uifit = result;
  console.log(JSON.stringify(result));

  // ---- visual report ------------------------------------------------------
  const rows: [string, Bitmap][] = [
    ['reference OBJ', obj], ['mine (healthboxes)', mine], ['diff', diffImage(mine, obj)],
    ['reference BG0 (action)', bg0], ['mine (action page)', actionFb], ['diff', diffImage(actionFb, bg0)],
    ['reference (move menu)', moves], ['mine (move page)', movesFb], ['diff', diffImage(movesFb, moves)],
  ];
  root.style.cssText = 'display:grid;grid-template-columns:repeat(3,480px);gap:8px;padding:8px;background:#222;color:#eee;font:12px monospace';
  for (const [label, bmp] of rows) {
    const wrap = document.createElement('div');
    wrap.textContent = label;
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 160;
    c.style.cssText = 'width:480px;height:320px;image-rendering:pixelated;display:block';
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(240, 160);
    img.data.set(bmp.data);
    ctx.putImageData(img, 0, 0);
    wrap.appendChild(c);
    root.appendChild(wrap);
  }
}
