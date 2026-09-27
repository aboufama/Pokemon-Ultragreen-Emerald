// The GBA BIOS functions the game calls (libagbsyscall's SWIs), in C.

#include "gba.h"
#include "platform.h"

// The BIOS's sine table: sin(2*pi*i/256) in 1.14 fixed point.
static const s16 sSine[256] = {
    0, 402, 804, 1205, 1606, 2006, 2404, 2801,
    3196, 3590, 3981, 4370, 4756, 5139, 5520, 5897,
    6270, 6639, 7005, 7366, 7723, 8076, 8423, 8765,
    9102, 9434, 9760, 10080, 10394, 10702, 11003, 11297,
    11585, 11866, 12140, 12406, 12665, 12916, 13160, 13395,
    13623, 13842, 14053, 14256, 14449, 14635, 14811, 14978,
    15137, 15286, 15426, 15557, 15679, 15791, 15893, 15986,
    16069, 16143, 16207, 16261, 16305, 16340, 16364, 16379,
    16384, 16379, 16364, 16340, 16305, 16261, 16207, 16143,
    16069, 15986, 15893, 15791, 15679, 15557, 15426, 15286,
    15137, 14978, 14811, 14635, 14449, 14256, 14053, 13842,
    13623, 13395, 13160, 12916, 12665, 12406, 12140, 11866,
    11585, 11297, 11003, 10702, 10394, 10080, 9760, 9434,
    9102, 8765, 8423, 8076, 7723, 7366, 7005, 6639,
    6270, 5897, 5520, 5139, 4756, 4370, 3981, 3590,
    3196, 2801, 2404, 2006, 1606, 1205, 804, 402,
    0, -402, -804, -1205, -1606, -2006, -2404, -2801,
    -3196, -3590, -3981, -4370, -4756, -5139, -5520, -5897,
    -6270, -6639, -7005, -7366, -7723, -8076, -8423, -8765,
    -9102, -9434, -9760, -10080, -10394, -10702, -11003, -11297,
    -11585, -11866, -12140, -12406, -12665, -12916, -13160, -13395,
    -13623, -13842, -14053, -14256, -14449, -14635, -14811, -14978,
    -15137, -15286, -15426, -15557, -15679, -15791, -15893, -15986,
    -16069, -16143, -16207, -16261, -16305, -16340, -16364, -16379,
    -16384, -16379, -16364, -16340, -16305, -16261, -16207, -16143,
    -16069, -15986, -15893, -15791, -15679, -15557, -15426, -15286,
    -15137, -14978, -14811, -14635, -14449, -14256, -14053, -13842,
    -13623, -13395, -13160, -12916, -12665, -12406, -12140, -11866,
    -11585, -11297, -11003, -10702, -10394, -10080, -9760, -9434,
    -9102, -8765, -8423, -8076, -7723, -7366, -7005, -6639,
    -6270, -5897, -5520, -5139, -4756, -4370, -3981, -3590,
    -3196, -2801, -2404, -2006, -1606, -1205, -804, -402,
};

// Cycle costs: the BIOS loops' timing, near enough for the scanline to move
// on as it does on the GBA while the game copies and decompresses.
#define SWI_CYCLES 40

static void Done(void)
{
    // Interrupts wait until the SWI returns; then the hardware catches up.
    PlatformCatchUp();
}

void CpuSet(const void *src, void *dest, u32 control)
{
    u32 count = control & 0x1FFFFF;
    PlatformSpend(SWI_CYCLES + count * 9);
    int fixed = (control >> 24) & 1;
    if (control & (1u << 26)) {
        const u32 *s = (const u32 *)((uintptr_t)src & ~3u);
        u32 *d = (u32 *)((uintptr_t)dest & ~3u);
        if (fixed) {
            u32 v = *s;
            while (count--) *d++ = v;
        } else {
            while (count--) *d++ = *s++;
        }
    } else {
        const u16 *s = (const u16 *)((uintptr_t)src & ~1u);
        u16 *d = (u16 *)((uintptr_t)dest & ~1u);
        if (fixed) {
            u16 v = *s;
            while (count--) *d++ = v;
        } else {
            while (count--) *d++ = *s++;
        }
    }
    Done();
}

