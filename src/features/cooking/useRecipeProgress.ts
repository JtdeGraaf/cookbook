import { useEffect, useState } from 'react'
import type { Recipe } from '@/lib/book'
import {
  EMPTY_PROGRESS,
  changeServings,
  clearTicks,
  isPrepDone,
  parseSavedProgress,
  progressKey,
  servingsFor,
  toggleIngredient,
  togglePrepStep,
  type RecipeProgress,
} from '@/lib/progress'
import { readSaved, save } from '@/lib/storage'

/** Ticks and servings for one recipe, kept in localStorage so they survive a reload mid-cooking. */
export function useRecipeProgress(recipe: Recipe) {
  const key = progressKey(recipe.path)
  const [progress, setProgress] = useState<RecipeProgress>(() => readSaved(key, parseSavedProgress) ?? EMPTY_PROGRESS)
  const [loadedKey, setLoadedKey] = useState(key)

  // Another recipe page reuses this component: load that recipe's progress instead.
  if (loadedKey !== key) {
    setLoadedKey(key)
    setProgress(readSaved(key, parseSavedProgress) ?? EMPTY_PROGRESS)
  }

  useEffect(() => {
    save(key, progress)
  }, [key, progress])

  return {
    progress,
    servings: servingsFor(recipe, progress),
    prepDone: isPrepDone(recipe, progress),
    setServings: (servings: number) => setProgress((current) => changeServings(current, servings)),
    toggleIngredient: (id: string) => setProgress((current) => toggleIngredient(current, id)),
    togglePrepStep: (index: number) => setProgress((current) => togglePrepStep(current, index)),
    clearTicks: () => setProgress((current) => clearTicks(current)),
  }
}

export type RecipeProgressControls = ReturnType<typeof useRecipeProgress>
