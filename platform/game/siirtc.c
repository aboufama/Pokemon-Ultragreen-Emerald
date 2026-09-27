// Replaces src/siirtc.c: the cartridge's Seiko S-3511 real-time clock.
//
// The GBA driver talks to the chip bit by bit through the cartridge's GPIO
// port; here the clock is the device's (PlatformRtcNow), with the offset the
// game sets (SiiRtcSetDateTime) kept by the platform like the chip keeps its
// time. The chip is in 24-hour mode and never lost power. Each call takes as
// long as the GBA driver's (measured with platform/tools/timing.py; the
// transfer is about 550 cycles a byte).

// Cycles per call on the GBA.
#define CYCLES_GET_STATUS 1148
#define CYCLES_GET_TIME 2225
#define CYCLES_GET_DATE_TIME 4415
#define CYCLES_PROBE 3447
#define CYCLES_BYTE 550

#include "global.h"
#include "siirtc.h"
#include "platform.h"

static u8 sStatus = SIIRTCINFO_24HOUR;
static bool8 sLocked;

static u8 ToBcd(s32 v)
{
    return (u8)(((v / 10) % 10) << 4 | (v % 10));
}

static s32 FromBcd(u8 v)
{
    return (v >> 4) * 10 + (v & 0xF);
}

static void Fill(struct SiiRtcInfo *rtc)
{
    s32 t[7];
    PlatformRtcNow(t);
    rtc->year = ToBcd(t[0] % 100);
    rtc->month = ToBcd(t[1]);
    rtc->day = ToBcd(t[2]);
    rtc->dayOfWeek = ToBcd(t[3]);
    rtc->hour = ToBcd(t[4]);
    rtc->minute = ToBcd(t[5]);
    rtc->second = ToBcd(t[6]);
}

void SiiRtcUnprotect(void)
{
}

void SiiRtcProtect(void)
{
}

u8 SiiRtcProbe(void)
{
    PlatformWaitCycles(CYCLES_PROBE);
    // SiiRtcProbe's result for a chip in 24-hour mode, not in test mode.
    return 1;
}

bool8 SiiRtcReset(void)
{
    if (sLocked == TRUE)
        return FALSE;
    PlatformWaitCycles(CYCLES_BYTE * 2);
    PlatformRtcSet(2000, 1, 1, 0, 0, 0);
    sStatus = SIIRTCINFO_24HOUR;
    return TRUE;
}

bool8 SiiRtcGetStatus(struct SiiRtcInfo *rtc)
{
    PlatformWaitCycles(CYCLES_GET_STATUS);
    rtc->status = sStatus;
    return TRUE;
}

bool8 SiiRtcSetStatus(struct SiiRtcInfo *rtc)
{
    PlatformWaitCycles(CYCLES_GET_STATUS);
    sStatus = (rtc->status & (SIIRTCINFO_INTFE | SIIRTCINFO_INTME | SIIRTCINFO_INTAE)) | SIIRTCINFO_24HOUR;
    return TRUE;
}

bool8 SiiRtcGetDateTime(struct SiiRtcInfo *rtc)
{
    PlatformWaitCycles(CYCLES_GET_DATE_TIME);
    Fill(rtc);
    return TRUE;
}

bool8 SiiRtcSetDateTime(struct SiiRtcInfo *rtc)
{
    PlatformWaitCycles(CYCLES_GET_DATE_TIME);
    PlatformRtcSet(2000 + FromBcd(rtc->year), FromBcd(rtc->month), FromBcd(rtc->day),
                   FromBcd(rtc->hour), FromBcd(rtc->minute), FromBcd(rtc->second));
    return TRUE;
}

bool8 SiiRtcGetTime(struct SiiRtcInfo *rtc)
{
    struct SiiRtcInfo now;
    PlatformWaitCycles(CYCLES_GET_TIME);
    Fill(&now);
    rtc->hour = now.hour;
    rtc->minute = now.minute;
    rtc->second = now.second;
    return TRUE;
}

bool8 SiiRtcSetTime(struct SiiRtcInfo *rtc)
{
    struct SiiRtcInfo now;
    PlatformWaitCycles(CYCLES_GET_TIME);
    Fill(&now);
    PlatformRtcSet(2000 + FromBcd(now.year), FromBcd(now.month), FromBcd(now.day),
                   FromBcd(rtc->hour), FromBcd(rtc->minute), FromBcd(rtc->second));
    return TRUE;
}

bool8 SiiRtcSetAlarm(struct SiiRtcInfo *rtc)
{
    (void)rtc;
    return TRUE;
}
