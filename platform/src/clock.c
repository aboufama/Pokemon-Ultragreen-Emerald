// The CPU clock and the hardware's timeline.
//
// The game's code runs natively; its basic blocks add their GBA cost to the
// clock as they run (tools/cpu_time.mjs), and so do the BIOS calls (copies,
// decompression), DMA transfers and the delays the platform's drivers stand
// in for. The hardware catches up with the clock where the game can see it:
// a register read or write (a timer, VCOUNT), a BIOS call, a DMA transfer,
// and each turn of a loop once an event is due (PlatformPoll). Then each
// scanline starts (VCOUNT, the VCount interrupt), is drawn and reaches its
// HBlank (HBlank DMA and interrupt), and line 160 brings the VBlank (the
// frame is done, VBlank DMA and interrupt); at line 0 the browser prepares
// the remake layer's pictures for the frame about to be drawn. Interrupt
// handlers run then, inside whatever the game was doing, as on the GBA: the
// VBlank interrupts during the boot's busy waits run the sound engine and
// advance the random number generator exactly as many times as on the
// hardware.

#include "gba.h"

u64 gPlatformCycles;
u64 gPlatformPowerOn;

// The PPU draws a line in 960 dots and the HBlank flag rises 46 later.
#define HBLANK_DOT 1006u

static u32 sLine;
static u64 sLineStart;
static int sHBlankDone;
static u32 sVBlanks;
static int sBusy;

// When the hardware next has something to do: the line's HBlank or the next
// line's start.
u64 gPlatformNextEvent;

static void NextEvent(void)
{
    gPlatformNextEvent = sHBlankDone ? sLineStart + CYCLES_PER_LINE : sLineStart + HBLANK_DOT;
}

// Power on: the CPU starts `dot` cycles into scanline `line`.
void PlatformClockReset(u32 line, u32 dot)
{
    gPlatformCycles = gPlatformPowerOn = dot;
    sLine = line;
    sLineStart = 0;
    sHBlankDone = dot >= HBLANK_DOT;
    sVBlanks = 0;
    sBusy = 0;
    NextEvent();
    IO16(R_VCOUNT) = (u16)line;
    IO16(R_DISPSTAT) = (u16)((line >= 160 && line < 227 ? 1 : 0) | (sHBlankDone ? 2 : 0));
}

u32 PlatformLine(void)
{
    return sLine;
}

u32 PlatformVBlanks(void)
{
    return sVBlanks;
}

u64 PlatformClockNow(void)
{
    return sHBlankDone ? sLineStart + HBLANK_DOT : sLineStart;
}

static void StartLine(void)
{
    // The sound chip plays up to here (the sound DMA reads the PCM buffer
    // before the VBlank's mixer writes it).
    PlatformSoundCatchUp();
    IO16(R_VCOUNT) = (u16)sLine;
    u16 stat = IO16(R_DISPSTAT) & ~7;
    if (sLine >= 160 && sLine < 227)
        stat |= 1;
    int match = (stat >> 8) == sLine;
    if (match)
        stat |= 4;
    IO16(R_DISPSTAT) = stat;
    if (sLine == 0)
        PlatformHostFrameStart();
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
    PlatformSoundCatchUp();
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
    NextEvent();
    sBusy = 0;
}

// The game's loops come here on every turn (tools/cpu_time.mjs puts a call
// at each loop's back edge), and the hardware catches up when an event is
// due: an interrupt arrives inside a loop that does nothing else, as on the
// GBA, where it arrives between any two instructions. The map loader spins
// until the VBlank handler has made the DMA copies it queued.
void PlatformPoll(void)
{
    if (gPlatformCycles >= gPlatformNextEvent)
        PlatformCatchUp();
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
