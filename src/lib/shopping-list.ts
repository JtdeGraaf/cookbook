import { z } from 'zod/mini'
import type { Quantity, Recipe } from './book'
import { scaleQuantity } from './quantity'
import { MAX_SERVINGS, MIN_SERVINGS, type LocalizedText, type Unit } from './recipe-rules'
import { normalize } from './search'

/** The recipes on the shopping list and what has already gone in the basket. */
export type ShoppingList = {
  entries: { recipePath: string; servings: number }[]
  /** Keys of the shopping items already bought. */
  checkedItems: string[]
}

export const EMPTY_SHOPPING_LIST: ShoppingList = { entries: [], checkedItems: [] }

/** One line to buy: the same ingredient from several recipes added together. */
export type ShoppingItem = {
  key: string
  name: LocalizedText
  /** Null when every recipe says "to taste". */
  quantity: Quantity | null
  recipeTitles: LocalizedText[]
}

/** Units that can be added together, and the small unit they are added up in. */
const UNIT_FAMILIES: Record<Unit, { family: string; baseUnit: Unit; perUnit: number }> = {
  g: { family: 'weight', baseUnit: 'g', perUnit: 1 },
  kg: { family: 'weight', baseUnit: 'g', perUnit: 1000 },
  ml: { family: 'volume', baseUnit: 'ml', perUnit: 1 },
  l: { family: 'volume', baseUnit: 'ml', perUnit: 1000 },
  tsp: { family: 'spoon', baseUnit: 'tsp', perUnit: 1 },
  tbsp: { family: 'spoon', baseUnit: 'tsp', perUnit: 3 },
  piece: { family: 'piece', baseUnit: 'piece', perUnit: 1 },
  clove: { family: 'clove', baseUnit: 'clove', perUnit: 1 },
  pinch: { family: 'pinch', baseUnit: 'pinch', perUnit: 1 },
  slice: { family: 'slice', baseUnit: 'slice', perUnit: 1 },
  sprig: { family: 'sprig', baseUnit: 'sprig', perUnit: 1 },
  can: { family: 'can', baseUnit: 'can', perUnit: 1 },
}

export function isOnList(list: ShoppingList, recipePath: string): boolean {
  return list.entries.some((entry) => entry.recipePath === recipePath)
}

export function addToList(list: ShoppingList, recipePath: string, servings: number): ShoppingList {
  const others = list.entries.filter((entry) => entry.recipePath !== recipePath)
  return { ...list, entries: [...others, { recipePath, servings }] }
}

export function removeFromList(list: ShoppingList, recipePath: string): ShoppingList {
  return { ...list, entries: list.entries.filter((entry) => entry.recipePath !== recipePath) }
}

export function changeListServings(list: ShoppingList, recipePath: string, servings: number): ShoppingList {
  const clamped = Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(servings)))
  return {
    ...list,
    entries: list.entries.map((entry) => (entry.recipePath === recipePath ? { ...entry, servings: clamped } : entry)),
  }
}

export function toggleItem(list: ShoppingList, key: string): ShoppingList {
  const checkedItems = list.checkedItems.includes(key)
    ? list.checkedItems.filter((checked) => checked !== key)
    : [...list.checkedItems, key]
  return { ...list, checkedItems }
}

/**
 * Adds up the ingredients of every recipe on the list for its chosen servings. The same ingredient (by English
 * name) in units that can be added, like grams and kilos, becomes one line; different kinds of unit stay apart.
 */
export function buildShoppingItems(recipes: { recipe: Recipe; servings: number }[]): ShoppingItem[] {
  const items = new Map<string, { name: LocalizedText; total: number | null; unit: Unit | null; recipeTitles: LocalizedText[] }>()
  for (const { recipe, servings } of recipes) {
    const factor = servings / recipe.servings
    for (const ingredient of recipe.ingredients) {
      const family = ingredient.quantity ? UNIT_FAMILIES[ingredient.quantity.unit] : null
      const key = `${normalize(ingredient.name.en)}|${family?.family ?? 'to-taste'}`
      const amount = ingredient.quantity && family ? ingredient.quantity.amount * family.perUnit * factor : null
      const existing = items.get(key)
      if (!existing) {
        items.set(key, { name: ingredient.name, total: amount, unit: family?.baseUnit ?? null, recipeTitles: [recipe.title] })
        continue
      }
      if (existing.total !== null && amount !== null) existing.total += amount
      if (!existing.recipeTitles.includes(recipe.title)) existing.recipeTitles.push(recipe.title)
    }
  }
  return [...items.entries()].map(([key, item]) => ({
    key,
    name: item.name,
    // Round only once, after adding up, so small amounts don't round away before they are summed.
    quantity: item.total !== null && item.unit !== null ? scaleQuantity({ amount: item.total, unit: item.unit }, 1) : null,
    recipeTitles: item.recipeTitles,
  }))
}

const savedListSchema = z.strictObject({
  entries: z.array(
    z.strictObject({
      recipePath: z.string(),
      servings: z.int().check(z.minimum(MIN_SERVINGS), z.maximum(MAX_SERVINGS)),
    }),
  ),
  checkedItems: z.array(z.string()),
})

export function parseSavedShoppingList(value: unknown): ShoppingList | null {
  const result = savedListSchema.safeParse(value)
  return result.success ? result.data : null
}
