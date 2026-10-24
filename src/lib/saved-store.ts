import { onChangeInOtherTab, readSaved, save } from './storage'

/**
 * A value kept in localStorage that several parts of the page read at once. Changing it tells every reader, so a
 * heart on one card and the favourites filter never disagree. The book open in another tab or window stays in step
 * too, and a change here never throws away one made there.
 */
export type SavedStore<T> = {
  get: () => T
  /** Leaves storage and readers alone when `change` returns the value it was given. */
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
  const tellReaders = () => listeners.forEach((listener) => listener())

  onChangeInOtherTab((changedKey) => {
    if (changedKey !== null && changedKey !== key) return
    value = null
    tellReaders()
  })

  return {
    get,
    set(change) {
      // Read again first: another tab may have saved since, and its news can still be on the way. Where storage is
      // blocked, the copy in memory is all there is.
      const current = readSaved(key, parse) ?? get()
      const next = change(current)
      if (next === current) return
      value = next
      save(key, value)
      tellReaders()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