void CpuFastSet(const void *src, void *dest, u32 control)
{
    // Words, in blocks of 8.
    u32 count = ((control & 0x1FFFFF) + 7) & ~7u;
    PlatformSpend(SWI_CYCLES + count * 3);
    const u32 *s = (const u32 *)((uintptr_t)src & ~3u);
    u32 *d = (u32 *)((uintptr_t)dest & ~3u);
    if (control & (1u << 24)) {
        u32 v = *s;
        while (count--) *d++ = v;
    } else {
        while (count--) *d++ = *s++;
    }
    Done();
}

static void LZ77UnComp(const u8 *src, u8 *dest)
{
    u32 header = src[0] | (src[1] << 8) | (src[2] << 16) | ((u32)src[3] << 24);
    u32 size = header >> 8;
    PlatformSpend(SWI_CYCLES + size * 20);
    src += 4;
    u8 *end = dest + size;
    while (dest < end) {
        u8 flags = *src++;
        for (int i = 0; i < 8 && dest < end; i++, flags <<= 1) {
            if (flags & 0x80) {
                u32 len = (src[0] >> 4) + 3;
                u32 disp = (((src[0] & 0xF) << 8) | src[1]) + 1;
                src += 2;
                while (len-- && dest < end) {
                    *dest = *(dest - disp);
                    dest++;
                }
            } else {
                *dest++ = *src++;
            }
        }
    }
    Done();
}

void LZ77UnCompWram(const u32 *src, void *dest)
{
    LZ77UnComp((const u8 *)src, dest);
}

void LZ77UnCompVram(const u32 *src, void *dest)
{
    LZ77UnComp((const u8 *)src, dest);
}

static void RLUnComp(const u8 *src, u8 *dest)
{
    u32 header = src[0] | (src[1] << 8) | (src[2] << 16) | ((u32)src[3] << 24);
    u32 size = header >> 8;
    PlatformSpend(SWI_CYCLES + size * 10);
    src += 4;
    u8 *end = dest + size;
    while (dest < end) {
        u8 flag = *src++;
        if (flag & 0x80) {
            u32 len = (flag & 0x7F) + 3;
            u8 v = *src++;
            while (len-- && dest < end) *dest++ = v;
        } else {
            u32 len = (flag & 0x7F) + 1;
            while (len-- && dest < end) *dest++ = *src++;
        }
    }
    Done();
}

void RLUnCompWram(const u32 *src, void *dest)
{
    RLUnComp((const u8 *)src, dest);
}

void RLUnCompVram(const u32 *src, void *dest)
{
    RLUnComp((const u8 *)src, dest);
}

s32 Div(s32 num, s32 denom)
{
    if (denom == 0)
        return num < 0 ? -1 : 1;  // the BIOS's result for a zero divisor
    return num / denom;
}

u16 Sqrt(u32 num)
{
    u32 r = 0, bit = 1u << 30;
    while (bit > num) bit >>= 2;
    while (bit) {
        if (num >= r + bit) {
            num -= r + bit;
            r = (r >> 1) + bit;
        } else {
            r >>= 1;
        }
        bit >>= 2;
    }
    return (u16)r;
}

// ArcTan: the BIOS's polynomial, on a tangent in 1.14 fixed point.
static s32 ArcTan(s32 i)
{
    s32 a = -((i * i) >> 14);
    s32 b = ((0xA9 * a) >> 14) + 0x390;
    b = ((b * a) >> 14) + 0x91C;
    b = ((b * a) >> 14) + 0xFB6;
    b = ((b * a) >> 14) + 0x16AA;
    b = ((b * a) >> 14) + 0x2081;
    b = ((b * a) >> 14) + 0x3651;
    b = ((b * a) >> 14) + 0xA2F9;
    return (i * b) >> 16;
}

