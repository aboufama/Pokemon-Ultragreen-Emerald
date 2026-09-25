// Emerald's music and sound effects in the browser. The m4a engine
// (./m4a.ts) runs in an AudioWorklet, built from the engine class's own
// source, and the game calls it the way the decomp calls sound.c:
//
//   sound.playBGM('mus_vs_wild')      PlayBGM (a new BGM waits for a fade-out)
//   sound.fadeOutBGM(4)               FadeOutBGM
//   sound.playSE('se_select')         PlaySE
//   sound.playSEPanned('se_faint', 63) PlaySE12WithPanning (-64 left .. 63 right)
//   sound.stopSE('se_exp')            m4aSongNumStop
//   sound.fanfare('mus_level_up', 80) PlayFanfare (the BGM pauses, then resumes)
//
// Nothing sounds until enable() (the playtest calls it; tools, tests and the
// review pages stay silent) and until the browser lets audio start, which is
// the first key press or tap. A BGM asked for before then starts from its
// beginning at that moment; sound effects asked for before then are dropped.
// The songs are extracted from the decomp by tools/extract/extract_sound.py.

import { asset } from '../gba/assets';
import { M4AEngine, type SoundBank } from './m4a';

declare global {
  interface Window {
    /** The game's sound once enabled (tests read its state and history). */
    __sound?: Sound;
  }
}

/** Emerald's music players: BGM, then the three sound effect players. */
const BGM = 0;

type Message = { type: string; [k: string]: unknown };

/** The AudioWorklet: the engine class (self-contained) and a processor that renders it. */
function workletSource(): string {
  return `const M4AEngine = (${M4AEngine.toString()});
class M4AProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.engine = null;
    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'init') {
        try {
          this.engine = new M4AEngine(m.bank, new Int8Array(m.pcm), sampleRate);
          this.port.postMessage({ type: 'ready' });
        } catch (err) {
          this.port.postMessage({ type: 'error', message: String((err && err.stack) || err) });
        }
      } else if (this.engine) this.engine.message(m);
    };
  }
  process(inputs, outputs) {
    const out = outputs[0];
    if (!this.engine || !out || !out.length) return true;
    if (out.length > 1) this.engine.render(out[0], out[1]);
    else {
      const right = new Float32Array(out[0].length);
      this.engine.render(out[0], right);
      for (let i = 0; i < right.length; i++) out[0][i] = (out[0][i] + right[i]) / 2;
    }
    return true;
  }
}
registerProcessor('m4a', M4AProcessor);
`;
}

export class Sound {
  private ctx: AudioContext | null = null;
  private post: ((m: Message) => void) | null = null;
  private loading: Promise<void> | null = null;
  /** The BGM that should be playing (null after a stop or fade). */
  private bgm: string | null = null;
  private unlockPress = false;
  private analyser: AnalyserNode | null = null;
  private gestured = false;
  error: string | null = null;
  /** The last calls, newest last (for tests). */
  readonly history: string[] = [];

  private note(entry: string): void {
    this.history.push(entry);
    if (this.history.length > 200) this.history.shift();
  }

