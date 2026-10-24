import { z } from 'zod/mini'
import type { Quantity, Recipe } from './book'
import { scaleQuantity } from './quantity'
import type { LocalizedText, Unit } from './recipe-rules'
import { normalize } from './search'

/**
 * The recipes on the shopping list. Servings and what you already have are not kept here: they come from each
 * recipe's own progress, so the list and the recipe page always agree.
 */
export type ShoppingList = { recipePaths: string[] }

export const EMPTY_SHOPPING_LIST: ShoppingList = { recipePaths: [] }

/** A recipe on the list with what its progress says: how many people, and which ingredients are at hand. */
export type ListedRecipe = { recipe: Recipe; servings: number; haveIngredientIds: string[] }

/** Which recipe ingredients one shopping line stands for. Ticking the line ticks all of them. */
export type IngredientSource = { recipePath: string; ingredientId: string }

/** One line to buy: the same ingredient from several recipes added together. */
export type ShoppingItem = {
  key: string
  name: LocalizedText
  /** The name for more than one, from the first recipe that gives one. */
  plural: LocalizedText | null
  /** Null when every recipe says "to taste". */
  quantity: Quantity | null
  recipeTitles: LocalizedText[]
  sources: IngredientSource[]
  /** True when every recipe that needs it already has it: bought, or in the house. */
  have: boolean
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
  return list.recipePaths.includes(recipePath)
}

export function addToList(list: ShoppingList, recipePath: string): ShoppingList {
  if (isOnList(list, recipePath)) return list
  return { recipePaths: [...list.recipePaths, recipePath] }
}

export function removeFromList(list: ShoppingList, recipePath: string): ShoppingList {
  return { recipePaths: list.recipePaths.filter((path) => path !== recipePath) }
}

/**
 * Adds up the ingredients of every recipe on the list for its servings. The same ingredient (by English name) in
 * units that can be added, like grams and kilos, becomes one line; different kinds of unit stay apart. Kitchen
 * staples are left off.
 */
export function buildShoppingItems(recipes: ListedRecipe[]): ShoppingItem[] {
  const items = new Map<
    string,
    { name: LocalizedText; plural: LocalizedText | null; total: number | null; unit: Unit | null; recipeTitles: LocalizedText[]; sources: IngredientSource[]; have: boolean }
  >()
  for (const { recipe, servings, haveIngredientIds } of recipes) {
    const factor = servings / recipe.servings
    for (const ingredient of recipe.ingredients) {
      if (ingredient.pantry) continue
      const family = ingredient.quantity ? UNIT_FAMILIES[ingredient.quantity.unit] : null
      const key = `${normalize(ingredient.name.en)}|${family?.family ?? 'to-taste'}`
      const amount = ingredient.quantity && family ? ingredient.quantity.amount * family.perUnit * factor : null
      const source = { recipePath: recipe.path, ingredientId: ingredient.id }
      const have = haveIngredientIds.includes(ingredient.id)
      const existing = items.get(key)
      if (!existing) {
        items.set(key, {
          name: ingredient.name,
          plural: ingredient.plural,
          total: amount,
          unit: family?.baseUnit ?? null,
          recipeTitles: [recipe.title],
          sources: [source],
          have,
        })
        continue
      }
      if (existing.total !== null && amount !== null) existing.total += amount
      existing.plural ??= ingredient.plural
      if (!existing.recipeTitles.includes(recipe.title)) existing.recipeTitles.push(recipe.title)
      existing.sources.push(source)
      existing.have = existing.have && have
    }
  }
  return [...items.entries()].map(([key, item]) => ({
    key,
    name: item.name,
    plural: item.plural,
    // Round only once, after adding up, so small amounts don't round away before they are summed.
    quantity: item.total !== null && item.unit !== null ? scaleQuantity({ amount: item.total, unit: item.unit }, 1) : null,
    recipeTitles: item.recipeTitles,
    sources: item.sources,
    have: item.have,
  }))
}

/** The staples left off the list, once each, so the cook can see what was skipped. */
export function staplesLeftOff(recipes: ListedRecipe[]): LocalizedText[] {
  const names = new Map<string, LocalizedText>()
  for (const ingredient of recipes.flatMap(({ recipe }) => recipe.ingredients)) {
    if (ingredient.pantry) names.set(normalize(ingredient.name.en), ingredient.name)
  }
  return [...names.values()]
}

const savedListSchema = z.strictObject({ recipePaths: z.array(z.string()) })

/** How the list was saved when it kept its own servings; the recipes on it are kept. */
const firstVersionSchema = z.object({ entries: z.array(z.object({ recipePath: z.string() })) })

export function parseSavedShoppingList(value: unknown): ShoppingList | null {
  const current = savedListSchema.safeParse(value)
  if (current.success) return current.data
  const old = firstVersionSchema.safeParse(value)
  return old.success ? { recipePaths: old.data.entries.map((entry) => entry.recipePath) } : null
}
