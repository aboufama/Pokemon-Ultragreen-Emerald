// The browser's (and Node's) side of the platform: instantiate the compiled
// game, run it a frame at a time, give it the keys, the date and time and
// its save, and take its frames.
//
//   const game = await loadGame(wasmBytes, { log, time, flash });
//   game.init();
//   game.setKeys(KEYS.A | KEYS.START);
//   game.frame();
//   game.frameRGBA()  // Uint8ClampedArray, 240x160x4

export const KEYS = {
  A: 1, B: 2, SELECT: 4, START: 8, RIGHT: 16, LEFT: 32, UP: 64, DOWN: 128, R: 256, L: 512,
};

export const WIDTH = 240;
export const HEIGHT = 160;

/** The game halted (on the GBA: frozen for good). */
export class GameHalt extends Error {}
class SoftReset extends Error {}

/** Keys held, from names: "A+START" -> bits. */
export function keysFrom(text) {
  let bits = 0;
  for (const name of String(text || '').split(/[+ ,]/).filter(Boolean)) {
    const bit = KEYS[name.toUpperCase()];
    if (bit === undefined) throw new Error(`unknown key ${name}`);
    bits |= bit;
  }
  return bits;
}

/**
 * options.time(): [year, month (1-12), day, weekday (0 Sunday), hour, minute, second]
 *   (default: the device's local time)
 * options.flash: Uint8Array(128 KB) to start from (a save), or undefined (blank)
 * options.log(text)
 * options.onVBlank(count): a frame is done (count VBlanks since power-on);
 *   the frame is in frameRGBA(), and keys set now are the next frame's.
 */
export async function loadGame(bytes, options = {}) {
  const log = options.log ?? ((t) => console.log(`[game] ${t}`));
  const time = options.time ?? (() => {
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getDay(), d.getHours(), d.getMinutes(), d.getSeconds()];
  });
  const module = bytes instanceof WebAssembly.Module ? bytes : await WebAssembly.compile(bytes);
  let exports;
  let memory;
  const text = (ptr) => {
    const b = new Uint8Array(memory.buffer, ptr);
    let n = 0;
    while (b[n]) n++;
    return new TextDecoder('latin1').decode(b.subarray(0, n));
  };
  const env = {
    PlatformHostLog: (ptr) => log(text(ptr)),
    PlatformHostHalt: (ptr) => { throw new GameHalt(text(ptr)); },
    PlatformHostSoftReset: () => { throw new SoftReset(); },
    PlatformHostTime: (ptr) => {
      const t = time();
      new Int32Array(memory.buffer, ptr, 7).set(t);
    },
    PlatformHostVBlank: (count) => options.onVBlank?.(count),
  };
  let flash = options.flash ? new Uint8Array(options.flash) : null;
  let rtcOffset = 0;

  function instantiate() {
    exports = new WebAssembly.Instance(module, { env }).exports;
    memory = exports.memory;
    const view = new Uint8Array(memory.buffer, exports.PlatformFlashData(), exports.PlatformFlashSize());
    if (flash) view.set(flash);
    else exports.PlatformFlashErase();
    exports.PlatformSetRtcOffset(rtcOffset);
  }

  const game = {
    exports: () => exports,
    memory: () => memory,
    init() {
      instantiate();
      exports.PlatformInit();
    },
    /**
     * One iteration of the game's main loop and its wait for the VBlank: a
     * frame, or more when the GBA would lag (onVBlank sees each).
     */
    frame() {
      try {
        exports.PlatformFrame();
      } catch (e) {
        if (e instanceof SoftReset) {
          // A soft reset: RAM and hardware start over, the cartridge stays.
          flash = game.flash().slice();
          rtcOffset = exports.PlatformRtcOffset();
          game.init();
          return true;
        }
        throw e;
      }
      return true;
    },
    setKeys(bits) {
      exports.PlatformSetKeys(bits);
    },
    /** VBlanks since power-on (the GBA's frames). */
    vblanks: () => exports.PlatformVBlankCount(),
    /** The last frame, RGBA. */
    frameRGBA() {
      return new Uint8ClampedArray(memory.buffer, exports.PlatformFrameBuffer(), WIDTH * HEIGHT * 4);
    },
    /** The cartridge's flash (a view: copy it to keep it). */
    flash() {
      return new Uint8Array(memory.buffer, exports.PlatformFlashData(), exports.PlatformFlashSize());
    },
    /** Whether the game wrote its save since the last call. */
    saved: () => exports.PlatformFlashTakeWrites() > 0,
    rtcOffset: () => exports.PlatformRtcOffset(),
  };
  return game;
}
