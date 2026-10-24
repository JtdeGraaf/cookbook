import { z } from 'zod/mini'
import type { Recipe } from './book'
import { MAX_SERVINGS, MIN_SERVINGS } from './recipe-rules'

/**
 * Where the cook is with one recipe. Every page reads this one record: the recipe, prep and cooking pages and the
 * shopping list, so servings and ticks always agree.
 */
export type RecipeProgress = {
  /** Null means the recipe's own number of servings. */
  servings: number | null
  /** Ingredients the cook has at hand: in the house, or bought from the shopping list. */
  haveIngredientIds: string[]
  /** Prep steps done, by index in `recipe.prep`. */
  donePrepSteps: number[]
  /** Epoch milliseconds of the last prep tick, so prep from an earlier cooking session can be cleared. */
  preppedAt: number | null
}

export const EMPTY_PROGRESS: RecipeProgress = { servings: null, haveIngredientIds: [], donePrepSteps: [], preppedAt: null }

/**
 * Prep ticks older than this belong to an earlier cooking session and are cleared; 12 hours covers a long day.
 * Ingredients you have don't expire: shopping on Saturday for Sunday must still count on Sunday.
 */
export const SESSION_LENGTH_MS = 12 * 60 * 60 * 1000

export function servingsFor(recipe: Recipe, progress: RecipeProgress): number {
  return progress.servings ?? recipe.servings
}

export function changeServings(progress: RecipeProgress, servings: number): RecipeProgress {
  return { ...progress, servings: Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(servings))) }
}

export function toggleIngredient(progress: RecipeProgress, ingredientId: string): RecipeProgress {
  return { ...progress, haveIngredientIds: toggle(progress.haveIngredientIds, ingredientId) }
}

/** Marks several ingredients as at hand or not at once, for a shopping-list line that several recipes share. */
export function setHaveIngredients(progress: RecipeProgress, ingredientIds: string[], have: boolean): RecipeProgress {
  const others = progress.haveIngredientIds.filter((id) => !ingredientIds.includes(id))
  return { ...progress, haveIngredientIds: have ? [...others, ...ingredientIds] : others }
}

export function togglePrepStep(progress: RecipeProgress, stepIndex: number, now: number): RecipeProgress {
  return { ...progress, donePrepSteps: toggle(progress.donePrepSteps, stepIndex), preppedAt: now }
}

/** Cooking may only start once every prep step is ticked off. */
export function isPrepDone(recipe: Recipe, progress: RecipeProgress): boolean {
  return recipe.prep.every((_step, index) => progress.donePrepSteps.includes(index))
}

/** The first prep step still to do, by index in `recipe.prep`, or null once every step is ticked off. */
export function firstOpenPrepStep(recipe: Recipe, progress: RecipeProgress): number | null {
  const index = recipe.prep.findIndex((_step, stepIndex) => !progress.donePrepSteps.includes(stepIndex))
  return index === -1 ? null : index
}

/** Keeps servings but clears every tick: after cooking (the ingredients are used up), or to start over. */
export function clearTicks(progress: RecipeProgress): RecipeProgress {
  return { ...progress, haveIngredientIds: [], donePrepSteps: [], preppedAt: null }
}

/** A new day is a new cooking session: yesterday's prep ticks must not let today's cook skip the prep. */
export function forgetOldPrep(progress: RecipeProgress, now: number): RecipeProgress {
  if (progress.preppedAt === null || now - progress.preppedAt <= SESSION_LENGTH_MS) return progress
  return { ...progress, donePrepSteps: [], preppedAt: null }
}

export function hasTicks(progress: RecipeProgress): boolean {
  return progress.haveIngredientIds.length > 0 || progress.donePrepSteps.length > 0
}

function toggle<T>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item]
}

const savedServings = z.nullable(z.int().check(z.minimum(MIN_SERVINGS), z.maximum(MAX_SERVINGS)))
const savedPrepSteps = z.array(z.int().check(z.minimum(0)))

const savedProgressSchema = z.strictObject({
  servings: savedServings,
  haveIngredientIds: z.array(z.string()),
  donePrepSteps: savedPrepSteps,
  preppedAt: z.nullable(z.number()),
})

/** How progress was saved before ticks meant "I have it"; read once more so nobody loses their servings. */
const firstVersionSchema = z.strictObject({
  servings: savedServings,
  checkedIngredientIds: z.array(z.string()),
  donePrepSteps: savedPrepSteps,
})

export function parseSavedProgress(value: unknown): RecipeProgress | null {
  const current = savedProgressSchema.safeParse(value)
  if (current.success) return current.data
  const old = firstVersionSchema.safeParse(value)
  if (!old.success) return null
  // The old saves had no date, so their prep counts as an earlier session.
  return { servings: old.data.servings, haveIngredientIds: old.data.checkedIngredientIds, donePrepSteps: [], preppedAt: null }
}

export function progressKey(recipePath: string): string {
  return `progress:${recipePath}`
}
