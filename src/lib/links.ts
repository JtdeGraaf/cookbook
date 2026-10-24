import type { Recipe } from './book'
import { MAX_SERVINGS, MIN_SERVINGS, type Language } from './recipe-rules'

/** A link to the recipe that opens it scaled for `servings` people, in the sender's language. */
export function shareRecipeUrl(origin: string, recipe: Recipe, servings: number, language: Language): string {
  return `${origin}/${recipe.path}?servings=${servings}&lang=${language}`
}

/** `?servings=` from a shared link; anything that isn't a whole number of people we allow counts as absent. */
export function parseServingsParam(value: unknown): number | null {
  const servings = Number(value)
  if (value === undefined || value === null || value === '') return null
  if (!Number.isInteger(servings) || servings < MIN_SERVINGS || servings > MAX_SERVINGS) return null
  return servings
}
