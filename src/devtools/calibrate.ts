// Sprite calibration: fit the 3D battle view to the stock Emerald sprites.
//
//   /?mode=calibrate&species=blaziken[&fitCamera=1][&pose=stance]
//
// The objective is silhouette IoU between the rendered model (in its stance)
// and the stock sprite at the exact position Emerald draws it, for both the
// opponent slot (front sprite) and the player slot (back sprite). Parameters:
//   camera (optional, global): vertical fov, pitch, feet anchors of both slots
//   species: model height, per-slot yaw and small ground offsets
// window.calibrate.run() returns the fitted values; tools/calibrate/run.mjs
// writes them to src/data/battle_camera.json and src/pokemon/<slug>/calibration.json.

import * as THREE from 'three';
import { GbaScreen } from '../battle/screen';
import { type Bitmap, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { SPECIES } from '../data';
import { loadPokemonModel } from '../render3d/model';
import { applyToonMaterials, type ColorGrade, type ToonHandles } from '../render3d/materials';
import { BATTLE_CAMERA, BattleStage, type BattleCameraSpec, type SlotName, groundPointAt, makeBattleCamera } from '../render3d/stage';
import { Rig } from '../anim/rig';
import { getSpeciesProfile } from '../pokemon/registry';
import { applyCalibration, paletteSlot, type Calibration, type OutlinePolicy } from '../pokemon/profile';

const MW = 480, MH = 320; // mask resolution (2x GBA)
const TEXTBOX_TOP = 112;

interface Params {
  fov: number;
  pitch: number;
  enemyAnchorX: number;
  enemyAnchorY: number;
  playerAnchorX: number;
  playerAnchorY: number;
  height: number;
  enemyYaw: number;
  playerYaw: number;
}

type Key = keyof Params;

function spriteMask(sprite: Bitmap, x0: number, y0: number): Uint8Array {
  const m = new Uint8Array(MW * MH);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      if (!sprite.data[(y * sprite.width + x) * 4 + 3]) continue;
      const sx = x0 + x, sy = y0 + y;
      if (sx < 0 || sy < 0 || sx >= 240 || sy >= TEXTBOX_TOP) continue;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) m[(sy * 2 + dy) * MW + sx * 2 + dx] = 1;
    }
  }
  return m;
}

function iou(ids: Uint8Array, id: number, mask: Uint8Array): number {
  let inter = 0, union = 0;
  const limit = TEXTBOX_TOP * 2 * MW;
  for (let i = 0; i < limit; i++) {
    const a = ids[i] === id ? 1 : 0;
    const b = mask[i];
    if (a && b) inter++;
    if (a || b) union++;
  }
  return union ? inter / union : 0;
}

interface Box { x0: number; y0: number; x1: number; y1: number }

function bboxOf(pred: (i: number) => boolean): Box | null {
  let x0 = MW, y0 = MH, x1 = -1, y1 = -1;
  const limit = TEXTBOX_TOP * 2 * MW;
  for (let i = 0; i < limit; i++) {
    if (!pred(i)) continue;
    const x = i % MW, y = (i / MW) | 0;
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

function boxIou(a: Box | null, b: Box | null): number {
  if (!a || !b) return 0;
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) + 1);
  const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) + 1);
  const inter = ix * iy;
  const area = (r: Box) => (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1);
  return inter / (area(a) + area(b) - inter);
}

