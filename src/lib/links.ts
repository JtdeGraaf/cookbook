import type { Recipe } from './book'
import { recipeTemplate } from './recipe-template'
import { MAX_SERVINGS, MIN_SERVINGS, type Language } from './recipe-rules'

const REPOSITORY_URL = 'https://github.com/JtdeGraaf/cookbook'
const BRANCH = 'main'

/** GitHub's editor for this recipe's recipe.json. */
export function editRecipeUrl(recipe: Recipe): string {
  return `${REPOSITORY_URL}/edit/${BRANCH}/recipes/${recipe.path}/recipe.json`
}

/** GitHub's "new file" page in this folder, with a filled-in recipe.json waiting in a new-recipe folder. */
export function newRecipeUrl(folderPath: string): string {
  const query = new URLSearchParams({ filename: 'new-recipe/recipe.json', value: recipeTemplate(folderPath) })
  const folder = folderPath ? `/${folderPath}` : ''
  return `${REPOSITORY_URL}/new/${BRANCH}/recipes${folder}?${query}`
}

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
