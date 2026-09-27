// The sound chip. TEMPORARY: register writes are only stored; the sound
// engine's port brings the mixing and the four GB channels here.

#include "gba.h"

void PlatformSoundRegWrite(u32 off, u16 old, u16 value)
{
    (void)off;
    (void)old;
    (void)value;
}
