import { EMPTY_JOURNAL, journalKey, parseSavedJournal, type RecipeJournal } from '@/lib/journal'
import { createSavedStore, type SavedStore } from '@/lib/saved-store'

const stores = new Map<string, SavedStore<RecipeJournal>>()

/**
 * One journal per recipe, shared by the recipe page, the finished page and Finish itself, and with the book open in
 * other tabs, so Finish in one never writes back an older list of cooking days.
 */
export function journalStore(recipePath: string): SavedStore<RecipeJournal> {
  const known = stores.get(recipePath)
  if (known) return known
  const store = createSavedStore(journalKey(recipePath), parseSavedJournal, EMPTY_JOURNAL)
  stores.set(recipePath, store)
  return store
}
