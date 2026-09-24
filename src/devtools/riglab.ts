// Rig Lab: pose/animation authoring and verification against the stock sprites.
//
//   /?mode=riglab&species=blaziken[&pose=stance][&clip=idle&t=0.3][&bones=1]
//
// Top: turntable (front / left / back / 3-4) at full resolution.
// Bottom: the real battle view (both slots) through the pixel pipeline with the
// stock GBA sprites onion-skinned on top, next to the real Emerald frame.
// window.riglab exposes setPose/setTime for scripted screenshots.

import * as THREE from 'three';
import { GbaScreen } from '../battle/screen';
import { type Bitmap, blit, clear, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { loadPokemonModel, type LoadedModel } from '../render3d/model';
import { applyToonMaterials } from '../render3d/materials';
import { BattleStage } from '../render3d/stage';
import { Rig, type Pose } from '../anim/rig';
import { SPECIES } from '../data';
import { getSpeciesProfile } from '../pokemon/registry';
import { instantiatePokemon } from '../pokemon/instantiate';

const VIEWS: { name: string; dir: THREE.Vector3 }[] = [
  { name: 'front', dir: new THREE.Vector3(0, 0, 1) },
  { name: 'left', dir: new THREE.Vector3(1, 0, 0) },
  { name: 'back', dir: new THREE.Vector3(0, 0, -1) },
  { name: '3/4', dir: new THREE.Vector3(-0.7, 0.15, 0.7) },
];

export async function runRigLab(root: HTMLElement): Promise<unknown> {
  const params = new URLSearchParams(location.search);
  const slug = params.get('species') ?? 'blaziken';
  const profile = await getSpeciesProfile(slug);
  const showBones = params.get('bones') === '1';
  const onion = Number(params.get('onion') ?? 0.5);

  root.style.cssText = 'position:fixed;inset:0;background:#1b1d24;color:#ddd;font:12px monospace;';

  // ---- turntable ------------------------------------------------------------
  const TW = 1200, TH = 330;
  const turnCanvas = document.createElement('canvas');
  turnCanvas.width = TW;
  turnCanvas.height = TH;
  turnCanvas.style.cssText = `position:absolute;left:0;top:0;width:${TW}px;height:${TH}px;`;
  root.appendChild(turnCanvas);
  const turnRenderer = new THREE.WebGLRenderer({ canvas: turnCanvas, antialias: true, preserveDrawingBuffer: true });
  turnRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  turnRenderer.setScissorTest(true);
  const turnScene = new THREE.Scene();
  turnScene.background = new THREE.Color(0x30343f);
  turnScene.add(new THREE.HemisphereLight(0xffffff, 0xb8b0c0, 1.35));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-2, 4, 3);
  turnScene.add(sun);
  const grid = new THREE.GridHelper(2, 8, 0x777777, 0x555555);
  turnScene.add(grid);

  const turnModel = await loadPokemonModel(slug);
  applyToonMaterials(turnModel, { effectParts: profile.effectParts, grade: profile.calibration.grade });
  turnScene.add(turnModel.root);
  const turnRig = new Rig(turnModel, profile.rig);
  let skel: THREE.SkeletonHelper | null = null;
  if (showBones) {
    skel = new THREE.SkeletonHelper(turnModel.root);
    (skel.material as THREE.LineBasicMaterial).depthTest = false;
    turnScene.add(skel);
  }
  const turnCam = new THREE.PerspectiveCamera(22, (TW / 4) / TH, 0.01, 50);

  // ---- battle view ----------------------------------------------------------
  const SCALE = 3;
  const battleHolder = document.createElement('div');
  battleHolder.style.cssText = `position:absolute;left:0;top:${TH + 8}px;width:${240 * SCALE}px;height:${160 * SCALE}px;`;
  root.appendChild(battleHolder);
  const screen = new GbaScreen(battleHolder, SCALE);
  const stage = new BattleStage(screen.canvas3d, undefined, { supersample: 2 });
  await stage.setEnvironment('grass');
  const battleModels: Record<'player' | 'enemy', { model: LoadedModel; rig: Rig }> = {} as never;
  for (const slot of ['player', 'enemy'] as const) {
    const inst = await instantiatePokemon(stage, slot, slug);
    battleModels[slot] = { model: inst.model, rig: inst.rig };
  }
  const front = await loadBitmap(asset(`gba/pokemon/${slug}/front.png`));
  const back = await loadBitmap(asset(`gba/pokemon/${slug}/back.png`));
  const sp = SPECIES[slug];
  const ref = await loadBitmap(`${import.meta.env.BASE_URL}reference/emerald/${slug}_vs_${slug}/action.png`).catch(() => null);
  const refCanvas = document.createElement('canvas');
  refCanvas.width = 240;
  refCanvas.height = 160;
  refCanvas.style.cssText = `position:absolute;left:${240 * SCALE + 8}px;top:${TH + 8}px;width:${240 * SCALE}px;height:${160 * SCALE}px;image-rendering:pixelated;`;
  root.appendChild(refCanvas);
  if (ref) {
    const ctx = refCanvas.getContext('2d')!;
    const img = ctx.createImageData(240, 160);
    img.data.set(ref.data);
    ctx.putImageData(img, 0, 0);
  }

  const label = document.createElement('div');
  label.style.cssText = `position:absolute;left:8px;top:${TH + 160 * SCALE + 14}px;white-space:pre;`;
  root.appendChild(label);

  /** Draw stock sprites where Emerald draws them (sBattlerCoords + pic y offsets). */
  const drawOnion = (fb: Bitmap) => {
    if (onion <= 0) return;
    const tmp = { width: 240, height: 160, data: new Uint8ClampedArray(240 * 160 * 4) };
    const fy = 40 + (sp.frontCoords?.yOffset ?? 0) - sp.elevation - 32;
    const by = 80 + (sp.backCoords?.yOffset ?? 0) - 32;
    blit(tmp, front, 0, 0, 64, 64, 176 - 32, fy);
    blit(tmp, back, 0, 0, 64, 64, 72 - 32, by);
    for (let i = 0; i < tmp.data.length; i += 4) {
      if (!tmp.data[i + 3]) continue;
      fb.data[i] = tmp.data[i];
      fb.data[i + 1] = tmp.data[i + 1];
      fb.data[i + 2] = tmp.data[i + 2];
      fb.data[i + 3] = Math.round(255 * onion);
    }
  };

  let currentPose: Pose = profile.poses[params.get('pose') ?? 'stance'] ?? profile.poses.stance;

  const render = () => {
    turnRig.applyPose(currentPose);
    turnModel.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(turnModel.root, true);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const dist = (Math.max(size.y, size.x, size.z) / 2 / Math.tan(THREE.MathUtils.degToRad(11))) * 1.15;
    VIEWS.forEach((v, i) => {
      turnCam.position.copy(center).addScaledVector(v.dir.clone().normalize(), dist);
      turnCam.lookAt(center);
      const x = i * (TW / 4);
      turnRenderer.setViewport(x, 0, TW / 4, TH);
      turnRenderer.setScissor(x, 0, TW / 4, TH);
      turnRenderer.render(turnScene, turnCam);
    });
    for (const slot of ['player', 'enemy'] as const) battleModels[slot].rig.applyPose(currentPose);
    stage.render();
    clear(screen.ui);
    drawOnion(screen.ui);
    screen.presentUi();
    label.textContent = `species ${slug}  pose ${params.get('pose') ?? 'stance'}  bbox h=${size.y.toFixed(3)} w=${size.x.toFixed(3)} d=${size.z.toFixed(3)}`;
  };
  render();

  const api = {
    setPose(p: Pose) {
      currentPose = p;
      render();
    },
    setNamedPose(name: string) {
      currentPose = profile.poses[name];
      render();
    },
    rigs: { turn: turnRig, ...battleModels },
    stage,
  };
  (window as unknown as { riglab: unknown }).riglab = api;
  return api;
}
