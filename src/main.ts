export {};

declare global {
  interface Window {
    __ready?: boolean;
  }
}

const params = new URLSearchParams(location.search);
const mode = params.get('mode') ?? 'battle';
const root = document.getElementById('app')!;

async function start(): Promise<void> {
  if (mode === 'uifit') {
    const { runUiFit } = await import('./devtools/uifit');
    root.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    await runUiFit(root);
  } else {
    root.textContent = `unknown mode ${mode}`;
  }
  window.__ready = true;
}

start().catch((err) => {
  console.error(err);
  root.textContent = String(err?.stack ?? err);
  window.__ready = true;
});
