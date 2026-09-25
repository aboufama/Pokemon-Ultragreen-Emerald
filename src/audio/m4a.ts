// Emerald's sound engine (MusicPlayer2000, "m4a"), ported from the decomp
// (src/m4a.c, src/m4a_1.s, src/m4a_tables.c) to play the game's own songs:
//
//   - four music players (BGM, SE1, SE2, SE3), 16 tracks each at most, running
//     the songs' m4a bytecode at 60 Hz (MPlayMain): tempo, notes, ties, waits,
//     patterns, repeats, volume / pan / bend / LFO, priorities, fades;
//   - five DirectSound channels (Emerald's m4aSoundMode) with the envelopes of
//     SoundMainRAM, mixed at the DMA's 13379 Hz with its linear interpolation
//     into 8-bit buffers that wrap like the GBA's, plus the 7-frame reverb;
//   - the four GB channels (square with sweep, square, wave, noise) driven by
//     CgbSound's register writes, on a model of the GBA's PSG hardware;
//   - the GBA's output stage: DirectSound (heard a frame after it is mixed, as
//     the DMA plays it) at 100% and the PSG through NR50 and SOUNDCNT_H,
//     clipped to 10 bits, then the analog stage (a DC blocker, a low-pass);
//   - what sound.c adds for the game: fanfares that pause the BGM, panned
//     sound effects, a new BGM waiting for the old one's fade-out.
//
// Checked against the game in mGBA (tools/sound/reference/run.py): the
// DirectSound samples are the game's own, bit for bit, and the GB channels
// match in level and spectrum. The class is self-contained (no module-level
// helpers, no class fields) so its source can run inside an AudioWorklet
// (see ./sound.ts).

export interface SongData {
  data: string; // base64 bytecode of every track, labels as offsets into it
  tracks: number[];
  priority: number;
  reverb: number;
  voicegroup: string;
  player: number;
}

export interface VoiceData {
  type: number;
  key?: number;
  length?: number;
  panSweep?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  sample?: string;
  duty?: number;
  period?: number;
  wave?: string;
  group?: string;
  split?: string;
}

export interface SoundBank {
  songs: Record<string, SongData>;
  voicegroups: Record<string, { start: number; voices: VoiceData[] }>;
  keysplits: Record<string, number[]>;
  waves: Record<string, number[]>;
  samples: Record<string, { offset: number; size: number; freq: number; loopStart: number; loop: boolean }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class M4AEngine {
  declare rate: number;
  declare songs: Record<string, any>;
  declare players: any[];
  declare chans: any[];
  declare cgb: any[];
  declare reverb: number;
  declare maxChans: number;
  declare masterVolume: number;
  declare c15: number;
  declare T: any;
  declare ringA: Int8Array;
  declare ringB: Int8Array;
  declare seg: number;
  declare frameA: Int8Array;
  declare frameB: Int8Array;
  declare playA: Int8Array;
  declare playB: Int8Array;
  declare framePos: number;
  declare dsPos: number;
  declare psg: any;
  declare dcL: number;
  declare dcR: number;
  declare prevL: number;
  declare prevR: number;
  declare lpL: number;
  declare lpR: number;
  declare dcK: number;
  declare lpK: number;
  declare gain: number;
  /** The analog stage (DC blocker, gentle low-pass); off gives the raw 10-bit mix, like mGBA. */
  declare filter: boolean;
  /** Frames until a fanfare hands back to the BGM (Task_Fanfare), or -1. */
  declare fanfareCount: number;
  /** A BGM waiting for the current one to fade out. */
  declare nextBgm: string | null;

  constructor(bank: SoundBank, pcm: Int8Array, rate: number) {
    this.rate = rate;
    this.gain = 0.9;
    this.filter = true;
    this.fanfareCount = -1;
    this.nextBgm = null;
    // m4a_tables.c
    this.T = {
      clock: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 30, 32, 36, 40, 42, 44, 48, 52, 54, 56, 60, 64, 66, 68, 72, 76, 78, 80, 84, 88, 90, 92, 96],
      scale: [] as number[],
      freq: [2147483648, 2275179671, 2410468894, 2553802834, 2705659852, 2866546760, 3037000500, 3217589947, 3408917802, 3611622603, 3826380858, 4053909305],
      cgbScale: [] as number[],
      cgbFreq: [-2004, -1891, -1785, -1685, -1591, -1501, -1417, -1337, -1262, -1192, -1125, -1062],
      noise: [0xd7, 0xd6, 0xd5, 0xd4, 0xc7, 0xc6, 0xc5, 0xc4, 0xb7, 0xb6, 0xb5, 0xb4, 0xa7, 0xa6, 0xa5, 0xa4, 0x97, 0x96, 0x95, 0x94, 0x87, 0x86, 0x85, 0x84, 0x77, 0x76, 0x75, 0x74, 0x67, 0x66, 0x65, 0x64, 0x57, 0x56, 0x55, 0x54, 0x47, 0x46, 0x45, 0x44, 0x37, 0x36, 0x35, 0x34, 0x27, 0x26, 0x25, 0x24, 0x17, 0x16, 0x15, 0x14, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01, 0x00],
      cgb3Vol: [0x00, 0x00, 0x60, 0x60, 0x60, 0x60, 0x40, 0x40, 0x40, 0x40, 0x80, 0x80, 0x80, 0x80, 0x20, 0x20],
      spf: 224, // pcmSamplesPerVBlank at 13379 Hz
      pcmFreq: 16777216 / 1254, // the DMA's real rate: timer 0 reloads every 1254 cycles (13379 Hz nominal)
      divFreq: 627, // (16777216 / 13379 + 1) >> 1
      dmaPeriod: 7, // PCM_DMA_BUF_SIZE / spf
    };
    for (let o = 14; o >= 0; o--) for (let n = 0; n < 12; n++) this.T.scale.push((o << 4) | n);
    for (let o = 0; o <= 10; o++) for (let n = 0; n < 12; n++) this.T.cgbScale.push((o << 4) | n);

    // The bank: samples, waves, voicegroups resolved into tone data.
    const samples: Record<string, any> = {};
    for (const [name, s] of Object.entries(bank.samples)) {
      samples[name] = { data: pcm.subarray(s.offset, s.offset + s.size), size: s.size, freq: s.freq, loopStart: s.loopStart, loop: s.loop, reversed: null };
    }
    const groups: Record<string, any> = {};
    const tone = (v: VoiceData): any => {
      if (!v || v.type < 0) return null;
      if (v.type === 0x40 || v.type === 0x80) return { type: v.type, key: 0, length: 0, panSweep: 0, group: v.group, split: v.split ? bank.keysplits[v.split] : null, attack: 0, decay: 0, sustain: 0, release: 0 };
      let wav: any = 0;
      if (v.sample !== undefined) wav = samples[v.sample] ?? null;
      else if (v.duty !== undefined) wav = v.duty;
      else if (v.period !== undefined) wav = v.period;
      else if (v.wave !== undefined) wav = bank.waves[v.wave] ?? null;
      return { type: v.type, key: v.key ?? 60, length: v.length ?? 0, panSweep: v.panSweep ?? 0, wav, attack: v.attack ?? 0, decay: v.decay ?? 0, sustain: v.sustain ?? 0, release: v.release ?? 0 };
    };
    for (const [name, g] of Object.entries(bank.voicegroups)) groups[name] = { start: g.start, voices: g.voices.map(tone) };
    for (const g of Object.values(groups)) for (const t of g.voices) if (t && (t.type === 0x40 || t.type === 0x80)) t.wav = groups[t.group] ?? null;
    this.songs = {};
    for (const [name, s] of Object.entries(bank.songs)) {
      this.songs[name] = { name, data: this.base64(s.data), tracks: s.tracks, priority: s.priority, reverb: s.reverb, tone: groups[s.voicegroup], player: s.player };
    }

    // SoundInfo after m4aSoundInit (Emerald: 5 channels, master volume 12, 13379 Hz).
    this.reverb = 0;
    this.maxChans = 5;
    this.masterVolume = 12;
    this.c15 = 0;
    this.chans = [];
    for (let i = 0; i < 12; i++) this.chans.push(this.newChannel(false, 0));
    this.cgb = [];
    for (let i = 0; i < 4; i++) {
      const c = this.newChannel(true, i + 1);
      c.panMask = [0x11, 0x22, 0x44, 0x88][i];
      this.cgb.push(c);
    }
    // gMPlayTable: BGM 10 tracks, SE1 3, SE2 9, SE3 1 (tracks laid out in that order).
    this.players = [];
    let order = 0;
    for (const [n, unkB] of [[10, 0], [3, 1], [9, 1], [1, 0]]) {
      const tracks = [];
      for (let i = 0; i < n; i++) tracks.push(this.newTrack(order++));
      this.players.push({ song: null, status: 0x80000000, tracks, trackCount: n, priority: 0, clock: 0, tempoD: 150, tempoU: 0x100, tempoI: 150, tempoC: 0, fadeOI: 0, fadeOC: 0, fadeOV: 0, tone: null, unkB });
    }
    const spf = this.T.spf;
    this.ringA = new Int8Array(spf * this.T.dmaPeriod);
    this.ringB = new Int8Array(spf * this.T.dmaPeriod);
    this.seg = 0;
    this.frameA = new Int8Array(spf);
    this.frameB = new Int8Array(spf);
    this.playA = new Int8Array(spf);
    this.playB = new Int8Array(spf);
    this.framePos = spf; // start with a fresh frame
    this.dsPos = 0;
    this.dcL = this.dcR = this.prevL = this.prevR = 0;
    this.lpL = this.lpR = 0;
    // The analog stage at any output rate: a DC blocker at 5 Hz, a low-pass at 10 kHz.
    this.dcK = Math.exp((-2 * Math.PI * 5) / rate);
    this.lpK = 1 - Math.exp((-2 * Math.PI * 10000) / rate);
    this.psg = this.newPsg();
  }

