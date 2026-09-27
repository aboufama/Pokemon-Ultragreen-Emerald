// On-screen GBA controls for touch and mouse, drawn as the Game Boy
// Advance's own: the dark cross of the D-pad, the domed A and B with their
// letters printed on the body beside them, the small round START and SELECT
// under the D-pad with their names beside them, and (when asked) the L and R
// shoulder buttons, on the indigo body. Buttons stay held while the pointer
// is down, like the real buttons (holding A or B speeds up battle text). A
// page can add small buttons of its own (`extras`: the game page's HACKS),
// drawn as START and SELECT are.

import type { Button, Input } from './input';

const CSS = `
:root { --gba-body: #4d41a0; --gba-body-hi: #5a4eb0; --gba-body-lo: #3b3187; --gba-print: #d3cdf6;
  --gba-key: #2f2e38; --gba-key-hi: #4d4b5c; --gba-key-lo: #18171e; }
.gba-pad { --dp: 42px; --ab: 58px; --sys: 20px;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "dpad . ab" "sys . extra"; align-items: center;
  column-gap: 12px; row-gap: 14px; width: 100%; max-width: 560px; margin: 0 auto; padding: 14px 18px 16px; box-sizing: border-box;
  background: linear-gradient(var(--gba-body-hi), var(--gba-body) 40%, var(--gba-body-lo));
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent;
  font: 700 10px/1 system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: 0.08em; color: var(--gba-print); }
.gba-pad.shoulders { grid-template-areas: "l . r" "dpad . ab" "sys . extra"; }
.gba-pad button { position: relative; margin: 0; padding: 0; border: 0; background: none; color: inherit; font: inherit;
  letter-spacing: inherit; cursor: pointer; touch-action: none; -webkit-tap-highlight-color: transparent; }
.gba-pad button:focus-visible { outline: 2px solid var(--gba-print); outline-offset: 3px; }
/* The keys: dark plastic, domed, lit from above; pressed, they sink. */
.gba-pad .gba-key, .gba-pad .gba-dpad button, .gba-dpad .hub { background: radial-gradient(130% 130% at 35% 25%, var(--gba-key-hi), var(--gba-key) 45%, var(--gba-key-lo)); }
.gba-pad .gba-key { box-shadow: 0 3px 0 var(--gba-key-lo), 0 5px 8px rgba(10, 6, 40, 0.45); }
.gba-pad button.on .gba-key, .gba-pad button.on.gba-key { transform: translateY(2px); box-shadow: 0 1px 0 var(--gba-key-lo), 0 2px 4px rgba(10, 6, 40, 0.45);
  background: radial-gradient(130% 130% at 35% 25%, var(--gba-key), var(--gba-key-lo)); }
/* The D-pad: one cross, in a round dip of the body. */
.gba-dpad { grid-area: dpad; position: relative; }
.gba-dpad::before { content: ""; position: absolute; inset: calc(var(--dp) * -0.3); border-radius: 50%;
  background: radial-gradient(circle, var(--gba-body-lo) 58%, transparent 71%); }
.gba-dpad .cross { position: relative; display: grid; grid-template-columns: repeat(3, var(--dp)); grid-template-rows: repeat(3, var(--dp));
  filter: drop-shadow(0 3px 0 var(--gba-key-lo)) drop-shadow(0 5px 6px rgba(10, 6, 40, 0.45)); }
.gba-dpad [data-b="UP"] { grid-area: 1 / 2; border-radius: 6px 6px 0 0; }
.gba-dpad [data-b="LEFT"] { grid-area: 2 / 1; border-radius: 6px 0 0 6px; }
.gba-dpad [data-b="RIGHT"] { grid-area: 2 / 3; border-radius: 0 6px 6px 0; }
.gba-dpad [data-b="DOWN"] { grid-area: 3 / 2; border-radius: 0 0 6px 6px; }
.gba-dpad .hub { grid-area: 2 / 2; }
.gba-dpad .hub::after { content: ""; position: absolute; left: 50%; top: 50%; width: 36%; height: 36%; transform: translate(-50%, -50%);
  border-radius: 50%; background: radial-gradient(circle at 60% 65%, var(--gba-key-hi), var(--gba-key-lo)); opacity: 0.6; }
.gba-dpad .hub { position: relative; }
/* The arrows molded into the cross. */
.gba-dpad button::after { content: ""; position: absolute; left: 50%; top: 50%; border: calc(var(--dp) * 0.13) solid transparent; }
.gba-dpad [data-b="UP"]::after { border-bottom-color: var(--gba-key-lo); transform: translate(-50%, -85%); }
.gba-dpad [data-b="DOWN"]::after { border-top-color: var(--gba-key-lo); transform: translate(-50%, -15%); }
.gba-dpad [data-b="LEFT"]::after { border-right-color: var(--gba-key-lo); transform: translate(-85%, -50%); }
.gba-dpad [data-b="RIGHT"]::after { border-left-color: var(--gba-key-lo); transform: translate(-15%, -50%); }
.gba-pad .gba-dpad button.on { background: radial-gradient(130% 130% at 35% 25%, var(--gba-key), var(--gba-key-lo)); }
/* A and B: domed round keys on a slant, their letters printed on the body. */
.gba-ab { grid-area: ab; display: grid; grid-template-columns: var(--ab) var(--ab); grid-template-rows: calc(var(--ab) * 0.5) var(--ab) calc(var(--ab) * 0.5);
  column-gap: calc(var(--ab) * 0.22); }
.gba-ab button { width: var(--ab); height: var(--ab); border-radius: 50%; }
.gba-ab [data-b="B"] { grid-area: 2 / 1 / 4 / 2; align-self: end; }
.gba-ab [data-b="A"] { grid-area: 1 / 2 / 3 / 3; }
.gba-ab .print { position: absolute; right: calc(var(--ab) * -0.2); bottom: calc(var(--ab) * -0.16); font-size: calc(var(--ab) * 0.26);
  letter-spacing: 0; pointer-events: none; }
/* START and SELECT: small round keys, their names beside them. */
.gba-sys, .gba-extra { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.gba-sys { grid-area: sys; justify-self: center; }
.gba-extra { grid-area: extra; justify-self: center; }
.gba-sys button, .gba-extra button { display: flex; align-items: center; gap: 8px; }
.gba-sys .gba-key, .gba-extra .gba-key { width: var(--sys); height: var(--sys); border-radius: 50%; flex: none; }
/* L and R: the shoulders, at the body's top corners. */
.gba-pad [data-b="L"], .gba-pad [data-b="R"] { width: 92px; height: 26px; font-size: 12px; }
.gba-pad [data-b="L"] { grid-area: l; justify-self: start; border-radius: 16px 6px 6px 6px; }
.gba-pad [data-b="R"] { grid-area: r; justify-self: end; border-radius: 6px 16px 6px 6px; }
@media (max-width: 380px) {
  .gba-pad { --dp: 38px; --ab: 52px; }
}
`;

