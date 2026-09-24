// Put a species' 3D model into a battle slot with its calibration applied.
import type * as THREE from 'three';
import { Rig } from '../anim/rig';
import { loadPokemonModel, type LoadedModel } from '../render3d/model';
import { applyToonMaterials, type ToonHandles } from '../render3d/materials';
import type { BattleStage, SlotName } from '../render3d/stage';
import { paletteSlot, type SpeciesProfile } from './profile';
import { getSpeciesProfile } from './registry';

export interface PokemonInstance {
  profile: SpeciesProfile;
  model: LoadedModel;
  rig: Rig;
  toon: ToonHandles;
  root: THREE.Group;
}

export const SLOT_PIXEL_ID: Record<SlotName, number> = { player: 1, enemy: 2 };

export async function instantiatePokemon(stage: BattleStage, slot: SlotName, slug: string, opts: { shiny?: boolean } = {}): Promise<PokemonInstance> {
  const profile = await getSpeciesProfile(slug);
  // Shiny recolors through the palette (paletteSlot); the upstream shiny
  // meshes are separate exports whose skeletons don't match the rig map.
  const model = await loadPokemonModel(slug, 'regular', { hiddenParts: profile.hiddenParts });
  const toon = applyToonMaterials(model, { effectParts: profile.effectParts, grade: profile.calibration.grade });
  model.root.userData.pixelId = SLOT_PIXEL_ID[slot];
  stage.slots[slot].add(model.root);
  profile.placeInSlot(model.root, slot, stage);
  stage.pipeline.setPalette(SLOT_PIXEL_ID[slot] - 1, paletteSlot(profile, opts.shiny));
  const rig = new Rig(model, profile.rig);
  rig.applyPose(profile.poses.stance);
  return { profile, model, rig, toon, root: model.root };
}
