// Replaces src/agb_flash*.c: the cartridge's 1 Mbit flash chip.
//
// The GBA driver sends the chip its command sequences and runs its read loop
// from RAM; here the chip is the platform's 128 KB (PlatformFlash, kept by
// the browser), with the chip's behavior: erasing sets a 4 KB sector to 0xFF,
// programming can only clear bits. Identifying the chip takes as long as the
// GBA driver's two delay loops: 930295 cycles on the ROM, less what the
// platform runs as it comes: the interrupts taken meanwhile (8820) and the
// sound DMA's 92 transfers to the FIFOs (10 cycles each).

#define CYCLES_IDENTIFY 920555
// Reading: the GBA driver's loop from RAM, about 22 cycles a byte (a 4 KB
// sector in 90821).
#define CYCLES_READ_BASE 709
#define CYCLES_READ_BYTE 22

#include "global.h"
#include "agb_flash.h"
#include "gba/flash_internal.h"
#include "platform.h"

#define SECTOR_BYTES 0x1000
#define SECTORS 32

static u16 EraseSector(u16 sectorNum)
{
    if (sectorNum >= SECTORS)
        return 0x80FF;
    u8 *flash = PlatformFlash();
    for (u32 i = 0; i < SECTOR_BYTES; i++)
        flash[sectorNum * SECTOR_BYTES + i] = 0xFF;
    PlatformFlashWritten();
    return 0;
}

static u16 ProgramByte(u16 sectorNum, u32 offset, u8 data)
{
    if (sectorNum >= SECTORS || offset >= SECTOR_BYTES)
        return 0x80FF;
    PlatformFlash()[sectorNum * SECTOR_BYTES + offset] &= data;
    PlatformFlashWritten();
    return 0;
}

static u16 ProgramSector(u16 sectorNum, u8 *src)
{
    u16 result = EraseSector(sectorNum);
    if (result)
        return result;
    u8 *flash = PlatformFlash() + sectorNum * SECTOR_BYTES;
    for (u32 i = 0; i < SECTOR_BYTES; i++)
        flash[i] &= src[i];
    gFlashNumRemainingBytes = 0;
    return 0;
}

static u16 EraseChip(void)
{
    for (u16 s = 0; s < SECTORS; s++)
        EraseSector(s);
    return 0;
}

u16 gFlashNumRemainingBytes;
u16 (*ProgramFlashByte)(u16, u32, u8) = ProgramByte;
u16 (*ProgramFlashSector)(u16, u8 *) = ProgramSector;
u16 (*EraseFlashChip)(void) = EraseChip;
u16 (*EraseFlashSector)(u16) = EraseSector;
u8 gFlashTimeoutFlag;

u16 IdentifyFlash(void)
{
    PlatformWaitCycles(CYCLES_IDENTIFY);
    return 0;
}

u16 SetFlashTimerIntr(u8 timerNum, void (**intrFunc)(void))
{
    (void)timerNum;
    (void)intrFunc;
    return 0;
}

void ReadFlash(u16 sectorNum, u32 offset, u8 *dest, u32 size)
{
    const u8 *flash = PlatformFlash();
    PlatformWaitCycles(CYCLES_READ_BASE + size * CYCLES_READ_BYTE);
    u32 at = sectorNum * SECTOR_BYTES + offset;
    for (u32 i = 0; i < size && at + i < SECTORS * SECTOR_BYTES; i++)
        dest[i] = flash[at + i];
}

u32 VerifyFlashSector(u16 sectorNum, u8 *src)
{
    const u8 *flash = PlatformFlash() + sectorNum * SECTOR_BYTES;
    for (u32 i = 0; i < SECTOR_BYTES; i++)
        if (flash[i] != src[i])
            return sectorNum * SECTOR_BYTES + i + 1;
    return 0;
}

u32 ProgramFlashSectorAndVerify(u16 sectorNum, u8 *src)
{
    for (int tries = 0; tries < 3; tries++) {
        if (ProgramFlashSector(sectorNum, src) == 0 && VerifyFlashSector(sectorNum, src) == 0)
            return 0;
    }
    return 1;
}
