// The GBA's picture processor: one scanline at a time, from the registers,
// VRAM, OAM and palettes as they are when the line is drawn (so HBlank DMA
// and HBlank interrupts change the next line, as on the hardware).
//
// Background modes 0-5 (text and affine backgrounds, bitmaps), regular and
// affine sprites (double size, mosaic, 1D/2D tile mapping, semi-transparent
// and window sprites), windows 0/1 and the sprite window, blending (alpha,
// brighten, darken) and mosaic.

#include "gba.h"
#include "remake_state.h"

u32 gPlatformFrame[SCREEN_W * SCREEN_H];

// Affine backgrounds' internal reference points (BG2, BG3), 20.8 fixed point:
// reloaded from BGxX/BGxY at VBlank and when written, moved by PB/PD each line.
static s32 sRefX[2], sRefY[2];

#define TRANSPARENT 0x8000u

static u16 sBg[4][SCREEN_W];
static u16 sObj[SCREEN_W];
static u8 sObjPrio[SCREEN_W];
static u8 sObjSemi[SCREEN_W];
static u8 sObjWin[SCREEN_W];

// The remake layer's pictures (platform/include/remake_state.h), filled by
// the browser at the start of each frame.
#define LAYER_OPAQUE REMAKE_OPAQUE
#define REMAKE_SPRITES REMAKE_LAYER_SPRITES

static struct RemakeLayers sRemake;

EXPORT(PlatformRemakeLayers) struct RemakeLayers *PlatformRemakeLayers(void)
{
    return &sRemake;
}

static s32 SignExtend28(u32 v)
{
    return (s32)(v << 4) >> 4;
}

static void ReloadRef(int i)
{
    u32 base = i == 0 ? R_BG2X : R_BG3X;
    sRefX[i] = SignExtend28(IO32(base));
    sRefY[i] = SignExtend28(IO32(base + 4));
}

void PlatformPpuReset(void)
{
    ReloadRef(0);
    ReloadRef(1);
    // Nothing drawn yet: the forced blank's white.
    for (u32 i = 0; i < SCREEN_W * SCREEN_H; i++)
        gPlatformFrame[i] = 0xFFFFFFFFu;
}

void PlatformPpuVBlank(void)
{
    ReloadRef(0);
    ReloadRef(1);
}

void PlatformPpuRegWrite(u32 off)
{
    ReloadRef(off >= R_BG3X ? 1 : 0);
}

static inline u16 BgPal(u32 index)
{
    return PLTT[index] & 0x7FFF;
}

static inline u16 ObjPal(u32 index)
{
    return PLTT[256 + index] & 0x7FFF;
}

static void Clear(u16 *line)
{
    for (int x = 0; x < SCREEN_W; x++)
        line[x] = TRANSPARENT;
}

// ---------------------------------------------------------------- backgrounds

static void TextBg(int bg, u32 line)
{
    u16 *out = sBg[bg];
    u16 cnt = IO16(R_BG0CNT + bg * 2);
    u32 charBase = ((cnt >> 2) & 3) * 0x4000;
    u32 screenBase = ((cnt >> 8) & 0x1F) * 0x800;
    int bpp8 = cnt & 0x80;
    u32 width = (cnt & 0x4000) ? 512 : 256;
    u32 height = (cnt & 0x8000) ? 512 : 256;
    u32 hofs = IO16(R_BG0HOFS + bg * 4) & 0x1FF;
    u32 vofs = IO16(R_BG0VOFS + bg * 4) & 0x1FF;
    u16 mosaic = IO16(R_MOSAIC);
    u32 mosH = (cnt & 0x40) ? (mosaic & 0xF) + 1 : 1;
    u32 mosV = (cnt & 0x40) ? ((mosaic >> 4) & 0xF) + 1 : 1;
    u32 sy = ((line - line % mosV) + vofs) & (height - 1);
    u32 rowBlock = (sy >> 8) * (width == 512 ? 2 : 1);
    for (u32 x = 0; x < SCREEN_W; x++) {
        u32 sx = ((x - x % mosH) + hofs) & (width - 1);
        u32 block = rowBlock + (sx >> 8);
        u32 mapAddr = screenBase + block * 0x800 + ((sy & 255) >> 3) * 64 + ((sx & 255) >> 3) * 2;
        u16 entry = *(volatile u16 *)(uintptr_t)(VRAM_BASE + (mapAddr & 0xFFFF));
        u32 tile = entry & 0x3FF;
        u32 px = sx & 7, py = sy & 7;
        if (entry & 0x400) px = 7 - px;
        if (entry & 0x800) py = 7 - py;
        u32 idx;
        if (bpp8) {
            u32 addr = charBase + tile * 64 + py * 8 + px;
            if (addr >= 0x10000) { out[x] = TRANSPARENT; continue; }
            idx = VRAM[addr];
            out[x] = idx ? BgPal(idx) : TRANSPARENT;
        } else {
            u32 addr = charBase + tile * 32 + py * 4 + (px >> 1);
            if (addr >= 0x10000) { out[x] = TRANSPARENT; continue; }
            u8 b = VRAM[addr];
            idx = (px & 1) ? b >> 4 : b & 0xF;
            out[x] = idx ? BgPal((entry >> 12) * 16 + idx) : TRANSPARENT;
        }
    }
}

