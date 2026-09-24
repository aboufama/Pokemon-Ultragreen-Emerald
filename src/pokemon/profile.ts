// Per-species 3D profile: everything the gauntlet has to produce for a species.
import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';
import type { Pose, RigProfile } from '../anim/rig';
import type { Clip } from '../anim/clip';
import type { BattleStage, SlotName } from '../render3d/stage';
import type { ColorGrade } from '../render3d/materials';
import type { PaletteSlot } from '../render3d/pipeline';
import type { FireOptions } from '../render3d/fire';
import type { SpringChainSpec } from '../anim/dynamics';
import type { Motif } from '../battle3d/motifs';

export interface SlotCalibration {
  /** Extra yaw (degrees) on top of facing the opponent, fitted to the stock sprite. */
  yaw: number;
  /**
   * Art-directed turn on top of the fitted yaw (degrees, + toward the
   * battler's own left). Not part of the fit; recalibration keeps it.
   */
  yawAdjust?: number;
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

/**
 * The species brief: what the gauntlet's clip author needs to know about the
 * creature before animating it (see .claude/skills/pokemon-gauntlet).
 */
export interface SpeciesBrief {
  bodyPlan: 'biped' | 'quadruped' | 'serpent' | 'bird' | 'fish' | 'blob' | 'other';
  /** How it moves and fights: weight, temperament, signature habits. */
  character: string;
  /** Where its type's power comes from (mouth, cannons, flower, flames...). */
  powerSource: string;
}

/** A named effect origin: one point per bone (twin cannons, both hands). */
export interface EmitterSpec {
  bones: string[];
  /**
   * Point in each bone's frame. Default: toward the far end of the mesh the
   * bone moves (see `reach`), which finds cannon muzzles and flower tops.
   */
  offset?: [number, number, number];
  /** How far along the bone's skin extent the default point sits (0..1, default 0.9). */
  reach?: number;
}

export interface SpeciesProfile {
  slug: string;
  brief?: SpeciesBrief;
  rig: RigProfile;
  poses: Record<string, Pose>;
  clips: Record<string, Clip>;
  /** Mesh/texture name fragments that are effects (hidden unless enabled). */
  effectParts: string[];
  /** Pose.fx channel -> effect meshes. */
  effects: Record<string, EffectBinding>;
  expressions?: ExpressionAtlas;
  /** Loose parts simulated as springs on top of the animation (mane, tail, feathers). */
  dynamics?: SpringChainSpec[];
  /**
   * Overlapping action: seconds each semantic bone lags the clip (default
   * DEFAULT_OVERLAP in src/anim/animator.ts).
   */
  overlap?: Record<string, number>;
  /** Per-move clip overrides (MOVE_* -> clip name), checked first. */
  moveClips: Record<string, string>;
  /**
   * Clips by move motif (src/battle3d/motifs.ts): `<motif>_strong` for strong
   * moves, then `<motif>`, before the category clip. Clips named after a
   * motif are found without an entry here.
   */
  motifClips?: Partial<Record<string, string>>;
  /**
   * Named effect origins besides the built-in ones: mouth (jaw tip), eyes,
   * hands, feet, body. E.g. Blastoise's cannons, Venusaur's flower.
   */
  emitters?: Record<string, EmitterSpec>;
  /** Which emitter each motif's effect leaves from (default: MOTIFS[motif].emitter). */
  emitterFor?: Partial<Record<Motif, string>>;
  /** Mesh or node name fragments to hide (extra LODs, alternate meshes). */
  hiddenParts?: string[];
  /** Four moves that show the species off (demo defaults, clip review). */
  showcaseMoves?: string[];
  palette: RGB[];
  shinyPalette: RGB[];
  calibration: Calibration;
  placeInSlot(root: THREE.Object3D, slot: SlotName, stage: BattleStage): void;
}

/** Resting yaw of a slot in degrees: the fitted yaw plus the art adjustment. */
export function slotYaw(c: SlotCalibration): number {
  return c.yaw + (c.yawAdjust ?? 0);
}

export function applyCalibration(root: THREE.Object3D, cal: Calibration, slot: SlotName): void {
  const c = cal.slots[slot];
  root.scale.setScalar(cal.height);
  root.rotation.set(0, THREE.MathUtils.degToRad(slotYaw(c)), 0);
  root.position.set(c.dx, c.lift, c.dz);
}
