// The four DMA channels.
//
// Writing a channel's control with the enable bit set latches its source,
// destination and count, as the hardware does; an immediate transfer then
// happens at once, a VBlank or HBlank one at each of those (the scanline
// effects are HBlank DMA to the scroll and window registers). The sound
// channels' FIFO DMA is not run: the platform takes the mixed samples from
// the sound engine's buffer itself (apu.c).

#include "gba.h"

struct Dma {
    u32 src, dst, count;
    u16 control;
    int armed;
};
static struct Dma sDma[4];

static const u32 sSrcMask[4] = { 0x07FFFFFF, 0x0FFFFFFF, 0x0FFFFFFF, 0x0FFFFFFF };
static const u32 sDstMask[4] = { 0x07FFFFFF, 0x07FFFFFF, 0x07FFFFFF, 0x0FFFFFFF };

// Linear memory holds addresses below 0x08000000.
#define MEMORY_END 0x08000000u

void PlatformDmaReset(void)
{
    for (int i = 0; i < 4; i++)
        sDma[i] = (struct Dma){ 0 };
}

static u32 Count(int ch)
{
    u32 n = IO16(R_DMA0SAD + ch * 12 + 8);
    if (ch == 3)
        return n ? n : 0x10000;
    n &= 0x3FFF;
    return n ? n : 0x4000;
}

static u32 Read(u32 addr, int wide)
{
    if (addr >= MEMORY_END)
        return 0;
    if ((addr >> 24) == 4)
        return wide ? (PlatformIoRead16(addr - IO_BASE) | ((u32)PlatformIoRead16(addr - IO_BASE + 2) << 16)) : PlatformIoRead16(addr - IO_BASE);
    return wide ? *(u32 *)(uintptr_t)addr : *(u16 *)(uintptr_t)addr;
}

static void Write(u32 addr, u32 value, int wide)
{
    if (addr >= MEMORY_END)
        return;
    if ((addr >> 24) == 4) {
        PlatformIoWrite16(addr - IO_BASE, (u16)value);
        if (wide)
            PlatformIoWrite16(addr - IO_BASE + 2, (u16)(value >> 16));
        return;
    }
    if (wide)
        *(u32 *)(uintptr_t)addr = value;
    else
        *(u16 *)(uintptr_t)addr = (u16)value;
}

static void Transfer(int ch)
{
    struct Dma *d = &sDma[ch];
    u16 c = d->control;
    int wide = (c >> 10) & 1;
    u32 unit = wide ? 4 : 2;
    int srcStep = ((c >> 7) & 3) == 0 ? 1 : ((c >> 7) & 3) == 1 ? -1 : 0;
    int dstStep = ((c >> 5) & 3) == 1 ? -1 : ((c >> 5) & 3) == 2 ? 0 : 1;
    u32 src = d->src & ~(unit - 1), dst = d->dst & ~(unit - 1);
    for (u32 i = 0; i < d->count; i++) {
        Write(dst, Read(src, wide), wide);
        src += srcStep * (s32)unit;
        dst += dstStep * (s32)unit;
    }
    d->src = src;
    d->dst = dst;
    PlatformSpend(4 + d->count * (wide ? 4 : 3));

    u32 cntH = R_DMA0SAD + ch * 12 + 10;
    if ((c & 0x200) && ((c >> 12) & 3) != 0) {
        // Repeat: the count reloads, and the destination with "increment/reload".
        d->count = Count(ch);
        if (((c >> 5) & 3) == 3)
            d->dst = IO32(R_DMA0SAD + ch * 12 + 4) & sDstMask[ch];
    } else {
        d->armed = 0;
        IO16(cntH) &= ~0x8000;
    }
    if (c & 0x4000)
        PlatformRaiseIrq((u16)(IRQ_DMA0 << ch));
}

void PlatformDmaControl(int ch, u16 old, u16 value)
{
    struct Dma *d = &sDma[ch];
    if (!(value & 0x8000)) {
        d->armed = 0;
        return;
    }
    if (!(old & 0x8000)) {
        u32 base = R_DMA0SAD + ch * 12;
        d->src = IO32(base) & sSrcMask[ch];
        d->dst = IO32(base + 4) & sDstMask[ch];
        d->count = Count(ch);
    }
    d->control = value;
    int timing = (value >> 12) & 3;
    if (timing == 0) {
        d->armed = 0;
        Transfer(ch);
        PlatformCatchUp();  // the CPU waited for the transfer
    } else if (timing == 3) {
        // Sound FIFO (channels 1, 2) and video capture (3): not run.
        d->armed = 0;
    } else {
        d->armed = 1;
    }
}

static void Run(int timing)
{
    for (int ch = 0; ch < 4; ch++) {
        struct Dma *d = &sDma[ch];
        if (d->armed && ((d->control >> 12) & 3) == timing && (IO16(R_DMA0SAD + ch * 12 + 10) & 0x8000))
            Transfer(ch);
    }
}

void PlatformDmaHBlank(void)
{
    Run(2);
}

// A 16-bit register's value on each line of the frame about to be drawn
// (called at its start): its value now, then what the armed HBlank DMA
// writes to it at the end of each line (the scanline effects: the battle
// intro's sliding background, waves), channel by channel as the hardware
// runs them. What the CPU itself writes during the frame is not foreseen.
EXPORT(PlatformPredictLines) const u16 *PlatformPredictLines(u32 off)
{
    static u16 lines[SCREEN_H];
    u32 at = IO_BASE + off;
    u16 v = IO16(off);
    struct Dma dma[4];
    for (int ch = 0; ch < 4; ch++)
        dma[ch] = sDma[ch];
    for (int y = 0; y < SCREEN_H; y++) {
        lines[y] = v;
        for (int ch = 0; ch < 4; ch++) {
            struct Dma *d = &dma[ch];
            u16 c = d->control;
            if (!d->armed || ((c >> 12) & 3) != 2)
                continue;
            int wide = (c >> 10) & 1;
            u32 unit = wide ? 4 : 2;
            int srcStep = ((c >> 7) & 3) == 0 ? 1 : ((c >> 7) & 3) == 1 ? -1 : 0;
            int dstStep = ((c >> 5) & 3) == 1 ? -1 : ((c >> 5) & 3) == 2 ? 0 : 1;
            u32 src = d->src & ~(unit - 1), dst = d->dst & ~(unit - 1);
            for (u32 i = 0; i < d->count; i++) {
                if (dst == at || (wide && dst + 2 == at)) {
                    u32 word = Read(src, wide);
                    v = (u16)(dst == at ? word : word >> 16);
                }
                src += srcStep * (s32)unit;
                dst += dstStep * (s32)unit;
            }
            d->src = src;
            d->dst = dst;
            if ((c & 0x200) && ((c >> 5) & 3) == 3)
                d->dst = IO32(R_DMA0SAD + ch * 12 + 4) & sDstMask[ch];
            if (!(c & 0x200))
                d->armed = 0;
        }
    }
    return lines;
}

void PlatformDmaVBlank(void)
{
    Run(1);
}
