// The GBA "screen": a WebGL canvas for the 3D battle (rendered through the
// pixel pipeline) with the 2D GBA layer (healthboxes, text box) on top.
// Both are 240x160 internally, scaled so every GBA pixel covers whole device
// pixels, or (`fill`) as large as the box allows, like an emulator on a phone.

import { type Bitmap, createBitmap } from '../gba/bitmap';

export class GbaScreen {
  readonly element: HTMLDivElement;
  readonly canvas3d: HTMLCanvasElement;
  readonly canvas2d: HTMLCanvasElement;
  readonly ui: Bitmap = createBitmap(240, 160);
  private readonly ctx2d: CanvasRenderingContext2D;
  private readonly imageData: ImageData;
  scale = 1;

  constructor(parent: HTMLElement, fixedScale?: number, fill = false) {
    this.element = document.createElement('div');
    this.element.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);';
    this.canvas3d = document.createElement('canvas');
    this.canvas2d = document.createElement('canvas');
    this.canvas2d.width = 240;
    this.canvas2d.height = 160;
    for (const c of [this.canvas3d, this.canvas2d]) {
      c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;';
      this.element.appendChild(c);
    }
    parent.appendChild(this.element);
    this.ctx2d = this.canvas2d.getContext('2d')!;
    this.imageData = this.ctx2d.createImageData(240, 160);
    const resize = () => {
      // Largest scale where every GBA pixel covers a whole number of device
      // pixels (integer CSS scales on desktop, e.g. 4/3 on a 3x phone).
      const dpr = window.devicePixelRatio || 1;
      const fit = Math.min(parent.clientWidth / 240, parent.clientHeight / 160);
      if (!(fit > 0)) return;
      const s = fixedScale ?? (fill ? fit : Math.max(1 / dpr, Math.floor(fit * dpr) / dpr));
      this.scale = s;
      this.element.style.width = `${240 * s}px`;
      this.element.style.height = `${160 * s}px`;
    };
    resize();
    // The box can change without the window resizing (on-screen buttons shown, rotation).
    const observer = fixedScale === undefined && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(parent);
    if (fixedScale === undefined) addEventListener('resize', resize);
    this.dispose = () => {
      observer?.disconnect();
      removeEventListener('resize', resize);
      this.element.remove();
    };
  }

  /** Remove the screen from the page. */
  readonly dispose: () => void;

  presentUi(): void {
    this.imageData.data.set(this.ui.data);
    this.ctx2d.putImageData(this.imageData, 0, 0);
  }
}
