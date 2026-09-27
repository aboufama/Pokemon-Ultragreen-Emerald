// The GBA's I/O registers with the hardware's behavior.
//
// The game's volatile accesses to 0x04xxxxxx arrive here (PlatformIoRead /
// PlatformIoWrite, see platform/tools/volatile_io.mjs). Registers live at
// their own addresses in linear memory, so the picture processor reads them
// there; what memory alone can't do is done here: IF clears the bits written
// to it, the timers count on the CPU clock (clock.c), a poll of VCOUNT or a
// timer takes a little time (so busy waits end), a DMA control write starts
// its transfer, sound register writes reach the sound chip, and the
// interrupt dispatcher (crt0.s's IntrMain) calls the game's handlers.

#include "gba.h"
#include "platform.h"

u16 gPlatformKeys;

struct Timer {
    u16 reload;
    u16 control;
    u16 frozen;       // the count while stopped
    u64 start;        // gPlatformCycles when started
};
static struct Timer sTimers[4];

static const u8 sPrescaleShift[4] = { 0, 6, 8, 10 };

// A read of a status register or a timer takes a few cycles: busy waits on
// them (the wireless adapter's delays, the sound engine's wait for line 159)
// end, and the hardware catches up meanwhile.
#define POLL_CYCLES 8

static u32 TimerTicks(int i, u64 now);

static u16 TimerCount(int i, u64 now)
{
    struct Timer *t = &sTimers[i];
    if (!(t->control & 0x80))
        return t->frozen;
    u32 period = 0x10000u - t->reload;
    return (u16)(t->reload + TimerTicks(i, now) % period);
}

// Ticks since the timer started (a count-up timer ticks on the previous
// timer's overflows).
static u32 TimerTicks(int i, u64 now)
{
    struct Timer *t = &sTimers[i];
    if (i > 0 && (t->control & 0x04)) {
        struct Timer *p = &sTimers[i - 1];
        if (!(p->control & 0x80))
            return 0;
        u32 period = 0x10000u - p->reload;
        u64 ticksNow = TimerTicks(i - 1, now);
        u64 ticksStart = t->start > p->start ? TimerTicks(i - 1, t->start) : 0;
        return (u32)(ticksNow / period - ticksStart / period);
    }
    return (u32)((now - t->start) >> sPrescaleShift[t->control & 3]);
}

void PlatformIoReset(void)
{
    for (u32 off = 0; off < IO_SIZE; off += 2)
        IO16(off) = 0;
    for (int i = 0; i < 4; i++)
        sTimers[i] = (struct Timer){ 0 };
    // The state the BIOS leaves when it starts the cartridge: the display in
    // forced blank at scanline 126 (the game's first DISPSTAT write lands
    // at once because of the forced blank), the affine backgrounds unscaled.
    IO16(R_DISPCNT) = 0x0080;
    IO16(R_KEYINPUT) = 0x3FF;
    IO16(R_BG2PA) = IO16(R_BG2PD) = IO16(R_BG3PA) = IO16(R_BG3PD) = 0x100;
    IO16(R_SOUNDCNT_X + 4) = 0x200;  // SOUNDBIAS
    IO16(R_RCNT) = 0x8000;
    IO8(R_POSTFLG) = 1;
    PlatformClockReset(126);
    PlatformDmaReset();
}

// ---------------------------------------------------------------- interrupts

extern void (*gIntrTable[])(void);
extern u8 *gSTWIStatus;

// crt0.s's IntrMain: the pending interrupt of highest priority, acknowledged,
// its handler called with IME and IE as IntrMain sets them.
static const u16 sIntrOrder[14] = {
    1 << 2, 1 << 7, 1 << 6, 1 << 1, 1 << 0, 1 << 3, 1 << 4, 1 << 5,
    1 << 8, 1 << 9, 1 << 10, 1 << 11, 1 << 12, 1 << 13,
};

static void Dispatch(void)
{
    // The CPU takes an interrupt when IME is on and one is enabled and pending.
    while ((IO16(R_IME) & 1) && (IO16(R_IE) & IO16(R_IF) & 0x3FFF)) {
        u16 ie = IO16(R_IE), ime = IO16(R_IME);
        u16 pending = ie & IO16(R_IF);
        int slot = 0;
        while (slot < 14 && !(pending & sIntrOrder[slot]))
            slot++;
        if (slot >= 13) {
            // Game Pak removed: IntrMain spins forever.
            PlatformHalt("the Game Pak interrupt (cartridge removed)");
        }
        u16 flag = sIntrOrder[slot];
        IO16(R_IME) = slot == 0 ? 0 : 1;
        IO16(R_IF) &= ~flag;
        u8 timerSelect = gSTWIStatus ? gSTWIStatus[0xA] : 0;
        u16 nested = (u16)((8u << timerSelect) | IRQ_GAMEPAK | IRQ_SERIAL | (1 << 6) | IRQ_VCOUNT | IRQ_HBLANK);
        IO16(R_IE) = nested & ie & ~flag;
        gIntrTable[slot]();
        IO16(R_IE) = ie;
        IO16(R_IME) = ime;
    }
}

void PlatformRaiseIrq(u16 flag)
{
    IO16(R_IF) |= flag;
    Dispatch();
}

