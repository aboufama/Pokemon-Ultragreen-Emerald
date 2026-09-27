// The platform's view of the GBA: its memory map at its own addresses in
// linear memory, and the state shared between the platform's parts.
#ifndef PLATFORM_GBA_H
#define PLATFORM_GBA_H

#include <stdint.h>
#include <stddef.h>

typedef uint8_t u8;
typedef uint16_t u16;
typedef uint32_t u32;
typedef uint64_t u64;
typedef int8_t s8;
typedef int16_t s16;
typedef int32_t s32;
typedef int64_t s64;

#define IO_BASE 0x04000000u
#define PLTT_BASE 0x05000000u
#define VRAM_BASE 0x06000000u
#define OAM_BASE 0x07000000u
#define IO_SIZE 0x400u
#define PLTT_SIZE 0x400u
#define VRAM_SIZE 0x18000u
#define OAM_SIZE 0x400u

// Raw access (the platform is the hardware: no hooks here).
#define IO8(off) (*(volatile u8 *)(uintptr_t)(IO_BASE + (off)))
#define IO16(off) (*(volatile u16 *)(uintptr_t)(IO_BASE + (off)))
#define IO32(off) (*(volatile u32 *)(uintptr_t)(IO_BASE + (off)))
#define PLTT ((volatile u16 *)(uintptr_t)PLTT_BASE)
#define VRAM ((volatile u8 *)(uintptr_t)VRAM_BASE)
#define OAM ((volatile u16 *)(uintptr_t)OAM_BASE)

// I/O register offsets.
enum {
    R_DISPCNT = 0x00, R_DISPSTAT = 0x04, R_VCOUNT = 0x06,
    R_BG0CNT = 0x08, R_BG1CNT = 0x0A, R_BG2CNT = 0x0C, R_BG3CNT = 0x0E,
    R_BG0HOFS = 0x10, R_BG0VOFS = 0x12,
    R_BG2PA = 0x20, R_BG2PB = 0x22, R_BG2PC = 0x24, R_BG2PD = 0x26, R_BG2X = 0x28, R_BG2Y = 0x2C,
    R_BG3PA = 0x30, R_BG3PB = 0x32, R_BG3PC = 0x34, R_BG3PD = 0x36, R_BG3X = 0x38, R_BG3Y = 0x3C,
    R_WIN0H = 0x40, R_WIN1H = 0x42, R_WIN0V = 0x44, R_WIN1V = 0x46, R_WININ = 0x48, R_WINOUT = 0x4A,
    R_MOSAIC = 0x4C, R_BLDCNT = 0x50, R_BLDALPHA = 0x52, R_BLDY = 0x54,
    R_SOUND1CNT_L = 0x60, R_SOUNDCNT_X = 0x84, R_FIFO_A = 0xA0, R_FIFO_B = 0xA4,
    R_DMA0SAD = 0xB0, R_DMA0CNT_H = 0xBA, R_DMA3CNT_H = 0xDE,
    R_TM0CNT_L = 0x100, R_TM0CNT_H = 0x102, R_TM3CNT_H = 0x10E,
    R_SIOCNT = 0x128, R_KEYINPUT = 0x130, R_KEYCNT = 0x132, R_RCNT = 0x134,
    R_IE = 0x200, R_IF = 0x202, R_WAITCNT = 0x204, R_IME = 0x208,
    R_POSTFLG = 0x300, R_HALTCNT = 0x301,
};

// Interrupt flags (IE/IF bits).
enum {
    IRQ_VBLANK = 1 << 0, IRQ_HBLANK = 1 << 1, IRQ_VCOUNT = 1 << 2,
    IRQ_TIMER0 = 1 << 3, IRQ_SERIAL = 1 << 7, IRQ_DMA0 = 1 << 8, IRQ_KEYPAD = 1 << 12, IRQ_GAMEPAK = 1 << 13,
};

#define SCREEN_W 240
#define SCREEN_H 160
#define LINES 228
#define CYCLES_PER_LINE 1232u

// io.c: registers, timers, interrupts, the CPU clock.
extern u64 gPlatformCycles;          // the CPU clock (16.78 MHz cycles)

// Time the hardware spends on work the platform does at once (BIOS copies,
// decompression, DMA), so the scanline and the timers move on as on the GBA.
static inline void PlatformSpend(u32 cycles)
{
    gPlatformCycles += cycles;
}
extern u16 gPlatformKeys;            // keys held (KEYINPUT bits, 1 = pressed)
void PlatformIoReset(void);
void PlatformRaiseIrq(u16 flag);
u16 PlatformIoRead16(u32 off);
void PlatformIoWrite16(u32 off, u16 value);

// clock.c: the hardware's timeline on the CPU clock.
void PlatformClockReset(u32 line);
void PlatformCatchUp(void);            // run the hardware up to gPlatformCycles
void PlatformAdvanceToNextEvent(void); // let time pass to the next hardware event
u32 PlatformLine(void);
u32 PlatformVBlanks(void);

// dma.c
void PlatformDmaControl(int ch, u16 old, u16 value);
void PlatformDmaHBlank(void);
void PlatformDmaVBlank(void);
void PlatformDmaReset(void);

// ppu.c
extern u32 gPlatformFrame[SCREEN_W * SCREEN_H];  // the frame, 0xAABBGGRR
void PlatformPpuReset(void);
void PlatformPpuLine(u32 line);
void PlatformPpuVBlank(void);          // the affine reference points reload
void PlatformPpuRegWrite(u32 off);     // BG2X/Y, BG3X/Y writes reload them

// apu.c
void PlatformSoundRegWrite(u32 off, u16 old, u16 value);

// What the browser provides (imports from "env").
#define HOST(name) __attribute__((import_module("env"), import_name(#name)))
HOST(PlatformHostLog) void PlatformHostLog(const char *message);
HOST(PlatformHostHalt) void PlatformHostHalt(const char *reason) __attribute__((noreturn));
HOST(PlatformHostSoftReset) void PlatformHostSoftReset(void) __attribute__((noreturn));
// The local date and time: year, month (1-12), day, weekday (0 Sunday), hour, minute, second.
HOST(PlatformHostTime) void PlatformHostTime(s32 *out);
// A frame is done (the VBlank): its lines are in gPlatformFrame. `count` counts VBlanks since power-on.
HOST(PlatformHostVBlank) void PlatformHostVBlank(u32 count);

// What the platform gives the browser (exports).
#define EXPORT(name) __attribute__((export_name(#name)))

void PlatformLogf(const char *fmt, ...);

#endif // PLATFORM_GBA_H
