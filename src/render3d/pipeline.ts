// Viewport pixelation: the 3D scene (models, environment, move VFX) is
// rendered at GBA resolution and turned into sprite-like pixels in one
// composite pass. Nothing is baked into assets.
//
//   1. color pass  -> RT (internal resolution = 240x160 * density * supersample)
//   2. id pass     -> RT (which object owns each pixel; 0 = environment)
//   3. composite   -> canvas: per output pixel pick the majority object among
//      its supersamples, average that object's color, outline silhouettes with
//      the species' outline color, snap Pokémon pixels to their stock GBA
//      palette, apply palette blends (BlendPalette-style fades and glows)
//      and quantize everything to RGB555.

import * as THREE from 'three';
import type { RGB } from '../gba/bitmap';

export const MAX_PALETTES = 8;
/** Afterimages shown at once (Double Team's two clones, Agility's trail). */
export const MAX_ECHOES = 4;

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
  /**
   * Colors to output per index (default: `colors`). Shiny Pokémon in Gen 3
   * use the same sprite indices with another palette, so pixels are matched
   * against the regular palette and drawn with the shiny one.
   */
  display?: RGB[];
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
  uniform vec3 display[${MAX_PALETTES * 16}];
  uniform int paletteSize[${MAX_PALETTES}];
  uniform int outerIndex[${MAX_PALETTES}];
  uniform int innerIndex[${MAX_PALETTES}];
  uniform int darkOf[${MAX_PALETTES * 16}];
  uniform bool selective[${MAX_PALETTES}];
  // Per-slot palette blend: rgb target, a = coefficient (GBA BlendPalette / 16).
  uniform vec4 blend[${MAX_PALETTES}];
  // The arena's palette fades (a move's backdrop tint, the ball-open flash to white).
  uniform vec4 envTint;
  uniform vec4 envFlash;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform float innerThreshold;
  // Afterimages: copies of a Pokémon's pixels shown shifted (output pixels),
  // blended over what is behind them like a GBA sprite clone in blend mode.
  uniform int echoId[${MAX_ECHOES}];
  uniform ivec2 echoOffset[${MAX_ECHOES}];
  // x = the copy's weight (EVA / 16), y = what is behind it (EVB / 16).
  uniform vec2 echoAlpha[${MAX_ECHOES}];
  // The copy's palette blended toward rgb by a (Double Team darkens them).
  uniform vec4 echoLook[${MAX_ECHOES}];
  // The battle intro's entry layer: a 256x256 GBA background over the arena.
  uniform sampler2D tEntry;
  uniform bool entryOn;
  uniform ivec2 entryScroll;
  // x = the layer's weight (EVA / 16), y = the arena's behind it (EVB / 16).
  uniform vec2 entryAlpha;
  // Battle transitions over the whole screen (battle_transition.c): a palette
  // blend (rgb, a), WhiteBarsFade's 8 bars of 20 rows (lightened by BLDY/16
  // right of x), GridSquares' shrinking-box stage (0 = off) with the stage
  // each pixel of an 8x8 cell fills at, and Ripple's rows shifted up and down
  // (amplitude in pixels, the sine's running angle << 8).
  uniform vec4 fxBlend;
  uniform int barX[8];
  uniform float barY[8];
  uniform int gridStage;
  uniform int gridFill[64];
  uniform float rippleAmp;
  uniform int rippleSin;
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

  /** The object an output pixel shows: the majority id among its supersamples. */
  int majorityId(ivec2 outPx) {
    ivec2 base = outPx * ss;
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
    return id;
  }

  /** An output pixel's color as object \`id\`: averaged, outlined, palette-snapped and blended. */
  vec3 objectColor(ivec2 outPx, int id) {
    ivec2 base = outPx * ss;
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
          c = display[slot * 16 + oi];
        } else if (inner) {
          c = display[slot * 16 + innerIndex[slot]];
        } else {
          c = display[slot * 16 + si];
        }
      }
      // Blending the palette on the GBA recolors every pixel of the sprite,
      // outline included, so it applies after snapping.
      c = mix(c, blend[slot].rgb, blend[slot].a);
    } else if (id == 0) {
      c = mix(c, envTint.rgb, envTint.a);
      c = mix(c, envFlash.rgb, envFlash.a);
    }
    return c;
  }

  void main() {
    ivec2 outPx = ivec2(gl_FragCoord.xy);
    ivec2 outSize = srcSize / ss;
    int density = outSize.x / 240;
    // The GBA pixel this output pixel belongs to (row 0 at the top).
    ivec2 screen = ivec2(outPx.x / density, (outSize.y - 1 - outPx.y) / density);
    if (rippleAmp > 0.0) {
      // Ripple: BGxVOFS per row = Sin(((sin + y * 0x180) >> 8) & 0xFF, amplitude).
      int angle = ((rippleSin + screen.y * 384) >> 8) & 255;
      int shift = int(floor(rippleAmp * floor(256.0 * sin(float(angle) * 6.2831853 / 256.0) + 0.5) / 256.0));
      outPx.y = clamp(outPx.y - shift * density, 0, outSize.y - 1);
    }
    int id = majorityId(outPx);
    vec3 c = objectColor(outPx, id);

    // The entry layer covers the arena, behind the Pokémon and effects (BG1
    // under the sprites), wrapping like a GBA background as it scrolls.
    if (entryOn && id == 0) {
      vec4 e = texelFetch(tEntry, (screen + entryScroll) & 255, 0);
      if (e.a > 0.5) c = min(vec3(1.0), e.rgb * entryAlpha.x + c * entryAlpha.y);
    }

    // Afterimages go behind their Pokémon and effects, over everything else.
    for (int e = 0; e < ${MAX_ECHOES}; e++) {
      int eid = echoId[e];
      if (eid == 0 || id == eid || id >= FIRST_FX_ID) continue;
      ivec2 q = outPx - echoOffset[e];
      if (q.x < 0 || q.y < 0 || q.x >= outSize.x || q.y >= outSize.y || majorityId(q) != eid) continue;
      vec3 copy = mix(objectColor(q, eid), echoLook[e].rgb, echoLook[e].a);
      c = min(vec3(1.0), copy * echoAlpha[e].x + c * echoAlpha[e].y);
    }

    // Battle transitions, over everything.
    int bar = min(screen.y / 20, 7);
    if (screen.x >= barX[bar]) c += (1.0 - c) * barY[bar];
    if (gridStage > 0 && gridStage >= gridFill[(screen.y & 7) * 8 + (screen.x & 7)]) c = vec3(0.0);
    c = mix(c, fxBlend.rgb, fxBlend.a);
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
    const display = Array.from({ length: MAX_PALETTES * 16 }, () => new THREE.Vector3());
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
        display: { value: display },
        paletteSize: { value: new Array(MAX_PALETTES).fill(0) },
        outerIndex: { value: new Array(MAX_PALETTES).fill(0) },
        innerIndex: { value: new Array(MAX_PALETTES).fill(0) },
        darkOf: { value: new Array(MAX_PALETTES * 16).fill(0) },
        selective: { value: new Array(MAX_PALETTES).fill(false) },
        blend: { value: Array.from({ length: MAX_PALETTES }, () => new THREE.Vector4(0, 0, 0, 0)) },
        envTint: { value: new THREE.Vector4(0, 0, 0, 0) },
        envFlash: { value: new THREE.Vector4(1, 1, 1, 0) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 100 },
        innerThreshold: { value: 0.03 },
        echoId: { value: new Array(MAX_ECHOES).fill(0) },
        // ivec2 arrays go to WebGL as one flat list.
        echoOffset: { value: new Int32Array(MAX_ECHOES * 2) },
        echoAlpha: { value: Array.from({ length: MAX_ECHOES }, () => new THREE.Vector2()) },
        echoLook: { value: Array.from({ length: MAX_ECHOES }, () => new THREE.Vector4()) },
        tEntry: { value: null },
        entryOn: { value: false },
        // ivec2 goes to WebGL as a flat list.
        entryScroll: { value: new Int32Array(2) },
        entryAlpha: { value: new THREE.Vector2(1, 0) },
        fxBlend: { value: new THREE.Vector4(0, 0, 0, 0) },
        barX: { value: new Array(8).fill(240) },
        barY: { value: new Array(8).fill(0) },
        gridStage: { value: 0 },
        gridFill: { value: new Array(64).fill(99) },
        rippleAmp: { value: 0 },
        rippleSin: { value: 0 },
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
      const d = palette.display?.[i] ?? c;
      (u.palettes.value as THREE.Vector3[])[slot * 16 + i].set(c[0] / 255, c[1] / 255, c[2] / 255);
      (u.display.value as THREE.Vector3[])[slot * 16 + i].set(d[0] / 255, d[1] / 255, d[2] / 255);
    }
    u.paletteSize.value[slot] = Math.min(16, palette.colors.length);
    u.outerIndex.value[slot] = palette.outerIndex;
    u.innerIndex.value[slot] = palette.innerIndex;
    u.selective.value[slot] = palette.selective ?? true;
    const dark = darkestInRamp(palette.colors, [0, palette.outerIndex, palette.innerIndex]);
    for (let i = 0; i < 16; i++) u.darkOf.value[slot * 16 + i] = dark[i] ?? i;
  }

  /**
   * Blend a palette slot toward a color (amount 0..1, i.e. coefficient / 16),
   * like BlendPalette / BeginNormalPaletteFade on a sprite palette.
   */
  setBlend(slot: number, color: RGB, amount: number): void {
    (this.composite.uniforms.blend.value as THREE.Vector4[])[slot].set(color[0] / 255, color[1] / 255, color[2] / 255, Math.max(0, Math.min(1, amount)));
  }

  /**
   * Blend the arena (environment pixels) toward a color, amount 0..1: `tint`
   * for a move darkening or coloring the backdrop, `flash` for the fade to
   * white when a Poké Ball opens. The flash applies over the tint.
   */
  setEnvironmentBlend(kind: 'tint' | 'flash', color: RGB, amount: number): void {
    const u = this.composite.uniforms[kind === 'tint' ? 'envTint' : 'envFlash'];
    (u.value as THREE.Vector4).set(color[0] / 255, color[1] / 255, color[2] / 255, Math.max(0, Math.min(1, amount)));
  }

  /**
   * Show an afterimage of object `id` (a Pokémon's pixel id; 0 = none)
   * shifted by (dx, dy) GBA pixels (x right, y down), like a clone of its
   * sprite in blend mode: `eva` / `evb` weigh the copy and what is behind it
   * (BLDALPHA / 16), and `look` blends the copy's palette toward a color.
   */
  setEcho(index: number, id: number, dx = 0, dy = 0, eva = 12 / 16, evb = 8 / 16, look: { color: RGB; amount: number } = { color: [0, 0, 0], amount: 0 }): void {
    const u = this.composite.uniforms;
    const d = this.settings.density;
    u.echoId.value[index] = id;
    // Output rows count up from the bottom of the screen.
    (u.echoOffset.value as Int32Array).set([Math.round(dx) * d, -Math.round(dy) * d], index * 2);
    (u.echoAlpha.value as THREE.Vector2[])[index].set(eva, evb);
    (u.echoLook.value as THREE.Vector4[])[index].set(look.color[0] / 255, look.color[1] / 255, look.color[2] / 255, look.amount);
  }

  /**
   * The battle intro's entry layer (BG1 of battle_intro.c: tall grass, dunes,
   * waves, rocks...): a 256x256 GBA background with transparency, drawn over
   * the arena but behind Pokémon and effects, showing BG pixel (x + scrollX,
   * y + scrollY) at screen pixel (x, y), wrapping. `eva` / `evb` blend it with
   * the arena as BLDALPHA does (1 / 0: opaque). Null hides it.
   */
  setEntry(texture: THREE.Texture | null, scrollX = 0, scrollY = 0, eva = 1, evb = 0): void {
    const u = this.composite.uniforms;
    u.entryOn.value = !!texture;
    u.tEntry.value = texture;
    (u.entryScroll.value as Int32Array).set([Math.round(scrollX), Math.round(scrollY)]);
    (u.entryAlpha.value as THREE.Vector2).set(eva, evb);
  }

  /**
   * The whole-screen effects of Emerald's battle transitions
   * (src/battle/transition.ts), applied over everything; each field left out
   * is turned off. `blend`: BlendPalettes over every palette (amount 0..1).
   * `bars`: WhiteBarsFade's 8 bars of 20 rows, each lightened by `y` (BLDY
   * 0..1) right of `x`. `grid`: GridSquares' shrinking-box stage (1..14) and
   * the stage each pixel of an 8x8 cell fills at (64 values). `ripple`:
   * Ripple's rows shifted by up to `amp` pixels, the sine at `sin` (u16).
   */
  setTransition(t: {
    blend?: { color: RGB; amount: number };
    bars?: { x: number; y: number }[];
    grid?: { stage: number; fill: number[] };
    ripple?: { amp: number; sin: number };
  } | null): void {
    const u = this.composite.uniforms;
    const b = t?.blend;
    (u.fxBlend.value as THREE.Vector4).set((b?.color[0] ?? 0) / 255, (b?.color[1] ?? 0) / 255, (b?.color[2] ?? 0) / 255, b?.amount ?? 0);
    for (let i = 0; i < 8; i++) {
      u.barX.value[i] = t?.bars?.[i]?.x ?? 240;
      u.barY.value[i] = t?.bars?.[i]?.y ?? 0;
    }
    u.gridStage.value = t?.grid?.stage ?? 0;
    if (t?.grid) for (let i = 0; i < 64; i++) u.gridFill.value[i] = t.grid.fill[i];
    u.rippleAmp.value = t?.ripple?.amp ?? 0;
    u.rippleSin.value = (t?.ripple?.sin ?? 0) & 0xffff;
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
