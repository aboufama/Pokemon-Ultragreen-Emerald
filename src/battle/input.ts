// GBA buttons from the keyboard (and taps on the screen as A).
//   A: Z / Enter / Space     B: X / Backspace / Escape
//   D-pad: arrow keys        Start: S     Select: Shift

export type Button = 'A' | 'B' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'START' | 'SELECT';

const KEYMAP: Record<string, Button> = {
  KeyZ: 'A', Enter: 'A', Space: 'A',
  KeyX: 'B', Backspace: 'B', Escape: 'B',
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  KeyS: 'START', ShiftLeft: 'SELECT', ShiftRight: 'SELECT',
};

export class Input {
  private held = new Set<Button>();
  private pressedThisFrame = new Set<Button>();
  private queue: Button[] = [];

  constructor(target: HTMLElement | Window = window) {
    target.addEventListener('keydown', (e) => {
      const b = KEYMAP[(e as KeyboardEvent).code];
      if (!b) return;
      e.preventDefault();
      if (!(e as KeyboardEvent).repeat) this.queue.push(b);
      this.held.add(b);
    });
    target.addEventListener('keyup', (e) => {
      const b = KEYMAP[(e as KeyboardEvent).code];
      if (b) this.held.delete(b);
    });
  }

  /** Programmatic press (autoplay, tests). */
  press(b: Button): void {
    this.queue.push(b);
  }

  /** On-screen button pressed: a new press, held until release(). */
  hold(b: Button): void {
    if (!this.held.has(b)) this.queue.push(b);
    this.held.add(b);
  }

  release(b: Button): void {
    this.held.delete(b);
  }

  /** Called once per frame by the scene. */
  poll(): void {
    this.pressedThisFrame = new Set(this.queue);
    this.queue = [];
  }

  pressed(...bs: Button[]): boolean {
    return bs.some((b) => this.pressedThisFrame.has(b));
  }

  isHeld(b: Button): boolean {
    return this.held.has(b);
  }
}
