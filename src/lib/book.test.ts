import { describe, expect, it } from 'vitest'
import { makeBook, makeChapter, makeIngredient, makeRecipe, makeStep } from '@/test/fixtures'
import { findRecipe, ingredientsForStep, numberPages } from './book'

const book = makeBook([
  makeChapter({ slug: 'breakfast', recipes: [makeRecipe({ slug: 'eggs' }), makeRecipe({ slug: 'toast' })] }),
  makeChapter({ slug: 'mains', recipes: [makeRecipe({ slug: 'stew' })] }),
])

describe('numberPages', () => {
  it('numbers pages like a printed book: chapter opener, then two pages per recipe', () => {
    expect(Object.fromEntries(numberPages(book))).toEqual({
      breakfast: 2,
      'breakfast/eggs': 3,
      'breakfast/toast': 5,
      mains: 7,
      'mains/stew': 8,
    })
  })
})

describe('findRecipe', () => {
  it('finds a recipe only inside its own chapter', () => {
    expect(findRecipe(book, 'mains', 'stew')?.slug).toBe('stew')
    expect(findRecipe(book, 'breakfast', 'stew')).toBeNull()
  })
})

describe('ingredientsForStep', () => {
  it('lists the ingredients a step uses, in the order of the step', () => {
    const recipe = makeRecipe({
      slug: 'soup',
      ingredients: [makeIngredient({ id: 'salt' }), makeIngredient({ id: 'leek' })],
    })

    const step = makeStep({ ingredientIds: ['leek', 'salt'] })

    expect(ingredientsForStep(recipe, step).map((ingredient) => ingredient.id)).toEqual(['leek', 'salt'])
  })
})