  // --- API (m4aSongNumStart, m4aMPlayStop, m4aMPlayContinue, m4aMPlayFadeOut) ---

  /** Start a song on its music player (what m4aSongNumStart does). */
  start(name: string): void {
    const song = this.songs[name];
    if (song) this.mplayStart(this.players[song.player], song);
  }

  stop(player: number): void {
    const p = this.players[player];
    p.status |= 0x80000000;
    for (const t of p.tracks) this.trackStop(t);
  }

  /** Resume a stopped player where it was (m4aMPlayContinue). */
  resume(player: number): void {
    this.players[player].status &= 0x7fffffff;
  }

  /** Fade a player out, `speed` frames per step of 4/64 (m4aMPlayFadeOut). */
  fadeOut(player: number, speed: number): void {
    const p = this.players[player];
    p.fadeOC = p.fadeOI = speed;
    p.fadeOV = 64 << 2;
  }

  /** The song a player is on, if it is still playing. */
  playing(player: number): string | null {
    const p = this.players[player];
    return p.song && !(p.status & 0x80000000) && p.status & 0xffff ? p.song.name : null;
  }

  /** m4aSongNumStop: stop the song's player if that song is what it plays. */
  stopSong(name: string): void {
    const song = this.songs[name];
    if (song && this.players[song.player].song === song) this.stop(song.player);
  }

  /** PlaySE12WithPanning: a sound effect panned toward a side (-64 left .. 63 right). */
  startPanned(name: string, pan: number): void {
    this.start(name);
    for (const i of [1, 2]) {
      // m4aMPlayImmInit, then m4aMPlayPanpotControl on every track.
      for (const t of this.players[i].tracks) {
        if (!(t.flags & 0x80)) continue;
        if (t.flags & 0x40) this.trackStart(t);
        t.panX = pan;
        t.flags |= 0x03;
      }
    }
  }

  /** PlayFanfare: pause the BGM, play the fanfare and resume the BGM `frames` frames later (Task_Fanfare). */
  fanfare(name: string, frames: number): void {
    this.stop(0);
    this.start(name);
    this.fanfareCount = frames;
  }

  /** Start a BGM; while the current one fades out, it waits for the fade to end. */
  bgm(name: string): void {
    const p = this.players[0];
    if (p.fadeOI && !(p.fadeOV & 2) && !(p.status & 0x80000000)) this.nextBgm = name;
    else {
      this.nextBgm = null;
      this.start(name);
    }
  }

  /** The messages the page sends (see ./sound.ts). */
  message(m: any): void {
    switch (m.type) {
      case 'bgm': this.bgm(m.song); break;
      case 'start': this.start(m.song); break;
      case 'panned': this.startPanned(m.song, m.pan); break;
      case 'stopSong': this.stopSong(m.song); break;
      case 'stop': this.nextBgm = m.player === 0 ? null : this.nextBgm; this.stop(m.player); break;
      case 'resume': this.resume(m.player); break;
      case 'fade': this.nextBgm = m.player === 0 ? null : this.nextBgm; this.fadeOut(m.player, m.speed); break;
      case 'fanfare': this.fanfare(m.song, m.frames); break;
      case 'gain': this.gain = m.gain; break;
    }
  }

  // --- structures -------------------------------------------------------------

  newChannel(cgb: boolean, n: number): any {
    return {
      cgb, n, statusFlags: 0, type: 0, rightVolume: 0, leftVolume: 0, attack: 0, decay: 0, sustain: 0, release: 0, key: 0,
      envelopeVolume: 0, envelopeVolumeRight: 0, envelopeVolumeLeft: 0, envelopeGoal: 0, envelopeCounter: 0, sustainGoal: 0,
      pseudoEchoVolume: 0, pseudoEchoLength: 0, gateTime: 0, midiKey: 0, velocity: 0, priority: 0, rhythmPan: 0,
      count: 0, fw: 0, frequency: 0, wav: null, ptr: 0, track: null,
      n4: 0, pan: 0, panMask: 0, modify: 0, length: 0, sweep: 0, currentWave: null,
    };
  }

  newTrack(order: number): any {
    const t: any = { order, chans: [] as any[], cmdPtr: 0, patternStack: [0, 0, 0], song: null };
    this.clearTrack(t);
    t.flags = 0;
    return t;
  }

