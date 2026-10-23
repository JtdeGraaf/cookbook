/** Everything this app keeps in localStorage starts with this, so it never collides with other apps. */
const KEY_PREFIX = 'cookbook:'

/**
 * Reads a saved value and checks it with `parse`. Missing, broken or outdated values come back as null, so the
 * caller decides the fallback on purpose. Storage can also be blocked entirely (private mode).
 */
export function readSaved<T>(key: string, parse: (value: unknown) => T | null): T | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + key)
    if (raw === null) return null
    return parse(JSON.parse(raw))
  } catch {
    return null
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the app still works, it just forgets on reload.
  }
}

export function forget(key: string): void {
  try {
    window.localStorage.removeItem(KEY_PREFIX + key)
  } catch {
    // Same as above.
  }
}
