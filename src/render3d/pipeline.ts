// Viewport pixelation: the 3D scene (models, environment, move VFX) is
// rendered at GBA resolution and turned into sprite-like pixels in one
// composite pass. Nothing is baked into assets.
//
//   1. color pass  -> RT (internal resolution = 240x160 * density * supersample)
//   2. id pass     -> RT (which object owns each pixel; 0 = environment)
//   3. composite   -> canvas: per output pixel pick the majority object among
//      its supersamples, average that object's color, outline silhouettes with
//      the species' outline color, snap Pokémon pixels to their stock GBA
//      palette and quantize everything to RGB555.

import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';

export const MAX_PALETTES = 8;

export interface PixelSettings {
  /** Output pixels per GBA pixel (1 = native 240x160). */
  density: number;
  /** Scene samples per output pixel along each axis. */
  supersample: number;
  outline: boolean;
  /** Also outline depth discontinuities inside a silhouette. */
  innerOutline: boolean;
  paletteSnap: boolean;
  rgb555: boolean;
}

export const DEFAULT_PIXEL_SETTINGS: PixelSettings = {
  density: 1,
  supersample: 2,
  outline: true,
  innerOutline: true,
  paletteSnap: true,
  rgb555: true,
};

export interface PaletteSlot {
  colors: RGB[]; // up to 16, index 0 = transparent (ignored)
  /** Silhouette outline color (Gen 3 sprites: mostly black). */
  outerIndex: number;
  /** Inner crease lines (depth edges inside the silhouette). */
  innerIndex: number;
  /** Lit silhouette edges use the darkest shade of their own ramp ("selout"). */
  selective?: boolean;
}

