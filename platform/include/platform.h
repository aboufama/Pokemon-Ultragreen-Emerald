// The platform's C API: what the patched decomp files (platform/patches) and
// the remake layer call. See docs/ARCHITECTURE.md.
#ifndef GUARD_PLATFORM_H
#define GUARD_PLATFORM_H

#include <stdint.h>

// The game halts (on the GBA: a halt loop, the screen frozen). Never returns.
void PlatformHalt(const char *reason) __attribute__((noreturn));

// The CPU spends `cycles` cycles (a delay loop): the platform's clock moves on
// and the hardware catches up (interrupts included).
void PlatformWaitCycles(uint32_t cycles);

// The main loop waits here until `*flag & mask` (WaitForVBlank's loop): the
// platform lets time pass after AgbMainFrame returns.
void PlatformWaitForFlag(volatile uint16_t *flag, uint16_t mask);

// A volatile access to I/O memory (0x04xxxxxx), with the hardware's behavior
// (platform/tools/volatile_io.mjs routes them here). `size` is 1, 2 or 4.
uint32_t PlatformIoRead(uint32_t addr, uint32_t size);
void PlatformIoWrite(uint32_t addr, uint32_t value, uint32_t size);

// The cartridge's real-time clock: the device's date and time, moved by what
// the game sets. out: year, month (1-12), day, weekday (0 = Sunday), hour,
// minute, second.
void PlatformRtcNow(int32_t out[7]);
void PlatformRtcSet(int32_t year, int32_t month, int32_t day, int32_t hour, int32_t minute, int32_t second);

// The cartridge's flash chip (128 KB), kept by the browser.
uint8_t *PlatformFlash(void);
void PlatformFlashWritten(void);

// The address a pointer into one of the game's variables in RAM has on the
// GBA, for comparisons of addresses the game makes (RAM is laid out
// differently here). Other pointers are returned as they are.
uint32_t PlatformGbaAddress(const void *p);

#endif // GUARD_PLATFORM_H
