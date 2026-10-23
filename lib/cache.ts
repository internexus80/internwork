const PREFIX = 'careerai_cache_';

export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setCache(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Cache is best-effort; ignore storage failures (quota/private mode).
  }
}