/** A page's own button on the pad (the game page's HACKS), drawn as START and SELECT are. */
export interface PadExtra {
  label: string;
  press: () => void;
}

/**
 * `getInput` is read on each press, so the pad can exist before the scene.
 * `shoulders` adds L and R; `extras` the page's own buttons.
 */
export function createTouchPad(getInput: () => Input | null | undefined, o: { shoulders?: boolean; extras?: PadExtra[] } = {}): HTMLElement {
  if (!document.getElementById('gba-pad-css')) {
    const style = document.createElement('style');
    style.id = 'gba-pad-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  const pad = document.createElement('div');
  pad.className = 'gba-pad';
  /** A button that holds `b` while pressed; `face` is what shows on it. */
  const button = (b: Button, face: (el: HTMLButtonElement) => void) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.dataset.b = b;
    el.setAttribute('aria-label', b === 'A' || b === 'B' ? `${b} button` : b.toLowerCase());
    face(el);
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
  const text = (s: string, cls?: string) => {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = s;
    return span;
  };
  const key = () => {
    const dot = document.createElement('i');
    dot.className = 'gba-key';
    return dot;
  };

  const dpad = document.createElement('div');
  dpad.className = 'gba-dpad';
  const cross = document.createElement('div');
  cross.className = 'cross';
  const hub = document.createElement('span');
  hub.className = 'hub';
  cross.append(button('UP', () => {}), button('LEFT', () => {}), hub, button('RIGHT', () => {}), button('DOWN', () => {}));
  dpad.append(cross);

  const small = (b: Button, name: string) => button(b, (el) => el.append(key(), text(name)));
  const sys = document.createElement('div');
  sys.className = 'gba-sys';
  sys.append(small('START', 'START'), small('SELECT', 'SELECT'));

  const ab = document.createElement('div');
  ab.className = 'gba-ab';
  const round = (b: Button) => button(b, (el) => {
    el.classList.add('gba-key');
    el.append(text(b, 'print'));
  });
  ab.append(round('B'), round('A'));
  pad.append(dpad, sys, ab);

  if (o.shoulders) {
    pad.classList.add('shoulders');
    const shoulder = (b: Button) => button(b, (el) => {
      el.classList.add('gba-key');
      el.textContent = b;
    });
    pad.append(shoulder('L'), shoulder('R'));
  }
  if (o.extras?.length) {
    const extra = document.createElement('div');
    extra.className = 'gba-extra';
    for (const x of o.extras) {
      const el = document.createElement('button');
      el.type = 'button';
      el.append(key(), text(x.label));
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.classList.add('on');
      });
      const up = () => el.classList.remove('on');
      el.addEventListener('pointerup', () => {
        if (el.classList.contains('on')) x.press();
        up();
      });
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      extra.append(el);
    }
    pad.append(extra);
  }
  return pad;
}
