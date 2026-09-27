// Replaces src/libgcnmultiboot.s: sending a program to a GameCube over the
// link port (Pokémon Colosseum's connection). No GameCube is ever connected:
// the struct stays in its idle state, so the game takes its normal path.

#include "global.h"
#include "libgcnmultiboot.h"

void GameCubeMultiBoot_Init(struct GcmbStruct *pStruct)
{
    CpuFill16(0, pStruct, sizeof(*pStruct));
}

void GameCubeMultiBoot_Main(struct GcmbStruct *pStruct)
{
    (void)pStruct;
}

void GameCubeMultiBoot_ExecuteProgram(struct GcmbStruct *pStruct)
{
    (void)pStruct;
}

void GameCubeMultiBoot_HandleSerialInterrupt(struct GcmbStruct *pStruct)
{
    (void)pStruct;
}

void GameCubeMultiBoot_Quit(void)
{
}
