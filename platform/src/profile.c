// A profile of the game's functions in the platform's CPU time, for
// calibrating the time model against the GBA (platform/tools/profile.mjs).
// Only a profile build (platform/build.mjs --profile) calls these: the time
// pass (tools/cpu_time.mjs) brackets every game function with them, the id
// being the function's address (its function table index).

#include "gba.h"

#define PROFILE_FUNCTIONS 16384
#define PROFILE_DEPTH 256

struct Profile {
    u32 functions;
    u32 calls[PROFILE_FUNCTIONS];
    u64 cycles[PROFILE_FUNCTIONS];     // inclusive: callees and interrupts included
};

static struct Profile sProfile = { PROFILE_FUNCTIONS };
static u32 sStackFn[PROFILE_DEPTH];
static u64 sStackStart[PROFILE_DEPTH];
static u32 sDepth;

void PlatformProfileEnter(u32 fn)
{
    if (sDepth < PROFILE_DEPTH) {
        sStackFn[sDepth] = fn;
        sStackStart[sDepth] = gPlatformCycles;
    }
    sDepth++;
}

void PlatformProfileExit(u32 fn)
{
    if (sDepth == 0)
        return;
    sDepth--;
    if (sDepth < PROFILE_DEPTH) {
        u32 f = sStackFn[sDepth];
        if (f == fn && f < PROFILE_FUNCTIONS) {
            sProfile.calls[f]++;
            sProfile.cycles[f] += gPlatformCycles - sStackStart[sDepth];
        }
    }
}

EXPORT(PlatformProfile) struct Profile *PlatformProfile(void)
{
    return &sProfile;
}
