// The page's audio output: one AudioContext that starts on the first key
// press or tap and keeps playing on phones. The earlier playtest's sound
// (./sound.ts) and the compiled game's (src/game/audio.ts) both play
// through it.
//
// Browsers start audio only from a user gesture (touchend on iOS), so every
// press resumes it; a silent sound starts inside the press (older iOS unlocks
// Web Audio only on one); on iOS the page plays through the ring/silent
// switch as a video does (navigator.audioSession 'playback'; before Safari
// 16.4 a looping silent <audio> element does the same); iOS suspends the
// audio after a call or the app switcher ('interrupted'), and the next press
// resumes it. A hidden page suspends its audio.

export class AudioOutput {
  readonly ctx: AudioContext;
  private gestured = false;
  private unlockPress = false;
  /** Older iOS: a silent <audio> element keeping the page in the playback audio category. */
  private keepAlive: HTMLAudioElement | null = null;

  private static shared: AudioOutput | null = null;

  /** The page's audio output (one for the page, whoever asks), or null where there is no Web Audio. */
  static open(): AudioOutput | null {
    if (typeof window === 'undefined') return null;
    if (AudioOutput.shared) return AudioOutput.shared;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    AudioOutput.shared = Ctx ? new AudioOutput(new Ctx({ latencyHint: 'interactive' })) : null;
    return AudioOutput.shared;
  }

  private constructor(ctx: AudioContext) {
    this.ctx = ctx;
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) {
      try {
        session.type = 'playback';
      } catch {
        // Not settable here: the silent <audio> fallback below covers it.
      }
    }
    const gesture = () => {
      if (!this.gestured && ctx.state !== 'running') this.unlockPress = true;
      this.gestured = true;
      if (document.hidden) return;
      if (ctx.state !== 'running') {
        void ctx.resume();
        this.startSilence();
      }
      if (!session) this.playbackCategory();
    };
    for (const type of ['keydown', 'pointerdown', 'pointerup', 'touchend', 'click']) window.addEventListener(type, gesture, { capture: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void ctx.suspend();
      else if (this.gestured) void ctx.resume();
    });
  }

  /** True while sound can be heard. */
  get running(): boolean {
    return this.ctx.state === 'running';
  }

  /** True once, for the press that started audio (a title screen can keep showing for it). */
  takeUnlockPress(): boolean {
    const r = this.unlockPress;
    this.unlockPress = false;
    return r;
  }

  /** A one-sample silent sound started inside a gesture: older iOS unlocks Web Audio only on one. */
  private startSilence(): void {
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      src.connect(this.ctx.destination);
      src.start(0);
    } catch {
      // A closed or failed context: nothing to unlock.
    }
  }

  /**
   * Safari before 16.4 (no navigator.audioSession): a looping silent <audio>
   * element started in a gesture puts the page in the playback audio category,
   * so Web Audio plays with the ring/silent switch on silent.
   */
  private playbackCategory(): void {
    if (!/iP(hone|ad|od)|Macintosh.*Mobile/.test(navigator.userAgent) || (this.keepAlive && !this.keepAlive.paused)) return;
    if (!this.keepAlive) {
      this.keepAlive = new Audio(silentWav());
      this.keepAlive.loop = true;
      this.keepAlive.setAttribute('playsinline', '');
    }
    void this.keepAlive.play().catch(() => undefined);
  }
}

/** Half a second of silence as a WAV data URL (8 kHz, 8-bit mono). */
function silentWav(): string {
  const n = 4000;
  const bytes = new Uint8Array(44 + n);
  const view = new DataView(bytes.buffer);
  const text = (at: number, s: string) => [...s].forEach((c, i) => (bytes[at + i] = c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + n, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, n, true);
  bytes.fill(128, 44);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:audio/wav;base64,${btoa(bin)}`;
}