  /** Turn sound on: load the engine and the songs, and start audio on the first press. */
  enable(): void {
    if (this.ctx || typeof window === 'undefined') return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx({ latencyHint: 'interactive' });
    window.__sound = this;
    this.loading = this.load().catch((e: unknown) => {
      this.error = String(e);
      console.warn('sound:', e);
    });
    // Browsers start audio only from a user gesture (touchend on iOS).
    const gesture = () => {
      if (!this.gestured && this.ctx?.state !== 'running') this.unlockPress = true;
      this.gestured = true;
      if (!document.hidden) void this.ctx?.resume();
    };
    for (const type of ['keydown', 'pointerdown', 'pointerup', 'touchend', 'click']) window.addEventListener(type, gesture, { capture: true });
    // A hidden page pauses the game, and its sound with it.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void this.ctx?.suspend();
      else if (this.gestured) void this.ctx?.resume();
    });
  }

  /** The BGM that is playing (or waiting for a fade-out to end). */
  get currentBGM(): string | null {
    return this.bgm;
  }

  /** True once sound can be heard. */
  get running(): boolean {
    return !!this.post && this.ctx?.state === 'running';
  }

  /** True once, for the press that started audio (the title keeps showing for it). */
  takeUnlockPress(): boolean {
    const r = this.unlockPress;
    this.unlockPress = false;
    return r;
  }

  /** Resolves when the engine is loaded (or failed to load). */
  ready(): Promise<void> {
    return this.loading ?? Promise.resolve();
  }

  private async load(): Promise<void> {
    const ctx = this.ctx!;
    const [bank, pcm] = await Promise.all([
      fetch(asset('sound/bank.json')).then((r) => (r.ok ? (r.json() as Promise<SoundBank>) : Promise.reject(new Error(`bank.json: ${r.status}`)))),
      fetch(asset('sound/samples.bin')).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`samples.bin: ${r.status}`)))),
    ]);
    if (ctx.audioWorklet) {
      const url = URL.createObjectURL(new Blob([workletSource()], { type: 'application/javascript' }));
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const node = new AudioWorkletNode(ctx, 'm4a', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
      node.connect(ctx.destination);
      this.tap(node);
      await new Promise<void>((resolve, reject) => {
        node.port.onmessage = (e: MessageEvent<Message>) => {
          if (e.data.type === 'ready') resolve();
          else if (e.data.type === 'error') reject(new Error(String(e.data.message)));
        };
        node.port.postMessage({ type: 'init', bank, pcm }, [pcm]);
      });
      this.post = (m) => node.port.postMessage(m);
    } else {
      // No AudioWorklet (an insecure origin, an old browser): run the engine here.
      const engine = new M4AEngine(bank, new Int8Array(pcm), ctx.sampleRate);
      const node = ctx.createScriptProcessor(2048, 0, 2);
      node.onaudioprocess = (e) => engine.render(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1));
      node.connect(ctx.destination);
      this.tap(node);
      this.post = (m) => engine.message(m);
    }
    if (this.bgm) this.post({ type: 'bgm', song: this.bgm });
  }

  /** A meter on the output, for tests (level()). */
  private tap(node: AudioNode): void {
    this.analyser = this.ctx!.createAnalyser();
    this.analyser.fftSize = 2048;
    node.connect(this.analyser);
  }

  /** The output's level now (RMS of the last 2048 samples). */
  level(): number {
    const a = this.analyser;
    if (!a) return 0;
    const buf = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    return Math.sqrt(sum / buf.length);
  }

  /** PlayBGM: play a song on the BGM player (a song already playing carries on). */
  playBGM(song: string): void {
    if (!this.ctx || song === this.bgm) return;
    this.bgm = song;
    this.note(`bgm ${song}`);
    this.post?.({ type: 'bgm', song });
  }

  stopBGM(): void {
    if (this.ctx) this.note('stop bgm');
    this.bgm = null;
    this.post?.({ type: 'stop', player: BGM });
  }

  /** FadeOutBGM: `speed` frames per step, 16 steps. */
  fadeOutBGM(speed = 4): void {
    if (this.ctx) this.note('fade bgm');
    this.bgm = null;
    this.post?.({ type: 'fade', player: BGM, speed });
  }

  playSE(song: string): void {
    if (!this.running) return;
    this.note(`se ${song}`);
    this.post!({ type: 'start', song });
  }

  playSEPanned(song: string, pan: number): void {
    if (!this.running) return;
    this.note(`se ${song} ${pan}`);
    this.post!({ type: 'panned', song, pan });
  }

  stopSE(song: string): void {
    this.post?.({ type: 'stopSong', song });
  }

  /** PlayFanfare: the BGM pauses for `frames` frames while the fanfare plays. */
  fanfare(song: string, frames: number): void {
    if (!this.running) return;
    this.note(`fanfare ${song}`);
    this.post!({ type: 'fanfare', song, frames });
  }
}

/** The game's sound (silent until enabled). */
export const sound = new Sound();

/** Where a sound effect pans for a battler (SOUND_PAN_ATTACKER / SOUND_PAN_TARGET). */
export function panFor(side: 'player' | 'opponent'): number {
  return side === 'player' ? -64 : 63;
}
