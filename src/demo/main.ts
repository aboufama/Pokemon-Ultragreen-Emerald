// Standalone battle playtest: the published demo build (tools/demo/build_demo.mjs).
// Pick your Pokémon, the foe and the movesets, then battle; see playtest.ts.

import { runPlaytest } from './playtest';

const root = document.getElementById('app')!;
runPlaytest(root)
  .then(() => ((window as { __ready?: boolean }).__ready = true))
  .catch((err: unknown) => {
    console.error(err);
    root.textContent = String((err as Error)?.stack ?? err);
    (window as { __ready?: boolean }).__ready = true;
  });
