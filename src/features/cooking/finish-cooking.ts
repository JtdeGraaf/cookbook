import type { Recipe } from '@/lib/book'
import { EMPTY_JOURNAL, journalKey, localDate, parseSavedJournal, recordCooked } from '@/lib/journal'
import { clearTicks } from '@/lib/progress'
import { removeFromList } from '@/lib/shopping-list'
import { readSaved, save } from '@/lib/storage'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { timerStore } from '@/features/timers/timer-store'
import { progressStore } from './progress-store'

/**
 * Closes a cooking session: writes today into the recipe's journal, clears the ticks so the next cook starts with
 * the prep again, stops the recipe's timers and takes it off the shopping list, since its ingredients are used up.
 * Servings are kept.
 */
export function finishCooking(recipe: Recipe): void {
  const key = journalKey(recipe.path)
  save(key, recordCooked(readSaved(key, parseSavedJournal) ?? EMPTY_JOURNAL, localDate(new Date())))
  progressStore.update(recipe.path, clearTicks)
  timerStore.removeForRecipe(recipe.path)
  shoppingListStore.set((list) => removeFromList(list, recipe.path))
}

/** The finished page only makes sense on the day the recipe was cooked. */
export function wasCookedToday(cookedOn: string[]): boolean {
  return cookedOn[0] === localDate(new Date())
}
