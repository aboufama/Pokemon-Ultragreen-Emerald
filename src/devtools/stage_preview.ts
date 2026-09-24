// Dev view: the 3D battle stage with the GBA UI on top, optionally next to the
// real Emerald reference frame.
//
//   /?mode=stage&player=blaziken&enemy=blaziken[&compare=1][&fov=..&pitch=..&height=..]

import * as THREE from 'three';
import { GbaScreen } from '../battle/screen';
import { Healthbox } from '../battle/ui/healthbox';
import { BattleTextbox } from '../battle/ui/textbox';
import { SPECIES } from '../data';
import { loadAllFonts } from '../gba/font';
import { clear, loadBitmap } from '../gba/bitmap';
import { loadPokemonModel } from '../render3d/model';
import { applyToonMaterials } from '../render3d/materials';
import { BATTLE_CAMERA, BattleStage, type BattleCameraSpec } from '../render3d/stage';
import { hasProfile } from '../pokemon/registry';
import { instantiatePokemon } from '../pokemon/instantiate';

export async function runStagePreview(root: HTMLElement): Promise<unknown> {
  const params = new URLSearchParams(location.search);
  const num = (k: string, d: number) => (params.has(k) ? Number(params.get(k)) : d);
  const spec: BattleCameraSpec = structuredClone(BATTLE_CAMERA);
  spec.fov = num('fov', spec.fov);
  spec.pitch = num('pitch', spec.pitch);
  spec.height = num('height', spec.height);
  const playerSlug = params.get('player') ?? 'blaziken';
  const enemySlug = params.get('enemy') ?? 'blaziken';
  const monHeight = num('monHeight', 1.9);
  const compare = params.get('compare') === '1';
  const scale = num('scale', 3);

  root.style.cssText = 'position:fixed;inset:0;background:#15151c;';
  const holder = document.createElement('div');
  holder.style.cssText = `position:absolute;left:0;top:0;width:${240 * scale}px;height:${160 * scale}px;`;
  root.appendChild(holder);
  const screen = new GbaScreen(holder, scale);

  const stage = new BattleStage(screen.canvas3d, spec, {
    supersample: num('ss', 2),
    outline: params.get('outline') !== '0',
    paletteSnap: params.get('snap') !== '0',
  });
  await stage.setEnvironment(params.get('env') ?? 'grass');

  for (const [slot, slug] of [['player', playerSlug], ['enemy', enemySlug]] as const) {
    const model = await loadPokemonModel(slug);
    model.root.userData.pixelId = slot === 'player' ? 1 : 2;
    stage.slots[slot].add(model.root);
    if (hasProfile(slug)) {
      stage.slots[slot].remove(model.root);
      const inst = await instantiatePokemon(stage, slot, slug, { shiny: params.get('shiny') === '1' });
      inst.rig.applyPose(inst.profile.poses[params.get('pose') ?? 'stance']);
    } else {
      applyToonMaterials(model, { effectParts: ['Fire'] });
      model.root.scale.setScalar(monHeight);
      const pal = await (await fetch(`${import.meta.env.BASE_URL}assets/gba/pokemon/${slug}/palette.json`)).json();
      stage.pipeline.setPalette(slot === 'player' ? 0 : 1, { colors: pal.normal, outerIndex: num('outer', 15), innerIndex: num('inner', 8) });
    }
    const yawKey = `${slot}Yaw`;
    if (params.has(yawKey)) stage.slots[slot].rotateY(THREE.MathUtils.degToRad(Number(params.get(yawKey))));
  }

  // UI on top.
  const fonts = await loadAllFonts();
  const textbox = await BattleTextbox.load(fonts);
  const boxes = [await Healthbox.load('player', fonts.small), await Healthbox.load('opponent', fonts.small)];
  for (const [hb, slug] of [[boxes[0], playerSlug], [boxes[1], enemySlug]] as const) {
    const sp = SPECIES[slug];
    hb.name = sp.name;
    hb.gender = sp.genderRatio === 255 ? null : sp.genderRatio === 254 ? 'female' : 'male';
    hb.level = 50;
    hb.hp = hb.shownHp = hb.maxHp = Math.floor(((2 * sp.baseStats.hp + 31) * 50) / 100) + 60;
  }
  textbox.page = 'action';
  textbox.setActionPrompt(SPECIES[playerSlug].name);
  clear(screen.ui);
  if (params.get('ui') !== '0') {
    boxes.forEach((b) => b.draw(screen.ui));
    textbox.draw(screen.ui, 0);
  }
  screen.presentUi();
  stage.render();

  if (compare) {
    const ref = await loadBitmap(`${import.meta.env.BASE_URL}reference/emerald/${playerSlug}_vs_${enemySlug}/action.png`);
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 160;
    c.style.cssText = `position:absolute;left:${240 * scale + 16}px;top:0;width:${240 * scale}px;height:${160 * scale}px;image-rendering:pixelated;`;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(240, 160);
    img.data.set(ref.data);
    ctx.putImageData(img, 0, 0);
    root.appendChild(c);
  }
  return { stage };
}
