// The title screen, played the way title_screen.c plays it: a fade in from
// white on the POKéMON logo, shines sweeping across it (the backdrop flashing
// with the second single one), the EMERALD VERSION banner fading in as it
// drops and the logo rising, then Rayquaza under drifting, waving clouds with
// its markings glowing, and PRESS START blinking. A or START goes on with a
// fade to white. On a computer the keys are shown where the copyright line was.

import { type Bitmap, type RGB, loadBitmap } from '../gba/bitmap';
import { asset } from '../gba/assets';
import { centerX, print } from './draw';
import type { MenuScreen } from './screen';

const WHITE: RGB = [255, 255, 255];

interface TitleGfx {
  rayquaza: Bitmap;
  marks: Bitmap;
  clouds: Bitmap;
  logo: Bitmap;
  shine: Bitmap;
  banner: Bitmap;
  pressStart: Bitmap;
}

let gfx: Promise<TitleGfx> | null = null;
function loadTitleGfx(): Promise<TitleGfx> {
  gfx ??= (async () => {
    const png = (n: string) => loadBitmap(asset(`gba/title/${n}.png`));
    const [rayquaza, marks, clouds, logo, shine, banner, pressStart] = await Promise.all(
      ['rayquaza', 'rayquaza_marks', 'clouds', 'logo', 'logo_shine', 'emerald_version', 'press_start'].map(png),
    );
    return { rayquaza, marks, clouds, logo, shine, banner, pressStart };
  })();
  gfx.catch(() => (gfx = null));
  return gfx;
}

/** GBA 5-bit channel to 8-bit. */
const c5 = (v: number) => (v << 3) | (v >> 2);

// Where title_screen.c places things.
const LOGO_X = 29;
const SHINE_Y = 68;
const SHINE_SPEED = 4;
// The banner is two 64x32 sprites centered at x 98 and 162: one 128x32 strip from x 66.
const BANNER_LEFT_X = 98, BANNER_Y = 2, BANNER_Y_GOAL = 66;
const START_X = 128, START_Y = 108;

type ShineMode = 'plain' | 'backdrop' | 'hidden';
interface Shine {
  x: number;
  speed: number;
  /** 'backdrop': brightens then darkens the backdrop with a green flash; 'hidden' does only that. */
  mode: ShineMode;
  level: number;
}

/**
 * Show the title screen until A or START; `hints` prints the keyboard keys
 * (on a computer). Resolves after the fade to white.
 */
