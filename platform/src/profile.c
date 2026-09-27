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
    u8 counted[PROFILE_FUNCTIONS];     // 0: a call to it counts as its caller's own time (the host sets these)
    u32 calls[PROFILE_FUNCTIONS];
    u64 cycles[PROFILE_FUNCTIONS];     // inclusive: callees and interrupts included
    u64 self[PROFILE_FUNCTIONS];       // exclusive: less the game functions it called (and interrupted for)
    u64 code[PROFILE_FUNCTIONS];       // of those, its own code's (the time pass's; not the platform's: BIOS, DMA...)
};

// The game code's cycles alone (the time pass adds each block's here too).
u64 gPlatformGameCycles;

static struct Profile sProfile = { PROFILE_FUNCTIONS, { [0 ... PROFILE_FUNCTIONS - 1] = 1 } };

// A trace of the counted calls that start in frames [from, to) (the host
// sets them): the function, the frame, scanline and cycle it started at,
// and its inclusive time; in the order the calls return.
#define TRACE_ENTRIES 65536
struct TraceEntry {
    u32 fn, frame, line, unused;
    u64 start, cycles;
};
struct Trace {
    u32 from, to, count, unused;
    struct TraceEntry entries[TRACE_ENTRIES];
};
static struct Trace sTrace;

// The counted calls by caller and callee: how many, and the callee's time
// in them (inclusive and its own, each also as the game code's alone). One
// compiler inlines calls the other keeps: calibrate.py compares a function
// with the ROM's once the calls one side made and the other inlined are
// counted as the caller's time on both. An open-addressed table; the pairs
// that find it full are not counted.
#define PROFILE_PAIRS 32768
struct Pair {
    u32 caller, callee, calls, unused;
    u64 cycles, code, self, selfCode;
};
struct Pairs {
    u32 size, unused;
    struct Pair pairs[PROFILE_PAIRS];
};
static struct Pairs sPairs = { PROFILE_PAIRS };

static void CountPair(u32 caller, u32 callee, u64 cycles, u64 code, u64 self, u64 selfCode)
{
    u32 i = (caller * 2654435761u ^ callee * 40503u) % PROFILE_PAIRS;
    for (u32 n = 0; n < PROFILE_PAIRS; n++, i = (i + 1) % PROFILE_PAIRS) {
        struct Pair *p = &sPairs.pairs[i];
        if (p->calls == 0) {
            p->caller = caller;
            p->callee = callee;
        } else if (p->caller != caller || p->callee != callee) {
            continue;
        }
        p->calls++;
        p->cycles += cycles;
        p->code += code;
        p->self += self;
        p->selfCode += selfCode;
        return;
    }
}

struct Frame {
    u32 fn, frame, line;
    u64 start, startCode;          // the clocks at the call
    u64 callees, calleesCode;      // the callees' inclusive time
};
static struct Frame sStack[PROFILE_DEPTH];
static u32 sDepth;

void PlatformProfileEnter(u32 fn)
{
    if (fn < PROFILE_FUNCTIONS && !sProfile.counted[fn])
        return;
    if (sDepth < PROFILE_DEPTH)
        sStack[sDepth] = (struct Frame){ fn, PlatformVBlanks(), PlatformLine(), gPlatformCycles, gPlatformGameCycles, 0, 0 };
    sDepth++;
}

void PlatformProfileExit(u32 fn)
{
    if (sDepth == 0 || (fn < PROFILE_FUNCTIONS && !sProfile.counted[fn]))
        return;
    sDepth--;
    if (sDepth < PROFILE_DEPTH) {
        struct Frame *frame = &sStack[sDepth];
        u64 total = gPlatformCycles - frame->start, code = gPlatformGameCycles - frame->startCode;
        u32 f = frame->fn;
        if (f == fn && f < PROFILE_FUNCTIONS) {
            sProfile.calls[f]++;
            sProfile.cycles[f] += total;
            sProfile.self[f] += total - frame->callees;
            sProfile.code[f] += code - frame->calleesCode;
            if (sDepth > 0 && sDepth - 1 < PROFILE_DEPTH)
                CountPair(sStack[sDepth - 1].fn, f, total, code, total - frame->callees, code - frame->calleesCode);
        }
        if (frame->frame >= sTrace.from && frame->frame < sTrace.to && sTrace.count < TRACE_ENTRIES)
            sTrace.entries[sTrace.count++] = (struct TraceEntry){ f, frame->frame, frame->line, 0, frame->start, total };
        if (sDepth > 0 && sDepth - 1 < PROFILE_DEPTH) {
            sStack[sDepth - 1].callees += total;
            sStack[sDepth - 1].calleesCode += code;
        }
    }
}

EXPORT(PlatformProfile) struct Profile *PlatformProfile(void)
{
    return &sProfile;
}

EXPORT(PlatformProfileTrace) struct Trace *PlatformProfileTrace(void)
{
    return &sTrace;
}

EXPORT(PlatformProfilePairs) struct Pairs *PlatformProfilePairs(void)
{
    return &sPairs;
}
