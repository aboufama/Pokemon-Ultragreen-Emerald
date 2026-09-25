// The arena's life, kept in the GBA look: wind with gusts (which also sways
// the Pokémon's loose parts and the arena's tall grass, reeds and kelp),
// drifting motes (seeds, sand, ash, dust, bubbles), dust kicked up on
// landings, and per-arena ground effects handled by the arena's ground
// shader (grass rippling in the wind, drifting cloud shadows, water glints,
// underwater caustics).
//
// Particles are pixel squares (THREE.Points sized in GBA pixels), rendered
// as environment pixels: never palette-snapped or outlined, and they don't
// claim Pokémon pixels.

import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';

export interface AmbienceStyle {
  /** Base wind speed (world units/s along camera-right) and gust strength. */
  wind: number;
  gusts: number;
  /** Floating motes: how many, their colors, pixel size, and how they move. */
  motes?: { count: number; colors: RGB[]; size: [number, number]; rise: number; drift: number; streak?: boolean };
  /** Colors of dust kicked up on landings and stomps. */
  dust: RGB[];
  /** Ground shader effects. */
  grassWaves?: boolean;
  clouds?: number;
  glints?: boolean;
  caustics?: boolean;
}

const OUTDOOR_DUST: RGB[] = [[232, 240, 208], [200, 224, 176], [248, 248, 232]];

export const AMBIENCE: Record<string, AmbienceStyle> = {
  grass: { wind: 0.25, gusts: 0.6, grassWaves: true, clouds: 0.08, dust: OUTDOOR_DUST, motes: { count: 26, colors: [[248, 248, 224], [232, 248, 200], [255, 255, 255]], size: [1, 1], rise: 0.04, drift: 1 } },
  long_grass: { wind: 0.3, gusts: 0.7, grassWaves: true, clouds: 0.08, dust: [[176, 216, 144], [208, 232, 184], [152, 200, 120]], motes: { count: 30, colors: [[176, 224, 128], [216, 240, 176], [248, 248, 216]], size: [1, 2], rise: 0.02, drift: 1.2 } },
  plain: { wind: 0.2, gusts: 0.5, clouds: 0.08, dust: OUTDOOR_DUST, motes: { count: 18, colors: [[248, 248, 232], [240, 240, 216]], size: [1, 1], rise: 0.03, drift: 0.9 } },
  sand: { wind: 0.55, gusts: 0.9, clouds: 0.08, dust: [[240, 224, 168], [224, 200, 136], [248, 240, 200]], motes: { count: 34, colors: [[240, 224, 168], [224, 208, 144], [248, 240, 200]], size: [1, 1], rise: -0.01, drift: 2.4, streak: true } },
  // Mt. Chimney: volcanic ash drifting down.
  mountain: { wind: 0.3, gusts: 0.6, dust: [[222, 180, 164], [189, 131, 115], [238, 205, 197]], motes: { count: 34, colors: [[230, 222, 222], [200, 190, 190], [170, 160, 164]], size: [1, 1], rise: -0.09, drift: 0.9 } },
  cave: { wind: 0.05, gusts: 0.2, dust: [[176, 152, 112], [152, 128, 96], [200, 176, 136]], motes: { count: 22, colors: [[200, 184, 152], [168, 152, 128]], size: [1, 1], rise: -0.02, drift: 0.25 } },
  building: { wind: 0.02, gusts: 0.1, dust: [[216, 208, 200], [200, 192, 184]], motes: { count: 14, colors: [[240, 232, 224], [224, 216, 208]], size: [1, 1], rise: 0.01, drift: 0.2 } },
  water: { wind: 0.35, gusts: 0.6, glints: true, clouds: 0.08, dust: [[232, 248, 255], [200, 232, 248], [255, 255, 255]], motes: { count: 12, colors: [[255, 255, 255], [224, 240, 255]], size: [1, 1], rise: 0.05, drift: 1 } },
  pond: { wind: 0.3, gusts: 0.5, glints: true, clouds: 0.08, dust: [[232, 248, 255], [200, 232, 248], [255, 255, 255]], motes: { count: 16, colors: [[248, 248, 224], [224, 240, 255]], size: [1, 1], rise: 0.04, drift: 0.8 } },
  underwater: { wind: 0.08, gusts: 0.3, caustics: true, dust: [[200, 232, 255], [232, 248, 255]], motes: { count: 26, colors: [[232, 248, 255], [200, 224, 248]], size: [1, 2], rise: 0.35, drift: 0.2 } },
};

