import { book } from 'virtual:recipe-book'
import { describe, expect, it } from 'vitest'
import { both, makeDrink, makeIngredient, makeRecipe } from '@/test/fixtures'
import { allRecipes, type Recipe } from './book'
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
    makeIngredient({ id: 'eggs', name: both('egg', 'ei'), quantity: { amount: 1, unit: 'piece' } }),
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
    makeIngredient({
      id: 'eggs',
      name: both('egg', 'ei'),
      plural: both('eggs', 'eieren'),
      quantity: { amount: 2, unit: 'piece' },
    }),
    makeIngredient({ id: 'parsley', name: both('parsley'), quantity: { amount: 1, unit: 'sprig' } }),
  ],
})

const listed = (recipe: Recipe, servings: number, haveIngredientIds: string[] = []) => ({
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

    expect(items.find((item) => item.name.en === 'egg')?.quantity).toEqual({ amount: 3, unit: 'piece' })
  })

  it('rounds a large count of things to whole ones after adding up', () => {
    const items = buildShoppingItems([listed(carbonara, 7)])

    expect(items.find((item) => item.name.en === 'egg')?.quantity).toEqual({ amount: 4, unit: 'piece' })
  })

  it('takes the plural name from the recipe that gives one', () => {
    const items = buildShoppingItems([listed(carbonara, 2), listed(pancakes, 4)])

    expect(items.find((item) => item.name.en === 'egg')?.plural).toEqual(both('eggs', 'eieren'))
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

    expect(halfHad.find((item) => item.name.en === 'egg')?.have).toBe(false)
    expect(allHad.find((item) => item.name.en === 'egg')?.have).toBe(true)
  })

  it('adds up eggs and Parmigiano from every recipe in the book into one line each', () => {
    const items = buildShoppingItems(allRecipes(book).map((recipe) => listed(recipe, recipe.servings)))
    const linesNaming = (pattern: RegExp) => items.filter((item) => pattern.test(item.name.en))

    expect(linesNaming(/\begg/i)).toHaveLength(1)
    expect(linesNaming(/parmigiano|parmesan/i)).toHaveLength(1)
  })
})

describe('buildShoppingItems with drinks', () => {
  const negroni = makeDrink({
    slug: 'negroni',
    title: both('Negroni'),
    servings: 1,
    ingredients: [
      makeIngredient({ id: 'gin', name: both('gin'), quantity: { amount: 3, unit: 'cl' }, bottle: true }),
      makeIngredient({ id: 'syrup', name: both('sugar syrup', 'suikersiroop'), quantity: { amount: 1.5, unit: 'cl' } }),
      makeIngredient({ id: 'bitters', name: both('Angostura bitters'), quantity: { amount: 2, unit: 'dash' }, bottle: true }),
    ],
  })
  const gimlet = makeDrink({
    slug: 'gimlet',
    title: both('Gimlet'),
    servings: 1,
    ingredients: [
      makeIngredient({ id: 'gin', name: both('gin'), quantity: { amount: 5, unit: 'cl' }, bottle: true }),
      makeIngredient({ id: 'syrup', name: both('sugar syrup', 'suikersiroop'), quantity: { amount: 20, unit: 'ml' } }),
    ],
  })

  it('asks for one bottle of gin, however many drinks need it, without an amount', () => {
    const items = buildShoppingItems([listed(negroni, 4), listed(gimlet, 2)])

    expect(items.find((item) => item.name.en === 'gin')).toMatchObject({
      quantity: null,
      bottle: true,
      recipeTitles: [both('Negroni'), both('Gimlet')],
    })
  })

  it('adds centilitres and millilitres together', () => {
    const items = buildShoppingItems([listed(negroni, 4), listed(gimlet, 2)])

    // 4 × 1.5 cl and 2 × 20 ml.
    expect(items.find((item) => item.name.en === 'sugar syrup')?.quantity).toEqual({ amount: 100, unit: 'ml' })
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
