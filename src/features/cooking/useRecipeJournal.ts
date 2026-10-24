import { useEffect, useState } from 'react'
import type { Recipe } from '@/lib/book'
import {
  EMPTY_JOURNAL,
  changeNote,
  journalKey,
  parseSavedJournal,
  type RecipeJournal,
} from '@/lib/journal'
import { readSaved, save } from '@/lib/storage'

/** When the cook made this recipe and their notes for next time, kept in localStorage. */
export function useRecipeJournal(recipe: Recipe) {
  const key = journalKey(recipe.path)
  const [journal, setJournal] = useState<RecipeJournal>(() => readSaved(key, parseSavedJournal) ?? EMPTY_JOURNAL)
  const [loadedKey, setLoadedKey] = useState(key)

  if (loadedKey !== key) {
    setLoadedKey(key)
    setJournal(readSaved(key, parseSavedJournal) ?? EMPTY_JOURNAL)
  }

  useEffect(() => {
    save(key, journal)
  }, [key, journal])

  return {
    journal,
    changeNote: (note: string) => setJournal((current) => changeNote(current, note)),
  }
}

