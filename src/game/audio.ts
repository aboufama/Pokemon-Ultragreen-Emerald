// The compiled game's sound in the browser: the stereo samples the GBA's
// sound hardware produces (the game's own m4a engine mixing its songs,
// platform/src/apu.c) played as they come, frame by frame.
//
//   const audio = GameAudio.open();       // null without Web Audio
//   audio?.push(game.readAudio(), game.audioRate());  // after each frame
//
// The samples are resampled to the audio device's rate and queued in an
// AudioWorklet (a ScriptProcessorNode where a worklet can't load). The queue
// keeps a few frames ahead of the device: when the game runs behind (a slow
// frame) the device plays silence until the queue fills again, and when it
// runs ahead the oldest samples go, so the sound stays with the picture. The
// audio starts, and keeps playing on phones, as src/audio/output.ts says.

import { AudioOutput } from '../audio/output';

/** How far ahead of the device the queue runs before it plays (seconds) and at most. */
const START_AHEAD = 0.05;
const MAX_AHEAD = 0.2;

/** A queue of stereo samples the device plays in 128-sample quanta. */
function queueSource(): string {
  return `
class GameStream extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(Math.ceil(sampleRate) * 2 * 2);
    this.read = 0;
    this.count = 0;
    this.playing = false;
    this.startAt = Math.round(sampleRate * ${START_AHEAD});
    this.max = Math.round(sampleRate * ${MAX_AHEAD});
    this.port.onmessage = (e) => this.write(e.data);
  }
  write(chunk) {
    const cap = this.buffer.length / 2;
    const n = chunk.length / 2;
    for (let i = 0; i < n; i++) {
      const at = ((this.read + this.count) % cap) * 2;
      this.buffer[at] = chunk[i * 2];
      this.buffer[at + 1] = chunk[i * 2 + 1];
      if (this.count < cap) this.count++;
      else this.read = (this.read + 1) % cap;
    }
    // Too far ahead: drop the oldest, so the sound keeps with the picture.
    if (this.count > this.max) {
      const drop = this.count - this.max;
      this.read = (this.read + drop) % cap;
      this.count -= drop;
    }
  }
  process(inputs, outputs) {
    const out = outputs[0];
    if (!out || !out.length) return true;
    const left = out[0], right = out[1] || out[0];
    const cap = this.buffer.length / 2;
    if (!this.playing && this.count >= this.startAt) this.playing = true;
    for (let i = 0; i < left.length; i++) {
      if (!this.playing || this.count === 0) {
        this.playing = false;
        left[i] = 0;
        right[i] = 0;
        continue;
      }
      const at = this.read * 2;
      left[i] = this.buffer[at];
      right[i] = this.buffer[at + 1];
      this.read = (this.read + 1) % cap;
      this.count--;
    }
    return true;
  }
}
registerProcessor('game-stream', GameStream);
`;
}

export class GameAudio {
  private post: ((chunk: Float32Array) => void) | null = null;
  /** Resampling: where the next output sample falls between the last input sample and the next. */
  private phase = 0;
  private lastL = 0;
  private lastR = 0;

  private constructor(private readonly output: AudioOutput) {
    void this.connect();
  }

  static open(): GameAudio | null {
    const output = AudioOutput.open();
    return output ? new GameAudio(output) : null;
  }

  get running(): boolean {
    return this.output.running && !!this.post;
  }

  private async connect(): Promise<void> {
    const ctx = this.output.ctx;
    if (ctx.audioWorklet) {
      try {
        const url = URL.createObjectURL(new Blob([queueSource()], { type: 'application/javascript' }));
        await ctx.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);
        const node = new AudioWorkletNode(ctx, 'game-stream', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
        node.connect(ctx.destination);
        this.post = (chunk) => node.port.postMessage(chunk, [chunk.buffer]);
        return;
      } catch (e) {
        console.warn('audio: AudioWorklet unavailable, using a ScriptProcessorNode:', e);
      }
    }
    // No AudioWorklet: the same queue on the main thread.
    const Stream = new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', `${queueSource()}; return GameStream;`)(
      class { port = { onmessage: null as unknown }; },
      () => undefined,
      ctx.sampleRate,
    ) as new () => { write(chunk: Float32Array): void; process(i: unknown, o: Float32Array[][]): boolean };
    const queue = new Stream();
    const node = ctx.createScriptProcessor(1024, 0, 2);
    node.onaudioprocess = (e) => queue.process([], [[e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1)]]);
    node.connect(ctx.destination);
    this.post = (chunk) => queue.write(chunk);
  }

  /** A frame's sound: interleaved stereo 16-bit samples at `rate` (the game's), resampled for the device. */
  push(samples: Int16Array, rate: number): void {
    if (!this.post || samples.length === 0) return;
    const step = rate / this.output.ctx.sampleRate;
    const n = samples.length / 2;
    const out = new Float32Array(Math.ceil((n - this.phase) / step + 1) * 2);
    let o = 0;
    let pos = this.phase;
    while (pos < n) {
      const i = Math.floor(pos);
      const f = pos - i;
      const l0 = i === 0 ? this.lastL : samples[(i - 1) * 2] / 32768;
      const r0 = i === 0 ? this.lastR : samples[(i - 1) * 2 + 1] / 32768;
      const l1 = samples[i * 2] / 32768, r1 = samples[i * 2 + 1] / 32768;
      out[o++] = l0 + (l1 - l0) * f;
      out[o++] = r0 + (r1 - r0) * f;
      pos += step;
    }
    this.phase = pos - n;
    this.lastL = samples[(n - 1) * 2] / 32768;
    this.lastR = samples[(n - 1) * 2 + 1] / 32768;
    this.post(out.subarray(0, o).slice());
  }
}