u16 ArcTan2(s16 x, s16 y)
{
    if (!y)
        return x >= 0 ? 0 : 0x8000;
    if (!x)
        return y >= 0 ? 0x4000 : 0xC000;
    if (y >= 0) {
        if (x >= 0) {
            if (x >= y)
                return (u16)ArcTan(((s32)y << 14) / x);
        } else if (-x >= y) {
            return (u16)(ArcTan(((s32)y << 14) / x) + 0x8000);
        }
        return (u16)(0x4000 - ArcTan(((s32)x << 14) / y));
    }
    if (x <= 0) {
        if (-x > -y)
            return (u16)(ArcTan(((s32)y << 14) / x) + 0x8000);
    } else if (x >= -y) {
        return (u16)(ArcTan(((s32)y << 14) / x) + 0x10000);
    }
    return (u16)(0xC000 - ArcTan(((s32)x << 14) / y));
}

struct BgAffineSrc { s32 texX, texY; s16 scrX, scrY; s16 sx, sy; u16 alpha; };
struct BgAffineDst { s16 pa, pb, pc, pd; s32 dx, dy; };
struct ObjAffineSrc { s16 sx, sy; u16 alpha; };

void BgAffineSet(const struct BgAffineSrc *src, struct BgAffineDst *dest, s32 count)
{
    for (; count > 0; count--, src++, dest++) {
        u32 theta = src->alpha >> 8;
        s32 sin = sSine[theta], cos = sSine[(theta + 64) & 0xFF];
        s32 pa = (cos * src->sx) >> 14;
        s32 pb = (-sin * src->sx) >> 14;
        s32 pc = (sin * src->sy) >> 14;
        s32 pd = (cos * src->sy) >> 14;
        dest->pa = (s16)pa;
        dest->pb = (s16)pb;
        dest->pc = (s16)pc;
        dest->pd = (s16)pd;
        dest->dx = src->texX - (pa * src->scrX + pb * src->scrY);
        dest->dy = src->texY - (pc * src->scrX + pd * src->scrY);
    }
}

void ObjAffineSet(const struct ObjAffineSrc *src, void *dest, s32 count, s32 offset)
{
    u8 *d = dest;
    for (; count > 0; count--, src = (const struct ObjAffineSrc *)((const u8 *)src + 8)) {
        u32 theta = src->alpha >> 8;
        s32 sin = sSine[theta], cos = sSine[(theta + 64) & 0xFF];
        *(s16 *)d = (s16)((cos * src->sx) >> 14); d += offset;
        *(s16 *)d = (s16)((-sin * src->sx) >> 14); d += offset;
        *(s16 *)d = (s16)((sin * src->sy) >> 14); d += offset;
        *(s16 *)d = (s16)((cos * src->sy) >> 14); d += offset;
    }
}

void RegisterRamReset(u32 flags)
{
    if (flags & 0x04) for (u32 i = 0; i < PLTT_SIZE; i += 2) PLTT[i / 2] = 0;
    if (flags & 0x08) for (u32 i = 0; i < VRAM_SIZE; i++) VRAM[i] = 0;
    if (flags & 0x10) for (u32 i = 0; i < OAM_SIZE; i += 2) OAM[i / 2] = 0;
    if (flags & 0x80) {
        u16 keys = IO16(R_KEYINPUT);
        PlatformIoReset();
        IO16(R_KEYINPUT) = keys;
    }
}

void SoftReset(u32 flags)
{
    PlatformLogf("SoftReset(%x)", flags);
    PlatformHostSoftReset();
}

void VBlankIntrWait(void)
{
    // The game waits here only in the e-Reader's code.
    PlatformHalt("VBlankIntrWait outside the main loop (e-Reader)");
}

int MultiBoot(void *mp)
{
    (void)mp;
    return 1;  // no link partner
}
