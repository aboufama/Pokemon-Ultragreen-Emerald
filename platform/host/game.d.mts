// Types for game.mjs (the platform's host side), for the TypeScript pages.

export declare const KEYS: {
  A: number; B: number; SELECT: number; START: number; RIGHT: number; LEFT: number; UP: number; DOWN: number; R: number; L: number;
};
export declare const WIDTH: number;
export declare const HEIGHT: number;
export declare class GameHalt extends Error {}
export declare function keysFrom(text: string): number;

export interface GameOptions {
  time?: () => number[];
  flash?: Uint8Array;
  rtcOffset?: number;
  log?: (text: string) => void;
  onVBlank?: (count: number) => void;
  onFrameStart?: () => void;
  onInstance?: (exports: WebAssembly.Exports) => void;
}

export interface Game {
  exports(): WebAssembly.Exports;
  memory(): WebAssembly.Memory;
  init(): Promise<void>;
  frame(): boolean;
  setKeys(bits: number): void;
  vblanks(): number;
  frameRGBA(): Uint8ClampedArray;
  /** The sound's sample rate: stereo frames a second (65536). */
  audioRate(): number;
  /** The sound since the last call: interleaved stereo (left, right) 16-bit samples at audioRate(). */
  readAudio(): Int16Array;
  flash(): Uint8Array;
  saved(): boolean;
  rtcOffset(): number;
}

export declare function loadGame(bytes: BufferSource | WebAssembly.Module, options?: GameOptions): Promise<Game>;
