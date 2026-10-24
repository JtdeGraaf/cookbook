import type { Recipe } from '@/lib/book'
import { firstOpenPrepStep, type RecipeProgress } from '@/lib/progress'

/** The id of a prep task's tick box, counted from 1 like the list the cook sees. */
export function prepTaskTickId(index: number): string {
  return `prep-task-${index + 1}`
}

/** What the locked "Start cooking" button does: send keyboard focus to the first prep task still to do. */
export function focusFirstOpenPrepTask(recipe: Recipe, progress: RecipeProgress): void {
  const index = firstOpenPrepStep(recipe, progress)
  if (index === null) return
  document.getElementById(prepTaskTickId(index))?.focus()
}
