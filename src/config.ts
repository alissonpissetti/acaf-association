export function readApiUrl(): string {
  if (typeof window !== 'undefined' && window.__CONNECT_API_URL__) {
    return String(window.__CONNECT_API_URL__).replace(/\/$/, '');
  }
  const fromEnv = import.meta.env.VITE_API_URL ?? '';
  return String(fromEnv).replace(/\/$/, '');
}

export function apiUrl(path: string): string {
  const base = readApiUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

declare global {
  interface Window {
    __CONNECT_API_URL__?: string;
  }
}
