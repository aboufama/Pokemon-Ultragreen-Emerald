// Standalone playable battle: the published demo build (tools/demo/build_demo.mjs).
// Same battle page as the default mode, without the dev tools.

import { runBattle } from '../battle/run';

const root = document.getElementById('app')!;
runBattle(root)
  .then(() => ((window as { __ready?: boolean }).__ready = true))
  .catch((err: unknown) => {
    console.error(err);
    root.textContent = String((err as Error)?.stack ?? err);
    (window as { __ready?: boolean }).__ready = true;
  });
