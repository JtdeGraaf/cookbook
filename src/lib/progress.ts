import { z } from 'zod/mini'
import type { Recipe } from './book'
import { MAX_SERVINGS, MIN_SERVINGS } from './recipe-rules'

/** What the cook has ticked off and chosen for one recipe. */
export type RecipeProgress = {
  /** Null means the recipe's own number of servings. */
  servings: number | null
  checkedIngredientIds: string[]
  /** Prep steps done, by index in `recipe.prep`. */
  donePrepSteps: number[]
}

export const EMPTY_PROGRESS: RecipeProgress = { servings: null, checkedIngredientIds: [], donePrepSteps: [] }

export function servingsFor(recipe: Recipe, progress: RecipeProgress): number {
  return progress.servings ?? recipe.servings
}

export function changeServings(progress: RecipeProgress, servings: number): RecipeProgress {
  return { ...progress, servings: Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(servings))) }
}

export function toggleIngredient(progress: RecipeProgress, ingredientId: string): RecipeProgress {
  return { ...progress, checkedIngredientIds: toggle(progress.checkedIngredientIds, ingredientId) }
}

export function togglePrepStep(progress: RecipeProgress, stepIndex: number): RecipeProgress {
  return { ...progress, donePrepSteps: toggle(progress.donePrepSteps, stepIndex) }
}

/** Cooking may only start once every prep step is ticked off. */
export function isPrepDone(recipe: Recipe, progress: RecipeProgress): boolean {
  return recipe.prep.every((_step, index) => progress.donePrepSteps.includes(index))
}

/** Keeps servings but clears every tick, for cooking the recipe again. */
export function clearTicks(progress: RecipeProgress): RecipeProgress {
  return { ...progress, checkedIngredientIds: [], donePrepSteps: [] }
}

export function hasTicks(progress: RecipeProgress): boolean {
  return progress.checkedIngredientIds.length > 0 || progress.donePrepSteps.length > 0
}

function toggle<T>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item]
}

const savedProgressSchema = z.strictObject({
  servings: z.nullable(z.int().check(z.minimum(MIN_SERVINGS), z.maximum(MAX_SERVINGS))),
  checkedIngredientIds: z.array(z.string()),
  donePrepSteps: z.array(z.int().check(z.minimum(0))),
})

export function parseSavedProgress(value: unknown): RecipeProgress | null {
  const result = savedProgressSchema.safeParse(value)
  return result.success ? result.data : null
}

export function progressKey(chapterSlug: string, recipeSlug: string): string {
  return `progress:${chapterSlug}/${recipeSlug}`
}
