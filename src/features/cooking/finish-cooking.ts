import { recipeViewPath, type Recipe } from '@/lib/book'
import { localDate, recordCooked } from '@/lib/journal'
import { clearTicks } from '@/lib/progress'
import { removeFromList } from '@/lib/shopping-list'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { timerStore } from '@/features/timers/timer-store'
import { journalStore } from './journal-store'
import { progressStore } from './progress-store'

/**
 * Closes a cooking session: writes today into the recipe's journal, clears the ticks so the next cook starts with
 * the prep again, puts away the recipe's timers that rang and takes it off the shopping list, since its ingredients
 * are used up. Timers still going keep going and lead to the done page. Servings are kept.
 */
export function finishCooking(recipe: Recipe): void {
  journalStore(recipe.path).set((journal) => recordCooked(journal, localDate(new Date())))
  progressStore.update(recipe.path, clearTicks)
  timerStore.finishRecipe(recipe.path, '/' + recipeViewPath(recipe, { name: 'done' }))
  shoppingListStore.set((list) => removeFromList(list, recipe.path))
}

/** The finished page only makes sense on the day the recipe was cooked. */
export function wasCookedToday(cookedOn: string[]): boolean {
  return cookedOn[0] === localDate(new Date())
}
