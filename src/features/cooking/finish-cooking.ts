import { recipeViewPath, type Dish, type Drink, type Recipe } from '@/lib/book'
import { localDate, recordFinished } from '@/lib/journal'
import { clearTicks } from '@/lib/progress'
import { isOnList, removeFromList } from '@/lib/shopping-list'
import { shoppingListStore } from '@/features/shopping/shopping-list-store'
import { timerStore } from '@/features/timers/timer-store'
import { journalStore } from './journal-store'
import { progressStore } from './progress-store'

/**
 * Closes a cooking session: writes today into the recipe's journal, clears the ticks so the next cook starts with
 * the prep again, puts away the recipe's timers that rang and takes it off the shopping list, since its ingredients
 * are used up. The journal notes whether it was on the list, for the done page. Timers still going keep going and
 * lead to the done page. Servings are kept.
 */
export function finishCooking(recipe: Dish): void {
  closeSession(recipe)
  timerStore.finishRecipe(recipe.path, '/' + recipeViewPath(recipe, { name: 'done' }))
}

/** The same for a drink, which has no timers or done page: the note under its Made it button says it went well. */
export function finishDrink(recipe: Drink): void {
  closeSession(recipe)
}

function closeSession(recipe: Recipe): void {
  const wasOnList = isOnList(shoppingListStore.get(), recipe.path)
  journalStore(recipe.path).set((journal) => recordFinished(journal, localDate(new Date()), wasOnList))
  progressStore.update(recipe.path, clearTicks)
  shoppingListStore.set((list) => removeFromList(list, recipe.path))
}

/** The finished page, and a drink's made-today note, only make sense on the day the recipe was made. */
export function wasCookedToday(cookedOn: string[]): boolean {
  return cookedOn[0] === localDate(new Date())
}