// ---------------------------------------------------------------- registers

u16 PlatformIoRead16(u32 off)
{
    off &= ~1u;
    if (off >= R_TM0CNT_L && off < R_TM0CNT_L + 16) {
        int i = (off - R_TM0CNT_L) >> 2;
        if (off & 2)
            return sTimers[i].control;
        PlatformWaitCycles(POLL_CYCLES);
        return TimerCount(i, gPlatformCycles);
    }
    if (off == R_DISPSTAT || off == R_VCOUNT || off == R_SIOCNT || off == R_IF)
        PlatformWaitCycles(POLL_CYCLES);
    if (off == R_KEYINPUT)
        return (u16)(~gPlatformKeys & 0x3FF);
    return IO16(off);
}

void PlatformIoWrite16(u32 off, u16 value)
{
    off &= ~1u;
    u16 old = IO16(off);
    switch (off) {
    case R_VCOUNT:
    case R_KEYINPUT:
        return;  // read-only
    case R_DISPSTAT:
        IO16(off) = (old & 7) | (value & 0xFF38);
        return;
    case R_IF:
        IO16(off) = old & ~value;
        return;
    case R_IE:
    case R_IME:
        IO16(off) = value;
        Dispatch();  // an enabled, pending interrupt is taken at once
        return;
    case R_SIOCNT:
        // No link partner: a transfer ends at once, receiving nothing.
        IO16(off) = value & ~0x80;
        if (value & 0x80) {
            for (u32 r = 0x120; r < 0x128; r += 2)
                IO16(r) = 0xFFFF;
            IO16(0x12A) = 0xFFFF;
            if (value & 0x4000)
                PlatformRaiseIrq(IRQ_SERIAL);
        }
        return;
    }
    if (off >= R_TM0CNT_L && off < R_TM0CNT_L + 16) {
        int i = (off - R_TM0CNT_L) >> 2;
        struct Timer *t = &sTimers[i];
        if (!(off & 2)) {
            t->reload = value;
            return;
        }
        u64 now = gPlatformCycles;
        int wasOn = t->control & 0x80, on = value & 0x80;
        if (wasOn && !on)
            t->frozen = TimerCount(i, now);
        t->control = value & 0xC7;
        if (!wasOn && on) {
            t->start = now;
            t->frozen = t->reload;
        }
        IO16(off) = t->control;
        return;
    }
    IO16(off) = value;
    if (off >= R_DMA0SAD && off <= R_DMA3CNT_H && (off - R_DMA0SAD) % 12 == 10)
        PlatformDmaControl((off - R_DMA0SAD) / 12, old, value);
    else if (off >= R_SOUND1CNT_L && off < R_FIFO_A)
        PlatformSoundRegWrite(off, old, value);
    else if ((off >= R_BG2X && off < R_BG2X + 8) || (off >= R_BG3X && off < R_BG3X + 8))
        PlatformPpuRegWrite(off);
}

uint32_t PlatformIoRead(uint32_t addr, uint32_t size)
{
    u32 off = addr - IO_BASE;
    if (off >= IO_SIZE) {
        if (size == 1) return *(volatile u8 *)(uintptr_t)addr;
        if (size == 2) return *(volatile u16 *)(uintptr_t)(addr & ~1u);
        return *(volatile u32 *)(uintptr_t)(addr & ~3u);
    }
    if (size == 4) {
        off &= ~3u;
        return PlatformIoRead16(off) | ((u32)PlatformIoRead16(off + 2) << 16);
    }
    u16 half = PlatformIoRead16(off & ~1u);
    if (size == 1)
        return (off & 1) ? half >> 8 : half & 0xFF;
    return half;
}

void PlatformIoWrite(uint32_t addr, uint32_t value, uint32_t size)
{
    u32 off = addr - IO_BASE;
    if (off >= IO_SIZE) {
        if (size == 1) *(volatile u8 *)(uintptr_t)addr = (u8)value;
        else if (size == 2) *(volatile u16 *)(uintptr_t)(addr & ~1u) = (u16)value;
        else *(volatile u32 *)(uintptr_t)(addr & ~3u) = value;
        return;
    }
    if (size == 4) {
        off &= ~3u;
        PlatformIoWrite16(off, (u16)value);
        PlatformIoWrite16(off + 2, (u16)(value >> 16));
        return;
    }
    if (size == 2) {
        PlatformIoWrite16(off, (u16)value);
        return;
    }
    // A byte: the other byte of the halfword keeps its value (IF: only these
    // bits clear; HALTCNT: the CPU would halt until an interrupt).
    u32 half = off & ~1u;
    u32 shift = (off & 1) * 8;
    if (half == R_IF) {
        IO16(R_IF) &= ~((value & 0xFF) << shift);
        return;
    }
    if (off == R_HALTCNT || off == R_POSTFLG) {
        IO8(off) = (u8)value;
        return;
    }
    u16 cur = IO16(half);
    PlatformIoWrite16(half, (u16)((cur & ~(0xFF << shift)) | ((value & 0xFF) << shift)));
}

void PlatformHalt(const char *reason)
{
    PlatformHostHalt(reason);
}
