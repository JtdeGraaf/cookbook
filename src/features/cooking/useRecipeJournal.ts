import { useSyncExternalStore } from 'react'
import type { Recipe } from '@/lib/book'
import { journalStore } from './journal-store'

/** The days the cook made this recipe, kept in localStorage. */
export function useRecipeJournal(recipe: Recipe) {
  const store = journalStore(recipe.path)
  const journal = useSyncExternalStore(store.subscribe, store.get)
  return { journal }
}
