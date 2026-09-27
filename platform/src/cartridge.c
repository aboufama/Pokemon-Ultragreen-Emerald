// The cartridge's flash chip and real-time clock, as the platform keeps them
// (the drivers are platform/game/agb_flash.c and platform/game/siirtc.c).

#include "gba.h"
#include "platform.h"

#define FLASH_BYTES 0x20000

static u8 sFlash[FLASH_BYTES];
static u32 sFlashWrites;

// The clock's offset from the device's, in seconds (what the game set).
static s64 sRtcOffset;

uint8_t *PlatformFlash(void)
{
    return sFlash;
}

void PlatformFlashWritten(void)
{
    sFlashWrites++;
}

EXPORT(PlatformFlashData) u8 *PlatformFlashData(void)
{
    return sFlash;
}

EXPORT(PlatformFlashSize) u32 PlatformFlashSize(void)
{
    return FLASH_BYTES;
}

// How many writes since the browser last saved (and start counting again).
EXPORT(PlatformFlashTakeWrites) u32 PlatformFlashTakeWrites(void)
{
    u32 n = sFlashWrites;
    sFlashWrites = 0;
    return n;
}

EXPORT(PlatformFlashErase) void PlatformFlashErase(void)
{
    for (u32 i = 0; i < FLASH_BYTES; i++)
        sFlash[i] = 0xFF;
}

// Days since 1970-01-01 of a civil date (Howard Hinnant's algorithm).
static s64 DaysFromCivil(s32 y, s32 m, s32 d)
{
    y -= m <= 2;
    s32 era = (y >= 0 ? y : y - 399) / 400;
    s32 yoe = y - era * 400;
    s32 doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    s32 doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return (s64)era * 146097 + doe - 719468;
}

static void CivilFromDays(s64 z, s32 *y, s32 *m, s32 *d)
{
    z += 719468;
    s32 era = (s32)((z >= 0 ? z : z - 146096) / 146097);
    s32 doe = (s32)(z - (s64)era * 146097);
    s32 yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    s32 doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    s32 mp = (5 * doy + 2) / 153;
    *d = doy - (153 * mp + 2) / 5 + 1;
    *m = mp + (mp < 10 ? 3 : -9);
    *y = yoe + era * 400 + (*m <= 2);
}

static s64 HostSeconds(void)
{
    s32 t[7];
    PlatformHostTime(t);
    return DaysFromCivil(t[0], t[1], t[2]) * 86400 + t[4] * 3600 + t[5] * 60 + t[6];
}

void PlatformRtcNow(int32_t out[7])
{
    s64 s = HostSeconds() + sRtcOffset;
    s64 days = s >= 0 ? s / 86400 : (s - 86399) / 86400;
    s32 secs = (s32)(s - days * 86400);
    CivilFromDays(days, &out[0], &out[1], &out[2]);
    out[3] = (s32)(((days % 7) + 7 + 4) % 7);  // 1970-01-01 was a Thursday
    out[4] = secs / 3600;
    out[5] = secs / 60 % 60;
    out[6] = secs % 60;
}

void PlatformRtcSet(int32_t year, int32_t month, int32_t day, int32_t hour, int32_t minute, int32_t second)
{
    s64 target = DaysFromCivil(year, month, day) * 86400 + hour * 3600 + minute * 60 + second;
    sRtcOffset = target - HostSeconds();
}

EXPORT(PlatformRtcOffset) double PlatformRtcOffset(void)
{
    return (double)sRtcOffset;
}

EXPORT(PlatformSetRtcOffset) void PlatformSetRtcOffset(double seconds)
{
    sRtcOffset = (s64)seconds;
}
