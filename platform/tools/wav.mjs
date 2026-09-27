// A WAV file: 16-bit PCM, interleaved channels.

export function encodeWav(samples, rate, channels = 2) {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);  // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * channels * 2, 28);
  header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/** Collects the game's audio (game.readAudio()) into one Int16Array. */
export class AudioRecorder {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  add(samples) {
    if (samples.length) {
      this.chunks.push(samples);
      this.length += samples.length;
    }
  }

  samples() {
    const all = new Int16Array(this.length);
    let at = 0;
    for (const c of this.chunks) {
      all.set(c, at);
      at += c.length;
    }
    return all;
  }
}
