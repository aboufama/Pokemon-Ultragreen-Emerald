// Dev view: Emerald's wild battle transition for a place, played over its
// arena a frame at a time (src/battle/transition.ts), for review sheets.
//
//   /?mode=transition&env=cave[&scale=2]
//
// window.__transition: start() begins the transition, step(n) advances n
// frames, grab() returns the screen as a PNG data URL, done is true once the
// screen is black.

import { FrameClock } from '../battle/clock';
import { GbaScreen } from '../battle/screen';
import { transitionKind, wildTransition } from '../battle/transition';
import { BattleStage } from '../render3d/stage';

declare global {
  interface Window {
    __transition?: { start(): void; step(n: number): Promise<void>; grab(): string; done: boolean; kind: string };
  }
}

const macrotask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function runTransitionReview(root: HTMLElement): Promise<void> {
  const params = new URLSearchParams(location.search);
  const env = params.get('env') ?? 'grass';
  const scale = Number(params.get('scale') ?? 2);
  root.style.cssText = 'position:fixed;inset:0;background:#15151c;';
  const holder = document.createElement('div');
  holder.style.cssText = `position:absolute;left:0;top:0;width:${240 * scale}px;height:${160 * scale}px;`;
  root.appendChild(holder);
  const screen = new GbaScreen(holder, scale);
  const stage = new BattleStage(screen.canvas3d);
  await stage.setEnvironment(env);
  const clock = new FrameClock();
  const kind = transitionKind(env);
  const api = {
    kind,
    done: false,
    start: () => void wildTransition(stage.pipeline, clock, kind).then(() => (api.done = true)),
    step: async (n: number) => {
      for (let i = 0; i < n; i++) {
        clock.tick();
        stage.update(1 / 60);
        await macrotask();
      }
      stage.render();
    },
    grab: () => {
      stage.render();
      return screen.canvas3d.toDataURL('image/png');
    },
  };
  window.__transition = api;
  await api.step(1);
}