static void AffineBg(int bg, u32 line, int mode)
{
    (void)line;
    u16 *out = sBg[bg];
    int i = bg - 2;
    u16 cnt = IO16(R_BG0CNT + bg * 2);
    u32 base = i == 0 ? R_BG2PA : R_BG3PA;
    s32 pa = (s16)IO16(base), pc = (s16)IO16(base + 4);
    s32 x0 = sRefX[i], y0 = sRefY[i];
    u16 mosaic = IO16(R_MOSAIC);
    u32 mosH = (cnt & 0x40) ? (mosaic & 0xF) + 1 : 1;
    if (mode >= 3) {
        // Bitmaps (BG2 only): 240x160 direct color, 240x160 paletted (two
        // pages), 160x128 direct color (two pages).
        u32 page = (IO16(R_DISPCNT) & 0x10) ? 0xA000 : 0;
        s32 w = mode == 5 ? 160 : 240, h = mode == 5 ? 128 : 160;
        for (u32 x = 0; x < SCREEN_W; x++) {
            u32 mx = x - x % mosH;
            s32 tx = (x0 + pa * (s32)mx) >> 8, ty = (y0 + pc * (s32)mx) >> 8;
            if (tx < 0 || ty < 0 || tx >= w || ty >= h) { out[x] = TRANSPARENT; continue; }
            if (mode == 4) {
                u8 idx = VRAM[page + ty * 240 + tx];
                out[x] = idx ? BgPal(idx) : TRANSPARENT;
            } else {
                u32 addr = (mode == 5 ? page : 0) + (ty * w + tx) * 2;
                out[x] = *(volatile u16 *)(uintptr_t)(VRAM_BASE + addr) & 0x7FFF;
            }
        }
        return;
    }
    u32 charBase = ((cnt >> 2) & 3) * 0x4000;
    u32 screenBase = ((cnt >> 8) & 0x1F) * 0x800;
    s32 size = 128 << (cnt >> 14);
    int wrap = cnt & 0x2000;
    for (u32 x = 0; x < SCREEN_W; x++) {
        u32 mx = x - x % mosH;
        s32 tx = (x0 + pa * (s32)mx) >> 8, ty = (y0 + pc * (s32)mx) >> 8;
        if (wrap) {
            tx &= size - 1;
            ty &= size - 1;
        } else if (tx < 0 || ty < 0 || tx >= size || ty >= size) {
            out[x] = TRANSPARENT;
            continue;
        }
        u8 tile = VRAM[(screenBase + (ty >> 3) * (size >> 3) + (tx >> 3)) & 0xFFFF];
        u32 addr = charBase + tile * 64 + (ty & 7) * 8 + (tx & 7);
        u8 idx = addr < 0x10000 ? VRAM[addr] : 0;
        out[x] = idx ? BgPal(idx) : TRANSPARENT;
    }
}

// ---------------------------------------------------------------- sprites

static const u8 sObjSize[3][4][2] = {
    { { 8, 8 }, { 16, 16 }, { 32, 32 }, { 64, 64 } },
    { { 16, 8 }, { 32, 8 }, { 32, 16 }, { 64, 32 } },
    { { 8, 16 }, { 8, 32 }, { 16, 32 }, { 32, 64 } },
};

