import { createSavedStore } from '@/lib/saved-store'
import { EMPTY_SHOPPING_LIST, parseSavedShoppingList, type ShoppingList } from '@/lib/shopping-list'

/** The recipes on the shopping list, shared by the basket in the header, recipe pages and the list itself. */
export const shoppingListStore = createSavedStore<ShoppingList>(
  'shopping-list',
  parseSavedShoppingList,
  EMPTY_SHOPPING_LIST,
)
