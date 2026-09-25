// The battle camera's view of the ground, in GBA pixels: which ground point
// a screen pixel shows, where a world point lands on screen, and how many
// screen pixels a world unit covers there. Arenas are painted for this fixed
// view, so every painted pixel and every prop lands on exactly one GBA pixel.

import * as THREE from 'three';

export interface GroundPoint {
  x: number;
  z: number;
  /** Distance along the view direction. */
  depth: number;
  /** GBA pixels per world unit at this point. */
  ppu: number;
}

export class ArenaView {
  private readonly pos: THREE.Vector3;
  private readonly fwd: THREE.Vector3;
  private readonly right: THREE.Vector3;
  private readonly up: THREE.Vector3;
  private readonly tanV: number;
  private readonly tanH: number;

  constructor(readonly camera: THREE.PerspectiveCamera) {
    camera.updateMatrixWorld(true);
    this.pos = camera.position.clone();
    this.fwd = camera.getWorldDirection(new THREE.Vector3());
    this.right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    this.up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    this.tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    this.tanH = this.tanV * camera.aspect;
  }

  /** The ground point (y = 0) seen through the center of GBA pixel (sx, sy), or null above the horizon. */
  ground(sx: number, sy: number): GroundPoint | null {
    const nx = ((sx + 0.5) / 240) * 2 - 1;
    const ny = 1 - ((sy + 0.5) / 160) * 2;
    const dx = this.fwd.x + nx * this.tanH * this.right.x + ny * this.tanV * this.up.x;
    const dy = this.fwd.y + nx * this.tanH * this.right.y + ny * this.tanV * this.up.y;
    const dz = this.fwd.z + nx * this.tanH * this.right.z + ny * this.tanV * this.up.z;
    if (dy >= -1e-6) return null;
    const t = -this.pos.y / dy;
    const x = this.pos.x + dx * t, z = this.pos.z + dz * t;
    // The ray's length along the view direction is t (fwd has unit length and the offsets are perpendicular).
    const depth = t;
    return { x, z, depth, ppu: this.ppu(depth) };
  }

  /** GBA pixels per world unit at a depth. */
  ppu(depth: number): number {
    return 160 / (2 * depth * this.tanV);
  }

  depth(x: number, y: number, z: number): number {
    return (x - this.pos.x) * this.fwd.x + (y - this.pos.y) * this.fwd.y + (z - this.pos.z) * this.fwd.z;
  }

  /** Where a world point lands, in GBA pixels (continuous; pixel (i, j) spans [i, i+1)). */
  screen(x: number, y: number, z: number): [number, number] {
    const rx = x - this.pos.x, ry = y - this.pos.y, rz = z - this.pos.z;
    const d = rx * this.fwd.x + ry * this.fwd.y + rz * this.fwd.z;
    const u = (rx * this.right.x + ry * this.right.y + rz * this.right.z) / (d * this.tanH);
    const v = (rx * this.up.x + ry * this.up.y + rz * this.up.z) / (d * this.tanV);
    return [(u * 0.5 + 0.5) * 240, (0.5 - v * 0.5) * 160];
  }

  /** The world point at screen position (sx, sy) (continuous GBA pixels) and view depth `depth`. */
  unproject(sx: number, sy: number, depth: number): THREE.Vector3 {
    const u = (sx / 240) * 2 - 1;
    const v = 1 - (sy / 160) * 2;
    return this.pos.clone()
      .addScaledVector(this.fwd, depth)
      .addScaledVector(this.right, u * this.tanH * depth)
      .addScaledVector(this.up, v * this.tanV * depth);
  }

  /** The ground point (x, z) that projects to continuous screen position (sx, sy). */
  groundAt(sx: number, sy: number): GroundPoint | null {
    return this.ground(sx - 0.5, sy - 0.5);
  }
}
