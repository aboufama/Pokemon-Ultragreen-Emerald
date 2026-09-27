// What tools/arena/check.mjs needs from the app, bundled as one module.
export { ARENAS, arenaSeed, paintArena } from '../../src/render3d/arena';
export { MAT } from '../../src/render3d/arena/art';
export { battlerBox } from '../../src/render3d/arena/design';
export { propRect } from '../../src/render3d/arena/props';
export { BATTLE_CAMERA, groundPointAt, makeBattleCamera } from '../../src/render3d/stage';
