import { useSyncExternalStore } from 'react'
import { findRecipe, type Recipe } from '@/lib/book'
import { changeServings, servingsFor, setHaveIngredients } from '@/lib/progress'
import {
  EMPTY_SHOPPING_LIST,
  addToList,
  buildShoppingItems,
  isOnList,
  removeFromList,
  staplesLeftOff,
  type ListedRecipe,
  type ShoppingItem,
} from '@/lib/shopping-list'
import { book } from '@/features/book/book-data'
import { progressStore } from '@/features/cooking/progress-store'
import { shoppingListStore } from './shopping-list-store'

/**
 * The shopping list, built from each listed recipe's own progress: its servings, and the ingredients already at
 * hand. Ticking a line on the list ticks that ingredient on every recipe that needs it.
 */
export function useShoppingList() {
  const list = useSyncExternalStore(shoppingListStore.subscribe, shoppingListStore.get)
  useSyncExternalStore(progressStore.subscribe, progressStore.version)

  // A recipe that was renamed or removed from the book since it was added is skipped.
  const recipes: ListedRecipe[] = list.recipePaths.flatMap((path) => {
    const recipe = findRecipe(book, path)
    if (!recipe) return []
    const progress = progressStore.get(path)
    return [{ recipe, servings: servingsFor(recipe, progress), haveIngredientIds: progress.haveIngredientIds }]
  })
  const items = buildShoppingItems(recipes)

  function toggleItem(item: ShoppingItem) {
    for (const recipePath of new Set(item.sources.map((source) => source.recipePath))) {
      const ids = item.sources.filter((source) => source.recipePath === recipePath).map((source) => source.ingredientId)
      progressStore.update(recipePath, (progress) => setHaveIngredients(progress, ids, !item.have))
    }
  }

  return {
    recipes,
    toBuy: items.filter((item) => !item.have),
    haveAlready: items.filter((item) => item.have),
    staples: staplesLeftOff(recipes),
    isOnList: (recipe: Recipe) => isOnList(list, recipe.path),
    add: (recipe: Recipe) => shoppingListStore.set((current) => addToList(current, recipe.path)),
    remove: (recipe: Recipe) => shoppingListStore.set((current) => removeFromList(current, recipe.path)),
    changeServings: (recipe: Recipe, servings: number) =>
      progressStore.update(recipe.path, (progress) => changeServings(progress, servings)),
    toggleItem,
    clear: () => shoppingListStore.set(() => EMPTY_SHOPPING_LIST),
  }
}
