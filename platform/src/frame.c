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

EXPORT(PlatformInit) void PlatformInit(void)
{
    PlatformIoReset();
    PlatformPpuReset();
    sWaitFlag = 0;
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