  /** Clear64byte: the track's state up to its tone data. */
  clearTrack(t: any): void {
    Object.assign(t, {
      flags: 0, wait: 0, patternLevel: 0, repN: 0, gateTime: 0, key: 0, velocity: 0, runningStatus: 0, keyM: 0, pitM: 0,
      keyShift: 0, keyShiftX: 0, tune: 0, pitX: 0, bend: 0, bendRange: 0, volMR: 0, volML: 0, vol: 0, volX: 0, pan: 0, panX: 0,
      modM: 0, mod: 0, modT: 0, lfoSpeed: 0, lfoSpeedC: 0, lfoDelay: 0, lfoDelayC: 0, priority: 0, pseudoEchoVolume: 0, pseudoEchoLength: 0,
      tone: { type: 0, key: 0, length: 0, panSweep: 0, wav: null, attack: 0, decay: 0, sustain: 0, release: 0, split: null },
      timer: 0, unk3C: 0,
    });
  }

  s8(v: number): number {
    return ((v & 0xff) ^ 0x80) - 0x80;
  }

  /** Decode base64 (an AudioWorklet has no atob). */
  base64(s: string): Uint8Array {
    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const clean = s.replace(/[^A-Za-z0-9+/]/g, '');
    const out = new Uint8Array((clean.length * 3) >> 2);
    let bits = 0, acc = 0, o = 0;
    for (let i = 0; i < clean.length; i++) {
      acc = (acc << 6) | abc.indexOf(clean[i]);
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out[o++] = (acc >> bits) & 0xff;
      }
    }
    return out;
  }

  // --- music players ----------------------------------------------------------

  mplayStart(p: any, song: any): void {
    const t0 = p.tracks[0];
    if (!p.unkB || ((!p.song || !(t0.flags & 0x40)) && ((p.status & 0xffff) === 0 || p.status & 0x80000000)) || p.priority <= song.priority) {
      p.status = 0;
      p.song = song;
      p.tone = song.tone;
      p.priority = song.priority;
      p.clock = 0;
      p.tempoD = 150;
      p.tempoI = 150;
      p.tempoU = 0x100;
      p.tempoC = 0;
      p.fadeOI = 0;
      for (let i = 0; i < p.trackCount; i++) {
        const t = p.tracks[i];
        this.trackStop(t);
        if (i < song.tracks.length) {
          t.flags = 0x80 | 0x40;
          t.chans = [];
          t.cmdPtr = song.tracks[i];
          t.song = song;
        } else t.flags = 0;
      }
      if (song.reverb & 0x80) this.reverb = song.reverb & 0x7f;
    }
  }

  trackStop(t: any): void {
    if (!(t.flags & 0x80)) return;
    for (const c of t.chans) {
      if (c.statusFlags !== 0) {
        if (c.cgb) this.cgbOscOff(c.n);
        c.statusFlags = 0;
      }
      c.track = null;
    }
    t.chans = [];
  }

  clearChain(c: any): void {
    const t = c.track;
    if (!t) return;
    const i = t.chans.indexOf(c);
    if (i >= 0) t.chans.splice(i, 1);
    c.track = null;
  }

  fadeOutBody(p: any): void {
    if (p.fadeOI === 0) return;
    if (--p.fadeOC !== 0) return;
    p.fadeOC = p.fadeOI;
    if (p.fadeOV & 2) {
      p.fadeOV = (p.fadeOV + (4 << 2)) & 0xffff;
      if (p.fadeOV >= 64 << 2) {
        p.fadeOV = 64 << 2;
        p.fadeOI = 0;
      }
    } else {
      p.fadeOV = (p.fadeOV - (4 << 2)) & 0xffff;
      if (((p.fadeOV << 16) >> 16) <= 0) {
        for (const t of p.tracks) {
          this.trackStop(t);
          if (!(p.fadeOV & 1)) t.flags = 0;
        }
        if (p.fadeOV & 1) p.status |= 0x80000000;
        else p.status = 0x80000000;
        p.fadeOI = 0;
        return;
      }
    }
    for (const t of p.tracks) {
      if (t.flags & 0x80) {
        t.volX = (p.fadeOV >> 2) & 0xff;
        t.flags |= 0x03;
      }
    }
  }

  trkVolPitSet(t: any): void {
    if (t.flags & 0x01) {
      let x = (t.vol * t.volX) >>> 5;
      if (t.modT === 1) x = (x * (this.s8(t.modM) + 128)) >>> 7;
      let y = 2 * t.pan + t.panX;
      if (t.modT === 2) y += this.s8(t.modM);
      if (y < -128) y = -128;
      else if (y > 127) y = 127;
      t.volMR = (((y + 128) * x) >>> 8) & 0xff;
      t.volML = (((127 - y) * x) >>> 8) & 0xff;
    }
    if (t.flags & 0x04) {
      const bend = t.bend * t.bendRange;
      let x = (t.tune + bend) * 4 + (t.keyShift << 8) + (t.keyShiftX << 8) + t.pitX;
      if (t.modT === 0) x += 16 * this.s8(t.modM);
      t.keyM = this.s8(x >> 8);
      t.pitM = x & 0xff;
    }
    t.flags &= ~(0x04 | 0x01);
  }

  /** umul3232H32: the high word of the 64-bit product of two u32s, exactly. */
  mulHi(a: number, b: number): number {
    const aH = Math.floor(a / 65536), aL = a % 65536, bH = Math.floor(b / 65536), bL = b % 65536;
    return aH * bH + Math.floor((aH * bL + aL * bH) / 65536 + (aL * bL) / 4294967296);
  }

  midiKeyToFreq(wav: any, key: number, fine: number): number {
    let fineShifted = fine * 16777216; // fineAdjust << 24
    if (key > 178) {
      key = 178;
      fineShifted = 255 * 16777216;
    }
    const T = this.T;
    const v1 = Math.floor(T.freq[T.scale[key] & 0xf] / 2 ** (T.scale[key] >> 4));
    const v2 = Math.floor(T.freq[T.scale[key + 1] & 0xf] / 2 ** (T.scale[key + 1] >> 4));
    return this.mulHi(wav.freq, v1 + this.mulHi(v2 - v1, fineShifted));
  }

  midiKeyToCgbFreq(ch: number, key: number, fine: number): number {
    const T = this.T;
    if (ch === 4) {
      key = key <= 20 ? 0 : Math.min(59, key - 21);
      return T.noise[key];
    }
    if (key <= 35) {
      fine = 0;
      key = 0;
    } else {
      key -= 36;
      if (key > 130) {
        key = 130;
        fine = 255;
      }
    }
    const v1 = T.cgbFreq[T.cgbScale[key] & 0xf] >> (T.cgbScale[key] >> 4);
    const v2 = T.cgbFreq[T.cgbScale[key + 1] & 0xf] >> (T.cgbScale[key + 1] >> 4);
    return v1 + ((fine * (v2 - v1)) >> 8) + 2048;
  }

  chnVolSet(c: any, t: any): void {
    const pan = c.rhythmPan;
    const r = ((((0x80 + pan) * c.velocity) | 0) * t.volMR) >> 14;
    c.rightVolume = r > 0xff ? 0xff : r;
    const l = ((((0x7f - pan) * c.velocity) | 0) * t.volML) >> 14;
    c.leftVolume = l > 0xff ? 0xff : l;
  }

  clearModM(t: any): void {
    t.modM = 0;
    t.lfoSpeedC = 0;
    t.flags |= t.modT === 0 ? 0x0c : 0x03;
  }

  /** A track's first tick (and m4aMPlayImmInit): Clear64byte and the defaults. */
  trackStart(t: any): void {
    this.clearTrack(t);
    t.flags = 0x80;
    t.bendRange = 2;
    t.volX = 64;
    t.lfoSpeed = 22;
    t.tone.type = 1;
  }

  /** MPlayMain: one frame of a music player. */
  mplayMain(p: any): void {
    if (p.status & 0x80000000) return;
    this.fadeOutBody(p);
    if (p.status & 0x80000000) return;
    p.tempoC += p.tempoI;
    while (p.tempoC >= 150) {
      let active = 0;
      for (let i = 0; i < p.trackCount; i++) {
        const t = p.tracks[i];
        if (!(t.flags & 0x80)) continue;
        active |= 1 << i;
        for (const c of t.chans.slice()) {
          if (c.statusFlags & 0xc7) {
            if (c.gateTime) {
              c.gateTime--;
              if (c.gateTime === 0) c.statusFlags |= 0x40;
            }
          } else this.clearChain(c);
        }
        if (t.flags & 0x40) this.trackStart(t);
        let stopped = false;
        while (t.wait === 0) {
          const data = t.song.data;
          const b = data[t.cmdPtr];
          let cmd;
          if (b < 0x80) cmd = t.runningStatus;
          else {
            t.cmdPtr++;
            if (b >= 0xbd) t.runningStatus = b;
            cmd = b;
          }
          if (cmd >= 0xcf) this.plyNote(cmd - 0xcf, p, t);
          else if (cmd > 0xb0) {
            this.command(cmd, p, t);
            if (t.flags === 0) {
              stopped = true;
              break;
            }
          } else t.wait = this.T.clock[cmd - 0x80];
        }
        if (stopped) continue;
        t.wait--;
        if (t.lfoSpeed && t.mod) {
          if (t.lfoDelayC) t.lfoDelayC--;
          else {
            const c = t.lfoSpeedC + t.lfoSpeed;
            t.lfoSpeedC = c & 0xff;
            const r2 = ((c - 0x40) & 0x80) ? this.s8(c) : 128 - c;
            const m = (t.mod * r2) >> 6;
            if (((m ^ t.modM) & 0xff) !== 0) {
              t.modM = m & 0xff;
              t.flags |= t.modT === 0 ? 0x0c : 0x03;
            }
          }
        }
      }
      p.clock++;
      if (active === 0) {
        p.status = 0x80000000;
        return;
      }
      p.status = active;
      p.tempoC -= 150;
    }
    for (let i = 0; i < p.trackCount; i++) {
      const t = p.tracks[i];
      if (!(t.flags & 0x80) || !(t.flags & (0x03 | 0x0c))) continue;
      this.trkVolPitSet(t);
      for (const c of t.chans.slice()) {
        if (!(c.statusFlags & 0xc7)) {
          this.clearChain(c);
          continue;
        }
        if (t.flags & 0x03) {
          this.chnVolSet(c, t);
          if (c.cgb) c.modify |= 1;
        }
        if (t.flags & 0x0c) {
          let key = c.key + t.keyM;
          if (key < 0) key = 0;
          if (c.cgb) {
            c.frequency = this.midiKeyToCgbFreq(c.n, key, t.pitM);
            c.modify |= 2;
          } else c.frequency = this.midiKeyToFreq(c.wav, key, t.pitM);
        }
      }
      t.flags &= 0xf0;
    }
  }

  readU32(data: Uint8Array, at: number): number {
    return data[at] | (data[at + 1] << 8) | (data[at + 2] << 16) | (data[at + 3] << 24);
  }

  command(cmd: number, p: any, t: any): void {
    const data = t.song.data;
    const next = () => data[t.cmdPtr++];
    switch (cmd) {
      case 0xb2: // GOTO
        t.cmdPtr = this.readU32(data, t.cmdPtr);
        return;
      case 0xb3: // PATT
        if (t.patternLevel >= 3) return this.plyFine(t);
        t.patternStack[t.patternLevel++] = t.cmdPtr + 4;
        t.cmdPtr = this.readU32(data, t.cmdPtr);
        return;
      case 0xb4: // PEND
        if (t.patternLevel) t.cmdPtr = t.patternStack[--t.patternLevel];
        return;
      case 0xb5: { // REPT
        const count = data[t.cmdPtr];
        if (count === 0) {
          t.cmdPtr = this.readU32(data, t.cmdPtr + 1);
          return;
        }
        t.repN = (t.repN + 1) & 0xff;
        if (t.repN < count) t.cmdPtr = this.readU32(data, t.cmdPtr + 1);
        else {
          t.repN = 0;
          t.cmdPtr += 5;
        }
        return;
      }
      case 0xb9: { // MEMACC (no song here uses it)
        t.cmdPtr += 3;
        return;
      }
      case 0xba: t.priority = next(); return;
      case 0xbb: // TEMPO
        p.tempoD = next() * 2;
        p.tempoI = (p.tempoD * p.tempoU) >> 8;
        return;
      case 0xbc: t.keyShift = this.s8(next()); t.flags |= 0x0c; return;
      case 0xbd: { // VOICE
        const i = next();
        const g = p.tone;
        const v = g ? g.voices[i - g.start] : null;
        t.tone = v ? Object.assign({}, v) : { type: 0, key: 60, length: 0, panSweep: 0, wav: null, attack: 0, decay: 0, sustain: 0, release: 0, split: null };
        return;
      }
      case 0xbe: t.vol = next(); t.flags |= 0x03; return;
      case 0xbf: t.pan = next() - 0x40; t.flags |= 0x03; return;
      case 0xc0: t.bend = next() - 0x40; t.flags |= 0x0c; return;
      case 0xc1: t.bendRange = next(); t.flags |= 0x0c; return;
      case 0xc2: t.lfoSpeed = next(); if (!t.lfoSpeed) this.clearModM(t); return;
      case 0xc3: t.lfoDelay = next(); return;
      case 0xc4: t.mod = next(); if (!t.mod) this.clearModM(t); return;
      case 0xc5: {
        const v = next();
        if (t.modT !== v) {
          t.modT = v;
          t.flags |= 0x03 | 0x0c;
        }
        return;
      }
      case 0xc8: t.tune = next() - 0x40; t.flags |= 0x0c; return;
      case 0xcc: t.cmdPtr += 2; return; // PORT: a raw sound register write
      case 0xcd: return this.xcmd(p, t);
      case 0xce: { // EOT
        let key = t.key;
        if (data[t.cmdPtr] < 0x80) {
          key = data[t.cmdPtr++];
          t.key = key;
        }
        for (const c of t.chans) {
          if (c.statusFlags & (0x80 | 0x03) && !(c.statusFlags & 0x40) && c.midiKey === key) {
            c.statusFlags |= 0x40;
            return;
          }
        }
        return;
      }
      default: // FINE and the unused commands
        return this.plyFine(t);
    }
  }

  xcmd(p: any, t: any): void {
    const data = t.song.data;
    const n = data[t.cmdPtr++];
    const next = () => data[t.cmdPtr++];
    switch (n) {
      case 1: t.cmdPtr += 4; return; // xWAVE: a raw pointer
      case 2: t.tone.type = next(); return;
      case 4: t.tone.attack = next(); return;
      case 5: t.tone.decay = next(); return;
      case 6: t.tone.sustain = next(); return;
      case 7: t.tone.release = next(); return;
      case 8: t.pseudoEchoVolume = next(); return;
      case 9: t.pseudoEchoLength = next(); return;
      case 10: t.tone.length = next(); return;
      case 11: t.tone.panSweep = next(); return;
      case 12: { // xWAIT
        const len = data[t.cmdPtr] | (data[t.cmdPtr + 1] << 8);
        if (t.timer < len) {
          t.timer++;
          t.cmdPtr -= 2;
          t.wait = 1;
        } else {
          t.timer = 0;
          t.cmdPtr += 2;
        }
        return;
      }
      case 13: t.unk3C = this.readU32(data, t.cmdPtr); t.cmdPtr += 4; return;
      default: return this.plyFine(t);
    }
    void p;
  }

  plyFine(t: any): void {
    for (const c of t.chans) {
      if (c.statusFlags & 0xc7) c.statusFlags |= 0x40;
      c.track = null;
    }
    t.chans = [];
    t.flags = 0;
  }

  plyNote(noteIdx: number, p: any, t: any): void {
    const data = t.song.data;
    t.gateTime = this.T.clock[noteIdx];
    if (data[t.cmdPtr] < 0x80) {
      t.key = data[t.cmdPtr++];
      if (data[t.cmdPtr] < 0x80) {
        t.velocity = data[t.cmdPtr++];
        if (data[t.cmdPtr] < 0x80) t.gateTime += data[t.cmdPtr++];
      }
    }
    let rhythmPan = 0;
    let tone = t.tone;
    let key = t.key;
    if (tone.type & (0x80 | 0x40)) {
      const g = tone.wav;
      if (!g) return;
      const index = tone.type & 0x40 ? (tone.split ? tone.split[key] : 0) : key;
      const sub = g.voices[index - g.start];
      if (!sub || sub.type & (0x40 | 0x80)) return;
      if (tone.type & 0x80) {
        if (sub.panSweep & 0x80) rhythmPan = (sub.panSweep - 0xc0) * 2;
        key = sub.key;
      }
      tone = sub;
    }
    let priority = p.priority + t.priority;
    if (priority > 0xff) priority = 0xff;
    const cgbType = tone.type & 7;
    let c: any = null;
    if (cgbType) {
      c = this.cgb[cgbType - 1];
      if (c.statusFlags & 0xc7 && !(c.statusFlags & 0x40)) {
        if (c.priority > priority) return;
        if (c.priority === priority && c.track && c.track.order < t.order) return;
      }
    } else {
      let bestPrio = priority, bestOrder = t.order, stopping = false;
      for (let i = 0; i < this.maxChans; i++) {
        const ch = this.chans[i];
        if (!(ch.statusFlags & 0xc7)) {
          c = ch;
          break;
        }
        const chOrder = ch.track ? ch.track.order : -1;
        if (ch.statusFlags & 0x40) {
          if (!stopping) {
            stopping = true;
            bestPrio = ch.priority;
            bestOrder = chOrder;
            c = ch;
            continue;
          }
        } else if (stopping) continue;
        if (ch.priority < bestPrio) {
          bestPrio = ch.priority;
          bestOrder = chOrder;
          c = ch;
        } else if (ch.priority === bestPrio) {
          if (chOrder > bestOrder) {
            bestOrder = chOrder;
            c = ch;
          } else if (chOrder === bestOrder) c = ch;
        }
      }
      if (!c) return;
    }
    this.clearChain(c);
    t.chans.unshift(c);
    c.track = t;
    t.lfoDelayC = t.lfoDelay;
    if (t.lfoDelay !== 0) this.clearModM(t);
    this.trkVolPitSet(t);
    c.gateTime = t.gateTime;
    c.midiKey = t.key;
    c.velocity = t.velocity;
    c.priority = priority;
    c.key = key;
    c.rhythmPan = rhythmPan;
    c.type = tone.type;
    c.wav = tone.wav;
    c.attack = tone.attack;
    c.decay = tone.decay;
    c.sustain = tone.sustain;
    c.release = tone.release;
    c.pseudoEchoVolume = t.pseudoEchoVolume;
    c.pseudoEchoLength = t.pseudoEchoLength;
    this.chnVolSet(c, t);
    let k = c.key + t.keyM;
    if (k < 0) k = 0;
    if (cgbType) {
      c.length = tone.length;
      c.sweep = !(tone.panSweep & 0x80) && tone.panSweep & 0x70 ? tone.panSweep : 8;
      c.frequency = this.midiKeyToCgbFreq(cgbType, k, t.pitM);
    } else {
      if (!c.wav) return;
      c.count = t.unk3C;
      c.frequency = this.midiKeyToFreq(c.wav, k, t.pitM);
    }
    c.statusFlags = 0x80;
    t.flags &= 0xf0;
  }

  // --- one frame: SoundMain --------------------------------------------------

  frame(): void {
    // Task_Fanfare: count down, then m4aMPlayContinue(&gMPlayInfo_BGM).
    if (this.fanfareCount >= 0) {
      if (this.fanfareCount > 0) this.fanfareCount--;
      else {
        this.resume(0);
        this.fanfareCount = -1;
      }
    }
    // MPlayMainHead runs the players last opened first: SE3, SE2, SE1, BGM.
    for (let i = this.players.length - 1; i >= 0; i--) this.mplayMain(this.players[i]);
    const bgm = this.players[0];
    if (this.nextBgm && (!bgm.fadeOI || bgm.status & 0x80000000)) {
      this.start(this.nextBgm);
      this.nextBgm = null;
    }
    this.cgbSound();
    // The DMA plays a frame's mix during the next frame, while the GB
    // channels change as soon as CgbSound writes them.
    [this.playA, this.frameA] = [this.frameA, this.playA];
    [this.playB, this.frameB] = [this.frameB, this.playB];
    this.soundMainRAM();
  }

  soundMainRAM(): void {
    const T = this.T, spf = T.spf;
    const A = this.frameA, B = this.frameB;
    // The reverb: what the DMA played 7 and 6 frames ago, mixed to mono.
    const seg = this.seg;
    const cur = seg * spf, nxt = ((seg + 1) % T.dmaPeriod) * spf;
    if (this.reverb) {
      for (let i = 0; i < spf; i++) {
        let v = this.ringB[cur + i] + this.ringA[cur + i] + this.ringB[nxt + i] + this.ringA[nxt + i];
        v = (v * this.reverb) >> 9;
        if (v & 0x80) v += 1;
        A[i] = B[i] = this.s8(v);
      }
    } else {
      A.fill(0);
      B.fill(0);
    }
    for (let ci = 0; ci < this.maxChans; ci++) {
      const c = this.chans[ci];
      let s = c.statusFlags;
      if (!(s & 0xc7)) continue;
      const w = c.wav;
      let env = c.envelopeVolume;
      let attackStep = false;
      if (s & 0x80) {
        if (s & 0x40) {
          c.statusFlags = 0;
          continue;
        }
        s = 3;
        c.ptr = c.count;
        c.count = w.size - c.count;
        env = 0;
        c.fw = 0;
        if (w.loop) s |= 0x10;
        attackStep = true;
      } else if (s & 0x04) {
        if (--c.pseudoEchoLength <= 0) {
          c.pseudoEchoLength = 0;
          c.statusFlags = 0;
          continue;
        }
      } else if (s & 0x40) {
        env = (env * c.release) >> 8;
        if (env <= c.pseudoEchoVolume) {
          if (c.pseudoEchoVolume === 0) {
            c.statusFlags = 0;
            continue;
          }
          s |= 0x04;
          env = c.pseudoEchoVolume;
        }
      } else if ((s & 3) === 2) {
        env = (env * c.decay) >> 8;
        if (env <= c.sustain) {
          env = c.sustain;
          if (env === 0) {
            if (c.pseudoEchoVolume === 0) {
              c.statusFlags = 0;
              continue;
            }
            s |= 0x04;
            env = c.pseudoEchoVolume;
          } else s -= 1;
        }
      } else if ((s & 3) === 3) attackStep = true;
      if (attackStep) {
        env += c.attack;
        if (env >= 0xff) {
          env = 0xff;
          s -= 1;
        }
      }
      c.statusFlags = s;
      c.envelopeVolume = env;
      const vol = ((this.masterVolume + 1) * env) >> 4;
      const vr = (c.rightVolume * vol) >> 8;
      const vl = (c.leftVolume * vol) >> 8;
      c.envelopeVolumeRight = vr;
      c.envelopeVolumeLeft = vl;
      this.mixChannel(c, w, vr, vl, (s & 0x10) !== 0);
    }
    // The frame joins the DMA ring for the reverb of the frames to come.
    this.ringA.set(A, cur);
    this.ringB.set(B, cur);
    this.seg = (seg + 1) % T.dmaPeriod;
  }

  mixChannel(c: any, w: any, vr: number, vl: number, loop: boolean): void {
    const spf = this.T.spf;
    const A = this.frameA, B = this.frameB;
    let data = w.data;
    if (c.type & 0x10) {
      // Reversed samples play from the end (no loop).
      w.reversed ??= Int8Array.from(w.data).reverse();
      data = w.reversed;
      loop = false;
    }
    const loopStart = w.loopStart, loopLen = w.size - w.loopStart;
    let ptr = c.ptr, count = c.count;
    if (c.type & 0x08) {
      // No resampling: one sample per output sample.
      for (let i = 0; i < spf; i++) {
        const v = data[ptr];
        A[i] = this.s8(A[i] + ((v * vr) >> 8));
        B[i] = this.s8(B[i] + ((v * vl) >> 8));
        ptr++;
        if (--count <= 0) {
          if (loop && loopLen > 0) {
            ptr = loopStart;
            count = loopLen;
          } else {
            c.statusFlags = 0;
            break;
          }
        }
      }
      c.ptr = ptr;
      c.count = count;
      return;
    }
    const step = (c.frequency * this.T.divFreq) >>> 0;
    let fw = c.fw;
    let cur = data[ptr] ?? 0, nextS = data[ptr + 1] ?? 0;
    let delta = nextS - cur;
    for (let i = 0; i < spf; i++) {
      const v = cur + ((fw * delta) >> 23);
      A[i] = this.s8(A[i] + ((v * vr) >> 8));
      B[i] = this.s8(B[i] + ((v * vl) >> 8));
      fw += step;
      const adv = fw >>> 23;
      if (adv) {
        fw &= 0x7fffff;
        count -= adv;
        if (count <= 0) {
          if (loop && loopLen > 0) {
            while (count <= 0) count += loopLen;
            ptr = loopStart + (loopLen - count);
          } else {
            c.statusFlags = 0;
            break;
          }
        } else ptr += adv;
        cur = data[ptr] ?? 0;
        nextS = data[ptr + 1] ?? (loop ? data[loopStart] : 0);
        delta = nextS - cur;
      }
    }
    c.fw = fw;
    c.ptr = ptr;
    c.count = count;
  }

  // --- the GB channels: CgbSound on a model of the PSG -----------------------

  cgbOscOff(n: number): void {
    const r = this.psg.reg;
    switch (n) {
      case 1: this.psgWrite(0x12, 8); this.psgWrite(0x14, 0x80); break;
      case 2: this.psgWrite(0x17, 8); this.psgWrite(0x19, 0x80); break;
      case 3: this.psgWrite(0x1a, 0); break;
      default: this.psgWrite(0x21, 8); this.psgWrite(0x23, 0x80);
    }
    void r;
  }

  cgbPan(c: any): boolean {
    const r = c.rightVolume & 0xff, l = c.leftVolume & 0xff;
    if (r >= l) {
      if (r / 2 >= l) {
        c.pan = 0x0f;
        return true;
      }
    } else if (l / 2 >= r) {
      c.pan = 0xf0;
      return true;
    }
    return false;
  }

  cgbModVol(c: any): void {
    if (!this.cgbPan(c)) {
      c.pan = 0xff;
      c.envelopeGoal = ((c.leftVolume + c.rightVolume) / 16) | 0;
    } else {
      c.envelopeGoal = ((c.leftVolume + c.rightVolume) / 16) | 0;
      if (c.envelopeGoal > 15) c.envelopeGoal = 15;
    }
    c.sustainGoal = (c.envelopeGoal * c.sustain + 15) >> 4;
    c.pan &= c.panMask;
  }

  cgbSound(): void {
    if (this.c15) this.c15--;
    else this.c15 = 14;
    const base = [0, 0x10, 0x15, 0x1a, 0x1f]; // NRx0 of each channel (ch2 and ch4 have no x0)
    for (let ch = 1; ch <= 4; ch++) {
      const c = this.cgb[ch - 1];
      if (!(c.statusFlags & 0xc7)) continue;
      const nrx0 = base[ch], nrx1 = nrx0 + 1, nrx2 = nrx0 + 2, nrx3 = nrx0 + 3, nrx4 = nrx0 + 4;
      let prevC15 = this.c15;
      let envStep = this.psgRead(nrx2);
      let stage = '';
      if (c.statusFlags & 0x80) {
        if (!(c.statusFlags & 0x40)) {
          c.statusFlags = 3;
          c.modify = 3;
          this.cgbModVol(c);
          switch (ch) {
            case 1:
            case 2:
              if (ch === 1) this.psgWrite(nrx0, c.sweep);
              this.psgWrite(nrx1, ((c.wav << 6) + c.length) & 0xff);
              envStep = c.attack + 8;
              c.n4 = c.length ? 0x40 : 0x00;
              break;
            case 3:
              if (c.wav !== c.currentWave) {
                this.psgWrite(0x1a, 0x40);
                this.psg.wave = (c.wav || []).slice();
                c.currentWave = c.wav;
              }
              this.psgWrite(0x1a, 0);
              this.psgWrite(nrx1, c.length);
              c.n4 = c.length ? 0xc0 : 0x80;
              break;
            default:
              this.psgWrite(nrx1, c.length);
              this.psgWrite(nrx3, (c.wav << 3) & 0xff);
              envStep = c.attack + 8;
              c.n4 = c.length ? 0x40 : 0x00;
              break;
          }
          c.envelopeCounter = c.attack;
          if (this.s8(c.attack)) {
            c.envelopeVolume = 0;
            stage = 'stepComplete';
          } else stage = 'decayStart';
        } else stage = 'off';
      } else if (c.statusFlags & 0x04) {
        c.pseudoEchoLength = (c.pseudoEchoLength - 1) & 0xff;
        if (this.s8(c.pseudoEchoLength) <= 0) stage = 'off';
        else stage = 'complete';
      } else if (c.statusFlags & 0x40 && c.statusFlags & 0x03) {
        c.statusFlags &= ~0x03;
        c.envelopeCounter = c.release;
        if (this.s8(c.release)) {
          c.modify |= 1;
          if (ch !== 3) envStep = c.release | 0;
          stage = 'stepComplete';
        } else stage = 'echoStart';
      } else stage = 'repeat';

      // The envelope state machine of CgbSound (its gotos as a loop).
      for (let guard = 0; guard < 8; guard++) {
        if (stage === 'repeat') {
          if (c.envelopeCounter === 0) {
            if (ch === 3) c.modify |= 1;
            this.cgbModVol(c);
            const e = c.statusFlags & 3;
            if (e === 0) {
              c.envelopeVolume = (c.envelopeVolume - 1) & 0xff;
              if (this.s8(c.envelopeVolume) <= 0) {
                stage = 'echoStart';
                continue;
              }
              c.envelopeCounter = c.release;
            } else if (e === 1) {
              stage = 'sustain';
              continue;
            } else if (e === 2) {
              c.envelopeVolume = (c.envelopeVolume - 1) & 0xff;
              if (this.s8(c.envelopeVolume) <= this.s8(c.sustainGoal)) {
                stage = 'sustainStart';
                continue;
              }
              c.envelopeCounter = c.decay;
            } else {
              c.envelopeVolume = (c.envelopeVolume + 1) & 0xff;
              if (c.envelopeVolume >= c.envelopeGoal) {
                stage = 'decayStart';
                continue;
              }
              c.envelopeCounter = c.attack;
            }
          }
          stage = 'stepComplete';
          continue;
        }
        if (stage === 'echoStart') {
          c.envelopeVolume = ((c.envelopeGoal * c.pseudoEchoVolume) + 0xff) >> 8;
          if (c.envelopeVolume) {
            c.statusFlags |= 0x04;
            c.modify |= 1;
            if (ch !== 3) envStep = 0 | 8;
            stage = 'complete';
          } else stage = 'off';
          continue;
        }
        if (stage === 'sustainStart') {
          if (c.sustain === 0) {
            c.statusFlags &= ~0x03;
            stage = 'echoStart';
            continue;
          }
          c.statusFlags--;
          c.modify |= 1;
          if (ch !== 3) envStep = 0 | 8;
          stage = 'sustain';
          continue;
        }
        if (stage === 'sustain') {
          c.envelopeVolume = c.sustainGoal;
          c.envelopeCounter = 7;
          stage = 'stepComplete';
          continue;
        }
        if (stage === 'decayStart') {
          c.statusFlags--;
          c.envelopeCounter = c.decay;
          if (c.envelopeCounter & 0xff) {
            c.modify |= 1;
            c.envelopeVolume = c.envelopeGoal;
            if (ch !== 3) envStep = c.decay | 0;
            stage = 'stepComplete';
          } else stage = 'sustainStart';
          continue;
        }
        if (stage === 'stepComplete') {
          c.envelopeCounter = (c.envelopeCounter - 1) & 0xff;
          if (prevC15 === 0) {
            prevC15--;
            stage = 'repeat';
            continue;
          }
          stage = 'complete';
          continue;
        }
        break;
      }
      if (stage === 'off') {
        this.cgbOscOff(ch);
        c.statusFlags = 0;
        c.modify = 0;
        continue;
      }
      // Pitch.
      if (c.modify & 2) {
        if (ch < 4 && c.type & 0x08) c.frequency = (c.frequency + 1) & 0x7fe; // PWM 65536 Hz rounding
        if (ch !== 4) this.psgWrite(nrx3, c.frequency & 0xff);
        else this.psgWrite(nrx3, (this.psgRead(nrx3) & 0x08) | (c.frequency & 0xff));
        c.n4 = (c.n4 & 0xc0) + ((c.frequency >> 8) & 0xff);
        this.psgWrite(nrx4, c.n4 & 0xff, false);
      }
      // Envelope and volume.
      if (c.modify & 1) {
        this.psgWrite(0x25, (this.psgRead(0x25) & ~c.panMask) | c.pan);
        if (ch === 3) {
          this.psgWrite(nrx2, this.T.cgb3Vol[c.envelopeVolume & 15]);
          if (c.n4 & 0x80) {
            this.psgWrite(0x1a, 0x80);
            this.psgWrite(nrx4, c.n4);
            c.n4 &= 0x7f;
          }
        } else {
          this.psgWrite(nrx2, (envStep & 0x0f) + ((c.envelopeVolume & 0xff) << 4));
          this.psgWrite(nrx4, c.n4 | 0x80);
        }
      }
      c.modify = 0;
    }
  }

  // --- PSG hardware model -----------------------------------------------------

  newPsg(): any {
    const sq = () => ({ on: false, dac: false, duty: 0, pos: 0, phase: 0, freq: 0, vol: 0, envDir: 0, envPeriod: 0, envTimer: 0, len: 0, lenOn: false });
    return {
      reg: new Uint8Array(0x30),
      ch: [sq(), sq(), Object.assign(sq(), { volCode: 0 }), Object.assign(sq(), { lfsr: 0x7fff, shift: 0, wide: true, div: 0 })],
      sweep: { period: 0, neg: false, shift: 0, timer: 0, shadow: 0, on: false },
      wave: new Array(32).fill(0),
      nr51: 0xff,
      fsTimer: 0,
      fsStep: 0,
    };
  }

  psgRead(r: number): number {
    return this.psg.reg[r];
  }

  /** A write to a sound register (offsets from REG_SOUND1CNT_L: NR10 = 0x10 ... NR51 = 0x25). */
  psgWrite(r: number, v: number, trigger = true): void {
    const P = this.psg;
    P.reg[r] = v & 0xff;
    const chOf = (reg: number) => (reg < 0x15 ? 0 : reg < 0x1a ? 1 : reg < 0x1f ? 2 : 3);
    if (r === 0x25) {
      P.nr51 = v;
      return;
    }
    const n = chOf(r);
    const c = P.ch[n];
    const x = r - [0x10, 0x15, 0x1a, 0x1f][n];
    if (n === 0 && x === 0) {
      P.sweep.period = (v >> 4) & 7;
      P.sweep.neg = !!(v & 8);
      P.sweep.shift = v & 7;
      return;
    }
    if (n === 2) {
      if (x === 0) {
        c.dac = !!(v & 0x80);
        if (!c.dac) c.on = false;
      } else if (x === 1) c.len = 256 - v;
      else if (x === 2) c.volCode = v;
      else if (x === 3) c.freq = (c.freq & 0x700) | v;
      else if (x === 4) {
        c.freq = (c.freq & 0xff) | ((v & 7) << 8);
        c.lenOn = !!(v & 0x40);
        if (v & 0x80 && trigger) {
          c.on = c.dac;
          if (c.len === 0) c.len = 256;
          c.pos = 0;
          c.phase = 0;
        }
      }
      return;
    }
    if (x === 1) {
      if (n < 2) c.duty = v >> 6;
      c.len = 64 - (v & 63);
    } else if (x === 2) {
      c.dac = (v & 0xf8) !== 0;
      if (!c.dac) c.on = false;
    } else if (x === 3) {
      if (n === 3) {
        c.shift = v >> 4;
        c.wide = !(v & 8);
        c.div = v & 7;
      } else c.freq = (c.freq & 0x700) | v;
    } else if (x === 4) {
      if (n < 2) c.freq = (c.freq & 0xff) | ((v & 7) << 8);
      c.lenOn = !!(v & 0x40);
      if (v & 0x80 && trigger) {
        const nr2 = P.reg[r - 2];
        c.on = c.dac;
        if (c.len === 0) c.len = 64;
        c.vol = nr2 >> 4;
        c.envDir = nr2 & 8 ? 1 : -1;
        c.envPeriod = nr2 & 7;
        c.envTimer = c.envPeriod || 8;
        if (n === 3) c.lfsr = 0x7fff;
        if (n === 0) {
          const s = P.sweep;
          s.shadow = c.freq;
          s.timer = s.period || 8;
          s.on = s.period !== 0 || s.shift !== 0;
          if (s.shift && this.sweepCalc() > 2047) c.on = false;
        }
      }
    }
  }

  sweepCalc(): number {
    const s = this.psg.sweep;
    const d = s.shadow >> s.shift;
    return s.neg ? s.shadow - d : s.shadow + d;
  }

  /** The 512 Hz frame sequencer: length (256 Hz), sweep (128 Hz), envelopes (64 Hz). */
  psgSequencer(): void {
    const P = this.psg;
    const step = P.fsStep;
    P.fsStep = (step + 1) & 7;
    if ((step & 1) === 0) {
      for (const c of P.ch) {
        if (c.lenOn && c.len > 0 && --c.len === 0) c.on = false;
      }
    }
    if (step === 2 || step === 6) {
      const s = P.sweep, c = P.ch[0];
      if (--s.timer <= 0) {
        s.timer = s.period || 8;
        if (s.on && s.period) {
          const f = this.sweepCalc();
          if (f > 2047) c.on = false;
          else if (s.shift) {
            s.shadow = f;
            c.freq = f;
            if (this.sweepCalc() > 2047) c.on = false;
          }
        }
      }
    }
    if (step === 7) {
      for (const n of [0, 1, 3]) {
        const c = P.ch[n];
        if (!c.envPeriod) continue;
        if (--c.envTimer <= 0) {
          c.envTimer = c.envPeriod;
          const v = c.vol + c.envDir;
          if (v >= 0 && v <= 15) c.vol = v;
        }
      }
    }
  }

  /** The PSG's output at this instant, left and right (SOUNDCNT_H 100%, NR50 = 0x77). */
  psgSample(out: number[]): void {
    const P = this.psg, rate = this.rate;
    const DUTY = [0x01, 0x81, 0x87, 0x7e];
    let l = 0, r = 0;
    for (let n = 0; n < 4; n++) {
      const c = P.ch[n];
      if (!c.on) continue;
      let v = 0;
      if (n < 2) {
        const f = 131072 / (2048 - c.freq);
        c.phase += f / rate;
        c.phase -= Math.floor(c.phase);
        const bit = (DUTY[c.duty] >> (7 - Math.floor(c.phase * 8))) & 1;
        v = bit ? c.vol : 0;
      } else if (n === 2) {
        const f = 65536 / (2048 - c.freq);
        c.phase += f / rate;
        c.phase -= Math.floor(c.phase);
        const s = P.wave[Math.floor(c.phase * 32) & 31] ?? 0;
        const code = c.volCode;
        v = code & 0x80 ? (s * 3) >> 2 : code === 0x20 ? s : code === 0x40 ? s >> 1 : code === 0x60 ? s >> 2 : 0;
      } else {
        const div = c.div === 0 ? 0.5 : c.div;
        const f = 524288 / div / 2 ** (c.shift + 1);
        c.phase += f / rate;
        while (c.phase >= 1) {
          c.phase -= 1;
          const b = (c.lfsr ^ (c.lfsr >> 1)) & 1;
          c.lfsr = (c.lfsr >> 1) | (b << 14);
          if (!c.wide) c.lfsr = (c.lfsr & ~0x40) | (b << 6);
        }
        v = c.lfsr & 1 ? 0 : c.vol;
      }
      if (P.nr51 & (1 << n)) r += v;
      if (P.nr51 & (0x10 << n)) l += v;
    }
    // x8, x(NR50 + 1) = x8, >> 2 at 100% (mGBA's scaling): 16 per step.
    out[0] = l * 16;
    out[1] = r * 16;
  }

  // --- output -------------------------------------------------------------------

  /** Fill output buffers at the context's sample rate. */
  render(left: Float32Array, right: Float32Array): void {
    const T = this.T;
    const dsStep = T.pcmFreq / this.rate;
    const fsPeriod = this.rate / 512;
    const psg = [0, 0];
    for (let i = 0; i < left.length; i++) {
      if (this.framePos >= T.spf) {
        this.frame();
        this.framePos -= T.spf;
      }
      const k = Math.min(T.spf - 1, Math.floor(this.framePos));
      this.psg.fsTimer += 1;
      if (this.psg.fsTimer >= fsPeriod) {
        this.psg.fsTimer -= fsPeriod;
        this.psgSequencer();
      }
      this.psgSample(psg);
      // DMA A is the right channel, B the left; DirectSound at 100% counts x4.
      let lv = this.playB[k] * 4 + psg[0];
      let rv = this.playA[k] * 4 + psg[1];
      lv = Math.max(-512, Math.min(511, lv));
      rv = Math.max(-512, Math.min(511, rv));
      if (this.filter) {
        // DC blocker (the GBA's output capacitor), then a gentle low-pass.
        this.dcL = this.dcK * this.dcL + lv - this.prevL;
        this.prevL = lv;
        this.dcR = this.dcK * this.dcR + rv - this.prevR;
        this.prevR = rv;
        this.lpL += (this.dcL - this.lpL) * this.lpK;
        this.lpR += (this.dcR - this.lpR) * this.lpK;
        lv = this.lpL;
        rv = this.lpR;
      }
      left[i] = (lv / 512) * this.gain;
      right[i] = (rv / 512) * this.gain;
      this.framePos += dsStep;
    }
  }
}