/** Nelder-Mead minimization. */
function nelderMead(f: (x: number[]) => number, x0: number[], steps: number[], iters: number): { x: number[]; fx: number } {
  const n = x0.length;
  let simplex = [x0.slice()];
  for (let i = 0; i < n; i++) {
    const p = x0.slice();
    p[i] += steps[i];
    simplex.push(p);
  }
  let values = simplex.map(f);
  for (let it = 0; it < iters; it++) {
    const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map((e) => e[1]);
    simplex = order.map((i) => simplex[i]);
    values = order.map((i) => values[i]);
    const centroid = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) centroid[j] += simplex[i][j] / n;
    const worst = simplex[n];
    const reflect = centroid.map((c, j) => c + (c - worst[j]));
    const fr = f(reflect);
    if (fr < values[0]) {
      const expand = centroid.map((c, j) => c + 2 * (c - worst[j]));
      const fe = f(expand);
      if (fe < fr) { simplex[n] = expand; values[n] = fe; } else { simplex[n] = reflect; values[n] = fr; }
    } else if (fr < values[n - 1]) {
      simplex[n] = reflect;
      values[n] = fr;
    } else {
      const contract = centroid.map((c, j) => c + 0.5 * (worst[j] - c));
      const fc = f(contract);
      if (fc < values[n]) {
        simplex[n] = contract;
        values[n] = fc;
      } else {
        for (let i = 1; i <= n; i++) {
          simplex[i] = simplex[i].map((v, j) => simplex[0][j] + 0.5 * (v - simplex[0][j]));
          values[i] = f(simplex[i]);
        }
      }
    }
    const spread = Math.max(...values) - Math.min(...values);
    if (spread < 1e-5 && it > 50) break;
  }
  const best = values.indexOf(Math.min(...values));
  return { x: simplex[best], fx: values[best] };
}

