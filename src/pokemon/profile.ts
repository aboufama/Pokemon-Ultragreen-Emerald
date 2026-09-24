// Per-species 3D profile: everything the gauntlet has to produce for a species.
import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';
import type { Pose, RigProfile } from '../anim/rig';
import type { Clip } from '../anim/clip';
import type { BattleStage, SlotName } from '../render3d/stage';
import type { ColorGrade } from '../render3d/materials';
import type { PaletteSlot } from '../render3d/pipeline';
import type { FireOptions } from '../render3d/fire';

export interface SlotCalibration {
  /** Extra yaw (degrees) on top of facing the opponent. */
  yaw: number;
  /** Offsets in the slot's local frame (world units): x = its left, z = toward opponent. */
  dx: number;
  dz: number;
  /** Height above the ground (floating/flying species). */
  lift: number;
}

export interface OutlinePolicy {
  /** Palette index of the silhouette outline (Gen 3: usually black). */
  outer: number;
  /** Palette index of inner crease lines. */
  inner: number;
  /** Lit edges take the darkest shade of their own ramp. */
  selective: boolean;
}

export function paletteSlot(profile: SpeciesProfile, shiny = false): PaletteSlot {
  const o = profile.calibration.outline;
  // Shiny = same indices, other palette (the model and its fit stay the same).
  return { colors: profile.palette, display: shiny ? profile.shinyPalette : undefined, outerIndex: o.outer, innerIndex: o.inner, selective: o.selective };
}

export interface Calibration {
  /** Model height in world units (bind pose normalized to 1). */
  height: number;
  slots: Record<SlotName, SlotCalibration>;
  /** Outline policy derived from the stock sprites' boundary pixels. */
  outline: OutlinePolicy;
  /** Fit quality from the calibration tool (IoU with the stock sprite). */
  fit?: Record<SlotName, { iou: number; boxIou?: number }>;
  /** Toon color grade fitted so palette usage matches the stock sprites. */
  grade?: ColorGrade;
  colorFit?: { loss: number };
}

export interface ExpressionAtlas {
  /** Material/texture name fragment of the eye mesh. */
  material: string;
  /** UV size of one cell. */
  cell: [number, number];
  cells: Record<string, [number, number]>;
}

export interface EffectBinding {
  /** Effect mesh name fragments driven by this Pose.fx channel. */
  parts: string[];
  fire?: FireOptions;
}

export interface SpeciesProfile {
  slug: string;
  rig: RigProfile;
  poses: Record<string, Pose>;
  clips: Record<string, Clip>;
  /** Mesh/texture name fragments that are effects (hidden unless enabled). */
  effectParts: string[];
  /** Pose.fx channel -> effect meshes. */
  effects: Record<string, EffectBinding>;
  expressions?: ExpressionAtlas;
  /** Per-move clip overrides (MOVE_* -> clip name), e.g. kicks. */
  moveClips: Record<string, string>;
  palette: RGB[];
  shinyPalette: RGB[];
  calibration: Calibration;
  placeInSlot(root: THREE.Object3D, slot: SlotName, stage: BattleStage): void;
}

export function applyCalibration(root: THREE.Object3D, cal: Calibration, slot: SlotName): void {
  const c = cal.slots[slot];
  root.scale.setScalar(cal.height);
  root.rotation.set(0, THREE.MathUtils.degToRad(c.yaw), 0);
  root.position.set(c.dx, c.lift, c.dz);
}
