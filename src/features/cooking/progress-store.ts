import {
  EMPTY_PROGRESS,
  forgetOldPrep,
  parseSavedProgress,
  progressKey,
  type RecipeProgress,
} from '@/lib/progress'
import { onChangeInOtherTab, readSaved, save } from '@/lib/storage'

/**
 * One progress record per recipe, shared by every page that shows it. A change on the shopping list shows up on the
 * recipe at once, and the other way round.
 */
const loaded = new Map<string, RecipeProgress>()
const listeners = new Set<() => void>()
// Bumped on every change, so a page that shows several recipes knows to read them again.
let version = 0

export const progressStore = {
  get(recipePath: string): RecipeProgress {
    const known = loaded.get(recipePath) ?? readSaved(progressKey(recipePath), parseSavedProgress) ?? EMPTY_PROGRESS
    // Checked on every read, so a tablet left open overnight also starts the next day with the prep.
    const current = forgetOldPrep(known, Date.now())
    loaded.set(recipePath, current)
    return current
  },
  update(recipePath: string, change: (current: RecipeProgress) => RecipeProgress): void {
    // Read again first, so a tick made in another tab a moment ago is kept.
    const saved = readSaved(progressKey(recipePath), parseSavedProgress)
    if (saved) loaded.set(recipePath, saved)
    const next = change(progressStore.get(recipePath))
    loaded.set(recipePath, next)
    save(progressKey(recipePath), next)
    version += 1
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  version(): number {
    return version
  },
  /** Reads every recipe from storage again: after another tab changed it, and between tests. */
  reload(): void {
    loaded.clear()
    version += 1
    listeners.forEach((listener) => listener())
  },
}

// The book open in a second tab or window stays in step with this one.
onChangeInOtherTab((key) => {
  if (key === null || key.startsWith(progressKey(''))) progressStore.reload()
})

// Coming back to a page left open for hours: read again, so old prep is cleared at once.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') progressStore.reload()
})
