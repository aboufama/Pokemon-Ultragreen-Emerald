// URL helper for files under public/assets (works for dev and relative builds).
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`;
}
