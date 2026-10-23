import { readSaved, save } from './storage'

/**
 * A value kept in localStorage that several parts of the page read at once. Changing it tells every reader, so a
 * heart on one card and the favourites filter never disagree.
 */
export type SavedStore<T> = {
  get: () => T
  set: (change: (current: T) => T) => void
  subscribe: (listener: () => void) => () => void
}

export function createSavedStore<T>(key: string, parse: (value: unknown) => T | null, empty: T): SavedStore<T> {
  let value: T | null = null
  const listeners = new Set<() => void>()
  const get = () => {
    value ??= readSaved(key, parse) ?? empty
    return value
  }
  return {
    get,
    set(change) {
      value = change(get())
      save(key, value)
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
