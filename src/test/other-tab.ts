/** Saves a value the way the book open in another tab would, and lets this tab hear about it like the browser does. */
export function saveInOtherTab(key: string, value: unknown): void {
  window.localStorage.setItem(`cookbook:${key}`, JSON.stringify(value))
  window.dispatchEvent(new StorageEvent('storage', { key: `cookbook:${key}` }))
}

/** Saves a value from another tab whose news has not reached this tab yet. */
export function saveInOtherTabQuietly(key: string, value: unknown): void {
  window.localStorage.setItem(`cookbook:${key}`, JSON.stringify(value))
}