export async function runCalibrate(root: HTMLElement): Promise<unknown> {
  const params = new URLSearchParams(location.search);
  const slug = params.get('species') ?? 'blaziken';
  const fitCamera = params.get('fitCamera') === '1';
  const profile = await getSpeciesProfile(slug);
  const sp = SPECIES[slug];
  const pose = profile.poses[params.get('pose') ?? 'stance'];

  root.style.cssText = 'position:fixed;inset:0;background:#15151c;color:#ddd;font:12px monospace;';
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:0;top:0;width:720px;height:480px;';
  root.appendChild(holder);
  const screen = new GbaScreen(holder, 3);
  const stage = new BattleStage(screen.canvas3d, structuredClone(BATTLE_CAMERA), { supersample: 2 });
  await stage.setEnvironment('grass');

  const models: Record<SlotName, { root: THREE.Object3D; rig: Rig; toon: ToonHandles }> = {} as never;
  for (const slot of ['player', 'enemy'] as SlotName[]) {
    const model = await loadPokemonModel(slug, 'regular', { hiddenParts: profile.hiddenParts });
    const toon = applyToonMaterials(model, { effectParts: profile.effectParts, grade: profile.calibration.grade });
    model.root.userData.pixelId = slot === 'player' ? 1 : 2;
    stage.slots[slot].add(model.root);
    stage.pipeline.setPalette(slot === 'player' ? 0 : 1, paletteSlot(profile));
    const rig = new Rig(model, profile.rig);
    rig.applyPose(pose);
    models[slot] = { root: model.root, rig, toon };
  }

  const front = await loadBitmap(asset(`gba/pokemon/${slug}/front.png`));
  const back = await loadBitmap(asset(`gba/pokemon/${slug}/back.png`));
  const frontX = 176 - 32, frontY = 40 + (sp.frontCoords?.yOffset ?? 0) - sp.elevation - 32;
  const backX = 72 - 32, backY = 80 + (sp.backCoords?.yOffset ?? 0) - 32;
  const masks = { enemy: spriteMask(front, frontX, frontY), player: spriteMask(back, backX, backY) };

  const base: Params = {
    fov: stage.spec.fov,
    pitch: stage.spec.pitch,
    enemyAnchorX: stage.spec.anchors.enemy[0],
    enemyAnchorY: stage.spec.anchors.enemy[1],
    playerAnchorX: stage.spec.anchors.player[0],
    playerAnchorY: stage.spec.anchors.player[1],
    height: profile.calibration.height,
    enemyYaw: profile.calibration.slots.enemy.yaw,
    playerYaw: profile.calibration.slots.player.yaw,
  };
  for (const k of Object.keys(base) as Key[]) {
    if (params.has(k)) base[k] = Number(params.get(k));
  }
  const cameraKeys: Key[] = ['fov', 'pitch', 'enemyAnchorX', 'enemyAnchorY', 'playerAnchorX', 'playerAnchorY'];
  const speciesKeys: Key[] = ['height', 'enemyYaw', 'playerYaw'];
  const keys = fitCamera ? [...cameraKeys, ...speciesKeys] : speciesKeys;
  const stepOf: Record<Key, number> = {
    fov: 4, pitch: 3, enemyAnchorX: 4, enemyAnchorY: 4, playerAnchorX: 6, playerAnchorY: 8, height: 0.2, enemyYaw: 20, playerYaw: 20,
  };

  const apply = (p: Params) => {
    const spec: BattleCameraSpec = {
      ...stage.spec,
      fov: p.fov,
      pitch: p.pitch,
      anchors: { enemy: [p.enemyAnchorX, p.enemyAnchorY], player: [p.playerAnchorX, p.playerAnchorY] },
    };
    const cam = makeBattleCamera(spec);
    stage.homeCamera.copy(cam);
    stage.camera.copy(cam);
    for (const slot of ['player', 'enemy'] as SlotName[]) {
      stage.slots[slot].position.copy(groundPointAt(cam, ...spec.anchors[slot]));
    }
    stage.slots.player.lookAt(stage.slots.enemy.position.x, 0, stage.slots.enemy.position.z);
    stage.slots.enemy.lookAt(stage.slots.player.position.x, 0, stage.slots.player.position.z);
    const cal: Calibration = {
      ...profile.calibration,
      height: p.height,
      // Fit the plain yaw: art adjustments (yawAdjust) are not part of the fit.
      slots: {
        enemy: { ...profile.calibration.slots.enemy, yaw: p.enemyYaw, yawAdjust: 0 },
        player: { ...profile.calibration.slots.player, yaw: p.playerYaw, yawAdjust: 0 },
      },
    };
    for (const slot of ['player', 'enemy'] as SlotName[]) applyCalibration(models[slot].root, cal, slot);
    stage.scene.updateMatrixWorld(true);
    return { spec, cal };
  };

  const spriteBoxes = {
    enemy: bboxOf((i) => masks.enemy[i] === 1),
    player: bboxOf((i) => masks.player[i] === 1),
  };
  const score = (p: Params) => {
    apply(p);
    const ids = stage.pipeline.renderIdMask(stage.scene, stage.camera, MW, MH);
    return {
      enemy: iou(ids, 2, masks.enemy),
      player: iou(ids, 1, masks.player),
      enemyBox: boxIou(bboxOf((i) => ids[i] === 2), spriteBoxes.enemy),
      playerBox: boxIou(bboxOf((i) => ids[i] === 1), spriteBoxes.player),
      ids,
    };
  };

  const toVec = (p: Params) => keys.map((k) => p[k]);
  const fromVec = (v: number[]) => {
    const p = { ...base };
    keys.forEach((k, i) => (p[k] = v[i]));
    return p;
  };
  const objective = (v: number[]) => {
    const p = fromVec(v);
    if (p.fov < 8 || p.fov > 70 || p.pitch < 0 || p.pitch > 60 || p.height < 0.3) return 10;
    const s = score(p);
    // Silhouette overlap plus bounding-box agreement (size and placement are
    // what matter most; the box term keeps the fit stable when poses differ).
    return -(s.enemy + s.player + 0.5 * (s.enemyBox + s.playerBox));
  };

  const run = async () => {
    const t0 = performance.now();
    let best = { x: toVec(base), fx: objective(toVec(base)) };
    const initial = -best.fx;
    // Multi-start over the slot yaws (silhouettes have mirror-like local optima),
    // then refine the best candidate with shrinking simplex sizes.
    const yawStarts = [-40, -15, 0, 15, 40];
    for (const ey of yawStarts) {
      for (const py of yawStarts) {
        const start = fromVec(best.x);
        start.enemyYaw = ey;
        start.playerYaw = py;
        const res = nelderMead(objective, toVec(start), keys.map((k) => stepOf[k] * 0.6), 120);
        if (res.fx < best.fx) best = res;
      }
      await new Promise((r) => setTimeout(r, 0));
    }
    for (const scale of [1, 0.5, 0.25]) {
      const res = nelderMead(objective, best.x, keys.map((k) => stepOf[k] * scale), 400);
      if (res.fx < best.fx) best = res;
      await new Promise((r) => setTimeout(r, 0));
    }
    const p = fromVec(best.x);
    const s = score(p);
    const { spec, cal } = apply(p);
    cal.fit = { enemy: { iou: +s.enemy.toFixed(4), boxIou: +s.enemyBox.toFixed(4) }, player: { iou: +s.player.toFixed(4), boxIou: +s.playerBox.toFixed(4) } } as never;
    drawReport(s.ids);
    stage.render();
    return {
      species: slug,
      fitCamera,
      seconds: +((performance.now() - t0) / 1000).toFixed(1),
      initialScore: +initial.toFixed(4),
      params: p,
      camera: { fov: +p.fov.toFixed(3), height: spec.height, pitch: +p.pitch.toFixed(3), yaw: spec.yaw, anchors: { player: spec.anchors.player.map((v) => +v.toFixed(2)), enemy: spec.anchors.enemy.map((v) => +v.toFixed(2)) }, platforms: spec.platforms },
      calibration: {
        height: +cal.height.toFixed(4),
        outline: outlineFromSprites(),
        // Spread the stored slots so hand-set fields (yawAdjust) survive.
        slots: {
          enemy: { ...profile.calibration.slots.enemy, yaw: +cal.slots.enemy.yaw.toFixed(2) },
          player: { ...profile.calibration.slots.player, yaw: +cal.slots.player.yaw.toFixed(2) },
        },
        fit: cal.fit,
      },
    };
  };

  // ---- color phase: fit the toon grade so snapped palette usage matches the sprites
  const palette = profile.palette;
  const paletteIndex = new Map<number, number>();
  palette.forEach((c, i) => { if (i > 0 && !paletteIndex.has((c[0] << 16) | (c[1] << 8) | c[2])) paletteIndex.set((c[0] << 16) | (c[1] << 8) | c[2], i); });
  const histogramOf = (bmp: Bitmap, rows = 64) => {
    const h = new Array(16).fill(0);
    for (let y = 0; y < rows; y++) for (let x = 0; x < 64; x++) {
      const i = (y * bmp.width + x) * 4;
      if (!bmp.data[i + 3]) continue;
      const k = paletteIndex.get((bmp.data[i] << 16) | (bmp.data[i + 1] << 8) | bmp.data[i + 2]);
      if (k !== undefined) h[k]++;
    }
    return h;
  };
  const stockHist = { enemy: histogramOf(front), player: histogramOf(back) };
  const normalize = (h: number[], skip: number[]) => {
    const t = h.reduce((a, v, i) => (skip.includes(i) ? a : a + v), 0) || 1;
    return h.map((v, i) => (skip.includes(i) ? 0 : v / t));
  };
  /** Outline policy from the stock sprites: most common boundary color, then the most common darker one. */
  const outlineFromSprites = (): OutlinePolicy => {
    const counts = new Array(16).fill(0);
    for (const bmp of [front, back]) {
      for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
        const i = (y * bmp.width + x) * 4;
        if (!bmp.data[i + 3]) continue;
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const xx = x + dx, yy = y + dy;
          return xx < 0 || yy < 0 || xx >= 64 || yy >= 64 || !bmp.data[(yy * bmp.width + xx) * 4 + 3];
        });
        if (!edge) continue;
        const k = paletteIndex.get((bmp.data[i] << 16) | (bmp.data[i + 1] << 8) | bmp.data[i + 2]);
        if (k !== undefined) counts[k]++;
      }
    }
    const luma = (c: readonly number[]) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    const order = counts.map((n, i) => [n, i]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]).map(([, i]) => i);
    const outer = order[0];
    const inner = order.find((i) => i !== outer && luma(palette[i]) < 90) ?? outer;
    return { outer, inner, selective: true };
  };
  const gl = stage.renderer.getContext();
  const renderedHistograms = () => {
    stage.render();
    const px = new Uint8Array(240 * 160 * 4);
    gl.readPixels(0, 0, 240, 160, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const ids = stage.pipeline.renderIdMask(stage.scene, stage.camera, 240, 160);
    const h = { enemy: new Array(16).fill(0), player: new Array(16).fill(0) };
    for (let y = 0; y < TEXTBOX_TOP; y++) for (let x = 0; x < 240; x++) {
      const id = ids[y * 240 + x];
      if (id !== 1 && id !== 2) continue;
      const i = ((159 - y) * 240 + x) * 4;
      const k = paletteIndex.get((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]);
      if (k !== undefined) (id === 2 ? h.enemy : h.player)[k]++;
    }
    return h;
  };
  const colorLoss = (g: ColorGrade) => {
    for (const slot of ['player', 'enemy'] as SlotName[]) models[slot].toon.setGrade(g);
    const h = renderedHistograms();
    let loss = 0;
    for (const slot of ['enemy', 'player'] as SlotName[]) {
      const a = normalize(h[slot], [profile.calibration.outline.outer, profile.calibration.outline.inner]);
      const b = normalize(stockHist[slot], [profile.calibration.outline.outer, profile.calibration.outline.inner]);
      loss += a.reduce((acc, v, i) => acc + Math.abs(v - b[i]), 0) * (slot === 'enemy' ? 1 : 0.6);
    }
    return loss;
  };
  const runColor = async () => {
    const g0 = profile.calibration.grade ?? { gain: 1, saturation: 1, bands: [0.35, 0.69, 1] as [number, number, number] };
    // Bands are parametrized as increments so they stay ordered (shadow <= mid <= lit).
    const toG = (v: number[]): ColorGrade => {
      const b0 = v[2], b1 = Math.min(1, b0 + Math.abs(v[3])), b2 = Math.min(1, b1 + Math.abs(v[4]));
      return { gain: v[0], saturation: v[1], bands: [b0, b1, b2] };
    };
    const f = (v: number[]) => (v[0] < 0.3 || v[0] > 3 || v[1] < 0.3 || v[1] > 3 || v[2] < 0 || v[2] > 1 ? 10 : colorLoss(toG(v)));
    const fromG = (g: ColorGrade) => [g.gain, g.saturation, g.bands[0], g.bands[1] - g.bands[0], g.bands[2] - g.bands[1]];
    let best = { x: fromG(g0), fx: 0 };
    best.fx = f(best.x);
    const initialLoss = best.fx;
    for (const start of [[1.2, 1.3, 0.5, 0.3, 0.2], [1.6, 1.5, 0.6, 0.25, 0.15], [1.0, 1.0, 0.35, 0.34, 0.31]]) {
      const res = nelderMead(f, start, [0.3, 0.3, 0.15, 0.1, 0.1], 150);
      if (res.fx < best.fx) best = res;
      await new Promise((r) => setTimeout(r, 0));
    }
    const res = nelderMead(f, best.x, [0.1, 0.1, 0.05, 0.05, 0.05], 200);
    if (res.fx < best.fx) best = res;
    const g = toG(best.x.map((v) => +v.toFixed(4)));
    colorLoss(g);
    stage.render();
    return { grade: g, loss: +best.fx.toFixed(4), initialLoss: +initialLoss.toFixed(4), stock: stockHist, rendered: renderedHistograms() };
  };

  // Overlap report: green = both, red = sprite only, blue = model only.
  const report = document.createElement('canvas');
  report.width = MW;
  report.height = MH;
  report.style.cssText = 'position:absolute;left:728px;top:0;width:720px;height:480px;image-rendering:pixelated;';
  root.appendChild(report);
  const drawReport = (ids: Uint8Array) => {
    const ctx = report.getContext('2d')!;
    const img = ctx.createImageData(MW, MH);
    for (let i = 0; i < MW * MH; i++) {
      const a = ids[i] === 1 || ids[i] === 2;
      const b = masks.enemy[i] || masks.player[i];
      const c = a && b ? [60, 200, 90] : b ? [220, 60, 60] : a ? [70, 110, 230] : [25, 25, 32];
      img.data.set([...c, 255], i * 4);
    }
    ctx.putImageData(img, 0, 0);
  };

  // Initial state for visual inspection before running.
  const s0 = score(base);
  drawReport(s0.ids);
  stage.render();
  const api = { run, runColor, score: (p: Partial<Params>) => { const s = score({ ...base, ...p }); return { enemy: s.enemy, player: s.player }; }, base, initial: { enemy: s0.enemy, player: s0.player } };
  (window as unknown as { calibrate: unknown }).calibrate = api;
  return api;
}