const vertexShader = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  attribute float alpha;
  uniform float pixelScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = color;
    vAlpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * pixelScale;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float pixelScale;
  float bayer(vec2 p) {
    vec2 q = mod(p, 4.0);
    int i = int(q.x) + int(q.y) * 4;
    float m[16];
    m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
    for (int k = 0; k < 16; k++) if (k == i) return (m[k] + 0.5) / 16.0;
    return 0.5;
  }
  void main() {
    // Fade by dithering in GBA pixels (no partial alpha on the GBA).
    if (vAlpha < bayer(floor(gl_FragCoord.xy / pixelScale))) discard;
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

interface Mote {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  phase: number;
  life: number;
  age: number;
  size: number;
  color: THREE.Color;
  kind: 'mote' | 'dust';
}

const MAX = 160;

export class Ambience {
  readonly group = new THREE.Group();
  /** Current wind (world units/s), for particles and the Pokémon's loose parts. */
  readonly wind = new THREE.Vector3();
  /** 0..1 gust envelope (drives the grass waves). */
  gust = 0;
  private time = 0;
  private readonly motes: Mote[] = [];
  private readonly geometry = new THREE.BufferGeometry();
  private readonly positions = new Float32Array(MAX * 3);
  private readonly colors = new Float32Array(MAX * 3);
  private readonly sizes = new Float32Array(MAX);
  private readonly alphas = new Float32Array(MAX);
  private readonly material: THREE.ShaderMaterial;
  private seed = 1;
  private readonly right: THREE.Vector3;

  constructor(readonly style: AmbienceStyle, camera: THREE.PerspectiveCamera, private readonly center: THREE.Vector3, private readonly radius: number, pixelScale: number) {
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
    this.material = new THREE.ShaderMaterial({
      uniforms: { pixelScale: { value: pixelScale } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    points.renderOrder = 5;
    this.group.add(points);
    this.right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize();
    for (let i = 0; i < (style.motes?.count ?? 0); i++) this.motes.push(this.spawnMote(true));
  }

  private rand(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  private spawnMote(anywhere: boolean): Mote {
    const m = this.style.motes!;
    const r = this.radius;
    // Upwind edge unless filling the volume at start.
    const along = anywhere ? (this.rand() * 2 - 1) * r : -r * Math.sign(this.style.wind || 1);
    const pos = this.center.clone()
      .addScaledVector(this.right, along)
      .add(new THREE.Vector3(0, 0, (this.rand() * 2 - 1) * r * 0.9));
    pos.y = this.rand() * r * 0.35;
    const c = m.colors[Math.floor(this.rand() * m.colors.length)];
    return {
      pos,
      vel: new THREE.Vector3(),
      phase: this.rand() * Math.PI * 2,
      life: 1e9,
      age: 0,
      size: m.size[0] + Math.floor(this.rand() * (m.size[1] - m.size[0] + 1)),
      color: new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255),
      kind: 'mote',
    };
  }

  /** Dust kicked up at a point on the ground (landings, stomps, slides). */
  puff(at: THREE.Vector3, strength = 1, scale = 1): void {
    const n = Math.round(6 + 6 * strength);
    for (let i = 0; i < n && this.motes.length < MAX; i++) {
      const ang = (i / n) * Math.PI * 2 + this.rand() * 0.5;
      const c = this.style.dust[Math.floor(this.rand() * this.style.dust.length)];
      const speed = (0.25 + this.rand() * 0.35) * scale * (0.7 + 0.5 * strength);
      this.motes.push({
        pos: at.clone().add(new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)).multiplyScalar(0.05 * scale)).setY(0.02 * scale),
        vel: new THREE.Vector3(Math.cos(ang) * speed, (0.15 + this.rand() * 0.25) * scale, Math.sin(ang) * speed * 0.6),
        phase: this.rand() * 6,
        life: 0.35 + this.rand() * 0.25,
        age: 0,
        size: this.rand() < 0.3 ? 2 : 1,
        color: new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255),
        kind: 'dust',
      });
    }
  }

  update(dt: number): void {
    this.time += dt;
    const t = this.time;
    // Gusts: a slow swell with a faster flutter on top.
    const swell = 0.5 + 0.5 * Math.sin(t * 0.45) * Math.sin(t * 0.17 + 1.3);
    const flutter = 0.5 + 0.5 * Math.sin(t * 1.7 + Math.sin(t * 0.6) * 2);
    this.gust = Math.min(1, Math.max(0, swell * 0.8 + flutter * 0.2));
    const speed = this.style.wind * (1 + this.style.gusts * (this.gust * 2 - 0.6));
    this.wind.copy(this.right).multiplyScalar(speed);
    this.wind.y = 0;

    const m = this.style.motes;
    for (let i = this.motes.length - 1; i >= 0; i--) {
      const p = this.motes[i];
      p.age += dt;
      if (p.kind === 'dust') {
        p.vel.multiplyScalar(Math.pow(0.02, dt));
        p.vel.y -= 0.6 * dt;
        p.pos.addScaledVector(p.vel, dt);
        if (p.pos.y < 0) p.pos.y = 0;
        if (p.age > p.life) this.motes.splice(i, 1);
        continue;
      }
      // Motes ride the wind, bob and wander.
      const bob = Math.sin(t * 1.3 + p.phase) * 0.03;
      p.pos.addScaledVector(this.wind, dt * (m?.drift ?? 1));
      p.pos.y += ((m?.rise ?? 0) + bob) * dt * (m?.streak ? 0.3 : 1);
      p.pos.z += Math.cos(t * 0.7 + p.phase) * 0.02 * dt;
      const off = p.pos.clone().sub(this.center);
      const along = off.dot(this.right);
      if (Math.abs(along) > this.radius || p.pos.y < -0.05 || p.pos.y > this.radius * 0.5) this.motes[i] = this.spawnMote(false);
    }

    const n = Math.min(MAX, this.motes.length);
    for (let i = 0; i < MAX; i++) {
      const p = this.motes[i];
      if (!p || i >= n) {
        this.alphas[i] = 0;
        this.sizes[i] = 0;
        continue;
      }
      this.positions.set([p.pos.x, p.pos.y, p.pos.z], i * 3);
      this.colors.set([p.color.r, p.color.g, p.color.b], i * 3);
      this.sizes[i] = p.size;
      this.alphas[i] = p.kind === 'dust' ? Math.max(0, 1 - p.age / p.life) : 0.55 + 0.45 * Math.sin(t * 2.1 + p.phase);
    }
    for (const name of ['position', 'color', 'size', 'alpha']) (this.geometry.getAttribute(name) as THREE.BufferAttribute).needsUpdate = true;
    this.geometry.setDrawRange(0, MAX);
  }
}
