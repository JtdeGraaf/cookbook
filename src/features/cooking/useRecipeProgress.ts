import { useSyncExternalStore } from 'react'
import type { Recipe } from '@/lib/book'
import {
  changeServings,
  clearTicks,
  isPrepDone,
  servingsFor,
  toggleIngredient,
  togglePrepStep,
} from '@/lib/progress'
import { progressStore } from './progress-store'

/** Ticks and servings for one recipe, shared with every other page that shows it and kept across reloads. */
export function useRecipeProgress(recipe: Recipe) {
  const progress = useSyncExternalStore(progressStore.subscribe, () => progressStore.get(recipe.path))
  const update = (change: Parameters<typeof progressStore.update>[1]) => progressStore.update(recipe.path, change)
  return {
    progress,
    servings: servingsFor(recipe, progress),
    prepDone: isPrepDone(recipe, progress),
    setServings: (servings: number) => update((current) => changeServings(current, servings)),
    toggleIngredient: (id: string) => update((current) => toggleIngredient(current, id)),
    togglePrepStep: (index: number) => update((current) => togglePrepStep(current, index, Date.now())),
    clearTicks: () => update(clearTicks),
  }
}

export type RecipeProgressControls = ReturnType<typeof useRecipeProgress>
