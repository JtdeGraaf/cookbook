import { describe, expect, it } from 'vitest'
import { both, makeIngredient, makeRecipe } from '@/test/fixtures'
import {
  EMPTY_SHOPPING_LIST,
  addToList,
  buildShoppingItems,
  isOnList,
  parseSavedShoppingList,
  removeFromList,
  staplesLeftOff,
} from './shopping-list'

const carbonara = makeRecipe({
  slug: 'carbonara',
  title: both('Carbonara'),
  servings: 2,
  ingredients: [
    makeIngredient({ id: 'spaghetti', name: both('spaghetti'), quantity: { amount: 200, unit: 'g' } }),
    makeIngredient({ id: 'pepper', name: both('black pepper', 'zwarte peper'), quantity: { amount: 1, unit: 'tsp' } }),
    makeIngredient({ id: 'eggs', name: both('eggs', 'eieren'), quantity: { amount: 1, unit: 'piece' } }),
    makeIngredient({ id: 'water', name: both('water'), quantity: { amount: 2, unit: 'l' }, pantry: true }),
  ],
})
const aglio = makeRecipe({
  slug: 'aglio',
  title: both('Aglio e olio'),
  servings: 2,
  ingredients: [
    makeIngredient({ id: 'pasta', name: both('Spaghetti'), quantity: { amount: 0.5, unit: 'kg' } }),
    makeIngredient({ id: 'pepper', name: both('black pepper', 'zwarte peper'), quantity: { amount: 1, unit: 'tbsp' } }),
    makeIngredient({ id: 'parsley', name: both('parsley'), quantity: null }),
  ],
})
const pancakes = makeRecipe({
  slug: 'pancakes',
  title: both('Pancakes'),
  servings: 4,
  ingredients: [
    makeIngredient({ id: 'eggs', name: both('eggs', 'eieren'), quantity: { amount: 2, unit: 'piece' } }),
    makeIngredient({ id: 'parsley', name: both('parsley'), quantity: { amount: 1, unit: 'sprig' } }),
  ],
})

const listed = (recipe: typeof carbonara, servings: number, haveIngredientIds: string[] = []) => ({
  recipe,
  servings,
  haveIngredientIds,
})

describe('buildShoppingItems', () => {
  it('adds the same ingredient from several recipes together, across grams and kilos', () => {
    const items = buildShoppingItems([listed(carbonara, 2), listed(aglio, 4)])

    expect(items.find((item) => item.name.en === 'spaghetti')).toMatchObject({
      key: 'spaghetti|weight',
      quantity: { amount: 1.2, unit: 'kg' },
      recipeTitles: [both('Carbonara'), both('Aglio e olio')],
      sources: [
        { recipePath: 'mains/carbonara', ingredientId: 'spaghetti' },
        { recipePath: 'mains/aglio', ingredientId: 'pasta' },
      ],
    })
  })

  it('adds teaspoons and tablespoons together', () => {
    const items = buildShoppingItems([listed(carbonara, 2), listed(aglio, 2)])

    expect(items.find((item) => item.name.en === 'black pepper')?.quantity).toEqual({ amount: 1.5, unit: 'tbsp' })
  })

  it('scales each recipe by its own servings before adding up', () => {
    const items = buildShoppingItems([listed(carbonara, 4), listed(pancakes, 2)])

    expect(items.find((item) => item.name.en === 'eggs')?.quantity).toEqual({ amount: 3, unit: 'piece' })
  })

  it('keeps "to taste" apart from a measured amount of the same thing', () => {
    const items = buildShoppingItems([listed(aglio, 2), listed(pancakes, 4)])

    expect(items.filter((item) => item.name.en === 'parsley').map((item) => item.quantity)).toEqual([
      null,
      { amount: 1, unit: 'sprig' },
    ])
  })

  it('leaves kitchen staples off and names them', () => {
    const recipes = [listed(carbonara, 2)]

    expect(buildShoppingItems(recipes).map((item) => item.name.en)).not.toContain('water')
    expect(staplesLeftOff(recipes)).toEqual([both('water')])
  })

  it('counts a line as had only when every recipe that needs it has it', () => {
    const halfHad = buildShoppingItems([listed(carbonara, 2, ['eggs']), listed(pancakes, 4)])
    const allHad = buildShoppingItems([listed(carbonara, 2, ['eggs']), listed(pancakes, 4, ['eggs'])])

    expect(halfHad.find((item) => item.name.en === 'eggs')?.have).toBe(false)
    expect(allHad.find((item) => item.name.en === 'eggs')?.have).toBe(true)
  })
})

describe('the shopping list', () => {
  it('adds a recipe once', () => {
    const list = addToList(addToList(EMPTY_SHOPPING_LIST, 'mains/carbonara'), 'mains/carbonara')

    expect(list.recipePaths).toEqual(['mains/carbonara'])
    expect(isOnList(list, 'mains/carbonara')).toBe(true)
  })

  it('removes a recipe', () => {
    const list = removeFromList(addToList(EMPTY_SHOPPING_LIST, 'mains/carbonara'), 'mains/carbonara')

    expect(isOnList(list, 'mains/carbonara')).toBe(false)
  })

  it('drops a saved list that does not look right', () => {
    expect(parseSavedShoppingList({ recipes: [] })).toBeNull()
    expect(parseSavedShoppingList({ recipePaths: ['mains/carbonara'] })).toEqual({ recipePaths: ['mains/carbonara'] })
  })

  it('keeps the recipes of a list saved by the first version', () => {
    const firstVersion = { entries: [{ recipePath: 'mains/carbonara', servings: 4 }], checkedItems: [] }

    expect(parseSavedShoppingList(firstVersion)).toEqual({ recipePaths: ['mains/carbonara'] })
  })
})
