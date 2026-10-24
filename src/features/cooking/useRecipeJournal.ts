import { useSyncExternalStore } from 'react'
import type { Recipe } from '@/lib/book'
import { changeNote } from '@/lib/journal'
import { journalStore } from './journal-store'

/** When the cook made this recipe and their notes for next time, kept in localStorage. */
export function useRecipeJournal(recipe: Recipe) {
  const store = journalStore(recipe.path)
  const journal = useSyncExternalStore(store.subscribe, store.get)
  return {
    journal,
    changeNote: (note: string) => store.set((current) => changeNote(current, note)),
  }
}
