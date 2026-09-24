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
  } else if (mode === 'bonedump') {
    const { runBoneDump } = await import('./devtools/bonedump');
    await runBoneDump();
  } else if (mode === 'riglab') {
    const { runRigLab } = await import('./devtools/riglab');
    await runRigLab(root);
  } else if (mode === 'calibrate') {
    const { runCalibrate } = await import('./devtools/calibrate');
    await runCalibrate(root);
  } else if (mode === 'film') {
    const { runFilm } = await import('./devtools/film');
    await runFilm(root);
  } else if (mode === 'stage') {
    const { runStagePreview } = await import('./devtools/stage_preview');
    (window as unknown as { preview: unknown }).preview = await runStagePreview(root);
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