static void Sprites(u32 line, int bitmapMode)
{
    u16 dispcnt = IO16(R_DISPCNT);
    int map1D = dispcnt & 0x40;
    u16 mosaic = IO16(R_MOSAIC);
    u32 mosH = ((mosaic >> 8) & 0xF) + 1, mosV = ((mosaic >> 12) & 0xF) + 1;
    for (int x = 0; x < SCREEN_W; x++) {
        sObj[x] = TRANSPARENT;
        sObjPrio[x] = 4;
        sObjSemi[x] = 0;
        sObjWin[x] = 0;
    }
    if (!(dispcnt & 0x1000))
        return;
    u8 drawn[REMAKE_SPRITES][2] = { { 0 } };  // the picture, and its window copy
    for (int i = 0; i < 128; i++) {
        u16 a0 = OAM[i * 4], a1 = OAM[i * 4 + 1], a2 = OAM[i * 4 + 2];
        int affine = a0 & 0x100;
        if (!affine && (a0 & 0x200))
            continue;
        // The remake layer's picture of a sprite stands in for its OAM entries,
        // where the entry is in the OAM order, with its priority and mode (a
        // window sprite gives the window its shape) and mosaic. The picture
        // is not clipped to the sprite's box (a model can reach beyond it).
        u32 rtile = a2 & 0x3FF, rprio = (a2 >> 10) & 3;
        int rmode = (a0 >> 10) & 3, rmosaic = a0 & 0x1000;
        struct RemakeSprite *remake = 0;
        for (int r = 0; r < REMAKE_SPRITES; r++)
            if (sRemake.sprites[r].active && sRemake.sprites[r].tileNum == rtile)
                remake = &sRemake.sprites[r];
        if (remake) {
            u8 *done = &drawn[remake - sRemake.sprites][rmode == 2];
            if (*done)
                continue;
            *done = 1;
            u32 row = rmosaic ? line - line % mosV : line;
            const u16 *src = &remake->pixels[row * SCREEN_W];
            // Color indices take the entry's palette, as its tiles would.
            int indexed = remake->format == REMAKE_FORMAT_INDEX;
            u32 rbase = (a0 & 0x2000) ? 0 : (a2 >> 12) * 16, rmask = (a0 & 0x2000) ? 0xFF : 0xF;
            for (s32 sx = 0; sx < SCREEN_W; sx++) {
                u16 c = src[rmosaic ? sx - sx % (s32)mosH : sx];
                if (!(c & LAYER_OPAQUE) || (indexed && !(c & rmask)))
                    continue;
                if (rmode == 2) {
                    sObjWin[sx] = 1;
                } else if (rprio < sObjPrio[sx]) {
                    sObj[sx] = indexed ? ObjPal(rbase + (c & rmask)) : c & 0x7FFF;
                    sObjPrio[sx] = (u8)rprio;
                    sObjSemi[sx] = rmode == 1;
                }
            }
            continue;
        }
        int mode = (a0 >> 10) & 3;
        int shape = a0 >> 14;
        if (mode == 3 || shape == 3)
            continue;
        s32 w = sObjSize[shape][a1 >> 14][0], h = sObjSize[shape][a1 >> 14][1];
        int dbl = affine && (a0 & 0x200);
        s32 bw = dbl ? w * 2 : w, bh = dbl ? h * 2 : h;
        s32 dy = (s32)((line - (a0 & 0xFF)) & 0xFF);
        if (dy >= bh)
            continue;
        s32 x = a1 & 0x1FF;
        if (x >= 240)
            x -= 512;
        int objMosaic = a0 & 0x1000;
        if (objMosaic) {
            // Mosaic samples the first line and column of each block on screen.
            dy -= (s32)(line % mosV);
            if (dy < 0)
                dy = 0;
        }
        int bpp8 = a0 & 0x2000;
        u32 tile = a2 & 0x3FF;
        if (bitmapMode && tile < 512)
            continue;
        u32 prio = (a2 >> 10) & 3;
        u32 pal = a2 >> 12;

        s32 pa = 0x100, pb = 0, pc = 0, pd = 0x100;
        if (affine) {
            u32 m = (a1 >> 9) & 31;
            pa = (s16)OAM[m * 16 + 3];
            pb = (s16)OAM[m * 16 + 7];
            pc = (s16)OAM[m * 16 + 11];
            pd = (s16)OAM[m * 16 + 15];
        }
        for (s32 px = 0; px < bw; px++) {
            s32 sx = x + px;
            if (sx < 0 || sx >= SCREEN_W)
                continue;
            s32 mpx = px;
            if (objMosaic) {
                mpx -= sx % (s32)mosH;
                if (mpx < 0)
                    mpx = 0;
            }
            s32 tx, ty;
            if (affine) {
                s32 cx = mpx - bw / 2, cy = dy - bh / 2;
                tx = ((pa * cx + pb * cy) >> 8) + w / 2;
                ty = ((pc * cx + pd * cy) >> 8) + h / 2;
                if (tx < 0 || ty < 0 || tx >= w || ty >= h)
                    continue;
            } else {
                tx = (a1 & 0x1000) ? w - 1 - mpx : mpx;
                ty = (a1 & 0x2000) ? h - 1 - dy : dy;
            }
            u32 tileX = tx >> 3, tileY = ty >> 3;
            u32 t;
            if (map1D)
                t = tile + (tileY * (w >> 3) + tileX) * (bpp8 ? 2 : 1);
            else
                t = tile + tileY * 32 + tileX * (bpp8 ? 2 : 1);
            t &= 0x3FF;
            u32 color;
            if (bpp8) {
                u8 idx = VRAM[0x10000 + t * 32 + (ty & 7) * 8 + (tx & 7)];
                if (!idx)
                    continue;
                color = ObjPal(idx);
            } else {
                u8 b = VRAM[0x10000 + t * 32 + (ty & 7) * 4 + ((tx & 7) >> 1)];
                u8 idx = (tx & 1) ? b >> 4 : b & 0xF;
                if (!idx)
                    continue;
                color = ObjPal(pal * 16 + idx);
            }
            if (mode == 2) {
                sObjWin[sx] = 1;
            } else if (prio < sObjPrio[sx]) {
                sObj[sx] = (u16)color;
                sObjPrio[sx] = (u8)prio;
                sObjSemi[sx] = mode == 1;
            }
        }
    }
}

