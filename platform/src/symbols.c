// The GBA's addresses of the game's variables.
//
// A few places in the game compare the addresses of different variables: the
// sound engine gives a channel, between two notes of the same priority, to
// the track at the lower address (ply_note). The GBA's linker lays out RAM
// (EWRAM, IWRAM) one way, wasm-ld lays out linear memory another, so those
// comparisons are made on the GBA's addresses: the build lists each of the
// game's global variables in RAM with its address on the GBA (from the ROM's
// symbols; platform/build.mjs writes build/wasm/gba_symbols.c), and
// PlatformGbaAddress translates a pointer into one of them.

#include "gba.h"
#include "platform.h"

struct PlatformGbaSymbol {
    const void *here;  // 0: not in this build
    u32 gba;
    u32 size;
};

extern const struct PlatformGbaSymbol gPlatformGbaSymbols[];
extern const u32 gPlatformGbaSymbolCount;

#define MAX_SYMBOLS 4096

// The symbols in this build, by address here.
static u16 sOrder[MAX_SYMBOLS];
static u32 sCount;
static int sSorted;

static u32 Here(u32 i)
{
    return (u32)(uintptr_t)gPlatformGbaSymbols[sOrder[i]].here;
}

static void Sort(void)
{
    sCount = 0;
    for (u32 i = 0; i < gPlatformGbaSymbolCount && sCount < MAX_SYMBOLS; i++) {
        if (gPlatformGbaSymbols[i].here)
            sOrder[sCount++] = (u16)i;
    }
    // Insertion sort, once: a few hundred symbols.
    for (u32 i = 1; i < sCount; i++) {
        u16 v = sOrder[i];
        u32 a = (u32)(uintptr_t)gPlatformGbaSymbols[v].here;
        u32 j = i;
        while (j > 0 && Here(j - 1) > a) {
            sOrder[j] = sOrder[j - 1];
            j--;
        }
        sOrder[j] = v;
    }
    sSorted = 1;
}

uint32_t PlatformGbaAddress(const void *p)
{
    u32 a = (u32)(uintptr_t)p;
    if (!a)
        return 0;
    if (!sSorted)
        Sort();
    // The last symbol that starts at or before p.
    u32 lo = 0, hi = sCount;
    while (lo < hi) {
        u32 mid = (lo + hi) / 2;
        if (Here(mid) <= a)
            lo = mid + 1;
        else
            hi = mid;
    }
    if (lo > 0) {
        const struct PlatformGbaSymbol *s = &gPlatformGbaSymbols[sOrder[lo - 1]];
        u32 start = (u32)(uintptr_t)s->here;
        if (a - start < (s->size ? s->size : 1))
            return s->gba + (a - start);
    }
    // Not one of the game's variables in RAM: its address here.
    return a;
}
