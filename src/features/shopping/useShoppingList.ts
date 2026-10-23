import { useSyncExternalStore } from 'react'
import type { Recipe } from '@/lib/book'
import { createSavedStore } from '@/lib/saved-store'
import {
  EMPTY_SHOPPING_LIST,
  addToList,
  buildShoppingItems,
  changeListServings,
  isOnList,
  parseSavedShoppingList,
  removeFromList,
  toggleItem,
  type ShoppingList,
} from '@/lib/shopping-list'
import { findRecipe } from '@/lib/book'
import { book } from '@/features/book/book-data'

const shoppingListStore = createSavedStore<ShoppingList>('shopping-list', parseSavedShoppingList, EMPTY_SHOPPING_LIST)

export function useShoppingList() {
  const list = useSyncExternalStore(shoppingListStore.subscribe, shoppingListStore.get)
  // A recipe that was renamed or removed from the book since it was added is skipped.
  const recipes = list.entries.flatMap((entry) => {
    const recipe = findRecipe(book, entry.recipePath)
    return recipe ? [{ recipe, servings: entry.servings }] : []
  })
  const items = buildShoppingItems(recipes)
  return {
    list,
    recipes,
    items,
    isOnList: (recipe: Recipe) => isOnList(list, recipe.path),
    add: (recipe: Recipe, servings: number) => shoppingListStore.set((current) => addToList(current, recipe.path, servings)),
    remove: (recipe: Recipe) => shoppingListStore.set((current) => removeFromList(current, recipe.path)),
    changeServings: (recipe: Recipe, servings: number) =>
      shoppingListStore.set((current) => changeListServings(current, recipe.path, servings)),
    toggleItem: (key: string) => shoppingListStore.set((current) => toggleItem(current, key)),
    clear: () => shoppingListStore.set(() => EMPTY_SHOPPING_LIST),
  }
}
