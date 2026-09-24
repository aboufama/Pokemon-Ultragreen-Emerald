// Tiny software framebuffer used for everything that is 2D GBA art.
// Working on raw RGBA pixels keeps output byte-identical to the hardware
// (no canvas smoothing, no color management surprises).

export type RGB = readonly [number, number, number];

export interface Bitmap {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function createBitmap(width: number, height: number): Bitmap {
  return { width, height, data: new Uint8ClampedArray(width * height * 4) };
}

const bitmapCache = new Map<string, Promise<Bitmap>>();

export function loadBitmap(url: string): Promise<Bitmap> {
  let p = bitmapCache.get(url);
  if (!p) {
    p = (async () => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' })!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: 'srgb' });
      return { width: canvas.width, height: canvas.height, data };
    })();
    bitmapCache.set(url, p);
  }
  return p;
}

export function clear(dst: Bitmap, rgba: readonly [number, number, number, number] = [0, 0, 0, 0]): void {
  const d = dst.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = rgba[0];
    d[i + 1] = rgba[1];
    d[i + 2] = rgba[2];
    d[i + 3] = rgba[3];
  }
}

export function fillRect(dst: Bitmap, x: number, y: number, w: number, h: number, rgb: RGB, alpha = 255): void {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(dst.width, x + w), y1 = Math.min(dst.height, y + h);
  const d = dst.data;
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * dst.width + xx) * 4;
      d[i] = rgb[0];
      d[i + 1] = rgb[1];
      d[i + 2] = rgb[2];
      d[i + 3] = alpha;
    }
  }
}

export function setPixel(dst: Bitmap, x: number, y: number, rgb: RGB): void {
  if (x < 0 || y < 0 || x >= dst.width || y >= dst.height) return;
  const i = (y * dst.width + x) * 4;
  dst.data[i] = rgb[0];
  dst.data[i + 1] = rgb[1];
  dst.data[i + 2] = rgb[2];
  dst.data[i + 3] = 255;
}

export interface BlitOptions {
  hflip?: boolean;
  vflip?: boolean;
  /** Replace every opaque source pixel with this color (used for flashes/silhouettes). */
  tint?: RGB;
  /** 0..16 GBA-style blend toward `tint` (16 = solid tint). */
  tintAmount?: number;
}

/** Copy a rectangle, skipping transparent source pixels (GBA color 0). */
export function blit(
  dst: Bitmap,
  src: Bitmap,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  opts: BlitOptions = {},
): void {
  const d = dst.data;
  const s = src.data;
  const tintAmt = opts.tint ? (opts.tintAmount ?? 16) : 0;
  for (let y = 0; y < sh; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dst.height) continue;
    const srcY = sy + (opts.vflip ? sh - 1 - y : y);
    if (srcY < 0 || srcY >= src.height) continue;
    for (let x = 0; x < sw; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dst.width) continue;
      const srcX = sx + (opts.hflip ? sw - 1 - x : x);
      if (srcX < 0 || srcX >= src.width) continue;
      const si = (srcY * src.width + srcX) * 4;
      if (s[si + 3] === 0) continue;
      const di = (ty * dst.width + tx) * 4;
      let r = s[si], g = s[si + 1], b = s[si + 2];
      if (tintAmt) {
        const t = opts.tint!;
        r = r + (((t[0] - r) * tintAmt) >> 4);
        g = g + (((t[1] - g) * tintAmt) >> 4);
        b = b + (((t[2] - b) * tintAmt) >> 4);
      }
      d[di] = r;
      d[di + 1] = g;
      d[di + 2] = b;
      d[di + 3] = 255;
    }
  }
}

export function drawBitmap(dst: Bitmap, src: Bitmap, dx: number, dy: number, opts?: BlitOptions): void {
  blit(dst, src, 0, 0, src.width, src.height, dx, dy, opts);
}

/** Present a bitmap on a canvas 1:1 (the canvas is scaled up with CSS). */
export function present(ctx: CanvasRenderingContext2D, bmp: Bitmap, imageData?: ImageData): ImageData {
  const img = imageData ?? ctx.createImageData(bmp.width, bmp.height, { colorSpace: 'srgb' });
  img.data.set(bmp.data);
  ctx.putImageData(img, 0, 0);
  return img;
}
