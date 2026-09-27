// GBA buttons from the keyboard (and the on-screen buttons, and taps on the
// screen as A), by a keymap (KeyboardEvent.code to button):
//
//   PLAYTEST_KEYS (the battle playtest, the default)
//     A: Z / Enter / Space     B: X / Backspace / Escape
//     D-pad: arrow keys        Start: S     Select: Shift
//   GAME_KEYS (the compiled game's page), an emulator's
//     A: X    B: Z    Start: Enter    Select: Backspace / right Shift
//     L: A    R: S    D-pad: arrow keys
//   GAME_MENU_KEYS (the game page's own menus: its start screen, the demo
//     battles' setup): GAME_KEYS, and Enter / Space choose (A), Escape backs
//     out (B), as on any page

export type Button = 'A' | 'B' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'START' | 'SELECT' | 'L' | 'R';

export type Keymap = Readonly<Record<string, Button>>;

const ARROWS: Keymap = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };

export const PLAYTEST_KEYS: Keymap = {
  KeyZ: 'A', Enter: 'A', Space: 'A',
  KeyX: 'B', Backspace: 'B', Escape: 'B',
  ...ARROWS,
  KeyS: 'START', ShiftLeft: 'SELECT', ShiftRight: 'SELECT',
};

export const GAME_KEYS: Keymap = {
  KeyX: 'A', KeyZ: 'B',
  ...ARROWS,
  Enter: 'START', Backspace: 'SELECT', ShiftRight: 'SELECT',
  KeyA: 'L', KeyS: 'R',
};

export const GAME_MENU_KEYS: Keymap = { ...GAME_KEYS, Enter: 'A', Space: 'A', Escape: 'B' };

export class Input {
  private held = new Set<Button>();
  private pressedThisFrame = new Set<Button>();
  private queue: Button[] = [];
  /** Ignore the keyboard (a menu is open over the battle). */
  muted = false;

  private readonly onKeyDown = (e: Event): void => {
    if (this.muted) return;
    // Keys typed into page controls (the species picker) are theirs.
    if ((e.target as HTMLElement | null)?.closest?.('select, input, textarea, button')) return;
    const b = this.keymap[(e as KeyboardEvent).code];
    if (!b) return;
    e.preventDefault();
    if (!(e as KeyboardEvent).repeat) this.queue.push(b);
    this.held.add(b);
  };

  private readonly onKeyUp = (e: Event): void => {
    const b = this.keymap[(e as KeyboardEvent).code];
    if (b) this.held.delete(b);
  };

  /** Keys come up unseen when the page loses focus: none stays held. */
  private readonly onBlur = (): void => this.held.clear();

  constructor(
    private readonly target: HTMLElement | Window = window,
    private readonly keymap: Keymap = PLAYTEST_KEYS,
  ) {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  dispose(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  /** Forget every press and held button (a new screen takes over the buttons). */
  reset(): void {
    this.held.clear();
    this.queue = [];
    this.pressedThisFrame.clear();
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

  /**
   * Down this frame: held, or pressed since the last poll (a tap shorter
   * than a frame still counts for one, as the GBA would have seen it).
   */
  isDown(b: Button): boolean {
    return this.held.has(b) || this.pressedThisFrame.has(b);
  }
}
