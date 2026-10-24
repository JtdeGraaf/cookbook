import { describe, expect, it } from 'vitest'
import { makeBook, makeFolder, makeIngredient, makeRecipe, makeStep } from '@/test/fixtures'
import {
  allRecipes,
  findRecipe,
  folderTrail,
  nearestFolder,
  ingredientsForStep,
  numberPages,
  parentPaths,
  recipeViewPath,
  resolveBookPath,
} from './book'

const eggs = makeRecipe({ slug: 'eggs', folderPath: 'breakfast' })
const toast = makeRecipe({ slug: 'toast', folderPath: 'breakfast' })
const stew = makeRecipe({ slug: 'stew', folderPath: 'mains' })
const carbonara = makeRecipe({
  slug: 'carbonara',
  folderPath: 'mains/pasta',
  cook: [makeStep(), makeStep(), makeStep()],
})
const pasta = makeFolder({ path: 'mains/pasta', recipes: [carbonara] })
const book = makeBook([
  makeFolder({ path: 'breakfast', recipes: [eggs, toast] }),
  makeFolder({ path: 'mains', recipes: [stew], folders: [pasta] }),
])

describe('numberPages', () => {
  it('numbers pages like a printed book: folder opener, then two pages per recipe, then sections', () => {
    expect(Object.fromEntries(numberPages(book))).toEqual({
      breakfast: 2,
      'breakfast/eggs': 3,
      'breakfast/toast': 5,
      mains: 7,
      'mains/stew': 8,
      'mains/pasta': 10,
      'mains/pasta/carbonara': 11,
    })
  })
})

describe('finding things in the book', () => {
  it('finds recipes at any depth', () => {
    expect(findRecipe(book, 'mains/pasta/carbonara')?.slug).toBe('carbonara')
    expect(findRecipe(book, 'breakfast/carbonara')).toBeNull()
  })

  it('lists every recipe in book order, sections after their folder', () => {
    expect(allRecipes(book).map((recipe) => recipe.path)).toEqual([
      'breakfast/eggs',
      'breakfast/toast',
      'mains/stew',
      'mains/pasta/carbonara',
    ])
  })

  it('gives the folders from the chapter down for a path bar', () => {
    expect(folderTrail(book, 'mains/pasta').map((folder) => folder.path)).toEqual(['mains', 'mains/pasta'])
  })

  it('finds the deepest folder that exists on the way to a missing page', () => {
    expect(nearestFolder(book, 'mains/pasta/lasagne/prep')?.path).toBe('mains/pasta')
    expect(nearestFolder(book, 'nothing/here')).toBeNull()
  })

  it('splits a path into its parents', () => {
    expect(parentPaths('mains/pasta/carbonara')).toEqual(['mains', 'mains/pasta', 'mains/pasta/carbonara'])
  })
})

describe('resolveBookPath', () => {
  it('finds a folder', () => {
    expect(resolveBookPath(book, 'mains/pasta')).toMatchObject({ kind: 'folder', folder: { path: 'mains/pasta' } })
  })

  it('finds a recipe overview', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara')).toMatchObject({ kind: 'recipe', view: { name: 'overview' } })
  })

  it('finds the prep, cooking steps and last page of a recipe', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara/prep')).toMatchObject({ view: { name: 'prep' } })
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/3')).toMatchObject({ view: { name: 'cook', stepNumber: 3 } })
    expect(resolveBookPath(book, 'mains/pasta/carbonara/done')).toMatchObject({ view: { name: 'done' } })
  })

  it('refuses steps that do not exist and unknown paths', () => {
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/4')).toBeNull()
    expect(resolveBookPath(book, 'mains/pasta/carbonara/cook/1.5')).toBeNull()
    expect(resolveBookPath(book, 'mains/prep')).toBeNull()
    expect(resolveBookPath(book, 'nothing/here')).toBeNull()
  })

  it('round-trips every recipe view address', () => {
    const views = [{ name: 'overview' }, { name: 'prep' }, { name: 'cook', stepNumber: 2 }, { name: 'done' }] as const
    for (const view of views) {
      expect(resolveBookPath(book, recipeViewPath(carbonara, view))).toEqual({ kind: 'recipe', recipe: carbonara, view })
    }
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
