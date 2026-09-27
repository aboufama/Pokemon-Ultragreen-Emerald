// The browser's (and Node's) side of the platform: instantiate the compiled
// game, run it a frame at a time, give it the keys, the date and time and
// its save, and take its frames and its sound.
//
//   const game = await loadGame(wasmBytes, { log, time, flash });
//   await game.init();
//   game.setKeys(KEYS.A | KEYS.START);
//   if (!game.frame()) await game.init();  // false: the game soft-reset
//   game.frameRGBA()  // Uint8ClampedArray, 240x160x4
//   game.readAudio()  // Int16Array, stereo, at game.audioRate() (65536 Hz)

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
 * options.rtcOffset: the clock's offset (seconds) the game set, from rtcOffset()
 * options.log(text)
 * options.onVBlank(count): a frame is done (count VBlanks since power-on);
 *   the frame is in frameRGBA(), and keys set now are the next frame's.
 * options.onFrameStart(): a frame is about to be drawn (line 0): the
 *   hardware's OAM, palettes and registers are the frame's (the remake layer
 *   fills its pictures for it, src/remake/layer.ts).
 * options.onInstance(exports): the game was instantiated (power on, soft
 *   reset) and is about to start (tools set up their hooks here).
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
    PlatformHostFrameStart: () => options.onFrameStart?.(),
  };
  let flash = options.flash ? new Uint8Array(options.flash) : null;
  let rtcOffset = options.rtcOffset ?? 0;
  // Stereo frames of sound read so far (counting as PlatformAudioWritten
  // does, wrapping at 2^32).
  let audioRead = 0;

  async function instantiate() {
    exports = (await WebAssembly.instantiate(module, { env })).exports;
    memory = exports.memory;
    const view = new Uint8Array(memory.buffer, exports.PlatformFlashData(), exports.PlatformFlashSize());
    if (flash) view.set(flash);
    else exports.PlatformFlashErase();
    exports.PlatformSetRtcOffset(rtcOffset);
    audioRead = 0;
    options.onInstance?.(exports);
  }

  const game = {
    exports: () => exports,
    memory: () => memory,
    /** Power on: a fresh GBA with the cartridge's save and clock. */
    async init() {
      await instantiate();
      exports.PlatformInit();
    },
    /**
     * One iteration of the game's main loop and its wait for the VBlank: a
     * frame, or more when the GBA would lag (onVBlank sees each). Returns
     * false when the game soft-reset: call init() (RAM and hardware start
     * over, the cartridge keeps its save and clock).
     */
    frame() {
      try {
        exports.PlatformFrame();
      } catch (e) {
        if (e instanceof SoftReset) {
          flash = game.flash().slice();
          rtcOffset = exports.PlatformRtcOffset();
          return false;
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
    /** The sound's rate: stereo frames a second (the GBA's DAC, 65536). */
    audioRate: () => exports.PlatformAudioRate(),
    /**
     * The sound played since the last call, up to now: interleaved stereo
     * (left, right) 16-bit samples at audioRate(). The game keeps a second
     * of it; read at least that often (once a frame: about 1097 frames), or
     * the oldest is lost.
     */
    readAudio() {
      const written = exports.PlatformAudioWritten() >>> 0;
      const capacity = exports.PlatformAudioCapacity();
      let n = (written - audioRead) >>> 0;
      if (n > capacity) {
        audioRead = (written - capacity) >>> 0;
        n = capacity;
      }
      const ring = new Int16Array(memory.buffer, exports.PlatformAudioBuffer(), capacity * 2);
      const out = new Int16Array(n * 2);
      const from = audioRead % capacity;
      const first = Math.min(n, capacity - from);
      out.set(ring.subarray(from * 2, (from + first) * 2), 0);
      if (first < n) out.set(ring.subarray(0, (n - first) * 2), first * 2);
      audioRead = written;
      return out;
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
