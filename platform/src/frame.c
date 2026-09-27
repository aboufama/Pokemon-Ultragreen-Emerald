// The frame: one iteration of the game's main loop, then its wait for the
// VBlank (clock.c runs the hardware meanwhile).
//
// On the GBA the main loop runs, then WaitForVBlank spins until the VBlank
// interrupt handler sets gMain.intrCheck; the screen is drawn line by line
// all the while. Here AgbMainFrame (platform/patches/main.patch) runs one
// iteration and returns at WaitForVBlank, which names the flag it waits for;
// PlatformFrame then lets time pass until the flag is set. A frame that takes
// longer than the GBA's frame (a lag frame) spans two VBlanks, as on the GBA.

#include "gba.h"
#include "platform.h"

// crt0.s's IntrMain, which InitIntrHandlers copies to RAM; the dispatcher
// itself is io.c's.
const u32 IntrMain[0x200];

void AgbMain(void);
void AgbMainFrame(void);

static volatile uint16_t *sWaitFlag;
static uint16_t sWaitMask;

void PlatformWaitForFlag(volatile uint16_t *flag, uint16_t mask)
{
    sWaitFlag = flag;
    sWaitMask = mask;
}

// Power on. The BIOS starts the cartridge with the display at scanline 126;
// mGBA (the emulator the ROM is compared with) starts it 888 cycles into
// that line, its HBlank 120 cycles away. crt0.s's start-up (the stacks, the
// interrupt vector) then takes 248 cycles before AgbMain (measured on the
// ROM).
#define RESET_LINE 126
#define RESET_DOT 888
#define CRT0_CYCLES 248

EXPORT(PlatformInit) void PlatformInit(void)
{
    PlatformClockReset(RESET_LINE, RESET_DOT);
    PlatformIoReset();
    PlatformPpuReset();
    sWaitFlag = 0;
    PlatformSpend(CRT0_CYCLES);
    AgbMain();
}

EXPORT(PlatformFrame) void PlatformFrame(void)
{
    sWaitFlag = 0;
    AgbMainFrame();
    if (!sWaitFlag)
        return;
    u32 start = PlatformVBlanks();
    while (!(*sWaitFlag & sWaitMask)) {
        PlatformAdvanceToNextEvent();
        if (PlatformVBlanks() - start > 600)
            PlatformHalt("waited 10 seconds for the VBlank interrupt (it is off)");
    }
}

EXPORT(PlatformVBlankCount) u32 PlatformVBlankCount(void)
{
    return PlatformVBlanks();
}

EXPORT(PlatformSetKeys) void PlatformSetKeys(u32 keys)
{
    gPlatformKeys = (u16)(keys & 0x3FF);
}

EXPORT(PlatformFrameBuffer) u32 *PlatformFrameBuffer(void)
{
    return gPlatformFrame;
}