function srgbToOklab([r, g, b]: RGB): [number, number, number] {
  const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

/**
 * For each palette entry, the darkest entry of the same hue ramp (used for
 * selective outlines). Ramps are grouped by OKLab hue; greys by low chroma.
 */
export function darkestInRamp(colors: RGB[], exclude: number[]): number[] {
  const lab = colors.map(srgbToOklab);
  const chroma = lab.map(([, a, b]) => Math.hypot(a, b));
  const hue = lab.map(([, a, b]) => Math.atan2(b, a));
  return colors.map((_, i) => {
    let best = i;
    for (let j = 1; j < colors.length; j++) {
      if (exclude.includes(j) || j === i) continue;
      const bothGrey = chroma[i] < 0.03 && chroma[j] < 0.03;
      let dh = Math.abs(hue[i] - hue[j]);
      if (dh > Math.PI) dh = 2 * Math.PI - dh;
      const sameRamp = bothGrey || (chroma[i] >= 0.03 && chroma[j] >= 0.02 && dh < 0.45);
      if (sameRamp && lab[j][0] < lab[best][0]) best = j;
    }
    return best;
  });
}

const compositeFrag = /* glsl */ `
  precision highp float;
  precision highp int;
  uniform sampler2D tColor;
  uniform sampler2D tId;
  uniform sampler2D tDepth;
  uniform ivec2 srcSize;
  uniform int ss;
  uniform bool outline;
  uniform bool innerOutline;
  uniform bool paletteSnap;
  uniform bool rgb555;
  uniform vec3 palettes[${MAX_PALETTES * 16}];
  uniform int paletteSize[${MAX_PALETTES}];
  uniform int outerIndex[${MAX_PALETTES}];
  uniform int innerIndex[${MAX_PALETTES}];
  uniform int darkOf[${MAX_PALETTES * 16}];
  uniform bool selective[${MAX_PALETTES}];
  uniform float cameraNear;
  uniform float cameraFar;
  uniform float innerThreshold;
  // id layout: 0 environment, 1..8 palette slots (Pokémon), 9+ effects (no snap/outline)
  const int FIRST_FX_ID = ${MAX_PALETTES + 1};

  int idAt(ivec2 p) {
    p = clamp(p, ivec2(0), srcSize - 1);
    return int(texelFetch(tId, p, 0).r * 255.0 + 0.5);
  }

  float linearDepth(ivec2 p) {
    p = clamp(p, ivec2(0), srcSize - 1);
    float z = texelFetch(tDepth, p, 0).r * 2.0 - 1.0;
    return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
  }

  vec3 srgbToLinear(vec3 c) {
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  }

  vec3 oklab(vec3 srgb) {
    vec3 c = srgbToLinear(srgb);
    vec3 lms = mat3(0.4122214708, 0.2119034982, 0.0883024619,
                    0.5363325363, 0.6806995451, 0.2817188376,
                    0.0514459929, 0.1073969566, 0.6299787005) * c;
    lms = pow(max(lms, vec3(0.0)), vec3(1.0 / 3.0));
    return mat3(0.2104542553, 1.9779984951, 0.0259040371,
                0.7936177850, -2.4285922050, 0.7827717662,
                -0.0040720468, 0.4505937099, -0.8086757660) * lms;
  }

  int snapIndex(vec3 c, int slot) {
    vec3 lab = oklab(c);
    float best = 1e9;
    int bestI = 1;
    int n = paletteSize[slot];
    for (int i = 1; i < 16; i++) {
      if (i >= n) break;
      // Outline colors are reserved for edges.
      if (i == outerIndex[slot] || i == innerIndex[slot]) continue;
      vec3 d = oklab(palettes[slot * 16 + i]) - lab;
      // Weight lightness a bit less than chroma so shading bands keep their hue.
      float dist = d.x * d.x * 0.8 + d.y * d.y + d.z * d.z;
      if (dist < best) { best = dist; bestI = i; }
    }
    return bestI;
  }

  vec3 toRgb555(vec3 c) {
    vec3 c5 = floor(clamp(c, 0.0, 1.0) * 255.0 / 8.0);
    return (c5 * 8.0 + floor(c5 / 4.0)) / 255.0;
  }

  void main() {
    ivec2 outPx = ivec2(gl_FragCoord.xy);
    ivec2 base = outPx * ss;

    // Majority object among the supersamples.
    int counts[4];
    int ids[4];
    int nIds = 0;
    for (int sy = 0; sy < 4; sy++) for (int sx = 0; sx < 4; sx++) {
      if (sx >= ss || sy >= ss) continue;
      int id = idAt(base + ivec2(sx, sy));
      bool found = false;
      for (int k = 0; k < 4; k++) {
        if (k < nIds && ids[k] == id) { counts[k]++; found = true; }
      }
      if (!found && nIds < 4) { ids[nIds] = id; counts[nIds] = 1; nIds++; }
    }
    int id = ids[0];
    int bestCount = counts[0];
    for (int k = 1; k < 4; k++) {
      if (k < nIds && (counts[k] > bestCount || (counts[k] == bestCount && ids[k] > id))) { id = ids[k]; bestCount = counts[k]; }
    }

    vec3 c = vec3(0.0);
    float nC = 0.0;
    float nearest = 1e9;
    for (int sy = 0; sy < 4; sy++) for (int sx = 0; sx < 4; sx++) {
      if (sx >= ss || sy >= ss) continue;
      ivec2 p = base + ivec2(sx, sy);
      if (idAt(p) != id) continue;
      c += texelFetch(tColor, p, 0).rgb;
      nC += 1.0;
      nearest = min(nearest, linearDepth(p));
    }
    c /= max(nC, 1.0);

    if (id >= 1 && id < FIRST_FX_ID) {
      int slot = id - 1;
      bool outer = false;
      bool inner = false;
      if (outline) {
        ivec2 center = base + ivec2(ss / 2);
        ivec2 dirs[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));
        for (int k = 0; k < 4; k++) {
          ivec2 q = center + dirs[k] * ss;
          int nid = idAt(q);
          if (nid != id && !(nid >= FIRST_FX_ID)) outer = true;
          // Inner edges: a neighbor of the same object that is much farther away.
          if (innerOutline && nid == id && linearDepth(q) - nearest > innerThreshold * nearest) inner = true;
        }
      }
      if (paletteSnap || outer || inner) {
        int si = snapIndex(c, slot);
        vec3 sc = palettes[slot * 16 + si];
        if (outer) {
          bool lit = dot(sc, vec3(0.299, 0.587, 0.114)) > 0.62;
          int oi = (selective[slot] && lit) ? darkOf[slot * 16 + si] : outerIndex[slot];
          c = palettes[slot * 16 + oi];
        } else if (inner) {
          c = palettes[slot * 16 + innerIndex[slot]];
        } else {
          c = sc;
        }
      }
    }
    if (rgb555) c = toRgb555(c);
    gl_FragColor = vec4(c, 1.0);
  }
`;

interface IdMaterialEntry {
  mesh: THREE.Mesh;
  original: THREE.Material | THREE.Material[];
}

export class PixelPipeline {
  settings: PixelSettings;
  readonly outWidth: number;
  readonly outHeight: number;
  private colorRT!: THREE.WebGLRenderTarget;
  private idRT!: THREE.WebGLRenderTarget;
  private readonly quadScene = new THREE.Scene();
  private readonly quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly composite: THREE.ShaderMaterial;
  private readonly idMaterials = new Map<number, THREE.MeshBasicMaterial>();
  private readonly blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    settings: Partial<PixelSettings> = {},
  ) {
    this.settings = { ...DEFAULT_PIXEL_SETTINGS, ...settings };
    this.outWidth = 240 * this.settings.density;
    this.outHeight = 160 * this.settings.density;
    const palettes = Array.from({ length: MAX_PALETTES * 16 }, () => new THREE.Vector3());
    this.composite = new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: null },
        tId: { value: null },
        tDepth: { value: null },
        srcSize: { value: new THREE.Vector2() },
        ss: { value: 1 },
        outline: { value: true },
        innerOutline: { value: true },
        paletteSnap: { value: true },
        rgb555: { value: true },
        palettes: { value: palettes },
        paletteSize: { value: new Array(MAX_PALETTES).fill(0) },
        outerIndex: { value: new Array(MAX_PALETTES).fill(0) },
        innerIndex: { value: new Array(MAX_PALETTES).fill(0) },
        darkOf: { value: new Array(MAX_PALETTES * 16).fill(0) },
        selective: { value: new Array(MAX_PALETTES).fill(false) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 100 },
        innerThreshold: { value: 0.03 },
      },
      vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: compositeFrag,
      depthTest: false,
      depthWrite: false,
    });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    const quad = new THREE.Mesh(tri, this.composite);
    quad.frustumCulled = false;
    this.quadScene.add(quad);
    this.allocate();
  }

  private allocate(): void {
    const ss = this.settings.supersample;
    const w = this.outWidth * ss;
    const h = this.outHeight * ss;
    this.colorRT?.dispose();
    this.idRT?.dispose();
    const depthTexture = new THREE.DepthTexture(w, h);
    depthTexture.type = THREE.UnsignedIntType;
    this.colorRT = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthTexture,
      colorSpace: THREE.NoColorSpace,
    });
    this.idRT = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      colorSpace: THREE.NoColorSpace,
    });
    const u = this.composite.uniforms;
    u.tColor.value = this.colorRT.texture;
    u.tDepth.value = depthTexture;
    u.tId.value = this.idRT.texture;
    u.srcSize.value.set(w, h);
    u.ss.value = ss;
  }

  setSupersample(ss: number): void {
    this.settings.supersample = Math.max(1, Math.min(4, Math.round(ss)));
    this.allocate();
  }

  setPalette(slot: number, palette: PaletteSlot): void {
    const u = this.composite.uniforms;
    for (let i = 0; i < 16; i++) {
      const c = palette.colors[i] ?? [0, 0, 0];
      (u.palettes.value as THREE.Vector3[])[slot * 16 + i].set(c[0] / 255, c[1] / 255, c[2] / 255);
    }
    u.paletteSize.value[slot] = Math.min(16, palette.colors.length);
    u.outerIndex.value[slot] = palette.outerIndex;
    u.innerIndex.value[slot] = palette.innerIndex;
    u.selective.value[slot] = palette.selective ?? true;
    const dark = darkestInRamp(palette.colors, [0, palette.outerIndex, palette.innerIndex]);
    for (let i = 0; i < 16; i++) u.darkOf.value[slot * 16 + i] = dark[i] ?? i;
  }

  private idMaterial(id: number): THREE.MeshBasicMaterial {
    let m = this.idMaterials.get(id);
    if (!m) {
      m = new THREE.MeshBasicMaterial({ color: new THREE.Color(id / 255, 0, 0) });
      m.color.setRGB(id / 255, 0, 0, THREE.LinearSRGBColorSpace);
      this.idMaterials.set(id, m);
    }
    return m;
  }

  private maskRT: THREE.WebGLRenderTarget | null = null;

  /**
   * Render only object ids at an arbitrary resolution and read them back
   * (row 0 = top of the screen). Used by the sprite calibration tool.
   */
  renderIdMask(scene: THREE.Scene, camera: THREE.PerspectiveCamera, width: number, height: number): Uint8Array {
    if (!this.maskRT || this.maskRT.width !== width || this.maskRT.height !== height) {
      this.maskRT?.dispose();
      this.maskRT = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    }
    const saved = this.idRT;
    this.idRT = this.maskRT;
    this.renderIds(scene, camera);
    this.idRT = saved;
    const rgba = new Uint8Array(width * height * 4);
    this.renderer.readRenderTargetPixels(this.maskRT, 0, 0, width, height, rgba);
    const ids = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const src = (height - 1 - y) * width;
      for (let x = 0; x < width; x++) ids[y * width + x] = rgba[(src + x) * 4];
    }
    this.renderer.setRenderTarget(null);
    return ids;
  }

  private renderIds(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    const r = this.renderer;
    const swapped: IdMaterialEntry[] = [];
    const prevBackground = scene.background;
    scene.background = null;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Sprite).isSprite) return;
      let id = 0;
      for (let p: THREE.Object3D | null = o; p; p = p.parent) {
        if (p.userData.pixelId !== undefined) { id = p.userData.pixelId; break; }
      }
      swapped.push({ mesh, original: mesh.material });
      const orig = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const custom = o.userData.idMaterial as THREE.ShaderMaterial | undefined;
      if (custom) {
        // Objects with a cutout (effect billboards) provide their own id shader.
        if (custom.uniforms?.id) custom.uniforms.id.value = id;
        mesh.material = custom;
      } else if (orig && (orig as THREE.Material).transparent && id < MAX_PALETTES + 1) {
        // Translucent parts (e.g. flames) never claim Pokémon pixels.
        mesh.visible = false;
        (mesh.userData as { _wasVisible?: boolean })._wasVisible = true;
      } else {
        mesh.material = id === 0 ? this.blackMaterial : this.idMaterial(id);
      }
    });
    r.setRenderTarget(this.idRT);
    r.setClearColor(0x000000, 1);
    r.clear();
    r.render(scene, camera);
    for (const e of swapped) {
      e.mesh.material = e.original;
      if ((e.mesh.userData as { _wasVisible?: boolean })._wasVisible) {
        e.mesh.visible = true;
        delete (e.mesh.userData as { _wasVisible?: boolean })._wasVisible;
      }
    }
    scene.background = prevBackground;
  }

  /**
   * Render the scene through the pixel pipeline to the canvas.
   * Objects carry their id in userData.pixelId (inherited by descendants).
   */
  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    const r = this.renderer;
    const prevTarget = r.getRenderTarget();
    const prevClear = r.getClearColor(new THREE.Color());
    const prevAlpha = r.getClearAlpha();

    // 1. color
    r.setRenderTarget(this.colorRT);
    r.setClearColor(0x000000, 1);
    r.clear();
    r.render(scene, camera);

    // 2. ids
    this.renderIds(scene, camera);

    // 3. composite to the canvas
    const u = this.composite.uniforms;
    u.outline.value = this.settings.outline;
    u.innerOutline.value = this.settings.innerOutline;
    u.paletteSnap.value = this.settings.paletteSnap;
    u.rgb555.value = this.settings.rgb555;
    u.cameraNear.value = camera.near;
    u.cameraFar.value = camera.far;
    r.setRenderTarget(prevTarget);
    r.setClearColor(prevClear, prevAlpha);
    r.render(this.quadScene, this.quadCamera);
  }
}