// ---------------------------------------------------------------- composing

static int InRange(u32 v, u32 lo, u32 hi, u32 limit)
{
    if (hi > limit || lo > hi) {
        if (hi > limit && lo <= limit) hi = limit;
        if (lo > hi)
            return v >= lo || v < hi;
    }
    return v >= lo && v < hi;
}

static inline u32 Blend(u16 a, u16 b, u32 eva, u32 evb)
{
    u32 r = ((a & 31) * eva + (b & 31) * evb) >> 4;
    u32 g = (((a >> 5) & 31) * eva + ((b >> 5) & 31) * evb) >> 4;
    u32 bl = (((a >> 10) & 31) * eva + ((b >> 10) & 31) * evb) >> 4;
    if (r > 31) r = 31;
    if (g > 31) g = 31;
    if (bl > 31) bl = 31;
    return r | (g << 5) | (bl << 10);
}

static inline u32 Brighten(u16 c, u32 evy)
{
    u32 r = c & 31, g = (c >> 5) & 31, b = (c >> 10) & 31;
    r += ((31 - r) * evy) >> 4;
    g += ((31 - g) * evy) >> 4;
    b += ((31 - b) * evy) >> 4;
    return r | (g << 5) | (b << 10);
}

static inline u32 Darken(u16 c, u32 evy)
{
    u32 r = c & 31, g = (c >> 5) & 31, b = (c >> 10) & 31;
    r -= (r * evy) >> 4;
    g -= (g * evy) >> 4;
    b -= (b * evy) >> 4;
    return r | (g << 5) | (b << 10);
}

static inline u32 ToRgba(u32 c)
{
    u32 r = c & 31, g = (c >> 5) & 31, b = (c >> 10) & 31;
    r = (r << 3) | (r >> 2);
    g = (g << 3) | (g >> 2);
    b = (b << 3) | (b >> 2);
    return 0xFF000000u | (b << 16) | (g << 8) | r;
}

