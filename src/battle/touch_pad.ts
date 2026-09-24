// On-screen GBA controls (D-pad, A/B, Start/Select) for touch and mouse.
// Buttons stay held while the pointer is down, like the real buttons (holding
// A or B speeds up battle text).

import type { Button, Input } from './input';

const CSS = `
.gba-pad { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  width: 100%; max-width: 560px; margin: 0 auto; padding: 10px 18px 14px; box-sizing: border-box;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
.gba-pad button { font: 600 13px/1 system-ui, -apple-system, "Segoe UI", sans-serif; color: #d9d8e6;
  background: #2b2e3f; border: 1px solid #454a63; box-shadow: 0 3px 0 #171924; cursor: pointer;
  display: grid; place-items: center; padding: 0; touch-action: none; }
.gba-pad button.on { background: #3a3f57; box-shadow: 0 1px 0 #171924; transform: translateY(2px); }
.gba-pad button:focus-visible { outline: 2px solid #7fc3c3; outline-offset: 2px; }
.gba-dpad { display: grid; grid-template-columns: repeat(3, 42px); grid-template-rows: repeat(3, 42px); }
.gba-dpad button { border-radius: 6px; font-size: 14px; }
.gba-dpad [data-b="UP"] { grid-area: 1 / 2; } .gba-dpad [data-b="LEFT"] { grid-area: 2 / 1; }
.gba-dpad [data-b="RIGHT"] { grid-area: 2 / 3; } .gba-dpad [data-b="DOWN"] { grid-area: 3 / 2; }
.gba-dpad .hub { grid-area: 2 / 2; background: #2b2e3f; border-block: 1px solid #454a63; }
.gba-mid { display: flex; flex-direction: column; gap: 10px; align-self: flex-end; }
.gba-mid button { width: 64px; height: 22px; border-radius: 11px; font-size: 10px; letter-spacing: 0.08em; }
.gba-ab { display: grid; grid-template-columns: 58px 58px; grid-template-rows: 30px 58px 30px; column-gap: 10px; }
.gba-ab button { width: 58px; height: 58px; border-radius: 50%; font-size: 18px; background: #3b3452; border-color: #5a5078; }
.gba-ab button.on { background: #4b4268; }
.gba-ab [data-b="B"] { grid-area: 2 / 1 / 4 / 2; align-self: end; }
.gba-ab [data-b="A"] { grid-area: 1 / 2 / 3 / 3; }
@media (max-width: 380px) {
  .gba-dpad { grid-template-columns: repeat(3, 38px); grid-template-rows: repeat(3, 38px); }
  .gba-ab { grid-template-columns: 52px 52px; grid-template-rows: 26px 52px 26px; }
  .gba-ab button { width: 52px; height: 52px; }
  .gba-mid button { width: 56px; }
}
`;

const LABELS: Partial<Record<Button, string>> = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶', A: 'A', B: 'B', START: 'START', SELECT: 'SELECT' };

/** `getInput` is read on each press, so the pad can exist before the scene. */
export function createTouchPad(getInput: () => Input | null | undefined): HTMLElement {
  if (!document.getElementById('gba-pad-css')) {
    const style = document.createElement('style');
    style.id = 'gba-pad-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  const pad = document.createElement('div');
  pad.className = 'gba-pad';
  const button = (b: Button) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.dataset.b = b;
    el.textContent = LABELS[b] ?? b;
    el.setAttribute('aria-label', b === 'A' || b === 'B' ? `${b} button` : b.toLowerCase());
    const down = (e: PointerEvent) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('on');
      getInput()?.hold(b);
    };
    const up = () => {
      el.classList.remove('on');
      getInput()?.release(b);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  };
  const dpad = document.createElement('div');
  dpad.className = 'gba-dpad';
  const hub = document.createElement('span');
  hub.className = 'hub';
  dpad.append(button('UP'), button('LEFT'), hub, button('RIGHT'), button('DOWN'));
  const mid = document.createElement('div');
  mid.className = 'gba-mid';
  mid.append(button('SELECT'), button('START'));
  const ab = document.createElement('div');
  ab.className = 'gba-ab';
  ab.append(button('B'), button('A'));
  pad.append(dpad, mid, ab);
  return pad;
}
