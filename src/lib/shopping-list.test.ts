import { describe, expect, it } from 'vitest'
import { both, makeIngredient, makeRecipe } from '@/test/fixtures'
import {
  EMPTY_SHOPPING_LIST,
  addToList,
  buildShoppingItems,
  changeListServings,
  isOnList,
  parseSavedShoppingList,
  removeFromList,
  toggleItem,
} from './shopping-list'

const carbonara = makeRecipe({
  slug: 'carbonara',
  title: both('Carbonara'),
  servings: 2,
  ingredients: [
    makeIngredient({ id: 'spaghetti', name: both('spaghetti'), quantity: { amount: 200, unit: 'g' } }),
    makeIngredient({ id: 'pepper', name: both('black pepper', 'zwarte peper'), quantity: { amount: 1, unit: 'tsp' } }),
    makeIngredient({ id: 'eggs', name: both('eggs', 'eieren'), quantity: { amount: 1, unit: 'piece' } }),
  ],
})
const aglio = makeRecipe({
  slug: 'aglio',
  title: both('Aglio e olio'),
  servings: 2,
  ingredients: [
    makeIngredient({ id: 'spaghetti', name: both('Spaghetti'), quantity: { amount: 0.5, unit: 'kg' } }),
    makeIngredient({ id: 'pepper', name: both('black pepper', 'zwarte peper'), quantity: { amount: 1, unit: 'tbsp' } }),
    makeIngredient({ id: 'salt', name: both('salt', 'zout'), quantity: null }),
  ],
})
const pancakes = makeRecipe({
  slug: 'pancakes',
  title: both('Pancakes'),
  servings: 4,
  ingredients: [
    makeIngredient({ id: 'eggs', name: both('eggs', 'eieren'), quantity: { amount: 2, unit: 'piece' } }),
    makeIngredient({ id: 'salt', name: both('salt', 'zout'), quantity: { amount: 1, unit: 'pinch' } }),
  ],
})

describe('buildShoppingItems', () => {
  it('adds the same ingredient from several recipes together, across grams and kilos', () => {
    const items = buildShoppingItems([
      { recipe: carbonara, servings: 2 },
      { recipe: aglio, servings: 4 },
    ])

    expect(items.find((item) => item.name.en === 'spaghetti')).toEqual({
      key: 'spaghetti|weight',
      name: both('spaghetti'),
      quantity: { amount: 1.2, unit: 'kg' },
      recipeTitles: [both('Carbonara'), both('Aglio e olio')],
    })
  })

  it('adds teaspoons and tablespoons together', () => {
    const items = buildShoppingItems([
      { recipe: carbonara, servings: 2 },
      { recipe: aglio, servings: 2 },
    ])

    expect(items.find((item) => item.name.en === 'black pepper')?.quantity).toEqual({ amount: 1.5, unit: 'tbsp' })
  })

  it('scales each recipe by its own servings before adding up', () => {
    const items = buildShoppingItems([
      { recipe: carbonara, servings: 4 },
      { recipe: pancakes, servings: 2 },
    ])

    expect(items.find((item) => item.name.en === 'eggs')?.quantity).toEqual({ amount: 3, unit: 'piece' })
  })

  it('keeps "to taste" apart from a measured amount of the same thing', () => {
    const items = buildShoppingItems([
      { recipe: aglio, servings: 2 },
      { recipe: pancakes, servings: 4 },
    ])

    expect(items.filter((item) => item.name.en === 'salt').map((item) => item.quantity)).toEqual([
      null,
      { amount: 1, unit: 'pinch' },
    ])
  })
})

describe('the shopping list', () => {
  it('adds a recipe once and updates its servings when added again', () => {
    const list = addToList(addToList(EMPTY_SHOPPING_LIST, 'mains/carbonara', 2), 'mains/carbonara', 6)

    expect(list.entries).toEqual([{ recipePath: 'mains/carbonara', servings: 6 }])
    expect(isOnList(list, 'mains/carbonara')).toBe(true)
  })

  it('removes a recipe', () => {
    const list = removeFromList(addToList(EMPTY_SHOPPING_LIST, 'mains/carbonara', 2), 'mains/carbonara')

    expect(isOnList(list, 'mains/carbonara')).toBe(false)
  })

  it('keeps servings between 1 and 24', () => {
    const list = changeListServings(addToList(EMPTY_SHOPPING_LIST, 'mains/carbonara', 2), 'mains/carbonara', 40)

    expect(list.entries[0].servings).toBe(24)
  })

  it('ticks and unticks items', () => {
    const ticked = toggleItem(EMPTY_SHOPPING_LIST, 'salt|pinch')

    expect(ticked.checkedItems).toEqual(['salt|pinch'])
    expect(toggleItem(ticked, 'salt|pinch').checkedItems).toEqual([])
  })

  it('drops a saved list that does not look right', () => {
    expect(parseSavedShoppingList({ entries: [{ recipePath: 'a/b', servings: 0 }], checkedItems: [] })).toBeNull()
  })
})
