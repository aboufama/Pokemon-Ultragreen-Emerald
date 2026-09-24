declare global {
  interface Window {
    /** Asset files embedded in the page as data: URLs, by path under assets/ (single-file demo build). */
    __EMBEDDED_ASSETS__?: Record<string, string>;
  }
}

// URL helper for files under public/assets (works for dev and relative
// builds, and for the single-file demo, which embeds them in the page).
export function asset(path: string): string {
  const embedded = typeof window === 'undefined' ? undefined : window.__EMBEDDED_ASSETS__?.[path];
  return embedded ?? `${import.meta.env.BASE_URL}assets/${path}`;
}
