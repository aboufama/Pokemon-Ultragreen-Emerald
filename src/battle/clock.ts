// Fixed 60 Hz frame clock with GBA-style per-frame tasks.
//
// Scene logic is written as async functions that await frame counts or
// conditions; per-frame behaviour (sliding sprites, bar animations, menus)
// runs as tasks, like the game's task and sprite callbacks. Everything is
// advanced by tick(), so a battle can be stepped deterministically.

interface Task {
  fn: () => boolean | void;
  resolve: () => void;
  late: boolean;
}

export class FrameClock {
  frame = 0;
  private tasks: Task[] = [];

  /**
   * Run `fn` once per frame until it returns true. `late` tasks run after the
   * others, like sprite callbacks (AnimateSprites) after RunTasks: when both
   * write the same palette, the late one wins that frame.
   */
  task(fn: () => boolean | void, late = false): Promise<void> {
    return new Promise((resolve) => this.tasks.push({ fn, resolve, late }));
  }

  /** Resolve after `n` frames. */
  frames(n: number): Promise<void> {
    if (n <= 0) return Promise.resolve();
    let left = n;
    return this.task(() => --left <= 0);
  }

  /** Resolve on the first frame where `test` holds. */
  until(test: () => boolean): Promise<void> {
    return this.task(test);
  }

  /** Advance one frame: run every task in creation order. */
  tick(): void {
    this.frame++;
    const running = this.tasks.filter((t) => !t.late).concat(this.tasks.filter((t) => t.late));
    this.tasks = [];
    const keep: Task[] = [];
    for (const t of running) {
      if (t.fn()) t.resolve();
      else keep.push(t);
    }
    // Tasks created while ticking start on the next frame.
    this.tasks = keep.concat(this.tasks);
  }

  /** Drop all pending tasks (scene reset). */
  clear(): void {
    this.tasks = [];
  }
}

/** Sin(index, amplitude) from the decomp: gSineTable is Q8 over 256 steps. */
export function gbaSin(index: number, amplitude: number): number {
  const v = Math.round(Math.sin(((index & 255) / 256) * Math.PI * 2) * 256);
  return Math.floor((v * amplitude) / 256);
}