export async function titleScreen(m: MenuScreen, opts: { hints: boolean }): Promise<void> {
  const g = await loadTitleGfx();
  let phase = 1;
  let counter = 256;
  let skip = false;
  let backdrop: RGB = [0, 0, 0];
  let bg2y = -32;
  let bannerY = BANNER_Y;
  let bannerBlend = 64; // index into gTitleScreenAlphaBlend
  let bg1y = 0, cloudStep = 0, wave = 0, frame = 0;
  let markColor: RGB = [255, 255, 96];
  const shines: Shine[] = [];
  const startShine = (mode: 'single-plain' | 'single' | 'double') => {
    if (mode === 'double') {
      shines.push({ x: 0, speed: SHINE_SPEED, mode: 'hidden', level: 0 });
      shines.push({ x: 0, speed: SHINE_SPEED * 2, mode: 'plain', level: 0 });
      shines.push({ x: -80, speed: SHINE_SPEED * 2, mode: 'plain', level: 0 });
    } else shines.push({ x: 0, speed: SHINE_SPEED, mode: mode === 'single' ? 'backdrop' : 'plain', level: 0 });
  };

  const draw = (fb: Bitmap) => {
    const d = fb.data;
    // Backdrop, then BG0 (Rayquaza) and BG1 (the clouds, blended 6/16 over 15/16).
    for (let i = 0; i < d.length; i += 4) {
      d[i] = backdrop[0];
      d[i + 1] = backdrop[1];
      d[i + 2] = backdrop[2];
      d[i + 3] = 255;
    }
    if (phase === 3) {
      const rq = g.rayquaza.data, mk = g.marks.data, cl = g.clouds.data;
      for (let y = 0; y < 160; y++) {
        const hofs = Math.trunc(4 * Math.sin((2 * Math.PI * (wave + y)) / 64));
        const cy = (y + bg1y) & 255;
        for (let x = 0; x < 240; x++) {
          const di = (y * 240 + x) * 4;
          const si = (y * 256 + x) * 4;
          if (rq[si + 3]) {
            const mark = mk[si + 3] > 0;
            d[di] = mark ? markColor[0] : rq[si];
            d[di + 1] = mark ? markColor[1] : rq[si + 1];
            d[di + 2] = mark ? markColor[2] : rq[si + 2];
          }
          const ci = (cy * 256 + ((x + hofs) & 255)) * 4;
          if (cl[ci + 3]) {
            d[di] = Math.min(255, (cl[ci] * 6 + d[di] * 15) >> 4);
            d[di + 1] = Math.min(255, (cl[ci + 1] * 6 + d[di + 1] * 15) >> 4);
            d[di + 2] = Math.min(255, (cl[ci + 2] * 6 + d[di + 2] * 15) >> 4);
          }
        }
      }
    }
    // BG2: the logo (affine, no wrap), lightened where a shine passes (BLDY 12).
    const lg = g.logo.data, sh = g.shine.data;
    const lit = phase === 1 ? shines.filter((s) => s.mode !== 'hidden') : [];
    for (let y = 0; y < 160; y++) {
      const ty = y + bg2y;
      if (ty < 0 || ty > 255) continue;
      for (let x = 0; x < 240; x++) {
        const tx = x - LOGO_X;
        if (tx < 0 || tx > 255) continue;
        const si = (ty * 256 + tx) * 4;
        if (!lg[si + 3]) continue;
        const di = (y * 240 + x) * 4;
        let r = lg[si], gg = lg[si + 1], b = lg[si + 2];
        for (const s of lit) {
          const u = x - (s.x - 32), v = y - (SHINE_Y - 32);
          if (u < 0 || v < 0 || u >= 64 || v >= 64 || !sh[(v * 64 + u) * 4 + 3]) continue;
          r += ((255 - r) * 12) >> 4;
          gg += ((255 - gg) * 12) >> 4;
          b += ((255 - b) * 12) >> 4;
          break;
        }
        d[di] = r;
        d[di + 1] = gg;
        d[di + 2] = b;
      }
    }
    // The banner (OBJ), blended in while it drops.
    if (phase >= 2) {
      // gTitleScreenAlphaBlend: (0, 16) down to index 32, then (15..0, 16), then (16, 15..0).
      const [eva, evb] = bannerBlend >= 32 ? [0, 16] : bannerBlend >= 16 ? [31 - bannerBlend, 16] : [16, bannerBlend];
      const bn = g.banner.data;
      const top = bannerY - 16;
      for (let v = 0; v < 32; v++) {
        const y = top + v;
        if (y < 0 || y >= 160) continue;
        for (let u = 0; u < 128; u++) {
          const x = BANNER_LEFT_X - 32 + u;
          const si = (v * 128 + u) * 4;
          if (!bn[si + 3] || x < 0 || x >= 240) continue;
          const di = (y * 240 + x) * 4;
          for (let k = 0; k < 3; k++) d[di + k] = Math.min(255, (bn[si + k] * eva + d[di + k] * evb) >> 4);
        }
      }
    }
    if (phase === 3) {
      // PRESS START: five 32x8 sprites around x = 128, shown every other 16 frames.
      if (frame & 16) {
        const ps = g.pressStart.data;
        const left = START_X - 64 - 16, top = START_Y - 4;
        for (let v = 0; v < 8; v++) {
          for (let u = 0; u < 160; u++) {
            const si = (v * 160 + u) * 4;
            if (!ps[si + 3]) continue;
            const di = ((top + v) * 240 + left + u) * 4;
            d[di] = ps[si];
            d[di + 1] = ps[si + 1];
            d[di + 2] = ps[si + 2];
          }
        }
      }
      if (opts.hints) {
        const keys = '{A_BUTTON}Z  {B_BUTTON}X  {START_BUTTON}S  {SELECT_BUTTON}SHIFT';
        print(fb, m.g, keys, centerX(m.g, keys, 'narrow', 240), 140, { font: 'narrow', fg: 1, shadow: 2 });
      }
    }
  };

  const remove = m.show(draw);
  m.fadeColor = WHITE;
  m.fadeAmount = 16;
  const fadeIn = m.fadeTo(0, WHITE).then(() => startShine('single-plain'));
  try {
    await m.clock.until(() => {
      frame++;
      const any = m.pressed('A', 'B', 'START', 'SELECT');
      // Shines move and, in their modes, set the backdrop.
      for (let i = shines.length - 1; i >= 0; i--) {
        const s = shines[i];
        if (s.x >= 240 + 32) {
          if (s.mode !== 'plain') backdrop = [0, 0, 0];
          shines.splice(i, 1);
          continue;
        }
        if (s.mode !== 'plain') {
          s.level = s.x < 120 ? Math.min(31, s.level + 2) : Math.max(0, s.level - 2);
          const flash = [3, 4, 5, 6].some((k) => s.x === 120 + k * SHINE_SPEED);
          backdrop = flash ? [c5(24), c5(31), c5(12)] : [c5(s.level), c5(s.level), c5(s.level)];
        }
        s.x += s.speed;
      }
      if (phase === 1) {
        if (any || skip) {
          skip = true;
          counter = 0;
        }
        if (counter) {
          if (counter === 176) startShine('double');
          else if (counter === 64) startShine('single');
          counter--;
        } else {
          phase = 2;
          counter = 144;
          shines.length = 0;
          backdrop = [0, 0, 0];
        }
      } else if (phase === 2) {
        if (any || skip) {
          skip = true;
          counter = 0;
        }
        if (skip) {
          bannerY = BANNER_Y_GOAL;
          bannerBlend = 0;
        } else {
          if (bannerY !== BANNER_Y_GOAL) bannerY++;
          if (bannerBlend) bannerBlend--;
        }
        if (counter) counter--;
        else {
          phase = 3;
          bg2y = 0;
          counter = 0;
          bannerY = BANNER_Y_GOAL;
          bannerBlend = 0;
          return false;
        }
        if (!(counter & 1) && bg2y !== 0) bg2y++;
      } else {
        if (m.pressed('A', 'START')) return true;
        // The clouds drift up a pixel every four frames (BG1VOFS = tBg1Y / 2) and wave (a scanline sine on BG1HOFS).
        if (++counter & 1) cloudStep++;
        bg1y = (cloudStep >> 1) & 255;
        wave = (wave + 1) % 64;
        if (counter % 4 === 0) {
          // UpdateLegendaryMarkingColor: the markings pulse from yellow to dark teal.
          const intensity = Math.round(Math.cos(((counter & 255) / 256) * Math.PI * 2) * 128) + 128;
          markColor = [c5(31 - Math.trunc((intensity * 31) / 256)), c5(31 - Math.trunc((intensity * 22) / 256)), c5(12)];
        }
      }
      return false;
    });
    await fadeIn;
    await m.fadeTo(16, WHITE);
  } finally {
    remove();
  }
}
