/** Everything this app keeps in localStorage starts with this, so it never collides with other apps. */
const KEY_PREFIX = 'cookbook:'

const savedHereListeners = new Set<(key: string) => void>()
const changedElsewhereListeners = new Set<(key: string | null) => void>()

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
    return
  }
  savedHereListeners.forEach((listener) => listener(key))
}

export function forget(key: string): void {
  try {
    window.localStorage.removeItem(KEY_PREFIX + key)
  } catch {
    // Same as above.
    return
  }
  savedHereListeners.forEach((listener) => listener(key))
}

/** The keys of everything this app has saved on this device. */
export function savedKeys(): string[] {
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(KEY_PREFIX))
      .map((key) => key.slice(KEY_PREFIX.length))
  } catch {
    return []
  }
}

/** Calls `listener` after this tab saved or forgot something, with its key. */
export function onSavedHere(listener: (key: string) => void): () => void {
  savedHereListeners.add(listener)
  return () => savedHereListeners.delete(listener)
}

/**
 * Saves a value that came from another phone, null removing it. Readers here hear about it the same way as about a
 * change in another tab, and it does not count as saved here, so it is not sent straight back.
 */
export function saveFromAnotherDevice(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(KEY_PREFIX + key)
    else window.localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value))
  } catch {
    return
  }
  changedElsewhereListeners.forEach((listener) => listener(key))
}

/**
 * Calls `listener` when the book open in another tab or window, or on another phone, changes something it keeps,
 * with the key that changed, or null when another tab cleared everything. The browser never tells the tab that made
 * the change itself.
 */
export function onChangeElsewhere(listener: (key: string | null) => void): () => void {
  const handle = (event: StorageEvent) => {
    if (event.key === null) listener(null)
    else if (event.key.startsWith(KEY_PREFIX)) listener(event.key.slice(KEY_PREFIX.length))
  }
  window.addEventListener('storage', handle)
  changedElsewhereListeners.add(listener)
  return () => {
    window.removeEventListener('storage', handle)
    changedElsewhereListeners.delete(listener)
  }
}
