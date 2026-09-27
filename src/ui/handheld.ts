// The page as a handheld: the GBA screen and, on touch screens, the GBA
// buttons on the console's indigo body (../battle/touch_pad.ts). Held
// upright, the screen fills the width across the top with the buttons below,
// sized for thumbs; held sideways, the D-pad sits left of the screen and A/B
// right of it, like the console.
// The game page (src/game/main.ts) and the battle playtest
// (src/demo/playtest.ts) are both laid out this way.
//
//   const { screen, pad } = mountHandheld(root, () => input, { pad: touch });
//   new GbaScreen(screen, undefined, touch);  // the screen fills its box
//
// Without the buttons, a line under the screen can say which keys are which
// (`hint`).

import type { Input } from '../battle/input';
import { type PadExtra, createTouchPad } from '../battle/touch_pad';

export interface Handheld {
  /** The box the GBA screen goes in (GbaScreen centers and scales in it). */
  screen: HTMLElement;
  /** The GBA buttons (hidden when the page has no pad). */
  pad: HTMLElement;
}

/** Whether the device is used by touch: show the buttons, and fill the screen box. */
export function touchDevice(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}

/**
 * Lay out `root` as the handheld. `getInput` is read on each button press,
 * so the input can change (a menu, the game). `shoulders` adds L and R,
 * `extras` the page's own buttons; `hint` is the line under the screen when
 * there are no buttons.
 */
export function mountHandheld(root: HTMLElement, getInput: () => Input | null | undefined, o: { pad: boolean; shoulders?: boolean; extras?: PadExtra[]; hint?: string }): Handheld {
  injectCss();
  root.classList.add('hh');
  root.dataset.pad = o.pad ? 'on' : 'off';
  root.replaceChildren();
  const screen = document.createElement('div');
  screen.className = 'hh-screen';
  screen.addEventListener('contextmenu', (e) => e.preventDefault());
  const pad = createTouchPad(getInput, { shoulders: o.shoulders, extras: o.extras });
  root.append(screen, pad);
  if (o.hint && !o.pad) {
    const hint = document.createElement('div');
    hint.className = 'hh-hint';
    hint.textContent = o.hint;
    root.append(hint);
  }
  return { screen, pad };
}

function injectCss(): void {
  if (document.getElementById('hh-css')) return;
  const style = document.createElement('style');
  style.id = 'hh-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

const CSS = `
html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
.hh { position: fixed; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; grid-template-areas: "screen" "pad";
  background: #000; padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
  box-sizing: border-box; touch-action: manipulation; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.hh-screen { grid-area: screen; position: relative; min-height: 0; overflow: hidden; background: #000; }
.hh > .gba-pad { grid-area: pad; }
.hh[data-pad="off"] .gba-pad { display: none; }
.hh-hint { grid-area: pad; padding: 6px 12px 10px; text-align: center; font: 12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; color: #8d8fa6; }
/* With the buttons, the page is the handheld's body around the screen. */
.hh[data-pad="on"] { background: linear-gradient(var(--gba-body-hi), var(--gba-body) 45%, var(--gba-body-lo)); }
.hh .gba-pad { --dp: min(54px, 12.5vw); --ab: min(72px, 17vw); --sys: 22px; max-width: 600px; }
/* Upright: the screen across the top, the body below it with the buttons low enough for the thumbs. */
@media (orientation: portrait) {
  .hh { grid-template-rows: auto minmax(0, 1fr); }
  .hh-screen { width: 100%; aspect-ratio: 3 / 2; max-height: 72vh; }
  .hh > .gba-pad { align-self: stretch; align-content: end; background: none; padding-bottom: max(18px, 6vh); row-gap: max(14px, 3vh); }
}
/* Held sideways: the screen between D-pad and A/B, L and R above them, START and SELECT below the D-pad. */
@media (orientation: landscape) and (max-height: 540px) {
  .hh[data-pad="on"] { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas: "l screen r" "dpad screen ab" "sys screen extra"; }
  .hh[data-pad="on"] > .gba-pad { display: contents; }
  .hh[data-pad="on"] .gba-pad { --dp: min(52px, 12.5vh); --ab: min(70px, 17vh); --sys: 20px; }
  .hh[data-pad="on"] .gba-dpad, .hh[data-pad="on"] .gba-ab { align-self: center; justify-self: center; margin: 0 22px; }
  .hh[data-pad="on"] .gba-sys, .hh[data-pad="on"] .gba-extra { align-self: center; justify-self: center; margin: 6px 0 12px; }
  .hh[data-pad="on"] [data-b="L"], .hh[data-pad="on"] [data-b="R"] { margin: 10px 14px 0; justify-self: stretch; }
}
`;