void PlatformPpuLine(u32 line)
{
    u32 *dst = &gPlatformFrame[line * SCREEN_W];
    u16 dispcnt = IO16(R_DISPCNT);
    if (dispcnt & 0x80) {
        // Forced blank: white.
        for (int x = 0; x < SCREEN_W; x++)
            dst[x] = 0xFFFFFFFFu;
        goto step;
    }
    {
        int mode = dispcnt & 7;
        int bgOn[4] = { 0 };
        for (int bg = 0; bg < 4; bg++) {
            int valid = mode == 0 || (mode == 1 && bg < 3) || (mode == 2 && bg >= 2) || (mode >= 3 && bg == 2);
            bgOn[bg] = valid && (dispcnt & (0x100 << bg));
            if (!bgOn[bg])
                continue;
            if (sRemake.background.active && sRemake.background.bg == (u32)bg) {
                const u16 *src = &sRemake.background.pixels[line * SCREEN_W];
                for (int x = 0; x < SCREEN_W; x++)
                    sBg[bg][x] = (src[x] & LAYER_OPAQUE) ? (src[x] & 0x7FFF) : TRANSPARENT;
                continue;
            }
            if (mode == 0 || (mode == 1 && bg < 2))
                TextBg(bg, line);
            else
                AffineBg(bg, line, mode);
        }
        Sprites(line, mode >= 3);

        u16 bldcnt = IO16(R_BLDCNT);
        u16 bldalpha = IO16(R_BLDALPHA);
        u32 eva = bldalpha & 0x1F, evb = (bldalpha >> 8) & 0x1F, evy = IO16(R_BLDY) & 0x1F;
        if (eva > 16) eva = 16;
        if (evb > 16) evb = 16;
        if (evy > 16) evy = 16;
        int effect = (bldcnt >> 6) & 3;
        u16 backdrop = BgPal(0);

        int windows = dispcnt & 0xE000;
        u16 winin = IO16(R_WININ), winout = IO16(R_WINOUT);
        int in0 = 0, in1 = 0;
        if (dispcnt & 0x2000) {
            u16 v = IO16(R_WIN0V);
            in0 = InRange(line, v >> 8, v & 0xFF, 160);
        }
        if (dispcnt & 0x4000) {
            u16 v = IO16(R_WIN1V);
            in1 = InRange(line, v >> 8, v & 0xFF, 160);
        }
        u16 w0h = IO16(R_WIN0H), w1h = IO16(R_WIN1H);

        // Background order: by priority, then by number.
        int order[4], n = 0;
        for (int p = 0; p < 4; p++)
            for (int bg = 0; bg < 4; bg++)
                if (bgOn[bg] && (IO16(R_BG0CNT + bg * 2) & 3) == p)
                    order[n++] = bg;

        for (u32 x = 0; x < SCREEN_W; x++) {
            u32 enable = 0x3F;
            if (windows) {
                if (in0 && InRange(x, w0h >> 8, w0h & 0xFF, 240))
                    enable = winin & 0x3F;
                else if (in1 && InRange(x, w1h >> 8, w1h & 0xFF, 240))
                    enable = (winin >> 8) & 0x3F;
                else if ((dispcnt & 0x8000) && sObjWin[x])
                    enable = (winout >> 8) & 0x3F;
                else
                    enable = winout & 0x3F;
            }
            // The top two layers: (color, layer) with layer 0-3 BG, 4 OBJ, 5 backdrop.
            u16 c1 = backdrop, c2 = backdrop;
            int l1 = 5, l2 = 5;
            int found = 0;
            int objHere = (enable & 0x10) && !(sObj[x] & TRANSPARENT);
            u32 objPrio = objHere ? sObjPrio[x] : 4;
            int oi = 0;
            for (int p = 0; p <= 4 && found < 2; p++) {
                if (objHere && objPrio == (u32)p) {
                    if (found == 0) { c1 = sObj[x]; l1 = 4; } else { c2 = sObj[x]; l2 = 4; }
                    found++;
                }
                for (; oi < n && found < 2; oi++) {
                    int bg = order[oi];
                    if ((IO16(R_BG0CNT + bg * 2) & 3) != p)
                        break;
                    if (!(enable & (1 << bg)) || (sBg[bg][x] & TRANSPARENT))
                        continue;
                    if (found == 0) { c1 = sBg[bg][x]; l1 = bg; } else { c2 = sBg[bg][x]; l2 = bg; }
                    found++;
                }
            }
            u32 out = c1;
            if (enable & 0x20) {
                int top1 = (bldcnt >> l1) & 1;
                int bottom2 = (bldcnt >> (8 + l2)) & 1;
                if (l1 == 4 && sObjSemi[x] && bottom2)
                    out = Blend(c1, c2, eva, evb);
                else if (top1 && effect == 1 && bottom2)
                    out = Blend(c1, c2, eva, evb);
                else if (top1 && effect == 2)
                    out = Brighten(c1, evy);
                else if (top1 && effect == 3)
                    out = Darken(c1, evy);
            }
            dst[x] = ToRgba(out);
        }
    }
step:
    // The affine backgrounds' reference points move on after each drawn line.
    sRefX[0] += (s16)IO16(R_BG2PB);
    sRefY[0] += (s16)IO16(R_BG2PD);
    sRefX[1] += (s16)IO16(R_BG3PB);
    sRefY[1] += (s16)IO16(R_BG3PD);
}
