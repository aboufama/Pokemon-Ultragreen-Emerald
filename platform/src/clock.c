// The CPU clock and the hardware's timeline.
//
// The game's code runs natively, so its own instructions take no time here;
// time passes where the GBA's does in ways the game can see: polling a
// register (a timer, VCOUNT), a BIOS call (copies, decompression), a DMA
// transfer, a delay the platform's drivers stand in for. Whenever the clock
// moves, the hardware catches up: each scanline starts (VCOUNT, the VCount
// interrupt), is drawn and reaches its HBlank (HBlank DMA and interrupt),
// and line 160 brings the VBlank (the frame is done, VBlank DMA and
// interrupt). Interrupt handlers run then, inside whatever the game was
// doing, as on the GBA: the VBlank interrupts during the boot's busy waits
// run the sound engine and advance the random number generator exactly as
// many times as on the hardware.

#include "gba.h"

u64 gPlatformCycles;

// The PPU draws a line in 960 dots and the HBlank flag rises 46 later.
#define HBLANK_DOT 1006u

static u32 sLine;
static u64 sLineStart;
static int sHBlankDone;
static u32 sVBlanks;
static int sBusy;

void PlatformClockReset(u32 line)
{
    gPlatformCycles = 0;
    sLine = line;
    sLineStart = 0;
    sHBlankDone = 0;
    sVBlanks = 0;
    sBusy = 0;
    IO16(R_VCOUNT) = (u16)line;
}

u32 PlatformLine(void)
{
    return sLine;
}

u32 PlatformVBlanks(void)
{
    return sVBlanks;
}

static void StartLine(void)
{
    IO16(R_VCOUNT) = (u16)sLine;
    u16 stat = IO16(R_DISPSTAT) & ~7;
    if (sLine >= 160 && sLine < 227)
        stat |= 1;
    int match = (stat >> 8) == sLine;
    if (match)
        stat |= 4;
    IO16(R_DISPSTAT) = stat;
    if (sLine == 160) {
        sVBlanks++;
        PlatformPpuVBlank();
        PlatformHostVBlank(sVBlanks);
        PlatformDmaVBlank();
        if (IO16(R_DISPSTAT) & 8)
            PlatformRaiseIrq(IRQ_VBLANK);
    }
    if (match && (IO16(R_DISPSTAT) & 0x20))
        PlatformRaiseIrq(IRQ_VCOUNT);
}

static void HBlank(void)
{
    if (sLine < SCREEN_H)
        PlatformPpuLine(sLine);
    IO16(R_DISPSTAT) |= 2;
    if (sLine < SCREEN_H)
        PlatformDmaHBlank();
    if (IO16(R_DISPSTAT) & 0x10)
        PlatformRaiseIrq(IRQ_HBLANK);
}

void PlatformCatchUp(void)
{
    // Interrupt handlers run inside this loop; time they take is caught up
    // when they return.
    if (sBusy)
        return;
    sBusy = 1;
    for (;;) {
        if (!sHBlankDone && gPlatformCycles >= sLineStart + HBLANK_DOT) {
            sHBlankDone = 1;
            HBlank();
            continue;
        }
        if (gPlatformCycles >= sLineStart + CYCLES_PER_LINE) {
            sLineStart += CYCLES_PER_LINE;
            sLine = sLine + 1 == LINES ? 0 : sLine + 1;
            sHBlankDone = 0;
            StartLine();
            continue;
        }
        break;
    }
    sBusy = 0;
}

void PlatformAdvanceToNextEvent(void)
{
    u64 next = sHBlankDone ? sLineStart + CYCLES_PER_LINE : sLineStart + HBLANK_DOT;
    if (gPlatformCycles < next)
        gPlatformCycles = next;
    PlatformCatchUp();
}

void PlatformWaitCycles(uint32_t cycles)
{
    gPlatformCycles += cycles;
    PlatformCatchUp();
}
